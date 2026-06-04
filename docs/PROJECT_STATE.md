# F90+ — Project State (Checkpoint)

> **Resume entry point.** Read this first, then [OPERATING_MODEL.md](OPERATING_MODEL.md)
> + [DECISIONS.md](DECISIONS.md). Snapshot date: **2026-06-04**. Phase: **FOUNDATION
> CLOSED — production-ready.** Next: **public launch** ([DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md),
> founder, imminent) → **Phase 1 — Identity & Accounts**, which is now **fully designed and
> ready to implement** ([PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) ·
> [SCHEMA_V1.md](SCHEMA_V1.md) · [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md)).

## TL;DR
F90+ is the **living experience of the 2026 World Cup** — predictions, fantasy, ideal XI,
player portfolio, rankings and narrative fused into one world (vision:
[PROJECT_VISION.md](PROJECT_VISION.md) · [EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md);
economy ratified in [DECISIONS.md](DECISIONS.md) D-027). Foundation, bilingual i18n, premium
branding, a deterministic AI Copilot ("The Analyst"), **real WC2026 fixtures**, **cinematic
imagery**, and the flagship **3D World Cup globe hero** (gold hosts / green qualified, from
real data) are built and **verified locally**. **The foundation is CLOSED / production-ready.**
No accounts/backend or public deploy yet — next is the public launch, then **Phase 1**
(designed, documented, ready to build).

## How to run
```bash
corepack enable            # pnpm via Corepack (Node ≥ 20.9; Node 24 used)
pnpm install
pnpm dev                   # → http://localhost:3000  (/ = ES, /en = EN)
```
> On this machine pnpm isn't on PATH (Node is in Program Files; `corepack enable`
> needs an elevated shell once, or `npm i -g pnpm`). Workaround used during dev:
> `corepack pnpm -C apps/web run dev|build|typecheck`. Dev preview port: **3300**.

## Technical state ✅
- **Stack:** Next.js 16.2.7 (App Router, RSC) · React 19 · TypeScript strict
  (`noUncheckedIndexedAccess`) · Tailwind v4 (CSS-first tokens) · Framer Motion ·
  next-intl · pnpm workspaces.
- **Build:** `next build` **green**; `/[locale]` revalidates on a 6h fetch window because
  the homepage fetches real fixtures. `tsc --noEmit` clean. **0 console errors.**
- **i18n:** ES (default, `/`) + EN (`/en`), `localePrefix: as-needed`, `timeZone:
  'UTC'`, catalogs in `apps/web/locales/{es,en}.json`. **No hardcoded copy** (1 stray `vs`
  noted in the audit, queued in pre-flight).
- **Routing:** `app/[locale]/` (layout, page, not-found, `[...rest]` catch-all),
  `proxy.ts` (locale negotiation). Static params for both locales.

## Visual / branding / atmosphere state ✅
- **Logo:** official gold-trophy render (`public/brand/f90plus-logo.png`) is primary
  (D-012) — header, hero, footer, 404. Favicon/app-icon/maskable derived from it.
- **Design system:** dark night-stadium / broadcast; tokens in `styles/globals.css`.
- **Real cinematic imagery** (founder-provided, WebP) via `CinematicImageLayer`. All
  procedural "fake" atmosphere removed (D-018/D-019).

## Hero + globe state ✅ (the 3D globe IS built — shipped-local + verified)
Photo-first night scene + the **real interactive 3D globe** (`features/globe/`,
react-globe.gl / three): vendored assets (no CDN), gold hosts + green qualified from real
openfootball data (D-023), DPR cap ≤1.6, off-screen pause, lazy `ssr:false` + error
boundary + image fallback, reduced-motion safe. Countdown pedestal to the real opener
(`2026-06-11`). The featured-card hero was replaced by the globe (D-022).

## Real-data state ✅ (free, cache-first, graceful)
- **openfootball** (`lib/football/openfootball.ts` + `nations.ts`): real WC2026 fixtures +
  globe country states, zero key, cache-first (6h), **mock fallback** if unreachable.
- **Model probabilities** from team-strength Elo (`lib/football/model.ts`) — honest "the
  model's view", `modeled: true`, not odds.
- **football-data.org** (`lib/football/football-data.ts`): real standings adapter, **built
  but env-gated** (`COPILOT_SOURCE=live` + `FOOTBALL_DATA_API_KEY`) and currently a no-op
  enrich (queued for Phase 2). No key → graceful no-op.
- Coverage note: `teams.ts` maps 37 of 48 nations — the other 11 fall back to a gray token
  (queued in Phase 1 pre-flight P1).

## Copilot ("The Analyst") state ✅ (V1, no paid LLM)
- Deterministic engine (`lib/copilot/engine`): 8 signals → weighted log-linear blend →
  P(H/D/A) + confidence + drivers. Pure, testable (tests queued in pre-flight P3).
- `AnalystCard` analyzes the **real opener** via `insightFromStrengths`; templated i18n
  insights. Runtime signals are mock-fed until the live adapters are wired (Phase 2).

## What's NOT built yet ⏳
Backend / accounts / persistence (Supabase, auth, profiles, wallet & scoring, real
leaderboard — currently **mock**), **predictions**, **player market & fantasy XI**,
social / leagues / friends, live match experience, shareable cards, notifications, tests,
public deploy. The Analyst's runtime signals are mock until football-data is wired. See
[ROADMAP.md](ROADMAP.md) (reordered around the loop, D-029).

## Phase 1 design — DONE, ready to implement ✅
Identity & Accounts is fully specified: [PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) (spec),
[SCHEMA_V1.md](SCHEMA_V1.md) (Supabase contract — RLS, append-only ledgers, `award_*`
functions), [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md) (ordered tasks
+ pre-flight to close audit debt). Economy model (points/coins/reputation) ratified
(D-027); roadmap reordered so Predictions generates the economy that Fantasy spends (D-029).

## Known caveats
- pnpm via Corepack (PATH note above).
- Headless preview can't reliably screenshot (backgrounded tab / WebGL) — verify in a real browser.
- A **logo variant** ("PREDICT. PLAY. WIN.") exists but was **not** adopted; gold-trophy remains primary.
- No automated tests yet (Vitest queued in Phase 1 pre-flight); no LICENSE yet.

## Where to resume
1. **Public launch (founder, imminent):** GitHub repo + Vercel + `f90.xyz` + first deploy —
   [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md).
2. **Phase 1 — Identity & Accounts:** start with the **pre-flight** (complete `teams.ts` to
   48, unify the openfootball source, add Vitest, fix `.env.example`), then **T0** (isolated
   Supabase) → **T1** (compose `@supabase/ssr` with the next-intl middleware) → schema →
   auth → profile. Full map: [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md).
**After Identity → Phase 2 (Predictions Core & Scoring):** the engine that generates the
economy (correct call → points + coins), the daily-use driver.
