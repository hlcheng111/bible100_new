#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
教会事工互联包 · 一条命令跑全 tier

Checklist 对应：
  tier1 — A 三角导航 + B 连结扫描 + nav UI 契约（导航层）
  tier2 — C 战略链 + CRM Bridge（资料／行为桥）
  tier3 — D 恩赐媒合链 + 18 live tools smoke（planning 侧）
  tier4 — E 全站模式完整性（圣经研读 / AI Lab / 学校 / nav_hub / 工具总览）
  tier5 — P3 CRM UI 行为锁

Run:
  python tests/test_church_interconnect_smoke.py           # tier 1-5
  python tests/test_church_interconnect_smoke.py --tier 4 # P2 全站 E
  python tests/test_church_interconnect_smoke.py --tier 5 # P3 CRM UI
  python tests/test_church_interconnect_smoke.py --tier all
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

TIERS: dict[str, tuple[str, tuple[str, ...]]] = {
    "1": (
        "nav+links (A triangle + B link scan + UI contract)",
        (
            "tests/test_church_triangle_nav.py",
            "tests/test_church_ministry_link_scan.py",
            "tests/test_church_nav_ui_contract.py",
        ),
    ),
    "2": (
        "data/behavior bridge (C)",
        (
            "tests/test_strategic_chain_integrity.py",
            "tests/test_church_crm_bridge.py",
        ),
    ),
    "3": (
        "gift/match chain (D planning)",
        (
            "tests/test_ministry_path_bridge.py",
            "tests/test_all_live_tools_smoke.py",
        ),
    ),
    "4": (
        "site E modes integrity (study / AI / school / nav_hub / tools)",
        ("tests/test_site_modes_integrity.py",),
    ),
    "5": (
        "CRM UI behavior lock (P3)",
        ("tests/test_church_crm_ui_contract.py",),
    ),
}


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
        lines = (proc.stdout or "").strip().splitlines()
        detail = lines[-1] if lines else "OK"
        return True, detail
    err = (proc.stderr or proc.stdout or "").strip()
    tail = err.splitlines()[-3:] if err else ["non-zero exit"]
    return False, "; ".join(tail)


def tier_keys(selected: str) -> list[str]:
    if selected == "all":
        return ["1", "2", "3", "4", "5"]
    return [selected]


def main() -> int:
    parser = argparse.ArgumentParser(description="Church ministry interconnect smoke")
    parser.add_argument(
        "--tier",
        choices=["1", "2", "3", "4", "5", "all"],
        default="all",
        help="tier1=nav+links, tier2=bridge C, tier3=gift D, tier4=site E, tier5=CRM UI, all=1-5",
    )
    args = parser.parse_args()

    failures: list[str] = []
    passed = 0
    total = 0

    print("=== Church interconnect smoke ===\n")
    for key in tier_keys(args.tier):
        title, scripts = TIERS[key]
        print(f"--- Tier {key}: {title} ---", flush=True)
        for rel in scripts:
            total += 1
            ok, detail = run_subtest(rel, rel)
            short = Path(rel).name
            if ok:
                passed += 1
                print(f"OK  [{short}]")
            else:
                failures.append(f"tier{key}/{short}: {detail}")
                print(f"FAIL [{short}]")
                safe = detail.encode("ascii", errors="replace").decode("ascii")
                print(f"      {safe}")
        print()

    if failures:
        print(
            f"RESULT: FAIL — {passed}/{total} subtests passed; "
            f"{len(failures)} blocker(s)",
            file=sys.stderr,
        )
        for f in failures:
            print(f"  · {f}", file=sys.stderr)
        return 1

    scope = args.tier if args.tier != "all" else "1+2+3+4+5"
    print(
        f"RESULT: OK — church interconnect tier {scope}: "
        f"{passed}/{total} subtests green."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
