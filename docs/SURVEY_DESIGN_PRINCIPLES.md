# 問卷系統設計原則 SURVEY_DESIGN_PRINCIPLES

**建立日期**：2026-04  
**範圍**：`smart_ministry/`、`church_planning/` 內之問卷與調查頁（靈命健康、教牧健康、恩賜、滿意度等），以及 **§三** 另行掛號之**教會健康診斷流程中的規劃／行動工具**（非問卷、不接 `spiritual_health_scoring.js`）。

---

## 給 Cursor／同工的硬性要求

凡**修改或新增**任何 `smart_ministry/`、`church_planning/` 下的問卷頁，請在**同一變更**中同步更新本文件（如該次變更不適用則於 PR／提交說明註明「本次不涉問卷」）：

1. **問卷實作對齊進度報告**（§三）：更新該卷之**狀態**（僅允許：`已完成`／`部分對齊（僅 UX）`／`legacy 未動`）、類型、是否使用共用 scoring。
2. **算法一致性檢查**（§四）：若該次變更涉及 **scoring、分級門檻、反向題**，更新門檻表或反向題列表，或註明「無變更」。
3. **問卷技術實作總覽**（§五）：更新該列之**共用 JS**、**localStorage key**（須與程式一致）、**匯出功能**、**最後驗證日期**；可選填 **commit／PR 註記**。

**規劃工具（非問卷）**：若變更僅涉及 §三「教會健康診斷與規劃工具（非問卷）」所列頁面，請同步更新 **§三該小節**與 **§五 對應列**（及 §七 修訂紀錄）；**無需**更新 §四（與健康問卷門檻／反向題無涉）。

**localStorage 填寫規則**：表格中的 key **一律以實際程式碼為準**；不確定時**留空**或標「未使用」，**禁止**填入未經核對的示例值。

**單一真相來源**：全站問卷之**原則與上述三份報告**僅在本檔維護。教牧／信徒卷之**專用實作細節**見 `church_planning/docs/PASTORAL_MEMBER_IMPLEMENTATION_NOTES.md`；**紅／黃／綠門檻總表與跨卷算法一致性**以 **§四** 為準。

**外部參考**（問卷設計通則，非教義）：[Imperial — Best practice in questionnaire design](https://www.imperial.ac.uk/research-and-innovation/education-research/evaluation/tools-and-resources-for-evaluation/questionnaires/best-practice-in-questionnaire-design/)

---

## 一、共用原則大綱

1. **目的單一**：每卷清楚區分「狀態／靈命健康」「恩賜／傾向」「滿意度／意見」等，避免混用解讀。
2. **量表**：優先 **1–5 Likert**；文字標籤與圖例用語與全站對齊（極少→恆常／成熟等）。
3. **反向題**：在題目 metadata 標 `reversed: true`；計分使用 `normalizeScore(raw, reversed)`，即 **1–5 時 `reversed ? (6 - val) : val`**。
4. **報告結構**：每卷宜具備 **整體指標**、**分維度（或分群）指標**、**簡短牧養／解讀文字**、**保護與私隱聲明**（非成績單、可選擇分享）。
5. **健康類 scoring**：`church_planning/js/spiritual_health_scoring.js`（**config + 共用函式**）；恩賜等**非健康維度**演算法**不**強行塞入同一套 `computeDimensionScores`，僅 **UX**（pill、步驟、報告節奏）對齊。
6. **逐卷落地**：每頁保留薄層——**自己的** `DIMENSIONS`、`QUESTIONS`（id 與 DOM 一致）、`DESCRIPTIONS`；流程為 **收集答案 → compute → renderReport**。
7. **問卷 UX 共用（非 scoring）**：`church_planning/js/survey_ui_common.js` 提供進度文字、Likert pill 狀態同步等小工具；健康類與恩賜卷可並用，**不得**將健康演算法塞入該檔。

---

## 二、與其他文件的關係

| 文件 | 角色 |
|------|------|
| **本檔** | 原則 + 三份報告（覆蓋範圍、算法一致性、技術總覽） |
| `docs/CHURCH_TOOL_PLAYBOOK.md` §3.1.1 | 調查類工程勾選表 **S1～S6**（完成定義、L1/L2/Next、匯出、schema、手冊風險）；與「不導更多問卷」對齊 |
| `docs/ENGINEERING_MASTER_ROADMAP.md` §1.5 | 上雲前分段（A+B+契約／E2E → D → 混合型 → I-03～05）與底層統一核對 |
| `church_planning/docs/PASTORAL_MEMBER_IMPLEMENTATION_NOTES.md` | 教牧／信徒卷專用：id 對齊、iframe、`spiritual_health_scoring.js` 路徑等 |
| `docs/TOOLS_AND_ENTRY_REFERENCE.md` | 入口與檔案路徑對照 |
| `docs/OPTIMIZATION_SUMMARY.md` | 優化摘要與連結 |

---

## 三、問卷實作對齊進度報告（由 Cursor／同工更新）

**狀態**僅能為以下三者之一：

- `已完成` — 原則與實作（含 scoring／門檻／報告結構依本檔）已對齊。  
- `部分對齊（僅 UX）` — 外觀、步驟、pill 等已統一，scoring 仍為舊版或另類演算法。  
- `legacy 未動` — 尚未依本原則調整。

### 目前已登記問卷

| # | 檔案路徑 | 用途 | 類型 | 狀態 | 共用 `spiritual_health_scoring.js` | 專題 notes |
|---|----------|------|------|------|--------------------------------------|------------|
| 1 | `church_planning/信徒靈性生命健康自我審查.html` | 信徒靈命快測 | 靈命健康（會眾） | `已完成` | 是（`church_planning/js/spiritual_health_scoring.js`） | `church_planning/docs/PASTORAL_MEMBER_IMPLEMENTATION_NOTES.md` |
| 2 | `church_planning/pastoral-spiritual-survey-pro.html` | 教牧／領袖專業調查 | 靈命健康（教牧） | `已完成` | 是（同上＋`pastoral_spiritual_health.js`） | 同上 |
| 3 | `smart_ministry/spiritual_gifts.html` | 屬靈恩賜量表 | 屬靈恩賜 | `已完成` | 不適用（cluster／恩賜加權；**非** `spiritual_health_scoring.js`） | — |

（新增問卷請**加列**；不要刪除歷史列，可改狀態。）

### 教會健康診斷與規劃工具（非問卷）

本小節所列為健康診斷流程中的**規劃／行動**工具索引，**非**問卷；**不**接入 Likert scoring 族群、`spiritual_health_scoring.js`，亦**無需**建立 `*_spiritual_health.js`。下方表格之「狀態」欄為掛號用語，**不適用**本節開頭對問卷定義之「已完成／部分對齊／legacy 未動」三態。

| 檔案路徑 | 類型 | 性質 | 狀態 |
|----------|------|------|------|
| `church_planning/church-health-diagnosis.html` | 教會健康診斷・入口／導覽（轉址至 `Church_Health_NCD_planning.html`） | 規劃工具（非健康／狀態問卷） | 已掛入原則（不接 scoring） |
| `church_planning/swot-planning.html` | 教會版 SWOT 規劃工具 | 規劃工具（非健康／狀態問卷）；四象限＋文字盤點為主 | 已掛入原則（不接 scoring） |
| `church_planning/smart-planning.html` | 教會版 SMART 目標定義工具 | 規劃工具（非健康／狀態問卷）；頁內含計畫項目之 **1–5 自評**（自我感受尺度，僅供本工具匯出／討論，**不**併入紅黃綠／`spiritual_health_scoring.js`） | 已掛入原則（不接 scoring） |
| `church_planning/pdca-planning.html` | 教會版 PDCA 實作與檢討工具 | 規劃工具（非健康／狀態問卷）；看板與檢討節奏為主 | 已掛入原則（不接 scoring） |
| `church_planning/ministry-8020-planning.html` | 教會版 80/20（服事參與分布與核心負荷盤點） | 規劃工具（非健康／狀態問卷）；Likert 為**團隊現況自評**，**不**併入紅黃綠／`spiritual_health_scoring.js` | 已掛入原則（不接 scoring） |

**說明**：`church-health-diagnosis.html` 僅 `meta refresh`，無 script／localStorage；實際導覽與內容在 **`church_planning/Church_Health_NCD_planning.html`**（此檔負責轉址）。

### 教會版 80/20（v1 上線與後續擴充）

- **v1 頁面**：`church_planning/ministry-8020-planning.html`（見上表）；維度：參與集中度、核心負荷、培育／接班、是否願意做減法；**不等同**信徒／教牧問卷，**不**硬套其題目或 `spiritual_health_scoring.js`。
- **與其他工具**：可與 SWOT／SMART／PDCA 並用；導覽見 `church_planning/index_plan.html`、`church_planning/sidebar_plan.html`。
- **之後擴充（非必達）**：與事工／會友資料模組對接、多團隊比對、歷次追蹤等需另開需求。背景參考（組織領導通則，非教義）：[Church Leadership — 4 strategies for reversing the 80/20 rule](https://www.churchleadership.com/leading-ideas/4-strategies-for-reversing-the-80-20-rule/)；[Sacred Structures — SWOT as strategic planning](https://sacredstructures.org/methods/swot-analysis-strategic-planning-tool/)；[AHRQ — Tool 2b](https://www.ahrq.gov/health-literacy/improve/precautions/tool2b.html)。

### TODO：第二輪健康類卷候選（盤點：尚未新增第三張「個人／領袖狀態」卷）

**優先檔名（第二輪原定對象）**：以下路徑經 `church_planning/` 全目錄核對 **目前不存在**，無法實作接入。

| 預期檔名 | 狀態 |
|----------|------|
| `church_planning/小組長靈修與服事狀況調查.html`（或極類似命名） | **repo 內未找到** |
| `church_planning/事奉同工身心靈健康調查.html`（或極類似命名） | **repo 內未找到** |

**已檢視之其他檔案（是否適合作「與信徒／教牧卷同一家族」之第三卷）**：

| 檔案路徑 | 初步判斷 | 說明（簡要） |
|----------|----------|----------------|
| `church_planning/信徒靈性生命健康自我審查.html` | 健康類（會眾個人） | 已接入 `spiritual_health_scoring.js`（第一輪）。 |
| `church_planning/pastoral-spiritual-survey-pro.html` | 健康類（教牧／領袖個人） | 已接入（第一輪）。 |
| `church_planning/Church_Health_NCD_planning.html` 及同系列（如 `教會健康檢查 Church Health Check-up.html`、`教会健康数字诊断系统 NCD Church Health Pro 2026.html`） | **組織／教會體質**為主，**非**第三張「個人靈命狀態」Likert 家族 | NCD 八特質、計分區間與報告節奏與 `levelFromScore`（4.0／2.8）之個人卷不同；若未來要統一門檻須專案規劃，不應假設可直接套用現有 `computeDimensionScores` 而不改維度語意。 |
| `church_planning/planning/health.html`（Step 0） | **內部自評工具**，非典型「題組問卷頁」 | 九面向滑桿、資料走 `planning/assets/pipeline.js`，題目 id 與 DOM 結構與信徒／教牧卷不同。 |
| `church_planning/swot-planning.html`、`pdca-planning.html`、`smart-planning.html` | **非**純健康狀態卷 | 詳見上方 **§三「教會健康診斷與規劃工具（非問卷）」**（已掛號、不接 scoring）。 |
| `smart_ministry/spiritual_gifts.html` | 恩賜／傾向 | 已 `已完成`（見 §三「目前已登記問卷」）；非健康 scoring 家族。 |

**下一步（建議）**：新增成品頁（例如小組長／事奉同工卷）至 `church_planning/`，或指定現有某一 HTML 為第二輪對象後，再依本檔與 `spiritual_health_scoring.js` 補 **§三～§五** 與專用 `js/<X>_spiritual_health.js`。

---

## 四、算法一致性檢查（由 Cursor／同工維護）

### 4.1 紅／黃／綠分級門檻（健康類）

**標準門檻（2026 改版）**：

- **綠**：平均分 ≥ **4.0**  
- **黃**：≥ **2.8** 且 **< 4.0**  
- **紅**：**< 2.8**

| 問卷 | 程式中門檻是否已統一為上表 | 備註 |
|------|------------------------------|------|
| 信徒靈性生命健康自我審查 | **是** | 與 `spiritual_health_scoring.js` 之 `levelFromScore` 一致 |
| 教牧專業版 | **是** | A–F 範疇卡片之 `tierLabel`／`tierClassFromAvg` 與七維度摘要皆採 4.0／2.8；交叉風險規則另維持題庫給定之閾值 |
| 其他健康類問卷 | — | 新增時登記 |

**說明（2026-04-15）**：目前站內採用本節標準門檻（4.0／2.8／其餘）之**健康類**問卷僅上列兩份；兩卷門檻一致。

**例外**：若某卷**刻意**使用不同門檻，須在本表加列並註明**原因**與**批准記錄**。

### 4.2 反向題標記概況

| 問卷 | 反向題（題目 id） | 是否已逐題對照題幹 |
|------|-------------------|---------------------|
| 信徒靈性生命健康自我審查 | **無**（`q1`–`q13` 均 `reversed: false`） | 已對照：題幹皆為「愈同意愈成熟／健康」方向 |
| 教牧專業版 | **無**（`A1`–`F5` 於 `PASTORAL_QUESTION_MAP` 均 `reversed: false`） | 已對照：含否定語句之題（如 B3、B5、D4、E2、E3、F4）語意上仍為「同意＝較健康／較合宜」；若未來改寫題幹導致方向翻轉，須更新本表與 `pastoral_spiritual_health.js` |
| spiritual_gifts（恩賜） | 不適用（非健康維度平均） | 不適用 |

**教牧卷·七維度與 A–F 的關係（解讀用）**：七維度**不是**「一個英文字母章節＝一個維度」。A–F 為使用者填答與概覽卡片之六範疇；七維度為演算法匯總，採**題目級**映射（例如 D 章拆入「休息與家庭」「團隊支持」「負荷與界線」等）。完整對照、每題題幹摘要與反向題判定理由見 **`church_planning/js/pastoral_spiritual_health.js` 檔頭註解**；`E4`（對神計劃懷抱盼望）歸入 **異象與使命**；`A4`–`A5` 歸入 **喜樂**（同在與被愛）。

**教牧卷·七維度 key 與典型題號（速查；精準以 `PASTORAL_QUESTION_MAP` 為準）**：

| 程式 key（`dimension_scores` 內） | 報告顯示名稱 | 典型／涵蓋題號（封閉題） |
|-----------------------------------|--------------|---------------------------|
| `joy` | 喜樂 | A4, A5 |
| `scripture_word` | 靈修與話語 | A1, A2, A3 |
| `emotion_stress` | 情緒壓力 | B1, B2, B3, B4, B5 |
| `load_boundary` | 負荷與界線 | C1, C3, C4, C5, D3 |
| `rest_family` | 休息與家庭 | C2, D1 |
| `team_support` | 團隊支持 | D2, D4, D5, F1, F2, F3 |
| `vision_mission` | 異象與使命 | E1, E2, E3, E4, E5, F4, F5 |

**維護備忘（加厚 `joy`／喜樂維度，僅在樣本與共識足夠後）**：喜樂宜鎖在「與神同在、被愛、安全感、內在安息」等**關係與情感向**題意，與 **異象與使命**（方向、呼召、果效觀）區隔，避免兩維在統計上近乎同義。若需增加 `joy` 題數，**優先**自 **情緒壓力**（`emotion_stress`）中挑出更偏「與神連結的正向情感」之題，逐題核對後改映射；**異象與使命**維持 **E1–E5、F4–F5** 為主，不宜再把大量「盼望／呼召」題拆回喜樂。實作時僅更新三處並於 PR 註記：`pastoral_spiritual_health.js` 之 `PASTORAL_QUESTIONS` 與檔頭註解、本節速查表。

---

## 五、問卷技術實作總覽（由 Cursor／同工更新）

**填表規則**：`localStorage key` 須與原始碼 `grep` 一致；**禁止**示例假 key。

**`survey_ui_common.js`**：`church_planning/js/survey_ui_common.js`，供進度列（如「已答 x／總 y 題」）與動態 Likert pill 的 `survey-pill--on` 同步等；`smart_ministry/` 下頁面以 `../church_planning/js/survey_ui_common.js` 引入。

本表除**問卷**外，可含 **規劃類工具**（如 SWOT／SMART／PDCA）。該類在「共用 JS 模組」欄應**明寫不使用** `spiritual_health_scoring.js`（與 §三「教會健康診斷與規劃工具」一致）；若頁面未引用 `survey_ui_common.js`，亦請如實標示。

| 問卷檔案路徑 | 類型 | 共用 JS 模組 | localStorage key（實際） | 匯出功能 | 最後驗證日期 | commit／PR 註記（可選） |
|--------------|------|--------------|---------------------------|----------|--------------|-------------------------|
| `church_planning/信徒靈性生命健康自我審查.html` | 靈命健康（會眾） | `js/survey_ui_common.js`；`js/spiritual_health_scoring.js`；`js/member_spiritual_health.js` | `spiritualSurvey2026-simple`（可含 `dimension_scores`、`overall_score`、`schemaVersion: 2`） | 下載 PDF（html2pdf，檔名 `spiritual-assessment-simple.pdf`） | 2026-04-17 | 引用共用 UX 模組 |
| `church_planning/pastoral-spiritual-survey-pro.html` | 靈命健康（教牧） | `js/survey_ui_common.js`；`js/spiritual_health_scoring.js`；`js/pastoral_spiritual_health.js` | `pastoralSurveySnapshots_v1`；`pastoralSurveyProfile_v1`；**`church_planning_pastoral_spiritual_health`**（每次按「更新報告區」追加之維度紀錄陣列） | 單筆／全部快照 JSON；**「導出匿名統計」**（僅 `timestamp`＋`dimension_scores`） | 2026-04-17 | 引用共用 UX 模組 |
| `smart_ministry/spiritual_gifts.html` | 屬靈恩賜 | **不使用** `spiritual_health_scoring.js`；`../church_planning/js/survey_ui_common.js`；`smart_ministry/js/spiritual_gifts_report.js`（僅報告渲染；計分在頁內） | 前綴 `bible100_smart_ministry_`；恩賜結果鍵 **`bible100_smart_ministry_survey_spiritual_gifts`**；亦寫入 **`bible100_smart_ministry_survey_profile`** | **複製結果 JSON**（報告區按鈕；含 `topGifts`、`scores`、`provisional`） | 2026-04-18 | §三狀態 `已完成` |
| `church_planning/church-health-diagnosis.html` | 教會健康診斷・入口／導覽（轉址） | **不使用** `survey_ui_common.js`、`spiritual_health_scoring.js`（僅 HTML `meta refresh`） | 無 | 無 | 2026-04-18 | 見 §三「規劃工具」 |
| `church_planning/swot-planning.html` | 教會版 SWOT 規劃工具 | **不使用** `survey_ui_common.js`、`spiritual_health_scoring.js`；`js/church_toolkit.js`；Vue／Tailwind／Chart.js／html2pdf（CDN） | `chp2026-swot-v1` | 下載 PDF（html2pdf） | 2026-04-18 | 見 §三「規劃工具」 |
| `church_planning/smart-planning.html` | 教會版 SMART 目標定義工具 | **不使用** `survey_ui_common.js`、`spiritual_health_scoring.js`；`js/church_toolkit.js`；Vue／Tailwind／Chart.js／html2pdf（CDN） | `chp2026-smart-v1`（`ChurchToolkit.STORAGE_KEYS.SMART`） | 下載 PDF；匯出 JSON（頁內複製／外部 AI 用） | 2026-04-18 | 見 §三「規劃工具」 |
| `church_planning/pdca-planning.html` | 教會版 PDCA 實作與檢討工具 | **不使用** `survey_ui_common.js`、`spiritual_health_scoring.js`；`js/church_toolkit.js`；Vue／Tailwind／Chart.js／html2pdf（CDN） | `chp2026-pdca-v1` | 下載 PDF；瀏覽器列印 | 2026-04-18 | 見 §三「規劃工具」 |
| `church_planning/ministry-8020-planning.html` | 教會版 80/20 規劃工具 | **不使用** `survey_ui_common.js`、`spiritual_health_scoring.js`；`js/church_toolkit.js`（含 `fourSentence8020`）；Vue／Tailwind／html2pdf（CDN） | `chp2026-8020-v1`（`ChurchToolkit.STORAGE_KEYS.EIGHTY_TWENTY`） | 下載 PDF；匯出 JSON（頁內複製） | 2026-04-18 | 見 §三「規劃工具」與「80/20」小節 |

---

## 六、PR／提交檢查（建議）

若專案使用 Pull Request，模板中可加入：

```markdown
- [ ] 若本次變更涉及 `smart_ministry/` 或 `church_planning/` **問卷頁**，或 **教會規劃工具**（§三「教會健康診斷與規劃工具」所列）：已更新 `docs/SURVEY_DESIGN_PRINCIPLES.md` 之 §三～§五（或於說明欄註明「不適用」）。
```

本 repo 已提供 **`.github/pull_request_template.md`**，內含問卷頁相關勾選項。

---

## 七、修訂紀錄

| 日期 | 摘要 |
|------|------|
| 2026-04-15 | 初版：原則、三報告骨架、硬性要求、技術表初填（key 經原始碼核對）。 |
| 2026-04-15 | 信徒／教牧兩卷導入 `spiritual_health_scoring.js`、門檻統一為 4.0／2.8、§三～§五更新。 |
| 2026-04-15 | 教牧卷：`pastoral_spiritual_health.js` 補齊 A–F 與七維度之題目級對照註解；`E4` 歸入異象與使命；§4.2 加註與 A–F 非一對一之說明。 |
| 2026-04-15 | §4.2 增列教牧卷「七維度 key → 典型題號」速查表（仍以 JS 為單一真相來源）。 |
| 2026-04-15 | §4.2 增「維護備忘」：加厚 `joy` 時偏重感受、優先自情緒向度挑題；`pastoral_spiritual_health.js` 檔頭同步。 |
| 2026-04-16 | 第二輪盤點：`church_planning` 內無「小組長／事奉同工」命名之個人健康卷；§三增 **TODO：第二輪健康類卷候選** 與候選檔判斷（未改 §4.1「僅兩份個人卷」門檻敘述）。 |
| 2026-04-17 | 新增 `survey_ui_common.js`；`spiritual_gifts.html` UX／報告對齊（`spiritual_gifts_report.js`）；§一／§五更新；信徒／教牧頁引用共用 UX。 |
| 2026-04-18 | 規劃工具掛號（SWOT／SMART／PDCA／入口）與語意釐清；**A+B+D**：`ministry-8020-planning.html` v1（`chp2026-8020-v1`、`fourSentence8020`）、`spiritual_gifts` **複製 JSON**＋§三 `已完成`、80/20 小節改 v1＋擴充說明。§五／導覽／PR 模板一併對齊。 |
