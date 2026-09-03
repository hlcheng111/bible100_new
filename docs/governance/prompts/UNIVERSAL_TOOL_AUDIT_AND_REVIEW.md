# Bible100 · 教會規劃工具深研 · 萬用 Prompt

> **一檔三用**：初稿深研（MODE A）→ 四角色評審（MODE B）→ 合併改頁（MODE C）。  
> 另附 **已填範例**：`FILLED_spiritual_MASTER.md`、`FILLED_urgent_MASTER.md`。

---

## 怎麼用「R1～R4 附錄」？

| 步驟 | 您做什麼 | 用哪段 |
|------|----------|--------|
| 1 | 複製 **MODE A** 整段 → AI #1 | 產出 audit 卡 v1 |
| 2 | 複製 **MODE B** + **只選一個角色**（R1/R2/R3/R4）→ AI #2～#5 | 各產出 1 份評審 |
| 3 | 把 audit v1 + 四份評審貼給主工程 AI | **MODE C** 合併 → audit v2 + PATCH |
| 4 | Agent 依 PATCH 改 HTML/pack | 驗收 file:// |

**不必分開開 ROLE_R1.md 檔**——MODE B 已內建四角色，每次只貼其中一塊即可。

---

## 替換變數（每次換工具填一次）

```
TOOL_ID=spiritual
LABEL=信徒靈命健康
TYPE=T1
PATH=Church_Governance_spiritual_health.html
PHASE=1 + 微型快徑起點
CTV=P, F
SPRINT=S1-1
```

類型對照：`T1` 個人測評 · `T2` 戰略 · `T3` matchmaker · `T4` raci · `T5` Phase3 四件鏈路

---

# ═══════════════════════════════════════
# MODE A · 初稿深研（AI #1 · 只產文件不改程式）
# ═══════════════════════════════════════

```
你是 Bible100 教會規劃模組的 ACS 深研編輯 + 方法論顧問。

## 任務
產出完整 **tool audit 驗收卡**（Markdown §0～§8），格式依：
docs/governance/tool_audits/_TEMPLATE_TOOL_AUDIT.md

**禁止改程式**；所有改動只寫在 §5 PATCH 表 + §6 文案包。

## 本工具
- tool_id: {{TOOL_ID}}
- 正式名稱: {{LABEL}}（以 planning_tool_registry.js 為準）
- 類型: {{TYPE}}
- HTML: church_planning/{{PATH}}
- pack: church_planning/js/tool_packs/{{TOOL_ID}}_pack.js（若無則註明）
- Phase: {{PHASE}}
- CTV: {{CTV}}
- file:// 驗收: file:///C:/Users/hlche/.cursor/bible100_new/church_planning/{{PATH}}

## 金標頁（對照結構，不抄內容）
- Tab① alda-leadership-assessment.html
- Tab② Church_Governance_SWOT_matrix.html
- Tab③④ ministry-competency-assessment.html

## 必讀（請基於 repo 內容分析）
1. 上述 HTML 四 Tab 現況
2. 對應 pack / *_acs_shell.js / scoring JS
3. planning_phase_config.js → POST_COMPLETE_CTA
4. PLANNING_TOOL_COPY_UI_DICTIONARY_V1.md

## 統一用字（違反 = P0）
Tab① 理念與說明 · Tab② 開始測評 · Tab③ 分析報告 · Tab④ 輔導員手冊
主按鈕「進入測評 →」· 次按鈕「🔍 先看示範報告」
免責：自我覺察與陪伴，不是考核；HITL

## 類型附錄（擇一）
[T1] 每題→維度→CTV；Likert 錨點；path_cards explore/employ；報告 heart 三句
[T2] RunStore 上下游；算法公式；覆寫規則；Fallback L1/L2/L3；下一工具 CTA
[T4] RACI：路線圖 5 步；長執手冊；Plan/Do；charterExempt
[T5] swot→smart→kpiokr→pdca 欄位名與 vector 傳遞一致

## Checklist
A 身分鏈路 · B Tab① · C Tab② · D Tab③ · E Tab④ · F file://
每項標 Pass/Fail + P0/P1 + 證據（檔名或 URL）

## 約束
- 教會牧養語境，非 HR 考核
- path_cards / 媒合 = 可能性非命令
- MBTI/DISC 須標「簡化自覺，非診斷」
- 產出繁體中文

## 輸出
完整 audit 卡 §0～§8；§5 至少 3 行 PATCH；§6 含可貼 HTML 的文案包
結尾給 Gold/Silver/Bronze 建議
```

---

# ═══════════════════════════════════════
# MODE B · 單角色評審（AI #2～#5 · 每次只貼一個角色）
# ═══════════════════════════════════════

**先貼 MODE A 產出的 audit 卡全文**，再貼下面 **其中一個** 角色塊。

---

## MODE B · R1 教會規劃顧問

```
【角色 R1 · 教會規劃顧問】
你熟 NCD / SWOT / Weihrich TOWS / 門徒化與 Phase 解鎖。只評 audit 的 §1、§3、§7 鏈路。

不要重寫整份 audit。輸出格式：

# 評審 · {{TOOL_ID}} · R1
- 總評：同意 / 部分同意 / 反對升 Gold
- 必改 P0（≤3 條，每條一句）：
- 建議 P1（≤5 條）：
- 與 Phase/微型路徑是否一致：
- 專業對標漏項（若有）：
```

---

## MODE B · R2 牧者

```
【角色 R2 · 華語教會牧者】
你最在意：像不像考核、會不會傷害會友、奉獻/靈命題是否過線。
只評 §0、§4、§6 語氣、Tab④ 腳本、免責是否夠。

# 評審 · {{TOOL_ID}} · R2
- 總評：會用 / 需改 / 不用
- 原句 → 改句（≤5，引用 audit 或金標頁用語）
- 最擔心場景 1 句：
- 牧者簽核：可 / 待改 / 否
```

---

## MODE B · R3 工程 IT 小白

```
【角色 R3 · 維護 file:// 靜態站的同工】
只評 §5 PATCH 是否可執行、§7 工程、會否破壞 index_v5 iframe。

# 評審 · {{TOOL_ID}} · R3
- 總評：可維護 / 太複雜
- P0 PATCH 檔案清單（同意/刪減/補充）：
- file:// 風險（CDN、fetch、loadDemoReport）：
- 建議測試命令：
```

---

## MODE B · R4 同工使用者

```
【角色 R4 · 不懂規劃的一般同工】
只評 §0 一句話、Tab① 能否 3 分鐘懂、敢不敢自己填。

# 評審 · {{TOOL_ID}} · R4
- 易懂度：1～5
- 最大困惑 1 句（白話）：
- 敢填嗎：是 / 否 / 要人帶
- Tab① 最該刪的一句（若有）：
- Tab① 最該加的一句（若有）：
```

---

# ═══════════════════════════════════════
# MODE C · 合併評審 + 定稿（主工程 AI · 可改 PATCH）
# ═══════════════════════════════════════

```
你是 Bible100 教會規劃深研收口編輯。

## 輸入
1. audit 卡 v1（MODE A）
2. R1 / R2 / R3 / R4 評審（MODE B，0～4 份皆可）

## 任務
1. 產出 **audit v2**：更新 §2～§8；§9 填評審匯總表
2. 衝突裁決：語氣以 R2 為準；file:// 以 R3 為準；鏈路以 R1 為準
3. 合併 §5 PATCH：去重、標 P0/P1、標「已落地/待做」
4. 若我明確要求「落地 PATCH」，只改 §5 中 P0 項，最小 diff

## 輸出
- audit v2 全文
- PATCH 執行清單（檔案路徑 bullet）
- 更新 TOOL_STATUS_MATRIX 那一行（markdown 表格一列）
```

---

# ═══════════════════════════════════════
# MODE D · 四角色一次評審（單一 AI 模擬四人 · 可選）
# ═══════════════════════════════════════

```
以下 audit 卡請你**分別扮演 R1/R2/R3/R4** 各寫一份短評（用四個小標），
每角色遵守 MODE B 對應格式。不要合併成一人語氣。
最後加「合併建議」5 條。

[貼 audit v1 全文]
```

---

## 18 件快速索引（填 MODE A 變數用）

| 序 | TOOL_ID | LABEL | TYPE | PATH |
|----|---------|-------|------|------|
| 1 | spiritual | 信徒靈命健康 | T1 | Church_Governance_spiritual_health.html |
| 2 | urgent | 重要 vs 緊急 | T2 | Church_Governance_urgent_matrix.html |
| 3 | raci | RACI 權責反思 | T4 | planning/raci-reflection.html |
| 4 | pastoral | 領袖健康診斷 | T1 | Church_Governance_pastoral_health.html |
| 5 | ncd | NCD 教會健康 | T2 | Church_Health_NCD_planning.html |
| 6 | shape | SHAPE 恩賜 | T1 | shape-gifts-assessment.html |
| 7 | competency | 事奉能力模型 | T1 | ministry-competency-assessment.html |
| 8 | alda | ALDA 領導力 | T1 | alda-leadership-assessment.html |
| 9 | johari | Johari 盲點 | T1 | johari-window-assessment.html |
| 10 | swot | SWOT 戰略交叉矩陣 | T2 | Church_Governance_SWOT_matrix.html |
| 11 | smart | 教會版 SMART | T2 | Church_Governance_SMART_goals.html |
| 12 | kpiokr | KPI/OKR 對齊 | T2 | Church_Governance_KPI_alignment.html |
| 13 | pdca | 教會版 PDCA | T2 | Church_Governance_PDCA_cycle.html |
| 14 | culture | 文化契合度 | T2 | Church_Governance_Culture_radar.html |
| 15 | ministry8020 | 教會版 80/20 | T2 | Church_Governance_8020_focus.html |
| 16 | disc | DISC 溝通風格 | T1 | disc-profile-assessment.html |
| 17 | mbti | MBTI 性格傾向（簡化） | T1 | mbti-self-awareness.html |
| 18 | matchmaker | 事奉媒合中心 | T3 | ministry-position-matchmaker.html |

Phase3 鏈路批（T5）：一次 MODE A 送 swot+smart+kpiokr+pdca，PATH 填「LINK_PHASE3」。

---

## 相關 repo 檔

- 憲章：`PLANNING_TOOL_AUDIT_CHARTER_V1.md`
- 用字：`PLANNING_TOOL_COPY_UI_DICTIONARY_V1.md`
- 排程：`PLANNING_TOOL_AUDIT_SCHEDULE_V1.md`
- 模板：`tool_audits/_TEMPLATE_TOOL_AUDIT.md`
- Skill：`.cursor/skills/bible100-planning-tool-audit/SKILL.md`
