const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../sidebar_playlist.html');
let h = fs.readFileSync(p, 'utf8');

const oldTo = `function toHymnUrl(sourcePath) {
        if (!sourcePath) return '#';
        return 'hymn/' + (sourcePath || '').replace(/^\\.\\.\\//, '');
      }`;

const newTo = `function encodeHymnPath(url) {
        if (!url || url === '#') return '#';
        return url.split('/').map(function(part, i) {
          return i === 0 ? part : encodeURIComponent(part);
        }).join('/');
      }
      function toHymnUrl(sourcePath) {
        if (!sourcePath) return '#';
        return encodeHymnPath('hymn/' + (sourcePath || '').replace(/^\\.\\.\\//, ''));
      }`;

if (!h.includes('encodeHymnPath') && h.includes('function toHymnUrl')) {
  h = h.replace(oldTo.replace(/\n/g, '\r\n'), newTo.replace(/\n/g, '\r\n'));
  if (!h.includes('encodeHymnPath')) h = h.replace(oldTo, newTo);
}

const oldItem = `html += '<div class="result-item" data-url="' + esc(url) + '" data-id="' + esc(h.id || '') + '">';
          html += '<span class="num">' + esc(h.number || '') + '</span>';
          html += '<div class="content">';
          html += '<span class="primary">' + esc(primaryVal) + '</span>';
          if (secondaryVal) html += '<span class="secondary">' + esc(secondaryVal) + '</span>';
          html += '</div></div>';`;

const newItem = `html += '<a class="result-item" href="' + esc(url) + '" target="contentFrame" rel="noopener" data-id="' + esc(h.id || '') + '" title="開啟原詩全頁（含樂譜）">';
          html += '<span class="num">' + esc(h.number || '') + '</span>';
          html += '<div class="content">';
          html += '<span class="primary">' + esc(primaryVal) + '</span>';
          if (secondaryVal) html += '<span class="secondary">' + esc(secondaryVal) + '</span>';
          html += '</div></a>';`;

if (!h.includes('target="contentFrame" rel="noopener"')) {
  h = h.replace(oldItem.replace(/\n/g, '\r\n'), newItem.replace(/\n/g, '\r\n'));
  if (!h.includes('target="contentFrame"')) h = h.replace(oldItem, newItem);
}

const clickStart = h.indexOf("container.querySelectorAll('.result-item')");
if (clickStart > 0 && h.includes('postMessage({ type: \'navigate\'')) {
  const clickEnd = h.indexOf('});', clickStart) + 3;
  const clickEnd2 = h.indexOf('});', clickEnd) + 3;
  h = h.slice(0, clickStart) + '/* 點歌：<a target="contentFrame"> 直開舊 .htm 全頁 */' + h.slice(clickEnd2);
}

fs.writeFileSync(p, h, 'utf8');
console.log('encodeHymnPath:', h.includes('encodeHymnPath'));
console.log('anchor:', h.includes('target="contentFrame" rel="noopener"'));
