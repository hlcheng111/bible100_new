(function (global) {
  "use strict";

  function href(sitePath) {
    if (global.B100_sitePath && global.B100_sitePath.siteHref) {
      return global.B100_sitePath.siteHref(sitePath);
    }
    return sitePath;
  }

  function escAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function shellGo(e, sidebarUrl, contentUrl) {
    if (typeof global.bible100ShellNav === "function") {
      return global.bible100ShellNav(e, {
        sidebarUrl: sidebarUrl,
        contentUrl: contentUrl,
      });
    }
    if (contentUrl) global.location.href = href(contentUrl);
    if (e && e.preventDefault) e.preventDefault();
    return false;
  }

  var OT_CATS = [
    {
      name: "律法書 (5卷)",
      landing: "bible_study/OT/law/index.html",
      books: [
        ["01", "創世記"],
        ["02", "出埃及記"],
        ["03", "利未記"],
        ["04", "民數記"],
        ["05", "申命記"],
      ],
    },
    {
      name: "歷史書 (12卷)",
      landing: "bible_study/OT/history/index.html",
      books: [
        ["06", "約書亞記"],
        ["07", "士師記"],
        ["08", "路得記"],
        ["09", "撒母耳記上"],
        ["10", "撒母耳記下"],
        ["11", "列王紀上"],
        ["12", "列王紀下"],
        ["13", "歷代志上"],
        ["14", "歷代志下"],
        ["15", "以斯拉記"],
        ["16", "尼希米記"],
        ["17", "以斯帖記"],
      ],
    },
    {
      name: "詩歌智慧書 (5卷)",
      landing: "bible_study/OT/poetry/index.html",
      books: [
        ["18", "約伯記"],
        ["19", "詩篇"],
        ["20", "箴言"],
        ["21", "傳道書"],
        ["22", "雅歌"],
      ],
    },
    {
      name: "大先知書 (5卷)",
      landing: "bible_study/OT/major_prophets/index.html",
      books: [
        ["23", "以賽亞書"],
        ["24", "耶利米書"],
        ["25", "耶利米哀歌"],
        ["26", "以西結書"],
        ["27", "但以理書"],
      ],
    },
    {
      name: "小先知書 (12卷)",
      landing: "bible_study/OT/minor_prophets/index.html",
      books: [
        ["28", "何西阿書"],
        ["29", "約珥書"],
        ["30", "阿摩司書"],
        ["31", "俄巴底亞書"],
        ["32", "約拿書"],
        ["33", "彌迦書"],
        ["34", "那鴻書"],
        ["35", "哈巴谷書"],
        ["36", "西番雅書"],
        ["37", "哈該書"],
        ["38", "撒迦利亞書"],
        ["39", "瑪拉基書"],
      ],
    },
  ];

  var NT_CATS = [
    {
      name: "福音書 (4卷)",
      landing: "bible_study/NT/gospels/index.html",
      books: [
        ["40", "馬太福音"],
        ["41", "馬可福音"],
        ["42", "路加福音"],
        ["43", "約翰福音"],
      ],
    },
    {
      name: "歷史書 (1卷)",
      landing: "bible_study/NT/history/index.html",
      books: [["44", "使徒行傳"]],
    },
    {
      name: "保羅書信 (13卷)",
      landing: "bible_study/NT/paul_letters/index.html",
      books: [
        ["45", "羅馬書"],
        ["46", "哥林多前書"],
        ["47", "哥林多後書"],
        ["48", "加拉太書"],
        ["49", "以弗所書"],
        ["50", "腓立比書"],
        ["51", "歌羅西書"],
        ["52", "帖撒羅尼迦前書"],
        ["53", "帖撒羅尼迦後書"],
        ["54", "提摩太前書"],
        ["55", "提摩太後書"],
        ["56", "提多書"],
        ["57", "腓利門書"],
      ],
    },
    {
      name: "一般書信 (8卷)",
      landing: "bible_study/NT/general_letters/index.html",
      books: [
        ["58", "希伯來書"],
        ["59", "雅各書"],
        ["60", "彼得前書"],
        ["61", "彼得後書"],
        ["62", "約翰一書"],
        ["63", "約翰二書"],
        ["64", "約翰三書"],
        ["65", "猶大書"],
      ],
    },
    {
      name: "啟示錄 (1卷)",
      landing: "bible_study/NT/revelation/index.html",
      books: [["66", "啟示錄"]],
    },
  ];

  var NODE_DATA = {
    1: {
      title: "🦁 聖經跑道 · 四語",
      badge: "Track · 4 langs · ★ 首站",
      icon: "🦁",
      iconClass: "pg-node-btn--track",
      modalBg: "linear-gradient(135deg,#fbbf24,#ea580c)",
      desc: "每天幾分鐘就好！繁中、英文、越南、印尼可以並排讀。斷更了沒關係，回來繼續就行。",
      guideTips: {
        fit: "每日靈修、帶班、初信者、需要越／印尼語並排",
        notFit: "要左右硬對照兩個譯本全文（請用 📑 譯本對照）",
        hint: "讀完一關記得打卡；可帶去 🎨 讀後創意工作站畫圖、朗讀、問問題。",
      },
      sidebarUrl: "bible_study/sidebar.html?focus=track",
      contentUrl: "bible_app/shell/index.html",
      extraHtml:
        '<div class="pg-link-box"><h4>🌍 跑道裡的四語</h4><p>越文、印尼文請<strong>優先用這裡</strong>；寮國、緬甸文在左欄「🌍 多語言」外站。</p></div>',
    },
    2: {
      title: "🌐 多语查经 · 主入口",
      badge: "Multilingual",
      icon: "🌐",
      iconClass: "pg-node-btn--versions",
      modalBg: "linear-gradient(135deg,#3b82f6,#4f46e5)",
      desc: "默认中+EN 两栏，可开越/印尼四语。读完后可一键「释经参读」同章。顶栏 🌐 全站可进。",
      guideTips: {
        fit: "对照读正文、查经班带读、四语并排",
        notFit: "要带进度打卡（🦁 跑道更合适）",
        hint: "书卷下拉已分组（律法书、福音书…）；不懂搜什么请看 landing 下方彩色地图表。",
      },
      sidebarUrl: "bible_study/sidebar.html?focus=versions",
      contentUrl: "bible_app/shell/pages/reader-multilang.html",
      extraHtml: function () {
        return (
          '<div class="pg-link-box"><h4>🇨🇳 中文 · ↗ 外站</h4>' +
          '<a href="https://b.ibible.hk/bible/4/GEN/1" target="_blank" rel="noopener">和合本 Strong ↗ iBible.hk</a>' +
          '<a href="https://b.ibible.hk/bible/6/GEN/1" target="_blank" rel="noopener">呂振中 ↗ iBible.hk</a></div>' +
          '<div class="pg-link-box"><h4>🇺🇸 英文（站內）</h4>' +
          '<a href="' +
          href("bible_study/versions/kjv.html") +
          '" data-pg-shell=\'{"sidebarUrl":"bible_study/sidebar.html?focus=versions","contentUrl":"bible_study/versions/kjv.html"}\'>KJV · BibleGateway</a>' +
          '<a href="' +
          href("bible_study/versions/niv.html") +
          '" data-pg-shell=\'{"sidebarUrl":"bible_study/sidebar.html?focus=versions","contentUrl":"bible_study/versions/niv.html"}\'>NIV · BibleGateway</a></div>' +
          '<div class="pg-link-box"><h4>🌍 寮 · 越 · 緬 · 印尼</h4>' +
          '<a href="' +
          href("bible_study/external_bible_reader.html?source=laobible&book=創世記&chapter=1") +
          '" data-pg-shell=\'{"sidebarUrl":"bible_study/sidebar.html?focus=versions","contentUrl":"bible_study/external_bible_reader.html?source=laobible&book=創世記&chapter=1"}\'>🇱🇦 寮國聖經</a>' +
          '<a href="' +
          href("bible_study/external_bible_reader.html?source=vietchristian&book=創世記&chapter=1") +
          '" data-pg-shell=\'{"sidebarUrl":"bible_study/sidebar.html?focus=versions","contentUrl":"bible_study/external_bible_reader.html?source=vietchristian&book=創世記&chapter=1"}\'>🇻🇳 越南聖經（外站備用）</a>' +
          '<a href="https://b.ibible.hk/bible/15/GEN/1" target="_blank" rel="noopener">🇮🇩 印尼 ↗ iBible</a>' +
          '<a href="' +
          href("bible_study/external_bible_reader.html?source=wordproject-myanmar&book=創世記&chapter=1") +
          '" data-pg-shell=\'{"sidebarUrl":"bible_study/sidebar.html?focus=versions","contentUrl":"bible_study/external_bible_reader.html?source=wordproject-myanmar&book=創世記&chapter=1"}\'>🇲🇲 緬甸聖經</a>' +
          '<p class="pg-note">越南、印尼日常讀經仍推跑道四語。</p></div>'
        );
      },
    },
    3: {
      title: "📖 聖經書卷 · 釋經參讀",
      badge: "Commentary · CMC · 66卷",
      icon: "📚",
      iconClass: "pg-node-btn--commentary",
      modalBg: "linear-gradient(135deg,#10b981,#0f766e)",
      desc: "釋經內容來自 CMC 原站（需連線）。左欄點書卷，右欄逐章閱讀；也可在這裡直接挑 66 卷。",
      guideTips: {
        fit: "查經班「懂意思」、備課要釋經書、逐章帶讀",
        notFit: "離線-only 環境（CMC 需連線）",
        hint: "左欄書卷 + 右欄 CMC；與第 2 階「懂」色標對應。",
      },
      sidebarUrl: "bible_study/sidebar.html?focus=commentary",
      contentUrl: "bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1",
      bible66: true,
    },
    4: {
      title: "🌍 地理歷史",
      badge: "Geo. Hist.",
      icon: "🗺️",
      iconClass: "pg-node-btn--geo",
      modalBg: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
      desc: "時間軸、地圖、考古與影片——幫你「身臨其境」。聖光地理等會在新分頁開啟。",
      guideTips: {
        fit: "想知道故事發生在哪、查經要背景、第 4 階「境」",
        notFit: "只想快讀今日經文（先完成 🦁 跑道）",
        hint: "與資訊圖「知處境」同色；可搭配 CMC 釋經一起用。",
      },
      sidebarUrl: "bible_study/sidebar.html?focus=geo",
      contentUrl: "bible_study/_landing/geography_history.html",
      extraHtml:
        '<div class="pg-link-box"><h4>站內分類</h4><p>⏳ 時間軸 · 📍 地名 · 🗺️ 地圖 · 📺 BibleProject · 🏛️ 考古</p><p class="pg-note">詳細連結在地理歷史 landing 與左欄。</p></div>',
    },
    5: {
      title: "🧰 核心捷徑 · 工具",
      badge: "Tools",
      icon: "🧰",
      iconClass: "pg-node-btn--tools",
      modalBg: "linear-gradient(135deg,#f43f5e,#db2777)",
      desc: "詞典、串珠、搜尋——像帶著放大鏡讀經。部分功能需本機資料。",
      guideTips: {
        fit: "查字詞、串珠、原文工具、第 3 階「查細節」",
        notFit: "還沒讀過經文就想查（先 🦁 跑道讀一關）",
        hint: "左欄「工具」與頂欄「工具」鍵同一入口。",
      },
      sidebarUrl: "bible_study/sidebar.html?focus=tools",
      contentUrl: "bible_study/_landing/tools.html",
    },
  };

  var STAGE_META = {
    amber: {
      title: "第 1 階 · 讀",
      desc: "先把經讀進心裡——地圖上 🦁 跑道、📑 譯本會亮起。不確定？先點 🦁。",
    },
    purple: {
      title: "第 2 階 · 懂",
      desc: "這章在說什麼？看 📚 釋經站牌（CMC，需連線）。",
    },
    emerald: {
      title: "第 3 階 · 查",
      desc: "想查字、串珠？🧰 工具站牌在這一階亮起。",
    },
    sky: {
      title: "第 4 階 · 境",
      desc: "想知道發生在哪？🗺️ 地理歷史站牌會帶你去。",
    },
  };

  function renderGuideTips(data) {
    var el = document.getElementById("pgModalGuide");
    if (!el) return;
    if (!data.guideTips) {
      el.innerHTML = "";
      el.hidden = true;
      return;
    }
    var t = data.guideTips;
    el.innerHTML =
      '<div class="pg-tip-row pg-tip-row--fit"><strong>✅ 適合</strong><span>' +
      t.fit +
      "</span></div>" +
      '<div class="pg-tip-row pg-tip-row--skip"><strong>⏭️ 不適合</strong><span>' +
      t.notFit +
      "</span></div>" +
      '<div class="pg-tip-row pg-tip-row--hint"><strong>💡 小提示</strong><span>' +
      t.hint +
      "</span></div>";
    el.hidden = false;
  }

  function highlightStageNodes(theme) {
    document.querySelectorAll(".pg-node-wrap[data-pg-stage]").forEach(function (wrap) {
      var stages = (wrap.getAttribute("data-pg-stage") || "").split(/\s+/);
      wrap.classList.toggle("pg-node-wrap--stage-active", stages.indexOf(theme) >= 0);
    });
  }

  function commentaryUrl(book) {
    return (
      "bible_study/comprehensive_exegesis_reader.html?book=" +
      encodeURIComponent(book) +
      "&chapter=1"
    );
  }

  function renderBooksExplorer() {
    function renderSection(cats, tone) {
      var html = "";
      cats.forEach(function (cat) {
        html += '<div class="pg-book-cat"><h5>' + cat.name + "</h5>";
        html +=
          '<p style="margin:0 0 6px;font-size:10px;"><a href="' +
          href(cat.landing) +
          '" data-pg-shell="' +
          escAttr(
            JSON.stringify({
              sidebarUrl: "bible_study/sidebar.html?focus=commentary",
              contentUrl: cat.landing,
            })
          ) +
          '">📖 導論 Landing →</a></p>';
        html += '<div class="pg-book-grid">';
        cat.books.forEach(function (b) {
          var url = commentaryUrl(b[1]);
          html +=
            '<a href="' +
            href(url) +
            '" title="' +
            b[1] +
            '" data-pg-shell="' +
            escAttr(
              JSON.stringify({
                sidebarUrl: "bible_study/sidebar.html?focus=commentary",
                contentUrl: url,
              })
            ) +
            '">' +
            b[0] +
            " " +
            b[1] +
            "</a>";
        });
        html += "</div></div>";
      });
      return html;
    }

    return (
      '<div class="pg-books-tabs">' +
      '<button type="button" class="pg-books-tab is-active" data-pg-testament="ot">📕 舊約 39卷</button>' +
      '<button type="button" class="pg-books-tab" data-pg-testament="nt">📗 新約 27卷</button>' +
      "</div>" +
      '<div id="pgBooksOt">' +
      renderSection(OT_CATS) +
      "</div>" +
      '<div id="pgBooksNt" hidden>' +
      renderSection(NT_CATS) +
      "</div>"
    );
  }

  function bindShellLinks(root) {
    if (!root) return;
    root.querySelectorAll("[data-pg-shell]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        try {
          var payload = JSON.parse(a.getAttribute("data-pg-shell"));
          shellGo(e, payload.sidebarUrl, payload.contentUrl);
        } catch (err) {}
      });
    });
  }

  function openNodeModal(id) {
    var data = NODE_DATA[id];
    if (!data) return;
    var modal = document.getElementById("pgHotspotModal");
    var iconBg = document.getElementById("pgModalIconBg");
    document.getElementById("pgModalBadge").textContent = data.badge;
    document.getElementById("pgModalTitle").textContent = data.title;
    document.getElementById("pgModalIcon").textContent = data.icon;
    document.getElementById("pgModalDesc").textContent = data.desc;
    renderGuideTips(data);
    iconBg.style.background = data.modalBg;

    var sub = document.getElementById("pgModalSub");
    if (data.bible66) {
      sub.innerHTML = renderBooksExplorer();
      bindShellLinks(sub);
      sub.querySelectorAll(".pg-books-tab").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var ot = document.getElementById("pgBooksOt");
          var nt = document.getElementById("pgBooksNt");
          sub.querySelectorAll(".pg-books-tab").forEach(function (b) {
            b.classList.remove("is-active");
          });
          btn.classList.add("is-active");
          if (btn.getAttribute("data-pg-testament") === "nt") {
            ot.hidden = true;
            nt.hidden = false;
          } else {
            ot.hidden = false;
            nt.hidden = true;
          }
        });
      });
    } else {
      sub.innerHTML =
        typeof data.extraHtml === "function" ? data.extraHtml() : data.extraHtml || "";
      bindShellLinks(sub);
    }

    var goBtn = document.getElementById("pgModalGo");
    goBtn.href = href(data.contentUrl);
    goBtn.onclick = function (e) {
      closeModal();
      return shellGo(e, data.sidebarUrl, data.contentUrl);
    };

    modal.classList.add("is-open");
    updateGuide(data.title, data.desc);
  }

  function closeModal() {
    document.getElementById("pgHotspotModal").classList.remove("is-open");
  }

  function updateGuide(title, desc) {
    var t = document.getElementById("pgGuideTitle");
    var d = document.getElementById("pgGuideDesc");
    if (t) t.textContent = title;
    if (d) d.textContent = desc;
  }

  function switchStage(theme) {
    var root = document.getElementById("pgRoot");
    root.className = "pg-root theme-" + theme;
    document.querySelectorAll(".pg-stage-tab").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-theme") === theme);
    });
    highlightStageNodes(theme);
    var meta = STAGE_META[theme] || {};
    updateGuide(meta.title || "尋寶四階", meta.desc || "");
  }

  function triggerRandomTreasure() {
    openNodeModal(Math.floor(Math.random() * 5) + 1);
  }

  function talkToGuide() {
    var tips = [
      "每天 5 分鐘，先點 🦁 聖經跑道——四語並排，最適合帶班。",
      "備課想懂某一章？📚 釋經參讀連到 CMC，左欄還能直接點 66 卷。",
      "要硬對照兩個譯本？📑 譯本對照；平常讀經不必繞這裡。",
      "想知道故事發生在哪？🗺️ 地理歷史有地圖、時間軸和影片。",
    ];
    updateGuide("小獅子悄悄話", tips[Math.floor(Math.random() * tips.length)]);
  }

  function resetMapView() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    switchStage("amber");
  }

  function openQuizModal() {
    document.getElementById("pgMiniEmoji").textContent = "⭐";
    document.getElementById("pgMiniTitle").textContent = "突擊小測驗";
    document.getElementById("pgMiniText").textContent =
      "「神就照著自己的形像造人，乃是照著祂的形像造男造女。」—— 這句在哪一卷？（提示：創世記 1:27）";
    document.getElementById("pgMiniModal").classList.add("is-open");
  }

  function openVerseModal() {
    document.getElementById("pgMiniEmoji").textContent = "🎁";
    document.getElementById("pgMiniTitle").textContent = "今日金句寶箱";
    document.getElementById("pgMiniText").textContent =
      "「祢的話是我腳前的燈，是我路上的光。」（詩篇 119:105）—— 願今天的這一點點，就夠用。";
    document.getElementById("pgMiniModal").classList.add("is-open");
  }

  function closeMiniModal() {
    document.getElementById("pgMiniModal").classList.remove("is-open");
  }

  function boot() {
    highlightStageNodes("amber");
    document.querySelectorAll("[data-pg-node]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openNodeModal(parseInt(btn.getAttribute("data-pg-node"), 10));
      });
    });
    document.querySelectorAll(".pg-stage-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchStage(btn.getAttribute("data-theme"));
      });
    });
    document.getElementById("pgModalClose").addEventListener("click", closeModal);
    document.getElementById("pgModalBack").addEventListener("click", closeModal);
    document.getElementById("pgHotspotModal").addEventListener("click", function (e) {
      if (e.target.id === "pgHotspotModal") closeModal();
    });
    document.getElementById("pgMiniClose").addEventListener("click", closeMiniModal);
    document.getElementById("pgPickRandom").addEventListener("click", triggerRandomTreasure);
    document.getElementById("pgDockMap").addEventListener("click", resetMapView);
    document.getElementById("pgDockRandom").addEventListener("click", triggerRandomTreasure);
    document.getElementById("pgDockGuide").addEventListener("click", talkToGuide);
    document.getElementById("pgSurpriseQuiz").addEventListener("click", openQuizModal);
    document.getElementById("pgSurpriseVerse").addEventListener("click", openVerseModal);
    switchStage("amber");
  }

  global.BSPlayground = {
    openNodeModal: openNodeModal,
    closeModal: closeModal,
    switchStage: switchStage,
    resetMapView: resetMapView,
    triggerRandomTreasure: triggerRandomTreasure,
    talkToGuide: talkToGuide,
    openQuizModal: openQuizModal,
    openVerseModal: openVerseModal,
    closeMiniModal: closeMiniModal,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
