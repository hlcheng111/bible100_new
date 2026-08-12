"""AI Lab W0–W6 · 情境 / 护栏 / 桥接 / integrated 工作台."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
AI = ROOT / "ai_tools"


def test_guardrails_js():
    t = (ROOT / "js/b100_prompt_guardrails.js").read_text(encoding="utf-8")
    assert "wrap" in t and "B100 護欄" in t


def test_scenario_ssot():
    t = (ROOT / "js/ai_scenario_ssot.js").read_text(encoding="utf-8")
    assert "ss_quiz_5" in t
    assert "care_sms" in t
    assert len(t) > 200


def test_ministry_bridge():
    t = (ROOT / "js/ai_ministry_bridge.js").read_text(encoding="utf-8")
    assert "importToDesk" in t
    assert "education_quiz" in t
    assert "pastoral_care" in t


def test_workbench_integrated():
    t = (AI / "tools/ai_workbench_integrated.html").read_text(encoding="utf-8")
    assert "ai-wb-scenarios" in t
    assert "ai-wb-platforms" in t
    assert "ai-wb-bridge" in t
    assert "b100_prompt_guardrails" in t


def test_modes_workbench_path():
    t = (ROOT / "config/modes.json").read_text(encoding="utf-8")
    assert "ai_workbench_integrated.html" in t


def test_dashboard_redirect():
    t = (AI / "dashboard.html").read_text(encoding="utf-8")
    assert "ai_workbench_integrated" in t


def test_prompt_embedded():
    p = ROOT / "js/ai_prompt_templates_embedded.js"
    assert p.exists(), "run node scripts/generate_ai_prompt_embedded.js"
    assert "大卫与歌利亚" in p.read_text(encoding="utf-8")


def test_home_scenario_section():
    t = (AI / "_landing/home.html").read_text(encoding="utf-8")
    assert "ai-scenario-home" in t
    assert "ai_scenario_ssot" in t


def test_sidebar_workbench():
    t = (AI / "sidebar_lab.html").read_text(encoding="utf-8")
    assert "ai_workbench_integrated" in t
    assert "pastoral-integrated" in t


if __name__ == "__main__":
    tests = [
        test_guardrails_js,
        test_scenario_ssot,
        test_ministry_bridge,
        test_workbench_integrated,
        test_modes_workbench_path,
        test_dashboard_redirect,
        test_prompt_embedded,
        test_home_scenario_section,
        test_sidebar_workbench,
    ]
    failed = 0
    for fn in tests:
        try:
            fn()
            print("OK:", fn.__name__)
        except AssertionError as e:
            failed += 1
            print("FAIL:", fn.__name__, e)
    raise SystemExit(1 if failed else 0)
