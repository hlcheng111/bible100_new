# Bible100 文檔組織說明

## 📚 文檔管理規範

### 文檔存放位置

✅ **正確做法**：所有項目文檔統一存放在 `docs/` 文件夾

```
bible100_new/
├── docs/                          ← 統一文檔目錄
│   ├── ENGINEERING_MASTER_ROADMAP.md ← **工程總表：全站互通 × 模組微調 × 文檔治理（先做／後做、可勾選）**
│   ├── CHURCH_TOOL_PLAYBOOK.md      ← **教會工具通用：調查／計劃／配對 · 七層骨架 + L1～L3 + Next tool（立此存案）**
│   ├── PHASE0_INVENTORY_CHECKLIST.md ← **階段 0：站內工具盤點表 + Next 導向矩陣 + 主線決策（收口版）**
│   ├── PLAYBOOK_ALIGNMENT_PHASE1_4.md ← **Phase 1-4 對齊改版完成紀錄（四類工具）**
│   ├── DATA_CONTRACT_PHASE0_ALIGNMENT.md ← **Phase 0 鍵名對齊與 migration 優先序**
│   ├── RBAC_THREE_TIERS_STANDARD.md ← **全站角色權限（總管／編輯／用家）— 新模組與上雲必對齊**
│   ├── BILINGUAL_EN_BRIDGE_POLICY.md  ← 全站中英（英譯作 bridge）政策
│   ├── README_DOCUMENTATION.md    ← 本文件
│   ├── LINK_CHECK_AFTER_NAV_CHANGES.md ← **導覽/help 改 href 後：跑相對連結檢查腳本（提醒）**
│   ├── BACKLOG_POST_REFACTOR_SHELL.md ← **模組重整收口後：Shell／導覽 backlog + Rule 觸發說明**
│   ├── reports/                   ← 各類報告
│   ├── plans/                     ← 計劃文檔
│   ├── guides/                    ← 使用指南
│   └── logs/                      ← 更新日誌
├── rule.md                        ← 開發規則（Cursor AI會持續跟隨）
└── README.md                      ← 項目說明（必須放根目錄）
```

---

## 📋 現有文檔清理計劃

### 當前狀態（2025-10-09）
根目錄有15個.md文件散落，需要整理：

#### 報告類 (Reports) - 移到 `docs/reports/`
1. `BIBLE_STUDY_SIDEBAR_UPDATE_LOG.md`
2. `CHURCH_MINISTRY_RESTRUCTURE_REPORT.md`
3. `COMPREHENSIVE_FIX_REPORT.md`
4. `FINAL_FIX_REPORT.md`
5. `MISSING_PAGES_FIX_REPORT.md`
6. `NAVIGATION_TEST_REPORT.md`
7. `PHASE_1_COMPLETION_REPORT.md`
8. `PHASE2_PHASE3_COMPLETION_REPORT.md`
9. `SCHOOL_SIDEBAR_FIX_REPORT.md`
10. `THREE_MODULES_COMPLETION_REPORT.md`

#### 計劃類 (Plans) - 移到 `docs/plans/`
11. `COMPREHENSIVE_OPTIMIZATION_PLAN_全面優化計劃.md`
12. `MODULE_OPTIMIZATION_PLAN.md`
13. `MODULE_ORGANIZATION_PLAN.md`
14. `SYNC_RECOMMENDATIONS.md`

#### 特殊文件 - 保留根目錄
- `rule.md` ✅ **保留根目錄** - Cursor AI會持續跟隨
- `README.md` ✅ **保留根目錄** - 項目主說明

---

## 🎯 為什麼 rule.md 必須在根目錄？

### Cursor AI 的文件識別機制

1. **自動讀取規則**
   - Cursor AI 會自動讀取根目錄的 `.cursorrules` 或 `rule.md`
   - 這些文件會被持續跟隨，影響AI的工作方式

2. **優先級最高**
   - 根目錄的規則文件優先級最高
   - 子目錄的文檔不會被自動跟隨

3. **持續生效**
   - 每次對話開始時會自動加載
   - 修改後立即生效

### 其他.md文檔的特性

❌ **不會被自動跟隨**
- 普通的報告、計劃類.md文件不會被Cursor自動讀取
- 需要明確引用才會被考慮

✅ **適合歸檔整理**
- 這些文檔主要是記錄和參考用
- 整理到統一文件夾不影響功能
- 反而更容易管理和查找

---

## 📂 建議的文檔組織結構

```
bible100_new/
│
├── rule.md                        ⭐ 開發規則（必須在根目錄）
├── README.md                      ⭐ 項目說明（必須在根目錄）
│
├── docs/                          📚 統一文檔目錄
│   │
│   ├── README_DOCUMENTATION.md    📖 本說明文件
│   │
│   ├── reports/                   📊 報告類
│   │   ├── 2025-09/              按月份組織
│   │   │   ├── BIBLE_STUDY_SIDEBAR_UPDATE_LOG.md
│   │   │   └── ...
│   │   └── 2025-10/
│   │       ├── CHURCH_MINISTRY_RESTRUCTURE_REPORT.md
│   │       └── ...
│   │
│   ├── plans/                     📋 計劃類
│   │   ├── optimization/
│   │   │   ├── COMPREHENSIVE_OPTIMIZATION_PLAN.md
│   │   │   └── MODULE_OPTIMIZATION_PLAN.md
│   │   └── organization/
│   │       └── MODULE_ORGANIZATION_PLAN.md
│   │
│   ├── guides/                    📚 使用指南
│   │   ├── sidebar-management.md
│   │   └── development-workflow.md
│   │
│   └── logs/                      📝 更新日誌
│       └── CHANGELOG.md
│
└── archive/                       🗄️ 廢棄文件
    ├── default_sidebar.html.deprecated
    └── ...
```

---

## 🔄 遷移步驟（建議執行）

### PowerShell 命令
```powershell
# 1. 創建文檔目錄結構
New-Item -Path "docs/reports" -ItemType Directory -Force
New-Item -Path "docs/plans" -ItemType Directory -Force
New-Item -Path "docs/guides" -ItemType Directory -Force
New-Item -Path "docs/logs" -ItemType Directory -Force

# 2. 移動報告類文檔
Move-Item "*_REPORT.md" -Destination "docs/reports/" -Force
Move-Item "*_LOG.md" -Destination "docs/reports/" -Force

# 3. 移動計劃類文檔
Move-Item "*_PLAN*.md" -Destination "docs/plans/" -Force
Move-Item "*RECOMMENDATIONS.md" -Destination "docs/plans/" -Force

# 4. 確認 rule.md 和 README.md 留在根目錄
# （不移動這兩個文件）
```

---

## ✅ 整理後的好處

### 1. 清晰的文件結構
- 根目錄只保留必要文件
- 文檔按類型和時間組織
- 容易查找和維護

### 2. Cursor AI 正常工作
- `rule.md` 在根目錄持續被跟隨
- AI助手能正確應用開發規則
- 不影響現有工作流程

### 3. 版本控制友好
- Git提交更清晰
- 文檔變更容易追蹤
- 減少根目錄混亂

### 4. 團隊協作便利
- 新成員容易理解結構
- 文檔分類清楚
- 維護成本降低

---

## 📌 注意事項

### ⚠️ 不要移動的文件
- `rule.md` - Cursor AI規則，必須在根目錄
- `README.md` - 項目說明，必須在根目錄
- `.cursorrules` - 如果存在，必須在根目錄

### ✅ 可以移動的文件
- 所有報告類 `*_REPORT.md`
- 所有計劃類 `*_PLAN.md`
- 所有日誌類 `*_LOG.md`
- 其他說明文檔

### 🔄 定期維護
- 每月整理一次文檔
- 過期報告移到 `archive/old_reports/`
- 更新本說明文件

---

## 📖 相關參考

- 開發規則：`rule.md` 第9節（Sidebar文件管理）
- 項目說明：`README.md`
- Git忽略配置：`.gitignore`

---

**創建日期**: 2025-10-09  
**版本**: 1.0  
**維護者**: Bible100 開發團隊  
**目的**: 建立清晰的文檔管理規範




















