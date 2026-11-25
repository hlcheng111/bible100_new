/**
 * 備份與還原面板（P6）
 * 依賴：CmBackupConfig、CmBackup、CmBackupCrypto（可選加密）、ChurchAuth（選用）、ChurchDataBridge（只用來寫操作紀錄，選用）
 * 備份＝讀 localStorage 白名單 key 下載成 JSON（可用密碼加密）；
 * 還原＝（加密檔先解密）→ 驗證 → 人確認 → 先自動下載「還原前備份」→ 才寫入。
 * 密碼只留在記憶體，用完就清掉，不存檔、不上傳。
 */
(function (global) {
  "use strict";

  var doc = global.document;
  var pending = null; /* 已讀入、驗證過、等人確認：{ obj, v, password } */
  var encPending = null; /* 已讀入但還沒解密的加密備份外殼 */

  function $(id) {
    return doc.getElementById(id);
  }

  function allowed() {
    var A = global.ChurchAuth;
    if (!A || typeof A.can !== "function") return true;
    return A.can("crm.admin");
  }

  function logAct(action, payload) {
    try {
      if (global.ChurchDataBridge && typeof global.ChurchDataBridge.logActivity === "function") {
        global.ChurchDataBridge.logActivity(action, payload || {}, "backup");
      }
    } catch (e) {}
  }

  function setMsg(msg, kind) {
    var el = $("bk-msg");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
    el.className = "bk-msg" + (kind ? " bk-msg--" + kind : "");
  }

  function download(name, obj) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    var a = doc.createElement("a");
    a.href = global.URL.createObjectURL(blob);
    a.download = name;
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
    global.setTimeout(function () {
      global.URL.revokeObjectURL(a.href);
    }, 2000);
  }

  function renderReminder() {
    var el = $("bk-reminder");
    if (!el) return;
    var r = global.CmBackup.reminder(global.localStorage, new Date());
    if (r.state === "none") {
      el.textContent = "目前還沒有會友資料，暫時不用備份。有資料後，這裡會提醒你。";
      el.className = "bk-remind bk-remind--ok";
      return;
    }
    el.textContent = r.text_zh;
    el.className = "bk-remind bk-remind--" + (r.state === "ok" ? "ok" : "warn");
  }

  function renderIncluded() {
    var ul = $("bk-included");
    if (!ul) return;
    ul.innerHTML = "";
    var cfg = global.CmBackupConfig;
    cfg.GROUPS.forEach(function (g) {
      var have = g.items.filter(function (it) {
        return global.localStorage.getItem(it.key) !== null;
      });
      var li = doc.createElement("li");
      li.textContent =
        g.label_zh + (g.personal ? "（含個人資料）" : "") + "：" + (have.length ? have.map(function (i) { return i.label_zh; }).join("、") : "目前沒有資料");
      ul.appendChild(li);
    });
  }

  function crypto() {
    return global.CmBackupCrypto || null;
  }

  function encChecked() {
    var cb = $("bk-enc");
    return !!(cb && cb.checked);
  }

  function clearPasswordFields() {
    ["bk-pw", "bk-pw2", "bk-dec-pw"].forEach(function (id) {
      var el = $(id);
      if (el) el.value = "";
    });
  }

  /** 產生要下載的內容：不加密就原樣，加密就回傳外殼（Promise） */
  function packForDownload(data, password) {
    if (!password) return Promise.resolve(data);
    return crypto().encryptBackup(data, password, global.CmBackupConfig.APP_ID);
  }

  function onExport() {
    if (!allowed()) {
      setMsg("你的角色沒有備份權限（需要「行政」或「牧者」）。", "warn");
      return Promise.resolve();
    }
    var now = new Date();
    var data = global.CmBackup.buildBackup(global.localStorage, now);
    var n = Object.keys(data.keys).length;
    if (!n) {
      setMsg("目前沒有可備份的資料。", "warn");
      return Promise.resolve();
    }
    var password = "";
    if (encChecked()) {
      if (!crypto()) {
        setMsg("這個瀏覽器不支援加密，沒有下載。你可以取消勾選後再備份。", "warn");
        return Promise.resolve();
      }
      var pw = $("bk-pw") ? $("bk-pw").value : "";
      var pw2 = $("bk-pw2") ? $("bk-pw2").value : "";
      var chk = crypto().checkPassword(pw, pw2);
      if (!chk.ok) {
        setMsg(chk.errors.join(" ") + " 沒有下載。", "warn");
        return Promise.resolve();
      }
      password = pw;
    }
    setMsg(password ? "加密中，請稍候…" : "", "");
    return packForDownload(data, password).then(
      function (out) {
        download(global.CmBackup.fileName(now, password ? "bible100_backup_enc" : "bible100_backup"), out);
        global.CmBackup.markBackup(global.localStorage, now);
        logAct("backup_exported", { keys: n });
        clearPasswordFields();
        renderReminder();
        setMsg(
          "已下載" + (password ? "加密" : "") + "備份檔（" + n + " 項資料）。請把檔案存到 USB 或雲端硬碟" +
            (password ? "，並把密碼另外記好（忘記密碼就打不開）。" : "，並像名冊一樣保管。"),
          "ok"
        );
      },
      function (e) {
        setMsg("加密失敗：" + (e && e.message ? e.message : "未知錯誤") + " 沒有下載。", "warn");
      }
    );
  }

  function renderPending(v) {
    var box = $("bk-restore-box");
    var list = $("bk-restore-list");
    var btn = $("bk-restore-go");
    if (!box || !list || !btn) return;
    list.innerHTML = "";
    if (!v) {
      box.hidden = true;
      return;
    }
    v.items.forEach(function (it) {
      var li = doc.createElement("li");
      li.textContent = it.group_zh + " ‧ " + it.label_zh + (it.personal ? "（含個人資料）" : "");
      list.appendChild(li);
    });
    if (v.ignored.length) {
      var li2 = doc.createElement("li");
      li2.textContent = "另有 " + v.ignored.length + " 項不在白名單，會被忽略。";
      li2.className = "bk-muted";
      list.appendChild(li2);
    }
    var when = $("bk-restore-when");
    if (when) when.textContent = v.created_at ? "備份時間：" + v.created_at.replace("T", " ").slice(0, 16) + "（UTC）" : "";
    box.hidden = false;
    btn.disabled = false;
  }

  function showDecBox(on) {
    var b = $("bk-dec-box");
    if (b) b.hidden = !on;
  }

  function resetRestoreState() {
    pending = null;
    encPending = null;
    renderPending(null);
    showDecBox(false);
  }

  /** 拿到「已是明文」的備份物件後的共同流程 */
  function accept(obj, password) {
    var v = global.CmBackup.validateBackup(obj);
    if (!v.ok) {
      setMsg(v.errors.join(" ") + " 沒有改動任何資料。", "warn");
      return;
    }
    pending = { obj: obj, v: v, password: password || "" };
    renderPending(v);
    setMsg("備份檔檢查通過。確認內容後，按「還原」。", "ok");
  }

  function onFile(ev) {
    resetRestoreState();
    var f = ev.target.files && ev.target.files[0];
    if (!f) return;
    if (!allowed()) {
      setMsg("你的角色沒有還原權限（需要「行政」或「牧者」）。", "warn");
      return;
    }
    var rd = new global.FileReader();
    rd.onload = function () {
      var obj;
      try {
        obj = JSON.parse(String(rd.result || ""));
      } catch (e) {
        setMsg("這個檔案不是正確的備份檔（讀不出內容）。沒有改動任何資料。", "warn");
        return;
      }
      if (crypto() && crypto().isEncrypted(obj) && obj.app === global.CmBackupConfig.APP_ID) {
        encPending = obj;
        showDecBox(true);
        setMsg("這是加密備份。請輸入密碼後按「解密」。", "ok");
        return;
      }
      accept(obj, "");
    };
    rd.onerror = function () {
      setMsg("讀不到這個檔案，沒有改動任何資料。", "warn");
    };
    rd.readAsText(f);
  }

  function onDecrypt() {
    if (!encPending || !crypto()) return Promise.resolve();
    var pw = $("bk-dec-pw") ? $("bk-dec-pw").value : "";
    setMsg("解密中，請稍候…", "");
    return crypto().decryptBackup(encPending, pw).then(
      function (obj) {
        showDecBox(false);
        encPending = null;
        clearPasswordFields();
        accept(obj, pw);
      },
      function (e) {
        setMsg((e && e.message ? e.message : "解密失敗") + " 沒有改動任何資料。可以再試一次。", "warn");
      }
    );
  }

  function onRestore() {
    if (!pending) return Promise.resolve();
    if (!allowed()) {
      setMsg("你的角色沒有還原權限。", "warn");
      return Promise.resolve();
    }
    var n = pending.v.items.length;
    if (
      !global.confirm(
        "還原會用備份檔「覆蓋」這臺電腦目前的 " + n + " 項資料，無法復原。\n\n系統會先自動下載一份「還原前備份」當保險。\n確定要還原嗎？"
      )
    ) {
      return Promise.resolve();
    }
    var now = new Date();
    var safety = global.CmBackup.buildBackup(global.localStorage, now);
    var hasSafety = Object.keys(safety.keys).length > 0;
    var current = pending;
    /* 原檔是加密的，保險備份也用同一個密碼加密，不讓個資以明文留在下載資料夾 */
    var safetyPromise = hasSafety ? packForDownload(safety, current.password) : Promise.resolve(null);
    return safetyPromise.then(
      function (out) {
        if (out) download(global.CmBackup.fileName(now, "bible100_before_restore" + (current.password ? "_enc" : "")), out);
        var res = global.CmBackup.restore(global.localStorage, current.obj);
        if (!res.ok) {
          setMsg(res.errors.join(" ") + " 沒有改動任何資料。", "warn");
          return;
        }
        logAct("backup_restored", { keys: res.written.length });
        resetRestoreState();
        var fileInput = $("bk-file");
        if (fileInput) fileInput.value = "";
        clearPasswordFields();
        renderReminder();
        renderIncluded();
        setMsg("已還原 " + res.written.length + " 項資料。請按下面的「重新整理頁面」，讓各頁讀到新資料。", "ok");
        var rl = $("bk-reload");
        if (rl) rl.hidden = false;
      },
      function (e) {
        setMsg("無法先做「還原前備份」（" + (e && e.message ? e.message : "未知錯誤") + "），為了安全沒有還原。", "warn");
      }
    );
  }

  function init() {
    if (!global.CmBackup || !global.CmBackupConfig) return;
    var ex = $("bk-export");
    var fi = $("bk-file");
    var go = $("bk-restore-go");
    var rl = $("bk-reload");
    var enc = $("bk-enc");
    var dec = $("bk-dec-go");
    if (ex) ex.addEventListener("click", onExport);
    if (fi) fi.addEventListener("change", onFile);
    if (go) go.addEventListener("click", onRestore);
    if (dec) dec.addEventListener("click", onDecrypt);
    if (enc) {
      if (!crypto() || !global.crypto || !global.crypto.subtle) {
        enc.disabled = true;
        var why = $("bk-enc-why");
        if (why) why.textContent = "（這個瀏覽器不支援加密）";
      }
      enc.addEventListener("change", function () {
        var box = $("bk-enc-box");
        if (box) box.hidden = !enc.checked;
      });
    }
    if (rl)
      rl.addEventListener("click", function () {
        global.location.reload();
      });
    var note = $("bk-origin");
    if (note) {
      note.textContent =
        global.location.protocol === "file:"
          ? "你現在是用「檔案方式（file://）」開啟，資料只存在這個開啟位置。"
          : "你現在是用網址 " + global.location.origin + " 開啟，資料只存在這個網址下。";
    }
    if (!allowed()) setMsg("你的角色沒有備份／還原權限（需要「行政」或「牧者」）。", "warn");
    renderReminder();
    renderIncluded();
  }

  global.CmBackupPanel = { init: init, onExport: onExport, onRestore: onRestore, onDecrypt: onDecrypt };
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof window !== "undefined" ? window : this);
