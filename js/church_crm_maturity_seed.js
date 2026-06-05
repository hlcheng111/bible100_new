/**
 * CRM 成熟度種子：補齊 getCrmMaturitySummary 八項檢查（目標 percent ≥ 90）
 */
(function (global) {
    'use strict';

    function applyCrmMaturitySeed(Bridge) {
        if (!Bridge) return { ok: false, reason: 'no_bridge' };
        if (Bridge.isProductionMode && Bridge.isProductionMode()) {
            return { ok: false, reason: 'production_skip' };
        }
        var CentralMemberDB = global.CentralMemberDB;
        var seed = CentralMemberDB && CentralMemberDB.generateSeed
            ? CentralMemberDB.generateSeed()
            : { members: [], groups: [], groupMemberships: [], trainings: [] };
        var members = seed.members || [];
        var stages = ['seeker', 'new_believer', 'growing', 'serving', 'leader'];
        members.forEach(function (m, i) {
            m.spiritual_journey_stage = stages[i % stages.length];
            m.spiritual_stage = m.spiritual_journey_stage;
            if (!m.first_visit_date) {
                var d = new Date();
                d.setDate(d.getDate() - (i % 14));
                m.first_visit_date = d.toISOString().split('T')[0];
                m.firstVisitDate = m.first_visit_date;
            }
        });
        if (Bridge.applyBootstrapSeed) {
            Bridge.applyBootstrapSeed(seed);
        } else if (Bridge.saveMemberSystemData) {
            Bridge.saveMemberSystemData(seed);
        }
        var list = Bridge.getMembers ? Bridge.getMembers() : members;
        var now = new Date().toISOString();
        list.slice(0, 8).forEach(function (m, idx) {
            var mid = m.memberId != null ? m.memberId : m.id;
            if (mid == null || !Bridge.appendPastoralEvent) return;
            try {
                Bridge.appendPastoralEvent({
                    member_id: mid,
                    event_type: idx % 2 === 0 ? 'newcomer_followup' : 'visitation',
                    summary: 'CRM 成熟度種子：示範牧養事件 ' + (idx + 1),
                    source_module: 'crm_maturity_seed',
                    ts: now
                });
            } catch (e) {}
        });
        var vol = {
            positions: [
                { id: 1, name: '主日招待', category: 'hospitality', needPeople: 4, requirements: '恩賜：服事、恩慈' },
                { id: 2, name: '敬拜司琴', category: 'worship', needPeople: 2, requirements: '音樂、敬拜' },
                { id: 3, name: '兒童主日學助教', category: 'education', needPeople: 6, requirements: '教育、耐心' }
            ],
            assignments: [],
            schedules: [],
            trainings: []
        };
        if (Bridge.saveVolunteerSystemData) {
            Bridge.saveVolunteerSystemData(vol);
        }
        var canon = global.SmartMinistryCanonical;
        if (canon) {
            if (canon.migrateLegacyToCanonical) {
                try { canon.migrateLegacyToCanonical({ force: false }); } catch (e1) {}
            }
            list.slice(0, 5).forEach(function (m) {
                var tid = String(m.memberId != null ? m.memberId : m.id);
                if (canon.upsertTalent) {
                    canon.upsertTalent({
                        talent_id: tid,
                        member_id: tid,
                        name: m.name || ('會友' + tid),
                        status: 'active'
                    });
                }
                if (canon.attachAssessmentToTalent) {
                    canon.attachAssessmentToTalent(tid, 'shape', { instrument_version: 'seed-v1' }, {
                        scores: { teaching: 3, serving: 4 },
                        ai_summary: '成熟度種子評估（示範）'
                    });
                }
            });
            var mins = canon.listMinistriesCatalog ? canon.listMinistriesCatalog() : [];
            if (mins.length && list.length >= 2 && canon.addMinistryAssignment) {
                var t0 = String(list[0].memberId != null ? list[0].memberId : list[0].id);
                var t1 = String(list[1].memberId != null ? list[1].memberId : list[1].id);
                var mid = mins[0].ministry_id || mins[0].id;
                canon.addMinistryAssignment({
                    talent_id: t0,
                    ministry_id: mid,
                    ministry_name: mins[0].name,
                    status: 'proposed',
                    source: 'crm_maturity_seed'
                });
                canon.addMinistryAssignment({
                    talent_id: t1,
                    ministry_id: mid,
                    ministry_name: mins[0].name,
                    status: 'confirmed',
                    source: 'crm_maturity_seed'
                });
            }
        }
        var vis = Bridge.getVisitationData ? Bridge.getVisitationData() : { missions: [] };
        if (!vis.missions || !vis.missions.length) {
            vis.missions = [{
                id: 'seed_m1',
                type: 'newcomer',
                target: list[0] ? (list[0].name || '') : '新朋友',
                date: now.split('T')[0],
                status: 'planned',
                team: ''
            }];
            if (Bridge.saveVisitationMission) {
                Bridge.saveVisitationMission(vis.missions[0]);
            }
        }
        var summary = Bridge.getCrmMaturitySummary ? Bridge.getCrmMaturitySummary() : { percent: 0 };
        return { ok: true, percent: summary.percent, checks: summary.checks };
    }

    global.ChurchCrmMaturitySeed = { apply: applyCrmMaturitySeed };
})(typeof window !== 'undefined' ? window : this);
