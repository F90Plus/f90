# F90+ — Ecosystem Vision (forward design — NOT built)

> **Status:** strategic analysis + **reserved architecture**. Founder-requested 2026-06-04.
> **Nothing here is implemented.** Decision record: [DECISIONS.md](DECISIONS.md) **D-038**.
> Builds on the expanded vision (D-034), the loop-ordered roadmap ([ROADMAP.md](ROADMAP.md),
> D-027/D-028/D-029) and the prediction-market identity lock (D-037).
> Product language = **English** (URLs included, D-003); the ES UI localizes labels, not routes.

This doc answers the founder's eight questions and **reserves the routes + information
architecture** so everything built from here (T6 onward) grows *toward* it and nothing collides.

---

## 0. What the founder asked for

1. **Nation hubs** — every nation gets a hub (e.g. `/nations/spain`) with internal tabs:
   Overview · Players · Stats · Matches · Markets · Predictions.
2. **Player profiles** — `/players/lamine-yamal` as a first-class entity page.
3. **Fantasy as a visible top-level vertical** — nav becomes `World Cup · Markets · Fantasy · Rankings`.
   Not a Comunio clone: build squad, buy/sell, manage budget, starting XI + bench, **live player
   value**, compete, **coexisting with the prediction markets**.
4. **A "What is F90+?" discovery section** on the landing that shows the whole loop
   (Predict → earn Tokens F90 → enter markets → buy players → build your XI → compete), maybe a
   conceptual demo/simulator.

---

## 1. Fit with D-034 — very strong (this is D-034 made *navigable*)

D-034 already commits to: Polymarket-style markets, a persistent wallet, player buy/sell with
dynamic prices, squad XI + bench + team value, social rankings + private leagues, and an
asset portfolio — **all on one generic economy** (`coin_ledger.kind` / `(ref_type, ref_id)` +
`award_*`). The forward tables (`players`, `squads`, `lineups`, `leagues`) are designed in
[SCHEMA_V1.md](SCHEMA_V1.md) and slated for **Phase 3** ([ROADMAP.md](ROADMAP.md)).

So this vision adds **no new economic primitives**. It adds three things on top of D-034:

- an **entity layer** (nation hubs + player profiles) that makes the economy *explorable*;
- **Fantasy promoted to a named destination** (not just "XI inside Phase 3");
- a **discovery surface** that explains the whole loop.

**Verdict:** 100% coherent with D-034 — it is the *presentation + IA layer* the economy was always
going to need. Nothing here reshapes Identity, the wallet, or the ledgers.

## 2. Should it become an official phase? — Yes, but decomposed and **sequenced after the engine**

You cannot show a player's market price + fantasy value before the engine that *produces* them
exists. The dependency order is hard:

```
Phase 2 (predictions → economy)  ─┐
Phase 3 (players + market + XI)  ─┴─►  entity layer (nation hubs / player profiles / Fantasy vertical)
```

Recommendation — split by data-readiness, not by screen:

| Piece | Earliest sensible phase | Why |
| --- | --- | --- |
| **"What is F90+?" discovery section** | **soon** (a landing pass, pre-engine) | pure explainer copy + visuals; de-risks "what is this?" as the product widens |
| **Nation hubs (read-only tabs:** Overview/Players/Matches/Stats**)** | **post-Phase 1**, grows through 2–3 | mostly a **read-model over existing openfootball data**; a strong early win |
| **Nation hub Markets/Predictions tabs** | when Phase 2/3 light them up | filtered views of the global market/prediction surfaces |
| **Player profiles** | **Phase 3** | depend on `players` + the price engine |
| **Fantasy vertical** (squad/budget/XI/bench/trade) | **Phase 3** | the economy's spend side |

So: **reserve the architecture now (this doc), ship the discovery section + read-only nation hubs as
early wins, and let the economic tabs/pages light up as Phases 2–3 land.** Treat it as a recognised
milestone cluster ("**Phase 3.5 — The Entity Layer & Fantasy**") rather than a single big-bang phase.

## 3. Recommended architecture — one entity, many surfaces

The nation hub and the player profile are **read-models that compose existing tables**, never new
sources of truth. The **player is the shared primitive** across portfolio, trading, Fantasy and the
ideal XI — everything references `players.id`.

```
/[locale]/nations/[code]                 → Overview (default tab)
/[locale]/nations/[code]/players         → squad (own-IP cards, D-025)
/[locale]/nations/[code]/stats           → model strengths + real stats (when the data adapter is on)
/[locale]/nations/[code]/matches         → fixtures/results (openfootball)
/[locale]/nations/[code]/markets         → that nation's prediction markets (probability %, D-037)
/[locale]/nations/[code]/predictions     → community predictions for the nation
/[locale]/players/[slug]                 → player profile (price, form, owners, fantasy value)
```

- **Slugs are English** (`/nations/spain`, `/players/lamine-yamal`) — the product-English invariant
  (D-003). The ES UI shows "Selecciones" / "Jugador" as **labels**, not as URL segments. (Open
  question O-1: code vs name slug for nations — recommend a stable English slug with the `countries`
  code as the canonical key.)
- **Tabs = nested route segments** → deep-linkable, SEO-friendly, dynamic per-tab OG cards.
- **Cache-first read-models** (like `lib/football/tournament.ts`): 48 nations × tabs + N players is a
  lot of routes — ISR/`revalidate` + a per-entity cache, never N live DB hits per render.
- Reuse, don't duplicate: `NationFlag`, the Analyst, the market ticker, the model — the entity pages
  are *compositions* of existing primitives.

## 4. Recommended navigation / IA

Evolve the top bar from today's `Matches · Analyst · How it works · Leaderboard` toward the
founder's four pillars as they ship:

```
World Cup   ▸ nation hubs, groups, bracket, fixtures (today's Tournament Center lives here)
Markets     ▸ the prediction-market surfaces (the ticker is the teaser of this)
Fantasy     ▸ your squad, budget, XI + bench, the player market
Rankings    ▸ global / by-country / leagues
                (the Analyst is woven across all four, never a tab of its own — D-005)
```

Plus a **global command/search** (⌘K) to jump to any nation or player — essential once there are
48 hubs + hundreds of players. Ship pillars **one at a time**; don't expose an empty tab.

## 5. Markets ↔ Fantasy ↔ buy/sell — one economy, three lenses on one price

This is the crux and the differentiator. **There is one wallet (Tokens F90), one points total, and
one market price per player.** The three surfaces are three views of the same numbers:

- **Markets** discover a player's **value** (a probability/price, never odds — D-037) from collective
  intelligence.
- **Buy/sell (trading)** = transacting that player for Tokens F90 → P&L in the wallet
  (`coin_ledger.kind` = `player_purchase` / `player_sale` / `market_trade`).
- **Fantasy** = your squad is a **portfolio of owned players**; their market value moves → your team
  value moves; you field an XI per matchday → **real-performance points** (`score_ledger`).

So **fantasy value and trading P&L are literally the same price**, and **predictions** (Phase 2) are
what *fund* the whole thing. One character, one economy (D-034). A nation hub's Markets/Predictions
tabs are just that global economy **filtered to the nation**.

## 6. Fantasy — the differential value (why this isn't Comunio/FPL)

Comunio/FPL: largely static prices, no live price discovery, no prediction-market layer, no trading
against a market of other managers in real time.

**F90+'s edge = a fantasy game whose economy is a live prediction market.** Your squad is a portfolio
priced by the same collective-intelligence probabilities the ticker shows; you trade in/out as the
tournament unfolds; you earn from **three** loops at once — correct **predictions**, smart **trading**,
and real **performance** — all in virtual Tokens F90. "Manage a live-priced portfolio of World Cup
players, against a market and against your friends." That fusion is novel and defensible, and it
reuses the prediction engine instead of bolting on a second system.

## 7. Complexity risks (and the guardrails)

| Risk | Guardrail |
| --- | --- |
| **Player data dependency** (rosters + per-match stats) — the hard external one | Stand up the `football-data`/`api-football` adapter *before* player pages/Fantasy; `names+stats=facts`, representation stays **own-IP** (D-025). No licensed likenesses. |
| **Premature surface-building** (empty shells before the engine) | Sequence by data-readiness (§2): read-only first, economic tabs as they light up. |
| **Scope explosion / nav overload** (4 verticals × per-entity tabs) | Progressive disclosure; one pillar at a time; the *one-entity-many-surfaces* read-model so logic isn't duplicated. |
| **"Looks like gambling/real money"** | Probability-not-odds is locked (D-037); trading/value are **Tokens F90**, never `$`; keep the virtual/free/no-gambling framing everywhere. |
| **Engine before UI** | Design the price/settlement model (AMM vs simple — TBD, D-034) before any trading UI. |
| **Perf/SEO blow-up** (hundreds of routes) | Cache-first read-models + ISR + dynamic OG; reuse the tournament's caching pattern. |

## 8. Communicating the whole vision — "What is F90+?"

As the product spans four verticals, the landing must *teach the loop*. Recommended, phased:

1. **Soon (low-risk):** a premium **"What is F90+?"** section (post-hero/post-ticker) — a visual
   stepper of the loop: **Predict → earn Tokens F90 → enter markets → buy players → build your XI →
   compete.** Static, on-brand, bilingual. High clarity, no engine needed.
2. **Later:** a **conceptual animated demo** ("sizzle") looping the flow — non-interactive.
3. **Much later (high effort):** an **interactive sandbox/simulator** of a fake matchday.

The market ticker (D-036, shipped) is already step 1 of "show, don't tell". The discovery section is
the natural next storytelling beat and is **safe to build before the economy engine**.

---

## Reserved routes & namespaces (so nothing collides)

Claim these now; T6+ must not reuse them for anything else:

```
/[locale]/nations/[code]/(overview|players|stats|matches|markets|predictions)   — nation hubs
/[locale]/players/[slug]                                                         — player profiles
/[locale]/markets/...                                                            — prediction markets
/[locale]/fantasy/...                                                            — Fantasy vertical
/[locale]/u/[username]                                                           — user profile (T7, existing plan)
/[locale]/(app)/...                                                              — auth-gated app group (T6)
```

## Open questions for the founder (not blocking; for when these phases start)

- **O-1 Nation slug:** English name slug (`/nations/spain`) vs code (`/nations/esp`)? (Recommend name
  slug, `countries.code` as the canonical key + redirect.)
- **O-2 Market model:** AMM (Polymarket-style continuous pricing) vs a simpler model-driven price?
  Drives how trading P&L + fantasy value are computed (D-034 left this TBD).
- **O-3 Fantasy scope v1:** whole-tournament squad vs per-matchday lineups vs both?
- **O-4 Player likeness:** confirm the own-IP visual system scales to hundreds of players (D-025).

## Bottom line

This is the right long-term direction and a faithful expansion of D-034 — adopt it as a **recognised
milestone cluster ("Phase 3.5 — Entity Layer & Fantasy")**, **reserve the architecture now (done,
above)**, ship the **discovery section + read-only nation hubs as early wins**, and let player
profiles + Fantasy + trading light up with Phase 3's engine. Build *toward* this from T6; don't build
*it* yet.
