"""
F90+ — derive all icon/OG assets FROM the official render.

Source of truth: apps/web/public/brand/f90plus-logo.png (the original render,
background removed). Every output below is a faithful downscale/recomposition of
that render — never a reinterpretation. Re-run this whenever the logo changes:

    python scripts/brand/generate-icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

WEB = Path(__file__).resolve().parents[2] / "apps" / "web"
BRAND = WEB / "public" / "brand"
APP = WEB / "src" / "app"
SRC = BRAND / "f90plus-logo.png"

NIGHT = (10, 16, 32)          # #0A1020 badge background
GOLD = (244, 190, 84)         # #F4BE54
LIME = (174, 242, 58)         # #AEF23A
LED = (61, 116, 255)          # #3D74FF


def trim_alpha(im: Image.Image) -> Image.Image:
    bbox = im.getchannel("A").getbbox()
    return im.crop(bbox) if bbox else im


def to_square(im: Image.Image, pad_ratio: float = 0.04) -> Image.Image:
    w, h = im.size
    side = max(w, h)
    pad = int(side * pad_ratio)
    n = side + 2 * pad
    canvas = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((n - w) // 2, (n - h) // 2))
    return canvas


def badge(logo_sq: Image.Image, size: int, scale: float, rounded: bool) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg = Image.new("RGBA", (size, size), NIGHT + (255,))
    if rounded:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=255
        )
        canvas.paste(bg, (0, 0), mask)
    else:
        canvas.alpha_composite(bg)
    inner = int(size * scale)
    lg = logo_sq.resize((inner, inner), Image.LANCZOS)
    off = (size - inner) // 2
    canvas.alpha_composite(lg, (off, off))
    return canvas


def vgrad(w: int, h: int, top, bottom) -> Image.Image:
    col = Image.new("RGB", (1, h))
    for y in range(h):
        f = y / (h - 1)
        col.putpixel((0, y), tuple(int(top[i] + (bottom[i] - top[i]) * f) for i in range(3)))
    return col.resize((w, h))


def radial_glow(size, center, radius, color, alpha, blur):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color + (alpha,))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def main():
    im = Image.open(SRC).convert("RGBA")
    print("orig:", im.size)
    logo = trim_alpha(im)
    print("trimmed:", logo.size, "aspect:", round(logo.size[0] / logo.size[1], 3))
    logo.save(SRC)  # store the tightly-trimmed primary
    sq = to_square(logo)

    # Favicon (rounded dark badge) + iOS (square full-bleed; iOS masks corners)
    badge(sq, 256, scale=0.80, rounded=True).save(APP / "icon.png")
    badge(sq, 180, scale=0.82, rounded=False).save(APP / "apple-icon.png")
    # PWA manifest icons
    badge(sq, 512, scale=0.80, rounded=True).save(BRAND / "f90plus-icon-512.png")
    badge(sq, 192, scale=0.80, rounded=True).save(BRAND / "f90plus-icon-192.png")
    # Maskable (Android adaptive — logo inside ~62% safe zone, full bleed)
    badge(sq, 512, scale=0.62, rounded=False).save(BRAND / "f90plus-maskable-512.png")

    # Open Graph / social card (1200x630) — language-neutral, premium stadium glow
    W, H = 1200, 630
    og = vgrad(W, H, (8, 13, 26), (5, 8, 15)).convert("RGBA")
    og.alpha_composite(radial_glow((W, H), (W // 2, int(H * 0.32)), 360, GOLD, 70, 150))
    og.alpha_composite(radial_glow((W, H), (int(W * 0.30), int(H * 0.62)), 300, LED, 55, 160))
    og.alpha_composite(radial_glow((W, H), (int(W * 0.74), int(H * 0.30)), 220, LIME, 38, 150))
    target_h = 460
    ratio = target_h / logo.size[1]
    lg = logo.resize((int(logo.size[0] * ratio), target_h), Image.LANCZOS)
    og.alpha_composite(lg, ((W - lg.size[0]) // 2, (H - lg.size[1]) // 2))
    og.convert("RGB").save(BRAND / "og.png", quality=92)

    print("done -> icon.png, apple-icon.png, icon-512/192, maskable-512, og.png")


if __name__ == "__main__":
    main()
