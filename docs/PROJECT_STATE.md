# F90+ — Project State (Checkpoint)

> **✅ CHECKPOINT 2026-06-05 — PHASE 1 (Identity & Accounts) CLOSED · MERGED · DEPLOYED · ENV ACTIVATED · PRODUCTION VERIFIED — founder-approved (official close record: DECISIONS D-048).**
> **`main` = `7584f65`** (PR [#2](https://github.com/F90Plus/f90/pull/2) merged) and **deployed to
> production** (`vercel --prod`, `dpl_Dth9c2paTkJkBwi9WauResDUL7iQ`, aliased **`https://www.f90.xyz`**).
> Phase 1 delivered: Supabase-backed auth (magic-link + Google) · onboarding ·
> protected `(app)` gate + `/home` · public profile + dynamic **localized** OG · settings/30-day cooldown ·
> the server-authoritative economy (wallet + append-only ledgers + `award_*`, welcome bonus **20,026
> Tokens F90**) · a **real (empty, honest) rankings teaser** · the Analyst-Center live-market landing
> (D-041) · and an i18n/token/visual/debt sweep (D-044). Gates green · i18n parity **263/263** · browser
> E2E **ES/EN/mobile, 0 console errors** · 11 invariants confirmed.
>
> **✅ PRODUCTION ENV ACTIVATED (2026-06-05):** the 2 public Supabase env vars are set in Vercel + the site
> was **redeployed** (`dpl_3PDvhVLQBcVe6ZWYpi8N8cQWLa7L`, `www.f90.xyz`); **all 500s resolved** (gates →
> `/login`, `/u/[unknown]` → 404, OG → 200, public → 200 — verified in prod). **Only remaining for real
> end-user sign-in: the D-035 Supabase dashboard items** (`site_url`, allow-list apex, Resend SMTP).
> **▶ NEXT MILESTONE = Phase 2 (Predictions Core & Scoring).** Read [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md)
> (full close + ship record) + [ROADMAP.md](ROADMAP.md) + [DECISIONS.md](DECISIONS.md). **DO NOT open new
> fronts** (D-042 dashboard/Fantasy/player-market are future, documented-not-built).
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
is **applied & verified**, and **auth (T4) + onboarding (T5) + the `(app)` group (T6) + the public
profile (T7) + settings/30-day cooldown (T8) are shipped + verified** (magic-link + Google, dual-mode
callback, login/signup ES+EN, auth-aware header; onboarding via RLS self-update; a session-gated
`/home` showing the **20,026 Tokens F90** welcome bonus, D-039; a public `/u/[username]` with a dynamic
**localized** OG card; a gated `/settings` with the cooldown); plus **T9 real rankings teaser** (D-043),
**T10 i18n/token/visual/debt sweep** (D-044), and **T11 DoD gate → Phase 1 CLOSED** (D-045). Production
promotion is founder-gated. See [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md).

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
**Built in Phase 1 (CLOSED):** Supabase backend, auth, profiles, wallet + append-only ledgers +
`award_*` economy functions, and the **real (empty) rankings teaser** (replaced the mock). **Still
ahead:** **predictions + scoring** (Phase 2 — generates the economy + fills the leaderboard),
**player market & fantasy XI** (Phase 3), social / leagues / friends, live match experience, shareable
cards, notifications, broader automated tests. The Analyst's runtime signals stay mock until
football-data is wired (Phase 2). See [ROADMAP.md](ROADMAP.md) (reordered around the loop, D-029).

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
3. ✅ **Phase 1 — Identity & Accounts — CLOSED** (DoD passed, **D-045**) on branch
   `feat/phase-1-identity` (pushed; `main` untouched; production still Phase 0.6). **Founder-gated to
   ship:** PR → `main` + merge → `vercel --prod` (D-033) + pre-prod Supabase items (D-035). Full close
   record: [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md).
4. **▶ NEXT = Phase 2 — Predictions Core & Scoring:** `fixtures` + `predictions` schema · the predict
   flow (winner/scoreline/brackets) locking at kickoff · difficulty-honest scoring (`lib/football/model.ts`)
   · server-side settlement → `award_points`/`award_coins`. **Generates the economy + fills the rankings
   teaser with real data.** Map: [ROADMAP.md](ROADMAP.md) · contracts: [SCHEMA_V1.md](SCHEMA_V1.md).
