/**
 * 研究與統計頁 · 自 ChurchDataBridge 匯總真實欄位（本機 demo）
 * 需在 church_data_bridge.js 之後載入。
 */
(function (global) {
  'use strict';

  function safeBridge() {
    return global.ChurchDataBridge || null;
  }

  function getSnapshot() {
    var B = safeBridge();
    var members = B ? B.getMembers() : [];
    var groups = B ? B.getGroups() : [];
    var vis = B ? B.getVisitationData() : { missions: [] };
    var missions = (vis && vis.missions) ? vis.missions : [];
    var vol = B ? B.getVolunteerData() : {};
    var assignments = (vol && vol.assignments) ? vol.assignments : [];
    var fin = B ? B.getFinanceSummary() : { income: 0, expense: 0, balance: 0 };
    var school = B ? B.getSchoolMinistrySummary() : null;
    var classes = B ? B.getDiscipleClasses() : [];
    var active = 0;
    members.forEach(function (m) {
      var st = (m.status || m.membershipStatus || '').toString().toLowerCase();
      if (st === 'left' || st === 'inactive' || st === 'transferred') return;
      active++;
    });
    var hint = B && typeof B.getDataSourceHint === 'function' ? B.getDataSourceHint() : '本機 localStorage。';

    var memberStats = (B && typeof B.getMemberSystemSnapshotForStats === 'function')
      ? B.getMemberSystemSnapshotForStats()
      : { memberCount: members.length, baptizedCount: 0, membersWithEducationHistory: 0, membersWithDiscipleshipProgress: 0 };

    return {
      memberCount: members.length,
      groupCount: groups.length,
      missionCount: missions.length,
      activeMemberCount: active,
      volunteerAssignmentCount: assignments.length,
      finance: fin,
      school: school,
      discipleClassCount: Array.isArray(classes) ? classes.length : 0,
      dataSourceHint: hint,
      hasMemberData: members.length > 0,
      baptizedCount: memberStats.baptizedCount,
      membersWithEducationHistory: memberStats.membersWithEducationHistory,
      membersWithDiscipleshipProgress: memberStats.membersWithDiscipleshipProgress
    };
  }

  function fmtNum(n) {
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString('zh-TW');
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /**
   * 填入資料來源列、通用 KPI、可選第二行說明
   */
  function initPage(opts) {
    opts = opts || {};
    var snap = getSnapshot();
    var B = safeBridge();

    var inIframe = typeof window !== 'undefined' && window.self !== window.top;
    var longKpiNote = ' 下列 KPI 來自 ChurchDataBridge：會友／小組／探訪任務／志工指派／財務摘要／學校摘要／門訓班數。若為 0，請先至「載入種子」或各事工頁建立資料。';
    var shortKpiNote = ' KPI 來自 ChurchDataBridge；皆為 0 時請「載入種子」或於各事工頁建立。';
    var useShort = opts.shortDataSource === true || (opts.shortDataSource !== false && inIframe);
    setText('cm-data-source-line', snap.dataSourceHint + (useShort ? shortKpiNote : longKpiNote));

    setText('cm-kpi-members', fmtNum(snap.memberCount));
    setText('cm-kpi-groups', fmtNum(snap.groupCount));
    setText('cm-kpi-missions', fmtNum(snap.missionCount));
    setText('cm-kpi-volunteers', fmtNum(snap.volunteerAssignmentCount));
    setText('cm-kpi-finance-balance', fmtNum(snap.finance.balance));
    setText('cm-kpi-school-students', snap.school ? fmtNum(snap.school.students) : '—');
    setText('cm-kpi-disciple-classes', fmtNum(snap.discipleClassCount));
    setText('cm-kpi-baptized', snap.baptizedCount != null ? fmtNum(snap.baptizedCount) : '—');
    setText('cm-kpi-edu-history', snap.membersWithEducationHistory != null ? fmtNum(snap.membersWithEducationHistory) : '—');
    setText('cm-kpi-disciple-members', snap.membersWithDiscipleshipProgress != null ? fmtNum(snap.membersWithDiscipleshipProgress) : '—');

    document.querySelectorAll('[data-cm]').forEach(function (el) {
      var key = el.getAttribute('data-cm');
      var v = '';
      switch (key) {
        case 'members': v = fmtNum(snap.memberCount); break;
        case 'groups': v = fmtNum(snap.groupCount); break;
        case 'missions': v = fmtNum(snap.missionCount); break;
        case 'volunteers': v = fmtNum(snap.volunteerAssignmentCount); break;
        case 'balance': v = fmtNum(snap.finance.balance); break;
        case 'active': v = fmtNum(snap.activeMemberCount); break;
        default: v = '—';
      }
      el.textContent = v;
    });

    return snap;
  }

  global.CMResearchSnapshot = {
    getSnapshot: getSnapshot,
    initPage: initPage,
    fmtNum: fmtNum
  };
})(typeof window !== 'undefined' ? window : this);
