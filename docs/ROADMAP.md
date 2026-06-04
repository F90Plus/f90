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

## 🔜 Phase 0.5 — Public launch *(founder)*

Ship the foundation. Steps in [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md).

- [ ] Official GitHub repo (isolated) + push
- [ ] Vercel project (isolated) — root `apps/web`
- [ ] Connect `f90.xyz` (DNS + SSL) + `NEXT_PUBLIC_APP_URL`
- [ ] First production deploy + preview pipeline

---

## 🔜 Phase 1 — Identity & Accounts

Let people *be someone* on F90+ — and lay the **server-authoritative economy** the whole
loop runs on. **Fully designed & ready to implement:**
[PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) · [SCHEMA_V1.md](SCHEMA_V1.md) ·
[PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md).

- [ ] Isolated Supabase + `@supabase/ssr`; middleware composed with next-intl
- [ ] Auth: magic-link + Google + Apple (D-030)
- [ ] Public **profile** (`/u/[username]`, OG-shareable), favourite **country**, own-IP avatar
- [ ] **Wallet + append-only ledgers** (coins + points) via `SECURITY DEFINER` functions — latent
- [ ] Rankings teaser (replaces the mock); protected routes + auth-aware header
- [ ] DB schema v1: `profiles`, `wallets`, `coin_ledger`, `score_ledger`, `countries`

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
- [ ] Testing — Vitest from pre-flight; Playwright as features land
- [ ] LICENSE — choose and add before any public, open release
- [ ] Accessibility pass (focus rings, skip link — flagged in the audit)
- [ ] More languages — architecture supports it; add on demand

## Non-goals (kept off the roadmap on purpose)

- Real-money betting, payouts, or any gambling mechanic. Probabilities are signal, never a wager.
- Pay-to-win — monetization never buys predictive edge.
- Arcade FUT/Panini/EA clones — player representation is original F90+ IP (D-025).
- A heavyweight microservice/Turborepo setup before the product needs it.
- Any AI/editor lock-in — standard, portable tooling only (D-016).
