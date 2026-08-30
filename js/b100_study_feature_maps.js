/**
 * 圣经研读 · 功能地图数据 + 自动挂载到 #b100StudyFeatureMap / #b100StudySearchMap
 */
(function (global) {
  'use strict';

  var FEATURE_ROWS = [
    {
      entry: '🌐 多语查经',
      href: 'bible_app/shell/pages/reader-multilang.html',
      does: '对照读经文（默认 2 语，可开 4 语）',
      source: 'bible_reader.db',
      tip: '日常读正文；顶栏 🌐 全站可进',
      tone: 'read',
    },
    {
      entry: '🦁 圣经跑道',
      href: 'bible_app/shell/pages/landing.html',
      does: '计划读经、打卡、四语并排',
      source: 'bible_reader.db',
      tip: '带班首选；有进度金星',
      tone: 'track',
    },
    {
      entry: '📖 释经参读',
      href: 'bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1',
      does: '章注释、背景（CMC）',
      source: 'CMC 外站 + 桥接',
      tip: '多语页可一键跳同章；须人审',
      tone: 'understand',
    },
    {
      entry: '🔍 搜经',
      href: 'bible_study/search_reader.html',
      does: '经文字关键词全文搜',
      source: 'JSON 译本 + FTS',
      tip: '找「爱」「John」；下期接 DB',
      tone: 'search',
    },
    {
      entry: '📂 目录搜',
      href: 'nav_hub/search/dashboard.html',
      does: '找功能入口、课名',
      source: 'search_indexes',
      tip: '不是经文字；顶栏 🔍 同款',
      tone: 'meta',
    },
    {
      entry: '🗺️ 地理历史',
      href: 'bible_study/_landing/geography_history.html',
      does: '时间轴、地名、地图',
      source: '站内侧栏数据',
      tip: '「境」那一阶',
      tone: 'geo',
    },
  ];

  var SEARCH_ROWS = [
    {
      entry: '指定经节（创 5:3）',
      does: '多语查经',
      source: '书+章+节 · 四语对照',
      tip: '不能搜注释、站点菜单',
      tone: 'read',
    },
    {
      entry: '经里某个词（「爱」）',
      does: '搜经（本页）',
      source: '经文字 · JSON/FTS',
      tip: '不能搜注释；中文搜中文、英文搜英文',
      tone: 'search',
    },
    {
      entry: '功能页（排班、Q&A）',
      does: '目录搜 / 顶栏 🔍',
      source: '页面标题、课名、工具名',
      tip: '不能搜经文字',
      tone: 'meta',
    },
    {
      entry: '注释、背景',
      does: '释经参读',
      source: 'CMC 外站章注释',
      tip: '不能全文搜；须人审',
      tone: 'understand',
    },
    {
      entry: '难题、证道素材',
      does: 'Q&A 模式',
      source: 'qna 专题',
      tip: '不是逐节经文对照',
      tone: 'understand',
    },
    {
      entry: '人物名（大卫）',
      does: '搜经（当关键词）',
      source: '出现在经文里的名字',
      tip: '人物专题表 = 二期规划',
      tone: 'warn',
    },
  ];

  function rootPrefix() {
    var p = (global.location.pathname || '').replace(/\\/g, '/');
    if (p.indexOf('/bible_study/_landing/') >= 0) return '../../';
    if (p.indexOf('/bible_app/shell/pages/') >= 0) return '../../../';
    if (p.indexOf('/help/') >= 0) return '../';
    return '';
  }

  function withPrefix(rows) {
    var pre = rootPrefix();
    return rows.map(function (r) {
      var copy = {};
      Object.keys(r).forEach(function (k) { copy[k] = r[k]; });
      if (copy.href && pre && copy.href.indexOf('http') !== 0) {
        copy.href = pre + copy.href;
      }
      return copy;
    });
  }

  function mount() {
    if (!global.B100FeatureMap) return;
    var fEl = global.document.getElementById('b100StudyFeatureMap');
    var sEl = global.document.getElementById('b100StudySearchMap');
    var pre = rootPrefix();
    if (fEl) {
      global.B100FeatureMap.render(fEl, {
        title: '🗺️ 研读功能地图',
        lead: '先读 → 再懂 → 再查。不必一次学完，查经班常「读 + 懂」就够。',
        rows: withPrefix(FEATURE_ROWS),
        footHtml:
          '详细步骤：<a href="' +
          pre +
          'bible_app/shell/pages/reader-multilang-help.html">多语查经 · 使用方法</a>',
      });
    }
    if (sEl) {
      global.B100FeatureMap.render(sEl, {
        title: '🔎 搜查逻辑（你想找…）',
        lead: '用对工具，少绕路。',
        headers: ['你想找…', '用哪个', '能搜到什么', '不能搜什么'],
        rows: SEARCH_ROWS.map(function (r) {
          return {
            entry: r.entry,
            does: r.does,
            source: r.source,
            tip: r.tip,
            tone: r.tone,
          };
        }),
        footHtml:
          '完整地图：<a href="' +
          pre +
          'bible_app/shell/pages/reader-multilang-help.html">多语查经 · 使用方法</a>',
      });
    }
  }

  global.B100StudyFeatureMaps = {
    FEATURE_ROWS: FEATURE_ROWS,
    SEARCH_ROWS: SEARCH_ROWS,
    mount: mount,
  };

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})(typeof window !== 'undefined' ? window : global);
