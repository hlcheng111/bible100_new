import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const qnaDir = path.join(__dirname, "..");

const CSS = `
:root { --bg:#f5f7fb; --panel:#fff; --line:#d9e1ec; --text:#1d2733; --muted:#637282; --accent:#1248aa; }
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; font-family: "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif; color: var(--text); background: var(--bg); }
.app { height: 100%; display: flex; flex-direction: column; }
.topbar {
  flex: 0 0 auto; min-height: 48px; border-bottom: 1px solid var(--line); background: var(--panel);
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px 16px; padding: 8px 14px; font-size: 14px;
}
.topbar .title { font-weight: 700; flex: 1 1 200px; }
.topbar a { color: var(--accent); text-decoration: none; }
.topbar a:hover { text-decoration: underline; }
.main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(280px, 380px) 1fr; }
.sidebar { border-right: 1px solid var(--line); background: var(--panel); overflow: auto; padding: 10px 10px 20px; display: flex; flex-direction: column; gap: 8px; }
.sidebar .l1 { font-size: 13px; font-weight: 700; color: var(--muted); margin: 0 0 6px; }
.search { width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; font: inherit; }
#tree { flex: 1; overflow: auto; }
.details { border: 1px solid var(--line); border-radius: 8px; margin-bottom: 6px; background: #fafbfc; }
.details summary { cursor: pointer; padding: 8px 10px; font-weight: 600; font-size: 13px; }
.details .lvl3 { list-style: none; margin: 0; padding: 4px 8px 10px 12px; }
.details .lvl3 li { margin: 4px 0; }
.details button.linkish {
  display: block; width: 100%; text-align: left; border: 0; background: transparent; cursor: pointer;
  color: var(--accent); font: inherit; font-size: 12px; line-height: 1.35; padding: 4px 4px; border-radius: 4px;
}
.details button.linkish:hover { background: #edf3ff; }
.viewer { min-width: 0; min-height: 0; background: #fff; position: relative; display: flex; flex-direction: column; }
#iframe { flex: 1; width: 100%; min-height: 240px; border: 0; display: none; }
.landing { height: 100%; overflow: auto; padding: 20px 24px; font-size: 14px; }
.landing h2 { margin: 0 0 10px; font-size: 20px; }
.landing p { margin: 8px 0; color: var(--muted); line-height: 1.5; }
.note { font-size: 11px; color: var(--muted); margin-top: 10px; line-height: 1.4; }
`;

function pageShell(opts) {
  const {
    title,
    l1,
    hub,
    official,
    initialFrame,
    showSearch,
    bodyExtra,
    scriptBefore,
    dataAssignment,
    scriptAfter,
  } = opts;
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${CSS}</style>
</head>
<body>
${bodyExtra || ""}
<div class="app">
  <header class="topbar">
    <span class="title">${l1}</span>
    <a href="${hub}">Q&amp;A 導覽首頁</a>
    <a href="${official.href}" target="_blank" rel="noopener">${official.label}</a>
  </header>
  <div class="main">
    <aside class="sidebar">
      <p class="l1">${l1}</p>
      ${showSearch ? '<input type="search" class="search" id="qnaFilter" placeholder="篩選標題…" autocomplete="off">' : ""}
      <div id="tree"></div>
      <p class="note">${opts.provenance || ""}</p>
    </aside>
    <section class="viewer">
      <div id="landing" class="landing">
        <h2>歡迎</h2>
        <p>左側選主題與題目；右側 iframe 載入原文。若無法嵌入，請用頂端「官方」連結或按鈕在新分頁開啟。</p>
        <p><button type="button" id="openInitial" style="padding:8px 14px;cursor:pointer;border:1px solid var(--line);border-radius:8px;background:#f7faff;">於右側開啟官方首頁／索引</button></p>
      </div>
      <iframe id="iframe" title="viewer" referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </section>
  </div>
</div>
${scriptBefore || ""}
<script>
(function(){
  const OFFICIAL = ${JSON.stringify(official.href)};
  ${dataAssignment}
  const tree = document.getElementById("tree");
  const frame = document.getElementById("iframe");
  const landing = document.getElementById("landing");
  function showFrame(u) {
    if (!u) return;
    landing.style.display = "none";
    frame.style.display = "block";
    frame.src = u;
  }
  document.getElementById("openInitial").addEventListener("click", function(){ showFrame(${JSON.stringify(initialFrame)}); });
  ${scriptAfter}
})();
</script>
</body>
</html>`;
}

const sectionsScript = `
  function renderSections(dataKey) {
    tree.innerHTML = "";
    DATA[dataKey].forEach(function(sec) {
      var det = document.createElement("details");
      det.className = "details";
      var sm = document.createElement("summary");
      sm.textContent = sec.topic;
      det.appendChild(sm);
      var ul = document.createElement("ul");
      ul.className = "lvl3";
      sec.items.forEach(function(it) {
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "linkish";
        btn.textContent = it.title;
        btn.addEventListener("click", function() { showFrame(it.url); });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      det.appendChild(ul);
      tree.appendChild(det);
    });
  }
  renderSections("sections");
  var fi = document.getElementById("qnaFilter");
  if (fi) fi.addEventListener("input", function() {
    var q = (fi.value || "").toLowerCase().trim();
    tree.querySelectorAll(".details").forEach(function(det) {
      var hit = false;
      det.querySelectorAll("button.linkish").forEach(function(btn) {
        var m = !q || (btn.textContent || "").toLowerCase().indexOf(q) >= 0;
        btn.style.display = m ? "" : "none";
        if (m) hit = true;
      });
      det.style.display = hit || !q ? "" : "none";
    });
  });
`;

const billyScript = `
  function renderBilly() {
    tree.innerHTML = "";
    (window.billyTopicNav || []).forEach(function(sec) {
      var det = document.createElement("details");
      det.className = "details";
      var sm = document.createElement("summary");
      sm.textContent = sec.topic;
      det.appendChild(sm);
      var headRow = document.createElement("div");
      headRow.style.padding = "0 8px 6px";
      var hb = document.createElement("button");
      hb.type = "button";
      hb.className = "linkish";
      hb.style.fontWeight = "600";
      hb.textContent = "└ 主題總覽（官方篩選）";
      hb.addEventListener("click", function() { showFrame(sec.l0Url); });
      headRow.appendChild(hb);
      det.appendChild(headRow);
      var ul = document.createElement("ul");
      ul.className = "lvl3";
      (sec.items || []).forEach(function(it) {
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "linkish";
        btn.textContent = it.title;
        btn.addEventListener("click", function() { showFrame(it.url); });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      det.appendChild(ul);
      tree.appendChild(det);
    });
    var detM = document.createElement("details");
    detM.className = "details";
    var smM = document.createElement("summary");
    smM.textContent = "單篇連結（Sitemap 摘錄 " + (window.billyAnswersMenu || []).length + " 則）";
    detM.appendChild(smM);
    var ulM = document.createElement("ul");
    ulM.className = "lvl3";
    (window.billyAnswersMenu || []).forEach(function(it) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "linkish";
      btn.textContent = it.title;
      btn.addEventListener("click", function() { showFrame(it.url); });
      li.appendChild(btn);
      ulM.appendChild(li);
    });
    detM.appendChild(ulM);
    tree.appendChild(detM);
  }
  renderBilly();
  var fi = document.getElementById("qnaFilter");
  if (fi) fi.addEventListener("input", function() {
    var q = (fi.value || "").toLowerCase().trim();
    tree.querySelectorAll(".details").forEach(function(det) {
      var hit = false;
      det.querySelectorAll("ul.lvl3 button.linkish").forEach(function(btn) {
        var m = !q || (btn.textContent || "").toLowerCase().indexOf(q) >= 0;
        btn.style.display = m ? "" : "none";
        if (m) hit = true;
      });
      det.style.display = hit || !q ? "" : "none";
    });
  });
`;

const langScript = `
  function renderLang() {
    tree.innerHTML = "";
    DATA.blocks.forEach(function(sec) {
      var det = document.createElement("details");
      det.className = "details";
      var sm = document.createElement("summary");
      sm.textContent = sec.topic;
      det.appendChild(sm);
      var headRow = document.createElement("div");
      headRow.style.padding = "0 8px 6px";
      var b = document.createElement("button");
      b.type = "button";
      b.className = "linkish";
      b.style.fontWeight = "600";
      b.textContent = "└ 主題入口頁（原站）";
      b.addEventListener("click", function() { showFrame(sec.l2Url); });
      headRow.appendChild(b);
      det.appendChild(headRow);
      var ul = document.createElement("ul");
      ul.className = "lvl3";
      sec.items.forEach(function(it) {
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "linkish";
        btn.textContent = it.title;
        btn.addEventListener("click", function() { showFrame(it.url); });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      det.appendChild(ul);
      tree.appendChild(det);
    });
  }
  renderLang();
  var fi = document.getElementById("qnaFilter");
  if (fi) fi.addEventListener("input", function() {
    var q = (fi.value || "").toLowerCase().trim();
    tree.querySelectorAll(".details").forEach(function(det) {
      var hit = false;
      det.querySelectorAll("ul.lvl3 button.linkish").forEach(function(btn) {
        var m = !q || (btn.textContent || "").toLowerCase().indexOf(q) >= 0;
        btn.style.display = m ? "" : "none";
        if (m) hit = true;
      });
      det.style.display = hit || !q ? "" : "none";
    });
  });
`;

// —— Teen
const teens = JSON.parse(fs.readFileSync(path.join(qnaDir, "_fetch/ca_teens_parsed.json"), "utf8"));
fs.writeFileSync(
  path.join(qnaDir, "qna_ca_teens_index.htm"),
  pageShell({
    title: "ChristianAnswers · Teen Qs 導覽",
    l1: "Teen Qs – Questions and Biblical Answers for teenagers",
    hub: "qna_index.htm",
    official: { label: "官方索引", href: "https://christiananswers.net/menu-ay1.html" },
    initialFrame: "https://christiananswers.net/teens/home.html",
    showSearch: true,
    provenance:
      "資料： christiananswers.net/menu-ay1.html 各主題列點之連結（下載解析）。顯示標題取題幹問句為主。",
    dataAssignment: `const DATA = { sections: ${JSON.stringify(teens)} };`,
    scriptAfter: sectionsScript,
  }),
  "utf8"
);

const fam = JSON.parse(fs.readFileSync(path.join(qnaDir, "_fetch/ca_family_parsed.json"), "utf8"));
fs.writeFileSync(
  path.join(qnaDir, "qna_ca_family_index.htm"),
  pageShell({
    title: "ChristianAnswers · Family 導覽",
    l1: "Family & Personal Issues – ChristianAnswers",
    hub: "qna_index.htm",
    official: { label: "官方首頁", href: "https://christiananswers.net/parenting/home.html" },
    initialFrame: "https://christiananswers.net/parenting/home.html",
    showSearch: true,
    provenance:
      "資料： christiananswers.net/parenting/home.html 主區塊中 li.ques 之連結（下載解析）。",
    dataAssignment: `const DATA = { sections: ${JSON.stringify(fam)} };`,
    scriptAfter: sectionsScript,
  }),
  "utf8"
);

const zh = JSON.parse(fs.readFileSync(path.join(qnaDir, "_fetch/ca_zh_full.json"), "utf8"));
fs.writeFileSync(
  path.join(qnaDir, "qna_ca_zh_index.htm"),
  pageShell({
    title: "ChristianAnswers · 繁中 導覽",
    l1: "ChristianAnswers – 繁體中文",
    hub: "qna_index.htm",
    official: { label: "官方首頁", href: "https://christiananswers.net/chinese/trad/home.html" },
    initialFrame: "https://christiananswers.net/chinese/trad/home.html",
    showSearch: true,
    provenance:
      "資料：繁中首頁「查問主題」各入口頁內之文內連結（逐一抓取頁面，僅 christiananswers.net；每區最多 80 條）。",
    dataAssignment: `const DATA = ${JSON.stringify({ blocks: zh })};`,
    scriptAfter: langScript,
  }),
  "utf8"
);

const id = JSON.parse(fs.readFileSync(path.join(qnaDir, "_fetch/ca_id_full.json"), "utf8"));
fs.writeFileSync(
  path.join(qnaDir, "qna_ca_id_index.htm"),
  pageShell({
    title: "ChristianAnswers · Indonesia 導覽",
    l1: "ChristianAnswers – Bahasa Indonesia",
    hub: "qna_index.htm",
    official: { label: "官方首頁", href: "https://christiananswers.net/indonesian/home.html" },
    initialFrame: "https://christiananswers.net/indonesian/home.html",
    showSearch: true,
    provenance:
      "資料：印尼站主題入口頁；僅保留 /indonesian/ 路徑下 q- 問答等（node tools/fetch_ca_indonesia.mjs）。",
    dataAssignment: `const DATA = ${JSON.stringify({ blocks: id })};`,
    scriptAfter: langScript,
  }),
  "utf8"
);

const refBlocks = JSON.parse(fs.readFileSync(path.join(qnaDir, "_fetch/reformed_menu_full.json"), "utf8"));
fs.writeFileSync(
  path.join(qnaDir, "qna_reformed_index.htm"),
  pageShell({
    title: "ReformedAnswers · Topics 導覽",
    l1: "ReformedAnswers – Q&A by Topic",
    hub: "qna_index.htm",
    official: { label: "Topics（官方）", href: "https://reformedanswers.org/topics.asp" },
    initialFrame: "https://reformedanswers.org/topics.asp",
    showSearch: true,
    provenance:
      "資料：topics.asp 大類／子類 + 各子類 search 首頁之 a.searchResult（node tools/build_reformed_menu.mjs 重建）。",
    dataAssignment: `const DATA = ${JSON.stringify(refBlocks)};`,
    scriptAfter: langScript,
  }),
  "utf8"
);

const billyHtml = pageShell({
  title: "Billy Graham Answers 導覽",
  l1: "Billy Graham Answers",
  hub: "qna_index.htm",
  official: { label: "官方 Answers", href: "https://billygraham.org/answers" },
  initialFrame: "https://billygraham.org/answers",
  showSearch: true,
  provenance:
    "主題階層：官方 answers 篩選網址（topics.lvl0）。摘錄題：sitemap answers.xml（cap 400，node tools/build_billy_menu.mjs）。",
  scriptBefore: '<script src="qna_billy_menu.js"></script>',
  dataAssignment: "",
  scriptAfter: billyScript,
});
fs.writeFileSync(path.join(qnaDir, "qna_billy_index.htm"), billyHtml, "utf8");

const hubHtml = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>聖經難題 / 信仰問答 · 多來源導覽</title>
<style>
:root { --bg:#f0f4f8; --card:#fff; --border:#c8d4e0; --text:#1e293b; --muted:#64748b; --blue:#2563eb; }
* { box-sizing: border-box; }
body { margin: 0; font-family: "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif; background: var(--bg); color: var(--text); font-size: 15px; line-height: 1.5; }
header { background: var(--card); border-bottom: 1px solid var(--border); padding: 14px 18px; }
header h1 { margin: 0 0 6px; font-size: 1.25rem; }
header p { margin: 0; color: var(--muted); font-size: 0.88rem; }
nav { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px 16px; font-size: 0.85rem; }
nav a { color: var(--blue); }
.wrap { max-width: 960px; margin: 0 auto; padding: 20px 18px 48px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; }
.card h2 { margin: 0 0 8px; font-size: 1rem; }
.card p { margin: 0 0 10px; color: var(--muted); font-size: 0.82rem; }
.card a.go { display: inline-block; font-weight: 600; color: var(--blue); text-decoration: none; }
.card a.go:hover { text-decoration: underline; }
.hr { margin: 28px 0; border: 0; border-top: 1px solid var(--border); }
</style>
</head>
<body>
<header>
  <h1>聖經難題 / 信仰問答 · 多來源導覽</h1>
  <p>本站各連結通往「單一來源」的獨立導覽頁；不在此頁重複建題庫。建議用本機 HTTP 開啟以利 iframe。</p>
  <nav>
    <a href="../index_v5.html">← 聖經百步 index_v5</a>
    <a href="../index.html">← Bible 100 index</a>
    <a href="qna_index_4layer_V2.htm">整合目錄 V2（bundle）</a>
    <a href="qna_etspedia_index.htm">以斯拉百科 etspedia</a>
  </nav>
</header>
<div class="wrap">
  <div class="cards">
    <div class="card"><h2>ChristianAnswers · Teen Qs</h2><p>英文青少年主題索引</p><a class="go" href="qna_ca_teens_index.htm">開啟 →</a></div>
    <div class="card"><h2>ChristianAnswers · Family</h2><p>教養、婚姻、家庭</p><a class="go" href="qna_ca_family_index.htm">開啟 →</a></div>
    <div class="card"><h2>ChristianAnswers · 繁體中文</h2><p>繁中主題與入口</p><a class="go" href="qna_ca_zh_index.htm">開啟 →</a></div>
    <div class="card"><h2>ChristianAnswers · Indonesia</h2><p>Bahasa Indonesia</p><a class="go" href="qna_ca_id_index.htm">開啟 →</a></div>
    <div class="card"><h2>Billy Graham Answers</h2><p>Topics 篩選 + Sitemap 摘錄</p><a class="go" href="qna_billy_index.htm">開啟 →</a></div>
    <div class="card"><h2>ReformedAnswers</h2><p>topics.asp 全部分類與試題</p><a class="go" href="qna_reformed_index.htm">開啟 →</a></div>
    <div class="card"><h2>以斯拉百科 etspedia</h2><p>既有導覽頁</p><a class="go" href="qna_etspedia_index.htm">開啟 →</a></div>
    <div class="card"><h2>整合目錄 V2</h2><p>bundle 多來源（舊流程）</p><a class="go" href="qna_index_4layer_V2.htm">開啟 →</a></div>
  </div>
  <hr class="hr">
  <p style="font-size:0.8rem;color:var(--muted);">導覽首頁檔名：<code>qna_index.htm</code>。新增來源時僅在此加入口、並新增獨立 <code>qna_*_index.htm</code>，勿把題目塞進本頁。</p>
</div>
</body>
</html>`;
fs.writeFileSync(path.join(qnaDir, "qna_index.htm"), hubHtml, "utf8");

console.log("done: teens, family, zh, id, billy, reformed, qna_index.htm");
