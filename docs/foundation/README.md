# Bible100 · Foundation 0（重檢重組作業系統）

**狀態**：可執行母本（2026-09-29）  
**範圍**：只定作業系統與規格；**本輪不改產品碼**。  
**原則**：升級現有治理的索引與契約，**禁止平行憲法**。

## 這套解決什麼

全站不要一刀切「全面視覺重構」。先用同一套七步流程，依模組風險選技能包，再最小改造。

## 四份工作母本（先用這些）

| 檔 | 用途 |
|----|------|
| [01_PLATFORM_CHARTER.md](./01_PLATFORM_CHARTER.md) | 薄憲章：使命／禁止／R 級／AI／獨立可拆 |
| [02_SCRIPTURE_LINK_SPEC.md](./02_SCRIPTURE_LINK_SPEC.md) | 經文深連結：Canonical + Legacy adapter |
| [03_DATA_STORAGE_SPEC.md](./03_DATA_STORAGE_SPEC.md) | 儲存命名目標 + 現況盤點表（先規格、後遷移） |
| [04_AUDIT_TEMPLATE.md](./04_AUDIT_TEMPLATE.md) | 可複製盤點／分期／驗收模板 + AUDIT_00 起手 |

附錄：

| 檔 | 用途 |
|----|------|
| [05_MODULE_PROMPTS.md](./05_MODULE_PROMPTS.md) | 依 A/B/C/D 技能包套用的 Agent Prompt |
| [ACCEPTANCE_GATES.md](./ACCEPTANCE_GATES.md) | 樣板期與一般期驗收門檻 |

## 既有權威（必須對照，勿另起爐灶）

- `docs/governance/PRODUCT_CONSTITUTION_V1.md`
- `docs/governance/UNIFIED_NAVIGATION.md`
- `.cursor/rules/bible100-current-governance.mdc`
- `.cursor/rules/bible100-module-hub-standalone.mdc`
- `.cursor/rules/bible100-cross-module-data.mdc`
- `.cursor/rules/bible100-file-protocol-acceptance.mdc`
- `.cursor/skills/bible100-collaboration/SKILL.md`

寫任何 Foundation 結論時，標明：**已有／增量／衝突**。

## 平台殼 + 六類模組

```
Bible100 平台殼（index_v5 / Hub）
├─ 共用：導覽、語系、經文參照、隱私、深連結
├─ 教材與培訓（languages）
├─ 聖經研讀（bible_study + 跑道 bible_app）
├─ 聖經難題 Q&A（qna）
├─ 教會事工（church_ministry）
├─ 學校管理（school_management）
└─ AI Lab（ai_tools）
```

每模組同時滿足：總站內互聯；拿掉殼後仍可 Standalone。

## 建議樣板（下一輪產品改碼才做）

**聖經研讀 + 讀經跑道「閱讀閉環」**（A 類，R0–R1）：  
地圖 → 讀 → 打卡 → OIA／難題 → 回原進度。

**AUDIT_00 已完成（2026-09-29，只讀）**：[`AUDIT_00_STUDY_TRACK.md`](./AUDIT_00_STUDY_TRACK.md)

刻意不做：視覺大翻、第六條賽道、PWA、帳號、全站 localStorage rename、R3 本機社群。

## 口令

- `執行 Foundation 0` + 允許寫 `docs/` → 更新本目錄母本（不改產品碼）
- `執行 AUDIT_00 研讀閉環` → 只出盤點表，仍不改碼，除非另下產品口令
