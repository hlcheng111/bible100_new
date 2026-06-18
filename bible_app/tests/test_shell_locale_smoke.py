#!/usr/bin/env python3
"""P0.5: four-locale bible DB + bible66 page reachable (serve on :3000)."""
import subprocess
import sys

BASE = "http://127.0.0.1:3000"


def curl_code(url: str) -> int:
    p = subprocess.run(
        ["curl.exe", "-s", "-o", "NUL", "-w", "%{http_code}", "-L", "--max-redirs", "5", url],
        capture_output=True,
        text=True,
        timeout=20,
    )
    try:
        return int((p.stdout or "0").strip())
    except ValueError:
        return 0


def main() -> int:
    errors = []
    if curl_code(f"{BASE}/bible_app/app/assets/bible/bible_reader.db") != 200:
        errors.append("bible_reader.db not 200 at /bible_app/app/assets/bible/")

    for loc in ("zh-Hant", "en", "vi", "id"):
        url = (
            f"{BASE}/bible_app/shell/pages/bible66.html"
            f"?book=43&chapter=3&locale={loc}&track=golden&gv=gv23"
        )
        if curl_code(url) != 200:
            errors.append(f"bible66 locale={loc} -> {curl_code(url)}")

    supply = f"{BASE}/bible_app/shell/pages/supply/prompt.html"
    if curl_code(supply) != 200:
        errors.append("supply/prompt.html not 200")

    if errors:
        print("FAIL locale smoke:", errors)
        return 1
    print("OK shell locale smoke (db + bible66 x4 + supply)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
