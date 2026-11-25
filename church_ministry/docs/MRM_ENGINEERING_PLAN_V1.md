# MRM 事工關係管理 · 工程計畫 V1

> **日期**：2026-11-24 · **範圍**：`church_ministry`（含 AI Lab 場景）  
> **狀態**：P0 ✅ 本文件 · P1 ✅ 程式、靜態測試、本機 HTTP 瀏覽器驗證完成（待 `file://` 人工驗收與牧者演練）· P2 ✅ 程式與自動測試完成（待 `file://` 真實點擊驗收；頁面已依小白視角修訂）· P3 ✅ 第一批完成（領袖培育路徑）· P4 ✅ 第一批完成（排班檢查、見習帶領包、Google 連結設定檔）· P5 ✅ 第一批完成（口語查詢、表單轉會友草稿；匹配口徑未做）· P6 ✅ 第一批完成（檔位套用、備份還原、操作紀錄與全站審計；多人同步未做）· P7 未開始  
> **相關**：[`CHURCH_CRM_BLUEPRINT.md`](./CHURCH_CRM_BLUEPRINT.md) · [`CRM_ENGINEERING_PHASES.md`](./CRM_ENGINEERING_PHASES.md) · [`MEMBER_DATA_MODEL.md`](./MEMBER_DATA_MODEL.md) · [`ATTENDANCE_GOVERNANCE.md`](./ATTENDANCE_GOVERNANCE.md) · [`docs/governance/PRODUCT_CONSTITUTION_V1.md`](../../docs/governance/PRODUCT_CONSTITUTION_V1.md)

---

## 0. 一句話

**系統做事務，人做生命關懷，AI 只出草稿。** 不讓任何一隻羊在行政流程中失落。

對外用語：**事工關係管理（MRM）**。與既有決定一致——廢「CRM」品牌主入口，不另開第二套產品名。

---

## 1. 不變的初心（所有波次的硬約束）

| # | 約束 | 落地方式 |
|---|------|----------|
| 1 | **每個模組可獨立運作** | 紅旗、預警、領袖路徑都不得依賴他模。跨模只用 `member_id` 與具名讀介面；缺少他模時優雅降級，不報錯、不白畫面 |
| 2 | **四檔規模用「檔位」切換，不分叉程式碼** | 微（不滿 50）、小（50–149）、中（150–499）、大（500 以上，以主日平均出席計）共用同一套資料與頁面；只用設定決定顯示哪些功能，功能不刪（見 §1.1） |
| 3 | **小白可實作、可維護** | 設定放單一小檔，記事本可改；不要求命令列、不要求伺服器 |
| 4 | **AI 只出草稿** | 人審才入檔；不自動派工、不自動發送、不作屬靈／紀律／危機判斷 |
| 5 | **敏感資料預設本機** | 代禱、探訪、紅旗、健康等不送外部 AI／雲端，除非用戶明示要求某項遷移 |
| 6 | **一波一主題** | 不同時大改多模組 |

### 1.1 規模檔位（小白參考，設定檔決定）

**檔位定義**：`church_ministry/js/cm_size_tier_config.js`（`CmSizeTierConfig`），記事本可改，不需改程式。

**人數口徑（牧者授權決定，2026-11-24）**：
- 以**主日平均出席人數**計（華人教會慣例），不是會友名冊總數。
- 邊界「下限含、上限不含」：剛好 50 人算小、剛好 150 人算中、剛好 500 人算大（對應華人教會常說的「滿 150 進入中型、滿 500 進入大型」）。

| 檔位 | 主日平均出席 | 預設開啟 | 預設收起（可「更多」展開） |
|------|--------------|----------|----------------------------|
| 微 | 不滿 50 人 | 名冊、預警、紅旗、AI 草稿 | 配對、多部門看板、審計 |
| 小 | 50–149 人 | 加：新人漏斗、排班建議 | 多分堂權限 |
| 中 | 150–499 人 | 加：跨部門 360、每週 PDCA 摘要 | 多堂點隔離 |
| 大 | 500 人以上 | 全開 | — |

- **紅旗永遠開啟，不分檔位**（安全不隨規模縮減）。
- **缺席預警的未聚會門檻預設 14 天**也從同一設定檔讀取（可選 7／14／21／28）。
- 此檔位是**給小白對號入座的參考**；檔位只決定預設顯示，不影響資料。
- **全站口徑已統一**（舊的「微 ≤80／小 81–250／中大型 251+」與 SWOT 頁的「<30／30–120／120–400／400+」已移除）：
  - 教會事工：`church_size_nav.js` 標籤、`church_main_rail.html` 改為四顆按鈕（微／小／中／大）、七個部門工作台與 AI 草稿頁的規模文字。
  - 教會規劃：只有三條路線圖，維持「微型／小型／中大型」，數字改為 不滿 50／50–149／150 以上。
  - 共用鍵 `b100_planning_preview_size` 的值空間為 `micro | small | medium | large`。規劃頁讀到 `medium` 時**使用「中大型」路線圖，但不覆寫鍵值**（避免教會事工選了「中」被規劃頁改回「微」）。
- 「缺席預警」頁讀此設定檔的 14 天門檻。**P6 起**，部門顯示（`visible_depts`）、功能收起（`FEATURES`）與提示文字也都由此檔決定，`church_size_nav.js` 只是讀取者（見 §5.8）。

---

## 2. 討論歸納（分類清單）

### A. 直接採用（我們缺，值得做）

| 項目 | 對應波次 |
|------|----------|
| 紅旗清單與人工標記（不經 AI） | **P1 ✅** |
| 協談情境的安全自檢閘門 | **P1 ✅** |
| 預警狀態機（待處理／已認領／已完成／暫緩）並回寫事件 | P2 |
| 可調門檻（未聚會天數、新人 3／7 日），預設由牧者定 | P2 |
| 每週 PDCA Check 摘要（系統產出，人填 Act） | P2 |
| 見習小組長（用**角色欄位**，不改五階枚舉） | P3 |
| 晉升條件清單與影隨紀錄 | P3 |
| 表單 → 會友檔案入庫（藍圖 A4） | P5 |
| 排班規則補強（衝突檢查、次數平衡，僅作建議） | P4／P5 |

### B. 已有，只需強化

360 時間軸（`getMember360Timeline`）· 事件流（`pastoral_events_v1`）· 五階屬靈階段與 `suggestStagePromotion` v1 · 新人 3 日 SLA · R1 預警 · AI 草稿 `human_confirmed`（`church_ai_pastoral_draft.js`）· AI Lab 場景與 `B100PromptGuardrails` · 四語機制（`b100_chrome_i18n.js`）· 快速查詢 chip · 同工交接（`tools/ministry_handover`）· 金齡安全門 · 規模導覽 `B100ChurchSize`。

### C. 補充（外部材料沒講，我們要加）

1. 恩賜／崗位**匹配分數口徑統一**（Smart Ministry 主線、`matching_algorithm.js`、`church_planning` CTV 三套並存）。
2. **全站操作審計**（目前 `js/` 內僅見於 `hub_base` 相關檔，需確認）。
3. 分區說法統一（頂欄 A–G／總羅盤 A–H）。
4. vi／id 譯文校對流程（目前機器草稿，不可視為正式）。
5. 備份與匯出說明（本機模式清瀏覽器＝資料風險）。

### D. 有啟發（差異化）

- 離線／USB／`file://` 可用——多數競品為雲端 SaaS，這是隱私敏感小教會的賣點。
- 恩賜匹配「為什麼是這個分數」可解釋，並明寫**非考核**。
- 見證與門訓材料作為生命檔案事件，附件留本機。
- PDCA 從工具頁升為每週節奏。
- 屬靈邊界做成**介面結構**（草稿區 vs 正式紀錄區、危機閘門），不只是口號。

### E. 不採用及原因

| 做法 | 原因 |
|------|------|
| 代禱送外部 AI 判讀緊急度 | 敏感資料不外送；AI 漏判有安全風險 |
| 自動派工、自動分配組長、自動推送 | 與「配對不自動派工、通知預設人工發送」衝突 |
| 自動識別情緒／屬靈狀態 | 與 AI 不作屬靈判斷衝突 |
| Next.js、Cloudflare Worker／D1／R2、n8n 整套 | 與現行靜態架構、`file://` 驗收衝突 |
| 獨立 `ministry-toolbox.html` | 與 AI Lab 場景重複；併入 `ai_scenario_ssot.js` |
| 「全球首套」「無任何成品」等宣稱 | 無法核實，不入對外文件 |

---

## 3. PRD v1.1 修正對照

外部 PRD 草案可借**結構**（使命、四層看板、輸入輸出、PDCA、權責），但落地前須修正：

| # | 草案內容 | 修正 |
|---|----------|------|
| 1 | Next.js + Cloudflare + n8n + LLM 全上雲 | 維持現行靜態架構；雲端為選配（CRM-5 試驗版、需明示） |
| 2 | 表單、出席、探訪、禱告自動流入雲端與 LLM | 敏感資料預設本機；外送須用戶明示並附同意提示 |
| 3 | AI 自動風險評分（冷淡、邊緣、情緒） | 改為**規則提示 + 人工標記**；AI 不生成人的狀態標籤 |
| 4 | 自動分派組長、自動排班、自動推送 | 改為**系統建議、人確認、人發送** |
| 5 | 「全球首套」「取代 CRM／Excel」 | 刪除；匯入匯出仍需 Excel／Sheets 過渡 |
| 6 | 「零人工填報」「AI 自動 360 檔案」 | 改為「減少重複填報」「經人確認的生命檔案」 |

PRD 的「三大牧養問題」可保留作看板語言：**發生了什麼？意味著什麼？該做什麼？**——前兩問由系統呈現事實，第三問由人決定。

---

## 4. 波次與進度

> 進度依文件與程式讀取判斷；P1 為本輪實作。**成熟度稽核（2026-07）可能已過時。**

| 波 | 對應區 | 主題 | 交付 | 狀態 |
|----|--------|------|------|------|
| **P0** | 全區 | 治理與定名 | 本文件、PRD 修正對照、初心約束 | ✅ 完成 |
| **P1** | B | 安全底線 | 紅旗路徑、協談閘門、去識別／危機護欄 | ✅ 程式、測試、HTTP 瀏覽器驗證完成；⏳ `file://` 人工驗收、牧者演練 |
| **P2** | B、G、H | 牧養閉環 | 紅旗狀態機、可調門檻（14 天）、每週 Check 摘要 | ✅ 程式與自動測試完成；⏳ `file://` 真實點擊驗收；7 日節點未做（見 §6） |
| **P3** | C | 領袖管道 | 見習角色、晉升條件 v2、影隨事件、小白版路徑頁 | ✅ 第一批程式與自動測試完成（見 §5.4）；⏳ `file://` 試用；事奉指派日期條件、跨模組讀取未做 |
| **P4** | E、C | AI 場景整合 | `apprentice_kit`、`shift_rules`；Google 連結設定檔；文案進 i18n pack | ✅ 第一批程式與自動測試完成（見 §5.5）；⏳ `file://` 試用；vi／id 草稿待校 |
| **P5** | A、D | 查詢與入庫 | 口語轉篩選、表單→會友草稿、匹配口徑統一 | 🟡 口語查詢、表單→會友草稿 ✅ 第一批完成（見 §5.6、§5.7）；⏳ `file://` 試用；**匹配口徑統一未做** |
| **P6** | 全區 | 微教會版與上雲 | 規模檔位套用、備份說明與還原、操作紀錄、全站審計；多人同步（v2） | ✅ 第一批完成（見 §5.8、`SITE_AUDIT_P6.md`）；⏳ `file://` 試用；**多人同步未做（須用戶明示）**；P6 後續四項（財務頁、備份加密、PDCA 摘要、探訪兩頁）已完成；3 個功能代碼尚無對應畫面 |
| **P7** | 全區 | 驗收與推廣 | 非技術維護手冊、種子同工手冊 | 🟡 部分（試用導覽頁已有） |

### 4.1 A–H 區對照（依羅盤現行區名）

| 區 | 現行區名 | 本計畫對應工作 | 波次 | 狀態 |
|----|----------|----------------|------|------|
| **A** | 崇拜聖樂 | 恩賜到崗位的匹配（匹配口徑統一） | P5 | 🟡 chip 與口語查詢已有（P5）；三套分數口徑尚未收斂（刻意未動） |
| | ↳ 註 | **F 樂以載道**：頂欄獨立模組（`config/modes.json`、`config/modules.json`），**不排入本計畫**。羅盤 F 磚塊僅為換側欄入口，列在此處只作對照。 | — | — |
| **B** | 牧養關懷 | 紅旗與預警閉環 | P1、P2 | ✅ 紅旗、狀態、門檻完成；缺席預警未進狀態機 |
| **C** | 教育培訓 | 成長軌跡與晉升條件（含見習角色） | P3、P4 | ✅ 見習→影隨→牧者同意晉升路徑頁完成（P3 第一批）；事奉指派日期條件未做 |
| **D** | 宣教外展 | 表單入庫（表單→會友草稿） | P5 | ✅ 第一批完成：貼上表單回覆→草稿→人確認→才入名冊（見 §5.7）；不連 Google、不匯入代禱 |
| **E** | 社關服事 | 排班規則（衝突檢查、次數平衡，僅作建議） | P4 | ✅ 第一批完成：⑦ 排班檢查頁（見 §5.5）；自動排班、技能比對未做 |
| **G** | 規劃行政 | 每週 Check 摘要與看板 | P2 | 🟡 文字摘要完成；看板與 PDCA 頁連結未做 |
| **H** | 出席系統 | 缺席資料來源 | P2 | 🟡 門檻可調完成；來源仍為小組出席的連續缺席週數 |

---

## 5. P1 規格（已實作）

### 5.1 紅旗路徑

| 項目 | 內容 |
|------|------|
| 設定檔 | `church_ministry/js/cm_red_flag_config.js`（`CmRedFlagConfig`）。**記事本可改** `DEFAULT_FLAGS` |
| 面板邏輯 | `church_ministry/js/cm_red_flag_panel.js`（`CmRedFlagPanel`） |
| 入口 | B 區「缺席預警」頁最上方紅旗卡：`modules/fellowship/pastoral_alerts_panel.html` |
| 預設清單 | 住院／重病、喪親、失業／經濟急難、提到想傷害自己（危機）、家暴／人身安全（危機）、兒童或長者受虐（危機） |
| 操作 | 選會友（可略）→ 勾選類別 → 「標記紅旗並產生通知稿」→ **複製**後由人交給至少 2 位牧者／同工 |
| 寫入 | `ChurchDataBridge.appendPastoralEvent`，`event_type: "red_flag"` |
| 不做 | 不呼叫 AI；不收自由文字備註；不自動發送；不分檔位（永遠顯示） |

**降級行為（獨立運作）**：

- 缺 `ChurchDataBridge` 或寫入失敗 → **通知稿仍產生**，並提示先通知牧者。
- 缺 `CmMemberPicker` 或名單為空 → 仍可只產生通知稿。
- 瀏覽器無 `navigator.clipboard`（含部分 `file://` 環境）→ 改用 `execCommand("copy")`；仍失敗則提示手動複製。

### 5.2 AI 協談閘門

| 項目 | 內容 |
|------|------|
| 情境 | `counsel_boundary`（`js/ai_scenario_ssot.js`），**非** featured，位於「更多情境任務」 |
| 閘門 | 勾選自傷／家暴／虐待／性侵任一項 → **不產生、不可複製、不可存範本、不可送去平台**，顯示「改由人處理」 |
| 通過 | 全部不勾 →「以上皆無，產生提示詞」→ 經 `B100PromptGuardrails.wrap` 附護欄 |
| 通過後再勾選 | 立即撤回提示詞並重新封鎖 |
| 實作 | `ai_tools/js/ai_prompt_workbench.js`（`renderGate`／`loadScenario`／`state.blocked`）；樣式 `ai_tools/css/ai_workbench_shell.css` |
| 入口 | 點情境按鈕與 `?scenario=counsel_boundary` 皆走同一閘門 |
| 刻意 | **不寫死任何地區熱線電話**，改為「聯絡牧者或當地專業協助／緊急服務」，由各教會自行補充 |

> 閘門是**自我回報**，不是診斷；它的作用是讓危機情境不被導向 AI，而不是判斷危機。

### 5.3 資料契約（新增事件類型，向下相容）

`pastoral_events_v1` 新增 `event_type: "red_flag"`（`js/church_crm_constants.js`；`schema_version` 不變，僅新增值）。

| 欄位 | 說明 |
|------|------|
| `member_id` | 對齊中央會友（必填，與既有事件相同） |
| `summary` | 類別標籤以「、」連接，**不含自由文字細節** |
| `source_module` | `pastoral_alerts_panel` |
| `metadata.flags` | 勾選的 flag id 陣列 |
| `metadata.crisis` | 是否含危機類別 |
| `metadata.human_marked` | 恆為 `true`（人工標記） |
| `metadata.notify_min` | 至少知悉人數（預設 2） |

### 5.4 驗收

1. `file:///C:/Users/hlche/.cursor/bible100_new/index.html` → 教會事工 → B 區 → **缺席預警**：最上方見紅旗卡；勾「提到想傷害自己」→ 標記 → 通知稿含「危機情境」安全提示；按「複製通知稿」可貼上。
2. 不選會友也可產生通知稿，並提示「未寫入紀錄」。
3. AI Lab → 更多情境 →「組員向我傾訴難處」：未自檢時結果區顯示請先自檢，**複製鈕被擋**；勾任一項 → 紅框「請停止使用 AI」；全不勾按確認 → 才出現提示詞。
4. 強刷 **Ctrl+F5**（ssot 版本字串已更新為 `20261124p1`）。
5. 本波未動 `config/*.json`，**不需** `generate_config_embedded.js`。

```powershell
python church_ministry/tests/test_cm_red_flag_p1.py
python church_ministry/tests/test_cm_chrome_i18n.py
python ai_tools/tests/test_ai_lab_w0_w6.py
python tests/test_unified_navigation.py
python tests/test_index_v5_shell.py
```

### 5.4 P3 規格（領袖培育路徑 · C 區，第一批已實作）

| 項目 | 內容 |
|------|------|
| 入口 | C 區「③ 門訓」Tab 底部連結 →`modules/education/leader_path_panel.html`（在同一 iframe 內開啟，頁首有「回③門訓」） |
| 設定檔（記事本可改） | `js/cm_leader_path_config.js` 最上方 `CRITERIA`：見習 90 天、影隨 3 次、要求已受洗（可關） |
| 事件類型 | `leader_path`；`metadata.step` ∈ `invited`／`apprentice`／`shadow`／`paused`／`promoted`；一律 `human_marked: true` |
| 階段由事件推導 | 尚未開始／已邀請／見習中／暫停中／已晉升；**不新增會友欄位、不動五階** `spiritual_journey_stage` |
| 天數規則 | 見習天數＝各段「見習中」時間相加；**暫停期間不計**；見習前的影隨不算；已晉升後的紀錄不再改變狀態 |
| 補登 | 日期可選過去日期（補登已在見習的人）；不可晚於今天 |
| 晉升 | 系統只列條件與「條件已齊」提示；最後一步由牧者按「牧者同意晉升為小組長」並二次確認；條件未齊仍可記錄（牧者決定），但確認文字會列出缺哪幾項 |
| 不做 | 不自動晉升、不寫入會友資料、不連網、不呼叫 AI |
| 獨立運作 | 缺 `ChurchDataBridge` 時只顯示說明並提示，不報錯 |
| 測試 | `church_ministry/tests/test_cm_p3_leader_path.py` |

### 5.5 P4 規格（E 排班規則、見習帶領包、Google 連結設定檔 · 第一批已實作）

| 項目 | 內容 |
|------|------|
| 排班檢查入口 | E 區「義工智能排班」工具新增分頁 **⑦ 排班檢查**：`church_ministry/tools/volunteer_shift/rules_check.html`（頁首有「30 秒看懂」） |
| 規則設定檔（記事本可改） | `js/cm_shift_rules.js` 最上方 `RULES`：檢查未來 30 天、每人每週最多 2 次、每月最多 4 次、7 天內未確認會提醒、次數高於平均 1.5 倍（且至少多 2 次）提醒不平均、至少 3 人才比平均 |
| 檢查項目 | 重要：同時段重複排、請假無人代班；注意：一週／一個月排太多次、快到了還沒確認、人數不足（崗位有 `needPeople` 才檢查）；參考：次數不平均。週以**週一**為起點 |
| 請假處理 | 已換班用代班者計算；請假無代班者視為「無人」，不計入負擔 |
| 只讀 | 只讀 `getVolunteerData()`；不改排班、不通知、不連網、不呼叫 AI；缺底座時降級並提示；日期不正確的資料略過並於報告註明筆數 |
| 輸出 | 可複製「檢查報告」（純文字，結尾聲明由事工負責人決定）；可複製「規則附註」貼到 AI 提示詞後面 |
| AI 情境 | `shift_voice`（口述排班）提示詞補上規則清單（同人同時段不重複、每週／月上限、請假不排、缺額標「缺 N 人」、不自動通知、用貼上的名單或「人選待補」、不填真實電話／隱私）；新增 `apprentice_kit`（見習帶領包：流程時間表標示見習者／老手負責段、討論三問、備課清單、影隨觀察重點、會後回饋三問、紅線提示、AI 草稿須審核、不決定晉升、勿填真實姓名） |
| 見習帶領包入口 | 領袖培育路徑頁 `leader_path_panel.html` 新增 ③ 區：開啟 `apprentice_kit` 的連結＋見習回饋表單連結 |
| Google 連結設定檔 | `js/cm_google_links_config.js` 的 `LINKS`（排班試算表／可服事時段表單／見習回饋表單／新人登記表單）；**空白顯示「尚未設定」**；只接受 `https://` 且網域在允許清單（`docs.google.com`、`forms.gle`、`forms.google.com`、`drive.google.com`、`sheets.google.com`）；含空白、帳密、偽網域（如 `docs.google.com.evil.com`）一律當作格式不對；只放連結，不傳任何本機資料（v2 Sheets 仍須用戶明示） |
| 多語 | 文案鍵 `cm.p4.*`（22 條）進 `cm_chrome_i18n_pack.js`；zh-Hant、en 為正式；**vi／id 為機器草稿，草稿待校**，頁面在 vi／id 時顯示「待人工校對」。檢查結果的動態句子（每條提醒）目前僅繁中；領袖培育路徑頁 P3 原有文字尚未多語（只有 P4 新增區塊進 pack，頁面不放語言列，沿用其他頁已選的語言） |
| 測試 | `church_ministry/tests/test_cm_p4_shift_rules.py` |
| 未做 | 取向偏好／技能比對排班、自動排班、時段衝突以外的跨崗位限制（例如連續主日）、規則依規模檔位分檔、檢查結果多語、見習回饋表單回收（屬 v2） |

### 5.6 P5 規格（口語查詢，第一批已實作）

| 項目 | 內容 |
|------|------|
| 入口 | B 牧養工作桌（`modules/fellowship/pastoral-integrated.html`）快速查詢鈕下方新增「用一句話查」輸入框 |
| 原則 | **只對應到既有的快速查詢鈕**（缺席≥2 次、流失預警、未入小組、新朋友、待推送探訪），不自創篩選、不自己算分數；結果仍由原本的 `queryQuickFilter` 產生，**只列名單**（chip 與一句話共用 `runFilter`） |
| 詞庫（記事本可改） | `js/cm_voice_query.js` 的 `INTENTS`（每個查詢的字詞，含常見粵語、簡體寫法）、`ACTION_WORDS`、`SAFETY_WORDS` |
| 聽不懂 | 老實說「沒聽懂」並請按快速查詢鈕；一句話同時像兩個以上查詢（例如「新朋友沒來」）→ **不替使用者猜**，列出候選請他按鈕 |
| 動作字眼 | 「通知、發訊息、派、刪除、新增…」只提醒「這裡只會列名單，不會代你…」，不執行任何動作 |
| 次數 | 說到「缺席 3 次」等非 2 的次數時，提醒目前只有固定的「缺席≥2 次」篩選，不另算 |
| 時間字眼 | 說到「這個月、上週、最近」等：提醒快速查詢**不依日期篩選**，列的是目前狀況（避免使用者以為已按日期過濾） |
| 危機字眼 | 自殺、家暴、虐待、性侵、人身安全等：**不列名單**，請立即聯絡牧者（與 P1 協談閘門同一方向） |
| 隱私 | 輸入的句子不存檔、不連網、不呼叫 AI |
| 同時修正 | 查無名單時的提示由粵語改為書面語（原「暫時冇符合條件嘅人」）；該頁其餘粵語文案未動 |
| 測試 | `church_ministry/tests/test_cm_p5_query_intake.py`（口語部分） |

### 5.7 P5 規格（表單回覆 → 會友草稿，第一批已實作）

| 項目 | 內容 |
|------|------|
| 入口 | 會友檔案頁（`member-integrated.html`）按鈕「📋 表單回覆轉會友草稿」→ `modules/members/member_form_intake.html`（頁首有「30 秒看懂」） |
| 流程 | Google 表單「在試算表中查看」→ 全選複製（含標題列）→ 貼上 → 整理成草稿 → **人逐筆確認** → 才寫入會友名冊 |
| 草稿 ≠ 會友 | 確認前不寫入名冊；草稿存在 `bible100_cm_member_drafts_v1`（本機，含個資，須清空）；貼上的原始內容整理後立即清掉、不存檔 |
| 唯一寫入路徑 | 只經 `ChurchDataBridge.saveMemberSystemData`（受 `members.write` 權限約束，無權限會提示）；會友編號沿用名冊現行做法（數字最大值＋1），不另造 ID 體系；核心檔 `cm_member_intake.js` 不含任何寫入 |
| 欄位對照（記事本可改） | `js/cm_member_intake.js` 最上方 `HEADER_ALIASES`：姓名、電話、電郵、性別、生日、地址、介紹人、備註、時間戳記；標題「包含」這些字就算 |
| 敏感欄位 | 標題含代禱、病痛、身分證、奉獻、輔導等字：**一律不匯入**，並在畫面列出「未匯入的欄位」；看不懂的欄位也不匯入 |
| 資料整理 | 電話去除空格與符號（位數不合理就清空並提醒）；電郵格式不對就清空並提醒；生日只收「年-月-日」類寫法（日月順序有歧義的一律不收）並算年齡；未來日期不採用；初來日期取表單時間戳記，沒有則為今天 |
| 查重 | 對名冊與同一批：電話（相同或後 8 碼相同）或電郵相同＝「疑似重複」，**預設不加入**，須按「我確認不是同一人，仍要加入」並二次確認；只同名＝「請確認」；寫入前會再查一次名冊 |
| 狀態 | 可加入／請確認／疑似重複／無法建立（沒有姓名）；可一次加入全部「可加入」的草稿（有確認視窗） |
| 屬靈階段 | 由人在畫面選（預設「新朋友／慕道友」），系統不判斷；會友狀態沿用現行預設，入會日期留空、未受洗，由同工日後補 |
| 不做 | 不連網、不呼叫 AI、不自動聯絡新朋友、不自動分派、不從 Google 直接拉資料（v2 須用戶明示）、不匯入代禱 |
| 測試 | `church_ministry/tests/test_cm_p5_query_intake.py`（表單部分） |
| 未做／留待 | **匹配口徑統一**（Smart Ministry、`matching_algorithm.js`、`church_planning` CTV 三套分數）本批刻意未動，須先收斂口徑再談新功能；P5 新增文案尚未進 i18n pack（僅繁中）；草稿匯入不寫入 `pastoral_events_v1` 事件；表單範本（建議的問題標題）未提供 |

### 5.8 P6 規格（檔位套用、備份還原、操作紀錄，第一批已實作）

| 項目 | 內容 |
|------|------|
| 檔位套用 | `cm_size_tier_config.js` 新增每檔 `visible_depts`、`fold_advanced`、`show_large_tip`、`hint_zh`，與 `FEATURES`（功能從哪一檔起預設顯示）＋`featureVisible`／`deptVisible`；`church_size_nav.js` 改讀設定檔（沒載入時用內建後備表），並支援 `data-size-feature` |
| 套用範圍 | 教會主航道（部門磚塊依檔位）；七個部門工作台（A／B／C／D／E 社會／F／G）的「深鏈工具」：排班、跟進、配對、戰情、操作紀錄依 `FEATURES` 收起，並有「顯示更多工具」按鈕（只在真的有收起時才出現）。**功能不刪**；紅旗、預警、名冊、AI 草稿、備份永遠顯示 |
| 備份 | `modules/admin/backup_restore.html`＋`cm_backup_config.js`（白名單，小白可加一行）＋`cm_backup.js`（純函式）＋`cm_backup_panel.js`；下載 JSON、選檔還原；還原前驗證、人確認、自動下載「還原前備份」；驗證失敗一個都不寫；僅動白名單 key；頁首「30 秒看懂」、個資保管提醒、file:// 與網址是兩份資料的說明 |
| 備份提醒 | 有會友資料且超過 30 天（`REMIND_AFTER_DAYS`）未備份，教會主航道顯示一行提醒；「上次備份時間」只存本機，不進備份檔 |
| 操作紀錄 | `modules/admin/audit_log.html`＋`cm_audit_view.js`＋`cm_audit_panel.js`；唯讀、白話、可依分類／時間／關鍵字篩選，匯出 CSV（防公式注入）／JSON；只顯示白名單欄位（無金額、姓名、電話）；需 `crm.admin` |
| 審計欄位 | `ChurchDataBridge.logActivity` 新增 `actor`（只記角色）；備份下載／還原各記一筆；既有紀錄不受影響 |
| 全站審計 | `SITE_AUDIT_P6.md`：繞過橋接層的直接寫入基線（現剩 3 個「有橋接層就走橋接層、缺席才後備直寫」的檔）＋測試防止新增；備份白名單與審計白話皆有「橋接層新增了卻沒登記」的漂移測試 |
| P6 後續 ① 舊財務頁 | `financial-management.html` 改為只經橋接層（新增／作廢記操作紀錄、不再自動載入示範資料、輸出跳脫、CSV 防公式注入）；橋接層 `saveFinanceTransaction`／`softDeleteFinanceTransaction` 加 `finance.write` 檢查；舊獨立帳可在頁面上**確認後一次性匯入**（示範資料不匯入、舊資料不刪）；**修了橋接層舊 bug**：舊格式不再被整包搬進正式帳並刪除原檔 |
| P6 後續 ② 備份加密（可選） | `cm_backup_crypto.js`：密碼 → PBKDF2（250,000 次）→ AES-GCM；勾選才加密；兩次輸入、至少 8 字；**忘記密碼無法補救**（頁面三處說明）；密碼不存檔、不寫入紀錄；還原加密檔要先解密、錯密碼或被改動會擋下；原檔是加密時，「還原前保險備份」也用同密碼加密 |
| P6 後續 ③ PDCA 摘要 | 戰情 dashboard 的「PDCA Check 草稿」面板標 `weekly_pdca`（中型堂起預設顯示，微／小有按鈕展開）。**紅旗頁的「複製本週摘要」屬安全路徑，刻意不收起** |
| P6 後續 ④ 探訪兩頁 | `modules/support/visitation.html` 移除直寫後備；`projects/visitation_site/visitation.html` 改載橋接層（原本自成一桶，現與教會事工共用同一份探訪資料）；橋接層 `saveVisitationData` 加 `visitation.write` 檢查 |
| P6 後續測試 | `church_ministry/tests/test_cm_p6b_followups.py` |
| 測試 | `church_ministry/tests/test_cm_p6_tier_backup_audit.py` |
| 未做／留待 | 見 §6 P6 條與 `SITE_AUDIT_P6.md` §5 |

---

## 6. 後續波次要點（尚未實作）

- **P2 未完成項**：缺席預警（非紅旗）仍沿用探訪佇列的既有狀態，未納入 `alert_id` 狀態機；7 日節點未做；每週 Check 摘要尚未連到 `church_planning` 的 PDCA 頁（目前是可複製的文字）。
- **P3（第一批已完成，見 §5.4）**：原定「會友資料加角色欄位」改為**由事件流推導**（避免第二套人員真相、不動五階）。尚未做：晉升條件納入「事奉指派日期」、跨模組（智慧事奉）讀取見習狀態、領袖名單的每週摘要。
- **P4（第一批已完成，見 §5.5）**：`apprentice_kit`、排班規則檢查（補強 `shift_voice`）、Google 連結設定檔、`cm.p4.*` 文案。尚未做：檢查結果多語、規則依規模檔位分檔、見習回饋表單回收。
- **P5（第一批已完成，見 §5.6、§5.7）**：口語查詢只轉成既有篩選、只回名單；表單→會友草稿。尚未做：**匹配口徑先收斂再談新功能**（三套分數）、P5 文案進 i18n pack、草稿匯入寫入事件流、建議的表單問題範本。
- **P6（第一批已完成，見 §5.8）**：檔位套用、備份還原、操作紀錄、繞過橋接層基線。後續四項（財務頁、備份加密、PDCA 摘要、探訪兩頁）已完成。尚未做：多人同步（v2，**須用戶明示**）、審計防竄改（須有伺服器）、`cross_dept_360`／`multi_campus_permission`／`multi_service_isolation` 三個功能尚無畫面可收起、基線剩 3 個後備直寫檔、P6 文案進 i18n pack。

---

## 7. 待決策與風險

**待牧者／產品主人決策**

1. 紅旗預設清單是否增刪（直接改 `cm_red_flag_config.js`）。
2. ~~規模標籤數字（現行 ≤80／81–250／251+）是否沿用~~ → **已決定**：微 不滿 50、小 50–149、中 150–499、大 500 以上，以主日平均出席計，邊界下限含、上限不含（牧者授權，2026-11-24，依華人教會慣例）。
2a. ~~規模按鈕是否改為四檔~~ → **已完成**：教會事工四顆按鈕；規劃維持三條路線圖，`medium` 併入「中大型」且不覆寫共用鍵（見 §1.1）。
3. Google 表單與試算表是否正式啟用（屬 v2，須明示並附同意提示）。
4. vi／id 是否安排當地同工校對。
5. ~~P2 預警門檻預設值（建議 14 天，可調）~~ → **已確認 14 天**（2026-11-24）。內部以連續缺席週數計算，14 天 ≈ 2 週；原預設為 3 週，因此**預設值改動會讓缺席預警提早觸發**。
6. 技術債（見下）是否獨立修復：建議排在 P2 之後另開一波，不與 P2 混做。

**風險**

- 紅旗涉及人身安全：**上線前須牧者實際演練一次「標記 → 複製 → 交給兩位牧者」。**
- 本機資料在清瀏覽器時會消失：~~P6 前須有明確備份說明~~ → **P6 已有備份頁與提醒**（`backup_restore.html`），但**仍須同工真的定期備份**；備份檔含個資且未加密，須像名冊一樣保管。
- ~~舊頁直寫正式資料（探訪、財務）會繞過權限與審計~~ → **已收斂**（財務頁、兩個探訪頁，見 `SITE_AUDIT_P6.md` §4）；基線剩 3 個後備直寫檔。
- 備份加密後**忘記密碼無法補救**；加密為可選，預設不勾。
- **既有技術債（與 P1 驗收分開，非本波改動造成）**：
  - `church_ministry/tests/test_cm_chrome_i18n.py` 有 3 項失敗：`test_sidebar_three_levels_i18n`（側欄缺 `cm.sb.a.folder`）、`test_landing_pages_chrome_i18n`（`church_ministry/_landing/worship.html` 未通過）、`test_dashboard_map_card`（讀取已刪除的 `dashboard_church_layout_v1.html`）。
  - `church_ministry/tests/test_pastoral_data_hub.py` 有 2 項失敗：`test_cross_module_bridge`（`member-integrated.html` 未載入 `pastoral_cross_module_bridge.js`，亦無 `getMemberGrowthTimeline`）、`test_b_waves_b1_b5`（`visitation_index.html` 缺 `onVisitationCompleted`；`youth-ministry-dev.html` 缺 `registerYouth*`；`fellowship/index.html` 缺 `downloadPastoralBundle`／`hub-export-btn`）。
  - 以上檢查的檔案皆不在 P1 改動範圍內。待獨立修復，修前不以此判定 P1 通過或失敗。
- 同時開多波會違反「一波一主題」，請依序進行。

---

## 8. 刻意不做（本計畫範圍）

自動判斷靈命／情緒／風險標籤 · 自動派工與派探訪 · 自動推送訊息 · 認臉 · 把代禱送外部 AI · 整站改框架 · 獨立 toolbox 頁 · 雲端同步（除非用戶明示）。

---

## 9. 變更紀錄

| 日期 | 內容 |
|------|------|
| 2026-11-24 | V1：建立計畫；完成 P0；實作 P1（紅旗路徑、協談閘門、`red_flag` 事件類型、測試） |
| 2026-11-25 | A–H 自檢階段 0＋1：新增 `church_ministry/scripts/cm_zone_scan.py`（頁→區對照＋全頁靜態掃描）、`_cm_js_syntax_batch.js`；產出 `docs/ZONE_PAGE_MAP_V1.md`、`docs/ZONE_STATIC_SCAN_V1.md`、`audit/zone_scan_*`；自測 `tests/test_cm_zone_scan.py`（9 項）；只讀，未改任何頁面 |
| 2026-11-25 | A–H 自檢：先修真壞（8 支 JS 語法／壞引號、global-tools 漏括號、page_capability_badge 的 global 未定義導致約 30 頁徽章失效、7 條斷連結、ai-assistant／visitation／worship 字串）；新增階段 2 動態檢查 `scripts/cm_zone_dynamic.py`（無頭 Edge 逐頁開＋按鈕＋截圖）與 `tests/test_cm_zone_dynamic.py`；靜態掃描擴大到所有共用 JS；B/C/G 動態：90 頁 74 通過／15 提醒／1 硬傷 |
| 2026-11-25 | A–H 自檢階段 2 其餘區＋階段 3＋盲測：全 188 頁動態 ok158／warn27／bad3（3 硬傷已修）；修點名頁 file:// SecurityError（新 `js/pastoral_shell_bridge.js`＋`?embed=pastoral`＋postMessage）；`church_planning` 4 支 JS 的 onclick 內 JSON 雙引號截斷屬性；32 個 modules 子頁 tailwind／fontawesome 路徑；sermon-notes 報告鈕補函式；新增階段 3 跨區流程 `scripts/cm_zone_flows.py`（5 流程 50 檢查點 49✅／1🟡）、中立 AI 盲測包 `docs/BLIND_TEST_PROMPTS_V1.md`＋`audit/stage4/blind_*.md`；動態檢查改為『先截圖後按鈕』並於按完後還原語言偏好（避免污染後續頁）。已知未修：`assets/css/tailwind.min.css` 實為 JS（Tailwind 瀏覽器版）卻當 CSS 載入、FA 字型檔不存在 → 約 30 頁無樣式／圖示成方框 |
| 2026-11-25 | 自檢後續四件事：①示範資料政策——空資料不再偷塞示範：新增 `js/cm_demo_gate.js`（空→顯示「尚無資料」＋按鈕才載入示範；載入後頁頂常駐『示範』提示；刪光重整不會回來）；`PastoralDataHub.ensurePastoralSeed` 只在 `force===true` 才塞（舊行為會覆寫真實小組）；B 牧養殼不再自動載 40 人試用教會；教育面板／會眾筑坛不再自動塞；16 個 modules 頁改走 gate；`fellowship/index` 寫死 3/47/8/85% 改「—」；`volunteer-integrated` 績效分析原為 `Math.random`＋寫死柱狀＋空資料顯示「狀態正常」，改用真實服務時數、空則「尚無資料」。②樣式——`assets/js/tailwind-browser.min.js`（原 `tailwind.min.css` 實為 JS）；先在 `fellowship/index` 試載，其餘 ~30 頁待確認後再換。③字型——補 `assets/webfonts/`（Font Awesome Free 6.4.2，本機已有來源）。④新朋友自助登記 → 自動建立 3 天內關心任務（`NewcomerQrStore.ensureFollowupTask`，type `newcomer_followup`，同人只一張，進牧養任務清單 high）。測試：`tests/test_cm_demo_data_policy.py`（10 項）；`cm_zone_flows` 51/51 全 ✅ |
| 2026-11-24 | P6 後續：① 舊財務頁改走橋接層（含權限檢查、舊帳一次性匯入、修橋接層舊格式搬移 bug）② 備份加密（可選，PBKDF2＋AES-GCM）③ 戰情 dashboard 的 PDCA 面板接上檔位（紅旗週摘要不收起）④ 兩個舊探訪頁改走橋接層（`saveVisitationData` 加權限檢查）；基線由 6 個減為 3 個；測試 `test_cm_p6b_followups.py` |
| 2026-11-24 | P6（第一批）：檔位設定檔擴充（`visible_depts`／`FEATURES`／`hint_zh`），`church_size_nav.js` 改讀設定檔並支援 `data-size-feature`；七個部門工作台深鏈工具依檔位收起並可「顯示更多工具」；新增備份與還原頁（`cm_backup*.js`，白名單、驗證、確認、還原前自動備份、30 天提醒）、操作紀錄頁（`cm_audit_view.js`／`cm_audit_panel.js`，唯讀、白話、匯出防公式注入）；`logActivity` 加 `actor`（只記角色）；`SITE_AUDIT_P6.md` 全站審計基線；測試 `test_cm_p6_tier_backup_audit.py`；多人同步未做 |
| 2026-11-24 | P5（第一批）：B 牧養桌新增「用一句話查」（`cm_voice_query.js`，只對應既有快速查詢鈕、只列名單；動作字眼只提醒、危機字眼不列名單、聽不懂或模稜兩可不猜）；會友檔案新增「表單回覆轉會友草稿」（`member_form_intake.html`＋`cm_member_intake.js`＋`cm_member_intake_panel.js`；貼上→草稿→人確認→才入名冊；敏感欄位不匯入；疑似重複預設擋下；唯一寫入路徑 `saveMemberSystemData`）；測試 `test_cm_p5_query_intake.py`；匹配口徑統一刻意未動 |
| 2026-11-24 | P4（第一批）：E 區新增 ⑦ 排班檢查頁（`rules_check.html`＋`cm_shift_rules.js`＋`cm_shift_rules_panel.js`，只讀、只提醒）；新增 `cm_google_links_config.js`（空白＝尚未設定，只收 https＋Google 網域）；AI 情境新增 `apprentice_kit`、`shift_voice` 補規則；領袖培育路徑頁加 ③ 區（帶領包連結＋見習回饋表單）；`cm.p4.*` 22 條文案進 i18n pack（vi／id 草稿待校）；測試 `test_cm_p4_shift_rules.py` |
| 2026-11-24 | P3（第一批）：領袖培育路徑頁 `leader_path_panel.html`＋設定檔 `cm_leader_path_config.js`＋面板 `cm_leader_path_panel.js`；事件 `leader_path`（邀請／開始見習／影隨／暫停／牧者同意晉升），狀態由事件推導，不動五階、不寫會友資料；條件預設 見習 90 天＋影隨 3 次＋已受洗（可改設定檔）；入口在 C 區「③ 門訓」Tab；測試 `test_cm_p3_leader_path.py` |
| 2026-11-24 | 口徑統一與小白修訂：規模以主日平均出席計、邊界下限含；全站（教會事工＋規劃＋SWOT 頁）舊數字（≤80／81–250／251+、<30／30–120…）全部移除；教會事工規模鈕改四顆；規劃讀到 `medium` 併入中大型路線且不覆寫共用鍵。缺席預警頁以小白身份重寫：頂部「30 秒三步」導覽、廣東話口語改為統一書面語、按鈕改白話（認領→我來跟進、暫緩→先擱置、完成→已處理完、重新開啟→重新打開）、載入試用資料前加確認（會在本機名冊加入約 40 位示範會友） |
| 2026-11-24 | 硬約束更新：§1 第 1、2 條改為牧者指定文字（獨立運作、四檔不分叉）；新增 `cm_size_tier_config.js`（四檔區間與預設清單）；缺席預警門檻預設改由設定檔讀取；§4 波次表加「對應區」欄，新增 §4.1 A–H 區對照（F 樂以載道不排入計畫，只在 A 列註記） |
| 2026-11-24 | P2（第一批）：紅旗狀態機（`red_flag_status` 事件追加寫入，不改原紀錄；狀態：待處理／已認領／已完成／暫緩）；每週 Check 摘要（純文字）；未聚會門檻可選 7／14／21／28 天，預設 14 天（內部換算為連續缺席週數，預設由 3 週改為 2 週）；測試 `test_cm_p2_loop.py` 6/6 |

### 9.1 P2 規格（已實作）

| 項目 | 內容 |
|------|------|
| 狀態事件 | `event_type: red_flag_status`，`metadata.alert_id` = 紅旗 `event_id`，`metadata.status` ∈ {open, ack, done, snoozed}；取最新一筆為現況，無紀錄即為 open |
| 寫入路徑 | 只經 `ChurchDataBridge.appendPastoralEvent`（沿用 RBAC `pastoral.write`），不另建儲存鍵 |
| 門檻 | localStorage `bible100_cm_absence_threshold_days`，只接受 7／14／21／28，非法值回退 14；由 `PastoralDataHub.setAbsenceThresholdDays` 設定 |
| 週摘要 | `CmRedFlagConfig.buildWeeklySummaryText`；只計數，行動由牧者填寫；可複製貼到 PDCA 的 Check 欄 |
| 不做 | 不由系統判斷「完成」；不自動催辦；不接 AI |

### 9.2 P2 驗證紀錄（2026-11-24）

- 自動測試：`test_cm_p2_loop.py` 6/6；`test_cm_red_flag_p1.py` 11/11；`test_ai_lab_w0_w6.py`、`test_unified_navigation.py`、`test_index_v5_shell.py`、`test_pastoral_p0_trial.py` 通過。
- 既有失敗（非本波造成）：見 §7 技術債；另 `church_ministry/tests/` 下約 20 個檔案本來就有失敗（側欄、landing、modes、教育頁等），與本波改動的檔案無交集，未逐一修復。
- 瀏覽器（本機 HTTP）：狀態轉換、門檻 21 天並還原、週摘要數字，經直接呼叫按鈕處理函式驗證通過。**真實滑鼠點擊未能驗證**：測試瀏覽器面板未取得焦點，點擊不會觸發處理函式。請在 `file://` 實際點一次「認領 → 完成 → 重新開啟」。
- 順帶修正：「最近的紅旗紀錄」改為預設展開（原收合時按鈕會被遮住）；門檻下拉預設選項寫入 HTML；頁面腳本加版本參數避免快取舊檔。
