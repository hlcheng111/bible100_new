/**
 * 舊入口「一鍵傳送門」橫幅 — 書籤友善降級，不刪除舊頁
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'b100-legacy-portal-style';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = document.createElement('style');
    css.id = STYLE_ID;
    css.textContent = [
      '.b100-legacy-portal {',
      '  position: relative; z-index: 9999;',
      '  margin: 0 0 16px; padding: 14px 16px;',
      '  border-radius: 12px;',
      '  background: linear-gradient(90deg, #fffbeb 0%, #eff6ff 50%, #ecfdf5 100%);',
      '  border: 2px solid #fcd34d;',
      '  box-shadow: 0 4px 16px rgba(15,23,42,0.08);',
      '  font-family: "Microsoft YaHei", "Noto Sans TC", sans-serif;',
      '  font-size: 13px; line-height: 1.55; color: #0f172a;',
      '}',
      '.b100-legacy-portal__icon { font-size: 1.2em; margin-right: 6px; }',
      '.b100-legacy-portal__cta {',
      '  display: inline-block; margin-top: 8px; padding: 10px 16px;',
      '  border-radius: 10px; background: linear-gradient(135deg, #1e40af, #4338ca);',
      '  color: #fff !important; font-weight: 800; text-decoration: none !important;',
      '  box-shadow: 0 4px 12px rgba(30,64,175,0.35);',
      '}',
      '.b100-legacy-portal__cta:hover { opacity: 0.92; transform: translateY(-1px); }',
      '.b100-legacy-portal__note { display: block; margin-top: 6px; font-size: 11px; color: #64748b; }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(css);
  }

  /**
   * @param {Object} cfg
   * @param {string} cfg.message
   * @param {string} cfg.targetUrl
   * @param {string} [cfg.targetLabel]
   * @param {string} [cfg.insertBefore] - CSS selector for insert point
   */
  function show(cfg) {
    cfg = cfg || {};
    if (!cfg.targetUrl) return;
    injectStyles();

    var existing = document.getElementById('b100-legacy-portal');
    if (existing) existing.remove();

    var banner = document.createElement('div');
    banner.id = 'b100-legacy-portal';
    banner.className = 'b100-legacy-portal';
    banner.setAttribute('role', 'status');

    var label = cfg.targetLabel || '👉 點此一鍵傳送至新版入口';
    var msg = cfg.message || '📢 提示：本頁面已升級為更清晰的三層大腦體驗！';

    banner.innerHTML =
      '<div><span class="b100-legacy-portal__icon" aria-hidden="true">📢</span><strong>' + msg + '</strong></div>' +
      '<a class="b100-legacy-portal__cta" href="' + cfg.targetUrl.replace(/"/g, '&quot;') + '" id="b100-legacy-portal-link">' + label + '</a>' +
      '<span class="b100-legacy-portal__note">舊書籤仍可使用；建議改用上方新版入口，左欄導覽與戰情體驗更完整。</span>';

    var anchor = cfg.insertBefore ? document.querySelector(cfg.insertBefore) : null;
    var parent = (anchor && anchor.parentNode) ? anchor.parentNode : (document.body || document.documentElement);
    if (anchor) {
      parent.insertBefore(banner, anchor);
    } else if (document.body && document.body.firstChild) {
      document.body.insertBefore(banner, document.body.firstChild);
    } else if (document.body) {
      document.body.appendChild(banner);
    }

    var link = document.getElementById('b100-legacy-portal-link');
    if (link) {
      link.addEventListener('click', function (e) {
        var url = cfg.targetUrl;
        try {
          if (window.parent && window.parent !== window && window.parent.openChurchPlanningHub) {
            e.preventDefault();
            if (url.indexOf('church_planning/') >= 0 || url.indexOf('index_plan') >= 0) {
              window.parent.openChurchPlanningHub();
              return;
            }
          }
          if (window.parent && window.parent !== window) {
            e.preventDefault();
            window.parent.postMessage({ type: 'navigate', url: url }, '*');
            if (window.parent.document && window.parent.document.getElementById('contentFrame')) {
              window.parent.document.getElementById('contentFrame').src = url;
            }
          }
        } catch (eClick) { /* same-origin only */ }
      });
    }
  }

  /** Auto-init from <script data-legacy-portal ...> */
  function autoInit() {
    var script = document.currentScript;
    if (!script) return;
    var msg = script.getAttribute('data-message');
    var url = script.getAttribute('data-target-url');
    var label = script.getAttribute('data-target-label');
    var before = script.getAttribute('data-insert-before');
    if (!url) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        show({ message: msg, targetUrl: url, targetLabel: label, insertBefore: before });
      });
    } else {
      show({ message: msg, targetUrl: url, targetLabel: label, insertBefore: before });
    }
  }

  global.LegacyPortalBanner = { show: show, autoInit: autoInit };
  autoInit();
})(typeof window !== 'undefined' ? window : this);
