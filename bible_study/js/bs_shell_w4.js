/**
 * BS-W4：index.html 殼 — Topbar 任務鍵、備課包、資料 chip、模式切換
 */
(function (global) {
    'use strict';

    var LS_PASTOR = 'bible_study_pastor_mode';
    var LS_ENGINEER = 'bible_study_engineer_mode';

    function isPastorMode() {
        try { return localStorage.getItem(LS_PASTOR) === '1'; } catch (e) { return false; }
    }

    function isEngineerMode() {
        try {
            if (localStorage.getItem(LS_ENGINEER) === '1') return true;
            return new URLSearchParams(location.search).get('debug') === '1';
        } catch (e2) { return false; }
    }

    function setPastorMode(on) {
        try { localStorage.setItem(LS_PASTOR, on ? '1' : '0'); } catch (e) {}
        refreshChip();
    }

    function setEngineerMode(on) {
        try { localStorage.setItem(LS_ENGINEER, on ? '1' : '0'); } catch (e) {}
        refreshChip();
    }

    var lastStatus = null;
    var commentarySource = 'unknown';

    function openStudyFrame(path) {
        if (typeof global.setContentFrame === 'function') global.setContentFrame(path);
    }

    function openStudyWithState(base, mode) {
        var s = global.StudyState ? global.StudyState.get() : {};
        if (global.StudyState && mode) global.StudyState.change({ mode: mode });
        var url = base;
        if (s.bookName && base.indexOf('comprehensive') >= 0) {
            url += '?book=' + encodeURIComponent(s.bookName);
            if (s.chapter) url += '&chapter=' + s.chapter;
        }
        openStudyFrame(url);
    }

    function openQnaSameChapter() {
        var s = global.StudyState ? global.StudyState.get() : { book: 1, chapter: 1, bookName: '創世記' };
        var u = global.BS_QnaBridge
            ? global.BS_QnaBridge.buildQnaUrl(s.book, s.chapter || 1, { bookName: s.bookName })
            : ('../qna/index.html?cat=A&q=' + encodeURIComponent(s.bookName || ''));
        window.open(u, '_blank', 'noopener');
    }

    async function copyLessonPackFromShell() {
        var btn = document.getElementById('bsLessonPackBtn');
        if (!global.BS_PromptBuilder || !global.BS_PromptBuilder.copyLessonPack) {
            alert('備課包模組未載入');
            return;
        }
        var s = global.StudyState ? global.StudyState.get() : { book: 1, chapter: 1, bookName: '創世記' };
        if (btn) { btn.disabled = true; btn.textContent = '組裝中…'; }
        try {
            await global.BS_PromptBuilder.copyLessonPack({
                bookId: s.book,
                chapter: s.chapter || 1,
                bookName: s.bookName,
                versionKey: 'faith'
            });
            if (btn) btn.textContent = '已複製';
        } catch (err) {
            alert('備課包複製失敗：' + (err.message || err));
            if (btn) btn.textContent = '📋 備課包';
        }
        setTimeout(function () {
            if (btn) { btn.textContent = '📋 備課包'; btn.disabled = false; }
        }, 1600);
    }

    function chipClass(level) {
        if (level === 'green') return 'bs-chip-green';
        if (level === 'yellow') return 'bs-chip-yellow';
        return 'bs-chip-red';
    }

    async function refreshChip() {
        var chip = document.getElementById('bsDataChip');
        if (!chip || !global.BS_DataStatus) return;
        var st = await global.BS_DataStatus.probeCorePaths();
        lastStatus = st;
        chip.className = 'bs-data-chip ' + chipClass(st.level);
        var cloud = commentarySource === 'cmc' ? ' · ☁️釋經雲端' : '';
        var pastor = isPastorMode();
        if (pastor) {
            chip.textContent = (st.level === 'green' ? '🟢' : st.level === 'yellow' ? '🟡' : '🔴') + ' ' + st.label + cloud;
        } else {
            chip.textContent = st.level === 'green' ? '🟢' : st.level === 'yellow' ? '🟡' : '🔴';
        }
        chip.title = st.label + cloud + '（點擊檢查資料；長按切換牧長模式說明）';
    }

    function bindToolsMenu() {
        var btn = document.getElementById('bsToolsMenuBtn');
        var menu = document.getElementById('bsToolsDrop');
        if (!btn || !menu) return;
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            menu.classList.toggle('open');
        });
        document.addEventListener('click', function () { menu.classList.remove('open'); });
        menu.querySelectorAll('[data-bs-frame]').forEach(function (a) {
            a.addEventListener('click', function (ev) {
                ev.preventDefault();
                openStudyFrame(a.getAttribute('data-bs-frame'));
                menu.classList.remove('open');
            });
        });
        var pastorT = document.getElementById('bsTogglePastor');
        var engT = document.getElementById('bsToggleEngineer');
        if (pastorT) {
            pastorT.checked = isPastorMode();
            pastorT.addEventListener('change', function () { setPastorMode(pastorT.checked); });
        }
        if (engT) {
            engT.checked = isEngineerMode();
            engT.addEventListener('change', function () { setEngineerMode(engT.checked); });
        }
    }

    function bindTopbar() {
        var map = {
            bsNavRead: function () { openStudyWithState('reader.html', 'read'); },
            bsNavStudy: function () { openStudyWithState('comprehensive_exegesis_reader.html', 'study'); },
            bsNavCompare: function () { openStudyWithState('parallel_mode_v3.html', 'compare'); },
            bsNavQna: openQnaSameChapter,
            bsLessonPackBtn: copyLessonPackFromShell
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('click', map[id]);
        });
        var chip = document.getElementById('bsDataChip');
        if (chip) {
            chip.addEventListener('click', function () { openStudyFrame('data_sources.html'); });
            var pressTimer;
            chip.addEventListener('mousedown', function () {
                pressTimer = setTimeout(function () {
                    setPastorMode(!isPastorMode());
                    var t = document.getElementById('bsTogglePastor');
                    if (t) t.checked = isPastorMode();
                }, 600);
            });
            chip.addEventListener('mouseup', function () { clearTimeout(pressTimer); });
        }
        bindToolsMenu();
    }

    function initShellW4() {
        bindTopbar();
        refreshChip();
        setInterval(refreshChip, 120000);
        global.addEventListener('message', function (ev) {
            if (!ev.data) return;
            if (ev.data.action === 'commentarySource') {
                commentarySource = ev.data.source || 'unknown';
                refreshChip();
            }
        });
    }

    global.BS_ShellW4 = {
        init: initShellW4,
        isPastorMode: isPastorMode,
        isEngineerMode: isEngineerMode,
        refreshChip: refreshChip
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShellW4);
    } else {
        initShellW4();
    }
})(typeof window !== 'undefined' ? window : this);
