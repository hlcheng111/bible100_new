# -*- coding: utf-8 -*-
"""W3：B-04 小組／B-06 出席 階段 3 報告入口靜態驗收。"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class TestChurchW3PastoralReports(unittest.TestCase):
    def test_b04_small_groups_csv_print(self):
        t = (
            ROOT
            / "church_ministry"
            / "modules"
            / "fellowship"
            / "small-groups-integrated.html"
        ).read_text(encoding="utf-8")
        self.assertIn('data-w3-report="groups-csv"', t)
        self.assertIn("exportGroupsCsv", t)
        self.assertIn('data-w3-report="group-members-csv"', t)
        self.assertIn("exportGroupMembersCsv", t)
        self.assertIn('data-w3-report="meetings-csv"', t)
        self.assertIn("exportMeetingsCsv", t)
        self.assertIn('data-w3-report="groups-print"', t)
        self.assertIn("printGroupsRoster", t)

    def test_b06_pastoral_attendance_csv_print(self):
        html = (
            ROOT
            / "church_ministry"
            / "modules"
            / "fellowship"
            / "pastoral-attendance.html"
        ).read_text(encoding="utf-8")
        ui = (ROOT / "church_ministry" / "js" / "pastoral_attendance_ui.js").read_text(
            encoding="utf-8"
        )
        hub = (ROOT / "church_ministry" / "js" / "pastoral_data_hub.js").read_text(
            encoding="utf-8"
        )
        self.assertIn('data-w3-report="attendance-csv"', html)
        self.assertIn('data-w3-report="absence-csv"', html)
        self.assertIn('data-w3-report="attendance-print"', html)
        self.assertIn("exportAttendanceCsv", ui)
        self.assertIn("exportAbsenceAlertsCsv", ui)
        self.assertIn("printWeekRoster", ui)
        self.assertIn("getGroupAttendanceStore: getGroupAttendanceStore", hub)


if __name__ == "__main__":
    unittest.main()
