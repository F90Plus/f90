-- =============================================================================
-- F90+ — Welcome bonus → 20,026 Tokens F90 (migration 0003)
--
-- Supersedes the 1,000-coin welcome bonus from migration 0001 (D-031). The new
-- value is 20,026 (→ the 2026 World Cup) and the currency is branded "Tokens F90"
-- in the UI (D-039). Tokens F90 are VIRTUAL — free-to-play, no real money, no
-- gambling.
--
-- This replaces handle_new_user() IN PLACE (CREATE OR REPLACE). The trigger
-- on_auth_user_created already points at it, so no trigger change is needed. The
-- economy stays generic (D-034): same wallet, same coin_ledger, same award_coins —
-- only the bonus amount changes. Idempotent and safe to re-run.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text := lower(coalesce(
    new.raw_user_meta_data->>'username',
    'fan_' || substr(replace(new.id::text, '-', ''), 1, 8)));
begin
  insert into public.profiles (id, username, display_name)
    values (new.id, uname, new.raw_user_meta_data->>'display_name');
  insert into public.wallets (user_id, coins_balance) values (new.id, 0);
  -- 20,026 Tokens F90 welcome bonus (D-039; was 1,000 in 0001).
  perform public.award_coins(new.id, 20026, 'signup_bonus', null, null);
  return new;
end;
$$;
