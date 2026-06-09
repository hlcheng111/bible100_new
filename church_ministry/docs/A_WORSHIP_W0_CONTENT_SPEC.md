# A 敬拜 · W0 内容规格（SSOT）

> 波次 W0：区导览 + 主工作桌 + 诗班六项样板 + 仪表板 v2  
> 更新：2026-06

## 三层架构

| 层级 | 页面 | 角色 |
|------|------|------|
| L0 | `_landing/worship.html` | 理念、三分法、路线图、16 项索引 |
| L1 | `worship-integrated.html` | 本周战情、三分入口、填完去哪 |
| L2 | 14 个子专页 | 各工具操作；**样板** `choir-team.html` |

## 诗班页 · 六项 + 流程 + 互联（W0 样板）

| 区块 | id | 内容 | 后期互联 |
|------|-----|------|----------|
| 意义 | `#choir-meaning` | 神学定位、服事态度 | — |
| 组织 | `#choir-org` | 团长、副团长、四声部、与敬拜团 | `memberId` → 会友主档；注册 |
| 训练 | `#choir-training` | 年度节奏、新员 4 周、乐理 | 门训／school_management |
| 演出 | `#choir-performance` | 主日、节期、外出 | `worship-management` 场次 |
| 活动 | `#choir-activities` | 退修、联谊、社区 | 交费占位、活动报名 |
| 乐谱 | `#choir-scores` | 曲目+声部 | `sheet-music.html`；`choir_score_refs_v1` |
| 流程表 | `#choir-flow` | 年度／导师／练习… | 导出 CSV；AI 预填草稿 |
| 填完去哪 | `#choir-next` | 主桌／礼仪／报表／探访 | CRM `visitation_index` |

**数据键（本机）：**

- `choir_members` · `choir_activities` · `church_ministry_choir_flow_v1` · `choir_score_refs_v1`

**AI 自动化原则：** 只预填、不自动派工；人审核后写入 localStorage。

## 16 档侧栏对照（layout_v1）

### ① 敬拜管理
- pulpit-ministry · sermon-notes-admin · hospitality

### ② 音乐与诗歌
- worship-integrated · worship-team-management · choir-team · instrument-team
- congregational-songs · sheet-music · song-library · worship-management
- worship-reports · attendance-management

### ③ 影音制作
- audio-team · live-streaming

## W0 判定（仪表板 v2）

| 路径 | 判定 |
|------|------|
| `_landing/worship.html` | ✅ |
| `modules/worship/worship-integrated.html` | ✅ |
| `modules/worship/choir-team.html` | ✅ |
| 其余 A 子页（W1） | ✅ 六项 shell + memberId 桥接 |

## W1 · memberId 对齐

- **父档**：`memberSystemData`（`CentralMemberDB`）↔ `churchMasterDatabase.members`
- **桥接**：`js/member_id_bridge.js` — 按姓名自动对齐、诗班 `choir_members` 示范
- **批量壳**：`js/ae_worship_six_section_shell.js` + `ae_worship_page_registry.js`
- **重打补丁**：`python scripts/patch_ae_worship_w1.py`

## W2 · 敬拜团 / CRM 实链 / AI 排练草稿

| 能力 | 模块 | 数据键 |
|------|------|--------|
| `worshipTeamData` 嵌套对齐 | `worship_team_bridge.js` | members + schedules 姓名槽 → memberId |
| 注册／交费 CRM 实链 | `ae_worship_crm_bridge.js` | `worship_crm_intents_v1` |
| AI 排练预填 | `ae_worship_ai_draft.js` | `worship_rehearsal_drafts_v1` → 合并 `church_ministry_choir_flow_v1` |

**CRM 入口（互联区 W2 按钮）：** 会友注册 · 事奉旅程 · 媒合中心 · 财务交费 · AI 口述预填

**重打 W2 补丁：** `python scripts/patch_ae_worship_w2.py`

## W3 · 数据枢纽 / 探访草稿 / 财务预填

| 能力 | 模块 | 数据键 |
|------|------|--------|
| 子页聚合快照 | `ae_worship_data_hub.js` | `worship_data_hub_snapshot_v1` |
| memberId 完整性 | 同上 `validateIntegrity()` | — |
| 敬拜团排班→主桌 | `pullTeamSchedulesToHub()` | `worshipMinistryData` |
| 缺席→探访草稿 | `addVisitationDraft()` / `scanAttendanceForVisitation()` | `worship_visitation_drafts_v1` |
| 活动交费预填 | CRM 点击 + `financePrefillFromIntent()` | `worship_finance_prefill_v1` |
| 主桌面板 | `ae_worship_hub_panel.js` | `#w3-hub-panel` |
| 子页条 | 同上 `renderStrip()` | `#ae-worship-hub-strip` |

**出席页 W3：** `attendance-management.html` 从 `CentralMemberDB` 拉会友；缺席保存自动写探访草稿。

**财务页 W3：** `finance-integrated.html` 读取 `worship_finance_prefill_v1` 显示预填横幅。

**重打 W3 补丁：** `python scripts/patch_ae_worship_w3.py` · 脚本顺序：`python scripts/fix_ae_worship_script_order.py`

## W4 · 双视角主桌 + 工具页折叠壳

| 能力 | 模块 | 说明 |
|------|------|------|
| 同工 / 部长切换 | `ae_worship_role_views.js` | `worship_view_role` · `?view=volunteer\|leader` |
| 今日祭坛 | `ae_worship_volunteer_card.js` | 只读聚合排练、献诗、乐谱 |
| 规划横幅（A 30%） | `ae_worship_strategy_bridge.js` | 只读 PDCA 键，简约崇拜提示 |
| 工具页六项折叠 | registry `mode:"tool"` | ①–⑥ 收成 `<details>` |

## W5 · 主日崇拜一键策划

| 能力 | 模块 | 数据键 |
|------|------|--------|
| 策划 SSOT | `ae_worship_sunday_plan.js` | `worship_sunday_plan_v1` · `worship_sunday_plan_active_id` |
| Kanban / 全景 UI | `ae_worship_plan_pipeline.js` | `#worship-sunday-plan-host` · Tab「主日策划」 |
| 示范注入 | `seedDemoPentecost()` | 圣灵降临期 demo |
| 流程五步 | pipeline | 讲题 → 选歌 → 人力 → 彩排 → 就绪 |

**部长**：`worship-integrated.html?view=leader` → Tab「主日策划」  
**同工**：只读继承 active plan 主题/诗歌（`ae_worship_volunteer_card.js`）

## W6 · 探访闭环

| 能力 | 模块 | 数据键 |
|------|------|--------|
| 连续缺席预警 | `WorshipDataHub.scanBurnoutSignals()` | `attendanceRecords` |
| 敬拜草稿 → 探访桌 | `ae_worship_visitation_bridge.js` | `worship_visitation_drafts_v1` → `visitationData.missions` |
| 探访 UI | `visitation_index.html` | 接案 / 填记录 / 完成 |

重新生成审计：`python scripts/audit_ae_modules.py`
