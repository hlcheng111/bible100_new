/**
 * BS-W3/W4：研讀子頁共用 UI
 */
(function (global) {
    'use strict';

    var CMC_BANNER_HTML =
        '<div class="bs-cmc-banner" role="status">' +
        '<strong>☁️ 雲端釋經補充</strong>：本地綜合解讀不可用；目前為 <strong>CMC 雲端釋經（需連線）</strong>。' +
        '內容供參考，正式教材以本地授權資料為準；結論須由教師／牧者審核。' +
        '</div>';

    function notifyCommentarySource(source) {
        try {
            if (global.parent && global.parent !== global) {
                global.parent.postMessage({ action: 'commentarySource', source: source }, '*');
            }
        } catch (e) {}
    }

    function showCmcBanner(container) {
        if (!container) return;
        var existing = container.querySelector('.bs-cmc-banner');
        if (existing) return;
        container.insertAdjacentHTML('afterbegin', CMC_BANNER_HTML);
        notifyCommentarySource('cmc');
    }

    function hideCmcBanner(container) {
        if (!container) return;
        var b = container.querySelector('.bs-cmc-banner');
        if (b) b.remove();
        notifyCommentarySource('local');
    }

    function maybeMountDebugFooter() {
        var engineer = false;
        try {
            engineer = localStorage.getItem('bible_study_engineer_mode') === '1' ||
                new URLSearchParams(location.search).get('debug') === '1';
        } catch (e) {}
        if (!engineer || !global.BS_getPageMeta) return;
        var file = (location.pathname || '').split('/').pop() || 'page.html';
        var meta = global.BS_getPageMeta(file);
        if (!meta) return;
        if (document.querySelector('.bs-debug-footer')) return;
        var foot = document.createElement('footer');
        foot.className = 'bs-debug-footer';
        foot.textContent = meta.id + ' · ' + file + ' · ' + meta.label;
        document.body.appendChild(foot);
    }

    function syncStudyState(bookId, chapter, bookName, mode) {
        var payload = { book: bookId, chapter: chapter, bookName: bookName };
        if (mode) payload.mode = mode;
        try {
            if (global.parent && global.parent !== global && global.parent.StudyState) {
                if (bookName) global.parent.StudyState.setBookByName(bookName);
                global.parent.StudyState.change(payload);
            } else if (global.StudyState) {
                if (bookName) global.StudyState.setBookByName(bookName);
                global.StudyState.change(payload);
            }
        } catch (e) {}
        try {
            global.parent.postMessage({ action: 'syncPosition', state: payload }, '*');
        } catch (e2) {}
    }

    function wireQnaLink(linkEl, getContextFn) {
        if (!linkEl || !global.BS_QnaBridge) return;
        function refresh() {
            var ctx = typeof getContextFn === 'function' ? getContextFn() : global.BS_QnaBridge.resolveFromPage();
            linkEl.href = global.BS_QnaBridge.buildQnaUrl(ctx.bookId, ctx.chapter, { bookName: ctx.bookName });
            linkEl.title = '換模組 · 聖經難題 Q&A（' + (ctx.bookName || '') + ' 第' + ctx.chapter + '章）';
        }
        refresh();
        linkEl.setAttribute('target', '_blank');
        linkEl.setAttribute('rel', 'noopener noreferrer');
        return refresh;
    }

    function initPage(options) {
        options = options || {};
        if (options.promptContainer && global.BS_PromptBuilder) {
            global.BS_PromptBuilder.mountSelect(options.promptContainer, options.getContext, options.onPromptCopied);
        }
        if (options.lessonPackContainer && global.BS_PromptBuilder) {
            global.BS_PromptBuilder.mountLessonPackButton(options.lessonPackContainer, options.getContext);
        }
        if (options.qnaLink) {
            var refresh = wireQnaLink(options.qnaLink, options.getContext);
            if (refresh && typeof options.onContextChange === 'function') {
                options.onContextChange(refresh);
            }
        }
        if (options.mountDebugFooter !== false) {
            maybeMountDebugFooter();
        }
    }

    global.BSStudyChrome = {
        syncStudyState: syncStudyState,
        wireQnaLink: wireQnaLink,
        showCmcBanner: showCmcBanner,
        hideCmcBanner: hideCmcBanner,
        notifyCommentarySource: notifyCommentarySource,
        maybeMountDebugFooter: maybeMountDebugFooter,
        initPage: initPage
    };
})(typeof window !== 'undefined' ? window : this);
