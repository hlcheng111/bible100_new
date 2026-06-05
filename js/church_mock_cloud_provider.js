/**
 * Mock 雲端 PersistenceProvider（雛形）
 * ---------------------------------------------------------------------------
 * 模擬：網路往返延遲 → 記憶體權威 → 雙寫 localStorage 作為「本機複本」
 * 延遲毫秒數：每次 async 操作前讀取 CHURCH_CLOUD_CONFIG.MOCK_CLOUD_LATENCY_MS（可即時調整）
 *
 * 啟用：cloud_config.js 設 USE_MOCK_CLOUD: true，並在 church_data_bridge.js 之前載入本檔。
 *
 * 事件：
 * - church-mock-cloud-sync：單次 async 操作（交易進行中會暫停發送，改由 commit 合併）
 * - church-mock-cloud-transaction：churchMockCloudBeginTransaction / Commit 區間之彙總（detail 含 transactionId、roundTrips、totalLatencyMs 等）
 */
(function (global) {
    'use strict';

    var AUDIT_KEY = 'churchAuditLog';

    /**
     * 業務層交易（合併多次 async 讀寫為單一日誌）
     * Bridge 在 saveMemberSystemDataAsync(transaction) 前後呼叫 begin / commit。
     */
    var _mockCloudTx = null;
    var _mockCloudTxSeq = 0;

    function dispatchMockCloudTransaction(detail) {
        try {
            if (typeof document !== 'undefined' && document.dispatchEvent) {
                document.dispatchEvent(new CustomEvent('church-mock-cloud-transaction', { detail: detail }));
            }
        } catch (e) {}
    }

    global.churchMockCloudBeginTransaction = function () {
        if (_mockCloudTx) {
            if (typeof global.churchMockCloudCommitTransaction === 'function') {
                global.churchMockCloudCommitTransaction(false);
            }
        }
        _mockCloudTx = {
            id: ++_mockCloudTxSeq,
            startedAt: typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now(),
            ops: []
        };
        return _mockCloudTx.id;
    };

    global.churchMockCloudCommitTransaction = function (success) {
        if (!_mockCloudTx) return;
        var tx = _mockCloudTx;
        _mockCloudTx = null;
        var t1 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        var wall = Math.round(t1 - tx.startedAt);
        var sumLat = 0;
        var sumBytes = 0;
        for (var i = 0; i < tx.ops.length; i++) {
            sumLat += tx.ops[i].actualLatencyMs || 0;
            sumBytes += tx.ops[i].bytesApprox || 0;
        }
        dispatchMockCloudTransaction({
            t: new Date().toISOString(),
            transactionId: tx.id,
            success: success !== false,
            roundTrips: tx.ops.length,
            totalLatencyMs: wall,
            sumCloudLatencyMs: sumLat,
            bytesApproxTotal: sumBytes,
            ops: tx.ops.slice()
        });
    };

    function deepClone(v) {
        if (v === undefined) return undefined;
        return JSON.parse(JSON.stringify(v));
    }

    function jsonByteLength(obj) {
        try {
            var s = JSON.stringify(obj);
            if (typeof TextEncoder !== 'undefined') {
                return new TextEncoder().encode(s).length;
            }
            return s ? s.length : 0;
        } catch (e) {
            return 0;
        }
    }

    function getEffectiveLatencyMs(fallback) {
        var c = global.CHURCH_CLOUD_CONFIG;
        if (c && typeof c.MOCK_CLOUD_LATENCY_MS === 'number' && !isNaN(c.MOCK_CLOUD_LATENCY_MS)) {
            return Math.max(0, Math.min(60000, c.MOCK_CLOUD_LATENCY_MS));
        }
        return fallback;
    }

    /**
     * @param {{ latencyMs?: number, name?: string }} opts
     */
    function createChurchMockCloudProvider(opts) {
        opts = opts || {};
        var name = opts.name || 'mockCloud';
        var defaultLatencyMs = typeof opts.latencyMs === 'number' && opts.latencyMs >= 0 ? opts.latencyMs : 450;
        /** @type {Record<string, unknown>} */
        var mem = Object.create(null);
        var lastOps = [];

        function emit(op, key, actualLatencyMs, payloadForSize) {
            var configured = getEffectiveLatencyMs(defaultLatencyMs);
            var bytesApprox = payloadForSize === undefined ? 0 : jsonByteLength(payloadForSize);
            var row = {
                t: new Date().toISOString(),
                op: op,
                key: key,
                configuredLatencyMs: configured,
                actualLatencyMs: typeof actualLatencyMs === 'number' ? actualLatencyMs : configured,
                bytesApprox: bytesApprox
            };
            lastOps.push(row);
            if (lastOps.length > 80) lastOps.shift();
            if (_mockCloudTx) {
                _mockCloudTx.ops.push(row);
                return;
            }
            try {
                if (typeof document !== 'undefined' && document.dispatchEvent) {
                    document.dispatchEvent(new CustomEvent('church-mock-cloud-sync', { detail: row }));
                }
            } catch (e) {}
        }

        function sleepMeasured() {
            var ms = getEffectiveLatencyMs(defaultLatencyMs);
            var t0 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
            return new Promise(function (resolve) {
                setTimeout(function () {
                    var t1 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
                    resolve(Math.round(t1 - t0));
                }, ms);
            });
        }

        function hydrateFromLocalReplica(key) {
            if (Object.prototype.hasOwnProperty.call(mem, key)) return;
            try {
                if (typeof localStorage === 'undefined') {
                    mem[key] = null;
                    return;
                }
                var raw = localStorage.getItem(key);
                mem[key] = raw ? JSON.parse(raw) : null;
            } catch (e) {
                mem[key] = null;
            }
        }

        function persistLocalReplica(key) {
            try {
                if (typeof localStorage === 'undefined') return;
                if (!(key in mem) || mem[key] === undefined) {
                    localStorage.removeItem(key);
                    return;
                }
                localStorage.setItem(key, JSON.stringify(mem[key]));
            } catch (e) {}
        }

        return {
            name: name,
            getMockCloudLastOps: function () {
                return lastOps.slice();
            },
            getJson: async function (key) {
                var actualMs = await sleepMeasured();
                hydrateFromLocalReplica(key);
                var v = mem[key];
                emit('getJson', key, actualMs, v === null || v === undefined ? null : v);
                return v === null || v === undefined ? null : deepClone(v);
            },
            setJson: async function (key, value) {
                var actualMs = await sleepMeasured();
                mem[key] = deepClone(value);
                persistLocalReplica(key);
                emit('setJson', key, actualMs, value);
                return true;
            },
            remove: async function (key) {
                var actualMs = await sleepMeasured();
                delete mem[key];
                persistLocalReplica(key);
                emit('remove', key, actualMs, null);
                return true;
            },
            appendAudit: async function (entry) {
                var actualMs = await sleepMeasured();
                hydrateFromLocalReplica(AUDIT_KEY);
                var list = Array.isArray(mem[AUDIT_KEY]) ? mem[AUDIT_KEY] : [];
                list.push(entry);
                if (list.length > 1000) list = list.slice(list.length - 1000);
                mem[AUDIT_KEY] = list;
                persistLocalReplica(AUDIT_KEY);
                emit('appendAudit', AUDIT_KEY, actualMs, entry);
                return true;
            },
            getJsonSync: function (key) {
                hydrateFromLocalReplica(key);
                var v = mem[key];
                return v === null || v === undefined ? null : deepClone(v);
            },
            setJsonSync: function (key, value) {
                mem[key] = deepClone(value);
                persistLocalReplica(key);
                return true;
            },
            removeSync: function (key) {
                delete mem[key];
                persistLocalReplica(key);
                return true;
            },
            appendAuditSync: function (entry) {
                hydrateFromLocalReplica(AUDIT_KEY);
                var list = Array.isArray(mem[AUDIT_KEY]) ? mem[AUDIT_KEY] : [];
                list.push(entry);
                if (list.length > 1000) list = list.slice(list.length - 1000);
                mem[AUDIT_KEY] = list;
                persistLocalReplica(AUDIT_KEY);
                return true;
            }
        };
    }

    global.createChurchMockCloudProvider = createChurchMockCloudProvider;
})(typeof window !== 'undefined' ? window : this);
