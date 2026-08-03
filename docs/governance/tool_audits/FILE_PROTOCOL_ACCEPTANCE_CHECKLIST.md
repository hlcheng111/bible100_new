# file:// 逐页签收清单 v1

> **验收口径**（项目规则）：`file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html` 及下列工具页，**Ctrl+F5 强刷**。  
> **本阶段**：工程自动化 + 文档 SSOT；**用户实测** 留待上云后（见 `UX_PRACTICAL_TEST_PLAYBOOK_V1.md`）。

## 通用签收项（每件 ACS 工具）

- [ ] 顶栏 Tab ①～④ 文案与 Dictionary 一致  
- [ ] Tab ①：`⏱️ 3 分钟入门` + 免责 + `進入測評 →` + `🔍 先看示範報告`（顶栏或 Tab① 内至少一处）  
- [ ] Tab ②：问卷/工作坊可提交 → 自动到 Tab ③  
- [ ] Tab ③：示范 badge、report-heart（现况/风险/一小步）、视觉、下游 CTA  
- [ ] Tab ④：辅导员手册/长执桌可读、HITL  
- [ ] 断网 file:// 可完成示范报告（无 CDN 硬依赖的页面优先）

## 18 live 工具 · file:// URL

| # | tool_id | 页面 | file:// 路径 |
|---|---------|------|----------------|
| 1 | spiritual | 信徒灵命 | `.../church_planning/Church_Governance_spiritual_health.html` |
| 2 | pastoral | 领袖健康 | `.../church_planning/Church_Governance_pastoral_health.html` |
| 3 | ncd | NCD 健康 | `.../church_planning/Church_Health_NCD_planning.html` |
| 4 | shape | SHAPE | `.../church_planning/shape-gifts-assessment.html` |
| 5 | competency | 事奉能力 | `.../church_planning/ministry-competency-assessment.html` |
| 6 | alda | ALDA | `.../church_planning/alda-leadership-assessment.html` |
| 7 | johari | Johari | `.../church_planning/johari-window-assessment.html` |
| 8 | disc | DISC | `.../church_planning/disc-profile-assessment.html` |
| 9 | mbti | MBTI | `.../church_planning/mbti-self-awareness.html` |
| 10 | matchmaker | 媒合 | `.../church_planning/ministry-position-matchmaker.html` |
| 11 | raci | RACI | `.../church_planning/planning/raci-reflection.html` |
| 12 | urgent | 轻重缓急 | `.../church_planning/Church_Governance_urgent_matrix.html` |
| 13 | swot | SWOT | `.../church_planning/Church_Governance_SWOT_matrix.html` |
| 14 | smart | SMART | `.../church_planning/Church_Governance_SMART_goals.html` |
| 15 | kpiokr | KPI | `.../church_planning/Church_Governance_KPI_alignment.html` |
| 16 | pdca | PDCA | `.../church_planning/Church_Governance_PDCA_cycle.html` |
| 17 | ministry8020 | 80/20 | `.../church_planning/Church_Governance_8020_focus.html` |
| 18 | culture | 文化 | `.../church_planning/Church_Governance_Culture_radar.html` |

根路径：`file:///C:/Users/hlche/.cursor/bible100_new/church_planning/`

## 链式 smoke（file:// 或本地 HTTP 均可）

1. NCD 24 题 → Tab ③ 最小因子  
2. SWOT 示范 → W 轴显示 NCD 锁定  
3. KPI 示范 → 卡关率 → 8020 链接  
4. SMART 示范 → 漏斗 + PDCA 齿轮  
5. index_v5 → 教会规划 Hub → 任选一工具侧栏不错栏  

## CDN 高风险页（file:// 须单独签收）

| 页面 | 依赖 |
|------|------|
| `Church_Health_NCD_planning.html` | Tailwind, Vue, Chart.js, Supabase |
| `Church_Governance_SWOT_matrix.html` | Tailwind, Vue, Chart.js |
| `Church_Governance_PDCA_cycle.html` | Vue 工作坊 |

## 签收记录（工程）

| 日期 | 执行者 | 范围 | 结果 |
|------|--------|------|------|
| 2026-08-03 | Agent | 自动化守门 + 文档 SSOT | 待用户上云后 file:// 终签 |
