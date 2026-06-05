# ChurchDataBridge 驗收清單（PR-Alpha / Beta）

對照實作與手動測試步驟。最後更新：與 `central_member_db.js` 的 `MIN_SEED_MEMBERS` 一致。

---

## 0. 筆數與環境變數（請先讀）

| 項目 | 說明 |
|------|------|
| **自動種子筆數** | `CentralMemberDB.generateSeed()` 目前為 **200 筆**（`MIN_SEED_MEMBERS = 200`），**不是 500**。500 人為另流程（例如 `load_central_member_seed.html` / `people.json`）。 |
| **正式環境旗標** | `ChurchDataBridge.isProductionMode()` 讀取：`APP_ENV` / `CHURCH_APP_ENV`（全域）或 **`localStorage.church_app_env`** / **`localStorage.church_env`**。值為 `production` 或 `prod`（正規化為 production）時啟用 PROD 行為。 |

---

## 1. Cold Start（無資料啟動）

1. 清空該來源下之 Site Storage（至少 `memberSystemData`、`churchMasterDatabase`）。
2. 開啟 `church_ministry/index.html`（或含 `bootstrap_church_data.js` 之儀表殼）。
3. **預期**：`DOMContentLoaded` 後，`bootstrap` 經 `ChurchDataBridge.whenReady` → `applyBootstrapSeed`，主檔約 **200** 筆會友；Console 出現 **一次** `[ChurchDataBridge] ready`；`[bootstrap_church_data]` 之 `console.assert` 不應失敗。
4. **合併行為**：若先前已有手動會友（同 `id`/`memberId`），再次觸發種子時 **保留既有**，僅補上種子中 **新 id**。

---

## 2. Race / 快速點進子頁（iframe 或直開）

1. 硬重新整理父頁後 **立刻** 點入「志工整合」等子頁。
2. **預期**：子頁 `await ChurchDataBridge.whenReady({ timeoutMs: 8000 })`；逾時則 Console `warn`，頁面仍會 **fallback 載入**（不應永久白屏）。
3. **說明**：目前 **未** 強制全頁 Loading Spinner；若需「必須等到 ready 才顯示 RSVP」，屬 UI 增強項。

---

## 3. PROD Guard

1. Console：`localStorage.setItem('church_env', 'production')` 後重新整理。
2. **預期**：`bootstrap` **不** 自動灌種子；志工／會員 **`loadDemo`** 被擋；財務 **`loadDemo`** 維持既有擋。
3. 測畢：`localStorage.removeItem('church_env')`（或設 `development`）還原。

---

## 4. `init()` / `whenReady()` 邏輯（壓力要點）

- **重複呼叫**：`init()` 第二次起回傳 `Promise.resolve({ ok: true, already: true })`，與第一次 **共用** `_bridgeInitPromise`，不會重跑 microtask 內邏輯。
- **Log**：首次就緒僅 **一行** `[ChurchDataBridge] ready`；連續 `init().then(() => console.log('Done'))` 三次可出現三個 `Done`，但 **不應** 出現三行 `ready`。

---

## 5. Iframe 與實例

- 每個 **iframe** 若各自載入 `church_data_bridge.js`，會有 **各自** 的函式實例，但 **同一 origin 下共用同一 `localStorage`**，資料仍一致。
- **進階**：若需單一 JS 實例，可改為父頁載入 Bridge、子頁 `window.parent.ChurchDataBridge`（需同源與錯誤處理）；目前未實作。

---

## 6. 建議 Console 自檢

```javascript
ChurchDataBridge.isBridgeInitialized()
ChurchDataBridge.init().then(console.log)
ChurchDataBridge.init().then(console.log)
ChurchDataBridge.whenReady({ timeoutMs: 100 }).catch(e => console.log('timeout ok', e.code))
```

---

## 7. PR-Gamma（教育／門訓／研究快照）

- **教育／A 模組**：頁面不再直讀 `localStorage`；舊鍵 `educationSystemData`、`church_ministry_a_education` 由 **`ChurchDataBridge` 內一次性遷移** 至 Provider 鍵後刪除舊鍵。
- **門訓**：同上，`discipleData` 舊直寫鍵由 Bridge 遷移；頁面僅 `getDiscipleClassesAsync`／`saveDiscipleClassesAsync`。
- **會友 `education_history`**：教育頁 **`saveData`** 後依 `parentMemberId` 彙總寫回主檔（`saveMemberSystemData`），會員整合頁可讀到。
- **研究**：`cm_research_snapshot.js` 使用 `getMemberSystemSnapshotForStats()`；若 HTML 無 `cm-kpi-baptized` 等 id，`setText` 會略過。
