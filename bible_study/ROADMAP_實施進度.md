# 聖經研讀模組 - 路線圖實施進度

## 第一階段：核心骨架 ✅ 完成

### 1. State.js（研讀狀態中心）
- **位置**：`bible_study/js/State.js`
- **功能**：記錄 `book`, `chapter`, `verse`, `mode`, `searchQuery`, `bookName`
- **API**：`StudyState.change()`, `StudyState.setBookByName()`, `StudyState.get()`, `StudyState.parseFromUrl()`, `StudyState.subscribe()`
- **用途**：為聯動、Deep Linking、三大模式切換提供單一來源

### 2. 導航改為 State 驅動
- **Topbar 三大模式按鈕**：📖 閱讀、🔍 研經、📑 對照
- 點擊時呼叫 `StudyState.change({ mode })` 並載入對應頁面
- `loadBook(bookName)` 已整合 `StudyState.setBookByName()`
- `loadNavigation(mode)` 已整合 `StudyState.change({ mode })`
- **contentFrame onload**：從 iframe URL 解析 `?book=`、`?ch=` 同步回 State

### 3. 頂部萬能搜尋列
- 輸入關鍵字後按 Enter → 載入 `search_reader.html?q=關鍵字`
- `search_reader.html` 已支援 URL 參數 `?q=`，載入時自動填入並執行搜尋

### 4. Sidebar 可收合
- 按鈕 ◀ / ▶ 切換側邊欄顯示
- 收合後內容區獲得更大閱讀空間

### 5. 當前位置顯示
- Topbar 顯示「創世記 第1章」等
- 隨 `StudyState` 變更自動更新

### 6. Deep Linking
- `StudyState.parseFromUrl()`：頁面載入時解析 `?book=`, `?ch=`, `?v=`, `?mode=`, `?q=`
- 支援分享、收藏特定研讀位置

### 7. file:// 環境偵測
- 若以 `file://` 開啟，顯示黃色警告條
- 建議使用 Live Server 或 HTTP 伺服器

---

## 第二階段：三大模式整合（待實施）

- [ ] 主殼明確區分：閱讀 / 研經 / 對照
- [ ] 合併、精簡相關頁面，減少入口

## 第三階段：聯動與體驗（待實施）

- [ ] 點節號 → 右側顯示串珠、註釋
- [ ] 三大模式間 State 全聯動（postMessage）
- [ ] Deep Linking 完整實作（子頁主動 pushUrl）

## 第四階段：細節與瘦身（待實施）

- [ ] 人話化錯誤訊息
- [ ] 3 步 Onboarding
- [ ] 視覺統一、字體優化
- [ ] bible_reader 經文瘦身（分離 JSON）

---

## 測試建議

1. 用 **Live Server** 開啟 `bible_study/index.html`
2. 測試萬能搜尋：輸入「愛」按 Enter → 應載入搜尋結果
3. 測試三大模式按鈕：閱讀 / 研經 / 對照
4. 測試 Sidebar 收合按鈕 ◀ ▶
5. 測試 Deep Linking：造訪 `index.html?book=1&ch=3`，確認 State 與顯示一致
6. 從 Sidebar 點「創世記」→ 確認「當前位置」更新

---

**更新日期**：2025-03
