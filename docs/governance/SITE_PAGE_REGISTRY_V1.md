# 全站頁面註冊表（SITE PAGE REGISTRY）V1

> **日期**：2026-07-24  
> **回答你的問題**：目前**細編號（如 0-01、A-16）只有教會事工**；全站其餘模組**尚未**頁級統一編號。  
> **本檔作用**：先給每個大模組一個**前綴**＋殼／側欄契約＋「疑似重複」觀察表；**輪到該模組 W1 時再細編**，同時用前綴避免與教會 0–F 撞號。

相關：[`PRODUCT_CONSTITUTION_V1.md`](./PRODUCT_CONSTITUTION_V1.md) · [`MODULE_MAP_SSOT_TEMPLATE.md`](./MODULE_MAP_SSOT_TEMPLATE.md) · 教會實例 `church_ministry/docs/PAGE_MATURITY_INVENTORY_0AF.md`

---

## 1. 導覽統一目標（你問的兩點）

| 場景 | 目標行為 | 例外（必須明示） |
|------|----------|------------------|
| **獨立模組** `…/index.html` 左欄選單 | **只換右欄 iframe**（`content` / `target=contentFrame`） | 「換模組／換側欄」出口 |
| **總站** `index_v5` 進某大模組後，其左欄選單 | **同上：只換右欄** | 頂欄1 換大模組；或文案含「換模組」的 `module` |

**現況（抽樣，非宣稱已 100%）**

| 模組 | 地圖內多為右欄？ | 仍有換側欄？ |
|------|------------------|--------------|
| 聖經研讀 | 是（大量 contentFrame） | 少 |
| 教材／語言 | 是 | 少 |
| AI Lab | 是（data-b100-path） | 少 |
| 詩歌 | 是 | 少 |
| 學校 | 大致是 | 有少數跨到門訓／AI |
| 教會規劃 | 大致是 | 有少數到 help／nav |
| **教會事工** | A–F 多數是；**C 已改為預設右欄** | 仍有明示「換模組／專用側欄」捷徑 |
| Q&A | 特殊 loader／frameset | 與雙欄契約不同族 |

→ **理念已定；全站清乾淨＝W3 波次**，按模組掃，不一次改完。

---

## 2. 全站前綴（粗編號，現在就能追蹤）

細號格式建議：`{前綴}-{區}-{序}`  
例：教會已有 `0-01` → 全站寫作 **`CM-0-01`**（或文件內寫「CM · 0-01」）。

| 前綴 | 大模組／範圍 | 細編號狀態 | 主殼／主側欄（慣例） |
|------|--------------|------------|----------------------|
| **MAT** | 教材與培訓／languages | 未細編 | `languages/index.html` + `index_cn.html` 等 |
| **BS** | 聖經研讀 | **已有** `bible_study/docs/PAGE_MATURITY_BS.md`（BS-L0 / BS-01…） | `bible_study/index.html` + `sidebar.html` |
| **QNA** | 聖經難題 | 未細編 | Hub QnA loader／`qna_*` |
| **CM** | 教會事工 | **已細編 0–F**；長則欄 A–F **預設只換右欄**；換左欄集中在「離開本模組」 | `church_ministry/index.html` + `sidebar_church_layout_v1` |
| **PLAN** | 教會規劃 OS | 未細編 | Hub：`sidebar_plan_v5_preview.html` + `index_plan.html`（G L2 事工桌 SSOT） |
| **SCH** | 學校管理 | 未細編 | `school_management/index.html` + `sidebar.html` |
| **AI** | AI 輔助／Lab | 未細編 | `ai_tools` + `sidebar_lab`／`sidebar` |
| **HY** | 詩歌管理 | 未細編 | `hymn_management` |
| **NAV** | 目錄搜索／nav_hub | 未細編 | `nav_hub` |
| **HELP** | 說明／導覽憲法 | 未細編 | `help/` |
| **SMART** | 智慧事奉（若仍獨立露出） | 未細編 | `smart_ministry` |
| **DD** | 門訓動力站（獨立模組夾） | 未細編 | `disciple_dynamics` — **與 CM-C 易重複** |

輪到某模組做 W1：複製 `MODULE_MAP_SSOT_TEMPLATE.md` → `{module}/docs/PAGE_MATURITY_{前綴}.md`，區碼自訂（勿再發明第二套「0–F」除非該模真是教會）。

---

## 3. 為何「先粗後細」仍能防重複？

細編號可以晚做；**跨模相似功能**靠本檔 **§4 觀察表** + 路徑關鍵字：

1. 新頁開工前搜：同名（會友／探訪／門訓／排班／AI 助手）。  
2. 若已有 **CM-*** 或他前綴列管 → 議決合併／捷徑／下架，不開雙真相。  
3. 教會細表仍是最完整範本；他模細編時**必須**回填本註冊表「細編號狀態＝已有連結」。

---

## 4. 跨模疑似重複／相似（觀察表 · 非定罪）

| 主題 | 可能落點 | 建議 |
|------|----------|------|
| 會友／名冊 | CM-0-01；SCH 學籍；SMART 人才 | **人員主鍵**一律對齊 `member_id`；名冊 UI 以 CM 為營運主，他模讀介面 |
| 財務／交費 | CM-F-04；舊 F-05／F-08 | **唯一帳** `financeSystemData`／F-04；活動交費不另開產品頁 |
| 人材／配對 | SMART Canonical；CM-0-16 進階；CRM 媒合 DEMO | `talent_id`＝`member_id`；日常排班＝0-03 |
| 探訪／關懷 | CM-0-02；SMART／care 類 | 合併或深鏈 CM，勿兩套待辦 |
| 義工排班 | CM-0-03 | 他模只捷徑 |
| 門訓／門徒 | CM-C（主日學／門訓站）；`disciple_dynamics`；SCH | W1 時三選一主路徑 |
| 主日學／教育 | CM-C-01；SCH 課程 | 教會內＝會友門訓；學校＝學籍體制，文案分開 |
| AI 備課／助手 | AI Lab；CM-C 換模組；SMART | 工具在 AI；教會只留出口 |
| 規劃／健康／SWOT | PLAN；CM 頂欄「教會規劃」 | 一律 PLAN 殼，CM 不雙開 |
| 詩歌 | HY；CM-A 詩歌庫 | A＝敬拜選用；HY＝曲庫管理，可互鏈 |
| CRM／營運自動 | AI「營運自動化」；CM-0 旅程 | 對外一個「CRM」稱呼；另一個標自動化控制台 |

完整教會頁列：`church_ministry/docs/PAGE_MATURITY_INVENTORY_0AF.md`  
CRM／行政串連議決：`church_ministry/docs/DATA_LINK_CRM_ADMIN_V1.md`  
**阶段 0 全站 Lite 总检（危机+未成熟）：** [`SITE_WIDE_LITE_AUDIT_V0.md`](./SITE_WIDE_LITE_AUDIT_V0.md)  
**跨模数据契约：** [`CROSS_MODULE_DATA_CONTRACT_V1.md`](./CROSS_MODULE_DATA_CONTRACT_V1.md)  
一鍵查驗：`http://127.0.0.1:8080/church_ministry/docs/qa_tracker_0af.html`

### §4.1 阶段 0 决议状态（2026-07-29）

| 主題 | 决议 | 危机 ID |
|------|------|---------|
| 會友／名冊 | CM 写 `memberSystemData`；他模只读 / `externalId` | C-05 |
| 財務 | CM `financeSystemData` 唯一 | — |
| 人材／配對 | PLAN matchmaker live + SMART canonical | C-01 ✅, C-06 阶段1B |
| 探訪／關懷 | CM 唯一待办写 | — |
| 義工排班 | CM `volunteer_shift` 唯一 | leave-swap 占位 P2 |
| 門訓 | **CM-C 主路**；DD 为内容库只读深链 | — |
| 主日學 | CM-C vs SCH 学籍文案分离 | — |
| AI | 工具在 AI；CM 口述预填出口 | 命名 P2 |
| 規劃 | PLAN 壳；CM 只链回 | — |
| 詩歌 | HY SSOT；Hub F = `dashboard.html` 非 L0 壳 | C-02 ✅ |
| CRM | 退役 guide_crm_*；步 6 非 CRM 品牌 | C-04 ✅ |


---

## 5. 與 index_v5／獨立 index 的對照檢查清單

每個大模組驗收（W2–W3）打勾：

- [ ] 有 Standalone `index.html`（或明確說明 Hub-only）  
- [ ] 有主側欄；地圖內選單 → **右欄**  
- [ ] 跨大模組 → 文案 **換模組** + `module`／頂欄1  
- [ ] 本註冊表前綴列已填「細編號狀態」  
- [ ] 疑似重複已對照 §4  

---

## 6. 你可怎麼用

| 需求 | 做法 |
|------|------|
| 現在追蹤教會頁 | 用 **CM-0-xx／A-xx…**（既有表） |
| 現在防全站重複 | 用本檔 **§2 前綴 + §4 觀察表** |
| 輪到聖經研讀 | 維護 `bible_study/docs/PAGE_MATURITY_BS.md`，前綴 **BS**；本檔 §2 狀態＝已有細表 |
| 統一「只走 iframe」 | 按模組做 W3，以教會 C 為樣板 |

---

**結論**：全站**尚無**像教會那樣完整的頁級統一編號；已有**全站前綴＋重複觀察表**。細編號可「輪到再加」；重複風險靠 §4 與搜尋，不必等七模全編號才開始防雙真相。
