# 學校管理模組 · 工程改善計劃與 SOP 報告 V1

**日期**：2026-07-26
**定位**：學校管理（school_management）＝ 教會事工 C 區「聖經及教育培訓」（主日學）的延伸。
**三大原則**：「人」歸中央會員庫（`memberSystemData`）、「事」分兩桌（主日學工作桌 / 學校學籍桌）、「錢」歸教會財政（`financeSystemData`）。

---

## 第一部分 · 現況總結（2026-07-26 盤點）

### 1.1 已有的真功能

| 環節 | 現況 | 資料層 |
|---|---|---|
| 學生註冊 | ✅ 學員入口可新生註冊；管理端可新增＋CSV 匯入＋關鍵字搜索 | `schoolMasterDatabase.students` |
| 選科入班 | ✅ 選科報名、三欄統一管理（選課／授課／分班）真寫入 | `student.enrollments`、`class.classStudents` |
| 學費登記 | ⚠️ 職員端可登記／更新繳費；學員端只能查看不能繳 | `schoolMasterDatabase.finance.*`（孤島） |
| 成績 | ✅ 管理、進度、報表 | `schoolMasterDatabase.grade.*` |
| 結業證書 | ✅ `course_completion.html` 可把結業寫入中央會員庫（`training_credits`／`skills`）——全模組唯一真接中央庫的頁 | `CentralMemberDB` |
| 通告 | ✅ 公告、內部訊息可寫入 | `communication.notices` / `.messages` |
| 排課 | ⚠️ 課表資料靠種子；`courses/schedule.html` 有頁但弱 | `course.schedules` |
| 儀表板 | ✅ 真統計（每 30 秒刷新）＋小白導引＋可編輯公告區 | `getGlobalStatistics()` |

### 1.2 已知缺陷（前三輪盤點結論）

1. **信任橫幅誤標**：舊種子 255 筆（200 學生＋25 教師＋30 課程）無 `isDemoSeed` 標記，被標為「真實填寫資料」——信任層在說謊。
2. **自動 seed**：一開檔即自動灌 255 筆示範資料，違反橫幅宣稱的「需人工確認才寫入」。
3. **中央會員線未接**：`linkStudentToMember` / `getStudentsByMemberId` API 已寫好，**全站零頁面呼叫**；儀表板導引教人「填 memberId」但表單無此欄。
4. **學費三本帳**：學費在 `schoolMasterDatabase.finance`，教會奉獻在 F 區 `financeSystemData`，互不相通。
5. **名冊雙真相**：C 區主日學 `educationSystemData.students` 與學校 `students` 兩桶各自建人，僅約定 `memberId` 對齊、無工具核對。
6. **假資料庫頁**：`manage/system/database.html` 是寫死的假 UI；根目錄 `school_management.db` 是殭屍檔。
7. **無權限**：學員入口任何人可「登入」任何學員；橫幅自標「敏感資料」卻無任何守門。
8. **統一管理三欄設計**難用（早前已要求改版，未執行）。
9. 家長溝通寫錯桶（寫進 `communication.messages`）；活動主檔無新增頁。

---

## 第二部分 · 業務接龍全景與缺口分析

以「學校組織實際運作」逐鏈檢查。**粗體＝完全缺失**。

### 2.1 學生鏈：宣傳 → 註冊 → 繳費 → 選科 → 入班 → 上課 → 小測 → 畢業

| 站 | 現況 | 缺口 |
|---|---|---|
| 宣傳冊子／招生簡章 | **無** | 無招生頁、無課程簡章輸出、無報名 QR／連結 |
| 報名→審核→取錄 | **無審批流** | 註冊即入庫，無「待審核」狀態、無取錄通知 |
| 註冊（中央會員） | API 有、UI 無 | W1 主題 |
| 繳費 | 職員登記可動 | 學員端不能繳／不能上傳證明；無收據；不入教會帳 |
| 選科入班 | ✅ 可動 | 無人數上限檢查、無衝堂檢查 |
| 上課出席 | schema 有 `student.attendance` | 學校端**無點名 UI**（主日學那邊有） |
| 小測成績 | ✅ 成績管理可動 | 無「出卷」概念（見教師鏈） |
| 畢業證書 | `course_completion.html` 可記結業 | **無證書檔案輸出**（PDF／列印版）；未與成績及格線掛鉤 |

### 2.2 教師鏈：聘任 → 編課 → 排班 → 教材 → 小測 → 評分

| 站 | 現況 | 缺口 |
|---|---|---|
| 教師檔案 | ✅ 有（來源標 church／external／youtube） | 未與義工檔（`volunteerId`）連（API 有、UI 無） |
| 編課排班 | 課程排程頁弱、靠種子 | **無課表視圖**（週曆／教室維度）、無衝堂檢查 |
| 教材備課 | **學校端無**；C 區 `edu_teaching.html` 有課程模板＋AI 報告草稿 | 兩邊未互通，學校老師接觸不到備課工具 |
| 出小測／考卷 | **無** | 無題庫、無出卷；只有事後登分 |
| 教學評估 | `courses/evaluation.html` 有 | 未接教師統計 |

### 2.3 校務鏈：科系 → 招生考試 → 成績 → 畢業 → 通告

| 站 | 現況 | 缺口 |
|---|---|---|
| 科系／學制 | 班級＋科目管理有 | **無「學年／學期」管理**（semester 只是散落字串，無學年結轉） |
| 招生考試 | **無** | 無入學試安排、無放榜 |
| 成績→畢業判定 | 成績有 | **無畢業條件規則**（修滿學分／及格科目數） |
| 常規通告 | 公告可發 | 只存本機，**無輸出渠道**（列印版／可複製文字／匯出） |

### 2.4 物業鏈：場地 → 租用 → 使用排期 → 維修

| 站 | 現況 |
|---|---|
| 場地／建築物登記 | **完全無** |
| 租用合約／費用 | **完全無** |
| 教室使用排期 | **無**（排課無教室維度） |
| 維修記錄 | **完全無** |

### 2.5 教會連結鏈：主日學 → 聖經培訓 → 義工訓練排班 → 人才配對

| 站 | 教會端現成資產 | 學校端接口現況 |
|---|---|---|
| 主日學體制 | C 區工作桌（`educationSystemData`：名冊／點名／缺席預警→B 區牧養） | 側欄互連有；**名冊資料不通** |
| 聖經培訓課程 | 門訓班（`discipleData`）、門訓動力站教材 | 結業→`CentralMemberDB.training_credits` 已通（唯一亮點） |
| 義工事工訓練排班 | 義工排班工具（`volunteerSystemData`）、A1 工具 | **教師↔義工未連**（`linkTeacherToVolunteer` 無人呼叫） |
| 人才配對 | 智慧事奉 `bible100_smart_ministry_main`（`talent_id`＝`member_id`） | **未連**；學校老師的技能／授課記錄沒有回流人才庫 |
| 缺席→牧養跟進 | CRM 預填機制 `bible100_crm_intent_v2`（預填不自動寫入） | **未用**；學生缺席／異常無法轉探訪跟進 |
| 收費→教會財政 | F 區 `financeSystemData` ＋ A3 對帳工具 | **未通** |

### 2.6 結構性漏洞（本輪新發現，最重要）

**⚠️ localStorage 是單機單瀏覽器的。** 「校長＋教務＋多位老師」的多人組織，資料只存在各自電腦的瀏覽器裡：校長看不到教務輸入的資料，換一台電腦資料就不見，清瀏覽器快取＝全校資料消失。目前模組**沒有任何備份／匯出全庫／匯入全庫的正式 SOP**。在多人真用之前，這比任何功能都優先。可行出路（按成本遞增）：
1. **短期**：全庫 JSON 匯出／匯入按鈕＋每週備份 SOP（單機主檔＋人手交接）。
2. **中期**：複用教會端 Sheets SSOT 骨架（`church_sheets_ssot.js`＋`CrmSheetsSsot.gs`，`USE_SHEETS_SSOT` 開關），加 `students`／`payments` 等表，多同工共編。**注意**：學生屬敏感 PII，Sheets 須限授權帳號，不進 NotebookLM、不上公開 API（站規）。
3. **遠期**：正式後端（超出本站 file:// 定位，僅列為選項）。

其他漏洞：無 schema 版本遞增與遷移記錄（違反跨模組資料規則）、無操作日誌（誰改了成績無從稽查）、無家長身份（家長溝通單向）、學員入口無任何身份驗證。

---

## 第三部分 · 工程改善計劃（波次）

按產品憲法「一波一主題」拆批。每波含目標、主要改動、驗收。

### W0 · 治理修復（信任與真假邊界）— 最小、最急

- 修信任橫幅誤判：無 demo 標記但筆數／ID 特徵符合種子者視為「示範／種子資料」；提供「標回示範」與「只清種子、保留真資料」按鈕（`clearSchoolDemoMarker` 反向補齊）。
- **停止自動 seed**：`index.html`／`dashboard.html`／`school-master-database.js` constructor 內的 `ensureSeedFull()` 自動呼叫全部移除，改為空庫＋醒目「載入示範」入口（`load_school_seed.html` 承接）。
- 移除假 `manage/system/database.html`（或改為真的全庫 JSON 匯出／匯入頁，與 W0 備份 SOP 合併）；處置殭屍 `school_management.db`。
- **全庫匯出／匯入**：系統 Tab 加「匯出全庫 JSON」「匯入全庫 JSON」，這是多人單機模式的救生圈。
- 驗收：新機開啟＝0 筆＋「尚無資料」；載入示範後橫幅顯示「示範／種子資料」；匯出→清庫→匯入可還原。

### W1 · 人：接通中央會員庫

- 學生新增／編輯表單加「從會友選人」（讀 `memberSystemData` 搜尋下拉）→ 呼叫 `linkStudentToMember`；非會友可留空（訪客生）。
- 教師表單同法接 `linkTeacherToVolunteer`。
- 儀表板加「已連結會友比例」卡（`ChurchDataBridge.getPersonMappingPreview` 現成）。
- 報名審核最小版：註冊來源的學生標 `status: 'pending'`，管理端一鍵「取錄」。
- 驗收：新增學生可選會友；儀表板見連結比例；會友 360 端（後續波）可反查。

### W2 · 錢：學費入教會帳

- 學員端「我的繳費」加「產生繳費通知文字」（複製給家長／出納，不做金流）。
- 職員端繳費登記加收據編號＋列印版收據。
- 「匯出至教會財政」批次：把 `finance.payments` 選定範圍轉為 `financeSystemData.transactions` 相容格式（CSV／JSON），對齊 A3 對帳工具欄位；先匯出、不即時雙寫。
- 驗收：登記繳費→出收據→月末匯出→F 區可對帳。

### W3 · 學務鏈：學年、招生、畢業證書

- 學年／學期管理：`schoolMasterDatabase.meta.academicYears`＋目前學期選擇器；選課／成績掛學期。
- 招生最小版：一頁「招生簡章」（讀課程目錄自動生成＋可編輯文案區，沿用 `dashboard_intro` 編輯器模式）＋報名表（寫入 pending 學生）。
- 畢業／結業強化：`course_completion.html` 接成績及格線判定；輸出**可列印證書頁**（模板＋學生名＋課程＋日期；可參考 bible_app 的 certificateGenerator 樣式）。
- 通告輸出：公告加「複製全文」＋列印版。
- 驗收：一個學期從招生→報名→取錄→修課→及格→列印證書全程走通。

### W4 · 教師鏈：排課課表、教材與小測

- 課表視圖：週曆（教師維度＋教室維度），衝堂高亮；教室先用簡單 `rooms[]`（為 W5 物業鋪路）。
- 備課互通：學校端課程頁加「開啟 C 區備課工具」連結（`edu_teaching.html`，`module` 導航）；教材先不搬家、只指路。
- 小測最小版：`grade.exams` 補 UI——建考試（名稱／科目／滿分／日期）→ 按班級批量登分（現成成績 API）。
- 驗收：老師可看自己週課表；建一次小測並登完一班分數 ≤ 5 分鐘。

### W5 · 物業：場地與維修（簡版新桶）

- `schoolMasterDatabase.property`：`rooms[]`（自有／租用、租金、合約到期）、`bookings[]`（掛排課或活動）、`maintenance[]`（報修→處理→完成）。
- 一頁式管理（列表＋新增），排課的教室欄位接 `rooms`。
- 驗收：登記 2 個場地、1 筆租約提醒、1 筆維修單走完狀態流。

### W6 · 教會連結：訓練、配對、牧養回流

- 名冊對齊報告：主日學 `educationSystemData.students` ↔ 學校 `students` 按 `memberId` 比對，三欄呈現（僅此／僅彼／已對齊），只報告不自動合併。
- 教師授課記錄回流智慧事奉：結業／授課寫 `training_credits` 之外，提供「更新人才庫技能」按鈕（走 `SmartMinistryCanonical` API，勿繞過）。
- 缺席→牧養：學生連續缺席（有 memberId 者）產生 `bible100_crm_intent_v2` 跟進**預填**，送探訪跟進工具，人工確認才寫入。
- 驗收：牧長可從一個會友看到「孩子在學校＋主日學」的對齊狀態；一筆缺席預填出現在探訪工具待辦。

### W7 · 家長通知草稿（溝通）

- 選學生＋事由（繳費提醒／缺席關懷／活動通知／一般）→ 產生通知文字草稿。
- 標示「只產生文字，不會發送」；可複製貼到 LINE／WhatsApp／週刊。
- 可選存為 `communication.messages`（status=draft）。
- 驗收：教務 2 分鐘內產出一則缺席關懷稿並複製，系統無任何自動發送。

### W8 · AI Prompt 生成器（人審草稿）

- 任務式 Prompt：招生宣傳、期末評語、小測出題、通告多語翻譯。
- 填表 → 複製 Prompt → 外部 LLM → **人工審核**；不需 API key。
- 掛載：`manage/ai_prompts/index.html`；招生簡章／小測頁有捷徑。
- 驗收：老師 3 分鐘內複製一則出題 Prompt；護欄含不編造經文。

### 波次以外持續項

- 統一管理三欄改版（UI 主題，另批處理，不與資料波混）。
- 每波完成：遞增 `schema_version`、更新本文件遷移記錄、跑相關測試（`python tests/test_unified_navigation.py`、模組靜態檢查），測試結果列入回覆。
- Git：每波一個 commit 主題（`school_management: <波次主題>`），不納入 `data/`、`*.db`。

---

## 第四部分 · AI 助力方案

按站規：**第一版全部走 Prompt 生成器（老師填表→複製 prompt→貼到 Kimi/ChatGPT/Claude/Gemini→人審），不需 API key；AI 產出一律是草稿**。

| 接龍站 | AI 用法（第一版：prompt 生成器） | 掛載點 |
|---|---|---|
| 招生宣傳 | 選課程→生成招生簡章文案／海報描述 prompt（配 ai_tools 文字轉圖像） | W3 招生頁 |
| 家長通知 | 選學生＋事由→通知草稿（繳費提醒／缺席關懷／活動通知），標示「只產生文字，不會發送」 | 溝通模組 |
| 教材備課 | 課程＋對象＋經文→教案／講義大綱草稿；接 C 區既有 AI 報告草稿模式 | W4 |
| 出小測 | 教材範圍→出題 prompt（選擇／填充／問答＋答案），老師審核後採用 | W4 小測 |
| 成績評語 | 讀該生成績→期末評語草稿 | 成績模組 |
| 多語翻譯 | 通告／簡章中文→英／越／印尼草稿，保留中文源文欄（站規） | 溝通／招生 |
| 資料清洗 | 匯入 CSV 前的欄位對照／糾錯 prompt | 系統工具 |

**Google 生態（中期，須使用者明確啟用 v2 模式）**：Google Forms 報名→Apps Script→Sheets→匯入 schoolDB；Google Calendar 匯出課表（.ics 先行，零依賴）；Sheets SSOT 多人共編（見 2.6）。**紅線**：學生 PII 不進 NotebookLM、不上公開 API；AI prompt 一律要求引用經文不編造、不宣稱屬靈權威。

儀表板現有六個泛用 AI 連結（文字轉音樂等）與校務無關，隨 W3 換成上表任務式入口。

---

## 第五部分 · 營運 SOP（人的操作手冊）

> **完整逐步手冊（含路徑表、完成標準、附錄）**：[`docs/SCHOOL_OPERATIONS_SOP_HANDBOOK.md`](SCHOOL_OPERATIONS_SOP_HANDBOOK.md)  
> 適用對象：校長／教務／老師／出納。每條 SOP 假設從 `index_v5.html` → 學校管理 進入。以下為摘要（W0–W8 對齊版）。

### SOP-1 · 首次啟用（校長／管理員，一次性）

1. 開學校管理 → 檢查頂部信任橫幅：若顯示「示範／種子資料」而你要正式使用 → 系統 → 載入示範頁 → 清空重來（或資料備份 → 清種子）。
2. 系統 → 離線工具 → 設定學校名稱（預設組織）與語言。
3. 儀表板 → 「編輯此區」→ 填「關於本校」（代碼 `dashboard_intro`）。
4. 系統 → **學年學期**（W3）→ 建班級與科目 → 建課程。
5. **立即做一次全庫匯出（W0）**，存到共用備份位置。

### SOP-2 · 學生註冊接龍（教務）

1. 家庭索取簡章（**招生簡章**；可選 W8 招生 AI Prompt）→ 填報名（**學員入口**・新生註冊，或教務代填）。
2. 教務審核 pending 名單（W1）：是會友家庭 → 「從會友選人」綁 `memberId`；否則留空。
3. 取錄 → 學生狀態轉 active → 選科入班（**統一管理**）。
4. 出納登記首期學費（SOP-3）。

### SOP-3 · 收費及入帳（出納）

1. 財務 → 學費 → 建應收（學生／學期／金額）。
2. 收款後標記已繳＋收據編號，列印收據（W2）。
3. （選）W7 家長通知草稿 → 繳費提醒 → 複製（不會自動發送）。
4. **每月最後主日**：財務 → 「匯出至教會財政」→ 交教會財務同工匯入 F 區對帳。
5. 學員／家長可在學員入口「我的繳費」自查狀態。

### SOP-4 · 開課排班（教務＋老師）

1. 課程 → 新增課程（掛學期、教師、教室〔W4/W5〕）。
2. **週課表**檢查衝堂（W4）→ 調整；物業 Tab 看租約提醒（W5）。
3. 老師用「備課工具」（連 C 區）出教案；需要 AI 草稿走 **W8 Prompt 生成器**，**必須人審後才用**。

### SOP-5 · 小測與成績（老師）

1. 成績 → **小測／考試**（W4）→ 考後按班登分；可先用 W8 出題 Prompt。
2. 期末：**W8 評語 Prompt**（人審）→ 面談或 W7 家長通知。

### SOP-6 · 畢業與證書（教務）

1. 課程結束 → 結業／`course_completion.html` → 核對及格名單。
2. 確認寫入中央會員庫（`training_credits`）。
3. 列印證書（W3 **結業證書** Tab），畢業禮發出。

### SOP-7 · 通告（行政）

1. 溝通 → 公告 → 撰寫（可用 **W8 多語 Prompt**，人審）。
2. 「複製全文」貼到教會實際通訊渠道——**系統不會自動發送**。

### SOP-8 · 每週備份與交接（管理員）

1. 每週固定日：系統 → **資料備份** → 匯出全庫 JSON → 存兩份（本機＋隨身碟或共用雲端私人資料夾）。
2. 換機／交接：新機匯入最新 JSON。
3. **嚴禁**在兩台機同時輸入後互相覆蓋——單機模式下同一時間只有一台是主檔（直至啟用 Sheets SSOT）。

### SOP-9 · 與教會事工月度對齊（教務＋主日學負責人）

1. 每月跑 **教會連結 W6** 名冊對齊報告：處理「僅在一邊」的孩子——補綁 `memberId` 或確認為校外生。
2. 缺席掃描 → CRM 預填佇列 → 探訪同工開表單人工確認。
3. （選）W7 缺席關懷通知草稿。
4. 教師技能更新回流智慧事奉人才庫。

---

## 第六部分 · 驗收與里程碑摘要

| 波 | 主題 | 一句驗收 |
|---|---|---|
| W0 | 真假邊界＋備份 | 新機 0 筆、示範標示正確、匯出匯入可還原 |
| W1 | 中央會員接通 | 新生可綁會友，儀表板見連結比例 |
| W2 | 學費入教會帳 | 收據＋月度匯出 F 區可對帳 |
| W3 | 學年招生證書 | 招生→取錄→修課→列印證書全程走通 |
| W4 | 課表教材小測 | 老師見週課表、5 分鐘登完一班小測 |
| W5 | 物業簡版 | 場地／租約／維修單可管理 |
| W6 | 教會連結閉環 | 名冊對齊報告＋缺席轉牧養預填 |
| W7 | 家長通知草稿 | 選學生＋事由→文字草稿，標示不會自動發送 |
| W8 | AI Prompt 生成器 | 招生／評語／出題／多語 Prompt，複製後人審 |

**建議動工順序：W0 → W1 → W2**（W0 不做，後面全部建立在真假不分的資料上）。

---

*本文件為學校模組資料契約與流程的正式文件之一；每波完工須回寫「遷移記錄」小節（schema_version、日期、改動摘要）。*

## 遷移記錄

- 2026-07-26 · V1 初版（盤點＋計劃＋SOP，未動程式）。
- 2026-07-26 · **W0 完工**（真假邊界＋備份）：
  - `ensureSeedFull` / `ensureSeedStudents` 加 `force === true` 閘門，全站 40 個自動 seed 呼叫點一次收口為 no-op；constructor 自動 seed 移除。只有 `load_school_seed.html` 明確傳 `true`。
  - 種子判定規則正式化：真實資料 ID＝`insert()` 的 13 位時間戳；種子列 ID < 10 億或帶 `source: 'school_demo_seed'`（`isSeedRecord`）。
  - 新增資料層 API：`exportAll()`（全庫 JSON）、`importAll(jsonText)`（覆蓋匯入）、`clearSeedData()`（清種子保留真資料，organizations／meta 不動）。
  - `manage/system/database.html` 由假 SQLite 頁改建為真「資料備份」頁（匯出／匯入／清種子／標為示範）；系統 Tab 改名「💾 資料備份」。
  - 信任橫幅（`js/data_trust_badge.js` 學校區段）改為列級判定：全種子＝示範、混合＝「示範種子 + 真實填寫資料」並提示清除路徑，修復舊種子 255 筆被誤標「真實填寫資料」的問題。
  - 靜態測試：`tests/test_school_w0.py`（21 項，全部通過）。
- 2026-07-26 · **W1 完工**（中央會員庫接通）：
  - 資料層新增：`isCentralMemberLink()`（排除 adapter 自造的 `sm-stu-*`／`sm-tea-*`，只有真中央 `member_id` 算已連結）、`getCentralMembers()`（只讀 `memberSystemData` 名單）、`getMemberLinkStats()`（連結比例＋待取錄數）。
  - `manage/students/add.html`：新增「教會會友」選人下拉（姓名篩選）→ `linkStudentToMember`；校外生可留空。
  - `manage/students/index.html`：列表加「狀態／會友」欄；「連結學生與會友」卡（既有學生補連結）；pending 學生一鍵「取錄」。
  - `manage/teachers/index.html`：「連結教師與會友義工」卡 → `linkTeacherToVolunteer`（volunteerId＝會友 member_id，對齊智慧事奉 talent_id 慣例）；列表加會友義工欄＋已連結統計。
  - `dashboard.html`：新增「已連結會友比例」卡（學生／教師連結比例＋待取錄註冊數）。
  - `portal/index.html`：新生註冊改 `status: 'pending'`（待教務取錄）；**修 bug**——原本手動 `maxId+1` 指定 ID 會落入種子 ID 區間、被誤判為示範資料，改由 `insert()` 配時間戳 ID；pending 學生不進模擬登入下拉。
  - 靜態測試：`tests/test_school_w1.py`（19 項）＋回歸 `test_school_w0.py`（21 項），全部通過。
  - 已知限制（W6 處理）：Bridge `getPersonMappingPreview` 的 `linked_count` 會把 `sm-stu-*` 誤算為已連結，儀表板卡改用本模組 `getMemberLinkStats()`，不受影響。
- 2026-07-26 · **W2 完工**（學費入教會帳）：
  - 資料層：`generateReceiptNo()`、`markPaymentPaid()`、`buildPaymentNoticeText()`、`buildReceiptHtml()`、`buildChurchFinanceExport()`、`getFinanceExportStats()`、`importToChurchFinanceSystem()`（需 UI 確認才寫入 `financeSystemData`）。
  - `manage/finance/tuition.html`：收據編號欄、標記已繳、列印收據；匯出 JSON（financeSystemData 相容）、A3 對帳 CSV、可選「寫入 financeSystemData」；匯出統計列。
  - `portal/my_payments.html`：待繳項「產生繳費通知」（複製文字，標示需人工審核）；已繳項可列印收據。
  - 已繳學費匯出後以 `exportedToChurchFinanceAt` 標記，避免重複匯出。
  - 靜態測試：`tests/test_school_w2.py`（17 項）＋ W0/W1 回歸，全部通過。
- 2026-07-26 · **W3 完工**（學年／招生簡章／可列印證書）：
  - 資料層（W3 區塊）：`meta.academicYears`／`currentSemesterId`／`certificates[]`；`getDefaultSemester()`、`buildEnrollmentBrochureHtml()`、`checkCourseCompletion()`、`issueCertificate()`、`buildCertificateHtml()` 等。
  - `manage/academic_settings.html`：學年／學期管理＋設為目前學期。
  - `enrollment_brochure.html`：招生簡章預覽／列印；文案 key `school_html_editor_enrollment_brochure`。
  - `manage/graduation_certificates.html`：候選名單、核發、列印證書。
  - `manage/system_tabs.html` 加「📅 學年學期」Tab；`manage/grades_tabs.html` 加「🎓 結業證書」Tab；`sidebar.html`／`dashboard.html` 加招生簡章與學期摘要。
  - `manage/finance/tuition.html`、`portal/index.html` 選課／學費預設學期改 `getDefaultSemester()`，移除硬編碼 `2024-2`／`2025-1`。
  - `course_completion.html`：接成績及格判定＋核發列印證書＋保留 CentralMemberDB 回寫。
  - 靜態測試：`tests/test_school_w3.py`（新建）＋ W0/W1/W2 回歸。
- 2026-07-26 · **W4 完工**（課表／小測 UI）：
  - 資料層：`property.rooms[]`（簡版教室）、`getWeeklyTimetable()`、`detectScheduleConflicts()`（教師／教室衝堂）、`addCourseSchedule()`；`addExam()`、`getExamCandidates()`、`batchSaveExamGrades()`（小測批量登分）。
  - `manage/courses/schedule.html`：週課表（全部／教師／教室視角）、衝堂紅色標示、新增排課。
  - `manage/grades/exams.html`：建小測 → 載入選課名單 → 一鍵批量登分。
  - `manage/courses/index.html`：C 區備課工具連結（`edu_teaching.html`，`bible100ShellNav`）；移除自動 `ensureSeedFull()`。
  - `manage/grades/index.html`：移除自動 seed（W0 治理）。
  - Tab／儀表板／側欄：課程 Tab「📅 週課表」、成績 Tab「📝 小測／考試」。
  - 靜態測試：`tests/test_school_w4.py`（新建）＋ W0–W3 回歸。
- 2026-07-26 · **W5 完工**（物業：場地／租約／維修）：
  - 資料層擴充 `schoolMasterDatabase.property`：`rooms[]`（自有／租用、月租、合約到期）、`bookings[]`、`maintenance[]`；`updateRoom()`、`getLeaseAlerts()`、`getPropertyStats()`、`addBooking()`／`cancelBooking()`、`addMaintenanceTicket()`／`updateMaintenanceStatus()`（reported → in_progress → done）。
  - `manage/property/index.html`：一頁式場地、預約、維修管理＋租約 90 天提醒橫幅。
  - `manage/property_tabs.html`、側欄、儀表板（含租約提醒卡）。
  - `manage/courses/index.html` 排課教室下拉改接 `getRooms()`（與週課表一致）。
  - 靜態測試：`tests/test_school_w5.py`（新建）＋ W0–W4 回歸。
- 2026-07-26 · **W6 完工**（教會連結：名冊對齊／缺席→牧養預填）：
  - 資料層：`buildRosterAlignmentReport()`（主日學↔學校三欄＋未連結統計）、`listSchoolAbsenceWarnings()`／`listEducationAbsenceWarnings()`、`buildAbsencePastoralPrefills()`、`queueCrmIntentPrefills()`（`bible100_crm_intent_v2_pending`）、`routeCrmIntentFromQueue()`、`pushTeacherSkillsToSmartMinistry()`（`SmartMinistryCanonical.setTalentSkills`）。
  - `manage/church_link/index.html`：名冊對齊、缺席掃描→CRM 預填佇列、開啟探訪跟進表單、教師技能回流。
  - `manage/church_link_tabs.html`、側欄、儀表板、`module_integration.html`、`teachers/index.html` 連結。
  - 靜態測試：`tests/test_school_w6.py`（新建）＋ W0–W5 回歸。
- 2026-07-26 · **W6.1 調整**（缺席門檻／探訪欄位對齊）：
  - `meta.churchLink`：`getChurchLinkSettings()`／`setChurchLinkSettings()`（門檻預設 3，對齊主日學 `ABSENCE_ALERT_COUNT`；高優先 5；探訪到期 +3 天；家長 fallback）。
  - `buildAbsencePastoralPrefills()` 預填 `reason`／`priority`／`due_date`／`note`，對應 `visitation_followup` 表單欄位；`_resolvePastoralMemberForWarning()`。
- 2026-07-26 · **W7 完工**（家長通知草稿）：
  - 資料層：`buildParentNoticeDraft()`、`saveParentNoticeDraft()`、`listParentNoticeTypes()`（繳費／缺席／活動／一般；copy_only）。
  - `manage/communication/parent.html` 改版為 W7 草稿產生器；移除自動 seed。
  - 靜態測試：`tests/test_school_w7.py`（新建）＋ W0–W6 回歸。
- 2026-07-26 · **W8 完工**（AI Prompt 生成器）＋**營運 SOP 手冊**：
  - 資料層：`listSchoolAiPromptTypes()`、`buildSchoolAiPrompt()`、`getStudentGradeSummary()`（enrollment_promo／grade_comment／exam_questions／notice_translate；含護欄、copy_only）。
  - `manage/ai_prompts/index.html`、`manage/ai_prompts_tabs.html`；招生簡章、小測、儀表板、側欄入口。
  - **`docs/SCHOOL_OPERATIONS_SOP_HANDBOOK.md`**：SOP-1～9 完整逐步手冊（路徑表、完成標準、W8 附錄）；主 SOP 第五部分同步 W0–W8 摘要。
  - 靜態測試：`tests/test_school_w8.py`（新建）＋ W0–W7 回歸。
