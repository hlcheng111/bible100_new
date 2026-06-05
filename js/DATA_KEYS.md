# Bible100 中央／模組資料鍵說明

## 中央會友資料（會友事工、信徒注册、智慧事奉共用）

| 鍵名 | 說明 | 供應方 | 消費者 |
|------|------|--------|--------|
| **memberSystemData** | 會友完整系統：會友檔案、小組歸屬、事工參與、培訓、出席等 | `js/central_member_db.js` 種子或 教會事工「會友檔案」頁面寫入 | 會友事工完整系統、智慧事奉人才吸納、信徒注册、儀表板統計 |

- **結構**：`{ members, groups, ministries, groupMemberships, ministryAssignments, trainings, attendance, donations }`

### 會友 members 單筆欄位一覽

| 欄位 | 說明 | 備註 |
|------|------|------|
| **id** | 主鍵 | 數字，唯一 |
| **name** | 姓名 | 必填 |
| **gender** | 性別 | 男／女 |
| **age** | 年齡 | 數字 |
| **phone** | 電話 | |
| **email** | 郵箱 | |
| **baptized** | 已受洗 | 布林 |
| **membershipDate** | 加入日期 | YYYY-MM-DD |
| **status** | 狀態 | 如 active / inactive |
| **birthday** | 生日 | MM-DD 或 YYYY-MM-DD |
| **gifts** | 恩賜 | 文字或逗號分隔（與事奉配對、培訓推荐共用） |
| **skills** | 技能 | 文字或逗號分隔（與事奉配對、培訓推荐共用） |
| **churchId** | 所屬堂會 ID | 可作其他 DB 關聯：對應堂會／機構主鍵 |
| **organizationId** | 所屬機構 ID | 可作其他 DB 關聯：多堂會／分校時用 |
| **primaryGroupId** | 主要小組 ID | 可作其他 DB 關聯：對應本庫 groups[].id |
| **externalId** | 外部系統主鍵 | 可作其他 DB 關聯：例如學校 studentId、志工 volunteerId、智慧事奉 survey 代碼等，字串即可 |

**關聯表（以 memberId 連結會友）**：`groupMemberships`（memberId ↔ groupId）、`ministryAssignments`（memberId ↔ ministryId）、`trainings`（memberId）、`attendance`（memberId）、`donations`（memberId）。其他模組只要約定「以 memberId 或 member.externalId 對應」即可與中央會友庫做關聯。

- **試用資料**：至少 200 筆會友 + 關聯小組／事工／培訓／出席。載入方式：開啟 `church_ministry/load_central_member_seed.html` 點「載入 200+ 筆試用資料」。
- **API**：載入 `js/central_member_db.js` 後使用 `CentralMemberDB.get()` / `CentralMemberDB.set()` / `CentralMemberDB.loadSeedIfEmpty()`。

## 其他模組主要鍵（參考）

| 鍵名 | 說明 |
|------|------|
| churchMasterDatabase | 教會事工進階統一結構（若啟用） |
| schoolMasterDatabase | 學校管理統一資料源 |
| bible100_smart_ministry_survey_profile | 智慧事奉：測驗整合檔（恩賜、MBTI、DISC 等） |
| bible100_smart_ministry_survey_gifts | 屬靈恩賜測驗結果 |
| bible100_smart_ministry_survey_mbti | MBTI 測驗結果 |
| volunteerSystemData, visitationData, financeSystemData | 教會事工：志工、探訪、財務 |

以上鍵皆為 **localStorage**；未來若改為後端 API，可對應同一結構。
