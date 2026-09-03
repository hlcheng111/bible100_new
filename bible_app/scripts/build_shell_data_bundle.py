#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rebuild shell/js/data_bundle.js from shell/data/*.json"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "shell" / "data"
OUT = ROOT / "shell" / "js" / "data_bundle.js"

KEY_MAP = {
    "thirty_day_plan.json": "thirtyDay",
    "golden_verses_100.json": "golden",
    "thematic_readings.json": "thematic",
    "books.json": "books",
    "sample_bible.json": "sample",
    "reading_tracks_manifest.json": "tracksManifest",
}


def main() -> None:
    bundle: dict = {}
    for filename, key in KEY_MAP.items():
        path = DATA / filename
        if not path.is_file():
            raise SystemExit(f"missing {path}")
        bundle[key] = json.loads(path.read_text(encoding="utf-8"))

    OUT.write_text(
        "window.B100_DATA = " + json.dumps(bundle, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
