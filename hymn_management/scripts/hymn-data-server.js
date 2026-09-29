/**
 * 本機詩歌資料寫入服務（開發用）
 * 將 hymn_editor 存檔寫入 data/hymn-overrides.json（overrides / additions）
 *
 * 啟動：node scripts/hymn-data-server.js
 * 預設 http://127.0.0.1:8765
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.HYMN_DATA_PORT || 8765);
const DATA_FILE = path.join(__dirname, '../data/hymn-overrides.json');

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (_) {
    return { overrides: {}, additions: [] };
  }
}

function writeStore(data) {
  if (!data.overrides) data.overrides = {};
  if (!Array.isArray(data.additions)) data.additions = [];
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function sendJson(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(function (req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, { ok: true });
  }
  if (req.method === 'GET' && req.url === '/api/hymn/health') {
    return sendJson(res, 200, { ok: true, file: DATA_FILE });
  }
  if (req.method === 'GET' && req.url === '/api/hymn/overrides') {
    return sendJson(res, 200, readStore());
  }
  if (req.method === 'POST' && (req.url === '/api/hymn/save' || req.url === '/api/hymn/save-override')) {
    let body = '';
    req.on('data', function (chunk) { body += chunk; });
    req.on('end', function () {
      try {
        const payload = JSON.parse(body || '{}');
        const store = readStore();
        if (payload.mode === 'addition' || payload.isNew) {
          const entry = payload.hymn || payload;
          if (!entry.id) entry.id = 'hymn_new_' + Date.now();
          const idx = store.additions.findIndex(function (x) { return x.id === entry.id; });
          if (idx >= 0) store.additions[idx] = entry;
          else store.additions.push(entry);
          writeStore(store);
          return sendJson(res, 200, { ok: true, mode: 'addition', id: entry.id });
        }
        const id = payload.id || (payload.hymn && payload.hymn.id);
        const patch = payload.patch || payload.hymn || payload;
        if (!id) return sendJson(res, 400, { ok: false, error: 'missing id' });
        store.overrides[id] = Object.assign({}, store.overrides[id] || {}, patch);
        delete store.overrides[id].id;
        writeStore(store);
        return sendJson(res, 200, { ok: true, mode: 'override', id: id });
      } catch (e) {
        return sendJson(res, 500, { ok: false, error: String(e.message || e) });
      }
    });
    return;
  }
  sendJson(res, 404, { ok: false, error: 'not found' });
});

server.listen(PORT, '127.0.0.1', function () {
  console.log('🎵 hymn-data-server http://127.0.0.1:' + PORT);
  console.log('   POST /api/hymn/save  → data/hymn-overrides.json');
});
