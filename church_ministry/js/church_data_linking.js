/**
 * ========================================
 * Church Data Linking Manager
 * 教会数据联动管理器
 * ========================================
 * 
 * 功能：建立会友和志工数据之间的关联关系
 * 原则：不修改原始数据库，使用独立存储
 * 版本：v1.0
 * 创建：2025-10-10
 */

(function(window) {
    'use strict';

    /**
     * 数据联动管理器
     * 使用独立的localStorage空间，不影响原有数据库
     */
    class ChurchDataLinking {
        constructor(options = {}) {
            this.storageKey = options.storageKey || 'church_data_linking';
            this.version = '1.0';
            
            // 初始化联动数据
            this.linkingData = this.loadLinkingData();
            
            console.log('✅ Church Data Linking Manager 已初始化');
            console.log('   版本:', this.version);
            console.log('   存储键:', this.storageKey);
            console.log('   现有关联:', Object.keys(this.linkingData.links || {}).length);
        }

        /**
         * 从localStorage加载联动数据
         */
        loadLinkingData() {
            try {
                const data = localStorage.getItem(this.storageKey);
                if (data) {
                    const parsed = JSON.parse(data);
                    console.log('📥 加载已有联动数据:', Object.keys(parsed.links || {}).length, '条关联');
                    return parsed;
                }
            } catch (error) {
                console.warn('⚠️  加载联动数据失败:', error.message);
            }
            
            // 返回默认结构
            return {
                version: this.version,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                links: {},        // 关联关系
                metadata: {}      // 元数据
            };
        }

        /**
         * 保存联动数据到localStorage
         */
        saveLinkingData() {
            try {
                this.linkingData.updatedAt = new Date().toISOString();
                localStorage.setItem(this.storageKey, JSON.stringify(this.linkingData));
                console.log('💾 联动数据已保存');
                return true;
            } catch (error) {
                console.error('❌ 保存联动数据失败:', error.message);
                return false;
            }
        }

        /**
         * 建立会友和志工的关联
         * @param {number} memberId - 会友ID
         * @param {number} volunteerId - 志工ID
         * @param {object} metadata - 可选的元数据
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
            
            // 添加志工ID（避免重复）
            if (!this.linkingData.links[linkKey].volunteerIds.includes(volunteerId)) {
                this.linkingData.links[linkKey].volunteerIds.push(volunteerId);
                this.linkingData.links[linkKey].updatedAt = new Date().toISOString();
                
                // 保存元数据
                if (Object.keys(metadata).length > 0) {
                    this.linkingData.links[linkKey].metadata = metadata;
                }
                
                this.saveLinkingData();
                console.log(`✅ 已建立关联: 会友#${memberId} ↔ 志工#${volunteerId}`);
                return true;
            }
            
            console.log(`⚠️  关联已存在: 会友#${memberId} ↔ 志工#${volunteerId}`);
            return false;
        }

        /**
         * 移除会友和志工的关联
         * @param {number} memberId - 会友ID
         * @param {number} volunteerId - 志工ID（可选，不提供则移除所有关联）
         */
        unlinkMemberFromVolunteer(memberId, volunteerId = null) {
            const linkKey = `member_${memberId}`;
            
            if (!this.linkingData.links[linkKey]) {
                console.log(`⚠️  没有找到会友#${memberId}的关联`);
                return false;
            }
            
            if (volunteerId === null) {
                // 移除所有关联
                delete this.linkingData.links[linkKey];
                this.saveLinkingData();
                console.log(`✅ 已移除会友#${memberId}的所有关联`);
                return true;
            } else {
                // 移除特定志工关联
                const index = this.linkingData.links[linkKey].volunteerIds.indexOf(volunteerId);
                if (index > -1) {
                    this.linkingData.links[linkKey].volunteerIds.splice(index, 1);
                    this.linkingData.links[linkKey].updatedAt = new Date().toISOString();
                    
                    // 如果没有任何志工关联了，删除整个记录
                    if (this.linkingData.links[linkKey].volunteerIds.length === 0) {
                        delete this.linkingData.links[linkKey];
                    }
                    
                    this.saveLinkingData();
                    console.log(`✅ 已移除关联: 会友#${memberId} ↔ 志工#${volunteerId}`);
                    return true;
                }
            }
            
            return false;
        }

        /**
         * 获取会友的完整档案（合并会友和志工信息）
         * @param {number} memberId - 会友ID
         * @param {object} db - 数据库实例
         * @returns {object} 完整档案
         */
        getFullProfile(memberId, db) {
            if (!db || !db.select) {
                console.error('❌ 需要提供有效的数据库实例');
                return null;
            }
            
            // 获取会友基本信息（从原始数据库）
            const members = db.select('members', { id: memberId });
            if (!members || members.length === 0) {
                console.warn(`⚠️  找不到会友#${memberId}`);
                return null;
            }
            
            const member = members[0];
            const linkKey = `member_${memberId}`;
            
            // 构建完整档案
            const profile = {
                ...member,
                isVolunteer: false,
                volunteerInfo: null,
                linkedAt: null,
                metadata: null
            };
            
            // 查找关联信息
            if (this.linkingData.links[linkKey]) {
                const link = this.linkingData.links[linkKey];
                profile.isVolunteer = link.volunteerIds.length > 0;
                profile.linkedAt = link.updatedAt;
                profile.metadata = link.metadata || null;
                
                // 获取志工详细信息
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
         * 获取所有会友-志工关联列表
         * @returns {array} 关联列表
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
         * 智能匹配：根据姓名和电话自动建立关联
         * @param {object} db - 数据库实例
         * @returns {object} 匹配结果统计
         */
        autoMatchByNameAndPhone(db) {
            if (!db || !db.select) {
                console.error('❌ 需要提供有效的数据库实例');
                return null;
            }
            
            console.log('🔍 开始智能匹配...');
            
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
                // 查找同名或同电话的志工
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
            console.log('   总会友数:', stats.totalMembers);
            console.log('   总志工数:', stats.totalVolunteers);
            console.log('   匹配到:', stats.matched);
            console.log('   新建关联:', stats.newLinks);
            console.log('   已存在:', stats.alreadyLinked);
            
            return stats;
        }

        /**
         * 获取统计信息
         * @returns {object} 统计数据
         */
        getStatistics() {
            const stats = {
                version: this.version,
                totalLinks: Object.keys(this.linkingData.links).length,
                createdAt: this.linkingData.createdAt,
                updatedAt: this.linkingData.updatedAt
            };
            
            // 计算志工关联数量分布
            const volunteerCounts = {};
            for (const link of Object.values(this.linkingData.links)) {
                const count = link.volunteerIds.length;
                volunteerCounts[count] = (volunteerCounts[count] || 0) + 1;
            }
            stats.volunteerCountDistribution = volunteerCounts;
            
            return stats;
        }

        /**
         * 导出联动数据
         * @returns {string} JSON字符串
         */
        exportData() {
            return JSON.stringify(this.linkingData, null, 2);
        }

        /**
         * 导入联动数据
         * @param {string} jsonData - JSON字符串
         * @returns {boolean} 成功/失败
         */
        importData(jsonData) {
            try {
                const data = JSON.parse(jsonData);
                
                // 验证数据格式
                if (!data.version || !data.links) {
                    console.error('❌ 无效的数据格式');
                    return false;
                }
                
                // 备份当前数据
                const backup = this.exportData();
                localStorage.setItem(this.storageKey + '_backup_' + Date.now(), backup);
                
                // 导入新数据
                this.linkingData = data;
                this.saveLinkingData();
                
                console.log('✅ 数据导入成功');
                console.log('   版本:', data.version);
                console.log('   关联数:', Object.keys(data.links).length);
                
                return true;
            } catch (error) {
                console.error('❌ 数据导入失败:', error.message);
                return false;
            }
        }

        /**
         * 清除所有联动数据
         * @param {boolean} confirm - 确认删除
         */
        clearAllData(confirm = false) {
            if (!confirm) {
                console.warn('⚠️  需要确认删除。调用 clearAllData(true) 确认。');
                return false;
            }
            
            // 备份当前数据
            const backup = this.exportData();
            localStorage.setItem(this.storageKey + '_backup_before_clear_' + Date.now(), backup);
            
            // 清除数据
            this.linkingData = {
                version: this.version,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                links: {},
                metadata: {}
            };
            
            this.saveLinkingData();
            console.log('✅ 所有联动数据已清除（已创建备份）');
            return true;
        }
    }

    // 导出到全局
    window.ChurchDataLinking = ChurchDataLinking;
    
    // 创建默认实例
    window.churchDataLinking = new ChurchDataLinking();
    
    console.log('📦 Church Data Linking 模块已加载');

})(window);

