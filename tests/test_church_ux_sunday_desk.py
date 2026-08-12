# -*- coding: utf-8 -*-
"""UX 重做：主日一桌／AE 殼收斂／儀表板三鈕。"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CM = ROOT / "church_ministry"


class TestChurchUxSundayDesk(unittest.TestCase):
    def test_sunday_desk_exists(self):
        p = CM / "modules" / "worship" / "worship-sunday-desk.html"
        self.assertTrue(p.is_file())
        t = p.read_text(encoding="utf-8")
        self.assertIn("主日一桌", t)
        self.assertIn('data-tab="roll"', t)
        self.assertIn('data-tab="absent"', t)
        self.assertIn('data-tab="stats"', t)
        self.assertIn('data-tab="export"', t)
        self.assertIn('data-w5-report="sunday-desk-csv"', t)
        self.assertIn('data-b100-ae-chrome="off"', t)

    def test_old_pages_redirect(self):
        for name in ("worship-reports.html", "attendance-management.html"):
            t = (CM / "modules" / "worship" / name).read_text(encoding="utf-8")
            self.assertIn("worship-sunday-desk.html", t)

    def test_ae_roadmap_default_off(self):
        js = (CM / "js" / "ae_subpage_shell.js").read_text(encoding="utf-8")
        self.assertIn('chrome !== "full"', js)
        self.assertIn("desks/index.html", js)
        self.assertIn("ae-nav-home", js)

    def test_sidebar_points_sunday_desk(self):
        t = (CM / "sidebar_church_layout_v1.html").read_text(encoding="utf-8")
        self.assertIn("worship-sunday-desk.html", t)

    def test_dashboard_three_actions(self):
        t = (CM / "dashboard_church_layout_v1.html").read_text(encoding="utf-8")
        self.assertIn("uxThreeActions", t)
        self.assertIn("uxEmptySeedBanner", t)
        self.assertIn("本週排班", t)

    def test_volunteer_vacancy_desk(self):
        t = (CM / "modules" / "volunteer" / "volunteer-integrated.html").read_text(
            encoding="utf-8"
        )
        self.assertIn("本週缺額", t)
        self.assertIn("selectVacantMinistry", t)
        self.assertIn("assignTop3", t)
        self.assertIn("top3Host", t)


if __name__ == "__main__":
    unittest.main()
