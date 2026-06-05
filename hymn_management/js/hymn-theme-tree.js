/**
 * 神學主題三層 Accordion 選單
 * 載入 hymn-themes.json + source-hymns.json，渲染可摺疊選單
 */

class HymnThemeTree {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.basePath = options.basePath || '';
        this.themes = null;
        this.hymnsMap = {};
    }

    async load() {
        const base = this.basePath || (typeof window !== 'undefined' && (window.location.pathname.replace(/\/[^/]*$/, '') || '.'));
        const baseUrl = typeof window !== 'undefined' ? window.location.href : '';
        try {
            const themesUrl = baseUrl ? new URL('data/hymn-themes.json', baseUrl).href : (base + '/data/hymn-themes.json');
            const hymnsUrl = baseUrl ? new URL('data/source-hymns.json', baseUrl).href : (base + '/data/source-hymns.json');
            const hymnsLoader = typeof window.loadSourceHymns === 'function'
                ? window.loadSourceHymns()
                : fetch(hymnsUrl).then(r => r.ok ? r.json() : null);
            const [themesRes, data] = await Promise.all([
                fetch(themesUrl),
                hymnsLoader
            ]);
            if (themesRes.ok) this.themes = (await themesRes.json()).themes;
            if (data && data.hymns) {
                data.hymns.forEach(h => { this.hymnsMap[h.id] = h; });
            }
        } catch (e) {
            console.error('HymnThemeTree 載入失敗:', e);
        }
        return { themes: this.themes, hymnsMap: this.hymnsMap };
    }

    getHymnTitle(hymnId) {
        const h = this.hymnsMap[hymnId];
        return h ? (h.title_zh || h.title_en || hymnId) : hymnId;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        if (!this.themes || this.themes.length === 0) {
            container.innerHTML = '<div class="theme-tree-empty" style="padding:10px;color:#666;font-size:11px;">尚無神學主題資料</div>';
            return;
        }

        let html = '<div class="theme-tree">';
        this.themes.forEach(theme => {
            html += this.renderTheme(theme);
        });
        html += '</div>';
        container.innerHTML = html;
        this.attachEvents();
    }

    renderTheme(theme) {
        let html = `
          <div class="theme-level1" data-theme-id="${theme.id}">
            <div class="theme-header" role="button" tabindex="0">
              <span class="theme-toggle">▼</span>
              <span class="theme-name">${theme.name}</span>
            </div>
            <div class="theme-body">
        `;
        (theme.categories || []).forEach(cat => {
            html += this.renderCategory(theme, cat);
        });
        html += '</div></div>';
        return html;
    }

    renderCategory(theme, category) {
        let html = `
          <div class="theme-level2" data-category-id="${category.id}">
            <div class="category-header" role="button" tabindex="0">
              <span class="category-toggle">▶</span>
              <span class="category-name">${category.name}</span>
            </div>
            <ul class="category-body hymn-list" style="display:none">
        `;
        (category.hymnIds || []).forEach(hymnId => {
            const title = this.getHymnTitle(hymnId);
            html += `<li class="hymn-item" data-hymn-id="${hymnId}">${title}</li>`;
        });
        html += '</ul></div>';
        return html;
    }

    attachEvents() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.querySelectorAll('.theme-header').forEach(el => {
            el.addEventListener('click', () => this.toggleTheme(el));
        });
        container.querySelectorAll('.category-header').forEach(el => {
            el.addEventListener('click', () => this.toggleCategory(el));
        });
        container.querySelectorAll('.hymn-item').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onHymnClick(el.dataset.hymnId);
            });
        });
    }

    toggleTheme(header) {
        const parent = header.closest('.theme-level1');
        const body = parent.querySelector('.theme-body');
        const toggle = header.querySelector('.theme-toggle');
        const isOpen = body.style.display !== 'none';
        body.style.display = isOpen ? 'none' : 'block';
        toggle.textContent = isOpen ? '▶' : '▼';
    }

    toggleCategory(header) {
        const parent = header.closest('.theme-level2');
        const body = parent.querySelector('.category-body');
        const toggle = header.querySelector('.category-toggle');
        const isOpen = body.style.display !== 'none';
        body.style.display = isOpen ? 'none' : 'block';
        toggle.textContent = isOpen ? '▶' : '▼';
    }

    onHymnClick(hymnId) {
        const url = 'hymn_learner.html?id=' + encodeURIComponent(hymnId);
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'navigate', url }, '*');
        } else {
            window.location.href = url;
        }
    }
}

if (typeof window !== 'undefined') {
    window.HymnThemeTree = HymnThemeTree;
}
