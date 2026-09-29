/**
 * Phase 6 · AI Lab 硬約束：草稿存 sessionStorage；禁止直寫 canonical
 */
(function (global) {
  "use strict";

  var DRAFT_PREFIX = "bible100_ai_draft_";
  var BLOCKED_WRITE_KEYS = [
    "memberSystemData",
    "bible100_smart_ministry_main",
    "bible100_assessment_runs",
  ];

  function scenarioAllowed(id) {
    if (!id) return false;
    var ssot = global.AiScenarioSsot;
    if (ssot && ssot.list) {
      return ssot.list().some(function (s) {
        return s.id === id;
      });
    }
    if (ssot && ssot.SCENARIOS) {
      return ssot.SCENARIOS.some(function (s) {
        return s.id === id;
      });
    }
    return true;
  }

  function readScenarioFromUrl() {
    try {
      return new URLSearchParams(global.location.search || "").get("scenario") || "";
    } catch (e) {
      return "";
    }
  }

  function saveDraft(scenarioId, text) {
    var key = DRAFT_PREFIX + (scenarioId || "generic");
    try {
      global.sessionStorage.setItem(
        key,
        JSON.stringify({ scenario: scenarioId, text: text, saved_at: new Date().toISOString() })
      );
      return { ok: true, key: key };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    }
  }

  function loadDraft(scenarioId) {
    try {
      var raw = global.sessionStorage.getItem(DRAFT_PREFIX + (scenarioId || "generic"));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function guardCanonicalWrites() {
    if (!global.localStorage || global.__b100_ai_draft_guard__) return;
    global.__b100_ai_draft_guard__ = true;
    var orig = global.localStorage.setItem.bind(global.localStorage);
    global.localStorage.setItem = function (key, value) {
      if (BLOCKED_WRITE_KEYS.indexOf(String(key)) >= 0) {
        console.warn("[AiDraftGuard] blocked canonical write from AI context:", key);
        saveDraft(readScenarioFromUrl() || "blocked", value);
        return;
      }
      return orig(key, value);
    };
  }

  function initBanner() {
    if (!global.document || global.document.getElementById("ai-draft-guard-banner")) return;
    var bar = global.document.createElement("div");
    bar.id = "ai-draft-guard-banner";
    bar.setAttribute(
      "style",
      "font-size:11px;background:#fef3c7;border-bottom:1px solid #fcd34d;padding:6px 12px;color:#92400e;"
    );
    var sid = readScenarioFromUrl();
    bar.textContent =
      "AI 草稿模式 · 輸出仅存 sessionStorage，須人審後才写入正式底座" +
      (sid ? " · scenario=" + sid : "");
    global.document.body.insertBefore(bar, global.document.body.firstChild);
  }

  function init() {
    guardCanonicalWrites();
    var sid = readScenarioFromUrl();
    if (sid && !scenarioAllowed(sid)) {
      console.warn("[AiDraftGuard] unknown scenario:", sid);
    }
    if (global.document && global.document.body) initBanner();
  }

  global.AiDraftGuard = {
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    scenarioAllowed: scenarioAllowed,
    init: init,
    DRAFT_PREFIX: DRAFT_PREFIX,
  };

  if (global.document) {
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : global);
