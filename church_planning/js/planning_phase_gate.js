/**
 * G 規劃行政 · Phase 解鎖狀態（AssessmentRunStore + 戰情室掃描旗標）
 */
(function (global) {
  "use strict";

  var JOURNEY_KEY = "bible100_planning_journey_v1";
  var WAR_SCAN_KEY = "bible100_planning_war_room_scanned_at";

  function cfg() {
    return global.PlanningPhaseConfig || {};
  }

  function store() {
    return global.AssessmentRunStore;
  }

  function hasValidRun(toolId) {
    var s = store();
    if (!s || typeof s.loadLatest !== "function") return false;
    var run = s.loadLatest(toolId);
    return !!(run && !run.is_demo);
  }

  function anyValidRun(ids) {
    return (ids || []).some(hasValidRun);
  }

  function phase1Done() {
    return anyValidRun(cfg().PHASE1_TOOL_IDS || ["spiritual", "pastoral", "ncd"]);
  }

  function phase2Done() {
    return anyValidRun(cfg().PHASE2_TOOL_IDS || ["shape", "competency", "johari", "alda"]);
  }

  function warRoomScanned() {
    try {
      return !!global.localStorage.getItem(WAR_SCAN_KEY);
    } catch (e) {
      return false;
    }
  }

  function markWarRoomScanned() {
    try {
      global.localStorage.setItem(WAR_SCAN_KEY, String(Date.now()));
    } catch (e2) {
      /* ignore */
    }
  }

  function phase3Unlocked() {
    if (!phase1Done()) return false;
    return phase2Done() || warRoomScanned();
  }

  function phase2Unlocked() {
    return phase1Done();
  }

  function advancedUnlocked() {
    return phase1Done();
  }

  function isPhaseUnlocked(phaseId) {
    if (phaseId === 1) return true;
    if (phaseId === 2) return phase2Unlocked();
    if (phaseId === 3) return phase3Unlocked();
    if (phaseId === "advanced") return advancedUnlocked();
    return false;
  }

  function phase1Progress() {
    var ids = cfg().PHASE1_TOOL_IDS || [];
    var done = ids.filter(hasValidRun).length;
    return { done: done, total: ids.length };
  }

  function getJourneyState() {
    return {
      phase1Done: phase1Done(),
      phase2Done: phase2Done(),
      phase2Unlocked: phase2Unlocked(),
      phase3Unlocked: phase3Unlocked(),
      advancedUnlocked: advancedUnlocked(),
      warRoomScanned: warRoomScanned(),
      phase1Progress: phase1Progress()
    };
  }

  function readJourneyPrefs() {
    try {
      var raw = global.localStorage.getItem(JOURNEY_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveJourneyPrefs(prefs) {
    try {
      global.localStorage.setItem(JOURNEY_KEY, JSON.stringify(prefs || {}));
    } catch (e2) {
      /* ignore */
    }
  }

  global.PlanningPhaseGate = {
    JOURNEY_KEY: JOURNEY_KEY,
    WAR_SCAN_KEY: WAR_SCAN_KEY,
    hasValidRun: hasValidRun,
    phase1Done: phase1Done,
    phase2Done: phase2Done,
    phase2Unlocked: phase2Unlocked,
    phase3Unlocked: phase3Unlocked,
    advancedUnlocked: advancedUnlocked,
    isPhaseUnlocked: isPhaseUnlocked,
    warRoomScanned: warRoomScanned,
    markWarRoomScanned: markWarRoomScanned,
    phase1Progress: phase1Progress,
    getJourneyState: getJourneyState,
    readJourneyPrefs: readJourneyPrefs,
    saveJourneyPrefs: saveJourneyPrefs
  };
})(typeof window !== "undefined" ? window : this);
