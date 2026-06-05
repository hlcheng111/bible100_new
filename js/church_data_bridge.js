/**
 * Bible100 教會資料橋接層（churchMasterDatabase 對齊）
 * ---------------------------------------------------------------------------
 * 目標：會友主檔、小組、分區、探訪任務使用一致的 memberId / groupId / zoneId，
 *       本機階段用 localStorage；正式部署時依 window.CHURCH_CLOUD_CONFIG（cloud_config.js）改為 fetch API。
 *
 * 資料模型說明：../church_ministry/docs/MEMBER_DATA_MODEL.md
 *                ../church_ministry/docs/VISITATION_DATA_MODEL.md
 */
(function (global) {
    'use strict';

    var MS_KEY = 'memberSystemData';
    var CM_KEY = 'churchMasterDatabase';
    var VISIT_KEY = 'visitationData';
    var CARE_PLAN_KEY = 'careAnnualPlanData';
    var CARE_BOARD_KEY = 'careBoardData';
    var VOL_KEY = 'volunteerSystemData';
    var FIN_KEY = 'financeSystemData';
    var FIN_ALT = 'financialData';
    var EDUCATION_KEY = 'educationSystemData';
    var EDUCATION_A_KEY = 'church_ministry_a_education';
    var PASTORAL_EVENTS_KEY = 'pastoral_events_v1';
    var PASTORAL_FOLLOWUP_KEY = 'pastoralFollowupData';
    var FINANCE_RECON_KEY = 'financeReconciliationData';

    /** 與前端 JSON 相容的版本號；升級遷移時遞增 */
    var SCHEMA_VERSION_MEMBER_SYSTEM = 2;
    var _storagePolicyWarned = false;

    function warnStoragePolicyFallback() {
        if (_storagePolicyWarned) return;
        _storagePolicyWarned = true;
        try {
            console.warn('[DataPolicy] ChurchDataBridge using localStorage provider fallback');
        } catch (e) {}
    }

    /**
     * PersistenceProvider 契約（第一階段）
     * - getJson(key): Promise<any|null>
     * - setJson(key, value): Promise<boolean>
     * - remove(key): Promise<boolean>
     * - appendAudit(entry): Promise<boolean>
     */
    function createLocalStorageProvider() {
        return {
            name: 'localStorage',
            getJson: async function (key) {
                try {
                    warnStoragePolicyFallback();
                    var raw = localStorage.getItem(key);
                    return raw ? JSON.parse(raw) : null;
                } catch (e) {
                    return null;
                }
            },
            setJson: async function (key, value) {
                try {
                    warnStoragePolicyFallback();
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    return false;
                }
            },
            remove: async function (key) {
                try {
                    warnStoragePolicyFallback();
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            appendAudit: async function (entry) {
                try {
                    warnStoragePolicyFallback();
                    var raw = localStorage.getItem(AUDIT_KEY);
                    var list = raw ? JSON.parse(raw) : [];
                    if (!Array.isArray(list)) list = [];
                    list.push(entry);
                    if (list.length > 1000) list = list.slice(list.length - 1000);
                    localStorage.setItem(AUDIT_KEY, JSON.stringify(list));
                    return true;
                } catch (e) {
                    return false;
                }
            },
            // 同步鏡像：確保現有頁面不必改 await
            getJsonSync: function (key) {
                try {
                    warnStoragePolicyFallback();
                    var raw = localStorage.getItem(key);
                    return raw ? JSON.parse(raw) : null;
                } catch (e) {
                    return null;
                }
            },
            setJsonSync: function (key, value) {
                try {
                    warnStoragePolicyFallback();
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    return false;
                }
            },
            removeSync: function (key) {
                try {
                    warnStoragePolicyFallback();
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            appendAuditSync: function (entry) {
                try {
                    warnStoragePolicyFallback();
                    var raw = localStorage.getItem(AUDIT_KEY);
                    var list = raw ? JSON.parse(raw) : [];
                    if (!Array.isArray(list)) list = [];
                    list.push(entry);
                    if (list.length > 1000) list = list.slice(list.length - 1000);
                    localStorage.setItem(AUDIT_KEY, JSON.stringify(list));
                    return true;
                } catch (e) {
                    return false;
                }
            }
        };
    }

    var _storage = createLocalStorageProvider();

    function getJson(key) {
        if (_storage && typeof _storage.getJsonSync === 'function') return _storage.getJsonSync(key);
        try { return null; } catch (e) { return null; }
    }

    function setJson(key, data) {
        if (_storage && typeof _storage.setJsonSync === 'function') return _storage.setJsonSync(key, data);
        console.warn('ChurchDataBridge.setJson 失敗：storage provider 未就緒', key);
        return false;
    }

    async function getJsonAsync(key) {
        if (_storage && typeof _storage.getJson === 'function') return _storage.getJson(key);
        return null;
    }

    async function setJsonAsync(key, data) {
        if (_storage && typeof _storage.setJson === 'function') return _storage.setJson(key, data);
        return false;
    }

    async function removeJsonAsync(key) {
        if (_storage && typeof _storage.remove === 'function') return _storage.remove(key);
        return false;
    }

    function slugZoneName(name) {
        var s = String(name || '').trim();
        if (!s) return 'unknown';
        var h = 0;
        for (var i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
        return 'Z' + String(Math.abs(h)).slice(0, 8);
    }

    function mapStatusToMembershipStatus(st) {
        var map = {
            in_communion: 'ACTIVE',
            pending_transfer: 'PENDING_TRANSFER',
            transferred: 'TRANSFERRED_OUT',
            left: 'INACTIVE',
            active: 'ACTIVE',
            inactive: 'INACTIVE'
        };
        return map[st] || 'ACTIVE';
    }

    function normalizeMemberStatusLocal(s) {
        if (s === 'active') return 'in_communion';
        if (s === 'inactive') return 'left';
        if (s === 'in_communion' || s === 'pending_transfer' || s === 'transferred' || s === 'left') return s;
        return 'in_communion';
    }

    /**
     * 單筆會友：對齊 memberId（與舊欄位 id 雙向同步）、fullName、zoneId、membershipStatus
     */
    function normalizeMemberRecord(m, zoneNameToZoneId) {
        if (!m || typeof m !== 'object') return m;
        var mid = m.memberId != null ? m.memberId : m.id;
        if (mid == null) return m;
        var n = Number(mid);
        if (!isNaN(n) && String(mid) === String(n)) mid = n;
        m.id = mid;
        m.memberId = mid;
        if (m.name && !m.fullName) m.fullName = m.name;
        if (m.fullName && !m.name) m.name = m.fullName;
        m.status = normalizeMemberStatusLocal(m.status);
        if (!m.membershipStatus) m.membershipStatus = mapStatusToMembershipStatus(m.status);
        var zname = (m.zone && String(m.zone).trim()) ? String(m.zone).trim() : '';
        if (zname && zoneNameToZoneId && zoneNameToZoneId[zname]) {
            m.zoneId = zoneNameToZoneId[zname];
        } else if (!m.zoneId && zname && zoneNameToZoneId) {
            m.zoneId = zoneNameToZoneId[zname];
        }
        var crm = global.ChurchCrmConstants;
        if (crm && typeof crm.normalizeSpiritualStage === 'function') {
            var stageId = crm.normalizeSpiritualStage(
                m.spiritual_journey_stage != null ? m.spiritual_journey_stage
                    : (m.spiritual_stage != null ? m.spiritual_stage : m.spiritualStage)
            );
            m.spiritual_journey_stage = stageId;
            m.spiritual_stage = crm.stageToLegacyNumber(stageId);
        }
        if (m.first_visit_date == null && m.firstVisitDate) m.first_visit_date = m.firstVisitDate;
        if (m.firstVisitDate == null && m.first_visit_date) m.firstVisitDate = m.first_visit_date;
        return m;
    }

    function normalizeGroupRecord(g) {
        if (!g || typeof g !== 'object') return g;
        var gid = g.groupId != null ? g.groupId : g.id;
        if (gid == null) return g;
        g.id = gid;
        g.groupId = gid;
        return g;
    }

    function normalizeMinistryRecord(mi) {
        if (!mi || typeof mi !== 'object') return mi;
        var iid = mi.ministryId != null ? mi.ministryId : mi.id;
        if (iid == null) return mi;
        mi.id = iid;
        mi.ministryId = iid;
        return mi;
    }

    function buildZoneNameMap(members, groups, existingZones) {
        var catalog = [];
        var nameToId = {};

        function addZone(zoneId, zoneName) {
            if (!zoneId || !zoneName) return;
            if (!nameToId[zoneName]) {
                nameToId[zoneName] = zoneId;
                catalog.push({ zoneId: zoneId, zoneName: zoneName });
            }
        }

        (existingZones || []).forEach(function (z) {
            var zid = z.zoneId != null ? z.zoneId : (z.id != null ? 'Z-' + z.id : null);
            var zn = z.zoneName || z.name || '';
            if (zid && zn) addZone(String(zid), String(zn).trim());
        });

        (groups || []).forEach(function (g) {
            if (g && g.zoneId && (g.zoneName || g.name)) {
                addZone(String(g.zoneId), String(g.zoneName || g.name).trim());
            }
        });

        (members || []).forEach(function (m) {
            if (!m || !m.zone) return;
            var zn = String(m.zone).trim();
            if (!zn) return;
            if (!nameToId[zn]) {
                var zid = 'Z-' + slugZoneName(zn);
                addZone(zid, zn);
            }
        });

        return { zones: catalog, nameToId: nameToId };
    }

    function normalizeMemberSystemData(raw) {
        var ms = raw || {};
        ms.members = Array.isArray(ms.members) ? ms.members : [];
        ms.groups = Array.isArray(ms.groups) ? ms.groups : [];
        ms.ministries = Array.isArray(ms.ministries) ? ms.ministries : [];
        ms.groupMemberships = Array.isArray(ms.groupMemberships) ? ms.groupMemberships : [];
        ms.ministryAssignments = Array.isArray(ms.ministryAssignments) ? ms.ministryAssignments : [];
        ms.trainings = Array.isArray(ms.trainings) ? ms.trainings : [];
        ms.attendance = Array.isArray(ms.attendance) ? ms.attendance : [];
        ms.donations = Array.isArray(ms.donations) ? ms.donations : [];

        var zmap = buildZoneNameMap(ms.members, ms.groups, ms.zones);
        ms.zones = zmap.zones;

        ms.members.forEach(function (m) {
            normalizeMemberRecord(m, zmap.nameToId);
        });
        ms.groups.forEach(normalizeGroupRecord);
        ms.ministries.forEach(normalizeMinistryRecord);

        ms.groupMemberships.forEach(function (gm) {
            if (!gm) return;
            if (gm.memberId == null && gm.member_id != null) gm.memberId = gm.member_id;
            if (gm.groupId == null && gm.group_id != null) gm.groupId = gm.group_id;
        });
        ms.ministryAssignments.forEach(function (ma) {
            if (!ma) return;
            if (ma.memberId == null && ma.member_id != null) ma.memberId = ma.member_id;
            if (ma.ministryId == null && ma.ministry_id != null) ma.ministryId = ma.ministry_id;
        });

        ms.schemaVersion = SCHEMA_VERSION_MEMBER_SYSTEM;
        ms.normalizedAt = new Date().toISOString();
        return ms;
    }

    function getRawMemberSystemPayload() {
        var ms = getJson(MS_KEY);
        var cm = getJson(CM_KEY);
        if (ms && ms.members && ms.members.length) {
            return ms;
        }
        if (cm && cm.members && cm.members.length) {
            return {
                members: cm.members,
                groups: (cm.fellowship && cm.fellowship.groups) || [],
                ministries: (cm.fellowship && cm.fellowship.ministries) || [],
                groupMemberships: (cm.fellowship && cm.fellowship.groupMemberships) || [],
                ministryAssignments: (cm.fellowship && cm.fellowship.ministryAssignments) || [],
                trainings: (cm.fellowship && cm.fellowship.trainings) || [],
                attendance: (cm.fellowship && cm.fellowship.attendance) || [],
                donations: (ms && ms.donations) || [],
                zones: cm.zones || []
            };
        }
        return ms || {
            members: [],
            groups: [],
            ministries: [],
            groupMemberships: [],
            ministryAssignments: [],
            trainings: [],
            attendance: [],
            donations: []
        };
    }

    function syncMemberSystemToChurchMaster(ms) {
        var cm = getJson(CM_KEY) || {};
        syncMemberSystemFieldsIntoCm(cm, ms);
        setJson(CM_KEY, cm);
    }

    /** 將正規化後的 memberSystem 欄位合併進 churchMasterDatabase（不讀寫 storage） */
    function syncMemberSystemFieldsIntoCm(cm, ms) {
        cm.members = ms.members;
        cm.zones = ms.zones || [];
        cm.fellowship = cm.fellowship || {};
        cm.fellowship.groups = ms.groups;
        cm.fellowship.groupMemberships = ms.groupMemberships;
        cm.fellowship.ministries = ms.ministries;
        cm.fellowship.ministryAssignments = ms.ministryAssignments;
        cm.fellowship.trainings = ms.trainings;
        cm.fellowship.attendance = ms.attendance;
        cm.metadata = cm.metadata || {};
        cm.metadata.memberSystemSchemaVersion = SCHEMA_VERSION_MEMBER_SYSTEM;
        cm.metadata.memberSystemSyncedAt = new Date().toISOString();
    }

    /**
     * @param {(phase: number, total: number) => void} [onPhase] 與 saveMemberSystemDataAsync 搭配：第 2、3 段往返
     */
    async function syncMemberSystemToChurchMasterAsync(ms, onPhase) {
        if (onPhase) onPhase(2, 3);
        var cm = (await getJsonAsync(CM_KEY)) || {};
        syncMemberSystemFieldsIntoCm(cm, ms);
        if (onPhase) onPhase(3, 3);
        await setJsonAsync(CM_KEY, cm);
    }

    function findMemberInList(members, idStr) {
        var found = null;
        (members || []).forEach(function (m) {
            var mid = m && (m.memberId != null ? m.memberId : m.id);
            if (mid == null || String(mid) !== idStr) return;
            found = m;
        });
        return found;
    }

    /**
     * 首次自動種子：在會友主檔寫入後，補齊 churchMasterDatabase.worship 等示範結構（與 bootstrap_church_data 對齊）
     */
    function mergeBootstrapWorshipScaffold(members) {
        if (!members || !members.length) return false;
        try {
            var cmData = null;
            if (typeof global !== 'undefined' && global.churchDB && global.churchDB.data) {
                cmData = global.churchDB.data;
            } else {
                cmData = getJson(CM_KEY);
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
            /* cm.members 已由 saveMemberSystemData → syncMemberSystemToChurchMaster 寫入，不在此覆寫 */
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
                    var d = new Date();
                    d.setDate(d.getDate() + w * 7);
                    cmData.worship.services.push({
                        id: w + 1,
                        date: d.toISOString().split('T')[0],
                        serviceType: '主日崇拜',
                        theme: ['神的恩典', '讚美之泉', '感恩的心', '主愛長存'][w],
                        status: w === 0 ? 'confirmed' : 'pending'
                    });
                }
            }
            if (!cmData.worship.assignments || !cmData.worship.assignments.length) {
                cmData.worship.assignments = [];
                cmData.worship.services.forEach(function (s) {
                    [1, 2].forEach(function (tid) {
                        (cmData.worship.teamMembers || []).filter(function (tm) {
                            return tm.teamId === tid;
                        }).slice(0, 3).forEach(function (tm) {
                            cmData.worship.assignments.push({
                                id: cmData.worship.assignments.length + 1,
                                serviceId: s.id,
                                teamId: tid,
                                memberId: tm.memberId,
                                role: tm.position,
                                confirmed: s.status === 'confirmed'
                            });
                        });
                    });
                });
            }
            if (!cmData.worship.songs || !cmData.worship.songs.length) {
                cmData.worship.songs = ['奇異恩典', '讚美之泉', '如鹿渴慕', '主愛長存', '恩典之路'].map(function (n, i) {
                    return { id: i + 1, name: n, category: '敬拜', key: 'C', tempo: 80, usageCount: 5 };
                });
            }
            if (!cmData.worship.songLists) cmData.worship.songLists = [];
            if (!cmData.worship.serviceRecords || !cmData.worship.serviceRecords.length) {
                cmData.worship.serviceRecords = members.slice(0, 5).map(function (m, i) {
                    var d = new Date();
                    d.setDate(d.getDate() - 7);
                    return { id: i + 1, memberId: m.id, serviceId: 1, teamId: 1, date: d.toISOString().split('T')[0], attendance: true, performance: '良好', notes: '' };
                });
            }
            setJson(CM_KEY, cmData);
            if (typeof global !== 'undefined' && global.churchDB) global.churchDB.data = cmData;
            return true;
        } catch (e) {
            console.warn('ChurchDataBridge.mergeBootstrapWorshipScaffold 略過', e);
            return false;
        }
    }

    var _bridgeInitialized = false;
    var _bridgeInitPromise = null;

    /**
     * 自動種子與手動會友並存：同 id 保留既有，其餘自 seed 補上（避免「先加會友 A 再 bootstrap」被整包覆蓋）
     */
    function mergeBootstrapMemberSeed(existingMembers, seedMembers) {
        var existing = existingMembers || [];
        var seed = seedMembers || [];
        if (!existing.length) return seed.slice();
        var seen = {};
        var out = [];
        existing.forEach(function (m) {
            var id = m.memberId != null ? m.memberId : m.id;
            if (id == null) return;
            seen[String(id)] = true;
            out.push(m);
        });
        seed.forEach(function (m) {
            var id = m.memberId != null ? m.memberId : m.id;
            if (id == null || seen[String(id)]) return;
            seen[String(id)] = true;
            out.push(m);
        });
        return out;
    }

    function normalizeMissionRecord(m, memberById) {
        if (!m || typeof m !== 'object') return;
        if (m.targetId != null && m.targetMemberId == null) m.targetMemberId = m.targetId;
        if (m.targetMemberId != null) {
            var mem = memberById[String(m.targetMemberId)];
            if (mem && mem.zoneId && (m.zoneId == null || m.zoneId === '')) {
                m.zoneId = mem.zoneId;
            }
        }
        if (m.zoneId == null && m.zone != null) {
            m.zoneId = String(m.zone);
        }
    }

    function normalizeVisitationDataInPlace(vis, memberList) {
        vis = vis || { goals: [], plans: [], zones: [], teams: [], missions: [], trainings: [], workers: [] };
        var memberById = {};
        (memberList || []).forEach(function (mem) {
            var id = mem.memberId != null ? mem.memberId : mem.id;
            if (id != null) memberById[String(id)] = mem;
        });
        (vis.zones || []).forEach(function (z) {
            if (z.zoneId == null && z.id != null) z.zoneId = 'Z-' + z.id;
            if (z.zoneName == null && z.name) z.zoneName = z.name;
        });
        (vis.missions || []).forEach(function (m) {
            normalizeMissionRecord(m, memberById);
        });
        return vis;
    }

    var _apiCache = { members: null, groups: null, visitation: null, lastError: null, hydratedAt: null };
    var _asyncCache = {
        financeData: null,
        volunteerRsvpSummary: {},
        dashboardKpiSummary: null,
        memberHealth: {},
        smartAlerts: []
    };
    var AUDIT_KEY = 'churchAuditLog';
    var RSVP_KEY = 'volunteerRsvpEvents';

    function useApi() {
        var c = global.CHURCH_CLOUD_CONFIG;
        return !!(c && c.USE_API === true && c.API_BASE_URL && String(c.API_BASE_URL).trim());
    }

    function useSheetsSsot() {
        var c = global.CHURCH_CLOUD_CONFIG;
        return !!(c && c.USE_SHEETS_SSOT === true && c.SHEETS_WEB_APP_URL && String(c.SHEETS_WEB_APP_URL).trim());
    }

    function assertRbac(permission) {
        if (global.ChurchAuth && typeof global.ChurchAuth.assertCan === 'function') {
            global.ChurchAuth.assertCan(permission);
        }
    }

    function nowIso() {
        return new Date().toISOString();
    }

    function bridgeCloudFetch(path, options) {
        if (typeof global.churchCloudFetch === 'function') {
            return global.churchCloudFetch(path, options);
        }
        return Promise.reject(new Error('church_data_bridge: 請於 cloud_config.js 之後載入 cloud_api.js'));
    }

    function membershipStatusToLocal(s) {
        var u = String(s || '').toUpperCase();
        if (u === 'ACTIVE') return 'in_communion';
        if (u === 'INACTIVE' || u === 'LEFT') return 'left';
        if (u === 'PENDING_TRANSFER') return 'pending_transfer';
        if (u === 'TRANSFERRED_OUT' || u === 'TRANSFERRED') return 'transferred';
        if (u === 'VISITOR') return 'pending_transfer';
        return 'in_communion';
    }

    function computeAgeFromDob(dob) {
        if (!dob) return 0;
        var d = new Date(dob);
        if (isNaN(d.getTime())) return 0;
        var diff = Date.now() - d.getTime();
        return Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
    }

    function memberFromApi(api) {
        if (!api || typeof api !== 'object') return null;
        var mid = api.memberId != null ? api.memberId : api.id;
        if (mid == null) return null;
        var gender = api.gender;
        if (gender === 'M') gender = '男';
        else if (gender === 'F') gender = '女';
        else if (gender === 'UNKNOWN') gender = '';
        var baptized = false;
        var bs = String(api.baptismStatus || '').toUpperCase();
        if (bs === 'BAPTIZED_HERE' || bs === 'BAPTIZED_ELSEWHERE') baptized = true;
        if (api.baptized === true) baptized = true;
        var gifts = Array.isArray(api.gifts) ? api.gifts.join(',') : (api.gifts || '');
        var interests = Array.isArray(api.ministryInterests) ? api.ministryInterests.join('、') : (api.ministryInterests || '');
        var sid = mid;
        var n = Number(mid);
        if (!isNaN(n) && String(mid) === String(n)) sid = n;
        return {
            id: sid,
            memberId: mid,
            name: api.fullName || api.name || '',
            fullName: api.fullName || api.name || '',
            gender: gender || '',
            age: api.age != null ? api.age : computeAgeFromDob(api.dateOfBirth),
            phone: api.phone || '',
            email: api.email || '',
            baptized: baptized,
            membershipDate: api.membershipDate || '',
            status: membershipStatusToLocal(api.membershipStatus),
            membershipStatus: api.membershipStatus || 'ACTIVE',
            gifts: gifts,
            ministryIntent: interests,
            zone: api.zoneName || '',
            zoneId: api.zoneId || '',
            notes: api.notes || '',
            birthday: api.dateOfBirth ? String(api.dateOfBirth).slice(5, 10) : '',
            schoolName: api.schoolName || '',
            schoolClass: api.schoolClass || ''
        };
    }

    function memberToApi(m) {
        if (!m) return {};
        var mid = m.memberId != null ? m.memberId : m.id;
        var gender = m.gender;
        if (gender === '男') gender = 'M';
        else if (gender === '女') gender = 'F';
        else gender = gender || 'UNKNOWN';
        var gifts = (m.gifts || '').split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean);
        var interests = (m.ministryIntent || '').split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean);
        var y = (m.birthday || '').trim();
        var dob = m.dateOfBirth || (y && y.length >= 5 ? y : null);
        return {
            memberId: String(mid),
            fullName: m.name || m.fullName || '',
            englishName: m.englishName || '',
            gender: gender,
            dateOfBirth: dob || null,
            phone: m.phone || '',
            email: m.email || '',
            zoneId: m.zoneId || null,
            baptismStatus: m.baptized ? 'BAPTIZED_HERE' : 'NOT_BAPTIZED',
            baptismDate: m.baptismDate || null,
            membershipStatus: mapStatusToMembershipStatus(m.status || 'in_communion'),
            membershipDate: m.membershipDate || null,
            maritalStatus: m.maritalStatus || '',
            gifts: gifts,
            ministryInterests: interests,
            notes: m.notes || ''
        };
    }

    function groupFromApi(g) {
        if (!g || typeof g !== 'object') return null;
        var gid = g.groupId != null ? g.groupId : g.id;
        if (gid == null) return null;
        var sid = gid;
        var n = Number(gid);
        if (!isNaN(n) && String(gid) === String(n)) sid = n;
        return {
            id: sid,
            groupId: gid,
            name: g.name || '',
            zoneId: g.zoneId || '',
            category: 'family',
            leader: g.leaderMemberId || g.leader || '',
            capacity: g.memberCount != null ? g.memberCount : 20,
            location: g.location || ''
        };
    }

    function missionFromApi(m) {
        if (!m || typeof m !== 'object') return null;
        var mid = m.missionId != null ? m.missionId : m.id;
        if (mid == null) return null;
        var d = m.scheduledAt || m.date;
        var dateStr = '';
        if (d) {
            if (typeof d === 'string' && d.indexOf('T') >= 0) dateStr = d.split('T')[0];
            else dateStr = String(d).slice(0, 10);
        }
        var st = String(m.status || '').toUpperCase();
        var localStatus = 'planned';
        if (st === 'DONE' || st === 'COMPLETED') localStatus = 'completed';
        if (st === 'OVERDUE') localStatus = 'overdue';
        var rep = m.report;
        if (typeof rep === 'string') rep = { content: rep };
        return {
            id: mid,
            missionId: mid,
            type: String(m.type || 'regular').toLowerCase(),
            targetMemberId: m.targetMemberId,
            zoneId: m.zoneId,
            groupId: m.groupId,
            date: dateStr,
            status: localStatus,
            team: Array.isArray(m.assignedWorkerIds) ? m.assignedWorkerIds.join(',') : (m.team || ''),
            target: m.target || '',
            reportSummary: m.reportSummary || '',
            report: rep || undefined,
            prayerItems: m.prayerItems || ''
        };
    }

    function missionToApi(m) {
        if (!m) return {};
        var mid = m.missionId != null ? m.missionId : m.id;
        var st = String(m.status || 'planned').toUpperCase();
        if (st === 'COMPLETED') st = 'DONE';
        if (st === 'PLANNED') st = 'PLANNED';
        if (st === 'OVERDUE') st = 'OVERDUE';
        var scheduledAt = m.date || '';
        if (scheduledAt && scheduledAt.indexOf('T') < 0) {
            scheduledAt = scheduledAt + 'T09:30:00+08:00';
        }
        var reportBody = '';
        if (m.report && typeof m.report === 'object' && m.report.content) reportBody = String(m.report.content);
        else if (typeof m.report === 'string') reportBody = m.report;
        return {
            missionId: mid,
            type: String(m.type || 'REGULAR').toUpperCase().replace(/[^A-Z0-9_]/g, '_') || 'REGULAR',
            targetMemberId: m.targetMemberId,
            zoneId: m.zoneId,
            groupId: m.groupId,
            assignedWorkerIds: (m.team || '').split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean),
            scheduledAt: scheduledAt,
            status: st,
            reportSummary: m.reportSummary || '',
            report: reportBody,
            prayerItems: m.prayerItems || ''
        };
    }

    function getRuntimeEnv() {
        var fromGlobal = (global && (global.APP_ENV || global.CHURCH_APP_ENV)) ? (global.APP_ENV || global.CHURCH_APP_ENV) : '';
        var fromStorage = '';
        try {
            /* 與手動驗收慣用鍵對齊：church_app_env（文件）／church_env（簡寫） */
            fromStorage = localStorage.getItem('church_app_env') || localStorage.getItem('church_env') || '';
        } catch (e) {}
        var raw = String(fromGlobal || fromStorage || 'development').toLowerCase().trim();
        if (!raw) raw = 'development';
        if (raw === 'prod') raw = 'production';
        return raw;
    }

    function looksLikeDemoSeedPayload(payload) {
        if (!payload) return false;
        if (Array.isArray(payload)) {
            for (var i = 0; i < payload.length; i++) {
                if (looksLikeDemoSeedPayload(payload[i])) return true;
            }
            return false;
        }
        if (typeof payload !== 'object') return false;
        var markerKeys = ['_seedVersion', '_seedGeneratedAt', '_fromPeopleJson', '_is_demo', 'demo', 'seed', 'isDemo'];
        for (var k = 0; k < markerKeys.length; k++) {
            var mk = markerKeys[k];
            if (Object.prototype.hasOwnProperty.call(payload, mk) && payload[mk]) return true;
        }
        var id = payload.id != null ? String(payload.id).toLowerCase() : '';
        if (id && id.indexOf('demo') >= 0) return true;
        return false;
    }

    function getStartOfDay(daysAgo) {
        var d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - daysAgo);
        return d;
    }

    function parseDateSafe(v) {
        if (!v) return null;
        var d = new Date(v);
        if (isNaN(d.getTime())) return null;
        return d;
    }

    function computeVolunteerRsvpSummaryFromEvents(events, days) {
        var windowDays = Number(days || 3);
        if (!windowDays || windowDays <= 0) windowDays = 3;
        var start = getStartOfDay(windowDays);
        var total = 0;
        var responded = 0;
        var respondedWithinWindow = 0;
        var pending = 0;
        var invalid = 0;
        (events || []).forEach(function (e) {
            var invited = parseDateSafe(e && e.timeline ? e.timeline.invited_at : null);
            if (!invited) {
                invalid++;
                return;
            }
            if (invited < start) return;
            total++;
            var replied = parseDateSafe(e && e.timeline ? e.timeline.responded_at : null);
            if (!replied) {
                pending++;
                return;
            }
            responded++;
            var inWindow = (replied.getTime() - invited.getTime()) <= (windowDays * 24 * 3600 * 1000);
            if (inWindow) respondedWithinWindow++;
        });
        return {
            window_days: windowDays,
            total: total,
            responded: responded,
            pending: pending,
            responded_within_window: respondedWithinWindow,
            responded_within_window_pct: total > 0 ? Math.round((respondedWithinWindow / total) * 1000) / 10 : null,
            invalid_events: invalid
        };
    }

    function getIsoWeekKey(dt) {
        var d = new Date(dt.getTime());
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        var yearStart = new Date(d.getFullYear(), 0, 1);
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return d.getFullYear() + '-W' + String(weekNo).padStart(2, '0');
    }

    function generateFinanceTxnId() {
        var now = new Date();
        var y = now.getFullYear();
        var m = String(now.getMonth() + 1).padStart(2, '0');
        var d = String(now.getDate()).padStart(2, '0');
        var stamp = '' + y + m + d;
        var rand = Math.random().toString(36).slice(2, 8).toUpperCase();
        return 'TXN-' + stamp + '-' + rand;
    }

    function isFinanceDemoPayload(fin) {
        if (!fin || typeof fin !== 'object') return false;
        if (looksLikeDemoSeedPayload(fin)) return true;
        var tx = Array.isArray(fin.transactions) ? fin.transactions : [];
        for (var i = 0; i < tx.length; i++) {
            var t = tx[i] || {};
            if (looksLikeDemoSeedPayload(t)) return true;
            var note = String(t.description || '').toLowerCase();
            if (note.indexOf('演示') >= 0 || note.indexOf('demo') >= 0 || note.indexOf('示例') >= 0) return true;
        }
        return false;
    }

    function normalizeFinanceTransaction(tx, defaults) {
        defaults = defaults || {};
        var out = Object.assign({}, tx || {});
        var nowIso = new Date().toISOString();
        var amount = Number(out.amount || 0);
        if (!isFinite(amount)) amount = 0;
        out.amount = amount;
        out.type = (String(out.type || defaults.type || '').toLowerCase() === 'expense') ? 'expense' : 'income';
        out.category = out.category || defaults.category || 'other';
        out.categoryName = out.categoryName || defaults.categoryName || out.category || '其他';
        out.date = out.date || defaults.date || nowIso.slice(0, 10);
        out.description = out.description || defaults.description || out.categoryName;
        out.handler = out.handler || defaults.handler || defaults.operator_id || 'finance_operator';
        out.status = out.status || defaults.status || 'approved';
        out.operator_id = out.operator_id || defaults.operator_id || 'finance_operator';
        out.timestamp = out.timestamp || defaults.timestamp || nowIso;
        out.txn_id = out.txn_id || defaults.txn_id || generateFinanceTxnId();
        out.is_deleted = !!(out.is_deleted || defaults.is_deleted);
        out.deleted_at = out.deleted_at || defaults.deleted_at || null;
        out.deleted_by = out.deleted_by || defaults.deleted_by || null;
        out.delete_reason = out.delete_reason || defaults.delete_reason || null;
        if (out.id == null) out.id = Date.now();
        return out;
    }

    function toCanonicalMemberId(raw) {
        if (raw == null || raw === '') return '';
        var s = String(raw).trim();
        if (!s) return '';
        if (/^CM-\d{6}-[A-Z0-9]{4,}$/i.test(s)) return s.toUpperCase();
        var y = new Date().getFullYear();
        var m = String(new Date().getMonth() + 1).padStart(2, '0');
        var stamp = String(y) + m;
        var n = 0;
        for (var i = 0; i < s.length; i++) n = ((n << 5) - n + s.charCodeAt(i)) | 0;
        var tail = Math.abs(n).toString(36).toUpperCase();
        while (tail.length < 6) tail = '0' + tail;
        return 'CM-' + stamp + '-' + tail.slice(-6);
    }

    function appendAuditLogEntry(entry) {
        try {
            var list = getJson(AUDIT_KEY);
            if (!Array.isArray(list)) list = [];
            list.push(entry);
            if (list.length > 1000) list = list.slice(list.length - 1000);
            setJson(AUDIT_KEY, list);
            return true;
        } catch (e) {
            return false;
        }
    }

    /** 舊版頁面直寫之鍵，一次性遷入 Bridge 管轄之 storage（仍經 Provider，非頁面直碰） */
    function tryMigrateEducationSystemFromLegacyLocalStorage() {
        try {
            if (typeof localStorage === 'undefined') return;
            var cur = getJson(EDUCATION_KEY);
            if (cur && cur.classes && cur.classes.length) return;
            var raw = localStorage.getItem('educationSystemData');
            if (!raw) return;
            var parsed = JSON.parse(raw);
            setJson(EDUCATION_KEY, parsed);
            var cm = getJson(CM_KEY) || {};
            cm.education = cm.education || {};
            cm.education.integrated = parsed;
            cm.education.integratedSyncedAt = new Date().toISOString();
            setJson(CM_KEY, cm);
            localStorage.removeItem('educationSystemData');
            console.info('[ChurchDataBridge] migrated legacy key educationSystemData → Bridge');
        } catch (e) {
            console.warn('[ChurchDataBridge] education migrate skipped', e);
        }
    }

    function tryMigrateEducationAModuleFromLegacyLocalStorage() {
        try {
            if (typeof localStorage === 'undefined') return;
            var cur = getJson(EDUCATION_A_KEY);
            if (cur && ((cur.goals && cur.goals.length) || (cur.outcomes && cur.outcomes.length))) return;
            var raw = localStorage.getItem('church_ministry_a_education');
            if (!raw) return;
            var parsed = JSON.parse(raw);
            setJson(EDUCATION_A_KEY, parsed);
            var cm = getJson(CM_KEY) || {};
            cm.education = cm.education || {};
            cm.education.aModule = parsed;
            cm.education.aModuleSyncedAt = new Date().toISOString();
            setJson(CM_KEY, cm);
            localStorage.removeItem('church_ministry_a_education');
            console.info('[ChurchDataBridge] migrated legacy key church_ministry_a_education → Bridge');
        } catch (e) {
            console.warn('[ChurchDataBridge] education A-module migrate skipped', e);
        }
    }

    function tryMigrateDiscipleDataFromLegacyLocalStorage() {
        try {
            var existing = getJson('discipleData');
            if (existing && existing.length) return;
            if (typeof localStorage === 'undefined') return;
            var raw = localStorage.getItem('discipleData');
            if (!raw) return;
            var arr = JSON.parse(raw);
            if (!Array.isArray(arr)) arr = [];
            setJson('discipleData', arr);
            var cm = getJson(CM_KEY) || {};
            cm.discipleship = cm.discipleship || {};
            cm.discipleship.classes = arr;
            cm.discipleship.updatedAt = new Date().toISOString();
            setJson(CM_KEY, cm);
            localStorage.removeItem('discipleData');
            console.info('[ChurchDataBridge] migrated legacy key discipleData → Bridge');
        } catch (e) {
            console.warn('[ChurchDataBridge] disciple migrate skipped', e);
        }
    }

    var ChurchDataBridge = {
        SCHEMA_VERSION_MEMBER_SYSTEM: SCHEMA_VERSION_MEMBER_SYSTEM,
        PERSISTENCE_PROVIDER_VERSION: 'v1',

        configurePersistence: function (provider) {
            if (!provider || typeof provider !== 'object') throw new Error('configurePersistence: provider 必須為物件');
            var required = ['getJson', 'setJson', 'remove', 'appendAudit'];
            for (var i = 0; i < required.length; i++) {
                if (typeof provider[required[i]] !== 'function') {
                    throw new Error('configurePersistence: provider 缺少方法 ' + required[i]);
                }
            }
            if (typeof provider.getJsonSync !== 'function' || typeof provider.setJsonSync !== 'function') {
                throw new Error('configurePersistence: 第一階段需提供 getJsonSync/setJsonSync 以相容既有同步流程');
            }
            _storage = provider;
            this.logActivity('persistence_provider_configured', { provider: provider.name || 'custom_provider' }, 'system');
            return true;
        },

        getPersistenceInfo: function () {
            return {
                provider_name: (_storage && _storage.name) ? _storage.name : 'unknown',
                has_async: !!(_storage && _storage.getJson && _storage.setJson && _storage.remove && _storage.appendAudit),
                has_sync: !!(_storage && _storage.getJsonSync && _storage.setJsonSync),
                contract_version: this.PERSISTENCE_PROVIDER_VERSION
            };
        },

        createLocalStorageProvider: function () {
            return createLocalStorageProvider();
        },

        isBridgeInitialized: function () {
            return !!_bridgeInitialized;
        },

        /**
         * 標記 Bridge 與預設 persistence 已就緒；供 bootstrap／殼層避免競態。
         * 目前為輕量解析度（非遠端連線）；雲端 Provider 就緒後可於此 await。
         */
        init: function () {
            if (_bridgeInitialized) return Promise.resolve({ ok: true, already: true });
            if (_bridgeInitPromise) return _bridgeInitPromise;
            var self = this;
            _bridgeInitPromise = Promise.resolve().then(function () {
                var jobs = [];
                if (useApi() && typeof self.hydrateFromApi === 'function') {
                    jobs.push(self.hydrateFromApi().catch(function (e) {
                        console.warn('[ChurchDataBridge] hydrateFromApi', e);
                    }));
                }
                if (useSheetsSsot() && typeof self.hydrateFromSheets === 'function') {
                    jobs.push(self.hydrateFromSheets().catch(function (e) {
                        console.warn('[ChurchDataBridge] hydrateFromSheets', e);
                    }));
                }
                return Promise.all(jobs).then(function () {
                    _bridgeInitialized = true;
                    if (typeof console !== 'undefined' && console.info) {
                        console.info('[ChurchDataBridge] ready');
                    }
                    return { ok: true };
                });
            });
            return _bridgeInitPromise;
        },

        /**
         * 與 init() 共用同一 Promise，重複呼叫不會重跑初始化。
         * @param {{ timeoutMs?: number }} [options] — timeoutMs>0 時逾時 reject（頁面應 catch 後仍嘗試載入）
         */
        whenReady: function (options) {
            options = options || {};
            var p = this.init();
            var ms = options.timeoutMs;
            if (typeof ms !== 'number' || ms <= 0) return p;
            return Promise.race([
                p,
                new Promise(function (_, reject) {
                    setTimeout(function () {
                        var err = new Error('ChurchDataBridge initialization timeout');
                        err.code = 'BRIDGE_INIT_TIMEOUT';
                        reject(err);
                    }, ms);
                })
            ]);
        },

        /** 會友筆數是否低於門檻（供自動種子判斷） */
        needsMemberBootstrap: function (minMembers) {
            var min = typeof minMembers === 'number' ? minMembers : 10;
            var ms = getRawMemberSystemPayload();
            var n = (ms && ms.members && Array.isArray(ms.members)) ? ms.members.length : 0;
            return n < min;
        },

        /**
         * 由 CentralMemberDB 等寫入試用會友主檔，並補齊 churchMasterDatabase 敬拜示範結構（不經頁面直寫 localStorage）
         */
        applyBootstrapSeed: function (seed) {
            if (!seed || typeof seed !== 'object') return { ok: false, reason: 'bad_seed' };
            if (this.isProductionMode()) {
                console.warn('ChurchDataBridge.applyBootstrapSeed: 正式環境略過自動試用種子');
                return { ok: false, reason: 'production_skip' };
            }
            var current = this.getMemberSystemData();
            var merged = JSON.parse(JSON.stringify(seed));
            merged.members = mergeBootstrapMemberSeed(current.members || [], merged.members || []);
            if ((current.groups || []).length) merged.groups = JSON.parse(JSON.stringify(current.groups));
            if ((current.ministries || []).length) merged.ministries = JSON.parse(JSON.stringify(current.ministries));
            if ((current.groupMemberships || []).length) merged.groupMemberships = JSON.parse(JSON.stringify(current.groupMemberships));
            if ((current.ministryAssignments || []).length) merged.ministryAssignments = JSON.parse(JSON.stringify(current.ministryAssignments));
            if ((current.trainings || []).length) merged.trainings = JSON.parse(JSON.stringify(current.trainings));
            if ((current.attendance || []).length) merged.attendance = JSON.parse(JSON.stringify(current.attendance));
            if ((current.zones || []).length) merged.zones = JSON.parse(JSON.stringify(current.zones));
            if ((current.donations || []).length) merged.donations = JSON.parse(JSON.stringify(current.donations));
            this.saveMemberSystemData(merged, { skipRbac: true });
            mergeBootstrapWorshipScaffold(merged.members || []);
            this.logActivity('bootstrap_seed_applied', { members: (merged.members || []).length }, 'system');
            return { ok: true, members: (merged.members || []).length };
        },

        applyCrmMaturitySeed: function () {
            if (global.ChurchCrmMaturitySeed && typeof global.ChurchCrmMaturitySeed.apply === 'function') {
                return global.ChurchCrmMaturitySeed.apply(this);
            }
            return { ok: false, reason: 'ChurchCrmMaturitySeed not loaded' };
        },

        hydrateFromSheets: function () {
            if (!useSheetsSsot() || !global.ChurchSheetsSsot || !global.ChurchSheetsSsot.pullMembers) {
                return Promise.resolve({ ok: false, reason: 'sheets_disabled' });
            }
            var self = this;
            return global.ChurchSheetsSsot.pullMembers().then(function (rows) {
                var items = Array.isArray(rows) ? rows : (rows && rows.items) ? rows.items : [];
                var ms = self.getMemberSystemData();
                ms.members = items.map(function (r) {
                    return self.normalizeRecord('member', r);
                });
                self.saveMemberSystemData(ms, { skipRbac: true });
                return { ok: true, members: ms.members.length, source: 'sheets_ssot' };
            });
        },

        getJsonAsync: async function (key) {
            return getJsonAsync(key);
        },

        setJsonAsync: async function (key, value) {
            return setJsonAsync(key, value);
        },

        removeJsonAsync: async function (key) {
            return removeJsonAsync(key);
        },

        getMemberId: function (m) {
            if (!m) return null;
            if (m.memberId != null) return m.memberId;
            return m.id != null ? m.id : null;
        },

        getGroupId: function (g) {
            if (!g) return null;
            if (g.groupId != null) return g.groupId;
            return g.id != null ? g.id : null;
        },

        hydrateFromApi: function () {
            if (!useApi()) {
                return Promise.resolve({ ok: false, reason: 'USE_API false' });
            }
            return Promise.all([
                bridgeCloudFetch('/api/members?pageSize=500'),
                bridgeCloudFetch('/api/groups'),
                bridgeCloudFetch('/api/visitation/missions')
            ]).then(function (res) {
                var mRes = res[0];
                var gRes = res[1];
                var vRes = res[2];
                var mItems = (mRes && mRes.items) ? mRes.items : (Array.isArray(mRes) ? mRes : []);
                var gItems = (gRes && gRes.items) ? gRes.items : (Array.isArray(gRes) ? gRes : []);
                var vItems = (vRes && vRes.items) ? vRes.items : (Array.isArray(vRes) ? vRes : []);
                _apiCache.members = mItems.map(memberFromApi).filter(Boolean);
                _apiCache.groups = gItems.map(groupFromApi).filter(Boolean);
                _apiCache.visitation = {
                    goals: [],
                    plans: [],
                    zones: [],
                    teams: [],
                    missions: vItems.map(missionFromApi).filter(Boolean),
                    trainings: [],
                    workers: []
                };
                _apiCache.hydratedAt = new Date().toISOString();
                _apiCache.lastError = null;
                return {
                    ok: true,
                    members: _apiCache.members.length,
                    groups: _apiCache.groups.length,
                    missions: _apiCache.visitation.missions.length
                };
            }).catch(function (e) {
                _apiCache.lastError = String(e);
                throw e;
            });
        },

        clearApiCache: function () {
            _apiCache.members = null;
            _apiCache.groups = null;
            _apiCache.visitation = null;
            _apiCache.hydratedAt = null;
            _apiCache.lastError = null;
        },

        getRuntimeEnv: function () {
            return getRuntimeEnv();
        },

        isProductionMode: function () {
            return getRuntimeEnv() === 'production';
        },

        detectDemoSeedContamination: function () {
            var findings = [];
            var keys = [MS_KEY, CM_KEY, 'bible100_people', 'bible100_main', 'schoolMasterDatabase', VOL_KEY, FIN_KEY];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var payload = getJson(key);
                if (!payload) continue;
                if (looksLikeDemoSeedPayload(payload)) {
                    findings.push({ storageKey: key, reason: 'marker_detected' });
                    continue;
                }
                if (payload && payload.members && looksLikeDemoSeedPayload(payload.members)) {
                    findings.push({ storageKey: key, reason: 'member_marker_detected' });
                }
            }
            return { contaminated: findings.length > 0, findings: findings };
        },

        assertNoDemoSeedInProduction: function () {
            if (!this.isProductionMode()) return true;
            var check = this.detectDemoSeedContamination();
            if (!check.contaminated) return true;
            var err = new Error('DATA_CONTAMINATION_ERROR: Demo/seed data found in production.');
            err.code = 'DATA_CONTAMINATION_ERROR';
            err.findings = check.findings;
            throw err;
        },

        normalizeRecord: function (type, record) {
            var out = Object.assign({}, record || {});
            if (type === 'member') {
                var rid = out.memberId != null ? out.memberId : out.id;
                if (rid != null && out.member_id == null) out.member_id = toCanonicalMemberId(rid);
                else if (out.member_id != null) out.member_id = toCanonicalMemberId(out.member_id);
            }
            return out;
        },

        getAuditLogs: function (limit) {
            var list = getJson(AUDIT_KEY);
            if (!Array.isArray(list)) return [];
            if (!limit || limit <= 0) return list.slice();
            return list.slice(Math.max(0, list.length - limit));
        },

        rotateAuditLogs: function (maxEntries) {
            var cap = Number(maxEntries || 500);
            if (!cap || cap < 50) cap = 500;
            var list = getJson(AUDIT_KEY);
            if (!Array.isArray(list)) return { kept: 0, removed: 0 };
            if (list.length <= cap) return { kept: list.length, removed: 0 };
            var trimmed = list.slice(list.length - cap);
            setJson(AUDIT_KEY, trimmed);
            return { kept: trimmed.length, removed: list.length - trimmed.length };
        },

        logActivity: function (action, payload, operator) {
            var entry = {
                id: 'audit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
                action: action || 'unknown_action',
                operator: operator || 'system',
                timestamp: new Date().toISOString(),
                payload: payload || {}
            };
            return appendAuditLogEntry(entry);
        },

        runDataSanitizer: function (options) {
            options = options || {};
            var apply = !!options.apply;
            var out = {
                scanned_at: new Date().toISOString(),
                apply: apply,
                cleaned: [],
                warnings: [],
                contaminated: this.detectDemoSeedContamination()
            };
            var ms = getJson(MS_KEY);
            if (ms && Array.isArray(ms.members)) {
                var mutated = false;
                var fixedCanonical = 0;
                ms.members = ms.members.map((function (m) {
                    var n = this.normalizeRecord('member', m);
                    if ((m.member_id || '') !== (n.member_id || '')) {
                        mutated = true;
                        fixedCanonical++;
                    }
                    return n;
                }).bind(this));
                if (apply && mutated) {
                    setJson(MS_KEY, ms);
                    out.cleaned.push({ storageKey: MS_KEY, action: 'normalize_member_id', count: fixedCanonical });
                    this.logActivity('sanitize_member_system_data', { storageKey: MS_KEY, fixedCanonical: fixedCanonical }, 'system_sanitizer');
                } else if (mutated) {
                    out.warnings.push('memberSystemData: ' + fixedCanonical + ' 筆可補 canonical member_id');
                }
            }
            return out;
        },

        getVolunteerRsvpEvents: function () {
            var arr = getJson(RSVP_KEY);
            return Array.isArray(arr) ? arr : [];
        },

        saveVolunteerRsvpEvents: function (events) {
            var list = Array.isArray(events) ? events : [];
            setJson(RSVP_KEY, list);
            this.logActivity('save_volunteer_rsvp_events', { events: list.length }, 'bridge');
            return true;
        },

        createVolunteerRsvpEvent: function (payload) {
            payload = payload || {};
            var events = this.getVolunteerRsvpEvents();
            var scheduleId = payload.schedule_id != null ? String(payload.schedule_id) : '';
            if (scheduleId) {
                var existed = events.find(function (e) { return String(e && e.schedule_id) === scheduleId; });
                if (existed) return existed;
            }
            var nowIso = new Date().toISOString();
            var ev = {
                event_id: payload.event_id || ('RSVP-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)),
                service_id: payload.service_id || ('SVC-' + String(payload.schedule_id || 'UNKNOWN')),
                schedule_id: payload.schedule_id || null,
                volunteer_id: payload.volunteer_id != null ? String(payload.volunteer_id) : '',
                volunteer_name: payload.volunteer_name || '',
                timeline: {
                    invited_at: payload.invited_at || nowIso,
                    responded_at: payload.responded_at || null,
                    deadline: payload.deadline || null
                },
                status: payload.status || 'pending',
                audit: {
                    reminders_sent: Number((payload.audit && payload.audit.reminders_sent) || 0),
                    created_at: nowIso,
                    updated_at: nowIso
                }
            };
            events.push(ev);
            this.saveVolunteerRsvpEvents(events);
            return ev;
        },

        respondVolunteerRsvpEvent: function (eventId, status, respondedAt) {
            var events = this.getVolunteerRsvpEvents();
            var idx = events.findIndex(function (e) { return e.event_id === eventId; });
            if (idx < 0) return false;
            events[idx].status = status || events[idx].status || 'confirmed';
            events[idx].timeline = events[idx].timeline || {};
            events[idx].timeline.responded_at = respondedAt || new Date().toISOString();
            events[idx].audit = events[idx].audit || {};
            events[idx].audit.updated_at = new Date().toISOString();
            this.saveVolunteerRsvpEvents(events);
            return true;
        },

        remindVolunteerRsvpEvent: function (eventId) {
            var events = this.getVolunteerRsvpEvents();
            var idx = events.findIndex(function (e) { return e.event_id === eventId; });
            if (idx < 0) return false;
            events[idx].audit = events[idx].audit || {};
            events[idx].audit.reminders_sent = Number(events[idx].audit.reminders_sent || 0) + 1;
            events[idx].audit.updated_at = new Date().toISOString();
            this.saveVolunteerRsvpEvents(events);
            return true;
        },

        syncVolunteerRsvpFromSchedules: function (schedules) {
            var arr = Array.isArray(schedules) ? schedules : [];
            var events = this.getVolunteerRsvpEvents();
            var bySchedule = {};
            var deduped = [];
            var dropped = 0;
            events.forEach(function (e) {
                if (!e || e.schedule_id == null) {
                    deduped.push(e);
                    return;
                }
                var sid = String(e.schedule_id);
                if (bySchedule[sid]) {
                    dropped++;
                    return;
                }
                bySchedule[sid] = e;
                deduped.push(e);
            });
            events = deduped;
            var created = 0;
            var updated = 0;
            arr.forEach(function (s) {
                var sid = s.id != null ? String(s.id) : '';
                if (!sid) return;
                var deadline = s.date ? (String(s.date).slice(0, 10) + 'T09:30:00+08:00') : null;
                var existing = bySchedule[sid];
                if (!existing) {
                    events.push({
                        event_id: 'RSVP-' + sid,
                        service_id: s.shift ? ('SVC-' + s.shift) : ('SVC-' + sid),
                        schedule_id: s.id,
                        volunteer_id: s.memberId != null ? String(s.memberId) : '',
                        volunteer_name: s.memberName || '',
                        timeline: {
                            invited_at: s.invitedAt || s.createdAt || new Date().toISOString(),
                            responded_at: s.respondedAt || (s.confirmed ? (s.updatedAt || new Date().toISOString()) : null),
                            deadline: s.deadline || deadline
                        },
                        status: s.status || (s.confirmed ? 'confirmed' : 'pending'),
                        audit: {
                            reminders_sent: Number(s.remindersSent || 0),
                            created_at: s.createdAt || new Date().toISOString(),
                            updated_at: s.updatedAt || new Date().toISOString()
                        }
                    });
                    created++;
                    return;
                }
                existing.volunteer_id = s.memberId != null ? String(s.memberId) : existing.volunteer_id;
                existing.volunteer_name = s.memberName || existing.volunteer_name;
                existing.timeline = existing.timeline || {};
                if (!existing.timeline.deadline) existing.timeline.deadline = s.deadline || deadline;
                if (s.confirmed && !existing.timeline.responded_at) {
                    existing.timeline.responded_at = s.respondedAt || s.updatedAt || new Date().toISOString();
                    existing.status = 'confirmed';
                }
                updated++;
            });
            this.saveVolunteerRsvpEvents(events);
            this.logActivity('sync_rsvp_from_schedules', { scheduleCount: arr.length, created: created, updated: updated, dedupDropped: dropped }, 'bridge');
            return { created: created, updated: updated, dedupDropped: dropped, totalEvents: events.length };
        },

        getVolunteerRsvpSummary: function (days) {
            var windowDays = Number(days || 3);
            if (!windowDays || windowDays <= 0) windowDays = 3;
            if (_asyncCache.volunteerRsvpSummary && _asyncCache.volunteerRsvpSummary[windowDays]) {
                return JSON.parse(JSON.stringify(_asyncCache.volunteerRsvpSummary[windowDays]));
            }
            console.warn('ChurchDataBridge.getVolunteerRsvpSummary: async cache 未命中，建議先呼叫 getVolunteerRsvpSummaryAsync');
            var fallback = computeVolunteerRsvpSummaryFromEvents(this.getVolunteerRsvpEvents(), windowDays);
            _asyncCache.volunteerRsvpSummary[windowDays] = fallback;
            return fallback;
        },

        getVolunteerRsvpSummaryAsync: async function (days) {
            var windowDays = Number(days || 3);
            if (!windowDays || windowDays <= 0) windowDays = 3;
            var events = await getJsonAsync(RSVP_KEY);
            if (!Array.isArray(events)) events = [];
            var out = computeVolunteerRsvpSummaryFromEvents(events, windowDays);
            _asyncCache.volunteerRsvpSummary[windowDays] = out;
            return JSON.parse(JSON.stringify(out));
        },

        memberFromApi: memberFromApi,
        memberToApi: memberToApi,
        groupFromApi: groupFromApi,
        missionFromApi: missionFromApi,
        missionToApi: missionToApi,

        /**
         * TODO: 正式部署時改為呼叫後端 API，返回結構需符合 MEMBER_DATA_MODEL.md
         */
        loadMembers: function () {
            var ms = this.getMemberSystemData();
            return ms.members || [];
        },

        /**
         * TODO: 正式部署時改為 fetch('/api/groups')，返回結構需符合 MEMBER_DATA_MODEL.md（groups）
         */
        loadGroups: function () {
            var ms = this.getMemberSystemData();
            return ms.groups || [];
        },

        /**
         * TODO: 正式部署時改為 fetch('/api/visitation/missions')，返回結構需符合 VISITATION_DATA_MODEL.md
         */
        loadVisitationMissions: function () {
            var v = this.getVisitationData();
            return v.missions || [];
        },

        /** 會友主檔：與 normalizeMemberSystemData 同一套正規化 */
        getMembers: function () {
            var list = this.getMemberSystemData().members || [];
            if (global.ChurchAuth && typeof global.ChurchAuth.maskMemberForRole === 'function') {
                return list.map(function (m) { return global.ChurchAuth.maskMemberForRole(m); });
            }
            return list;
        },

        /** 小組列表 */
        getGroups: function () {
            return this.getMemberSystemData().groups || [];
        },

        emptyVisitation: function () {
            return { goals: [], plans: [], zones: [], teams: [], missions: [], trainings: [], workers: [] };
        },

        getVisitationData: function () {
            var local = getJson(VISIT_KEY);
            var cm = getJson(CM_KEY);
            var pastoral = cm && cm.pastoral && cm.pastoral.visitation ? cm.pastoral.visitation : null;
            var empty = this.emptyVisitation();
            var merged;
            if (!local && !pastoral) merged = empty;
            else if (!local) merged = this.mergeVisitationObjects(empty, pastoral);
            else if (!pastoral) merged = this.mergeVisitationObjects(empty, local);
            else merged = this.mergeVisitationObjects(pastoral, local);
            if (useApi() && _apiCache.visitation && _apiCache.visitation.missions && _apiCache.visitation.missions.length) {
                merged = JSON.parse(JSON.stringify(merged));
                merged.missions = JSON.parse(JSON.stringify(_apiCache.visitation.missions));
            }
            return normalizeVisitationDataInPlace(merged, this.getMembers());
        },

        mergeVisitationObjects: function (fromMaster, fromLocal) {
            var a = fromMaster || this.emptyVisitation();
            var b = fromLocal || this.emptyVisitation();
            var map = {};
            (a.missions || []).forEach(function (m) {
                if (m && m.id != null) map[String(m.id)] = m;
            });
            (b.missions || []).forEach(function (m) {
                if (m && m.id != null) {
                    var k = String(m.id);
                    map[k] = Object.assign({}, map[k] || {}, m);
                }
            });
            var missions = Object.keys(map).map(function (k) { return map[k]; });
            return {
                goals: (b.goals && b.goals.length) ? b.goals : (a.goals || []),
                plans: (b.plans && b.plans.length) ? b.plans : (a.plans || []),
                zones: (b.zones && b.zones.length) ? b.zones : (a.zones || []),
                teams: (b.teams && b.teams.length) ? b.teams : (a.teams || []),
                missions: missions,
                trainings: (b.trainings && b.trainings.length) ? b.trainings : (a.trainings || []),
                workers: (b.workers && b.workers.length) ? b.workers : (a.workers || [])
            };
        },

        saveVisitationMission: function (mission) {
            var vis = this.getVisitationData();
            if (!vis.missions) vis.missions = [];
            var idx = vis.missions.findIndex(function (m) { return m.id === mission.id; });
            if (idx >= 0) vis.missions[idx] = mission;
            else vis.missions.push(mission);
            return this.saveVisitationData(vis);
        },

        /** 儲存探訪資料（正規化後寫入 visitationData + churchMasterDatabase.pastoral.visitation） */
        saveVisitationData: function (visData) {
            var normalized = normalizeVisitationDataInPlace(JSON.parse(JSON.stringify(visData || {})), this.getMembers());
            setJson(VISIT_KEY, normalized);
            var cm = getJson(CM_KEY) || {};
            if (!cm.pastoral) cm.pastoral = {};
            cm.pastoral.visitation = normalized;
            cm.pastoral.visitationSyncedAt = new Date().toISOString();
            setJson(CM_KEY, cm);
            if (useApi() && typeof global.churchCloudFetch === 'function') {
                (normalized.missions || []).forEach(function (m) {
                    bridgeCloudFetch('/api/visitation/missions', { method: 'POST', body: missionToApi(m) }).catch(function (e) {
                        console.warn('[ChurchDataBridge] POST /api/visitation/missions failed', e);
                    });
                });
            }
            this.logActivity('save_visitation_data', { missions: (normalized.missions || []).length }, 'bridge');
            return true;
        },

        getCarePlanData: function () {
            var fromKey = getJson(CARE_PLAN_KEY);
            var cm = getJson(CM_KEY);
            var fromCm = cm && cm.pastoral && cm.pastoral.carePlan;
            var def = {
                fiscalYear: new Date().getFullYear(),
                theme: '',
                focus: '',
                targets: { regular: '', newcomer: '', sick: '', crisis: '' },
                zones: '',
                frequencyPolicy: '',
                updatedAt: null
            };
            if (fromKey && (fromKey.theme || fromKey.focus || (fromKey.targets && Object.keys(fromKey.targets).length))) return fromKey;
            if (fromCm && (fromCm.theme || fromCm.focus)) return fromCm;
            return fromKey || fromCm || def;
        },

        saveCarePlanData: function (plan) {
            plan = plan || {};
            plan.updatedAt = new Date().toISOString();
            setJson(CARE_PLAN_KEY, plan);
            var cm = getJson(CM_KEY) || {};
            if (!cm.pastoral) cm.pastoral = {};
            cm.pastoral.carePlan = plan;
            setJson(CM_KEY, cm);
            return true;
        },

        getCareBoardData: function () {
            var cm = getJson(CM_KEY);
            if (cm && cm.pastoral && cm.pastoral.careBoard && (cm.pastoral.careBoard.items || []).length) {
                return cm.pastoral.careBoard;
            }
            return getJson(CARE_BOARD_KEY) || { items: [] };
        },

        saveCareBoardData: function (board) {
            board = board || { items: [] };
            board.updatedAt = new Date().toISOString();
            setJson(CARE_BOARD_KEY, board);
            var cm = getJson(CM_KEY) || {};
            if (!cm.pastoral) cm.pastoral = {};
            cm.pastoral.careBoard = board;
            setJson(CM_KEY, cm);
            return true;
        },

        getVolunteerData: function () {
            var cm = getJson(CM_KEY);
            if (cm && cm.volunteer) return cm.volunteer;
            var vol = getJson(VOL_KEY);
            return vol || { positions: [], assignments: [], schedules: [] };
        },

        getVolunteerDataAsync: async function () {
            var cm = await getJsonAsync(CM_KEY);
            if (cm && cm.volunteer) return JSON.parse(JSON.stringify(cm.volunteer));
            var vol = await getJsonAsync(VOL_KEY);
            return JSON.parse(JSON.stringify(vol || { positions: [], assignments: [], schedules: [] }));
        },

        getFinanceSummary: function () {
            var finData = this.getFinanceData();
            if (finData && Array.isArray(finData.transactions) && finData.transactions.length) {
                var tx = finData.transactions;
                var inc0 = tx.filter(function (t) { return t.type === 'income'; }).reduce(function (s, t) { return s + (Number(t.amount) || 0); }, 0);
                var exp0 = tx.filter(function (t) { return t.type === 'expense'; }).reduce(function (s, t) { return s + (Number(t.amount) || 0); }, 0);
                return { income: inc0, expense: exp0, balance: inc0 - exp0 };
            }
            var cm = getJson(CM_KEY);
            if (cm && cm.finance) {
                var inc = (cm.finance.incomes || []).reduce(function (s, i) { return s + (i.amount || i.value || 0); }, 0);
                var exp = (cm.finance.expenses || []).reduce(function (s, e) { return s + (e.amount || e.value || 0); }, 0);
                return { income: inc, expense: exp, balance: inc - exp };
            }
            var fin = getJson(FIN_KEY);
            if (fin && fin.transactions) {
                var tx = fin.transactions;
                var inc = tx.filter(function (t) { return t.type === 'income'; }).reduce(function (s, t) { return s + (t.amount || 0); }, 0);
                var exp = tx.filter(function (t) { return t.type === 'expense'; }).reduce(function (s, t) { return s + (t.amount || 0); }, 0);
                return { income: inc, expense: exp, balance: inc - exp };
            }
            var fd = getJson(FIN_ALT);
            if (fd) {
                var inc = (fd.income || []).reduce(function (s, i) { return s + (i.amount || 0); }, 0);
                var exp = (fd.expense || []).reduce(function (s, e) { return s + (e.amount || 0); }, 0);
                return { income: inc, expense: exp, balance: inc - exp };
            }
            return { income: 0, expense: 0, balance: 0 };
        },

        getFinanceData: function (options) {
            options = options || {};
            var includeDeleted = !!options.include_deleted;
            if (_asyncCache.financeData) {
                var fromCache = JSON.parse(JSON.stringify(_asyncCache.financeData));
                if (!includeDeleted) fromCache.transactions = (fromCache.transactions || []).filter(function (t) { return !t.is_deleted; });
                return fromCache;
            }
            console.warn('ChurchDataBridge.getFinanceData: async cache 未命中，建議先呼叫 getFinanceDataAsync');
            this.assertNoDemoSeedInProduction();
            var fin = getJson(FIN_KEY);
            var cm = getJson(CM_KEY) || {};
            if (!fin && cm.financeModule) fin = cm.financeModule;
            if (!fin) fin = { transactions: [], budgets: [], approvals: [] };
            var copy = JSON.parse(JSON.stringify(fin || {}));
            if (!Array.isArray(copy.transactions)) copy.transactions = [];
            if (!Array.isArray(copy.budgets)) copy.budgets = Array.isArray(copy.budgets) ? copy.budgets : [];
            if (!Array.isArray(copy.approvals)) copy.approvals = [];

            if (this.isProductionMode() && isFinanceDemoPayload(copy)) {
                var err = new Error('PROD 禁止載入財務 demo/seed 資料，請先清理 financeSystemData');
                err.code = 'FINANCE_DATA_CONTAMINATION_ERROR';
                throw err;
            }

            copy.transactions = copy.transactions.map(function (t) {
                var n = normalizeFinanceTransaction(t, {});
                return n;
            });
            _asyncCache.financeData = JSON.parse(JSON.stringify(copy));
            if (!includeDeleted) {
                copy.transactions = copy.transactions.filter(function (t) { return !t.is_deleted; });
            }
            return copy;
        },

        getFinanceDataAsync: async function (options) {
            options = options || {};
            var includeDeleted = !!options.include_deleted;
            this.assertNoDemoSeedInProduction();
            var fin = await getJsonAsync(FIN_KEY);
            var cm = await getJsonAsync(CM_KEY) || {};
            if (!fin && cm.financeModule) fin = cm.financeModule;
            if (!fin) fin = { transactions: [], budgets: [], approvals: [] };
            var copy = JSON.parse(JSON.stringify(fin || {}));
            if (!Array.isArray(copy.transactions)) copy.transactions = [];
            if (!Array.isArray(copy.budgets)) copy.budgets = [];
            if (!Array.isArray(copy.approvals)) copy.approvals = [];
            if (this.isProductionMode() && isFinanceDemoPayload(copy)) {
                var err = new Error('PROD 禁止載入財務 demo/seed 資料，請先清理 financeSystemData');
                err.code = 'FINANCE_DATA_CONTAMINATION_ERROR';
                throw err;
            }
            copy.transactions = copy.transactions.map(function (t) { return normalizeFinanceTransaction(t, {}); });
            _asyncCache.financeData = JSON.parse(JSON.stringify(copy));
            if (!includeDeleted) {
                copy.transactions = copy.transactions.filter(function (t) { return !t.is_deleted; });
            }
            return copy;
        },

        getFinanceAuditTrail: function (limit) {
            var cap = Number(limit || 5);
            if (!cap || cap <= 0) cap = 5;
            var all = this.getAuditLogs(500);
            return all.filter(function (x) {
                return x && typeof x.action === 'string' && x.action.indexOf('finance') >= 0;
            }).slice(-cap).reverse();
        },

        getFinanceDiagnostics: function () {
            var fin = this.getFinanceData({ include_deleted: true });
            var txAll = Array.isArray(fin.transactions) ? fin.transactions : [];
            var invalid = 0;
            var deleted = 0;
            txAll.forEach(function (t) {
                var dt = parseDateSafe(t.date || t.timestamp);
                if (t.is_deleted) deleted++;
                if (!dt || !(Number(t.amount) > 0) || !t.txn_id || !t.operator_id) invalid++;
            });
            var activeCount = txAll.length - deleted;
            var healthPct = txAll.length > 0 ? Math.round(((txAll.length - invalid) / txAll.length) * 1000) / 10 : null;
            var healthy = txAll.length > 0 && invalid === 0;
            return {
                status: healthy ? 'healthy' : (txAll.length === 0 ? 'empty' : 'degraded'),
                total_transactions: txAll.length,
                active_transactions: activeCount,
                deleted_transactions: deleted,
                skipped_invalid: invalid,
                health_pct: healthPct,
                source: this.isProductionMode() ? 'production_bridge' : 'development_bridge',
                generated_at: new Date().toISOString(),
                recent_audit: this.getFinanceAuditTrail(5)
            };
        },

        softDeleteFinanceTransaction: function (txnId, reason, meta) {
            meta = meta || {};
            var id = String(txnId || '').trim();
            if (!id) return false;
            var fin = this.getFinanceData({ include_deleted: true });
            var idx = (fin.transactions || []).findIndex(function (t) { return String(t.txn_id || '') === id; });
            if (idx < 0) return false;
            var tx = fin.transactions[idx];
            if (tx.is_deleted) return true;
            tx.is_deleted = true;
            tx.deleted_at = meta.timestamp || new Date().toISOString();
            tx.deleted_by = meta.operator_id || 'finance_operator';
            tx.delete_reason = String(reason || 'manual_void');
            fin.transactions[idx] = tx;
            this.saveFinanceSystemData(fin);
            this.logActivity('finance_soft_delete_transaction', {
                txn_id: tx.txn_id,
                amount: tx.amount,
                reason: tx.delete_reason,
                deleted_at: tx.deleted_at,
                deleted_by: tx.deleted_by
            }, tx.deleted_by);
            return true;
        },

        saveFinanceTransaction: function (payload, meta) {
            payload = payload || {};
            meta = meta || {};
            this.assertNoDemoSeedInProduction();
            var fin = this.getFinanceData();
            var tx = normalizeFinanceTransaction(payload, {
                operator_id: meta.operator_id || payload.operator_id || 'finance_operator',
                timestamp: meta.timestamp || new Date().toISOString(),
                txn_id: payload.txn_id || generateFinanceTxnId()
            });
            fin.transactions = Array.isArray(fin.transactions) ? fin.transactions : [];
            fin.transactions.push(tx);
            this.saveFinanceSystemData(fin);
            this.logActivity('finance_save_transaction', {
                txn_id: tx.txn_id,
                operator_id: tx.operator_id,
                amount: tx.amount,
                type: tx.type
            }, tx.operator_id);
            return tx;
        },

        /**
         * Dashboard KPI 契約（固定時間窗，避免前端各頁各算各的）
         * - retention_4w_pct: 近 28 天曾出席且仍屬 active/in_communion 的會友比例
         * - volunteer_rsvp_3d_pct: 近 3 天排班中已確認比例（若有 invitedAt/respondedAt 則採 72h 準則）
         * - offerings_month_total: 本月收入總額（同幣別原值加總）
         */
        getDashboardKpiSummary: function () {
            if (_asyncCache.dashboardKpiSummary) {
                return JSON.parse(JSON.stringify(_asyncCache.dashboardKpiSummary));
            }
            console.warn('ChurchDataBridge.getDashboardKpiSummary: async cache 未命中，建議先呼叫 getDashboardKpiSummaryAsync');
            this.assertNoDemoSeedInProduction();
            var now = new Date();
            var start28d = getStartOfDay(28);
            var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            var ms = this.getMemberSystemData();
            var members = ms.members || [];
            var attendance = ms.attendance || [];
            var activeMembers = members.filter(function (m) {
                var s = String(m.status || '').toLowerCase();
                return s === 'active' || s === 'in_communion' || s === '';
            });
            var attendedSet = {};
            var skippedAttendanceInvalidDate = 0;
            attendance.forEach(function (a) {
                var dt = parseDateSafe(a.date || a.createdAt || a.updatedAt);
                if (!dt) {
                    skippedAttendanceInvalidDate++;
                    return;
                }
                if (dt < start28d) return;
                if (a.present === false) return;
                var mid = a.memberId != null ? a.memberId : a.member_id;
                if (mid != null) attendedSet[String(mid)] = true;
            });
            var retained = activeMembers.filter(function (m) {
                var mid = m.memberId != null ? m.memberId : m.id;
                return mid != null && attendedSet[String(mid)];
            }).length;
            var retention = activeMembers.length > 0 ? Math.round((retained / activeMembers.length) * 1000) / 10 : null;

            var rsvpSummary = this.getVolunteerRsvpSummary(3);
            var hasEventStore = this.getVolunteerRsvpEvents().length > 0;
            var rsvpConfirmed = rsvpSummary.responded_within_window;
            var rsvpTotal = rsvpSummary.total;
            var rsvpPct = rsvpSummary.responded_within_window_pct;

            var monthIncome = 0;
            var skippedIncomeInvalidDate = 0;
            var financeDiag = this.getFinanceDiagnostics();
            var fin = this.getFinanceData();
            if (fin && Array.isArray(fin.transactions)) {
                fin.transactions.forEach(function (t) {
                    var dt = parseDateSafe(t.date || t.at || t.createdAt || t.updatedAt || t.timestamp);
                    if (!dt) {
                        skippedIncomeInvalidDate++;
                        return;
                    }
                    if (dt < monthStart) return;
                    if (String(t.type || '').toLowerCase() !== 'income') return;
                    monthIncome += Number(t.amount || 0);
                });
            }

            var out = {
                contract_version: 'dashboard_kpi_v1',
                source: this.isProductionMode() ? 'production_bridge' : 'development_bridge',
                generated_at: new Date().toISOString(),
                windows: { retention_days: 28, volunteer_rsvp_days: 3, offerings_scope: 'current_month' },
                retention_4w_pct: retention,
                volunteer_rsvp_3d_pct: rsvpPct,
                volunteer_rsvp_basis: hasEventStore ? 'rsvp_event_store_72h' : 'no_rsvp_events',
                offerings_month_total: Math.round(monthIncome * 100) / 100,
                finance_health_pct: financeDiag.health_pct,
                diagnostics: {
                    active_members: activeMembers.length,
                    attended_active_members_28d: retained,
                    rsvp_total_3d: rsvpTotal,
                    rsvp_confirmed_3d: rsvpConfirmed,
                    finance_total_transactions: financeDiag.total_transactions,
                    finance_deleted_transactions: financeDiag.deleted_transactions,
                    skipped_invalid: {
                        attendance_invalid_date: skippedAttendanceInvalidDate,
                        schedule_invalid_date: rsvpSummary.invalid_events,
                        income_invalid_date: skippedIncomeInvalidDate,
                        finance_invalid_records: financeDiag.skipped_invalid
                    }
                }
            };
            _asyncCache.dashboardKpiSummary = JSON.parse(JSON.stringify(out));
            return out;
        },

        getDashboardKpiSummaryAsync: async function () {
            this.assertNoDemoSeedInProduction();
            var now = new Date();
            var start28d = getStartOfDay(28);
            var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            var ms = this.getMemberSystemData();
            var members = ms.members || [];
            var attendance = ms.attendance || [];
            var activeMembers = members.filter(function (m) {
                var s = String(m.status || '').toLowerCase();
                return s === 'active' || s === 'in_communion' || s === '';
            });
            var attendedSet = {};
            var skippedAttendanceInvalidDate = 0;
            attendance.forEach(function (a) {
                var dt = parseDateSafe(a.date || a.createdAt || a.updatedAt);
                if (!dt) { skippedAttendanceInvalidDate++; return; }
                if (dt < start28d) return;
                if (a.present === false) return;
                var mid = a.memberId != null ? a.memberId : a.member_id;
                if (mid != null) attendedSet[String(mid)] = true;
            });
            var retained = activeMembers.filter(function (m) {
                var mid = m.memberId != null ? m.memberId : m.id;
                return mid != null && attendedSet[String(mid)];
            }).length;
            var retention = activeMembers.length > 0 ? Math.round((retained / activeMembers.length) * 1000) / 10 : null;

            var rsvpSummary = await this.getVolunteerRsvpSummaryAsync(3);
            var hasEventStore = this.getVolunteerRsvpEvents().length > 0;
            var financeDiag = this.getFinanceDiagnostics();
            var fin = await this.getFinanceDataAsync();
            var monthIncome = 0;
            var skippedIncomeInvalidDate = 0;
            (fin.transactions || []).forEach(function (t) {
                var dt = parseDateSafe(t.date || t.at || t.createdAt || t.updatedAt || t.timestamp);
                if (!dt) { skippedIncomeInvalidDate++; return; }
                if (dt < monthStart) return;
                if (String(t.type || '').toLowerCase() !== 'income') return;
                monthIncome += Number(t.amount || 0);
            });

            var out = {
                contract_version: 'dashboard_kpi_v1',
                source: this.isProductionMode() ? 'production_bridge' : 'development_bridge',
                generated_at: new Date().toISOString(),
                windows: { retention_days: 28, volunteer_rsvp_days: 3, offerings_scope: 'current_month' },
                retention_4w_pct: retention,
                volunteer_rsvp_3d_pct: rsvpSummary.responded_within_window_pct,
                volunteer_rsvp_basis: hasEventStore ? 'rsvp_event_store_72h' : 'no_rsvp_events',
                offerings_month_total: Math.round(monthIncome * 100) / 100,
                finance_health_pct: financeDiag.health_pct,
                diagnostics: {
                    active_members: activeMembers.length,
                    attended_active_members_28d: retained,
                    rsvp_total_3d: rsvpSummary.total,
                    rsvp_confirmed_3d: rsvpSummary.responded_within_window,
                    finance_total_transactions: financeDiag.total_transactions,
                    finance_deleted_transactions: financeDiag.deleted_transactions,
                    skipped_invalid: {
                        attendance_invalid_date: skippedAttendanceInvalidDate,
                        schedule_invalid_date: rsvpSummary.invalid_events,
                        income_invalid_date: skippedIncomeInvalidDate,
                        finance_invalid_records: financeDiag.skipped_invalid
                    }
                }
            };
            _asyncCache.dashboardKpiSummary = JSON.parse(JSON.stringify(out));
            return out;
        },

        getDataHealthDetails: function () {
            this.assertNoDemoSeedInProduction();
            var details = {
                generated_at: new Date().toISOString(),
                duplicate_ids: {
                    member_id: [],
                    finance_txn_id: [],
                    rsvp_schedule_id: []
                },
                invalid_date_records: {
                    attendance: [],
                    finance: [],
                    volunteer_rsvp: []
                }
            };

            var ms = this.getMemberSystemData();
            var members = Array.isArray(ms.members) ? ms.members : [];
            var memberSeen = {};
            members.forEach(function (m) {
                var mid = m && (m.member_id || m.memberId || m.id);
                if (mid == null || mid === '') return;
                var key = String(mid);
                memberSeen[key] = (memberSeen[key] || 0) + 1;
            });
            Object.keys(memberSeen).forEach(function (k) {
                if (memberSeen[k] > 1) details.duplicate_ids.member_id.push({ id: k, count: memberSeen[k] });
            });

            var attendance = Array.isArray(ms.attendance) ? ms.attendance : [];
            attendance.forEach(function (a, idx) {
                var dt = parseDateSafe(a && (a.date || a.createdAt || a.updatedAt));
                if (!dt) {
                    details.invalid_date_records.attendance.push({
                        row: idx + 1,
                        member_id: a ? (a.member_id || a.memberId || a.id || '') : '',
                        date: a ? (a.date || a.createdAt || a.updatedAt || '') : ''
                    });
                }
            });

            var fin = this.getFinanceData({ include_deleted: true });
            var tx = Array.isArray(fin.transactions) ? fin.transactions : [];
            var txnSeen = {};
            tx.forEach(function (t, idx) {
                var tid = t && t.txn_id ? String(t.txn_id) : '';
                if (tid) txnSeen[tid] = (txnSeen[tid] || 0) + 1;
                var dt = parseDateSafe(t && (t.date || t.timestamp || t.updatedAt));
                if (!dt) {
                    details.invalid_date_records.finance.push({
                        row: idx + 1,
                        txn_id: tid || '(missing)',
                        date: t ? (t.date || t.timestamp || t.updatedAt || '') : ''
                    });
                }
            });
            Object.keys(txnSeen).forEach(function (k) {
                if (txnSeen[k] > 1) details.duplicate_ids.finance_txn_id.push({ id: k, count: txnSeen[k] });
            });

            var rsvp = this.getVolunteerRsvpEvents();
            var sidSeen = {};
            rsvp.forEach(function (e, idx) {
                var sid = e && e.schedule_id != null ? String(e.schedule_id) : '';
                if (sid) sidSeen[sid] = (sidSeen[sid] || 0) + 1;
                var dt = parseDateSafe(e && e.timeline ? e.timeline.invited_at : null);
                if (!dt) {
                    details.invalid_date_records.volunteer_rsvp.push({
                        row: idx + 1,
                        event_id: e && e.event_id ? e.event_id : '(missing)',
                        invited_at: e && e.timeline ? (e.timeline.invited_at || '') : ''
                    });
                }
            });
            Object.keys(sidSeen).forEach(function (k) {
                if (sidSeen[k] > 1) details.duplicate_ids.rsvp_schedule_id.push({ id: k, count: sidSeen[k] });
            });

            return details;
        },

        getAttendanceDataAsync: async function () {
            var ms = this.getMemberSystemData();
            return Array.isArray(ms.attendance) ? ms.attendance : [];
        },

        getMemberByIdAsync: async function (memberId) {
            var id = String(memberId == null ? '' : memberId);
            var members = this.getMembers();
            return members.find(function (m) {
                return String(m.memberId != null ? m.memberId : m.id) === id;
            }) || null;
        },

        calculateMemberHealthAsync: async function (memberId, options) {
            options = options || {};
            var id = String(memberId == null ? '' : memberId);
            var windowDays = Number(options.window_days || 90);
            if (!windowDays || windowDays <= 0) windowDays = 90;
            var role = String(options.viewer_role || 'leader').toLowerCase();

            var [rsvpEvents, attendance, fin] = await Promise.all([
                getJsonAsync(RSVP_KEY),
                this.getAttendanceDataAsync(),
                this.getFinanceDataAsync({ include_deleted: false })
            ]);
            if (!Array.isArray(rsvpEvents)) rsvpEvents = [];
            var now = new Date();
            var start90 = getStartOfDay(windowDays);
            var start28 = getStartOfDay(28);

            var memberEvents = rsvpEvents.filter(function (e) {
                var vid = e && e.volunteer_id != null ? String(e.volunteer_id) : '';
                if (vid !== id) return false;
                var invited = parseDateSafe(e && e.timeline ? e.timeline.invited_at : null);
                return invited && invited >= start90;
            });
            var rsvpConfirmed = memberEvents.filter(function (e) { return String(e.status || '').toLowerCase() === 'confirmed'; }).length;
            var rsvpTotal = memberEvents.length;
            var rsvpRate = rsvpTotal > 0 ? Math.round((rsvpConfirmed / rsvpTotal) * 1000) / 10 : null;

            var attRecords = (attendance || []).filter(function (a) {
                var mid = a && (a.memberId != null ? a.memberId : a.member_id);
                if (String(mid) !== id) return false;
                var dt = parseDateSafe(a.date || a.createdAt || a.updatedAt);
                return dt && dt >= start28;
            });
            var attPresent = attRecords.filter(function (a) { return a.present !== false; }).length;
            var attTotal = attRecords.length;
            var attendanceRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 1000) / 10 : null;

            var tx = Array.isArray(fin.transactions) ? fin.transactions : [];
            var giftWeeks = {};
            tx.forEach(function (t) {
                if (String(t.type || '').toLowerCase() !== 'income') return;
                var mid = t.memberId != null ? t.memberId : t.member_id;
                if (String(mid) !== id) return;
                var dt = parseDateSafe(t.date || t.timestamp || t.updatedAt);
                if (!dt || dt < start90 || dt > now) return;
                giftWeeks[getIsoWeekKey(dt)] = true;
            });
            var weeksInWindow = Math.max(1, Math.ceil(windowDays / 7));
            var offerFreq = Math.round((Object.keys(giftWeeks).length / weeksInWindow) * 1000) / 10;

            var rsvpScore = rsvpRate == null ? 0 : rsvpRate;
            var attScore = attendanceRate == null ? 0 : attendanceRate;
            var offerScore = offerFreq;
            var score = Math.round((rsvpScore * 0.4 + attScore * 0.4 + offerScore * 0.2) * 10) / 10;
            var level = score >= 75 ? 'healthy' : (score >= 50 ? 'watch' : 'at_risk');

            var masked = [];
            if (!(role === 'pastor' || role === 'elder' || role === 'admin')) {
                masked.push('finance_amount');
            }

            var out = {
                member_id: id,
                window_days: windowDays,
                metrics: {
                    rsvp_rate: rsvpRate,
                    attendance_rate_4w: attendanceRate,
                    offering_frequency_90d: offerFreq
                },
                weighted: { rsvp: 40, attendance: 40, offering_frequency: 20 },
                score: score,
                level: level,
                masked_fields: masked,
                generated_at: new Date().toISOString()
            };
            _asyncCache.memberHealth[id] = out;
            return JSON.parse(JSON.stringify(out));
        },

        evaluateSmartAlertsAsync: async function () {
            var [events, attendance] = await Promise.all([
                getJsonAsync(RSVP_KEY),
                this.getAttendanceDataAsync()
            ]);
            if (!Array.isArray(events)) events = [];
            if (!Array.isArray(attendance)) attendance = [];
            var start14 = getStartOfDay(14);
            var weekDeclinedByMember = {};
            events.forEach(function (e) {
                var dt = parseDateSafe(e && e.timeline ? e.timeline.invited_at : null);
                if (!dt || dt < start14) return;
                if (String(e.status || '').toLowerCase() !== 'declined') return;
                var mid = e && e.volunteer_id != null ? String(e.volunteer_id) : '';
                if (!mid) return;
                var wk = getIsoWeekKey(dt);
                if (!weekDeclinedByMember[mid]) weekDeclinedByMember[mid] = {};
                weekDeclinedByMember[mid][wk] = true;
            });
            var weekAbsentByMember = {};
            attendance.forEach(function (a) {
                var dt = parseDateSafe(a && (a.date || a.createdAt || a.updatedAt));
                if (!dt || dt < start14) return;
                if (a.present !== false) return;
                var mid = a && (a.memberId != null ? a.memberId : a.member_id);
                mid = String(mid == null ? '' : mid);
                if (!mid) return;
                var wk = getIsoWeekKey(dt);
                if (!weekAbsentByMember[mid]) weekAbsentByMember[mid] = {};
                weekAbsentByMember[mid][wk] = true;
            });

            var alerts = [];
            Object.keys(weekDeclinedByMember).forEach(function (mid) {
                var declinedWeeks = weekDeclinedByMember[mid] || {};
                var absentWeeks = weekAbsentByMember[mid] || {};
                var overlap = Object.keys(declinedWeeks).filter(function (wk) { return !!absentWeeks[wk]; });
                if (overlap.length >= 2) {
                    alerts.push({
                        alert_id: 'ALERT-R1-' + mid + '-' + overlap.slice(0, 2).join('-'),
                        rule_id: 'R1_rsvp_declined_absent_2w',
                        member_id: mid,
                        severity: 'high',
                        status: 'open',
                        recommendation: '建議 48 小時內主動關懷聯繫',
                        evidence: { overlap_weeks: overlap.slice(0, 4), declined_weeks: Object.keys(declinedWeeks), absent_weeks: Object.keys(absentWeeks) },
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                }
            });
            _asyncCache.smartAlerts = alerts;
            return JSON.parse(JSON.stringify(alerts));
        },

        getSmartAlerts: function () {
            return JSON.parse(JSON.stringify(_asyncCache.smartAlerts || []));
        },

        runPastoralAnalytics: async function (memberId) {
            var id = String(memberId == null ? '' : memberId);
            var health = await this.calculateMemberHealthAsync(id, { window_days: 90 });
            var alerts = await this.evaluateSmartAlertsAsync();
            return {
                health: health,
                alerts: alerts.filter(function (a) { return String(a.member_id) === id; })
            };
        },

        getDashboardSummary: function () {
            return this.getDashboardKpiSummary();
        },

        /** 讀取並正規化 memberSystemData（含 zones、memberId）；優先 memberSystemData，否則自 churchMasterDatabase 組回 */
        getMemberSystemData: function () {
            var raw = getRawMemberSystemPayload();
            var ms = JSON.parse(JSON.stringify(raw));
            if (useApi()) {
                if (_apiCache.members && _apiCache.members.length) {
                    ms.members = JSON.parse(JSON.stringify(_apiCache.members));
                }
                if (_apiCache.groups && _apiCache.groups.length) {
                    ms.groups = JSON.parse(JSON.stringify(_apiCache.groups));
                }
            }
            return normalizeMemberSystemData(ms);
        },

        /**
         * 儲存會友主檔 JSON（正規化、寫入 memberSystemData、同步 churchMasterDatabase）
         * USE_API 時另以 POST /api/members 同步每筆會友（失敗僅 console.warn）
         */
        saveMemberSystemData: function (ms, opts) {
            opts = opts || {};
            if (!opts.skipRbac) assertRbac('members.write');
            var normalized = normalizeMemberSystemData(JSON.parse(JSON.stringify(ms || {})));
            normalized.members = (normalized.members || []).map((function (m) {
                return this.normalizeRecord('member', m);
            }).bind(this));
            setJson(MS_KEY, normalized);
            syncMemberSystemToChurchMaster(normalized);
            if (useApi() && typeof global.churchCloudFetch === 'function') {
                (normalized.members || []).forEach(function (m) {
                    bridgeCloudFetch('/api/members', { method: 'POST', body: memberToApi(m) }).catch(function (e) {
                        console.warn('[ChurchDataBridge] POST /api/members failed', e);
                    });
                });
            }
            if (useSheetsSsot() && global.ChurchSheetsSsot && global.ChurchSheetsSsot.pushMembersBatch) {
                global.ChurchSheetsSsot.pushMembersBatch(normalized.members || []).catch(function (e) {
                    console.warn('[ChurchDataBridge] Sheets pushMembersBatch', e);
                });
            }
            this.logActivity('save_member_system_data', { members: (normalized.members || []).length }, 'bridge');
            return true;
        },

        /**
         * 與 saveMemberSystemData 相同語意，但經 async storage（Mock 雲可記錄延遲與 church-mock-cloud-sync）
         * @param {object} ms 會友主檔
         * @param {{ transaction?: boolean, onPhase?: (phase: number, total: number) => void }} [opts]
         */
        saveMemberSystemDataAsync: async function (ms, opts) {
            opts = opts || {};
            var onPhase = typeof opts.onPhase === 'function' ? opts.onPhase : null;
            var useTx = !!opts.transaction &&
                typeof global.churchMockCloudBeginTransaction === 'function' &&
                typeof global.churchMockCloudCommitTransaction === 'function';
            var txOpen = false;
            function finishTx(ok) {
                if (!useTx || !txOpen) return;
                txOpen = false;
                global.churchMockCloudCommitTransaction(ok);
            }
            try {
                if (useTx) {
                    global.churchMockCloudBeginTransaction();
                    txOpen = true;
                }
                var normalized = normalizeMemberSystemData(JSON.parse(JSON.stringify(ms || {})));
                normalized.members = (normalized.members || []).map((function (m) {
                    return this.normalizeRecord('member', m);
                }).bind(this));
                if (onPhase) onPhase(1, 3);
                await setJsonAsync(MS_KEY, normalized);
                await syncMemberSystemToChurchMasterAsync(normalized, onPhase);
                if (useApi() && typeof global.churchCloudFetch === 'function') {
                    (normalized.members || []).forEach(function (m) {
                        bridgeCloudFetch('/api/members', { method: 'POST', body: memberToApi(m) }).catch(function (e) {
                            console.warn('[ChurchDataBridge] POST /api/members failed', e);
                        });
                    });
                }
                this.logActivity('save_member_system_data', { members: (normalized.members || []).length }, 'bridge');
                finishTx(true);
                return true;
            } catch (e) {
                finishTx(false);
                throw e;
            }
        },

        /** 非同步預熱 storage 後回傳與 getMemberSystemData() 相同之正規化物件 */
        getMemberSystemDataAsync: async function () {
            await getJsonAsync(MS_KEY);
            return this.getMemberSystemData();
        },

        /**
         * 更新單一會友欄位並寫回主檔（如 education_history 陣列）
         * 使用 saveMemberSystemDataAsync，使 Mock 雲端延遲與同步日誌可觀察
         * @param {{ transaction?: boolean, onPhase?: (phase: number, total: number) => void }} [opts] 傳入 saveMemberSystemDataAsync（例如交易合併日誌、階段回呼）
         */
        updateMemberFieldAsync: async function (memberId, fieldName, value, opts) {
            var self = this;
            var id = String(memberId == null ? '' : memberId);
            var ms = self.getMemberSystemData();
            var found = false;
            (ms.members || []).forEach(function (m) {
                var mid = m.memberId != null ? m.memberId : m.id;
                if (mid == null || String(mid) !== id) return;
                found = true;
                if (value !== null && typeof value === 'object') {
                    m[fieldName] = JSON.parse(JSON.stringify(value));
                } else {
                    m[fieldName] = value;
                }
            });
            if (!found) {
                var err = new Error('updateMemberFieldAsync: member not found ' + id);
                err.code = 'MEMBER_NOT_FOUND';
                throw err;
            }
            await self.saveMemberSystemDataAsync(ms, opts || {});
            self.logActivity('member_field_updated', { memberId: id, field: String(fieldName || '') }, 'bridge');
            return { ok: true, memberId: id, field: fieldName };
        },

        /** 直讀 persistence SSOT（getJsonSync），不經 API 快取 */
        getMemberSystemPayloadFromPersistenceSync: function () {
            if (!_storage || typeof _storage.getJsonSync !== 'function') return null;
            return _storage.getJsonSync(MS_KEY);
        },

        getChurchMasterPayloadFromPersistenceSync: function () {
            if (!_storage || typeof _storage.getJsonSync !== 'function') return null;
            return _storage.getJsonSync(CM_KEY);
        },

        /**
         * 最終一致性：比對 memberSystemData 與 churchMasterDatabase 內該會友欄位是否等於預期值
         */
        verifyMemberFieldPersistenceSync: function (memberId, fieldName, expectedValue) {
            var id = String(memberId == null ? '' : memberId);
            var msRaw = this.getMemberSystemPayloadFromPersistenceSync();
            var cmRaw = this.getChurchMasterPayloadFromPersistenceSync();
            var m1 = findMemberInList(msRaw && msRaw.members, id);
            var m2 = findMemberInList(cmRaw && cmRaw.members, id);
            var v1 = m1 ? m1[fieldName] : undefined;
            var v2 = m2 ? m2[fieldName] : undefined;
            var issues = [];
            if (v1 !== expectedValue) issues.push('memberSystemData 欄位不符');
            if (v2 !== expectedValue) issues.push('churchMasterDatabase 欄位不符');
            return {
                ok: issues.length === 0,
                issues: issues,
                memberSystemValue: v1,
                churchMasterValue: v2
            };
        },

        /** 研究／報表用：自原始主檔快照統計（非假資料） */
        getMemberSystemSnapshotForStats: function () {
            var raw = getRawMemberSystemPayload();
            var members = raw.members || [];
            var baptized = 0;
            var withEdu = 0;
            var withDisc = 0;
            members.forEach(function (m) {
                var b = m.baptized;
                if (b === true || b === 1 || b === '1' || b === 'yes' || b === '是') baptized++;
                if (Array.isArray(m.education_history) && m.education_history.length) withEdu++;
                if (m.discipleship_progress != null && m.discipleship_progress !== '') withDisc++;
            });
            return {
                memberCount: members.length,
                baptizedCount: baptized,
                membersWithEducationHistory: withEdu,
                membersWithDiscipleshipProgress: withDisc
            };
        },

        /** 與 getRawMemberSystemPayload 一致之深拷貝（供研究腳本統計） */
        getRawMemberSystemPayloadPublic: function () {
            return JSON.parse(JSON.stringify(getRawMemberSystemPayload()));
        },

        getChurchMaster: function () {
            return getJson(CM_KEY) || {};
        },

        getMemberById: function (memberId) {
            var members = this.getMembers();
            return members.find(function (m) {
                return String(m.id) === String(memberId) || String(m.memberId) === String(memberId);
            }) || null;
        },

        /** 供探訪頁等：正規化任務與分區欄位 */
        normalizeVisitationPayload: function (vis) {
            return normalizeVisitationDataInPlace(vis, this.getMembers());
        },

        normalizeMemberSystemPayload: function (ms) {
            return normalizeMemberSystemData(ms);
        },

        /** 學校事工：讀取 schoolMasterDatabase（主日學／全校學籍） */
        getSchoolMinistrySummary: function () {
            var school = getJson('schoolMasterDatabase');
            if (!school || typeof school !== 'object') return null;
            var enrollments = (school.student && school.student.enrollments) ? school.student.enrollments : [];
            return {
                students: (school.students || []).length,
                teachers: (school.teachers || []).length,
                courses: (school.courses || []).length,
                enrollments: enrollments.length,
                storageKey: 'schoolMasterDatabase'
            };
        },

        /**
         * 將學校人數摘要寫入 churchMasterDatabase.education.schoolSnapshot（供儀表板／報表單一讀取）
         * TODO: 正式部署改為 API 同步後再更新快照
         */
        syncSchoolSnapshotToChurchMaster: function () {
            var sum = this.getSchoolMinistrySummary();
            if (!sum) return false;
            var cm = getJson(CM_KEY) || {};
            cm.education = cm.education || {};
            cm.education.schoolSnapshot = Object.assign({ syncedAt: new Date().toISOString() }, sum);
            setJson(CM_KEY, cm);
            return true;
        },

        /** 門訓班級（本機 discipleData） */
        getDiscipleClasses: function () {
            tryMigrateDiscipleDataFromLegacyLocalStorage();
            var raw = getJson('discipleData');
            return Array.isArray(raw) ? raw : [];
        },

        getDiscipleClassesAsync: async function () {
            tryMigrateDiscipleDataFromLegacyLocalStorage();
            var raw = await getJsonAsync('discipleData');
            return Array.isArray(raw) ? raw : [];
        },

        /**
         * 儲存門訓班級並同步至 churchMasterDatabase.discipleship
         * TODO: 正式部署改為 API
         */
        saveDiscipleClasses: function (classes) {
            var arr = Array.isArray(classes) ? classes : [];
            setJson('discipleData', arr);
            var cm = getJson(CM_KEY) || {};
            cm.discipleship = cm.discipleship || {};
            cm.discipleship.classes = arr;
            cm.discipleship.updatedAt = new Date().toISOString();
            setJson(CM_KEY, cm);
            return true;
        },

        saveDiscipleClassesAsync: async function (classes) {
            var arr = Array.isArray(classes) ? classes : [];
            await setJsonAsync('discipleData', arr);
            var cm = (await getJsonAsync(CM_KEY)) || {};
            cm.discipleship = cm.discipleship || {};
            cm.discipleship.classes = arr;
            cm.discipleship.updatedAt = new Date().toISOString();
            await setJsonAsync(CM_KEY, cm);
            this.logActivity('save_disciple_classes_async', { count: arr.length }, 'discipleship');
            return true;
        },

        /** AI 事工頁：本機對話歷史筆數（示意） */
        getAiChatStats: function () {
            var raw = getJson('aiChatHistory');
            var n = 0;
            if (Array.isArray(raw)) n = raw.length;
            return { storageKey: 'aiChatHistory', sessionsOrEntries: n };
        },

        /** 教育事工預設骨架（與 education-integrated.html 一致） */
        emptyEducationSystemData: function () {
            return {
                classes: [],
                students: [],
                teachers: [],
                curriculum: [],
                attendance: [],
                assessments: []
            };
        },

        /**
         * 讀取 educationSystemData；若本機無則嘗試 churchMasterDatabase.education.integrated
         * TODO: USE_API 時改為 fetch
         */
        getEducationSystemData: function () {
            tryMigrateEducationSystemFromLegacyLocalStorage();
            var def = this.emptyEducationSystemData();
            var fromLs = getJson(EDUCATION_KEY);
            if (fromLs && typeof fromLs === 'object') {
                return Object.assign({}, def, fromLs);
            }
            var cm = getJson(CM_KEY);
            var integ = cm && cm.education && cm.education.integrated;
            if (integ && typeof integ === 'object') {
                return Object.assign({}, def, integ);
            }
            return Object.assign({}, def);
        },

        getEducationSystemDataAsync: async function () {
            tryMigrateEducationSystemFromLegacyLocalStorage();
            var def = this.emptyEducationSystemData();
            var fromLs = await getJsonAsync(EDUCATION_KEY);
            if (fromLs && typeof fromLs === 'object') {
                return Object.assign({}, def, fromLs);
            }
            var cm = (await getJsonAsync(CM_KEY)) || {};
            var integ = cm && cm.education && cm.education.integrated;
            if (integ && typeof integ === 'object') {
                return Object.assign({}, def, integ);
            }
            return Object.assign({}, def);
        },

        /**
         * 儲存教育事工完整 JSON → educationSystemData + churchMasterDatabase.education.integrated
         * 與 education.schoolSnapshot（學校管理摘要）並列，不覆蓋
         * TODO: 正式部署改為 POST /api/education/integrated
         */
        saveEducationSystemData: function (educationData) {
            var copy = JSON.parse(JSON.stringify(educationData || this.emptyEducationSystemData()));
            setJson(EDUCATION_KEY, copy);
            var cm = getJson(CM_KEY) || {};
            cm.education = cm.education || {};
            cm.education.integrated = copy;
            cm.education.integratedSyncedAt = new Date().toISOString();
            setJson(CM_KEY, cm);
            return true;
        },

        saveEducationSystemDataAsync: async function (educationData) {
            var copy = JSON.parse(JSON.stringify(educationData || this.emptyEducationSystemData()));
            await setJsonAsync(EDUCATION_KEY, copy);
            var cm = (await getJsonAsync(CM_KEY)) || {};
            cm.education = cm.education || {};
            cm.education.integrated = copy;
            cm.education.integratedSyncedAt = new Date().toISOString();
            await setJsonAsync(CM_KEY, cm);
            this.logActivity('save_education_system_data_async', { classes: (copy.classes || []).length }, 'education');
            return true;
        },

        /**
         * A 模組目標／成果（church_ministry_a_education）同步至 churchMasterDatabase.education.aModule
         */
        saveEducationAModuleData: function (aModule) {
            var mod = aModule || { goals: [], outcomes: [] };
            if (!mod.goals) mod.goals = [];
            if (!mod.outcomes) mod.outcomes = [];
            var copy = JSON.parse(JSON.stringify(mod));
            setJson(EDUCATION_A_KEY, copy);
            var cm = getJson(CM_KEY) || {};
            cm.education = cm.education || {};
            cm.education.aModule = copy;
            cm.education.aModuleSyncedAt = new Date().toISOString();
            setJson(CM_KEY, cm);
            return true;
        },

        getEducationAModuleData: function () {
            tryMigrateEducationAModuleFromLegacyLocalStorage();
            var def = { goals: [], outcomes: [] };
            var fromLs = getJson(EDUCATION_A_KEY);
            if (fromLs && typeof fromLs === 'object') {
                return Object.assign({}, def, fromLs);
            }
            var cm = getJson(CM_KEY);
            var am = cm && cm.education && cm.education.aModule;
            if (am && typeof am === 'object') {
                return Object.assign({}, def, am);
            }
            return Object.assign({}, def);
        },

        /**
         * 自 church_ministry/modules/&lt;任意子模組&gt;/*.html 出發的相對路徑（與會友／探訪對齊）
         * 若頁面不在 modules 下，請傳入 prefix 覆寫。
         */
        pathsFromModulePage: function (prefix) {
            var p = prefix == null ? '../' : prefix;
            return {
                memberIntegrated: p + 'members/member-integrated.html',
                memberIntegratedMembers: p + 'members/member-integrated.html#tab-members',
                memberIntegratedGrowth: p + 'members/member-integrated.html#tab-growth',
                visitation: p + 'support/visitation.html',
                loadMemberSeed: '../../load_central_member_seed.html'
            };
        },

        /**
         * 帶 memberId 的會友頁連結（query 供前端 highlight；正式環境可改為路由）
         */
        urlMemberProfile: function (memberId, prefix) {
            var paths = this.pathsFromModulePage(prefix);
            if (memberId == null || memberId === '') return paths.memberIntegratedMembers;
            return paths.memberIntegratedMembers + '?memberId=' + encodeURIComponent(String(memberId));
        },

        /** UI 用：資料來源說明（與 cloud_config USE_API 呼應） */
        getDataSourceHint: function () {
            var c = global.CHURCH_CLOUD_CONFIG;
            if (c && c.USE_MOCK_CLOUD) {
                return '目前：Mock 雲端 Persistence（模擬延遲 ' + (Number(c.MOCK_CLOUD_LATENCY_MS) || 450) + 'ms，記憶體 + localStorage 複本）；非真實後端。';
            }
            if (useSheetsSsot()) {
                return '目前：Google Sheets SSOT；Web App 已設定。';
            }
            if (useApi()) {
                return '目前：CHURCH_CLOUD_CONFIG.USE_API 已啟用，會友／小組優先自 API 快取讀取；其餘模組仍可能為本機 JSON。';
            }
            if (c && c.REQUIRE_AUTH) {
                return '目前：本機資料 + RBAC（REQUIRE_AUTH）；請先登入。';
            }
            return '目前：本機 localStorage（educationSystemData、churchMasterDatabase 等）；正式部署設 CHURCH_CLOUD_CONFIG.USE_API 與 API_BASE_URL。若 APP_ENV=production 會啟用 demo/seed 污染硬攔截。';
        },

        /**
         * 志工事工完整資料 → volunteerSystemData + churchMasterDatabase.volunteer
         * TODO: 正式部署改為 API
         */
        saveVolunteerSystemData: function (volData) {
            var copy = JSON.parse(JSON.stringify(volData || {}));
            setJson(VOL_KEY, copy);
            var cm = getJson(CM_KEY) || {};
            cm.volunteer = copy;
            cm.volunteerSyncedAt = new Date().toISOString();
            setJson(CM_KEY, cm);
            if (typeof this.syncMinistryCatalogFromVolunteer === 'function') {
                try {
                    this.syncMinistryCatalogFromVolunteer(copy);
                } catch (syncErr) {
                    console.warn('[ChurchDataBridge] syncMinistryCatalogFromVolunteer', syncErr);
                }
            }
            this.logActivity('save_volunteer_system_data', { schedules: (copy.schedules || []).length }, 'bridge');
            return true;
        },

        /**
         * 義工排班 · 列表（volunteer_shift 工具 SSOT 讀取）
         */
        listVolunteerShifts: function (filters) {
            filters = filters && typeof filters === 'object' ? filters : {};
            var vol = this.getVolunteerData() || {};
            var list = Array.isArray(vol.schedules) ? vol.schedules.slice() : [];
            if (filters.fromDate || filters.from) {
                var from = String(filters.fromDate || filters.from);
                list = list.filter(function (s) { return String(s.date || '') >= from; });
            }
            if (filters.toDate || filters.to) {
                var to = String(filters.toDate || filters.to);
                list = list.filter(function (s) { return String(s.date || '') <= to; });
            }
            if (filters.memberId != null || filters.member_id != null) {
                var mid = String(filters.memberId != null ? filters.memberId : filters.member_id);
                list = list.filter(function (s) { return String(s.memberId) === mid; });
            }
            if (filters.ministryId != null || filters.ministry_id != null) {
                var gid = String(filters.ministryId != null ? filters.ministryId : filters.ministry_id);
                list = list.filter(function (s) { return String(s.ministryId) === gid; });
            }
            if (filters.confirmed != null) {
                var want = !!filters.confirmed;
                list = list.filter(function (s) { return !!s.confirmed === want; });
            }
            list.sort(function (a, b) {
                return String(b.date || '').localeCompare(String(a.date || '')) ||
                    String(b.id || '').localeCompare(String(a.id || ''));
            });
            var lim = Number(filters.limit || 0);
            if (lim > 0) list = list.slice(0, lim);
            return list;
        },

        getVolunteerShiftSummary: function (days) {
            var windowDays = Number(days || 14);
            if (!isFinite(windowDays) || windowDays <= 0) windowDays = 14;
            var list = this.listVolunteerShifts({});
            var today = new Date();
            var end = new Date(today.getTime());
            end.setDate(end.getDate() + windowDays);
            var todayStr = today.toISOString().slice(0, 10);
            var endStr = end.toISOString().slice(0, 10);
            var inWindow = list.filter(function (s) {
                var d = String(s.date || '');
                return d >= todayStr && d <= endStr;
            });
            return {
                total: list.length,
                window_days: windowDays,
                upcoming: inWindow.length,
                pending_confirm: inWindow.filter(function (s) { return !s.confirmed; }).length,
                confirmed: inWindow.filter(function (s) { return !!s.confirmed; }).length,
                pending_ctv_suggestions: (this.listPendingMinistrySuggestions() || []).length
            };
        },

        buildShiftInviteSnippet: function (schedule) {
            var s = schedule && typeof schedule === 'object' ? schedule : {};
            var who = s.memberName || s.member_name || s.memberId || s.member_id || '同工';
            var when = s.date || '（日期待定）';
            var what = s.shift || s.ministryName || s.ministry_name || '服事';
            return '【服事邀請 · 請人工確認後轉發】' + who + '，可否在 ' + when + ' 擔任「' + what + '」？請回覆可否，謝謝。';
        },

        /**
         * 義工排班 · 新增／更新 → volunteerSystemData.schedules
         */
        saveVolunteerShift: function (payload) {
            assertRbac('volunteer.write');
            var p = payload && typeof payload === 'object' ? payload : {};
            var memberId = p.member_id != null ? p.member_id : p.memberId;
            if (memberId == null || memberId === '') {
                throw new Error('saveVolunteerShift requires member_id');
            }
            if (!p.date) {
                throw new Error('saveVolunteerShift requires date');
            }
            var vol = this.getVolunteerData() || {};
            if (!Array.isArray(vol.schedules)) vol.schedules = [];
            var members = this.getMembers() || [];
            var mid = String(memberId);
            var mem = members.find(function (m) {
                return String(m.memberId != null ? m.memberId : m.id) === mid;
            });
            var memberName = p.member_name || p.memberName || (mem ? (mem.name || mem.fullName) : mid);
            var ministryId = p.ministry_id != null ? p.ministry_id : p.ministryId;
            var ministryName = p.ministry_name || p.ministryName || '';
            var ministries = vol.ministries || vol.positions || [];
            if (ministryId != null && !ministryName) {
                var pos = ministries.find(function (m) {
                    return String(m.id) === String(ministryId);
                });
                if (pos) ministryName = pos.name || '';
            }
            var nextId = 1;
            vol.schedules.forEach(function (s) {
                var n = Number(s.id);
                if (isFinite(n) && n >= nextId) nextId = n + 1;
            });
            var now = nowIso();
            var isUpdate = p.id != null && p.id !== '';
            var schedule;
            if (isUpdate) {
                var idx = vol.schedules.findIndex(function (s) { return String(s.id) === String(p.id); });
                if (idx < 0) throw new Error('shift not found: ' + p.id);
                schedule = Object.assign({}, vol.schedules[idx], {
                    memberId: isFinite(Number(mid)) ? Number(mid) : mid,
                    memberName: memberName,
                    ministryId: ministryId != null ? (isFinite(Number(ministryId)) ? Number(ministryId) : ministryId) : vol.schedules[idx].ministryId,
                    ministryName: ministryName || vol.schedules[idx].ministryName || '',
                    date: String(p.date).slice(0, 10),
                    shift: p.shift || p.service_name || vol.schedules[idx].shift || '主日崇拜',
                    confirmed: p.confirmed != null ? !!p.confirmed : !!vol.schedules[idx].confirmed,
                    status: p.status || vol.schedules[idx].status || 'pending',
                    note: p.note != null ? p.note : (vol.schedules[idx].note || ''),
                    assignment_id: p.assignment_id != null ? p.assignment_id : vol.schedules[idx].assignment_id,
                    source: vol.schedules[idx].source || 'volunteer_shift_tool',
                    updated_at: now
                });
                vol.schedules[idx] = schedule;
            } else {
                schedule = {
                    id: nextId,
                    memberId: isFinite(Number(mid)) ? Number(mid) : mid,
                    memberName: memberName,
                    ministryId: ministryId != null ? (isFinite(Number(ministryId)) ? Number(ministryId) : ministryId) : null,
                    ministryName: ministryName || '',
                    date: String(p.date).slice(0, 10),
                    shift: p.shift || p.service_name || '主日崇拜',
                    confirmed: !!p.confirmed,
                    status: p.status || (p.confirmed ? 'confirmed' : 'pending'),
                    source: p.source || 'volunteer_shift_tool',
                    assignment_id: p.assignment_id || p.promote_assignment_id || null,
                    note: p.note || '',
                    created_at: now,
                    updated_at: now
                };
                vol.schedules.push(schedule);
            }
            this.saveVolunteerSystemData(vol);
            if (p.promote_assignment_id && typeof this.updateMinistryAssignmentStatus === 'function') {
                this.updateMinistryAssignmentStatus(p.promote_assignment_id, 'active', { note: 'volunteer_shift_created' });
            }
            var rsvp = null;
            if (p.create_rsvp_invite && typeof this.createVolunteerRsvpEvent === 'function') {
                rsvp = this.createVolunteerRsvpEvent({
                    schedule_id: schedule.id,
                    service_id: schedule.shift ? 'SVC-' + schedule.shift : 'SVC-' + schedule.id,
                    volunteer_id: String(schedule.memberId),
                    volunteer_name: schedule.memberName || '',
                    status: 'pending'
                });
            }
            this.logActivity('save_volunteer_shift', {
                schedule_id: schedule.id,
                member_id: mid,
                date: schedule.date
            }, 'volunteer_shift');
            return {
                ok: true,
                schedule: JSON.parse(JSON.stringify(schedule)),
                rsvp: rsvp,
                leader_outreach_snippet: this.buildShiftInviteSnippet(schedule)
            };
        },

        /**
         * CTV 候選 + 志工池（智能排班用；不自動派工）
         */
        listShiftCandidates: function (opts) {
            opts = opts && typeof opts === 'object' ? opts : {};
            var out = [];
            var ministryFilter = opts.ministry_id != null ? opts.ministry_id : opts.ministryId;
            var pending = this.listPendingMinistrySuggestions(ministryFilter) || [];
            var members = this.getMembers() || [];
            var nameById = {};
            members.forEach(function (m) {
                var id = String(m.memberId != null ? m.memberId : m.id);
                nameById[id] = m.name || m.fullName || id;
            });
            pending.forEach(function (row) {
                var tid = String(row.talent_id != null ? row.talent_id : (row.member_id != null ? row.member_id : ''));
                out.push({
                    type: 'ctv_suggestion',
                    assignment_id: row.id,
                    member_id: tid,
                    member_name: nameById[tid] || tid,
                    ministry_id: row.ministry_id,
                    ministry_name: row.ministry_name || row.ministry_id,
                    match_score: row.metadata && row.metadata.matchScore != null ? row.metadata.matchScore : null,
                    status: row.status
                });
            });
            if (opts.include_volunteer_pool !== false) {
                var vol = this.getVolunteerData() || {};
                var assignments = Array.isArray(vol.assignments) ? vol.assignments : [];
                var exclude = opts.exclude_member_ids || opts.excludeMemberIds || [];
                var excludeSet = {};
                (exclude || []).forEach(function (id) { excludeSet[String(id)] = true; });
                assignments.forEach(function (a) {
                    if (!a) return;
                    var id = String(a.memberId);
                    if (excludeSet[id]) return;
                    if (ministryFilter != null && String(a.ministryId) !== String(ministryFilter)) return;
                    out.push({
                        type: 'volunteer_pool',
                        member_id: id,
                        member_name: a.memberName || nameById[id] || id,
                        ministry_id: a.ministryId,
                        ministry_name: a.ministryName || ''
                    });
                });
            }
            return out;
        },

        promoteAssignmentToShift: function (assignmentId, shiftPayload) {
            var canon = global.SmartMinistryCanonical;
            if (!canon || !canon.listMinistryAssignments) {
                return { ok: false, error: 'SmartMinistryCanonical unavailable' };
            }
            var row = (canon.listMinistryAssignments() || []).find(function (a) {
                return String(a.id) === String(assignmentId);
            });
            if (!row) return { ok: false, error: 'assignment_not_found' };
            if (typeof this.confirmMinistryAssignment === 'function') {
                this.confirmMinistryAssignment(assignmentId, { note: 'promote_to_shift' });
            }
            var payload = Object.assign({}, shiftPayload || {}, {
                member_id: row.talent_id,
                ministry_id: row.ministry_id,
                ministry_name: row.ministry_name,
                promote_assignment_id: assignmentId,
                assignment_id: assignmentId
            });
            if (!payload.date) {
                payload.date = new Date().toISOString().slice(0, 10);
            }
            return this.saveVolunteerShift(payload);
        },

        /**
         * 志工崗位 → Smart Ministry 事工目錄（配對用）
         */
        syncMinistryCatalogFromVolunteer: function (volData) {
            var vol = volData || getJson(VOL_KEY) || {};
            var rows = Array.isArray(vol.ministries) ? vol.ministries : [];
            var canon = global.SmartMinistryCanonical;
            if (!canon || typeof canon.upsertMinistryCatalog !== 'function') {
                return { synced: 0, reason: 'SmartMinistryCanonical unavailable' };
            }
            var synced = 0;
            rows.forEach(function (m) {
                if (!m || !m.name) return;
                var vid = m.id != null ? String(m.id) : slugZoneName(String(m.name));
                var mid = 'vol_' + vid;
                canon.upsertMinistryCatalog({
                    ministry_id: mid,
                    id: mid,
                    name: m.name,
                    category: m.category || 'general',
                    need_people: m.needPeople != null ? m.needPeople : 0,
                    requirements_text: m.requirements || '',
                    description: m.description || '',
                    source: 'volunteerSystemData',
                    volunteer_ministry_id: m.id
                });
                synced++;
            });
            return { synced: synced };
        },

        listMinistryAssignmentsByMemberId: function (memberId) {
            var id = String(memberId == null ? '' : memberId);
            var canon = global.SmartMinistryCanonical;
            if (!canon || typeof canon.listMinistryAssignments !== 'function') return [];
            return (canon.listMinistryAssignments() || []).filter(function (a) {
                return String(a.talent_id != null ? a.talent_id : (a.member_id != null ? a.member_id : '')) === id;
            });
        },

        appendPastoralEvent: function (payload) {
            assertRbac('pastoral.write');
            var p = payload && typeof payload === 'object' ? payload : {};
            var mid = p.member_id != null ? p.member_id : p.memberId;
            if (mid == null || mid === '') {
                throw new Error('appendPastoralEvent requires member_id');
            }
            var now = nowIso();
            var rec = {
                event_id: p.event_id || ('pe_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)),
                schema_version: 1,
                member_id: String(mid),
                event_type: p.event_type || 'care_call',
                ts: p.ts || p.occurred_at || now,
                summary: p.summary || '',
                source_module: p.source_module || 'church_ministry',
                metadata: p.metadata && typeof p.metadata === 'object' ? p.metadata : {},
                created_at: now,
                updated_at: now
            };
            var list = getJson(PASTORAL_EVENTS_KEY);
            if (!Array.isArray(list)) list = [];
            list.push(rec);
            if (list.length > 5000) list = list.slice(list.length - 5000);
            setJson(PASTORAL_EVENTS_KEY, list);
            var cm = getJson(CM_KEY) || {};
            if (!Array.isArray(cm.pastoral_events)) cm.pastoral_events = [];
            cm.pastoral_events.push(rec);
            if (cm.pastoral_events.length > 500) cm.pastoral_events = cm.pastoral_events.slice(cm.pastoral_events.length - 500);
            cm.pastoralEventsSyncedAt = now;
            setJson(CM_KEY, cm);
            this.logActivity('pastoral_event_appended', { event_id: rec.event_id, member_id: rec.member_id, event_type: rec.event_type }, 'crm');
            if (useSheetsSsot() && global.ChurchSheetsSsot && global.ChurchSheetsSsot.appendPastoralEvent) {
                global.ChurchSheetsSsot.appendPastoralEvent(rec).catch(function (e) {
                    console.warn('[ChurchDataBridge] Sheets appendPastoralEvent', e);
                });
            }
            return rec;
        },

        listPastoralEvents: function (memberId, limit) {
            var list = getJson(PASTORAL_EVENTS_KEY);
            if (!Array.isArray(list)) list = [];
            var id = memberId == null || memberId === '' ? null : String(memberId);
            var out = id
                ? list.filter(function (e) { return String(e.member_id || '') === id; })
                : list.slice();
            out.sort(function (a, b) {
                return String(b.ts || b.created_at || '').localeCompare(String(a.ts || a.created_at || ''));
            });
            var n = Number(limit || 0);
            if (n > 0) out = out.slice(0, n);
            return out;
        },

        getPastoralFollowupData: function () {
            var raw = getJson(PASTORAL_FOLLOWUP_KEY);
            if (!raw || typeof raw !== 'object') {
                return { tasks: [], updated_at: null };
            }
            if (!Array.isArray(raw.tasks)) raw.tasks = [];
            return JSON.parse(JSON.stringify(raw));
        },

        savePastoralFollowupData: function (data, opts) {
            opts = opts || {};
            var copy = JSON.parse(JSON.stringify(data || {}));
            if (!Array.isArray(copy.tasks)) copy.tasks = [];
            copy.updated_at = nowIso();
            setJson(PASTORAL_FOLLOWUP_KEY, copy);
            if (!opts.skipCmMirror) {
                var cm = getJson(CM_KEY) || {};
                if (!cm.pastoral) cm.pastoral = {};
                cm.pastoral.followups = { task_count: copy.tasks.length, updated_at: copy.updated_at };
                setJson(CM_KEY, cm);
            }
            return copy;
        },

        listPastoralFollowups: function (filters) {
            filters = filters || {};
            var store = this.getPastoralFollowupData();
            var list = (store.tasks || []).slice();
            if (filters.memberId != null && filters.memberId !== '') {
                var mid = String(filters.memberId);
                list = list.filter(function (t) {
                    return String(t.member_id != null ? t.member_id : t.memberId) === mid;
                });
            }
            if (filters.status) {
                var st = String(filters.status).toLowerCase();
                list = list.filter(function (t) {
                    return String(t.status || '').toLowerCase() === st;
                });
            }
            if (filters.priority) {
                var pr = String(filters.priority).toLowerCase();
                list = list.filter(function (t) {
                    return String(t.priority || '').toLowerCase() === pr;
                });
            }
            var todayStr = new Date().toISOString().slice(0, 10);
            if (filters.dueToday) {
                list = list.filter(function (t) {
                    return String(t.due_date || '').slice(0, 10) === todayStr;
                });
            }
            if (filters.fromDate) {
                var from = String(filters.fromDate).slice(0, 10);
                list = list.filter(function (t) {
                    return String(t.due_date || '') >= from;
                });
            }
            if (filters.toDate) {
                var to = String(filters.toDate).slice(0, 10);
                list = list.filter(function (t) {
                    return String(t.due_date || '') <= to;
                });
            }
            if (filters.excludeArchived) {
                list = list.filter(function (t) {
                    return String(t.status || '').toLowerCase() !== 'archived';
                });
            }
            list.sort(function (a, b) {
                return String(a.due_date || '').localeCompare(String(b.due_date || ''));
            });
            var limit = Number(filters.limit || 0);
            if (limit > 0) list = list.slice(0, limit);
            return list.map(function (t) {
                return JSON.parse(JSON.stringify(t));
            });
        },

        getPastoralFollowupSummary: function (windowDays) {
            var days = Number(windowDays || 7);
            var today = new Date();
            var todayStr = today.toISOString().slice(0, 10);
            var end = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
            var endStr = end.toISOString().slice(0, 10);
            var list = this.listPastoralFollowups({ excludeArchived: true });
            var pendingStatuses = { draft: 1, pending: 1, contacted: 1 };
            var pending = list.filter(function (t) {
                var st = String(t.status || '').toLowerCase();
                return pendingStatuses[st];
            });
            var dueInWindow = pending.filter(function (t) {
                var d = String(t.due_date || '');
                return d >= todayStr && d <= endStr;
            });
            var dueToday = pending.filter(function (t) {
                return String(t.due_date || '').slice(0, 10) === todayStr;
            });
            var high = list.filter(function (t) {
                var pr = String(t.priority || '').toLowerCase();
                return pr === 'high' || pr === 'urgent';
            });
            var completed = list.filter(function (t) {
                return String(t.status || '').toLowerCase() === 'completed';
            });
            return {
                total: list.length,
                pending: pending.length,
                due_today: dueToday.length,
                due_in_window: dueInWindow.length,
                window_days: days,
                high_priority: high.length,
                completed: completed.length
            };
        },

        savePastoralFollowup: function (payload) {
            assertRbac('pastoral.write');
            var p = payload && typeof payload === 'object' ? payload : {};
            var store = this.getPastoralFollowupData();
            var now = nowIso();
            var isUpdate = p.id != null && p.id !== '';
            var memberId = p.member_id != null ? p.member_id : p.memberId;
            if (isUpdate) {
                var idxCheck = store.tasks.findIndex(function (t) { return String(t.id) === String(p.id); });
                if (idxCheck < 0) throw new Error('followup task not found: ' + p.id);
                if (memberId == null || memberId === '') {
                    memberId = store.tasks[idxCheck].member_id;
                }
            }
            if (memberId == null || memberId === '') {
                throw new Error('savePastoralFollowup requires member_id');
            }
            var members = this.getMembers() || [];
            var mid = String(memberId);
            var mem = members.find(function (m) {
                return String(m.memberId != null ? m.memberId : m.id) === mid;
            });
            var memberName = p.member_name || p.memberName || (mem ? (mem.name || mem.fullName) : mid);
            var task;
            if (isUpdate) {
                var idx = store.tasks.findIndex(function (t) { return String(t.id) === String(p.id); });
                if (idx < 0) throw new Error('followup task not found: ' + p.id);
                task = Object.assign({}, store.tasks[idx], {
                    member_id: mid,
                    member_name: memberName,
                    reason: p.reason != null ? p.reason : store.tasks[idx].reason,
                    priority: p.priority || store.tasks[idx].priority || 'normal',
                    due_date: p.due_date ? String(p.due_date).slice(0, 10) : store.tasks[idx].due_date,
                    assigned_to: p.assigned_to != null ? p.assigned_to : store.tasks[idx].assigned_to,
                    status: p.status || store.tasks[idx].status || 'pending',
                    note: p.note != null ? p.note : (store.tasks[idx].note || ''),
                    updated_at: now
                });
                store.tasks[idx] = task;
            } else {
                var nextId = 1;
                store.tasks.forEach(function (t) {
                    var n = Number(t.id);
                    if (isFinite(n) && n >= nextId) nextId = n + 1;
                });
                task = {
                    id: nextId,
                    member_id: mid,
                    member_name: memberName,
                    reason: p.reason || '跟進',
                    priority: p.priority || 'normal',
                    due_date: p.due_date ? String(p.due_date).slice(0, 10) : (function () {
                        var d = new Date();
                        d.setDate(d.getDate() + 3);
                        return d.toISOString().slice(0, 10);
                    })(),
                    assigned_to: p.assigned_to || '',
                    status: p.status || 'pending',
                    source: p.source || 'visitation_followup_tool',
                    note: p.note || '',
                    created_at: now,
                    updated_at: now
                };
                store.tasks.push(task);
            }
            this.savePastoralFollowupData(store);
            var snippet = this.buildPastoralFollowupSnippet(task);
            this.logActivity('save_pastoral_followup', { task_id: task.id, member_id: mid }, 'visitation_followup');
            return {
                ok: true,
                task: JSON.parse(JSON.stringify(task)),
                leader_outreach_snippet: snippet,
                pastoral_snippet: snippet
            };
        },

        buildPastoralFollowupSnippet: function (task) {
            var t = task && typeof task === 'object' ? task : {};
            var who = t.member_name || t.member_id || '會友';
            var when = t.due_date || '（日期待定）';
            var why = t.reason || '關懷跟進';
            var pr = t.priority || 'normal';
            /* pastoral_sensitive: 刻意不包含 t.note 全文 */
            return '【牧養關懷稿 · 請人工確認後轉發】' + who + '：' + why + '（優先 ' + pr + '，建議於 ' + when + ' 前關懷）。本訊息不會自動發送。';
        },

        promotePastoralAlertToFollowup: function (alertId, payload) {
            var p = payload && typeof payload === 'object' ? payload : {};
            var aid = alertId == null ? '' : String(alertId);
            if (!aid) {
                return { ok: false, stub: true, error: 'alert_id_required' };
            }
            var row = null;
            try {
                var alerts = this.evaluateNewcomerFollowUpAlerts() || [];
                row = alerts.find(function (a) { return String(a.alert_id) === aid; });
            } catch (e0) {}
            if (!row && global.ChurchDataBridge && typeof this.getSmartAlerts === 'function') {
                try {
                    var smart = this.getSmartAlerts() || [];
                    row = smart.find(function (a) {
                        return String(a.alert_id || a.id) === aid;
                    });
                } catch (e1) {}
            }
            if (!row && !p.member_id) {
                return {
                    ok: false,
                    stub: true,
                    error: 'alert_not_resolved',
                    message: '尚無法從 alert 自動解析會友，請在表單手動填 member_id 後儲存'
                };
            }
            var mid = p.member_id != null ? p.member_id : (row && row.member_id);
            var saved = this.savePastoralFollowup({
                member_id: mid,
                reason: p.reason || (row && row.recommendation) || ('alert:' + aid),
                priority: p.priority || (row && row.severity === 'high' ? 'high' : 'normal'),
                due_date: p.due_date,
                status: 'pending',
                source: 'pastoral_alert',
                note: p.note || ''
            });
            return {
                ok: true,
                promoted_from_alert: aid,
                stub: false,
                task: saved.task,
                leader_outreach_snippet: saved.leader_outreach_snippet
            };
        },

        getFinanceReconciliationData: function () {
            var raw = getJson(FINANCE_RECON_KEY);
            if (!raw || typeof raw !== 'object') {
                return { records: [], updated_at: null };
            }
            if (!Array.isArray(raw.records)) raw.records = [];
            return JSON.parse(JSON.stringify(raw));
        },

        saveFinanceReconciliationData: function (data, opts) {
            opts = opts || {};
            var copy = JSON.parse(JSON.stringify(data || {}));
            if (!Array.isArray(copy.records)) copy.records = [];
            copy.updated_at = nowIso();
            setJson(FINANCE_RECON_KEY, copy);
            if (!opts.skipCmMirror) {
                var cm = getJson(CM_KEY) || {};
                if (!cm.finance) cm.finance = {};
                cm.finance.reconciliation = { record_count: copy.records.length, updated_at: copy.updated_at };
                setJson(CM_KEY, cm);
            }
            return copy;
        },

        listFinanceReconciliationRecords: function (filters) {
            filters = filters || {};
            var store = this.getFinanceReconciliationData();
            var list = (store.records || []).slice();
            if (filters.memberId != null && filters.memberId !== '') {
                var mid = String(filters.memberId);
                list = list.filter(function (r) {
                    return String(r.member_id != null ? r.member_id : r.memberId) === mid;
                });
            }
            if (filters.status) {
                var st = String(filters.status).toLowerCase();
                list = list.filter(function (r) {
                    return String(r.status || '').toLowerCase() === st;
                });
            }
            if (filters.fund) {
                var fund = String(filters.fund);
                list = list.filter(function (r) {
                    return String(r.fund || '') === fund;
                });
            }
            if (filters.method) {
                var method = String(filters.method).toLowerCase();
                list = list.filter(function (r) {
                    return String(r.method || '').toLowerCase() === method;
                });
            }
            if (filters.fromDate) {
                var from = String(filters.fromDate).slice(0, 10);
                list = list.filter(function (r) {
                    return String(r.date || '') >= from;
                });
            }
            if (filters.toDate) {
                var to = String(filters.toDate).slice(0, 10);
                list = list.filter(function (r) {
                    return String(r.date || '') <= to;
                });
            }
            if (filters.excludeArchived) {
                list = list.filter(function (r) {
                    return String(r.status || '').toLowerCase() !== 'archived';
                });
            }
            list.sort(function (a, b) {
                return String(b.date || '').localeCompare(String(a.date || ''));
            });
            var limit = Number(filters.limit || 0);
            if (limit > 0) list = list.slice(0, limit);
            return list.map(function (r) {
                return JSON.parse(JSON.stringify(r));
            });
        },

        getFinanceReconciliationSummary: function (windowDays) {
            var days = Number(windowDays || 30);
            var today = new Date();
            var start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
            var startStr = start.toISOString().slice(0, 10);
            var list = this.listFinanceReconciliationRecords({ excludeArchived: true });
            var inWindow = list.filter(function (r) {
                return String(r.date || '') >= startStr;
            });
            var totalAmount = 0;
            var pending = 0;
            var exception = 0;
            var receiptPending = 0;
            inWindow.forEach(function (r) {
                var amt = Number(r.amount);
                if (isFinite(amt)) totalAmount += amt;
                var st = String(r.status || '').toLowerCase();
                if (st === 'pending' || st === 'draft') pending += 1;
                if (st === 'exception') exception += 1;
                var rs = String(r.receipt_status || '').toLowerCase();
                if (rs === 'pending') receiptPending += 1;
            });
            return {
                window_days: days,
                total_records: inWindow.length,
                total_amount: Math.round(totalAmount * 100) / 100,
                pending: pending,
                exception: exception,
                receipt_pending: receiptPending,
                reconciled: inWindow.filter(function (r) {
                    return String(r.status || '').toLowerCase() === 'reconciled';
                }).length
            };
        },

        saveFinanceReconciliationRecord: function (payload) {
            assertRbac('finance.write');
            var p = payload && typeof payload === 'object' ? payload : {};
            var store = this.getFinanceReconciliationData();
            var now = nowIso();
            var isUpdate = p.id != null && p.id !== '';
            var memberId = p.member_id != null ? p.member_id : p.memberId;
            if (isUpdate) {
                var idxCheck = store.records.findIndex(function (r) { return String(r.id) === String(p.id); });
                if (idxCheck < 0) throw new Error('finance record not found: ' + p.id);
                if (memberId == null || memberId === '') {
                    memberId = store.records[idxCheck].member_id;
                }
            }
            if (memberId == null || memberId === '') {
                throw new Error('saveFinanceReconciliationRecord requires member_id');
            }
            var members = this.getMembers() || [];
            var mid = String(memberId);
            var mem = members.find(function (m) {
                return String(m.memberId != null ? m.memberId : m.id) === mid;
            });
            var memberName = p.member_name || p.memberName || (mem ? (mem.name || mem.fullName) : mid);
            var record;
            if (isUpdate) {
                var idx = store.records.findIndex(function (r) { return String(r.id) === String(p.id); });
                record = Object.assign({}, store.records[idx], {
                    member_id: mid,
                    member_name: memberName,
                    date: p.date ? String(p.date).slice(0, 10) : store.records[idx].date,
                    amount: p.amount != null ? Number(p.amount) : store.records[idx].amount,
                    currency: p.currency || store.records[idx].currency || 'TWD',
                    fund: p.fund != null ? p.fund : store.records[idx].fund,
                    method: p.method || store.records[idx].method || 'cash',
                    status: p.status || store.records[idx].status || 'pending',
                    receipt_status: p.receipt_status != null ? p.receipt_status : store.records[idx].receipt_status,
                    note: p.note != null ? p.note : (store.records[idx].note || ''),
                    updated_at: now
                });
                store.records[idx] = record;
            } else {
                var nextId = 1;
                store.records.forEach(function (r) {
                    var n = Number(r.id);
                    if (isFinite(n) && n >= nextId) nextId = n + 1;
                });
                record = {
                    id: nextId,
                    member_id: mid,
                    member_name: memberName,
                    date: p.date ? String(p.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
                    amount: Number(p.amount != null ? p.amount : 0),
                    currency: p.currency || 'TWD',
                    fund: p.fund || '一般奉獻',
                    method: p.method || 'cash',
                    status: p.status || 'pending',
                    receipt_status: p.receipt_status || 'pending',
                    note: p.note || '',
                    source: p.source || 'finance_reconciliation_tool',
                    created_at: now,
                    updated_at: now
                };
                store.records.push(record);
            }
            this.saveFinanceReconciliationData(store);
            var snippet = this.buildFinanceReceiptSnippet(record);
            this.logActivity('save_finance_reconciliation', { record_id: record.id, member_id: mid, amount: record.amount }, 'finance_reconciliation');
            return {
                ok: true,
                record: JSON.parse(JSON.stringify(record)),
                receipt_snippet: snippet,
                finance_followup_snippet: snippet
            };
        },

        buildFinanceReceiptSnippet: function (record) {
            var r = record && typeof record === 'object' ? record : {};
            var who = r.member_name || r.member_id || '會友';
            var when = r.date || '（日期待定）';
            var amt = r.amount != null ? r.amount : '—';
            var cur = r.currency || 'TWD';
            var fund = r.fund || '奉獻';
            var method = r.method || '—';
            /* finance_sensitive: 刻意不包含 r.note 全文 */
            return '【奉獻收據／跟進稿 · 請人工確認後處理】' + who + ' · ' + fund + ' ' + amt + ' ' + cur +
                '（' + when + ' · ' + method + '）。本訊息不會自動發送收據、不處理線上付款。';
        },

        markFinanceRecordReconciled: function (recordId, payload) {
            var p = payload && typeof payload === 'object' ? payload : {};
            return this.saveFinanceReconciliationRecord({
                id: recordId,
                status: 'reconciled',
                receipt_status: p.receipt_status || 'copied',
                note: p.note
            });
        },

        evaluateNewcomerFollowUpAlerts: function (opts) {
            opts = opts || {};
            var slaDays = (global.ChurchCrmConstants && global.ChurchCrmConstants.NEWCOMER_SLA_DAYS) || 3;
            var now = new Date();
            var start = new Date(now.getTime() - slaDays * 24 * 60 * 60 * 1000);
            var members = this.getMembers() || [];
            var alerts = [];
            members.forEach(function (m) {
                var mid = m.memberId != null ? m.memberId : m.id;
                if (mid == null) return;
                var id = String(mid);
                var firstRaw = m.first_visit_date || m.firstVisitDate || m.membershipDate;
                var firstDt = parseDateSafe(firstRaw);
                if (!firstDt || firstDt < start || firstDt > now) return;
                var events = this.listPastoralEvents(id, 50) || [];
                var hasFollowup = events.some(function (e) {
                    return e.event_type === 'newcomer_followup' || e.event_type === 'visitation';
                });
                if (hasFollowup) return;
                var vis = this.getVisitationData();
                var missions = (vis && vis.missions) ? vis.missions : [];
                var inVis = missions.some(function (mission) {
                    if (mission && String(mission.type || '').toLowerCase() === 'newcomer') {
                        var target = String(mission.target || mission.name || '');
                        var nm = m.fullName || m.name || '';
                        if (nm && target.indexOf(nm) >= 0) return true;
                    }
                    var team = (mission.team || '').split(/[,，、]/).map(function (s) { return s.trim(); });
                    return team.indexOf(id) >= 0;
                });
                if (inVis) return;
                alerts.push({
                    alert_id: 'NEWCOMER-' + id,
                    rule_id: 'N1_newcomer_sla_' + slaDays + 'd',
                    member_id: id,
                    severity: 'medium',
                    status: 'open',
                    recommendation: '建議 ' + slaDays + ' 日內完成新人跟進（探訪或記錄 newcomer_followup）',
                    evidence: { first_visit_date: firstRaw, sla_days: slaDays },
                    created_at: nowIso(),
                    updated_at: nowIso()
                });
            }, this);
            return alerts;
        },

        /**
         * CRM 成熟度（0–100）供儀表板與盤點；非神學評分，僅資料／流程就緒度
         */
        getCrmMaturitySummary: function () {
            var members = this.getMembers() || [];
            var hasMembers = members.length > 0;
            var withStage = members.filter(function (m) {
                return m && (m.spiritual_journey_stage || m.spiritual_stage != null);
            }).length;
            var pastoral = this.listPastoralEvents(null, 1) || [];
            var assignments = 0;
            var canon = global.SmartMinistryCanonical;
            if (canon && canon.listMinistryAssignments) {
                assignments = (canon.listMinistryAssignments() || []).length;
            }
            var vol = getJson(VOL_KEY) || {};
            var volPositions = Array.isArray(vol.ministries) ? vol.ministries.length : 0;
            var catalog = canon && canon.listMinistriesCatalog ? (canon.listMinistriesCatalog() || []).length : 0;
            var checks = [
                { id: 'member_master', label: '會友主檔有資料', weight: 15, ok: hasMembers },
                { id: 'spiritual_stage', label: '會友具屬靈階段欄位', weight: 10, ok: hasMembers && withStage >= Math.min(5, members.length) },
                { id: 'pastoral_events', label: '牧養事件流已啟用', weight: 15, ok: pastoral.length > 0 || (this.listPastoralEvents && true) },
                { id: 'visitation', label: '探訪資料可讀', weight: 15, ok: !!(this.getVisitationData && this.getVisitationData()) },
                { id: 'volunteer_positions', label: '志工崗位（招募供給）', weight: 15, ok: volPositions > 0 },
                { id: 'ministry_catalog', label: '配對事工目錄已同步', weight: 10, ok: catalog > 0 },
                { id: 'assignments', label: '事奉配對紀錄', weight: 10, ok: assignments > 0 },
                { id: 'timeline_360', label: '360 時間軸 API', weight: 10, ok: typeof this.getMember360Timeline === 'function' && typeof this.listMinistryAssignmentsByMemberId === 'function' }
            ];
            var earned = 0;
            var total = 0;
            checks.forEach(function (c) {
                total += c.weight;
                if (c.ok) earned += c.weight;
            });
            var percent = total > 0 ? Math.round((earned / total) * 100) : 0;
            return {
                schema_version: 1,
                generated_at: nowIso(),
                percent: percent,
                phase: percent < 40 ? 'inventory' : (percent < 70 ? 'standardize' : (percent < 90 ? 'automate' : 'collaborate')),
                checks: checks,
                stats: {
                    members: members.length,
                    with_spiritual_stage: withStage,
                    pastoral_events: (getJson(PASTORAL_EVENTS_KEY) || []).length,
                    volunteer_positions: volPositions,
                    ministry_catalog: catalog,
                    ministry_assignments: assignments
                }
            };
        },

        buildVisitationDeskUrl: function (memberId) {
            var id = memberId == null ? '' : String(memberId);
            return 'modules/support/visitation_index.html' + (id ? '?memberId=' + encodeURIComponent(id) : '');
        },

        exportMemberSystemBundle: function () {
            var ms = this.getMemberSystemData ? this.getMemberSystemData() : { members: [] };
            return {
                schema_version: 1,
                export_kind: 'memberSystemData',
                exported_at: nowIso(),
                data: ms,
                meta: {
                    member_count: Array.isArray(ms.members) ? ms.members.length : 0,
                    spec: 'church_ministry/docs/MEMBER_DATA_MODEL.md'
                }
            };
        },

        importMemberSystemBundle: function (bundle, opts) {
            opts = opts || {};
            if (!bundle || typeof bundle !== 'object') {
                throw new Error('importMemberSystemBundle: invalid bundle');
            }
            var payload = bundle.data && typeof bundle.data === 'object' ? bundle.data : bundle;
            if (!Array.isArray(payload.members)) {
                throw new Error('importMemberSystemBundle: missing members[]');
            }
            if (!opts.merge) {
                this.saveMemberSystemData(payload);
            } else {
                var cur = this.getMemberSystemData() || { members: [] };
                var byId = {};
                (cur.members || []).forEach(function (m) {
                    if (m && m.id != null) byId[String(m.id)] = m;
                });
                payload.members.forEach(function (m) {
                    if (m && m.id != null) byId[String(m.id)] = m;
                });
                cur.members = Object.keys(byId).map(function (k) { return byId[k]; });
                ['groupMemberships', 'ministryAssignments', 'trainings', 'attendance', 'groups'].forEach(function (k) {
                    if (Array.isArray(payload[k])) cur[k] = payload[k];
                });
                this.saveMemberSystemData(cur);
            }
            this.logActivity('member_system_imported', { count: payload.members.length, merge: !!opts.merge }, 'crm');
            return { success: true, member_count: payload.members.length };
        },

        getSpiritualStageFunnel: function () {
            var members = this.getMembers() || [];
            var norm = global.ChurchCrmConstants && ChurchCrmConstants.normalizeSpiritualStage
                ? function (s) { return ChurchCrmConstants.normalizeSpiritualStage(s); }
                : function (s) { return s || 'growing'; };
            var stages = (global.ChurchCrmConstants && ChurchCrmConstants.SPIRITUAL_JOURNEY_STAGES) || [
                { id: 'seeker', label_zh: '慕道' },
                { id: 'new_believer', label_zh: '初信' },
                { id: 'growing', label_zh: '成長' },
                { id: 'serving', label_zh: '服事' },
                { id: 'leader', label_zh: '領袖' }
            ];
            var counts = {};
            stages.forEach(function (s) { counts[s.id] = 0; });
            members.forEach(function (m) {
                var sid = norm(m.spiritual_journey_stage || m.spiritual_stage);
                if (counts[sid] == null) counts[sid] = 0;
                counts[sid] += 1;
            });
            return {
                generated_at: nowIso(),
                total: members.length,
                stages: stages.map(function (s) {
                    return { id: s.id, label_zh: s.label_zh || s.id, count: counts[s.id] || 0 };
                })
            };
        },

        suggestStagePromotion: function () {
            var self = this;
            var members = this.getMembers() || [];
            var ms = this.getMemberSystemData ? this.getMemberSystemData() : {};
            var trainings = ms.trainings || [];
            var groupMem = ms.groupMemberships || [];
            var norm = global.ChurchCrmConstants && ChurchCrmConstants.normalizeSpiritualStage
                ? function (s) { return ChurchCrmConstants.normalizeSpiritualStage(s); }
                : function (s) { return s || 'growing'; };
            var label = global.ChurchCrmConstants && ChurchCrmConstants.stageLabel
                ? function (id) { return ChurchCrmConstants.stageLabel(id, 'zh'); }
                : function (id) { return id; };
            var out = [];
            members.forEach(function (m) {
                var mid = m.memberId != null ? m.memberId : m.id;
                if (mid == null) return;
                var id = String(mid);
                var stage = norm(m.spiritual_journey_stage || m.spiritual_stage);
                var next = null;
                var reason = '';
                if (stage === 'seeker' && m.baptized) {
                    next = 'new_believer';
                    reason = '已受浸，可進入初信關顧';
                } else if (stage === 'new_believer') {
                    var inGroup = groupMem.some(function (g) { return String(g.memberId) === id; });
                    var trained = trainings.some(function (t) {
                        return String(t.memberId) === id && (t.status === 'completed' || t.status === 'in_progress');
                    });
                    if (inGroup || trained || (m.membershipDate && parseDateSafe(m.membershipDate))) {
                        next = 'growing';
                        reason = inGroup ? '已連結小組' : (trained ? '已有培訓記錄' : '入會滿一段時間');
                    }
                } else if (stage === 'growing') {
                    var assigns = self.listMinistryAssignmentsByMemberId(id) || [];
                    var active = assigns.some(function (a) {
                        var st = String(a.status || '').toLowerCase();
                        return st === 'confirmed' || st === 'active' || st === 'invited';
                    });
                    if (active) {
                        next = 'serving';
                        reason = '已有事奉配對／邀請紀錄';
                    }
                } else if (stage === 'serving') {
                    var leadTrain = trainings.some(function (t) {
                        return String(t.memberId) === id && /領袖|lead/i.test(String(t.courseName || t.name || ''));
                    });
                    if (leadTrain) {
                        next = 'leader';
                        reason = '已完成領袖相關培訓';
                    }
                }
                if (!next) return;
                out.push({
                    member_id: id,
                    name: m.fullName || m.name || id,
                    current_stage: stage,
                    current_label: label(stage),
                    suggested_stage: next,
                    suggested_label: label(next),
                    reason: reason
                });
            });
            return out;
        },

        listPendingMinistrySuggestions: function (ministryId) {
            var canon = global.SmartMinistryCanonical;
            if (!canon || !canon.listMinistryAssignments) return [];
            var mid = ministryId == null ? null : String(ministryId);
            return (canon.listMinistryAssignments() || []).filter(function (a) {
                if (mid && String(a.ministry_id) !== mid) return false;
                var st = String(a.status || '').toLowerCase();
                return st === 'proposed' || st === 'suggested';
            });
        },

        updateMinistryAssignmentStatus: function (assignmentId, status, opts) {
            opts = opts || {};
            var canon = global.SmartMinistryCanonical;
            if (!canon || typeof canon.updateMinistryAssignmentById !== 'function') {
                return { success: false, error: 'SmartMinistryCanonical.updateMinistryAssignmentById missing' };
            }
            return canon.updateMinistryAssignmentById(assignmentId, { status: status, note: opts.note || '' });
        },

        confirmMinistryAssignment: function (assignmentId, opts) {
            return this.updateMinistryAssignmentStatus(assignmentId, 'confirmed', opts);
        },

        promoteMinistryAssignmentToVolunteer: function (assignmentId) {
            var canon = global.SmartMinistryCanonical;
            if (!canon || !canon.listMinistryAssignments) return { success: false };
            var row = (canon.listMinistryAssignments() || []).find(function (a) {
                return String(a.id) === String(assignmentId);
            });
            if (!row) return { success: false, error: 'assignment_not_found' };
            var vol = this.getVolunteerData() || { positions: [], assignments: [] };
            if (!Array.isArray(vol.assignments)) vol.assignments = [];
            var positions = vol.positions || vol.ministries || [];
            var talentId = String(row.talent_id);
            var members = this.getMembers() || [];
            var mem = members.find(function (m) {
                return String(m.memberId != null ? m.memberId : m.id) === talentId;
            });
            var ministryKey = String(row.ministry_id || '');
            var pos = positions.find(function (p) {
                return String(p.id) === ministryKey || ('vol_' + String(p.id)) === ministryKey;
            });
            var ministryIdNum = pos ? pos.id : (isFinite(Number(ministryKey.replace('vol_', ''))) ? Number(ministryKey.replace('vol_', '')) : ministryKey);
            vol.assignments.push({
                id: vol.assignments.length ? Math.max.apply(null, vol.assignments.map(function (x) { return x.id || 0; })) + 1 : 1,
                memberId: isFinite(Number(talentId)) ? Number(talentId) : talentId,
                memberName: mem ? (mem.name || mem.fullName) : talentId,
                ministryId: ministryIdNum,
                ministryName: row.ministry_name || (pos && pos.name) || row.ministry_id,
                status: 'active',
                source: 'crm_confirmed_match',
                assignedAt: nowIso()
            });
            this.saveVolunteerSystemData(vol);
            this.updateMinistryAssignmentStatus(assignmentId, 'active', { note: 'synced_to_volunteer' });
            return { success: true };
        },

        syncPlanningAssessmentFromCtaReport: function (report, opts) {
            opts = opts || {};
            if (!report || typeof report !== 'object') return { synced: false, reason: 'no_report' };
            var canon = global.SmartMinistryCanonical;
            if (!canon || !canon.attachAssessmentToTalent) return { synced: false, reason: 'no_canon' };
            var toolId = report.toolId || 'cta_tool';
            var memberId = opts.memberId != null ? String(opts.memberId) : (opts.talentId != null ? String(opts.talentId) : '');
            if (!memberId && report.subjectName) {
                var sub = String(report.subjectName).split('·')[0].trim();
                if (canon.listTalents) {
                    (canon.listTalents() || []).forEach(function (t) {
                        if (memberId) return;
                        var nm = t.name || t.full_name || '';
                        if (nm && sub.indexOf(nm) >= 0) memberId = String(t.talent_id || t.member_id || t.id || '');
                    });
                }
            }
            if (!memberId) {
                var members = this.getMembers() || [];
                if (members.length === 1) {
                    memberId = String(members[0].memberId != null ? members[0].memberId : members[0].id);
                }
            }
            if (!memberId) return { synced: false, reason: 'no_member_id' };
            var rec = canon.attachAssessmentToTalent(memberId, toolId, {
                instrument_version: 'cta-os-v1',
                vector: report.vector || {},
                source_note: report.sourceNote || ''
            }, {
                scores: report.vector || {},
                ai_summary: (report.plainText || '').slice(0, 2000),
                strengths: report.strengths || '',
                growth: report.growth || ''
            });
            this.logActivity('cta_assessment_synced', { member_id: memberId, tool_id: toolId }, 'planning');
            return { synced: true, talent_id: memberId, assessment_id: rec && rec.id };
        },

        getCtaPlanningActionItems: function () {
            var items = [];
            try {
                var regRaw = localStorage.getItem('cta-os-registry-v1');
                if (regRaw) {
                    var reg = JSON.parse(regRaw);
                    var tools = reg.tools || {};
                    Object.keys(tools).forEach(function (tid) {
                        var snap = tools[tid];
                        var rep = snap && snap.report;
                        if (!rep) return;
                        (rep.risks || []).forEach(function (risk, i) {
                            items.push({
                                id: 'CTA-' + tid + '-' + i,
                                category: 'planning',
                                title: (rep.toolName || tid) + '：' + risk,
                                href: '../church_planning/cta-os-war-room.html',
                                severity: 'medium'
                            });
                        });
                    });
                }
            } catch (e) {}
            return items.slice(0, 12);
        },

        /**
         * 同步／本機健康摘要（總站 ⚡ 抽屜、CRM 儀表板可讀）。
         * 不依賴 A3 財務；finance 區塊 optional，0 筆為正常。
         */
        getSyncHealthSummary: function (opts) {
            opts = opts && typeof opts === 'object' ? opts : {};
            var cfg = global.CHURCH_CLOUD_CONFIG || {};
            var phase1 = null;
            try {
                if (global.ChurchDataBridgePhase1 && typeof global.ChurchDataBridgePhase1.getInstance === 'function') {
                    var p1cfg = global.Bible100Backend && global.Bible100Backend.getConfig
                        ? global.Bible100Backend.getConfig()
                        : {};
                    phase1 = global.ChurchDataBridgePhase1.getInstance(p1cfg);
                }
            } catch (eP1) {}
            var queueAll = phase1 && phase1._readQueue ? phase1._readQueue() : [];
            var qPending = 0;
            var qManual = 0;
            queueAll.forEach(function (q) {
                if (!q) return;
                if (q.manual_intervention) qManual += 1;
                else qPending += 1;
            });
            var events = phase1 && phase1.getRecentObserverEvents
                ? phase1.getRecentObserverEvents(1)
                : [];
            var shiftSum = typeof this.getVolunteerShiftSummary === 'function'
                ? this.getVolunteerShiftSummary(90)
                : { total: 0 };
            var followSum = typeof this.getPastoralFollowupSummary === 'function'
                ? this.getPastoralFollowupSummary(90)
                : { total: 0, pending: 0 };
            var finSum = typeof this.getFinanceReconciliationSummary === 'function'
                ? this.getFinanceReconciliationSummary(90)
                : { total_records: 0, pending: 0 };
            var status = 'ok';
            if (qPending > 0 && (cfg.USE_API || cfg.SUPABASE_URL)) status = 'queue_pending';
            else if (qPending > 0) status = 'local_queue';
            if (qManual > 0 && status === 'ok') status = 'manual_review';
            return {
                ok: true,
                generated_at: nowIso(),
                storage_mode: cfg.USE_API ? 'cloud_capable' : 'local_first',
                phase1_active: !!phase1,
                cloud_configured: !!(cfg.USE_API || cfg.SUPABASE_URL || cfg.supabaseUrl),
                queue: {
                    total: queueAll.length,
                    pending: qPending,
                    manual: qManual
                },
                last_event_at: events[0] && events[0].at ? events[0].at : null,
                crm_tools: [
                    {
                        tool_id: 'volunteer_shift',
                        wave: 'A1',
                        label: '義工排班',
                        optional: false,
                        count: shiftSum.total != null ? shiftSum.total : 0,
                        pending: shiftSum.pending_confirm != null ? shiftSum.pending_confirm : 0,
                        href: 'church_ministry/tools/volunteer_shift/index.html'
                    },
                    {
                        tool_id: 'visitation_followup',
                        wave: 'A2',
                        label: '探訪跟進',
                        optional: false,
                        count: followSum.total != null ? followSum.total : 0,
                        pending: followSum.pending != null ? followSum.pending : 0,
                        href: 'church_ministry/tools/visitation_followup/index.html'
                    },
                    {
                        tool_id: 'finance_reconciliation',
                        wave: 'A3',
                        label: '財務對帳',
                        optional: true,
                        count: finSum.total_records != null ? finSum.total_records : 0,
                        pending: finSum.pending != null ? finSum.pending : 0,
                        href: 'church_ministry/tools/finance_reconciliation/index.html',
                        note_zh: '許多教會不在 CRM 記帳；0 筆屬正常，不影響其他模組。'
                    }
                ],
                status: status,
                message_zh: '本機優先。雲端佇列需 Supabase／USE_API。A3 財務為可選，不影響 A1／A2 與會友 CRM。'
            };
        },

        getCrmWorkbenchTodos: function () {
            var self = this;
            var members = this.getMembers() || [];
            var memberById = {};
            members.forEach(function (m) {
                var mid = m.memberId != null ? m.memberId : m.id;
                if (mid != null) memberById[String(mid)] = m;
            });
            var newcomers = (this.evaluateNewcomerFollowUpAlerts() || []).map(function (a) {
                var mm = memberById[String(a.member_id)] || {};
                return {
                    id: a.alert_id || ('NEW-' + a.member_id),
                    category: 'newcomer',
                    member_id: a.member_id,
                    name: mm.fullName || mm.name || ('會友 ' + a.member_id),
                    title: a.recommendation || '新人跟進',
                    href: self.buildVisitationDeskUrl(a.member_id),
                    severity: a.severity || 'medium'
                };
            });
            var care = [];
            if (typeof this.getSmartAlerts === 'function') {
                care = (this.getSmartAlerts() || []).filter(function (a) {
                    return !a.status || a.status === 'open';
                }).map(function (a) {
                    var mm = memberById[String(a.member_id)] || {};
                    return {
                        id: a.alert_id || ('CARE-' + a.member_id),
                        category: 'care_risk',
                        member_id: a.member_id,
                        name: mm.fullName || mm.name || ('會友 ' + a.member_id),
                        title: a.recommendation || a.rule_id || '關懷提醒',
                        href: 'modules/members/member-360-timeline.html?memberId=' + encodeURIComponent(a.member_id),
                        severity: a.severity || 'low'
                    };
                });
            }
            var promotion = (this.suggestStagePromotion() || []).map(function (p) {
                return {
                    id: 'PROMO-' + p.member_id,
                    category: 'stage_promotion',
                    member_id: p.member_id,
                    name: p.name,
                    title: p.current_label + ' → ' + p.suggested_label + '（' + p.reason + '）',
                    href: 'modules/members/member-integrated.html',
                    severity: 'low'
                };
            });
            var planning = this.getCtaPlanningActionItems();
            return {
                generated_at: nowIso(),
                newcomer: newcomers,
                care_risk: care,
                stage_promotion: promotion,
                planning: planning,
                totals: {
                    newcomer: newcomers.length,
                    care_risk: care.length,
                    stage_promotion: promotion.length,
                    planning: planning.length
                }
            };
        },

        /**
         * 小組語音回報正式資料模型（v1）
         * @param {{
         *  church_id?: string,
         *  groupId?: string|number,
         *  reporterMemberId?: string|number,
         *  reportDate?: string,
         *  channel?: string,
         *  rawInput?: { text?: string, audioUrl?: string },
         *  structured?: object,
         *  ai?: { model?: string, summary?: string, confidence?: number },
         *  humanReview?: { confirmed?: boolean, confirmedBy?: string, confirmedAt?: string }
         * }} payload
         */
        submitSmallGroupVoiceReport: function (payload) {
            var p = payload && typeof payload === 'object' ? payload : {};
            var churchId = p.church_id || (global.CURRENT_CHURCH_ID || 'default');
            var now = new Date().toISOString();
            var rec = {
                report_id: p.report_id || ('sgr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)),
                schema_version: 1,
                church_id: churchId,
                group_id: p.groupId != null ? String(p.groupId) : '',
                reporter_member_id: p.reporterMemberId != null ? String(p.reporterMemberId) : '',
                report_date: p.reportDate || now.slice(0, 10),
                channel: p.channel || 'voice',
                raw_input: p.rawInput || { text: '' },
                structured: p.structured || {},
                ai: {
                    model: p.ai && p.ai.model ? p.ai.model : 'rule-based-v1',
                    summary: p.ai && p.ai.summary ? p.ai.summary : '',
                    confidence: p.ai && typeof p.ai.confidence === 'number' ? p.ai.confidence : null
                },
                human_review: {
                    confirmed: !!(p.humanReview && p.humanReview.confirmed),
                    confirmed_by: p.humanReview && p.humanReview.confirmedBy ? String(p.humanReview.confirmedBy) : '',
                    confirmed_at: (p.humanReview && p.humanReview.confirmedAt) || (p.humanReview && p.humanReview.confirmed ? now : null)
                },
                created_at: now,
                updated_at: now
            };
            var key = 'small_group_voice_reports_v1';
            var list = getJson(key);
            if (!Array.isArray(list)) list = [];
            list.push(rec);
            if (list.length > 2000) list = list.slice(list.length - 2000);
            setJson(key, list);
            this.logActivity('small_group_voice_report_submitted', { report_id: rec.report_id, group_id: rec.group_id }, 'fellowship');
            return rec;
        },

        listSmallGroupVoiceReports: function (limit, churchId) {
            var list = getJson('small_group_voice_reports_v1');
            if (!Array.isArray(list)) return [];
            var cid = churchId || global.CURRENT_CHURCH_ID || 'default';
            var out = list.filter(function (x) {
                return !x || !x.church_id ? true : String(x.church_id) === String(cid);
            });
            var n = Number(limit || 0);
            if (!n || n <= 0) return out.slice();
            return out.slice(Math.max(0, out.length - n));
        },

        /**
         * 恩賜測評版本化快照（v1）
         */
        createGiftAssessmentSnapshot: function (input) {
            var p = input && typeof input === 'object' ? input : {};
            var now = new Date().toISOString();
            var rec = {
                snapshot_id: p.snapshot_id || ('gas_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)),
                schema_version: 1,
                church_id: p.church_id || (global.CURRENT_CHURCH_ID || 'default'),
                member_id: p.member_id != null ? String(p.member_id) : '',
                instrument_key: p.instrument_key || 'gift_assessment',
                instrument_version: p.instrument_version || 'v1',
                scoring_version: p.scoring_version || 'v1',
                submitted_at: p.submitted_at || now,
                raw_answers: p.raw_answers || {},
                normalized_scores: p.normalized_scores || {},
                ai_summary: p.ai_summary || '',
                ai_model: p.ai_model || '',
                created_at: now,
                updated_at: now
            };
            var key = 'gift_assessment_snapshots_v1';
            var list = getJson(key);
            if (!Array.isArray(list)) list = [];
            list.push(rec);
            if (list.length > 5000) list = list.slice(list.length - 5000);
            setJson(key, list);
            this.logActivity('gift_assessment_snapshot_created', { snapshot_id: rec.snapshot_id, member_id: rec.member_id }, 'smart_ministry');
            return rec;
        },

        listGiftAssessmentSnapshots: function (opts) {
            opts = opts || {};
            var list = getJson('gift_assessment_snapshots_v1');
            if (!Array.isArray(list)) return [];
            var cid = opts.church_id || global.CURRENT_CHURCH_ID || 'default';
            var mid = opts.member_id != null ? String(opts.member_id) : '';
            var iv = opts.instrument_version ? String(opts.instrument_version) : '';
            var out = list.filter(function (x) {
                if (!x) return false;
                if (x.church_id && String(x.church_id) !== String(cid)) return false;
                if (mid && String(x.member_id || '') !== mid) return false;
                if (iv && String(x.instrument_version || '') !== iv) return false;
                return true;
            });
            if (opts.latest_per_member) {
                var map = {};
                out.forEach(function (x) {
                    var k = String(x.member_id || '');
                    if (!k) return;
                    var prev = map[k];
                    if (!prev || String(prev.submitted_at || prev.created_at || '') < String(x.submitted_at || x.created_at || '')) {
                        map[k] = x;
                    }
                });
                out = Object.keys(map).map(function (k) { return map[k]; });
            }
            var n = Number(opts.limit || 0);
            if (!n || n <= 0) return out.slice();
            return out.slice(Math.max(0, out.length - n));
        },

        /**
         * 會眾 360 Timeline（彙整問卷/恩賜/服事/小組回報/關懷事件）
         */
        getMember360Timeline: function (memberId, limit) {
            var id = String(memberId == null ? '' : memberId);
            var events = [];
            var m = this.getMemberById(id);
            if (m) {
                events.push({
                    event_id: 'member_profile_' + id,
                    event_type: 'profile',
                    ts: m.updatedAt || m.createdAt || nowIso(),
                    member_id: id,
                    source: 'memberSystemData',
                    summary: '會友檔案'
                });
            }
            var asm = this.listGiftAssessmentSnapshots({ member_id: id }) || [];
            asm.forEach(function (a) {
                events.push({
                    event_id: String(a.snapshot_id || uid('timeline')),
                    event_type: 'gift_assessment',
                    ts: a.submitted_at || a.created_at || nowIso(),
                    member_id: id,
                    source: 'gift_assessment_snapshots_v1',
                    summary: (a.instrument_key || 'assessment') + ' ' + (a.instrument_version || '')
                });
            });
            var sg = this.listSmallGroupVoiceReports(0) || [];
            sg.forEach(function (r) {
                if (String(r.reporter_member_id || '') !== id) return;
                events.push({
                    event_id: String(r.report_id || uid('timeline')),
                    event_type: 'small_group_report',
                    ts: r.report_date || r.created_at || nowIso(),
                    member_id: id,
                    source: 'small_group_voice_reports_v1',
                    summary: (r.structured && r.structured.highlights && r.structured.highlights[0]) || '小組回報'
                });
            });
            var vis = this.getVisitationData();
            (vis && vis.missions ? vis.missions : []).forEach(function (mission) {
                var team = (mission.team || '').split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean);
                if (team.indexOf(id) < 0) return;
                events.push({
                    event_id: String(mission.id || uid('timeline')),
                    event_type: 'care_mission',
                    ts: mission.date || mission.createdAt || nowIso(),
                    member_id: id,
                    source: 'visitationData',
                    summary: mission.name || mission.target || '關懷任務'
                });
            });
            var assign = this.listMinistryAssignmentsByMemberId ? this.listMinistryAssignmentsByMemberId(id) : [];
            (assign || []).forEach(function (a) {
                events.push({
                    event_id: String(a.id || uid('timeline')),
                    event_type: 'ministry_assignment',
                    ts: a.updated_at || a.created_at || nowIso(),
                    member_id: id,
                    source: 'smart_ministry_main',
                    summary: (a.ministry_name || a.ministry_id || '事奉配對') + (a.status ? ' · ' + a.status : '')
                });
            });
            (this.listPastoralEvents(id, 80) || []).forEach(function (e) {
                events.push({
                    event_id: String(e.event_id || uid('timeline')),
                    event_type: e.event_type || 'pastoral_event',
                    ts: e.ts || e.created_at || nowIso(),
                    member_id: id,
                    source: e.source_module || 'pastoral_events_v1',
                    summary: e.summary || e.event_type || '牧養事件'
                });
            });
            var att = this.getAttendanceData ? (this.getAttendanceData() || []) : [];
            att.forEach(function (a) {
                var amid = a && (a.memberId != null ? a.memberId : a.member_id);
                if (String(amid == null ? '' : amid) !== id) return;
                events.push({
                    event_id: 'att_' + String(a.id || uid('timeline')),
                    event_type: a.present === false ? 'absence' : 'attendance',
                    ts: a.date || a.createdAt || nowIso(),
                    member_id: id,
                    source: 'memberSystemData.attendance',
                    summary: (a.present === false ? '缺席' : '出席') + (a.context ? ' · ' + a.context : '')
                });
            });
            events.sort(function (a, b) {
                return String(b.ts || '').localeCompare(String(a.ts || ''));
            });
            var n = Number(limit || 0);
            if (n > 0) events = events.slice(0, n);
            return events;
        },

        /**
         * Dashboard Query Model（讀模型，不直接掃交易頁狀態）
         */
        getDashboardQueryModel: function () {
            var kpi = this.getDashboardKpiSummary();
            var members = this.getMembers() || [];
            var groups = this.getGroups() || [];
            var reports = this.listSmallGroupVoiceReports(500) || [];
            var gifts = this.listGiftAssessmentSnapshots({ latest_per_member: true }) || [];
            var now = new Date();
            var reportRecent = reports.filter(function (r) {
                var d = parseDateSafe(r && (r.report_date || r.created_at));
                if (!d) return false;
                return (now - d) <= 30 * 24 * 60 * 60 * 1000;
            });
            var riskCount = reportRecent.filter(function (r) {
                var arr = r && r.structured && Array.isArray(r.structured.risks) ? r.structured.risks : [];
                return arr.length > 0;
            }).length;
            return {
                schema_version: 1,
                generated_at: now.toISOString(),
                source: 'church_data_bridge_read_model',
                kpi: kpi,
                totals: {
                    members: members.length,
                    groups: groups.length,
                    recent_reports_30d: reportRecent.length,
                    gift_snapshots_latest: gifts.length,
                    care_risk_signals_30d: riskCount
                },
                trend: {
                    membership_growth_hint: members.length >= 1 ? 'up' : 'flat',
                    engagement_hint: reportRecent.length > 0 ? 'active' : 'low'
                }
            };
        },

        /**
         * 財務事工完整資料 → financeSystemData + churchMasterDatabase.financeModule
         * （與 getFinanceSummary 所用鍵並存，避免破壞既有摘要邏輯）
         * TODO: 正式部署改為 API
         */
        saveFinanceSystemData: function (finData) {
            this.assertNoDemoSeedInProduction();
            var copy = JSON.parse(JSON.stringify(finData || {}));
            if (this.isProductionMode() && isFinanceDemoPayload(copy)) {
                var err = new Error('PROD 禁止寫入財務 demo/seed 資料');
                err.code = 'FINANCE_DATA_CONTAMINATION_ERROR';
                throw err;
            }
            if (!Array.isArray(copy.transactions)) copy.transactions = [];
            copy.transactions = copy.transactions.map(function (t) { return normalizeFinanceTransaction(t, {}); });
            _asyncCache.financeData = JSON.parse(JSON.stringify(copy));
            setJson(FIN_KEY, copy);
            var cm = getJson(CM_KEY) || {};
            cm.financeModule = copy;
            cm.financeModuleSyncedAt = new Date().toISOString();
            setJson(CM_KEY, cm);
            this.logActivity('save_finance_system_data', { transactions: (copy.transactions || []).length }, 'bridge');
            return true;
        },

        /**
         * 學校 ↔ 教會 Person 映射預覽（只讀草案 · 不合併 SSOT）
         * 詳見 docs/SCHOOL_CRM_PERSONID_BRIDGE.md
         */
        getPersonMappingPreview: function (opts) {
            opts = opts && typeof opts === 'object' ? opts : {};
            var limit = Number(opts.limit || 20);
            if (!isFinite(limit) || limit <= 0) limit = 20;
            var members = this.getMembers() || [];
            var memberById = {};
            members.forEach(function (m) {
                var id = String(m.memberId != null ? m.memberId : m.id);
                memberById[id] = m;
            });
            var schoolDb = getJson('schoolMasterDatabase') || {};
            var students = Array.isArray(schoolDb.students) ? schoolDb.students : [];
            var teachers = Array.isArray(schoolDb.teachers) ? schoolDb.teachers : [];
            var rows = [];
            students.slice(0, limit).forEach(function (s) {
                var mid = s.memberId != null ? String(s.memberId) : (s.member_id != null ? String(s.member_id) : '');
                rows.push({
                    person_id: mid || ('student:' + (s.id || s.studentId || '')),
                    member_id: mid || null,
                    student_id: s.id != null ? String(s.id) : (s.studentId != null ? String(s.studentId) : null),
                    teacher_id: null,
                    parent_id: s.parentId != null ? String(s.parentId) : (s.parent_id != null ? String(s.parent_id) : null),
                    role_hints: ['student'],
                    name: s.name || s.fullName || '',
                    linked_member: mid && memberById[mid] ? (memberById[mid].name || mid) : null
                });
            });
            teachers.slice(0, Math.max(0, limit - rows.length)).forEach(function (t) {
                var mid = t.memberId != null ? String(t.memberId) : (t.member_id != null ? String(t.member_id) : '');
                rows.push({
                    person_id: mid || ('teacher:' + (t.id || t.teacherId || '')),
                    member_id: mid || null,
                    student_id: null,
                    teacher_id: t.id != null ? String(t.id) : (t.teacherId != null ? String(t.teacherId) : null),
                    parent_id: null,
                    role_hints: ['teacher'],
                    name: t.name || t.fullName || '',
                    linked_member: mid && memberById[mid] ? (memberById[mid].name || mid) : null
                });
            });
            return {
                schema_version: 1,
                strategy: 'member_id_as_person_id_when_present',
                member_count: members.length,
                school_student_count: students.length,
                school_teacher_count: teachers.length,
                linked_count: rows.filter(function (r) { return r.member_id; }).length,
                sample: rows.slice(0, limit),
                docs: 'docs/SCHOOL_CRM_PERSONID_BRIDGE.md'
            };
        }
    };

    try {
        if (global && global.CHURCH_PERSISTENCE_PROVIDER) {
            ChurchDataBridge.configurePersistence(global.CHURCH_PERSISTENCE_PROVIDER);
        } else if (
            global &&
            global.CHURCH_CLOUD_CONFIG &&
            global.CHURCH_CLOUD_CONFIG.USE_MOCK_CLOUD === true &&
            typeof global.createChurchMockCloudProvider === 'function'
        ) {
            ChurchDataBridge.configurePersistence(
                global.createChurchMockCloudProvider({
                    latencyMs: Number(global.CHURCH_CLOUD_CONFIG.MOCK_CLOUD_LATENCY_MS) || 450,
                    name: 'mockCloud'
                })
            );
            console.info('[ChurchDataBridge] Mock 雲端 Persistence 已啟用（雛形）');
        }
    } catch (pErr) {
        console.warn('ChurchDataBridge persistence provider 初始化失敗，已回退 localStorage provider', pErr);
        _storage = createLocalStorageProvider();
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ChurchDataBridge;
    } else {
        global.ChurchDataBridge = ChurchDataBridge;
    }

    try {
        if (global.ChurchDataBridge && typeof global.ChurchDataBridge.init === 'function') {
            global.ChurchDataBridge.init().catch(function () {});
        }
    } catch (initErr) {
        console.warn('ChurchDataBridge.init 啟動略過', initErr);
    }
})(typeof window !== 'undefined' ? window : this);
