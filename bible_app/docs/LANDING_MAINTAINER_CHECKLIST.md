# 聖經跑道 Landing · 維護者 Checklist

版本標記：`ASSET_V`（`shell/index.html`）與 landing 頁腳應一致。  
每次改 UI／部署方式後請走一遍本清單。

## 1. 三種運行模式

| 模式 | 如何開啟 | 能驗收什麼 | 使用者 |
|------|----------|------------|--------|
| `file://` 預覽 | 雙擊 `shell/index.html` | UI + 創世記 1–2 章示範 | 快速看一眼 |
| 本機 HTTP | `bible_app/打開聖經跑道.bat` 或 `START-WEB.cmd` | 完整四語經庫、教練模組 | 開發／驗收 |
| 雲端 HTTPS | https://bible100.lovestoblog.com/bible_app/ | 一般信徒使用 | 上線 |

- `file://` 時應顯示橘色預覽橫幅；本機 HTTP 與雲端**不應**顯示該橫幅。
- 改 port 或 document root 時，**同步更新** `.bat` / `.cmd` 與 `shell_boot.js` 探測位址。

## 2. Landing 首屏（小白）

首屏必須一眼看見：

1. 一句話（tagline）
2. 全寬「開始今日關卡」
3. 安心卡（斷更沒關係）
4. 四步流程

四跑道卡片在 `<details>` 內，預設收合。  
文案 SSOT：`shell/js/landing_tracks.js`（四語 `UI` 物件）。

## 3. 殼頂欄（index.html）

- 手機：常駐 **首頁** + **今日關卡** + **⋯**；四跑道按鈕隱藏。
- 更多面板：快捷 → 幫助（▶怎麼用、❤為什麼做）→ 進階（對象、經文顯示，預設折疊）。
- 殼文案 SSOT：`shell/js/shell_i18n.js`。

## 4. 說明頁

- 操作／理念內容 SSOT：`shell/js/guide_content.js`
- 渲染：`shell/js/guide_pages.js`
- 改文案後跑：`python bible_app/tests/test_guide_pages.py`

## 5. 多語與手機

- 四語：zh-Hant / en / vi / id — landing、殼、guide 須同步。
- 窄螢幕讀經：`bible_reader_shared.js` 的 `getEffectiveViewMode()` 會把四語降為雙語或單語。
- 改字體大小時檢查 CJK 行高與按鈕可點區域（≥44px）。

## 6. 導航與跑道

- 跑道註冊：`shell/js/track_registry.js` + `data/reading_tracks_manifest.json`
- 今日關卡：`pages/today.html` ← landing 主 CTA
- 勿在 `shell_nav.js` 對教練 zone 顯示「籌備中」

## 7. 錯誤與降級

| 情況 | 應顯示 |
|------|--------|
| `file://` | 預覽橫幅 + 可選離線說明 modal |
| 經庫未載入（HTTP） | 溫和提示「請稍後再試」，勿堆 stack trace |
| 跑道 JSON 失敗 | landing 內 `landing-fail` 文案 |

語氣保持溫柔，避免「系統錯誤碼」嚇到慕道者。

## 8. 版本與部署

1. 本機 HTTP 測試通過
2. 更新 `ASSET_V`（強制快取更新）
3. 部署雲端並確認頁腳版本號一致
4. 跑測試：
   ```powershell
   python bible_app/tests/test_track_landing.py
   python bible_app/tests/test_guide_pages.py
   python bible_app/tests/test_coach_modules.py
   ```

## 9. 勿提交

- `data/` 大型 `.db`
- `.env`、憑證
- 僅本機用的備份

## 10. 相關檔案

```
bible_app/shell/index.html
bible_app/shell/pages/landing.html
bible_app/shell/js/landing_tracks.js
bible_app/shell/js/shell_i18n.js
bible_app/shell/js/shell_nav.js
bible_app/shell/js/shell_boot.js
bible_app/shell/js/guide_content.js
bible_app/docs/COACH_MODULES_V1.md
```
