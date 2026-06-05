# Playbook 對齊改版（Phase 1-4）完成紀錄

- 日期：2026-05-01
- 依據文件：`docs/CHURCH_TOOL_PLAYBOOK.md`、`docs/PHASE0_INVENTORY_CHECKLIST.md`
- 目標：將階段 0 盤點轉為可執行導流、模板化規格、資料契約對齊與治理 Gate。
- 第四批狀態：已擴充至 P0-080（第一批 P0-001~020 + 第二批 P0-021~040 + 第三批 P0-041~060 + 第四批 P0-061~080）

---

## Phase 1（已完成）— Next 導流收斂

- `PHASE0_INVENTORY_CHECKLIST.md` 的 P0-001~P0-080 已全部改為真實 `Next` 路徑。
- 不再用 `Y / 待補 / N` 代表下一步。
- `§5 Next 導向矩陣` 已更新成站內真實路徑。

驗收：

- 抽查 80 筆可直接交同工執行，不需再二次解釋。

---

## Phase 2（已完成）— 模板化

- `CHURCH_TOOL_PLAYBOOK.md` 新增「四類工具改善工程項目（Phase 1-4 落地）」。
- 明確定義四類工具施工順序：
  1. Next 先收斂
  2. 再補齊手冊/L1/L2/L3/PDF/匯出
  3. 最後接治理 Gate

驗收：

- 新頁面可按同一章節對齊，減少各頁各做一套。

---

## Phase 3（已完成）— 資料契約對齊

- 新增：`docs/DATA_CONTRACT_PHASE0_ALIGNMENT.md`
- 內容包含：
  - 80 筆工具頁主線鍵名
  - 舊鍵對照與 migration 優先順序
  - 與 `DATA_CONTRACT_v0.1` 的對齊約束

驗收：

- 主線鍵名與舊鍵對照已落文，後續 migration 有依據。

---

## Phase 4（已完成）— 治理 Gate

- 新增：`scripts/validate_phase0_playbook_gate.py`
- 檢核：
  - 自動偵測 P0 最大編號並檢查是否連續（目前到 P0-080）
  - `Next` 欄是否為路徑（非 `Y/N/待補`）
  - §6 三條主線決策是否存在

執行：

```powershell
cd bible100_new
python scripts/validate_phase0_playbook_gate.py
```

---

## 治理對齊收口（Exit Criteria）

> 目的：定義「何時可由治理對齊轉入 S/P/M/H 功能工程本體」，避免無限盤點。

收口條件（全部達成才算完成）：

1. `scripts/validate_phase0_playbook_gate.py` 連續通過（至少一次最新基線）  
2. `PHASE0_INVENTORY_CHECKLIST.md` 的主表 `Next` 欄位皆為真實站內路徑（非 `Y/N/待補`）  
3. §6 主線決策表含核心決策（調查主入口、規劃主線、配對主鏈）  
4. `ENGINEERING_MASTER_ROADMAP.md`、`PROJECT_MILESTONE_2026-04-29.md`、`DATA_CONTRACT_PHASE0_ALIGNMENT.md` 已同步同一覆蓋範圍（目前 P0-001~P0-080）  

目前判定（2026-05-01）：

- 以上 4 項已達成。  
- **治理對齊可視為完成（Phase 0~4 收口）。**

轉入功能工程的啟動規則：

- 由下一個工作日/下一個施工波次開始，改以 S/P/M/H 工程項目為主，不再以「先擴 P0 編號」作為優先任務。  
- 建議順序：先做 **M（配對）**，再做 **P（計劃）**，最後補 **S（調查）** 與 **H（混合）** 的跨頁實作細節。

---

## 四類工具改善工程項目（建議清單）

### 調查類

- 統一分數與風險旗標（L1）
- 規則可追溯（L2）
- 深化輸出引用來源（L3）
- Next 優先導向行動頁

### 計劃類

- 固定鏈路：SWOT -> SMART -> Kanban -> PDCA
- 缺鏈路明示在 L2
- Next 導向下一執行節點

### 配對類

- 主入口統一到 matching 主流程
- 推薦後直達志工管理/訓練頁
- 資料不足時導向 assessment 回補

### 混合類

- 調查結果作為計劃輸入，不直接當 KPI
- Next 優先導向規劃主控台或 Kanban
- 匯出欄位遵守資料契約

---

## M 功能工程 · 第一批（M1 + M2，2026-05-01）

- **主檔**：`smart_ministry/talent_ministry_matching.html`
- **M1**：推薦理由固定 2～3 因子（技能／恩賜／MBTI 輔助）；主視覺改為**參考帶**並弱化總分展示。
- **M2**：`matching_constraints` 支援硬性排除（時段／體能／hard_stop／pause）與需人工確認旗標；批量／AI 規則建議**跳過**硬性排除組合；寫入 `metadata.match_analysis` 供追溯。
- **規格**：`smart_ministry/docs/SMART_MINISTRY_DATA_RULES.md` 已補 `matching_constraints` 與 `match_analysis` 說明。

---

## M 功能工程 · M3–M5（2026-05-01）

- **M3**：`ministry_assignment.metadata.trial_followup_due`（紀錄日起 +28 日，ISO 日期）。
- **M4**：`leader_outreach_snippet` 與配對頁「給負責同工／牧者」複製稿（手動貼上通訊軟體；非自動通知）。
- **M5**：`canonical_ref`（`bible100_smart_ministry_main:ministry_assignment:{talent_id}:{ministry_id}`）。
- **追蹤**：`smart_ministry/talent_tracking.html` 時間軸事件附試用跟進日與對照鍵。

---

## P 計劃鏈（L1/L2/Next，2026-05-01）

- **`church_planning/planning/assets/pipeline.js`**：`analyzePlanningChain()`（L1 缺口、L2 規則提示、會議 bullet、PDCA 雙軌註記）。
- **`church_planning/planning/assets/planning_chain_panel.js`** + **`planning/index.html`**：`#planning-chain-panel` 內嵌於流程總覽。

---

## S 屬靈自評主線（2026-05-01）

- **`church_planning/spiritual_app/index.html`**：`church_planning_spiritual_survey_v1`（`schemaVersion: 1`）自動暫存、進度列、稀疏預覽（未答以 3 分填補）、L1/L2/Next 導覽條、非診斷免責與用語調整。

---

## H 智慧整理（2026-05-01）

- **`church_planning/planning/ai-summary.html`**：`longTermPlanning_summary.evidenceLevel`（假設／已核對／示範）、從屬靈自評鍵一鍵帶入 `rawText` 草稿、`accountabilityNote` 與複製。
