/**
 * ========================================
 * Church Core Systems Data Linking
 * 教会核心系统数据联动
 * ========================================
 * 
 * 功能：实现6大核心系统的数据互联
 * 理念：一个父资料库（会友），多个子系统通过关键欄位（memberId）互联互动
 * 版本：v1.0
 * 创建：2025-10-11
 * 基于：visitation.html 标准
 */

(function(window) {
    'use strict';

    /**
     * 核心系统数据联动管理器
     */
    class ChurchCoreLinking {
        constructor() {
            this.systems = {
                member: 'memberSystemData',         // 会友系统（父）
                worship: 'worshipSystemData',       // 敬拜系统（子）
                smallGroups: 'smallGroupsSystemData', // 小组系统（子）
                volunteer: 'volunteerSystemData',   // 志工系统（子）
                education: 'educationSystemData',   // 教育系统（子）
                finance: 'financeSystemData'        // 财务系统（子）
            };
            
            console.log('✅ Church Core Systems Data Linking 已初始化');
            console.log('   核心理念：一个父资料库，多个子系统通过 memberId 互联');
        }

        /**
         * 从localStorage加载指定系统数据
         * @param {string} systemName - 系统名称 (member, worship, etc.)
         * @returns {object} 系统数据
         */
        loadSystem(systemName) {
            const storageKey = this.systems[systemName];
            if (!storageKey) {
                console.error(`❌ 未知系统：${systemName}`);
                return null;
            }
            
            try {
                const data = localStorage.getItem(storageKey);
                if (data) {
                    return JSON.parse(data);
                }
            } catch (e) {
                console.error(`❌ 加载 ${systemName} 数据失败:`, e);
            }
            
            return null;
        }

        /**
         * 保存系统数据到localStorage
         * @param {string} systemName - 系统名称
         * @param {object} data - 数据对象
         * @returns {boolean} 是否成功
         */
        saveSystem(systemName, data) {
            const storageKey = this.systems[systemName];
            if (!storageKey) {
                console.error(`❌ 未知系统：${systemName}`);
                return false;
            }
            
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
                console.log(`💾 ${systemName} 数据已保存`);
                return true;
            } catch (e) {
                console.error(`❌ 保存 ${systemName} 数据失败:`, e);
                return false;
            }
        }

        /**
         * 获取会友的完整档案（跨系统关联）
         * @param {number} memberId - 会友ID
         * @returns {object} 完整档案
         */
        getMemberFullProfile(memberId) {
            const profile = {
                memberId: memberId,
                basicInfo: null,
                groups: [],
                ministries: [],
                worshipTeams: [],
                children: [],
                trainings: [],
                donations: []
            };
            
            // 1. 会友基本信息
            const memberData = this.loadSystem('member');
            if (memberData) {
                profile.basicInfo = memberData.members?.find(m => m.id === memberId);
                
                // 小组归属
                profile.groups = memberData.groupMemberships
                    ?.filter(gm => gm.memberId === memberId)
                    .map(gm => {
                        const group = memberData.groups?.find(g => g.id === gm.groupId);
                        return {
                            groupId: gm.groupId,
                            groupName: group?.name,
                            role: gm.role,
                            joinDate: gm.joinDate
                        };
                    }) || [];
                
                // 培训记录
                profile.trainings = memberData.trainings
                    ?.filter(t => t.memberId === memberId) || [];
            }
            
            // 2. 敬拜团队
            const worshipData = this.loadSystem('worship');
            if (worshipData) {
                profile.worshipTeams = worshipData.teamMembers
                    ?.filter(tm => tm.memberId === memberId)
                    .map(tm => {
                        const team = worshipData.teams?.find(t => t.id === tm.teamId);
                        return {
                            teamId: tm.teamId,
                            teamName: team?.name,
                            position: tm.position,
                            instrument: tm.instrument
                        };
                    }) || [];
            }
            
            // 3. 小组参与
            const groupData = this.loadSystem('smallGroups');
            if (groupData) {
                const groupMemberships = groupData.groupMembers
                    ?.filter(gm => gm.memberId === memberId) || [];
                // 合并到 profile.groups（如果还没有）
            }
            
            // 4. 志工事工
            const volunteerData = this.loadSystem('volunteer');
            if (volunteerData) {
                profile.ministries = volunteerData.assignments
                    ?.filter(a => a.memberId === memberId)
                    .map(a => {
                        const ministry = volunteerData.ministries?.find(m => m.id === a.ministryId);
                        return {
                            ministryId: a.ministryId,
                            ministryName: ministry?.name,
                            position: a.position,
                            performance: a.performance
                        };
                    }) || [];
            }
            
            // 5. 教育事工（子女信息）
            const educationData = this.loadSystem('education');
            if (educationData) {
                profile.children = educationData.students
                    ?.filter(s => s.parentMemberId === memberId)
                    .map(s => {
                        const cls = educationData.classes?.find(c => c.id === s.classId);
                        return {
                            studentId: s.id,
                            studentName: s.name,
                            age: s.age,
                            className: cls?.name
                        };
                    }) || [];
            }
            
            // 6. 财务记录（奉献）
            const financeData = this.loadSystem('finance');
            if (financeData) {
                profile.donations = financeData.transactions
                    ?.filter(t => t.type === 'income' && t.memberId === memberId)
                    .map(t => ({
                        date: t.date,
                        amount: t.amount,
                        category: t.categoryName
                    })) || [];
            }
            
            return profile;
        }

        /**
         * 获取所有系统的统计摘要
         * @returns {object} 统计摘要
         */
        getGlobalStatistics() {
            const stats = {
                totalMembers: 0,
                activeMembers: 0,
                inGroups: 0,
                inMinistry: 0,
                inWorship: 0,
                students: 0,
                totalDonations: 0,
                systems: {}
            };
            
            // 会友系统
            const memberData = this.loadSystem('member');
            if (memberData) {
                stats.totalMembers = memberData.members?.length || 0;
                stats.activeMembers = memberData.members?.filter(m => m.status === 'active').length || 0;
                stats.systems.member = {
                    members: stats.totalMembers,
                    groups: memberData.groups?.length || 0,
                    ministries: memberData.ministries?.length || 0
                };
            }
            
            // 敬拜系统
            const worshipData = this.loadSystem('worship');
            if (worshipData) {
                stats.inWorship = [...new Set(worshipData.teamMembers?.map(tm => tm.memberId))].length || 0;
                stats.systems.worship = {
                    teams: worshipData.teams?.length || 0,
                    members: worshipData.teamMembers?.length || 0,
                    services: worshipData.services?.length || 0
                };
            }
            
            // 小组系统
            const groupData = this.loadSystem('smallGroups');
            if (groupData) {
                stats.inGroups = [...new Set(groupData.groupMembers?.map(gm => gm.memberId))].length || 0;
                stats.systems.smallGroups = {
                    groups: groupData.groups?.length || 0,
                    members: groupData.groupMembers?.length || 0,
                    meetings: groupData.meetings?.length || 0
                };
            }
            
            // 志工系统
            const volunteerData = this.loadSystem('volunteer');
            if (volunteerData) {
                stats.inMinistry = [...new Set(volunteerData.assignments?.map(a => a.memberId))].length || 0;
                stats.systems.volunteer = {
                    ministries: volunteerData.ministries?.length || 0,
                    assignments: volunteerData.assignments?.length || 0
                };
            }
            
            // 教育系统
            const educationData = this.loadSystem('education');
            if (educationData) {
                stats.students = educationData.students?.length || 0;
                stats.systems.education = {
                    classes: educationData.classes?.length || 0,
                    students: stats.students,
                    teachers: educationData.teachers?.length || 0
                };
            }
            
            // 财务系统
            const financeData = this.loadSystem('finance');
            if (financeData) {
                stats.totalDonations = financeData.transactions
                    ?.filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0) || 0;
                stats.systems.finance = {
                    budgets: financeData.budgets?.length || 0,
                    transactions: financeData.transactions?.length || 0,
                    totalIncome: stats.totalDonations
                };
            }
            
            return stats;
        }

        /**
         * 验证数据完整性（检查孤立记录）
         * @returns {object} 验证结果
         */
        validateDataIntegrity() {
            const issues = {
                orphanRecords: [],
                missingLinks: [],
                warnings: []
            };
            
            const memberData = this.loadSystem('member');
            if (!memberData || !memberData.members) {
                issues.warnings.push('会友系统数据为空，这是所有系统的基础！');
                return issues;
            }
            
            const memberIds = memberData.members.map(m => m.id);
            
            // 检查敬拜系统
            const worshipData = this.loadSystem('worship');
            if (worshipData && worshipData.teamMembers) {
                worshipData.teamMembers.forEach(tm => {
                    if (!memberIds.includes(tm.memberId)) {
                        issues.orphanRecords.push({
                            system: 'worship',
                            record: `团队成员 ${tm.memberName} (ID: ${tm.memberId})`,
                            issue: '关联的会友ID不存在'
                        });
                    }
                });
            }
            
            // 检查小组系统
            const groupData = this.loadSystem('smallGroups');
            if (groupData && groupData.groupMembers) {
                groupData.groupMembers.forEach(gm => {
                    if (!memberIds.includes(gm.memberId)) {
                        issues.orphanRecords.push({
                            system: 'smallGroups',
                            record: `小组成员 ${gm.memberName} (ID: ${gm.memberId})`,
                            issue: '关联的会友ID不存在'
                        });
                    }
                });
            }
            
            // 检查志工系统
            const volunteerData = this.loadSystem('volunteer');
            if (volunteerData && volunteerData.assignments) {
                volunteerData.assignments.forEach(a => {
                    if (!memberIds.includes(a.memberId)) {
                        issues.orphanRecords.push({
                            system: 'volunteer',
                            record: `志工分配 ${a.memberName} (ID: ${a.memberId})`,
                            issue: '关联的会友ID不存在'
                        });
                    }
                });
            }
            
            // 检查教育系统
            const educationData = this.loadSystem('education');
            if (educationData) {
                if (educationData.teachers) {
                    educationData.teachers.forEach(t => {
                        if (!memberIds.includes(t.memberId)) {
                            issues.orphanRecords.push({
                                system: 'education',
                                record: `教师 ${t.memberName} (ID: ${t.memberId})`,
                                issue: '关联的会友ID不存在'
                            });
                        }
                    });
                }
                
                if (educationData.students) {
                    educationData.students.forEach(s => {
                        if (s.parentMemberId && !memberIds.includes(s.parentMemberId)) {
                            issues.missingLinks.push({
                                system: 'education',
                                record: `学生 ${s.name} (家长ID: ${s.parentMemberId})`,
                                issue: '家长会友ID不存在'
                            });
                        }
                    });
                }
            }
            
            // 检查财务系统
            const financeData = this.loadSystem('finance');
            if (financeData && financeData.transactions) {
                financeData.transactions.forEach(t => {
                    if (t.memberId && !memberIds.includes(t.memberId)) {
                        issues.missingLinks.push({
                            system: 'finance',
                            record: `奉献记录 ${t.description} (会友ID: ${t.memberId})`,
                            issue: '奉献者会友ID不存在'
                        });
                    }
                });
            }
            
            return issues;
        }

        /**
         * 同步会友信息到所有子系统
         * @param {number} memberId - 会友ID
         * @param {object} updates - 更新的字段
         */
        syncMemberInfoToAllSystems(memberId, updates) {
            const systems = ['worship', 'smallGroups', 'volunteer', 'education'];
            let synced = 0;
            
            systems.forEach(systemName => {
                const data = this.loadSystem(systemName);
                if (!data) return;
                
                let updated = false;
                
                // 根据不同系统更新对应字段
                if (systemName === 'worship' && data.teamMembers) {
                    data.teamMembers.forEach(tm => {
                        if (tm.memberId === memberId && updates.name) {
                            tm.memberName = updates.name;
                            updated = true;
                        }
                    });
                }
                
                if (systemName === 'smallGroups' && data.groupMembers) {
                    data.groupMembers.forEach(gm => {
                        if (gm.memberId === memberId && updates.name) {
                            gm.memberName = updates.name;
                            updated = true;
                        }
                    });
                }
                
                if (systemName === 'volunteer' && data.assignments) {
                    data.assignments.forEach(a => {
                        if (a.memberId === memberId && updates.name) {
                            a.memberName = updates.name;
                            updated = true;
                        }
                    });
                }
                
                if (systemName === 'education' && data.teachers) {
                    data.teachers.forEach(t => {
                        if (t.memberId === memberId && updates.name) {
                            t.memberName = updates.name;
                            updated = true;
                        }
                    });
                }
                
                if (updated) {
                    this.saveSystem(systemName, data);
                    synced++;
                }
            });
            
            console.log(`✅ 同步会友信息到 ${synced} 个系统`);
            return synced;
        }

        /**
         * 删除会友时清理所有关联数据
         * @param {number} memberId - 会友ID
         * @returns {object} 清理统计
         */
        cascadeDeleteMember(memberId) {
            const deleted = {
                member: false,
                worship: 0,
                smallGroups: 0,
                volunteer: 0,
                education: 0,
                finance: 0
            };
            
            // 1. 会友系统
            const memberData = this.loadSystem('member');
            if (memberData) {
                memberData.members = memberData.members?.filter(m => m.id !== memberId) || [];
                memberData.groupMemberships = memberData.groupMemberships?.filter(gm => gm.memberId !== memberId) || [];
                memberData.ministryAssignments = memberData.ministryAssignments?.filter(ma => ma.memberId !== memberId) || [];
                memberData.trainings = memberData.trainings?.filter(t => t.memberId !== memberId) || [];
                memberData.attendance = memberData.attendance?.filter(a => a.memberId !== memberId) || [];
                this.saveSystem('member', memberData);
                deleted.member = true;
            }
            
            // 2. 敬拜系统
            const worshipData = this.loadSystem('worship');
            if (worshipData) {
                const before = worshipData.teamMembers?.length || 0;
                worshipData.teamMembers = worshipData.teamMembers?.filter(tm => tm.memberId !== memberId) || [];
                worshipData.serviceRecords = worshipData.serviceRecords?.filter(sr => sr.memberId !== memberId) || [];
                deleted.worship = before - (worshipData.teamMembers?.length || 0);
                this.saveSystem('worship', worshipData);
            }
            
            // 3. 小组系统
            const groupData = this.loadSystem('smallGroups');
            if (groupData) {
                const before = groupData.groupMembers?.length || 0;
                groupData.groupMembers = groupData.groupMembers?.filter(gm => gm.memberId !== memberId) || [];
                deleted.smallGroups = before - (groupData.groupMembers?.length || 0);
                this.saveSystem('smallGroups', groupData);
            }
            
            // 4. 志工系统
            const volunteerData = this.loadSystem('volunteer');
            if (volunteerData) {
                const before = volunteerData.assignments?.length || 0;
                volunteerData.assignments = volunteerData.assignments?.filter(a => a.memberId !== memberId) || [];
                volunteerData.schedules = volunteerData.schedules?.filter(s => s.memberId !== memberId) || [];
                volunteerData.serviceHours = volunteerData.serviceHours?.filter(sh => sh.memberId !== memberId) || [];
                deleted.volunteer = before - (volunteerData.assignments?.length || 0);
                this.saveSystem('volunteer', volunteerData);
            }
            
            // 5. 教育系统（作为家长）
            const educationData = this.loadSystem('education');
            if (educationData) {
                const beforeStudents = educationData.students?.length || 0;
                educationData.students = educationData.students?.filter(s => s.parentMemberId !== memberId) || [];
                const beforeTeachers = educationData.teachers?.length || 0;
                educationData.teachers = educationData.teachers?.filter(t => t.memberId !== memberId) || [];
                deleted.education = (beforeStudents - (educationData.students?.length || 0)) + 
                                   (beforeTeachers - (educationData.teachers?.length || 0));
                this.saveSystem('education', educationData);
            }
            
            // 6. 财务系统（匿名化奉献记录，不删除）
            const financeData = this.loadSystem('finance');
            if (financeData && financeData.transactions) {
                financeData.transactions.forEach(t => {
                    if (t.memberId === memberId) {
                        t.memberId = null;  // 匿名化
                        t.handler = '匿名';
                        deleted.finance++;
                    }
                });
                this.saveSystem('finance', financeData);
            }
            
            console.log('✅ 级联删除完成:', deleted);
            return deleted;
        }

        /**
         * 导出所有系统数据（用于备份）
         * @returns {object} 所有系统数据
         */
        exportAllSystems() {
            const allData = {};
            
            Object.keys(this.systems).forEach(systemName => {
                allData[systemName] = this.loadSystem(systemName);
            });
            
            return {
                exportDate: new Date().toISOString(),
                version: '1.0',
                systems: allData
            };
        }

        /**
         * 导入所有系统数据（用于恢复）
         * @param {object} backupData - 备份数据
         * @returns {boolean} 是否成功
         */
        importAllSystems(backupData) {
            if (!backupData || !backupData.systems) {
                console.error('❌ 无效的备份数据');
                return false;
            }
            
            try {
                Object.keys(backupData.systems).forEach(systemName => {
                    if (backupData.systems[systemName]) {
                        this.saveSystem(systemName, backupData.systems[systemName]);
                    }
                });
                
                console.log('✅ 所有系统数据导入成功');
                return true;
            } catch (e) {
                console.error('❌ 导入数据失败:', e);
                return false;
            }
        }

        /**
         * 清空所有系统数据（危险操作）
         * @param {boolean} confirm - 是否确认
         * @returns {boolean} 是否成功
         */
        clearAllSystems(confirm = false) {
            if (!confirm) {
                console.error('❌ 未确认，操作取消');
                return false;
            }
            
            Object.keys(this.systems).forEach(systemName => {
                localStorage.removeItem(this.systems[systemName]);
            });
            
            console.log('⚠️ 所有系统数据已清空');
            return true;
        }

        /**
         * 生成数据互联报告
         * @returns {object} 互联报告
         */
        generateLinkingReport() {
            const report = {
                timestamp: new Date().toISOString(),
                summary: this.getGlobalStatistics(),
                integrity: this.validateDataIntegrity(),
                recommendations: []
            };
            
            // 分析并给出建议
            if (report.summary.totalMembers === 0) {
                report.recommendations.push('建议先在会友系统中添加会友数据，这是所有系统的基础');
            }
            
            if (report.summary.inGroups < report.summary.activeMembers * 0.5) {
                report.recommendations.push('小组覆盖率偏低，建议加强小组事工');
            }
            
            if (report.summary.inMinistry < report.summary.activeMembers * 0.3) {
                report.recommendations.push('志工参与率偏低，建议动员更多会友参与服事');
            }
            
            if (report.integrity.orphanRecords.length > 0) {
                report.recommendations.push(`发现 ${report.integrity.orphanRecords.length} 条孤立记录，建议清理数据`);
            }
            
            return report;
        }
    }

    // ========================================
    // 创建全局实例
    // ========================================
    window.ChurchCoreLinking = ChurchCoreLinking;
    window.churchCoreLinking = new ChurchCoreLinking();
    
    console.log('🎉 Church Core Systems Data Linking Ready!');
    console.log('   使用方法：window.churchCoreLinking.getMemberFullProfile(memberId)');
    
})(window);

















