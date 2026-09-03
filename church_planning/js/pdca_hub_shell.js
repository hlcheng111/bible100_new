/**
 * Phase 3 · PDCA 頁 Hub 快照 UI（Plan/Check/Act 閉環）
 */
(function (global) {
  "use strict";

  function B() {
    return global.PdcaHubBridge;
  }

  function toast(msg) {
    if (global.PdcaAcsShell && PdcaAcsShell.showToast) PdcaAcsShell.showToast(msg);
    else global.alert(msg);
  }

  function copyText(text) {
    if (global.DoPlanFeedback && DoPlanFeedback.copyPdcaCheckText) {
      return DoPlanFeedback.copyPdcaCheckText(text);
    }
    return Promise.reject(new Error("clipboard unavailable"));
  }

  function renderManpowerCard() {
    var el = global.document.getElementById("pdca-hub-manpower-card");
    if (!el || !B()) return;
    var snap = B().computeManpowerSnapshot();
    if (!snap.ok) {
      el.classList.add("hidden");
      return;
    }
    var t = snap.totals;
    var zoneHtml =
      snap.zone_shortage && snap.zone_shortage.length
        ? "<ul style='margin:8px 0 0;padding-left:1.1rem;font-size:0.85rem;line-height:1.55'>" +
          snap.zone_shortage
            .slice(0, 5)
            .map(function (z) {
              return (
                "<li><strong>" +
                B().esc(z.label) +
                "</strong>：缺 " +
                z.vacant +
                " · 已配 " +
                z.assigned +
                "/" +
                z.headcount_gap +
                "</li>"
              );
            })
            .join("") +
          "</ul>"
        : "<p style='margin:8px 0 0;font-size:0.85rem'>尚無崗位缺口資料；可先從教會事工提交需求。</p>";

    el.innerHTML =
      "<p style='margin:0 0 6px;font-size:0.9rem;color:#065f46'><strong>📊 本季人力自動盤點</strong>（Hub Base · 非考核）</p>" +
      "<p style='margin:0;font-size:0.82rem;line-height:1.55;color:#334155'>人才 <strong>" +
      t.talents +
      "</strong> · 崗位 <strong>" +
      t.ministries +
      "</strong> · 配對 <strong>" +
      t.assignments +
      "</strong> · 空缺率 <strong>" +
      t.vacancy_rate_pct +
      "%</strong> · 穩定度 <strong>" +
      t.stability_pct +
      "%</strong></p>" +
      zoneHtml +
      "<div style='margin-top:10px;display:flex;flex-wrap:wrap;gap:8px'>" +
      "<button type='button' class='acs-btn acs-btn--primary' id='pdca-hub-copy-plan'>複製到 Plan</button>" +
      "<button type='button' class='acs-btn' id='pdca-hub-copy-check'>複製到 Check</button>" +
      "</div>";
    el.classList.remove("hidden");

    var planBtn = global.document.getElementById("pdca-hub-copy-plan");
    var checkBtn = global.document.getElementById("pdca-hub-copy-check");
    if (planBtn && !planBtn.__bound) {
      planBtn.__bound = true;
      planBtn.addEventListener("click", function () {
        copyText(B().formatPlanText(snap)).then(function () {
          toast("已複製 Plan 人力摘要");
        });
      });
    }
    if (checkBtn && !checkBtn.__bound) {
      checkBtn.__bound = true;
      checkBtn.addEventListener("click", function () {
        copyText(B().formatCheckText(snap)).then(function () {
          toast("已複製 Check 自動摘要");
        });
      });
    }
  }

  function renderActCard() {
    var el = global.document.getElementById("pdca-hub-act-card");
    if (!el || !B()) return;
    var snap = B().computeManpowerSnapshot();
    var last = B().loadLastAct();
    var lastLine = last
      ? "<p style='font-size:0.78rem;color:#64748b;margin:0 0 8px'>上次 Act：" +
        B().esc((last.applied_at || "").slice(0, 16).replace("T", " ")) +
        " · 更新 " +
        (last.updated_ministries || 0) +
        " 崗</p>"
      : "";

    el.innerHTML =
      "<h3 style='margin:0 0 8px;font-size:1rem;color:#312e81'>Act · 套用調整並重新配對</h3>" +
      "<p style='margin:0 0 10px;font-size:0.85rem;line-height:1.55;color:#475569'>將缺額優先區崗位標為<strong>高優先</strong>，寫入工庫並留審計；<strong>不會自動派工</strong>，下一步請到配對工作台人工確認。</p>" +
      lastLine +
      "<div style='display:flex;flex-wrap:wrap;gap:8px'>" +
      "<button type='button' class='acs-btn acs-btn--primary' id='pdca-hub-act-apply'>套用調整 → 開啟配對</button>" +
      "<a class='acs-btn no-underline' href='../church_ministry/demand-form.html' target='contentFrame'>提交新崗位需求</a>" +
      "<a class='acs-btn no-underline' href='../smart_ministry/talent_ministry_matching.html?from=pdca' target='contentFrame'>配對工作台</a>" +
      "<a class='acs-btn no-underline' href='../hub-audit-viewer.html' target='_blank' rel='noopener'>審計日誌</a>" +
      "</div>";
    el.classList.remove("hidden");

    var btn = global.document.getElementById("pdca-hub-act-apply");
    if (btn && !btn.__bound) {
      btn.__bound = true;
      btn.addEventListener("click", function () {
        if (
          !global.confirm(
            "將依本季缺額更新工庫優先度，並帶您到配對工作台（仍須人工確認邀請）。確定嗎？"
          )
        ) {
          return;
        }
        var res = B().applyActAndPrepareMatching({ note: "PDCA Act 一鍵套用" });
        if (!res.ok) {
          toast(res.error === "forbidden" ? "請切換為事工負責人或管理員角色" : "套用失敗");
          return;
        }
        toast("已更新 " + res.updated_ministries + " 個崗位 · 正在開啟配對…");
        renderActCard();
        renderManpowerCard();
        if (global.location && res.matchingUrl) {
          setTimeout(function () {
            global.location.href = res.matchingUrl;
          }, 600);
        }
      });
    }
  }

  function init() {
    if (!B()) return;
    renderManpowerCard();
    renderActCard();
  }

  global.PdcaHubShell = { init: init, renderManpowerCard: renderManpowerCard, renderActCard: renderActCard };

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : global);
