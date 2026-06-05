# Bible100 V2.2 Cursor 規則與遷移入口

本專案包含五份 Cursor 規則檔：

- v1：舊主線（localStorage canonical）
- v2：新主線（Sheets SSOT + API 契約）
- v3：未來全雲端（預留）
- M-001～M-010：遷移藍圖
- localStorage ↔ Sheets：資料映射

Cursor 不會自動套用任何規則；需由使用者在 Cursor → Rules 中手動勾選。
勾選後 Cursor 即可理解對應模式、遷移步驟與資料映射。

> 本輪已將 v2 preset 設為 `alwaysApply: true`，其餘規則維持手動啟用。

## 上線文件

- `GO_LIVE_CHECKLIST.md`：最後 10%～15% 的部署/灰度/監控/回滾 runbook。
- `MODULE_TRANSFORMATION_SIGNOFF.md`：站上模組轉變/新增功能的打勾與簽核表。
- `CLOUD_DEPLOY_STRUCTURE.md`：上雲打包白名單與部署結構建議。
