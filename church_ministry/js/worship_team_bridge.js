/**
 * W2 · worshipTeamData 嵌套结构 memberId 对齐
 * { members[], schedules[{lead,keyboard,...}], songs[] }
 */
(function (win) {
  "use strict";

  var KEY = "worshipTeamData";
  var SCHEDULE_NAME_FIELDS = ["lead", "keyboard", "guitar", "drums", "bass", "vocals"];

  function bridge() {
    return win.MemberIdBridge || null;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : null;
      if (!data || typeof data !== "object") data = { members: [], schedules: [], songs: [] };
      if (!Array.isArray(data.members)) data.members = [];
      if (!Array.isArray(data.schedules)) data.schedules = [];
      if (!Array.isArray(data.songs)) data.songs = [];
      return data;
    } catch (e) {
      return { members: [], schedules: [], songs: [] };
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    syncToMaster(data);
    if (win.WorshipPlanSync) win.WorshipPlanSync.syncFromWorshipTeam();
    return data;
  }

  function linkMemberRow(row) {
    var b = bridge();
    if (!row || !b) return false;
    if (row.memberId != null && row.memberId !== "") return true;
    var hit = b.resolveByName(row.name);
    if (!hit) return false;
    row.memberId = hit.memberId != null ? hit.memberId : hit.id;
    row.member_id = b.canonicalId(hit);
    return true;
  }

  function linkScheduleSlot(schedule, field) {
    var b = bridge();
    var name = schedule && schedule[field];
    if (!name || !b) return false;
    var hit = b.resolveByName(name);
    if (!hit) return false;
    schedule[field + "MemberId"] = hit.memberId != null ? hit.memberId : hit.id;
    schedule[field + "_member_id"] = b.canonicalId(hit);
    return true;
  }

  function autoLinkAll(data) {
    data = data || load();
    var stats = { membersLinked: 0, membersTotal: data.members.length, scheduleSlots: 0 };
    data.members.forEach(function (m) {
      if (linkMemberRow(m)) stats.membersLinked++;
    });
    data.schedules.forEach(function (s) {
      SCHEDULE_NAME_FIELDS.forEach(function (f) {
        if (linkScheduleSlot(s, f)) stats.scheduleSlots++;
      });
    });
    save(data);
    return stats;
  }

  function syncToMaster(data) {
    if (!win.churchDB || !win.churchDB.data || !win.churchDB.data.worship) return;
    var w = win.churchDB.data.worship;
    if (!Array.isArray(w.teams)) w.teams = [];
    var team = w.teams.find(function (t) { return t.category === "worship" || t.name === "敬拜团"; });
    if (!team) {
      team = { id: Date.now(), name: "敬拜团", category: "worship", leaderId: null };
      w.teams.push(team);
    }
    if (!Array.isArray(w.teamMembers)) w.teamMembers = [];
    data.members.forEach(function (m) {
      if (m.memberId == null) return;
      var exists = w.teamMembers.some(function (tm) {
        return tm.teamId === team.id && String(tm.memberId) === String(m.memberId);
      });
      if (!exists) {
        w.teamMembers.push({
          id: Date.now() + Math.random(),
          teamId: team.id,
          memberId: m.memberId,
          position: m.position || "",
          status: "active"
        });
      }
    });
    win.churchDB.save();
  }

  win.WorshipTeamBridge = {
    KEY: KEY,
    load: load,
    save: save,
    autoLinkAll: autoLinkAll,
    linkMemberRow: linkMemberRow,
    syncToMaster: syncToMaster
  };
})(window);
