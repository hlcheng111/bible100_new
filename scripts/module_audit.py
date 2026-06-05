#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""分析 bible100_new 模組結構與輸出入口清單。"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parent.parent
EXCLUDE_DIRS = {"archive", "backups", "temp_test", "tests", "languages/templates"}


def is_excluded(path: Path) -> bool:
    for part in path.parts:
        if part in EXCLUDE_DIRS:
            return True
    if "languages" in path.parts and path.parts[-2:] == ("languages", "templates"):
        return True
    return False


def gather_index_pages(root: Path) -> List[Dict[str, str]]:
    pages = []
    for path in sorted(root.rglob("index*.html")):
        rel = str(path.relative_to(root)).replace("\\", "/")
        if is_excluded(path):
            continue
        pages.append({"rel_path": rel, "size": str(path.stat().st_size)})
    return pages


def gather_top_modules(root: Path) -> List[str]:
    names = []
    for child in sorted(root.iterdir()):
        if child.is_dir() and child.name not in {"archive", "backups", "temp_test", "tests"}:
            names.append(child.name)
    return names


def analyze_duplicates(root: Path) -> List[str]:
    duplicates = []
    for path in root.rglob("*.html"):
        if path.name == "index_v5.html":
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if text.count("@supabase/supabase-js@2") > 1:
            duplicates.append(str(path.relative_to(root)).replace("\\", "/"))
    return duplicates


def main() -> int:
    report = {
        "root": str(ROOT),
        "top_modules": gather_top_modules(ROOT),
        "index_pages": gather_index_pages(ROOT),
        "supabase_duplication_candidates": analyze_duplicates(ROOT),
    }
    out_path = ROOT / "module_audit_report.json"
    out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote module audit report to {out_path}")
    print(f"Top modules: {len(report['top_modules'])}")
    print(f"Index pages: {len(report['index_pages'])}")
    print(f"Supabase duplicates: {len(report['supabase_duplication_candidates'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
