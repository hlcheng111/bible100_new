/**
 * CRM 上云試玩 · 大樓通行證 Modal + trial 探照燈
 * URL: index_v5.html?trial=1
 */
(function (global) {
  "use strict";

  var ACK_KEY = "bible100_trial_ack_v1";

  function isTrialUrl() {
    try {
      return new URLSearchParams(global.location.search || "").get("trial") === "1";
    } catch (e) {
      return false;
    }
  }

  function hasAcked() {
    try {
      return global.localStorage.getItem(ACK_KEY) === "1";
    } catch (e2) {
      return false;
    }
  }

  function setAcked() {
    try {
      global.localStorage.setItem(ACK_KEY, "1");
    } catch (e3) {}
  }

  function appendTrialToFrameUrl(url) {
    if (!url || url === "about:blank") return url;
    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    var out = url + sep + "trial=1";
    if (global.bible100CacheBust) return global.bible100CacheBust(out);
    return out + "&v=" + Date.now();
  }

  function startTrialChurch() {
    if (typeof global.applyMode === "function") {
      global.applyMode("church");
    } else if (typeof global.openChurchMinistry === "function") {
      global.openChurchMinistry();
    }
  }

  function patchChurchLoader() {
    if (global.__bible100TrialPatched) return;
    global.__bible100TrialPatched = true;
    if (global.Bible100Shell && typeof global.Bible100Shell.loadFrames === "function") {
      var origLoad = global.Bible100Shell.loadFrames.bind(global.Bible100Shell);
      global.Bible100Shell.loadFrames = function (sidebar, content) {
        if (global.BIBLE100_TRIAL_MODE) {
          sidebar = appendTrialToFrameUrl(sidebar);
          content = appendTrialToFrameUrl(content);
        }
        return origLoad(sidebar, content);
      };
    }
  }

  function markChurchModeButton() {
    global.document.querySelectorAll(".mode-btn").forEach(function (btn) {
      var zh = btn.querySelector(".t-zh");
      if (!zh) return;
      if (/教會事工/.test(zh.textContent)) {
        btn.classList.add("mode-btn--trial-focus");
        if (!btn.querySelector(".trial-pulse")) {
          var sp = global.document.createElement("span");
          sp.className = "trial-pulse";
          sp.textContent = "🔥 試用中";
          btn.appendChild(sp);
        }
      } else {
        btn.classList.add("mode-btn--trial-dim");
      }
    });
  }

  function injectStyles() {
    if (global.document.getElementById("crm-trial-styles")) return;
    var s = global.document.createElement("style");
    s.id = "crm-trial-styles";
    s.textContent =
      ".bible100-trial-mode .mode-btn--trial-dim{opacity:.45;pointer-events:none}" +
      ".bible100-trial-mode .mode-btn--trial-focus{box-shadow:0 0 0 2px #fbbf24,0 0 12px rgba(251,191,36,.55)}" +
      ".mode-btn .trial-pulse{display:block;font-size:8px;color:#fef08a;margin-top:2px;animation:trialPulse 1.4s ease-in-out infinite}" +
      "@keyframes trialPulse{0%,100%{opacity:1}50%{opacity:.45}}" +
      ".bible100-trial-mode #contextBar{opacity:.35;pointer-events:none;max-height:28px;overflow:hidden}" +
      ".crm-trial-modal{position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,.72);display:flex;align-items:center;justify-content:center;padding:16px}" +
      ".crm-trial-modal__card{max-width:440px;background:linear-gradient(160deg,#fff 0%,#f5f3ff 100%);border-radius:16px;padding:22px 20px;box-shadow:0 20px 50px rgba(0,0,0,.25);border:1px solid #c4b5fd}" +
      ".crm-trial-modal__card h2{margin:0 0 10px;font-size:1.15rem;color:#4c1d95}" +
      ".crm-trial-modal__card p{margin:0 0 10px;font-size:13px;line-height:1.6;color:#334155}" +
      ".crm-trial-modal__card ul{margin:0 0 14px;padding-left:18px;font-size:12px;line-height:1.55;color:#475569}" +
      ".crm-trial-modal__cta{display:block;width:100%;padding:12px;border:none;border-radius:10px;background:#059669;color:#fff;font-weight:700;font-size:14px;cursor:pointer}" +
      ".crm-trial-modal__cta:hover{background:#047857}";
    global.document.head.appendChild(s);
  }

  function showModal() {
    injectStyles();
    var wrap = global.document.createElement("div");
    wrap.className = "crm-trial-modal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.innerHTML =
      '<div class="crm-trial-modal__card">' +
      "<h2>🏢 歡迎來到教會事工 CRM 體驗大樓</h2>" +
      "<p>這是專為您準備的<strong>雲端個人試玩沙盒</strong>（約 30 分鐘）。</p>" +
      "<ul>" +
      "<li>資料 <strong>100% 存在您目前的瀏覽器</strong>，雲端伺服器不會留存個資。</li>" +
      "<li>換電腦或清除快取，試玩資料會重置。</li>" +
      "<li>AI 只預填草稿，<strong>不會自動 LINE、不會自動儲存</strong>。</li>" +
      "</ul>" +
      '<button type="button" class="crm-trial-modal__cta">🟩 了解！發給我臨時通行證，開始試玩</button>' +
      "</div>";
    wrap.querySelector(".crm-trial-modal__cta").addEventListener("click", function () {
      setAcked();
      wrap.remove();
      startTrialChurch();
    });
    global.document.body.appendChild(wrap);
  }

  function init() {
    if (!isTrialUrl()) return;
    global.BIBLE100_TRIAL_MODE = true;
    injectStyles();
    global.document.body.classList.add("bible100-trial-mode");
    patchChurchLoader();

    var origApply = global.applyMode;
    if (typeof origApply === "function" && !global.__trialApplyPatched) {
      global.__trialApplyPatched = true;
      global.applyMode = function (mode) {
        if (global.BIBLE100_TRIAL_MODE && mode === "church") {
          global.setContextOpen && global.setContextOpen(false);
        }
        return origApply(mode);
      };
    }

    function afterShell() {
      markChurchModeButton();
      if (!hasAcked()) showModal();
      else startTrialChurch();
    }

    if (global.Bible100Shell && global.Bible100Shell.loadConfig) {
      global.Bible100Shell.loadConfig().then(afterShell).catch(afterShell);
    } else {
      setTimeout(afterShell, 400);
    }
  }

  global.CrmTrialWelcome = { init: init, isTrialUrl: isTrialUrl, appendTrialToFrameUrl: appendTrialToFrameUrl };
  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
