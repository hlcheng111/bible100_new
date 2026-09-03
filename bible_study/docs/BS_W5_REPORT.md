# BS-W5 完成報告

> **日期**：2026-07-26  
> **波次**：W5（全站 W3 掃描 · 六語對齊 · FTS · reader 收斂）

## 1. bible_reader_final 收斂

| 項目 | 說明 |
|------|------|
| 主閱讀器 | `bible_study/reader.html` |
| 舊檔備份 | `data/bibles/bible_reader_final.legacy.html`（原 68k 行單檔） |
| Redirect | `data/bibles/bible_reader_final.html` → 自動轉 `reader.html`（保留 book/chapter/version 參數映射） |
| 已更新連結 | `bible_study/sidebar`、釋經／搜尋／外站 reader、`versions/*`、`nav_hub/*`、`site_map.js`、`languages/vi/.../bible_comparison.html` |

## 2. 六語 ↔ languages/ 對齊

**SSOT**：`bible_study/js/bible_version_registry.js` → `languagesHub[]`

| code | Hub | 站內譯本 key |
|------|-----|-------------|
| cn | `languages/index_cn.html` | faith, cuv, cuvr, luzhen |
| en | `languages/index_en.html` | kjv, niv |
| vi | `languages/index_vi.html` | vi1934 |
| id | `languages/index_id.html` | id_ayt |
| ch | `languages/index_ch.html` | — |
| ad | `languages/index_ad.html` | — |

**UI**：`_landing/versions.html` 頂部「六語教材」列 + 多語卡片站內 vi1934/id_ayt 對照入口。

**API**：`BS_getLanguagesHub(code)` · `BS_getHubForBibleKey(bibleKey)`

## 3. FTS-lite

| 檔案 | 職責 |
|------|------|
| `bible_study/js/bible_fts.js` | 記憶體倒排索引；`BibleEngine.searchBibleFts` |
| `search_reader.html` | 優先 FTS，fallback 線性 `searchBible` |
| `scripts/build_bible_fts_index.py` | 可選離線 manifest → `bible_study/data/fts_manifest.json` |

## 4. 全站 W3 行為掃描

**測試**：`tests/test_w3_navigation_scan.py`

掃描側欄（10 個）：禁止 `href="#"`、`javascript:void(0)`、`data-edu-cross`、inline `bible100ShellNav`、主線 `bible_reader_final` 連結。

**硬門檻**：`bible_study/`、`church_ministry/sidebar_c_*` 零 violation。

## 5. 測試命令

```powershell
python tests/test_bible_study_data_registry.py
python tests/test_w3_navigation_scan.py
python tests/test_unified_navigation.py
python scripts/build_bible_fts_index.py
```

## 6. 待實機（非 W5 阻塞）

- 越/印尼 `data/bibles/clean/` 實機 parallel
- 部分模組側欄（如 `nav_hub`）尚未全面 `data-b100-nav` 化（掃描僅警告，不阻塞 BS 主線）
