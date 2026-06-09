# F90+ — STATE.md  ·  START HERE

> **Single entry point to resume F90+ via GSD.** This `.planning/` folder is the **single source
> of truth** and is **self-sufficient**: a brand-new session starts from these files alone, with
> **no dependency on any prior chat or external memory**. Read order:
> **`STATE.md` (this)** → `PROJECT.md` → `REQUIREMENTS.md` → `ROADMAP.md` → `OPERATIONS.md` (runbook, reference).
>
> ⚠️ **FRESHNESS:** this snapshot is dated **2026-06-09**. Git/production/data drift over time.
> **Before trusting the facts below, run the read-only re-verification in `OPERATIONS.md §8`** and
> update this file if anything changed. Treat dated/“live” statements as *as-of-snapshot*, not eternal.

---

## ▶ Active GSD position

- **Milestone:** *Tournament-Live Hardening → Economy* (phases H1–H10, see `ROADMAP.md`).
- **Next phase to execute:** **H1 — Tournament Operations Safety Net** (P0, **not started**).
- **Cold-start entry (recommended):**
  1. Orient: run **`gsd-progress`** (reads `.planning/` and reports where the project is).
  2. Begin the phase: **`gsd-discuss-phase H1`** → `gsd-plan-phase H1` → `gsd-execute-phase H1` →
     `gsd-verify-work` → `gsd-ship`. *(Bounded autonomous alternative once H1 is discussed+planned:
     `gsd-autonomous` — gates ON.)*
  - **If a GSD command asks for a numeric phase:** H1 = phase 1 of this milestone, H2 = phase 2, …
    (the `H#` id maps to its ordinal). `.planning/` here is hand-authored to be GSD-compatible and
    human-readable; if a command can't auto-resolve the phase, point it at `H1`/phase 1 in `ROADMAP.md`.
- **Command naming:** canonical GSD commands are **hyphenated** (`gsd-discuss-phase`, `gsd-plan-phase`, …).
  There is **no** `/gsd:` colon form and no bare `/gsd`.

## Phase progress tracker (update this every session)

> The live ledger of milestone progress. When a phase finishes (verified + shipped), set its status
> to ✅ and add the commit/PR. GSD execution writes per-phase artifacts under `.planning/phases/<id>/`
> (PLAN.md, VERIFICATION.md, …) — expect that folder to appear once execution starts.

| Phase | Title | Priority | Status | Gating | Notes |
|-------|-------|----------|--------|--------|-------|
| **H1** | Tournament Operations Safety Net | P0 | ⬜ not started | — | **NEXT.** Cron settle/sync · migration 0007 · observability · first live settlement |
| H2 | Money-Path Test Harness | P0 | ⬜ not started | H1 (0007 shape) | integration + ephemeral-Postgres runtime tests |
| H3 | CI/CD Automation | P1 | ⬜ not started | H2 | `.github/workflows/ci.yml` (4 gates + migrations + coverage) |
| H4 | Deploy Governance & Isolation (D-033) | P1 | ⬜ not started | DEC-5 (founder) | git-connect / isolate Vercel · `vercel.json` · LICENSE · Node pin |
| H5 | Predict-Card UX Clarity Pass (OBS-001) | P1 | ⬜ not started | H1 (live data) | outcome = focal action; D-037 binding; craft bar |
| H6 | Frontend Coherence & A11y Sweep | P1 | ⬜ not started | — | `vs` literal · dup `#tournament` id · reduced-motion · 404 h1 · aria |
| H7 | Phase 3: Player Market + Fantasy XI | P2 | 🔒 gated | DEC-1..4 (founder) + H1–H3 | next PRODUCT milestone; split market→fantasy |
| H8 | Rate-Limiting & Abuse Hardening | P2 | ⬜ not started | H4 (WAF) opt. | throttle admin/auth/`make_prediction` |
| H9 | Test Infrastructure Depth | P2 | ⬜ not started | H3 | `.tsx` tests + coverage threshold |
| H10 | Deferred Craft Trajectory & Polish | P3 | ⬜ not started | H5 | app-shell · realtime settle · share-profile · polish backlog |

Status legend: ⬜ not started · 🟡 in progress · ✅ done · 🔒 gated on a founder decision.

## Repository state (git-verified 2026-06-09)

- **Repo:** `F90Plus/f90` (own isolated GitHub org). Branch **`main`**; **only `main` exists**; **working tree clean**.
  The pre-planning HEAD (the code/docs state this audit is based on) is **`11ce22c`** (== `origin/main`).
- **Last code/docs commits (pre-planning):** `11ce22c`/`affd4d8`/`05abe6d` = docs (D-058/D-059 closeout) · `dca4431` = merge PR #6 (D-057).
- **✅ `.planning/` is COMMITTED** — a single clean docs commit on `main`, on top of `11ce22c`
  (`docs(planning): add GSD .planning/ system as single source of truth`, 5 files). **Local `main` is one
  commit ahead of `origin/main`; the `.planning/` commit is NOT pushed** (push is founder-gated).
- **This planning pass touched only** `.planning/*.md`. **No application code, no PR, no deploy.**

## Production state — LIVE (as-of 2026-06-09)

- **Live:** `https://www.f90.xyz` (apex `f90.xyz` 308→www, SSL active). Last prod deploy under D-057:
  `dpl_EUUmCUnERCtQfft7BTf8MBXCBw27` (READY).
- **Vercel:** project `f90` in team `chiribito293-7173s-projects` (**shared with Chiribito — D-033,
  open governance item → H4**), **manual `vercel --prod`**, root `apps/web`, **not git-connected**.
- **Supabase:** `f90-production` (ref `upelxcxnpmmbhivrazle`, eu-west-1, **isolated**, ACTIVE_HEALTHY).
  Migrations `0001`–`0006` applied + verified. Vercel env: all 4 active vars set (2 public + `SUPABASE_SECRET_KEY`
  + `ADMIN_SYNC_SECRET`). D-035 sign-in configured (site_url + redirect allow-list).
- **Loop status:** predict → lock-at-kickoff → earn is **operationally LIVE** (72 fixtures + real
  predictions in prod). **Settlement is INSTALLED** (`settle_fixture` present) but, as of snapshot,
  **had not run live** (no finished match yet) and is **fired manually**. **World Cup opener: 2026-06-11.**
  > If you are reading this **on/after 2026-06-11**: first re-verify whether settlement has run (OPERATIONS §8).
  > If finished matches exist but the ranking is empty, settlement is the pending operator action — and Phase
  > **H1** (which automates + verifies it) is even more urgent.

## Quality gates (verified by the audit, 2026-06-09)

`typecheck` clean · `lint` clean (0 problems) · `build` green (no `ignore*Errors`) · **243 Vitest**
(all pure-logic) · i18n parity **357/357** (counted live). **No CI runs these** — manual until H3 (R2).
Exact commands: `OPERATIONS.md §2`.

## Codebase shape

pnpm monorepo; app = **`apps/web`** (`packages/` reserved). Stack: Next.js 16.2.7 · React 19 · TS strict
(`noUncheckedIndexedAccess`) · Tailwind v4 · Framer Motion · next-intl (es default + en) · Supabase
(`@supabase/ssr`). DB = SQL migrations `0001`–`0006`. Full path map + commands: `OPERATIONS.md`.

---

## Audit verdict (post-2026-06-09)

**The product is healthy and live; the risk is the engineering safety net around a live economy as the
tournament starts.** Four parallel static audits → **zero P0 in product / security / data**.

| Domain | Verdict | Headline findings |
|--------|---------|-------------------|
| Product | ✅ strong | Phases 0–2 done + live; only "partial-by-design" honest previews (markets/fantasy teasers). #1 concern = predict-card UX clarity (OBS-001 → H5). |
| Frontend/UX/i18n/a11y | ✅ excellent | i18n parity 357/357; tokens disciplined. Minor: `vs` literal, duplicate `#tournament` id, reduced-motion Framer gap, 404 `<h1>`, "Rank N" aria-label (→ H6). |
| Backend/security | ✅ sound | Server-authoritative economy; `getUser()` everywhere; admin jobs timing-safe + fail-closed. **`updateSession` cookie bug FIXED** (D-049/`c4dee71`). Only gap: no rate-limiting (→ H8). |
| Database | ✅ server-authoritative | RLS complete; settlement idempotent; scoring TS↔SQL parity. Harden: ledger unique index + prob CHECK + dedup bonus source (→ H1). |
| Testing/CI/Perf | 🔴 weakest | **No CI** (→ H3); **money paths untested** (→ H2); no monitoring (→ H1); manual deploy/shared team (→ H4); no LICENSE; `.tsx` tests off (→ H9). |

## Risk register

| # | Risk | Sev | Phase |
|---|------|-----|-------|
| R1 | Settlement manual + untested + unmonitored, tournament starting **2026-06-11** | 🔴 | H1 |
| R2 | No CI — a broken commit/deploy can reach `main`/prod with no automated gate | 🔴 | H3 |
| R3 | Money paths (RPC/RLS/admin) have no executable coverage | 🟠 | H2 / H9 |
| R4 | Production blind (no error-tracking/analytics/CWV) | 🟠 | H1 |
| R5 | D-033: Vercel team shared with Chiribito + manual deploy (isolation invariant violated at team level) | 🟠 | H4 |
| R6 | DB integrity: no ledger unique index, no prob CHECK (double-award representable if a new path appears; bad sync can block predicting) | 🟠 | H1 |
| R7 | No rate-limiting on admin/auth/predict endpoints | 🟡 | H8 |
| R8 | Phase 3 gated on the free-staking brand decision (sportsbook-drift risk) — strategic, not technical | 🟡 | DEC-1 → H7 |
| R9 | Minor debt: no LICENSE, `.nvmrc`≠`engines`, non-reproducible image script, dual bonus source, `vs` literal, dup id | 🔵 | H4/H6/H10 |
| R10 | **Stale global memory:** the `updateSession` deviation is FIXED (D-049/`c4dee71`) but external memory may still flag it latent — do not re-introduce it as a "bug to fix" | 🔵 | (memory note) |

## Open founder decisions (gates) — see REQUIREMENTS §E

DEC-1 free staking · DEC-2 market model · DEC-3 Fantasy v1 scope · DEC-4 Founding Squad ·
DEC-5 Vercel isolation · DEC-6 Resend SMTP. **None block H1–H6.** DEC-1..4 gate **H7**; DEC-5 gates **H4**;
DEC-6 is non-blocking (Google OAuth works).

## Standing invariants (binding — full list + rationale in PROJECT.md)

Total isolation · dual-surface parity (D-021) · premium-not-casino · WC2026 identity · social-first ·
**free / no-betting / no-pay-to-win** · clean & scalable · **English product + no hardcoded copy** ·
no paid LLM/data · tokens-over-hardcoding · tool-agnostic/portable · **craft bar D-020 (premium-or-don't-ship)** ·
**D-037 probability-NOT-odds + the no-betting vocabulary law**.

## What NOT to touch (carry-forward)

The identity/auth/economy schema + RLS + `award_*` (server-authoritative, generic, anti-cheat) · the live
predict/settle loop · the Analyst Center landing (D-041) + vocab law (D-037) · the rankings teaser contract ·
the design tokens + the 11 invariants · the deployed auth surfaces. Do **not** re-open the D-042 dashboard /
advanced Fantasy / player-market as "polish" — they are future, documented-not-built (H7+).

## Operating rules for execution sessions

- **Never** push/PR/deploy without explicit founder go (deploy = manual `vercel --prod`, D-033; autonomous
  merge→deploy allowed only when the D-055 quality bar is met).
- **Never** store/print/commit secrets (Supabase keys, `ADMIN_SYNC_SECRET`, `SUPABASE_ACCESS_TOKEN`).
- Every change clears the Definition of Done (PROJECT.md / OPERATIONS §2) before it is "done".
- Conversation in **Spanish**; code/commits/docs in **English**.

---

## Resume checklist (a future session, cold)

1. Read `STATE.md` (this) → `PROJECT.md` → `REQUIREMENTS.md` → `ROADMAP.md`; keep `OPERATIONS.md` open as the runbook. ✅ self-sufficient.
2. **Re-verify freshness** (OPERATIONS §8): confirm branch/HEAD/migrations/prod still match this snapshot; update STATE if not.
3. *(Recommended)* push `.planning/` to `origin/main` when the founder approves (it is committed locally, not pushed).
4. Update the **Phase progress tracker** as you work.
5. Start the milestone at **H1**: `gsd-progress` to orient → `gsd-discuss-phase H1`.
6. Honor the invariants + the "What NOT to touch" list.
