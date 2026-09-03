# 聖經跑道：云站版與本機版

## 產品準則

聖經跑道以 **云站版** 為準：使用者打開 `https://.../bible_app/` 後，應直接可讀四語經文，不需要知道 `file://`、`.bat`、`.vbs` 或資料庫位置。

本機版只用於開發、USB/離線預覽、或上云前驗收；它必須盡量模擬云站路徑。

## 三種 runtime

| runtime | 判斷 | 用途 |
|---|---|---|
| `cloud` | 非 localhost 的 `http/https` | 正式云站與公開預覽，使用者預設入口 |
| `local-http` | `localhost` / `127.0.0.1` | 本機 HTTP 預覽，需可讀完整 DB |
| `file-preview` | `file://` | 直接開 HTML 的精簡預覽，不作正式驗收 |

實作入口：`shell/js/runtime_mode.js`，頁面不要再各自硬判 `file://` 或主機名。

## 上云底線

1. 不可只上傳 `shell/`。
2. 必須上傳 `index.html`、`shell/`、`app/assets/bible/bible_reader.db`。
3. `bible_reader.db` 必須包含 `cuv_trust`、`kjv`、`vi_1934`、`id_ayt` 四個版本。
4. 云站版失敗提示不可要求使用者雙擊本機檔案。
5. 本機啟動說明只可出現在 `file-preview` 或 `local-http` 情境。
6. `sql.js` 必須使用 `shell/vendor/sqljs/` 內的本地檔案，不依賴外部 CDN。

## sql.js vendor

讀取 SQLite 經文庫需要：

- `shell/vendor/sqljs/sql-wasm.js`
- `shell/vendor/sqljs/sql-wasm.wasm`

更新 `sql.js` 版本時，先用 npm 更新套件，再把 `node_modules/sql.js/dist/` 中的上述兩個檔案同步到 `shell/vendor/sqljs/`。`scripts/package_shell_deploy.ps1` 會檢查這兩個檔案存在且大小合理，缺一不可上云。

## 部署檢查報告

`scripts/package_shell_deploy.ps1` 會在 `dist_deploy/deploy_check_report.txt` 寫出檢查結果。

若部署包產生失敗，先讀這份報告，再修正對應項目。常見原因：

- 缺少 `bible_reader.db` 或經文庫過小。
- 經文庫缺少四語版本。
- 缺少本地 `sql.js` vendor 檔。
- 發布包內出現本機啟動提示。

## 驗收

上云前：

```powershell
python scripts/check_bible_db_versions.py
powershell -ExecutionPolicy Bypass -File scripts/package_shell_deploy.ps1
```

上云後：

- `https://.../bible_app/` 可開啟。
- `https://.../bible_app/app/assets/bible/bible_reader.db` 可讀且大於 10MB。
- 六十六卷中任選一章，繁中、英文、越文、印尼文都可顯示。
- 云站頁面不得出現 `bat`、`vbs`、`file://` 作為使用者操作指示。
