# schoolMasterDatabase 結構說明

**localStorage 鍵名**：`schoolMasterDatabase`

**供應方**：`school_management/js/school-master-database.js`

**消費者**：學校管理各子模組（學生、教師、課程、班級、成績、財務等）

---

## 頂層結構

```json
{
  "students": [],
  "teachers": [],
  "courses": [],
  "organizations": [],
  "student": { "profiles": [], "enrollments": [], "attendance": [], "homework": [], "progress": [] },
  "teacher": { "profiles": [], "schedules": [], "evaluations": [], "workload": [] },
  "course": { "schedules": [], "materials": [], "evaluations": [], "prerequisites": [] },
  "class": { "classes": [], "classStudents": [], "classTeachers": [], "subjects": [], "activities": [] },
  "grade": { "grades": [], "exams": [], "assessments": [], "reports": [] },
  "finance": { "tuition": [], "payments": [], "expenses": [], "budgets", "reports": [] },
  "communication": { "parentContacts": [], "notices": [], "messages": [], "feedback": [] },
  "activity": { "activities": [], "competitions": [], "clubs": [], "events": [] },
  "metadata": { "lastUpdated", "version", "modules", "defaultOrganizationId", "defaultLanguage", "supportedLanguages" }
}
```

---

## 核心父表

### students

| 欄位 | 說明 |
|------|------|
| id | 主鍵 |
| name, gender, age, phone, email | 基本資料 |
| organizationId | 所屬組織／校區 |
| （其他依 UI 需求） | |

### teachers

| 欄位 | 說明 |
|------|------|
| id | 主鍵 |
| name, ... | 基本資料 |
| organizationId | 所屬組織 |

### courses

| 欄位 | 說明 |
|------|------|
| id | 主鍵 |
| name, ... | 課程資訊 |
| organizationId | 所屬組織 |

### organizations

| 欄位 | 說明 |
|------|------|
| id | 主鍵 |
| name | 組織／校區名稱 |

---

## 關聯表（以 ID 連結）

| 子模組 | 關聯 |
|------|------|
| student.enrollments | studentId + courseId |
| student.attendance | studentId |
| student.homework | studentId + courseId |
| student.progress | studentId |
| teacher.schedules | teacherId + courseId |
| course.schedules | courseId |
| class.classStudents | studentId + classId |
| class.classTeachers | teacherId + classId |
| grade.grades | studentId + courseId |
| finance.payments | studentId |

---

## 跨模組關聯

- **student.externalId** 或 **teacher.externalId** 可對應 `memberSystemData.members[].externalId`（會友 ↔ 學生／教師）
