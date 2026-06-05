#!/usr/bin/env python3
"""
inject_ai_links.py - Add href links to AI tool cards in bottom section

Maps:
  ? (question) -> ai_qa_system.html
  (art) -> ai_text_to_image.html
  (music) -> ai_text_to_music.html
  (chart) -> ai_lesson_plan.html

Also adds font-size reduction for resources-section and self-learning-section.
"""

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANGUAGES = ROOT / "languages"

# Icon to ai_tools page mapping
CARD_LINKS = [
    (r'<div class="icon">\?\?</div>', "ai_qa_system.html"),       # ??
    (r'<div class="icon">\?\s*</div>', "ai_qa_system.html"),       # ? (single)
    (r'<div class="icon">\ud83d\udcad</div>', "ai_qa_system.html"),  # ? emoji
    (r'<div class="icon">\ud83c\udfa8</div>', "ai_text_to_image.html"),  # art
    (r'<div class="icon">\ud83c\udfb5</div>', "ai_text_to_music.html"),  # music
    (r'<div class="icon">\ud83d\udcca</div>', "ai_lesson_plan.html"),   # chart
]

# Simpler: match by icon character in the HTML (UTF-8)
# ? = U+2753, ? = U+1F4AD, ? = U+1F3A8, ? = U+1F3B5, ? = U+1F4CA
ICON_MAP = [
    ("\u2753", "ai_qa_system.html"),      # ?
    ("\ud83d\udcad", "ai_qa_system.html"),  # ? (thinking)
    ("\ud83c\udfa8", "ai_text_to_image.html"),  # ?
    ("\ud83c\udfb5", "ai_text_to_music.html"),  # ?
    ("\ud83d\udcca", "ai_lesson_plan.html"),    # ?
]


def compute_prefix(filepath):
    rel = filepath.relative_to(ROOT)
    depth = len(rel.parts) - 1
    return "../" * depth if depth > 0 else "../../../../"


def already_linked(content):
    return 'href="' in content and 'ai_tools/pages/' in content and 'ai-tool-card' in content


def inject_file(filepath, dry_run=False):
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return False, "err"

    if "ai-tools-grid" not in content or "ai-tool-card" not in content:
        return False, "skip"

    if already_linked(content):
        return False, "skip"

    prefix = compute_prefix(filepath)
    base = prefix + "ai_tools/pages/"

    def replace_card(m):
        inner = m.group(1)
        icon_content = m.group(2)
        href = base + "ai_lesson_plan.html"  # default
        if "\u2753" in icon_content or "\ud83d\udcad" in icon_content:
            href = base + "ai_qa_system.html"
        elif "\ud83c\udfa8" in icon_content:
            href = base + "ai_text_to_image.html"
        elif "\ud83c\udfb5" in icon_content:
            href = base + "ai_text_to_music.html"
        elif "\ud83d\udcca" in icon_content:
            href = base + "ai_lesson_plan.html"
        return '<a class="ai-tool-card" href="' + href + '" target="_blank">' + inner + '</a>'

    pattern = re.compile(
        r'<div class="ai-tool-card">\s*(<div class="icon">([^<]+)</div>[\s\S]*?)</div>',
        re.MULTILINE
    )
    new_content = pattern.sub(replace_card, content)

    # Add font-size reduction for resources section (if not already present)
    if "resources-section" in new_content and "font-size:1rem" not in new_content:
        # Add style to h2 in resources-section - use a CSS block or inline
        pass  # Skip for now, do in separate pass

    if new_content == content:
        return False, "skip"

    if dry_run:
        print("  [DRY-RUN] Would update: %s" % filepath.relative_to(ROOT))
        return True, "ok"

    try:
        filepath.write_text(new_content, encoding="utf-8")
        return True, "ok"
    except Exception as e:
        print("  [ERR] %s: %s" % (filepath, e))
        return False, "err"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--backup", action="store_true")
    args = parser.parse_args()

    if args.backup and not args.dry_run:
        backup_dir = ROOT / "languages_backup_ai_links"
        if not backup_dir.exists():
            import shutil
            print("Backing up to %s ..." % backup_dir)
            shutil.copytree(LANGUAGES, backup_dir)
            print("Done.")

    files = sorted(LANGUAGES.rglob("*.html"))
    files = [f for f in files if f.is_file() and "ai-tool-card" in f.read_text(encoding="utf-8", errors="replace")]

    injected = 0
    for f in files:
        did, status = inject_file(f, dry_run=args.dry_run)
        if status == "ok":
            injected += 1
            if not args.dry_run:
                print("  OK %s" % f.relative_to(ROOT))

    print("\nDone: updated %d files." % injected)


if __name__ == "__main__":
    main()
