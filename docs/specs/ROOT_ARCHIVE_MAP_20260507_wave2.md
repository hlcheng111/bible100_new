# Root Cleanup Archive Map (Wave 2)

Date: 2026-05-07

Scope: root-level documents and helper scripts moved to archive (no deletion).

## Moved Files

- `_gen_sidebar_table.py` -> `archive/20260507_root_wave2/_gen_sidebar_table.py`
- `_inventory_html_exclude_languages.txt` -> `archive/20260507_root_wave2/_inventory_html_exclude_languages.txt`
- `_patch_sidebar_site_html.py` -> `archive/20260507_root_wave2/_patch_sidebar_site_html.py`
- `LOCAL_SERVER.txt` -> `archive/20260507_root_wave2/LOCAL_SERVER.txt`
- `MODIFICATION_PLAN.md` -> `archive/20260507_root_wave2/MODIFICATION_PLAN.md`
- `patch_spiritual_survey_ui.py` -> `archive/20260507_root_wave2/patch_spiritual_survey_ui.py`
- `Planni1.jpg` -> `archive/20260507_root_wave2/Planni1.jpg`
- `PROJECT_MILESTONE_2026-04-29.md` -> `archive/20260507_root_wave2/PROJECT_MILESTONE_2026-04-29.md`
- `README_????.md` -> `archive/20260507_root_wave2/README_????.md`
- `SITE_?????_??languages.html` -> `archive/20260507_root_wave2/SITE_?????_??languages.html`
- `SITE_?????_??languages.md` -> `archive/20260507_root_wave2/SITE_?????_??languages.md`
- `SITE_???_????.md` -> `archive/20260507_root_wave2/SITE_???_????.md`
- `SITE_??????_??.html` -> `archive/20260507_root_wave2/SITE_??????_??.html`
- `??????.md` -> `archive/20260507_root_wave2/??????.md`
- `????????.md` -> `archive/20260507_root_wave2/????????.md`

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

