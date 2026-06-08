/**
 * 治理鏈 → CRM 排水口（唯讀旗標）
 * 讀 AssessmentRunStore：PDCA Δ、KPI 卡關、80/20 剪枝 — 不寫入 CRM 派工。
 */
(function (global) {
  "use strict";

  function loadRun(toolId) {
    if (!global.AssessmentRunStore || !toolId) return null;
    return AssessmentRunStore.loadLatest(toolId);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function scanGovernanceFlags() {
    var pdca = loadRun("pdca");
    var kpi = loadRun("kpiokr");
    var m8020 = loadRun("ministry8020");
    var swot = loadRun("swot");

    var contract = pdca && (pdca.pdca_contract || (pdca.derived && pdca.derived.pdca_contract));
    var deming = contract && contract.check_variance;
    var deming_alert = !!(deming && deming.deming_alert);
    var wo_lock =
      !!(contract && contract.plan_metrics && contract.plan_metrics.strategic_anchor_highlight) ||
      !!(swot && swot.derived && swot.derived.focus_strategy === "WO");

    var resource_stuck =
      kpi && kpi.derived && kpi.derived.resource_stuck_rate != null
        ? Number(kpi.derived.resource_stuck_rate)
        : 0;
    var resource_stuck_alert =
      resource_stuck >= 70 ||
      !!(kpi && kpi.risk_flags && kpi.risk_flags.indexOf("RESOURCE_STUCK") >= 0);

    var prune_ministries = [];
    var analysis = m8020 && m8020.derived && m8020.derived.analysis;
    if (analysis && analysis.rows) {
      analysis.rows.forEach(function (r) {
        if (r && (r.forced_prune || (resource_stuck_alert && r.isPruneCandidate))) {
          prune_ministries.push(r.name);
        }
      });
    }

    var governance_mode = "normal";
    if (deming_alert) governance_mode = "fasting";
    else if (resource_stuck_alert || prune_ministries.length) governance_mode = "resource_throttle";

    return {
      ok: true,
      governance_mode: governance_mode,
      deming_alert: deming_alert,
      deming_delta: deming && deming.Delta_variance != null ? deming.Delta_variance : null,
      wo_strategic_lock: wo_lock,
      resource_stuck_rate: resource_stuck,
      resource_stuck_alert: resource_stuck_alert,
      prune_ministries: prune_ministries,
      recruitment_paused: deming_alert,
      matchmaker_yellow: deming_alert || resource_stuck_alert,
      has_live_pdca: !!(pdca && !pdca.is_demo),
      has_live_kpi: !!(kpi && !kpi.is_demo),
      has_live_8020: !!(m8020 && !m8020.is_demo)
    };
  }

  function renderEntryBannerHtml(flags) {
    flags = flags || scanGovernanceFlags();
    var parts = [];
    if (flags.deming_alert) {
      parts.push(
        "<strong>🟡 事工禁食協議</strong>：PDCA 落差 Δ≥2.5，本季暫停開辦新服事，全面轉入小組關懷與靈性排毒模式。"
      );
    }
    if (flags.resource_stuck_alert) {
      parts.push(
        "<strong>⚠️ 資源卡關 " +
          esc(String(flags.resource_stuck_rate)) +
          "%</strong>：媒合／招募請優先精簡，勿再堆疊高耗損事工。"
      );
    }
    if (flags.prune_ministries && flags.prune_ministries.length) {
      parts.push(
        "<strong>✂️ 剪枝候選</strong>：" +
          esc(flags.prune_ministries.slice(0, 4).join("、")) +
          (flags.prune_ministries.length > 4 ? "…" : "") +
          " — 招募桌應暫緩相關空缺。"
      );
    }
    if (!parts.length) return "";
    return (
      '<p class="crm-governance-banner__lead">' +
      parts.join("</p><p class=\"crm-governance-banner__lead\">") +
      '</p><p class="crm-governance-banner__note">僅讀取本機診斷 Store · 不自動派工 · 牧者 HITL 決裁。</p>'
    );
  }

  function mountEntryBanner() {
    var el = global.document && global.document.getElementById("crmEntryBanner");
    if (!el) return null;
    var flags = scanGovernanceFlags();
    var html = renderEntryBannerHtml(flags);
    if (!html) return flags;
    el.hidden = false;
    el.className = "crm-entry-banner crm-governance-banner crm-governance-banner--" + flags.governance_mode;
    el.innerHTML = html;
    return flags;
  }

  global.GovernanceCrmBridge = {
    scanGovernanceFlags: scanGovernanceFlags,
    renderEntryBannerHtml: renderEntryBannerHtml,
    mountEntryBanner: mountEntryBanner
  };
})(typeof window !== "undefined" ? window : global);
