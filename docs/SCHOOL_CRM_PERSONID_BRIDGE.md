# School Management ↔ 教會 CRM · PersonID 對齊方案

**版本**：2026-06-03  
**原則**：不合併破壞既有資料；`member_id` 為教會 SSOT；學校保留 `schoolMasterDatabase`。

---

## 1. 現況盤點

| 儲存鍵 | 模組 | 用途 |
|--------|------|------|
| `memberSystemData` | 教會事工 | 會友主檔 · **member_id** |
| `churchMasterDatabase` | Bridge 匯總 | members、volunteer、education 切片 |
| `schoolMasterDatabase` | 學校管理 | 學生、教師、課程、選課 |
| `educationSystemData` | 教會事工內教育 | 同步至 `churchMasterDatabase.education` |
| `bible100_smart_ministry_main` | 智慧事奉 | talent_id = member_id |

學校模組已有 **`memberId`** 欄位設計（見 `school_management` 文件），但未強制全站統一。

---

## 2. PersonID 策略（草案）

```
person_id = member_id          （若學生／教師／家長已連會友）
person_id = student:<id>       （僅學籍、無會友對照）
person_id = teacher:<id>
person_id = parent:<id>
```

**禁止**：為同一人另造永久第二套教會 ID。  
**允許**：遷移期 `legacy_*` 註記於 `metadata`。

---

## 3. Bridge 只讀 API（已落地草案）

```javascript
ChurchDataBridge.getPersonMappingPreview({ limit: 20 })
```

回傳：

- `strategy`: `member_id_as_person_id_when_present`  
- `linked_count` / `sample[]`：`person_id`, `member_id`, `student_id`, `teacher_id`, `parent_id`, `role_hints`, `name`

正式 `resolvePersonId({ student_id })` 列 P2 實作。

---

## 4. 三個優先接入 CRM Dashboard 的學校頁

| 優先 | 頁面 | 理由 |
|------|------|------|
| 1 | `school_management/dashboard.html` | 決策者看學生／教師總覽；可顯示 linked member 比例 |
| 2 | `school_management/course_completion.html` | 已有 `appendChurchId`；課程註冊 ↔ 會友 |
| 3 | `church_ministry/modules/education/education-integrated.html` | 教會內教育與學校雙向深連結 |

同工 Dashboard（`crm_role_dashboard.js` staff 視角）已連結學校 dashboard。

---

## 5. 遷移步驟（不破壞資料）

1. 匯入／編輯學生時填 `memberId`（可選）  
2. Bridge 匯總時只**讀**映射，不搬移 `schoolMasterDatabase`  
3. CRM 360 時間軸：有 `member_id` 才合併學校事件（P2）  
4. 文件化例外：僅校外學生維持 `student:*` person_id  

---

## 6. 相關檔案

- `js/church_data_bridge.js` — `getPersonMappingPreview`  
- `church_ministry/js/crm_role_dashboard.js` — staff 卡片  
- `docs/CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md` — 決策者動線  
