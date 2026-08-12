# M6 · W0 短規格 ＋ D 一條真鏈

> **狀態**：2026-07-23 落地  
> **驗收**：`python tests/test_church_m6_outreach_chain.py` 綠；儀表板仍只呼叫 `getCrmMaturitySummary` 既有契約欄

---

## 規格產物

| 區 | 文件 |
|----|------|
| D | [`D_OUTREACH_W0_CONTENT_SPEC.md`](./D_OUTREACH_W0_CONTENT_SPEC.md) |
| E | [`E_SOCIAL_W0_CONTENT_SPEC.md`](./E_SOCIAL_W0_CONTENT_SPEC.md) |
| （既有）A／B | `A_WORSHIP_W0_CONTENT_SPEC.md` · `B_PASTORAL_W0_CONTENT_SPEC.md` |

---

## D 真鏈（唯一承諾）

| 環 | 實作 |
|----|------|
| 登記頁 | `modules/expansion/outreach-strategy.html`（`data-m6-d-chain`） |
| Store | `js/outreach_desk_store.js` → `bible100_outreach_desk_v1` |
| 交接 | `setHandoff` → 探訪頁顯示「外展 D 真鏈交接」卡 |
| 探訪 | `visitation_index.html` 讀手遞摘要（人建紀錄） |

**不上儀表板成熟度：** 外展 store **不得**加入 `getCrmMaturitySummary().checks`。

---

## 側欄

D 主入口標 **LIVE**（真鏈頁）；其他 D 子頁仍 DEMO。
