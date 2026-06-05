-- =============================================================================
-- F90+ — Prediction settlement (Phase 2) — migration 0005
--
-- Source contract: docs/SCHEMA_V1.md (Phase 2 — Predictions & fixtures) +
-- D-034 (one generic economy). Built NOW: settle_fixture(), the server-side,
-- atomic, idempotent function that awards REAL points + Tokens F90 for correct
-- match-result picks once a fixture is final.
--
-- The award is the prediction's ALREADY-STORED points_possible (set
-- authoritatively at pick time by make_prediction() in migration 0004) — so
-- settlement does NO scoring re-computation and CANNOT drift from what the user
-- was promised. Coins are awarded 1:1 with points (lib/scoring.coinsForPoints).
--
-- All balance/points writes go through the existing award_* economy functions
-- (migration 0001), so wallet + total_points stay server-authoritative and the
-- coin_ledger / score_ledger stay correct and append-only. settle_fixture itself
-- never touches a balance directly.
--
-- IDEMPOTENCY (no double-award under re-run or concurrency):
--   * Only UNSETTLED picks (settled_at is null) are processed, and each is
--     SELECT ... FOR UPDATE row-locked. A concurrent settlement blocks on the
--     lock; when it resumes the row's settled_at is set, so it is no longer
--     selected. A second sequential run finds zero unsettled rows. Either way a
--     prediction's award_* path runs at most once.
--   * The whole loop runs in ONE transaction (a single function call). If any
--     award raises (e.g. a wallet overspend check), the entire settlement of
--     that fixture rolls back — no partial awards, no half-settled state.
--
-- Security hardening (Supabase security checklist):
--   * settle_fixture is SECURITY DEFINER with a pinned search_path and has
--     EXECUTE revoked from public/anon/authenticated and granted ONLY to
--     service_role — so no client can settle fixtures (mint points/coins) via RPC.
--     This mirrors the award_* / make_prediction hardening pattern.
-- =============================================================================

create or replace function public.settle_fixture(p_fixture_id text)
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  v_fx public.fixtures;
  v_outcome text;
  v_pred record;
  v_count integer := 0;
begin
  select * into v_fx from public.fixtures where id = p_fixture_id;
  if not found then raise exception 'fixture not found: %', p_fixture_id using errcode = 'P0002'; end if;
  if v_fx.status <> 'final' or v_fx.home_goals is null or v_fx.away_goals is null then
    raise exception 'fixture % not final with scores', p_fixture_id using errcode = 'P0001';
  end if;
  v_outcome := case when v_fx.home_goals > v_fx.away_goals then 'home'
                    when v_fx.home_goals < v_fx.away_goals then 'away'
                    else 'draw' end;
  for v_pred in
    select * from public.predictions
    where fixture_id = p_fixture_id and settled_at is null and kind = 'match_result'
    for update
  loop
    if (v_pred.payload->>'outcome') = v_outcome then
      perform public.award_points(v_pred.user_id, v_pred.points_possible, 'prediction', 'prediction', v_pred.id::text);
      perform public.award_coins(v_pred.user_id, v_pred.points_possible, 'prediction_reward', 'prediction', v_pred.id::text);
      update public.predictions set settled_at = now(), awarded_points = v_pred.points_possible, awarded_coins = v_pred.points_possible where id = v_pred.id;
    else
      update public.predictions set settled_at = now(), awarded_points = 0, awarded_coins = 0 where id = v_pred.id;
    end if;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- Hardening: clients must never settle fixtures (mint points/coins) via RPC.
-- Only the server (service_role) may call this.
revoke all on function public.settle_fixture(text) from public;
revoke all on function public.settle_fixture(text) from anon;
revoke all on function public.settle_fixture(text) from authenticated;
grant execute on function public.settle_fixture(text) to service_role;
