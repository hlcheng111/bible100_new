# 跨模組資料契約 DATA_CONTRACT v0.1

> **版本**：0.1  
> **狀態**：草案 — 團隊可刪減／補充；**定稿前**新程式仍應盡量對齊本檔，避免名詞漂移。  
> **適用範圍**：`smart_ministry/` 與 `church_planning/` 之間的人材、教會健康、策略目標與三條「橋」資料。  
> **關聯文件**：[五階牧養路徑備忘](./FIVE_STAGES_SIDEBAR_DRAFT.md) · [Canonical 檔名與工程路線](./MODULE_CANONICAL_NAMES_AND_ENGINEERING_ROADMAP.md) · [**全站三層權限標準（總管／編輯／用家）**](./RBAC_THREE_TIERS_STANDARD.md)

---

## 一、為何需要這份契約

- **單一真相來源**：實體名稱、主鍵、欄位語意一致，後續問卷／演算法／頁面共用同一套型別或對照表。  
- **橋接可實作**：三條橋以「欄位對欄位」對照為準；匯入／匯出 JSON 有明確 schema。  
- **權限可落地**：敏感欄位先標籤化，UI 與同步層再依標籤篩選（見第五節）。

**與既有 HTML 的關係**：不重構既有問卷 DOM／`localStorage` key；新程式以 **adapter**（讀舊格式 → 寫入本契約之結構）逐步接軌。見 [MODULE](./MODULE_CANONICAL_NAMES_AND_ENGINEERING_ROADMAP.md) 維護備註。

---

## 二、敏感度標籤（全檔通用）

| 標籤 | 代碼 | 說明 |
|------|------|------|
| 公開 | `L0` | 可出現在公開儀表或匿名統計（已去識別）。 |
| 內部 | `L1` | 堂會／團隊內行政用途，不含牧養私密敘述。 |
| 牧養 | `L2` | 靈命、負荷、配對理由細節等，僅本人＋**指定牧者／關懷者**（需名單或角色）。 |
| 限制 | `L3` | 教牧調查專業版、可識別之倦怠／危機相關；**預設不**流入 Smart Ministry 聚合儀表。 |

後續 UI 與「橋」同步時：**預設只同步 L0／匯總後的 L1**；L2／L3 需明示同意與最小欄位原則。

---

## 三、實體與欄位（v0.1）

### 3.1 共用識別

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `schemaVersion` | `string` | 是 | 本契約版本，例如 `"0.1"`。 |
| `congregationId` | `string \| null` | 否 | 堂會／聯合堂體系內識別；單堂可固定一值或 `null`。 |

### 3.2 `Person`

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `personId` | `string` | 是 | L1 | 站內唯一；與實名對照表另存或哈希策略由部署決定。 |
| `congregationId` | `string \| null` | 否 | L1 | 所屬堂會。 |
| `displayName` | `string` | 否 | L1 | 顯示用；可用化名（見第七節）。 |
| `legalNameFlag` | `boolean` | 否 | L1 | `true` 表示 `displayName` 為實名；`false` 表示化名或部分隱藏。 |
| `basicProfile` | `object` | 否 | L1 | 信主年資、聯絡方式摘要等；細項可再展開 v0.2。 |
| `createdAt` / `updatedAt` | `string` (ISO 8601) | 否 | L1 | 稽核用。 |

### 3.3 `GiftProfile`

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `personId` | `string` | 是 | L1 | 外鍵 → `Person`。 |
| `scores` | `Record<string, number>` | 否 | L2 | 恩賜向度分數；鍵名與問卷題組對齊後鎖定（見下表）。數值建議量尺 **1–5**（李克特平均）或經標準化之 **0–100**，同一專案內應一致並註明。 |
| `topGiftIds` | `string[]` | 否 | L2 | 前三名恩賜 id，便於列表與配對。 |
| `updatedAt` | `string` | 否 | L1 | |

**目前計畫使用的恩賜鍵名列表（`scores` 之鍵）— v0.1 主線 demo**

以下為 **智慧事奉主問卷 demo**（`smart_ministry/talent_main_survey.html`）與 **配對 demo**（`matching_demo.js`）所採用的 **九向度** 英文鍵名（小寫蛇形，與程式一致）：

| 鍵名 | 簡述（中文） |
|------|----------------|
| `teaching` | 教導：解經、教學、使人明白真理。 |
| `shepherding` | 牧養關懷：陪伴、餵養、守望肢體。 |
| `worship` | 敬拜讚美：帶領或參與敬拜、以音樂／藝術敬拜神。 |
| `administration` | 治理／行政：組織、協調、使事工有序。 |
| `evangelism` | 傳福音：向未信者作見證、邀請人認識基督。 |
| `encouragement` | 勸勉／建造：鼓勵灰心者、以話語使人得力（與舊頁 `exhortation` 語意相近，見第十一節）。 |
| `serving` | 服事／執事：實際協助、接待、後勤。 |
| `hospitality` | 款待：接待客旅、營造歡迎氛圍。 |
| `discernment` | 辨別／洞見：察驗屬靈光景、分辨時機與需要。 |

**與既有 `spiritual_gifts.html` 的差異（不修改該檔）**：該頁使用八向度 **`teaching`, `evangelism`, `exhortation`, `mercy`, `serving`, `administration`, `giving`, `prophecy`**。若要將舊結果匯入本契約之 `GiftProfile`，請以 **adapter** 對照（例如 `exhortation` → `encouragement`），見第十一節「變更建議」。

### 3.4 `SkillProfile`

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `personId` | `string` | 是 | L1 | |
| `skills` | `Record<string, number \| boolean \| string>` | 否 | L2 | 技能／資源；細項 v0.2 可對照題目 id。 |
| `updatedAt` | `string` | 否 | L1 | |

### 3.5 `AvailabilityProfile`

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `personId` | `string` | 是 | L1 | |
| `capacityIndex` | `number` | 否 | L2 | 負荷指標（演算法與量尺另文件）。 |
| `weeklyHoursBand` | `string` | 否 | L2 | 例：`"0-2"`、`"3-5"`。 |
| `notes` | `string` | 否 | L2 | 備註（牧養用）。 |
| `updatedAt` | `string` | 否 | L1 | |

### 3.6 `BurdenExperience`

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `personId` | `string` | 是 | L1 | |
| `burdenTags` | `string[]` | 否 | L2 | 事工負擔／心志向度。 |
| `experienceYearsByMinistry` | `Record<string, number>` | 否 | L2 | 選填。 |
| `updatedAt` | `string` | 否 | L1 | |

### 3.7 `TalentTracking`（服事紀錄，單筆事件或期間）

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `trackingId` | `string` | 是 | L1 | |
| `personId` | `string` | 是 | L1 | |
| `roleId` | `string` | 否 | L1 | 外鍵 → `RoleDefinition`。 |
| `periodStart` / `periodEnd` | `string` | 否 | L1 | ISO 日期。 |
| `frequencyBand` | `string` | 否 | L2 | 例：每月次數區間。 |
| `feedbackSummary` | `string` | 否 | L2 | 同工回饋摘要。 |
| `updatedAt` | `string` | 否 | L1 | |

### 3.8 `RoleDefinition`

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `roleId` | `string` | 是 | L1 | |
| `congregationId` | `string \| null` | 否 | L1 | 若崗位屬全聯會則可空。 |
| `name` | `string` | 是 | L1 | |
| `weights` | `object` | 否 | L1 | 配對用權重，例如 `{ gifts: Record<string,number>, skills: ..., burdens: ... }`。 |
| `priorityTag` | `string` | 否 | L1 | 例：`"Y2026_FOCUS"`，由 **橋 2** 寫入。 |
| `experienceThreshold` | `string \| object` | 否 | L1 | 門檻描述或結構化門檻。 |
| `updatedAt` | `string` | 否 | L1 | |

### 3.9 `MatchResult`

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `matchId` | `string` | 是 | L1 | |
| `personId` | `string` | 是 | L2 | |
| `roleId` | `string` | 是 | L1 | |
| `score` | `number` | 是 | L2 | |
| `breakdown` | `Record<string, number>` | 否 | L2 | 分項分數（解釋用）。 |
| `suggestionTier` | `string` | 否 | L2 | 例：`strong` / `possible` / `stretch`。 |
| `createdAt` | `string` | 是 | L1 | |

### 3.10 `Invitation`（選用，事奉邀請流程）

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `invitationId` | `string` | 是 | L1 | |
| `personId` / `roleId` | `string` | 是 | L2 | |
| `status` | `string` | 是 | L2 | 例：`pending` / `accepted` / `declined` / `trial`。 |
| `respondedAt` | `string` | 否 | L2 | |
| `updatedAt` | `string` | 否 | L1 | |

### 3.11 `ChurchHealthProfile`（教會層，聚合）

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `congregationId` | `string` | 是 | L1 | |
| `period` | `string` | 否 | L1 | 例：報告季度 `2026-Q2`。 |
| `giftDistribution` | `Record<string, number>` | 否 | L0 | 恩賜分布（**不含 personId**）。 |
| `ministryGaps` | `object[]` | 否 | L1 | 缺口描述；元素不含可識別個資。 |
| `burnoutRiskIndex` | `number` | 否 | L1 | 聚合風險指標。 |
| `participationRate` | `number \| null` | 否 | L1 | 若可計算。 |
| `sourceSnapshotId` | `string` | 否 | L1 | 對應匯入批次 id，便於稽核。 |
| `updatedAt` | `string` | 否 | L1 | |

### 3.12 `SmartGoal`

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `goalId` | `string` | 是 | L1 | |
| `congregationId` | `string` | 是 | L1 | |
| `title` | `string` | 是 | L1 | |
| `relatedRoleIds` | `string[]` | 否 | L1 | 與 **橋 2** 對應崗位。 |
| `status` | `string` | 否 | L1 | 例：`draft` / `active` / `done`。 |
| `targetMetrics` | `object` | 否 | L1 | 數字目標（人數、小組數等）。 |
| `updatedAt` | `string` | 否 | L1 | |

### 3.13 `SpiritualHealthSummary`（橋 3 用 — 建議為**摘要**，非整份問卷）

| 欄位 | 型別 | 必填 | 敏感 | 說明 |
|------|------|------|------|------|
| `personId` | `string` | 是 | L2 | |
| `riskBand` | `string` | 否 | L3 | 例：`low` / `medium` / `high`（倦怠／孤立等）。 |
| `pastoralFlags` | `string[]` | 否 | L3 | 機器可讀標籤；**不**預設複製長文答案。 |
| `capacityAdjustmentHint` | `number \| string` | 否 | L2 | 對 `capacityIndex` 之調整建議（-1～+1 或枚舉）。 |
| `validUntil` | `string` | 否 | L2 | 過期後需重新評估。 |
| `updatedAt` | `string` | 否 | L1 | |

---

## 四、三條橋：欄位對欄位對照

### 橋 1：Smart Ministry → 教會健康／SWOT（僅 aggregate）

| 來源（smart_ministry） | 目標（church_planning） | 備註 |
|------------------------|-------------------------|------|
| `GiftProfile.scores` / `topGiftIds`（多筆 Person 匯總） | `ChurchHealthProfile.giftDistribution` | 僅計數／比例，**不含** `personId`。 |
| `BurdenExperience.burdenTags`（匯總） | `ChurchHealthProfile.ministryGaps` | 缺口敘事由策劃同工整理。 |
| `AvailabilityProfile.capacityIndex`、`TalentTracking`（匯總） | `ChurchHealthProfile.burnoutRiskIndex` | 指標定義需文件化；仍為堂會層單一數值或分級。 |
| `TalentTracking` 參與度（匯總） | `ChurchHealthProfile.participationRate` | 選填。 |

**流向**：`Church_Health_NCD_planning.html`、`swot-planning.html` 等頁面只消費 **`ChurchHealthProfile`** 與既有 SWOT 輸入，不帶入可識別個資列。

**同步方式（建議）**：匯出 **`church_health_snapshot.json`**（內含 `schemaVersion`、`congregationId`、`ChurchHealthProfile`）；或由同一瀏覽器讀共享儲存之**快照 key**（見第八節）。

---

### 橋 2：SMART 目標 → 崗位優先級

| 來源（church_planning） | 目標（smart_ministry） | 備註 |
|-------------------------|------------------------|------|
| `SmartGoal.goalId` / `title` | （可選）`RoleDefinition` 之 metadata | 僅連結用。 |
| `SmartGoal.relatedRoleIds` | `RoleDefinition.roleId` | 目標涵蓋之崗位。 |
| `SmartGoal.status` + `targetMetrics` | `RoleDefinition.priorityTag` | 例：啟用中目標寫入 `Y2026_FOCUS`；實作可對照表。 |

**同步方式**：匯出 **`smart_goals_export.json`**；Smart Ministry 匯入後更新對應 `RoleDefinition.priorityTag`（不覆寫 `weights` 本體，除非另有定案）。

---

### 橋 3：靈命健康 → 負荷與建議

| 來源（church_planning） | 目標（smart_ministry） | 備註 |
|-------------------------|------------------------|------|
| `SpiritualHealthSummary.riskBand` / `pastoralFlags` | `AvailabilityProfile.capacityIndex`（調整）或並存 `capacityAdjustmentHint` | **最小揭露**：優先同步摘要物件，不複製整份問卷。 |
| `SpiritualHealthSummary.capacityAdjustmentHint` | 個人報告文案／配對降權 | UI 顯示「牧養建議」，非自動拒絕服事（政策由堂會定）。 |
| 信徒／教牧問卷之長文 | **不**直接映射 | 由牧者整理後手動填入摘要或 L2 備註。 |

**同步方式**：僅限 **L2 授權** 之匯出檔 **`spiritual_summary_for_ministry.json`**（單人或多人在一檔需加密或離線傳遞）；或後端 API 帶身分驗證。

---

## 五、粗略權限表（角色 × 資料類型）

| 資料類型 | 會友本人 | 事工負責人 | 牧者／指定關懷者 | 教會策劃／長執（聚合） |
|----------|----------|------------|------------------|------------------------|
| `Person`（基本） | 讀寫己身 | 讀摘要 | 讀寫牧養範圍內 | 通常不讀個別 |
| `GiftProfile` / `SkillProfile` | 讀寫己身 | 讀（配對用） | 讀 | 僅統計 |
| `AvailabilityProfile` / `BurdenExperience` | 讀寫己身 | 讀部分 | 讀寫 | 僅統計 |
| `MatchResult` | 讀己身 | 讀相關崗位 | 讀 | 不讀 |
| `RoleDefinition` | 讀公開欄位 | 讀寫所屬事工 | 讀 | 讀；**可寫 priorityTag（橋 2）** 依治理決定 |
| `ChurchHealthProfile` | 不適用 | 不適用 | 讀摘要 | 讀寫 |
| `SmartGoal` | 不適用 | 可讀公開目標 | 可讀 | 讀寫 |
| `SpiritualHealthSummary` | 讀己身 | **預設不讀** | 讀寫 | **預設不讀明细** |

實際部署時應以堂會章程與個資政策為準；本表為工程預設。

---

## 六、TypeScript 型別參考（可複製到 `src/types/data-contract.v0.1.ts`）

以下僅為契約的機械化表達；**欄位以第三節為準**，型別可隨實作微調。

```typescript
/** bible100_new DATA_CONTRACT v0.1 — 與 docs/DATA_CONTRACT_v0.1.md 同步 */

export type Sensitivity = "L0" | "L1" | "L2" | "L3";

export interface DataEnvelope {
  schemaVersion: "0.1";
  congregationId?: string | null;
}

export interface Person extends DataEnvelope {
  personId: string;
  displayName?: string;
  legalNameFlag?: boolean;
  basicProfile?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface GiftProfile {
  personId: string;
  scores?: Record<string, number>;
  topGiftIds?: string[];
  updatedAt?: string;
}

export interface SkillProfile {
  personId: string;
  skills?: Record<string, number | boolean | string>;
  updatedAt?: string;
}

export interface AvailabilityProfile {
  personId: string;
  capacityIndex?: number;
  weeklyHoursBand?: string;
  notes?: string;
  updatedAt?: string;
}

export interface BurdenExperience {
  personId: string;
  burdenTags?: string[];
  experienceYearsByMinistry?: Record<string, number>;
  updatedAt?: string;
}

export interface TalentTracking {
  trackingId: string;
  personId: string;
  roleId?: string;
  periodStart?: string;
  periodEnd?: string;
  frequencyBand?: string;
  feedbackSummary?: string;
  updatedAt?: string;
}

export interface RoleDefinition {
  roleId: string;
  congregationId?: string | null;
  name: string;
  weights?: {
    gifts?: Record<string, number>;
    skills?: Record<string, number>;
    burdens?: Record<string, number>;
  };
  priorityTag?: string;
  experienceThreshold?: string | Record<string, unknown>;
  updatedAt?: string;
}

export interface MatchResult {
  matchId: string;
  personId: string;
  roleId: string;
  score: number;
  breakdown?: Record<string, number>;
  suggestionTier?: string;
  createdAt: string;
}

export interface ChurchHealthProfile {
  congregationId: string;
  period?: string;
  giftDistribution?: Record<string, number>;
  ministryGaps?: Array<Record<string, unknown>>;
  burnoutRiskIndex?: number;
  participationRate?: number | null;
  sourceSnapshotId?: string;
  updatedAt?: string;
}

export interface SmartGoal {
  goalId: string;
  congregationId: string;
  title: string;
  relatedRoleIds?: string[];
  status?: string;
  targetMetrics?: Record<string, unknown>;
  updatedAt?: string;
}

export interface SpiritualHealthSummary {
  personId: string;
  riskBand?: string;
  pastoralFlags?: string[];
  capacityAdjustmentHint?: number | string;
  validUntil?: string;
  updatedAt?: string;
}
```

---

## 七、香港／聯合教會環境備註（審稿用）

- **實名與化名**：`Person.legalNameFlag` 與 `displayName` 支援「公開顯示化名、內部實名另表」；跨堂匯總時應去識別。  
- **堂會層級**：`congregationId` 未來若對應聯合內多堂點，**橋 1** 快照應註明範圍（單堂 vs 聯合匯總），避免誤用他堂數據。  
- **個資與 PDPO**：敏感欄位以 L2／L3 預設；對外分享僅 L0 或書面同意後之摘要。  
- **牧養優先**：橋 3 之自動調整僅作**建議**，不宜取代牧者判斷。

---

## 八、建議的儲存／匯出約定（實作可選）

| 鍵／檔名 | 內容 |
|----------|------|
| `bible100:dataContractVersion` | `"0.1"` |
| `bible100:churchHealthSnapshot:{congregationId}` | 最新 `ChurchHealthProfile` JSON 字串 |
| `bible100:smartGoals:{congregationId}` | `SmartGoal[]` 或匯出檔 |
| 匯出檔 `church_health_snapshot.json` | `schemaVersion` + `ChurchHealthProfile` |
| 匯出檔 `smart_goals_export.json` | `SmartGoal[]` |
| 匯出檔 `spiritual_summary_for_ministry.json` | `SpiritualHealthSummary[]`（嚴格權限） |

---

## 九、修訂與定稿

| 版本 | 日期 | 摘要 |
|------|------|------|
| 0.1 | 2026-04-14 | 初稿：實體、三橋 mapping、權限表、TS 參考、在地備註。 |
| 0.1.1 | 2026-04-14 | `GiftProfile`：補列九向度鍵名表；與 `spiritual_gifts.html` 對照說明；新增第十一節變更建議。 |
| 0.1.2 | 2026-04-14 | 新增第十二節「跨模組 ID 映射 v0.1」：`member_id` 主鍵共識、storage key 對照與 adapter 規範。 |

定稿後請更新 `schemaVersion`、本表與程式中的 `schemaVersion` 常數一致。

---

## 十一、變更建議（GiftProfile／恩賜鍵 v0.2 草案）

> **僅供討論**：未取代第三節既有欄位定義；定案後再併入正文並 bump 版本。

1. **新舊問卷並存**：保留 `exhortation`（舊鍵）與 `encouragement`（新鍵）二選一之 **alias 表**於 adapter，或規定新問卷統一只用 `encouragement`，舊資料匯入時轉鍵。  
2. **補齊保羅式向度**：若需與 `spiritual_gifts.html` 完全對齊，可增鍵 `mercy`、`giving`、`prophecy`，與九向度並列或擇一為 canonical — 需牧長與題庫定案，避免同一恩賜兩個鍵。  
3. **量尺統一**：若部分頁面存 1–5、部分存 0–100，建議在 `GiftProfile` 增選填欄位 `scoreScale: "likert_1_5" \| "normalized_0_100"`，或在匯出 JSON 時一律轉成同一量尺。  
4. **`shepherding` vs `mercy`**：牧養與憐憫在實務題目上可能重疊；v0.2 可定義題目歸屬或允許 `scores` 內加註 `sourceSurveyId`（選填）。  
5. **橋 1 前端匯出原型**：`smart_ministry/export_talent_stats_demo.html` 產生之 JSON（含 `avgGiftScores`、`topGiftFrequency`、`peopleCount`、`demoSource`）為 **DEMO 聚合**，與正式 `ChurchHealthProfile.giftDistribution`（§3.11）之對應待定：正式匯入建議補 `congregationId`、`period`、`sourceSnapshotId`，並確認 `giftDistribution` 存「比例」或「平均分」之單一語意，避免與本頁之 `avgGiftScores` 並存時混淆。

---

## 十、給 Cursor／開發者的第一句話（可貼專案說明）

> 跨模組資料結構請以 `docs/DATA_CONTRACT_v0.1.md` 為準；新增 JS/TS 請使用第六節型別或對齊第三節欄位名。**不要**在未經討論下新增實體或重新命名主鍵。既有問卷頁以 adapter 接契約，不強制一次重構。

---

## 十二、跨模組 ID 映射 v0.1（最小共識）

> 目標：先統一語言，不一次重構所有資料庫。  
> 原則：**跨模組的人員唯一鍵統一為 `member_id`**；各模組可保留既有儲存 key，但需提供映射欄位。

### 12.1 人員主鍵共識

| 場景 | v0.1 規定 | 備註 |
|------|-----------|------|
| 跨模組交換（Smart Ministry / Church Ministry / School Management / Church Planning） | `member_id` | 交換 JSON、橋接 payload 一律帶 `member_id`。 |
| Smart Ministry 內部既有 `personId` / `talent_id` | 視為 `member_id` 的別名（alias） | 新程式應至少保存 `member_id`，舊欄位可並存過渡。 |
| Church/School 既有本地 id | 保留本地 id + 新增 `member_id` 映射 | 不要求立即改 storage key。 |

### 12.2 現況 storage key 對照（巡檢盤點）

| 模組 | 目前主 key（localStorage） | v0.1 位置 | 建議 |
|------|----------------------------|----------|------|
| Smart Ministry（canonical） | `bible100_smart_ministry_main` | 主線資料源 | 保持不變，逐步補齊 `member_id`。 |
| Smart Ministry（問卷原型） | `smart_ministry_gift_profiles` | 橋 1 輕量來源 | 視為 GiftProfile 快照陣列。 |
| Church Ministry | `churchMasterDatabase` | 既有獨立庫 | 新增 member 對照欄，不急改 key。 |
| School Management | `schoolMasterDatabase` | 既有獨立庫 | 已有 member/volunteer 關聯概念，對齊 `member_id` 命名。 |
| Church Core Linking（舊） | `memberSystemData` 等多 key | 過渡層 | 保留讀取能力，新增映射 adapter。 |
| Church Planning（工具資料） | `chp2026-*` 系列 | 規劃與報告資料 | 屬堂會層聚合，避免直接存個人敏感欄。 |

### 12.3 Adapter 最小規範（過渡期）

1. **輸入容錯**：接受 `member_id`、`personId`、`talent_id`，讀取時轉成 `member_id`。  
2. **輸出一致**：跨模組輸出 JSON 必含 `member_id`（即使同時保留舊欄位）。  
3. **雙寫過渡**：必要時同時寫入 `member_id` + 舊欄位，直到舊頁完成升級。  
4. **稽核欄位**：建議橋接 payload 加上 `schemaVersion`、`generatedAt`、`sourceKey`。

### 12.4 驗收條件（DoD）

- 任一跨模組橋接 payload 可直接找到唯一 `member_id`。  
- 新增或更新人員資料時，不再只有單一模組私有 id。  
- 文件與實作中的命名（`member_id` / `personId`）有明確 alias 規則，不再口頭約定。
