# 文檔整理提案 📚

## 當前問題

目前 `bible100_new/` 根目錄有 **15個.md文件** 散落，造成：
- ❌ 根目錄混亂，難以找到關鍵文件
- ❌ 文檔沒有分類，不易維護
- ❌ Git提交歷史雜亂

## 解決方案

### 建議執行以下整理（待用戶批准）

```powershell
# 創建文檔目錄結構
New-Item -Path "docs/reports/2025-09" -ItemType Directory -Force
New-Item -Path "docs/reports/2025-10" -ItemType Directory -Force
New-Item -Path "docs/plans" -ItemType Directory -Force

# 移動報告類文檔到 docs/reports/
Move-Item "BIBLE_STUDY_SIDEBAR_UPDATE_LOG.md" -Destination "docs/reports/2025-09/" -Force
Move-Item "CHURCH_MINISTRY_RESTRUCTURE_REPORT.md" -Destination "docs/reports/2025-10/" -Force
Move-Item "COMPREHENSIVE_FIX_REPORT.md" -Destination "docs/reports/2025-10/" -Force
Move-Item "FINAL_FIX_REPORT.md" -Destination "docs/reports/2025-10/" -Force
Move-Item "MISSING_PAGES_FIX_REPORT.md" -Destination "docs/reports/2025-10/" -Force
Move-Item "NAVIGATION_TEST_REPORT.md" -Destination "docs/reports/2025-10/" -Force
Move-Item "PHASE_1_COMPLETION_REPORT.md" -Destination "docs/reports/2025-10/" -Force
Move-Item "PHASE2_PHASE3_COMPLETION_REPORT.md" -Destination "docs/reports/2025-10/" -Force
Move-Item "SCHOOL_SIDEBAR_FIX_REPORT.md" -Destination "docs/reports/2025-10/" -Force
Move-Item "THREE_MODULES_COMPLETION_REPORT.md" -Destination "docs/reports/2025-10/" -Force

# 移動計劃類文檔到 docs/plans/
Move-Item "COMPREHENSIVE_OPTIMIZATION_PLAN_全面優化計劃.md" -Destination "docs/plans/" -Force
Move-Item "MODULE_OPTIMIZATION_PLAN.md" -Destination "docs/plans/" -Force
Move-Item "MODULE_ORGANIZATION_PLAN.md" -Destination "docs/plans/" -Force
Move-Item "SYNC_RECOMMENDATIONS.md" -Destination "docs/plans/" -Force
```

## 整理後的結構

```
bible100_new/
├── rule.md                     ⭐ 保留（Cursor AI持續跟隨）
├── README.md                   ⭐ 保留（項目說明）
├── docs/                       📚 新建統一文檔目錄
│   ├── reports/               📊 報告類（10個文件）
│   │   ├── 2025-09/
│   │   └── 2025-10/
│   ├── plans/                 📋 計劃類（4個文件）
│   └── README_DOCUMENTATION.md
└── archive/                    🗄️ 廢棄文件
    └── default_sidebar.html.deprecated
```

## 優點

✅ **根目錄清爽**：只保留2個必要的.md文件  
✅ **文檔分類**：按類型和時間組織  
✅ **Cursor AI正常**：rule.md在根目錄繼續被跟隨  
✅ **易於維護**：清晰的文件結構  
✅ **Git友好**：提交歷史更清晰

## 注意事項

### ⚠️ rule.md 必須保留在根目錄
- Cursor AI 會自動讀取根目錄的 rule.md
- 這是唯一會被"持續跟隨"的文檔
- 移到子目錄會失效

### ✅ 其他.md文檔可以安全移動
- 報告和計劃類文檔不會被自動跟隨
- 移動到docs/不影響功能
- 需要時明確引用即可

## 執行計劃

**請用戶確認是否執行整理？**

選項：
1. ✅ 同意整理 - 我會立即執行上述命令
2. ❌ 暫不整理 - 保持現狀
3. 🔄 修改方案 - 根據您的建議調整

---

**提案日期**: 2025-10-09  
**狀態**: 待批准




















