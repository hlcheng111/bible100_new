# memberSystemData 結構說明

**localStorage 鍵名**：`memberSystemData`

**供應方**：`js/central_member_db.js`、`church_ministry/load_central_member_seed.html`、`church_ministry/modules/members/member-integrated.html`

**消費者**：會友事工、信徒注册、智慧事奉人才吸納、教會事工儀表板

---

## 頂層結構

```json
{
  "members": [],
  "groups": [],
  "ministries": [],
  "groupMemberships": [],
  "ministryAssignments": [],
  "trainings": [],
  "attendance": [],
  "donations": [],
  "_seedVersion": "1.0",
  "_seedGeneratedAt": "2024-..."
}
```

---

## members（會友）

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | number | 主鍵 |
| name | string | 姓名 |
| gender | string | 男／女 |
| age | number | 年齡 |
| phone | string | 電話 |
| email | string | 郵箱 |
| baptized | boolean | 已受洗 |
| membershipDate | string | 加入日期 YYYY-MM-DD |
| status | string | active / inactive |
| birthday | string | MM-DD 或 YYYY-MM-DD |
| gifts | string | 恩賜（逗號分隔） |
| skills | string | 技能（逗號分隔） |
| churchId | string | 所屬堂會 ID |
| organizationId | string | 所屬機構 ID |
| primaryGroupId | number | 主要小組 ID（對應 groups[].id） |
| externalId | string | 外部系統主鍵（如 studentId、volunteerId、智慧事奉 survey 代碼） |

---

## groups（小組）

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | number | 主鍵 |
| name | string | 小組名稱 |
| category | string | 類別（youth, family, workplace, senior, prayer, worship） |
| leader | string | 組長姓名 |
| capacity | number | 人數上限 |
| location | string | 聚會地點（教會／家庭／線上） |

---

## ministries（事工）

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | number | 主鍵 |
| name | string | 事工名稱 |
| category | string | 類別 |
| requirements | string | 需求（技能等） |
| needPeople | number | 需要人數 |

---

## 關聯表

| 表 | 關聯 | 說明 |
|------|------|------|
| groupMemberships | memberId, groupId | 會友 ↔ 小組 |
| ministryAssignments | memberId, ministryId | 會友 ↔ 事工 |
| trainings | memberId | 會友培訓記錄 |
| attendance | memberId | 會友出席記錄 |
| donations | memberId | 會友奉獻記錄 |

---

## 跨模組關聯

- **member.externalId** 可對應 `schoolMasterDatabase.students[].id` 或 `teachers[].id`
- **member.externalId** 可對應智慧事奉 `bible100_smart_ministry_survey_*` 的測驗代碼
- **churchId**、**organizationId** 可對應未來 `organizations` 表
