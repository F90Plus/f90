# F90+ — Supabase (database)

Versioned schema for F90+. Source contract: [`docs/SCHEMA_V1.md`](../../../docs/SCHEMA_V1.md)
(D-027 economy, D-028 latent foundations, D-031 identity defaults). Must stay
compatible with the expanded vision (D-034).

## Migrations (apply in order)

| File | What it creates |
| --- | --- |
| `20260604000001_identity.sql` | Phase 1 schema: `countries`, `profiles`, `wallets`, `coin_ledger`, `score_ledger`; `award_coins` / `award_points`; `handle_new_user` trigger; `global_rankings` view; RLS on every table + indexes. |
| `20260604000002_countries_seed.sql` | The 48 WC2026 nations, derived from `lib/football/teams.ts` (codes/accents/strengths) + Spanish names. Hosts: USA, Mexico, Canada. |
| `20260604000003_welcome_bonus.sql` | Replaces `handle_new_user()` in place so the welcome bonus is **20,026 Tokens F90** (D-039; was 1,000 in 0001). Trigger unchanged. |
| `20260605000004_predictions.sql` | Phase 2 forward tables: `fixtures` (WC2026 schedule, public-readable, service-role-written) + `predictions` (owner-owned picks, one per `(user_id, fixture_id, kind)`); RLS **locks writes at kickoff**; indexes + explicit Data API grants. |

## Security notes (hardening over the base contract)

- `award_*` are `SECURITY DEFINER` with a pinned `search_path`; **EXECUTE is
  revoked from `anon`/`authenticated`** and granted only to `service_role` — no
  client can mint currency via RPC. The trigger (definer) and the server
  (service_role) are the only callers.
- `global_rankings` uses `security_invoker = true` (honours RLS, never bypasses it).
- Every `public` table has RLS enabled; `wallets` + ledgers are owner-read and
  **server-write-only** (no client write policy).
- RLS predicates use `(select auth.uid())` so the check is evaluated once per query.

## Migration 0004 — fixtures & predictions (Phase 2)

`20260605000004_predictions.sql` lands the first two Phase-2 forward tables from
`SCHEMA_V1.md`. It reuses the existing `prediction_kind` enum (created in 0001) —
nothing in Identity is reshaped.

- **`fixtures`** — the WC2026 match schedule with deterministic text ids
  (e.g. `'mex-rsa-2026-06-11'`), synced server-side from openfootball. RLS:
  **public read** (`using (true)`); **no client write policy** — only
  `service_role` (the sync/settlement jobs) writes kickoff times and results.
  Indexed on `kickoff_at`.
- **`predictions`** — one owner-owned pick per `(user_id, fixture_id, kind)`
  (unique). `payload` is JSONB (`{"outcome":"home|draw|away"}` for the MVP 1X2);
  `points_possible` is set at write time; `settled_at` / `awarded_points` /
  `awarded_coins` are filled at settlement. Indexed on `(user_id, created_at desc)`
  and `fixture_id`.

### RLS — lock-at-kickoff semantics

`predictions` is owner-scoped and the pick **freezes at kickoff**:

- **read** — `(select auth.uid()) = user_id` (you see only your own picks).
- **insert** — allowed only while the referenced fixture's `kickoff_at > now()`
  (and the row is your own). After kickoff, an insert matches no policy → rejected.
- **update** — allowed only while `kickoff_at > now()` **and** `settled_at is null`
  (and the row is your own). Once kickoff passes or the pick is settled, the
  update affects zero rows — the pick is locked.
- **delete** — **no policy** (picks are never erased by clients).

Settlement runs as **`service_role`, which bypasses RLS**, so writing
`settled_at` / `awarded_points` / `awarded_coins` (and calling `award_*`) after a
match is unaffected by the kickoff lock. Data API grants mirror 0001: `fixtures`
is `select` for `anon` + `authenticated`; `predictions` is `select`/`insert`/`update`
for `authenticated` only — **`anon` is granted nothing on `predictions`** (it
cannot even query the table; defence in depth on top of RLS).

## D-034 forward-compat

The economy is **generic**: `coin_ledger.kind` (incl. `market_trade`,
`player_purchase`, `player_sale`, `fantasy_reward`) plus `(ref_type, ref_id)`
absorb predictions, Polymarket-style markets, player trading and fantasy — all
through the **same wallet + points**, with no reshape of Identity. `fixtures` and
`predictions` are built in migration 0004 (Phase 2, above); the remaining forward
tables (`players`, `squads`, `lineups`, `leagues`) are designed in `SCHEMA_V1.md`
and built in their own phases (D-028) — intentionally not here.

## How migrations get applied

Until CLI/GitHub auto-apply is wired, migrations are applied with a Supabase
**Personal Access Token** (`SUPABASE_ACCESS_TOKEN` in `apps/web/.env.local`) via
the Management API (or `supabase db push`). They are the source of truth and are
reviewed like code — **no schema change happens outside a migration file**.

## Verifying after apply

- `select count(*) from public.countries;` → **48**
- Create a test user → a `profiles` row, a `wallets` row, and a `coin_ledger`
  `signup_bonus` of **20026** appear; `wallets.coins_balance` = 20026 (Tokens F90, D-039; migration 0003).
- Anonymous reads of `wallets` / `coin_ledger` / `score_ledger` return **0 rows**
  (RLS); `countries` and `profiles` are publicly readable.

### After migration 0004 (fixtures & predictions)

- Both tables exist:
  `select to_regclass('public.fixtures'), to_regclass('public.predictions');`
  → both non-null.
- RLS is **on** for both:
  `select relname, relrowsecurity from pg_class where relname in ('fixtures','predictions');`
  → `relrowsecurity = t` for each.
- The four policies are present:
  `select tablename, policyname, cmd from pg_policies where tablename in ('fixtures','predictions') order by tablename, policyname;`
  → `fixtures public read` (SELECT) + `predictions self read` (SELECT),
  `predictions self insert before kickoff` (INSERT),
  `predictions self update before kickoff` (UPDATE). **No** DELETE policy on either,
  **no** write policy on `fixtures`.
- Foreign keys to `countries` / `profiles` / `fixtures` are valid:
  ```sql
  select conrelid::regclass as table, conname, confrelid::regclass as references
  from pg_constraint
  where contype = 'f' and conrelid in ('public.fixtures'::regclass, 'public.predictions'::regclass)
  order by 1, 2;
  ```
  → `fixtures.home_code`/`away_code` → `countries`; `predictions.user_id` →
  `profiles`, `predictions.fixture_id` → `fixtures`.
- Lock-at-kickoff (run as a normal authenticated user): insert a prediction for a
  fixture whose `kickoff_at` is in the **past** → **rejected** (no policy match);
  for a fixture in the **future** → succeeds, and updating it after kickoff (or
  after `settled_at` is set) affects **0 rows**.
- `anon` cannot read `predictions` at all (granted nothing): an anonymous
  `select * from public.predictions` returns a permission error / 0 rows.
