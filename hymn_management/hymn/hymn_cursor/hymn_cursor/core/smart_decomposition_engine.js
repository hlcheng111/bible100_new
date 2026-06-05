// 🎵 聖詩智能分解引擎 v2.0
// 功能：自動解析聖詩數據，智能分類，媒體關聯

class SmartDecompositionEngine {
    constructor() {
        this.database = null;
        this.parsingRules = this.initializeParsingRules();
        this.mediaTypes = ['youtube_video', 'mp3', 'score', 'image', 'article'];
        this.importanceLevels = ['▲▲', '▲', '★', '●', '◆'];
    }

    // 初始化解析規則
    initializeParsingRules() {
        return {
            // 編號模式：4位數字開頭
            numberPattern: /^(\d{4})/,
            
            // 英文標題：大寫字母開頭，可能包含空格和標點
            englishTitlePattern: /([A-Z][A-Za-z\s\-\'\"\.]+?)(?=\s*[_\-\()]|\s*$)/,
            
            // 作者：括號內或下劃線後
            authorPattern: /[_\-\()]([A-Za-z\s]+?)[\)]?/,
            
            // 中文標題：中文字符
            chineseTitlePattern: /[\u4e00-\u9fff]+/g,
            
            // 分類代碼：H開頭後跟數字和連字符
            categoryPattern: /H\d{2}-\d{2}/,
            
            // 重要性標記
            importancePattern: /[▲★●◆]+/g
        };
    }

    // 設置數據庫連接
    setDatabase(database) {
        this.database = database;
        console.log('✅ 智能分解引擎已連接到數據庫');
    }

    // 智能分解單首聖詩
    decomposeHymn(hymnText, originalLink = '') {
        try {
            const decomposition = {
                original_text: hymnText,
                original_link: originalLink,
                parsed: false,
                errors: [],
                data: {}
            };

            // 1. 提取編號
            const numberMatch = hymnText.match(this.parsingRules.numberPattern);
            if (numberMatch) {
                decomposition.data.number = numberMatch[1];
            }

            // 2. 提取英文標題
            const englishMatch = hymnText.match(this.parsingRules.englishTitlePattern);
            if (englishMatch) {
                decomposition.data.title_en = englishMatch[1].trim();
            }

            // 3. 提取中文標題
            const chineseMatches = hymnText.match(this.parsingRules.chineseTitlePattern);
            if (chineseMatches && chineseMatches.length > 0) {
                decomposition.data.title_cn = chineseMatches.join(' ');
            }

            // 4. 提取作者信息
            const authorMatch = hymnText.match(this.parsingRules.authorPattern);
            if (authorMatch) {
                decomposition.data.author = authorMatch[1].trim();
            }

            // 5. 提取分類代碼
            const categoryMatch = hymnText.match(this.parsingRules.categoryPattern);
            if (categoryMatch) {
                decomposition.data.category_code = categoryMatch[0];
            }

            // 6. 提取重要性標記
            const importanceMatch = hymnText.match(this.parsingRules.importancePattern);
            if (importanceMatch) {
                decomposition.data.importance = importanceMatch.join('');
            }

            // 7. 解析路徑信息
            if (originalLink) {
                const pathInfo = this.parsePathFromLink(originalLink);
                decomposition.data.directory_path = pathInfo.directory;
                decomposition.data.file_name = pathInfo.filename;
            }

            decomposition.parsed = true;
            return decomposition;

        } catch (error) {
            return {
                original_text: hymnText,
                original_link: originalLink,
                parsed: false,
                errors: [error.message],
                data: {}
            };
        }
    }

    // 從鏈接解析路徑信息
    parsePathFromLink(link) {
        try {
            const url = new URL(link);
            const pathParts = url.pathname.split('/').filter(part => part);
            
            if (pathParts.length >= 2) {
                return {
                    directory: pathParts.slice(0, -1).join('/'),
                    filename: pathParts[pathParts.length - 1]
                };
            }
            
            return { directory: '', filename: '' };
        } catch {
            // 如果不是有效URL，嘗試解析本地路徑
            const pathParts = link.split('\\').filter(part => part);
            if (pathParts.length >= 2) {
                return {
                    directory: pathParts.slice(0, -1).join('\\'),
                    filename: pathParts[pathParts.length - 1]
                };
            }
            return { directory: '', filename: '' };
        }
    }

    // 批量解析聖詩表格
    async batchDecomposeHymns(tableElement) {
        if (!this.database) {
            throw new Error('數據庫未連接');
        }

        const results = {
            total: 0,
            success: 0,
            failed: 0,
            details: []
        };

        // 獲取表格行
        const rows = tableElement.querySelectorAll('tr');
        results.total = rows.length - 1; // 減去標題行

        console.log(`🔄 開始批量解析 ${results.total} 首聖詩...`);

        for (let i = 1; i < rows.length; i++) { // 跳過標題行
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length === 0) continue;

            try {
                // 提取行文本和鏈接
                const rowText = row.textContent.trim();
                const linkElement = row.querySelector('a');
                const originalLink = linkElement ? linkElement.href : '';

                // 智能分解
                const decomposition = this.decomposeHymn(rowText, originalLink);

                if (decomposition.parsed) {
                    // 導入到數據庫
                    const hymnId = await this.importToDatabase(decomposition);
                    
                    results.success++;
                    results.details.push({
                        row: i,
                        hymn_id: hymnId,
                        status: 'success',
                        data: decomposition.data
                    });

                    // 更新進度
                    if (i % 100 === 0) {
                        console.log(`📊 已處理 ${i}/${results.total} 首聖詩...`);
                    }
                } else {
                    results.failed++;
                    results.details.push({
                        row: i,
                        status: 'failed',
                        errors: decomposition.errors,
                        data: decomposition.data
                    });
                }

            } catch (error) {
                results.failed++;
                results.details.push({
                    row: i,
                    status: 'error',
                    errors: [error.message]
                });
            }
        }

        console.log(`✅ 批量解析完成！成功: ${results.success}, 失敗: ${results.failed}`);
        return results;
    }

    // 導入到數據庫
    async importToDatabase(decomposition) {
        try {
            // 1. 檢查是否已存在
            const existingHymn = this.findExistingHymn(decomposition.data);
            
            if (existingHymn) {
                // 更新現有記錄
                return await this.updateExistingHymn(existingHymn.id, decomposition);
            } else {
                // 創建新記錄
                return await this.createNewHymn(decomposition);
            }
        } catch (error) {
            console.error('導入數據庫失敗:', error);
            throw error;
        }
    }

    // 查找現有聖詩
    findExistingHymn(data) {
        if (!this.database || !this.database.databases) return null;

        const hymns = this.database.databases.hymns;
        
        // 按編號查找
        if (data.number) {
            const byNumber = hymns.find(h => h.number === data.number);
            if (byNumber) return byNumber;
        }

        // 按標題查找
        if (data.title_en) {
            const byTitle = hymns.find(h => 
                h.title_en && h.title_en.toLowerCase() === data.title_en.toLowerCase()
            );
            if (byTitle) return byTitle;
        }

        // 按中文標題查找
        if (data.title_cn) {
            const byChineseTitle = hymns.find(h => 
                h.title_cn && h.title_cn.includes(data.title_cn)
            );
            if (byChineseTitle) return byChineseTitle;
        }

        return null;
    }

    // 創建新聖詩記錄
    async createNewHymn(decomposition) {
        const hymnData = {
            number: decomposition.data.number || '',
            title_en: decomposition.data.title_en || '',
            title_cn: decomposition.data.title_cn || '',
            author: decomposition.data.author || '',
            category_code: decomposition.data.category_code || '',
            importance: decomposition.data.importance || '',
            directory_path: decomposition.data.directory_path || '',
            file_name: decomposition.data.file_name || '',
            original_link: decomposition.original_link || '',
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
        };

        return await this.database.addHymn(hymnData);
    }

    // 更新現有聖詩記錄
    async updateExistingHymn(hymnId, decomposition) {
        const updateData = {
            updated_date: new Date().toISOString()
        };

        // 只更新空白的字段
        if (!this.database.databases.hymns[hymnId - 1].title_en && decomposition.data.title_en) {
            updateData.title_en = decomposition.data.title_en;
        }
        if (!this.database.databases.hymns[hymnId - 1].title_cn && decomposition.data.title_cn) {
            updateData.title_cn = decomposition.data.title_cn;
        }
        if (!this.database.databases.hymns[hymnId - 1].author && decomposition.data.author) {
            updateData.author = decomposition.data.author;
        }

        // 更新記錄
        Object.assign(this.database.databases.hymns[hymnId - 1], updateData);
        this.database.saveToStorage();

        return hymnId;
    }

    // 媒體導入系統
    async importMediaPlaylist(playlistData) {
        if (!this.database) {
            throw new Error('數據庫未連接');
        }

        const results = {
            total: 0,
            matched: 0,
            unmatched: 0,
            details: []
        };

        results.total = playlistData.songs.length;

        for (const song of playlistData.songs) {
            try {
                // 查找匹配的聖詩
                const matchedHymn = this.findMatchingHymn(song.title);
                
                if (matchedHymn) {
                    // 創建媒體記錄
                    const mediaData = {
                        hymn_id: matchedHymn.id,
                        media_type: 'youtube_video',
                        media_title: song.title,
                        media_url: playlistData.playlist_url || '',
                        timestamp: song.timestamp,
                        performer_name: playlistData.channel_name || '',
                        album_name: playlistData.playlist_title || '',
                        created_date: new Date().toISOString()
                    };

                    const mediaId = await this.database.addMedia(mediaData);
                    
                    results.matched++;
                    results.details.push({
                        song: song.title,
                        status: 'matched',
                        hymn_id: matchedHymn.id,
                        media_id: mediaId
                    });
                } else {
                    results.unmatched++;
                    results.details.push({
                        song: song.title,
                        status: 'unmatched',
                        reason: '未找到匹配的聖詩'
                    });
                }
            } catch (error) {
                results.details.push({
                    song: song.title,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return results;
    }

    // 查找匹配的聖詩
    findMatchingHymn(songTitle) {
        if (!this.database || !this.database.databases) return null;

        const hymns = this.database.databases.hymns;
        const normalizedTitle = songTitle.toLowerCase().trim();

        // 精確匹配
        let match = hymns.find(h => 
            h.title_en && h.title_en.toLowerCase() === normalizedTitle
        );
        if (match) return match;

        // 部分匹配
        match = hymns.find(h => 
            h.title_en && h.title_en.toLowerCase().includes(normalizedTitle) ||
            normalizedTitle.includes(h.title_en.toLowerCase())
        );
        if (match) return match;

        // 模糊匹配（使用相似度算法）
        let bestMatch = null;
        let bestScore = 0;

        hymns.forEach(hymn => {
            if (hymn.title_en) {
                const score = this.calculateSimilarity(normalizedTitle, hymn.title_en.toLowerCase());
                if (score > bestScore && score > 0.7) {
                    bestScore = score;
                    bestMatch = hymn;
                }
            }
        });

        return bestMatch;
    }

    // 計算字符串相似度
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    // Levenshtein距離算法
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // 生成導入報告
    generateImportReport(results) {
        let report = `# 📊 聖詩數據導入報告\n\n`;
        report += `**總計**: ${results.total} 首聖詩\n`;
        report += `**成功**: ${results.success} 首\n`;
        report += `**失敗**: ${results.failed} 首\n`;
        report += `**成功率**: ${((results.success / results.total) * 100).toFixed(1)}%\n\n`;

        if (results.failed > 0) {
            report += `## ❌ 失敗記錄\n\n`;
            results.details.filter(d => d.status === 'failed').forEach(detail => {
                report += `- 第${detail.row}行: ${detail.errors.join(', ')}\n`;
            });
        }

        return report;
    }
}

// 創建全局實例
window.smartDecompositionEngine = new SmartDecompositionEngine();
console.log('🎵 聖詩智能分解引擎已初始化');
