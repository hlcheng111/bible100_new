/**
 * Bible100 小白引導教程 — 3 步引導流程（Onboarding v1）
 * Bible App 專用版本
 */
(function (global) {
  "use strict";

  var STEP_KEY = "bible100_onboard_v1_step";
  var DONE_KEY = "bible100_onboard_v1_done";
  var PERSONA_KEY = "bible100_onboard_persona";

  var currentPersona = null;
  var currentStep = 1;

  function getPersona() {
    if (currentPersona) return currentPersona;
    try {
      var params = new URLSearchParams(global.location.search || "");
      var persona = params.get("persona") || "adult";
      currentPersona = persona;
      return persona;
    } catch (e) {
      return "adult";
    }
  }

  function getStep() {
    try {
      var step = global.localStorage.getItem(STEP_KEY);
      if (step) return parseInt(step, 10);
    } catch (e) {}
    return 1;
  }

  function setStep(step) {
    try {
      global.localStorage.setItem(STEP_KEY, String(step));
      currentStep = step;
    } catch (e) {}
  }

  function isDone() {
    try {
      return global.localStorage.getItem(DONE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setDone() {
    try {
      global.localStorage.setItem(DONE_KEY, "1");
    } catch (e) {}
  }

  function shouldShow() {
    if (isDone()) return false;
    try {
      var params = new URLSearchParams(global.location.search || "");
      if (params.get("onboard") === "1") return true;
    } catch (e) {}
    return false;
  }

  function getJobCards(persona) {
    var cards = {
      adult: [
        {
          id: "job-bible66",
          title: "六十六卷",
          subtitle: "讀完整本聖經",
          icon: "📖"
        },
        {
          id: "job-30day",
          title: "三十日",
          subtitle: "快速入門",
          icon: "⏱️"
        },
        {
          id: "job-golden",
          title: "100金句",
          subtitle: "背誦金句",
          icon: "💎"
        }
      ],
      kids: [
        {
          id: "job-bible66",
          title: "六十六卷",
          subtitle: "讀完整本聖經",
          icon: "📖"
        },
        {
          id: "job-golden",
          title: "100金句",
          subtitle: "背誦金句",
          icon: "💎"
        },
        {
          id: "job-theme",
          title: "主題讀經",
          subtitle: "按主題學習",
          icon: "🎯"
        }
      ],
      seeker: [
        {
          id: "job-30day",
          title: "三十日",
          subtitle: "快速入門",
          icon: "⏱️"
        },
        {
          id: "job-golden",
          title: "100金句",
          subtitle: "背誦金句",
          icon: "💎"
        },
        {
          id: "job-theme",
          title: "主題讀經",
          subtitle: "按主題學習",
          icon: "🎯"
        }
      ],
      parent: [
        {
          id: "job-bible66",
          title: "六十六卷",
          subtitle: "讀完整本聖經",
          icon: "📖"
        },
        {
          id: "job-theme",
          title: "主題讀經",
          subtitle: "按主題學習",
          icon: "🎯"
        },
        {
          id: "job-golden",
          title: "100金句",
          subtitle: "背誦金句",
          icon: "💎"
        }
      ]
    };
    return cards[persona] || cards.adult;
  }

  function getJobRoute(jobId) {
    var routes = {
      "job-bible66": "pages/bible66.html",
      "job-30day": "pages/track-30day.html",
      "job-golden": "pages/track-golden.html",
      "job-theme": "pages/track-theme.html"
    };
    return routes[jobId];
  }

  function navigateToJob(jobId) {
    var route = getJobRoute(jobId);
    if (!route) return;

    var contentFrame = document.getElementById("contentFrame");
    if (contentFrame) {
      contentFrame.src = window.b100ShellAsset(route);
    }

    setStep(2);
    setTimeout(showStep2CoachMark, 500);
  }

  function showStep2CoachMark() {
    removeModal();
    var coach = document.createElement("div");
    coach.id = "bible100-onboard-coachmark";
    coach.className = "bible100-onboard-coachmark";
    coach.innerHTML = 
      '<div class="coachmark-bubble">' +
        '<div class="coachmark-title">這是你的賽道</div>' +
        '<div class="coachmark-text">在這裡你可以選擇不同的讀經賽道。試試點擊上方的賽道按鈕！</div>' +
        '<div class="coachmark-actions">' +
          '<button class="coachmark-btn coachmark-btn-next" id="onboard-step3">下一步</button>' +
          '<button class="coachmark-btn coachmark-btn-skip" id="onboard-skip">跳過引導</button>' +
        '</div>' +
        '<div class="coachmark-arrow"></div>' +
      '</div>';
    document.body.appendChild(coach);

    document.getElementById("onboard-step3").addEventListener("click", showStep3);
    document.getElementById("onboard-skip").addEventListener("click", skipOnboarding);
  }

  function showStep3() {
    removeCoachMark();
    var modal = document.createElement("div");
    modal.id = "bible100-onboard-modal";
    modal.className = "bible100-onboard-modal";
    modal.innerHTML = 
      '<div class="onboard-modal__card">' +
        '<div class="onboard-modal__header">' +
          '<h2 class="onboard-modal__title">完成一個動作</h2>' +
          '<button class="onboard-modal__close" id="onboard-close">✕</button>' +
        '</div>' +
        '<div class="onboard-modal__body">' +
          '<p class="onboard-modal__text">在右側內容區完成以下任一動作：</p>' +
          '<ul class="onboard-modal__list">' +
            '<li>✓ 閱讀一段經文</li>' +
            '<li>✓ 點擊賽道按鈕</li>' +
            '<li>✓ 切換語言</li>' +
          '</ul>' +
          '<p class="onboard-modal__hint">完成後點擊下方按鈕</p>' +
        '</div>' +
        '<div class="onboard-modal__footer">' +
          '<button class="onboard-modal__btn onboard-modal__btn-primary" id="onboard-complete">我已完成</button>' +
          '<button class="onboard-modal__btn onboard-modal__btn-secondary" id="onboard-skip2">跳過</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById("onboard-close").addEventListener("click", skipOnboarding);
    document.getElementById("onboard-complete").addEventListener("click", completeOnboarding);
    document.getElementById("onboard-skip2").addEventListener("click", skipOnboarding);
  }

  function completeOnboarding() {
    setDone();
    removeModal();
    removeCoachMark();
    showCompletionCard();
  }

  function showCompletionCard() {
    var card = document.createElement("div");
    card.id = "bible100-onboard-complete";
    card.className = "bible100-onboard-complete";
    card.innerHTML = 
      '<div class="complete-card">' +
        '<div class="complete-icon">✅</div>' +
        '<h3 class="complete-title">你已完成 3 步引導</h3>' +
        '<p class="complete-text">開始你的讀經之旅吧！</p>' +
        '<button class="complete-btn" id="onboard-dismiss">開始使用</button>' +
      '</div>';
    document.body.appendChild(card);

    document.getElementById("onboard-dismiss").addEventListener("click", function() {
      card.remove();
    });
  }

  function skipOnboarding() {
    setDone();
    removeModal();
    removeCoachMark();
  }

  function removeModal() {
    var modal = document.getElementById("bible100-onboard-modal");
    if (modal) modal.remove();
  }

  function removeCoachMark() {
    var coach = document.getElementById("bible100-onboard-coachmark");
    if (coach) coach.remove();
  }

  function showStep1Modal() {
    var persona = getPersona();
    var cards = getJobCards(persona);

    var modal = document.createElement("div");
    modal.id = "bible100-onboard-modal";
    modal.className = "bible100-onboard-modal";
    
    var cardsHtml = cards.map(function(card) {
      return (
        '<div class="onboard-card" data-job="' + card.id + '">' +
          '<div class="onboard-card__icon">' + card.icon + '</div>' +
          '<div class="onboard-card__title">' + card.title + '</div>' +
          '<div class="onboard-card__subtitle">' + card.subtitle + '</div>' +
        '</div>'
      );
    }).join("");

    modal.innerHTML = 
      '<div class="onboard-modal__card">' +
        '<div class="onboard-modal__header">' +
          '<h2 class="onboard-modal__title">歡迎使用聖經跑道</h2>' +
          '<button class="onboard-modal__close" id="onboard-close">✕</button>' +
        '</div>' +
        '<div class="onboard-modal__body">' +
          '<p class="onboard-modal__text">請選擇你想開始的賽道：</p>' +
          '<div class="onboard-cards">' + cardsHtml + '</div>' +
        '</div>' +
        '<div class="onboard-modal__footer">' +
          '<button class="onboard-modal__btn onboard-modal__btn-secondary" id="onboard-skip">跳過引導</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    document.querySelectorAll(".onboard-card").forEach(function(card) {
      card.addEventListener("click", function() {
        var jobId = this.getAttribute("data-job");
        navigateToJob(jobId);
      });
    });

    document.getElementById("onboard-close").addEventListener("click", skipOnboarding);
    document.getElementById("onboard-skip").addEventListener("click", skipOnboarding);

    setStep(1);
  }

  function injectStyles() {
    if (document.getElementById("onboarding-v1-styles")) return;
    var s = document.createElement("style");
    s.id = "onboarding-v1-styles";
    s.textContent = 
      '.bible100-onboard-modal{position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,.75);display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.onboard-modal__card{max-width:480px;width:100%;background:linear-gradient(160deg,#fff 0%,#f5f3ff 100%);border-radius:16px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.25);border:1px solid #c4b5fd}' +
      '.onboard-modal__header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}' +
      '.onboard-modal__title{margin:0;font-size:1.25rem;font-weight:700;color:#4c1d95}' +
      '.onboard-modal__close{width:32px;height:32px;border:none;border-radius:8px;background:rgba(0,0,0,.05);font-size:18px;cursor:pointer;color:#64748b;transition:background .2s}' +
      '.onboard-modal__close:hover{background:rgba(0,0,0,.1)}' +
      '.onboard-modal__body{margin-bottom:20px}' +
      '.onboard-modal__text{margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155}' +
      '.onboard-modal__list{margin:0;padding-left:20px;font-size:13px;line-height:1.7;color:#475569}' +
      '.onboard-modal__list li{margin-bottom:6px}' +
      '.onboard-modal__hint{margin:12px 0 0;font-size:12px;color:#94a3b8;font-style:italic}' +
      '.onboard-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}' +
      '.onboard-card{padding:16px;border:2px solid #e2e8f0;border-radius:12px;background:#fff;cursor:pointer;transition:all .2s;text-align:center}' +
      '.onboard-card:hover{border-color:#8b5cf6;transform:translateY(-2px);box-shadow:0 4px 12px rgba(139,92,246,.15)}' +
      '.onboard-card__icon{font-size:2rem;margin-bottom:8px}' +
      '.onboard-card__title{font-size:13px;font-weight:700;color:#1e293b;margin-bottom:4px}' +
      '.onboard-card__subtitle{font-size:11px;color:#64748b;line-height:1.4}' +
      '.onboard-modal__footer{display:flex;gap:10px;justify-content:flex-end}' +
      '.onboard-modal__btn{padding:10px 20px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}' +
      '.onboard-modal__btn-primary{background:#8b5cf6;color:#fff}' +
      '.onboard-modal__btn-primary:hover{background:#7c3aed}' +
      '.onboard-modal__btn-secondary{background:#e2e8f0;color:#475569}' +
      '.onboard-modal__btn-secondary:hover{background:#cbd5e1}' +
      '.bible100-onboard-coachmark{position:fixed;top:100px;right:20px;z-index:10040}' +
      '.coachmark-bubble{background:#8b5cf6;color:#fff;padding:16px;border-radius:12px;max-width:280px;box-shadow:0 8px 24px rgba(139,92,246,.3);position:relative}' +
      '.coachmark-bubble::before{content:"";position:absolute;top:-8px;left:20px;border-width:0 8px 8px;border-style:solid;border-color:transparent transparent #8b5cf6}' +
      '.coachmark-title{font-weight:700;margin-bottom:8px;font-size:14px}' +
      '.coachmark-text{font-size:12px;line-height:1.5;margin-bottom:12px;opacity:.95}' +
      '.coachmark-actions{display:flex;gap:8px}' +
      '.coachmark-btn{padding:6px 12px;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer}' +
      '.coachmark-btn-next{background:#fff;color:#8b5cf6}' +
      '.coachmark-btn-skip{background:rgba(255,255,255,.2);color:#fff}' +
      '.bible100-onboard-complete{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:10040}' +
      '.complete-card{background:#fff;padding:20px 24px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);border:2px solid #22c55e;display:flex;align-items:center;gap:16px}' +
      '.complete-icon{font-size:2rem}' +
      '.complete-title{margin:0;font-size:15px;font-weight:700;color:#1e293b}' +
      '.complete-text{margin:0;font-size:13px;color:#64748b}' +
      '.complete-btn{margin-left:auto;padding:8px 16px;background:#22c55e;color:#fff;border:none;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer}' +
      '.complete-btn:hover{background:#16a34a}' +
      '@media(max-width:640px){.onboard-cards{grid-template-columns:1fr}.onboard-modal__card{max-width:340px}.coachmark-bubble{max-width:220px;right:10px}}';
    document.head.appendChild(s);
  }

  function init() {
    if (!shouldShow()) return;

    injectStyles();

    var step = getStep();
    if (step === 1) {
      showStep1Modal();
    } else if (step === 2) {
      showStep2CoachMark();
    } else if (step === 3) {
      showStep3();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.Bible100Onboarding = {
    init: init,
    show: showStep1Modal,
    skip: skipOnboarding,
    reset: function() {
      try {
        global.localStorage.removeItem(STEP_KEY);
        global.localStorage.removeItem(DONE_KEY);
        global.localStorage.removeItem(PERSONA_KEY);
      } catch (e) {}
    }
  };
})(typeof window !== "undefined" ? window : this);
