# F90+ — Experience System (the conceptual blueprint)

> How F90+ coheres into **one living World Cup experience** instead of a mix of
> features. The system contract behind [PROJECT_VISION.md](PROJECT_VISION.md); informs
> architecture and phase planning. Decisions: [DECISIONS.md](DECISIONS.md) D-024 (model),
> D-025 (player IP), D-026 (elimination), D-023 (data fidelity).

## 1. The model — four shared layers
Every pillar plugs into the same four layers. Coherence comes from sharing them, not
from stitching features together.

| Layer | What it is | Why it unifies |
| --- | --- | --- |
| **World** | The **globe** — the official tournament + the planet's football pulse, live. | The shared *surface* everything is seen on. |
| **Identity** | Your **public profile, reputation, country**. | The shared *protagonist* — everything builds *you*. |
| **Economy** | **Virtual coins + points + reputation** (no real money). | The shared *currency* across every mechanic. |
| **Time** | Everything recomputes **live with the real tournament**. | The shared *clock* — one evolving story. |

**Rule (D-023, generalized): every layer is fed by verified real data.** No invented
states, stats or outcomes — anywhere.

## 2. The pillars (each feeds the spine)
- **Predictions** — matches/scores/moments → earn points/coins, move reputation, feed
  global/country momentum.
- **Fantasy XI** — build & run your ideal team → performance feeds points + identity.
- **Player portfolio & discovery** — find sleepers, sign early, back the undervalued
  before they explode; buy/sell with virtual coins. **Strategic, not an arcade
  pack-opener.** Generates personal narrative ("I called this player").
- **Markets** — sentiment/movement as *signal* (never a wager) → informs discovery +
  momentum.
- **Rankings & reputation** — global + by-country + leagues; reputation is cross-pillar
  (good predictions *and* smart portfolio *and* fantady all raise it).
- **Narrative (AI/editorial)** — see §3. The soul layer over everything.
- **Country hubs & identity** — see §4.
- **Live tracking** — the timeline layer made visible everywhere.

## 3. Momentum / Heat — the living pulse (World × Time)
The globe also shows the **living pulse of the football planet**, in real time — *felt*,
not a technical heatmap:
- Hottest nations · trending teams · most-bought players · global prediction leans ·
  world sentiment · tournament momentum.
- Honest + data-real: derived from real activity (real fixtures/results + real F90+
  community aggregates), never fabricated. Presented cinematically (glow, pulse, motion),
  on-brand — not a science viz.

## 4. Narrative / The Analyst — the soul (cross-cutting)
F90+ must feel **narrated and lived**, not just tracked. A premium **editorial/AI layer**
interprets the tournament in human language:
> "Croatia is surviving." · "Japan is the tactical surprise." · "Bellingham is running
> the tournament." · "Brazil arrives emotionally shaken." · "Morocco shocks the world
> again."
- Built on the existing deterministic **Copilot ("El Analista")** —
  [AI_COPILOT_VISION.md](AI_COPILOT_VISION.md) / [PREDICTION_ENGINE_V1.md](PREDICTION_ENGINE_V1.md).
  **No paid LLM in V1** (D-005): narrative from real signals + templated, honest copy;
  an LLM can later *phrase* it, never be the source of truth.
- Honest by construction: every claim traces to real data. No invented storylines.

## 5. Identity & country (Identity layer)
- At signup the user **chooses the country that represents them** → part of their
  **public identity** in F90+ (badge, hub membership, emotional thread).
- **Country hubs**: community, fans, predictions, trending players, national emotional
  state, national narrative, "road to the title." The World Cup's natural tribalism,
  made social and global.
- Reputation + story are public — your profile *is* your World Cup journey.

## 6. Elimination — non-punitive, always playable (D-026)
If the user's country is eliminated:
- The user is **NOT** out, does **NOT** lose their account, and **nothing is blocked.**
- Only the **emotional narrative** shifts (their nation is out; the hub mood changes).
- They keep predicting, managing portfolio, playing fantasy, climbing rankings — for
  the rest of the tournament.
- **No frustrating or punitive mechanic removes anyone before the final.** The World
  Cup stays alive for everyone; each user just has a stronger emotional bond to their
  country. (Country eliminated = red on the globe per D-023 — a *narrative* state, never
  a gate on the user.)

## 7. Player representation — own IP, zero license dependency (D-025)
- **Original F90+ card system** — frame/typography/color/hierarchy 100% ours.
  Recognizable + premium; **not** a Panini/FUT/EA clone.
- **Stylized avatars / composable tokens** — generated from (role + nation + accent +
  number/initials), scaling from premium token → original illustrated portrait. **Never
  official photos.**
- **Own iconography** (positions, actions, stats, states).
- **Legal stance:** player **names + real stats = facts** (used by all fantasy — not
  copyrightable). **Avoid** official crests, kits, photos, and FIFA/Panini/EA trade
  dress. National flag = neutral symbol, OK. → turns a copyright risk into a **brand moat.**

## 8. Economy (no real money)
- **Virtual coins** (spent on predictions, fantasy moves, player buys) + **points**
  (skill/outcomes) + **reputation** (long-term standing). Earned and spent across all
  pillars; the same wallet powers everything.
- Free; monetization (if ever) never buys predictive advantage (D-004/VISION).

## 9. How it maps to architecture (high level)
- **World:** the globe (`features/globe/`, real-data states — GLOBE_HERO_SPEC).
- **Identity/Economy:** shared profile + wallet/reputation services (Supabase, Phase 1+).
- **Time/Data:** the real-data ingestion already started (`lib/football` openfootball +
  the env-gated football-data enrichment) feeds states, momentum, narrative — cache-first.
- **Narrative:** `lib/copilot` (deterministic) → editorial layer.
- Typed boundaries + swappable adapters so the intelligence layer can take a real ML/LLM
  later without touching the honest core (OPERATING_MODEL long-term posture).

## 10. Build approach
Vision documented **in full**; built in **coherent slices** (premium-or-don't-ship,
fewer-but-excellent — D-020). **Phase 1 = the first playable MVP slice** of this system
(to be defined). Today's pre-Phase-1 work: production-ready hero (globe) → domain →
metadata/social/loading/perf → Phase 1 definition.
