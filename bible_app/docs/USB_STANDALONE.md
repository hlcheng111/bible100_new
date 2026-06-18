# USB / 離線發佈（給打包同工）

## 小白使用者

**只需雙擊** `bible_app/打開聖經跑道.bat`（或 `START-WEB.cmd`）。

- 自動檢查經庫、啟動本機服務、開啟瀏覽器  
- **勿**直接雙擊 `shell/index.html`（僅預覽模式）

## 打包 USB 前（技術同工做一次）

1. 建完整四語經庫（需 `data/bibles/clean/` 或網路下載）：
   ```powershell
   python bible_app\scripts\fetch_helloao_bible.py
   python bible_app\scripts\json_to_sqlite.py
   python bible_app\scripts\import_helloao_to_db.py
   ```
2. 確認 `bible_app/app/assets/bible/bible_reader.db` ≥ 10MB  
3. **建議複製備份**（離線還原用）：
   ```powershell
   copy bible_app\app\assets\bible\bible_reader.db bible_app\app\assets\bible\bible_reader_full.bak
   ```
4. 重建 shell 資料包：
   ```powershell
   python bible_app\scripts\build_data_bundle.py
   ```

## 服務根目錄

`打開聖經跑道.bat` 在 **bible100_new 根目錄** 啟動 `serve`，入口：

`http://127.0.0.1:3000/bible_app/shell/index.html`

這樣 `ai_tools/` 與跑道同域，讀後 AI 連結不斷鏈。

## 完全斷網

- 經庫：靠 `bible_reader.db` 或 `.bak` 還原  
- AI：使用 `shell/pages/supply/prompt.html`（純前端 Prompt，無 API）
