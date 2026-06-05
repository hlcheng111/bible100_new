# Bible100 優化路線圖（何時改什麼）

## 已完成（優先級 P0）

| 項目 | 狀態 |
|------|------|
| 主線 dashboard / landing 的 `<title>` + 單一 `<h1>` | 10 模組入口已具備；補 `school_management`、`tools-dashboard` |
| 詩歌入口鏈 | `sidebar`、`dashboard`、`landing` → `hymn_main_index` / `default.htm` / 英文索引 |
| 導覽樞紐壞連結 | `check_phase_tool_and_nav_links.py` → MISSING: 0 |
| `chrome-extension://` 錨點 | 批次移除（全站除 archive/languages） |

## 分批時程（建議）

### 批次 1 — 本週（主線 + 詩歌入口層，約 50–80 檔）

- `hymn_management/` 根目錄與 `hymn/*.htm`（非 `hymn_00/` 等子庫）
- `church_ministry/`、`bible_study/`、`help/` 非 archive 頁
- **目標**：壞連結檔案數 370 → **&lt;200**

### 批次 2 — 部署前 2 週（雲端精簡包）

- 各模組 `dashboard` / `sidebar` / `landing` 補齊 title（若掃描仍缺）
- `languages/cn` + `en` 主要 landing（其餘語言上雲端可 exclude）
- 驗證 `manifest.json`、`service-worker.js` 與精簡目錄一致

### 批次 3 — 上線後按需（詩歌庫 2000+ 頁）✅ 已執行一輪（2026-05-21）

- 腳本：`scripts/fix_batch3_batch4.py`
- 熱門索引：`hymn_web-TITLE*` → 現行索引；`hymn_management/index.html` 絕對路徑
- `qna/_fetch/*.html`（10）離線鏡像橫幅 + 壞絕對路徑 → `qna_landing.htm`
- 詩歌子庫 `../hymn_most/`：僅當檔名與 `hymn_most/` 內檔案**完全一致**時改相對路徑（編碼不符者仍待修）

### 批次 3 — 上線後按需（詩歌庫 2000+ 頁，剩餘）

- `hymn_00/`、`hymn_22/`、`hymn_most/` 等：跨夾 `../hymn_most/`、檔名編碼
- **不阻擋部署**；從 dashboard 進入的熱門索引頁先修
- 工具：`python scripts/analyze_broken_links.py` 追蹤剩餘數

### 批次 4 — 長期（品質 / SEO）✅ 已執行一輪（2026-05-21）

- 曝光頁清單見 `fix_batch3_batch4.py` 內 `EXPOSED_PAGES`
- 補 title：曝光頁多已有 title
- 多餘 `<h1>` 降為 `<h2>`：5 個曝光頁

### 批次 4 — 長期（品質 / SEO，剩餘）

- 343 空 title、3848 無 h1、1830 多 h1：僅改**新頁**與**對外曝光頁**
- legacy FrontPage `.htm` 可維持現狀，避免大規模改壞排版

## 刻意不做（除非另開專案）

- 刪除或移出 `languages/` 整樹
- 一次改 2000+ 首詩歌內容頁
- 刪除 `archive/`（參考與回退用）

## 驗證指令

```powershell
python scripts/check_phase_tool_and_nav_links.py
python docs/reports/audit_temp.py
python scripts/analyze_broken_links.py
```
