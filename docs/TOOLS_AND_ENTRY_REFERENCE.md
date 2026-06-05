# 工具與入口參考 TOOLS_AND_ENTRY_REFERENCE

**建立日期**: 2025-03  
**用途**: 作為日後調整工具總覽、入口、編輯器的依據。

**權限與角色（全站）**：新增工具或上雲接入時，請對齊 [RBAC_THREE_TIERS_STANDARD.md](./RBAC_THREE_TIERS_STANDARD.md)（總管／編輯／用家、能力碼、大量個資匯入規則）。

---

## 一、工具 ▾ 總覽 = 全站功能總入口

### 結構

- **頂欄**：點擊「工具 ▾」展開下拉選單
- **前往工具總覽**：載入工具側欄 + 會眾入口 Dashboard（contentFrame 預設為 `church_ministry/congregation/index.html`）
- **側欄**：`tools/tools-overview-sidebar.html`，列出全站功能入口

### 會眾入口作為 Dashboard

會眾入口（`church_ministry/congregation/index.html`）的資料與卡片，作為工具總覽的預設主畫面（Dashboard）。

---

## 二、功能分類

| 類型 | 說明 | 範例 |
|------|------|------|
| 模組獨用 | 僅該模組使用 | 詩歌編輯器、自訂頁面編輯器、PPT 生成器 |
| 跨模組 | 多模組可共用 | HTML 編輯器、翻譯、送給 AI |
| 聯合使用 | 與其他功能搭配 | 我的收藏、我的參與、AI 平台 |

---

## 三、入口清單

### 導航與 Dashboard
- 會眾入口 Dashboard：`church_ministry/congregation/index.html`
- 目錄搜索：`nav_hub/index.html`
- 站點導航：`sitemap_navigation.html`

### 編輯與貢獻
- HTML 編輯器：`tools/html_editor.html`
- 詩歌編輯器：`hymn_management/hymn_editor.html`
- 自訂頁面編輯器：`church_ministry/custom-page-editor.html`
- PPT 生成器：`hymn_management/ppt_generator.html`

### 通用工具
- 翻譯：`help/translate.html`
- 送給 AI：`help/ai-chooser.html`
- 已收藏：`help/my-saved.html`
- 我的參與：`help/my-participation.html`

### 說明與文檔
- 全站說明：`help/global-tools.htm`
- 功能總覽表：`help/tools-overview.html`
- 架構與文檔中心：`help/docs-hub.html`

### Church Planning／問卷與調查工具
- 教會規劃主索引（工具／卡片）：`church_planning/index_plan.html`
- 教會規劃模組殼（獨開雙欄）：`church_planning/index.html`
- 側欄：`church_planning/sidebar_plan.html`
- 信徒靈性生命健康自我審查：`church_planning/信徒靈性生命健康自我審查.html`
- 教牧／領袖靈命調查（專業版）：`church_planning/pastoral-spiritual-survey-pro.html`

#### 教牧／信徒靈命調查（實作說明）

關於以下兩個問卷頁面的計分與報告渲染實作說明，請參考：

- **全站問卷原則、對齊進度、算法一致性、技術總覽**：`docs/SURVEY_DESIGN_PRINCIPLES.md`
- **教牧／信徒卷專用實作細節**：`church_planning/docs/PASTORAL_MEMBER_IMPLEMENTATION_NOTES.md`

涵蓋內容（專題 notes）：

- 信徒靈性生命健康自我審查
- 教牧／領袖靈命調查（專業版）
- 共用 scoring 模組 `church_planning/js/spiritual_health_scoring.js` 的使用方式（檔案建立後由同目錄 HTML 以 `src="js/spiritual_health_scoring.js"` 引入）

### 智慧事奉 Smart Ministry

- 模組殼（雙欄）：`smart_ministry/index.html`
- AI 智慧事奉路線圖（內容頁）：`smart_ministry/landing.html`
- 牧者／同工使用指南：`smart_ministry/guide_for_leaders.html`
- **Landing UX 原則（全站適用、待分模組擴充）**：`docs/LANDING_UX_PRINCIPLES.md`

---

## 八、總站殼（index_v5）模組入口對應表

**主入口**：根目錄 `index.html` 會 **轉址至 `index_v5.html`**（舊版整頁入口備份為 `index_legacy.html`，網址可加 `?legacy=1` 開啟舊版）。

殼內僅以 **雙 iframe** 載入模組，禁止把模組內文直接貼進 `index_v5.html`。下列 **JavaScript 函式** 在 `index_v5.html` 內已實作並掛在 `window` 上，供子頁或主控台呼叫；**新增模組須先在此補一行再開檔**，路徑字串勿自創別名。

- **聖經探索器** — `openBibleExplorer()` → `bible_study/sidebar.html` + `bible_study/dashboard.html`（等同點選「聖經探索器」模式）
- **聖經難題 Q&A（四層 V2）** — `openBibleQna()` → `qna/qna_index_4layer_V2.htm`（左欄空白、全寬內容）
- **以斯拉百科 etspedia** — `openEtspedia()` → `qna/qna_etspedia_index.htm`
- **Defending Inerrancy（暫行）** — `openDefending()` → `qna/qna_landing.htm`（內含官方入口連結；日後若有 `qna_defending_index.htm` 再改登記路徑）
- **GotQuestions（暫行）** — `openGotQ()` → `qna/qna_landing.htm`
- **ChristianAnswers · Teens** — `openCaTeens()` → `qna/qna_ca_teens_index.htm`
- **ChristianAnswers · Family** — `openCaFamily()` → `qna/qna_ca_family_index.htm`
- **CA 繁中** — `openCaZh()` → `qna/qna_ca_zh_index.htm`
- **CA 印尼** — `openCaId()` → `qna/qna_ca_id_index.htm`
- **CA 越南（暫行）** — `openCaVi()` → `qna/qna_landing.htm`（專頁待建）
- **Reformed Answers** — `openReformed()` → `qna/qna_reformed_index.htm`
- **Billy Graham** — `openBillyGraham()` → `qna/qna_billy_index.htm`
- **詩歌 Hymns（全寬內嵌）** — `openHymnShell()` → `hymn_management/index.html`
- **教會教牧行政** — `openChurchAdmin()` → `church_ministry/sidebar.html` + `church_ministry/dashboard.html`
- **School Management** — `openSchool()` → `school_management/sidebar.html` + `school_management/dashboard.html`

**通用**：`applyQnaVariant(相對路徑, 載入提示字串)` — 在 Q&A 全寬殼內只換右欄內容（左欄 `about:blank`）。

上位規則與北極星見：`docs/Bible100全站綜合改良計劃書.md`。

---

## 四、規範

1. 新功能需在「工具 ▾ 總覽」側欄列出
2. 編輯器、翻譯、工具頁面建議採用統一佈局（導航、說明、操作區）
3. 各模組側欄底部可統一加入：全站說明、目錄搜索、站點導航

---

## 五、相關檔案

- 工具側欄：`tools/tools-overview-sidebar.html`
- 全站工具腳本：`js/global-tools.js`
- 主入口：`index.html` → 轉址 **`index_v5.html`**（殼）；舊版：`index_legacy.html`
