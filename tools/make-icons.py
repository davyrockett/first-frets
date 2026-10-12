"""Draws the app icons into ../icons. Run: python3 tools/make-icons.py (needs Pillow).
A glowing orange "1" beside a cream nut, with the six strings running off to the right in the
method's string colors (thinnest e on top, thickest E at the bottom, headstock side on the left)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(__file__).resolve().parent.parent / "icons"
FONT = "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"
BG = (21, 19, 16)          # dark page background
PAPER = (240, 235, 227)    # cream
ACCENT = (238, 154, 69)    # the app's orange
STRINGS = [(232, 190, 44), (238, 150, 56), (224, 103, 163), (77, 179, 106), (91, 155, 234), (226, 87, 75)]  # e B G D A E
S = 1024


def mask(draw_fn):
    m = Image.new("L", (S, S), 0)
    draw_fn(ImageDraw.Draw(m))
    return m


def layer(color, m):
    """A solid-colour layer shaped by a mask, so its blurred glow stays that colour."""
    out = Image.new("RGBA", (S, S), color + (0,))
    out.putalpha(m)
    return out


def glow(canvas, shape, strength, radius):
    halo = shape.copy()
    halo.putalpha(shape.split()[3].filter(ImageFilter.GaussianBlur(radius)).point(lambda v: int(min(255, v * strength))))
    canvas.alpha_composite(halo)
    canvas.alpha_composite(shape)


def one(cx, cy, size):
    font = ImageFont.truetype(FONT, size)

    def fn(d):
        bb = d.textbbox((0, 0), "1", font=font)
        w, h = bb[2] - bb[0], bb[3] - bb[1]
        d.text((cx - w / 2 - bb[0], cy - h / 2 - bb[1]), "1", font=font, fill=255)
    return mask(fn)


def draw():
    img = Image.new("RGBA", (S, S), BG + (255,))
    nut_x, top, bot = 600, 150, 874
    y0, y1 = top + 70, bot - 70
    for i, color in enumerate(STRINGS):
        y, w = y0 + i * (y1 - y0) / 5, 12 + i * 4.5
        glow(img, layer(color, mask(lambda d: d.rounded_rectangle([nut_x, y - w / 2, S + 20, y + w / 2], w / 2, fill=255))), 0.7, 14)
    glow(img, layer(PAPER, mask(lambda d: d.rounded_rectangle([nut_x - 66, top, nut_x, bot], 18, fill=255))), 0.6, 22)
    glow(img, layer(ACCENT, one(330, 520, 880)), 0.875, 35)  # a little softer than Page Fright
    return img.convert("RGB")


def maskable():
    """Android crops icons to a circle, so this copy has the drawing shrunk to fit inside it."""
    art = draw().resize((740, 740), Image.LANCZOS)
    img = Image.new("RGB", (S, S), BG)
    img.paste(art, (142, 142))
    return img


OUT.mkdir(exist_ok=True)
art = draw()
for name, size in [("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)]:
    art.resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)
    print("wrote", OUT / name)
maskable().resize((512, 512), Image.LANCZOS).save(OUT / "icon-maskable-512.png", optimize=True)
print("wrote", OUT / "icon-maskable-512.png")
