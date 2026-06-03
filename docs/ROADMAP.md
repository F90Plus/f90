# F90+ — Roadmap

A phased path from foundation to a live World Cup product. Each phase is a
shippable slice. Dates are intentionally omitted; the World Cup opener
(11 Jun 2026) is the natural pull date for the core loop.

> Legend: ✅ done · 🔜 next · ⏳ planned

---

## ✅ Phase 0 — Foundation *(this repo)*

Visual identity, design system, i18n and a cinematic homepage.

- [x] pnpm monorepo, TypeScript strict, Tailwind v4, Framer Motion
- [x] Design tokens + component helpers (the F90+ look)
- [x] Bilingual ES/EN via next-intl (routing, middleware, switcher)
- [x] UI primitives (Button, Badge, Card, …) + layout shell
- [x] Homepage: hero, live countdown, match cards, leaderboard teaser, CTA
- [x] Project documentation

**Exit:** `pnpm dev` renders a premium, responsive, bilingual homepage.

---

## 🔜 Phase 1 — Identity & accounts

Let people *be someone* on F90+.

- [ ] Supabase project + `@supabase/ssr` integration (see `.env.example`)
- [ ] Sign up / sign in (email + OAuth), session handling
- [ ] Public **profile** (alias, avatar, country, joined date)
- [ ] Protected routes + auth-aware header
- [ ] DB schema v1: `profiles`

## ⏳ Phase 2 — Predictions core

The heart: make a call before kickoff.

- [ ] Fixtures + `predictions` schema
- [ ] Predict flow (winner / scoreline) with optimistic UI
- [ ] Lock predictions at kickoff
- [ ] "My predictions" view and history

## ⏳ Phase 3 — Virtual wallet & scoring

Stakes, without money.

- [ ] Virtual coin wallet (server-authoritative, transaction ledger)
- [ ] Scoring rules engine (points for correct calls, bonuses)
- [ ] Settlement on match resolution
- [ ] Anti-cheat / integrity checks

## ⏳ Phase 4 — Leaderboards

Turn scoring into competition.

- [ ] Global leaderboard (replaces the mock teaser) with real-time updates
- [ ] Time-boxed boards (matchday, group stage, knockouts)
- [ ] Profile rank + streaks

## ⏳ Phase 5 — AI pundit (rules/stats based)

A football-smart voice, no LLM hype required.

- [ ] Rule/statistics engine producing pre-match probabilities & takes
- [ ] "Pundit pick" + short rationale on each match
- [ ] Challenge mode: predict against the pundit
- [ ] Pluggable so a richer model can slot in later

## 🔜 Phase 6 — Live football data *(started)*

Make it real and live.

- [x] **Real fixtures via openfootball** (zero-key, cache-first, graceful fallback) —
      homepage shows the real WC2026 opener + marquee fixtures with model probabilities
- [x] Clean adapter architecture (`lib/football/`) + football-data.org adapter built &
      env-gated for standings/form
- [ ] Activate football-data.org (add `FOOTBALL_DATA_API_KEY`) → real standings/form
- [ ] Live match state + score updates (needs a live source / paid tier)
- [ ] Full group tables view

## ⏳ Phase 7 — Social & leagues

Where the fun compounds.

- [ ] Private leagues + invites (the core growth loop)
- [ ] Friend feeds, reactions, light trash-talk
- [ ] Shareable prediction cards (deep-linked)

## ⏳ Phase 8 — Polish & launch readiness

- [ ] Performance budget + Core Web Vitals pass
- [ ] Analytics + responsible-play messaging
- [ ] SEO + dynamic OG images per match/profile
- [ ] Deploy pipeline (own Vercel project), domains, monitoring

---

## Cross-cutting backlog

Tracked here so foundation shortcuts don't get forgotten:

- [ ] **Localized country names** — team `name` is English today; localize via
      a country-name map (codes already i18n-neutral).
- [ ] **Dynamic OG image** (`opengraph-image.tsx`) — deferred to keep the first
      build minimal.
- [ ] **Typed i18n messages** — add the next-intl global augmentation for
      autocompletion/safety on translation keys.
- [ ] **Testing** — add Vitest + Testing Library and Playwright as features land.
- [ ] **LICENSE** — choose and add before any public release.
- [ ] **More languages** — architecture supports it; add when there's demand.

## Non-goals (kept off the roadmap on purpose)

- Real-money betting, payouts, or any gambling mechanic.
- Pay-to-win mechanics or predictive advantages tied to spending.
- A heavyweight microservice/Turborepo setup before the product needs it.
