/**
 * Church Ministry · 長執報告工具（W5+）
 * CSV（UTF-8 BOM）＋列印表格視窗。頁面可選用或自備同等函式。
 */
(function (global) {
  'use strict';

  function csvEsc(v) {
    var s = v == null ? '' : String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function downloadCsv(filename, lines) {
    var blob = new Blob(['\ufeff' + (lines || []).join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      try {
        URL.revokeObjectURL(a.href);
      } catch (e) {}
    }, 800);
  }

  /**
   * @param {string} title
   * @param {string[]} headers
   * @param {Array<Array<*>>} rows
   */
  function printTable(title, headers, rows) {
    var esc = function (t) {
      return String(t == null ? '' : t)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };
    var th = (headers || [])
      .map(function (h) {
        return '<th>' + esc(h) + '</th>';
      })
      .join('');
    var body = (rows || [])
      .map(function (r) {
        return (
          '<tr>' +
          (r || [])
            .map(function (c) {
              return '<td>' + esc(c) + '</td>';
            })
            .join('') +
          '</tr>'
        );
      })
      .join('');
    var w = window.open('', '_blank');
    if (!w) {
      alert('瀏覽器封鎖彈窗，請允許後再列印');
      return;
    }
    w.document.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' +
        esc(title) +
        '</title><style>' +
        'body{font-family:system-ui,sans-serif;padding:16px;color:#111}' +
        'h1{font-size:18px;margin:0 0 12px}' +
        'table{border-collapse:collapse;width:100%;font-size:12px}' +
        'th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}' +
        'th{background:#f3f4f6}' +
        '@media print{button{display:none}}' +
        '</style></head><body>' +
        '<h1>' +
        esc(title) +
        '</h1>' +
        '<p style="font-size:11px;color:#666">匯出時間：' +
        esc(new Date().toLocaleString()) +
        '</p>' +
        '<table><thead><tr>' +
        th +
        '</tr></thead><tbody>' +
        body +
        '</tbody></table>' +
        '<p style="margin-top:16px"><button onclick="window.print()">列印</button></p>' +
        '<script>window.onload=function(){try{window.print()}catch(e){}}<\/script>' +
        '</body></html>'
    );
    w.document.close();
  }

  function rowsFromObjects(list, keys) {
    return (list || []).map(function (o) {
      return (keys || []).map(function (k) {
        return o && o[k] != null ? o[k] : '';
      });
    });
  }

  global.CmReportUtils = {
    csvEsc: csvEsc,
    downloadCsv: downloadCsv,
    printTable: printTable,
    rowsFromObjects: rowsFromObjects
  };
})(typeof window !== 'undefined' ? window : this);
