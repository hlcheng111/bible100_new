/**
 * Pastoral follow-up Bridge API tests (Node + localStorage mock).
 * Run: node tests/test_visitation_followup_bridge.js
 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.join(__dirname, '..');
var store = {};

function resetStore() {
  store = {};
}

function makeLocalStorage() {
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; },
    clear: function () { store = {}; }
  };
}

function loadScript(relativePath, context) {
  var code = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
  vm.runInContext(code, context, { filename: relativePath });
}

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

function seedFixtures(ctx) {
  ctx.localStorage.setItem('memberSystemData', JSON.stringify({
    members: [
      { id: 101, memberId: 101, name: '王弟兄' },
      { id: 102, memberId: 102, name: '李姊妹' }
    ],
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
    ChurchAuth: {
      assertCan: function () {},
      isAuthRequired: function () { return false; }
    }
  };
  ctx.window = ctx;
  ctx.global = ctx;
  var sandbox = vm.createContext(ctx);
  loadScript('js/cloud_config.js', sandbox);
  loadScript('js/church_data_bridge.js', sandbox);
  seedFixtures(sandbox);
  return sandbox;
}

function clearA2DemoInStore(Bridge) {
  var storeData = Bridge.getPastoralFollowupData();
  storeData.tasks = (storeData.tasks || []).filter(function (t) {
    return t.source !== 'a2_demo_seed';
  });
  Bridge.savePastoralFollowupData(storeData);
}

function loadA2DemoSeeds(Bridge) {
  var today = new Date().toISOString().slice(0, 10);
  var d5 = new Date();
  d5.setDate(d5.getDate() + 5);
  var dPast = new Date();
  dPast.setDate(dPast.getDate() - 2);
  [
    { member_id: 801, reason: '新人', priority: 'urgent', due_date: today, status: 'pending', source: 'a2_demo_seed' },
    { member_id: 802, reason: '久未出席', priority: 'high', due_date: d5.toISOString().slice(0, 10), status: 'pending', source: 'a2_demo_seed' },
    { member_id: 803, reason: '已完成', priority: 'normal', due_date: dPast.toISOString().slice(0, 10), status: 'completed', source: 'a2_demo_seed' }
  ].forEach(function (row) {
    Bridge.savePastoralFollowup(row);
  });
}

function runGovernanceTests(ctx) {
  loadScript('js/data_trust_badge.js', ctx);
  var DTB = ctx.DataTrustBadge;
  assert(DTB && DTB.getDemoGovernanceSummary, 'getDemoGovernanceSummary exists');
  var g = DTB.getDemoGovernanceSummary();
  assert(g.ok && g.markers && g.datasets, 'governance summary shape');
  assert(g.markers.visitation_followup.key === 'visitation_followup_demo_loaded_at', 'a2 marker key');

  var Bridge = ctx.ChurchDataBridge;
  Bridge.savePastoralFollowup({
    member_id: 101,
    reason: '正式跟進',
    source: 'visitation_followup_tool',
    status: 'pending'
  });
  loadA2DemoSeeds(Bridge);
  var before = Bridge.listPastoralFollowups({}).length;
  var cleared = DTB.clearVisitationFollowupA2Demo();
  assert(cleared.ok, 'clearVisitationFollowupA2Demo ok');
  var after = Bridge.listPastoralFollowups({});
  assert(after.filter(function (t) { return t.source === 'a2_demo_seed'; }).length === 0, 'a2_demo_seed removed');
  assert(after.some(function (t) { return t.source === 'visitation_followup_tool'; }), 'real followup kept');
  assert(!DTB.isVisitationFollowupDemoLoaded(), 'a2 marker cleared');

  ctx.localStorage.setItem('schoolMasterDatabase', JSON.stringify({
    students: [{ id: 1, name: 'S1' }],
    teachers: [],
    courses: [],
    meta: { isDemoSeed: true }
  }));
  ctx.localStorage.setItem('school_management_demo_loaded_at', new Date().toISOString());
  var schoolClear = DTB.clearSchoolDemoMarker();
  assert(schoolClear.ok && schoolClear.school_data_preserved, 'school data preserved');
  var schoolRaw = ctx.localStorage.getItem('schoolMasterDatabase');
  assert(schoolRaw && schoolRaw.indexOf('S1') >= 0, 'school students not deleted');
  assert(!ctx.localStorage.getItem('school_management_demo_loaded_at'), 'school marker removed');
  console.log('demo governance A2/School tests PASS');
}

function run() {
  var ctx = boot();
  var Bridge = ctx.ChurchDataBridge;
  assert(Bridge && Bridge.savePastoralFollowup, 'ChurchDataBridge loaded');

  var created = Bridge.savePastoralFollowup({
    member_id: 101,
    reason: '新人跟進',
    priority: 'high',
    due_date: '2026-06-10',
    status: 'pending',
    source: 'visitation_followup_tool',
    note: '正式資料 note'
  });
  assert(created.ok && created.task && created.task.id, 'savePastoralFollowup creates task');
  assert(created.pastoral_snippet && created.pastoral_snippet.indexOf('不會自動發送') >= 0, 'snippet has no-auto-send');

  var realId = created.task.id;
  var filtered = Bridge.listPastoralFollowups({ memberId: 101, priority: 'high' });
  assert(filtered.length >= 1, 'listPastoralFollowups filter member+priority');

  var sum = Bridge.getPastoralFollowupSummary(7);
  assert(sum.pending >= 1 && sum.high_priority >= 1, 'getPastoralFollowupSummary counts');

  var sn = Bridge.buildPastoralFollowupSnippet(created.task);
  assert(sn.indexOf('王弟兄') >= 0, 'buildPastoralFollowupSnippet uses member name');
  assert(sn.indexOf('正式資料 note') < 0, 'snippet must not include note full text');
  assert(sn.indexOf(created.task.note) < 0, 'snippet must not leak task.note');

  var stub = Bridge.promotePastoralAlertToFollowup('nonexistent_alert', {});
  assert(stub.ok === false && stub.stub, 'promote stub returns clear status');

  loadA2DemoSeeds(Bridge);
  var all = Bridge.listPastoralFollowups({});
  var demoCount = all.filter(function (t) { return t.source === 'a2_demo_seed'; }).length;
  assert(demoCount === 3, 'A2 demo seed has 3 rows');

  var urgent = Bridge.listPastoralFollowups({ priority: 'urgent' });
  assert(urgent.length >= 1, 'demo has urgent');

  clearA2DemoInStore(Bridge);
  var afterClear = Bridge.listPastoralFollowups({ memberId: 101 });
  assert(afterClear.some(function (t) { return String(t.id) === String(realId); }), 'clear demo keeps real task');
  var demoLeft = Bridge.listPastoralFollowups({}).filter(function (t) { return t.source === 'a2_demo_seed'; });
  assert(demoLeft.length === 0, 'clear demo removes a2_demo_seed only');

  console.log('OK: visitation_followup bridge tests passed');
  runGovernanceTests(ctx);
}

run();
