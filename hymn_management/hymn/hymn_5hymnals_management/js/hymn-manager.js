/**
 * 聖詩管理系統核心JavaScript管理器
 * Hymn Management System Core JavaScript Manager
 * 已遷移到 c:\hymn\hymn_5hymnals_management\js\
 * 
 * 功能：
 * - 聖詩數據管理
 * - 搜索與篩選
 * - 分類代碼對照
 * - 數據導入導出
 * - 多詩集整合
 */

class HymnManager {
    constructor() {
        this.hymnalData = {};
        this.classificationCodes = {};
        this.currentFilters = {
            hymnal: 'all',
            categories: [],
            search: '',
            sort: 'number'
        };
        this.searchIndex = {};
        this.init();
    }

    /**
     * 初始化管理器
     */
    init() {
        this.loadClassificationCodes();
        this.setupEventListeners();
        console.log('🎵 聖詩管理器初始化完成');
    }

    /**
     * 載入分類代碼對照表
     */
    loadClassificationCodes() {
        this.classificationCodes = {
            'H04B': {
                name_zh: '世紀頌讚',
                name_en: 'Century Praise',
                description: '現代中文聖詩集'
            },
            'K03A': {
                name_zh: '普頌新',
                name_en: 'New Hymns of Universal Praise',
                description: '普世頌讚新詩集'
            },
            'L01A': {
                name_zh: '頌主新歌',
                name_en: 'Lord\'s New Songs',
                description: '頌主新歌詩集'
            },
            'N01A': {
                name_zh: '新編讚美詩',
                name_en: 'New Hymnal',
                description: '新編讚美詩集'
            },
            'F01A': {
                name_zh: 'Hymns of the Faith',
                name_en: 'Hymns of the Faith',
                description: '信仰聖詩集'
            }
        };
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 監聽來自iframe的消息
        window.addEventListener('message', (event) => {
            this.handleMessage(event);
        });

        // 監聽鍵盤快捷鍵
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    /**
     * 處理消息
     */
    handleMessage(event) {
        switch (event.data.type) {
            case 'hymnFilter':
                this.applyFilters(event.data.filters);
                break;
            case 'exportHymnData':
                this.exportData();
                break;
            case 'loadHymnalData':
                this.loadHymnalData(event.data.source);
                break;
        }
    }

    /**
     * 處理鍵盤快捷鍵
     */
    handleKeyboardShortcuts(event) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 'f':
                    event.preventDefault();
                    this.focusSearch();
                    break;
                case 'e':
                    event.preventDefault();
                    this.exportData();
                    break;
                case 'r':
                    event.preventDefault();
                    this.refreshData();
                    break;
            }
        }
    }

    /**
     * 載入聖詩數據
     */
    async loadHymnalData(source = 'default') {
        try {
            if (source === 'file') {
                // 從文件載入
                await this.loadFromFile();
            } else {
                // 載入默認數據
                await this.loadDefaultData();
            }
            
            this.buildSearchIndex();
            this.notifyDataLoaded();
        } catch (error) {
            console.error('載入聖詩數據失敗:', error);
            this.notifyError('載入聖詩數據失敗');
        }
    }

    /**
     * 載入默認數據
     */
    async loadDefaultData() {
        // 這裡可以載入預設的聖詩數據
        this.hymnalData = {
            century_praise: {
                name: "世紀頌讚",
                name_en: "Century Praise",
                total: 573,
                description: "現代中文聖詩集",
                hymns: this.generateSampleHymns('H04B', 50)
            },
            universal_praise: {
                name: "普頌新",
                name_en: "New Hymns of Universal Praise",
                total: 1122,
                description: "普世頌讚新詩集",
                hymns: this.generateSampleHymns('K03A', 50)
            },
            lord_new_songs: {
                name: "頌主新歌",
                name_en: "Lord's New Songs",
                total: 400,
                description: "頌主新歌詩集",
                hymns: this.generateSampleHymns('L01A', 30)
            },
            new_hymnal: {
                name: "新編讚美詩",
                name_en: "New Hymnal",
                total: 600,
                description: "新編讚美詩集",
                hymns: this.generateSampleHymns('N01A', 40)
            },
            hymns_faith: {
                name: "Hymns of the Faith",
                name_en: "Hymns of the Faith",
                total: 500,
                description: "信仰聖詩集",
                hymns: this.generateSampleHymns('F01A', 35)
            }
        };
    }

    /**
     * 生成示例聖詩數據
     */
    generateSampleHymns(prefix, count) {
        const categories = ['world_famous', 'chinese', 'worship', 'ethnic'];
        const symbols = ['▲', '●', '◆', '★'];
        const hymns = [];

        for (let i = 1; i <= count; i++) {
            const category = categories[i % categories.length];
            const symbol = symbols[i % symbols.length];
            
            hymns.push({
                number: String(i).padStart(3, '0'),
                title_zh: `聖詩${i}`,
                title_en: `Hymn ${i}`,
                author: '傳統',
                category: category,
                symbol: symbol,
                classification_code: `${prefix}-${String(i).padStart(2, '0')}`
            });
        }

        return hymns;
    }

    /**
     * 從文件載入數據
     */
    async loadFromFile() {
        // 實現從JSON文件載入數據的邏輯
        // 這裡可以添加文件選擇器或直接載入預設文件
        console.log('從文件載入聖詩數據');
    }

    /**
     * 建立搜索索引
     */
    buildSearchIndex() {
        this.searchIndex = {};
        
        Object.keys(this.hymnalData).forEach(hymnalId => {
            const hymnal = this.hymnalData[hymnalId];
            hymnal.hymns.forEach(hymn => {
                const searchTerms = [
                    hymn.number,
                    hymn.title_zh,
                    hymn.title_en,
                    hymn.author,
                    hymn.classification_code
                ].join(' ').toLowerCase();
                
                this.searchIndex[hymn.number] = {
                    hymnalId,
                    hymn,
                    searchTerms
                };
            });
        });
    }

    /**
     * 應用篩選器
     */
    applyFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.notifyFiltersChanged();
    }

    /**
     * 搜索聖詩
     */
    searchHymns(query) {
        if (!query) return Object.values(this.searchIndex);
        
        const results = [];
        const searchTerm = query.toLowerCase();
        
        Object.values(this.searchIndex).forEach(item => {
            if (item.searchTerms.includes(searchTerm)) {
                results.push(item);
            }
        });
        
        return results;
    }

    /**
     * 按分類篩選
     */
    filterByCategory(categories) {
        if (!categories || categories.length === 0) {
            return Object.values(this.searchIndex);
        }
        
        return Object.values(this.searchIndex).filter(item =>
            categories.includes(item.hymn.category)
        );
    }

    /**
     * 按詩集篩選
     */
    filterByHymnal(hymnalId) {
        if (hymnalId === 'all') {
            return Object.values(this.searchIndex);
        }
        
        return Object.values(this.searchIndex).filter(item =>
            item.hymnalId === hymnalId
        );
    }

    /**
     * 獲取分類代碼信息
     */
    getClassificationInfo(code) {
        const prefix = code.split('-')[0];
        return this.classificationCodes[prefix] || {
            name_zh: '未知',
            name_en: 'Unknown',
            description: '未知分類'
        };
    }

    /**
     * 導出數據
     */
    exportData() {
        const data = {
            hymnalData: this.hymnalData,
            classificationCodes: this.classificationCodes,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hymnal-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ 聖詩數據導出完成');
    }

    /**
     * 導入數據
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.hymnalData = data.hymnalData || {};
                    this.classificationCodes = data.classificationCodes || {};
                    this.buildSearchIndex();
                    this.notifyDataLoaded();
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * 刷新數據
     */
    refreshData() {
        this.loadHymnalData();
        console.log('🔄 聖詩數據已刷新');
    }

    /**
     * 聚焦搜索框
     */
    focusSearch() {
        const searchInput = document.getElementById('globalSearch') || 
                           document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * 通知數據已載入
     */
    notifyDataLoaded() {
        if (window.parent) {
            window.parent.postMessage({
                type: 'hymnDataLoaded',
                data: this.hymnalData
            }, '*');
        }
    }

    /**
     * 通知篩選器已更改
     */
    notifyFiltersChanged() {
        if (window.parent) {
            window.parent.postMessage({
                type: 'hymnFiltersChanged',
                filters: this.currentFilters
            }, '*');
        }
    }

    /**
     * 通知錯誤
     */
    notifyError(message) {
        if (window.parent) {
            window.parent.postMessage({
                type: 'hymnError',
                message: message
            }, '*');
        }
    }

    /**
     * 獲取統計信息
     */
    getStats() {
        const stats = {
            totalHymns: 0,
            totalHymnals: Object.keys(this.hymnalData).length,
            categories: {
                world_famous: 0,
                chinese: 0,
                worship: 0,
                ethnic: 0
            }
        };

        Object.values(this.hymnalData).forEach(hymnal => {
            stats.totalHymns += hymnal.hymns.length;
            hymnal.hymns.forEach(hymn => {
                if (stats.categories[hymn.category] !== undefined) {
                    stats.categories[hymn.category]++;
                }
            });
        });

        return stats;
    }
}

// 全局實例
window.hymnManager = new HymnManager();

// 導出給其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HymnManager;
}



























