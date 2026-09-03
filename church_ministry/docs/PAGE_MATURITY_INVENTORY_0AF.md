# 教會事工 · 0–F 功能頁成熟度施工單（SSOT）

> **日期**：2026-07-23  
> **用途**：頁頁達標（實作／互動／串通／記錄·報告）的**正式清單**；人事＋工程同桌 1 小時用「三選一」釘死範圍，再依施工序做滿。  
> **側欄來源**：`sidebar_crm_journey.html`、`sidebar_church_layout_v1.html`、`sidebar_c_education_journey.html`  
> **對照**：[`TRANSFORM_ABC_CHECKLIST_STAGE1.md`](./TRANSFORM_ABC_CHECKLIST_STAGE1.md)（流程 A/B/C）· 本表＝**頁級**施工。  
> **預覽根**：先於專案根執行 `.\tools\start_http_bible100.ps1` 或 `python -m http.server 8080`  
> **殼預覽**：http://127.0.0.1:8080/church_ministry/index.html（左選、右欄預覽）

---

## 1. 達標定義（四條＝階段 3）

| 階段 | 意義 |
|------|------|
| **0** | 路通／角標誠實（入口找得到） |
| **1** | 能填、能存，本機有記錄 |
| **2** | 與相關頁／CRM（`memberId`／Bridge）串通 |
| **3** | 有清單或報告可給長執／負責人看（含匯出或儀表板可見） |

**做滿**＝該頁目標達到 **階段 3**（四條全過）。  
儀表板％仍只反映契約欄，**不是**本表完工％。

---

## 2. 同桌 1 小時 · 每頁三選一

| 議決 | 意思 | 後續 |
|------|------|------|
| **做滿** | 要達到四條（階段 3） | 進入下方施工序排隊 |
| **合併** | 與另一編號同一真相，本列不再獨立施工 | 側欄可留捷徑，文案寫「同 Xx」 |
| **下架** | 不做營運工具（可改「僅說明」或從側欄移除） | 禁止當 LIVE／KPI 吹 |

開會填「議決」欄；若未開會，**以工程專家決定為準**（2026-07-23 使用者授權）。「工程建議」做滿＝已排入 W5 並完成報告入口。

---

## 3. 施工序（議決「做滿」後依此排）

| 波次 | 範圍 | 目標 |
|------|------|------|
| **W1** | CRM 三步 **0-01～0-03** | 補到階段 **3**（含報告）· **已完成**（CSV／列印） |
| **W2** | **A-04** 主日策劃 · **D-01** 外展真鏈 · **C-01** 殼內五 Tab | 各到階段 3 · **已完成** |
| **W3** | **B** 小組／出席（B-04、B-06） | 階段 3 · **已完成** |
| **W4** | **F** 財務（F-04；F-05 合併提示） | 階段 3 · **已完成** |
| **W5** | 其餘 DEMO／PARTIAL（工程決定做滿） | **W5a～W5e 已完成報告入口** |

### W5 插隊佇列（2026-07-23 工程專家決定：餘頁一律做滿；合併／下架列只做橫幅或摘要）

| 批次 | 編號 | 理由 | 狀態 |
|------|------|------|------|
| **W5a** | 0-16 · A-16 · A-17 · F-01 | 接主鏈 | **完成**（	est_church_w5a_reports.py） |
| **W5b** | A-03／A-05～A-07／A-09～A-15／A-18～A-19 | 敬拜進階 | **完成** 報告入口 |
| **W5c** | B-03／B-05／B-07／B-09／B-10／B-12 · E-03 · D-02～D-04／D-06～D-12 | 牧養／會眾／外展 | **完成** 報告入口 |
| **W5d** | F-06～F-16／F-18～F-21／F-25～F-26／F-29（含 F-10～13 合併橫幅） | 行政營運 | **完成** 報告入口 |
| **W5e** | 文件／CRM 尾頁（F-17／22～24／27／28／30 · 0-08～0-11 hub／trial） | 摘要 CSV | **完成** 輕量入口 |
| — | 已標合併／跨模（0-04～06、A-01／08、B-01／08／11、C-02～05、D-05、E-01～02、F-02～03／05…） | 不雙真相 | 合併提示或他模驗收 |

**授權**：使用者授權由工程專家決定並自動檢查；另議僅在發現雙真相或神學／隱私爭議時。  
**W1～W5e 工程狀態**：報告入口已上線（含 	est_church_w5bcd_reports.py）。

---

## 4. PC 預覽網址格式

- 單頁：`http://127.0.0.1:8080/` + 下表「路徑」  
- 例：http://127.0.0.1:8080/church_ministry/modules/members/member-integrated.html

---

## 0 · CRM 旅程

| 編號 | 名稱 / EN | 功能簡介 | 現況 | 現達→目標 | 工程建議 | 議決 | 驗收條件（做滿） | 路徑 |
|------|-----------|----------|------|-----------|----------|------|------------------|------|
| 0-00 | 導覽說明 / Nav guide | 怎麼走路 | 說明 | 3→3 | 合併→幫助中心即可 | | 連結有效 | `help/site-navigation-guide.html` |
| 0-01 | 會友主檔 / Member master | 名冊主鍵 | LIVE | **3→3** | **做滿**（W1） | **做滿** | CRUD＋餵儀表板＋名冊 CSV／列印 | `church_ministry/modules/members/member-integrated.html` |
| 0-02 | 探訪工作桌 / Visitation | 探訪待辦 | LIVE | **3→3** | **做滿**（W1） | **做滿** | 建單＋本週清單 CSV／列印＋接 D handoff | `church_ministry/modules/support/visitation_index.html` |
| 0-03 | 義工排班 / Volunteer shifts | 排班主路徑 | LIVE | **3→3** | **做滿**（W1） | **做滿** | 排班存檔＋班表 CSV／列印（list）＋契約欄 | `church_ministry/tools/volunteer_shift/index.html` |
| 0-04 | 教會規劃 OS / Planning OS | 長執決策 | PARTIAL | 1→3 | 合併→planning 模組驗收 | | 規劃可讀可報（跨模） | `church_planning/index_plan.html` |
| 0-05 | 健康診斷中心 / Assessment | 問卷入口 | PARTIAL | 1→3 | 合併→planning | | 問卷結果可存可報 | `church_planning/assessment-os-hub.html` |
| 0-06 | 健康雷達戰情室 / War room | 雷達 | PARTIAL | 1→3 | 合併→planning | | 數字有來源 | `church_planning/cta-os-war-room.html` |
| 0-07 | CRM 理念 / Intro | 理念 | DEMO | — | **合併**→願景「怎麼走」 | **合併** | 見 `vision_and_plan.html#how-to-walk` | Hub 舊 tab 不再主推 |
| 0-08 | 我的事奉旅程 / Journey | 個人旅程 | PARTIAL | — | **合併**→門訓角色捷徑 | **合併** | 見門徒培訓「依角色從哪裡開始」 | Hub 舊 tab 不再主推 |
| 0-09 | 執事牧者 / Elder view | 領導視角 | PARTIAL | — | **合併**→門訓長執捷徑＋戰情 | **合併** | 同上＋dashboard | Hub 舊 tab 不再主推 |
| 0-10 | 事奉媒合 / Matchmaker | 媒合 | DEMO | — | **尚在準備**說明頁 | **下架**營運 | 真配對日後；現 `?id=matchmaker` | `capability-placeholder` |
| 0-11 | 30 分鐘試玩 / Trial | 培訓 | PARTIAL | — | **移除**主路徑 | **下架** | — | 舊檔可留 |
| 0-12 | 角色·會友 / Role member | 捷徑 | 捷徑 | — | **合併**→門訓角色捷徑 | **合併** | — | 門訓頁 |
| 0-13 | 角色·老師 / Role teacher | 捷徑 | 捷徑 | — | **合併**→門訓角色捷徑 | **合併** | — | 門訓頁 |
| 0-14 | 角色·同工 / Role staff | 捷徑 | 捷徑 | — | **合併**→門訓角色捷徑 | **合併** | — | 門訓頁 |
| 0-15 | 角色·長執 / Role leader | 捷徑 | 捷徑 | — | **合併**→門訓長執捷徑 | **合併** | — | 門訓頁 |
| 0-16 | 志工體系／崗位 / Volunteer system | 崗位（非排班主路徑） | PARTIAL | **3→3** | **做滿**（W5a） | **做滿** | 崗位／配對／排班 CSV＋列印 | `church_ministry/modules/volunteer/volunteer-integrated.html` |

區入口捷徑（A–F 主桌）＝導航，**不另編號施工**；內容頁見各區。

---

## A · 敬拜

| 編號 | 名稱 / EN | 簡介 | 現況 | 現達→目標 | 工程建議 | 議決 | 驗收（做滿） | 路徑 |
|------|-----------|------|------|-----------|----------|------|--------------|------|
| A-01 | 公園导览 / Worship landing | 入門 | PARTIAL | 0→2 | 合併→主日一桌 | **合併**→`worship-sunday-desk` | 導到主桌不迷路 | `church_ministry/_landing/worship.html` |
| A-02 | 会众筑坛 / Cong. altar | 只讀 | PARTIAL | 1→2 | 折叠 DEMO | **下架**營運／折叠 DEMO | 與主桌同步只讀即可 | `…/worship/worship-together.html` |
| A-03 | 同工·今日祭坛 / Staff altar | 當日服事 | PARTIAL | 1→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 任務可勾僅進階 | `…/worship-integrated.html?view=volunteer` |
| A-04 | 部长·主日策划 / Leader plan | 主日主桌 | LIVE | **3→3** | **做滿**（W2） | **做滿** | 策劃存＋CSV／列印簡報＋接出席／探訪 | `…/worship-integrated.html?view=leader#plan` |
| A-05 | 講壇事奉 / Pulpit | 講壇 | PARTIAL | 1→3 | 永不升格 DEMO | **下架**營運／折叠 DEMO | 不進 SITE-6 升格 | `…/pulpit-ministry.html` |
| A-06 | 講道筆記 / Sermon notes | 模板 | PARTIAL | 1→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 可存僅進階 | `…/sermon-notes-admin.html` |
| A-07 | 招待事奉 / Hospitality | 招待 | PARTIAL | 1→3 | 永不升格 DEMO | **下架**營運／折叠 DEMO | 排班主路走 0-03 | `…/hospitality.html` |
| A-08 | 敬拜完整系統 / Integrated | 同 A-04 殼 | PARTIAL | — | **合併**→A-04 | **合併** | 同一真相 | `…/worship-integrated.html` |
| A-09 | 敬拜團隊 / Team | 名冊 | PARTIAL | 1→3 | 永不升格 DEMO | **下架**營運／折叠 DEMO | 不進 SITE-6 升格 | `…/worship-team-management.html` |
| A-10 | 詩班 / Choir | 詩班 | PARTIAL | 1→3 | 永不升格 DEMO | **下架**營運／折叠 DEMO | 同上 | `…/choir-team.html` |
| A-11 | 器樂 / Instruments | 器樂 | PARTIAL | 1→3 | 永不升格 DEMO | **下架**營運／折叠 DEMO | 同上 | `…/instrument-team.html` |
| A-12 | 會眾詩歌 / Songs | 選歌 | PARTIAL | 1→3 | 永不升格 DEMO | **下架**營運／折叠 DEMO | 同上 | `…/congregational-songs.html` |
| A-13 | 樂譜 / Sheet music | 樂譜 | PARTIAL | 1→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 索引僅進階 | `…/sheet-music.html` |
| A-14 | 詩歌庫 / Song library | 全庫 | PARTIAL | 1→3 | 合併→詩歌模組 | **合併**→`hymn_management` | 可搜走 HY | `…/song-library.html` |
| A-15 | 崇拜禮儀 / Liturgy | 禮儀 | PARTIAL | 1→3 | 永不升格 DEMO | **下架**營運／折叠 DEMO | 不進 SITE-6 升格 | `…/worship-management.html` |
| A-16 | 崇拜統計 / Reports | 報表 | PARTIAL | **3→3** | **做滿**（W5a） | **做滿** | 區間 CSV＋列印（先生成報表） | `…/worship-reports.html` |
| A-17 | 崇拜出席 / Attendance | 出席 | PARTIAL | **3→3** | **做滿**（W5a） | **做滿** | 點名存＋CSV／列印＋缺席→探訪 | `…/attendance-management.html` |
| A-18 | 音響團隊 / Audio | 音響 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 檢查表僅 DEMO | `…/media/audio-team.html` |
| A-19 | 視頻直播 / Live | 直播 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 場次僅 DEMO | `…/media/live-streaming.html` |

---

## B · 牧養

| 編號 | 名稱 / EN | 簡介 | 現況 | 現達→目標 | 工程建議 | 議決 | 驗收（做滿） | 路徑 |
|------|-----------|------|------|-----------|----------|------|--------------|------|
| B-01 | 探訪工作桌 / Visitation | 同 0-02 | LIVE | — | **合併**→0-02 | **合併** | — | 同 0-02 |
| B-02 | 牧羊导览 / Landing | 認路 | PARTIAL | 0→2 | 合併→B 真工具導覽 | **合併**→B-04／0-02 | 導到探訪／小組 | `church_ministry/_landing/fellowship.html` |
| B-03 | 团契总览 / Index | 總覽 | PARTIAL | 1→3 | 合併→B-04 | **合併**→B-04 | 列表真資料 | `…/fellowship/index.html` |
| B-04 | 小组工作桌 / Small groups | 小組 | PARTIAL | **3→3** | **做滿**（W3） | **做滿** | 小組／組員／聚會 CSV＋列印名冊 | `…/small-groups-integrated.html` |
| B-05 | 组织与名册 / Org roster | 組織 | PARTIAL | 1→3 | 合併→0-01／B-04 | **合併**→0-01／B-04 | ↔ memberId | `…/pastoral-org-roster.html` |
| B-06 | 聚会出席 / Attendance | 出席 | PARTIAL | **3→3** | **做滿**（W3） | **做滿** | 週報存＋出席／缺席 CSV＋列印名單＋串探訪 | `…/pastoral-attendance.html` |
| B-07 | 活动通告 / Events | 活動 | PARTIAL | 1→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 發佈僅 DEMO | `…/pastoral-events.html` |
| B-08 | 门徒训练 / Training | 門訓 B | PARTIAL | 1→3 | 合併→C-04／C-01d | **合併**→C | 單一真相 | `…/pastoral-training.html` |
| B-09 | 牧养战略桌 / Strategy | 戰略 | PARTIAL | 1→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 目標僅 DEMO | `…/pastoral-strategy.html` |
| B-10 | 团契的圈 / Circles | 圈子 | PARTIAL | 1→2 | 折叠 DEMO | **下架**營運／折叠 DEMO | 關係僅 DEMO | `…/fellowship-circles.html` |
| B-11 | 会友主档 / Members | 同 0-01 | LIVE | — | **合併**→0-01 | **合併** | — | 同 0-01 |
| B-12 | 青年团契 / Youth | 青年 | PARTIAL | 1→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 活動僅 DEMO | `…/development/youth-ministry-dev.html` |

---

## C · 教育

| 編號 | 名稱 / EN | 簡介 | 現況 | 現達→目標 | 工程建議 | 議決 | 驗收（做滿） | 路徑 |
|------|-----------|------|------|-----------|----------|------|--------------|------|
| C-01 | 主日學工作桌 / SS shell | 5 Tab 殼 | 殼 LIVE | **3→3** | **做滿**（W2） | **做滿** | 五 Tab＋名冊／出席／缺席預警 CSV＋列印 | `…/education/education-integrated.html` |
| C-01a | Tab 導覽 / guide | 說明 | 殼內 | →3 | 合併入 C-01 | | 連真 Tab | `#tab-guide` |
| C-01b | Tab 名冊 / roster | 班級名冊 | 殼內 | →3 | **做滿**（W2） | | ↔ member | `#tab-roster` |
| C-01c | Tab 出席 / attendance | 點名 | 殼內 | →3 | **做滿**（W2） | | 存＋週報 | `#tab-attendance` |
| C-01d | Tab 門訓 / discipleship | 進度 | 殼內 | →3 | **做滿**（W2） | | 進度記錄 | `#tab-discipleship` |
| C-01e | Tab 教學 / teaching | 備課 | 殼內 | →3 | **做滿**（W2） | | 教材／備課有存 | `#tab-teaching` |
| C-02 | 聖經研讀 / Bible study | 跨模組 | 他模 | — | 合併→bible_study 驗收 | | 非本模 KPI | `bible_study/dashboard.html?lang=CN` |
| C-03 | 學校管理 / School | 跨模組 | 他模 | — | 合併→school 驗收 | | — | `school_management/dashboard.html` |
| C-04 | 門訓動力站 / Disciple station | 門訓頁 | PARTIAL | 1→3 | 合併→C-01d 或做滿單一 | | 不雙真相 | `…/discipleship-training.html` |
| C-05 | AI 工具 / AI tools | 跨模組 | 他模 | — | 合併→ai_tools | | — | `ai_tools/dashboard.html` |

---

## D · 外展

| 編號 | 名稱 / EN | 簡介 | 現況 | 現達→目標 | 工程建議 | 議決 | 驗收（做滿） | 路徑 |
|------|-----------|------|------|-----------|----------|------|--------------|------|
| D-01 | 外展需求真鏈 / Outreach chain | 登記→探訪 | LIVE | **3→3** | **做滿**（W2） | **做滿** | 存＋handoff＋結案＋需求 CSV／列印 | `…/expansion/outreach-strategy.html` |
| D-02 | 社區需求調研 / Assess | 調研 | DEMO | 0→3 | 合併→D-01 | **合併**→D-01 | 表存＋接 D-01 | `…/community-assessment.html` |
| D-03 | 宣教機會 / Mission opp. | 機會 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 庫僅 DEMO | `…/mission-opportunities.html` |
| D-04 | 新事工規劃 / New ministry | 規劃 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 計劃僅 DEMO | `…/new-ministry-planning.html` |
| D-05 | 外展策略（子） | 同 D-01 | 重複 | — | **合併**→D-01 | **合併** | — | 同 D-01 |
| D-06 | 植堂計劃 / Planting | 植堂 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 里程碑僅 DEMO | `…/church-planting.html` |
| D-07 | 分堂管理 / Branch | 分堂 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 串會友僅 DEMO | `…/branch-management.html` |
| D-08 | 宣教拓展 / Expand | 拓展 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 專案僅 DEMO | `…/mission-expansion.html` |
| D-09 | 跨文化 / Cross-cultural | 跨文化 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 同上 | `…/cross-cultural.html` |
| D-10 | 新媒體 / New media | 新媒體 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 內容僅 DEMO | `…/innovation/new-media.html` |
| D-11 | 創新項目 / Innovation | 創新 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 看板僅 DEMO | `…/innovation-projects.html` |
| D-12 | 科技應用 / Tech | 科技 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 清單僅 DEMO | `…/technology-integration.html` |

---

## E · 社會服務

| 編號 | 名稱 / EN | 簡介 | 現況 | 現達→目標 | 工程建議 | 議決 | 驗收（做滿） | 路徑 |
|------|-----------|------|------|-----------|----------|------|--------------|------|
| E-01 | 義工排班 / Shifts | 同 0-03 | LIVE | — | **合併**→0-03 | **合併** | — | 同 0-03 |
| E-02 | 志工體系 / System | 同 0-16 | PARTIAL | — | **合併**→0-16（進階；非日常主路徑） | **合併** | 側欄標進階 | 同 0-16 |
| E-03 | 會眾／社區學苑 / Portal | 會眾入口 | PARTIAL | 1→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 可編僅 DEMO | `church_ministry/congregation/index.html` |

---

## F · 行政支援

| 編號 | 名稱 / EN | 簡介 | 現況 | 現達→目標 | 工程建議 | 議決 | 驗收（做滿） | 路徑 |
|------|-----------|------|------|-----------|----------|------|--------------|------|
| F-01 | 戰情儀表板 / Dashboard | KPI | LIVE | **3→3** | **做滿**（W5a） | **做滿** | 契約欄可解釋＋就緒度 CSV | `church_ministry/dashboard.html` |
| F-02 | 人員總覽 / People list | 索引 | PARTIAL | — | **合併**→0-01 | **合併** | 側欄改連 0-01；不雙名冊 | `…/people/people_list.html` |
| F-03 | 會友事工 / Members | 同 0-01 | LIVE | — | **合併**→0-01 | **合併** | — | 同 0-01 |
| F-04 | 財務事工 / Finance desk | 財務台 | PARTIAL | **3→3** | **做滿**（W4） | **做滿** | Bridge 存檔＋交易／預算 CSV＋列印摘要 | `…/finance/finance-integrated.html` |
| F-05 | 財務管理 / Fin. admin | 舊頁 | PARTIAL | — | **合併**→F-04 | **合併** | 側欄改連 F-04；勿雙帳 | `…/administration/financial-management.html` |
| F-06 | 設備 / Equipment | 設備 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 台帳僅 DEMO | `…/equipment/equipment-management.html` |
| F-07 | 圖書 / Library | 圖書 | DEMO | 0→3 | 折叠 DEMO | **下架**營運／折叠 DEMO | 借還僅 DEMO | `…/library/library-management.html` |
| F-08 | 社群捐款人 / Donors | 捐款人 | DEMO | — | **合併**→F-04（交費／捐款走財務） | **合併** | 側欄改連 F-04；舊頁待刪 | `church_ministry/community-overview.html` |
| F-09 | 研究索引 / Research index | KPI 索引 | DEMO | 0→2 | 進階 DEMO；營運看 F-01 | **合併**→F-01（營運） | 側欄主連戰情 | `…/research/index.html` |
| F-10 | 會眾統計 / Stats | 統計 | DEMO | — | 合併→F-01 | **合併** | 側欄不下掛獨立島 | `…/member-statistics.html` |
| F-11 | 事工成效 / Perf. | 成效 | DEMO | — | 合併→F-01 | **合併** | 同上 | `…/ministry-performance.html` |
| F-12 | 增長趨勢 / Growth | 趨勢 | DEMO | — | 合併→F-01 | **合併** | 同上 | `…/growth-trends.html` |
| F-13 | 參與度 / Engagement | 參與 | DEMO | — | 合併→F-01 | **合併** | 同上 | `…/engagement-analysis.html` |
| F-14 | 影片製作 / Video | 製作 | DEMO | 0→3 | 做滿或下架 | | 專案紀錄 | `…/media/video-production.html` |
| F-15 | AI 助手 / AI | AI | DEMO | 0→2 | 做滿或下架 | | 草稿紀錄＋標示 | `…/tech/ai-assistant.html` |
| F-16 | 數位事工 / Digital | 推薦 | DEMO | 0→3 | 做滿或下架 | | 操作紀錄 | `…/tech/smart-recommendation.html` |
| F-17 | 數位化轉型 / Transform | 說明 | DEMO | — | **下架**工具／改文件 | **下架** | 側欄改幫助文檔 | `…/digital-transformation.html` |
| F-18 | 智能提醒 / Reminders | 提醒 | DEMO | 0→3 | 做滿或下架 | | 觸發紀錄 | `…/smart-reminders.html` |
| F-19 | Workflow / Workflow | 流程 | DEMO | 0→3 | 做滿（接探訪）或下架 | | 案件狀態 | `…/workflow.html` |
| F-20 | 主題設定 / Theme | 主題 | PARTIAL | 1→2 | 做滿或下架 | | 設定可存 | `church_ministry/theme-settings.html` |
| F-21 | 自訂頁編輯 / Custom page | 編輯器 | PARTIAL | 1→3 | 做滿（接 E-03） | | 發佈＋版本 | `church_ministry/custom-page-editor.html` |
| F-22 | 新技術應用 / Tech apps | 示意 | DEMO | — | **下架** | **下架** | 側欄已移除 | `…/technology-apps.html` |
| F-23 | 智能工具開發 / Smart tools | 示意 | DEMO | — | **下架** | **下架** | 側欄已移除 | `…/smart-tools-dev.html` |
| F-24 | 最佳實踐 / Best practices | 示意 | DEMO | — | **下架**或改文件庫 | **下架** | 側欄已移除 | `…/best-practices.html` |
| F-25 | 技術支援 / Support | 支援 | DEMO | 0→3 | 做滿或下架 | | 工單 | `…/technical-support.html` |
| F-26 | 幫助文檔 / Help | 幫助 | PARTIAL | 2→3 | **做滿**（隨頁更新） | | 與現況同步 | `…/help-documentation.html` |
| F-27 | 願景藍圖 / Vision | 文件 | PARTIAL | 1→2 | 做滿（文件向） | | 版本＋負責人 | `church_ministry/vision_and_plan.html` |
| F-28 | 路線圖 / Roadmap | 文件 | PARTIAL | 1→2 | 合併→F-27 或做滿 | | 同上 | `church_ministry/roadmap-overview.html` |
| F-29 | 事工總覽 / Core | 總覽 | PARTIAL | 1→2 | 合併→F-01／CRM | | 連真入口 | `church_ministry/ministry_core.html` |
| F-30 | AI 合規 / Compliance | 規劃 | DEMO | 0→2 | 做滿（政策文件）或下架 | | 審核紀錄 | `church_ministry/ai-and-compliance.html` |

---



## SITE-6 F4 · 側欄 🟡 議決收口（2026-08-06）

工程專家決定（對齊 `SITE_PHASE_5PLUS_MODULE_WAVES_V1.md` D3：A 區 7× DEMO 永不升格）：

| 範圍 | 議決 | 說明 |
|------|------|------|
| A-05／07／09～12／15（7 DEMO）＋A-02／03／06／13／18／19 | **下架營運／折叠 DEMO** | 側欄進階可留；不進 SITE-6 升格預算 |
| A-01 | **合併**→主日一桌 | Landing 主 CTA = `worship-sunday-desk.html` |
| A-08／A-14 | **合併** | →A-04／`hymn_management` |
| B-03／05／08；B-02 | **合併** | →B-04／0-01／C／導覽 |
| B-07／09／10／12 | **下架營運／折叠 DEMO** | 衛星島 |
| D-02 | **合併**→D-01 | 單頁真鏈併入外展 3 Tab |
| D-03～D-12 | **下架營運／折叠 DEMO** | 外展島不升格 |
| E-03；F-06／07 | **下架營運／折叠 DEMO** | 資產／會眾 DEMO |
| A-04／16／17；B-04／06；D-01 | **做滿**（已） | 主桌保留 |

側欄 SSOT（`js/cm_*_menu_ssot.js`）後續波次可把折叠項移入 `<details>進階`；本波先釘議決欄。

## 5. 會議紀錄欄（同桌 1 小時）

| 項目 | 填寫 |
|------|------|
| 日期 | **2026-08-06**（SITE-6 F4 議決收口） |
| 出席（人事／工程） | |
| 議決「做滿」頁數 | |
| 議決「合併」頁數 | |
| 議決「下架」頁數 | |
| 下一步開工（預設 W1） | **W1～W5e 報告入口已完成** · **2026-07-24**：CRM／行政合併議決＋側欄清理（見 `DATA_LINK_CRM_ADMIN_V1.md`）；下一：實機抽樣驗收 |
| 簽名／附件 | |

---

## 6. 相關檔案

| 檔案 | 角色 |
|------|------|
| 本檔 | **頁級施工 SSOT** |
| `TRANSFORM_ABC_CHECKLIST_STAGE1.md` | 流程 A/B/C 投票 |
| `ENTRY_PATH_SSOT_M3.md` | 會友／探訪／排班主路徑 |
| `DATA_LINK_CRM_ADMIN_V1.md` | 會友↔教育／學校↔財務↔SMART 串連與合併議決 |
| `M6_W0_AND_D_CHAIN.md` | D 真鏈 |
| `C_EDU_SHELL_M4.md` | C 五 Tab 殼 |

---

**狀態**：W1～W5e 報告入口已上線。  
**2026-07-24**：兩分支（規劃｜行政）＋廢 CRM 主入口。  
**2026-07-24 晚**：內容搬家 C——「怎麼走」→願景／路線圖；角色捷徑→門訓；DEMO 側欄暫藏；媒合／請假維持說明頁。  
**2026-07-24 夜**：導覽收口——各頁「回 CRM」改「回日常」；規劃第 6 步說明改寫；舊 Hub／老師／長執入口轉址；跨部門風險→說明頁。  
**2026-07-24 P0**：側欄／頂欄已去掉「15 主桌」推廣。查驗見 [`QA_TRACKER_0AF_P0.md`](./QA_TRACKER_0AF_P0.md)。
