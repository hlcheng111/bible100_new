# -*- coding: utf-8 -*-

"""D/E 區 Phase A：學生路徑收斂（不鏈備課工作台）。"""

from pathlib import Path



ROOT = Path(__file__).resolve().parents[1]

PAGE_D = ROOT / "bible_app" / "shell" / "pages" / "ai-qna.html"

PAGE_E = ROOT / "bible_app" / "shell" / "pages" / "ai-tutor.html"

JS_D = ROOT / "bible_app" / "shell" / "js" / "ai_qna_hub.js"

JS_E = ROOT / "bible_app" / "shell" / "js" / "ai_tutor_hub.js"

JS_BRIDGE = ROOT / "bible_app" / "shell" / "js" / "bridge.js"

JS_NAV = ROOT / "bible_app" / "shell" / "js" / "page_nav_bar.js"

WB = ROOT / "ai_tools" / "tools" / "ai_workbench_integrated.html"





def test_ai_qna_page_student_first():

    html = PAGE_D.read_text(encoding="utf-8")

    assert "ai_qna_hub.js" in html

    assert "bridge.js" in html

    assert "先做這件事" in html

    assert "btnQnaGen" in html

    assert "qnaExtLinks" in html

    assert "qnaLinks" not in html





def test_ai_qna_hub_no_workbench_on_track():

    src = JS_D.read_text(encoding="utf-8")

    assert "qna/index.html" in src

    assert "ai_workbench_integrated" not in src

    assert "guide_reading_hub" not in src

    assert "buildExtensionLinks" in src





def test_ai_tutor_links_guide_reading():

    html = PAGE_E.read_text(encoding="utf-8")

    src = JS_E.read_text(encoding="utf-8")

    assert "ai_tutor_hub.js" in html

    assert "三鏡頭" in html

    assert "guide_reading_hub.html" in src

    assert "ai_workbench" not in src





def test_bridge_read_done_student_two_cards():

    src = JS_BRIDGE.read_text(encoding="utf-8")

    assert "readDoneStudentTools" in src

    done_block = src.split("readDoneStudentTools")[1].split("function probeHubAi")[0]

    assert "ai-qna.html" in done_block

    assert "ai-tutor.html" in done_block

    assert "ai_text_to_image" not in done_block

    assert "hubTools" not in done_block





def test_zone_dock_post_read_only():

    src = JS_NAV.read_text(encoding="utf-8")

    assert "isPostReadPage" in src

    assert "reader-multilang.html" in src

    assert "read-done.html" in src

    assert "pacing.html" not in src.split("renderZoneDock")[1].split("function renderSupplyExtras")[0]


def test_ai_qna_empty_context_guidance():

    src = JS_D.read_text(encoding="utf-8")

    assert "ctx-bar--empty" in src

    assert "landingHref" in src

    assert "尋寶地圖" in src





def test_workbench_integrated_exists():

    t = WB.read_text(encoding="utf-8")

    assert "ai-wb-scenarios" in t

    assert "tab-prompt" in t





def test_guide_reading_hub_reads_passage_query():

    t = (ROOT / "ai_tools" / "pages" / "guide_reading_hub.html").read_text(encoding="utf-8")

    assert "sp.get('passage')" in t or 'sp.get("passage")' in t





if __name__ == "__main__":

    test_ai_qna_page_student_first()

    test_ai_qna_hub_no_workbench_on_track()

    test_ai_tutor_links_guide_reading()

    test_bridge_read_done_student_two_cards()

    test_zone_dock_post_read_only()

    test_ai_qna_empty_context_guidance()

    test_workbench_integrated_exists()

    test_guide_reading_hub_reads_passage_query()

    print("ok")

