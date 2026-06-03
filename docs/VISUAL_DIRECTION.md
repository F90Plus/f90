# F90+ — Visual Direction (Art Direction North Star)

> The definitive visual brief, including hard-won lessons. If you change the look,
> it must still pass this doc. Companions: [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md)
> (tokens) · [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md) (logo) ·
> [ASSETS_STATE.md](ASSETS_STATE.md) (imagery).

## The one line
**"This isn't a sports landing — it feels like THE World Cup."** Cinematic,
emotional, physical, premium, international, real football. A night at the stadium,
shot like a broadcast.

## Identity in five words
Dark · cinematic · broadcast · football · World-Cup-night.

## References (aim here)
Apple Sports · FIFA World Cup intros · UEFA Champions League broadcast packages ·
DAZN premium football · Nike Football campaigns · premium sports documentaries ·
night-stadium photography.

## What WORKS (keep doing)
- **Real cinematic football imagery**, treated and integrated (grade · mask · blur ·
  scrims · vignette) as the base of key surfaces. This is the soul. ✅
- The **official gold-trophy logo** (premium, World-Cup, glow).
- **Dark night-stadium palette** with **LED-blue** as the primary UI color and
  **lime** (the logo "+") + **gold** (trophy) as identity accents.
- **Legibility-first** treatment: dark scrims so copy stays crisp over photos.
- Restrained, broadcast-grade motion (one ease-out curve), `prefers-reduced-motion`.
- Real data made to feel real (real fixtures, real venues, host identity).

## What does NOT work (lessons learned — do not repeat)
- ❌ **Procedural CSS "fake stadium"** — crowd-dot textures, simulated grass,
  faux floodlight beams, generated bokeh. It reads artificial/"generated". Removed.
  *(See DECISIONS D-017 → superseded by D-018.)*
- ❌ Flat abstract gradients pretending to be atmosphere.
- ❌ Amateur / wrong-sport / obvious-stock photos (even treated). Tested — rejected.
- ❌ Pasted wallpapers (untreated full-bleed photos).
- ❌ Too empty / too clean / too "tech-SaaS".

## The correct direction: REAL CINEMATIC FOOTBALL IMAGERY
Use **real, dark, premium football photography** (founder-owned: AI-generated or
licensed), **integrated cinematically** — never pasted:
- **Color grade** toward the brand (cool LED top, warm gold center; `mix-blend-soft-light`).
- **Masks + scrims** for depth and **legibility** (copy lives on the darker side).
- **Opacity / vignette / grain** so the image sits *into* the night.
- **Composition + layering + depth**, editorial, not decorative.
- New images are a one-step drop-in (`lib/atmosphere.ts` + the file). See
  [ART_DIRECTION_ASSETS.md](ART_DIRECTION_ASSETS.md).

## Football soul layer (subtle, broadcast)
Tasteful **vector** broadcast accents (these are graphics, not fakes): eyebrow ticks
(lower-third cue), host identity line, "Mundial 2026" broadcast corner, tabular
scoreboard numerals, the live pulse. Keep them subtle and purposeful.

## Hard rules
**Subtle-first.** Every effect must earn its place — *"would a CL/Apple Sports/Nike
package do this?"* If not, cut it. **More identity, not more effects.**

| Anti-pattern | Rule |
| --- | --- |
| Overload / particle spam | ❌ never. Restraint > quantity. |
| Casino / neon / garish / slot-machine | ❌ never. |
| Gamer / esports / arcade / RGB | ❌ never. |
| Cyberpunk / tech-demo | ❌ never. |
| Generic sports template / SaaS landing | ❌ never. |
| Obvious stock / pasted wallpaper | ❌ never (treat + integrate or don't use). |
| Fake procedural atmosphere | ❌ never (real imagery instead). |

## Non-negotiables (carry forward)
Mobile-first · responsive · GPU-friendly · reduced-motion safe · high performance ·
dark/premium · legible · tool-agnostic/portable. The product is **English**; the
team collaborates in **Spanish**. Tokens over hardcoding; copy via i18n.
