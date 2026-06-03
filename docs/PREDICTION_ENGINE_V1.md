# F90+ — Prediction Engine V1 (no LLM)

> Design only — not implemented. This is the deterministic core that turns real
> football data into an honest, explainable recommendation. No machine learning,
> no LLM: just well-combined signals.

## Mental model

```
       SIGNALS (each → probability triplet + confidence)
   ┌───────────────────────────────────────────────┐
   │  INTERNAL (our stats)        EXTERNAL (consensus)│
   │  • Form                      • Market (de-vig)   │
   │  • Quality / xG-proxy        • External model    │
   │  • Elo (we maintain)         • F90+ community     │
   │  • Home advantage                                 │
   │  • Head-to-head                                   │
   │  • Availability (inj/susp)                        │
   └───────────────┬───────────────────────────────┬─┘
                   │  weighted blend (by reliability │
                   │  × confidence × freshness)      │
                   ▼                                 ▼
        FINAL P(home / draw / away)        OVERALL CONFIDENCE
                   │                                 │
                   ▼                                 ▼
        RECOMMENDATION (lean + band)   +   RATIONALE (top drivers, templated)
```

Every signal speaks the **same language** — a probability triplet
`{pHome, pDraw, pAway}` (summing to 1) plus a `confidence ∈ [0,1]` and a
`freshness`. That uniformity is what lets us blend heterogeneous data cleanly and
explain the result.

---

## Step 1 — Inputs (from the cache, never live third-party calls)

| Input | Source | Notes |
| --- | --- | --- |
| Recent results (both teams) | football-data.org / API-Football | last N matches |
| Goals for/against, shots, possession, (xG if present) | API-Football | per match / season |
| Head-to-head history | API-Football `/fixtures/headtohead` | decayed by age |
| Standings / group position | football-data.org | tournament context |
| Injuries / suspensions | API-Football `/injuries` | availability hit |
| Bookmaker odds | The Odds API / API-Football `/odds` | → de-vigged |
| External model prediction | API-Football `/predictions` | optional (coverage varies) |
| Community picks | **F90+ first-party** | % of our users per outcome |
| Venue / host nation | openfootball / fixtures | home-edge input |

All inputs carry `fetchedAt` so the engine can down-weight stale data.

---

## Step 2 — Compute each signal

Each signal is a pure function → `{ triplet, confidence, freshness, drivers }`.

### A. Form signal
Recency- and opponent-weighted points over the last *N* (e.g. 6) matches:

```
formScore(team) = Σ_i  w_i · resultPoints_i · oppStrength_i
   w_i        = recency weight (most recent match weighs most, e.g. 0.85^age)
   resultPts  = win 1.0 / draw 0.5 / loss 0.0
   oppStrength= opponent Elo normalized to ~[0.5, 1.5]
```
Convert the two teams' `formScore` into a triplet via a softmax-style split with a
baseline draw mass. `confidence` rises with the number of recent matches available.

### B. Quality / xG-proxy signal
If real xG is present, use it. Free V1 usually won't have it, so use a **goals-based
proxy**:

```
attack(team)  = avg goals scored / league-avg
defense(team) = league-avg / avg goals conceded
strength      = attack × defense
```
Optionally feed attack/defense into a **Poisson** model to get expected goals →
exact-score distribution → derive `{pHome,pDraw,pAway}`. (Poisson/Dixon-Coles also
unlocks "most likely scoreline" copy.)

### C. Elo signal (we maintain it — fully free, no dependency)
Maintain an internal Elo rating per team, updated after every result:

```
expectedHome = 1 / (1 + 10^(-(Elo_home + HFA − Elo_away)/400))
Elo' = Elo + K · (actual − expected)         // K≈20–30, HFA = home-field bonus
```
Elo is a robust, offline backbone that works even when richer stats are missing.
Map `expectedHome` (+ a draw allocation) to a triplet.

### D. Home-advantage signal
Host nations (USA/Canada/Mexico in 2026) and venue familiarity get a calibrated
bonus folded into Elo's `HFA` term and/or a small standalone nudge. Neutral-venue
knockouts → reduced/zero.

### E. Head-to-head signal
Historical H2H win rate, **age-decayed** (a 2014 result matters far less than 2024).
Low intrinsic `confidence` (small samples, squads change) → small weight.

### F. Availability signal
Key injuries/suspensions reduce a team's effective attack/defense. `confidence`
depends on whether lineup/injury data is present.

### G. Market signal (external consensus) — **de-vig the odds**
Bookmaker odds include an overround (the "vig"). Strip it to get fair probabilities:

```
pRaw_k     = 1 / decimalOdds_k          for k in {home, draw, away}
overround  = Σ pRaw_k                    (> 1)
pFair_k    = pRaw_k / overround          → sums to 1
```
The de-vigged market triplet is the **single most reliable external estimate** →
high weight, high `confidence`. (Used as information; F90+ is virtual-only.)

### H. External-model signal
API-Football `/predictions` (or another model API) → a triplet when coverage
exists. Medium weight; skipped (weight 0) when unavailable.

### I. Community-consensus signal (F90+ first-party)
`% of our users` per outcome → a triplet directly. Weight **scales with sample
size** (tiny early, meaningful as the base grows). The platform's own "wisdom of
the crowd."

---

## Step 3 — Blend into one distribution

Combine the signal triplets with a weighted **log-linear (geometric) pool**, which
behaves better than a plain average for probabilities:

```
effWeight_s = baseWeight_s × confidence_s × freshness_s
logp_k      = Σ_s effWeight_s · ln(p_s,k)        // per outcome k
p_k         = exp(logp_k);   normalize so Σ_k p_k = 1
```

Suggested **starting base weights** (to be calibrated against history later):

| Signal | base weight | rationale |
| --- | --- | --- |
| Market (de-vig) | **0.30** | most reliable single estimate |
| Elo | 0.20 | robust, always available |
| Form | 0.15 | recent momentum |
| Quality/xG-proxy | 0.15 | underlying performance |
| External model | 0.08 | second opinion (if present) |
| Community | 0.07 | grows over time |
| H2H | 0.03 | weak, small samples |
| Home edge / availability | 0.02 | folded mostly into Elo/quality |

Missing/stale signals get `effWeight ≈ 0` automatically → the engine **degrades
gracefully** (e.g. before the tournament, with no form data, Market + Elo carry it).

---

## Step 4 — Confidence

Overall confidence reflects **agreement** between signals and **data completeness**:

```
agreement     = 1 − normalizedVariance(signal triplets)   // signals point the same way?
completeness  = Σ effWeight_present / Σ baseWeight_all     // how much data we actually had
confidence    = clamp( 0.5·agreement + 0.5·completeness , 0..1 )
```
Bucketed for display: **Low / Moderate / Solid / High.** Honest by design — sparse
or conflicting data → low confidence, and we say so.

---

## Step 5 — Recommendation + rationale (templated, no LLM)

- **Lean** = `argmax(p_k)`; **band** from the confidence bucket. Near-even triplets
  → "too close to call."
- **Value note** (educational): if our `p_k` diverges notably from the market's
  `pFair_k`, flag it — "your model is higher on the draw than the market."
- **Rationale** = take the **top 2–3 drivers** (signals whose lean and weight
  contributed most) and render each through an i18n template with thresholds:

```
form.delta > T      → t('insight.form',   {team, wins, n})      // "better form (4 of 5)"
quality.attack > T  → t('insight.attack', {team})               // "creates more chances"
market.fav > 0.55   → t('insight.market', {team, pct})          // "clear favourites (62%)"
community.agree > T  → t('insight.community', {pct})            // "71% of players agree"
availability.hit    → t('insight.injury', {team, player})       // "missing X"
```

All copy lives in `locales/` (ES/EN), tone = honest pundit, **never** "guaranteed."

---

## Worked example (the one from the brief)

**Spain vs Brazil.** Cached inputs → signals:

| Signal | Triplet (H/D/A) | conf | note |
| --- | --- | --- | --- |
| Market (de-vig) | 0.60 / 0.24 / 0.16 | 0.9 | "80% lean to Spain region" |
| Elo | 0.55 / 0.25 / 0.20 | 0.8 | Spain higher rated |
| Form | 0.62 / 0.20 / 0.18 | 0.7 | Spain 4 wins/5 |
| Quality/xG-proxy | 0.58 / 0.22 / 0.20 | 0.7 | Spain higher xG-proxy |
| Community (F90+) | 0.71 / 0.16 / 0.13 | 0.5 | crowd loves Spain |
| H2H | 0.45 / 0.25 / 0.30 | 0.3 | Brazil historically ok |

Weighted geometric blend → **≈ { Spain 0.59, Draw 0.23, Brazil 0.18 }**, signals
largely agree + good completeness → **confidence: Solid.**

**Copilot output (rendered, ES):**
> 🧠 *El Analista — España vs Brasil*
> **España domina posesión y xG** y llega en mejor forma (4 de 5). El mercado la ve
> clara favorita (**60%**) y el **71% de la comunidad F90+** coincide.
> **Recomendación: gana España — confianza sólida.** Ojo: Brasil pega bien al
> contragolpe.

That maps exactly to the brief:
- "España domina posesión y xG" → **internal** quality/form signals.
- "80% de consenso externo" → **external** market + community signals.
- → blended **recommendation** with an honest confidence band and a caveat.

---

## Calibration & honesty

- **Backtest** weights against Football-Data.co.uk historical results+odds; track
  Brier score / log-loss; tune base weights (later, optional).
- **Calibration check**: of matches we call "60%", ~60% should happen. Show only
  when calibrated.
- **Guardrails**: always probabilistic + confidence; never "lock"/"guaranteed";
  never real-money framing; show data freshness and provenance.

## Build order (when we implement)
1. Internal model: Elo + Form + Quality (works with just football-data.org).
2. Add Market (de-vig) — biggest accuracy jump.
3. Add External model + Community + H2H/availability.
4. Blend + confidence + templated rationale (i18n).
5. Backtest & calibrate.
