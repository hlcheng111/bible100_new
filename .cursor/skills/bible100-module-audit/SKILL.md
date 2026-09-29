---
name: bible100-module-audit
description: >-
  Audits Bible100 modules with beginner+expert dual lens (3-click, closed-loop,
  demo vs real, cloud parity). Use when user asks 巡查、查核、體檢、5星、小白專家、
  功能整全、互聯互用、demo、敢不敢用、module review, maturity, or painful UX of
  church_ministry / ai_tools / bible_study / index_v5, or cross-module links between
  聖經研讀 and AI Lab.
---

# Bible100 模組雙視角巡查

## When to use
User says 巡查／查核／體檢／5 星／小白與專家／真可用嗎／demo 嗎／互聯互用／功能整全.

## Cross-module pattern（例：聖經研讀 ↔ AI Lab）
1. List entry pages from `index_v5` → study mode vs ai mode (sidebar + landing).
2. Map links: runway read-done → D/E; study → interlinear; ai → guide_reading_hub / workbench.
3. Classify each page: **真用 / demo / 占位 / 老師專用**; note if student path accidentally hits teacher tools.
4. Score 互聯 1–5: same passage context (`book/chapter/ref`) carried or lost?
5. Output table + Top3 gaps; recommend one wave (e.g. hide demo from runway, not rebuild Lab).

## Steps
1. Lock entry URLs: `index_v5` → module topbar / sidebar / landing.
2. **Beginner checklist**: ≤3 clicks; cognitive load; location awareness; one-sentence task entry; warm copy (no engineer jargon on first screen).
3. **Expert checklist**: real workflow vs demo shell; closed-loop (e.g. absence→visit); role split front/back; broken/404/slow; local≈cloud.
4. Output (keep short):
   - Score 小白 / 專家 each 1–5 + one-line why
   - Top 3 hub pages to fix first
   - Recommended next cut (one wave, one theme)
5. If user says 執行: implement that wave only; deliver file:// acceptance list (top / left / right). Do not renovate multiple modules' IA in one go.

## References
- `docs/governance/PRODUCT_CONSTITUTION_V1.md`
- `docs/phase1_narrative/02_PRODUCT_BLUEPRINT.md` §7–8
- `.cursor/rules/bible100-collaboration-contract.mdc`
