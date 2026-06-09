/**
 * W5+ · 主日策划 ↔ 子页双向同步
 */
(function (win) {
  "use strict";

  function readJson(key, fb) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fb;
    } catch (e) {
      return fb;
    }
  }

  function todayPlus(days) {
    var d = new Date();
    d.setDate(d.getDate() + (days || 0));
    return d.toISOString().slice(0, 10);
  }

  function getOrCreateActive() {
    var P = win.WorshipSundayPlan;
    if (!P) return null;
    var plan = P.getActivePlan();
    if (plan) return plan;
    return P.createEmptyPlan(todayPlus(7));
  }

  function nearestSermon(sermons, targetDate) {
    if (!sermons.length) return null;
    var sorted = sermons.slice().sort(function (a, b) {
      return String(a.date || "").localeCompare(String(b.date || ""));
    });
    if (targetDate) {
      var hit = sorted.filter(function (s) {
        return s.date === targetDate;
      })[0];
      if (hit) return hit;
    }
    var future = sorted.filter(function (s) {
      return s.date && s.date >= todayPlus(0);
    });
    return future[0] || sorted[sorted.length - 1];
  }

  function syncFromPulpit() {
    var P = win.WorshipSundayPlan;
    if (!P) return null;
    var plan = getOrCreateActive();
    var sermons = readJson("pulpit_sermons", []);
    var hit = nearestSermon(sermons, plan.date);
    if (hit) {
      plan.pulpit = plan.pulpit || {};
      plan.pulpit.speaker = hit.speaker || hit.speakerName || plan.pulpit.speaker;
      plan.pulpit.sermonTitle = hit.title || hit.sermonTitle || plan.pulpit.sermonTitle;
      plan.pulpit.scripture = hit.scripture || hit.bibleRef || plan.pulpit.scripture;
      if (hit.date && !plan.date) plan.date = hit.date;
    }
    P.recomputePipeline(plan);
    P.savePlan(plan);
    win.dispatchEvent(new CustomEvent("worshipPlanUpdated", { detail: { source: "pulpit", plan: plan } }));
    return plan;
  }

  function syncToPulpit(plan) {
    plan = plan || (win.WorshipSundayPlan && win.WorshipSundayPlan.getActivePlan());
    if (!plan || !plan.pulpit) return;
    var sermons = readJson("pulpit_sermons", []);
    var p = plan.pulpit;
    var hit = sermons.filter(function (s) {
      return s.date === plan.date || (p.sermonTitle && s.title === p.sermonTitle);
    })[0];
    if (!hit) {
      hit = {
        id: "sp-" + Date.now(),
        date: plan.date || todayPlus(7),
        title: p.sermonTitle || "待定",
        speaker: p.speaker || "",
        scripture: p.scripture || "",
        source: "worship_sunday_plan_v1"
      };
      sermons.push(hit);
    } else {
      if (p.speaker) hit.speaker = p.speaker;
      if (p.sermonTitle) hit.title = p.sermonTitle;
      if (p.scripture) hit.scripture = p.scripture;
      hit.source = "worship_sunday_plan_v1";
    }
    localStorage.setItem("pulpit_sermons", JSON.stringify(sermons));
  }

  function syncFromWorshipTeam() {
    var P = win.WorshipSundayPlan;
    if (!P) return null;
    var plan = getOrCreateActive();
    var team = readJson("worshipTeamData", { members: [], schedules: [] });
    var sched = (team.schedules || []).filter(function (s) {
      return s.date === plan.date || s.date >= todayPlus(0);
    })[0];
    plan.teams = plan.teams || {};
    if (sched) {
      plan.teams.worship_lead = sched.lead || plan.teams.worship_lead;
      if (sched.date && !plan.date) plan.date = sched.date;
    }
    P.recomputePipeline(plan);
    P.savePlan(plan);
    win.dispatchEvent(new CustomEvent("worshipPlanUpdated", { detail: { source: "worshipTeam", plan: plan } }));
    return plan;
  }

  function syncFromSongs() {
    var P = win.WorshipSundayPlan;
    if (!P) return null;
    var plan = getOrCreateActive();
    var hub = readJson("worshipMinistryData", null);
    var songs = [];
    if (hub && hub.songs) {
      songs = hub.songs.slice(0, 3).map(function (s, i) {
        return {
          slot: ["宣召", "敬拜", "回应"][i] || "诗歌",
          title: s.name || s.title,
          status: "draft"
        };
      });
    }
    if (!songs.length) {
      var lib = readJson("worshipMinistryData", null);
      if (win.churchDB && win.churchDB.data && win.churchDB.data.worship) {
        lib = win.churchDB.data.worship;
      }
      if (lib && lib.songs) {
        songs = lib.songs.slice(0, 3).map(function (s, i) {
          return { slot: ["宣召", "敬拜", "回应"][i] || "诗歌", title: s.name, status: "draft" };
        });
      }
    }
    if (songs.length) plan.songs = songs;
    P.recomputePipeline(plan);
    P.savePlan(plan);
    return plan;
  }

  function syncAllFromSubpages() {
    syncFromPulpit();
    syncFromWorshipTeam();
    syncFromSongs();
    return win.WorshipSundayPlan ? win.WorshipSundayPlan.getActivePlan() : null;
  }

  function syncAllToSubpages() {
    var plan = win.WorshipSundayPlan && win.WorshipSundayPlan.getActivePlan();
    if (!plan) return;
    syncToPulpit(plan);
  }

  function pushPlanField(field, value) {
    var P = win.WorshipSundayPlan;
    if (!P) return;
    var plan = getOrCreateActive();
    if (field.indexOf("pulpit.") === 0) {
      plan.pulpit = plan.pulpit || {};
      plan.pulpit[field.slice(7)] = value;
    } else if (field.indexOf("teams.") === 0) {
      plan.teams = plan.teams || {};
      plan.teams[field.slice(6)] = value;
    } else {
      plan[field] = value;
    }
    P.savePlan(plan);
    syncToPulpit(plan);
  }

  win.WorshipPlanSync = {
    syncFromPulpit: syncFromPulpit,
    syncToPulpit: syncToPulpit,
    syncFromWorshipTeam: syncFromWorshipTeam,
    syncFromSongs: syncFromSongs,
    syncAllFromSubpages: syncAllFromSubpages,
    syncAllToSubpages: syncAllToSubpages,
    pushPlanField: pushPlanField
  };
})(window);
