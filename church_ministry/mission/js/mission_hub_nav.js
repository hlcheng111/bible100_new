/**
 * Mission UX Layer · 門徒與使命 Hub 共用邏輯
 * Storage: bible100_mission_signups_v1, bible100_mission_active_talent_id
 */
(function (global) {
  "use strict";

  var SIGNUP_KEY = "bible100_mission_signups_v1";
  var ACTIVE_TALENT_KEY = "bible100_mission_active_talent_id";
  var Q_DRAFT_KEY = "bible100_smart_ministry_questionnaire_data";

  var CITY_EMBED = null;
  var IND_EMBED = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function getSignups() {
    try {
      return JSON.parse(localStorage.getItem(SIGNUP_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveSignups(rows) {
    localStorage.setItem(SIGNUP_KEY, JSON.stringify(rows || []));
  }

  function setActiveTalentId(id) {
    if (id) localStorage.setItem(ACTIVE_TALENT_KEY, String(id));
  }

  function getActiveTalentId() {
    try {
      var p = new URLSearchParams(global.location.search || "");
      return p.get("talent_id") || localStorage.getItem(ACTIVE_TALENT_KEY) || "";
    } catch (e) {
      return localStorage.getItem(ACTIVE_TALENT_KEY) || "";
    }
  }

  function loadQuestionnaireDraft() {
    try {
      return JSON.parse(localStorage.getItem(Q_DRAFT_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function listMembers() {
    try {
      if (global.CentralMemberDB && CentralMemberDB.get) {
        var d = CentralMemberDB.get();
        return (d && d.members) ? d.members : [];
      }
    } catch (e) {}
    try {
      var raw = localStorage.getItem("memberSystemData");
      if (raw) {
        var parsed = JSON.parse(raw);
        return parsed.members || [];
      }
    } catch (e2) {}
    return [];
  }

  function buildDiscipleProfile() {
    var profile = {
      talent_id: getActiveTalentId(),
      name: "",
      gifts: [],
      skills: [],
      tags: [],
      coverage: { questionnaire: false, canonical: false, shape: false }
    };
    var tid = profile.talent_id;
    var q = loadQuestionnaireDraft();
    if (q && q.name) {
      profile.name = q.name;
      profile.coverage.questionnaire = true;
      if (q.spiritual_gifts) {
        var g = q.spiritual_gifts;
        profile.gifts = Array.isArray(g) ? g : [g];
      }
      if (q.skills) {
        var sk = q.skills;
        profile.skills = Array.isArray(sk) ? sk : [sk];
      }
      if (q.ministry_burden) profile.tags.push(q.ministry_burden);
    }
    if (tid && global.SmartMinistryCanonical) {
      var t = SmartMinistryCanonical.loadTalentById(tid);
      if (t) {
        profile.coverage.canonical = true;
        if (t.name) profile.name = t.name;
        if (t.gift) profile.gifts.push(t.gift);
        var skStr = SmartMinistryCanonical.getSkillsDisplayString(t);
        if (skStr) profile.skills = profile.skills.concat(skStr.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean));
      }
    }
    if (global.AssessmentRunStore && AssessmentRunStore.loadLatest) {
      var shape = AssessmentRunStore.loadLatest("shape");
      if (shape && !shape.is_demo) profile.coverage.shape = true;
    }
    profile.tags = profile.gifts.concat(profile.skills);
    return profile;
  }

  function scoreTask(profile, task) {
    var score = 35;
    var tags = (task.tags || []).map(function (t) { return String(t).toLowerCase(); });
    var pool = (profile.tags || []).map(function (t) { return String(t).toLowerCase(); });
    tags.forEach(function (tag) {
      pool.forEach(function (p) {
        if (!p || !tag) return;
        if (p.indexOf(tag) >= 0 || tag.indexOf(p) >= 0) score += 12;
      });
    });
    if (!profile.coverage.questionnaire && !profile.coverage.canonical) score = Math.min(score, 45);
    return Math.min(100, Math.round(score));
  }

  function rankTasks(tasks, profile) {
    return (tasks || []).map(function (task) {
      return { task: task, pct: scoreTask(profile, task) };
    }).sort(function (a, b) { return b.pct - a.pct; });
  }

  function signupTask(taskId, kind) {
    var rows = getSignups();
    var tid = getActiveTalentId() || "anonymous";
    var dup = rows.some(function (r) {
      return r.task_id === taskId && String(r.talent_id) === String(tid) && r.status !== "cancelled";
    });
    if (dup) return { ok: false, reason: "already_signed" };
    rows.push({
      id: "msu_" + Date.now(),
      task_id: taskId,
      kind: kind,
      talent_id: tid,
      status: "pending_leader",
      created_at: new Date().toISOString(),
      hitl_note: "已登記意願；請聯絡小組長／牧者確認，非自動派工。"
    });
    saveSignups(rows);
    return { ok: true };
  }

  function missionOpenContent(event, relFromMission) {
    if (event && event.preventDefault) event.preventDefault();
    var path = "church_ministry/mission/" + String(relFromMission || "").replace(/^\/+/, "");
    if (global.bible100ShellNav) {
      return bible100ShellNav(event, { contentUrl: path });
    }
    if (global.parent && global.parent !== global && global.parent.bible100ShellNav) {
      return global.parent.bible100ShellNav(event, { contentUrl: path });
    }
    global.location.href = path;
    return false;
  }

  function missionOpenModule(path, sidebar) {
    path = path || "church_ministry/mission/mission_hub.html";
    sidebar = sidebar || "church_ministry/mission/sidebar_mission.html";
    if (global.bible100ShellNav) {
      return bible100ShellNav(null, { sidebarUrl: sidebar, contentUrl: path });
    }
    global.location.href = path;
    return false;
  }

  function fetchTaskCatalog(kind, cb) {
    var embed = kind === "industry" ? IND_EMBED : CITY_EMBED;
    if (embed && embed.tasks) {
      cb(embed.tasks);
      return;
    }
    var url = kind === "industry"
      ? "../../data/missions/industry_tasks_v1.json"
      : "../../data/missions/city_tasks_v1.json";
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (j) { cb(j.tasks || []); })
      .catch(function () {
        cb((embed && embed.tasks) || []);
      });
  }

  function inferTaskKind(task) {
    if (task && task.industry) return "industry";
    if (task && task.category) return "city";
    var id = String((task && task.id) || "");
    if (id.indexOf("ind_") === 0) return "industry";
    return "city";
  }

  function renderTaskCards(container, tasks, kind, opts) {
    opts = opts || {};
    container.innerHTML = "";
    if (!tasks.length) {
      container.innerHTML = "<p class=\"mis-empty\">暫無任務資料。請用 HTTP 開啟或確認 data/missions/*.json。</p>";
      return;
    }
    var profile = buildDiscipleProfile();
    var ranked = rankTasks(tasks, profile);
    var limit = opts.limit || ranked.length;
    ranked.slice(0, limit).forEach(function (row) {
      var t = row.task;
      var taskKind = kind === "all" ? inferTaskKind(t) : kind;
      var card = document.createElement("article");
      card.className = "mis-task-card";
      card.innerHTML =
        "<h3>" + esc(t.title) + "</h3>" +
        "<p class=\"mis-task-desc\">" + esc(t.description) + "</p>" +
        "<div class=\"mis-task-meta\">" +
        "<span>難度 " + esc(t.difficulty) + "</span>" +
        "<span>約 " + esc(t.hours_per_month) + " 時/月</span>" +
        (t.industry ? "<span>" + esc(t.industry) + "</span>" : "") +
        (t.category ? "<span>" + esc(t.category) + "</span>" : "") +
        (taskKind === "city" ? "<span>城市</span>" : "<span>行業</span>") +
        "</div>" +
        "<div class=\"mis-task-pct\">配對參考 <strong>" + row.pct + "%</strong> · 規則估算，須人工確認</div>" +
        "<button type=\"button\" class=\"mis-btn mis-btn--primary\" data-task-id=\"" + esc(t.id) + "\">加入任務</button>";
      card.querySelector("button").addEventListener("click", function () {
        var res = signupTask(t.id, taskKind);
        alert(res.ok ? "已登記！請聯絡小組長確認（非自動派工）。" : "您已登記過此任務。");
      });
      container.appendChild(card);
    });
  }

  function renderTaskList(mode, container, opts) {
    if (!container) return;
    mode = mode || "city";
    if (mode === "all") {
      fetchTaskCatalog("city", function (cityTasks) {
        fetchTaskCatalog("industry", function (indTasks) {
          renderTaskCards(container, (cityTasks || []).concat(indTasks || []), "all", opts);
        });
      });
      return;
    }
    fetchTaskCatalog(mode, function (tasks) {
      renderTaskCards(container, tasks || [], mode, opts);
    });
  }

  function renderAssessmentSummary(el) {
    if (!el) return;
    if (!global.AssessmentRunStore || !AssessmentRunStore.loadLatest) {
      el.innerHTML = "<p class=\"mis-muted\">尚無評估 Store（僅規劃工具填寫後顯示）。</p>";
      return;
    }
    var ids = ["ncd", "swot", "pdca", "spiritual", "shape"];
    var html = "<ul class=\"mis-run-list\">";
    var any = false;
    ids.forEach(function (id) {
      var run = AssessmentRunStore.loadLatest(id);
      if (run && !run.is_demo) {
        any = true;
        html += "<li><strong>" + esc(id) + "</strong> · " + esc(run.updated_at || run.created_at || "已存") + "</li>";
      }
    });
    html += "</ul>";
    el.innerHTML = any ? html : "<p class=\"mis-muted\">尚未有正式評估 run。請從中欄選工具填寫。</p>";
  }

  function initDiagnosticHub() {
    var list = document.getElementById("mis-diag-tool-list");
    var frame = document.getElementById("mis-diag-frame");
    var summary = document.getElementById("mis-diag-summary");
    if (!list || !global.PlanningToolRegistry) return;
    var byCat = {};
    PlanningToolRegistry.tools.forEach(function (t) {
      if (t.status !== "live") return;
      var c = t.category || "其他";
      if (!byCat[c]) byCat[c] = [];
      byCat[c].push(t);
    });
    list.innerHTML = "";
    Object.keys(byCat).forEach(function (cat) {
      var h = document.createElement("h4");
      h.textContent = cat;
      list.appendChild(h);
      byCat[cat].forEach(function (tool) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mis-diag-tool-btn";
        btn.textContent = tool.label;
        btn.addEventListener("click", function () {
          if (frame) frame.src = "../../church_planning/" + tool.path;
        });
        list.appendChild(btn);
      });
    });
    renderAssessmentSummary(summary);
  }

  function initDiscipleCenter() {
    var sel = document.getElementById("mis-talent-select");
    if (sel) {
      var members = listMembers();
      sel.innerHTML = "<option value=\"\">— 選擇會友 —</option>";
      members.slice(0, 200).forEach(function (m) {
        var id = m.memberId != null ? m.memberId : m.id;
        var opt = document.createElement("option");
        opt.value = String(id);
        opt.textContent = (m.name || "未命名") + " (#" + id + ")";
        sel.appendChild(opt);
      });
      var cur = getActiveTalentId();
      if (cur) sel.value = cur;
      sel.addEventListener("change", function () {
        setActiveTalentId(sel.value);
        refreshDisciplePanel();
      });
    }
    refreshDisciplePanel();
  }

  function refreshDisciplePanel() {
    var panel = document.getElementById("mis-disciple-summary");
    if (!panel) return;
    var p = buildDiscipleProfile();
    panel.innerHTML =
      "<p><strong>會友：</strong>" + esc(p.name || "（未選）") + "</p>" +
      "<p><strong>覆蓋率：</strong> 問卷 " + (p.coverage.questionnaire ? "✓" : "—") +
      " · canonical " + (p.coverage.canonical ? "✓" : "—") +
      " · SHAPE " + (p.coverage.shape ? "✓" : "—") + "</p>" +
      "<p class=\"mis-hitl\">配對與任務建議僅供參考，須牧者／小組長人工確認，非自動派工。</p>";
  }

  global.MissionHubNav = {
    SIGNUP_KEY: SIGNUP_KEY,
    getSignups: getSignups,
    setActiveTalentId: setActiveTalentId,
    getActiveTalentId: getActiveTalentId,
    buildDiscipleProfile: buildDiscipleProfile,
    scoreTask: scoreTask,
    rankTasks: rankTasks,
    signupTask: signupTask,
    missionOpenContent: missionOpenContent,
    missionOpenModule: missionOpenModule,
    fetchTaskCatalog: fetchTaskCatalog,
    renderTaskCards: renderTaskCards,
    renderTaskList: renderTaskList,
    inferTaskKind: inferTaskKind,
    initDiagnosticHub: initDiagnosticHub,
    initDiscipleCenter: initDiscipleCenter,
    refreshDisciplePanel: refreshDisciplePanel,
    setEmbeddedCatalogs: function (city, industry) {
      CITY_EMBED = city;
      IND_EMBED = industry;
    }
  };
})(typeof window !== "undefined" ? window : this);
