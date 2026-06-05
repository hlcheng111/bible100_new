/**
 * 雲端 API 輔助（給工程師接 fetch 用）
 * 小白請先看：church_ministry/docs/CLOUD_小白上雲.md
 *
 * 使用：在 cloud_config.js 之後、church_data_bridge.js 可選載入本檔
 */
(function (global) {
    'use strict';

    /**
     * 組出完整 URL（path 須以 / 開頭，例如 /members）
     */
    function resolveUrl(path) {
        var cfg = global.CHURCH_CLOUD_CONFIG || {};
        var base = (cfg.API_BASE_URL || '').replace(/\/+$/, '');
        var p = path.charAt(0) === '/' ? path : '/' + path;
        return base + p;
    }

    /**
     * 統一 GET/POST JSON，自動加 Authorization（若有）
     */
    function churchCloudFetch(path, options) {
        options = options || {};
        var cfg = global.CHURCH_CLOUD_CONFIG || {};
        if (!cfg.USE_API) {
            return Promise.reject(new Error(
                '[churchCloudFetch] 目前為本機模式（USE_API=false）。請勿呼叫 API，或先改 cloud_config.js 並確認後端已就緒。'
            ));
        }
        if (!cfg.API_BASE_URL || !String(cfg.API_BASE_URL).trim()) {
            return Promise.reject(new Error(
                '[churchCloudFetch] USE_API=true 時必須設定 CHURCH_CLOUD_CONFIG.API_BASE_URL。'
            ));
        }
        var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
        var auth = typeof cfg.getAuthHeader === 'function' ? cfg.getAuthHeader() : null;
        if (auth) {
            headers.Authorization = auth.indexOf('Bearer') === 0 ? auth : 'Bearer ' + auth;
        }
        var url = resolveUrl(path);
        var init = {
            method: options.method || 'GET',
            headers: headers,
            credentials: options.credentials || 'include'
        };
        if (options.body != null) {
            init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        }
        return fetch(url, init).then(function (res) {
            if (!res.ok) {
                return res.text().then(function (t) {
                    throw new Error('[churchCloudFetch] ' + res.status + ' ' + res.statusText + ' — ' + (t || url));
                });
            }
            var ct = res.headers.get('content-type') || '';
            if (ct.indexOf('application/json') >= 0) return res.json();
            return res.text();
        });
    }

    global.churchCloudFetch = churchCloudFetch;
    global.churchCloudResolveUrl = resolveUrl;
})(typeof window !== 'undefined' ? window : this);
