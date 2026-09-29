# M5 · CRM 側欄 SSOT

> **狀態**：2026-07-23 落地  
> **驗收**：`python tests/test_crm_sidebar_nav_contract.py` 綠；文件與上線側欄一致

---

## 唯一上線來源

| 角色 | 路徑 |
|------|------|
| **SSOT（使用者實際看到）** | `church_ministry/sidebar_crm_journey.html` |
| 標記 | `data-crm-sidebar-ssot="static-html"` |
| 契約測試 | `tests/test_crm_sidebar_nav_contract.py` |

**禁止**：在總站／模組殼再載入第二套 CRM 側欄渲染器。

---

## 與 registry 的分工

| 檔案 | 用途（M5 後） |
|------|----------------|
| `sidebar_crm_journey.html` | **側欄 UI 唯一真相**（今日三步、開合、角標、A–F 入口） |
| `js/crm_journey_registry.js` | 路徑／角色／A–F primary／C 殼連結（給 Hub、殼腳本、測試） |
| `js/crm_sidebar_render.js` | **已棄用、不上線**；僅歷史／字串對照 |
| `js/crm_nav.js` | 仍可供其他頁呼叫 `crmShellGo`／`crmOpenAeLayout` |

---

## 側欄資訊架構（靜態 · 與 M2/M3 對齊）

1. **今日三步**（永遠展開）— 會友主檔 · 探訪工作桌 · 義工排班  
2. **回教會規劃**（預設收合）— 規劃索引／診斷／戰情  
3. **Hub 頁籤**（預設收合）— PARTIAL／DEMO 角標  
4. **依角色入門**（預設收合）  
5. **事工區入口 A–F**（預設收合）— 雙欄切換；C 走 `sidebar_c_education_journey`  
6. **進階**（預設收合）— 非主路徑  

規則：連結不寫「左欄／右欄／path」工程字；用 `bible100ShellNav` 或相對 `href`。

---

## 舊文件對照

`CRM_AE_INTERCONNECT_SPEC.md` 曾寫「`crm_sidebar_render.js`＝CRM 側欄渲染」——**以本文為準作廢該句**。

---

## 相關

- M2 誠實 UI · M3 入口 SSOT · M4 C 殼  
- `docs/ENTRY_PATH_SSOT_M3.md` · `docs/C_EDU_SHELL_M4.md`
