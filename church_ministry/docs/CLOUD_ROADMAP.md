# 後續工程計劃（總覽）

供牧者／行政了解「還要做什麼」；細節由工程師依優先順序實作。

---

## 已完成（本機架構）

- `church_data_bridge.js`：會友、探訪、教育、志工、財務、門訓、學校摘要等 **寫入 `churchMasterDatabase` 切片**。
- `cloud_config.js` + `cloud_api.js` + **`church_auth.js`**：**上雲開關、fetch、RBAC**（`index_v5`／教會事工儀表板預載）。
- **CRM-5 demo**：`scripts/church_api_local_server.js`、`church_sheets_ssot.js`、`load_crm_maturity_seed.html`、`ai-pastoral-draft.html`（見 `CRM-5_CLOUD_AUTH_SHEETS.md`）。
- 資料模型文件：`MEMBER_DATA_MODEL.md`、`VISITATION_DATA_MODEL.md`、`CHURCH_MINISTRY_HUB_AUDIT.md`、`CRM_RELEASE_NOTES_2026-05.md`。

---

## 短期（接 API 前可並行）

1. **匯出／匯入**：各模組「匯出 JSON」按鈕統一格式，作為備份與種子資料。
2. **研究報表頁**：改為只讀 `ChurchDataBridge`，不直接讀散落 localStorage 鍵。
3. **錯誤提示**：`localStorage` 滿了或禁用時的友善提示。

---

## 中期（正式上雲）

1. **後端 API**：會友、探訪、教育、奉獻等 REST 或 GraphQL，與現有 JSON 結構對齊。
2. **`church_data_bridge.js`**：依 `USE_API` 分支，`fetch` + 快取／離線策略（可選）。
3. **登入與權限**：角色（牧者／行政／小組長）與資料範圍。
4. **HTTPS、備份、稽核**。

---

## 長期

- 與 **學校管理**、**門訓動力站**、**AI 工具** 的單一帳號或 SSO（若需要）。
- 行動版／PWA（可選）。

---

*本文件隨專案演進更新。*
