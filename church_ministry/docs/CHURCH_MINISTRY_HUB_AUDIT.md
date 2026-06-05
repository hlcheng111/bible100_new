# 教會事工核心 · 總檢測（資料庫／報表／小白用路）

本文件為 **整站總設計視角**：說明各模組 **localStorage 鍵**、與 **`churchMasterDatabase`** 的關係、以及 **給第一次使用者的建議路徑**。實作入口：`bible100_new/js/church_data_bridge.js`。

---

## 一、主資料庫（單一匯總）

| 鍵名 | 用途 |
|------|------|
| `churchMasterDatabase` | 全站匯總；`ChurchDataBridge` 在存檔時寫入各切片（`members`、`pastoral`、`education.integrated`、`education.schoolSnapshot`、`education.aModule`、`volunteer`、`financeModule`、`discipleship` 等） |
| `memberSystemData` | 會友事工主檔（會友／小組／事工／培訓／出席） |
| `visitationData` | 探訪執行頁主要讀寫 |
| `schoolMasterDatabase` | **學校管理** 全系學籍／課程／選課（學生可填 `memberId` 連會友） |
| `educationSystemData` | **教會事工內** 教育模組；存檔時同步 **`churchMasterDatabase.education.integrated`**（與 `schoolSnapshot` 並列） |
| `church_ministry_a_education` | A 模組「目標·進度·成果」；存檔時同步 **`churchMasterDatabase.education.aModule`** |
| `discipleData` | **教會事工內** 門徒班級簡表；完整門訓路徑請用門訓動力站 |
| `discipleData` → `churchMasterDatabase.discipleship` | 經 `saveDiscipleClasses` 同步 |
| `volunteerSystemData` | 志工事工；存檔時同步 **`churchMasterDatabase.volunteer`** |
| `financeSystemData` / `financialData` | 財務事工頁；存檔時同步 **`churchMasterDatabase.financeModule`**（與既有 `getFinanceSummary` 所用結構並存） |
| `aiChatHistory` | 事工內 AI 助手對話（示意） |

---

## 二、模組對照（總設計優先）

| 區塊 | 代表頁面 | 資料來源 | 報表／儀表板 |
|------|----------|----------|--------------|
| 教會事工儀表板 | `church_ministry/dashboard.html` | Bridge 聚合會友、志工、探訪、財務、學校摘要 | SPAC 四格、學校四格、快速連結 |
| 會友 | `modules/members/member-integrated.html` | `memberSystemData` | 內建圖表、匯出 JSON |
| 探訪 | `modules/support/visitation.html` | `visitationData` + CM `pastoral.visitation` | 任務表、分區覆蓋 |
| 教育（事工內） | `modules/education/education-integrated.html` | `educationSystemData` → `churchMasterDatabase.education.integrated` | 與 A 模組總覽連動 |
| 志工 | `modules/volunteer/volunteer-integrated.html` | `volunteerSystemData` → `churchMasterDatabase.volunteer` | 儀表板摘要 |
| 財務 | `modules/finance/finance-integrated.html` | `financeSystemData` → `churchMasterDatabase.financeModule` | 與 `getFinanceSummary` 並行 |
| **學校管理** | `school_management/dashboard.html` | **`schoolMasterDatabase`** | 學校儀表板、與教會儀表板「學校事工」四格 |
| **門訓動力站** | `disciple_dynamics/dashboard.html` | 独立站資料 | 門徒路徑 |
| **門徒班級（簡版）** | `modules/development/discipleship-training.html` | `discipleData` | 班級列表；同步 `discipleship` |
| **AI 工具** | `ai_tools/dashboard.html`、事工內 `modules/tech/ai-assistant.html` | `aiChatHistory` 等 | 示意、未接真 LLM |

---

## 三、小白建議路徑（三步）

1. **先有人**：`load_central_member_seed.html` 或會友系統建立名單 → `memberId` / 分區一致。  
2. **再對應事工**：小組／探訪／志工 → 用同一 ID 關聯，勿只用姓名。  
3. **學校／門訓**：主日學學籍 → **學校管理**；教會內簡易班級 → 教育事工或門徒培訓頁；完整路徑 → **門訓動力站**。

---

## 四、與報表模組的關係

`modules/research/*` 多為 **示意或圖表頁**：接真實數據時應改為 **讀 `ChurchDataBridge.getMembers()`、`getVisitationData()`、`getSchoolMinistrySummary()`** 等，避免再寫一份 localStorage 鍵名。

---

## 五、後端 API 遷移原則

- 欄位與型別以 `MEMBER_DATA_MODEL.md`、`VISITATION_DATA_MODEL.md` 為準。  
- 僅替換 **`church_data_bridge.js`** 內讀寫；頁面維持呼叫 `ChurchDataBridge` 方法。

---

## 六、上雲前靜態版（`cloud_config.js`）

- 路徑：`bible100_new/js/cloud_config.js`（建議在 `church_data_bridge.js` **之前**載入）。  
- 提供 **`window.CHURCH_CLOUD_CONFIG`**：`USE_API`、`API_BASE_URL`；正式環境設為 `true` 並把 `API_BASE_URL` 指向後端後，再在 Bridge 內依旗標改為 `fetch`。  
- **目前**：`USE_API: false`，行為與先前相同（本機 `localStorage` + 主庫同步）。
- **小白步驟說明**：`docs/CLOUD_小白上雲.md`（同一資料夾內另有 **`CLOUD_小白請讀.txt`** 入口）。  
- **工程師 fetch 輔助**：`bible100_new/js/cloud_api.js`（`churchCloudFetch`，可選載入）。

---

## 七、雙軌策略（本機 demo ↔ 上雲）

| 階段 | 做法 |
|------|------|
| **本機／離線** | 靜態 HTML + `localStorage` + `churchMasterDatabase` 匯總，**零後端**可 demo。 |
| **上雲** | 需 **HTTPS、API、身分驗證、多裝置同步**；Bridge 內讀寫改為 API，**不改各頁面** `saveData` 呼叫方式。 |

---

## 八、後續工程計劃（總覽）

見 **`docs/CLOUD_ROADMAP.md`**（匯出、報表接 Bridge、API、登入等）。

## 九、教會事工 UI 規範（v1）

見 **`docs/UI_SPEC.md`** 與 **`css/church_ministry_ui.css`**（頂部返回列、資料來源提示、色票與 Tab 命名建議）。

---

## 十、教會 CRM 藍圖（2026-05）

全站走向 **教會版 CRM**（操作層／分析層／協同層）之缺口、補足與 100% 驗收，見：

- **`docs/CHURCH_CRM_BLUEPRINT.md`** — Inventory → Standardize → Automate、兩大模組互聯  
- **`docs/CRM_ENGINEERING_PHASES.md`** — 分期工程 CRM-0～CRM-5  
- **`docs/CRM_RELEASE_NOTES_2026-05.md`** — 2026-05 功能更新紀錄（儀表板／規劃說明同步）  
- **`docs/CRM-5_CLOUD_AUTH_SHEETS.md`** — 上雲、RBAC、Sheets、AI 草稿  
- **`js/church_crm_constants.js`** — 屬靈階段與牧養事件類型  
- **Bridge**：`appendPastoralEvent`、`getCrmMaturitySummary`、`syncMinistryCatalogFromVolunteer`、`evaluateNewcomerFollowUpAlerts`

儀表板可顯示 **`getCrmMaturitySummary().percent`** 作為資料就緒度（非屬靈評分）。

---

*最後更新：教會 CRM 藍圖與 Bridge CRM API。*
