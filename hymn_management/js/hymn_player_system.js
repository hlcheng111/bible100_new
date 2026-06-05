/**
 * 聖詩播放器系統
 * 支持多種音頻格式和播放功能
 */

class HymnPlayerSystem {
    constructor() {
        this.audioContext = null;
        this.currentAudio = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.volume = 0.8;
        this.repeatMode = 'none'; // 'none', 'one', 'all'
        this.shuffleMode = false;
        this.playHistory = [];
        
        this.initializeAudio();
        this.setupEventListeners();
    }

    /**
     * 初始化音頻系統
     */
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API 不支持，使用 HTML5 Audio');
        }
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousTrack();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextTrack();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
            }
        });
    }

    /**
     * 加載聖詩播放列表
     */
    loadPlaylist(hymns) {
        this.playlist = hymns.map(hymn => ({
            id: hymn.path,
            title: hymn.metadata.title || hymn.name,
            author: hymn.metadata.author,
            hymnNumber: hymn.metadata.hymnNumber,
            audioPath: this.getAudioPath(hymn),
            duration: 0,
            loaded: false
        }));
        
        this.currentIndex = 0;
        this.updatePlaylistUI();
    }

    /**
     * 獲取音頻文件路徑
     */
    getAudioPath(hymn) {
        // 嘗試多種音頻格式
        const hymnNumber = hymn.metadata.hymnNumber || 'unknown';
        const basePath = `hymns/audio/`;
        
        return {
            mp3: `${basePath}${hymnNumber}.mp3`,
            wav: `${basePath}${hymnNumber}.wav`,
            ogg: `${basePath}${hymnNumber}.ogg`,
            midi: `${basePath}${hymnNumber}.mid`
        };
    }

    /**
     * 播放聖詩
     */
    async playHymn(hymnId) {
        const hymn = this.playlist.find(h => h.id === hymnId);
        if (!hymn) {
            console.error('聖詩未找到:', hymnId);
            return;
        }

        try {
            // 停止當前播放
            this.stop();

            // 加載音頻
            await this.loadAudio(hymn);

            // 開始播放
            this.currentAudio = hymn.audio;
            this.currentAudio.volume = this.volume;
            
            const playPromise = this.currentAudio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isPlaying = true;
                    this.isPaused = false;
                    this.updatePlayerUI();
                    this.startProgressTracking();
                }).catch(error => {
                    console.error('播放失敗:', error);
                    this.showErrorMessage('播放失敗，請檢查音頻文件');
                });
            }

        } catch (error) {
            console.error('播放錯誤:', error);
            this.showErrorMessage('音頻文件加載失敗');
        }
    }

    /**
     * 加載音頻文件
     */
    async loadAudio(hymn) {
        if (hymn.loaded && hymn.audio) {
            return hymn.audio;
        }

        const audioPaths = hymn.audioPath;
        
        // 嘗試加載不同格式的音頻
        for (const [format, path] of Object.entries(audioPaths)) {
            try {
                const audio = new Audio(path);
                
                // 設置音頻事件
                audio.addEventListener('loadedmetadata', () => {
                    hymn.duration = audio.duration;
                    hymn.loaded = true;
                    this.updateDurationUI(audio.duration);
                });

                audio.addEventListener('ended', () => {
                    this.onTrackEnded();
                });

                audio.addEventListener('error', (e) => {
                    console.warn(`音頻格式 ${format} 加載失敗:`, path);
                });

                // 預加載音頻
                audio.preload = 'metadata';
                
                hymn.audio = audio;
                return audio;
                
            } catch (error) {
                console.warn(`無法加載音頻格式 ${format}:`, error);
            }
        }

        throw new Error('所有音頻格式都無法加載');
    }

    /**
     * 切換播放/暫停
     */
    togglePlayPause() {
        if (!this.currentAudio) return;

        if (this.isPlaying) {
            this.pause();
        } else {
            this.resume();
        }
    }

    /**
     * 暫停播放
     */
    pause() {
        if (this.currentAudio && this.isPlaying) {
            this.currentAudio.pause();
            this.isPlaying = false;
            this.isPaused = true;
            this.updatePlayerUI();
        }
    }

    /**
     * 恢復播放
     */
    resume() {
        if (this.currentAudio && this.isPaused) {
            this.currentAudio.play();
            this.isPlaying = true;
            this.isPaused = false;
            this.updatePlayerUI();
        }
    }

    /**
     * 停止播放
     */
    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.isPlaying = false;
            this.isPaused = false;
            this.updatePlayerUI();
        }
    }

    /**
     * 上一首
     */
    previousTrack() {
        if (this.playlist.length === 0) return;

        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        const hymn = this.playlist[this.currentIndex];
        this.playHymn(hymn.id);
    }

    /**
     * 下一首
     */
    nextTrack() {
        if (this.playlist.length === 0) return;

        if (this.shuffleMode) {
            this.currentIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        }
        
        const hymn = this.playlist[this.currentIndex];
        this.playHymn(hymn.id);
    }

    /**
     * 設置音量
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentAudio) {
            this.currentAudio.volume = this.volume;
        }
        this.updateVolumeUI();
    }

    /**
     * 切換靜音
     */
    toggleMute() {
        if (this.currentAudio) {
            this.currentAudio.muted = !this.currentAudio.muted;
            this.updateMuteUI();
        }
    }

    /**
     * 設置重複模式
     */
    setRepeatMode(mode) {
        this.repeatMode = mode; // 'none', 'one', 'all'
        this.updateRepeatUI();
    }

    /**
     * 切換隨機播放
     */
    toggleShuffle() {
        this.shuffleMode = !this.shuffleMode;
        this.updateShuffleUI();
    }

    /**
     * 設置播放位置
     */
    seekTo(time) {
        if (this.currentAudio) {
            this.currentAudio.currentTime = time;
        }
    }

    /**
     * 軌道結束處理
     */
    onTrackEnded() {
        this.isPlaying = false;
        this.isPaused = false;
        
        // 添加到播放歷史
        if (this.playlist[this.currentIndex]) {
            this.playHistory.push(this.playlist[this.currentIndex]);
        }

        // 根據重複模式決定下一步
        switch (this.repeatMode) {
            case 'one':
                // 重複當前曲目
                this.playHymn(this.playlist[this.currentIndex].id);
                break;
            case 'all':
                // 播放下一首（會循環到第一首）
                this.nextTrack();
                break;
            default:
                // 播放下一首，如果是最後一首則停止
                if (this.currentIndex < this.playlist.length - 1) {
                    this.nextTrack();
                } else {
                    this.updatePlayerUI();
                }
                break;
        }
    }

    /**
     * 開始進度追蹤
     */
    startProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.progressInterval = setInterval(() => {
            if (this.currentAudio && this.isPlaying) {
                const progress = this.currentAudio.currentTime / this.currentAudio.duration;
                this.updateProgressUI(progress, this.currentAudio.currentTime);
            }
        }, 1000);
    }

    /**
     * 停止進度追蹤
     */
    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    /**
     * 更新播放器UI
     */
    updatePlayerUI() {
        const currentHymn = this.playlist[this.currentIndex];
        if (!currentHymn) return;

        // 更新播放按鈕
        const playBtn = document.querySelector('.play-btn');
        if (playBtn) {
            playBtn.innerHTML = this.isPlaying ? '⏸️' : '▶️';
            playBtn.title = this.isPlaying ? '暫停' : '播放';
        }

        // 更新標題和作者
        const titleEl = document.querySelector('.current-title');
        const authorEl = document.querySelector('.current-author');
        if (titleEl) titleEl.textContent = currentHymn.title;
        if (authorEl) authorEl.textContent = currentHymn.author || '未知作者';

        // 更新播放列表高亮
        this.updatePlaylistHighlight();
    }

    /**
     * 更新播放列表UI
     */
    updatePlaylistUI() {
        const playlistContainer = document.querySelector('.playlist-container');
        if (!playlistContainer) return;

        const playlistHTML = this.playlist.map((hymn, index) => `
            <div class="playlist-item ${index === this.currentIndex ? 'active' : ''}" 
                 onclick="hymnPlayer.playHymn('${hymn.id}')">
                <div class="playlist-number">${hymn.hymnNumber || index + 1}</div>
                <div class="playlist-info">
                    <div class="playlist-title">${hymn.title}</div>
                    <div class="playlist-author">${hymn.author || '未知作者'}</div>
                </div>
                <div class="playlist-duration">${this.formatTime(hymn.duration)}</div>
            </div>
        `).join('');

        playlistContainer.innerHTML = playlistHTML;
    }

    /**
     * 更新播放列表高亮
     */
    updatePlaylistHighlight() {
        document.querySelectorAll('.playlist-item').forEach((item, index) => {
            item.classList.toggle('active', index === this.currentIndex);
        });
    }

    /**
     * 更新進度UI
     */
    updateProgressUI(progress, currentTime) {
        const progressBar = document.querySelector('.progress-bar');
        const currentTimeEl = document.querySelector('.current-time');
        
        if (progressBar) {
            progressBar.style.width = `${progress * 100}%`;
        }
        
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(currentTime);
        }
    }

    /**
     * 更新時長UI
     */
    updateDurationUI(duration) {
        const durationEl = document.querySelector('.total-duration');
        if (durationEl) {
            durationEl.textContent = this.formatTime(duration);
        }
    }

    /**
     * 更新音量UI
     */
    updateVolumeUI() {
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }
    }

    /**
     * 更新靜音UI
     */
    updateMuteUI() {
        const muteBtn = document.querySelector('.mute-btn');
        if (muteBtn && this.currentAudio) {
            muteBtn.innerHTML = this.currentAudio.muted ? '🔇' : '🔊';
            muteBtn.title = this.currentAudio.muted ? '取消靜音' : '靜音';
        }
    }

    /**
     * 更新重複模式UI
     */
    updateRepeatUI() {
        const repeatBtn = document.querySelector('.repeat-btn');
        if (repeatBtn) {
            const icons = { none: '🔁', one: '🔂', all: '🔁' };
            const titles = { none: '關閉重複', one: '重複當前', all: '重複全部' };
            repeatBtn.innerHTML = icons[this.repeatMode];
            repeatBtn.title = titles[this.repeatMode];
            repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        }
    }

    /**
     * 更新隨機播放UI
     */
    updateShuffleUI() {
        const shuffleBtn = document.querySelector('.shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', this.shuffleMode);
            shuffleBtn.title = this.shuffleMode ? '關閉隨機播放' : '開啟隨機播放';
        }
    }

    /**
     * 格式化時間
     */
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 顯示錯誤消息
     */
    showErrorMessage(message) {
        // 創建錯誤提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(errorDiv);
        
        // 3秒後自動移除
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    /**
     * 獲取播放統計
     */
    getPlayStats() {
        return {
            totalPlayed: this.playHistory.length,
            currentSession: this.playHistory.filter(h => 
                Date.now() - h.playTime < 3600000 // 1小時內
            ).length,
            mostPlayed: this.getMostPlayedHymns()
        };
    }

    /**
     * 獲取最常播放的聖詩
     */
    getMostPlayedHymns() {
        const playCounts = {};
        this.playHistory.forEach(hymn => {
            playCounts[hymn.id] = (playCounts[hymn.id] || 0) + 1;
        });

        return Object.entries(playCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([id, count]) => ({
                hymn: this.playlist.find(h => h.id === id),
                count
            }));
    }

    /**
     * 導出播放列表
     */
    exportPlaylist() {
        const playlistData = {
            name: '聖詩播放列表',
            created: new Date().toISOString(),
            hymns: this.playlist.map(hymn => ({
                title: hymn.title,
                author: hymn.author,
                hymnNumber: hymn.hymnNumber,
                audioPath: hymn.audioPath
            }))
        };

        const blob = new Blob([JSON.stringify(playlistData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hymn_playlist.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 清理資源
     */
    destroy() {
        this.stop();
        this.stopProgressTracking();
        
        if (this.currentAudio) {
            this.currentAudio.removeEventListener('ended', this.onTrackEnded);
            this.currentAudio = null;
        }
        
        this.playlist = [];
        this.playHistory = [];
    }
}

// 創建全局播放器實例
const hymnPlayer = new HymnPlayerSystem();

// 導出給其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HymnPlayerSystem;
}









