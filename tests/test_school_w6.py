# -*- coding: utf-8 -*-
"""
學校管理 W6（教會連結：名冊對齊／缺席→牧養預填）靜態檢查
執行：python tests/test_school_w6.py
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
        "buildRosterAlignmentReport()",
        "_readEducationSystemData()",
        "listSchoolAbsenceWarnings(threshold)",
        "listEducationAbsenceWarnings(threshold)",
        "buildAbsencePastoralPrefills(opts)",
        "queueCrmIntentPrefills(intents",
        "getPendingCrmIntentQueue()",
        "removePendingCrmIntent(entryId)",
        "routeCrmIntentFromQueue(entryId",
        "pushTeacherSkillsToSmartMinistry(teacherId",
        "bible100_crm_intent_v2_pending",
        "visitation_followup.create",
        "getChurchLinkSettings()",
        "setChurchLinkSettings(",
        "_resolvePastoralMemberForWarning",
        "ABSENCE_ALERT_COUNT",
        "due_date",
        "SmartMinistryCanonical",
        "setTalentSkills",
    ):
        check(f"資料層：{api}", api in db)

    link = read("school_management/manage/church_link/index.html")
    check("教會連結頁：名冊對齊", "buildRosterAlignmentReport" in link)
    check("教會連結頁：三欄 UI", "colAligned" in link and "colSsOnly" in link and "colSchoolOnly" in link)
    check("教會連結頁：缺席掃描", "buildAbsencePastoralPrefills" in link)
    check("教會連結頁：設定面板", "getChurchLinkSettings" in link)
    check("教會連結頁：W7 連結", "communication/parent.html" in link)
    check("教會連結頁：CRM 佇列", "queueCrmIntentPrefills" in link)
    check("教會連結頁：探訪表單", "visitation_followup/form.html" in link)
    check("教會連結頁：智慧事奉", "pushTeacherSkillsToSmartMinistry" in link)
    check("教會連結頁：載入 CRM router", "crm_intent_router.js" in link)

    tabs = read("school_management/manage/church_link_tabs.html")
    check("教會連結 Tab 殼", "church_link/index.html" in tabs)

    sidebar = read("school_management/sidebar.html")
    check("側欄：教會連結", "church_link_tabs.html" in sidebar)

    dashboard = read("school_management/dashboard.html")
    check("儀表板：教會連結捷徑", "church_link_tabs.html" in dashboard)

    integration = read("school_management/manage/module_integration.html")
    check("整合說明：W6 卡片", "buildRosterAlignmentReport" in integration)

    teachers = read("school_management/manage/teachers/index.html")
    check("教師頁：W6 連結", "church_link_tabs.html" in teachers)

    print()
    if FAILURES:
        print(f"共 {len(FAILURES)} 項失敗：")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    print("全部通過 ✅")


if __name__ == "__main__":
    main()
