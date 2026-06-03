# F90+ — Globe Hero (Canonical Spec)

> **Status:** Direction LOCKED + visually validated (desktop + mobile) via a real
> three-globe prototype. Ready for implementation. **Supersedes**
> [GLOBE_PHASE_PLAN.md](GLOBE_PHASE_PLAN.md). Date: **2026-06-03**.
> Decisions: [DECISIONS.md](DECISIONS.md) **D-022** (direction) · **D-023** (data
> fidelity) · D-021 (dual-surface parity) · D-020 (craft bar).
> North star: [VISUAL_DIRECTION.md](VISUAL_DIRECTION.md). State checkpoint:
> [PROJECT_STATE.md](PROJECT_STATE.md).

## 1. What this is
Replace the hero's featured prediction card with an **interactive 3D World Cup globe** —
the emotional center and signature symbol of F90+. The globe must feel like *the living
World Cup 2026*: cinematic, premium, global, alive, **and rigorously correct with real
tournament data**. Not a flat map, not a science/geo viz, not a tech demo, not a widget
stacked on the page — one coherent night-stadium scene.

## 2. Locked direction — "A+C calibrated per surface"
Broadcast opening sequence (A) **+** cinematic immersion (C), dialed per surface:
- The globe is integrated **into** the night-stadium photo (one scene; the stadium is
  the deep backdrop, the globe the lit focal point).
- Copy reads as a **broadcast lower-third** over a left→transparent legibility scrim.
- The **countdown sits as a pedestal directly under the globe** (echoes the
  globe-on-glowing-ring key art — `public/worldcup/globe-flags.webp`). More presence
  than at the top.
- **Desktop:** full immersion (large globe, richer atmosphere, higher photo presence).
- **Mobile:** the globe is **contained** ("living presence", inside safe edges — not
  edge-to-edge) so legibility/control hold; **emotion-first (option A)** — globe +
  countdown own the first impact, the **primary CTA is hinted just below the fold**
  (partial/fade visible), with a short, natural scroll.

## 3. Composition contract (both surfaces are first-class — D-021)

### Desktop (≥ ~900px)
Two zones in one scene:
- **Left — copy / lower-third:** logo → eyebrow badge → H1 (`lead` + gradient-sheen
  line) → subtitle → CTAs (primary LED, secondary glass) → free/coins/ranking chips.
  Lives on the darker (scrimmed) side; always crisp.
- **Right — globe + countdown pedestal:** globe centered; countdown directly beneath it
  (eyebrow "El pitido inicial · El torneo arranca en" + 4 prominent tabular cells) over
  a soft pedestal glow.
- Whole hero **fits within the fold** (validated: ~800px laptop height — globe scaled so
  copy + globe + countdown all fit; do not let it overflow).
- Validated starting values (tune in real build): globe ≈ `clamp(380px, 40vw, 540px)`;
  photo opacity ≈ 0.72; left scrim ≈ 72%; countdown cell num ≈ 2.15rem.

### Mobile (< ~900px) — emotion-first
Stacked, in order: broadcast corner (compact) → logo + eyebrow + H1 → **globe (living
presence)** → **countdown pedestal** → subtitle → CTAs (full-width, thumb zone) → chips.
- Globe ≈ `clamp(300px, 84vw, 380px)` (contained, big presence — **not** edge-bleed),
  photo opacity ≈ 0.8.
- Globe + countdown sit in the **first impact**; the primary CTA is **hinted just below
  the fold** (partial + bottom fade), short natural scroll. Respect `env(safe-area-*)`.

## 4. The globe — visual language & behavior
- **Base:** dark **Earth Night** texture (city lights) — on-brand "world alive at night",
  continents defined by coastline lights + topology bump for depth.
- **Countries:** real **country polygons** (defined borders) so the world reads as
  countries, not a blob. Subtle neutral borders globally; state colors per §5.
- **Atmosphere:** soft blue fresnel limb glow (LED-blue), cinematic — the globe sits
  *into* the night, not floating in a void.
- **Lighting/depth:** day/terminator + limb darkening + subtle specular; premium, real,
  not flat.
- **Motion:** slow, elegant **auto-rotate**; eases on user interaction; one calm idle
  rhythm. **Default POV centered on the hosts** (North America) — they are the first
  thing the eye meets.
- **Interaction:** drag to rotate · scroll/pinch to **zoom (bounded)** · **hover** a
  country → soft highlight + label · **click** → country card (§6) with a gentle
  focus/tilt. Weighty, premium (spring easing). `enablePan` off.

### Host prominence (the instant focal point — D-022/D-023)
Hosts (USA · Canada · Mexico) must read **instantly** as the center of WC2026:
- Gold country fill (moderate — **emissive/organic, not a flat "gold blob"**) + bright
  gold borders + a gold **beacon** (dot) + label ("EE. UU." / "Canadá" / "México").
- A subtle **gold pulse** on the hosts is desired — but implement it **carefully and
  perf-tested**: animated `ringsData` wedged WebGL screenshotting in the prototype, so
  prefer a lightweight shader/sprite pulse or a CSS halo behind the canvas, validated
  for performance and reduced-motion.

## 5. Country states — DATA FIDELITY (D-023, non-negotiable)
The globe is a **living official map of WC2026.** State language:
**gold = host · green = officially qualified · red = eliminated during the tournament ·
neutral = not in the field.** **No "pending"**, no "favorites", no invented/approximate
states, no visual predictions.
- **Now (pre-tournament):** **hosts (USA/Canada/Mexico) in gold — most prominent —
  + ALL officially qualified nations in green + everyone else neutral.**
- **During the tournament:** nations turn **red progressively as they are really
  eliminated** (real results). "live" (match in progress) shows only when true.
- **Source of truth = the real data the app already uses:** `openfootball/worldcup.json`
  (2026). The qualified set is **derived** from the real group-stage participants
  (`lib/football` already fetches this — the globe reuses it), **never hand-authored**.
  Verified live = the **48-team field** (e.g. **Italy is not in it**). Cross-check FIFA
  when wiring.
- **Name mapping** (a few openfootball names ≠ polygon names): USA → United States of
  America · England, Scotland → United Kingdom · Czech Republic → Czechia · DR Congo →
  Democratic Republic of the Congo · Bosnia & Herzegovina → Bosnia and Herzegovina.
  Nations with **no polygon** in a low-res geojson (e.g. **Cape Verde, Curaçao**) must
  still appear — use a **richer geojson** or **point markers** (real centroids) so
  **all** qualified nations show.
- Rule: a country's state is a **pure function of verified real data**. Unknown →
  neutral. **Verify real data before painting any country.**

## 6. Country card (hover / click)
Elegant, minimal, honest — reuses existing systems, i18n (ES/EN):
- Identity: code, name, group, **host badge** when applicable.
- **Status** (host / qualified / eliminated / neutral) — only what's real.
- **Next match(es)** from `lib/football` (openfootball).
- **AI read** from the deterministic Copilot engine (`lib/copilot`,
  `insightFromStrengths` / live signals) — honest, probabilistic, no fabricated odds.
- **Ranking / recent form** only when the football-data key is live (env-gated, D-014);
  otherwise omitted — **never fabricated** (no empty/fake fields).

## 7. Arcs / routes
Elegant animated arcs for **real** matchups / routes — **data-driven from real
fixtures**, introduced when that data is wired. Not decorative implications of who's
"in" (D-023). Restraint: few at a time, slow dashes, LED/gold, never spaghetti.

## 8. Data model
- Extend `lib/football/teams.ts` (or a sibling `lib/football/geo.ts`) with a **committed
  static centroid table**: `{ name, code, lat, lng }` for nations — no runtime geo
  dependency.
- Derive `worldCupStatus` (`host | qualified | eliminated | live | neutral`) as a **pure
  function of the real source** (openfootball participants/results), not a hardcoded
  list. Pre-tournament/unknown → `host` for the three hosts, `neutral` for all others.
- **Vendor the globe assets into the repo** for portability/offline/perf (D-016): the
  Earth Night texture + topology + country polygons GeoJSON live under `public/` (or
  `lib/`), **not** loaded from a CDN at runtime (the prototype's CDN use is throwaway).

## 9. Countdown (pedestal)
- Reuse the real ticking `Countdown` (`features/home/countdown.tsx`,
  `WORLD_CUP_KICKOFF_ISO`) — real time to kickoff, tabular numerals, reduced-motion safe.
- Relocate **directly under the globe**, upgraded for **presence**: prominent cells,
  broadcast eyebrow, soft pedestal glow behind it. Keep the host line.

## 10. Micro-motion / microdetails (THIS phase — curated, subtle-first, D-015)
A tight set only, all GPU-friendly + reduced-motion safe:
- Host **gold pulse** (perf-tested, per §4).
- Slow globe auto-rotate + atmosphere breathe.
- Countdown pedestal glow; refined **LIVE** pulse (when a real live state exists).
- (Deferred to a later pass — not this phase: a cinematic floating ball, broader
  broadcast sweep across the site, extra HUD overlays. Avoid overload.)

## 11. Architecture
- New feature module `features/globe/` (e.g. `WorldCupGlobe.tsx` + `globe-data.ts` +
  `CountryCard.tsx`). Reuse `lib/football` (data) + `lib/copilot` (AI read).
- **Client-only:** `dynamic(() => import(...), { ssr: false })` (needs WebGL/window),
  wrapped in an **error boundary** + suspense fallback so it can never break the page.
- Library: **`react-globe.gl`** (+ `three`, `@types/three`) — same `three-globe` base as
  the validated prototype. Standard, portable, no lock-in (D-016).
- Tokens over hardcoding; copy via `locales/` (no hardcoded strings).

## 12. Performance & mobile parity
- Cap DPR; **pause rendering off-screen** (IntersectionObserver) and when tab hidden;
  **lazy-mount** the globe.
- **Mobile:** lighter globe (smaller, fewer/optional effects, capped DPR) — but still
  premium "living presence" (parity, not a cut-down — D-021).
- **`prefers-reduced-motion`:** disable auto-rotate + animated arcs/pulse → static globe.
- Target: no jank on mid devices; the globe is an enhancement — **content works without
  it** (fallback).
- Avoid the prototype's animated-`ringsData` WebGL stall; vendor assets locally to avoid
  runtime CDN latency.

## 13. Fallback strategy
On no-WebGL / low-power / load failure: render the **globe key-art image**
(`public/worldcup/globe-flags.webp`) with the same copy + countdown + CTAs — a tasteful,
premium static hero. Never a broken canvas. The error boundary guarantees this.

## 14. Coherence & integration
- One **night-stadium scene**: stadium photo (graded/scrimmed/vignetted) → globe (lit
  focal point) → copy lower-third → countdown pedestal → broadcast accents. No "stacked
  widgets".
- The globe **replaces** the featured `MatchCard` in the hero. The featured opener is
  **not lost**: it stays in the matches rail + Analyst section; in-hero it becomes a
  globe state (the opener's live/next highlight), not a separate card.
- **Avoid duplicate WC/host branding:** the chosen hero photo already carries World-Cup
  branding; the globe's host labels + the countdown host line carry host identity — so
  drop/minimize the redundant broadcast corner on desktop (default decision; revisit if
  the hero photo changes).

## 15. Non-goals
No flat/educational/science map · no fabricated qualified/eliminated states or
predictions (D-023) · no real money/betting · no overload/particle spam/casino/gamer/
cyberpunk (VISUAL_DIRECTION) · no mobile edge-to-edge globe (contained) · no runtime CDN
dependency in production · no LLM/paid data (deterministic Copilot read only).

## 16. Acceptance criteria (Definition of Done + craft gate)
- [ ] `pnpm typecheck` + `pnpm build` green (strict TS, no `ignore*Errors`).
- [ ] Verified in browser: **ES + EN + mobile + desktop**, **zero console errors**.
- [ ] Globe renders premium (Earth Night + defined countries + atmosphere + slow
      rotate), **hosts instantly the focal point**, **everyone else neutral**.
- [ ] **Data fidelity:** no country shows a state without verified real data (D-023).
- [ ] Hover/click → honest country card (no fabricated fields).
- [ ] Countdown lives under the globe with real presence; real ticking time.
- [ ] **Dual-surface parity:** mobile feels equally premium; CTA hinted; short scroll.
- [ ] `prefers-reduced-motion` → static; **fallback** image path works (no broken canvas).
- [ ] Perf: no jank on mid devices; off-screen pause; DPR cap; assets vendored locally.
- [ ] No hardcoded copy/design values; tokens + `locales/` only.
- [ ] Docs updated; decisions recorded.

## 17. Risks & mitigations
- WebGL bundle size → lazy-load + `ssr:false`. · SSR/window → client-only. · Mobile perf
  → lighter globe + DPR cap + pause off-screen. · No-WebGL → image fallback. · Animated
  host pulse stalling render → lightweight/perf-tested pulse (not heavy `ringsData`). ·
  Data drift / wrong states → states are a pure function of the verified real source,
  default neutral.

## 18. Validated prototype (reference only — not in the repo)
A throwaway real-globe prototype validated this direction on desktop + mobile (globe.gl
via CDN). It lives in **operator tooling** at `~/.claude/f90plus-mockups/globe-hero/`
(launch config `f90plus-globe-mockup`), per D-016 it is **never** committed to the repo.
The production build re-creates this with `react-globe.gl` + vendored assets.
