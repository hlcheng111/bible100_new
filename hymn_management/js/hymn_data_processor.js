/**
 * 聖詩數據處理腳本
 * 自動掃描文件、提取元數據、生成索引
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // 需要安裝: npm install cheerio

class HymnDataProcessor {
    constructor(basePath = 'C:/hymn') {
        this.basePath = basePath;
        this.dataIndex = {};
        this.fileIndex = {};
        this.metadataCache = {};
        this.processedFiles = 0;
        this.errors = [];
    }

    /**
     * 主要處理流程
     */
    async processAll() {
        console.log('🚀 開始處理聖詩數據...');
        
        try {
            // 1. 掃描所有文件
            await this.scanAllFiles();
            
            // 2. 提取元數據
            await this.extractMetadata();
            
            // 3. 生成智能索引
            this.generateSmartIndex();
            
            // 4. 建立搜索索引
            this.buildSearchIndex();
            
            // 5. 生成分類目錄
            this.generateCategoryIndex();
            
            // 6. 導出處理結果
            await this.exportResults();
            
            console.log('✅ 數據處理完成！');
            this.printSummary();
            
        } catch (error) {
            console.error('❌ 處理過程中發生錯誤:', error);
            this.printErrors();
        }
    }

    /**
     * 掃描所有文件
     */
    async scanAllFiles() {
        console.log('📁 掃描文件結構...');
        
        const directories = [
            'hymn_chi',
            'hymn_author', 
            'Hymnology',
            'images',
            'hymn_hymnal_index',
            '00webpage_temp'
        ];

        for (const dir of directories) {
            const dirPath = path.join(this.basePath, dir);
            if (fs.existsSync(dirPath)) {
                console.log(`  掃描目錄: ${dir}`);
                await this.scanDirectory(dirPath, dir);
            }
        }

        // 掃描根目錄文件
        await this.scanDirectory(this.basePath, 'root');
        
        console.log(`📊 總共掃描了 ${this.processedFiles} 個文件`);
    }

    /**
     * 掃描單個目錄
     */
    async scanDirectory(dirPath, category) {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                // 跳過FrontPage元數據目錄
                if (file.startsWith('_vti_') || file.startsWith('.')) {
                    continue;
                }
                await this.scanDirectory(filePath, category);
            } else {
                // 處理文件
                this.processFile(filePath, category, file);
            }
        }
    }

    /**
     * 處理單個文件
     */
    processFile(filePath, category, fileName) {
        const relativePath = path.relative(this.basePath, filePath);
        const ext = path.extname(fileName).toLowerCase();
        
        const fileInfo = {
            path: relativePath,
            fullPath: filePath,
            name: fileName,
            category: category,
            extension: ext,
            size: fs.statSync(filePath).size,
            modified: fs.statSync(filePath).mtime,
            type: this.getFileType(ext),
            metadata: {}
        };

        // 根據文件類型分類
        if (!this.fileIndex[fileInfo.type]) {
            this.fileIndex[fileInfo.type] = [];
        }
        this.fileIndex[fileInfo.type].push(fileInfo);

        // 特殊處理HTML文件
        if (ext === '.htm' || ext === '.html') {
            this.processHtmlFile(fileInfo);
        }

        this.processedFiles++;
    }

    /**
     * 獲取文件類型
     */
    getFileType(extension) {
        const typeMap = {
            '.htm': 'html',
            '.html': 'html',
            '.doc': 'document',
            '.docx': 'document',
            '.pdf': 'pdf',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.png': 'image',
            '.gif': 'image',
            '.mp3': 'audio',
            '.wav': 'audio',
            '.mid': 'midi',
            '.midi': 'midi',
            '.txt': 'text',
            '.json': 'json'
        };
        return typeMap[extension] || 'other';
    }

    /**
     * 處理HTML文件
     */
    processHtmlFile(fileInfo) {
        try {
            const content = fs.readFileSync(fileInfo.fullPath, 'utf8');
            const $ = cheerio.load(content);
            
            // 提取標題
            const title = $('title').text() || 
                         $('h1').first().text() || 
                         fileInfo.name.replace(/\.(htm|html)$/i, '');
            
            // 提取聖詩編號
            const hymnNumber = this.extractHymnNumber(fileInfo.name, title);
            
            // 提取作者信息
            const author = this.extractAuthor(fileInfo.name, title, content);
            
            // 提取語言信息
            const language = this.extractLanguage(fileInfo.name, content);
            
            // 提取主題標籤
            const themes = this.extractThemes(fileInfo.name, title, content);
            
            // 提取內容摘要
            const summary = this.extractSummary(content);
            
            fileInfo.metadata = {
                title: title.trim(),
                hymnNumber: hymnNumber,
                author: author,
                language: language,
                themes: themes,
                summary: summary,
                wordCount: content.length,
                hasAudio: this.checkForAudio(fileInfo.path),
                hasImages: $('img').length > 0
            };

        } catch (error) {
            this.errors.push({
                file: fileInfo.path,
                error: error.message,
                type: 'html_processing'
            });
        }
    }

    /**
     * 提取聖詩編號
     */
    extractHymnNumber(fileName, title) {
        // 從文件名提取（如：0920, 0952等）
        const fileNumberMatch = fileName.match(/^(\d{4})/);
        if (fileNumberMatch) {
            return fileNumberMatch[1];
        }
        
        // 從標題提取
        const titleNumberMatch = title.match(/(\d{4})/);
        if (titleNumberMatch) {
            return titleNumberMatch[1];
        }
        
        return null;
    }

    /**
     * 提取作者信息
     */
    extractAuthor(fileName, title, content) {
        // 從文件名提取作者（括號內）
        const fileAuthorMatch = fileName.match(/\((.*?)\)/);
        if (fileAuthorMatch) {
            return fileAuthorMatch[1].trim();
        }
        
        // 從標題提取
        const titleAuthorMatch = title.match(/\((.*?)\)/);
        if (titleAuthorMatch) {
            return titleAuthorMatch[1].trim();
        }
        
        // 從內容中查找作者信息
        const contentAuthorMatch = content.match(/作者[：:]\s*(.*?)[\s\n]/);
        if (contentAuthorMatch) {
            return contentAuthorMatch[1].trim();
        }
        
        return null;
    }

    /**
     * 提取語言信息
     */
    extractLanguage(fileName, content) {
        if (fileName.includes('[華]') || content.includes('華語')) {
            return 'chinese';
        } else if (fileName.includes('[英]') || content.includes('English')) {
            return 'english';
        } else if (fileName.includes('[台]') || content.includes('台語')) {
            return 'taiwanese';
        } else if (content.match(/[\u4e00-\u9fa5]/)) {
            return 'chinese'; // 默認中文
        }
        return 'unknown';
    }

    /**
     * 提取主題標籤
     */
    extractThemes(fileName, title, content) {
        const themes = [];
        
        const themeKeywords = {
            '讚美': ['讚美', '讚頌', '榮耀', '哈利路亞', 'praise', 'glory'],
            '敬拜': ['敬拜', '崇拜', '禮拜', '獻上', 'worship', 'adore'],
            '救恩': ['救恩', '拯救', '贖罪', '十字架', 'salvation', 'cross'],
            '愛': ['愛', '慈愛', '恩典', '憐憫', 'love', 'grace'],
            '希望': ['希望', '盼望', '安慰', '平安', 'hope', 'peace'],
            '聖誕': ['聖誕', '耶穌降生', '馬槽', '東方博士', 'christmas', 'nativity'],
            '復活': ['復活', '復活節', '主復活', '得勝', 'resurrection', 'easter'],
            '聖靈': ['聖靈', '聖神', '靈火', '復興', 'spirit', 'revival'],
            '宣教': ['宣教', '傳道', '福音', '差傳', 'mission', 'evangelism'],
            '家庭': ['家庭', '婚姻', '親子', '孝順', 'family', 'marriage']
        };

        const searchText = `${fileName} ${title} ${content}`.toLowerCase();
        
        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            for (const keyword of keywords) {
                if (searchText.includes(keyword.toLowerCase())) {
                    themes.push(theme);
                    break;
                }
            }
        }

        return [...new Set(themes)]; // 去重
    }

    /**
     * 提取內容摘要
     */
    extractSummary(content) {
        // 移除HTML標籤
        const textContent = content.replace(/<[^>]*>/g, '');
        
        // 提取前200個字符作為摘要
        return textContent.substring(0, 200).trim() + '...';
    }

    /**
     * 檢查是否有音頻文件
     */
    checkForAudio(hymnPath) {
        const hymnNumber = this.extractHymnNumber(path.basename(hymnPath), '');
        if (!hymnNumber) return false;
        
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.mid'];
        const audioDir = path.join(this.basePath, 'hymns', 'audio');
        
        for (const ext of audioExtensions) {
            const audioPath = path.join(audioDir, `${hymnNumber}${ext}`);
            if (fs.existsSync(audioPath)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * 提取元數據
     */
    async extractMetadata() {
        console.log('📋 提取文件元數據...');
        
        const htmlFiles = this.fileIndex.html || [];
        
        for (const file of htmlFiles) {
            if (file.metadata.title) {
                // 元數據已在前面的處理中提取
                continue;
            }
            
            // 對其他文件類型提取基本信息
            this.extractBasicMetadata(file);
        }
    }

    /**
     * 提取基本元數據
     */
    extractBasicMetadata(fileInfo) {
        fileInfo.metadata = {
            title: fileInfo.name,
            summary: `文件類型: ${fileInfo.type}, 大小: ${this.formatFileSize(fileInfo.size)}`,
            modified: fileInfo.modified.toISOString()
        };
    }

    /**
     * 生成智能索引
     */
    generateSmartIndex() {
        console.log('🔍 生成智能索引...');
        
        this.dataIndex = {
            byNumber: {},      // 按聖詩編號
            byAuthor: {},      // 按作者
            byTheme: {},       // 按主題
            byLanguage: {},    // 按語言
            byCategory: {},    // 按分類
            byFileType: {},    // 按文件類型
            byDate: {}         // 按日期
        };

        // 處理HTML文件
        const htmlFiles = this.fileIndex.html || [];
        for (const file of htmlFiles) {
            this.indexFile(file);
        }
    }

    /**
     * 索引單個文件
     */
    indexFile(file) {
        const meta = file.metadata;
        
        // 按編號索引
        if (meta.hymnNumber) {
            this.dataIndex.byNumber[meta.hymnNumber] = file;
        }

        // 按作者索引
        if (meta.author) {
            if (!this.dataIndex.byAuthor[meta.author]) {
                this.dataIndex.byAuthor[meta.author] = [];
            }
            this.dataIndex.byAuthor[meta.author].push(file);
        }

        // 按主題索引
        if (meta.themes) {
            for (const theme of meta.themes) {
                if (!this.dataIndex.byTheme[theme]) {
                    this.dataIndex.byTheme[theme] = [];
                }
                this.dataIndex.byTheme[theme].push(file);
            }
        }

        // 按語言索引
        if (meta.language) {
            if (!this.dataIndex.byLanguage[meta.language]) {
                this.dataIndex.byLanguage[meta.language] = [];
            }
            this.dataIndex.byLanguage[meta.language].push(file);
        }

        // 按分類索引
        if (!this.dataIndex.byCategory[file.category]) {
            this.dataIndex.byCategory[file.category] = [];
        }
        this.dataIndex.byCategory[file.category].push(file);

        // 按文件類型索引
        if (!this.dataIndex.byFileType[file.type]) {
            this.dataIndex.byFileType[file.type] = [];
        }
        this.dataIndex.byFileType[file.type].push(file);
    }

    /**
     * 建立搜索索引
     */
    buildSearchIndex() {
        console.log('🔎 建立搜索索引...');
        
        this.searchIndex = {
            title: {},
            content: {},
            author: {},
            theme: {}
        };

        const htmlFiles = this.fileIndex.html || [];
        for (const file of htmlFiles) {
            this.buildSearchIndexForFile(file);
        }
    }

    /**
     * 為單個文件建立搜索索引
     */
    buildSearchIndexForFile(file) {
        const meta = file.metadata;
        
        // 標題索引
        if (meta.title) {
            const titleWords = this.tokenize(meta.title);
            for (const word of titleWords) {
                if (!this.searchIndex.title[word]) {
                    this.searchIndex.title[word] = [];
                }
                this.searchIndex.title[word].push(file);
            }
        }

        // 作者索引
        if (meta.author) {
            const authorWords = this.tokenize(meta.author);
            for (const word of authorWords) {
                if (!this.searchIndex.author[word]) {
                    this.searchIndex.author[word] = [];
                }
                this.searchIndex.author[word].push(file);
            }
        }

        // 主題索引
        if (meta.themes) {
            for (const theme of meta.themes) {
                if (!this.searchIndex.theme[theme]) {
                    this.searchIndex.theme[theme] = [];
                }
                this.searchIndex.theme[theme].push(file);
            }
        }
    }

    /**
     * 文本分詞處理
     */
    tokenize(text) {
        const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').toLowerCase();
        const tokens = [];
        
        // 中文字符
        const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || [];
        tokens.push(...chineseChars);
        
        // 英文單詞
        const englishWords = cleanText.match(/[a-zA-Z]+/g) || [];
        tokens.push(...englishWords);
        
        // 數字
        const numbers = cleanText.match(/\d+/g) || [];
        tokens.push(...numbers);
        
        return [...new Set(tokens)];
    }

    /**
     * 生成分類目錄
     */
    generateCategoryIndex() {
        console.log('📚 生成分類目錄...');
        
        this.categoryIndex = {
            themes: this.dataIndex.byTheme,
            authors: this.dataIndex.byAuthor,
            languages: this.dataIndex.byLanguage,
            categories: this.dataIndex.byCategory,
            fileTypes: this.dataIndex.byFileType,
            statistics: this.generateStatistics()
        };
    }

    /**
     * 生成統計信息
     */
    generateStatistics() {
        const stats = {
            totalFiles: this.processedFiles,
            htmlFiles: (this.fileIndex.html || []).length,
            imageFiles: (this.fileIndex.image || []).length,
            audioFiles: (this.fileIndex.audio || []).length,
            documentFiles: (this.fileIndex.document || []).length,
            totalSize: this.calculateTotalSize(),
            languages: Object.keys(this.dataIndex.byLanguage),
            themes: Object.keys(this.dataIndex.byTheme),
            authors: Object.keys(this.dataIndex.byAuthor).length,
            hymns: Object.keys(this.dataIndex.byNumber).length
        };

        return stats;
    }

    /**
     * 計算總文件大小
     */
    calculateTotalSize() {
        let totalSize = 0;
        for (const fileType in this.fileIndex) {
            for (const file of this.fileIndex[fileType]) {
                totalSize += file.size;
            }
        }
        return totalSize;
    }

    /**
     * 導出處理結果
     */
    async exportResults() {
        console.log('💾 導出處理結果...');
        
        const outputDir = path.join(this.basePath, 'processed_data');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 導出各種索引
        const exports = {
            'data_index.json': this.dataIndex,
            'search_index.json': this.searchIndex,
            'category_index.json': this.categoryIndex,
            'file_index.json': this.fileIndex,
            'statistics.json': this.categoryIndex.statistics,
            'errors.json': this.errors
        };

        for (const [filename, data] of Object.entries(exports)) {
            const filePath = path.join(outputDir, filename);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`  ✅ 導出: ${filename}`);
        }

        // 生成HTML報告
        await this.generateHtmlReport(outputDir);
    }

    /**
     * 生成HTML報告
     */
    async generateHtmlReport(outputDir) {
        const reportHtml = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>聖詩數據處理報告</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        h1 { color: #2aa5ff; text-align: center; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #2aa5ff; }
        .stat-label { color: #666; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #2aa5ff; padding-bottom: 10px; }
        .error-item { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 5px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 聖詩數據處理報告</h1>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${this.processedFiles}</div>
                <div class="stat-label">總文件數</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.categoryIndex.statistics.hymns}</div>
                <div class="stat-label">聖詩數量</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.categoryIndex.statistics.authors}</div>
                <div class="stat-label">作者數量</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.categoryIndex.statistics.themes.length}</div>
                <div class="stat-label">主題數量</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 處理統計</h2>
            <p><strong>處理時間:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>總文件大小:</strong> ${this.formatFileSize(this.categoryIndex.statistics.totalSize)}</p>
            <p><strong>錯誤數量:</strong> ${this.errors.length}</p>
        </div>

        <div class="section">
            <h2>🏷️ 主題分布</h2>
            <ul>
                ${this.categoryIndex.statistics.themes.map(theme => 
                    `<li>${theme}: ${this.dataIndex.byTheme[theme].length} 首聖詩</li>`
                ).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>🌍 語言分布</h2>
            <ul>
                ${this.categoryIndex.statistics.languages.map(lang => 
                    `<li>${lang}: ${this.dataIndex.byLanguage[lang].length} 首聖詩</li>`
                ).join('')}
            </ul>
        </div>

        ${this.errors.length > 0 ? `
        <div class="section">
            <h2>⚠️ 處理錯誤</h2>
            ${this.errors.map(error => 
                `<div class="error-item">
                    <strong>文件:</strong> ${error.file}<br>
                    <strong>錯誤:</strong> ${error.error}
                </div>`
            ).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;

        const reportPath = path.join(outputDir, 'processing_report.html');
        fs.writeFileSync(reportPath, reportHtml, 'utf8');
        console.log('  ✅ 生成HTML報告: processing_report.html');
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * 打印處理摘要
     */
    printSummary() {
        console.log('\n📊 處理摘要:');
        console.log(`  總文件數: ${this.processedFiles}`);
        console.log(`  聖詩數量: ${Object.keys(this.dataIndex.byNumber).length}`);
        console.log(`  作者數量: ${Object.keys(this.dataIndex.byAuthor).length}`);
        console.log(`  主題數量: ${Object.keys(this.dataIndex.byTheme).length}`);
        console.log(`  語言數量: ${Object.keys(this.dataIndex.byLanguage).length}`);
        console.log(`  錯誤數量: ${this.errors.length}`);
    }

    /**
     * 打印錯誤信息
     */
    printErrors() {
        if (this.errors.length > 0) {
            console.log('\n⚠️ 處理錯誤:');
            this.errors.forEach(error => {
                console.log(`  ${error.file}: ${error.error}`);
            });
        }
    }
}

// 如果直接運行此腳本
if (require.main === module) {
    const processor = new HymnDataProcessor();
    processor.processAll().catch(console.error);
}

module.exports = HymnDataProcessor;










