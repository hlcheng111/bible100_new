# F 台／字母大改 Stitch Report

**日期**：2026-09-19  
**Stitch 名稱**：F 台／字母大改  
**前置依賴**：C7（size-nav density）未同步至此分支，本次獨立進行  

---

## 1. 背景與目標

### 1.1 原始問題
- 教會事工側欄原有「E. 社會服務」混合了志工事工與行政支援
- 字母編碼 A–D 後直接跳到「行政支援」，缺少 E/F/G 明確分區
- 與 `docs/schema/curriculum_departments_AG_v0.1.md` 定義的七系（A–G）不一致
- 頂欄第二列僅顯示 A–D + 行政，缺少社區服務獨立入口

### 1.2 目標
1. 新設 **F 區（社區服務）**：志工、社區學苑、關懷事工
2. 將原「行政支援」正式編為 **G 區**
3. 保持 A–D 不變，確保向後相容
4. 更新頂欄 secondaryNav，新增 F 入口
5. 不刪除任何現有頁面

---

## 2. 實作變更

### 2.1 新增檔案
| 路徑 | 說明 |
|------|------|
| `church_ministry/_landing/community_service.html` | F 區社區服務導覽頁 |
| `docs/reorg/f_zone_letter_overhaul_report.md` | 本報告 |

### 2.2 修改檔案
| 路徑 | 變更摘要 |
|------|----------|
| `church_ministry/sidebar_church_layout_v1.html` | 新增 F 區區塊、E→G 重編號、focus 映射更新 |
| `config/modes.json` | church.secondaryNav 新增 F 入口、E→G |
| `docs/schema/curriculum_departments_AG_v0.1.md` | 更新為 v0.2，對齊七區 |

### 2.3 字母對照表（重整後）

| 字母 | 中文名稱 | Emoji | 主入口 |
|------|----------|-------|--------|
| A | 敬拜花园 | 🌳 | `_landing/worship.html` |
| B | 牧羊小径 | 🌾 | `modules/fellowship/` |
| C | 聖經教育 | 📚 | `modules/education/education-integrated.html` |
| D | 外展差傳 | 🌍 | `modules/expansion/outreach-strategy.html` |
| **F** | 社區服務 | 🤝 | `_landing/community_service.html` ✨ 新設 |
| **G** | 行政支援 | ⚙️ | `dashboard.html` |

> **E 去哪了？** 舊版 E 為「宣教佈道」，現併入 D（外展差傳）。為避免混淆，直接跳過 E，使 F=社區、G=行政。

---

## 3. C7 同步狀態

| 項目 | 狀態 |
|------|------|
| `church_ministry/js/church_size_nav.js` | ❌ 本分支未見 |
| `get / applyDensity / revealAll` API | ❌ 未實作 |
| 主軌 hide dept by church size | ❌ 未實作 |
| Planning advanced tools collapsed | ❌ 未實作 |

**結論**：C7（size-nav density）尚未同步至 `main`，本次 F 台重整**獨立進行**，不依賴 C7。後續若 C7 合併，需在 `church_size_nav.js` 加入 F/G 的 density 設定。

---

## 4. 驗收步驟

### 4.1 側欄驗收
1. 開啟 `file:///path/to/bible100_new/index_v5.html`
2. 點擊「教會事工」進入 church 模式
3. 左側欄應顯示 A–D、F、G 六個區塊（E 跳過）
4. 點擊 `F. 社區服務` 標題，應看到志工與社區關懷子項

### 4.2 頂欄驗收
1. 教會模式第二列「教會事工」區塊應包含：
   - A. 敬拜 / B. 牧養 / C. 門訓 / D. 外展 / **F. 社區** / G. 行政
2. 點擊「F. 社區」應載入 `_landing/community_service.html`

### 4.3 F 區導覽頁
1. `church_ministry/_landing/community_service.html` 應正常顯示
2. 三個角色卡（居民/志工/負責人）連結可點
3. 底部工具索引連結正確

### 4.4 focus 參數
- `sidebar_church_layout_v1.html?focus=f` → F 區高亮
- `sidebar_church_layout_v1.html?focus=g` → G 區高亮
- `?focus=admin` → 仍指向 G 區（向後相容）

---

## 5. 後續建議

### 5.1 短期
- [ ] C7 同步後，在 `church_size_nav.js` 加入 F/G 的 density 設定
- [ ] 若需「獨立 中 size button」，在 C7 後續 stitch 處理

### 5.2 中期
- [ ] F 區志工整合頁（`volunteer-integrated.html`）增加角色入口（member/staff/leader view）
- [ ] 社區學苑課程報名與 `school_management` 對接

### 5.3 不做
- 本次不刪除任何頁面
- 不改動 A–D 區內容
- 不改動 Planning 側欄

---

## 6. 相關文件

- `docs/schema/curriculum_departments_AG_v0.1.md` → v0.2
- `docs/CHURCH_TOOL_PLAYBOOK.md` §1（A–G 七層）
- `.cursor/rules/bible100-ui-naming-ia-lock.mdc`（UI 名詞憲法）

---

*報告完成。F 台／字母大改已就緒，待 PR 審核後合併。*
