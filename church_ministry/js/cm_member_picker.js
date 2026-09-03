/**
 * CM 四页共用 · 会友下拉（member_id SSOT）
 * 依赖 ChurchDataBridge.getMembers()
 */
(function (global) {
    'use strict';

    function bridge() {
        return global.ChurchDataBridge || null;
    }

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function getMembersOptions() {
        var b = bridge();
        if (!b || !b.getMembers) return [];
        return (b.getMembers() || []).map(function (m) {
            var id = String(m.memberId != null ? m.memberId : m.id);
            return { id: id, name: m.fullName || m.name || id };
        });
    }

    function fillMemberSelect(sel, selectedId, opts) {
        opts = opts || {};
        if (!sel) return;
        var rows = getMembersOptions();
        var placeholder = opts.placeholder || '— 選擇會友 —';
        sel.innerHTML = '<option value="">' + esc(placeholder) + '</option>' +
            rows.map(function (m) {
                var selAttr = selectedId != null && String(selectedId) === m.id ? ' selected' : '';
                return '<option value="' + esc(m.id) + '"' + selAttr + '>' + esc(m.name) + ' (' + esc(m.id) + ')</option>';
            }).join('');
        if (!rows.length) {
            sel.innerHTML += '<option value="" disabled>（尚無會友 · 請先載入會友種子）</option>';
        }
    }

    function memberNameById(memberId) {
        if (memberId == null || memberId === '') return '';
        var id = String(memberId);
        var rows = getMembersOptions();
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].id === id) return rows[i].name;
        }
        return '';
    }

    function preselectFromQuery(sel, paramName) {
        if (!sel || !global.location || !global.location.search) return;
        try {
            var params = new URLSearchParams(global.location.search);
            var mid = params.get(paramName || 'memberId');
            if (mid) sel.value = mid;
        } catch (e) {}
    }

    global.CmMemberPicker = {
        fillMemberSelect: fillMemberSelect,
        getMembersOptions: getMembersOptions,
        memberNameById: memberNameById,
        preselectFromQuery: preselectFromQuery
    };
})(typeof window !== 'undefined' ? window : this);
