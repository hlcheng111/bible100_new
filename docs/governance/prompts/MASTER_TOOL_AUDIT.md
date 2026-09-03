# Bible100 · 教會規劃工具 ACS 深研（主提示詞 · 精簡版）

> **萬用版（含 R1～R4 評審）**：請用 `UNIVERSAL_TOOL_AUDIT_AND_REVIEW.md`  
> **Cursor Skill**：`.cursor/skills/bible100-planning-tool-audit/SKILL.md`

產出 **tool audit 驗收卡**（Markdown §0～§8），**不要改程式**；改動只寫 §5 PATCH 表。

## 金標

- Tab① `church_planning/alda-leadership-assessment.html`
- Tab② `church_planning/Church_Governance_SWOT_matrix.html`
- Tab③④ `church_planning/ministry-competency-assessment.html`

## 本工具 metadata（替換 {{…}}）

```
tool_id: {{TOOL_ID}}
正式名稱: {{LABEL}}
類型: {{TYPE}}
HTML: church_planning/{{PATH}}
pack: church_planning/js/tool_packs/{{TOOL_ID}}_pack.js
Phase: {{PHASE}}
CTV: {{CTV}}
file://: file:///C:/Users/hlche/.cursor/bible100_new/church_planning/{{PATH}}
```

## 用字（違反列 P0）

見 `docs/governance/PLANNING_TOOL_COPY_UI_DICTIONARY_V1.md`

## 必讀

1. HTML 四 Tab
2. pack / shell JS
3. `planning_phase_config.js`
4. `assessment_coaching_shell.css`

## 類型附錄（擇一貼在文末）

**T1**：每題→維度→CTV；Likert 錨點；path_cards explore/employ。

**T2**：RunStore 上下游；算法；覆寫；Fallback L1/L2/L3；POST_COMPLETE_CTA。

**T4 RACI**：路線圖 5 步；長執手冊；Plan/Do。

**T5 鏈路**：swot→smart→kpiokr→pdca 欄位一致與 vector 傳遞。

## 輸出

複製 `tool_audits/_TEMPLATE_TOOL_AUDIT.md` 結構填滿。
