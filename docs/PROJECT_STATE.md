# F90+ — Project State (Checkpoint)

> **Resume entry point.** Read this first, then [OPERATING_MODEL.md](OPERATING_MODEL.md)
> + [DECISIONS.md](DECISIONS.md). Snapshot date: **2026-06-03**. Phase: **FOUNDATION
> CLOSED — production-ready.** Globe hero shipped-local + verified; vision canonized.
> Next: public deploy ([DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md)) → Phase 1. No backend yet.

## TL;DR
F90+ is the **living experience of the 2026 World Cup** — predictions, fantasy, player
portfolio, markets, rankings and narrative fused into one world (vision:
[PROJECT_VISION.md](PROJECT_VISION.md) · [EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md)).
Foundation, bilingual i18n, premium branding, a deterministic AI Copilot ("The Analyst"),
**real WC2026 fixtures**, **cinematic imagery**, and the flagship **3D World Cup globe
hero** (a living official map — gold hosts / green qualified, from real data) are built and
**verified locally**. **The foundation is CLOSED / production-ready.** No accounts/backend
or public deploy yet — next is the public launch ([DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md)),
then **Phase 1**.

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
- **Build:** `next build` **green**; `/[locale]` is **ISR (revalidate 6h)** because
  the homepage fetches real fixtures. `tsc --noEmit` clean. **0 console errors.**
- **i18n:** ES (default, `/`) + EN (`/en`), `localePrefix: as-needed`, `timeZone:
  'UTC'`, catalogs in `apps/web/locales/{es,en}.json`. **No hardcoded copy.**
- **Routing:** `app/[locale]/` (layout, page, not-found, `[...rest]` catch-all),
  `proxy.ts` (locale negotiation). Static params for both locales.

## Visual / branding / atmosphere state ✅
- **Logo:** official gold-trophy render (`public/brand/f90plus-logo.png`) is primary
  — header, hero, footer, 404. Favicon/app-icon/maskable derived from it
  (`scripts/brand/generate-icons.py`).
- **Design system:** dark night-stadium / broadcast; tokens in `styles/globals.css`
  (`@theme`): night/mist/led(primary)/volt/pitch/gold/flare/**lime** (the logo "+").
  Geist + Space Grotesk. Motion = one ease-out curve, reduced-motion safe.
- **Real cinematic imagery** (founder-provided, optimized to WebP): **hero** =
  night stadium (treated, legible), **CTA** = wide stadium, **leaderboard** = globe
  of nations, **OG** = globe crop. Via `components/atmosphere/CinematicImageLayer`.
  All procedural/"fake" atmosphere was **removed** (see DECISIONS D-018/D-019).
- **Soul/broadcast accents:** eyebrow ticks, host identity ("EE. UU. · CANADÁ ·
  MÉXICO · 2026"), "Mundial 2026" broadcast corner, subtle ambient.

## Hero state ✅
Photo-first: real night-stadium base + left/bottom legibility scrims + brand grade +
vignette → the official logo, eyebrow, headline (gradient sheen), CTAs, feature
chips, the **real featured opener card** (Mexico vs South Africa, Group A, Jun 11),
the live **countdown** to kickoff, and the host line. Legible + cinematic.

## Real-data state ✅ (free, cache-first, graceful)
- **openfootball** (`lib/football/openfootball.ts`): real WC2026 fixtures (teams,
  groups, dates, venues), zero API key, cache-first (revalidate 6h), **mock
  fallback** if unreachable. `getHomeMatches()` → opener + 4 marquee.
- **Model probabilities** from team-strength Elo (`lib/football/model.ts`) — honest
  "the model's view", not odds.
- **football-data.org** (`lib/football/football-data.ts`): real standings/form
  enrichment, **built but env-gated** (`COPILOT_SOURCE=live` + `FOOTBALL_DATA_API_KEY`).
  No key → graceful no-op.
- Homepage shows real teams (MEX, RSA, BRA, MAR, ENG, CRO, NED, JPN, ARG, ALG…).

## Copilot ("The Analyst") state ✅ (V1, no paid LLM)
- Deterministic engine (`lib/copilot/engine`): signals (Elo, form, xG-proxy/Poisson,
  H2H, market de-vig, community, **home/host**) → weighted log-linear blend →
  P(H/D/A) + confidence + drivers. Pure, testable.
- Templated i18n insights (`lib/copilot/insights.ts`); `AnalystCard` on the homepage
  analyzes the **real opener** via `insightFromStrengths` (elo + host → honest
  "moderate confidence", real drivers, no fabricated odds/community).
- Sources adapter layer (`lib/copilot/sources`): mock (active) · football-data
  (gated) · api-football (prepared stub).

## What's NOT built yet ⏳
Backend / accounts / persistence (Supabase, auth, profiles, real wallet & scoring,
real leaderboard — currently **mock**), the **3D Globe**, social/leagues/friends,
live match experience, shareable cards, notifications, tests, deploy. Analyst odds
are **modeled** until a football-data key is added. See [NEXT_PHASES.md](NEXT_PHASES.md).

## Known caveats
- pnpm via Corepack (PATH note above).
- Headless preview can't reliably screenshot (backgrounded tab / WebGL) — verify
  visuals in a real browser.
- A **logo variant** ("PREDICT. PLAY. WIN.", white F90+ + lime trophy) exists but
  was **not** adopted; gold-trophy remains primary pending founder decision.
- No automated tests yet; no LICENSE yet.

## Where to resume
**Product vision is CANONICAL** — read [PROJECT_VISION.md](PROJECT_VISION.md) +
[EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md): the "living World Cup" model (one **world**
· **identity** · **economy** · **time**, with Momentum/Heat, Discovery, Narrative-AI,
Country hubs) — decisions **D-024** (model), **D-025** (own-IP players), **D-026**
(non-punitive elimination).
**Active build: the World Cup Globe hero** — direction **LOCKED + validated** (desktop +
mobile); build to **[GLOBE_HERO_SPEC.md](GLOBE_HERO_SPEC.md)** (D-022/D-023) with
`react-globe.gl` + **vendored** assets (no runtime CDN). **Pre-Phase-1 order:** hero
production-ready → connect domain → metadata/social/loading/perf → Phase 1 definition.
Visual north star: [VISUAL_DIRECTION.md](VISUAL_DIRECTION.md). Assets:
[ASSETS_STATE.md](ASSETS_STATE.md).
