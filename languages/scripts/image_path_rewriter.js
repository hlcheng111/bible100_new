// Image Path Rewriter for standalone chapter pages
(function() {
  // 自动检测当前页面相对于 languages/ 的深度
  function detectRelativePath() {
    const path = window.location.pathname || '';
    // 匹配 languages/{lang}/{NT|OT}/chapters/ 或类似结构
    const match = path.match(/\/languages\/[^/]+\/(NT|OT|T4)\/chapters\//i);
    if (match) {
      return '../../../images/'; // 从 chapters/ 往上3级到 languages/，再进 images/
    }
    // 匹配 languages/{lang}/{NT|OT}/advance/ 或类似结构
    const advMatch = path.match(/\/languages\/[^/]+\/(NT|OT|T4)\/advance\//i);
    if (advMatch) {
      return '../../../images/'; // 从 advance/ 往上3级到 languages/，再进 images/
    }
    // 默认回退（适用于其他位置）
    return '../../images/';
  }

  const IMAGES_BASE = detectRelativePath();
  const MEDIA_BASE = '../../media/images/'; // 從 chapters/ 或 advance/ 往上2級到 vi/，再進 media/images/

  function normalizePath(p) {
    try { return decodeURI(p); } catch(e) { return p; }
  }

  function getFileName(p) {
    const s = (p || '').replace(/\\/g,'/');
    const q = s.split('?')[0].split('#')[0];
    const parts = q.split('/');
    return parts[parts.length - 1] || '';
  }

  function rewriteOne(img) {
    const raw = img.getAttribute('src') || '';
    const src = normalizePath(raw);
    const lower = src.toLowerCase();

    // 模式1: 旧的 My Webs / OneDrive 本地路径 -> image_NT/ 或 image_OT/
    const hitNT = lower.includes('my webs/bible100_nt/image_nt/') ||
                  lower.includes('my%20webs/bible100_nt/image_nt/') ||
                  (lower.includes('onedrive') && lower.includes('image_nt/')) ||
                  lower.includes('/image_nt/');
    const hitOT = lower.includes('my webs/bible100_nt/image_ot/') ||
                  lower.includes('my%20webs/bible100_nt/image_ot/') ||
                  (lower.includes('onedrive') && lower.includes('image_ot/')) ||
                  lower.includes('bible100_ot/image_ot/') ||
                  lower.includes('/image_ot/');

    // 模式2: vi/OT/chapters/BT01OT1*.files/ (my 引用 vi) -> media/images/OT1_ref/
    const viOtFilesMatch = src.match(/\/vi\/OT\/chapters\/[^/]+\.files\/([^/]+\.(?:png|jpe?g|gif|webp|bmp))$/i);
    if (viOtFilesMatch) {
      const fileName = viOtFilesMatch[1];
      const newPath = MEDIA_BASE + 'OT1_ref/' + fileName;
      if (img.getAttribute('src') !== newPath) {
        img.setAttribute('src', newPath);
      }
      return;
    }

    // 模式2b: 相對路徑 BT01OT1*.files/xxx (vi/OT/chapters 頁內) -> media/images/OT1_ref/ (PC + 雲端一勞永逸)
    const bt01OtFilesMatch = src.match(/BT01OT1[^.]*\.files\/([^/]+\.(?:png|jpe?g|gif|webp|bmp))$/i);
    if (bt01OtFilesMatch) {
      const fileName = bt01OtFilesMatch[1];
      const newPath = MEDIA_BASE + 'OT1_ref/' + fileName;
      if (img.getAttribute('src') !== newPath) {
        img.setAttribute('src', newPath);
      }
      return;
    }

    // 模式3: whole_book 相关路径 -> 对应的 .files 文件夹
    const wholeBookMatch = src.match(/(NT1_O_whole_book_v0_cn2en|NT1_O_whole_book_v0|OT1_O_whole_book_v0_cn2en_1|OT1_O_whole_book_v0)\.files\/([\w\-\.]+)$/i);
    
    if (wholeBookMatch) {
      // 处理 whole_book 路径
      const folderName = wholeBookMatch[1] + '.files';
      const fileName = wholeBookMatch[2];
      const newPath = IMAGES_BASE + folderName + '/' + fileName;
      if (img.getAttribute('src') !== newPath) {
        img.setAttribute('src', newPath);
      }
    } else if (hitNT || hitOT || lower.startsWith('file:///')) {
      // 处理旧的 image_nt/image_ot 路径
      const fname = getFileName(src);
      if (!fname) return;
      if (!/\.(png|jpe?g|gif|webp|bmp)$/i.test(fname)) return;

      // 圖檔在 image_OT / image_NT 根目錄（已移除 FrontPage 遺留的 _vti_cnf 重複副本）
      const target = MEDIA_BASE + (hitOT ? 'image_OT/' : 'image_NT/') + fname;
      if (img.getAttribute('src') !== target) {
        img.setAttribute('src', target);
      }
    }
  }

  function rewriteAll(doc) {
    if (!doc) return;
    doc.querySelectorAll('img').forEach(rewriteOne);

    const mo = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node && node.tagName === 'IMG') rewriteOne(node);
          if (node && node.querySelectorAll) node.querySelectorAll('img').forEach(rewriteOne);
        });
      });
    });
    mo.observe(doc.body || doc.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { rewriteAll(document); });
  } else {
    rewriteAll(document);
  }
})();


