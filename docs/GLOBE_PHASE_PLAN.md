# F90+ — The World Cup Globe (Phase Plan)

> ⚠️ **SUPERSEDED (2026-06-03) by [GLOBE_HERO_SPEC.md](GLOBE_HERO_SPEC.md)** — the
> canonical, validated implementation contract. This file is kept for history only.
> The spec locks the direction (DECISIONS D-022) and the data-fidelity rule (D-023);
> **follow the spec, not this plan.**
>
> **Now BUILT and LIVE (2026-06-04)** per the spec — the 3D globe hero ships in production
> at f90.xyz (`features/globe/`, vendored assets, perf-hardened). This file is history only;
> the implementation contract is [GLOBE_HERO_SPEC.md](GLOBE_HERO_SPEC.md).

## Vision
A cinematic, interactive **3D globe** that turns F90+ into *the living World Cup* —
a dark, premium Earth where the 48 nations glow, matchups arc across continents, and
hovering a country opens an elegant intelligence card. The globe becomes a **signature
symbol** of F90+. References: FIFA World Cup intros, Apple event visuals, CL broadcast
graphics, Iron-Man-HUD restraint (elegant, not gamer).

**Not:** a flat map, an educational/Google-Earth globe, a cold data viz, or loud
gamer UI.

## UX
- Slow, elegant **auto-rotation**; user can **drag to rotate**, **scroll/pinch to
  zoom** (bounded), and it eases on release.
- **Hover a country** → soft highlight + label. **Click** → the country card opens;
  the globe gently focuses/tilts toward it.
- Calm idle motion; interactions feel weighty and premium (spring easing).

## Stack (decision)
- **`react-globe.gl`** (React wrapper over **Three.js** + three-globe). Rationale:
  premium result with far less boilerplate than raw Three.js; supports points, arcs,
  rings, custom materials, hover/click out of the box; performant.
- Add: `react-globe.gl three` (+ `@types/three`).
- **Client-only:** `dynamic(() => import('...'), { ssr: false })` (needs WebGL/window).
  Wrap in an **error boundary** + suspense fallback so it never breaks the page.
- Lives in `features/globe/` (new), data in `lib/football` (reuse), card via
  `lib/copilot` (reuse). Tool-agnostic, portable.

## Country data
- A dataset of qualified nations: `{ name, code, lat, lng, state, strength }` —
  extend `lib/football/teams.ts` with lat/lng + `state`. Source positions from a
  static capital/centroid table (committed; no runtime geo dependency).
- States: `host | qualified | favorite | eliminated | live`.

## Visual states (glow language)
| State | Treatment |
| --- | --- |
| Qualified | subtle **lime** point/glow |
| Favorite (top strength) | premium **gold** glow |
| Host (USA/Canada/Mexico) | highlighted ring + label |
| Eliminated | dark **fade** |
| Live (match now) | soft **pulse** |

Keep glows subtle; dark globe, cinematic rim light, minimal controlled particles.

## Arcs / connections
Elegant animated **arcs** between nations for: upcoming matchups, "routes", rivalries
— a global narrative layer. Animate dashes slowly; color by context (LED/gold). Few
at a time (no spaghetti).

## Country card (on hover/click)
Elegant card reusing existing systems:
- Team identity (code, name, group, host badge).
- **Status** (qualified / eliminated / host / favorite).
- **Next match(es)** from `lib/football` (openfootball).
- **Ranking / recent form** (from football-data once the key is live; modeled now).
- **AI probability** from the Copilot engine (`insightFromStrengths` / live signals).
- Honest, premium, i18n (ES/EN). Never fabricated data.

## AI integration
The card's read comes from the **deterministic Copilot engine** (no LLM) — same
graceful-degradation model already built. Enriches automatically when football-data
(form/standings) is enabled.

## Performance & mobile
- Cap DPR, throttle when off-screen (IntersectionObserver pause), lazy-mount.
- **Mobile strategy:** lighter globe (fewer arcs/points, lower DPR) OR, on
  low-power/no-WebGL, **fallback to the globe key-art image** (`worldcup/globe-flags.webp`)
  with a tasteful CTA — never a broken canvas.
- **`prefers-reduced-motion`:** disable auto-rotation + arc animation (static globe).
- Target: no jank on mid devices; globe is an enhancement, content works without it.

## Atmosphere integration
The globe lives **over the cinematic stadium imagery** (the existing atmosphere) —
dark backdrop, the globe as the lit focal point, broadcast overlays in corners.
Possibly **recompose the hero** so globe + stadium + branding + countdown + Analyst
read as one coherent "World Cup night" experience (decide during build).

## Composition options
1. **Globe as a dedicated section** ("The World, live") below the hero — lower risk.
2. **Globe in the hero** as the centerpiece — higher impact, more layout work.
Recommend starting with (1), then evaluating (2).

## Implementation roadmap
1. Install deps; scaffold `features/globe/WorldCupGlobe.tsx` (dynamic, ssr:false) +
   error boundary + fallback image.
2. Dark globe material + slow auto-rotate + controls (drag/zoom bounded).
3. Country points dataset (lat/lng + state) in `lib/football`; render with state glows.
4. Hover/click → `CountryCard` (team + next match + Copilot probability).
5. Arcs for upcoming matchups.
6. Reduced-motion + mobile fallback + perf pass (DPR, pause off-screen).
7. Atmosphere integration + composition; verify in a real browser (WebGL won't
   reliably screenshot headless).
8. Document decisions (DECISIONS.md) + update PROJECT_STATE.

## Risks
WebGL bundle size (lazy-load), SSR (`ssr:false`), mobile perf (fallback), headless
screenshot limitation (verify live). All mitigated above.
