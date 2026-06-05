# 實作備註：信徒靈命審查／教牧專業版對齊事項

給 Cursor／同工：實作時與現有程式對齊，避免 id 錯位、雙重門檻、巢狀 iframe。

> **算法總表、分級門檻（4.0／2.8）、三份對齊報告（進度／算法／技術總覽）** 以全站單一文件為準：  
> **`docs/SURVEY_DESIGN_PRINCIPLES.md`**（§三～§五）。  
> 本檔僅保留教牧／信徒卷之**專用實作細節**（id、DOM、iframe、JS 路徑等），不重複維護跨卷門檻表。

---

### 1. `pastoral-spiritual-survey-pro.html` 已經有骨架與題目邏輯

- 檔內已有 `radioValue(form, "A1")`、動態 `radio.name = item.id` 等，**請不要另起一套 id**。
- 新增的 `PASTORAL_QUESTIONS` / `PASTORAL_QUESTION_MAP` **必須直接對齊現有題目 id**，包含動態產生的 id。（實作位置：`church_planning/js/pastoral_spiritual_health.js`。）
- 較穩的做法：
  - 若目前已有題目陣列（例如 `questions = [...]`），就從那個陣列產生 `PASTORAL_QUESTION_MAP`（**單一真相來源**）。
  - 若要改題目產生器（例如換 id 命名），請**同步更新** config，避免「畫面顯示 A1，計分用 Q1」這種錯位。

---

### 2. 信徒靈命審查：`q1` vs `Q1` 的一致性

- 現有 HTML 實際使用的是 **`q1–q13`（小寫）**，規格書可能寫 `Q1–Q13`。
- **二選一**：
  - 要嘛修改 HTML，把 `name` / `data-qid` 改成 `Q1`…`Q13`；
  - 要嘛在 `MEMBER_QUESTIONS` 裡維持 `id: 'q1'` 小寫。
- **重點**：config（`MEMBER_QUESTIONS`）、DOM（`name` / `data-qid`）、`collectMemberAnswers()` 必須用**同一套** id，不能一半大寫一半小寫。

---

### 3. 分級閾值（單一真相）

- **標準門檻與各卷是否已改寫程式**，一律以 **`docs/SURVEY_DESIGN_PRINCIPLES.md` §4.1** 為準。
- 實作 `spiritual_health_scoring.js` 時：註解註明 **2026 改版，門檻 4.0 / 2.8 / else**；移除舊版 4.2／3.2／2.4 等敘述與分支。

---

### 4. 反向題標記要逐題確認

- **跨卷反向題登記表**見 **`docs/SURVEY_DESIGN_PRINCIPLES.md` §4.2**。
- `reversed ? (6 - val) : val` 是 1–5 Likert 的標準反轉。
- **逐題**對照題幹語意標 `reversed: true/false`：
  - 正向：「我常常經歷與主同在的喜樂」→ `reversed: false`。
  - 反向：「我經常覺得快撐不住」→ `reversed: true`。
- 反向表錯一題，整個維度的紅／綠區可能顛倒。

---

### 5. 未完成作答的處理

- `computeDimensionScores()` 只對「有作答的題目」做平均；若某維度只答 1 題，仍會算出分數。
- **UX 建議**：
  - 問卷頁顯示「已答 x／總 y 題」。
  - 報告裡，對「實際作答題數 < 該維度總題數的一半」的維度，加註「資料較少，僅供初步參考」，或用灰色樣式。
- 不必在算法裡強制塞 `null`，但**渲染時**要顯式處理「樣本太少」。

---

### 6. 共用 scoring 模組的放置位置

- 建議：`church_planning/js/spiritual_health_scoring.js`，內含：
  - `normalizeScore`
  - `computeDimensionScores`
  - `computeOverallScore`
  - `levelFromScore`
- 從 **`church_planning/` 目錄下的 HTML** 引入時，使用：

  ```html
  <script src="js/survey_ui_common.js"></script>
  <script src="js/spiritual_health_scoring.js"></script>
  ```

  （檔案放在 `church_planning/js/` 時，**不要**寫成 `../js/`，除非共用檔實際放在專案根 `bible100_new/js/`。）  
  `smart_ministry/` 下頁面若需同一套 UX 小工具：`../church_planning/js/survey_ui_common.js`。

- 信徒版與教牧專業版各自提供 config（`MEMBER_*` / `PASTORAL_*`）。
- 若暫時不好拆，可先兩頁內嵌，穩定後再抽離到上述路徑。

---

### 7. `spiritual_gifts.html` 的「對齊」範圍

- 恩賜測驗是 **cluster → 恩賜加權**，與「健康維度平均」不同，**不必**共用 `computeDimensionScores()`。
- 對齊重點：**1–5 pill 外觀與說明**、**步驟 tab／進度**、**報告節奏**（整體 summary → 各範疇 → 特別區塊 → 牧養聲明）。
- 除非只借 CSS／layout，否則不要硬把恩賜測驗塞進同一套健康 scoring。

---

### 8. 跨頁連結與 `target` 設定

- 從 `church_planning` 連到 `../smart_ministry/spiritual_gifts.html` 時，遵守 **`index_v5` shell** 規則（見 `bible100_new/.cursor/rules/bible100-index-shell-sidebar.mdc`）。
- 在 iframe（例如 `contentFrame`）內時，使用 `target="contentFrame"` 或 `_top`，**照現有頁面慣例**，避免多一層 nested iframe。

---

### 9. 小型架構優化（可選）

- **渲染**：可抽通用 `renderHealthReport({ dimLabels, dimScores, descriptions, overallScore, noticeText })`，信徒／教牧共用，減少重複 HTML。
- **儲存**：信徒版既有 `spiritualSurvey2026-simple`。若要加維度分數，可：
  - 同一 key 擴充欄位（`dimension_scores`、`overall_score`、`schemaVersion`）；或  
  - 新 key 專放「維度版」，讀取時辨識版本。
- **匯出**：匿名 JSON 在小樣本教會仍可能被比對；進階可做「只匯出聚合統計」。

---

### 10. 結構確認

- **三工具**：信徒快測、教牧專業版、恩賜測驗，各司其職。
- 實作時確保：
  - 信徒／教牧 **scoring 模組與分級門檻一致**；
  - 恩賜卷 **僅 UX 對齊**，不混用健康 scoring；
  - 所有 **id／name／config 一一匹配**，避免「畫面一套、計分一套」。

---

## 相關檔案

| 檔案 | 說明 |
|------|------|
| `church_planning/pastoral-spiritual-survey-pro.html` | 教牧專業版骨架與動態題組 |
| `church_planning/信徒靈性生命健康自我審查.html` | 信徒快測 |
| `smart_ministry/spiritual_gifts.html` | 恩賜測驗（UX 對齊） |
| `bible100_new/.cursor/rules/bible100-index-shell-sidebar.mdc` | 總站 iframe／側欄規則 |
| `docs/SURVEY_DESIGN_PRINCIPLES.md` | 全站問卷原則與三份對齊報告（§三～§五） |
| `docs/TOOLS_AND_ENTRY_REFERENCE.md` | 全站入口對照（含本區問卷路徑與本 notes 連結） |
| `docs/OPTIMIZATION_SUMMARY.md` | 優化摘要（含問卷共用實作與本 notes 連結） |
