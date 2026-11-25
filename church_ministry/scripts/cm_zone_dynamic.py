# -*- coding: utf-8 -*-
"""
教會事工 0＋A–H · 階段 2：逐頁「真的開起來」動態檢查（全自動、只讀專案）

做什麼：
  用無頭 Edge 逐頁打開（預設 file://，與你的驗收口徑相同），記錄：
  載入是否成功、JS 例外、主控台錯誤、404 資源、畫面是否空白、出現 undefined／NaN、
  壞圖、彈窗；再「按一輪安全按鈕」看有沒有按了就爆；每頁截圖。
不做：不寫入專案檔（只寫報告與截圖）、不按刪除／清除／匯入類按鈕、不送出外部請求。
  瀏覽器用全新的暫存設定檔，不碰你平常的 Edge。

執行：
  python church_ministry/scripts/cm_zone_dynamic.py --zones b,c,g
  python church_ministry/scripts/cm_zone_dynamic.py --zones b,c,g --seed       # 先載入示範會友
  python church_ministry/scripts/cm_zone_dynamic.py --zones all --mode http    # 改用本機 HTTP
產出（church_ministry/audit/stage2/）：
  dynamic_<tag>.json / .csv / .md、screens/<tag>/*.jpg
"""
from __future__ import annotations

import argparse
import base64
import csv
import hashlib
import json
import os
import re
import shutil
import socket
import struct
import subprocess
import sys
import tempfile
import time
import urllib.request
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
sys.path.insert(0, str(HERE))

# ───────────────────────── 設定區（小白可改） ─────────────────────────
EDGE_CANDIDATES = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
]
NAV_TIMEOUT = 15.0       # 單頁最長等載入（秒）
SETTLE = 1.4             # 載入後再等腳本繪畫（秒）
CLICK_SETTLE = 0.35      # 每次按完等多久（秒）
MAX_CLICKS = 18          # 每頁最多按幾個
VIEW_W, VIEW_H = 1280, 900
DANGER_RE = re.compile(
    r"刪除|删除|清除|清空|重置|重設|重设|還原|还原|匯入|导入|導入|載入|载入|登出|登入|退出|"
    r"delete|clear|reset|restore|import|logout|sign\s?out|remove|下載|下载|download|匯出|导出|export|列印|print",
    re.I,
)
SUSPICIOUS_RE = re.compile(r"\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b(?!\s*[:,)])")
# 這些主控台訊息不算問題（瀏覽器對 file:// 的固有行為）
IGNORE_CONSOLE_RE = re.compile(r"favicon|Autofill|DevTools|Download the React DevTools", re.I)
# 無頭測試環境本身的限制（剪貼簿、全螢幕、通知等），不是頁面的錯
ENV_ARTIFACT_RE = re.compile(r"writeText|Clipboard|clipboard|NotAllowedError|requestFullscreen|Notification", re.I)
FETCH_FILE_RE = re.compile(r"Failed to fetch", re.I)


# ───────────────────────── 極簡 WebSocket（標準庫） ─────────────────────────
class WS:
    def __init__(self, url: str):
        m = re.match(r"ws://([^/:]+):(\d+)(/.*)", url)
        host, port, path = m.group(1), int(m.group(2)), m.group(3)
        self.sock = socket.create_connection((host, port), timeout=10)
        key = base64.b64encode(os.urandom(16)).decode()
        req = (f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\n"
               f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.sock.sendall(req.encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise RuntimeError("websocket handshake failed")
            buf += chunk
        head, rest = buf.split(b"\r\n\r\n", 1)
        if b" 101 " not in head.split(b"\r\n")[0]:
            raise RuntimeError("websocket upgrade refused: " + head[:100].decode(errors="replace"))
        self.buf = rest

    def _read(self, n: int, deadline: float) -> bytes:
        while len(self.buf) < n:
            left = deadline - time.time()
            if left <= 0:
                raise TimeoutError()
            self.sock.settimeout(left)
            try:
                chunk = self.sock.recv(65536)
            except socket.timeout:
                raise TimeoutError()
            if not chunk:
                raise ConnectionError("closed")
            self.buf += chunk
        out, self.buf = self.buf[:n], self.buf[n:]
        return out

    def send(self, text: str):
        data = text.encode("utf-8")
        hdr = bytearray([0x81])
        ln = len(data)
        if ln < 126:
            hdr.append(0x80 | ln)
        elif ln < 65536:
            hdr.append(0x80 | 126)
            hdr += struct.pack(">H", ln)
        else:
            hdr.append(0x80 | 127)
            hdr += struct.pack(">Q", ln)
        mask = os.urandom(4)
        hdr += mask
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
        self.sock.sendall(bytes(hdr) + masked)

    def recv(self, timeout: float):
        """收一則文字訊息；逾時丟 TimeoutError。"""
        deadline = time.time() + timeout
        payload = b""
        while True:
            b1, b2 = self._read(2, deadline)
            fin, op = b1 & 0x80, b1 & 0x0F
            ln = b2 & 0x7F
            if ln == 126:
                ln = struct.unpack(">H", self._read(2, deadline))[0]
            elif ln == 127:
                ln = struct.unpack(">Q", self._read(8, deadline))[0]
            data = self._read(ln, deadline) if ln else b""
            if op == 0x8:
                raise ConnectionError("closed by peer")
            if op in (0x9, 0xA):
                continue
            payload += data
            if fin:
                return payload.decode("utf-8", errors="replace")

    def close(self):
        try:
            self.sock.close()
        except OSError:
            pass


class Cdp:
    def __init__(self, ws_url: str):
        self.ws = WS(ws_url)
        self.n = 0
        self.events: list[dict] = []

    def send(self, method: str, params: dict | None = None, timeout: float = 20.0):
        self.n += 1
        mid = self.n
        self.ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
        deadline = time.time() + timeout
        while True:
            left = deadline - time.time()
            if left <= 0:
                raise TimeoutError(f"CDP {method} timeout")
            msg = json.loads(self.ws.recv(left))
            if msg.get("id") == mid:
                if "error" in msg:
                    raise RuntimeError(f"CDP {method}: {msg['error']}")
                return msg.get("result", {})
            if "method" in msg:
                self._on_event(msg)

    def _on_event(self, msg: dict):
        self.events.append(msg)
        if msg["method"] == "Page.javascriptDialogOpening":
            try:
                self.n += 1
                self.ws.send(json.dumps({"id": self.n, "method": "Page.handleJavaScriptDialog",
                                         "params": {"accept": False}}))
            except Exception:
                pass

    def pump(self, seconds: float, until=None):
        end = time.time() + seconds
        while time.time() < end:
            try:
                msg = json.loads(self.ws.recv(min(0.25, max(0.01, end - time.time()))))
            except TimeoutError:
                if until and until():
                    return
                continue
            if "method" in msg:
                self._on_event(msg)
                if until and until():
                    return

    def eval(self, expr: str, timeout: float = 15.0):
        res = self.send("Runtime.evaluate", {"expression": expr, "returnByValue": True,
                                             "awaitPromise": True}, timeout)
        if "exceptionDetails" in res:
            return {"__error__": res["exceptionDetails"].get("text", "eval error")}
        return res.get("result", {}).get("value")

    def drain(self) -> list[dict]:
        ev, self.events = self.events, []
        return ev


# ───────────────────────── 瀏覽器啟動 ─────────────────────────
def find_browser() -> str | None:
    for p in EDGE_CANDIDATES:
        if Path(p).exists():
            return p
    return shutil.which("msedge") or shutil.which("chrome")


class Browser:
    def __init__(self, port: int = 9224, headless: bool = True):
        exe = find_browser()
        if not exe:
            raise RuntimeError("找不到 Edge／Chrome")
        self.tmp = tempfile.mkdtemp(prefix="cm_dyn_")
        args = [exe, f"--remote-debugging-port={port}", f"--user-data-dir={self.tmp}",
                "--no-first-run", "--no-default-browser-check", "--disable-extensions",
                "--disable-background-networking", "--disable-sync", "--mute-audio",
                f"--window-size={VIEW_W},{VIEW_H}", "about:blank"]
        if headless:
            args.insert(1, "--headless=new")
        self.proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.port = port
        ws_url = None
        for _ in range(60):
            try:
                with urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list", timeout=2) as r:
                    tabs = json.loads(r.read().decode())
                pages = [t for t in tabs if t.get("type") == "page"]
                if pages:
                    ws_url = pages[0]["webSocketDebuggerUrl"]
                    break
            except Exception:
                pass
            time.sleep(0.5)
        if not ws_url:
            self.close()
            raise RuntimeError("瀏覽器沒有起來")
        self.cdp = Cdp(ws_url)
        for m in ("Page.enable", "Runtime.enable", "Network.enable", "Log.enable"):
            self.cdp.send(m)
        self.cdp.send("Emulation.setDeviceMetricsOverride",
                      {"width": VIEW_W, "height": VIEW_H, "deviceScaleFactor": 1, "mobile": False})
        self.cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})

    def close(self):
        try:
            self.cdp.ws.close()
        except Exception:
            pass
        try:
            self.proc.terminate()
            self.proc.wait(timeout=8)
        except Exception:
            try:
                self.proc.kill()
            except Exception:
                pass
        shutil.rmtree(self.tmp, ignore_errors=True)


# ───────────────────────── 單頁檢查 ─────────────────────────
PROBE_JS = r"""
(function(){
  var body = document.body;
  var text = body ? (body.innerText || '') : '';
  var vis = 0;
  try { vis = Array.prototype.filter.call(document.querySelectorAll('body *'), function(e){
        var r=e.getBoundingClientRect(); return r.width>2 && r.height>2; }).length; } catch(e){}
  var imgs = Array.prototype.filter.call(document.images||[], function(i){ return i.complete && i.naturalWidth===0 && i.src; }).length;
  return JSON.stringify({
    title: document.title||'', textLen: text.replace(/\s+/g,'').length, visible: vis,
    links: document.querySelectorAll('a[href]').length, buttons: document.querySelectorAll('button,[role=button],input[type=button],input[type=submit]').length,
    inputs: document.querySelectorAll('input,select,textarea').length, brokenImgs: imgs,
    sample: text.replace(/\s+/g,' ').trim().slice(0,160), url: location.href,
    suspicious: (text.match(/\bundefined\b|\bNaN\b|\[object Object\]/g)||[]).slice(0,5),
    hasContentFrame: !!document.querySelector('iframe[name=contentFrame],iframe#contentFrame')
  });
})()
"""

CANDIDATES_JS = r"""
(function(max, danger){
  var re = new RegExp(danger, 'i');
  var out = [];
  var els = document.querySelectorAll('button,[role=tab],[role=button],.tab,[data-tab],a[href^="#"],summary,input[type=button]');
  for (var i=0;i<els.length && out.length<max;i++){
    var e = els[i];
    var r = e.getBoundingClientRect();
    if (r.width<4 || r.height<4 || e.disabled) continue;
    var label = (e.innerText||e.value||e.getAttribute('aria-label')||e.title||'').replace(/\s+/g,' ').trim().slice(0,40);
    if (re.test(label)) continue;
    if (e.closest('a[href]:not([href^="#"])')) continue;
    if (e.type==='file') continue;
    e.setAttribute('data-cmprobe', String(out.length));
    out.push(label || ('<'+e.tagName.toLowerCase()+'>'));
  }
  return JSON.stringify(out);
})
"""


def classify_events(events: list[dict]):
    exceptions, console, failed, http_bad, dialogs = [], [], [], [], []
    for ev in events:
        m, p = ev["method"], ev.get("params", {})
        if m == "Runtime.exceptionThrown":
            d = p.get("exceptionDetails", {})
            desc = (d.get("exception", {}) or {}).get("description") or d.get("text", "")
            where = ""
            if d.get("url"):
                where = f" @ {d['url'].rsplit('/', 1)[-1]}:{d.get('lineNumber', 0) + 1}"
            exceptions.append(desc.split("\n")[0][:160] + where)
        elif m == "Runtime.consoleAPICalled" and p.get("type") in ("error", "assert"):
            txt = " ".join(str(a.get("value", a.get("description", ""))) for a in p.get("args", []))[:200]
            if not IGNORE_CONSOLE_RE.search(txt):
                console.append(txt)
        elif m == "Log.entryAdded":
            e = p.get("entry", {})
            if e.get("level") == "error":
                txt = (e.get("text", "") + " " + (e.get("url", "") or ""))[:200]
                if not IGNORE_CONSOLE_RE.search(txt):
                    console.append(txt)
        elif m == "Network.loadingFailed" and not p.get("canceled"):
            failed.append(p.get("errorText", "failed"))
        elif m == "Network.responseReceived":
            r = p.get("response", {})
            if r.get("status", 200) >= 400:
                http_bad.append(f"{r['status']} {r.get('url','')[-90:]}")
        elif m == "Page.javascriptDialogOpening":
            dialogs.append(p.get("message", "")[:80])
    return exceptions, console, failed, http_bad, dialogs


def slug(rel: str) -> str:
    base = re.sub(r"[^\w\-]+", "_", rel)[-60:]
    return f"{base}_{hashlib.md5(rel.encode()).hexdigest()[:6]}"


def check_page(br: Browser, url: str, rel: str, shot_dir: Path | None, interact: bool = True) -> dict:
    c = br.cdp
    rec = {"path": rel, "url": url, "load_ok": False, "load_error": ""}
    c.drain()
    try:
        c.send("Page.navigate", {"url": "about:blank"}, timeout=10)
        c.pump(0.15)
        c.drain()
        nav = c.send("Page.navigate", {"url": url}, timeout=NAV_TIMEOUT)
        if nav.get("errorText"):
            rec["load_error"] = nav["errorText"]
        loaded = {"v": False}

        def check():
            return any(e["method"] == "Page.loadEventFired" for e in c.events)
        c.pump(NAV_TIMEOUT, until=check)
        loaded["v"] = check()
        rec["load_ok"] = loaded["v"] and not rec["load_error"]
        c.pump(SETTLE)
    except Exception as e:  # noqa: BLE001
        rec["load_error"] = f"{type(e).__name__}: {e}"
    ev0 = c.drain()
    exc, con, failed, http_bad, dialogs = classify_events(ev0)
    probe = {}
    try:
        raw = c.eval(PROBE_JS)
        probe = json.loads(raw) if isinstance(raw, str) else {}
    except Exception as e:  # noqa: BLE001
        rec["load_error"] = rec["load_error"] or f"probe: {e}"
    rec.update({
        "title": probe.get("title", ""), "text_len": probe.get("textLen", 0), "visible": probe.get("visible", 0),
        "links": probe.get("links", 0), "buttons": probe.get("buttons", 0), "inputs": probe.get("inputs", 0),
        "broken_imgs": probe.get("brokenImgs", 0), "sample": probe.get("sample", ""),
        "nested_shell": bool(probe.get("hasContentFrame")),
    })
    rec["suspicious"] = sorted(set(probe.get("suspicious", [])))

    # 截圖要在「按按鈕之前」拍：按鈕會切語言／展開／導覽，之後拍到的不是使用者進頁看到的樣子
    if shot_dir:
        try:
            shot = c.send("Page.captureScreenshot", {"format": "jpeg", "quality": 45}, timeout=15)
            fn = slug(rel) + ".jpg"
            shot_dir.mkdir(parents=True, exist_ok=True)
            (shot_dir / fn).write_bytes(base64.b64decode(shot["data"]))
            rec["screenshot"] = fn
        except Exception as e:  # noqa: BLE001
            rec["screenshot"] = ""
            rec["shot_error"] = str(e)[:80]

    # 按一輪安全按鈕
    clicks, click_errors, info = 0, [], []
    start_url = probe.get("url", url)
    if interact and rec["load_ok"]:
        try:
            labels = json.loads(c.eval(f"({CANDIDATES_JS})({MAX_CLICKS}, {json.dumps(DANGER_RE.pattern)})") or "[]")
        except Exception:
            labels = []
        for i, label in enumerate(labels):
            c.drain()
            try:
                c.eval(f"(function(){{var e=document.querySelector('[data-cmprobe=\"{i}\"]'); if(e) e.click();}})()", 5)
            except Exception:
                pass
            clicks += 1
            c.pump(CLICK_SETTLE)
            e2, c2, f2, h2, d2 = classify_events(c.drain())
            for err in e2:
                if ENV_ARTIFACT_RE.search(err):
                    info.append(f"按『{label}』：{err[:70]}（測試環境限制，非頁面錯）")
                elif FETCH_FILE_RE.search(err) and url.startswith("file:"):
                    info.append(f"按『{label}』：file:// 下 fetch 被擋（需改用 HTTP 才能用）")
                else:
                    click_errors.append({"button": label, "error": err})
            dialogs += d2
            now = c.eval("location.href")
            if isinstance(now, str) and now.split("#")[0] != start_url.split("#")[0]:
                info.append(f"按『{label}』會導向他頁（正常導覽）")
                try:  # 回到本頁，繼續按剩下的
                    c.send("Page.navigate", {"url": start_url}, timeout=NAV_TIMEOUT)
                    c.pump(SETTLE + 0.6)
                    c.drain()
                    c.eval(f"({CANDIDATES_JS})({MAX_CLICKS}, {json.dumps(DANGER_RE.pattern)})")
                except Exception:
                    break
    if clicks:
        try:  # 按鈕可能切了語言並存進 localStorage，會污染接下來的每一頁
            c.eval("try{localStorage.removeItem('b100_ui_locale');localStorage.removeItem('b100_content_lang');}catch(e){}", 5)
        except Exception:
            pass
    rec["clicks"], rec["click_errors"] = clicks, click_errors
    rec["exceptions"], rec["console_errors"] = exc, con
    rec["failed_requests"], rec["http_errors"] = failed, http_bad
    rec["dialogs"] = dialogs

    # 判定
    problems, notes = [], []
    if not rec["load_ok"]:
        problems.append(f"載入失敗 {rec['load_error']}".strip())
    if exc:
        problems.append(f"JS 例外：{exc[0]}")
    if click_errors:
        problems.append(f"按『{click_errors[0]['button']}』出錯：{click_errors[0]['error']}")
    if rec["load_ok"] and rec["text_len"] < 20 and rec["visible"] < 5:
        problems.append("畫面空白")
    if con:
        notes.append(f"主控台錯誤 {len(con)}：{con[0][:70]}…{con[0][-70:]}" if len(con[0]) > 140 else f"主控台錯誤 {len(con)}：{con[0]}")
    if http_bad:
        notes.append(f"資源載入失敗 {len(http_bad)}：{http_bad[0]}")
    elif failed:
        notes.append(f"網路失敗 {len(failed)}：{failed[0]}")
    if rec["broken_imgs"]:
        notes.append(f"壞圖 {rec['broken_imgs']}")
    if rec["suspicious"]:
        notes.append("畫面出現 " + "／".join(rec["suspicious"]))
    if rec["nested_shell"]:
        notes.append("頁內有 contentFrame（殼中殼？）")
    if dialogs:  # 對話框只是資訊（按鈕確認、提示），不算問題
        info.append(f"跳出對話框 {len(dialogs)} 次：{dialogs[0][:40]}")
    rec["info"] = info
    rec["problems"], rec["notes"] = problems, notes
    rec["status"] = "bad" if problems else ("warn" if notes else "ok")
    return rec


# ───────────────────────── 選頁／輸出 ─────────────────────────
ICON = {"ok": "✅", "warn": "🟡", "bad": "❌"}


def pick_pages(zones: list[str], repo: Path, include_unreachable: bool) -> list[dict]:
    import cm_zone_scan as S
    res = S.scan(repo)
    out = []
    for r in res["pages"]:
        z = r["zones"][0]
        if zones != ["all"] and z not in zones:
            continue
        if r["redirect"] or r["stub"]:
            continue
        if not r["reachable"] and not include_unreachable:
            continue
        if r["path"].startswith("church_ministry/_templates/") or r["path"].endswith(".htm"):
            continue
        out.append({"path": r["path"], "zone": z, "static": r["status"]})
    out.sort(key=lambda x: (x["zone"], x["path"]))
    return out


def page_url(repo: Path, rel: str, mode: str, http_base: str) -> str:
    if mode == "file":
        return (repo / rel).resolve().as_uri()
    return f"{http_base}/{rel}"


def seed_data(br: Browser, repo: Path, mode: str, http_base: str):
    """先載入示範會友，讓頁面有資料可顯示。"""
    rel = "church_ministry/load_central_member_seed.html"
    url = page_url(repo, rel, mode, http_base)
    br.cdp.drain()
    br.cdp.send("Page.navigate", {"url": url})
    br.cdp.pump(5.0)
    br.cdp.drain()


def _clean(obj):
    """頁面文字可能含孤立的 UTF-16 代理字元（例如被截斷的 emoji），寫檔前一律替換掉。"""
    if isinstance(obj, str):
        return obj.encode("utf-8", "replace").decode("utf-8")
    if isinstance(obj, list):
        return [_clean(x) for x in obj]
    if isinstance(obj, dict):
        return {_clean(k): _clean(v) for k, v in obj.items()}
    return obj


def write_reports(results: list[dict], out_dir: Path, tag: str, meta: dict):
    results = _clean(results)
    meta = _clean(meta)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"dynamic_{tag}.json").write_text(
        json.dumps({"meta": meta, "results": results}, ensure_ascii=False, indent=1), encoding="utf-8")
    with (out_dir / f"dynamic_{tag}.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["區", "頁面", "動態狀態", "靜態狀態", "問題", "提醒", "提示", "文字量", "按了幾個", "截圖"])
        for r in results:
            w.writerow([r["zone"].upper(), r["path"], ICON[r["status"]], r.get("static", ""),
                        "；".join(r["problems"]), "；".join(r["notes"]), "；".join(r.get("info", [])),
                        r["text_len"], r["clicks"],
                        f"screens/{tag}/{r.get('screenshot','')}"])
    cnt = Counter(r["status"] for r in results)
    L = [f"# 階段 2 · 動態檢查報告（{meta['label']}）\n",
         "> 自動產生（`cm_zone_dynamic.py`）。無頭 Edge 逐頁真的打開、按一輪安全按鈕、截圖。**只讀專案**。\n",
         f"- 模式：**{meta['mode']}**（file＝與你的驗收口徑相同）｜資料：**{'已載入示範會友' if meta['seed'] else '全新空白（新用戶）'}**",
         f"- 範圍：區 {meta['zones']}｜共 **{len(results)}** 頁｜耗時 {meta['seconds']} 秒",
         "- 圖例：✅ 通過　🟡 有提醒　❌ 有硬傷（載入失敗／JS 例外／按鈕按了就爆／畫面空白）\n",
         "## 1. 總覽\n", "```mermaid", "pie title 動態狀態"]
    for k, n in (("ok", "通過"), ("warn", "有提醒"), ("bad", "有硬傷")):
        L.append(f'    "{n}" : {cnt.get(k, 0)}')
    L.append("```\n")
    L.append("| 區 | 頁數 | ✅ | 🟡 | ❌ |")
    L.append("|---|---|---|---|---|")
    for z in sorted({r["zone"] for r in results}):
        rs = [r for r in results if r["zone"] == z]
        c = Counter(r["status"] for r in rs)
        L.append(f"| {z.upper()} | {len(rs)} | {c['ok']} | {c['warn']} | {c['bad']} |")
    L.append("")
    bad = [r for r in results if r["status"] == "bad"]
    L.append(f"## 2. ❌ 有硬傷（{len(bad)} 頁）\n")
    if bad:
        L.append("| 區 | 頁面 | 問題 | 截圖 |")
        L.append("|---|---|---|---|")
        for r in bad:
            L.append(f"| {r['zone'].upper()} | `{r['path']}` | {'；'.join(r['problems'])[:200]} | [圖](screens/{tag}/{r.get('screenshot','')}) |")
    else:
        L.append("- 無")
    L.append("")
    warn = [r for r in results if r["status"] == "warn"]
    L.append(f"## 3. 🟡 有提醒（{len(warn)} 頁）\n")
    if warn:
        L.append("| 區 | 頁面 | 提醒 |")
        L.append("|---|---|---|")
        for r in warn:
            L.append(f"| {r['zone'].upper()} | `{r['path']}` | {'；'.join(r['notes'])[:220]} |")
    else:
        L.append("- 無")
    L.append("")
    L.append("## 4. 問題類型統計\n")
    kinds = Counter()
    for r in results:
        for p in r["problems"] + r["notes"]:
            kinds[re.sub(r"[：:].*$", "", p)[:24]] += 1
    L.append("| 類型 | 頁數 |")
    L.append("|---|---|")
    for k, n in kinds.most_common():
        L.append(f"| {k} | {n} |")
    L.append("")
    L.append("## 5. 限制\n")
    L.append("- 只按「安全」按鈕（略過刪除／清除／匯入／下載等），不填表單、不送出；所以**存檔後是否還在**這類流程，要靠階段 3 與真人試用。")
    L.append("- 「好不好懂」「用語是否合適」機器判斷不了，交給中立 AI 盲測與牧者。")
    (out_dir / f"dynamic_{tag}.md").write_text("\n".join(L), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--zones", default="b,c,g")
    ap.add_argument("--mode", choices=["file", "http"], default="file")
    ap.add_argument("--seed", action="store_true")
    ap.add_argument("--include-unreachable", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--no-shots", action="store_true")
    ap.add_argument("--port", type=int, default=9224)
    a = ap.parse_args()
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    zones = [z.strip().lower() for z in a.zones.split(",") if z.strip()]
    pages = pick_pages(zones, REPO, a.include_unreachable)
    if a.limit:
        pages = pages[: a.limit]
    tag = f"{'-'.join(zones)}_{a.mode}_{'seed' if a.seed else 'empty'}"
    out_dir = REPO / "church_ministry" / "audit" / "stage2"
    http_proc, http_base = None, ""
    if a.mode == "http":
        http_proc = subprocess.Popen([sys.executable, "-m", "http.server", "8768", "--bind", "127.0.0.1"],
                                     cwd=str(REPO), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        http_base = "http://127.0.0.1:8768"
        time.sleep(1.2)
    br = Browser(a.port)
    t0 = time.time()
    results = []
    try:
        if a.seed:
            seed_data(br, REPO, a.mode, http_base)
        for i, p in enumerate(pages, 1):
            url = page_url(REPO, p["path"], a.mode, http_base)
            rec = check_page(br, url, p["path"], None if a.no_shots else out_dir / "screens" / tag)
            rec["zone"], rec["static"] = p["zone"], p["static"]
            results.append(rec)
            print(f"[{i}/{len(pages)}] {ICON[rec['status']]} {p['zone'].upper()} {p['path']} "
                  f"{'; '.join(rec['problems'] or rec['notes'])[:80]}", flush=True)
    finally:
        br.close()
        if http_proc:
            http_proc.terminate()
    meta = {"label": f"區 {','.join(z.upper() for z in zones)}", "mode": a.mode, "seed": a.seed,
            "zones": ",".join(z.upper() for z in zones), "seconds": int(time.time() - t0)}
    write_reports(results, out_dir, tag, meta)
    c = Counter(r["status"] for r in results)
    print(f"DONE pages={len(results)} ok={c['ok']} warn={c['warn']} bad={c['bad']} -> audit/stage2/dynamic_{tag}.md")


if __name__ == "__main__":
    main()
