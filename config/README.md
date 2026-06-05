# config/

全站與建置相關之**輕量設定**（JSON／排除清單）。**不可刪除整夾**：多個模組與腳本假設此路徑存在。

| 檔案 | 用途 |
|------|------|
| `modules.json` | 模組清單（`id`、`name`、`path`、`sidebar`）供總站／工具載入。會眾入口已併入路徑 `church_ministry/congregation/…`。 |
| `paths.json` | 如 `help`、`languages`、`data` 等根相對路徑別名。 |
| `languages.json` | 語系相關設定（與 `languages/` 大模組搭配使用）。 |
| `system.json` | 系統層級開關或版本資訊（依專案實際內容為準）。 |
| `cloud-upload-exclude.txt` | 上雲／打包時排除清單。 |

變更任一檔案後，建議跑 `tests/run-all-tests.ps1` 或相關連結檢查腳本。
