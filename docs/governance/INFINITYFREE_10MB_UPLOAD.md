# InfinityFree / lovestoblog: single file max 10MB (auto-deleted if larger)

## Problem

`bible_reader.db` is ~41MB. FileZilla may report **transfer success**, but the host **deletes** files over 10MB. Remote folder looks **empty**.

## Solution: split upload

From repo root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\split_bible_db_for_cloud.ps1
```

Upload to **`htdocs/bible_app/app/assets/bible/`**:

- `bible_reader.db.manifest.json`
- `bible_reader.db.part001`
- `bible_reader.db.part002`
- … (all parts, each under 9MB)

Do **not** rely on a single 41MB `bible_reader.db` on cloud.

The shell loads parts automatically (`bible_reader_core.js`).

## Local full Bible (not cloud)

Double-click:

- `run_bible_track_local.bat` (repo root), or
- `bible_app/打開聖經跑道.bat`

Opens **http://127.0.0.1:3000/bible_app/** — requires Node/npx (bat installs serve).

`127.0.0.1 refused` = bat not running or port blocked.

## Also upload for Parallel mode

`data/bibles/clean/*.json` (each file must be <10MB; KJV ~9.4MB OK)

**Linux 主機檔名大小寫**：FTP 上可能是 `NIV.json`（大寫），小寫 `niv.json` 會 404。程式已優先試 `NIV.json`。

## InfinityFree 反爬（877 字節 HTML）

直接開大檔 URL 或 curl/HEAD 時，主機可能回 **~877 字節的 HTML**（含 `aes.js`、`__test` cookie），**不是** 404，也**不是** 你的程式把 part001/wasm 轉去 niv.json。

- 瀏覽器：先開 `index_v5.html`，通過 JS 驗證後再 fetch 經文。
- 驗收：DevTools → Network → `NIV.json` 應 **Content-Type: application/json**、大小 **~6MB**；`part001` 應 **~9MB 二進位**；`sql-wasm.wasm` 應 **~660KB**。
- 若 Content-Type 是 `text/html` 且只有 ~900 字節 → 仍是反爬頁，重新從首頁進入或 Ctrl+F5。

## FTP 路徑（常見錯誤）

正確：`/htdocs/data/bibles/clean/NIV.json`  
錯誤：`/htdocs/htdocs/data/...`（多一層 htdocs）
