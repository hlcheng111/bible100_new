#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
教會事工頂欄2 + 側欄契約 — 防止「全部綁同一 sidebar」、名詞亂改、公共頁張冠李戴。

Run: python tests/test_church_nav_ui_contract.py
After config/sidebar changes: node scripts/generate_config_embedded.js
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MODES = REPO / "config" / "modes.json"
EMBEDDED = REPO / "js" / "config-embedded.js"
SIDEBAR_TOOLS = REPO / "church_ministry" / "sidebar.html"
SIDEBAR_CRM = REPO / "church_ministry" / "sidebar_crm_journey.html"
SIDEBAR_LAYOUT = REPO / "church_ministry" / "sidebar_church_layout_v1.html"
SIDEBAR_HELP = REPO / "help" / "sidebar_help.html"
INDEX_V5 = REPO / "index_v5.html"
INDEX_PLAN = REPO / "church_planning" / "index_plan.html"
SIDEBAR_PLAN = REPO / "church_planning" / "sidebar_plan.html"
ASSESSMENT_HUB = REPO / "church_planning" / "assessment-os-hub.html"
WAR_ROOM = REPO / "church_planning" / "cta-os-war-room.html"
RACI_PAGE = REPO / "church_planning" / "planning" / "raci-reflection.html"
PLANNING_CSS = REPO / "church_planning" / "css" / "planning_guide_shared.css"
KNOWLEDGE_INDEX = REPO / "knowledge" / "index.html"

FORBIDDEN_IN_SIDEBAR_TOOLS = [
    "進階／熟手",
    "sidebar-member-count",
    "sidebar-advanced",
    "事工進度儀表板",
    "本機 200 位會友",
]

# 前端／embedded 禁止曝露給牧長的 engineer 自嗨名詞
FORBIDDEN_UI_TERMS = [
    "日常手腳",
    "5F 規劃",
    "5F規劃",
]

FORBIDDEN_IN_CHURCH_NAV_LABELS = [
    "日常手腳",
    "5F 規劃",
    "長執大腦",  # 允許「長執決策大腦」，禁止縮成「長執大腦」
]

PUBLIC_PATH_MARKERS = [
    ("knowledge/index.html", "三層文集"),
    ("help/site-navigation-guide.html", "導覽憲法"),
]

ABCD_PATH_MARKERS = [
    "_landing/worship.html",
    "fellowship/small-groups",
    "education/education-integrated",
    "expansion/outreach-strategy",
]

REQUIRED_INDEX = [
    "renderChurchContextBar",
    "CHURCH_NAV_GROUPS",
    "sub-nav-group",
    "nav-group-brain",
    "sub-btn--compact",
    "👥 教會事工",
    "長執決策大腦",
]

REQUIRED_PLANNING_SHORT = "🧭 教會規劃"

FORBIDDEN_IN_PLANNING_USER_UI = [
    "Phase 3",
    "CTA-OS 戰情室（Phase",
]

REQUIRED_PLANNING_LANDING = [
    "五年計劃屬靈前言",
    "七步生命故事線",
    "sidebar_crm_journey.html",
]

REQUIRED_SIDEBAR_PLAN = [
    "五年計劃戰略路徑",
    "guide_crm_journey_hub.html",
    "planningOpenContent",
    "planningOpenByToolId",
    "planning_sidebar_render.js",
    "planning-sidebar-tools-top",
    "各項工具量表",
    "健康雷達戰情",
    "guide_step2_raci.html",
    "CRM 關係管理",
    "第五步：教會事工執行",
    'href="index_plan.html"',
    'href="planning/raci-reflection.html"',
]

PLANNING_SIDEBAR_RENDER = REPO / "church_planning" / "js" / "planning_sidebar_render.js"

# 核心工具 · 與 planning_tool_registry.js / cta_os_war_room TOOL_LINKS 對齊
PLANNING_CORE_TOOLS: dict[str, str] = {
    "spiritual": "信徒靈性生命健康自我審查.html",
    "pastoral": "pastoral-spiritual-survey-pro.html",
    "raci": "planning/raci-reflection.html",
    "swot": "Church_Governance_SWOT_matrix.html",
    "ministry8020": "ministry-8020-planning.html",
    "urgent": "important-urgent-matrix.html",
    "smart": "smart-planning.html",
    "pdca": "pdca-planning.html",
    "kpiokr": "kpi-okr-alignment.html",
    "alda": "12 Apostles Leadership Assessment.html",
    "shape": "shape-gifts-assessment.html",
    "johari": "johari-window-assessment.html",
    "competency": "ministry-competency-assessment.html",
    "ncd": "Church_Health_NCD_planning.html",
    "disc": "disc-profile-assessment.html",
    "mbti": "mbti-self-awareness.html",
    "culture": "culture-alignment-assessment.html",
}

PLANNING_V3_ROUTES = [
    ("啟航", "index_plan.html"),
    ("健康診斷中心", "assessment-os-hub.html"),
    ("權責理清", "guides/guide_step2_raci.html"),
    ("健康雷達戰情", "guides/guide_step4_ctv.html"),
    ("計劃策略實踐", "guides/guide_step5_strategy.html"),
    ("教會事工執行", "guides/guide_step6_crm.html"),
]

PLANNING_REGISTRY = REPO / "church_planning" / "js" / "planning_tool_registry.js"
PLANNING_NAV = REPO / "church_planning" / "js" / "planning_nav.js"

REQUIRED_GUIDE_BOX = "planning-guide-box"


def church_mode() -> dict:
    data = json.loads(MODES.read_text(encoding="utf-8"))
    for m in data.get("modes", []):
        if m.get("id") == "church":
            return m
    raise AssertionError("church mode missing in modes.json")


def embedded_config_str() -> str:
    if not EMBEDDED.is_file():
        return ""
    return EMBEDDED.read_text(encoding="utf-8")


def main() -> int:
    errors: list[str] = []

    church = church_mode()
    nav = church.get("secondaryNav") or []
    modes_text = MODES.read_text(encoding="utf-8")
    emb_text = embedded_config_str()
    combined = modes_text + "\n" + emb_text

    for bad in FORBIDDEN_UI_TERMS:
        if bad in combined:
            errors.append(f"forbidden UI term in config/embedded: {bad!r}")

    if INDEX_V5.is_file():
        idx = INDEX_V5.read_text(encoding="utf-8")
        for bad in FORBIDDEN_IN_CHURCH_NAV_LABELS:
            if bad in idx:
                errors.append(f"index_v5.html contains forbidden nav label: {bad!r}")
        for req in REQUIRED_INDEX:
            if req not in idx:
                errors.append(f"index_v5.html missing {req!r}")

    crm = next((i for i in nav if "guide_crm_journey_hub" in str(i.get("path", ""))), None)
    if not crm:
        errors.append("missing CRM journey secondaryNav item")
    elif "sidebar_crm_journey.html" not in str(crm.get("sidebar", "")):
        errors.append("CRM journey must use sidebar_crm_journey.html")

    for marker in ABCD_PATH_MARKERS:
        item = next((i for i in nav if marker in str(i.get("path", ""))), None)
        if not item:
            errors.append(f"missing nav item for path containing {marker!r}")
            continue
        sb = str(item.get("sidebar", ""))
        if "sidebar_church_layout_v1.html" not in sb:
            errors.append(f"A–D item {marker} must use sidebar_church_layout_v1.html, got {sb!r}")
        if sb.strip() == "church_ministry/sidebar.html":
            errors.append(f"A–D item {marker} must NOT use generic sidebar.html")

    plan = next((i for i in nav if "church_planning/index_plan" in str(i.get("path", ""))), None)
    if not plan:
        errors.append("missing church planning secondaryNav item")
    else:
        if "sidebar_plan.html" not in str(plan.get("sidebar", "")):
            errors.append("教會規劃 OS must use sidebar_plan.html")
        short = str(plan.get("labelShort", ""))
        if REQUIRED_PLANNING_SHORT not in short:
            errors.append(f"planning labelShort must be {REQUIRED_PLANNING_SHORT!r}, got {short!r}")
        if "5F" in short:
            errors.append("planning labelShort must not expose 5F floor code")

    # --- 5F 教會規劃導遊契約 ---
    if not PLANNING_CSS.is_file():
        errors.append("missing church_planning/css/planning_guide_shared.css")

    if INDEX_PLAN.is_file():
        plan_text = INDEX_PLAN.read_text(encoding="utf-8")
        for bad in FORBIDDEN_IN_PLANNING_USER_UI:
            if bad in plan_text:
                errors.append(f"index_plan.html must not contain {bad!r}")
        for req in REQUIRED_PLANNING_LANDING:
            if req not in plan_text:
                errors.append(f"index_plan.html missing {req!r}")
        if "church_ministry/sidebar.html" in plan_text and "sidebar_crm_journey" not in plan_text:
            errors.append("index_plan.html CRM bridge must use sidebar_crm_journey.html")
    else:
        errors.append("missing church_planning/index_plan.html")

    reg_text = ""
    if PLANNING_REGISTRY.is_file():
        reg_text = PLANNING_REGISTRY.read_text(encoding="utf-8")

    sb_plan = ""
    if SIDEBAR_PLAN.is_file():
        sb_plan = SIDEBAR_PLAN.read_text(encoding="utf-8")
        uses_dynamic_tools = (
            "planning-sidebar-tools-top" in sb_plan
            and PLANNING_SIDEBAR_RENDER.is_file()
        )
        for req in REQUIRED_SIDEBAR_PLAN:
            if req not in sb_plan:
                errors.append(f"sidebar_plan.html missing {req!r}")
        if "church_ministry/sidebar.html" in sb_plan:
            errors.append("sidebar_plan.html must not bridge to church_ministry/sidebar.html")
        if 'href="#"' in sb_plan and sb_plan.count('href="#"') > 2:
            errors.append("sidebar_plan should use real href paths, not mostly href=#")
        for label, rel in PLANNING_V3_ROUTES:
            if label not in sb_plan:
                errors.append(f"sidebar_plan missing V3 route label: {label!r}")
            if rel not in sb_plan:
                errors.append(f"sidebar_plan missing route path: {rel!r}")
        for tool_id in PLANNING_CORE_TOOLS:
            if tool_id in ("raci",):
                continue
            in_sb = f"planningOpenByToolId(event,'{tool_id}')" in sb_plan
            in_reg = f'id: "{tool_id}"' in reg_text or f"id: '{tool_id}'" in reg_text
            if uses_dynamic_tools:
                if not in_reg:
                    errors.append(f"registry missing tool for sidebar render: {tool_id!r}")
            elif not in_sb:
                errors.append(f"sidebar_plan missing tool submenu: {tool_id!r}")
    else:
        errors.append("missing church_planning/sidebar_plan.html")

    if not PLANNING_REGISTRY.is_file():
        errors.append("missing church_planning/js/planning_tool_registry.js")
    if not PLANNING_NAV.is_file():
        errors.append("missing church_planning/js/planning_nav.js")
    if not PLANNING_SIDEBAR_RENDER.is_file():
        errors.append("missing church_planning/js/planning_sidebar_render.js")

    plan_root = REPO / "church_planning"
    for tool_id, rel in PLANNING_CORE_TOOLS.items():
        if not (plan_root / rel).is_file():
            errors.append(f"planning tool file missing: {rel!r} ({tool_id})")

    hub_text = ""
    if ASSESSMENT_HUB.is_file():
        hub_text = ASSESSMENT_HUB.read_text(encoding="utf-8")
        if "planning-tool-supermarket" not in hub_text:
            errors.append("assessment-os-hub must include planning-tool-supermarket grid")
        if "planning_hub_render.js" not in hub_text:
            errors.append("assessment-os-hub must load planning_hub_render.js")
        for tool_id in PLANNING_CORE_TOOLS:
            if f"'{tool_id}'" not in hub_text and tool_id not in hub_text:
                # hub renders from registry JS; check registry lists all ids
                pass
    reg_text = ""
    if PLANNING_REGISTRY.is_file():
        reg_text = PLANNING_REGISTRY.read_text(encoding="utf-8")
        for tool_id in PLANNING_CORE_TOOLS:
            if f'id: "{tool_id}"' not in reg_text and f"id: '{tool_id}'" not in reg_text:
                errors.append(f"planning_tool_registry missing tool id: {tool_id!r}")

    combined_planning_nav = hub_text + sb_plan + reg_text
    for _tool_id, rel in PLANNING_CORE_TOOLS.items():
        if _tool_id in ("disc", "mbti", "culture"):
            continue
        reachable = rel in combined_planning_nav or _tool_id in combined_planning_nav
        if not reachable:
            errors.append(f"tool {_tool_id!r} not reachable from hub or sidebar")

    for page_path, label in (
        (ASSESSMENT_HUB, "assessment-os-hub.html"),
        (WAR_ROOM, "cta-os-war-room.html"),
        (RACI_PAGE, "raci-reflection.html"),
    ):
        if not page_path.is_file():
            errors.append(f"missing {label}")
            continue
        pt = page_path.read_text(encoding="utf-8")
        if REQUIRED_GUIDE_BOX not in pt:
            errors.append(f"{label} must include {REQUIRED_GUIDE_BOX!r}")
        if "Phase 3" in pt:
            errors.append(f"{label} must not expose Phase 3 to users")

    if WAR_ROOM.is_file():
        wr = WAR_ROOM.read_text(encoding="utf-8")
        if "CTA-OS 戰情室（Phase" in wr:
            errors.append("war room must not use CTA-OS Phase 3 as user-facing title")
        if "健康雷達戰情室" not in wr:
            errors.append("war room must use 健康雷達戰情室 in user-facing copy")
        if "CTV 六維" not in wr and "核心六維度" not in wr:
            errors.append("war room must explain CTV six dimensions in guide box")
        if "planningOpenByToolId" not in wr and "planning_nav.js" not in wr:
            errors.append("war room must load planning_nav for snapshot links")
    war_js = REPO / "church_planning" / "js" / "cta_os_war_room.js"
    if war_js.is_file():
        wj = war_js.read_text(encoding="utf-8")
        if "planningOpenByToolId" not in wj:
            errors.append("cta_os_war_room.js must use planningOpenByToolId for snapshot links")
        if 'href: TOOL_LINKS[id] || "#"' in wj:
            errors.append("cta_os_war_room.js must not fallback snapshot href to #")

    if KNOWLEDGE_INDEX.is_file():
        ki = KNOWLEDGE_INDEX.read_text(encoding="utf-8")
        if "誠品書店式" in ki:
            errors.append("knowledge/index.html must not use 誠品書店式 in h1")
        if "三層文集導覽" not in ki:
            errors.append("knowledge/index.html h1 must be 三層文集導覽")

    for path_marker, name in PUBLIC_PATH_MARKERS:
        item = next((i for i in nav if path_marker in str(i.get("path", ""))), None)
        if not item:
            errors.append(f"missing public nav item: {name}")
            continue
        sb = str(item.get("sidebar", ""))
        if "sidebar_crm_journey" in sb:
            errors.append(f"{name} must NOT use sidebar_crm_journey.html")
        if "sidebar_church_layout_v1" in sb:
            errors.append(f"{name} must NOT use sidebar_church_layout_v1.html")
        if sb and "sidebar_help.html" not in sb and sb != "about:blank":
            errors.append(f"{name} should use help/sidebar_help.html or about:blank, got {sb!r}")

    for item in nav:
        if not isinstance(item, dict) or item.get("action") == "home":
            continue
        if item.get("type"):
            continue
        if not item.get("navGroup"):
            errors.append(f"church nav item missing navGroup: {item.get('labelZh')!r}")
        if not item.get("labelShort"):
            errors.append(f"church nav item missing labelShort: {item.get('labelZh')!r}")

    if not SIDEBAR_CRM.is_file():
        errors.append("missing sidebar_crm_journey.html")
    elif "回教會規劃" not in SIDEBAR_CRM.read_text(encoding="utf-8"):
        errors.append("sidebar_crm_journey must link back to church planning")
    if not SIDEBAR_LAYOUT.is_file():
        errors.append("missing sidebar_church_layout_v1.html")
    if not SIDEBAR_HELP.is_file():
        errors.append("missing help/sidebar_help.html")

    if SIDEBAR_TOOLS.is_file():
        tools_text = SIDEBAR_TOOLS.read_text(encoding="utf-8")
        for bad in FORBIDDEN_IN_SIDEBAR_TOOLS:
            if bad in tools_text:
                errors.append(f"sidebar.html must not contain {bad!r}")
        if "cm-sidebar__link--ai" not in tools_text:
            errors.append("sidebar.html must include AI voice link class")

    if errors:
        print("FAIL: church nav UI contract", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    print("OK: church nav UI contract (naming lock + sidebar routing + public pages + 5F guide).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
