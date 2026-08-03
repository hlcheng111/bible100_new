# 18 live 工具 · 成熟度状态矩阵

> 更新：2026-08-03 · 工程审计（代码 + 自动化守门）  
> 宪章：`Gold = P0 全过 + ≥80% P1` · `Silver = P0 全过` · `Bronze = 任一 P0 未过`  
> **UX 实测**：待上云（`UX_PRACTICAL_TEST_PLAYBOOK_V1.md`）

## Portfolio 摘要

| 指标 | 值 |
|------|-----|
| 工具数 | 18 live（registry SSOT） |
| 工程成熟度 | **Silver（Portfolio）** |
| Gold 件数 | 0（P1 集群未达 80%） |
| 外站 AI §8「P0 全过」 | 不可信，须以本表为准 |

## P1 集群进度（全站）

| P1 项 | 状态 | 说明 |
|-------|------|------|
| Tab ③ report-heart | 🔄 进行中 | `acs_report_gold.js` 扩展 + 战略壳挂载 |
| 提交按钮字典 | ⏳ 待批 | 多数为「✓ 提交 → xxx 仪表」 |
| Likert 文字锚点 | ⏳ 待批 | 部分仅有 1–5 数字 |
| POST_COMPLETE_CTA | 🔄 进行中 | urgent/culture/8020 等补专属 |
| RunStore id 一致 | ⚠️ 文档化 | kpi 页 boot `kpi` / store `kpiokr` |
| 算法 SSOT | ✅ | `ALGORITHM_SSOT_V1.md` |
| 持久化 audit | ✅ | 本目录 `{tool_id}.md` |
| 自动化守门 | ✅ | `tests/test_planning_tool_acs_gate.py` |

---

## 矩阵

| tool_id | 类型 | HTML | RunStore | 工程成熟度 | P0 | P1 完成估 | 备注 |
|---------|------|------|----------|------------|-----|-----------|------|
| spiritual | T1 | Church_Governance_spiritual_health.html | spiritual | Silver | ✅ | ~70% | report-heart 已有 |
| pastoral | T1 | Church_Governance_pastoral_health.html | pastoral | Silver | ✅ | ~65% | pro 版 extended |
| ncd | T2 | Church_Health_NCD_planning.html | ncd | Silver | ⚠️ | ~55% | Vue+CDN；顶栏无示范钮 |
| shape | T1 | shape-gifts-assessment.html | shape | Silver | ✅ | ~70% | CoachingDesk |
| competency | T1 | ministry-competency-assessment.html | competency | Silver 偏高 | ✅ | ~75% | Tab③④ 金标参考 |
| alda | T1 | alda-leadership-assessment.html | alda | Silver 偏高 | ✅ | ~75% | Tab① 金标参考 |
| johari | T1 | johari-window-assessment.html | johari | Silver | ✅ | ~65% | peer 24+24 |
| disc | T1 | disc-profile-assessment.html | disc | Silver | ✅ | ~65% | |
| mbti | T1 | mbti-self-awareness.html | mbti | Silver 偏高 | ✅ | ~70% | |
| matchmaker | T3 | ministry-position-matchmaker.html | — | Silver | ✅ | ~60% | HITL 汇总的 |
| raci | T4 | planning/raci-reflection.html | chp2026-raci-* | Silver | ✅* | ~60% | *charterExempt 五步法 |
| urgent | T2 | Church_Governance_urgent_matrix.html | urgent | Silver | ✅ | ~65% | 非 Eisenhower 2D |
| swot | T2 | Church_Governance_SWOT_matrix.html | swot | Silver 偏高 | ✅ | ~70% | ST 公式见 SSOT |
| smart | T2 | Church_Governance_SMART_goals.html | smart | Silver 偏高 | ✅ | ~72% | SMART+Care 六维 |
| kpiokr | T2 | Church_Governance_KPI_alignment.html | **kpiokr** | Silver | ✅ | ~68% | 页 boot `kpi` |
| pdca | T2 | Church_Governance_PDCA_cycle.html | pdca | Silver | ✅ | ~65% | Vue B 轨 |
| ministry8020 | T2 | Church_Governance_8020_focus.html | ministry8020 | Silver | ✅ | ~68% | 工作坊非 Likert |
| culture | T2 | Church_Governance_Culture_radar.html | culture | Silver | ✅ | ~68% | trust 3.0 |

---

## Phase 链

| Phase | 工具 |
|-------|------|
| 1 | spiritual, pastoral, ncd |
| 2 | shape, competency, johari, alda (+ disc, mbti advanced) |
| 3 | swot, smart, kpiokr, pdca |
| advanced | urgent, ministry8020, culture, disc, mbti, matchmaker |

活链测试：`python tests/test_strategic_chain_integrity.py`

---

## 下一步 → Gold（单件）

1. P1 三项齐：report-heart 挂载 + 提交钮/锚点（或 charter 豁免说明）+ POST_COMPLETE_CTA  
2. `file://` 该页 Ctrl+F5 工程签收  
3. 上云后 UX 均分 ≥3.5  
4. 更新本表该行为 **Gold**
