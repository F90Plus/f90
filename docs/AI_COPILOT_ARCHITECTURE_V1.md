# F90+ — AI Copilot Architecture V1

> **Engine implemented** (`lib/copilot`, deterministic + mock-fed); the live-data layers
> (external APIs — L0/L1 ingest + L4 personalization) are **not yet connected** (Phase 2).
> This describes how the pieces fit. Companion docs:
> [VISION](AI_COPILOT_VISION.md) · [ENGINE](PREDICTION_ENGINE_V1.md) ·
> [DATA SOURCES](DATA_SOURCES_RESEARCH.md).

## Design constraints (from the brief)

- **$0 for V1** — no paid LLM, no paid data tier.
- **Real, current football data.**
- **Honest, explainable, virtual-only** (never gambling).
- Must fit the existing F90+ stack (Next.js 16 / TS / Tailwind / next-intl) and be
  **mobile-first** and **bilingual**.

## The one rule that shapes everything: **cache-first**

Free tiers are tight (API-Football = 100 req/day; football-data = 10 req/min). So
**F90+ never calls a third-party API from a user request.** Instead, scheduled jobs
pull data into **our own database** on a cadence; the app and the Copilot read only
from us. This makes the product fast, resilient to outages, and keeps us inside the
free limits no matter how many users we have.

## Layered architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  L5  PRESENTATION          Analyst card · pre-match brief · feed       │
│      (Next.js RSC + client islands, i18n ES/EN, Tailwind)              │
├──────────────────────────────────────────────────────────────────────┤
│  L4  PERSONALIZATION       filter/rank insights by user (fav teams,    │
│      (rules)               history, virtual-coin context)              │
├──────────────────────────────────────────────────────────────────────┤
│  L3  INSIGHT / NLG         signals → templated, i18n natural language  │
│      (templates, no LLM)   + recommendation + confidence               │
├──────────────────────────────────────────────────────────────────────┤
│  L2  PREDICTION ENGINE     signals → blended P(H/D/A) + confidence     │
│      (deterministic)       (see PREDICTION_ENGINE_V1.md)               │
├──────────────────────────────────────────────────────────────────────┤
│  L1  NORMALIZATION         heterogeneous source data → one F90+ model  │
│      + INTERNAL STATE      (Team, Fixture, Form, Stats, Odds, Elo…)    │
├──────────────────────────────────────────────────────────────────────┤
│  L0  INGESTION + CACHE     scheduled fetch → our DB (the ONLY place     │
│      (cron/worker)         that talks to third parties)                │
└──────────────────────────────────────────────────────────────────────┘
        ▲ football-data.org · API-Football · The Odds API · openfootball · TheSportsDB
```

### L0 — Ingestion & cache
- **Scheduled workers** (cadence per data type, to respect limits):
  - *Daily* (or on result): standings, schedule, injuries, external predictions.
  - *Pre-match window* (e.g. hourly near kickoff): odds, lineups.
  - *On-demand-but-cached*: H2H, season stats (fetch once, reuse).
- Writes **normalized snapshots** with `source`, `fetchedAt`, `ttl`.
- Budget-aware: a tiny scheduler that batches requests stays well under 100/day by
  caching aggressively and only refetching what's stale.
- **Where it runs (later):** a Supabase scheduled Edge Function / cron, or a small
  serverless cron on the host. F90+'s own DB = Supabase (planned). For V1 dev, even
  a committed JSON snapshot + a manual refresh script works.

### L1 — Normalization & internal state
- Map each source's schema → **one internal model**: `Team`, `Fixture`, `TeamForm`,
  `MatchStats`, `HeadToHead`, `MarketOdds`, `ExternalPrediction`,
  `CommunityConsensus`, plus our maintained **`EloRating`**.
- A **source-adapter per provider** (e.g. `footballDataAdapter`,
  `apiFootballAdapter`, `oddsApiAdapter`) implements a shared interface — so swapping
  or adding a provider never touches the engine. (Mirrors the existing pattern of
  isolating data behind typed interfaces in `src/data/`.)
- Every entity carries provenance + freshness for the engine to weigh.

### L2 — Prediction engine
- Pure, deterministic functions: cached data → signals → blended `{pHome,pDraw,pAway}`
  + confidence. No I/O, no randomness → trivially testable. Full spec in
  [PREDICTION_ENGINE_V1.md](PREDICTION_ENGINE_V1.md).

### L3 — Insight / NLG (templated, no LLM)
- Picks the top drivers and renders them through **i18n message templates** with
  threshold logic → 2–3 honest bullets + a recommendation + confidence band.
- All strings live in `locales/{es,en}.json` (the system already in place) → the
  Analyst is bilingual for free, copy is editable without code.

### L4 — Personalization (rules)
- Rank/filter which insights a user sees: their **favourite teams**, **upcoming
  predictions**, **history** (e.g. "you tend to back underdogs"), and **virtual-coin**
  situation (suggest stake sizing inside the free economy).
- Pure rules over the same signals — no per-user model needed in V1.

### L5 — Presentation
- **Analyst card** per match (lean, confidence, rationale, signal breakdown bars),
  **pre-match brief**, and a **personalized insight feed**.
- Built as a new `features/copilot/` module reusing existing primitives (`Card`,
  `Badge`, probability bars) and the night-stadium design system. RSC by default;
  client islands only for interactivity.

## Data flow (request time vs background)

```
BACKGROUND (scheduled):  third-party APIs → L0 ingest → L1 normalize → store snapshots
                                                              │
                                                       (optional) precompute
                                                       L2 signals per fixture
REQUEST TIME (user):     user opens match → read cached snapshot/precomputed signals
                         → L2 (if not precomputed) → L3 insight → L4 personalize → L5 render
                         ⇒ ZERO third-party calls, fast, within free limits
```

For the heaviest path we can **precompute** each fixture's signals/insight after
ingestion, so a user request is a pure DB read + render.

## Proposed repo placement (when built — not now)

```
apps/web/src/
├── features/copilot/         # L5 UI (AnalystCard, MatchBrief, InsightFeed)
├── lib/copilot/
│   ├── sources/              # L0/L1 adapters (footballData, apiFootball, oddsApi…)
│   ├── model/                # internal types (Team, Fixture, Signals, Elo…)
│   ├── engine/               # L2 signals + blend + confidence (pure, unit-tested)
│   └── insights/             # L3 templated NLG (keys → locales/)
└── locales/{es,en}.json      # + copilot.* insight templates
# scheduling (L0) lives in a Supabase scheduled function / cron when DB lands
```

## Cost & limits posture

| Concern | V1 approach |
| --- | --- |
| API rate limits | Cache-first + scheduled fetch + precompute → effectively unlimited reads |
| LLM cost | None — deterministic engine |
| DB | Supabase free tier (planned) holds normalized snapshots |
| Live data | Near-real-time via polling in the pre-match window; honest about freshness |
| Scaling users | Reads hit our DB only → user count doesn't touch third-party quotas |

## Testing & trust
- **Engine** (L2): pure functions → deterministic unit tests + backtests
  (Brier/log-loss vs historical) + calibration checks.
- **Adapters** (L0/L1): contract tests against recorded fixtures of each API's JSON.
- **Insights** (L3): snapshot tests in ES + EN; assert no "guaranteed" language.
- **Guardrails**: automated check that every insight carries a confidence and a
  non-gambling disclaimer.

## Where AI/LLM plugs in later (without rework)
- **L3.5 — LLM narration/chat (RAG):** an optional layer that reads L1 data + L2
  signals and lets users *converse* with the Analyst. The engine stays the source of
  truth; the LLM never invents numbers. Swappable provider (Claude/OpenAI/local).
- **L2 — ML upgrade:** replace heuristic weights with a trained model (Poisson/
  Dixon-Coles, gradient boosting) on the free historical archives.
- **L0 — premium data:** add a paid adapter (real-time xG, sub-15s scores) behind
  the same interface — no change above L1.

## Build phases (when greenlit — still no code today)
1. **Skeleton + 1 source:** football-data.org adapter → Elo + Form + Quality engine
   → one Analyst card, ES/EN. (Proves the spine, fully free.)
2. **Market signal:** add The Odds API (de-vig) → biggest accuracy gain.
3. **Rich signals:** API-Football (stats/H2H/injuries/predictions) + F90+ community
   consensus.
4. **Personalization + feed** (needs auth/profiles from the main roadmap).
5. **Backtest + calibrate**, then expose confidence publicly.
6. *(Later)* LLM narration/chat layer + ML model.
