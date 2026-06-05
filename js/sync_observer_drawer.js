(function (global) {
  "use strict";

  function ensureBridge() {
    try {
      if (global.Bible100Backend && typeof global.Bible100Backend.getBridge === "function") {
        return global.Bible100Backend.getBridge();
      }
      if (global.ChurchDataBridgePhase1 && typeof global.ChurchDataBridgePhase1.getInstance === "function") {
        return global.ChurchDataBridgePhase1.getInstance({});
      }
    } catch (e) {}
    return null;
  }

  function getHealthSummary() {
    try {
      if (global.ChurchDataBridge && typeof global.ChurchDataBridge.getSyncHealthSummary === "function") {
        return global.ChurchDataBridge.getSyncHealthSummary();
      }
      var bridge = ensureBridge();
      if (bridge && typeof bridge.getSyncHealthSummary === "function") {
        return bridge.getSyncHealthSummary();
      }
    } catch (e2) {}
    return null;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function renderHealth() {
    var host = document.getElementById("syncObserverHealth");
    if (!host) return;
    var h = getHealthSummary();
    if (!h || !h.ok) {
      host.innerHTML =
        '<div class="sync-observer-empty">健康摘要尚無法載入（本機模式可忽略雲端佇列）。</div>';
      return;
    }
    var q = h.queue || {};
    var toolsHtml = (h.crm_tools || [])
      .map(function (t) {
        var opt = t.optional ? ' <span class="sync-health-opt">可選</span>' : "";
        var note = t.note_zh
          ? '<div class="sync-health-note">' + esc(t.note_zh) + "</div>"
          : "";
        return (
          '<div class="sync-health-tool">' +
          "<strong>" +
          esc(t.wave || "") +
          " " +
          esc(t.label || t.tool_id) +
          opt +
          "</strong> " +
          "本機 " +
          esc(t.count != null ? t.count : "—") +
          " 筆" +
          (t.pending ? " · 待辦 " + esc(t.pending) : "") +
          note +
          "</div>"
        );
      })
      .join("");
    host.innerHTML =
      '<div class="sync-health-strip">' +
      '<div class="sync-health-row"><span class="sync-health-k">模式</span> ' +
      esc(h.storage_mode === "cloud_capable" ? "可接雲端" : "本機優先") +
      "</div>" +
      '<div class="sync-health-row"><span class="sync-health-k">佇列</span> 待送 ' +
      esc(q.pending != null ? q.pending : 0) +
      " · 人工 " +
      esc(q.manual != null ? q.manual : 0) +
      " · 共 " +
      esc(q.total != null ? q.total : 0) +
      "</div>" +
      (h.last_event_at
        ? '<div class="sync-health-row"><span class="sync-health-k">最近事件</span> ' +
          esc(h.last_event_at) +
          "</div>"
        : "") +
      '<div class="sync-health-tools">' +
      toolsHtml +
      "</div>" +
      '<p class="sync-health-msg">' +
      esc(h.message_zh || "") +
      "</p>" +
      "</div>";
  }

  function renderList() {
    renderHealth();
    var bridge = ensureBridge();
    var hostEvents = document.getElementById("syncObserverEvents");
    var hostQueue = document.getElementById("syncObserverQueue");
    if (!hostEvents || !hostQueue) return;
    if (!bridge) {
      hostEvents.innerHTML = '<div class="sync-observer-empty">Bridge not ready.</div>';
      hostQueue.innerHTML = '<div class="sync-observer-empty">Queue unavailable.</div>';
      return;
    }
    var events = bridge.getRecentObserverEvents ? bridge.getRecentObserverEvents(20) : [];
    var queue = bridge.getQueueSnapshot ? bridge.getQueueSnapshot(20) : [];

    if (!events.length) {
      hostEvents.innerHTML = '<div class="sync-observer-empty">No recent workflow events.</div>';
    } else {
      hostEvents.innerHTML = events
        .map(function (ev) {
          return (
            '<div class="sync-observer-item ' +
            esc(ev.level || "info") +
            '">' +
            '<div class="sync-observer-time">' +
            esc(ev.at || "") +
            "</div>" +
            '<div class="sync-observer-msg">' +
            esc(ev.message || "") +
            "</div>" +
            '<div class="sync-observer-detail">' +
            esc(JSON.stringify(ev.detail || {})) +
            "</div>" +
            "</div>"
          );
        })
        .join("");
    }

    if (!queue.length) {
      hostQueue.innerHTML = '<div class="sync-observer-empty">Queue is empty.</div>';
      return;
    }
    hostQueue.innerHTML = queue
      .map(function (q) {
        var id = q && q.id ? q.id : "";
        return (
          '<div class="sync-observer-item queue">' +
          '<div class="sync-observer-time">' +
          esc(q.createdAt || "") +
          "</div>" +
          '<div class="sync-observer-msg">' +
          esc((q.type || "") + " · " + (q.triggerEvent || "")) +
          "</div>" +
          '<div class="sync-observer-detail">' +
          esc(JSON.stringify(q.payload || q.patch || {})) +
          "</div>" +
          '<div class="sync-observer-actions">' +
          '<button type="button" class="sync-btn" data-action="retry" data-id="' +
          esc(id) +
          '">重試</button>' +
          '<button type="button" class="sync-btn warn" data-action="manual" data-id="' +
          esc(id) +
          '">人工介入</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function showSyncToast(text) {
    var old = document.getElementById("syncObserverMiniToast");
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var t = document.createElement("div");
    t.id = "syncObserverMiniToast";
    t.className = "sync-observer-mini-toast";
    t.textContent = text || "數據已同步至雲端";
    document.body.appendChild(t);
    setTimeout(function () {
      if (t && t.parentNode) t.parentNode.removeChild(t);
    }, 2200);
  }

  async function handleQueueAction(e) {
    var btn = e.target;
    if (!btn || !btn.getAttribute) return;
    var action = btn.getAttribute("data-action");
    var id = btn.getAttribute("data-id");
    if (!action || !id) return;
    var bridge = ensureBridge();
    if (!bridge) return;
    if (action === "retry" && bridge.retryQueueItem) {
      await bridge.retryQueueItem(id);
    } else if (action === "manual" && bridge.markQueueItemManual) {
      bridge.markQueueItemManual(id, "manually_marked_from_drawer");
    }
    renderList();
  }

  function initDrawer() {
    var btn = document.getElementById("btnSyncObserver");
    var drawer = document.getElementById("syncObserverDrawer");
    var closeBtn = document.getElementById("btnSyncObserverClose");
    var refreshBtn = document.getElementById("btnSyncObserverRefresh");
    var queueHost = document.getElementById("syncObserverQueue");
    if (!btn || !drawer || !closeBtn || !refreshBtn || !queueHost) return;

    btn.addEventListener("click", function () {
      drawer.classList.toggle("open");
      if (drawer.classList.contains("open")) {
        btn.classList.remove("has-unread");
      }
      renderList();
    });
    closeBtn.addEventListener("click", function () {
      drawer.classList.remove("open");
    });
    refreshBtn.addEventListener("click", function () {
      renderList();
    });
    queueHost.addEventListener("click", handleQueueAction);
    window.addEventListener("message", function (event) {
      if (!event || !event.data) return;
      if (event.data.type === "SYNC_OBSERVER_UPDATED" || event.data.type === "DATA_UPDATED") {
        if (!drawer.classList.contains("open")) {
          btn.classList.add("has-unread");
          if (event.data.type === "DATA_UPDATED") showSyncToast("數據已同步至雲端");
        }
        renderList();
      }
    });
  }

  global.SyncObserverDrawer = {
    init: initDrawer,
    refresh: renderList
  };
})(typeof window !== "undefined" ? window : this);
