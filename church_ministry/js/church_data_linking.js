/**
 * ========================================
 * Church Data Linking Manager
 * 教會數據聯動管理器
 * ========================================
 * 
 * 功能：建立會友和志工數據之間的關聯關係
 * 原則：不修改原始數據庫，使用獨立存儲
 * 版本：v1.0
 * 創建：2025-10-10
 */

(function(window) {
    'use strict';

    /**
     * 數據聯動管理器
     * 使用獨立的localStorage空間，不影響原有數據庫
     */
    class ChurchDataLinking {
        constructor(options = {}) {
            this.storageKey = options.storageKey || 'church_data_linking';
            this.version = '1.0';
            
            // 初始化聯動數據
            this.linkingData = this.loadLinkingData();
            
            console.log('✅ Church Data Linking Manager 已初始化');
            console.log('   版本:', this.version);
            console.log('   存儲鍵:', this.storageKey);
            console.log('   現有關聯:', Object.keys(this.linkingData.links || {}).length);
        }

        /**
         * 從localStorage加載聯動數據
         */
        loadLinkingData() {
            try {
                const data = localStorage.getItem(this.storageKey);
                if (data) {
                    const parsed = JSON.parse(data);
                    console.log('📥 加載已有聯動數據:', Object.keys(parsed.links || {}).length, '條關聯');
                    return parsed;
                }
            } catch (error) {
                console.warn('⚠️  加載聯動數據失敗:', error.message);
            }
            
            // 返回默認結構
            return {
                version: this.version,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                links: {},        // 關聯關係
                metadata: {}      // 元數據
            };
        }

        /**
         * 保存聯動數據到localStorage
         */
        saveLinkingData() {
            try {
                this.linkingData.updatedAt = new Date().toISOString();
                localStorage.setItem(this.storageKey, JSON.stringify(this.linkingData));
                console.log('💾 聯動數據已保存');
                return true;
            } catch (error) {
                console.error('❌ 保存聯動數據失敗:', error.message);
                return false;
            }
        }

        /**
         * 建立會友和志工的關聯
         * @param {number} memberId - 會友ID
         * @param {number} volunteerId - 志工ID
         * @param {object} metadata - 可選的元數據
         */
        linkMemberToVolunteer(memberId, volunteerId, metadata = {}) {
            const linkKey = `member_${memberId}`;
            
            if (!this.linkingData.links[linkKey]) {
                this.linkingData.links[linkKey] = {
                    memberId: memberId,
                    volunteerIds: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
            
            // 添加志工ID（避免重複）
            if (!this.linkingData.links[linkKey].volunteerIds.includes(volunteerId)) {
                this.linkingData.links[linkKey].volunteerIds.push(volunteerId);
                this.linkingData.links[linkKey].updatedAt = new Date().toISOString();
                
                // 保存元數據
                if (Object.keys(metadata).length > 0) {
                    this.linkingData.links[linkKey].metadata = metadata;
                }
                
                this.saveLinkingData();
                console.log(`✅ 已建立關聯: 會友#${memberId} ↔ 志工#${volunteerId}`);
                return true;
            }
            
            console.log(`⚠️  關聯已存在: 會友#${memberId} ↔ 志工#${volunteerId}`);
            return false;
        }

        /**
         * 移除會友和志工的關聯
         * @param {number} memberId - 會友ID
         * @param {number} volunteerId - 志工ID（可選，不提供則移除所有關聯）
         */
        unlinkMemberFromVolunteer(memberId, volunteerId = null) {
            const linkKey = `member_${memberId}`;
            
            if (!this.linkingData.links[linkKey]) {
                console.log(`⚠️  沒有找到會友#${memberId}的關聯`);
                return false;
            }
            
            if (volunteerId === null) {
                // 移除所有關聯
                delete this.linkingData.links[linkKey];
                this.saveLinkingData();
                console.log(`✅ 已移除會友#${memberId}的所有關聯`);
                return true;
            } else {
                // 移除特定志工關聯
                const index = this.linkingData.links[linkKey].volunteerIds.indexOf(volunteerId);
                if (index > -1) {
                    this.linkingData.links[linkKey].volunteerIds.splice(index, 1);
                    this.linkingData.links[linkKey].updatedAt = new Date().toISOString();
                    
                    // 如果沒有任何志工關聯了，刪除整個記錄
                    if (this.linkingData.links[linkKey].volunteerIds.length === 0) {
                        delete this.linkingData.links[linkKey];
                    }
                    
                    this.saveLinkingData();
                    console.log(`✅ 已移除關聯: 會友#${memberId} ↔ 志工#${volunteerId}`);
                    return true;
                }
            }
            
            return false;
        }

        /**
         * 獲取會友的完整檔案（合併會友和志工信息）
         * @param {number} memberId - 會友ID
         * @param {object} db - 數據庫實例
         * @returns {object} 完整檔案
         */
        getFullProfile(memberId, db) {
            if (!db || !db.select) {
                console.error('❌ 需要提供有效的數據庫實例');
                return null;
            }
            
            // 獲取會友基本信息（從原始數據庫）
            const members = db.select('members', { id: memberId });
            if (!members || members.length === 0) {
                console.warn(`⚠️  找不到會友#${memberId}`);
                return null;
            }
            
            const member = members[0];
            const linkKey = `member_${memberId}`;
            
            // 構建完整檔案
            const profile = {
                ...member,
                isVolunteer: false,
                volunteerInfo: null,
                linkedAt: null,
                metadata: null
            };
            
            // 查找關聯信息
            if (this.linkingData.links[linkKey]) {
                const link = this.linkingData.links[linkKey];
                profile.isVolunteer = link.volunteerIds.length > 0;
                profile.linkedAt = link.updatedAt;
                profile.metadata = link.metadata || null;
                
                // 獲取志工詳細信息
                if (link.volunteerIds.length > 0) {
                    profile.volunteerInfo = [];
                    link.volunteerIds.forEach(volunteerId => {
                        const volunteers = db.select('volunteers', { id: volunteerId });
                        if (volunteers && volunteers.length > 0) {
                            profile.volunteerInfo.push(volunteers[0]);
                        }
                    });
                }
            }
            
            return profile;
        }

        /**
         * 獲取所有會友-志工關聯列表
         * @returns {array} 關聯列表
         */
        getAllLinks() {
            const links = [];
            
            for (const [key, value] of Object.entries(this.linkingData.links)) {
                links.push({
                    memberId: value.memberId,
                    volunteerIds: value.volunteerIds,
                    volunteerCount: value.volunteerIds.length,
                    createdAt: value.createdAt,
                    updatedAt: value.updatedAt,
                    metadata: value.metadata
                });
            }
            
            return links;
        }

        /**
         * 智能匹配：根據姓名和電話自動建立關聯
         * @param {object} db - 數據庫實例
         * @returns {object} 匹配結果統計
         */
        autoMatchByNameAndPhone(db) {
            if (!db || !db.select) {
                console.error('❌ 需要提供有效的數據庫實例');
                return null;
            }
            
            console.log('🔍 開始智能匹配...');
            
            const members = db.select('members');
            const volunteers = db.select('volunteers');
            
            const stats = {
                totalMembers: members.length,
                totalVolunteers: volunteers.length,
                matched: 0,
                alreadyLinked: 0,
                newLinks: 0
            };
            
            members.forEach(member => {
                // 查找同名或同電話的志工
                const matchedVolunteers = volunteers.filter(volunteer => 
                    volunteer.name === member.name || 
                    (volunteer.phone && member.phone && volunteer.phone === member.phone)
                );
                
                if (matchedVolunteers.length > 0) {
                    stats.matched++;
                    matchedVolunteers.forEach(volunteer => {
                        const isNew = this.linkMemberToVolunteer(member.id, volunteer.id, {
                            matchMethod: 'auto',
                            matchedBy: volunteer.name === member.name ? 'name' : 'phone',
                            matchedAt: new Date().toISOString()
                        });
                        
                        if (isNew) {
                            stats.newLinks++;
                        } else {
                            stats.alreadyLinked++;
                        }
                    });
                }
            });
            
            console.log('✅ 智能匹配完成:');
            console.log('   總會友數:', stats.totalMembers);
            console.log('   總志工數:', stats.totalVolunteers);
            console.log('   匹配到:', stats.matched);
            console.log('   新建關聯:', stats.newLinks);
            console.log('   已存在:', stats.alreadyLinked);
            
            return stats;
        }

        /**
         * 獲取統計信息
         * @returns {object} 統計數據
         */
        getStatistics() {
            const stats = {
                version: this.version,
                totalLinks: Object.keys(this.linkingData.links).length,
                createdAt: this.linkingData.createdAt,
                updatedAt: this.linkingData.updatedAt
            };
            
            // 計算志工關聯數量分佈
            const volunteerCounts = {};
            for (const link of Object.values(this.linkingData.links)) {
                const count = link.volunteerIds.length;
                volunteerCounts[count] = (volunteerCounts[count] || 0) + 1;
            }
            stats.volunteerCountDistribution = volunteerCounts;
            
            return stats;
        }

        /**
         * 導出聯動數據
         * @returns {string} JSON字符串
         */
        exportData() {
            return JSON.stringify(this.linkingData, null, 2);
        }

        /**
         * 導入聯動數據
         * @param {string} jsonData - JSON字符串
         * @returns {boolean} 成功/失敗
         */
        importData(jsonData) {
            try {
                const data = JSON.parse(jsonData);
                
                // 驗證數據格式
                if (!data.version || !data.links) {
                    console.error('❌ 無效的數據格式');
                    return false;
                }
                
                // 備份當前數據
                const backup = this.exportData();
                localStorage.setItem(this.storageKey + '_backup_' + Date.now(), backup);
                
                // 導入新數據
                this.linkingData = data;
                this.saveLinkingData();
                
                console.log('✅ 數據導入成功');
                console.log('   版本:', data.version);
                console.log('   關聯數:', Object.keys(data.links).length);
                
                return true;
            } catch (error) {
                console.error('❌ 數據導入失敗:', error.message);
                return false;
            }
        }

        /**
         * 清除所有聯動數據
         * @param {boolean} confirm - 確認刪除
         */
        clearAllData(confirm = false) {
            if (!confirm) {
                console.warn('⚠️  需要確認刪除。調用 clearAllData(true) 確認。');
                return false;
            }
            
            // 備份當前數據
            const backup = this.exportData();
            localStorage.setItem(this.storageKey + '_backup_before_clear_' + Date.now(), backup);
            
            // 清除數據
            this.linkingData = {
                version: this.version,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                links: {},
                metadata: {}
            };
            
            this.saveLinkingData();
            console.log('✅ 所有聯動數據已清除（已創建備份）');
            return true;
        }
    }

    // 導出到全局
    window.ChurchDataLinking = ChurchDataLinking;
    
    // 創建默認實例
    window.churchDataLinking = new ChurchDataLinking();
    
    console.log('📦 Church Data Linking 模塊已加載');

})(window);

