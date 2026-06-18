#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add nameVi / nameId to shell/data/books.json from helloao API."""
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOKS_PATH = ROOT / "shell" / "data" / "books.json"
API = "https://bible.helloao.org/api"


def book_names(tid: str) -> dict[int, str]:
    url = f"{API}/{tid}/books.json"
    raw = json.load(urllib.request.urlopen(url, timeout=60))
    out: dict[int, str] = {}
    for b in raw.get("books", []):
        order = int(b.get("order") or 0)
        if order:
            out[order] = b.get("commonName") or b.get("name") or ""
    return out


def main() -> None:
    vi = book_names("vie_1934")
    idn = book_names("ind_ayt")
    with open(BOOKS_PATH, encoding="utf-8") as f:
        data = json.load(f)
    for book in data.get("books", []):
        bid = book["id"]
        if bid in vi:
            book["nameVi"] = vi[bid]
        if bid in idn:
            book["nameId"] = idn[bid]
    with open(BOOKS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Updated {BOOKS_PATH.name} with nameVi/nameId")


if __name__ == "__main__":
    main()
