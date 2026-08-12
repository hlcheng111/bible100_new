# Bible100_new 專案網站工程報告

**文件代號：** `BIBLE100_ENGINEERING_REPORT_V1`  
**版本：** 2026-07-27 · 基於 repo 實際代碼逆向  
**適用範圍：** `bible100_new/` 主站 + `bible_journey/` + `bible_app/`  
**讀者：** 牧長、同工、Tech Lead、進場工程師  
**關聯：** [`PRODUCT_CONSTITUTION_V1.md`](./PRODUCT_CONSTITUTION_V1.md) · [`FULL_STACK_ARCHITECTURE_HANDOFF_WHITEPAPER.md`](./FULL_STACK_ARCHITECTURE_HANDOFF_WHITEPAPER.md)

---

> **重要聲明**  
> 本報告區分：**【現行 As-Built】**＝倉庫內可驗證實作；**【目標 To-Be】**＝React/Next/PostgreSQL/向量檢索等，**主站尚未落地**，僅作演進路線。

---

## 0. 執行摘要

| 維度 | 現況 | 風險 |
|------|------|------|
| 主站 | 靜態 HTML + Vanilla JS + iframe 聯邦殼 | 低 |
| 持久化 | localStorage + 本機 SQLite/JSON | 中 |
| AI | Prompt 工作流 + 規則引擎 | 低 |
| 配對 | 規則加權 + 6 軸閾值（非 embedding） | 中 |
| 教會診斷 | 18 live 工具 + 戰略活鏈 | 中 |
| 定位問卷 | Smart Ministry **13 題**（非 80 題） | 高 |
| 城市/行業向量 | **未實作** | 高 |

**定位句：** 離線優先的教會學習與事工平台——教聖經、出教材、小白可維護；輔助讀好、實踐、建立教會。

---

## A. 初心理念

### A.1 為何建立

- **核心：** 教導聖經；100 步教材／四寶；六語小白可用可維護（`PRODUCT_CONSTITUTION_V1.md`）
- **延伸：** 研讀、難題、教會、學校、AI
- **哲學：** Static-First · Offline-First · Federal Hub · Teacher-First

### A.2 教會使命映射

| 使命 | 模組 |
|------|------|
| 造就門徒 | `languages/` · `bible_journey/` · `bible_app/` |
| 裝備事奉 | `church_planning/` · `smart_ministry/` |
| 建立教會 | `church_ministry/` |
| 治理對齊 | SWOT × PDCA × KPI × 80/20 |
| 裝備教師 | `ai_tools/` |

### A.3 痛點

工具分散、老師不懂用、離線需求、事奉亂配、決策缺數據、會友多真相、小語種缺教材。

### A.4 成功 vs 失敗

| 成功 | 失敗 |
|------|------|
| 少點幾下完成備課/CRM | 成第二套行政負擔 |
| 事奉有依據+HITL | AI 自動派崗引發反彈 |
| 讀經運動可追（backlog） | 「城市化」口號無落地 |

---

## B. 中間阻礙

### B.1 技術（TD-01~10）

- iframe + `file://` 導航脆弱
- 殼中殼、Config 多 SSOT 漂移
- `data/` 不在 Git；聖經載入碎片化
- 問卷未接 canonical；`matching_algorithm.js` 缺失
- 無 PostgreSQL / pgvector / embedding

### B.2 文化

領袖拒量化、部門拒 central DB、SWOT 觸派系、同工怕填表、小語種 AI 草稿被當權威。

### B.3 用戶行為

不填問卷、填完不行動、只用 file://、清快取丟資料。

### B.4 整合

Planning Store ↔ CRM 唯讀；Smart Ministry 與 Matchmaker 雙算法未統一；`bible_app` 不共享 localStorage。

### B.5 失敗因素

規格膨脹、強推全站 Next、AI 當神諭、無 HTTP 驗收、data 未還原、領袖不背書、80 題規格與 13 題實作長期不同步。

---

## C. 未解決問題

| 類別 | 項目 |
|------|------|
| 技術 | 問卷→canonical；缺失 JS；80 題；讀經運動 backlog；多機同步 |
| AI 配對 | substring 誤匹配；default 3.0；僅 5 職位藍圖；六戰缺 run 仍出分 |
| 資料 | localStorage 5MB；無索引；無多使用者 |
| 文化 | 拒 NCD/Johari/RACI/事工禁食 |
| 採用 | 問卷過長；需 HTTP；Excel 雙軌 |

---

## D. 可行選項（摘要）

詳見對話完整版；核心結論：

- **資料：** v1 localStorage（現行）→ v2 Sheets → v3 Postgres/Firebase
- **配對：** 強化規則+HITL（現行推薦）→ 六軸合併 → 禁止 auto LLM 派崗
- **前端：** 主站保持 Static；子產品 Vite/Expo 獨立演進
- **80 題：** 13→40 MVP / 聚合六戰 / 新建 pack / CAT / 紙本 OCR

---

## E. 技術架構

### E.1 現行

```
index_v5.html → modes.json → sidebarFrame + contentFrame
Data: memberSystemData | bible100_smart_ministry_main | bible100_assessment_*
Cloud: USE_SHEETS_SSOT=false（預設）
```

### E.2 目標 To-Be

Next/BFF/Node/Python/PostgreSQL/pgvector——**增量可選層**，不強制推翻 Static 主站。

### E.3 DevOps

- CI: `.github/workflows/site-integrity.yml`
- 本地: `.\tools\start_http_bible100.ps1` → `http://127.0.0.1:8080/index_v5.html`
- 測試: `tests\run-all-tests.ps1`

---

## F. 流程

### F.1 導覽 L0–L5

Hub → Mode → 側欄+content → L4 Tab → L5 功能頁

### F.2 規劃 4-Tab ACS

理念 → 快評 → 報告 → 輔導手冊 → `AssessmentRunStore.saveRun()`

### F.3 問卷

- **現行：** 13 題 / 5 段（`smart_ministry/questionnaire_system.html`）
- **目標 80 題：** A–G 七區塊（見完整版 §F.3）

### F.4 配對雙軌

- **A：** Smart Ministry M1/M2 規則 → `addMinistryAssignment`
- **B：** 六戰 → `buildPersonVector` → `analyzeFit` → HITL

### F.5 戰略鏈

NCD → SWOT → PDCA → KPI → 80/20 → `governance_crm_bridge` → CRM 橫幅

### F.6 18 live 工具

`church_planning/js/planning_tool_registry.js`

---

## G. 資料庫設計

Canonical keys + ER（member_id = talent_id）。To-Be PostgreSQL 表見完整版 §G.6。

---

## H. AI 設計

### 現行公式

**Matchmaker：**

```
fit_pct_i = min(100, round(actual_i / max(required_i, 0.1) * 100))
overall_pct = round(sum(fit_pct) / 6)
```

**Smart Ministry：**

```
total = min(skillScore + 30 + mbtiScore, 100)
skillScore = 40 × matched_keywords
```

### 目標 Hybrid（未實作）

`Score = w_r·S_rule + w_e·cos(e_person, e_role) + w_c·S_constraint`

---

## I. 測試計劃

| 命令 | 用途 |
|------|------|
| `test_index_v5_shell.py` | 殼 |
| `test_all_live_tools_smoke.py` | 18 tools |
| `test_strategic_chain_integrity.py` | 戰略鏈 |
| `test_matchmaker_core.py` | 媒合 |
| `test_church_interconnect_smoke.py --tier all` | 三角互聯 |

缺口：E2E、配對黃金集、壓測、80 題問卷測。

---

## J. UAT

| 角色 | 劇本 |
|------|------|
| 信徒 | 註冊→問卷→配對（HITL） |
| 部門 | CRM→派任→28 天提醒 |
| 領袖 | NCD→SWOT→PDCA→CRM 橫幅 |
| 工程 | clone→data→run-all-tests 全綠 |

城市/行業召集人：**現階段 N/A**。

---

## K. 完美收官

| 維度 | 現況 |
|------|------|
| 技術 | 🟡 問卷 JS 斷鏈 |
| AI | 🟡 無黃金集 |
| UX | 🟢 W0 進行中 |
| 教會採用 | ⚪ 待驗證 |
| 城市 | 🔴 未建 |

**P0 下一步：**

1. 修復問卷斷鏈 + 接 `SmartMinistryCanonical`
2. 80 題 spec 或 40 題 MVP 二選一
3. 一間教會 UAT 閉環

---

## 附錄：關鍵路徑

| 檔案 | 角色 |
|------|------|
| `index_v5.html` | 聯邦總殼 |
| `config/modes.json` | 頂欄 SSOT |
| `js/central_member_db.js` | 會友 |
| `js/smart_ministry_canonical_store.js` | 智慧事奉 |
| `church_planning/js/assessment_run_store.js` | 規劃 run |
| `church_planning/js/matchmaker_core.js` | 6 軸媒合 |
| `church_planning/js/governance_crm_bridge.js` | 治理→CRM |

---

**狀態：** V1 初版 · 2026-07-27 · 完整圖表與選項風險表見本輪對話全文。
