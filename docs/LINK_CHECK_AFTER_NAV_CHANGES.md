# 導覽／說明頁改動後 · 相對連結檢查

## 「手動／按需」是什麼意思？

**不是**每次存檔都跑，而是 **有觸發條件就跑**；執行動作是 **人手或 Agent 下指令**，不把腳本綁進 pre-commit（除非你們日後決定要上 CI）。

### 應在什麼時機跑？（優先序）

| 時機 | 建議 |
|------|------|
| **合併進主線前**（PR／本機 merge 前） | 若該 PR 動到下面「觸發路徑」任一檔，**必跑**一次。 |
| **模組重整／搬目錄／大量改名** 當日收工前 | 跑一輪，避免隔天從錯誤入口找頁。 |
| **只改文案、未動任何 `href`** | 可不跑。 |
| **發布或給同工演示前**（可選） | 跑一次當煙霧測；與「手點幾個入口」二擇一即可。 |

### 由誰做？

| 角色 | 做法 |
|------|------|
| **改檔的人（作者）** | 對自己改的 `href` 負責；合併前在本地跑腳本，**MISSING: 0** 再交 PR。 |
| **審 PR 的人（Reviewer）** | PR 描述或檢核表勾「已跑 `check_phase_tool_and_nav_links.py`」；若沒勾且 diff 含導覽頁，要求補跑或補截圖。 |
| **Cursor Agent** | 改完 `nav_hub`／`help`／工具側欄後，依 rule **`bible100-nav-link-check-after-changes`** 執行同一指令並貼結果摘要。 |

### Double check 可以依什麼？

1. **腳本輸出（第一層）**  
   - `MISSING: 0` → 在 **`SCAN_FILES` 範圍內**，相對路徑都能解析到實體檔。  
   - 若有 MISSING → 以輸出逐條修；修完再跑到 0。

2. **人工煙霧（第二層，補腳本死角）**  
   - 用 **`index_v5.html`** 開「工具總覽」，從側欄點：**Global Tools → 依角色進站 → 四類工具** 與 **文檔中心**，確認右欄有載入、無整頁空白。  
   - 腳本 **不驗** `target` 是否在父頁有對應 iframe（例如單獨 `file://` 開某頁）；這類用 **實際在殼內點一次** 當 double check。

3. **範圍自覺（第三層）**  
   - 若新增重要入口 HTML，記得把路徑加進 **`SCAN_FILES`**，否則腳本不會幫你驗到——Reviewer 可看 diff 是否改到 `check_phase_tool_and_nav_links.py`。

4. **與其他治理對齊（可選）**  
   - 若站內已有 **全站 audit／broken link** 流程（例如 `docs/reports` 內報告），可規定「大波次重整後」再跑一次全站掃描；本腳本是 **輕量、導覽專用**，兩者互補不取代。

---

## 何時要跑（觸發路徑）

在下列變更之後，請執行一次連結檢查（或交給 Agent 執行）：

- 修改 **`nav_hub/`**、`**help/**`（含 `.htm`）、**`tools/tools-overview-sidebar.html`** 內的 **`href`**（含搬檔、改名、模組目錄重整）。
- 修改 **`nav_hub/documentation_center.html`** 指向的 `.md`／`.txt` 路徑。
- 新增／刪除 **四類工具** 或 **角色×任務** 說明頁所連到的示範頁（`church_planning/`、`smart_ministry/` 等）。

## 指令

在 `bible100_new` 根目錄：

```powershell
python scripts/check_phase_tool_and_nav_links.py
```

- **成功**：結尾為 `MISSING: 0`（僅檢查腳本內 **`SCAN_FILES`** 所列 HTML 的相對 `href`）。
- **有失敗**：依輸出修正路徑，或將新頁加入 `SCAN_FILES` 後再跑。

## 擴充掃描範圍

編輯 **`scripts/check_phase_tool_and_nav_links.py`** 頂部常數 **`SCAN_FILES`**：每行一個相對於 `bible100_new/` 的 HTML 路徑。

## 限制（刻意不做的事）

- 不檢查 `http(s)://`、`javascript:`、`mailto:`。
- 不檢查含 **`${`** 的 href（避免誤判 JS 模板字串）。
- 不取代全站爬蟲；全量掃描可另起腳本或 CI job。

## 相關說明頁

- `help/church-tool-four-pillars.html` — 四類工具落地索引  
- `help/role-task-start.html` — 角色×任務導覽  
