# -*- coding: utf-8 -*-
"""W5a：插隊批次 — 0-16／A-16／A-17／F-01 報告入口。"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class TestChurchW5aReports(unittest.TestCase):
    def test_016_volunteer_csv(self):
        t = (
            ROOT / "church_ministry" / "modules" / "volunteer" / "volunteer-integrated.html"
        ).read_text(encoding="utf-8")
        self.assertIn('data-w5-report="volunteer-ministries-csv"', t)
        self.assertIn("exportMinistriesCsv", t)
        self.assertIn('data-w5-report="volunteer-assign-csv"', t)
        self.assertIn("exportScheduleCsv", t)

    def test_a16_worship_reports(self):
        t = (
            ROOT / "church_ministry" / "modules" / "worship" / "worship-reports.html"
        ).read_text(encoding="utf-8")
        self.assertIn("worship-sunday-desk.html", t)

    def test_a17_attendance(self):
        t = (
            ROOT / "church_ministry" / "modules" / "worship" / "attendance-management.html"
        ).read_text(encoding="utf-8")
        self.assertIn("worship-sunday-desk.html", t)
        self.assertIn("location.replace", t)

    def test_f01_dashboard_maturity_csv(self):
        t = (ROOT / "church_ministry" / "dashboard.html").read_text(encoding="utf-8")
        self.assertIn('data-w5-report="dashboard-maturity-csv"', t)
        self.assertIn("exportCrmMaturityCsv", t)


if __name__ == "__main__":
    unittest.main()
