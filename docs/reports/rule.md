# 開發改進規則 (Development Improvement Rules)

---

## 🌟 核心設計理念（Bible100 Core Design Philosophy）

### ⭐ visitation.html 完美標準

**所有系統必須達到此標準！**

#### **1. 父子數據庫互聯設計** 🗄️

**核心原則**: 一個父資料庫，多個子資料庫通過關鍵欄位互聯互動

```javascript
// ✅ 正確的數據庫設計
const systemData = {
    // 父表：主實體
    parents: [{
        id: 1,
        name: '張三',
        // ... 基本信息
    }],
    
    // 子表1：通過 parentId 關聯
    children1: [{
        id: 1,
        parentId: 1,  // 👈 關鍵欄位互聯！
        // ... 詳細信息
    }],
    
    // 子表2：通過 parentId 關聯
    children2: [{
        id: 1,
        parentId: 1,  // 👈 關鍵欄位互聯！
        // ... 詳細信息
    }]
};

// ❌ 錯誤的平面設計（避免）
const badData = {
    items: [{
        id: 1,
        // 所有數據混在一起，無法關聯
    }]
};
```

#### **2. 六大必達標準** ✅

每個系統必須100%達到：

| # | 標準 | 要求 | 驗證方式 |
|---|-----|------|---------|
| 1 | 真實功能 | 每個按鈕都有完整JavaScript實現 | 點擊所有按鈕測試 |
| 2 | 完整CRUD | 增刪改查+導入導出 | 測試所有操作 |
| 3 | 自動載入 | 首次使用自動提示示例數據 | 清空localStorage測試 |
| 4 | LocalStorage持久化 | 數據永久保存 | 刷新頁面驗證數據 |
| 5 | Chart.js可視化 | 至少2個圖表（柱狀圖/折線圖/餅圖） | 檢查圖表渲染 |
| 6 | 6個功能模組 | 標籤頁結構，清晰分組 | 檢查標籤頁數量 |

#### **3. 完整業務閉環** 🔄

```
規劃階段 → 執行階段 → 分析階段 → 培訓階段
   ↓          ↓          ↓          ↓
目標設定    任務執行    數據報表    人才成長
```

**示例（探訪事工）**:
- 📋 戰略規劃：設定年度目標、三種探訪計劃
- 📅 排程安排：區域劃分、小組分配、智能排程
- 🚀 出動執行：記錄探訪、手機汇報
- 📊 數據報表：統計分析、趨勢圖表
- 👥 人才培訓：同工培訓、資質管理

#### **4. 技術規範** 💻

**必備函數：**
```javascript
// 數據管理
- loadData()           // 從 localStorage 加載
- saveData()           // 保存到 localStorage
- loadDemo()           // 首次使用加載示例
- renderAll()          // 渲染所有標籤頁
- switchTab(tabName)   // 標籤頁切換
- updateStats()        // 更新統計卡片

// 智能功能
- autoSchedule()       // 智能排程/排班
- autoMatch()          // 智能匹配/推薦
- generateReport()     // 自動生成報表
- exportData()         // 導出 JSON/Excel

// 圖表可視化
- renderCharts()       // 渲染所有圖表
- charts = {}          // 存儲圖表實例
```

**UI規範：**
```css
/* 字體大小 */
body { font-size: 12px; }
h1 { font-size: 20px; font-weight: 600; }
.stat-num { font-size: 28px; font-weight: bold; }
table th, table td { font-size: 11px; }

/* 標籤頁結構 */
.tabs { display: flex; gap: 5px; }
.tab { padding: 8px 16px; font-size: 11px; }
.tab.active { background: white; }

/* 統計卡片 */
.stats-grid { grid-template-columns: repeat(5-6, 1fr); }
.stat-card { border-left: 4px solid; }

/* 模態框 */
.modal { position: fixed; z-index: 1000; }
.modal-content { max-width: 600px; }
```

#### **5. 會友系統為核心** 👥

**重要**: 會友事工是全站最關鍵的資料！

```
會友資料（父）
    ├─→ 小組歸屬（子）
    ├─→ 事工參與（子）
    ├─→ 培訓記錄（子）
    ├─→ 主日出席（子）
    ├─→ 奉獻記錄（子）
    └─→ 成長追蹤（子）
```

**概念**: 一個會友 → 可參與多個小組、事奉多個崗位、參加多次培訓

**其他系統都從會友系統獲取數據：**
- 🎵 敬拜事工：從會友系統獲取團隊成員
- 🏠 小組事工：從會友系統獲取小組成員
- 👔 志工事工：從會友系統獲取志工信息
- 🎓 教育事工：從會友系統獲取教師/家長信息
- 💰 財務事工：從會友系統獲取奉獻記錄

#### **6. 文件規範** 📄

```
每個核心系統：
- 一個HTML文件（~800行）
- 6個標籤頁
- 完整的業務閉環
- 父子數據庫設計
- Chart.js圖表
- 智能功能

命名規範：
- {module}-integrated.html
- 例如：member-integrated.html, worship-integrated.html
```

#### **7. 質量檢查清單** ✅

創建每個系統後必須通過：

```
[ ] 6個標籤頁完整
[ ] 父子數據庫正確關聯
[ ] LocalStorage 保存/加載
[ ] 首次使用自動示例
[ ] 至少2個 Chart.js 圖表
[ ] 智能功能（排程/匹配）
[ ] 搜索過濾功能
[ ] 導入/導出數據
[ ] 模態框表單
[ ] 響應式設計
[ ] 與會友系統數據互聯
[ ] 文件大小 ~800行
```

---

## 總結經驗教訓

### 此次項目分析
- **項目**：多媒體展示畫廊系統 (NT100_id-Gallery.html)
- **目標**：實現三層分類系統、8格響應式網格、補足上千文件顯示
- **結果**：代碼結構完整但實際功能未完全實現

---

## 1. 技術實施規則 (Technical Implementation Rules)

### 1.1 漸進式開發原則
- ✅ **一次一個功能**：完成一個功能並驗證正常後再繼續下一個
- ✅ **立即測試**：每次代碼修改後立即在瀏覽器中測試
- ✅ **實時調試**：使用 console.log 和 browser devtools 驗證功能
- ❌ **避免批量修改**：不要一次性添加大量功能再測試

### 1.2 DOM 操作驗證
- ✅ **元素存在檢查**：確保 getElementById 返回有效元素
- ✅ **事件綁定驗證**：確認 onclick 事件正確綁定
- ✅ **內容加載檢查**：驗證數據是否正確渲染到界面
- ✅ **錯誤處理**：添加 try-catch 和空值檢查

### 1.3 數據與界面同步
- ✅ **數據庫完整性**：確保 mediaDatabase 結構正確
- ✅ **界面同步**：確保 HTML 中的 ID 與 JavaScript 中的選擇器匹配
- ✅ **動態內容**：驗證動態生成的 DOM 元素正確插入
- ✅ **狀態管理**：確保界面狀態與數據狀態一致

---

## 2. 溝通協作規則 (Communication Rules)

### 2.1 用戶反饋循環
- ✅ **階段性確認**：每完成一個主要功能立即請用戶測試
- ✅ **具體測試步驟**：提供明確的測試指引
- ✅ **問題即時解決**：發現問題立即修復，不要累積
- ✅ **效果截圖**：要求用戶提供實際效果截圖或描述

### 2.2 需求理解
- ✅ **需求拆分**：將複雜需求拆分為可驗證的小目標
- ✅ **優先級確認**：確認哪些功能是最重要的
- ✅ **期望管理**：明確告知實現難度和時間預期
- ✅ **中間驗證**：不要等到最後才展示結果

### 2.3 問題報告處理
- ✅ **問題復現**：嘗試復現用戶報告的問題
- ✅ **根因分析**：找出問題的根本原因，不只是表面修復
- ✅ **系統性解決**：解決一類問題而不是單個問題
- ✅ **預防措施**：添加檢查機制防止類似問題

---

## 3. 開發流程規則 (Development Process Rules)

### 3.1 開發順序
1. **基礎架構**：先確保基本的 HTML 結構正確
2. **核心功能**：實現並驗證核心的數據顯示功能
3. **交互功能**：添加用戶交互（點擊、展開等）
4. **美化優化**：最後進行樣式和動畫優化
5. **測試完善**：添加錯誤處理和邊界情況

### 3.2 質量控制
- ✅ **代碼檢查**：使用工具檢查語法錯誤
- ✅ **功能測試**：在多個瀏覽器中測試
- ✅ **性能監控**：檢查頁面加載速度和響應性
- ✅ **用戶體驗**：從用戶角度測試所有功能

### 3.3 文檔和維護
- ✅ **代碼註釋**：關鍵函數添加清晰註釋
- ✅ **變更記錄**：記錄重要修改和原因
- ✅ **已知問題**：記錄未解決的問題和臨時解決方案
- ✅ **改進建議**：記錄future可以改進的地方

---

## 4. 特定問題解決規則 (Specific Problem-Solving Rules)

### 4.1 數據顯示問題
- ✅ **檢查數據源**：確認數據是否正確加載到 JavaScript 變量
- ✅ **檢查選擇器**：確認 DOM 選擇器是否正確匹配元素
- ✅ **檢查渲染**：確認數據是否正確渲染到 HTML
- ✅ **檢查樣式**：確認 CSS 樣式沒有隱藏內容

### 4.2 交互功能問題
- ✅ **事件綁定**：確認事件監聽器正確綁定
- ✅ **函數調用**：確認函數名稱和參數正確
- ✅ **作用域檢查**：確認變量和函數在正確的作用域內
- ✅ **異步處理**：正確處理異步操作和回調

### 4.3 響應式設計問題
- ✅ **斷點測試**：在不同屏幕尺寸下測試
- ✅ **媒體查詢**：確認 CSS 媒體查詢正確觸發
- ✅ **佈局驗證**：確認網格系統在各種設備上正常工作
- ✅ **性能優化**：確保響應式切換流暢

---

## 5. 成功標準 (Success Criteria)

### 5.1 功能完整性
- [ ] 所有承諾的功能都能正常工作
- [ ] 用戶能夠按預期方式使用所有功能
- [ ] 沒有明顯的錯誤或異常行為
- [ ] 數據正確顯示且可以交互

### 5.2 用戶滿意度
- [ ] 用戶反饋問題得到及時解決
- [ ] 界面直觀易用
- [ ] 性能滿足期望
- [ ] 功能符合原始需求

### 5.3 代碼質量
- [ ] 代碼結構清晰易維護
- [ ] 有適當的錯誤處理
- [ ] 有基本的文檔和註釋
- [ ] 通過基本的質量檢查

---

## 6. 持續改進 (Continuous Improvement)

### 6.1 定期回顧
- 每個項目結束後進行經驗總結
- 記錄成功經驗和失敗教訓
- 更新開發流程和檢查清單
- 與用戶討論改進建議

### 6.2 技能提升
- 學習新的調試技巧和工具
- 提高代碼質量和最佳實踐
- 改善溝通和項目管理技能
- 了解用戶需求和體驗設計

### 6.3 工具優化
- 使用更好的開發和測試工具
- 建立自動化測試和部署流程
- 改善代碼審查和質量控制
- 優化開發環境和工作流程

---

## 7. 應急預案 (Contingency Plans)

### 7.1 功能無法實現
- 及時告知用戶技術限制
- 提供替代解決方案
- 分階段實現複雜功能
- 優先保證核心功能

### 7.2 時間壓力
- 專注於最重要的功能
- 採用漸進式交付
- 與用戶商討優先級
- 記錄未完成項目以備後續

### 7.3 技術難題
- 尋求外部幫助和資源
- 嘗試不同的實現方法
- 簡化需求和實現方式
- 學習相關技術和最佳實踐

---

## 9. Sidebar文件管理規則 (2025-10-09 Sidebar替換事件)

### 9.1 事件經過
- **發現日期**：2025-10-09
- **問題**：在沒有通知用戶的情況下，sidebar文件被替換為簡化版
- **影響**：NT從12章變成10章，T4從16章變成4章，所有附錄系統丟失
- **原因**：2025-09-26的提交(c70a438)創建了新的簡化版sidebar文件

### 9.2 文件結構混亂問題

#### 問題根源
```
❌ 錯誤狀態（2025-09-26創建）：
default_sidebar.html          ← 簡化版（10章NT + 4章T4）
languages/sidebar_en.html     ← 簡化版
languages/sidebar_vi.html     ← 簡化版
同時存在：
languages/index_cn.html       ← 完整版（12章NT + 16章T4）✅
languages/index_en.html       ← 完整版 ✅
```

#### 正確結構
```
✅ 正確做法：
languages/
  ├── index_cn.html          ← 主源文件（Master Copy）
  ├── index_en.html          ← 主源文件
  ├── index_vi.html          ← 主源文件
  └── ...
  
archive/或_deprecated/
  ├── default_sidebar.html   ← 廢棄的簡化版
  ├── sidebar_en.html        ← 廢棄的簡化版
  └── ...
```

### 9.3 強制規則

#### 9.3.1 文件命名與組織
- ✅ **唯一主源**：每種語言只有一個主sidebar文件
- ✅ **命名規範**：使用 `index_{lang}.html` 格式
- ❌ **避免重複**：不要同時存在 `index_cn.html` 和 `sidebar_cn.html`
- ❌ **避免模糊**：不要使用 `default_sidebar.html` 這種不明確的名稱

#### 9.3.2 內容完整性檢查
修改sidebar前必須確認：
- [ ] **OT章節**：12章（chapter1-12）+ 11個附錄
- [ ] **NT章節**：12章（chapter1-12）+ 17個附錄  
- [ ] **T4章節**：16章（chapter1-16）分為4個寶藏，每個4課 + 8個附錄
  - T1: 約翰福音3:16 (chapter1-4)
  - T2: 主禱文 (chapter5-8)
  - T3: 使徒信經 (chapter9-12)
  - T4: 屬靈軍裝 (chapter13-16)
- [ ] **二級菜單**：完整的附錄折疊菜單系統
- [ ] **移動優化**：響應式設計代碼

#### 9.3.3 修改流程
```
1. 備份原文件
   cp languages/index_cn.html languages/index_cn.html.backup

2. 修改主源文件
   編輯 languages/index_cn.html

3. 驗證內容完整性
   檢查所有章節和附錄

4. 告知用戶
   明確說明修改了什麼內容

5. 更新index.html引用
   確保主框架指向正確文件
```

#### 9.3.4 AI助手操作規範
- ✅ **修改前確認**：修改sidebar前必須先查看現有文件內容
- ✅ **對比檢查**：創建新文件前對比是否已有類似文件
- ✅ **告知用戶**：任何sidebar修改都必須明確告知用戶
- ❌ **禁止簡化**：不得在沒有用戶明確要求下刪減內容
- ❌ **禁止重複**：不得創建功能重複的文件

#### 9.3.5 Git提交檢查
提交涉及sidebar的修改前必須檢查：
```bash
# 檢查是否誤刪內容
git diff --cached languages/index_*.html | grep -E "chapter[0-9]+" | wc -l

# 提交前確認
echo "確認以下內容："
echo "1. NT是否保持12章？"
echo "2. T4是否保持16章？"
echo "3. 附錄系統是否完整？"
echo "4. 是否已告知用戶？"
```

### 9.4 文件頭部標記（必須添加）
```html
<!--
═══════════════════════════════════════════════════════════
  文件: index_cn.html (中文版Sidebar - 主源文件)
  版本: v2.0
  最後更新: 2025-10-09
  更新者: [姓名/AI助手]
  
  ⚠️ 重要：這是主源文件（Master Copy）
  
  內容完整性：
  ✓ OT: 12章 + 11個附錄
  ✓ NT: 12章 + 17個附錄
  ✓ T4: 16章（4寶×4課）+ 8個附錄
  ✓ 二級折疊菜單系統
  ✓ 移動端響應式設計
  
  修改規則：
  1. 修改前必須備份
  2. 修改後必須驗證內容完整性
  3. 不得刪減章節或附錄
  4. 所有修改必須告知用戶
  
  參考：請查閱 rule.md 第9節
═══════════════════════════════════════════════════════════
-->
```

### 9.5 預防措施

#### 自動檢查腳本（建議創建）
```javascript
// tools/check_sidebar_integrity.js
function checkSidebar(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 計數檢查
  const ntChapters = (content.match(/NT\/chapters\/chapter\d+\.html/g) || []).length;
  const t4Chapters = (content.match(/T4\/chapters\/chapter\d+\.html/g) || []).length;
  const otAppendix = (content.match(/OT\/advance\/appendix\d+\.html/g) || []).length;
  const ntAppendix = (content.match(/NT\/advance\/appendix\d+\.html/g) || []).length;
  const t4Appendix = (content.match(/T4\/advance\/appendix\d+\.html/g) || []).length;
  
  console.log(`檢查文件: ${filePath}`);
  console.log(`NT章節: ${ntChapters}/12`);
  console.log(`T4章節: ${t4Chapters}/16`);
  console.log(`OT附錄: ${otAppendix}/11`);
  console.log(`NT附錄: ${ntAppendix}/17`);
  console.log(`T4附錄: ${t4Appendix}/8`);
  
  // 驗證
  const errors = [];
  if (ntChapters !== 12) errors.push(`❌ NT章節錯誤：${ntChapters}/12`);
  if (t4Chapters !== 16) errors.push(`❌ T4章節錯誤：${t4Chapters}/16`);
  if (otAppendix < 11) errors.push(`⚠️ OT附錄不足：${otAppendix}/11`);
  if (ntAppendix < 17) errors.push(`⚠️ NT附錄不足：${ntAppendix}/17`);
  if (t4Appendix < 8) errors.push(`⚠️ T4附錄不足：${t4Appendix}/8`);
  
  if (errors.length > 0) {
    console.error('\n⚠️ 發現問題：');
    errors.forEach(err => console.error(err));
    return false;
  }
  
  console.log('\n✅ 內容完整性檢查通過');
  return true;
}
```

### 9.6 教訓總結
1. **不要創建功能重複的文件** - 容易造成混亂和不同步
2. **主源文件必須明確標記** - 避免誤用錯誤版本
3. **修改必須告知用戶** - 特別是涉及內容刪減
4. **定期審查文件結構** - 發現並清理冗餘文件
5. **建立檢查機制** - 自動化檢測內容完整性

### 9.7 修復記錄
- **2025-10-09**：發現問題並恢復所有6種語言的完整sidebar
- **恢復內容**：NT 12章、T4 16章、所有附錄系統、二級菜單
- **廢棄文件**：default_sidebar.html 移至archive文件夾

---

*本規則文檔將根據實際項目經驗持續更新和改進。*

---

**創建日期**: 2025-09-27  
**最後更新**: 2025-10-09  
**版本**: 2.0  
**項目**: Bible100_4 Treasures 多語言聖經學習平台  
**目的**: 改善開發質量和用戶滿意度

---

## 8. 事件響應規則 (2025-09-29 可見 "\\n" 事件)

### 8.1 現象與影響
- 症狀：多個 HTML 頁面顯示字面 "\\n"，版面嚴重錯亂。
- 影響：default.html、default_sidebar.html、languages/landP_cn.html、school_management/dashboard.html 等內容無法正常閱讀。

### 8.2 根因
- 批量換行與清理過程中，部分文件被保存為單行文本且以字面 "\\n" 表示換行；後續修復腳本初版在管線處理上出現不兼容，導致未完全轉換。

### 8.3 恢復策略（優先最早、風險最低）
1. 全站回退到最早穩定備份：tools/backup_eol_20250929_155443。
2. 僅對 HTML 檔執行「字面 \\n 轉真正換行」修復，排除備份目錄，避免誤改 JSON/JS。
3. 對關鍵頁面逐一驗證並就地修復。

### 8.4 實際執行
- 回退指令（Windows）：robocopy tools/backup_eol_20250929_155443 . /E /R:1 /W:1 /NFL /NDL /NP
- 修復腳本：tools/fix_literal_n_in_html.ps1（僅處理含大量字面 \\n 的 HTML，閾值>=10）
- 校驗：逐頁開啟 default.html、default_sidebar.html、languages/landP_cn.html、school_management/index.html、school_management/dashboard.html

### 8.5 強制規則
- 8.5.1 先備份再批改：任何全站/批量變更前必須創建時間戳備份。
- 8.5.2 僅限 HTML 修復：修復字面換行僅對 HTML；不得處理 JSON/JS（保留程式字串語義）。
- 8.5.3 漸進式與驗證：每一步修復後立即在瀏覽器驗證核心頁面。
- 8.5.4 回退 Runbook：若出現版面異常，立即執行「回退→局部修復→驗證」。
- 8.5.5 工具執行序：檔案修改與指令執行保持單線序（不並行），避免競態。
- 8.5.6 佈局偏好遵守：保留 topbar→sidebar→content 雙 iframe 結構，UI 僅做最小必要改動。
- 8.5.7 離線與相對路徑：保持離線友好與相對路徑，避免 iframe URL 問題。
- 8.5.8 快取刷新：本地檔案變更後，關閉重開或強制刷新以清除快取。

### 8.6 驗收清單
- [ ] default.html 與 sidebar/內容頁無 "\\n" 可見
- [ ] school_management/index.html 在右側 iframe 正常載入
- [ ] 恢復後無新增壞連結或佈局崩壞
- [ ] 備份目錄完整可用

---
