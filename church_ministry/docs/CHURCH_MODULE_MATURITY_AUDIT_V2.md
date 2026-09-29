# 教會事工模組 · 完整選單成熟度審計 V2

**生成日期：** 2026-07-29  
**範圍：** 使用者在 `index_v5.html` → **教會事工** 所見之**完整選單**（頂欄 A–G + 左欄兩套側欄）  
**驗收標準：** `file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html`（強刷 Ctrl+F5）  
**前身：** `CHURCH_規劃與行政4F_成熟度報告.md`（僅規劃+行政 F 區 partial；本檔為 **SSOT 全矩陣**）  
**全站阶段 0：** [`docs/governance/SITE_WIDE_LITE_AUDIT_V0.md`](../../docs/governance/SITE_WIDE_LITE_AUDIT_V0.md)（危机页 / 跨模 / 阶段 1 决策）  
**全站进程表：** [`docs/governance/SITE_PHASE_ROADMAP_V1.md`](../../docs/governance/SITE_PHASE_ROADMAP_V1.md)（**0–4 已结案**）  
**CM 全熟预算：** [`docs/governance/CM_FULL_MATURITY_BUDGET_V1.md`](../../docs/governance/CM_FULL_MATURITY_BUDGET_V1.md)（CM-F1～F6）  
**全站 5+ 波次：** [`docs/governance/SITE_PHASE_5PLUS_MODULE_WAVES_V1.md`](../../docs/governance/SITE_PHASE_5PLUS_MODULE_WAVES_V1.md)

---

## 0. 名詞與邊界

| 名稱 | 含義 | **不含** |
|------|------|----------|
| **A–G** | 頂欄七個事工／模組捷徑（敬拜…規劃行政） | **沒有 H**；A–H 僅指「全部頁」口語，正式只有 A–G |
| **左欄日常** | `church_ministry/sidebar_church_layout_v1.html` | 規劃專用側欄 |
| **左欄規劃** | `church_planning/sidebar_plan.html` | 頂欄 F 詩歌側欄 |
| **行政 4F** | 日常側欄 **⚙️ 行政** 區（非頂欄字母 F） | 頂欄 F＝`hymn_management` |
| **基本四頁** | 會友／探訪／排班／財務 | 現階段目標＝**🔹 基本可用**；功能完備留待日後 |

**路向（不可偏）：**

1. 廢 **CRM 品牌**主入口；規劃 **步驟 6**＝「進入行政執行」，非獨立 CRM 產品  
2. 規劃 → 診斷 → 戰情 → 策略 → **行政落地**（會友／探訪／排班／財務）  
3. 人員主鍵 **`member_id`**（`memberSystemData` / `CentralMemberDB`）；非雲 DB SSOT  
4. 事奉媒合：**`ministry-position-matchmaker.html`** + **Smart Ministry** canonical  
5. **小白易用愿用**＝**Landing / 導覽**負責認路；工作桌負責做事（不堆頂欄口號）

---

## 1. 成熟度分級（V2）

| 符號 | 名稱 | 小白怎麼判斷 |
|------|------|--------------|
| **✅** | 成熟 | 能填／能存／能導出或完整 Tab 工作流；資料鍵明確 |
| **🔹** | **基本檔** | **會友／探訪／排班／財務現階段目標**：可用、可存本機，**尚未**功能完備 |
| **🟡** | 示範 DEMO | 能點能試；側欄 `(DEMO)` 或頁內 demo 標記 |
| **⏳** | 占位 | 開啟為 `capability-placeholder.html` 或「尚在準備」 |
| **❌** | 應退役 | 壞鏈、舊 CRM 品牌、與路向衝突仍當主入口 |
| **📄** | 導覽／說明 | Landing、guide、vision；**不**當業務 SSOT |

---

## 2. 四維標準（每選單項必評）

| 維度 | 代號 | 問句 |
|------|------|------|
| **功能** | **F** | 核心任務能否在本頁完成？（非空殼） |
| **資料** | **D** | 是否接 `member_id`／約定 localStorage？有無雙真相？ |
| **儀表** | **B** | 有無彙總／KPI／戰情／Tab 總覽？ |
| **入口** | **E** | 小白能否從 Landing／頂欄／側欄 **一次認路** 進來？ |

**總評：** 四維皆達 ✅ → **✅**；F+D 達標、B/E 靠 Landing → **🔹 或 🟡**；任一方塊占位 → **⏳**。

---

## 3. 頂欄 A–G 總覽

**SSOT：** `config/modes.json` → `church.secondaryNav`（7 項，**無 H**）

| 頂欄 | 右欄預設 | 左欄 | 總評 | F | D | B | E | 路向 |
|------|----------|------|------|---|---|---|---|------|
| **A** 敬拜音樂 | `_landing/worship.html` | 日常側欄 `?focus=a` | 🟡 | 🟡 | 🟡 | 🟡 | ✅ | 主路＝主日一桌；DEMO 收折 |
| **B** 牧養團契 | `small-groups-integrated.html` | `?focus=b` | 🟡 | 🟡 | 🟡 | 🟡 | ✅ | 探訪＋小組；接 member_id |
| **C** 門訓主日學 | `education-integrated.html` | `?focus=c` | ✅ | ✅ | 🟡 | ✅ | ✅ | 5 Tab 工作桌；roster 橋接 |
| **D** 外展差傳 | `outreach-strategy.html` | `?focus=d` | 🟡 | 🟡 | 🟡 | 🟡 | ✅ | 整合桌為主路 |
| **E** 社會服務 | `volunteer_shift/index.html` | `?focus=e` | 🔹 | 🔹 | 🟡 | 🟡 | ✅ | 排班＝E 主路 |
| **F** 詩歌應用 | `hymn_management/index.html` | `sidebar_playlist.html` | ✅ | ✅ | 🟡 | ✅ | ✅ | 獨立模組；A 內庫為捷徑 |
| **G** 規劃行政 | `index_plan.html` | `sidebar_plan.html` | ✅ | ✅ | ✅ | ✅ | ✅ | 18 live 量表 + 步驟 1–7 |

**模組預設進入：** 右欄 `_landing/gateway.html`（三條河 A–G 路線圖）· 左欄日常側欄 — **📄+✅ 入口層**

---

## 4. 左欄日常側欄 · 逐項矩陣

**SSOT：** `church_ministry/sidebar_church_layout_v1.html`

### 4.1 共通（頂部）

| 選單項 | 路徑 | 總評 | F | D | B | E | P |
|--------|------|------|---|---|---|---|---|
| 回規劃 | `church_planning/index_plan.html` + 規劃側欄 | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| 教會選路 | `_landing/gateway.html` | 📄 | — | — | — | ✅ | Landing SSOT |
| **會友主檔** | `modules/members/member-integrated.html` | **🔹** | 🔹 | 🟡→✅ | 🟡 | ✅ | **P1** member_id 全模組 |
| **探訪工作桌** | `modules/support/visitation_index.html` | **🔹** | 🔹 | 🟡 | 🟡 | ✅ | **P1** 接會友主檔 |
| **義工排班** | `tools/volunteer_shift/index.html` | **🔹** | 🔹 | 🟡 | 🟡 | ✅ | **P2** 請假調班 |

### 4.2 A · 敬拜花园

| 選單項 | 路徑 | 總評 | F | D | B | E | 備註 |
|--------|------|------|---|---|---|---|------|
| 敬拜入門導覽 | `_landing/worship.html` | 📄 | — | — | — | ✅ | A 區 Landing |
| 会众筑坛 | `worship-together.html` | 🟡 | 🟡 | 🟡 | — | 🟡 | 只读演示 |
| 同工·今日祭坛 | `worship-integrated.html?view=volunteer` | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 整合壳 |
| **主日一桌** | `worship-sunday-desk.html` | **✅** | ✅ | 🟡 | ✅ | ✅ | **A 主路** |
| 部长·主日策划 | `worship-integrated.html?view=leader#plan` | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 进阶 |
| 讲坛／礼仪／诗班／器乐／团队／招待／乐谱 | `modules/worship/*.html` | 🟡 | 🟡 | 🟡 | — | 🟡 | **7× DEMO**；P1 默认折叠 |
| 诗歌库 | `hymn_management/index.html` | ✅ | ✅ | 🟡 | ✅ | 🟡 | 与顶栏 F 重复；保留一处主入口 |
| 旧总索引 / 诗歌 AI | `hymn/default.htm`, `hymn_ai_tools.html` | 🟡/✅ | — | — | — | 🟡 | 进阶／外连 |
| 统计报表 | → 主日一桌 | ✅ | ✅ | 🟡 | ✅ | ✅ | 别名，非独立页 |

### 4.3 B · 牧羊小径

| 選單項 | 路徑 | 總評 | F | D | B | E |
|--------|------|------|---|---|---|---|
| 探訪工作桌 | `visitation_index.html` | 🔹 | 🔹 | 🟡 | 🟡 | ✅ |
| 牧羊导览 | `_landing/fellowship.html` | 📄 | — | — | — | ✅ |
| 团契总览 | `fellowship/index.html` | 🟡 | 🟡 | 🟡 | 🟡 | ✅ |
| 小组工作桌 | `small-groups-integrated.html` | 🟡 | 🟡 | 🟡 | 🟡 | ✅ |
| 组织与名册 | `pastoral-org-roster.html` | 🟡 | 🟡 | 🟡 | — | 🟡 |
| 聚会出席统计 | `pastoral-attendance.html` | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| 活动通告 | `pastoral-events.html` | 🟡 | 🟡 | 🟡 | — | 🟡 |
| 门徒训练 | `pastoral-training.html` | 🟡 | 🟡 | — | — | 🟡 |
| 牧养战略桌 | `pastoral-strategy.html` | 🟡 | 🟡 | — | 🟡 | 🟡 |
| 团契的圈 | `fellowship-circles.html` | 🟡 | 🟡 | — | — | 🟡 |
| 會友主檔 | `member-integrated.html` | 🔹 | 🔹 | 🟡 | 🟡 | ✅ |
| 青年团契活动 | `youth-ministry-dev.html` | 🟡 | 🟡 | — | — | 🟡 |

### 4.4 C · 聖經及教育培訓

| 選單項 | 路徑 | 總評 | F | D | B | E |
|--------|------|------|---|---|---|---|
| **主日學工作桌** | `education-integrated.html#tab-roster` | **✅** | ✅ | 🟡 | ✅ | ✅ |
| 門徒培訓管理 | `discipleship-training.html` | 🟡 | 🟡 | 🟡 | 🟡 | ✅ |
| C 區導覽 | `_landing/education.html` | 📄 | — | — | — | ✅ |

### 4.5 規劃分支（日常側欄內）

| 選單項 | 路徑 | 總評 | 備註 |
|--------|------|------|------|
| 回規劃 | `index_plan.html` | ✅ | 雙欄切換 |
| 健康診斷中心 | `assessment-os-hub.html` | ✅ | 同 G 區 |

### 4.6 D · 外展

| 選單項 | 路徑 | 總評 | F | D | B | E |
|--------|------|------|---|---|---|---|
| **外展工作桌·3 Tab** | `outreach-integrated.html` | 🟡 | 🟡 | 🟡 | 🟡 | ✅ |
| 需求真链（单页） | `outreach-strategy.html` | 🟡 | 🟡 | 🟡 | — | 🟡 |

### 4.7 E · 社會服務

| 選單項 | 路徑 | 總評 | F | D | B | E |
|--------|------|------|---|---|---|---|
| **義工排班** | `volunteer_shift/index.html` | **🔹** | 🔹 | 🟡 | 🟡 | ✅ |
| 會眾／社區學苑 | `congregation/index.html` | 🟡 | 🟡 | — | — | 🟡 |
| 志工崗位／配對（進階） | `volunteer-integrated.html` | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |

### 4.8 ⚙️ 行政（4F · 非頂欄 F）

| 選單項 | 路徑 | 總評 | F | D | B | E | 備註 |
|--------|------|------|---|---|---|---|------|
| 事工戰情儀表板 | `dashboard.html` | ✅ | ✅ | 🟡 | ✅ | ✅ | ChurchDataBridge |
| 口述預填 | `ai_tools/.../crm_automation_console.html` | ✅ | ✅ | 🟡 | — | ✅ | 減壓閥；非 CRM 品牌 |
| 智慧事奉 | `smart_ministry/`（換模組） | ✅ | ✅ | ✅ | ✅ | 🟡 | canonical store |
| 會友主檔 | `member-integrated.html` | 🔹 | 🔹 | 🟡 | 🟡 | ✅ | 行政核心 |
| **1. 會員與財政** | dash / 會友 / **財務** | **🔹** | 🔹 | 🟡 | 🟡 | ✅ | **財務基本檔** |
| 2. 認路與說明 | vision_and_plan / roadmap / help | 📄 | — | — | — | ✅ | |
| 3. 其他設定 | theme-settings / custom-page-editor | ✅ | ✅ | ✅ | — | 🟡 | |
| 4. 資產／研究 DEMO | research / equipment / library / community-overview | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | **默认折叠** |

### 4.9 Meta · 離開本模組（進階）

| 選單項 | 判定 | 建議 |
|--------|------|------|
| 規劃專用側欄 | ✅ | 保留在折叠区 |
| 敬拜／主日學專用側欄 | 🟡 | 易「换左栏迷路」；仅进阶 |
| 聖經研讀／學校／AI Lab | ✅ | 跨模組 `module` 导航合法 |

---

## 5. 左欄規劃側欄 · 逐項矩陣

**SSOT：** `church_planning/sidebar_plan.html`

### 5.1 各項工具量表（18 live）

| # | 頁面 | 總評 | F | D | B |
|---|------|------|---|---|---|
| 1–18 | 靈命／恩賜／治理／團隊／文化／KPI／NCD 等量表 | **✅** | ✅ | ✅ | ✅ |

完整清單見 `planning_tool_registry.js`（`status: "live"`）。  
**事奉媒合 live 頁：** `ministry-position-matchmaker.html`（**非** placeholder）。

### 5.2 步驟 1–7

| 步驟 | 主導覽 | 總評 | 備註 |
|------|--------|------|------|
| 1 啟航 | `index_plan.html`, `vision.html`, `planning-user-guide.html` | ✅ / 📄 | |
| 2 健康診斷 | `assessment-os-hub.html` + 量表 | ✅ | |
| 3 RACI | `guides/guide_step2_raci.html`, `planning/raci-reflection.html` | ✅ | |
| 4 戰情室 | `cta-os-war-room.html`, `dashboard.html` | ✅ | cross-risk **⏳** |
| 5 策略 | SWOT / SMART / PDCA / KPI 等 | ✅ | |
| **6 進入行政** | `guide_step6_crm.html` → 會友／探訪／排班／**財務** | **🔹** | **非 CRM 产品** |
| 7 參考 | 回首页／文集／导览宪法 | 📄 | 非主流程 |

### 5.3 占位与误链（P0）

| 側欄文字 | 現链 | 應為 | P |
|----------|------|------|---|
| 事奉媒合 * | `capability-placeholder?id=matchmaker` | `ministry-position-matchmaker.html` | **P0** |
| 跨部门风险 * | placeholder cross-risk | 做真表或暂藏 | P0/P2 |
| 请假调班 * | placeholder leave-swap | 接 volunteer_shift 或暂藏 | P2 |

---

## 6. 基本四頁专节（現階段契约）

用户明确：**會友／探訪／排班／財務** 日后可发展成功能完備；**目前只做基本**。

| 页面 | 现能力（🔹） | 日后完备（✅ 目标） | 资料键 / 路向 |
|------|-------------|---------------------|---------------|
| **會友主檔** | 6 Tab CRUD、匯出、本機 | 与主日学 roster、Smart Ministry、探访 **只写一处** | `memberSystemData` · `member_id` |
| **探訪工作桌** | 列表、记录、本機 | overdue 提醒、仪表板/widget、与牧养 B 区统一 | 接 `member_id` |
| **義工排班** | 排班表、岗位 | 请假调班、缺口 KPI、E 区与行政共用 | 接 `member_id` |
| **財務事工** | 多 Tab 收支 demo | 审批流、报表、与奉献人链接 | 基本档；不接云 SSOT |

**四维（基本四页）：**

| 页 | F | D | B | E |
|----|---|---|---|---|
| 會友 | 🔹 | 🟡 | 🟡 | ✅ 今日常用 + 行政 |
| 探訪 | 🔹 | 🟡 | 🟡 | ✅ 今日常用 + B 区 |
| 排班 | 🔹 | 🟡 | 🟡 | ✅ 今日常用 + E 顶栏 |
| 財務 | 🔹 | 🟡 | 🟡 | ✅ 行政 details-1 |

**Landing 职责（E 维）：** `_landing/gateway.html`、各区 `_landing/*.html`、规划 `index_plan.html` / guides — **负责「愿用」**；工作桌不重复堆导览文案。

---

## 7. 孤儿页与应退役页

**定义：** 存在于 `church_ministry/`（或旧 CRM 路径）但 **未出现在** §4–§5 选单 SSOT 的 HTML。

| 类别 | 示例路径 | 建议 |
|------|----------|------|
| **旧 CRM 旅程** | `guide_crm_journey_hub.html`, `guide_crm_for_leaders.html`, `guide_crm_for_teachers.html`, `guide_crm_from_learning.html`, `guide_crm_trial_30min.html`, `sidebar_crm_journey.html`（若仍存在） | **❌ 退役**或 410 重定向到 `church_planning/guides/guide_step6_crm.html` |
| **重复壳 index** | `index_worship_journey.html`, `index_c_education_journey.html` | 🟡 仅 meta 专用侧栏；不当 Hub 默认 |
| **desks 单页** | `desks/outreach.html` 等 | 并入选单或移 `archive/` |
| **mission 子树** | `mission/disciple_center.html`, `sidebar_mission.html` | 未入主选单 → P3 并入 C 或标注 orphan |
| **roadmap / community** | `roadmap-overview.html` | 📄 已在行政「认路」；保留 |
| **admin 维护** | `admin/demo_data_governance.html` | ✅ 维护者；不进小白选单 |

**维护脚本建议（P3）：** `python church_ministry/scripts/audit_sidebar_orphans.py` —  diff 侧栏 `href` vs 模块 `*.html`。

---

## 8. 改 / 移 / 加 · P0–P3

### P0 · 减误导（1 天内）

1. **规划步骤 6**「事奉媒合 *」→ 改链 `ministry-position-matchmaker.html`
2. placeholder **cross-risk / leave-swap**：侧栏标「规划中」或暂藏
3. A 区 **7× DEMO** `<details>` 默认 **收合**（主日一桌展开）

### P1 · 基本四页 + 入口（1–2 周）

1. 會友／探訪／排班 **统一 `member_id`** 读写
2. 口述预填 → 会友字段映射（help 一页）
3. F 区 DEMO 岛默认折叠；顶栏/今日常用只露四页 + 仪表板
4. 退役 **CRM 品牌** HTML 入口（保留兼容 redirect）

### P2 · 规划↔行政闭环

1. cross-risk：读 `AssessmentRunStore` → 风险对照表
2. leave-swap：`volunteer_shift` 新 Tab
3. 规划填完 → 「進入行政」带最近 run / church context
4. matchmaker ↔ Smart Ministry  talent_id = member_id

### P3 · 可选增强（不堆模块）

| 位置 | 想法 |
|------|------|
| `gateway.html` | A–G 卡片 + 「今天只做一件事」 |
| 战情室 | 长执一页 PDF |
| `dashboard.html` | 本周：探访 overdue + 排班缺口 + 财务待审 |
| C 主日学 | roster 与会友只读同步加强 |

---

## 9. 统计摘要

| 分区 | ✅ | 🔹 基本 | 🟡 DEMO | ⏳ | 📄 | ❌待退 |
|------|-----|---------|---------|-----|-----|--------|
| 顶栏 A–G | 3 | 1 | 3 | 0 | 1 | 0 |
| 日常侧栏（计项） | ~12 | **4** | ~25 | 0 | ~8 | ~2 CRM |
| 规划侧栏 | 18+Hub | 4（步6执行链） | 0 | **3** | 3 | 0 |
| **合计倾向** | 规划最强 | **四页=当前交付** | A/B _demo 多 | 3 placeholder | Landing 足 | CRM 清退 |

**最弱：** 占位误链（matchmaker）；A 区 DEMO 与主路并存；基本四页 **D/B 维** 未全接 central member。  
**最强：** 18 live 规划量表；G 顶栏 + gateway Landing；C 主日学工作桌；F 诗歌模块。

---

## 10. file:// 验收步骤

1. 打开 `file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html` → **Ctrl+F5**
2. **教會事工** → 顶栏仅 **A–G**（无 H、无旧「全站导览/文集」于顶栏 2）
3. 默认右栏 **教會選路** gateway；左栏见「今日常用」三会友/探访/排班
4. **G** → 规划侧栏步骤 1–7；步骤 6 进行政应切日常侧栏 `?focus=f`
5. 任页「尚在准备」→ 对照 §5.3 **⏳**

改 `config/modes.json` 后须：`node scripts/generate_config_embedded.js`

---

## 11. 范本结构（供其他模块复用）

复制本节到新模块 `docs/<MODULE>_MATURITY_AUDIT_V2.md`：

```markdown
# <模块名> · 完整選單成熟度審計 V2

## 0. 名詞與邊界（顶栏字母 / 侧栏 SSOT / 不含项）
## 1. 成熟度分級（✅ 🔹 🟡 ⏳ ❌ 📄）
## 2. 四維標準（F 功能 / D 资料 / B 仪表 / E 入口·Landing）
## 3. 顶栏 secondaryNav 总览表
## 4. 主侧栏逐行矩阵（路径 | 总评 | F | D | B | E | P0–P3）
## 5. 次级侧栏（若有）逐行矩阵
## 6. <模块核心 N 页> 专节（现基本 vs 日后完备）
## 7. 孤儿页与退役页
## 8. P0–P3 改移加
## 9. 统计摘要
## 10. file:// 验收步骤
## 11. 维护：改侧栏/reg/config 后同步本档
```

**矩阵行模板：**

| 選單項 | 路徑 | 總評 | F | D | B | E | 路向/P |

---

## 12. 相关文件

| 文件 | 角色 |
|------|------|
| `sidebar_church_layout_v1.html` | 日常选单 SSOT |
| `sidebar_plan.html` | 规划选单 SSOT |
| `config/modes.json` | 顶栏 A–G SSOT |
| `planning_tool_registry.js` | 18 live 量表 |
| `CHURCH_規劃與行政4F_成熟度報告.md` | V1 partial（规划+行政细节可交叉引用） |
| `.cursor/rules/bible100-file-protocol-acceptance.mdc` | file:// 验收 |
| `docs/governance/PRODUCT_CONSTITUTION_V1.md` | 四身份／波次 |

---

*维护：改 `sidebar_*`、`modes.json`、`planning_tool_registry.js` 或基本四页契约后，请同步更新本 V2 矩阵。*
