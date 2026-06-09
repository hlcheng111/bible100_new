/**
 * W4 · 敬拜主桌双视角（同工 / 部长）
 */
(function (win, doc) {
  "use strict";

  var ROLE_KEY = "worship_view_role";

  function qsRole() {
    var m = (win.location.search || "").match(/[?&]view=(volunteer|leader)/i);
    return m ? m[1].toLowerCase() : null;
  }

  function getRole() {
    var q = qsRole();
    if (q) return q;
    var stored = localStorage.getItem(ROLE_KEY);
    return stored === "volunteer" ? "volunteer" : "leader";
  }

  function setRole(role) {
    localStorage.setItem(ROLE_KEY, role === "volunteer" ? "volunteer" : "leader");
    apply();
  }

  function renderStrategyBanner() {
    var host = doc.getElementById("worship-strategy-banner");
    if (!host || !win.AeWorshipStrategyBridge) return;
    if (getRole() !== "leader") {
      host.style.display = "none";
      return;
    }
    var hints = win.AeWorshipStrategyBridge.getStrategyHints();
    if (!hints.message) {
      host.style.display = "none";
      return;
    }
    host.style.display = "block";
    host.className = hints.simplify ? "worship-strategy-banner warn" : "worship-strategy-banner info";
    host.innerHTML =
      (hints.simplify ? "⚠️ <strong>圣灵修剪防线</strong> · " : "💡 ") +
      hints.message +
      (hints.simplify
        ? ' <button type="button" class="volunteer-btn" id="strategyAckBtn">记入意向草稿</button>'
        : "");
    var ack = doc.getElementById("strategyAckBtn");
    if (ack && win.AeWorshipCrmBridge) {
      ack.addEventListener("click", function () {
        win.AeWorshipCrmBridge.pushIntent("simplify", "简约崇拜模式（规划提示）", { from: "strategy_bridge" });
        ack.textContent = "已记录";
      });
    }
  }

  function renderWatchAlerts() {
    var host = doc.getElementById("worship-watch-alerts");
    if (!host || !win.WorshipDataHub || getRole() !== "leader") {
      if (host) host.innerHTML = "";
      return;
    }
    var signals = win.WorshipDataHub.scanBurnoutSignals ? win.WorshipDataHub.scanBurnoutSignals() : [];
    if (!signals.length) {
      host.innerHTML = "";
      return;
    }
    var cm = "../../";
    host.innerHTML =
      '<div class="worship-watch-panel">' +
      "<h3>⚠️ 同工守望（连续缺席预警）</h3>" +
      "<ul>" +
      signals
        .slice(0, 5)
        .map(function (s) {
          return (
            "<li><strong>" +
            s.memberName +
            "</strong> · " +
            s.weeksAbsent +
            " 周缺席 · " +
            s.reason +
            ' <a href="' +
            cm +
            "modules/support/visitation_index.html?crm_from=worship&draft_member=" +
            encodeURIComponent(s.memberName) +
            '">→ 探访桌</a></li>'
          );
        })
        .join("") +
      "</ul></div>";
  }

  function apply() {
    var role = getRole();
    var leaderRoot = doc.getElementById("worship-leader-root");
    var volunteerRoot = doc.getElementById("worship-volunteer-root");
    var switcher = doc.getElementById("worship-role-switcher");
    if (switcher) {
      switcher.querySelectorAll("[data-role]").forEach(function (btn) {
        var active = btn.getAttribute("data-role") === role;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    if (leaderRoot) leaderRoot.style.display = role === "leader" ? "" : "none";
    var leaderContainer = doc.getElementById("worship-leader-container");
    if (leaderContainer) leaderContainer.style.display = role === "leader" ? "" : "none";
    doc.querySelectorAll("[data-leader-only]").forEach(function (el) {
      el.style.display = role === "leader" ? "" : "none";
    });
    if (volunteerRoot) {
      volunteerRoot.style.display = role === "volunteer" ? "block" : "none";
      if (role === "volunteer" && win.AeWorshipVolunteerCard) {
        win.AeWorshipVolunteerCard.render("worship-volunteer-root");
      }
    }
    doc.body.setAttribute("data-worship-view", role);
    renderStrategyBanner();
    renderWatchAlerts();
    if (role === "leader" && win.AeWorshipHubPanel) {
      win.AeWorshipHubPanel.renderMain("w3-hub-panel");
    }
  }

  function mountSwitcher() {
    var header = doc.querySelector(".header h1");
    if (!header || doc.getElementById("worship-role-switcher")) return;
    var nav = doc.createElement("div");
    nav.id = "worship-role-switcher";
    nav.className = "worship-role-switcher";
    nav.innerHTML =
      '<span class="worship-role-label">我是谁：</span>' +
      '<button type="button" data-role="volunteer" class="worship-role-btn">🙋 事奉同工</button>' +
      '<button type="button" data-role="leader" class="worship-role-btn">👑 敬拜部长</button>';
    header.parentNode.insertBefore(nav, header.nextSibling);
    nav.querySelectorAll("[data-role]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setRole(btn.getAttribute("data-role"));
      });
    });
  }

  function boot() {
    var q = qsRole();
    if (q) localStorage.setItem(ROLE_KEY, q);
    mountSwitcher();
    apply();
  }

  win.AeWorshipRoleViews = { ROLE_KEY: ROLE_KEY, getRole: getRole, setRole: setRole, apply: apply };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
