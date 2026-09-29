/**
 * 学校管理系统全站统一数据库架构
 * 设计理念：全站数据互联，单一数据源，统一API
 * 
 * 数据关联关系：
 * 👨‍🎓 学生 → 核心父表（所有其他模块的基础）
 * 👨‍🏫 教师 → 核心父表（教学相关模块的基础）
 * 📚 课程 → 核心父表（教学安排的基础）
 * 🏫 班级 → 关联学生和教师
 * 📊 成绩 → 关联学生和课程
 * 💰 财务 → 关联学生（学费）
 */

class SchoolMasterDatabase {
    constructor() {
        this.storageKey = 'schoolMasterDatabase';
        this.data = this.load();
        this.initializeDefaultStructure();
        this.runMemberIdBackfillMigration();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('SchoolDB load failed:', e);
            return {};
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('SchoolDB save failed (localStorage may be blocked):', e);
            if (typeof window !== 'undefined' && window.onSchoolDBSaveError) window.onSchoolDBSaveError(e);
        }
    }

    normalizeCanonicalMemberId(rawValue, prefix) {
        if (rawValue === null || rawValue === undefined || rawValue === '') return '';
        var text = String(rawValue).trim();
        if (!text) return '';
        if (/^sm-(stu|tea)-/.test(text)) return text;
        if (/^cm-/.test(text)) return text;
        if (/^\d+$/.test(text)) return (prefix || 'sm-stu-') + text;
        return (prefix || 'sm-stu-') + text.replace(/\s+/g, '-');
    }

    applyMemberIdAdapter(tablePath, record) {
        if (!record || typeof record !== 'object') return false;
        var changed = false;

        if (tablePath === 'students') {
            var canonicalStudent = this.normalizeCanonicalMemberId(
                record.member_id || record.memberId || record.id,
                'sm-stu-'
            );
            if (canonicalStudent && record.member_id !== canonicalStudent) {
                record.member_id = canonicalStudent;
                changed = true;
            }
            if ((record.memberId == null || record.memberId === '') && canonicalStudent) {
                record.memberId = canonicalStudent;
                changed = true;
            }
            return changed;
        }

        if (tablePath === 'teachers') {
            var canonicalTeacher = this.normalizeCanonicalMemberId(
                record.member_id || record.memberId || record.id,
                'sm-tea-'
            );
            if (canonicalTeacher && record.member_id !== canonicalTeacher) {
                record.member_id = canonicalTeacher;
                changed = true;
            }
            if ((record.memberId == null || record.memberId === '') && canonicalTeacher) {
                record.memberId = canonicalTeacher;
                changed = true;
            }
            return changed;
        }

        var hasMemberFields = (record.memberId != null && record.memberId !== '') || (record.member_id != null && record.member_id !== '');
        if (!hasMemberFields) return false;

        var canonical = this.normalizeCanonicalMemberId(record.member_id || record.memberId, 'sm-link-');
        if (canonical && record.member_id !== canonical) {
            record.member_id = canonical;
            changed = true;
        }
        return changed;
    }

    runMemberIdBackfillMigration() {
        var changed = false;
        (this.data.students || []).forEach((function (student) {
            var rowChanged = this.applyMemberIdAdapter('students', student);
            if (rowChanged && student && student.updatedAt) {
                student.updatedAt = new Date().toISOString();
            }
            changed = rowChanged || changed;
        }).bind(this));

        (this.data.teachers || []).forEach((function (teacher) {
            var rowChanged = this.applyMemberIdAdapter('teachers', teacher);
            if (rowChanged && teacher && teacher.updatedAt) {
                teacher.updatedAt = new Date().toISOString();
            }
            changed = rowChanged || changed;
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
     * 设计原则：学生、教师、课程为核心，其他模块通过ID关联
     */
    initializeDefaultStructure() {
        if (Object.keys(this.data).length === 0) {
            this.data = {
                // === 核心模块：学生系统（父表） ===
                // 學生可選填 memberId 連結教會會友（會友事工 memberId）
                // 溝通管道：lineId, whatsappId, wechatId, preferredChannel (line|whatsapp|wechat|email|sms)
                students: [],              // 学生基本信息（所有模块的基础）
                
                // === 核心模块：教师系统（父表） ===
                // 教師可選填 volunteerId 連結教會志工（志工事工 volunteerId）
                // 教師來源：sourceType (church|external|youtube|media), mediaUrl, expertise[]
                teachers: [],              // 教师基本信息（教学模块的基础）
                
                // === 核心模块：课程系统（父表） ===
                // 課程情境：deliveryMode (onsite|online|hybrid|ebook), platform, zoomLink, ebookUrl, examUrl
                courses: [],               // 课程基本信息（教学安排的基础）

                // === 組織／校區（多校區、多分校支援） ===
                organizations: [],         // 組織／學校／分校清單，其他實體以 organizationId 連結
                
                // === 学生事工模块 ===
                student: {
                    profiles: [],          // 学生详细档案
                    enrollments: [],       // 选课记录（关联studentId + courseId）
                    attendance: [],        // 出勤记录（关联studentId）
                    homework: [],          // 作业记录（关联studentId + courseId）
                    progress: []           // 学习进度（关联studentId）
                },
                
                // === 教师事工模块 ===
                teacher: {
                    profiles: [],          // 教师详细档案
                    schedules: [],         // 授课安排（关联teacherId + courseId）
                    evaluations: [],       // 教学评估（关联teacherId）
                    workload: []           // 工作量统计（关联teacherId）
                },
                
                // === 课程事工模块 ===
                course: {
                    schedules: [],         // 课程排程（关联courseId）
                    materials: [],         // 课程资料（关联courseId）
                    evaluations: [],       // 课程评估（关联courseId）
                    prerequisites: []      // 先修课程关系
                },
                
                // === 班级事工模块 ===
                // 班級情境：deliveryMode (onsite|zoom|hybrid), zoomId, zoomLink, recordingUrl
                class: {
                    classes: [],           // 班级信息
                    classStudents: [],     // 班级学生（关联studentId + classId）
                    classTeachers: [],     // 班级教师（关联teacherId + classId）
                    subjects: [],          // 科目安排
                    activities: []         // 班级活动
                },
                
                // === 成绩事工模块 ===
                grade: {
                    grades: [],            // 成绩记录（关联studentId + courseId）
                    exams: [],             // 考试安排
                    assessments: [],       // 评估记录
                    reports: []            // 成绩报告
                },
                
                // === 财务事工模块 ===
                // 支付方式：paymentMethod (cash|transfer|alipay|payme|stripe|other), transactionId
                finance: {
                    tuition: [],           // 学费标准
                    payments: [],         // 缴费记录（关联studentId）
                    transactions: [],      // 收支交易（type: income/expense, 相容 SchoolDB fin_transactions）
                    expenses: [],          // 支出记录
                    budgets: [],           // 预算管理
                    reports: []            // 财务报表
                },
                
                // === 沟通事工模块 ===
                // 管道：channel (line|whatsapp|wechat|email|sms), contactId
                communication: {
                    parentContacts: [],    // 家长沟通（关联studentId）
                    notices: [],           // 公告通知
                    messages: [],          // 内部消息
                    feedback: []           // 反馈记录
                },
                
                // === 活动事工模块 ===
                activity: {
                    activities: [],        // 活动安排（关联studentId）
                    competitions: [],      // 竞赛管理
                    clubs: [],             // 社团管理
                    events: []             // 事件记录
                },
                
                // === 系统元数据 ===
                metadata: {
                    lastUpdated: new Date().toISOString(),
                    version: '1.2.0',
                    modules: [
                        'students',
                        'teachers',
                        'courses',
                        'student',
                        'teacher',
                        'course',
                        'class',
                        'grade',
                        'finance',
                        'communication',
                        'activity',
                        'organizations'
                    ],
                    // 預設組織與語言（可由上層 UI 設定）
                    defaultOrganizationId: null,
                    defaultLanguage: 'zh-Hans',
                    supportedLanguages: [
                        { code: 'zh-Hans', name: '简体中文' },
                        { code: 'zh-Hant', name: '繁體中文' },
                        { code: 'en', name: 'English' },
                        { code: 'vi', name: 'Tiếng Việt' }
                    ]
                }
            };
            this.save();
        }
        // W0（2026-07-26）：不再自動載入示範資料。
        // 示範資料只能由「載入示範」頁明確觸發 ensureSeedFull(true)，
        // 避免真實使用時被自動灌入 255 筆假資料（真假邊界治理）。
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
        this.emitTrainingWorkflowIfNeeded(tablePath, record, null);
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
        this.emitTrainingWorkflowIfNeeded(tablePath, item, updates || null);
        return item;
    }

    getPhase1Bridge() {
        try {
            if (window.Bible100Backend && typeof window.Bible100Backend.getBridge === 'function') {
                return window.Bible100Backend.getBridge();
            }
            if (window.ChurchDataBridgePhase1 && typeof window.ChurchDataBridgePhase1.getInstance === 'function') {
                return window.ChurchDataBridgePhase1.getInstance({});
            }
        } catch (e) {}
        return null;
    }

    isLeaderTrackCourse(course) {
        if (!course) return false;
        const code = String(course.code || course.courseCode || '').toUpperCase();
        if (code === 'LEADER_STAGE3' || code === 'DISCIPLE_MASTER') return true;
        if (course.leaderTrack === true) return true;
        const tags = Array.isArray(course.tags) ? course.tags : [];
        if (tags.some(t => /leader|領袖|門訓大師/i.test(String(t)))) return true;
        return false;
    }

    resolveMemberIdFromGrade(gradeRow) {
        if (!gradeRow) return null;
        const studentId = gradeRow.studentId;
        if (studentId == null) return null;
        const student = (this.data.students || []).find(s => String(s.id) === String(studentId));
        if (!student) return null;
        const memberId = student.memberId != null ? student.memberId : student.member_id;
        return memberId != null && memberId !== '' ? memberId : null;
    }

    emitTrainingWorkflowIfNeeded(tablePath, gradeRow, updates) {
        try {
            if (tablePath !== 'grade.grades') return;
            const bridge = this.getPhase1Bridge();
            if (!bridge || typeof bridge.triggerWorkflow !== 'function') return;
            const memberId = this.resolveMemberIdFromGrade(gradeRow);
            if (memberId == null) return;

            const course = (this.data.courses || []).find(c => String(c.id) === String(gradeRow.courseId));
            const score = Number(gradeRow.score);
            if (!isFinite(score)) return;
            const wasScore = updates && updates.score != null ? Number(updates.score) : null;
            if (wasScore != null && isFinite(wasScore) && wasScore === score) return;
            const passed = score >= 60;
            if (!passed) return;

            const courseId = this.isLeaderTrackCourse(course)
                ? String(course.code || 'LEADER_STAGE3').toUpperCase()
                : String(course && (course.code || course.id) ? (course.code || course.id) : 'COURSE_GENERAL');
            const credits = Number(course && course.credits != null ? course.credits : 1) || 1;

            bridge.triggerWorkflow('TRAINING_COMPLETED', {
                module: 'SCHOOL',
                memberId: memberId,
                courseId: courseId,
                credits: credits,
                score: score,
                source: 'school.grade.grades',
                sourceGradeId: gradeRow.id
            });
        } catch (e) {
            console.warn('emitTrainingWorkflowIfNeeded skipped', e);
        }
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

    // ==================== 組織與語言輔助方法 ====================

    /**
     * 新增或更新組織（校區／分校）
     * @param {object} organization 組織資料，需至少包含 name
     */
    upsertOrganization(organization) {
        if (!organization || !organization.name) {
            throw new Error('Organization must have a name');
        }

        if (!this.data.organizations) {
            this.data.organizations = [];
        }

        if (organization.id) {
            const index = this.data.organizations.findIndex(o => o.id === organization.id);
            if (index !== -1) {
                this.data.organizations[index] = {
                    ...this.data.organizations[index],
                    ...organization,
                    updatedAt: new Date().toISOString()
                };
                this.save();
                return this.data.organizations[index];
            }
        }

        const newOrg = {
            id: organization.id || Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // name 可帶多語系欄位，如 nameZh / nameEn / nameVi
            ...organization
        };
        this.data.organizations.push(newOrg);
        this.save();
        return newOrg;
    }

    /**
     * 取得所有組織（可加上過濾條件）
     * @param {object} [filter]
     */
    getOrganizations(filter = {}) {
        if (!this.data.organizations) return [];
        return this.data.organizations.filter(org =>
            Object.keys(filter).every(key => org[key] === filter[key])
        );
    }

    /**
     * 設定預設組織
     * @param {number} organizationId
     */
    setDefaultOrganization(organizationId) {
        if (!this.data.organizations || !this.data.organizations.find(o => o.id === organizationId)) {
            throw new Error(`Organization not found: ${organizationId}`);
        }
        this.data.metadata.defaultOrganizationId = organizationId;
        this.data.metadata.lastUpdated = new Date().toISOString();
        this.save();
    }

    /**
     * 設定預設語言（需在 supportedLanguages 之中）
     * @param {string} languageCode
     */
    setDefaultLanguage(languageCode) {
        const supported = (this.data.metadata.supportedLanguages || []).map(l => l.code);
        if (!supported.includes(languageCode)) {
            throw new Error(`Language not supported: ${languageCode}`);
        }
        this.data.metadata.defaultLanguage = languageCode;
        this.data.metadata.lastUpdated = new Date().toISOString();
        this.save();
    }

    /**
     * 取得支援語言清單
     */
    getSupportedLanguages() {
        return this.data.metadata.supportedLanguages || [];
    }

    // ==================== 跨模块关联查询 ====================
    
    /**
     * 获取学生完整档案（跨所有模块）
     * @param {number} studentId 学生ID
     * @returns {object} 完整档案
     */
    getStudentFullProfile(studentId) {
        const student = this.data.students.find(s => s.id === studentId);
        if (!student) return null;

        return {
            // 基本信息
            basic: student,
            
            // 学生事工信息
            student: {
                profile: this.data.student.profiles.find(p => p.studentId === studentId),
                enrollments: this.data.student.enrollments.filter(e => e.studentId === studentId),
                attendance: this.data.student.attendance.filter(a => a.studentId === studentId),
                homework: this.data.student.homework.filter(h => h.studentId === studentId),
                progress: this.data.student.progress.filter(p => p.studentId === studentId)
            },
            
            // 班级信息
            class: {
                classes: this.data.class.classStudents.filter(cs => cs.studentId === studentId),
                subjects: this.data.class.subjects.filter(s => s.studentId === studentId)
            },
            
            // 成绩信息
            grade: {
                grades: this.data.grade.grades.filter(g => g.studentId === studentId),
                exams: this.data.grade.exams.filter(e => e.studentId === studentId)
            },
            
            // 财务信息
            finance: {
                payments: this.data.finance.payments.filter(p => p.studentId === studentId),
                tuition: this.data.finance.tuition.find(t => t.studentId === studentId)
            },
            
            // 沟通信息
            communication: {
                parentContacts: this.data.communication.parentContacts.filter(pc => pc.studentId === studentId),
                notices: this.data.communication.notices.filter(n => n.studentId === studentId)
            },
            
            // 活动信息
            activity: {
                activities: this.data.activity.activities.filter(a => a.studentId === studentId),
                competitions: this.data.activity.competitions.filter(c => c.studentId === studentId),
                clubs: this.data.activity.clubs.filter(c => c.studentId === studentId)
            }
        };
    }

    /**
     * 获取教师完整档案（跨所有模块）
     * @param {number} teacherId 教师ID
     * @returns {object} 完整档案
     */
    getTeacherFullProfile(teacherId) {
        const teacher = this.data.teachers.find(t => t.id === teacherId);
        if (!teacher) return null;

        return {
            // 基本信息
            basic: teacher,
            
            // 教师事工信息
            teacher: {
                profile: this.data.teacher.profiles.find(p => p.teacherId === teacherId),
                schedules: this.data.teacher.schedules.filter(s => s.teacherId === teacherId),
                evaluations: this.data.teacher.evaluations.filter(e => e.teacherId === teacherId),
                workload: this.data.teacher.workload.filter(w => w.teacherId === teacherId)
            },
            
            // 班级信息
            class: {
                classes: this.data.class.classTeachers.filter(ct => ct.teacherId === teacherId),
                subjects: this.data.class.subjects.filter(s => s.teacherId === teacherId)
            },
            
            // 课程信息
            course: {
                courses: this.data.courses.filter(c => c.teacherId === teacherId),
                schedules: this.data.course.schedules.filter(s => s.teacherId === teacherId)
            },
            
            // 沟通信息
            communication: {
                messages: this.data.communication.messages.filter(m => m.teacherId === teacherId),
                feedback: this.data.communication.feedback.filter(f => f.teacherId === teacherId)
            }
        };
    }

    /**
     * 获取课程完整信息（跨所有模块）
     * @param {number} courseId 课程ID
     * @returns {object} 完整信息
     */
    getCourseFullInfo(courseId) {
        const course = this.data.courses.find(c => c.id === courseId);
        if (!course) return null;

        return {
            // 基本信息
            basic: course,
            
            // 课程事工信息
            course: {
                schedules: this.data.course.schedules.filter(s => s.courseId === courseId),
                materials: this.data.course.materials.filter(m => m.courseId === courseId),
                evaluations: this.data.course.evaluations.filter(e => e.courseId === courseId)
            },
            
            // 学生信息
            students: {
                enrollments: this.data.student.enrollments.filter(e => e.courseId === courseId),
                grades: this.data.grade.grades.filter(g => g.courseId === courseId)
            },
            
            // 教师信息
            teacher: {
                teacher: this.data.teachers.find(t => t.id === course.teacherId),
                schedules: this.data.teacher.schedules.filter(s => s.courseId === courseId)
            }
        };
    }

    /**
     * 验证数据完整性
     * @returns {object} 验证结果
     */
    validateDataIntegrity() {
        const issues = [];
        
        // 检查学生记录
        const studentIds = this.data.students.map(s => s.id);
        const teacherIds = this.data.teachers.map(t => t.id);
        const courseIds = this.data.courses.map(c => c.id);
        
        // 检查学生选课
        this.data.student.enrollments.forEach(enrollment => {
            if (!studentIds.includes(enrollment.studentId)) {
                issues.push(`学生选课记录 ${enrollment.id} 的学生ID ${enrollment.studentId} 不存在`);
            }
            if (!courseIds.includes(enrollment.courseId)) {
                issues.push(`学生选课记录 ${enrollment.id} 的课程ID ${enrollment.courseId} 不存在`);
            }
        });
        
        // 检查成绩记录
        this.data.grade.grades.forEach(grade => {
            if (!studentIds.includes(grade.studentId)) {
                issues.push(`成绩记录 ${grade.id} 的学生ID ${grade.studentId} 不存在`);
            }
            if (!courseIds.includes(grade.courseId)) {
                issues.push(`成绩记录 ${grade.id} 的课程ID ${grade.courseId} 不存在`);
            }
        });
        
        // 检查教师授课
        this.data.teacher.schedules.forEach(schedule => {
            if (!teacherIds.includes(schedule.teacherId)) {
                issues.push(`教师授课记录 ${schedule.id} 的教师ID ${schedule.teacherId} 不存在`);
            }
            if (!courseIds.includes(schedule.courseId)) {
                issues.push(`教师授课记录 ${schedule.id} 的课程ID ${schedule.courseId} 不存在`);
            }
        });
        
        // 检查缴费记录
        this.data.finance.payments.forEach(payment => {
            if (!studentIds.includes(payment.studentId)) {
                issues.push(`缴费记录 ${payment.id} 的学生ID ${payment.studentId} 不存在`);
            }
        });
        
        return {
            isValid: issues.length === 0,
            issues: issues,
            summary: {
                totalStudents: this.data.students.length,
                totalTeachers: this.data.teachers.length,
                totalCourses: this.data.courses.length,
                totalEnrollments: this.data.student.enrollments.length,
                totalGrades: this.data.grade.grades.length,
                totalPayments: this.data.finance.payments.length
            }
        };
    }

    /**
     * 级联删除（删除学生时清理所有关联）
     * @param {number} studentId 学生ID
     */
    cascadeDeleteStudent(studentId) {
        // 删除学生事工关联
        this.data.student.profiles = this.data.student.profiles.filter(p => p.studentId !== studentId);
        this.data.student.enrollments = this.data.student.enrollments.filter(e => e.studentId !== studentId);
        this.data.student.attendance = this.data.student.attendance.filter(a => a.studentId !== studentId);
        this.data.student.homework = this.data.student.homework.filter(h => h.studentId !== studentId);
        this.data.student.progress = this.data.student.progress.filter(p => p.studentId !== studentId);
        
        // 删除班级关联
        this.data.class.classStudents = this.data.class.classStudents.filter(cs => cs.studentId !== studentId);
        this.data.class.subjects = this.data.class.subjects.filter(s => s.studentId !== studentId);
        
        // 删除成绩关联
        this.data.grade.grades = this.data.grade.grades.filter(g => g.studentId !== studentId);
        this.data.grade.exams = this.data.grade.exams.filter(e => e.studentId !== studentId);
        
        // 删除财务关联
        this.data.finance.payments = this.data.finance.payments.filter(p => p.studentId !== studentId);
        
        // 删除沟通关联
        this.data.communication.parentContacts = this.data.communication.parentContacts.filter(pc => pc.studentId !== studentId);
        this.data.communication.notices = this.data.communication.notices.filter(n => n.studentId !== studentId);
        
        // 删除活动关联
        this.data.activity.activities = this.data.activity.activities.filter(a => a.studentId !== studentId);
        this.data.activity.competitions = this.data.activity.competitions.filter(c => c.studentId !== studentId);
        this.data.activity.clubs = this.data.activity.clubs.filter(c => c.studentId !== studentId);
        
        // 最后删除学生记录
        this.data.students = this.data.students.filter(s => s.id !== studentId);
        
        this.save();
    }

    /**
     * 获取全站统计
     * @returns {object} 统计信息
     */
    getGlobalStatistics() {
        return {
            students: {
                total: this.data.students.length,
                active: this.data.students.filter(s => s.status === 'active').length,
                newThisMonth: this.data.students.filter(s => {
                    const joinDate = new Date(s.enrollmentDate);
                    const now = new Date();
                    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                }).length
            },
            teachers: {
                total: this.data.teachers.length,
                active: this.data.teachers.filter(t => t.status === 'active').length,
                workload: this.data.teacher.workload.length
            },
            courses: {
                total: this.data.courses.length,
                active: this.data.courses.filter(c => c.status === 'active').length,
                enrollments: this.data.student.enrollments.length
            },
            grades: {
                total: this.data.grade.grades.length,
                average: this.calculateAverageGrade(),
                recent: this.data.grade.grades.filter(g => {
                    const examDate = new Date(g.examDate);
                    const now = new Date();
                    const diffTime = Math.abs(now - examDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 30;
                }).length
            },
            finance: {
                totalIncome: this.data.finance.payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                totalExpense: this.data.finance.expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
                pendingPayments: this.data.finance.payments.filter(p => p.status === 'pending').length
            },
            communication: {
                totalNotices: this.data.communication.notices.length,
                totalMessages: this.data.communication.messages.length,
                unreadMessages: this.data.communication.messages.filter(m => !m.read).length
            },
            activity: {
                totalActivities: this.data.activity.activities.length,
                totalCompetitions: this.data.activity.competitions.length,
                totalClubs: this.data.activity.clubs.length
            }
        };
    }

    /**
     * 计算平均成绩
     * @returns {number} 平均成绩
     */
    calculateAverageGrade() {
        const grades = this.data.grade.grades.filter(g => g.score !== null && g.score !== undefined);
        if (grades.length === 0) return 0;
        
        const total = grades.reduce((sum, g) => sum + g.score, 0);
        return Math.round((total / grades.length) * 100) / 100;
    }

    /**
     * 統一成績寫入入口（Phase 1.2）
     * 成功後會透過 emitTrainingWorkflowIfNeeded 嘗試觸發 TRAINING_COMPLETED
     */
    saveGrade(gradeInput) {
        const row = Object.assign({}, gradeInput || {});
        if (row.studentId == null) throw new Error('studentId is required');
        if (row.courseId == null) throw new Error('courseId is required');
        if (row.score == null || row.score === '') throw new Error('score is required');
        if (row.grade == null || row.grade === '') {
            const score = Number(row.score);
            row.grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
        }
        if (!row.examDate) row.examDate = new Date().toISOString().slice(0, 10);
        return this.insert('grade.grades', row);
    }

    /**
     * 教會事工連接：依會友 ID 取得學校學生（學生.memberId 連結會友）
     * @param {string|number} memberId 會友事工中的 memberId
     * @returns {object[]} 學生列表
     */
    getStudentsByMemberId(memberId) {
        return (this.data.students || []).filter(s => s.memberId != null && String(s.memberId) === String(memberId));
    }

    /**
     * 教會事工連接：依志工 ID 取得學校教師（教師.volunteerId 連結志工）
     * @param {string|number} volunteerId 志工事工中的 volunteerId
     * @returns {object[]} 教師列表
     */
    getTeachersByVolunteerId(volunteerId) {
        return (this.data.teachers || []).filter(t => t.volunteerId != null && String(t.volunteerId) === String(volunteerId));
    }

    /**
     * 連結學生與會友（教會事工整合）
     * @param {number} studentId 學生 ID
     * @param {string|number} memberId 會友 ID
     */
    linkStudentToMember(studentId, memberId) {
        const s = this.data.students.find(st => st.id === studentId);
        if (!s) throw new Error('Student not found');
        s.memberId = memberId;
        s.updatedAt = new Date().toISOString();
        this.save();
    }

    /**
     * 連結教師與志工（教會事工整合）
     * @param {number} teacherId 教師 ID
     * @param {string|number} volunteerId 志工 ID
     */
    linkTeacherToVolunteer(teacherId, volunteerId) {
        const t = this.data.teachers.find(te => te.id === teacherId);
        if (!t) throw new Error('Teacher not found');
        t.volunteerId = volunteerId;
        t.updatedAt = new Date().toISOString();
        this.save();
    }

    // ==================== W1：中央會友庫連結 ====================

    /**
     * 判斷 memberId 是否真正指向中央會友庫。
     * 學校 adapter 會為未連結者自動填入自造的 sm-stu-*／sm-tea-*，
     * 這些不算已連結中央會友。
     */
    isCentralMemberLink(value) {
        if (value === null || value === undefined || value === '') return false;
        const text = String(value).trim();
        if (!text) return false;
        return !/^sm-(stu|tea|link)-/.test(text);
    }

    /**
     * 讀取中央會友庫（memberSystemData）名單，供「從會友選人」下拉使用。
     * 只讀，不寫入會友主檔。
     * @returns {{id: string, name: string}[]}
     */
    getCentralMembers() {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return [];
            const raw = window.localStorage.getItem('memberSystemData');
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            const members = Array.isArray(parsed.members) ? parsed.members : [];
            return members.map(m => ({
                id: String(m.memberId != null ? m.memberId : m.id),
                name: m.name || m.fullName || ''
            })).filter(m => m.id && m.id !== 'undefined');
        } catch (e) {
            return [];
        }
    }

    /**
     * 會友連結統計（儀表板「已連結會友比例」卡使用）。
     * 教師以 volunteerId（＝會友 member_id，對齊智慧事奉 talent_id 慣例）計。
     */
    getMemberLinkStats() {
        const students = this.data.students || [];
        const teachers = this.data.teachers || [];
        const check = this.isCentralMemberLink.bind(this);
        return {
            students_total: students.length,
            students_linked: students.filter(s => check(s.memberId)).length,
            students_pending: students.filter(s => s.status === 'pending').length,
            teachers_total: teachers.length,
            teachers_linked: teachers.filter(t => t.volunteerId != null && String(t.volunteerId).trim() !== '').length
        };
    }

    // ==================== W2：學費收據與教會財政匯出 ====================

    _getPaymentById(paymentId) {
        const payments = (this.data.finance && this.data.finance.payments) || [];
        return payments.find(p => p.id === paymentId) || null;
    }

    _getStudentById(studentId) {
        return (this.data.students || []).find(s => s.id === studentId) || null;
    }

    _paymentMethodLabel(method) {
        const map = { cash: '現金', transfer: '轉帳', alipay: '支付寶', payme: 'PayMe', cheque: '支票' };
        return map[method] || method || '—';
    }

    /** 產生收據編號 SCH-RCP-YYYYMMDD-NNN */
    generateReceiptNo() {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const prefix = 'SCH-RCP-' + today + '-';
        const payments = (this.data.finance && this.data.finance.payments) || [];
        let maxSeq = 0;
        payments.forEach(p => {
            if (p.receiptNo && String(p.receiptNo).indexOf(prefix) === 0) {
                const tail = parseInt(String(p.receiptNo).slice(prefix.length), 10);
                if (isFinite(tail) && tail > maxSeq) maxSeq = tail;
            }
        });
        return prefix + String(maxSeq + 1).padStart(3, '0');
    }

    /**
     * 標記繳費為已繳並配收據編號（若尚未有）。
     * @returns {object} 更新後的 payment
     */
    markPaymentPaid(paymentId, options) {
        options = options || {};
        const p = this._getPaymentById(paymentId);
        if (!p) throw new Error('Payment not found');
        const updates = {
            status: 'paid',
            paymentDate: options.paymentDate || p.paymentDate || new Date().toISOString().slice(0, 10)
        };
        if (!p.receiptNo) updates.receiptNo = this.generateReceiptNo();
        if (options.paymentMethod) updates.paymentMethod = options.paymentMethod;
        return this.update('finance.payments', paymentId, updates);
    }

    /** 學員端：產生繳費通知文字（只產生文字，不會發送） */
    buildPaymentNoticeText(paymentId) {
        const p = this._getPaymentById(paymentId);
        if (!p) return '';
        const student = this._getStudentById(p.studentId);
        const name = student ? student.name : ('學員#' + p.studentId);
        const lines = [
            '【學校學費繳費通知】',
            '學員：' + name,
            '學期：' + (p.semester || '—'),
            '應繳金額：¥' + (p.amount || 0).toLocaleString(),
            '狀態：' + (p.status === 'paid' ? '已繳' : '待繳'),
            p.receiptNo ? ('收據編號：' + p.receiptNo) : '',
            '',
            '請於期限內完成繳費，完成後請聯絡教務／出納確認。',
            '（本訊息由學校管理系統產生，需人工審核後再發送）'
        ].filter(Boolean);
        return lines.join('\n');
    }

    /** 收據列印用 HTML */
    buildReceiptHtml(paymentId) {
        const p = this._getPaymentById(paymentId);
        if (!p) return '';
        const student = this._getStudentById(p.studentId);
        const org = (this.data.organizations && this.data.organizations[0]) || {};
        const schoolName = org.nameZh || org.name || '學校';
        const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        return '<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>收據 ' + esc(p.receiptNo || p.id) + '</title>' +
            '<style>body{font-family:"Microsoft YaHei",sans-serif;padding:40px;max-width:480px;margin:0 auto;color:#333}' +
            'h1{font-size:18px;text-align:center;border-bottom:2px solid #0b5fa5;padding-bottom:8px}' +
            '.row{display:flex;justify-content:space-between;margin:8px 0;font-size:14px}' +
            '.amt{font-size:22px;font-weight:bold;color:#0b5fa5;text-align:center;margin:16px 0}' +
            '.foot{font-size:11px;color:#666;margin-top:24px;border-top:1px dashed #ccc;padding-top:8px}' +
            '@media print{body{padding:20px}}</style></head><body>' +
            '<h1>' + esc(schoolName) + ' · 學費收據</h1>' +
            '<div class="row"><span>收據編號</span><span>' + esc(p.receiptNo || '—') + '</span></div>' +
            '<div class="row"><span>學員</span><span>' + esc(student ? student.name : p.studentId) + '</span></div>' +
            '<div class="row"><span>學期</span><span>' + esc(p.semester || '—') + '</span></div>' +
            '<div class="row"><span>繳費日期</span><span>' + esc(p.paymentDate || '—') + '</span></div>' +
            '<div class="row"><span>支付方式</span><span>' + esc(this._paymentMethodLabel(p.paymentMethod)) + '</span></div>' +
            '<div class="amt">¥' + esc((p.amount || 0).toLocaleString()) + '</div>' +
            '<div class="foot">本收據由學校管理系統產生 · ' + esc(new Date().toISOString().slice(0, 10)) + '<br>財務對帳請匯出至教會財政（financeSystemData）。</div>' +
            '<script>window.onload=function(){window.print()}<\/script></body></html>';
    }

    /**
     * 將已繳學費轉為教會財政匯出包（對齊 financeSystemData.transactions + A3 對帳欄位）。
     * @param {object} opts { semester, onlyUnexported, paymentIds }
     */
    buildChurchFinanceExport(opts) {
        opts = opts || {};
        const payments = (this.data.finance && this.data.finance.payments) || [];
        const idSet = Array.isArray(opts.paymentIds) ? new Set(opts.paymentIds.map(Number)) : null;
        let rows = payments.filter(p => p.status === 'paid');
        if (opts.semester) rows = rows.filter(p => p.semester === opts.semester);
        if (opts.onlyUnexported) rows = rows.filter(p => !p.exportedToChurchFinanceAt);
        if (idSet && idSet.size) rows = rows.filter(p => idSet.has(p.id));

        const transactions = [];
        const reconciliationRecords = [];
        const now = new Date().toISOString();

        rows.forEach(p => {
            const student = this._getStudentById(p.studentId);
            const memberId = student && this.isCentralMemberLink(student.memberId) ? student.memberId : null;
            const desc = '學校學費 · ' + (student ? student.name : ('學員#' + p.studentId)) + ' · ' + (p.semester || '');
            transactions.push({
                type: 'income',
                category: 'school_tuition',
                categoryName: '學校學費',
                amount: Number(p.amount) || 0,
                date: p.paymentDate || now.slice(0, 10),
                description: desc,
                handler: 'school_management',
                operator_id: 'school_management',
                status: 'approved',
                source: 'school_tuition_export',
                source_payment_id: p.id,
                receipt_no: p.receiptNo || null,
                member_id: memberId,
                txn_id: 'SCH-TXN-' + p.id
            });
            reconciliationRecords.push({
                member_id: memberId,
                member_name: student ? student.name : ('學員#' + p.studentId),
                date: p.paymentDate || now.slice(0, 10),
                amount: Number(p.amount) || 0,
                fund: '主日學／學校學費',
                method: p.paymentMethod || 'cash',
                status: 'pending',
                receipt_status: p.receiptNo ? 'copied' : 'pending',
                source: 'school_tuition_export',
                source_payment_id: p.id,
                receipt_no: p.receiptNo || null,
                note: desc + (p.receiptNo ? (' · 收據 ' + p.receiptNo) : '')
            });
        });

        return {
            schema_version: 1,
            exported_at: now,
            source: 'schoolMasterDatabase.finance.payments',
            target_finance_key: 'financeSystemData',
            target_reconciliation_key: 'financeReconciliationData',
            payment_count: rows.length,
            transactions: transactions,
            reconciliation_records: reconciliationRecords
        };
    }

    /** 匯出統計 */
    getFinanceExportStats() {
        const payments = (this.data.finance && this.data.finance.payments) || [];
        const paid = payments.filter(p => p.status === 'paid');
        return {
            total_payments: payments.length,
            paid_count: paid.length,
            pending_count: payments.filter(p => p.status === 'pending').length,
            with_receipt: paid.filter(p => p.receiptNo).length,
            exported_count: paid.filter(p => p.exportedToChurchFinanceAt).length,
            ready_to_export: paid.filter(p => !p.exportedToChurchFinanceAt).length
        };
    }

    /**
     * 將匯出包寫入教會 financeSystemData（需 UI 人工確認後呼叫；不會自動雙寫）。
     * @returns {{ok: boolean, written?: number, error?: string}}
     */
    importToChurchFinanceSystem(opts) {
        opts = opts || {};
        const bundle = this.buildChurchFinanceExport(opts);
        if (!bundle.payment_count) {
            return { ok: false, error: '沒有可匯出的已繳學費（可能已全部匯出或未標記已繳）' };
        }
        const bridge = typeof window !== 'undefined' ? window.ChurchDataBridge : null;
        if (!bridge || typeof bridge.saveFinanceTransaction !== 'function') {
            return { ok: false, error: 'ChurchDataBridge 未載入，請改用「下載匯出 JSON」交教會財務同工匯入', bundle: bundle };
        }
        try {
            bundle.transactions.forEach(tx => {
                bridge.saveFinanceTransaction(tx, { operator_id: 'school_management' });
            });
            if (opts.markExported !== false) {
                const ts = new Date().toISOString();
                bundle.transactions.forEach(tx => {
                    const pid = tx.source_payment_id;
                    if (pid != null) {
                        try { this.update('finance.payments', pid, { exportedToChurchFinanceAt: ts }); } catch (e) {}
                    }
                });
            }
            return { ok: true, written: bundle.payment_count, bundle: bundle };
        } catch (e) {
            return { ok: false, error: String(e.message || e), bundle: bundle };
        }
    }

    // ==================== W3：學年、招生簡章、結業證書 ====================

    _ensureMeta() {
        if (!this.data.meta) this.data.meta = {};
        if (!Array.isArray(this.data.meta.academicYears)) {
            this.data.meta.academicYears = [{
                id: '2024-2025',
                label: '2024-2025 學年',
                semesters: [
                    { id: '2024-1', label: '2024 上學期', start: '2024-09-01', end: '2025-01-31' },
                    { id: '2024-2', label: '2024 下學期', start: '2025-02-01', end: '2025-06-30' }
                ]
            }];
        }
        if (!this.data.meta.currentSemesterId) this.data.meta.currentSemesterId = '2024-2';
        if (!Array.isArray(this.data.meta.certificates)) this.data.meta.certificates = [];
        return this.data.meta;
    }

    getAcademicYears() {
        return this._ensureMeta().academicYears;
    }

    getCurrentSemesterId() {
        return this._ensureMeta().currentSemesterId;
    }

    /** 表單預設學期（取代各頁硬編碼字串） */
    getDefaultSemester() {
        return this.getCurrentSemesterId();
    }

    getCurrentSemesterInfo() {
        const meta = this._ensureMeta();
        for (let i = 0; i < meta.academicYears.length; i++) {
            const y = meta.academicYears[i];
            const sems = y.semesters || [];
            for (let j = 0; j < sems.length; j++) {
                if (sems[j].id === meta.currentSemesterId) {
                    return { year: y, semester: sems[j] };
                }
            }
        }
        return { year: null, semester: { id: meta.currentSemesterId, label: meta.currentSemesterId } };
    }

    setCurrentSemester(semesterId) {
        this._ensureMeta().currentSemesterId = semesterId;
        this.save();
    }

    addAcademicYear(label, semesters) {
        const meta = this._ensureMeta();
        const id = String(label).replace(/\s+/g, '-').slice(0, 32);
        if (meta.academicYears.some(y => y.id === id)) throw new Error('學年已存在');
        meta.academicYears.push({
            id: id,
            label: label,
            semesters: Array.isArray(semesters) ? semesters : []
        });
        this.save();
        return id;
    }

    addSemesterToYear(yearId, semester) {
        const meta = this._ensureMeta();
        const y = meta.academicYears.find(yr => yr.id === yearId);
        if (!y) throw new Error('學年不存在');
        if (!Array.isArray(y.semesters)) y.semesters = [];
        y.semesters.push(semester);
        this.save();
    }

    getEnrollmentBrochureIntroHtml() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem('school_html_editor_enrollment_brochure') || '';
            }
        } catch (e) {}
        return '';
    }

    /** 招生簡章 HTML（可列印／對外展示） */
    buildEnrollmentBrochureHtml() {
        const org = (this.data.organizations && this.data.organizations[0]) || {};
        const schoolName = org.nameZh || org.name || '本校';
        const info = this.getCurrentSemesterInfo();
        const semLabel = info.semester ? info.semester.label : this.getDefaultSemester();
        const courses = (this.data.courses || []).filter(c => c.status !== 'inactive');
        const teachers = this.data.teachers || [];
        const intro = this.getEnrollmentBrochureIntroHtml();
        const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const courseRows = courses.map(c => {
            const t = teachers.find(te => te.id === c.teacherId);
            return '<tr><td>' + esc(c.name) + '</td><td>' + esc(c.subject || '—') + '</td><td>' + esc(t ? t.name : '—') + '</td><td>' + esc(c.semester || semLabel) + '</td><td>' + esc(c.credits || '—') + '</td></tr>';
        }).join('');
        return '<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>' + esc(schoolName) + ' 招生簡章</title>' +
            '<style>body{font-family:"Microsoft YaHei",Georgia,serif;max-width:720px;margin:0 auto;padding:32px;color:#1e293b;line-height:1.7}' +
            'h1{text-align:center;color:#0b5fa5;border-bottom:3px double #0b5fa5;padding-bottom:12px}' +
            '.meta{text-align:center;color:#64748b;margin:12px 0 24px;font-size:14px}' +
            '.intro{background:#f0f9ff;border-left:4px solid #0b5fa5;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0}' +
            'table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}' +
            'th,td{border:1px solid #cbd5e1;padding:8px 10px;text-align:left}th{background:#e8f4fd;color:#0b5fa5}' +
            '.cta{text-align:center;margin-top:28px;padding:16px;background:#ecfdf5;border-radius:8px}' +
            '@media print{body{padding:16px}}</style></head><body>' +
            '<h1>' + esc(schoolName) + '<br><span style="font-size:16px;font-weight:normal">招生簡章</span></h1>' +
            '<p class="meta">招生學期：' + esc(semLabel) + ' · 更新：' + esc(new Date().toISOString().slice(0, 10)) + '</p>' +
            (intro ? '<div class="intro">' + intro + '</div>' : '<div class="intro"><p>歡迎報名本校課程。請至學員入口完成註冊，教務同工取錄後即可選課。</p></div>') +
            '<h2 style="font-size:15px;color:#0b5fa5">開放課程</h2>' +
            '<table><thead><tr><th>課程</th><th>科目</th><th>教師</th><th>學期</th><th>學分</th></tr></thead><tbody>' +
            (courseRows || '<tr><td colspan="5">尚無開放課程，請至「課程」模組新增。</td></tr>') + '</tbody></table>' +
            '<div class="cta"><strong>報名方式</strong><br>① 線上：學員入口 → 新生註冊（待教務取錄）<br>② 現場：聯絡教務同工代為登記</div>' +
            '</body></html>';
    }

    /** 判定學生是否達課程結業／及格條件 */
    checkCourseCompletion(studentId, courseId, passScore) {
        passScore = passScore != null ? Number(passScore) : 60;
        const grades = (this.data.grade && this.data.grade.grades) || [];
        const mine = grades.filter(g => g.studentId === studentId && g.courseId === courseId);
        if (!mine.length) {
            return { eligible: false, reason: '尚無成績紀錄', score: null };
        }
        const scores = mine.map(g => Number(g.score)).filter(n => isFinite(n));
        if (!scores.length) {
            return { eligible: false, reason: '成績未登分', score: null };
        }
        const best = Math.max.apply(null, scores);
        if (best >= passScore) {
            return { eligible: true, reason: '已達及格線', score: best, gradeCount: mine.length };
        }
        return { eligible: false, reason: '未達及格線（' + passScore + ' 分）', score: best, gradeCount: mine.length };
    }

    generateCertificateNo() {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const prefix = 'SCH-CERT-' + today + '-';
        const certs = this._ensureMeta().certificates;
        let maxSeq = 0;
        certs.forEach(c => {
            if (c.certificateNo && String(c.certificateNo).indexOf(prefix) === 0) {
                const tail = parseInt(String(c.certificateNo).slice(prefix.length), 10);
                if (isFinite(tail) && tail > maxSeq) maxSeq = tail;
            }
        });
        return prefix + String(maxSeq + 1).padStart(3, '0');
    }

    /** 取得某課程可核發證書的候選人 */
    getCompletionCandidates(courseId, passScore) {
        passScore = passScore != null ? Number(passScore) : 60;
        const enrollments = (this.data.student && this.data.student.enrollments) || [];
        const studentIds = enrollments.filter(e => e.courseId === courseId).map(e => e.studentId);
        const unique = [...new Set(studentIds)];
        const students = this.data.students || [];
        const courses = this.data.courses || [];
        const course = courses.find(c => c.id === courseId);
        const existing = this._ensureMeta().certificates;
        return unique.map(sid => {
            const student = students.find(s => s.id === sid);
            const check = this.checkCourseCompletion(sid, courseId, passScore);
            const issued = existing.find(c => c.studentId === sid && c.courseId === courseId);
            return {
                studentId: sid,
                studentName: student ? student.name : ('#' + sid),
                courseId: courseId,
                courseName: course ? course.name : ('#' + courseId),
                eligible: check.eligible,
                reason: check.reason,
                score: check.score,
                alreadyIssued: !!issued,
                certificateNo: issued ? issued.certificateNo : null
            };
        });
    }

    /** 核發結業證書（寫入 meta.certificates） */
    issueCertificate(studentId, courseId, options) {
        options = options || {};
        const passScore = options.passScore != null ? Number(options.passScore) : 60;
        const check = this.checkCourseCompletion(studentId, courseId, passScore);
        if (!check.eligible) throw new Error(check.reason || '不符合核發條件');
        const meta = this._ensureMeta();
        const dup = meta.certificates.find(c => c.studentId === studentId && c.courseId === courseId);
        if (dup) return dup;
        const student = this._getStudentById(studentId);
        const course = (this.data.courses || []).find(c => c.id === courseId);
        const info = this.getCurrentSemesterInfo();
        const cert = {
            id: Date.now(),
            certificateNo: this.generateCertificateNo(),
            studentId: studentId,
            courseId: courseId,
            studentName: student ? student.name : ('學員#' + studentId),
            courseName: course ? course.name : ('課程#' + courseId),
            score: check.score,
            passScore: passScore,
            semester: options.semester || (course && course.semester) || this.getDefaultSemester(),
            academicYear: info.year ? info.year.label : null,
            issuedAt: new Date().toISOString().slice(0, 10),
            issuedBy: options.issuedBy || 'school_management'
        };
        meta.certificates.push(cert);
        this.save();
        return cert;
    }

    getCertificateById(certId) {
        return this._ensureMeta().certificates.find(c => c.id === certId) || null;
    }

    /** 可列印結業證書 HTML */
    buildCertificateHtml(certOrId) {
        const cert = typeof certOrId === 'object' ? certOrId : this.getCertificateById(certOrId);
        if (!cert) return '';
        const org = (this.data.organizations && this.data.organizations[0]) || {};
        const schoolName = org.nameZh || org.name || '學校';
        const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        return '<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>結業證書 ' + esc(cert.certificateNo) + '</title>' +
            '<style>body{font-family:Georgia,"Microsoft YaHei",serif;text-align:center;padding:48px 40px;color:#1a1a2e;background:#fff}' +
            '.border{border:8px double #0b5fa5;padding:40px 32px;max-width:640px;margin:0 auto}' +
            'h1{font-size:28px;color:#0b5fa5;margin:0 0 8px;letter-spacing:4px}' +
            '.sub{font-size:14px;color:#64748b;margin-bottom:32px}' +
            '.name{font-size:26px;font-weight:bold;margin:24px 0;color:#0b5fa5}' +
            '.body{font-size:16px;line-height:2;margin:20px 0}' +
            '.meta{font-size:12px;color:#666;margin-top:32px;border-top:1px solid #ddd;padding-top:16px}' +
            '@media print{body{padding:20px}}</style></head><body><div class="border">' +
            '<h1>結 業 證 書</h1><p class="sub">Certificate of Completion</p>' +
            '<p class="body">茲證明</p><p class="name">' + esc(cert.studentName) + '</p>' +
            '<p class="body">已完成 <strong>' + esc(cert.courseName) + '</strong> 課程之修讀，<br>成績 ' + esc(cert.score) + ' 分（及格線 ' + esc(cert.passScore) + ' 分），<br>特頒此證。</p>' +
            '<p class="meta">' + esc(schoolName) + '<br>證書編號：' + esc(cert.certificateNo) + '<br>學期：' + esc(cert.semester || '—') + ' · 核發日期：' + esc(cert.issuedAt) + '</p>' +
            '</div><script>window.onload=function(){window.print()}<\/script></body></html>';
    }

    // ==================== W4：課表、教室、小測 ====================

    _ensureProperty() {
        if (!this.data.property) this.data.property = { rooms: [], bookings: [], maintenance: [] };
        if (!Array.isArray(this.data.property.rooms)) this.data.property.rooms = [];
        if (!Array.isArray(this.data.property.bookings)) this.data.property.bookings = [];
        if (!Array.isArray(this.data.property.maintenance)) this.data.property.maintenance = [];
        return this.data.property;
    }

    /** 教室／場地清單（排課、物業管理共用） */
    getRooms() {
        const prop = this._ensureProperty();
        if (prop.rooms.length === 0) {
            [
                { name: 'A101', capacity: 30, building: '主樓', ownershipType: 'owned' },
                { name: 'A102', capacity: 40, building: '主樓', ownershipType: 'owned' },
                { name: 'B201', capacity: 50, building: '副樓', ownershipType: 'owned' },
                { name: '禮堂', capacity: 200, building: '主樓', ownershipType: 'owned' },
                { name: '多功能廳', capacity: 80, building: '副樓', ownershipType: 'rented', monthlyRent: 8000, leaseExpiresAt: '' }
            ].forEach((r, i) => {
                prop.rooms.push(Object.assign({
                    id: 96000 + i,
                    createdAt: new Date().toISOString()
                }, r));
            });
            this.save();
        }
        return prop.rooms;
    }

    getRoomById(roomId) {
        return this.getRooms().find(r => r.id === roomId) || null;
    }

    addRoom(name, opts) {
        opts = opts || {};
        const prop = this._ensureProperty();
        const trimmed = String(name || '').trim();
        if (!trimmed) throw new Error('教室名稱不可為空');
        if (prop.rooms.some(r => r.name === trimmed)) throw new Error('教室已存在');
        const room = {
            id: Date.now(),
            name: trimmed,
            capacity: opts.capacity != null ? Number(opts.capacity) : 30,
            building: opts.building || '',
            note: opts.note || '',
            ownershipType: opts.ownershipType === 'rented' ? 'rented' : 'owned',
            monthlyRent: opts.monthlyRent != null ? Number(opts.monthlyRent) : 0,
            leaseExpiresAt: opts.leaseExpiresAt || '',
            landlord: opts.landlord || ''
        };
        prop.rooms.push(room);
        this.save();
        return room;
    }

    updateRoom(roomId, updates) {
        updates = updates || {};
        const prop = this._ensureProperty();
        const room = prop.rooms.find(r => r.id === roomId);
        if (!room) throw new Error('場地不存在');
        if (updates.name != null) room.name = String(updates.name).trim();
        if (updates.capacity != null) room.capacity = Number(updates.capacity);
        if (updates.building != null) room.building = updates.building;
        if (updates.note != null) room.note = updates.note;
        if (updates.ownershipType != null) room.ownershipType = updates.ownershipType === 'rented' ? 'rented' : 'owned';
        if (updates.monthlyRent != null) room.monthlyRent = Number(updates.monthlyRent);
        if (updates.leaseExpiresAt != null) room.leaseExpiresAt = updates.leaseExpiresAt;
        if (updates.landlord != null) room.landlord = updates.landlord;
        room.updatedAt = new Date().toISOString();
        this.save();
        return room;
    }

    /** 租約到期提醒（預設 90 天內） */
    getLeaseAlerts(daysAhead) {
        daysAhead = daysAhead != null ? Number(daysAhead) : 90;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const limit = new Date(today);
        limit.setDate(limit.getDate() + daysAhead);
        return this.getRooms().filter(r => {
            if (r.ownershipType !== 'rented' || !r.leaseExpiresAt) return false;
            const exp = new Date(r.leaseExpiresAt);
            if (isNaN(exp.getTime())) return false;
            return exp <= limit;
        }).map(r => {
            const exp = new Date(r.leaseExpiresAt);
            const daysLeft = Math.ceil((exp - today) / 86400000);
            return {
                roomId: r.id,
                roomName: r.name,
                leaseExpiresAt: r.leaseExpiresAt,
                monthlyRent: r.monthlyRent,
                daysLeft: daysLeft,
                urgent: daysLeft <= 30
            };
        }).sort((a, b) => a.daysLeft - b.daysLeft);
    }

    getPropertyStats() {
        const prop = this._ensureProperty();
        const alerts = this.getLeaseAlerts(90);
        return {
            room_count: prop.rooms.length,
            rented_count: prop.rooms.filter(r => r.ownershipType === 'rented').length,
            booking_count: prop.bookings.length,
            maintenance_open: prop.maintenance.filter(m => m.status !== 'done' && m.status !== 'cancelled').length,
            lease_alerts: alerts.length,
            lease_alerts_urgent: alerts.filter(a => a.urgent).length
        };
    }

    getBookings(filter) {
        filter = filter || {};
        let list = this._ensureProperty().bookings.slice();
        Object.keys(filter).forEach(k => {
            list = list.filter(b => b[k] === filter[k]);
        });
        return list.sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')));
    }

    addBooking(input) {
        input = input || {};
        this._ensureProperty();
        const room = input.roomId ? this.getRoomById(input.roomId) : null;
        if (!room && !input.roomName) throw new Error('請選擇場地');
        const rec = {
            roomId: room ? room.id : input.roomId,
            roomName: room ? room.name : String(input.roomName),
            title: input.title || '場地預約',
            purpose: input.purpose || 'other',
            startDate: input.startDate || new Date().toISOString().slice(0, 10),
            endDate: input.endDate || input.startDate || new Date().toISOString().slice(0, 10),
            time: input.time || '',
            linkedCourseId: input.linkedCourseId || null,
            note: input.note || '',
            status: 'active'
        };
        return this.insert('property.bookings', rec);
    }

    cancelBooking(bookingId) {
        const prop = this._ensureProperty();
        const b = prop.bookings.find(x => x.id === bookingId);
        if (!b) throw new Error('預約不存在');
        b.status = 'cancelled';
        b.updatedAt = new Date().toISOString();
        this.save();
        return b;
    }

    getMaintenanceTickets(filter) {
        filter = filter || {};
        let list = this._ensureProperty().maintenance.slice();
        Object.keys(filter).forEach(k => {
            list = list.filter(t => t[k] === filter[k]);
        });
        return list.sort((a, b) => String(b.reportedAt || '').localeCompare(String(a.reportedAt || '')));
    }

    /** 報修單：reported → in_progress → done */
    addMaintenanceTicket(input) {
        input = input || {};
        this._ensureProperty();
        const room = input.roomId ? this.getRoomById(input.roomId) : null;
        const rec = {
            roomId: input.roomId || null,
            roomName: room ? room.name : (input.roomName || '—'),
            title: input.title || '報修',
            description: input.description || '',
            priority: input.priority || 'normal',
            reportedBy: input.reportedBy || '',
            reportedAt: new Date().toISOString().slice(0, 10),
            status: 'reported'
        };
        return this.insert('property.maintenance', rec);
    }

    updateMaintenanceStatus(ticketId, status, note) {
        const allowed = ['reported', 'in_progress', 'done', 'cancelled'];
        if (allowed.indexOf(status) < 0) throw new Error('無效狀態');
        const prop = this._ensureProperty();
        const t = prop.maintenance.find(x => x.id === ticketId);
        if (!t) throw new Error('維修單不存在');
        t.status = status;
        if (note) t.note = note;
        if (status === 'in_progress' && !t.startedAt) t.startedAt = new Date().toISOString().slice(0, 10);
        if (status === 'done') t.completedAt = new Date().toISOString().slice(0, 10);
        t.updatedAt = new Date().toISOString();
        this.save();
        return t;
    }

    _parseTimeRange(timeStr) {
        const m = String(timeStr || '').match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
        if (!m) return null;
        const start = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
        const end = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
        if (!isFinite(start) || !isFinite(end) || end <= start) return null;
        return { start: start, end: end };
    }

    _schedulesEnriched() {
        const schedules = (this.data.course && this.data.course.schedules) || [];
        const courses = this.data.courses || [];
        const teachers = this.data.teachers || [];
        return schedules.map(s => {
            const course = courses.find(c => c.id === s.courseId);
            const teacherId = s.teacherId != null ? s.teacherId : (course ? course.teacherId : null);
            const teacher = teachers.find(t => t.id === teacherId);
            return Object.assign({}, s, {
                courseName: course ? course.name : ('#' + s.courseId),
                teacherId: teacherId,
                teacherName: teacher ? teacher.name : '—',
                subject: course ? course.subject : ''
            });
        });
    }

    /** 偵測教師／教室衝堂 */
    detectScheduleConflicts() {
        const items = this._schedulesEnriched();
        const conflicts = [];
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const a = items[i];
                const b = items[j];
                if (a.day !== b.day) continue;
                const ta = this._parseTimeRange(a.time);
                const tb = this._parseTimeRange(b.time);
                if (!ta || !tb) continue;
                if (ta.start >= tb.end || tb.start >= ta.end) continue;
                if (a.teacherId && b.teacherId && a.teacherId === b.teacherId) {
                    conflicts.push({
                        type: 'teacher',
                        ids: [a.id, b.id],
                        day: a.day,
                        message: '教師 ' + a.teacherName + ' 於週' + a.day + ' ' + a.time + ' 與 ' + b.courseName + ' 衝堂'
                    });
                }
                if (a.room && b.room && a.room === b.room) {
                    conflicts.push({
                        type: 'room',
                        ids: [a.id, b.id],
                        day: a.day,
                        message: '教室 ' + a.room + ' 於週' + a.day + ' ' + a.time + ' 與 ' + b.courseName + ' 衝堂'
                    });
                }
            }
        }
        return conflicts;
    }

    /**
     * 週課表資料（供 UI 渲染）
     * @param {object} [opts] { view: 'teacher'|'room'|'all', filterId, teacherId, roomName }
     */
    getWeeklyTimetable(opts) {
        opts = opts || {};
        const view = opts.view || 'all';
        const days = ['一', '二', '三', '四', '五', '六', '日'];
        let items = this._schedulesEnriched();
        if (view === 'teacher') {
            const tid = opts.filterId != null ? opts.filterId : opts.teacherId;
            if (tid != null) items = items.filter(s => s.teacherId === tid);
        } else if (view === 'room') {
            const room = opts.filterId != null ? opts.filterId : opts.roomName;
            if (room) items = items.filter(s => s.room === room);
        }
        const conflictIdSet = {};
        this.detectScheduleConflicts().forEach(c => {
            c.ids.forEach(id => { conflictIdSet[id] = true; });
        });
        const grid = {};
        days.forEach(d => { grid[d] = []; });
        items.forEach(s => {
            const day = s.day || '一';
            if (!grid[day]) grid[day] = [];
            grid[day].push(Object.assign({}, s, { hasConflict: !!conflictIdSet[s.id] }));
        });
        days.forEach(d => {
            grid[d].sort((a, b) => {
                const ta = this._parseTimeRange(a.time);
                const tb = this._parseTimeRange(b.time);
                return (ta ? ta.start : 0) - (tb ? tb.start : 0);
            });
        });
        return {
            days: days,
            grid: grid,
            items: items,
            conflicts: this.detectScheduleConflicts(),
            rooms: this.getRooms(),
            teachers: this.data.teachers || [],
            courses: this.data.courses || []
        };
    }

    /** 新增排課（自動帶 course.teacherId、目前學期） */
    addCourseSchedule(record) {
        record = record || {};
        if (!record.courseId) throw new Error('courseId is required');
        const course = (this.data.courses || []).find(c => c.id === record.courseId);
        const rec = {
            courseId: record.courseId,
            day: record.day || '一',
            time: record.time || '10:00-12:00',
            room: record.room || 'A101',
            teacherId: record.teacherId != null ? record.teacherId : (course ? course.teacherId : null),
            semester: record.semester || (this.getDefaultSemester ? this.getDefaultSemester() : '')
        };
        return this.insert('course.schedules', rec);
    }

    _ensureGradeExams() {
        if (!this.data.grade) this.data.grade = { grades: [], exams: [], assessments: [], reports: [] };
        if (!Array.isArray(this.data.grade.exams)) this.data.grade.exams = [];
        return this.data.grade.exams;
    }

    getExamById(examId) {
        return this._ensureGradeExams().find(e => e.id === examId) || null;
    }

    getExams(filter) {
        filter = filter || {};
        let list = this._ensureGradeExams().slice();
        Object.keys(filter).forEach(k => {
            list = list.filter(e => e[k] === filter[k]);
        });
        return list.sort((a, b) => String(b.examDate || '').localeCompare(String(a.examDate || '')));
    }

    /** 建立小測／考試（exam 定義，非個人成績列） */
    addExam(examInput) {
        examInput = examInput || {};
        if (!examInput.name) throw new Error('考試名稱不可為空');
        if (!examInput.courseId) throw new Error('請選擇課程');
        const course = (this.data.courses || []).find(c => c.id === examInput.courseId);
        const exam = {
            name: String(examInput.name).trim(),
            subject: examInput.subject || (course ? course.subject : ''),
            courseId: examInput.courseId,
            classId: examInput.classId || null,
            maxScore: examInput.maxScore != null ? Number(examInput.maxScore) : 100,
            examDate: examInput.examDate || new Date().toISOString().slice(0, 10),
            semester: examInput.semester || (this.getDefaultSemester ? this.getDefaultSemester() : ''),
            status: examInput.status || 'open'
        };
        return this.insert('grade.exams', exam);
    }

    /** 取得可批量登分的學生（依課程選課；若有 classId 則再篩班級） */
    getExamCandidates(examId) {
        const exam = this.getExamById(examId);
        if (!exam) throw new Error('考試不存在');
        const enrollments = (this.data.student && this.data.student.enrollments) || [];
        let studentIds = enrollments.filter(e => e.courseId === exam.courseId).map(e => e.studentId);
        if (exam.classId) {
            const inClass = (this.data.class && this.data.class.classStudents) || [];
            const classSet = {};
            inClass.filter(cs => cs.classId === exam.classId).forEach(cs => { classSet[cs.studentId] = true; });
            studentIds = studentIds.filter(sid => classSet[sid]);
        }
        const unique = [...new Set(studentIds)];
        const students = this.data.students || [];
        const grades = (this.data.grade && this.data.grade.grades) || [];
        return unique.map(sid => {
            const student = students.find(s => s.id === sid);
            const existing = grades.find(g =>
                g.studentId === sid && g.courseId === exam.courseId &&
                (g.examId === exam.id || g.examDate === exam.examDate)
            );
            return {
                studentId: sid,
                studentName: student ? student.name : ('#' + sid),
                className: student ? student.class : '',
                existingScore: existing ? existing.score : null,
                gradeId: existing ? existing.id : null
            };
        });
    }

    /**
     * 批量登分（小測 UI 一鍵儲存）
     * @param {number} examId
     * @param {object} scoresMap { studentId: score }
     */
    batchSaveExamGrades(examId, scoresMap) {
        const exam = this.getExamById(examId);
        if (!exam) throw new Error('考試不存在');
        scoresMap = scoresMap || {};
        const saved = [];
        Object.keys(scoresMap).forEach(sidKey => {
            const studentId = Number(sidKey);
            const raw = scoresMap[sidKey];
            if (raw === '' || raw == null) return;
            const score = Number(raw);
            if (!isFinite(score)) return;
            const capped = Math.min(score, exam.maxScore != null ? exam.maxScore : 100);
            const row = this.saveGrade({
                studentId: studentId,
                courseId: exam.courseId,
                score: capped,
                examDate: exam.examDate,
                examId: exam.id,
                examName: exam.name
            });
            saved.push(row);
        });
        exam.status = 'graded';
        exam.updatedAt = new Date().toISOString();
        this.save();
        return { exam: exam, savedCount: saved.length, rows: saved };
    }

    // W5 物業 API 已併入 _ensureProperty / getRooms 區塊（updateRoom、getLeaseAlerts、addBooking、addMaintenanceTicket 等）

    // ==================== W6：教會連結（名冊對齊／缺席→牧養預填） ====================

    static get CRM_INTENT_QUEUE_KEY() {
        return 'bible100_crm_intent_v2_pending';
    }

    /** 與主日學 education_data_hub.ABSENCE_ALERT_COUNT 對齊 */
    static get ABSENCE_ALERT_COUNT() {
        return 3;
    }

    _addDaysYmd(days) {
        const d = new Date();
        d.setDate(d.getDate() + (Number(days) || 0));
        return d.toISOString().slice(0, 10);
    }

    /** 教會連結設定（缺席門檻、探訪到期日等，存 meta.churchLink） */
    getChurchLinkSettings() {
        const meta = this._ensureMeta();
        if (!meta.churchLink) {
            meta.churchLink = {
                absenceThreshold: SchoolMasterDatabase.ABSENCE_ALERT_COUNT,
                highPriorityStreak: 5,
                dueDateDays: 3,
                absenceSource: 'both',
                useParentFallback: true
            };
        }
        return meta.churchLink;
    }

    setChurchLinkSettings(partial) {
        const settings = this.getChurchLinkSettings();
        Object.assign(settings, partial || {});
        this.save();
        return settings;
    }

    _readEducationSystemData() {
        try {
            if (typeof window !== 'undefined' && window.ChurchDataBridge && window.ChurchDataBridge.getEducationSystemData) {
                return window.ChurchDataBridge.getEducationSystemData() || { students: [], attendance: [] };
            }
            if (typeof window !== 'undefined' && window.localStorage) {
                const raw = window.localStorage.getItem('educationSystemData');
                if (raw) return JSON.parse(raw);
            }
        } catch (e) {}
        return { students: [], attendance: [], classes: [] };
    }

    _normalizeMemberKey(value) {
        if (!this.isCentralMemberLink(value)) return null;
        return String(value).trim();
    }

    /**
     * 主日學 educationSystemData.students ↔ 學校 students（memberId 比對）
     * 只報告、不合併。
     */
    buildRosterAlignmentReport() {
        const edu = this._readEducationSystemData();
        const eduStudents = Array.isArray(edu.students) ? edu.students : [];
        const schoolStudents = (this.data.students || []).filter(s => s.status !== 'pending');
        const eduByMember = {};
        const schoolByMember = {};

        eduStudents.forEach(s => {
            const mid = this._normalizeMemberKey(s.memberId || s.parentMemberId);
            if (!mid) return;
            if (!eduByMember[mid]) eduByMember[mid] = [];
            eduByMember[mid].push(s);
        });
        schoolStudents.forEach(s => {
            const mid = this._normalizeMemberKey(s.memberId);
            if (!mid) return;
            if (!schoolByMember[mid]) schoolByMember[mid] = [];
            schoolByMember[mid].push(s);
        });

        const aligned = [];
        const sundaySchoolOnly = [];
        const schoolOnly = [];

        Object.keys(eduByMember).forEach(mid => {
            if (schoolByMember[mid]) {
                eduByMember[mid].forEach(es => {
                    schoolByMember[mid].forEach(ss => {
                        aligned.push({
                            memberId: mid,
                            sundaySchoolName: es.name || '—',
                            sundaySchoolId: es.id,
                            schoolName: ss.name || '—',
                            schoolId: ss.id
                        });
                    });
                });
            } else {
                eduByMember[mid].forEach(es => {
                    sundaySchoolOnly.push({ memberId: mid, name: es.name, id: es.id, classId: es.classId });
                });
            }
        });
        Object.keys(schoolByMember).forEach(mid => {
            if (!eduByMember[mid]) {
                schoolByMember[mid].forEach(ss => {
                    schoolOnly.push({ memberId: mid, name: ss.name, id: ss.id, grade: ss.grade });
                });
            }
        });

        const unlinkedSundaySchool = eduStudents.filter(s => !this._normalizeMemberKey(s.memberId || s.parentMemberId));
        const unlinkedSchool = schoolStudents.filter(s => !this._normalizeMemberKey(s.memberId));

        return {
            aligned: aligned,
            sunday_school_only: sundaySchoolOnly,
            school_only: schoolOnly,
            unlinked_sunday_school: unlinkedSundaySchool.map(s => ({ id: s.id, name: s.name })),
            unlinked_school: unlinkedSchool.map(s => ({ id: s.id, name: s.name })),
            counts: {
                aligned: aligned.length,
                sunday_school_only: sundaySchoolOnly.length,
                school_only: schoolOnly.length,
                unlinked_sunday_school: unlinkedSundaySchool.length,
                unlinked_school: unlinkedSchool.length,
                education_total: eduStudents.length,
                school_total: schoolStudents.length
            }
        };
    }

    _absentStreakFromRecords(records, studentId) {
        const sorted = records
            .filter(a => Number(a.studentId) === Number(studentId))
            .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
        let streak = 0;
        for (let i = 0; i < sorted.length; i++) {
            if (!sorted[i].present) streak++;
            else break;
        }
        return streak;
    }

    /** 學校端連續缺席（student.attendance） */
    listSchoolAbsenceWarnings(threshold) {
        const settings = this.getChurchLinkSettings();
        threshold = threshold != null ? Number(threshold) : settings.absenceThreshold;
        const attendance = (this.data.student && this.data.student.attendance) || [];
        const students = (this.data.students || []).filter(s => s.status !== 'pending');
        const out = [];
        students.forEach(s => {
            const streak = this._absentStreakFromRecords(attendance, s.id);
            if (streak >= threshold) {
                out.push({
                    studentId: s.id,
                    memberId: this._normalizeMemberKey(s.memberId),
                    name: s.name,
                    grade: s.grade,
                    streak: streak,
                    source: 'school'
                });
            }
        });
        return out;
    }

    /** 主日學端連續缺席（educationSystemData.attendance） */
    listEducationAbsenceWarnings(threshold) {
        const settings = this.getChurchLinkSettings();
        threshold = threshold != null ? Number(threshold) : settings.absenceThreshold;
        const edu = this._readEducationSystemData();
        const attendance = Array.isArray(edu.attendance) ? edu.attendance : [];
        const students = Array.isArray(edu.students) ? edu.students : [];
        const out = [];
        students.forEach(s => {
            const streak = this._absentStreakFromRecords(attendance, s.id);
            if (streak >= threshold) {
                out.push({
                    studentId: s.id,
                    memberId: this._normalizeMemberKey(s.memberId || s.parentMemberId),
                    name: s.name,
                    classId: s.classId,
                    streak: streak,
                    source: 'education'
                });
            }
        });
        return out;
    }

    /** 學生無 memberId 時，改填家長／監護人 member_id（探訪表單用） */
    _resolvePastoralMemberForWarning(w) {
        if (!w) return null;
        if (w.source === 'education') {
            const edu = this._readEducationSystemData();
            const s = (edu.students || []).find(es => Number(es.id) === Number(w.studentId));
            if (s) {
                const parentMid = this._normalizeMemberKey(s.parentMemberId);
                if (parentMid) return { memberId: parentMid, target: 'parent' };
            }
        }
        const student = this._getStudentById(w.studentId);
        if (student) {
            const parentMid = this._normalizeMemberKey(student.parentMemberId || student.guardianMemberId);
            if (parentMid) return { memberId: parentMid, target: 'parent' };
            const contacts = (this.data.communication && this.data.communication.parentContacts) || [];
            const pc = contacts.find(c => Number(c.studentId) === Number(w.studentId));
            if (pc) {
                const contactMid = this._normalizeMemberKey(pc.memberId || pc.parentMemberId);
                if (contactMid) return { memberId: contactMid, target: 'parent' };
            }
        }
        return null;
    }

    /** 組裝 CRM 探訪跟進預填 intent（不寫入 SSOT；欄位對齊 visitation_followup form） */
    buildAbsencePastoralPrefills(opts) {
        opts = opts || {};
        const settings = this.getChurchLinkSettings();
        const threshold = opts.threshold != null ? Number(opts.threshold) : settings.absenceThreshold;
        const source = opts.source || settings.absenceSource || 'both';
        const dueDays = opts.dueDateDays != null ? Number(opts.dueDateDays) : settings.dueDateDays;
        const highStreak = opts.highPriorityStreak != null ? Number(opts.highPriorityStreak) : settings.highPriorityStreak;
        const useParentFallback = opts.useParentFallback != null ? opts.useParentFallback : settings.useParentFallback;
        let warnings = [];
        if (source === 'school' || source === 'both') {
            warnings = warnings.concat(this.listSchoolAbsenceWarnings(threshold));
        }
        if (source === 'education' || source === 'both') {
            warnings = warnings.concat(this.listEducationAbsenceWarnings(threshold));
        }
        const seen = {};
        const intents = [];
        const dueDate = this._addDaysYmd(dueDays);
        warnings.forEach(w => {
            let mid = w.memberId;
            let followupTarget = 'student';
            if (!mid && useParentFallback) {
                const resolved = this._resolvePastoralMemberForWarning(w);
                if (resolved) {
                    mid = resolved.memberId;
                    followupTarget = resolved.target;
                }
            }
            if (!mid || seen[mid]) return;
            seen[mid] = true;
            const sourceLabel = w.source === 'education' ? '主日學' : '學校';
            const reason = '連續缺席關懷（' + w.streak + ' 次·' + sourceLabel + '）';
            const noteLines = [
                '【W6 學校管理預填】',
                '學生：' + (w.name || '—'),
                '來源：' + sourceLabel,
                '連續缺席：' + w.streak + ' 次'
            ];
            if (followupTarget === 'parent') {
                noteLines.push('（學生未連結 memberId，已改填家長／監護人 member_id，請核對）');
            }
            noteLines.push('請核對 member_id 後在探訪跟進表單儲存。');
            intents.push({
                target_tool: 'visitation_followup.create',
                action: 'create',
                member_id: mid,
                confidence: followupTarget === 'parent' ? 0.75 : 0.85,
                payload: {
                    summary: (w.name || '學生') + ' 連續缺席 ' + w.streak + ' 次（' + sourceLabel + '）',
                    reason: reason,
                    priority: w.streak >= highStreak ? 'high' : 'normal',
                    due_date: dueDate,
                    note: noteLines.join('\n')
                },
                risk_flags: ['absence_streak'],
                suggested_next_actions: ['開啟探訪跟進表單', '核對 member_id']
            });
        });
        return intents;
    }

    _loadCrmIntentQueue() {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return [];
            const raw = window.localStorage.getItem(SchoolMasterDatabase.CRM_INTENT_QUEUE_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    _saveCrmIntentQueue(queue) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(SchoolMasterDatabase.CRM_INTENT_QUEUE_KEY, JSON.stringify(queue));
            }
        } catch (e) {}
    }

    /** 將預填 intent 寫入本機佇列（bible100_crm_intent_v2 信封，HITL） */
    queueCrmIntentPrefills(intents, sourceMeta) {
        intents = intents || [];
        sourceMeta = sourceMeta || {};
        let envelope;
        if (typeof window !== 'undefined' && window.Bible100CrmIntent && window.Bible100CrmIntent.buildEnvelope) {
            envelope = window.Bible100CrmIntent.buildEnvelope({
                channel: sourceMeta.channel || 'school_management',
                raw_text: sourceMeta.raw_text || 'W6 absence pastoral prefill',
                locale: 'zh-Hant'
            }, intents);
        } else {
            envelope = {
                schema_version: 'bible100_crm_intent_v2',
                source: { channel: 'school_management' },
                intents: intents,
                human_review: { required: true, confirmed_at: null },
                routing_mode: 'prefill_only'
            };
        }
        const queue = this._loadCrmIntentQueue();
        const entry = {
            id: 'sch-intent-' + Date.now(),
            createdAt: new Date().toISOString(),
            source: sourceMeta.label || 'school_management_w6',
            envelope: envelope
        };
        queue.push(entry);
        this._saveCrmIntentQueue(queue);
        return { queued: intents.length, entry: entry, queue_size: queue.length };
    }

    getPendingCrmIntentQueue() {
        return this._loadCrmIntentQueue();
    }

    removePendingCrmIntent(entryId) {
        const queue = this._loadCrmIntentQueue().filter(q => q.id !== entryId);
        this._saveCrmIntentQueue(queue);
        return queue.length;
    }

    /** 取得探訪跟進表單路由（供 UI 開啟 prefill；欄位：member_id, reason, priority, due_date, note） */
    routeCrmIntentFromQueue(entryId, intentIndex) {
        const entry = this._loadCrmIntentQueue().find(q => q.id === entryId);
        if (!entry) throw new Error('佇列項目不存在');
        if (typeof window !== 'undefined' && window.Bible100CrmIntent && window.Bible100CrmIntent.routeForPrefill) {
            return window.Bible100CrmIntent.routeForPrefill(entry.envelope, intentIndex != null ? intentIndex : 0);
        }
        const intent = (entry.envelope.intents || [])[intentIndex || 0];
        if (!intent) throw new Error('intent 不存在');
        const p = intent.payload || {};
        return {
            ok: true,
            form_url: 'church_ministry/tools/visitation_followup/form.html',
            prefill: {
                member_id: intent.member_id,
                summary: p.summary || '',
                reason: p.reason || p.summary || '',
                priority: p.priority || 'normal',
                due_date: p.due_date || this._addDaysYmd(this.getChurchLinkSettings().dueDateDays),
                note: p.note || ''
            }
        };
    }

    // ==================== W7：家長通知草稿（只產文字，不發送） ====================

    listParentNoticeTypes() {
        return [
            { id: 'tuition_reminder', label: '繳費提醒' },
            { id: 'absence_care', label: '缺席關懷' },
            { id: 'activity_notice', label: '活動通知' },
            { id: 'general', label: '一般通知' }
        ];
    }

    _genericTuitionDraft(student, schoolName) {
        const pending = ((this.data.finance && this.data.finance.payments) || [])
            .filter(p => p.studentId === student.id && p.status !== 'paid');
        const lines = [
            '【' + schoolName + ' · 學費繳交提醒】',
            '學員：' + (student.name || '—'),
            pending.length ? ('待繳筆數：' + pending.length) : '目前無待繳紀錄，請向出納確認。',
            '',
            '（本訊息由學校管理系統產生草稿，需人工審核後再發送；系統不會自動通知）'
        ];
        return lines.join('\n');
    }

    /**
     * 產生家長通知草稿（copy_only，不自動發送）
     * @param {number} studentId
     * @param {string} noticeType tuition_reminder|absence_care|activity_notice|general
     */
    buildParentNoticeDraft(studentId, noticeType, opts) {
        opts = opts || {};
        const student = this._getStudentById(studentId);
        if (!student) throw new Error('學生不存在');
        const org = (this.data.organizations && this.data.organizations[0]) || {};
        const schoolName = org.nameZh || org.name || '本校';
        const type = noticeType || 'general';
        let subject = '';
        let body = '';

        if (type === 'tuition_reminder') {
            subject = '學費繳交提醒';
            if (opts.paymentId != null) {
                body = this.buildPaymentNoticeText(opts.paymentId);
            } else {
                const pending = ((this.data.finance && this.data.finance.payments) || [])
                    .filter(p => p.studentId === studentId && p.status !== 'paid');
                body = pending.length ? this.buildPaymentNoticeText(pending[0].id) : this._genericTuitionDraft(student, schoolName);
            }
        } else if (type === 'absence_care') {
            const streak = opts.streak != null ? opts.streak : this.getChurchLinkSettings().absenceThreshold;
            subject = '出勤關懷通知';
            body = [
                '【' + schoolName + ' · 出勤關懷】',
                '敬啟者：',
                '您好！我們注意到 ' + (student.name || '學員') + ' 近期連續缺席 ' + streak + ' 次。',
                opts.detail || '若孩子身體不適或有特殊情況，歡迎與班導或教務聯絡。',
                '',
                '（本訊息由學校管理系統產生草稿，需人工審核後再發送；系統不會自動通知）'
            ].join('\n');
        } else if (type === 'activity_notice') {
            subject = opts.activityTitle || '活動通知';
            body = [
                '【' + schoolName + ' · 活動通知】',
                '學員：' + (student.name || '—'),
                opts.activityTitle ? ('活動：' + opts.activityTitle) : '',
                opts.activityDate ? ('日期：' + opts.activityDate) : '',
                opts.detail || '詳情請見校內公告或與班導聯絡。',
                '',
                '（本訊息由學校管理系統產生草稿，需人工審核後再發送）'
            ].filter(Boolean).join('\n');
        } else {
            subject = opts.subject || '學校通知';
            body = opts.detail || ('您好，關於 ' + (student.name || '學員') + ' 的校務通知…\n\n（草稿，請人工審核後再發送）');
        }

        return {
            studentId: studentId,
            studentName: student.name,
            noticeType: type,
            subject: subject,
            body: body,
            channel: opts.channel || student.preferredChannel || 'parent',
            copy_only: true,
            disclaimer: '只產生文字，不會發送'
        };
    }

    /** 將家長通知草稿存至 communication.messages（status=draft） */
    saveParentNoticeDraft(draft) {
        if (!draft || draft.studentId == null) throw new Error('草稿不完整');
        return this.insert('communication.messages', {
            fromUser: 'school',
            toUser: 'student_' + draft.studentId,
            studentId: draft.studentId,
            channel: draft.channel || 'parent',
            content: (draft.subject || '') + '\n\n' + (draft.body || ''),
            priority: 'normal',
            status: 'draft',
            noticeType: draft.noticeType,
            copy_only: true
        });
    }

    // ==================== W8：AI Prompt 生成器（無 API key · 人審草稿） ====================

    static get SCHOOL_AI_DISCLAIMER() {
        return '【AI 草稿治理】必引用經文、不編造經文、不宣稱屬靈權威、不取代老師／牧者、不確定時明說需查證。產出僅供複製到 Kimi／ChatGPT／Claude／Gemini，須人工審核後才使用。';
    }

    listSchoolAiPromptTypes() {
        return [
            { id: 'enrollment_promo', label: '招生宣傳文案', mount: 'enrollment_brochure.html' },
            { id: 'grade_comment', label: '期末成績評語', mount: 'grades' },
            { id: 'exam_questions', label: '小測出題', mount: 'grades/exams.html' },
            { id: 'notice_translate', label: '通告多語翻譯', mount: 'communication/notices.html' }
        ];
    }

    _schoolAiGuard(locale) {
        locale = locale || 'zh-Hant';
        if (typeof window !== 'undefined' && window.B100PromptGuardrails && window.B100PromptGuardrails.guard) {
            return window.B100PromptGuardrails.guard(locale);
        }
        return SchoolMasterDatabase.SCHOOL_AI_DISCLAIMER;
    }

    /** 彙整學生某課程成績摘要（供評語 prompt） */
    getStudentGradeSummary(studentId, courseId) {
        const grades = (this.data.grade && this.data.grade.grades) || [];
        let rows = grades.filter(g => g.studentId === studentId);
        if (courseId != null) rows = rows.filter(g => g.courseId === courseId);
        const scores = rows.map(g => Number(g.score)).filter(n => isFinite(n));
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
        const course = courseId != null ? (this.data.courses || []).find(c => c.id === courseId) : null;
        return {
            grade_count: rows.length,
            average: avg,
            best: scores.length ? Math.max.apply(null, scores) : null,
            course_name: course ? (course.name || course.subject) : null,
            rows: rows.slice(-5)
        };
    }

    /**
     * 產生校務 AI Prompt（複製貼外部 LLM，不自動呼叫 API）
     * @param {string} type enrollment_promo|grade_comment|exam_questions|notice_translate
     */
    buildSchoolAiPrompt(type, opts) {
        opts = opts || {};
        const locale = opts.locale || 'zh-Hant';
        const guard = this._schoolAiGuard(locale);
        const org = (this.data.organizations && this.data.organizations[0]) || {};
        const schoolName = org.nameZh || org.name || '本校';
        const semInfo = this.getCurrentSemesterInfo();
        const semLabel = semInfo.semester ? semInfo.semester.label : this.getDefaultSemester();
        const lines = [guard, ''];

        if (type === 'enrollment_promo') {
            const courseId = opts.courseId != null ? Number(opts.courseId) : null;
            const courses = (this.data.courses || []).filter(c => c.status !== 'inactive');
            const course = courseId ? courses.find(c => c.id === courseId) : null;
            const courseList = course
                ? [course.name + '（' + (course.subject || '—') + '）']
                : courses.slice(0, 8).map(c => c.name + ' · ' + (c.subject || '—'));
            lines.push('【招生宣傳文案草稿 · ' + schoolName + '】');
            lines.push('學期：' + semLabel);
            lines.push('對象：' + (opts.audience || '主日學／聖經培訓意向家庭'));
            lines.push('語氣：' + (opts.tone || '溫暖、清楚、非推銷'));
            lines.push('重點課程：');
            courseList.forEach(function (c) { lines.push('- ' + c); });
            if (opts.extra) lines.push('補充：' + opts.extra);
            lines.push('');
            lines.push('請產出：');
            lines.push('1) 300 字招生簡介（繁體中文）');
            lines.push('2) 3 句家長常見問答（FAQ）');
            lines.push('3) 海報主標＋副標（各一句，適合 ai_tools 文字轉圖像）');
            lines.push('4) 需老師人工核對的事項清單');
        } else if (type === 'grade_comment') {
            const studentId = Number(opts.studentId);
            const student = this._getStudentById(studentId);
            if (!student) throw new Error('學生不存在');
            const courseId = opts.courseId != null ? Number(opts.courseId) : null;
            const summary = this.getStudentGradeSummary(studentId, courseId);
            lines.push('【期末成績評語草稿】');
            lines.push('學校：' + schoolName + ' · 學期：' + semLabel);
            lines.push('學生：' + (student.name || studentId) + (student.grade ? ' · 年級：' + student.grade : ''));
            if (summary.course_name) lines.push('課程：' + summary.course_name);
            lines.push('成績摘要：共 ' + summary.grade_count + ' 筆' +
                (summary.average != null ? '，平均 ' + summary.average + ' 分' : '') +
                (summary.best != null ? '，最高 ' + summary.best + ' 分' : ''));
            if (opts.strengths) lines.push('老師觀察優點：' + opts.strengths);
            if (opts.improvements) lines.push('待改進：' + opts.improvements);
            lines.push('');
            lines.push('請產出：');
            lines.push('1) 80–120 字期末評語（繁體，適合家長面談／通知）');
            lines.push('2) 一條鼓勵經文方向（勿編造章節，不確定寫「需查證」）');
            lines.push('3) 老師覆核 checklist（3 項）');
        } else if (type === 'exam_questions') {
            const courseId = Number(opts.courseId);
            const course = (this.data.courses || []).find(c => c.id === courseId);
            if (!course) throw new Error('請選擇課程');
            const qTypes = opts.questionTypes || '選擇題、填充題、簡答';
            const count = opts.count != null ? Number(opts.count) : 10;
            lines.push('【小測出題草稿 · ' + (course.name || course.subject) + '】');
            lines.push('學校：' + schoolName + ' · 學期：' + semLabel);
            lines.push('教材範圍：' + (opts.scope || course.subject || '請老師補充章節／經文'));
            lines.push('題型：' + qTypes + ' · 題數約 ' + count);
            lines.push('對象：' + (opts.audience || '主日學／培訓班學生'));
            if (opts.scripture) lines.push('指定經文：' + opts.scripture);
            lines.push('');
            lines.push('請產出：');
            lines.push('1) ' + count + ' 題（含題幹）');
            lines.push('2) 參考答案與簡短解析');
            lines.push('3) 標示難度（易／中／難）');
            lines.push('4) 需老師刪改或查證經文的提醒');
        } else if (type === 'notice_translate') {
            const source = opts.sourceText || opts.text || '';
            const langs = opts.targetLangs || ['en', 'vi', 'id'];
            const langLabels = { en: 'English', vi: 'Tiếng Việt', id: 'Bahasa Indonesia', cn: '简体中文' };
            lines.push('【通告多語翻譯草稿 · 保留中文源文】');
            lines.push('學校：' + schoolName);
            lines.push('中文源文：');
            lines.push(source || '（請貼上中文通告全文）');
            lines.push('');
            lines.push('請翻譯為：' + langs.map(function (l) { return langLabels[l] || l; }).join('、'));
            lines.push('格式：每語言一段，段首標語言代碼；保留中文源文於最上方；小語種為 AI 草稿須人校。');
        } else {
            throw new Error('不支援的 prompt 類型：' + type);
        }

        return {
            prompt_type: type,
            locale: locale,
            disclaimer: SchoolMasterDatabase.SCHOOL_AI_DISCLAIMER,
            copy_only: true,
            no_api: true,
            text: lines.join('\n')
        };
    }

    /**
     * 教師授課技能回流智慧事奉（須 volunteerId＝中央 member_id）
     * @param {number} teacherId
     * @param {string[]} [skillNames] 若省略則由授課科目推導
     */
    pushTeacherSkillsToSmartMinistry(teacherId, skillNames) {
        const teacher = (this.data.teachers || []).find(t => t.id === teacherId);
        if (!teacher) throw new Error('教師不存在');
        const talentId = teacher.volunteerId;
        if (!this.isCentralMemberLink(talentId)) {
            throw new Error('請先連結會友義工（volunteerId＝member_id）');
        }
        if (typeof window === 'undefined' || !window.SmartMinistryCanonical) {
            throw new Error('SmartMinistryCanonical 未載入');
        }
        const canon = window.SmartMinistryCanonical;
        if (!canon.saveOrUpdateTalent || !canon.setTalentSkills) {
            throw new Error('SmartMinistryCanonical API 不完整');
        }
        let skills = skillNames;
        if (!skills || !skills.length) {
            const courses = (this.data.courses || []).filter(c => c.teacherId === teacherId);
            skills = courses.map(c => c.subject || c.name).filter(Boolean);
            if (teacher.subject) skills.unshift(teacher.subject);
            skills = [...new Set(skills)];
        }
        canon.saveOrUpdateTalent({
            talent_id: String(talentId),
            member_id: String(talentId),
            name: teacher.name || ('教師#' + teacherId)
        });
        canon.setTalentSkills(String(talentId), skills);
        return { talent_id: String(talentId), skills: skills, skill_count: skills.length };
    }

    /**
     * 門訓動力站連接：取得可作為培訓教材的課程（供 Disciple Dynamics 整合）
     * @param {object} [filter] { deliveryMode, subject }
     */
    getCoursesForTraining(filter = {}) {
        let list = (this.data.courses || []).filter(c => c.status === 'active');
        if (filter.deliveryMode) list = list.filter(c => c.deliveryMode === filter.deliveryMode);
        if (filter.subject) list = list.filter(c => c.subject === filter.subject);
        return list;
    }

    /**
     * AI 智慧事奉連接：取得學生偏好溝通管道（供 Smart Ministry 整合）
     * @param {number} studentId
     */
    getStudentPreferredChannel(studentId) {
        const s = (this.data.students || []).find(st => st.id === studentId);
        return s ? (s.preferredChannel || 'email') : null;
    }

    /**
     * 載入完整示範資料（學生、教師、課程、班級、選課、成績、繳費）
     * W0：必須明確傳入 force === true 才會執行（僅「載入示範」頁使用）；
     * 全站舊有的自動呼叫一律變成 no-op，不再自動污染真實資料。
     */
    ensureSeedFull(force) {
        if (force !== true) return;
        if (!this.data) this.data = {};
        if (!Array.isArray(this.data.students)) this.data.students = [];
        if (!Array.isArray(this.data.teachers)) this.data.teachers = [];
        if (!Array.isArray(this.data.courses)) this.data.courses = [];
        if (!this.data.class) this.data.class = { classes: [], classStudents: [], classTeachers: [], subjects: [], activities: [] };
        if (!this.data.student) this.data.student = { profiles: [], enrollments: [], attendance: [], homework: [], progress: [] };
        if (!this.data.grade) this.data.grade = { grades: [], exams: [], assessments: [], reports: [] };
        if (!this.data.finance) this.data.finance = { tuition: [], payments: [], transactions: [], expenses: [], budgets: [], reports: [] };
        const needCore = this.data.students.length === 0 || this.data.teachers.length === 0 || this.data.courses.length === 0;
        const needExtras = needCore || !this.data.communication?.notices?.length || !this.data.course?.schedules?.length || !this.data.teacher?.schedules?.length;
        if (!needCore && !needExtras) return;

        let orgMain = this.data.organizations && this.data.organizations[0];
        if (!orgMain) {
            orgMain = this.upsertOrganization({
                name: '總校', code: 'MAIN', type: 'main',
                nameZh: '總校', nameEn: 'Main Campus', language: 'zh-Hant'
            });
        }
        const orgId = orgMain.id;
        const studentIds = this.data.students.map(s => s.id);
        const teacherIds = this.data.teachers.map(t => t.id);
        const courseIds = this.data.courses.map(c => c.id);

        const surnames = ['王','李','張','劉','陳','楊','黃','趙','周','吳','徐','孫','馬','朱','胡','郭','何','林','高','羅','鄭','梁','謝','宋','唐','許','韓','馮','鄧','曹','彭','曾','蕭','田','董','潘','袁','蔡','蔣','余','杜','葉','程','蘇','魏','呂','丁','任','沈','姚','盧','姜','崔','鍾','譚','陸','汪','范','金','石','廖','賈','夏','韋','傅','方','白','鄒','孟','熊','秦','邱','江','尹','薛','閻','段','雷','侯','龍','史','陶','黎','賀','顧','毛','郝','龔','邵','萬','錢','嚴','覃','武','戴','莫','孔','向','湯'];
        const givenM = ['偉','強','磊','洋','勇','軍','杰','濤','明','超','建','平','剛','輝','鵬','華','飛','鑫','波','斌','宇','浩','凱','健','俊','帆','峰','陽','亮','龍','博','成','林','峰','鑫','昊','哲','涵','睿','澤','軒','晨','睿','昊','弘','淵','熙','峻','凱','博'];
        const givenF = ['芳','娜','敏','靜','麗','艷','娟','莉','萍','紅','梅','霞','秀','英','華','慧','玲','雪','琳','潔','雲','婷','燕','萍','玉','琴','麗','萍','娟','敏','紅','梅','霞','秀','英','華','慧','玲','雪','琳','潔','雲','婷','燕','玉','琴','麗','娟','敏','芳'];
        const grades = ['幼幼班','小班','中班','大班','一年級','二年級','三年級','四年級','五年級','六年級','國一','國二','國三','高一','高二','高三','成人主日學'];
        const classes = ['A','B','C','D','E'];
        const subjects = ['聖經故事','詩歌敬拜','品格教育','門徒訓練','領袖培訓','婚姻家庭','兒童主日學','青少年事工','靈命成長','查經小組'];

        if (needCore && this.data.students.length === 0) {
            for (let i = 0; i < 200; i++) {
                const s = surnames[i % surnames.length];
                const g = (i % 2 === 0) ? givenM[(i >> 1) % givenM.length] : givenF[(i >> 1) % givenF.length];
                const ch = ['line','whatsapp','wechat','email'][i % 4];
                this.data.students.push({
                    id: 10000 + i, name: s + g + (i >= 100 ? String(Math.floor(i / 100)) : ''),
                    studentNumber: 'S' + String(i + 1).padStart(3, '0'), grade: grades[i % grades.length], class: classes[i % classes.length], class_id: (i % 5) + 1,
                    gender: i % 2 === 0 ? '男' : '女', phone: '09' + String(10000000 + i).slice(-8), email: 's' + i + '@church.org', contact: '09' + String(10000000 + i).slice(-8),
                    lineId: ch === 'line' ? 'line_' + i : undefined, whatsappId: ch === 'whatsapp' ? '+886' + String(900000000 + i) : undefined,
                    wechatId: ch === 'wechat' ? 'wx_' + i : undefined, preferredChannel: ch,
                    status: i % 10 < 8 ? 'active' : 'inactive', enrollmentDate: (2024 + (i % 2)) + '-' + String((i % 12) + 1).padStart(2, '0') + '-' + String((i % 28) + 1).padStart(2, '0'),
                    organizationId: orgId, language: 'zh-Hant', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (needCore && this.data.teachers.length === 0) {
            const teacherNames = ['陳牧師','林老師','黃姊妹','王弟兄','張老師','李牧師','吳老師','劉姊妹','楊弟兄','趙老師','周牧師','徐老師','孫姊妹','馬弟兄','朱老師','胡牧師','郭老師','何姊妹','林弟兄','高老師'];
            for (let i = 0; i < 25; i++) {
                const src = i % 5 === 0 ? 'youtube' : (i % 5 === 1 ? 'external' : 'church');
                this.data.teachers.push({
                    id: 20000 + i, name: teacherNames[i % teacherNames.length] + (i >= 20 ? (i - 19) : ''),
                    teacherNumber: 'T' + String(i + 1).padStart(2, '0'), subject: subjects[i % subjects.length],
                    phone: '09' + String(20000000 + i).slice(-8), email: 't' + i + '@church.org',
                    sourceType: src, mediaUrl: src === 'youtube' ? 'https://youtube.com/watch?v=sample' + i : undefined,
                    expertise: [subjects[i % subjects.length]],
                    status: 'active', organizationId: orgId, language: 'zh-Hant', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (needCore && this.data.courses.length === 0) {
            const courseNames = ['聖經基礎','詩歌敬拜入門','品格建造','門徒訓練初階','領袖培育','婚姻輔導','兒童主日學A','青少年事工','靈命成長','查經：創世記','查經：出埃及記','敬拜服事','小組帶領','福音佈道','禱告學校','聖經人物','新約概論','舊約概論','信仰問答','事奉裝備'];
            const tIds = this.data.teachers.map(t => t.id);
            for (let i = 0; i < 30; i++) {
                const sub = subjects[i % subjects.length];
                const dm = ['onsite','online','hybrid','ebook'][i % 4];
                this.data.courses.push({
                    id: 30000 + i, name: courseNames[i % courseNames.length] + (i >= 20 ? (i - 19) : ''),
                    code: 'C' + String(i + 1).padStart(2, '0'), teacherId: tIds[i % tIds.length] || 20000, credits: 2 + (i % 3),
                    subject: sub, grade: grades[i % 5], deliveryMode: dm, platform: dm === 'online' ? 'Zoom' : (dm === 'ebook' ? 'eBook' : undefined),
                    zoomLink: dm === 'online' || dm === 'hybrid' ? 'https://zoom.us/j/sample' + i : undefined,
                    ebookUrl: dm === 'ebook' ? '/ebooks/course' + i + '.pdf' : undefined, examUrl: i % 3 === 0 ? '/exams/c' + i : undefined,
                    status: 'active', organizationId: orgId, language: 'zh-Hant', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (needCore && this.data.class.classes.length === 0) {
            const tIds = this.data.teachers.map(t => t.id);
            for (let i = 0; i < 20; i++) {
                const cdm = i % 3 === 0 ? 'zoom' : (i % 3 === 1 ? 'hybrid' : 'onsite');
                this.data.class.classes.push({
                    id: 40000 + i, name: grades[i % 8] + classes[i % 5], grade: grades[i % 8],
                    teacherId: tIds[i % tIds.length] || 20000, capacity: 15 + (i % 10),
                    deliveryMode: cdm, zoomId: cdm !== 'onsite' ? 'zoom' + i : undefined,
                    zoomLink: cdm !== 'onsite' ? 'https://zoom.us/j/class' + i : undefined,
                    organizationId: orgId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (needCore && this.data.class.classStudents.length === 0 && this.data.students.length > 0 && this.data.class.classes.length > 0) {
            const sIds = this.data.students.map(s => s.id);
            const cIds = this.data.class.classes.map(c => c.id);
            for (let i = 0; i < Math.min(150, sIds.length); i++) {
                this.data.class.classStudents.push({
                    id: 45000 + i, studentId: sIds[i % sIds.length], classId: cIds[i % cIds.length],
                    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (needCore && this.data.student.enrollments.length === 0) {
            const sIds = this.data.students.map(s => s.id);
            const cIds = this.data.courses.map(c => c.id);
            for (let i = 0; i < Math.min(400, sIds.length * 2); i++) {
                this.data.student.enrollments.push({
                    id: 50000 + i, studentId: sIds[i % sIds.length], courseId: cIds[i % cIds.length], semester: '2024-2', status: 'active', organizationId: orgId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (needCore && this.data.grade.grades.length === 0) {
            const sIds = this.data.students.map(s => s.id);
            const cIds = this.data.courses.map(c => c.id);
            for (let i = 0; i < Math.min(300, sIds.length + 100); i++) {
                const score = 60 + (i % 40);
                this.data.grade.grades.push({
                    id: 60000 + i, studentId: sIds[i % sIds.length], courseId: cIds[i % cIds.length], examDate: '2024-' + String((i % 12) + 1).padStart(2, '0') + '-15',
                    score: score, grade: ['F','D','C','B','A'][Math.min(4, Math.floor(score / 20))],
                    semester: '2024-2', organizationId: orgId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (needCore && this.data.finance.payments.length === 0) {
            const sIds = this.data.students.map(s => s.id);
            for (let i = 0; i < Math.min(150, sIds.length); i++) {
                const pm = ['cash','transfer','alipay','payme'][i % 4];
                this.data.finance.payments.push({
                    id: 70000 + i, studentId: sIds[i % sIds.length], amount: 500 + (i % 5) * 100,
                    paymentDate: '2024-' + String((i % 12) + 1).padStart(2, '0') + '-01', status: i % 10 < 8 ? 'paid' : 'pending',
                    paymentMethod: pm, transactionId: pm !== 'cash' ? 'txn' + (70000 + i) : undefined,
                    semester: '2024-2', organizationId: orgId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (!this.data.finance.transactions) this.data.finance.transactions = [];
        if (needCore && this.data.finance.transactions.length === 0) {
            for (let i = 0; i < 20; i++) {
                const isInc = i % 3 !== 0;
                this.data.finance.transactions.push({
                    id: 80000 + i, type: isInc ? 'income' : 'expense', category: isInc ? '學費' : '教材',
                    amount: isInc ? 3000 + (i % 5) * 500 : 200 + (i % 3) * 100,
                    memo: isInc ? '學費收入' : '教材採購', at: '2024-' + String((i % 12) + 1).padStart(2, '0') + '-15T10:00:00Z',
                    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (!this.data.activity) this.data.activity = { activities: [], competitions: [], clubs: [], events: [] };
        if (needCore && this.data.activity.activities.length === 0) {
            const actNames = ['聖經學習營','信仰分享會','詩歌比賽','兒童營會','青少年退修會','查經小組','主日學成果展','感恩節活動'];
            const venues = ['教室A101','禮堂','多功能廳','戶外廣場','會議室'];
            for (let i = 0; i < 12; i++) {
                this.data.activity.activities.push({
                    id: 90000 + i, name: actNames[i % actNames.length] + (i >= 8 ? ' ' + (i - 7) : ''),
                    type: ['學習活動','分享活動','比賽活動','營會','退修會'][i % 5],
                    startDate: '2025-' + String((i % 6) + 3).padStart(2, '0') + '-' + String((i % 20) + 1).padStart(2, '0'),
                    venue: venues[i % venues.length], status: ['進行中','報名中','籌備中'][i % 3],
                    capacity: 30 + (i % 5) * 10, organizationId: orgId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }
        if (needCore && this.data.activity.clubs.length === 0) {
            const clubNames = ['詩歌社','查經社','戲劇社','美術社','服務社','禱告社','青年團契','兒童主日學'];
            for (let i = 0; i < 8; i++) {
                this.data.activity.clubs.push({
                    id: 91000 + i, name: clubNames[i], advisorId: teacherIds[i % teacherIds.length] || 20000,
                    memberCount: 5 + (i % 10), status: 'active', organizationId: orgId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }
        if (needCore && this.data.activity.competitions.length === 0) {
            const compNames = ['聖經知識競賽','詩歌創作比賽','說故事比賽','海報設計'];
            for (let i = 0; i < 6; i++) {
                this.data.activity.competitions.push({
                    id: 92000 + i, name: compNames[i % compNames.length] + (i >= 4 ? ' ' + (i - 3) : ''),
                    eventDate: '2025-' + String((i % 4) + 5).padStart(2, '0') + '-15', status: ['報名中','進行中','已結束'][i % 3],
                    organizationId: orgId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (!this.data.communication) this.data.communication = { notices: [], messages: [], parentContacts: [], feedback: [] };
        if (!this.data.communication.notices || this.data.communication.notices.length === 0) {
            const noticeTitles = ['2025春季班開課通知','學費繳交提醒','成績公布通知','主日學成果展報名','聖經學習營開放報名'];
            for (let i = 0; i < 5; i++) {
                this.data.communication.notices.push({
                    id: 93000 + i, title: noticeTitles[i], scope: 'all', content: '請學員留意相關事項。',
                    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            }
        }

        if (!this.data.course) this.data.course = { schedules: [], materials: [], evaluations: [], prerequisites: [] };
        if (!this.data.course.schedules || this.data.course.schedules.length === 0) {
            const cIds = this.data.courses.slice(0, 15).map(c => c.id);
            const days = ['一','二','三','四','五','六'];
            const rooms = ['A101','A102','B201','禮堂','多功能廳'];
            cIds.forEach((cid, i) => {
                this.data.course.schedules.push({
                    id: 94000 + i, courseId: cid, day: days[i % 6], time: (9 + (i % 4)) + ':00-' + (11 + (i % 2)) + ':00',
                    room: rooms[i % 5], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            });
        }

        if (!this.data.teacher) this.data.teacher = { schedules: [], evaluations: [], workload: [] };
        if (!this.data.teacher.schedules || this.data.teacher.schedules.length === 0) {
            const tIds = this.data.teachers.slice(0, 15).map(t => t.id);
            const cIds = this.data.courses.slice(0, 15).map(c => c.id);
            tIds.forEach((tid, i) => {
                this.data.teacher.schedules.push({
                    id: 95000 + i, teacherId: tid, courseId: cIds[i % cIds.length],
                    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                });
            });
        }

        this.save();
        if (!this.data.meta) this.data.meta = {};
        this.data.meta.isDemoSeed = true;
        this.data.meta.seedLoadedAt = new Date().toISOString();
        this.save();
        if (typeof window !== 'undefined' && window.DataTrustBadge && window.DataTrustBadge.markSchoolDemoLoaded) {
            window.DataTrustBadge.markSchoolDemoLoaded();
        }
        console.log('✅ 完整示範資料已載入（學生 ' + this.data.students.length + '、教師 ' + this.data.teachers.length + '、課程 ' + this.data.courses.length + '）');
    }

    /**
     * 補足至少 minCount 筆學生示範資料（用於開學展示）
     * W0：必須明確傳入 force === true 才會執行。
     * @param {number} minCount 最少學生數，預設 200
     */
    ensureSeedStudents(minCount = 200, force) {
        if (force !== true) return;
        const current = this.data.students.length;
        if (current >= minCount) return;

        const orgMain = this.data.organizations && this.data.organizations[0];
        const orgId = orgMain ? orgMain.id : null;
        const surnames = ['王','李','張','劉','陳','楊','黃','趙','周','吳','徐','孫','馬','朱','胡','郭','何','林','高','羅','鄭','梁','謝','宋','唐','許','韓','馮','鄧','曹','彭','曾','蕭','田','董','潘','袁','蔡','蔣','余','杜','葉','程','蘇','魏','呂','丁','任','沈','姚','盧','姜','崔','鍾','譚','陸','汪','范','金','石','廖','賈','夏','韋','傅','方','白','鄒','孟','熊','秦','邱','江','尹','薛','閻','段','雷','侯','龍','史','陶','黎','賀','顧','毛','郝','龔','邵','萬','錢','嚴','覃','武','戴','莫','孔','向','湯'];
        const givenM = ['偉','強','磊','洋','勇','軍','杰','濤','明','超','建','平','剛','輝','鵬','華','飛','鑫','波','斌','宇','浩','凱','健','俊','帆','峰','陽','亮','龍','博','成','林','峰','鑫','昊','哲','涵','睿','澤','軒','晨','睿','昊','弘','淵','熙','峻','凱','博'];
        const givenF = ['芳','娜','敏','靜','麗','艷','娟','莉','萍','紅','梅','霞','秀','英','華','慧','玲','雪','琳','潔','雲','婷','燕','萍','玉','琴','麗','萍','娟','敏','紅','梅','霞','秀','英','華','慧','玲','雪','琳','潔','雲','婷','燕','玉','琴','麗','娟','敏','芳'];
        const grades = ['幼幼班','小班','中班','大班','一年級','二年級','三年級','四年級','五年級','六年級','國一','國二','國三','高一','高二','高三','成人主日學'];
        const classes = ['A','B','C','D','E'];

        for (let i = current; i < minCount; i++) {
            const s = surnames[i % surnames.length];
            const g = (i % 2 === 0) ? givenM[(i >> 1) % givenM.length] : givenF[(i >> 1) % givenF.length];
            const name = s + g + (i >= 100 ? String(Math.floor(i / 100)) : '');
            const grade = grades[i % grades.length];
            const cls = classes[i % classes.length];
            const baseId = Date.now();
            this.data.students.push({
                id: baseId + i,
                name: name,
                studentNumber: 'S' + String(Math.floor(i / 10) + 1).padStart(2, '0') + String(i % 10),
                grade: grade,
                class: cls,
                class_id: (i % 5) + 1,
                gender: i % 2 === 0 ? '男' : '女',
                phone: '09' + String(10000000 + i).slice(-8),
                email: name + (i % 10) + '@church.org',
                contact: '09' + String(10000000 + i).slice(-8),
                status: i % 10 < 8 ? 'active' : 'inactive',
                enrollmentDate: (2024 + (i % 2)) + '-' + String((i % 12) + 1).padStart(2, '0') + '-' + String((i % 28) + 1).padStart(2, '0'),
                organizationId: orgId,
                language: 'zh-Hant',
                source: 'school_demo_seed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        this.save();
        console.log('✅ 已確保至少有 ' + minCount + ' 筆學生示範資料');
    }

    // ==================== W0：全庫備份與種子治理 ====================

    /** 匯出全庫 JSON 字串（含 meta），供備份下載。 */
    exportAll() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * 以備份 JSON 覆蓋全庫（匯入前請先匯出現況）。
     * @returns {{ok: boolean, error?: string}}
     */
    importAll(jsonText) {
        try {
            const parsed = JSON.parse(jsonText);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                return { ok: false, error: '備份格式錯誤：內容不是資料庫物件' };
            }
            if (!Array.isArray(parsed.students) && !Array.isArray(parsed.teachers) && !Array.isArray(parsed.courses)) {
                return { ok: false, error: '備份格式錯誤：找不到 students / teachers / courses 任何一項' };
            }
            this.data = parsed;
            if (!this.data.meta) this.data.meta = {};
            this.data.meta.importedAt = new Date().toISOString();
            this.save();
            return { ok: true };
        } catch (e) {
            return { ok: false, error: String(e.message || e) };
        }
    }

    /**
     * 判斷一筆資料是否為示範種子列。
     * 規則：真實資料由 insert() 產生 13 位時間戳 ID；
     * 舊種子（ensureSeedFull／generateSampleData）ID 皆 < 10 億，
     * 新種子另帶 source: 'school_demo_seed' 標記。
     */
    isSeedRecord(row) {
        if (!row || typeof row !== 'object') return false;
        if (row.source === 'school_demo_seed') return true;
        return typeof row.id === 'number' && row.id > 0 && row.id < 1000000000;
    }

    /**
     * 清除示範種子資料、保留真實填寫資料。
     * organizations（學校設定）與 meta 不動。
     * @returns {Object} 各表移除筆數，如 { students: 200, 'grade.grades': 320 }
     */
    clearSeedData() {
        const removed = {};
        const self = this;
        Object.keys(this.data).forEach(function (k) {
            if (k === 'organizations' || k === 'meta') return;
            const v = self.data[k];
            if (Array.isArray(v)) {
                const before = v.length;
                self.data[k] = v.filter(function (r) { return !self.isSeedRecord(r); });
                const diff = before - self.data[k].length;
                if (diff > 0) removed[k] = diff;
            } else if (v && typeof v === 'object') {
                Object.keys(v).forEach(function (k2) {
                    const arr = v[k2];
                    if (!Array.isArray(arr)) return;
                    const before2 = arr.length;
                    v[k2] = arr.filter(function (r) { return !self.isSeedRecord(r); });
                    const diff2 = before2 - v[k2].length;
                    if (diff2 > 0) removed[k + '.' + k2] = diff2;
                });
            }
        });
        if (!this.data.meta) this.data.meta = {};
        this.data.meta.isDemoSeed = false;
        this.data.meta.seedClearedAt = new Date().toISOString();
        this.save();
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem('school_management_demo_loaded_at');
            }
        } catch (e) {}
        return removed;
    }

    /**
     * 生成示例数据（用于测试）
     */
    generateSampleData() {
        // 生成組織（主校＋分校）
        const orgMain = this.upsertOrganization({
            name: '總校',
            code: 'MAIN',
            type: 'main',
            nameZh: '總校',
            nameEn: 'Main Campus',
            nameVi: 'Trường chính',
            language: 'zh-Hans'
        });
        const orgBranch = this.upsertOrganization({
            name: '分校 A',
            code: 'BR_A',
            type: 'branch',
            parentId: orgMain.id,
            nameZh: '分校 A',
            nameEn: 'Branch A',
            nameVi: 'Cơ sở A',
            language: 'zh-Hans'
        });

        // 生成学生数据
        const sampleStudents = [
            { id: 1, name: '张小明', studentNumber: 'S001', grade: '一年级', class: '1A', phone: '13800138001', email: 'zhang@example.com', status: 'active', enrollmentDate: '2024-09-01', organizationId: orgMain.id, language: 'zh-Hans' },
            { id: 2, name: '李小红', studentNumber: 'S002', grade: '一年级', class: '1A', phone: '13800138002', email: 'li@example.com', status: 'active', enrollmentDate: '2024-09-01', organizationId: orgMain.id, language: 'zh-Hans' },
            { id: 3, name: '王小强', studentNumber: 'S003', grade: '二年级', class: '2A', phone: '13800138003', email: 'wang@example.com', status: 'active', enrollmentDate: '2024-09-01', organizationId: orgBranch.id, language: 'zh-Hans' },
            { id: 4, name: '赵小美', studentNumber: 'S004', grade: '二年级', class: '2A', phone: '13800138004', email: 'zhao@example.com', status: 'active', enrollmentDate: '2024-09-01', organizationId: orgBranch.id, language: 'zh-Hans' },
            { id: 5, name: '钱小华', studentNumber: 'S005', grade: '三年级', class: '3A', phone: '13800138005', email: 'qian@example.com', status: 'active', enrollmentDate: '2024-09-01', organizationId: orgMain.id, language: 'zh-Hans' }
        ];
        
        this.data.students = sampleStudents;
        
        // 生成教师数据
        const sampleTeachers = [
            { id: 1, name: '陈老师', teacherNumber: 'T001', subject: '语文', phone: '13800138101', email: 'chen@example.com', status: 'active', organizationId: orgMain.id, language: 'zh-Hans' },
            { id: 2, name: '林老师', teacherNumber: 'T002', subject: '数学', phone: '13800138102', email: 'lin@example.com', status: 'active', organizationId: orgMain.id, language: 'zh-Hans' },
            { id: 3, name: '黄老师', teacherNumber: 'T003', subject: '英语', phone: '13800138103', email: 'huang@example.com', status: 'active', organizationId: orgBranch.id, language: 'en' }
        ];
        
        this.data.teachers = sampleTeachers;
        
        // 生成课程数据
        const sampleCourses = [
            { id: 1, name: '语文', code: 'CH001', teacherId: 1, credits: 3, grade: '一年级', status: 'active', organizationId: orgMain.id, language: 'zh-Hans' },
            { id: 2, name: '数学', code: 'MA001', teacherId: 2, credits: 3, grade: '一年级', status: 'active', organizationId: orgMain.id, language: 'zh-Hans' },
            { id: 3, name: '英语', code: 'EN001', teacherId: 3, credits: 2, grade: '一年级', status: 'active', organizationId: orgBranch.id, language: 'en' }
        ];
        
        this.data.courses = sampleCourses;
        
        // 生成选课数据
        this.data.student.enrollments = [
            { id: 1, studentId: 1, courseId: 1, semester: '2024-1', status: 'active', organizationId: orgMain.id },
            { id: 2, studentId: 1, courseId: 2, semester: '2024-1', status: 'active', organizationId: orgMain.id },
            { id: 3, studentId: 2, courseId: 1, semester: '2024-1', status: 'active', organizationId: orgMain.id },
            { id: 4, studentId: 2, courseId: 3, semester: '2024-1', status: 'active', organizationId: orgBranch.id }
        ];
        
        // 生成成绩数据
        this.data.grade.grades = [
            { id: 1, studentId: 1, courseId: 1, examDate: '2024-10-01', score: 85, grade: 'B', semester: '2024-1', organizationId: orgMain.id },
            { id: 2, studentId: 1, courseId: 2, examDate: '2024-10-02', score: 92, grade: 'A', semester: '2024-1', organizationId: orgMain.id },
            { id: 3, studentId: 2, courseId: 1, examDate: '2024-10-01', score: 78, grade: 'C', semester: '2024-1', organizationId: orgMain.id }
        ];
        
        // 生成缴费数据
        this.data.finance.payments = [
            { id: 1, studentId: 1, amount: 5000, paymentDate: '2024-09-01', status: 'paid', semester: '2024-1', organizationId: orgMain.id },
            { id: 2, studentId: 2, amount: 5000, paymentDate: '2024-09-01', status: 'paid', semester: '2024-1', organizationId: orgMain.id },
            { id: 3, studentId: 3, amount: 5000, paymentDate: '2024-09-01', status: 'pending', semester: '2024-1', organizationId: orgMain.id }
        ];
        
        this.save();
        console.log('✅ 学校管理系统示例数据已生成（含組織與語言欄位）');
    }
}

// 创建全局实例
window.schoolDB = new SchoolMasterDatabase();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SchoolMasterDatabase;
}
















