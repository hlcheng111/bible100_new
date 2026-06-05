/**
 * 教會 CRM 本機 Auth + RBAC（CRM-5）
 * Session: church_auth_session_v1
 * 正式環境應改為後端 JWT；此檔供 demo / 本機 API 同源登入。
 */
(function (global) {
    'use strict';

    var SESSION_KEY = 'church_auth_session_v1';

    var ROLES = {
        pastor: { label: '牧者', level: 100 },
        admin: { label: '行政', level: 90 },
        group_leader: { label: '小組長', level: 60 },
        volunteer: { label: '志工', level: 40 },
        viewer: { label: '檢視', level: 10 }
    };

    var PERMISSIONS = {
        pastor: ['*'],
        admin: [
            'members.read', 'members.write', 'members.export',
            'pastoral.read', 'pastoral.write',
            'visitation.read', 'visitation.write',
            'volunteer.read', 'volunteer.write',
            'finance.read', 'finance.write', 'crm.admin', 'ai.draft'
        ],
        group_leader: [
            'members.read', 'pastoral.read', 'pastoral.write',
            'visitation.read', 'visitation.write', 'ai.draft'
        ],
        volunteer: ['members.read', 'visitation.read', 'ai.draft'],
        viewer: ['members.read', 'pastoral.read', 'visitation.read', 'finance.read']
    };

    var DEMO_USERS = {
        pastor: { password: 'demo123', displayName: '張牧者', role: 'pastor', church_id: 'default' },
        admin: { password: 'demo123', displayName: '李行政', role: 'admin', church_id: 'default' },
        leader: { password: 'demo123', displayName: '王小組長', role: 'group_leader', church_id: 'default' },
        volunteer: { password: 'demo123', displayName: '陳志工', role: 'volunteer', church_id: 'default' },
        viewer: { password: 'demo123', displayName: '訪客', role: 'viewer', church_id: 'default' }
    };

    function readSession() {
        try {
            var raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            var s = JSON.parse(raw);
            if (!s || !s.token || !s.role) return null;
            if (s.expires_at && new Date(s.expires_at).getTime() < Date.now()) {
                localStorage.removeItem(SESSION_KEY);
                return null;
            }
            return s;
        } catch (e) {
            return null;
        }
    }

    function roleHas(permList, need) {
        if (!permList || !permList.length) return false;
        if (permList.indexOf('*') >= 0) return true;
        if (permList.indexOf(need) >= 0) return true;
        var prefix = need.split('.')[0];
        return permList.indexOf(prefix + '.*') >= 0 || permList.indexOf(prefix + '.write') >= 0 && need.indexOf('.read') >= 0;
    }

    var api = {
        SESSION_KEY: SESSION_KEY,
        ROLES: ROLES,
        PERMISSIONS: PERMISSIONS,

        isAuthRequired: function () {
            var c = global.CHURCH_CLOUD_CONFIG || {};
            return !!(c.REQUIRE_AUTH === true || c.USE_API === true);
        },

        getSession: function () {
            return readSession();
        },

        isLoggedIn: function () {
            if (!this.isAuthRequired()) return true;
            return !!readSession();
        },

        getRole: function () {
            var s = readSession();
            return s ? s.role : null;
        },

        getToken: function () {
            var s = readSession();
            return s ? s.token : null;
        },

        can: function (permission) {
            if (!this.isAuthRequired()) return true;
            var s = readSession();
            if (!s) return false;
            var list = PERMISSIONS[s.role] || [];
            return roleHas(list, permission);
        },

        assertCan: function (permission) {
            if (!this.can(permission)) {
                var err = new Error('RBAC_DENIED: ' + permission);
                err.code = 'RBAC_DENIED';
                throw err;
            }
        },

        maskMemberForRole: function (member) {
            if (!member) return member;
            var s = readSession();
            var role = s ? s.role : 'pastor';
            if (role === 'pastor' || role === 'admin' || role === 'group_leader') {
                return member;
            }
            var m = Object.assign({}, member);
            if (role === 'volunteer' || role === 'viewer') {
                if (m.phone) m.phone = '***';
                if (m.email) m.email = '***';
                if (m.address) m.address = '***';
            }
            return m;
        },

        loginLocal: function (username, password) {
            var u = String(username || '').trim();
            var row = DEMO_USERS[u];
            if (!row || row.password !== password) {
                return { ok: false, error: '帳號或密碼錯誤' };
            }
            var token = 'local_' + u + '_' + Date.now().toString(36);
            var session = {
                user_id: u,
                display_name: row.displayName,
                role: row.role,
                church_id: row.church_id,
                token: token,
                issued_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 12 * 3600 * 1000).toISOString()
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return { ok: true, session: session };
        },

        loginWithApiResponse: function (payload) {
            if (!payload || !payload.token || !payload.role) {
                return { ok: false, error: 'invalid_api_session' };
            }
            var session = {
                user_id: payload.user_id || payload.userId,
                display_name: payload.display_name || payload.displayName || payload.user_id,
                role: payload.role,
                church_id: payload.church_id || 'default',
                token: payload.token,
                issued_at: payload.issued_at || new Date().toISOString(),
                expires_at: payload.expires_at || new Date(Date.now() + 12 * 3600 * 1000).toISOString()
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return { ok: true, session: session };
        },

        logout: function () {
            localStorage.removeItem(SESSION_KEY);
            return { ok: true };
        }
    };

    global.ChurchAuth = api;
})(typeof window !== 'undefined' ? window : this);
