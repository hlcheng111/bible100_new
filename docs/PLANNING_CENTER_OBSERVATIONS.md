# Planning Center 觀察記錄與 bible100_new 對照

**記錄日期**: 2025-03-06  
**來源**: 影片 PCU: Planning Center Overview (https://www.youtube.com/watch?v=3MvuUzo1ZPc)

---

## 一、Church Center 卡片式 vs topbar→sidebar→iframe

| 維度 | Church Center 卡片式 | bible100_new topbar→sidebar→iframe |
|------|----------------------|-------------------------------------|
| 導覽邏輯 | 首頁即卡片網格 | 頂欄→sidebar→iframe |
| 資訊密度 | 功能入口為主 | 多層選單 |
| 建議 | 會眾用卡片 | 同工用 topbar→sidebar→iframe |

**結論**：可合併。會眾入口加卡片首頁，同工保留現有結構。

---

## 二、單一資料源與靜態理念

| 項目 | 相容性 |
|------|--------|
| PC、手機可用 | ✅ |
| 小白可維護 | ✅ |
| 不需 localhost | ✅ |
| 靜態網站為主 | ✅ |

**結論**：建立「邏輯上的 People 中心」：`people.json` + `people_loader.js`，不改變靜態架構。

---

## 三、改動前準備

1. 完善技術文件
2. 備份（4.5GB 以下）
3. 再進行改動

---

## 四、採納清單

| 採納 | 項目 |
|------|------|
| ✅ | People 邏輯中心 |
| ✅ | Groups 結構 |
| ✅ | Study progress (OT100/NT100/T4) |
| ✅ | person_detail.html（一人視圖） |
| ✅ | OT100 overview 頁 |
| ✅ | Dashboard 半實際化 |
| ⚠️ 延後 | Registration |
| ❌ | 付款、後端、即時同步 |
