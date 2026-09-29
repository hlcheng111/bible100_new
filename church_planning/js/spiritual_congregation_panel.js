/**
 * Phase 3 · 靈命健康 · 教會牧養聚合視角（恩賜分佈 + 人力短缺 · 不點名）
 */
(function (global) {
  "use strict";

  function bridge() {
    return global.PdcaHubBridge || null;
  }

  function esc(s) {
    return bridge() ? bridge().esc(s) : String(s || "");
  }

  function render(intoId) {
    var el = global.document.getElementById(intoId);
    if (!el || !bridge()) return;
    var snap = bridge().computeManpowerSnapshot();
    if (!snap.ok) {
      el.innerHTML = "<p class='text-sm text-slate-600'>尚無人材池資料。會友完成註冊與恩賜測驗後，此處會顯示<strong>整體</strong>分佈（非個人排名）。</p>";
      return;
    }
    var gifts =
      snap.gift_distribution && snap.gift_distribution.length
        ? "<ul style='margin:8px 0 0;padding-left:1.1rem;font-size:0.85rem;line-height:1.55'>" +
          snap.gift_distribution
            .map(function (g) {
              return "<li>" + esc(g.gift) + " · " + g.count + " 人</li>";
            })
            .join("") +
          "</ul>"
        : "<p style='margin:8px 0;font-size:0.85rem;color:#64748b'>恩賜資料尚少；請鼓勵會友完成屬靈恩賜測驗。</p>";

    var zones =
      snap.zone_shortage && snap.zone_shortage.length
        ? "<ul style='margin:8px 0 0;padding-left:1.1rem;font-size:0.85rem;line-height:1.55'>" +
          snap.zone_shortage
            .slice(0, 6)
            .map(function (z) {
              return (
                "<li><strong>" +
                esc(z.label) +
                "</strong>：缺 " +
                z.vacant +
                " · 使用率 " +
                z.utilization_pct +
                "%</li>"
              );
            })
            .join("") +
          "</ul>"
        : "<p style='margin:8px 0;font-size:0.85rem;color:#64748b'>尚無 A–G 崗位盤點；可從教會事工提交需求。</p>";

    el.innerHTML =
      "<div style='border-left:4px solid #be123c;padding-left:12px'>" +
      "<p style='margin:0 0 6px;font-size:0.72rem;font-weight:800;color:#9f1239'>教會牧養視角 · 整體統計（非考核、不排名）</p>" +
      "<p style='margin:0 0 8px;font-size:0.85rem;line-height:1.55;color:#334155'>人才 <strong>" +
      snap.totals.talents +
      "</strong> · 崗位 <strong>" +
      snap.totals.ministries +
      "</strong> · 整體空缺率 <strong>" +
      snap.totals.vacancy_rate_pct +
      "%</strong></p>" +
      "<p style='margin:0;font-size:0.82rem;font-weight:700;color:#881337'>恩賜分佈（聚合）</p>" +
      gifts +
      "<p style='margin:12px 0 0;font-size:0.82rem;font-weight:700;color:#881337'>各區人力短缺</p>" +
      zones +
      "<p style='margin:10px 0 0;font-size:0.78rem;color:#64748b'>季末檢討 → <a href='Church_Governance_PDCA_cycle.html' class='underline font-bold'>PDCA 本季事奉檢討</a></p>" +
      "</div>";
  }

  function init() {
    render("spiritual-congregation-mount");
    render("spiritual-congregation-report");
  }

  global.SpiritualCongregationPanel = { init: init, render: render };

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : global);
