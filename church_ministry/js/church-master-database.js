/**
 * 教会事工全站统一数据库架构
 * 设计理念：全站数据互联，单一数据源，统一API
 * 
 * 数据关联关系：
 * 👥 会友 → 核心父表（所有其他模块的基础）
 * 🎵 敬拜 → 诗班员也是会友，乐谱是图书的一种
 * 🏠 小组 → 成员来自会友，活动记录关联
 * 👔 志工 → 志工来自会友，服务记录关联  
 * 🎓 教育 → 学生来自会友，课程记录关联
 * 💰 财务 → 奉献者来自会友，预算关联事工
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
     * 全站统一数据结构
     * 设计原则：会友为核心，其他模块通过memberId关联
     */
    initializeDefaultStructure() {
        if (Object.keys(this.data).length === 0) {
            this.data = {
                // === 核心模块：会友系统（父表） ===
                members: [],              // 会友基本信息（所有模块的基础）
                
                // === 敬拜事工模块 ===
                worship: {
                    teams: [],            // 敬拜团队（敬拜团、诗班团、器乐团等）
                    teamMembers: [],      // 团队成员（关联memberId）
                    services: [],         // 主日聚会安排
                    assignments: [],      // 排班记录
                    songs: [],           // 诗歌库（也是图书馆的一种书）
                    serviceRecords: [],   // 事奉记录
                    
                    // 器乐团专用数据
                    instruments: [],      // 乐器设备
                    instrumentAssignments: [], // 乐器分配
                    
                    // 诗班专用数据
                    voiceParts: [],       // 声部划分
                    voiceBalance: []      // 声部平衡记录
                },
                
                // === 小组事工模块 ===
                fellowship: {
                    groups: [],           // 小组列表
                    groupMembers: [],     // 小组成员（关联memberId）
                    meetings: [],         // 聚会记录
                    activities: [],       // 活动安排
                    growthRecords: [],    // 成长记录
                    multiplication: []    // 倍增追踪
                },
                
                // === 志工事工模块 ===
                volunteer: {
                    positions: [],        // 志工岗位
                    volunteers: [],       // 志工（关联memberId）
                    assignments: [],      // 岗位分配
                    schedules: [],        // 排班
                    evaluations: [],      // 评估记录
                    trainings: []         // 培训记录
                },
                
                // === 教育事工模块 ===
                education: {
                    classes: [],          // 班级
                    students: [],         // 学生（关联memberId）
                    teachers: [],         // 教师（关联memberId）
                    courses: [],          // 课程
                    attendance: [],       // 出席记录
                    progress: [],         // 学习进度
                    materials: []         // 教材（也是图书馆的一种书）
                },
                
                // === 财务事工模块 ===
                finance: {
                    budgets: [],          // 预算
                    incomes: [],          // 收入（关联memberId奉献者）
                    expenses: [],         // 支出
                    categories: [],       // 分类
                    reports: [],          // 报表
                    forecasts: []         // 预测
                },
                
                // === 图书馆模块（跨模块共享） ===
                library: {
                    books: [],            // 图书（包括乐谱、教材、灵修书等）
                    categories: [],       // 分类
                    borrowers: [],        // 借阅记录（关联memberId）
                    inventory: [],        // 库存
                    donations: []         // 捐赠记录
                },
                
                // === 系统元数据 ===
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
        
        // 自动生成ID
        if (!record.id) {
            record.id = Date.now();
        }
        
        // 自动添加时间戳
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

    // ==================== 表路径解析 ====================
    
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

    // ==================== 跨模块关联查询 ====================
    
    /**
     * 获取会友完整档案（跨所有模块）
     * @param {number} memberId 会友ID
     * @returns {object} 完整档案
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
            
            // 小组事工信息
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
            
            // 财务事工信息
            finance: {
                donations: this.data.finance.incomes.filter(i => i.memberId === memberId)
            },
            
            // 图书馆信息
            library: {
                borrowed: this.data.library.borrowers.filter(b => b.memberId === memberId)
            }
        };
    }

    /**
     * 获取诗歌库（图书馆的一种）
     * @returns {array} 诗歌列表
     */
    getSongsFromLibrary() {
        return this.data.library.books.filter(book => 
            book.category === 'music' || book.type === 'song'
        );
    }

    /**
     * 获取教材（图书馆的一种）
     * @returns {array} 教材列表
     */
    getEducationalMaterials() {
        return this.data.library.books.filter(book => 
            book.category === 'education' || book.type === 'textbook'
        );
    }

    /**
     * 验证数据完整性
     * @returns {object} 验证结果
     */
    validateDataIntegrity() {
        const issues = [];
        
        // 检查孤儿记录（有memberId但会友不存在）
        const memberIds = this.data.members.map(m => m.id);
        
        // 检查敬拜事工
        this.data.worship.teamMembers.forEach(tm => {
            if (!memberIds.includes(tm.memberId)) {
                issues.push(`敬拜团队成员 ${tm.memberId} 的会友记录不存在`);
            }
        });
        
        // 检查小组事工
        this.data.fellowship.groupMembers.forEach(gm => {
            if (!memberIds.includes(gm.memberId)) {
                issues.push(`小组成员 ${gm.memberId} 的会友记录不存在`);
            }
        });
        
        // 检查志工事工
        this.data.volunteer.volunteers.forEach(v => {
            if (!memberIds.includes(v.memberId)) {
                issues.push(`志工 ${v.memberId} 的会友记录不存在`);
            }
        });
        
        // 检查教育事工
        this.data.education.students.forEach(s => {
            if (!memberIds.includes(s.memberId)) {
                issues.push(`学生 ${s.memberId} 的会友记录不存在`);
            }
        });
        
        // 检查财务事工
        this.data.finance.incomes.forEach(i => {
            if (!memberIds.includes(i.memberId)) {
                issues.push(`奉献者 ${i.memberId} 的会友记录不存在`);
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
     * 级联删除（删除会友时清理所有关联）
     * @param {number} memberId 会友ID
     */
    cascadeDeleteMember(memberId) {
        // 删除敬拜事工关联
        this.data.worship.teamMembers = this.data.worship.teamMembers.filter(tm => tm.memberId !== memberId);
        this.data.worship.instruments = this.data.worship.instruments.filter(i => i.assignedToMemberId !== memberId);
        this.data.worship.voiceParts = this.data.worship.voiceParts.filter(vp => vp.memberId !== memberId);
        this.data.worship.serviceRecords = this.data.worship.serviceRecords.filter(sr => sr.memberId !== memberId);
        
        // 删除小组事工关联
        this.data.fellowship.groupMembers = this.data.fellowship.groupMembers.filter(gm => gm.memberId !== memberId);
        this.data.fellowship.meetings = this.data.fellowship.meetings.filter(m => m.memberId !== memberId);
        
        // 删除志工事工关联
        this.data.volunteer.volunteers = this.data.volunteer.volunteers.filter(v => v.memberId !== memberId);
        this.data.volunteer.assignments = this.data.volunteer.assignments.filter(a => a.memberId !== memberId);
        
        // 删除教育事工关联
        this.data.education.students = this.data.education.students.filter(s => s.memberId !== memberId);
        this.data.education.teachers = this.data.education.teachers.filter(t => t.memberId !== memberId);
        
        // 删除财务事工关联
        this.data.finance.incomes = this.data.finance.incomes.filter(i => i.memberId !== memberId);
        
        // 删除图书馆关联
        this.data.library.borrowers = this.data.library.borrowers.filter(b => b.memberId !== memberId);
        
        // 最后删除会友记录
        this.data.members = this.data.members.filter(m => m.id !== memberId);
        
        this.save();
    }

    /**
     * 获取全站统计
     * @returns {object} 统计信息
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
     * 生成示例数据（用于测试）
     */
    generateSampleData() {
        // 生成会友数据
        const sampleMembers = [
            { id: 1, name: '张三', phone: '13800138001', email: 'zhang@example.com', status: 'active', joinDate: '2024-01-15' },
            { id: 2, name: '李四', phone: '13800138002', email: 'li@example.com', status: 'active', joinDate: '2024-02-20' },
            { id: 3, name: '王五', phone: '13800138003', email: 'wang@example.com', status: 'active', joinDate: '2024-03-10' },
            { id: 4, name: '赵六', phone: '13800138004', email: 'zhao@example.com', status: 'active', joinDate: '2024-04-05' },
            { id: 5, name: '钱七', phone: '13800138005', email: 'qian@example.com', status: 'active', joinDate: '2024-05-12' }
        ];
        
        this.data.members = sampleMembers;
        
        // 生成敬拜事工数据
        this.data.worship.teams = [
            { id: 1, name: '敬拜团', category: 'worship', leaderId: 1 },
            { id: 2, name: '诗班团', category: 'choir', leaderId: 2 },
            { id: 3, name: '器乐团', category: 'instrument', leaderId: 3 }
        ];
        
        this.data.worship.teamMembers = [
            { id: 1, teamId: 1, memberId: 1, position: '主领', status: 'active' },
            { id: 2, teamId: 1, memberId: 2, position: '伴唱', status: 'active' },
            { id: 3, teamId: 2, memberId: 2, position: '女高音', status: 'active' },
            { id: 4, teamId: 3, memberId: 3, position: '吉他手', status: 'active' }
        ];
        
        // 生成图书馆数据（包括诗歌）
        this.data.library.books = [
            { id: 1, title: '新编赞美诗', author: '教会', category: 'music', type: 'song', isbn: '978-1234567890' },
            { id: 2, title: '圣经', author: '神', category: 'bible', type: 'scripture', isbn: '978-1234567891' },
            { id: 3, title: '主日学教材', author: '教会', category: 'education', type: 'textbook', isbn: '978-1234567892' }
        ];
        
        this.save();
        console.log('✅ 示例数据已生成');
    }
}

// 创建全局实例
window.churchDB = new ChurchMasterDatabase();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChurchMasterDatabase;
}
















