# Bypass Scan Report (2026-04-29)

## Scope

- `church_ministry/**`
- `smart_ministry/**`
- direct `people.json` references in HTML

## Detection Rules

- direct local storage access:
  - `localStorage.getItem(...)`
  - `localStorage.setItem(...)`
  - `sessionStorage.getItem(...)`
  - `sessionStorage.setItem(...)`
- direct data source reference:
  - `people.json`

## Summary

- `church_ministry`: many pages still access `localStorage` directly
- `smart_ministry`: multiple pages and JS modules still access `localStorage` directly
- direct `people.json` references found in:
  - `church_ministry/dashboard.html`
  - `church_ministry/dashboard_church_layout_v1.html`
  - `church_ministry/load_central_member_seed.html`
  - `index_legacy.html`
  - `help/my-participation.html`
  - `church_ministry/congregation/index.html`

## Priority Classification

- **P0 (critical bypass):**
  - `church_ministry/dashboard.html`
  - `church_ministry/modules/volunteer/volunteer-integrated.html`
  - `church_ministry/modules/finance/finance-integrated.html`
  - `church_ministry/modules/members/member-integrated.html`
  - `smart_ministry/js/database.js`
  - `smart_ministry/js/matching_algorithm.js`
- **P1 (high impact pages):**
  - `church_ministry/modules/worship/worship-integrated.html`
  - `church_ministry/modules/media/live-streaming.html`
  - `smart_ministry/talent_tracking.html`
  - `smart_ministry/talent_ministry_matching.html`
- **P2 (long tail):**
  - remaining pages listed by rg scan in terminal output

## Recommendation

1. Route all KPI and master data reads through `ChurchDataBridge`.
2. Keep local page state only for purely presentational UI preferences.
3. Remove direct `people.json` reads from runtime KPI paths.
4. Add CI scan rule to fail when new bypass appears in P0/P1 folders.
