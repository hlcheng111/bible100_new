# Phase 0 鍵名對齊表（Data Contract Alignment）

- 日期：2026-05-01
- 範圍：`PHASE0_INVENTORY_CHECKLIST.md` P0-001 ~ P0-080
- 目的：對齊 `docs/DATA_CONTRACT_v0.1.md`，降低雙軌鍵名與 migration 風險。

---

## 1) 主線鍵名（Canonical）

| 類別 | 主線鍵名前綴 | 備註 |
|------|--------------|------|
| 靈命/教會規劃 | `chp2026_*` | 規劃鏈（SWOT/SMART/Kanban/PDCA）統一使用 |
| 智慧事奉 | `bible100_smart_ministry*` | 評估、配對、推薦相關統一使用 |
| 教會成員主資料 | `memberSystemData` | 志工與訓練頁以此為主索引 |

---

## 2) 舊鍵 -> 主線鍵 對照

| 舊鍵 | 主線鍵 | 狀態 | 備註 |
|------|--------|------|------|
| `spiritualSurvey2026-index-spiritual-v1` | `spiritualSurvey2026` | 導流階段 | `index_spiritual` 保留導流，不再作主流程 |
| `longTermPlanning_*` | `chp2026_*` | 待 migration | 先導流，再批次遷移 |
| `bible100_talent_survey` | `bible100_smart_ministry_assessment` | 導流階段 | 主入口為 `assessment.html` |
| `memberSystemData;trainingPlan` | `memberSystemData` + `chp2026_*` | 待整理 | 訓練規劃與教會規劃需橋接 |

---

## 3) P0 前四批 80 筆鍵名盤點

| ID 範圍 | 主鍵策略 | 對齊評估 |
|---------|----------|----------|
| P0-001 ~ P0-006 | `spiritualSurvey2026` / `chp2026_plan_index` | 已收斂，剩舊版導流 |
| P0-007 ~ P0-012 | `chp2026_*`（含試行 `longTermPlanning_*`） | 主線明確，待 migration |
| P0-013 ~ P0-018 | `bible100_smart_ministry*` | 主線明確，重複入口待下波清理 |
| P0-019 ~ P0-020 | `memberSystemData` (+ `trainingPlan`) | 已可運作，需與規劃鍵橋接 |
| P0-021 ~ P0-028 | `chp2026_*`（planning 新鏈） | 第二批已補齊主鏈路徑 |
| P0-029 ~ P0-034 | `bible100_smart_ministry*`（配對擴展） | 第二批已補齊配對落地 |
| P0-035 ~ P0-040 | `memberSystemData`（志工/關懷執行） | 第二批已補執行端回寫路徑 |
| P0-041 ~ P0-048 | `memberSystemData`（教育/敬拜/媒體） | 第三批已補教育與敬拜媒體鏈 |
| P0-049 ~ P0-054 | `memberSystemData`（媒體AI/分析/研究） | 第三批已補分析回寫鏈 |
| P0-055 ~ P0-060 | `memberSystemData` + `bible100_smart_ministry*` | 第三批已補宣教與智慧事奉增量鏈 |
| P0-061 ~ P0-070 | `bible100_smart_ministry*`（人才/恩賜/配對擴展） | 第四批已補配對前段與示範頁治理 |
| P0-071 ~ P0-080 | `memberSystemData`（志工/團隊/團契落地） | 第四批已補配對落地與回寫鏈 |

---

## 4) Migration 優先序（建議）

1. `spiritualSurvey2026-index-spiritual-v1` -> `spiritualSurvey2026`
2. `longTermPlanning_*` -> `chp2026_*`
3. `bible100_talent_survey` -> `bible100_smart_ministry_assessment`
4. `trainingPlan` 與 `chp2026_*` 建立橋接 adapter

---

## 5) 執行原則

- 不直接刪舊鍵，先導流、再 migration、最後清理。
- migration 期間保留 `schemaVersion` 與來源標記，避免結果不可追溯。
- 新頁面禁止新增未登記鍵名。