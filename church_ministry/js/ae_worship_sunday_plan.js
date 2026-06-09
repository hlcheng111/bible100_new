/**
 * W5 · 主日崇拜策划 SSOT（worship_sunday_plan_v1）
 */
(function (win) {
  "use strict";

  var PLAN_KEY = "worship_sunday_plan_v1";
  var ACTIVE_KEY = "worship_sunday_plan_active_id";

  function readJson(key, fb) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fb;
    } catch (e) {
      return fb;
    }
  }

  function writePlans(list) {
    localStorage.setItem(PLAN_KEY, JSON.stringify(list));
  }

  function listPlans() {
    var list = readJson(PLAN_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function getActiveId() {
    return localStorage.getItem(ACTIVE_KEY) || "";
  }

  function setActiveId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, String(id));
    else localStorage.removeItem(ACTIVE_KEY);
  }

  function getActivePlan() {
    var id = getActiveId();
    var list = listPlans();
    if (id) {
      var hit = list.filter(function (p) {
        return String(p.id) === String(id);
      })[0];
      if (hit) return hit;
    }
    var upcoming = list
      .filter(function (p) {
        return p.date;
      })
      .sort(function (a, b) {
        return String(a.date).localeCompare(String(b.date));
      });
    return upcoming[0] || null;
  }

  function savePlan(plan) {
    if (!plan || !plan.id) return plan;
    plan.updatedAt = new Date().toISOString();
    recomputePipeline(plan);
    var list = listPlans();
    var idx = -1;
    list.forEach(function (p, i) {
      if (String(p.id) === String(plan.id)) idx = i;
    });
    if (idx >= 0) list[idx] = plan;
    else list.unshift(plan);
    writePlans(list.slice(0, 20));
    setActiveId(plan.id);
    return plan;
  }

  function stepStatus(plan, step) {
    if (!plan.pipeline) plan.pipeline = {};
    return plan.pipeline[step] || "pending";
  }

  function recomputePipeline(plan) {
    var p = plan.pulpit || {};
    var songs = plan.songs || [];
    var t = plan.teams || {};
    var pipe = plan.pipeline || {};

    if (p.speaker && p.sermonTitle) pipe.pulpit = pipe.pulpit === "blocked" ? "blocked" : "done";
    else if (p.sermonTitle || p.speaker) pipe.pulpit = "draft";
    else pipe.pulpit = pipe.pulpit || "pending";

    var doneSongs = songs.filter(function (s) {
      return s.title && s.status === "done";
    }).length;
    if (songs.length >= 2 && doneSongs >= 2) pipe.songs = "done";
    else if (songs.length) pipe.songs = "draft";
    else pipe.songs = "pending";

    var teamFilled = t.worship_lead && t.sound && t.hospitality;
    if (teamFilled && t.choir) pipe.teams = t._blocked ? "blocked" : "done";
    else if (t.worship_lead || t.sound) pipe.teams = t._blocked ? "blocked" : "draft";
    else pipe.teams = "pending";

    var rh = plan.rehearsal || {};
    if (rh.done) pipe.rehearsal = "done";
    else if (rh.date) pipe.rehearsal = "draft";
    else pipe.rehearsal = "pending";

    var allDone =
      pipe.pulpit === "done" &&
      pipe.songs === "done" &&
      pipe.teams === "done" &&
      pipe.rehearsal === "done";
    pipe.ready = allDone ? "done" : pipe.ready === "done" ? "draft" : "pending";

    plan.pipeline = pipe;
    plan.alerts = [];
    if (pipe.teams === "blocked") {
      plan.alerts.push("影音或招待人力未齐，请调整排班或启动简约模式");
    }
    if (pipe.songs === "draft" && pipe.pulpit === "done") {
      plan.alerts.push("讲题已定，请完成选歌");
    }
    return plan;
  }

  function seedDemoPentecost() {
    var plan = {
      id: "plan-demo-pentecost-2026",
      date: "2026-06-14",
      liturgySeason: "圣灵降临期",
      liturgyColor: "green",
      theme: "圣灵同工，差遣教会",
      pulpit: {
        speaker: "张牧师",
        sermonTitle: "风起的日子",
        scripture: "徒 2:1-21",
        status: "done"
      },
      songs: [
        { slot: "宣召", title: "赞美之泉", status: "done" },
        { slot: "敬拜", title: "圣灵降临在这里", status: "done" },
        { slot: "回应", title: "差遣我", status: "draft" }
      ],
      teams: {
        worship_lead: "王姊妹",
        choir: "诗班联合献诗（SATB）",
        sound: "李弟兄",
        stream: "陈弟兄 · 单机直播",
        hospitality: "赵姊妹、周弟兄"
      },
      rehearsal: { date: "2026-06-12", time: "19:30", place: "副堂", done: false },
      pipeline: {},
      source: "demo"
    };
    recomputePipeline(plan);
    savePlan(plan);
    return plan;
  }

  function createEmptyPlan(date) {
    var d = date || new Date().toISOString().slice(0, 10);
    var plan = {
      id: "plan-" + Date.now(),
      date: d,
      liturgySeason: "",
      theme: "",
      pulpit: {},
      songs: [],
      teams: {},
      rehearsal: {},
      pipeline: {},
      source: "manual"
    };
    recomputePipeline(plan);
    return savePlan(plan);
  }

  function advanceStep(planId, step) {
    var plan = listPlans().filter(function (p) {
      return String(p.id) === String(planId);
    })[0];
    if (!plan) return null;
    if (!plan.pipeline) plan.pipeline = {};
    var order = ["pulpit", "songs", "teams", "rehearsal", "ready"];
    var cur = plan.pipeline[step] || "pending";
    if (cur === "pending") plan.pipeline[step] = "draft";
    else if (cur === "draft") plan.pipeline[step] = "done";
    else if (cur === "blocked") plan.pipeline[step] = "draft";
    if (step === "rehearsal" && plan.pipeline[step] === "done" && plan.rehearsal) {
      plan.rehearsal.done = true;
    }
    recomputePipeline(plan);
    savePlan(plan);
    return plan;
  }

  win.WorshipSundayPlan = {
    PLAN_KEY: PLAN_KEY,
    ACTIVE_KEY: ACTIVE_KEY,
    listPlans: listPlans,
    getActivePlan: getActivePlan,
    setActiveId: setActiveId,
    savePlan: savePlan,
    recomputePipeline: recomputePipeline,
    seedDemoPentecost: seedDemoPentecost,
    createEmptyPlan: createEmptyPlan,
    advanceStep: advanceStep,
    stepStatus: stepStatus
  };
})(window);
