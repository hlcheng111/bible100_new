# Bible100 上雲目錄與打包建議（V2.2）

## 結論先講

- **不建議「全部先移除各夾再重上」**。  
  這樣風險最高，容易破壞舊主線與既有連結。
- 建議採 **「白名單打包 + 分階段替換」**：先上新，再切流量，保留回滾。

---

## 1) 建議上雲包（第一批）

> 目標：先讓 v2 與橋接能力可用，不破壞舊站。

必上：

- `index_v5.html`
- `v2/`（含 `v2/index.html`, `v2/js/`, `v2/apps_script/` 供工程參照）
- `js/ssot_shell_bridge.js`
- `ai_tools/`（至少 `ai_tools/index.html` 與其依賴）
- `qna/`
- `bible_study/`
- `languages/`
- `css/`
- `data/`（若仍有靜態依賴）
- `docs/v2_2/`（可選，建議保留給運維）

可暫不上（視你營運需要）：

- `test/`, `tests/`
- `scripts/`（若純開發腳本）
- `church_planning/` 的本地建置資源（非運行必需）

---

## 2) 建議不上雲（或上雲前先清理）

- 本機依賴：
  - `**/node_modules/**`（可重建）
- 備份副檔：
  - `**/*.bak`
- 臨時頁／草稿頁（需人工確認）：
  - `index_temp.html`
  - `index_v5.htm`（若確定僅測試轉址）

> 注意：`index_legacy.html` 是否保留，取決於你是否還有外部連結引用它。

---

## 3) 推薦部署結構（雲端）

```text
/
├─ index_v5.html              # 主入口
├─ index.html                 # 可做轉址或保留舊入口
├─ v2/
│  ├─ index.html
│  ├─ js/
│  └─ apps_script/            # 工程參照（非前端執行）
├─ js/
│  └─ ssot_shell_bridge.js
├─ ai_tools/
├─ bible_study/
├─ qna/
├─ languages/
├─ css/
├─ data/
└─ docs/v2_2/                 # runbook / checklist
```

---

## 4) 上雲步驟（安全版）

1. **建立 deploy staging 目錄**（本機）
2. 按白名單複製必要檔案到 staging
3. 驗證 `index_v5.html` + `apiBase` + `getXxx` API
4. 上傳 staging 主機驗收
5. 通過 `MODULE_TRANSFORMATION_SIGNOFF.md` 簽核後再上 prod
6. 保留前一版 zip，確保可回滾

---

## 5) 是否要「全部重上」？

僅在以下情況考慮：

- 目前線上檔案與 repo 嚴重漂移，無法逐步比對
- 無法確認哪些檔案為正式版本
- 你已接受一次完整停機窗口

若不是上述情況，建議：

- **不要全砍重上**
- 使用「白名單打包 + 灰度替換 + 快速回滾」。
