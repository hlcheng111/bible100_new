/**
 * 一次性修補 sidebar_playlist.html：歌詞全文搜尋
 * node scripts/patch-sidebar-lyrics-search.js
 */
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../sidebar_playlist.html');
let h = fs.readFileSync(p, 'utf8');

const injectBefore = '      function filterAndRender() {';
const lyricsVars = `      var hymnLyricsById = null;
      function loadHymnLyricsIndex() {
        if (hymnLyricsById) return Promise.resolve(hymnLyricsById);
        return fetch('data/hymn-lyrics-index.json').then(function(r){ return r.ok ? r.json() : {items:[]}; }).catch(function(){ return {items:[]}; }).then(function(d){
          hymnLyricsById = {};
          (d.items||[]).forEach(function(row){ if(row&&row.id) hymnLyricsById[row.id]=(row.text||''); });
          return hymnLyricsById;
        });
      }

`;

if (!h.includes('loadHymnLyricsIndex')) {
  h = h.replace(injectBefore, lyricsVars + injectBefore);
}

const oldFilter = `function filterAndRender() {
        var field = document.getElementById('fieldSelect').value;
        var q = (document.getElementById('searchInput').value || '').trim();
        var hymnal = (document.getElementById('hymnalSelect') && document.getElementById('hymnalSelect').value) || '';
        var list = allHymns;
        if (hymnal) list = list.filter(function(h) { return (h.hymnal || '') === hymnal; });
        var totalInScope = list.length;
        if (q) {
          var qLower = q.toLowerCase();
          list = list.filter(function(h) {
            var v = getFieldValue(h, field);
            return v.toLowerCase().indexOf(qLower) >= 0;
          });
        }
        list.sort(function(a, b) {
          var va = getFieldValue(a, field);
          var vb = getFieldValue(b, field);
          return (va || '').localeCompare(vb || '', 'zh');
        });
        renderList(list, totalInScope, field);
      }`;

const newFilter = `function filterAndRender() {
        var field = document.getElementById('fieldSelect').value;
        var q = (document.getElementById('searchInput').value || '').trim();
        var hymnal = (document.getElementById('hymnalSelect') && document.getElementById('hymnalSelect').value) || '';
        function runFilter(lyricsMap) {
          var list = allHymns;
          if (hymnal) list = list.filter(function(h) { return (h.hymnal || '') === hymnal; });
          var totalInScope = list.length;
          if (q) {
            var qLower = q.toLowerCase();
            list = list.filter(function(h) {
              if (field === 'lyrics') {
                var blob = (lyricsMap && lyricsMap[h.id]) ? lyricsMap[h.id].toLowerCase() : '';
                if (blob.indexOf(qLower) >= 0) return true;
                var meta = [h.title_zh,h.title_en,h.author,h.tune,h.number].join(' ').toLowerCase();
                return meta.indexOf(qLower) >= 0;
              }
              var v = getFieldValue(h, field);
              return v.toLowerCase().indexOf(qLower) >= 0;
            });
          }
          list.sort(function(a, b) {
            var va = field === 'lyrics' ? (a.title_zh || a.title_en || '') : getFieldValue(a, field);
            var vb = field === 'lyrics' ? (b.title_zh || b.title_en || '') : getFieldValue(b, field);
            return (va || '').localeCompare(vb || '', 'zh');
          });
          renderList(list, totalInScope, field);
        }
        if (field === 'lyrics') {
          loadHymnLyricsIndex().then(function(map){ runFilter(map); });
        } else {
          runFilter(null);
        }
      }
      window.filterAndRender = filterAndRender;`;

if (h.includes(oldFilter)) {
  h = h.replace(oldFilter, newFilter);
  fs.writeFileSync(p, h, 'utf8');
  console.log('✅ patched filterAndRender for lyrics search');
} else if (h.includes('loadHymnLyricsIndex')) {
  console.log('ℹ️ already patched');
} else {
  console.error('❌ filterAndRender block not found');
  process.exit(1);
}
