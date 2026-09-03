# -*- coding: utf-8 -*-
"""AI Lab Wave b/c：智慧事奉真路徑；口述預填收進教會行政。"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def modes():
    return json.loads(read("config/modes.json"))


def test_wave_b_smart_true_path():
    ai = next(m for m in modes()["modes"] if m["id"] == "ai")
    nav = ai.get("secondaryNav") or []
    smart = next((i for i in nav if "smart_ministry/" in str(i.get("path", ""))), None)
    assert smart, "ai secondaryNav missing smart_ministry"
    assert "smart_ministry/landing.html" in str(smart.get("path"))
    assert "smart_ministry/sidebar.html" in str(smart.get("sidebar"))
    assert not any("ai_tools/dashboard.html" == str(i.get("path", "")).split("?")[0] for i in nav if isinstance(i, dict) and i.get("path"))
    assert (ROOT / "smart_ministry/landing.html").is_file()
    assert (ROOT / "smart_ministry/sidebar.html").is_file()
    idx = read("index_v5.html")
    assert "smart_ministry/landing.html" in idx
    assert "openAISmartMinistry" in idx
    assert "enableModuleShellEmbedLayout();" not in idx.split("function openAISmartMinistry")[1].split("function ")[0]


def test_wave_c_prefill_on_church_admin():
    church = next(m for m in modes()["modes"] if m["id"] == "church")
    nav = church.get("secondaryNav") or []
    prefill = next((i for i in nav if "crm_automation_console" in str(i.get("path", ""))), None)
    assert prefill, "church secondaryNav missing 口述預填"
    assert "sidebar_church_layout_v1" in str(prefill.get("sidebar"))
    ai = next(m for m in modes()["modes"] if m["id"] == "ai")
    assert not any("crm_automation_console" in str(i.get("path", "")) for i in (ai.get("secondaryNav") or []) if isinstance(i, dict))
    sb = read("church_ministry/sidebar_church_layout_v1.html")
    assert "crm_automation_console.html" in sb
    assert "口述預填" in sb
    idx = read("index_v5.html")
    assert "selectedMode = 'church'" in idx.split("function openCrmAutomationConsole")[1].split("function ")[0]
    assert "口述預填" in idx


def test_modules_json_smart_landing():
    data = json.loads(read("config/modules.json"))
    sm = next(m for m in data["modules"] if m["id"] == "smart_ministry")
    assert "landing.html" in sm["path"]
    assert "sidebar.html" in sm["sidebar"]


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
    raise SystemExit(1 if fails else 0)
