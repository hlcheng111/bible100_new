#!/usr/bin/env python3
"""
inject_editor_guide.py - Inject HTML Editor guide block into media-grid sections

Injects a compact instruction block linking to HTML Editor and edit-website-guide,
with instructions on adding images, audio, YouTube links.

Usage:
  python inject_editor_guide.py
  python inject_editor_guide.py --dry-run
  python inject_editor_guide.py --backup
"""

import argparse
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANGUAGES = ROOT / "languages"

# Block to inject - path uses ../../../../ from languages/xx/OT/chapters/
EDITOR_GUIDE_BLOCK = '''
    <div class="editor-guide-block" style="grid-column:1/-1;background:#e3f2fd;padding:12px 16px;border-radius:6px;margin-bottom:12px;font-size:0.9em;border-left:4px solid #0b5fa5;">
      <p style="margin:0 0 6px 0;"><a href="../../../../tools/html_editor.html" target="_blank">HTML Editor</a> &middot; <a href="../../../../help/edit-website-guide.html" target="_blank">How to edit</a></p>
      <p style="margin:0;color:#555;">Images: put in media/images/ | Audio: media/audio/ | YouTube: use editor "Insert media" and paste URL</p>
    </div>
'''

# Alternative with Chinese text for cn pages - we'll use a generic block that works for all
EDITOR_GUIDE_ZH = '''
    <div class="editor-guide-block" style="grid-column:1/-1;background:#e3f2fd;padding:12px 16px;border-radius:6px;margin-bottom:12px;font-size:0.9em;border-left:4px solid #0b5fa5;">
      <p style="margin:0 0 6px 0;"><a href="../../../../tools/html_editor.html" target="_blank">HTML 編輯器</a> &middot; <a href="../../../../help/edit-website-guide.html" target="_blank">使用指南</a></p>
      <p style="margin:0;color:#555;">圖片請放入 media/images/；音頻請放入 media/audio/；YouTube 請用編輯器「插入媒體」貼上網址</p>
    </div>
'''

MARKER = "editor-guide-block"
MARKER_ZH = "HTML 編輯器"


def get_chapter_files():
    if not LANGUAGES.exists():
        return []
    return sorted(LANGUAGES.rglob("chapters/*.html"))


def compute_path_depth(filepath):
    rel = filepath.relative_to(ROOT)
    # languages/cn/OT/chapters/f.html -> 5 parts, need 4 levels up
    return len(rel.parts) - 1


def get_lang_from_path(filepath):
    """Extract language code from path: languages/cn/OT/chapters/ -> cn"""
    try:
        rel = filepath.relative_to(ROOT)
        parts = rel.parts
        if len(parts) >= 2 and parts[0] == "languages":
            return parts[1]
    except ValueError:
        pass
    return "en"


# Multilingual editor guide strings: (editor_label, guide_label, tips_text)
EDITOR_GUIDE_LANG = {
    "cn": ("HTML 編輯器", "使用指南", "圖片→ media/images/；音頻→ media/audio/；YouTube→ 編輯器「插入媒體」貼網址"),
    "ch": ("HTML 編輯器", "使用指南", "圖片→ media/images/；音頻→ media/audio/；YouTube→ 編輯器「插入媒體」貼網址"),
    "en": ("HTML Editor", "How to edit", "Images: media/images/ | Audio: media/audio/ | YouTube: use editor \"Insert media\" and paste URL"),
    "vi": ("Trình chỉnh sửa HTML", "Hướng dẫn", "Hình ảnh: media/images/ | Âm thanh: media/audio/ | YouTube: dùng \"Chèn media\" và dán URL"),
    "my": ("HTML တည်းဖြတ်ခြင်း", "လမ်းညွှန်ချက်", "ပုံများ: media/images/ | အသံ: media/audio/ | YouTube: editor \"Insert media\" နှင့် URL ထည့်ပါ"),
    "kh": ("កម្មវិធីកែសម្រួល HTML", "ការណែនាំ", "រូបភាព: media/images/ | សំឡេង: media/audio/ | YouTube: ប្រើ \"បញ្ចូល media\" និង paste URL"),
    "lo": ("ເຄື່ອງມືແກ້ໄຂ HTML", "ຄູ່ມື", "ຮູບ: media/images/ | ສຽງ: media/audio/ | YouTube: ໃຊ້ \"ໃສ່ media\" ແລະ paste URL"),
    "id": ("Editor HTML", "Panduan", "Gambar: media/images/ | Audio: media/audio/ | YouTube: gunakan \"Sisipkan media\" dan tempel URL"),
    "ad": ("HTML 編輯器", "使用指南", "圖片→ media/images/；音頻→ media/audio/；YouTube→ 編輯器「插入媒體」貼網址"),
}


def get_guide_block(depth, lang=None):
    if lang is None:
        lang = "en"
    editor_label, guide_label, tips = EDITOR_GUIDE_LANG.get(lang, EDITOR_GUIDE_LANG["en"])
    prefix = "../" * depth
    return '''
    <div class="editor-guide-block" style="grid-column:1/-1;background:#e3f2fd;padding:12px 16px;border-radius:6px;margin-bottom:12px;font-size:0.9em;border-left:4px solid #0b5fa5;">
      <p style="margin:0 0 6px 0;"><a href="''' + prefix + '''tools/html_editor.html" target="_blank">''' + editor_label + '''</a> &middot; <a href="''' + prefix + '''help/edit-website-guide.html" target="_blank">''' + guide_label + '''</a></p>
      <p style="margin:0;color:#555;">''' + tips + '''</p>
    </div>
'''


def already_injected(content):
    return "editor-guide-block" in content or "html_editor.html" in content


def has_media_grid(content):
    return 'class="media-grid"' in content or "class='media-grid'" in content


def inject_into_media_grid(content, block, filepath, dry_run):
    """Inject into media-grid (original behavior)."""
    pattern = re.compile(
        r'(<div\s+class="media-grid">)\s*\n(\s*)(<div\s+class="media-card")',
        re.IGNORECASE
    )
    match = pattern.search(content)
    if not match:
        return None
    indent = match.group(2)
    replacement = match.group(1) + "\n" + indent + block.strip() + "\n" + indent + match.group(3)
    return pattern.sub(replacement, content, count=1)


def inject_after_back_link(content, block, filepath, dry_run):
    """Inject after .back-link for pages without media-grid."""
    # Match: back-link </a>, newline, indent, then <section class="content"> or <div class="lesson-header">
    pattern = re.compile(
        r'(<a\s[^>]*class="back-link"[^>]*>.*?</a>)(\s*\n)(\s*)(<(?:section|div)\s+class="(?:content|lesson-header)")',
        re.IGNORECASE | re.DOTALL
    )
    match = pattern.search(content)
    if match:
        indent = match.group(3) or "  "
        replacement = match.group(1) + match.group(2) + indent + block.strip() + "\n" + indent + match.group(4)
        return pattern.sub(replacement, content, count=1)
    # Fallback 2: after back-link, before next tag
    pattern2 = re.compile(
        r'(<a\s[^>]*class="back-link"[^>]*>.*?</a>)(\s*\n)(\s*)',
        re.IGNORECASE | re.DOTALL
    )
    m2 = pattern2.search(content)
    if m2:
        indent = m2.group(3) or "  "
        pos = m2.end()
        return content[:pos] + indent + block.strip() + "\n" + indent + content[pos:]
    # Fallback 3: after <body>, before first content (for pages without back-link)
    pattern3 = re.compile(r'(<body[^>]*>)(\s*\n)(\s*)', re.IGNORECASE)
    m3 = pattern3.search(content)
    if m3:
        indent = m3.group(3) or "  "
        pos = m3.end()
        return content[:pos] + indent + block.strip() + "\n" + indent + content[pos:]
    return None


def inject_into_file(filepath, dry_run=False, allow_no_media_grid=False):
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        print("  [ERR] Cannot read %s: %s" % (filepath, e))
        return False, "err"

    if already_injected(content):
        return False, "skip"

    depth = compute_path_depth(filepath)
    if depth < 1:
        depth = 4
    lang = get_lang_from_path(filepath)
    block = get_guide_block(depth, lang)

    new_content = None
    if has_media_grid(content):
        new_content = inject_into_media_grid(content, block, filepath, dry_run)
    elif allow_no_media_grid:
        new_content = inject_after_back_link(content, block, filepath, dry_run)

    if not new_content:
        return False, "skip" if not has_media_grid(content) else "err"

    if dry_run:
        print("  [DRY-RUN] Would inject: %s" % filepath.relative_to(ROOT))
        return True, "ok"

    try:
        filepath.write_text(new_content, encoding="utf-8")
        return True, "ok"
    except Exception as e:
        print("  [ERR] Cannot write %s: %s" % (filepath, e))
        return False, "err"


def update_block_to_chinese(filepath):
    """Replace English block text with Chinese in already-injected files."""
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return False
    if "HTML 編輯器" in content:
        return False  # already Chinese
    if "HTML Editor" not in content:
        return False
    content = content.replace("HTML Editor", "HTML 編輯器").replace("Guide</a>", "使用指南</a>")
    content = re.sub(
        r'Images: media/images/ \| Audio: media/audio/ \| YouTube: editor "Insert media" paste URL',
        "圖片→ media/images/；音頻→ media/audio/；YouTube→ 編輯器「插入媒體」貼網址",
        content
    )
    try:
        filepath.write_text(content, encoding="utf-8")
        return True
    except Exception:
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--backup", action="store_true")
    parser.add_argument("--update-zh", action="store_true", help="Update existing blocks to Chinese")
    args = parser.parse_args()

    if args.update_zh:
        files = get_chapter_files()
        updated = 0
        for f in files:
            if update_block_to_chinese(f):
                updated += 1
                print("  OK %s" % f.relative_to(ROOT))
        print("\nUpdated %d files to Chinese." % updated)
        return

    files = get_chapter_files()
    if not files:
        print("No chapter files found.")
        return

    with_media = sum(1 for f in files if has_media_grid(f.read_text(encoding="utf-8", errors="replace")))
    print("Found %d chapter files (%d with media-grid, %d without)." % (len(files), with_media, len(files) - with_media))

    if args.backup and not args.dry_run:
        backup_dir = ROOT / "languages_backup_editor"
        if backup_dir.exists():
            print("Backup exists, skip: %s" % backup_dir)
        else:
            print("Backing up languages/ to %s ..." % backup_dir)
            shutil.copytree(LANGUAGES, backup_dir)
            print("Backup done.")

    injected = 0
    skipped = 0
    for f in files:
        content = f.read_text(encoding="utf-8", errors="replace")
        if already_injected(content):
            skipped += 1
            continue
        did, status = inject_into_file(f, dry_run=args.dry_run, allow_no_media_grid=True)
        if status == "ok":
            injected += 1
            if not args.dry_run:
                print("  OK %s" % f.relative_to(ROOT))
        elif status == "skip":
            skipped += 1

    print("\nDone: injected %d, skipped %d." % (injected, skipped))


if __name__ == "__main__":
    main()
