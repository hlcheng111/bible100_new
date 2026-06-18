#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Download Bible translations from Free Use Bible API (helloao) → clean JSON."""
from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = ROOT.parent
OUT_DIR = REPO_ROOT / "data" / "bibles" / "clean"
API = "https://bible.helloao.org/api"

TRANSLATIONS = {
    "vie_1934": "越南聖經1934.json",
    "ind_ayt": "印尼AYT.json",
}


def flatten_content(parts) -> str:
    """Turn helloao verse content blocks into plain text."""
    bits: list[str] = []

    def walk(item):
        if item is None:
            return
        if isinstance(item, str):
            s = item.strip()
            if s:
                bits.append(s)
        elif isinstance(item, dict):
            if item.get("lineBreak"):
                return
            if "text" in item and isinstance(item["text"], str):
                walk(item["text"])
            elif "content" in item:
                walk(item["content"])
        elif isinstance(item, list):
            for x in item:
                walk(x)

    walk(parts)
    return " ".join(bits).replace("  ", " ").strip()


def parse_complete(raw: dict) -> tuple[dict, list[dict]]:
    meta = raw.get("translation", {})
    rows: list[dict] = []
    for book in raw.get("books", []):
        b = int(book.get("order") or 0)
        if b < 1:
            continue
        for ch_wrap in book.get("chapters", []):
            ch_obj = ch_wrap.get("chapter", ch_wrap)
            c = int(ch_obj.get("number") or 0)
            if c < 1:
                continue
            for block in ch_obj.get("content", []):
                if block.get("type") != "verse":
                    continue
                v = int(block.get("number") or 0)
                if v < 1:
                    continue
                text = flatten_content(block.get("content", []))
                if text:
                    rows.append({"b": b, "c": c, "v": v, "t": text})
    return meta, rows


def fetch_translation(tid: str) -> dict:
    url = f"{API}/{tid}/complete.json"
    print(f"Fetching {url} …", flush=True)
    with urllib.request.urlopen(url, timeout=300) as resp:
        return json.load(resp)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for tid, fname in TRANSLATIONS.items():
        raw = fetch_translation(tid)
        meta, rows = parse_complete(raw)
        out = {
            "version": tid,
            "name": meta.get("name", tid),
            "licenseUrl": meta.get("licenseUrl", ""),
            "source": API,
            "data": rows,
        }
        path = OUT_DIR / fname
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=0)
        print(f"Wrote {path.name}: {len(rows)} verses ({meta.get('name')})", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
