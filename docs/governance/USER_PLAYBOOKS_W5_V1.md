# 爱用剧本 W5 · 小白四任务（阶段 4）

> **日期**：2026-07-29  
> **验收口径**：`file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html` + **Ctrl+F5**  
> **交互页**：[`help/user_playbooks_w5.html`](../../help/user_playbooks_w5.html)（总站内可点「一键开始」）

---

## 怎么用

1. 用 **file://** 打开总站壳（勿只用 localhost 代替成品验收）。
2. 强刷缓存（Ctrl+F5 或无痕窗口）。
3. 任选下列剧本，逐步对照「成功标志」打勾。
4. 迷路 → 顶栏点 **聖經百步四寶** 回全站；或开说明侧栏 → **爱用剧本 W5**。

---

## 剧本 1 · 主日学备课

| 项 | 内容 |
|----|------|
| **谁用** | 主日学教师、代课同工 |
| **入口** | 顶栏 **教會事工** → 第二列 **C** → 工作桌 Tab **④ 備課** |
| **目标页** | `church_ministry/modules/education/education-integrated.html#tab-teaching` |

**步骤**

1. 打开 `index_v5.html`，选顶栏 **教會事工**。
2. 顶栏第二列点 **C**（兒童及門訓）。
3. 在工作桌点 Tab **④ 備課**。
4. （可选）点 **載入示範資料** 看示例课程。
5. 点 **➕ 新增課程** 或 **📋 套用教材模板**；需要 AI 草稿时用课程列上的 AI 或顶栏 **AI 輔助**。

**成功标志**

- [ ] 右栏为主日学工作桌（5 Tab），非模块 `index.html` 壳。
- [ ] ④ 備課 Tab 可见教师表、课程规划表。
- [ ] 可新增一行课程或套用模板（本机 localStorage 写入）。

---

## 剧本 2 · 主日学点名

| 项 | 内容 |
|----|------|
| **谁用** | 主日学司事、班导师 |
| **入口** | 顶栏 **教會事工** → **C** → Tab **② 出席** |
| **目标页** | `church_ministry/modules/education/education-integrated.html#tab-attendance` |

**步骤**

1. 同上进入 C 工作桌。
2. 点 Tab **② 出席**。
3. 下拉 **選擇班級** → **➕ 記錄出席**。
4. 查看 **流失警訊**；若有连续缺席，可用 C 区桥接条 **缺席→探訪** 链到 B 区探访队列。

**成功标志**

- [ ] 班级下拉有选项（可先载入示范资料）。
- [ ] 记录出席后总览条「出席率」或预警数字有变化。
- [ ] 不出现「另开一套会友表」— roster 仍在 C 区 **① 學籍**。

---

## 剧本 3 · 义工排班

| 项 | 内容 |
|----|------|
| **谁用** | 事工负责人、行政同工 |
| **入口** | 顶栏 **教會事工** → **E**（或侧栏 F 行政 → 排班工具） |
| **目标页** | `church_ministry/tools/volunteer_shift/index.html` |

**步骤**

1. 顶栏 **教會事工** → 第二列 **E**。
2. 在排班首页点 **載入 A1 試用資料**（或 **載入試用會友**）。
3. 点 **➕ 新增排班** → 选岗位与会友 → **儲存**。
4. 到 **📋 班表清單** 确认写入；复制邀请文字（不自动发短信）。

**成功标志**

- [ ] 首页 KPI「近 14 天排班」≥ 0（载入 demo 后 > 0）。
- [ ] 保存后 `volunteerSystemData` 经 Bridge 写入（回 **F 行政 → 儀表板** KPI 可刷新）。
- [ ] 无「自动派工」— 须人工确认邀请。

---

## 剧本 4 · 查经备课（释经参读）

| 项 | 内容 |
|----|------|
| **谁用** | 查经班带领、备课老师 |
| **入口** | 顶栏 **聖經研讀** → 第二列 **釋經參讀** |
| **目标页** | `bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1&lang=CN` |

**步骤**

1. 顶栏选 **聖經研讀**（非教會事工）。
2. 顶栏第二列点 **釋經參讀**（或侧栏「综合解读」同类入口）。
3. 选书卷、章；确认经文与注释内容加载。
4. （可选）顶栏 **AI 輔助** → 复制 prompt 到外部 AI，**人审**后再用于查经提纲。

**成功标志**

- [ ] 右栏为释经阅读页，**非** `bible_study/index.html` 嵌套壳。
- [ ] 综合解读 / SQLite 注释能加载（本机需有 `data/` 库；无库时见页面明确提示）。
- [ ] AI 输出仅作草稿，页面无「神学权威」宣称。

---

## 静态测试

```powershell
python tests/test_user_playbooks_w5.py
python church_ministry/tests/test_cm_phase3_wave.py
python tests/test_index_v5_shell.py
```

---

## 相关

- 产品宪法 W5：`docs/governance/PRODUCT_CONSTITUTION_V1.md`
- 进程表：`docs/governance/SITE_PHASE_ROADMAP_V1.md`
- 跨模边界：`docs/governance/MODULE_BOUNDARY_SMART_SCH_DD_V1.md`
