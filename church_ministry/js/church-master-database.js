/**
 * 教會事工全站統一數據庫架構
 * 設計理念：全站數據互聯，單一數據源，統一API
 * 
 * 數據關聯關係：
 * 👥 會友 → 核心父表（所有其他模塊的基礎）
 * 🎵 敬拜 → 詩班員也是會友，樂譜是圖書的一種
 * 🏠 小組 → 成員來自會友，活動記錄關聯
 * 👔 志工 → 志工來自會友，服務記錄關聯  
 * 🎓 教育 → 學生來自會友，課程記錄關聯
 * 💰 財務 → 奉獻者來自會友，預算關聯事工
 */

class ChurchMasterDatabase {
    constructor() {
        this.storageKey = 'churchMasterDatabase';
        this.data = this.load();
        this.initializeDefaultStructure();
        this.runMemberIdBackfillMigration();
    }

    load() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {};
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    normalizeCanonicalMemberId(rawValue, fallbackPrefix) {
        if (rawValue === null || rawValue === undefined || rawValue === '') return '';
        var text = String(rawValue).trim();
        if (!text) return '';
        if (/^cm-/.test(text)) return text;
        if (/^\d+$/.test(text)) return 'cm-' + text;
        return (fallbackPrefix || 'cm-') + text.replace(/\s+/g, '-');
    }

    resolveCanonicalMemberId(memberLikeValue) {
        var key = String(memberLikeValue == null ? '' : memberLikeValue).trim();
        if (!key) return '';
        var found = (this.data.members || []).find(function (m) {
            return String(m.id) === key || String(m.memberId) === key || String(m.member_id) === key;
        });
        if (!found) return '';
        return this.normalizeCanonicalMemberId(found.member_id || found.memberId || found.id, 'cm-');
    }

    applyMemberIdAdapter(tablePath, record) {
        if (!record || typeof record !== 'object') return false;
        var changed = false;

        if (tablePath === 'members') {
            var canonicalMain = this.normalizeCanonicalMemberId(
                record.member_id || record.memberId || record.id,
                'cm-'
            );
            if (canonicalMain && record.member_id !== canonicalMain) {
                record.member_id = canonicalMain;
                changed = true;
            }
            if (record.id != null && record.memberId !== record.id) {
                record.memberId = record.id;
                changed = true;
            }
            return changed;
        }

        var hasMemberFields = (record.memberId != null && record.memberId !== '') || (record.member_id != null && record.member_id !== '');
        if (!hasMemberFields) return false;

        var canonical = '';
        if (record.member_id) {
            canonical = this.normalizeCanonicalMemberId(record.member_id, 'cm-');
        }
        if (!canonical && record.memberId != null && record.memberId !== '') {
            canonical = this.resolveCanonicalMemberId(record.memberId) || this.normalizeCanonicalMemberId(record.memberId, 'cm-legacy-');
        }

        if (canonical && record.member_id !== canonical) {
            record.member_id = canonical;
            changed = true;
        }
        return changed;
    }

    runMemberIdBackfillMigration() {
        var changed = false;
        var memberTable = this.data.members || [];
        memberTable.forEach((function (member) {
            changed = this.applyMemberIdAdapter('members', member) || changed;
        }).bind(this));

        var linkedTables = [
            'worship.teamMembers',
            'fellowship.groupMembers',
            'volunteer.volunteers',
            'volunteer.assignments',
            'education.students',
            'education.teachers',
            'finance.incomes',
            'library.borrowers'
        ];

        linkedTables.forEach((function (path) {
            var table = this.getTableByPath(path);
            if (!Array.isArray(table)) return;
            table.forEach((function (row) {
                var rowChanged = this.applyMemberIdAdapter(path, row);
                if (rowChanged && row && row.updatedAt) {
                    row.updatedAt = new Date().toISOString();
                }
                changed = rowChanged || changed;
            }).bind(this));
        }).bind(this));

        if (changed) {
            if (!this.data.metadata) this.data.metadata = {};
            this.data.metadata.lastUpdated = new Date().toISOString();
            this.data.metadata.memberIdAdapterVersion = 'v0.1';
            this.save();
        }
    }

    /**
     * 全站統一數據結構
     * 設計原則：會友為核心，其他模塊通過memberId關聯
     */
    initializeDefaultStructure() {
        if (Object.keys(this.data).length === 0) {
            this.data = {
                // === 核心模塊：會友系統（父表） ===
                members: [],              // 會友基本信息（所有模塊的基礎）
                
                // === 敬拜事工模塊 ===
                worship: {
                    teams: [],            // 敬拜團隊（敬拜團、詩班團、器樂團等）
                    teamMembers: [],      // 團隊成員（關聯memberId）
                    services: [],         // 主日聚會安排
                    assignments: [],      // 排班記錄
                    songs: [],           // 詩歌庫（也是圖書館的一種書）
                    serviceRecords: [],   // 事奉記錄
                    
                    // 器樂團專用數據
                    instruments: [],      // 樂器設備
                    instrumentAssignments: [], // 樂器分配
                    
                    // 詩班專用數據
                    voiceParts: [],       // 聲部劃分
                    voiceBalance: []      // 聲部平衡記錄
                },
                
                // === 小組事工模塊 ===
                fellowship: {
                    groups: [],           // 小組列表
                    groupMembers: [],     // 小組成員（關聯memberId）
                    meetings: [],         // 聚會記錄
                    activities: [],       // 活動安排
                    growthRecords: [],    // 成長記錄
                    multiplication: []    // 倍增追蹤
                },
                
                // === 志工事工模塊 ===
                volunteer: {
                    positions: [],        // 志工崗位
                    volunteers: [],       // 志工（關聯memberId）
                    assignments: [],      // 崗位分配
                    schedules: [],        // 排班
                    evaluations: [],      // 評估記錄
                    trainings: []         // 培訓記錄
                },
                
                // === 教育事工模塊 ===
                education: {
                    classes: [],          // 班級
                    students: [],         // 學生（關聯memberId）
                    teachers: [],         // 教師（關聯memberId）
                    courses: [],          // 課程
                    attendance: [],       // 出席記錄
                    progress: [],         // 學習進度
                    materials: []         // 教材（也是圖書館的一種書）
                },
                
                // === 財務事工模塊 ===
                finance: {
                    budgets: [],          // 預算
                    incomes: [],          // 收入（關聯memberId奉獻者）
                    expenses: [],         // 支出
                    categories: [],       // 分類
                    reports: [],          // 報表
                    forecasts: []         // 預測
                },
                
                // === 圖書館模塊（跨模塊共享） ===
                library: {
                    books: [],            // 圖書（包括樂譜、教材、靈脩書等）
                    categories: [],       // 分類
                    borrowers: [],        // 借閱記錄（關聯memberId）
                    inventory: [],        // 庫存
                    donations: []         // 捐贈記錄
                },
                
                // === 系統元數據 ===
                metadata: {
                    lastUpdated: new Date().toISOString(),
                    version: '1.0.0',
                    modules: ['members', 'worship', 'fellowship', 'volunteer', 'education', 'finance', 'library']
                }
            };
            this.save();
        }
    }

    // ==================== 通用CRUD操作 ====================
    
    insert(tablePath, record) {
        const table = this.getTableByPath(tablePath);
        if (!table) throw new Error(`Table not found: ${tablePath}`);
        
        // 自動生成ID
        if (!record.id) {
            record.id = Date.now();
        }
        
        // 自動添加時間戳
        record.createdAt = new Date().toISOString();
        record.updatedAt = new Date().toISOString();
        this.applyMemberIdAdapter(tablePath, record);
        
        table.push(record);
        this.save();
        return record;
    }

    update(tablePath, id, updates) {
        const table = this.getTableByPath(tablePath);
        if (!table) throw new Error(`Table not found: ${tablePath}`);
        
        const item = table.find(i => i.id === id);
        if (!item) throw new Error(`Record not found: ${id}`);
        
        Object.assign(item, updates);
        this.applyMemberIdAdapter(tablePath, item);
        item.updatedAt = new Date().toISOString();
        this.save();
        return item;
    }

    delete(tablePath, id) {
        const table = this.getTableByPath(tablePath);
        if (!table) throw new Error(`Table not found: ${tablePath}`);
        
        const index = table.findIndex(i => i.id === id);
        if (index === -1) throw new Error(`Record not found: ${id}`);
        
        const deleted = table.splice(index, 1)[0];
        this.save();
        return deleted;
    }

    select(tablePath, filter = {}) {
        const table = this.getTableByPath(tablePath);
        if (!table) throw new Error(`Table not found: ${tablePath}`);
        
        return table.filter(item => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
        });
    }

    // ==================== 表路徑解析 ====================
    
    getTableByPath(tablePath) {
        const parts = tablePath.split('.');
        let current = this.data;
        
        for (const part of parts) {
            if (current[part] && Array.isArray(current[part])) {
                return current[part];
            }
            current = current[part];
        }
        
        return null;
    }

    // ==================== 跨模塊關聯查詢 ====================
    
    /**
     * 獲取會友完整檔案（跨所有模塊）
     * @param {number} memberId 會友ID
     * @returns {object} 完整檔案
     */
    getMemberFullProfile(memberId) {
        const member = this.data.members.find(m => m.id === memberId);
        if (!member) return null;

        return {
            // 基本信息
            basic: member,
            
            // 敬拜事工信息
            worship: {
                teams: this.data.worship.teamMembers.filter(tm => tm.memberId === memberId),
                instruments: this.data.worship.instruments.filter(i => i.assignedToMemberId === memberId),
                voicePart: this.data.worship.voiceParts.find(vp => vp.memberId === memberId),
                serviceRecords: this.data.worship.serviceRecords.filter(sr => sr.memberId === memberId)
            },
            
            // 小組事工信息
            fellowship: {
                groups: this.data.fellowship.groupMembers.filter(gm => gm.memberId === memberId),
                meetings: this.data.fellowship.meetings.filter(m => m.memberId === memberId)
            },
            
            // 志工事工信息
            volunteer: {
                positions: this.data.volunteer.volunteers.filter(v => v.memberId === memberId),
                assignments: this.data.volunteer.assignments.filter(a => a.memberId === memberId)
            },
            
            // 教育事工信息
            education: {
                classes: this.data.education.students.filter(s => s.memberId === memberId),
                teaching: this.data.education.teachers.filter(t => t.memberId === memberId)
            },
            
            // 財務事工信息
            finance: {
                donations: this.data.finance.incomes.filter(i => i.memberId === memberId)
            },
            
            // 圖書館信息
            library: {
                borrowed: this.data.library.borrowers.filter(b => b.memberId === memberId)
            }
        };
    }

    /**
     * 獲取詩歌庫（圖書館的一種）
     * @returns {array} 詩歌列表
     */
    getSongsFromLibrary() {
        return this.data.library.books.filter(book => 
            book.category === 'music' || book.type === 'song'
        );
    }

    /**
     * 獲取教材（圖書館的一種）
     * @returns {array} 教材列表
     */
    getEducationalMaterials() {
        return this.data.library.books.filter(book => 
            book.category === 'education' || book.type === 'textbook'
        );
    }

    /**
     * 驗證數據完整性
     * @returns {object} 驗證結果
     */
    validateDataIntegrity() {
        const issues = [];
        
        // 檢查孤兒記錄（有memberId但會友不存在）
        const memberIds = this.data.members.map(m => m.id);
        
        // 檢查敬拜事工
        this.data.worship.teamMembers.forEach(tm => {
            if (!memberIds.includes(tm.memberId)) {
                issues.push(`敬拜團隊成員 ${tm.memberId} 的會友記錄不存在`);
            }
        });
        
        // 檢查小組事工
        this.data.fellowship.groupMembers.forEach(gm => {
            if (!memberIds.includes(gm.memberId)) {
                issues.push(`小組成員 ${gm.memberId} 的會友記錄不存在`);
            }
        });
        
        // 檢查志工事工
        this.data.volunteer.volunteers.forEach(v => {
            if (!memberIds.includes(v.memberId)) {
                issues.push(`志工 ${v.memberId} 的會友記錄不存在`);
            }
        });
        
        // 檢查教育事工
        this.data.education.students.forEach(s => {
            if (!memberIds.includes(s.memberId)) {
                issues.push(`學生 ${s.memberId} 的會友記錄不存在`);
            }
        });
        
        // 檢查財務事工
        this.data.finance.incomes.forEach(i => {
            if (!memberIds.includes(i.memberId)) {
                issues.push(`奉獻者 ${i.memberId} 的會友記錄不存在`);
            }
        });
        
        return {
            isValid: issues.length === 0,
            issues: issues,
            summary: {
                totalMembers: this.data.members.length,
                totalWorshipMembers: this.data.worship.teamMembers.length,
                totalFellowshipMembers: this.data.fellowship.groupMembers.length,
                totalVolunteers: this.data.volunteer.volunteers.length,
                totalStudents: this.data.education.students.length,
                totalDonors: this.data.finance.incomes.length
            }
        };
    }

    /**
     * 級聯刪除（刪除會友時清理所有關聯）
     * @param {number} memberId 會友ID
     */
    cascadeDeleteMember(memberId) {
        // 刪除敬拜事工關聯
        this.data.worship.teamMembers = this.data.worship.teamMembers.filter(tm => tm.memberId !== memberId);
        this.data.worship.instruments = this.data.worship.instruments.filter(i => i.assignedToMemberId !== memberId);
        this.data.worship.voiceParts = this.data.worship.voiceParts.filter(vp => vp.memberId !== memberId);
        this.data.worship.serviceRecords = this.data.worship.serviceRecords.filter(sr => sr.memberId !== memberId);
        
        // 刪除小組事工關聯
        this.data.fellowship.groupMembers = this.data.fellowship.groupMembers.filter(gm => gm.memberId !== memberId);
        this.data.fellowship.meetings = this.data.fellowship.meetings.filter(m => m.memberId !== memberId);
        
        // 刪除志工事工關聯
        this.data.volunteer.volunteers = this.data.volunteer.volunteers.filter(v => v.memberId !== memberId);
        this.data.volunteer.assignments = this.data.volunteer.assignments.filter(a => a.memberId !== memberId);
        
        // 刪除教育事工關聯
        this.data.education.students = this.data.education.students.filter(s => s.memberId !== memberId);
        this.data.education.teachers = this.data.education.teachers.filter(t => t.memberId !== memberId);
        
        // 刪除財務事工關聯
        this.data.finance.incomes = this.data.finance.incomes.filter(i => i.memberId !== memberId);
        
        // 刪除圖書館關聯
        this.data.library.borrowers = this.data.library.borrowers.filter(b => b.memberId !== memberId);
        
        // 最後刪除會友記錄
        this.data.members = this.data.members.filter(m => m.id !== memberId);
        
        this.save();
    }

    /**
     * 獲取全站統計
     * @returns {object} 統計信息
     */
    getGlobalStatistics() {
        return {
            members: {
                total: this.data.members.length,
                active: this.data.members.filter(m => m.status === 'active').length,
                newThisMonth: this.data.members.filter(m => {
                    const joinDate = new Date(m.joinDate);
                    const now = new Date();
                    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                }).length
            },
            worship: {
                teams: this.data.worship.teams.length,
                teamMembers: this.data.worship.teamMembers.length,
                instruments: this.data.worship.instruments.length,
                services: this.data.worship.services.length
            },
            fellowship: {
                groups: this.data.fellowship.groups.length,
                groupMembers: this.data.fellowship.groupMembers.length,
                meetings: this.data.fellowship.meetings.length
            },
            volunteer: {
                positions: this.data.volunteer.positions.length,
                volunteers: this.data.volunteer.volunteers.length,
                assignments: this.data.volunteer.assignments.length
            },
            education: {
                classes: this.data.education.classes.length,
                students: this.data.education.students.length,
                teachers: this.data.education.teachers.length
            },
            finance: {
                budgets: this.data.finance.budgets.length,
                totalIncome: this.data.finance.incomes.reduce((sum, i) => sum + (i.amount || 0), 0),
                totalExpense: this.data.finance.expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
            },
            library: {
                books: this.data.library.books.length,
                borrowed: this.data.library.borrowers.filter(b => !b.returnDate).length
            }
        };
    }

    /**
     * 生成示例數據（用於測試）
     */
    generateSampleData() {
        // 生成會友數據
        const sampleMembers = [
            { id: 1, name: '張三', phone: '13800138001', email: 'zhang@example.com', status: 'active', joinDate: '2024-01-15' },
            { id: 2, name: '李四', phone: '13800138002', email: 'li@example.com', status: 'active', joinDate: '2024-02-20' },
            { id: 3, name: '王五', phone: '13800138003', email: 'wang@example.com', status: 'active', joinDate: '2024-03-10' },
            { id: 4, name: '趙六', phone: '13800138004', email: 'zhao@example.com', status: 'active', joinDate: '2024-04-05' },
            { id: 5, name: '錢七', phone: '13800138005', email: 'qian@example.com', status: 'active', joinDate: '2024-05-12' }
        ];
        
        this.data.members = sampleMembers;
        
        // 生成敬拜事工數據
        this.data.worship.teams = [
            { id: 1, name: '敬拜團', category: 'worship', leaderId: 1 },
            { id: 2, name: '詩班團', category: 'choir', leaderId: 2 },
            { id: 3, name: '器樂團', category: 'instrument', leaderId: 3 }
        ];
        
        this.data.worship.teamMembers = [
            { id: 1, teamId: 1, memberId: 1, position: '主領', status: 'active' },
            { id: 2, teamId: 1, memberId: 2, position: '伴唱', status: 'active' },
            { id: 3, teamId: 2, memberId: 2, position: '女高音', status: 'active' },
            { id: 4, teamId: 3, memberId: 3, position: '吉他手', status: 'active' }
        ];
        
        // 生成圖書館數據（包括詩歌）
        this.data.library.books = [
            { id: 1, title: '新編讚美詩', author: '教會', category: 'music', type: 'song', isbn: '978-1234567890' },
            { id: 2, title: '聖經', author: '神', category: 'bible', type: 'scripture', isbn: '978-1234567891' },
            { id: 3, title: '主日學教材', author: '教會', category: 'education', type: 'textbook', isbn: '978-1234567892' }
        ];
        
        this.save();
        console.log('✅ 示例數據已生成');
    }
}

// 創建全局實例
window.churchDB = new ChurchMasterDatabase();

// 導出給其他模塊使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChurchMasterDatabase;
}
















