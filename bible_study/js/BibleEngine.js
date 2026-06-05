/**
 * 聖經研讀中心：終極數據引擎
 * 雙規並行：優先載入純淨 JSON，失敗則嘗試 SQLite
 * 標準格式：{version, data:[{b,c,v,t}]} / {source, items:[{book,chapter,title,content}]}
 */
(function (global) {
    'use strict';

    const BibleEngine = {
        db: {},
        SQL: null,

        // 純淨 JSON 路徑（scripts/export_clean_json.py 輸出，相對於伺服器根目錄）
        // 檔名大小寫須與磁碟一致：Linux／雲端主機區分大小寫（kjv.json ≠ KJV.json）
        BIBLE_PATHS: [
            'data/bibles/clean/KJV.json',
            'data/bibles/clean/NIV.json',
            'data/bibles/clean/信望爱(和合本).json',
            'data/bibles/clean/吕振中.json'
        ],
        BIBLE_KEYS: { 'KJV.json': 'kjv', 'NIV.json': 'niv', '信望爱(和合本).json': 'faith', '吕振中.json': 'luzhen' },
        BIBLE_NAMES: { kjv: 'KJV', niv: 'NIV', faith: '信望爱(和合本)', luzhen: '吕振中' },
        COMM_PATHS: [
            { path: 'data/cj/clean/Comprehensive.json', key: 'comprehensive', name: '综合解读' }
        ],

        async load(name, path) {
            try {
                const base = this._base();
                const url = (path.startsWith('http') || path.startsWith('/')) ? path : base + path;
                const response = await fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now());
                if (!response.ok) {
                    console.warn('❌ ' + name + ' HTTP ' + response.status + ': ' + path);
                    return null;
                }
                const arrayBuffer = await response.arrayBuffer();
                const header = new TextDecoder().decode(arrayBuffer.slice(0, 15));

                if (header.includes('SQLite format')) {
                    return await this.initSqlite(name, arrayBuffer);
                }
                const text = new TextDecoder('utf-8').decode(arrayBuffer);
                return this.initJson(name, text);
            } catch (e) {
                console.error('❌ ' + name + ' 啟動失敗:', e);
                return null;
            }
        },

        initJson(name, text) {
            try {
                let clean = text.trim();
                const start = clean.indexOf('{');
                const end = clean.lastIndexOf('}') + 1;
                if (start >= 0 && end > start) clean = clean.substring(start, end);
                const obj = JSON.parse(clean);
                this.db[name] = obj;
                console.log('✅ ' + name + ' (JSON) 已就緒');
                return { type: 'json', data: obj };
            } catch (e) {
                throw new Error('JSON 格式毀損，請執行 scripts/export_clean_json.py 重新生成');
            }
        },

        async initSqlite(name, buffer) {
            if (typeof initSqlJs === 'undefined') {
                await this._loadSqlJs();
            }
            if (typeof initSqlJs === 'undefined') throw new Error('缺少 SQL.js 引擎');
            this.SQL = this.SQL || await initSqlJs({ locateFile: f => 'https://sql.js.org/dist/' + f });
            this.db[name] = new this.SQL.Database(new Uint8Array(buffer));
            console.log('✅ ' + name + ' (SQLite) 已就緒');
            return { type: 'sqlite', data: this.db[name] };
        },

        _loadSqlJs() {
            return new Promise((resolve) => {
                if (typeof initSqlJs !== 'undefined') { resolve(); return; }
                const s = document.createElement('script');
                s.src = 'https://sql.js.org/dist/sql-wasm.js';
                s.onload = () => resolve();
                s.onerror = () => resolve();
                document.head.appendChild(s);
            });
        },

        _base() {
            const loc = typeof window !== 'undefined' && window.location;
            if (!loc) return '';
            // file:// 且頁面在 bible_study/ 底下時，fetch 的相對路徑須相對於 bible100_new 根（非 bible_study/）
            if (loc.protocol === 'file:') {
                try {
                    const path = decodeURIComponent(loc.pathname || '').replace(/\\/g, '/');
                    if (path.toLowerCase().includes('/bible_study/')) {
                        return new URL('../', loc.href).href;
                    }
                } catch (e) {}
                return '';
            }
            return (loc.origin || '').replace(/\/?$/, '/');
        },

        // === 相容 universal-data-loader 的 API ===
        async initialize() {
            console.log('🚀 聖經研讀引擎啟動...');
            const bibles = {};
            const commentaries = {};

            for (const p of this.BIBLE_PATHS) {
                const fname = p.split('/').pop();
                const key = this.BIBLE_KEYS[fname] || fname.replace('.json', '');
                const name = this.BIBLE_NAMES[key] || key;
                const r = await this.load('bible:' + key, p);
                if (r && r.type === 'json' && r.data) {
                    bibles[key] = { data: r.data, name, format: 'json', loaded: true };
                }
            }

            for (const c of this.COMM_PATHS) {
                const r = await this.load('comm:' + c.key, c.path);
                if (r && r.type === 'json' && r.data) {
                    commentaries[c.key] = { data: r.data, name: c.name, format: 'json', loaded: true };
                }
            }

            this.db.bibles = bibles;
            this.db.commentaries = commentaries;
            const total = Object.keys(bibles).length + Object.keys(commentaries).length;
            console.log('🎉 數據引擎就緒，已載入 ' + total + ' 個資源');
            return true;
        },

        getAvailableBibles() {
            return Object.keys(this.db.bibles || {}).filter(k => this.db.bibles[k] && this.db.bibles[k].loaded);
        },

        getAvailableCommentaries() {
            return Object.keys(this.db.commentaries || {}).filter(k => this.db.commentaries[k] && this.db.commentaries[k].loaded);
        },

        async queryBible(version, book, chapter) {
            const meta = (this.db.bibles || {})[version];
            if (!meta || !meta.loaded) throw new Error('版本未載入: ' + version);
            const d = meta.data;
            if (!d || !d.data) throw new Error('無經文資料');
            const verses = d.data.filter(v => v.b === book && v.c === chapter).sort((a, b) => a.v - b.v);
            return verses.map(v => ({ verse: v.v, text: v.t || '' }));
        },

        async queryCommentary(key, book, chapter) {
            const meta = (this.db.commentaries || {})[key];
            if (!meta || !meta.loaded) throw new Error('註釋未載入: ' + key);
            const d = meta.data;
            const items = (d.items || d.commentaries || []).filter(i => i.book === book && i.chapter === chapter);
            return items.map(i => ({
                fromVerse: i.fromVerse || 0,
                toVerse: i.toVerse || 0,
                content: i.content || ''
            }));
        }
    };

    // 掛載到 window，相容舊 API
    global.BibleEngine = BibleEngine;
    global.universalDataLoader = {
        databases: { bibles: {}, commentaries: {} },
        getAvailableBibles: () => BibleEngine.getAvailableBibles(),
        getAvailableCommentaries: () => BibleEngine.getAvailableCommentaries(),
        initialize: () => BibleEngine.initialize(),
        queryBible: (v, b, c) => BibleEngine.queryBible(v, b, c),
        queryCommentary: (k, b, c) => BibleEngine.queryCommentary(k, b, c)
    };

    global.initUniversalDataLoader = async function () {
        await BibleEngine.initialize();
        global.universalDataLoader.databases.bibles = BibleEngine.db.bibles || {};
        global.universalDataLoader.databases.commentaries = BibleEngine.db.commentaries || {};
        return true;
    };

    global.queryBible = function (version, book, chapter) {
        return BibleEngine.queryBible(version, book, chapter);
    };

    global.queryCommentary = function (key, book, chapter) {
        return BibleEngine.queryCommentary(key, book, chapter);
    };

})(typeof window !== 'undefined' ? window : this);
