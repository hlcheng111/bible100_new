/**
 * 動態目錄生成器 - 通用版本
 * 適用於所有 chapter 和 advance 頁面
 * 支持多語言和 FrontPage 兼容
 * 若頁面無 tocContainer，會自動在頂部插入「小目錄」區塊
 */

function generateTOC(container) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (!container || headings.length < 2) return false;

    var tocHTML = '';
    headings.forEach(function (heading, index) {
        var id = 'heading-' + index;
        heading.id = id;
        var level = parseInt(heading.tagName.charAt(1), 10);
        var text = heading.textContent.trim();
        if (text.length < 2) return;
        tocHTML += '<a href="#' + id + '" class="toc-item h' + level + '">' + escapeHtml(text) + '</a>';
    });
    container.innerHTML = tocHTML;

    container.querySelectorAll('.toc-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            var target = this.getAttribute('href');
            var el = document.querySelector(target);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
    return true;
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toggleTOC() {
    var content = document.getElementById('tocContent');
    var toggle = document.querySelector('.toc-toggle');
    if (content && toggle) {
        content.classList.toggle('show');
        toggle.classList.toggle('rotated');
    }
}

function handleResize() {
    var toc = document.getElementById('tocContainer');
    if (toc) {
        toc.style.width = window.innerWidth < 768 ? '250px' : '300px';
        toc.style.right = window.innerWidth < 768 ? '10px' : '20px';
    }
}

function checkPageLength() {
    var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    return headings.length >= 2 && document.body.scrollHeight > window.innerHeight * 1.1;
}

function ensureTOCContainer() {
    var container = document.getElementById('tocContent');
    if (container) return container;

    var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length < 2) return null;

    var wrap = document.createElement('div');
    wrap.className = 'mini-toc-wrap';
    wrap.innerHTML =
        '<div class="mini-toc-header" data-toc-toggle><span class="mini-toc-title">小目錄</span> <span class="toc-toggle">▼</span></div>' +
        '<div class="mini-toc-content" id="tocContent"></div>';
    var first = document.body.querySelector('a.back-link, .content, .lesson-header, h1');
    var insertBefore = first && first.parentNode ? first : document.body.firstChild;
    if (insertBefore && insertBefore.parentNode) {
        insertBefore.parentNode.insertBefore(wrap, insertBefore);
    } else {
        document.body.insertBefore(wrap, document.body.firstChild);
    }
    wrap.querySelector('[data-toc-toggle]').onclick = function () {
        document.getElementById('tocContent').classList.toggle('show');
        wrap.querySelector('.toc-toggle').classList.toggle('rotated');
    };
    return document.getElementById('tocContent');
}

function initTOC() {
    if (!checkPageLength()) return;

    var tocContent = document.getElementById('tocContent');
    if (!tocContent) tocContent = ensureTOCContainer();
    if (!tocContent) return;

    var filled = generateTOC(tocContent);
    var tocContainer = document.getElementById('tocContainer');
    if (tocContainer) {
        tocContainer.style.display = filled ? '' : 'none';
    }
    var miniWrap = document.querySelector('.mini-toc-wrap');
    if (miniWrap) {
        miniWrap.style.display = filled ? '' : 'none';
    }
    if (filled) handleResize();
}

document.addEventListener('DOMContentLoaded', initTOC);
window.addEventListener('resize', handleResize);
window.addEventListener('load', initTOC);
