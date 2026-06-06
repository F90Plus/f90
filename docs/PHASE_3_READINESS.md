# F90+ — Phase 3 Readiness Assessment

> **Phase 3 = Economy: Market + Fantasy XI** (spends the Tokens the predict loop generates).
> This is the **readiness gate** — what blocks it, what it depends on, and the founder decisions
> required before planning starts. **Do not start Phase 3 from this doc.**
> Compiled 2026-06-06 (D-058 closeout). Feature backlog: [PHASE_3_CANDIDATES.md](PHASE_3_CANDIDATES.md).

## Status: foundation READY; one brand decision is the real gate

Phase 1 (identity + server-authoritative economy) and Phase 2 (the predict → settle loop, **LIVE
+ verified**) are done, deployed and verified (D-048 / D-058). The economy is generic by design
(D-034), so markets / fantasy plug in with **no Identity reshape**. **There is no technical blocker
to *planning* Phase 3.** The gate is a **brand / economy decision** (free staking, §D) plus the
"don't open new fronts until the loop is live + verified" rule (D-042) — and the loop is now live
and verified.

## A. Blockers (hard — must resolve before the staking-dependent Phase-3 *build*)
1. **Free-staking brand ratification (founder).** See §D. Until decided, the Phase-3 economic
   model has one open variable that changes schema, payout, settlement and positioning. *Planning
   can begin and most of Phase 3 can be built treating predictions as free-to-play; the
   staking-dependent parts cannot be built until this is ratified.*

## B. Dependencies (already satisfied)
- ✅ **Server-authoritative economy:** wallet + append-only `coin_ledger` / `score_ledger` +
  `award_*` (Phase 1). Generic `(kind, ref_type, ref_id)` absorbs market trades / player buys /
  fantasy rewards with no reshape (D-034).
- ✅ **Live predict loop** generating points + Tokens (Phase 2 / D-058) — the economy Phase 3 spends.
- ✅ **Reserved route namespaces** `/markets/*`, `/players/[slug]`, `/fantasy/*`, `/nations/[code]/*` (D-038).
- ✅ **Working quality gates** incl. lint (D-057) for a clean build surface.
- ◻️ **Player data adapter** (football-data / api-football) — env-gated scaffolding exists
  (D-010/D-014); wire it deliberately when player cards/stats are built (not a blocker to start).

## C. Founder decisions required (before / at Phase-3 kickoff)
1. **Free staking** — the big one (§D).
2. **Market model** — Polymarket-style AMM vs a simple order/price model (D-034 left this "TBD").
3. **Fantasy v1 scope** — full squad + XI + market, or a thin first slice (ECOSYSTEM_VISION O-3).
4. **Founding Squad** ("Pack Fundación", D-040) — ship a starter squad at onboarding, or defer.
5. **Player likeness** — own-IP cards are confirmed (D-025); finalise the visual treatment (O-4).

## D. Free staking / token wagering — sportsbook-drift assessment
**The concept:** let a user put a *variable* amount of Tokens F90 on a prediction (vs today's
free-to-predict, earn-on-correct model).

**Why it risks drifting toward sportsbook positioning:**
- "Choose how much to risk" is the **core gesture of a sportsbook** — it reframes a prediction as
  a **wager**.
- It collides with **D-037** (probability-not-odds; the no-bet / no-stake vocabulary + visual law)
  and the standing **free / no-betting / no-casino** invariant.
- It changes the **free-to-predict model** (D-051) and introduces real loss, shifting the emotional
  frame from "prove you're right" to "gamble your balance".
- Mechanically it is a new economic engine: variable amount → balance deduction, payout calc,
  settlement, anti-cheat, and responsible-play surfaces.

**The pull (why it's tempting):** it raises felt commitment / skin-in-the-game — but **D-054 already
delivered that feeling without a wager** (reward visible pre-pick, what's-at-stake = record +
ranking, difficulty↔reward rule). The user value it chases is **largely already met**.

**Recommendation (studio view, non-binding):** **do not adopt free/variable staking as a
sportsbook-style risk gesture.** If "spend Tokens to participate" is ever wanted, frame it as a
**conviction / allocation mechanic inside the no-betting language** (probability, not odds; F90 as
a game resource, not a stake) with responsible-play design — and only after **explicit founder
brand ratification**. This is a **brand-identity decision, not an engineering one**.

**Status:** OPEN — deferred from Phase 2 (D-054); captured as PHASE_3_CANDIDATES **C3-7**. Phase 3
(market + fantasy) can be planned and largely built **without** resolving this, treating
predictions as free-to-play; staking is an isolated, gated sub-decision.

## E. Recommended Phase-3 entry sequence (when greenlit)
1. Founder ratifies §D (free staking: yes / no / reframed) and picks the market model (§C).
2. Design pass / `/gsd-discuss-phase` on the **player market first** (it creates the assets fantasy
   spends), keeping staking out of scope unless ratified.
3. Build market → fantasy / XI on the existing generic economy; wire the player data adapter.
4. The **prediction-card UX-clarity pass** (PRODUCT_OBSERVATIONS OBS-001) can run **in parallel** —
   it is independent of the economy and improves the live loop now.
