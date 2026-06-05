# 五階牧養路徑 × 兩模組 — 規劃備忘（草案 v2）

> 狀態：**構思／備案**，可當側欄與導引重構的藍圖；未定案處已標示。  
> 關聯頁面範例：`church_planning/pastoral-spiritual-survey-pro.html`（第三階教牧／領袖靈命調查專業版）。  
> **資料契約（實體、三橋、權限）**：[DATA_CONTRACT_v0.1.md](./DATA_CONTRACT_v0.1.md) — 與 `smart_ministry`／`church_planning` 互通時以此為準。  
> 記錄：依倉庫維護時更新。

---

## 層次先講清楚（避免「每人都要走完五階」的誤解）

- **前三階**：聚焦 **個人生命與領袖**（信徒健康 → 崗位對接 → 領袖傳承／深層整合）。  
- **後兩階**：聚焦 **教會與系統**（教會健康／教牧健康 → 中長期計畫與執行），主要給 **教會領導層與策劃同工**；一般會友不一定需要進入第四、五階工具鏈。

五階是把原先「三階個人路徑」**往外擴成**「個人 → 領袖 → 教會 → 長期策略」；神學與牧養邏輯可連貫，但**使用對象與場景不同**。

---

## 一、已成熟、建議直接採用的部分

1. **兩模組分工清楚、不強併資料夾**  
   - `smart_ministry/`：**個人 → 團隊事奉**（恩賜／性格／匹配等）。  
   - `church_planning/`：**教會＋教牧層級**（健康診斷、策略、教牧靈命、**已含** `swot-planning.html`、`smart-planning.html` 等規劃向頁面）。  
   保留原資料夾架構、不硬重構，現階段最務實。

2. **五階路徑定義清楚**  
   1. 信徒健康檢查（Gateway）  
   2. 事奉崗位對接（Synergy）  
   3. 領袖傳承（Integrity）  
   4. 教會健康與教牧健康  
   5. 五年計畫與執行  

3. **實驗頁獨立**：`test01_disc_test_grok.html` 等一律歸 **「開發／實驗」** 摺疊區，不與正式工具同層，降低迷路感。

4. **側欄結構**：先 **五階路徑** → 再 **兩模組各自工具總覽** → 最後 **實驗／開發**；呼應「以階段為主軸」，且可與「不修改頂層 `index.html`、只在模組內 sidebar／子索引動工」並存。

5. **不大改動的落地原則**（可作 Cursor／同工的**保護條款**）  
   - 以本備忘或 `STAGES.md` 維護 **階段 ↔ 檔案** mapping。  
   - **不重構**既有問卷與計分 JS；新增僅用獨立 class（如 `.stage-label`、`.next-step-hint`），**不覆寫**既有 `id`／`name`／`localStorage` key。  
   - **`bible100_new/index.html`**：若規定不動頂層入口，則導引以 **模組內** `sidebar.html`、子索引為主。

---

## 二、五階 × 工具頁對照（含第三階敘事與第四／五階收斂）

### 第一階：信徒健康檢查（Gateway）

- **建議主入口**：`church_planning/信徒靈性生命健康自我審查.html`

### 第二階：事奉崗位對接（Synergy）— 以 `smart_ministry/` 為主

- 性格／認知（**進階、非主線門檻**）：`mbti_test.html`、`test01_disc_test_grok.html`、`test02_shape_test_grok.html`  
- 恩賜與技能（**主線 Discern**）：`talent_skill_unified.html`；技能字典維護：`skills_expertise.html`（進階）  
- 吸納／集線（進階）：`talent_acquisition.html`  
- 匹配（**主線 Fit**）：`talent_ministry_matching.html`；`matching.html` 僅 **legacy 轉址** 至主線  
- 事奉推薦（**進階實驗**）：`ai_matching.html`  
- 進階 AI 實驗室（**不列主線**）：`ai_team_optimizer.html`、`ai_performance_analyzer.html`  
- 輔助／行政：`why_serve.html`、`registration.html`、`data_collection.html`、`assessment.html`、`questionnaire_system.html`（依實際啟用收斂）  
- **內部 DEMO**（不對會友）：`talent_pool_demo.html`、`export_talent_stats_demo.html`  
- **實驗頁**（如 `test01_disc_test_grok.html` 等）：見側欄「開發／實驗」。

### 第三階：領袖傳承（Integrity）

**敘事補充（與「深層生命／防崩壞」對齊）：**  
第三階主要關注 **領袖的深層生命**、**長期壓力與盲點**，以及 **門訓／陪談脈絡下的成長軌跡**（非單次測驗總結而已）。

| 檔案 | 說明 |
|------|------|
| `church_planning/pastoral-spiritual-survey-pro.html` | 教牧／領袖靈命調查（專業版） |
| `smart_ministry/ai_growth_tracker.html` | 長期成長追蹤 |
| `smart_ministry/talent_tracking.html`（可選） | 若仍使用，可列為選用 |

### 第四階：教會健康與教牧健康 — 以 `church_planning/` 為主

- **正式入口（草案，待最終定案；側欄優先只露這一層）**  
  - ★ **`church-health-diagnosis.html`**  
  - ★ **第二個主入口（擇一或另命名）**：待選定（例如從 NCD／教會健康檢查／戰略診斷等頁中收斂為 **1 個** 對外主頁）。  
- **附屬分析／延伸頁**（不強求與正式入口同層；可由主頁內連進入）：  
  多個「教會健康／NCD／SWOT AI」命名相近之 HTML、以及 `planning/` 內與「健康診斷」連動之頁 — 標註為 **附屬**，避免側欄堆滿同質連結。

### 第五階：五年計畫與執行 — 以 `church_planning/` 為主

- **正式入口（草案）**  
  - ★ **`swot-planning.html`**、★ **`smart-planning.html`**（模組內已存在之規劃向頁面，可列為第五階核心工具）  
  - 其餘如 `pdca-planning.html`、`vision.html`、`process.html`：**正式或附屬** 待你標星收斂。  
- **附屬／子流程**：子目錄 `planning/` 下 `goals.html`、`kanban.html`、`workflow.html`、`strategy.html`、`survey.html`、`health.html`、`swot.html`、`theology.html`、`ai-summary.html` 等 — 側欄可再分「目標／看板／流程」，或僅從第五階主頁連入。

### 橫跨兩模組：總覽／儀表（**不佔五階敘事主軸**）

- **定位**：輔助視圖，**不視為第六階**。  
- `smart_ministry/`：`dashboard.html`（領袖總覽）、`ai_smart_ministry_overview.html`、`module_connections.html`；**`ai_analytics_dashboard.html` 不列主路線**（若檔案仍存在僅供舊連結／研究）  
- `church_planning/`：`dashboard.html`、`church-planning-index.html`、`planning/index.html`  

**可選文案**：在第四或第五階的說明中提一句 — 「相關綜合儀表可至各模組 **dashboard**／**index** 查看」，不把儀表拉進五階主線。

---

## 三、側欄分類結構（建議稿）

1. **五階路徑**（可摺疊）：每階下列工具；**正式入口**打星或粗體，附屬頁降層或僅內頁連結。  
2. **智慧事奉 · 工具總覽**：`smart_ministry/index.html` 或 `landing.html`。  
3. **教會計畫 · 工具總覽**：`church_planning/church-planning-index.html`。  
4. **實驗／開發**：預設收合。

---

## 四、可行性（為何這份草案能落地）

- 不要求批次重新命名檔案，也不要求先改核心 JS。  
- 主要工作：  
  - 在本檔或 **`STAGES.md`／`README_stage.md`**（與本檔可互指）維護 mapping 與「★ 正式入口」。  
  - 修改 **各模組自己的** `sidebar.html`／子 index：**五階路徑區塊** + 對應連結（不動頂層 `bible100_new/index.html` 若為專案政策）。  
  - 各核心頁加 **一兩行** `.stage-label`／`.next-step-hint`（純展示、不綁 id）。  
- 因此可作為「數位化工具鏈」主軸，**無需推翻**已調好的頁面（含教牧靈命調查 Pro 版）。

---

## 五、下一步（建議順序）

1. **定檔名**：將本檔複製或另存為 `bible100_new/docs/STAGES.md`（或根目錄 `README_stage.md`），讓同工與 Cursor 有**單一對照表**。  
2. **精簡第四、五階**：不急刪檔；先在表內為 **正式入口** 打 ★，側欄只露 ★，其餘標「附屬」並由主頁 link。  
3. **實作兩件小事**（適合交 Cursor 分段做）：  
   - 各階**核心頁**加上 `.stage-label`、`.next-step-hint`。  
   - `smart_ministry` 與 `church_planning` 各自的 **index／sidebar** 增加「五階路徑」區塊（依本表）。  

---

## 六、後續待談

- 第四階「第二個正式入口」最終選哪一個 HTML。  
- 第五階除 `swot-planning`／`smart-planning` 外，是否再列 1 個總匯入口頁。  
- 是否共用 `stages.json` 或共用 sidebar 片段。  
- 五階與對外發佈／頂層入口政策是否對齊。

---

## 七、相關文件（檔名與工程路線）

- [church_planning × smart_ministry — 擬訂 Canonical 檔名、處置與工程優先序](./MODULE_CANONICAL_NAMES_AND_ENGINEERING_ROADMAP.md)（2026-04-13 討論記錄：兩模組樹狀、留／併／修／新、P0–P10）

---

*本檔僅供內部規劃備查；實作以當時需求與教會政策為準。*
