/**
 * 會眾築壇 · 只讀頁（無出席統計、無編輯）
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
    /* 沒有本週計畫就老實顯示「尚無」，不再自動塞聖靈降臨節示範 */
    var scripture = plan && plan.pulpit ? plan.pulpit.scripture : "—";
    var theme = plan ? plan.theme || "—" : "—";
    var season = plan ? plan.liturgySeason || "" : "";
    var songs = (plan && plan.songs) || [];
    host.innerHTML =
      '<div class="wt-hero">' +
      "<h2>🕊️ 本週與你一同築壇</h2>" +
      "<p class=\"wt-lead\">你不需要登錄行政系統。這裡只有<strong>預備心靈</strong>所需：主題、經文、詩歌。</p>" +
      "</div>" +
      '<div class="wt-card">' +
      "<h3>📅 " +
      esc(plan ? plan.date : "主日") +
      "</h3>" +
      "<p><strong>主題：</strong>" +
      esc(theme) +
      "</p>" +
      (season ? "<p><strong>教會年：</strong>" + esc(season) + "</p>" : "") +
      "<p><strong>經文：</strong>" +
      esc(scripture) +
      "</p>" +
      "</div>" +
      '<div class="wt-card">' +
      "<h3>🎵 本週詩歌</h3>" +
      (songs.length
        ? "<ol>" +
          songs
            .map(function (s) {
              return "<li><em>" + esc(s.slot) + "</em> " + esc(s.title) + "</li>";
            })
            .join("") +
          "</ol>"
        : "<p>詩歌表尚未發佈，請留意主日週報或微信群。</p>") +
      '<p class="wt-muted"><a href="congregational-songs.html">會眾詩歌說明 →</a>（管理頁，會眾可只讀瀏覽）</p>' +
      "</div>" +
      '<div class="wt-card wt-warm">' +
      "<h3>💬 想更深參與？</h3>" +
      "<p>若感動想服事詩班或敬拜團，可與招待同工或敬拜部聯繫試崗——不是填表打卡，而是一同回應呼召。</p>" +
      '<a class="volunteer-btn" href="../../_landing/worship.html#route-volunteer">認識敬拜花園 →</a>' +
      "</div>";
  }

  win.AeWorshipTogether = { render: render };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", function () { render(); });
  else render();
})(window, document);
