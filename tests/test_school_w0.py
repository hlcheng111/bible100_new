# -*- coding: utf-8 -*-
"""
學校管理 W0（真假邊界＋備份）靜態檢查
- 示範種子必須 force=true 才可載入（不再自動 seed）
- 入口頁不得自動呼叫種子
- 備份頁必須是真功能（exportAll / importAll / clearSeedData）
- 信任橫幅以列級種子特徵判定
執行：python tests/test_school_w0.py
"""
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(rel):
    path = os.path.join(ROOT, rel)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


FAILURES = []


def check(name, ok, detail=""):
    status = "OK  " if ok else "FAIL"
    print(f"[{status}] {name}" + (f" — {detail}" if detail and not ok else ""))
    if not ok:
        FAILURES.append(name)


def main():
    db_js = read("school_management/js/school-master-database.js")
    check("資料層：ensureSeedFull 有 force 閘門",
          "ensureSeedFull(force)" in db_js and "if (force !== true) return;" in db_js)
    check("資料層：constructor 無自動 seed",
          "needSeed && typeof this.ensureSeedFull" not in db_js)
    check("資料層：ensureSeedStudents 有 force 閘門",
          "ensureSeedStudents(minCount = 200, force)" in db_js)
    check("資料層：新種子帶 source 標記",
          "source: 'school_demo_seed'" in db_js)
    for api in ("exportAll()", "importAll(jsonText)", "clearSeedData()", "isSeedRecord(row)"):
        check(f"資料層：備份 API {api}", api in db_js)

    index_html = read("school_management/index.html")
    check("index.html 不自動 seed",
          not re.search(r"ensureSeedFull\s*\(\s*\)", index_html))

    dashboard = read("school_management/dashboard.html")
    check("dashboard.html 不自動 seed",
          not re.search(r"ensureSeedFull\s*\(\s*\)", dashboard)
          and not re.search(r"ensureSeedStudents\s*\(\s*200\s*\)", dashboard))

    seed_page = read("school_management/load_school_seed.html")
    check("載入示範頁：明確傳 force=true",
          "ensureSeedFull(true)" in seed_page)
    check("載入示範頁：DOMContentLoaded 不自動 seed",
          not re.search(r"DOMContentLoaded[\s\S]{0,200}ensureSeedFull\s*\(\s*\)", seed_page))

    backup = read("school_management/manage/system/database.html")
    for token in ("schoolDB.exportAll", "schoolDB.importAll", "schoolDB.clearSeedData"):
        check(f"備份頁：接真 API {token}", token in backup)
    check("備份頁：假 SQLite 內容已移除",
          "数据库优化" not in backup and "99.9%" not in backup)
    check("備份頁：載入資料層腳本",
          "../../js/school-master-database.js" in backup
          and "../../../js/data_trust_badge.js" in backup)

    badge = read("js/data_trust_badge.js")
    check("信任橫幅：列級種子判定 isSchoolSeedRow",
          "function isSchoolSeedRow(row)" in badge)
    check("信任橫幅：seedRows/realRows 統計",
          "seedRows" in badge and "realRows" in badge)
    check("信任橫幅：混合狀態標籤",
          "示範種子 + 真實填寫資料" in badge)

    tabs = read("school_management/manage/system_tabs.html")
    check("系統 Tab：資料備份標籤", "資料備份" in tabs)

    print()
    if FAILURES:
        print(f"共 {len(FAILURES)} 項失敗：")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    print("全部通過 ✅")


if __name__ == "__main__":
    main()
