# SMART / SCH / DD 模块边界 V1（阶段 3）

> **日期**：2026-07-29  
> **用途**：Hub 壳契约 + 跨模数据边界；与 [`CROSS_MODULE_DATA_CONTRACT_V1.md`](./CROSS_MODULE_DATA_CONTRACT_V1.md) 对齐。

---

## 1. Hub 壳（C-03）

| 模块 | Hub 外層 `sidebarFrame` | Hub 外層 `contentFrame` | 禁止 |
|------|-------------------------|-------------------------|------|
| 智慧事奉 SMART | `smart_ministry/sidebar.html` | `smart_ministry/landing.html` | `smart_ministry/index.html` |
| 学校 SCH | `school_management/sidebar.html` | `school_management/_landing/home.html` | `school_management/index.html` |
| 门训 DD | `disciple_dynamics/sidebar.html` | `disciple_dynamics/dashboard.html` | `disciple_dynamics/index.html` |
| 教会 CM | `church_ministry/sidebar_church_layout_v1.html` | `church_ministry/_landing/gateway.html` 或工作桌 | `church_ministry/index.html` |

**守卫**：`js/shell_nav.js` → `bible100ResolveHubContentUrl()`；`index_v5.html` postMessage 同步改写。

**Standalone**：各模 `index.html` 仍可双击 / 书签独立打开（L0 壳），不得作为 Hub 右栏目标。

---

## 2. SMART 数据（C-06）

| 项 | 规则 |
|----|------|
| Canonical 键 | `bible100_smart_ministry_main` |
| 写入 API | `SmartMinistryCanonical`（`js/smart_ministry_canonical_store.js`） |
| Legacy | `smart_ministry_linking` — 只读/迁移；`link()` 优先经 canonical |
| 人员主键 | `talent_id` = `member_id` |

---

## 3. SCH ↔ CM（C 区）

| 项 | 规则 |
|----|------|
| 学校 SSOT | `schoolMasterDatabase`（SCH 模块） |
| 主日学 SSOT | `educationSystemData`（CM-C） |
| 桥接 | `members[].externalId` / 学籍 `memberId` 对齐 |
| UI | `education-integrated.html` + `cm_school_bridge.js` 摘要条 |
| 禁止 | 在学校模另开「教会会友表」 |

---

## 4. DD ↔ CM-C

| 项 | 规则 |
|----|------|
| 主路 | **CM-C** `education-integrated.html` 维护 roster / 出席 |
| DD | 课程/章节**内容库**；Hub 只读深链 |
| 出口 | C 工作桌「换模块 → DD 内容库」→ `disciple_dynamics/dashboard.html?crm_from=cm_c_readonly` |
| 禁止 | DD 写入 roster 或 duplicate 会友主档 |

---

## 5. 测试

```powershell
python church_ministry/tests/test_cm_phase3_wave.py
python tests/test_index_v5_shell.py
```

---

*阶段 4 剧本验收：`help/user_playbooks_w5.html` · `docs/governance/USER_PLAYBOOKS_W5_V1.md`*
