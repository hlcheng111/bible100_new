# Root Cleanup Archive Map (Wave 3)

Date: 2026-05-07

Scope: root-level non-core text/html files moved to archive (no deletion).

## Moved Files

- `?? Bible 100 - ????????????.txt` -> `archive/20260507_root_wave3/?? Bible 100 - ????????????.txt`
- `????.txt` -> `archive/20260507_root_wave3/????.txt`
- `????.html` -> `archive/20260507_root_wave3/????.html`
- `?????(?????).html` -> `archive/20260507_root_wave3/?????(?????).html`

## Kept in Root (intentional runtime/core)

- `index.html` (cloud-safe redirect entry)
- `index_v5.html` (active shell)
- `index_legacy.html` (fallback for `?legacy=1`)
- `service-worker.js`, `manifest.json`, `.htaccess`
- startup scripts (`*.bat`, `*.cmd`) for local serving

## Verification

- Broken-link smoke check on:
  - `index.html`
  - `index_v5.html`
  - `church_planning/dashboard.html`
- Result: `broken_link_check: OK`

