# TOOL_P0_MATRIX（Wave 0 · ACS 四 Tab 契約）

> 自動掃描：`python scripts/scan_tool_p0_matrix.py --write-md` · 更新 2026-07-31

## P0 驗收信號（T1–T3 測評頁）

| 信號 | 規則 |
|------|------|
| TabStd | 四 Tab 標籤含 `① 理念與說明` … `④ 輔導員手冊` |
| Quick | `acs-quickstart` 或「3 分鐘入門」 |
| Disc | 含「不是考核／非考核／自我覺察」 |
| Demo | `loadDemoReport` 或「🔍 先看示範報告」 |

**T4 工作桌（raci）**：不要求四 Tab；P0 = 「3 分鐘入門」+ 導遊 + 免責。

## 18 件 canonical 矩陣

| tool_id | 註冊名 | 類型 | 檔案 | P0 | Tab | Quick | Disc | Demo | Wave 0 備註 |
|---------|--------|------|------|-----|-----|-------|------|------|-------------|
| `spiritual` | 信徒靈命健康 | T1 | `Church_Governance_spiritual_health.html` | ✅ | ✅ | ✅ | ✅ | ✅ | S0 已落地 |
| `pastoral` | 領袖健康診斷 | T1 | `Church_Governance_pastoral_health.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 批量 |
| `shape` | SHAPE 恩賜整合 | T1 | `shape-gifts-assessment.html` | ✅ | ✅ | ✅ | ✅ | ✅ | 已合規 |
| `competency` | 事奉勝任力 | T1 | `ministry-competency-assessment.html` | ✅ | ✅ | ✅ | ✅ | ✅ | 已合規 |
| `alda` | ALDA 領導力 | T1 | `alda-leadership-assessment.html` | ✅ | ✅ | ✅ | ✅ | ✅ | 已合規 |
| `matchmaker` | 事奉媒合 | T3 | `ministry-position-matchmaker.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 Tab②③ |
| `ministry8020` | 80/20 資源聚焦 | T2 | `Church_Governance_8020_focus.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 批量 |
| `urgent` | 重要 vs 緊急 | T2 | `Church_Governance_urgent_matrix.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0+S1 |
| `smart` | 教會版 SMART | T2 | `Church_Governance_SMART_goals.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 批量 |
| `pdca` | PDCA 行動迴圈 | T2 | `Church_Governance_PDCA_cycle.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 Tab名 |
| `kpiokr` | KPI/OKR 對齊 | T2 | `Church_Governance_KPI_alignment.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 批量 |
| `johari` | Johari 窗 | T1 | `johari-window-assessment.html` | ✅ | ✅ | ✅ | ✅ | ✅ | 已合規 |
| `disc` | DISC 溝通風格 | T1 | `disc-profile-assessment.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 免責 |
| `mbti` | MBTI 自我覺察 | T1 | `mbti-self-awareness.html` | ✅ | ✅ | ✅ | ✅ | ✅ | 已合規 |
| `swot` | SWOT 戰略交叉矩陣 | T2 | `Church_Governance_SWOT_matrix.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 Tab+H1 |
| `culture` | 文化契合度 | T2 | `Church_Governance_Culture_radar.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 批量 |
| `ncd` | NCD 教會健康 | T2 | `Church_Health_NCD_planning.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0 Tab名 |
| `raci` | RACI 權責反思 | T4 | `planning/raci-reflection.html` | ✅ | ✅ | ✅ | ✅ | ✅ | W0+S1 T4 |

## file:// 驗收（Ctrl+F5）

- spiritual：`file:///C:/Users/hlche/.cursor/bible100_new/church_planning/Church_Governance_spiritual_health.html`
- urgent：`file:///C:/Users/hlche/.cursor/bible100_new/church_planning/Church_Governance_urgent_matrix.html`
- raci：`file:///C:/Users/hlche/.cursor/bible100_new/church_planning/planning/raci-reflection.html`

## S1 深度（本輪）

| 工具 | 狀態 | 內容 |
|------|------|------|
| urgent | ✅ P1 文案 | 微型路徑 banner、報告空態、→ RACI 鏈路（未動算法） |
| raci | ✅ P0 工作桌 | 頂部 3 分鐘入門 + 原導遊保留 |

## Wave 1 待辦（未動算法）

- spiritual P1：report-heart 三句、Tab④ 加厚（牧者試用回饋）
- urgent／raci：JS shell（`urgency_acs_shell.js` 等）若缺檔需補載入
- ncd：Vue 殼與 ACS 殼深度對齊（僅 Tab 名已統一）
