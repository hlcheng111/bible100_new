# -*- coding: utf-8 -*-
"""
學校管理 W3（學年／招生簡章／可列印證書）靜態檢查
執行：python tests/test_school_w3.py
"""
import os
import re
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
        "_ensureMeta()",
        "getAcademicYears()",
        "getCurrentSemesterId()",
        "getDefaultSemester()",
        "getCurrentSemesterInfo()",
        "setCurrentSemester(semesterId)",
        "addAcademicYear(label",
        "addSemesterToYear(yearId",
        "getEnrollmentBrochureIntroHtml()",
        "buildEnrollmentBrochureHtml()",
        "checkCourseCompletion(studentId",
        "generateCertificateNo()",
        "getCompletionCandidates(courseId",
        "issueCertificate(studentId",
        "buildCertificateHtml(certOrId)",
    ):
        check(f"資料層：{api}", api in db)
    check("資料層：meta.academicYears", "meta.academicYears" in db)
    check("資料層：meta.certificates", "meta.certificates" in db)
    check("資料層：證書編號 SCH-CERT", "SCH-CERT-" in db)

    academic = read("school_management/manage/academic_settings.html")
    check("學年頁：存在", True)
    check("學年頁：setCurrentSemester", "setCurrentSemester" in academic)
    check("學年頁：addAcademicYear", "addAcademicYear" in academic)
    check("學年頁：addSemesterToYear", "addSemesterToYear" in academic)

    brochure = read("school_management/enrollment_brochure.html")
    check("招生簡章：buildEnrollmentBrochureHtml", "buildEnrollmentBrochureHtml" in brochure)
    check("招生簡章：文案 key", "school_html_editor_enrollment_brochure" in brochure)
    check("招生簡章：列印", "btnPrint" in brochure)
    check("招生簡章：學員入口連結", 'href="portal/index.html"' in brochure)

    certs = read("school_management/manage/graduation_certificates.html")
    check("證書頁：getCompletionCandidates", "getCompletionCandidates" in certs)
    check("證書頁：issueCertificate", "issueCertificate" in certs)
    check("證書頁：buildCertificateHtml", "buildCertificateHtml" in certs)

    system_tabs = read("school_management/manage/system_tabs.html")
    check("系統 Tab：學年學期", "academic_settings.html" in system_tabs)

    grades_tabs = read("school_management/manage/grades_tabs.html")
    check("成績 Tab：結業證書", "graduation_certificates.html" in grades_tabs)

    sidebar = read("school_management/sidebar.html")
    check("側欄：招生簡章", "enrollment_brochure.html" in sidebar)

    dashboard = read("school_management/dashboard.html")
    check("儀表板：招生簡章捷徑", "enrollment_brochure.html" in dashboard)
    check("儀表板：目前學期卡", "currentSemesterLabel" in dashboard)
    check("儀表板：getCurrentSemesterInfo", "getCurrentSemesterInfo" in dashboard)

    tuition = read("school_management/manage/finance/tuition.html")
    check("學費頁：getDefaultSemester", "getDefaultSemester" in tuition)
    check("學費頁：無硬編碼 value=\"2024-2\"", 'value="2024-2"' not in tuition)

    portal = read("school_management/portal/index.html")
    check("學員入口：選課用 getDefaultSemester", "getDefaultSemester" in portal)
    check("學員入口：無硬編碼 semester: '2025-1'", "semester: '2025-1'" not in portal)

    completion = read("school_management/course_completion.html")
    check("完課頁：checkCourseCompletion", "checkCourseCompletion" in completion)
    check("完課頁：issueCertificate", "issueCertificate" in completion)
    check("完課頁：證書頁連結", "graduation_certificates.html" in completion)

    print()
    if FAILURES:
        print(f"共 {len(FAILURES)} 項失敗：")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    print("全部通過 ✅")


if __name__ == "__main__":
    main()
