# 教會事工 · 🧭 規劃 与 🟩 行政 4F · 功能页成熟度报告

**生成日期：** 2026-07-29  
**验收标准：** 以 `file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html` 打开后所见为准（见 `.cursor/rules/bible100-file-protocol-acceptance.mdc`）

> **全选单矩阵请阅：** [`CHURCH_MODULE_MATURITY_AUDIT_V2.md`](./CHURCH_MODULE_MATURITY_AUDIT_V2.md)（顶栏 A–G + 两套侧栏 + 四维 + 路向 + 范本）  
> 本档保留 **规划 18 量表 + 行政 4F** 的细节说明，作为 V2 的补充章节。

**入口说明（file:// 路径）：**

| 你点的 | 左栏 | 右栏 |
|--------|------|------|
| 顶栏 **教會事工** → **G 規劃行政** | `church_planning/sidebar_plan.html` | `church_planning/index_plan.html` |
| 顶栏 **教會事工** → **A–F** 日常工作 | `church_ministry/sidebar_church_layout_v1.html?focus=*` | 各事工页 |
| 左栏 **🧭 回規劃** | 同上规划侧栏 | 规划内容 |
| 规划侧栏 **🟩 6. 進入行政執行** | 切到 `sidebar_church_layout_v1.html?focus=f` | 行政页 |

**成熟度分级（小白版）：**

| 等级 | 含义 | 你怎么判断 |
|------|------|------------|
| **✅ 成熟** | 能填、能存、能导出或走完整问卷闭环 | 有表单/表格、localStorage 或 AssessmentRunStore、侧栏无 `(DEMO)` |
| **🟡 示范 DEMO** | 能点能试，数据在本机 demo，**不是空壳** | 侧栏标 `(DEMO)` 或页内写 demo；如 `worship-management.html` |
| **⏳ 占位** | 明确「尚在准备」 | 打开是 `capability-placeholder.html` |
| **📄 说明页** | 导览/文案，不是业务工作台 | landing、guide、vision |

**关于 `?crm_from=sidebar`：** 只是「从侧栏进来」的情境参数，**不代表**页面不成熟。多数成熟页也会带这个参数。

---

## 一、🧭 規劃分支（`church_planning/`）

**侧栏 SSOT：** `church_planning/sidebar_plan.html`  
**主入口：** `church_planning/index_plan.html`（长执决策 · 属灵前言 + 体量/角色分流）

### 1.1 已成熟（✅）— 18 项 live 量表 + 主 Hub

以下在 `planning_tool_registry.js` 均为 `status: "live"`，具备 pack + 4-Tab 或工作桌 + `AssessmentRunStore` 写入：

| # | 功能页（相对路径） | 用途 | file:// 示例 |
|---|-------------------|------|--------------|
| 1 | `Church_Governance_spiritual_health.html` | 信徒灵命健康 · 13 题快评 | `file:///…/church_planning/Church_Governance_spiritual_health.html` |
| 2 | `Church_Governance_pastoral_health.html` | 领袖健康诊断 · 30 题 | 同上目录 |
| 3 | `shape-gifts-assessment.html` | SHAPE 恩赐 · path_cards | 同上 |
| 4 | `ministry-competency-assessment.html` | 事奉能力 KSA | 同上 |
| 5 | `alda-leadership-assessment.html` | ALDA 领导力 | 同上 |
| 6 | `ministry-position-matchmaker.html` | **事奉媒合中心**（live，见下文占位误链） | 同上 |
| 7 | `Church_Governance_8020_focus.html` | 教会版 80/20 | 同上 |
| 8 | `Church_Governance_urgent_matrix.html` | 重要 vs 紧急 | 同上 |
| 9 | `Church_Governance_SMART_goals.html` | SMART 目标 | 同上 |
| 10 | `Church_Governance_PDCA_cycle.html` | PDCA 循环 | 同上 |
| 11 | `Church_Governance_KPI_alignment.html` | KPI/OKR 对齐 | 同上 |
| 12 | `johari-window-assessment.html` | Johari 盲点 | 同上 |
| 13 | `disc-profile-assessment.html` | DISC 沟通 | 同上 |
| 14 | `mbti-self-awareness.html` | MBTI 简化 | 同上 |
| 15 | `Church_Governance_SWOT_matrix.html` | SWOT 战略矩阵 | 同上 |
| 16 | `Church_Governance_Culture_radar.html` | 文化契合 CVAM | 同上 |
| 17 | `Church_Health_NCD_planning.html` | NCD 教会健康 | 同上 |
| 18 | `planning/raci-reflection.html` | RACI 权责工作桌 | 同上 |

**Hub / 导览（✅ 成熟）：**

| 页面 | 用途 |
|------|------|
| `index_plan.html` | 规划总入口 · 前言与分流 |
| `assessment-os-hub.html` | 健康诊断中心 · 量表超市 |
| `cta-os-war-room.html` | 健康雷达战情室 · 六维合成 |
| `dashboard.html` | 战情只读 KPI 盘 |
| `guides/guide_step1.html`～`guide_step6_crm.html` | 七步导览 |
| `vision.html` | 五年异象全文 |
| `planning-user-guide.html` | 使用说明 |

### 1.2 未成熟（⏳）— 占位页 3 个

| 页面 | 侧栏位置 | 现状 | 应怎么改 |
|------|----------|------|----------|
| `pages/capability-placeholder.html?id=cross-risk` | 步骤 4 · 跨部门风险 * | **尚在准备** · 仅替代做法说明 | **方案 A：** 做真表（读 AssessmentRunStore 多工具输出 → 风险对照表）<br>**方案 B：** 从侧栏移除 `*` 项，避免误导 |
| `pages/capability-placeholder.html?id=matchmaker` | 步骤 6 · 事奉媒合 * | **误链**：live 页已是 `ministry-position-matchmaker.html` | **必改：** 侧栏改连 live 页，删占位链 |
| `pages/capability-placeholder.html?id=leave-swap` | 步骤 6 · 请假调班 * | 占位 | **方案 A：** 接 `volunteer_shift` 排班 + 请假 swap 流程<br>**方案 B：** 暂藏，等 E/F 行政排班稳定再做 |

### 1.3 规划侧栏「参考区」（📄 非主流程）

步骤 7 的文集/导览宪法 **不是** 规划填表主链，小白可忽略：

- `knowledge/index.html` — 三层文集
- `help/site-navigation-guide.html` — 全站导览宪法

---

## 二、🟩 行政 4F（`church_ministry/` · 侧栏 F 区）

**侧栏 SSOT：** `church_ministry/sidebar_church_layout_v1.html` → **⚙️ 行政**（`?focus=f` 时展开 **1. 会员与财政**）

顶栏 **G 規劃行政** 进的是规划；**行政 4F** 指事工侧栏 F 区四个 `<details>` + 顶部快捷项。

### 2.1 顶部快捷（✅ 成熟）

| 页面 | 成熟度 | 说明 |
|------|--------|------|
| `dashboard.html` | ✅ | 事工战情仪表板 · ChurchDataBridge · KPI/Chart |
| `ai_tools/pages/crm_automation_console.html?from_tool=f_admin` | ✅ | 口述预填 · 表单解析 |
| `modules/members/member-integrated.html` | ✅ | 会友主档 6 Tab · 核心 |
| `modules/finance/finance-integrated.html` | ✅ | 财务多 Tab |

### 2.2 详情 1 · 会员与财政（✅）

| 页面 | 成熟度 |
|------|--------|
| `dashboard.html` | ✅ |
| `modules/members/member-integrated.html` | ✅ |
| `modules/finance/finance-integrated.html` | ✅ |

### 2.3 详情 2 · 认路与说明（📄 说明页）

| 页面 | 成熟度 | 建议 |
|------|--------|------|
| `vision_and_plan.html` | 📄 | 保留；链到规划前言即可 |
| `roadmap-overview.html` | 📄 | 保留 |
| `modules/support/help-documentation.html` | 📄 | 保留 |

### 2.4 详情 3 · 其他设定（✅）

| 页面 | 成熟度 |
|------|--------|
| `theme-settings.html` | ✅ localStorage 主题 |
| `custom-page-editor.html` | ✅ 会众入口区块编辑 |

### 2.5 详情 4 · 资产／研究（DEMO · 🟡）

| 页面 | 成熟度 | 说明与改法 |
|------|--------|------------|
| `modules/research/research-integrated.html` | 🟡 trial | 页内注明部分图表示意 → 接真实 CSV/会友统计 |
| `modules/equipment/equipment-management.html` | 🟡 DEMO | 有 CRUD+CSV；可接 `member_id` / 资产编号 |
| `modules/library/library-management.html` | 🟡 DEMO | 同上 |
| `community-overview.html` | 🟡 DEMO | 社群/捐款人 UI demo |

**建议：** 默认折叠「4. 资产／研究」；小白主路径只留 **仪表板 + 会友 + 财务 + 口述预填**。

### 2.6 行政双栏壳（✅）

| 页面 | 用途 |
|------|------|
| `dashboard_church_layout_v1.html` | 左行政侧栏 + 右内容 iframe |
| `dashboard_church_layout_v1_content.html` | 壳内默认右栏 |

从规划 **步骤 6「進入行政」** 会切到此模式（`planningOpenAdmin`）。

### 2.7 维护者工具（非小白日常）

| 页面 | 成熟度 |
|------|--------|
| `admin/demo_data_governance.html` | ✅ 治理 demo/正式数据 |
| `admin/cloud_login.html` | 🟡 需本地 API |

---

## 三、你举的例子：`worship-management.html`

**路径：** `church_ministry/modules/worship/worship-management.html?crm_from=sidebar&role=staff&step=0`

| 项目 | 结论 |
|------|------|
| 是否空壳？ | **否** — 约 37KB，有崇拜 CRUD、modal、localStorage、导出 |
| 为何标 DEMO？ | 侧栏 A 区 **非主路径**；主路径是 **主日一桌**、**worship-integrated** |
| 成熟度 | **🟡 示范 DEMO**（可操作，未接中央会友库） |
| 怎么改好 | ① 与 `worship-sunday-desk` 数据键统一<br>② 讲员/司会下拉接 `member-integrated`<br>③ 或收进「进阶」折叠，避免与 A 顶栏主路重复 |

**file:// 打开：**

`file:///C:/Users/hlche/.cursor/bible100_new/church_ministry/modules/worship/worship-management.html`

---

## 四、A 区其他 DEMO 页（与行政/规划相关度低，但常误点）

侧栏 A 区 `<small>(DEMO)</small>` 共 7 页：讲坛、崇拜礼仪、诗班、器乐、敬拜团队、招待、乐谱。  
均为 **🟡 可操作 DEMO**，不是 ⏳ 占位。敬拜 **主路** 请用：

- `worship-sunday-desk.html` — 主日一桌  
- `worship-integrated.html` — 整合壳  
- `hymn_management/index.html` — 诗歌库（顶栏 **F 詩歌應用**）

---

## 五、优先改进清单（建议波次）

### P0 · 1 天内（减误导）

1. **规划步骤 6**「事奉媒合 *」→ 改链 `ministry-position-matchmaker.html`（live 已存在）
2. 占位页 **cross-risk / leave-swap**：侧栏加「规划中」或暂藏，避免小白当正式功能

### P1 · 1–2 周（行政主线）

1. 会友 / 探访 / 排班 / 财务 **统一 `member_id`**（Smart Ministry 对齐）
2. 口述预填 → 会友表单 **字段映射表** 写进 `help/` 一页说明
3. F 区 DEMO 岛 **默认折叠**，顶栏只保留 4 个快捷

### P2 · 规划闭环

1. **cross-risk**：从战情室读 Store → 导出「跨部门风险」PDF
2. **leave-swap**：在 `volunteer_shift` 加「请假/调班」Tab
3. 规划填完 → 一键「進入行政」并带 `church_id` / 最近 run id

### P3 · 可加入的更好功能（不堆模块）

| 位置 | 功能想法 |
|------|----------|
| 规划 index_plan | 「今天只做 2 张量表」小白向导（按体量自动勾选） |
| 战情室 | 一页 PDF 给长执（六维 + 三条行动建议） |
| 行政 dashboard | 「本周待办」：探访 overdue + 排班缺口 + 财务待审 |
| 会友主档 | 与主日学 roster **只读同步**（已有 education bridge 可加强） |
| 口述预填 | 越南/印尼界面提示（顶栏已四语，表单仍中文可接受） |

---

## 六、统计摘要

| 分区 | ✅ 成熟 | 🟡 DEMO | ⏳ 占位 | 📄 说明 |
|------|---------|---------|---------|---------|
| **🧭 規劃** | 18 量表 + 5 Hub | 0 | **3** | 7 guide + 参考 2 |
| **🟩 行政 4F** | **10** 核心 | **4** 资产岛 | 0 | 3 认路 |
| **A 区 DEMO**（敬拜） | 5 主路 | **7** | 0 | 1 landing |

**最弱：** 规划 3 个占位链（其中 1 个是误链）；行政 F-4 DEMO 岛；A 区 DEMO 与主路并存易混淆。  
**最强：** 18 项规划 live 量表闭环；会友/探访/排班/财务/仪表板。

---

## 七、你怎么在 file:// 自己验收

1. 打开 `file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html` → **Ctrl+F5**
2. 点 **教會事工** → **G 規劃行政** → 左栏应见「五年计划战略路径」
3. 点 **教會事工** → **A** 或左栏 **⚙️ 行政** → 见 F 区四段
4. 任一页若只见「尚在准备」→ 对照上表 **⏳ 占位** 节

---

*维护：改侧栏或 registry 后请同步更新本报告。生成依据：`sidebar_church_layout_v1.html`、`sidebar_plan.html`、`planning_tool_registry.js`、页面体积与 `(DEMO)`/`capability-placeholder` 标记。*
