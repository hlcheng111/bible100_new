/**
 * 擴充示範題庫（實用版：每工具 8 題 Likert）
 */
(function (global) {
  "use strict";

  var PACKS = {
    johari: [
      { q: "j5", text: "我願意在團隊中承認自己的限制。", projection: { P: 0.2, S: 0.15, G: 0, C: 0, R: 0.55, F: 0.1 } },
      { q: "j6", text: "我會主動尋求不同觀點的意見。", projection: { P: 0.1, S: 0.1, G: 0, C: 0.1, R: 0.6, F: 0.1 } },
      { q: "j7", text: "我能在被指正時保持謙卑。", projection: { P: 0.25, S: 0.2, G: 0, C: 0.05, R: 0.4, F: 0.1 } },
      { q: "j8", text: "我會適度分享內心掙扎而非一味逞強。", projection: { P: 0.3, S: 0.15, G: 0, C: 0, R: 0.45, F: 0.1 } }
    ],
    shape: [
      { q: "s4", text: "我樂於在幕後支持，讓事工順利運作。", projection: { P: 0.1, S: 0.1, G: 0.1, C: 0.35, R: 0.25, F: 0.1 } },
      { q: "s5", text: "我對未得之民有負擔並願意參與。", projection: { P: 0.15, S: 0.2, G: 0.35, C: 0.1, R: 0.1, F: 0.1 } },
      { q: "s6", text: "我能鼓勵灰心的人重新得力。", projection: { P: 0.35, S: 0.2, G: 0, C: 0.1, R: 0.25, F: 0.1 } },
      { q: "s7", text: "我擅長連結資源與人配搭。", projection: { P: 0.05, S: 0.05, G: 0.25, C: 0.45, R: 0.15, F: 0.05 } }
    ],
    competency: [
      { q: "c4", text: "我能依優先順序處理多重任務。", projection: { P: 0, S: 0, G: 0.2, C: 0.55, R: 0.15, F: 0.1 } },
      { q: "c5", text: "我會主動培育後備同工。", projection: { P: 0.25, S: 0.15, G: 0.1, C: 0.2, R: 0.2, F: 0.1 } },
      { q: "c6", text: "我能在壓力下仍保持清晰溝通。", projection: { P: 0.15, S: 0.1, G: 0.1, C: 0.25, R: 0.35, F: 0.05 } },
      { q: "c7", text: "我熟悉基本資料整理與追蹤。", projection: { P: 0, S: 0, G: 0.35, C: 0.5, R: 0.1, F: 0.05 } }
    ],
    kpiokr: [
      { q: "k4", text: "我們會定期檢視目標是否仍符合異象。", projection: { P: 0.05, S: 0.1, G: 0.35, C: 0.25, R: 0.15, F: 0.1 } },
      { q: "k5", text: "團隊理解各指標的定義一致。", projection: { P: 0, S: 0, G: 0.25, C: 0.55, R: 0.15, F: 0.05 } },
      { q: "k6", text: "我們會記錄學習而非只追數字。", projection: { P: 0.1, S: 0.15, G: 0.15, C: 0.2, R: 0.2, F: 0.2 } },
      { q: "k7", text: "目標設定會預留牧養與安息空間。", projection: { P: 0.25, S: 0.2, G: 0.1, C: 0.15, R: 0.15, F: 0.15 } }
    ],
    urgent: [
      { q: "u4", text: "我會對低價值會議說不或縮短。", projection: { P: 0.05, S: 0.05, G: 0.3, C: 0.35, R: 0.15, F: 0.1 } },
      { q: "u5", text: "我每週檢視待辦是否對齊異象。", projection: { P: 0.1, S: 0.1, G: 0.25, C: 0.35, R: 0.1, F: 0.1 } },
      { q: "u6", text: "我會把突發急事與長期目標分開處理。", projection: { P: 0, S: 0.05, G: 0.3, C: 0.4, R: 0.15, F: 0.1 } },
      { q: "u7", text: "我會預留不可被佔用的安息時段。", projection: { P: 0.15, S: 0.25, G: 0.1, C: 0.1, R: 0.1, F: 0.3 } }
    ]
  };

  function inject(toolId) {
    var items = PACKS[toolId];
    if (!items || !items.length) return;
    var host = document.getElementById("tab-survey");
    if (!host) return;
    var grid = host.querySelector(".grid") || host.querySelector(".space-y-2") || host;
    items.forEach(function (item) {
      if (document.querySelector('[data-q="' + item.q + '"]')) return;
      var label = document.createElement("label");
      label.className = host.querySelector(".grid") ? "border rounded p-3" : "block border rounded p-2";
      label.innerHTML =
        item.text +
        '<input data-q="' +
        item.q +
        '" data-cta-projection=\'' +
        JSON.stringify(item.projection) +
        "' class=\"w-full mt-1 border rounded p-1\" type=\"number\" min=\"1\" max=\"5\" value=\"3\">";
      grid.appendChild(label);
    });
  }

  global.CTAOSItemPacks = { inject: inject, PACKS: PACKS };
})(window);
