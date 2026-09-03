/**
 * Phase 3 · PDCA ↔ Hub Base 閉環橋接
 * 讀人材池／工庫／配對 → Plan/Check 摘要 → Act 回寫工庫 + 審計
 */
(function (global) {
  "use strict";

  var ZONE_LABELS = {
    a: "A 敬拜音樂",
    b: "B 牧養小組",
    c: "C 聖經門訓",
    d: "D 外展差傳",
    e: "E 社會服務",
    f: "F 詩歌應用",
    g: "G 規劃行政",
  };

  var ACT_STORAGE = "bible100_pdca_last_act_v1";

  function hub() {
    return global.HubBase || null;
  }

  function canonical() {
    return global.SmartMinistryCanonical || null;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function ministryKey(m) {
    return String((m && (m.ministry_id || m.id)) || "");
  }

  function splitGifts(raw) {
    if (!raw) return [];
    return String(raw)
      .split(/[,，、;；\s]+/)
      .map(function (x) {
        return x.trim();
      })
      .filter(Boolean);
  }

  function readStore() {
    var H = hub();
    if (H && H.readSmartMinistryStore) return H.readSmartMinistryStore() || {};
    var C = canonical();
    if (C && C.getStore) return C.getStore() || {};
    return {};
  }

  function computeManpowerSnapshot() {
    var H = hub();
    var talents =
      H && H.readTalentPool
        ? H.readTalentPool()
        : canonical() && canonical().listTalents
          ? canonical().listTalents()
          : [];
    var ministries =
      H && H.readMinistryCatalog
        ? H.readMinistryCatalog()
        : canonical() && canonical().listMinistriesCatalog
          ? canonical().listMinistriesCatalog()
          : [];
    var store = readStore();
    var assignments = Array.isArray(store.ministry_assignment) ? store.ministry_assignment : [];

    var giftCounts = {};
    talents.forEach(function (t) {
      splitGifts(t.gift).forEach(function (g) {
        var k = g.toLowerCase();
        giftCounts[k] = (giftCounts[k] || 0) + 1;
      });
    });
    var giftDistribution = Object.keys(giftCounts)
      .map(function (k) {
        return { gift: k, count: giftCounts[k] };
      })
      .sort(function (a, b) {
        return b.count - a.count;
      })
      .slice(0, 12);

    var assignedByMinistry = {};
    assignments.forEach(function (a) {
      var mk = String(a.ministry_id || "");
      if (!mk) return;
      assignedByMinistry[mk] = (assignedByMinistry[mk] || 0) + 1;
    });

    var zoneStats = {};
    var totalGap = 0;
    var totalFilled = 0;
    var totalSlots = 0;

    ministries.forEach(function (m) {
      var mk = ministryKey(m);
      var gap = parseInt(m.headcount_gap, 10);
      if (!isFinite(gap) || gap < 0) gap = 1;
      var filled = assignedByMinistry[mk] || 0;
      var zone = String(m.zone || m.cm_zone || "g").toLowerCase().charAt(0);
      if (!zoneStats[zone]) {
        zoneStats[zone] = { zone: zone, label: ZONE_LABELS[zone] || zone.toUpperCase(), gap: 0, filled: 0, roles: 0 };
      }
      zoneStats[zone].gap += gap;
      zoneStats[zone].filled += filled;
      zoneStats[zone].roles += 1;
      totalGap += gap;
      totalFilled += Math.min(filled, gap);
      totalSlots += gap;
    });

    var zoneShortage = Object.keys(zoneStats)
      .map(function (z) {
        var s = zoneStats[z];
        var vacant = Math.max(0, s.gap - s.filled);
        var rate = s.gap > 0 ? Math.round((100 * s.filled) / s.gap) : 0;
        return {
          zone: z,
          label: s.label,
          roles: s.roles,
          headcount_gap: s.gap,
          assigned: s.filled,
          vacant: vacant,
          utilization_pct: rate,
        };
      })
      .sort(function (a, b) {
        return b.vacant - a.vacant;
      });

    var stableStatuses = { invited: 1, confirmed: 1, active: 1, serving: 1 };
    var stable = 0;
    assignments.forEach(function (a) {
      var st = String(a.status || "").toLowerCase();
      if (stableStatuses[st]) stable += 1;
    });
    var stabilityPct = assignments.length ? Math.round((100 * stable) / assignments.length) : 0;
    var vacancyRate = totalSlots ? Math.round((100 * Math.max(0, totalSlots - totalFilled)) / totalSlots) : 0;
    var utilizationPct = totalSlots ? Math.round((100 * totalFilled) / totalSlots) : 0;

    var doSnap = null;
    if (global.DoPlanFeedback && DoPlanFeedback.loadDoPlanFeedback) {
      doSnap = DoPlanFeedback.loadDoPlanFeedback();
    }

    return {
      ok: true,
      generated_at: new Date().toISOString(),
      totals: {
        talents: talents.length,
        ministries: ministries.length,
        assignments: assignments.length,
        headcount_gap: totalGap,
        filled: totalFilled,
        vacancy_rate_pct: vacancyRate,
        utilization_pct: utilizationPct,
        stability_pct: stabilityPct,
      },
      gift_distribution: giftDistribution,
      zone_shortage: zoneShortage,
      do_feedback: doSnap,
    };
  }

  function formatCheckText(snap) {
    snap = snap || computeManpowerSnapshot();
    if (!snap.ok) return "";
    var t = snap.totals;
    var lines = [
      "【Hub 人力快照 · Check 自動摘要】",
      "人才 " + t.talents + " · 崗位 " + t.ministries + " · 配對紀錄 " + t.assignments,
      "空缺率 " + t.vacancy_rate_pct + "% · 使用率 " + t.utilization_pct + "% · 穩定邀請 " + t.stability_pct + "%",
    ];
    if (snap.zone_shortage && snap.zone_shortage.length) {
      lines.push("缺額優先區：");
      snap.zone_shortage.slice(0, 4).forEach(function (z) {
        if (z.vacant > 0) {
          lines.push("  · " + z.label + " 缺 " + z.vacant + "（已配 " + z.assigned + "/" + z.headcount_gap + "）");
        }
      });
    }
    if (snap.gift_distribution && snap.gift_distribution.length) {
      lines.push(
        "恩賜分佈（前 5）：" +
          snap.gift_distribution
            .slice(0, 5)
            .map(function (g) {
              return g.gift + "×" + g.count;
            })
            .join(" · ")
      );
    }
    if (snap.do_feedback && snap.do_feedback.pdca_check_text) {
      lines.push("");
      lines.push(snap.do_feedback.pdca_check_text);
    }
    return lines.join("\n");
  }

  function formatPlanText(snap) {
    snap = snap || computeManpowerSnapshot();
    var lines = [
      "【Plan · 人力盤點（Hub Base 自動讀取）】",
      "本季事奉規劃請對照：人才 " + snap.totals.talents + " 位、開放崗位 " + snap.totals.ministries + " 個。",
    ];
    var top = (snap.zone_shortage || []).filter(function (z) {
      return z.vacant > 0;
    });
    if (top.length) {
      lines.push("優先補缺：" + top.slice(0, 3).map(function (z) { return z.label; }).join("、"));
    } else {
      lines.push("目前各區缺額不明顯；仍建議季末檢核服事負荷。");
    }
    return lines.join("\n");
  }

  function applyActAndPrepareMatching(options) {
    options = options || {};
    var H = hub();
    var C = canonical();
    if (!C || typeof C.getStore !== "function" || typeof C.saveStore !== "function") {
      return { ok: false, error: "SmartMinistryCanonical unavailable" };
    }
    if (H && !H.canPerform("write_talent")) {
      return { ok: false, error: "forbidden", need: "write_talent" };
    }

    var snap = computeManpowerSnapshot();
    var store = C.getStore();
    var updated = 0;
    var priorityZones = options.priorityZones || snap.zone_shortage.slice(0, 3).map(function (z) {
      return z.zone;
    });

    (store.ministries || []).forEach(function (m) {
      var z = String(m.zone || m.cm_zone || "").toLowerCase().charAt(0);
      if (priorityZones.indexOf(z) >= 0) {
        var gap = parseInt(m.headcount_gap, 10);
        if (!isFinite(gap) || gap < 1) gap = 1;
        m.headcount_gap = gap;
        if (m.urgency !== "高") {
          m.urgency = "高";
          m.pdca_act_at = new Date().toISOString();
          updated += 1;
        }
      }
    });

    var saveOk = false;
    if (H && H.writeSmartMinistryStore) {
      var wr = H.writeSmartMinistryStore(store, {
        note: options.note || "PDCA Act 套用調整",
        source: "PdcaHubBridge.applyAct",
      });
      saveOk = wr && wr.ok;
    } else {
      saveOk = !!C.saveStore(store);
    }

    if (H && H.logAudit) {
      H.logAudit({
        domain: "pdca_run",
        action: "pdca_act_apply",
        after: {
          updated_ministries: updated,
          priority_zones: priorityZones,
          vacancy_rate_pct: snap.totals.vacancy_rate_pct,
        },
        note: options.note || "Act 一鍵更新工庫優先度",
        source: "PdcaHubBridge.applyAct",
      });
    }

    try {
      global.localStorage.setItem(
        ACT_STORAGE,
        JSON.stringify({
          applied_at: new Date().toISOString(),
          updated_ministries: updated,
          priority_zones: priorityZones,
          snapshot: snap.totals,
        })
      );
    } catch (eStore) {}

    if (global.AssessmentRunStore && typeof AssessmentRunStore.saveRun === "function") {
      AssessmentRunStore.saveRun({
        tool_id: "pdca",
        timestamp: new Date().toISOString(),
        derived: {
          hub_act: true,
          manpower: snap.totals,
          zone_shortage: snap.zone_shortage.slice(0, 5),
        },
        pdca_contract: { act_applied: true, priority_zones: priorityZones },
        is_demo: false,
      });
    }

    return {
      ok: saveOk,
      updated_ministries: updated,
      matchingUrl: "../smart_ministry/talent_ministry_matching.html?from=pdca",
      snapshot: snap,
    };
  }

  function loadLastAct() {
    try {
      var raw = global.localStorage.getItem(ACT_STORAGE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  global.PdcaHubBridge = {
    ZONE_LABELS: ZONE_LABELS,
    computeManpowerSnapshot: computeManpowerSnapshot,
    formatCheckText: formatCheckText,
    formatPlanText: formatPlanText,
    applyActAndPrepareMatching: applyActAndPrepareMatching,
    loadLastAct: loadLastAct,
    esc: esc,
  };
})(typeof window !== "undefined" ? window : global);
