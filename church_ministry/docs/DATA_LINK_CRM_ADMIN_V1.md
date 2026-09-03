# CRM／行政 · 資料串連技術備忘（合併議決配套）

> **日期**：2026-07-24  
> **範圍**：只定契約與合併方向，**不開新功能頁**。  
> **驗收視角**：`index_v5.html` → 教會事工 → 長則欄／CRM 側欄文案。  
> **相關**：`ENTRY_PATH_SSOT_M3.md` · `PAGE_MATURITY_INVENTORY_0AF.md` · `smart_ministry/docs/SMART_MINISTRY_DATA_RULES.md`

---

## 三優先域（你點名的）

### 1）會友主檔 · 教育／學校註冊

| 項目 | 契約 |
|------|------|
| **營運主檔（唯一寫入）** | `localStorage.memberSystemData` 經 `ChurchDataBridge`（`js/church_data_bridge.js`） |
| **人員主鍵** | `memberId`（＝會友 `id`；文件亦稱 `member_id`） |
| **輔助** | `CentralMemberDB` 薄封裝；可同步進 `churchMasterDatabase.members` |
| **教會教育** | `educationSystemData`／Bridge → 班級名冊欄位掛 `memberId`（C-01） |
| **學校管理** | `schoolMasterDatabase`（獨立庫）— 對人須**連結**既有 `memberId`，禁止另造永久人員 PK |
| **頁面主路徑** | **CM-0-01** `modules/members/member-integrated.html` |
| **合併** | F-02 人員總覽、B-11／F-03 捷徑 → 同 0-01；側欄不得再宣傳第二套「名冊產品」 |

### 2）教會財政 · 收支 · 活動交費

| 項目 | 契約 |
|------|------|
| **正式庫** | `financeSystemData` 經 `ChurchDataBridge`（`getFinanceData`／`saveFinanceSystemData`／交易寫入） |
| **主頁** | **CM-F-04** `modules/finance/finance-integrated.html` |
| **合併** | F-05 `financial-management.html` → **合併→F-04**（勿雙帳） |
| **活動交費** | 技術上應為 F-04 交易＋可選 `memberId` 關聯；**本波不新開頁**；舊「社群捐款人」F-08 暫標 DEMO／待接 F-04 或下架 |
| **禁止** | 頁面直寫 `financeIncomes` 等舊鍵當真相 |

### 3）人材調查 · 事工配對

| 項目 | 契約 |
|------|------|
| **正式庫** | `bible100_smart_ministry_main` 經 `SmartMinistryCanonical` |
| **主鍵** | `talent_id` **＝** `member_id`（對齊會友，不另造人才 ID） |
| **與志工** | Bridge／配對結果可進 `volunteerSystemData`；**日常排班主路徑仍是 0-03** |
| **頁面** | 人材／配對 UI 在 **smart_ministry/**；CM 側欄不另開第二套「媒合營運」 |
| **CRM 0-10 媒合** | Hub DEMO → **下架營運**／僅教學；真配對走 SMART＋memberId |

---

## 串連示意（讀寫方向）

```
會友 0-01 (memberSystemData / memberId)
    ├──→ 教育 C-01（educationSystemData.memberId）
    ├──→ 學校 SCH（schoolMasterDatabase 連結 memberId）
    ├──→ 財務 F-04（交易可掛 memberId）
    ├──→ 探訪 0-02 / 排班 0-03
    └──→ SMART（talent_id = member_id）→ 崗位／配對
              └──→ 進階 0-16；日常排班仍 0-03
```

**工程守則**：跨域只經 Bridge／SmartMinistryCanonical；禁止各頁私寫第二桶同概念資料。

---

## 本波側欄清理對照（合併／下架文案）

| 原入口 | 議決 | 側欄作法 |
|--------|------|----------|
| 人員總覽 F-02 | **合併→0-01** | 改連會友主檔，標「同 0-01」 |
| 財務管理 F-05 | **合併→F-04** | 改連財務事工 |
| 會眾統計等 F-10～13 | **合併→F-01** | 改連戰情儀表板，標「見戰情」 |
| 數位化轉型／新技術／智能工具 F-17／22／23 | **下架營運** | 側欄標「僅說明／待刪」或收進 DEMO 並指向幫助 |
| 志工體系 E-02 | **合併宣傳→0-16 進階** | 保留進階，禁止與 0-03 並列「主」 |

---

## 非本波（明確不做）

- 不新開「註冊中心／交費中心／人材調查」頁  
- 不自動遷移舊 `finance*`／`smart_ministry_linking` 資料（僅文件標風險）  
- 不改學校／SMART 內部大重構（只定對齊 `memberId`）

驗收：`index_v5` → 教會 → F／E／B 點「會友／財務／統計」應落到 **0-01／F-04／F-01**，而非舊別名頁當主產品。
