"""Draws the app icons into ../icons. Run: python3 tools/make-icons.py (needs Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "icons"
BG = (21, 19, 16)          # dark page background
BOARD = (59, 43, 34)       # rosewood fingerboard
WIRE = (200, 194, 184)
NUT = (239, 230, 210)
# Same string colors as the method book, thinnest (e) on top
STRINGS = [(232, 190, 44), (238, 150, 56), (224, 103, 163), (77, 179, 106), (91, 155, 234), (226, 87, 75)]


def draw(size: int) -> Image.Image:
    s = 1024  # draw large, then shrink for smooth edges
    img = Image.new("RGB", (s, s), BG)
    d = ImageDraw.Draw(img)
    # A short stretch of fingerboard, kept inside the safe zone iOS/Android won't crop
    top, bot, left, right = 300, 724, 150, 874
    d.rectangle([left, top, right, bot], fill=BOARD)
    d.rectangle([left - 26, top - 8, left, bot + 8], fill=NUT)
    for x in (390, 610, 800):
        d.rectangle([x - 7, top, x + 7, bot], fill=WIRE)
    d.ellipse([705 - 26, 512 - 26, 705 + 26, 512 + 26], fill=NUT)  # 3rd-fret dot
    for i, color in enumerate(STRINGS):
        y = top + 42 + i * 68
        w = 6 + i * 3
        d.rectangle([left - 26, y - w // 2, right, y + w // 2], fill=color)
    return img.resize((size, size), Image.LANCZOS)


OUT.mkdir(exist_ok=True)
for name, size in [("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180)]:
    draw(size).save(OUT / name, optimize=True)
    print("wrote", OUT / name)
