# CRM-5：多同工 API、Auth、RBAC、Sheets SSOT、AI 草稿

## 1. 本機多同工 API

```powershell
node scripts/church_api_local_server.js
```

`js/cloud_config.js`：

```javascript
USE_API: true,
API_BASE_URL: 'http://127.0.0.1:8787',
REQUIRE_AUTH: true,
```

登入：`church_ministry/admin/cloud_login.html`（pastor / demo123）。

端點：`POST /api/auth/login`、`GET/POST /api/members`、`GET /api/groups`、`GET/POST /api/visitation/missions`。

## 2. RBAC

| 角色 | 權限摘要 |
|------|----------|
| pastor | `*` |
| admin | 會友／牧養／探訪／志工／財務讀 |
| group_leader | 會友讀、牧養寫、探訪 |
| volunteer | 會友讀（電話遮罩）、探訪讀 |
| viewer | 唯讀 |

`ChurchDataBridge.saveMemberSystemData` / `appendPastoralEvent` 會檢查權限（`REQUIRE_AUTH` 或 `USE_API` 時）。

## 3. Google Sheets SSOT

1. 建立試算表：`members`、`ministry_logs`（欄位見 `MEMBER_DATA_MODEL.md`）
2. 部署 `church_ministry/apps_script/CrmSheetsSsot.gs` 為 Web App
3. 設定：

```javascript
USE_SHEETS_SSOT: true,
SHEETS_WEB_APP_URL: 'https://script.google.com/macros/s/……/exec',
```

動作：`getMembers`、`saveMembersBatch`、`appendPastoralEvent`、`getCrmSnapshot`  
信封：`{ ok, action, data, meta, error }`（與 v2 契約一致）

## 4. 成熟度 ≥ 90%

開啟 `church_ministry/load_crm_maturity_seed.html` → **載入成熟度種子**，再查看儀表板 CRM 就緒度。

## 5. AI 牧養（治理）

`modules/support/ai-pastoral-draft.html`：

1. 產生 Prompt（無 API Key）
2. 同工貼上外部 LLM 回覆
3. **人工確認** 後 `appendPastoralEvent`（metadata.human_confirmed）

**禁止**將 AI 草稿當神學權威或自動派工。

## 6. 腳本載入順序（上雲頁）

**已預載**（無需手動加 script）：`index_v5.html`、`church_ministry/dashboard.html`、`church_ministry/index.html` 皆含 `cloud_config` → `cloud_api` → `church_auth`。

1. `cloud_config.js`
2. `cloud_api.js`
3. `church_auth.js`
4. `church_sheets_ssot.js`（若用 Sheets）
5. `church_crm_constants.js`
6. `smart_ministry_canonical_store.js`
7. `church_data_bridge.js`
