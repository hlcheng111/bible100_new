# Bible100 資料結構說明

**版本**: 1.0  
**更新**: 2025-03-06

---

## 一、聖經研讀模組 (data/)

### 1.1 目錄結構

```
data/
├── bibles/           # 聖經版本 (.db, .json)
├── commentaries/     # 注釋書（含綜合解讀.db）
├── dictionaries/     # 詞典
├── crossrefs/        # 串珠
├── devotionals/      # 靈修
├── maps/             # 地圖
└── lexicons/         # 詞彙
```

### 1.2 讀取方式

- `unified-database-loader.js`：統一載入
- 支援 SQLite + JSON 雙模式

---

## 二、學校管理 (SchoolMasterDatabase)

### 2.1 核心表

| 表 | 說明 |
|------|------|
| students | 學生 |
| teachers | 教師 |
| courses | 課程 |
| organizations | 組織/校區 |
| student.profiles | 學生詳細檔案 |
| student.progress | 學習進度 |
| class.classes | 班級 |
| class.classStudents | 班級學生關聯 |

### 2.2 儲存

- localStorage key: `schoolMasterDatabase`
- 包裝層: `school_db.js` (SchoolDB)

---

## 三、智慧事奉 (SmartMinistryDatabase)

### 3.1 表

| 表 | 說明 |
|------|------|
| user_profiles | 人才檔案 |
| match_results | 配對結果 |
| ministry_positions | 事奉崗位 |
| service_history | 服事歷史 |
| system_config | 系統設定 |

### 3.2 儲存

- localStorage prefix: `bible100_smart_ministry_`

---

## 四、教會事工

- 會友、志工：`simple_database_system.js` 或 LocalStorage
- 統一管理頁：`member_volunteer_unified.html`

---

## 五、People 邏輯中心（已實作）

- **data/people.json**：人員主檔
- **data/groups.json**：小組/班級
- **data/progress.json**：OT100/NT100/T4 進度
- **js/people_loader.js**：PeopleDB API
- **js/progress_loader.js**：ProgressDB API
- **people/**：人員列表、個人詳情頁

各模組可透過 `window.peopleDB`、`window.progressDB` 讀取。

---

## 六、People/Groups/Progress Schema

### 6.1 People

```json
{
  "id": "string",
  "name": "string",
  "language": "string",
  "church": "string",
  "tags": ["string"],
  "notes": "string"
}
```

### 6.2 Groups

```json
{
  "id": "string",
  "name": "string",
  "type": "class|small_group",
  "course": "OT100|NT100|T4",
  "members": ["person_id"]
}
```

### 6.3 Progress

```json
{
  "person_id": "string",
  "course_id": "string",
  "current_step": "number",
  "last_updated": "ISO8601"
}
```

---

## 七、多語言

- `languages/{lang}/`：OT、NT、T4
- 語言代碼：cn, en, vi, id, kh, lo, my 等
