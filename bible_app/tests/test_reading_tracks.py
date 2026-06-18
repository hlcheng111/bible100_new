#!/usr/bin/env python3
"""Validate reading_tracks.json structure."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TRACKS = ROOT / "packages" / "core" / "data" / "reading_tracks.json"


def main():
    assert TRACKS.exists(), f"Missing {TRACKS}"
    data = json.loads(TRACKS.read_text(encoding="utf-8"))
    assert data["schema"] == "reading_tracks"
    ids = [t["id"] for t in data["tracks"]]
    assert ids == ["ot_front", "ot_back", "nt"]
    for t in data["tracks"]:
        assert t["unitCount"] == len(t["units"])
        for u in t["units"][:3]:
            assert u["unitId"].startswith(t["id"])
    print("OK reading_tracks:", data["totalUnits"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
