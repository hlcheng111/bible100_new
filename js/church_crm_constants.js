/**
 * 教會 CRM 共用常數（屬靈階段、事件類型、新人 SLA）
 * 規格：church_ministry/docs/CHURCH_CRM_BLUEPRINT.md
 */
(function (global) {
    'use strict';

    var SPIRITUAL_JOURNEY_STAGES = [
        { id: 'seeker', label_zh: '慕道', label_en: 'Seeker', legacy_number: 0, connect_phase: 'Connect' },
        { id: 'new_believer', label_zh: '初信', label_en: 'New believer', legacy_number: 1, connect_phase: 'Care' },
        { id: 'growing', label_zh: '成長', label_en: 'Growing', legacy_number: 2, connect_phase: 'Grow' },
        { id: 'serving', label_zh: '服事', label_en: 'Serving', legacy_number: 3, connect_phase: 'Serve' },
        { id: 'leader', label_zh: '領袖', label_en: 'Leader', legacy_number: 4, connect_phase: 'Multiply' }
    ];

    var STAGE_BY_ID = {};
    var STAGE_BY_LEGACY = {};
    SPIRITUAL_JOURNEY_STAGES.forEach(function (s) {
        STAGE_BY_ID[s.id] = s;
        STAGE_BY_LEGACY[s.legacy_number] = s;
    });

    var PASTORAL_EVENT_TYPES = {
        newcomer_followup: { label_zh: '新人跟進', sla_days: 3 },
        visitation: { label_zh: '探訪' },
        prayer_request: { label_zh: '代禱' },
        care_call: { label_zh: '關懷聯繫' },
        course_completed: { label_zh: '課程完成' },
        baptism: { label_zh: '受洗' },
        ministry_invite: { label_zh: '事奉邀請' },
        ministry_confirmed: { label_zh: '事奉確認' },
        small_group_join: { label_zh: '加入小組' },
        offering_milestone: { label_zh: '奉獻里程碑' },
        stage_promoted: { label_zh: '階段晉升' }
    };

    var NEWCOMER_SLA_DAYS = 3;

    function normalizeSpiritualStage(input) {
        if (input == null || input === '') return 'growing';
        if (STAGE_BY_ID[String(input)]) return String(input);
        var n = Number(input);
        if (!isNaN(n) && STAGE_BY_LEGACY[n]) return STAGE_BY_LEGACY[n].id;
        var lower = String(input).toLowerCase();
        if (lower.indexOf('慕') >= 0 || lower === 'seeker') return 'seeker';
        if (lower.indexOf('初') >= 0 || lower.indexOf('new') >= 0) return 'new_believer';
        if (lower.indexOf('服') >= 0 || lower === 'serve') return 'serving';
        if (lower.indexOf('領') >= 0 || lower === 'leader') return 'leader';
        return 'growing';
    }

    function stageToLegacyNumber(stageId) {
        var s = STAGE_BY_ID[normalizeSpiritualStage(stageId)];
        return s ? s.legacy_number : 2;
    }

    function stageLabel(stageId, lang) {
        var s = STAGE_BY_ID[normalizeSpiritualStage(stageId)];
        if (!s) return String(stageId || '');
        return lang === 'en' ? s.label_en : s.label_zh;
    }

    var api = {
        SCHEMA_VERSION: 1,
        SPIRITUAL_JOURNEY_STAGES: SPIRITUAL_JOURNEY_STAGES,
        PASTORAL_EVENT_TYPES: PASTORAL_EVENT_TYPES,
        NEWCOMER_SLA_DAYS: NEWCOMER_SLA_DAYS,
        normalizeSpiritualStage: normalizeSpiritualStage,
        stageToLegacyNumber: stageToLegacyNumber,
        stageLabel: stageLabel,
        listStageOptions: function () {
            return SPIRITUAL_JOURNEY_STAGES.map(function (s) {
                return { value: s.id, label: s.label_zh + ' · ' + s.label_en };
            });
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        global.ChurchCrmConstants = api;
    }
})(typeof window !== 'undefined' ? window : this);
