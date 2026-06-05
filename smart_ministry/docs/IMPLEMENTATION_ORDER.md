# Smart Ministry：人才／問卷／配對 — 建議實作順序與資料配搭

## 「更美方案」記錄在案（資訊架構 · 中英並列）

- **總品牌 · Brand：** 🤖 **AI 智慧事奉** / **AI Smart Ministry**（用於路線圖與對外敘事，不單指某一按鈕）。
- **主入口 · Entry：** `smart_ministry/landing.html` — 首屏經文與保證句、**會友／同工**雙入口、`#journey` 四步卡、`#theology` 神學長文。
- **工作台殼 · Hub：** `smart_ministry/index.html` — 側欄三組：**開始服事 · Start**｜**深入了解 · Learn**｜**同工工具 · Staff**；iframe 預設 `landing.html#journey`。
- **短文 · Why：** `why_serve.html` — 「為何問恩賜與技能」雙語標題。
- **模組附英譯：** 側欄與主要按鈕採「中文 · English」短詞，技術檔名放副標／tooltip，便於國際化與小白辨識。
- **牧養原則：** 不自動派工、規則建議需禱告與牧者分辨；配對頁與問卷完成頁含 **disclaimer** 中英對照句。

## 資料來源現況（v1 canonical 已上線）

**正式規格全文：** [`SMART_MINISTRY_DATA_RULES.md`](./SMART_MINISTRY_DATA_RULES.md)

| 項目 | 說明 |
|------|------|
| Canonical 儲存鍵 | `bible100_smart_ministry_main`（見 `js/smart_ministry_canonical_store.js`） |
| 人才主鍵 | `talent_id` = `member_id`（`registration.html` 寫入會友後同步 canonical） |
| 人才–技能 | **已**改為寫入 canonical `talent_skill`（`talent_skill_unified.html` 不再依賴 `smart_ministry_linking` 作為真相） |
| 事奉配對 | **已**改為讀寫 canonical `talents` / `talent_skill` / `ministries` / `ministry_assignment`（`talent_ministry_matching.html`） |

仍待接線：問卷與測驗頁應改為 `attachAssessmentToTalent`（見規格 §4）。

問卷（`questionnaire_system.html` 或未來 wizard）提交後應寫入 **與人才技能頁相同** 的 `talents`／`skills` store，並在跳轉 `talent_skill_unified.html?newId=xxx` 時自動選中人。

---

## 資料流（文字版）

```
問卷輸出
  → talents（姓名、聯絡、恩賜 gift、可選 profile／標籤）
  → 可選：skills 表無則沿用技能庫主檔

人才技能管理（本頁）
  → 讀寫：bible100_smart_ministry_talents、…_skills
  → 變動：SmartMinistryLinking 內 type=talent_skill 的連結（新增／刪除映射）
  → 不強制重複寫 talents.skills 字串（若日後加冗餘欄需單一寫入策略）

事工配對（未來打通後）
  → 讀：talents + ministries（或事工主檔）+ talent_skill 展開後的技能集合
  → 寫：ministry_assignment（或與現有 simpleDB 合併策略一致）
```

---

## 建議實作順序

### ✅ 階段 A — 人才技能頁可運作

- 強制 `useJSON` + 同步 `queryFromJSON` / `saveToLocalStorage`，避免 Promise 當陣列用。
- 修正 `SmartMinistryLinking` 清空 API（`clearAll(true)`）。
- 可選：`?newId=` 自動選中人才（方便問卷跳轉後續接）。

**完成標準：** 載入後左／右欄有資料；生成示例後可連結技能；Console 無錯誤。

### ✅ 階段 A2 — 中欄體驗（規則推薦、篩選、指標）

- 中欄教練文字：已選人、已連結數、建議補強、未達人均門檻提醒。
- 規則式推薦列表 + 一鍵全選；「智能推荐（規則）」按鈕。
- 右欄「只看此人已連結技能」。
- 統計：人均目標（預設 ≥3）、未達標人數、左欄未達標標籤。

**完成標準：** 選人後可讀懂下一步；推薦與篩選可重現操作。

### 階段 B2 — 最小問卷 → 寫入同源 → 跳轉

- 2 步假表單 + 提交寫入 `talents`（與 A 相同 store）。
- 成功後 `location.href = 'talent_skill_unified.html?newId=' + encodeURIComponent(id)`。

**完成標準：** 至少新增一位新人，在人才技能頁左欄可見；帶 `newId` 時自動選中。

### 階段 B1 — 題卷內容與標籤

- 依恩賜／技能／時間／偏好產出標籤；技能 code 與 `skills` 表對齊。

**完成標準：** 問卷欄位可映射到現有 `talents`／技能庫結構（文件或表註記）。

### 階段 C — 三欄頁窄屏／步驟 UX

- 精靈式切換或窄屏僅顯示當前步驟（與問卷 UX 一致）。

**完成標準：** 手機寬度下**不需橫向捲動**即可完成：選人 → 選技能 → 添加（現有直向堆疊可再驗收）。

### 階段 D — **「🎯 人才事工智能配對」**（✅ canonical 已接線）

- 與「人才技能管理」共用 **`bible100_smart_ministry_main`**（`talent_skill` + `ministry_assignment`）。
- 配對分數使用 **`getSkillsDisplayString`**（canonical 技能 + 舊 `skills_legacy` 後備）。
- 儀表板統計優先讀 canonical（見下節）。

**完成標準（v1）：** 配對與技能頁寫入同一 canonical；儀表板可反映筆數。

### 儀表板 `dashboard.html`（本機即時計數 · 已接線）

- **`js/dashboard_live_stats.js`**：`getSmartMinistryDashboardStats()` 從本機 `localStorage` 讀取並彙總：
  - 會友／人才檔：`memberSystemData`；若無則以統一模組／simpleDB 人才筆數為參考。
  - 事奉配對連結：`smart_ministry_linking` 中 `type === 'ministry_assignment'` 的筆數。
  - 事工崗位：`bible100_main` → `ministries.data`。
  - 人才↔技能映射：`type === 'talent_skill'` 的筆數。
- 頁首 **資料來源說明**（中英）標明：數字僅代表**此瀏覽器**內資料，非雲端教會總量；清除儲存或換裝置會變。

---

## 互相配搭（使用者流程）

1. 問卷 → 人才進入 `talents` → **人才技能管理** 精調 **`talent_skill`** 映射。  
2. **人才技能管理** → **人才事工配對** 依人員＋技能與崗位配對。  
3. 匯出 JSON 可作備份；日後接 API 時以同一 schema 上傳。
