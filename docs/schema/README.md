## Schema 說明（全站藍圖）

| 文件 | 說明 |
|------|------|
| [全站DB藍圖_v0.1.md](./全站DB藍圖_v0.1.md) | 全站主要資料表與邏輯域設計的總覽藍圖。日後各模組的 migration 草案，應盡量與此對齊。 |

---

# Bible100 資料結構 Schema

本目錄記錄全站 localStorage 與資料庫的結構定義，供前後端對接與維護參考。

---

## localStorage 鍵名一覽

| 鍵名 | 說明 | Schema 文件 |
|------|------|-------------|
| memberSystemData | 中央會友系統（會友、小組、事工、培訓、出席、奉獻） | [member-system.md](member-system.md) |
| schoolMasterDatabase | 學校管理統一資料源（學生、教師、課程、班級、成績、財務） | [school-master.md](school-master.md) |
| bible100_smart_ministry_survey_profile | 智慧事奉：測驗整合檔 | — |
| bible100_smart_ministry_survey_gifts | 屬靈恩賜測驗結果 | — |
| bible100_smart_ministry_survey_mbti | MBTI 測驗結果 | — |
| volunteerSystemData | 教會事工：志工 | — |
| visitationData | 教會事工：探訪 | — |
| financeSystemData | 教會事工：財務 | — |
| global_tools_saved | 全站工具：已收藏連結 | — |
| sidebarWidth, sidebar_detail_* | UI 狀態 | — |

---

## 關聯關係

```
organizations (未來)
    ↑ churchId / organizationId
members (memberSystemData)
    ↑ externalId
    ├── schoolMasterDatabase.students
    ├── schoolMasterDatabase.teachers
    └── bible100_smart_ministry_survey_*
```

---

## 使用方式

- 新增欄位或表時，請同步更新對應 schema 文件
- 後端 API 遷移時，可沿用本結構作為 request/response 格式
