"""Task B/C：四賽道資料模型 + PC Landing 靜態檢查"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHELL = ROOT / "shell"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_manifest_four_tracks():
    manifest = json.loads((SHELL / "data" / "reading_tracks_manifest.json").read_text(encoding="utf-8"))
    ids = [t["id"] for t in manifest["tracks"]]
    assert ids == ["bible66", "30day", "golden", "theme"]
    golden = next(t for t in manifest["tracks"] if t["id"] == "golden")
    assert "countNoteZh" in golden
    assert "40" in golden["countNoteZh"]


def test_track_registry_api():
    src = read(SHELL / "js" / "track_registry.js")
    for token in ("normalize30Day", "normalizeGolden", "normalizeTheme", "normalizeBible66", "loadAllSummaries", "readUrl"):
        assert token in src, f"missing {token}"


def test_tracks_use_registry_readlink():
    for name in ("track_30day.js", "track_golden.js", "track_theme.js"):
        src = read(SHELL / "js" / name)
        assert "B100TrackRegistry" in src, f"{name} should use B100TrackRegistry"


def test_landing_page_exists():
    html = read(SHELL / "pages" / "landing.html")
    assert "trackCards" in html
    assert "quickStartBtn" in html
    assert "landingReassure" in html
    assert "landing-flow" in html
    assert "landing-help" in html
    assert "landingExplore" in html
    assert "track_registry.js" in html
    assert "landing_tracks.js" in html
    assert "landing-tracks.css" in html


def test_landing_minimal_first_screen():
    js = read(SHELL / "js" / "landing_tracks.js")
    html = read(SHELL / "pages" / "landing.html")
    assert "tagline" in js
    assert "reassure" in js
    assert "flowSteps" in js
    assert "landing-cta__btn" in html
    assert "helpWhat" in html


def test_landing_cards_show_track_letters_and_40_note():
    src = read(SHELL / "js" / "landing_tracks.js")
    assert "TRACK_LETTERS" in src
    assert "Track ' + letter" in src
    assert "bindActions" in src
    assert "loadAllSummaries" in src
    assert "首批 40" in read(SHELL / "data" / "reading_tracks_manifest.json")
    assert "s.id === 'golden'" in src


def test_shell_today_and_version():
    html = read(ROOT / "index.html")
    assert "btnToday" in html
    assert "shellVersion" in html
    assert "data-i18n-html=\"bannerPreview\"" in html
    assert "more-advanced" in html
    assert "btnBible100" in html
    i18n = read(SHELL / "js" / "shell_i18n.js")
    assert "rowHelp" in i18n
    assert "bannerPreview" in i18n


def test_shell_defaults_to_landing():
    html = read(ROOT / "index.html")
    assert "pages/landing.html" in html
    nav = read(SHELL / "js" / "shell_nav.js")
    assert "LANDING_PAGE" in nav
    assert "pages/landing.html" in nav
    assert "location.protocol === 'file:'" in nav
    assert "shouldResume" in nav


def test_file_preview_always_landing():
    nav = read(SHELL / "js" / "shell_nav.js")
    assert "if (location.protocol === 'file:') return false" in nav
    assert "if (location.protocol === 'file:')" in nav


def test_landing_auxiliary_row():
    html = read(SHELL / "pages" / "landing.html")
    js = read(SHELL / "js" / "landing_tracks.js")
    assert "landing-aux" in html
    assert 'data-aux="pacing"' in html
    assert "goAux" in js
    assert "auxPacing" in js


def test_maintainer_checklist_doc():
    doc = ROOT / "docs" / "LANDING_MAINTAINER_CHECKLIST.md"
    assert doc.is_file()
    text = doc.read_text(encoding="utf-8")
    assert "file://" in text
    assert "ASSET_V" in text


def test_product_scope_freeze_doc():
    doc = ROOT / "docs" / "PRODUCT_SCOPE_FREEZE.md"
    assert doc.is_file()
    text = doc.read_text(encoding="utf-8")
    assert "/bible_app/" in text
    assert "index_v5" in text
    assert "in-shell-iframe" in text or "主環" in text


def test_r1_embed_ui_css():
    plain = read(SHELL / "css" / "bible-reader-plain.css")
    boot = read(SHELL / "js" / "page_boot.js")
    assert "in-shell-iframe" in plain
    assert "B100ShellEmbed" in boot


def test_data_bundle_includes_manifest():
    bundle = read(SHELL / "js" / "data_bundle.js")
    assert "tracksManifest" in bundle


def test_node_counts_from_data():
    """節點總數應與既有 JSON 一致（抽樣）"""
    thirty = json.loads((SHELL / "data" / "thirty_day_plan.json").read_text(encoding="utf-8"))
    golden = json.loads((SHELL / "data" / "golden_verses_100.json").read_text(encoding="utf-8"))
    thematic = json.loads((SHELL / "data" / "thematic_readings.json").read_text(encoding="utf-8"))
    books = json.loads((SHELL / "data" / "books.json").read_text(encoding="utf-8"))

    assert len(thirty["days"]) == 30
    assert len(golden["verses"]) == 40
    theme_units = sum(len(t.get("units", [])) for t in thematic["themes"])
    assert theme_units >= 20
    total_chapters = sum(b["chapters"] for b in books["books"])
    assert total_chapters == 1189


def main() -> int:
    tests = [
        test_manifest_four_tracks,
        test_track_registry_api,
        test_tracks_use_registry_readlink,
        test_landing_page_exists,
        test_landing_minimal_first_screen,
        test_landing_cards_show_track_letters_and_40_note,
        test_shell_today_and_version,
        test_shell_defaults_to_landing,
        test_file_preview_always_landing,
        test_landing_auxiliary_row,
        test_maintainer_checklist_doc,
        test_product_scope_freeze_doc,
        test_r1_embed_ui_css,
        test_data_bundle_includes_manifest,
        test_node_counts_from_data,
    ]
    failed = 0
    for fn in tests:
        try:
            fn()
            print(f"OK  {fn.__name__}")
        except AssertionError as e:
            failed += 1
            print(f"FAIL {fn.__name__}: {e}")
    if failed:
        print(f"\n{failed} failed")
        return 1
    print(f"\nAll {len(tests)} checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
