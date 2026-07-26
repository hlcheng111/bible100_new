# -*- coding: utf-8 -*-
"""
學校管理 W1（中央會友庫接通）靜態檢查
- 資料層：isCentralMemberLink / getCentralMembers / getMemberLinkStats
- 學生新增表單與列表：會友選人 → linkStudentToMember、pending 取錄
- 教師頁：linkTeacherToVolunteer
- 儀表板：已連結會友比例卡
- 學員入口：註冊 pending、不手動指定 id
執行：python tests/test_school_w1.py
"""
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(rel):
    with open(os.path.join(ROOT, rel), "r", encoding="utf-8") as f:
        return f.read()


FAILURES = []


def check(name, ok):
    print(f"[{'OK  ' if ok else 'FAIL'}] {name}")
    if not ok:
        FAILURES.append(name)


def main():
    db_js = read("school_management/js/school-master-database.js")
    check("資料層：isCentralMemberLink（排除 sm-* 自造 ID）",
          "isCentralMemberLink(value)" in db_js and "sm-(stu|tea|link)-" in db_js)
    check("資料層：getCentralMembers 讀 memberSystemData",
          "getCentralMembers()" in db_js and "memberSystemData" in db_js)
    check("資料層：getMemberLinkStats 統計",
          "getMemberLinkStats()" in db_js and "students_linked" in db_js and "students_pending" in db_js)

    add_page = read("school_management/manage/students/add.html")
    check("學生新增：會友選人下拉", 'id="memberSelect"' in add_page)
    check("學生新增：呼叫 linkStudentToMember", "linkStudentToMember(rec.id, memberId)" in add_page)
    check("學生新增：名單來自 getCentralMembers", "getCentralMembers" in add_page)

    stu_index = read("school_management/manage/students/index.html")
    check("學生列表：連結卡呼叫 linkStudentToMember", "linkStudentToMember(sid, mid)" in stu_index)
    check("學生列表：pending 取錄按鈕", "btn-admit" in stu_index and "status: 'active'" in stu_index)
    check("學生列表：會友欄", "isCentralMemberLink" in stu_index)
    check("學生列表：無自動 seed 呼叫",
          not re.search(r"ensureSeedFull\s*\(\s*\)", stu_index))

    tea_index = read("school_management/manage/teachers/index.html")
    check("教師頁：呼叫 linkTeacherToVolunteer", "linkTeacherToVolunteer(tid, mid)" in tea_index)
    check("教師頁：已連結義工統計", 'id="statLinked"' in tea_index)
    check("教師頁：無自動 seed 呼叫",
          not re.search(r"ensureSeedFull\s*\(\s*\)", tea_index))

    dashboard = read("school_management/dashboard.html")
    check("儀表板：會友連結比例卡", 'id="linkStudents"' in dashboard and "getMemberLinkStats" in dashboard)
    check("儀表板：待取錄數", 'id="pendingStudents"' in dashboard)

    portal = read("school_management/portal/index.html")
    check("學員入口：註冊為 pending", "status: 'pending'" in portal)
    check("學員入口：不手動指定 id（交由 insert 配時間戳）", "maxId" not in portal)
    check("學員入口：pending 不入模擬登入下拉", "s.status !== 'pending'" in portal)
    check("學員入口：無自動 seed 呼叫",
          not re.search(r"ensureSeedFull\s*\(\s*\)", portal))

    print()
    if FAILURES:
        print(f"共 {len(FAILURES)} 項失敗：")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    print("全部通過 ✅")


if __name__ == "__main__":
    main()
