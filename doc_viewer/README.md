# 文檔檢視器 Doc Viewer

通用書本／文檔檢視器，支援 Word 匯出的 HTML、三層 TOC sidebar、詩歌索引（智慧分類）。

## 目前內容

### hymnology_practical（實用聖詩學）

- **路徑**：`doc_viewer/hymnology_practical/`
- **主檔**：`hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.htm`
- **圖片**：`hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.files/`（約 3900+ 個圖片檔）
- **章節 TOC**：22 筆（甲聖詩內涵篇～丙詩歌分類舉例與各種索引篇）
- **詩歌索引**：約 3550+ 筆（區段／章節／作者／聖詩／參考，可搜尋）
- **狀態**：✅ 已完整

## 結構

```
doc_viewer/
├── README.md
├── index.html          導向 viewer.html
├── viewer.html         檢視器（sidebar + iframe）
├── scripts/
│   ├── validate-anchors.js  提取 HTML 有效錨點 → valid-anchors.json
│   ├── build-toc.js         解析 TOC → toc.json、toc-embedded.js
│   └── build-hymn-index.js  詩歌索引分類 → hymn-index.json、hymn-index-embedded.js
└── hymnology_practical/
    ├── hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.htm
    ├── hyH00《 實用聖詩學 》(鄭翰龍)  V.11  (2023) v2.files/
    ├── valid-anchors.json
    ├── toc.json
    ├── toc-embedded.js
    ├── hymn-index.json
    └── hymn-index-embedded.js
```

## 使用方式

1. **以 HTTP 伺服器開啟**（避免 file:// 跨域限制）
   - 例：`python -m http.server 8080`（在 bible100_new 目錄）
2. **開啟檢視器**：`http://localhost:8080/doc_viewer/viewer.html?book=hymnology_practical`
3. **重新產生資料**（依序執行）：
   ```bash
   cd doc_viewer
   node scripts/build-toc-from-headings.js
   node scripts/build-hymn-index.js
   node scripts/build-standalone.js
   ```
   - `build-toc-from-headings.js`：從 HTML 標題 (h1-h6) 解析 6 層 TOC，使用實際 bookmark
   - `viewer-standalone.html`：內嵌完整資料，供 file:// 直接開啟
