/**
 * W2 · 敬拜排練 AI 預填草稿（只寫 draft 鍵，人審核後合併）
 */
(function (win, doc) {
  "use strict";

  var DRAFT_KEY = "worship_rehearsal_drafts_v1";
  var CHOIR_FLOW_KEY = "church_ministry_choir_flow_v1";

  function loadDrafts() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }

  function saveDrafts(list) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(list));
  }

  function nextFriday() {
    var d = new Date();
    var day = d.getDay();
    var add = (5 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + add);
    return d.toISOString().slice(0, 10);
  }

  function choirVoiceGaps() {
    try {
      var members = JSON.parse(localStorage.getItem("choir_members") || "[]");
      var counts = { soprano: 0, alto: 0, tenor: 0, bass: 0 };
      members.forEach(function (m) { if (counts[m.voice] != null) counts[m.voice]++; });
      var gaps = [];
      Object.keys(counts).forEach(function (v) {
        if (counts[v] < 2) gaps.push(v);
      });
      return gaps;
    } catch (e) { return []; }
  }

  function buildRehearsalDraft(opts) {
    opts = opts || {};
    var date = opts.date || nextFriday();
    var gaps = choirVoiceGaps();
    var note = "【AI 草稿·待審】";
    if (gaps.length) note += " 聲部偏少：" + gaps.join("、");
    var team = null;
    try {
      if (win.WorshipTeamBridge) team = win.WorshipTeamBridge.load();
    } catch (e) {}
    var leaders = (team && team.members) ? team.members.filter(function (m) {
      return /主領|鍵盤|鼓/.test(m.position || "");
    }).map(function (m) { return m.name; }).slice(0, 3) : [];
    return {
      id: "draft-" + Date.now(),
      date: date,
      time: "19:30",
      place: opts.place || "副堂",
      leader: leaders[0] || "團長",
      topic: "詩班／敬拜聯合排練",
      note: note + (leaders.length ? " · 敬拜團：" + leaders.join("、") : ""),
      source: opts.source || "ae_worship_ai_draft",
      status: "pending_review",
      createdAt: new Date().toISOString()
    };
  }

  function generateAndStore(opts) {
    var draft = buildRehearsalDraft(opts);
    var list = loadDrafts();
    list.unshift(draft);
    saveDrafts(list.slice(0, 30));
    return draft;
  }

  function applyDraftToChoirFlow(draftId) {
    var list = loadDrafts();
    var draft = list.filter(function (d) { return d.id === draftId; })[0];
    if (!draft) return { ok: false, message: "找不到草稿" };
    var flow = { practices: [] };
    try {
      var raw = localStorage.getItem(CHOIR_FLOW_KEY);
      if (raw) flow = JSON.parse(raw);
    } catch (e) {}
    if (!Array.isArray(flow.practices)) flow.practices = [];
    flow.practices.push({
      id: String(Date.now()),
      date: draft.date,
      time: draft.time,
      place: draft.place,
      leader: draft.leader,
      note: draft.note
    });
    localStorage.setItem(CHOIR_FLOW_KEY, JSON.stringify(flow));
    draft.status = "merged";
    saveDrafts(list);
    return { ok: true, message: "已合併至詩班流程表「練習表」（請打開詩班頁核對）" };
  }

  function renderPanel(hostId) {
    var host = doc.getElementById(hostId || "ae-worship-ai-draft");
    if (!host) return;
    var drafts = loadDrafts();
    var preview = drafts[0];
    host.innerHTML =
      '<div class="ae-ai-draft">' +
      '<p class="section-lead"><strong>AI 排練預填</strong>：只生成草稿，寫入 <code>' + DRAFT_KEY + '</code>；合併前需人工確認。</p>' +
      '<button type="button" class="fbtn" id="aeAiDraftGen">✨ 生成本週排練草稿</button> ' +
      '<button type="button" class="fbtn" id="aeAiDraftMerge" ' + (preview ? "" : "disabled") + '>✅ 合併最新草稿到詩班練習表</button>' +
      '<pre class="ae-ai-draft-preview" id="aeAiDraftPreview">' +
      (preview ? escJson(preview) : "（尚無草稿）") +
      "</pre></div>";

    var gen = doc.getElementById("aeAiDraftGen");
    var merge = doc.getElementById("aeAiDraftMerge");
    if (gen) {
      gen.addEventListener("click", function () {
        var d = generateAndStore({ source: pageId() });
        renderPanel(hostId);
        if (win.AeWorshipCrmBridge) {
          win.AeWorshipCrmBridge.pushIntent("ai_rehearsal", "排練 AI 草稿", { draftId: d.id });
        }
      });
    }
    if (merge && preview) {
      merge.addEventListener("click", function () {
        if (!confirm("確認將最新 AI 草稿合併到詩班練習表？（仍可手動修改）")) return;
        var r = applyDraftToChoirFlow(preview.id);
        alert(r.message);
        renderPanel(hostId);
      });
    }
  }

  function escJson(o) {
    return String(JSON.stringify(o, null, 2))
      .replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  function pageId() {
    var p = (win.location.pathname || "").replace(/\\/g, "/");
    return (p.split("/").pop() || "").replace(/\.html$/i, "");
  }

  win.AeWorshipAiDraft = {
    DRAFT_KEY: DRAFT_KEY,
    buildRehearsalDraft: buildRehearsalDraft,
    generateAndStore: generateAndStore,
    applyDraftToChoirFlow: applyDraftToChoirFlow,
    renderPanel: renderPanel
  };

  function boot() {
    renderPanel("ae-worship-ai-draft");
    renderPanel("ae-worship-ai-draft-training");
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window, document);
