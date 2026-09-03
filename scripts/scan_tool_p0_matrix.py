#!/usr/bin/env python3
"""Scan 18 canonical planning tools for Wave 0 P0 signals."""
from __future__ import annotations

import argparse
import datetime
import os
import sys

ROOT = os.path.join(os.path.dirname(__file__), "..", "church_planning")
OUT_MD = os.path.join(
    os.path.dirname(__file__), "..", "docs", "governance", "tool_audits", "TOOL_P0_MATRIX.md"
)
TOOLS = [
    ("spiritual", "Church_Governance_spiritual_health.html", "T1", True, "信徒靈命健康", "S0 已落地"),
    ("pastoral", "Church_Governance_pastoral_health.html", "T1", False, "領袖健康診斷", "W0 批量"),
    ("shape", "shape-gifts-assessment.html", "T1", False, "SHAPE 恩賜整合", "已合規"),
    ("competency", "ministry-competency-assessment.html", "T1", False, "事奉勝任力", "已合規"),
    ("alda", "alda-leadership-assessment.html", "T1", False, "ALDA 領導力", "已合規"),
    ("matchmaker", "ministry-position-matchmaker.html", "T3", False, "事奉媒合", "W0 Tab②③"),
    ("ministry8020", "Church_Governance_8020_focus.html", "T2", False, "80/20 資源聚焦", "W0 批量"),
    ("urgent", "Church_Governance_urgent_matrix.html", "T2", False, "重要 vs 緊急", "W0+S1"),
    ("smart", "Church_Governance_SMART_goals.html", "T2", False, "教會版 SMART", "W0 批量"),
    ("pdca", "Church_Governance_PDCA_cycle.html", "T2", False, "PDCA 行動迴圈", "W0 Tab名"),
    ("kpiokr", "Church_Governance_KPI_alignment.html", "T2", False, "KPI/OKR 對齊", "W0 批量"),
    ("johari", "johari-window-assessment.html", "T1", False, "Johari 窗", "已合規"),
    ("disc", "disc-profile-assessment.html", "T1", False, "DISC 溝通風格", "W0 免責"),
    ("mbti", "mbti-self-awareness.html", "T1", False, "MBTI 自我覺察", "已合規"),
    ("swot", "Church_Governance_SWOT_matrix.html", "T2", False, "SWOT 戰略交叉矩陣", "W0 Tab+H1"),
    ("culture", "Church_Governance_Culture_radar.html", "T2", False, "文化契合度", "W0 批量"),
    ("ncd", "Church_Health_NCD_planning.html", "T2", False, "NCD 教會健康", "W0 Tab名"),
    ("raci", "planning/raci-reflection.html", "T4", False, "RACI 權責反思", "W0+S1 T4"),
]
TAB_STD = ["① 理念與說明", "② 開始測評", "③ 分析報告", "④ 輔導員手冊"]


def scan(path: str) -> dict:
    with open(path, encoding="utf-8", errors="replace") as f:
        t = f.read()
    return {
        "tab_std": all(s in t for s in TAB_STD),
        "quickstart": "acs-quickstart" in t or "3 分鐘" in t,
        "disclaimer": any(x in t for x in ("不是考核", "非考核", "自我覺察")),
        "demo": "loadDemoReport" in t or "先看示範" in t,
        "shell": "data-acs-tab" in t or "data-strategic-tab" in t,
    }


def eval_p0(typ: str, s: dict, skip: bool, text: str) -> bool:
    if skip:
        return True
    if typ == "T4":
        return "3 分鐘" in text or "導遊" in text
    return s["tab_std"] and s["quickstart"] and s["disclaimer"] and s["demo"]


def write_matrix(rows: list[tuple]) -> None:
    ts = datetime.datetime.now().strftime("%Y-%m-%d")
    lines = [
        "# TOOL_P0_MATRIX（Wave 0 · ACS 四 Tab 契約）",
        "",
        f"> 自動掃描：`python scripts/scan_tool_p0_matrix.py --write-md` · 更新 {ts}",
        "",
        "## P0 驗收信號（T1–T3 測評頁）",
        "",
        "| 信號 | 規則 |",
        "|------|------|",
        "| TabStd | 四 Tab 標籤含 `① 理念與說明` … `④ 輔導員手冊` |",
        "| Quick | `acs-quickstart` 或「3 分鐘入門」 |",
        "| Disc | 含「不是考核／非考核／自我覺察」 |",
        "| Demo | `loadDemoReport` 或「🔍 先看示範報告」 |",
        "",
        "**T4 工作桌（raci）**：不要求四 Tab；P0 = 「3 分鐘入門」+ 導遊 + 免責。",
        "",
        "## 18 件 canonical 矩陣",
        "",
        "| tool_id | 註冊名 | 類型 | 檔案 | P0 | Tab | Quick | Disc | Demo | Wave 0 備註 |",
        "|---------|--------|------|------|-----|-----|-------|------|------|-------------|",
    ]
    for row in rows:
        tid, label, typ, rel, p0, s, note = row
        p0s = "✅" if p0 else "❌"
        lines.append(
            f"| `{tid}` | {label} | {typ} | `{rel}` | {p0s} | "
            f"{'✅' if s['tab_std'] or typ == 'T4' else '—'} | "
            f"{'✅' if s['quickstart'] else '❌'} | "
            f"{'✅' if s['disclaimer'] else '❌'} | "
            f"{'✅' if s['demo'] or typ == 'T4' else '❌'} | {note} |"
        )
    lines += [
        "",
        "## file:// 驗收（Ctrl+F5）",
        "",
        "- spiritual：`file:///C:/Users/hlche/.cursor/bible100_new/church_planning/Church_Governance_spiritual_health.html`",
        "- urgent：`file:///C:/Users/hlche/.cursor/bible100_new/church_planning/Church_Governance_urgent_matrix.html`",
        "- raci：`file:///C:/Users/hlche/.cursor/bible100_new/church_planning/planning/raci-reflection.html`",
        "",
        "## S1 深度（本輪）",
        "",
        "| 工具 | 狀態 | 內容 |",
        "|------|------|------|",
        "| urgent | ✅ P1 文案 | 微型路徑 banner、報告空態、→ RACI 鏈路（未動算法） |",
        "| raci | ✅ P0 工作桌 | 頂部 3 分鐘入門 + 原導遊保留 |",
        "",
        "## Wave 1 待辦（未動算法）",
        "",
        "- spiritual P1：report-heart 三句、Tab④ 加厚（牧者試用回饋）",
        "- urgent／raci：JS shell（`urgency_acs_shell.js` 等）若缺檔需補載入",
        "- ncd：Vue 殼與 ACS 殼深度對齊（僅 Tab 名已統一）",
    ]
    os.makedirs(os.path.dirname(OUT_MD), exist_ok=True)
    with open(OUT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write-md", action="store_true", help="Write docs/governance/tool_audits/TOOL_P0_MATRIX.md")
    args = ap.parse_args()
    fails = 0
    matrix_rows: list[tuple] = []
    for tid, rel, typ, skip, label, note in TOOLS:
        p = os.path.normpath(os.path.join(ROOT, rel.replace("/", os.sep)))
        if not os.path.isfile(p):
            print(f"MISSING\t{tid}\t{rel}")
            fails += 1
            continue
        with open(p, encoding="utf-8", errors="replace") as f:
            text = f.read()
        s = scan(p)
        p0 = eval_p0(typ, s, skip, text)
        status = "PASS" if p0 else "FAIL"
        if status == "FAIL":
            fails += 1
        matrix_rows.append((tid, label, typ, rel, p0, s, note))
        print(
            f"{tid}\t{status}\tTabStd={s['tab_std']}\tQuick={s['quickstart']}\t"
            f"Disc={s['disclaimer']}\tDemo={s['demo']}\tSkip={skip}"
        )
    if args.write_md:
        write_matrix(matrix_rows)
        print(f"WROTE\t{OUT_MD}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
