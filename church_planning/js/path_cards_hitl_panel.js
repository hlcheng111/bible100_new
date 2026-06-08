/**
 * path_cards HITL 面板 · 讀 assessment_run → 輔導員派任草稿（不自動 CRM）
 * 依賴：assessment_run_store.js、ministry_path_bridge.js（可選）
 */
(function (global) {
  "use strict";

  var TOOL_ORDER = ["shape", "competency", "johari", "disc", "mbti", "alda"];
  var TOOL_LABELS = {
    shape: "SHAPE 恩賜",
    competency: "事奉能力",
    johari: "Johari 盲點",
    disc: "DISC 溝通",
    mbti: "MBTI 傾向",
    alda: "ALDA 領導力"
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function loadLatestRuns(store) {
    store = store || global.AssessmentRunStore;
    if (!store || !store.loadLatest) return {};
    var out = {};
    TOOL_ORDER.forEach(function (id) {
      var r = store.loadLatest(id);
      if (r && !r.is_demo) out[id] = r;
    });
    return out;
  }

  function pickPathCards(runs) {
    var order = ["shape", "competency", "johari", "disc", "mbti", "alda"];
    for (var i = 0; i < order.length; i++) {
      var r = runs[order[i]];
      if (r && r.path_cards && r.path_cards.length) return { cards: r.path_cards, source: order[i], run: r };
    }
    if (global.MinistryPathBridge && MinistryPathBridge.buildPathCards) {
      var built = MinistryPathBridge.buildPathCards({ store: global.AssessmentRunStore });
      if (built.path_cards && built.path_cards.length) {
        return { cards: built.path_cards, source: "bridge", run: null };
      }
    }
    return { cards: [], source: null, run: null };
  }

  function buildDeployDraft(runs, pathInfo) {
    pathInfo = pathInfo || pickPathCards(runs);
    var lines = ["【事奉媒合 HITL 派任草稿 · 請牧者審核後再行動】", ""];
    TOOL_ORDER.forEach(function (id) {
      var r = runs[id];
      if (!r) return;
      var name = (r.profile && r.profile.name) || "（未填姓名）";
      lines.push("- " + TOOL_LABELS[id] + "：" + name + " · " + new Date(r.timestamp).toLocaleDateString());
    });
    lines.push("");
    if (!pathInfo.cards.length) {
      lines.push("尚無 path_cards。請同工先完成 SHAPE，再填 Johari/DISC/MBTI/ALDA。");
      return lines.join("\n");
    }
    lines.push("出路卡（" + (pathInfo.source || "—") + " 來源）：");
    pathInfo.cards.forEach(function (c, i) {
      lines.push(
        (i + 1) + ". [" + c.tier + "] " + (c.role_label || c.ministry_type) +
          (c.fit_score != null ? " (" + c.fit_score + ")" : "")
      );
      if (c.fit_note) lines.push("   " + c.fit_note);
      if (c.next_step) lines.push("   下一步：" + c.next_step);
    });
    lines.push("");
    lines.push("⚠️ 本草稿僅供約談參考；正式派任須人工確認，系統不會自動寫入 CRM 排班。");
    return lines.join("\n");
  }

  function renderPrefillBanner(prefill, mode) {
    if (!prefill) return "";
    mode = mode || prefill.mode || "";
    var modeLabel =
      mode === "job_seek_talent"
        ? "🔍 工找人 — 先看本會急缺，再找對的人"
        : "📋 人找工 — 帶出路卡發起試任／派工";
    var toolLabel = TOOL_LABELS[prefill.source_tool] || prefill.source_tool || "測評";
    var name = prefill.subject_name ? " · " + prefill.subject_name : "";
    var cardsHtml = "";
    if (prefill.path_cards && prefill.path_cards.length && global.MinistryPathBridge) {
      if (MinistryPathBridge.attachOpenRolesToCards) MinistryPathBridge.attachOpenRolesToCards(prefill.path_cards);
      if (MinistryPathBridge.renderPathCardsHtml) {
        cardsHtml =
          '<div class="crm-matchmaker-prefill__cards">' +
          MinistryPathBridge.renderPathCardsHtml(prefill.path_cards) +
          "</div>";
      }
    } else if (prefill.path_cards && prefill.path_cards.length) {
      cardsHtml = "<p class=\"crm-matchmaker-prefill__cards\">已帶入 " + prefill.path_cards.length + " 張出路卡</p>";
    }

    return (
      '<section class="crm-matchmaker-prefill" id="crm-matchmaker-prefill">' +
      '<p class="crm-matchmaker-prefill__tag">來自 Tab ④ 教牧約談桌 · 預填包</p>' +
      "<h4>" +
      esc(modeLabel) +
      esc(name) +
      "</h4>" +
      '<p class="crm-matchmaker-prefill__lead">來源：<strong>' +
      esc(toolLabel) +
      "</strong> · 建議部門已自動選取。請審核後再複製或登記試任 — <strong>不會自動寫入 CRM</strong>。</p>" +
      cardsHtml +
      (prefill.open_role && prefill.open_role.name_zh
        ? '<p class="crm-matchmaker-prefill__open-role">💡 對接急缺：「' +
          esc(prefill.open_role.dept_title || "") +
          "」【" +
          esc(prefill.open_role.name_zh) +
          "】（缺 " +
          esc(String(prefill.open_role.gap || "?")) +
          " 人）</p>"
        : "") +
      (prefill.pastoral_invite
        ? '<details class="crm-matchmaker-prefill__fold" open><summary>✉️ 邀請信草稿</summary><pre class="crm-matchmaker-prefill__pre">' +
          esc(prefill.pastoral_invite) +
          "</pre></details>"
        : "") +
      (prefill.ai_instruction
        ? '<details class="crm-matchmaker-prefill__fold"><summary>🤖 AI 靈性同工指令</summary><pre class="crm-matchmaker-prefill__pre">' +
          esc(prefill.ai_instruction) +
          "</pre></details>"
        : "") +
      '<div class="crm-matchmaker-prefill__actions">' +
      '<button type="button" class="crm-btn-ghost" id="btnCopyMatchmakerPrefill">📋 複製完整預填包</button>' +
      '<button type="button" class="crm-btn-ghost" id="btnDismissMatchmakerPrefill">✕ 收起預填包（仍保留本機草稿）</button>' +
      "</div></section>"
    );
  }

  function renderHtml(options) {
    options = options || {};
    var prefill =
      options.prefill ||
      (global.MatchmakerPrefill && typeof global.MatchmakerPrefill.load === "function" && global.MatchmakerPrefill.load());
    var prefillMode = options.mode || (prefill && prefill.mode) || "";
    var store = options.store || global.AssessmentRunStore;
    var runs = loadLatestRuns(store);
    var pathInfo = pickPathCards(runs);
    var MP = global.MinistryPathBridge;
    var disclaimer =
      MP && MP.PATH_TIER_COPY
        ? MP.PATH_TIER_COPY.disclaimer
        : "部署須牧者 HITL 確認，系統不會自動 CRM 派工。";

    var statusRows = TOOL_ORDER.map(function (id) {
      var r = runs[id];
      var ok = !!r;
      return (
        "<li>" +
        (ok ? "✅" : "⬜") +
        " " +
        esc(TOOL_LABELS[id]) +
        (ok && r.path_cards && r.path_cards.length ? " · 含出路卡" : "") +
        "</li>"
      );
    }).join("");

    var cardsHtml;
    if (pathInfo.cards.length && MP && MP.renderPathCardsHtml) {
      cardsHtml = MP.renderPathCardsHtml(pathInfo.cards);
    } else if (pathInfo.cards.length) {
      cardsHtml = "<p>" + pathInfo.cards.length + " 張出路卡（請載入 MinistryPathBridge）</p>";
    } else {
      cardsHtml =
        '<p class="crm-path-hitl__empty">尚無本機 assessment_run。請先填 ' +
        '<a class="crm-journey-link" href="../church_planning/shape-gifts-assessment.html">SHAPE 恩賜量表</a>，' +
        "再填 Johari / DISC / MBTI。</p>";
    }

    return (
      renderPrefillBanner(prefill, prefillMode) +
      '<section class="crm-path-hitl" id="crm-path-hitl-panel">' +
      "<h4>🧭 MinistryPathBridge · 出路卡（HITL 派任參考）</h4>" +
      '<p class="crm-path-hitl__lead">' +
      esc(disclaimer) +
      "</p>" +
      (global.MinistryPathWorkflow
        ? '<div class="crm-path-hitl__workflow">' + MinistryPathWorkflow.renderHtml({ compact: true, store: store }) + "</div>"
        : "") +
      '<ul class="crm-path-hitl__status">' +
      statusRows +
      "</ul>" +
      '<div class="crm-path-hitl__cards">' +
      cardsHtml +
      "</div>" +
      '<div class="crm-path-hitl__actions">' +
      '<button type="button" class="crm-btn-ghost" id="btnCopyPathDeployDraft">📋 複製派任草稿（供約談）</button>' +
      '<button type="button" class="crm-btn-ghost" id="btnMarkPathPastoralReview">✔ 標記「牧者已約談」（本機）</button>' +
      '<a class="crm-journey-link crm-btn-ghost" href="../church_planning/shape-gifts-assessment.html">↗ 回 SHAPE 填寫</a>' +
      '<a class="crm-journey-link crm-btn-ghost" href="../church_planning/cta-os-war-room.html">↗ 健康雷達戰情室</a>' +
      "</div>" +
      '<p class="crm-path-hitl__note" id="crm-path-hitl-review-note"></p>' +
      "</section>"
    );
  }

  function bindPanel(root, options) {
    root = root || global.document.getElementById("crm-path-hitl-panel");
    if (!root) return;
    options = options || {};
    var store = options.store || global.AssessmentRunStore;
    var runs = loadLatestRuns(store);
    var pathInfo = pickPathCards(runs);
    var draft = buildDeployDraft(runs, pathInfo);
    var prefill =
      options.prefill ||
      (global.MatchmakerPrefill && typeof global.MatchmakerPrefill.load === "function" && global.MatchmakerPrefill.load());
    var prefillRoot = root.parentElement;

    var copyPrefillBtn = prefillRoot && prefillRoot.querySelector("#btnCopyMatchmakerPrefill");
    if (copyPrefillBtn && prefill && global.MatchmakerPrefill) {
      copyPrefillBtn.addEventListener("click", function () {
        var pkg = MatchmakerPrefill.buildFullPackage(prefill);
        if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
          global.navigator.clipboard.writeText(pkg).then(function () {
            global.alert("已複製完整預填包，請審核後再約談或登記試任。");
          });
        } else {
          global.alert(pkg);
        }
      });
    }
    var dismissPrefillBtn = prefillRoot && prefillRoot.querySelector("#btnDismissMatchmakerPrefill");
    if (dismissPrefillBtn) {
      dismissPrefillBtn.addEventListener("click", function () {
        var banner = prefillRoot.querySelector("#crm-matchmaker-prefill");
        if (banner) banner.hidden = true;
      });
    }

    var copyBtn = root.querySelector("#btnCopyPathDeployDraft");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
          global.navigator.clipboard.writeText(draft).then(function () {
            global.alert("已複製派任草稿，請審核後再約談或登記試任。");
          });
        } else {
          global.alert(draft);
        }
      });
    }

    var markBtn = root.querySelector("#btnMarkPathPastoralReview");
    var noteEl = root.querySelector("#crm-path-hitl-review-note");
    var reviewKey = "bible100_path_hitl_reviewed";
    try {
      var prev = global.localStorage.getItem(reviewKey);
      if (prev && noteEl) noteEl.textContent = "上次標記牧者約談：" + prev;
    } catch (e) {}

    if (markBtn) {
      markBtn.addEventListener("click", function () {
        var stamp = new Date().toLocaleString();
        try {
          global.localStorage.setItem(reviewKey, stamp);
        } catch (e2) {}
        if (noteEl) noteEl.textContent = "已標記牧者約談（本機）：" + stamp + " — 仍須在 CRM 正式登記。";
      });
    }
  }

  function mount(container, options) {
    if (!container) return;
    options = options || {};
    container.insertAdjacentHTML("afterbegin", renderHtml(options));
    bindPanel(container.querySelector("#crm-path-hitl-panel"), options);
    if (global.MinistryPathBridge && MinistryPathBridge.bindOpenRoleButtons) {
      var pathInfo = pickPathCards(options.store || global.AssessmentRunStore);
      if (pathInfo.cards && MinistryPathBridge.attachOpenRolesToCards) {
        MinistryPathBridge.attachOpenRolesToCards(pathInfo.cards);
      }
      MinistryPathBridge.bindOpenRoleButtons(container, pathInfo.source || "shape", pathInfo.run);
    }
  }

  global.PathCardsHitlPanel = {
    TOOL_ORDER: TOOL_ORDER,
    loadLatestRuns: loadLatestRuns,
    pickPathCards: pickPathCards,
    buildDeployDraft: buildDeployDraft,
    renderPrefillBanner: renderPrefillBanner,
    renderHtml: renderHtml,
    bindPanel: bindPanel,
    mount: mount
  };
})(typeof window !== "undefined" ? window : global);
