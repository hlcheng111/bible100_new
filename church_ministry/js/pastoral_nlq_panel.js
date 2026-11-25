/**
 * B 牧養殼 · 導遊條 + 快速查詢結果面板
 */
(function (global, doc) {
  "use strict";

  function $(id) {
    return doc.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function switchTab(tab) {
    if (global.PastoralIntegratedShell && global.PastoralIntegratedShell.switchTab) {
      global.PastoralIntegratedShell.switchTab(tab);
    }
  }

  function renderGuide() {
    var host = $("past-guide-banner");
    if (!host) return;
    host.innerHTML =
      '<div class="past-guide">' +
      '<p class="past-guide__where"><strong>今日一件事：</strong>幫小組點完名，再睇邊個需要關心。</p>' +
      '<p class="past-guide__what">今晚小組邊個缺席咗？我哋一齊去關心佢——系統只會提示，<strong>唔會自動打電話</strong>。若名單好空，可先載入試用教會。</p>' +
      '<div class="past-guide__actions">' +
      '<button type="button" class="past-guide__cta" id="past-btn-go-checkin">開始今晚點名 →</button>' +
      '<button type="button" class="past-guide__cta past-guide__cta--secondary" id="past-btn-trial">載入試用教會（約 40 人）</button>' +
      '<a class="past-guide__cta past-guide__cta--secondary" href="../../docs/ATTENDANCE_OPS_HANDBOOK.html" style="display:inline-flex;align-items:center;text-decoration:none;">出席系統說明</a>' +
      "</div>" +
      '<div class="past-guide__warm" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">' +
      '<button type="button" class="past-guide__cta past-guide__cta--secondary" id="past-btn-go-alerts" style="margin:0;">溫馨提示：邊個連續冇嚟？</button>' +
      '<button type="button" class="past-guide__cta past-guide__cta--secondary" id="past-btn-go-visit" style="margin:0;">待我確認嘅關心名單</button>' +
      "</div>" +
      '<p class="past-guide__meta" id="past-trial-meta"></p>' +
      "</div>";

    var meta = $("past-trial-meta");
    try {
      var raw = global.localStorage.getItem("bible100_pastoral_trial_meta");
      if (raw && meta) {
        var m = JSON.parse(raw);
        meta.textContent =
          "上次試用包：會友 " +
          (m.members || "—") +
          " · 小組 " +
          (m.groups || "—") +
          " · 預警 " +
          (m.alerts || 0) +
          " · 待探訪 " +
          (m.pending || 0);
      }
    } catch (e) {}

    $("past-btn-trial") &&
      ($("past-btn-trial").onclick = function () {
        var pack = global.PastoralTrialPack || global.PastoralDataHub;
        if (!pack || !pack.ensureTrialChurch) {
          alert("試用包未載入，請重新整理頁面。");
          return;
        }
        var res = pack.ensureTrialChurch(true);
        if (global.PastoralIntegratedShell && global.PastoralIntegratedShell.renderOverview) {
          global.PastoralIntegratedShell.renderOverview();
        }
        renderGuide();
        showResults({
          title: "試用教會已載入",
          rows: [
            {
              name: "會友 " + res.members + " 人 · 小組 " + res.groups,
              detail: "預警 " + res.alerts + " · 待探訪 " + res.pending + " — 可撳下方快速查詢",
              action: "attendance"
            }
          ],
          tab: "attendance"
        });
        alert(
          "好嘢！已載入約 " +
            res.members +
            " 位試用會友。\n可以撳「開始今晚點名」繼續。"
        );
      });

    $("past-btn-go-checkin") &&
      ($("past-btn-go-checkin").onclick = function () {
        switchTab("attendance");
      });
    $("past-btn-go-alerts") &&
      ($("past-btn-go-alerts").onclick = function () {
        switchTab("alerts");
      });
    $("past-btn-go-visit") &&
      ($("past-btn-go-visit").onclick = function () {
        switchTab("visitation");
      });
  }

  function showResults(pack) {
    var host = $("past-nlq-results");
    if (!host) return;
    pack = pack || { title: "", rows: [], tab: "groups" };
    var rows = pack.rows || [];
    if (!rows.length) {
      host.hidden = false;
      host.innerHTML =
        '<div class="past-nlq-box">' +
        "<strong>" +
        esc(pack.title || "查詢結果") +
        "</strong>" +
        '<p class="muted">目前沒有符合條件的人。若名冊是空的，可先載入試用教會，或到 ② 點名累積出席。</p>' +
        '<button type="button" class="cm-shell-btn" id="past-nlq-load">載入試用教會</button> ' +
        '<button type="button" class="cm-shell-btn" id="past-nlq-goto" data-tab="' +
        esc(pack.tab || "groups") +
        '">仍開啟相關 Tab</button>' +
        "</div>";
      $("past-nlq-load") &&
        ($("past-nlq-load").onclick = function () {
          $("past-btn-trial") && $("past-btn-trial").click();
        });
      $("past-nlq-goto") &&
        ($("past-nlq-goto").onclick = function () {
          switchTab($("past-nlq-goto").getAttribute("data-tab"));
        });
      return;
    }
    host.hidden = false;
    host.innerHTML =
      '<div class="past-nlq-box">' +
      "<strong>" +
      esc(pack.title) +
      "</strong> <span class=\"muted\">共 " +
      rows.length +
      " 人</span>" +
      '<table class="past-nlq-table"><thead><tr><th>姓名</th><th>說明</th><th></th></tr></thead><tbody>' +
      rows
        .slice(0, 40)
        .map(function (r) {
          return (
            "<tr><td>" +
            esc(r.name) +
            "</td><td>" +
            esc(r.detail) +
            '</td><td><button type="button" class="cm-shell-btn past-nlq-go" data-tab="' +
            esc(r.action || pack.tab) +
            '">去處理</button></td></tr>'
          );
        })
        .join("") +
      "</tbody></table>" +
      '<button type="button" class="cm-shell-btn" id="past-nlq-open-tab" data-tab="' +
      esc(pack.tab) +
      '">開啟「' +
      esc(pack.tab) +
      "」Tab 繼續 →</button>" +
      "</div>";
    host.querySelectorAll(".past-nlq-go, #past-nlq-open-tab").forEach(function (btn) {
      btn.onclick = function () {
        switchTab(btn.getAttribute("data-tab"));
      };
    });
  }

  /** 跑一個既有的快速查詢（chip 與「一句話查」共用同一條路，只列名單） */
  function runFilter(filter) {
    var H = global.PastoralDataHub;
    var q = (H && H.queryQuickFilter) || (global.PastoralTrialPack && global.PastoralTrialPack.queryQuickFilter);
    if (!q) {
      switchTab(filter === "handover_pending" ? "visitation" : "alerts");
      return null;
    }
    var pack = q(filter);
    showResults(pack);
    return pack;
  }

  function bindChips() {
    var host = $("past-nlq-chips");
    if (!host || !global.CmAiCareHelper) return;
    global.CmAiCareHelper.renderNlqChips("past-nlq-chips", function (chip) {
      runFilter(chip.filter);
    });
  }

  function setVqMsg(text) {
    var el = $("past-vq-msg");
    if (!el) return;
    el.textContent = text || "";
    el.hidden = !text;
  }

  /** 一句話查：只對應到上面既有的快速查詢鈕；聽不懂就說聽不懂；不存檔、不連網 */
  function bindVoiceBox() {
    var form = $("past-vq-form");
    var input = $("past-vq-input");
    if (!form || !input) return;
    form.onsubmit = function (ev) {
      ev.preventDefault();
      var VQ = global.CmVoiceQuery;
      if (!VQ) {
        setVqMsg("一句話查詢尚未載入，請重新整理頁面，或直接按上面的快速查詢鈕。");
        return false;
      }
      var r = VQ.interpret(input.value);
      var parts = [r.message].concat(r.notes || []);
      if (r.state === "matched") {
        runFilter(r.filter);
      } else {
        var host = $("past-nlq-results");
        if (host) {
          host.hidden = true;
          host.innerHTML = "";
        }
      }
      setVqMsg(parts.filter(Boolean).join(" "));
      return false;
    };
  }

  function boot() {
    renderGuide();
    bindChips();
    bindVoiceBox();
  }

  global.PastoralNlqPanel = { boot: boot, showResults: showResults, renderGuide: renderGuide, runFilter: runFilter };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : this, document);
