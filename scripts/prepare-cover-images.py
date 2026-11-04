"""Create smaller web delivery copies; leave all supplied source artwork intact.

Run manually with Python + Pillow when a homepage cover changes.
The generated manifest is consumed by both the desktop canvas and mobile cards.
"""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public/media/optimized'
SOURCES = {
    'emotionalVacuum': ('emotional-vacuum/cover.webp', 88),
    'proceduralHouse': ('pcg-project/cover.png', 88),
    'mixedTop': ('mixed-lives/cover-top.webp', 90),
    'mixedBottom': ('mixed-lives/cover-bottom-fallback.webp', 90),
    'campusExplorer': ('dku-campus-tour/overview.webp', 88),
    'mixedTitle': ('mixed-lives/title-handwritten.png', 100),
}

OUTPUT.mkdir(parents=True, exist_ok=True)
manifest = {}
source_total = 0
default_total = 0
for key, (source_name, quality) in SOURCES.items():
    source = ROOT / 'public/media' / source_name
    source_total += source.stat().st_size
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original)
        image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
        widths = (160, 320, 640) if key == 'mixedTitle' else (480, 800, 1200)
        variants = []
        for width in widths:
            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            buffer = BytesIO()
            resized.save(buffer, format='WEBP', quality=quality, method=6,
                         lossless=key == 'mixedTitle')
            encoded = buffer.getvalue()
            filename = f'{key}-{width}-{sha256(encoded).hexdigest()[:10]}.webp'
            (OUTPUT / filename).write_bytes(encoded)
            variants.append((width, f'/media/optimized/{filename}', len(encoded)))
        default = variants[1]
        manifest[key] = {
            'src': default[1],
            'srcSet': ', '.join(f'{url} {width}w' for width, url, _ in variants),
            'width': image.width,
            'height': image.height,
        }
        default_total += default[2]
        print(f'{key}: {source.stat().st_size:,} bytes -> '
              f'{default[2]:,} bytes (default {default[0]}px)')

(ROOT / 'src/data/cover-images.json').write_text(
    json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(f'Total homepage image bytes: {source_total:,} -> {default_total:,} '
      f'({100 * (1 - default_total / source_total):.1f}% smaller, '
      'before browser srcset selection)')
