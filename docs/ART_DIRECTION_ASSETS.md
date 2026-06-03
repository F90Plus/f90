# F90+ — Art Direction & Real Imagery

How real, cinematic football photography drops into F90+ — **photo-first**, treated
like a broadcast package, never a pasted wallpaper.

## Status — real imagery is integrated ✅

The founder provided real cinematic images; they're optimized + organized + wired
photo-first. **Current assets** (`apps/web/public/`, WebP, via
`scripts/assets/optimize-images.py`):

| File | Used for |
| --- | --- |
| `hero/stadium-night.webp` | Hero cinematic base (night stadium, low pitch angle) |
| `atmosphere/stadium-wide.webp` | CTA band backdrop (treated dark) |
| `atmosphere/stadium-stands.webp` | Spare section backdrop |
| `worldcup/globe-flags.webp` | Leaderboard backdrop ("the world is predicting") |
| `worldcup/og.webp` | Open Graph / social card (1200×630) |

Folder convention: `hero/` · `atmosphere/` · `worldcup/` (add `overlays/`,
`broadcast/`, `textures/` as needed). Paths live in `src/lib/atmosphere.ts`.

### Sourcing note (for new images)
The build environment can't browse stock or generate photography, so **new** images
are a founder drop-in (own/AI-generated/licensed). One step: add the file, point the
manifest at it. Don't ship amateur/wrong-sport stock treated to hide it.

## The system (already built)

- **`apps/web/src/lib/atmosphere.ts`** → set `heroImage` to your asset path.
- **`StadiumScene`** (`components/atmosphere/`) renders it **photo-first** and treats
  it automatically: object-cover · opacity · **dark grade** (sits into the night) ·
  **soft-light brand tint** (LED→gold) · **fade mask** · **vignette** · **grain**.
- **`CinematicImageLayer`** is reusable for any section (blend / mask / opacity).
- While `heroImage` is null, the hero shows a clean **dark editorial** mood (no faux
  stadium) — premium and intentional, ready for the photo.

## Add a real image (one step)

1. Put a file in `apps/web/public/atmosphere/` (e.g. `hero-stadium.webp`).
2. In `lib/atmosphere.ts`: `heroImage: '/atmosphere/hero-stadium.webp'`.
3. Done — it's graded + integrated. Tune opacity/grade in `StadiumScene` if desired.

**Or paste me a direct image URL** (one you've licensed or generated) and I'll
`curl` it in, optimize it (dark webp, sized) and wire it immediately.

## Image spec (what works)

- **Subject:** night stadium / floodlights / illuminated pitch / dark stands /
  shallow-depth match atmosphere. Wide/landscape.
- **Mood:** **dark**, moody, cinematic. Negative/empty space on the left (the hero
  copy sits there). Avoid bright, busy, logo-heavy, or recognizable-stock shots.
- **Tech:** ≥ 2000px wide, `.webp` (or `.jpg`), ideally < 300 KB after export.
  The treatment darkens it further, so start a touch brighter than the final look.

## Best ways to get a premium, owned image

### A) AI generation (recommended — bespoke, owned, on-brand)
Generate in Midjourney / Flux / DALL·E / Adobe Firefly, then drop it in. Prompts:

> *Cinematic wide shot of a football stadium at night, floodlights blazing, deep
> shadows, dark moody color grade, teal-and-amber lighting, shallow depth of field,
> volumetric haze, empty left negative space, editorial sports photography, 35mm,
> ultra-detailed, no text, no logos — World Cup night atmosphere.*

> *Close, low-angle of a floodlit football pitch at night, dewy grass catching
> stadium light, blurred bright stands behind, cinematic dark grade, anamorphic,
> moody, premium sports campaign aesthetic, no text.*

> *Out-of-focus stadium floodlights at night as soft bokeh over a dark sky,
> cinematic, deep blue with warm highlights, minimal, premium — abstract background.*

Reference the look: Apple Sports · FIFA World Cup intros · Nike Football · DAZN ·
UEFA broadcast packages.

### B) Licensed stock
- Free for commercial use: **Pexels**, **Unsplash** (search "stadium night",
  "floodlights football", "football pitch night"). Pick dark/moody, not the obvious
  hero-stock shot.
- Premium: **Getty / Shutterstock** for genuine match-night photography.
- Record source + license in `docs/ATTRIBUTIONS.md` when required.

## Rules
Keep it **dark, treated, subtle, premium** — integrated, not pasted. Performance:
optimized webp, `next/image`, mobile-first, GPU-friendly, reduced-motion safe.
Everything stays portable / tool-agnostic (see [AGENTS.md](../AGENTS.md)).
