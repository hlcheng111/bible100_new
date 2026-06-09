/**
 * W1 · memberId 对齐桥接（敬拜 A 区）
 * 父档：memberSystemData / churchMasterDatabase.members
 */
(function (win, doc) {
  "use strict";

  function listMembers() {
    if (win.CentralMemberDB) {
      return win.CentralMemberDB.get().members || [];
    }
    if (win.churchDB && win.churchDB.data) {
      return win.churchDB.data.members || [];
    }
    return [];
  }

  function resolveByName(name) {
    var n = String(name || "").trim();
    if (!n) return null;
    var members = listMembers();
    var exact = members.filter(function (m) { return m.name === n; });
    if (exact.length === 1) return exact[0];
    var fuzzy = members.filter(function (m) { return m.name && m.name.indexOf(n) !== -1; });
    return fuzzy.length === 1 ? fuzzy[0] : null;
  }

  function canonicalId(member) {
    if (!member) return "";
    if (member.member_id) return String(member.member_id);
    if (member.memberId != null) return /^cm-/.test(String(member.memberId)) ? String(member.memberId) : "cm-" + member.memberId;
    if (member.id != null) return "cm-" + member.id;
    return "";
  }

  function autoLinkRoster(roster, saveFn) {
    if (!Array.isArray(roster)) return { linked: 0, total: 0 };
    var linked = 0;
    roster.forEach(function (row) {
      if (row.memberId != null && row.memberId !== "") {
        linked++;
        return;
      }
      var hit = resolveByName(row.name);
      if (hit) {
        row.memberId = hit.memberId != null ? hit.memberId : hit.id;
        row.member_id = canonicalId(hit);
        linked++;
      }
    });
    if (typeof saveFn === "function") saveFn(roster);
    return { linked: linked, total: roster.length };
  }

  function renderLinkPanel(hostId, opts) {
    opts = opts || {};
    var host = typeof hostId === "string" ? doc.getElementById(hostId) : hostId;
    if (!host) return;
    var rosterKey = opts.rosterKey || "";
    var count = listMembers().length;
    host.innerHTML =
      '<div class="ae-member-bridge">' +
      '<p class="section-lead"><strong>W1 会友对齐：</strong> 本页人员可绑定 <code>memberId</code> ↔ ' +
      '<a href="' + (opts.memberPageHref || "../members/member-integrated.html") + '">会友主档</a> ' +
      '（目前 ' + count + ' 人 · key: memberSystemData）</p>' +
      (opts.rosterKey
        ? '<button type="button" class="fbtn ae-member-link-btn">按姓名自动对齐 memberId</button> ' +
          '<span class="ae-member-link-status"></span>'
        : '<span class="section-lead">载入中央会友后，可使用「按姓名自动对齐」。</span>') +
      '</div>';
    if (!opts.rosterKey) return;
    var btn = host.querySelector(".ae-member-link-btn");
    var status = host.querySelector(".ae-member-link-status");
    if (!btn) return;
    btn.addEventListener("click", function () {
      try {
        var raw = localStorage.getItem(opts.rosterKey);
        var roster = raw ? JSON.parse(raw) : [];
        var result = autoLinkRoster(roster, function (r) {
          localStorage.setItem(opts.rosterKey, JSON.stringify(r));
          if (typeof opts.onLinked === "function") opts.onLinked(r, result);
        });
        if (status) {
          status.textContent = "已对齐 " + result.linked + " / " + result.total + " 人";
        }
        if (typeof opts.onLinked === "function") opts.onLinked(roster, result);
      } catch (e) {
        if (status) status.textContent = "对齐失败";
      }
    });
  }

  win.MemberIdBridge = {
    listMembers: listMembers,
    resolveByName: resolveByName,
    canonicalId: canonicalId,
    autoLinkRoster: autoLinkRoster,
    renderLinkPanel: renderLinkPanel
  };
})(window, document);
