#!/usr/bin/env python3
"""HTTP smoke: shell URL canonicalization (requires serve on :3000)."""
import subprocess
import sys
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:3000"


def fetch(url: str, follow: bool = False) -> tuple[int, str]:
    req = urllib.request.Request(url, method="HEAD")
    if follow:
        # urllib follows redirects by default for urlopen
        pass
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return r.status, r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, url


def curl_final(url: str) -> tuple[int, str]:
    p = subprocess.run(
        ["curl.exe", "-s", "-o", "NUL", "-w", "%{http_code} %{url_effective}", "-L", "--max-redirs", "5", url],
        capture_output=True,
        text=True,
        timeout=15,
    )
    parts = (p.stdout or "").strip().rsplit(" ", 1)
    if len(parts) == 2 and parts[1].startswith("http"):
        return int(parts[0]), parts[1]
    return 0, url


def main() -> int:
    cases = [
        (f"{BASE}/bible_app/", f"{BASE}/bible_app/shell/index.html"),
        (f"{BASE}/bible_app", f"{BASE}/bible_app/shell/index.html"),
        (f"{BASE}/bible_app/shell", f"{BASE}/bible_app/shell/index.html"),
        (f"{BASE}/bible_app/shell/", f"{BASE}/bible_app/shell/index.html"),
        (f"{BASE}/bible_app/shell/index", f"{BASE}/bible_app/shell/index.html"),
        (f"{BASE}/bible_app/shell/index.html", f"{BASE}/bible_app/shell/index.html"),
    ]
    errors = []
    for start, expect_final in cases:
        code, final = curl_final(start)
        if code != 200:
            errors.append(f"{start} -> {code} (expected 200 at {expect_final})")
        elif not final.rstrip("/").endswith("index.html"):
            errors.append(f"{start} -> {final} (expected *index.html)")

    for path in (
        "/bible_app/shell/css/shell.css",
        "/bible_app/shell/js/shell_nav.js",
        "/bible_app/shell/pages/track-30day.html",
    ):
        url = BASE + path
        code, _ = fetch(url)
        if code != 200:
            errors.append(f"asset {path} -> {code}")

    if errors:
        print("FAIL shell URL smoke:", errors)
        return 1
    print("OK shell URL smoke (serve on :3000)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
