# 全站 DB 藍圖 v0.1

## 0. 設計原則

- **人的主鍵（member_id）**：全站所有與「人」相關的資料表（會友、學生、門訓學員、志工、奉獻人、出席紀錄等）一律以 `member_id` 為主鍵或外鍵來源，避免重複建人。若業務上必須區分「登入帳號」與「會友檔」，再以一對一關聯銜接，仍不另建重複人名主檔。

- **志工是否獨立表**：原則上志工是 `members` 的一種角色，通常不做獨立 `volunteers` 主表，而是用 `ministry_members` 或角色欄位標記；只有當教會需要管理大量外部志工時，才考慮獨立表。

- **可選 campus_id**：所有與「地點／堂會」相關的核心表（`members`、`groups`、`events`、`attendance`、`offerings` 等）預留可選的 `campus_id` 欄位，方便日後多堂會或多校區擴展。

- **審計與軟刪除**：重要業務表預設包含 `created_at`、`updated_at`、`created_by`、`updated_by`、`is_deleted` 等欄位；重要財務表需額外有 `audit_log` 或 `approval` 狀態，用於追蹤修改與核准流程。

- **個資與 RBAC 提示**：所有含個資（特別是聯絡方式、靈性狀況、財務奉獻）的表要規劃欄位級權限（Role-Based Access Control），例如：一般同工不可看到奉獻金額；探訪同工只看到關懷相關欄位等。

## 1. 五大邏輯域概覽

| 邏輯域 | 名稱 | 說明 |
|--------|------|------|
| 核心教會 | churchMasterDatabase | 會友、事工、小組、聚會、出席、財務等主資料 |
| 學校 | SchoolMasterDatabase | 學生、教師、課程、選課與上課紀錄 |
| 門訓／AI | Discipleship & AI | 門訓班級、修課紀錄、AI 對話與洞察 |
| 長期計劃 | Planning | 歷史與健康、使命異象、問卷與 AI 歸納 |
| 詩歌／敬拜 | Hymns & Worship | 詩歌曲目、歌單、聚會使用紀錄、影音連結 |

## 2. churchMasterDatabase（核心教會主庫）

此區涵蓋會友、事工、聚會、出席、財務等主資料，多數模組會直接或間接依賴這裡的表。門訓狀態的**彙總**宜以 **`discipleship_summary_view`**（view）呈現，而不是在 `members` 裡硬塞大量欄位，以免欄位膨脹與更新不一致。

| 表名 | 說明 |
|------|------|
| members | 會友基本資料（姓名、聯絡、狀態、入會日期、可選 `campus_id` 等）。主鍵為 `member_id`。 |
| groups | 小組／團契／牧區等群體。含名稱、類型、`campus_id`、負責同工等。 |
| group_members | 成員與群體的關係（`member_id`、`group_id`、角色、加入／離開日期）。 |
| ministries | 事工單位（A–E 類＋行政），含名稱、負責人、`campus_id`、啟用狀態等。 |
| ministry_members | 事工同工分派（`ministry_id`、`member_id`、角色、起訖日期），也可代表志工身分。 |
| events | 各類聚會／活動（主日、團契、小組聚會、特會等），含日期、`campus_id`、`event_type` 等。 |
| attendance | 出席紀錄（`event_id`、`member_id`、`attendance_type`、狀態、備註）。`attendance_type` 用於區分實體／線上／請假等。 |
| care_cases | 特別關懷個案（`member_id`、`case_type`、狀態、負責同工、紀錄摘要等），可用於流失預警與牧養跟進。 |
| visitations | 探訪紀錄（`member_id`、`visit_date`、訪視同工、內容摘要、後續行動等）。 |
| offerings | 奉獻與收入（`member_id` 可選、金額、日期、科目、`campus_id`）。需搭配審計欄位。 |
| expenses | 支出（科目、金額、日期、核准人、`campus_id`）。需搭配審計欄位與核准流程。 |
| budget_items | 預算項目（年度、科目、預算金額、實際金額彙總）。可與 `offerings`／`expenses` 結合做分析。 |
| donors | 外部捐獻者（若非會友），含姓名與聯絡方式，可選連結到 `members`。 |
| projects | 專案（如探訪事工專案），含專案負責人、起訖日期、目標與狀態。 |
| church_profile | 教會層級的基本資料與健康度摘要（堂會數、聚會人數、健康指標等）。 |
| discipleship_summary_view | 一個 view，用來彙總每個 `member` 在門訓／AI 上的狀態（例如完成哪些課程、目前進度），供儀表板使用。 |

## 3. SchoolMasterDatabase（學校）

此區主要服務「學校管理 School」模組；學員與會友以 **`member_id`** 連結，避免重複人檔。

| 表名 | 說明 |
|------|------|
| students | 學員基本資料。若學生同時是會友，則記錄對應的 `member_id`。 |
| teachers | 教師資料，可連到 `members` 或獨立存在。 |
| courses | 課程主檔（名稱、類型、學期、`campus_id` 等）。 |
| enrollments | 選課紀錄（`student_id`、`course_id`、狀態、成績等）。 |
| class_sessions | 課堂實際上課場次，供出席與教室安排用。 |
| class_attendance | 課堂出席（`session_id`、`student_id`、`attendance_type` 等），可與主庫 `attendance` 邏輯類似。 |

## 4. 門訓／AI

此區主要支援「門訓 Discipleship」與 AI 輔助中心；彙總結果可透過 **`discipleship_summary_view`** 同步回 **`churchMasterDatabase`** 的儀表呈現語意（實體仍為 view，不重複存一份在 `members`）。

| 表名 | 說明 |
|------|------|
| discipleship_classes | 門訓班級主檔（名稱、級別、負責同工、`campus_id`）。 |
| discipleship_enrollments | 門訓修課紀錄（`member_id`、`class_id`、狀態、起訖日期）。 |
| ai_chat_history | AI 對話紀錄（`member_id` 可選、時間、內容摘要、標籤）。 |
| ai_insights | AI 對話後產生的重點洞察（例如屬靈狀況、需要關懷事項），可供牧者儀表板與決策用。 |

`discipleship_summary_view` 會基於 `discipleship_enrollments` 與 `ai_insights` 自動彙總每個 `member` 的門訓狀態。

## 5. Planning（長期計劃）

此區支援「長期計劃 Planning」模組的 Step 0–3，以及未來策略階段。**問卷需要版本管理**，以免日後改題目時混淆以前的結果（`planning_surveys` 與 `planning_survey_responses` 皆應能對應到同一版本）。

| 表名 | 說明 |
|------|------|
| planning_history | Step 0：教會歷史、健康狀況、自我描述等。 |
| planning_vision | Step 1：聖經與神學對齊後的使命與異象，含關鍵經文與核心價值。 |
| planning_surveys | Step 2：問卷定義（`survey_id`、版本號 `version`、題目結構 JSON 等）。 |
| planning_survey_responses | Step 2：會眾與領袖問卷回覆（`survey_id`、`version`、`respondent_id`、答案）。 |
| planning_ai_summaries | Step 3：AI 歸納之方向與建議（連結到特定 survey 或報告批次）。 |

## 6. Hymns & Worship（詩歌／敬拜）

此區服務「詩歌 Hymns」與敬拜事工，並可與 **`events`**／出席統計結合（例如某場主日歌單與歌曲使用頻率）。

| 表名 | 說明 |
|------|------|
| songs | 詩歌資料（歌名、作者、調、版權資訊、分類等）。 |
| worship_sets | 一場聚會的歌單（`event_id`、排歌順序、備註）。 |
| song_usage | 歌曲使用紀錄（`song_id`、`event_id`、次數），可供 CCLI／報告用。 |
| media_assets | 影音與檔案索引（檔案類型、URL、所屬 `song` 或 `event`）。 |

## 7. 與現有程式的關係（對照表）

以下為**語意對照**（設計討論用），方便日後將既有模組與本藍圖統一；實際表名以各專案 migration 為準。

| 現有名稱／概念（討論中已提及） | DB 藍圖中的表與欄位（對應方向） |
|-------------------------------|--------------------------------|
| `profiles`（登入使用者） | 與 `auth` 使用者一對一；牧養身分可再連 `members.member_id`；教會層摘要可部分對應 `church_profile` 或 `planning_history` 的責任欄位 |
| `mission_pillars` | 對應 `planning_vision` 中的核心支柱／使命表述，或 `church_profile` 中對外摘要 |
| `department_goals` | 對應 `ministries`＋`projects` 的目標與狀態，或與 `planning_ai_summaries` 的策略輸出連結 |
| `ministry_evaluations` | 對應 `ministries` 週期性評估資料，可落在擴充表或 JSON；與 `care_cases`／健康度指標可並列參考 |
| `kanban_tasks` | 對應執行面任務，可連 `projects` 或 `department_goals` 語意之目標 |
| `sandbox_projects`／`promotion_requests` | 對應 `projects`（沙盒專案）與升級／核准流程（與財務／事工核准流程類比） |
| localStorage `memberSystemData` | 遷移時對應 `members`、`groups`、`ministries`、`attendance` 等主庫表 |
| localStorage `schoolMasterDatabase` | 遷移時對應 §3 `students`、`courses`、`enrollments` 等 |

## 8. 實作前勾選清單

在開始實際建 Supabase／Next schema 前，建議先確認：

- [ ] RBAC 權限分層（誰可看哪些表、哪些欄位）
- [ ] 多堂會支援（`campus_id` 是否需要、哪些表一定要有）
- [ ] 問卷版本策略（`planning_surveys.version` 的使用方式）
- [ ] AI 資料保留策略（`ai_chat_history`／`ai_insights` 的保存期限與可匿名化需求）
- [ ] 財務審計流程（`offerings`／`expenses` 的審核欄位與 `audit_log`）

## 9. 修訂紀錄

- v0.1：初版全站藍圖，僅作為設計討論與未來 schema 的基礎。
