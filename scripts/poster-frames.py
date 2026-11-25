#!/usr/bin/env python3
"""Re-export every same-origin video poster (public/portfolio/*.webp) from the frame chosen in src/content/posterFrames.js.

    python3 scripts/poster-frames.py            regenerate all
    python3 scripts/poster-frames.py --check    only report which posters are missing
    python3 scripts/poster-frames.py ar-       only the posters whose path contains the given text (any number of words)

For each Cloudflare Stream video it downloads the REAL frame at the chosen second (Stream's documented thumbnail endpoint:
https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/), crops it to the size of the existing poster and saves a small WebP.
Nothing is uploaded or changed on Cloudflare. Needs Pillow (pip install pillow). Videos not listed in posterFrames.js keep their current poster.
The Roadmap explainer poster is deliberately left as it is."""
import json, os, subprocess, sys, urllib.request
from io import BytesIO
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
inv = json.loads(subprocess.check_output(['node', os.path.join(ROOT, 'scripts/poster-inventory.mjs')], cwd=ROOT))
check = '--check' in sys.argv
only = [a for a in sys.argv[1:] if not a.startswith('--')]
done = skipped = 0
for v in inv:
    if v['frame'] is None or not v['posters']:
        continue
    for rel in v['posters']:
        if rel.startswith('/roadmap/'):
            continue
        if only and not any(o in rel for o in only):
            continue
        frame = v.get('overrides', {}).get(rel, v['frame'])
        dest = os.path.join(ROOT, 'public' + rel)
        if check:
            print(('ok      ' if os.path.exists(dest) else 'MISSING ') + rel); continue
        size = Image.open(dest).size if os.path.exists(dest) else (540, 960)
        url = f"https://videodelivery.net/{v['uid']}/thumbnails/thumbnail.jpg?time={frame}s&height={max(size[1], 960)}"
        data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read()
        im = Image.open(BytesIO(data)).convert('RGB')
        w, h = size
        scale = max(w / im.width, h / im.height)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        left, top = (im.width - w) // 2, (im.height - h) // 2
        im.crop((left, top, left + w, top + h)).save(dest, 'WEBP', quality=76, method=6)
        done += 1
print(f'{done} posters written')
