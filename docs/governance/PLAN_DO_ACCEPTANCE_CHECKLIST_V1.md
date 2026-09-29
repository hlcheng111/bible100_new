# Plan ↔ Do 验收清单 V1（波 1+2 · 薄 SSOT）

> 更新：2026-08-03 · **波 5**（A–G 主路升档）  
> 验收口径：`file:///…/index_v5.html` **Ctrl+F5**

## 波 5 · A–G 主路升档（2026-08-03）

- [ ] 顶栏 **A** → 右栏 `worship-sunday-desk.html`（非 `_landing/worship.html`）；左栏 `sidebar_church_layout_v1?focus=a`
- [ ] 顶栏 **B** → 右栏 `small-groups-integrated.html`；**不**再被侧栏劫持到探访页
- [ ] 主日一桌「缺席→探访」经 `ChurchDataBridge.savePastoralFollowup`（非独立 localStorage 桶）
- [ ] Standalone `church_ministry/index.html?focus=a|b` 与顶栏2 同主路
- [ ] 自动化：`python church_ministry/tests/test_cm_phase2_wave.py` + `python tests/test_church_nav_ui_contract.py` → OK

## 波 4 · Do→Plan 回饋（2026-08-03）

- [ ] dashboard **↩ Do→Plan** 面板：cross-risk 列表 + 链到 urgent / RACI / KPI / PDCA
- [ ] 「複製 PDCA Check 草稿」→ 写入 `bible100_do_plan_feedback_v1` 快照
- [ ] **PDCA 季度檢核** Tab② 显示 Do 战情摘要 + 「複製到 Check／Act」
- [ ] 自动化：`python tests/test_plan_do_bridge_wave4.py` → OK

## 波 3 · 四页 member_id（2026-08-03）

- [ ] `CentralMemberDB.set()` / 种子页 → `ChurchDataBridge.saveMemberSystemData`（触发 `b100-cm-data-changed`）
- [ ] ② 探访：`visitMemberId` 下拉（非姓名 fuzzy）；`appendPastoralEvent` 后 dashboard 可刷新
- [ ] ④ 财务：新增收入可选 `incomeMemberId` → 交易带 `memberId`
- [ ] ③ 排班：`fillMemberSelect` 已有（维持）
- [ ] 自动化：`python church_ministry/tests/test_cm_four_pages_bridge.py` → OK

## 第 0 部分 · Plan→Do 交棒（5 条）

- [ ] G 侧栏「📂 行政管理」→ ①～④ / 战情总览：**只换右栏**，左栏仍为 G 战略+行政
- [ ] 进入 Do 页 URL 带 `crm_from=planning_g_admin`（步 6 为 `planning_step6`）
- [ ] 顶栏 **Plan→Do 安全绳**：可回行政 landing / 战情总览 / 健康雷达 / W5 剧本
- [ ] `landing_g_admin.html` 区分 **健康雷达（Plan）** vs **战情总览（Do）**
- [ ] 从步 6 与从 G 行政进入 **同一套** CM 页面（非 placeholder）

## 第 1–4 部分 · 四页 + dashboard（各 3 条速检）

| 页 | F | D | B |
|----|---|---|---|
| ① 会友 | CRUD/搜索 | save 经 Bridge | dashboard 会友数一致 |
| ② 探访 | 任务+记录 | 绑 member_id | overdue 在 dashboard C 维可深链 |
| ③ 排班 | 排班+调班 | 绑 member_id | A 维 RSVP 可深链 |
| ④ 财务 | 收支+预算 | financeSystemData | S 维奉献 KPI 可深链 |
| dashboard | 今日工作桌可点 | Bridge KPI 有 source | save 后 KPI 刷新 |

## 第 5 部分 · Do→Plan 回饋（波 4 · 4 条）

- [ ] dashboard **Plan→Do 橫幅** 显示最近规划量表摘要（AssessmentRunStore）
- [ ] 横幅可回 **G 行政 landing** 与 **健康雷达（Plan）**
- [ ] dashboard **Do→Plan 面板** 显示 cross-risk 并链回 Plan 工具
- [ ] PDCA Check 可 **一键引用** dashboard 本季 Do 摘要（非手抄 Excel）

## 15 分钟 member_id 剧本

1. G 行政 → ① 会友 → 新增或载入 1 人  
2. ② 探訪 → 建任务选同一人  
3. 📡 战情总览 → SPAC 数字非全「—」；点 S/P/A/C pill 深链到对应页  
4. 四页任一 save → dashboard 数字变化（或 F5 一致）

## 自动化

```powershell
python church_ministry/tests/test_cm_phase2_wave.py
python tests/test_church_nav_ui_contract.py
python tests/test_plan_do_bridge_wave1.py
python church_ministry/tests/test_cm_four_pages_bridge.py
python tests/test_plan_do_bridge_wave4.py
```

---

对齐：`CROSS_MODULE_DATA_CONTRACT_V1.md` · `CM_FULL_MATURITY_BUDGET_V1.md` CM-F1/F2
