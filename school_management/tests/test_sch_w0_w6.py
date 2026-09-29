"""School Management W0–W6 · 情境 / 护栏 / 工作台 / 同步."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCH = ROOT / "school_management"


def test_scenario_ssot():
    t = (ROOT / "js/sch_scenario_ssot.js").read_text(encoding="utf-8")
    assert "today_attendance" in t
    assert "enroll_review" in t
    assert "finance_reconcile" in t


def test_member_guard():
    t = (ROOT / "js/sch_member_guard.js").read_text(encoding="utf-8")
    assert "createStudentFromMember" in t
    assert "CentralMemberDB" in t or "memberSystemData" in t
    assert "admitStudent" in t


def test_validation():
    t = (ROOT / "js/sch_validation.js").read_text(encoding="utf-8")
    assert "checkScheduleCollision" in t
    assert "enrollStudent" in t
    assert "syncTuitionForEnrollment" in t


def test_sync_bridge():
    t = (ROOT / "js/sch_sync_bridge.js").read_text(encoding="utf-8")
    assert "importBundle" in t
    assert "quickBackupDownload" in t
    assert "merge" in t


def test_academic_integrated():
    t = (SCH / "manage/academic_integrated.html").read_text(encoding="utf-8")
    shell = (SCH / "js/sch_workbench_shell.js").read_text(encoding="utf-8")
    assert "sch-wb-scenarios" in t
    assert "sch_member_guard" in t
    assert 'data-tab="today"' in t
    assert "attendance/index.html" in shell


def test_attendance_page():
    t = (SCH / "manage/attendance/index.html").read_text(encoding="utf-8")
    assert "student.attendance" in t
    assert "btnSaveAll" in t


def test_modes_workbench():
    t = (ROOT / "config/modes.json").read_text(encoding="utf-8")
    assert "academic_integrated.html" in t
    assert "结业登记" in t or "Graduation" in t


def test_dashboard_redirect():
    t = (SCH / "dashboard.html").read_text(encoding="utf-8")
    assert "academic_integrated" in t


def test_sidebar_workbench():
    t = (SCH / "sidebar.html").read_text(encoding="utf-8")
    assert "academic_integrated" in t
    assert "结业登记" in t or "Graduation" in t
    assert "W6" not in t or "名册对齐" in t  # no W6 in church link label


def test_landing_scenarios():
    t = (SCH / "_landing/home.html").read_text(encoding="utf-8")
    assert "sch-scenario-home" in t
    assert "sch_scenario_ssot" in t
    assert "妙用说明" in t


def test_course_completion_offline():
    t = (SCH / "course_completion.html").read_text(encoding="utf-8")
    assert "cdn.tailwindcss.com" not in t
    assert "supabase" not in t.lower()
    assert "module_common.css" in t


if __name__ == "__main__":
    tests = [
        test_scenario_ssot,
        test_member_guard,
        test_validation,
        test_sync_bridge,
        test_academic_integrated,
        test_attendance_page,
        test_modes_workbench,
        test_dashboard_redirect,
        test_sidebar_workbench,
        test_landing_scenarios,
        test_course_completion_offline,
    ]
    failed = 0
    for fn in tests:
        try:
            fn()
            print("OK:", fn.__name__)
        except AssertionError as e:
            failed += 1
            print("FAIL:", fn.__name__, e)
    raise SystemExit(failed)
