# 模組入口 × 越印經文 — 實施順序

**對外唯一網址（上云／本機一致）：** `https://bible100.xxx/bible_app/`  
**實作根目錄：** `bible_app/shell/`（用戶不必記）  
**讀後 AI 預設：** `shell/pages/supply/prompt.html`（不依賴 `ai_tools`）

---

## P0 — 模組入口根治（先做）

| # | 任務 | 檔案 | 驗收 |
|---|------|------|------|
| P0-1 | 對外入口改相對轉址 `shell/index.html` | `bible_app/index.html` | 開 `/bible_app/` 一次到 shell |
| P0-2 | serve 轉址：`/bible_app` → `shell/index.html` | `serve.json` | curl 302 鏈無迴圈 |
| P0-3 | bat/VBS 開 `/bible_app/`（非 shell 路徑） | `打開聖經跑道.bat` | 與上云 URL 一致 |
| P0-4 | 讀後工具預設僅 supply；Hub 須 probe 成功 | `bridge.js`, `read-done.html` | 無 `/ai_tools/` 404 |
| P0-5 | 上云包清單：shell + `app/assets/bible/bible_reader.db` | `scripts/package_shell_deploy.ps1` | 單資料夾可 FTP |

**不屬 P0：** 金句越印標題、Electron、每日重啟 bat。

---

## P0.5 — 四語經文煙霧（緊接 P0，同一 deploy 包）

| # | 任務 | 驗收 |
|---|------|------|
| P0.5-1 | DB 含 `cuv_trust` `kjv` `vi_1934` `id_ayt` | `python scripts/check_bible_db_versions.py` |
| P0.5-2 | 四語各讀一章（Network: db 200, >10MB） | `python tests/test_shell_locale_smoke.py` |
| P0.5-3 | 無 DB 時頂欄/讀經頁顯示示範警告，不假裝全庫 | 見 `br-db-alert` |

**說明：** 越印**經文**已在 `bible_reader_core.js`；P0.5 是「DB 真載入 + 四語可查」驗收，不是重寫引擎。

---

## P1 — 跑道內容越印（與 P0 可並行，不取代 P0）

| # | 任務 | 檔案 | 狀態 |
|---|------|------|------|
| P1-1 | 金句 40 筆補 `refVi` `refId` `tagVi` `tagId` | `shell/data/golden_verses_100.json`, `data_bundle.js` | ✅ `update_golden_i18n.py` |
| P1-2 | `track_golden.js` 靜態 UI 四語 | `track_golden.js` | ✅ |
| P1-3 | `track_theme.js` / `read-done` 文案四語 | 各頁 | ✅ |
| P1-4 | 金句卡大按鈕「開始讀」 | `track_golden.js`, `track-creative.css` | ✅ `btn-track` |
| P1-5 | DB 未就緒時金句卡灰顯或提示 | `track_golden.js` + 殼 probe | ⏳ 可選（P0.5 已有 `br-db-alert`） |

**P1 驗收：**

```powershell
python tests\test_golden_i18n.py
python tests\test_shell_standalone.py
```

---

## P2 — 上云與主站銜接（P0 完成後）

- Nginx/Netlify 規則對齊 `serve.json`（`cleanUrls: false`）
- 主站 `bible100` 只鏈 `/bible_app/`，不鏈 `/shell/`
- `ai_tools` 僅作進階補給（probe 成功才顯示）

---

## 依賴關係

```
P0 入口 + DB 打包
  └─► P0.5 四語經文驗收（vi/id 與 zh/en 同一條件）
  └─► P1 跑道 UI/金句 metadata（可並行開發）
  └─► P2 上云設定
```

**禁止：** 只做 P1 不做 P0 → 上云後四語仍示範模式，用戶直接離開。

---

## 本機一鍵驗收（P0 + P0.5）

```powershell
cd bible_app
..\打開聖經跑道.bat
python tests\test_shell_standalone.py
python tests\test_shell_url_smoke.py
python tests\test_shell_locale_smoke.py
python scripts\check_bible_db_versions.py
```

瀏覽器只開：`http://127.0.0.1:3000/bible_app/`
