/**
 * 聖經研讀中心 · 統一資料引擎（BS-W1）
 * SSOT 路徑：bible_version_registry.js
 * 相容：window.universalDataLoader / initUniversalDataLoader / queryBible / queryCommentary
 */
(function (global) {
    'use strict';

    var REG = function () { return global.BS_DATA_REGISTRY || { bibles: [], commentaries: [], crossrefs: [], dictionaries: [] }; };

    const BibleEngine = {
        db: { bibles: {}, commentaries: {}, crossrefs: {}, dictionaries: {} },
        sourceStatus: [],
        SQL: null,
        loadingStatus: { total: 0, loaded: 0, failed: 0, mode: 'json' },
        fallbackMode: false,

        _base() {
            const loc = typeof window !== 'undefined' && window.location;
            if (!loc) return '';
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

        _url(path) {
            const base = this._base();
            if (!path) return path;
            if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
            return base + path.replace(/^\.\.\//, '');
        },

        async _loadSqlJs() {
            if (typeof initSqlJs !== 'undefined') return initSqlJs;
            return new Promise(function (resolve) {
                if (typeof initSqlJs !== 'undefined') { resolve(initSqlJs); return; }
                var s = document.createElement('script');
                s.src = 'https://sql.js.org/dist/sql-wasm.js';
                s.onload = function () { resolve(typeof initSqlJs !== 'undefined' ? initSqlJs : null); };
                s.onerror = function () { resolve(null); };
                document.head.appendChild(s);
            });
        },

        async checkSQLAvailability() {
            try {
                var initFn = typeof initSqlJs !== 'undefined' ? initSqlJs : await this._loadSqlJs();
                if (!initFn) return false;
                this.SQL = await initFn({ locateFile: function (f) { return 'https://sql.js.org/dist/' + f; } });
                return !!this.SQL;
            } catch (e) {
                return false;
            }
        },

        _nameVariations(fileName) {
            var names = [fileName];
            if (fileName.indexOf('愛') >= 0) names.push(fileName.replace(/愛/g, '爱'));
            if (fileName.indexOf('爱') >= 0) names.push(fileName.replace(/爱/g, '愛'));
            if (fileName.indexOf('綜合') >= 0) names.push(fileName.replace(/綜合/g, '综合'));
            if (fileName.indexOf('解讀') >= 0) names.push(fileName.replace(/解讀/g, '解读'));
            return names;
        },

        async probePath(path) {
            var url = this._url(path);
            try {
                var res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
                if (res.ok) return { ok: true, path: path, url: url };
            } catch (e) {}
            try {
                var res2 = await fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
                if (res2.ok) return { ok: true, path: path, url: url };
            } catch (e2) {}
            return { ok: false, path: path, url: url };
        },

        async resolveFirstPath(pathList) {
            if (!pathList || !pathList.length) return null;
            for (var i = 0; i < pathList.length; i++) {
                var p = await this.probePath(pathList[i]);
                if (p.ok) return p.path;
            }
            return null;
        },

        async loadRaw(path) {
            var url = this._url(path) + (path.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
            var response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + path);
            return response.arrayBuffer();
        },

        /**
         * 修復「結構性換行被寫成 \n 字面序列」的匯出 JSON（data/cd、串珠類）。
         * 只在字串外把 \n \r \t 轉為空白；字串內的合法轉義保持原樣。
         */
        _unescapeJsonText(text) {
            if (!text || text.indexOf('\\n') < 0 || text.indexOf('\n') >= 0) return text;
            var out = [];
            var inString = false;
            for (var i = 0; i < text.length; i++) {
                var ch = text[i];
                if (inString) {
                    out.push(ch);
                    if (ch === '\\') { i++; if (i < text.length) out.push(text[i]); }
                    else if (ch === '"') inString = false;
                    continue;
                }
                if (ch === '"') { inString = true; out.push(ch); continue; }
                if (ch === '\\') {
                    var next = text[i + 1];
                    if (next === 'n' || next === 'r' || next === 't') { out.push(' '); i++; continue; }
                }
                out.push(ch);
            }
            return out.join('');
        },

        initJson(text) {
            var clean = text.trim().replace(/^\uFEFF/, '').replace(/\0/g, '');
            if (clean.includes('=') && !clean.startsWith('{') && !clean.startsWith('[')) {
                var eq = clean.indexOf('=');
                clean = clean.substring(eq + 1).replace(/;\s*$/, '').trim();
            }
            var start = clean.indexOf('{');
            var end = clean.lastIndexOf('}') + 1;
            if (start >= 0 && end > start) clean = clean.substring(start, end);
            if (clean.startsWith('<')) throw new Error('伺服器回傳 HTML 而非 JSON');
            try {
                return JSON.parse(clean);
            } catch (e1) {
                var unescaped = this._unescapeJsonText(clean);
                if (unescaped !== clean) return JSON.parse(unescaped);
                throw e1;
            }
        },

        decodeBuffer(buffer) {
            var view = new Uint8Array(buffer);
            if (buffer.byteLength < 16) throw new Error('回應過短');
            var header = new TextDecoder().decode(view.slice(0, 15));
            if (header.indexOf('SQLite format') >= 0) return { type: 'sqlite', buffer: buffer };
            var text;
            if (buffer.byteLength >= 2 && view[0] === 0xFF && view[1] === 0xFE) {
                text = new TextDecoder('utf-16le').decode(buffer.slice(2));
            } else if (buffer.byteLength >= 2 && view[0] === 0xFE && view[1] === 0xFF) {
                text = new TextDecoder('utf-16be').decode(buffer.slice(2));
            } else if (buffer.byteLength >= 4 && view[0] === 0x7B && view[1] === 0x00) {
                text = new TextDecoder('utf-16le').decode(buffer);
            } else {
                text = new TextDecoder('utf-8').decode(buffer);
            }
            return { type: 'json', data: this.initJson(text) };
        },

        async initSqlite(buffer) {
            if (!this.SQL) {
                var ok = await this.checkSQLAvailability();
                if (!ok) throw new Error('缺少 SQL.js');
            }
            return new this.SQL.Database(new Uint8Array(buffer));
        },

        getDatabaseTables(db) {
            try {
                var stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
                var tables = [];
                while (stmt.step()) tables.push(stmt.getAsObject().name);
                stmt.free();
                return tables;
            } catch (e) {
                return [];
            }
        },

        async loadEntry(category, entry) {
            var paths = entry.paths || {};
            var jsonPaths = paths.json || [];
            var dbPaths = paths.db || [];
            var resolved = null;
            var format = null;
            var data = null;

            if (!this.fallbackMode && dbPaths.length && this.SQL) {
                resolved = await this.resolveFirstPath(dbPaths);
                if (resolved) {
                    try {
                        var buf = await this.loadRaw(resolved);
                        data = await this.initSqlite(buf);
                        if (this.getDatabaseTables(data).length) format = 'sqlite';
                        else { data = null; format = null; }
                    } catch (e) { data = null; }
                }
            }

            if (!data && jsonPaths.length) {
                resolved = await this.resolveFirstPath(jsonPaths);
                if (resolved) {
                    try {
                        var buf2 = await this.loadRaw(resolved);
                        var parsed = this.decodeBuffer(buf2);
                        if (parsed.type === 'sqlite') {
                            if (this.SQL) {
                                data = await this.initSqlite(parsed.buffer);
                                format = 'sqlite';
                            }
                        } else {
                            data = parsed.data;
                            format = 'json';
                        }
                    } catch (e) { data = null; }
                }
            }

            var loaded = !!data;
            var bucket = this.db[category] || {};
            bucket[entry.key] = {
                data: data,
                name: entry.name,
                format: format || (loaded ? 'json' : 'fallback'),
                loaded: loaded,
                resolvedPath: resolved,
                langs: entry.langs || [],
                tier: entry.tier || 'standard',
                fallback: !loaded
            };
            this.db[category] = bucket;

            return {
                category: category,
                key: entry.key,
                name: entry.name,
                status: loaded ? 'ok' : 'missing',
                format: format,
                path: resolved,
                langs: entry.langs || []
            };
        },

        async initialize() {
            console.log('🚀 BibleEngine 啟動（registry SSOT）…');
            this.sourceStatus = [];
            this.loadingStatus = { total: 0, loaded: 0, failed: 0, mode: 'json' };

            var sqlOk = await this.checkSQLAvailability();
            this.loadingStatus.mode = sqlOk ? 'hybrid' : 'json';
            this.fallbackMode = !sqlOk;

            var reg = REG();
            var jobs = [];
            ['bibles', 'commentaries', 'crossrefs', 'dictionaries'].forEach(function (cat) {
                (reg[cat] || []).forEach(function (entry) { jobs.push({ category: cat, entry: entry }); });
            });
            this.loadingStatus.total = jobs.length;

            for (var i = 0; i < jobs.length; i++) {
                var st = await this.loadEntry(jobs[i].category, jobs[i].entry);
                this.sourceStatus.push(st);
                if (st.status === 'ok') this.loadingStatus.loaded++;
                else this.loadingStatus.failed++;
            }

            console.log('🎉 BibleEngine 就緒：' + this.loadingStatus.loaded + '/' + this.loadingStatus.total);
            return true;
        },

        async probeAllSources() {
            var reg = REG();
            var out = [];
            var cats = ['bibles', 'commentaries', 'crossrefs', 'dictionaries'];
            for (var c = 0; c < cats.length; c++) {
                var cat = cats[c];
                var list = reg[cat] || [];
                for (var i = 0; i < list.length; i++) {
                    var entry = list[i];
                    var paths = (entry.paths && entry.paths.json) || [];
                    var dbPaths = (entry.paths && entry.paths.db) || [];
                    var all = dbPaths.concat(paths);
                    var hit = null;
                    for (var p = 0; p < all.length; p++) {
                        var probe = await this.probePath(all[p]);
                        if (probe.ok) { hit = all[p]; break; }
                    }
                    var loaded = this.db[cat] && this.db[cat][entry.key] && this.db[cat][entry.key].loaded;
                    out.push({
                        category: cat,
                        key: entry.key,
                        name: entry.name,
                        langs: entry.langs || [],
                        tier: entry.tier || '',
                        status: loaded ? 'ok' : (hit ? 'file_ok' : 'missing'),
                        path: hit || (paths[0] || ''),
                        loaded: !!loaded
                    });
                }
            }
            this.sourceStatus = out;
            return out;
        },

        getSourceStatus() { return this.sourceStatus.slice(); },

        getAvailableBibles() {
            return Object.keys(this.db.bibles || {}).filter(function (k) {
                return BibleEngine.db.bibles[k] && BibleEngine.db.bibles[k].loaded;
            });
        },

        getAvailableCommentaries() {
            return Object.keys(this.db.commentaries || {}).filter(function (k) {
                return BibleEngine.db.commentaries[k] && BibleEngine.db.commentaries[k].loaded;
            });
        },

        isDataSourceAvailable(category, key) {
            return !!(this.db[category] && this.db[category][key] && this.db[category][key].loaded);
        },

        safeDecryptContent(text) {
            if (!text || typeof text !== 'string') return text || '';
            if (!text.startsWith('l001w')) return text;
            try {
                var prefix = 'l001wNia4i7hTEMxRHJg3';
                var decoded = atob(text.substring(prefix.length));
                var key = 'Bible100CommentaryKey2024';
                var out = '';
                for (var i = 0; i < decoded.length; i++) {
                    out += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
                }
                return out;
            } catch (e) { return text; }
        },

        formatVerses(rawVerses) {
            return rawVerses.map(function (verse, index) {
                return {
                    verse: verse.verse || verse.Verse || index + 1,
                    text: verse.text || verse.scripture || verse.content || verse.Text || verse.Scripture || verse.t || ''
                };
            });
        },

        async queryJSONBible(data, book, chapter) {
            var verses = [];
            var b = Number(book);
            var ch = Number(chapter);
            if (Array.isArray(data)) {
                verses = data.filter(function (v) {
                    return (Number(v.b || v.book || v.Book) === b) && (Number(v.c || v.chapter || v.Chapter) === ch);
                });
            } else if (data.data && Array.isArray(data.data)) {
                verses = data.data.filter(function (v) { return v.b === b && v.c === ch; });
            } else if (data.Bible && Array.isArray(data.Bible.data)) {
                verses = data.Bible.data.filter(function (v) { return v.Book === b && v.Chapter === ch; });
            } else if (data.verses) {
                verses = data.verses.filter(function (v) {
                    return (Number(v.book || v.Book) === b) && (Number(v.chapter || v.Chapter) === ch);
                });
            }
            if (!verses.length) throw new Error('未找到經文');
            return this.formatVerses(verses);
        },

        async querySQLiteBible(db, book, chapter) {
            var queries = [
                'SELECT verse, text FROM verses WHERE book=? AND chapter=? ORDER BY verse',
                'SELECT Verse as verse, Scripture as text FROM Bible WHERE Book=? AND Chapter=? ORDER BY Verse'
            ];
            for (var i = 0; i < queries.length; i++) {
                try {
                    var stmt = db.prepare(queries[i]);
                    stmt.bind([book, chapter]);
                    var results = [];
                    while (stmt.step()) results.push(stmt.getAsObject());
                    stmt.free();
                    if (results.length) return this.formatVerses(results);
                } catch (e) { continue; }
            }
            throw new Error('SQLite 查無經文');
        },

        async queryBible(version, book, chapter) {
            var meta = (this.db.bibles || {})[version];
            if (!meta || !meta.loaded) throw new Error('版本未載入: ' + version);
            if (meta.format === 'sqlite') return this.querySQLiteBible(meta.data, book, chapter);
            return this.queryJSONBible(meta.data, book, chapter);
        },

        formatCommentary(rawCommentaries) {
            var self = this;
            return rawCommentaries.map(function (commentary, index) {
                var content = commentary.content || commentary.Data || commentary.text || '';
                content = self.safeDecryptContent(content);
                return {
                    id: commentary.id || index + 1,
                    content: content,
                    fromVerse: commentary.from_verse || commentary.FromVerse || commentary.fromVerse || 1,
                    toVerse: commentary.to_verse || commentary.ToVerse || commentary.toVerse || 1,
                    images: commentary.images || []
                };
            });
        },

        async queryJSONCommentary(data, book, chapter) {
            var b = Number(book);
            var ch = Number(chapter);
            var commentaries = [];
            if (Array.isArray(data)) {
                commentaries = data.filter(function (c) {
                    return (Number(c.book || c.Book) === b) && (Number(c.chapter || c.Chapter) === ch);
                });
            } else if (data.items) {
                commentaries = data.items.filter(function (c) { return c.book === book && c.chapter === chapter; });
            } else if (data.commentary && data.commentary.data) {
                commentaries = data.commentary.data.filter(function (c) {
                    return (Number(c.Book) === b || c.Book == book) && (Number(c.Chapter) === ch || c.Chapter == chapter);
                });
            } else if (data.commentaries) {
                commentaries = data.commentaries.filter(function (c) {
                    return (Number(c.book) === b || c.book == book) && (Number(c.chapter) === ch || c.chapter == chapter);
                });
            }
            return this.formatCommentary(commentaries);
        },

        async querySQLiteCommentary(db, book, chapter) {
            var queries = [
                'SELECT * FROM commentary WHERE Book=? AND Chapter=?',
                'SELECT * FROM commentaries WHERE book=? AND chapter=?'
            ];
            for (var i = 0; i < queries.length; i++) {
                try {
                    var stmt = db.prepare(queries[i]);
                    stmt.bind([book, chapter]);
                    var results = [];
                    while (stmt.step()) results.push(stmt.getAsObject());
                    stmt.free();
                    if (results.length) return this.formatCommentary(results);
                } catch (e) { continue; }
            }
            return [];
        },

        async queryCommentary(key, book, chapter) {
            var meta = (this.db.commentaries || {})[key];
            if (!meta || !meta.loaded) throw new Error('註釋未載入: ' + key);
            if (meta.format === 'sqlite') return this.querySQLiteCommentary(meta.data, book, chapter);
            return this.queryJSONCommentary(meta.data, book, chapter);
        },

        getRegistryBibles() { return (REG().bibles || []).slice(); },

        getSearchVersionPaths() {
            var out = {};
            (REG().bibles || []).forEach(function (b) {
                if (!b.search) return;
                var p = (b.paths && b.paths.json && b.paths.json[0]) || '';
                out[b.key] = '../' + p;
            });
            return out;
        },

        printLoadingStats() {
            console.log('📊 載入統計', this.loadingStatus);
        }
    };

    global.BibleEngine = BibleEngine;

    var loaderFacade = {
        databases: BibleEngine.db,
        loadingStatus: BibleEngine.loadingStatus,
        initialize: function () { return BibleEngine.initialize(); },
        probeAllSources: function () { return BibleEngine.probeAllSources(); },
        getSourceStatus: function () { return BibleEngine.getSourceStatus(); },
        getAvailableBibles: function () { return BibleEngine.getAvailableBibles(); },
        getAvailableCommentaries: function () { return BibleEngine.getAvailableCommentaries(); },
        isDataSourceAvailable: function (c, k) { return BibleEngine.isDataSourceAvailable(c, k); },
        queryBible: function (v, b, c, verse) { return BibleEngine.queryBible(v, b, c); },
        queryCommentary: function (k, b, c) { return BibleEngine.queryCommentary(k, b, c); },
        printLoadingStats: function () { return BibleEngine.printLoadingStats(); }
    };

    global.universalDataLoader = loaderFacade;
    global.initUniversalDataLoader = async function () {
        await BibleEngine.initialize();
        loaderFacade.databases = BibleEngine.db;
        return true;
    };
    global.queryBible = function (v, b, c) { return BibleEngine.queryBible(v, b, c); };
    global.queryCommentary = function (k, b, c) { return BibleEngine.queryCommentary(k, b, c); };

})(typeof window !== 'undefined' ? window : this);
