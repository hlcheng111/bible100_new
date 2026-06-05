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
        // 首次進入時自動載入示範資料（雲端網站一開啟就有預設資料）
        var needSeed = (!this.data.students || !this.data.students.length) && (!this.data.teachers || !this.data.teachers.length) && (!this.data.courses || !this.data.courses.length);
        if (needSeed && typeof this.ensureSeedFull === 'function') this.ensureSeedFull();
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
     * 確保完整示範資料（學生、教師、課程、班級、選課、成績、繳費）
     * 首次使用或資料為空時呼叫
     */
    ensureSeedFull() {
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
     * 確保至少有 minCount 筆學生示範資料（用於開學展示）
     * @param {number} minCount 最少學生數，預設 200
     */
    ensureSeedStudents(minCount = 200) {
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
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        this.save();
        console.log('✅ 已確保至少有 ' + minCount + ' 筆學生示範資料');
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
















