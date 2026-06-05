# Bible100 Current Governance Reference

This file summarizes `.cursor` rules as of 2026-05-22 and resolves conflicts for future work.

## Source Files Reviewed

- `.cursor/rules.md`
- `.cursor/rules/bible100-conventions.mdc`
- `.cursor/rules/bible100-cross-module-data.mdc`
- `.cursor/rules/bible100-index-shell-sidebar.mdc`
- `.cursor/rules/bible100-nav-link-check-after-changes.mdc`
- `.cursor/rules/bible100-shell-standard-post-refactor.mdc`
- `.cursor/rules/bible100-v2-bridge-localstorage-sheets.mdc`
- `.cursor/rules/bible100-v2-migration-m001-m010.mdc`
- `.cursor/rules/bible100-v2-preset-v1-localstorage.mdc`
- `.cursor/rules/bible100-v2-preset-v2-sheets-ssot.mdc`
- `.cursor/rules/bible100-v2-preset-v3-future-cloud.mdc`
- `.cursor/rules/church_ministry_ai_risks.mdc`
- `.cursor/rules/external-source-ingestion.mdc`
- `.cursor/rules/module_standards.md`
- `.cursor/rules/safe_refactoring_procedures.md`
- `.cursor/skills/bible100-static-site/SKILL.md`

## Still Valid

- Work in Chinese for the user.
- Treat Bible100 as a static multi-module site.
- Protect `index_v5.html` as the main shell.
- Keep `contentFrame` and sidebar target behavior consistent.
- Avoid nested iframe shells unless explicitly designed.
- Use tests after edits.
- Keep single source of truth for data.
- Protect personal, questionnaire, and ministry-sensitive data.
- Use structured external-source ingestion for Q&A or third-party material.
- Avoid uncontrolled broad refactors.

## Needs Updating / Historical Only

- Old references to `bible_reading/` as core are historical; current main Bible module is `bible_study/`.
- `default_sidebar.html`, `landP_*`, and old six-language-only assumptions are outdated for the current `index_v5` language structure.
- "Do not use localhost" is too strict; use local HTTP when JSON/WASM/browser security requires it.
- `bible100_new_p01/` as delivery root appears outdated unless the user restores that packaging flow.
- "All text/buttons must be hyperlinks" is too broad; use real buttons for actions and links for navigation.
- "Do not add files" conflicts with current need for reports, docs, skills, and test tooling. Interpret as "do not add throwaway test pages or duplicate production pages."
- V2 Sheets SSOT marked `alwaysApply: true` conflicts with offline/local-first rules and current user direction. Treat Sheets as explicit v2 mode only.

## Current Defaults

- Default mode: local/offline-first plus online trial.
- Default data mode: localStorage/static files unless the user explicitly requests Sheets/cloud migration.
- Default AI mode: prompt generator and teacher review, not autonomous API decisions.
- Default language workflow: Chinese source -> AI provisional translation -> human review.

## Red Flags

Ask for confirmation before:

- Uploading raw survey, member, Smart Ministry, or pastoral data.
- Replacing localStorage canonical with Sheets.
- Removing archived/historical directories.
- Refactoring `index_v5.html` broadly.
- Adding npm dependencies or converting static modules to React/Vite/Next.
- Changing Q&A source taxonomy generated from third-party sites without source review.

## Recommended Check Commands

```powershell
powershell -ExecutionPolicy Bypass -File tests\run-all-tests.ps1
python scripts\analyze_broken_links_fast.py
python scripts\check_phase_tool_and_nav_links.py
```

Use `check_phase_tool_and_nav_links.py` specifically after `nav_hub/`, `help/`, or `tools/` navigation changes.
