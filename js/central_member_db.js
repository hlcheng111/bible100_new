/**
 * Bible100 中央會友資料庫
 * 理念：會友事工完整系統、信徒注册、👥會友檔案 由單一資料源供應，其他模組（智慧事奉、教會事工）共用。
 * 儲存鍵：memberSystemData（與 church_ministry/modules/members/member-integrated.html 一致）
 * 使用：載入本腳本後呼叫 CentralMemberDB.get() / CentralMemberDB.set() / CentralMemberDB.loadSeedIfEmpty()
 */

(function (global) {
    'use strict';

    const STORAGE_KEY = 'memberSystemData';
    const SEED_VERSION = '1.0';
    const MIN_SEED_MEMBERS = 200;

    function storageGet(key) {
        try {
            if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === 'function') {
                return global.PersistenceProvider.getInstance().getItem(key);
            }
        } catch (e) {}
        return localStorage.getItem(key);
    }

    function storageSet(key, value) {
        try {
            if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === 'function') {
                global.PersistenceProvider.getInstance().setItem(key, value);
                return;
            }
        } catch (e) {}
        localStorage.setItem(key, value);
    }

    function getChurchId() {
        try {
            if (global.CURRENT_CHURCH_ID) return String(global.CURRENT_CHURCH_ID).trim();
            if (global.location && global.location.search) {
                var params = new URLSearchParams(global.location.search);
                var cid = params.get('church_id');
                if (cid && String(cid).trim()) return String(cid).trim();
            }
        } catch (e) {}
        return 'default';
    }

    function normalizeMemberRecord(m, churchId) {
        if (!m || typeof m !== 'object') return m;
        if (m.memberId == null && m.id != null) m.memberId = m.id;
        if (m.id == null && m.memberId != null) m.id = m.memberId;
        if (!m.churchId) m.churchId = churchId || getChurchId();
        return m;
    }

    function normalizeDataset(data) {
        var d = data && typeof data === 'object' ? data : {};
        var cid = d.churchId || getChurchId();
        d.churchId = cid;
        d.members = Array.isArray(d.members) ? d.members : [];
        d.members = d.members.map(function (m) { return normalizeMemberRecord(m, cid); });
        return d;
    }

    /**
     * 產生 200+ 筆試用會友與關聯資料（結構與 member-integrated 完全一致）
     */
    function generateSeedMemberSystemData() {
        const surnames = ['王','李','張','劉','陳','楊','黃','趙','周','吳','徐','孫','馬','朱','胡','郭','何','林','高','羅','鄭','梁','謝','宋','唐','許','韓','馮','鄧','曹','彭','曾','蕭','田','董','潘','袁','蔡','蔣','余','杜','葉','程','蘇','魏','呂','丁','任','沈','姚','盧','姜','崔','鍾','譚','陸','汪','范','金','石','廖','賈','夏','韋','傅','方','白','鄒','孟','熊','秦','邱','江','尹','薛','閻','段','雷','侯','龍','史','陶','黎','賀','顧','毛','郝','龔','邵','萬','錢','嚴','覃','武','戴','莫','孔','向','湯'];
        const givenM = ['偉','強','磊','洋','勇','軍','杰','濤','明','超','建','平','剛','輝','鵬','華','飛','鑫','波','斌','宇','浩','凱','健','俊','帆','峰','陽','亮','龍','博','成','林','峰','鑫','昊','哲','涵','睿','澤','軒','晨','睿','昊','弘','淵','熙','峻','凱','博'];
        const givenF = ['芳','娜','敏','靜','麗','艷','娟','莉','萍','紅','梅','霞','秀','英','華','慧','玲','雪','琳','潔','雲','婷','燕','萍','玉','琴','麗','萍','娟','敏','紅','梅','霞','秀','英','華','慧','玲','雪','琳','潔','雲','婷','燕','玉','琴','麗','娟','敏','芳'];
        const gifts = ['教導','講道','音樂','輔導','管理','服務','傳福音','憐憫','勸勉','牧養','接待','行政'];
        const skillsList = ['音樂','教導','行政','接待','音控','設計','寫作','關懷','兒童','青少年','敬拜','翻譯'];
        const categories = ['youth','family','workplace','senior','prayer','worship'];
        const groupNames = ['青年小組','夫婦小組','職場小組','長者小組','禱告小組','敬拜小組'];
        const ministries = [
            { name: '敬拜主領', category: 'worship', requirements: '音樂,領導力', needPeople: 5 },
            { name: '主日學教師', category: 'education', requirements: '教導,耐心', needPeople: 8 },
            { name: '招待同工', category: 'hospitality', requirements: '服務,熱情', needPeople: 12 },
            { name: '音控同工', category: 'media', requirements: '技術,細心', needPeople: 6 },
            { name: '輔導同工', category: 'counseling', requirements: '輔導,傾聽', needPeople: 4 },
            { name: '兒童事工', category: 'children', requirements: '耐心,創意', needPeople: 10 },
            { name: '青少年事工', category: 'youth', requirements: '溝通,活力', needPeople: 6 },
            { name: '關懷探訪', category: 'care', requirements: '憐憫,傾聽', needPeople: 8 }
        ];
        const courses = ['門徒培訓','領袖培訓','福音布道','婚姻輔導','青少年事工','敬拜服事入門','小組帶領訓練'];

        const members = [];
        for (let i = 0; i < MIN_SEED_MEMBERS; i++) {
            const s = surnames[i % surnames.length];
            const g = (i % 2 === 0) ? givenM[(i >> 1) % givenM.length] : givenF[(i >> 1) % givenF.length];
            const name = s + g + (i >= 100 ? String(Math.floor(i / 100)) : '');
            const joinYear = 2020 + (i % 5);
            const joinMonth = (i % 12) + 1;
            const joinDay = (i % 28) + 1;
            members.push({
                id: i + 1,
                memberId: i + 1,
                name: name,
                gender: i % 2 === 0 ? '男' : '女',
                age: 18 + (i % 55),
                phone: '09' + String(10000000 + i).slice(-8),
                email: name + (i % 10) + '@church.org',
                baptized: i % 3 !== 0,
                membershipDate: joinYear + '-' + String(joinMonth).padStart(2, '0') + '-' + String(joinDay).padStart(2, '0'),
                status: i % 10 < 8 ? 'active' : 'inactive',
                gifts: gifts[i % gifts.length],
                skills: [skillsList[i % skillsList.length], skillsList[(i + 5) % skillsList.length]].join(','),
                birthday: String((i % 12) + 1).padStart(2, '0') + '-' + String((i % 28) + 1).padStart(2, '0'),
                churchId: getChurchId()
            });
        }

        const groups = [];
        for (let g = 0; g < 24; g++) {
            const cat = categories[g % categories.length];
            const leaderId = (g * 7 % members.length) + 1;
            groups.push({
                id: g + 1,
                name: groupNames[g % groupNames.length] + (Math.floor(g / 6) + 1),
                category: cat,
                leader: members[leaderId - 1].name,
                capacity: 12 + (g % 8),
                location: g % 3 === 0 ? '教會' : (g % 3 === 1 ? '家庭' : '線上')
            });
        }

        const ministryList = ministries.map((m, i) => ({ id: i + 1, name: m.name, category: m.category, requirements: m.requirements, needPeople: m.needPeople }));

        const groupMemberships = [];
        for (let i = 0; i < members.length; i++) {
            const numGroups = i % 3;
            for (let g = 0; g <= numGroups; g++) {
                groupMemberships.push({
                    id: groupMemberships.length + 1,
                    memberId: i + 1,
                    groupId: (i + g) % groups.length + 1,
                    role: g === 0 && i % 7 === 0 ? 'leader' : 'member',
                    joinDate: '2024-' + String((g + 1)).padStart(2, '0') + '-01'
                });
            }
        }

        const ministryAssignments = [];
        for (let i = 0; i < Math.min(members.length, 120); i++) {
            ministryAssignments.push({
                id: i + 1,
                memberId: i + 1,
                ministryId: (i % ministryList.length) + 1,
                position: '同工',
                startDate: '2024-' + String((i % 12) + 1).padStart(2, '0') + '-01',
                performance: ['優秀','良好','合格'][i % 3]
            });
        }

        const trainings = [];
        for (let i = 0; i < 180; i++) {
            trainings.push({
                id: i + 1,
                memberId: (i % members.length) + 1,
                courseName: courses[i % courses.length],
                completedDate: '2024-' + String((i % 12) + 1).padStart(2, '0') + '-15',
                instructor: '李牧師',
                grade: ['A','B','A','B','A','B'][i % 6]
            });
        }

        const attendance = [];
        const today = new Date();
        for (let week = 0; week < 12; week++) {
            const d = new Date(today);
            d.setDate(d.getDate() - (week * 7));
            const dateStr = d.toISOString().split('T')[0];
            for (let i = 0; i < Math.min(80, members.length); i++) {
                attendance.push({
                    id: attendance.length + 1,
                    memberId: i + 1,
                    date: dateStr,
                    service: '主日崇拜',
                    present: Math.random() > 0.25
                });
            }
        }

        return {
            churchId: getChurchId(),
            members: members,
            groups: groups,
            ministries: ministryList,
            groupMemberships: groupMemberships,
            ministryAssignments: ministryAssignments,
            trainings: trainings,
            attendance: attendance,
            donations: [],
            _seedVersion: SEED_VERSION,
            _seedGeneratedAt: new Date().toISOString()
        };
    }

    const CentralMemberDB = {
        STORAGE_KEY: STORAGE_KEY,
        MIN_SEED_MEMBERS: MIN_SEED_MEMBERS,

        /** 讀取中央會友資料（與 member-integrated 同一 key） */
        get: function () {
            try {
                const raw = storageGet(STORAGE_KEY);
                if (!raw) return null;
                return normalizeDataset(JSON.parse(raw));
            } catch (e) {
                console.warn('CentralMemberDB.get 失敗', e);
                return null;
            }
        },

        /** 寫入中央會友資料 */
        set: function (data) {
            try {
                var normalized = normalizeDataset(data);
                storageSet(STORAGE_KEY, JSON.stringify(normalized));
                return true;
            } catch (e) {
                console.warn('CentralMemberDB.set 失敗', e);
                return false;
            }
        },

        /** 取得會友人數（不載入完整資料） */
        getMemberCount: function () {
            const data = this.get();
            return data && Array.isArray(data.members) ? data.members.length : 0;
        },

        /** 以 SSOT 更新單一會友健康資料（A1/A2/A3 共用入口） */
        updateMemberHealth: function (memberId, healthData) {
            try {
                var id = Number(memberId);
                if (!Number.isFinite(id)) return { ok: false, reason: 'invalid_member_id' };
                var db = this.get() || {};
                var members = Array.isArray(db.members) ? db.members : [];
                var idx = members.findIndex(function (m) { return Number(m && m.id) === id; });
                if (idx < 0) return { ok: false, reason: 'member_not_found' };
                var now = new Date().toISOString();
                var payload = Object.assign({}, healthData || {}, {
                    timestamp: (healthData && healthData.timestamp) || now,
                    church_id: (healthData && healthData.church_id) || getChurchId()
                });
                var member = Object.assign({}, members[idx]);
                var prev = member.health && typeof member.health === 'object' ? member.health : {};
                member.health = Object.assign({}, prev, payload);
                member.updatedAt = now;
                members[idx] = member;
                db.members = members;
                var ok = this.set(db);
                return { ok: !!ok, memberId: id };
            } catch (e) {
                return { ok: false, reason: 'exception', error: String(e && e.message ? e.message : e) };
            }
        },

        /** 若目前無資料或筆數少於 MIN_SEED_MEMBERS，則產生並寫入試用資料；force=true 則一律覆寫。會同步至 churchMasterDatabase。 */
        loadSeedIfEmpty: function (options) {
            options = options || {};
            const force = !!options.force;
            const data = this.get();
            const count = data && Array.isArray(data.members) ? data.members.length : 0;
            if (!force && count >= MIN_SEED_MEMBERS) {
                return { loaded: false, count: count, message: '已有 ' + count + ' 筆會友，未覆寫。' };
            }
            const seed = generateSeedMemberSystemData();
            this.set(seed);
            this._syncSeedToChurchMaster(seed.members);
            return { loaded: true, count: seed.members.length, message: '已載入 ' + seed.members.length + ' 筆試用會友資料（已同步至敬拜、小組等）。' };
        },

        /** 內部：將 members 同步至 churchMasterDatabase */
        _syncSeedToChurchMaster: function (members) {
            if (!members || !members.length) return;
            try {
                var cmData = null;
                if (typeof window !== 'undefined' && window.churchDB && window.churchDB.data) {
                    cmData = window.churchDB.data;
                } else {
                    var raw = typeof localStorage !== 'undefined' ? storageGet('churchMasterDatabase') : null;
                    cmData = raw ? JSON.parse(raw) : null;
                }
                if (!cmData || !cmData.worship) {
                    cmData = {
                        members: [],
                        worship: { teams: [], teamMembers: [], services: [], assignments: [], songs: [], songLists: [], serviceRecords: [] },
                        fellowship: { groups: [], groupMembers: [], meetings: [], activities: [], growthRecords: [], multiplication: [] },
                        volunteer: { positions: [], volunteers: [], assignments: [], schedules: [], evaluations: [], trainings: [] },
                        education: { classes: [], students: [], teachers: [], courses: [], attendance: [], progress: [], materials: [] },
                        finance: { budgets: [], incomes: [], expenses: [], categories: [], reports: [], forecasts: [] },
                        library: { books: [], categories: [], borrowers: [], inventory: [], donations: [] },
                        metadata: { lastUpdated: new Date().toISOString(), version: '1.0.0', modules: [] }
                    };
                }
                cmData.members = members.map(function (m) { return { id: m.id, name: m.name, gender: m.gender, memberId: m.id }; });
                if (!cmData.worship.teams || !cmData.worship.teams.length) {
                    cmData.worship.teams = [
                        { id: 1, name: '敬拜團', category: 'worship', leader: members[0] ? members[0].name : '', leaderMemberId: 1 },
                        { id: 2, name: '詩班', category: 'choir', leader: members[1] ? members[1].name : '', leaderMemberId: 2 },
                        { id: 3, name: '音控組', category: 'sound', leader: members[2] ? members[2].name : '', leaderMemberId: 3 },
                        { id: 4, name: '招待組', category: 'hospitality', leader: members[3] ? members[3].name : '', leaderMemberId: 4 }
                    ];
                }
                if (!cmData.worship.teamMembers || !cmData.worship.teamMembers.length) {
                    cmData.worship.teamMembers = members.slice(0, 24).map(function (m, i) {
                        return { id: i + 1, teamId: (i % 4) + 1, memberId: m.id, memberName: m.name, position: ['主領', '伴唱', '音控', '招待'][i % 4], confirmed: true };
                    });
                }
                if (!cmData.worship.services || !cmData.worship.services.length) {
                    for (var w = 0; w < 4; w++) {
                        var d = new Date(); d.setDate(d.getDate() + w * 7);
                        cmData.worship.services.push({ id: w + 1, date: d.toISOString().split('T')[0], serviceType: '主日崇拜', theme: ['神的恩典', '讚美之泉', '感恩的心', '主愛長存'][w], status: w === 0 ? 'confirmed' : 'pending' });
                    }
                }
                if (!cmData.worship.assignments || !cmData.worship.assignments.length) {
                    cmData.worship.assignments = [];
                    cmData.worship.services.forEach(function (s) {
                        [1, 2].forEach(function (tid) {
                            (cmData.worship.teamMembers || []).filter(function (tm) { return tm.teamId === tid; }).slice(0, 3).forEach(function (tm) {
                                cmData.worship.assignments.push({ id: cmData.worship.assignments.length + 1, serviceId: s.id, teamId: tid, memberId: tm.memberId, role: tm.position, confirmed: s.status === 'confirmed' });
                            });
                        });
                    });
                }
                if (!cmData.worship.songs || !cmData.worship.songs.length) {
                    cmData.worship.songs = ['奇異恩典', '讚美之泉', '如鹿渴慕', '主愛長存', '恩典之路'].map(function (n, i) { return { id: i + 1, name: n, category: '敬拜', key: 'C', tempo: 80, usageCount: 5 }; });
                }
                if (!cmData.worship.songLists) cmData.worship.songLists = [];
                if (!cmData.worship.serviceRecords || !cmData.worship.serviceRecords.length) {
                    cmData.worship.serviceRecords = members.slice(0, 5).map(function (m, i) {
                        var d = new Date(); d.setDate(d.getDate() - 7);
                        return { id: i + 1, memberId: m.id, serviceId: 1, teamId: 1, date: d.toISOString().split('T')[0], attendance: true, performance: '良好', notes: '' };
                    });
                }
                if (typeof localStorage !== 'undefined') storageSet('churchMasterDatabase', JSON.stringify(cmData));
                if (typeof window !== 'undefined' && window.churchDB) window.churchDB.data = cmData;
            } catch (e) { console.warn('CentralMemberDB._syncSeedToChurchMaster 略過', e); }
        },

        /** 僅回傳試用資料物件（不寫入），供預覽或匯出 */
        generateSeed: generateSeedMemberSystemData,

        /**
         * 從 data/people.json 匯入 500 人至 memberSystemData
         * 供會友事工、敬拜、小組等六大系統使用
         * @param {string} url - people.json 路徑，預設 /data/people.json
         * @param {function} callback - (result) => {} 完成後回呼
         */
        loadFromPeopleJson: function (url, callback) {
            url = url || ((typeof location !== 'undefined' && location.origin) ? location.origin + '/data/people.json' : '/data/people.json');
            const self = this;
            if (typeof fetch === 'undefined') {
                if (callback) callback({ ok: false, message: '瀏覽器不支援 fetch' });
                return;
            }
            fetch(url).then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            }).then(function (data) {
                const people = data.people || [];
                const ageMap = { '兒童': 10, '青少年': 16, '青年': 28, '壯年': 45, '長者': 65 };
                const members = people.map(function (p, i) {
                    const numId = i + 1;
                    const tags = p.tags || [];
                    const gifts = tags.length ? tags[0] : '';
                    const skills = tags.slice(1).join(',') || (p.church || '');
                    return {
                        id: numId,
                        name: p.name || '未命名',
                        gender: p.gender || '',
                        age: ageMap[p.age_group] || 30,
                        phone: '09' + String(10000000 + numId).slice(-8),
                        email: (p.name || 'user') + numId + '@church.org',
                        baptized: true,
                        membershipDate: p.last_attendance || p.created_at || '2024-01-01',
                        status: (p.attendance_count || 0) > 0 ? 'active' : 'inactive',
                        gifts: gifts,
                        skills: skills,
                        church: p.church,
                        region: p.region,
                        attendance_count: p.attendance_count,
                        externalId: p.id
                    };
                });
                const regionSet = {};
                people.forEach(function (p) { regionSet[p.region || '其他'] = true; });
                const groups = Object.keys(regionSet).slice(0, 12).map(function (r, i) {
                    return { id: i + 1, name: r + '小組', category: 'region', leader: '', capacity: 15, location: '教會' };
                });
                if (!groups.length) groups.push({ id: 1, name: '示例小組', category: 'general', leader: members[0] ? members[0].name : '', capacity: 15, location: '教會' });
                const groupMemberships = [];
                const ministryAssignments = [];
                const trainings = [];
                const attendance = [];
                people.forEach(function (p, i) {
                    const mid = i + 1;
                    if (groups.length) groupMemberships.push({ id: groupMemberships.length + 1, memberId: mid, groupId: (i % groups.length) + 1, role: 'member', joinDate: '2024-01-01' });
                    if ((p.tags || []).some(function (t) { return /敬拜|司琴|音控/.test(t); })) ministryAssignments.push({ id: ministryAssignments.length + 1, memberId: mid, ministryId: 1, position: '同工', startDate: '2024-06-01', performance: '良好' });
                    for (var w = 0; w < 4; w++) {
                        var d = new Date(); d.setDate(d.getDate() - w * 7);
                        attendance.push({ id: attendance.length + 1, memberId: mid, date: d.toISOString().split('T')[0], service: '主日崇拜', present: Math.random() < 0.8 });
                    }
                });
                const seed = {
                    members: members,
                    groups: groups,
                    ministries: [{ id: 1, name: '敬拜主領', category: 'worship', requirements: '音樂', needPeople: 5 }, { id: 2, name: '招待同工', category: 'hospitality', requirements: '服務', needPeople: 8 }],
                    groupMemberships: groupMemberships,
                    ministryAssignments: ministryAssignments,
                    trainings: trainings,
                    attendance: attendance,
                    donations: [],
                    _fromPeopleJson: true,
                    _importedAt: new Date().toISOString()
                };
                self.set(seed);
                try {
                    var cmData = null;
                    if (typeof window !== 'undefined' && window.churchDB && window.churchDB.data) {
                        cmData = window.churchDB.data;
                    } else {
                        var raw = typeof localStorage !== 'undefined' ? storageGet('churchMasterDatabase') : null;
                        cmData = raw ? JSON.parse(raw) : null;
                    }
                    if (!cmData || !cmData.worship) {
                        cmData = {
                            members: [],
                            worship: { teams: [], teamMembers: [], services: [], assignments: [], songs: [], songLists: [], serviceRecords: [] },
                            fellowship: { groups: [], groupMembers: [], meetings: [], activities: [], growthRecords: [], multiplication: [] },
                            volunteer: { positions: [], volunteers: [], assignments: [], schedules: [], evaluations: [], trainings: [] },
                            education: { classes: [], students: [], teachers: [], courses: [], attendance: [], progress: [], materials: [] },
                            finance: { budgets: [], incomes: [], expenses: [], categories: [], reports: [], forecasts: [] },
                            library: { books: [], categories: [], borrowers: [], inventory: [], donations: [] },
                            metadata: { lastUpdated: new Date().toISOString(), version: '1.0.0', modules: [] }
                        };
                    }
                    cmData.members = members.map(function (m) { return { id: m.id, name: m.name, gender: m.gender, memberId: m.id }; });
                    if (!cmData.worship.teams || !cmData.worship.teams.length) {
                        cmData.worship.teams = [
                            { id: 1, name: '敬拜團', category: 'worship', leader: members[0] ? members[0].name : '', leaderMemberId: 1 },
                            { id: 2, name: '詩班', category: 'choir', leader: members[1] ? members[1].name : '', leaderMemberId: 2 },
                            { id: 3, name: '音控組', category: 'sound', leader: members[2] ? members[2].name : '', leaderMemberId: 3 },
                            { id: 4, name: '招待組', category: 'hospitality', leader: members[3] ? members[3].name : '', leaderMemberId: 4 }
                        ];
                    }
                    if (!cmData.worship.teamMembers || !cmData.worship.teamMembers.length) {
                        cmData.worship.teamMembers = members.slice(0, 24).map(function (m, i) {
                            return { id: i + 1, teamId: (i % 4) + 1, memberId: m.id, memberName: m.name, position: ['主領', '伴唱', '音控', '招待'][i % 4], confirmed: true };
                        });
                    }
                    if (!cmData.worship.services || !cmData.worship.services.length) {
                        cmData.worship.services = [];
                        for (var w = 0; w < 4; w++) {
                            var d = new Date(); d.setDate(d.getDate() + w * 7);
                            cmData.worship.services.push({ id: w + 1, date: d.toISOString().split('T')[0], serviceType: '主日崇拜', theme: ['神的恩典', '讚美之泉', '感恩的心', '主愛長存'][w], status: w === 0 ? 'confirmed' : 'pending' });
                        }
                    }
                    if (!cmData.worship.assignments || !cmData.worship.assignments.length) {
                        cmData.worship.assignments = [];
                        cmData.worship.services.forEach(function (s) {
                            [1, 2].forEach(function (tid) {
                                cmData.worship.teamMembers.filter(function (tm) { return tm.teamId === tid; }).slice(0, 3).forEach(function (tm) {
                                    cmData.worship.assignments.push({ id: cmData.worship.assignments.length + 1, serviceId: s.id, teamId: tid, memberId: tm.memberId, role: tm.position, confirmed: s.status === 'confirmed' });
                                });
                            });
                        });
                    }
                    if (!cmData.worship.songs || !cmData.worship.songs.length) {
                        cmData.worship.songs = ['奇異恩典', '讚美之泉', '如鹿渴慕', '主愛長存', '恩典之路'].map(function (n, i) { return { id: i + 1, name: n, category: '敬拜', key: 'C', tempo: 80, usageCount: 5 }; });
                    }
                    if (!cmData.worship.songLists) cmData.worship.songLists = [];
                    if (!cmData.worship.serviceRecords || !cmData.worship.serviceRecords.length) {
                        cmData.worship.serviceRecords = members.slice(0, 5).map(function (m, i) {
                            var d = new Date(); d.setDate(d.getDate() - 7);
                            return { id: i + 1, memberId: m.id, serviceId: 1, teamId: 1, date: d.toISOString().split('T')[0], attendance: true, performance: '良好', notes: '' };
                        });
                    }
                    if (typeof localStorage !== 'undefined') storageSet('churchMasterDatabase', JSON.stringify(cmData));
                    if (typeof window !== 'undefined' && window.churchDB) window.churchDB.data = cmData;
                } catch (e) { console.warn('ChurchMasterDatabase 同步略過', e); }
                if (callback) callback({ ok: true, count: members.length, message: '已從 people.json 匯入 ' + members.length + ' 人至會友系統。請重新整理會友事工、敬拜事工等頁面。' });
            }).catch(function (err) {
                console.warn('loadFromPeopleJson 失敗', err);
                if (callback) callback({ ok: false, message: '載入失敗：' + (err.message || '請確認 HTTP 伺服器已啟動且 /data/people.json 存在') });
            });
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CentralMemberDB;
    } else {
        global.CentralMemberDB = CentralMemberDB;
    }
})(typeof window !== 'undefined' ? window : this);
