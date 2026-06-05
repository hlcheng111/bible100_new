# Web App 部署與權限策略（V2.2）

## 部署分層

1. **dev**：測試試算簿，僅開發者可執行。
2. **staging**：預發布試算簿，供同工驗收。
3. **prod**：正式試算簿，限核可帳號部署。

## Script Properties（必要）

| Key | 建議值 | 說明 |
|-----|--------|------|
| `SSOT_SPREADSHEET_ID` | `<sheet-id>` | SSOT 試算簿 ID |
| `WRITE_LAYER_ENABLED` | `false`（預設） | 寫入層總開關 |
| `LOG_WRITE_ENABLED` | `true` | 允許寫入 `ministry_logs` |

## 存取策略

- `doGet`：可公開（若資料屬公開白名單）或限制組織內。
- `doPost`：建議「僅組織帳戶 + token 白名單 + action 白名單」。
- 任何含 Member/Registration 的寫入 action 禁止匿名對外開放。

## 安全閘

1. `WRITE_LAYER_ENABLED=false` 時，所有 `post*` action 回 `WRITE_DISABLED`。
2. `postFormWebhook` 必經 `validateRegistrationPayload_` + 冪等檢查。
3. `postMember` 僅允許白名單欄位（`email/full_name/roles/lang`）。
4. `postSmartMinistryExport` 阻擋 raw 與個人識別欄位。
5. 所有錯誤走 `safeLogEvent_` 並自動遮罩 email。

## 上線前檢查

- `?action=getSchemaStatus` 全部 `ok=true`
- `?action=getWriteLayerReadiness` 顯示期望旗標
- `?action=getMinistryLogs&module=api&level=error`
- doPost 測試：關閉/開啟 `WRITE_LAYER_ENABLED` 兩種情境都驗證
