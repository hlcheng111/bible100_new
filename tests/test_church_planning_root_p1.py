#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P1 · church_planning 根夾分層契約（cleanupWaves[2] + Wave 5a/5c）。

Run: python tests/test_church_planning_root_p1.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "church_planning"
REGISTRY = PLAN / "js" / "planning_tool_registry.js"
MANIFEST = REPO / "config" / "module_manifest.json"

SHELL_FILES = (
    "index_plan.html",
    "index.html",
    "sidebar_plan.html",
)

HUB_FILES = (
    "assessment-os-hub.html",
    "cta-os-war-room.html",
    "cta-os-tool-report.html",
    "dashboard.html",
)

REDIRECT_PAIRS = (
    ("important-urgent-matrix.html", "tools/Church_Governance_urgent_matrix.html"),
    ("smart-assessment.html", "tools/Church_Governance_SMART_goals.html"),
    ("culture-alignment-assessment.html", "tools/Church_Governance_Culture_radar.html"),
    ("kpi-okr-alignment.html", "tools/Church_Governance_KPI_alignment.html"),
    ("ministry-8020-planning.html", "tools/Church_Governance_8020_focus.html"),
    ("pdca-planning.html", "tools/Church_Governance_PDCA_cycle.html"),
    ("swot-planning.html", "tools/Church_Governance_SWOT_matrix.html"),
    ("信徒靈性生命健康自我審查.html", "tools/Church_Governance_spiritual_health.html"),
)

GUIDE_REDIRECTS = (
    "guide_planning_step2_raci.html",
    "guide_planning_step4_ctv.html",
    "guide_planning_step5_strategy.html",
    "guide_planning_step6_crm.html",
)

ARCHIVED_AT_ROOT = (
    "church-planning-index.html",
    "smart-planning.html",
    "process.html",
    "chain-link-validator.html",
    "dashboard-query-model.html",
    "data-contract-migration.html",
    "sidebar.html",
    "教会健康数字诊断系统 NCD Church Health Pro 2026.html",
    "教會健康戰略診斷系統 Church SWOT AI.html",
    "教會健康檢查 Church Health Check-up.html",
)

COMPANION_PAGES = (
    "page_see.html",
    "page_learn.html",
    "page_fill.html",
    "page_reports.html",
    "a1-health-entry.html",
    "planning-user-guide.html",
    "leader-pipeline-radar.html",
    "ministry-8020-slasher.html",
    "strategy-conflict-report.html",
    "pastoral-professional-review.html",
    "supabase-setup.html",
    "church-health-diagnosis.html",
    "pastoral-spiritual-survey-pro.html",
    "12 Apostles Leadership Assessment.html",
    "vision.html",
)

COMPANION_STUBS = COMPANION_PAGES  # root meta-refresh → companion/

TOOL_PAGES = (
    "Church_Governance_spiritual_health.html",
    "Church_Governance_pastoral_health.html",
    "Church_Governance_8020_focus.html",
    "Church_Governance_urgent_matrix.html",
    "Church_Governance_SMART_goals.html",
    "Church_Governance_PDCA_cycle.html",
    "Church_Governance_KPI_alignment.html",
    "Church_Governance_SWOT_matrix.html",
    "Church_Governance_Culture_radar.html",
    "Church_Health_NCD_planning.html",
    "shape-gifts-assessment.html",
    "ministry-competency-assessment.html",
    "alda-leadership-assessment.html",
    "ministry-position-matchmaker.html",
    "johari-window-assessment.html",
    "disc-profile-assessment.html",
    "mbti-self-awareness.html",
)

# Wave 5a · 不得再留於根目錄
DEV_FORBIDDEN_AT_ROOT = (
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "postcss.config.js",
    "tailwind.config.js",
    "DEPLOY.md",
    "Open-ChurchHealthPro-local.cmd",
)

SUBSTANTIAL_HTML_MIN_BYTES = 5000
SUBSTANTIAL_HTML_MAX_COUNT = 8
ROOT_INVENTORY_DOC = REPO / "docs" / "modules" / "church_planning" / "ROOT_INVENTORY.md"
WAVE5A_ARCHIVE = PLAN / "_archive" / "dev_vite_shell_2026-06"


def parse_live_paths() -> list[tuple[str, str]]:
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


def main() -> int:
    errors: list[str] = []

    if not MANIFEST.is_file():
        errors.append("missing config/module_manifest.json")
    else:
        data = json.loads(MANIFEST.read_text(encoding="utf-8"))
        waves = {w.get("wave"): w for w in data.get("cleanupWaves", [])}
        w2 = waves.get(2)
        if not w2:
            errors.append("cleanupWaves missing wave 2")
        elif w2.get("status") != "completed":
            errors.append(f"cleanupWaves[2] status must be completed, got {w2.get('status')!r}")

        cp = next((m for m in data.get("modules", []) if m.get("id") == "church_planning"), None)
        if cp:
            doc = (cp.get("rootLayout") or {}).get("doc")
            if not doc:
                errors.append("church_planning.rootLayout.doc missing in manifest")
            elif not (REPO / doc).is_file():
                errors.append(f"rootLayout doc missing on disk: {doc}")
            archive = (cp.get("rootLayout") or {}).get("wave2Archive")
            if archive and not (REPO / archive / "README.md").is_file():
                errors.append(f"wave2 archive README missing: {archive}/README.md")

    for name in SHELL_FILES + HUB_FILES:
        if not (PLAN / name).is_file():
            errors.append(f"shell/hub missing at root: {name}")

    live = parse_live_paths()
    if len(live) != 18:
        errors.append(f"expected 18 live registry tools, got {len(live)}")

    for tool_id, rel in live:
        p = PLAN / rel
        if not p.is_file():
            errors.append(f"registry live missing: {rel} (id={tool_id})")

    for old, new in REDIRECT_PAIRS:
        p = PLAN / old
        if not p.is_file():
            errors.append(f"redirect stub missing: {old}")
            continue
        if new not in p.read_text(encoding="utf-8"):
            errors.append(f"{old} must reference {new}")

    for name in GUIDE_REDIRECTS:
        p = PLAN / name
        if not p.is_file():
            errors.append(f"guide redirect missing: {name}")
            continue
        if "guides/" not in p.read_text(encoding="utf-8"):
            errors.append(f"{name} must redirect to guides/")

    for name in ARCHIVED_AT_ROOT:
        if (PLAN / name).is_file():
            errors.append(f"archived file still at root: {name}")

    comp_dir = PLAN / "companion"
    if not comp_dir.is_dir():
        errors.append("missing companion/ directory")
    for name in COMPANION_PAGES:
        if not (comp_dir / name).is_file():
            errors.append(f"companion page missing: companion/{name}")
    for name in COMPANION_STUBS:
        stub = PLAN / name
        if not stub.is_file():
            errors.append(f"companion redirect stub missing at root: {name}")
            continue
        text = stub.read_text(encoding="utf-8")
        if f"companion/{name}" not in text:
            errors.append(f"{name} root stub must redirect to companion/{name}")

    tools_dir = PLAN / "tools"
    if not tools_dir.is_dir():
        errors.append("missing tools/ directory")
    for name in TOOL_PAGES:
        if not (tools_dir / name).is_file():
            errors.append(f"tools page missing: tools/{name}")
        stub = PLAN / name
        if not stub.is_file():
            errors.append(f"tools redirect stub missing at root: {name}")
        elif f"tools/{name}" not in stub.read_text(encoding="utf-8"):
            errors.append(f"{name} root stub must redirect to tools/{name}")

    sidebar = PLAN / "sidebar_plan.html"
    if sidebar.is_file():
        sb = sidebar.read_text(encoding="utf-8")
        if "companion/vision.html" not in sb or "companion/planning-user-guide.html" not in sb:
            errors.append("sidebar_plan must link companion/vision and companion/planning-user-guide")

    archive_dir = PLAN / "_archive" / "p1_wave2_2026-06"
    if not archive_dir.is_dir():
        errors.append("missing archive dir: church_planning/_archive/p1_wave2_2026-06")

    if not ROOT_INVENTORY_DOC.is_file():
        errors.append("missing docs/modules/church_planning/ROOT_INVENTORY.md")
    if not WAVE5A_ARCHIVE.is_dir():
        errors.append("missing Wave 5a archive: church_planning/_archive/dev_vite_shell_2026-06")
    elif not (WAVE5A_ARCHIVE / "README.md").is_file():
        errors.append("Wave 5a archive missing README.md")

    for name in DEV_FORBIDDEN_AT_ROOT:
        if (PLAN / name).is_file():
            errors.append(f"Wave 5a: dev artifact must not be at root: {name}")

    for pptx in PLAN.glob("*.pptx"):
        errors.append(f"Wave 5a: pptx must not be at root: {pptx.name}")

    substantial = [
        p.name
        for p in PLAN.glob("*.html")
        if p.is_file() and p.stat().st_size >= SUBSTANTIAL_HTML_MIN_BYTES
    ]
    if len(substantial) > SUBSTANTIAL_HTML_MAX_COUNT:
        errors.append(
            f"root substantial html count {len(substantial)} > {SUBSTANTIAL_HTML_MAX_COUNT}: "
            f"{sorted(substantial)}"
        )

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: church_planning root P1 ({len(errors)} issues)", file=sys.stderr)
        return 1

    print(
        "OK: church_planning root P1 — shell/hub present, "
        f"{len(live)} live paths, {len(REDIRECT_PAIRS)} tool redirects, "
        f"{len(COMPANION_PAGES)} companion + {len(TOOL_PAGES)} tools (stubs at root), "
        f"Wave 5a clean ({len(substantial)} substantial html at root)."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
