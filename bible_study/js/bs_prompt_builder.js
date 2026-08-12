/**
 * BS-W3：Prompt 模板組裝（無 API · 複製到剪貼板）
 * 規格：docs/PROMPT_TEMPLATES_P3.md
 */
(function (global) {
    'use strict';

    var GUARDRAILS =
        '【護欄】\n' +
        '1. 只根據上方「經文原文」與「註釋摘錄」回答；不可編造經文或出處。\n' +
        '2. 不確定時請明說「需查證」，並建議查考哪些經文或工具。\n' +
        '3. 你是備課草稿助手，不是權威釋經；結論須由教師／牧者審核。\n' +
        '4. 若問題涉及教派爭議，列舉主流理解並標註差異，不做定論。';

    var TEMPLATE_LABELS = {
        'PT-01': '備課三問',
        'PT-02': '對照差異',
        'PT-04': '難題銜接',
        'PT-05': '小語種橋接（VI/ID 草稿）'
    };

    function trimExcerpt(text, max) {
        max = max || 800;
        if (!text) return '';
        var t = String(text).replace(/\s+/g, ' ').trim();
        return t.length <= max ? t : t.slice(0, max) + '…';
    }

    async function scriptureBlock(versionKey, bookId, chapter, bookName) {
        if (global.BibleEngine && global.BibleEngine.getBibleChapterRows) {
            try {
                var rows = await global.BibleEngine.getBibleChapterRows(versionKey, bookId, chapter);
                if (rows && rows.length) {
                    return rows.map(function (v) {
                        return (v.Verse || v.verse) + ' ' + (v.Text || v.text || '');
                    }).join('\n');
                }
            } catch (e) { /* fall through */ }
        }
        var ref = (bookName || ('書卷' + bookId)) + ' 第' + chapter + '章';
        return (
            '（本地未載入經文 JSON；請先閱讀右欄 CMC 釋經「' + ref +
            '」，或自行貼上本段經文後再送 AI）'
        );
    }

    async function commentaryExcerpt(bookId, chapter) {
        if (!global.BibleEngine || !global.BS_DATA_REGISTRY) return '';
        try {
            var entry = (global.BS_DATA_REGISTRY.commentaries || []).find(function (c) {
                return c.key === 'comprehensive';
            });
            if (entry) {
                var meta = (global.BibleEngine.db.commentaries || {}).comprehensive;
                if (!meta || !meta.loaded) await global.BibleEngine.loadEntry('commentaries', entry);
            }
            var items = await global.BibleEngine.queryCommentary('comprehensive', bookId, chapter);
            if (!items || !items.length) return '';
            return trimExcerpt(items.map(function (c) { return c.content; }).join('\n\n'));
        } catch (e) {
            return '';
        }
    }

    function versionLabel(key) {
        var list = (global.BS_DATA_REGISTRY && global.BS_DATA_REGISTRY.bibles) || [];
        var hit = list.find(function (b) { return b.key === key; });
        return hit ? hit.name : key;
    }

    async function buildContext(ctx) {
        ctx = ctx || {};
        var bookId = ctx.bookId || 1;
        var chapter = ctx.chapter || 1;
        var bookName = ctx.bookName;
        if (!bookName && global.StudyState) {
            bookName = global.StudyState.get().bookName;
        }
        if (!bookName && global.BS_QnaBridge) {
            bookName = global.BS_QnaBridge.BOOK_NAMES[bookId];
        }
        var versionKey = ctx.versionKey || 'faith';
        var versionB = ctx.versionKeyB || 'niv';
        var cmcMode = ctx.commentarySource === 'cmc';
        var scripture = await scriptureBlock(versionKey, bookId, chapter, bookName);
        var scriptureB = ctx.templateId === 'PT-02'
            ? await scriptureBlock(versionB, bookId, chapter, bookName)
            : '';
        var comm = cmcMode ? '' : await commentaryExcerpt(bookId, chapter);
        if (cmcMode && !comm) {
            comm = '（釋經見右欄 CMC 原站；可複製關鍵段落貼入 AI 對話）';
        }
        var qnaUrl = global.BS_QnaBridge
            ? global.BS_QnaBridge.buildQnaUrl(bookId, chapter, { bookName: bookName })
            : '';
        var qnaLinks = qnaUrl ? '- ' + qnaUrl : '（同章難題連結尚未設定）';
        return {
            book_chapter: bookName + ' 第' + chapter + '章',
            verse_range: ctx.verseRange || '',
            scripture_text: scripture,
            version_label: versionLabel(versionKey),
            version_a: versionLabel(versionKey),
            version_b: versionLabel(versionB),
            text_a: scripture,
            text_b: scriptureB,
            commentary_excerpt: comm,
            qna_links: qnaLinks,
            guardrails: GUARDRAILS,
            target_lang: ctx.targetLang || '越南文或印尼文',
            teaching_goal: ctx.teachingGoal || '主日學查經討論',
            outline_cn: ctx.outlineCn || ''
        };
    }

    function renderTemplate(id, c) {
        if (id === 'PT-01') {
            return (
                '你是華語主日學備課助手。以下為經文與背景，請產出「觀察 3 問、解釋 3 問、應用 3 問」。\n\n' +
                '【經文】' + c.version_label + ' · ' + c.book_chapter + c.verse_range + '\n' +
                c.scripture_text + '\n\n' +
                (c.commentary_excerpt ? '【註釋摘錄（若有）】\n' + c.commentary_excerpt + '\n\n' : '') +
                c.guardrails + '\n\n' +
                '請用繁體中文，每問一句話，適合成人主日學小組。'
            );
        }
        if (id === 'PT-02') {
            return (
                '你是譯本對照助手。請比較以下同一章節不同譯本用詞差異，並指出可能的神學或語意重點（標「需查證」處）。\n\n' +
                '【書卷章節】' + c.book_chapter + '\n\n' +
                '【譯本 A · ' + c.version_a + '】\n' + c.text_a + '\n\n' +
                '【譯本 B · ' + c.version_b + '】\n' + c.text_b + '\n\n' +
                c.guardrails + '\n\n' +
                '輸出：① 關鍵差異表（≤5 項）② 帶領討論問題 3 則'
            );
        }
        if (id === 'PT-04') {
            return (
                '你是查經討論引導助手。使用者將先閱讀下列平台內「難題 Q&A」連結（請勿取代官方答案）。\n\n' +
                '【本段經文】' + c.book_chapter + '\n' + c.scripture_text + '\n\n' +
                '【相關難題（請先讀）】\n' + c.qna_links + '\n\n' +
                c.guardrails + '\n\n' +
                '請在**不重複官方答案全文**的前提下：① 摘要爭點 ② 提出 3 个延伸思考问题 ③ 建议进一步查考的经文'
            );
        }
        if (id === 'PT-05') {
            return (
                '你是跨語言備課助手。以下中文经课材料为**正式源文**；请产出' + c.target_lang + '的**讨论提纲草稿**（非正式译本）。\n\n' +
                '【中文经课目标】' + c.teaching_goal + '\n\n' +
                '【中文经文】\n' + c.scripture_text + '\n\n' +
                (c.outline_cn ? '【中文大纲（若有）】\n' + c.outline_cn + '\n\n' : '') +
                c.guardrails + '\n\n' +
                '输出要求：\n1. 保留中文书卷名与章节对照表\n2. 目标语言部分标注「待人工校对 · AI 草稿」\n3. 术语表 5–10 项（中→目标语）'
            );
        }
        return '';
    }

    async function build(templateId, ctx) {
        ctx = ctx || {};
        ctx.templateId = templateId;
        var c = await buildContext(ctx);
        return renderTemplate(templateId, c);
    }

    async function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        return ok;
    }

    async function copyPrompt(templateId, ctx) {
        var text = await build(templateId, ctx);
        await copyText(text);
        return text;
    }

    /** W4：一鍵備課包 = 經文 + 註釋 + QnA + PT-01 框架 + 護欄 */
    async function buildLessonPack(ctx) {
        ctx = ctx || {};
        ctx.templateId = 'PT-01';
        var c = await buildContext(ctx);
        var lines = [
            '=== Bible100 備課包（AI 草稿 · 須人審）===',
            '',
            '【章節】' + c.book_chapter,
            '【譯本】' + c.version_label,
            '',
            '--- 經文 ---',
            c.scripture_text,
            ''
        ];
        if (c.commentary_excerpt) {
            lines.push('--- 釋經 / 註釋 ---', c.commentary_excerpt, '');
        } else {
            lines.push('--- 釋經 / 註釋 ---', '（請從右欄 CMC 複製摘錄，或見同章難題連結）', '');
        }
        lines.push('--- 同章難題（請先閱讀）---', c.qna_links, '');
        lines.push('--- 請 AI 依上文產出：觀察 3 問、解釋 3 問、應用 3 問 ---', '');
        lines.push(c.guardrails);
        lines.push('', '請用繁體中文，每問一句話，適合成人主日學小組。');
        return lines.join('\n');
    }

    async function copyLessonPack(ctx) {
        var text = await buildLessonPack(ctx);
        await copyText(text);
        return text;
    }

    function mountLessonPackButton(container, getContextFn) {
        if (!container) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-btn bs-lesson-pack-btn';
        btn.textContent = '📋 備課包';
        btn.title = '一鍵複製：經文 + 註釋 + 難題連結 + 備課三問框架';
        btn.addEventListener('click', async function () {
            btn.disabled = true;
            var prev = btn.textContent;
            btn.textContent = '組裝中…';
            try {
                var ctx = typeof getContextFn === 'function' ? getContextFn() : {};
                await copyLessonPack(ctx);
                btn.textContent = '已複製';
            } catch (e) {
                alert('備課包失敗：' + (e.message || e));
                btn.textContent = prev;
            }
            setTimeout(function () { btn.textContent = prev; btn.disabled = false; }, 1500);
        });
        container.appendChild(btn);
    }

    function mountSelect(container, getContextFn, onCopied) {
        if (!container) return;
        var wrap = document.createElement('span');
        wrap.className = 'bs-prompt-wrap';
        wrap.style.display = 'inline-flex';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '4px';
        var sel = document.createElement('select');
        sel.className = 'bs-prompt-select';
        sel.style.fontSize = '11px';
        sel.style.padding = '3px 4px';
        sel.style.borderRadius = '3px';
        var opt0 = document.createElement('option');
        opt0.value = '';
        opt0.textContent = '📋 AI Prompt…';
        sel.appendChild(opt0);
        Object.keys(TEMPLATE_LABELS).forEach(function (id) {
            var o = document.createElement('option');
            o.value = id;
            o.textContent = TEMPLATE_LABELS[id];
            sel.appendChild(o);
        });
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-btn';
        btn.textContent = '複製';
        btn.style.fontSize = '11px';
        btn.style.padding = '4px 8px';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', async function () {
            var id = sel.value;
            if (!id) { alert('請先選擇 Prompt 模板'); return; }
            btn.disabled = true;
            btn.textContent = '組裝中…';
            try {
                var ctx = typeof getContextFn === 'function' ? getContextFn() : {};
                await copyPrompt(id, ctx);
                btn.textContent = '已複製';
                if (typeof onCopied === 'function') onCopied(id);
                setTimeout(function () { btn.textContent = '複製'; btn.disabled = false; }, 1500);
            } catch (err) {
                alert('複製失敗：' + (err.message || err));
                btn.textContent = '複製';
                btn.disabled = false;
            }
        });
        wrap.appendChild(sel);
        wrap.appendChild(btn);
        container.appendChild(wrap);
    }

    global.BS_PromptBuilder = {
        GUARDRAILS: GUARDRAILS,
        TEMPLATE_LABELS: TEMPLATE_LABELS,
        build: build,
        buildLessonPack: buildLessonPack,
        copyPrompt: copyPrompt,
        copyLessonPack: copyLessonPack,
        mountSelect: mountSelect,
        mountLessonPackButton: mountLessonPackButton
    };
})(typeof window !== 'undefined' ? window : this);
