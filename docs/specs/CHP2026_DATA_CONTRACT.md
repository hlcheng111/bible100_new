# CHP2026 Data Contract (SSOT)

## Scope

This contract defines authoritative keys and cross-module write rules for:

- `church_planning/*`
- `smart_ministry/*`
- `school_management/*`
- `central_member_db/*`

## SSOT Rules

- Member data SSOT: `memberSystemData` (via `CentralMemberDB.get/set`)
- Planning namespace SSOT: `chp2026_<church_id>_<baseKey>` (via `LongTermPipeline`)
- Legacy planning keys are read-only fallback and must not be written by new pages

## Canonical Keys

- Planning:
  - `chp2026_<church_id>_longTermPlanning_step0`
  - `chp2026_<church_id>_longTermPlanning_theology`
  - `chp2026_<church_id>_longTermPlanning_surveys`
  - `chp2026_<church_id>_longTermPlanning_summary`
  - `chp2026_<church_id>_longTermPlanning_swot`
  - `chp2026_<church_id>_longTermPlanning_goals`
- Legacy fallback (read only):
  - `longTermPlanning_*`
- Governance:
  - `chp2026-pdca-log`
  - `chp2026-resolution-log`
  - `chp2026-governance-report-bundle`
  - `chp2026-pdca-snapshots`
- Member SSOT:
  - `memberSystemData`

## Field Naming Constraints

- Course credit field: **`training_credits`** (required exact key)
- Goal trace fields:
  - `swotRef.quadrant`
  - `swotRef.itemId`
- Orphan diagnostics:
  - `_isOrphaned`
  - `_orphanReason`

## Write Path Rules

- Do not write `localStorage` directly from feature pages when SSOT adapter exists.
- Use:
  - `CentralMemberDB.set(db)` for member updates
  - `LongTermPipeline.save*()` for planning updates
- Optional bridge events:
  - `ChurchDataBridge.triggerDataSync(...)`
  - `ChurchDataBridge.onGoalsUpdated(...)`

