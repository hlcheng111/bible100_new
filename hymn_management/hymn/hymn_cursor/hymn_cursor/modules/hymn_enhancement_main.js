/**
 * 聖詩增強系統主控制器
 * 整合搜索、數據管理和UI增強功能
 */

class HymnEnhancementSystem {
    constructor() {
        this.isInitialized = false;
        this.systemStatus = 'initializing';
        this.init();
    }

    async init() {
        try {
            this.checkRequirements();
            this.createSystemStatusBar();
            this.loadEnhancementScripts();
            this.createQuickNavigation();
            this.createBackToTopButton();
            this.bindKeyboardShortcuts();
            this.initializeSystem();
            this.showWelcomeMessage();
        } catch (error) {
            console.error('聖詩增強系統初始化失敗:', error);
            this.systemStatus = 'error';
            this.updateSystemStatus();
        }
    }

    // 檢查系統要求
    checkRequirements() {
        if (typeof window === 'undefined') {
            throw new Error('需要瀏覽器環境');
        }
        
        if (!document || !document.body) {
            throw new Error('DOM未準備就緒');
        }
    }

    // 創建系統狀態欄
    createSystemStatusBar() {
        const statusBar = document.createElement('div');
        statusBar.id = 'hymn-system-status';
        statusBar.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        statusBar.innerHTML = `
            <span id="status-icon">⚡</span>
            <span id="status-text">系統啟動中...</span>
        `;

        statusBar.addEventListener('click', () => {
            this.showSystemInfo();
        });

        document.body.appendChild(statusBar);
    }

    // 更新系統狀態
    updateSystemStatus() {
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');

        if (!statusIcon || !statusText) return;

        switch (this.systemStatus) {
            case 'initializing':
                statusIcon.textContent = '⚡';
                statusText.textContent = '系統啟動中...';
                break;
            case 'ready':
                statusIcon.textContent = '✅';
                statusText.textContent = '聖詩增強系統已就緒';
                break;
            case 'error':
                statusIcon.textContent = '❌';
                statusText.textContent = '系統錯誤';
                break;
            case 'searching':
                statusIcon.textContent = '🔍';
                statusText.textContent = '搜索中...';
                break;
            case 'analyzing':
                statusIcon.textContent = '📊';
                statusText.textContent = '分析中...';
                break;
        }
    }

    // 顯示系統信息
    showSystemInfo() {
        const info = `
聖詩增強系統 v1.0

功能模組:
✅ 智能搜索系統
✅ 數據管理分析
✅ 快速導航面板
✅ 返回頂部按鈕
✅ 系統狀態監控

快捷鍵:
Ctrl+S: 打開搜索
Ctrl+D: 打開數據管理
Ctrl+H: 返回頂部
ESC: 關閉彈窗

系統狀態: ${this.systemStatus}
初始化時間: ${new Date().toLocaleString()}
        `;
        alert(info);
    }

    // 加載增強腳本
    async loadEnhancementScripts() {
        const scripts = [
            { src: 'search_enhancement.js', name: '搜索增強' },
            { src: 'data_management.js', name: '數據管理' }
        ];

        for (const script of scripts) {
            try {
                await this.loadScript(script.src);
                console.log(`✅ ${script.name} 模組加載成功`);
            } catch (error) {
                console.error(`❌ ${script.name} 模組加載失敗:`, error);
            }
        }
    }

    // 加載單個腳本
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`無法加載腳本: ${src}`));
            document.head.appendChild(script);
        });
    }

    // 創建快速導航
    createQuickNavigation() {
        const navPanel = document.createElement('div');
        navPanel.id = 'hymn-quick-nav';
        navPanel.style.cssText = `
            position: fixed;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 9998;
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            gap: 10px;
            transition: all 0.3s ease;
        `;

        navPanel.innerHTML = `
            <div style="text-align: center; font-weight: bold; color: #333; font-size: 14px; margin-bottom: 10px;">
                🚀 快速導航
            </div>
            <button id="nav-search" style="background: #4CAF50; color: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 12px; transition: all 0.2s ease;">
                🔍 智能搜索
            </button>
            <button id="nav-data" style="background: #2196F3; color: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 12px; transition: all 0.2s ease;">
                📊 數據管理
            </button>
            <button id="nav-top" style="background: #9C27B0; color: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 12px; transition: all 0.2s ease;">
                ↑ 返回頂部
            </button>
            <button id="nav-info" style="background: #607D8B; color: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 12px; transition: all 0.2s ease;">
                ℹ️ 系統信息
            </button>
        `;

        // 添加懸停效果
        const buttons = navPanel.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
            });
        });

        // 綁定事件
        document.getElementById('nav-search').addEventListener('click', () => {
            if (window.hymnSearchEnhancement) {
                window.hymnSearchEnhancement.showSearchInterface();
            }
        });

        document.getElementById('nav-data').addEventListener('click', () => {
            if (window.hymnDataManagement) {
                window.hymnDataManagement.showDataManagementInterface();
            }
        });

        document.getElementById('nav-top').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.getElementById('nav-info').addEventListener('click', () => {
            this.showSystemInfo();
        });

        document.body.appendChild(navPanel);
    }

    // 創建返回頂部按鈕
    createBackToTopButton() {
        const backToTopBtn = document.createElement('div');
        backToTopBtn.id = 'hymn-back-to-top';
        backToTopBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 9997;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            opacity: 0;
            visibility: hidden;
        `;

        backToTopBtn.innerHTML = '↑';
        backToTopBtn.title = '返回頂部 (Ctrl+H)';

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        backToTopBtn.addEventListener('mouseenter', () => {
            backToTopBtn.style.transform = 'scale(1.1)';
            backToTopBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        });

        backToTopBtn.addEventListener('mouseleave', () => {
            backToTopBtn.style.transform = 'scale(1)';
            backToTopBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        });

        document.body.appendChild(backToTopBtn);

        // 滾動事件監聽
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.visibility = 'visible';
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
            }
        });
    }

    // 綁定鍵盤快捷鍵
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S: 搜索
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (window.hymnSearchEnhancement) {
                    window.hymnSearchEnhancement.toggleSearchInterface();
                }
            }

            // Ctrl+D: 數據管理
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                if (window.hymnDataManagement) {
                    window.hymnDataManagement.toggleDataManagementInterface();
                }
            }

            // Ctrl+H: 返回頂部
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // ESC: 關閉彈窗
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // 關閉所有模態框
    closeAllModals() {
        if (window.hymnSearchEnhancement) {
            window.hymnSearchEnhancement.hideSearchInterface();
        }
        if (window.hymnDataManagement) {
            window.hymnDataManagement.hideDataManagementInterface();
        }
    }

    // 初始化系統
    initializeSystem() {
        // 等待所有模組加載完成
        const checkModules = setInterval(() => {
            if (window.hymnSearchEnhancement && window.hymnDataManagement) {
                clearInterval(checkModules);
                this.systemStatus = 'ready';
                this.updateSystemStatus();
                this.isInitialized = true;
                console.log('🎉 聖詩增強系統初始化完成！');
            }
        }, 100);

        // 超時檢查
        setTimeout(() => {
            if (!this.isInitialized) {
                clearInterval(checkModules);
                this.systemStatus = 'error';
                this.updateSystemStatus();
                console.error('❌ 聖詩增強系統初始化超時');
            }
        }, 5000);
    }

    // 顯示歡迎消息
    showWelcomeMessage() {
        setTimeout(() => {
            if (this.isInitialized) {
                const welcomeMessage = `
🎵 歡迎使用聖詩增強系統！ 🎵

✨ 新功能已啟用:
🔍 智能搜索 - 快速找到您需要的聖詩
📊 數據管理 - 分析和管理聖詩數據
🚀 快速導航 - 便捷的功能訪問
↑ 返回頂部 - 一鍵回到頁面頂部

⌨️ 快捷鍵:
• Ctrl+S: 打開搜索
• Ctrl+D: 打開數據管理
• Ctrl+H: 返回頂部
• ESC: 關閉彈窗

🎯 開始使用:
• 點擊右上角綠色搜索按鈕開始搜索
• 點擊左上角藍色數據按鈕查看統計
• 使用左側橙色導航面板快速訪問功能

享受更智能的聖詩瀏覽體驗！
                `;
                alert(welcomeMessage);
            }
        }, 2000);
    }

    // 獲取系統狀態
    getSystemStatus() {
        return {
            status: this.systemStatus,
            initialized: this.isInitialized,
            modules: {
                search: !!window.hymnSearchEnhancement,
                data: !!window.hymnDataManagement
            },
            timestamp: new Date().toISOString()
        };
    }

    // 重新初始化系統
    reinitialize() {
        this.systemStatus = 'initializing';
        this.updateSystemStatus();
        this.init();
    }
}

// 等待DOM加載完成後初始化系統
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.hymnEnhancementSystem = new HymnEnhancementSystem();
    });
} else {
    window.hymnEnhancementSystem = new HymnEnhancementSystem();
}

// 保存系統狀態到localStorage
setInterval(() => {
    if (window.hymnEnhancementSystem) {
        const status = window.hymnEnhancementSystem.getSystemStatus();
        localStorage.setItem('hymnSystemStatus', JSON.stringify(status));
    }
}, 30000); // 每30秒保存一次
