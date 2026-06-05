# 教會事工 可再改進 ＋ 其他模組可套用同一套工程

## 一、教會事工（Church Ministry）還可 refine 的項目

### 1. 導航與一致性
| 項目 | 說明 |
|------|------|
| **子模組「回教會事工中心」** | 四大核心＋教育／敬拜／小組／宣教／探訪已有；其餘子頁（如 `attendance-management.html`、`system-integration.html`、`smart-reminders.html`、`training-programs.html`、`sunday-school.html`、`ministry_core.html` 等）多數尚無統一「⛪ 教會事工中心」或「回上一層」連結，可逐批補上。 |
| **探訪 fallback** | `visitation.html` 的 `showModal(其他 id)` 仍會顯示「模態框功能開發中」，可改為無操作或導向「新增計劃／新增記錄」。 |

### 2. 「開發中」按鈕與功能
以下仍為 `alert('…功能開發中')` 或類似，可視優先級改為**表單＋儲存**或**「暫未開放」＋連結回 Dashboard**：

- **敬拜**：`attendance-management.html`（報表生成）
- **支援**：`system-integration.html`（性能監控、自動化中心、數據清理）、`smart-reminders.html`（模板管理、自動化規則、通知中心、編輯提醒）
- **研究／分析**：`trend-analysis.html`、`performance-evaluation.html`、`member-statistics.html`、`financial-statistics.html`、`advanced-reports.html`、`activity-statistics.html`（多為報表／洞察）
- **小組**：`groups.html`（安排活動）、`activity-management.html`（活動報表、編輯）
- **教育**：`training-programs.html`（查看、線上報名、我的課程等）、`sunday-school.html`（查看資源、學生管理、出席統計等）
- **設計**：`promotional-materials.html`、`poster-design.html`、`brand-design.html`（多為編輯／匯出）
- **總覽**：`ministry_core.html`（新增活動、查看報表、會員管理、系統設置）

### 3. 用語與空狀態
- **教育整合頁**（`education-integrated.html`）仍有多處簡體（如「总览」「班级」），可與會友／志工／財務一致改為繁體與「暫無」。
- 其他子模組若有「暂无」／「没有」可統一為「暫無」／「沒有」。

### 4. 資料與整合（依 docs 清單）
- 將 `church_data_linking.js` 與統一資料層（若存在 `unified_module_database.js`）對接。
- 各管理頁可加「載入示例／清空」按鈕，與現有 localStorage 策略一致。
- 報表與圖表：財務／會員／志工／活動等可再補圖表（折線、柱狀、餅圖），與現有 Chart.js 用法一致。

### 5. 探訪「編輯」流程
- `editPlan(id)`、`editRecord(id)` 目前僅 `showMessage`，可改為開啟與新增相同的表單並預填，儲存時更新該筆並寫回 localStorage。

---

## 二、可套用「同一套工程」的其他模組

以下模組多數具 **index + sidebar（＋ dashboard）** 結構，可套用與教會事工類似的做法：

| 模組 | 路徑 | 可套用內容 |
|------|------|------------|
| **聖經研讀 Bible Study** | `bible100_new/bible_study/` | ① 各子頁（reader、versions、commentaries 等）加上「返回聖經研讀中心」連結（指向 `index.html` 或 `dashboard.html`）<br>② 空狀態統一為「暫無」、用語與現有繁體一致<br>③ 若有「開發中」按鈕，改為 stub 或簡易表單 |
| **搜尋 Search** | `bible100_new/search/` | ① 子頁加上「返回搜尋中心」<br>② 空狀態與錯誤提示一致 |
| **AI 工具 AI Tools** | `bible100_new/ai_tools/` | ① 各工具頁「返回 AI 工具中心」<br>② 「開發中」改為說明或 stub<br>③ 若有總覽／路線圖可放單頁 |
| **學校管理 School Management** | `bible100_new/school_management/` | ① 統一「返回學校管理中心」<br>② 用語繁體＋空狀態「暫無」<br>③ 子頁（unified、landing）導航一致 |
| **詩歌管理 Hymn** | `bible100_new/hymn_management/` | ① 返回詩歌管理中心、dashboard 入口<br>② 空狀態與用語一致 |
| **導航中心 Nav Hub** | `bible100_new/nav_hub/` | ① 各說明／工具頁返回 nav_hub index<br>② 可做「全站模組總覽」入口 |
| **門徒/事工 Disciple / Smart Ministry** | `bible100_new/disciple_dynamics/`、`smart_ministry/` | ① 若有 index＋sidebar，補「返回○○中心」<br>② 統一空狀態與用語 |
| **探訪（根目錄）Visitation** | `bible100_new/visitation/` | 與 `church_ministry/modules/fellowship/visitation.html` 關係厘清：可互相連結或統一入口，避免重複維護。 |
| **多語 Languages** | `bible100_new/languages/` | 各語系若有統一入口頁，可加「返回語言首頁」；空狀態與錯誤訊息一致。 |

---

## 三、建議優先順序

1. **教會事工內**：先補「子模組返回教會事工中心」＋「探訪編輯計劃／編輯記錄」表單，再逐批把高頻「開發中」改為表單或明確說明。
2. **其他模組**：先選一個與教會事工同頻率使用的（例如 **bible_study** 或 **school_management**），套用「返回中心 ＋ 空狀態 ＋ 用語」三件套，再複製到 search、ai_tools、hymn_management 等。

如需我直接從某一項開始改（例如先補子模組返回連結，或先做 bible_study 的返回＋空狀態），可指定模組與優先項。
