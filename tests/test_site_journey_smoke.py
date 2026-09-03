#!/usr/bin/env python3
"""Smoke checks: bible assets + hub paths (local SSOT + optional mirror)."""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIRROR = Path(os.environ.get("B100_CLOUD_MIRROR", r"C:\Users\hlche\.cursor\bible100_new_2"))
MIN_DB = 10 * 1024 * 1024
MIN_CLEAN_JSON = 3

REQUIRED = [
    "index_v5.html",
    "bible_app/shell/index.html",
    "bible_app/index.html",
    "bible_app/app/assets/bible/bible_reader.db",
    "bible_study/parallel_mode_v3.html",
    "js/b100_bible_track_nav.js",
    "bible_study/sidebar.html",
]

SQLJS = [
    "bible_app/shell/vendor/sqljs/sql-wasm.js",
    "bible_app/shell/vendor/sqljs/sql-wasm.wasm",
]

CLEAN_GLOBS = ["KJV.json", "NIV.json"]


def _check_root(base: Path, label: str) -> list[str]:
    fails: list[str] = []
    for rel in REQUIRED:
        p = base / rel.replace("/", os.sep)
        if not p.is_file():
            fails.append(f"{label}: missing file {rel}")
    db = base / "bible_app" / "app" / "assets" / "bible" / "bible_reader.db"
    bible_dir = db.parent
    manifest = bible_dir / "bible_reader.db.manifest.json"
    has_db = db.is_file() and db.stat().st_size >= MIN_DB
    has_parts = manifest.is_file() and any(bible_dir.glob("bible_reader.db.part*"))
    if not has_db and not has_parts:
        fails.append(f"{label}: need bible_reader.db (>={MIN_DB} B) OR manifest+parts")
    elif has_db and db.stat().st_size < MIN_DB:
        fails.append(f"{label}: bible_reader.db too small ({db.stat().st_size} B)")
    if has_parts and not manifest.is_file():
        fails.append(f"{label}: db parts without manifest.json")
    clean = base / "data" / "bibles" / "clean"
    if clean.is_dir():
        n = len(list(clean.glob("*.json")))
        if n < MIN_CLEAN_JSON:
            fails.append(f"{label}: data/bibles/clean has {n} json (need >={MIN_CLEAN_JSON})")
    else:
        fails.append(f"{label}: missing data/bibles/clean/")
    for rel in SQLJS:
        p = base / rel.replace("/", os.sep)
        if not p.is_file():
            fails.append(f"{label}: missing {rel}")
    sidebar = (base / "bible_study" / "sidebar.html").read_text(encoding="utf-8", errors="replace")
    if "b100_bible_track_nav.js" not in sidebar:
        fails.append(f"{label}: sidebar missing b100_bible_track_nav.js")
    if "B100BibleTrackNav.openFull" not in sidebar:
        fails.append(f"{label}: sidebar missing openFull handler")
    pack = (base / "config" / "ftp_cloud_align_pack.txt").read_text(encoding="utf-8", errors="replace")
    for needle in ["bible_app/app/assets/bible/", "data/bibles/clean/"]:
        if needle not in pack:
            fails.append(f"{label}: ftp_cloud_align_pack missing {needle}")
    return fails


def test_site_journey_smoke() -> None:
    fails = _check_root(ROOT, "SSOT")
    if MIRROR.is_dir():
        fails.extend(_check_root(MIRROR, "mirror"))
    if fails:
        raise AssertionError("Site journey smoke failed:\n" + "\n".join(fails))


if __name__ == "__main__":
    try:
        test_site_journey_smoke()
        print("PASS: site journey smoke")
    except AssertionError as e:
        print(e, file=sys.stderr)
        sys.exit(1)
