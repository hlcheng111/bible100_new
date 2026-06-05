/**
 * Offline Export / Import Skeleton
 * 離線單機資料匯出／匯入骨架（階段 D）
 *
 * 設計目標：
 * - 在「完全無伺服器」環境，仍可把 localStorage 中的資料
 *   匯出成一個 .json 或 .js 檔，拷貝到另一台電腦再匯入。
 * - 目前只提供骨架與 API，不自動掛在任何 UI 按鈕上，
 *   方便你日後決定要放在哪個模組的設定頁。
 *
 * 注意：
 * - 瀏覽器 JS 無法直接「存檔到任意路徑」，只能透過
 *   建立 Blob + 下載連結的方式，讓使用者手動存檔。
 */

(function (window) {
    'use strict';

    const OfflineExporter = {
        /**
         * 匯出目前主要資料（可再擴充）
         * - SchoolMasterDatabase（school_management）
         * - CoreDirectory（跨模組核心）
         */
        exportAll() {
            const payload = {
                exportedAt: new Date().toISOString(),
                version: '0.1.0',
                schoolMasterDatabase: window.schoolDB ? window.schoolDB.data : null,
                coreDirectory: window.coreDirectory ? window.coreDirectory.data : null
            };

            const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: 'application/json;charset=utf-8'
            });

            const filename = `bible100_offline_export_${new Date()
                .toISOString()
                .replace(/[:.]/g, '-')}.json`;

            OfflineExporter._downloadBlob(blob, filename);
        },

        /**
         * 從 JSON 物件匯入（呼叫前，請自行讀取檔案內容並 JSON.parse）
         * @param {object} json
         * @param {object} options { overwrite: boolean }
         */
        importFromJson(json, options = { overwrite: false }) {
            if (!json || typeof json !== 'object') {
                throw new Error('Invalid import json');
            }

            const overwrite = options.overwrite === true;

            // 匯入 SchoolMasterDatabase
            if (json.schoolMasterDatabase && window.schoolDB) {
                if (overwrite) {
                    window.schoolDB.data = json.schoolMasterDatabase;
                } else {
                    // 簡單 merge：以匯入資料為主覆蓋同 id 記錄
                    window.schoolDB.data = OfflineExporter._mergeById(
                        window.schoolDB.data,
                        json.schoolMasterDatabase
                    );
                }
                window.schoolDB.save();
            }

            // 匯入 CoreDirectory
            if (json.coreDirectory && window.coreDirectory) {
                if (overwrite) {
                    window.coreDirectory.data = json.coreDirectory;
                } else {
                    window.coreDirectory.data = OfflineExporter._mergeById(
                        window.coreDirectory.data,
                        json.coreDirectory
                    );
                }
                window.coreDirectory.save();
            }
        },

        /**
         * 以 id 合併兩個同結構物件（淺層，給階段 D demo 使用）
         */
        _mergeById(target, source) {
            if (!target || !source) return source || target;

            const result = { ...target };
            Object.keys(source).forEach(key => {
                const srcVal = source[key];
                const tgtVal = target[key];

                if (Array.isArray(srcVal)) {
                    const map = new Map();
                    (Array.isArray(tgtVal) ? tgtVal : []).forEach(item => {
                        if (item && item.id != null) {
                            map.set(item.id, item);
                        }
                    });
                    srcVal.forEach(item => {
                        if (item && item.id != null) {
                            map.set(item.id, item);
                        }
                    });
                    result[key] = Array.from(map.values());
                } else if (srcVal && typeof srcVal === 'object') {
                    result[key] = OfflineExporter._mergeById(
                        tgtVal && typeof tgtVal === 'object' ? tgtVal : {},
                        srcVal
                    );
                } else {
                    result[key] = srcVal;
                }
            });

            return result;
        },

        _downloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    window.OfflineExporter = OfflineExporter;
})(window);

