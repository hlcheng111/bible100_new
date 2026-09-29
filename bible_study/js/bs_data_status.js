/**
 * BS-W4：資料狀態探測（Topbar chip）
 */
(function (global) {
    'use strict';

    async function probeCorePaths() {
        var reg = global.BS_DATA_REGISTRY;
        var BE = global.BibleEngine;
        if (!reg || !BE || !BE.probePath) {
            return { level: 'red', label: '無 registry', faith: false, commentary: false, scannedAt: Date.now() };
        }
        var faithEntry = (reg.bibles || []).find(function (b) { return b.key === 'faith'; });
        var compEntry = (reg.commentaries || []).find(function (c) { return c.key === 'comprehensive'; });
        var faithOk = false;
        var commOk = false;
        if (faithEntry && faithEntry.paths && faithEntry.paths.json) {
            var fp = await BE.probePath(faithEntry.paths.json[0]);
            faithOk = fp && fp.ok;
        }
        if (compEntry && compEntry.paths) {
            var dbPaths = compEntry.paths.db || [];
            var jsonPaths = compEntry.paths.json || [];
            for (var i = 0; i < dbPaths.length; i++) {
                var dp = await BE.probePath(dbPaths[i]);
                if (dp && dp.ok) { commOk = true; break; }
            }
            if (!commOk) {
                for (var j = 0; j < jsonPaths.length; j++) {
                    var jp = await BE.probePath(jsonPaths[j]);
                    if (jp && jp.ok) { commOk = true; break; }
                }
            }
        }
        var level = 'red';
        var label = '僅線上／缺檔';
        if (faithOk && commOk) {
            level = 'green';
            label = '本地資料就緒';
        } else if (faithOk) {
            level = 'yellow';
            label = '部分本地（釋經或走雲端）';
        }
        return {
            level: level,
            label: label,
            faith: faithOk,
            commentary: commOk,
            scannedAt: Date.now()
        };
    }

    global.BS_DataStatus = {
        probeCorePaths: probeCorePaths
    };
})(typeof window !== 'undefined' ? window : this);
