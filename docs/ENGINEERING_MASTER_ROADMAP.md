# Bible100 工程總表（全站互通 × 模組微調 × 文檔治理）

- **版本**：2026-05-02（§1.5.4 人話三件事、§1.5.5 全表檢測 28 步）  
- **角色**：總工程師視角—銜接「大模組易用檢討」與「全站互通（資料／問卷／導覽）」兩條主線。  
- **關聯**：[全站整全改良計劃書](./全站整全改良計劃書.md) · [機械盤點報告](./reports/SITE_FULL_AUDIT_LATEST.md) · [根目錄重組紀要（2026-05）](./ROOT_REORG_2026-05.md) · [DATA_CONTRACT v0.1](./DATA_CONTRACT_v0.1.md) · [DATA_CONTRACT_PHASE0_ALIGNMENT](./DATA_CONTRACT_PHASE0_ALIGNMENT.md) · [CHURCH_TOOL_PLAYBOOK](./CHURCH_TOOL_PLAYBOOK.md)（含 **調查類 S1～S6**） · [問卷設計原則](./SURVEY_DESIGN_PRINCIPLES.md) · [階段 0 盤點表](./PHASE0_INVENTORY_CHECKLIST.md) · [PROJECT_MILESTONE_2026-04-29.md](../PROJECT_MILESTONE_2026-04-29.md) · [**工具總覽 · 專案狀態 Hub（HTML）**](../help/project-status-hub.html)

---

## 1. 先做什麼、後做什麼（總序）

| 順序 | 主題 | 理由 |
|:----:|------|------|
| **A** | **導覽誠信**（清單與磁碟一致、斷連、缺頁轉址） | 任何互通與文檔都假設「連結可點」；否則使用者與盤點皆不可信。 |
| **B** | **機械盤點例行化**（`scripts/site_full_audit.py`） | 低成本回歸；與 A 形成閉環驗收。 |
| **C** | **全站互通**（storage 鍵、契約、Bridge／BaaS、Auth、遷移） | 依賴 A 的入口穩定；比「逐頁手填盤點」優先級高。 |
| **D** | **模組微調**（Landing、sidebar、單頁 UX、問卷完成定義） | 在契約與主線確定後批量做，避免重做工。 |
| **E** | **文檔整合與清除** | **排在 A 之後、與 B 並行可**：先立「單一索引」再歸檔或刪除，避免先大搬遷導致連結與書籤全斷。清除僅限重複／已取代／明確過期者，需 PR 級對照。 |

---

## 1.5 上雲前分段與底層統一（共識，2026-05-02）

> **產品口徑**：上雲前盡量統一**底層技術**（儲存鍵、契約、主線／試行）、**殼與代表頁 UI**、**內容與手冊敘事**；**上雲後**各模組功能仍可持續調整改良。  
> **調查類試行參考頁**（統一呈示樣式與演算法要求之實作方向）：`church_planning/spiritual_app/index_spiritual.html`。細部原則見 `docs/SURVEY_DESIGN_PRINCIPLES.md`；調查類**可勾選工程項 S1～S6**見 `docs/CHURCH_TOOL_PLAYBOOK.md` **§3.1.1**。

### 1.5.1 實施順序（與 §1 總序對齊）

對話共識將「上雲前」拆為下列**大段**（**勿**與「全站每一頁最終 UI」綁死在同一步）：

| 順序 | 稱呼 | 涵義（對照 §1） | 驗收方向 |
|:----:|------|-------------------|----------|
| **1** | **A + B + 契約／E2E** | **A** 導覽誠信、**B** 盤點可重跑；並完成 **資料主線可驗證**：**I-01**（`longTermPlanning_*` vs `chp2026-*` 等寫入決策／migration 策略）、**I-02**（至少**一條**真實路徑：鍵名、adapter、`member_id` 或專案已定之最小切片）。對應 §1 的 **C 全站互通**中「上雲前必落地」之前置。 | 邊上雲邊改鍵的風險可列舉且可控；E2E 可演示 |
| **2** | **D（模組微調）** | **殼一致**（`index_v5`、各模組 dashboard／sidebar）、**代表頁**（調查／計劃／配對各選少量頁）達成「完成定義」與 Playbook 骨架。 | 小白易明、敢用；非全站逐頁像素級 |
| **3** | **混合型（四類之 3.4）** | 僅在 **調查類**與 **計劃類**各有一段**可演示閉環**後加重，避免「調查驅動計劃」接上半截流程。 | 證據進計劃時語境清楚、Next 不導更多問卷 |
| **4** | **上雲包 I-03 → I-04 → I-05** | Provider + `configurePersistence()` → Auth／RBAC 遮罩 → `migrateData`／備份／回滾演練。 | 單租戶 smoke；可還原 |

### 1.5.2 底層技術統一 · 上雲前核對（給同工「可放心逐頁檢討表單」用）

下列項**已有多數落在既有表／檔**；逐頁檢討表單時以本表為**上層核對**，細節回表 **I-xx／M-xx／U-xx** 與契約檔。

| 核對項 | 主要依據 |
|--------|----------|
| 主線儲存鍵與舊鍵對照 | `docs/DATA_CONTRACT_v0.1.md`、`docs/DATA_CONTRACT_PHASE0_ALIGNMENT.md` |
| 盤點頁與 Next 矩陣（已收口 P0-001～080） | `docs/PHASE0_INVENTORY_CHECKLIST.md`、`scripts/validate_phase0_playbook_gate.py` |
| 斷連／缺頁 | **M-02**、`docs/reports/SITE_FULL_AUDIT_LATEST.md` |
| 計劃主線決策與遷移 | **I-01**、`CHURCH_TOOL_PLAYBOOK.md` §8 |
| 一條可演示資料路徑 | **I-02**（與各模組 Bridge／adapter 實作） |
| 問卷演算法與呈現一致性 | `docs/SURVEY_DESIGN_PRINCIPLES.md`；調查類工程項 **S1～S6** 見 Playbook **§3.1.1** |
| 上雲實作 | **I-03、I-04、I-05**（本表 §2.2） |

**之後與同工**：在 **§1.5.2** 站穩前提下，可並行進行各模組功能頁之**逐頁檢討**（靈命、健康、計劃類 SWOT／SMART／PDCA／Kanban…），每頁對照 Playbook 與 `SURVEY_DESIGN_PRINCIPLES` 更新狀態列，不必等待「全站 UI 最終態」才開始檢討。具體**先後次序**以 **§1.5.5** 為準。

### 1.5.3 底層技術現狀（白話審視，2026-05-02）

> **一句話**：「文件與規則」大多已齊；「自動搬資料上雲、全站只剩一套鍵」**還沒做完**。你可以**現在就開始**逐頁檢討表單與文案，不必等上雲。

| 你關心的點 | 白話說明 | 現狀 |
|------------|----------|------|
| 使用者點連結會不會壞 | 站內盤點為主的那批 HTML，斷連已清到 **0**（見 `SITE_FULL_AUDIT_LATEST.md`） | **已達標**（仍建議發版前重跑腳本） |
| 每頁「下一步」往哪走 | 80 個工具列已改成**真實路徑**，並有腳本防回彈 | **已達標**（`PHASE0_INVENTORY_CHECKLIST.md` + Gate） |
| 資料存在哪、叫什麼名字 | 主線鍵、舊鍵對照已寫在契約與對齊表 | **文件已齊**；**不等於**程式已全部改寫或已上雲資料庫 |
| 計劃資料「舊線／新線」誰算主 | **已拍板**：新資料用 `chp2026-*`；`longTermPlanning_*` 為試行／待遷移（見 `PHASE0_INVENTORY_CHECKLIST.md` **§6**） | **決策已落地**；**自動遷移／雙鍵收斂**仍待工程（原 **I-01** 的程式段） |
| 跨模組「一條路徑」示範 | 例如會友鍵與教會／計劃頁如何串 | **仍待做**（原 **I-02**） |
| 主機、登入、備份還原 | 上雲三件套 | **未開始**（**I-03～I-05**） |

### 1.5.4 還沒做好的三件事（人話）

**第一件（檔名裡常寫 I-01）—「舊資料自動搬到新家」還沒寫好**  
網站裡曾經用**兩種不同「抽屜標籤」**存計劃資料：舊的像 `longTermPlanning_…`，新的像 `chp2026_…`。**誰是主線、舊的怎麼辦**，文件已經決定了；但**程式還沒做到**「按一鍵就幫使用者把舊抽屜整批搬到新抽屜」，也還沒保證「全站只剩一種存法」。所以現在仍可能出現「同一種計劃，舊頁讀舊標籤、新頁讀新標籤」—要麼以後寫搬運程式，要麼暫時規定**手動匯出再匯入**，這就是第一件還沒做好的事。

**第二件（I-02）—「給人走一遍的示範小路」還沒鋪好**  
意思是：從 **A 頁存的資料**，到 **B 頁真的讀得到、改得動、存得回**，整條路要有一條**官方示範**（例如靈命／會友 → 計劃看板），讓同工知道「我們承諾資料會這樣流」。現在多半還是**各頁自己管自己的瀏覽器儲存**，跨頁的「一條完整示範」還在工程待辦裡。

**第三件（I-03～I-05）—「放到網路上、誰能看、壞了能救」還沒上**  
白話就是：**資料不要只睡在自己電腦瀏覽器**（遠端主機＋連線讀寫）、**登入後誰能看誰不能**（權限）、**出事能備份還原**。這三件是上雲後台的本業，和「表單長得漂不漂亮」是分開的。

### 1.5.5 全表檢測次序（28 步：甲～丁 24 步＋戊選做 4 步，依 planning 理念）

> **理念**：先讓「**個人／同工身心狀態**」與「**教會體質**」說清楚，再進 **planning 主控台**，沿 **survey → swot → goals → kanban → pdca** 走完，最後才對照**舊版並行頁**與 **8020**，並檢 **策略／神學／AI 摘要** 等支援頁。  
> **檢測時請帶**：`CHURCH_TOOL_PLAYBOOK.md`（**S1～S6**）、`SURVEY_DESIGN_PRINCIPLES.md`、`PHASE0_INVENTORY_CHECKLIST.md` **§5～§6**。

**甲｜進計劃前：靈命與入口（4 步）**

| # | 路徑（皆在 `church_planning/` 下） | 這一步在查什麼（人話） |
|---|-------------------------------------|-------------------------|
| 1 | `spiritual_app/index.html` | 靈命審查**主入口**對不對、會不會把人帶去錯頁 |
| 2 | `spiritual_app/index_spiritual.html` | 新試行頁：表格呈示、暫存、報告、Next 是否符合 **S1～S6** |
| 3 | `信徒靈性生命健康自我審查.html` | 舊快測：是否只該當備份、導流回主入口是否清楚 |
| 4 | `pastoral-spiritual-survey-pro.html` | 教牧卷：門檻與用語是否與健康類原則一致 |

**乙｜教會體質與健康診斷線（6 步，與「個人靈命卷」分開看）**

| # | 路徑 | 這一步在查什麼（人話） |
|---|------|-------------------------|
| 5 | `church-health-diagnosis.html` | 轉址／入口是否把人帶到對的教會健康主線 |
| 6 | `Church_Health_NCD_planning.html` | NCD 主敘事：不要讓人誤以為是「個人紅黃綠成績單」 |
| 7 | `教會健康檢查 Church Health Check-up.html` | 與上兩步是否**說同一套故事**、會不會重複問卷感 |
| 8 | `教会健康数字诊断系统 NCD Church Health Pro 2026.html` | 數字診斷與 NCD 語意是否一致 |
| 9 | `教會健康戰略診斷系統 Church SWOT AI.html` | 「健康＋SWOT」交界：Next 是否導去**行動／計劃**而非再堆表 |
| 10 | `planning/health.html` | **規劃管線裡的教會健康步**；與個人問卷、NCD 的**邊界**是否寫在頁上 |

**丙｜planning 主控與主鏈（11 步，核心）**

| # | 路徑 | 這一步在查什麼（人話） |
|---|------|-------------------------|
| 11 | `planning/index.html` | **新主控台**：一站能不能找到下面整條鏈 |
| 12 | `index_plan.html` | 舊規劃入口：是否只當**跳板**、會不會跟 11 搶故事 |
| 13 | `planning/survey.html` | 規劃調查彙整：資料是否進 **`chp2026_survey`**、下一步是否往 SWOT |
| 14 | `planning/swot.html` | 新 SWOT 台：與 13、15 是否同一條鍵與敘事 |
| 15 | `planning/goals.html` | SMART／目標：是否承接 SWOT、Next 是否往 Kanban |
| 16 | `planning/kanban.html` | 看板：是否承接目標、是否導向執行／檢討 |
| 17 | `planning/workflow.html` | 行動節奏（如四週）：與看板／PDCA 是否說得通 |
| 18 | `pdca-planning.html` | **檢討與回寫**；盤點規定分析頁最後要回到這裡—有沒有寫清楚、連得到嗎 |
| 19 | `planning/strategy.html` | 策略聚焦：主鏈跑通後，是否**加分不搶主線** |
| 20 | `planning/theology.html` | 神學校準：同上 |
| 21 | `planning/ai-summary.html` | AI 摘要：證據與免責、Next 是否仍**不導更多問卷** |

**丁｜舊版並行與 8020（3 步，對照用）**

| # | 路徑 | 這一步在查什麼（人話） |
|---|------|-------------------------|
| 22 | `swot-planning.html` | 舊 SWOT：與 `planning/swot.html` 是否**重複**、該不該只留導流 |
| 23 | `smart-planning.html` | 舊 SMART：同上 |
| 24 | `ministry-8020-planning.html` | 8020：**試行鍵**；是否誤導成「第三張個人健康卷」、與主鏈如何接 |

**戊｜與 planning 有固定 Next 的教會事工頁（選做 4 步，盤點表已列）**  
路徑自 `bible100_new/` 根起；**等 11～21 主鏈你滿意後**再檢，避免教會模組與計劃各說各話。

| # | 路徑 | 這一步在查什麼（人話） |
|---|------|-------------------------|
| 25 | `church_ministry/modules/development/discipleship-training.html` | Next 指向計劃看板／流程時，**連結與用語**是否仍正確 |
| 26 | `church_ministry/modules/support/visitation-care.html` | 同上（探訪與 workflow 銜接） |
| 27 | `church_ministry/modules/education/training-programs.html` | 同上（訓練與 kanban 銜接） |
| 28 | `church_ministry/modules/analytics/performance-evaluation.html` | 同上（績效與 PDCA 銜接） |

---

## 2. 工作流總表（可勾選、無固定月限）

### 2.1 全站機械盤點與導覽（822 清單／排除 languages）

| ID | 工作項 | 類型 | 驗收 / 產出 | 狀態 |
|----|--------|------|-------------|------|
| **M-01** | 修復「清單有、磁碟無」之缺頁 | 互通／導覽 | 盤點「清單有、磁碟無」= 0 | **首期** → 見 `bible_study/unified_bible_reader.html` |
| **M-02** | 斷連（`broken_internal_links`）分批修 | 導覽 | 報告中高模組檔數下降；HTTP smoke 抽樣 | **第三波+排除策略（2026-05-01）**：`nav_hub`、`ai_tools`、`church_ministry`、`help` 已清 **0**；歷史鏡像 3 頁從盤點清單排除後，全站 **broken_link_files = 0** |
| **M-03** | 空 `<title>` 與重複 title 治理 | 模組微調 | 模組 landing／入口頁優先 | 待辦 |
| **M-04** | `site_full_audit.py` 納入 PR／發版前可選跑 | 流程 | CI 或手動說明於 `README_TESTING.md` | 待辦 |
| **M-05** | `languages/` 獨立第二清單（可選） | 盤點擴充 | 獨立 CSV／不混主表（現為 819） | 待辦 |

### 2.2 全站互通與資料

| ID | 工作項 | 類型 | 驗收 / 產出 | 狀態 |
|----|--------|------|-------------|------|
| **I-01** | `longTermPlanning_*` vs `chp2026-*` 主線與 migration 策略 | 資料／決策 | **決策**已寫 `PHASE0_INVENTORY_CHECKLIST.md` **§6**（2026-05-01）；**程式遷移／雙鍵收斂**仍待實作與驗收 | **決策已落地／遷移待辦** |
| **I-02** | 跨模組 adapter + `member_id` 最小切片（一條真實路徑） | 互通 | 單一路徑 E2E 可演示 | 待辦 |
| **I-03** | Cloud Provider（Supabase 等）+ `configurePersistence()` | 上雲 | 單租戶讀寫 smoke | 待辦 |
| **I-04** | Auth + RBAC 欄位遮罩 | 上雲 | 對齊 `RBAC_THREE_TIERS_STANDARD.md` | 待辦 |
| **I-05** | `bridge.migrateData()`／備份／回滾 | 上雲 | 腳本 + 還原演練紀錄 | 待辦 |
| **I-06** | 教會工具：關鍵字掃描 → `phase0_pages.csv`（非手填千列） | 互通／治理 | CSV 生成腳本 + §3 摘要 | 待辦 |

### 2.3 模組微調（易用、Landing、側欄）

| ID | 工作項 | 類型 | 驗收 / 產出 | 狀態 |
|----|--------|------|-------------|------|
| **U-01** | 各模組 `dashboard` + `sidebar` + 盤點標記問題頁 smoke | 微調 | 固定檢核表（改良計劃書 §4） | 待辦 |
| **U-02** | `LANDING_UX_PRINCIPLES.md` 分模組落地 | 微調 | 每模組至少「快速開始」+ 角色可辨 | 待辦 |
| **U-03** | 問卷／計劃頁對齊 `SURVEY_DESIGN_PRINCIPLES` + Playbook | 微調 | 缺「完成定義」者補齊 | **Phase 1-4 已收口**：P0-001~P0-080 已做 Next 收斂、模板規範、鍵名對齊、治理 Gate（自動偵測最大 P0）；下一步轉入 S/P/M/H 功能工程 |

### 2.4 文檔治理（雜草叢生 → 單一真相 + 歸檔）

| ID | 工作項 | 類型 | 驗收 / 產出 | 狀態 |
|----|--------|------|-------------|------|
| **D-01** | **本檔**作為工程總索引；`README_DOCUMENTATION.md` 頂部連結 | 索引 | 一鍵可達本檔 | **首期** |
| **D-02** | 註明「權威 vs 歷史」：`全站整全改良計劃書` vs `reports/2025-*` | 索引 | 表格：主題 → 讀哪份 | 待辦 |
| **D-03** | 重複完成報告／FINAL 類：移入 `docs/reports/archive/` 或標 `[superseded]` | 清除 | 不刪內容先歸檔；根目錄零散落報告 | 待辦 |
| **D-04** | v2.2 Sheets 路線與 Bridge／BaaS 路線在索引中分節，避免混讀 | 索引 | `GO_LIVE_CHECKLIST` 與里程碑各一節 | 待辦 |

---

## 3. 首期已執行（2026-05-01）

1. **M-01**：新增 `bible_study/unified_bible_reader.html` 極薄轉址頁，將舊連結導向現行 `reader.html`（`version` 等 query 保留）或 `comprehensive_exegesis_reader.html`（`ref` 經文連結，與時間軸示範格式相容）。  
2. **D-01**：新增本工程總表，並於 `README_DOCUMENTATION.md` 與 `PROJECT_MILESTONE_2026-04-29.md` 加入口徑連結。  
3. **M-04 試跑**：已執行 `python scripts/site_full_audit.py` → 產出 `docs/reports/site_full_audit_20260501_081119.csv` 並更新 `SITE_FULL_AUDIT_LATEST.md`；摘要當時為 **missing=0**、empty_title=19、broken_link_files=52（數字隨重跑而變）。  
4. **M-02（bible_study 批次）**：`dashboard.html` 佔位連結改指向站內既有頁；`versions/{cnv,union,luzhenzhong}.html` 修正 `data/bibles` 相對路徑為 `../../data/`；測試頁 `CACHE_BUSTER`／`FINAL_TEST`／`SOLUTION` 改指向現行 `sidebar.html` 等；`favorites_reader` 以 `location.assign` 避免盤點誤判並將筆記導向 `reader.html`；`original_text_landing` 改用 `assign`。重跑盤點後 **`bible_study` 模組疑似壞連結檔數 = 0**，全站 broken_link_files 降至 **43**（見最新 `SITE_FULL_AUDIT_LATEST.md`）。  
5. **M-02（第二波自動）**：`school_management/manage/*_tabs.html` 將誤寫的 `../../dashboard.html` 改為 **`../dashboard.html`**；`manage/finance/index.html` 獎學金連結改 **`income_expense.html`**；`manage/grades/index.html` 四個功能連結改為既有 `progress.html`／`reports.html`／`../students|courses/index.html`；**`search/`** 三頁將不存在的 `bible_search.html` 等改指向 **`bible_study/search_reader`**、**`qna/qna_landing.htm`**、**`nav_hub/index.html`**；**`docs/pages_AI/`** 修正返回主站／AI 目錄相對路徑；**`ai_tools/components/`** 頁腳與導航之 `tools/*.html` 改為實際 **`../pages/`**、**`../tools/`**、**`../functions/`** 路徑並修正 **`../../../index`**。重跑盤點後全站 **broken_link_files = 23**；**`school_management`、`search`、`docs` 模組該項 = 0**。
6. **M-02（第三波自動）**：**`nav_hub/sidebar.html`** 將不存在之報告型 `href` 統一指向 **`documentation_center.html`**，並修正聖經研讀／AI／教會事工／學校管理／智慧事奉之實際路徑；**`nav_hub/index.html`** 修正站點導航與 **`v2/index.html`** 移動版入口；**`ai_tools/index.html`** 與多個 **`pages/`**、**`functions/`**、**`tools/`** 頁之 **`../../../index`**／**`index.htm`**／站內導覽；**`church_ministry`**（`index.html`、`_landing/worship.html`、`functions/content.html`、`functions/ministry_core.html`、`functions/connections.html`）；**`help/`**（`bible100_curriculum_manual.html` 之目錄連結、`tools-overview.html` 之地圖路徑）；**`nav_hub/user_testing_guide.html`**；**`hymn_management/dist/hymn_cloud_20260320-1620/`** 內頂層 **`index.html`** 之模組相對路徑、**`manifest.json`** 補齊、子目錄 **`index_playlist.html`**／**`landing.html`**／**`temp_*.html`** 等。重跑盤點後全站 **broken_link_files = 3**（CSV：`site_full_audit_20260501_090720.csv`）。
7. **M-02（排除策略落地）**：將 3 個歷史鏡像頁（`hymn_cursor/.../hymn_main_index.html`、`hymn_sidebar_dashboard.html`、`Web Church/booktop.html`）自 `_inventory_html_exclude_languages.txt` 排除；保留檔案、不納入主線盤點。重跑後全站 **broken_link_files = 0**（CSV：`site_full_audit_20260501_102749.csv`，主清單筆數 819）。
8. **U-03（Playbook 對齊改版，Phase 1-4）**：`PHASE0_INVENTORY_CHECKLIST.md` 的 P0-001~P0-080 `Next` 欄位全部改為真實路徑；`CHURCH_TOOL_PLAYBOOK.md` 補四類工具 Phase 1-4 施工段；新增 `docs/DATA_CONTRACT_PHASE0_ALIGNMENT.md`（舊鍵→主鍵對照）；`scripts/validate_phase0_playbook_gate.py` 升級為自動抓最大 P0 編號並檢查連續性，實測通過（`PHASE0 gate PASSED`，80 列）。第四批聚焦配對類（恩賜／事工／人才）主鏈與落地鏈。

---

## 4. 維護

- 重大波次完成或盤點重跑後：更新 §3「首期」日期與 `SITE_FULL_AUDIT_LATEST.md` 引用。  
- 若刪除文檔：必須全域搜尋反向連結並更新本表「權威」欄。
