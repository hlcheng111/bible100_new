# -*- coding: utf-8 -*-
"""Update church desks tests after P0: remove 15-desk sidebar promo."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
CM = ROOT / "church_ministry"


class TestChurchDesks(unittest.TestCase):
    def test_registry_has_15(self):
        js = (CM / "js" / "cm_desk_registry.js").read_text(encoding="utf-8")
        self.assertIn("CmDeskRegistry", js)
        self.assertGreaterEqual(js.count("id:"), 15)

    def test_desk_pages_still_exist(self):
        for name in (
            "index.html",
            "worship-team.html",
            "pastoral.html",
            "outreach.html",
            "admin.html",
        ):
            self.assertTrue((CM / "desks" / name).is_file(), name)

    def test_sidebar_no_15_desks_block(self):
        t = (CM / "sidebar_church_layout_v1.html").read_text(encoding="utf-8")
        self.assertNotIn('data-sb-group="desks"', t)
        self.assertNotIn("15 主桌（日常只走這裡）", t)
        self.assertIn("A. 敬拜", t)
        self.assertIn("PAGE_MATURITY_INVENTORY_0AF", t)

    def test_index_topbar_no_desks_button(self):
        t = (CM / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("btn-focus-desks", t)
        self.assertIn("cmZoneBar", t)

    def test_desk_kit_on_sample_pages(self):
        samples = [
            "modules/worship/pulpit-ministry.html",
            "modules/fellowship/pastoral-events.html",
            "modules/expansion/mission-opportunities.html",
            "modules/equipment/equipment-management.html",
        ]
        for rel in samples:
            p = CM / rel
            if not p.is_file():
                continue
            t = p.read_text(encoding="utf-8")
            self.assertIn("cm_desk_kit.js", t, rel)

    def test_print_write_not_broken_by_desk_kit(self):
        critical = [
            "modules/members/member-integrated.html",
            "modules/support/visitation_index.html",
            "modules/finance/finance-integrated.html",
            "modules/volunteer/volunteer-integrated.html",
            "modules/fellowship/small-groups-integrated.html",
            "modules/expansion/outreach-strategy.html",
            "tools/volunteer_shift/list.html",
        ]
        for rel in critical:
            t = (CM / rel).read_text(encoding="utf-8").replace("\r\n", "\n")
            # 誤插特徵：列印字串截斷後直接接 kit 註解（主頁尾部的 </script>\n<!-- kit 不算）
            self.assertNotIn("+'script>\n<!-- b100-cm-desk-kit -->", t, rel)
            self.assertNotIn("+\"script>\n<!-- b100-cm-desk-kit -->", t, rel)
            self.assertNotIn("+ 'script>\n<!-- b100-cm-desk-kit -->", t, rel)
            self.assertRegex(
                t,
                r"""\+\s*['"]script></body></html>['"]""",
                msg="print HTML string must close cleanly: " + rel,
            )
    def test_qa_tracker_doc(self):
        self.assertTrue((CM / "docs" / "QA_TRACKER_0AF_P0.md").is_file())


if __name__ == "__main__":
    unittest.main()
