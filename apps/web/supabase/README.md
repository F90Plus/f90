# F90+ — Supabase (database)

Versioned schema for F90+. Source contract: [`docs/SCHEMA_V1.md`](../../../docs/SCHEMA_V1.md)
(D-027 economy, D-028 latent foundations, D-031 identity defaults). Must stay
compatible with the expanded vision (D-034).

## Migrations (apply in order)

| File | What it creates |
| --- | --- |
| `20260604000001_identity.sql` | Phase 1 schema: `countries`, `profiles`, `wallets`, `coin_ledger`, `score_ledger`; `award_coins` / `award_points`; `handle_new_user` trigger; `global_rankings` view; RLS on every table + indexes. |
| `20260604000002_countries_seed.sql` | The 48 WC2026 nations, derived from `lib/football/teams.ts` (codes/accents/strengths) + Spanish names. Hosts: USA, Mexico, Canada. |

## Security notes (hardening over the base contract)

- `award_*` are `SECURITY DEFINER` with a pinned `search_path`; **EXECUTE is
  revoked from `anon`/`authenticated`** and granted only to `service_role` — no
  client can mint currency via RPC. The trigger (definer) and the server
  (service_role) are the only callers.
- `global_rankings` uses `security_invoker = true` (honours RLS, never bypasses it).
- Every `public` table has RLS enabled; `wallets` + ledgers are owner-read and
  **server-write-only** (no client write policy).
- RLS predicates use `(select auth.uid())` so the check is evaluated once per query.

## D-034 forward-compat

The economy is **generic**: `coin_ledger.kind` (incl. `market_trade`,
`player_purchase`, `player_sale`, `fantasy_reward`) plus `(ref_type, ref_id)`
absorb predictions, Polymarket-style markets, player trading and fantasy — all
through the **same wallet + points**, with no reshape of Identity. Forward tables
(`fixtures`, `predictions`, `players`, `squads`, `lineups`, `leagues`) are designed
in `SCHEMA_V1.md` and built in their own phases (D-028) — intentionally not here.

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
