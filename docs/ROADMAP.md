# F90+ — Roadmap

A phased path from foundation to a live World Cup product, **ordered by the loop**: each
phase produces the input the next one needs. The World Cup opener (11 Jun 2026) is the
natural pull date for the core loop. Dates are intentionally omitted.

> Legend: ✅ done · 🔜 next · ⏳ planned
> The expanded product (predictions + fantasy + ideal XI as one daily loop) and its
> ordering are ratified in [DECISIONS.md](DECISIONS.md) D-027/D-028/D-029. Vision:
> [PROJECT_VISION.md](PROJECT_VISION.md) · [EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md).

---

## ✅ Phase 0 — Foundation *(closed)*

Visual identity, design system, i18n, real data, and a cinematic homepage — production-ready.

- [x] pnpm monorepo, TypeScript strict, Tailwind v4, Framer Motion, next-intl
- [x] Design tokens + component system (the F90+ night-stadium look)
- [x] Bilingual ES/EN (routing, middleware, switcher), zero hardcoded copy
- [x] **Real WC2026 fixtures** via openfootball (zero-key, cache-first, graceful fallback)
- [x] **Deterministic Copilot ("The Analyst")** — pure, no LLM
- [x] **Real 3D World Cup globe hero** (react-globe.gl / three) — gold hosts / green
      qualified from real data (D-022/D-023), perf-hardened + reduced-motion safe
- [x] Real cinematic imagery, branding (gold-trophy logo + derived icons), SEO/metadata
- [x] Documentation + decision log

**Exit:** `pnpm dev` renders a premium, responsive, bilingual homepage with a living globe.

---

## ✅ Phase 0.5 — Public launch *(done — 2026-06-04, live at https://f90.xyz)*

Foundation shipped to production. Steps + rollback in [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md).

- [x] Official GitHub repo (isolated): **`F90Plus/f90`**, branch `main`, synced
- [x] Vercel project (isolated) — root `apps/web`, production + preview pipeline
- [x] Connect `f90.xyz` (DNS + **SSL active**) + `NEXT_PUBLIC_APP_URL`
- [x] First production deploy — validated (hero · globe · countdown · desktop · mobile · ES/EN)

---

## ✅ Phase 0.6 — Tournament Center *(done — 2026-06-04)*

The premium, living World Cup band after the Hero — makes F90+ feel alive **before** users
arrive, in the tournament's peak-attention window (opener 11 Jun). One cache-first openfootball
read fans out into the canonical tournament spine later phases attach to. Decision: D-032.

- [x] **The field is set** — count-up stats (48 nations · 12 groups · 104 matches · 16 cities)
- [x] **Qualified Nations** — confederation filter + real vendored flags (code-token fallback)
- [x] **The Draw** — 12 groups + the Analyst's "group of the death" (from model strengths)
- [x] **The Road** — full 2026 bracket R32→Final (desktop wallchart / mobile round-navigator)
- [x] **Key Matches** — marquee Analyst read + fixtures grid (supersedes MatchesRail)
- [x] Analyst woven through groups/bracket/key-matches; ES/EN; mobile-first; data-real (D-023)
- [x] Data layer TDD'd (Vitest, 34 tests); build + typecheck green; validated desktop + mobile

**Exit:** the home carries a living, premium Tournament Center built from real openfootball data.

---

## ✅ Phase 1 — Identity & Accounts  *(CLOSED + MERGED + DEPLOYED — 2026-06-05; T1–T11)*

Let people *be someone* on F90+ — and lay the **server-authoritative economy** the whole loop runs on.
**Live state + the full checkpoint:** [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md) (contracts:
[PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) · [SCHEMA_V1.md](SCHEMA_V1.md) ·
[PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md)).

- [x] Isolated Supabase + `@supabase/ssr`; middleware composed with next-intl *(T1)*
- [x] Auth: magic-link + Google *(T4; Apple deferred)* + **onboarding** *(T5)*
- [x] Public **profile** (`/u/[username]`, dynamic OG, own-IP avatar) *(T7)* + **settings/30-day cooldown** *(T8)*
- [x] **Wallet + append-only ledgers** + economy functions — latent; welcome bonus **20,026 Tokens F90** *(T2; D-039)*
- [x] Protected `(app)` group + auth-aware header + `/home` *(T6)*  ·  [x] **Rankings teaser** (real `global_rankings`, honest empty-state) *(T9; D-043)*
- [x] DB schema v1: `profiles`, `wallets`, `coin_ledger`, `score_ledger`, `countries`, `global_rankings` *(T2/T3)*
- **✅ CLOSED + MERGED + DEPLOYED (D-045/D-046):** T1–T11 DoD-passed · PR #2 merged → `main`=`7584f65` · `vercel --prod` → `www.f90.xyz`. ⚠️ **Production account routes need the 2 public Supabase env vars added to Vercel + redeploy (founder, D-046)**; then D-035 items for sign-in. *(T9 D-043 · T10 D-044 · T11 D-045 · ship D-046.)*

## ⏳ Phase 2 — Predictions Core & Scoring  *(generates the economy)*

The heart and the daily habit: make a call before kickoff; correct calls **earn points +
coins**.

- [ ] `fixtures` (synced from openfootball, stable IDs) + `predictions` schema
- [ ] Predict flow (winner / scoreline / brackets / moments), optimistic UI, **lock at kickoff**
- [ ] **Difficulty-honest scoring** via `model.ts` (underdog correct = more points)
- [ ] Server-side settlement → `award_points` + `award_coins`; "my predictions" view

## ⏳ Phase 3 — Economy: Market + Fantasy XI  *(spends the economy)*

Turn earned coins into a team.

- [ ] `players` (own-IP cards, D-025) + dynamic **market** (Comunio-style prices)
- [ ] Buy/sell with coins (`coin_ledger`); `squads` + `squad_players`
- [ ] **Ideal XI** per matchday (`lineups`, captain) with server-side formation rules
- [ ] **Real-performance points** (`player_match_scores`, FPL-style) feed profile points
- [ ] Player data adapter (football-data / api-football; `names+stats=facts`)

## ⏳ Phase 3.5 — Entity Layer & Fantasy  *(reserved — D-038)*

The presentation/IA layer that makes D-034's economy explorable. **Full design + the 8-point
analysis: [ECOSYSTEM_VISION.md](ECOSYSTEM_VISION.md).** Sequenced *after* the Phase 2/3 engine
(entity pages are read-models over that data). Routes reserved now; build *toward* it from T6.

- [ ] **Nation hubs** `/nations/[code]` (Overview/Players/Stats/Matches/Markets/Predictions) —
      read-only tabs can land early over openfootball; economic tabs light up with Phase 2/3
- [ ] **Player profiles** `/players/[slug]` — the shared primitive (price · portfolio · Fantasy · XI)
- [ ] **Fantasy** promoted to a named top-level vertical (squad · budget · XI + bench · live value)
- [ ] **"What is F90+?"** landing discovery section (early win — explains the loop, pre-engine)
- [ ] Top-nav evolves to **World Cup · Markets · Fantasy · Rankings** + ⌘K entity search

## ⏳ Phase 4 — Rankings, Leagues & Reputation  *(the viral loop)*

Turn scoring into competition.

- [ ] Real global + by-country + time-boxed rankings (snapshots at scale)
- [ ] **Private leagues** + invites (the core growth loop), friend feeds, light trash-talk
- [ ] Reputation (cross-pillar) + streaks on the profile

## ⏳ Phase 5 — Narrative / The Analyst (live)

The editorial soul over everything — built on the existing deterministic engine.

- [ ] Per-match takes + "predict against the pundit"
- [ ] Live tournament narrative ("Croatia is surviving") from real signals (no LLM, D-005)

## ⏳ Phase 6 — Momentum / Heat on the globe

The planet's living pulse (World × Time).

- [ ] Hottest nations / trending players / global leans, from real activity, on the globe

## ⏳ Phase 7 — Live tracking · shareable cards · notifications · PWA

- [ ] Live scores/state + live "make your call" windows
- [ ] Deep-linked shareable cards (prediction/result/rank) + dynamic per-entity OG
- [ ] Notifications (web push → mobile) with responsible-play framing
- [ ] Performance budget + Core Web Vitals + PWA/install polish

---

## Cross-cutting backlog

- [ ] Localized country names (codes already i18n-neutral; `countries` carries name_en/name_es)
- [ ] Typed i18n messages (next-intl augmentation)
- [ ] Testing — Vitest **wired** (data-layer unit tests, Phase 0.6 / D-032); Playwright as features land
- [ ] LICENSE — choose and add before any public, open release
- [ ] Accessibility pass (focus rings, skip link — flagged in the audit)
- [ ] More languages — architecture supports it; add on demand

## Non-goals (kept off the roadmap on purpose)

- Real-money betting, payouts, or any gambling mechanic. Probabilities are signal, never a wager.
- Pay-to-win — monetization never buys predictive edge.
- Arcade FUT/Panini/EA clones — player representation is original F90+ IP (D-025).
- A heavyweight microservice/Turborepo setup before the product needs it.
- Any AI/editor lock-in — standard, portable tooling only (D-016).
