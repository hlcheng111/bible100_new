/**
 * Volunteer shift Bridge API tests (Node + localStorage mock).
 * Run: node tests/test_volunteer_shift_bridge.js
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
    members: [{ id: 101, memberId: 101, name: '王弟兄', fullName: '王弟兄' }],
    groups: []
  }));
  ctx.localStorage.setItem('volunteerSystemData', JSON.stringify({
    ministries: [{ id: 1, name: '招待同工', category: 'hospitality', needPeople: 4 }],
    assignments: [{ id: 1, memberId: 102, memberName: '李姊妹', ministryId: 1, status: 'active' }],
    schedules: [
      { id: 1, memberId: 101, memberName: '王弟兄', ministryId: 1, date: '2026-06-01', shift: '主日崇拜', confirmed: true },
      { id: 2, memberId: 101, memberName: '王弟兄', ministryId: 1, date: '2026-06-15', shift: '主日崇拜', confirmed: false }
    ]
  }));
  ctx.localStorage.setItem('bible100_smart_ministry_main', JSON.stringify({
    schema_version: 1,
    talents: [],
    talent_skill: [],
    ministry_assignment: [{
      id: 'asgn_test_1',
      talent_id: '101',
      ministry_id: 'vol_1',
      ministry_name: '招待同工',
      status: 'suggested',
      metadata: { matchScore: 91 }
    }],
    ministries: [],
    assessments: [],
    meta: {}
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
  loadScript('js/smart_ministry_canonical_store.js', sandbox);
  loadScript('js/church_data_bridge.js', sandbox);
  seedFixtures(sandbox);
  return sandbox;
}

function run() {
  var ctx = boot();
  var Bridge = ctx.ChurchDataBridge;
  assert(Bridge && Bridge.saveVolunteerShift, 'ChurchDataBridge loaded');

  var created = Bridge.saveVolunteerShift({
    member_id: 101,
    ministry_id: 1,
    date: '2026-06-20',
    shift: '主日崇拜',
    note: 'test create'
  });
  assert(created.ok === true, 'saveVolunteerShift ok');
  assert(created.schedule && created.schedule.id, 'schedule has id');
  assert(created.leader_outreach_snippet && created.leader_outreach_snippet.indexOf('王弟兄') >= 0, 'snippet');

  var all = Bridge.listVolunteerShifts({});
  assert(all.length >= 3, 'listVolunteerShifts total');

  var byMember = Bridge.listVolunteerShifts({ memberId: 101 });
  assert(byMember.length >= 3, 'filter memberId');

  var pending = Bridge.listVolunteerShifts({ confirmed: false });
  assert(pending.every(function (s) { return !s.confirmed; }), 'filter confirmed false');

  var ranged = Bridge.listVolunteerShifts({ fromDate: '2026-06-10', toDate: '2026-06-25' });
  assert(ranged.length >= 2, 'filter date range');

  var sum = Bridge.getVolunteerShiftSummary(30);
  assert(sum.total >= 3, 'summary total');
  assert(typeof sum.pending_confirm === 'number', 'summary pending');
  assert(sum.pending_ctv_suggestions >= 1, 'summary ctv count');

  var candidates = Bridge.listShiftCandidates({ include_volunteer_pool: true });
  var hasCtv = candidates.some(function (c) { return c.type === 'ctv_suggestion'; });
  var hasPool = candidates.some(function (c) { return c.type === 'volunteer_pool'; });
  assert(hasCtv, 'listShiftCandidates ctv_suggestion');
  assert(hasPool, 'listShiftCandidates volunteer_pool');

  var promoted = Bridge.promoteAssignmentToShift('asgn_test_1', {
    date: '2026-06-22',
    shift: '週三禱告'
  });
  assert(promoted.ok === true, 'promoteAssignmentToShift ok');
  assert(promoted.schedule && promoted.schedule.date === '2026-06-22', 'promoted schedule date');

  var assign = (ctx.SmartMinistryCanonical.listMinistryAssignments() || []).find(function (a) {
    return a.id === 'asgn_test_1';
  });
  assert(assign && String(assign.status).toLowerCase() === 'active', 'assignment status active');

  var listed = Bridge.listVolunteerShifts({ fromDate: '2026-06-22', toDate: '2026-06-22' });
  assert(listed.some(function (s) { return s.date === '2026-06-22' && String(s.memberId) === '101'; }), 'dashboard/list same row');

  console.log('volunteer_shift Bridge tests PASS (' + all.length + ' shifts)');
}

function runA1DemoSeedTest() {
  var ctx = boot();
  loadScript('js/data_trust_badge.js', ctx);
  loadScript('church_ministry/tools/volunteer_shift/tool.js', ctx);
  var r = ctx.VolunteerShiftTool.loadA1DemoData();
  assert(r.ok === true, 'loadA1DemoData ok');
  assert(r.members === 3, 'demo members');
  assert(ctx.DataTrustBadge.isVolunteerShiftDemoLoaded(), 'demo marker set');
  var state = ctx.DataTrustBadge.classifyDataState({
    source_key: 'volunteerSystemData.schedules',
    count: ctx.ChurchDataBridge.getVolunteerShiftSummary(30).total,
    demoFlag: true
  });
  assert(state === 'demo' || state === 'mixed', 'classify demo/mixed');
  var sum = ctx.ChurchDataBridge.getVolunteerShiftSummary(30);
  assert(sum.total >= 2, 'demo shifts visible');
  var pending = ctx.ChurchDataBridge.listPendingMinistrySuggestions() || [];
  assert(pending.length >= 1, 'demo ctv pending');
  var cleared = ctx.DataTrustBadge.clearVolunteerShiftA1Demo();
  assert(cleared.ok === true, 'clear demo ok');
  assert(!ctx.DataTrustBadge.isVolunteerShiftDemoLoaded(), 'demo marker cleared');
  var volAfter = JSON.parse(ctx.localStorage.getItem('volunteerSystemData') || '{}');
  assert(!(volAfter.schedules || []).some(function (s) { return s.source === 'a1_demo_seed'; }), 'only a1_demo_seed removed');
  assert((volAfter.schedules || []).some(function (s) { return s.source !== 'a1_demo_seed'; }), 'non-demo schedule kept');
  var g = ctx.DataTrustBadge.getDemoGovernanceSummary();
  assert(g && g.datasets.volunteerSystemData_schedules, 'getDemoGovernanceSummary in A1 test');
  console.log('volunteer_shift A1 demo seed PASS');
}

run();
runA1DemoSeedTest();
