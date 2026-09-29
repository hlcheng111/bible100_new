# BS-H2 · OT/NT 66 卷 reader 深鏈

> **日期**：2026-07-26  
> **主閱讀器**：`bible_study/reader.html?book={1-66}&chapter={n}`

## SSOT

`bible_study/data/bible_books_66.json` — 66 卷 · id · 中文名 · 章數 · testament · category

## 批量腳本（冪等）

```powershell
$env:PYTHONIOENCODING="utf-8"
python scripts/wire_ot_nt_to_reader.py
```

標記：`<!-- BS-H2-READER-WIRED -->`（已注入則跳過）

## 覆蓋範圍

| 類型 | 數量 | 內容 |
|------|------|------|
| 書卷 landing | 66 | 章節格 + 第1章 reader／釋經／對照／搜尋 |
| 分類 index | 10 | 本類各卷 reader 第1章捷徑 |
| 約/新約根 index | 2 | 站內 reader 總入口 |
| **合計** | **78** | 實際更新 76 檔（首次部分執行已含 2 檔） |

- 使徒行傳 catalog category 為 `nt_history`（與 OT `history` 分開）；檔案仍在 `NT/history/`

- **經文**：`reader.html?book={id}&chapter={n}`（id 為 1–66 數字，對齊 `reader.html` BOOKS）
- **釋經**：`comprehensive_exegesis_reader.html?book={中文名}&chapter=1`
- 詩篇等 >150 章：章節按鈕上限 150，提示用 reader 書卷選單

## 測試

```powershell
python tests/test_ot_nt_reader_wire.py
```

## 驗收 URL（HTTP）

- 創世記：`http://127.0.0.1:8765/bible_study/OT/law/創世記.html` → 點章節「1」
- 馬太福音：`http://127.0.0.1:8765/bible_study/NT/gospels/馬太福音.html`
- 律法總覽：`http://127.0.0.1:8765/bible_study/OT/law/index.html`（創世記章節格→reader）
