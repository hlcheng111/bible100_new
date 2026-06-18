#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "packages" / "core" / "data" / "kids_youth_content.json"


def main():
    assert DATA.exists(), DATA
    data = json.loads(DATA.read_text(encoding="utf-8"))
    assert data["schema"] == "kids_youth_content"
    kids = [u for u in data["units"] if u["track"] == "kids_story"]
    youth = [u for u in data["units"] if u["track"] == "youth_quest"]
    assert len(kids) == 20, len(kids)
    assert len(youth) == 15, len(youth)
    for u in data["units"]:
        assert u.get("storyZh") and u.get("game") and u.get("sticker")
    print("OK kids_youth:", len(kids), "+", len(youth))
    return 0


if __name__ == "__main__":
    sys.exit(main())
