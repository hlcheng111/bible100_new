# Bible100 本地使用

## PC 試用（預設：不用 localhost）

**雙擊** [`index.html`](index.html) 或 [`開啟 Bible100.bat`](開啟%20Bible100.bat)。

詳見 [`README_PC_TRIAL.md`](README_PC_TRIAL.md)。

## 可選：本機 HTTP（進階）

僅在雙擊 index 時某模組無法載入，再執行：

```text
Serve-Bible100-local.cmd
```

## 其他啟動腳本

已移至 `scripts/launchers/`（Python `http.server`、舊端口等）。主線僅保留根目錄 `Serve-Bible100-local.cmd`。

## 清理前備份

```powershell
.\scripts\backup_pre_cleanup.ps1
```

Git 標記：`pre-cleanup-2026-05-21`

## 導覽連結檢查

```powershell
python scripts/check_phase_tool_and_nav_links.py
```

## 本地語言精簡

見 `config/local-languages.json`（預設僅啟用 cn、en）。
