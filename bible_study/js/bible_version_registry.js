/**
 * 聖經研讀 · 資料來源註冊表（SSOT）
 * BS-W1：譯本、註釋、串珠、詞典路徑唯一真相；BibleEngine 只讀此檔。
 */
(function (global) {
    'use strict';

    global.BS_DATA_REGISTRY = {
        schemaVersion: 2,
        updated: '2026-07-26',

        /** 六語教材 Hub ↔ 站內譯本 key（BS-W5 SSOT） */
        languagesHub: [
            { code: 'cn', name: '中文教材', hub: 'languages/index_cn.html', bibleKeys: ['faith', 'cuv', 'cuvr', 'luzhen'] },
            { code: 'en', name: 'English Curriculum', hub: 'languages/index_en.html', bibleKeys: ['kjv', 'niv'] },
            { code: 'vi', name: 'Tiếng Việt', hub: 'languages/index_vi.html', bibleKeys: ['vi1934'] },
            { code: 'id', name: 'Bahasa Indonesia', hub: 'languages/index_id.html', bibleKeys: ['id_ayt'] },
            { code: 'ch', name: '兒童／青少年', hub: 'languages/index_ch.html', bibleKeys: [] },
            { code: 'ad', name: '進深／成人', hub: 'languages/index_ad.html', bibleKeys: [] }
        ],

        bibles: [
            {
                key: 'faith',
                name: '信望爱(和合本)',
                langs: ['cn'],
                tier: 'core',
                parallel: true,
                search: true,
                paths: {
                    json: [
                        'data/bibles/clean/信望爱(和合本).json',
                        'data/bibles/信望爱(和合本).json',
                        'data/bibles/信望愛(和合本).json'
                    ]
                }
            },
            {
                key: 'cuv',
                name: '和合本',
                langs: ['cn'],
                tier: 'standard',
                parallel: false,
                search: true,
                paths: {
                    json: ['data/bibles/clean/和合本修訂版.json', 'data/bibles/和合本.json', 'data/bibles/和合本修訂版.json']
                }
            },
            {
                key: 'cuvr',
                name: '和合本修訂版',
                langs: ['cn'],
                tier: 'standard',
                parallel: false,
                search: true,
                paths: {
                    json: ['data/bibles/clean/和合本修訂版.json', 'data/bibles/和合本修訂版.json']
                }
            },
            {
                key: 'luzhen',
                name: '吕振中',
                langs: ['cn'],
                tier: 'standard',
                parallel: false,
                search: false,
                paths: {
                    json: ['data/bibles/clean/吕振中.json', 'data/bibles/吕振中.json']
                }
            },
            {
                key: 'kjv',
                name: 'KJV',
                langs: ['en'],
                tier: 'core',
                parallel: true,
                search: true,
                paths: {
                    json: ['data/bibles/clean/KJV.json', 'data/bibles/kjv.json', 'data/bibles/KJV.json']
                }
            },
            {
                key: 'niv',
                name: 'NIV',
                langs: ['en'],
                tier: 'core',
                parallel: true,
                search: true,
                paths: {
                    json: ['data/bibles/clean/NIV.json', 'data/bibles/niv.json', 'data/bibles/NIV.json', 'data/bibles/niv_complete_data.json']
                }
            },
            {
                key: 'vi1934',
                name: '越南聖經1934',
                langs: ['vi'],
                tier: 'minor',
                parallel: true,
                search: false,
                paths: {
                    json: ['data/bibles/clean/越南聖經1934.json']
                }
            },
            {
                key: 'id_ayt',
                name: '印尼 AYT',
                langs: ['id'],
                tier: 'minor',
                parallel: true,
                search: false,
                paths: {
                    json: ['data/bibles/clean/印尼AYT.json']
                }
            }
        ],

        commentaries: [
            {
                key: 'comprehensive',
                name: '综合解读',
                langs: ['cn'],
                tier: 'core',
                paths: {
                    json: [
                        'data/cj/clean/Comprehensive.json',
                        'data/cj/综合解读.json',
                        'data/cj/综合解读_明文版.json'
                    ],
                    db: ['data/cj/综合解读.db']
                }
            },
            {
                key: 'faith_commentary',
                name: '信望爱注释',
                langs: ['cn'],
                tier: 'standard',
                paths: {
                    json: ['data/cj/信望爱注释.json'],
                    db: ['data/cj/信望爱注释.db']
                }
            },
            {
                key: 'crossref_comm',
                name: '串珠圣经注释',
                langs: ['cn'],
                tier: 'standard',
                paths: {
                    json: ['data/cj/串珠圣经注释.json'],
                    db: ['data/cj/串珠圣经注释.db']
                }
            },
            {
                key: 'guide',
                name: '启导本圣经注释',
                langs: ['cn'],
                tier: 'standard',
                paths: {
                    json: ['data/cj/启导本圣经注释.json'],
                    db: ['data/cj/启导本圣经注释.db']
                }
            },
            {
                key: 'meiriyan',
                name: '每日研经丛书',
                langs: ['cn'],
                tier: 'standard',
                paths: {
                    json: ['data/cj/每日研经丛书.json'],
                    db: ['data/cj/每日研经丛书.db']
                }
            }
        ],

        crossrefs: [
            {
                key: 'faith_crossref',
                name: '信望爱串珠',
                langs: ['cn'],
                paths: {
                    json: ['data/bibles/信望爱串珠.json'],
                    db: ['data/bibles/信望爱串珠.db']
                }
            },
            {
                key: 'cuv_crossref',
                name: '和合本串珠',
                langs: ['cn'],
                paths: {
                    json: ['data/bibles/和合本串珠.json'],
                    db: ['data/bibles/和合本串珠.db']
                }
            }
        ],

        dictionaries: [
            {
                key: 'bible_dict',
                name: '圣经语汇词典',
                langs: ['cn', 'en'],
                paths: {
                    json: [
                        'data/cd/圣经语汇词典.json',
                        'data/dictionaries/圣经词典.json'
                    ]
                }
            }
        ]
    };

    /** @param {string} category bibles|commentaries|crossrefs|dictionaries */
    global.BS_getRegistryEntry = function (category, key) {
        return (global.BS_DATA_REGISTRY[category] || []).find(function (e) { return e.key === key; }) || null;
    };

    /** @param {string} category bibles|commentaries|crossrefs|dictionaries */
    global.BS_getRegistryCategory = function (category) {
        var reg = global.BS_DATA_REGISTRY || {};
        return reg[category] || [];
    };

    global.BS_getBibleEntry = function (key) {
        return (global.BS_DATA_REGISTRY.bibles || []).find(function (b) { return b.key === key; }) || null;
    };

    global.BS_getLanguagesHub = function (code) {
        return (global.BS_DATA_REGISTRY.languagesHub || []).find(function (h) { return h.code === code; }) || null;
    };

    global.BS_getHubForBibleKey = function (bibleKey) {
        return (global.BS_DATA_REGISTRY.languagesHub || []).find(function (h) {
            return (h.bibleKeys || []).indexOf(bibleKey) >= 0;
        }) || null;
    };

})(typeof window !== 'undefined' ? window : this);
