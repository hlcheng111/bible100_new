/**
 * 檢查 source-hymns 內 http(s) 外部連結是否可達（上雲前）
 * node scripts/check-hymn-external-links.js [--limit=200] [--out=data/hymn-link-audit.json]
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const DATA_DIR = path.join(__dirname, '../data');
const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : 300;
const outArg = args.find(a => a.startsWith('--out='));
const OUT = outArg ? path.join(__dirname, '..', outArg.split('=')[1]) : path.join(DATA_DIR, 'hymn-link-audit.json');

function loadHymns() {
  const manifest = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'source-hymns-manifest.json'), 'utf8'));
  let hymns = [];
  manifest.chunks.forEach(function (name) {
    hymns = hymns.concat(JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8')).hymns || []);
  });
  return hymns;
}

function collectUrls(hymns) {
  const seen = new Map();
  hymns.forEach(function (h) {
    [].concat(h.scoreImages || [], h.scoreImage || [], h.youtube || []).filter(Boolean).forEach(function (u) {
      if (typeof u === 'string' && /^https?:\/\//i.test(u)) {
        if (!seen.has(u)) seen.set(u, { url: u, hymnIds: [] });
        if (seen.get(u).hymnIds.length < 5) seen.get(u).hymnIds.push(h.id);
      }
    });
  });
  return Array.from(seen.values());
}

function headUrl(url) {
  return new Promise(function (resolve) {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { method: 'HEAD', timeout: 12000 }, function (res) {
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on('error', function (e) { resolve({ status: 0, ok: false, error: e.message }); });
    req.on('timeout', function () { req.destroy(); resolve({ status: 0, ok: false, error: 'timeout' }); });
    req.end();
  });
}

(async function main() {
  const hymns = loadHymns();
  const urls = collectUrls(hymns).slice(0, LIMIT);
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const row = urls[i];
    const r = await headUrl(row.url);
    results.push(Object.assign({}, row, r));
    if ((i + 1) % 25 === 0) console.log('checked', i + 1, '/', urls.length);
  }
  const summary = {
    checkedAt: new Date().toISOString(),
    totalChecked: results.length,
    ok: results.filter(r => r.ok).length,
    fail: results.filter(r => !r.ok).length,
    results: results
  };
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2), 'utf8');
  console.log('✅ audit written:', OUT, 'ok:', summary.ok, 'fail:', summary.fail);
})();
