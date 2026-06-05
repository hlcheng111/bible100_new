/**
 * Finance reconciliation Bridge API tests.
 * Run: node tests/test_finance_reconciliation_bridge.js
 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.join(__dirname, '..');
var store = {};

function resetStore() { store = {}; }

function makeLocalStorage() {
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; },
    clear: function () { store = {}; }
  };
}

function loadScript(relativePath, context) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'), context, { filename: relativePath });
}

function assert(cond, msg) {
  if (!cond) { console.error('FAIL:', msg); process.exit(1); }
}

function seedFixtures(ctx) {
  ctx.localStorage.setItem('memberSystemData', JSON.stringify({
    members: [{ id: 101, memberId: 101, name: '王弟兄' }],
    groups: []
  }));
}

function boot() {
  resetStore();
  var ctx = {
    console: console,
    localStorage: makeLocalStorage(),
    window: null,
    global: null,
    CHURCH_CLOUD_CONFIG: { USE_API: false, REQUIRE_AUTH: false },
    ChurchAuth: { assertCan: function () {}, isAuthRequired: function () { return false; } }
  };
  ctx.window = ctx;
  ctx.global = ctx;
  var sandbox = vm.createContext(ctx);
  loadScript('js/cloud_config.js', sandbox);
  loadScript('js/church_data_bridge.js', sandbox);
  seedFixtures(sandbox);
  return sandbox;
}

function loadA3DemoSeeds(Bridge) {
  [
    { member_id: 701, amount: 100, status: 'pending', source: 'a3_demo_seed' },
    { member_id: 702, amount: 200, status: 'reconciled', source: 'a3_demo_seed' },
    { member_id: 703, amount: 50, status: 'exception', source: 'a3_demo_seed' }
  ].forEach(function (row) {
    Bridge.saveFinanceReconciliationRecord(row);
  });
}

function run() {
  var ctx = boot();
  var Bridge = ctx.ChurchDataBridge;
  assert(Bridge && Bridge.saveFinanceReconciliationRecord, 'Bridge loaded');

  var created = Bridge.saveFinanceReconciliationRecord({
    member_id: 101,
    amount: 888,
    fund: '建堂',
    status: 'pending',
    note: '正式財務 note 機密',
    source: 'finance_reconciliation_tool'
  });
  assert(created.ok && created.record.id, 'save record');
  var sn = Bridge.buildFinanceReceiptSnippet(created.record);
  assert(sn.indexOf('正式財務 note') < 0, 'snippet excludes note');
  assert(sn.indexOf('不會自動發送') >= 0, 'snippet no auto send');

  var filtered = Bridge.listFinanceReconciliationRecords({ memberId: 101, status: 'pending' });
  assert(filtered.length >= 1, 'list filter');

  var sum = Bridge.getFinanceReconciliationSummary(30);
  assert(sum.total_records >= 1 && sum.pending >= 1, 'summary');

  var realId = created.record.id;
  var marked = Bridge.markFinanceRecordReconciled(realId, { receipt_status: 'copied' });
  assert(marked.record.status === 'reconciled', 'mark reconciled');

  loadA3DemoSeeds(Bridge);
  assert(Bridge.listFinanceReconciliationRecords({}).filter(function (r) { return r.source === 'a3_demo_seed'; }).length === 3, 'demo seed');

  loadScript('js/data_trust_badge.js', ctx);
  var g = ctx.DataTrustBadge.getDemoGovernanceSummary();
  assert(g.datasets.financeReconciliationData_records, 'governance has A3');

  var cleared = ctx.DataTrustBadge.clearFinanceReconciliationA3Demo();
  assert(cleared.ok, 'clear A3');
  assert(!Bridge.listFinanceReconciliationRecords({}).some(function (r) { return r.source === 'a3_demo_seed'; }), 'no a3_demo_seed');
  assert(Bridge.listFinanceReconciliationRecords({ memberId: 101 }).length >= 1, 'real kept');

  console.log('OK: finance_reconciliation bridge tests passed');
}

run();
