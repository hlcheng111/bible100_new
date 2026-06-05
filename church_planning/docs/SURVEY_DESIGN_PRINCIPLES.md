# Church Planning Survey Design Principles

本文件是 `church_planning` 問卷、CTV 向量、配對與牧養覆核的單一原則文件。現有頁面可逐步接入；未接入前，本文不改變任何既有 `localStorage` key 或 HTML 工作流。

## 1. CTV Canonical 六維度

| Key | 維度 | 用途 |
| --- | --- | --- |
| P | Pastoral / Shepherding | 關懷、陪伴、牧養敏感度、人際承托 |
| S | Spiritual Gifts / Ministry | 屬靈恩賜、事奉傾向、呼召火花 |
| G | Governance / Administration | 治理、行政、流程、資源管理、責任承擔 |
| C | Culture / Alignment | 異象認同、文化契合、價值觀一致 |
| R | Relationship / Teamwork | 團隊協作、溝通、衝突處理、RACI 成熟度 |
| F | Faith Maturity / Theology | 靈命成熟、真理根基、神學反思、品格穩定 |

所有工具先輸出到 CTV，不直接作人事任命。CTV 是共同語言，不是屬靈身份判決。

## 2. 量尺標準

內部計算統一使用 `0-100`：

| 原量尺 | 轉換 |
| --- | --- |
| Likert 1-5 | `(value - 1) / 4 * 100` |
| Likert 1-6 | `(value - 1) / 5 * 100` |
| 0-4 | `value / 4 * 100` |
| 0-1 | `value * 100` |
| NCD /65 | `value / 65 * 100` |
| Percent | clamp 到 `0-100` |

跨工具比較只比較正規化後的 CTV 或相對排序，不把甲工具的紅黃綠門檻直接套到乙工具。

## 3. 工具到 CTV 的初版映射

| 工具 | CTV 映射 |
| --- | --- |
| RACI 角色反思 | R 0.55 / G 0.30 / P 0.15 |
| SMART 事工規劃 | G 0.45 / C 0.35 / R 0.20 |
| PDCA 行動迴圈 | G 0.45 / C 0.25 / R 0.30 |
| 信徒靈性健康 | F 0.50 / P 0.25 / R 0.25 |
| 教牧／領袖靈命調查 | F 0.35 / P 0.25 / R 0.20 / C 0.20 |
| 屬靈恩賜 | S 0.70 / F 0.15 / R 0.15 |
| 教會版 80/20 | G 0.45 / C 0.35 / R 0.20 |
| 文化契合度 | C 0.65 / F 0.20 / R 0.15 |
| DISC / MBTI | P 0.55 / R 0.35 / C 0.10 |

DISC / MBTI 只作溝通與壓力風格參考，confidence 預設低於靈命、服事歷史、RACI 與牧者覆核。

## 4. Validity 與牧養安全

Validity 的目的不是指控作假，而是標記資料可信度與牧養風險。

初版檢查：

- 同義題一致性
- 反向題矛盾
- 過度完美答案
- 作答時間異常短
- 證據數不足

輸出欄位：

- `consistencyScore`
- `socialDesirabilityRisk`
- `contradictionFlags`
- `lowEvidenceFlags`
- `responseQuality`
- `requiresReview`

報告措辭應使用「建議面談確認」「資料較薄」「需牧養覆核」，避免使用「造假」「不屬靈」「不適合服事」等標籤。

## 5. Matching Engine 原則

配對分數只提出可能性，不直接任命。

初版總分：

```text
FinalScore =
  0.40 * CTV_Cosine
+ 0.15 * GiftFit
+ 0.15 * AvailabilityFit
+ 0.10 * ExperienceFit
+ 0.10 * CultureFit
+ 0.10 * BurdenSafety
```

硬性阻擋條件：

- 必修訓練未完成
- 兒少／高風險角色但最低靈命成熟度不足
- 志工已標記此角色不可承擔

牧養覆核條件：

- validity 需要覆核
- 負擔安全偏低
- 高風險角色但 F 或 R 不足

## 6. Review Workflow

配對結果分為：

| 狀態 | 意義 |
| --- | --- |
| `explore` | 可邀請對話探索 |
| `trial` | 可設 1-3 個月試行 |
| `pastoral_review` | 有探索價值，但先牧養覆核 |
| `defer` | 暫緩，先補訓練、休息或觀察 |
| `blocked` | 硬性條件不足，不作推薦 |

正式安排前必須有人確認：

- 當事人意願
- 角色界線
- 休息與替補安排
- 試行檢核日期
- 牧者或事工負責人覆核紀錄

## 7. 實作位置

MVP 純函數位置：

- `src/ctv/types.ts`
- `src/ctv/normalize.ts`
- `src/ctv/mapping.ts`
- `src/validity/validityEngine.ts`
- `src/matching/matchingEngine.ts`
- `src/review/pastoralReview.ts`

這些模組不得直接讀寫 DOM 或 `localStorage`。頁面整合時由 UI adapter 負責把現有頁面結果轉成引擎輸入。
