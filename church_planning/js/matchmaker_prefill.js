/**
 * Tab ④ → 事奉媒合中心 · sessionStorage 預填信封（HITL，不自動 CRM 寫入）
 * mode: job_seek_talent（工找人）| talent_seek_job（人找工）
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "bible100_matchmaker_prefill";
  var BACKUP_KEY = "bible100_matchmaker_prefill_backup";
  var EXPORT_KIND = "bible100_matchmaker_prefill";
  var QR_MAX_B64 = 2400;
  var TOOL_LABELS = {
    shape: "SHAPE 恩賜",
    johari: "Johari 周哈里窗",
    disc: "DISC 溝通",
    mbti: "性格傾向",
    alda: "ALDA 領導力",
    competency: "事奉能力模型"
  };
  var MINISTRY_TO_DEPT = {
    care: "pastoral",
    teaching: "kids",
    worship: "worship",
    hospitality: "pastoral",
    admin: "admin",
    outreach: "outreach",
    media: "worship"
  };

  function suggestDeptFromPathCards(pathCards) {
    if (!pathCards || !pathCards.length) return "worship";
    var id = pathCards[0].ministry_id;
    return MINISTRY_TO_DEPT[id] || "pastoral";
  }

  function memoFromRun(toolId, run) {
    if (!run || !run.derived) return "";
    var d = run.derived;
    if (toolId === "shape") return "熱情主軸「" + (d.top_heart || "—") + "」· " + (d.personality_note || "");
    if (toolId === "johari")
      return (
        "開放區 " +
        (d.open_pct || "?") +
        "% · 盲點區 " +
        (d.blind_pct || "?") +
        "% · 主區「" +
        (d.dominant || "—") +
        "」"
      );
    if (toolId === "disc") return "溝通主型：" + (d.primary_label || d.primary);
    if (toolId === "mbti") return "類型傾向：" + (d.code || "—");
    if (toolId === "alda")
      return (
        "主使徒「" +
        (d.primary || "—") +
        "」· 真實度 " +
        (d.sincerity != null ? d.sincerity : "?") +
        "%"
      );
    if (toolId === "competency")
      return (
        "能力強項「" +
        (d.primary_label || "—") +
        "」· 待補「" +
        (d.weakest_label || "—") +
        "」"
      );
    return "";
  }

  function buildAiInstruction(toolId, run) {
    var hasRun = !!(run && run.derived);
    var memo = memoFromRun(toolId, run);
    return [
      "你現在是這間教會的牧者。面前的會友完成了「" +
        (TOOL_LABELS[toolId] || toolId) +
        "」測評。",
      hasRun ? "重點摘要：" + memo : "（請先請會友完成 Tab ②，或參考示範報告）",
      "請撰寫：①溫暖肯定 ②一項具體事奉方向建議 ③邀請面談時間",
      "語氣像牧養，不像人事考核。不確定處請明說需查證。"
    ].join("\n");
  }

  function buildToolSummary(store) {
    store = store || global.AssessmentRunStore;
    var out = [];
    ["shape", "johari", "disc", "mbti", "alda", "competency"].forEach(function (id) {
      if (!store || !store.loadLatest) return;
      var r = store.loadLatest(id);
      if (r && !r.is_demo) {
        out.push({
          tool_id: id,
          label: TOOL_LABELS[id] || id,
          name: (r.profile && r.profile.name) || "",
          timestamp: r.timestamp || null
        });
      }
    });
    return out;
  }

  function resolvePathCards(toolId, run, store) {
    var cards = [];
    if (run && run.path_cards && run.path_cards.length) cards = run.path_cards.slice();
    if (!cards.length && global.PathCardsHitlPanel && PathCardsHitlPanel.pickPathCards) {
      var runs = PathCardsHitlPanel.loadLatestRuns(store);
      var picked = PathCardsHitlPanel.pickPathCards(runs);
      if (picked.cards && picked.cards.length) cards = picked.cards.slice();
    }
    if (!cards.length && global.MinistryPathBridge) {
      if (run && MinistryPathBridge.attachPathCards && !run.path_cards) {
        MinistryPathBridge.attachPathCards(run, { sourceTool: toolId, sourceRun: run });
        if (run.path_cards && run.path_cards.length) cards = run.path_cards.slice();
      }
      if (!cards.length && MinistryPathBridge.buildPathCards) {
        var built = MinistryPathBridge.buildPathCards({ store: store, sourceTool: toolId, sourceRun: run });
        if (built.path_cards && built.path_cards.length) cards = built.path_cards.slice();
      }
    }
    return cards;
  }

  function buildEnvelope(mode, toolId, run, extra) {
    extra = extra || {};
    var store = global.AssessmentRunStore;
    var pathCards = resolvePathCards(toolId, run, store);
    var invite =
      global.CoachingDeskContent && CoachingDeskContent.buildPastoralInvite
        ? CoachingDeskContent.buildPastoralInvite(toolId, run)
        : "";
    var aiInstruction =
      global.CoachingDeskContent && CoachingDeskContent.buildAiInstruction
        ? CoachingDeskContent.buildAiInstruction(toolId, run)
        : buildAiInstruction(toolId, run);

    var primaryIdx = extra.primary_card_index != null ? extra.primary_card_index : 0;
    var primaryCard = pathCards[primaryIdx] || pathCards[0];
    var openRole = extra.open_role || (primaryCard && primaryCard.open_role) || null;

    return {
      schema_version: 1,
      mode: mode,
      source_tool: toolId,
      subject_name: (run && run.profile && run.profile.name) || "",
      path_cards: pathCards,
      pastoral_invite: invite,
      ai_instruction: aiInstruction,
      tool_summary: buildToolSummary(store),
      suggested_dept:
        extra.dept ||
        (openRole && openRole.dept_key) ||
        suggestDeptFromPathCards(pathCards),
      open_role: openRole,
      primary_card_index: primaryIdx,
      timestamp: Date.now()
    };
  }

  function save(envelope) {
    try {
      global.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
      global.localStorage.setItem(BACKUP_KEY, JSON.stringify(envelope));
      return true;
    } catch (e) {
      return false;
    }
  }

  function load() {
    try {
      var raw = global.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) raw = global.localStorage.getItem(BACKUP_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function clear() {
    try {
      global.sessionStorage.removeItem(STORAGE_KEY);
      global.localStorage.removeItem(BACKUP_KEY);
    } catch (e) {}
  }

  function toBase64Url(str) {
    try {
      var b64 = global.btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_m, p1) {
          return String.fromCharCode(parseInt(p1, 16));
        })
      );
      return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } catch (e) {
      return "";
    }
  }

  function fromBase64Url(b64url) {
    try {
      var b64 = String(b64url || "")
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      var bin = global.atob(b64);
      return decodeURIComponent(
        bin
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
    } catch (e) {
      return "";
    }
  }

  function serializeExport(envelope) {
    return JSON.stringify({
      kind: EXPORT_KIND,
      schema_version: 1,
      exported_at: Date.now(),
      data: envelope
    });
  }

  function parseImportText(text) {
    text = String(text || "").trim();
    if (!text) return { ok: false, errors: ["內容為空"] };
    var obj = null;
    try {
      obj = JSON.parse(text);
    } catch (e1) {
      try {
        obj = JSON.parse(fromBase64Url(text));
      } catch (e2) {
        return { ok: false, errors: ["無法解析 JSON 或匯入碼"] };
      }
    }
    if (obj && obj.kind === EXPORT_KIND && obj.data) {
      return { ok: true, envelope: obj.data };
    }
    if (obj && obj.mode && obj.path_cards) {
      return { ok: true, envelope: obj };
    }
    return { ok: false, errors: ["不是有效的預填包格式"] };
  }

  function importEnvelope(envelope) {
    if (!envelope || !envelope.mode) return { ok: false, errors: ["預填包缺少 mode"] };
    save(envelope);
    return { ok: true, envelope: envelope };
  }

  function downloadJson(envelope, filename) {
    var blob = new Blob([serializeExport(envelope)], { type: "application/json;charset=utf-8" });
    var a = global.document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || "bible100_matchmaker_prefill.json";
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 500);
  }

  function hubImportUrl(envelope) {
    var payload = toBase64Url(serializeExport(envelope));
    if (!payload || payload.length > QR_MAX_B64) return null;
    var rel = buildHubUrl(envelope.mode, envelope.suggested_dept);
    return rel + "#prefill=" + encodeURIComponent(payload);
  }

  function consumeUrlImport() {
    try {
      var hash = String(global.location.hash || "").replace(/^#/, "");
      if (!hash || hash.indexOf("prefill=") !== 0) return null;
      var b64 = decodeURIComponent(hash.slice("prefill=".length));
      var parsed = parseImportText(b64);
      if (!parsed.ok) return null;
      importEnvelope(parsed.envelope);
      if (global.history.replaceState) {
        global.history.replaceState(null, "", global.location.pathname + global.location.search);
      } else {
        global.location.hash = "";
      }
      return parsed.envelope;
    } catch (e) {
      return null;
    }
  }

  function ensureQrLib(cb) {
    if (global.QRCode) {
      cb(null, global.QRCode);
      return;
    }
    var s = global.document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js";
    s.onload = function () {
      cb(null, global.QRCode);
    };
    s.onerror = function () {
      cb(new Error("QR 函式庫載入失敗"));
    };
    global.document.head.appendChild(s);
  }

  function renderQr(host, envelope, cb) {
    if (!host) return;
    host.innerHTML = "";
    var link = hubImportUrl(envelope);
    if (!link) {
      host.innerHTML =
        '<p class="acs-prefill-qr-note">內容較長，QR 無法容納。請用「下載 JSON」帶回家，或在媒合中心貼上匯入。</p>';
      if (cb) cb(null, false);
      return;
    }
    var absLink = link;
    if (global.planningRootUrl && global.location && !global.location.href.match(/index_v5/i)) {
      try {
        if (String(global.location.href).indexOf("church_planning") >= 0) {
          absLink = "../" + link.replace(/^\.\.\//, "");
        }
      } catch (locErr) {}
    }
    ensureQrLib(function (err) {
      if (err || !global.QRCode) {
        host.innerHTML = '<p class="acs-prefill-qr-note">QR 無法顯示，請改下載 JSON。</p>';
        if (cb) cb(err);
        return;
      }
      var canvas = global.document.createElement("canvas");
      host.appendChild(canvas);
      global.QRCode.toCanvas(
        canvas,
        absLink,
        { width: 180, margin: 1 },
        function (qrErr) {
          if (qrErr) {
            host.innerHTML = '<p class="acs-prefill-qr-note">QR 產生失敗，請改下載 JSON。</p>';
          } else {
            var note = global.document.createElement("p");
            note.className = "acs-prefill-qr-note";
            note.textContent = "掃碼開啟事奉媒合中心並載入預填包（同一教會流程 · 仍須人工確認）";
            host.appendChild(note);
          }
          if (cb) cb(qrErr);
        }
      );
    });
  }

  function renderImportPanelHtml() {
    return (
      '<section class="crm-matchmaker-import" id="crm-matchmaker-import">' +
      "<h4>📥 匯入 Tab ④ 預填包（回家登記試任）</h4>" +
      '<p class="crm-matchmaker-import__lead">貼上約談時匯出的 JSON，或選擇檔案。匯入後自動開啟媒合看板 — <strong>不會自動寫入 CRM</strong>。</p>' +
      '<textarea class="crm-matchmaker-import__ta" id="crmPrefillImportText" rows="3" placeholder="貼上 JSON 或 base64 匯入碼…"></textarea>' +
      '<input type="file" id="crmPrefillImportFile" accept=".json,.txt,application/json" hidden />' +
      '<div class="crm-matchmaker-import__actions">' +
      '<button type="button" class="crm-btn-ghost" id="btnCrmPrefillPickFile">📂 選擇 JSON 檔</button>' +
      '<button type="button" class="crm-btn-ghost" id="btnCrmPrefillImport">📥 匯入並展開看板</button>' +
      "</div></section>"
    );
  }

  function bindImportPanel(root, onImported) {
    root = root || global.document.getElementById("crm-matchmaker-import");
    if (!root) return;
    var ta = root.querySelector("#crmPrefillImportText");
    var fileInput = root.querySelector("#crmPrefillImportFile");
    var pickBtn = root.querySelector("#btnCrmPrefillPickFile");
    var importBtn = root.querySelector("#btnCrmPrefillImport");

    function doImport(text) {
      var parsed = parseImportText(text);
      if (!parsed.ok) {
        global.alert((parsed.errors || ["匯入失敗"]).join(" "));
        return;
      }
      importEnvelope(parsed.envelope);
      if (onImported) onImported(parsed.envelope);
      else if (global.CrmJourneyBrand && CrmJourneyBrand.switchMasterTab) {
        CrmJourneyBrand.switchMasterTab("matchmaker", {
          dept: parsed.envelope.suggested_dept,
          prefill: parsed.envelope,
          prefillMode: parsed.envelope.mode,
          scrollPrefill: true
        });
      }
    }

    if (pickBtn && fileInput) {
      pickBtn.addEventListener("click", function () {
        fileInput.click();
      });
      fileInput.addEventListener("change", function () {
        var f = fileInput.files && fileInput.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          if (ta) ta.value = reader.result || "";
        };
        reader.readAsText(f, "utf-8");
      });
    }
    if (importBtn) {
      importBtn.addEventListener("click", function () {
        doImport(ta ? ta.value : "");
      });
    }
  }

  function buildHubUrl(mode, dept) {
    var q = "tab=matchmaker&mode=" + encodeURIComponent(mode || "talent_seek_job");
    if (dept) q += "&dept=" + encodeURIComponent(dept);
    return "church_ministry/guide_crm_journey_hub.html?" + q;
  }

  function buildFullPackage(envelope) {
    if (!envelope) return "";
    var modeLabel = envelope.mode === "job_seek_talent" ? "工找人" : "人找工";
    var lines = [
      "【Tab ④ → 事奉媒合中心 · 預填包 · 請牧者審核後再行動】",
      "",
      "模式：" + modeLabel,
      "來源工具：" + (TOOL_LABELS[envelope.source_tool] || envelope.source_tool),
      "對象：" + (envelope.subject_name || "（未填姓名）"),
      "建議部門：" + (envelope.suggested_dept || "—"),
      ""
    ];
    if (envelope.tool_summary && envelope.tool_summary.length) {
      lines.push("已完成測評：");
      envelope.tool_summary.forEach(function (t) {
        lines.push("- " + t.label + (t.name ? " · " + t.name : ""));
      });
      lines.push("");
    }
    if (envelope.open_role && envelope.open_role.name_zh) {
      lines.push(
        "對接急缺：「" +
          (envelope.open_role.dept_title || envelope.suggested_dept) +
          "」·【" +
          envelope.open_role.name_zh +
          "】（缺 " +
          (envelope.open_role.gap || "?") +
          " 人）"
      );
      lines.push("");
    }
    if (envelope.path_cards && envelope.path_cards.length) {
      lines.push("出路卡：");
      envelope.path_cards.forEach(function (c, i) {
        lines.push(
          (i + 1) +
            ". [" +
            c.tier +
            "] " +
            (c.role_label || c.ministry_type) +
            (c.fit_score != null ? " (" + c.fit_score + ")" : "")
        );
        if (c.fit_note) lines.push("   " + c.fit_note);
      });
      lines.push("");
    }
    if (envelope.pastoral_invite) {
      lines.push("--- 邀請信草稿 ---", envelope.pastoral_invite, "");
    }
    if (envelope.ai_instruction) {
      lines.push("--- AI 靈性同工指令 ---", envelope.ai_instruction, "");
    }
    lines.push("⚠️ 本包僅預填，正式派任須人工確認；系統不會自動寫入 CRM。");
    return lines.join("\n");
  }

  function launch(mode, toolId, run, ev, extra) {
    if (ev && typeof ev.preventDefault === "function") ev.preventDefault();
    if (!run && global.AssessmentRunStore && toolId) {
      run = global.AssessmentRunStore.loadLatest(toolId);
    }
    var envelope = buildEnvelope(mode, toolId, run, extra || {});
    save(envelope);
    var url = buildHubUrl(mode, envelope.suggested_dept);
    if (global.planningOpenRoot) return global.planningOpenRoot(ev, url);
    try {
      global.location.href = "../" + url.replace(/^\.\.\//, "");
    } catch (e) {
      global.location.href = url;
    }
    return false;
  }

  global.MatchmakerPrefill = {
    STORAGE_KEY: STORAGE_KEY,
    BACKUP_KEY: BACKUP_KEY,
    TOOL_LABELS: TOOL_LABELS,
    MINISTRY_TO_DEPT: MINISTRY_TO_DEPT,
    suggestDeptFromPathCards: suggestDeptFromPathCards,
    buildEnvelope: buildEnvelope,
    buildFullPackage: buildFullPackage,
    buildAiInstruction: buildAiInstruction,
    serializeExport: serializeExport,
    parseImportText: parseImportText,
    importEnvelope: importEnvelope,
    downloadJson: downloadJson,
    hubImportUrl: hubImportUrl,
    consumeUrlImport: consumeUrlImport,
    renderQr: renderQr,
    renderImportPanelHtml: renderImportPanelHtml,
    bindImportPanel: bindImportPanel,
    save: save,
    load: load,
    clear: clear,
    buildHubUrl: buildHubUrl,
    launch: launch
  };
})(typeof window !== "undefined" ? window : global);
