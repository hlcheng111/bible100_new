#!/usr/bin/env python3
"""Verify golden verses have vi/id ref and tag metadata."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GOLDEN = ROOT / "shell" / "data" / "golden_verses_100.json"
REQUIRED_VERSE_KEYS = ("refVi", "refId", "tagVi", "tagId")
REQUIRED_ROOT_KEYS = ("nameVi", "nameId")


def main() -> int:
    errors = []
    if not GOLDEN.exists():
        print("FAIL: missing", GOLDEN)
        return 1
    data = json.loads(GOLDEN.read_text(encoding="utf-8"))
    verses = data.get("verses", [])
    if len(verses) != 40:
        errors.append(f"expected 40 verses, got {len(verses)}")
    for key in REQUIRED_ROOT_KEYS:
        if not data.get(key):
            errors.append(f"missing root {key}")
    for v in verses:
        vid = v.get("id", "?")
        for key in REQUIRED_VERSE_KEYS:
            val = v.get(key)
            if not val or not str(val).strip():
                errors.append(f"{vid} missing {key}")
    bundle = ROOT / "shell" / "js" / "data_bundle.js"
    if bundle.exists():
        text = bundle.read_text(encoding="utf-8")
        if "refVi" not in text or "tagId" not in text:
            errors.append("data_bundle.js missing golden vi/id fields")
    else:
        errors.append("missing data_bundle.js")
    tg = ROOT / "shell" / "js" / "track_golden.js"
    if tg.exists():
        t = tg.read_text(encoding="utf-8")
        if "B100LocalePick" not in t or "pickRef" not in t:
            errors.append("track_golden.js must use B100LocalePick.pickRef")
        if "btn-track" not in t:
            errors.append("track_golden.js must use btn-track big buttons")
    if errors:
        print("FAIL:", errors)
        return 1
    print("OK golden i18n (40 verses, refVi/refId/tagVi/tagId)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
