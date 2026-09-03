# M4 · C 區教育殼（5 Tab）

> **狀態**：2026-07-23 落地  
> **驗收**：`#tab-guide|roster|attendance|discipleship|teaching` 深鏈有效；`python church_ministry/tests/test_education_data_hub.py` 綠

## 主殼

| 項目 | 路徑 |
|------|------|
| L4 工作桌 | `modules/education/education-integrated.html` |
| 側欄 | `sidebar_c_education_journey.html` |
| 殼腳本 | `js/education_integrated_shell.js` |

## 5 Tab → 子頁

| Hash | 子頁 |
|------|------|
| `#tab-guide` | `guide_story.html` |
| `#tab-roster` | `edu_roster.html` |
| `#tab-attendance` | `edu_attendance.html` |
| `#tab-discipleship` | `edu_discipleship.html` |
| `#tab-teaching` | `edu_teaching.html` |

## 衛星 redirect

- `_landing/education.html` → `#tab-guide`
- `sunday-school.html` → `#tab-roster`
- `spiritual-growth.html` → `#tab-discipleship`
- `modules/development/development-plan.html` → `#tab-teaching`

## 舊巨石頁

`education-integrated-legacy.html`（原單頁多 Tab）僅作進階／對照，**不是** C 區主路徑。
