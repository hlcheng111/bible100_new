#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
18 live 工具 — 一條命令全綠/全紅。

Run: python tests/test_all_live_tools_smoke.py

串跑：
  · registry SSOT（18 工具檔案存在）
  · governance 4-Tab + coaching 契約
  · 各 pack 煙測 + matchmaker + nav UI 契約
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "church_planning"
REGISTRY = PLAN / "js" / "planning_tool_registry.js"

# 子測試腳本（順序：契約 → pack 煙測 → nav）
SUBTESTS: tuple[tuple[str, str], ...] = (
    ("strategic chain integrity (4 links)", "tests/test_strategic_chain_integrity.py"),
    ("governance + coaching 4-Tab", "tests/test_assessment_4tab_shell.py"),
    ("urgency pack", "tests/test_urgency_pack.py"),
    ("spiritual pack", "tests/test_spiritual_pack.py"),
    ("pastoral pack", "tests/test_pastoral_pack.py"),
    ("smart pack", "tests/test_smart_pack.py"),
    ("culture pack", "tests/test_culture_pack.py"),
    ("kpi pack", "tests/test_kpi_pack.py"),
    ("80/20 pack", "tests/test_eightytwenty_pack.py"),
    ("ncd pack", "tests/test_ncd_pack.py"),
    ("pdca pack", "tests/test_pdca_pack.py"),
    ("swot matrix", "tests/test_swot_matrix.py"),
    ("gift packs (6)", "tests/test_gift_packs_smoke.py"),
    ("alda pack", "tests/test_alda_pack.py"),
    ("matchmaker core", "tests/test_matchmaker_core.py"),
    ("church nav UI contract", "tests/test_church_nav_ui_contract.py"),
)

EXPECTED_LIVE_TOOL_COUNT = 18


def parse_registry_live_tools() -> list[tuple[str, str]]:
    text = REGISTRY.read_text(encoding="utf-8")
    tools: list[tuple[str, str]] = []
    for part in re.split(r'\{\s*id:\s*"', text)[1:]:
        id_m = re.match(r'([^"]+)"', part)
        if not id_m:
            continue
        tool_id = id_m.group(1)
        if 'status: "live"' not in part and "status: 'live'" not in part:
            continue
        pm = re.search(r'path:\s*"([^"]+)"', part)
        if not pm:
            continue
        tools.append((tool_id, pm.group(1)))
    return tools


def assert_registry_ssot() -> list[str]:
    errors: list[str] = []
    if not REGISTRY.is_file():
        return ["missing planning_tool_registry.js"]

    live = parse_registry_live_tools()
    if len(live) != EXPECTED_LIVE_TOOL_COUNT:
        errors.append(
            f"registry live tool count: expected {EXPECTED_LIVE_TOOL_COUNT}, got {len(live)} "
            f"({', '.join(t[0] for t in live)})"
        )

    seen_ids: set[str] = set()
    for tool_id, rel in live:
        if tool_id in seen_ids:
            errors.append(f"duplicate registry id: {tool_id!r}")
        seen_ids.add(tool_id)
        target = PLAN / rel
        if not target.is_file():
            errors.append(f"registry {tool_id!r} → missing file {rel!r}")

    return errors


def run_subtest(label: str, rel: str) -> tuple[bool, str]:
    script = REPO / rel
    if not script.is_file():
        return False, f"missing script {rel}"
    proc = subprocess.run(
        [sys.executable, str(script)],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode == 0:
        line = (proc.stdout or "").strip().splitlines()
        detail = line[-1] if line else "OK"
        return True, detail
    err = (proc.stderr or proc.stdout or "").strip()
    tail = err.splitlines()[-3:] if err else ["non-zero exit"]
    return False, "; ".join(tail)


def main() -> int:
    failures: list[str] = []

    print("=== 18 live tools smoke ===\n")

    reg_errors = assert_registry_ssot()
    if reg_errors:
        failures.extend(reg_errors)
        print("FAIL: registry SSOT")
        for e in reg_errors:
            print(f"  · {e}")
    else:
        print(f"OK: registry SSOT — {EXPECTED_LIVE_TOOL_COUNT} live tools, all files on disk")

    print()
    passed = 0
    for label, rel in SUBTESTS:
        ok, detail = run_subtest(label, rel)
        if ok:
            passed += 1
            print(f"OK  [{label}]")
        else:
            failures.append(f"{label}: {detail}")
            print(f"FAIL [{label}]")
            print(f"      {detail}")

    print()
    total = len(SUBTESTS)
    if failures:
        print(f"RESULT: FAIL — {passed}/{total} subtests passed; {len(failures)} blocker(s)", file=sys.stderr)
        for f in failures:
            print(f"  · {f}", file=sys.stderr)
        return 1

    print(
        f"RESULT: OK — registry {EXPECTED_LIVE_TOOL_COUNT} tools + "
        f"{total}/{total} subtests green (one command acceptance)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
