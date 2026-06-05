---
name: bible100-project-governance
description: Use when working on Bible100 project governance, Cursor rules, architecture decisions, module boundaries, testing policy, data SSOT, safe refactoring, AI teaching tools, or when reconciling old `.cursor` rules with current Bible100 development.
---

# Bible100 Project Governance

## Operating Priority

Use this skill before broad Bible100 changes, cross-module edits, data model changes, `index_v5.html` shell work, AI teaching tools, questionnaire/survey work, or cleanup/refactor tasks.

Current project direction:

1. Primary user: Chinese Bible teachers and Chinese courseware first.
2. Minor-language versions: AI-assisted provisional translations, then human review.
3. Deployment: both local/USB/offline and online trial at `https://bible100.lovestoblog.com`.
4. AI priority: lesson preparation, Bible Q&A, courseware translation/checking.
5. Main UX risk: teachers do not understand how to use the site.

## Rule Precedence

When old Cursor rules conflict, apply this order:

1. User's latest explicit instruction.
2. Safety and data privacy rules.
3. Current `index_v5.html` shell reality and passing tests.
4. Current module/data contracts in active docs and code.
5. Older `.cursor/rules.md`, `module_standards.md`, and early 2025 rules only as historical guidance.

Do not treat all `.cursor` files as equally current.

## Current Architecture

- Root entry: `index.html` redirects to `index_v5.html`.
- Main shell: `index_v5.html`, with outer `sidebarFrame` and `contentFrame`.
- Core modules include `languages/`, `bible_study/`, `ai_tools/`, `qna/`, `church_ministry/`, `church_planning/`, `school_management/`, `smart_ministry/`, `hymn_management/`, `nav_hub/`, `tools/`, `help/`.
- Avoid nested shells: do not load a module shell containing another `contentFrame` into the outer `contentFrame` unless the module is explicitly designed for embed mode.
- For `church_planning`, prefer outer shell sidebar/content pages (`sidebar_plan.html`, `index_plan.html`) over embedding `church_planning/index.html` inside `index_v5.html`.

## Testing Policy

Run the narrowest useful checks after changes:

- General shell/tests: `powershell -ExecutionPolicy Bypass -File tests\run-all-tests.ps1`
- Static shell check: `python tests\test_index_v5_shell.py`
- Fast broken-link scope: `python scripts\analyze_broken_links_fast.py`
- Nav/help/tools link changes: `python scripts\check_phase_tool_and_nav_links.py`

Testing mode:

- Use `file://` for simple static pages.
- Use local HTTP when pages load JSON, SQLite/WASM, iframe-sensitive resources, or browser security blocks `file://`.

## Data Rules

- Keep one canonical write path per business domain.
- Use `member_id` for people-related joins; do not invent another permanent person ID.
- Do not duplicate the same data into multiple localStorage buckets without a documented sync plan.
- Smart Ministry canonical: `bible100_smart_ministry_main` through `SmartMinistryCanonical` where applicable.
- Current default for sensitive/personal/questionnaire data: local/offline first. Do not upload raw questionnaires, personal notes, L2/L3 sensitive data, or Smart Ministry raw data to Sheets, NotebookLM, or public APIs unless the user explicitly authorizes a migration step.
- Sheets SSOT rules are planning/optional unless the user explicitly asks for v2 online operations.

## AI Teaching Tools

For AI lesson prep and Bible Q&A:

- Build tools as teacher-facing workflows, not just AI links.
- First version should work without API keys: form input -> generated prompt -> copy to Kimi/ChatGPT/Claude/Gemini -> teacher review.
- Every AI answer must be treated as draft material requiring teacher/theological review.
- Prompts must require Scripture references, uncertainty disclosure, no invented verses, no prophetic/pastoral authority claims, and no replacement of pastors/teachers.
- Minor-language output is provisional. Keep Chinese source or Chinese/English bridge visible for review.

## Safe Change Workflow

For broad changes:

1. Inspect current files and active docs first.
2. Keep one change theme per batch.
3. Avoid deleting or moving data/archive/history files unless the user asks.
4. Prefer adding a report or draft plan before destructive cleanup.
5. Update or add docs when changing data contracts, module entry points, AI workflows, or survey logic.
6. Run relevant tests and report exact results.

## References

Read `references/current-rules.md` when asked to review rules, resolve contradictions, plan refactors, or decide whether an old Cursor instruction is still valid.
