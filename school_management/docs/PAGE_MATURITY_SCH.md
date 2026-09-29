# 學校管理 · 頁級成熟度矩陣（W1 Lite 骨架）

> **版本**：V1 · 2026-08-05（SITE-8 開工）  
> **對齊**：`docs/governance/SITE_PHASE_5PLUS_MODULE_WAVES_V1.md` · `MODULE_BOUNDARY_SMART_SCH_DD_V1`  
> **原則**：一頁一職；與 CM 只透過 `member_id` / `externalId` 橋接，不雙寫名冊。

---

## 1. 全熟定義（SCH）

| 層級 | 含義 |
|------|------|
| **W1 Lite** | Hub 雙欄 + dashboard + 學籍主路可走；頁級表存在 |
| **全熟** | 學籍 SSOT 寫入單一 API；CM-C roster 只讀橋；報告可匯出 |

---

## 2. 頁級矩陣（初稿）

| ID | 頁面 | 路徑 | 角色 | 總評 | 備註 |
|----|------|------|------|------|------|
| SCH-00 | 模組殼 | `school_management/index.html` | L0 Standalone | ✅ | Hub 勿嵌殼中殼 |
| SCH-01 | 路線／Landing | `school_management/_landing/home.html` | Hub 內容 | ✅ | |
| SCH-02 | 儀表板 | `school_management/dashboard.html` | 戰情 | 🟡 | KPI 與學籍主鍵對齊待驗 |
| SCH-03 | 學籍／學生 | `manage/students_tabs.html` | 主路 | 🟡 | externalId ↔ CM |
| SCH-04 | 課程 | `manage/courses_tabs.html` | 主路 | 🔹 | |
| SCH-05 | 用戶／權限 | `manage/system_tabs.html` | 行政 | 🔹 | |
| SCH-06 | 作業 | `manage/module_integration.html` | 延伸 | 🔹 | |
| SCH-07 | CM 橋說明 | （文檔／UI 提示） | 邊界 | ⏳ | SITE-8 驗收項 |

圖例：✅ 可用 · 🔹 基本 · 🟡 主路未滿 · ⏳ 待做 · 📄 Landing

---

## 3. SITE-8 本波驗收（file://）

1. `index_v5` → 學校管理 → 見 landing／dashboard，非空白。  
2. 學生頁可見 `member_id`／externalId 欄位說明（有則勾；無則開 issue）。  
3. 本檔進 git；後續細編在此追加，不另開第三張表。

---

## 4. 相關測試

```powershell
python tests/test_index_v5_shell.py
python tests/test_unified_navigation.py
# 可選：school_management/tests/（若有）
```
