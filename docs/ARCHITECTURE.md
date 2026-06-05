# Bible100 架構說明

**版本**: 1.0  
**更新**: 2025-03-06

---

## 一、專案定位

Bible100 為**靜態多語言聖經學習與教會事工平台**，核心理念：

- **PC、手機可用**：純前端，無需後端
- **小白可維護**：JSON、HTML 可手動編輯
- **不需 localhost**：file:// 或任意 HTTP 伺服器
- **靜態網站為主**：無 API、無即時同步

---

## 二、頂層入口與導覽

### 2.1 導覽結構

```
index.html (首頁)
    ├── topbar (頂欄：模組切換、語言)
    ├── sidebar (左側：子模組選單)
    └── content iframe (右側：內容區)
```

### 2.2 模組一覽

| 模組 | 路徑 | 說明 |
|------|------|------|
| 會眾入口 | `church_ministry/congregation/` | 卡片首頁、奉獻、活動、我的參與（併入教會事工） |
| 目錄搜索 | `nav_hub/`, `search/` | TOC、全站搜尋 |
| 門訓動力站 | `disciple_dynamics/` | 培訓教材、傳遞計劃、NotebookLM |
| 學校管理 | `school_management/` | 學生、教師、課程、班級 |
| 教會事工 | `church_ministry/` | 敬拜、團契、行政、報表 |
| 聖經研讀 | `bible_study/` | 精讀、對照、研讀、工具 |
| AI智慧事奉 | `smart_ministry/` | 配對、人才、AI 問答與創作 |

---

## 三、資料流與儲存

### 3.1 現有資料層（分散）

| 模組 | 儲存 | 說明 |
|------|------|------|
| 聖經研讀 | `data/` (.db, .json) | 聖經版本、注釋、串珠、詞典 |
| 學校管理 | SchoolMasterDatabase (localStorage) | 學生、教師、課程、班級 |
| 智慧事奉 | SmartMinistryDatabase (localStorage) | user_profiles、配對結果 |
| 教會事工 | simple_database_system / LocalStorage | 會友、志工、活動 |

### 3.2 People 邏輯中心（已實作）

- **目標**：跨模組共用「人員」資料
- **格式**：`data/people.json` + `js/people_loader.js`
- **相容**：與 SchoolMasterDatabase、SmartMinistryDatabase 共存
- **API**：`peopleDB.list()`, `peopleDB.get(id)`, `peopleDB.search(term)`

---

## 四、目錄結構

```
bible100_new/
├── index.html              # 主入口
├── config/                 # 設定檔
├── css/                    # 全域樣式
├── js/                     # 全域腳本
├── data/                   # 聖經研讀資料（.db, .json）
├── languages/              # 多語言（OT, NT, T4）
├── training/               # 培訓教材
├── disciple_dynamics/      # 門訓動力站
├── bible_study/            # 聖經研讀
├── church_ministry/       # 教會事工
├── school_management/     # 學校管理
├── smart_ministry/        # AI智慧事奉
├── ai_tools/              # AI工具
├── hymn_management/       # 詩歌管理
├── church_ministry/congregation/  # 會眾入口（卡片首頁；原根目錄 congregation）
├── people/                # 人員列表、個人詳情
├── nav_hub/               # 導覽中心
├── search/                # 搜尋
├── scripts/                # 備份、清理腳本
├── docs/                   # 技術文件
└── backups/                # 備份（不納入全專案備份）
```

---

## 五、技術棧

- **前端**：HTML5、CSS3、JavaScript（無框架）
- **資料**：SQLite (.db)、JSON、localStorage
- **部署**：靜態檔案，可放 CDN、GitHub Pages、任意主機

---

## 六、相關文件

- [架構與內容約定](架構與內容約定.md)
- [資料結構](DATA_SCHEMA.md)
- [編輯指南](EDITING_GUIDE.md)
- [Planning Center 觀察](PLANNING_CENTER_OBSERVATIONS.md)
