# 信徒靈命健康 · 深研驗收卡 v1.2

tool_id: spiritual | 類型: T1 | Sprint: S1-1 | 日期: 2026-08-02 | 成熟度: **Silver**（UX 實測 PATCH 已落地）

## 0. 一句話定位

答「我與神、與教會、與人相處的靈命輪廓如何」；對象：全會友／小組；約 **13 題 / 10 分鐘**；**不作**排名、任免或奉獻公開比较。

## 1. 專業對標

| 項目 | 原則 | 本工具實作 | 差距 |
|------|------|------------|------|
| 模型 | 五域靈命自覺 | spiritual_pack 五 dim + 13 Likert | OK |
| 算法 | 維度均值 + 門檻 + flags | THRESHOLDS, FLAG_DESCRIPTIONS | OK |
| 教會化 | 陪伴非考核 | Tab① 免責 + 隱私承諾（2026-08-02） | OK |
| 鏈路 | 微型起點 → urgent | Tab① + 報告 CTA | OK |

## 2. 四 Tab 現況評分

| 區 | 項 | 結果 |
|----|-----|------|
| B | Tab 名 ①～④ | **Pass P0** |
| B | 3 分鐘入門 + 五維卡 | **Pass P0** |
| B | Tab① 隱私承諾（奉獻／長執） | **Pass P0**（2026-08-02 UX） |
| C | 13 題 Likert + 行為情境題幹 | **Pass P1**（2026-08-02 UX） |
| C | Likert 錨點說明 | **Pass P1**（2026-08-02 UX） |
| D | loadDemoReport | Pass |
| D | report-heart 三句 + 本週一小步 | **Pass P1**（2026-08-02 UX） |
| E | Tab④ 動態 desk | 部分 P1 |
| F | file:// | Pass |

## 3. 教會情境檢核

- q13 奉獻：Tab① 隱私承諾 + 題幹「僅供私人自覺」；Tab② 錨點區重申不上報。
- H1 已統一 registry「信徒靈命健康」，副標「五維儀 · 13 題快評」。

## 4. 報告是否助人

- viz + report-heart（現況／風險／**本週一小步**）+ → urgent。
- heart 現況句改為最弱維度 + 非評判語氣（UX C2/C3）。

## 5. PATCH 清單

| 優先 | 檔案 | 區塊 | 狀態 |
|------|------|------|------|
| P0 | Church_Governance_spiritual_health.html | Tab 名 | ✅ |
| P0 | 同上 | Tab① 內容 + 隱私承諾 | ✅ 2026-08-02 |
| P0 | 同上 | title/H1 | ✅ |
| P1 | spiritual_pack.js | 行為情境題幹 + micro_step | ✅ 2026-08-02 |
| P1 | spiritual_acs_shell.js | Likert 錨點 | ✅ 2026-08-02 |
| P1 | acs_report_gold.js | buildSpiritualReportHeart | ✅ 2026-08-02 |
| P1 | spiritual_pastoral_desk_content.js | Tab④ 對齊 KSA 結構 | 待做 |

## 6. 文案包

Tab① 隱私承諾（P0）：

```html
<p class="acs-privacy-promise"><strong>隱私承諾：</strong>本數據預設<strong>只留本機、僅供個人自覺</strong>，不作奉獻金額核對、事奉升降或長執會行政考核依據。</p>
```

## 7. 鏈路與工程

- 上游：無（鏈路起點）
- 下游：urgent → raci → 戰情室
- pack：`spiritual_pack.js` · shell：`spiritual_acs_shell.js`
- CTV：P, F

## 8. 驗收結論

- **Silver** — P0 全過；UX 三項 P1 已落地
- 下一工具：**urgent**
- 牧者簽核：待 R2 評審

## 9. 多 AI 評審匯總

| 角色 | 總評 | 必改 |
|------|------|------|
| R1 | 待填 | |
| R2 | 待填 | |
| R3 | 待填 | |
| R4 | 待填 | |

## 10. UX 實用性檢測（外站 AI · 2026-08-02）

來源：`prompts/UX_PRACTICAL_TEST_MASTER.md` · 身份：教會同工／小組長

| 區塊 | 均分 | 最低題 |
|------|------|--------|
| A 進入前 | 4.25 | A3 |
| B 填答中 | 4.0 | B3 |
| C 報告后 | 3.8 | C3 |
| D 輔導延續 | 4.0 | D3 |
| **總均** | **4.0** | |

**Top 3 阻礙 → PATCH 對應**

1. 奉獻題戒心（長執考核）→ ✅ Tab① 隱私承諾 P0
2. Likert 錨點易選中間分 → ✅ Tab② 錨點說明 + 1/5 標籤 P1
3. 報告偏抽象大道理 → ✅ report-heart 現況句 + micro_step P1

**憲章對標**：專業 4 · 情境 4 · 助人 4 · 建議 Silver（隱私字眼已強化）

**給工程一句話**：A2 隱私承諾已落地；C4 行動已縮至「本週一小步」。
