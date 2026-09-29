# -*- coding: utf-8 -*-
"""W5b：敬拜 A 區階段 3 報告入口批次補丁（工程專家決定做滿）。"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CM = ROOT / "church_ministry"

UTILS_TAG = '<!-- b100-w5-report-utils -->'
UTILS_SCRIPT_WORSHIP = (
    UTILS_TAG
    + '\n<script src="../../js/cm_report_utils.js"></script>\n'
)
UTILS_SCRIPT_MEDIA = (
    UTILS_TAG
    + '\n<script src="../../js/cm_report_utils.js"></script>\n'
)


def ensure_utils(text: str, script_snip: str) -> str:
    if "cm_report_utils.js" in text:
        return text
    # insert before first b100-ae or before </body>
    marker = "<!-- b100-ae-worship-w1-shell -->"
    if marker in text:
        return text.replace(marker, script_snip + marker, 1)
    marker2 = "<!-- b100-ae-subpage-shell -->"
    if marker2 in text:
        return text.replace(marker2, script_snip + marker2, 1)
    if "</body>" in text:
        return text.replace("</body>", script_snip + "</body>", 1)
    return text + script_snip


def patch_file(rel: str, transform) -> None:
    path = CM / rel
    raw = path.read_text(encoding="utf-8")
    new = transform(raw)
    if new != raw:
        path.write_text(new, encoding="utf-8", newline="\n")
        print("patched", rel)
    else:
        print("unchanged", rel)


# --- A-07 hospitality ---
def t_hospitality(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    old_btns = """            <div class="header-actions">
                <button onclick="exportData()">📤 导出</button>
                <button onclick="printSchedule()">🖨️ 打印</button>
                <button onclick="location.href='../../index.html'">🏠 返回</button>
            </div>"""
    new_btns = """            <div class="header-actions">
                <button type="button" onclick="exportData()" data-w5-report="hospitality-schedule-csv">⬇ 排班 CSV</button>
                <button type="button" onclick="exportMembersCsv()" data-w5-report="hospitality-members-csv">⬇ 同工 CSV</button>
                <button type="button" onclick="printHospitalityRoster()" data-w5-report="hospitality-print">🖨 列印班表</button>
                <button onclick="location.href='../../index.html'">🏠 返回</button>
            </div>"""
    if old_btns in t:
        t = t.replace(old_btns, new_btns)
    if "printHospitalityRoster" not in t:
        block = r"""
        function csvEsc(v) {
            if (window.CmReportUtils) return CmReportUtils.csvEsc(v);
            var s = v == null ? '' : String(v);
            if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
            return s;
        }
        function downloadCsv(filename, lines) {
            if (window.CmReportUtils) return CmReportUtils.downloadCsv(filename, lines);
            var blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }
        function exportData() {
            var lines = ['date,door,parking,seating,children'];
            (schedule || []).forEach(function (w) {
                lines.push([w.date, (w.door||[]).join('；'), (w.parking||[]).join('；'), (w.seating||[]).join('；'), (w.children||[]).join('；')].map(csvEsc).join(','));
            });
            downloadCsv('hospitality_schedule_' + new Date().toISOString().slice(0,10) + '.csv', lines);
        }
        function exportMembersCsv() {
            var lines = ['name,position,phone,count'];
            (members || []).forEach(function (m) {
                lines.push([m.name, m.position, m.phone || '', m.count || 0].map(csvEsc).join(','));
            });
            downloadCsv('hospitality_members_' + new Date().toISOString().slice(0,10) + '.csv', lines);
        }
        function printHospitalityRoster() {
            var headers = ['日期', '門口', '停車', '帶位', '兒童'];
            var rows = (schedule || []).map(function (w) {
                return [w.date, (w.door||[]).join('、'), (w.parking||[]).join('、'), (w.seating||[]).join('、'), (w.children||[]).join('、')];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('招待事奉班表', headers, rows);
            else window.print();
        }
        function printSchedule() { printHospitalityRoster(); }
"""
        # replace old export/print
        import re
        t2 = re.sub(
            r"function exportData\(\)\s*\{[\s\S]*?function printSchedule\(\)\s*\{\s*window\.print\(\);\s*\}",
            block.strip() + "\n",
            t,
            count=1,
        )
        if t2 == t:
            # append before closing script of main block if regex failed
            if "function printSchedule() { window.print(); }" in t:
                t = t.replace(
                    "function printSchedule() { window.print(); }",
                    block.strip(),
                )
            else:
                t = t.replace("</script>\n\n\n<!-- b100-ae-worship-w1-shell -->", block + "\n</script>\n\n\n<!-- b100-ae-worship-w1-shell -->")
        else:
            t = t2
    return t


# --- A-05 pulpit ---
def t_pulpit(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="pulpit-sermons-csv"' not in t:
        # soft-replace common button patterns
        t = t.replace(
            'onclick="exportData()"',
            'onclick="exportData()" data-w5-report="pulpit-sermons-csv"',
            1,
        )
        t = t.replace(
            'onclick="printSchedule()"',
            'onclick="printSermonRoster()" data-w5-report="pulpit-print"',
            1,
        )
        t = t.replace(
            'onclick="generateReport()"',
            'onclick="generateReport()" data-w5-report="pulpit-report"',
            1,
        )
    if "printSermonRoster" not in t:
        inject = """
        function csvEsc(v) {
            if (window.CmReportUtils) return CmReportUtils.csvEsc(v);
            var s = v == null ? '' : String(v);
            if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
            return s;
        }
        function downloadCsv(filename, lines) {
            if (window.CmReportUtils) return CmReportUtils.downloadCsv(filename, lines);
            var blob = new Blob(['\\ufeff' + lines.join('\\n')], { type: 'text/csv;charset=utf-8' });
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }
        function exportData() {
            var lines = ['week,date,series,title,speaker,scripture,status'];
            (sermons || []).forEach(function (s) {
                lines.push([s.week, s.date, s.series, s.title, s.speaker, s.scripture, s.status].map(csvEsc).join(','));
            });
            downloadCsv('pulpit_sermons_' + new Date().toISOString().slice(0,10) + '.csv', lines);
        }
        function exportSpeakersCsv() {
            var lines = ['name,title,specialty,phone,count'];
            (speakers || []).forEach(function (s) {
                lines.push([s.name, s.title, s.specialty, s.phone, s.count].map(csvEsc).join(','));
            });
            downloadCsv('pulpit_speakers_' + new Date().toISOString().slice(0,10) + '.csv', lines);
        }
        function printSermonRoster() {
            var headers = ['週次','日期','系列','題目','講員','經文','狀態'];
            var rows = (sermons || []).map(function (s) {
                return [s.week, s.date, s.series, s.title, s.speaker, s.scripture, s.status];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('講壇排程', headers, rows);
            else window.print();
        }
        function generateReport() { exportData(); printSermonRoster(); }
        function printSchedule() { printSermonRoster(); }
"""
        # avoid double-escape: write real escapes
        inject = inject.replace("\\ufeff", "\ufeff").replace("\\n", "\n")
        # Replace old function cluster if present
        import re
        m = re.search(
            r"function exportData\(\)\s*\{[\s\S]*?function printSchedule\(\)\s*\{[\s\S]*?\n\s*\}",
            t,
        )
        if m:
            t = t[: m.start()] + inject.strip() + "\n" + t[m.end() :]
        else:
            t = t.replace(
                "<!-- b100-ae-worship-w1-shell -->",
                "<script>\n" + inject + "\n</script>\n<!-- b100-ae-worship-w1-shell -->",
                1,
            )
    return t


# --- A-09 worship team ---
def t_team(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="worship-team-members-csv"' not in t:
        old = """        <div class="w2-toolbar" id="w2Toolbar">
            <strong>W2</strong>
            <button type="button" id="btnLinkMembers">🔗 对齐 memberId（成员+排班）</button>
            <button type="button" id="btnSyncMaster">↗ 同步 churchMasterDatabase</button>
            <span id="w2Status"></span>
        </div>"""
        new = """        <div class="w2-toolbar" id="w2Toolbar">
            <strong>W2</strong>
            <button type="button" id="btnLinkMembers">🔗 对齐 memberId（成员+排班）</button>
            <button type="button" id="btnSyncMaster">↗ 同步 churchMasterDatabase</button>
            <button type="button" onclick="exportTeamMembersCsv()" data-w5-report="worship-team-members-csv">⬇ 成員 CSV</button>
            <button type="button" onclick="exportTeamScheduleCsv()" data-w5-report="worship-team-schedule-csv">⬇ 排班 CSV</button>
            <button type="button" onclick="printTeamRoster()" data-w5-report="worship-team-print">🖨 列印名冊</button>
            <span id="w2Status"></span>
        </div>"""
        t = t.replace(old, new)
    if "exportTeamMembersCsv" not in t:
        inject = """
        function csvEsc(v) {
            if (window.CmReportUtils) return CmReportUtils.csvEsc(v);
            var s = v == null ? '' : String(v);
            if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
            return s;
        }
        function downloadCsv(filename, lines) {
            if (window.CmReportUtils) return CmReportUtils.downloadCsv(filename, lines);
            var blob = new Blob(['\ufeff' + lines.join('\\n')], { type: 'text/csv;charset=utf-8' });
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }
        function exportTeamMembersCsv() {
            var lines = ['id,name,position,memberId,count'];
            (data.members || []).forEach(function (m) {
                lines.push([m.id, m.name, m.position, m.memberId || '', m.count || 0].map(csvEsc).join(','));
            });
            downloadCsv('worship_team_members_' + new Date().toISOString().slice(0,10) + '.csv', lines);
        }
        function exportTeamScheduleCsv() {
            var lines = ['date,lead,keyboard,guitar,drums'];
            (data.schedules || []).forEach(function (s) {
                lines.push([s.date, s.lead, s.keyboard, s.guitar, s.drums].map(csvEsc).join(','));
            });
            downloadCsv('worship_team_schedule_' + new Date().toISOString().slice(0,10) + '.csv', lines);
        }
        function printTeamRoster() {
            var headers = ['姓名','職位','memberId','次數'];
            var rows = (data.members || []).map(function (m) {
                return [m.name, m.position, m.memberId || '', m.count || 0];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('敬拜團隊名冊', headers, rows);
            else window.print();
        }
"""
        inject = inject.replace("\\n", "\n")  # keep real newlines in join - wait we want \\n in JS source as \n
        # Fix: in the blob line we need JS '\n' - write carefully
        inject = """
        function csvEsc(v) {
            if (window.CmReportUtils) return CmReportUtils.csvEsc(v);
            var s = v == null ? '' : String(v);
            if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
            return s;
        }
        function downloadCsv(filename, lines) {
            if (window.CmReportUtils) return CmReportUtils.downloadCsv(filename, lines);
            var blob = new Blob(['\ufeff' + lines.join('\\n')], { type: 'text/csv;charset=utf-8' });
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }
        function exportTeamMembersCsv() {
            var lines = ['id,name,position,memberId,count'];
            (data.members || []).forEach(function (m) {
                lines.push([m.id, m.name, m.position, m.memberId || '', m.count || 0].map(csvEsc).join(','));
            });
            downloadCsv('worship_team_members_' + new Date().toISOString().slice(0,10) + '.csv', lines);
        }
        function exportTeamScheduleCsv() {
            var lines = ['date,lead,keyboard,guitar,drums'];
            (data.schedules || []).forEach(function (s) {
                lines.push([s.date, s.lead, s.keyboard, s.guitar, s.drums].map(csvEsc).join(','));
            });
            downloadCsv('worship_team_schedule_' + new Date().toISOString().slice(0,10) + '.csv', lines);
        }
        function printTeamRoster() {
            var headers = ['姓名','職位','memberId','次數'];
            var rows = (data.members || []).map(function (m) {
                return [m.name, m.position, m.memberId || '', m.count || 0];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('敬拜團隊名冊', headers, rows);
            else window.print();
        }
"""
        # Python string: we need the JS file to contain lines.join('\n')
        inject = inject.replace("lines.join('\\\\n')", "lines.join('\\n')")
        # Actually in the triple-quoted string above I have lines.join('\\n') which becomes lines.join('\n') in output - good for JS
        t = t.replace(
            "        function addSong() { alert('功能完成中'); closeModal(); }",
            "        function addSong() { alert('功能完成中'); closeModal(); }\n"
            + inject,
        )
    return t


# --- A-06 sermon notes ---
def t_sermon_notes(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="sermon-notes-csv"' not in t:
        t = t.replace(
            '<button class="btn" onclick="saveTemplate()">儲存模板</button>',
            '<button class="btn" onclick="saveTemplate()">儲存模板</button>\n'
            '        <button class="btn" type="button" onclick="exportTemplateCsv()" data-w5-report="sermon-notes-csv" style="background:#059669;margin-left:8px;">⬇ CSV</button>\n'
            '        <button class="btn" type="button" onclick="printTemplate()" data-w5-report="sermon-notes-print" style="background:#4b5563;margin-left:8px;">🖨 列印</button>',
        )
    if "exportTemplateCsv" not in t:
        inject = """
        function exportTemplateCsv() {
            var title = document.getElementById('title').value;
            var date = document.getElementById('date').value;
            var outline = document.getElementById('outline').value;
            var lines = ['field,value', 'title,' + (window.CmReportUtils ? CmReportUtils.csvEsc(title) : title),
                'date,' + (window.CmReportUtils ? CmReportUtils.csvEsc(date) : date),
                'outline,' + (window.CmReportUtils ? CmReportUtils.csvEsc(outline) : outline)];
            if (window.CmReportUtils) CmReportUtils.downloadCsv('sermon_notes_template.csv', lines);
        }
        function printTemplate() {
            var title = document.getElementById('title').value;
            var date = document.getElementById('date').value;
            var outline = document.getElementById('outline').value;
            if (window.CmReportUtils) {
                CmReportUtils.printTable('講道筆記模板', ['欄位','內容'], [
                    ['標題', title], ['日期', date], ['大綱', outline]
                ]);
            } else window.print();
        }
"""
        t = t.replace("        loadTemplate();", inject + "\n        loadTemplate();")
    return t


def add_print_helper(t: str, export_fn: str, print_fn: str, title: str, marker: str) -> str:
    """Add printXxx + data-w5 markers near an existing export button."""
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP if "modules/worship" in marker or True else UTILS_SCRIPT_MEDIA)
    return t


# --- generic: mark existing export + add print if missing ---
def generic_mark_and_print(
    t: str,
    *,
    utils_path: str,
    export_onclick: str,
    csv_marker: str,
    print_fn: str,
    print_marker: str,
    print_btn_html: str,
    inject_print_js: str,
    after_fn_needle: str | None = None,
) -> str:
    snip = UTILS_TAG + f'\n<script src="{utils_path}"></script>\n'
    t = ensure_utils(t, snip)
    if csv_marker not in t and export_onclick in t:
        t = t.replace(
            export_onclick,
            export_onclick.replace("onclick=", f'data-w5-report="{csv_marker}" onclick=', 1)
            if "data-w5-report" not in export_onclick
            else export_onclick,
            1,
        )
        # simpler: add attribute into the button tag containing export
        import re

        def add_attr(m):
            tag = m.group(0)
            if "data-w5-report" in tag:
                return tag
            return tag.replace("<button", f'<button data-w5-report="{csv_marker}"', 1)

        t = re.sub(
            rf"<button[^>]*{re.escape(export_onclick)}[^>]*>",
            add_attr,
            t,
            count=1,
        )
    if print_fn not in t:
        # insert print button after first export button close
        if print_btn_html not in t and export_onclick in t:
            # find export button end
            idx = t.find(export_onclick)
            if idx > 0:
                end = t.find("</button>", idx)
                if end > 0:
                    t = t[: end + 9] + "\n                " + print_btn_html + t[end + 9 :]
        if after_fn_needle and after_fn_needle in t:
            t = t.replace(after_fn_needle, after_fn_needle + "\n" + inject_print_js, 1)
        elif "</script>" in t and inject_print_js.strip() not in t:
            # insert before last main page script close is hard; put before utils shell
            t = t.replace(
                UTILS_TAG,
                "<script>\n" + inject_print_js + "\n</script>\n" + UTILS_TAG,
                1,
            )
    return t


def t_song_library(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="song-library-csv"' not in t:
        t = t.replace(
            'onclick="exportSongs()"',
            'onclick="exportSongs()" data-w5-report="song-library-csv"',
            1,
        )
    if "printSongLibrary" not in t:
        btn = '<button class="btn btn-secondary" type="button" onclick="printSongLibrary()" data-w5-report="song-library-print">🖨 列印</button>'
        if "exportSongs()" in t and btn not in t:
            t = t.replace(
                '<button class="btn btn-secondary" onclick="exportSongs()" data-w5-report="song-library-csv">📥 導出詩歌</button>',
                '<button class="btn btn-secondary" onclick="exportSongs()" data-w5-report="song-library-csv">📥 導出詩歌</button>\n                '
                + btn,
            )
        inject = """
        function printSongLibrary() {
            var list = (typeof customSongs !== 'undefined' ? customSongs : []).concat(typeof seedSongs !== 'undefined' ? seedSongs : []);
            if (!list.length && typeof songs !== 'undefined') list = songs;
            var headers = ['歌名','調','分類','備註'];
            var rows = (list || []).map(function (s) {
                return [s.name || s.title, s.key, s.category || s.genre, s.note || s.lyrics || ''];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('詩歌庫', headers, rows);
            else window.print();
        }
"""
        t = t.replace(
            "        function exportSongs()",
            inject + "\n        function exportSongs()",
            1,
        )
    return t


def t_worship_mgmt(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="worship-mgmt-csv"' not in t:
        t = t.replace(
            'onclick="exportWorshipData()"',
            'onclick="exportWorshipData()" data-w5-report="worship-mgmt-csv"',
            1,
        )
    if "printWorshipLiturgy" not in t:
        inject = """
        function printWorshipLiturgy() {
            var headers = ['日期','主題','講員','狀態'];
            var rows = (typeof worshipData !== 'undefined' ? worshipData : []).map(function (w) {
                return [w.date, w.theme || w.title, w.speaker, w.status];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('崇拜禮儀／場次', headers, rows);
            else window.print();
        }
"""
        t = t.replace(
            "        function exportWorshipData()",
            inject
            + "\n        function exportWorshipData()",
            1,
        )
        # add button near export
        if 'data-w5-report="worship-mgmt-print"' not in t:
            t = t.replace(
                'onclick="exportWorshipData()" data-w5-report="worship-mgmt-csv"',
                'onclick="exportWorshipData()" data-w5-report="worship-mgmt-csv"',
                1,
            )
            # insert sibling button after the export button line block - find exportWorshipData button
            needle = "exportWorshipData()"
            idx = t.find('onclick="exportWorshipData()"')
            if idx > 0:
                end = t.find("</button>", idx)
                if end > 0 and 'data-w5-report="worship-mgmt-print"' not in t:
                    t = (
                        t[: end + 9]
                        + '\n                    <button type="button" onclick="printWorshipLiturgy()" data-w5-report="worship-mgmt-print" class="w-full bg-gray-500 text-white py-3 px-4 rounded hover:bg-gray-600 mt-2">🖨 列印場次</button>'
                        + t[end + 9 :]
                    )
    return t


def t_audio(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_MEDIA)
    if 'data-w5-report="audio-members-csv"' not in t:
        t = t.replace(
            'onclick="exportMembers()"',
            'onclick="exportMembers()" data-w5-report="audio-members-csv"',
            1,
        )
        t = t.replace(
            'onclick="exportEquipment()"',
            'onclick="exportEquipment()" data-w5-report="audio-equip-csv"',
            1,
        )
    if "printAudioRoster" not in t:
        inject = """
        function printAudioRoster() {
            var list = (typeof data !== 'undefined' && data.members) ? data.members : (typeof members !== 'undefined' ? members : []);
            var headers = ['姓名','崗位','電話','備註'];
            var rows = (list || []).map(function (m) {
                return [m.name, m.role || m.position, m.phone, m.note || ''];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('音響團隊名冊', headers, rows);
            else window.print();
        }
"""
        t = t.replace(
            "        function exportMembers()",
            inject + "\n        function exportMembers()",
            1,
        )
        idx = t.find('onclick="exportMembers()"')
        if idx > 0 and 'data-w5-report="audio-print"' not in t:
            end = t.find("</button>", idx)
            if end > 0:
                t = (
                    t[: end + 9]
                    + '\n                <button class="btn btn-secondary" type="button" onclick="printAudioRoster()" data-w5-report="audio-print">🖨 列印名冊</button>'
                    + t[end + 9 :]
                )
    return t


def t_live(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_MEDIA)
    if 'data-w5-report="live-streams-csv"' not in t:
        t = t.replace(
            'onclick="exportStreams()"',
            'onclick="exportStreams()" data-w5-report="live-streams-csv"',
            1,
        )
    if "printLiveStreams" not in t:
        inject = """
        function printLiveStreams() {
            var list = (typeof streams !== 'undefined' ? streams : (typeof data !== 'undefined' && data.streams ? data.streams : []));
            var headers = ['日期','標題','平台','觀看','狀態'];
            var rows = (list || []).map(function (s) {
                return [s.date, s.title, s.platform, s.views || s.viewers, s.status];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('直播場次', headers, rows);
            else window.print();
        }
"""
        t = t.replace(
            "        function exportStreams()",
            inject + "\n        function exportStreams()",
            1,
        )
        idx = t.find('onclick="exportStreams()"')
        if idx > 0 and 'data-w5-report="live-print"' not in t:
            end = t.find("</button>", idx)
            if end > 0:
                t = (
                    t[: end + 9]
                    + '\n                <button class="btn btn-secondary" type="button" onclick="printLiveStreams()" data-w5-report="live-print">🖨 列印</button>'
                    + t[end + 9 :]
                )
    return t


def t_choir(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="choir-members-csv"' not in t:
        # add buttons in a sensible place - after h1 or first toolbar
        if "exportChoirMembersCsv" not in t:
            inject_btn = (
                '<div style="padding:8px 20px;">'
                '<button type="button" onclick="exportChoirMembersCsv()" data-w5-report="choir-members-csv">⬇ 成員 CSV</button> '
                '<button type="button" onclick="printChoirRoster()" data-w5-report="choir-print">🖨 列印</button>'
                "</div>"
            )
            t = t.replace(
                '<div style="padding:10px 20px;"><a href="../../dashboard.html"',
                inject_btn
                + '\n    <div style="padding:10px 20px;"><a href="../../dashboard.html"',
                1,
            )
        inject = """
        function exportChoirMembersCsv() {
            var list = [];
            try { list = JSON.parse(localStorage.getItem('choir_members') || '[]'); } catch (e) {}
            if (!list.length && typeof members !== 'undefined') list = members;
            var lines = ['name,part,phone,memberId'];
            (list || []).forEach(function (m) {
                var esc = window.CmReportUtils ? CmReportUtils.csvEsc : function (v) { return v; };
                lines.push([m.name, m.part || m.voice, m.phone, m.memberId || ''].map(esc).join(','));
            });
            if (window.CmReportUtils) CmReportUtils.downloadCsv('choir_members.csv', lines);
        }
        function printChoirRoster() {
            var list = [];
            try { list = JSON.parse(localStorage.getItem('choir_members') || '[]'); } catch (e) {}
            if (!list.length && typeof members !== 'undefined') list = members;
            var rows = (list || []).map(function (m) {
                return [m.name, m.part || m.voice, m.phone || '', m.memberId || ''];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('詩班名冊', ['姓名','聲部','電話','memberId'], rows);
            else window.print();
        }
"""
        if "exportChoirMembersCsv" not in t:
            t = t.replace(UTILS_TAG, "<script>\n" + inject + "\n</script>\n" + UTILS_TAG, 1)
    return t


def t_instrument(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="instrument-print"' not in t:
        inject_btn = (
            '<div style="padding:8px 20px;">'
            '<button type="button" onclick="(typeof exportMembers===\'function\'?exportMembers():exportInstrumentMembersCsv())" data-w5-report="instrument-members-csv">⬇ 成員 CSV</button> '
            '<button type="button" onclick="printInstrumentRoster()" data-w5-report="instrument-print">🖨 列印</button>'
            "</div>"
        )
        if 'data-w5-report="instrument-members-csv"' not in t:
            t = t.replace(
                '<div style="padding:10px 20px;"><a href="../../dashboard.html"',
                inject_btn
                + '\n    <div style="padding:10px 20px;"><a href="../../dashboard.html"',
                1,
            )
        inject = """
        function exportInstrumentMembersCsv() {
            var list = [];
            try {
                var raw = localStorage.getItem('instrumentTeamData');
                var d = raw ? JSON.parse(raw) : {};
                list = d.members || [];
            } catch (e) {}
            if (!list.length && typeof members !== 'undefined') list = members;
            var lines = ['name,instrument,phone,memberId'];
            (list || []).forEach(function (m) {
                var esc = window.CmReportUtils ? CmReportUtils.csvEsc : function (v) { return v; };
                lines.push([m.name, m.instrument || m.role, m.phone, m.memberId || ''].map(esc).join(','));
            });
            if (window.CmReportUtils) CmReportUtils.downloadCsv('instrument_members.csv', lines);
        }
        function printInstrumentRoster() {
            var list = [];
            try {
                var raw = localStorage.getItem('instrumentTeamData');
                var d = raw ? JSON.parse(raw) : {};
                list = d.members || [];
            } catch (e) {}
            if (!list.length && typeof members !== 'undefined') list = members;
            var rows = (list || []).map(function (m) {
                return [m.name, m.instrument || m.role, m.phone || '', m.memberId || ''];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('器樂團隊', ['姓名','樂器','電話','memberId'], rows);
            else window.print();
        }
"""
        if "printInstrumentRoster" not in t:
            t = t.replace(UTILS_TAG, "<script>\n" + inject + "\n</script>\n" + UTILS_TAG, 1)
        # mark existing exportMembers if present
        if 'onclick="exportMembers()"' in t and 'data-w5-report="instrument-members-csv"' not in t[t.find("exportMembers") : t.find("exportMembers") + 80]:
            t = t.replace(
                'onclick="exportMembers()"',
                'onclick="exportMembers()" data-w5-report="instrument-members-csv"',
                1,
            )
    return t


def t_cong_songs(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="cong-songs-csv"' not in t:
        inject_btn = (
            '<div style="padding:8px 20px;">'
            '<button type="button" onclick="exportCongSongsCsv()" data-w5-report="cong-songs-csv">⬇ 詩歌 CSV</button> '
            '<button type="button" onclick="printCongSongs()" data-w5-report="cong-songs-print">🖨 列印</button>'
            "</div>"
        )
        t = t.replace(
            '<div style="padding:10px 20px;"><a href="../../dashboard.html"',
            inject_btn
            + '\n    <div style="padding:10px 20px;"><a href="../../dashboard.html"',
            1,
        )
        inject = """
        function exportCongSongsCsv() {
            var list = [];
            try { list = JSON.parse(localStorage.getItem('songsData') || '[]'); } catch (e) {}
            var lines = ['name,key,category'];
            (list || []).forEach(function (s) {
                var esc = window.CmReportUtils ? CmReportUtils.csvEsc : function (v) { return v; };
                lines.push([s.name || s.title, s.key, s.category].map(esc).join(','));
            });
            if (window.CmReportUtils) CmReportUtils.downloadCsv('congregational_songs.csv', lines);
        }
        function printCongSongs() {
            var list = [];
            try { list = JSON.parse(localStorage.getItem('songsData') || '[]'); } catch (e) {}
            var rows = (list || []).map(function (s) {
                return [s.name || s.title, s.key, s.category || ''];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('會眾詩歌', ['歌名','調','分類'], rows);
            else window.print();
        }
"""
        t = t.replace(UTILS_TAG, "<script>\n" + inject + "\n</script>\n" + UTILS_TAG, 1)
    return t


def t_sheet(t: str) -> str:
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="sheet-music-csv"' not in t:
        inject_btn = (
            '<div style="padding:8px 20px;">'
            '<button type="button" onclick="exportSheetMusicCsv()" data-w5-report="sheet-music-csv">⬇ 樂譜 CSV</button> '
            '<button type="button" onclick="printSheetMusic()" data-w5-report="sheet-music-print">🖨 列印</button>'
            "</div>"
        )
        t = t.replace(
            '<div style="padding:10px 20px;"><a href="../../dashboard.html"',
            inject_btn
            + '\n    <div style="padding:10px 20px;"><a href="../../dashboard.html"',
            1,
        )
        inject = """
        function exportSheetMusicCsv() {
            var list = [];
            try { list = JSON.parse(localStorage.getItem('sheet_music_data') || '[]'); } catch (e) {}
            var lines = ['title,composer,key,notes'];
            (list || []).forEach(function (s) {
                var esc = window.CmReportUtils ? CmReportUtils.csvEsc : function (v) { return v; };
                lines.push([s.title || s.name, s.composer, s.key, s.notes || s.note].map(esc).join(','));
            });
            if (window.CmReportUtils) CmReportUtils.downloadCsv('sheet_music.csv', lines);
        }
        function printSheetMusic() {
            var list = [];
            try { list = JSON.parse(localStorage.getItem('sheet_music_data') || '[]'); } catch (e) {}
            var rows = (list || []).map(function (s) {
                return [s.title || s.name, s.composer || '', s.key || '', s.notes || s.note || ''];
            });
            if (window.CmReportUtils) CmReportUtils.printTable('樂譜索引', ['曲名','作曲','調','備註'], rows);
            else window.print();
        }
"""
        t = t.replace(UTILS_TAG, "<script>\n" + inject + "\n</script>\n" + UTILS_TAG, 1)
    return t


def t_integrated_volunteer_view(t: str) -> str:
    """A-03: add schedule CSV/print on worship-integrated if missing."""
    t = ensure_utils(t, UTILS_SCRIPT_WORSHIP)
    if 'data-w5-report="worship-integrated-csv"' not in t:
        inject_btn = (
            '<div id="w5a03ReportBar" style="padding:8px 16px;background:#ecfdf5;border-bottom:1px solid #a7f3d0;">'
            '<strong>A-03 報告</strong> '
            '<button type="button" onclick="exportA03ScheduleCsv()" data-w5-report="worship-integrated-csv">⬇ 服事 CSV</button> '
            '<button type="button" onclick="printA03Schedule()" data-w5-report="worship-integrated-print">🖨 列印</button>'
            "</div>"
        )
        if 'id="w5a03ReportBar"' not in t:
            t = t.replace("<body", "<body", 1)
            # after body open
            import re

            t = re.sub(
                r"(<body[^>]*>)",
                r"\1\n" + inject_btn,
                t,
                count=1,
            )
        inject = """
        function exportA03ScheduleCsv() {
            var list = [];
            try {
                if (window.AeWorshipPlanPipeline && typeof AeWorshipPlanPipeline.getActivePlan === 'function') {
                    var p = AeWorshipPlanPipeline.getActivePlan();
                    if (p) list = [p];
                }
            } catch (e) {}
            try {
                var raw = localStorage.getItem('church_ministry_a_worship');
                if (raw) {
                    var d = JSON.parse(raw);
                    if (d && d.tasks) list = list.concat(d.tasks);
                }
            } catch (e2) {}
            var lines = ['type,title,status,note'];
            (list || []).forEach(function (x) {
                var esc = window.CmReportUtils ? CmReportUtils.csvEsc : function (v) { return v; };
                lines.push([x.type || 'plan', x.title || x.theme || x.name, x.status, x.note || ''].map(esc).join(','));
            });
            if (window.CmReportUtils) CmReportUtils.downloadCsv('worship_a03_schedule.csv', lines);
            else if (window.AeWorshipPlanPipeline && AeWorshipPlanPipeline.exportPlanCsv) AeWorshipPlanPipeline.exportPlanCsv();
        }
        function printA03Schedule() {
            if (window.AeWorshipPlanPipeline && AeWorshipPlanPipeline.printPlanBrief) {
                AeWorshipPlanPipeline.printPlanBrief();
                return;
            }
            if (window.CmReportUtils) CmReportUtils.printTable('今日祭壇／策劃', ['說明'], [['見主日策劃或本頁任務清單']]);
            else window.print();
        }
"""
        if "exportA03ScheduleCsv" not in t:
            t = t.replace(UTILS_TAG, "<script>\n" + inject + "\n</script>\n" + UTILS_TAG, 1)
    return t


def main():
    patch_file("modules/worship/hospitality.html", t_hospitality)
    patch_file("modules/worship/pulpit-ministry.html", t_pulpit)
    patch_file("modules/worship/worship-team-management.html", t_team)
    patch_file("modules/worship/sermon-notes-admin.html", t_sermon_notes)
    patch_file("modules/worship/song-library.html", t_song_library)
    patch_file("modules/worship/worship-management.html", t_worship_mgmt)
    patch_file("modules/media/audio-team.html", t_audio)
    patch_file("modules/media/live-streaming.html", t_live)
    patch_file("modules/worship/choir-team.html", t_choir)
    patch_file("modules/worship/instrument-team.html", t_instrument)
    patch_file("modules/worship/congregational-songs.html", t_cong_songs)
    patch_file("modules/worship/sheet-music.html", t_sheet)
    patch_file("modules/worship/worship-integrated.html", t_integrated_volunteer_view)
    print("W5b patch done")


if __name__ == "__main__":
    main()
