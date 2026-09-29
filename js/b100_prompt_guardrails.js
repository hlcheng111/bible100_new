/**
 * B100 Prompt 護欄 · 全站 SSOT（AI Lab W2）
 * 生成 Prompt 時強制附加；不可宣稱屬靈權威、須人審。
 */
(function (g) {
  "use strict";

  var FOOTER_ZH =
    "\n\n---\n【B100 護欄 · 請遵守】\n" +
    "1. 引用经义须标明圣经版本与章节；不确定处请明说需查证，不可编造经文。\n" +
    "2. 输出仅为教学/事工草稿，须由老师/牧者人工审核后使用，不取代牧养或神学权威。\n" +
    "3. 涉及个人或敏感资料时，勿写入公开 AI 训练；本机资料不上云。\n" +
    "4. 小语种输出请保留中文源意或中英对照，方便回查。";

  var FOOTER_EN =
    "\n\n---\n[B100 Guardrails]\n" +
    "Cite Scripture with version/chapter; never invent verses. Draft only—human review required. " +
    "No pastoral/theological authority claims. Protect PII; keep local data offline.";

  function wrapPrompt(body, opts) {
    opts = opts || {};
    body = String(body || "").trim();
    if (!body) return body;
    if (body.indexOf("B100 護欄") >= 0 || body.indexOf("B100 Guardrails") >= 0) return body;
    return body + (opts.en ? FOOTER_EN : FOOTER_ZH);
  }

  g.B100PromptGuardrails = {
    wrap: wrapPrompt,
    footerZh: FOOTER_ZH,
    footerEn: FOOTER_EN,
  };
})(typeof window !== "undefined" ? window : this);
