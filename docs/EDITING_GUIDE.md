# Bible100 編輯指南（小白可維護）

**對象**：非技術背景的內容編輯者

---

## 一、可安全編輯的檔案

| 類型 | 路徑 | 說明 |
|------|------|------|
| 多語言內容 | `languages/{lang}/` | OT、NT、T4 章節 |
| 設定 | `config/*.json` | 模組、路徑、語言設定 |
| 培訓教材 | `training/`, `disciple_dynamics/` | HTML 內容頁 |
| 註釋/詞典 | `data/` 內 JSON | 需注意格式 |

---

## 二、編輯注意事項

1. **備份**：重要變更前執行 `.\scripts\backup_data.ps1`（備份 data/）
2. **編碼**：使用 UTF-8 儲存
3. **JSON**：勿刪除逗號、括號，保持格式正確
4. **連結**：內部連結用相對路徑，如 `../bible_study/xxx.html`

---

## 三、備份與還原

- **資料備份**：`.\scripts\backup_data.ps1` → 備份至 `backups/data_YYYYMMDD_HHMMSS/`
- **全專案備份**：`.\scripts\backup_full_project.ps1` → 產生 `bible100_new_backup_YYYYMMDD.zip`（排除 backups/）

---

## 四、多語言對應

- 各語言獨立目錄：`languages/cn/`, `languages/en/` 等
- 保持結構一致：`OT/`, `NT/`, `T4/` 下章節對應
