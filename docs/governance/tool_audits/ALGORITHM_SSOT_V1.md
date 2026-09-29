# 算法 SSOT v1（文档 = 代码）

> 外站 audit 卡须以此为准，勿用教科书公式替代 pack 实作。

## urgent · 轻重缓急

| 项目 | SSOT |
|------|------|
| 模型 | **非** Eisenhower 重要性×紧迫度 2D 矩阵 |
| 实作 | 12 题 quadrant-tagged Likert + 2 authenticity → `computeQuadrantPercents()` → Q1–Q4 % |
| 上游 | `loadUpstreamChain()` 读 spiritual → **仅 coaching 文案**，不改象限 |
| 文件 | `church_planning/js/tool_packs/urgency_pack.js` |

## swot · 战略矩阵

| 项目 | SSOT |
|------|------|
| W 轴 | NCD `minimum_factor.score` 存在时 **刚性锁定** `W_avg`（`resolveAxisAverages`） |
| TOWS 交叉分 | `P_SO = S×O`, `P_WO = W×O`, **`P_ST = S×T`**, `P_WT = W×T`（**T 不取反**） |
| 百分制 | `cross_scores.ST = (S/5)×(T/5)×100` |
| 牧养覆写 | `calculateMatrix()` 当 Delta 大且 W 低等条件 → 主策略 WO |
| 文件 | `church_planning/js/tool_packs/swot_pack.js` |

**文档修正**：Tab① 若写 `P_ST = (S/5)×((5−T)/5)×100` 为**旧白皮书**，以 pack 为准或改文案对齐。

## ncd · 教会健康

| 项目 | SSOT |
|------|------|
| 快评 | 24 题 → 八维均分（每维 3 题）→ `computeMinimumFactor()` 最低维 |
| 深度 | Vue 十步 → `chp2026-health-result` → `migrateLegacyFromStorage()` 双写 RunStore |
| RunStore | `tool_id: ncd` |
| 文件 | `church_planning/js/tool_packs/ncd_pack.js` |

## culture · 长执同心

| 项目 | SSOT |
|------|------|
| 四向度 | vision_commit / servant_life / truth_practice / team_trust |
| CVAM | 四象限由四维 blend 算出（另一层，勿与四向度混称） |
| 信任门槛 | `team_trust < 3.0` → `TRUST_BREACH` |
| RunStore | `tool_id: culture`（非 culture-radar） |

## smart · 教会版 SMART

| 项目 | SSOT |
|------|------|
| 维度 | **六向度** SMART+Care（15 题），非纯 SMART 五维 |
| 漏斗 | alignment / load_cost / feasibility / execution / sustain + PDCA 四齿轮 `buildPdcaGuide()` |
| 文件 | `church_planning/js/tool_packs/smart_pack.js` |

## kpiokr · KPI/OKR

| 项目 | SSOT |
|------|------|
| 四向度 | kr_quality / vision_align / review_rhythm / pastoral_balance |
| 卡关 | `resource_stuck_rate ≥ 70` → `RESOURCE_STUCK` → 下游推 8020 |
| RunStore | **`kpiokr`**（页面 boot 别名 `kpi`） |

## ministry8020 · 80/20

| 项目 | SSOT |
|------|------|
| Tab② | 团队工作坊行（mission/fruit/admin/effort），非 Likert 问卷 |
| RunStore | `ministry8020` |

## 活链（已测）

见 `tests/test_strategic_chain_integrity.py`：NCD→SWOT W · SWOT→PDCA · KPI stuck→8020 · PDCA→CRM flag
