# SITE 阶段 5+ · 进度快照（2026-08-06）

> 用户授权「按计划推进」后的交付记录。完整工期仍按 `SITE_PHASE_5PLUS_MODULE_WAVES_V1.md`。

## 本波已交付（2026-08-06）

### CM-F2 · 四页 → 仪表板 KPI
- `js/church_data_bridge.js`：`getPastoralFollowupSummary.overdue`；`getVolunteerShiftSummary.leave_gaps`；`savePastoralFollowup` → `notifyCmDomainChanged('visitation')`
- `church_ministry/js/crm_role_dashboard.js`：KPI 条／今日桌／同工卡展示逾期与排班缺口
- `church_ministry/tests/test_cm_four_pages_bridge.py`：契约断言

### SITE-6 F3 · A/B/D 主桌 polish
- A landing：主 CTA → `worship-sunday-desk.html`
- B landing：小组桌唯一主按钮；探访→`visitation_index`；团契总览降级
- B 工作桌：legacy 七 Tab 标明 DEMO／非主路
- D landing：单页真链标进阶（主路仍 `#tab-needs`）

### SITE-6 F4 · 侧栏 ~25 项议决
- `PAGE_MATURITY_INVENTORY_0AF.md`：A／B／D／E／F 议决栏 + **SITE-6 F4** 专节（7× DEMO 永不升格等）

### SITE-7 · BS W3 扫尾
- `js/b100_module_nav_ssot.js`：study.`track` → `bible_app/shell/index.html`
- `bible_study/sidebar.html`：跑道独立 focus 区
- `PAGE_MATURITY_BS.md`：跨模契约 + W3 验收路径修正

### SITE-9 · HY + SMART
- `index_v5.openHymnPlaylistShell`：外层双栏 sidebar+dashboard（非 L0 壳）
- `hymn_management/sidebar.html`：`javascript:` → button
- `module_manifest`：新增 `hymn_management`
- `spiritual_gifts.html`／`mbti_test.html` → `SmartMinistryCanonical.attachAssessmentToTalent`
- `SMART_MINISTRY_DATA_RULES.md` §4 ⏳→✅

### SITE-10 · AI Lab
- `module_manifest` AI landing → `_landing/home.html`
- `ai_departments_data.js`：CM-C 跨模项
- `sidebar_lab.html`：CM-C `module` 导航 + 全站说明

## 先前已交付（2026-08-05）

### SITE-5a / 5b（F1 闭环）
- g_do 菜单 live、placeholder 转址、媒合 CTA、manifest altSidebar、`test_cm_site5a_wave.py`

### SITE-8（骨架）
- `school_management/docs/PAGE_MATURITY_SCH.md`

## 下一批建议

1. **按 `CLOUD_PACK_4P8_FULL_V1.md` 同步 ≤4.8GB 上云包**（排除 `综合解读.db`／`data/cj`／VI `*.files`）  
2. **SITE-8**：学籍 SSOT 施工（依赖 CM roster）  
3. （可选另波）对照模式 v3 真离线：本地 sql.js + clean 五译本 + 非空注释源  

## 验收

```powershell
python church_ministry/tests/test_cm_four_pages_bridge.py
python church_ministry/tests/test_cm_site5a_wave.py
python tests/test_module_manifest_p0.py
python tests/test_index_v5_shell.py
node scripts/generate_config_embedded.js
powershell -ExecutionPolicy Bypass -File scripts\estimate_cloud_pack_4p8.ps1
```

**file:// 验收：** `file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html` Ctrl+F5

1. 教会事工仪表板：应见「探访逾期」「排班缺口」KPI
2. 顶栏 A／B／D landing：主桌 CTA 如上
3. 圣经研读顶栏「跑道」→ shell
4. 诗歌管理：外层左栏为 hymn sidebar、右栏 dashboard
5. AI Lab：路线图为 `_landing/home`；侧栏有 CM-C／帮助
