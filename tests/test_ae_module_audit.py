#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""A–E 模組總檢產物存在且側欄 href 可解析（靜態 file:// 基準）。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCRIPT = REPO / "scripts" / "audit_ae_modules.py"
JSON_OUT = REPO / "church_ministry" / "audit" / "ae_audit_data.json"
HTML_OUT = REPO / "church_ministry" / "audit" / "ae_module_audit_dashboard.html"
MD_OUT = REPO / "church_ministry" / "docs" / "AE_MODULE_AUDIT_REPORT.md"


def main() -> int:
    errors: list[str] = []
    if not SCRIPT.is_file():
        errors.append("missing scripts/audit_ae_modules.py")
        return 1

    proc = subprocess.run(
        [sys.executable, str(SCRIPT)],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0:
        errors.append(f"audit script failed: {proc.stderr or proc.stdout}")
    for p in (JSON_OUT, HTML_OUT, MD_OUT):
        if not p.is_file():
            errors.append(f"missing output {p.name}")

    if JSON_OUT.is_file():
        data = json.loads(JSON_OUT.read_text(encoding="utf-8"))
        rows = data.get("rows") or []
        if len(rows) < 50:
            errors.append(f"expected >=50 audit rows, got {len(rows)}")
        broken = [r for r in rows if r.get("link_verdict") == "broken"]
        if broken:
            errors.append(f"{len(broken)} broken sidebar links")
        zones = {r.get("zone") for r in rows}
        for z in ("a", "b", "c", "d", "e"):
            if z not in zones:
                errors.append(f"no rows for zone {z}")
        worship = [r for r in rows if r.get("zone") == "a" and r.get("source") == "layout_v1"]
        paths = {r.get("path_rel") for r in worship if r.get("path_rel")}
        if len(paths) < 10:
            errors.append("A worship layout should list many distinct paths")

    if errors:
        for e in errors:
            print(f"FAIL: {e}")
        return 1
    print("OK: AE module audit dashboard + markdown + 0 broken layout links.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
