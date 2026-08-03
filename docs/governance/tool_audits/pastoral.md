# 領袖健康診斷 · 深研驗收卡 v1.0

tool_id: pastoral | 類型: T1 | Sprint: S2 | 日期: 2026-08-02 | 成熟度: **Gold**（UX 實測 PATCH 已落地）

## 0. 一句話定位

答「長執／牧者是否在耗盡邊緣」；對象：長執／同工；**30 題 / 約 15 分鐘**；煙霧探測，**不作**任免或組織績效考核。

## 1. 專業對標

| 項目 | 原則 | 本工具實作 | 差距 |
|------|------|------------|------|
| 模型 | 七維 + A–F 交叉警訊 | pastoral_pack + riskRuleHit | OK |
| 算法 | 維度均值 + 六類 flags | THRESHOLDS, FLAG_DESCRIPTIONS | OK |
| 教會化 | 陪伴非考核 | Tab① 隱私承諾（2026-08-02） | OK |
| 鏈路 | spiritual 上游 | loadUpstreamChain | OK |

## 2. 四 Tab 現況評分

| 區 | 項 | 結果 |
|----|-----|------|
| B | Tab 名 ①～④ | Pass P0 |
| B | 3 分鐘入門 + 隱私承諾 | **Pass P0**（UX 2026-08-02） |
| C | 30 題真實題幹 | **Pass P1**（pack 同步） |
| C | 兩節問卷 + 進度 + 本機暫存 | **Pass P1**（UX 2026-08-02） |
| C | Likert 錨點 | **Pass P1** |
| D | report-heart + FLAG_SCENE_COPY | **Pass P1**（UX 2026-08-02） |
| D | loadDemoReport | Pass |
| E | Tab④ 長執決策桌 | 部分 P1 |
| F | file:// | Pass |

## 3. 教會情境檢核

- 30 題分 A–F 六類；交叉警訊用牧養場景語（非臨床術語堆疊）。
- HITL：數據僅供警示，須回到牧長一對一。

## 4. 報告是否助人

- report-heart（現況／風險／本週一小步）+ 七維橫條 + 場景化警訊列表。

## 5. PATCH 清單

| 優先 | 檔案 | 區塊 | 狀態 |
|------|------|------|------|
| P0 | Church_Governance_pastoral_health.html | Tab① 隱私承諾 | ✅ 2026-08-02 |
| P1 | pastoral_acs_shell.js | 兩節 + 進度 + draft | ✅ 2026-08-02 |
| P1 | pastoral_pack.js | 真實題幹 + FLAG_SCENE_COPY + micro_step | ✅ 2026-08-02 |
| P1 | pastoral_health_viz.js + acs_report_gold.js | report-heart + 場景警訊 | ✅ 2026-08-02 |
| P1 | pastoral_pastoral_desk_content.js | Tab④ 對齊 | 待做 |

## 6. 文案包

Tab① 隱私承諾：

```html
<p class="acs-privacy-promise"><strong>隱私承諾：</strong>本測試結果<strong>僅限個人與同行牧者參考</strong>，預設只留本機，<strong>絕不公開作組織績效考核、任免或排名依據</strong>。</p>
```

## 7. 鏈路與工程

- 上游：spiritual（可選）
- pack：`pastoral_pack.js` · shell：`pastoral_acs_shell.js`
- draft key：`bible100_pastoral_survey_draft`

## 8. 驗收結論

- **Gold** — UX 總均 4.2；P0/P1 已落地
- 牧者簽核：待 R2 評審

## 9. 多 AI 評審匯總

| 角色 | 總評 | 必改 |
|------|------|------|
| R1 | 待填 | |
| R2 | 待填 | |
| R3 | 待填 | |
| R4 | 待填 | |

## 10. UX 實用性檢測（外站 AI · 2026-08-02）

| 區塊 | 均分 | 最低題 |
|------|------|--------|
| A 進入前 | 4.5 | A3 |
| B 填答中 | 4.2 | B3 |
| C 報告后 | 4.0 | C3 |
| D 輔導延續 | 4.2 | D1 |
| **總均** | **4.2** | |

**Top 3 阻礙 → PATCH 對應**

1. 30 題心理負擔 + 怕被貼標 → ✅ Tab① 隱私承諾 P0 + 兩節問卷 P1
2. Likert 政治正確選中間 → ✅ 錨點說明 P1
3. burnout 警訊太術語 → ✅ FLAG_SCENE_COPY + report-heart P1

**憲章對標**：專業 4 · 情境 5 · 助人 4 · 建議 **Gold**

**給工程一句話**：Tab① 行政考核保證已落地；Tab③ 警訊改牧養現場對話。
