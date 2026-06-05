# 建立柬埔寨與寮國語言模組關鍵檔案計劃

## 📋 執行日期
待確認

## 🎯 目標
建立14個關鍵檔案（柬埔寨7個 + 寮國7個），讓總INDEX能正常運作，使用雙語標題模板框架。

---

## 📁 檔案清單

### 柬埔寨（kh）- 7個檔案
1. ✅ `languages/index_kh.html` - Sidebar檔案（基於index_cn.html）
2. ✅ `languages/landP_kh.html` - Landing page（基於landP_cn.html）
3. ✅ `languages/kh/NT/index.html` - NT模組首頁（基於en/NT/index.html）
4. ✅ `languages/kh/OT/index.html` - OT模組首頁（基於en/OT/index.html）
5. ✅ `languages/kh/T4/index.html` - T4模組首頁（基於en/T4/index.html）
6. ✅ 修正 `languages/kh/index.html` - 修正路徑問題
7. ✅ 更新 `languages/index.html` - 更新langMap配置

### 寮國（lo）- 7個檔案
8. ✅ `languages/index_lo.html` - Sidebar檔案（基於index_kh.html）
9. ✅ `languages/landP_lo.html` - Landing page（基於landP_kh.html）
10. ✅ `languages/lo/NT/index.html` - NT模組首頁（基於kh/NT/index.html）
11. ✅ `languages/lo/OT/index.html` - OT模組首頁（基於kh/OT/index.html）
12. ✅ `languages/lo/T4/index.html` - T4模組首頁（基於kh/T4/index.html）
13. ✅ 建立 `languages/lo/index.html` - 獨立頁面（基於kh/index.html）
14. ✅ 更新 `languages/index.html` - 加入寮國langMap配置

---

## 🔧 實施步驟詳解

### 步驟1：建立柬埔寨Sidebar（index_kh.html）

**來源檔案：** `languages/index_cn.html`

**修改內容：**
- 標題改為：`Bible 100 Steps Four Treasures - ភាសាខ្មែរ (Khmer)`
- 修改所有NT章節連結：
  ```html
  <!-- 從 -->
  <a href="cn/NT/chapters/chapter1.html" target="contentFrame">NT第一課...</a>
  <!-- 改為 -->
  <a href="kh/NT/chapters/kh_NT_chapter01.html" target="contentFrame">
    បទរៀន NT ១: ជំហាន ១-១៣ សមុទ្រហ្គាលីលេ - រ៉ូម<br>
    <small style="color: #666;">NT Lesson 1: Steps 1-13 Sea of Galilee - Rome</small>
  </a>
  ```
- 修改OT和T4章節連結（同樣模式）
- 修改附錄連結：`cn/NT/advance/appendix1.html` → `kh/NT/advance/kh_NT_appendix01.html`
- 保持所有CSS和JavaScript功能不變

---

### 步驟2：建立柬埔寨Landing Page（landP_kh.html）

**來源檔案：** `languages/landP_cn.html`

**修改內容：**
- 標題改為雙語：
  ```html
  <h1>📖 វេទិការៀនសូត្រព្រះគម្ពីរ - ភាសាខ្មែរ</h1>
  <p>Bible Learning Platform - Khmer</p>
  ```
- 內容採用柬/英並排顯示（使用bilingual-layout）
- 更新語言連結列表，加入柬埔寨和寮國

---

### 步驟3：建立柬埔寨NT首頁（kh/NT/index.html）

**來源檔案：** `languages/en/NT/index.html`

**修改內容：**
- 標題改為雙語：
  ```html
  <h1>
    <span style="color: #f39c12;">បទរៀន ១០០ ជំហាន ព្រះគម្ពីរសញ្ញាថ្មី</span><br>
    <small style="color: #007cba;">NT 100 Steps New Testament</small>
  </h1>
  ```
- 內容採用柬/英並排顯示
- 更新返回連結：`javascript:history.back()` → `../index.html`

---

### 步驟4：建立柬埔寨OT首頁（kh/OT/index.html）

**來源檔案：** `languages/en/OT/index.html`

**修改內容：**
- 標題改為雙語：
  ```html
  <h1>
    <span style="color: #f39c12;">បទរៀន ១០០ ជំហាន ព្រះគម្ពីរសញ្ញាចាស់</span><br>
    <small style="color: #3498db;">OT 100 Steps Old Testament</small>
  </h1>
  ```
- 內容採用柬/英並排顯示

---

### 步驟5：建立柬埔寨T4首頁（kh/T4/index.html）

**來源檔案：** `languages/en/T4/index.html`

**修改內容：**
- 標題改為雙語：
  ```html
  <h1>
    <span style="color: #f39c12;">បទរៀន ៤ តម្លៃនៃជំនឿ</span><br>
    <small style="color: #f39c12;">T4 Four Treasures of Faith</small>
  </h1>
  ```
- 內容採用柬/英並排顯示

---

### 步驟6：修正kh/index.html路徑

**檔案：** `languages/kh/index.html`

**修改內容：**
```javascript
// 從
function loadNTIndex() {
  loadContent('languages/kh/NT/index.html');
}

// 改為
function loadNTIndex() {
  loadContent('NT/index.html');
}
```

同樣修改 `loadOTIndex()` 和 `loadT4Index()`

---

### 步驟7：更新總INDEX langMap

**檔案：** `languages/index.html`

**修改內容：**
```javascript
var langMap = {
  // ... 現有配置 ...
  kh: { page: 'index_kh.html', first: 'landP_kh.html' },
  lo: { page: 'index_lo.html', first: 'landP_lo.html' }
};
```

---

### 步驟8-12：建立寮國對應檔案

**策略：** 複製柬埔寨檔案，修改語言代碼和文字

**修改對照表：**
- `kh` → `lo`
- `ភាសាខ្មែរ` → `ພາສາລາວ`
- `បទរៀន` → `ບົດຮຽນ`
- `ជំហាន` → `ຂັ້ນຕອນ`
- `ព្រះគម្ពីរសញ្ញាថ្មី` → `ພຣະຄຳພີສັນຍາໃໝ່`
- `ព្រះគម្ពីរសញ្ញាចាស់` → `ພຣະຄຳພີສັນຍາເກົ່າ`
- `#f39c12` (橙色) → `#9b59b6` (紫色)

---

## 📊 雙語標題參考

### 柬埔寨語（已準備）
- NT: `បទរៀន ១០០ ជំហាន ព្រះគម្ពីរសញ្ញាថ្មី`
- OT: `បទរៀន ១០០ ជំហាន ព្រះគម្ពីរសញ្ញាចាស់`
- T4: `បទរៀន ៤ តម្លៃនៃជំនឿ`

### 寮國語（需要翻譯）
- NT: `ບົດຮຽນ 100 ຂັ້ນຕອນ ພຣະຄຳພີສັນຍາໃໝ່`
- OT: `ບົດຮຽນ 100 ຂັ້ນຕອນ ພຣະຄຳພີສັນຍາເກົ່າ`
- T4: `ບົດຮຽນ 4 ສິ່ງມີຄ່າຂອງຄວາມເຊື່ອ`

---

## ⏱️ 時間估算

| 階段 | 檔案數 | 預估時間 |
|------|--------|---------|
| 柬埔寨7個檔案 | 7 | 25-35分鐘 |
| 寮國7個檔案 | 7 | 20-30分鐘 |
| **總計** | **14** | **45-65分鐘** |

**Usage Limit評估：**
- 已用：45%
- 剩餘：55%
- 預估使用：約8-12%
- **結論：✅ 足夠完成**

---

## ✅ 完成後預期結果

1. 從總INDEX點擊「ភាសាខ្មែរ (KH)」按鈕：
   - Sidebar顯示柬埔寨語導航
   - Content顯示柬埔寨語歡迎頁
   - 所有連結正常運作

2. 從總INDEX點擊「ພາສາລາວ (LO)」按鈕：
   - Sidebar顯示寮國語導航
   - Content顯示寮國語歡迎頁
   - 所有連結正常運作

3. 點擊NT/OT/T4模組：
   - 顯示對應的模組首頁（雙語標題）
   - 可以正常導航到章節檔案

---

## 📝 注意事項

1. **檔案編碼：** 所有檔案必須使用UTF-8編碼
2. **路徑規則：** 使用相對路徑，確保file:///協議下正常運作
3. **雙語顯示：** 標題採用柬/英、寮/英並排顯示
4. **模板框架：** 內容先建立框架，完整翻譯後續完成
5. **向後兼容：** 保持與現有語言模組一致的結構

---

## 🚀 執行順序建議

1. 先完成柬埔寨7個檔案（確保一個語言完整運作）
2. 再完成寮國7個檔案（複製並修改）
3. 最後測試總INDEX的語言切換功能

---

**計劃建立日期：** 2025-01-XX  
**狀態：** 待確認執行
