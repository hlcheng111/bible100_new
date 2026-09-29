# 教會事工 · 0–F 查驗追蹤表（P0 · 2026-07-24）

> **SSOT 成熟度**：[`PAGE_MATURITY_INVENTORY_0AF.md`](./PAGE_MATURITY_INVENTORY_0AF.md)  
> **本表用途**：編號＋頁名＋原成熟度＋P0 現況＋**可攜路徑**（追蹤主鍵）  
> **P0 已做**：修列印字串亂碼（desk kit 誤插）；側欄去掉「15 主桌」區塊；頂欄去掉「15 主桌」鈕；A–F 目錄結構未改。

---

## 一鍵入口（請用這個，不要點 md 裡的相對路徑）

**正確開啟（HTTP）**：

http://127.0.0.1:8080/church_ministry/docs/qa_tracker_0af.html

| 提醒 | 說明 |
|------|------|
| **不要**用 `file://` 開本 md | Cursor／編輯器會把路徑當程式碼顯示，無法一鍵進頁 |
| **不要**只複製表內裸相對路徑 | 必須帶 `{ORIGIN}/`（例 `http://127.0.0.1:8080/`） |
| 查驗 Hub | 上列 HTML：Chrome 或 Cursor Simple Browser 皆可；每列有「雙欄／單頁」 |
| 殼內捷徑 | 教會事工頂欄 **「📋 查驗表」** → 右欄載入同一 Hub |

本機未起 HTTP 時，請先在站根啟動伺服器（常見埠 8080），再貼上列網址。

---

## 地址一定要 `127.0.0.1` 嗎？

**不必。** 正式追蹤請用 **站根相對路徑**（下表「路徑」欄）。

| 用法 | 怎麼寫 |
|------|--------|
| **追蹤／文件（建議）** | `church_ministry/modules/members/member-integrated.html` |
| **本機 HTTP 預覽** | `{ORIGIN}/` + 路徑，例 `http://127.0.0.1:8080/` + 路徑 |
| **雙欄殼內右欄** | `{ORIGIN}/church_ministry/index.html?content=` +（相對 `church_ministry/` 的路徑） |
| **總站殼** | `{ORIGIN}/index_v5.html` 再進教會事工 |

`127.0.0.1:8080` 只是本機常見 `ORIGIN`；換埠、換主機、上雲時路徑欄不變。

**預設本機 ORIGIN 例**：`http://127.0.0.1:8080`

---

## 殼／側欄（含 index）

| 編號 | 頁名 | 原成熟度 | P0 現況 | 備註 | 路徑 |
|------|------|----------|---------|------|------|
| **CM-INDEX** | 教會事工 Standalone 殼 / index | 殼 | 雙欄可用；已去頂欄「15 主桌」 | 對齊 index_v5：左 sidebarFrame＋右 contentFrame | `church_ministry/index.html` |
| **CM-SB-LAYOUT** | 教會佈局側欄 V1 | 側欄 | 已去「15 主桌」區塊；**A–F 結構保留** | 查驗主側欄 | `church_ministry/sidebar_church_layout_v1.html` |
| **CM-DASH-LAYOUT** | 佈局儀表板（預設右欄） | LIVE／殼 | 未改 IA | 殼預設 content | `church_ministry/dashboard_church_layout_v1.html` |
| **HUB-INDEX** | 總站 index_v5 | 總殼 | 不在本 P0 改 | 聯邦入口 | `index_v5.html` |
| **CM-SB-CRM** | CRM 旅程側欄 | 側欄 | 未改 | 「回 CRM」會換左欄（%） | `church_ministry/sidebar_crm_journey.html` |
| **CM-SB-WORSHIP** | 敬拜旅程側欄 | 側欄 | 未改 | 「公園導覽」會換左欄（%） | `church_ministry/sidebar_worship_journey.html` |
| **CM-SB-C** | C 教育側欄 | 側欄 | 未改 | 主日學／跨模換欄 | `church_ministry/sidebar_c_education_journey.html` |

殼預覽：`{ORIGIN}/church_ministry/index.html`  
右欄直達例：`{ORIGIN}/church_ministry/index.html?content=modules/members/member-integrated.html`

---

## 0 · CRM

| 編號 | 頁名 | 原成熟度 | P0 現況 | 備註 | 路徑 |
|------|------|----------|---------|------|------|
| 0-00 | 導覽說明 | 說明 | 未抽樣 | 合併→幫助中心即可 | `help/site-navigation-guide.html` |
| 0-01 | 會友主檔 | LIVE · 3 | **亂碼已修** | 列印字串曾噴碼 | `church_ministry/modules/members/member-integrated.html` |
| 0-02 | 探訪工作桌 | LIVE · 3 | **亂碼已修** | | `church_ministry/modules/support/visitation_index.html` |
| 0-03 | 義工排班 | LIVE · 3 | list 列印**已修** | 主入口 index；列印在 list | `church_ministry/tools/volunteer_shift/index.html` |
| 0-03b | 義工班表 list | （0-03 子頁） | **亂碼已修** | | `church_ministry/tools/volunteer_shift/list.html` |
| 0-04 | 教會規劃 OS | PARTIAL | 跨模 · 未改 | 合併→planning | `church_planning/index_plan.html` |
| 0-05 | 健康診斷中心 | PARTIAL | 跨模 · 未改 | | `church_planning/assessment-os-hub.html` |
| 0-06 | 健康雷達戰情室 | PARTIAL | 跨模 · 未改 | | `church_planning/cta-os-war-room.html` |
| 0-07 | CRM 理念 | DEMO | 未改 | 建議僅教學 | `church_ministry/guide_crm_journey_hub.html?tab=intro` |
| 0-08 | 我的事奉旅程 | PARTIAL | 未改 | | `church_ministry/guide_crm_journey_hub.html?tab=journey` |
| 0-09 | 執事牧者視角 | PARTIAL | 未改 | | `church_ministry/guide_crm_journey_hub.html?tab=vision&role=leader` |
| 0-10 | 事奉媒合 | DEMO | 未改 | | `church_ministry/guide_crm_journey_hub.html?tab=matchmaker` |
| 0-11 | 30 分鐘試玩 | PARTIAL | 未改 | | `church_ministry/guide_crm_trial_30min.html` |
| 0-12～0-15 | 角色捷徑 | 捷徑 | 合併→0-08／0-09 | Hub `role=` | （同 0-08／0-09） |
| 0-16 | 志工體系／崗位 | PARTIAL→3 | **亂碼已修** | = E-02 | `church_ministry/modules/volunteer/volunteer-integrated.html` |

---

## A · 敬拜

| 編號 | 頁名 | 原成熟度 | P0 現況 | 備註 | 路徑 |
|------|------|----------|---------|------|------|
| A-01 | 公園导览 | PARTIAL | 未改內容；**% 換側欄** | landing | `church_ministry/_landing/worship.html` |
| A-02 | 会众筑坛 | PARTIAL | 未改 | | `church_ministry/modules/worship/worship-together.html` |
| A-03 | 同工·今日祭坛 | PARTIAL | 頁仍在 | view=volunteer | `church_ministry/modules/worship/worship-integrated.html?view=volunteer` |
| A-04 | 部长·主日策划 | LIVE · 3 | 頁仍在 | 主桌 | `church_ministry/modules/worship/worship-integrated.html?view=leader#plan` |
| A-05 | 講壇事奉 | PARTIAL | 未改 | | `church_ministry/modules/worship/pulpit-ministry.html` |
| A-06 | 講道筆記 | PARTIAL | 未改 | | `church_ministry/modules/worship/sermon-notes-admin.html` |
| A-07 | 招待事奉 | PARTIAL | 未改 | | `church_ministry/modules/worship/hospitality.html` |
| A-08 | 敬拜完整系統 | 合併→A-04 | 同殼 | | `church_ministry/modules/worship/worship-integrated.html` |
| A-09 | 敬拜團隊 | PARTIAL | 未改 | | `church_ministry/modules/worship/worship-team-management.html` |
| A-10 | 詩班 | PARTIAL | 未改 | | `church_ministry/modules/worship/choir-team.html` |
| A-11 | 器樂 | PARTIAL | 未改 | | `church_ministry/modules/worship/instrument-team.html` |
| A-12 | 會眾詩歌 | PARTIAL | 未改 | | `church_ministry/modules/worship/congregational-songs.html` |
| A-13 | 樂譜 | PARTIAL | 未改 | | `church_ministry/modules/worship/sheet-music.html` |
| A-14 | 詩歌庫 | PARTIAL | 未改 | | `church_ministry/modules/worship/song-library.html` |
| A-15 | 崇拜禮儀 | PARTIAL | 頁仍在 | | `church_ministry/modules/worship/worship-management.html` |
| A-16 | 崇拜統計 | 3（合併殼） | 側欄→主日一桌 | 原路徑可 redirect | `church_ministry/modules/worship/worship-reports.html` |
| A-17 | 崇拜出席 | 3（合併殼） | 側欄→主日一桌 | | `church_ministry/modules/worship/attendance-management.html` |
| A-16/17壳 | 主日一桌 | LIVE 殼 | 點名／缺席／數字同頁 | | `church_ministry/modules/worship/worship-sunday-desk.html` |
| A-18 | 音響團隊 | DEMO | 薄殼／待查 | | `church_ministry/modules/media/audio-team.html` |
| A-19 | 視頻直播 | DEMO | 薄殼／待查 | | `church_ministry/modules/media/live-streaming.html` |

---

## B · 牧養

| 編號 | 頁名 | 原成熟度 | P0 現況 | 備註 | 路徑 |
|------|------|----------|---------|------|------|
| B-01 | 探訪（捷徑） | 合併→0-02 | 同 0-02 | | （同 0-02） |
| B-02 | 牧羊导览 | PARTIAL | 未改 | | `church_ministry/_landing/fellowship.html` |
| B-03 | 团契总览 | PARTIAL | 薄殼／待查 | | `church_ministry/modules/fellowship/index.html` |
| B-04 | 小组工作桌 | 3 | **亂碼已修** | | `church_ministry/modules/fellowship/small-groups-integrated.html` |
| B-05 | 组织与名册 | PARTIAL | 未改 | | `church_ministry/modules/fellowship/pastoral-org-roster.html` |
| B-06 | 聚会出席 | 3 | 未改 | | `church_ministry/modules/fellowship/pastoral-attendance.html` |
| B-07 | 活动通告 | PARTIAL | 未改 | | `church_ministry/modules/fellowship/pastoral-events.html` |
| B-08 | 门徒训练 | PARTIAL | 合併建議→C | | `church_ministry/modules/fellowship/pastoral-training.html` |
| B-09 | 牧养战略桌 | PARTIAL | 未改 | | `church_ministry/modules/fellowship/pastoral-strategy.html` |
| B-10 | 团契的圈 | PARTIAL | 未改 | | `church_ministry/modules/fellowship/fellowship-circles.html` |
| B-11 | 会友主档（捷徑） | 合併→0-01 | 同 0-01；亂碼源同修 | | （同 0-01） |
| B-12 | 青年团契 | PARTIAL | 薄殼／待查 | | `church_ministry/modules/development/youth-ministry-dev.html` |

---

## C · 教育

| 編號 | 頁名 | 原成熟度 | P0 現況 | 備註 | 路徑 |
|------|------|----------|---------|------|------|
| C-01 | 主日學工作桌 | 殼 LIVE · 3 | 未改；側欄可換左欄 | 五 Tab | `church_ministry/modules/education/education-integrated.html` |
| C-01a～e | Tab 導覽／名冊／出席／門訓／教學 | 殼內 | 未改 | `#tab-*` | （同 C-01 + hash） |
| C-02 | 聖經研讀 | 跨模 | **# 換側欄** | | `bible_study/dashboard.html?lang=CN` |
| C-03 | 學校管理 | 跨模 | **# 換側欄** | | `school_management/dashboard.html` |
| C-04 | 門訓動力站 | PARTIAL | 未改 | | `church_ministry/modules/development/discipleship-training.html` |
| C-05 | AI 工具 | 跨模 | **# 換側欄** | | `ai_tools/dashboard.html` |

---

## D · 外展

| 編號 | 頁名 | 原成熟度 | P0 現況 | 備註 | 路徑 |
|------|------|----------|---------|------|------|
| D-01 | 外展需求真鏈 | LIVE · 3 | **亂碼已修** | | `church_ministry/modules/expansion/outreach-strategy.html` |
| D-02 | 社區需求調研 | DEMO | 薄殼／待查 | | `church_ministry/modules/expansion/community-assessment.html` |
| D-03 | 宣教機會 | DEMO | 薄殼／待查 | | `church_ministry/modules/expansion/mission-opportunities.html` |
| D-04 | 新事工規劃 | DEMO | 薄殼／待查 | | `church_ministry/modules/expansion/new-ministry-planning.html` |
| D-05 | 外展策略（子） | 合併→D-01 | 同 D-01 | | （同 D-01） |
| D-06 | 植堂計劃 | DEMO | 薄殼／待查 | | `church_ministry/modules/expansion/church-planting.html` |
| D-07 | 分堂管理 | DEMO | 薄殼／待查 | | `church_ministry/modules/expansion/branch-management.html` |
| D-08 | 宣教拓展 | DEMO | 薄殼／待查 | | `church_ministry/modules/expansion/mission-expansion.html` |
| D-09 | 跨文化 | DEMO | 薄殼／待查 | | `church_ministry/modules/expansion/cross-cultural.html` |
| D-10 | 新媒體 | DEMO | 薄殼／待查 | | `church_ministry/modules/innovation/new-media.html` |
| D-11 | 創新項目 | DEMO | 薄殼／待查 | | `church_ministry/modules/innovation/innovation-projects.html` |
| D-12 | 科技應用 | DEMO | 薄殼／待查 | | `church_ministry/modules/innovation/technology-integration.html` |

---

## E · 社會服務

| 編號 | 頁名 | 原成熟度 | P0 現況 | 備註 | 路徑 |
|------|------|----------|---------|------|------|
| E-01 | 義工排班（捷徑） | 合併→0-03 | 同 0-03 | | （同 0-03） |
| E-02 | 志工體系（捷徑） | 合併→0-16 | 同 0-16 | | （同 0-16） |
| E-03 | 會眾／社區學苑 | PARTIAL | 薄殼／待查 | | `church_ministry/congregation/index.html` |

---

## F · 行政支援

| 編號 | 頁名 | 原成熟度 | P0 現況 | 備註 | 路徑 |
|------|------|----------|---------|------|------|
| F-01 | 戰情儀表板 | LIVE · 3 | 未改 | 另有 layout 儀表板 | `church_ministry/dashboard.html` |
| F-02 | 人員總覽 | PARTIAL | 合併→0-01 | | `church_ministry/people/people_list.html` |
| F-03 | 會友事工（捷徑） | 合併→0-01 | 同 0-01 | | （同 0-01） |
| F-04 | 財務事工 | 3 | **亂碼已修** | | `church_ministry/modules/finance/finance-integrated.html` |
| F-05 | 財務管理（舊） | 合併→F-04 | 合併提示 | | `church_ministry/modules/administration/financial-management.html` |
| F-06 | 設備 | DEMO | 薄殼／待查 | | `church_ministry/modules/equipment/equipment-management.html` |
| F-07 | 圖書 | DEMO | 薄殼／待查 | | `church_ministry/modules/library/library-management.html` |
| F-08 | 社群捐款人 | DEMO | 薄殼／待查 | | `church_ministry/community-overview.html` |
| F-09 | 研究索引 | DEMO | 薄殼／待查 | | `church_ministry/modules/research/index.html` |
| F-10 | 會眾統計 | DEMO | 合併建議→F-09／F-01 | | `church_ministry/modules/research/member-statistics.html` |
| F-11 | 事工成效 | DEMO | 同上 | | `church_ministry/modules/research/ministry-performance.html` |
| F-12 | 增長趨勢 | DEMO | 同上 | | `church_ministry/modules/research/growth-trends.html` |
| F-13 | 參與度 | DEMO | 有圖表；待查真資料 | | `church_ministry/modules/research/engagement-analysis.html` |
| F-14 | 影片製作 | DEMO | 薄殼／待查 | | `church_ministry/modules/media/video-production.html` |
| F-15 | AI 助手 | DEMO | 薄殼／待查 | | `church_ministry/modules/tech/ai-assistant.html` |
| F-16 | 數位事工 | DEMO | 薄殼／待查 | | `church_ministry/modules/tech/smart-recommendation.html` |
| F-17 | 數位化轉型 | DEMO | 建議下架工具 | | `church_ministry/modules/innovation/digital-transformation.html` |
| F-18 | 智能提醒 | DEMO | 薄殼／待查 | | `church_ministry/modules/support/smart-reminders.html` |
| F-19 | Workflow | DEMO | 薄殼／待查 | | `church_ministry/modules/support/workflow.html` |
| F-20 | 主題設定 | PARTIAL | 未改 | | `church_ministry/theme-settings.html` |
| F-21 | 自訂頁編輯 | PARTIAL | 未改 | | `church_ministry/custom-page-editor.html` |
| F-22 | 新技術應用 | DEMO | 建議下架 | | `church_ministry/modules/innovation/technology-apps.html` |
| F-23 | 智能工具開發 | DEMO | 建議下架 | | `church_ministry/modules/innovation/smart-tools-dev.html` |
| F-24 | 最佳實踐 | DEMO | 建議文件化 | | `church_ministry/modules/innovation/best-practices.html` |
| F-25 | 技術支援 | DEMO | 薄殼／待查 | | `church_ministry/modules/support/technical-support.html` |
| F-26 | 幫助文檔 | PARTIAL | 未改 | | `church_ministry/modules/support/help-documentation.html` |
| F-27 | 願景藍圖 | PARTIAL | 未改 | | `church_ministry/vision_and_plan.html` |
| F-28 | 路線圖 | PARTIAL | 未改 | | `church_ministry/roadmap-overview.html` |
| F-29 | 事工總覽 | PARTIAL | 未改 | | `church_ministry/ministry_core.html` |
| F-30 | AI 合規 | DEMO | 未改 | | `church_ministry/ai-and-compliance.html` |

---

## P0 亂碼修復清單（已關閉）

| 編號 | 檔案 |
|------|------|
| 0-01 | `modules/members/member-integrated.html` |
| 0-02 | `modules/support/visitation_index.html` |
| 0-03b | `tools/volunteer_shift/list.html` |
| 0-16 | `modules/volunteer/volunteer-integrated.html` |
| B-04 | `modules/fellowship/small-groups-integrated.html` |
| D-01 | `modules/expansion/outreach-strategy.html` |
| F-04 | `modules/finance/finance-integrated.html` |
| （附） | `visitation-reports` / `groups-reports` / `finance-reports` 列印模板 |

修法腳本：`church_ministry/scripts/fix_desk_kit_write_breaks.py`

---

## 快速抽樣（本機 ORIGIN 例）

```
http://127.0.0.1:8080/church_ministry/index.html
http://127.0.0.1:8080/church_ministry/index.html?content=modules/members/member-integrated.html
http://127.0.0.1:8080/church_ministry/modules/members/member-integrated.html
```

完整成熟度定義與議決仍以 inventory 為準；本表「P0 現況」只記本波結果與待查標記。
