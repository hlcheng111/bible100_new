# 📋 模組整理計劃

## 🎯 目標
為所有模組建立統一、清晰的文件結構

---

## 📊 現狀分析

### 🏫 School Management ✅
- **狀態**：已完成整理
- **結構**：functions/, archive/, tools/, _landing/
- **文件數**：60+ → 清晰分類

### ⛪ Church Ministry 🔄
- **狀態**：需要整理
- **問題**：複雜的 modules/ 子目錄結構
- **文件數**：100+ 個文件分散在 modules/ 下

### 🧠 AI Tools 🔄
- **狀態**：需要整理
- **問題**：pages/ 和 tools/ 重複，文件分散
- **文件數**：30+ 個文件

---

## 🗂️ 統一整理原則

### 核心文件（根目錄）
```
module_name/
├── index.html           ← 主入口頁面
├── dashboard.html       ← 儀表板
├── sidebar.html         ← 側邊欄導航
└── [module].db          ← 資料庫文件
```

### 功能目錄
```
functions/               ← 功能頁面
├── category1/          ← 按功能分類
├── category2/
└── README.md
```

### 支援目錄
```
_landing/               ← Landing Pages
archive/                ← 備用/舊文件
tools/                  ← 工具文件
docs/                   ← 文檔文件
```

---

## 📋 具體整理計劃

### ⛪ Church Ministry 整理

#### 當前問題：
- `modules/` 下有 15 個子目錄
- 文件分散，難以管理
- 命名不統一

#### 整理方案：
```
church_ministry/
├── index.html, dashboard.html, sidebar.html
├── functions/
│   ├── worship/        ← worship/ 相關文件
│   ├── education/      ← education/ 相關文件
│   ├── fellowship/     ← fellowship/ 相關文件
│   ├── administration/ ← administration/ 相關文件
│   ├── analytics/      ← analytics/ 相關文件
│   ├── finance/        ← finance/ 相關文件
│   ├── media/          ← media/ 相關文件
│   ├── support/        ← support/ 相關文件
│   └── README.md
├── archive/            ← sidebar_OLD.html 等
└── _landing/           ← 已存在
```

### 🧠 AI Tools 整理

#### 當前問題：
- `pages/` 和 `tools/` 重複
- 文件命名不一致

#### 整理方案：
```
ai_tools/
├── index.html, dashboard.html, sidebar.html
├── functions/
│   ├── text/           ← 文本相關 AI 工具
│   ├── image/          ← 圖像相關 AI 工具
│   ├── audio/          ← 音頻相關 AI 工具
│   ├── video/          ← 視頻相關 AI 工具
│   ├── education/      ← 教育相關 AI 工具
│   └── README.md
├── components/         ← 保持現有結構
├── archive/            ← 備用文件
└── tools/              ← 工具腳本
```

---

## 🚀 實施步驟

### Phase 2A：Church Ministry 整理（30分鐘）
1. 創建 functions/ 目錄結構
2. 移動 modules/ 下的文件到對應分類
3. 更新 sidebar.html 連結
4. 測試功能

### Phase 2B：AI Tools 整理（20分鐘）
1. 創建 functions/ 目錄結構
2. 合併 pages/ 和 tools/ 重複文件
3. 更新 sidebar.html 連結
4. 測試功能

### Phase 2C：統一測試（10分鐘）
1. 測試所有模組的主頁面
2. 確認側邊欄導航正常
3. 驗證功能頁面可訪問

---

## 📝 命名規範

### 文件命名：
- 使用小寫字母和連字符：`student-management.html`
- 避免空格和特殊字符
- 保持描述性命名

### 目錄命名：
- 功能目錄：`functions/`
- 備用目錄：`archive/`
- 工具目錄：`tools/`
- Landing 目錄：`_landing/`

---

## 🔧 技術實現

### Python 整理腳本模板：
```python
import os
import shutil

def organize_module(module_name):
    """整理指定模組"""
    
    # 創建目錄結構
    dirs = ['functions', 'archive', 'tools']
    for d in dirs:
        os.makedirs(d, exist_ok=True)
    
    # 移動文件
    # ... 具體移動邏輯
    
    print(f"✅ {module_name} 整理完成")
```

---

## ✅ 預期效果

### 整理後：
- **清晰結構**：每個模組都有統一目錄結構
- **易於維護**：開發者可以快速定位文件
- **減少混亂**：主目錄只保留核心文件
- **統一標準**：所有模組遵循相同規範

### 統計預期：
- **School Management**：✅ 已完成（60+ → 清晰分類）
- **Church Ministry**：🔄 100+ → 清晰分類
- **AI Tools**：🔄 30+ → 清晰分類

---

**準備開始 Phase 2A：Church Ministry 整理？** 🚀
