# P3 研發儲備：經文 Context → SWOT 規劃橋接

> **狀態**：規格已凍結 · 基礎 API 已落地（`js/scripture_context_bridge.js`）· UI 按鈕待下一迭代

## 願景（總設計師暢想）

牧長在「聖經難題 Q&A」或「聖經研讀」研讀到關於*尼希米重建城牆*的屬靈觀點時，頁面出現：

**`[💡 帶入此經文異象去開 SWOT 規劃]`**

點擊後，經文與摘要成為 `swot-planning.html` 的「願景／機會」思考起點——神學與治理在同一條資料鏈上相遇。

## URL 契約

| 參數 | 說明 | 範例 |
| --- | --- | --- |
| `ctx_ref` | 經文引用 | `尼希米記 2:17-18` |
| `ctx_title` | 題目或觀點標題 | `重建城牆的異象` |
| `ctx_snippet` | 短摘要（≤500 字） | `我們所遭遇的…` |
| `ctx_source` | 來源模組 | `qna` / `bible_study` |

範例：

```text
church_planning/swot-planning.html?ctx_ref=尼希米记2:17&ctx_title=重建异象&ctx_source=qna
```

## JS API（已實作）

```javascript
// 組裝 URL
ScriptureContextBridge.buildSwotUrl({ ref, title, snippet, source });

// 在 SWOT 頁讀取並顯示橫幅
ScriptureContextBridge.renderContextBanner('scriptureContextBanner');

// 持久化（可選，跨頁保留）
ScriptureContextBridge.saveContext(ctx);
ScriptureContextBridge.loadContext();
```

## 待辦（下一迭代）

1. `qna/qna_index_4layer_V2.htm` — 題目詳情區加「帶入 SWOT」按鈕
2. `bible_study/comprehensive_exegesis_reader.html` — 讀經段落旁同按鈕
3. `church_planning/swot-planning.html` — 預填 O（機會）或願景欄位（只預填，不自動儲存）
4. `church_data_bridge.js` — 可選：將 context 寫入 `ministry_logs`（module=scripture_context）

## 鐵律

- 經文 context **只預填**，不自動寫入 `chp2026-swot-v1`
- 不取代牧者屬靈分辨；橫幅須標示「請人工審核」
- 不含 PII；不進 NotebookLM raw
