# -*- coding: utf-8 -*-
"""W5b／W5c／W5d：餘下做滿頁報告入口靜態檢查。"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CM = ROOT / "church_ministry"

# (relative path under church_ministry, required substrings)
W5B = [
    ("modules/worship/hospitality.html", ["hospitality-schedule-csv", "hospitality-print", "printHospitalityRoster"]),
    ("modules/worship/pulpit-ministry.html", ["pulpit-sermons-csv", "pulpit-print", "printSermonRoster"]),
    ("modules/worship/worship-team-management.html", ["worship-team-members-csv", "exportTeamMembersCsv"]),
    ("modules/worship/sermon-notes-admin.html", ["sermon-notes-csv", "exportTemplateCsv"]),
    ("modules/worship/song-library.html", ["song-library-csv", "printSongLibrary"]),
    ("modules/worship/worship-management.html", ["worship-mgmt-csv", "printWorshipLiturgy"]),
    ("modules/worship/choir-team.html", ["choir-members-csv", "exportChoirMembersCsv"]),
    ("modules/worship/instrument-team.html", ["instrument-print", "printInstrumentRoster"]),
    ("modules/worship/congregational-songs.html", ["cong-songs-csv", "exportCongSongsCsv"]),
    ("modules/worship/sheet-music.html", ["sheet-music-csv", "exportSheetMusicCsv"]),
    ("modules/worship/worship-integrated.html", ["worship-integrated-csv", "exportA03ScheduleCsv"]),
    ("modules/media/audio-team.html", ["audio-members-csv", "printAudioRoster"]),
    ("modules/media/live-streaming.html", ["live-streams-csv", "printLiveStreams"]),
]

W5C = [
    ("modules/fellowship/index.html", ["fellowship-index-csv"]),
    ("modules/fellowship/pastoral-org-roster.html", ["pastoral-org-roster-csv"]),
    ("modules/fellowship/pastoral-events.html", ["pastoral-events-csv"]),
    ("modules/fellowship/pastoral-strategy.html", ["pastoral-strategy-csv"]),
    ("modules/fellowship/fellowship-circles.html", ["fellowship-circles-csv"]),
    ("modules/development/youth-ministry-dev.html", ["youth-ministry-csv"]),
    ("congregation/index.html", ["congregation-index-csv"]),
    ("modules/expansion/community-assessment.html", ["community-assessment-csv"]),
    ("modules/expansion/mission-opportunities.html", ["mission-opportunities-csv"]),
    ("modules/expansion/new-ministry-planning.html", ["new-ministry-planning-csv"]),
    ("modules/expansion/church-planting.html", ["church-planting-csv"]),
    ("modules/expansion/branch-management.html", ["branch-management-csv"]),
    ("modules/expansion/mission-expansion.html", ["mission-expansion-csv"]),
    ("modules/expansion/cross-cultural.html", ["cross-cultural-csv"]),
    ("modules/innovation/new-media.html", ["new-media-csv"]),
    ("modules/innovation/innovation-projects.html", ["innovation-projects-csv"]),
    ("modules/innovation/technology-integration.html", ["technology-integration-csv"]),
]

W5D = [
    ("modules/equipment/equipment-management.html", ["equipment-inventory-csv"]),
    ("modules/library/library-management.html", ["library-books-csv"]),
    ("community-overview.html", ["community-donors-csv"]),
    ("modules/research/index.html", ["research-index-csv"]),
    ("modules/media/video-production.html", ["video-projects-csv"]),
    ("modules/tech/ai-assistant.html", ["ai-chat-csv"]),
    ("modules/tech/smart-recommendation.html", ["smart-rec-csv"]),
    ("modules/support/smart-reminders.html", ["smart-reminders-csv"]),
    ("modules/support/workflow.html", ["workflow-csv"]),
    ("theme-settings.html", ["theme-settings-csv"]),
    ("custom-page-editor.html", ["custom-page-csv"]),
    ("modules/support/technical-support.html", ["support-tickets-csv"]),
    ("modules/support/help-documentation.html", ["help-docs-csv"]),
    ("ministry_core.html", ["ministry-core-links-csv"]),
    ("modules/research/member-statistics.html", ["member-stats-csv", "cm-merge-banner"]),
]


class TestChurchW5bcdReports(unittest.TestCase):
    def test_cm_report_utils_exists(self):
        p = CM / "js" / "cm_report_utils.js"
        self.assertTrue(p.is_file())
        t = p.read_text(encoding="utf-8")
        self.assertIn("CmReportUtils", t)
        self.assertIn("downloadCsv", t)
        self.assertIn("printTable", t)
        self.assertIn("ufeff", t)

    def _check_batch(self, batch, label):
        missing = []
        for rel, needles in batch:
            path = CM / rel
            if not path.is_file():
                missing.append(f"{label} MISSING FILE {rel}")
                continue
            t = path.read_text(encoding="utf-8")
            for n in needles:
                if n not in t:
                    missing.append(f"{label} {rel} lacks {n}")
            if "cm_report_utils.js" not in t and "CmReportUtils" not in t:
                # inline fallback OK if functions exist; prefer utils
                if "data-w5-report" not in t:
                    missing.append(f"{label} {rel} no data-w5-report")
        self.assertEqual(missing, [], "\n".join(missing))

    def test_w5b(self):
        self._check_batch(W5B, "W5b")

    def test_w5c(self):
        self._check_batch(W5C, "W5c")

    def test_w5d(self):
        self._check_batch(W5D, "W5d")


if __name__ == "__main__":
    unittest.main()
