/**
 * 通用数据载入器 - 解决所有数据载入问题
 * 支持 SQLite (.db) 和 JSON (.json) 双重模式
 * 自动检测数据格式并使用最佳载入策略
 */

class UniversalDataLoader {
    constructor() {
        this.databases = {
            bibles: {},
            commentaries: {},
            dictionaries: {},
            crossrefs: {},
            devotionals: {}
        };
        this.SQL = null;
        this.loadingStatus = {
            total: 0,
            loaded: 0,
            failed: 0,
            mode: 'auto'
        };
        this.fallbackMode = false;
        this.dataFormats = new Map();
    }

    async initialize() {
        try {
            console.log('🚀 初始化通用数据载入器...');
            
            const sqlAvailable = await this.checkSQLAvailability();
            if (sqlAvailable) {
                console.log('✅ SQL.js 可用，支持 SQLite 模式');
                this.loadingStatus.mode = 'hybrid';
            } else {
                console.log('⚠️ SQL.js 不可用，使用 JSON 模式');
                this.loadingStatus.mode = 'json';
                this.fallbackMode = true;
            }
            
            await this.loadAllData();
            
            console.log('🎉 数据载入器初始化完成');
            this.printLoadingStats();
            return true;
            
        } catch (error) {
            console.error('❌ 数据载入器初始化失败:', error);
            return false;
        }
    }

    async checkSQLAvailability() {
        try {
            let initFn = typeof initSqlJs !== 'undefined' ? initSqlJs : null;
            if (!initFn) {
                console.log('🔍 initSqlJs 未定义，尝试从 CDN 动态载入 SQL.js...');
                initFn = await this.loadSqlJsFromCDN();
            }
            if (initFn) {
                this.SQL = await initFn({
                    locateFile: file => 'https://sql.js.org/dist/' + file
                });
                console.log('✅ SQL.js 已載入');
                return true;
            }
            return false;
        } catch (error) {
            console.warn('⚠️ SQL.js 载入失败:', error.message);
            return false;
        }
    }

    loadSqlJsFromCDN() {
        return new Promise((resolve) => {
            if (typeof initSqlJs !== 'undefined') {
                resolve(initSqlJs);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://sql.js.org/dist/sql-wasm.js';
            script.async = true;
            script.onload = () => resolve(typeof initSqlJs !== 'undefined' ? initSqlJs : null);
            script.onerror = () => {
                console.warn('SQL.js CDN 載入失敗');
                resolve(null);
            };
            document.head.appendChild(script);
        });
    }

    async loadAllData() {
        const loc = typeof window !== 'undefined' && window.location;
        const isFile = loc && loc.protocol === 'file:';
        const base = (loc && loc.origin && !isFile)
            ? loc.origin.replace(/\/?$/, '/')
            : '../';
        const dataSources = [
            // 圣经版本（jsonFileName + jsonFolder 供 smartFetch 繁簡體/路徑自動偵測）
            { category: 'bibles', key: 'faith', name: '信望爱(和合本)', 
              sqlPath: base + 'data/bibles/信望愛(和合本).db', 
              jsonPath: base + 'data/bibles/信望愛(和合本).json',
              jsonPathAlt: base + 'data/bibles/信望爱(和合本).json',
              jsonFolder: 'bibles', jsonFileName: '信望爱(和合本).json' },
            { category: 'bibles', key: 'cuv', name: '和合本', 
              sqlPath: base + 'data/bibles/和合本.db', 
              jsonPath: base + 'data/bibles/和合本.json',
              jsonFolder: 'bibles', jsonFileName: '和合本.json' },
            { category: 'bibles', key: 'luzhen', name: '吕振中', 
              sqlPath: base + 'data/bibles/luzhenzhong.db', 
              jsonPath: base + 'data/bibles/吕振中.json',
              jsonFolder: 'bibles', jsonFileName: '吕振中.json' },
            { category: 'bibles', key: 'kjv', name: 'KJV', 
              sqlPath: base + 'data/bibles/KJV.db', 
              jsonPath: base + 'data/bibles/kjv.json',
              jsonFolder: 'bibles', jsonFileName: 'kjv.json' },
            { category: 'bibles', key: 'niv', name: 'NIV', 
              sqlPath: base + 'data/bibles/NIV.db', 
              jsonPath: base + 'data/bibles/niv.json',
              jsonFolder: 'bibles', jsonFileName: 'niv.json' },
            
            // 注释资源
            { category: 'commentaries', key: 'comprehensive', name: '综合解读', 
              sqlPath: base + 'data/cj/综合解读.db', 
              jsonPath: base + 'data/cj/综合解读.json',
              jsonPathAlt: base + 'data/cj/综合解读_明文版.json',
              jsonFolder: 'cj', jsonFileName: '综合解读_明文版.json' },
            { category: 'commentaries', key: 'faith_commentary', name: '信望爱注释', 
              sqlPath: base + 'data/cj/信望爱注释.db', 
              jsonPath: base + 'data/cj/信望爱注释.json',
              jsonFolder: 'cj', jsonFileName: '信望爱注释.json' },
            { category: 'commentaries', key: 'crossref', name: '串珠注释', 
              sqlPath: base + 'data/cj/串珠圣经注释.db', 
              jsonPath: base + 'data/cj/串珠圣经注释.json',
              jsonFolder: 'cj', jsonFileName: '串珠圣经注释.json' },
            { category: 'commentaries', key: 'guide', name: '启导本注释', 
              sqlPath: base + 'data/cj/启导本圣经注释.db', 
              jsonPath: base + 'data/cj/启导本圣经注释.json',
              jsonFolder: 'cj', jsonFileName: '启导本圣经注释.json' }
        ];

        this.loadingStatus.total = dataSources.length;
        
        const loadPromises = dataSources.map(source => this.loadDataSource(source));
        await Promise.all(loadPromises);
    }

    async loadDataSource(source) {
        try {
            console.log(`🔄 正在载入 ${source.name}`);
            
            let success = false;
            let format = 'unknown';
            
            if (!this.fallbackMode && source.sqlPath) {
                try {
                    const data = await this.loadSQLiteData(source);
                    if (data) {
                        this.databases[source.category][source.key] = {
                            data: data,
                            name: source.name,
                            format: 'sqlite',
                            loaded: true
                        };
                        format = 'sqlite';
                        success = true;
                        console.log(`✅ SQLite: ${source.name} 载入成功`);
                    }
                } catch (sqlError) {
                    console.warn(`⚠️ SQLite载入失败 ${source.name}:`, sqlError.message);
                }
            }
            
            if (!success && source.jsonPath) {
                const folder = source.category === 'bibles' ? 'bibles/' : 'cj/';
                const fname = source.jsonPath.split('/').pop() || '';
                const relPath = '../data/' + folder + fname;
                const jsonPaths = [relPath, source.jsonPath];
                if (source.jsonPathAlt) jsonPaths.push(source.jsonPathAlt);
                for (const p of jsonPaths) {
                    try {
                        const data = await this.loadJSONData(p);
                        if (data) {
                            this.databases[source.category][source.key] = {
                                data: data,
                                name: source.name,
                                format: 'json',
                                loaded: true
                            };
                            format = 'json';
                            success = true;
                            console.log(`✅ JSON: ${source.name} 载入成功`);
                            break;
                        }
                    } catch (jsonError) {
                        console.warn(`⚠️ JSON载入失败 ${source.name} (${p}):`, jsonError.message);
                    }
                }
                if (!success && source.jsonFileName && source.jsonFolder) {
                    const data = await this.smartFetch(source.jsonFolder, source.jsonFileName);
                    if (data) {
                        this.databases[source.category][source.key] = {
                            data: data,
                            name: source.name,
                            format: 'json',
                            loaded: true
                        };
                        format = 'json';
                        success = true;
                        console.log(`✅ smartFetch: ${source.name} 载入成功`);
                    }
                }
            }
            
            this.dataFormats.set(source.key, format);
            
            if (success) {
                this.loadingStatus.loaded++;
            } else {
                this.loadingStatus.failed++;
                this.databases[source.category][source.key] = {
                    data: null,
                    name: source.name,
                    format: 'fallback',
                    loaded: false,
                    fallback: true
                };
                console.warn(`❌ ${source.name} 所有格式载入失败，使用备用数据`);
            }
            
        } catch (error) {
            console.error(`❌ 载入数据源失败 ${source.name}:`, error);
            this.loadingStatus.failed++;
        }
    }

    async loadSQLiteData(source) {
        if (!this.SQL) throw new Error('SQL.js 未初始化');
        
        const response = await fetch(source.sqlPath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
            throw new Error('SQLite 文件为空');
        }
        
        const db = new this.SQL.Database(new Uint8Array(arrayBuffer));
        
        const tables = this.getDatabaseTables(db);
        if (tables.length === 0) {
            throw new Error('数据库无有效表格');
        }
        
        return db;
    }

    async loadJSONData(pathOrSource) {
        const path = typeof pathOrSource === 'string' ? pathOrSource : pathOrSource.jsonPath;
        const url = path + (path.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const ct = (response.headers.get('Content-Type') || '').toLowerCase();
        if (ct.includes('text/html') && !ct.includes('json')) {
            console.warn('伺服器回傳 HTML 而非 JSON:', path);
        }
        const buffer = await response.arrayBuffer();
        const view = new Uint8Array(buffer);
        if (buffer.byteLength < 16) {
            throw new Error('回應內容過短');
        }
        const header = String.fromCharCode(...view.slice(0, 15));
        if (header.includes('SQLite format')) {
            if (this.SQL) {
                const db = new this.SQL.Database(view);
                if (this.getDatabaseTables(db).length > 0) return db;
            }
            throw new Error('檔案為 SQLite 格式，但 SQL.js 未載入');
        }
        let text;
        if (buffer.byteLength >= 2 && view[0] === 0xFF && view[1] === 0xFE) {
            text = new TextDecoder('utf-16le').decode(buffer.slice(2));
        } else if (buffer.byteLength >= 2 && view[0] === 0xFE && view[1] === 0xFF) {
            text = new TextDecoder('utf-16be').decode(buffer.slice(2));
        } else if (buffer.byteLength >= 4 && view[0] === 0x7B && view[1] === 0x00) {
            text = new TextDecoder('utf-16le').decode(buffer);
        } else {
            text = new TextDecoder('utf-8').decode(buffer);
        }
        text = text.trim().replace(/^\uFEFF/, '').replace(/\0/g, '');
        if (text.startsWith('<')) {
            throw new Error('伺服器回傳 HTML 而非 JSON，請確認路徑正確且使用 bat 啟動');
        }
        if (text.includes('=') && !text.startsWith('{') && !text.startsWith('[')) {
            const eq = text.indexOf('=');
            text = text.substring(eq + 1).replace(/;\s*$/, '').trim();
        }
        if (!text || text.length < 2) {
            throw new Error('回應內容過短或為空');
        }
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseErr) {
            const hex = Array.from(view.slice(0, 24)).map(b => b.toString(16).padStart(2, '0')).join(' ');
            console.warn('JSON 解析失敗 [' + path + '] 前24 bytes(hex):', hex, '前60字:', JSON.stringify(text.substring(0, 60)));
            throw parseErr;
        }
        if (!data || (Array.isArray(data) && data.length === 0) || 
            (typeof data === 'object' && Object.keys(data).length === 0)) {
            throw new Error('JSON 数据为空');
        }
        return data;
    }

    /**
     * 增強型路徑偵測：自動嘗試多種路徑與繁簡體檔名變體
     * 解決 iframe 路徑偏移、繁簡檔名不一導致的 404
     */
    async smartFetch(baseFolder, fileName) {
        const folder = baseFolder || 'bibles';
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
        const originSlash = origin ? origin.replace(/\/?$/, '/') : '';
        const nameVariations = [fileName];
        if (fileName.includes('愛')) nameVariations.push(fileName.replace(/愛/g, '爱'));
        if (fileName.includes('爱')) nameVariations.push(fileName.replace(/爱/g, '愛'));
        if (fileName.includes('綜合')) nameVariations.push(fileName.replace(/綜合/g, '综合'));
        if (fileName.includes('解讀')) nameVariations.push(fileName.replace(/解讀/g, '解读'));

        const pathBases = [
            originSlash + 'data/' + folder + '/',
            '/data/' + folder + '/',
            '../data/' + folder + '/',
            '../../data/' + folder + '/',
            './data/' + folder + '/'
        ];

        for (const base of pathBases) {
            for (const name of nameVariations) {
                const url = base + name;
                try {
                    const res = await fetch(url, { method: 'HEAD' });
                    if (res.ok) {
                        console.log('%c ✅ 找到資源: ' + url, 'color: #2ecc71; font-weight: bold;');
                        const dataRes = await fetch(url);
                        const buf = await dataRes.arrayBuffer();
                        const v = new Uint8Array(buf);
                        let text;
                        if (buf.byteLength >= 2 && v[0] === 0xFF && v[1] === 0xFE) {
                            text = new TextDecoder('utf-16le').decode(buf.slice(2));
                        } else if (buf.byteLength >= 2 && v[0] === 0xFE && v[1] === 0xFF) {
                            text = new TextDecoder('utf-16be').decode(buf.slice(2));
                        } else if (buf.byteLength >= 4 && v[0] === 0x7B && v[1] === 0x00) {
                            text = new TextDecoder('utf-16le').decode(buf);
                        } else {
                            text = new TextDecoder('utf-8').decode(buf);
                        }
                        text = text.trim().replace(/^\uFEFF/, '').replace(/\0/g, '');
                        if (!text) continue;
                        const data = JSON.parse(text);
                        if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                            return data;
                        }
                    }
                } catch (e) { /* 繼續嘗試 */ }
            }
        }
        console.error('%c ❌ 無法定位資源: ' + fileName, 'color: #e74c3c; font-weight: bold;');
        return null;
    }

    getDatabaseTables(db) {
        try {
            const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
            const tables = [];
            while (stmt.step()) {
                tables.push(stmt.getAsObject().name);
            }
            stmt.free();
            return tables;
        } catch (error) {
            console.warn('获取表格列表失败:', error);
            return [];
        }
    }

    async queryBible(version, book, chapter, verse = null) {
        try {
            const bibleData = this.databases.bibles[version];
            if (!bibleData) {
                throw new Error(`圣经版本 ${version} 未找到`);
            }
            
            if (bibleData.fallback) {
                return this.getFallbackVerses(version, book, chapter);
            }
            
            if (bibleData.format === 'sqlite') {
                return await this.querySQLiteBible(bibleData.data, book, chapter, verse);
            } else if (bibleData.format === 'json') {
                return await this.queryJSONBible(bibleData.data, book, chapter, verse);
            }
            
        } catch (error) {
            console.error(`查询圣经失败 ${version}:`, error);
            return this.getFallbackVerses(version, book, chapter);
        }
    }

    async querySQLiteBible(db, book, chapter, verse) {
        const queries = [
            'SELECT verse, text FROM verses WHERE book=? AND chapter=? ORDER BY verse',
            'SELECT verse, scripture FROM verses WHERE book=? AND chapter=? ORDER BY verse',
            'SELECT verse, content FROM Bible WHERE book=? AND chapter=? ORDER BY verse',
            'SELECT * FROM verses WHERE book=? AND chapter=? ORDER BY verse',
            'SELECT * FROM Bible WHERE Book=? AND Chapter=? ORDER BY Verse'
        ];
        
        for (const query of queries) {
            try {
                const stmt = db.prepare(query);
                stmt.bind([book, chapter]);
                
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                
                if (results.length > 0) {
                    return this.formatVerses(results);
                }
            } catch (queryError) {
                continue;
            }
        }
        
        throw new Error('无法查询到经文数据');
    }

    async queryJSONBible(data, book, chapter, verse) {
        let verses = [];
        
        if (Array.isArray(data)) {
            verses = data.filter(v => 
                (v.book === book || v.Book === book) && 
                (v.chapter === chapter || v.Chapter === chapter)
            );
        } else if (data.verses) {
            verses = data.verses.filter(v => 
                (v.book === book || v.Book === book) && 
                (v.chapter === chapter || v.Chapter === chapter)
            );
        } else if (data[book] && data[book][chapter]) {
            verses = data[book][chapter];
        } else if (data.Bible && Array.isArray(data.Bible.data)) {
            verses = data.Bible.data.filter(v =>
                (v.book === book || v.Book === book) &&
                (v.chapter === chapter || v.Chapter === chapter)
            );
        }
        
        if (verses.length === 0) {
            throw new Error('未找到对应章节的经文');
        }
        
        return this.formatVerses(verses);
    }

    formatVerses(rawVerses) {
        return rawVerses.map((verse, index) => {
            const verseNum = verse.verse || verse.Verse || index + 1;
            const text = verse.text || verse.scripture || verse.content || 
                        verse.Text || verse.Scripture || verse.Content || '';
            
            return {
                verse: verseNum,
                text: text
            };
        });
    }

    async queryCommentary(type, book, chapter) {
        try {
            const commentaryData = this.databases.commentaries[type];
            if (!commentaryData || commentaryData.fallback) {
                return this.getFallbackCommentary(type, book, chapter);
            }
            
            if (commentaryData.format === 'sqlite') {
                return await this.querySQLiteCommentary(commentaryData.data, book, chapter);
            } else if (commentaryData.format === 'json') {
                return await this.queryJSONCommentary(commentaryData.data, book, chapter);
            }
            
        } catch (error) {
            console.error(`查询注释失败 ${type}:`, error);
            return this.getFallbackCommentary(type, book, chapter);
        }
    }

    async querySQLiteCommentary(db, book, chapter) {
        const queries = [
            'SELECT * FROM commentary WHERE Book=? AND Chapter=?',
            'SELECT * FROM commentaries WHERE Book=? AND Chapter=?',
            'SELECT * FROM data WHERE Book=? AND Chapter=?',
            'SELECT * FROM commentary WHERE book=? AND chapter=?',
            'SELECT * FROM commentaries WHERE book=? AND chapter=?'
        ];
        
        for (const query of queries) {
            try {
                const stmt = db.prepare(query);
                stmt.bind([book, chapter]);
                
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                
                if (results.length > 0) {
                    return this.formatCommentary(results);
                }
            } catch (queryError) {
                continue;
            }
        }
        
        return [];
    }

    async queryJSONCommentary(data, book, chapter) {
        let commentaries = [];
        const b = Number(book);
        const ch = Number(chapter);
        
        if (Array.isArray(data)) {
            commentaries = data.filter(c => 
                (Number(c.book) === b || Number(c.Book) === b) && 
                (Number(c.chapter) === ch || Number(c.Chapter) === ch)
            );
        } else if (data.commentaries) {
            commentaries = data.commentaries.filter(c => 
                (Number(c.book) === b || c.book == book) && 
                (Number(c.chapter) === ch || c.chapter == chapter)
            );
        } else if (data.commentary && data.commentary.data) {
            commentaries = data.commentary.data.filter(c => 
                (Number(c.Book) === b || c.Book == book) && 
                (Number(c.Chapter) === ch || c.Chapter == chapter)
            );
        }
        
        return this.formatCommentary(commentaries);
    }

    safeDecryptContent(text) {
        if (!text || typeof text !== 'string') return text || '';
        if (!text.startsWith('l001w')) return text;
        try {
            const prefix = 'l001wNia4i7hTEMxRHJg3';
            const cleanData = text.substring(prefix.length);
            const decoded = atob(cleanData);
            const key = 'Bible100CommentaryKey2024';
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return decrypted;
        } catch (e) {
            return text;
        }
    }

    formatCommentary(rawCommentaries) {
        return rawCommentaries.map((commentary, index) => {
            let content = commentary.content || commentary.Data || commentary.text || '';
            content = this.safeDecryptContent(content);
            const fromVerse = commentary.from_verse || commentary.FromVerse || commentary.fromVerse || 1;
            const toVerse = commentary.to_verse || commentary.ToVerse || commentary.toVerse || fromVerse;
            
            return {
                id: commentary.id || index + 1,
                content: content,
                fromVerse: fromVerse,
                toVerse: toVerse,
                images: commentary.images || []
            };
        });
    }

    getFallbackVerses(version, book, chapter) {
        const fallbackData = {
            'faith': [
                { verse: 1, text: '耶稣基督的启示，就是神赐给他，叫他将必要快成的事指示他的众仆人。' },
                { verse: 2, text: '约翰便将神的道和耶稣基督的见证，凡自己所看见的都证明出来。' },
                { verse: 3, text: '念这书上预言的和那些听见又遵守其中所记载的，都是有福的，因为日期近了。' }
            ],
            'cuv': [
                { verse: 1, text: '耶稣基督的启示，就是神赐给他，叫他将必要快成的事指示他的众仆人。' },
                { verse: 2, text: '约翰便将神的道和耶稣基督的见证，凡自己所看见的都证明出来。' },
                { verse: 3, text: '念这书上预言的和那些听见又遵守其中所记载的，都是有福的，因为日期近了。' }
            ]
        };
        
        return fallbackData[version] || fallbackData['faith'];
    }

    getFallbackCommentary(type, book, chapter) {
        return [{
            id: 1,
            content: `【${type} 注释】\n\n本章节的详细注释正在载入中，请稍候...\n\n这是备用注释内容，建议检查数据源文件是否存在并格式正确。`,
            fromVerse: 1,
            toVerse: 1,
            images: []
        }];
    }

    printLoadingStats() {
        console.log('📊 数据载入统计:');
        console.log(`  总计: ${this.loadingStatus.total} 个数据源`);
        console.log(`  成功: ${this.loadingStatus.loaded} 个`);
        console.log(`  失败: ${this.loadingStatus.failed} 个`);
        console.log(`  模式: ${this.loadingStatus.mode}`);
        
        Object.keys(this.databases).forEach(category => {
            const count = Object.keys(this.databases[category]).length;
            console.log(`  ${category}: ${count} 个`);
        });
    }

    isDataSourceAvailable(category, key) {
        return this.databases[category] && 
               this.databases[category][key] && 
               this.databases[category][key].loaded;
    }

    getAvailableBibles() {
        return Object.keys(this.databases.bibles).filter(key => 
            this.databases.bibles[key].loaded
        );
    }

    getAvailableCommentaries() {
        return Object.keys(this.databases.commentaries).filter(key => 
            this.databases.commentaries[key].loaded
        );
    }
}

// 创建全局实例
window.universalDataLoader = new UniversalDataLoader();

// 导出主要函数
window.initUniversalDataLoader = async function() {
    return await window.universalDataLoader.initialize();
};

window.queryBible = async function(version, book, chapter, verse = null) {
    return await window.universalDataLoader.queryBible(version, book, chapter, verse);
};

window.queryCommentary = async function(type, book, chapter) {
    return await window.universalDataLoader.queryCommentary(type, book, chapter);
};

console.log('✅ 通用数据载入器模块已载入');
