/**
 * ========================================
 * Church Core Systems Data Linking
 * 教會核心系統數據聯動
 * ========================================
 * 
 * 功能：實現6大核心繫統的數據互聯
 * 理念：一個父資料庫（會友），多個子系統通過關鍵欄位（memberId）互聯互動
 * 版本：v1.0
 * 創建：2025-10-11
 * 基於：visitation.html 標準
 */

(function(window) {
    'use strict';

    /**
     * 核心系統數據聯動管理器
     */
    class ChurchCoreLinking {
        constructor() {
            this.systems = {
                member: 'memberSystemData',         // 會友系統（父）
                worship: 'worshipSystemData',       // 敬拜系統（子）
                smallGroups: 'smallGroupsSystemData', // 小組系統（子）
                volunteer: 'volunteerSystemData',   // 志工系統（子）
                education: 'educationSystemData',   // 教育系統（子）
                finance: 'financeSystemData'        // 財務系統（子）
            };
            
            console.log('✅ Church Core Systems Data Linking 已初始化');
            console.log('   核心理念：一個父資料庫，多個子系統通過 memberId 互聯');
        }

        /**
         * 從localStorage加載指定系統數據
         * @param {string} systemName - 系統名稱 (member, worship, etc.)
         * @returns {object} 系統數據
         */
        loadSystem(systemName) {
            const storageKey = this.systems[systemName];
            if (!storageKey) {
                console.error(`❌ 未知系統：${systemName}`);
                return null;
            }
            
            try {
                const data = localStorage.getItem(storageKey);
                if (data) {
                    return JSON.parse(data);
                }
            } catch (e) {
                console.error(`❌ 加載 ${systemName} 數據失敗:`, e);
            }
            
            return null;
        }

        /**
         * 保存系統數據到localStorage
         * @param {string} systemName - 系統名稱
         * @param {object} data - 數據對象
         * @returns {boolean} 是否成功
         */
        saveSystem(systemName, data) {
            const storageKey = this.systems[systemName];
            if (!storageKey) {
                console.error(`❌ 未知系統：${systemName}`);
                return false;
            }
            
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
                console.log(`💾 ${systemName} 數據已保存`);
                return true;
            } catch (e) {
                console.error(`❌ 保存 ${systemName} 數據失敗:`, e);
                return false;
            }
        }

        /**
         * 獲取會友的完整檔案（跨系統關聯）
         * @param {number} memberId - 會友ID
         * @returns {object} 完整檔案
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
            
            // 1. 會友基本信息
            const memberData = this.loadSystem('member');
            if (memberData) {
                profile.basicInfo = memberData.members?.find(m => m.id === memberId);
                
                // 小組歸屬
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
                
                // 培訓記錄
                profile.trainings = memberData.trainings
                    ?.filter(t => t.memberId === memberId) || [];
            }
            
            // 2. 敬拜團隊
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
            
            // 3. 小組參與
            const groupData = this.loadSystem('smallGroups');
            if (groupData) {
                const groupMemberships = groupData.groupMembers
                    ?.filter(gm => gm.memberId === memberId) || [];
                // 合併到 profile.groups（如果還沒有）
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
            
            // 6. 財務記錄（奉獻）
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
         * 獲取所有系統的統計摘要
         * @returns {object} 統計摘要
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
            
            // 會友系統
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
            
            // 敬拜系統
            const worshipData = this.loadSystem('worship');
            if (worshipData) {
                stats.inWorship = [...new Set(worshipData.teamMembers?.map(tm => tm.memberId))].length || 0;
                stats.systems.worship = {
                    teams: worshipData.teams?.length || 0,
                    members: worshipData.teamMembers?.length || 0,
                    services: worshipData.services?.length || 0
                };
            }
            
            // 小組系統
            const groupData = this.loadSystem('smallGroups');
            if (groupData) {
                stats.inGroups = [...new Set(groupData.groupMembers?.map(gm => gm.memberId))].length || 0;
                stats.systems.smallGroups = {
                    groups: groupData.groups?.length || 0,
                    members: groupData.groupMembers?.length || 0,
                    meetings: groupData.meetings?.length || 0
                };
            }
            
            // 志工系統
            const volunteerData = this.loadSystem('volunteer');
            if (volunteerData) {
                stats.inMinistry = [...new Set(volunteerData.assignments?.map(a => a.memberId))].length || 0;
                stats.systems.volunteer = {
                    ministries: volunteerData.ministries?.length || 0,
                    assignments: volunteerData.assignments?.length || 0
                };
            }
            
            // 教育系統
            const educationData = this.loadSystem('education');
            if (educationData) {
                stats.students = educationData.students?.length || 0;
                stats.systems.education = {
                    classes: educationData.classes?.length || 0,
                    students: stats.students,
                    teachers: educationData.teachers?.length || 0
                };
            }
            
            // 財務系統
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
         * 驗證數據完整性（檢查孤立記錄）
         * @returns {object} 驗證結果
         */
        validateDataIntegrity() {
            const issues = {
                orphanRecords: [],
                missingLinks: [],
                warnings: []
            };
            
            const memberData = this.loadSystem('member');
            if (!memberData || !memberData.members) {
                issues.warnings.push('會友系統數據為空，這是所有系統的基礎！');
                return issues;
            }
            
            const memberIds = memberData.members.map(m => m.id);
            
            // 檢查敬拜系統
            const worshipData = this.loadSystem('worship');
            if (worshipData && worshipData.teamMembers) {
                worshipData.teamMembers.forEach(tm => {
                    if (!memberIds.includes(tm.memberId)) {
                        issues.orphanRecords.push({
                            system: 'worship',
                            record: `團隊成員 ${tm.memberName} (ID: ${tm.memberId})`,
                            issue: '關聯的會友ID不存在'
                        });
                    }
                });
            }
            
            // 檢查小組系統
            const groupData = this.loadSystem('smallGroups');
            if (groupData && groupData.groupMembers) {
                groupData.groupMembers.forEach(gm => {
                    if (!memberIds.includes(gm.memberId)) {
                        issues.orphanRecords.push({
                            system: 'smallGroups',
                            record: `小組成員 ${gm.memberName} (ID: ${gm.memberId})`,
                            issue: '關聯的會友ID不存在'
                        });
                    }
                });
            }
            
            // 檢查志工系統
            const volunteerData = this.loadSystem('volunteer');
            if (volunteerData && volunteerData.assignments) {
                volunteerData.assignments.forEach(a => {
                    if (!memberIds.includes(a.memberId)) {
                        issues.orphanRecords.push({
                            system: 'volunteer',
                            record: `志工分配 ${a.memberName} (ID: ${a.memberId})`,
                            issue: '關聯的會友ID不存在'
                        });
                    }
                });
            }
            
            // 檢查教育系統
            const educationData = this.loadSystem('education');
            if (educationData) {
                if (educationData.teachers) {
                    educationData.teachers.forEach(t => {
                        if (!memberIds.includes(t.memberId)) {
                            issues.orphanRecords.push({
                                system: 'education',
                                record: `教師 ${t.memberName} (ID: ${t.memberId})`,
                                issue: '關聯的會友ID不存在'
                            });
                        }
                    });
                }
                
                if (educationData.students) {
                    educationData.students.forEach(s => {
                        if (s.parentMemberId && !memberIds.includes(s.parentMemberId)) {
                            issues.missingLinks.push({
                                system: 'education',
                                record: `學生 ${s.name} (家長ID: ${s.parentMemberId})`,
                                issue: '家長會友ID不存在'
                            });
                        }
                    });
                }
            }
            
            // 檢查財務系統
            const financeData = this.loadSystem('finance');
            if (financeData && financeData.transactions) {
                financeData.transactions.forEach(t => {
                    if (t.memberId && !memberIds.includes(t.memberId)) {
                        issues.missingLinks.push({
                            system: 'finance',
                            record: `奉獻記錄 ${t.description} (會友ID: ${t.memberId})`,
                            issue: '奉獻者會友ID不存在'
                        });
                    }
                });
            }
            
            return issues;
        }

        /**
         * 同步會友信息到所有子系統
         * @param {number} memberId - 會友ID
         * @param {object} updates - 更新的字段
         */
        syncMemberInfoToAllSystems(memberId, updates) {
            const systems = ['worship', 'smallGroups', 'volunteer', 'education'];
            let synced = 0;
            
            systems.forEach(systemName => {
                const data = this.loadSystem(systemName);
                if (!data) return;
                
                let updated = false;
                
                // 根據不同系統更新對應字段
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
            
            console.log(`✅ 同步會友信息到 ${synced} 個系統`);
            return synced;
        }

        /**
         * 刪除會友時清理所有關聯數據
         * @param {number} memberId - 會友ID
         * @returns {object} 清理統計
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
            
            // 1. 會友系統
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
            
            // 2. 敬拜系統
            const worshipData = this.loadSystem('worship');
            if (worshipData) {
                const before = worshipData.teamMembers?.length || 0;
                worshipData.teamMembers = worshipData.teamMembers?.filter(tm => tm.memberId !== memberId) || [];
                worshipData.serviceRecords = worshipData.serviceRecords?.filter(sr => sr.memberId !== memberId) || [];
                deleted.worship = before - (worshipData.teamMembers?.length || 0);
                this.saveSystem('worship', worshipData);
            }
            
            // 3. 小組系統
            const groupData = this.loadSystem('smallGroups');
            if (groupData) {
                const before = groupData.groupMembers?.length || 0;
                groupData.groupMembers = groupData.groupMembers?.filter(gm => gm.memberId !== memberId) || [];
                deleted.smallGroups = before - (groupData.groupMembers?.length || 0);
                this.saveSystem('smallGroups', groupData);
            }
            
            // 4. 志工系統
            const volunteerData = this.loadSystem('volunteer');
            if (volunteerData) {
                const before = volunteerData.assignments?.length || 0;
                volunteerData.assignments = volunteerData.assignments?.filter(a => a.memberId !== memberId) || [];
                volunteerData.schedules = volunteerData.schedules?.filter(s => s.memberId !== memberId) || [];
                volunteerData.serviceHours = volunteerData.serviceHours?.filter(sh => sh.memberId !== memberId) || [];
                deleted.volunteer = before - (volunteerData.assignments?.length || 0);
                this.saveSystem('volunteer', volunteerData);
            }
            
            // 5. 教育系統（作為家長）
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
            
            // 6. 財務系統（匿名化奉獻記錄，不刪除）
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
            
            console.log('✅ 級聯刪除完成:', deleted);
            return deleted;
        }

        /**
         * 導出所有系統數據（用於備份）
         * @returns {object} 所有系統數據
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
         * 導入所有系統數據（用於恢復）
         * @param {object} backupData - 備份數據
         * @returns {boolean} 是否成功
         */
        importAllSystems(backupData) {
            if (!backupData || !backupData.systems) {
                console.error('❌ 無效的備份數據');
                return false;
            }
            
            try {
                Object.keys(backupData.systems).forEach(systemName => {
                    if (backupData.systems[systemName]) {
                        this.saveSystem(systemName, backupData.systems[systemName]);
                    }
                });
                
                console.log('✅ 所有系統數據導入成功');
                return true;
            } catch (e) {
                console.error('❌ 導入數據失敗:', e);
                return false;
            }
        }

        /**
         * 清空所有系統數據（危險操作）
         * @param {boolean} confirm - 是否確認
         * @returns {boolean} 是否成功
         */
        clearAllSystems(confirm = false) {
            if (!confirm) {
                console.error('❌ 未確認，操作取消');
                return false;
            }
            
            Object.keys(this.systems).forEach(systemName => {
                localStorage.removeItem(this.systems[systemName]);
            });
            
            console.log('⚠️ 所有系統數據已清空');
            return true;
        }

        /**
         * 生成數據互聯報告
         * @returns {object} 互聯報告
         */
        generateLinkingReport() {
            const report = {
                timestamp: new Date().toISOString(),
                summary: this.getGlobalStatistics(),
                integrity: this.validateDataIntegrity(),
                recommendations: []
            };
            
            // 分析並給出建議
            if (report.summary.totalMembers === 0) {
                report.recommendations.push('建議先在會友系統中添加會友數據，這是所有系統的基礎');
            }
            
            if (report.summary.inGroups < report.summary.activeMembers * 0.5) {
                report.recommendations.push('小組覆蓋率偏低，建議加強小組事工');
            }
            
            if (report.summary.inMinistry < report.summary.activeMembers * 0.3) {
                report.recommendations.push('志工參與率偏低，建議動員更多會友參與服事');
            }
            
            if (report.integrity.orphanRecords.length > 0) {
                report.recommendations.push(`發現 ${report.integrity.orphanRecords.length} 條孤立記錄，建議清理數據`);
            }
            
            return report;
        }
    }

    // ========================================
    // 創建全局實例
    // ========================================
    window.ChurchCoreLinking = ChurchCoreLinking;
    window.churchCoreLinking = new ChurchCoreLinking();
    
    console.log('🎉 Church Core Systems Data Linking Ready!');
    console.log('   使用方法：window.churchCoreLinking.getMemberFullProfile(memberId)');
    
})(window);

















