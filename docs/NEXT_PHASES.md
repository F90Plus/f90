# F90+ — Next Phases (Ordered Roadmap)

> ⚠️ **SUPERSEDED (2026-06-04) by [ROADMAP.md](ROADMAP.md)** — the canonical roadmap,
> reordered around the loop (D-029). Foundation + the 3D globe are **DONE and LIVE** at
> f90.xyz; the next phase is **Phase 1 — Identity** ([PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md)),
> not the globe. Kept for history. The World Cup opener is **11 Jun 2026**.

## ✅ Done (this checkpoint)
Foundation · i18n (ES/EN) · branding (gold-trophy logo + derived icons) · design
system · deterministic AI Copilot V1 · **real WC2026 fixtures** (openfootball, free) ·
**real cinematic imagery** integrated · docs + decision log. Local-only, no backend.

---

## 1. 🌍 The World Cup Globe  *(flagship — recommended next)*
Cinematic interactive 3D globe (react-globe.gl / Three.js): country states, hover/click
country cards, matchup arcs, mobile/reduced-motion fallback, atmosphere integration.
**Full spec:** [GLOBE_PHASE_PLAN.md](GLOBE_PHASE_PLAN.md). Self-contained, high
emotional payoff, no backend required (uses existing data + model).

## 2. 🔌 Enable real form/standings (quick win)
Add a free **football-data.org** key (`COPILOT_SOURCE=live` + `FOOTBALL_DATA_API_KEY`).
The adapter is already built + gated → the Analyst upgrades from elo-only to real
form/standings automatically. ~1 step, no code.

## 3. 🔐 Identity — Supabase + Auth + Profiles  *(unlocks the social product)*
Supabase project (own, isolated), `@supabase/ssr`, sign up / sign in (email + OAuth),
sessions, protected routes, public **profile** (alias, avatar, country). DB schema v1:
`profiles`. Prereq for everything social.

## 4. 🎯 Predictions core + Virtual wallet + Scoring
`predictions` + `wallet` (ledger) + scoring rules engine; lock at kickoff; settle on
result; "my predictions" view. Server-authoritative, anti-cheat. (Replaces the
predict CTA's placeholder behavior.)

## 5. 🏆 Real Leaderboards & Rankings
Replace the **mock** leaderboard with a real global leaderboard (real-time-ish),
time-boxed boards (matchday / group stage / knockouts), profile rank + streaks.

## 6. 👥 Social — Friends & Private Leagues  *(the growth loop)*
Friends, **private leagues** + invites (core viral loop), friend feeds, reactions,
light trash-talk. This is where the fun compounds.

## 7. 🧠 AI Copilot evolution
Real form/standings (from #2) → richer signals; then optional **ML model**
(Poisson/Dixon-Coles, gradient boosting) on free historical archives; then an optional
**LLM narration/chat** layer on top of the deterministic engine (never invents
numbers). Per-user "Analyst" memory.

## 8. 📡 Live match experience
Live scores/state (needs a live source / paid tier), live "make your call" windows,
live pulse on cards/globe, group tables.

## 9. 🔗 Viral / shareable prediction cards
Deep-linked, beautiful shareable cards (prediction, result, rank) — dynamic OG per
match/profile. Feeds the social loop + acquisition.

## 10. 🔔 Notifications
Pre-kickoff reminders, result/settlement, league activity, friend challenges
(web push → mobile later). With responsible-play framing.

## 11. 📱 Mobile polish & PWA → app
Deeper mobile UX, install/PWA refinement, performance budget (Core Web Vitals), and
eventually a wrapper/native app.

## 12. 🚀 Launch readiness
Own Vercel project + domains, analytics, SEO, monitoring, tests (Vitest + Playwright),
LICENSE, deploy pipeline.

---

## Cross-cutting backlog
Localized country names · typed i18n messages · automated tests · LICENSE · dynamic
per-match OG · accessibility audit · perf budget.

## Non-goals (keep off)
Real-money betting / payouts / gambling mechanics · pay-to-win · heavyweight
microservices before the product needs them · any AI/editor lock-in.
