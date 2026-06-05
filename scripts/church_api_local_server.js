#!/usr/bin/env node
/**
 * 本機多同工 CRM API（CRM-5 demo）
 * 用法：node scripts/church_api_local_server.js
 * 然後 cloud_config.js：USE_API=true, API_BASE_URL='http://127.0.0.1:8787', REQUIRE_AUTH=true
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.env.CHURCH_API_PORT || 8787);
const DATA_FILE = path.join(__dirname, '..', 'data', 'church_api_store.json');

const USERS = {
  pastor: { password: 'demo123', role: 'pastor', display_name: '張牧者' },
  admin: { password: 'demo123', role: 'admin', display_name: '李行政' },
  leader: { password: 'demo123', role: 'group_leader', display_name: '王小組長' },
  volunteer: { password: 'demo123', role: 'volunteer', display_name: '陳志工' },
  viewer: { password: 'demo123', role: 'viewer', display_name: '訪客' }
};

const tokens = new Map();

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {}
  return { members: [], groups: [], missions: [] };
}

function saveStore(store) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

let store = loadStore();

function send(res, code, body) {
  const json = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve) => {
    let buf = '';
    req.on('data', (c) => { buf += c; });
    req.on('end', () => {
      try { resolve(buf ? JSON.parse(buf) : {}); } catch (e) { resolve({}); }
    });
  });
}

function authUser(req) {
  const h = req.headers.authorization || '';
  const token = h.replace(/^Bearer\s+/i, '').trim();
  if (!token || !tokens.has(token)) return null;
  return tokens.get(token);
}

function requireRole(req, res, roles) {
  const u = authUser(req);
  if (!u) {
    send(res, 401, { ok: false, error: { code: 'UNAUTHORIZED', message: 'login required' } });
    return null;
  }
  if (roles && roles.length && !roles.includes(u.role) && u.role !== 'pastor') {
    send(res, 403, { ok: false, error: { code: 'FORBIDDEN', message: 'rbac' } });
    return null;
  }
  return u;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '';

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await readBody(req);
    const row = USERS[body.username];
    if (!row || row.password !== body.password) {
      send(res, 401, { ok: false, error: { message: 'invalid credentials' } });
      return;
    }
    const token = 'tok_' + Date.now().toString(36);
    const session = {
      token,
      user_id: body.username,
      role: row.role,
      display_name: row.display_name,
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 12 * 3600000).toISOString()
    };
    tokens.set(token, session);
    send(res, 200, { ok: true, data: session });
    return;
  }

  if (pathname === '/api/members' && req.method === 'GET') {
    const u = requireRole(req, res, ['pastor', 'admin', 'group_leader', 'volunteer', 'viewer']);
    if (!u) return;
    send(res, 200, { ok: true, items: store.members, total: store.members.length });
    return;
  }

  if (pathname === '/api/members' && req.method === 'POST') {
    const u = requireRole(req, res, ['pastor', 'admin']);
    if (!u) return;
    const body = await readBody(req);
    const idx = store.members.findIndex((m) => String(m.memberId || m.id) === String(body.memberId || body.id));
    if (idx >= 0) store.members[idx] = Object.assign({}, store.members[idx], body);
    else store.members.push(body);
    saveStore(store);
    send(res, 200, { ok: true, data: body });
    return;
  }

  if (pathname === '/api/groups' && req.method === 'GET') {
    const u = requireRole(req, res, ['pastor', 'admin', 'group_leader', 'viewer']);
    if (!u) return;
    send(res, 200, { ok: true, items: store.groups });
    return;
  }

  if (pathname === '/api/visitation/missions' && req.method === 'GET') {
    const u = requireRole(req, res, ['pastor', 'admin', 'group_leader', 'volunteer', 'viewer']);
    if (!u) return;
    send(res, 200, { ok: true, items: store.missions });
    return;
  }

  if (pathname === '/api/visitation/missions' && req.method === 'POST') {
    const u = requireRole(req, res, ['pastor', 'admin', 'group_leader']);
    if (!u) return;
    const body = await readBody(req);
    store.missions.push(body);
    saveStore(store);
    send(res, 200, { ok: true, data: body });
    return;
  }

  if (pathname === '/api/health') {
    send(res, 200, { ok: true, service: 'church-crm-api-local', port: PORT });
    return;
  }

  send(res, 404, { ok: false, error: { message: 'not found', path: pathname } });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Church CRM local API http://127.0.0.1:' + PORT);
  console.log('Login: pastor/demo123  |  Set USE_API=true in cloud_config.js');
});
