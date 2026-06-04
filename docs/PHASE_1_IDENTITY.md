# F90+ — Phase 1: Identity & Accounts (implementation spec)

> The build contract for Phase 1. Identity is **layer 2 of 4** in the living-World-Cup
> model ([EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md): World · **Identity** · **Economy** ·
> Time). This phase is **not a login screen** — it is the foundation of the full loop:
> *predict → earn points → earn coins → buy players → build your XI → compete*. It builds
> the user, the public profile, the country bond, and a **server-authoritative economy**
> that stays latent until later phases spend it.
>
> Status: **READY FOR IMPLEMENTATION** (design ratified by founder, 2026-06-04). No code
> written yet. Companions: [SCHEMA_V1.md](SCHEMA_V1.md) (the database contract) ·
> [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md) (the task breakdown) ·
> [DECISIONS.md](DECISIONS.md) (D-027→D-031, the *why*).

---

## The loop this phase enables

```
1. Predict        →  2. Get it right   →  3. Earn POINTS (rank) + COINS (wallet)
        ↑                                              │
        │                                              ▼
8. Predict again ← 7. Compete (rankings/leagues) ← 4. Buy players (spend COINS)
                                                       │
                          6. Players score from real performance ← 5. Build your XI
```

Phase 1 builds **steps that touch identity & the wallet** and **prepares the data spine**
for every other step, so Phases 2–4 plug in without a rewrite. The proof that Identity is
designed correctly: adding Predictions, the Market, Fantasy and the XI later **does not
touch** `profiles`, `wallets`, `auth`, or the ledgers — it only adds new tables that read
from them.

---

## Objectives

1. **Real, isolated authentication** — F90+'s **own** Supabase project (never shared with
   PMS/PT/Chiribito/XPrediction), SSR-safe sessions via `@supabase/ssr` (cookies).
2. **Public identity** — unique `username`, a **favourite country** (Identity layer +
   country-hub tribalism, `EXPERIENCE_SYSTEM §5`), an **own-IP avatar** (D-025, no photos),
   and a bio. The public profile is a first-class, shareable surface (growth loop).
3. **Server-authoritative economy from day one** — `wallets` + an **append-only**
   `coin_ledger`, mutated only by `SECURITY DEFINER` functions. Economic integrity cannot
   be retrofitted; it is built now even though spending arrives in Phase 3.
4. **Points & ranking skeleton** — `score_ledger` + `profiles.total_points` exist and the
   rankings surface renders as a real (initially empty) teaser, replacing the mock.
5. **Verified forward-compatibility** — `fixtures`, `predictions`, `players`, `squads`,
   `lineups`, `leagues` are **designed now, built later**, with no reshaping of Phase 1.
6. **Invariants intact** — i18n total (ES/EN, no hardcoded copy), tokens, mobile-first /
   dual-surface parity (D-021), no paid LLM / no paid data in V1, portable, fully isolated.

**Non-goals (explicit).** No prediction flow, no player market, no fantasy scoring, no
leagues, no populated ranking. Phase 1 **prepares the ground** for all of them.

---

## Ratified economy model (D-027)

Three concepts, three purposes — formalises `EXPERIENCE_SYSTEM §8` and the founder's loop:

| Currency | Earned by | Spent on | Lowers rank? | Mutability |
| --- | --- | --- | --- | --- |
| **Points** | correct predictions, fantasy performance | nothing — permanent skill score | — | append-only (`score_ledger`) |
| **Coins** | every points award also credits coins | players, fantasy moves | **never** | append-only (`coin_ledger`) |
| **Reputation** | derived, cross-pillar (Phase 4+) | — | — | computed |

**The conversion (the founder's "points become the economy"):** a correct prediction
credits **points** (which raise your ranking, permanently) **and** **coins** (which enter
your spendable wallet). You spend **coins**, never your ranking — so competing and buying
are independent axes and there is **no dark pattern** where spending sets you back. The
same wallet and the same point total power every pillar: one character, one economy.

---

## Architecture

### How it fits the current codebase

The foundation is already server-first (RSC) with an honest data boundary
(`ARCHITECTURE.md`: `data/` "becomes the point where Supabase plugs in"). Phase 1
materialises that boundary:

```
Request
  → proxy.ts            ← COMPOSED HERE: next-intl locale  +  Supabase session refresh
  → app/[locale]/layout ← NextIntlClientProvider; session read on the server (cookies)
  → RSC                 ← read session via lib/supabase/server
  → Server Actions      ← signIn / signUp / signOut / updateProfile (Zod-validated)
  → Postgres (Supabase) ← strict RLS + SECURITY DEFINER functions for all economy writes
```

> **Critical integration point.** `proxy.ts` already negotiates locale with next-intl.
> Supabase SSR must **also** refresh the session in middleware. These are **composed into
> one** middleware (run next-intl, then `updateSession` over the same response) — not two
> independent middlewares. This is the first and most delicate technical task of the phase.

### What is reused (nothing is thrown away)

| Existing asset | Role in the expanded vision |
| --- | --- |
| `lib/football/nations.ts` (real hosts/qualified) | **Seed of `countries`** + the country picker at onboarding. |
| `lib/football/teams.ts` (code/accent/strength) | Seed of `countries.accent_color` + strength base for prediction difficulty. **Complete to 48 first** (audit debt). |
| `lib/football/openfootball.ts` (real fixtures) | **Seed/ingest of `fixtures`** → the stable IDs `predictions` need to settle. |
| `lib/football/model.ts` (Elo logistic) | The **prediction-difficulty engine** (underdog correct = more points) — honest scoring, not arbitrary. |
| `lib/copilot/engine` (deterministic, pure) | Narrative + "predict against The Analyst" (Phase 5). Already built. |
| `data/leaderboard.ts` (mock) | **Replaced** by the real `rankings` query (same interface → localised change). |
| `lib/football/types.ts` | Extended with the new domain types. |
| Cache-first adapter pattern | Replicated for `fixtures` / `players` / results ingestion. |

### What is introduced (new)

```
apps/web/src/
├── lib/
│   ├── supabase/{server,client,middleware}.ts   # @supabase/ssr clients
│   ├── db/                                        # typed repositories (profiles, wallet, rankings)
│   └── economy/                                   # award.ts — calls the SECURITY DEFINER RPCs
├── features/
│   ├── auth/                                      # sign-in / sign-up / oauth / sign-out
│   └── profile/                                   # profile editor + public profile card
├── app/[locale]/
│   ├── (auth)/{login,signup,callback}/            # auth routes (route group)
│   ├── (app)/                                     # protected, auth-aware routes
│   └── u/[username]/                              # PUBLIC profile (RSC + dynamic OG → growth)
└── proxy.ts                                       # UPDATED: next-intl + Supabase composed
```

**Isolation (founder gate).** A dedicated F90+ Supabase project (its own org/account),
mirroring the Vercel isolation rule in [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md). The
`service_role` key lives only on the server, never in the client bundle.

---

## Data model

Full domain, designed now; each table tagged with the phase it is **built** in. The DDL
lives in [SCHEMA_V1.md](SCHEMA_V1.md); this is the shape and the rules.

```
                      ┌─────────────┐
        auth.users ──▶│  profiles   │◀── countries (seed from lib/football)
        (Supabase)    └──────┬──────┘
                             │ 1:1
                ┌────────────┼─────────────┬───────────────┐
                ▼            ▼             ▼               ▼
           ┌─────────┐ ┌────────────┐ ┌──────────┐   ┌──────────────┐
           │ wallets │ │score_ledger│ │ squads   │   │league_members│
           └────┬────┘ └────────────┘ └────┬─────┘   └──────┬───────┘
                │ projection of            │ 1:N            │
                ▼                          ▼                ▼
          ┌────────────┐           ┌──────────────┐   ┌─────────┐
          │ coin_ledger│           │ squad_players│   │ leagues │
          │(append-only)│          └──────┬───────┘   └─────────┘
          └────────────┘                  │
                                           ▼  references
   predictions ──▶ fixtures ◀── players ◀──┴── player_match_scores
   (Phase 2)        (Phase 2)    (Phase 3)        (Phase 3/5)
```

**Three structural principles fixed in Phase 1:**

1. **Money is a ledger, not a number.** `coin_ledger` is append-only and immutable;
   `wallets.coins_balance` is a **cached projection**. No client ever does
   `UPDATE balance = balance + x`. Every mutation goes through a `SECURITY DEFINER`
   function. Anti-cheat by construction; impossible to bolt on later.
2. **Three currencies, three purposes** (D-027) — points (skill, permanent), coins
   (spendable), reputation (derived, Phase 4+).
3. **Public vs private split.** `profiles`/`countries` are world-readable; `wallets`,
   `coin_ledger`, `score_ledger` are **owner-only** and **server-write-only** via RLS.

---

## Users

- **Root identity** = `auth.users` (Supabase-managed). F90+ **never** stores passwords.
- **Automatic provisioning** — a trigger creates `profile` + `wallet` + a welcome bonus in
  the same instant as signup. No user ever exists without a wallet and a profile.
- **Username** — `^[a-z0-9_]{3,20}$`, unique (case-insensitive via `citext`). It is the
  public identity and the profile URL. Changeable with a **cooldown** (default 30 days) so
  links don't rot and impersonation is curtailed.
- **Favourite country** — chosen at onboarding (`EXPERIENCE_SYSTEM §5`), funds country-hub
  membership and the emotional thread. Changeable with a cooldown (anti tribe-hopping once
  country leagues exist).
- **Deletion** — `on delete cascade` cleans profile/wallet/ledgers. (A country's sporting
  **elimination** does **not** touch the account — D-026; different concepts.)

---

## Public profiles

- **Route** — `/[locale]/u/[username]`, an **RSC** with `generateMetadata` producing a
  **per-user OG card** → the profile is shareable and feeds the growth loop
  (`PROJECT_VISION`: "sharing your story / inviting friends is the main growth loop").
- **Phase 1 content** — own-IP avatar, `display_name` + `@username`, **country badge**
  (with its accent token), join date, `total_points` (0 at first), rank position (teaser).
- **Reserved slots (designed now, filled later)** — streak & reputation (Phase 4); XI &
  squad value (Phase 3); prediction history and "calls I got right" (Phase 2); personal
  Analyst narrative (Phase 5). The profile **is** your World Cup journey.
- **Privacy** — profile public; wallet, ledgers and prediction drafts owner-only (RLS).
- **Avatar (D-025)** — no photos. A deterministic composite token (initials + country
  accent + pattern) rendered as SVG; shares the philosophy of the player-card system for
  visual coherence from day one.

---

## Authentication

- **Library** — `@supabase/ssr` (cookie-based, not `localStorage`) — the correct pattern
  for Next 16 App Router / RSC.
- **Methods (D-030)** — **email magic-link** (no password management) + **Google OAuth** +
  **Apple OAuth** (needed for future PWA/iOS). GitHub is intentionally excluded.
- **SSR flow** — `lib/supabase/server.ts` (`createServerClient` for RSC + Server Actions),
  `lib/supabase/client.ts` (`createBrowserClient` for interactive islands), `proxy.ts`
  (next-intl + `updateSession` composed), `(auth)/callback` (OAuth code exchange → session).
- **Mutations via Server Actions** — `signIn`, `signUp`, `signOut`, `updateProfile`;
  server-side Zod validation; route revalidation.
- **Protected routes** — the `(app)/` route group checks the session in its layout (RSC)
  and redirects to login if absent. Header is **auth-aware** (avatar + menu when signed in;
  "Sign in" CTA when not).
- **i18n** — new namespaces `auth`, `profile`, `onboarding`, `rankings` in
  `locales/{es,en}.json`; parity mandatory, zero hardcoded copy.
- **Security** — RLS on every table; wallet/ledgers never client-writable; `SECURITY
  DEFINER` functions with a pinned `search_path`; `service_role` server-only.

---

## Rankings

- **Source of truth** — `profiles.total_points`, a projection of `score_ledger`. Rankings
  do **not** depend on the wallet — competing and spending are separate axes.
- **Phase 1** — the rankings query exists and renders as a **teaser** ("your position
  appears once predictions begin"), replacing the `data/leaderboard.ts` mock with real
  (empty) data.
- **Scopes designed in** (activate once points exist) — **global**, **by country**
  (`country_code` filter), **by league** (`league_members`), and **time-boxed**
  (matchday / group stage / knockouts) via windows over `score_ledger.created_at`.
- **Scale** — MVP: an indexed ordered query. At scale: periodic **materialised snapshots**
  (`rankings_snapshots`) instead of recomputing a global board per request (cache-first,
  the foundation's lesson).
- **Reputation** (Phase 4) — a derived cross-pillar metric above raw points.

---

## Future points system (designed, lit in Phase 2)

The contract (`score_ledger` + server-side award) is fixed now; the mechanic turns on in
Phase 2:

- **Difficulty-honest points** (reuses `model.ts`): `points = base × difficulty +
  exactness_bonus`. Calling the **underdog** (low model probability) is worth **more** than
  calling the favourite — real-data scoring, not arbitrary numbers ("real or nothing",
  D-023).
- **Prediction kinds** (`prediction_kind`): match result (1X2), exact score, brackets
  (road to the title), and "moments". Each with its own points table.
- **Server-side settlement** — when `fixtures.status → final`, a job walks the predictions,
  computes points via the engine, and **credits in one transaction** `award_points`
  (→ `score_ledger` + `total_points`) **and** `award_coins` (→ wallet). The user never
  touches their own score.
- **Lock at kickoff** — `predictions` become read-only after `fixtures.kickoff_at`.
- **Anti-cheat** — all computation and crediting happen server-side; the client only
  *proposes* a prediction before lock.

---

## Fantasy football compatibility

The schema already supports the **Comunio × FPL** model without reshaping Identity:

- **Open economy (Comunio-style)** — buy/sell with **earned coins** (not a fixed budget).
  `coin_ledger` records `player_purchase`/`player_sale`; `wallets.coins_balance >= 0`
  blocks over-spending at the database level.
- **Dynamic market** — `players.current_price` evolves with demand + real performance;
  `price_history` (minor table) powers Comunio-style price charts. Spotting *sleepers*
  before they rise = the "Discovery" pillar.
- **Real-performance points (FPL-style)** — `player_match_scores` (goals, assists, clean
  sheets, minutes…) per player per fixture, with a `breakdown` jsonb. These raise
  `players.total_points` **and** credit the owner (`fantasy_reward`).
- **Player data dependency (to plan)** — openfootball has no detailed rosters. The ~48
  squads (~1,250 players) need **football-data.org** (adapter already env-gated) or
  **api-football** (free 100/day). `names + stats = facts` (D-025, no licences). Reuses the
  cache-first adapter pattern.
- **Identity link** — every fantasy move runs through the **same wallet** and adds to the
  **same points/profile** — one character, one economy, not a separate module.

---

## XI Ideal compatibility

- **`squads`** (your roster) + **`squad_players`** (what you own, with buy price for P&L) +
  **`lineups`** (your **starting XI per matchday**, 11 from your roster, with a captain).
- **Formation validation** is business logic in the award/Server-Action layer (not the
  client): composition by `position_kind` (e.g. 1 GK, 3–5 DEF…), captain multiplier — all
  verifiable server-side.
- **The XI generates points** — at each matchday's end, your starters' `player_match_scores`
  aggregate into profile points. The XI is a points source just like predictions → both
  pillars feed the same ranking.
- **Forward-compat proven** — building the XI in Phase 3 **does not touch**
  `profiles`/`wallets`/`auth`; it only adds `players`/`squads`/`lineups` and plugs into the
  wallet and score that already exist. That is the test that Identity is designed right.

---

## Updated roadmap (summary)

Reordered by loop dependency (full version in [ROADMAP.md](ROADMAP.md)):

| Phase | Name | Unlocks |
| --- | --- | --- |
| 0 | Foundation | ✅ closed |
| 0.5 | Public launch (GitHub + Vercel + f90.xyz) | ⏳ founder |
| **1** | **Identity & Accounts** | the protagonist + the latent economy — **this phase** |
| 2 | Predictions Core & Scoring | **generates** points + coins → daily use |
| 3 | Economy: Market + Fantasy XI | **spends** coins → roster + ideal XI |
| 4 | Rankings, Leagues & Reputation | competition + the viral loop |
| 5 | Narrative / The Analyst (live) | editorial soul (engine already built) |
| 6 | Momentum / Heat on the globe | the living planetary pulse |
| 7 | Live tracking · shareable cards · notifications · PWA | retention + acquisition |

---

## Risks

| # | Risk | Sev | Design mitigation |
| --- | --- | --- | --- |
| 1 | Economy poorly grounded (mutable numbers, races, negative balances) | High | Append-only ledger + projection + atomic `SECURITY DEFINER` functions + `check >= 0` **from Phase 1**. |
| 2 | next-intl + Supabase middleware mis-composed | High | First technical deliverable; explicit composition in `proxy.ts`, verified ES/EN before anything else. |
| 3 | Weak RLS (wallet leak, client-written score) | High | RLS on every table; wallet/ledgers have no client write policy; policy audit is a phase gate. |
| 4 | `teams.ts` 37/48 + no roster source blocks fantasy | Med | Complete the 48 in pre-flight; plan the player adapter (football-data/api-football) before Phase 3. |
| 5 | Fixtures without stable IDs breaks settlement | Med | Canonical `fixtures` table synced from openfootball with deterministic IDs; display stays cache-first. |
| 6 | Scope creep (fantasy/market in Phase 1) | Med | Phase 1 = Identity + latent foundations only; the rest is **designed, not built** (this doc fixes that). |
| 7 | Live data cost (rosters/stats) | Low | Start on free tiers; `names+stats=facts`; honest degradation if data is missing (invariant #9). |
| 8 | OAuth Apple/Google config (callbacks, domains) | Low | Configured after `f90.xyz` connects; document redirect URLs per environment. |
| 9 | PII / compliance (emails, GDPR, age) | Low | Supabase handles auth; `profiles` carries no needless PII; onboarding shows a privacy + "virtual only, not betting" notice. |

---

## MVP (smallest correct slice)

Everything else is designed but not built.

- [ ] Isolated Supabase project + `@supabase/ssr` + composed middleware (next-intl + session).
- [ ] Auth: magic-link + Google (Apple if config lands in time).
- [ ] `handle_new_user` trigger → `profiles` + `wallets` + welcome bonus (`award_coins`).
- [ ] Minimal onboarding: pick `username` + favourite country.
- [ ] Public profile `/u/[username]` (RSC + dynamic OG): avatar, country, join date, points=0.
- [ ] Settings: edit `display_name`, bio, avatar.
- [ ] Auth-aware header + protected `(app)/` routes.
- [ ] RLS on every table + `countries` seeded from `lib/football`.
- [ ] i18n ES/EN parity + DoD green (typecheck, build, browser ES/EN/mobile, 0 console errors).

**Out of MVP (designed, not built):** predictions, market, fantasy, XI, leagues, populated
ranking, reputation.

---

## Definition of Done (phase gate)

Inherits [OPERATING_MODEL.md](OPERATING_MODEL.md) DoD, plus:

- [ ] `pnpm typecheck` + `pnpm build` green — no `ignore*Errors`.
- [ ] RLS verified on every table (no anon read of wallet/ledgers; no client write of balances/score).
- [ ] Auth verified in the browser: magic-link + OAuth, ES + EN + mobile, 0 console errors.
- [ ] No hardcoded copy; new namespaces at ES/EN parity.
- [ ] No hardcoded design values (tokens only).
- [ ] Docs updated; decisions recorded (D-027→D-031 already in [DECISIONS.md](DECISIONS.md)).
- [ ] Forward tables created or scripted exactly as [SCHEMA_V1.md](SCHEMA_V1.md) specifies.

---

> **After Identity, the next phase is Phase 2 — Predictions Core & Scoring Engine:** the
> motor that lights the daily loop and **generates the economy** (correct call → points +
> coins), reusing `model.ts` (difficulty), `fixtures` (stable IDs) and the
> `score_ledger`/`coin_ledger` Phase 1 lays down. It is the prerequisite for everything
> else — without the economy Predictions produces, the Market and Fantasy XI (Phase 3) have
> nothing to spend.
