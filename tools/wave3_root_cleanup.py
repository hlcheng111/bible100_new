from __future__ import annotations

from pathlib import Path
import shutil


ROOT = Path(r"C:\Users\hlche\.cursor\bible100_new")
DST = ROOT / "archive" / "20260507_root_wave3"

KEEP_HTML = {"index.html", "index_v5.html", "index_legacy.html"}


def move_file(src: Path, dst_dir: Path) -> bool:
    if not src.exists() or not src.is_file():
        return False
    dst_dir.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dst_dir / src.name))
    return True


def main() -> int:
    moved: list[str] = []
    for p in ROOT.iterdir():
        if not p.is_file():
            continue
        name = p.name
        suffix = p.suffix.lower()

        should_move = False
        if suffix == ".txt":
            should_move = True
        elif suffix == ".html" and name not in KEEP_HTML:
            should_move = True

        if should_move and move_file(p, DST):
            moved.append(name)

    if not moved:
        print("no_files_moved")
        return 0

    for name in sorted(moved):
        safe = name.encode("ascii", errors="replace").decode("ascii")
        print(f"moved: {safe}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

