"""Export web delivery copies of the owner's first Mixed Lives cover."""
import hashlib
import io
import json
from pathlib import Path

from PIL import Image, ImageCms

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'material/mixedlives封面图1.png'
OUTPUT = ROOT / 'public/media/mixed-lives'
QA = ROOT / '.qa/mixed-lives'
OUTPUT.mkdir(parents=True, exist_ok=True)
QA.mkdir(parents=True, exist_ok=True)

with Image.open(SOURCE) as original:
    assert original.size == (3840, 2160)
    alpha = original.convert('RGBA').getchannel('A')
    image = original.convert('RGB')
    profile = original.info.get('icc_profile')
    if profile:
        image = ImageCms.profileToProfile(
            image, ImageCms.ImageCmsProfile(io.BytesIO(profile)),
            ImageCms.createProfile('sRGB'), outputMode='RGB',
        )
    image = image.convert('RGBA')
    image.putalpha(alpha)
srgb = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
exports = []
for width, name in [(800, 'cover-one-800.webp'), (1920, 'cover-one.webp')]:
    exported = image.resize((width, width * 9 // 16), Image.Resampling.LANCZOS)
    exported.info.clear()
    path = OUTPUT / name
    exported.save(path, quality=90, method=6, icc_profile=srgb)
    exports.append({'file': str(path.relative_to(ROOT)), 'size': list(exported.size),
                    'bytes': path.stat().st_size})
(QA / 'cover-export.json').write_text(json.dumps({
    'source': str(SOURCE.relative_to(ROOT)),
    'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    'processing': 'Full original canvas; no crop or repaint; Display P3 converted to sRGB; resized for web.',
    'exports': exports,
}, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(exports))
