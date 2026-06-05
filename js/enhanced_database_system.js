/**
 * Bible100 增强数据库系统
 * 
 * 特点：
 * 1. 分层架构：静态数据(JSON) + 动态数据(IndexedDB)
 * 2. 智能缓存：自动压缩和索引
 * 3. 零依赖：纯JavaScript，无需外部库
 * 4. 高性能：预索引 + 懒加载
 * 
 * 版本：2.0
 * 日期：2025-01-16
 */

class EnhancedDatabaseSystem {
    constructor() {
        this.cache = new Map();
        this.indexes = new Map();
        this.db = null;
        this.config = {
            cacheSize: 50, // 缓存条目数
            compressionEnabled: true,
            autoIndex: true
        };
    }

    /**
     * 初始化数据库系统
     */
    async initialize() {
        try {
            // 初始化IndexedDB
            await this.initIndexedDB();
            
            // 预加载常用索引
            await this.preloadIndexes();
            
            console.log('✅ 增强数据库系统初始化完成');
            return true;
        } catch (error) {
            console.error('❌ 数据库系统初始化失败:', error);
            return false;
        }
    }

    /**
     * 初始化IndexedDB
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('Bible100DB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建对象存储
                if (!db.objectStoreNames.contains('bible_data')) {
                    const bibleStore = db.createObjectStore('bible_data', { keyPath: 'id' });
                    bibleStore.createIndex('book_chapter', ['book', 'chapter']);
                    bibleStore.createIndex('content', 'content', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('commentary_data')) {
                    const commentaryStore = db.createObjectStore('commentary_data', { keyPath: 'id' });
                    commentaryStore.createIndex('reference', 'reference');
                    commentaryStore.createIndex('content', 'content');
                }
                
                if (!db.objectStoreNames.contains('user_data')) {
                    const userStore = db.createObjectStore('user_data', { keyPath: 'id' });
                    userStore.createIndex('module', 'module');
                    userStore.createIndex('type', 'type');
                }
            };
        });
    }

    /**
     * 智能数据加载
     * 优先从缓存 -> IndexedDB -> JSON文件
     */
    async loadData(source, options = {}) {
        const cacheKey = `${source}_${JSON.stringify(options)}`;
        
        // 1. 检查内存缓存
        if (this.cache.has(cacheKey)) {
            console.log(`📦 从缓存加载: ${source}`);
            return this.cache.get(cacheKey);
        }
        
        // 2. 检查IndexedDB
        if (this.db) {
            const indexedData = await this.loadFromIndexedDB(source, options);
            if (indexedData) {
                this.cache.set(cacheKey, indexedData);
                return indexedData;
            }
        }
        
        // 3. 从JSON文件加载
        const jsonData = await this.loadFromJSON(source, options);
        if (jsonData) {
            // 存储到IndexedDB和缓存
            await this.saveToIndexedDB(source, jsonData);
            this.cache.set(cacheKey, jsonData);
        }
        
        return jsonData;
    }

    /**
     * 从IndexedDB加载数据
     */
    async loadFromIndexedDB(source, options) {
        if (!this.db) return null;
        
        try {
            const transaction = this.db.transaction([this.getStoreName(source)], 'readonly');
            const store = transaction.objectStore(this.getStoreName(source));
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.warn('IndexedDB加载失败:', error);
            return null;
        }
    }

    /**
     * 从JSON文件加载数据
     */
    async loadFromJSON(source, options) {
        try {
            const response = await fetch(`data/${source}.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            // 如果启用压缩，解压数据
            if (options.compressed && this.config.compressionEnabled) {
                return this.decompressData(data);
            }
            
            return data;
        } catch (error) {
            console.error(`JSON加载失败: ${source}`, error);
            return null;
        }
    }

    /**
     * 保存数据到IndexedDB
     */
    async saveToIndexedDB(source, data) {
        if (!this.db) return false;
        
        try {
            const transaction = this.db.transaction([this.getStoreName(source)], 'readwrite');
            const store = transaction.objectStore(this.getStoreName(source));
            
            // 清空现有数据
            await store.clear();
            
            // 添加新数据
            if (Array.isArray(data)) {
                for (const item of data) {
                    await store.add(item);
                }
            } else {
                await store.add(data);
            }
            
            return true;
        } catch (error) {
            console.error('IndexedDB保存失败:', error);
            return false;
        }
    }

    /**
     * 智能查询
     */
    async query(source, criteria, options = {}) {
        const data = await this.loadData(source, options);
        if (!data) return [];
        
        // 如果有索引，使用索引查询
        if (this.indexes.has(source)) {
            return this.queryWithIndex(source, criteria);
        }
        
        // 否则使用过滤查询
        return this.filterData(data, criteria);
    }

    /**
     * 使用索引查询
     */
    queryWithIndex(source, criteria) {
        const index = this.indexes.get(source);
        const results = [];
        
        // 实现索引查询逻辑
        for (const [key, value] of index.entries()) {
            if (this.matchesCriteria(key, criteria)) {
                results.push(value);
            }
        }
        
        return results;
    }

    /**
     * 过滤数据
     */
    filterData(data, criteria) {
        if (!Array.isArray(data)) return [];
        
        return data.filter(item => {
            return Object.keys(criteria).every(key => {
                const itemValue = item[key];
                const criteriaValue = criteria[key];
                
                if (typeof criteriaValue === 'string') {
                    return itemValue && itemValue.includes(criteriaValue);
                } else if (typeof criteriaValue === 'object') {
                    if (criteriaValue.$in) {
                        return criteriaValue.$in.includes(itemValue);
                    }
                    if (criteriaValue.$gte) {
                        return itemValue >= criteriaValue.$gte;
                    }
                    if (criteriaValue.$lte) {
                        return itemValue <= criteriaValue.$lte;
                    }
                }
                
                return itemValue === criteriaValue;
            });
        });
    }

    /**
     * 预加载索引
     */
    async preloadIndexes() {
        const commonSources = [
            'bibles/和合本',
            'commentaries/综合解读',
            'crossrefs/和合本串珠'
        ];
        
        for (const source of commonSources) {
            await this.buildIndex(source);
        }
    }

    /**
     * 构建索引
     */
    async buildIndex(source) {
        const data = await this.loadData(source);
        if (!data) return;
        
        const index = new Map();
        
        if (Array.isArray(data)) {
            data.forEach((item, idx) => {
                // 为常用查询字段建立索引
                if (item.book) {
                    const key = `book_${item.book}`;
                    if (!index.has(key)) index.set(key, []);
                    index.get(key).push(item);
                }
                
                if (item.chapter) {
                    const key = `book_${item.book}_chapter_${item.chapter}`;
                    if (!index.has(key)) index.set(key, []);
                    index.get(key).push(item);
                }
            });
        }
        
        this.indexes.set(source, index);
        console.log(`📊 索引构建完成: ${source}`);
    }

    /**
     * 获取存储名称
     */
    getStoreName(source) {
        if (source.includes('bible')) return 'bible_data';
        if (source.includes('commentary')) return 'commentary_data';
        return 'user_data';
    }

    /**
     * 数据压缩
     */
    compressData(data) {
        // 简单的数据压缩实现
        const compressed = {
            version: '1.0',
            compressed: true,
            data: JSON.stringify(data)
        };
        return compressed;
    }

    /**
     * 数据解压
     */
    decompressData(compressedData) {
        if (!compressedData.compressed) return compressedData;
        return JSON.parse(compressedData.data);
    }

    /**
     * 检查匹配条件
     */
    matchesCriteria(key, criteria) {
        return Object.keys(criteria).every(criteriaKey => {
            return key.includes(criteriaKey);
        });
    }

    /**
     * 清理缓存
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 缓存已清理');
    }

    /**
     * 获取系统状态
     */
    getStatus() {
        return {
            cacheSize: this.cache.size,
            indexesCount: this.indexes.size,
            indexedDBAvailable: !!this.db,
            config: this.config
        };
    }
}

// 创建全局实例
window.enhancedDB = new EnhancedDatabaseSystem();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedDB.initialize();
});



















