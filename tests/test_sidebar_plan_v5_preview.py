"""Static check: sidebar_plan_v5_preview.html link targets exist."""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
PREVIEW = ROOT / "church_planning" / "sidebar_plan_v5_preview.html"
SHELL = ROOT / "church_planning" / "sidebar_plan_preview_shell.html"


def extract_hrefs(html: str) -> list[str]:
    return re.findall(r'href="([^"#?]+)', html)


def resolve(href: str, base: Path) -> Path:
    href = unquote(href.replace("&amp;", "&"))
    if href.startswith("../"):
        return (base.parent / href[3:]).resolve()
    if href.startswith("http") or href.startswith("file:"):
        raise ValueError(f"skip absolute: {href}")
    return (base / href).resolve()


def main() -> int:
    errors: list[str] = []
    for page in (PREVIEW, SHELL):
        if not page.is_file():
            errors.append(f"missing page: {page.relative_to(ROOT)}")
            continue
        text = page.read_text(encoding="utf-8")
        for href in extract_hrefs(text):
            if href.startswith("#") or "index_v5" in href or "sidebar_plan_preview_shell" in href:
                continue
            try:
                target = resolve(href, page.parent)
            except ValueError:
                continue
            if not target.is_file():
                errors.append(f"{page.name}: {href} -> not found ({target.relative_to(ROOT)})")

    if errors:
        print("FAIL sidebar preview link check:")
        for e in errors:
            print(" ", e)
        return 1
    print("OK sidebar preview: all href targets exist")
    return 0


if __name__ == "__main__":
    sys.exit(main())
