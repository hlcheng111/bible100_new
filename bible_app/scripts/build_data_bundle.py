#!/usr/bin/env python3
"""Embed shell/data/*.json into shell/js/data_bundle.js for file:// fallback."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "shell" / "data"
OUT = ROOT / "shell" / "js" / "data_bundle.js"

KEY_MAP = {
    "thirty_day_plan.json": "thirtyDay",
    "golden_verses_100.json": "golden",
    "thematic_readings.json": "thematic",
    "books.json": "books",
    "sample_bible.json": "sample",
    "reading_tracks_manifest.json": "tracksManifest",
    "one_year_plan.json": "plan1y",
    "three_year_plan.json": "plan3y",
    "lectionary_plan.json": "lectionary",
}


def main():
    bundle = {}
    for fname, key in KEY_MAP.items():
        path = DATA / fname
        if path.exists():
            bundle[key] = json.loads(path.read_text(encoding="utf-8"))
    lines = ["/* Auto-generated — run bible_app/scripts/build_data_bundle.py */"]
    lines.append("window.B100_DATA = " + json.dumps(bundle, ensure_ascii=False, separators=(",", ":")) + ";")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(bundle)} keys)")


if __name__ == "__main__":
    main()
