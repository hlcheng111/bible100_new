/**
 * Google Apps Script — 貼到試算表「擴充功能 > Apps Script」
 * 每日觸發 importFromSheets Cloud Function
 */
var IMPORT_URL = 'https://REGION-PROJECT.cloudfunctions.net/importFromSheets';
var IMPORT_SECRET = 'YOUR_IMPORT_SECRET';

function dailyImportAll() {
  var tabs = ['registrations', 'resources', 'vouchers'];
  tabs.forEach(function (tab) {
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-import-secret': IMPORT_SECRET },
      payload: JSON.stringify({ tab: tab }),
      muteHttpExceptions: true,
    };
    var res = UrlFetchApp.fetch(IMPORT_URL, options);
    Logger.log(tab + ': ' + res.getContentText());
  });
}

function createDailyTrigger() {
  ScriptApp.newTrigger('dailyImportAll')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
}
