# Bible100 變更記錄

## 2025-03-06（順序執行）

### 會員 500 筆示範 + 一鍵啟動 + Dashboard 接真實資料

- **generate_people_demo.py**：產生 500 筆會員（含性別、地區、出席、標籤）與 400+ 筆進度
- **啟動.bat**：一鍵啟動 HTTP 伺服器並開啟瀏覽器
- **教會事工 Dashboard**：接 People 資料，顯示「500 人 · 男 xxx 女 xxx · 活躍 xxx」
- **會眾入口**：顯示會員與活躍人數
- **人員列表/詳情**：顯示性別、地區、出席等欄位

### 會眾入口與 People 邏輯中心

- **index 頂欄**：新增「會眾入口 Church Center」連結（青綠色按鈕）
- **congregation/**：會眾入口模組（已遷至 `church_ministry/congregation/`，見 `docs/ROOT_REORG_2026-05.md`）
  - `index.html`：卡片式首頁（聖經研讀、我的收藏、敬拜服事、小組團契、我的參與、目錄搜索）
  - `sidebar.html`：會眾側欄導覽
- **people/**：人員模組
  - `people_list.html`：人員列表、搜尋
  - `person_detail.html`：個人詳情、OT100/NT100/T4 進度
- **People 邏輯中心**：
  - `data/people.json`：人員主檔
  - `data/groups.json`：小組/班級
  - `data/progress.json`：學習進度
  - `js/people_loader.js`：PeopleDB API
  - `js/progress_loader.js`：ProgressDB API
- **config/modules.json**：新增 congregation 模組
- **docs**：更新 ARCHITECTURE.md、DATA_SCHEMA.md

### 專案清理與備份

- 新增 `scripts/cleanup_project.ps1`：移除 __pycache__、*.pyc、*.log 等
- 新增 `scripts/backup_full_project.ps1`：全專案備份（排除 backups/，目標 4.5GB 以下）
- 新增 `run_backup_full.bat`：一鍵執行全專案備份
- 執行清理：移除 1 個 __pycache__ 目錄
- 執行備份：產生 `bible100_new_backup_20260306_153429.zip`（3.34 GB）

### 精良工程：技術文件

- 新增 `docs/ARCHITECTURE.md`：架構說明
- 新增 `docs/DATA_SCHEMA.md`：資料結構
- 新增 `docs/PLANNING_CENTER_OBSERVATIONS.md`：Planning Center 觀察與對照
- 新增 `docs/PLANNING_CENTER_MODULE_COMPARISON.md`：門訓、聖經研讀模組對照表
- 新增 `docs/EDITING_GUIDE.md`：小白編輯指南
- 新增 `docs/CHANGELOG.md`：本變更記錄
- 更新 `scripts/README.md`：納入新腳本說明
