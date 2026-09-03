# 18 live 工具 · 成熟度状态矩阵

> 更新：2026-08-03 · 工程审计（代码 + 自动化守门）  
> 宪章：`Gold = P0 全过 + ≥80% P1` · `Silver = P0 全过` · `Bronze = 任一 P0 未过`  
> **UX 实测**：待上云（`UX_PRACTICAL_TEST_PLAYBOOK_V1.md`）

## Portfolio 摘要

| 指标 | 值 |
|------|-----|
| 工具数 | 18 live（registry SSOT） |
| 工程成熟度 | **Silver（Portfolio）** |
| Gold 件数 | 0（全站 UX 实测待上云；工程 P1 第三梯队已齐） |
| 外站 AI §8「P0 全过」 | 不可信，须以本表为准 |

## P1 集群进度（全站）

| P1 项 | 状态 | 说明 |
|-------|------|------|
| Tab ③ report-heart | ✅ 全 18 件 | swot/spiritual/8020 viz + johari/mbti/matchmaker/raci；T1 其余已有 |
| 提交按钮字典 | ✅ 全 18 件 | `acs_survey_standard.js` + 战略壳 + matchmaker/raci |
| Likert 文字锚点 | ✅ 全 18 件 | 战略快评 + johari/mbti + ncd/pdca/pastoral |
| POST_COMPLETE_CTA | ✅ | urgent/culture/8020/disc/mbti/johari 等 |
| RunStore id 一致 | ⚠️ 文档化 | kpi 页 boot `kpi` / store `kpiokr` |
| 算法 SSOT | ✅ | `ALGORITHM_SSOT_V1.md` |
| 持久化 audit | ✅ | 本目录 `{tool_id}.md` |
| 自动化守门 | ✅ | `tests/test_planning_tool_acs_gate.py` |

---

## 矩阵

| tool_id | 类型 | HTML | RunStore | 工程成熟度 | P0 | P1 完成估 | 备注 |
|---------|------|------|----------|------------|-----|-----------|------|
| spiritual | T1 | Church_Governance_spiritual_health.html | spiritual | Silver 偏高 | ✅ | ~78% | viz 内 report-heart |
| pastoral | T1 | Church_Governance_pastoral_health.html | pastoral | Silver 偏高 | ✅ | ~78% | viz 内 report-heart + 字典提交 |
| ncd | T2 | Church_Health_NCD_planning.html | ncd | Silver 偏高 | ⚠️ | ~78% | 顶栏示范钮 + 24题字典；Vue 深度轨保留 |
| shape | T1 | shape-gifts-assessment.html | shape | Silver 偏高 | ✅ | ~75% | CoachingDesk |
| competency | T1 | ministry-competency-assessment.html | competency | Silver 偏高 | ✅ | ~80% | Tab③④ 金标参考 |
| alda | T1 | alda-leadership-assessment.html | alda | Silver 偏高 | ✅ | ~80% | Tab① 金标参考 |
| johari | T1 | johari-window-assessment.html | johari | Silver 偏高 | ✅ | ~78% | report-heart + 字典提交 |
| disc | T1 | disc-profile-assessment.html | disc | Silver | ✅ | ~65% | |
| mbti | T1 | mbti-self-awareness.html | mbti | Silver 偏高 | ✅ | ~78% | report-heart + Likert |
| matchmaker | T3 | ministry-position-matchmaker.html | — | Silver 偏高 | ✅ | ~75% | 顶栏示范 + 字典提交 + heart |
| raci | T4 | planning/raci-reflection.html | chp2026-raci-* | Silver | ✅* | ~72% | *charterExempt；heart 已有 |
| urgent | T2 | Church_Governance_urgent_matrix.html | urgent | Silver 偏高 | ✅ | ~78% | 字典提交 + 锚点 |
| swot | T2 | Church_Governance_SWOT_matrix.html | swot | Silver 偏高 | ✅ | ~82% | ST 公式已对齐 pack |
| smart | T2 | Church_Governance_SMART_goals.html | smart | Silver 偏高 | ✅ | ~82% | SMART+Care 六维 |
| kpiokr | T2 | Church_Governance_KPI_alignment.html | **kpiokr** | Silver 偏高 | ✅ | ~78% | 页 boot `kpi` |
| pdca | T2 | Church_Governance_PDCA_cycle.html | pdca | Silver 偏高 | ✅ | ~80% | A轨字典 + B轨 Vue 工作坊 |
| ministry8020 | T2 | Church_Governance_8020_focus.html | ministry8020 | Silver 偏高 | ✅ | ~78% | 工作坊字典提交 |
| culture | T2 | Church_Governance_Culture_radar.html | culture | Silver 偏高 | ✅ | ~78% | trust 3.0 |

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
