/**
 * 全站功能頁成熟度標籤 + 可選暖色頂部提示
 * <script src=".../page_capability_badge.js" data-status="trial|demo|ai|ai-sim" data-warm-banner="trial|demo"></script>
 */
(function () {
  'use strict';
  var script = document.currentScript;
  var explicit = script && script.getAttribute('data-status');
  var warmBanner = script && script.getAttribute('data-warm-banner');
  var path = (location.pathname || '').replace(/\\/g, '/').toLowerCase();

  var LABELS = {
    demo: { text: '填表範例 · Demo', bg: '#fffbeb', border: '#fcd34d', color: '#92400e' },
    trial: { text: '✓ 試用版 · 資料存於本機', bg: '#ecfdf5', border: '#6ee7b7', color: '#047857' },
    ai: { text: 'AI 草稿 · 需人工確認', bg: '#f5f3ff', border: '#c4b5fd', color: '#5b21b6' },
    'ai-sim': { text: '✓ 試用版 · AI 模擬', bg: '#f5f3ff', border: '#c4b5fd', color: '#5b21b6' }
  };

  var WARM_COPY = {
    trial: '同工平安！您在此輸入的資料會安全地暫存在您的瀏覽器（LocalStorage）中，重新整理不會消失，適合日常模擬演練。',
    demo: '未來功能預留：此頁面目前為前端 UI 範例，暫無底層數據對接。'
  };

  function detectStatus() {
    if (explicit && LABELS[explicit]) return explicit;
    if (path.indexOf('/_landing/') >= 0 || path.indexOf('outreach-strategy') >= 0) return 'demo';
    if (path.indexOf('crm_automation') >= 0) return 'ai-sim';
    if (path.indexOf('copilot') >= 0 || path.indexOf('group-report-copilot') >= 0) return 'ai';
    if (
      path.indexOf('church_planning/') >= 0 ||
      path.indexOf('volunteer_shift') >= 0 ||
      path.indexOf('visitation_followup') >= 0 ||
      path.indexOf('member-integrated') >= 0 ||
      path.indexOf('visitation_index') >= 0 ||
      path.indexOf('finance-integrated') >= 0 ||
      path.indexOf('church_ministry/dashboard') >= 0 ||
      path.indexOf('assessment-os-hub') >= 0 ||
      path.indexOf('cta-os-war-room') >= 0
    ) return 'trial';
    if (path.indexOf('talent_ministry_matching') >= 0 || path.indexOf('spiritual_gifts') >= 0) return 'demo';
    return null;
  }

  function detectWarmBanner(status) {
    if (warmBanner && WARM_COPY[warmBanner]) return warmBanner;
    if (status === 'trial' && (path.indexOf('member-integrated') >= 0 || path.indexOf('visitation_index') >= 0)) return 'trial';
    if (status === 'demo') return 'demo';
    return null;
  }

  function injectBadge(status) {
    if (!status || !LABELS[status]) return;
    if (document.getElementById('b100-capability-badge')) return;
    var cfg = LABELS[status];
    var el = document.createElement('div');
    el.id = 'b100-capability-badge';
    el.setAttribute('role', 'status');
    el.textContent = cfg.text;
    el.style.cssText =
      'position:fixed;top:8px;right:8px;z-index:9999;max-width:240px;padding:6px 10px;' +
      'font-size:10px;font-weight:700;line-height:1.35;border-radius:8px;box-shadow:0 4px 12px rgba(15,23,42,0.12);' +
      'background:' + cfg.bg + ';border:1px solid ' + cfg.border + ';color:' + cfg.color + ';';
    document.body.appendChild(el);
  }

  function injectWarmBanner(kind) {
    if (!kind || !WARM_COPY[kind] || document.getElementById('b100-warm-banner')) return;
    var bar = document.createElement('div');
    bar.id = 'b100-warm-banner';
    bar.setAttribute('role', 'note');
    bar.textContent = WARM_COPY[kind];
    bar.style.cssText =
      'margin:0 0 12px;padding:10px 14px;font-size:12px;line-height:1.65;border-radius:10px;' +
      (kind === 'demo'
        ? 'background:#fffbeb;border:1px solid #fcd34d;color:#92400e;'
        : 'background:#fefce8;border:1px solid #fde047;color:#713f12;');
    var body = document.body;
    if (body.firstChild) body.insertBefore(bar, body.firstChild);
    else body.appendChild(bar);
  }

  function run() {
    var status = detectStatus();
    injectBadge(status);
    injectWarmBanner(detectWarmBanner(status));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
