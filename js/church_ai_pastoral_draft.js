/**
 * 牧養 AI 草稿工作流（CRM-5 · 治理：Prompt → 外部 LLM → 人工確認 → pastoral_events）
 * 不內建 API Key；不將草稿視為權威。
 */
(function (global) {
    'use strict';

    var DISCLAIMER =
        '此為 AI 草稿，須經牧者／同工禱告分辨後才可寫入正式紀錄；不可取代牧養權柄。';

    function buildPrompt(opts) {
        opts = opts || {};
        var name = opts.memberName || '（會友）';
        var stage = opts.spiritualStage || 'growing';
        var ctx = opts.context || '';
        var kind = opts.draftKind || 'followup';
        return [
            '你是教會牧養助理，只產出草稿，不可宣稱屬靈權威。',
            '任務：' + kind + ' 跟進備忘',
            '對象：' + name + '，屬靈階段：' + stage,
            '背景：' + (ctx || '（同工未提供）'),
            '',
            '請輸出：',
            '1) 三句以內關懷摘要（繁體中文）',
            '2) 建議跟進方式（探訪／電話／代禱）',
            '3) 可引用的經文方向（勿編造章節，若不確定請寫「需查證」）',
            '',
            '禁止：編造個資、取代牧者決策、承諾神諭。'
        ].join('\n');
    }

    function parseDraftToEvent(draftText, memberId) {
        return {
            member_id: String(memberId),
            event_type: 'care_call',
            summary: String(draftText || '').trim().slice(0, 500),
            source_module: 'ai_pastoral_draft',
            metadata: {
                ai_draft: true,
                human_confirmed: false,
                disclaimer: DISCLAIMER
            }
        };
    }

    global.ChurchAiPastoralDraft = {
        DISCLAIMER: DISCLAIMER,
        buildPrompt: buildPrompt,
        parseDraftToEvent: parseDraftToEvent,

        confirmDraftToPastoralEvent: function (draftText, memberId) {
            if (global.ChurchAuth && ChurchAuth.assertCan) {
                ChurchAuth.assertCan('pastoral.write');
            }
            if (!global.ChurchDataBridge || !ChurchDataBridge.appendPastoralEvent) {
                throw new Error('ChurchDataBridge.appendPastoralEvent unavailable');
            }
            var payload = parseDraftToEvent(draftText, memberId);
            payload.metadata.human_confirmed = true;
            payload.metadata.confirmed_at = new Date().toISOString();
            if (global.ChurchAuth && ChurchAuth.getSession) {
                var s = ChurchAuth.getSession();
                if (s) payload.metadata.confirmed_by = s.display_name || s.user_id;
            }
            return ChurchDataBridge.appendPastoralEvent(payload);
        }
    };
})(typeof window !== 'undefined' ? window : this);
