/**
 * Hymn 智能目錄生成與搜索系統
 * 自動掃描現有文件，生成智能索引
 */

class HymnIntelligenceSystem {
    constructor() {
        this.dataIndex = {};
        this.searchIndex = {};
        this.metadataCache = {};
        this.initializeSystem();
    }

    /**
     * 初始化系統 - 掃描所有文件
     */
    async initializeSystem() {
        console.log('🔍 開始掃描聖詩文件...');
        
        // 掃描各個目錄
        const hymnData = {
            chinese: await this.scanDirectory('hymn_chi/'),
            authors: await this.scanDirectory('hymn_author/'),
            hymnology: await this.scanDirectory('Hymnology/'),
            images: await this.scanDirectory('images/'),
            other: await this.scanOtherFiles()
        };

        // 生成智能索引
        this.generateSmartIndex(hymnData);
        
        // 建立搜索索引
        this.buildSearchIndex();
        
        // 生成分類目錄
        this.generateCategoryIndex();
        
        console.log('✅ 智能目錄生成完成！');
    }

    /**
     * 掃描目錄文件
     */
    async scanDirectory(dirPath) {
        const files = [];
        
        // 模擬文件掃描（實際實現需要文件系統API）
        const mockFiles = this.getMockFiles(dirPath);
        
        for (const file of mockFiles) {
            const metadata = await this.extractFileMetadata(file);
            files.push({
                path: file.path,
                name: file.name,
                metadata: metadata,
                content: await this.extractFileContent(file.path)
            });
        }
        
        return files;
    }

    /**
     * 提取文件元數據
     */
    async extractFileMetadata(file) {
        const metadata = {
            title: '',
            author: '',
            language: '',
            theme: [],
            hymnNumber: '',
            tune: '',
            meter: '',
            year: '',
            category: '',
            tags: []
        };

        // 從文件名提取信息
        const fileName = file.name;
        
        // 提取聖詩編號（如：0920, 0952, 1261等）
        const hymnNumberMatch = fileName.match(/^(\d{4})/);
        if (hymnNumberMatch) {
            metadata.hymnNumber = hymnNumberMatch[1];
        }

        // 提取語言標記
        if (fileName.includes('[華]')) {
            metadata.language = 'chinese';
        } else if (fileName.includes('[英]')) {
            metadata.language = 'english';
        } else if (fileName.includes('[台]')) {
            metadata.language = 'taiwanese';
        }

        // 提取作者信息
        const authorMatch = fileName.match(/\((.*?)\)/);
        if (authorMatch) {
            metadata.author = authorMatch[1];
        }

        // 提取主題標籤
        metadata.theme = this.extractThemeTags(fileName);
        
        return metadata;
    }

    /**
     * 提取主題標籤
     */
    extractThemeTags(fileName) {
        const themes = [];
        
        // 常見聖詩主題關鍵詞
        const themeKeywords = {
            '讚美': ['讚美', '讚頌', '榮耀', '哈利路亞'],
            '敬拜': ['敬拜', '崇拜', '禮拜', '獻上'],
            '救恩': ['救恩', '拯救', '贖罪', '十字架'],
            '愛': ['愛', '慈愛', '恩典', '憐憫'],
            '希望': ['希望', '盼望', '安慰', '平安'],
            '聖誕': ['聖誕', '耶穌降生', '馬槽', '東方博士'],
            '復活': ['復活', '復活節', '主復活', '得勝'],
            '聖靈': ['聖靈', '聖神', '靈火', '復興'],
            '宣教': ['宣教', '傳道', '福音', '差傳'],
            '家庭': ['家庭', '婚姻', '親子', '孝順']
        };

        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            for (const keyword of keywords) {
                if (fileName.includes(keyword)) {
                    themes.push(theme);
                    break;
                }
            }
        }

        return [...new Set(themes)]; // 去重
    }

    /**
     * 生成智能索引
     */
    generateSmartIndex(hymnData) {
        this.dataIndex = {
            byNumber: {},      // 按聖詩編號
            byAuthor: {},      // 按作者
            byTheme: {},       // 按主題
            byLanguage: {},    // 按語言
            byTune: {},        // 按調名
            byMeter: {},       // 按格律
            byYear: {},        // 按年份
            byCategory: {}     // 按分類
        };

        // 處理中文聖詩
        for (const hymn of hymnData.chinese) {
            this.indexHymn(hymn);
        }

        // 處理作者信息
        for (const author of hymnData.authors) {
            this.indexAuthor(author);
        }
    }

    /**
     * 索引單首聖詩
     */
    indexHymn(hymn) {
        const meta = hymn.metadata;
        
        // 按編號索引
        if (meta.hymnNumber) {
            this.dataIndex.byNumber[meta.hymnNumber] = hymn;
        }

        // 按作者索引
        if (meta.author) {
            if (!this.dataIndex.byAuthor[meta.author]) {
                this.dataIndex.byAuthor[meta.author] = [];
            }
            this.dataIndex.byAuthor[meta.author].push(hymn);
        }

        // 按主題索引
        for (const theme of meta.theme) {
            if (!this.dataIndex.byTheme[theme]) {
                this.dataIndex.byTheme[theme] = [];
            }
            this.dataIndex.byTheme[theme].push(hymn);
        }

        // 按語言索引
        if (meta.language) {
            if (!this.dataIndex.byLanguage[meta.language]) {
                this.dataIndex.byLanguage[meta.language] = [];
            }
            this.dataIndex.byLanguage[meta.language].push(hymn);
        }
    }

    /**
     * 建立搜索索引
     */
    buildSearchIndex() {
        this.searchIndex = {
            title: {},         // 標題搜索
            content: {},       // 內容搜索
            author: {},        // 作者搜索
            tune: {},          // 調名搜索
            tags: {}           // 標籤搜索
        };

        // 遍歷所有聖詩建立搜索索引
        for (const hymn of Object.values(this.dataIndex.byNumber)) {
            this.buildSearchIndexForHymn(hymn);
        }
    }

    /**
     * 為單首聖詩建立搜索索引
     */
    buildSearchIndexForHymn(hymn) {
        const meta = hymn.metadata;
        const content = hymn.content;

        // 標題索引
        if (meta.title) {
            const titleWords = this.tokenize(meta.title);
            for (const word of titleWords) {
                if (!this.searchIndex.title[word]) {
                    this.searchIndex.title[word] = [];
                }
                this.searchIndex.title[word].push(hymn);
            }
        }

        // 作者索引
        if (meta.author) {
            const authorWords = this.tokenize(meta.author);
            for (const word of authorWords) {
                if (!this.searchIndex.author[word]) {
                    this.searchIndex.author[word] = [];
                }
                this.searchIndex.author[word].push(hymn);
            }
        }

        // 內容索引
        if (content) {
            const contentWords = this.tokenize(content);
            for (const word of contentWords) {
                if (!this.searchIndex.content[word]) {
                    this.searchIndex.content[word] = [];
                }
                this.searchIndex.content[word].push(hymn);
            }
        }
    }

    /**
     * 文本分詞處理
     */
    tokenize(text) {
        // 移除標點符號，轉小寫
        const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').toLowerCase();
        
        // 中英文分詞
        const tokens = [];
        
        // 中文：按字符分割（可以改進為更智能的分詞）
        const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || [];
        tokens.push(...chineseChars);
        
        // 英文：按單詞分割
        const englishWords = cleanText.match(/[a-zA-Z]+/g) || [];
        tokens.push(...englishWords);
        
        // 數字
        const numbers = cleanText.match(/\d+/g) || [];
        tokens.push(...numbers);
        
        return [...new Set(tokens)]; // 去重
    }

    /**
     * 智能搜索功能
     */
    search(query, options = {}) {
        const {
            type = 'all',        // 搜索類型：all, title, author, content, theme
            language = 'all',    // 語言過濾
            limit = 50           // 結果限制
        } = options;

        const queryTokens = this.tokenize(query);
        const results = new Map(); // 使用Map避免重複結果

        // 根據搜索類型執行搜索
        if (type === 'all' || type === 'title') {
            this.searchInIndex(this.searchIndex.title, queryTokens, results);
        }
        
        if (type === 'all' || type === 'author') {
            this.searchInIndex(this.searchIndex.author, queryTokens, results);
        }
        
        if (type === 'all' || type === 'content') {
            this.searchInIndex(this.searchIndex.content, queryTokens, results);
        }

        // 主題搜索
        if (type === 'theme') {
            this.searchByTheme(query, results);
        }

        // 轉換為數組並排序
        let searchResults = Array.from(results.values());
        
        // 語言過濾
        if (language !== 'all') {
            searchResults = searchResults.filter(hymn => 
                hymn.metadata.language === language
            );
        }

        // 按相關性排序
        searchResults = this.rankResults(searchResults, queryTokens);
        
        return searchResults.slice(0, limit);
    }

    /**
     * 在指定索引中搜索
     */
    searchInIndex(index, queryTokens, results) {
        for (const token of queryTokens) {
            if (index[token]) {
                for (const hymn of index[token]) {
                    if (!results.has(hymn.path)) {
                        results.set(hymn.path, hymn);
                    }
                }
            }
        }
    }

    /**
     * 按主題搜索
     */
    searchByTheme(query, results) {
        for (const [theme, hymns] of Object.entries(this.dataIndex.byTheme)) {
            if (theme.includes(query) || query.includes(theme)) {
                for (const hymn of hymns) {
                    if (!results.has(hymn.path)) {
                        results.set(hymn.path, hymn);
                    }
                }
            }
        }
    }

    /**
     * 結果排序（按相關性）
     */
    rankResults(results, queryTokens) {
        return results.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, queryTokens);
            const scoreB = this.calculateRelevanceScore(b, queryTokens);
            return scoreB - scoreA;
        });
    }

    /**
     * 計算相關性分數
     */
    calculateRelevanceScore(hymn, queryTokens) {
        let score = 0;
        const meta = hymn.metadata;
        const content = hymn.content;

        // 標題匹配權重最高
        if (meta.title) {
            const titleTokens = this.tokenize(meta.title);
            score += this.getMatchScore(titleTokens, queryTokens) * 3;
        }

        // 作者匹配
        if (meta.author) {
            const authorTokens = this.tokenize(meta.author);
            score += this.getMatchScore(authorTokens, queryTokens) * 2;
        }

        // 內容匹配
        if (content) {
            const contentTokens = this.tokenize(content);
            score += this.getMatchScore(contentTokens, queryTokens);
        }

        // 主題匹配
        for (const theme of meta.theme) {
            if (queryTokens.some(token => theme.includes(token))) {
                score += 2;
            }
        }

        return score;
    }

    /**
     * 計算匹配分數
     */
    getMatchScore(tokens, queryTokens) {
        let matches = 0;
        for (const queryToken of queryTokens) {
            if (tokens.includes(queryToken)) {
                matches++;
            }
        }
        return matches / queryTokens.length;
    }

    /**
     * 生成分類目錄
     */
    generateCategoryIndex() {
        this.categoryIndex = {
            // 按主題分類
            themes: this.dataIndex.byTheme,
            
            // 按作者分類
            authors: this.dataIndex.byAuthor,
            
            // 按語言分類
            languages: this.dataIndex.byLanguage,
            
            // 按年份分類
            years: this.dataIndex.byYear,
            
            // 熱門聖詩（基於訪問量）
            popular: this.getPopularHymns(),
            
            // 最新添加
            recent: this.getRecentHymns()
        };
    }

    /**
     * 獲取熱門聖詩
     */
    getPopularHymns() {
        // 這裡可以基於訪問統計或人工標記
        // 暫時返回一些經典聖詩
        return [
            '0920', '0952', '1261', '1387', '1392', 
            '1396', '1397', '1398', '1404', '1412'
        ].map(num => this.dataIndex.byNumber[num]).filter(Boolean);
    }

    /**
     * 獲取最新聖詩
     */
    getRecentHymns() {
        // 基於文件修改時間或添加時間
        return Object.values(this.dataIndex.byNumber)
            .sort((a, b) => new Date(b.metadata.modified) - new Date(a.metadata.modified))
            .slice(0, 20);
    }

    /**
     * 獲取模擬文件數據（實際實現需要文件系統API）
     */
    getMockFiles(dirPath) {
        // 基於實際觀察到的文件結構
        const mockFiles = [
            {
                path: 'hymn_chi/0920 大秦景教三威蒙度讚 [華].htm',
                name: '0920 大秦景教三威蒙度讚 [華].htm'
            },
            {
                path: 'hymn_chi/0952 Lamb of God 神的羔羊 _Twila Paris (4) ● .htm',
                name: '0952 Lamb of God 神的羔羊 _Twila Paris (4) ● .htm'
            },
            {
                path: 'hymn_chi/1261 The Mountain Shall Depart _蘇佐揚 大山可以挪开 [華].htm',
                name: '1261 The Mountain Shall Depart _蘇佐揚 大山可以挪开 [華].htm'
            }
            // ... 更多文件
        ];
        
        return mockFiles.filter(file => file.path.startsWith(dirPath));
    }

    /**
     * 提取文件內容（模擬）
     */
    async extractFileContent(filePath) {
        // 實際實現需要讀取HTML文件內容
        // 這裡返回模擬內容
        return `這是聖詩文件 ${filePath} 的內容...`;
    }

    /**
     * 掃描其他文件
     */
    async scanOtherFiles() {
        // 掃描其他類型的文件
        return [];
    }
}

// 使用示例
const hymnSystem = new HymnIntelligenceSystem();

// 搜索示例
const searchResults = hymnSystem.search('讚美', {
    type: 'all',
    language: 'chinese',
    limit: 10
});

console.log('搜索結果:', searchResults);










