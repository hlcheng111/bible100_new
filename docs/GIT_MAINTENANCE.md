# Git 維護（Phase 5）

## Git LFS（可選）

大檔（`.db`、`.pdf`、`.mp4`）已列於根目錄 `.gitattributes`。首次啟用：

```powershell
git lfs install
git lfs track
```

既有歷史不會自動縮小；新 commit 的大檔會走 LFS。

## 本機清理標記

```text
git tag -l pre-cleanup*
# pre-cleanup-2026-05-21
```

## 壓縮本機倉庫（可選）

```powershell
git gc --prune=now
```

執行前請確認無未推送的重要分支；同事若依賴完整歷史，請先溝通。

## 忽略項

見根目錄 `.gitignore`：`backups/`、`node_modules/`、`hymn_management/dist/`、`*.mht` 等。
