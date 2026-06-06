# F90+ — Phase 2 Handoff (Predictions Core & Scoring)

> **✅ PHASE 2 (Predictions Core & Scoring) — MERGED to `main`.** PR [#4](https://github.com/F90Plus/f90/pull/4)
> merged 2026-06-05 (merge commit `2d3dc37`); the feature branch is deleted (local + remote); only `main` remains.
> Gates re-verified on `main`: **243 Vitest** · `tsc --noEmit` clean · `next build` green · **i18n ES/EN parity 343/343** ·
> vocab law D-037 upheld · zero forbidden patterns. Every integrity-critical unit was caught/hardened by adversarial
> review (see "Reviews caught").
>
> **✅ LIVE TO USERS + VERIFIED (2026-06-06, D-058).** Phase 2 is deployed to production on `https://www.f90.xyz` and
> the **predict → lock → earn loop is operational**: Supabase carries **72 fixtures + real predictions**, all four
> Vercel env vars are set, migrations `0004`/`0005`/`0006` are applied (settlement path installed — `settle_fixture`
> confirmed in prod), and the D-035 sign-in config (site_url + redirect allow-list) is in place. The operator runbook
> below was **executed**; it now reads as the recurring operational reference (run `settle` after each matchday).
>
> Read order: this file → [DECISIONS.md](DECISIONS.md) (D-050 server-authoritative predictions · D-051 Phase 2 close + craft direction · **D-053 polish pass**) → [SCHEMA_V1.md](SCHEMA_V1.md) → [ROADMAP.md](ROADMAP.md).

---

## ▶ Phase 2 Polish & Production Cohesion Pass (D-053) — code-complete, GATED

A focused "works → feels finished" pass on the shipped Phase-2 surfaces, on branch
**`feat/phase-2-polish`** (4 atomic commits; **not pushed/merged/deployed**). Narrow scope —
**no new surfaces/systems**, **D-037 vocab law intact**, **D-051 deferred craft NOT reopened**.

**What changed (by the founder's 6 areas):**
- **Navigation:** header/footer/account-menu are now auth-aware — signed-in users get real
  route links (Inicio · Predicciones · Ranking · Mi perfil), the logo returns to `/home`, the
  acquisition CTA is hidden, mobile reaches every route via the account menu, ranking rows +
  the menu link to `/u/[username]`, and the two `/#tournament` "see-all" dead-ends were removed.
  Footer is a slim utility footer when signed-in (disclaimer kept).
- **Predict flow + feedback + kickoff lock:** in-flight "Confirmando…" state · **reactive lock**
  (flips at kickoff with the tab open) · closed-market hero (no dead picker) · clearer change-pick
  (prior position stays visible + "Current" + Cancel) · lock-vs-pending distinct · real minutes
  near kickoff · pre-pick group/kickoff context.
- **Dashboard /home + cohesion:** atmosphere de-dup (transparent accent over the shared ambient;
  the old opaque layer occluded it) · score-first standing strip with a clickable-ranking
  affordance · honest always-true featured eyebrow · loading skeleton · distinct "Mis predicciones"
  empty-state (glyph + scroll-to-predict CTA) · resolved-row reveal (inline scoreline + won-row
  elevation) · AA-contrast bumps on sub-12px labels.
- **Commitment & value (D-054):** the reward is visible **before** choosing (dual points + Tokens
  F90 on each outcome), Tokens render in the currency's lime in the flow, the difficulty↔reward
  rule is explicit, and "what's at stake" is named (counts toward your record + ranking). The stake
  is **reputational, not a wager** — **free staking is deferred to Phase 3 / Economy** (a brand
  call; PHASE_3_CANDIDATES C3-7). Plus the **World Cup trophy** as a single premium aspirational
  atmosphere on /home (towering, ~7% opacity + blur + fade + gold glow — atmosphere, never a logo).

**Gates (re-verified on the branch):** `tsc` clean · **243 vitest** green · `next build` green
(no `ignore*Errors`, 23/23 static pages) · i18n ES/EN parity **356/356** · vocab law upheld.

**Close sequence — DONE (D-056):**
1. ✅ Founder verified the polish authenticated on **local :3300**.
2. ✅ **PR [#5](https://github.com/F90Plus/f90/pull/5) MERGED** → `main` = `372072c` (feature branch deleted; only `main`; tree clean).
3. ✅ **`vercel --prod`** → `dpl_DNiLgBUgPKNAUcy5MXpyBQbor4rS` (READY) aliased **`https://www.f90.xyz`** — deployed
   **autonomously per D-055** (merge→deploy when the quality bar is met).
4. ✅ **Prod-verified (HTTP):** `worldcup/trophy.webp` → 200 (proof the polish is live) · landing ES/EN → 200 ·
   `/home`·`/predictions`·`/ranking` → 307 → `/login` · `/u/[unknown]` → 404. The authenticated polish lands on
   `www.f90.xyz` (auth works there) — first founder visual when logged in.

**Phase 2 (core PR #4 + polish PR #5) = COMPLETE · DEPLOYED · LOOP LIVE + VERIFIED (D-058).** The operator runbook
has been executed (migrations `0004`/`0005`/`0006` applied · env set · D-035 sign-in configured · fixtures synced),
the predict→lock→earn loop is operational in production, and the settlement path is installed (`settle_fixture`
confirmed). The only recurring operator action is **`POST /api/admin/settle` after each matchday** (idempotent).
Phase-3 candidates (do not implement before Phase 3): [PHASE_3_CANDIDATES.md](PHASE_3_CANDIDATES.md); readiness
gate: [PHASE_3_READINESS.md](PHASE_3_READINESS.md). **Next = Phase 3 (Economy: Market + Fantasy XI).**

## What was built — the full loop

**predict → lock at kickoff → settle → points + Tokens → ranking.** Honest, no-betting, no fake community.

| Task | Delivered | Commit |
| --- | --- | --- |
| **P2-1** | Migration `0004`: `fixtures` + `predictions` + RLS lock-at-kickoff + **`make_prediction` SECURITY DEFINER RPC** (server-authoritative; clients SELECT-only) + `prediction_kind` enum | `63c5561` · `f509042` |
| **P2-2** | openfootball→`fixtures` mapper (+ model probabilities stored on the fixture) + **`/api/admin/sync-fixtures`** (secret-guarded, service-role upsert; re-sync never clobbers settled state) | `982b763` · `e179426` |
| **P2-3** | `lib/scoring.ts` — difficulty-honest points (TS twin of the SQL: `clamp(round(20/prob),10,500)`) | `a637f1a` |
| **P2-4** | `makePrediction` Server Action (→ RPC) + read-model queries (`getPredictableFixtures`/`getUserPredictions`, graceful-degrade to `[]`) + validation | `e09c347` · `a12d272` |
| **P2-5** | **Predict card** + **position ticket** — real flags, optimistic 1X2, El Analista/Contrario stance, lock + settled states | `c52587a` · `96240ef` |
| **P2-6** | Premium post-login **`/home` hub** — standing strip + featured predict card + upcoming grid + "Mis predicciones" strip + subtle WC atmosphere + intentional branding; **graceful-degrades (no 500) pre-migration** | `eb3450c` |
| **P2-9** | **`/predictions`** page (Activas + Resueltas) | `a28966f` |
| **P2-8** | Migration `0005`: **`settle_fixture` SECURITY DEFINER** (atomic, idempotent, awards the stored `points_possible` via `award_*`) + **`/api/admin/settle`** (ingests openfootball `score.ft` → finalizes → settles) | `e9d9f01` |
| **P2-10** | **`/ranking`** global leaderboard (real `global_rankings`, current-user highlight, honest empty board) + verified the teaser/standing real-data wiring | `c1c2c90` |

## Architecture — server-authoritative, drift-free, honest

- **Predictions are server-authoritative (D-050).** Clients get **SELECT only** on `predictions`; the **sole write path** is `make_prediction()` (SECURITY DEFINER), which validates the user, enforces the kickoff lock, reads the fixture's stored model probability, and computes `points_possible` server-side — clients can't inflate it.
- **Settlement awards the stored `points_possible`** (set at pick time) — **no scoring re-computation at settlement = zero drift**. `settle_fixture()` is atomic (one transaction; `award_*` run inside it → mid-failure rolls back) + idempotent (`settled_at is null` + `FOR UPDATE` → at-most-once even under re-run/concurrency) + `service_role`-only.
- **The market is El Analista** (the real model) pre-community; **consensus vs contrarian = you vs the Analyst's lean** (challenging it pays more, by the honest scoring). Crowd-split / live-activity / probability-movement layers are **designed but honest-deferred** until real predictors exist — no fabricated counts/sparklines (avoids the documented dark patterns).
- **Admin jobs** (`/api/admin/sync-fixtures`, `/api/admin/settle`) are secret-guarded (`ADMIN_SYNC_SECRET`, timing-safe, fail-closed) + use the service-role client. Manual for the MVP; a Vercel Cron is the natural later step.

## Reviews caught (the rigor paid off)
- **CRITICAL:** `prediction_kind` enum was never created in Phase 1 → migration `0004` would not apply. Fixed.
- **IMPORTANT:** clients could write `points_possible`/`settled_at`/`awarded_*` directly (leaderboard-integrity hole) → re-architected to the server-authoritative RPC (D-050).
- **IMPORTANT:** re-running the fixtures sync would reset a settled fixture's `status` back to `upcoming` → removed `status`/`source` from the upsert payload.
- Settlement adversarially reviewed: no double-award, no self-award/privilege escape, no partial-settlement.

## Migrations to apply (operator, Supabase `f90-production`)
1. `apps/web/supabase/migrations/20260605000004_predictions.sql` — fixtures + predictions + RLS + `make_prediction` + `prediction_kind` enum.
2. `apps/web/supabase/migrations/20260605000005_settlement.sql` — `settle_fixture`.

Apply via the Supabase SQL Editor (or the Management API + PAT, as Phase 1's 0001–0003 were). The SQL files are the source of truth. Verify queries are in each migration's `supabase/README.md` section.

## Environment
- **Already set (Phase 1):** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Vercel Prod + Preview).
- **Add for the admin jobs:** `SUPABASE_SECRET_KEY` (in `.env.local` already; add to Vercel Prod for the admin routes to run there — OR run the admin routes locally where `.env.local` has it) + **`ADMIN_SYNC_SECRET`** (NEW — generate `openssl rand -hex 32`; set in `.env.local` + Vercel Prod). Documented in `.env.example`.

---

## ✅ OPERATOR RUNBOOK — EXECUTED (loop live; kept as the recurring reference)

**Status (2026-06-06, D-058): A–E DONE — predicting is live (72 fixtures synced, real predictions in); the
settlement path (0005 `settle_fixture`) is installed. F (settle) is the recurring per-matchday action; G verified.
Steps are kept below as the operational reference for re-running settle.**

- **A — Apply migrations** `0004` then `0005` to `f90-production` (SQL Editor). Run each migration's verify queries.
- **B — Env:** set `ADMIN_SYNC_SECRET` (local + Vercel) + ensure `SUPABASE_SECRET_KEY` is available where you'll run the admin jobs (local `.env.local`, or Vercel if hitting prod).
- **C — D-035 sign-in (so users can log in to predict):** Supabase `site_url` → `https://www.f90.xyz`; redirect allow-list add apex `https://f90.xyz/**`; Resend SMTP (you've configured Resend — confirm DKIM verified + SPF propagated). Google OAuth is also wired (Phase 1) and needs no SMTP.
- **D — ✅ Branch merged to `main`** (PR #4, merge `2d3dc37`). Remaining: **`vercel --prod`** (D-033: shared Chiribito team, root `apps/web`). *(Pre-migration the deploy is safe — `/home` graceful-degrades to the honest "fixtures preparing" state.)*
- **E — Sync fixtures (before the opener):** `POST https://www.f90.xyz/api/admin/sync-fixtures` with header `x-admin-secret: <ADMIN_SYNC_SECRET>` → expect ~**72** group-stage fixtures with probabilities. **Predicting is now live.**
- **F — Settle (after each match/matchday):** `POST …/api/admin/settle` with the same header → ingests final results from openfootball, finalizes fixtures, settles predictions → points + Tokens awarded → the ranking + standing populate. Idempotent; safe to re-run.
- **G — Verify live:** login → `/home` → predict the opener (1X2) → see it on `/predictions` → (post-match) run settle → points/Tokens credited → `/ranking` shows you.

---

## Open risks / honest caveats
- **Live now with real users** (72 fixtures · real predictions in prod). The original UI was verified by gates + the approved mock, not a session live-render — so the **first authed visual capture + a craft/polish pass** are the natural next product step (see [PRODUCT_OBSERVATIONS.md](PRODUCT_OBSERVATIONS.md)).
- ✅ **D-035 sign-in configured** (site_url + redirect allow-list). Resend SMTP for magic-link at scale = recommendation (Google OAuth already works); confirm if magic-link is a launch channel.
- **Admin jobs are manual** (no cron yet) — the operator runs sync (pre-opener) + settle (post-match).
- Migrations applied as raw SQL (Management API / SQL Editor), no CLI history — consistent with Phase 1.
- ✅ ESLint flat-config **FIXED** (D-057): `pnpm lint` is green (0 problems) — now a 4th gate alongside typecheck + Vitest + build.
- football-data live adapter remains dormant (openfootball is the source).

## What's NOT built (deliberately — post-loop / later phases)
- **Post-loop craft trajectory (from the founder's reference):** the sidebar app-shell, the "Analista Élite / XP" level, the trophy-photo header, and **per-outcome community sparklines** (the latter need real predictor data — honest-deferred). To be done once the loop is live + has real use (founder: "nuevas pasadas de craft" after the loop works).
- A dedicated `/world-cup` all-matches page (the `/home` "ver todos los partidos" links to the landing for now).
- Markets / Fantasy / player trading (D-042 / Phase 3) — documented-not-built.

## Resume / next
1. ✅ Runbook executed → the predict→lock→earn loop is LIVE in prod (D-058); settlement path installed.
2. Recurring: `POST /api/admin/settle` after each matchday (post-opener 11 Jun) → points/Tokens + ranking populate.
3. Product: the prediction-card UX-clarity initiative — see [PRODUCT_OBSERVATIONS.md](PRODUCT_OBSERVATIONS.md).
4. Next milestone: Phase 3 (Economy) — readiness gate in [PHASE_3_READINESS.md](PHASE_3_READINESS.md).
