#!/usr/bin/env python3
"""AI Lab sidebar · workbench + ministry quick links."""
from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SIDEBAR = ROOT / "ai_tools" / "sidebar_lab.html"
LANDING = ROOT / "ai_tools" / "_landing" / "home.html"
DEPT_DATA = ROOT / "ai_tools" / "_landing" / "ai_departments_data.js"
MODES = ROOT / "config" / "modes.json"
NAV_SSOT = ROOT / "js" / "b100_module_nav_ssot.js"
HINT_JS = ROOT / "ai_tools" / "js" / "ai_collab_page_hint.js"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


class TestAiSidebarLinks(unittest.TestCase):
    def test_sidebar_workbench_and_ministry_zones(self):
        html = read(SIDEBAR)
        self.assertIn('data-b100-focus-zone="workbench"', html)
        self.assertIn('data-b100-focus-zone="ministry"', html)
        self.assertNotIn('data-b100-focus-zone="learn"', html)
        self.assertNotIn("sb-clarity", html)

    def test_ministry_links_original_modules_not_new_hub(self):
        html = read(SIDEBAR)
        for frag in (
            "smart_ministry/console.html",
            "languages/index_ch.html",
            "church_planning/Church_Governance_SWOT_matrix.html",
            "church_ministry/modules/expansion/outreach-integrated.html",
        ):
            self.assertIn(frag, html)
        self.assertNotIn("ministry_ai_hub", html)

    def test_smart_ministry_not_in_workbench_block(self):
        html = read(SIDEBAR)
        wb = html.split('data-b100-focus-zone="workbench"')[1].split(
            'data-b100-focus-zone="ministry"'
        )[0]
        self.assertNotIn("smart_ministry", wb)
        self.assertNotIn("index_ch.html", wb)

    def test_sidebar_key_targets_exist(self):
        html = read(SIDEBAR)
        hrefs = re.findall(r'href="([^"]+)"', html)
        missing = []
        for h in hrefs:
            if h.startswith("#") or h.startswith("http"):
                continue
            if h.startswith("../"):
                p = (ROOT / h[3:]).resolve()
            else:
                p = (ROOT / "ai_tools" / h).resolve()
            if not p.exists():
                missing.append(h)
        self.assertEqual(missing, [], f"missing: {missing}")

    def test_collab_hints_on_original_pages(self):
        hint_keys = read(HINT_JS)
        for key in (
            "smart_ministry_console",
            "ch_index",
            "cm_outreach",
            "plan_index",
            "media_workflow",
            "prompt_qa",
        ):
            self.assertIn(key, hint_keys)
        self.assertIn('data-b100-ai-hint="serve_crm"', read(ROOT / "ai_tools/pages/crm_automation_console.html"))
        self.assertIn('data-b100-ai-hint="plan_swot"', read(ROOT / "church_planning/Church_Governance_SWOT_matrix.html"))
        self.assertIn('data-b100-ai-hint="media_workflow"', read(ROOT / "ai_tools/_landing/media_tools.html"))
        self.assertIn('data-b100-ai-hint="prompt_qa"', read(ROOT / "ai_tools/pages/ai_qa_system.html"))

    def test_sidebar_no_redundant_route_map(self):
        html = read(SIDEBAR)
        self.assertNotIn("路線圖 Route Map", html)
        self.assertNotIn("備課 · 創作工作台 Workbench", html)
        self.assertIn("问学 · 深化", html)
        self.assertIn("备课 · 产出", html)
        self.assertIn("CM 教会事工", html)
        self.assertIn("Bible 教材", html)
        self.assertIn("Plan 规划", html)

    def test_module_nav_ssot_zones(self):
        js = read(NAV_SSOT)
        for z in ("workbench", "ministry", "plan"):
            self.assertIn(f'id: "{z}"', js)

    def test_modes_four_chips(self):
        js = read(MODES)
        ai = js.split('"id": "ai"')[1][:1800]
        self.assertIn('"focusZone": "workbench"', ai)
        self.assertIn('"focusZone": "ministry"', ai)
        self.assertNotIn('"focusZone": "learn"', ai)


if __name__ == "__main__":
    unittest.main()
