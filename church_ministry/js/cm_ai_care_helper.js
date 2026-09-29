/**
 * CM · 牧養 AI 護欄卡片（規則模板 · draft-first · 非考核依據）
 */
(function (global) {
  "use strict";

  var FOOTER =
    "僅供牧養參考，非紀律或考核依據。關懷行動須由同工／小組長／牧者親自確認後執行。";

  function buildAbsenceCareText(name, streak, context) {
    name = name || "弟兄姊妹";
    streak = streak || 3;
    context = context || "小組聚會";
    return (
      "【關懷提示 · 待審】\n" +
      name +
      " 在「" +
      context +
      "」已連續 " +
      streak +
      " 次未到。建議由與其熟識的小組長或區長發送一則簡短關懷訊息，了解是否家庭、工作、健康或其他壓力。" +
      "可先電話或短訊，不必急於論斷；若需探訪，請一鍵推送至探訪佇列後由關懷團隊接案。"
    );
  }

  function renderCareCard(host, opts) {
    host = typeof host === "string" ? global.document.getElementById(host) : host;
    if (!host) return;
    opts = opts || {};
    var body = buildAbsenceCareText(opts.name, opts.streak, opts.context);
    host.innerHTML =
      "<strong>🕊️ 牧養小幫手</strong>" +
      "<p style='margin:8px 0 0;white-space:pre-wrap'>" +
      body.replace(/</g, "&lt;") +
      "</p>" +
      "<footer>" +
      FOOTER +
      "</footer>";
    host.hidden = false;
  }

  function nlqChips() {
    return [
      { id: "absence_2", label: "缺席≥2 次", filter: "absence_streak_ge_2" },
      { id: "at_risk", label: "流失預警", filter: "lifecycle_at_risk" },
      { id: "no_group", label: "未入小組", filter: "no_group" },
      { id: "newcomer", label: "新朋友", filter: "lifecycle_newcomer" },
      { id: "pending_ho", label: "待推送探訪", filter: "handover_pending" }
    ];
  }

  function renderNlqChips(hostId, onSelect) {
    var host = global.document.getElementById(hostId);
    if (!host) return;
    host.innerHTML = "";
    var label = global.document.createElement("span");
    label.textContent = "快速查詢：";
    label.style.fontWeight = "600";
    label.style.marginRight = "6px";
    host.appendChild(label);
    nlqChips().forEach(function (chip) {
      var btn = global.document.createElement("button");
      btn.type = "button";
      btn.className = "cm-shell-btn cm-touch-target";
      btn.style.cssText =
        "background:#fff;color:#334155;border:1px solid #cbd5e1;min-height:36px;padding:6px 10px";
      btn.textContent = chip.label;
      btn.onclick = function () {
        if (typeof onSelect === "function") onSelect(chip);
      };
      host.appendChild(btn);
    });
  }

  global.CmAiCareHelper = {
    FOOTER: FOOTER,
    buildAbsenceCareText: buildAbsenceCareText,
    renderCareCard: renderCareCard,
    nlqChips: nlqChips,
    renderNlqChips: renderNlqChips
  };
})(typeof window !== "undefined" ? window : this);
