/**
 * P1–P6：流程總覽頁底部 — 規劃鏈 L1/L2、長執會草稿、PDCA 雙軌提示、Next 連結
 */
(function () {
  var P = window.LongTermPipeline;
  if (!P || typeof P.analyzePlanningChain !== "function") return;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function render() {
    var host = document.getElementById("planning-chain-panel");
    if (!host) return;
    var r = P.analyzePlanningChain();
    var l1h =
      r.l1.length === 0
        ? "<p class=\"chain-ok\">L1：SWOT→SMART→看板 無明顯斷鏈（或資料尚未開始）。</p>"
        : "<ul class=\"chain-l1\">" +
          r.l1
            .map(function (x) {
              return (
                "<li><strong>" +
                esc(x.step) +
                "</strong> — " +
                esc(x.msg) +
                (x.href
                  ? " → <a href=\"" +
                    esc(x.href) +
                    "\" target=\"phase1-frame\" rel=\"noopener\">開啟</a>"
                  : "") +
                "</li>"
              );
            })
            .join("") +
          "</ul>";

    var l2h =
      r.l2.length === 0
        ? "<p class=\"chain-muted\">L2：無額外規則提醒。</p>"
        : "<ul class=\"chain-l2\">" +
          r.l2
            .map(function (x) {
              return (
                "<li><code>" +
                esc(x.rule) +
                "</code> " +
                esc(x.msg) +
                (x.href
                  ? " → <a href=\"" + esc(x.href) + "\" target=\"phase1-frame\">" + esc(x.href) + "</a>"
                  : "") +
                "</li>"
              );
            })
            .join("") +
          "</ul>";

    host.innerHTML =
      "<details open class=\"chain-details\">" +
      "<summary>規劃鏈檢查（P1/P2）· L1 斷鏈 / L2 規則</summary>" +
      "<div class=\"chain-body\">" +
      l1h +
      l2h +
      "<p class=\"chain-pdca\"><strong>P4／PDCA：</strong> " +
      esc(r.pdcaNote) +
      " <a href=\"../pdca-planning.html\" target=\"_blank\" rel=\"noopener\">pdca-planning.html</a></p>" +
      "<div class=\"chain-next\"><strong>P6 · Next：</strong> " +
      "<a href=\"swot.html\" target=\"phase1-frame\">SWOT</a> · " +
      "<a href=\"goals.html\" target=\"phase1-frame\">SMART</a> · " +
      "<a href=\"kanban.html\" target=\"phase1-frame\">看板</a> · " +
      "<a href=\"raci-reflection.html\" target=\"phase1-frame\">RACI 反思（Check）</a> · " +
      "<a href=\"../dashboard.html\" target=\"_blank\">戰情總覽</a></div>" +
      "<div class=\"chain-p3\"><strong>P3 · 給長執會段落（可複製）：</strong>" +
      "<textarea id=\"chain-meeting-text\" readonly rows=\"5\" class=\"chain-ta\"></textarea>" +
      "<button type=\"button\" class=\"chain-copy-btn\" id=\"chain-copy-meeting\">複製到剪貼簿</button></div>" +
      "<p class=\"chain-p5\"><strong>P5 · PDF／列印：</strong> 匯出前請先展開報告區、確認圖表已繪製；避免 <code>display:none</code> 內截圖。</p>" +
      "</div></details>";

    var ta = document.getElementById("chain-meeting-text");
    if (ta) ta.value = r.meetingBullets;
    var btn = document.getElementById("chain-copy-meeting");
    if (btn && ta) {
      btn.addEventListener("click", function () {
        ta.select();
        try {
          document.execCommand("copy");
        } catch (e) {}
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
