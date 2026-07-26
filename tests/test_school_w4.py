# -*- coding: utf-8 -*-
"""
學校管理 W4（課表／小測 UI）靜態檢查
執行：python tests/test_school_w4.py
"""
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAILURES = []


def read(rel):
    with open(os.path.join(ROOT, rel), "r", encoding="utf-8") as f:
        return f.read()


def check(name, ok):
    print(f"[{'OK  ' if ok else 'FAIL'}] {name}")
    if not ok:
        FAILURES.append(name)


def main():
    db = read("school_management/js/school-master-database.js")
    for api in (
        "_ensureProperty()",
        "getRooms()",
        "addRoom(name",
        "_parseTimeRange(timeStr)",
        "_schedulesEnriched()",
        "detectScheduleConflicts()",
        "getWeeklyTimetable(opts)",
        "addCourseSchedule(record)",
        "_ensureGradeExams()",
        "getExamById(examId)",
        "getExams(filter)",
        "addExam(examInput)",
        "getExamCandidates(examId)",
        "batchSaveExamGrades(examId",
    ):
        check(f"資料層：{api}", api in db)
    check("資料層：property.rooms", "property.rooms" in db)

    schedule = read("school_management/manage/courses/schedule.html")
    check("週課表頁：getWeeklyTimetable", "getWeeklyTimetable" in schedule)
    check("週課表頁：detectScheduleConflicts", "detectScheduleConflicts" in schedule or "hasConflict" in schedule)
    check("週課表頁：addCourseSchedule", "addCourseSchedule" in schedule)
    check("週課表頁：教師視角", 'value="teacher"' in schedule)
    check("週課表頁：教室視角", 'value="room"' in schedule)
    check("週課表頁：非 redirect", "location.replace" not in schedule)

    exams = read("school_management/manage/grades/exams.html")
    check("小測頁：addExam", "addExam" in exams)
    check("小測頁：getExamCandidates", "getExamCandidates" in exams)
    check("小測頁：batchSaveExamGrades", "batchSaveExamGrades" in exams)
    check("小測頁：批量登分按鈕", "btnSaveAll" in exams)

    courses_tabs = read("school_management/manage/courses_tabs.html")
    check("課程 Tab：週課表", "courses/schedule.html" in courses_tabs)

    grades_tabs = read("school_management/manage/grades_tabs.html")
    check("成績 Tab：小測", "grades/exams.html" in grades_tabs)

    courses_index = read("school_management/manage/courses/index.html")
    check("課程列表：C 區備課連結", "edu_teaching" in courses_index)
    check("課程列表：無自動 seed", "ensureSeedFull()" not in courses_index)
    check("課程列表：addCourseSchedule 或週課表連結", "addCourseSchedule" in courses_index or "schedule.html" in courses_index)

    grades_index = read("school_management/manage/grades/index.html")
    check("成績管理：無自動 seed", "ensureSeedFull()" not in grades_index)

    dashboard = read("school_management/dashboard.html")
    check("儀表板：週課表捷徑", "courses_tabs.html" in dashboard)
    check("儀表板：小測捷徑", "grades_tabs.html" in dashboard)

    print()
    if FAILURES:
        print(f"共 {len(FAILURES)} 項失敗：")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    print("全部通過 ✅")


if __name__ == "__main__":
    main()
