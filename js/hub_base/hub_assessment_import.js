/**
 * Phase 5 · 量表 → 人材池受控匯入（建議覆蓋，不強蓋人工標籤）
 */
(function (global) {
  "use strict";

  var DRAFT_KEY = "bible100_hub_assessment_import_draft";

  function hub() {
    return global.HubBase || null;
  }

  function propose(talentId, gift, source) {
    var H = hub();
    if (!H || !H.proposeTalentTagImport) return { ok: false, error: "HubBase.proposeTalentTagImport missing" };
    return H.proposeTalentTagImport(talentId, { gift: gift }, { tags_source: source || "assessment" });
  }

  function applyConfirmed(talentId, gift, note) {
    var H = hub();
    var C = global.SmartMinistryCanonical;
    if (!H || !C) return { ok: false, error: "canonical unavailable" };
    var check = propose(talentId, gift, "assessment");
    if (!check.ok) return check;
    if (check.action === "suggest_only" && !check.protected) {
      return { ok: false, error: "needs_manual_review", proposal: check };
    }
    if (check.action === "suggest_only" && check.protected) {
      return { ok: false, error: "leader_protected", proposal: check };
    }
    if (H.applyLeaderConfirmedTags) {
      return H.applyLeaderConfirmedTags(talentId, { gift: gift }, { note: note || "量表匯入（同工確認）", source: "hub_assessment_import" });
    }
    var res = C.saveOrUpdateTalent({ talent_id: talentId, member_id: talentId, gift: gift, tags_source: "assessment" });
    H.logAudit({
      domain: "talent_pool",
      action: "assessment_import_apply",
      target_id: talentId,
      after: { gift: gift },
      note: note || "",
      source: "HubAssessmentImport.applyConfirmed",
    });
    return { ok: !!(res && res.success !== false) };
  }

  function saveDraft(payload) {
    try {
      global.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload || {}));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    }
  }

  function loadDraft() {
    try {
      var raw = global.sessionStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  global.HubAssessmentImport = {
    propose: propose,
    applyConfirmed: applyConfirmed,
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    DRAFT_KEY: DRAFT_KEY,
  };
})(typeof window !== "undefined" ? window : global);
