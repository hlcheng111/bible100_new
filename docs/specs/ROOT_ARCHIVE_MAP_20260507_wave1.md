# Root Cleanup Archive Map (Wave 1)

Date: 2026-05-07

Scope: root-level legacy entry variants moved to archive (no deletion).

## Moved Files

- `index_v3.html` -> `archive/20260507_root_wave1/index_v3.html`
- `index_temp.html` -> `archive/20260507_root_wave1/index_temp.html`
- `index_v5_church_layout_v1.html` -> `archive/20260507_root_wave1/index_v5_church_layout_v1.html`

## Kept in Root (intentional)

- `index.html` (cloud-safe redirect entry)
- `index_v5.html` (active shell)
- `index_legacy.html` (fallback for `?legacy=1`)

## Verification

- Broken-link smoke check on:
  - `index.html`
  - `index_v5.html`
  - `church_planning/dashboard.html`
- Result: `broken_link_check: OK`

