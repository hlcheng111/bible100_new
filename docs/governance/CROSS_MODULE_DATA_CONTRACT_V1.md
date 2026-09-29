# 全站跨模組資料契約 V1（阶段 0 锁定）

> **日期**：2026-07-29  
> **用途**：阶段 0 Lite 总检产出；阶段 1 深做前 **禁止** 新增第二套 canonical 写入。  
> **详键**：`js/DATA_KEYS.md` · 桥接：`js/church_data_bridge.js` · 会友 API：`js/central_member_db.js` · Smart Ministry：`js/smart_ministry_canonical_store.js`

---

## 1. 人员主键（最高优先级）

| 规则 | 说明 |
|------|------|
| **正式主键** | `member_id`（会友 `members[].id` 或约定字符串；Smart Ministry `talent_id` **必须**等于 `member_id`） |
| **唯一写入 API** | `CentralMemberDB.set()` / `ChurchDataBridge` 会友分支 |
| **禁止** | 各模块自造永久人员 ID 桶；`smart_ministry_linking` 直写当 SSOT |
| **学校 SCH** | `schoolMasterDatabase` 独立命名空间；学籍 `studentId` 用 `members[].externalId` 桥接，不另开「教会会友表」 |

---

## 2. 教会营运四页（CM 写入主）

| 业务 | localStorage 键 | 写入主 | 他模权限 |
|------|-----------------|--------|----------|
| 会友名册 | `memberSystemData` (+ Bridge 同步 `churchMasterDatabase`) | **CM** `member-integrated.html` | SMART/SCH/PLAN **只读**或经 Bridge |
| 探访 | `visitationData` | **CM** `visitation_index.html` | B 区、SMART 深链只读 |
| 排班 | `volunteerSystemData` | **CM** `volunteer_shift/` | E 区、SMART 只读 |
| 财务 | `financeSystemData`（别名 `financialData` 待收敛） | **CM** `finance-integrated.html` | 他模 **禁止** 另开账本 |

**现阶段目标**：🔹 基本可用；阶段 1 统一经 Bridge 读写，消除直写 drift。

---

## 3. 规划与事奉

| 业务 | 键 / 存储 | 写入主 | 他模 |
|------|-----------|--------|------|
| 量表 run | `AssessmentRunStore`（规划 JS） | **PLAN** 18 live 量表 | CM 仪表只读摘要 |
| 事奉媒合 | live 页 + SMART canonical | **PLAN** `ministry-position-matchmaker.html` → 落地 SMART | 侧栏 **禁止** placeholder 链 |
| 智慧事奉 | `bible100_smart_ministry_main` | **SMART** `SmartMinistryCanonical` | CM 行政只出口 |

---

## 4. 模块边界（文案 + 数据）

| 主题 | 主模块 | 他模 |
|------|--------|------|
| 门训（教会内） | **CM-C** `education-integrated` | DD `disciple_dynamics` 只读深链 | 勿双写 roster |
| 诗歌曲库 | **HY** `hymn_management` | CM-A / 顶栏 F 为**选用**入口，不复制曲库 SSOT |
| 规划 / SWOT / KPI | **PLAN** | CM 只「回规划」链，不双开量表 |
| AI 备课 / 草稿 | **AI** Lab | CM/B/SCH 只留 `module` 出口 |
| 圣经研读 | **BS** | 他模 iframe 深链，不写 BS 数据键 |

---

## 5. 阶段 1 验收（契约是否落地）

- [x] 会友/探访/排班/财务四页写入均经 `ChurchDataBridge` 或 `CentralMemberDB`
- [x] SMART 新配对只经 `SmartMinistryCanonical`（linking 优先 canonical；legacy 桶只读/迁移）
- [x] PLAN 步骤 6 链 live matchmaker，无 placeholder
- [x] `guide_crm_*.html` 无侧栏主链（仅 redirect）
- [x] Hub 顶栏/模式入口不加载带内层 `contentFrame` 的模块壳（C-03 · 阶段 3）
- [x] 四页 save 后 dashboard 监听 `b100-cm-data-changed` 刷新 KPI

---

*阶段 0 全站危机清单见 [`SITE_WIDE_LITE_AUDIT_V0.md`](./SITE_WIDE_LITE_AUDIT_V0.md)*
