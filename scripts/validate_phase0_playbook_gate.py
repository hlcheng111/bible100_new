#!/usr/bin/env python3
"""Validate Phase0 playbook gate.

Checks:
1) Auto-detect max P0 id and ensure rows are contiguous from P0-001..P0-max
2) Next column is path-like and not Y/N/待補
3) Section 6 key decisions exist
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "docs" / "PHASE0_INVENTORY_CHECKLIST.md"

INVALID_NEXT = {"Y", "N", "待補", "", "`Y`", "`N`", "`待補`"}
REQUIRED_DECISIONS = [
    "spiritual_app/index.html",
    "longTermPlanning_*",
    "Smart Ministry 問卷入口",
]


def parse_table_row(line: str) -> list[str]:
    parts = [p.strip() for p in line.strip().split("|")]
    if len(parts) < 3:
        return []
    return parts[1:-1]


def extract_next_value(cols: list[str]) -> str:
    # Header columns:
    # ID, Path, 名稱, 類型, 主線, 儲存鍵, 手冊, L1, L2, L3, Next, PDF, 匯出, 狀態
    if len(cols) < 14:
        return ""
    return cols[10].strip()


def is_path_like(v: str) -> bool:
    vv = v.strip().strip("`")
    if vv in INVALID_NEXT:
        return False
    return "/" in vv and vv.endswith(".html")


def main() -> int:
    if not TARGET.is_file():
        print(f"Missing file: {TARGET}")
        return 2

    text = TARGET.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()

    found = {}
    errors = []
    id_numbers: list[int] = []

    for line in lines:
        if not line.strip().startswith("| P0-"):
            continue
        cols = parse_table_row(line)
        if not cols:
            continue
        # Skip non-main-table rows (e.g., section 4 supplement table).
        if len(cols) < 14:
            continue
        pid = cols[0].strip()
        m = re.match(r"^P0-(\d{3})$", pid)
        if not m:
            continue
        idx = int(m.group(1))
        id_numbers.append(idx)
        nxt = extract_next_value(cols)
        found[pid] = nxt
        if not is_path_like(nxt):
            errors.append(f"{pid}: invalid Next value -> {nxt}")

    if not id_numbers:
        errors.append("No P0 rows found in main table")
    else:
        max_id = max(id_numbers)
        expected = list(range(1, max_id + 1))
        missing = [i for i in expected if i not in id_numbers]
        if missing:
            for i in missing:
                errors.append(f"Missing row: P0-{i:03d}")

    for key in REQUIRED_DECISIONS:
        if key not in text:
            errors.append(f"Missing decision entry keyword: {key}")

    if errors:
        print("PHASE0 gate FAILED")
        for e in errors:
            print(f"- {e}")
        return 1

    print("PHASE0 gate PASSED")
    print(f"Checked rows: {len(found)}")
    if id_numbers:
        print(f"Max ID: P0-{max(id_numbers):03d}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
