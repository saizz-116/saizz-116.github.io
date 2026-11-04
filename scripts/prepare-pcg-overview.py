"""Prepare the supplied PCG render and Houdini screenshot without changing originals."""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public/media/pcg-project'
OUTPUT.mkdir(parents=True, exist_ok=True)
manifest = {}
for key, name, widths, quality in (
    ('render', 'house-render.png', (480, 800, 1200, 1600), 86),
    ('process', 'house-process.png', (800, 1400, 2200), 88),
):
    with Image.open(ROOT / 'material/pcg' / name) as original:
        source = ImageOps.exif_transpose(original).convert('RGB')
        variants = []
        for width in widths:
            resized = source.resize((width, round(width * source.height / source.width)), Image.Resampling.LANCZOS)
            buffer = BytesIO()
            resized.save(buffer, 'WEBP', quality=quality, method=6)
            data = buffer.getvalue()
            filename = f'house-{key}-{width}-{sha256(data).hexdigest()[:10]}.webp'
            (OUTPUT / filename).write_bytes(data)
            variants.append(f'/media/pcg-project/{filename} {width}w')
            print(f'{filename}: {len(data):,} bytes')
        manifest[key] = {
            'src': variants[1].split(' ')[0], 'srcSet': ', '.join(variants),
            'width': source.width, 'height': source.height,
        }
(ROOT / 'src/data/pcg-images.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
