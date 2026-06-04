# F90+ — Project State (Checkpoint)

> **Resume entry point.** Snapshot date: **2026-06-04**. Phase: **FOUNDATION + PHASE 0.5/0.6 LIVE
> at https://f90.xyz · PHASE 1 (Identity & Accounts) IN PROGRESS — T1–T4 done (auth flows shipped +
> functionally verified), data foundation live & verified.**
>
> **▶ To resume Phase 1, read [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md) FIRST** (branch
> `feat/phase-1-identity`, not pushed; Supabase schema + 48-country seed applied & verified; auth
> flows shipped; **next = T5 onboarding**). Then [OPERATING_MODEL.md](OPERATING_MODEL.md) + [DECISIONS.md](DECISIONS.md).
> Contracts: [PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) · [SCHEMA_V1.md](SCHEMA_V1.md) ·
> [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md).

## TL;DR
F90+ is the **living experience of the 2026 World Cup** — predictions, fantasy, ideal XI,
player portfolio, rankings and narrative fused into one world (vision:
[PROJECT_VISION.md](PROJECT_VISION.md) · [EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md);
economy ratified in [DECISIONS.md](DECISIONS.md) D-027). The **foundation is CLOSED and now
LIVE in production at https://www.f90.xyz** (GitHub `F90Plus/f90` → Vercel `f90` *(shared team,
manual deploy — D-033)* → `www.f90.xyz` + SSL): bilingual i18n, premium branding, a deterministic AI Copilot ("The Analyst"), **real
WC2026 fixtures**, **cinematic imagery**, and the flagship **3D World Cup globe hero** (gold
hosts / green qualified, from real data). **Phase 1 (Identity & Accounts) is now IN PROGRESS** on
branch `feat/phase-1-identity`: the Supabase backend (schema, economy, 48-country seed, RLS, grants)
is **applied & verified**, and **auth flows (T4) are shipped + functionally verified** (magic-link +
Google, dual-mode callback, login/signup ES+EN, auth-aware header); onboarding (T5) → DoD (T11)
remain. See [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md).

## Deploy state ✅ LIVE — incl. Phase 0.6 (updated 2026-06-04, D-033)
- **GitHub:** `F90Plus/f90` — **own isolated org** (NOT PMS/PT/Chiribito/XPrediction),
  branch **`main`** = `f2be258` (Phase 0.6). Repo synced.
- **Production: Phase 0.6 LIVE** on **`www.f90.xyz`** (canonical; apex `f90.xyz` **308→www**),
  deployment `dpl_ETMNzrovfdWkU3z1meLJUaRvkNLe` (READY). EN + ES verified (Tournament Center,
  bracket, flags; fresh `x-vercel-cache: PRERENDER`).
- **Vercel — IMPORTANT (D-033):** the `f90` project lives in the Vercel team
  **`chiribito293-7173s-projects`** (shared with Chiribito / xpredict), **NOT** an isolated F90+
  account, and is **NOT git-connected** → **production is published MANUALLY via `vercel --prod`**
  (Root Directory `apps/web`). Exact procedure + governance item: [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md)
  → "REALITY CHECK".
- **Domain:** `www.f90.xyz` + **SSL active** (apex `f90.xyz` redirects to www).
- **Isolation:** code/repo isolated (`F90Plus/f90`); **Vercel team is currently shared with
  Chiribito** — open governance item (D-033). No Supabase/backend yet.

## Phase 0.6 — Tournament Center ✅ CLOSED (2026-06-04)
The premium, living **World Cup band** after the Hero — makes F90+ feel alive in the tournament's
peak window (opener 11 Jun). **One cache-first openfootball read (`lib/football/tournament.ts` →
`getTournament`) = the canonical tournament spine** Phases 1–4 attach to. Five modules in
`features/tournament/`: **Field Is Set** (count-up 48/12/104/16), **Qualified Nations**
(confederation filter + real vendored flags, `public/flags/*.svg`, code-token fallback), **The
Draw** (12 groups + the Analyst's group-of-death from model strengths), **The Road** (full 2026
bracket R32→Final — **desktop wallchart / mobile round-navigator**), **Key Matches** (marquee
`AnalystCard` + fixtures grid — **supersedes the old MatchesRail + standalone AnalystSection**).
The Analyst is woven throughout (`AnalystNote`). Data fidelity extends D-023 (groups/bracket/
fixtures from openfootball; confederation + flag = factual reference maps; **live scores = V2**).
**Vitest wired**, data layer TDD'd (**34 tests**). Decision: **D-032**. Validated: `tsc` +
`next build` + 34 tests green; browser desktop (wallchart) + mobile (round-nav, no overflow) +
ES/EN, **0 console errors**.

## How to run (local)
```bash
corepack enable            # pnpm via Corepack (Node ≥ 20.9; Node 24 used)
pnpm install
pnpm dev                   # → http://localhost:3000  (/ = ES, /en = EN)
```
> On this machine pnpm isn't on PATH; workaround: `corepack pnpm -C apps/web run
> dev|build|typecheck`. Dev preview port: **3300**.

## Technical state ✅
- **Stack:** Next.js 16.2.7 (App Router, RSC) · React 19 · TypeScript strict
  (`noUncheckedIndexedAccess`) · Tailwind v4 (CSS-first tokens) · Framer Motion ·
  next-intl · pnpm workspaces.
- **Build:** `next build` **green**; `/[locale]` revalidates on a 6h fetch window (real
  fixtures). `tsc --noEmit` clean. **0 console errors.**
- **i18n:** ES (default, `/`) + EN (`/en`), `localePrefix: as-needed`, `timeZone: 'UTC'`,
  catalogs in `apps/web/locales/{es,en}.json`. **No hardcoded copy** (1 stray `vs` queued
  in pre-flight).
- **Routing:** `app/[locale]/` (layout, page, not-found, `[...rest]`), `proxy.ts` (locale).

## Visual / branding / atmosphere state ✅
- **Logo:** official gold-trophy render is primary (D-012). **Design system:** dark
  night-stadium / broadcast, tokens in `styles/globals.css`. **Real cinematic imagery**
  (WebP) via `CinematicImageLayer`; all procedural "fake" atmosphere removed (D-018/D-019).

## Hero + globe state ✅ (the 3D globe IS built — live + verified)
Photo-first night scene + the **real interactive 3D globe** (`features/globe/`,
react-globe.gl / three): vendored assets (no CDN), gold hosts + green qualified from real
openfootball data (D-023), DPR cap ≤1.6, off-screen pause, lazy `ssr:false` + error boundary
+ image fallback, reduced-motion safe. Countdown pedestal to the real opener (`2026-06-11`).
Featured-card hero replaced by the globe (D-022).

## Real-data state ✅ (free, cache-first, graceful)
- **openfootball** (`lib/football/openfootball.ts` + `nations.ts`): real WC2026 fixtures +
  globe states, zero key, cache-first (6h), **mock fallback** if unreachable.
- **Model probabilities** from Elo (`lib/football/model.ts`) — honest "the model's view".
- **football-data.org** (`lib/football/football-data.ts`): real adapter, **env-gated** +
  currently a no-op enrich (queued for Phase 2).
- `teams.ts` maps **all 48** nations (code/accent/strength) — completed in Phase 0.6, which
  also fixed the Austria/Australia derived-code collision. No gray fallbacks for the field.

## Copilot ("The Analyst") state ✅ (V1, no paid LLM)
- Deterministic engine (`lib/copilot/engine`): 8 signals → log-linear blend → P(H/D/A) +
  confidence + drivers. Pure, testable (tests queued in pre-flight P3). `AnalystCard`
  analyzes the **real opener**; runtime signals mock-fed until live adapters wired (Phase 2).

## What's NOT built yet ⏳
Backend / accounts / persistence (Supabase, auth, profiles, wallet & scoring, real
leaderboard — currently **mock**), **predictions**, **player market & fantasy XI**, social /
leagues / friends, live match experience, shareable cards, notifications, automated tests.
The Analyst's runtime signals are mock until football-data is wired. See
[ROADMAP.md](ROADMAP.md) (reordered around the loop, D-029).

## Phase 1 design — DONE, ready to implement ✅
Identity & Accounts fully specified: [PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) (spec),
[SCHEMA_V1.md](SCHEMA_V1.md) (Supabase contract — RLS, append-only ledgers, `award_*`
functions), [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md) (ordered tasks +
pre-flight). Economy model (points/coins/reputation) ratified (D-027); roadmap reordered so
Predictions generates the economy that Fantasy spends (D-029).

## Known caveats
- pnpm via Corepack (PATH note above).
- Headless preview can't reliably screenshot WebGL — verify in a real browser.
- A logo variant ("PREDICT. PLAY. WIN.") exists but was **not** adopted; gold-trophy primary.
- **Vitest wired** (data-layer unit tests, 34, Phase 0.6); broader coverage (copilot engine,
  Playwright) still queued. No LICENSE yet. Repo `eslint .` has a **pre-existing** flat-config
  gap (no `eslint.config.*`; `@eslint/eslintrc` circular-structure) — typecheck + Vitest +
  `next build` are the effective gates; a fix task is queued separately.

## Where to resume
1. ✅ **Public launch — DONE** (GitHub + Vercel + `f90.xyz` + SSL, live & validated).
2. ✅ **Phase 0.6 — Tournament Center — DONE** (merged to `main`, deployed; D-032).
3. **Phase 1 — Identity & Accounts (next session):** pre-flight is **partly done by Phase 0.6**
   — ✅ `teams.ts` completed to 48, ✅ Vitest added. **Remaining pre-flight:** unify the
   openfootball source + fix `.env.example`. Then **T0** (create the isolated Supabase project —
   **founder gate**) → **T1** (compose `@supabase/ssr` with the next-intl middleware in
   `proxy.ts`) → schema → auth → profile. Full map:
   [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md).
**After Identity → Phase 2 (Predictions Core & Scoring):** the engine that generates the
economy (correct call → points + coins), the daily-use driver.
