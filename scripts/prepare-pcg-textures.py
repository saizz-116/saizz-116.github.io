"""Export lightweight PCG backgrounds from the owner's untouched source textures."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'material/pcg'
OUTPUT = ROOT / 'public/media/pcg-project'
TEXTURES = {
    'Mosaic_basecolor_1.png': 'mosaic-texture.webp',
    'roundtile_basecolor.png': 'roof-texture.webp',
    'Wall_basecolor.png': 'wall-texture.webp',
}

OUTPUT.mkdir(parents=True, exist_ok=True)
total = 0
for source_name, output_name in TEXTURES.items():
    with Image.open(SOURCE / source_name) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        image.thumbnail((768, 768), Image.Resampling.LANCZOS)
        destination = OUTPUT / output_name
        image.save(destination, 'WEBP', quality=82, method=6)
    size = destination.stat().st_size
    total += size
    print(f'{output_name}: {image.width} x {image.height}, {size:,} bytes')
print(f'Total PCG background: {total:,} bytes')
