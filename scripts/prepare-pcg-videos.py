"""Export full, click-to-load PCG recordings; retain source footage unchanged."""
import argparse
import json
import shutil
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public/media/pcg-project'
RECORDINGS = [
    ('Houdini-3dsMax.mp4', 'modeling-demo', 48),
    ('UE-Substance Designer-Houdini.mp4', 'materials-engine-demo', 45),
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ffmpeg', default=shutil.which('ffmpeg') or
                        r'C:\Program Files\Side Effects Software\Houdini 21.0.631\bin\hffmpeg.exe')
    args = parser.parse_args()
    if not Path(args.ffmpeg).is_file():
        raise FileNotFoundError('Provide an FFmpeg executable with --ffmpeg.')
    OUTPUT.mkdir(parents=True, exist_ok=True)
    audit = ROOT / '.qa/pcg/videos'
    audit.mkdir(parents=True, exist_ok=True)
    exports = []
    for source_name, stem, poster_time in RECORDINGS:
        source = ROOT / 'material/pcg/videos' / source_name
        target = OUTPUT / f'{stem}.mp4'
        # Preserve the entire recording, its aspect ratio, frame rate and audio.
        command = [args.ffmpeg, '-hide_banner', '-loglevel', 'warning', '-stats',
                   '-i', str(source), '-map', '0:v:0', '-map', '0:a:0?',
                   '-vf', 'scale=1920:-2:flags=lanczos,setsar=1',
                   '-c:v', 'h264_nvenc', '-preset', 'p5', '-tune', 'hq',
                   '-rc', 'vbr', '-cq', '26', '-b:v', '2000k',
                   '-maxrate', '3500k', '-bufsize', '7000k', '-g', '60',
                   '-profile:v', 'high', '-pix_fmt', 'yuv420p',
                   '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart',
                   '-y', str(target)]
        subprocess.run(command, check=True)
        frame = audit / f'{stem}-poster.png'
        subprocess.run([args.ffmpeg, '-hide_banner', '-loglevel', 'error',
                        '-ss', str(poster_time), '-i', str(source), '-frames:v', '1',
                        '-vf', 'scale=1600:-2:flags=lanczos', '-y', str(frame)], check=True)
        with Image.open(frame) as image:
            image.convert('RGB').save(OUTPUT / f'{stem}-poster.webp', quality=80, method=6)
        exports.append({'source': source_name, 'export': target.name,
                        'source_bytes': source.stat().st_size,
                        'export_bytes': target.stat().st_size,
                        'poster_seconds': poster_time, 'encoding': command[3:-2]})
        print(json.dumps(exports[-1]), flush=True)
    (audit / 'export-manifest.json').write_text(json.dumps(exports, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
