/**
 * Bible100 CRM Intent Router — HITL prefill hub (no auto-write by default).
 * Spec: docs/CHURCH_ERP_OPERATION_SUBSYSTEM_SPEC.md · docs/TOOL_KIT_STANDARD.md
 */
(function (global) {
  "use strict";

  var SCHEMA = "bible100_crm_intent_v2";

  /** target_tool → form URL (relative to site root) */
  var TOOL_FORM_PATHS = {
    "volunteer_shift.create": "church_ministry/tools/volunteer_shift/form.html",
    "ministry_matching.suggest": "church_ministry/tools/volunteer_shift/form.html",
    "pastoral_alert.create": "church_ministry/modules/support/visitation_index.html",
    "visitation_followup.create": "church_ministry/tools/visitation_followup/form.html",
    "finance_reconciliation.create": "church_ministry/tools/finance_reconciliation/form.html"
  };

  var TOOL_LABELS = {
    "volunteer_shift.create": "義工排班",
    "ministry_matching.suggest": "事奉配對／CTV 候選",
    "pastoral_alert.create": "探訪／牧養關懷",
    "visitation_followup.create": "探訪跟進任務",
    "finance_reconciliation.create": "財務對帳（可選）"
  };

  var TOOL_INDEX_PATHS = {
    "volunteer_shift": "church_ministry/tools/volunteer_shift/index.html",
    "visitation_followup": "church_ministry/tools/visitation_followup/index.html",
    "finance_reconciliation": "church_ministry/tools/finance_reconciliation/index.html"
  };

  function uid(prefix) {
    return (prefix || "intent") + "_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
  }

  function normalizeIntent(raw) {
    if (!raw || typeof raw !== "object") return null;
    var target = raw.target_tool || raw.tool_id || "";
    if (target && target.indexOf(".") < 0 && raw.action) {
      target = target + "." + raw.action;
    }
    return {
      intent_id: raw.intent_id || uid("intent"),
      actor_role: raw.actor_role || "staff",
      confidence: raw.confidence != null ? Number(raw.confidence) : 0.5,
      target_tool: target,
      action: raw.action || (target.split(".")[1] || "create"),
      person_id: raw.person_id != null ? String(raw.person_id) : null,
      member_id: raw.member_id != null ? String(raw.member_id) : (raw.person_id != null ? String(raw.person_id) : null),
      payload: raw.payload && typeof raw.payload === "object" ? raw.payload : {},
      risk_flags: Array.isArray(raw.risk_flags) ? raw.risk_flags : [],
      required_human_confirmation: raw.required_human_confirmation !== false,
      suggested_next_actions: Array.isArray(raw.suggested_next_actions) ? raw.suggested_next_actions : []
    };
  }

  function buildEnvelope(source, intents) {
    return {
      schema_version: SCHEMA,
      request_id: uid("req"),
      source: source || { channel: "text", raw_text: "", locale: "zh-Hant" },
      intents: (intents || []).map(normalizeIntent).filter(Boolean),
      human_review: { required: true, confirmed_at: null, confirmed_by: null },
      routing_mode: "prefill_only"
    };
  }

  function detectIntentsFromText(text) {
    var t = String(text || "").trim();
    var intents = [];
    if (!t) return intents;

    if (/排班|代班|守門|服事|崗位|志工/.test(t)) {
      intents.push(normalizeIntent({
        target_tool: "volunteer_shift.create",
        action: "create",
        confidence: 0.72,
        payload: { summary: t, shift: /主日/.test(t) ? "主日崇拜" : "服事" },
        suggested_next_actions: ["打開排班表單", "核對 member_id", "複製邀請稿"]
      }));
    }
    if (/配對|CTV|恩賜|事奉|適合/.test(t)) {
      intents.push(normalizeIntent({
        target_tool: "ministry_matching.suggest",
        action: "suggest",
        confidence: 0.68,
        payload: { summary: t },
        suggested_next_actions: ["查看 CTV 候選", "確認後排班"]
      }));
    }
    if (/跟進任務|安排跟進|探訪跟進|follow.?up/i.test(t)) {
      intents.push(normalizeIntent({
        target_tool: "visitation_followup.create",
        action: "create",
        confidence: 0.78,
        payload: { summary: t, reason: t, priority: /急|urgent/.test(t) ? "urgent" : "normal" },
        suggested_next_actions: ["開啟跟進表單", "核對 member_id", "複製關懷稿"]
      }));
    }
    if (/財務對帳|銀行對帳|對帳|奉獻金|收款|入帳|收據|奉獻紀錄/.test(t) && !/探訪跟進|牧養關懷/.test(t)) {
      var amtM = t.match(/(\d{2,})(?:\s*元|NT\$?)?/);
      intents.push(normalizeIntent({
        target_tool: "finance_reconciliation.create",
        action: "create",
        confidence: 0.74,
        payload: {
          summary: t,
          amount: amtM ? amtM[1] : null,
          fund: /建堂/.test(t) ? "建堂奉獻" : "一般奉獻",
          method: /轉帳|匯款|bank/i.test(t) ? "bank_transfer" : "cash",
          date: null
        },
        suggested_next_actions: ["開啟財務對帳表單（可選）", "核對金額與 member_id", "複製收據稿"]
      }));
    }
    if (/壓力|關懷|探訪|危|風險|不適|生病|憂慮/.test(t)) {
      intents.push(normalizeIntent({
        target_tool: "pastoral_alert.create",
        action: "create",
        confidence: 0.75,
        risk_flags: [/壓力/.test(t) ? "stress" : null, /病|不適/.test(t) ? "health" : null].filter(Boolean),
        payload: { summary: t, event_type: "risk_note" },
        suggested_next_actions: ["開啟探訪工作桌", "48 小時內關懷"]
      }));
    }
    if (!intents.length) {
      intents.push(normalizeIntent({
        target_tool: "volunteer_shift.create",
        action: "create",
        confidence: 0.35,
        payload: { summary: t, note: t, unresolved: true },
        suggested_next_actions: ["無法辨識，請下方捷徑手動選 A1／A2／A3（財務可選）"]
      }));
    }
    return intents;
  }

  function parseTextOffline(rawText, opts) {
    opts = opts || {};
    var intents = detectIntentsFromText(rawText);
    return buildEnvelope({
      channel: opts.channel || "text",
      raw_text: rawText,
      locale: opts.locale || "zh-Hant",
      operator_member_id: opts.operator_member_id || null,
      church_id: opts.church_id || "default"
    }, intents);
  }

  function resolveFormUrl(targetTool) {
    return TOOL_FORM_PATHS[targetTool] || TOOL_FORM_PATHS["volunteer_shift.create"];
  }

  function intentToPrefillPayload(intent) {
    var p = intent.payload || {};
    var mid = intent.member_id || intent.person_id || p.member_id || null;
    var out = {
      member_id: mid,
      summary: p.summary || p.note || "",
      note: p.note || p.summary || "",
      date: p.date || p.shift_date || null,
      shift: p.shift || null,
      ministry_id: p.ministry_id || null,
      assignment_id: p.assignment_id || null,
      event_type: p.event_type || null,
      risk_flags: intent.risk_flags || []
    };
    if (intent.target_tool === "pastoral_alert.create") {
      out.visitation_note = out.summary;
    }
    if (intent.target_tool === "visitation_followup.create") {
      out.reason = p.reason || p.summary || out.summary;
      out.priority = p.priority || "normal";
      out.due_date = p.due_date || p.date || null;
    }
    if (intent.target_tool === "finance_reconciliation.create") {
      out.amount = p.amount != null ? p.amount : null;
      out.fund = p.fund || "一般奉獻";
      out.currency = p.currency || "TWD";
      out.method = p.method || "cash";
      out.date = p.date || null;
    }
    return out;
  }

  /**
   * HITL：只回傳導向與 prefill，不寫 Bridge。
   */
  function routeForPrefill(envelope, intentIndex) {
    var doc = envelope && typeof envelope === "object" ? envelope : {};
    var idx = intentIndex != null ? Number(intentIndex) : 0;
    var intent = (doc.intents || [])[idx];
    if (!intent) return { ok: false, error: "intent_not_found" };
    var formPath = resolveFormUrl(intent.target_tool);
    return {
      ok: true,
      mode: "prefill_only",
      target_tool: intent.target_tool,
      tool_label: TOOL_LABELS[intent.target_tool] || intent.target_tool,
      form_url: formPath,
      prefill: intentToPrefillPayload(intent),
      intent: intent,
      message: "請在表單核對後再儲存；系統不會自動寫入或通知。"
    };
  }

  function postPrefillToFrame(targetWindow, prefill, formUrl) {
    var win = targetWindow || global;
    try {
      if (formUrl && win !== global && win.location) {
        var sep = formUrl.indexOf("?") >= 0 ? "&" : "?";
        var q = prefill && prefill.member_id ? sep + "member_id=" + encodeURIComponent(prefill.member_id) : "";
        win.location.href = formUrl + q;
      }
    } catch (e) {}
    try {
      (win.postMessage || global.postMessage).call(win, {
        type: "CRM_INTENT_PREFILL",
        payload: prefill || {},
        form_url: formUrl || null
      }, "*");
    } catch (e2) {}
  }

  /** @deprecated 僅在明確 human_review.confirmed_at 後才允許 executeRouting 寫入 */
  function executeRouting(doc) {
    if (!doc || doc.routing_mode === "prefill_only") {
      return { ok: false, error: "prefill_only_mode", hint: "使用 routeForPrefill + postPrefillToFrame" };
    }
    if (doc.human_review && doc.human_review.required && !doc.human_review.confirmed_at) {
      return { ok: false, error: "human_review_required" };
    }
    return { ok: false, error: "write_routing_disabled", hint: "HITL：請在工具 form 手動儲存" };
  }

  function listAvailableTools() {
    return [
      { tool_id: "volunteer_shift", target_tool: "volunteer_shift.create", label: TOOL_LABELS["volunteer_shift.create"], optional: false, index_url: TOOL_INDEX_PATHS.volunteer_shift, form_url: TOOL_FORM_PATHS["volunteer_shift.create"] },
      { tool_id: "visitation_followup", target_tool: "visitation_followup.create", label: TOOL_LABELS["visitation_followup.create"], optional: false, index_url: TOOL_INDEX_PATHS.visitation_followup, form_url: TOOL_FORM_PATHS["visitation_followup.create"] },
      { tool_id: "finance_reconciliation", target_tool: "finance_reconciliation.create", label: TOOL_LABELS["finance_reconciliation.create"], optional: true, index_url: TOOL_INDEX_PATHS.finance_reconciliation, form_url: TOOL_FORM_PATHS["finance_reconciliation.create"] }
    ];
  }

  global.Bible100CrmIntent = {
    SCHEMA: SCHEMA,
    TOOL_FORM_PATHS: TOOL_FORM_PATHS,
    TOOL_INDEX_PATHS: TOOL_INDEX_PATHS,
    listAvailableTools: listAvailableTools,
    normalizeIntent: normalizeIntent,
    buildEnvelope: buildEnvelope,
    parseTextOffline: parseTextOffline,
    routeForPrefill: routeForPrefill,
    postPrefillToFrame: postPrefillToFrame,
    intentToPrefillPayload: intentToPrefillPayload,
    executeRouting: executeRouting
  };
})(typeof window !== "undefined" ? window : this);
