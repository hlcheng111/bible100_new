# -*- coding: utf-8 -*-
"""G 規劃行政 L2 事工桌 · 導航 SSOT 靜態檢查（W3/W4）。"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]

G_SIDEBAR = "church_planning/sidebar_plan_v5_preview.html"
G_CONTENT = "church_planning/index_plan.html"

RUNTIME_GLOBS = ("*.html", "*.js", "*.json")
SKIP_PARTS = (
    "backups/",
    "_tmp_",
    "node_modules/",
    "index_v5 - ",
    "planning_surveys/",
    "docs/",
    "sidebar_plan.html",  # 舊檔 redirect stub 自身
)


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def iter_runtime_files():
    for pattern in RUNTIME_GLOBS:
        for path in ROOT.rglob(pattern):
            rel = path.relative_to(ROOT).as_posix()
            if any(s in rel for s in SKIP_PARTS):
                continue
            if rel == "church_planning/sidebar_plan.html":
                continue
            yield rel, path


def test_modes_json_g_uses_v5_sidebar():
    modes = json.loads(read("config/modes.json"))
    church = next(m for m in modes["modes"] if m["id"] == "church")
    g = next(i for i in church["secondaryNav"] if i.get("labelShort") == "G")
    assert g["sidebar"] == G_SIDEBAR
    assert g["path"] == G_CONTENT


def test_index_v5_g_plan_sidebar_constant():
    html = read("index_v5.html")
    assert "G_PLAN_SIDEBAR = 'church_planning/sidebar_plan_v5_preview.html'" in html
    assert "function openChurchGZone" in html


def test_g_v5_sidebar_structure():
    html = read(G_SIDEBAR)
    assert "sb-preview-tag" not in html
    assert "sb-mode-row" not in html
    assert "sb-novice-hint" not in html
    assert "📂 戰略規劃" in html
    assert "📂 行政管理" in html
    for needle in (
        "index_plan.html",
        "assessment-os-hub.html",
        "cta-os-war-room.html",
        "landing_g_admin.html",
    ):
        assert needle in html, f"missing G tool link: {needle}"


def test_church_map_g_zone_title_only():
    html = read("church_ministry/sidebar_church_layout_v1.html")
    assert "▶" in html
    assert G_SIDEBAR in html
    assert "cm-g-landing-hint" not in html
    assert "assessment-os-hub" not in html


def test_no_runtime_nav_to_legacy_sidebar_plan():
    """Hub/CRM 等 runtime 不得再硬編 sidebar_plan.html（redirect stub 除外）。"""
    pat = re.compile(r"church_planning/sidebar_plan\.html")
    hits = []
    for rel, path in iter_runtime_files():
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if pat.search(text):
            hits.append(rel)
    assert not hits, "legacy sidebar_plan.html refs: " + ", ".join(sorted(hits)[:20])


def test_church_tools_manifest_g_sidebar():
    js = read("js/church_tools_manifest.js")
    assert "church_planning/sidebar_plan.html" not in js
    assert G_SIDEBAR in js


if __name__ == "__main__":
    import sys

    n = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except AssertionError as e:
                print("FAIL", name, e)
                n += 1
    sys.exit(1 if n else 0)
