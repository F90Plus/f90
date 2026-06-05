# F90+ — Phase 1 Handoff (Identity & Accounts)

> **✅ PHASE 1 (Identity & Accounts) — CLOSED · MERGED · DEPLOYED · ENV ACTIVATED · PRODUCTION VERIFIED — founder-approved 2026-06-05 (T1–T11; official close record D-048).**
> DoD passed (gates green · **105 tests** · i18n parity **263/263** · browser E2E ES/EN/mobile, 0 console ·
> 11 invariants). **PR [#2](https://github.com/F90Plus/f90/pull/2) MERGED → `main` = `7584f65`**;
> **deployed** `vercel --prod` (`dpl_Dth9c2paTkJkBwi9WauResDUL7iQ`, aliased **`www.f90.xyz`**). The merged
> branch `feat/phase-1-identity` is **deleted**; tree clean.
>
> **✅ PRODUCTION ENV ACTIVATED (2026-06-05):** the 2 public Supabase env vars are set in Vercel
> (Production + Preview) and the site was **redeployed** (`dpl_3PDvhVLQBcVe6ZWYpi8N8cQWLa7L`, `www.f90.xyz`).
> **All 500s resolved — verified in prod:** `/home` · `/settings` · `/onboarding` → 307 → `/login` (gate),
> `/u/[unknown]` → 404, OG → 200 (ES + EN), public landing + `/login` + `/signup` → 200. **Only remaining
> for real end-user sign-in: the D-035 Supabase dashboard items** (`site_url` → `https://www.f90.xyz`,
> redirect allow-list apex `https://f90.xyz/**`, Resend SMTP for magic-link).
>
> **▶ NEXT MILESTONE = Phase 2 (Predictions Core & Scoring).** **DO NOT open new fronts** — D-042
> dashboard / advanced Fantasy / player-market stay future, documented-not-built.
>
> **Analyst Center — APPROVED philosophy (carry forward, D-041):** the section **"Los partidos que
> importan" (`#analyst`) IS the market**, transformed **IN PLACE** — never a new section/nav/grid/
> surface. It must feel like **mercado vivo · convicción · oportunidad · participación**, NEVER a data
> dashboard / sportsbook / casa de apuestas. **Vocabulary law (D-037):** probabilidad · posición ·
> convicción · exposición · asignar F90 · participantes — **never** odds/bet/stake/cuota/ganancias.
> **APPROVED action = Treatment A:** outcome markets → **`+10 / +50 / +100 F90`** chips · 1X2 fixtures →
> **"Tomar posición"** CTA. The Analyst is on **every** card (own-IP `AnalystMark` + "+X% sobre el
> consenso"). Actions are an **honest preview** (route to sign-up; engine = Phase 2/3). **Fantasy stays
> independent and untouched.** Keep this criterion.
>
> **D-042 (FUTURE — documented, DO NOT build now):** two surfaces over **one F90 economy** — **public** =
> Home / Analyst Center (discover opportunities · markets · trends · AI · conviction) · **private** = a
> Polymarket-inspired **dashboard** (wallet · positions · F90 exposure · entry history · performance ·
> conviction · position tracking). One economy, one Analyst, one wallet — **never a second app**.
>
> Read order to resume: this file → [PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) (spec) →
> [SCHEMA_V1.md](SCHEMA_V1.md) (DB) → [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md)
> (tasks) → [DECISIONS.md](DECISIONS.md) (D-041/D-042 + ledger) →
> [ECOSYSTEM_VISION.md](ECOSYSTEM_VISION.md) (future phases). Strategy B (premium, no shortcuts).

## Executive summary

Phase 1 (Identity & Accounts) is **100% complete (T1–T11), MERGED to `main`, DEPLOYED to production, and
ENV-ACTIVATED** — founder-approved & officially closed 2026-06-05 (official record D-048). Data + auth +
onboarding + the protected `(app)` gate + `/home` + public profile (dynamic OG) + settings (30-day cooldown)
+ the real rankings teaser are LIVE. The Supabase schema + economy + 48-country seed are applied and
verified; the welcome bonus is **20,026 Tokens F90** (D-039); the live-market ticker is a sticky bar; the
landing carries the Analyst Center live-market (D-041) + a Fantasy discovery section. **T9–T11 done**
(D-043 rankings teaser · D-044 i18n/token sweep · D-045 DoD gate) — the homepage reads the real
`global_rankings` view (honest empty-state) and the leaderboard mock is deleted.

The merged branch **`feat/phase-1-identity`** is **deleted**; `main` (close docs at `4959c6f`) carries
everything. **Only remaining for real end-user sign-in: the D-035 Supabase dashboard items** (`site_url`,
allow-list apex, Resend SMTP). Vision **D-034** is baked into a **generic economy** so markets/players/
fantasy plug in later without reshaping Identity; the auth/identity surface is provider-agnostic and carries
no subsystem-specific coupling (D-035). **Next milestone = Phase 2 (Predictions Core & Scoring).**

## Checkpoint — at a glance (2026-06-04)

**✅ Done (T1–T8, all verified):**
- **T1** SSR clients + composed next-intl/Supabase middleware · **T2** schema/RLS/economy (migration
  `0001`) · **T3** 48-country seed (`0002`)
- **T4** auth flows — magic-link + Google, dual-mode callback (`code` + `token_hash`), auth-aware header
- **T5** onboarding — username + favourite country (RLS self-update)
- **T6** protected `(app)` group + the `/home` authed surface
- **T7** public profile `/u/[username]` + dynamic OG card
- **T8** settings + 30-day cooldown (D-031)
- **Landing (extra):** market ticker now a **sticky bar**; **Fantasy discovery section** + a `Fantasy`
  nav item; redundant "Qualified Nations" grid removed

**🔬 Verified:** `pnpm typecheck` ✅ · `pnpm test` ✅ **88 unit tests** · `pnpm build` ✅ (no
`ignore*Errors`). **E2E through real Supabase sessions** (admin `generate_link` → our own token-hash
`/callback`): onboarding → `/home` (showing **20,026 Tokens F90**) → public profile + a valid OG PNG →
settings cooldown ("Podrás cambiarlo el 4 de julio"). All test users created **and cleaned up** (DB
clean). ES + EN + mobile, 0 console errors. *(Caveat: home-page screenshots are flaky in the preview
due to WebGL `networkidle`; verification was via DOM/E2E + DB + fetch — conclusive.)*

**🗄️ Applied in Supabase (`f90-production`):** migrations **`0001`** (schema/RLS/functions/view/grants)
+ **`0002`** (48 countries) + **`0003`** (welcome bonus → **20,026 Tokens F90**, D-039). Redirect
allow-list gained `http://localhost:3300/**` (dev). Google + email providers ON. **No schema work
remains for T9–T11** (they consume existing tables/views).

**📐 Documented for future phases (NOT built):** **D-034** expanded vision · **D-038** +
[ECOSYSTEM_VISION.md](ECOSYSTEM_VISION.md) (nation hubs `/nations/[code]`, player profiles
`/players/[slug]`, a Fantasy vertical, a "What is F90+?" discovery page → reserved **"Phase 3.5 —
Entity Layer & Fantasy"**) · **D-040** Founding Squad / "Pack Fundación F90". Routes reserved; English
(D-003).

**✅ T9 done (D-043)** · **✅ T10 done (D-044)** · **✅ T11 DoD gate PASSED (D-045) — Phase 1 CLOSED.**

**▶ Phase 1 is complete (development level).** Remaining = **founder-gated production promotion**: PR
`feat/phase-1-identity` → `main` + merge → manual `vercel --prod` (D-033) + the pre-prod Supabase items
(D-035). **Next milestone = Phase 2 (Predictions Core & Scoring).**

## Product decisions registered (ledger)

| # | Decision (one-line — full text + rationale in [DECISIONS.md](DECISIONS.md)) |
| --- | --- |
| **D-034** | Expanded vision: Polymarket-style markets + persistent wallet + player trading + squad XI/bench + portfolio — designed on a **generic economy**, not built. The anchor for everything below. |
| **D-035** | Auth flows: **one dual-mode callback** (`code` + `token_hash`), locale-safe + open-redirect-guarded redirects, passwordless **login = signup**. |
| **D-036** | Landing speaks "market": live **ticker** added (probability, not odds); redundant **"Qualified Nations"** grid removed. |
| **D-037** | **Prediction-market identity LOCKED** — probability %, **never** bookmaker odds (founder-ratified brand invariant). |
| **D-038** | **Ecosystem reserved**: nation hubs `/nations/[code]`, player profiles `/players/[slug]`, **Fantasy** as a top-level vertical, "What is F90+?" discovery → **"Phase 3.5 — Entity Layer & Fantasy"** (English routes; [ECOSYSTEM_VISION.md](ECOSYSTEM_VISION.md)). |
| **D-039** | Currency = "**Tokens F90**"; welcome bonus = **20,026** (supersedes D-031's 1,000); migration `0003` applied + verified. |
| **D-040** | Founding Squad / "**Pack Fundación F90**": new users own a **value-equal** starter squad (XI + bench + portfolio) from minute one; build with Phase 3 ([ECOSYSTEM_VISION.md](ECOSYSTEM_VISION.md) §9). |

> Earlier Phase-1 decisions still in force: **D-027** (three-currency economy), **D-028** (latent
> foundations), **D-030** (auth methods), **D-031** (identity defaults — its 1,000 bonus superseded by
> D-039), **D-033** (Vercel manual deploy / Chiribito-shared team).

## Repository state

- **Phase 1 MERGED:** PR [#2](https://github.com/F90Plus/f90/pull/2) → `main` (merge `7584f65`); the `feat/phase-1-identity` branch is **deleted** (local + remote).
- **`main` tip:** `4959c6f` (`docs(phase-1): official close — D-048`) == `origin/main`.
- **Current branch:** `chore/phase-2-preflight` (off `main`) — Phase 2 pre-flight (D-049 middleware fix + this doc reconciliation); not yet pushed/PR'd (founder-gated).
- **Working tree:** clean.
- **Production:** `www.f90.xyz` LIVE on Phase 1 (env-activated; D-046/D-048).
- **Key commits (Phase 1 arc — each `feat` paired with its `docs(...)`):**
  - `30ae5df` T1 SSR + middleware · `faa978b` T2 schema (`0001`) · `901e796` T3 seed (`0002`) · `fa83bde` grants
  - `b902e8e` **T4** auth flows · `16c84c6` landing (ticker + drop Nations, D-036) · `11f86a5` **T5** onboarding
  - `101ec1d` D-037 + D-038 vision · `c727644` **D-039** Tokens F90 (`0003`) · `441cd33` **T6** `(app)` + `/home`
  - `cb3c2b3` sticky ticker · `66139b2` **D-040** Founding Squad · `972a240` **T7** profile + OG
  - `20b0587` Fantasy discovery section · `5872c27` **T8** settings + cooldown · `7779795` **T9** rankings teaser
  - `c677e3d` **T10** sweep · `307eed8` **T11** DoD · `7584f65` **merge #2** · close docs `c9f47ed`→`0bc9019`→`eaffd61`→`4959c6f`

## Supabase state

- **Project:** `f90-production` (ref `upelxcxnpmmbhivrazle`), `eu-west-1`, `ACTIVE_HEALTHY`.
- **Isolated:** only 1 project in the account.
- **New API key system** (publishable / secret).
- **`apps/web/.env.local`** (gitignored, NOT in repo) holds: `NEXT_PUBLIC_APP_URL`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`,
  `SUPABASE_ACCESS_TOKEN` (PAT). **All verified working.**
- **Migrations applied via the Management API** (`POST /v1/projects/{ref}/database/query`)
  with the PAT — **not** via CLI migration history. The SQL files are the source of truth.

## Migrations applied

- `20260604000001_identity.sql` — **APPLIED ✅** (schema, RLS, functions, view, grants)
- `20260604000002_countries_seed.sql` — **APPLIED ✅** (48 nations)
- `20260604000003_welcome_bonus.sql` — **APPLIED ✅** (D-039: `handle_new_user` credits **20,026** Tokens F90; verified — a real signup → `coins_balance=20026`)

Verified live: 5 tables (all RLS on), 3 functions, `global_rankings` view, 48 countries / 3 hosts,
welcome bonus = 20,026. **No pending migrations** (T9–T11 need none).

## Seeds applied

- **`countries`: 48 nations**, hosts USA/MEX/CAN, derived from `teams.ts` + Spanish names.
  Guarded by `countries-seed.test.ts` (fails if it drifts from `teams.ts`).

## Auth state

- **Infrastructure DONE + verified (T1):** `lib/supabase/{client,server,middleware}.ts` and
  `proxy.ts` composing next-intl + `updateSession`. Locale routing intact (`/`=ES, `/en`=EN,
  both 200; 0 console/server errors). `getCurrentUser()` helper consumed by the header.
- **`handle_new_user` trigger VERIFIED THROUGH THE REAL FLOW:** a magic-link request from the UI
  created `fan_e1632271` with profile + wallet (1000) + `signup_bonus` ledger row (then cleaned up).
- **T4 BUILT + verified:** `features/auth/{validation,actions,auth-panel,magic-link-form,google-button}.ts(x)`,
  routes `app/[locale]/(auth)/{login,signup}/page.tsx` + `(auth)/callback/route.ts`, `(auth)/layout.tsx`,
  and the auth-aware header (`components/layout/{header,user-menu}.tsx`). Server Actions
  `signInWithMagicLink` / `signInWithGoogle` / `signOut`; the callback handles `code` **and**
  `token_hash`; redirect resolution is pure + unit-tested (12 tests). See D-035.

## Identity state

- **`profiles` table + trigger DONE + verified.** Schema carries no subsystem-specific fields (D-034).
- **T5 onboarding BUILT + verified:** `features/profile/{validation,actions,countries,onboarding-form}.ts(x)`
  + `app/[locale]/onboarding/page.tsx` (session-gated). `parseUsername` (format `^[a-z0-9_]{3,20}$`
  + reserved list, 9 unit tests) · `checkUsername` (live availability) · `updateProfile` (RLS
  self-update, sets the `*_changed_at` cooldown stamps; maps unique/FK violations). Country picker
  reads the 48 `countries` with correct flags (`flagAssetFor(name_en)`, NOT the 3-letter code).
  Signup routes new users here (`next=/onboarding`). **Verified E2E** (see Auth state).
- **T7 + T8 SHIPPED + verified** (per-task sections below): public profile `/u/[username]` + dynamic OG; settings (full edit) + the 30-day cooldown UI.

## Wallets / Ledgers state

- **DONE + verified:** `wallets`, `coin_ledger`, `score_ledger` + `award_coins`/`award_points`
  (`SECURITY DEFINER`, EXECUTE revoked from clients, granted to `service_role`).
  Server-authoritative; `check (coins_balance >= 0)`. **Latent** until spending (Phase 3).
- **Welcome bonus = 20,026 Tokens F90** (migration **0003**, D-039 — supersedes the 1,000 of D-031).
  Currency single-source: `lib/economy.ts` (`WELCOME_BONUS_TOKENS`, `CURRENCY_NAME`). **Verified E2E**:
  a fresh signup credited `coins_balance=20026` + a `signup_bonus` ledger row of `20026`. The earlier
  T4/T5 notes saying "1000/`fan_e1632271`=1000" are historical (bonus was 1,000 then).
- `ledger_kind` already includes `market_trade`/`player_purchase`/`player_sale`/`fantasy_reward` (D-034 forward).

## Rankings state

- **`global_rankings` view DONE + verified** (`security_invoker`, public grant).
- **T9 DONE + verified (D-043):** the homepage teaser reads the real `global_rankings` view via a
  cookie-less, env-guarded public client (`lib/supabase/public.ts`) + a pure, unit-tested projection
  (`lib/rankings.ts` → `toTeaserEntries`, 6 tests). Pre-scoring → an honest empty-state ("open seats"
  podium); real rows (Phase 2+) use the own-IP avatar token + nation flag. `data/leaderboard.ts` mock
  **deleted** (sole consumer migrated). Verified in-browser ES/EN + mobile, 0 console errors.

## OAuth Google state

- **Configured + WIRED (T4):** Google Cloud (project F90+, consent screen External, test user added,
  Web OAuth client with redirect `https://upelxcxnpmmbhivrazle.supabase.co/auth/v1/callback`) +
  Supabase Google provider (client id/secret). **Initiation verified**: the button issues a 303 to the
  provider authorize URL. Full consent completion needs a real Google login (founder).

## Magic Link state

- **Email provider ON + WIRED (T4).** Verified: a valid email returns the "check your inbox" success
  state (Supabase accepted `signInWithOtp`). Clicking the link to finish needs a real inbox (founder).
  Dev uses Supabase's built-in SMTP (rate-limited); production needs its own SMTP (Resend) — **open debt**.
- **Redirect allow-list:** added `http://localhost:3300/**` this session (dev). Still has
  `https://www.f90.xyz/**` but **not** apex `https://f90.xyz/**`, and `site_url` is still
  `http://localhost:3000` — founder/dashboard items before production auth (D-035).

## i18n state

- **ES (default) + EN in place** (foundation + Phase 0.6), full parity, no hardcoded copy.
- **`auth` (T4) + `onboarding` (T5) + `profile` (T7) namespaces ADDED** in `locales/{es,en}.json` with
  full key parity, no hardcoded copy. (`markets` was also added by the landing pass — D-036.)
- **T9 (D-043): reused the existing `leaderboard` namespace** (added `subtitleEmpty`, retuned
  `title`/`subtitle` to honest framing) instead of a new `rankings` one — ES/EN parity kept.

## Documentation state

- `docs/DECISIONS.md` — D-034 recorded.
- `apps/web/supabase/README.md` — migrations, security hardening, how-applied, verify steps.
- `docs/PHASE_1_IDENTITY.md` / `SCHEMA_V1.md` / `PHASE_1_IMPLEMENTATION_PLAN.md` — contracts (valid).
- `docs/PROJECT_STATE.md` — updated to point here.
- **THIS FILE** — the live Phase 1 handoff.

## Architectural decisions

- **D-034** — expanded vision (Polymarket-style markets, persistent virtual wallet, player
  buy/sell + dynamic pricing, full squad XI + bench + team value, social rankings + private
  leagues, player/asset portfolio). Identity stays generic; the economy absorbs all of it via
  `coin_ledger.kind` / `(ref_type, ref_id)` + `award_*` — **same wallet + points, no reshape**.
- **Security hardening over the SCHEMA_V1 base** (documented in `0001` + `supabase/README`):
  `award_*` EXECUTE revoked from anon/authenticated (service_role + trigger only);
  `global_rankings` `security_invoker`; RLS uses `(select auth.uid())`; explicit Data API grants
  (countries/profiles/rankings public; wallets/ledgers authenticated-only; anon blocked on money).
- **New Supabase key system** (publishable/secret); migrations applied via the Management API + PAT.
- **D-028 honoured:** forward tables (`fixtures`/`predictions`/`players`/`squads`/`lineups`/`leagues`)
  are designed in SCHEMA_V1, **not built** in Phase 1.

## Open risks

- **Magic-link in production** needs its own SMTP (Resend); dev SMTP is rate-limited.
- **Google OAuth + magic-link not yet E2E-tested** (done in T4; magic-link E2E needs a real inbox —
  the founder may need to click an email, or use admin-API test users).
- **Migrations applied as raw SQL** (Management API), no CLI migration-history tracking. If switching
  to `supabase db push` later, reconcile the history.
- **ESLint still broken** at the tooling level (FlatCompat circular structure) — pre-existing;
  typecheck + tests + build are the effective gates. Fix still pending (separate task).
- **PAT in `.env.local`** grants whole-account Supabase access (account is F90+-only; revocable). Never commit it.
- `next-env.d.ts` oscillates between build/dev variants — cosmetic; reset it if it shows as a change.
- **Carryover:** Vercel manual deploy + Vercel team shared with Chiribito (D-033); WC opener 11 Jun
  vs the playable loop (Strategy B accepted: quality over the group-stage capture window).

## T4 — Auth flows ✅ DONE (verified 2026-06-04)

Shipped + functionally verified on localhost:3300 (server on the allow-listed port):
- `features/auth/`: `validation.ts` (pure, 12 unit tests — email/zod, open-redirect guard,
  locale-prefix), `actions.ts` (`signInWithMagicLink` / `signInWithGoogle` / `signOut`),
  `auth-panel.tsx`, `magic-link-form.tsx`, `google-button.tsx`.
- Routes: `app/[locale]/(auth)/{login,signup}/page.tsx` + `(auth)/layout.tsx`;
  `(auth)/callback/route.ts` completes **both** `code` (exchangeCodeForSession) and `token_hash`
  (verifyOtp), preserving locale + a sanitised `next`.
- i18n `auth` namespace (ES/EN parity); auth-aware header + `user-menu.tsx`.
- **Gates:** `pnpm typecheck` ✅ · `pnpm test` ✅ 63 · `pnpm build` ✅ (no `ignore*Errors`).
- **Verified:** ES+EN render (0 console errors), invalid email → localized error, valid email →
  "check your inbox", Google → 303 to authorize URL, signed-out header shows "Sign in" (mobile too).

## T5 — Onboarding ✅ DONE (verified E2E 2026-06-04)

`features/profile/` (validation [9 unit tests], actions, countries, onboarding-form) +
`app/[locale]/onboarding/page.tsx` (session-gated; signup defaults `next=/onboarding`).
- **Gates:** `pnpm typecheck` ✅ · `pnpm test` ✅ 72 · `pnpm build` ✅.
- **Verified E2E through the real UI + a real session** (minted via admin `generate_link` →
  completed through our own `/callback` token-hash path, which also re-proved T4's `verifyOtp`
  branch): the 48-country picker renders with correct flags, the username field live-checks
  availability ("Disponible"), and submit wrote `username=cuco_t5_test` + `country_code=ESP` (Spain)
  + both `*_changed_at` stamps via RLS self-update, then redirected home. Test users cleaned up.

## T6 — Protected app group ✅ DONE (verified E2E 2026-06-04)

`features/auth/guards.ts` (`requireOnboardedUser`), `app/[locale]/(app)/layout.tsx` (the gate) +
`app/[locale]/(app)/home/page.tsx` (the first authed surface: greeting + **Tokens F90 balance** +
points + backed nation). `isProfileComplete` is pure + unit-tested (`country_code` +
`username_changed_at` both set). Onboarding success now lands on `/home`; onboarding stays OUTSIDE the
group (no redirect loop).
- **Gates:** `pnpm typecheck` ✅ · `pnpm test` ✅ 78 · `pnpm build` ✅.
- **Verified E2E:** (1) signed-out `/home` → `/login?next=/home`; (2) signed-in but not onboarded →
  forced to `/onboarding`; (3) after onboarding → `/home` renders "Hola, @t6_user" · **20.026 Tokens
  F90** · "Vas con Argentina". Test users cleaned up.

## T7 — Public profile ✅ DONE (verified 2026-06-04)

`app/[locale]/u/[username]/` (public `page.tsx` + `opengraph-image.tsx`), `components/ui/avatar.tsx`,
`lib/avatar.ts` (own-IP gradient+initial, pure, 6 tests), `profile` i18n namespace. Reads `profiles`
by handle (citext); `notFound()` for unknown handles. Per-user OG via `next/og` ImageResponse.
- **Gates:** `pnpm typecheck` ✅ · `pnpm test` ✅ 84 · `pnpm build` ✅.
- **Verified:** `/u/proftest` renders (name · @handle · "Va con España" · join date · points · rank
  teaser · avatar); unknown handle → 404; the OG route returns a valid 64 KB `image/png`.

## T8 — Settings + 30-day cooldown ✅ DONE (verified E2E 2026-06-04)

`app/[locale]/(app)/settings/page.tsx` (gated) + `features/profile/settings-form.tsx` + `updateSettings`
action + `canChangeAfterCooldown` (pure, 4 tests) + `settings` i18n. `display_name`/`bio` (≤280) edit
freely; `username`/`country` are gated by the 30-day cooldown (D-031) from the `*_changed_at` stamps.
- **Gates:** `pnpm typecheck` ✅ · `pnpm test` ✅ 88 · `pnpm build` ✅.
- **Verified E2E:** `/settings` loads for an onboarded session; username + country disabled with
  "Podrás cambiarlo el 4 de julio" (change + 30 days); editing `display_name` + `bio` persisted to the
  DB via RLS, cooldown fields untouched.

## Phase 1 — CLOSED + MERGED + DEPLOYED ✅ (D-045 / D-046)

All eleven tasks done + verified (DoD passed). **PR [#2](https://github.com/F90Plus/f90/pull/2) MERGED** →
`main` = `7584f65`; **deployed** `vercel --prod` → `dpl_Dth9c2paTkJkBwi9WauResDUL7iQ`, aliased
**`www.f90.xyz`**. Merged branch deleted; tree clean.

**✅ Production env activated (2026-06-05):** the 2 public Supabase env vars are set in Vercel + the site
was **redeployed** (`dpl_3PDvhVLQBcVe6ZWYpi8N8cQWLa7L`); **all 500s resolved** (gates → `/login`,
`/u/[unknown]` → 404, OG → 200, public → 200 — verified in prod).
**Only remaining for real end-user sign-in (founder, D-035):** Supabase `site_url` → `https://www.f90.xyz` ·
redirect allow-list apex `https://f90.xyz/**` · Resend SMTP for magic-link.

**Next milestone = Phase 2 (Predictions Core & Scoring)** — the engine that generates points + coins and
**fills this rankings teaser with real data**. See [ROADMAP.md](ROADMAP.md).

## PHASE 1 STATUS

| Task | Status |
| --- | --- |
| Pre-flight (P1–P4) | ✅ completado |
| T1 — Supabase SSR + composed middleware | ✅ completado |
| T2 — Migration 0001 (schema/RLS/functions/view) | ✅ completado (applied + verified) |
| T3 — Seed countries (48) | ✅ completado (applied + verified) |
| T4 — Auth flows (magic-link + Google, routes, i18n) | ✅ completado (verificado funcionalmente) |
| T5 — Onboarding (username + country) | ✅ completado (verificado E2E + DB) |
| T6 — Protected routes + auth-aware header | ✅ completado (verificado E2E) |
| T7 — Public profile `/u/[username]` + OG | ✅ completado (verificado: render · 404 · OG png) |
| T8 — Settings + 30-day cooldown | ✅ completado (verificado E2E + DB) |
| Analyst Center Market Feel (D-041) — live-market in place + XI Ideal pitch | ✅ completado (typecheck + 99 tests + build green; ES/EN + mobile; pushed `d7d2575`) |
| T9 — Rankings teaser (replace mock) | ✅ completado (real `global_rankings` + honest empty-state; D-043; verificado ES/EN + móvil) |
| T10 — i18n parity + tokens sweep | ✅ completado (D-044; parity 263/263 · OG localizado · consistency · dead-code) |
| T11 — Phase DoD gate | ✅ completado (D-045; gates verdes + E2E ES/EN/móvil + 11 invariantes + 0 consola) — **Phase 1 CERRADA** |
