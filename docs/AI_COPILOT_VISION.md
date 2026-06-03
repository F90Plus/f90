# F90+ — AI Copilot Vision

## One line

**Every F90+ user gets their own football analyst** — a personal copilot that reads
real, current football data and helps them make smarter predictions, in plain
language, for free.

Working name: **"El Analista" / "The Analyst."**

## The promise

Before every match, your Analyst has done the homework:

> *"Spain arrives in better form (4 wins in 5) and creates more clear chances. The
> market makes them clear favourites (62%), and 71% of F90+ players agree. Lean:
> Spain win — solid confidence. Watch out: Brazil are dangerous on the counter."*

It's the knowledgeable friend who actually read the stats — surfacing form,
quality, head-to-head history and outside consensus, then giving a clear, honest,
**probabilistic** read. Not a guarantee. Not betting advice. A smarter starting
point for your call.

## Why this matters for F90+

F90+ is a **social, free, virtual** World Cup prediction game. The Copilot is the
feature that makes predicting *feel smart and alive*:

- **Lowers the barrier** for casual fans — you don't need to know the xG to play well.
- **Deepens engagement** — a reason to open the app before every match.
- **Feeds the social loop** — "the Analyst says X, but I think Y" is a conversation.
- **Reinforces the identity** — premium, broadcast-grade, *knowledgeable*.

## Principles

1. **Free first.** V1 runs at **$0** — no paid LLM, no paid data. (See
   [DATA_SOURCES_RESEARCH.md](DATA_SOURCES_RESEARCH.md).)
2. **Honest, not a fortune teller.** Always probabilistic, always with a confidence
   level, always clear it's for entertainment. **Never** framed as a sure thing or
   as real-money betting advice. F90+ is virtual-only.
3. **Explainable by construction.** Every recommendation shows *why* — which
   signals drove it. No black box. (This is also why V1 is deliberately **not** an
   LLM — see below.)
4. **Real data, real-time-ish.** Built on live football data, refreshed on a
   schedule, with visible freshness.
5. **Personal.** Tuned to each user's favourite teams, their prediction history and
   their (virtual) coin situation.
6. **Pundit voice, bilingual.** Confident, warm, broadcast tone — in **Spanish and
   English** from day one, via the existing i18n system.

## Why no LLM in V1 (this is a feature, not a limitation)

The user explicitly wants **no paid LLM** (no OpenAI, no Claude API) for now. That
constraint actually produces a *better* V1:

- **$0 and deterministic** — same inputs always give the same, auditable output.
- **No hallucinations** — a predictions product must never invent a fake stat. A
  rules/stats engine *cannot* make numbers up.
- **Fully explainable** — required to keep the product honest and non-gambling.
- **Fast and offline-friendly** — no model latency, no external AI dependency.

The intelligence in V1 comes from **combining real signals well**, not from
generating text with a model. See [PREDICTION_ENGINE_V1.md](PREDICTION_ENGINE_V1.md)
and [AI_COPILOT_ARCHITECTURE_V1.md](AI_COPILOT_ARCHITECTURE_V1.md).

## What the Copilot does (V1 scope)

- **Pre-match brief** per fixture: lean + confidence + 2–3 bullet rationale.
- **Signal breakdown**: form, quality/xG-proxy, home edge, H2H, market consensus,
  community consensus — each visible and weighted.
- **Personalized feed**: insights for the user's followed teams and upcoming picks.
- **Light "what-if" nudges**: e.g. "the favourite looks strong here" or "your model
  disagrees with the market — a contrarian angle." (Educational, never betting tips.)

**Out of scope for V1:** free-form chat/conversation, generated long-form articles,
voice, image generation. Those wait for a real-AI phase.

## The future (if/when we add real AI)

The V1 engine is designed so AI slots **on top**, never replacing the honest core:

1. **LLM as a narration + conversation layer.** Feed the deterministic signals and
   our normalized data to an LLM (RAG) so users can *chat* with the Analyst and get
   richer explanations and banter. The numbers still come from the engine — the LLM
   **never invents data**.
2. **A trained ML model** (e.g. Poisson / Dixon-Coles for scorelines, gradient
   boosting for outcomes) replaces hand-tuned weights, trained on the free
   historical archives (Football-Data.co.uk, StatsBomb Open Data).
3. **Premium data** — real-time xG and sub-15s live scores via a paid tier
   (e.g. Sportmonks, API-Football paid) when budget allows.
4. **Per-user agent memory** — the Analyst remembers your style and history across
   the tournament.

V1 is the honest, free foundation. Everything above is additive.
