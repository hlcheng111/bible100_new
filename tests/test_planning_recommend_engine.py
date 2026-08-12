#!/usr/bin/env python3
"""G 規劃行政 · 推薦引擎靜態檢查。"""
from __future__ import annotations

import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
CP = ROOT / "church_planning"


class PlanningRecommendEngineTests(unittest.TestCase):
    def test_engine_file(self):
        p = CP / "js" / "planning_recommend_engine.js"
        self.assertTrue(p.is_file())
        text = p.read_text(encoding="utf-8")
        self.assertIn("DIM_TOOL_MAP", text)
        self.assertIn("getRecommendation", text)
        self.assertIn("renderHubBanner", text)

    def test_war_room_integrated(self):
        wr = (CP / "js" / "cta_os_war_room.js").read_text(encoding="utf-8")
        self.assertIn("PlanningRecommendEngine", wr)
        self.assertIn("markWarRoomScanned", wr)

    def test_war_room_html_loads_engine(self):
        html = (CP / "cta-os-war-room.html").read_text(encoding="utf-8")
        self.assertIn("planning_recommend_engine.js", html)


if __name__ == "__main__":
    raise SystemExit(0 if unittest.main(verbosity=2).result.wasSuccessful() else 1)
