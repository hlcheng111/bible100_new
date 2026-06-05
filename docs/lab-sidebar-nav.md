# 側欄導航（file:// 與 iframe）

## 問題

在 `file://` 下，`target="contentFrame"` 常失效，瀏覽器會在**當前 iframe（左欄）**開啟整頁，看起來像字體變大、版面跑掉。

## 作法（已實作）

1. **`sidebar_lab.html`、`ai_tools/sidebar.html`**  
   - 右欄連結改為：`<a href="#" data-b100-path="相對於側欄頁的路徑">`  
   - `<head>` 引入：`assets/js/sidebar-postmsg-nav.js`  
   - 點擊時**只**執行：`parent.postMessage({ type: 'bible100-sidebar-content-nav', url: 絕對URL }, '*')`

2. **父殼**（`ai_lab.html`、`ai_tools/index.html`、`index_v5.html`）  
   - 監聽上述訊息，設定 `document.getElementById('contentFrame').src = url`。

3. **`js/sidebar_behavior.js`**  
   - 不再對帶 `data-b100-path` 的連結自動加上 `target="contentFrame"`（否則會覆寫修復）。

4. **重置**  
   - 兩個側欄頂部有「重置雙欄」按鈕，可 `reload` 殼頁以回到乾淨雙欄狀態。

## 內容頁

工作站內頁仍可用 `lab-frame-nav.js` 的 `labNav()` 或攔截殘留的 `target="contentFrame"`；與側欄 **`data-b100-path`** 路徑分離。

## index_v5 AI 模式

頂欄「核心三」僅保留 **聖經 AI 學習 Lab**（`openBibleAILabLearnShell`）等；切換至 **AI 輔助** 模式時預設亦載入新版側欄 + `ai_lab_landing.html`。

`openAITools()` 仍保留供側欄 **重置**（`bible100-ai-tools-reset`）：先試 **`sidebar_lab.html`**，失敗或逾時則回退 **`sidebar.html` + `dashboard.html`**。

側欄內請勿對總站殼使用 **`target="_parent"`** 開 `ai_lab.html`（會整頁飛走）。改為 **`data-b100-path`** 只在右欄換頁，或註明另開 `ai_tools/ai_lab.html`。
