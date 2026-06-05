# Finance P0 Preheat Scan (2026-04-29)

## Scope

- `church_ministry/modules/finance/finance-integrated.html`

## Direct Storage Bypass Found

- Read bypass: `localStorage.getItem('financeSystemData')`
- Write bypass: `localStorage.setItem('financeSystemData', JSON.stringify(data))`

## Why This Is P0

- `saveData()` already supports `ChurchDataBridge.saveFinanceSystemData(data)`, but fallback direct write remains.
- `loadData()` currently reads local storage directly, bypassing bridge-level guard/sanitizer/audit conventions.

## Next Patch Plan (P0)

- Replace `loadData()` with `ChurchDataBridge.getFinanceSummary()` + a new `ChurchDataBridge.getFinanceSystemData()` (or equivalent normalized accessor).
- Remove direct `localStorage` fallback in `saveData()` and fail closed when bridge is unavailable.
- Add immutable transaction identifiers (`txn_id`) and append-only finance audit log (`finance_audit_logs`) in bridge layer.
- Surface diagnostics in finance UI:
  - totals counted
  - invalid records excluded
  - latest data timestamp / source hint
