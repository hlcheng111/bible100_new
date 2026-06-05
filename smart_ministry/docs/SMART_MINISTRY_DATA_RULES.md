# Smart Ministry 資料規格 v1

本規格說明智慧事奉（Smart Ministry）模組共用的資料模型、**唯一正式儲存位置**與寫入原則，目標為：

- **單一人才主鍵**（`talent_id` = `member_id`）
- **單一 canonical 命名空間**（`bible100_smart_ministry_main`）
- 各模組**互通、不丟資料**、可長期備份與遷移

實作入口腳本：`bible100_new/js/smart_ministry_canonical_store.js`（全域 `SmartMinistryCanonical`）。

---

## 1. 單一人才主鍵（talent_id）

### 定義

- `talent_id` **一律等同**會友系統的 `member_id`（字串化後一致：`String(member.id)`）。
- Smart Ministry **不得**另行產生一套與會友無關的「永久人才編號」，除非標記為 `legacy_*`（僅遷移期或無會友對照時）。

### 取得與傳遞

- `registration.html` 建立會友後，**必須**呼叫 `SmartMinistryCanonical.saveOrUpdateTalent({ talent_id: String(member.id), ... })`。
- 問卷、恩賜測驗、技能管理、配對等頁面操作前**必須**已有 `talent_id`（登入／選人／URL 參數）。

### 禁止

- 不得新增獨立欄位如 `smart_ministry_member_id` 作為主鍵。
- 不得在**沒有** `talent_id` 時寫入 canonical 集合（避免孤兒資料）。

---

## 2. Canonical 儲存命名空間

### 儲存鍵

| 鍵名 | 說明 |
|------|------|
| `bible100_smart_ministry_main` | **唯一正式** Smart Ministry 聚合物件（JSON） |

根物件結構（v1）：

```json
{
  "schema_version": 1,
  "talents": [],
  "talent_skill": [],
  "ministry_assignment": [],
  "ministries": [],
  "assessments": [],
  "meta": {}
}
```

- `ministries`：本模組內使用之事工／崗位**目錄**（配對 UI 用）；日後若抽出至 `bible100_ministry_catalog`，以規格升級為準。
- `meta.updated_at`：最後寫入時間（由 API 維護）。

### 集合欄位（摘要）

**talents**

| 欄位 | 說明 |
|------|------|
| `talent_id` | 必填，= `member_id` |
| `name`, `gender`, `contact`, `gift`, `mbti`, `skills_legacy` | 基本與展示用 |
| `registration_source`, `status`, `created_at`, `updated_at` | 追蹤用 |
| `matching_constraints` | **選填**，物件或 JSON 字串；供 `talent_ministry_matching.html` 做 **M2 硬性排除／需人工確認**（見下） |
| `service_status` | **選填**；若為 `pause` 與 `status: pause_service` 類同，配對視為硬性停止 |

**matching_constraints（選填，皆布林，預設 false）**

| 鍵 | 效果（與崗位名稱／需求欄合併比對） |
|----|-----------------------------------|
| `no_sunday_morning` | 若崗位敘述含主日／週日早上等 → **硬性排除** |
| `physical_limited` | 若崗位敘述含搬運、體力、重物等 → **硬性排除** |
| `hard_stop` | **硬性排除**（與崗位無關，一律不建議批量／規則自動寫入） |
| `health_concern` | **需人工確認** |
| `conflict_of_interest` | **需人工確認** |
| `family_opposition` | **需人工確認** |

#### `metadata.match_analysis`（配對頁寫入時附帶）

- `reasons`：M1 之 2～3 條可解釋因子  
- `hardBlocks` / `reviewFlags`：M2 陣列  
- `blocked`、`ruleVersion`：規則版本追溯用  

**talent_skill**

| 欄位 | 說明 |
|------|------|
| `talent_id`, `skill_id_ref`, `skill_code`, `skill_name`, `level`, `source` | 與技能主檔（`bible100_smart_ministry_skills`）以 `skill_id_ref` 對應 |

**ministry_assignment**

| 欄位 | 說明 |
|------|------|
| `talent_id`, `ministry_id`, `ministry_name`, `status`, `source`, `metadata` | 配對／邀請結果 |

**`ministry_assignment.metadata`（M3–M5 延伸欄位，與 `match_analysis` 並存）**

| 欄位 | 說明 |
|------|------|
| `trial_followup_due` | ISO 日期（`YYYY-MM-DD`），建議以 `invite_record_date`（或批次當日）起 **+28 天** 作試用／邀請跟進提醒 |
| `canonical_ref` | 人類可讀對照字串，格式 `bible100_smart_ministry_main:ministry_assignment:{talent_id}:{ministry_id}` |
| `leader_outreach_snippet` | 給部門負責人／牧者的複製用短文（M4）；**非**自動通知對方 |

**assessments**

| 欄位 | 說明 |
|------|------|
| `talent_id`, `type`（如 `questionnaire_general` / `gifts_test` / `MBTI`）, `payload`, `summary` | 問卷與測驗結果 |

### 禁止

- 不得在其他 localStorage key 建立**平行的**正式 `talents` / `talent_skill` / `ministry_assignment`。
- 允許非正式 key：表單草稿、一次性匯入暫存，且**不得**被視為真相來源。

---

## 3. 統一 API（必須經此讀寫正式資料）

| 函式 | 用途 |
|------|------|
| `getStore()` | 讀取完整 canonical 物件 |
| `saveOrUpdateTalent(form)` | 建立／更新 `talents` |
| `loadTalentById(talent_id)` | 讀單筆人才 |
| `listTalents()` | 列表 |
| `attachAssessmentToTalent(talent_id, type, payload, summary)` | 寫入 `assessments` |
| `setTalentSkills(talent_id, skillsArray)` | 覆寫該員 `talent_skill` |
| `addTalentSkillLink(talent_id, skillRow)` | 單筆新增映射 |
| `removeTalentSkillLink(talent_id, skill_id_ref)` | 單筆移除 |
| `clearTalentSkills(talent_id)` | 清空該員映射 |
| `listTalentSkills(talent_id)` | 查詢映射 |
| `addMinistryAssignment(rec)` | 新增事奉配對（含去重） |
| `listMinistryAssignments()` | 列表 |
| `setMinistryAssignments(rows)` | 覆寫全部（管理用） |
| `upsertMinistryCatalog(row)` | 事工目錄 |
| `listMinistriesCatalog()` | 目錄列表 |
| `migrateLegacyToCanonical()` | 一次性合併舊資料 |
| `exportAll()` | JSON 字串匯出 |
| `getSkillsDisplayString(talentRow)` | 配對頁用技能字串 |

---

## 4. 逐頁寫入行為（v1 實作狀態）

| 頁面 | 行為 |
|------|------|
| `registration.html` | 寫入 `memberSystemData` 後 **`saveOrUpdateTalent`**（✅ 已接） |
| `questionnaire_system.html` | 應：`attachAssessmentToTalent`；需先有 `talent_id`（⏳ 待接） |
| `assessment.html` / `mbti_test.html` | 應：同上（⏳ 待接） |
| `talent_skill_unified.html` | 只透過 **`addTalentSkillLink` / `remove` / `clear`** 寫 `talent_skill`（✅ 已接；技能主檔仍用 unified 表） |
| `talent_ministry_matching.html` | 只讀 canonical `talents` / `talent_skill`；寫入 **`ministry_assignment`**（✅ 已接） |
| `dashboard.html` | 僅讀取統計；數字來自 `dashboard_live_stats.js`（✅ 優先 canonical） |

### 4.1 進階自我認識工具（localStorage，非 canonical 主線）

| 鍵名 | 說明 |
|------|------|
| `bible100_smart_ministry_survey_mbti` | MBTI **簡化版**（`schemaVersion: 2`，含向度平均與敘述；`mbtiType` 僅相容舊讀取） |
| `bible100_smart_ministry_survey_disc` | DISC 四向度**平均**（`schemaVersion: 2`） |
| `bible100_smart_ministry_survey_shape` | SHAPE 故事卡整合（`schemaVersion: 1`） |

**禁止**：與 `spiritual_health_scoring.js`、教會健康問卷、恩賜主線卷做**分數混合**或紅黃綠指標。詳見 **`ADVANCED_SELF_KNOWLEDGE_TOOLS.md`**。

---

## 5. 禁止事項（給開發者／Agent）

- 不得在新頁面建立另一套「人才主檔」集合作為正式來源。
- 不得為捷徑複製同一筆資料到兩種結構後**不維護同步**。
- 不得繞過 `SmartMinistryCanonical` 直接改寫 `bible100_smart_ministry_main` 內集合（除遷移與除錯腳本）。
- 不得在 dashboard 寫入正式業務資料（除非明示為管理操作）。

---

## 6. 遷移

- 首次載入相關頁面會執行 `migrateLegacyToCanonical()`，合併來源包含：`memberSystemData`、`bible100_main`、`bible100_smart_ministry_talents`、`smart_ministry_linking`。
- 遷移完成後會設定 `smart_ministry_canonical_migrated_v1`；若要強制重跑可清除該鍵後再載入（開發用）。

---

## 7. 測試情境（最低驗收）

1. 於 `registration.html` 註冊 → `bible100_smart_ministry_main.talents` 出現該 `talent_id`。
2. 於 `talent_skill_unified.html` 為該員連結技能 → `talent_skill` 筆數增加。
3. 於 `talent_ministry_matching.html` 配對 → `ministry_assignment` 增加。
4. 重新整理 `dashboard.html`，統計與摘要可反映上述資料。

---

## 8. 上雲與跨模組（預留）

- 本檔描述 **v1 本機 canonical** 形狀；若改為集中式資料庫與登入權限，見上層 **`docs/CLOUD_BAAS_AND_CROSS_MODULE.md`**（統一鍵、BaaS、跨模組分析策略）。

---

## 9. 版本與升級

- `schema_version` 目前為 **1**。
- 未來變更結構時：遞增版本號、提供遷移函式、於本文件記錄差異。
