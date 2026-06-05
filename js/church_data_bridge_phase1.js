/**
 * Phase 1 ChurchDataBridge singleton
 * - Unified member profile update
 * - Workflow trigger entrypoint
 * - Offline queue with replay on reconnect
 */
(function (global) {
  "use strict";

  var DEFAULT_OPTIONS = {
    supabaseUrl: "",
    supabaseAnonKey: "",
    queueStorageKey: "church_data_bridge_phase1_queue",
    queueMaxItems: 800,
    leaderPipelinePolicy: {
      mode: "hybrid", // "threshold" | "credits" | "hybrid"
      thresholdCourseIds: ["LEADER_STAGE3", "DISCIPLE_MASTER"],
      stage3Credits: 12
    },
    observerStorageKey: "church_data_bridge_phase1_observer_log"
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function normalizeScore(raw, maxScale) {
    var score = Number(raw);
    var max = Number(maxScale || 100);
    if (!isFinite(score) || !isFinite(max) || max <= 0) return 0;
    var n = Math.round((score / max) * 100);
    if (n < 0) return 0;
    if (n > 100) return 100;
    return n;
  }

  function safeJsonParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  var _storageWarned = {};
  function warnStorageBypass(reason) {
    var key = String(reason || "unknown");
    if (_storageWarned[key]) return;
    _storageWarned[key] = true;
    try {
      console.warn("[DataPolicy] fallback localStorage path:", key);
    } catch (e) {}
  }

  function storageGet(key, reason) {
    try {
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        return global.PersistenceProvider.getInstance().getItem(key);
      }
    } catch (e) {}
    warnStorageBypass(reason || ("get:" + key));
    return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
  }

  function storageSet(key, value, reason) {
    try {
      if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === "function") {
        global.PersistenceProvider.getInstance().setItem(key, value);
        return;
      }
    } catch (e) {}
    warnStorageBypass(reason || ("set:" + key));
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  }

  function getChurchId() {
    try {
      if (typeof window !== "undefined") {
        var params = new URLSearchParams(window.location && window.location.search ? window.location.search : "");
        return params.get("church_id") || window.CURRENT_CHURCH_ID || "default";
      }
    } catch (e) {}
    return "default";
  }

  function ChurchDataBridgePhase1(config) {
    this.config = Object.assign({}, DEFAULT_OPTIONS, config || {});
    this.supabase = null;
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine !== false : true;
    this._flushInProgress = false;
    this._wireConnectivity();
    this._tryInitSupabase();
  }

  ChurchDataBridgePhase1.prototype._wireConnectivity = function () {
    var self = this;
    if (typeof window === "undefined") return;
    window.addEventListener("online", function () {
      self.isOnline = true;
      self.flushQueue();
    });
    window.addEventListener("offline", function () {
      self.isOnline = false;
    });
  };

  ChurchDataBridgePhase1.prototype._tryInitSupabase = function () {
    try {
      if (
        global.supabase &&
        typeof global.supabase.createClient === "function" &&
        this.config.supabaseUrl &&
        this.config.supabaseAnonKey
      ) {
        this.supabase = global.supabase.createClient(
          this.config.supabaseUrl,
          this.config.supabaseAnonKey
        );
      }
    } catch (e) {
      this.supabase = null;
    }
  };

  ChurchDataBridgePhase1.prototype._readQueue = function () {
    if (typeof localStorage === "undefined") return [];
    return safeJsonParse(storageGet(this.config.queueStorageKey, "phase1_queue_read"), []);
  };

  ChurchDataBridgePhase1.prototype._writeQueue = function (queue) {
    if (typeof localStorage === "undefined") return;
    storageSet(this.config.queueStorageKey, JSON.stringify(queue || []), "phase1_queue_write");
  };

  ChurchDataBridgePhase1.prototype._enqueue = function (task) {
    var queue = this._readQueue();
    queue.push(task);
    if (queue.length > this.config.queueMaxItems) {
      queue = queue.slice(queue.length - this.config.queueMaxItems);
    }
    this._writeQueue(queue);
    return queue.length;
  };

  ChurchDataBridgePhase1.prototype._readObserverLog = function () {
    if (typeof localStorage === "undefined") return [];
    return safeJsonParse(storageGet(this.config.observerStorageKey, "phase1_observer_read"), []);
  };

  ChurchDataBridgePhase1.prototype._writeObserverLog = function (items) {
    if (typeof localStorage === "undefined") return;
    storageSet(this.config.observerStorageKey, JSON.stringify(items || []), "phase1_observer_write");
  };

  ChurchDataBridgePhase1.prototype._logEvent = function (level, message, detail) {
    var items = this._readObserverLog();
    items.push({
      id: "ev_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
      at: nowIso(),
      level: String(level || "info"),
      message: String(message || ""),
      detail: detail || {}
    });
    if (items.length > 200) items = items.slice(items.length - 200);
    this._writeObserverLog(items);
    try {
      if (typeof window !== "undefined") {
        window.postMessage({ type: "SYNC_OBSERVER_UPDATED", at: nowIso() }, "*");
      }
    } catch (e) {}
  };

  ChurchDataBridgePhase1.prototype.getRecentObserverEvents = function (limit) {
    var n = Number(limit || 20);
    if (!isFinite(n) || n <= 0) n = 20;
    var items = this._readObserverLog();
    return items.slice(Math.max(0, items.length - n)).reverse();
  };

  ChurchDataBridgePhase1.prototype.retryQueueItem = async function (itemId) {
    var queue = this._readQueue();
    var idx = queue.findIndex(function (x) { return x && x.id === itemId; });
    if (idx < 0) return { ok: false, reason: "not_found" };
    var item = queue[idx];
    try {
      if (!this.supabase || !this.isOnline) return { ok: false, reason: "offline_or_no_supabase" };
      if (item.type === "update_member_profile") {
        await this._supabaseUpsertMember(item.memberId, item.patch || {});
      } else if (item.type === "trigger_workflow") {
        await this._executeWorkflow(item.triggerEvent, item.payload || {});
      }
      queue.splice(idx, 1);
      this._writeQueue(queue);
      this._logEvent("success", "Queue item retried successfully", { itemId: itemId, type: item.type });
      return { ok: true };
    } catch (e) {
      this._logEvent("error", "Queue item retry failed", { itemId: itemId, error: String(e && e.message ? e.message : e) });
      return { ok: false, reason: "retry_failed", error: String(e && e.message ? e.message : e) };
    }
  };

  ChurchDataBridgePhase1.prototype.markQueueItemManual = function (itemId, note) {
    var queue = this._readQueue();
    var idx = queue.findIndex(function (x) { return x && x.id === itemId; });
    if (idx < 0) return { ok: false, reason: "not_found" };
    var item = queue[idx];
    item.manual_intervention = { at: nowIso(), note: String(note || "manual_intervention") };
    this._writeQueue(queue);
    this._logEvent("warning", "Queue item marked for manual intervention", { itemId: itemId, note: item.manual_intervention.note });
    return { ok: true };
  };

  ChurchDataBridgePhase1.prototype.getQueueSnapshot = function (limit) {
    var n = Number(limit || 20);
    if (!isFinite(n) || n <= 0) n = 20;
    var q = this._readQueue();
    return q.slice(Math.max(0, q.length - n)).reverse();
  };

  ChurchDataBridgePhase1.prototype._emitDataUpdated = function (payload) {
    if (typeof window === "undefined") return;
    try {
      window.postMessage(
        {
          type: "DATA_UPDATED",
          module: payload && payload.module ? payload.module : "CHURCH_DATA_BRIDGE_PHASE1",
          action: payload && payload.action ? payload.action : "",
          memberId: payload && payload.memberId != null ? payload.memberId : null,
          at: nowIso()
        },
        "*"
      );
    } catch (e) {}
  };

  ChurchDataBridgePhase1.prototype._supabaseUpsertMember = async function (memberId, data) {
    var payload = Object.assign({}, data || {});
    payload.id = memberId;
    payload.memberId = memberId;
    if (!payload.church_id) payload.church_id = getChurchId();
    payload.updated_at = nowIso();
    var result = await this.supabase.from("members").upsert(payload, { onConflict: "id" });
    if (result && result.error) throw result.error;
  };

  ChurchDataBridgePhase1.prototype._supabaseInsertWorkflowLog = async function (eventName, payload) {
    var churchId = payload && payload.church_id ? payload.church_id : getChurchId();
    var result = await this.supabase.from("survey_logs").insert({
      member_id: payload && payload.memberId != null ? payload.memberId : null,
      church_id: churchId,
      survey_type: eventName,
      payload: payload || {},
      source_module: payload && payload.module ? payload.module : "phase1_bridge",
      submitted_at: nowIso()
    });
    if (result && result.error) throw result.error;
  };

  ChurchDataBridgePhase1.prototype._resolvePipelineStage = function (courseId, totalCredits) {
    var p = this.config.leaderPipelinePolicy || {};
    var mode = String(p.mode || "hybrid").toLowerCase();
    var thresholds = Array.isArray(p.thresholdCourseIds) ? p.thresholdCourseIds : [];
    var courseHit = courseId && thresholds.indexOf(String(courseId)) >= 0;
    var creditsHit = Number(totalCredits || 0) >= Number(p.stage3Credits || 12);

    if (mode === "threshold") return courseHit ? 3 : 1;
    if (mode === "credits") return creditsHit ? 3 : 1;
    return (courseHit || creditsHit) ? 3 : 1;
  };

  ChurchDataBridgePhase1.prototype._upsertLeaderPipeline = async function (memberId, stage, sourceType, sourceRefId) {
    if (!this.supabase) return;
    var before = await this.supabase
      .from("leader_pipeline")
      .select("stage")
      .eq("member_id", memberId)
      .limit(1)
      .maybeSingle();
    var prevStage = before && before.data ? Number(before.data.stage || 0) : 0;
    var payload = {
      member_id: memberId,
      stage: stage,
      status: "active",
      source_type: sourceType || "workflow",
      source_ref_id: sourceRefId ? String(sourceRefId) : null,
      last_promoted_at: nowIso(),
      metadata: { policy: this.config.leaderPipelinePolicy || {} },
      updated_at: nowIso()
    };
    var result = await this.supabase.from("leader_pipeline").upsert(payload, { onConflict: "member_id" });
    if (result && result.error) throw result.error;
    if (Number(stage || 0) > prevStage) {
      await this._insertPipelinePromotionAlert(memberId, prevStage, Number(stage || 0));
    }
  };

  ChurchDataBridgePhase1.prototype._insertPipelinePromotionAlert = async function (memberId, fromStage, toStage) {
    if (!this.supabase) return;
    var since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    var q = await this.supabase
      .from("leader_pipeline")
      .select("id", { count: "exact", head: true })
      .gte("stage", 3)
      .gte("last_promoted_at", since)
      .eq("is_deleted", false);
    var promotedCount = (q && typeof q.count === "number") ? q.count : 1;
    var message =
      "🎉 偵測到 " +
      promotedCount +
      " 位新學員已符合實習領袖資格，請確認培訓進度。";
    var out = await this.supabase.from("dashboard_alerts").insert({
      alert_type: "leader_pipeline_promotion",
      member_id: memberId,
      severity: "info",
      payload: {
        message: message,
        from_stage: fromStage,
        to_stage: toStage,
        promoted_count_24h: promotedCount
      },
      is_active: true,
      detected_at: nowIso()
    });
    if (out && out.error) throw out.error;
  };

  ChurchDataBridgePhase1.prototype._executeWorkflow = async function (eventName, payload) {
    await this._supabaseInsertWorkflowLog(eventName, payload || {});
    if (
      eventName === "TRAINING_COMPLETED" &&
      payload &&
      payload.memberId != null
    ) {
      var credits = Number(
        payload.credits != null
          ? payload.credits
          : (payload.trainingCreditsDelta != null ? payload.trainingCreditsDelta : 1)
      );
      var totalCredits = Number(payload.trainingCredits || 0) + credits;
      var stage = this._resolvePipelineStage(payload.courseId, totalCredits);
      await this._supabaseUpsertMember(payload.memberId, {
        training_status: "completed",
        training_credits: totalCredits
      });
      await this._upsertLeaderPipeline(payload.memberId, stage, "school_training", payload.courseId || null);
    }
    if (
      eventName === "SURVEY_COMPLETED" &&
      payload &&
      payload.memberId != null &&
      String(payload.type || "").toUpperCase() === "NCD"
    ) {
      var normalized = normalizeScore(payload.score, payload.maxScale || 65);
      await this._supabaseUpsertMember(payload.memberId, {
        spiritual_health_score: normalized
      });
      this._logEvent("info", "NCD score normalized", {
        memberId: payload.memberId,
        rawScore: Number(payload.score || 0),
        maxScale: Number(payload.maxScale || 65),
        normalizedScore: normalized
      });
    }
  };

  ChurchDataBridgePhase1.prototype._mirrorToLocalMemberStore = function (memberId, patch) {
    if (typeof localStorage === "undefined") return false;
    var raw = storageGet("memberSystemData", "phase1_member_mirror_read");
    var data = safeJsonParse(raw, null);
    if (!data || !Array.isArray(data.members)) return false;
    var changed = false;
    for (var i = 0; i < data.members.length; i++) {
      var m = data.members[i];
      var id = m && (m.memberId != null ? m.memberId : m.id);
      if (String(id) !== String(memberId)) continue;
      Object.keys(patch || {}).forEach(function (k) {
        m[k] = patch[k];
      });
      m.updatedAt = nowIso();
      changed = true;
      break;
    }
    if (changed) storageSet("memberSystemData", JSON.stringify(data), "phase1_member_mirror_write");
    return changed;
  };

  ChurchDataBridgePhase1.prototype.updateMemberProfile = async function (memberId, data) {
    if (memberId == null) {
      return { ok: false, queued: false, reason: "memberId_required" };
    }
    var patch = Object.assign({}, data || {});
    if (!patch.church_id) patch.church_id = getChurchId();
    patch.meta_data = Object.assign({}, patch.meta_data || {}, { last_bridge_sync_at: nowIso() });

    this._mirrorToLocalMemberStore(memberId, patch);

    var task = {
      id: "q_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
      type: "update_member_profile",
      memberId: memberId,
      patch: patch,
      createdAt: nowIso()
    };

    if (!this.supabase || !this.isOnline) {
      this._enqueue(task);
      this._logEvent("warning", "Profile update queued (offline/no supabase)", { memberId: memberId, queueItemId: task.id });
      this._emitDataUpdated({ module: "MEMBER", action: "local_queue", memberId: memberId });
      return { ok: true, queued: true };
    }

    try {
      await this._supabaseUpsertMember(memberId, patch);
      this._logEvent("success", "Profile updated", { memberId: memberId });
      this._emitDataUpdated({ module: "MEMBER", action: "upsert", memberId: memberId });
      return { ok: true, queued: false };
    } catch (e) {
      this._enqueue(task);
      this._logEvent("warning", "Profile update failed and queued", { memberId: memberId, queueItemId: task.id, error: String(e && e.message ? e.message : e) });
      return { ok: true, queued: true, fallback: "local_queue", error: String(e && e.message ? e.message : e) };
    }
  };

  ChurchDataBridgePhase1.prototype.triggerWorkflow = async function (triggerEvent, payload) {
    var eventName = String(triggerEvent || "").trim();
    if (!eventName) {
      return { ok: false, queued: false, reason: "triggerEvent_required" };
    }

    var task = {
      id: "q_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
      type: "trigger_workflow",
      triggerEvent: eventName,
      payload: Object.assign({ church_id: getChurchId() }, payload || {}),
      createdAt: nowIso()
    };

    if (!this.supabase || !this.isOnline) {
      this._enqueue(task);
      this._logEvent("warning", "Workflow queued (offline/no supabase)", { action: eventName, memberId: payload && payload.memberId, queueItemId: task.id });
      this._emitDataUpdated({ module: "WORKFLOW", action: eventName, memberId: payload && payload.memberId });
      return { ok: true, queued: true };
    }

    try {
      await this._executeWorkflow(eventName, payload || {});
      this._logEvent("success", "Workflow executed", { action: eventName, memberId: payload && payload.memberId });
      this._emitDataUpdated({ module: "WORKFLOW", action: eventName, memberId: payload && payload.memberId });
      return { ok: true, queued: false };
    } catch (e) {
      this._enqueue(task);
      this._logEvent("error", "Workflow failed and queued", { action: eventName, memberId: payload && payload.memberId, queueItemId: task.id, error: String(e && e.message ? e.message : e) });
      return { ok: true, queued: true, fallback: "local_queue", error: String(e && e.message ? e.message : e) };
    }
  };

  ChurchDataBridgePhase1.prototype.flushQueue = async function () {
    if (this._flushInProgress) return { ok: true, skipped: "in_progress" };
    if (!this.supabase || !this.isOnline) return { ok: false, reason: "offline_or_no_supabase" };

    var queue = this._readQueue();
    if (!queue.length) return { ok: true, processed: 0 };

    this._flushInProgress = true;
    var remain = [];
    var processed = 0;
    try {
      for (var i = 0; i < queue.length; i++) {
        var item = queue[i];
        try {
          if (item.type === "update_member_profile") {
            await this._supabaseUpsertMember(item.memberId, item.patch || {});
          } else if (item.type === "trigger_workflow") {
            await this._executeWorkflow(item.triggerEvent, item.payload || {});
          }
          processed++;
        } catch (eEach) {
          remain.push(item);
        }
      }
      this._writeQueue(remain);
      this._logEvent("info", "Queue flush completed", { processed: processed, remain: remain.length });
      return { ok: true, processed: processed, remain: remain.length };
    } finally {
      this._flushInProgress = false;
    }
  };

  ChurchDataBridgePhase1.prototype.getGovernanceReportPayload = async function (options) {
    var opts = options || {};
    var limitAlerts = Number(opts.limitAlerts || 8);
    var limitPipeline = Number(opts.limitPipeline || 12);
    if (!isFinite(limitAlerts) || limitAlerts <= 0) limitAlerts = 8;
    if (!isFinite(limitPipeline) || limitPipeline <= 0) limitPipeline = 12;

    var payload = {
      generated_at: nowIso(),
      source: "local_fallback",
      summary: null,
      alerts: [],
      pipeline_stage3_members: [],
      strategy: {
        cycles_total: 0,
        cycles_active: 0,
        actions_total: 0,
        actions_open: 0,
        actions_completed: 0
      }
    };

    if (!this.supabase || !this.isOnline) {
      var local = safeJsonParse(
        typeof localStorage !== "undefined" ? storageGet("memberSystemData", "phase1_governance_fallback_read") : null,
        {}
      );
      var members = local && Array.isArray(local.members) ? local.members : [];
      var overloaded = members.filter(function (m) {
        return Number(m && m.ministry_load_index || 0) > 0.8;
      }).length;
      payload.summary = {
        total_members: members.length,
        active_members: members.filter(function (m) { return String(m && m.status || "").toLowerCase() === "active"; }).length,
        overloaded_members: overloaded,
        pending_training_members: members.filter(function (m) {
          var st = String(m && m.training_status || "").toLowerCase();
          return st !== "completed" && st !== "done";
        }).length,
        avg_spiritual_health_score: members.length
          ? Math.round(members.reduce(function (acc, m) { return acc + Number(m && m.spiritual_health_score || 0); }, 0) / members.length)
          : 0,
        active_leader_pipeline_members: members.filter(function (m) {
          return Number(m && m.spiritual_stage || 0) >= 3;
        }).length,
        vision_alignment_status: "平衡"
      };
      return payload;
    }

    try {
      var summaryQ = await this.supabase
        .from("view_church_health_summary")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (summaryQ && summaryQ.error) throw summaryQ.error;

      var alertsQ = await this.supabase
        .from("dashboard_alerts")
        .select("id, alert_type, severity, payload, detected_at")
        .eq("is_active", true)
        .eq("is_deleted", false)
        .order("detected_at", { ascending: false })
        .limit(limitAlerts);
      if (alertsQ && alertsQ.error) throw alertsQ.error;

      var pipelineQ = await this.supabase
        .from("leader_pipeline")
        .select("member_id, stage, status, last_promoted_at")
        .eq("is_deleted", false)
        .eq("status", "active")
        .gte("stage", 3)
        .order("last_promoted_at", { ascending: false })
        .limit(limitPipeline);
      if (pipelineQ && pipelineQ.error) throw pipelineQ.error;
      var pipelineRows = (pipelineQ && pipelineQ.data) || [];
      var memberIds = pipelineRows.map(function (r) { return r.member_id; }).filter(function (x) { return x != null; });
      var memberNameMap = {};
      if (memberIds.length) {
        var membersQ = await this.supabase
          .from("members")
          .select("id, name")
          .in("id", memberIds);
        if (membersQ && membersQ.error) throw membersQ.error;
        (membersQ.data || []).forEach(function (m) {
          memberNameMap[String(m.id)] = m.name || ("member-" + m.id);
        });
      }

      var cyclesQ = await this.supabase
        .from("strategy_cycles")
        .select("status");
      var actionsQ = await this.supabase
        .from("strategy_actions")
        .select("is_completed");
      var cycles = cyclesQ && !cyclesQ.error && Array.isArray(cyclesQ.data) ? cyclesQ.data : [];
      var actions = actionsQ && !actionsQ.error && Array.isArray(actionsQ.data) ? actionsQ.data : [];

      payload.source = "supabase";
      payload.summary = summaryQ && summaryQ.data ? summaryQ.data : null;
      payload.alerts = (alertsQ && alertsQ.data) || [];
      payload.pipeline_stage3_members = pipelineRows.map(function (r) {
        return {
          member_id: r.member_id,
          member_name: memberNameMap[String(r.member_id)] || ("member-" + r.member_id),
          stage: r.stage,
          status: r.status,
          last_promoted_at: r.last_promoted_at
        };
      });
      payload.strategy = {
        cycles_total: cycles.length,
        cycles_active: cycles.filter(function (x) { return String(x.status || "").toLowerCase() === "active"; }).length,
        actions_total: actions.length,
        actions_open: actions.filter(function (x) { return x.is_completed !== true; }).length,
        actions_completed: actions.filter(function (x) { return x.is_completed === true; }).length
      };
      return payload;
    } catch (e) {
      this._logEvent("warning", "Governance payload fallback", {
        error: String(e && e.message ? e.message : e)
      });
      return payload;
    }
  };

  ChurchDataBridgePhase1.prototype.getSyncHealthSummary = function () {
    if (global.ChurchDataBridge && typeof global.ChurchDataBridge.getSyncHealthSummary === "function") {
      return global.ChurchDataBridge.getSyncHealthSummary();
    }
    var cfg = global.CHURCH_CLOUD_CONFIG || {};
    var queue = this._readQueue();
    var qPending = 0;
    var qManual = 0;
    queue.forEach(function (q) {
      if (!q) return;
      if (q.manual_intervention) qManual += 1;
      else qPending += 1;
    });
    var events = this.getRecentObserverEvents(1);
    var pastoral = safeJsonParse(storageGet("pastoralFollowupData", "sync_health_read"), { tasks: [] });
    var finance = safeJsonParse(storageGet("financeReconciliationData", "sync_health_read"), { records: [] });
    var vol = safeJsonParse(storageGet("volunteerSystemData", "sync_health_read"), { schedules: [] });
    var pastoralCount = Array.isArray(pastoral.tasks) ? pastoral.tasks.length : 0;
    var financeCount = Array.isArray(finance.records) ? finance.records.length : 0;
    var shiftCount = Array.isArray(vol.schedules) ? vol.schedules.length : 0;
    var status = qPending > 0 ? "local_queue" : "ok";
    return {
      ok: true,
      generated_at: nowIso(),
      storage_mode: cfg.USE_API ? "cloud_capable" : "local_first",
      phase1_active: true,
      cloud_configured: !!(cfg.USE_API || cfg.SUPABASE_URL),
      queue: { total: queue.length, pending: qPending, manual: qManual },
      last_event_at: events[0] && events[0].at ? events[0].at : null,
      crm_tools: [
        {
          tool_id: "volunteer_shift",
          wave: "A1",
          label: "義工排班",
          optional: false,
          count: shiftCount,
          pending: 0,
          href: "church_ministry/tools/volunteer_shift/index.html"
        },
        {
          tool_id: "visitation_followup",
          wave: "A2",
          label: "探訪跟進",
          optional: false,
          count: pastoralCount,
          pending: 0,
          href: "church_ministry/tools/visitation_followup/index.html"
        },
        {
          tool_id: "finance_reconciliation",
          wave: "A3",
          label: "財務對帳",
          optional: true,
          count: financeCount,
          pending: 0,
          href: "church_ministry/tools/finance_reconciliation/index.html",
          note_zh: "許多教會不在 CRM 記帳；0 筆屬正常，不影響其他模組。"
        }
      ],
      status: status,
      message_zh: "本機摘要（完整 Bridge 未載入時僅計 localStorage 筆數）。A3 財務可選。"
    };
  };

  var singleton = null;
  function getBridge(config) {
    if (!singleton) singleton = new ChurchDataBridgePhase1(config);
    return singleton;
  }

  global.ChurchDataBridgePhase1 = {
    getInstance: getBridge
  };
})(typeof window !== "undefined" ? window : this);

