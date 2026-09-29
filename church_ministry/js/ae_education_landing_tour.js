/**
 * C 區 guide_story · 裝備地圖互動（對齊 A 區 ae_worship_landing_tour）
 */
(function (win, doc) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/</g, "&lt;");
  }

  function switchParentTab(tab, memberId) {
    try {
      if (win.parent && win.parent !== win && win.parent.EducationIntegratedShell) {
        win.parent.EducationIntegratedShell.switchTab(tab, { memberId: memberId || "" });
        return true;
      }
    } catch (e) {}
    return false;
  }

  function shellNav(spec) {
    if (!spec) return false;
    if (win.bible100ShellNav) return win.bible100ShellNav(null, spec);
    try {
      var payload = {
        type: "bible100-shell",
        sidebarUrl: spec.sidebarUrl || "",
        contentUrl: spec.contentUrl || ""
      };
      if (win.top && win.top !== win) {
        win.top.postMessage(payload, "*");
        return true;
      }
    } catch (eShell) {}
    return false;
  }

  function render(hostId) {
    var host = doc.getElementById(hostId || "edu-park-map-host");
    var R = win.AeEducationJourneyRegistry;
    if (!host || !R) return;

    var storyHost = doc.getElementById("edu-story-rail");
    if (storyHost) {
      storyHost.innerHTML = R.STORYLINE.map(function (s) {
        return (
          '<div class="edu-story-stop"><strong>第' +
          esc(s.act) +
          "步 " +
          esc(s.title) +
          "</strong> " +
          esc(s.hint) +
          "</div>"
        );
      }).join("");
    }

    host.innerHTML =
      '<p class="muted" style="margin:0 0 10px;">🗺️ 裝備地圖（服事旅程，非行政九宮格）— 點節點切換右欄工作 Tab 或跨模組。</p>' +
      R.ROUTES.map(function (route) {
        var stops = route.stops
          .map(function (st) {
            if (st.tab) {
              return (
                '<li><a href="#" data-edu-tab="' +
                esc(st.tab) +
                '">🌷 ' +
                esc(st.label) +
                "</a></li>"
              );
            }
            if (st.path) {
              return '<li><a href="' + esc(st.path) + '">🌷 ' + esc(st.label) + "</a></li>";
            }
            if (st.shell) {
              return (
                '<li><a href="#" data-edu-shell="' +
                esc(JSON.stringify(st.shell)) +
                '">🌷 ' +
                esc(st.label) +
                " <small>（換側欄）</small></a></li>"
              );
            }
            return "";
          })
          .join("");
        return (
          '<article class="edu-route-card">' +
          "<h3>" +
          route.emoji +
          " " +
          esc(route.title) +
          "</h3>" +
          '<p class="muted">' +
          esc(route.blurb) +
          '</p><ul class="edu-route-stops">' +
          stops +
          "</ul></article>"
        );
      }).join("");

    host.querySelectorAll("[data-edu-tab]").forEach(function (a) {
      a.onclick = function (ev) {
        if (ev.preventDefault) ev.preventDefault();
        switchParentTab(a.getAttribute("data-edu-tab"));
        return false;
      };
    });
    host.querySelectorAll("[data-edu-shell]").forEach(function (a) {
      a.onclick = function (ev) {
        if (ev.preventDefault) ev.preventDefault();
        try {
          shellNav(JSON.parse(a.getAttribute("data-edu-shell")));
        } catch (e) {}
        return false;
      };
    });
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () {
      render("edu-park-map-host");
    });
  } else {
    render("edu-park-map-host");
  }
})(window, document);
