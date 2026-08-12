# -*- coding: utf-8 -*-
"""W2：A-04／D-01／C-01 階段 3 報告入口靜態驗收。"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class TestChurchW2Reports(unittest.TestCase):
    def test_a04_worship_plan_csv_print(self):
        t = (ROOT / "church_ministry" / "js" / "ae_worship_plan_pipeline.js").read_text(encoding="utf-8")
        self.assertIn('data-w2-report="worship-plan-csv"', t)
        self.assertIn("exportPlanCsv", t)
        self.assertIn('data-w2-report="worship-plan-print"', t)
        self.assertIn("printPlanBrief", t)

    def test_d01_outreach_csv_print_close(self):
        html = (
            ROOT / "church_ministry" / "modules" / "expansion" / "outreach-strategy.html"
        ).read_text(encoding="utf-8")
        store = (ROOT / "church_ministry" / "js" / "outreach_desk_store.js").read_text(encoding="utf-8")
        self.assertIn('data-w2-report="outreach-csv"', html)
        self.assertIn('data-w2-report="outreach-print"', html)
        self.assertIn("updateItemStatus", store)

    def test_c01_edu_roster_attendance_csv(self):
        html = (
            ROOT / "church_ministry" / "modules" / "education" / "education-integrated.html"
        ).read_text(encoding="utf-8")
        hub = (ROOT / "church_ministry" / "js" / "education_data_hub.js").read_text(encoding="utf-8")
        shell = (ROOT / "church_ministry" / "js" / "education_integrated_shell.js").read_text(
            encoding="utf-8"
        )
        self.assertIn('data-w2-report="edu-roster-csv"', html)
        self.assertIn('data-w2-report="edu-attendance-csv"', html)
        self.assertIn('data-w2-report="edu-absent-csv"', html)
        self.assertIn("downloadRosterCsv", hub)
        self.assertIn("downloadAttendanceCsv", hub)
        self.assertIn("edu-btn-roster-csv", shell)

    def test_volunteer_shift_trust_key_not_disconnected_when_empty(self):
        t = (ROOT / "church_ministry" / "tools" / "volunteer_shift" / "tool.js").read_text(
            encoding="utf-8"
        )
        self.assertIn("key: 'volunteerSystemData'", t)


if __name__ == "__main__":
    unittest.main()
