-- =============================================================================
-- F90+ — Fixtures & Predictions schema (Phase 2) — migration 0004
--
-- Source contract: docs/SCHEMA_V1.md (Phase 2 — Predictions & fixtures). Built
-- NOW: the fixtures table (the WC2026 match schedule, synced server-side from
-- openfootball) and the predictions table (one locked pick per user/fixture/kind).
-- The prediction_kind enum already exists from migration 0001 — not recreated.
--
-- Lock-at-kickoff invariant (the core of this migration): a user may INSERT or
-- UPDATE a prediction ONLY while the referenced fixture's kickoff_at is still in
-- the future (and, for UPDATE, while the prediction is unsettled). Once kickoff
-- passes the pick is frozen — RLS makes a late write return zero rows. Settlement
-- runs as service_role, which bypasses RLS, so awarding points/coins after the
-- match is unaffected by these policies.
--
-- D-034 forward-compat: predictions feed the SAME wallet + points via the
-- award_* economy functions (settlement writes awarded_points/awarded_coins and
-- calls award_*). No reshape of Identity; this is a pure add.
--
-- Security hardening vs the base contract (Supabase security checklist):
--   * fixtures are world-readable; writes are service_role only (no client
--     write policy) — the sync/settlement jobs own the schedule and results.
--   * predictions are owner-scoped: anon is granted NOTHING (cannot query),
--     authenticated may select/insert/update but RLS then filters to the owner
--     and enforces the kickoff lock. No delete path (picks are never erased).
--   * RLS uses (select auth.uid()) so the check is evaluated once per query.
-- =============================================================================

-- fixtures --------------------------------------------------------------------
-- Synced server-side from openfootball; deterministic text ids
-- (e.g. 'mex-rsa-2026-06-11'). Public-readable so anyone can browse the schedule.
create table public.fixtures (
  id          text primary key,
  group_label text,
  round       text,
  kickoff_at  timestamptz not null,
  home_code   text references public.countries(code),
  away_code   text references public.countries(code),
  home_goals  integer,
  away_goals  integer,
  status      text not null default 'upcoming',   -- upcoming | live | final
  source      text not null default 'openfootball',
  updated_at  timestamptz not null default now()
);
alter table public.fixtures enable row level security;
create policy "fixtures public read" on public.fixtures
  for select using (true);
-- Writes: service_role only (sync/settlement jobs). No client write policy.
create index fixtures_kickoff_idx on public.fixtures (kickoff_at);

-- predictions -----------------------------------------------------------------
-- Owner-owned picks. Writable only BEFORE kickoff; settlement (service_role)
-- bypasses RLS to write awarded_points/awarded_coins after the match.
create table public.predictions (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  fixture_id      text not null references public.fixtures(id),
  kind            prediction_kind not null default 'match_result',
  payload         jsonb not null,                  -- {"outcome":"home|draw|away"}
  points_possible integer not null,
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
create policy "predictions self insert before kickoff" on public.predictions
  for insert with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.fixtures f where f.id = fixture_id and f.kickoff_at > now())
  );
create policy "predictions self update before kickoff" on public.predictions
  for update using (
    (select auth.uid()) = user_id and settled_at is null
    and exists (select 1 from public.fixtures f where f.id = fixture_id and f.kickoff_at > now())
  ) with check ((select auth.uid()) = user_id);
-- No delete policy: picks are never erased by clients.
create index predictions_user_idx on public.predictions (user_id, created_at desc);
create index predictions_fixture_idx on public.predictions (fixture_id);

-- Data API exposure -----------------------------------------------------------
-- Table-level privileges are the FIRST gate (RLS above governs WHICH rows). New
-- Supabase projects do not auto-grant, so we grant explicitly:
--   * fixtures: world-readable (anon + authenticated) — public schedule.
--   * predictions: authenticated only (RLS then filters to the owner and
--     enforces the kickoff lock). anon is granted NOTHING -> cannot even query
--     them (defence in depth).
grant select on public.fixtures to anon, authenticated;
grant select on public.predictions to authenticated;
grant insert on public.predictions to authenticated;
grant update on public.predictions to authenticated;
