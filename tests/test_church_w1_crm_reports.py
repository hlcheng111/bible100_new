# -*- coding: utf-8 -*-
"""W1：CRM 三步（0-01～0-03）階段 3 報告入口靜態驗收。"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class TestChurchW1CrmReports(unittest.TestCase):
    def test_members_roster_csv_print(self):
        p = ROOT / "church_ministry" / "modules" / "members" / "member-integrated.html"
        t = p.read_text(encoding="utf-8")
        self.assertIn('data-w1-report="members-csv"', t)
        self.assertIn("exportMembersCsv", t)
        self.assertIn('data-w1-report="members-print"', t)
        self.assertIn("printMembersRoster", t)

    def test_visitation_week_csv_print(self):
        p = ROOT / "church_ministry" / "modules" / "support" / "visitation_index.html"
        t = p.read_text(encoding="utf-8")
        self.assertIn('data-w1-report="visitation-csv"', t)
        self.assertIn("exportWeekListCsv", t)
        self.assertIn('data-w1-report="visitation-print"', t)
        self.assertIn("printWeekList", t)

    def test_volunteer_shift_csv_print(self):
        idx = (ROOT / "church_ministry" / "tools" / "volunteer_shift" / "index.html").read_text(
            encoding="utf-8"
        )
        lst = (ROOT / "church_ministry" / "tools" / "volunteer_shift" / "list.html").read_text(
            encoding="utf-8"
        )
        self.assertIn('data-w1-report="shifts-entry"', idx)
        self.assertIn('data-w1-report="shifts-csv"', lst)
        self.assertIn("exportShiftCsv", lst)
        self.assertIn('data-w1-report="shifts-print"', lst)
        self.assertIn("printShiftList", lst)


if __name__ == "__main__":
    unittest.main()
