/**
 * Do → Plan 回饋（波 4）
 * 聚合 dashboard / Bridge KPI → cross-risk 信號 → PDCA Check 可貼文字
 * 快照鍵：bible100_do_plan_feedback_v1
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "bible100_do_plan_feedback_v1";

  var PLAN_LINKS = {
    urgent: {
      path: "church_planning/Church_Governance_urgent_matrix.html",
      label: "輕重緩急"
    },
    raci: {
      path: "church_planning/planning/raci-reflection.html",
      label: "RACI 權責"
    },
    kpi: {
      path: "church_planning/Church_Governance_KPI_alignment.html",
      label: "KPI 對齊"
    },
    pdca: {
      path: "church_planning/Church_Governance_PDCA_cycle.html",
      label: "PDCA Check"
    },
    war: {
      path: "church_planning/cta-os-war-room.html",
      label: "健康雷達"
    }
  };

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function esc(s) {
    var d = global.document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function planLink(toolId) {
    return PLAN_LINKS[toolId] || PLAN_LINKS.pdca;
  }

  function buildCrossRiskSignals(kpi, wb, followSum, shiftSum) {
    var signals = [];
    var totals = (wb && wb.totals) || {};
    kpi = kpi || {};
    followSum = followSum || {};
    shiftSum = shiftSum || {};

    if ((totals.newcomer || 0) > 0) {
      signals.push({
        id: "do_newcomer_sla",
        severity: "medium",
        title: "新人跟進待辦 " + totals.newcomer + " 筆",
        plan_tool: "urgent",
        plan_href: planLink("urgent").path,
        plan_label: planLink("urgent").label
      });
    }
    if ((totals.care_risk || 0) > 0) {
      signals.push({
        id: "do_care_risk",
        severity: "high",
        title: "關懷風險 Smart Alert " + totals.care_risk + " 筆",
        plan_tool: "urgent",
        plan_href: planLink("urgent").path,
        plan_label: planLink("urgent").label
      });
    }
    if ((followSum.pending || 0) > 2) {
      signals.push({
        id: "do_visitation_pending",
        severity: "medium",
        title: "探訪跟進待辦 " + followSum.pending + " 筆（7 日窗）",
        plan_tool: "raci",
        plan_href: planLink("raci").path,
        plan_label: planLink("raci").label
      });
    }
    if ((shiftSum.pending_confirm || 0) > 0) {
      signals.push({
        id: "do_shift_unconfirmed",
        severity: "medium",
        title: "排班待確認 " + shiftSum.pending_confirm + " 筆",
        plan_tool: "raci",
        plan_href: planLink("raci").path,
        plan_label: planLink("raci").label
      });
    }
    if (kpi.volunteer_rsvp_3d_pct != null && Number(kpi.volunteer_rsvp_3d_pct) < 60) {
      signals.push({
        id: "do_rsvp_low",
        severity: "medium",
        title: "志工 3 日 RSVP " + kpi.volunteer_rsvp_3d_pct + "%（偏低）",
        plan_tool: "raci",
        plan_href: planLink("raci").path,
        plan_label: planLink("raci").label
      });
    }
    if (kpi.finance_health_pct != null && Number(kpi.finance_health_pct) < 85) {
      signals.push({
        id: "do_finance_health",
        severity: "low",
        title: "財務資料健康 " + kpi.finance_health_pct + "%",
        plan_tool: "kpi",
        plan_href: planLink("kpi").path,
        plan_label: planLink("kpi").label
      });
    }
    if (kpi.retention_4w_pct != null && Number(kpi.retention_4w_pct) < 55) {
      signals.push({
        id: "do_retention_low",
        severity: "high",
        title: "4 週留存率 " + kpi.retention_4w_pct + "%",
        plan_tool: "pdca",
        plan_href: planLink("pdca").path,
        plan_label: planLink("pdca").label
      });
    }
    if (!signals.length && (totals.newcomer || totals.care_risk || totals.stage_promotion)) {
      signals.push({
        id: "do_workbench_active",
        severity: "low",
        title: "工作桌有待辦，建議季末對照 PDCA",
        plan_tool: "pdca",
        plan_href: planLink("pdca").path,
        plan_label: planLink("pdca").label
      });
    }
    return signals;
  }

  function formatPdcaCheckText(kpi, wb, signals) {
    kpi = kpi || {};
    wb = wb || { totals: {} };
    signals = signals || [];
    var lines = [
      "【Do→Plan 週回饋 · " + new Date().toISOString().slice(0, 10) + "】",
      "SPAC：S 本月奉獻 " +
        (kpi.offerings_month_total != null ? kpi.offerings_month_total : "—") +
        " · P 4週留存 " +
        (kpi.retention_4w_pct != null ? kpi.retention_4w_pct + "%" : "—") +
        " · A RSVP " +
        (kpi.volunteer_rsvp_3d_pct != null ? kpi.volunteer_rsvp_3d_pct + "%" : "—") +
        " · C 財務健康 " +
        (kpi.finance_health_pct != null ? kpi.finance_health_pct + "%" : "—"),
      "工作桌：新人 " +
        (wb.totals.newcomer || 0) +
        " · 關懷 " +
        (wb.totals.care_risk || 0) +
        " · 晉升 " +
        (wb.totals.stage_promotion || 0)
    ];
    if (!signals.length) {
      lines.push("Cross-risk：本週無紅燈信號（仍建議季末 PDCA Check 對照 SMART）。");
    } else {
      lines.push("Cross-risk（Do 異常 → 建議回 Plan 工具）：");
      signals.forEach(function (s) {
        lines.push("- " + s.title + " → " + s.plan_label);
      });
    }
    lines.push("— 以上摘自教會事工 dashboard · Bridge KPI · 人工定案前請牧者分辨。");
    return lines.join("\n");
  }

  function getDoPlanFeedbackSummary() {
    var B = bridge();
    var kpi = {};
    try {
      if (B && B.getDashboardKpiSummary) kpi = B.getDashboardKpiSummary() || {};
    } catch (eK) {}
    var wb = B && B.getCrmWorkbenchTodos ? B.getCrmWorkbenchTodos() : { totals: {} };
    var followSum = {};
    var shiftSum = {};
    try {
      if (B && B.getPastoralFollowupSummary) followSum = B.getPastoralFollowupSummary(7) || {};
    } catch (eF) {}
    try {
      if (B && B.getVolunteerShiftSummary) shiftSum = B.getVolunteerShiftSummary(14) || {};
    } catch (eS) {}
    var signals = buildCrossRiskSignals(kpi, wb, followSum, shiftSum);
    return {
      schema_version: 1,
      generated_at: new Date().toISOString(),
      kpi: {
        retention_4w_pct: kpi.retention_4w_pct,
        volunteer_rsvp_3d_pct: kpi.volunteer_rsvp_3d_pct,
        offerings_month_total: kpi.offerings_month_total,
        finance_health_pct: kpi.finance_health_pct
      },
      workbench_totals: wb.totals || {},
      cross_risks: signals,
      pdca_check_text: formatPdcaCheckText(kpi, wb, signals)
    };
  }

  function persistDoPlanFeedback() {
    var snap = getDoPlanFeedbackSummary();
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch (e) {}
    return snap;
  }

  function loadDoPlanFeedback() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e2) {
      return null;
    }
  }

  function shellNavPlan(ev, contentUrl) {
    if (typeof global.bible100ShellNav === "function") {
      global.bible100ShellNav(ev, {
        sidebarUrl: "church_planning/sidebar_plan_v5_preview.html",
        contentUrl: contentUrl
      });
      return false;
    }
    try {
      global.parent.postMessage(
        {
          type: "bible100-shell",
          sidebarUrl: "church_planning/sidebar_plan_v5_preview.html",
          contentUrl: contentUrl
        },
        "*"
      );
    } catch (e) {}
    return false;
  }

  function copyPdcaCheckText(text) {
    var t = text || "";
    if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
      return global.navigator.clipboard.writeText(t);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = global.document.createElement("textarea");
        ta.value = t;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        global.document.body.appendChild(ta);
        ta.select();
        global.document.execCommand("copy");
        global.document.body.removeChild(ta);
        resolve();
      } catch (eC) {
        reject(eC);
      }
    });
  }

  function renderDoPlanFeedbackPanel(mountId) {
    var el =
      typeof mountId === "string"
        ? global.document.getElementById(mountId)
        : mountId;
    if (!el) return null;
    var snap = persistDoPlanFeedback();
    var risks = snap.cross_risks || [];
    var riskHtml = risks.length
      ? risks
          .slice(0, 5)
          .map(function (s) {
            return (
              '<li class="do-plan-feedback__risk do-plan-feedback__risk--' +
              esc(s.severity || "low") +
              '"><span>' +
              esc(s.title) +
              '</span> <a href="#" class="do-plan-feedback__plan-link" data-plan-href="' +
              esc(s.plan_href) +
              '">→ ' +
              esc(s.plan_label) +
              "</a></li>"
            );
          })
          .join("")
      : '<li class="do-plan-feedback__ok">本週 cross-risk 無紅燈 · 季末仍建議 PDCA Check 對照 SMART</li>';

    el.className = "do-plan-feedback";
    el.innerHTML =
      '<div class="do-plan-feedback__head"><strong>↩ Do → Plan</strong> · 週回饋（cross-risk → 規劃工具）</div>' +
      '<div class="do-plan-feedback__kpi">' +
      "SPAC：P " +
      esc(snap.kpi.retention_4w_pct != null ? snap.kpi.retention_4w_pct + "%" : "—") +
      " · A " +
      esc(snap.kpi.volunteer_rsvp_3d_pct != null ? snap.kpi.volunteer_rsvp_3d_pct + "%" : "—") +
      " · S ¥" +
      esc(snap.kpi.offerings_month_total != null ? Number(snap.kpi.offerings_month_total).toLocaleString() : "—") +
      "</div>" +
      '<ul class="do-plan-feedback__list">' +
      riskHtml +
      "</ul>" +
      '<div class="do-plan-feedback__actions">' +
      '<button type="button" class="do-plan-feedback__btn" data-do-plan-action="copy-pdca">📋 複製 PDCA Check 草稿</button>' +
      '<a href="#" class="do-plan-feedback__btn" data-plan-href="' +
      esc(planLink("pdca").path) +
      '">PDCA 季度檢核</a>' +
      '<a href="#" class="do-plan-feedback__btn" data-plan-href="' +
      esc(planLink("war").path) +
      '">健康雷達</a>' +
      "</div>";

    el.querySelectorAll("[data-plan-href]").forEach(function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        shellNavPlan(ev, a.getAttribute("data-plan-href"));
      });
    });
    var copyBtn = el.querySelector('[data-do-plan-action="copy-pdca"]');
    if (copyBtn && !copyBtn.__bound) {
      copyBtn.__bound = true;
      copyBtn.addEventListener("click", function () {
        copyPdcaCheckText(snap.pdca_check_text)
          .then(function () {
            copyBtn.textContent = "✅ 已複製 Check 草稿";
            setTimeout(function () {
              copyBtn.textContent = "📋 複製 PDCA Check 草稿";
            }, 2400);
          })
          .catch(function () {
            global.alert(snap.pdca_check_text);
          });
      });
    }
    return snap;
  }

  function renderPdcaDoFeedbackBanner() {
    var el = global.document.getElementById("pdca-do-feedback-banner");
    if (!el) return;
    var snap = loadDoPlanFeedback();
    if (!snap || !snap.pdca_check_text) {
      el.innerHTML =
        '<p class="text-sm text-slate-600 m-0"><strong>Do→Plan：</strong>尚無戰情快照。請先開啟 ' +
        '<a href="../church_ministry/dashboard.html" class="underline font-bold text-indigo-700">教會事工儀表板</a> ' +
        "更新 KPI，再回此頁一鍵引用 Check 草稿。</p>";
      el.classList.remove("hidden");
      return;
    }
    var age = snap.generated_at ? snap.generated_at.slice(0, 16).replace("T", " ") : "—";
    el.innerHTML =
      '<div class="flex flex-wrap items-start justify-between gap-2">' +
      '<div><p class="text-sm text-indigo-900 m-0 mb-1"><strong>Do→Plan 已接通</strong> · 快照 ' +
      esc(age) +
      " · cross-risk " +
      esc((snap.cross_risks || []).length) +
      " 項</p>" +
      '<pre class="text-xs bg-white border border-indigo-100 rounded p-2 whitespace-pre-wrap max-h-32 overflow-auto m-0">' +
      esc(snap.pdca_check_text) +
      "</pre></div>" +
      '<button type="button" class="acs-btn acs-btn--primary shrink-0" id="pdca-copy-do-feedback">複製到 Check／Act</button>' +
      "</div>";
    el.classList.remove("hidden");
    var btn = global.document.getElementById("pdca-copy-do-feedback");
    if (btn && !btn.__bound) {
      btn.__bound = true;
      btn.addEventListener("click", function () {
        copyPdcaCheckText(snap.pdca_check_text).then(function () {
          if (global.PdcaAcsShell && PdcaAcsShell.showToast) {
            PdcaAcsShell.showToast("已複製 Do 戰情摘要 · 可貼入 PDCA Check");
          }
        });
      });
    }
  }

  global.DoPlanFeedback = {
    STORAGE_KEY: STORAGE_KEY,
    PLAN_LINKS: PLAN_LINKS,
    getDoPlanFeedbackSummary: getDoPlanFeedbackSummary,
    persistDoPlanFeedback: persistDoPlanFeedback,
    loadDoPlanFeedback: loadDoPlanFeedback,
    buildCrossRiskSignals: buildCrossRiskSignals,
    formatPdcaCheckText: formatPdcaCheckText,
    renderDoPlanFeedbackPanel: renderDoPlanFeedbackPanel,
    renderPdcaDoFeedbackBanner: renderPdcaDoFeedbackBanner,
    copyPdcaCheckText: copyPdcaCheckText
  };
})(typeof window !== "undefined" ? window : this);
