/**
 * 在真實側欄 DOM 上套用施工對標（留／併／修／除／加）
 * 用法：
 * 1) a[data-sb-fate="併"] 等 — 單連結
 * 2) 容器 [data-sb-group="修"] — 其內 a.sidebar-item、a.nav-link、.quick-links a、details>summary
 * 3) body[data-sb-course-auto] — nav#sidebar 內 .course-list 預設「留」，可用 a[data-sb-fate] 覆蓋
 */
(function () {
  function fateClassChar(f) {
    var s = String(f || '');
    if (/留/.test(s)) return 'sb-fate--keep';
    if (/併/.test(s)) return 'sb-fate--merge';
    if (/除/.test(s)) return 'sb-fate--del';
    if (/加/.test(s)) return 'sb-fate--add';
    return 'sb-fate--mod';
  }
  function fateLabel(f) {
    var m = String(f || '').match(/[留併修除加]/);
    return m ? m[0] : '修';
  }
  function injectFate(el, rawFate) {
    if (!el || el.querySelector('.sb-fate')) return;
    var ch = fateLabel(rawFate);
    el.classList.add('sb-row');
    var sp = document.createElement('span');
    sp.className = 'sb-fate ' + fateClassChar(ch);
    sp.textContent = ch;
    sp.setAttribute('title', '施工對標');
    el.appendChild(sp);
  }
  function injectSummaryFate(summaryEl, rawFate) {
    if (!summaryEl || summaryEl.querySelector('.sb-fate')) return;
    summaryEl.classList.add('sb-summary-row');
    var ch = fateLabel(rawFate);
    var sp = document.createElement('span');
    sp.className = 'sb-fate ' + fateClassChar(ch);
    sp.textContent = ch;
    sp.setAttribute('title', '施工對標');
    summaryEl.appendChild(sp);
  }
  function applyExplicitAnchors() {
    document.querySelectorAll('a[data-sb-fate]').forEach(function (a) {
      injectFate(a, a.getAttribute('data-sb-fate'));
    });
  }
  function applyGroups() {
    document.querySelectorAll('[data-sb-group]').forEach(function (sec) {
      var fate = sec.getAttribute('data-sb-group') || '留';
      sec.querySelectorAll('a.sidebar-item, a.nav-link, .quick-links a').forEach(function (a) {
        injectFate(a, fate);
      });
      sec.querySelectorAll('details > summary').forEach(function (sum) {
        injectSummaryFate(sum, fate);
      });
    });
  }
  function applyCourseAuto() {
    if (!document.body.hasAttribute('data-sb-course-auto')) return;
    /* 停用：不在教材側欄自動注入「留」等施工標（使用者端不需看見）。還原施工標：刪除下一行 return。 */
    return;
    var nav = document.getElementById('sidebar');
    if (!nav) return;
    nav.querySelectorAll('.course-list a').forEach(function (a) {
      var f = a.getAttribute('data-sb-fate') || '留';
      injectFate(a, f);
    });
    nav.querySelectorAll('.course-category > h3').forEach(function (h3) {
      if (h3.querySelector('.sb-fate')) return;
      h3.classList.add('sb-heading-row');
      var sp = document.createElement('span');
      sp.className = 'sb-fate sb-fate--keep';
      sp.textContent = '留';
      sp.setAttribute('title', '施工對標（教材保留）');
      h3.appendChild(sp);
    });
    nav.querySelectorAll('.course-sub > h4').forEach(function (h4) {
      if (h4.querySelector('.sb-fate')) return;
      h4.classList.add('sb-heading-row');
      var sp = document.createElement('span');
      sp.className = 'sb-fate sb-fate--keep';
      sp.textContent = '留';
      sp.setAttribute('title', '施工對標（教材保留）');
      h4.appendChild(sp);
    });
  }
  function run() {
    /* 使用者端不顯示「留／併」等施工對標；維護時可暫時註解本行以還原注入。 */
    return;
    applyExplicitAnchors();
    applyGroups();
    applyCourseAuto();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
