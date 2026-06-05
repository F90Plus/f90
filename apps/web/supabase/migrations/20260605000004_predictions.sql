-- =============================================================================
-- F90+ — Fixtures & Predictions schema (Phase 2) — migration 0004
--
-- Source contract: docs/SCHEMA_V1.md (Phase 2 — Predictions & fixtures). Built
-- NOW: the fixtures table (the WC2026 match schedule, synced server-side from
-- openfootball) and the predictions table (one locked pick per user/fixture/kind).
-- The prediction_kind enum is created here (0001 made only ledger_kind) so this
-- migration applies cleanly and is re-runnable.
--
-- Lock-at-kickoff invariant (the core of this migration): a prediction may be
-- written ONLY while the referenced fixture's kickoff_at is still in the future
-- (and, on re-pick, while the prediction is unsettled). Once kickoff passes the
-- pick is frozen. This is enforced in make_prediction() (the sole client write
-- path) AND, as defence-in-depth, by the RLS write policies. Settlement runs as
-- service_role, which bypasses RLS, so awarding points/coins after the match is
-- unaffected by the lock.
--
-- D-034 forward-compat: predictions feed the SAME wallet + points via the
-- award_* economy functions (settlement writes awarded_points/awarded_coins and
-- calls award_*). No reshape of Identity; this is a pure add.
--
-- Security hardening vs the base contract (Supabase security checklist):
--   * fixtures are world-readable; writes are service_role only (no client
--     write policy) — the sync/settlement jobs own the schedule and results.
--   * predictions are owner-scoped: anon is granted NOTHING (cannot query) and
--     authenticated gets SELECT only. The SOLE write path is the
--     make_prediction() SECURITY DEFINER RPC, which sets points_possible
--     server-side (clients cannot inflate it) and enforces the kickoff lock; the
--     RLS write policies stay as defence-in-depth. No delete path (picks are
--     never erased).
--   * RLS uses (select auth.uid()) so the check is evaluated once per query.
-- =============================================================================

-- prediction_kind enum: declared in SCHEMA_V1 but NOT created in Phase 1 (0001 made only ledger_kind).
-- Created here, idempotently, so 0004 applies cleanly and is re-runnable.
do $$ begin
  create type prediction_kind as enum ('match_result','exact_score','bracket','moment');
exception when duplicate_object then null; end $$;

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
  prob_home   numeric(5,4),
  prob_draw   numeric(5,4),
  prob_away   numeric(5,4),
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
-- Writes go through make_prediction() (SECURITY DEFINER, below); these policies
-- stay as defence-in-depth (inert for clients since no client write grant).
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
--   * predictions: authenticated gets SELECT only (RLS then filters to the
--     owner). Clients NEVER write predictions directly: the sole write path is
--     the make_prediction() SECURITY DEFINER RPC below. anon is granted NOTHING
--     -> cannot even query them (defence in depth).
grant select on public.fixtures to anon, authenticated;
grant select on public.predictions to authenticated;

-- Prediction write path --------------------------------------------------------
-- The ONLY write path for predictions. Server-authoritative: computes points_possible
-- from the fixture's stored model probability (clients cannot inflate it), enforces the
-- kickoff lock, and upserts the caller's single pick per (fixture, kind). Mirrors the
-- award_* definer pattern. Scoring formula is the canonical one, kept in sync with
-- apps/web/src/lib/scoring.ts: clamp(round(20 / prob), 10, 500).
create or replace function public.make_prediction(p_fixture_id text, p_outcome text)
returns public.predictions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := (select auth.uid());
  v_fixture public.fixtures;
  v_prob    numeric;
  v_points  integer;
  v_row     public.predictions;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_outcome not in ('home','draw','away') then
    raise exception 'invalid outcome: %', p_outcome using errcode = '22023';
  end if;
  select * into v_fixture from public.fixtures where id = p_fixture_id;
  if not found then
    raise exception 'fixture not found: %', p_fixture_id using errcode = 'P0002';
  end if;
  if v_fixture.kickoff_at <= now() then
    raise exception 'predictions are locked at kickoff' using errcode = 'P0001';
  end if;
  v_prob := case p_outcome
              when 'home' then v_fixture.prob_home
              when 'draw' then v_fixture.prob_draw
              when 'away' then v_fixture.prob_away
            end;
  if v_prob is null or v_prob <= 0 then
    raise exception 'fixture % has no model probability for %', p_fixture_id, p_outcome using errcode = 'P0001';
  end if;
  v_points := least(greatest(round(20.0 / v_prob)::int, 10), 500);
  insert into public.predictions (user_id, fixture_id, kind, payload, points_possible)
    values (v_user, p_fixture_id, 'match_result', jsonb_build_object('outcome', p_outcome), v_points)
  on conflict (user_id, fixture_id, kind) do update
    set payload = excluded.payload,
        points_possible = excluded.points_possible,
        updated_at = now()
    where predictions.settled_at is null
  returning * into v_row;
  if v_row.id is null then
    raise exception 'prediction already settled' using errcode = 'P0001';
  end if;
  return v_row;
end;
$$;

revoke all on function public.make_prediction(text, text) from public;
revoke all on function public.make_prediction(text, text) from anon;
grant execute on function public.make_prediction(text, text) to authenticated;
