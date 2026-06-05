# 小白友善雲端儀表板：GAS + Looker + Sites

目標：管理員只在 Google Sheets/Forms 維護資料，使用者只開 Google Sites 看圖，不需要操作 Looker Studio。

---

## 1) 前端頁面（已建立）

- 檔案：`church_ministry/dashboard_cloud.html`
- 已預留 3 個 iframe：
  - 會友總覽
  - 報名與參與率
  - 分區與教會分布
- 請在頁面中的 `CONFIG` 設定：
  - `LOOKER_EMBED_URL_A/B/C`
  - `MEMBERS_SHEET_URL`
  - `GAS_STATS_URL`（可選）

---

## 2) GAS：資料變更時更新「最後同步時間」

> 說明：Looker Studio 對 Google Sheets 本來就會自動抓最新資料，不一定要 GAS 才能更新。  
> 這段 GAS 的用途是：當 `members` 工作表變動時，額外寫一個時間戳（給前端顯示同步狀態）。

把以下程式貼到 Google Apps Script：

```javascript
const MEMBERS_SHEET = 'members';
const META_SHEET = 'automation_logs';

function onEdit(e) {
  try {
    var range = e && e.range;
    if (!range) return;
    var sheet = range.getSheet();
    if (!sheet || sheet.getName() !== MEMBERS_SHEET) return;
    writeSyncLog_('members edited');
  } catch (err) {
    // no-op
  }
}

function onChange(e) {
  try {
    writeSyncLog_('spreadsheet changed: ' + ((e && e.changeType) || 'unknown'));
  } catch (err) {
    // no-op
  }
}

function writeSyncLog_(message) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(META_SHEET);
  if (!sh) sh = ss.insertSheet(META_SHEET);

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 4).setValues([['logged_at', 'level', 'message', 'payload']]);
  }

  sh.appendRow([new Date().toISOString(), 'INFO', message, '{}']);
}

function getStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(MEMBERS_SHEET);
  if (!sh) return { ok: true, total: 0, registered_ratio_pct: 0, updated_at: new Date().toISOString() };

  var values = sh.getDataRange().getValues();
  if (values.length <= 1) return { ok: true, total: 0, registered_ratio_pct: 0, updated_at: new Date().toISOString() };

  var header = values[0];
  var rows = values.slice(1);
  var idxRegistered = header.indexOf('registered');
  var total = rows.length;
  var registered = 0;
  if (idxRegistered >= 0) {
    rows.forEach(function (r) {
      if (Number(r[idxRegistered]) === 1) registered += 1;
    });
  }
  var ratio = total > 0 ? Math.round((registered / total) * 1000) / 10 : 0;

  return {
    ok: true,
    total: total,
    registered: registered,
    registered_ratio_pct: ratio,
    updated_at: new Date().toISOString()
  };
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'stats';
  if (action === 'stats') {
    return ContentService
      .createTextOutput(JSON.stringify(getStats()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, message: 'unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 3) Google 介面設定步驟（你手動操作）

1. **Apps Script 綁定你的 members 試算表**
2. 儲存程式碼
3. 左側 **Triggers（觸發條件）**：
   - 新增 `onEdit`（事件來源：From spreadsheet，事件：On edit）
   - 新增 `onChange`（事件來源：From spreadsheet，事件：On change）
4. **Deploy -> New deployment -> Web app**
   - Execute as: Me
   - Who has access: Anyone with link（或你的組織可讀）
5. 拿到 Web App URL，前端使用：
   - `https://script.google.com/.../exec?action=stats`
6. 回到 `dashboard_cloud.html`，把 `GAS_STATS_URL` 填入上面網址。

---

## 4) Looker 隱藏化（給小白看，不給小白管）

1. 在 Looker Studio 開報表 -> **分享/嵌入**
2. 開啟「允許嵌入」，取得 3 個報表或 3 個頁面 URL
3. 填到 `dashboard_cloud.html` 的：
   - `LOOKER_EMBED_URL_A/B/C`
4. 管理員平常只開 Sheets 維護資料；使用者只看 Sites。

---

## 5) Google Sites 上線（簡易入口）

1. 開 Google Sites 首頁
2. 插入 -> **嵌入** -> URL
3. 放入 `dashboard_cloud.html` 可公開存取的網址（例如你部署的位置）
4. 在首頁加一個按鈕「會友雲端儀表板」連到該頁
5. 發佈 Sites

完成後流程為：

- 貼 Excel / Form 進 Sheets
- Looker 自動抓最新資料
- Sites 內嵌頁刷新即看到新圖表

