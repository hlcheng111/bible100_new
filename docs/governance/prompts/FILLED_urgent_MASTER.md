# 重要 vs 緊急 · MASTER 深研提示詞（已填好 · S1 第 2 件）

> 複製下方整段給 AI #1；評審時再加 `prompts/ROLE_R1～R4` 附錄。

---

# Bible100 · 教會規劃工具 ACS 深研（單工具）

## 你的任務
產出 **tool audit 驗收卡**（Markdown §0～§8），不得省略 §5 PATCH 與 §6 文案包。**不要改程式**。

## 金標
- Tab① `church_planning/alda-leadership-assessment.html`
- Tab② `church_planning/Church_Governance_SWOT_matrix.html`
- Tab③ `church_planning/ministry-competency-assessment.html#report`
- Tab④ 同上 coaching

## 本工具 metadata
```
tool_id: urgent
正式名稱: 重要 vs 緊急（registry label）
類型: T2（戰略／治理 · Eisenhower 四象限）
HTML: church_planning/Church_Governance_urgent_matrix.html
pack: church_planning/js/tool_packs/urgency_pack.js
shell: church_planning/js/urgency_acs_shell.js
Phase: advanced（微型快徑第 2 步 · 接 spiritual 之後）
CTV: G, F
blurb: Eisenhower 四象限 · 14 題 · F 軸
file://: file:///C:/Users/hlche/.cursor/bible100_new/church_planning/Church_Governance_urgent_matrix.html
```

## 必讀
1. `Church_Governance_urgent_matrix.html` 四 Tab（現 Tab 名可能未統一）
2. `urgency_pack.js` — 14 題、四象限 scoring、flags
3. `spiritual` 下游鏈路：spiritual 報告底有 → urgent 連結
4. `planning_phase_config.js` — POST_COMPLETE_CTA.urgent / default
5. `loadUpstreamChain` — 是否讀 spiritual RunStore
6. `PLANNING_TOOL_COPY_UI_DICTIONARY_V1.md`

## 類型附錄 T2（必做）
- AssessmentRunStore 上下游（spiritual → urgent → 戰情室 / SMART）
- 算法：重要度 vs 緊急度 → 四象限落點
- 覆寫規則（若有靈命 upstream 低分時是否調整優先序）
- Fallback L1/L2/L3
- 完成 CTA：戰情室 F 軸、連 SMART

## 統一用字（違反列 P0）
| Tab① | ① 理念與說明 |
| Tab② | ② 開始測評 |
| Tab③ | ③ 分析報告 |
| Tab④ | ④ 輔導員手冊 |
| 主按鈕 | 進入測評 → |
| 次按鈕 | 🔍 先看示範報告 |

## 微型快徑上下文
微型教會路徑：**靈命快評 → 四象限優先 → RACI → 戰情室**。本工具是第 2 站；Tab① 必須說清「剛填完靈命後，為何要排優先序」。

## 輸出格式
依 `docs/governance/tool_audits/_TEMPLATE_TOOL_AUDIT.md` 填 §0～§8。

## 約束
- 教會牧養語境；Eisenhower 譯為「事工節奏／優先序」，非 CEO 時間管理口號
- HITL；不作同工 KPI 排名
- file:// 驗收

## 參考：spiritual 已落地 P0（上一站）
- Tab 名已統一 ①～④
- Tab① 含 3 分鐘入門 + 五維卡 + 標準免責
- audit：`docs/governance/tool_audits/spiritual.md`

请对比 urgent 与 spiritual 链路口吻是否一致。
