#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Bundle shell/data/*.json into data_bundle.js for file:// offline use."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "shell" / "data"
OUT = ROOT / "shell" / "js" / "data_bundle.js"

FILES = {
    "thirtyDay": "thirty_day_plan.json",
    "golden": "golden_verses_100.json",
    "thematic": "thematic_readings.json",
    "books": "books.json",
    "sample": "sample_bible.json",
}


def main() -> None:
    bundle = {}
    for key, fname in FILES.items():
        path = DATA / fname
        with open(path, encoding="utf-8") as f:
            bundle[key] = json.load(f)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Auto-generated — run scripts/build_data_bundle.py */\n")
        f.write("window.B100_DATA = ")
        json.dump(bundle, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print(f"Wrote {OUT.name} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
