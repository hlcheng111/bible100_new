# Bible100 V2.2 GO LIVE CHECKLIST

> 版本：v1.0  
> 適用範圍：`bible100_new` v2（Sheets SSOT + Apps Script Web App）  
> 目標：將最後 10%～15% 的上線前營運工程標準化（可執行、可回滾、可審計）

---

## 0) 角色與責任（RACI）

| 項目 | 角色 | 責任 |
| ------ | ------ | ------ |
| 技術負責（TL） | 你/指定工程師 | 批准開關啟用、回滾決策 |
| 部署執行（DevOps） | 工程同工 | 部署 Web App、設定 Script Properties |
| 業務驗收（UAT Owner） | 事工/行政同工 | 驗收導覽、課程、Q&A、KPI |
| 資料保護（Data Guard） | 指定負責人 | 核對 PII、raw 問卷不上雲 |
| 監控值班（On-call） | 輪值同工 | 1～2 週追蹤 logs 與錯誤率 |

---

## 1) 上線前 Gate（必須全綠）

### 1.1 規則與模式

- [ ] `v2` preset 啟用（`.cursor/rules/bible100-v2-preset-v2-sheets-ssot.mdc`）
- [ ] `WRITE_LAYER_ENABLED=false`（預設關閉）
- [ ] `LOG_WRITE_ENABLED=true`
- [ ] 確認 v1/v3 未誤啟（避免模式混淆）

### 1.2 SSOT 表頭與 schema

- [ ] 正式試算簿已建立 17 張分頁
- [ ] 表頭貼入並與 `docs/v2_2/SSOT_sheet_headers_v2_2.md` 一致
- [ ] `?action=getSchemaStatus` 全部 `ok=true`
- [ ] `?action=getBootstrapReadiness` 無缺欄/缺表

### 1.3 API 讀取層驗收（正式環境）

- [ ] `getCourseList`
- [ ] `getQnaList`（含 `format=html`）
- [ ] `getBibleVersions`
- [ ] `getHymnList`
- [ ] `getNavigationMap`
- [ ] `getAiToolsConfig`
- [ ] `getPlanningKpi`
- [ ] `getMinistryLogs`
- [ ] `getWriteLayerReadiness`

成功標準：

- [ ] 回傳信封皆符合 `{ ok, action, data, meta, error }`
- [ ] 無未授權欄位外洩（特別是 Member/Registration）

---

## 2) 分環境部署與權限落版（dev/staging/prod）

> 每一環境都需獨立 Web App URL + 試算簿 + Script Properties。

| 環境 | Web App URL | `SSOT_SPREADSHEET_ID` | `WRITE_LAYER_ENABLED` | `LOG_WRITE_ENABLED` | 權限建議 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| dev | `<填入>` | `<填入>` | false | true | 開發者 |
| staging | `<填入>` | `<填入>` | false | true | 組織內 |
| prod | `<填入>` | `<填入>` | false | true | 組織內/受控對外 |

部署確認：

- [ ] 三環境 URL 可用
- [ ] 三環境資料來源沒有串錯
- [ ] prod 尚未開寫入（false）

---

## 3) 灰度啟用策略（M-005 之後）

> 原則：一次只開一個寫入 action，觀察再擴大。

### 階段 G1：僅 `postFormWebhook`

- [ ] 將 `WRITE_LAYER_ENABLED=true`（先在 staging）
- [ ] 僅導入小流量來源（例：1 個表單）
- [ ] 驗證冪等（重送同 `form_response_id` 不重複寫入）
- [ ] 查 `ministry_logs` 無高風險 error

回滾條件（任一成立即回滾）：

- [ ] 重複寫入率 > 1%
- [ ] `POST_FAILED` 持續 > 5 分鐘
- [ ] 產生未白名單欄位寫入跡象

### 階段 G2：穩定化 `ministry_logs`

- [ ] 監控 `module=api/registration/planning/member`
- [ ] 驗證 log 無 PII（details 已遮罩 email）

### 階段 G3：啟用 `postPlanningKpi`

- [ ] 先在 staging 寫入 3～5 筆測試 KPI
- [ ] 驗證 `getPlanningKpi` 組裝結果

### 階段 G4：啟用 `postSmartMinistryExport`（可選）

- [ ] 僅輸入去識別 summary/score
- [ ] 驗證 raw / member_id / email / full_name 會被拒絕

### 階段 G5：`postMember`（可選）

- [ ] 僅允許 `email/full_name/roles/lang/status`
- [ ] 驗證 idempotent（同 email 不重複建檔）

---

## 4) 監控與觀察期（1～2 週）

### 每日檢查（值班）

- [ ] `getMinistryLogs&level=error&limit=200`
- [ ] `getMinistryLogs&module=registration`
- [ ] `getMinistryLogs&module=planning`
- [ ] API 平均延遲（手動或外部監測）
- [ ] 表頭是否被人工更動（`getSchemaStatus`）

### 指標門檻（建議）

- 錯誤率：< 1%
- 寫入成功率：> 99%
- 重複寫入率（reg）：< 0.5%
- 重大 schema 錯誤：0 件

---

## 5) 回滾 Runbook（3 分鐘可執行）

### 快速回滾（首選）

1. [ ] 設定 `WRITE_LAYER_ENABLED=false`
2. [ ] 保留 `LOG_WRITE_ENABLED=true` 以便追查
3. [ ] 暫停外部 webhook 觸發來源
4. [ ] 以 `getMinistryLogs` 匯出錯誤窗口資料

### UI 回退

1. [ ] 移除或停用 `apiBase`（`localStorage.b100_v2_api_base`）
2. [ ] 讓頁面回退內建 fallback（`index_v5.html` / `ai_tools/index.html`）

### 資料修復

1. [ ] 匯出受影響期間 `registrations/members/planning_*`
2. [ ] 比對 `form_response_id` 冪等鍵
3. [ ] 人工核對後再重啟灰度

---

## 6) 批准節點（Sign-off）

### 上線前批准（Go/No-Go）

- [ ] TL 批准
- [ ] UAT Owner 批准
- [ ] Data Guard 批准

### 灰度升級批准（G1→G2→G3→G4）

- [ ] 每階段至少觀察 24 小時
- [ ] 無 P1/P2 錯誤
- [ ] 指標達標才可升級

---

## 7) 最終上線聲明模板

> Bible100 V2.2 已完成上線前 Gate 檢查，採用分環境與灰度策略啟用。  
> 目前寫入層狀態：`<true/false>`；啟用 action：`<list>`。  
> 監控視窗：`<start>`～`<end>`；回滾策略：已演練且可在 3 分鐘內執行。

---

## 8) 附錄：常用驗收 URL（填入 Web App Base）

- `<BASE>?action=getSchemaStatus`
- `<BASE>?action=getBootstrapReadiness`
- `<BASE>?action=getCourseList`
- `<BASE>?action=getQnaList&format=html`
- `<BASE>?action=getNavigationMap`
- `<BASE>?action=getAiToolsConfig`
- `<BASE>?action=getPlanningKpi`
- `<BASE>?action=getMinistryLogs&module=api&level=error&limit=100`
- `<BASE>?action=getWriteLayerReadiness`
