import re
from pathlib import Path
from urllib.parse import unquote
root = Path('.').resolve()
html_files = [p for p in root.rglob('*.htm*') if 'languages' not in p.parts]
print('HTML count:', len(html_files))
TITLE = re.compile(rb'<title[^>]*>(.*?)</title>', re.I | re.DOTALL)
H1 = re.compile(rb'<h1\b', re.I)
HREF = re.compile(rb'href\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))', re.I)
broken = []
empty_title = []
no_h1 = []
multi_h1 = []
for p in sorted(html_files):
    raw = p.read_bytes()
    title = ''
    m=TITLE.search(raw[:200000])
    if m:
        try:
            title=m.group(1).decode('utf-8', errors='replace').strip()
        except Exception:
            title=''
    if not title:
        empty_title.append(str(p.relative_to(root)))
    h1_count = len(H1.findall(raw[:200000]))
    if h1_count == 0 and 'sidebar' not in str(p).lower() and 'component' not in str(p).lower():
        no_h1.append(str(p.relative_to(root)))
    if h1_count > 1:
        multi_h1.append(str(p.relative_to(root)))
    for mm in HREF.finditer(raw[:200000]):
        h = mm.group(1) or mm.group(2) or mm.group(3)
        if not h:
            continue
        try:
            s = unquote(h.decode('utf-8', errors='replace')).strip()
        except Exception:
            continue
        if any(s.startswith(pref) for pref in ('http://','https://','mailto:','javascript:','data:','tel:')):
            continue
        if s.startswith('#') or s == '':
            continue
        tgt = (p.parent / s.split('#')[0].split('?')[0]).resolve()
        if tgt == root or root in tgt.parents:
            if tgt.suffix.lower() in ('.html','.htm','.json') and not tgt.is_file():
                broken.append((str(p.relative_to(root)), s))
                break
print('EMPTY_TITLE:', len(empty_title))
print('NO_H1:', len(no_h1))
print('MULTI_H1:', len(multi_h1))
broken_files = len({b[0] for b in broken})
print('BROKEN_LINK_FILES:', broken_files)
out = root / 'docs' / 'reports' / 'audit_out_utf8.txt'
lines = [
    f'HTML count: {len(html_files)}',
    f'EMPTY_TITLE: {len(empty_title)}',
    f'NO_H1: {len(no_h1)}',
    f'MULTI_H1: {len(multi_h1)}',
    f'BROKEN_LINK_FILES: {broken_files}',
    'SAMPLE BROKEN:',
] + [f'  {a} -> {b}' for a, b in broken[:20]]
out.write_text('\n'.join(lines), encoding='utf-8')
print('Report written:', out)
