import re
import sys
from pathlib import Path


SKIP_PREFIXES = (
    "http://",
    "https://",
    "about:",
    "data:",
    "mailto:",
    "javascript:",
    "tel:",
)

ATTR_RE = re.compile(r"""(?:href|src)\s*=\s*(?:"([^"]+)"|'([^']+)')""", re.IGNORECASE)


def extract_targets(html_text: str) -> list[str]:
    out: list[str] = []
    for m in ATTR_RE.finditer(html_text):
        u = (m.group(1) or m.group(2) or "").strip()
        if not u or u.startswith("#"):
            continue
        if u.lower().startswith(SKIP_PREFIXES):
            continue
        out.append(u)
    return out


def check_file(path: Path) -> list[tuple[str, Path]]:
    base = path.parent
    txt = path.read_text("utf-8", errors="ignore")
    missing: list[tuple[str, Path]] = []
    for u in extract_targets(txt):
        u2 = u.split("#", 1)[0].split("?", 1)[0].strip()
        if not u2:
            continue
        target = (base / u2).resolve()
        if not target.exists():
            missing.append((u, target))
    return missing


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Usage: broken_link_check.py <html-file> [<html-file>...]")
        return 2

    all_missing: list[tuple[Path, list[tuple[str, Path]]]] = []
    for p in argv[1:]:
        fp = Path(p)
        if not fp.exists():
            all_missing.append((fp, [("<file missing>", fp)]))
            continue
        miss = check_file(fp)
        if miss:
            all_missing.append((fp, miss))

    if not all_missing:
        print("broken_link_check: OK")
        return 0

    print("broken_link_check: MISSING")
    for fp, miss in all_missing:
        print(f"\nFILE: {fp}")
        for u, t in miss[:200]:
            print(f" - {u} => {t}")
        if len(miss) > 200:
            print(f" ... and {len(miss) - 200} more")
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

