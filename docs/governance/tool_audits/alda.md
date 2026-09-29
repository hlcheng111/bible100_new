# ALDA 十二使徒領導力 · 深研驗收卡

tool_id: alda | 類型: T1 | Sprint: S4 | 日期: 2026-08-02 | 成熟度: Silver

## 0. 一句話定位

答「同工在事奉生命週期中的帶領節奏與四軸成長輪廓」；對象：執事／小組長／長執；約 20 分鐘；不作任免、改選或行政考核。

## 5. PATCH 清單（UX 實測後）

| 優先 | 檔案 | 區塊 | 改為 | 狀態 |
|------|------|------|------|------|
| P0 | alda-leadership-assessment.html | Tab① | 強化免責：不作長執改選或行政考核 | ✅ |
| P1 | alda_pack.js + HTML Tab② | 迫選 | 四節＋白話小組長提示＋draft＋進度 | ✅ |
| P1 | alda_lifecycle_viz.js + acs_report_gold.js | Tab③ | 牧養陪伴表＋去企業語 report-heart | ✅ |

## 8. 驗收結論

- **Gold → Silver+（UX 後可衝 Gold）**
- 專業忠實度 4 · 教會情境化 4 · 結果助人 4
- 側欄：正式

## 10. UX 實測（2026-08-02）

| 區塊 | 均分 | 最低 |
|------|------|------|
| A 進入前 | 4.25 | A2 |
| B 填答中 | 3.75 | B2 |
| C 報告后 | 4.0 | C1 |
| D 輔導延續 | 4.0 | D1 |
| **總均** | **4.0** | |

**Top 阻礙：** 16 題迫選心理壓力；20 分鐘略重；Tab③ 術語像企業評鑑。

**已落地 PATCH：** Tab① 免責粗體；Tab② 四節＋`QUESTION_PLAIN_LEADS`＋`bible100_alda_survey_draft`；Tab③ `growthCompanionTable`＋`buildAldaReportHeart` 白話＋`micro_step`。

**給主工程一句話：** Tab① 需更強力保證不作行政考核；Tab② 迫選加日常教會情境；Tab③ 瓶頸表改牧養陪伴指引。→ 已併入本卡 PATCH。
