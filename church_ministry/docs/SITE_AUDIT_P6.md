# 全站審計 P6（教會事工）

> 日期：2026-11-24 · 範圍：`church_ministry`、`js/`（橋接層）、`church_planning`、`smart_ministry`、`school_management`、`ai_tools`、`nav_hub`  
> 測試：`church_ministry/tests/test_cm_p6_tier_backup_audit.py`

「全站審計」在本批的意思是兩件**能驗證**的事：

1. **操作紀錄看得到**：橋接層本來就會把重要操作記到 `churchAuditLog`，現在行政／牧者能在 `modules/admin/audit_log.html` 唯讀查看與匯出。
2. **防止繞過橋接層**：用自動測試擋住「新增直接寫正式資料 key 的檔案」，既有的列為**基線**，逐步收斂。

---

## 1. 操作紀錄（審計）

| 項目 | 內容 |
|------|------|
| 來源 | `ChurchDataBridge.logActivity` → `churchAuditLog`（最多 1000 筆，超過自動刪最舊） |
| 新增欄位 | `actor`：做事的**角色**（牧者／行政…），只記角色，不記姓名、不記 token。沒啟用登入時沒有此欄（舊紀錄也沒有，顯示為「系統」） |
| 檢視頁 | `modules/admin/audit_log.html`（G 區深鏈工具「操作紀錄（審計）」；中型堂起預設顯示，小型以下在「顯示更多工具」） |
| 權限 | 有啟用登入時需 `crm.admin`（牧者、行政）；沒啟用登入視為本機單人，直接可看 |
| 只能看 | 頁面與面板沒有任何新增／修改／刪除（測試檢查不含 `setItem`／`removeItem`／`rotateAuditLogs`） |
| 隱私 | 只顯示白名單欄位（筆數、欄位名、會友編號、事件類型）；金額、姓名、電話等**不顯示、不匯出** |
| 匯出 | CSV（Excel 可開；`= + - @` 開頭的格子自動加單引號，防公式注入）與 JSON；內容是白話欄位，不是原始紀錄 |
| 白話對照 | `js/cm_audit_view.js` 的 `ACTION_LABELS`；測試會比對橋接層所有 `logActivity('…')`，**新增操作忘了加白話會測試失敗** |
| 新增紀錄 | 備份下載、備份還原各記一筆（`backup_exported`／`backup_restored`） |

## 2. 備份與還原

| 項目 | 內容 |
|------|------|
| 頁面 | `modules/admin/backup_restore.html`（G 區深鏈工具「備份與還原」，**任何檔位都顯示**；教會主航道頁底也有連結） |
| 備份 | 只讀 `js/cm_backup_config.js` 白名單內的 key，下載成 JSON；檔案含個人資料，頁面有保管提醒 |
| 還原 | 選檔 → 驗證（格式、版本、每個 key 內容）→ 人確認 → **先自動下載「還原前備份」** → 才寫入；有任何一項驗證失敗，**一個都不寫** |
| 白名單 | 備份檔裡多出來的 key 一律忽略；測試會比對橋接層所有 `*_KEY`，**漏一個就失敗** |
| 提醒 | 有會友資料且超過 30 天（`REMIND_AFTER_DAYS`）沒備份，教會主航道頁顯示一行提醒；全新系統不打擾 |
| 說明 | 頁首「30 秒看懂」；說明「檔案方式」與「網址方式」是兩份各自獨立的資料，須在同一種開啟方式備份／還原 |
| 還原的例外 | 還原是「刻意整份覆蓋」，不經 `saveMemberSystemData` 等橋接層函式（會逐筆驗證與記錄，不適合整份還原）；因此限制 `crm.admin`、須確認、先備份、記一筆審計 |

## 3. 規模檔位套用

設定檔 `js/cm_size_tier_config.js` 為單一真相：

- `TIERS[*].visible_depts`：A–G 哪些部門台預設顯示（微 A·B；小 A·B·C·G；中、大 A–G）。
- `FEATURES`：每個功能「從哪一檔起預設顯示」；頁面以 `data-size-feature="…"` 標記，**小檔位預設收起，按「顯示更多工具」才出現，功能不刪**。
- 紅旗、預警、名冊、AI 草稿、備份：永遠顯示，不標記。

已套用的對照（真實存在的工具連結）：

| 功能代碼 | 從 | 部門台上的連結 |
|----------|----|----------------|
| `shift_suggest` 排班建議 | 小 | A／B／F 排班、E 義工排班與請假調班 |
| `newcomer_funnel` 新人漏斗 | 小 | D 外展「跟進」 |
| `matching` 配對 | 中 | B 事奉媒合、E 志工崗位／配對 |
| `multi_dept_board` 多部門看板 | 中 | G 戰情 dashboard |
| `audit` 審計 | 中 | G 操作紀錄 |
| `weekly_pdca` 每週 PDCA 摘要 | 中 | 戰情 dashboard 上的「PDCA Check 草稿」面板（`do_plan_feedback`）；微／小型堂預設收起，有按鈕展開 |

**每週 Check 摘要（紅旗頁的「複製本週摘要」）刻意不收起**：它屬於紅旗安全路徑，任何檔位都要看得到。

**尚未對應到畫面的功能代碼**（設定檔已登記，但目前沒有可收起的獨立入口，所以沒有效果）：`cross_dept_360` 跨部門 360、`multi_campus_permission` 多分堂權限、`multi_service_isolation` 多堂點隔離。測試會檢查這份清單與實際使用是否一致。

## 4. 繞過橋接層的直接寫入（基線）

規則：正式資料（會友、探訪、義工、財務、教育、牧養事件、關懷、審計）只能經 `ChurchDataBridge` 寫入。測試掃描 `localStorage.setItem('<正式 key>'` 的字面寫法，**新增檔案會失敗**。

**基線（既有、尚未收斂，逐步改走橋接層）：**

| 檔案 | 寫入的 key | 說明與風險 |
|------|------------|------------|
| `js/bootstrap_church_data.js` | `memberSystemData` | 橋接層可用時走橋接層；僅在橋接層缺席時的後備寫入 |
| `js/data_trust_badge.js` | `volunteerSystemData` | 同上，有 `saveVolunteerSystemData` 時走橋接層，後備才直寫 |
| `church_ministry/js/pastoral_trial_pack.js` | `memberSystemData` | 牧養試用包的示範資料；先走橋接層（`skipRbac`，略過權限），失敗才後備直寫；僅限試用 |

**已收斂（不在基線內）：**

| 檔案 | 做法 |
|------|------|
| `church_ministry/modules/support/visitation.html`（探訪主頁） | 儲存只經 `ChurchDataBridge.saveVisitationData`；移除「橋接層缺席時直寫」的後備，缺席時提示「沒有儲存」；沒有權限時白話提示。 |
| `church_ministry/projects/visitation_site/visitation.html`（舊獨立探訪站） | 改為載入橋接層，讀寫都經 `getVisitationData`／`saveVisitationData`，與「教會事工」共用同一份探訪資料（原本是自己一個桶）；載入示例資料的確認視窗加註「會混進正式資料」。 |
| 橋接層 `saveVisitationData` | 新增 `visitation.write` 權限檢查（未啟用登入時不影響；啟用後志工／檢視角色不能寫）。 |
| `church_ministry/modules/administration/financial-management.html`（舊財務頁） | 已改為只經 `ChurchDataBridge`（`saveFinanceTransaction`／`softDeleteFinanceTransaction`），不再直寫 `financialData`、不再自動載入示範資料；新增與作廢都記操作紀錄。橋接層這兩個函式現在要求 `finance.write`（未啟用登入時不影響）。舊獨立帳若有真資料，可在頁面上確認後**一次性**匯入正式帳（示範資料不匯入、舊資料不刪除）。 |
| 橋接層 `tryMigrateFinanceFromLegacyLocalStorage` | **修了一個舊 bug**：舊格式（`{income:[],expense:[]}`）原本會被整包搬進 `financeSystemData` 並刪除原檔，正式帳因沒有交易清單而「看不到」。現在只搬已是 `transactions` 格式的，舊格式留給舊財務頁由人確認匯入。**曾被舊版搬過的瀏覽器**：資料留在 `financeSystemData` 頂層 `income`／`expense`，舊財務頁也能偵測並提供匯入（只讀、不改原資料）。 |

## 5. 未做／刻意不做

- **多人同步**：屬 v2，須用戶明示（Sheets／雲端）才做；本批沒有動。
- 基線檔案的收斂：財務頁、兩個探訪頁已完成；基線表剩 3 個「橋接層可用就走橋接層、缺席才後備直寫」的檔案，風險低，暫不動。
- 審計紀錄的**防竄改**（雜湊鏈、伺服器簽章）：本機 localStorage 做不到，須等 v2 有伺服器才談；目前只提供「看得到、匯得出」。
- 審計只涵蓋橋接層有記錄的操作；直接寫入的舊頁（上表）不會留下紀錄。
- 備份加密為**可選**（勾選才加密）；沒勾選的備份檔仍是明文，靠使用者保管。忘記密碼無法補救。
- 備份只涵蓋白名單內的 key；其他模組（教會規劃、學校、AI Lab）的本機資料不在此備份內。
- P5／P6 新文案僅繁中，未進 i18n pack。
