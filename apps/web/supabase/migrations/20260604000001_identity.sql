-- =============================================================================
-- F90+ — Identity & Economy schema (Phase 1) — migration 0001
--
-- Source contract: docs/SCHEMA_V1.md (D-027 economy, D-028 latent foundations,
-- D-031 welcome bonus). Built NOW: countries, profiles, wallets, coin_ledger,
-- score_ledger + the award_* economy functions, the new-user trigger and the
-- rankings view.
--
-- D-034 forward-compat: the economy is GENERIC. coin_ledger.kind /
-- (ref_type, ref_id) and the award_* functions absorb ANY future economic
-- source — predictions, Polymarket-style markets, player trading, fantasy — all
-- through the SAME wallet + points, with no reshape of Identity. Forward tables
-- (fixtures, predictions, players, squads, lineups, leagues) are designed in
-- SCHEMA_V1 and built in their own phases (D-028) — intentionally NOT here.
--
-- Security hardening vs the base contract (Supabase security checklist):
--   * award_* are SECURITY DEFINER with a pinned search_path AND have EXECUTE
--     revoked from anon/authenticated (granted only to service_role) so no
--     client can call them via RPC to mint coins/points.
--   * global_rankings is a security_invoker view (does not bypass RLS).
--   * RLS uses (select auth.uid()) so the check is evaluated once per query.
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Enums -----------------------------------------------------------------------
-- ledger_kind carries Phase-1 values plus the forward ones (D-034) so later
-- phases never need a fragile ALTER TYPE on a live economy.
do $$ begin
  create type ledger_kind as enum (
    'signup_bonus',
    'prediction_reward',
    'market_trade',
    'player_purchase',
    'player_sale',
    'fantasy_reward',
    'adjustment'
  );
exception when duplicate_object then null; end $$;

-- countries -------------------------------------------------------------------
-- Seeded from lib/football (teams.ts + nations.ts) in migration 0002.
create table public.countries (
  code         text primary key,            -- aligned to teamMeta().code
  name_en      text not null,
  name_es      text not null,
  accent_color text not null,               -- from teams.ts
  is_host      boolean not null default false,
  is_qualified boolean not null default false,
  strength     integer,                     -- base Elo (model.ts) — used by scoring
  updated_at   timestamptz not null default now()
);
alter table public.countries enable row level security;
create policy "countries public read" on public.countries
  for select using (true);
-- Writes: service_role only (seeded/synced server-side). No client write policy.

-- profiles --------------------------------------------------------------------
-- Public identity, 1:1 with auth.users. Carries no subsystem-specific fields
-- (D-034) — future pillars read from it, never reshape it.
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  username            citext unique not null,
  display_name        text,
  country_code        text references public.countries(code),
  avatar              jsonb not null default '{}'::jsonb,   -- own-IP token (D-025/D-031)
  bio                 text,
  total_points        bigint not null default 0,            -- projection of score_ledger
  username_changed_at timestamptz,                          -- 30-day cooldown bookkeeping
  country_changed_at  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  constraint bio_len check (char_length(bio) <= 280)
);
alter table public.profiles enable row level security;
create policy "profiles public read" on public.profiles
  for select using (true);
create policy "profiles self update" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- INSERT only via the handle_new_user() trigger (no client insert policy).
create index profiles_total_points_idx on public.profiles (total_points desc);
create index profiles_country_idx on public.profiles (country_code);

-- wallets ---------------------------------------------------------------------
-- Spendable currency. Server-authoritative projection of coin_ledger.
create table public.wallets (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  coins_balance bigint not null default 0 check (coins_balance >= 0),
  updated_at    timestamptz not null default now()
);
alter table public.wallets enable row level security;
create policy "wallet self read" on public.wallets
  for select using ((select auth.uid()) = user_id);
-- No client insert/update/delete: mutated only by award_coins() (definer).

-- coin_ledger -----------------------------------------------------------------
-- Append-only source of truth for coins. Immutable to clients.
create table public.coin_ledger (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  amount        bigint not null,             -- + income / - spend
  kind          ledger_kind not null,
  ref_type      text,                        -- 'prediction' | 'market' | 'player' | ...
  ref_id        text,
  balance_after bigint not null,
  created_at    timestamptz not null default now()
);
alter table public.coin_ledger enable row level security;
create policy "coin ledger self read" on public.coin_ledger
  for select using ((select auth.uid()) = user_id);
-- Immutable: no insert/update/delete policy (writes via award_coins()).
create index coin_ledger_user_idx on public.coin_ledger (user_id, created_at desc);

-- score_ledger ----------------------------------------------------------------
-- Append-only skill points (feeds rankings). Immutable to clients.
create table public.score_ledger (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  points     bigint not null,
  reason     text not null,                  -- 'prediction' | 'fantasy' | 'market' | ...
  ref_type   text,
  ref_id     text,
  created_at timestamptz not null default now()
);
alter table public.score_ledger enable row level security;
create policy "score ledger self read" on public.score_ledger
  for select using ((select auth.uid()) = user_id);
create index score_ledger_user_idx on public.score_ledger (user_id, created_at desc);

-- Economy functions -----------------------------------------------------------
-- The ONLY write path to balances/points. Atomic: projection + ledger row.
-- SECURITY DEFINER + pinned search_path; EXECUTE revoked from clients (below).

create or replace function public.award_coins(
  p_user uuid, p_amount bigint, p_kind ledger_kind, p_ref_type text, p_ref_id text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare new_balance bigint;
begin
  update public.wallets
     set coins_balance = coins_balance + p_amount, updated_at = now()
   where user_id = p_user
   returning coins_balance into new_balance;   -- check(>=0) rejects overspend -> tx aborts
  if new_balance is null then
    raise exception 'award_coins: no wallet for user %', p_user;
  end if;
  insert into public.coin_ledger (user_id, amount, kind, ref_type, ref_id, balance_after)
    values (p_user, p_amount, p_kind, p_ref_type, p_ref_id, new_balance);
  return new_balance;
end;
$$;

create or replace function public.award_points(
  p_user uuid, p_points bigint, p_reason text, p_ref_type text, p_ref_id text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare new_total bigint;
begin
  update public.profiles
     set total_points = total_points + p_points, updated_at = now()
   where id = p_user
   returning total_points into new_total;
  if new_total is null then
    raise exception 'award_points: no profile for user %', p_user;
  end if;
  insert into public.score_ledger (user_id, points, reason, ref_type, ref_id)
    values (p_user, p_points, p_reason, p_ref_type, p_ref_id);
  return new_total;
end;
$$;

-- Hardening: clients must never mint currency via RPC. Only the trigger (runs as
-- definer/owner) and the server (service_role) may call these.
revoke execute on function public.award_coins(uuid, bigint, ledger_kind, text, text)
  from public, anon, authenticated;
revoke execute on function public.award_points(uuid, bigint, text, text, text)
  from public, anon, authenticated;
grant execute on function public.award_coins(uuid, bigint, ledger_kind, text, text)
  to service_role;
grant execute on function public.award_points(uuid, bigint, text, text, text)
  to service_role;

-- New user -> profile + wallet + welcome bonus, atomic and server-side (D-031).
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
  perform public.award_coins(new.id, 1000, 'signup_bonus', null, null);  -- 1,000 welcome coins
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rankings read surface (Phase 1: a real, initially-empty teaser). -------------
-- security_invoker so it honours profiles' RLS (world-readable) rather than
-- bypassing it. At scale this is replaced by materialised snapshots (SCHEMA_V1).
create view public.global_rankings
  with (security_invoker = true)
as
  select id as user_id, username, display_name, country_code, avatar, total_points,
         rank() over (order by total_points desc) as rank
  from public.profiles;

-- Data API exposure -----------------------------------------------------------
-- Table-level privileges are the FIRST gate (RLS above governs WHICH rows). New
-- Supabase projects do not auto-grant, so we grant explicitly:
--   * countries / profiles / global_rankings: world-readable (anon + authenticated).
--   * wallets / ledgers: authenticated only (RLS then filters to the owner).
--     anon is granted NOTHING here -> cannot even query them (defence in depth).
grant select on public.countries      to anon, authenticated;
grant select on public.profiles       to anon, authenticated;
grant update on public.profiles       to authenticated;
grant select on public.wallets        to authenticated;
grant select on public.coin_ledger    to authenticated;
grant select on public.score_ledger   to authenticated;
grant select on public.global_rankings to anon, authenticated;
