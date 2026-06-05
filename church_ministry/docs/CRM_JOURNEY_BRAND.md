# CRM 旅程品牌（Landing v4.2）

## 三頁籤

| Tab | 內容 |
|-----|------|
| 教會CRM 理念運用 | 本頁導覽 + 八大原義路線圖 + `CRM_EIGHT_PRINCIPLES` / `CRM_AI_ROLES` 行內連結 + 人機分工 + 工具摺疊 |
| 我的事奉旅程 | 五節點路線圖 + `BELIEVER_JOURNEY_BY_ROLE` 手風琴 + 原 0–5 步驟聚焦卡 |
| 事奉媒合中心 | 管理者五節點路線圖 + 急缺表（缺口可點捲至邀請區）+ 邀請稿／排班／牧養區塊 |

## 語系

- 預設 `lang-zh-only`（畫面純中文+Emoji）
- 全文翻譯：`help/translate.html`

## 狀態

- `state.role` / `state.step` / `state.matchDept` / `state.masterTab`
- localStorage：`crm_journey_role_v1`、`crm_journey_step_v1`、`crm_journey_tab_v1`、`crm_journey_dept_v1`
- 切換頁籤不重置已選身分或部門

## 鍵值

- 角色：`member` | `teacher` | `staff` | `leader`（別名 `student`→`member`、`pastor`→`leader`）

## 會友流程

- 步驟 1：恩賜測驗 + 邀請信草稿（複製，不自動發送）
- 步驟 2：CTA 切換至事奉媒合中心 Tab

## 文案 SSOT

- Tab 2 五節點：`BELIEVER_JOURNEY_BY_ROLE`（`descZh` 為牧養語氣主文；會友路線強調「生命陪伴、不強塞事工」）
- Tab 3 管理者五步：`MATCHMAKER_MANAGER_STAGES`（路線圖 `title` 提示 + 手風琴說明）
- Tab 3 部門 AI 提示：`MATCHMAKER_DATA[*].aiHintZh`（敬拜／小組／主日學等「第一線場景」句式）
