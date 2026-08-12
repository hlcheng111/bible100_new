# -*- coding: utf-8 -*-
"""W5e：文件／CRM 尾頁輕量報告入口。"""
from pathlib import Path

CM = Path(__file__).resolve().parents[1]

PAGES = [
    ("modules/innovation/digital-transformation.html", "../../js/cm_report_utils.js", "digital-transform"),
    ("modules/innovation/technology-apps.html", "../../js/cm_report_utils.js", "tech-apps"),
    ("modules/innovation/smart-tools-dev.html", "../../js/cm_report_utils.js", "smart-tools"),
    ("modules/innovation/best-practices.html", "../../js/cm_report_utils.js", "best-practices"),
    ("vision_and_plan.html", "js/cm_report_utils.js", "vision-plan"),
    ("roadmap-overview.html", "js/cm_report_utils.js", "roadmap"),
    ("ai-and-compliance.html", "js/cm_report_utils.js", "ai-compliance"),
    ("guide_crm_journey_hub.html", "js/cm_report_utils.js", "crm-hub"),
    ("guide_crm_trial_30min.html", "js/cm_report_utils.js", "crm-trial"),
]

BAR = """
<div id="w5eDocBar" style="padding:8px 14px;background:#fefce8;border-bottom:1px solid #fde68a;font-size:12px;">
  <strong>長執報告</strong>
  <button type="button" onclick="exportW5eDocMetaCsv()" data-w5-report="{mid}-csv">⬇ 頁面摘要 CSV</button>
  <button type="button" onclick="printW5eDocMeta()" data-w5-report="{mid}-print">🖨 列印摘要</button>
</div>
"""

JS = """
<script>
(function(){
  function metaRows(){
    var title = document.title || '';
    var h1 = (document.querySelector('h1') || {}).textContent || '';
    return [
      ['title', title],
      ['h1', h1],
      ['path', location.pathname],
      ['exportedAt', new Date().toISOString()]
    ];
  }
  window.exportW5eDocMetaCsv = function(){
    var lines = ['field,value'];
    metaRows().forEach(function(r){
      var esc = window.CmReportUtils ? CmReportUtils.csvEsc : function(v){ return v; };
      lines.push(esc(r[0]) + ',' + esc(r[1]));
    });
    if (window.CmReportUtils) CmReportUtils.downloadCsv('page_meta_{mid}.csv', lines);
  };
  window.printW5eDocMeta = function(){
    if (window.CmReportUtils) CmReportUtils.printTable(document.title || '頁面摘要', ['欄位','內容'], metaRows());
    else window.print();
  };
})();
</script>
"""


def patch(rel: str, utils: str, mid: str) -> None:
    path = CM / rel
    if not path.is_file():
        print("skip missing", rel)
        return
    t = path.read_text(encoding="utf-8")
    if f'data-w5-report="{mid}-csv"' in t:
        print("ok", rel)
        return
    import re
    bar = BAR.replace("{mid}", mid)
    js = JS.replace("{mid}", mid)
    utils_snip = f'<!-- b100-w5-report-utils -->\n<script src="{utils}"></script>\n'
    if "cm_report_utils.js" not in t:
        if "</body>" in t:
            t = t.replace("</body>", utils_snip + js + "</body>", 1)
        else:
            t += utils_snip + js
    else:
        if "exportW5eDocMetaCsv" not in t:
            t = t.replace("</body>", js + "</body>", 1)
    if 'id="w5eDocBar"' not in t:
        t = re.sub(r"(<body[^>]*>)", r"\1\n" + bar, t, count=1)
    path.write_text(t, encoding="utf-8", newline="\n")
    print("patched", rel)


def main():
    for rel, utils, mid in PAGES:
        patch(rel, utils, mid)


if __name__ == "__main__":
    main()
