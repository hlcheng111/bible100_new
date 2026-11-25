#!/usr/bin/env python3
"""
階段 2 抓到並修好的問題，鎖住不再回來（純靜態檢查，不開瀏覽器）。
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def test_worship_integrated_loads_master_db_once():
    t = read("church_ministry/modules/worship/worship-integrated.html")
    assert t.count("church-master-database.js") == 1, "重複載入會丟『已宣告』語法錯誤"


def test_no_page_loads_master_db_twice():
    bad = []
    for p in (ROOT / "church_ministry").rglob("*.html"):
        if "_archive" in p.parts or "audit" in p.parts:
            continue
        t = p.read_text(encoding="utf-8", errors="ignore")
        # 排除註解裡的提及
        t = re.sub(r"<!--.*?-->", "", t, flags=re.S)
        if len(re.findall(r'<script[^>]+src="[^"]*church-master-database\.js', t)) > 1:
            bad.append(str(p.relative_to(ROOT)))
    assert not bad, bad


def test_people_list_exposes_inline_tab_handler():
    t = read("church_ministry/people/people_list.html")
    assert "onclick=\"switchTab(" in t
    assert "window.switchTab = switchTab" in t


def test_planning_inline_onclick_values_are_attribute_safe():
    """onclick="..." 內不可放 JSON.stringify 的雙引號字串（屬性會被截斷）。"""
    for rel in ("church_planning/js/planning_hub_render.js",):
        t = read(rel)
        assert "planningOpenByToolId(event,\" + JSON.stringify" not in t
    for rel in ("church_planning/js/planning_zone_rail.js", "church_planning/js/planning_sidebar_g_menu.js"):
        t = read(rel)
        assert "JSON.stringify(" in t and t.count("function jsAttr") == 1, rel
        # 所有 JSON.stringify 只能出現在 jsAttr 本身
        assert len(re.findall(r"JSON\.stringify\(", t)) == 1, rel


def test_module_pages_css_paths_exist():
    """modules/<子資料夾>/*.html 的 href="assets/css/…" 必須真的存在（曾有 32 頁指到不存在的位置）。"""
    bad = []
    for p in (ROOT / "church_ministry" / "modules").glob("*/*.html"):
        t = p.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'href="(assets/(?:css|webfonts)/[^"?#]+)', t):
            if not (p.parent / m.group(1)).exists():
                bad.append(f"{p.relative_to(ROOT)} -> {m.group(1)}")
    assert not bad, bad[:5]


def test_sermon_notes_report_buttons_have_handlers():
    t = read("church_ministry/modules/worship/sermon-notes-admin.html")
    assert "function exportTemplateCsv" in t and "function printTemplate" in t


def test_pastoral_tabs_use_postmessage_bridge():
    bridge = read("church_ministry/js/pastoral_shell_bridge.js")
    assert "postMessage" in bridge and "embed" in bridge


if __name__ == "__main__":
    failed = 0
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        try:
            fn()
            print(f"PASS {name}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            print(f"FAIL {name}: {type(e).__name__}: {e}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    raise SystemExit(1 if failed else 0)
