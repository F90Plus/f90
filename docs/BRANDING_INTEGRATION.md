# F90+ — Branding Integration Plan

> ✅ **Executed.** The original render is now the primary logo across header, hero,
> loading, 404, OG and PWA, with derived favicon/app-icons generated from it
> (`scripts/brand/generate-icons.py`). See [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md)
> for usage rules and [DECISIONS.md](DECISIONS.md) (D-012) for the rationale. This
> document is kept as the original integration design/record.

## The logo

The definitive mark: a **gold FIFA-style World Cup trophy** rising from a circular
emblem, with the **"F90+" wordmark** in brushed chrome/silver and the **"+" in lime
green**. Premium, three-dimensional, celebratory — a perfect match for the
night-stadium / broadcast identity already in place (dark surfaces, LED glow, gold
warmth). It lives best **on dark**, which is exactly F90+'s canvas.

### One design reality to plan around
The full trophy lockup is **detailed and 3D**. It looks spectacular at large sizes
(hero, header, splash) but **won't read at ≤32px** (favicon, tiny avatars). So the
system needs **two tiers**:
- a **full lockup** (trophy + wordmark) for large/branding surfaces, and
- a **simplified square "mark"** (e.g. the "F90+" monogram or a flattened
  trophy silhouette) for tiny/scalable surfaces.

Providing both is the single most important thing for a consistent result.

---

## Assets to export (what you provide)

Drop these into **`apps/web/public/brand/`** (create the folder). Vector (SVG) is
strongly preferred where possible; PNG with **transparent background** otherwise.

| File | What | Format / size | Used for |
| --- | --- | --- | --- |
| `f90plus-logo-full.(svg\|png)` | Full lockup (trophy + wordmark) | SVG, or PNG ≥1600px wide, transparent | Hero, splash, OG, large branding |
| `f90plus-wordmark.(svg\|png)` | "F90+" only, horizontal, transparent | SVG, or PNG ≥600px wide | **Header**, footer |
| `f90plus-mark.(svg\|png)` | Simplified **square** mark (monogram/trophy) | SVG + PNG **512×512**, transparent | Favicon, app icon, social avatar, loading |
| `f90plus-mark-mono.svg` | Single-color (white) version of the mark | SVG | Tiny sizes, monochrome contexts, watermarks |
| `f90plus-logo-full-light.(svg\|png)` *(optional)* | Variant that reads on **light** backgrounds | SVG/PNG | Rare light surfaces, emails later |

If you can only export the full lockup right now, we can **ship the header + OG +
splash immediately** and add the favicon/app-icon once the simplified square mark
exists. (A detailed trophy crammed into 32px just turns to mush — worth doing right.)

### Source-of-truth note
Keep the original master (AI/Figma/PSD or max-res PNG) in `docs/brand/` or outside
the app so we can re-export sizes later. Only the web-optimized exports go in
`public/brand/`.

---

## Surfaces & how each consumes the logo

A single **brand manifest** (`src/lib/brand.ts`) will export the canonical asset
paths + alt text so *every* surface references one source — change it once, it
updates everywhere. Then:

| Surface | Plan |
| --- | --- |
| **Header** | Replace the current text `Logo` with `f90plus-wordmark` via `next/image` (priority, fixed height ~28–32px), wrapped in the home `Link`, `alt="F90+"`. Keep the text wordmark as accessible fallback / aria-label. |
| **Favicon** | Replace `src/app/icon.svg` with the **mark** (`app/icon.svg` + a 512 PNG). Next auto-wires `<link rel=icon>`. |
| **App icon (PWA/iOS)** | Add `src/app/apple-icon.png` (180×180) + a `src/app/manifest.ts` with 192/512 + a **maskable** 512 icon, themed `background_color: #05080F`, `theme_color: #3D74FF`. |
| **Open Graph** | Add `src/app/[locale]/opengraph-image.tsx` (or a static `opengraph-image.png` 1200×630): logo on the night-stadium gradient + tagline, localized. Sets the rich link preview the foundation deferred. |
| **Twitter/social cards** | `twitter.card = 'summary_large_image'` + the same OG image, in `generateMetadata`. |
| **Loading states** | A branded `app/[locale]/loading.tsx` (and route-level `loading.tsx`): the **mark** centered on night bg with a soft LED **pulse/shimmer** (reuse `animate-shimmer`/`animate-live-pulse`). Replaces blank loads with on-brand moments. |
| **Branding surfaces** | Empty states, future auth screens, 404 (swap the text "F90+" in `not-found.tsx` for the mark), and (later) transactional emails — all pull from `src/lib/brand.ts`. |

### Consistency guarantees we'll bake in
- **One manifest** (`lib/brand.ts`) → no stray hardcoded paths.
- **Logo component** handles sizing/variants (full vs wordmark vs mark) via a `variant` prop, so usage is uniform.
- **Optimized delivery**: `next/image` for raster (auto-resize, lazy except header), inline SVG where it helps.
- **Accessibility**: meaningful `alt`/`aria-label` everywhere; the mark is decorative where text already says "F90+".
- **Theme alignment**: icon/manifest colors use the existing design tokens (`night-950`, `led-500`).

---

## What I'll execute once the assets land (one pass, ~quick)
1. Create `public/brand/` consumption + `src/lib/brand.ts` manifest.
2. Swap `Logo` → image-based wordmark (with text fallback).
3. Replace favicon (`app/icon`), add `apple-icon`, add `manifest.ts`.
4. Add localized OG image route + twitter card meta.
5. Add branded `loading.tsx` (mark + LED pulse).
6. Point 404 / future empty states at the mark.
7. Verify: dev server + screenshots (header, favicon, OG, mobile, loading), zero console errors.

## Acceptance check
- Logo crisp on retina at every size; favicon legible at 16–32px (→ needs the
  simplified mark); OG preview renders in a link-preview test; loading state feels
  on-brand; ES + EN both correct; Lighthouse PWA icons valid.

---

### Quick start for you
1. Export the assets above into `apps/web/public/brand/`.
2. Tell me they're there (and the exact filenames if they differ).
3. I wire all surfaces in one pass and show you screenshots.

> Minimum to unblock the most impactful surfaces (header + OG + splash):
> **`f90plus-wordmark`** and **`f90plus-logo-full`**. The **`f90plus-mark`**
> (square, simplified) unlocks favicon + app icon + loading + avatar.
