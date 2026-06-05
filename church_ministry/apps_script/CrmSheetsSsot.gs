/**
 * CRM Sheets SSOT · Web App 動作（部署後將網址填入 cloud_config.SHEETS_WEB_APP_URL）
 * 表：members, pastoral_events, ministry_logs（見 v2 Schema）
 * 信封：{ ok, action, data, meta, error }
 */
var CRM_CONTRACT_VERSION = 'crm-sheets-v1';

function doGet(e) {
  return handleCrmRequest_(e, 'GET');
}

function doPost(e) {
  return handleCrmRequest_(e, 'POST');
}

function handleCrmRequest_(e, method) {
  var action = (e && e.parameter && e.parameter.action) || '';
  try {
    var data = dispatchCrm_(action, e, method);
    return crmJson_(true, action, data, { contractVersion: CRM_CONTRACT_VERSION });
  } catch (err) {
    return crmJson_(false, action, null, { contractVersion: CRM_CONTRACT_VERSION }, {
      code: 'CRM_SHEETS_ERROR',
      message: err && err.message ? err.message : String(err)
    });
  }
}

function dispatchCrm_(action, e, method) {
  if (action === 'getMembers') return getMembers_();
  if (action === 'getCrmSnapshot') return { members: getMembers_(), note: 'read-only snapshot' };
  if (action === 'appendPastoralEvent' && method === 'POST') {
    return appendPastoralEvent_(parsePostBody_(e));
  }
  if (action === 'saveMembersBatch' && method === 'POST') {
    return saveMembersBatch_(parsePostBody_(e));
  }
  throw new Error('Unsupported CRM action: ' + action);
}

function getMembers_() {
  var sh = SpreadsheetApp.getActive().getSheetByName('members');
  if (!sh) return [];
  var rows = sh.getDataRange().getValues();
  if (rows.length < 2) return [];
  var headers = rows[0];
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    out.push(rowToObject_(headers, rows[i]));
  }
  return out;
}

function appendPastoralEvent_(payload) {
  var sh = SpreadsheetApp.getActive().getSheetByName('ministry_logs') ||
    SpreadsheetApp.getActive().getSheetByName('pastoral_events');
  if (!sh) throw new Error('missing ministry_logs sheet');
  var now = new Date().toISOString();
  sh.appendRow([
    payload.event_id || ('pe_' + Date.now()),
    payload.member_id || '',
    payload.event_type || 'care_call',
    payload.summary || '',
    payload.ts || now,
    payload.source_module || 'sheets_ssot',
    JSON.stringify(payload.metadata || {})
  ]);
  return { event_id: payload.event_id, stored: true };
}

function saveMembersBatch_(payload) {
  var members = (payload && payload.members) ? payload.members : [];
  return { received: members.length, note: 'Implement row upsert per MEMBER_DATA_MODEL headers' };
}

function rowToObject_(headers, row) {
  var o = {};
  for (var i = 0; i < headers.length; i++) {
    o[String(headers[i])] = row[i];
  }
  return o;
}

function parsePostBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return {};
  }
}

function crmJson_(ok, action, data, meta, errorObj) {
  var body = { ok: ok, action: action || '', data: data == null ? null : data, meta: meta || {} };
  if (!ok) body.error = errorObj || { code: 'UNKNOWN', message: 'error' };
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
