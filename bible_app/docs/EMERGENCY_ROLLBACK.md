# 聖經跑道 · 緊急修正與回滾指南

> **對象**：技術同工（緊急搶修）  
> **症狀**：雙擊 `打開聖經跑道.bat` 後，服務在 `127.0.0.1:3000` 已啟動，但開啟 `/bible_app/shell` 或首頁 index 後**畫面空白**、卡在載入。  
> **主因**：`serve` 根目錄從 `bible_app/` 改到上一層 `bible100_new/` 後，瀏覽器網址若停在 `/bible_app/shell`（無 `index.html`），相對路徑會解析到錯誤目錄 → **JS/CSS 404** → `shell_nav.js` 未執行 → iframe 無內容。

---

## 1. 三十秒診斷（必做）

### 1.1 正確入口網址

| 狀態 | 網址 |
|------|------|
| **新版 serve（repo 根）** | `http://127.0.0.1:3000/bible_app/shell/index.html` |
| **舊版 serve（僅 bible_app）** | `http://127.0.0.1:3000/shell/index.html` |

❌ 易出錯：`/bible_app/shell`（無 `index.html`）、`/bible_app/`（會再跳轉）

### 1.2 瀏覽器 F12

1. **Network**：篩選 `404`，看失敗檔案。典型錯誤：
   - `http://127.0.0.1:3000/bible_app/js/shell_nav.js` ← 應為 `.../shell/js/...`
   - `http://127.0.0.1:3000/bible_app/index.html` ← 舊版 `meta refresh` 誤跳
2. **Console**：`Failed to load resource` 連續出現即為路徑斷鏈。
3. **強制重載**：`Ctrl + F5`（排除快取中的舊版「正在進入賽道…」HTML）。

### 1.3 命令列快測（PowerShell）

**新版（repo 根 serve）：**

```powershell
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:3000/bible_app/shell/js/shell_nav.js
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:3000/bible_app/shell/js/nav_matrix.js
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:3000/bible_app/shell/pages/track-30day.html
```

三個都應回 `200`。若第一個是 `404` 且 URL 缺 `/shell/`，即為本指南所述問題。

**舊版（僅 bible_app serve）：**

```powershell
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:3000/shell/js/shell_nav.js
```

---

## 2. 方案 A：立刻回滾（最安全、跑道先能用）

**取捨**：跑道本體可恢復；**讀後 AI 連到 `ai_tools/` 會斷**（因 `serve` 不再暴露 repo 根的 `ai_tools/`）。離線 Prompt（`shell/pages/supply/prompt.html`）仍可用。

### 步驟

1. 關閉標題為「聖經跑道伺服器」的命令視窗（或結束佔用 3000 的行程）。
2. **不要改主檔**，直接改雙擊：
   - `bible_app/打開聖經跑道_僅bible_app.bat`（已附，見下）
3. 瀏覽器開：`http://127.0.0.1:3000/shell/index.html`
4. 驗收：頂欄四條賽道 + 右側「三十日」內容；F12 無紅色 404。

### 手動改主 bat（若需覆蓋 `打開聖經跑道.bat`）

將 `打開聖經跑道.bat` 中 **serve 根目錄** 從 repo 根改回 `bible_app/`：

```bat
REM 刪除或註解這兩行：
REM set "REPO_ROOT=%~dp0.."
REM cd /d "%REPO_ROOT%"

REM 改為在 bible_app 內啟動：
cd /d "%~dp0"
start "聖經跑道伺服器" /min cmd /c "cd /d "%~dp0" && npx --yes serve . -l 3000"
```

探測與開啟網址改為：

```bat
powershell ... 'http://127.0.0.1:3000/shell/js/probe.js' ...
start "" "http://127.0.0.1:3000/shell/index.html"
```

### 方案 A 不需改的檔（若 `shell/index.html` 已含 B100_SHELL_ROOT）

`shell/index.html` 內嵌腳本會依網址自動設 `<base href="/shell/">`，相對路徑 `js/shell_nav.js` 可正常載入。

### 方案 A 已知限制

| 功能 | 狀態 |
|------|------|
| 四賽道 + iframe | ✅ |
| 完整 `bible_reader.db` | ✅（需 `ensure_bible_db.ps1`） |
| `ai_tools` 讀後工作站 | ❌ 404（用 supply Prompt 代替） |
| 總站 `index_v5` 內嵌連結 | 需指向 `/bible_app/shell/...` 時仍要新版 serve |

---

## 3. 方案 B：就地修復新版（推薦，保留 ai_tools）

**取捨**：維持 `serve` 在 **`bible100_new/` 根目錄**，AI 補給站與主站同域不斷鏈。

### 3.1 確認 serve 根目錄

`打開聖經跑道.bat` 應含：

```bat
set "REPO_ROOT=%~dp0.."
cd /d "%REPO_ROOT%"
npx --yes serve . -l 3000
```

repo 根需有 `serve.json`（可選，用於 `/bible_app/shell` 改寫）：

```json
{
  "rewrites": [
    { "source": "/bible_app/shell", "destination": "/bible_app/shell/index.html" },
    { "source": "/bible_app/shell/", "destination": "/bible_app/shell/index.html" }
  ]
}
```

> 注意：`serve` 改寫**不會**改瀏覽器網址列，仍可能顯示 `/bible_app/shell`，因此 **必須** 依賴 `index.html` 內的路徑防呆（見 3.2）。

### 3.2 確認 `shell/index.html` 路徑防呆（核心修復）

`<head>` 最前面需有（**不可**再用 `meta refresh` 指向 `index.html`）：

```html
<script>
(function () {
  var p = location.pathname.replace(/\\/g, '/');
  var idx = p.toLowerCase().indexOf('/shell');
  if (idx < 0) return;
  var root = p.slice(0, idx + '/shell/'.length);
  var tail = p.slice(idx);
  if (/^\/shell\/?$/i.test(tail)) {
    location.replace(root + 'index.html' + location.search + location.hash);
    return;
  }
  window.B100_SHELL_ROOT = root;
  var b = document.createElement('base');
  b.id = 'shellBase';
  b.href = root;
  document.head.appendChild(b);
})();
</script>
```

**禁止**在 `<head>` 放：

```html
<meta http-equiv="refresh" content="0;url=index.html" />
```

在網址 `/bible_app/shell` 下會跳到 `/bible_app/index.html`（錯誤）。

### 3.3 確認腳本載入順序

`shell/index.html` 底部應依序載入（路徑為**相對** `shell/`，靠 `<base>` 解析）：

```
js/shell_boot.js → bridge.js → nav_matrix.js → font_size.js → shell_i18n.js → shell_base.js → shell_nav.js
```

`nav_matrix.js` 為**內嵌矩陣**，不讀外部 JSON；若 404，請查是否打成 `bible_app/js/` 而非 `bible_app/shell/js/`。

### 3.4 iframe 預設內容

```html
<iframe id="contentFrame" ... src="pages/track-30day.html"></iframe>
```

即使 `shell_nav.js` 晚載入，也應先看到三十日頁，而非全白。

### 3.5 `bridge.js` 與 ai_tools

新版 serve 下，`bridge.js` 偵測路徑含 `/bible_app/` 時，AI 基底為：

```
location.origin + '/ai_tools/'
```

驗證：

```powershell
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:3000/ai_tools/tools/bible_prompt_generator.html
```

應為 `200`。

### 3.6 修復後開啟方式

1. 雙擊 `bible_app/打開聖經跑道.bat`
2. 書籤固定：`http://127.0.0.1:3000/bible_app/shell/index.html`
3. `Ctrl + F5` 強制重載

---

## 4. 驗收清單（兩方案通用）

- [ ] 頂欄顯示：🏠 首頁、四賽道按鈕、語言 pill、字體、⋯
- [ ] 內容區載入 `track-30day`（或上次記憶的賽道）
- [ ] F12 Network 無 `shell_nav.js` / `shell.css` 404
- [ ] 本機 HTTP 時右上角或行為顯示「完整模式」（`shell_boot.js`）
- [ ] 靜態檢查：`python bible_app/tests/test_shell_standalone.py` → `OK`

---

## 5. 檔案對照

| 檔案 | 用途 |
|------|------|
| `bible_app/打開聖經跑道.bat` | **方案 B** 主入口（repo 根 serve） |
| `bible_app/打開聖經跑道_僅bible_app.bat` | **方案 A** 緊急回滾 |
| `bible_app/shell/index.html` | 殼頁；`<base>` + 跳轉防呆 |
| `bible_app/shell/js/shell_nav.js` | iframe 賽道切換 |
| `bible_app/shell/js/shell_boot.js` | file:// 探測、離線橫幅 |
| `bible_app/shell/js/bridge.js` | ai_tools / supply 路徑 |
| `bible_app/shell/js/nav_matrix.js` | persona×track 防空白（無外部 JSON） |
| `serve.json`（repo 根） | 可選 URL 改寫 |
| `bible_app/scripts/ensure_bible_db.ps1` | 經庫存在檢查 |

---

## 6. Git 回滾說明

`bible_app/shell/` 長期為**未追蹤**目錄時，`git checkout` **無法**還原殼頁。請以本文件方案 A/B 或備份 USB 為準。建議修穩後將 `bible_app/shell/` 納入版本控制，避免再次「不能回頭」。

---

## 7. 決策建議

| 情境 | 建議 |
|------|------|
| 主日 / 聚會前 10 分鐘要開跑道 | **方案 A**（雙擊 `_僅bible_app.bat`） |
| 要讀後 AI、與 `index_v5` 同域 | **方案 B** + 書籤 `.../shell/index.html` |
| 不確定 | 先方案 A 救場，事後再切回方案 B |

---

*最後更新：2026-06-18 · 對應 `shell/index.html` B100_SHELL_ROOT 防呆版*
