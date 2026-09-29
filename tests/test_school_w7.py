# -*- coding: utf-8 -*-
"""
學校管理 W7（家長通知草稿）靜態檢查
執行：python tests/test_school_w7.py
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
        "buildParentNoticeDraft(studentId",
        "saveParentNoticeDraft(draft)",
        "listParentNoticeTypes()",
        "tuition_reminder",
        "absence_care",
        "activity_notice",
        "copy_only: true",
        "只產生文字",
    ):
        check(f"資料層：{api}", api in db)

    parent = read("school_management/manage/communication/parent.html")
    check("家長頁：產生草稿", "buildParentNoticeDraft" in parent)
    check("家長頁：複製全文", "btnCopy" in parent)
    check("家長頁：存為草稿", "saveParentNoticeDraft" in parent)
    check("家長頁：不會發送提示", "不會發送" in parent)
    check("家長頁：無自動 seed", "ensureSeedFull" not in parent)
    check("家長頁：缺席關懷", "absence_care" in parent)
    check("家長頁：繳費提醒", "tuition_reminder" in parent)

    tabs = read("school_management/manage/communication_tabs.html")
    check("溝通 Tab：W7 標籤", "家長通知草稿 W7" in tabs)

    comm = read("school_management/manage/communication/index.html")
    check("溝通首頁：W7 入口", "家長通知草稿 W7" in comm)
    check("溝通首頁：無自動 seed", "ensureSeedFull" not in comm)

    sop = read("school_management/docs/SCHOOL_IMPROVEMENT_PLAN_SOP_V1.md")
    check("SOP：W7 里程碑", "W7 | 家長通知草稿" in sop)

    print()
    if FAILURES:
        print(f"共 {len(FAILURES)} 項失敗：")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    print("全部通過 ✅")


if __name__ == "__main__":
    main()
