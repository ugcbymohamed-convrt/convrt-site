#!/usr/bin/env python3
"""Candidate-frame contact sheets for choosing a video's poster (docs/video-library.md).

    python3 scripts/video-contact-sheet.py <stream-uid> [<stream-uid> ...] --out DIR [--frames 9] [--current SECONDS]

For each Cloudflare Stream video it asks Stream's public thumbnail endpoint for evenly spaced REAL frames (nothing is downloaded, uploaded, re-encoded or changed) and writes one PNG sheet per video:
the current poster (red border) first, then the candidates, each labelled with its second. A sharpness score (edge variance) is printed so blurry frames are easy to rule out; the choice itself is made by looking.
Needs Pillow. The duration comes from the Stream API when ~/.cf-stream-token exists (read only), otherwise pass --duration."""
import argparse, io, json, os, sys, urllib.request, concurrent.futures as cf
from PIL import Image, ImageDraw, ImageFilter, ImageStat

ap = argparse.ArgumentParser()
ap.add_argument('uids', nargs='+'); ap.add_argument('--out', required=True); ap.add_argument('--frames', type=int, default=9)
ap.add_argument('--current', type=float, default=None); ap.add_argument('--duration', type=float, default=None); ap.add_argument('--height', type=int, default=480)
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
ACCOUNT = '72a33aa33ffc2b2f4ed91606c38b3eab'
def duration(uid):
    if a.duration: return a.duration
    tok = open(os.path.expanduser('~/.cf-stream-token')).read().strip()
    r = json.load(urllib.request.urlopen(urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/stream/{uid}', headers={'Authorization': 'Bearer ' + tok}), timeout=30))
    return float(r['result']['duration'])
def frame(uid, t):
    url = f'https://videodelivery.net/{uid}/thumbnails/thumbnail.jpg?time={t:g}s&height={a.height}'
    return Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read())).convert('RGB')
def sharp(im): return ImageStat.Stat(im.convert('L').filter(ImageFilter.FIND_EDGES)).var[0]
for uid in a.uids:
    d = duration(uid)
    times = [round(d * (0.05 + 0.9 * i / (a.frames - 1)), 1) for i in range(a.frames)]
    todo = ([a.current] if a.current is not None else []) + times
    with cf.ThreadPoolExecutor(8) as ex: ims = list(ex.map(lambda t: frame(uid, t), todo))
    w, h = ims[0].size; tw = 240; th = int(h * tw / w); cols = 5; rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * tw, rows * th), 'black'); dr = ImageDraw.Draw(sheet)
    for i, (t, im) in enumerate(zip(todo, ims)):
        x, y = (i % cols) * tw, (i // cols) * th
        sheet.paste(im.resize((tw, th)), (x, y))
        cur = a.current is not None and i == 0
        dr.rectangle([x, y, x + 78, y + 14], fill=(200, 0, 0) if cur else (0, 0, 0)); dr.text((x + 2, y + 1), f"{'CUR ' if cur else ''}{t:g}s s{sharp(im):.0f}", fill='white')
        if cur: dr.rectangle([x, y, x + tw - 1, y + th - 1], outline=(255, 0, 0), width=3)
    p = os.path.join(a.out, f'{uid[:8]}.png'); sheet.save(p); print(p, f'duration {d:.1f}s', 'candidates', times)
