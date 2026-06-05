# 階段 0 盤點表（Phase 0 Inventory）

| 項目 | 內容 |
|------|------|
| **版本** | 2026-05-01（收口版） |
| **搭配文件** | [`CHURCH_TOOL_PLAYBOOK.md`](./CHURCH_TOOL_PLAYBOOK.md) |
| **目的** | 盤點站內調查／計劃／配對／混合工具；標主線、缺口與 **Next**（可執行、可問責，不堆新問卷） |

---

## 章節一覽（用表）

| § | 標題 | 用途 |
|---|------|------|
| 1 | 使用流程 | 四步要做什麼 |
| 2 | 欄位字典 | 盤點表每一欄怎填 |
| 3 | 盤點主表（精簡） | **每頁一列**，日常填寫 |
| 4 | 盤點補充表 | 與 §3 同一 **ID** 對填備註／風險／負責人 |
| 5 | Next 導向矩陣 | 條件 → 建議下一步（四類合併一表） |
| 6 | 主線決策表 | 盤點後「誰保留／導流／退役」 |
| 7 | 搜尋關鍵字 | 在 repo 裡找頁與 key |
| 8 | 範例列 | 格式參考 |

---

## 1. 使用流程（表）

| 步驟 | 你要做的事 | 產出 |
|:----:|------------|------|
| 1 | 訂掃描範圍（例：`church_planning/` + `smart_ministry/`） | 範圍一句話寫在 §3 表上方 |
| 2 | 每個 HTML／工具一列填 §3；同一 **ID** 在 §4 補文字 | 主表 + 補充表有列 |
| 3 | 至少填：類型、主線、儲存鍵、手冊/L1～Next/PDF、風險 | 每列「已盤」 |
| 4 | 填 §5 Next 矩陣（改成你站內真實路徑） | 可給同工對照 |
| 5 | 填 §6 主線決策 | 再進階段 1（Playbook 改版） |

---

## 2. 欄位字典（表）

| 欄位（§3 用） | 意義 | 合法值／例 |
|----------------|------|------------|
| **ID** | 盤點序號 | `P0-001` … |
| **Path** | 相對 `bible100_new/` | `church_planning/.../foo.html` |
| **名稱** | 頁標或簡稱 | 自由文字 |
| **類型** | 工具性質 | `調查`／`計劃`／`配對`／`混合` |
| **主線** | 入口層級 | `主入口`／`試行`／`重複`／`退役候選`／`未知` |
| **儲存鍵** | `localStorage` 等（多個用 `;`） | 或填 `無`／`待查` |
| **手冊** | 理念／流程／免責 | `Y`／`N`／`部份` |
| **L1** | 儀表、分數、完成度可視化 | `Y`／`N`／`部份` |
| **L2** | 規則式解說、門檻 | `Y`／`N`／`部份` |
| **L3** | AI Prompt 或長段輸出 | `Y`／`N`／`部份` |
| **Next** | 有無「下一步」（非新問卷 URL） | `Y`／`N`／`待補` |
| **PDF** | 列印／PDF | `Y`／`N`／`待測`／`曾空白` |
| **匯出** | JSON／CSV 單筆 | `Y`／`N` |
| **狀態** | 盤點進度 | `未盤`／`已盤`／`已決策` |

**§4 補充表欄位**

| 欄位 | 意義 |
|------|------|
| **ID** | 與 §3 相同 |
| **主線備註** | 與誰重疊、為何不是主入口 |
| **風險** | 雙軌、空白 PDF、無版本鍵、誤用… |
| **負責人** | 可空白 |

---

## 3. 盤點主表（精簡）— 每頁一列

> 列太多時：可另存 `docs/inventory/phase0_pages.csv`，本節只留摘要列 + 檔案連結一句。

| ID | Path | 名稱 | 類型 | 主線 | 儲存鍵 | 手冊 | L1 | L2 | L3 | Next | PDF | 匯出 | 狀態 |
|----|------|------|------|------|--------|------|----|----|----|------|-----|------|------|
| P0-001 | `church_planning/spiritual_app/index.html` | 靈命審查主入口 | 調查 | 主入口 | `spiritualSurvey2026` | Y | Y | 部份 | 部份 | `church_planning/planning/index.html` | 待測 | Y | 已決策 |
| P0-002 | `church_planning/spiritual_app/index_spiritual.html` | 靈命審查（spiritual） | 調查 | 導流 | `spiritualSurvey2026-index-spiritual-v1` | Y | Y | 部份 | 部份 | `church_planning/spiritual_app/index.html` | 待測 | Y | 已決策 |
| P0-003 | `church_planning/信徒靈性生命健康自我審查.html` | 靈命審查舊版頁 | 調查 | 退役候選 | 待查 | 部份 | 部份 | 部份 | 部份 | `church_planning/spiritual_app/index.html` | 待測 | N | 已決策 |
| P0-004 | `church_planning/church-health-diagnosis.html` | 教會健康診斷 | 調查 | 試行 | `churchHealthDiagnosis2026` | Y | Y | 部份 | 部份 | `church_planning/planning/index.html` | 待測 | Y | 已盤 |
| P0-005 | `church_planning/pastoral-spiritual-survey-pro.html` | 牧養靈命問卷 Pro | 調查 | 重複 | 待查 | 部份 | Y | 部份 | 部份 | `church_planning/spiritual_app/index.html` | 待測 | N | 已盤 |
| P0-006 | `church_planning/index_plan.html` | 規劃入口（舊） | 計劃 | 導流 | `chp2026_plan_index` | Y | Y | Y | 部份 | `church_planning/planning/index.html` | N | N | 已盤 |
| P0-007 | `church_planning/planning/index.html` | 規劃主控台 | 計劃 | 主入口 | `chp2026_*` | Y | Y | Y | 部份 | `church_planning/swot-planning.html` | 部份 | Y | 已決策 |
| P0-008 | `church_planning/smart-planning.html` | SMART 規劃 | 計劃 | 主入口 | `chp2026_goals` | Y | Y | Y | 部份 | `church_planning/planning/kanban.html` | 部份 | Y | 已盤 |
| P0-009 | `church_planning/swot-planning.html` | SWOT 規劃 | 計劃 | 主入口 | `chp2026_swot` | Y | Y | Y | 部份 | `church_planning/smart-planning.html` | 部份 | Y | 已盤 |
| P0-010 | `church_planning/pdca-planning.html` | PDCA 規劃 | 計劃 | 主入口 | `chp2026_pdca` | Y | Y | Y | 部份 | `church_planning/planning/kanban.html` | 部份 | Y | 已盤 |
| P0-011 | `church_planning/planning/kanban.html` | Kanban 執行看板 | 計劃 | 主入口 | `chp2026_kanban` | Y | Y | Y | N | `church_planning/pdca-planning.html` | N | Y | 已盤 |
| P0-012 | `church_planning/ministry-8020-planning.html` | 8020 事工規劃 | 計劃 | 試行 | `longTermPlanning_*` | 部份 | Y | 部份 | 部份 | `church_planning/planning/index.html` | 待測 | Y | 已盤 |
| P0-013 | `smart_ministry/dashboard.html` | 智慧事奉儀表板 | 配對 | 主入口 | `bible100_smart_ministry` | Y | Y | 部份 | 部份 | `smart_ministry/assessment.html` | N | 部份 | 已盤 |
| P0-014 | `smart_ministry/assessment.html` | 恩賜評估 | 調查 | 主入口 | `bible100_smart_ministry_assessment` | Y | Y | Y | 部份 | `smart_ministry/matching.html` | 待測 | Y | 已盤 |
| P0-015 | `smart_ministry/matching.html` | 配對主流程 | 配對 | 主入口 | `bible100_smart_ministry_matching` | Y | Y | Y | 部份 | `church_ministry/modules/volunteer/volunteer-management.html` | N | Y | 已盤 |
| P0-016 | `smart_ministry/talent_ministry_matching.html` | 恩賜-事工配對 | 配對 | 主入口 | `bible100_smart_ministry_matching_v2` | Y | Y | Y | 部份 | `church_ministry/modules/development/discipleship-training.html` | N | Y | 已盤 |
| P0-017 | `smart_ministry/talent_main_survey.html` | 人才主調查 | 調查 | 導流 | `bible100_talent_survey` | 部份 | Y | 部份 | 部份 | `smart_ministry/assessment.html` | 待測 | Y | 已盤 |
| P0-018 | `smart_ministry/questionnaire_system.html` | 問卷系統 | 混合 | 重複 | 待查 | 部份 | 部份 | 部份 | 部份 | `smart_ministry/assessment.html` | 待測 | 部份 | 已盤 |
| P0-019 | `church_ministry/modules/volunteer/volunteer-management.html` | 志工管理 | 配對 | 主入口 | `memberSystemData` | Y | Y | Y | N | `church_ministry/modules/support/training-service.html` | 部份 | Y | 已盤 |
| P0-020 | `church_ministry/modules/development/discipleship-training.html` | 門訓訓練規劃 | 混合 | 主入口 | `memberSystemData;trainingPlan` | Y | Y | Y | 部份 | `church_planning/planning/kanban.html` | 部份 | Y | 已盤 |
| P0-021 | `church_planning/planning/survey.html` | 規劃調查彙整 | 調查 | 主入口 | `chp2026_survey` | Y | Y | Y | 部份 | `church_planning/planning/swot.html` | 待測 | Y | 已盤 |
| P0-022 | `church_planning/planning/swot.html` | SWOT 工作台（新） | 計劃 | 主入口 | `chp2026_swot` | Y | Y | Y | 部份 | `church_planning/planning/goals.html` | 部份 | Y | 已盤 |
| P0-023 | `church_planning/planning/goals.html` | SMART 目標（新） | 計劃 | 主入口 | `chp2026_goals` | Y | Y | Y | 部份 | `church_planning/planning/kanban.html` | 部份 | Y | 已盤 |
| P0-024 | `church_planning/planning/strategy.html` | 策略聚焦頁 | 計劃 | 主入口 | `chp2026_strategy` | Y | Y | Y | 部份 | `church_planning/planning/workflow.html` | 部份 | Y | 已盤 |
| P0-025 | `church_planning/planning/workflow.html` | 執行流程頁 | 計劃 | 主入口 | `chp2026_workflow` | Y | Y | Y | N | `church_planning/planning/kanban.html` | N | Y | 已盤 |
| P0-026 | `church_planning/planning/ai-summary.html` | AI 摘要頁 | 混合 | 主入口 | `chp2026_ai_summary` | Y | Y | 部份 | Y | `church_planning/planning/strategy.html` | 待測 | Y | 已盤 |
| P0-027 | `church_planning/planning/health.html` | 教會健康規劃頁 | 混合 | 主入口 | `chp2026_health` | Y | Y | Y | 部份 | `church_planning/planning/theology.html` | 部份 | Y | 已盤 |
| P0-028 | `church_planning/planning/theology.html` | 神學校準頁 | 混合 | 主入口 | `chp2026_theology` | Y | Y | Y | 部份 | `church_planning/planning/strategy.html` | N | Y | 已盤 |
| P0-029 | `smart_ministry/ai_pairing_landing.html` | 配對入口頁（AI） | 配對 | 主入口 | `bible100_smart_ministry_pairing` | Y | Y | 部份 | 部份 | `smart_ministry/matching.html` | N | N | 已盤 |
| P0-030 | `smart_ministry/ai_matching.html` | AI 配對頁 | 配對 | 主入口 | `bible100_smart_ministry_matching_ai` | Y | Y | Y | 部份 | `church_ministry/modules/volunteer/volunteer-integrated.html` | N | Y | 已盤 |
| P0-031 | `smart_ministry/talent_skill_unified.html` | 恩賜技能統一頁 | 配對 | 主入口 | `bible100_smart_ministry_talent_skill` | Y | Y | Y | 部份 | `smart_ministry/talent_ministry_matching.html` | N | Y | 已盤 |
| P0-032 | `smart_ministry/registration.html` | 事奉報名頁 | 混合 | 主入口 | `bible100_smart_ministry_registration` | Y | Y | Y | 部份 | `church_ministry/modules/volunteer/volunteer-management.html` | 待測 | Y | 已盤 |
| P0-033 | `smart_ministry/data_collection.html` | 資料收集頁 | 混合 | 主入口 | `bible100_smart_ministry_data_collection` | Y | Y | Y | 部份 | `smart_ministry/dashboard.html` | N | Y | 已盤 |
| P0-034 | `smart_ministry/ai_team_optimizer.html` | 團隊優化頁 | 配對 | 主入口 | `bible100_smart_ministry_team_optimizer` | Y | Y | Y | 部份 | `church_ministry/modules/volunteer/volunteer-integrated.html` | N | Y | 已盤 |
| P0-035 | `church_ministry/modules/volunteer/volunteer-integrated.html` | 志工整合頁 | 配對 | 主入口 | `memberSystemData` | Y | Y | Y | 部份 | `church_ministry/modules/support/training-service.html` | 部份 | Y | 已盤 |
| P0-036 | `church_ministry/modules/development/congregation-care.html` | 會眾關懷頁 | 混合 | 主入口 | `memberSystemData;carePlan` | Y | Y | Y | 部份 | `church_ministry/modules/fellowship/visitation.html` | 部份 | Y | 已盤 |
| P0-037 | `church_ministry/modules/fellowship/small-groups.html` | 小組管理頁 | 混合 | 主入口 | `memberSystemData;groupPlan` | Y | Y | Y | 部份 | `church_ministry/modules/development/discipleship-training.html` | 部份 | Y | 已盤 |
| P0-038 | `church_ministry/modules/support/training-service.html` | 訓練服務頁 | 混合 | 主入口 | `memberSystemData;trainingService` | Y | Y | Y | N | `church_ministry/modules/development/discipleship-training.html` | N | Y | 已盤 |
| P0-039 | `church_ministry/modules/fellowship/visitation.html` | 探訪頁 | 混合 | 主入口 | `memberSystemData;visitation` | Y | Y | Y | 部份 | `church_ministry/modules/support/visitation-care.html` | 部份 | Y | 已盤 |
| P0-040 | `church_ministry/modules/support/visitation-care.html` | 探訪關懷頁 | 混合 | 主入口 | `memberSystemData;visitationCare` | Y | Y | Y | 部份 | `church_planning/planning/workflow.html` | 部份 | Y | 已盤 |
| P0-041 | `church_ministry/modules/education/education-management.html` | 教育管理頁 | 混合 | 主入口 | `memberSystemData;educationPlan` | Y | Y | Y | 部份 | `church_ministry/modules/education/training-programs.html` | 部份 | Y | 已盤 |
| P0-042 | `church_ministry/modules/education/training-programs.html` | 訓練課程頁 | 混合 | 主入口 | `memberSystemData;trainingPrograms` | Y | Y | Y | 部份 | `church_planning/planning/kanban.html` | 部份 | Y | 已盤 |
| P0-043 | `church_ministry/modules/education/sunday-school.html` | 主日學頁 | 混合 | 主入口 | `memberSystemData;sundaySchool` | Y | Y | Y | 部份 | `church_ministry/modules/education/education-management.html` | 部份 | Y | 已盤 |
| P0-044 | `church_ministry/modules/worship/worship-management.html` | 敬拜管理頁 | 混合 | 主入口 | `memberSystemData;worshipManagement` | Y | Y | Y | 部份 | `church_ministry/modules/worship/worship-team-management.html` | 部份 | Y | 已盤 |
| P0-045 | `church_ministry/modules/worship/worship-team-management.html` | 敬拜團隊管理頁 | 配對 | 主入口 | `memberSystemData;worshipTeam` | Y | Y | Y | 部份 | `church_ministry/modules/volunteer/volunteer-management.html` | N | Y | 已盤 |
| P0-046 | `church_ministry/modules/worship/song-library.html` | 詩歌庫頁 | 混合 | 主入口 | `memberSystemData;songLibrary` | Y | Y | 部份 | N | `church_ministry/modules/worship/worship-management.html` | N | 部份 | 已盤 |
| P0-047 | `church_ministry/modules/media/video-production.html` | 影音製作頁 | 混合 | 主入口 | `memberSystemData;mediaProduction` | Y | Y | Y | 部份 | `church_ministry/modules/media/live-streaming.html` | 部份 | Y | 已盤 |
| P0-048 | `church_ministry/modules/media/live-streaming.html` | 直播頁 | 混合 | 主入口 | `memberSystemData;liveStreaming` | Y | Y | Y | 部份 | `church_ministry/modules/worship/worship-management.html` | 部份 | Y | 已盤 |
| P0-049 | `church_ministry/modules/media/ai-assistant.html` | 媒體 AI 助手頁 | 混合 | 主入口 | `memberSystemData;mediaAI` | Y | Y | 部份 | Y | `ai_tools/dashboard.html` | N | Y | 已盤 |
| P0-050 | `church_ministry/modules/analytics/statistical-reports.html` | 統計報表頁 | 計劃 | 主入口 | `memberSystemData;analyticsReports` | Y | Y | Y | 部份 | `church_ministry/modules/research/index.html` | 部份 | Y | 已盤 |
| P0-051 | `church_ministry/modules/analytics/performance-evaluation.html` | 績效評估頁 | 計劃 | 主入口 | `memberSystemData;performanceEval` | Y | Y | Y | 部份 | `church_planning/planning/pdca-planning.html` | 部份 | Y | 已盤 |
| P0-052 | `church_ministry/modules/analytics/trend-analysis.html` | 趨勢分析頁 | 計劃 | 主入口 | `memberSystemData;trendAnalysis` | Y | Y | Y | 部份 | `church_planning/planning/strategy.html` | 部份 | Y | 已盤 |
| P0-053 | `church_ministry/modules/research/index.html` | 研究中心入口 | 計劃 | 主入口 | `memberSystemData;researchHub` | Y | Y | Y | 部份 | `church_ministry/modules/analytics/statistical-reports.html` | N | Y | 已盤 |
| P0-054 | `church_ministry/modules/research/engagement-analysis.html` | 參與度分析頁 | 計劃 | 主入口 | `memberSystemData;engagementAnalysis` | Y | Y | Y | 部份 | `church_ministry/modules/fellowship/small-groups.html` | 部份 | Y | 已盤 |
| P0-055 | `church_ministry/modules/mission/mission-ministry.html` | 宣教事工頁 | 混合 | 主入口 | `memberSystemData;missionMinistry` | Y | Y | Y | 部份 | `church_ministry/modules/expansion/mission-expansion.html` | 部份 | Y | 已盤 |
| P0-056 | `church_ministry/modules/expansion/mission-expansion.html` | 宣教拓展頁 | 計劃 | 主入口 | `memberSystemData;missionExpansion` | Y | Y | Y | 部份 | `church_planning/planning/strategy.html` | 部份 | Y | 已盤 |
| P0-057 | `smart_ministry/ai_growth_tracker.html` | 成長追蹤頁 | 混合 | 主入口 | `bible100_smart_ministry_growth` | Y | Y | Y | 部份 | `church_planning/planning/pdca-planning.html` | 部份 | Y | 已盤 |
| P0-058 | `smart_ministry/ai_performance_analyzer.html` | 事工績效分析頁 | 計劃 | 主入口 | `bible100_smart_ministry_performance` | Y | Y | Y | 部份 | `church_ministry/modules/analytics/performance-evaluation.html` | 部份 | Y | 已盤 |
| P0-059 | `smart_ministry/module_connections.html` | 模組連接頁 | 混合 | 主入口 | `bible100_smart_ministry_connections` | Y | Y | 部份 | 部份 | `nav_hub/index.html` | N | N | 已盤 |
| P0-060 | `smart_ministry/guide_for_leaders.html` | 領袖指南頁 | 混合 | 主入口 | `bible100_smart_ministry_leaders_guide` | Y | Y | Y | 部份 | `church_ministry/modules/support/training-service.html` | 部份 | Y | 已盤 |
| P0-061 | `smart_ministry/talent_acquisition.html` | 人才招募頁 | 配對 | 主入口 | `bible100_smart_ministry_talent_acquisition` | Y | Y | Y | 部份 | `smart_ministry/talent_tracking.html` | 部份 | Y | 已盤 |
| P0-062 | `smart_ministry/talent_tracking.html` | 人才追蹤頁 | 配對 | 主入口 | `bible100_smart_ministry_talent_tracking` | Y | Y | Y | 部份 | `smart_ministry/talent_skill_unified.html` | 部份 | Y | 已盤 |
| P0-063 | `smart_ministry/skills_expertise.html` | 技能專長頁 | 配對 | 主入口 | `bible100_smart_ministry_skills_expertise` | Y | Y | Y | 部份 | `smart_ministry/talent_ministry_matching.html` | N | Y | 已盤 |
| P0-064 | `smart_ministry/spiritual_gifts.html` | 恩賜盤點頁 | 配對 | 主入口 | `bible100_smart_ministry_spiritual_gifts` | Y | Y | Y | 部份 | `smart_ministry/matching.html` | 待測 | Y | 已盤 |
| P0-065 | `smart_ministry/why_serve.html` | 服事動機頁 | 混合 | 主入口 | `bible100_smart_ministry_service_motivation` | Y | Y | 部份 | 部份 | `smart_ministry/registration.html` | N | 部份 | 已盤 |
| P0-066 | `smart_ministry/mbti_test.html` | MBTI 測評頁 | 調查 | 導流 | `bible100_smart_ministry_mbti_test` | 部份 | Y | 部份 | 部份 | `smart_ministry/assessment.html` | 待測 | Y | 已盤 |
| P0-067 | `smart_ministry/ai_analytics_dashboard.html` | AI 分析儀表板 | 計劃 | 主入口 | `bible100_smart_ministry_analytics_dashboard` | Y | Y | Y | 部份 | `church_ministry/modules/analytics/statistical-reports.html` | N | Y | 已盤 |
| P0-068 | `smart_ministry/ai_smart_ministry_overview.html` | AI 智慧事奉總覽 | 混合 | 主入口 | `bible100_smart_ministry_overview` | Y | Y | 部份 | 部份 | `smart_ministry/ai_pairing_landing.html` | N | N | 已盤 |
| P0-069 | `smart_ministry/talent_pool_demo.html` | 人才池示範頁 | 配對 | 試行 | `bible100_smart_ministry_talent_pool_demo` | 部份 | Y | 部份 | N | `smart_ministry/talent_acquisition.html` | N | N | 已盤 |
| P0-070 | `smart_ministry/export_talent_stats_demo.html` | 人才統計匯出示範 | 混合 | 試行 | `bible100_smart_ministry_export_demo` | 部份 | Y | 部份 | N | `smart_ministry/ai_analytics_dashboard.html` | N | Y | 已盤 |
| P0-071 | `church_ministry/modules/volunteer/volunteer-reports.html` | 志工報表頁 | 計劃 | 主入口 | `memberSystemData;volunteerReports` | Y | Y | Y | 部份 | `church_ministry/modules/analytics/volunteer-performance.html` | 部份 | Y | 已盤 |
| P0-072 | `church_ministry/modules/members/member-integrated.html` | 會友整合頁 | 配對 | 主入口 | `memberSystemData;memberIntegrated` | Y | Y | Y | 部份 | `church_ministry/modules/volunteer/volunteer-management.html` | 部份 | Y | 已盤 |
| P0-073 | `church_ministry/modules/tech/smart-recommendation.html` | 智慧推薦頁 | 配對 | 主入口 | `memberSystemData;smartRecommendation` | Y | Y | Y | 部份 | `smart_ministry/ai_matching.html` | N | Y | 已盤 |
| P0-074 | `church_ministry/modules/tech/ai-assistant.html` | 教會 AI 助手頁 | 混合 | 主入口 | `memberSystemData;techAIAssistant` | Y | Y | 部份 | Y | `smart_ministry/ai_pairing_landing.html` | N | Y | 已盤 |
| P0-075 | `church_ministry/modules/worship/choir-team.html` | 詩班團隊頁 | 配對 | 主入口 | `memberSystemData;choirTeam` | Y | Y | Y | 部份 | `church_ministry/modules/worship/worship-team-management.html` | N | Y | 已盤 |
| P0-076 | `church_ministry/modules/worship/instrument-team.html` | 樂手團隊頁 | 配對 | 主入口 | `memberSystemData;instrumentTeam` | Y | Y | Y | 部份 | `church_ministry/modules/worship/worship-team-management.html` | N | Y | 已盤 |
| P0-077 | `church_ministry/modules/worship/attendance-management.html` | 出席管理頁 | 混合 | 主入口 | `memberSystemData;worshipAttendance` | Y | Y | Y | 部份 | `church_ministry/modules/worship/worship-reports.html` | 部份 | Y | 已盤 |
| P0-078 | `church_ministry/modules/worship/worship-reports.html` | 敬拜報表頁 | 計劃 | 主入口 | `memberSystemData;worshipReports` | Y | Y | Y | 部份 | `church_planning/pdca-planning.html` | 部份 | Y | 已盤 |
| P0-079 | `church_ministry/modules/fellowship/small-groups-integrated.html` | 小組整合頁 | 混合 | 主入口 | `memberSystemData;smallGroupsIntegrated` | Y | Y | Y | 部份 | `church_ministry/modules/fellowship/small-groups.html` | 部份 | Y | 已盤 |
| P0-080 | `church_ministry/modules/fellowship/fellowship-management.html` | 團契管理頁 | 混合 | 主入口 | `memberSystemData;fellowshipManagement` | Y | Y | Y | 部份 | `church_ministry/modules/support/visitation-care.html` | 部份 | Y | 已盤 |

（自行複製最後一列往下加。）

---

## 4. 盤點補充表 — 與 §3 同 ID

| ID | 主線備註 | 風險 | 負責人 |
|----|----------|------|--------|
| P0-001 | 定為靈命調查唯一入口；其餘同類頁導流到此 | 舊連結未收斂會造成雙軌填答 | TBD |
| P0-002 | 保留作導流頁，不再作獨立主流程 | 儲存鍵與 P0-001 不一致，易產生資料分裂 | TBD |
| P0-003 | 僅保留歷史參考，加入退役候選 | 小白誤入舊版導致結果不可比 | TBD |
| P0-005 | 與 P0-001/P0-004 功能重疊，先留觀察 | 長期維護成本高、規則口徑可能分岔 | TBD |
| P0-007 | 規劃主線鎖定 `chp2026-*` | 舊 `longTermPlanning_*` 未遷移前報表不一致 | TBD |
| P0-011 | Kanban 作為所有計劃頁共用下一步 | 若未統一 Next，使用者停在靜態分析頁 | TBD |
| P0-012 | 歸為試行/過渡頁，資料需映射至 `chp2026-*` | 沒有 migration 腳本時會雙資料源 | TBD |
| P0-014 | 評估結果應直接串接 P0-015/P0-016 | 若 Next 斷裂，問卷價值下降 | TBD |
| P0-018 | 歸為重複；保留期間只做導流與說明 | 問卷入口過多、同工難訓練 | TBD |
| P0-019 | 配對流程與教會 member 主資料整合 | 權限未上線前，匯出欄位有外洩風險 | TBD |
| P0-022 | 新版 SWOT 與舊 `swot-planning.html` 並存 | 若不標主線，會同時維護兩套流程 | TBD |
| P0-023 | SMART 頁已定主線，需強制導向 Kanban | 目標不落地將造成「完成度幻覺」 | TBD |
| P0-026 | AI 摘要頁僅能引用已結構化欄位 | L3 若越權，會與 L2 規則衝突 | TBD |
| P0-029 | 配對入口需與 `matching.html` 單線收斂 | 多入口不同語意會造成配對結果不一致 | TBD |
| P0-031 | 恩賜技能統一頁承載關鍵資料 | 鍵名若不對齊契約，migration 成本增高 | TBD |
| P0-033 | 資料收集頁屬高頻入口 | 若缺 schemaVersion 將難追溯批次資料 | TBD |
| P0-035 | 志工整合頁與配對頁雙向依賴 | 缺 RBAC 時易暴露不該顯示欄位 | TBD |
| P0-037 | 小組頁承接調查輸出 | 若 Next 回圈導回問卷，使用者挫折高 | TBD |
| P0-040 | 探訪關懷頁屬執行末端 | 無 workflow 回寫則 PDCA 斷鏈 | TBD |
| P0-042 | 訓練課程頁與規劃鏈對接 | 若未回寫 Kanban，執行進度不可追蹤 | TBD |
| P0-045 | 敬拜團隊管理頁屬配對落地頁 | 若未串志工主資料會造成排班重複 | TBD |
| P0-047 | 媒體製作與直播頁雙向耦合 | 若無標準 handoff 會出現流程斷點 | TBD |
| P0-050 | 統計報表頁匯總跨模組資料 | 缺欄位權限遮罩會暴露敏感資料 | TBD |
| P0-051 | 績效評估頁影響決策 | 規則不可追溯時，評估信任度下降 | TBD |
| P0-054 | 參與度分析頁需連動小組資料 | 指標定義不一會導致假趨勢 | TBD |
| P0-055 | 宣教事工頁與拓展頁並行 | 若主線未固定會雙軌規劃 | TBD |
| P0-057 | 成長追蹤頁承接配對結果 | 缺 migration 會使歷史趨勢中斷 | TBD |
| P0-058 | 績效分析頁與 analytics 模組重疊 | 指標口徑不一致會產生衝突報告 | TBD |
| P0-060 | 領袖指南頁為高影響入口 | 若 Next 指向不一致，團隊執行偏差大 | TBD |
| P0-061 | 人才招募與追蹤頁是配對前段入口 | 若入口散落將造成重複建檔 | TBD |
| P0-064 | 恩賜盤點頁直接影響配對品質 | 若量表不一致會降低推薦可信度 | TBD |
| P0-066 | MBTI 測評頁定位為導流輔助 | 若誤作主線會偏離事工配對目標 | TBD |
| P0-069 | 人才池示範頁屬試行工具 | 若與正式資料混用將污染主資料 | TBD |
| P0-071 | 志工報表頁串接分析模組 | 欄位未遮罩會有個資外洩風險 | TBD |
| P0-073 | 智慧推薦頁承接多來源資料 | 推薦規則不可追溯時難以治理 | TBD |
| P0-075 | 詩班/樂手團隊頁屬配對落地 | 若不回寫主檔會產生重複名單 | TBD |
| P0-078 | 敬拜報表頁回寫 PDCA 是關鍵閉環 | 若缺回寫將形成只讀報表 | TBD |
| P0-080 | 團契管理頁承接關懷執行 | Next 若跳錯將中斷關懷流程 | TBD |

---

## 5. Next 導向矩陣（條件 → 建議下一步）

> 將「建議 Next」改為站內**真實路徑或聯絡流程**；原則：**不導更多問卷**，導向可執行、可問責。

| 類型 | 條件（簡述） | 建議 Next（站內真實路徑） |
|------|--------------|--------------------------------|
| 調查 | 多維度偏低或紅旗集中 | `church_ministry/modules/development/discipleship-training.html`（安排陪伴＋訓練） |
| 調查 | 心聲提家庭／工作張力 | `church_ministry/modules/fellowship/small-groups.html`（先進小組支持） |
| 調查 | 只需自我操練 | `church_planning/planning/workflow.html`（進入 4 週行動） |
| 計劃 | 有 SWOT、無 SMART 焦點 | `church_planning/smart-planning.html` |
| 計劃 | SMART 多、無看板 | `church_planning/planning/kanban.html` |
| 計劃 | 執行無檢核 | `church_planning/pdca-planning.html` |
| 配對 | 已產生推薦 | `church_ministry/modules/volunteer/volunteer-management.html`（進試作排班） |
| 配對 | 資料不足 | `smart_ministry/assessment.html`（補必要欄位，不新增問卷類型） |
| 混合 | 調查已完成 | `church_planning/planning/index.html`（以結果建立可追蹤計畫） |

---

## 6. 主線決策表（盤點後填）

| 議題（兩頁以上比較） | 決議（主入口／導流／退役） | 日期 |
|----------------------|----------------------------|------|
| `spiritual_app/index.html` vs `index_spiritual.html` vs `信徒靈性生命健康自我審查.html` | 主入口：`spiritual_app/index.html`；導流：`spiritual_app/index_spiritual.html`；退役候選：`信徒靈性生命健康自我審查.html`（保留歷史，不作主流程） | 2026-05-01 |
| `longTermPlanning_*` vs `chp2026-*` 規劃主線 | 主入口與後續增量一律採 `chp2026-*`；`longTermPlanning_*` 歸試行，先導流再安排 migration | 2026-05-01 |
| Smart Ministry 問卷入口（`assessment` / `talent_main_survey` / `questionnaire_system`） | 主入口：`assessment.html`；導流：`talent_main_survey.html`；重複候選：`questionnaire_system.html` | 2026-05-01 |
| 規劃鏈路（`planning/survey` / `planning/swot` / `planning/goals` / `planning/kanban`） | 主鏈固定：`survey -> swot -> goals -> kanban -> pdca`；任何分支頁需回主鏈，不可自成一套 | 2026-05-01 |
| 配對落地鏈（`ai_pairing_landing` / `matching` / `volunteer-integrated`） | 主入口：`ai_pairing_landing.html`；主流程：`matching.html`；執行落地：`volunteer-integrated.html` | 2026-05-01 |
| 敬拜/媒體執行鏈（`worship-management` / `video-production` / `live-streaming`） | 主入口：`worship-management.html`；執行鏈：`video-production -> live-streaming`；排班落地：`volunteer-management.html` | 2026-05-01 |
| 研究/分析回寫鏈（`analytics/*` / `research/index` / `planning/pdca`） | 報表與評估一律回寫至 `planning/pdca-planning.html`，避免分析與執行脫節 | 2026-05-01 |
| 人才配對主鏈（`talent_acquisition` / `talent_tracking` / `talent_skill_unified` / `matching`） | 主入口：`talent_acquisition.html`；追蹤：`talent_tracking.html`；配對前置：`talent_skill_unified.html`；主流程：`matching.html` | 2026-05-01 |
| 團隊落地鏈（`member-integrated` / `smart-recommendation` / `choir-team` / `instrument-team`） | 主資料：`member-integrated.html`；推薦：`smart-recommendation.html`；落地：`choir-team.html`、`instrument-team.html`（統一回 `worship-team-management.html`） | 2026-05-01 |

---

## 7. 搜尋關鍵字（表）

| 用途 | 關鍵字／模式 |
|------|----------------|
| 找檔名 | `survey`、`planning`、`swot`、`smart`、`pdca`、`kanban`、`match`、`配對`、`審查`、`diagnosis` |
| 找儲存 | `localStorage.setItem`、`localStorage.getItem`、`STORAGE_KEY` |
| 找教會規劃鍵 | `chp2026`、`longTermPlanning_` |
| 找智慧事奉 | `bible100_smart_ministry` |

---

## 8. 範例列（表）

### §3 主表範例

| ID | Path | 名稱 | 類型 | 主線 | 儲存鍵 | 手冊 | L1 | L2 | L3 | Next | PDF | 匯出 | 狀態 |
|----|------|------|------|------|--------|------|----|----|----|------|-----|------|------|
| P0-EX | `church_planning/spiritual_app/index_spiritual.html` | 屬靈審查治理試行 | 調查 | 試行 | `spiritualSurvey2026-index-spiritual-v1` | Y | Y | 部份 | Y | 待補 | 待測 | N | 已盤 |

### §4 補充表範例

| ID | 主線備註 | 風險 | 負責人 |
|----|----------|------|--------|
| P0-EX | 與 `信徒靈性生命健康自我審查.html` 敘事深度策略待對齊 | 敘事層級不一致 |  |

---

*盤點完成後：可在本檔最上方「版本」列加註完成日期，或於 `PROJECT_MILESTONE_*.md` 寫一句 + 外部試算表 URL。*
