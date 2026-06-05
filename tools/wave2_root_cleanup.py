from __future__ import annotations

from pathlib import Path
import shutil


ROOT = Path(r"C:\Users\hlche\.cursor\bible100_new")
DST = ROOT / "archive" / "20260507_root_wave2"

EXPLICIT = [
    "_gen_sidebar_table.py",
    "_inventory_html_exclude_languages.txt",
    "_patch_sidebar_site_html.py",
    "LOCAL_SERVER.txt",
    "MODIFICATION_PLAN.md",
    "patch_spiritual_survey_ui.py",
    "Planni1.jpg",
    "PROJECT_MILESTONE_2026-04-29.md",
]


def move_file(src: Path, dst_dir: Path) -> bool:
    if not src.exists() or not src.is_file():
        return False
    dst_dir.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dst_dir / src.name))
    return True


def main() -> int:
    moved: list[str] = []

    for name in EXPLICIT:
        if move_file(ROOT / name, DST):
            moved.append(name)

    for p in ROOT.glob("SITE_*"):
        if p.is_file() and move_file(p, DST):
            moved.append(p.name)

    for p in ROOT.glob("*.md"):
        if p.name == "README.md":
            continue
        if move_file(p, DST):
            moved.append(p.name)

    if not moved:
        print("no_files_moved")
        return 0

    for name in sorted(set(moved)):
        safe = name.encode("ascii", errors="replace").decode("ascii")
        print(f"moved: {safe}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

