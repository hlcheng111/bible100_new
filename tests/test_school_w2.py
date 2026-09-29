# -*- coding: utf-8 -*-
"""
學校管理 W2（學費入教會帳）靜態檢查
執行：python tests/test_school_w2.py
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
        "generateReceiptNo()",
        "markPaymentPaid(paymentId",
        "buildPaymentNoticeText(paymentId)",
        "buildReceiptHtml(paymentId)",
        "buildChurchFinanceExport(opts)",
        "getFinanceExportStats()",
        "importToChurchFinanceSystem(opts)",
    ):
        check(f"資料層：{api}", api in db)
    check("資料層：匯出標記 school_tuition_export", "school_tuition_export" in db)
    check("資料層：匯出目標 financeSystemData", "financeSystemData" in db)
    check("資料層：exportedToChurchFinanceAt 標記", "exportedToChurchFinanceAt" in db)

    tuition = read("school_management/manage/finance/tuition.html")
    check("學費頁：無自動 seed", not re.search(r"ensureSeedFull\s*\(\s*\)", tuition))
    check("學費頁：收據列印", "printReceipt" in tuition and "buildReceiptHtml" in tuition)
    check("學費頁：標記已繳", "markPaymentPaid" in tuition)
    check("學費頁：下載匯出 JSON", "btnExportFinanceJson" in tuition)
    check("學費頁：A3 對帳 CSV", "btnExportA3Csv" in tuition)
    check("學費頁：寫入 financeSystemData 需確認", "importToChurchFinanceSystem" in tuition and "confirm(" in tuition)
    check("學費頁：載入 ChurchDataBridge", "church_data_bridge.js" in tuition)

    portal = read("school_management/portal/my_payments.html")
    check("學員繳費：產生通知", "buildPaymentNoticeText" in portal and "showNotice" in portal)
    check("學員繳費：收據列印", "printMyReceipt" in portal)
    check("學員繳費：人工審核提示", "不會" in portal or "人工" in portal)

    print()
    if FAILURES:
        print(f"共 {len(FAILURES)} 項失敗：")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    print("全部通過 ✅")


if __name__ == "__main__":
    main()
