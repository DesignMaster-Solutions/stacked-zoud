#!/usr/bin/env python3
"""Cuts docs/video/s*.mp4 (recorded by docs/record-video.sh) into the 2-minute gameplay video of docs/VIDEO.md.
Real gameplay only: each segment is scaled to 1920x1080 with burned-in captions, then a closing card and an Apple Loops
track (Apple's loop licence allows commercial use) mixed by video_make.music. Output: docs/video/stacked-gameplay.mp4"""
import os, subprocess, sys, json
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'video')
FONT = '/System/Library/Fonts/Avenir Next.ttc'

def dur(f):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))

# (segment, trim start, hold extra seconds at the end, captions as (from, to, text); negative = seconds before the end)
SEGS = [
    ('s1-title', 0, 2.5, [(0, -0.01, 'Every "pay in 4" lands on a payday you have not lived yet.')]),
    ('s2-greedy', 1.5, 0, [(0, 13, 'Split whenever you can: only a quarter leaves today.'),
                           (13, 27, 'The other three quarters stack on your next paydays.'),
                           (27, -9, 'A column taller than your money misses: late fee, red report, no new splits.'),
                           (-9, -0.01, 'The bank reads the report: declined.')]),
    ('s3-planner', 1.5, 0, [(0, -8, 'Same season. Read the columns first: pay now when you can, split only what fits.'),
                            (-8, -0.01, 'Approved: no late fees and no needs skipped.')]),
    ('s4-facts', 4, 0, [(0, -0.01, 'Real UAE rules: all fees capped at 30% of the price.\nPay-later plans on credit reports since July 2026.')]),
    ('s5-arabic', 0, 0, [(0, -0.01, 'English and Arabic, right to left.')]),
    ('s6-a11y', 0, 0, [(0, -0.01, 'Large text, high contrast, calm mode with no timer.')]),
]
SPEED = float(os.environ.get('SPEED', '1.55'))  # >1 speeds the two long runs up if the total passes 2:00

def caption_png(text, size=46, color='white', bg='#0c1422e6', pad=26):
    png = os.path.join(V, f'.cap-{abs(hash((text, size, color)))}.png')
    subprocess.run(['magick', '-background', bg, '-fill', color, '-font', FONT, '-pointsize', str(size), 'label:' + text,
                    '-bordercolor', bg, '-border', f'{pad}x{pad // 2 + 6}', png], check=True)
    return png

def render(src_args, length_known, caps, dst, vf_pre):
    """Scale + hold, then overlay one PNG per caption between its times."""
    ins, chain = [], f'[0:v]{vf_pre}[b0]'
    for k, (a, b, text) in enumerate(caps):
        a = a if a >= 0 else length_known + a
        b = b if b >= 0 else length_known + b
        ins += ['-i', caption_png(text)]
        chain += f";[b{k}][{k + 1}:v]overlay=x=(W-w)/2:y=H-h-70:enable='between(t,{a:.2f},{b:.2f})'[b{k + 1}]"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *src_args, *ins, '-filter_complex', chain, '-map', f'[b{len(caps)}]', '-an',
                    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', dst], check=True)

parts = []
for name, trim, hold, caps in SEGS:
    src = os.path.join(V, name + '.mp4')
    sp = SPEED if name in ('s2-greedy', 's3-planner') else 1
    length = (dur(src) - trim) / sp + hold
    dst = os.path.join(V, f'.p-{name}.mp4')
    render(['-ss', str(trim), '-i', src], length, caps, dst,
           f"setpts=(PTS-STARTPTS)/{sp},scale=1920:1080:flags=lanczos,tpad=stop_mode=clone:stop_duration={hold},fps=30")
    parts.append((dst, dur(dst)))

card = os.path.join(V, '.p-card.mp4')
t1 = caption_png('STACKED', 150, '#f2b134', '#0c1422', 10)
t2 = caption_png('Play free in the browser\ndesignmastersolutions.itch.io/stacked', 54, 'white', '#0c1422', 10)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x0c1422:s=1920x1080:d=5:r=30', '-i', t1, '-i', t2,
                '-filter_complex', '[0:v][1:v]overlay=x=(W-w)/2:y=300[a];[a][2:v]overlay=x=(W-w)/2:y=560[v]', '-map', '[v]',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', card], check=True)
parts.append((card, 5.0))

lst = os.path.join(V, '.list.txt')
open(lst, 'w').write(''.join(f"file '{p}'\n" for p, _ in parts))
silent = os.path.join(V, '.silent.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', silent], check=True)
total = dur(silent)

sys.path.insert(0, os.path.expanduser('~/Dev/clauditor/scripts'))
import video_make  # noqa: E402
proj = os.path.join(V, '.proj'); os.makedirs(os.path.join(proj, 'assets'), exist_ok=True)
bgm = video_make.music(proj, {'music': 'auto', 'slug': 'stacked-zoud'}, total)
out = os.path.join(V, 'stacked-gameplay.mp4')
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', silent]
if bgm:
    cmd += ['-i', os.path.join(proj, bgm), '-filter_complex', '[1:a]volume=0.55,loudnorm=I=-16:TP=-1.5[a]', '-map', '0:v', '-map', '[a]',
            '-c:a', 'aac', '-b:a', '160k']
cmd += ['-c:v', 'copy', '-movflags', '+faststart', '-shortest', out]
subprocess.run(cmd, check=True)
print(json.dumps({'out': out, 'seconds': round(dur(out), 1), 'parts': [(os.path.basename(p), round(d, 1)) for p, d in parts]}))
