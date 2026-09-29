/**
 * B100 · 渲染彩色功能地图表
 * B100FeatureMap.render(container, { title, lead, rows, footHtml })
 */
(function (global) {
  'use strict';

  function esc(s) {
    var d = global.document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function renderRow(row) {
    var tone = row.tone ? ' b100-fmap__row--' + row.tone : '';
    var entry = row.href
      ? '<a href="' + esc(row.href) + '">' + esc(row.entry) + '</a>'
      : esc(row.entry || '');
    return (
      '<tr class="b100-fmap__row' + tone + '">' +
        '<td class="b100-fmap__entry">' + entry + '</td>' +
        '<td>' + esc(row.does || '') + '</td>' +
        '<td>' + esc(row.source || '') + '</td>' +
        '<td class="b100-fmap__tip">' + esc(row.tip || '') + '</td>' +
      '</tr>'
    );
  }

  function render(container, cfg) {
    if (!container || !cfg) return;
    var headers = cfg.headers || ['入口', '做什么', '数据从哪来', '小白长知识'];
    var headCells = headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('');
    var rows = (cfg.rows || []).map(renderRow).join('');
    var lead = cfg.lead
      ? '<p class="b100-fmap__lead">' + esc(cfg.lead) + '</p>'
      : '';
    var foot = cfg.footHtml ? '<div class="b100-fmap__foot">' + cfg.footHtml + '</div>' : '';
    container.className = (container.className ? container.className + ' ' : '') + 'b100-fmap';
    container.innerHTML =
      '<div class="b100-fmap__head">' + esc(cfg.title || '功能地图') + '</div>' +
      lead +
      '<div class="b100-fmap__table-wrap"><table class="b100-fmap__table">' +
        '<thead><tr>' + headCells + '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table></div>' +
      foot;
  }

  global.B100FeatureMap = { render: render };
})(typeof window !== 'undefined' ? window : global);
