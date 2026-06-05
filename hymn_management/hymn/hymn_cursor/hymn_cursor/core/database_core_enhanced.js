// 🎵 聖詩數據庫核心系統 v3.0 - 8模組完整版
// 支持：詩歌、曲調、人物、歌集、分類、媒體、路徑、關聯

class EnhancedHymnDatabaseSystem {
    constructor() {
        this.databases = {
            // 1. 詩歌主表
            hymns: [],
            // 2. 曲調表
            tunes: [],
            // 3. 人物表（作者、作曲者）
            people: [],
            // 4. 歌集表
            hymnals: [],
            // 5. 分類表
            categories: [],
            // 6. 媒體表
            media: [],
            // 7. 路徑管理表
            paths: [],
            // 8. 關聯關係表
            relationships: []
        };
        this.nextIds = {
            hymns: 1,
            tunes: 1,
            people: 1,
            hymnals: 1,
            categories: 1,
            media: 1,
            paths: 1,
            relationships: 1
        };
        this.init();
    }

    // 初始化系統
    init() {
        this.loadFromStorage();
        this.initializeDefaultData();
        console.log('✅ 增強版數據庫系統已初始化');
    }

    // 從本地存儲加載數據
    loadFromStorage() {
        try {
            Object.keys(this.databases).forEach(tableName => {
                const stored = localStorage.getItem(`hymn_db_${tableName}`);
                if (stored) {
                    this.databases[tableName] = JSON.parse(stored);
                }
            });

            const storedIds = localStorage.getItem('hymn_db_next_ids');
            if (storedIds) {
                this.nextIds = JSON.parse(storedIds);
            }
        } catch (error) {
            console.error('載入數據失敗:', error);
        }
    }

    // 保存到本地存儲
    saveToStorage() {
        try {
            Object.keys(this.databases).forEach(tableName => {
                localStorage.setItem(`hymn_db_${tableName}`, JSON.stringify(this.databases[tableName]));
            });
            localStorage.setItem('hymn_db_next_ids', JSON.stringify(this.nextIds));
        } catch (error) {
            console.error('保存數據失敗:', error);
        }
    }

    // 初始化默認數據
    initializeDefaultData() {
        // 初始化默認分類
        if (this.databases.categories.length === 0) {
            this.addCategory({
                name: '讚美詩',
                name_cn: '讚美詩',
                code: 'H01-01',
                description: '讚美上帝的詩歌'
            });
            this.addCategory({
                name: '禱告詩',
                name_cn: '禱告詩',
                code: 'H01-02',
                description: '向上帝禱告的詩歌'
            });
            this.addCategory({
                name: '感恩詩',
                name_cn: '感恩詩',
                code: 'H01-03',
                description: '感謝上帝的詩歌'
            });
        }

        // 初始化默認歌集
        if (this.databases.hymnals.length === 0) {
            this.addHymnal({
                name: '世紀頌讚',
                name_cn: '世紀頌讚',
                publisher: '香港浸信會',
                year: 2000,
                total_hymns: 0
            });
            this.addHymnal({
                name: '新編讚美詩',
                name_cn: '新編讚美詩',
                publisher: '中國基督教協會',
                year: 1983,
                total_hymns: 0
            });
        }
    }

    // ===== 詩歌主表操作 =====
    addHymn(data) {
        const hymn = {
            id: this.nextIds.hymns++,
            number: data.number || '',
            title_en: data.title_en || '',
            title_cn: data.title_cn || '',
            author: data.author || '',
            composer: data.composer || '',
            category_code: data.category_code || '',
            importance: data.importance || '',
            directory_path: data.directory_path || '',
            file_name: data.file_name || '',
            original_link: data.original_link || '',
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
        };
        this.databases.hymns.push(hymn);
        this.saveToStorage();
        return hymn.id;
    }

    updateHymn(id, data) {
        const hymn = this.databases.hymns.find(h => h.id === id);
        if (hymn) {
            Object.assign(hymn, data, { updated_date: new Date().toISOString() });
            this.saveToStorage();
            return true;
        }
        return false;
    }

    deleteHymn(id) {
        const index = this.databases.hymns.findIndex(h => h.id === id);
        if (index !== -1) {
            this.databases.hymns.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    getHymn(id) {
        return this.databases.hymns.find(h => h.id === id);
    }

    searchHymns(query) {
        const lowerQuery = query.toLowerCase();
        return this.databases.hymns.filter(hymn => 
            hymn.number.toLowerCase().includes(lowerQuery) ||
            hymn.title_en.toLowerCase().includes(lowerQuery) ||
            hymn.title_cn.toLowerCase().includes(lowerQuery) ||
            hymn.author.toLowerCase().includes(lowerQuery)
        );
    }

    // ===== 曲調表操作 =====
    addTune(data) {
        const tune = {
            id: this.nextIds.tunes++,
            name: data.name || '',
            name_cn: data.name_cn || '',
            composer: data.composer || '',
            meter: data.meter || '',
            key: data.key || '',
            tempo: data.tempo || '',
            notes: data.notes || '',
            created_date: new Date().toISOString()
        };
        this.databases.tunes.push(tune);
        this.saveToStorage();
        return tune.id;
    }

    // ===== 人物表操作 =====
    addPerson(data) {
        const person = {
            id: this.nextIds.people++,
            name: data.name || '',
            name_cn: data.name_cn || '',
            type: data.type || 'author', // author, composer, translator
            birth_year: data.birth_year || '',
            death_year: data.death_year || '',
            nationality: data.nationality || '',
            biography: data.biography || '',
            created_date: new Date().toISOString()
        };
        this.databases.people.push(person);
        this.saveToStorage();
        return person.id;
    }

    // ===== 歌集表操作 =====
    addHymnal(data) {
        const hymnal = {
            id: this.nextIds.hymnals++,
            name: data.name || '',
            name_cn: data.name_cn || '',
            publisher: data.publisher || '',
            year: data.year || '',
            sequence_number: data.sequence_number || '',
            total_hymns: data.total_hymns || 0,
            notes: data.notes || '',
            created_date: new Date().toISOString()
        };
        this.databases.hymnals.push(hymnal);
        this.saveToStorage();
        return hymnal.id;
    }

    // ===== 分類表操作 =====
    addCategory(data) {
        const category = {
            id: this.nextIds.categories++,
            name: data.name || '',
            name_cn: data.name_cn || '',
            code: data.code || '',
            description: data.description || '',
            parent_id: data.parent_id || null,
            created_date: new Date().toISOString()
        };
        this.databases.categories.push(category);
        this.saveToStorage();
        return category.id;
    }

    // ===== 媒體表操作 =====
    addMedia(data) {
        const media = {
            id: this.nextIds.media++,
            hymn_id: data.hymn_id || null,
            media_type: data.media_type || 'unknown', // youtube_video, mp3, score, image, article, hymnal
            media_title: data.media_title || '',
            media_url: data.media_url || '',
            timestamp: data.timestamp || '',
            performance_type: data.performance_type || '', // guitar, choir, female_solo, male_solo, orchestra, piano, other
            source_info: data.source_info || '', // publisher, orchestra, singer, album
            notes: data.notes || '',
            created_date: new Date().toISOString()
        };
        this.databases.media.push(media);
        this.saveToStorage();
        return media.id;
    }

    // ===== 路徑管理表操作 =====
    addPath(data) {
        const path = {
            id: this.nextIds.paths++,
            directory_path: data.directory_path || '',
            file_name: data.file_name || '',
            file_type: data.file_type || '',
            file_size: data.file_size || 0,
            last_accessed: data.last_accessed || new Date().toISOString(),
            created_date: new Date().toISOString()
        };
        this.databases.paths.push(path);
        this.saveToStorage();
        return path.id;
    }

    // ===== 關聯關係表操作 =====
    addRelationship(data) {
        const relationship = {
            id: this.nextIds.relationships++,
            source_table: data.source_table || '',
            source_id: data.source_id || null,
            target_table: data.target_table || '',
            target_id: data.target_id || null,
            relationship_type: data.relationship_type || '', // belongs_to, has_many, references
            created_date: new Date().toISOString()
        };
        this.databases.relationships.push(relationship);
        this.saveToStorage();
        return relationship.id;
    }

    // ===== 批量操作 =====
    batchAddHymns(hymnsData) {
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        hymnsData.forEach((hymnData, index) => {
            try {
                this.addHymn(hymnData);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`第${index + 1}條記錄: ${error.message}`);
            }
        });

        return results;
    }

    // ===== 統計功能 =====
    getStatistics() {
        return {
            total_hymns: this.databases.hymns.length,
            total_tunes: this.databases.tunes.length,
            total_people: this.databases.people.length,
            total_hymnals: this.databases.hymnals.length,
            total_categories: this.databases.categories.length,
            total_media: this.databases.media.length,
            total_paths: this.databases.paths.length,
            total_relationships: this.databases.relationships.length
        };
    }

    // ===== 數據完整性檢查 =====
    checkDataIntegrity() {
        const issues = [];

        // 檢查詩歌表中的外鍵引用
        this.databases.hymns.forEach(hymn => {
            if (hymn.category_code) {
                const category = this.databases.categories.find(c => c.code === hymn.category_code);
                if (!category) {
                    issues.push(`詩歌 ${hymn.id} 引用了不存在的分類代碼: ${hymn.category_code}`);
                }
            }
        });

        // 檢查媒體表中的外鍵引用
        this.databases.media.forEach(media => {
            if (media.hymn_id) {
                const hymn = this.databases.hymns.find(h => h.id === media.hymn_id);
                if (!hymn) {
                    issues.push(`媒體 ${media.id} 引用了不存在的詩歌ID: ${media.hymn_id}`);
                }
            }
        });

        return {
            has_issues: issues.length > 0,
            issues: issues,
            total_issues: issues.length
        };
    }

    // ===== 數據修復 =====
    repairDataIntegrity() {
        const integrity = this.checkDataIntegrity();
        const repairs = [];

        if (integrity.has_issues) {
            // 修復詩歌表中的無效分類引用
            this.databases.hymns.forEach(hymn => {
                if (hymn.category_code) {
                    const category = this.databases.categories.find(c => c.code === hymn.category_code);
                    if (!category) {
                        hymn.category_code = '';
                        repairs.push(`修復詩歌 ${hymn.id} 的無效分類引用`);
                    }
                }
            });

            // 修復媒體表中的無效詩歌引用
            this.databases.media.forEach(media => {
                if (media.hymn_id) {
                    const hymn = this.databases.hymns.find(h => h.id === media.hymn_id);
                    if (!hymn) {
                        media.hymn_id = null;
                        repairs.push(`修復媒體 ${media.id} 的無效詩歌引用`);
                    }
                }
            });

            this.saveToStorage();
        }

        return {
            repairs_made: repairs.length,
            repairs: repairs
        };
    }

    // ===== 數據導出 =====
    exportData(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.databases, null, 2);
        } else if (format === 'csv') {
            return this.exportToCSV();
        }
        return null;
    }

    exportToCSV() {
        let csv = '';
        
        // 導出詩歌表
        csv += '詩歌表\n';
        csv += 'ID,編號,英文標題,中文標題,作者,作曲者,分類代碼,重要性,路徑,文件名,原始鏈接\n';
        this.databases.hymns.forEach(hymn => {
            csv += `${hymn.id},${hymn.number},${hymn.title_en},${hymn.title_cn},${hymn.author},${hymn.composer},${hymn.category_code},${hymn.importance},${hymn.directory_path},${hymn.file_name},${hymn.original_link}\n`;
        });
        
        csv += '\n媒體表\n';
        csv += 'ID,詩歌ID,媒體類型,媒體標題,媒體URL,時間戳,演出類型,來源信息,備注\n';
        this.databases.media.forEach(media => {
            csv += `${media.id},${media.hymn_id},${media.media_type},${media.media_title},${media.media_url},${media.timestamp},${media.performance_type},${media.source_info},${media.notes}\n`;
        });

        return csv;
    }

    // ===== 數據導入 =====
    importData(data, format = 'json') {
        try {
            if (format === 'json') {
                const importedData = JSON.parse(data);
                Object.keys(importedData).forEach(tableName => {
                    if (this.databases[tableName]) {
                        this.databases[tableName] = importedData[tableName];
                    }
                });
                this.saveToStorage();
                return { success: true, message: '數據導入成功' };
            }
        } catch (error) {
            return { success: false, message: `數據導入失敗: ${error.message}` };
        }
    }

    // ===== 清空數據 =====
    clearAllData() {
        Object.keys(this.databases).forEach(tableName => {
            this.databases[tableName] = [];
        });
        this.nextIds = {
            hymns: 1,
            tunes: 1,
            people: 1,
            hymnals: 1,
            categories: 1,
            media: 1,
            paths: 1,
            relationships: 1
        };
        this.saveToStorage();
        this.initializeDefaultData();
    }

    // ===== 備份和恢復 =====
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            databases: this.databases,
            nextIds: this.nextIds
        };
        localStorage.setItem('hymn_db_backup', JSON.stringify(backup));
        return backup;
    }

    restoreFromBackup() {
        const backup = localStorage.getItem('hymn_db_backup');
        if (backup) {
            try {
                const backupData = JSON.parse(backup);
                this.databases = backupData.databases;
                this.nextIds = backupData.nextIds;
                this.saveToStorage();
                return { success: true, message: '備份恢復成功' };
            } catch (error) {
                return { success: false, message: `備份恢復失敗: ${error.message}` };
            }
        }
        return { success: false, message: '未找到備份數據' };
    }
}

// 創建全局實例
window.enhancedHymnDatabase = new EnhancedHymnDatabaseSystem();
console.log('🎵 增強版數據庫核心系統 v3.0 已初始化');
