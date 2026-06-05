# Phase 2 — Predictions Core & Scoring — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A logged-in user predicts the 1X2 (home / draw / away) of any upcoming World Cup match before kickoff; correct calls earn difficulty-honest **points** (permanent, feed the rank) **+ Tokens F90** (spendable in Phase 3) — generating the economy and filling the rankings teaser with real data.

**Architecture:** New `fixtures` + `predictions` tables (migration `0004`, RLS lock-at-kickoff) behind the existing server-authoritative economy (`award_points` / `award_coins`). Fixtures + final results come from the **existing openfootball source** (zero-key, cache-first) — no paid API. The predict action is a Server Action (defense-in-depth kickoff guard on top of RLS); scoring is a pure function over the existing Elo model (`lib/football/model.ts`). Settlement is an idempotent server routine run with the service key. The premium post-login `/home` becomes the predict hub (replaces the "Próximamente" placeholder); `/predictions` is the "my predictions" view.

**Tech Stack:** Next.js 16 App Router (RSC + Server Actions) · `@supabase/ssr` · Postgres/RLS · Vitest · next-intl · Tailwind v4. Conversation ES, product copy EN/ES via i18n.

---

## Base & branch protocol

- This branch `feat/phase-2-predictions` was cut off `main` (`4959c6f`) **before** PR #3 (pre-flight) merged.
- **Before writing any code (P2-1+):** founder merges **PR [#3](https://github.com/F90Plus/f90/pull/3)**, then rebase this branch onto the updated `main` so the middleware session-cookie fix (D-049) and the doc reconciliation are in the base. Command: `git fetch origin && git rebase origin/main`.
- One PR for Phase 2 at the end (or split Hito A / Hito B), founder-merged. Never push to `main`. Manual `vercel --prod` per D-033.

## Design decisions (locked in brainstorming, 2026-06-05)

- **Mechanic = free predict + earn (no stake, no risk).** A pick is free; a *correct* pick credits points + Tokens F90, difficulty-weighted. Points never decrease (D-027). No F90 is staked/risked — this is **not** betting (D-037). The landing's `+10/+50/+100 F90` chips (D-041) are a preview of the *future* market feel; they are **not** this engine. Realigning the landing copy to "predict → earn" is a documented follow-up, **out of this plan's scope**.
- **Breadth = any upcoming WC group-stage match, opener featured.** 1X2 only for the MVP. Scoreline / brackets / moments are post-opener layers (the `prediction_kind` enum already reserves them).
- **Vocabulary law (D-037):** probabilidad · posición · convicción · participantes — never odds / bet / stake / cuota / ganancias.
- **Surfaces:** premium `/home` = predict hub; `(app)/predictions` = my predictions; the same predict action is reachable from the Tournament Center / landing match cards (logged-out → sign-up).
- **Out of scope (documented-not-built):** D-042 portfolio dashboard, conviction-multiplier ("Banker") fast-follow, advanced Fantasy, player market, football-data live adapter.

## Critical path to the opener (11 Jun 2026)

**Hito A — predict live for the pitido:** P2-1 → P2-2 → P2-3 → P2-4 → P2-5 → P2-6 → P2-7 (deploy). Founder activates the **D-035** Supabase sign-in items in parallel (without them, the loop is built but users can't sign in to use it in prod).

**Hito B — settlement + leaderboard (11–12 Jun, after the match):** P2-8 → P2-9 → P2-10 → P2-11 (DoD + deploy).

## File map

| File | Responsibility |
| --- | --- |
| `apps/web/supabase/migrations/0004_predictions.sql` | `fixtures` + `predictions` tables, RLS (lock-at-kickoff), indexes |
| `apps/web/src/lib/supabase/__tests__/migration-0004.test.ts` | guards the migration's invariants (RLS present, lock policy, kinds) — under `src/` so Vitest runs it |
| `apps/web/src/lib/football/fixtures.ts` | deterministic fixture id + map openfootball matches → fixture rows |
| `apps/web/src/lib/football/__tests__/fixtures.test.ts` | id determinism + mapping + knockout-placeholder rejection |
| `apps/web/src/lib/scoring.ts` | pure difficulty-honest points/coins from model probability |
| `apps/web/src/lib/__tests__/scoring.test.ts` | ordering, clamps, specific values |
| `apps/web/src/features/predictions/validation.ts` | parse/guard the predict input (zod) |
| `apps/web/src/features/predictions/queries.ts` | read predictable fixtures (+ model prob + user's pick), read user predictions |
| `apps/web/src/features/predictions/actions.ts` | `makePrediction` Server Action (kickoff guard, upsert) |
| `apps/web/src/features/predictions/settlement.ts` | pure: (fixture result + predictions) → award instructions |
| `apps/web/src/features/predictions/predict-card.tsx` | premium match card: Analyst % + points-if-right + "Tomar posición" |
| `apps/web/src/features/predictions/predict-buttons.tsx` | client island: optimistic 1X2 pick, locked state |
| `apps/web/src/features/predictions/predictions-list.tsx` | pending / locked / settled rows |
| `apps/web/src/app/[locale]/(app)/home/page.tsx` | MODIFY: replace placeholder with the predict hub |
| `apps/web/src/app/[locale]/(app)/predictions/page.tsx` | CREATE: "my predictions" |
| `apps/web/scripts/sync-fixtures.ts` | upsert upcoming fixtures from openfootball (service key) |
| `apps/web/scripts/settle.ts` | run settlement for finished fixtures (service key, idempotent) |
| `apps/web/locales/{es,en}.json` | `predictions` namespace (full parity) |

> UI tasks specify behavior, props, tests, and integration points; final premium JSX is iterated with the design tokens + a visual pass during execution (craft bar), not frozen here.

---

## Hito A

### Task P2-1: Migration 0004 — fixtures + predictions + RLS lock-at-kickoff

**Files:**
- Create: `apps/web/supabase/migrations/0004_predictions.sql`
- Create: `apps/web/src/lib/supabase/__tests__/migration-0004.test.ts` (under `src/` so Vitest's `src/**` include runs it)
- Modify: `apps/web/supabase/README.md` (document 0004 + how-applied + verify queries)

- [ ] **Step 1: Write the failing test** (guards the migration file's invariants, mirroring `countries-seed.test.ts`)

```ts
// apps/web/src/lib/supabase/__tests__/migration-0004.test.ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  fileURLToPath(new URL('../../../../supabase/migrations/0004_predictions.sql', import.meta.url)),
  'utf8',
).toLowerCase();

describe('migration 0004 — predictions', () => {
  it('creates both tables', () => {
    expect(sql).toContain('create table public.fixtures');
    expect(sql).toContain('create table public.predictions');
  });
  it('enables RLS on both', () => {
    expect(sql).toContain('alter table public.fixtures enable row level security');
    expect(sql).toContain('alter table public.predictions enable row level security');
  });
  it('locks writes at kickoff (policy references kickoff_at > now())', () => {
    expect(sql).toMatch(/kickoff_at\s*>\s*now\(\)/);
  });
  it('keeps predictions one-per-user-per-fixture-per-kind', () => {
    expect(sql).toMatch(/unique\s*\(user_id,\s*fixture_id,\s*kind\)/);
  });
});
```

- [ ] **Step 2: Run it, verify FAIL** — `corepack pnpm -C apps/web exec vitest run src/lib/supabase/__tests__/migration-0004.test.ts` → FAIL (SQL file missing).

- [ ] **Step 3: Write the migration**

```sql
-- 0004_predictions.sql — Phase 2: fixtures + predictions (forward contract from SCHEMA_V1).
-- fixtures: synced server-side from openfootball; deterministic text ids.
create table public.fixtures (
  id          text primary key,                 -- e.g. 'mex-???-2026-06-11'
  group_label text,
  round       text,
  kickoff_at  timestamptz not null,
  home_code   text references public.countries(code),
  away_code   text references public.countries(code),
  home_goals  integer,
  away_goals  integer,
  status      text not null default 'upcoming',  -- upcoming | live | final
  source      text not null default 'openfootball',
  updated_at  timestamptz not null default now()
);
alter table public.fixtures enable row level security;
create policy "fixtures public read" on public.fixtures for select using (true);
-- writes: service_role only (sync/settlement jobs); no client policy.
create index fixtures_kickoff_idx on public.fixtures (kickoff_at);

-- predictions: owner-owned; writable only before kickoff; immutable after settlement.
create table public.predictions (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  fixture_id      text not null references public.fixtures(id),
  kind            prediction_kind not null default 'match_result',
  payload         jsonb not null,                -- {"outcome":"home|draw|away"}
  points_possible integer not null,              -- from lib/scoring at pick time
  settled_at      timestamptz,
  awarded_points  integer,
  awarded_coins   integer,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, fixture_id, kind)
);
alter table public.predictions enable row level security;

create policy "predictions self read" on public.predictions
  for select using ((select auth.uid()) = user_id);

-- INSERT only your own row, only before kickoff.
create policy "predictions self insert before kickoff" on public.predictions
  for insert with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.fixtures f
                where f.id = fixture_id and f.kickoff_at > now())
  );

-- UPDATE (change your pick) only your own row, only before kickoff, only while unsettled.
create policy "predictions self update before kickoff" on public.predictions
  for update using (
    (select auth.uid()) = user_id and settled_at is null
    and exists (select 1 from public.fixtures f
                where f.id = fixture_id and f.kickoff_at > now())
  ) with check ((select auth.uid()) = user_id);
-- no delete policy. settlement writes settled_at/awarded_* via service_role (bypasses RLS).

create index predictions_user_idx on public.predictions (user_id, created_at desc);
create index predictions_fixture_idx on public.predictions (fixture_id);
```

- [ ] **Step 4: Run the guard test, verify PASS.**

- [ ] **Step 5: Apply to Supabase `f90-production`** via the Management API (`POST /v1/projects/{ref}/database/query`, PAT) — same path as `0001`–`0003` (SQL files are source of truth). Then verify live with SQL: both tables exist, RLS = on, the 3 policies present, FKs to `countries`/`profiles` valid. Record the verify queries in `supabase/README.md`.

- [ ] **Step 6: Commit** — `git add apps/web/supabase/migrations/0004_predictions.sql apps/web/src/lib/supabase/__tests__/migration-0004.test.ts apps/web/supabase/README.md && git commit -m "feat(db): migration 0004 — fixtures + predictions + RLS lock-at-kickoff"`

### Task P2-2: Fixtures sync from openfootball

**Files:**
- Create: `apps/web/src/lib/football/fixtures.ts`
- Create: `apps/web/src/lib/football/__tests__/fixtures.test.ts`
- Create: `apps/web/scripts/sync-fixtures.ts`

- [ ] **Step 1: Failing test** — `fixtureId(home, away, dateISO)` is deterministic + stable; `toFixtureRow(match)` maps a real openfootball group-stage match (reuse `lib/football/util` helpers) and rejects knockout placeholders (returns `null`).

```ts
import { describe, expect, it } from 'vitest';
import { fixtureId, toFixtureRow } from '../fixtures';

describe('fixtures mapping', () => {
  it('derives a stable, slug-safe id', () => {
    expect(fixtureId('Mexico', 'Brazil', '2026-06-11')).toBe('mexico-brazil-2026-06-11');
    expect(fixtureId('Mexico', 'Brazil', '2026-06-11')).toBe(fixtureId('Mexico', 'Brazil', '2026-06-11'));
  });
  it('maps a real group match to a fixture row with codes + kickoff', () => {
    const row = toFixtureRow({ team1: 'Mexico', team2: 'Brazil', group: 'Group A', date: '2026-06-11', time: '19:00 UTC-6' });
    expect(row).not.toBeNull();
    expect(row!.home_code).toBeTruthy();
    expect(row!.away_code).toBeTruthy();
    expect(typeof row!.kickoff_at).toBe('string');
  });
  it('rejects knockout-placeholder fixtures', () => {
    expect(toFixtureRow({ team1: '1A', team2: '2B' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement** `fixtures.ts` — `fixtureId` = `${slug(home)}-${slug(away)}-${dateISO}`; `toFixtureRow` reuses `isRealTeam`/`parseKickoffISO`/`teamMeta().code` from `lib/football` (no new parsing); returns `{ id, home_code, away_code, kickoff_at, group_label, status:'upcoming', source:'openfootball' }`.
- [ ] **Step 4: Run, verify PASS.**
- [ ] **Step 5: Implement `scripts/sync-fixtures.ts`** — read openfootball via the existing source, map upcoming group matches → rows, **upsert** into `fixtures` with the secret key (`SUPABASE_SECRET_KEY`, service role) `on conflict (id) do update set kickoff_at=…, status=…`. Print a count. (Run manually for the MVP; no cron yet.)
- [ ] **Step 6: Run the sync once against `f90-production`**; verify the opener + group-stage rows exist (SQL count). 
- [ ] **Step 7: Commit** — `feat(fixtures): sync upcoming WC fixtures from openfootball`

### Task P2-3: Scoring — difficulty-honest points

**Files:**
- Create: `apps/web/src/lib/scoring.ts`
- Create: `apps/web/src/lib/__tests__/scoring.test.ts`

- [ ] **Step 1: Failing test** — lower model probability on the outcome you got right ⇒ more points; clamped; deterministic integers.

```ts
import { describe, expect, it } from 'vitest';
import { pointsForProbability, COINS_PER_POINT } from '../scoring';

describe('difficulty-honest scoring', () => {
  it('rewards the underdog more than the favourite', () => {
    expect(pointsForProbability(0.15)).toBeGreaterThan(pointsForProbability(0.6));
  });
  it('clamps to [10, 500]', () => {
    expect(pointsForProbability(0.99)).toBe(20); // 20/0.99 ≈ 20
    expect(pointsForProbability(0.001)).toBe(500); // capped
    expect(pointsForProbability(0.95)).toBeGreaterThanOrEqual(10);
  });
  it('is a deterministic integer', () => {
    expect(Number.isInteger(pointsForProbability(0.33))).toBe(true);
    expect(pointsForProbability(0.5)).toBe(40); // round(20/0.5)
  });
  it('coins mirror points for the MVP', () => {
    expect(COINS_PER_POINT).toBe(1);
  });
});
```

- [ ] **Step 2: Run, verify FAIL.**
- [ ] **Step 3: Implement**

```ts
// lib/scoring.ts — points = "fair" reward inversely proportional to the model's
// probability of the outcome you picked. Presented as "points if you're right",
// never as odds (D-037). Coins mirror points for the MVP (tunable later).
const BASE = 20;
const MIN_POINTS = 10;
const MAX_POINTS = 500;
export const COINS_PER_POINT = 1;

export function pointsForProbability(prob: number): number {
  const p = Math.min(Math.max(prob, 0.0001), 1);
  return Math.min(Math.max(Math.round(BASE / p), MIN_POINTS), MAX_POINTS);
}
export function coinsForPoints(points: number): number {
  return points * COINS_PER_POINT;
}
```

- [ ] **Step 4: Run, verify PASS.**
- [ ] **Step 5: Commit** — `feat(scoring): difficulty-honest points from model probability`

### Task P2-4: Predict Server Action + queries + validation

**Files:**
- Create: `apps/web/src/features/predictions/validation.ts` (+ `__tests__/validation.test.ts`)
- Create: `apps/web/src/features/predictions/queries.ts`
- Create: `apps/web/src/features/predictions/actions.ts`

- [ ] **Step 1: Failing test** for `parseOutcome` (zod): accepts `home|draw|away`, rejects anything else.

```ts
import { describe, expect, it } from 'vitest';
import { parseOutcome } from '../validation';
describe('parseOutcome', () => {
  it('accepts the three outcomes', () => {
    for (const o of ['home', 'draw', 'away']) expect(parseOutcome(o)).toBe(o);
  });
  it('rejects junk', () => {
    expect(() => parseOutcome('win')).toThrow();
  });
});
```

- [ ] **Step 2: Run, verify FAIL.** → **Step 3:** implement `validation.ts` (`z.enum(['home','draw','away'])`). → **Step 4: PASS.**
- [ ] **Step 5: Implement `queries.ts`** — `getPredictableFixtures(supabase)`: upcoming fixtures (`kickoff_at > now()`) joined with the model probability per fixture (reuse `teams.ts` strengths + `model.ts` `modelProbability`/`homeAdvantageFor`) and the current user's existing pick (left join on `predictions`). `getUserPredictions(supabase)`: the user's predictions with fixture + result. Pure mapping helpers unit-tested where non-trivial.
- [ ] **Step 6: Implement `actions.ts`** — `makePrediction(fixtureId, outcome)` Server Action:
  - `requireOnboardedUser()` (reuse `features/auth/guards`).
  - Load fixture; **server-side kickoff guard** (`kickoff_at > now()`) as defense-in-depth on top of RLS; reject otherwise with a localized error.
  - Compute `points_possible = pointsForProbability(modelProb[outcome])`.
  - Upsert the prediction (`unique (user_id, fixture_id, kind)`) via the user's RLS client. `revalidatePath` the home + predictions routes.
- [ ] **Step 7: Verify E2E** with the real-Supabase session pattern (Phase 1 style: admin `generate_link` → token-hash `/callback`): create a prediction before kickoff (succeeds), attempt after a synthetic past-kickoff fixture (blocked by both the action guard and RLS). Clean up the test user. 
- [ ] **Step 8: Commit** — `feat(predictions): predict server action + queries + validation (kickoff-guarded)`

### Task P2-5: Predict UI — premium card + optimistic 1X2

**Files:**
- Create: `apps/web/src/features/predictions/predict-card.tsx` (server)
- Create: `apps/web/src/features/predictions/predict-buttons.tsx` (`'use client'` island)
- Modify: `apps/web/locales/{es,en}.json` (`predictions` namespace)

- [ ] **Step 1:** Add `predictions` i18n keys (ES + EN, full parity): `eyebrow`, `pointsIfRight`, `takePosition` ("Tomar posición" / "Take a position"), `locked`, `yourPick`, `kickoff`, error strings. Verify ES/EN key parity (the project's parity check).
- [ ] **Step 2:** `predict-card.tsx` (server) — props: `{ fixture, prob, userPick }`. Renders the match (home/away flags + names via existing tokens), the Analyst read in **%** (`AnalystMark` reused), and the three outcomes each showing `pointsIfRight` (`pointsForProbability(prob[outcome])`). Passes down to the client island. Locked visual when `kickoff_at <= now()`.
- [ ] **Step 3:** `predict-buttons.tsx` (client) — optimistic selection: highlights the chosen outcome immediately, calls `makePrediction` (server action) via `useTransition`, rolls back + shows the localized error on failure. Disabled + "locked" once past kickoff. Vocabulary law (D-037) — "Tomar posición", never bet/odds.
- [ ] **Step 4: Verify** in the preview (`f90plus-web`:3300) with a signed-in session — ES + EN, desktop + mobile, optimistic pick reflects + persists (DOM/eval; WebGL globe screenshots may flake — use DOM + scoped shots). 0 console errors.
- [ ] **Step 5: Commit** — `feat(predictions): premium predict card + optimistic 1X2 island`

### Task P2-6: Premium post-login `/home` = predict hub

**Files:**
- Modify: `apps/web/src/app/[locale]/(app)/home/page.tsx`
- Modify: `apps/web/locales/{es,en}.json` (`app.home.*` additions)

- [ ] **Step 1:** Replace the `home.soon` placeholder block with: **hero** = the featured/next match `predict-card` (opener while upcoming); **below** = the rest of `getPredictableFixtures()` as predict cards; keep a compact standing row (Tokens F90 · points · rank from `global_rankings`) and a "recent predictions" strip linking to `/predictions`. Reuse `getPredictableFixtures` + `getUserPredictions`.
- [ ] **Step 2:** Remove the now-unused `home.soon` / `home.exploreCta` keys; add `home.predictTitle`, `home.recentTitle`, `home.seeAll` (ES/EN parity).
- [ ] **Step 3: Verify** signed-in `/home` in preview — hero opener predictable, standing correct, ES/EN + mobile, 0 console errors. Confirm the placeholder is gone.
- [ ] **Step 4: Commit** — `feat(home): post-login predict hub replaces the placeholder`

### Task P2-7: Hito A gate — deploy + verify the opener loop

- [ ] Gates: `corepack pnpm -C apps/web run test` (all green) · `run build` · i18n ES/EN parity. 
- [ ] Founder action (parallel, **blocking for real users**): activate the **D-035** Supabase items — `site_url` → `https://www.f90.xyz`, redirect allow-list apex `https://f90.xyz/**`, Resend SMTP.
- [ ] `vercel --prod` (D-033, root `apps/web`); verify in prod: a signed-in user can predict the opener; `/home` shows the hub; the pick persists. 
- [ ] Commit a `docs(phase-2)` checkpoint (D-050) recording Hito A live.

---

## Hito B (after the opener kicks off / finishes)

### Task P2-8: Settlement

**Files:**
- Create: `apps/web/src/features/predictions/settlement.ts` (pure) + `__tests__/settlement.test.ts`
- Create: `apps/web/scripts/settle.ts` (service-key runner, idempotent)

- [ ] **Step 1: Failing test** — pure `settle(fixtureResult, prediction)`:

```ts
import { describe, expect, it } from 'vitest';
import { outcomeOf, settle } from '../settlement';
describe('settlement', () => {
  it('derives the outcome from the score', () => {
    expect(outcomeOf(2, 0)).toBe('home');
    expect(outcomeOf(1, 1)).toBe('draw');
    expect(outcomeOf(0, 3)).toBe('away');
  });
  it('awards points+coins on a correct pick, zero on a wrong one (never negative)', () => {
    const correct = settle({ home_goals: 2, away_goals: 0 }, { outcome: 'home', points_possible: 40 });
    expect(correct).toEqual({ correct: true, points: 40, coins: 40 });
    const wrong = settle({ home_goals: 2, away_goals: 0 }, { outcome: 'away', points_possible: 40 });
    expect(wrong).toEqual({ correct: false, points: 0, coins: 0 });
  });
});
```

- [ ] **Step 2: Run, verify FAIL.** → **Step 3:** implement `outcomeOf` + `settle` (uses `coinsForPoints`). → **Step 4: PASS.**
- [ ] **Step 5: Implement `scripts/settle.ts`** — with the service key: read `fixtures` now `final` (results synced from openfootball by `sync-fixtures`), for each unsettled prediction on them call `award_points` + `award_coins` (RPC, service role) and stamp `settled_at`/`awarded_*`. **Idempotent** (skip rows with `settled_at not null`; do it in a transaction per fixture).
- [ ] **Step 6: Verify E2E** on a synthetic finished fixture + a test user: correct pick → wallet + points increase by the expected amount + ledger rows appear; re-running settle does **not** double-award. Clean up.
- [ ] **Step 7: Commit** — `feat(predictions): idempotent settlement → award_points/award_coins`

### Task P2-9: "My predictions" view

**Files:**
- Create: `apps/web/src/app/[locale]/(app)/predictions/page.tsx`
- Create: `apps/web/src/features/predictions/predictions-list.tsx`
- Modify: `apps/web/locales/{es,en}.json`

- [ ] **Step 1:** `predictions/page.tsx` (gated by the `(app)` layout) reads `getUserPredictions()` → groups pending / locked / settled. **Step 2:** `predictions-list.tsx` presentational: per row show match, your pick, points-if-right, and (settled) result + points/coins earned with a win/miss treatment. **Step 3:** i18n keys (ES/EN parity). **Step 4:** verify ES/EN + mobile, 0 console errors. **Step 5: Commit** — `feat(predictions): my-predictions view`.

### Task P2-10: Rankings teaser with real data

- [ ] After settlement, the existing `global_rankings` teaser (`lib/rankings.ts` → `toTeaserEntries`) shows real scored users. **Verify** the populated-row branch in the browser (the empty-state branch was the only one exercised in Phase 1). Add the compact standing/recent strip wiring on `/home` if not already covered by P2-6. Commit only if changes are needed.

### Task P2-11: Phase 2 DoD gate

- [ ] `run test` (all green incl. new suites) · `run build` (no `ignore*Errors`) · i18n ES/EN parity · browser E2E ES/EN/mobile (0 console): predict → (settle) → points/coins/leaderboard. Confirm vocab law (no odds/bet strings) + the standing invariants. `vercel --prod`. Record **D-050/D-051** (Phase 2 close) + update `ROADMAP.md` (Phase 2 ✅) + `PROJECT_STATE.md` + a `PHASE_2_HANDOFF.md`.

---

## Risks / notes

- **D-035 is the real-user blocker** for Hito A — code can be live but unusable without it. Founder-owned.
- **No cron yet:** `sync-fixtures` + `settle` are run manually for the opener. A scheduled trigger is a post-MVP follow-up (note in the handoff).
- **ESLint** remains broken at the flat-config level (pre-existing); gates = typecheck + Vitest + `build`.
- **Migrations** applied via Management API (no CLI history) — same path as 0001–0003; SQL files are the source of truth.
- **Landing realignment** (the `+10/+50/+100 F90` preview → "predict → earn") is a deliberate follow-up, not in this plan.
