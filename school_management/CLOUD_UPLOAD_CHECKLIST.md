# 雲端上傳檢查清單 · bible100.lovestoblog.com

## 檢查結果摘要

| 項目 | 雲端狀態 | 說明 |
|------|----------|------|
| school_management 路徑 | ✅ 正確 | `https://bible100.lovestoblog.com/school_management/` |
| school-master-database.js | ⚠️ **舊版** | 雲端缺少「首次自動載入示範」邏輯 |
| css/sidebar_shared.css | ✅ 存在 | 根目錄 |
| js/module_navigation.js | ✅ 存在 | 根目錄 |
| 主頁側欄 | ⚠️ 載入失敗 | 可能路徑或權限問題 |

---

## 必須重新上傳的檔案

### 1. 學校管理核心（含自動載入修正）

```
school_management/js/school-master-database.js
```

**原因**：雲端目前為舊版，缺少 `initializeDefaultStructure()` 結尾的自動載入邏輯。  
本地已加入：

```javascript
// 首次進入時自動載入示範資料（雲端網站一開啟就有預設資料）
var needSeed = (!this.data.students || !this.data.students.length) && ...;
if (needSeed && typeof this.ensureSeedFull === 'function') this.ensureSeedFull();
```

### 2. 建議一併確認的檔案結構

```
bible100.lovestoblog.com/
├── index.html
├── css/
│   └── sidebar_shared.css
├── js/
│   ├── sidebar_behavior.js
│   ├── module_navigation.js
│   └── global-tools.js
└── school_management/
    ├── index.html
    ├── dashboard.html
    ├── sidebar.html
    ├── load_school_seed.html
    ├── js/
    │   └── school-master-database.js   ← 必須為最新版
    ├── manage/
    ├── portal/
    └── ...
```

---

## 上傳後驗證步驟

1. **清除瀏覽器快取**（重要）
   - Chrome: F12 → 右鍵重新整理 → 「清除快取並強制重新載入」
   - 或使用無痕視窗測試

2. **直接開啟學校管理**
   - 前往：`https://bible100.lovestoblog.com/school_management/`
   - 或從主頁點「學校管理 School Mgmt」

3. **檢查儀表板數字**
   - 應顯示：200 學生、25 教師、30 課程、20 班級、約 75% 成績率
   - 若仍為 0，手動點「🔄 載入示範」→「載入示範資料」

4. **開發者工具檢查（F12）**
   - Console 應有：`✅ 完整示範資料已載入（學生 200、教師 25、課程 30）`
   - 若有紅色錯誤，請截圖回報

---

## 若仍顯示 0 的可能原因

| 原因 | 處理方式 |
|------|----------|
| 瀏覽器快取 | 強制重新整理、無痕視窗 |
| localStorage 被阻擋 | 檢查瀏覽器設定、無痕模式 |
| 路徑錯誤 | 確認 `school_management/js/school-master-database.js` 可正常載入 |
| 主機限制 | 部分免費主機可能限制 localStorage，需改用付費或自架 |

---

## 快速修復：只上傳一個檔案

若只想快速修正，**只需重新上傳**：

```
本機：bible100_new/school_management/js/school-master-database.js
雲端：school_management/js/school-master-database.js
```

上傳後清除快取再測試。
