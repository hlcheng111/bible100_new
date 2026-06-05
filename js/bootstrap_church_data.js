/**
 * Bible100 教會資料自動啟動
 * 首次開啟時自動載入 200+ 筆試用會友，無需 localhost、無需手動操作
 * 依賴：central_member_db.js（需先載入）、church_data_bridge.js（需先載入以單一路徑寫入）
 */
(function (global) {
    'use strict';

    const MIN_MEMBERS = 10;

    function needsBootstrap() {
        if (typeof ChurchDataBridge !== 'undefined' && ChurchDataBridge.needsMemberBootstrap) {
            return ChurchDataBridge.needsMemberBootstrap(MIN_MEMBERS);
        }
        try {
            var raw = localStorage.getItem('memberSystemData');
            if (!raw) return true;
            var d = JSON.parse(raw);
            var n = (d.members || []).length;
            return n < MIN_MEMBERS;
        } catch (e) {
            return true;
        }
    }

    function runAfterBridgeReady() {
        if (typeof ChurchDataBridge !== 'undefined') {
            console.assert(
                typeof ChurchDataBridge.isBridgeInitialized === 'function' && ChurchDataBridge.isBridgeInitialized(),
                '[bootstrap_church_data] ChurchDataBridge 尚未標記就緒（請確認 script 順序：bridge 在 bootstrap 之前）'
            );
        }
        if (!needsBootstrap()) return;
        if (typeof ChurchDataBridge !== 'undefined' && ChurchDataBridge.isProductionMode && ChurchDataBridge.isProductionMode()) {
            console.warn('Bootstrap: 正式環境略過自動試用會友種子');
            return;
        }
        var CentralMemberDB = (typeof global !== 'undefined' && global.CentralMemberDB) || (typeof window !== 'undefined' && window.CentralMemberDB);
        if (!CentralMemberDB || !CentralMemberDB.generateSeed) {
            console.warn('Bootstrap: CentralMemberDB 未載入，略過自動啟動');
            return;
        }
        var seed = CentralMemberDB.generateSeed();
        try {
            if (typeof ChurchDataBridge !== 'undefined' && ChurchDataBridge.applyBootstrapSeed) {
                var res = ChurchDataBridge.applyBootstrapSeed(seed);
                if (res && res.ok) {
                    console.log('✅ 已自動載入 ' + (res.members || 0) + ' 筆試用會友（經 ChurchDataBridge，首次開啟）');
                } else if (res && res.reason === 'production_skip') {
                    return;
                } else {
                    console.warn('Bootstrap: applyBootstrapSeed 未完成', res);
                }
                return;
            }
            localStorage.setItem('memberSystemData', JSON.stringify(seed));
            console.warn('Bootstrap: ChurchDataBridge 不可用，已退回直寫 memberSystemData（請調整 script 順序）');
        } catch (e) {
            console.warn('Bootstrap: 寫入失敗', e);
        }
    }

    function run() {
        if (typeof ChurchDataBridge !== 'undefined' && ChurchDataBridge.whenReady) {
            ChurchDataBridge.whenReady().then(runAfterBridgeReady).catch(runAfterBridgeReady);
            return;
        }
        runAfterBridgeReady();
    }

    if (typeof document !== 'undefined' && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

})(typeof window !== 'undefined' ? window : this);
