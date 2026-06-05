# 教會事工模組 · 入門導覽 UX 改良思路

供日後新增或改版 **圖表多、按鈕多、不知從哪開始** 的頁面時沿用。

## 問題情境

- 使用者看到統計／圖表，但缺少「第一步」。
- 同頁有多個分頁（tab），純 `href="#區塊"` 無法切換顯示。
- 「手機匯報」等流程若只有小按鈕，沒有並列說明，小白無法自行完成。

## 設計原則

1. **事工路線圖（橫向流程）**  
   - 每個節點：圖示 + 短標題 + 一句話。  
   - 站外連結用一般 `<a href>`；**站內分頁**必須呼叫既有 `switchTab('xxx')`，必要時再 `scrollIntoView` 到錨點。  
   - 手機改直向堆疊（見 `css/module_onboarding.css`）。

2. **雙欄「桌面流程 vs 手機流程」**  
   - 左：後台／管理員步驟。  
   - 右：第一線同工（例如手機匯報）步驟。  
   - 每欄底部一顆主要 CTA（大按鈕），次要動作保留小按鈕或連結。

3. **示範表單錨點 `#dispatch-form`**  
   - 降低心理門檻：先看欄位長相，再決定是否開正式彈窗或寫入資料。  
   - 可選：示範提交後呼叫同一套 `saveData` / `render*`，與正式資料流對齊。

4. **假頁面／示範連結**  
   - 手機流程可連到獨立輕量 HTML（如 `visitation_mobile_demo.html`），標明「示範」，避免誤以為已接後端。

5. **共用樣式**  
   - `church_ministry/css/module_onboarding.css`：路線圖、dispatch 雙欄、迷你入門條 `.module-mini-flow`。  
   - 各模組以 `<link rel="stylesheet">` 引用，避免每頁複製一大段 style。

## 已套用模組（維護時一併更新）

- `modules/support/visitation.html` — **總覽**為 landing：系統說明（示範版／未來正式版分述）、五節點路線圖、指標卡、三張圖（分區覆蓋／月趨勢／狀態柱）。其餘分頁為 **動作列 + `#action-panel-*` + 內容區**，以 `showApSection(tab, sectionId)` 切換；資料仍為 `missions[]` 等結構，Excel 匯入後可沿用同一畫面邏輯。  
- `modules/members/member-integrated.html` — 迷你入門流程  
- `modules/finance/finance-integrated.html` — 迷你入門流程  
- `modules/volunteer/volunteer-integrated.html` — 迷你入門流程  
- `modules/development/congregation-care.html` — 緊湊路線圖連結  

## 檢查清單（新頁面上線前）

- [ ] 首屏或說明區下方是否有「第一步」可點？  
- [ ] 分頁頁面是否用 `switchTab` + 錨點，而非只靠 hash？  
- [ ] 手機／第一線流程是否有獨立說明或示範頁？  
- [ ] Beta／本地資料字樣是否仍保留，避免誤解為雲端即時同步？
