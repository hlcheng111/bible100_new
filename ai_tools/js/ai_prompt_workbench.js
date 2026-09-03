/**
 * AI Lab · Prompt 工作台 UI（情境 / 護欄 / 複製 / 外發 / 預設 / 匯入）
 */
(function (g, doc) {
  "use strict";

  var state = { prompt: "", bridge: null, scenarioId: null };

  function $(id) {
    return doc.getElementById(id);
  }

  function loadTemplates(cb) {
    if (g.AI_PROMPT_TEMPLATES_EMBEDDED && g.AI_PROMPT_TEMPLATES_EMBEDDED.themes) {
      cb(g.AI_PROMPT_TEMPLATES_EMBEDDED);
      return;
    }
    fetch("../templates/bible_prompts.json")
      .then(function (r) {
        return r.ok ? r.json() : Promise.reject(new Error("fetch"));
      })
      .then(cb)
      .catch(function () {
        cb({ themes: [] });
      });
  }

  function setPrompt(text, meta) {
    meta = meta || {};
    var wrapped = g.B100PromptGuardrails ? B100PromptGuardrails.wrap(text) : text;
    state.prompt = wrapped;
    state.bridge = meta.bridge || null;
    state.scenarioId = meta.scenarioId || null;
    var box = $("ai-wb-result");
    if (box) box.textContent = wrapped;
    renderBridgeBar();
    renderStepHint(true);
  }

  function renderStepHint(copied) {
    var el = $("ai-wb-step-hint");
    if (!el) return;
    el.className = copied ? "ai-wb-steps ai-wb-steps--done" : "ai-wb-steps";
    el.innerHTML =
      '<div class="ai-wb-step"><span>1</span> 站内填表 / 选情境</div>' +
      '<div class="ai-wb-step-arrow">→</div>' +
      '<div class="ai-wb-step"><span>2</span> 点击「复制 Prompt」</div>' +
      '<div class="ai-wb-step-arrow">→</div>' +
      '<div class="ai-wb-step"><span>3</span> 打开常用 AI · Ctrl+V 粘贴</div>' +
      '<div class="ai-wb-step-arrow">→</div>' +
      '<div class="ai-wb-step"><span>4</span> 人审后 · 一键汇入事工桌</div>';
  }

  function copyPrompt() {
    var text = state.prompt || ($("ai-wb-result") && $("ai-wb-result").textContent) || "";
    text = String(text).trim();
    if (!text || text.indexOf("生成的Prompt") >= 0) {
      alert("请先生成 Prompt！");
      return Promise.reject(new Error("empty"));
    }
    if (g.navigator.clipboard && g.navigator.clipboard.writeText) {
      return g.navigator.clipboard.writeText(text).then(function () {
        renderStepHint(true);
        flashToast("✅ 已复制！请打开下方 AI 平台粘贴（Ctrl+V）");
      });
    }
    alert("请手动选取下方文字复制。");
    return Promise.resolve();
  }

  function flashToast(msg) {
    var t = $("ai-wb-toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    setTimeout(function () {
      t.hidden = true;
    }, 4500);
  }

  function openPlatform(p) {
    copyPrompt()
      .then(function () {
        g.open(p.url, "_blank", "noopener,noreferrer");
        flashToast("已复制并在新分页打开 " + p.label + " · 请 Ctrl+V 粘贴");
      })
      .catch(function () {});
  }

  function renderPlatforms() {
    var host = $("ai-wb-platforms");
    if (!host || !g.AiScenarioSsot) return;
    host.innerHTML = g.AiScenarioSsot.PLATFORMS.map(function (p) {
      return (
        '<button type="button" class="ai-wb-platform-btn cm-touch-target" data-pid="' +
        p.id +
        '" style="border-color:' +
        p.color +
        '">' +
        "去 " +
        p.label +
        " 生成 →</button>"
      );
    }).join("");
    host.querySelectorAll("[data-pid]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-pid");
        var pl = g.AiScenarioSsot.PLATFORMS.filter(function (x) {
          return x.id === id;
        })[0];
        if (pl) openPlatform(pl);
      };
    });
  }

  function renderScenarios() {
    var host = $("ai-wb-scenarios");
    if (!host || !g.AiScenarioSsot) return;
    host.innerHTML = g.AiScenarioSsot.SCENARIOS.map(function (s) {
      return (
        '<button type="button" class="ai-wb-scenario-btn cm-touch-target" data-sid="' +
        s.id +
        '">' +
        '<span class="em">' +
        s.emoji +
        "</span>" +
        "<span>" +
        s.label +
        "</span></button>"
      );
    }).join("");
    host.querySelectorAll("[data-sid]").forEach(function (btn) {
      btn.onclick = function () {
        var sc = g.AiScenarioSsot.byId(btn.getAttribute("data-sid"));
        if (!sc) return;
        setPrompt(sc.prompt, { bridge: sc.bridge, scenarioId: sc.id });
        if ($("ai-wb-custom")) $("ai-wb-custom").value = sc.prompt.split("\n[在此")[0];
        flashToast("已载入情境 · 可微调后点「生成」或直接复制");
      };
    });
  }

  function renderBridgeBar() {
    if (!g.AiMinistryBridge) return;
    var text = state.prompt;
    var def = state.bridge;
    AiMinistryBridge.renderImportBar("ai-wb-bridge", text, def);
  }

  function renderPresets() {
    var host = $("ai-wb-presets");
    if (!host || !g.AiPromptPresets) return;
    var list = AiPromptPresets.list();
    if (!list.length) {
      host.innerHTML = '<p class="muted">尚无自订范本 · 生成后可点「储存我的常用范本」</p>';
      return;
    }
    host.innerHTML = list
      .map(function (p) {
        return (
          '<button type="button" class="ai-wb-preset-chip cm-touch-target" data-pid="' +
          p.id +
          '">' +
          p.title +
          "</button>"
        );
      })
      .join("");
    host.querySelectorAll("[data-pid]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-pid");
        var p = AiPromptPresets.list().filter(function (x) {
          return x.id === id;
        })[0];
        if (p) setPrompt(p.body, { bridge: p.bridge });
      };
    });
  }

  function bindForm(themes) {
    var themeSel = $("ai-wb-theme");
    var typeSel = $("ai-wb-type");
    if (!themeSel) return;
    themes.forEach(function (th) {
      var o = doc.createElement("option");
      o.value = th.name;
      o.textContent = th.name;
      themeSel.appendChild(o);
    });
    themeSel.onchange = function () {
      var th = themes.filter(function (t) {
        return t.name === themeSel.value;
      })[0];
      typeSel.innerHTML = '<option value="">— 选择类型 —</option>';
      if (!th) return;
      th.templates.forEach(function (tpl) {
        var o = doc.createElement("option");
        o.value = tpl.type;
        o.textContent = tpl.type;
        typeSel.appendChild(o);
      });
    };
    $("ai-wb-generate") &&
      ($("ai-wb-generate").onclick = function () {
        var th = themes.filter(function (t) {
          return t.name === themeSel.value;
        })[0];
        var typ = typeSel.value;
        if (!th || !typ) {
          alert("请选择主题与类型，或点上方情境按钮。");
          return;
        }
        var tpl = th.templates.filter(function (t) {
          return t.type === typ;
        })[0];
        if (tpl) setPrompt(tpl.content, { bridge: "education_quiz" });
      });
    $("ai-wb-custom-generate") &&
      ($("ai-wb-custom-generate").onclick = function () {
        var raw = ($("ai-wb-custom") && $("ai-wb-custom").value) || "";
        if (!raw.trim()) {
          alert("请输入自订需求。");
          return;
        }
        setPrompt(raw.trim(), { bridge: state.bridge || "education_quiz" });
      });
    $("ai-wb-copy") && ($("ai-wb-copy").onclick = copyPrompt);
    $("ai-wb-save-preset") &&
      ($("ai-wb-save-preset").onclick = function () {
        var title = prompt("范本名称", "我的备课范本");
        if (!title) return;
        AiPromptPresets.save({
          title: title,
          body: state.prompt,
          bridge: state.bridge,
        });
        renderPresets();
        flashToast("已储存范本");
      });
  }

  function applyUrlParams() {
    try {
      var sp = new URLSearchParams(g.location.search);
      var sid = sp.get("scenario");
      if (sid && g.AiScenarioSsot) {
        var sc = AiScenarioSsot.byId(sid);
        if (sc) setPrompt(sc.prompt, { bridge: sc.bridge, scenarioId: sid });
      }
    } catch (e) {}
  }

  function init() {
    renderScenarios();
    renderPlatforms();
    renderPresets();
    renderStepHint(false);
    loadTemplates(function (data) {
      bindForm(data.themes || []);
      applyUrlParams();
    });
  }

  g.AiPromptWorkbench = { init: init, setPrompt: setPrompt, copyPrompt: copyPrompt };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
