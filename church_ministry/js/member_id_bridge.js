/**
 * W1 · memberId 對齊橋接（敬拜 A 區）
 * 父檔：memberSystemData / churchMasterDatabase.members
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

  /**
   * 會友編號只有一種正式寫法：中央會友的數字 memberId（例 1、1001）。
   * 舊寫法一律認得、一律轉回數字：M1／M001／m12 → "1"／"1"／"12"；cm-12 → "12"；"007" → "7"。
   * 認不得（例如姓名、空白）回傳 ""，呼叫端不得自己亂造編號。
   */
  function normalizeId(raw) {
    if (raw == null) return "";
    var s = String(raw).trim();
    var m = /^(?:cm-|m)?0*(\d+)$/i.exec(s);
    return m ? m[1] : "";
  }

  /** 任何寫法的編號 → 中央會友（找不到回 null） */
  function resolveById(raw) {
    var id = normalizeId(raw);
    if (!id) return null;
    var hit = listMembers().filter(function (m) {
      return String(m.memberId != null ? m.memberId : m.id) === id || String(m.id) === id;
    })[0];
    return hit || null;
  }

  /** 畫面上顯示的編號：中央會友數字編號；未對齊顯示「未對齊」 */
  function displayId(raw) {
    var m = resolveById(raw);
    return m ? String(m.memberId != null ? m.memberId : m.id) : "";
  }

  function autoLinkRoster(roster, saveFn) {
    if (!Array.isArray(roster)) return { linked: 0, total: 0 };
    var linked = 0;
    roster.forEach(function (row) {
      if (row.memberId != null && row.memberId !== "") {
        var norm = normalizeId(row.memberId);
        if (norm) row.memberId = Number(norm); /* M001／cm-1 等舊寫法 → 數字 */
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
      '<p class="section-lead"><strong>W1 會友對齊：</strong> 本頁人員可綁定 <code>memberId</code> ↔ ' +
      '<a href="' + (opts.memberPageHref || "../members/member-integrated.html") + '">會友主檔</a> ' +
      '（目前 ' + count + ' 人 · key: memberSystemData）</p>' +
      (opts.rosterKey
        ? '<button type="button" class="fbtn ae-member-link-btn">按姓名自動對齊 memberId</button> ' +
          '<span class="ae-member-link-status"></span>'
        : '<span class="section-lead">載入中央會友後，可使用「按姓名自動對齊」。</span>') +
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
          status.textContent = "已對齊 " + result.linked + " / " + result.total + " 人";
        }
        if (typeof opts.onLinked === "function") opts.onLinked(roster, result);
      } catch (e) {
        if (status) status.textContent = "對齊失敗";
      }
    });
  }

  win.MemberIdBridge = {
    listMembers: listMembers,
    resolveByName: resolveByName,
    canonicalId: canonicalId,
    normalizeId: normalizeId,
    resolveById: resolveById,
    displayId: displayId,
    autoLinkRoster: autoLinkRoster,
    renderLinkPanel: renderLinkPanel
  };
})(window, document);
