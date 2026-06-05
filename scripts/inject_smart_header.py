#!/usr/bin/env python3
"""
inject_smart_header.py - 批次注入 smart_tools 到教材 HTML 頁面

用法:
  python inject_smart_header.py                    # 執行注入
  python inject_smart_header.py --dry-run           # 僅預覽，不寫入
  python inject_smart_header.py --backup           # 注入前備份 languages/
  python inject_smart_header.py --test chapter2     # 僅處理檔名含 chapter2 的檔案
"""

import argparse
import os
import re
import shutil
from pathlib import Path

# 專案根目錄 (bible100_new)
ROOT = Path(__file__).resolve().parent.parent
LANGUAGES = ROOT / "languages"
JS_PATH = "js/smart_tools.js"

# 要注入的內容：localConfig 佔位 + smart_tools.js 引用
INJECT_BLOCK = '''
<!-- smart_tools 頂部工具箱 (由 inject_smart_header.py 注入) -->
<script>window.localConfig = window.localConfig || {};</script>
<script src="../../../js/smart_tools.js"></script>
'''


def get_chapter_html_files():
    """取得所有 languages/**/chapters/*.html"""
    if not LANGUAGES.exists():
        return []
    files = []
    for p in LANGUAGES.rglob("chapters/*.html"):
        if p.is_file():
            files.append(p)
    return sorted(files)


def compute_script_path(html_path: Path) -> str:
    """從 HTML 路徑計算到 languages/js/ 的相對路徑"""
    # languages/cn/OT/chapters/x.html -> ../../../js/smart_tools.js
    rel = html_path.relative_to(ROOT)
    depth = len(rel.parts) - 2  # 扣除 languages, js
    if depth < 1:
        depth = 3  # 預設
    return "../" * depth + JS_PATH


def already_injected(content: str) -> bool:
    """檢查是否已注入"""
    return "#smart-header" in content or "smart_tools.js" in content


def inject_into_file(filepath: Path, dry_run: bool = False):
    """注入到單一檔案，回傳 (是否處理, 狀態: ok|skip|err)"""
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        print("  [ERR] Cannot read %s: %s" % (filepath, e))
        return False, "err"

    if already_injected(content):
        return False, "skip"

    # 計算正確的相對路徑: languages/xx/OT/chapters/file.html -> ../../../js/
    rel = filepath.relative_to(ROOT)
    parts = rel.parts
    depth = len(parts) - 2  # languages, lang, OT|NT|T4, chapters, file
    if depth < 1:
        depth = 3
    script_src = "../" * depth + JS_PATH

    block = f'''
<!-- smart_tools 頂部工具箱 (由 inject_smart_header.py 注入) -->
<script>window.localConfig = window.localConfig || {{}};</script>
<script src="{script_src}"></script>
'''

    if "</body>" not in content.lower():
        print("  [WARN] No </body> in %s" % filepath.relative_to(ROOT))
        return False, "err"

    pattern = re.compile(r"</body>", re.IGNORECASE)
    match = pattern.search(content)
    if not match:
        return False, "err"

    insert_pos = match.start()
    new_content = content[:insert_pos] + block + "\n" + content[insert_pos:]

    if dry_run:
        print("  [DRY-RUN] Would inject: %s" % filepath.relative_to(ROOT))
        return True, "ok"

    try:
        filepath.write_text(new_content, encoding="utf-8")
        return True, "ok"
    except Exception as e:
        print("  [ERR] Cannot write %s: %s" % (filepath, e))
        return False, "err"


def main():
    parser = argparse.ArgumentParser(description="批次注入 smart_tools 到教材 HTML")
    parser.add_argument("--dry-run", action="store_true", help="僅預覽，不寫入檔案")
    parser.add_argument("--backup", action="store_true", help="注入前備份 languages/ 到 languages_backup/")
    parser.add_argument("--test", type=str, default="", help="Only process files whose path/name contains this")
    parser.add_argument("--limit", type=int, default=0, help="Max files to process (0=all)")
    parser.add_argument("--file", type=str, default="", help="Single file path (relative to project root)")
    args = parser.parse_args()

    files = get_chapter_html_files()
    if args.file:
        fp = ROOT / args.file.replace("/", os.sep)
        files = [fp] if fp.exists() and fp.is_file() else []
    elif args.test:
        files = [f for f in files if args.test in str(f) or args.test in f.name]
    if args.limit:
        files = files[: args.limit]
    if not files:
        print("No matching HTML files found.")
        return

    print("Found %d chapter HTML files." % len(files))

    if args.backup and not args.dry_run:
        backup_dir = ROOT / "languages_backup"
        if backup_dir.exists():
            print("Backup dir exists, skip: %s" % backup_dir)
        else:
            print("Backing up languages/ to %s ..." % backup_dir)
            shutil.copytree(LANGUAGES, backup_dir)
            print("Backup done.")

    injected = 0
    skipped = 0
    for f in files:
        did, status = inject_into_file(f, dry_run=args.dry_run)
        if status == "ok":
            injected += 1
            if not args.dry_run:
                print("  OK %s" % f.relative_to(ROOT))
        elif status == "skip":
            skipped += 1

    print("\nDone: injected %d, skipped %d." % (injected, skipped))


if __name__ == "__main__":
    main()
