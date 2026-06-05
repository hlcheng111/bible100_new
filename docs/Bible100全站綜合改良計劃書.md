# Bible100 全站綜合改良計劃書

**兼顧**：理念、內容、功能、樣式、技術。  
**北極星**：小白 **可用、能用、易用、敢用、想用**。  
**總站入口**：`bible100_new/index.html` **轉址至** `index_v5.html`（舊版整頁備份：`index_legacy.html`，網址 `?legacy=1` 可開舊版）。

**配套文件**（單一真相鏈，維護時只擴充、不自創另一套）：

- `docs/ARCHITECTURE.md`
- `SITE_併修新_實施進度.md`
- `SITE_功能頁去向_排除languages.md`
- `docs/TOOLS_AND_ENTRY_REFERENCE.md`（含 **§八 模組入口對應表**）
- `📖 Bible 100 - 全站重整與架構升級建議書.txt`
- `docs/reports/SITE_FULL_AUDIT_LATEST.md` + CSV（自動盤點）
- 分階段細項亦見：`docs/全站整全改良計劃書.md`

---

## 0. 北極星與角色

**體驗目標**

- **可用**：重要功能能找到、能打開、不 404。  
- **能用**：少步驟完成任務（例：找到某經文難題答案）。  
- **易用**：導航一致、字級清楚、切語言／模組不迷路。  
- **敢用**：有明顯返回、取消；資料操作可預期。  
- **想用**：內容有價值；AI／延伸查經有幫助。

**總工程師角色**：整合理念（四寶／主線）、內容、功能、樣式、技術（檔案結構、盤點、測試）。

---

## 1. 模組化殼：index_v5 只做「火車站」

### 1.1 殼負責

- 選 **教材語言軌**（殼第二列，與 `languages/index_*.html` 對應，不取代教材內文）。  
- 選 **主模式**（教材與培訓、聖經探索器、Q&A、教會教牧、AI）。  
- 以 **雙 iframe** 載入側欄與內容；**禁止**在殼內直接嵌入模組內文。

### 1.2 語言列樣式（殼專用）

- 僅在 `index_v5` 的 `.row2 .lang-switch.lang-inline` 控制字級。  
- 規則：**所有語言連結** `font-size: 10px`、`padding: 1px 4px`（與現行 CSS 一致，以 EN 列為視覺基準）。  
- **不**在殼內改 `languages/` 內頁字級；教材側欄另開任務只改 `languages/index_*.html`。

### 1.3 模組入口函式（已實作於 index_v5）

所有模組開啟經 **已登記** 之 `window.open…()`，路徑以 `docs/TOOLS_AND_ENTRY_REFERENCE.md` **§八** 為準；禁止自創未登記路徑字串。  
（Defending／GotQuestions 暫導向 `qna/qna_landing.htm`；日後若有獨立索引檔再改登記。）

---

## 2. 盤點與分階段整改

### 2.1 自動盤點基線（`scripts/site_full_audit.py`，排除 `languages/`）

- 頁面數：822。  
- 清單有、檔案無：1（`bible_study/unified_bible_reader.html`）。  
- 空 `<title>`：19。  
- 疑似斷連結之檔案：56。  
- 疑似測試／暫存檔名：33。  
- 重複 title：42 組。  

（重跑：`python scripts/site_full_audit.py`）

### 2.2 整改波次（與工程計劃一致）

- **階段 0**：清單與檔案一致（含 `unified_bible_reader`）→ 驗收：缺檔 = 0。  
- **階段 1**：index_v5 語言列與殼行為穩定 → Smoke：五模式 + 一語言切換。  
- **階段 2**：斷連結治理（依 CSV 模組順序）。  
- **階段 3**：title 治理。  
- **階段 4**：測試／暫存頁清理。  
- **階段 5**：`modules/` 空 title 策略。  
- **階段 6**：`bible_study`／`church_ministry`／`school_management` 對齊藍圖。  
- **階段 7**：`languages/` 專案。  
- **階段 8**：Omni-Search、IndexedDB、跨 iframe（不阻塞 0–7）。

---

## 3. Q&A 導覽統一原則（內容 + 功能）

對 etspedia、Defending、GotQuestions、ChristianAnswers、Reformed、Billy Graham 等：

- **三層導覽 + iframe**（大線／子類／具體題目）。  
- **URL 來源**：僅維護者提供的入口，或指定頁上既有 `<a href>`（照抄）；禁止猜 slug、禁止批量改寫 URL、禁止翻譯 URL。  
- **各站分頁**：不混站；獨立索引檔如 `qna_etspedia_index.htm`、`qna_ca_teens_index.htm` 等。

---

## 4. 人工 + AI 分工與 Smoke

**每波次後必做**

- 開 `index_v5`（或由 `index.html` 轉入）：五模式各一次；任選一語言完成「教材 → 返回」路徑。  
- 本機 HTTP：`python -m http.server 8080` 再測（與 `file://` 對照）。

**人工**：分類與關鍵入口 URL、教會／AI 敏感區目視。  
**AI／工具**：在範圍內產 HTML/JS、跑盤點、整理 CSV。

---

## 5. 小任務模板（之後每改一塊可加）

- **上位規則**：本計劃書 + `TOOLS_AND_ENTRY_REFERENCE` §八。  
- **允許改動範圍**：（填檔名／目錄）。  
- **目標**：（一句話）。  
- **驗收**：Smoke 項目 + 盤點重跑（若動連結／title）。

---

**維護**：重大波次或盤點重跑後，更新 `SITE_FULL_AUDIT_LATEST.md` 日期與 §2.1 數字。
