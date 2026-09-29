/** 牧養問答：FAQ + 詞彙 + Prompt 複製 */
(function (global) {
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function pick(row, base) {
    return global.B100CoachI18n.pickField(row, base);
  }

  function dataPrefix() {
    return (location.pathname || '').indexOf('/pages/') >= 0 ? '../data/' : 'data/';
  }

  function loadFaq() {
    if (global.B100_DATA && global.B100_DATA.coachFaq) {
      return Promise.resolve(global.B100_DATA.coachFaq);
    }
    return fetch(dataPrefix() + 'coach_faq.json').then(function (r) { return r.json(); });
  }

  function loadGlossary() {
    if (global.B100_DATA && global.B100_DATA.coachGlossary) {
      return Promise.resolve(global.B100_DATA.coachGlossary);
    }
    return fetch(dataPrefix() + 'coach_glossary.json').then(function (r) { return r.json(); });
  }

  function readerLink(item) {
    if (!item.bookId) return '#';
    var loc = global.B100CoachI18n.locale();
    return 'bible66.html?book=' + item.bookId + '&chapter=' + (item.chapter || 1) +
      (item.verse ? '&verse=' + item.verse : '') + '&locale=' + loc;
  }

  function init() {
    var t = global.B100CoachI18n.t;
    document.documentElement.lang = global.B100CoachI18n.locale() === 'zh-Hant' ? 'zh-Hant' : global.B100CoachI18n.locale();
    var q = new URLSearchParams(location.search);
    var ref = q.get('ref') || ('Book ' + (q.get('book') || '1') + ' ' + (q.get('chapter') || '1'));
    var ask = document.getElementById('qnaAsk');
    if (ask && q.get('book')) {
      ask.placeholder = t('ask_placeholder');
    }

    Promise.all([loadFaq(), loadGlossary()]).then(function (arr) {
      var faq = arr[0];
      var glossary = arr[1];
      var faqRoot = document.getElementById('qnaFaq');
      if (faqRoot) {
        faqRoot.innerHTML = (faq.items || []).map(function (item) {
          return '<details><summary>' + esc(pick(item, 'q')) + '</summary><p>' + esc(pick(item, 'a')) + '</p></details>';
        }).join('');
      }
      var glRoot = document.getElementById('qnaGlossary');
      if (glRoot) {
        glRoot.innerHTML = (glossary.items || []).map(function (item) {
          return '<div class="coach-block"><strong>' + esc(pick(item, 'term')) + '</strong> — ' +
            esc(pick(item, 'def')) +
            ' <a href="' + esc(readerLink(item)) + '">→</a></div>';
        }).join('');
      }
    });

    var copyBtn = document.getElementById('qnaCopyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var question = (document.getElementById('qnaAsk') || {}).value || '';
        var prompt = global.B100PromptGuardrails.generateQnaPrompt({
          locale: global.B100CoachI18n.locale(),
          ref: ref,
          question: question,
          persona: q.get('persona') || 'adult',
        });
        navigator.clipboard.writeText(prompt).then(function () {
          copyBtn.textContent = t('copied');
          setTimeout(function () { copyBtn.textContent = t('copy_prompt'); }, 2000);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
