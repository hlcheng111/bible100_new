/**
 * Google Sheets SSOT 適配器（CRM-5 · v2 契約）
 * 需設定 CHURCH_CLOUD_CONFIG.USE_SHEETS_SSOT 與 SHEETS_WEB_APP_URL
 * 回應信封：{ ok, action, data, meta, error }
 */
(function (global) {
    'use strict';

    function cfg() {
        return global.CHURCH_CLOUD_CONFIG || {};
    }

    function sheetsEnabled() {
        var c = cfg();
        return !!(c.USE_SHEETS_SSOT === true && c.SHEETS_WEB_APP_URL && String(c.SHEETS_WEB_APP_URL).trim());
    }

    function buildUrl(action, extra) {
        var base = String(cfg().SHEETS_WEB_APP_URL || '').trim();
        var sep = base.indexOf('?') >= 0 ? '&' : '?';
        var q = 'action=' + encodeURIComponent(action) + '&format=json';
        if (extra) {
            Object.keys(extra).forEach(function (k) {
                if (extra[k] != null) q += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(String(extra[k]));
            });
        }
        return base + sep + q;
    }

    function sheetsFetch(action, opts) {
        opts = opts || {};
        if (!sheetsEnabled()) {
            return Promise.reject(new Error('SHEETS_SSOT_DISABLED'));
        }
        var url = buildUrl(action, opts.query || {});
        var init = { method: opts.method || 'GET', credentials: 'omit' };
        if (opts.body != null) {
            init.method = 'POST';
            init.headers = { 'Content-Type': 'application/json' };
            init.body = JSON.stringify(opts.body);
        }
        return fetch(url, init).then(function (res) {
            return res.json();
        }).then(function (envelope) {
            if (!envelope || envelope.ok !== true) {
                var msg = (envelope && envelope.error && envelope.error.message) || 'Sheets SSOT error';
                throw new Error(msg);
            }
            return envelope.data;
        });
    }

    global.ChurchSheetsSsot = {
        isEnabled: sheetsEnabled,

        pullMembers: function () {
            return sheetsFetch('getMembers', { query: { pageSize: 500 } });
        },

        pushMembersBatch: function (members) {
            return sheetsFetch('saveMembersBatch', {
                method: 'POST',
                body: { members: members || [] }
            });
        },

        appendPastoralEvent: function (event) {
            return sheetsFetch('appendPastoralEvent', {
                method: 'POST',
                body: event
            });
        },

        getCrmSnapshot: function () {
            return sheetsFetch('getCrmSnapshot');
        }
    };
})(typeof window !== 'undefined' ? window : this);
