/**
 * Smart Ministry — Canonical 資料層 v1
 * 儲存鍵：bible100_smart_ministry_main
 * 規格：見 smart_ministry/docs/SMART_MINISTRY_DATA_RULES.md
 */
(function (global) {
    'use strict';

    var MAIN_KEY = 'bible100_smart_ministry_main';
    var MEMBER_KEY = 'memberSystemData';
    var LEGACY_SIMPLE = 'bible100_main';
    var LEGACY_PREFIX = 'bible100_smart_ministry_';
    var LEGACY_LINKING = 'smart_ministry_linking';
    var MIGRATION_FLAG = 'smart_ministry_canonical_migrated_v1';

    function nowIso() {
        return new Date().toISOString();
    }

    function uid(prefix) {
        return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    }

    function safeParse(raw, fb) {
        try {
            return raw ? JSON.parse(raw) : fb;
        } catch (e) {
            return fb;
        }
    }

    function getChurchId() {
        try {
            if (typeof window !== 'undefined') {
                var params = new URLSearchParams(window.location && window.location.search ? window.location.search : '');
                return params.get('church_id') || window.CURRENT_CHURCH_ID || 'default';
            }
        } catch (e) {}
        return 'default';
    }

    function storageGet(key) {
        try {
            if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === 'function') {
                return global.PersistenceProvider.getInstance().getItem(key);
            }
        } catch (e) {}
        warnStorageBypass('smart_ministry_get:' + key);
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }

    function storageSet(key, value) {
        try {
            if (global.PersistenceProvider && typeof global.PersistenceProvider.getInstance === 'function') {
                global.PersistenceProvider.getInstance().setItem(key, value);
                return;
            }
        } catch (e) {}
        warnStorageBypass('smart_ministry_set:' + key);
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    }

    var _storageWarned = {};
    function warnStorageBypass(reason) {
        var key = String(reason || 'unknown');
        if (_storageWarned[key]) return;
        _storageWarned[key] = true;
        try { console.warn('[DataPolicy] fallback localStorage path:', key); } catch (e) {}
    }

    function emptyMain() {
        return {
            schema_version: 1,
            talents: [],
            talent_skill: [],
            ministry_assignment: [],
            ministries: [],
            assessments: [],
            meta: { updated_at: nowIso(), church_id: getChurchId() }
        };
    }

    function loadMain() {
        var raw = storageGet(MAIN_KEY);
        var data = safeParse(raw, null);
        if (!data || typeof data !== 'object') return emptyMain();
        if (!Array.isArray(data.talents)) data.talents = [];
        if (!Array.isArray(data.talent_skill)) data.talent_skill = [];
        if (!Array.isArray(data.ministry_assignment)) data.ministry_assignment = [];
        if (!Array.isArray(data.ministries)) data.ministries = [];
        if (!Array.isArray(data.assessments)) data.assessments = [];
        if (data.schema_version == null) data.schema_version = 1;
        if (!data.meta) data.meta = {};
        if (!data.meta.church_id) data.meta.church_id = getChurchId();
        return data;
    }

    function saveMain(data) {
        data.meta = data.meta || {};
        data.meta.updated_at = nowIso();
        data.meta.church_id = data.meta.church_id || getChurchId();
        try {
            storageSet(MAIN_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('SmartMinistryCanonical save failed', e);
            return false;
        }
    }

    /**
     * 解析人才列上的主鍵：優先 talent_id（= member_id），否則用列 id
     */
    function resolveTalentId(row) {
        if (!row) return null;
        if (row.talent_id != null && row.talent_id !== '') return String(row.talent_id);
        if (row.member_id != null && row.member_id !== '') return String(row.member_id);
        if (row.id != null) return 'legacy_talent_' + String(row.id);
        return null;
    }

    // ---------- Public API ----------

    var SmartMinistryCanonical = {
        MAIN_KEY: MAIN_KEY,

        getStore: loadMain,
        saveStore: saveMain,

        loadTalentById: function (talentId) {
            var id = String(talentId);
            var m = loadMain();
            return m.talents.find(function (t) {
                return String(t.talent_id) === id || String(t.id) === id || resolveTalentId(t) === id;
            }) || null;
        },

        listTalents: function () {
            return loadMain().talents.slice();
        },

        /**
         * 建立或更新 canonical.talents；若表單含 member_id / 已存在會友則 talent_id 對齊會友
         * @param {Object} form — 至少 name；可含 talent_id, member_id, phone, gift, mbti, ...
         */
        saveOrUpdateTalent: function (form) {
            var m = loadMain();
            var tid = form.talent_id != null ? String(form.talent_id) : (form.member_id != null ? String(form.member_id) : null);
            if (!tid) {
                tid = uid('talent');
            }
            var existingIdx = m.talents.findIndex(function (t) {
                return String(t.talent_id) === tid || (form.id != null && String(t.id) === String(form.id));
            });
            var row = existingIdx >= 0 ? Object.assign({}, m.talents[existingIdx]) : {};
            Object.assign(row, form, {
                talent_id: tid,
                member_id: form.member_id != null ? String(form.member_id) : (form.memberId != null ? String(form.memberId) : tid),
                memberId: form.memberId != null ? String(form.memberId) : (form.member_id != null ? String(form.member_id) : tid),
                church_id: form.church_id || row.church_id || getChurchId(),
                updated_at: nowIso(),
                created_at: row.created_at || nowIso(),
                status: form.status || row.status || 'active'
            });
            if (row.id == null) row.id = tid;
            if (existingIdx >= 0) m.talents[existingIdx] = row;
            else m.talents.push(row);
            saveMain(m);
            return { success: true, talent_id: tid, record: row };
        },

        attachAssessmentToTalent: function (talentId, type, payload, summary) {
            var tid = String(talentId);
            var m = loadMain();
            var rec = {
                id: uid('asm'),
                talent_id: tid,
                church_id: getChurchId(),
                type: type,
                instrument_version: (payload && payload.instrument_version) || 'v1',
                scoring_version: (payload && payload.scoring_version) || 'v1',
                payload: payload || {},
                summary: summary || {},
                created_at: nowIso(),
                updated_at: nowIso()
            };
            m.assessments.push(rec);
            saveMain(m);
            try {
                if (global.ChurchDataBridge && typeof global.ChurchDataBridge.createGiftAssessmentSnapshot === 'function') {
                    global.ChurchDataBridge.createGiftAssessmentSnapshot({
                        church_id: rec.church_id,
                        member_id: rec.talent_id,
                        instrument_key: type || 'gift_assessment',
                        instrument_version: rec.instrument_version,
                        scoring_version: rec.scoring_version,
                        submitted_at: rec.created_at,
                        raw_answers: rec.payload || {},
                        normalized_scores: (rec.summary && rec.summary.scores) ? rec.summary.scores : {},
                        ai_summary: (rec.summary && rec.summary.ai_summary) ? rec.summary.ai_summary : '',
                        ai_model: (rec.summary && rec.summary.ai_model) ? rec.summary.ai_model : ''
                    });
                }
            } catch (e) {}
            return rec;
        },

        listAssessmentsForTalent: function (talentId) {
            var tid = String(talentId);
            return loadMain().assessments.filter(function (a) {
                return String(a.talent_id) === tid;
            });
        },

        /** 以技能列陣列覆寫該人才之 talent_skill（canonical 唯一真相） */
        setTalentSkills: function (talentId, skillsArray) {
            var tid = String(talentId);
            var m = loadMain();
            m.talent_skill = m.talent_skill.filter(function (r) {
                return String(r.talent_id) !== tid;
            });
            (skillsArray || []).forEach(function (sk) {
                var skillId = sk.skill_id != null ? sk.skill_id : sk.id;
                m.talent_skill.push({
                    id: uid('ts'),
                    talent_id: tid,
                    church_id: getChurchId(),
                    skill_code: sk.skill_code || sk.code || String(skillId),
                    skill_name: sk.skill_name || sk.name || '',
                    skill_id_ref: skillId != null ? skillId : null,
                    category: sk.category || '',
                    level: sk.level || '',
                    source: sk.source || 'manual',
                    created_at: nowIso(),
                    updated_at: nowIso()
                });
            });
            saveMain(m);
            return { success: true, count: (skillsArray || []).length };
        },

        listTalentSkills: function (talentId) {
            var tid = String(talentId);
            return loadMain().talent_skill.filter(function (r) {
                return String(r.talent_id) === tid;
            });
        },

        /** 供配對頁：技能字串（canonical + 人才列上舊 skills_legacy） */
        getSkillsDisplayString: function (talentRow) {
            var tid = resolveTalentId(talentRow);
            if (!tid) return '';
            var parts = this.listTalentSkills(tid).map(function (r) {
                return r.skill_name || r.skill_code || '';
            }).filter(Boolean);
            if (parts.length) return parts.join(',');
            return (talentRow.skills_legacy || talentRow.skills || '') + '';
        },

        /** 單筆新增（與舊 UI 相容） */
        addTalentSkillLink: function (talentId, skillRow) {
            var tid = String(talentId);
            var m = loadMain();
            var skillId = skillRow.id != null ? skillRow.id : skillRow.skill_id;
            var dup = m.talent_skill.some(function (r) {
                return String(r.talent_id) === tid && String(r.skill_id_ref) === String(skillId);
            });
            if (dup) return { success: false, reason: 'duplicate' };
            m.talent_skill.push({
                id: uid('ts'),
                talent_id: tid,
                church_id: getChurchId(),
                skill_code: skillRow.skill_code || String(skillId),
                skill_name: skillRow.name || skillRow.skill_name || '',
                skill_id_ref: skillId,
                category: skillRow.category || '',
                level: skillRow.level || '',
                source: 'manual',
                created_at: nowIso(),
                updated_at: nowIso()
            });
            saveMain(m);
            return { success: true };
        },

        removeTalentSkillLink: function (talentId, skillIdRef) {
            var tid = String(talentId);
            var sid = String(skillIdRef);
            var m = loadMain();
            var before = m.talent_skill.length;
            m.talent_skill = m.talent_skill.filter(function (r) {
                if (String(r.talent_id) !== tid) return true;
                return String(r.skill_id_ref) !== sid;
            });
            saveMain(m);
            return { success: true, removed: before - m.talent_skill.length };
        },

        clearTalentSkills: function (talentId) {
            return this.setTalentSkills(talentId, []);
        },

        addMinistryAssignment: function (rec) {
            var m = loadMain();
            var row = Object.assign({
                id: uid('ma'),
                church_id: getChurchId(),
                status: 'proposed',
                source: 'rules_matching',
                created_at: nowIso(),
                updated_at: nowIso()
            }, rec);
            if (!row.talent_id || !row.ministry_id) {
                return { success: false, error: 'talent_id and ministry_id required' };
            }
            row.talent_id = String(row.talent_id);
            row.ministry_id = String(row.ministry_id);
            var dup = m.ministry_assignment.some(function (x) {
                return String(x.talent_id) === row.talent_id && String(x.ministry_id) === row.ministry_id;
            });
            if (dup) {
                return { success: false, duplicate: true };
            }
            m.ministry_assignment.push(row);
            saveMain(m);
            return { success: true, record: row };
        },

        listMinistryAssignments: function () {
            return loadMain().ministry_assignment.slice();
        },

        updateMinistryAssignmentById: function (assignmentId, patch) {
            var aid = String(assignmentId);
            var m = loadMain();
            var idx = m.ministry_assignment.findIndex(function (x) { return String(x.id) === aid; });
            if (idx < 0) return { success: false, error: 'not_found' };
            m.ministry_assignment[idx] = Object.assign({}, m.ministry_assignment[idx], patch || {}, { updated_at: nowIso() });
            saveMain(m);
            return { success: true, record: m.ministry_assignment[idx] };
        },

        /** 覆寫全部事奉配對（慎用） */
        setMinistryAssignments: function (rows) {
            var m = loadMain();
            m.ministry_assignment = (rows || []).map(function (r) {
                return Object.assign({ updated_at: nowIso() }, r);
            });
            saveMain(m);
            return { success: true, count: m.ministry_assignment.length };
        },

        listMinistriesCatalog: function () {
            return loadMain().ministries.slice();
        },

        upsertMinistryCatalog: function (ministryRow) {
            var m = loadMain();
            var mid = ministryRow.ministry_id != null ? String(ministryRow.ministry_id) : String(ministryRow.id);
            var idx = m.ministries.findIndex(function (x) {
                return String(x.ministry_id || x.id) === mid;
            });
            var row = Object.assign({}, ministryRow, {
                ministry_id: mid,
                id: ministryRow.id != null ? ministryRow.id : mid,
                updated_at: nowIso(),
                created_at: (idx >= 0 ? m.ministries[idx].created_at : null) || nowIso()
            });
            if (idx >= 0) m.ministries[idx] = row;
            else m.ministries.push(row);
            saveMain(m);
            return row;
        },

        /**
         * 一次性：合併 memberSystemData、bible100_main、legacy unified 表、smart_ministry_linking
         */
        migrateLegacyToCanonical: function (options) {
            options = options || {};
            if (!options.force && storageGet(MIGRATION_FLAG) === '1') {
                return { migrated: false, reason: 'already_done' };
            }

            var m = loadMain();
            var seenTalent = {};
            m.talents.forEach(function (t) {
                seenTalent[resolveTalentId(t)] = true;
            });

            // 1) memberSystemData → talents
            var memData = safeParse(storageGet(MEMBER_KEY), null);
            if (memData && Array.isArray(memData.members)) {
                memData.members.forEach(function (mem) {
                    var tid = String(mem.id);
                    if (seenTalent[tid]) return;
                    m.talents.push({
                        talent_id: tid,
                        id: tid,
                        name: mem.name || '',
                        gender: mem.gender,
                        contact: { phone: mem.phone, email: mem.email },
                        registration_source: 'memberSystemData',
                        gift: mem.gifts,
                        notes: '',
                        status: mem.status || 'active',
                        created_at: nowIso(),
                        updated_at: nowIso()
                    });
                    seenTalent[tid] = true;
                });
            }

            // 2) bible100_main simpleDB
            var simple = safeParse(storageGet(LEGACY_SIMPLE), {});
            var st = simple.talents && simple.talents.data ? simple.talents.data : [];
            st.forEach(function (t) {
                var tid = 'legacy_main_' + String(t.id);
                if (seenTalent[tid]) return;
                m.talents.push({
                    talent_id: tid,
                    id: tid,
                    name: t.name || '',
                    mbti: t.mbti,
                    gift: t.gift,
                    skills_legacy: t.skills,
                    registration_source: 'bible100_main',
                    created_at: t.createdAt || nowIso(),
                    updated_at: nowIso(),
                    status: 'active',
                    _legacy_simple_id: t.id
                });
                seenTalent[tid] = true;
            });
            var smin = simple.ministries && simple.ministries.data ? simple.ministries.data : [];
            smin.forEach(function (min) {
                var mid = String(min.id);
                if (m.ministries.some(function (x) { return String(x.ministry_id || x.id) === mid; })) return;
                m.ministries.push({
                    ministry_id: mid,
                    id: min.id,
                    name: min.name || '',
                    requires: min.requires,
                    urgency: min.urgency,
                    created_at: min.createdAt || nowIso(),
                    updated_at: nowIso()
                });
            });

            // 3) bible100_smart_ministry_talents
            var ut = safeParse(storageGet(LEGACY_PREFIX + 'talents'), []);
            if (Array.isArray(ut)) {
                ut.forEach(function (t) {
                    var tid = t.talent_id != null ? String(t.talent_id) : String(t.id);
                    if (!seenTalent[tid]) {
                        m.talents.push(Object.assign({}, t, {
                            talent_id: tid,
                            registration_source: t.registration_source || 'unified_legacy',
                            updated_at: nowIso()
                        }));
                        seenTalent[tid] = true;
                    }
                });
            }

            // 4) linking → talent_skill & ministry_assignment
            var linkData = safeParse(storageGet(LEGACY_LINKING), { links: {} });
            var links = linkData.links || {};
            Object.keys(links).forEach(function (k) {
                var L = links[k];
                if (!L || !L.type) return;
                if (L.type === 'talent_skill') {
                    var tsId = 'legacy_ts_' + k;
                    if (m.talent_skill.some(function (r) { return r.id === tsId; })) return;
                    var src = String(L.sourceId);
                    var tgt = String(L.targetId);
                    m.talent_skill.push({
                        id: tsId,
                        talent_id: src,
                        skill_id_ref: tgt,
                        skill_code: tgt,
                        skill_name: '',
                        source: 'migrated_linking',
                        created_at: L.createdAt || nowIso(),
                        updated_at: nowIso()
                    });
                }
                if (L.type === 'ministry_assignment') {
                    var maId = 'legacy_ma_' + k;
                    if (m.ministry_assignment.some(function (r) { return r.id === maId; })) return;
                    m.ministry_assignment.push({
                        id: maId,
                        talent_id: String(L.sourceId),
                        ministry_id: String(L.targetId),
                        ministry_name: '',
                        status: 'proposed',
                        source: 'migrated_linking',
                        metadata: L.metadata || {},
                        created_at: L.createdAt || nowIso(),
                        updated_at: nowIso()
                    });
                }
            });

            saveMain(m);
            try {
                storageSet(MIGRATION_FLAG, '1');
            } catch (e2) {}
            return { migrated: true, talents: m.talents.length, talent_skill: m.talent_skill.length, ministry_assignment: m.ministry_assignment.length };
        },

        exportAll: function () {
            return JSON.stringify(loadMain(), null, 2);
        },

        resolveTalentId: resolveTalentId
    };

    global.SmartMinistryCanonical = SmartMinistryCanonical;
})(typeof window !== 'undefined' ? window : this);
