# F90+ — Product Observations Log

A running log of product-design observations captured during operation, for future work.
Each entry is **documentation only — not a commitment, not implemented here.** An entry
graduates into a phase plan (or into [PHASE_3_CANDIDATES.md](PHASE_3_CANDIDATES.md)) when the
founder prioritises it.

> Status legend: 🔭 observed (not started) · 🧪 exploring · ✅ addressed

---

## OBS-001 — Prediction-card UX clarity: the core action isn't dominant enough 🔭

**Logged:** 2026-06-06 · **Area:** the predict surface (`features/predictions/predict-card.tsx`
+ `predict-positions.tsx` → `OutcomeButton`) · **Priority signal:** high (the daily core loop,
now live) · **Status:** observed — **do not implement** (this is a future product-design initiative).

### Problem statement
The prediction card does not communicate its core action — *make a call on this match* —
clearly or quickly enough. A first-time or scanning user may not immediately grasp **what to do**,
or that the three outcomes are the primary, tappable decision.

### Current perception (symptoms)
- Users may not immediately understand the action to take on the card.
- Outcome selection (home / draw / away) is **not visually dominant enough** — it competes with
  the Analyst read, the reward chips, the probability %, the market-depth fill and context lines.
- The interaction is **less immediately intuitive than Polymarket** (where the position and its
  consequence are the unmistakable focal point).
- The card is **less immediately scannable than a modern sportsbook card** (where the pickable
  options are the loudest, most obvious element).

### Why it matters (rationale)
- Phase 2 moved the product's primary concern **from infrastructure to participation**: the loop
  is live, so the bottleneck to value is now *how easily a user understands and completes a
  prediction*, not whether the backend works.
- The predict card is the **single most-repeated interaction** in the product (the daily habit,
  D-029). Small clarity gains compound across every fixture and every matchday.
- It is the conversion moment from "browsing the World Cup" to "playing F90+".

### Hard constraint (binding on any future exploration)
This is a **clarity / scannability** problem — **not** a mandate to adopt sportsbook *mechanics*.
Borrow the *legibility* of Polymarket / sportsbook cards (a clear focal action, an instant scan),
**never** their wagering framing. **D-037 is binding:** probability %, never odds; "predict /
position / chance", never bet / stake / odds; no casino look. The fix is **hierarchy + affordance**,
not a new economic gesture.

### Opportunity
A focused predict-card craft pass that makes the **outcome choice the unmistakable protagonist**
of the card — clearer "this is tappable, this is the decision" affordance, stronger hierarchy
(selection > supporting signals), faster scan (what / why / reward in one read), and a more
confident first-pick moment — while keeping the Analyst signal and the honest reward framing as
*support*, not competition.

### Recommended future exploration (when prioritised — not now)
1. **Audit the live card** with real fixtures + real names (the loop is live), mobile-first +
   desktop, ES/EN — capture where the eye lands and how long "what do I do here?" takes.
2. **Throwaway mockup comparison** (the studio's standard): 2–3 hierarchy directions for the
   outcome buttons as the focal action (larger / edge-to-edge tap targets, clearer
   selected vs unselected states, reward + probability as secondary), validated against the
   craft bar (D-020) + dual-surface parity (D-021).
3. **Keep the Analyst + reward as support**, not co-stars; consider progressive disclosure of the
   supporting detail.
4. **A11y + motion:** the selected state must read by more than colour; reduced-motion safe.
5. **Verify against D-037** vocab/visual law before anything ships.

### Explicitly NOT in this observation
No implementation. No new economic mechanic. No sportsbook framing. This is the *seed* of a future
predict-card craft pass, to be planned when the founder prioritises it — it pairs naturally with
the "post-loop craft trajectory" deferred in D-051 and is independent of Phase 3 (it improves the
live loop now).
