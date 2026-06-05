# F90+ — Phase 2 Handoff (Predictions Core & Scoring)

> **✅ PHASE 2 (Predictions Core & Scoring) — CODE-COMPLETE · DoD-PASSED · REVIEWED — on branch `feat/phase-2-predictions`.**
> Gates: **243 Vitest** · `tsc --noEmit` clean · `next build` green · **i18n ES/EN parity 343/343** · vocab law D-037 upheld · zero forbidden patterns (`any`/`@ts-ignore`/`console.*`/`ignore*Errors`). Every integrity-critical
> unit was caught/hardened by adversarial review (see "Reviews caught").
>
> **▶ NOT YET LIVE.** Going live is a **founder-gated production promotion + operator steps** — see the **Operator Runbook** below. The branch is reviewed + green but **not merged/deployed**, and the live DB/secret steps
> are the operator's (the harness denies `.env.local`/secrets, so I could not apply migrations, run the admin jobs, or render the UI with live data).
>
> Read order: this file → [DECISIONS.md](DECISIONS.md) (D-050 server-authoritative predictions · D-051 Phase 2 close + craft direction) → [SCHEMA_V1.md](SCHEMA_V1.md) → [ROADMAP.md](ROADMAP.md).

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

## ▶ OPERATOR RUNBOOK — make the loop live

**Order matters. Steps A–E get *predicting* live for the opener; F settles after matches.**

- **A — Apply migrations** `0004` then `0005` to `f90-production` (SQL Editor). Run each migration's verify queries.
- **B — Env:** set `ADMIN_SYNC_SECRET` (local + Vercel) + ensure `SUPABASE_SECRET_KEY` is available where you'll run the admin jobs (local `.env.local`, or Vercel if hitting prod).
- **C — D-035 sign-in (so users can log in to predict):** Supabase `site_url` → `https://www.f90.xyz`; redirect allow-list add apex `https://f90.xyz/**`; Resend SMTP (you've configured Resend — confirm DKIM verified + SPF propagated). Google OAuth is also wired (Phase 1) and needs no SMTP.
- **D — Promote to production:** merge `feat/phase-2-predictions` → `main` (PR), then `vercel --prod` (D-033: shared Chiribito team, root `apps/web`). *(Pre-migration the deploy is safe — `/home` graceful-degrades to the honest "fixtures preparing" state.)*
- **E — Sync fixtures (before the opener):** `POST https://www.f90.xyz/api/admin/sync-fixtures` with header `x-admin-secret: <ADMIN_SYNC_SECRET>` → expect ~**72** group-stage fixtures with probabilities. **Predicting is now live.**
- **F — Settle (after each match/matchday):** `POST …/api/admin/settle` with the same header → ingests final results from openfootball, finalizes fixtures, settles predictions → points + Tokens awarded → the ranking + standing populate. Idempotent; safe to re-run.
- **G — Verify live:** login → `/home` → predict the opener (1X2) → see it on `/predictions` → (post-match) run settle → points/Tokens credited → `/ranking` shows you.

---

## Open risks / honest caveats
- **Not visually verified with live data.** The harness denies `.env.local`/secrets, and the preview screenshot pipeline hung this session — so the implemented UI was verified by typecheck + build + unit tests + adherence to the **approved mock** + the founder's reference, **not** by a live render. First live render (post-deploy + sync) is the visual confirmation; expect a polish pass.
- **D-035 sign-in items** are required for real end-user login (founder).
- **Admin jobs are manual** (no cron yet) — the operator runs sync (pre-opener) + settle (post-match).
- Migrations applied as raw SQL (Management API / SQL Editor), no CLI history — consistent with Phase 1.
- ESLint flat-config still broken (pre-existing) — typecheck + Vitest + build are the gates.
- football-data live adapter remains dormant (openfootball is the source).

## What's NOT built (deliberately — post-loop / later phases)
- **Post-loop craft trajectory (from the founder's reference):** the sidebar app-shell, the "Analista Élite / XP" level, the trophy-photo header, and **per-outcome community sparklines** (the latter need real predictor data — honest-deferred). To be done once the loop is live + has real use (founder: "nuevas pasadas de craft" after the loop works).
- A dedicated `/world-cup` all-matches page (the `/home` "ver todos los partidos" links to the landing for now).
- Markets / Fantasy / player trading (D-042 / Phase 3) — documented-not-built.

## Resume / next
1. Operator runs the runbook (A–G) → the predict→settle→points→ranking loop is LIVE.
2. Verify the loop end-to-end in prod; capture the first real visual.
3. Then: post-loop craft/polish passes (the reference trajectory above) + Phase 3.
