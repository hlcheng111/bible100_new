/**
 * W4 · 事奉同工「今日祭坛」只读聚合
 */
(function (win, doc) {
  "use strict";

  var NAME_KEY = "worship_volunteer_display_name";

  function readJson(key, fb) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fb;
    } catch (e) {
      return fb;
    }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  function getDisplayName() {
    var n = localStorage.getItem(NAME_KEY);
    if (n) return n.trim();
    if (win.CentralMemberDB) {
      var m = (win.CentralMemberDB.get().members || [])[0];
      if (m && m.name) return m.name;
    }
    return "同工";
  }

  function setDisplayName(name) {
    if (name) localStorage.setItem(NAME_KEY, String(name).trim());
  }

  function collectCardData() {
    var flow = readJson("church_ministry_choir_flow_v1", {});
    var practices = (flow.practices || []).filter(function (p) {
      return p.date && p.date >= todayIso();
    });
    practices.sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });
    var performances = (flow.performances || []).filter(function (p) {
      return p.date && p.date >= todayIso();
    });
    performances.sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });
    var scores = readJson("choir_score_refs_v1", []);
    var team = readJson("worshipTeamData", { schedules: [] });
    var nextSched = (team.schedules || [])
      .filter(function (s) {
        return s.date && s.date >= todayIso();
      })
      .sort(function (a, b) {
        return String(a.date).localeCompare(String(b.date));
      })[0];
    var hub = readJson("worshipMinistryData", null);
    var activePlan = win.WorshipSundayPlan ? win.WorshipSundayPlan.getActivePlan() : null;
    var nextService = null;
    if (hub && hub.services) {
      nextService = hub.services
        .filter(function (s) {
          return s.date && s.date >= todayIso();
        })
        .sort(function (a, b) {
          return String(a.date).localeCompare(String(b.date));
        })[0];
    }
    return {
      name: getDisplayName(),
      nextPractice: practices[0] || null,
      nextPerformance: performances[0] || null,
      scores: scores.slice(0, 5),
      nextTeamSchedule: nextSched || null,
      nextService: nextService,
      activePlan: activePlan
    };
  }

  function render(hostId) {
    var host = doc.getElementById(hostId || "worship-volunteer-root");
    if (!host) return;
    var d = collectCardData();
    var perfLine = d.nextPerformance
      ? esc(d.nextPerformance.date) + " · " + esc(d.nextPerformance.title || d.nextPerformance.theme || "献诗")
      : "暂无排定的献诗场次";
    var practiceLine = d.nextPractice
      ? esc(d.nextPractice.date) + " " + esc(d.nextPractice.time || "") + " @ " + esc(d.nextPractice.place || "教会")
      : "请留意诗班微信群通知，或请团长在诗班页填写练习表。";
    var songsHtml =
      d.scores.length > 0
        ? '<ul class="volunteer-song-list">' +
          d.scores
            .map(function (s) {
              var link = s.link ? '<a href="' + esc(s.link) + '">乐谱</a>' : "";
              return (
                "<li><strong>" +
                esc(s.title || "曲目") +
                "</strong> " +
                esc(s.parts || "") +
                " " +
                link +
                "</li>"
              );
            })
            .join("") +
          "</ul>"
        : '<p class="volunteer-muted">曲目表尚空 · <a href="choir-team.html#choir-scores">诗班乐谱区</a> · <a href="sheet-music.html">乐谱管理</a></p>';
    host.innerHTML =
      '<div class="worship-volunteer-card">' +
      '<p class="volunteer-greeting">🎵 <strong>' +
      esc(d.name) +
      "</strong>，愿主赐你平安！</p>" +
      '<p class="volunteer-lead">本页只显示<strong>与你服事相关</strong>的信息，不会改动全教会行政数据。</p>' +
      '<div class="volunteer-block">' +
      "<h3>🕯️ 本周主日</h3>" +
      "<p>" +
      perfLine +
      "</p>" +
      (d.activePlan && d.activePlan.theme
        ? "<p>主日主题：" + esc(d.activePlan.theme) + " <span style=\"opacity:0.8\">(" + esc(d.activePlan.liturgySeason || "") + ")</span></p>"
        : d.nextService
          ? "<p>主日主题：" + esc(d.nextService.theme || "—") + "</p>"
          : "") +
      (d.activePlan && d.activePlan.songs && d.activePlan.songs.length
        ? "<p>诗歌：" + d.activePlan.songs.map(function(s){ return esc(s.title); }).join(" · ") + "</p>"
        : "") +
      "</div>" +
      '<div class="volunteer-block">' +
      "<h3>🎼 下次排练</h3>" +
      "<p>" +
      practiceLine +
      "</p>" +
      '<p><a href="choir-team.html#choir-flow">打开诗班流程表 →</a></p>' +
      "</div>" +
      '<div class="volunteer-block">' +
      "<h3>📄 本周曲目与乐谱</h3>" +
      songsHtml +
      "</div>" +
      (d.nextTeamSchedule
        ? '<div class="volunteer-block"><h3>🎸 敬拜团排班</h3><p>' +
          esc(d.nextTeamSchedule.date) +
          " · 主领 " +
          esc(d.nextTeamSchedule.lead || "—") +
          "</p></div>"
        : "") +
      '<div class="volunteer-actions">' +
      '<button type="button" class="volunteer-btn" id="volunteerSetName">设置显示姓名</button>' +
      '<a class="volunteer-btn" href="choir-team.html">诗班团队</a>' +
      '<a class="volunteer-btn" href="sheet-music.html">乐谱</a>' +
      "</div></div>";
    var btn = doc.getElementById("volunteerSetName");
    if (btn) {
      btn.addEventListener("click", function () {
        var nn = prompt("请输入您的姓名（仅本机显示）", getDisplayName());
        if (nn) {
          setDisplayName(nn);
          render(hostId);
        }
      });
    }
  }

  win.AeWorshipVolunteerCard = {
    NAME_KEY: NAME_KEY,
    collectCardData: collectCardData,
    render: render,
    getDisplayName: getDisplayName
  };
})(window, document);
