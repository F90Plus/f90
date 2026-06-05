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

## 9. Founding Squad / "Pack Fundación F90" (cold-start ownership)

**The idea (founder, forward):** a new user shouldn't land on a full wallet and an empty team. On
first entry they should already **own a starter squad** — a starting XI + bench + a small player
portfolio — *alongside* the 20,026 Tokens F90 (D-039). Something to **manage** from minute one:
players, a lineup, decisions, ownership — not just a balance. Hard constraints: **no random
advantage, equal starting net worth for everyone, don't break the economy.**

**1. Does it add value?** Strongly. The "empty wallet, nothing to do" cold-start is the classic
retention killer for economy/fantasy products. A starter squad turns the end of onboarding from
"here's your balance" into "here's your team — set your XI": instant ownership, a first decision, a
reason to return. Proven pattern (FUT starter packs, Comunio's opening budget→squad). The fairness
rule keeps it non-exploitative.

**2. Best model?** The founder's **B+C** instinct is right. **Recommendation: "Pack Fundación F90" =
value-equivalent (B) + a light favourite-nation flavour (C), under a hard equal-net-worth rule.**
- Every user starts with the **same founding net worth** = 20,026 Tokens F90 (cash) **+ a starter
  squad of identical total player value** for all.
- The squad is a **balanced, valid template** (positions to field a legal XI + a few bench slots) —
  not a random grab-bag.
- A **few** slots are **flavoured** by the favourite nation (identity), but each flavoured player is
  swapped for a **value-equivalent** one (same price tier) — it changes *who* you start with, never
  *how strong*. Pure A (identical) is fair but characterless; pure C (nation-based) risks favouritism
  + value imbalance (strong nations' players cost more). **B+C with value-normalisation** is the sweet
  spot the founder intuited — more emotional identity, zero competitive edge.

**3. Economic risks (and guardrails):**
- **Equal start, divergent outcomes is the invariant.** Everyone begins with identical net worth;
  player values then move with the real tournament + each user's trades. Diverging *outcomes* is
  gameplay, not an unfair *start*.
- **Flavour must not bias upside.** If the nation slots are "your nation's stars" and home/popular
  nations rise faster, that's a subtle starting edge. Guardrail: keep flavour to a couple of identity
  slots, value-normalised, and **not necessarily the nation's best risers** — cosmetic identity, not a
  hot pick (O-5).
- **Wealth injection / market calibration.** Each signup mints a fixed value bundle → the market
  engine (AMM vs model price, O-2) must be calibrated for this constant inflow. Identical for all, so
  fairness holds; it's a supply-tuning concern, not a fairness one.
- **Sybil / multi-account harvesting.** A valuable pack invites fake accounts. Mitigant: value is
  **virtual, non-cashable, locked to the game**, behind the email/OAuth gate. Low risk.

**4. Onboarding impact:** Strongly positive **if kept lean**. Keep the onboarding *form* (T5) minimal
(handle + nation); grant the squad **server-side** on completion (like the coin bonus — an RPC /
trigger extension), and **reveal** it as a premium *"Your Founding Squad"* moment on `/home`. Don't
bloat the form with squad-building; the first XI tweak is an optional follow-on, never a blocker.

**5. Relation to D-034:** Perfect fit, **no new primitives**. SCHEMA_V1 already designs `players`,
`squads`, `squad_players`, `lineups`. The starter squad = a server-authoritative provisioning of
`squad_players` + a default `lineup` at signup, alongside the wallet bonus, with a ledger entry (a new
`kind` like `founding_grant`, or reuse) recording it. The generic economy (D-034) absorbs it.

**6. Fit with the Fantasy vertical:** It is the **on-ramp** to Fantasy. The starter squad *is* the
user's first fantasy squad — an XI + bench to field, value to watch, players to trade, from minute
one, instead of "go buy 15 players first". It accelerates Fantasy adoption and keeps the vertical
populated on day one.

**7. Official decision?** **Yes** — recommend it as an **official design pillar of the Fantasy/economy
phase** (Phase 3 / the reserved 3.5), recorded now (**D-040**), implemented when `players` + the market
exist. It shapes the player-grant mechanism + market calibration, so design it *with* the engine, not
bolted on.

**Recommendation:** adopt **"Pack Fundación F90"** — equal founding net worth for all (20,026 Tokens
F90 + a value-equal starter squad), a balanced valid-XI+bench template, light value-normalised nation
flavour, granted server-side at onboarding completion and revealed as a premium moment. **Build with
Phase 3** (needs players + the market). Not on Phase 1's path.

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
- **O-5 Founding Squad flavour:** how the favourite-nation flavour stays cosmetic identity (value-
  normalised, not the nation's best risers) so it never becomes a starting edge (§9).
- **O-6 Founding net worth:** the cash-vs-squad-value split, the reveal UX ("Your Founding Squad"
  moment), and the grant ledger `kind` (`founding_grant` vs reuse) (§9, D-040).

## Bottom line

This is the right long-term direction and a faithful expansion of D-034 — adopt it as a **recognised
milestone cluster ("Phase 3.5 — Entity Layer & Fantasy")**, **reserve the architecture now (done,
above)**, ship the **discovery section + read-only nation hubs as early wins**, and let player
profiles + Fantasy + trading light up with Phase 3's engine. Build *toward* this from T6; don't build
*it* yet.
