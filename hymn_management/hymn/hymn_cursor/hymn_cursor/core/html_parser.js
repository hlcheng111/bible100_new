// HTML文件解析器 - 自動解析千多首詩歌
class HymnHTMLParser {
    constructor() {
        this.parsedHymns = [];
        this.parseErrors = [];
    }
    
    // 解析單個HTML文件
    parseHTMLFile(filePath, content) {
        try {
            // 從文件路徑提取信息
            const pathInfo = this.extractPathInfo(filePath);
            
            // 從HTML內容提取詩歌信息
            const hymnInfo = this.extractHymnInfo(content);
            
            // 合併信息
            const hymn = {
                ...pathInfo,
                ...hymnInfo,
                file_path: filePath,
                parse_date: new Date().toISOString()
            };
            
            this.parsedHymns.push(hymn);
            return hymn;
            
        } catch (error) {
            this.parseErrors.push({
                file: filePath,
                error: error.message
            });
            return null;
        }
    }
    
    // 從文件路徑提取信息
    extractPathInfo(filePath) {
        const info = {
            directory_path: '',
            file_name: '',
            hymn_number: '',
            title_en: '',
            title_cn: '',
            author: '',
            tune: ''
        };
        
        try {
            // 提取目錄路徑
            const pathParts = filePath.split('\\');
            if (pathParts.length > 1) {
                info.directory_path = pathParts[pathParts.length - 2];
            }
            
            // 提取文件名
            info.file_name = pathParts[pathParts.length - 1];
            
            // 從文件名提取編號和標題
            const fileName = decodeURIComponent(info.file_name);
            const numberMatch = fileName.match(/^(\d+)/);
            if (numberMatch) {
                info.hymn_number = numberMatch[1];
            }
            
            // 提取英文標題
            const titleMatch = fileName.match(/([A-Za-z\s]+?)(?:_|$)/);
            if (titleMatch) {
                info.title_en = titleMatch[1].trim();
            }
            
            // 提取中文標題
            const chineseMatch = fileName.match(/[\u4e00-\u9fff]+/g);
            if (chineseMatch && chineseMatch.length > 0) {
                info.title_cn = chineseMatch.join(' ');
            }
            
            // 提取作者信息
            const authorMatch = fileName.match(/_([A-Za-z\s]+?)(?:_|$)/);
            if (authorMatch) {
                info.author = authorMatch[1].trim();
            }
            
            // 提取曲調信息
            const tuneMatch = fileName.match(/([A-Z]{2,})(?:_|$)/);
            if (tuneMatch) {
                info.tune = tuneMatch[1];
            }
            
        } catch (error) {
            console.warn('路徑解析錯誤:', filePath, error);
        }
        
        return info;
    }
    
    // 從HTML內容提取詩歌信息
    extractHymnInfo(content) {
        const info = {
            content_title: '',
            content_author: '',
            content_tune: '',
            content_category: ''
        };
        
        try {
            // 提取頁面標題
            const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) {
                info.content_title = titleMatch[1].trim();
            }
            
            // 提取作者信息
            const authorMatch = content.match(/作者[：:]\s*([^\n\r]+)/);
            if (authorMatch) {
                info.content_author = authorMatch[1].trim();
            }
            
            // 提取曲調信息
            const tuneMatch = content.match(/曲調[：:]\s*([^\n\r]+)/);
            if (tuneMatch) {
                info.content_tune = tuneMatch[1].trim();
            }
            
            // 提取分類信息
            const categoryMatch = content.match(/分類[：:]\s*([^\n\r]+)/);
            if (categoryMatch) {
                info.content_category = categoryMatch[1].trim();
            }
            
        } catch (error) {
            console.warn('內容解析錯誤:', error);
        }
        
        return info;
    }
    
    // 批量解析目錄
    async parseDirectory(directoryPath) {
        console.log('開始解析目錄:', directoryPath);
        
        try {
            // 模擬掃描目錄
            const mockFiles = this.generateMockFileList();
            
            for (const file of mockFiles) {
                const hymn = this.parseHTMLFile(file.path, file.content);
                if (hymn) {
                    console.log('解析成功:', hymn.title_en || hymn.title_cn);
                }
            }
            
            console.log(`解析完成！成功: ${this.parsedHymns.length}, 錯誤: ${this.parseErrors.length}`);
            return this.parsedHymns;
            
        } catch (error) {
            console.error('目錄解析錯誤:', error);
            return [];
        }
    }
    
    // 生成模擬文件列表（實際實現中會掃描真實目錄）
    generateMockFileList() {
        const files = [];
        
        // 模擬 hymn_00 目錄
        for (let i = 1; i <= 100; i++) {
            files.push({
                path: `hymn_00\\${String(i).padStart(4, '0')} Amazing Grace_Newton_AMAZING_GRACE.htm`,
                content: `<html><title>Amazing Grace - 奇異恩典</title><body>作者：John Newton<br>曲調：AMAZING GRACE</body></html>`
            });
        }
        
        // 模擬 hymn_chi 目錄
        for (let i = 1; i <= 100; i++) {
            files.push({
                path: `hymn_chi\\LX${String(i).padStart(4, '0')} 聖哉三一歌_Heber_NICAEA.htm`,
                content: `<html><title>聖哉三一歌 - Holy, Holy, Holy</title><body>作者：Reginald Heber<br>曲調：NICAEA</body></html>`
            });
        }
        
        // 模擬 hymn_most 目錄
        for (let i = 1; i <= 100; i++) {
            files.push({
                path: `hymn_most\\${String(i).padStart(4, '0')} Great Is Thy Faithfulness_Chisholm_FAITHFULNESS.htm`,
                content: `<html><title>Great Is Thy Faithfulness - 你的信實何其廣大</title><body>作者：Thomas Chisholm<br>曲調：FAITHFULNESS</body></html>`
            });
        }
        
        // 模擬其他目錄
        const otherDirs = ['hymn_new', 'hymn_pwc', 'hymn_world', 'hymn_22', 'hymn_23'];
        otherDirs.forEach(dir => {
            for (let i = 1; i <= 50; i++) {
                files.push({
                    path: `${dir}\\${String(i).padStart(4, '0')} Worship Song_Author_TUNE.htm`,
                    content: `<html><title>Worship Song ${i}</title><body>作者：Author ${i}<br>曲調：TUNE ${i}</body></html>`
                });
            }
        });
        
        return files;
    }
    
    // 獲取解析結果
    getResults() {
        return {
            total_parsed: this.parsedHymns.length,
            total_errors: this.parseErrors.length,
            hymns: this.parsedHymns,
            errors: this.parseErrors
        };
    }
    
    // 清理解析結果
    clearResults() {
        this.parsedHymns = [];
        this.parseErrors = [];
    }
}

// 創建全局實例
window.hymnParser = new HymnHTMLParser();
console.log('HTML解析器初始化完成');




