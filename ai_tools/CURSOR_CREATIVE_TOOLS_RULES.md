# Cursor 聖經教學 AI 工具中心 - 創作工具模組設計規則

> 可直接將本文件內容複製給 Cursor 作為設計規則使用，確保所有改動符合「靜態、低成本、iframe 內運行、復用性強」原則。

---

## 核心原則

1. **靜態網站**：所有功能僅使用 HTML/CSS/JS 實現，無後端依賴。
2. **iframe 內打開**：所有外部 AI 平台鏈接（如 Pika AI / Midjourney / ChatGPT）必須在 `contentFrame` iframe 內打開，禁止 `target="_blank"` 跳轉新頁。
3. **中英雙語標注**：保留「中文 + 英文 + 圖標」的命名形式（如 🖼️ 文字轉圖像 Text to Image），為學生未來學習鋪墊。
4. **Prompt 指南**：每個工具頁面必須包含「聖經教學專屬 Prompt 設計指南」，並提供「一鍵複製 Prompt」按鈕。
5. **離線可用**：改動需保證 PC/平板離線可用，依賴 LocalStorage 而非後端存儲。

---

## 頁面設計規則

### 1. 創作工具總落地頁（`tools/creative_tools_landing.html`）

- **結構**：每個子工具對應一個卡片，包含「工具名稱 + 聖經 Prompt 指南 + 打開工具按鈕」。
- **樣式**：統一使用 `#004d99` / `#007cba` 為主色，與儀表板風格一致。
- **交互**：所有「打開工具」按鈕使用 `target="contentFrame"`，確保在右側 iframe 內打開。
- **路徑**：落地頁位於 `ai_tools/tools/`，子工具鏈接為 `../pages/ai_text_to_*.html`（圖/語音/音樂）、`ai_text_to_video.html`（同目錄影片）。

### 2. 子工具頁面（`ai_text_to_image.html` / `ai_text_to_video.html` / `ai_text_to_speech.html` / `ai_text_to_music.html`）

- **頂部**：必須有「📖 Prompt 設計指南」或聖經教學專屬模板區，包含至少 2 個聖經場景範例。
- **推薦 AI 平台**：所有平台鏈接必須 `target="contentFrame"`，並可標註「預設聖經模板」。
- **複製按鈕**：提供「複製範例 Prompt」按鈕，復用統一複製邏輯，例如：
  ```js
  function copyPrompt(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        alert('聖經 Prompt 已複製！');
      }).catch(function() {
        alert('請手動選取文字複製');
      });
    } else {
      alert('請手動選取文字複製');
    }
  }
  ```
- **可選**：在父頁（index.html）可添加 iframe 加載監聽，當 contentFrame 打開目標 AI 平台時，提示用戶粘貼預設 Prompt（跨域時僅能提示，無法自動填充）。

### 3. 功能復用規則

- 文轉圖 / 文轉語音 / 文轉音樂 / 文轉影片頁面，必須遵循同一套「Prompt 指南 + 平台鏈接 target=contentFrame + 複製按鈕」邏輯。
- 按鈕樣式、主色、交互邏輯全站統一，降低用戶學習成本。
- 靜態資源（範例圖片/音頻等）存放於 `resources/` 目錄，使用相對路徑引用。

---

## 優化優先級

1. **P0**：創作工具總落地頁（`creative_tools_landing.html`）作為模組群入口，側欄「創作工具」下首項為「創作工具總覽／Prompt 指南」。
2. **P1**：文轉影片頁面（`ai_text_to_video.html`）實現 iframe 預設平台（如 Pika）+ 所有平台鏈接 `target="contentFrame"` + Prompt 指南。
3. **P2**：將同一邏輯復用至文轉圖、文轉語音、文轉音樂頁面（平台鏈接 iframe 內打開 + 聖經 Prompt 區 + 複製按鈕）。
4. **P3**：完成後測試 PC/平板離線可用性，確保無跨域/加載問題。

---

## 路徑與 target 速查

| 頁面位置           | 鏈接目標                     | href 範例                          | target      |
|--------------------|------------------------------|-------------------------------------|-------------|
| 側欄 (sidebar)     | 創作工具總覽                 | `tools/creative_tools_landing.html` | contentFrame |
| 側欄               | 各子工具                     | `pages/ai_text_to_*.html` 或 `tools/ai_text_to_video.html` | contentFrame |
| 落地頁 (tools/)    | 各子工具                     | `../pages/ai_text_to_image.html` 等 | contentFrame |
| 任意子工具頁       | 外部 AI 平台（Pika/Kimi 等） | `https://pika.art` 等               | contentFrame |
| 任意頁             | 返回主站 / 儀表板            | `../index.html` / `../dashboard.html` | _parent 或 contentFrame |

---

## 小結

- **代碼**：Prompt 指南以「創作工具總落地頁」為統一入口，子頁保留聖經範例與複製按鈕；所有 AI 平台鏈接使用 `target="contentFrame"` 在 iframe 內打開。
- **協作**：將本規則提供給 Cursor，可依此統一設計與修改創作工具相關頁面。
- **原則**：靜態實現、無後端、維護成本低、保留中英雙語，貼合聖經教學與學生學習需求。
