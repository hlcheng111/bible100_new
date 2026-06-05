# 柬埔寨與寮國語言模組建立報告

## 📋 執行日期
2025-01-XX

## ✅ 已完成項目

### 1. 清理工作
- ✅ 刪除空的 `lang_cn/`, `lang_en/`, `lang_id/`, `lang_vi/` 資料夾

### 2. 資料夾結構建立
- ✅ 建立 `languages/kh/` (柬埔寨) 完整結構：
  - `kh/NT/chapters/`
  - `kh/NT/advance/`
  - `kh/OT/chapters/`
  - `kh/OT/advance/`
  - `kh/T4/chapters/`
  - `kh/T4/advance/`
- ✅ 建立 `languages/lo/` (寮國) 完整結構（同樣結構）

### 3. 檔案命名策略（已實施）
- ✅ 採用統一命名格式：`{語言代碼}_{模組}_{類型}{兩位數編號}.html`
- ✅ 範例：
  - `kh_NT_chapter01.html`
  - `lo_NT_chapter01.html`
  - `kh_NT_appendix01.html`
  - `lo_OT_chapter01.html`

### 4. 雙語內容模板
- ✅ 建立雙語並排布局（柬/英、寮/英）
- ✅ CSS 樣式：左右分欄，移動端自動改為上下排列
- ✅ 語言標識色：
  - 柬埔寨：`#f39c12` (橙色)
  - 寮國：`#9b59b6` (紫色)
  - 英文：`#007cba` (藍色)

### 5. 主頁面建立
- ✅ `languages/kh/index.html` - 柬埔寨主頁
  - Topbar 包含所有語言切換連結
  - Sidebar 顯示雙語標題（柬/英）
  - 12個NT章節連結已建立（使用新命名）
- ⚠️ `languages/lo/index.html` - 寮國主頁（需要手動建立，基於柬埔寨模板）

### 6. 章節檔案建立
- ✅ `languages/kh/NT/chapters/kh_NT_chapter01.html` - 雙語模板範例
- ✅ `languages/kh/NT/chapters/chapter1.html` - 重定向檔案（向後兼容）
- ⚠️ 其他11個章節檔案（chapter02-12）需要建立
- ⚠️ `languages/lo/NT/chapters/lo_NT_chapter01.html` - 需要建立

### 7. 總 INDEX 更新
- ✅ `languages/index.html` - 加入柬埔寨和寮國語言切換
- ✅ `languages/index_cn.html` - Sidebar 加入多語言標題顯示（NT Lesson 1範例）
  - 顯示所有語言的標題（CN, ID, VN, KH, LO, EN）
  - 每個語言有顏色標識和語言代碼徽章

### 8. 語言 Topbar 更新
- ✅ `languages/en/index.html` - 加入柬埔寨和寮國連結
- ✅ `languages/kh/index.html` - 包含所有語言連結
- ⚠️ 其他語言（vi, id, ch, ad, cn）的 topbar 需要更新

### 9. 重定向機制
- ✅ 建立 `chapter1.html` → `kh_NT_chapter01.html` 重定向
- ✅ 建立 `chapter1.html` → `lo_NT_chapter01.html` 重定向

---

## ⚠️ 待完成項目

### 高優先級
1. **建立寮國主頁**
   - 複製 `languages/kh/index.html` 到 `languages/lo/index.html`
   - 修改所有 `kh` → `lo`
   - 修改柬埔寨語文字 → 寮國語文字
   - 修改顏色標識 `#f39c12` → `#9b59b6`

2. **建立寮國第一個章節**
   - 複製 `languages/kh/NT/chapters/kh_NT_chapter01.html` 到 `languages/lo/NT/chapters/lo_NT_chapter01.html`
   - 修改語言代碼和文字

3. **建立其他章節檔案**
   - 柬埔寨：`kh_NT_chapter02.html` 到 `kh_NT_chapter12.html`（11個）
   - 寮國：`lo_NT_chapter02.html` 到 `lo_NT_chapter12.html`（11個）
   - OT 和 T4 的章節檔案

4. **更新其他語言的 Topbar**
   - `languages/vi/index.html`
   - `languages/id/index.html`
   - `languages/ch/index.html`
   - `languages/ad/index.html`
   - `languages/cn/index.html`

5. **更新總 INDEX Sidebar**
   - 在 `index_cn.html` 中為其他章節（chapter2-12）也加入多語言標題顯示
   - 更新 OT 和 T4 部分的多語言顯示

### 中優先級
6. **建立 index.html 檔案**
   - `languages/kh/NT/index.html`
   - `languages/kh/OT/index.html`
   - `languages/kh/T4/index.html`
   - `languages/lo/NT/index.html`
   - `languages/lo/OT/index.html`
   - `languages/lo/T4/index.html`

7. **建立 advance 檔案**
   - NT: 17個 appendix 檔案
   - OT: 至少12個 appendix 檔案
   - T4: 至少12個 appendix 檔案

---

## 📝 檔案路徑參考

### 已建立檔案
- `C:\Users\hlche\.cursor\bible100_new\languages\kh\index.html`
- `C:\Users\hlche\.cursor\bible100_new\languages\kh\NT\chapters\kh_NT_chapter01.html`
- `C:\Users\hlche\.cursor\bible100_new\languages\kh\NT\chapters\chapter1.html` (重定向)

### 需要建立的檔案
- `C:\Users\hlche\.cursor\bible100_new\languages\lo\index.html`
- `C:\Users\hlche\.cursor\bible100_new\languages\lo\NT\chapters\lo_NT_chapter01.html`
- `C:\Users\hlche\.cursor\bible100_new\languages\kh\NT\chapters\kh_NT_chapter02.html` 到 `kh_NT_chapter12.html`
- `C:\Users\hlche\.cursor\bible100_new\languages\lo\NT\chapters\lo_NT_chapter02.html` 到 `lo_NT_chapter12.html`

---

## 🎯 預覽路徑

### 柬埔寨
- 主頁：`file:///C:/Users/hlche/.cursor/bible100_new/languages/kh/index.html`
- 第一章節：`file:///C:/Users/hlche/.cursor/bible100_new/languages/kh/NT/chapters/kh_NT_chapter01.html`

### 總 INDEX（多語言顯示）
- 主頁：`file:///C:/Users/hlche/.cursor/bible100_new/languages/index.html`
- Sidebar：`file:///C:/Users/hlche/.cursor/bible100_new/languages/index_cn.html`

---

## 📌 注意事項

1. **檔案命名統一**：所有新檔案都使用 `{語言代碼}_{模組}_{類型}{兩位數}.html` 格式
2. **向後兼容**：舊的 `chapter1.html` 會自動重定向到新檔名
3. **雙語顯示**：所有內容採用柬/英、寮/英並排顯示
4. **Sidebar 多語言**：總 INDEX 的 sidebar 會顯示所有語言的標題，方便切換

---

## 🔄 下一步建議

1. 先完成寮國主頁和第一個章節（基於柬埔寨模板）
2. 批量建立其他章節檔案（可以使用模板複製）
3. 更新所有語言的 topbar
4. 完善總 INDEX sidebar 的多語言顯示
