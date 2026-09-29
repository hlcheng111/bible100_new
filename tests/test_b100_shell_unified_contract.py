#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""B100 壳层统一 · 步 0–7 契约（聚合 CM + Hub guard + index_v5）"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def run_py(rel: str) -> None:
    p = ROOT / rel
    if not p.is_file():
        raise AssertionError("missing test script: " + rel)
    r = subprocess.run(
        [sys.executable, str(p)],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if r.returncode != 0:
        msg = r.stdout + r.stderr
        raise AssertionError(rel + " failed:\n" + msg)


def test_governance_doc_current():
    doc = read("docs/governance/B100_SHELL_UNIFIED_V1.md")
    assert "20260807a" in doc or "20260806d" in doc
    assert "CM OK" in doc
    assert "研讀 focus OK" in doc
    assert "b100_module_nav_ssot" in doc


def test_index_v5_shell_nav_ssot():
    html = read("index_v5.html")
    assert "cm_zone_nav_ssot.js" in html
    assert "navigateShell" in html
    assert "sanitizeContentUrl" in html
    assert "100dvh" in html or "--top-offset" in html


def test_cm_nav_ssot_forbidden_sidebar_in_content():
    js = read("js/cm_zone_nav_ssot.js")
    assert "isSidebarLayoutUrl" in js
    assert "recoverFromSidebarInContent" in js
    assert "20260805f" in js


def test_sidebar_contentframe_guard():
    layout = read("church_ministry/sidebar_church_layout_v1.html")
    assert "frameElement" in layout or "contentFrame" in layout
    assert "data-cm-focus-switch" in read("js/b100_sidebar_render.js")


def test_ae_primary_nav_respects_hub():
    js = read("church_ministry/js/ae_primary_nav.js")
    assert "shouldHideInHub" in js
    assert "if (shouldHideInHub()) return" in js


def test_choir_team_hub_embed():
    choir = read("church_ministry/modules/worship/choir-team.html")
    assert "b100_hub_embed.js" in choir
    assert "ae_subpage_shell.js" in choir


def test_modes_church_landings():
    modes = json.loads(read("config/modes.json"))
    church = next(m for m in modes["modes"] if m["id"] == "church")
    paths = [i.get("path", "") for i in church.get("secondaryNav", []) if i.get("path")]
    assert any("_landing/" in p for p in paths)
    assert not any("sidebar_church_layout_v1.html" in p for p in paths)


def test_standalone_cm_topbar():
    idx = read("church_ministry/index.html")
    assert "cmTopWrap" in idx or "cm-top-wrap" in idx
    assert "cm_zone_nav_ssot.js" in idx
    assert "_landing/gateway.html" in idx


def test_index_v5_module_nav_ssot():
    idx = read("index_v5.html")
    assert "b100_module_nav_ssot.js" in idx


def test_delegate_module_nav_contract():
    run_py("tests/test_b100_module_nav_contract.py")


def test_delegate_cm_contracts():
    run_py("church_ministry/tests/test_cm_hub_content_guard.py")
    run_py("church_ministry/tests/test_cm_focus_sidebar_contract.py")
    run_py("church_ministry/tests/test_cm_zones_4layer_contract.py")
    run_py("tests/test_index_v5_shell.py")


if __name__ == "__main__":
    fails = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print("OK", name)
            except AssertionError as e:
                print("FAIL", name, e)
                fails += 1
    sys.exit(1 if fails else 0)
