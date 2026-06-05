/**
 * 智慧事奉儀表板 — 從本機 localStorage 彙總「可驗證」的計數
 * 優先讀取 canonical：`bible100_smart_ministry_main`（見 SMART_MINISTRY_DATA_RULES.md）
 */
(function (window) {
    'use strict';

    var MEMBER_KEY = 'memberSystemData';
    var SIMPLE_DB = 'bible100_main';
    var PREFIX = 'bible100_smart_ministry_';
    var LINKING_KEY = 'smart_ministry_linking';
    var CANONICAL_KEY = 'bible100_smart_ministry_main';

    function safeParse(raw, fallback) {
        try {
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function getCanonicalSnapshot() {
        var raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CANONICAL_KEY) : null;
        var data = safeParse(raw, null);
        if (!data || typeof data !== 'object') return null;
        return {
            talents: Array.isArray(data.talents) ? data.talents.length : 0,
            talent_skill: Array.isArray(data.talent_skill) ? data.talent_skill.length : 0,
            ministry_assignment: Array.isArray(data.ministry_assignment) ? data.ministry_assignment.length : 0,
            ministries: Array.isArray(data.ministries) ? data.ministries.length : 0,
            assessments: Array.isArray(data.assessments) ? data.assessments.length : 0
        };
    }

    function countMemberProfiles() {
        var data = safeParse(typeof localStorage !== 'undefined' ? localStorage.getItem(MEMBER_KEY) : null, null);
        if (data && Array.isArray(data.members)) return data.members.length;
        return 0;
    }

    function parseSimpleDB() {
        var raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SIMPLE_DB) : null;
        var obj = safeParse(raw, {});
        if (!obj || typeof obj !== 'object') return { talents: 0, ministries: 0 };
        var t = obj.talents && Array.isArray(obj.talents.data) ? obj.talents.data.length : 0;
        var m = obj.ministries && Array.isArray(obj.ministries.data) ? obj.ministries.data.length : 0;
        return { talents: t, ministries: m };
    }

    function countUnifiedTable(table) {
        var raw = typeof localStorage !== 'undefined' ? localStorage.getItem(PREFIX + table) : null;
        var arr = safeParse(raw, []);
        return Array.isArray(arr) ? arr.length : 0;
    }

    function countLinkingByType() {
        var raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LINKING_KEY) : null;
        var data = safeParse(raw, { links: {} });
        var links = data.links || {};
        var out = { talent_skill: 0, ministry_assignment: 0, other: 0 };
        Object.keys(links).forEach(function (k) {
            var l = links[k];
            if (!l || !l.type) return;
            if (l.type === 'talent_skill') out.talent_skill++;
            else if (l.type === 'ministry_assignment') out.ministry_assignment++;
            else out.other++;
        });
        return out;
    }

    /**
     * @returns {Object} stats for dashboard cards and activity list
     */
    function getSmartMinistryDashboardStats() {
        var canonical = getCanonicalSnapshot();
        var members = countMemberProfiles();
        var simple = parseSimpleDB();
        var talentsUnified = countUnifiedTable('talents');
        var skillsUnified = countUnifiedTable('skills');
        var link = countLinkingByType();

        var profileDisplay;
        var profileSource;
        if (canonical && canonical.talents > 0) {
            profileDisplay = Math.max(members, canonical.talents);
            profileSource = members > 0 ? 'central_and_canonical' : 'canonical';
        } else {
            profileDisplay = members > 0 ? members : (talentsUnified + simple.talents > 0 ? Math.max(talentsUnified, simple.talents) : 0);
            profileSource = members > 0 ? 'central' : (talentsUnified > 0 || simple.talents > 0 ? 'unified_or_simple' : 'none');
        }

        return {
            membersCentral: members,
            talentsUnified: talentsUnified,
            skillsUnified: skillsUnified,
            simpleTalents: simple.talents,
            ministriesSimple: simple.ministries,
            linksTalentSkill: canonical ? canonical.talent_skill : link.talent_skill,
            linksMinistryAssignment: canonical ? canonical.ministry_assignment : link.ministry_assignment,
            linksOther: link.other,
            profileDisplay: profileDisplay,
            profileSource: profileSource,
            canonical: canonical,
            hasCanonical: !!(canonical && (canonical.talents > 0 || canonical.talent_skill > 0))
        };
    }

    window.getSmartMinistryDashboardStats = getSmartMinistryDashboardStats;
})(typeof window !== 'undefined' ? window : this);
