# 教會事工／關懷 · Schema 草案 v0.1

本文件是針對「教會事工 Church」區（含關懷事工、探訪、小組／事工 SPAC 概覽）的具體 schema 草案，細化自《全站 DB 藍圖 v0.1》中 §2 churchMasterDatabase 相關表。

## 1. 目標與資料流概覽

小白（同工）在「關懷事工」相關頁面填寫探訪、關懷、出席等表單。前端可先以 localStorage 暫存，降低上線門檻；最終目標仍是將資料寫入 Supabase／Postgres 等正式資料庫，以便多人協作與備份。儀表板與「教會雷達／我的工作桌」會從 `members`、`ministries`、`events`、`attendance`、`visitations`、`care_cases` 讀取資料，計算 SPAC 指標與待辦清單，讓牧者與同工在同一套事實基礎上決策。

## 2. 會友與事工結構（members／ministries）

引用《全站 DB 藍圖 v0.1》中對 `members`、`ministries`、`ministry_members` 的精神，針對 Church／關懷補幾個實務欄位：

| 表名 | 關鍵欄位（示意） | 用途補充 |
|------|------------------|----------|
| members | member_id, name, contact_phone, contact_email, status, campus_id, joined_at, left_at, pastoral_region | 供出席、探訪與關懷對象使用；`pastoral_region` 可標示牧區或關懷牧長。 |
| ministries | ministry_id, name, category, campus_id, leader_member_id, status | SPAC 中 A–E 類事工可用 `category` 區分；leader 會在儀表板看到自己事工的 SPAC。 |
| ministry_members | ministry_id, member_id, role, started_at, ended_at, is_core | 事工同工分派，`is_core` 可標示核心同工，儀表板可優先顯示。 |

關懷事工的「探訪隊」「關懷小組」其實就是特定 `ministries` 加上對應的 `ministry_members`；不必另建一套平行群組表，除非產品上刻意分離品牌與權限。

## 3. 聚會與出席（events／attendance）

這段重點是讓「小白點勾出席」變成將來雷達的計算基礎。

| 表名 | 關鍵欄位（示意） | 用途補充 |
|------|------------------|----------|
| events | event_id, name, event_type, date, start_time, end_time, campus_id, ministry_id | 一場主日、一個小組聚會、一次關懷小組聚會都是一個 event。`event_type` 用於區分主日／小組／特會。 |
| attendance | attendance_id, event_id, member_id, attendance_type, status, remark | `attendance_type` 可為 in_person, online, excused, absent 等；`status` 可標示已確認／待確認。 |

關懷雷達可以用 `attendance` 做「連續缺席」判斷；同工只要勾選「有來／沒來」，後端就有足夠結構化資訊計算流失預警，不必要求小白一開始就填長文。

## 4. 探訪紀錄（visitations）

這一節細化小白實際會填的欄位，方便之後設計前端表單。

| 欄位 | 說明 |
|------|------|
| visitation_id | 主鍵。 |
| member_id | 被探訪的對象（會友）。 |
| visitor_member_id | 探訪同工（可選，或以關聯表支援多名同工）。 |
| visit_date | 探訪日期。 |
| visit_type | 家訪、醫院、電話、線上等。 |
| origin | 探訪來源，例如「牧者交辦」「系統流失預警」「會友主動求助」。 |
| summary | 探訪內容摘要（短文本，方便列表閱讀）。 |
| detail_notes | 詳細紀錄（長文本，可選）。 |
| follow_up_action | 建議後續行動（例如轉交牧者、安排關懷小組等）。 |
| priority | 關懷優先級（高／中／低）。 |
| status | 開啟、進行中、已完成、轉交等。 |
| created_at / created_by | 建立時間與建立人。 |

建議預留可選欄位 `case_id`，用來把單次探訪連到長期個案（`care_cases`），方便個案頁面回頭看所有探訪紀錄。

### 小白版探訪表單：最小必填欄位

以下為「一定要有」，資料才結構化可用、又不會嚇到小白：

**對象與時間**

- 受訪會友（`member_id`）
- 探訪日期（`visit_date`）

**探訪方式與來源**

- 探訪方式（`visit_type`：家訪／醫院／電話／線上）
- 探訪來源（`origin`：牧者交辦／系統提醒／會友主動／其他）

**內容與緊急程度**

- 簡短摘要（`summary`：一兩句即可）
- 關懷優先級（`priority`：高／中／低）

**狀態（可有預設）**

- 狀態（`status`：預設「已完成」；若做「待跟進」工作桌，再依流程切換）

進階欄位（`detail_notes`、`follow_up_action`、`visitor_member_id` 等）可由同工在「展開詳細」區補上；儀表板可依 `priority` 與 `status` 做「待探訪／待跟進清單」「已完成清單」。

### 建議表單欄位設計（前端可直接照此排列）

可依下列順序做一張簡單表單（約 30 秒可完成一筆）；之後再把 `detail_notes`、`follow_up_action` 等放進「展開詳細」區即可。

| 欄位 | 型態／UI 建議 |
|------|----------------|
| 受訪會友 | 下拉選單或搜尋框（選 `member`）；暫時也可手填姓名並在背後對應隱含的 `member_id`。 |
| 探訪日期 | 日期選擇器（預設今天）。 |
| 探訪方式 | 下拉：家訪／醫院／電話／線上／其他。 |
| 探訪來源 | 下拉：牧者交辦／系統流失預警／會友主動／其他。 |
| 簡短摘要 | 單行文字輸入（建議 80–120 字內）。 |
| 關懷優先級 | 單選：高／中／低（預設中）。 |
| 狀態 | 單選：已完成／待跟進（預設已完成；若從「待跟進清單」打開則預設待跟進）。 |

### 下一步怎麼用在你現有系統裡

在「探訪工作桌 1.0」或關懷事工頁，可先新增「**新增探訪紀錄（簡易）**」按鈕，表單即採用上列欄位。

存檔時，localStorage 的物件鍵可暫名 `visitationsDraft`（或類似命名）；物件內欄位名建議**直接與 schema 一致**：`member_id`、`visit_date`、`visit_type`、`origin`、`summary`、`priority`、`status`。將來寫入真實 DB 時，可**一比一對應**到 `visitations` 表，無需再重構欄位名稱。

## 5. 關懷個案（care_cases）

`care_cases` 比 `visitations` 更像「中長期個案」，用來追蹤「這個人需要一段時間特別關懷」。

| 欄位 | 說明 |
|------|------|
| case_id | 主鍵。 |
| member_id | 關懷對象。 |
| case_type | 個案類型，例如「流失預警」「喪親」「重病」「婚姻」「財務」等。 |
| opened_at | 個案開啟時間。 |
| closed_at | 個案結案時間（可空）。 |
| owner_member_id | 個案負責人（牧者或主要關懷同工）。 |
| source | 個案來源，例如系統流失預警、牧者指派、會友主動反映。 |
| risk_level | 風險／嚴重程度（高／中／低），可與流失預警指標對應。 |
| last_contact_at | 最近一次實際接觸日期（可由 visitations 自動更新或人工填寫）。 |
| summary | 個案簡要說明。 |
| status | 開啟、觀察中、介入中、結案等。 |

未來可以為 `case_type` 和 `risk_level` 維護小字典表（lookup table），讓不同教會可以自訂類型與分級，但 schema 草案 v0.1 先當作固定選項即可。

教會雷達可以用 `case_type` 與 `risk_level` 彙總「目前有多少高風險個案」。

## 6. SPAC 與「我的工作桌」需要的欄位

SPAC 不必在此寫死數學公式，下列僅標示**資料來源**，供日後儀表板實作對照。

- **S（Spiritual）**：可參考敬拜相關聚會的 `attendance`、門訓參與（與 `discipleship_enrollments` 關聯，見全站藍圖 §4）、小組型 `events` 的出席紀錄。
- **P（Participation）**：可參考 `attendance` 的出席率、`ministry_members` 的同工參與度（是否持續服事、`is_core`）。
- **A（Action）**：可參考 `projects` 的進度與狀態、`visitations` 在期間內的完成筆數與 `status`。
- **C（Care）**：可參考 `care_cases` 的數量、`risk_level`、`status`，以及 `visitations` 的近期頻率與 `priority`。

實作時各指標會讀上述表與欄位，必要時再建立 **彙總視圖（view）** 或 **物化快取**，避免每次即時掃全表。

## 7. 對應到現有前端／localStorage 的提醒

| 現有概念／暫存鍵 | 可能對應的表 |
|------------------|--------------|
| 探訪工作桌 1.0 的清單／記錄 | `visitations`（與 `care_cases` 連動） |
| 會眾關懷 · 年度計劃 | 可對應 `projects` 或 `care_cases` 加年度標籤 |
| 出席統計暫存資料 | `events`／`attendance` |
| 關懷雷達暫存 | `care_cases`＋`visitations`＋`attendance` 的彙總視圖 |

## 8. 修訂紀錄

- v0.1：初稿，作為教會事工／關懷區的 schema 討論基礎；未來實作時可再細化欄位型別與索引。
