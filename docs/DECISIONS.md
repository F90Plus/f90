# F90+ — Decision Log (ADR)

Lightweight architecture/product decision records, newest context preserved. Each
entry: **context → decision → consequences**. This is the long-term coherence
backbone — when in doubt about *why* something is the way it is, it's here.

Status legend: ✅ active · 🔄 superseded · 🕒 proposed

---

### D-001 — Stack ✅
**Context:** Greenfield, premium, scalable, mobile-first.
**Decision:** Next.js 16 (App Router, RSC) · React 19 · TypeScript strict · Tailwind
v4 (CSS-first tokens) · Framer Motion · next-intl · Geist + Space Grotesk.
**Consequences:** Modern, server-first, token-driven; bleeding-edge but coherent.

### D-002 — Monorepo (`apps/web`) ✅
**Context:** Founder asked for `apps/`-style structure + future growth.
**Decision:** pnpm workspace; the app lives in `apps/web`, `packages/` reserved.
**Consequences:** Room for more apps/shared packages without restructuring.

### D-003 — i18n: next-intl, ES default + EN ✅
**Context:** Global World Cup audience; founder is Spanish.
**Decision:** next-intl, locales `es` (default) + `en`, `localePrefix: as-needed`
(`/` = ES, `/en` = EN). Catalogs in `apps/web/locales/`. No hardcoded copy.
**Consequences:** Adding a language = 1 routing entry + 1 catalog file.

### D-004 — Visual language: night stadium / broadcast ✅
**Context:** Premium, football, alive; explicitly *not* casino.
**Decision:** Dark night surfaces, **LED blue** as primary UI color, volt cyan +
gold + lime accents, soft glows, broadcast eyebrows, one ease-out motion curve.
**Consequences:** Distinct from a green-felt casino look; coheres with the logo.

### D-005 — Copilot V1 has no LLM ✅
**Context:** Founder wants no paid LLM; predictions must be honest/explainable.
**Decision:** A deterministic **signal + scoring engine**; insights via i18n
templates. Intelligence = combining real data well, not generating text.
**Consequences:** $0, deterministic, explainable, no hallucinations. LLM can be
added later as a narration/chat layer on top — never the source of truth.

### D-006 — Free data stack ✅
**Context:** $0 for V1, World-Cup-ready, stable, easy to integrate.
**Decision:** football-data.org (free, WC + leagues) + API-Football (free 100/day,
all endpoints) + The Odds API (free 500/mo, market consensus) + openfootball
(public-domain bracket) + TheSportsDB (media) + **F90+ first-party community
consensus**. No free tipster-consensus API exists → use de-vig odds + community.
**Consequences:** Complete, free, upgradeable to paid tiers later. See
[DATA_SOURCES_RESEARCH.md](DATA_SOURCES_RESEARCH.md).

### D-007 — Cache-first ingestion ✅
**Context:** Free tiers are rate-limited (100/day).
**Decision:** Scheduled jobs pull into our own store; app/copilot read only from us.
Never call third parties per user request.
**Consequences:** Fast, resilient, scales with users without touching quotas.

### D-008 — Branding as code (SVG + on-build generation) 🔄 superseded by D-012
**Context:** The founder's definitive logo (3D gold WC trophy + chrome "F90+" +
lime "+") can't be materialized into a repo file from chat; founder wants the studio
to own the whole pipeline.
**Decision:** Build the functional brand system in **vector/code** — an SVG
trophy-in-circle mark, a chrome wordmark, and `next/og`-generated OG/app-icons.
Reserve a slot for the founder's 3D render as the **marketing-hero** raster.
**Consequences:** Resolution-independent, themeable, zero-asset-dependency, instantly
consistent. The 3D render can drop in later for marketing without code changes.

### D-009 — Brand green aligned to the logo's lime ✅
**Context:** Founder: keep the *same lime green* as the logo's "+".
**Decision:** Add a `lime` token (~#AEF23A) and use it as the brand-green accent
(logo "+", brand glow, "free"/success). Keep `pitch` for data-viz/field semantics.
**Consequences:** "Same lime green" becomes a system rule, not an intention.

### D-010 — Copilot V1 runs on mock/cached data; adapters env-gated ✅
**Context:** "Implement V1" but "no paid APIs / no keys / very intelligent & alive."
**Decision:** The engine is real and deterministic, fed by **mock snapshots** now.
The football-data adapter is implemented but **gated by env** (defaults to mock); the
API-Football adapter is a prepared interface/stub (architecture only). No live calls,
no keys required.
**Consequences:** Works offline at $0, fully demoable; going live later = set a flag
+ free key. Honest "mock prediction engine" that is genuinely smart.

### D-011 — Studio operating model ✅
**Context:** Founder wants the project run as a real studio with full ownership.
**Decision:** Operate via the disciplines and gates in
[OPERATING_MODEL.md](OPERATING_MODEL.md); record decisions here.
**Consequences:** Initiative + coherence + documentation are the default mode.

### D-012 — The original render is the primary, official logo ✅ (supersedes D-008)
**Context:** Founder corrected course: the original 3D render (gold WC trophy in the
ring + chrome "F90+" + lime "+") IS the official identity — aggressive, premium,
stadium/night, glow, broadcast. It must NOT be reinterpreted into a minimal/abstract
mark. Simplified variants may exist for tiny/system cases, but must **derive
visually from the render**, not reinvent it.
**Decision:** Use the render (`public/brand/f90plus-logo.png`, sourced from the
founder's transparent export) as the primary logo on header, hero, loading,
marketing, 404. Generate favicon/app-icon/maskable/OG as **faithful downscales of
the render** via `scripts/brand/generate-icons.py` (Pillow). Restore the "original
glow" on dark surfaces with a CSS gold/lime radial behind the logo. The earlier
hand-authored SVG marks were deleted as off-brand reinterpretations.
**Consequences:** Branding is **raster-first**, 100% faithful to the founder's
render, reproducible via one script. A future true-vector logo, if ever needed, must
be a faithful trace of the render — never an abstract redraw.

### D-013 — No route-level loading boundary on the static homepage ✅
**Context:** A route-level `app/[locale]/loading.tsx` wrapped the homepage in a
Suspense boundary; in dev its reveal stalled (left the page on the loading fallback).
The homepage is static — there's nothing async to load.
**Decision:** Removed `loading.tsx`. Kept the branded loader as a reusable component
(`components/brand/brand-loader.tsx`) to drop into `loading.tsx` for genuinely async
routes later (e.g. live `/matches`). Also made the Analyst section synchronous
(`getMatchInsightSync`, mock-fed) so the page renders fully static with no Suspense.
**Consequences:** The static homepage renders directly and reliably. Loading states
return where there's real async work. (Note: Framer entrance animations are
rAF-driven, so they pause in a backgrounded/hidden tab — content reveals when the
tab is focused; this only affected headless screenshot capture, not real users.)

### D-014 — Real fixtures via openfootball (zero-key) + model probabilities ✅
**Context:** Start the transition to real data, free-first, architecture-first,
with graceful degradation. football-data.org needs an API key (founder's to obtain);
openfootball/worldcup.json is public domain, no key.
**Decision:** `lib/football/` fetches real WC2026 fixtures from openfootball
(cache-first, `revalidate` 6h → page is ISR), normalizes via a team-meta map
(code/accent/strength), and computes **model probabilities** from team strength
(elo) — honest "the model's view," not bookmaker odds. `getHomeMatches()` selects
the opener + 4 marquee fixtures and **falls back to the mock set** on any failure
(never throws). football-data.org adapter is built but **env-gated**
(`COPILOT_SOURCE=live` + `FOOTBALL_DATA_API_KEY`) for standings/form enrichment.
The Analyst analyzes the real opener via `insightFromStrengths` (elo + host
signals) → degrades gracefully (honest "moderate confidence", real drivers only).
**Consequences:** Homepage shows the real Mundial 2026 opener + real marquee
fixtures, real groups/dates. No fabricated odds/community. Adding a football-data
key later enriches automatically — nothing above the source layer changes.

### D-015 — Living atmosphere: curated, ultra-subtle broadcast motion ✅
**Context:** Make F90+ feel alive/cinematic (CL/DAZN/Apple Sports) WITHOUT overload,
casino flash, or particle spam.
**Decision:** A small, high-impact set only: a page-wide `AmbientBackdrop`
(drifting + breathing floodlight glows + a faint broadcast grid), a slow hero text
sheen, refined premium card hover (lift + LED glow), and the existing staggered
broadcast reveals. All GPU-friendly (opacity/transform) and **reduced-motion safe**.
Rejected: pointer-tilt gimmicks, crowd particles, anything loud.
**Consequences:** The whole page sits in a subtle night-stadium atmosphere; motion
adds emotion without noise. Restraint is the rule — new effects must pass the
"would a CL/Apple Sports package do this?" test.

### D-016 — Tool-agnostic & fully portable (no AI/editor lock-in) ✅
**Context:** F90+ must be continuable by **any** AI (Claude, ChatGPT, Codex, Cursor,
Windsurf…) or human team, at any time, with zero dependency on a specific tool —
exactly like the founder's other ecosystems.
**Decision:** Use only **standard, portable** tech (Next.js/TS/Tailwind/pnpm) and
conventions. No proprietary tooling, no AI-specific files in the repo, no obscure
"magic." Onboarding lives in plain Markdown: [README.md](../README.md) +
[AGENTS.md](../AGENTS.md) (the open cross-tool convention) + this docs/ folder.
Data access is via clean swappable adapters; the engine is pure; decisions are
recorded here. (The Claude Code preview `launch.json` lives in the operator's home
dir — never in the repo.)
**Consequences:** The repo can be handed to any AI or developer and understood +
continued immediately. New work must keep this true: prefer standard patterns,
document decisions, keep adapters/boundaries clean.

### D-017 — Cinematic atmosphere via composable CSS/SVG layers (no photos) 🔄 superseded by D-018
**Context:** The page needed more *visual football presence* / match-night depth —
without stock photos (rejected), heavy raster, or overload.
**Decision:** Build a **composable atmosphere layer system** in
`components/atmosphere/` — `StadiumScene` (night sky · distant grandstand crowd
texture · floodlight rig lamps + pools + beams · haze · floodlit pitch with grass +
lines + center circle · color glows · vignette/grain) and a reusable
`BroadcastOverlay` corner mark. All **CSS/SVG** (no images), token-driven,
GPU-friendly (opacity/transform/blur), **reduced-motion safe**. Depth comes from
darkness + light + layering, not literal photos. Art direction = UEFA/FIFA broadcast
packages, Apple Sports, night-stadium photography.
**Consequences:** "World Cup night" presence with zero heavy assets — tiny,
portable, scalable. Layers compose cleanly and are reusable across sections (e.g.
soft grass behind the Analyst). New atmosphere must stay subtle-first and pass the
"broadcast package, not wallpaper" test.

### D-018 — Photo-first hero; procedural "fake stadium" removed ✅ (supersedes D-017)
**Context:** The procedural CSS/SVG atmosphere (crowd dots, grass texture, faux
beams, generated bokeh) read as artificial/"generated". The founder wants REAL
football imagery, cinematically integrated — less fake, more photography.
**Decision:** Removed the procedural fake layers. `StadiumScene` is now
**photo-first**: a real image (`ATMOSPHERE.heroImage`) is the treated cinematic base
(cover · dark grade · soft-light brand tint · fade mask · vignette · grain); when
absent, a clean **dark editorial** mood (no faux stadium). `CinematicImageLayer` +
the manifest make it asset-agnostic. **Honest constraint:** premium soccer-night
photography can't be sourced/generated from this environment (verified: free public
sources are amateur/wrong-sport), so the image is a one-step drop-in by the
founder (AI-generated / licensed) — see [ART_DIRECTION_ASSETS.md](ART_DIRECTION_ASSETS.md).
**Consequences:** No fake textures. The hero is premium + intentional now, and
becomes fully cinematic the moment a real dark image is dropped in — no code change
beyond one manifest line. Kept tasteful vector accents (eyebrow tick, CTA pitch
lines, host identity, broadcast corner) — those are broadcast graphics, not fakes.

### D-019 — Real cinematic imagery integrated (founder-provided) ✅
**Context:** The founder generated and provided real cinematic football images.
**Decision:** Optimized them (WebP, sized — `scripts/assets/optimize-images.py`) and
organized under `public/` (`hero/` · `atmosphere/` · `worldcup/`). Integrated
photo-first via `CinematicImageLayer`: **hero** = night-stadium (low pitch angle,
treated with legibility scrims + grade + vignette); **CTA** = wide stadium (very
dark); **leaderboard** = globe-of-nations key art (faint, thematic); **OG/social**
= globe key art crop. All `next/image`-optimized, responsive, mobile-first, legible.
**Consequences:** F90+ now carries genuine "World Cup night" presence with real
imagery, cleanly integrated. Sources are founder-owned (no stock/licensing issue).
Replacing/adding images = drop a file + one manifest line.

### D-020 — Studio craft bar: maximum-level, premium-or-don't-ship ✅
**Context:** The founder set a standing standard (2026-06-03) for **all** future
phases: F90+ must be built like a complete premium studio producing the **official
digital experience of a World Cup** — never quick solutions, vibe-coding, tech demos,
improvised decisions, or impressive-but-poorly-integrated features.
**Decision:** Every change is executed at **maximum craft across all studio
disciplines** (Creative Director · Product Lead · Art Director · Motion Designer ·
Systems Architect · UX Lead · premium web designer · football-broadcast designer),
using deep reasoning, advanced visual judgment, systems thinking, and premium
composition — and, **by default without being asked**, the full toolbox: tools,
plugins, previews, research, visual comparatives, and *real* validations (browser,
ES/EN, mobile). The studio takes **constant initiative** on visual problems, UX,
atmosphere, composition, motion, legibility and art direction. **Quality rule: fewer
things, done excellently** (depth over speed). **Premium-or-don't-ship:** if a piece
cannot reach the FIFA / Apple Sports / UEFA flagship bar, it is **not forced in** —
it is flagged and a premium path proposed. This sits **on top of** the Definition of
Done and the standing invariants (mobile-first, responsive, GPU-friendly,
reduced-motion safe, portable/tool-agnostic, no lock-in, impeccable docs).
**Consequences:** Premium coherence is the default operating mode; "works
technically" is necessary but not sufficient. Per-feature velocity may be lower by
design. Decisions stay justified and recorded; the experience stays emotionally
coherent. See [OPERATING_MODEL.md](OPERATING_MODEL.md) → "Craft bar".

### D-021 — Dual-surface parity: mobile + desktop, formulated and validated together ✅
**Context:** Founder standing rule (2026-06-03): mobile must **never** be a shrunk-down
desktop. Every decision must be conceived AND validated on mobile and desktop at once;
mobile has to feel equally premium, emotional and broadcast-quality within its limits.
**Decision:** Composition, spacing, motion, glow, overlays and hierarchy are designed
for **real responsive from the first stroke** — accounting for mobile performance,
legibility-over-movement, safe areas, thumb ergonomics, reduced-motion and GPU
stability. On mobile, hero objects (e.g. the globe) must read as the *living presence*
of the World Cup, not a compressed interactive widget. Visual decisions are **validated
on both surfaces at real scale** before they're considered done — every spec/plan
carries the mobile composition as a first-class artifact, not an afterthought.
**Operating creed carried forward:** composition-first · premium-or-don't-ship ·
football-first · atmosphere-before-features · less-but-better ·
emotional-coherence-over-technical-spectacle.
**Consequences:** No "desktop-first then adapt" work. Extends invariant #2 and sits
with the craft bar (D-020).

### D-022 — The hero centerpiece is an interactive 3D globe (direction locked) ✅
**Context:** Founder direction: the hero's featured prediction card is replaced by a
premium, interactive **World Cup globe** as the emotional center and signature symbol
of F90+. Direction chosen via a real comparative (static composition mockups → then a
real three-globe prototype), validated on desktop + mobile.
**Decision:** The hero centerpiece is an **interactive 3D globe** (real
**`react-globe.gl` / three-globe**), replacing the featured `MatchCard`. Locked
direction = **"A+C calibrated per surface"** (broadcast opening sequence + cinematic
immersion): the globe is integrated *into* the night-stadium scene (one scene, not
stacked widgets); copy reads as a broadcast lower-third over a legibility scrim; the
**countdown sits as a pedestal directly under the globe** (more presence than at the
top). Visual base = dark **Earth Night** (city lights) + country **polygons** (defined
borders) + blue **atmosphere** + slow **auto-rotate**, default **POV centered on the
hosts**. **Mobile = emotion-first (option A):** globe (living presence) + countdown own
the first impact; the primary CTA is **hinted just below the fold** (partial/fade),
short natural scroll. Honors dual-surface parity (D-021). The featured opener stays in
the matches rail + Analyst; in-hero it becomes a globe state, not a separate card.
**Consequences:** Validated via a throwaway real-globe prototype (globe.gl via CDN —
operator tooling under `~/.claude`, never the repo). Full contract in
[GLOBE_HERO_SPEC.md](GLOBE_HERO_SPEC.md) (supersedes GLOBE_PHASE_PLAN.md). Build uses
`react-globe.gl` + `three`, client-only (`ssr:false`), error-boundaried, with an image
fallback. Note: animated `ringsData` wedged WebGL screenshotting in the prototype —
host "pulse" must be implemented carefully + perf-tested in the real build.

### D-023 — Globe data fidelity: real states only, no invented ones ✅
**Context:** The validation prototype fabricated team states (e.g. **Italy** shown as
qualified/"favorite" though it is not in the WC2026 field). The founder mandates
**absolute accuracy** — no invented qualified/eliminated nations, no visual predictions.
**Decision:** The globe is a **living official map**. States are **gold = host · green =
officially qualified · red = eliminated during the tournament · neutral = not in the
field**. **No "pending" and no "favorites" state.** The qualified set is read from the
**same real source the app already uses** — `openfootball/worldcup.json` (2026, D-014):
the 48-team field, **verified live** (e.g. **Italy is not in it**), derived from the real
group-stage participants and mapped team-name → country, **never hand-authored**. **Now:**
hosts in gold (most prominent) + **all** officially qualified in green + everyone else
neutral. **During the tournament:** nations turn **red progressively as they are really
eliminated** (from real results); "live" shows only when a match is truly in progress.
green/red change **only when real data justifies it**; unknown → neutral. Arcs/routes are
likewise **real-fixture-driven**. (Resolution note: nations with no polygon in a low-res
geojson — e.g. Cape Verde, Curaçao — appear via point markers / a richer geojson so
**all** qualified nations show.)
**Consequences:** The globe is spectacular **and** rigorously correct — a pure function
of verified real data, **validated against the live openfootball field before painting**.
Expresses invariant #9 (intelligence from real data, honestly) and the no-fabricated-data
rule. **Always verify real data before painting any country.**

### D-024 — The "living World Cup" experience model (unified, not a feature mix) ✅
**Context:** Founder locked the product identity: F90+ is **not** just fantasy / betting /
prediction market / tracker — it **fuses all of it into ONE living experience** where the
user builds their own evolving story during the tournament.
**Decision:** The product rests on **four shared layers** under every pillar — **World**
(the globe + the planet's live pulse), **Identity** (public profile / reputation /
country), **Economy** (virtual coins + points + reputation), **Time** (everything live
with the real tournament). Pillars — predictions · fantasy XI · player portfolio &
discovery · markets · rankings/reputation · narrative · country hubs · live tracking —
all **feed and draw from** those layers. Differentiating layers: **Momentum/Heat** (the
living global pulse), **Discovery** (sleepers / early signings / smart portfolio —
strategic, not arcade), **Narrative/Analyst** (editorial soul over everything),
**Country hubs + country identity**. Vision documented in full; built in coherent slices;
**Phase 1 = first MVP slice**. Full blueprint: [EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md).
**Consequences:** Coherence is **structural** (shared layers), not cosmetic. New features
must plug into the spine or they don't belong. The experience evolves automatically with
the real tournament (data-real, D-023).

### D-025 — Player representation = own IP, zero license dependency ✅
**Context:** Founder: no dependency on fragile official assets/licenses (FIFA/Panini/EA);
prefer an original, recognizable, premium F90+ visual language.
**Decision:** Players are represented with an **original F90+ card system**, **stylized
avatars / composable tokens** (role + nation + accent + number/initials → premium token →
original illustrated portrait), and **own iconography**. **Player names + real stats =
facts** (used by all fantasy, not copyrightable) and are fine; **official crests, kits,
photos and trade dress are avoided**; national flags are neutral symbols.
**Consequences:** A potential copyright liability becomes a **brand moat** — no licensing
cost or fragility, and a distinctive look we fully own.

### D-026 — Elimination is non-punitive; the game stays playable for all ✅
**Context:** Founder changed course on elimination: it must **never** punish or remove a
user from the experience.
**Decision:** If a user's chosen country is eliminated, the user **keeps their account and
every mechanic** (predictions, portfolio, fantasy, rankings) for the rest of the
tournament. **Only the emotional narrative shifts** (their nation is out; the hub mood
changes). **No frustrating or punitive mechanic removes anyone before the final.**
(A country shown "eliminated" = red on the globe per D-023 is a **narrative** state, never
a gate on the user.)
**Consequences:** The World Cup stays alive for **everyone** to the end; engagement is not
cut by real-world results. Country identity adds emotional stakes without lock-out.

### D-027 — Economy: three currencies; earning never costs you rank ✅ (founder-ratified 2026-06-04)
**Context:** The product evolves into predictions + fantasy + ideal XI. The founder's loop
is "predict → get it right → earn points → buy players." A naive single-currency design
(spend the same points you rank on) creates a dark pattern: competing and spending fight
each other. [EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md) §8 already names three concepts.
**Decision:** Formalize **three currencies**: **points** (skill, permanent, feed rankings &
reputation, never spent), **coins** (spendable on players/fantasy moves), **reputation**
(derived, cross-pillar, Phase 4+). A correct prediction credits **both** points (raise
rank) **and** coins (enter wallet). Users spend **coins**, never their rank — so "points
become the economy" without penalizing competition. Both are **append-only ledgers**
(`score_ledger`, `coin_ledger`) with cached projections (`profiles.total_points`,
`wallets.coins_balance`), mutated only by `SECURITY DEFINER` functions.
**Consequences:** Competing and spending are independent axes; the economy is
server-authoritative and tamper-proof by construction. Full spec:
[PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md), [SCHEMA_V1.md](SCHEMA_V1.md).

### D-028 — Phase 1 = Identity & Accounts on an isolated Supabase; economy foundations latent from day one ✅
**Context:** Identity is layer 2 of the living-World-Cup model and the prerequisite for the
social product. Economic integrity (no negative balances, no client-mutated money) cannot
be retrofitted credibly.
**Decision:** Phase 1 builds auth (F90+'s **own** isolated Supabase, `@supabase/ssr`),
public profiles, favourite-country identity, and the **wallet + append-only ledgers +
`award_*` functions** — even though spending arrives in Phase 3. The points/ranking
skeleton ships as a real (empty) teaser replacing the mock. Forward tables (`fixtures`,
`predictions`, `players`, `squads`, `lineups`, `leagues`) are **designed now, built later**
(see [SCHEMA_V1.md](SCHEMA_V1.md)) so no later phase reshapes Identity.
**Consequences:** A correct, isolated, anti-cheat foundation; adding Predictions/Fantasy/XI
becomes a pure add. Plan: [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md).

### D-029 — Roadmap reordered around the loop: Predictions generates the economy, Fantasy spends it ✅ (founder-ratified 2026-06-04)
**Context:** The expanded vision is predictions + fantasy + ideal XI as one daily loop.
The previous roadmap ordered features somewhat independently.
**Decision:** Reorder by loop dependency — **Phase 2 = Predictions Core & Scoring**
(generates points + coins, creates the daily habit), **Phase 3 = Economy: Market + Fantasy
XI** (spends coins), **Phase 4 = Rankings, Leagues & Reputation** (competition + viral
loop), then Narrative (5), Momentum/Heat (6), live/PWA (7). Predictions must precede the
market because the market needs the economy Predictions produces.
**Consequences:** Each phase is fueled by the prior one; no feature ships without its
input. [ROADMAP.md](ROADMAP.md) updated.

### D-030 — Auth methods: magic-link + Google + Apple (studio default, reversible) ✅
**Context:** Choose sign-in methods that minimize friction and fit a global, mobile-first,
future-PWA audience, with no password management.
**Decision:** Email **magic-link** + **Google OAuth** + **Apple OAuth** (Apple needed for
iOS/PWA later), all via `@supabase/ssr` (cookie sessions). GitHub excluded (wrong
audience). Default-and-proceed per [OPERATING_MODEL.md](OPERATING_MODEL.md); reversible.
**Consequences:** Low-friction onboarding; Apple/Google provider config is a small founder
gate after `f90.xyz` connects.

### D-031 — Identity defaults: welcome bonus, mutability, shareable profile, own-IP avatars (studio defaults, reversible) ✅
**Context:** Several reversible Identity parameters needed sensible defaults to unblock the
build without escalating each one.
**Decision:** (a) **1,000-coin welcome bonus** at signup (seeds the economy; spendable once
the market exists). (b) `username` + favourite **country** are changeable with a **30-day
cooldown** (anti link-rot / impersonation / tribe-hopping). (c) The **public profile is
first-class and OG-shareable** (`/u/[username]`) to power the growth loop. (d) **Avatars
are own-IP composite tokens** (initials + country accent + pattern), never photos —
extends D-025. Default-and-proceed; reversible on founder call.
**Consequences:** Onboarding and the profile are fully specified for implementation; all
four are tunable later without schema changes.

### D-032 — Phase 0.6: the Tournament Center (the pre-user "feel alive" band) ✅ (founder-ratified 2026-06-04)
**Context:** Foundation shipped (f90.xyz live) but the home had no living World Cup content.
With the opener 7 days out (11 Jun 2026), the qualification race is over and the draw is set —
the highest-attention window for World Cup content, and the moment to make F90+ feel alive
*before* Identity (Phase 1) brings users. A pre-Phase-1 mini-phase was approved after a
product audit + implementation SPEC.
**Decision:** Insert **Phase 0.6 — Tournament Center** between 0.5 and 1: a premium band after
the Hero, five modules from **one cache-first openfootball read** (`getTournament()` — the
canonical tournament spine all later phases attach to): **Field Is Set** (count-up
48/12/104/16), **Qualified Nations** (confederation filter + real vendored flags w/ code-token
fallback), **The Draw** (12 groups + the Analyst's "group of the death" from model strengths),
**The Road** (full 2026 bracket R32→Final — desktop wallchart / mobile round-navigator; slot
codes 1A/2B/3A-/W##/L## decoded + i18n'd), **Key Matches** (marquee `AnalystCard` + fixtures
grid). The **Analyst is woven through** groups/bracket/key-matches (founder emphasis:
experience, not a data table). Data fidelity (extends D-023): groups/bracket/fixtures from
openfootball; confederation + flag are **factual reference maps**; live scores/results are
out of scope (V2 live layer). `getTournament()` = pure `parseTournament` + thin fetch wrapper,
never throws, degrades honestly (`source: 'fallback'`). `MatchesRail` + the standalone
`AnalystSection` are **folded into Key Matches and retired**; nav repointed. **Vitest** wired
(per the backlog's "Vitest from pre-flight") — the data layer is TDD'd (34 unit tests). No
auth/Supabase/paid-API/persisted-predictions (those are Phase 1+).
**Consequences:** The home is alive for the tournament's peak window at **$0** (no new paid
dependency), and Phases 1–4 plug into an existing object spine (nations/groups/fixtures/bracket)
instead of inventing one. Build + typecheck + 34 tests green; validated on desktop + mobile,
ES + EN, zero console errors. Branch `feat/phase-0.6-tournament-center` (not yet pushed/merged —
founder gate). Flags vendored from flagcdn under `public/flags/`. Note: the repo's `eslint .`
is broken at the tooling level (no flat-config file; `@eslint/eslintrc` circular-structure) —
**pre-existing and unrelated to this phase** (verified: only Vitest was added; `next` unchanged);
flagged for a separate tooling fix. typecheck + Vitest + build are the effective quality gates.

### D-033 — Vercel reality: F90+ deploys MANUALLY (`vercel --prod`), in Chiribito's Vercel team ✅ (2026-06-04)
**Context:** Phase 0.6 was merged to `main` (`f2be258`) but never appeared on production. A
root-cause audit (2026-06-04) found the deploy assumptions in [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md)
§4/§6 were wrong: pushing to `main` deploys nothing.
**Findings (verified):** (a) The `f90` Vercel project is **not git-connected for auto-deploy** —
GitHub shows 0 deployments / 0 checks on recent commits; the live production deployment had **empty
git metadata** (`githubCommitSha`/`gitSource` all blank) → it was a **manual `vercel --prod`**.
(b) The `f90` project lives in the Vercel team **`chiribito293-7173s-projects`** — the **same team
as Chiribito / xpredict / xprediction-demo**, NOT an isolated F90+ Vercel account (contradicts the
runbook's isolation claim). (c) Canonical domain is **`www.f90.xyz`**; the apex `f90.xyz`
**308→www**.
**Decision:** Until GitHub auto-deploy is connected, **production is published by hand** —
`vercel link --project f90 --yes --scope chiribito293-7173s-projects` then `vercel --prod --yes`
from the repo root (builds the local working tree; aliases `www.f90.xyz`). Phase 0.6 was published
this way (deployment `dpl_ETMNzrovfdWkU3z1meLJUaRvkNLe`, READY; `www.f90.xyz` aliased; EN + ES
verified live). DEPLOY_RUNBOOK updated with a REALITY CHECK + the exact procedure.
**Open governance item (NOT decided — founder call):** migrate `f90` to a truly isolated F90+
Vercel team vs. accept the shared Chiribito team; and optionally connect GitHub auto-deploy
(Settings → Git → Connect `F90Plus/f90`, Production Branch `main`).
**Consequences:** Each phase must be manually `vercel --prod`-ed until auto-deploy is wired. The
"isolated Vercel account" invariant is currently **violated at the team level** and needs a founder
decision. Code isolation (separate repo `F90Plus/f90`) is intact.

### D-034 — Expanded product vision: prediction markets + virtual economy + player trading (designed, not built) ✅ (founder, 2026-06-04)
**Context:** The founder clarified the target vision goes **beyond sports predictions**. F90+ will
also include: **Polymarket-style prediction markets** (no real money), a **persistent virtual
wallet**, a **virtual economy** driven by correct calls + real performance, **player buy/sell** with
**dynamic in-tournament prices**, full **squad building** (starting XI + bench + total team value),
**social rankings + private leagues**, and a **player/asset portfolio**. This refines and extends the
living-World-Cup model (D-024) and the three-currency economy (D-027); most of it is already in the
[SCHEMA_V1.md](SCHEMA_V1.md) forward contract (`players`, `squads`, `lineups`, `leagues`,
`predictions`). The **new** emphasis is a market layer (a price/position per outcome, Polymarket-style)
**on top of** — not replacing — the difficulty-honest 1X2/score/bracket predictions.
**Decision:** **Phase 1 scope is UNCHANGED** (Identity & Accounts only). But every
Identity/auth/profile/wallet/onboarding decision stays **generic and extensible** so these systems
plug in later **without reshaping Identity**. Already true by design and to be preserved: (a) the
wallet + append-only `coin_ledger`/`score_ledger` with generic `(kind, ref_type, ref_id)` absorb
**any** economic source — prediction settlement, market trades, player purchases, fantasy rewards;
(b) `award_coins`/`award_points` (`SECURITY DEFINER`) are the **single, reusable** write path;
(c) `profiles` carry no system-specific fields; (d) auth is provider-agnostic. The Polymarket-style
**market is a NEW subsystem** to design in its own phase (an extension around Phase 2/3): it adds
market/position/settlement tables (AMM vs simple order model — TBD), but reads the **same wallet** and
feeds the **same points** — one character, one economy.
**Consequences:** No Phase 1 rework when markets/portfolio/dynamic-pricing land; the economy stays
server-authoritative and tamper-proof by construction. A dedicated market-design doc + ADR will
precede that build. The 1X2/score/bracket predictions (D-027) and the market layer **coexist** as two
prediction surfaces over one economy.

### D-035 — Auth flows (T4): one dual-mode callback, locale-safe redirects, passwordless login = signup ✅ (2026-06-04)
**Context:** T4 builds the user-facing auth on the T1 SSR clients + T2 trigger. Two real-world
ambiguities had to be resolved: (a) `@supabase/ssr` magic links can return to the app as either
`?code=` (default template / OAuth) **or** `?token_hash=&type=` (token-hash template), and (b) the
flow must preserve the active locale and never become an open redirect. Google OAuth always returns
`?code=`.
**Decision:** (1) **One callback** at `/[locale]/(auth)/callback/route.ts` handles **both** forms —
`exchangeCodeForSession(code)` for OAuth + PKCE magic links, `verifyOtp({token_hash,type})` for the
token-hash template — so magic-link ships **without** requiring a Supabase email-template edit.
(2) Redirect resolution is **pure + unit-tested** (`features/auth/validation.ts`): `resolveSafeNext`
collapses any non-internal `next` (external/`//`/backslash/control-char) to `/`; `localePathname`
re-applies next-intl's `as-needed` prefix in a Route Handler that only sees raw URLs. (3) Magic-link
uses `shouldCreateUser: true`, so **login and signup are the same frictionless passwordless path**
(implements D-030; a new email auto-provisions profile + wallet + 1,000-coin bonus via the T2
trigger — verified end-to-end: a real request created `fan_e1632271` with `coins_balance=1000`).
Email validation is server-side **zod** (`z.email()`), returning stable i18n keys, never raw messages.
**Consequences:** Verified functionally on localhost:3300 — pages render ES+EN (0 console errors),
invalid email → localized error, valid email → "check your inbox" (Supabase accepted), Google → 303 to
the provider authorize URL. **Open config items (founder/dashboard, not code):** Supabase `site_url`
is still `http://localhost:3000` (should become the production origin); the redirect allow-list has
`https://www.f90.xyz/**` + (added this session) `http://localhost:3300/**`, but **not** the apex
`https://f90.xyz/**` — add it before production OAuth/magic-link; production magic-link still needs its
own SMTP (Resend) — dev SMTP is rate-limited. Full Google-consent + email-click completion needs a
real account/inbox (founder), and is the only hop not machine-verifiable headless.

### D-036 — Landing speaks "market" (D-034): live-market ticker in, "Qualified Nations" out ✅ (2026-06-04)
**Context:** The landing communicated too much "World Cup information" and not enough "prediction
market". Per the expanded vision (D-034 — Polymarket-style markets, wallet, player trading, fantasy),
the homepage should start signalling that direction. Separately, the "Qualified Nations" grid ("Las 48
ya están") duplicated the Groups section right below it (which already shows all 48 nations in
context) and consumed a lot of vertical space for little added value.
**Decision:** (1) **Removed** the `QualifiedNations` section and its dead code (`qualified-nations.tsx`,
`nation-card.tsx`, the `tournament.nations` i18n) — keeping `NationFlag` and the `confederations` lib
(still used by Groups + Bracket). The Tournament Center now flows Field-Is-Set → Groups → Bracket →
Key Matches. (2) **Added a live-market ticker** (`features/markets/market-ticker.tsx` + illustrative
`data/markets.ts`) directly under the Hero: a seamless, financial-terminal tape (subject · outcome ·
probability% · green ▲ / red ▼ 24h move), premium not casino — pure-CSS marquee, hover-pause,
reduced-motion-safe. (3) **Values are implied probabilities (Polymarket-style), NOT decimal odds.**
Decimal odds are the language of sportsbooks (an explicit anti-goal), so this deviates from the
founder's illustrative "4.50" examples while honouring the stated anti-betting principle — a trivial
format swap if odds are preferred. (4) Data is **illustrative** (the markets engine is a later
subsystem per D-034/D-035), framed honestly with a "Pronto/Soon" tag + an aria "preview" label,
mirroring the existing leaderboard teaser pattern (`data/leaderboard.ts`).
**Consequences:** The landing now reads as a prediction market within seconds, with a tighter vertical
rhythm. When the real markets engine lands, the ticker swaps illustrative rows for live `markets`
reads with no layout change. Verified: ES + EN + mobile render (0 console errors), `typecheck` + 63
tests + `build` green. Subjects are real teams/players (facts, D-025).

### D-037 — Prediction-market identity LOCKED: probability %, never bookmaker odds ✅ (founder-ratified 2026-06-04)
**Context:** D-036 chose implied probability over decimal odds for the market ticker as an autonomous
call, flagged for confirmation. The founder confirmed and elevated it to a brand invariant.
**Decision:** F90+ markets ALWAYS express implied **probability (%)**, never decimal/fractional/
American **odds**. Probability communicates a prediction market + collective intelligence; odds read
as a traditional sportsbook, which F90+ explicitly is not (a non-goal — see ROADMAP "Non-goals":
real-money betting/payouts/gambling). This governs the ticker, future market pages, player markets,
and any price surface. Movement deltas (▲/▼ %) and "chance" framing are the house language.
**Consequences:** No surface introduces odds, "bookmaker", "bet/wager/stake" framing, or fractional/
decimal price formats. "Predict / chance / market / position" is the vocabulary. Reinforces the
responsible, signal-not-wager positioning across the whole product.

### D-038 — Ecosystem vision recorded + architecture reserved (Entity Layer & Fantasy) ✅ (founder, 2026-06-04)
**Context:** The founder set the long-term direction: per-nation **hubs** (`/nations/<slug>` with
Overview/Players/Stats/Matches/Markets/Predictions), first-class **player profiles**
(`/players/<slug>`), **Fantasy as a visible top-level vertical** (nav → World Cup · Markets · Fantasy ·
Rankings), and a landing **"What is F90+?"** discovery section. Asked for analysis + documentation
only — **no implementation now**.
**Decision:** Recorded in full in [ECOSYSTEM_VISION.md](ECOSYSTEM_VISION.md). It is a **faithful
expansion of D-034** (adds the *navigable entity layer + Fantasy framing + discovery*, no new economic
primitives). Adopt as a recognised milestone cluster **"Phase 3.5 — Entity Layer & Fantasy"**,
**sequenced after** the engine (Phase 2 economy → Phase 3 players/market/XI), since entity pages are
read-models over that data. **Reserve the route namespaces now** (`/nations/[code]/*`,
`/players/[slug]`, `/markets/*`, `/fantasy/*`) so nothing collides. Routes/slugs stay **English**
(D-003) — the ES UI localizes labels, not URLs. The player is the **shared primitive**: one market
price viewed three ways (market value · trading P&L · fantasy value), one wallet, one points total.
**Early wins allowed before the engine:** the discovery section and **read-only** nation hubs
(over openfootball data). **Consequences:** T6+ build *toward* this (and must not reuse the reserved
namespaces). Open questions O-1..O-4 (slug, market model, Fantasy v1 scope, player likeness) are
parked in the vision doc for when the cluster starts. NOT on the critical path for Phase 1.
