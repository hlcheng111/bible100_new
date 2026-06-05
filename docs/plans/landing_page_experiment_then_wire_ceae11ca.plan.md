---
name: Landing page experiment then wire
overview: 先建立一個獨立的 landing 實驗頁（口號、sitemap、介紹、AI 區、中英），驗證版型與連結後，再改 index 預設載入並可選複製到各語言 landP。
todos: []
isProject: false
---

# Landing 實驗頁 → 接總目錄

## 設計決策：先用一 HTML 作實驗

- **建議**：先做一個獨立 HTML 當「實驗頁」，不直接改 [index.html](c:\Users\hlche.cursor\bible100_new\index.html) 的預設內容。
- **好處**：可單獨開檔或透過 `index.html#...` / 手動改 contentFrame URL 預覽；版型與連結確認後，再改總目錄預設載入，風險小、易還原。
- **你已在 PLAN mode**：此計畫確認後，切到 **Agent mode** 再執行實作；或你依計畫自行改檔。

---

## 階段一：建立獨立 Landing 實驗頁

**檔案**：在專案根目錄或 `languages/` 下新增一個 HTML，例如  
`languages/landing_new_cn.html`（與現有 [landP_cn.html](c:\Users\hlche.cursor\bible100_new\languages\landP_cn.html) 並存，不覆蓋）。

**頁面結構（由上而下）**：

1. **口號區**
  - 主標：中文為主，例如「聖經百步四寶：讀經 · 事工 · 門訓 · 智慧」
  - 副標：英文，例如 "Bible100 4 Treasures: Read · Serve · Disciple · Empower"
  - 簡短說明一句（可中英並排或小字英譯）
2. **Sitemap（可展開）**
  - 第一層：各大模組（聖經研讀、教會事工、AI 工具、AI 智慧事奉、目錄搜索、門訓動力站、學校管理等），每項可點擊進入對應模組。
  - 第二層：點擊或箭頭展開後顯示子項（例如聖經研讀 → 閱讀器、研讀工具、經文搜索）；子項同樣為連結。
  - 實作方式：手風琴或樹狀清單（`details/summary` 或 ul/li + JS 切換 class），連結用 `target="contentFrame"` 或 `target="_parent"` 依是否在 iframe 內決定（可先統一 `target="contentFrame"` 以配合現有 index 雙 iframe）。
  - 連結目標沿用現有路徑，例如：
    - 聖經研讀 → `bible_study/dashboard.html`
    - 教會事工 → `church_ministry/dashboard.html`
    - AI 工具 → `ai_tools/dashboard.html`
    - AI 智慧事奉 → `smart_ministry/ai_smart_ministry_overview.html`
    - 目錄搜索 → `nav_hub/dashboard.html`
    - 其餘依現有 topbar 連結對應。
3. **頁中／下部：特色介紹**
  - 一區塊介紹「聖經動作版」或 100 步讀經／四寶用法（文案可短，預留標題+內文+一張圖或按鈕連結）。
  - 另一區塊：「智慧應用」— AI 工具、AI 智慧事奉的簡短說明與按鈕，連到上述路徑。
4. **語言與導航**
  - 頁內以中文為主、關鍵處附英譯（與現有 landP_cn 風格一致）。
  - 不在此頁重做語言切換邏輯；換語言仍由 index 的 topbar 處理，換語後可載入對應 `landP_xx.html`（後續可把此版型複製到各語 landP）。

**技術要點**：

- 單一 HTML + 內嵌 CSS，必要時少量 JS（展開/收合 sitemap）。
- 所有連結需在 **iframe 內正確跳轉**：若此頁放在 `contentFrame`，則連結用 `target="contentFrame"` 會無效（自己就是 contentFrame），應改為 `target="_top"` 或 `target="_parent"` 並用完整相對路徑（如 `../bible_study/dashboard.html` 若從 `languages/landing_new_cn.html` 出發），或使用 `parent.contentFrame.src = '...'` 由父頁切換。建議：**連結統一用 `target="_parent"` + 相對路徑**（從專案根出發則為 `bible_study/dashboard.html`），這樣無論直接開此 HTML 或放在 iframe 內皆可（直接開時 _parent 即自己）。
- 若此檔放在 `languages/`，連結到同層以外模組需用 `../bible_study/dashboard.html` 等。

---

## 階段二：預覽與驗證

- 方式 A：瀏覽器直接開啟 `languages/landing_new_cn.html`，檢查版型與連結（連結會整頁跳轉，屬預期）。
- 方式 B：暫時改 [index.html](c:\Users\hlche.cursor\bible100_new\index.html) 第 598 行，將 `contentFrame` 的 `src` 改為 `languages/landing_new_cn.html`，重新整理 index，確認在 iframe 內顯示正常且點擊模組後右欄或整頁正確進入各模組（依你連結的 target 設計）。
- 確認：口號、sitemap 展開/收合、聖經動作版區、AI 區、中英呈現皆符合預期。

---

## 階段三：接上總目錄（預設改為新 Landing）

- 在 [index.html](c:\Users\hlche.cursor\bible100_new\index.html) 中：
  - 將 `contentFrame` 的預設 `src`（第 598 行）從 `data/bibles/bible_reader_final.html` 改為 `languages/landing_new_cn.html`。
  - 若希望「第一次進站」就顯示新 landing，且 init 時不再覆寫 contentFrame，則維持現有 `initPage()` 只設定 `sidebarFrame.src = 'languages/index_cn.html'` 即可（不改 contentFrame），這樣首屏即為新 landing + 中文側欄。
- 語言切換行為：現有 `langMap.first` 仍指向各語 `landP_xx.html`，因此切語言後會顯示各語 landP；若日後要讓各語也使用「新版 landing 版型」，可再將 `landing_new_cn.html` 的結構複製到 `landP_en.html` 等並替換文案，或改 `langMap.first` 指向各語版新 landing。

---

## 階段四（可選）：多語版型

- 將 `landing_new_cn.html` 的區塊與結構複製到 [landP_en.html](c:\Users\hlche.cursor\bible100_new\languages\landP_en.html) 等，僅替換標題與內文為該語言（或中英對調），連結路徑不變。
- 或新增 `landing_new_en.html`、`landing_new_vi.html` 等，並在 `langMap.first` 中改為對應檔名，使切語言後仍為同一版型、不同語言之 landing。

---

## 檔案與程式變更摘要


| 項目  | 說明                                                                                     |
| --- | -------------------------------------------------------------------------------------- |
| 新增  | `languages/landing_new_cn.html` — 口號、sitemap（可展開）、聖經動作版介紹、AI 區、中英                      |
| 修改  | `index.html` 第 598 行 — `contentFrame` 預設 `src` 改為 `languages/landing_new_cn.html`（階段三） |
| 可選  | 複製版型至 `landP_en.html` 等或新增 `landing_new_xx.html`，並更新 `langMap.first`                   |


---

## 執行方式

- 你目前在 **Plan mode**：此計畫僅規劃，不自動改檔。
- 若要由我實作：請切換到 **Agent mode**，然後說「依計畫執行 landing 實驗頁」或「先做階段一」。
- 若你要自己做：可依階段一 → 二 → 三順序，先完成 `landing_new_cn.html` 再改 index 預設。

