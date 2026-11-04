"""Bake the existing native SVG silhouettes into small transparent WebP files.

All subject pixels come from the supplied screenshots. No image synthesis is used.
Vite embeds these critical assets so a rendered PCG page needs no image requests.
"""
import json
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'src/assets/pcg'
OUTPUT.mkdir(parents=True, exist_ok=True)
outlines = json.loads((ROOT / 'src/data/pcg-cutout-outlines.json').read_text(encoding='utf-8'))

def path_points(path):
    tokens = re.findall(r'[MCLZ]|-?\d+(?:\.\d+)?', path)
    points = []
    index = 0
    current = (0, 0)
    while index < len(tokens):
        command = tokens[index]
        index += 1
        if command == 'Z':
            break
        if command in ('M', 'L'):
            current = (float(tokens[index]), float(tokens[index + 1]))
            points.append(current)
            index += 2
        elif command == 'C':
            x1, y1, x2, y2, x3, y3 = map(float, tokens[index:index + 6])
            x0, y0 = current
            for step in range(1, 33):
                t = step / 32
                u = 1 - t
                points.append((u**3*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t**3*x3,
                               u**3*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t**3*y3))
            current = (x3, y3)
            index += 6
        else:
            raise ValueError(f'Unsupported silhouette command: {command}')
    return points

total = 0
for key, shape in outlines.items():
    source = ImageOps.exif_transpose(Image.open(ROOT / 'material/pcg' / shape['source'])).convert('RGBA')
    ratio = source.width / shape['width']
    supersample = 2
    scale = ratio * supersample
    mask = Image.new('L', (source.width * supersample, source.height * supersample))
    draw = ImageDraw.Draw(mask)
    draw.polygon([(x * scale, y * scale) for x, y in path_points(shape['path'])], fill=255)
    for cx, cy, r in shape['balls']:
        draw.ellipse(((cx-r)*scale, (cy-r)*scale, (cx+r)*scale, (cy+r)*scale), fill=255)
    for cx, cy, rx, ry in shape['plants']:
        draw.ellipse(((cx-rx)*scale, (cy-ry)*scale, (cx+rx)*scale, (cy+ry)*scale), fill=255)
    source.putalpha(mask.resize(source.size, Image.Resampling.LANCZOS))
    x, y, width, height = shape['viewBox']
    cutout = source.crop(tuple(round(value * ratio) for value in (x, y, x + width, y + height)))
    cutout.thumbnail((640, 800), Image.Resampling.LANCZOS)
    destination = OUTPUT / f'house-{key}-cutout.webp'
    cutout.save(destination, 'WEBP', quality=83, method=6, exact=True)
    preview = cutout.copy()
    preview.thumbnail((120, 150), Image.Resampling.LANCZOS)
    preview.save(OUTPUT / f'house-{key}-preview.webp', 'WEBP', quality=65, method=6)
    total += destination.stat().st_size
    print(f'{destination.name}: {cutout.size}, {destination.stat().st_size:,} bytes')

for source_name, filename, size in (
    ('Mosaic_basecolor_1.png', 'mosaic-tile.webp', 512),
    ('roundtile_basecolor.png', 'blue-tile.webp', 320),
    ('Wall_basecolor.png', 'wall-tile.webp', 320),
):
    with Image.open(ROOT / 'material/pcg' / source_name) as original:
        texture = ImageOps.exif_transpose(original).convert('RGB')
        texture.thumbnail((size, size), Image.Resampling.LANCZOS)
        destination = OUTPUT / filename
        texture.save(destination, 'WEBP', quality=80, method=6)
        preview = texture.resize((64, 64), Image.Resampling.LANCZOS)
        preview.save(OUTPUT / filename.replace('-tile', '-preview'), 'WEBP', quality=65, method=6)
        total += destination.stat().st_size
        print(f'{filename}: {destination.stat().st_size:,} bytes')
print(f'Critical image bytes: {total:,}')
