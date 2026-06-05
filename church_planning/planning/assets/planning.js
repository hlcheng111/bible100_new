/**
 * Step 3：示範整理（之後可改 POST /api/summarize）
 * 與 pipeline.js 的 longTermPlanning_summary 同步。
 */
(function () {
  var btn = document.getElementById("btn-summarize");
  var raw = document.getElementById("raw-text");
  var result = document.getElementById("result");
  var list = document.getElementById("result-list");
  var reportTbody = document.getElementById("report-tbody");
  var P = typeof LongTermPipeline !== "undefined" ? LongTermPipeline : null;

  if (!btn || !raw) return;

  btn.addEventListener("click", function () {
    fakeSummarize(raw.value);
  });

  function evidencePrefix(level) {
    if (level === "verified") return "【已核對】";
    if (level === "demo") return "【示範】";
    return "【假設／待驗證】";
  }

  function fakeSummarize(text) {
    if (list) {
      list.innerHTML = "";
    }
    var evLevel = P ? P.loadSummary().evidenceLevel : "hypothesis";
    var tag = evidencePrefix(evLevel);
    var bullets = [
      tag + "大家最關心的前三項主題（佔位，請日後換成真實整理）。",
      tag + "與「愛神愛人」較相關的意見方向（佔位）。",
      tag + "建議下一步在會議中討論的重點（佔位）。",
    ];
    if (text && text.trim().length > 0) {
      bullets[0] =
        tag + "已讀取您貼上的 " + text.trim().length + " 字；正式版會依內容歸納主題。";
    }
    if (list) {
      bullets.forEach(function (line) {
        var li = document.createElement("li");
        li.textContent = line;
        list.appendChild(li);
      });
    }

    if (reportTbody) {
      reportTbody.innerHTML = "";
      var rows = [
        ["關注主題", "（示範）待真實分析"],
        ["與使命對齊", "（示範）大誡命／大使命"],
        ["建議跟進", "（示範）排入議程事項"],
      ];
      rows.forEach(function (r) {
        var tr = document.createElement("tr");
        var td0 = document.createElement("td");
        td0.textContent = r[0];
        var td1 = document.createElement("td");
        td1.textContent = r[1];
        tr.appendChild(td0);
        tr.appendChild(td1);
        reportTbody.appendChild(tr);
      });
    }

    if (result) {
      result.classList.add("visible");
    }
    var reportPanel = document.getElementById("report-panel");
    if (reportPanel) {
      reportPanel.style.display = "block";
    }

    if (P) {
      var sum = P.loadSummary();
      sum.rawText = text || "";
      sum.summaryBullets = bullets;
      sum.model = "demo-local";
      if (!sum.evidenceLevel) sum.evidenceLevel = "hypothesis";
      P.saveSummary(sum);
    }
  }

  window.fakeSummarize = fakeSummarize;
})();
