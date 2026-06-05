(function () {
  function getApiBase() {
    var q = new URL(window.location.href).searchParams.get("apiBase");
    if (q) return q;
    return localStorage.getItem("b100_v2_api_base") || "";
  }

  function fetchJson(url) {
    return fetch(url).then(function (r) { return r.json(); });
  }

  function ensureRoot(id, className) {
    var root = document.getElementById(id);
    if (!root) {
      root = document.createElement("div");
      root.id = id;
      if (className) root.className = className;
    }
    return root;
  }

  function wireIndexV5Shell() {
    var apiBase = getApiBase();
    if (!apiBase) return;
    var host = document.getElementById("contextBar");
    if (!host) return;

    var observer = new MutationObserver(function () {
      hydrateContextBar(host, apiBase);
    });
    observer.observe(host, { childList: true, subtree: true });
    hydrateContextBar(host, apiBase);
  }

  function hydrateContextBar(host, apiBase) {
    var existing = host.querySelector("#ssot-context-shortcuts");
    if (existing) existing.remove();
    var activeBtn = document.querySelector(".mode-btn.active");
    var mode = activeBtn ? activeBtn.getAttribute("data-mode") : "material";
    fetchJson(apiBase + "?action=getNavigationMap&module=" + encodeURIComponent(mode))
      .then(function (json) {
        if (!json.ok || !Array.isArray(json.data) || !json.data.length) return;
        var rows = json.data.slice(0, 4);
        var root = ensureRoot("ssot-context-shortcuts", "ssot-context-shortcuts");
        root.style.display = "inline-flex";
        root.style.gap = "6px";
        root.style.marginLeft = "8px";
        rows.forEach(function (row) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "sub-btn";
          btn.textContent = row.label_zh || row.label_en || row.nav_id;
          btn.onclick = function () {
            if (row.target_url) {
              var frame = document.getElementById("contentFrame");
              if (frame) frame.src = row.target_url;
            }
          };
          root.appendChild(btn);
        });
        host.appendChild(root);
      })
      .catch(function () {});
  }

  function wireAiToolsIndex() {
    var apiBase = getApiBase();
    if (!apiBase) return;
    var container = document.getElementById("container");
    if (!container) return;
    fetchJson(apiBase + "?action=getAiToolsConfig&module=ai")
      .then(function (json) {
        if (!json.ok || !Array.isArray(json.data) || !json.data.length) return;
        var top = ensureRoot("ssot-ai-tools-shortcuts", "ssot-ai-tools-shortcuts");
        top.style.position = "fixed";
        top.style.right = "12px";
        top.style.top = "12px";
        top.style.zIndex = "9999";
        top.style.background = "rgba(255,255,255,0.95)";
        top.style.border = "1px solid #d9e6f2";
        top.style.borderRadius = "8px";
        top.style.padding = "8px";
        top.style.maxWidth = "300px";

        var title = document.createElement("div");
        title.textContent = "Sheets AI 工具捷徑";
        title.style.fontWeight = "bold";
        title.style.marginBottom = "6px";
        top.appendChild(title);

        json.data.slice(0, 6).forEach(function (item) {
          var link = document.createElement("a");
          link.href = item.target_url || "#";
          link.target = "contentFrame";
          link.rel = "noopener";
          link.style.display = "block";
          link.style.fontSize = "12px";
          link.style.marginBottom = "4px";
          link.textContent = "• " + (item.label_zh || item.label_en || item.name || item.tool_id);
          top.appendChild(link);
        });
        document.body.appendChild(top);
      })
      .catch(function () {});
  }

  window.B100SSOTBridge = {
    wireIndexV5Shell: wireIndexV5Shell,
    wireAiToolsIndex: wireAiToolsIndex
  };
})();
