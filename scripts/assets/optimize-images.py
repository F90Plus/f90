"""
F90+ — optimize the founder's cinematic source images into web-ready, organized
WebP assets. Sources are the founder's own generated images (in Downloads); outputs
are committed to the repo, so the app never depends on Downloads at runtime.

Re-run if sources change:  python scripts/assets/optimize-images.py
"""
from pathlib import Path
from PIL import Image

DL = Path.home() / "Downloads"
PUB = Path(__file__).resolve().parents[2] / "apps" / "web" / "public"

# (source filename, output path under public/, max width)
JOBS = [
    ("ChatGPT Image 3 jun 2026, 17_45_50 (1).png", "hero/stadium-night.webp", 2400),
    ("ChatGPT Image 3 jun 2026, 17_45_51 (2).png", "atmosphere/stadium-wide.webp", 2000),
    ("ChatGPT Image 3 jun 2026, 17_45_40.png", "atmosphere/stadium-stands.webp", 2000),
    ("ChatGPT Image 3 jun 2026, 17_48_36.png", "worldcup/globe-flags.webp", 2000),
]


def fit_width(im, w):
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if im.width > w else im


def main():
    for src, out, w in JOBS:
        p = DL / src
        if not p.exists():
            print("MISSING:", src)
            continue
        im = fit_width(Image.open(p).convert("RGB"), w)
        dst = PUB / out
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "WEBP", quality=82, method=6)
        print(f"{out}  {im.size}  {dst.stat().st_size // 1024} KB")

    # Open Graph / social card (1200x630) cropped from the globe key art
    g = Image.open(DL / "ChatGPT Image 3 jun 2026, 17_48_36.png").convert("RGB")
    g = g.resize((1200, round(g.height * 1200 / g.width)), Image.LANCZOS)
    top = max(0, (g.height - 630) // 2)
    g = g.crop((0, top, 1200, top + 630))
    (PUB / "worldcup").mkdir(parents=True, exist_ok=True)
    g.save(PUB / "worldcup" / "og.webp", "WEBP", quality=84, method=6)
    print("worldcup/og.webp  (1200, 630)", (PUB / "worldcup" / "og.webp").stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
