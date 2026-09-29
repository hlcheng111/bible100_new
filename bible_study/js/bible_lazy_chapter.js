/**
 * BS-W2-lite：章節懶載入 + 全文搜尋（registry / BibleEngine 擴充）
 */
(function (global) {
    'use strict';

    var BE = global.BibleEngine;
    if (!BE) {
        console.warn('bible_lazy_chapter.js 需要 BibleEngine.js');
        return;
    }

    BE._jsonRowsCache = BE._jsonRowsCache || {};
    BE._commRowsCache = BE._commRowsCache || {};
    BE._chapterCache = BE._chapterCache || {};

    function reg() {
        return global.BS_DATA_REGISTRY || { bibles: [], commentaries: [] };
    }

    function entryPaths(category, key) {
        var list = reg()[category] || [];
        var e = list.find(function (x) { return x.key === key; });
        return e ? (e.paths || {}) : {};
    }

    BE._extractBibleRows = function (data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.Bible && Array.isArray(data.Bible.data)) return data.Bible.data;
        if (Array.isArray(data.data)) return data.data;
        return [];
    };

    BE._extractCommentaryRows = function (data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (data.commentary && Array.isArray(data.commentary.data)) return data.commentary.data;
        if (Array.isArray(data.items)) return data.items;
        if (Array.isArray(data.commentaries)) return data.commentaries;
        return [];
    };

    BE._normalizeVerseRow = function (row, book, chapter) {
        return {
            Book: row.Book || row.book || row.b || book,
            Chapter: row.Chapter || row.chapter || row.c || chapter,
            Verse: row.Verse || row.verse || row.v || 0,
            Text: row.Text || row.text || row.Scripture || row.scripture || row.t || ''
        };
    };

    BE._normalizeCommRow = function (row) {
        return {
            Book: row.Book || row.book || 0,
            Chapter: row.Chapter || row.chapter || 0,
            FromVerse: row.FromVerse || row.fromVerse || row.from_verse || 1,
            ToVerse: row.ToVerse || row.toVerse || row.to_verse || 1,
            Content: row.Content || row.content || row.Data || row.data || ''
        };
    };

    BE.ensureBibleRows = async function (versionKey) {
        if (BE._jsonRowsCache[versionKey]) return BE._jsonRowsCache[versionKey];

        var meta = (BE.db.bibles || {})[versionKey];
        if (meta && meta.loaded && meta.data) {
            if (meta.format === 'sqlite') {
                BE._jsonRowsCache[versionKey] = { sqlite: true, meta: meta };
                return BE._jsonRowsCache[versionKey];
            }
            var rows = BE._extractBibleRows(meta.data);
            BE._jsonRowsCache[versionKey] = rows;
            return rows;
        }

        var paths = entryPaths('bibles', versionKey).json || [];
        var resolved = await BE.resolveFirstPath(paths);
        if (!resolved) return [];

        try {
            var buf = await BE.loadRaw(resolved);
            var parsed = BE.decodeBuffer(buf);
            if (parsed.type === 'sqlite') {
                if (!BE.SQL) await BE.checkSQLAvailability();
                var db = await BE.initSqlite(parsed.buffer);
                BE.db.bibles = BE.db.bibles || {};
                BE.db.bibles[versionKey] = { data: db, name: versionKey, format: 'sqlite', loaded: true, resolvedPath: resolved };
                BE._jsonRowsCache[versionKey] = { sqlite: true, meta: BE.db.bibles[versionKey] };
                return BE._jsonRowsCache[versionKey];
            }
            rows = BE._extractBibleRows(parsed.data);
            BE._jsonRowsCache[versionKey] = rows;
            return rows;
        } catch (e) {
            console.warn('ensureBibleRows', versionKey, e);
            return [];
        }
    };

    BE.getBibleChapterRows = async function (versionKey, book, chapter) {
        var cacheKey = 'bible:' + versionKey + ':' + book + ':' + chapter;
        if (BE._chapterCache[cacheKey]) return BE._chapterCache[cacheKey];

        var cached = await BE.ensureBibleRows(versionKey);
        if (cached && cached.sqlite) {
            try {
                var verses = await BE.queryBible(versionKey, book, chapter);
                var rows = verses.map(function (v) {
                    return { Book: book, Chapter: chapter, Verse: v.verse, Text: v.text };
                });
                BE._chapterCache[cacheKey] = rows;
                return rows;
            } catch (e) {
                return [];
            }
        }

        var rows = (cached || []).filter(function (v) {
            var b = v.Book || v.book || v.b;
            var c = v.Chapter || v.chapter || v.c;
            return Number(b) === Number(book) && Number(c) === Number(chapter);
        }).map(function (v) { return BE._normalizeVerseRow(v, book, chapter); });

        BE._chapterCache[cacheKey] = rows;
        return rows;
    };

    BE.ensureCommentaryRows = async function (commKey) {
        if (BE._commRowsCache[commKey]) return BE._commRowsCache[commKey];

        var meta = (BE.db.commentaries || {})[commKey];
        if (meta && meta.loaded && meta.data) {
            if (meta.format === 'sqlite') {
                BE._commRowsCache[commKey] = { sqlite: true, meta: meta };
                return BE._commRowsCache[commKey];
            }
            var rows = BE._extractCommentaryRows(meta.data);
            BE._commRowsCache[commKey] = rows;
            return rows;
        }

        var list = reg().commentaries || [];
        var entry = list.find(function (x) { return x.key === commKey; });
        if (!entry) return [];
        var st = await BE.loadEntry('commentaries', entry);
        if (st.status === 'ok') return BE.ensureCommentaryRows(commKey);

        return [];
    };

    BE.getCommentaryChapterRows = async function (commKey, book, chapter) {
        var cacheKey = 'comm:' + commKey + ':' + book + ':' + chapter;
        if (BE._chapterCache[cacheKey]) return BE._chapterCache[cacheKey];

        try {
            var items = await BE.queryCommentary(commKey, book, chapter);
            if (items && items.length) {
                var rows = items.map(function (it) {
                    return {
                        Book: book,
                        Chapter: chapter,
                        FromVerse: it.fromVerse,
                        ToVerse: it.toVerse,
                        Content: it.content
                    };
                });
                BE._chapterCache[cacheKey] = rows;
                return rows;
            }
        } catch (e) {}

        var cached = await BE.ensureCommentaryRows(commKey);
        if (cached && cached.sqlite) return [];

        var rows = (cached || []).filter(function (c) {
            var b = c.Book || c.book;
            var ch = c.Chapter || c.chapter;
            return (Number(b) === Number(book) || b == book) && (Number(ch) === Number(chapter) || ch == chapter);
        }).map(BE._normalizeCommRow);

        BE._chapterCache[cacheKey] = rows;
        return rows;
    };

    BE.searchBible = async function (versionKey, query, limit, bookNames) {
        limit = limit || 20;
        var cached = await BE.ensureBibleRows(versionKey);
        var data = cached && cached.sqlite ? null : cached;
        if (!data || !data.length) return [];

        var keywords = String(query).toLowerCase().split(/\s+/).filter(Boolean);
        var isEn = versionKey === 'kjv' || versionKey === 'niv';
        var names = bookNames || {};
        var results = [];

        for (var i = 0; i < data.length; i++) {
            if (results.length >= limit) break;
            var item = data[i];
            var text = (item.Scripture || item.scripture || item.Text || item.text || item.t || '').replace(/<[^>]+>/g, '');
            if (!text) continue;
            var lower = text.toLowerCase();
            var ok = keywords.every(function (k) { return lower.indexOf(k) >= 0; });
            if (!ok) continue;
            var bookId = item.Book || item.book || item.b;
            results.push({
                book: bookId,
                chapter: item.Chapter || item.chapter || item.c,
                verse: item.Verse || item.verse || item.v,
                text: text,
                bookName: names[bookId] || ('Book' + bookId),
                version: versionKey
            });
        }
        return results;
    };

    BE.getRegistryParallelBibles = function () {
        return (reg().bibles || []).filter(function (b) { return b.parallel; });
    };

    BE.getRegistrySearchBibles = function () {
        return (reg().bibles || []).filter(function (b) { return b.search; });
    };

    BE.getRegistryCommentaries = function () {
        return (reg().commentaries || []).slice();
    };

    global.BS_buildParallelSources = function () {
        var bibles = {};
        BE.getRegistryParallelBibles().forEach(function (b) {
            bibles[b.key] = { name: b.name, data: null };
        });
        var comms = {};
        BE.getRegistryCommentaries().forEach(function (c) {
            comms[c.key] = { name: c.name, data: null };
        });
        return { bibles: bibles, commentaries: comms };
    };

})(typeof window !== 'undefined' ? window : this);
