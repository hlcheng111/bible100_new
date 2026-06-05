#!/usr/bin/env python3
"""
Batch 3: hymn hot indexes, cross-folder hymn_most, qna/_fetch mirrors, chrome-extension.
Batch 4: title + single h1 on exposed pages only.
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]

HYMN_GLOBAL_REPLACEMENTS = [
    ("hymn_web-TITLE.htm", "index_hymn_web/hymn_English_Title.htm"),
    ("hymn_web-TITLE-CHI.htm", "index_hymn_web/Index_hl世紀頌讚.htm"),
    ("hymn_web-AUTHOR.htm", "hymn_author/Author_Composer_Index 聖詩作詞作曲者.htm"),
]

HYMN_HOT_DIRS = [
    ROOT / "hymn_management" / "hymn",
    ROOT / "hymn_management" / "hymn" / "index_hymn_web",
    ROOT / "hymn_management" / "hymn" / "index_hymnal",
]

HYMN_CORPUS_DIRS = [
    ROOT / "hymn_management" / "hymn" / "hymn_00",
    ROOT / "hymn_management" / "hymn" / "hymn_22",
    ROOT / "hymn_management" / "hymn" / "hymn_chi",
    ROOT / "hymn_management" / "hymn" / "hymn_most",
    ROOT / "hymn_management" / "hymn" / "hymn_pwc",
    ROOT / "hymn_management" / "hymn" / "hymn_world",
]

CHROME_PAT = re.compile(
    r'<a\s+[^>]*href\s*=\s*["\']chrome-extension://[^"\']*["\'][^>]*>.*?</a>',
    re.I | re.S,
)
HREF_ABS = re.compile(r'''href\s*=\s*(["'])(/[^"'#?]+)\1''', re.I)
HREF_HYMN_MOST = re.compile(r'''href\s*=\s*(["'])(\.\./hymn_most/[^"'#?]+)\1''', re.I)

EXPOSED_PAGES = [
    "index_v5.html",
    "bible_study/dashboard.html",
    "church_ministry/dashboard.html",
    "school_management/dashboard.html",
    "ai_tools/dashboard.html",
    "nav_hub/dashboard.html",
    "hymn_management/dashboard.html",
    "hymn_management/landing.html",
    "hymn_management/index.html",
    "disciple_dynamics/dashboard.html",
    "smart_ministry/dashboard.html",
    "smart_ministry/landing.html",
    "smart_ministry/ai_smart_ministry_overview.html",
    "qna/qna_landing.htm",
    "languages/landing_new_cn.html",
    "languages/index_cn.html",
    "languages/landP_cn.html",
    "church_planning/dashboard.html",
    "tools/tools-dashboard.html",
    "help/global-tools.htm",
    "help/tools-overview.html",
    "hymn_management/hymn/hymn_main_index.html",
    "hymn_management/hymn/default.htm",
    "church_ministry/congregation/index.html",
]

TITLE_RE = re.compile(r"<title[^>]*>\s*.*?\s*</title>", re.I | re.S)
H1_BLOCK = re.compile(r"<h1\b[^>]*>.*?</h1>", re.I | re.S)


def iter_html_in(paths: list[Path], recursive: bool) -> list[Path]:
    out: list[Path] = []
    for base in paths:
        if not base.exists():
            continue
        if base.is_file():
            out.append(base)
        elif recursive:
            out.extend(sorted(base.rglob("*.htm*")))
    return out


def apply_replacements(text: str) -> str:
    for old, new in HYMN_GLOBAL_REPLACEMENTS:
        text = text.replace(old, new)
    return text


def build_hymn_most_index() -> dict[str, Path]:
    idx: dict[str, Path] = {}
    base = ROOT / "hymn_management" / "hymn" / "hymn_most"
    if base.is_dir():
        for p in base.glob("*.htm*"):
            idx[p.name.lower()] = p
    return idx


def rewrite_hymn_most_in_text(text: str, path: Path, hymn_most_index: dict[str, Path]) -> str:
    def repl(m: re.Match[str]) -> str:
        quote, target = m.group(1), unquote(m.group(2))
        name = target.split("/")[-1]
        hit = hymn_most_index.get(name.lower())
        if not hit:
            return m.group(0)
        rel = os.path.relpath(hit, path.parent).replace("\\", "/")
        return f"href={quote}{rel}{quote}"

    return HREF_HYMN_MOST.sub(repl, text)


def process_hymn_file(path: Path, hymn_most_index: dict[str, Path]) -> tuple[bool, int]:
    text = path.read_text(encoding="utf-8", errors="replace")
    new_text = apply_replacements(text)
    new_text = rewrite_hymn_most_in_text(new_text, path, hymn_most_index)
    new_text, chrome = CHROME_PAT.subn("", new_text)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        return True, chrome
    return False, chrome


def fix_qna_fetch(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace")
    orig = text
    banner = (
        '<div style="background:#fff3cd;padding:8px 12px;font-size:12px;border-bottom:1px solid #ffc107;">'
        '離線鏡像頁：站內絕對路徑已改指向 <a href="../qna_landing.htm">Q&amp;A 主入口</a>。'
        "</div>\n"
    )
    if "離線鏡像頁" not in text:
        text = re.sub(r"(<body[^>]*>)", r"\1\n" + banner, text, count=1, flags=re.I)

    def abs_repl(m: re.Match[str]) -> str:
        q, href = m.group(1), m.group(2)
        local = ROOT / href.lstrip("/")
        if not local.is_file():
            return f'href={q}../qna_landing.htm{q}'
        return m.group(0)

    text = HREF_ABS.sub(abs_repl, text)
    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def demote_extra_h1(text: str) -> str:
    blocks = list(H1_BLOCK.finditer(text))
    if len(blocks) <= 1:
        return text
    out = []
    last = 0
    for i, m in enumerate(blocks):
        out.append(text[last : m.start()])
        block = m.group(0)
        if i == 0:
            out.append(block)
        else:
            out.append(re.sub(r"</?h1\b", lambda s: s.group(0).replace("h1", "h2"), block, flags=re.I))
        last = m.end()
    out.append(text[last:])
    return "".join(out)


def fix_seo_exposed(path: Path) -> tuple[bool, bool]:
    text = path.read_text(encoding="utf-8", errors="replace")
    orig = text
    title_fixed = h1_fixed = False

    if not TITLE_RE.search(text):
        label = path.parent.name.replace("_", " ") if "dashboard" in path.name else path.stem
        if "dashboard" in path.name.lower():
            label = {"bible_study": "聖經研讀", "church_ministry": "教會事工", "hymn_management": "詩歌管理"}.get(
                path.parent.name, path.parent.name
            ) + " 儀表板"
        insert = f"<title>{label} · Bible100</title>"
        text = re.sub(r"(<head[^>]*>)", r"\1\n  " + insert, text, count=1, flags=re.I)
        title_fixed = True

    if not re.search(r"<h1\b", text, re.I):
        m = re.search(r"<body[^>]*>", text, re.I)
        if m:
            name = path.stem.replace("_", " ")
            ins = f'<h1 class="page-main-title">{name}</h1>\n'
            text = text[: m.end()] + "\n" + ins + text[m.end() :]
            h1_fixed = True
    else:
        nt = demote_extra_h1(text)
        if nt != text:
            text = nt
            h1_fixed = True

    if text != orig:
        path.write_text(text, encoding="utf-8")
    return title_fixed, h1_fixed


def main() -> int:
    print("=== Batch 3 ===")
    hymn_most_idx = build_hymn_most_index()
    n_hot = n_corpus = n_chrome = 0

    for p in iter_html_in(HYMN_HOT_DIRS, True):
        if any(x in p.parts for x in ("backups", "archive")):
            continue
        ch, c = process_hymn_file(p, hymn_most_idx)
        if ch:
            n_hot += 1
        n_chrome += c

    for p in iter_html_in(HYMN_CORPUS_DIRS, True):
        ch, c = process_hymn_file(p, hymn_most_idx)
        if ch:
            n_corpus += 1
        n_chrome += c

    n_qna = sum(1 for p in (ROOT / "qna" / "_fetch").glob("*.html") if fix_qna_fetch(p))

    idx = ROOT / "hymn_management" / "index.html"
    if idx.is_file():
        t = idx.read_text(encoding="utf-8", errors="replace")
        nt = t.replace('href="/index.html"', 'href="../index_v5.html"')
        if nt != t:
            idx.write_text(nt, encoding="utf-8")
            print("  hymn_management/index.html: /index.html -> index_v5")

    print(f"  hymn hot+corpus files touched: {n_hot} + {n_corpus}")
    print(f"  chrome-extension removed: {n_chrome}")
    print(f"  qna/_fetch fixed: {n_qna}")

    print("=== Batch 4 ===")
    t_cnt = h_cnt = 0
    for rel in EXPOSED_PAGES:
        p = ROOT / rel
        if p.is_file():
            tf, hf = fix_seo_exposed(p)
            t_cnt += int(tf)
            h_cnt += int(hf)
    print(f"  titles added: {t_cnt}")
    print(f"  h1 adjusted: {h_cnt}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
