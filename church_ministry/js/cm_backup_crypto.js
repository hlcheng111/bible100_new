/**
 * 備份加密（P6 後續，可選）——用密碼把備份檔鎖起來。
 *
 * 做法：密碼 → PBKDF2（SHA-256，迭代次數見 ITERATIONS）→ AES-GCM 256 位元。
 * 全程在這臺電腦的瀏覽器內完成（Web Crypto），不連網；密碼不會被儲存。
 * 重要：忘記密碼＝備份永遠打不開，沒有任何後門。
 *
 * 小白維護：想讓密碼更嚴格，改最上面的 MIN_PASSWORD_LENGTH。
 */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CmBackupCrypto = api;
})(typeof window !== "undefined" ? window : this, function (root) {
  "use strict";

  var MIN_PASSWORD_LENGTH = 8;
  var ITERATIONS = 250000;
  var ENVELOPE_VERSION = 1;

  function subtle(cryptoImpl) {
    var c = cryptoImpl || (root && root.crypto) || (typeof globalThis !== "undefined" ? globalThis.crypto : null);
    if (!c || !c.subtle) throw coded("NO_CRYPTO", "這個瀏覽器不支援加密功能。");
    return c;
  }

  function coded(code, msg) {
    var e = new Error(msg);
    e.code = code;
    return e;
  }

  function toB64(bytes) {
    var s = "";
    var CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(s);
  }

  function fromB64(b64) {
    var s = atob(String(b64 || ""));
    var out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }

  /** 密碼檢查：回傳 { ok, errors[] } */
  function checkPassword(pw, confirmPw) {
    var errors = [];
    pw = String(pw == null ? "" : pw);
    if (pw.length < MIN_PASSWORD_LENGTH) errors.push("密碼至少要 " + MIN_PASSWORD_LENGTH + " 個字。");
    if (confirmPw !== undefined && String(confirmPw) !== pw) errors.push("兩次輸入的密碼不一樣。");
    return { ok: errors.length === 0, errors: errors };
  }

  function deriveKey(c, password, salt, iterations) {
    var enc = new TextEncoder();
    return c.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]).then(function (base) {
      return c.subtle.deriveKey(
        { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" },
        base,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    });
  }

  function isEncrypted(obj) {
    return !!(obj && typeof obj === "object" && obj.encrypted === true && obj.cipher && typeof obj.data === "string");
  }

  /** 把備份物件加密成外殼；appId 用來辨識這是教會事工備份 */
  function encryptBackup(backupObj, password, appId, cryptoImpl) {
    var chk = checkPassword(password);
    if (!chk.ok) return Promise.reject(coded("WEAK_PASSWORD", chk.errors.join(" ")));
    var c;
    try {
      c = subtle(cryptoImpl);
    } catch (e) {
      return Promise.reject(e);
    }
    var salt = c.getRandomValues(new Uint8Array(16));
    var iv = c.getRandomValues(new Uint8Array(12));
    var plain = new TextEncoder().encode(JSON.stringify(backupObj));
    return deriveKey(c, String(password), salt, ITERATIONS)
      .then(function (key) {
        return c.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, plain);
      })
      .then(function (buf) {
        return {
          app: appId,
          encrypted: true,
          envelope_version: ENVELOPE_VERSION,
          created_at: new Date().toISOString(),
          kdf: { name: "PBKDF2", hash: "SHA-256", iterations: ITERATIONS, salt: toB64(salt) },
          cipher: { name: "AES-GCM", iv: toB64(iv) },
          data: toB64(new Uint8Array(buf))
        };
      });
  }

  /** 解開外殼，回傳原本的備份物件；密碼錯或檔案被改過 → code "BAD_PASSWORD_OR_DATA" */
  function decryptBackup(envelope, password, cryptoImpl) {
    if (!isEncrypted(envelope)) return Promise.reject(coded("NOT_ENCRYPTED", "這不是加密備份。"));
    if (!envelope.kdf || envelope.kdf.name !== "PBKDF2" || envelope.cipher.name !== "AES-GCM") {
      return Promise.reject(coded("UNSUPPORTED", "這個加密格式這個版本看不懂。"));
    }
    var iterations = Number(envelope.kdf.iterations);
    if (!isFinite(iterations) || iterations < 1000 || iterations > 5000000) {
      return Promise.reject(coded("UNSUPPORTED", "加密設定不正常，已拒絕處理。"));
    }
    var c;
    try {
      c = subtle(cryptoImpl);
    } catch (e) {
      return Promise.reject(e);
    }
    var salt, iv, data;
    try {
      salt = fromB64(envelope.kdf.salt);
      iv = fromB64(envelope.cipher.iv);
      data = fromB64(envelope.data);
    } catch (e2) {
      return Promise.reject(coded("BAD_PASSWORD_OR_DATA", "檔案內容損壞。"));
    }
    return deriveKey(c, String(password == null ? "" : password), salt, iterations)
      .then(function (key) {
        return c.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
      })
      .then(
        function (buf) {
          try {
            return JSON.parse(new TextDecoder().decode(buf));
          } catch (e3) {
            throw coded("BAD_PASSWORD_OR_DATA", "解開後的內容不正確。");
          }
        },
        function () {
          throw coded("BAD_PASSWORD_OR_DATA", "密碼不對，或檔案已被改動。");
        }
      );
  }

  return {
    MIN_PASSWORD_LENGTH: MIN_PASSWORD_LENGTH,
    ITERATIONS: ITERATIONS,
    checkPassword: checkPassword,
    isEncrypted: isEncrypted,
    encryptBackup: encryptBackup,
    decryptBackup: decryptBackup
  };
});
