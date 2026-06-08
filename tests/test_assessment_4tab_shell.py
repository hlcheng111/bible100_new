#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
戰略 ACS 四 Tab 硬化契約 — 一條命令全綠/全紅。

主門檻：registry 指向的 Church_Governance_* 主檔（目前 9 個）須具備：
  · 四個 strategic-tab 面板（intro / survey / report / methodology）
  · assessment_run_store + assessment_coaching_shell
  · 示範入口（loadDemoReport 或 data-b100-demo）
  · Tab 保命 boot（unified_boot 或 inline __b100SwitchTab 或 strategic_hybrid_shell）

次門檻（同命令一併跑）：恩賜 CoachingDesk 七頁 ①②③④ 硬寫契約。
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "church_planning"
REGISTRY = PLAN / "js" / "planning_tool_registry.js"

TAB_IDS = ("intro", "survey", "report", "methodology")

# registry SSOT：path 必須以 Church_Governance_ 開頭的 live 工具
REGISTRY_GOVERNANCE_IDS = (
    "spiritual",
    "pastoral",
    "urgent",
    "smart",
    "pdca",
    "kpiokr",
    "swot",
    "culture",
    "ministry8020",
)

COACHING_PAGES = (
    "shape-gifts-assessment.html",
    "ministry-competency-assessment.html",
    "alda-leadership-assessment.html",
    "ministry-position-matchmaker.html",
    "johari-window-assessment.html",
    "disc-profile-assessment.html",
    "mbti-self-awareness.html",
)

REDIRECT_PAIRS = (
    ("important-urgent-matrix.html", "Church_Governance_urgent_matrix.html"),
    ("smart-assessment.html", "Church_Governance_SMART_goals.html"),
    ("culture-alignment-assessment.html", "Church_Governance_Culture_radar.html"),
    ("kpi-okr-alignment.html", "Church_Governance_KPI_alignment.html"),
    ("ministry-8020-planning.html", "Church_Governance_8020_focus.html"),
    ("pdca-planning.html", "Church_Governance_PDCA_cycle.html"),
    ("swot-planning.html", "Church_Governance_SWOT_matrix.html"),
    ("信徒靈性生命健康自我審查.html", "Church_Governance_spiritual_health.html"),
)

COACHING_TAB_MARKERS = ("①", "②", "③", "④")
HARDEN_ATTR = 'data-acs-hardcoded="true"'


class ContractError(Exception):
    pass


def _fail(msg: str) -> None:
    print(f"FAIL: {msg}", file=sys.stderr)
    sys.exit(1)


def registry_governance_paths() -> dict[str, str]:
    text = REGISTRY.read_text(encoding="utf-8")
    out: dict[str, str] = {}
    for tool_id in REGISTRY_GOVERNANCE_IDS:
        m = re.search(
            rf'\{{\s*id:\s*"{re.escape(tool_id)}"[^}}]*path:\s*"([^"]+)"',
            text,
            re.DOTALL,
        )
        if not m:
            raise ContractError(f"registry missing tool id {tool_id}")
        path = m.group(1)
        if not path.startswith("Church_Governance_"):
            raise ContractError(f"registry {tool_id} path must be Church_Governance_* got {path}")
        out[tool_id] = path
    return out


def discover_governance_html() -> list[Path]:
    return sorted(PLAN.glob("Church_Governance_*.html"))


def assert_governance_acs(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    name = path.name

    for tid in TAB_IDS:
        if f'id="strategic-tab-{tid}"' not in text:
            raise ContractError(f"{name}: missing panel strategic-tab-{tid}")
        if f'data-strategic-tab="{tid}"' not in text:
            raise ContractError(f"{name}: missing nav data-strategic-tab={tid}")

    for req in ("assessment_run_store.js", "css/assessment_coaching_shell.css"):
        if req not in text:
            raise ContractError(f"{name}: missing {req}")

    if "loadDemoReport" not in text and "data-b100-demo" not in text:
        raise ContractError(f"{name}: missing demo entry (loadDemoReport or data-b100-demo)")

    has_boot = any(
        token in text
        for token in (
            "strategic_acs_unified_boot.js",
            "__b100SwitchTab",
            "strategic_hybrid_shell.js",
        )
    )
    if not has_boot:
        raise ContractError(f"{name}: missing tab survival boot")

    if 'data-strategic-default="intro"' not in text and 'data-strategic-default=\'intro\'' not in text:
        raise ContractError(f"{name}: missing data-strategic-default=intro on body")

    for forbidden in ("Church OS 5F", "CTA-OS"):
        if forbidden in text:
            raise ContractError(f"{name}: forbidden label {forbidden}")


def assert_coaching_shell(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    name = path.name
    for m in COACHING_TAB_MARKERS:
        if m not in text:
            raise ContractError(f"{name}: missing tab marker {m}")
    if HARDEN_ATTR not in text:
        raise ContractError(f"{name}: missing {HARDEN_ATTR}")
    if 'data-acs-tab="intro"' not in text:
        raise ContractError(f"{name}: missing data-acs-tab buttons")


def assert_redirect(old_name: str, new_name: str) -> None:
    old = PLAN / old_name
    if not old.is_file():
        raise ContractError(f"redirect stub missing: {old_name}")
    text = old.read_text(encoding="utf-8")
    if new_name not in text:
        raise ContractError(f"{old_name} must redirect/link to {new_name}")


def main() -> None:
    errors: list[str] = []

    try:
        reg_paths = registry_governance_paths()
    except ContractError as e:
        _fail(str(e))

    discovered = discover_governance_html()
    discovered_names = {p.name for p in discovered}
    expected_names = set(reg_paths.values())

    if discovered_names != expected_names:
        missing = expected_names - discovered_names
        extra = discovered_names - expected_names
        if missing:
            errors.append(f"disk missing governance files: {sorted(missing)}")
        if extra:
            errors.append(f"unexpected Church_Governance_* on disk: {sorted(extra)}")

    for tool_id, rel in sorted(reg_paths.items()):
        p = PLAN / rel
        if not p.is_file():
            errors.append(f"{rel}: file missing (registry id={tool_id})")
            continue
        try:
            assert_governance_acs(p)
        except ContractError as e:
            errors.append(str(e))

    for old, new in REDIRECT_PAIRS:
        try:
            assert_redirect(old, new)
        except ContractError as e:
            errors.append(str(e))

    coaching_errors: list[str] = []
    for name in COACHING_PAGES:
        p = PLAN / name
        if not p.is_file():
            coaching_errors.append(f"missing coaching page {name}")
            continue
        try:
            assert_coaching_shell(p)
        except ContractError as e:
            coaching_errors.append(str(e))

    if errors:
        for e in errors:
            print(f"  {e}", file=sys.stderr)
        _fail(
            "governance ACS contract broken (%d issue(s); %d Church_Governance_* expected)"
            % (len(errors), len(REGISTRY_GOVERNANCE_IDS))
        )

    if coaching_errors:
        for e in coaching_errors:
            print(f"  [coaching] {e}", file=sys.stderr)
        _fail("coaching 4-tab contract broken (%d issue(s))" % len(coaching_errors))

    print(
        "OK: governance ACS shell — %d/%d Church_Governance_* pages pass; "
        "%d redirects OK; %d coaching pages pass."
        % (
            len(REGISTRY_GOVERNANCE_IDS),
            len(REGISTRY_GOVERNANCE_IDS),
            len(REDIRECT_PAIRS),
            len(COACHING_PAGES),
        )
    )


if __name__ == "__main__":
    main()
