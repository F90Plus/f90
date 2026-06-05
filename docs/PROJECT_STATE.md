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
> **▶ PHASE 2 (Predictions Core & Scoring) — MERGED to `main`** (PR [#4](https://github.com/F90Plus/f90/pull/4),
> merge commit `2d3dc37`, 2026-06-05). The full **predict → lock → settle → points/Tokens → ranking** loop
> (migrations `0004`/`0005`, `make_prediction`/`settle_fixture` server-authoritative functions, predict card
> + position ticket with real flags, premium `/home` hub, `/predictions`, `/ranking`). **243 vitest · build ·
> i18n 343/343 · vocab D-037 · adversarially reviewed** (D-050/D-051). **Deploy = operator runbook:** apply
> `0004`+`0005` to Supabase · Vercel env (`SUPABASE_SECRET_KEY` + new `ADMIN_SYNC_SECRET`) · D-035 sign-in
> dashboard items · `vercel --prod` · `POST /api/admin/sync-fixtures` → ~72 fixtures · `POST /api/admin/settle`
> post-match. See [PHASE_2_HANDOFF.md](PHASE_2_HANDOFF.md).
> **▶ PHASE 2 POLISH PASS (D-053 + D-054) — code-complete on `feat/phase-2-polish`, GATED (not pushed/merged/deployed).**
> Turns Phase 2 from "works" to "finished": auth-aware navigation (header/footer/account-menu + profile links;
> the old landing-anchor dead-ends fixed), predict-flow feedback (in-flight "Confirmando…" · **reactive kickoff
> lock** · clearer change-pick · closed-market hero · real minutes), /home premium cohesion (atmosphere de-dup ·
> score-first standing strip · honest always-true eyebrow · loading skeleton · distinct empty-state), and a
> resolved-row reveal (inline scoreline + won-row elevation) + AA-contrast bumps.
> **Commitment & value pass (D-054):** reward visible **before** choosing (dual points + Tokens F90), Tokens in
> the currency's lime in the flow, the difficulty↔reward rule made explicit, and "what's at stake" named (counts
> toward your record + ranking) — the stake is **reputational, not a wager** (free staking deferred to Phase 3 /
> Economy, a brand call). Plus the **World Cup trophy** as a single premium aspirational atmosphere on /home
> (towering, ~7% opacity, blur/fade, gold glow — atmosphere, never a logo). **Narrow scope — no new
> surfaces/systems, D-037 vocab law intact, D-051 deferred craft NOT reopened.** Gates: **243 vitest · tsc ·
> next build · i18n ES/EN 356/356**. Next = **founder verifies authenticated ES/EN/mobile (local :3300) →
> push + PR + merge + preview → `vercel --prod`** (D-033 manual, founder-gated). Phase-3 candidates (incl. free
> staking) captured in [PHASE_3_CANDIDATES.md](PHASE_3_CANDIDATES.md).
> Read [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md) +
> [ROADMAP.md](ROADMAP.md) + [DECISIONS.md](DECISIONS.md). **NEXT MILESTONE = Phase 3 (Economy: Market +
> Fantasy XI)** — starts only after this polish pass is founder-verified + deployed. **DO NOT open new fronts**
> until the loop is live + verified (D-042 dashboard/Fantasy/player-market are future, documented-not-built).
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
hosts / green qualified, from real data). **Phase 1 (Identity & Accounts) is CLOSED · MERGED · DEPLOYED · ENV-ACTIVATED** (D-048): the Supabase backend (schema, economy, 48-country seed, RLS, grants)
is **applied & verified**, and **auth (T4) + onboarding (T5) + the `(app)` group (T6) + the public
profile (T7) + settings/30-day cooldown (T8) are shipped + verified** (magic-link + Google, dual-mode
callback, login/signup ES+EN, auth-aware header; onboarding via RLS self-update; a session-gated
`/home` showing the **20,026 Tokens F90** welcome bonus, D-039; a public `/u/[username]` with a dynamic
**localized** OG card; a gated `/settings` with the cooldown); plus **T9 real rankings teaser** (D-043),
**T10 i18n/token/visual/debt sweep** (D-044), and **T11 DoD gate** (D-045). PR #2 merged → `main`=`7584f65`,
deployed to `www.f90.xyz` + env-activated (D-046); only the **D-035 sign-in items** remain (founder). See [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md).

## Deploy state ✅ LIVE — Phase 1 (updated 2026-06-05, D-046/D-048; deploy model D-033)
- **GitHub:** `F90Plus/f90` — **own isolated org** (NOT PMS/PT/Chiribito/XPrediction),
  branch **`main`** = `4959c6f` (Phase 1 closed, D-048). Repo synced.
- **Production: Phase 1 LIVE** on **`www.f90.xyz`** (canonical; apex `f90.xyz` **308→www**),
  latest deployment `dpl f90-pef578soh` (READY, env-activated). EN + ES verified (landing · route gates ·
  localized OG); real end-user **sign-in pending the D-035** Supabase items.
- **Vercel — IMPORTANT (D-033):** the `f90` project lives in the Vercel team
  **`chiribito293-7173s-projects`** (shared with Chiribito / xpredict), **NOT** an isolated F90+
  account, and is **NOT git-connected** → **production is published MANUALLY via `vercel --prod`**
  (Root Directory `apps/web`). Exact procedure + governance item: [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md)
  → "REALITY CHECK".
- **Domain:** `www.f90.xyz` + **SSL active** (apex `f90.xyz` redirects to www).
- **Isolation:** code/repo isolated (`F90Plus/f90`); **Vercel team is currently shared with
  Chiribito** — open governance item (D-033). Supabase `f90-production` is **active + isolated** (Phase 1).

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
3. ✅ **Phase 1 — Identity & Accounts — CLOSED · MERGED · DEPLOYED · ENV-ACTIVATED** (D-045/D-046/D-048).
   PR [#2](https://github.com/F90Plus/f90/pull/2) merged → `main`=`7584f65` (close docs `4959c6f`);
   `vercel --prod` → `www.f90.xyz`. Only the **D-035 sign-in items** remain (founder). Full close record:
   [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md).
4. ✅ **Phase 2 — Predictions Core & Scoring — MERGED** (PR [#4](https://github.com/F90Plus/f90/pull/4), merge
   `2d3dc37`; D-051). Full **predict → settle → points/Tokens → ranking** loop in `main` (migrations
   `0004`/`0005`, `make_prediction`/`settle_fixture`, predict card + `/home` + `/predictions` + `/ranking`);
   gates green (243 vitest · build · i18n 343/343). **DEPLOY = operator runbook** in
   [PHASE_2_HANDOFF.md](PHASE_2_HANDOFF.md) (apply 0004/0005 · env · D-035 · `vercel --prod` · sync pre-opener
   · settle post-match) — verify the loop in prod, then capture the first real visual.
5. **▶ NEXT = Phase 3 — Economy: Market + Fantasy XI** (spends the Tokens the predict loop generates;
   `players`/`squads`/`lineups` pre-designed in [SCHEMA_V1.md](SCHEMA_V1.md) "Forward contract"). Map:
   [ROADMAP.md](ROADMAP.md).
