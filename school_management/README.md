# 學校管理系統 · 即點即用

## 如何開啟

- **方式一**：從主頁 `../index.html` 點「學校管理」
- **方式二**：直接開啟 `school_management/index.html`
- **方式三**：`python -m http.server 8080` 後開啟 `http://127.0.0.1:8080/school_management/`

## 資料夾說明

| 資料夾 | 用途 |
|--------|------|
| **manage/** | 管理後台：學生、課程、教師、班級、成績、財務、溝通、活動、系統、跨模組整合 |
| **portal/** | 學員入口：我的課程、繳費、成績、選科報名；功能說明、ER 圖 |
| **js/** | school-master-database.js（統一資料源） |

## 首次使用

1. 開啟後點「載入示範資料」建立 200 學生、25 教師、30 課程等
2. 點左側欄或儀表板快速操作進入各功能
3. 學員入口：選學員身份 → 查看課程、繳費、成績

## 上傳雲端時需一併包含

本模組依賴上層 `bible100_new` 的共用資源，上傳時請一併包含：

| 路徑 | 用途 |
|------|------|
| `../css/sidebar_shared.css` | 側欄共用樣式 |
| `../js/sidebar_behavior.js` | 側欄行為 |
| `../js/module_navigation.js` | 模組導航 |
| `../js/global-tools.js` | 全站工具（翻譯、收藏等） |

建議上傳整個 `bible100_new` 資料夾，或至少包含 `school_management/`、`css/`、`js/`。
