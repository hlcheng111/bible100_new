# church_planning × smart_ministry — 擬訂 Canonical 檔名、處置與工程優先序

> **記錄日期**：2026-04-13  
> **狀態**：規劃備案；**定案前不強制改名**。對照表內 canonical 名與將來實際檔名應 **1:1 一致**。  
> **關聯**：[五階牧養路徑 × 兩模組 — 規劃備忘（草案 v2）](./FIVE_STAGES_SIDEBAR_DRAFT.md) · [**跨模組資料契約 v0.1**](./DATA_CONTRACT_v0.1.md)（實體、三橋 mapping、權限；新程式對齊此檔） · [**全站三層權限標準**](./RBAC_THREE_TIERS_STANDARD.md)（總管／編輯／用家；模組矩陣與 bulk PII）

---

## 命名原則（摘要）

| 規則 | 說明 |
|------|------|
| 全站 | **一個** 根層 `index.htm`（總入口；依專案政策可能為 `index.html`，定案後全專案統一）。 |
| 每模組 | **一個** `index.htm` 作模組唯一首頁。 |
| 模組內 hub（非根首頁） | **`index_<功能域>.htm`**，例如 `index_plan.htm`；避免多個裸 `index` 並列。 |
| 其餘靜態頁 | **前綴語意 + 功能**，便於搜尋與對照表：`survey_*`、`plan_*`、`exec_*`、`dash_*`、`content_*`、`lab_*`、`ui_*`。 |
| 處置標記 | **留**＝保留並微調；**併**＝併入他頁或降級；**修**＝改名／重組／導覽；**新**＝新增。 |

---

## 一、`church_planning/` 樹狀（擬訂 canonical 名 + 處置）

```
church_planning/
├── index.htm                         【新／修】模組唯一入口（現況多依賴 church-planning-index.html → 遷移或別名）
├── index_plan.htm                    【修／重組】教會計畫總覽 hub（現：church-planning-index.html）
├── content_vision.htm                【修】理念（現：vision.html）
├── content_process.htm               【修】進程敘事（現：process.html）
├── content_plan_guide.htm            【修】使用者指南（現：planning-user-guide.html；可併入 content 或保留）
│
├── survey_believer_health.htm        【留／修】第一階 Gateway（現：信徒靈性生命健康自我審查.html）
├── survey_pastoral_pro.htm           【留／修】第三階領袖靈命（現：pastoral-spiritual-survey-pro.html）
├── survey_church_health.htm          【留／修】第四階 ★ 主入口之一（現：church-health-diagnosis.html）
├── survey_church_health_ncd.htm      【併／修】NCD 調查（現：Church_Health_NCD_planning.html → 與上列敘事對齊，側欄只留一個 ★）
├── survey_church_health_demo_*.htm   【併】長檔名／多版健康／SWOT／AI 戰略示範頁 → 合併或僅內部連結（現：教會健康診斷與 AI 戰略系統 2026、NCD Pro 2026、Health Check-up、Church SWOT AI 等）
│
├── plan_swot.htm                     【留／修】第五階 SWOT 主工具（現：swot-planning.html）
├── plan_smart.htm                    【留／修】第五階 SMART 主工具（現：smart-planning.html）
├── plan_pipeline.htm                 【修／重組】長期計畫流程總覽（現：planning/index.html）
│   └── planning/ 子頁（health, theology, survey, ai-summary, strategy, swot, goals, kanban, workflow 等）
│       【修】統一為 plan_step_* 或維持子目錄但對照表標 canonical 與附屬
├── exec_pdca.htm                     【留／修】PDCA（現：pdca-planning.html）
├── exec_kanban.htm                   【留／修】（現：planning/kanban.html）
├── exec_workflow.htm                 【留／修】（現：planning/workflow.html）
├── exec_goals.htm                    【留／修】（現：planning/goals.html）
│
├── dash_command.htm                  【留／修】戰情／總覽（現：dashboard.html）
├── ui_sidebar.htm                    【修】側欄（現：sidebar.html）
├── app_church_swot_ai/               【留】Vite 產物與原始碼（現：dist/、建置設定）【修】與 plan_swot／plan_pipeline 開啟方式文件化
│
├── page_learn.htm                    【修】（現：page_learn.html）
├── page_see.htm                      【修】（現：page_see.html）
├── page_fill.htm                     【修】（現：page_fill.html）
├── page_reports.htm                  【修】（現：page_reports.html）
├── temp.htm                          【併／刪】草稿（現：temp.html）
└── （圖像媒體請用 `church_planning/image_plan/`，見該夾 README）【新】實驗與素材歸類
```

---

## 二、`smart_ministry/` 樹狀（擬訂 canonical 名 + 處置）

```
smart_ministry/
├── index.htm                         【修】模組唯一入口（現：index.html；landing.html → 併入或跳轉）
├── index_survey.htm                  【新／修】調查／評測類 hub（現：分散於多頁；可新建統一導覽）
├── index_pairing.htm                 【新／修】配搭／匹配 hub（現：多入口併斂）
│
├── survey_mbti.htm                   【留／修】（現：mbti_test.html）
├── survey_talent_skill.htm           【留／修】（現：talent_skill_unified.html）
├── survey_skills_expertise.htm       【留／併】（現：skills_expertise.html；與 talent_skill 關係釐清後定）
├── survey_questionnaire.htm          【修】（現：questionnaire_system.html）
├── survey_assessment.htm             【修】（現：assessment.html）
├── data_collection.htm               【修】（現：data_collection.html）
├── registration.htm                  【留／修】（現：registration.html）
├── why_serve.htm                     【留／修】（現：why_serve.html）
│
├── pair_matching.htm                 【併／修】★ 主配搭入口（現：matching.html 與 talent_ministry_matching.html 擇一為 canonical）
├── pair_ai_matching.htm              【併／修】（現：ai_matching.html → 進階或併入 pair_*）
├── pair_ai_team_optimizer.htm        【留／修】（現：ai_team_optimizer.html）
├── pair_ai_performance.htm           【留／修】（現：ai_performance_analyzer.html）
├── pair_landing_ai.htm               【併】（現：ai_pairing_landing.html → 併入 index_pairing 或 pair_*）
│
├── track_talent.htm                  【留／修】（現：talent_tracking.html）
├── track_growth.htm                  【留／修】第三階銜接（現：ai_growth_tracker.html）
├── talent_acquisition.htm            【修】（現：talent_acquisition.html）
│
├── dash_overview.htm                 【留／修】（現：dashboard.html）
├── dash_analytics.htm                【留／修】（現：ai_analytics_dashboard.html）
├── dash_module_map.htm               【留／修】（現：module_connections.html）
├── content_overview_ai.htm           【併／修】（現：ai_smart_ministry_overview.html → 併 dash 或 content）
│
├── ui_sidebar.htm                    【修】（現：sidebar.html）
├── _landing/                         【併】行銷／資訊圖 → 併入 index 或 lab
├── tests/                            【留】內部自動測試（現：tests/auto_test.html）
│
├── lab_disc.htm                      【併／降級】（現：test01_disc_test_grok.html）
├── lab_shape.htm                     【併／降級】（現：test02_shape_test_grok.html）
├── lab_matching_mbti.htm             【併／降級】（現：test03_matching_mbti_grok.html）
└── lab_spiritual_gifts.htm           【併／降級】（現：test04_spiritual_gifts_grok.html）
```

---

## 三、工程優先次序（查進度用）

完成一階段即在對照表或下方勾選。**定義：未完成上一階段不啟動大規模改名（P8）。**

| 序 | 階段 ID | 內容 | 完成定義（簡述） |
|----|---------|------|------------------|
| P0 | **DOC** | 凍結命名規則與副檔名（`.htm`／`.html` 擇一） | 本檔 + 團隊確認；與 `FIVE_STAGES_SIDEBAR_DRAFT.md` 無矛盾 |
| P1 | **MAP** | 現有每個 HTML → 表內一行 canonical；標 ★ 正式入口 | 無「同一階兩個 ★」衝突 |
| P2 | **NAV-CP** | `church_planning` 側欄：五階區 + 只露 ★ | `sidebar.html` 與草案一致 |
| P3 | **NAV-SM** | `smart_ministry` 側欄：五階區 + 第二階為主 | 同上 |
| P4 | **HUB** | 模組 `index.htm`、hub（`index_plan.htm`、`index_survey.htm`、`index_pairing.htm`） | 舊檔 **stub／說明連結** 策略寫入 DOC |
| P5 | **FLOW** | 第五階：`plan_swot` → `plan_smart` → `plan_pipeline` → `dash_command` 與「下一步」文案 | 一條使用者閉環可走通 |
| P6 | **MERGE-CP** | 教會健康多版本 → 併斂至 `survey_church_health`（+ 可選 `survey_church_health_ncd`） | 側欄減重；示範頁降級 |
| P7 | **MERGE-SM** | 配搭多入口 → 單一 `pair_matching` ★ | 其餘標進階／實驗 |
| P8 | **RENAME** | 批次重新命名或新檔 + 舊檔 stub | 對照表與實際檔名 1:1 |
| P9 | **LAB** | `lab_*`、`_landing` 收斂；實驗摺疊 | 正式路線不經 lab |
| P10 | **XMOD** | 跨模組邊界與「下一步」（不複製 SWOT）；資料欄位依 [DATA_CONTRACT_v0.1](./DATA_CONTRACT_v0.1.md) | 第一↔二、二↔四階有明確銜接 |

### 延伸（另議／建設中，不阻塞 P0–P4）

- **聯合（R）層**：`index_union.htm`、提交 schema、匯出摘要 JSON、合併工具頁等 — 見討論結論；**不複製 C 層 SWOT 精靈**。  
- **L0／L1／L2 與 `church_ministry`／`school_management`／`disciple_dynamics` 對齊**：導覽與教學統一，工具實作仍以 `church_planning` 為教會級 canonical。

---

## 四、維護備註

- 改名與合併前遵守 `FIVE_STAGES_SIDEBAR_DRAFT.md`：**不重構**既有問卷與計分 JS；**不覆寫**既有 `id`／`name`／`localStorage` key。  
- 本檔隨定案與實作進度更新「處置」欄與 P0–P10 勾選。
