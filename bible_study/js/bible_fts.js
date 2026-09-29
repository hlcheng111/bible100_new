/**
 * BS-W5：聖經全文搜尋 FTS-lite（記憶體倒排索引）
 * 依賴 BibleEngine.ensureBibleRows；無索引時 fallback searchBible。
 */
(function (global) {
    'use strict';

    var BE = global.BibleEngine;
    if (!BE) {
        console.warn('bible_fts.js 需要 BibleEngine.js');
        return;
    }

    BE._ftsIndex = BE._ftsIndex || {};

    function verseText(item) {
        return (item.Scripture || item.scripture || item.Text || item.text || item.t || '').replace(/<[^>]+>/g, '');
    }

    function tokenize(text) {
        var tokens = [];
        var lower = String(text).toLowerCase();
        lower.split(/\s+/).filter(Boolean).forEach(function (part) {
            part = part.replace(/^[^\w\u4e00-\u9fff]+|[^\w\u4e00-\u9fff]+$/g, '');
            if (!part) return;
            if (/[\u4e00-\u9fff]/.test(part)) {
                for (var i = 0; i < part.length; i++) tokens.push(part.charAt(i));
                if (part.length >= 2) {
                    for (var j = 0; j < part.length - 1; j++) tokens.push(part.substring(j, j + 2));
                }
            } else if (part.length >= 2) {
                tokens.push(part);
            }
        });
        return tokens;
    }

    BE.buildFtsIndex = async function (versionKey) {
        if (BE._ftsIndex[versionKey]) return BE._ftsIndex[versionKey];
        var cached = await BE.ensureBibleRows(versionKey);
        if (!cached || cached.sqlite || !cached.length) return null;

        var index = {};
        for (var i = 0; i < cached.length; i++) {
            var text = verseText(cached[i]);
            if (!text) continue;
            var seen = {};
            tokenize(text).forEach(function (tok) {
                if (seen[tok]) return;
                seen[tok] = true;
                if (!index[tok]) index[tok] = [];
                index[tok].push(i);
            });
        }
        BE._ftsIndex[versionKey] = { rows: cached, index: index };
        return BE._ftsIndex[versionKey];
    };

    BE.searchBibleFts = async function (versionKey, query, limit, bookNames) {
        limit = limit || 20;
        var fts = await BE.buildFtsIndex(versionKey);
        if (!fts) {
            return BE.searchBible(versionKey, query, limit, bookNames);
        }

        var keywords = String(query).toLowerCase().split(/\s+/).filter(Boolean);
        if (!keywords.length) return [];

        var lists = keywords.map(function (kw) {
            var toks = tokenize(kw);
            if (!toks.length) toks = [kw];
            var set = {};
            toks.forEach(function (t) {
                (fts.index[t] || []).forEach(function (i) { set[i] = true; });
            });
            return set;
        });

        var result = null;
        lists.forEach(function (s) {
            if (result === null) {
                result = s;
                return;
            }
            var inter = {};
            Object.keys(result).forEach(function (k) {
                if (s[k]) inter[k] = true;
            });
            result = inter;
        });

        if (!result) return [];
        var ids = Object.keys(result).map(Number).sort(function (a, b) { return a - b; });
        var names = bookNames || {};
        var results = [];
        for (var n = 0; n < ids.length && results.length < limit; n++) {
            var item = fts.rows[ids[n]];
            var bookId = item.Book || item.book || item.b;
            results.push({
                book: bookId,
                chapter: item.Chapter || item.chapter || item.c,
                verse: item.Verse || item.verse || item.v,
                text: verseText(item),
                bookName: names[bookId] || ('Book' + bookId),
                version: versionKey
            });
        }
        return results;
    };

})(typeof window !== 'undefined' ? window : this);
