# 全站改良进程表 V1（总工程 · 2026-07-29）

> **怎么计阶段？** **以全站波次为主轴**（W0–W5，见产品宪法），**以模块为交付单元**（一次深做一个模的主路径，不三模齐改）。  
> **不是**「七模各写满 V2 矩阵再动刀」——阶段 0 已 Lite 总检完毕。

**相关：** [`SITE_WIDE_LITE_AUDIT_V0.md`](./SITE_WIDE_LITE_AUDIT_V0.md) · [`CROSS_MODULE_DATA_CONTRACT_V1.md`](./CROSS_MODULE_DATA_CONTRACT_V1.md)

---

## 总工程拍板（两项你交给我定的）

| 议题 | 决议 | 理由 |
|------|------|------|
| **DD vs CM-C 谁做主路** | **CM-C 主路**（`education-integrated.html` 主日学工作桌） | 在 `index_v5 → 教會事工` 内，C 顶栏 + 侧栏已 SSOT；会友 roster 应在此读写 |
| **DD（门训动力站）** | **辅助内容库** | 章节/课程素材；**不写** roster、不 duplicate 会友；CM-C 内只留「换模块 → DD」明示出口 |
| **A 区 7 DEMO** | **永久折叠**（非合并删除） | 主路 = 主日一桌；7 页收在「进阶 · 敬拜 DEMO」`<details>` 默认关；阶段 3 再议是否 Tab 并入主日一桌 |
| **HY 诗歌** | **HY 为曲库 SSOT**；Hub F 右栏 = `dashboard.html`（非 L0 壳） | 消除壳中壳 C-02 |

---

## 全站共几阶段？（5 阶段 · 约 3–4 个月节奏）

| 阶段 | 名称 | 范围 | 产出 | 状态 |
|------|------|------|------|------|
| **0** | Lite 总检 | 全站 | 危机清单 + 数据契约 | ✅ 完成 |
| **1** | P0 清雷 + CM 脊梁 | 全站 P0 + **教会模块**主链 | 误链/壳/CRM 清；基本四页 + Bridge | ✅ 1A+1B 完成 |
| **2** | CM 主路升格 | **CM** A/B/D + 规划占位 | 主日一桌、小组、外展 → ✅；cross-risk/leave-swap | ✅ 已落地 |
| **3** | 跨模边界 + 他模 W1 Lite | **SMART/SCH/DD** + Hub embed 清单 | 各模一页边界；壳契约打勾 | ✅ 已落地 |
| **4** | 爱用剧本次（W5） | 全站抽样 | 小白 4 剧本：备课/点名为/排班/查经 file:// 验收 | ✅ 已落地 |

**说明：**

- **阶段 1–2** 重心在 **教会事工（CM+PLAN）**——跨模最多、你已投入 V2 矩阵。  
- **阶段 3** 才轮到 **BS/HY/SCH/AI** 的 Lite W1（BS 已有 `PAGE_MATURITY_BS.md`，补 W3 即可）。  
- **MAT/QNA** 非阻塞，随阶段 4 剧本需要再点修。

---

## 阶段 1 明细（当前包）

### 1A · P0 清雷 ✅ 已落地

| ID | 动作 | 文件 |
|----|------|------|
| C-01 | 步 6 事奉媒合 → live 页 | `church_planning/sidebar_plan.html` |
| C-02 | 顶栏 F → `hymn_management/dashboard.html` | `config/modes.json` + `config-embedded.js` |
| C-02b | A 区诗歌库链改 dashboard | `sidebar_church_layout_v1.html` |
| C-04 | CRM hub / trial redirect | `guide_crm_journey_hub.html`, `guide_crm_trial_30min.html` |
| — | cross-risk / leave-swap 侧栏暂藏 | `sidebar_plan.html` 脚注说明 |
| — | A DEMO 永久折叠 | `sidebar_church_layout_v1.html` |

### 1B · CM 脊梁 ✅ 已落地

| 项 | 动作 | 验收 |
|----|------|------|
| 四页入口 | dashboard 已有 link-chip | file:// 行政 → 四点可点 |
| C-05 | 会友/探访/排班/财务经 Bridge save + `notifyDomainChanged` | 四页 save 后 dashboard KPI 自动刷新 |
| Bridge | `invalidateAsyncCaches` + `b100-cm-data-changed` + postMessage | `church_data_bridge.js` |
| 迁移 | `financialData`→`financeSystemData`；CM→MS 会友 | Bridge `init()` |
| 测试 | `church_ministry/tests/test_cm_four_pages_bridge.py` | 静态契约通过 |

### 1B 遗留（阶段 2/3）

| 项 | 说明 |
|----|------|
| C-06 | SMART 新写只经 canonical — 代码审查 linking 引用 |
| 步 6 链 | 规划 → 行政 `?focus=f` — 左栏切日常侧栏 |

---

## 阶段 2–4 预览（不浪费在 DEMO 岛）

| 阶段 | 做 | 不做 |
|------|-----|------|
| 2 | B 小组 + D 外展整合 + A 主日一桌 member 下拉 | 7 DEMO 各自 ✅ |
| 3 | SCH↔CM externalId；DD 只读出口；SMART Hub 单页 | DD 300 章重做 |
| 4 | 四剧本 + 静态测试扩展 | 新模块 IA 大改 |

---

## 阶段 2 明细 ✅ 已落地

| 区 | 动作 | 文件 |
|----|------|------|
| **A** | 主日一桌加会友下拉 `memberJump` + 跳转高亮 | `worship-sunday-desk.html` |
| **B** | 小组工作桌接 `pastoral_data_hub` + `small_groups_workspace` | `small-groups-integrated.html` |
| **B** | B 导览链主路工作桌 | `_landing/fellowship.html` |
| **D** | 顶栏 D → 3 Tab 整合壳 | `config/modes.json` + `config-embedded.js` |
| 测试 | `test_cm_phase2_wave.py` + `test_pastoral_data_hub.py` | `church_ministry/tests/` |

**阶段 2 遗留（阶段 3）：** cross-risk / leave-swap 真页；7× DEMO 不升格。

---

## 阶段 3 明细 ✅ 已落地

| ID | 动作 | 文件 |
|----|------|------|
| **C-03** | `openSchoolManagement` 外層双栏 + `_landing/home.html` | `index_v5.html` |
| **C-03** | CM 侧栏 SMART/SCH `data-b100-content` 改内容页 | `sidebar_church_layout_v1.html` |
| **C-03** | Hub content 守卫 `bible100ResolveHubContentUrl` | `js/shell_nav.js` |
| **C-03** | manifest 学校 landing 去 embed | `config/module_manifest.json` |
| **C-06** | linking 新写经 `SmartMinistryCanonical` | `smart_ministry/js/smart_ministry_linking.js` |
| **SCH** | C 工作桌 externalId 桥接条 + 全校学籍出口 | `education-integrated.html`, `cm_school_bridge.js` |
| **DD** | C 区只读出口 → DD dashboard | `education_integrated_shell.js` |
| 测试 | `test_cm_phase3_wave.py` | `church_ministry/tests/` |
| 文档 | `MODULE_BOUNDARY_SMART_SCH_DD_V1.md` | `docs/governance/` |

**阶段 3 遗留（阶段 4）：** nav_hub 全站 TOC 次级页仍待 W5 剧本点修；cross-risk / leave-swap。

---

## 阶段 4 明细 ✅ 已落地

| 项 | 动作 | 文件 |
|----|------|------|
| W5 剧本 | 四任务步骤 + file:// 验收清单 | `docs/governance/USER_PLAYBOOKS_W5_V1.md` |
| 交互页 | 一键开始（`bible100ShellNav`） | `help/user_playbooks_w5.html` |
| 入口 | 全站首页 / 说明侧栏 / 文档中心 | `site_home.html`, `sidebar_help.html`, `docs-hub.html` |
| 测试 | `tests/test_user_playbooks_w5.py` | 静态契约 |

**阶段 4 遗留：** cross-risk / leave-swap 真页；7× DEMO 不升格；MAT/QNA 随剧本需要点修。

---

## 阶段 0–4 已结案 · 下一阶段入口

| 文档 | 用途 |
|------|------|
| [`CM_FULL_MATURITY_BUDGET_V1.md`](./CM_FULL_MATURITY_BUDGET_V1.md) | **教会事工全熟**子阶段 CM-F1～F6 预算（约 8–12 周理想工期） |
| [`SITE_PHASE_5PLUS_MODULE_WAVES_V1.md`](./SITE_PHASE_5PLUS_MODULE_WAVES_V1.md) | **全站阶段 5+** 模块波次（CM → PLAN → BS → SCH → …） |

**排程拍板（2026-07-29）：** 先 **SITE-5a/b**（CM 四页全熟 + PLAN 占位），再 **SITE-6**（CM 选单全熟），然后 **SITE-7 BS**、**SITE-8 SCH**。

---

## file:// 验收（阶段 1 后）

1. `index_v5.html` → 教會事工 → **G** → 步 6 → **事奉媒合中心** → 非「尚在準備」  
2. 顶栏 **F** → 右栏为诗歌 dashboard，**无**内嵌左栏壳  
3. 顶栏 **A** → 侧栏 DEMO 在「进阶」内且默认收合  
4. 打开 `guide_crm_journey_hub.html` → 跳转步 6 导览  

改 modes 后请 **Ctrl+F5**；若 `config-embedded.js` 未自动跑脚本，以仓库内已 sync 为准。

---

*维护：阶段切换时更新「状态」列；CM 细项见 `CHURCH_MODULE_MATURITY_AUDIT_V2.md`；**CM 全熟预算**见 [`CM_FULL_MATURITY_BUDGET_V1.md`](./CM_FULL_MATURITY_BUDGET_V1.md)；**全站 5+ 波次**见 [`SITE_PHASE_5PLUS_MODULE_WAVES_V1.md`](./SITE_PHASE_5PLUS_MODULE_WAVES_V1.md)。*
