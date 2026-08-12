---
name: bible100-planning-tool-audit
description: >-
  Deep audit church_planning ACS survey tools (17+1 canonical): produce tool
  audit cards, four-role reviews (consultant/pastor/engineer/user), PATCH lists,
  and unified Tab copy. Use when auditing spiritual/urgent/SWOT/competency tools,
  questionnaire content, coaching handbooks, or planning tool IA before merge.
---

# Bible100 · 教會規劃工具 ACS 深研

## When to use

- User asks to **深研 / 評審 / audit** a `church_planning` tool or questionnaire
- Before merging preview sidebar or changing `*_pack.js` / ACS four-Tab pages
- Multi-AI review workflow (R1–R4 roles)
- Phase3 chain audit (swot → smart → kpiokr → pdca)

## Primary prompt file

Read and follow:

- 專家深研：`docs/governance/prompts/UNIVERSAL_TOOL_AUDIT_AND_REVIEW.md`
- UX 實測：`docs/governance/prompts/UX_PRACTICAL_TEST_MASTER.md`

Modes:

| Mode | Purpose |
|------|---------|
| **A** | First audit card v1 (no code changes) |
| **B** | Single-role review (R1/R2/R3/R4) — one role per AI session |
| **C** | Merge reviews → audit v2 + PATCH |
| **D** | One AI simulates all four roles (optional) |

## SSOT references

| Topic | File |
|-------|------|
| Charter + Gold/Silver/Bronze | `docs/governance/PLANNING_TOOL_AUDIT_CHARTER_V1.md` |
| Tab/button/disclaimer copy | `docs/governance/PLANNING_TOOL_COPY_UI_DICTIONARY_V1.md` |
| 18-tool schedule | `docs/governance/PLANNING_TOOL_AUDIT_SCHEDULE_V1.md` |
| Audit template | `docs/governance/tool_audits/_TEMPLATE_TOOL_AUDIT.md` |
| Status matrix | `docs/governance/tool_audits/TOOL_STATUS_MATRIX.md` |
| Tool registry | `church_planning/js/planning_tool_registry.js` |
| Phase unlock | `church_planning/js/planning_phase_config.js` |
| UI shell CSS | `church_planning/css/assessment_coaching_shell.css` |

## Gold reference pages

- Tab① `church_planning/alda-leadership-assessment.html`
- Tab② `church_planning/Church_Governance_SWOT_matrix.html`
- Tab③④ `church_planning/ministry-competency-assessment.html`

## Workflow (default)

1. **MODE A** → save `docs/governance/tool_audits/{tool_id}.md`
2. User runs **MODE B** ×4 with different AIs (or MODE D once)
3. **MODE C** → audit v2; user approves P0 PATCH
4. Implement PATCH: prefer `tool_packs/*.js` for questions/scoring; HTML for Tab① copy; `coaching_desk_content.js` for Tab④
5. Acceptance: `file:///C:/Users/hlche/.cursor/bible100_new/church_planning/{path}` Ctrl+F5
6. Update `TOOL_STATUS_MATRIX.md` row

## Tool types

- **T1** personal assessment (spiritual, shape, competency, alda, johari, disc, mbti)
- **T2** strategic (ncd, swot, smart, kpiokr, pdca, urgent, culture, ministry8020)
- **T3** matchmaker (HITL only, no re-score)
- **T4** raci workdesk (charterExempt, no Likert four-Tab)
- **T5** Phase3 link batch (four tools one audit)

## PATCH priority

1. P0 Tab names + Tab① quickstart + disclaimer
2. P0 loadDemoReport + submit → Tab③
3. P1 report-heart, Tab④ coaching structure
4. P2 CSS unify to `assessment_coaching_shell.css`

## Review conflict rules

- Tone / pastoral: **R2 pastor wins**
- file:// / maintainability: **R3 engineer wins**
- Phase / methodology: **R1 consultant wins**
- Novice clarity: **R4 user** — if score ≤2, block Gold until Tab① fixed

## Do not

- Auto-commit unless user asks
- Treat extended tools as canonical without audit note
- Use HR/performance-review tone in reports
- Skip HITL disclaimer on assessments

## Filled examples

- `docs/governance/prompts/FILLED_spiritual_MASTER.md`
- `docs/governance/prompts/FILLED_urgent_MASTER.md`

## Tests (after code PATCH)

```powershell
python tests/test_sidebar_plan_v5_preview.py
```

If touching `index_v5` or registry: `python tests/test_index_v5_shell.py`
