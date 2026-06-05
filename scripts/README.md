# 聖經研讀中心 - 資料導出腳本

## export_clean_json.py

從現有 JSON（或 .db）重新導出為**純淨標準格式**，解決 `JSON at position 1` 解析錯誤。

### 輸出格式

**聖經經文** (`data/bibles/clean/*.json`):
```json
{"version": "KJV", "data": [{"b": 1, "c": 1, "v": 1, "t": "In the beginning..."}]}
```

**綜合解讀** (`data/cj/clean/Comprehensive.json`):
```json
{"source": "Comprehensive", "items": [{"book": 1, "chapter": 1, "title": "", "content": "..."}]}
```

### 執行方式

```bash
cd bible100_new
python scripts/export_clean_json.py
```

### 注意

- 若 `和合本.json` 含無效控制字元導致導出失敗，可暫時使用 `和合本修訂版` 替代
- 輸出為嚴格 UTF-8，無 BOM，無 JS 包裝

---

## site_full_audit.py

對 `_inventory_html_exclude_languages.txt` 內 **822** 筆路徑做存在性、`title`／`h1`／`charset`、相對連結是否存在等掃描；產出 `docs/reports/SITE_FULL_AUDIT_LATEST.md` 與 CSV。詳見 `docs/全站整全改良計劃書.md`。

```bash
cd bible100_new
python scripts/site_full_audit.py
```
