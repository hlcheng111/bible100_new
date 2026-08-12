# Bible100 搜尋索引（目錄級）

**Canonical（可進 Git／上云）**：`config/search/`

| 檔案 | 用途 |
|------|------|
| `nav_index.json` | 站內入口／樞紐 |
| `curriculum_cn.json` | 中文教材課名（OT/NT/T4）＋門訓系列 |
| `curriculum_en.json` | 英文雛形（可擴充課名） |

`data/search/` 為相容副本（本機習慣路徑）；改索引請跑重建腳本兩邊同步。

**不是**經文全文，也不是全站 HTML 正文。經文請用 `bible_study/search_reader.html`。

## 雙通道

- **HTTP／上云**：`site_search.js` 優先 fetch `config/search/*.json`。
- **file://**：fetch 常失敗 → 用 `js/search_indexes_embedded.js`。

重建：

```powershell
node scripts/build_search_indexes.js
```

結果頁：`nav_hub/site_search_hub.html`
