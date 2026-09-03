# 👥 會友事工完整系統 · AI 嚴格檢測 Checklist V1

> **對象頁**：`church_ministry/modules/members/member-integrated.html`  
> **標題**：👥 會友事工完整系統  
> **更新**：2026-08-03  
> **用途**：供 Cursor / AI Agent **逐項執行**；不可僅憑靜態 grep 宣告通過。  
> **驗收口徑（成品）**：`file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html` 或  
> `file:///C:/Users/hlche/.cursor/bible100_new/church_planning/sidebar_plan_preview_shell.html` → **Ctrl+F5**

**對齊 SSOT**：`MEMBER_DATA_MODEL.md` · `CROSS_MODULE_DATA_CONTRACT_V1.md` · `PLAN_DO_ACCEPTANCE_CHECKLIST_V1.md` 波 3

---

## 0 · AI 執行規則（必讀）

1. **先跑靜態，再跑瀏覽器**；靜態全綠才可進入互動驗收。
2. 任一 **🔴 阻斷項** 失敗 → 整體判定 **FAIL**，停止標「可用」。
3. 標 **🟡 已知限制** 的項：可 Pass with note，**不得打 5 分**。
4. 驗收須在 **G 行政管理入口**（`crm_from=planning_g_admin`）與 **CM 直開** 各測一次。
5. 改 `config/modes.json` 後須跑 `node scripts/generate_config_embedded.js`（本頁不依 modes，但 G 入口依 embedded）。

---

## 1 · 靜態契約（Agent 可自動跑）

```powershell
# 最小靜態包（倉庫根目錄）
python church_ministry/tests/test_cm_four_pages_bridge.py
python tests/test_plan_do_bridge_wave1.py
```

### 1.1 檔案與依賴

| ID | 檢查 | 通過條件 | 阻斷 |
|----|------|----------|------|
| S-01 | 主檔存在 | `church_ministry/modules/members/member-integrated.html` 存在 | 🔴 |
| S-02 | Bridge 載入 | 頁內含 `church_data_bridge.js` | 🔴 |
| S-03 | 禁止直寫 | `saveData()` 須呼叫 `ChurchDataBridge.saveMemberSystemData`；**不得** `localStorage.setItem('memberSystemData'` 作為唯一寫入 | 🔴 |
| S-04 | 四頁標記 | `<body data-cm-four-page="member">` | 🟡 |
| S-05 | 路線圖 | 載入 `cm_four_pages_roadmap.js` + `#cmFourPagesRoadmapMount` | 🟡 |
| S-06 | Plan 安全繩 | 載入 `crm_context_bar.js` | 🔴（G 入口） |
| S-07 | CRM 常數 | 載入 `church_crm_constants.js`（屬靈階段） | 🟡 |

### 1.2 資料契約（程式碼）

| ID | 檢查 | 通過條件 | 阻斷 |
|----|------|----------|------|
| S-10 | memberId 雙欄 | 新增會友時 `id` 與 `memberId` 同值 | 🔴 |
| S-11 | save 事件 | `saveMemberSystemData` 內含 `notifyCmDomainChanged('members')`（`church_data_bridge.js`） | 🔴 |
| S-12 | 種子頁 Bridge | `load_central_member_seed.html` 經 `CentralMemberDB.set` → Bridge | 🔴 |
| S-13 | 狀態枚舉 | 表單含 `in_communion` / `pending_transfer` / `transferred` / `left` | 🟡 |
| S-14 | 屬靈階段 | 表單含 `spiritual_journey_stage` / `first_visit_date` | 🟡 |

### 1.3 G 側欄入口

| ID | 檢查 | 通過條件 | 阻斷 |
|----|------|----------|------|
| S-20 | G ① 鏈路 | `planning_sidebar_g_menu.js` → `member-integrated.html` + `crm_from=planning_g_admin` | 🔴 |
| S-21 | 只換右欄 | 點 ① 後左欄仍為 `sidebar_plan_v5_preview.html`（非 CRM journey / 非 church layout 整欄替換） | 🔴 |

---

## 2 · 入口與殼（瀏覽器 · 5 分鐘）

**路徑 A（G 行政）**

1. `file://…/church_planning/sidebar_plan_v5_preview.html` Ctrl+F5  
2. 展開 **行政管理** → 點 **① 會友人事**

**路徑 B（CM 直開）**

1. `file://…/church_ministry/modules/members/member-integrated.html`

| ID | 檢查 | 操作 | 通過條件 | 阻斷 |
|----|------|------|----------|------|
| E-01 | 頁面標題 | 目視 | H1＝「👥 會友事工完整系統」 | 🔴 |
| E-02 | Plan 安全繩 | 路徑 A | 頂部出現「🟢 G 行政管理 · Do 實戰」橫幅；可回 landing / 戰情 / 健康雷達 | 🔴 |
| E-03 | URL 參數 | 路徑 A | URL 含 `crm_from=planning_g_admin`（或 shell 等價狀態） | 🔴 |
| E-04 | 四頁路線圖 | 路徑 A/B | 橫幅「會友主檔 · 3 步就會用」可見 | 🟡 |
| E-05 | 六 Tab | 點擊 | 總覽／會友檔案／小組歸屬／事工參與／成長追蹤／資料分析 均可切換無 JS 錯誤 | 🔴 |
| E-06 | 無白屏 | Console | 無 uncaught exception | 🔴 |

---

## 3 · Member ID 脊柱（資料真實性 · 10 分鐘）

| ID | 檢查 | 操作步驟 | 通過條件 | 阻斷 |
|----|------|----------|----------|------|
| M-01 | 空態 | 清 `memberSystemData`（或無資料首次開） | 總覽卡片為 0；會友檔案有空態提示；**不崩潰** | 🔴 |
| M-02 | 種子載入 | 開 `load_central_member_seed.html` →「載入 200+ 筆」→ 回 member-integrated | 總會友數 > 0；Console 有 Bridge 載入日誌 | 🔴 |
| M-03 | 新增會友 | 會友檔案 → 新增：姓名「驗收測試_甲」、電話唯一 → 保存 | Toast 成功；表格出現該列 | 🔴 |
| M-04 | memberId 穩定 | DevTools → Application → `memberSystemData` | 新筆 `id` === `memberId`；`churchMasterDatabase.members` 同步 | 🔴 |
| M-05 | 刷新守恒 | Ctrl+F5 | 人數與「驗收測試_甲」仍在 | 🔴 |
| M-06 | 編輯 | 編輯該會友：狀態改「待轉」、屬靈階段改「serving」→ 保存 | 表格與總覽統計更新 | 🔴 |
| M-07 | 搜尋 | 搜尋「驗收測試」 | 僅命中該筆 | 🟡 |
| M-08 | 刪除 | 刪除該會友 → 確認 | 總數 -1；localStorage 無殘留幽靈 ID | 🔴 |
| M-09 | 跨頁引用 | 記下某 `memberId` → 開 `visitation_index.html` 下拉 | 同名會友可選；選後 save 綁定該 ID | 🔴 |
| M-10 | 360 Timeline | 開 `member-360-timeline.html` 輸入同 ID | Bridge 就緒；無「尚未就緒」紅條（可無事件） | 🟡 |

---

## 4 · 六 Tab 功能深度（流程不斷裂 · 15 分鐘）

### 4.1 📊 總覽

| ID | 檢查 | 通過條件 | 阻斷 |
|----|------|----------|------|
| T-O1 | 統計卡 | 總會友／本月新增／已受浸／活躍／小組數 與 `data.members` 一致（允許出席率算法簡化） | 🔴 |
| T-O2 | 圖表 | 年齡分佈、增長趨勢 Chart 渲染（有資料時非空白 canvas） | 🟡 |
| T-O3 | 出席摘要 | 有 `attendance` 時崇拜／小組區塊有文字 | 🟡 |

### 4.2 👥 會友檔案

| ID | 檢查 | 通過條件 | 阻斷 |
|----|------|----------|------|
| T-M1 | CRUD | 增／改／刪均經 `saveData()` → Bridge | 🔴 |
| T-M2 | 篩選 | 性別／受浸／狀態篩選生效 | 🟡 |
| T-M3 | 排序 | 點表頭排序（姓名等）方向切換 | 🟡 |
| T-M4 | 匯出 JSON | 下載檔含 `members` 陣列 | 🟡 |
| T-M5 | 匯出 CSV | `exportMembersCsv` 可下載；欄位含姓名電話 | 🟡 |
| T-M6 | Bridge 拒寫 | 暫時卸載 Bridge（僅 DevTools 測試）→ save | 顯示「Bridge 不可用，已拒絕直接寫入」 | 🟡 |

### 4.3 🏠 小組歸屬

| ID | 檢查 | 操作 | 通過條件 | 阻斷 |
|----|------|------|----------|------|
| T-G1 | 三欄 UI | 有會友＋小組＋操作區 | 可選會友、可選小組 | 🟡 |
| T-G2 | 歸屬寫入 | 指派 1 人到小組 → 保存 | `groupMemberships` 新增；總覽「小組數」合理 | 🔴 |
| T-G3 | memberId 鍵 | 檢查 JSON | `groupMemberships[].memberId` 對應真實會友 | 🔴 |

### 4.4 🎯 事工參與

| ID | 檢查 | 通過條件 | 阻斷 |
|----|------|----------|------|
| T-I1 | 配對 | 選會友＋崗位 → 匹配度顯示 | 非空 | 🟡 |
| T-I2 | 分配 | 確認分配 → save | `ministryAssignments` 新增 | 🔴 |
| T-I3 | HITL | 批量建議表須**人工勾選**才寫入 | 無 silent auto-assign 全員 | 🔴 |
| T-I4 | 恩賜欄 | 匹配邏輯讀 `members.gifts` | 🟡 示範加權，非 PLAN SHAPE SSOT |

### 4.5 📚 成長追蹤

| ID | 檢查 | 通過條件 | 阻斷 |
|----|------|----------|------|
| T-R1 | 培訓 CRUD | 可新增／刪除培訓記錄 | 🔴 |
| T-R2 | 出席 | 點「记录出席」 | 🟡 **已知**：`recordAttendance()` 仍為「开发中」— 不得标 5 分 |
| T-R3 | Hash 深鏈 | 開 `#tab=growth&memberId=<id>` | 切到成長 Tab 並選中該會友 | 🟡 |

### 4.6 📊 資料分析

| ID | 檢查 | 通過條件 | 阻斷 |
|----|------|----------|------|
| T-A1 | 構成圖 | 男女 doughnut 與 members 一致 | 🟡 |
| T-A2 | 參與度 | bar 圖渲染 | 🟡 |
| T-A3 | 奉獻趨勢 | 🟡 **已知**：硬編碼示範數列 `[15000,18000…]` — **非真實 finance 資料** | 不得标「财务对齐」 |
| T-A4 | 流失預警 | 依 `attendance` 計算；無資料時顯示「暫無」 | 🟡 |

---

## 5 · Dashboard 與跨模組（回饋鏈 · 8 分鐘）

| ID | 檢查 | 操作 | 通過條件 | 阻斷 |
|----|------|------|----------|------|
| D-01 | 事件觸發 | 會友 save 後開 `dashboard.html`（同 origin） | SPAC **P** 維會友數與主檔一致（或 ≤3s 內刷新） | 🔴 |
| D-02 | b100 事件 | Console 監聽 `b100-cm-data-changed` | save 後 payload.domain 含 `members` | 🔴 |
| D-03 | 深鏈 | dashboard 點 P pill | 深鏈到 member 相關頁且非 404 | 🟡 |
| D-04 | 新人 SLA | 新增會友設 `first_visit_date` 為近 7 日 | dashboard CRM workbench「未跟進新人」可見（有規則時） | 🟡 |
| D-05 | 重複 ID | dashboard「資料健康」彈窗 | duplicate member_id 列表為空或已解釋 | 🟡 |

---

## 6 · 隱私與 HITL（牧養有溫度 · 5 分鐘）

| ID | 檢查 | 通過條件 | 阻斷 |
|----|------|----------|------|
| P-01 | 本機存儲 | `file://` 下資料在 localStorage；Network 無會友 JSON 外送（未啟用 cloud API） | 🔴 |
| P-02 | 文案 | 頁面說明含「本機示範／正式環境由後端決定權限」 | 🟡 |
| P-03 | 禁用企業口號 | 無「績效淘汰」「CEO」「考核排名」類用語 | 🔴 |
| P-04 | 事工匹配 | 批量匹配文案含人工確認意味；無「已自動派任全教會」 | 🔴 |
| P-05 | 匯出警示 | CSV/JSON 匯出為**本機檔案**；無自動 email / 雲端上傳 | 🟡 |

---

## 7 · 負向與恢復（嚴格 · 5 分鐘）

| ID | 檢查 | 操作 | 通過條件 | 阻斷 |
|----|------|------|----------|------|
| N-01 | 毀損 JSON | 將 `memberSystemData` 設為 `{` 非法 JSON → 刷新 | 頁面不白屏；有空態或錯誤提示 | 🔴 |
| N-02 | 缺 Bridge | 若 Bridge throw | `saveData` 拒絕並 toast 錯誤 | 🔴 |
| N-03 | 重複電話 | 新增第二人同電話（若無校驗） | 🟡 記錄行為；重複應在 health 報告可見 | 🟡 |
| N-04 | 清資料 | 清空 members 陣列 → save | dashboard 會友數歸 0 | 🟡 |

---

## 8 · 評分與 AI 回報模板

### 8.1 等級

| 分數 | 定義 |
|------|------|
| **5** | 該項完全符合；無 🟡 限制 |
| **3** | 功能通但有效能／文案／示範資料問題 |
| **1** | 資料丟失、Bridge  bypass、404、白屏 |

### 8.2 整體判定

- **PASS**：所有 🔴 阻斷項 ≥ 4 分等效（全通過）  
- **PASS with notes**：🔴 全過；🟡 項在報告中列明  
- **FAIL**：任一 🔴 失敗

### 8.3 Agent 必須輸出的摘要格式

```markdown
## 會友事工完整系統 · 驗收報告
- 入口：G 行政 / CM 直開
- 環境：file:// + Ctrl+F5
- 靜態：test_cm_four_pages_bridge.py → OK/FAIL
- 阻斷項：M-__ / E-__ / … → 通過數 / 總數
- 🟡 已知限制：T-R2 出席、T-A3 奉獻示範圖 …
- 總判：PASS | PASS with notes | FAIL
- 建議修復：（若有 FAIL，列檔案路徑）
```

---

## 9 · 15 分鐘最小劇本（人工／AI 共用）

1. G 側欄 → ① 會友（確認安全繩）  
2. 種子頁載入 200+ → 回 member-integrated  
3. 新增 1 人 → 查 localStorage `memberId`  
4. 小組歸屬 1 筆 + 事工分配 1 筆  
5. 開 dashboard → 確認會友數  
6. 開 visitation 下拉 → 同 ID 建任務  
7. Ctrl+F5 → 資料仍在  
8. 刪除測試會友 → dashboard 數字回落  

---

## 10 · 自動化擴展（可選 · 工程）

```powershell
python church_ministry/tests/test_member_integrated_contract.py
python church_ministry/tests/test_cm_four_pages_bridge.py
```

---

## 附錄 A · 關鍵路徑速查

| 項目 | 路徑 |
|------|------|
| 主頁 | `church_ministry/modules/members/member-integrated.html` |
| 種子 | `church_ministry/load_central_member_seed.html` |
| Bridge | `js/church_data_bridge.js` → `saveMemberSystemData` |
| 中央 API | `js/central_member_db.js` |
| 360 | `church_ministry/modules/members/member-360-timeline.html` |
| G 入口 | `church_planning/js/planning_sidebar_g_menu.js` |
| 資料模型 | `church_ministry/docs/MEMBER_DATA_MODEL.md` |

## 附錄 B · 已知限制清單（不可标 5 分）

1. **成長追蹤 · 记录出席** — stub「开发中」  
2. **資料分析 · 奉献趋势** — 硬编码示范数据  
3. **RBAC** — 页面自述本机示范，非真实权限  
4. **事工匹配** — 示范加权，非 PLAN SHAPE/KSA 正式对齐  
5. **help 内链** — 部分文案仍链 `visitation.html`；正式 Do 线为 `visitation_index.html`

---

*本清单专用于 AI Agent；与 `PLAN_DO_ACCEPTANCE_CHECKLIST_V1.md` 波 3 互补，不重复维护双真相。*
