/**
 * AI Lab · 延遲載入外部 iframe（加速 file:// 殼內舊頁）
 * 用法：容器加 data-ai-lazy-src="https://..." 或 data-ai-lazy-platform="kimi"
 */
(function (global, doc) {
  "use strict";

  var PLATFORMS = {
    kimi: "https://www.kimi.com/",
    grok: "https://x.ai/",
    qianyi: "https://chat.qianyiwen.com",
    chatgpt: "https://chat.openai.com/",
    gemini: "https://gemini.google.com/",
  };

  function mountLazy(container) {
    if (!container || container.getAttribute("data-ai-lazy-mounted") === "1") return;
    container.setAttribute("data-ai-lazy-mounted", "1");
    container.innerHTML =
      '<div class="ai-lazy-placeholder" style="padding:24px 16px;text-align:center;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;font-size:12px;line-height:1.6;color:#475569;">' +
      "<p style=\"margin:0 0 10px;\"><strong>⚡ 外部 AI 平台</strong> 按需载入，加快本页打开。</p>" +
      '<button type="button" class="ai-lazy-load-btn" style="padding:8px 16px;border:none;border-radius:8px;background:#5b21b6;color:#fff;font-weight:600;cursor:pointer;font-size:12px;">载入平台预览</button>' +
      '<p style="margin:10px 0 0;font-size:10px;color:#64748b;">若无法显示，请复制 Prompt 后「新分页打开」平台。</p></div>';
    var btn = container.querySelector(".ai-lazy-load-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var src =
        container.getAttribute("data-ai-lazy-src") ||
        PLATFORMS[container.getAttribute("data-ai-lazy-platform") || ""] ||
        "";
      if (!src) return;
      container.innerHTML =
        '<iframe src="' +
        src.replace(/"/g, "&quot;") +
        '" style="width:100%;height:100%;min-height:420px;border:0;background:#fff;" loading="lazy" title="AI platform"></iframe>';
    });
  }

  function boot() {
    doc.querySelectorAll("[data-ai-lazy-src], [data-ai-lazy-platform]").forEach(mountLazy);
    doc.querySelectorAll("#aiFrame, #imgPlatformHost, .ai-platform-frame-host").forEach(function (el) {
      if (el.tagName === "IFRAME" && el.src && !el.getAttribute("data-ai-lazy-kept")) {
        var src = el.src;
        el.removeAttribute("src");
        el.style.display = "none";
        var wrap = doc.createElement("div");
        wrap.className = "ai-platform-frame-host";
        wrap.setAttribute("data-ai-lazy-src", src);
        wrap.style.cssText = "width:100%;min-height:420px;";
        if (el.parentNode) {
          el.parentNode.insertBefore(wrap, el);
          mountLazy(wrap);
        }
      }
    });
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();

  global.B100AiLazyFrame = { mountLazy: mountLazy, PLATFORMS: PLATFORMS };
})(typeof window !== "undefined" ? window : this, document);
