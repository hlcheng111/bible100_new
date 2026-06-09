/**
 * 会众筑坛 · 只读页（无出席统计、无编辑）
 */
(function (win, doc) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;");
  }

  function render(hostId) {
    var host = doc.getElementById(hostId || "worship-together-root");
    if (!host) return;
    var plan = win.WorshipSundayPlan ? win.WorshipSundayPlan.getActivePlan() : null;
    if (!plan && win.WorshipSundayPlan) {
      plan = win.WorshipSundayPlan.seedDemoPentecost();
    }
    var scripture = plan && plan.pulpit ? plan.pulpit.scripture : "—";
    var theme = plan ? plan.theme || "—" : "—";
    var season = plan ? plan.liturgySeason || "" : "";
    var songs = (plan && plan.songs) || [];
    host.innerHTML =
      '<div class="wt-hero">' +
      "<h2>🕊️ 本周与你一同筑坛</h2>" +
      "<p class=\"wt-lead\">你不需要登录行政系统。这里只有<strong>预备心灵</strong>所需：主题、经文、诗歌。</p>" +
      "</div>" +
      '<div class="wt-card">' +
      "<h3>📅 " +
      esc(plan ? plan.date : "主日") +
      "</h3>" +
      "<p><strong>主题：</strong>" +
      esc(theme) +
      "</p>" +
      (season ? "<p><strong>教会年：</strong>" + esc(season) + "</p>" : "") +
      "<p><strong>经文：</strong>" +
      esc(scripture) +
      "</p>" +
      "</div>" +
      '<div class="wt-card">' +
      "<h3>🎵 本周诗歌</h3>" +
      (songs.length
        ? "<ol>" +
          songs
            .map(function (s) {
              return "<li><em>" + esc(s.slot) + "</em> " + esc(s.title) + "</li>";
            })
            .join("") +
          "</ol>"
        : "<p>诗歌表尚未发布，请留意主日周报或微信群。</p>") +
      '<p class="wt-muted"><a href="congregational-songs.html">会众诗歌说明 →</a>（管理页，会众可只读浏览）</p>' +
      "</div>" +
      '<div class="wt-card wt-warm">' +
      "<h3>💬 想更深参与？</h3>" +
      "<p>若感动想服事诗班或敬拜团，可与招待同工或敬拜部联系试岗——不是填表打卡，而是一同回应呼召。</p>" +
      '<a class="volunteer-btn" href="../../_landing/worship.html#route-volunteer">认识敬拜花园 →</a>' +
      "</div>";
  }

  win.AeWorshipTogether = { render: render };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { render(); });
  else render();
})(window, document);
