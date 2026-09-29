# -*- coding: utf-8 -*-
"""W4：F-04 財務工作台階段 3 報告；F-05 合併提示。"""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class TestChurchW4FinanceReports(unittest.TestCase):
    def test_f04_finance_csv_print(self):
        t = (
            ROOT / "church_ministry" / "modules" / "finance" / "finance-integrated.html"
        ).read_text(encoding="utf-8")
        self.assertIn('data-w4-report="tx-csv"', t)
        self.assertIn("exportTransactionsCsv", t)
        self.assertIn('data-w4-report="budget-csv"', t)
        self.assertIn("exportBudgetCsv", t)
        self.assertIn("printFinanceSummary", t)
        self.assertIn("exportExcel()", t)
        self.assertNotIn("Excel导出功能开发中", t)
        self.assertNotIn("PDF导出功能开发中", t)

    def test_f05_merge_banner_to_f04(self):
        t = (
            ROOT
            / "church_ministry"
            / "modules"
            / "administration"
            / "financial-management.html"
        ).read_text(encoding="utf-8")
        self.assertIn("W4 合併提示", t)
        self.assertIn("finance-integrated.html", t)
        self.assertIn("financeSystemData", t)


if __name__ == "__main__":
    unittest.main()
