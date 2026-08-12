# InfinityFree 完整上傳清單（Bible100）

> 站點範例：`https://bible100.lovestoblog.com`  
> 本機根目錄：`bible100_new/`  
> 機器可讀分層：`config/cloud_deploy_tiers.json`  
> 自動檢查腳本：`scripts/check_cloud_deploy.py`

---

## 1. 為什麼雲端和 PC 不一樣？

| 環境 | 行為 |
|------|------|
| 本機 `file://` | `js/config-embedded.js` 內嵌配置，**不需** `fetch config/modes.json` |
| 雲端 `https://` | 必須能 HTTP 200 取得 `config/modes.json` 與 `js/*.js` |

您 F12 裡的 404（`shell_nav.js`、`index_v5_shell.js`、`config-embedded.js`…）代表：**只上了 `index_v5.html`，依賴的 `js/`、`config/` 沒上或仍是舊版**。

頂欄只剩「營運自動化 / 工具總覽」是因為這兩個按鈕**寫死在 HTML**；「教材與培訓、聖經研讀…」由 JavaScript 依 `modes.json` **動態生成**，配置載入失敗就不會出現。

`contents.*.js`、`content_main.js` 的 React 錯誤來自**瀏覽器擴充套件**，可忽略，與本站無關。

---

## 2. InfinityFree 空間現實

| 區塊 | 約略體積 | 建議 |
|------|----------|------|
| 全專案含 `data/` | ~5.3 GB | 勿整包 FTP |
| `data/` | ~1.5 GB | 預設**不上**；見 §5 試用包 |
| `languages/`（含圖） | ~1.9 GB | 只上中文入口 HTML，勿傳全夾 |
| `hymn_management/` | ~1.3 GB | 雲端試用可跳過 |
| **P0 總站殼** | **~0.25 MB** | **必傳** |
| **P1 核心模組（無大媒體）** | **~90 MB** | 建議傳 |
| `qna/` | ~27 MB | 要用 Q&A 模式再傳 |
| `church_planning/` | ~51 MB | 要用規劃 OS 再傳 |

免費主機單檔常限 **10–20 MB**；`data/cj/综合解读.db` 約 **162 MB**，需確認主機是否允許。

---

## 3. 上傳分層（照順序做）

### P0 · 總站殼啟動（必傳，~250 KB）

上傳後應能看見頂欄模式按鈕，且下列 URL 為 **200**（非 404）：

```
index.html
index_v5.html
config/build_version.js
config/modes.json
config/modules.json
config/languages.json
config/paths.json
config/system.json
config/local-languages.json
js/config-embedded.js
js/config-loader.js
js/shell_nav.js
js/church_triangle_nav.js
js/building_guide_fab.js
js/cloud_config.js
js/cloud_api.js
js/church_auth.js
js/church_data_bridge_phase1.js
js/persistence_provider.js
js/bible100_backend_init.js
js/sync_observer_drawer.js
js/ssot_shell_bridge.js
js/shell_contract.js
js/index_v5_shell.js
js/crm_trial_welcome.js
js/onboarding_v1.js
js/sidebar_behavior.js
js/sidebar_shell_target_fallback.js
languages/index_cn.html
languages/landing_new_cn.html
```

**重要：** 用本機 `index.html` **覆蓋**雲端根目錄舊版 `index.html`（目前雲端仍是舊 `Bible 100 Steps Four Treasures` 整頁）。

驗收 URL：

- `https://bible100.lovestoblog.com/` → 應跳轉 `index_v5.html`
- `https://bible100.lovestoblog.com/config/modes.json` → JSON 內容
- `https://bible100.lovestoblog.com/js/index_v5_shell.js` → JavaScript

### P1 · 核心模組（建議，~90 MB）

整夾上傳（FTP 時排除 `.db` `.mp4` `.pdf`）：

```
bible_study/
church_ministry/
ai_tools/
nav_hub/
help/
tools/
smart_ministry/
school_management/
disciple_dynamics/
```

可選加傳：

| 目錄 | 何時需要 |
|------|----------|
| `church_planning/` | 頂欄「教會規劃 OS」 |
| `qna/` | 「聖經難題 Q&A」模式 |

### P2 · 中文教材精簡（勿傳全 `languages/`）

最低限度（已在 P0）：

- `languages/index_cn.html`
- `languages/landing_new_cn.html`

若要舊約百步等課程頁可再加 `languages/landP_cn.html`；更深課程需手動挑選 `languages/cn/` 內 HTML（**勿整夾含圖**）。

**不要**上傳整個 `languages/`（~1.9GB 圖片）。

### P3 · 聖經資料庫試用（可選）

不傳 `data/` 時：研讀介面可開，**SQLite 釋經／綜合解讀為空**。

| 檔案 | 約略大小 | 用途 |
|------|----------|------|
| `data/bibles/和合本串珠.db` | ~2 MB | 串珠試用 |
| `data/cj/圣经各卷要义.db` | ~2.4 MB | 小型釋經試用 |
| `data/cj/新旧约辅读.db` | ~3.8 MB | 輔讀試用 |
| `data/cj/综合解读.db` | **~162 MB** | 旗艦功能；空間夠再傳 |

完整離線包見 `config/asset_offload_manifest.json`（可改 Google Drive 連結，入口顯示「下載完整離線包」）。

---

## 4. 明確不要上傳

見 `config/cloud-upload-exclude.txt`，摘要：

```
backups/
archive/
data/          （除非 P3 精選小檔）
.git/
node_modules/
bible_app/     （Expo 專案，與靜態站無關）
*.zip *.mp4 *.pdf（除非單頁必要）
```

---

## 5. FTP / 檔案總管上傳步驟

1. 登入 InfinityFree → File Manager 或 FileZilla。
2. 進入網站根目錄（通常 `htdocs` 或 `bible100.lovestoblog.com` 對應資料夾）。
3. **先傳 P0**（`config/`、`js/`、`index.html`、`index_v5.html`、兩個 `languages/` 入口）。
4. 瀏覽器 **Ctrl+Shift+R** 強刷；跑檢查腳本（§6）。
5. 再傳 P1 模組夾。
6. 空間允許再傳 P3 小型 `.db`。

上傳後若仍像舊站：刪除或覆蓋根目錄**舊** `index.html`，並清除 InfinityFree 快取（若有）。

---

## 6. 部署檢查腳本

在專案根目錄（PowerShell）：

```powershell
# 估算各 tier 本機體積
python scripts/check_cloud_deploy.py --estimate-size

# 列出 P0 必傳檔案（可對照 FTP）
python scripts/check_cloud_deploy.py --list-tier p0_shell_boot

# 掃描雲端哪些還 404（預設檢查 P0）
python scripts/check_cloud_deploy.py --url https://bible100.lovestoblog.com

# 檢查全部 tier（較久）
python scripts/check_cloud_deploy.py --tier all --url https://bible100.lovestoblog.com

# 產出 Markdown 報告
python scripts/check_cloud_deploy.py --report docs/deployment/cloud_check_latest.md
```

退出碼：`0` = 所列路徑雲端皆 200；`1` = 仍有缺失。

---

## 7. 本機先模擬雲端（上傳前）

`file://` 無法反映雲端 `fetch` 行為，請用 HTTP：

```powershell
cd C:\Users\hlche\.cursor\bible100_new
python -m http.server 8080
```

開啟 `http://127.0.0.1:8080/index_v5.html`，F12 → Network 不應有紅色 `config/`、`js/` 404。

---

## 8. 常見問題

| 現象 | 原因 | 處理 |
|------|------|------|
| 頂欄只有營運自動化/工具總覽 | `modes.json` 或 `index_v5_shell.js` 404 | 完成 P0 |
| 根網址仍是舊版 | 雲端 `index.html` 未更新 | 覆蓋本機 `index.html` |
| `?i=1` 無效 | 專案無此參數 | 用 `/` 或 `/index_v5.html` |
| 第一次 404、再傳又好一點 | FTP 路徑錯或快取 | 確認在網站根、強刷 |
| 研讀頁空白 | 無 `data/*.db` | P3 試用包或本機離線 |

---

## 9. 相關檔案

| 檔案 | 說明 |
|------|------|
| `config/cloud_deploy_tiers.json` | 分層清單 SSOT |
| `config/cloud-upload-exclude.txt` | 排除大檔簡記 |
| `config/asset_offload_manifest.json` | 大資產離線包／Drive 連結 |
| `scripts/check_cloud_deploy.py` | HTTP 遠端檢查 |
| `tests/test_cloud_deploy_checker.py` | 腳本與 manifest 煙霧測試 |

---

*更新：2026-07-01*
