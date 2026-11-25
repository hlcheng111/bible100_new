/**
 * 牧養工作桌 · 子頁 ↔ 外殼 橋（file:// 安全版）
 *
 * 為什麼要有：file:// 下每個檔案的 origin 都是 "null"，子頁直接讀
 * 外殼（parent）上的 PastoralIntegratedShell 物件會丟 SecurityError（舊寫法會讓子頁載入就報錯）。
 * 規則：不碰 parent 的屬性，只靠 URL 旗標（embed=pastoral）判斷「我在工作桌裡」，
 * 並用 postMessage 叫外殼換 Tab（外殼在 pastoral_integrated_shell.js bindPostMessage 接收）。
 *
 * API：PastoralShellBridge.isEmbedded() / .switchTab(tab)
 */
(function (global) {
  "use strict";

  function isEmbedded() {
    try {
      if (global.parent === global) return false;
      return new URLSearchParams(global.location.search || "").get("embed") === "pastoral";
    } catch (e) {
      return false;
    }
  }

  function switchTab(tab) {
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: "pastoral-integrated", action: "switchTab", tab: tab }, "*");
        return true;
      }
    } catch (e) {}
    return false;
  }

  /** 把子頁頂部導覽換成「回工作桌 Tab」連結（只在工作桌內才換） */
  function installTabNav(tabs) {
    if (!isEmbedded()) return;
    function run() {
      var nav = global.document.querySelector(".sg-nav");
      if (!nav) return;
      nav.innerHTML = (tabs || [])
        .map(function (t) {
          return '<a href="#" data-tab="' + t.tab + '">' + t.label + "</a>";
        })
        .join("");
      nav.querySelectorAll("[data-tab]").forEach(function (a) {
        a.onclick = function (ev) {
          ev.preventDefault();
          switchTab(a.getAttribute("data-tab"));
        };
      });
    }
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", run);
    else run();
  }

  global.PastoralShellBridge = { isEmbedded: isEmbedded, switchTab: switchTab, installTabNav: installTabNav };
})(window);
