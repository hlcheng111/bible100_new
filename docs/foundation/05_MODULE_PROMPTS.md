# Foundation 0 · 模組專屬 Prompt

用法：複製對應區塊給 Agent。預設 **只讀＋出盤點／規格草稿**；要改碼必須另下產品口令。

## 共通硬規則（每包都貼）

1. 先對照 `docs/governance/*` 與 `docs/foundation/README.md`，標「已有／增量／衝突」。  
2. 每條結論要有路徑證據；未知寫「未證實」。  
3. 禁止平行憲法；禁止盤點期改 localStorage 名、禁止大改 IA。  
4. 輸出優先：Charter 增量 → Scripture Spec 差距表 → Storage 盤點 → AUDIT 填空。  
5. 驗收口徑：`file://…/index.html`。

---

## A · 經文教學（研讀／跑道／教材）

```
你正在做 Bible100 Foundation 審計（A 類）。
範圍：bible_study + bible_app（閱讀閉環）。
只讀不改碼。填 docs/foundation/04_AUDIT_TEMPLATE.md 的 AUDIT_00。
重點：經文是否顯示、深連結參數、打卡後能否到 OIA／難題並回來、
讀者頁有無技術雜訊、簡繁混雜。
對照 02_SCRIPTURE_LINK_SPEC 與 03_DATA_STORAGE_SPEC。
最後給「下一刀產品口令」一句（可執行、範圍小）。
```

## B · Q&A／探索

```
你正在做 Bible100 Foundation 審計（B 類）。
範圍：qna/。只讀不改碼。
盤點：問題分類、經文依據欄、審核狀態、危機轉介文案、
跨模 from/return_to、AI 草稿標示。
輸出：斷點表 + 最小主流程 1 條 + 不做清單。
```

## C · 敏感協作（教會／學校）

```
你正在做 Bible100 Foundation 審計（C 類）。
範圍：church_ministry 或 school_management（指定一個）。
只讀不改碼。禁止建議先做新社群／帳號功能。
只盤：角色權限、PII 欄位、寫入路徑、匯出／刪除、審計痕跡。
輸出：資料物件權限表 + R 級標註 +「先設計後功能」建議。
```

## D · AI Lab

```
你正在做 Bible100 Foundation 審計（D 類）。
範圍：ai_tools/。只讀不改碼。
盤點：任務邊界、Prompt 模板、人審標籤、個資攔截、
外站連結警示、是否誤導為權威。
輸出：任務分級表 + 禁止貼入清單 + 與 A/B 深連但不吞主路的建議。
```

## 產品改造口令範本（審計後才用）

```
執行 AUDIT_00 建議的下一刀：只改【檔案範圍】，
驗收【file:// 三點】，不做【清單】。
```
