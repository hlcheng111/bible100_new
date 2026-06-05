// 聖詩數據庫核心系統
class HymnDatabaseSystem {
    constructor() {
        this.databases = {
            hymns: [],
            tunes: [],
            people: [],
            hymnals: [],
            categories: [],
            media: []
        };
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.initializeCategories();
        this.initializePeople();
    }
    
    // 初始化分類
    initializeCategories() {
        if (this.databases.categories.length === 0) {
            this.databases.categories = [
                { id: 1, name: '崇拜類', type: 'worship', parent_id: null },
                { id: 2, name: '讚美詩', type: 'worship', parent_id: 1 },
                { id: 3, name: '禱告詩', type: 'worship', parent_id: 1 },
                { id: 4, name: '感恩詩', type: 'worship', parent_id: 1 },
                { id: 5, name: '音樂類', type: 'music', parent_id: null },
                { id: 6, name: '傳統聖詩', type: 'music', parent_id: 5 },
                { id: 7, name: '現代讚美詩', type: 'music', parent_id: 5 },
                { id: 8, name: '主題類', type: 'theme', parent_id: null },
                { id: 9, name: '聖誕節', type: 'theme', parent_id: 8 },
                { id: 10, name: '復活節', type: 'theme', parent_id: 8 }
            ];
        }
    }
    
    // 初始化作者
    initializePeople() {
        if (this.databases.people.length === 0) {
            this.databases.people = [
                { id: 1, surname: 'Heber', given_name: 'Reginald', full_name: 'Reginald Heber', nation: 'UK' },
                { id: 2, surname: 'Dykes', given_name: 'John', full_name: 'John Dykes', nation: 'UK' },
                { id: 3, surname: 'Wesley', given_name: 'Charles', full_name: 'Charles Wesley', nation: 'UK' },
                { id: 4, surname: 'Newton', given_name: 'John', full_name: 'John Newton', nation: 'UK' }
            ];
        }
    }
    
    // 保存到本地存儲
    saveToStorage() {
        localStorage.setItem('hymn_database', JSON.stringify(this.databases));
    }
    
    // 從本地存儲載入
    loadFromStorage() {
        const stored = localStorage.getItem('hymn_database');
        if (stored) {
            this.databases = JSON.parse(stored);
        }
    }
    
    // 添加詩歌
    addHymn(hymnData) {
        const hymn = {
            id: this.databases.hymns.length + 1,
            title_en: hymnData.title_en || '',
            title_cn: hymnData.title_cn || '',
            author_id: hymnData.author_id || null,
            composer_id: hymnData.composer_id || null,
            category_id: hymnData.category_id || 1,
            directory_path: hymnData.directory_path || '',
            file_name: hymnData.file_name || '',
            original_link: hymnData.original_link || '',
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
        };
        
        this.databases.hymns.push(hymn);
        this.saveToStorage();
        return hymn.id;
    }
    
    // 添加媒體
    addMedia(mediaData) {
        const media = {
            id: this.databases.media.length + 1,
            hymn_id: mediaData.hymn_id,
            media_type: mediaData.media_type || 'youtube_video',
            media_title: mediaData.media_title || '',
            media_url: mediaData.media_url || '',
            performer_name: mediaData.performer_name || '',
            album_name: mediaData.album_name || '',
            created_date: new Date().toISOString()
        };
        
        this.databases.media.push(media);
        this.saveToStorage();
        return media.id;
    }
    
    // 搜索詩歌
    searchHymns(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        this.databases.hymns.forEach(hymn => {
            if (hymn.title_en.toLowerCase().includes(searchTerm) ||
                hymn.title_cn.toLowerCase().includes(searchTerm)) {
                results.push(hymn);
            }
        });
        
        return results;
    }
    
    // 獲取統計數據
    getStatistics() {
        return {
            total_hymns: this.databases.hymns.length,
            total_tunes: this.databases.tunes.length,
            total_people: this.databases.people.length,
            total_hymnals: this.databases.hymnals.length,
            total_media: this.databases.media.length,
            total_categories: this.databases.categories.length
        };
    }
    
    // 獲取分類統計
    getCategoryStats() {
        const stats = {};
        this.databases.categories.forEach(cat => {
            stats[cat.name] = this.databases.hymns.filter(h => h.category_id === cat.id).length;
        });
        return stats;
    }
    
    // 批量導入詩歌
    batchImportHymns(hymnList) {
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };
        
        hymnList.forEach((hymnData, index) => {
            try {
                this.addHymn(hymnData);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    index: index,
                    error: error.message,
                    data: hymnData
                });
            }
        });
        
        return results;
    }
}

// 創建全局實例
window.hymnDatabase = new HymnDatabaseSystem();
console.log('聖詩數據庫系統初始化完成');




