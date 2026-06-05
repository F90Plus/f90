# F90+ — Schema V1 (Supabase / Postgres contract)

> The database contract for [PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md). **Phase 1 tables
> are built now**; the rest is the forward contract (designed, migrated in later phases).
> Every table has **Row-Level Security**. All economy writes go through `SECURITY DEFINER`
> functions — clients never mutate balances or scores directly. This file is a
> **specification**, not a migration; the implementer turns the Phase-1 section into
> `supabase/migrations/0001_identity.sql`. Decisions: [DECISIONS.md](DECISIONS.md) D-027/D-028.

## Conventions

- Schema `public`. UUIDs from `auth.users`. `citext` for case-insensitive usernames.
- **Append-only ledgers** (`coin_ledger`, `score_ledger`) — no `UPDATE`/`DELETE` policies.
- `wallets.coins_balance` and `profiles.total_points` are **projections** of their ledgers.
- Money/score mutations only via `award_coins()` / `award_points()` (`SECURITY DEFINER`,
  pinned `search_path = public`).
- Timestamps `timestamptz default now()`. Soft references across phases avoid hard FKs
  where the parent table doesn't exist yet (noted inline).

---

## Extensions & enums

```sql
create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type position_kind   as enum ('GK','DEF','MID','FWD');
create type ledger_kind     as enum ('signup_bonus','prediction_reward','player_purchase',
                                     'player_sale','fantasy_reward','adjustment');
create type prediction_kind as enum ('match_result','exact_score','bracket','moment');
create type league_kind     as enum ('global','country','private');
```

---

## Phase 1 — built now

### countries — seed from `lib/football`

```sql
create table public.countries (
  code          text primary key,            -- aligned to teamMeta().code
  name_en       text not null,
  name_es       text not null,
  accent_color  text not null,               -- from teams.ts
  is_host       boolean not null default false,
  is_qualified  boolean not null default false,
  strength      integer,                      -- base Elo (model.ts) — used by scoring
  updated_at    timestamptz not null default now()
);
alter table public.countries enable row level security;
create policy "countries public read" on public.countries for select using (true);
-- writes: service_role only (seeded/synced server-side).
```

### profiles — public identity (1:1 with auth.users)

```sql
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        citext unique not null,
  display_name    text,
  country_code    text references public.countries(code),
  avatar          jsonb not null default '{}',   -- own-IP token: {accent,pattern,initials}
  bio             text,
  total_points    bigint not null default 0,     -- projection of score_ledger
  username_changed_at timestamptz,                -- cooldown bookkeeping
  country_changed_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  constraint bio_len check (char_length(bio) <= 280)
);
alter table public.profiles enable row level security;
create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles self update" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);
-- INSERT only via handle_new_user() trigger (no client insert policy).
create index profiles_total_points_idx on public.profiles (total_points desc);
create index profiles_country_idx on public.profiles (country_code);
```

### wallets — spendable currency (server-authoritative projection)

```sql
create table public.wallets (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  coins_balance bigint not null default 0 check (coins_balance >= 0),
  updated_at    timestamptz not null default now()
);
alter table public.wallets enable row level security;
create policy "wallet self read" on public.wallets for select using (auth.uid() = user_id);
-- NO insert/update/delete policy for clients: mutated only by award_coins() (definer).
```

### coin_ledger — append-only source of truth for coins

```sql
create table public.coin_ledger (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  amount        bigint not null,               -- + income / - spend
  kind          ledger_kind not null,
  ref_type      text,                          -- 'prediction' | 'player' | ...
  ref_id        text,
  balance_after bigint not null,
  created_at    timestamptz not null default now()
);
alter table public.coin_ledger enable row level security;
create policy "coin ledger self read" on public.coin_ledger for select using (auth.uid() = user_id);
-- immutable: no insert/update/delete policy (writes via award_coins()).
create index coin_ledger_user_idx on public.coin_ledger (user_id, created_at desc);
```

### score_ledger — append-only skill points (feeds rankings)

```sql
create table public.score_ledger (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  points      bigint not null,
  reason      text not null,                   -- 'prediction' | 'fantasy' | ...
  ref_type    text,
  ref_id      text,
  created_at  timestamptz not null default now()
);
alter table public.score_ledger enable row level security;
create policy "score ledger self read" on public.score_ledger for select using (auth.uid() = user_id);
-- immutable: writes via award_points().
create index score_ledger_user_idx on public.score_ledger (user_id, created_at desc);
```

### Triggers & functions — integrity from day one

```sql
-- New user → profile + wallet + welcome bonus, atomic and server-side.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text := lower(coalesce(new.raw_user_meta_data->>'username',
                               'fan_' || substr(new.id::text, 1, 8)));
begin
  insert into public.profiles (id, username, display_name)
    values (new.id, uname, new.raw_user_meta_data->>'display_name');
  insert into public.wallets (user_id, coins_balance) values (new.id, 0);
  perform public.award_coins(new.id, 20026, 'signup_bonus', null, null);  -- D-039: 20,026 Tokens F90 (was 1,000, D-031; migration 0003)
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only path to mutate a wallet. Atomic: projection + ledger row.
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
   returning coins_balance into new_balance;     -- check(>=0) rejects overspend → tx fails
  insert into public.coin_ledger (user_id, amount, kind, ref_type, ref_id, balance_after)
    values (p_user, p_amount, p_kind, p_ref_type, p_ref_id, new_balance);
  return new_balance;
end;
$$;

-- Only path to mutate points. Atomic: profile projection + ledger row.
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
  insert into public.score_ledger (user_id, points, reason, ref_type, ref_id)
    values (p_user, p_points, p_reason, p_ref_type, p_ref_id);
  return new_total;
end;
$$;
```

> **Why this is safe:** `award_*` are `SECURITY DEFINER` so they run with owner privileges
> regardless of the caller's RLS, but they are the *only* write path and they always write
> the ledger alongside the projection. The `check (coins_balance >= 0)` makes an
> insufficient-funds spend **abort the transaction** — no negative balance is representable.
> Clients call these via RPC only for server-validated operations (Phase 2+); in Phase 1
> the only caller is `handle_new_user`.

### Rankings (Phase 1 read surface)

```sql
-- Simple, correct for MVP scale. Replaced by materialised snapshots at scale.
create view public.global_rankings as
  select id as user_id, username, display_name, country_code, avatar, total_points,
         rank() over (order by total_points desc) as rank
  from public.profiles;
```

### Seed (server-side, from `lib/football`)

```sql
-- Illustrative; the implementer generates the full 48-row seed from teams.ts + nations.ts.
insert into public.countries (code, name_en, name_es, accent_color, is_host, is_qualified, strength) values
  ('USA','United States','Estados Unidos','#2B6CB0', true,  true, 1820),
  ('MEX','Mexico','México','#1F7A4D', true,  true, 1800),
  ('CAN','Canada','Canadá','#C8412B', true,  true, 1760),
  ('ESP','Spain','España','#D4A12B', false, true, 2090),
  ('BRA','Brazil','Brasil','#1FA84C', false, true, 2010)
  -- … remaining 43 qualified nations …
on conflict (code) do update
  set is_host = excluded.is_host, is_qualified = excluded.is_qualified,
      strength = excluded.strength, updated_at = now();
```

---

## Forward contract — designed now, migrated later

> Not created in Phase 1. Included so the implementer can verify Phase 1 fits them, and so
> later phases are a pure add (no reshape of Identity).

### Phase 2 — Predictions & fixtures

```sql
create table public.fixtures (
  id          text primary key,                 -- deterministic: 'mex-rsa-2026-06-11'
  group_label text, round text, kickoff_at timestamptz,
  home_code   text references public.countries(code),
  away_code   text references public.countries(code),
  home_goals  integer, away_goals integer,
  status      text not null default 'upcoming', -- upcoming | live | final
  source      text not null default 'openfootball',
  updated_at  timestamptz not null default now()
);

create table public.predictions (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  fixture_id      text not null references public.fixtures(id),
  kind            prediction_kind not null,
  payload         jsonb not null,               -- {winner} | {home,away} | {bracket} ...
  points_possible integer,                       -- from model.ts difficulty
  settled_at      timestamptz,
  awarded_points  integer,
  awarded_coins   integer,
  created_at      timestamptz not null default now(),
  unique (user_id, fixture_id, kind)
);
-- RLS: predictions are owner-read/owner-write BEFORE kickoff; locked after (enforced server-side).
```

### Phase 3 — Players, market, squads, XI

```sql
create table public.players (
  id            bigint generated always as identity primary key,
  name          text not null,                  -- fact (D-025)
  country_code  text references public.countries(code),
  position      position_kind not null,
  card          jsonb not null default '{}',    -- own-IP token (accent, number, pattern)
  base_price    bigint not null,
  current_price bigint not null,                 -- dynamic (Comunio-style)
  total_points  bigint not null default 0,
  is_active     boolean not null default true
);

create table public.player_price_history (
  player_id bigint references public.players(id) on delete cascade,
  price     bigint not null,
  at        timestamptz not null default now(),
  primary key (player_id, at)
);

create table public.squads (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text,
  created_at timestamptz not null default now(),
  unique (user_id)                               -- one squad per user (revisable)
);

create table public.squad_players (
  squad_id     bigint references public.squads(id) on delete cascade,
  player_id    bigint references public.players(id),
  bought_price bigint not null,
  bought_at    timestamptz not null default now(),
  sold_at      timestamptz,
  primary key (squad_id, player_id, bought_at)
);

create table public.lineups (                    -- the starting XI per matchday
  id         bigint generated always as identity primary key,
  squad_id   bigint references public.squads(id) on delete cascade,
  matchday   integer not null,
  player_ids bigint[] not null,                  -- 11 starters
  captain_id bigint,
  unique (squad_id, matchday)
);

create table public.player_match_scores (        -- real-performance points (FPL-style)
  player_id  bigint references public.players(id),
  fixture_id text references public.fixtures(id),
  points     integer not null,
  breakdown  jsonb,                               -- {goals, assists, clean_sheet, minutes...}
  primary key (player_id, fixture_id)
);
```

### Phase 4 — Leagues & ranking snapshots

```sql
create table public.leagues (
  id          bigint generated always as identity primary key,
  name        text not null,
  kind        league_kind not null,
  owner_id    uuid references public.profiles(id),
  invite_code text unique,
  created_at  timestamptz not null default now()
);

create table public.league_members (
  league_id bigint references public.leagues(id) on delete cascade,
  user_id   uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

create table public.rankings_snapshots (          -- materialised boards at scale
  scope      text not null,                       -- 'global' | 'country:ESP' | 'league:42' | 'matchday:3'
  user_id    uuid references public.profiles(id) on delete cascade,
  rank       integer not null,
  points     bigint not null,
  captured_at timestamptz not null default now(),
  primary key (scope, user_id, captured_at)
);
```

---

## RLS summary

| Table | Read | Write |
| --- | --- | --- |
| `countries` | public | service_role |
| `profiles` | public | self update only; insert via trigger |
| `wallets` | self | **definer only** (no client policy) |
| `coin_ledger` | self | **definer only** (immutable) |
| `score_ledger` | self | **definer only** (immutable) |
| `predictions` (P2) | self | self before kickoff; locked after (server) |
| `players` / `fixtures` (P2/P3) | public | service_role / ingestion job |
| `squads`/`squad_players`/`lineups` (P3) | self (public XI optional) | self via validated actions |
| `leagues`/`league_members` (P4) | members / public | owner / self join |

---

## Migration plan

1. `0001_identity.sql` — extensions, enums, **Phase 1 tables**, triggers, `award_coins`,
   `award_points`, `global_rankings` view, RLS policies, indexes.
2. `0002_countries_seed.sql` — full 48-row `countries` seed generated from `teams.ts` +
   `nations.ts`.
3. Phase 2+ migrations add the forward tables verbatim from this contract.

Applied via the Supabase CLI (`supabase db push` / migration files in `supabase/`), kept
in the repo, reviewed like code. No schema change is made outside a migration file.
