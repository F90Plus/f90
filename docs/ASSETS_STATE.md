# F90+ — Assets State

> Inventory + treatment of all visual assets. Snapshot: 2026-06-03. How to add new
> imagery: [ART_DIRECTION_ASSETS.md](ART_DIRECTION_ASSETS.md).

## Folder organization (`apps/web/public/`)
```
public/
├── brand/        # logo + derived icons (app/favicon via app/icon.png, app/apple-icon.png)
│   ├── f90plus-logo.png         (160KB)  official gold-trophy render — PRIMARY logo
│   ├── f90plus-icon-512.png     (150KB)  PWA icon  (derived)
│   ├── f90plus-icon-192.png     (28KB)   PWA icon  (derived)
│   └── f90plus-maskable-512.png (98KB)   PWA maskable (derived)
├── hero/
│   └── stadium-night.webp       (357KB)  HERO cinematic base (night stadium, low angle)
├── atmosphere/
│   ├── stadium-wide.webp        (185KB)  CTA band backdrop
│   └── stadium-stands.webp      (135KB)  spare section backdrop (unused — available)
├── worldcup/
│   ├── globe-flags.webp         (164KB)  key art · leaderboard backdrop · globe FALLBACK
│   └── og.webp                  (109KB)  Open Graph / social card (1200×630)
└── globe/        # 3D hero globe — vendored (NO runtime CDN); public-domain sources
    ├── earth-night.jpg          (698KB)  Earth Night texture (NASA Black Marble, PD)
    ├── earth-topology.png       (369KB)  bump / topology (NASA, PD)
    └── countries-110m.geojson   (477KB)  country polygons (Natural Earth 110m, PD)
```
(Favicon/app-icon are served via Next file conventions `app/icon.png` + `app/apple-icon.png`.)
Future folders per convention: `overlays/`, `broadcast/`, `textures/` (add as needed).

## Integrated images + treatment
| Asset | Where | Cinematic treatment |
| --- | --- | --- |
| `hero/stadium-night.webp` | **Hero** base (`StadiumScene`, `heroImage`) | object-cover @ 0.8 · left scrim (copy legibility) · bottom scrim · soft-light brand grade (LED→gold) · vignette · grain |
| `atmosphere/stadium-wide.webp` | **CTA band** | object-cover @ 0.30 + `night-950/70` overlay (very dark, legible) |
| `worldcup/globe-flags.webp` | **Leaderboard** | object-right @ 0.25 · left-fade mask · `night-950/55` overlay (faint, thematic) |
| `worldcup/og.webp` | OG/Twitter card | static 1200×630 crop of the globe key art |
| `brand/f90plus-logo.png` | header · hero · footer · 404 | `next/image`; `.logo-glow` gold/lime halo on dark |

## The treatment system (how integration works)
- **`components/atmosphere/CinematicImageLayer`** — `next/image` (fill, responsive,
  optimized) + blend mode (`screen`/`overlay`/`soft-light`/normal) + mask + opacity.
  The reusable primitive for any image layer.
- **`components/atmosphere/StadiumScene`** — photo-first hero composition (image +
  scrims + grade + vignette; clean dark editorial if no image).
- **`lib/atmosphere.ts`** — the asset manifest (single source of paths). Swap/add an
  image = drop the file + edit one line here.
- **`components/atmosphere/AmbientBackdrop`** — subtle global wash (faint broadcast
  grid + breathing glows), behind everything.

## Treatment principles (overlays / grading / masks)
- **Dark always:** images darkened so content is legible and the mood is night.
- **Scrims:** linear gradients (`from-night-950`) on the side where copy sits.
- **Grade:** `mix-blend-soft-light` LED→gold for a cinematic brand tint.
- **Masks:** `[mask-image:linear-gradient(...)]` to fade edges (no hard rectangles).
- **Vignette + grain:** universal cinematic finish.
- Never a raw, full-brightness, untreated photo.

## Pending / wanted assets
- A premium **hero** photo upgrade if desired (current is good; founder-owned).
- ✅ **Globe** assets vendored locally (`public/globe/`: Earth Night + topology +
  countries geojson — public domain, no runtime CDN). `globe-flags.webp` is wired as the
  **no-WebGL / error fallback**. (Optional later: shrink `countries-110m.geojson` by
  stripping unused properties.)
- Optional: `overlays/` (broadcast lower-thirds), `textures/` (grain variants).
- A **logo variant** ("PREDICT. PLAY. WIN.") exists but isn't adopted (decision pending).

## Generation / optimization (reproducible, portable)
- `scripts/assets/optimize-images.py` — Pillow: source → web-sized WebP into the
  folders above.
- `scripts/brand/generate-icons.py` — Pillow: favicon/app-icon/maskable derived from
  the logo render.
- Standard Python/Pillow; outputs are committed, so the app never needs the scripts
  at runtime.
