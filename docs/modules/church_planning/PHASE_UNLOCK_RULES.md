# Phase 解鎖規則（工程 SSOT）

## Phase 1（永遠解鎖）

- `spiritual`, `pastoral`, `ncd`
- 預設首發：`spiritual`（13 題）

## Phase 2 解鎖條件

- Phase 1 至少 1 份非 demo `AssessmentRunStore` run

## Phase 3 解鎖條件

- Phase 1 完成 **且**（Phase 2 至少 1 run **或** 戰情室已掃描）
- 戰情室掃描旗標：`localStorage` `bible100_planning_war_room_scanned_at`

## 側欄

- 步 2：僅 Phase 1+2 工具（`SIDEBAR_STEP2_TOOL_IDS`）
- 步 5：Phase 3 + 進階策略工具

## 測試

```powershell
python tests/test_planning_phase_gate.py
python tests/test_planning_recommend_engine.py
```
