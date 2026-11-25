# 教會事工 · 頁→區對照（階段 0）

> 自動產生：`python church_ministry/scripts/cm_zone_scan.py`　**勿手改**（改選單請改 `js/cm_*_menu_ssot.js`）。

## 1. 現行分區定義（單一真相）

| 區 | 現行區名 | 選單設定檔（單一真相） | 入口頁 | 選單登記頁數 |
|---|---|---|---|---|
| 0 | 0 CRM 旅程 | `church_ministry/js/crm_journey_registry.js` | — | 70 |
| A | A 敬拜音樂 | `js/cm_a_menu_ssot.js` | `_landing/worship.html` | 6 |
| B | B 牧養小組 | `js/cm_b_menu_ssot.js` | `_landing/pastoral.html` | 12 |
| C | C 聖經門訓 | `js/cm_c_menu_ssot.js` | `_landing/education.html` | 12 |
| D | D 外展差傳 | `js/cm_d_menu_ssot.js` | `_landing/outreach.html` | 3 |
| E | E 社會服務 | `js/cm_e_menu_ssot.js` | `_landing/social.html` | 5 |
| F | F 樂以載道 | `js/cm_f_menu_ssot.js` | `_landing/hymns.html` | 5 |
| G | G 規劃行政 | `js/g_do_admin_menu_ssot.js` | `_landing/planning.html` | 16 |
| H | H 出席系統 | `js/cm_h_menu_ssot.js` | `_landing/attendance.html` | 8 |

依據：`config/modes.json` 的 church.secondaryNav、`js/cm_a_g_menu_registry.js`。
F 樂以載道的頁面在 `hymn_management/`（獨立模組），本表只列選單登記到的入口。

## 2. 仍用舊口徑的文件（建議校正，勿影響現行判斷）

- `church_ministry/docs/PAGE_MATURITY_INVENTORY_0AF.md`（提到「E／F 行政支援」，現行 F＝樂以載道、G＝規劃行政）
- `church_ministry/docs/QA_TRACKER_0AF_P0.md`（提到「E／F 行政支援」，現行 F＝樂以載道、G＝規劃行政）
- `church_ministry/docs/TRANSFORM_ABC_CHECKLIST_STAGE1.md`（提到「E／F 行政支援」，現行 F＝樂以載道、G＝規劃行政）
- `.cursor/rules/bible100-ui-naming-ia-lock.mdc`（提到「E／F 行政支援」，現行 F＝樂以載道、G＝規劃行政）
- `scripts/audit_ae_modules.py`（提到「E／F 行政支援」，現行 F＝樂以載道、G＝規劃行政）

## 3. 選單指向不存在的頁（懸空）

- 無（所有選單項目都找得到檔案）

## 4. 各區頁面（選單登記＝確定；資料夾推測＝待牧者確認）

### 0 CRM 旅程（78 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/guide_crm_for_leaders.html` | 資料夾推測 | 轉到日常戰情 |
| `church_ministry/guide_crm_for_teachers.html` | 資料夾推測 | 轉到角色怎麼走 |
| `church_ministry/guide_crm_from_learning.html` | 資料夾推測 | 轉到教會事工怎麼走 |
| `church_ministry/load_central_member_seed.html` | 資料夾推測 | 中央會友資料管理 · Load Member Seed Data | Churc |
| `church_ministry/load_crm_maturity_seed.html` | 資料夾推測 | 載入 CRM 成熟度種子 |
| `church_ministry/modules/members/member-360-timeline.html` | 資料夾推測 | 會眾 360 Timeline | Church Ministry |
| `church_ministry/modules/members/member_form_intake.html` | 資料夾推測 | 表單回覆轉會友草稿 · 會友檔案 | Church Ministry |
| `church_ministry/people/person_detail.html` | 資料夾推測 | 個人詳情 - 我的參與 |
| `ai_tools/pages/crm_automation_console.html` | 選單設定檔 | 🎙️ AI 語音免填表助理 (口述自動輸入) |
| `ai_tools/sidebar_lab.html` | 選單設定檔 | AI Lab · Sidebar |
| `ai_tools/tools/bible_prompt_generator.html` | 選單設定檔 | Redirect · Prompt 工作台 |
| `bible_study/comprehensive_exegesis_reader.html` | 選單設定檔 | 釋經參讀 Bible Commentary - Bible100 |
| `bible_study/sidebar.html` | 選單設定檔 | 聖經研讀 · Sidebar |
| `church_ministry/_landing/education.html` | 選單設定檔 | C 教育培訓 · Bible100 |
| `church_ministry/_landing/fellowship.html` | 選單設定檔 | B 牧養 · 轉到 pastoral |
| `church_ministry/_landing/worship.html` | 選單設定檔 | A 崇拜聖樂 · Bible100 |
| `church_ministry/congregation/index.html` | 選單設定檔 | 會眾入口 - Church Center |
| `church_ministry/dashboard.html` | 選單設定檔 | 教會事工儀表板 - Church Ministry Dashboard · Da |
| `church_ministry/guide_crm_journey_hub.html` | 選單設定檔 | 轉到行政執行導覽（舊 CRM Hub 已退役） |
| `church_ministry/guide_crm_trial_30min.html` | 選單設定檔 | 轉到教會選路（舊 CRM 試玩已退役） |
| `church_ministry/modules/administration/financial-management.html` | 選單設定檔 | 財務管理（舊頁）· Financial Management | Church  |
| `church_ministry/modules/development/development-plan.html` | 選單設定檔 | 教育發展計劃 → 備課 Tab |
| `church_ministry/modules/development/youth-ministry-dev.html` | 選單設定檔 | 青年事工 - 社交媒体风格 · Youth Ministry Dev | Chu |
| `church_ministry/modules/education/education-integrated.html` | 選單設定檔 | 主日學工作桌 · C 區 · 5 Tab | Church Ministry |
| `church_ministry/modules/equipment/equipment-management.html` | 選單設定檔 | 设备管理系统 · Equipment Management | Church M |
| `church_ministry/modules/expansion/branch-management.html` | 選單設定檔 | 分堂管理 · Branch Management | Church Minist |
| `church_ministry/modules/expansion/church-planting.html` | 選單設定檔 | 植堂计划管理 · Church Planting | Church Minist |
| `church_ministry/modules/expansion/community-assessment.html` | 選單設定檔 | 社区调研 - 雷达图分析 · Community Assessment | Ch |
| `church_ministry/modules/expansion/cross-cultural.html` | 選單設定檔 | 跨文化事工 - Church Ministry · Cross Cultural |
| `church_ministry/modules/expansion/mission-expansion.html` | 選單設定檔 | 宣教拓展 · Mission Expansion | Church Minist |
| `church_ministry/modules/expansion/mission-opportunities.html` | 選單設定檔 | 宣教机会 - 世界地图 · Mission Opportunities | Ch |
| `church_ministry/modules/expansion/new-ministry-planning.html` | 選單設定檔 | 新事工规划 - 看板管理 · New Ministry Planning | C |
| `church_ministry/modules/expansion/outreach-integrated.html` | 選單設定檔 | 外展工作桌 · D 區 · 3 Tab | Church Ministry |
| `church_ministry/modules/expansion/outreach-strategy.html` | 選單設定檔 | 外展策略 · D 區真鏈 | Church Ministry |
| `church_ministry/modules/finance/finance-integrated.html` | 選單設定檔 | 財務事工完整系統 - Finance Ministry · Finance In |
| `church_ministry/modules/innovation/digital-transformation.html` | 選單設定檔 | 数字化转型 - 流程图 · Digital Transformation | C |
| `church_ministry/modules/innovation/innovation-projects.html` | 選單設定檔 | 创新项目管理 · Innovation Projects | Church Mi |
| `church_ministry/modules/innovation/new-media.html` | 選單設定檔 | 新媒体事工 - Church Ministry · New Media | Ch |
| `church_ministry/modules/innovation/technology-integration.html` | 選單設定檔 | 科技应用 · Technology Integration | Church M |
| `church_ministry/modules/library/library-management.html` | 選單設定檔 | 图书管理系统 · Library Management | Church Min |
| `church_ministry/modules/media/audio-team.html` | 選單設定檔 | 音响团队管理系统 - 专业版 · Audio Team | Church Min |
| `church_ministry/modules/media/live-streaming.html` | 選單設定檔 | 视频直播管理系统 - 专业版 · Live Streaming | Church |
| `church_ministry/modules/media/video-production.html` | 選單設定檔 | 影片制作管理系统 - 专业版 · Video Production | Chur |
| `church_ministry/modules/members/member-integrated.html` | 選單設定檔 | 會友事工完整系統 - Church Ministry · Member Inte |
| `church_ministry/modules/research/engagement-analysis.html` | 選單設定檔 | 参与度分析 - 数据仪表盘 · Engagement Analysis | Ch |
| `church_ministry/modules/research/growth-trends.html` | 選單設定檔 | 增長趨勢分析 - Growth Trends Analysis · Growth |
| `church_ministry/modules/research/index.html` | 選單設定檔 | 研究與統計 · Research & Statistics Index | Ch |
| `church_ministry/modules/research/member-statistics.html` | 選單設定檔 | 會員統計 · Member Statistics | Church Minist |
| `church_ministry/modules/research/ministry-performance.html` | 選單設定檔 | 事工績效評估 · Ministry Performance | Church M |
| `church_ministry/modules/research/research-integrated.html` | 選單設定檔 | 研究與統計 · F 區 · 整合 Tab | Church Ministry |
| `church_ministry/modules/support/smart-reminders.html` | 選單設定檔 | 智能提醒系統 · Smart Reminders | Church Minist |
| `church_ministry/modules/support/visitation_index.html` | 選單設定檔 | 探訪工具桌 · Visitation Index | Church Minist |
| `church_ministry/modules/support/workflow.html` | 選單設定檔 | Workflow 跟進流程 · Workflow | Church Minist |
| `church_ministry/modules/tech/ai-assistant.html` | 選單設定檔 | AI 助手 · Ai Assistant | Church Ministry |
| `church_ministry/modules/tech/smart-recommendation.html` | 選單設定檔 | 智能推薦 · Smart Recommendation | Church Min |
| `church_ministry/modules/volunteer/volunteer-integrated.html` | 選單設定檔 | 志工事工完整系統 - Volunteer Ministry · Voluntee |
| `church_ministry/modules/worship/attendance-management.html` | 選單設定檔 | 已合併 → 主日一桌 |
| `church_ministry/modules/worship/choir-team.html` | 選單設定檔 | 詩班團隊 · 聲部平衡與事工流程 · Choir Team | Church M |
| `church_ministry/modules/worship/congregational-songs.html` | 選單設定檔 | 会众诗歌管理 · Congregational Songs | Church M |
| `church_ministry/modules/worship/hospitality.html` | 選單設定檔 | 招待事奉管理 - 周历视图 · Hospitality | Church Min |
| `church_ministry/modules/worship/instrument-team.html` | 選單設定檔 | 器乐团队管理系统 · Instrument Team | Church Mini |
| `church_ministry/modules/worship/pulpit-ministry.html` | 選單設定檔 | 讲台事奉管理系统 - Church Ministry · Pulpit Mini |
| `church_ministry/modules/worship/sermon-notes-admin.html` | 選單設定檔 | 講道筆記模板 · Sermon Notes Admin | Church Min |
| `church_ministry/modules/worship/sheet-music.html` | 選單設定檔 | 樂譜管理 Music Stand · Sheet Music | Church  |
| `church_ministry/modules/worship/song-library.html` | 選單設定檔 | 詩歌庫 Song Library · Song Library | Church |
| `church_ministry/modules/worship/worship-integrated.html` | 選單設定檔 | 敬拜事工完整系统 - Worship Ministry · Worship In |
| `church_ministry/modules/worship/worship-management.html` | 選單設定檔 | 崇拜禮儀管理 · Worship Management | Church Min |
| `church_ministry/modules/worship/worship-reports.html` | 選單設定檔 | 已合併 → 主日一桌 |
| `church_ministry/modules/worship/worship-team-management.html` | 選單設定檔 | 敬拜团队管理 · Worship Team Management | Churc |
| `church_ministry/modules/worship/worship-together.html` | 選單設定檔 | 会众筑坛 · Worship Together | Church Ministr |
| `church_ministry/people/people_list.html` | 選單設定檔 | 人員總覽 - People |
| `church_ministry/sidebar_church_layout_v1.html` | 選單設定檔 | 教會事工平台 - Church Ministry · Sidebar Churc |
| `church_ministry/tools/volunteer_shift/index.html` | 選單設定檔 | 義工智能排班 · 首頁 |
| `church_planning/assessment-os-hub.html` | 選單設定檔 | 健康診斷中心｜教會規劃 |
| `church_planning/cta-os-war-room.html` | 選單設定檔 | 健康雷達戰情室｜教會規劃 |
| `church_planning/index_plan.html` | 選單設定檔 | 教會規劃 OS · 3 分鐘起步指南 |
| `school_management/dashboard.html` | 選單設定檔 | Redirect · 教务工作台 |
| `school_management/sidebar.html` | 選單設定檔 | 學校管理 · Sidebar |

### A 敬拜音樂（7 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/workbenches/dept_A_worship.html` | 資料夾推測 | A 敬拜／音樂 · 部門工作台（範本） |
| `church_ministry/_landing/worship.html` | 選單設定檔 | A 崇拜聖樂 · Bible100 |
| `church_ministry/modules/worship/choir-team.html` | 選單設定檔 | 詩班團隊 · 聲部平衡與事工流程 · Choir Team | Church M |
| `church_ministry/modules/worship/instrument-team.html` | 選單設定檔 | 器乐团队管理系统 · Instrument Team | Church Mini |
| `church_ministry/modules/worship/song-library.html` | 選單設定檔 | 詩歌庫 Song Library · Song Library | Church |
| `church_ministry/modules/worship/worship-sunday-desk.html` | 選單設定檔 | 主日一桌 · 點名／缺席／數字／匯出 | Church Ministry |
| `church_ministry/modules/worship/worship-team-management.html` | 選單設定檔 | 敬拜团队管理 · Worship Team Management | Churc |

### B 牧養小組（57 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/modules/care/care-ministry.html` | 資料夾推測 | 關懷輔導管理 · Care Ministry | Church Ministry |
| `church_ministry/modules/fellowship/activity-management.html` | 資料夾推測 | 活動管理 · Activity Management | Church Mini |
| `church_ministry/modules/fellowship/community-forum.html` | 資料夾推測 | 社群論壇 · Community Forum | Church Ministry |
| `church_ministry/modules/fellowship/fellowship-management.html` | 資料夾推測 | 团契管理系统 - 专业版 · Fellowship Management | C |
| `church_ministry/modules/fellowship/golden-age-ai-rules.html` | 資料夾推測 | AI 使用守則 · 豐盛金齡 |
| `church_ministry/modules/fellowship/golden-age-chapter-map.html` | 資料夾推測 | V2 章節 × 站內頁 · 豐盛金齡 |
| `church_ministry/modules/fellowship/golden-age-consent.html` | 資料夾推測 | 知情同意 · 豐盛金齡 |
| `church_ministry/modules/fellowship/golden-age-context-scan.html` | 資料夾推測 | 處境觀測短卷 · 豐盛金齡 |
| `church_ministry/modules/fellowship/golden-age-failsafe.html` | 資料夾推測 | 失敗指標／停損 · 豐盛金齡 |
| `church_ministry/modules/fellowship/golden-age-hub.html` | 資料夾推測 | 豐盛金齡 · 第三里程｜安全門 W0–W2 |
| `church_ministry/modules/fellowship/golden-age-referral.html` | 資料夾推測 | 轉介資源模板 · 豐盛金齡 |
| `church_ministry/modules/fellowship/golden-age-reflect.html` | 資料夾推測 | 自願輕量省察 · 豐盛金齡 |
| `church_ministry/modules/fellowship/golden-age-rest.html` | 資料夾推測 | 安靜參與／退場祝福 · 豐盛金齡 |
| `church_ministry/modules/fellowship/golden-age-roles.html` | 資料夾推測 | 低壓流動崗 · 豐盛金齡 |
| `church_ministry/modules/fellowship/group-report-copilot.html` | 資料夾推測 | 小組回報 Copilot · Group Report Copilot |
| `church_ministry/modules/fellowship/groups-reports.html` | 資料夾推測 | 小組管理報表 · Groups Reports | Church Ministr |
| `church_ministry/modules/fellowship/groups.html` | 資料夾推測 | 小組管理 · Groups | Church Ministry |
| `church_ministry/modules/fellowship/pastoral_alerts_panel.html` | 資料夾推測 | 缺席預警 · B 牧養 | Church Ministry |
| `church_ministry/modules/fellowship/pastoral_visitation_panel.html` | 資料夾推測 | 探訪佇列 · B 牧養 | Church Ministry |
| `church_ministry/modules/fellowship/photo-album.html` | 資料夾推測 | 相簿管理 · Photo Album | Church Ministry |
| `church_ministry/modules/fellowship/small-groups-integrated.html` | 資料夾推測 | 小组事工完整系统 - Small Groups Ministry · Small |
| `church_ministry/modules/fellowship/visitation-ministry.html` | 資料夾推測 | 探訪事工 · Visitation Ministry | Church Mini |
| `church_ministry/modules/fellowship/visitation-reports.html` | 資料夾推測 | 探訪報表 · Visitation Reports | Church Minis |
| `church_ministry/modules/support/ai-pastoral-draft.html` | 資料夾推測 | AI 牧養草稿 · 人工確認 |
| `church_ministry/modules/support/auto-update.html` | 資料夾推測 | 系统更新 · Auto Update | Church Ministry |
| `church_ministry/modules/support/help-documentation.html` | 資料夾推測 | 帮助文档 · Help Documentation | Church Minis |
| `church_ministry/modules/support/online-support.html` | 資料夾推測 | 在線支援 - Online Support · Online Support | |
| `church_ministry/modules/support/remote-assistance.html` | 資料夾推測 | 遠程協助 - Remote Assistance · Remote Assist |
| `church_ministry/modules/support/system-integration.html` | 資料夾推測 | 系統整合中心 · System Integration | Church Min |
| `church_ministry/modules/support/system-updates.html` | 資料夾推測 | 系統更新 - System Updates · System Updates | |
| `church_ministry/modules/support/technical-support.html` | 資料夾推測 | 技术支援 · Technical Support | Church Minist |
| `church_ministry/modules/support/training-service.html` | 資料夾推測 | 培訓服務 - Training Service · Training Servi |
| `church_ministry/modules/support/update-logs.html` | 資料夾推測 | 更新日誌 - Update Logs · Update Logs | Churc |
| `church_ministry/modules/support/version-check.html` | 資料夾推測 | 版本檢查 - Version Check · Version Check | C |
| `church_ministry/modules/support/visitation-care.html` | 資料夾推測 | 探访关怀管理系统 - 专业版 · Visitation Care | Churc |
| `church_ministry/modules/support/visitation.html` | 資料夾推測 | 探訪關懷管理系統 - 完整版 · Visitation | Church Min |
| `church_ministry/modules/support/visitation_mobile_demo.html` | 資料夾推測 | 探訪匯報（手機示範） · Visitation Mobile Demo | Ch |
| `church_ministry/tools/visitation_followup/dashboard.html` | 資料夾推測 | 探訪跟進 · 儀表板 |
| `church_ministry/tools/visitation_followup/form.html` | 資料夾推測 | 探訪跟進 · 新增 |
| `church_ministry/tools/visitation_followup/index.html` | 資料夾推測 | 探訪跟進 · 首頁 |
| `church_ministry/tools/visitation_followup/list.html` | 資料夾推測 | 探訪跟進 · 清單 |
| `church_ministry/tools/visitation_followup/load_a2_demo.html` | 資料夾推測 | 探訪跟進 · 載入 A2 demo |
| `church_ministry/tools/visitation_followup/setting.html` | 資料夾推測 | 探訪跟進 · 設定 |
| `church_ministry/tools/visitation_followup/uat.html` | 資料夾推測 | 探訪跟進 · 小白驗收（UAT） |
| `church_ministry/workbenches/dept_B_pastoral.html` | 資料夾推測 | B 牧養／小組 · 部門工作台（範本） |
| `church_ministry/_landing/pastoral.html` | 選單設定檔 | B 牧養關懷 · Bible100 |
| `church_ministry/modules/development/youth-ministry-dev.html` | 選單設定檔 | 青年事工 - 社交媒体风格 · Youth Ministry Dev | Chu |
| `church_ministry/modules/fellowship/fellowship-circles.html` | 選單設定檔 | 团契的圈 · Fellowship Circles | Church Minis |
| `church_ministry/modules/fellowship/index.html` | 選單設定檔 | 團契互動 · Module Home | Church Ministry |
| `church_ministry/modules/fellowship/pastoral-events.html` | 選單設定檔 | 圣工与活动通告 · Events | Church Ministry |
| `church_ministry/modules/fellowship/pastoral-integrated.html` | 選單設定檔 | 牧養小組工作桌 · 尋寶地圖 | Church Ministry |
| `church_ministry/modules/fellowship/pastoral-org-roster.html` | 選單設定檔 | 组织与名册中心 · Organization | Church Ministry |
| `church_ministry/modules/fellowship/pastoral-strategy.html` | 選單設定檔 | 牧养策略与关怀 · Strategy | Church Ministry |
| `church_ministry/modules/fellowship/pastoral-training.html` | 選單設定檔 | 门徒装备与训练 · Training | Church Ministry |
| `church_ministry/modules/fellowship/small-groups.html` | 選單設定檔 | 小组事工管理 · Small Groups | Church Ministry |
| `church_ministry/modules/fellowship/visitation.html` | 選單設定檔 | 探訪事工 · Visitation | Church Ministry |
| `church_ministry/modules/support/visitation_index.html` | 選單設定檔 | 探訪工具桌 · Visitation Index | Church Minist |

### C 聖經門訓（30 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/modules/development/congregation-care.html` | 資料夾推測 | 會眾關懷 · Congregation Care | Church Minist |
| `church_ministry/modules/development/leadership-development.html` | 資料夾推測 | 领导力培养 · Leadership Development | Church  |
| `church_ministry/modules/development/leadership-training.html` | 資料夾推測 | 领袖培训 - 课程时间轴 · Leadership Training | Chu |
| `church_ministry/modules/development/small-group-multiplication.html` | 資料夾推測 | 小组倍增 - 树状图 · Small Group Multiplication  |
| `church_ministry/modules/development/spiritual-growth-tracking.html` | 資料夾推測 | 靈命成長追蹤 - 已合併 · Spiritual Growth Tracking |
| `church_ministry/modules/development/spiritual-growth.html` | 資料夾推測 | 灵命成长追踪 - Church Ministry · Spiritual Gro |
| `church_ministry/modules/education/edu_attendance.html` | 資料夾推測 | ② 出席·預警 |
| `church_ministry/modules/education/edu_discipleship.html` | 資料夾推測 | ③ 門訓銜接 |
| `church_ministry/modules/education/edu_roster.html` | 資料夾推測 | ① 學籍·班級 |
| `church_ministry/modules/education/edu_teaching.html` | 資料夾推測 | ④ 教師·課程·目標 |
| `church_ministry/modules/education/education-integrated-legacy.html` | 資料夾推測 | µòÖΦé▓Σ║ïσ╖Ñσ«îµò┤τ│╗τ╡▒ - Education Min |
| `church_ministry/modules/education/education-management.html` | 資料夾推測 | 教育培訓管理 · Education Management | Church M |
| `church_ministry/modules/education/guide_story.html` | 資料夾推測 | 認路導覽 · C 區 |
| `church_ministry/modules/education/leader_path_panel.html` | 資料夾推測 | 領袖培育路徑 · C 教育培訓 | Church Ministry |
| `church_ministry/modules/education/spiritual-growth.html` | 資料夾推測 | 靈命成長 → 門訓 Tab |
| `church_ministry/modules/education/sunday-school.html` | 資料夾推測 | 主日學 → 學籍 Tab |
| `church_ministry/modules/education/training-programs.html` | 資料夾推測 | 培訓課程 Training Programs · Training Progra |
| `church_ministry/workbenches/dept_C_discipleship.html` | 資料夾推測 | C 聖經門訓 · 部門工作台（範本） |
| `ai_tools/sidebar_lab.html` | 選單設定檔 | AI Lab · Sidebar |
| `ai_tools/tools/bible_prompt_generator.html` | 選單設定檔 | Redirect · Prompt 工作台 |
| `bible_study/comprehensive_exegesis_reader.html` | 選單設定檔 | 釋經參讀 Bible Commentary - Bible100 |
| `bible_study/sidebar.html` | 選單設定檔 | 聖經研讀 · Sidebar |
| `church_ministry/_landing/education.html` | 選單設定檔 | C 教育培訓 · Bible100 |
| `church_ministry/guide_crm_journey_hub.html` | 選單設定檔 | 轉到行政執行導覽（舊 CRM Hub 已退役） |
| `church_ministry/modules/development/discipleship-training.html` | 選單設定檔 | 門徒培訓管理 · Discipleship Training | Church  |
| `church_ministry/modules/education/education-integrated.html` | 選單設定檔 | 主日學工作桌 · C 區 · 5 Tab | Church Ministry |
| `church_ministry/modules/support/visitation_index.html` | 選單設定檔 | 探訪工具桌 · Visitation Index | Church Minist |
| `church_ministry/sidebar_crm_journey.html` | 選單設定檔 | 舊 CRM 側欄（已廢品牌） |
| `school_management/dashboard.html` | 選單設定檔 | Redirect · 教务工作台 |
| `school_management/sidebar.html` | 選單設定檔 | 學校管理 · Sidebar |

### D 外展差傳（15 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/mission/city_missions.html` | 資料夾推測 | 城市任務 · Pilot |
| `church_ministry/mission/diagnostic_hub.html` | 資料夾推測 | 教會診斷中心 |
| `church_ministry/mission/disciple_center.html` | 資料夾推測 | 門徒定位中心 |
| `church_ministry/mission/industry_missions.html` | 資料夾推測 | 行業使命 · Pilot |
| `church_ministry/mission/mission_hub.html` | 資料夾推測 | 門徒與使命 · Mission Hub |
| `church_ministry/mission/sidebar_mission.html` | 資料夾推測 | 門徒與使命 · 側欄 |
| `church_ministry/mission/task_library.html` | 資料夾推測 | 使命任務總覽 |
| `church_ministry/modules/expansion/cross-cultural-ministry.html` | 資料夾推測 | 跨文化事工 - 已合併 · Cross Cultural Ministry |  |
| `church_ministry/modules/expansion/outreach_followup.html` | 資料夾推測 | 外展跟進狀態 · D 區 | Church Ministry |
| `church_ministry/modules/mission/mission-ministry.html` | 資料夾推測 | 宣教事工 · Mission Ministry | Church Ministr |
| `church_ministry/modules/mission/mission-reports.html` | 資料夾推測 |  |
| `church_ministry/workbenches/dept_D_outreach.html` | 資料夾推測 | D 外展／差傳 · 部門工作台 |
| `church_ministry/_landing/outreach.html` | 選單設定檔 | D 宣教外展 · Bible100 |
| `church_ministry/modules/expansion/outreach-integrated.html` | 選單設定檔 | 外展工作桌 · D 區 · 3 Tab | Church Ministry |
| `church_ministry/modules/expansion/outreach-strategy.html` | 選單設定檔 | 外展策略 · D 區真鏈 | Church Ministry |

### E 社會服務（18 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/modules/activity/activity-management.html` | 資料夾推測 | 活動管理 · Activity Management | Church Mini |
| `church_ministry/modules/activity/activity-reports.html` | 資料夾推測 | 活動管理統計報表 · Activity Reports | Church Min |
| `church_ministry/modules/volunteer/volunteer-management.html` | 資料夾推測 | 義工管理 · Volunteer Management | Church Min |
| `church_ministry/modules/volunteer/volunteer-reports.html` | 資料夾推測 | 志工管理統計報表 · Volunteer Reports | Church Mi |
| `church_ministry/tools/volunteer_shift/dashboard.html` | 資料夾推測 | 義工智能排班 · 儀表板 |
| `church_ministry/tools/volunteer_shift/form.html` | 資料夾推測 | 義工智能排班 · 新增 |
| `church_ministry/tools/volunteer_shift/list.html` | 資料夾推測 | 義工智能排班 · 清單 |
| `church_ministry/tools/volunteer_shift/load_a1_demo.html` | 資料夾推測 | 載入 A1 試用資料 · 義工排班 |
| `church_ministry/tools/volunteer_shift/rules_check.html` | 資料夾推測 | 義工智能排班 · 排班檢查 |
| `church_ministry/tools/volunteer_shift/setting.html` | 資料夾推測 | 義工智能排班 · 設定 |
| `church_ministry/tools/volunteer_shift/uat.html` | 資料夾推測 | 義工排班 · 小白驗收（UAT） |
| `church_ministry/workbenches/dept_E_admin.html` | 資料夾推測 | 已遷至 G 行政台 |
| `church_ministry/workbenches/dept_E_social.html` | 資料夾推測 | E 社會服務 · 部門工作台 |
| `church_ministry/_landing/social.html` | 選單設定檔 | E 社關服事 · Bible100 |
| `church_ministry/congregation/index.html` | 選單設定檔 | 會眾入口 - Church Center |
| `church_ministry/modules/volunteer/volunteer-integrated.html` | 選單設定檔 | 志工事工完整系統 - Volunteer Ministry · Voluntee |
| `church_ministry/tools/volunteer_shift/index.html` | 選單設定檔 | 義工智能排班 · 首頁 |
| `church_ministry/tools/volunteer_shift/leave_swap.html` | 選單設定檔 | 義工智能排班 · 請假調班 |

### F 樂以載道（7 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/_landing/hymns.html` | 資料夾推測 | F 樂以載道 · 導覽 |
| `church_ministry/workbenches/dept_F_hymns.html` | 資料夾推測 | F 詩歌應用 · 部門工作台 |
| `hymn_management/hymn/default.htm` | 選單設定檔 | HYMN_DEFAULT |
| `hymn_management/hymn_catalog_sort.html` | 選單設定檔 | 曲譜表 · 可排序（原頁） |
| `hymn_management/practical_hymnology/landing.html` | 選單設定檔 | 樂以載道 · 總地圖 |
| `hymn_management/sidebar.html` | 選單設定檔 | 聖詩管理 - 側邊欄 |
| `hymn_management/sidebar_lexidao.html` | 選單設定檔 | 樂以載道 · 側欄 |

### G 規劃行政（58 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/_landing/planning.html` | 資料夾推測 | G 規劃行政 · Bible100 |
| `church_ministry/admin/cloud_login.html` | 資料夾推測 | 教會 CRM 登入 · Cloud Login |
| `church_ministry/admin/demo_data_governance.html` | 資料夾推測 | Demo／正式資料治理 |
| `church_ministry/modules/admin/admin-integrated.html` | 資料夾推測 | 行政營運工作桌 · G 區 · 4 Tab | Church Ministry |
| `church_ministry/modules/admin/audit_log.html` | 資料夾推測 | 操作紀錄（審計）· 行政 | Church Ministry |
| `church_ministry/modules/admin/backup_restore.html` | 資料夾推測 | 備份與還原 · 行政 | Church Ministry |
| `church_ministry/modules/analytics/activity-performance.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/activity-statistics.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/advanced-reports.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/effectiveness-trends.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/financial-statistics.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/growth-trends.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/index.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/member-statistics.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/ministry-performance.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/participation-trends.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/performance-evaluation.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/statistical-reports.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/trend-analysis.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/analytics/volunteer-performance.html` | 資料夾推測 | 導向研究模組 · Research |
| `church_ministry/modules/finance/finance-management.html` | 資料夾推測 | 財務管理 · Finance Management | Church Minis |
| `church_ministry/modules/finance/finance-reports.html` | 資料夾推測 | 財務管理報表 · Finance Reports | Church Minist |
| `church_ministry/modules/research/activity-performance.html` | 資料夾推測 | 活動績效評估 · Activity Performance | Church M |
| `church_ministry/modules/research/activity-statistics.html` | 資料夾推測 | 活動統計 · Activity Statistics | Church Mini |
| `church_ministry/modules/research/advanced-reports.html` | 資料夾推測 | 高級報表生成 · Advanced Reports | Church Minis |
| `church_ministry/modules/research/effectiveness-trends.html` | 資料夾推測 | 效果趨勢分析 · Effectiveness Trends | Church M |
| `church_ministry/modules/research/financial-statistics.html` | 資料夾推測 | 財務統計 · Financial Statistics | Church Min |
| `church_ministry/modules/research/participation-trends.html` | 資料夾推測 | 參與趨勢分析 - Participation Trends Analysis · |
| `church_ministry/modules/research/performance-evaluation.html` | 資料夾推測 | 績效評估 · Performance Evaluation | Church M |
| `church_ministry/modules/research/spiritual-stage-funnel.html` | 資料夾推測 | 屬靈階段漏斗 · Spiritual Stage Funnel | Church |
| `church_ministry/modules/research/statistical-reports.html` | 資料夾推測 | 統計報表 · Statistical Reports | Church Mini |
| `church_ministry/modules/research/trend-analysis.html` | 資料夾推測 | 趨勢分析 · Trend Analysis | Church Ministry |
| `church_ministry/modules/research/volunteer-performance.html` | 資料夾推測 | 志工績效評估 · Volunteer Performance | Church  |
| `church_ministry/tools/finance_reconciliation/dashboard.html` | 資料夾推測 | 奉獻與財務對帳 · 儀表板 |
| `church_ministry/tools/finance_reconciliation/form.html` | 資料夾推測 | 奉獻與財務對帳 · 新增 |
| `church_ministry/tools/finance_reconciliation/index.html` | 資料夾推測 | 奉獻與財務對帳 · 首頁 |
| `church_ministry/tools/finance_reconciliation/list.html` | 資料夾推測 | 奉獻與財務對帳 · 清單 |
| `church_ministry/tools/finance_reconciliation/load_a3_demo.html` | 資料夾推測 | 載入 A3 demo |
| `church_ministry/tools/finance_reconciliation/setting.html` | 資料夾推測 | 奉獻與財務對帳 · 設定 |
| `church_ministry/tools/finance_reconciliation/uat.html` | 資料夾推測 | 財務對帳 · UAT |
| `church_ministry/tools/ministry_handover/index.html` | 資料夾推測 | 崗位交接／SOP · 傳承紅燈 |
| `church_ministry/workbenches/dept_G_admin.html` | 資料夾推測 | G 行政支援 · 部門工作台 |
| `church_ministry/dashboard.html` | 選單設定檔 | 教會事工儀表板 - Church Ministry Dashboard · Da |
| `church_ministry/docs/ATTENDANCE_OPS_HANDBOOK.html` | 選單設定檔 |  |
| `church_ministry/modules/education/education-integrated.html` | 選單設定檔 | 主日學工作桌 · C 區 · 5 Tab | Church Ministry |
| `church_ministry/modules/fellowship/attendance-checkin.html` | 選單設定檔 | 現場點名 · 簽到台 | Church Ministry |
| `church_ministry/modules/fellowship/newcomer-qr-desk.html` | 選單設定檔 | 新人發碼台 · 審核出 QR | Church Ministry |
| `church_ministry/modules/fellowship/pastoral-attendance.html` | 選單設定檔 | 聚会与出席统计 · Attendance | Church Ministry |
| `church_ministry/modules/finance/finance-integrated.html` | 選單設定檔 | 財務事工完整系統 - Finance Ministry · Finance In |
| `church_ministry/modules/members/member-integrated.html` | 選單設定檔 | 會友事工完整系統 - Church Ministry · Member Inte |
| `church_ministry/modules/support/visitation_index.html` | 選單設定檔 | 探訪工具桌 · Visitation Index | Church Minist |
| `church_ministry/modules/worship/worship-sunday-desk.html` | 選單設定檔 | 主日一桌 · 點名／缺席／數字／匯出 | Church Ministry |
| `church_ministry/tools/volunteer_shift/index.html` | 選單設定檔 | 義工智能排班 · 首頁 |
| `church_ministry/tools/volunteer_shift/leave_swap.html` | 選單設定檔 | 義工智能排班 · 請假調班 |
| `church_planning/attendance_system_hub.html` | 選單設定檔 | 出席記錄系統 · G 規劃行政 |
| `church_planning/cross_risk_summary.html` | 選單設定檔 | 跨部門風險摘要｜教會規劃 |
| `church_planning/landing_g_admin.html` | 選單設定檔 | 📖 行政運作原則 · G 行政管理 Do |
| `church_planning/ministry-position-matchmaker.html` | 選單設定檔 | 神國職位精準媒合中心｜教會規劃 |

### H 出席系統（9 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/modules/checkins/check-ins.html` | 資料夾推測 | 兒童報到 Check-Ins · Check Ins | Church Mini |
| `church_ministry/_landing/attendance.html` | 選單設定檔 | H 出席系統 · Bible100 |
| `church_ministry/docs/ATTENDANCE_OPS_HANDBOOK.html` | 選單設定檔 |  |
| `church_ministry/modules/education/education-integrated.html` | 選單設定檔 | 主日學工作桌 · C 區 · 5 Tab | Church Ministry |
| `church_ministry/modules/fellowship/attendance-checkin.html` | 選單設定檔 | 現場點名 · 簽到台 | Church Ministry |
| `church_ministry/modules/fellowship/newcomer-qr-desk.html` | 選單設定檔 | 新人發碼台 · 審核出 QR | Church Ministry |
| `church_ministry/modules/fellowship/newcomer-self-register.html` | 選單設定檔 | 新人登記 · 在家填寫 | Bible100 |
| `church_ministry/modules/fellowship/pastoral-attendance.html` | 選單設定檔 | 聚会与出席统计 · Attendance | Church Ministry |
| `church_ministry/modules/worship/worship-sunday-desk.html` | 選單設定檔 | 主日一桌 · 點名／缺席／數字／匯出 | Church Ministry |

### 未歸區（59 頁）

| 頁面 | 歸屬依據 | 標題 |
|---|---|---|
| `church_ministry/_landing/gateway.html` | 無法判定 | 教會總羅盤 · Bible100 |
| `church_ministry/_landing/golden_age.html` | 無法判定 | 金齡 · 轉到安全門 |
| `church_ministry/_templates/tool-kit/dashboard.html` | 無法判定 | {{TOOL_LABEL_ZH}} · 儀表板 |
| `church_ministry/_templates/tool-kit/form.html` | 無法判定 | {{TOOL_LABEL_ZH}} · 新增 |
| `church_ministry/_templates/tool-kit/index.html` | 無法判定 | {{TOOL_LABEL_ZH}} · 工具首頁 |
| `church_ministry/_templates/tool-kit/list.html` | 無法判定 | {{TOOL_LABEL_ZH}} · 清單 |
| `church_ministry/_templates/tool-kit/setting.html` | 無法判定 | {{TOOL_LABEL_ZH}} · 設定 |
| `church_ministry/_templates/tool-kit/uat.html` | 無法判定 | {{TOOL_LABEL_ZH}} · 小白驗收（UAT） |
| `church_ministry/audit/ae_module_audit_dashboard.html` | 無法判定 | A–E 模組總檢儀表板 · Church Ministry |
| `church_ministry/audit/zone_scan_dashboard.html` | 無法判定 | 教會事工 0＋A–H · 全頁靜態掃描 |
| `church_ministry/church_main_rail.html` | 無法判定 | 教會主航道 · 規模→規劃→日常 |
| `church_ministry/congregation/checkin-pre.html` | 無法判定 | 兒童預報到 - Church Center |
| `church_ministry/congregation/sermon-notes.html` | 無法判定 | 講道筆記 - Church Center |
| `church_ministry/congregation/sidebar.html` | 無法判定 | 會眾入口 - 側欄 |
| `church_ministry/dashboard_church_layout_v1_content.html` | 無法判定 | 教會行政 · 今日工作區 |
| `church_ministry/desks/admin.html` | 無法判定 | 已移至 G 區行政營運工作桌 |
| `church_ministry/desks/index.html` | 無法判定 | 已移至路線首頁 |
| `church_ministry/desks/outreach.html` | 無法判定 | 已移至 D 區外展工作桌 |
| `church_ministry/desks/pastoral.html` | 無法判定 | 已移至 B 區牧養工作桌 |
| `church_ministry/desks/worship-team.html` | 無法判定 | 已移至 A 區主日一桌 |
| `church_ministry/docs/qa_tracker_0af.html` | 無法判定 | 教會事工 · 0–F 一鍵查驗 |
| `church_ministry/functions/administration.html` | 無法判定 | 行政管理支持 · Administration | Church Ministr |
| `church_ministry/functions/analytics.html` | 無法判定 | 数据分析中心 · Analytics | Church Ministry |
| `church_ministry/functions/connections.html` | 無法判定 | 模块连接 · Connections | Church Ministry |
| `church_ministry/functions/content.html` | 無法判定 | 教會事工平台 - 內容頁面 · Content | Church Ministr |
| `church_ministry/functions/education.html` | 無法判定 | 灵命培育团队 · Education | Church Ministry |
| `church_ministry/functions/fellowship.html` | 無法判定 | 团契互动团队 · Fellowship | Church Ministry |
| `church_ministry/functions/media.html` | 無法判定 | 媒体创作支持 · Media | Church Ministry |
| `church_ministry/functions/ministry_core.html` | 無法判定 | 教会事工核心 - 介绍页 · Ministry Core | Church Mi |
| `church_ministry/functions/support.html` | 無法判定 | 系统支援 · Support | Church Ministry |
| `church_ministry/functions/worship.html` | 無法判定 | 敬拜事工团队 · Worship | Church Ministry |
| `church_ministry/index.html` | 無法判定 | 教會事工 · Church Ministry |
| `church_ministry/index_c_education_journey.html` | 無法判定 | 主日學旅程 · C 區 Hub | Church Ministry |
| `church_ministry/index_worship_journey.html` | 無法判定 | 敬拜服事旅程 · A 區 Hub | Church Ministry |
| `church_ministry/modules/design/brand-design.html` | 無法判定 | 品牌設計 · Brand Design | Church Ministry |
| `church_ministry/modules/design/poster-design.html` | 無法判定 | 海報設計 · Poster Design | Church Ministry |
| `church_ministry/modules/design/promotional-materials.html` | 無法判定 | 宣傳材料 · Promotional Materials | Church Mi |
| `church_ministry/modules/innovation/best-practices.html` | 無法判定 | 最佳实践 - 案例画廊 · Best Practices | Church Mi |
| `church_ministry/modules/innovation/new-media-ministry.html` | 無法判定 | 新媒體事工 - 已合併 · New Media Ministry | Churc |
| `church_ministry/modules/innovation/smart-tools-dev.html` | 無法判定 | 智能工具开发 - 甘特图 · Smart Tools Dev | Church  |
| `church_ministry/modules/innovation/technology-apps.html` | 無法判定 | 新技术应用 - 应用商店 · Technology Apps | Church  |
| `church_ministry/modules/innovation/youth-innovation.html` | 無法判定 | 青年事工创新 · Youth Innovation | Church Minis |
| `church_ministry/modules/media/ai-assistant.html` | 無法判定 | AI助手管理 · Ai Assistant | Church Ministry |
| `church_ministry/modules/media/audio-editing.html` | 無法判定 | 音頻編輯 · Audio Editing | Church Ministry |
| `church_ministry/modules/media/audio-processing.html` | 無法判定 | 音頻處理 · Audio Processing | Church Ministr |
| `church_ministry/modules/media/digital-ministry.html` | 無法判定 | 数位事工管理 · Digital Ministry | Church Minis |
| `church_ministry/modules/media/mixing-production.html` | 無法判定 | 混音製作 · Mixing Production | Church Minist |
| `church_ministry/modules/media/recording-management.html` | 無法判定 | 錄音管理 · Recording Management | Church Min |
| `church_ministry/modules/tech/automation-workflow.html` | 無法判定 | 自動化流程 · Automation Workflow | Church Min |
| `church_ministry/projects/visitation_ministry/index.html` | 無法判定 | 探訪事工專案 · Visitation Ministry |
| `church_ministry/projects/visitation_site/index.html` | 無法判定 | 探访关怀管理系统 - 独立站 |
| `church_ministry/projects/visitation_site/visitation.html` | 無法判定 | 探访关怀管理系统 - 完整版 |
| `church_ministry/sidebar_c_education_journey.html` | 無法判定 | C 區 · 已併入 layout v1 |
| `church_ministry/sidebar_church_gateway.html` | 無法判定 | 教會選路 · Sidebar |
| `church_ministry/sidebar_pastoral_journey.html` | 無法判定 | 牧养 · 牧羊小径侧栏 |
| `church_ministry/sidebar_worship_journey.html` | 無法判定 | 敬拜 · 服事旅程侧栏 |
| `church_ministry/tools/uat_index.html` | 無法判定 | 教會 CRM 工具 · 小白驗收總表 |
| `church_ministry/visitation_standalone.html` | 無法判定 | 探访关怀管理系统 - 独立站 · Visitation Standalone | |
| `church_ministry/workbenches/ai_drafts_pastoral.html` | 無法判定 | AI 草稿 · 長執摘要／B 週報 |
