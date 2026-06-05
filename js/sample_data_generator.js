/**
 * Bible100 示例数据生成器
 * 
 * 用途：为各个模块生成丰富的示例数据，用于测试和演示
 * 特点：真实数据模拟，支持多种数据类型和关系
 * 
 * 版本：1.0
 * 日期：2025-01-16
 */

class SampleDataGenerator {
    constructor(database) {
        this.db = database;
        this.chineseNames = [
            '张伟', '王强', '李娜', '刘敏', '陈静', '杨洋', '赵磊', '黄丽',
            '周杰', '吴涛', '徐鹏', '孙伟', '马超', '朱军', '胡强', '郭涛',
            '何勇', '罗军', '高杰', '梁伟', '宋强', '唐杰', '韩磊', '冯涛',
            '邓军', '曹勇', '彭伟', '蒋强', '薛杰', '颜磊', '倪涛', '汤军'
        ];
        
        this.englishNames = [
            'John Smith', 'Mary Johnson', 'David Brown', 'Sarah Wilson',
            'Michael Davis', 'Jennifer Miller', 'Robert Garcia', 'Lisa Martinez',
            'William Anderson', 'Elizabeth Taylor', 'James Thomas', 'Patricia Jackson',
            'Christopher White', 'Linda Harris', 'Daniel Martin', 'Barbara Thompson'
        ];
        
        this.subjects = [
            '数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理',
            '政治', '体育', '音乐', '美术', '计算机', '科学', '社会学'
        ];
        
        this.ministries = [
            '敬拜', '儿童', '青年', '妇女', '男士', '长者', '关怀', '探访',
            '行政', '财务', '技术', '媒体', '宣教', '教育', '招待'
        ];
        
        this.activities = [
            '主日崇拜', '小组聚会', '祷告会', '查经班', '青年团契', '儿童主日学',
            '妇女聚会', '男士聚会', '长者聚会', '新朋友欢迎会', '洗礼典礼',
            '圣餐礼', '圣诞节庆祝', '复活节庆祝', '感恩节聚会', '培灵会',
            '宣教大会', '音乐布道', '户外活动', '社区服务'
        ];
    }

    /**
     * 生成学校管理示例数据
     */
    generateSchoolData() {
        console.log('🎓 开始生成学校管理示例数据...');

        // 生成学生数据
        const students = this.generateStudents(50);
        students.forEach(student => {
            this.db.insert('students', student);
        });

        // 生成教师数据
        const teachers = this.generateTeachers(20);
        teachers.forEach(teacher => {
            this.db.insert('teachers', teacher);
        });

        // 生成课程数据
        const courses = this.generateCourses(25);
        courses.forEach(course => {
            this.db.insert('courses', course);
        });

        // 生成班级数据
        const classes = this.generateClasses(15);
        classes.forEach(cls => {
            this.db.insert('classes', cls);
        });

        console.log('✅ 学校管理示例数据生成完成！');
        return {
            students: students.length,
            teachers: teachers.length,
            courses: courses.length,
            classes: classes.length
        };
    }

    /**
     * 生成教会事工示例数据
     */
    generateChurchData() {
        console.log('⛪ 开始生成教会事工示例数据...');

        // 生成会友数据
        const members = this.generateMembers(80);
        members.forEach(member => {
            this.db.insert('members', member);
        });

        // 生成志工数据
        const volunteers = this.generateVolunteers(35);
        volunteers.forEach(volunteer => {
            this.db.insert('volunteers', volunteer);
        });

        // 生成活动数据
        const activities = this.generateActivities(60);
        activities.forEach(activity => {
            this.db.insert('activities', activity);
        });

        // 生成奉献数据
        const donations = this.generateDonations(200);
        donations.forEach(donation => {
            this.db.insert('donations', donation);
        });

        console.log('✅ 教会事工示例数据生成完成！');
        return {
            members: members.length,
            volunteers: volunteers.length,
            activities: activities.length,
            donations: donations.length
        };
    }

    /**
     * 生成圣经研读示例数据
     */
    generateBibleData() {
        console.log('📖 开始生成圣经研读示例数据...');

        // 创建圣经研读相关表
        this.db.createTable('bible_study_records', {
            userId: 'number',
            userName: 'string',
            book: 'string',
            chapter: 'number',
            verse: 'number',
            studyDate: 'string',
            studyTime: 'number',
            notes: 'string',
            insights: 'string'
        });

        this.db.createTable('bible_notes', {
            userId: 'number',
            userName: 'string',
            book: 'string',
            chapter: 'number',
            verse: 'number',
            noteTitle: 'string',
            noteContent: 'string',
            createDate: 'string',
            tags: 'string'
        });

        this.db.createTable('bible_progress', {
            userId: 'number',
            userName: 'string',
            readingPlan: 'string',
            currentBook: 'string',
            currentChapter: 'number',
            totalChaptersRead: 'number',
            startDate: 'string',
            targetDate: 'string',
            progress: 'number'
        });

        // 生成学习记录
        const studyRecords = this.generateStudyRecords(150);
        studyRecords.forEach(record => {
            this.db.insert('bible_study_records', record);
        });

        // 生成笔记数据
        const notes = this.generateBibleNotes(100);
        notes.forEach(note => {
            this.db.insert('bible_notes', note);
        });

        // 生成进度数据
        const progress = this.generateBibleProgress(30);
        progress.forEach(prog => {
            this.db.insert('bible_progress', prog);
        });

        console.log('✅ 圣经研读示例数据生成完成！');
        return {
            studyRecords: studyRecords.length,
            notes: notes.length,
            progress: progress.length
        };
    }

    /**
     * 生成学生数据
     */
    generateStudents(count) {
        const students = [];
        const grades = ['高一', '高二', '高三', '初一', '初二', '初三', '小一', '小二', '小三', '小四', '小五', '小六'];
        const classes = ['1班', '2班', '3班', '4班', '5班', '6班'];

        for (let i = 0; i < count; i++) {
            const name = this.getRandomItem(this.chineseNames);
            const grade = this.getRandomItem(grades);
            const cls = this.getRandomItem(classes);
            const enrollmentDate = this.getRandomDate(2020, 2024);

            students.push({
                name: name,
                grade: grade,
                class: cls,
                studentId: `STU${String(i + 1).padStart(4, '0')}`,
                enrollmentDate: enrollmentDate,
                phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
                email: `${name.toLowerCase()}@student.edu`,
                parentName: this.getRandomItem(this.chineseNames),
                address: `学生地址${i + 1}号`,
                status: this.getRandomItem(['在读', '休学', '毕业', '转学'])
            });
        }

        return students;
    }

    /**
     * 生成教师数据
     */
    generateTeachers(count) {
        const teachers = [];
        const departments = ['数学组', '语文组', '英语组', '理科组', '文科组', '艺术组', '体育组'];

        for (let i = 0; i < count; i++) {
            const name = this.getRandomItem(this.chineseNames);
            const subject = this.getRandomItem(this.subjects);
            const experience = Math.floor(Math.random() * 20) + 1;
            const hireDate = this.getRandomDate(2010, 2023);

            teachers.push({
                name: name,
                subject: subject,
                experience: experience,
                email: `${name.toLowerCase()}@teacher.edu`,
                hireDate: hireDate,
                department: this.getRandomItem(departments),
                phone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
                salary: Math.floor(Math.random() * 10000) + 5000,
                status: this.getRandomItem(['在职', '请假', '退休'])
            });
        }

        return teachers;
    }

    /**
     * 生成课程数据
     */
    generateCourses(count) {
        const courses = [];
        const courseTypes = ['必修课', '选修课', '实践课', '理论课'];

        for (let i = 0; i < count; i++) {
            const subject = this.getRandomItem(this.subjects);
            const credits = Math.floor(Math.random() * 4) + 1;

            courses.push({
                name: `${subject}${i + 1}`,
                subject: subject,
                credits: credits,
                description: `${subject}课程描述`,
                teacherId: Math.floor(Math.random() * 20) + 1,
                schedule: this.getRandomItem(['周一1-2节', '周二3-4节', '周三5-6节', '周四1-2节', '周五3-4节']),
                classroom: `教室${Math.floor(Math.random() * 50) + 1}`,
                maxStudents: Math.floor(Math.random() * 30) + 20,
                semester: this.getRandomItem(['春季学期', '秋季学期', '夏季学期']),
                year: Math.floor(Math.random() * 3) + 2022
            });
        }

        return courses;
    }

    /**
     * 生成班级数据
     */
    generateClasses(count) {
        const classes = [];
        const grades = ['高一', '高二', '高三', '初一', '初二', '初三', '小一', '小二', '小三', '小四', '小五', '小六'];

        for (let i = 0; i < count; i++) {
            const grade = this.getRandomItem(grades);
            const className = `${grade}${i % 6 + 1}班`;

            classes.push({
                name: className,
                grade: grade,
                capacity: Math.floor(Math.random() * 20) + 30,
                homeroomTeacher: this.getRandomItem(this.chineseNames),
                studentCount: Math.floor(Math.random() * 20) + 25,
                establishedDate: this.getRandomDate(2020, 2024),
                classroom: `教室${Math.floor(Math.random() * 50) + 1}`,
                status: this.getRandomItem(['活跃', '毕业', '解散'])
            });
        }

        return classes;
    }

    /**
     * 生成会友数据
     */
    generateMembers(count) {
        const members = [];
        const statuses = ['活跃', '不活跃', '新会友', '老会友', '慕道友'];
        const occupations = ['教师', '医生', '工程师', '商人', '学生', '退休', '家庭主妇', '自由职业'];

        for (let i = 0; i < count; i++) {
            const name = this.getRandomItem(this.chineseNames);
            const age = Math.floor(Math.random() * 50) + 18;
            const joinDate = this.getRandomDate(2015, 2024);

            members.push({
                name: name,
                age: age,
                phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
                status: this.getRandomItem(statuses),
                joinDate: joinDate,
                email: `${name.toLowerCase()}@member.org`,
                occupation: this.getRandomItem(occupations),
                address: `会友地址${i + 1}号`,
                emergencyContact: this.getRandomItem(this.chineseNames),
                emergencyPhone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
                baptismDate: Math.random() > 0.3 ? this.getRandomDate(2015, 2024) : null,
                serviceYears: Math.floor(Math.random() * 10)
            });
        }

        return members;
    }

    /**
     * 生成志工数据
     */
    generateVolunteers(count) {
        const volunteers = [];
        const skills = ['教学', '音乐', '技术', '探访', '翻译', '设计', '管理', '护理'];

        for (let i = 0; i < count; i++) {
            const name = this.getRandomItem(this.chineseNames);
            const ministry = this.getRandomItem(this.ministries);
            const serviceHours = Math.floor(Math.random() * 500) + 50;

            volunteers.push({
                name: name,
                ministry: ministry,
                skills: this.getRandomItem(skills),
                serviceHours: serviceHours,
                joinDate: this.getRandomDate(2018, 2024),
                status: this.getRandomItem(['活跃', '休假', '暂停']),
                phone: `137${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
                email: `${name.toLowerCase()}@volunteer.org`,
                availability: this.getRandomItem(['工作日', '周末', '晚上', '随时']),
                trainingCompleted: Math.random() > 0.2
            });
        }

        return volunteers;
    }

    /**
     * 生成活动数据
     */
    generateActivities(count) {
        const activities = [];
        const organizers = ['教会办公室', '青年部', '儿童部', '妇女部', '男士部', '长者部'];

        for (let i = 0; i < count; i++) {
            const name = this.getRandomItem(this.activities);
            const date = this.getRandomDate(2024, 2025);
            const attendance = Math.floor(Math.random() * 200) + 10;

            activities.push({
                name: name,
                date: date,
                type: this.getRandomItem(['崇拜', '聚会', '活动', '培训', '庆典']),
                attendance: attendance,
                description: `${name}的详细描述`,
                organizer: this.getRandomItem(organizers),
                location: this.getRandomItem(['主堂', '副堂', '会议室', '户外', '线上']),
                duration: Math.floor(Math.random() * 3) + 1,
                cost: Math.floor(Math.random() * 1000),
                status: this.getRandomItem(['已完成', '进行中', '计划中', '已取消'])
            });
        }

        return activities;
    }

    /**
     * 生成奉献数据
     */
    generateDonations(count) {
        const donations = [];
        const types = ['十一奉献', '感恩奉献', '建堂奉献', '宣教奉献', '特别奉献', '爱心奉献'];
        const methods = ['现金', '转账', '支票', '信用卡', '移动支付'];

        for (let i = 0; i < count; i++) {
            const memberName = this.getRandomItem(this.chineseNames);
            const amount = Math.floor(Math.random() * 5000) + 100;
            const date = this.getRandomDate(2024, 2025);

            donations.push({
                memberName: memberName,
                amount: amount,
                type: this.getRandomItem(types),
                date: date,
                purpose: this.getRandomItem(['教会事工', '宣教', '建堂', '慈善', '教育']),
                method: this.getRandomItem(methods),
                receiptNumber: `R${String(i + 1).padStart(6, '0')}`,
                notes: `奉献备注${i + 1}`,
                status: this.getRandomItem(['已确认', '待确认', '已退款'])
            });
        }

        return donations;
    }

    /**
     * 生成圣经学习记录
     */
    generateStudyRecords(count) {
        const records = [];
        const books = ['创世记', '出埃及记', '利未记', '民数记', '申命记', '约书亚记', '马太福音', '马可福音', '路加福音', '约翰福音', '罗马书', '哥林多前书'];
        const insights = [
            '神的创造彰显了祂的智慧和能力',
            '信心是得救的关键',
            '爱是最大的诫命',
            '祷告是基督徒的呼吸',
            '圣灵是我们的保惠师',
            '主耶稣的救恩是白白赐给我们的'
        ];

        for (let i = 0; i < count; i++) {
            const userName = this.getRandomItem(this.chineseNames);
            const book = this.getRandomItem(books);
            const chapter = Math.floor(Math.random() * 50) + 1;
            const verse = Math.floor(Math.random() * 30) + 1;
            const studyDate = this.getRandomDate(2024, 2025);

            records.push({
                userId: Math.floor(Math.random() * 50) + 1,
                userName: userName,
                book: book,
                chapter: chapter,
                verse: verse,
                studyDate: studyDate,
                studyTime: Math.floor(Math.random() * 120) + 15,
                notes: `学习${book}${chapter}章${verse}节的笔记`,
                insights: this.getRandomItem(insights),
                difficulty: this.getRandomItem(['简单', '中等', '困难']),
                rating: Math.floor(Math.random() * 5) + 1
            });
        }

        return records;
    }

    /**
     * 生成圣经笔记
     */
    generateBibleNotes(count) {
        const notes = [];
        const books = ['创世记', '出埃及记', '利未记', '民数记', '申命记', '约书亚记', '马太福音', '马可福音', '路加福音', '约翰福音', '罗马书', '哥林多前书'];
        const tags = ['神学', '历史', '预言', '教导', '应许', '警告', '鼓励', '祷告'];

        for (let i = 0; i < count; i++) {
            const userName = this.getRandomItem(this.chineseNames);
            const book = this.getRandomItem(books);
            const chapter = Math.floor(Math.random() * 50) + 1;
            const verse = Math.floor(Math.random() * 30) + 1;
            const createDate = this.getRandomDate(2024, 2025);

            notes.push({
                userId: Math.floor(Math.random() * 50) + 1,
                userName: userName,
                book: book,
                chapter: chapter,
                verse: verse,
                noteTitle: `关于${book}${chapter}章${verse}节的笔记`,
                noteContent: `这是对${book}${chapter}章${verse}节的深入思考和解释...`,
                createDate: createDate,
                tags: this.getRandomItem(tags),
                isPublic: Math.random() > 0.5,
                likes: Math.floor(Math.random() * 20)
            });
        }

        return notes;
    }

    /**
     * 生成圣经进度数据
     */
    generateBibleProgress(count) {
        const progress = [];
        const readingPlans = ['一年读经计划', '新约一年', '旧约一年', '诗篇90天', '箴言31天', '福音书一个月'];
        const books = ['创世记', '出埃及记', '利未记', '民数记', '申命记', '约书亚记', '马太福音', '马可福音', '路加福音', '约翰福音'];

        for (let i = 0; i < count; i++) {
            const userName = this.getRandomItem(this.chineseNames);
            const readingPlan = this.getRandomItem(readingPlans);
            const currentBook = this.getRandomItem(books);
            const currentChapter = Math.floor(Math.random() * 20) + 1;
            const totalChaptersRead = Math.floor(Math.random() * 100) + 1;
            const startDate = this.getRandomDate(2024, 2024);
            const targetDate = this.getRandomDate(2025, 2025);

            progress.push({
                userId: Math.floor(Math.random() * 50) + 1,
                userName: userName,
                readingPlan: readingPlan,
                currentBook: currentBook,
                currentChapter: currentChapter,
                totalChaptersRead: totalChaptersRead,
                startDate: startDate,
                targetDate: targetDate,
                progress: Math.floor((totalChaptersRead / 100) * 100),
                streakDays: Math.floor(Math.random() * 100) + 1,
                lastReadDate: this.getRandomDate(2024, 2025),
                completedBooks: Math.floor(Math.random() * 10)
            });
        }

        return progress;
    }

    /**
     * 生成所有示例数据
     */
    generateAllSampleData() {
        console.log('🚀 开始生成所有示例数据...');
        
        const results = {
            school: this.generateSchoolData(),
            church: this.generateChurchData(),
            bible: this.generateBibleData()
        };

        console.log('🎉 所有示例数据生成完成！');
        console.log('📊 生成统计:', results);
        
        return results;
    }

    /**
     * 辅助方法
     */
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    getRandomDate(startYear, endYear) {
        const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
}

// 创建全局实例
window.sampleDataGenerator = new SampleDataGenerator(window.simpleDB);

console.log('📦 SampleDataGenerator 已加载');
console.log('💡 使用示例:');
console.log('  sampleDataGenerator.generateAllSampleData()');
console.log('  sampleDataGenerator.generateSchoolData()');
console.log('  sampleDataGenerator.generateChurchData()');
console.log('  sampleDataGenerator.generateBibleData()');



















