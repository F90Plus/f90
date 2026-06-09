# F90+ — ROADMAP.md

> **Active GSD milestone: "Tournament-Live Hardening → Economy".** Phases **H1–H10**, grouped by
> priority (P0 critical → P3 polish), derived from the 2026-06-09 audit. Each phase is a GSD-executable
> unit (discuss → plan → execute → verify → ship). Product feature phases beyond this milestone are under
> **Horizon**. Phase IDs use `H#` to avoid colliding with the repo's historical product "Phase 0–7" numbering.
>
> **GSD phase id mapping:** `H1` = phase 1 of this milestone, `H2` = phase 2, … When a GSD command wants a
> numeric phase, use the ordinal. Live status of each phase is tracked in **`STATE.md` → Phase progress tracker**.
>
> **Estimate legend:** **S** = a focused part-day to ~1 day · **M** = ~1–3 focused days · **L** = multi-phase /
> a week+ (split with `gsd-mvp-phase`). Estimates are relative effort, not calendar commitments.
>
> Legend: ✅ done · ▶ active · ⬜ planned · 🔒 gated on a founder decision.
> Detail per phase: **Goal · Impact · Priority · Dependencies · Acceptance Criteria · Estimate · Verify-work**.

---

## Context — what is already done (do not re-plan)

✅ **Phase 0** Foundation · ✅ **0.5** Public launch · ✅ **0.6** Tournament Center · ✅ **1** Identity &
Accounts (auth, onboarding, profile/OG, settings, server-authoritative economy, rankings teaser) ·
✅ **2** Predictions Core & Scoring (predict→lock→settle→points/Tokens→ranking loop, **LIVE in prod**,
72 fixtures + real predictions; settlement installed). History: `docs/ROADMAP.md`, `docs/DECISIONS.md` (D-001→D-059).

## Scope guardrails for autonomous execution (read before planning any phase)

- **Stay in this milestone (H1–H10).** Do **not** open product fronts beyond **H7** without founder go.
- **Do not reopen** the D-042 dashboard / advanced Fantasy / player-market or D-051's deferred craft trajectory
  as "polish" — they are future, documented-not-built.
- **Binding on every phase:** the 11 invariants + the craft bar (D-020) + dual-surface parity (D-021) +
  **D-037 probability-not-odds / no-betting vocabulary law** + the Definition of Done. See `PROJECT.md`.
- **Founder-gated:** H7 needs DEC-1..4; H4 needs DEC-5 (REQUIREMENTS §E). Plan freely, but do not *build* a
  gated part until its decision lands.
- **No deploy/PR/push without founder go** (autonomous merge→deploy only on a met D-055 quality bar).

---

## 🔴 P0 — CRITICAL (protect the live loop; opener 2026-06-11)

### PHASE H1 — Tournament Operations Safety Net  ▶ NEXT
- **Goal:** the live predict→settle→earn loop runs reliably, observably, and without manual babysitting
  through the group stage, with no integrity risk.
- **Impact:** protects the crown-jewel live economy in the World Cup's peak window. Highest impact,
  **time-critical** — the first real settlement happens with the first finished match (opener **2026-06-11** onward).
- **Priority:** P0.
- **Dependencies:** none hard (all infra exists). Introduces migration `0007` + Cron + observability deps.
  *Implicit:* Vercel Cron requires a plan/config that supports scheduled functions (confirm on the `f90`
  project); cron + reliable deploy are smoother **after H4** (git-connect), but H1 can ship on the manual model.
- **Acceptance Criteria:**
  - Vercel Cron fires `POST /api/admin/sync-fixtures` (pre-matchday) + `POST /api/admin/settle` (post-matchday),
    idempotent, with failure alerting. *(Until cron lands, the manual fallback is OPERATIONS §5.)*
  - Migration `0007`: partial unique index on `coin_ledger`/`score_ledger (ref_type, ref_id, kind)` for prediction
    awards; `CHECK (prob_home/draw/away between 0 and 1)` on `fixtures`; annotate `0001.handle_new_user` as
    superseded by `0003` (single source for the 20,026 bonus).
  - Error tracking + analytics + Core Web Vitals active in production.
  - **First real settlement verified end-to-end** on a finished fixture; a forced re-settle proves no double-award
    (now structurally impossible via the unique index).
- **Estimate:** M.
- **Verify-work:** observe a real matchday settling; force double-settle → no double-credit; feed a malformed prob → rejected; trigger a synthetic error → captured + alerted.

### PHASE H2 — Money-Path Test Harness
- **Goal:** the integrity-critical seams (`make_prediction`, `settle_fixture`, admin routes, server actions) have
  executable tests, including runtime SQL/RLS verification.
- **Impact:** closes the single biggest coverage gap — today the parts most likely to mis-award Tokens have zero
  executable coverage (243 tests exist but are all pure-logic).
- **Priority:** P0.
- **Dependencies:** migration `0007` shape (H1) stable; runs locally before CI.
  *Implicit:* an ephemeral-Postgres mechanism is needed (e.g. Testcontainers, `supabase start`/local, or a
  pg-in-Docker harness) — pick one in discuss-phase; the repo has none today.
- **Acceptance Criteria:** red→green tests for each integrity property (kickoff lock, settled-repick rejected,
  cross-user write blocked, no double-award, secret-gate + idempotency on `/api/admin/settle`); all migrations
  apply cleanly to an **ephemeral Postgres** and `make_prediction`/`settle_fixture`/RLS are exercised at runtime;
  a SELECT-only client cannot write `predictions`/ledgers.
- **Estimate:** M.
- **Verify-work:** mutation check (remove a guard → a test fails); coverage report shows the money paths exercised.

---

## 🟠 P1 — HIGH IMPACT

### PHASE H3 — CI/CD Automation
- **Goal:** no broken commit reaches `main`; every PR auto-runs typecheck + lint + test + build + apply-migrations.
- **Impact:** eliminates the entire "gates run manually" risk class; foundation for everything else.
- **Priority:** P1 (can run in parallel with H1).
- **Dependencies:** H2 (tests to run).
- **Acceptance Criteria:** `.github/workflows/ci.yml` (Node 24, `--frozen-lockfile`, the 4 gates [OPERATIONS §2] +
  ephemeral-Postgres migration job + coverage threshold); CI green on a PR; a deliberate type error → CI red;
  `vitest.config` includes `.tsx`.
- **Estimate:** S.
- **Verify-work:** open a throwaway PR with a type error → CI red; confirm migration job applies 0001→000N.

### PHASE H4 — Deploy Governance & Isolation (closes D-033)
- **Goal:** resolve the open D-033 governance item — preview per PR, gated prod, and F90+ isolated from the
  Chiribito Vercel team.
- **Impact:** removes the manual-deploy human-error surface + restores the isolation invariant (currently violated
  at the team level).
- **Priority:** P1.
- **Dependencies:** H3 (CI) ideal; **founder decision DEC-5** (isolate vs accept shared team).
- **Acceptance Criteria:** a PR produces a preview URL; prod deploy gated on green CI; `f90` no longer shares the
  Chiribito team (or founder explicitly accepts); `vercel.json` (headers/cron/region); Node pin (`.nvmrc` ↔
  `engines`); `LICENSE` added; `.env.example` documents `SUPABASE_ACCESS_TOKEN` as CLI-only.
- **Estimate:** S–M.
- **Verify-work:** PR → preview URL; confirm Vercel team/project; LICENSE present.

### PHASE H5 — Predict-Card UX Clarity Pass (OBS-001)
- **Goal:** the outcome choice is the unmistakable protagonist of the predict card — instant scan, dominant
  affordance — without any wager framing.
- **Impact:** the #1 product concern now (participation > infra); the most-repeated interaction in the product.
- **Priority:** P1.
- **Dependencies:** live-loop observability (H1) to audit the real card with real data; craft bar (D-020) +
  dual-surface parity (D-021).
- **Acceptance Criteria:** audit the live card (real fixtures, ES/EN, mobile+desktop) → 2–3 throwaway hierarchy
  mockups → outcomes as the focal action, Analyst + reward as support; selected state legible by more than colour,
  reduced-motion safe; **D-037 vocab/visual law verified**; founder-verified on live data; 0 console errors.
- **Estimate:** M.
- **Verify-work:** founder visual UAT on the live authenticated card; a11y selected-state check; D-037 lint.

### PHASE H6 — Frontend Coherence & A11y Sweep
- **Goal:** zero i18n leaks, valid HTML, reduced-motion honored globally, broader accessibility.
- **Impact:** craft-bar coherence; cheap, high-confidence wins (independent — can run anytime).
- **Priority:** P1.
- **Dependencies:** none.
- **Acceptance Criteria:** fix the `vs` literal (`features/copilot/analyst-card.tsx:59`); remove the duplicate
  `#tournament` id (`page.tsx:27` vs `field-is-set.tsx:25`); localize the `aria-label="Rank N"`
  (`ranking/page.tsx:162`); add an `<h1>` to the 404; wrap the app in `<MotionConfig reducedMotion="user">` (or
  gate `lib/motion.ts`); broader a11y (landmarks, full aria) + AA-contrast residuals; i18n parity preserved.
- **Estimate:** S.
- **Verify-work:** i18n leak sweep; reduced-motion render snaps entrances; HTML validation (no dup id).

---

## 🟡 P2 — IMPROVEMENTS

### PHASE H7 — Phase 3: Player Market + Fantasy XI  🔒 (next PRODUCT milestone — gated)
- **Goal:** earned Tokens become spendable — player market (probability-framed, own-IP cards) + Fantasy XI on the
  existing generic economy, with no Identity reshape.
- **Impact:** turns the economy from earn-only into a full loop; the repo's "Phase 3".
- **Priority:** P2 (high product value, gated).
- **Dependencies:** founder decisions **DEC-1 (free staking)**, **DEC-2 (market model)**, **DEC-3 (Fantasy scope)**,
  **DEC-4 (Founding Squad)**; H1–H3 landed (don't build new economy on an untested loop); wire the player-data
  adapter. Reserved namespaces already exist (D-038): `/markets/*`, `/players/[slug]`, `/fantasy/*`, `/nations/[code]/*`.
- **Acceptance Criteria:** a user spends Tokens to build a squad; prices move from real signals; XI scores from real
  performance; **D-037 intact**; server-authoritative economy unchanged; all gates green. Split via `gsd-mvp-phase`:
  market-first slice → fantasy slice.
- **Estimate:** L (multi-phase).
- **Verify-work:** full economy UAT (earn→spend→squad→XI→settle→points); economy integrity (no negative balances,
  server-authoritative, append-only).

### PHASE H8 — Rate-Limiting & Abuse Hardening
- **Goal:** admin/auth/write endpoints are throttled.
- **Impact:** closes the only real backend gap (no rate-limiting anywhere today).
- **Priority:** P2.
- **Dependencies:** H4 (Vercel WAF availability) optional.
- **Acceptance Criteria:** Vercel WAF / Upstash ratelimit on `/api/admin/*`, the magic-link action, and
  `make_prediction`; per-email send cap → rapid repeated calls return 429.
- **Estimate:** S.
- **Verify-work:** hammer an endpoint → throttled.

### PHASE H9 — Test Infrastructure Depth
- **Goal:** component tests enabled, coverage measured + gated.
- **Impact:** makes the remaining gaps measurable and prevents regressions on UI/forms.
- **Priority:** P2.
- **Dependencies:** H3.
- **Acceptance Criteria:** `.tsx` enabled in Vitest; `@vitest/coverage-v8` + threshold enforced in CI; seed
  component tests for predict-card + forms.
- **Estimate:** S.
- **Verify-work:** coverage report in CI; threshold blocks a drop.

---

## 🔵 P3 — POLISH

### PHASE H10 — Deferred Craft Trajectory & Polish Backlog
- **Goal:** the post-loop craft items + the captured optional backlog.
- **Impact:** premium coherence once the loop is hardened.
- **Priority:** P3.
- **Dependencies:** H5 (for app-shell coherence).
- **Acceptance Criteria (scope):** sidebar app-shell (C3-1) · shared identity component (C3-2) · share-profile
  affordance (C3-3) · settlement realtime reconciliation without reload (C3-4) · fixture-detail route + clickable
  rows (C3-5) · markets vocab/chip rework (C3-6) · "Analista Élite / XP" levels + trophy-photo header · reproducible
  `optimize-images.py` · optional polish backlog (predict-card width-step, standing-strip tablet wrap, globe key-art
  tune, "settles soon" hint). Each item ships under the DoD + craft bar. Source list: `docs/PHASE_3_CANDIDATES.md`.
- **Estimate:** M (incremental).
- **Verify-work:** per-item founder visual UAT; reduced-motion + ES/EN + mobile/desktop, 0 console errors.

---

## Milestone exit criteria (when "Hardening → Economy" is complete)

This milestone is **done** when: H1–H6 are ✅ (the live loop is automated, observable, integrity-hardened,
CI-gated, deploy-governed, and the predict-card + frontend coherence pass have shipped) **and** the founder has
ratified DEC-1..5. H7 (the economy product build) then runs as its own milestone/sub-milestone; H8–H10 are
opportunistic and can land alongside. At exit, update `STATE.md` (tracker + milestone) and consider opening the
next milestone via `gsd-new-milestone` toward the **Horizon** phases.

## Horizon (product arc beyond this milestone — see `docs/ROADMAP.md`)

⬜ **Phase 3.5** Entity Layer & Fantasy (`/nations/*`, `/players/*`, Fantasy top-level, "What is F90+?", ⌘K search) ·
⬜ **Phase 4** Rankings, Leagues & Reputation (by-country/time-boxed boards, private leagues, streaks) ·
⬜ **Phase 5** Narrative / The Analyst (live) · ⬜ **Phase 6** Momentum / Heat on the globe ·
⬜ **Phase 7** Live tracking · shareable cards · notifications · PWA. Plan these only after this milestone closes.

---

## Recommended execution order

```
NOW (time-critical, opener 2026-06-11):
  ① H1  Tournament Ops Safety Net      ── start first
        ∥ in parallel (independent):
  ②a H6  Frontend Coherence & A11y     (cheap, no deps)
  ②b H3  CI/CD scaffolding
  ③ H2  Money-Path Test Harness        (feeds CI)
  ④ H4  Deploy Governance (D-033)      (needs founder DEC-5)
  ⑤ H5  Predict-Card UX Pass (OBS-001) (needs live data)
  ── FOUNDER DECISION: free staking + market model (DEC-1..DEC-4) ──
  ⑥ H7  Phase 3: Market + Fantasy XI   (split: market → fantasy)
  ⑦ H8 rate-limit · H9 test depth
  ⑧ H10 craft / polish
  Horizon: 3.5 → 4 → 5 → 6 → 7
```

## Plan validation (consistency check)

- **No duplicate phases:** the hardening track (H#) does not overlap the repo's product phases; H7 is the repo's
  "Phase 3" re-expressed as a GSD unit.
- **No broken dependencies:** valid topological order — H1→H2→H3→H4; H6 independent; H5 after H1; H7 after
  DEC-1..4 + H1–H3; H8 after H4; H9 after H3; H10 after H5.
- **No ambiguous tasks:** every phase has measurable Goal + Acceptance Criteria + Verify-work + Estimate.
- **No missing requirements:** all four audited domains (product/front/back/db) + operations + testing + governance
  are covered; studio invariants are explicit constraints, never violated.
