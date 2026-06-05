# CTA-OS Phase 3 戰情室

## 入口

- `church_planning/cta-os-war-room.html`
- 側欄：**CTA-OS 戰情室**
- `assessment-os-hub.html` 第 6 類工具

## 資料流

1. 各工具頁透過 `cta_os_bridge.js` 產生統一報告時，寫入：
   - `cta-os-last-report-v1`（最近一次）
   - `cta-os-registry-v1`（各 `toolId` 最新快照）
2. 戰情室載入時呼叫 `scanAllToolsFromStorage()`，從本機 `chp2026-*`、`alda_test_results` 等重算可讀工具。
3. 以所有快照向量做**算術平均**得**合成 CTV**，供雷達圖與配對。

## 戰情室區塊

| 區塊 | 說明 |
|------|------|
| 合成 CTV 雷達 | Chart.js 六維雷達 |
| 跨工具風險 | 靈命 vs 產出、RACI+80/20、維度落差等 |
| 角色配對建議 | 示範崗位 + cosine（正式版接 Smart Ministry） |
| 各工具快照表 | 連回工具頁、顯示同步時間 |

## 隱私

- 僅本機 `localStorage`；戰情室**不**列出個人姓名。
- 與 `dashboard.html`（長期規劃 pipeline）並存，職責分離。

## 相關檔案

- `js/cta_os_war_room.js`
- `js/cta_os_war_room.css`
- `js/cta_os_runtime.js`（`readRegistry` / `persistToolReport`）
- `js/cta_os_bridge.js`（`scanAllToolsFromStorage`）
