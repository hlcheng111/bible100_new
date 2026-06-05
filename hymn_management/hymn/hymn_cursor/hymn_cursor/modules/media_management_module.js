// 🎵 聖詩媒體管理模組 v1.0
// 功能：YouTube播放列表導入、智能匹配、媒體庫管理
class HymnMediaManagementModule {
    constructor() {
        this.database = null;
        this.mediaTypes = ['youtube_video', 'mp3', 'score', 'image', 'article', 'hymnal'];
        this.performanceTypes = ['guitar', 'choir', 'female_solo', 'male_solo', 'orchestra', 'piano', 'other'];
        this.platforms = ['youtube', 'spotify', 'apple_music', 'custom'];
        this.init();
    }

    init() {
        console.log('🎵 媒體管理模組已初始化');
        this.setupEventListeners();
    }

    setDatabase(database) {
        this.database = database;
        console.log('✅ 媒體管理模組已連接到數據庫');
    }

    setupEventListeners() {
        // 事件監聽器設置
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeUI();
        });
    }

    initializeUI() {
        // 初始化用戶界面元素
        console.log('🎨 媒體管理界面已初始化');
    }

    // YouTube播放列表解析
    parseYouTubePlaylist(content, playlistUrl = '') {
        try {
            const lines = content.split('\n').filter(line => line.trim());
            const playlist = {
                url: playlistUrl,
                platform: 'youtube',
                songs: [],
                totalSongs: lines.length,
                parseTime: new Date().toISOString()
            };

            lines.forEach((line, index) => {
                const song = this.parsePlaylistLine(line, index + 1);
                if (song) {
                    playlist.songs.push(song);
                }
            });

            console.log(`🎵 解析完成：${playlist.songs.length} 首歌曲`);
            return playlist;

        } catch (error) {
            console.error('❌ 播放列表解析失敗:', error);
            throw error;
        }
    }

    parsePlaylistLine(line, index) {
        try {
            // 標準格式：0:00:00 歌曲名稱
            const timestampRegex = /^(\d{1,2}:\d{2}:\d{2})\s+(.+)$/;
            const match = line.match(timestampRegex);

            if (match) {
                return {
                    id: index,
                    timestamp: match[1],
                    title: match[2].trim(),
                    original_line: line,
                    parsed: true
                };
            }

            // 其他格式處理
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
                const timestamp = parts[0];
                const title = parts.slice(1).join(' ');
                
                return {
                    id: index,
                    timestamp: timestamp,
                    title: title.trim(),
                    original_line: line,
                    parsed: true
                };
            }

            return {
                id: index,
                timestamp: '',
                title: line.trim(),
                original_line: line,
                parsed: false
            };

        } catch (error) {
            console.error('❌ 行解析失敗:', line, error);
            return null;
        }
    }

    // 智能匹配歌曲
    async matchSongsWithDatabase(songs, threshold = 80) {
        if (!this.database) {
            throw new Error('數據庫未連接');
        }

        const matches = [];
        const unmatched = [];

        for (const song of songs) {
            const match = await this.findBestMatch(song.title, threshold);
            
            if (match) {
                matches.push({
                    song: song,
                    match: match,
                    similarity: match.similarity
                });
            } else {
                unmatched.push(song);
            }
        }

        return {
            matches: matches,
            unmatched: unmatched,
            totalSongs: songs.length,
            matchedCount: matches.length,
            unmatchedCount: unmatched.length,
            matchRate: (matches.length / songs.length * 100).toFixed(2)
        };
    }

    async findBestMatch(songTitle, threshold) {
        try {
            // 從數據庫搜索相似的詩歌
            const searchResults = this.database.searchHymns(songTitle);
            
            if (searchResults.length === 0) {
                return null;
            }

            // 計算相似度
            const scoredResults = searchResults.map(result => ({
                ...result,
                similarity: this.calculateSimilarity(songTitle, result.title_en || result.title_cn || '')
            }));

            // 排序並返回最佳匹配
            scoredResults.sort((a, b) => b.similarity - a.similarity);
            const bestMatch = scoredResults[0];

            if (bestMatch.similarity >= threshold) {
                return bestMatch;
            }

            return null;

        } catch (error) {
            console.error('❌ 匹配搜索失敗:', error);
            return null;
        }
    }

    calculateSimilarity(str1, str2) {
        // 簡單的相似度計算（可以改進為更複雜的算法）
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) {
            return 100;
        }

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length * 100;
    }

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

    // 導入媒體到數據庫
    async importMediaToDatabase(playlist, matches, mediaType = 'youtube_video', performanceType = 'other') {
        if (!this.database) {
            throw new Error('數據庫未連接');
        }

        const imported = [];
        const failed = [];

        for (const match of matches) {
            try {
                const mediaData = {
                    media_type: mediaType,
                    performance_type: performanceType,
                    song_name: match.match.title_en || match.match.title_cn || match.song.title,
                    source_info: `YouTube Playlist: ${playlist.url}`,
                    notes: `Timestamp: ${match.song.timestamp}, Similarity: ${match.similarity.toFixed(2)}%`,
                    link: playlist.url,
                    timestamp: match.song.timestamp
                };

                const result = this.database.addMedia(mediaData);
                
                if (result.success) {
                    imported.push({
                        song: match.song,
                        media_id: result.id,
                        match: match.match
                    });
                } else {
                    failed.push({
                        song: match.song,
                        error: result.message
                    });
                }

            } catch (error) {
                failed.push({
                    song: match.song,
                    error: error.message
                });
            }
        }

        return {
            imported: imported,
            failed: failed,
            totalProcessed: matches.length,
            successCount: imported.length,
            failureCount: failed.length,
            successRate: (imported.length / matches.length * 100).toFixed(2)
        };
    }

    // 批量處理
    async batchProcessPlaylists(playlists, options = {}) {
        const results = {
            totalPlaylists: playlists.length,
            processedPlaylists: 0,
            totalSongs: 0,
            totalMatches: 0,
            totalImported: 0,
            errors: []
        };

        for (const playlist of playlists) {
            try {
                console.log(`🎵 處理播放列表: ${playlist.url || '未知'}`);

                // 解析播放列表
                const parsedPlaylist = this.parseYouTubePlaylist(playlist.content, playlist.url);
                results.totalSongs += parsedPlaylist.songs.length;

                // 匹配歌曲
                const matches = await this.matchSongsWithDatabase(
                    parsedPlaylist.songs, 
                    options.similarityThreshold || 80
                );
                results.totalMatches += matches.matches.length;

                // 導入媒體
                const importResult = await this.importMediaToDatabase(
                    parsedPlaylist,
                    matches.matches,
                    options.mediaType || 'youtube_video',
                    options.performanceType || 'other'
                );
                results.totalImported += importResult.successCount;

                results.processedPlaylists++;

            } catch (error) {
                results.errors.push({
                    playlist: playlist,
                    error: error.message
                });
            }
        }

        return results;
    }

    // 媒體庫管理
    getMediaLibrary(filters = {}) {
        if (!this.database) {
            throw new Error('數據庫未連接');
        }

        let media = this.database.databases.media;

        // 應用過濾器
        if (filters.mediaType) {
            media = media.filter(item => item.media_type === filters.mediaType);
        }

        if (filters.performanceType) {
            media = media.filter(item => item.performance_type === filters.performanceType);
        }

        if (filters.searchTerm) {
            media = media.filter(item => 
                item.song_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                item.source_info.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        return {
            media: media,
            totalCount: media.length,
            filters: filters
        };
    }

    // 統計信息
    getMediaStatistics() {
        if (!this.database) {
            throw new Error('數據庫未連接');
        }

        const media = this.database.databases.media;
        
        const stats = {
            totalMedia: media.length,
            byType: {},
            byPerformance: {},
            bySource: {},
            recentAdditions: []
        };

        // 按類型統計
        media.forEach(item => {
            stats.byType[item.media_type] = (stats.byType[item.media_type] || 0) + 1;
            stats.byPerformance[item.performance_type] = (stats.byPerformance[item.performance_type] || 0) + 1;
        });

        // 最近添加的媒體
        stats.recentAdditions = media
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

        return stats;
    }

    // 導出媒體數據
    exportMediaData(format = 'json', filters = {}) {
        const library = this.getMediaLibrary(filters);

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(library.media, null, 2);
            
            case 'csv':
                return this.convertToCSV(library.media);
            
            default:
                throw new Error('不支持的導出格式');
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        data.forEach(item => {
            const values = headers.map(header => {
                const value = item[header];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }

    // 清理重複媒體
    cleanDuplicateMedia() {
        if (!this.database) {
            throw new Error('數據庫未連接');
        }

        const media = this.database.databases.media;
        const duplicates = [];
        const unique = [];

        media.forEach(item => {
            const key = `${item.song_name}_${item.media_type}_${item.source_info}`;
            const existing = unique.find(u => 
                `${u.song_name}_${u.media_type}_${u.source_info}` === key
            );

            if (existing) {
                duplicates.push(item);
            } else {
                unique.push(item);
            }
        });

        // 更新數據庫
        this.database.databases.media = unique;

        return {
            originalCount: media.length,
            uniqueCount: unique.length,
            duplicateCount: duplicates.length,
            removedDuplicates: duplicates
        };
    }

    // 獲取模組狀態
    getModuleStatus() {
        return {
            name: 'HymnMediaManagementModule',
            version: '1.0',
            databaseConnected: !!this.database,
            mediaTypes: this.mediaTypes,
            performanceTypes: this.performanceTypes,
            platforms: this.platforms
        };
    }
}

// 初始化模組
window.hymnMediaManagement = new HymnMediaManagementModule();
console.log('🎵 聖詩媒體管理模組已加載');
