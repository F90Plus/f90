# F90+ — REQUIREMENTS.md

> Consolidated **functional**, **technical**, and **operational** requirements, derived from
> the codebase, `docs/` and the ADR log (`docs/DECISIONS.md`), captured during the GSD
> Planning Architect audit (2026-06-09). Status: ✅ met · 🟡 partial · ⏳ planned · ❌ gap.
> Each requirement maps to roadmap phases in `ROADMAP.md`. Read order: `STATE.md` → `PROJECT.md`
> → this → `ROADMAP.md` → `OPERATIONS.md`.
>
> ⚠️ **Freshness:** statuses are *as-of 2026-06-09*. Some (e.g. FR-8 settlement, i18n counts) shift as
> the tournament runs and phases land — re-verify via `OPERATIONS.md §8` before relying on a status.

---

## A. Functional requirements

| ID | Requirement | Status | Notes / phase |
|----|-------------|--------|---------------|
| FR-1 | **Identity & auth** — magic-link + Google sign-in (`@supabase/ssr`, cookie sessions), dual-mode callback, locale-safe redirects, passwordless login = signup | ✅ | Phase 1 / D-030, D-035 |
| FR-2 | **Onboarding** — username (citext, unique, regex) + favourite country; 30-day change cooldown | ✅ | Phase 1 / D-031 |
| FR-3 | **Public profile** `/u/[username]` with dynamic **localized** OG image; own-IP avatar token (no photos) | ✅ | Phase 1 / D-025, D-031 |
| FR-4 | **Settings** — change username/country under cooldown, bio (≤280) | ✅ | Phase 1 |
| FR-5 | **Server-authoritative economy** — wallet + append-only `coin_ledger`/`score_ledger` + `award_*`; welcome bonus **20,026 Tokens F90** | ✅ | Phase 1 / D-027, D-039 |
| FR-6 | **Predictions (1X2)** — predict before kickoff, optimistic UI, **lock at kickoff**, sole write path = `make_prediction` RPC | ✅ | Phase 2 / D-050 |
| FR-7 | **Difficulty-honest scoring** — `clamp(round(20/prob),10,500)`; underdog-correct = more points; TS twin of SQL | ✅ | Phase 2 |
| FR-8 | **Settlement** — server-side `settle_fixture` (atomic, idempotent) awards stored `points_possible` via `award_*`; ingests openfootball results | ✅ (installed) | Phase 2 / D-058. *Never run live yet (no finished match) → H1* |
| FR-9 | **My predictions** `/predictions` (active + resolved) | ✅ | Phase 2 |
| FR-10 | **Global ranking** `/ranking` over real `global_rankings` view; honest empty-state | ✅ | Phase 1/2 / D-043 |
| FR-11 | **Tournament Center** — Field Is Set / Groups / Bracket / Key Matches, from one cache-first openfootball read | ✅ | Phase 0.6 / D-032 |
| FR-12 | **3D World Cup globe hero** — real states (gold hosts / green qualified), perf-hardened, reduced-motion safe | ✅ | Phase 0 / D-022, D-023 |
| FR-13 | **Deterministic Copilot ("The Analyst")** — 8-signal log-linear engine → P(H/D/A) + confidence + drivers; no LLM | ✅ | Phase 0 / D-005 |
| FR-14 | **Bilingual ES/EN** — every user-facing string in `locales/`; localized OG; locale routing `as-needed` | ✅ | D-003 |
| FR-15 | **Predict-card UX clarity** — outcome choice must be the dominant, instantly-scannable action (clarity, never wager framing) | ❌ gap (observed) | OBS-001 → **H5** |
| FR-16 | **Player market** — own-IP cards, dynamic probability-framed prices, buy/sell with Tokens | ⏳ | Phase 3 → **H7** |
| FR-17 | **Fantasy XI** — squads, lineups, captain, real-performance points | ⏳ | Phase 3 → **H7** |
| FR-18 | **Founding Squad** ("Pack Fundación") — equal-net-worth starter squad at onboarding | ⏳ (designed) | D-040, Phase 3 |
| FR-19 | **Rankings/leagues/reputation** — by-country + time-boxed boards, private leagues, streaks | ⏳ | Phase 4 (horizon) |
| FR-20 | **Live narrative / momentum / live tracking / shareable cards / notifications / PWA** | ⏳ | Phases 5–7 (horizon) |

## B. Technical requirements

| ID | Requirement | Status | Notes / phase |
|----|-------------|--------|---------------|
| TR-1 | Next.js 16 App Router, RSC-first; `'use client'` only at leaves | ✅ | — |
| TR-2 | TypeScript strict + `noUncheckedIndexedAccess`; **no `ignore*Errors`** in build | ✅ | verified |
| TR-3 | Tailwind v4 CSS-first tokens; **no hardcoded design values** | ✅ | minor residuals → H6 |
| TR-4 | i18n parity ES=EN (currently **357/357**); no hardcoded copy | 🟡 | 1 `vs` literal + 1 aria-label → **H6** |
| TR-5 | RLS on every table; clients SELECT-only on money tables; writes via `SECURITY DEFINER` only | ✅ | verified |
| TR-6 | Session validation via `auth.getUser()` everywhere (never `getSession()`); server-side `(app)` gate | ✅ | verified |
| TR-7 | Middleware refreshes session cookies to **both** request + response (`@supabase/ssr` contract) | ✅ | **FIXED** D-049/`c4dee71` (memory note stale) |
| TR-8 | Adapters cache-first + degrade gracefully (never throw to user) | ✅ | verified |
| TR-9 | DB integrity: unique index on ledgers `(ref_type,ref_id,kind)` for awards | ❌ gap | **H1** (migration 0007) |
| TR-10 | DB integrity: `CHECK (prob_* between 0 and 1)` on `fixtures` | ❌ gap | **H1** (migration 0007) |
| TR-11 | Single source for welcome-bonus value (dedup `handle_new_user` across 0001/0003) | 🟡 | **H1** |
| TR-12 | Reduced-motion honored globally (incl. Framer entrance variants) | 🟡 | **H6** (`<MotionConfig reducedMotion="user">`) |
| TR-13 | Valid HTML (no duplicate DOM ids); 404 has an `<h1>` | 🟡 | **H6** (`#tournament` dup) |
| TR-14 | Heavy 3D code-split (`dynamic ssr:false`), error-boundaried, DPR-capped ≤1.6 | ✅ | verified |
| TR-15 | Reserved route namespaces `/markets/*`, `/players/[slug]`, `/fantasy/*`, `/nations/[code]/*` kept free | ✅ | D-038 |

## C. Operational requirements

| ID | Requirement | Status | Notes / phase |
|----|-------------|--------|---------------|
| OR-1 | **CI** runs typecheck + lint + test + build on every push/PR (frozen lockfile) | ❌ gap | **H3** (no `.github/` exists) |
| OR-2 | **Money-path tests** — integration tests for `makePrediction`, `/api/admin/settle`, server actions | ❌ gap | **H2** |
| OR-3 | **Runtime migration/RLS verification** — apply migrations to ephemeral Postgres in CI | ❌ gap | **H2 / H3** |
| OR-4 | **Settlement automation** — Cron fires `sync-fixtures` (pre-matchday) + `settle` (post-matchday), idempotent, alerting | ❌ gap | **H1** (currently manual) |
| OR-5 | **Observability** — error tracking + analytics + Core Web Vitals in production | ❌ gap | **H1** (currently blind) |
| OR-6 | **Deploy governance** — preview per PR + gated prod; F90+ isolated from the Chiribito Vercel team | ❌ gap | **H4** (D-033) |
| OR-7 | **Rate limiting** on admin/auth/`make_prediction` endpoints | ❌ gap | **H8** |
| OR-8 | **Coverage tooling** — `.tsx` enabled in Vitest + coverage threshold | ❌ gap | **H9** |
| OR-9 | **LICENSE** present before any public/open release | ❌ gap | **H4** |
| OR-10 | **Node version pinned consistently** (`.nvmrc` 24 ↔ `engines.node`) | 🟡 | **H4** |
| OR-11 | **Reproducible asset scripts** (`optimize-images.py` must not read `~/Downloads`) | 🟡 | **H10** |
| OR-12 | **Secrets** never stored/committed/printed; `SUPABASE_SECRET_KEY` server-only; document `SUPABASE_ACCESS_TOKEN` as CLI-only | ✅ / 🔵 | hygiene note → H4 |

## D. External dependencies

- **Supabase** `f90-production` (ref `upelxcxnpmmbhivrazle`, eu-west-1, isolated) — Postgres, Auth, RLS.
- **Vercel** — hosting; project `f90` in team `chiribito293-7173s-projects` (shared, D-033),
  **manual `vercel --prod`**, root `apps/web`, not git-connected.
- **openfootball/worldcup.json** — zero-key WC2026 fixtures/groups/bracket (cache-first 6h).
- **football-data.org** — env-gated enrichment adapter (dormant in V1).
- **Resend SMTP** — recommended for magic-link at scale (Google OAuth already works) — founder/dashboard item.
- **Vercel Cron** (to be added, H1) — scheduled `sync-fixtures` + `settle`.

### D.1 Implicit dependencies (not obvious — surfaced by the audit, must be chosen during discuss-phase)

- **H1 · Vercel Cron capability** — scheduled functions require a Vercel plan/config that supports cron on the
  `f90` project; confirm before designing the schedule. Cron + reliable deploy are smoother after **H4** (git-connect).
- **H1 · Observability vendor** — error tracking + analytics + CWV need a chosen provider (e.g. Sentry + `@vercel/analytics`
  + `@vercel/speed-insights`); none is wired today (the app ships zero monitoring deps).
- **H2/H3 · Ephemeral Postgres mechanism** — runtime RLS/function tests need one (Testcontainers, `supabase` local, or
  pg-in-Docker); the repo has **no** local DB harness today. This is a hard prerequisite to "test the SQL at runtime".
- **H7 · Player-data adapter** — Fantasy/market need real rosters + per-match stats (`API_FOOTBALL_KEY` reserved,
  D-006/D-010); the adapter is scaffolding-only today.
- **H8 · Rate-limit backend** — needs Vercel WAF or an Upstash (or equivalent) store; none configured.
- **Cross-cutting · Founder credentials** — Supabase dashboard items (Resend SMTP, allow-lists), Vercel team/billing
  decisions, and any new public commitment are **founder-owned**; an execution session cannot complete them itself.

## E. Founder decisions required (gates)

| ID | Decision | Blocks | Ref |
|----|----------|--------|-----|
| DEC-1 | **Free staking** — adopt / reject / reframe (sportsbook-drift risk; studio recommends NOT as a risk gesture) | staking-dependent parts of **H7** | D-054 / D-059 §D |
| DEC-2 | **Market model** — Polymarket-style AMM vs simple order/price | **H7** design | D-034 |
| DEC-3 | **Fantasy v1 scope** — full squad+XI+market vs thin first slice | **H7** scope | ECOSYSTEM_VISION O-3 |
| DEC-4 | **Founding Squad** — ship at onboarding or defer | **H7** | D-040 |
| DEC-5 | **Vercel isolation** — migrate `f90` to an isolated team vs accept the shared Chiribito team | **H4** | D-033 |
| DEC-6 | **Resend SMTP** — enable for magic-link at production scale | non-blocking (Google works) | D-058 |

## F. Risk register

See `.planning/STATE.md` → "Risk register" (R1–R10). The dominant risks are operational, not
product: settlement is manual/untested with the tournament starting **2026-06-11** (R1), there
is no CI (R2), and the money paths have no executable coverage (R3).
