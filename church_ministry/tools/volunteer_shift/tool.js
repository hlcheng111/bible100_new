/**
 * volunteer_shift · 共用 Bridge 呼叫
 */
(function (global) {
  'use strict';

  var TOOL_ID = 'volunteer_shift';

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function todayYmd() {
    return new Date().toISOString().slice(0, 10);
  }

  function notifySync() {
    try {
      global.parent.postMessage({ type: 'SYNC_OBSERVER_UPDATED', module: TOOL_ID }, '*');
    } catch (e) {}
  }

  function getMinistries() {
    var b = bridge();
    if (!b || !b.getVolunteerData) return [];
    var vol = b.getVolunteerData() || {};
    return vol.ministries || vol.positions || [];
  }

  function getMembersOptions() {
    var b = bridge();
    if (!b || !b.getMembers) return [];
    return (b.getMembers() || []).map(function (m) {
      var id = String(m.memberId != null ? m.memberId : m.id);
      return { id: id, name: m.name || m.fullName || id };
    });
  }

  function fillMinistrySelect(sel, selectedId) {
    if (!sel) return;
    var rows = getMinistries();
    sel.innerHTML = '<option value="">— 選擇崗位 —</option>' +
      rows.map(function (m) {
        var id = String(m.id);
        var selAttr = selectedId != null && String(selectedId) === id ? ' selected' : '';
        return '<option value="' + esc(id) + '"' + selAttr + '>' + esc(m.name || id) + '</option>';
      }).join('');
    if (!rows.length) {
      sel.innerHTML += '<option value="" disabled>（尚無崗位 · 請至志工事工建立）</option>';
    }
  }

  function fillMemberSelect(sel, selectedId) {
    if (!sel) return;
    var rows = getMembersOptions();
    sel.innerHTML = '<option value="">— 選擇會友 —</option>' +
      rows.map(function (m) {
        var selAttr = selectedId != null && String(selectedId) === m.id ? ' selected' : '';
        return '<option value="' + esc(m.id) + '"' + selAttr + '>' + esc(m.name) + ' (' + esc(m.id) + ')</option>';
      }).join('');
  }

  function addDaysYmd(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  function getDataSourceMeta() {
    var b = bridge();
    var count = 0;
    var updated = '';
    if (b && b.getVolunteerShiftSummary) {
      try {
        count = (b.getVolunteerShiftSummary(365) || {}).total || 0;
      } catch (e0) {}
    }
    try {
      var raw = global.localStorage && global.localStorage.getItem('volunteerSystemData');
      if (raw) {
        var vol = JSON.parse(raw);
        (vol.schedules || []).forEach(function (s) {
          var t = s.updated_at || s.created_at || '';
          if (t && t > updated) updated = t;
        });
      }
      var cmRaw = global.localStorage && global.localStorage.getItem('churchMasterDatabase');
      if (cmRaw) {
        var cm = JSON.parse(cmRaw);
        if (cm.volunteerSyncedAt && cm.volunteerSyncedAt > updated) updated = cm.volunteerSyncedAt;
      }
    } catch (e1) {}
    var display = '—';
    if (updated) {
      display = updated.length > 16 ? updated.slice(0, 16).replace('T', ' ') : updated;
    }
    return {
      source: 'volunteerSystemData.schedules',
      storage: 'localStorage',
      count: count,
      updated_at: display
    };
  }

  function buildVolunteerShiftTrustOptions(extra) {
    var m = getDataSourceMeta();
    var stats = global.DataTrustBadge && DataTrustBadge.volunteerShiftRowStats
      ? DataTrustBadge.volunteerShiftRowStats()
      : { demo: 0, real: 0, total: m.count };
    var o = {
      source_key: 'volunteerSystemData.schedules',
      source_label_zh: '義工排班',
      storage: m.storage,
      count: m.count,
      last_updated: m.updated_at,
      demoFlag: global.DataTrustBadge && DataTrustBadge.isVolunteerShiftDemoLoaded
        ? DataTrustBadge.isVolunteerShiftDemoLoaded()
        : false,
      has_demo_rows: stats.demo > 0,
      has_real_rows: stats.real > 0,
      write_behavior: 'read_only',
      notify_behavior: 'none',
      privacy_level: 'normal',
      show_clear_demo: true
    };
    if (extra && typeof extra === 'object') {
      Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    }
    return o;
  }

  function renderTrustBadge(elementId, extra) {
    var elId = elementId || 'dataTrustMount';
    var el = document.getElementById(elId);
    if (!el) return;
    if (!global.DataTrustBadge || !DataTrustBadge.renderDataTrustBadge) {
      renderDataSourceStrip(elId);
      return;
    }
    var opts = buildVolunteerShiftTrustOptions(extra);
    opts.mount = el;
    DataTrustBadge.renderDataTrustBadge(opts);
  }

  function renderDataSourceStrip(elementId) {
    var elId = elementId || 'dataSourceStrip';
    if (!global.DataTrustBadge || !DataTrustBadge.renderDataTrustBadge) {
      var el = document.getElementById(elId);
      if (!el) return;
      var m = getDataSourceMeta();
      el.className = 'cm-data-source';
      el.setAttribute('role', 'note');
      el.innerHTML =
        '資料來源：<code>' + esc(m.source) + '</code> · 本機儲存：<code>' + esc(m.storage) +
        '</code> · 共 <strong>' + esc(String(m.count)) + '</strong> 筆排班 · 最近更新 ' + esc(m.updated_at);
      return;
    }
    renderTrustBadge(elId);
  }

  /**
   * A1 試用種子：3 會友、2 崗位、2 排班、2 筆 CTV 建議（可重複執行，會合併／略過重複配對）
   */
  function loadA1DemoData() {
    var b = bridge();
    if (!b) return { ok: false, error: 'ChurchDataBridge 未載入' };
    var demoMembers = [
      { id: 901, memberId: 901, name: '王弟兄', fullName: '王弟兄（A1 demo）', _is_demo: true },
      { id: 902, memberId: 902, name: '李姊妹', fullName: '李姊妹（A1 demo）', _is_demo: true },
      { id: 903, memberId: 903, name: '陳志工', fullName: '陳志工（A1 demo）', _is_demo: true }
    ];
    var ms = b.getMemberSystemData ? b.getMemberSystemData() : { members: [] };
    if (!Array.isArray(ms.members)) ms.members = [];
    demoMembers.forEach(function (dm) {
      var sid = String(dm.memberId);
      var ix = ms.members.findIndex(function (m) {
        return String(m.memberId != null ? m.memberId : m.id) === sid;
      });
      if (ix >= 0) ms.members[ix] = Object.assign({}, ms.members[ix], dm);
      else ms.members.push(dm);
    });
    if (b.saveMemberSystemData) b.saveMemberSystemData(ms, { skipRbac: true });

    var vol = b.getVolunteerData ? b.getVolunteerData() : {};
    vol.ministries = [
      { id: 901, name: '守門招待（A1）', category: 'hospitality', needPeople: 4 },
      { id: 902, name: '週三禱告（A1）', category: 'worship', needPeople: 2 }
    ];
    if (!Array.isArray(vol.schedules)) vol.schedules = [];
    vol.schedules = vol.schedules.filter(function (s) { return s.source !== 'a1_demo_seed'; });
    var now = new Date().toISOString();
    vol.schedules.push(
      {
        id: 99001,
        memberId: 901,
        memberName: '王弟兄',
        ministryId: 901,
        ministryName: '守門招待（A1）',
        date: addDaysYmd(7),
        shift: '主日崇拜',
        confirmed: true,
        source: 'a1_demo_seed',
        created_at: now,
        updated_at: now
      },
      {
        id: 99002,
        memberId: 902,
        memberName: '李姊妹',
        ministryId: 902,
        ministryName: '週三禱告（A1）',
        date: addDaysYmd(14),
        shift: '週三禱告',
        confirmed: false,
        source: 'a1_demo_seed',
        created_at: now,
        updated_at: now
      }
    );
    if (b.saveVolunteerSystemData) b.saveVolunteerSystemData(vol);
    if (b.syncMinistryCatalogFromVolunteer) b.syncMinistryCatalogFromVolunteer(vol);

    var canon = global.SmartMinistryCanonical;
    var ctvAdded = 0;
    if (canon && canon.addMinistryAssignment) {
      [
        { talent_id: '901', ministry_id: 'vol_901', ministry_name: '守門招待（A1）', status: 'suggested' },
        { talent_id: '903', ministry_id: 'vol_902', ministry_name: '週三禱告（A1）', status: 'proposed' }
      ].forEach(function (rec) {
        var r = canon.addMinistryAssignment(Object.assign({ source: 'a1_demo_seed' }, rec));
        if (r && r.success) ctvAdded += 1;
      });
    }
    if (global.DataTrustBadge && DataTrustBadge.markVolunteerShiftDemoLoaded) {
      DataTrustBadge.markVolunteerShiftDemoLoaded('a1');
    } else if (global.localStorage) {
      try {
        global.localStorage.setItem('volunteer_shift_demo_loaded_at', new Date().toISOString());
        global.localStorage.setItem('volunteer_shift_demo_version', 'a1');
      } catch (eMark) {}
    }
    notifySync();
    return { ok: true, members: 3, ministries: 2, schedules: 2, ctv_added: ctvAdded };
  }

  function renderToolNav(activePage) {
    var pages = [
      { id: 'index', href: 'index.html', label: '① 首頁' },
      { id: 'dashboard', href: 'dashboard.html', label: '② 儀表板' },
      { id: 'form', href: 'form.html', label: '③ 新增排班' },
      { id: 'list', href: 'list.html', label: '④ 排班清單' },
      { id: 'setting', href: 'setting.html', label: '⑤ 設定' }
    ];
    return pages.map(function (p) {
      var cur = p.id === activePage ? ' aria-current="page"' : '';
      return '<a href="' + p.href + '"' + cur + '>' + p.label + '</a>';
    }).join('');
  }

  function copySnippet(text) {
    var t = String(text || '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t);
    }
    var ta = document.createElement('textarea');
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  global.VolunteerShiftTool = {
    TOOL_ID: TOOL_ID,
    bridge: bridge,
    esc: esc,
    todayYmd: todayYmd,
    notifySync: notifySync,
    getMinistries: getMinistries,
    getMembersOptions: getMembersOptions,
    fillMinistrySelect: fillMinistrySelect,
    fillMemberSelect: fillMemberSelect,
    renderToolNav: renderToolNav,
    copySnippet: copySnippet,
    getDataSourceMeta: getDataSourceMeta,
    buildVolunteerShiftTrustOptions: buildVolunteerShiftTrustOptions,
    renderTrustBadge: renderTrustBadge,
    renderDataSourceStrip: renderDataSourceStrip,
    loadA1DemoData: loadA1DemoData,
    addDaysYmd: addDaysYmd
  };
})(typeof window !== 'undefined' ? window : this);
