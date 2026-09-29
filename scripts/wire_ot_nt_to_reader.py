#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""BS-H2：OT/NT 66 卷 landing 批量接入 reader.html 深鏈（冪等）。"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
BS = ROOT / "bible_study"
CATALOG = BS / "data" / "bible_books_66.json"
MARKER = "<!-- BS-H2-READER-WIRED -->"
MAX_CHAPTER_BUTTONS = 150


def load_catalog() -> tuple[dict[str, dict], dict[str, dict]]:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    by_name: dict[str, dict] = {}
    by_category: dict[str, list] = {}
    for b in data["books"]:
        by_name[b["name"]] = b
        by_category.setdefault(b["category"], []).append(b)
    return by_name, by_category


def reader_prefix(rel: Path) -> str:
    """bible_study 根相對前綴，例如 OT/law/x.html → ../../"""
    depth = len(rel.parent.parts)
    return "../" * depth if depth else "./"


def chapter_grid(prefix: str, book: dict, compact: bool = False) -> str:
    links = []
    limit = min(book["chapters"], MAX_CHAPTER_BUTTONS)
    for ch in range(1, limit + 1):
        href = f'{prefix}reader.html?book={book["id"]}&chapter={ch}'
        links.append(
            f'<a href="{href}" target="contentFrame" title="{book["name"]} 第{ch}章">{ch}</a>'
        )
    note = ""
    if book["chapters"] > MAX_CHAPTER_BUTTONS:
        note = f'<p class="ext" style="font-size:10px;color:#666;">（詩篇等長卷：章節按鈕限 {MAX_CHAPTER_BUTTONS}，請用 reader 書卷選單）</p>'
    style = "display:flex;flex-wrap:wrap;gap:4px 8px;margin-top:8px;"
    if compact:
        style += "max-height:120px;overflow-y:auto;"
    return f'<div class="ch-list bs-reader-chapters" style="{style}">{"".join(links)}</div>{note}'


def book_wire_block(prefix: str, book: dict) -> str:
    name_q = quote(book["name"])
    return f"""{MARKER}
<div class="content bs-reader-wire" style="margin-top:12px;background:#fff;padding:16px 20px;border-radius:8px;border-left:4px solid #27ae60;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <h4 style="font-size:13px;color:#0b5fa5;margin-bottom:8px;">📖 站內閱讀 · reader（BS-H2）</h4>
  <p style="font-size:11px;margin-bottom:6px;line-height:1.6;">
    <a href="{prefix}reader.html?book={book['id']}&chapter=1" target="contentFrame">從第1章讀經文</a> ·
    <a href="{prefix}comprehensive_exegesis_reader.html?book={name_q}&amp;chapter=1" target="contentFrame">綜合解讀</a> ·
    <a href="{prefix}parallel_mode_v3.html" target="contentFrame">譯本對照</a> ·
    <a href="{prefix}search_reader.html" target="contentFrame">全文搜尋</a>
  </p>
  <p style="font-size:10px;color:#64748b;margin-bottom:4px;">章節捷徑（reader · book={book['id']}）：</p>
  {chapter_grid(prefix, book)}
</div>
"""


def category_wire_block(prefix: str, books: list[dict]) -> str:
    rows = []
    for b in books:
        rows.append(
            f'<a href="{prefix}reader.html?book={b["id"]}&chapter=1" target="contentFrame" '
            f'style="display:inline-block;padding:6px 10px;margin:3px;background:#e8f5e9;color:#166534;'
            f'text-decoration:none;border-radius:5px;font-size:11px;">📖 {b["name"]}</a>'
        )
    return f"""{MARKER}
<div class="intro bs-reader-wire" style="margin-top:14px;border-top:1px dashed #cbd5e1;padding-top:12px;">
  <h4 style="font-size:13px;color:#0b5fa5;margin-bottom:8px;">📖 站內 reader 捷徑（66 卷 · 本類）</h4>
  <div class="book-list" style="display:flex;flex-wrap:wrap;gap:6px;">{"".join(rows)}</div>
</div>
"""


def testament_wire_block(prefix: str, title: str) -> str:
    return f"""{MARKER}
<div class="section bs-reader-wire" style="background:#ecfdf5;border-left:4px solid #27ae60;">
  <h3>{title}</h3>
  <p style="font-size:12px;margin-bottom:8px;">66 卷已接入 <code>reader.html</code>（book=1–66）· 各書卷 landing 含章節捷徑。</p>
  <a href="{prefix}reader.html" target="contentFrame" class="btn" style="background:#27ae60;">📖 開啟站內閱讀器</a>
  <a href="{prefix}commentaries/_landing.html" target="contentFrame" class="btn" style="background:#0b5fa5;margin-left:8px;">📚 書卷導覽</a>
</div>
"""


def patch_comprehensive_link(text: str, book: dict) -> str:
    """補 chapter=1 到僅 book 名稱的綜合解讀連結。"""
    name = book["name"]
    old = f'comprehensive_exegesis_reader.html?book={name}"'
    new = f'comprehensive_exegesis_reader.html?book={name}&amp;chapter=1"'
    if old in text and new not in text:
        text = text.replace(old, new, 1)
    return text


def replace_genesis_chapter_script(text: str, prefix: str, book: dict) -> str:
    """category index 內舊的創世記章節 script → reader 深鏈。"""
    if "genesis-chapters" not in text:
        return text
    script = f"""<script>
        (function(){{
            var el = document.getElementById('genesis-chapters');
            if (!el) return;
            for (var ch = 1; ch <= {book['chapters']}; ch++) {{
                var a = document.createElement('a');
                a.href = '{prefix}reader.html?book={book['id']}&chapter=' + ch;
                a.textContent = ch;
                a.target = 'contentFrame';
                a.title = '{book['name']} 第' + ch + '章';
                el.appendChild(a);
            }}
        }})();
    </script>"""
    return re.sub(
        r"<script>\s*\(function\(\)\{\s*var el = document\.getElementById\('genesis-chapters'\);.*?</script>",
        script,
        text,
        count=1,
        flags=re.S,
    )


def inject_before_body_close(text: str, block: str) -> str:
    if MARKER in text:
        return text
    idx = text.lower().rfind("</body>")
    if idx < 0:
        return text + "\n" + block
    return text[:idx] + "\n" + block + "\n" + text[idx:]


def wire_book_page(path: Path, book: dict) -> bool:
    rel = path.relative_to(BS)
    prefix = reader_prefix(rel)
    text = path.read_text(encoding="utf-8")
    if MARKER in text:
        return False
    text = patch_comprehensive_link(text, book)
    text = inject_before_body_close(text, book_wire_block(prefix, book))
    path.write_text(text, encoding="utf-8")
    return True


def wire_category_index(path: Path, books: list[dict]) -> bool:
    rel = path.relative_to(BS)
    prefix = reader_prefix(rel)
    text = path.read_text(encoding="utf-8")
    changed = False
    if MARKER not in text:
        text = inject_before_body_close(text, category_wire_block(prefix, books))
        changed = True
    if books and books[0]["name"] == "創世記":
        new_text = replace_genesis_chapter_script(text, prefix, books[0])
        if new_text != text:
            text = new_text
            changed = True
    if changed:
        path.write_text(text, encoding="utf-8")
    return changed


def wire_testament_index(path: Path, title: str) -> bool:
    rel = path.relative_to(BS)
    prefix = reader_prefix(rel)
    text = path.read_text(encoding="utf-8")
    if MARKER in text:
        return False
    text = inject_before_body_close(text, testament_wire_block(prefix, title))
    path.write_text(text, encoding="utf-8")
    return True


def category_key(testament: str, folder: str) -> str:
    """資料夾名 → catalog category（OT/NT 同名分類如 history 需區分）。"""
    if testament == "NT" and folder == "history":
        return "nt_history"
    return folder


def main() -> int:
    if not CATALOG.is_file():
        print("missing catalog", CATALOG, file=sys.stderr)
        return 1
    by_name, by_category = load_catalog()
    updated = 0

    for testament, root_name in (("OT", "OT"), ("NT", "NT")):
        root = BS / root_name
        if not root.is_dir():
            continue
        for html in sorted(root.rglob("*.html")):
            rel = html.relative_to(BS)
            name = html.stem
            if name == "index":
                if rel.parts == (root_name, "index.html"):
                    title = "📕 舊約 · 站內閱讀" if root_name == "OT" else "📗 新約 · 站內閱讀"
                    if wire_testament_index(html, title):
                        updated += 1
                        print("testament", rel)
                elif len(rel.parts) == 3:
                    cat = category_key(root_name, rel.parts[1])
                    books = by_category.get(cat, [])
                    if wire_category_index(html, books):
                        updated += 1
                        print("category", rel, len(books))
            elif name in by_name:
                if wire_book_page(html, by_name[name]):
                    updated += 1
                    print("book", rel, by_name[name]["id"])

    report = {
        "updated_files": updated,
        "catalog_books": len(by_name),
        "marker": MARKER,
    }
    out = BS / "data" / "reader_wire_report.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote", out)
    print("Updated", updated, "files")
    return 0


if __name__ == "__main__":
    if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    raise SystemExit(main())
