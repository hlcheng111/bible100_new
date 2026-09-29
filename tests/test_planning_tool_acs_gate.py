#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
教會規劃 18 live 工具 · ACS 守门（P0 文案 / pack RunStore / report-heart）

Run: python tests/test_planning_tool_acs_gate.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "church_planning"
REGISTRY = PLAN / "js" / "planning_tool_registry.js"
PACK_DIR = PLAN / "js" / "tool_packs"
GOLD_JS = PLAN / "js" / "acs_report_gold.js"
PHASE_CFG = PLAN / "js" / "planning_phase_config.js"

EXPECTED_LIVE = (
    "spiritual", "pastoral", "ncd", "shape", "competency", "alda", "matchmaker",
    "ministry8020", "urgent", "smart", "pdca", "kpiokr", "johari", "disc", "mbti",
    "swot", "culture", "raci",
)

TAB_LABELS = ("① 理念與說明", "② 開始測評", "③ 分析報告", "④ 輔導員手冊")
PRIMARY_BTN = "進入測評"
DEMO_MARKERS = ("先看示範報告", "loadDemoReport", "data-b100-demo")
CHARTER_EXEMPT = {"raci"}

PACK_FILE = {
    "urgent": "urgency_pack.js",
    "ministry8020": "eightytwenty_pack.js",
    "kpiokr": "kpi_pack.js",
}


def registry_paths() -> dict[str, str]:
    text = REGISTRY.read_text(encoding="utf-8")
    # 只解析 TOOLS 数组（EXTENDED 之前）
    tools_block = text.split("var EXTENDED")[0]
    out: dict[str, str] = {}
    for tid in EXPECTED_LIVE:
        m = re.search(
            rf'\{{\s*id:\s*"{re.escape(tid)}"[^}}]*path:\s*"([^"]+)"',
            tools_block,
            re.DOTALL,
        )
        if m:
            out[tid] = m.group(1)
    return out


def pack_file_for(tool_id: str) -> Path | None:
    name = PACK_FILE.get(tool_id, f"{tool_id}_pack.js")
    p = PACK_DIR / name
    return p if p.is_file() else None


def scan_page(tool_id: str, rel: str, errors: list[str], warns: list[str]) -> None:
    p = PLAN / rel
    if not p.is_file():
        errors.append(f"{tool_id}: missing file {rel}")
        return
    text = p.read_text(encoding="utf-8")

    if not any(m in text for m in DEMO_MARKERS):
        if tool_id not in CHARTER_EXEMPT:
            errors.append(f"{tool_id}: no demo entry")

    for label in TAB_LABELS:
        if label not in text:
            warns.append(f"{tool_id}: missing tab label «{label}»")

    if PRIMARY_BTN not in text:
        warns.append(f"{tool_id}: missing «{PRIMARY_BTN}»")

    if tool_id in ("urgent", "culture", "smart", "kpiokr", "pdca", "ncd"):
        if "acs_report_gold.js" not in text:
            warns.append(f"{tool_id}: acs_report_gold.js not in HTML")

    if rel.startswith("Church_Governance_"):
        for tid in ("intro", "survey", "report", "methodology"):
            if f"strategic-tab-{tid}" not in text and f'data-strategic-tab="{tid}"' not in text:
                warns.append(f"{tool_id}: missing strategic tab {tid}")

    if tool_id == "raci" and "chp2026-raci" not in text and "RaciReflection" not in text:
        warns.append(f"{tool_id}: raci storage contract not visible")


def scan_pack(tool_id: str, errors: list[str], warns: list[str]) -> None:
    if tool_id in CHARTER_EXEMPT | {"matchmaker"}:
        return
    pf = pack_file_for(tool_id)
    if not pf:
        warns.append(f"{tool_id}: pack file not found")
        return
    m = re.search(r'var\s+TOOL_ID\s*=\s*"([^"]+)"', pf.read_text(encoding="utf-8"))
    if not m:
        warns.append(f"{tool_id}: pack missing TOOL_ID")
        return
    pid = m.group(1)
    if tool_id == "kpiokr" and pid != "kpiokr":
        errors.append(f"kpiokr: pack TOOL_ID={pid!r}")
    elif tool_id not in ("kpiokr", "urgent", "ministry8020") and pid != tool_id:
        errors.append(f"{tool_id}: pack TOOL_ID={pid!r} != {tool_id!r}")


def main() -> int:
    errors: list[str] = []
    warns: list[str] = []

    paths = registry_paths()
    if len(paths) != len(EXPECTED_LIVE):
        missing = set(EXPECTED_LIVE) - set(paths.keys())
        errors.append(f"registry paths incomplete: missing {sorted(missing)}")

    gold = GOLD_JS.read_text(encoding="utf-8") if GOLD_JS.is_file() else ""
    if "mountAfterSummary" not in gold:
        errors.append("acs_report_gold.js: missing mountAfterSummary")

    cfg = PHASE_CFG.read_text(encoding="utf-8") if PHASE_CFG.is_file() else ""
    for tid in ("urgent", "culture", "ministry8020", "disc", "mbti", "matchmaker"):
        if f"{tid}:" not in cfg:
            warns.append(f"POST_COMPLETE_CTA: no explicit {tid}")

    for tid in EXPECTED_LIVE:
        rel = paths.get(tid)
        if rel:
            scan_page(tid, rel, errors, warns)
            scan_pack(tid, errors, warns)

    print("=== planning tool ACS gate ===\n")
    print(f"Tools: {len(paths)}/{len(EXPECTED_LIVE)}")

    if warns:
        print(f"\nWARN ({len(warns)}):")
        for w in warns:
            line = f"  - {w}"
            try:
                print(line)
            except UnicodeEncodeError:
                print(line.encode("ascii", "replace").decode("ascii"))

    if errors:
        print(f"\nFAIL ({len(errors)}):", file=sys.stderr)
        for e in errors:
            try:
                print(f"  - {e}", file=sys.stderr)
            except UnicodeEncodeError:
                print(f"  - {e}".encode("ascii", "replace").decode("ascii"), file=sys.stderr)
        return 1

    print(f"\nRESULT: OK — 0 blockers, {len(warns)} warn(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
