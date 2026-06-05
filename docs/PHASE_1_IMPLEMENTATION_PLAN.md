# F90+ — Phase 1 Implementation Plan

> The ordered build plan for [PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md), using
> [SCHEMA_V1.md](SCHEMA_V1.md) as the database contract. Tasks are ordered by dependency.
> Each task has a goal, the files it touches, and its own done-check. This is the
> **execution map** — follow it top to bottom. Nothing here is built yet.
>
> **Gates (founder):** T0 (create the isolated Supabase project) and the OAuth provider
> setup in T6 are the founder's to unblock — everything else is studio-owned. **Pre-flight**
> (P-tasks) closes audit debt while we're already in `lib/football`; do it before T2 seeds.

Legend: ☐ todo · 🔒 founder gate · ⚙️ studio.

---

## Pre-flight — close foundation debt (do first, cheap, in `lib/football`)

| # | Task | Files | Done when |
| --- | --- | --- | --- |
| ☐ P1 ⚙️ | Complete `teams.ts` to the **48** WC2026 nations (the 11 missing: Algeria, Austria, DR Congo, Ghana, Iraq, Jordan, Norway, Panama, Saudi Arabia, Senegal, Uzbekistan) with code/accent/strength | `lib/football/teams.ts` | every qualified nation has real metadata (no gray 1740 fallback) |
| ☐ P2 ⚙️ | Unify the openfootball source (one `OPENFOOTBALL_URL`, one `PLACEHOLDER`, one `isRealTeam`) consumed by both fixtures and the globe | new `lib/football/source.ts`; refactor `openfootball.ts`, `nations.ts` | no duplicated constant; fixtures and globe agree on "real team" |
| ☐ P3 ⚙️ | Add **Vitest** + first tests on `model.ts` (prob sums to 1, host bump), `engine/index.ts` (blend, confidence), openfootball parsing/degradation | `apps/web/package.json`, `*.test.ts`, root `test` script | `pnpm test` green; the scoring math is guarded before it pays out points |
| ☐ P4 ⚙️ | Fix `.env.example` to document the **real** var names the code reads (`FOOTBALL_DATA_API_KEY`, `COPILOT_SOURCE`, `API_FOOTBALL_KEY`) + add Supabase keys | `apps/web/.env.example` | an operator can enable each integration by copying the example |

> P-tasks are the audit's high/medium debt, fixed at the natural moment. Tests (P3) become
> *critical* the instant the engine distributes points (Phase 2).

---

## T0 🔒 — Isolated Supabase project + env

- Create F90+'s **own** Supabase project (its own org/account — never PMS/PT/Chiribito/
  XPrediction). Capture `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (server-only).
- Add them to `apps/web/.env.example` (placeholders) and to Vercel envs (after tomorrow's
  deploy). **Done when:** local `.env.local` connects; `service_role` is server-only.

## T1 ⚙️ — Supabase SSR clients + composed middleware *(the delicate one)*

- `lib/supabase/server.ts` (`createServerClient`, cookies), `client.ts`
  (`createBrowserClient`), `middleware.ts` (`updateSession`).
- **Compose** in `proxy.ts`: run the next-intl middleware, then `updateSession` over the
  **same** `NextResponse` (do not return two responses). Preserve the existing matcher.
- **Done when:** a signed-in session survives navigation and refresh in **both** `/` (ES)
  and `/en`; locale routing is unchanged; no console errors.

## T2 ⚙️ — Migration `0001_identity.sql`

- Translate [SCHEMA_V1.md](SCHEMA_V1.md) **Phase 1** section verbatim: extensions, enums,
  `countries`/`profiles`/`wallets`/`coin_ledger`/`score_ledger`, `handle_new_user`,
  `award_coins`, `award_points`, `global_rankings` view, RLS policies, indexes.
- Live in `supabase/migrations/`; applied via the Supabase CLI; reviewed like code.
- **Done when:** a test signup creates profile + wallet + a `signup_bonus` ledger row of
  20,026 (Tokens F90, D-039); RLS blocks anon reads of `wallets`/ledgers; no client can write a balance.

## T3 ⚙️ — Seed `countries` from `lib/football`

- `0002_countries_seed.sql` (or a server script) generating all **48** rows from
  `teams.ts` + `nations.ts` (code/name_en/name_es/accent/is_host/is_qualified/strength).
- **Done when:** the country picker lists every qualified nation with its accent token.

## T4 ⚙️ — Auth flows (Server Actions + forms)

- `features/auth/`: `signIn` (magic-link), OAuth (Google/Apple) buttons, `signOut`;
  `app/[locale]/(auth)/{login,signup,callback}/`. Zod validation server-side.
- New i18n namespace `auth` (ES/EN parity).
- **Done when:** magic-link and Google sign-in complete end-to-end and land on onboarding
  or the app, in ES and EN.

## T5 ⚙️ — Onboarding (username + favourite country)

- `features/profile/`: pick `username` (live uniqueness check) + favourite country.
  `updateProfile` Server Action; writes through RLS self-update.
- New i18n namespace `onboarding`.
- **Done when:** a new user sets a valid unique username + country; invalid/taken usernames
  are rejected with localized errors.

## T6 🔒/⚙️ — Protected routes + auth-aware header

- `app/[locale]/(app)/` route group: layout checks the session (RSC) and redirects to
  login if absent. Header shows avatar + menu (signed in) or "Sign in" CTA (signed out).
- 🔒 OAuth provider config (Google/Apple redirect URLs) — done after `f90.xyz` connects.
- **Done when:** signed-out access to an `(app)/` route redirects; the header reflects auth
  state in ES/EN/mobile.

## T7 ⚙️ — Public profile `/u/[username]` + dynamic OG

- `app/[locale]/u/[username]/`: RSC reading `profiles` + `global_rankings`;
  `generateMetadata` → per-user OG card; own-IP SVG avatar from `profiles.avatar`.
- New i18n namespace `profile`.
- **Done when:** `/u/<name>` renders avatar, country badge, join date, points (0), rank
  teaser; the OG card previews correctly; 404 for unknown usernames.

## T8 ⚙️ — Settings (edit profile)

- Edit `display_name`, `bio`, `avatar` (token config). Username/country change honors the
  30-day cooldown (D-031).
- **Done when:** edits persist via RLS self-update; cooldown enforced; localized.

## T9 ⚙️ — Rankings teaser (replace the mock)

- Replace `data/leaderboard.ts` consumption with a query over `global_rankings`; render an
  empty-state teaser. New i18n namespace `rankings`.
- **Done when:** the leaderboard surface reads real data (empty now), no mock import left.

## T10 ⚙️ — i18n parity + tokens sweep

- All new copy in `locales/{es,en}.json`, **parity verified**; no hardcoded strings; no
  hardcoded design values.
- **Done when:** key sets match exactly; a grep finds no user-facing literal in the new
  features.

## T11 ⚙️ — Phase Definition of Done

- `pnpm typecheck` + `pnpm build` green (no `ignore*Errors`); `pnpm test` green.
- Browser verification: magic-link + OAuth, **ES + EN + mobile**, 0 console errors.
- RLS audit: no anon read of wallet/ledgers; no client write of balance/score.
- Docs updated; [DECISIONS.md](DECISIONS.md) D-027→D-031 present; [PROJECT_STATE.md](PROJECT_STATE.md) checkpoint advanced.

---

## Dependency order

```
P1..P4  (pre-flight, parallel)
  └─ T0 🔒 ─ T1 ─ T2 ─ T3 ─┬─ T4 ─ T5 ─ T6 ─ T7 ─ T8
                            └─ T9
                                  └─ T10 ─ T11 (DoD gate)
```

## External dependencies to line up (for later, not Phase 1)

- **Player rosters + per-match stats** (Phase 3 fantasy): football-data.org (adapter
  env-gated already) or api-football (free 100/day). `names + stats = facts` (D-025).
- **Live results** to settle predictions (Phase 2): openfootball results + the env-gated
  football-data enrichment (the `enrichWithFootballData` no-op must be implemented then).

## Estimate

| Block | Effort | Risk |
| --- | --- | --- |
| Pre-flight P1–P4 | 1–2 sessions | Low (isolated, testable) |
| T0–T3 (Supabase + middleware + schema + seed) | 1–2 sessions | Med (middleware composition, RLS) |
| T4–T8 (auth + onboarding + profile + settings) | 2–3 sessions | Med (OAuth config gate) |
| T9–T11 (rankings teaser + i18n + DoD) | 1 session | Low |
| **Phase 1 total** | **~5–8 focused sessions** | **Med** |
