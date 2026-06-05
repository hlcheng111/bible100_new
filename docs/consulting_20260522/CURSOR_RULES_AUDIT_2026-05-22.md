# Cursor Rules Audit for Bible100

Date: 2026-05-22

## Executive Summary

The `.cursor` folder contains useful engineering memory, but it mixes decisions from different project phases. The main problem is not lack of rules; it is that old and new rules are all sitting together without priority. This causes "改新忘舊" and "掛一漏萬": an AI agent may follow an old rule that no longer matches the current `index_v5` architecture.

I created a new project skill:

- `.cursor/skills/bible100-project-governance/SKILL.md`
- `.cursor/skills/bible100-project-governance/references/current-rules.md`

This skill should become the practical entry point for future agents before broad Bible100 work.

## Files Reviewed

| File | Purpose | Current Status |
|---|---|---|
| `.cursor/rules.md` | Original unified development rules | Historical; partially outdated |
| `.cursor/rules/bible100-conventions.mdc` | Static-site conventions | Useful, but some entries outdated |
| `.cursor/rules/bible100-cross-module-data.mdc` | Cross-module data/SSOT rules | Keep |
| `.cursor/rules/bible100-index-shell-sidebar.mdc` | `index_v5` iframe/sidebar rules | Keep; high priority |
| `.cursor/rules/bible100-nav-link-check-after-changes.mdc` | Nav/help/tools link checks | Keep |
| `.cursor/rules/bible100-shell-standard-post-refactor.mdc` | Shell acceptance after refactor | Keep as post-refactor checklist |
| `.cursor/rules/bible100-v2-*` | localStorage / Sheets / cloud migration presets | Keep, but only with explicit mode selection |
| `.cursor/rules/church_ministry_ai_risks.mdc` | Prevent over-editing church ministry | Keep |
| `.cursor/rules/external-source-ingestion.mdc` | Third-party source ingestion for Q&A/AI | Keep |
| `.cursor/rules/module_standards.md` | Early module/sidebar standard | Historical, use selectively |
| `.cursor/rules/safe_refactoring_procedures.md` | Safe cleanup/refactor procedure | Keep principles, update commands |
| `.cursor/skills/bible100-static-site/SKILL.md` | Existing static-site skill | Useful but too small; superseded for governance by new skill |

## Consolidated Current Rules

### 1. Current Mission

- Build Bible100 first for Chinese Bible teachers and Chinese courseware.
- Use AI to create provisional minor-language versions, then require human review.
- Support both local/USB/offline use and online trial.
- Prioritize AI lesson preparation and Bible Q&A before deeper automation.
- Reduce teacher confusion: task-based workflows are more important than showing every module.

### 2. Current Architecture

- `index.html` redirects to `index_v5.html`.
- `index_v5.html` is the main shell.
- The outer shell uses `sidebarFrame` and `contentFrame`.
- Avoid nested shell conflicts, especially any inner page with another `contentFrame`.
- `church_planning` should enter through outer-shell sidebar/content pages, not by embedding `church_planning/index.html` inside the main shell.

### 3. Data Governance

- One canonical write path per domain.
- Use `member_id` for people-related joins.
- Do not create new permanent person IDs unless documenting a migration.
- Do not duplicate the same data into multiple localStorage structures without sync documentation.
- Raw questionnaires, pastoral notes, personal ministry data, and L2/L3 sensitive data must stay local unless explicitly authorized.

### 4. Testing

Use:

```powershell
powershell -ExecutionPolicy Bypass -File tests\run-all-tests.ps1
python scripts\analyze_broken_links_fast.py
python scripts\check_phase_tool_and_nav_links.py
```

Use `file://` for simple static preview. Use local HTTP when JSON, WASM, SQLite, or browser security requires it.

### 5. AI Tooling

For AI lesson prep and Bible Q&A:

- Make teacher-facing workflows.
- Start with prompt generation, not API automation.
- Teacher review is mandatory.
- AI may draft, translate, summarize, and propose questions; it must not become theological authority.

## Contradictions / Outdated Decisions

### A. `file://` only vs local HTTP

Old rule: test with `file://`, do not use localhost.

Current reality: some pages need HTTP for JSON/WASM/SQLite/iframe behavior.

Recommendation: replace with "prefer `file://` for simple static pages; use local HTTP when browser security or data loading requires it."

### B. V1 localStorage vs V2 Sheets SSOT

Old conflict:

- v1 says localStorage is canonical and no cloud upload.
- v2 Sheets SSOT is marked `alwaysApply: true`.

Current user direction: local/USB plus online trial, with teacher simplicity and privacy. This means local-first by default.

Recommendation: change v2 Sheets rule from always active to explicit mode only. Sheets should not silently govern all work.

### C. Old module names

Old rules mention `bible_reading/`, `default_sidebar.html`, `landP_*`, and six languages only.

Current project has `bible_study/`, `index_v5`, `languages/index_cn.html`, `landing_new_cn.html`, and expanded language codes including `my`, `kh`, `lo`.

Recommendation: mark old names as historical references only.

### D. "Do not add files" vs docs/reports/skills

Old rule discourages new files.

Current need: reports, tests, skills, audit docs, and generated guides are valuable.

Recommendation: interpret as "do not add throwaway duplicate production pages." Reports, docs, tests, and skills are allowed when they reduce future confusion.

### E. "All text/buttons as hyperlinks"

This is too broad. Navigation should be links; actions should be buttons.

Recommendation: use proper semantic controls: links for navigation, buttons for actions, form controls for input.

### F. Protect `index_v5` vs modify `index_v5`

Some rules say not to modify `index_v5` experimentally. Other rules require `index_v5` as the main shell.

Recommendation: `index_v5` may be modified when needed, but only with narrow scope and `tests/run-all-tests.ps1`.

## Proposed Rule Cleanup

Do not delete old files immediately. Instead:

1. Keep old rules as historical memory.
2. Add `bible100-project-governance` skill as the current entry point.
3. Later create one concise `.cursor/rules/bible100-current-governance.mdc` if Cursor itself needs a single rule.
4. Change v2 Sheets rule from `alwaysApply: true` to `false` after user approval.
5. Update references from `bible_reading` to `bible_study` where they are not intentionally historical.

## Practical Future Workflow

Before broad work:

1. Read `.cursor/skills/bible100-project-governance/SKILL.md`.
2. If rules conflict, follow the precedence in that skill.
3. Make one themed change batch.
4. Run relevant tests.
5. Write a short change note in `docs/consulting_20260522/` or module docs.

## Immediate Recommendations

High priority:

- Make the new governance skill the default human instruction for future sessions.
- Build the Chinese teacher AI lesson-prep prompt generator.
- Keep sensitive data local-first.
- Do not begin Sheets/cloud migration until a separate explicit plan exists.

Medium priority:

- Create a current governance `.mdc` rule after reviewing this report.
- Update outdated rules about `file://`, `bible_reading`, six languages, and `default_sidebar`.
- Add a lightweight module README template.

Low priority:

- Deep cleanup of old historical folders.
- Broad re-theme of module sidebars.
- Full database/cloud migration.
