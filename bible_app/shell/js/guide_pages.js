/** 渲染操作說明 / 本站理念 */
(function (global) {
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function qsLocale() {
    var loc = global.B100GuideContent ? global.B100GuideContent.locale() : 'zh-Hant';
    return 'locale=' + encodeURIComponent(loc);
  }

  function renderHowto(root) {
    var c = global.B100GuideContent.howto();
    var html = '<h1>' + esc(c.title) + '</h1><p class="coach-lead">' + esc(c.lead) + '</p>';

    if (c.whatTitle) {
      html += '<section class="coach-block"><h2 class="guide-section-title">' + esc(c.whatTitle) + '</h2>' +
        '<p class="coach-block__text">' + esc(c.whatBody) + '</p></section>';
    }

    html += '<section class="guide-flow"><h2 class="guide-section-title">' + esc(c.flowTitle) + '</h2><ol class="guide-steps">';
    c.steps.forEach(function (step, i) {
      html += '<li class="guide-step">' +
        '<span class="guide-step__num">' + (i + 1) + '</span>' +
        '<span class="guide-step__icon" aria-hidden="true">' + step.icon + '</span>' +
        '<div class="guide-step__body">' +
          '<strong class="guide-step__title">' + esc(step.title) + '</strong>' +
          '<p class="guide-step__text">' + esc(step.text) + '</p>' +
        '</div></li>';
    });
    html += '</ol></section>';

    html += '<section class="guide-relief">' +
      '<h2 class="guide-relief__title">' + esc(c.reliefTitle) + '</h2>' +
      '<p>' + esc(c.reliefBody) + '</p>' +
      '<a class="coach-btn" href="today.html?' + qsLocale() + '">' + esc(c.reliefBtn) + '</a>' +
      '</section>';

    html += '<section class="coach-block"><h2 class="guide-section-title">' + esc(c.microTitle) + '</h2>' +
      '<p class="coach-block__text">' + esc(c.microBody) + '</p></section>';

    html += '<section class="coach-block"><h2 class="guide-section-title">' + esc(c.restTitle) + '</h2>' +
      '<p class="coach-block__text">' + esc(c.restBody) + '</p></section>';

    html += '<section class="guide-shortcuts"><h2 class="guide-section-title">' + esc(c.shortcutTitle) + '</h2>';
    c.shortcuts.forEach(function (s) {
      html += '<a class="guide-shortcut" href="' + esc(s.href) + '?' + qsLocale() + '">' +
        '<span class="guide-shortcut__icon">' + s.icon + '</span>' +
        '<span class="guide-shortcut__label">' + esc(s.label) + '</span>' +
        '<span class="guide-shortcut__desc">' + esc(s.desc) + '</span></a>';
    });
    html += '</section>';

    html += '<section class="coach-faq"><h2 class="guide-section-title">' + esc(c.faqTitle) + '</h2>';
    c.faqs.forEach(function (f) {
      html += '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>';
    });
    html += '</section>';

    html += '<section class="guide-remember"><h2 class="guide-section-title">' + esc(c.rememberTitle) + '</h2><ul class="guide-remember__list">';
    c.remember.forEach(function (r) {
      html += '<li>' + esc(r) + '</li>';
    });
    html += '</ul></section>';

    html += '<a class="coach-btn" href="today.html?' + qsLocale() + '">' + esc(c.cta) + '</a>';
    html += '<p class="guide-footer-link"><a href="guide-idea.html?' + qsLocale() + '">' + esc(c.ideaLink) + '</a></p>';

    root.innerHTML = html;
    document.title = c.title;
    document.documentElement.lang = global.B100GuideContent.locale() === 'zh-Hant' ? 'zh-Hant' : global.B100GuideContent.locale();
  }

  function renderIdea(root) {
    var c = global.B100GuideContent.idea();
    var html = '<h1>' + esc(c.title) + '</h1><p class="coach-lead">' + esc(c.lead) + '</p>';

    [c.p1, c.p2, c.p3].forEach(function (p) {
      html += '<p class="guide-para">' + esc(p) + '</p>';
    });

    if (c.bibleStoryTitle) {
      html += '<section class="coach-block"><h2 class="guide-section-title">' + esc(c.bibleStoryTitle) + '</h2>' +
        '<p class="guide-para">' + esc(c.bibleStoryBody) + '</p></section>';
    }
    if (c.versionsTitle) {
      html += '<section class="coach-block"><h2 class="guide-section-title">' + esc(c.versionsTitle) + '</h2>' +
        '<p class="guide-para">' + esc(c.versionsBody) + '</p></section>';
    }

    html += '<section class="coach-block"><h2 class="guide-section-title">' + esc(c.busyTitle) + '</h2>' +
      '<p class="guide-para">' + esc(c.busyBody) + '</p></section>';

    html += '<section class="coach-block"><h2 class="guide-section-title">' + esc(c.promiseTitle) + '</h2><ul class="guide-remember__list">';
    c.promises.forEach(function (p) {
      html += '<li>' + esc(p) + '</li>';
    });
    html += '</ul></section>';

    html += '<section class="guide-relief guide-relief--soft"><h2 class="guide-section-title">' + esc(c.notTitle) + '</h2><ul class="guide-remember__list">';
    c.notList.forEach(function (p) {
      html += '<li>' + esc(p) + '</li>';
    });
    html += '</ul></section>';

    html += '<section class="coach-block"><h2 class="guide-section-title">' + esc(c.supplyTitle) + '</h2>' +
      '<p class="guide-para">' + esc(c.supplyBody) + '</p>' +
      '<p><a href="' + esc(c.supplyUrl) + '" target="_blank" rel="noopener">' + esc(c.supplyLink) + '</a></p></section>';

    if (c.leaderTitle) {
      html += '<details class="guide-leader"><summary class="guide-section-title">' + esc(c.leaderTitle) + '</summary>' +
        '<p class="guide-para">' + esc(c.leaderBody) + '</p></details>';
    }
    if (c.deepenTitle) {
      html += '<section class="coach-block"><h2 class="guide-section-title">' + esc(c.deepenTitle) + '</h2>' +
        '<p class="guide-para">' + esc(c.deepenBody) + '</p></section>';
    }

    html += '<a class="coach-btn" href="today.html?' + qsLocale() + '">' + esc(c.cta) + '</a>';
    html += '<p class="guide-footer-link"><a href="guide-howto.html?' + qsLocale() + '">' + esc(c.howtoLink) + '</a></p>';

    root.innerHTML = html;
    document.title = c.title;
    document.documentElement.lang = global.B100GuideContent.locale() === 'zh-Hant' ? 'zh-Hant' : global.B100GuideContent.locale();
  }

  global.B100GuidePages = { renderHowto: renderHowto, renderIdea: renderIdea };
})(typeof window !== 'undefined' ? window : global);
