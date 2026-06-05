# 全站角色與權限標準（三層）RBAC_THREE_TIERS_STANDARD

**版本**：1.0  
**日期**：2026-04-16  
**狀態**：**規範**——新模組、上雲接入、後端 API／Storage 權限設計**應對齊本檔**；靜態試用階段可暫不強制技術實作，但**不得與本檔長期衝突**。

**關聯**：[資料契約 v0.1](./DATA_CONTRACT_v0.1.md) · [跨模組與 BaaS](./CLOUD_BAAS_AND_CROSS_MODULE.md) · [MODULE_CANONICAL_NAMES_AND_ENGINEERING_ROADMAP.md](./MODULE_CANONICAL_NAMES_AND_ENGINEERING_ROADMAP.md) · [工具與入口參考](./TOOLS_AND_ENTRY_REFERENCE.md) · `smart_ministry/docs/SMART_MINISTRY_DATA_RULES.md`

---

## 一、三層角色定義

| 層級 | 代碼（程式／API 建議） | 中文 | 職責摘要 |
|------|------------------------|------|----------|
| **總管** | `admin` | 總管 | 模組與組織邊界、帳號生命週期、稽核、**大量個資匯入／匯出**、跨模組設定、例外核准。 |
| **編輯** | `editor` | 編輯 | 內容與流程維護、問卷／事工設定、**範圍內**名單與報表、批次匯出（不含全站級 bulk PII 除非另授權）。 |
| **用家** | `user` | 用家 | 依指派使用功能：填寫、查閱**與自己或所屬群組相關**的資料、下載**權限內**匯出。 |

**說明**

- 同一真實人物可擁有多角色（例如某堂會 `admin` 兼某模組 `editor`）；**有效權限＝各角色能力聯集**，再以**資料範圍**（堂會／部門／小組）交集限制。
- 「訪客／未登入」視為 **`user` 的匿名子集**：僅公開頁與明確標示之匿名調查；**不得**存取受限名單或匯出含 PII 之 CSV。

---

## 二、能力詞彙（Capability）

新模組登記時，從下表**勾選**本模組會用到的能力；後端 policy 與前端 UI 對齊同一字串。

| 代碼 | 說明 |
|------|------|
| `view_public` | 瀏覽公開內容（教材、說明頁）。 |
| `view_internal` | 瀏覽組織內一般內容（需登入）。 |
| `submit_survey` | 提交調查／問卷（可匿名或實名依該問卷契約）。 |
| `export_own` | 匯出與**本人／本裝置**相關結果（如本機 JSON、個人報告 PDF）。 |
| `export_scoped` | 匯出**權限範圍內**之 CSV／報表（小批次、已約定欄位）。 |
| `export_org_wide` | 匯出**全組織／跨部門**彙總（高敏感；通常僅 `admin`）。 |
| `edit_content` | 編輯模組內文案、設定、非結構化頁面。 |
| `edit_structure` | 調整流程、表單欄位、路由、側欄正式入口（`editor` 以上，依模組再細分）。 |
| `import_bulk_pii` | **整檔** Excel／CSV 等含**可識別個資**之匯入（預設**僅 `admin`**；見§五）。 |
| `manage_users` | 指派角色、加入／移除組織成員（通常僅 `admin`）。 |
| `audit_read` | 讀取操作／匯出稽核紀錄（通常僅 `admin`）。 |
| `configure_integration` | API 金鑰、Webhook、雲端儲存桶、第三方銜接（僅 `admin`）。 |

---

## 三、資料敏感度分級（供匯入／匯出對照）

| 級別 | 說明 | 典型處理 |
|------|------|----------|
| **L0 公開** | 無個資、可離線散佈 | 所有人可 `view_public`。 |
| **L1 內部** | 聚會級、統計、去識別 | `user` 依範圍；`export_scoped` 需最小欄位。 |
| **L2 限制** | 小組／牧養圈可識別資料 | 僅 `editor`+ 範圍；禁止餵入未授權 AI。 |
| **L3 大量個資** | 全會友名單、全系統探訪紀錄 | **預設僅 `admin` + `import_bulk_pii`／`export_org_wide`**；必須稽核與用途說明。 |

---

## 四、功能模組 × 預設權限矩陣

下表為 **預設契約**：實作時可依堂會政策**收緊**，放寬須走 **§七 特事例外**。

**圖例**：✓＝預設允許 · ◐＝僅限範圍內／僅限非 bulk PII · ✗＝預設禁止 · **—**＝該能力不適用此模組

### 4.1 總站殼與通用

| 模組（路徑／說明） | 用家 `user` | 編輯 `editor` | 總管 `admin` |
|-------------------|-------------|----------------|--------------|
| **index_v5**（總站殼、模式切換） | `view_public`（公開區） | `edit_content`（頂欄文案／實驗入口，若組織自架） | `configure_integration`（殼層導向、環境切換） |
| **congregation**（會眾 Dashboard） | `view_public`／`view_internal` | `edit_content` | `manage_users`（若連會員制） |
| **nav_hub**、**search** | `view_public` | `edit_content`（索引維護） | `configure_integration` |
| **doc_viewer** | `view_internal` | `edit_content` | `audit_read`（若接存取日誌） |

### 4.2 教材與查經

| 模組 | 用家 | 編輯 | 總管 |
|------|------|------|------|
| **languages**（多語教材、landing） | `view_public` | `edit_content`、部分 `edit_structure` | `configure_integration` |
| **bible_study**（聖經探索、儀表板） | `view_public`／`view_internal` | `edit_content` | `configure_integration` |

### 4.3 Q&A／百科

| 模組 | 用家 | 編輯 | 總管 |
|------|------|------|------|
| **qna**（多來源 Q&A、iframe） | `view_public` | `edit_content`（題目樹／書籤，若自管） | `configure_integration` |

### 4.4 詩歌

| 模組 | 用家 | 編輯 | 總管 |
|------|------|------|------|
| **hymn_management**（歌譜、播放、PPT） | `view_public`／`view_internal` | `edit_content`、`edit_structure`（歌本／playlist） | `export_org_wide`（全庫備份若需要）、`configure_integration` |

### 4.5 教會規劃（church_planning）

| 模組／工具 | 用家 | 編輯 | 總管 |
|------------|------|------|------|
| 健康／靈命問卷（信徒、教牧、教會健康等） | `submit_survey`、`export_own`（本機） | `export_scoped`（堂內彙總 CSV，**去識別或最小欄位**） | `export_org_wide`、`import_bulk_pii`（**僅在明確遷移／匯入專案**） |
| **plan_***（SWOT、SMART、PDCA、**80/20 工作坊** 等） | `submit_survey`（填寫）、`export_own` | `export_scoped`、引導會議 | `edit_structure`、跨堂對齊設定 |
| **dashboard**（戰情） | `view_internal`（範圍內） | `edit_content` | `export_org_wide`、`audit_read` |

### 4.6 智慧事奉（smart_ministry）

| 模組／能力 | 用家 | 編輯 | 總管 |
|------------|------|------|------|
| 註冊、恩賜／技能問卷 | `submit_survey`、`export_own` | `export_scoped`、配搭設定 | `import_bulk_pii`、`manage_users`、`configure_integration` |
| 配搭、人才追蹤、儀表板 | `view_internal`（本人／被指派的） | `edit_structure`、`export_scoped` | `export_org_wide`、`audit_read` |

**細則**須同時遵守 `smart_ministry/docs/SMART_MINISTRY_DATA_RULES.md`。

### 4.7 教會事工（church_ministry）

| 模組／能力 | 用家 | 編輯 | 總管 |
|------------|------|------|------|
| Dashboard、團契、研究等 | `view_internal` | `edit_content`、`export_scoped` | `export_org_wide`、`configure_integration` |
| **探訪**（visitation 子域／專案） | `submit_survey`（探訪紀錄，依欄位設計） | `export_scoped`（區域／團隊） | **`import_bulk_pii`**（整批名單匯入）、`export_org_wide`、`audit_read` |
| 自訂頁面編輯器 | ✗（一般用家） | `edit_content` | `edit_structure`、`manage_users` |

### 4.8 獨立探訪（visitation／根目錄）

| 模組 | 用家 | 編輯 | 總管 |
|------|------|------|------|
| **visitation** | 同 **church_ministry 探訪**列 | 同左 | 同左 |

### 4.9 學校管理（school_management）

| 模組／能力 | 用家 | 編輯 | 總管 |
|------------|------|------|------|
| portal（家長／學生入口） | `view_internal`、`submit_survey`（依設計） | `export_scoped`（班級／科組） | `export_org_wide`（校級） |
| manage（學生、課程、成績、財務等） | ◐（教師只看任課範圍） | `edit_structure`、`export_scoped` | **`import_bulk_pii`**（學籍批次）、`manage_users`、`audit_read` |

### 4.10 門訓動力（disciple_dynamics）

| 模組 | 用家 | 編輯 | 總管 |
|------|------|------|------|
| **disciple_dynamics** | `view_internal`、`submit_survey` | `export_scoped`、`edit_content` | `export_org_wide`、`configure_integration` |

### 4.11 AI 工具（ai_tools）

| 模組 | 用家 | 編輯 | 總管 |
|------|------|------|------|
| **ai_tools** | `view_internal`、**禁止** `import_bulk_pii` 直送第三方 | `edit_content`（提示詞範本） | `configure_integration`（API Key）、**稽核敏感上傳** |

**原則**：含 L2/L3 之內容**不得**未脫敏即送入外部 LLM；高權限者亦同（見§五）。

---

## 五、大量個資匯入（「整張 Excel／CSV 餵入」）

1. **預設**：僅 **`admin` + `import_bulk_pii`** 可執行；**`editor` 預設不可**。
2. **`editor` 例外**：須 **書面／工單** 註明用途、欄位、保存期限，並由 **`admin` 單次授權** 或開啟**限時角色**。
3. **技術**：匯入管線須記錄 **誰、何時、檔案雜湊、筆數、目的**（`audit_read`）。
4. **與 AI／匯出**：bulk 名單**不得**預設連結至 AI 工具或公開下載連結。

---

## 六、新模組擴充檢查清單

新增資料或功能模組時，請完成：

1. **登記**：在本文 **§四** 增列一子表（或附錄檔 `docs/RBAC_MODULES_APPENDIX.md` 並於本文連結）。
2. **標註敏感度**：每類資料 L0–L3。
3. **能力映射**：列出啟用的 `Capability`（§二）。
4. **匯出格式**：若含調查／匯總，對齊 [DATA_CONTRACT_v0.1](./DATA_CONTRACT_v0.1.md) 或子模組資料規則；CSV 欄位**最小化**。
5. **試用 vs 正式**：試用可全開 UI，但文件註明「正式上線時收斂至本表」。

---

## 七、特事例外

| 類型 | 程序 |
|------|------|
| 臨時放寬（例如大佈道會一次性匯入） | `admin` 備註期限；到期自動收回角色或關閉功能旗標。 |
| 跨模組資料匯出 | 須**資料負責人**（Data owner）與 `admin` 雙簽（可為內部紀要）。 |
| 法規／保險稽核 | `audit_read` 僅限指定帳號；結果不外流。 |

---

## 八、實作階段說明（現況對齊）

- 目前多數頁面為 **靜態 HTML + 本機儲存**：**尚無**全域登入時，本檔作為 **上雲與後端開發的契約**，避免每個模組自創一套角色名。
- 未來若採 **Google Workspace**：群組可對應 `editor`／`admin`；**細粒度仍以本檔能力碼** 對照 IAM。
- 與 **Supabase／自架 API** 銜接時：建議資料表 `role` ∈ {`admin`,`editor`,`user`}，再以 **RLS** 或 **scope**（`org_id`, `ministry_id`）補足。

---

## 九、修訂紀錄

| 版本 | 日期 | 摘要 |
|------|------|------|
| 1.0 | 2026-04-16 | 初版：三角色、能力詞彙、全模組預設矩陣、bulk PII、新模組檢查清單、例外流程。 |
