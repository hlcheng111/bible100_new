# -*- coding: utf-8 -*-
"""
學校管理 W8（AI Prompt 生成器）＋營運 SOP 手冊 靜態檢查
執行：python tests/test_school_w8.py
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
        "listSchoolAiPromptTypes()",
        "buildSchoolAiPrompt(type",
        "getStudentGradeSummary(studentId",
        "SCHOOL_AI_DISCLAIMER",
        "enrollment_promo",
        "grade_comment",
        "exam_questions",
        "notice_translate",
        "copy_only: true",
        "no_api: true",
    ):
        check(f"資料層：{api}", api in db)

    page = read("school_management/manage/ai_prompts/index.html")
    check("AI 頁：buildSchoolAiPrompt", "buildSchoolAiPrompt" in page)
    check("AI 頁：複製按鈕", "btnCopy" in page)
    check("AI 頁：四種任務", "enrollment_promo" in page and "grade_comment" in page)
    check("AI 頁：人審提示", "人工審核" in page)
    check("AI 頁：護欄腳本", "prompt_guardrails" in page)

    tabs = read("school_management/manage/ai_prompts_tabs.html")
    check("AI Tab 殼", "ai_prompts/index.html" in tabs)

    brochure = read("school_management/enrollment_brochure.html")
    check("招生簡章：W8 連結", "ai_prompts_tabs.html" in brochure)

    exams = read("school_management/manage/grades/exams.html")
    check("小測頁：W8 連結", "ai_prompts" in exams)

    sidebar = read("school_management/sidebar.html")
    check("側欄：AI Prompt", "ai_prompts_tabs.html" in sidebar)
    check("側欄：SOP 手冊", "SCHOOL_OPERATIONS_SOP_HANDBOOK.md" in sidebar)

    dashboard = read("school_management/dashboard.html")
    check("儀表板：W8 捷徑", "ai_prompts_tabs.html" in dashboard)

    handbook = read("school_management/docs/SCHOOL_OPERATIONS_SOP_HANDBOOK.md")
    for sop in ("SOP-1", "SOP-2", "SOP-3", "SOP-4", "SOP-5", "SOP-6", "SOP-7", "SOP-8", "SOP-9"):
        check(f"手冊：{sop}", sop in handbook)
    check("手冊：W8 附錄", "W8 AI Prompt" in handbook)

    sop_main = read("school_management/docs/SCHOOL_IMPROVEMENT_PLAN_SOP_V1.md")
    check("主 SOP：手冊連結", "SCHOOL_OPERATIONS_SOP_HANDBOOK.md" in sop_main)
    check("主 SOP：W8 里程碑", "W8 | AI Prompt" in sop_main)

    print()
    if FAILURES:
        print(f"共 {len(FAILURES)} 項失敗：")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    print("全部通過 ✅")


if __name__ == "__main__":
    main()
