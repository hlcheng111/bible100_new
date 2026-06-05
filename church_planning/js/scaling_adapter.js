/**
 * 量尺橋接：將 A1（1–6）、NCD 維度總分（0–65）等轉為策略引擎內部標度 1.0–5.0。
 * 對齊 docs/tool-assessment-consensus-framework.md：NCD 以 39→3.0、52→4.0 為分段錨點。
 */
(function (global) {
  "use strict";

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function toNum(v) {
    var n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  /** A1／六點量表：1–6 → 1.0–5.0（線性） */
  function a1Likert6ToInternal(x) {
    var v = toNum(x);
    if (v == null) return null;
    v = clamp(v, 1, 6);
    return clamp(1 + ((v - 1) * 4) / 5, 1, 5);
  }

  /**
   * NCD 單維度原始分（13 題加總，理論 13–65，介面以 0–65 容錯）：分段線性
   * x∈[0,39): 1.0→3.0；[39,52]: 3.0→4.0；(52,65]: 4.0→5.0
   */
  function ncdRaw65ToInternal(x) {
    var v = toNum(x);
    if (v == null) return null;
    v = clamp(v, 0, 65);
    if (v < 39) return clamp(1 + (v / 39) * 2, 1, 5);
    if (v <= 52) return clamp(3 + (v - 39) / 13, 1, 5);
    return clamp(4 + (v - 52) / 13, 1, 5);
  }

  /** 已為 1–5 的牧養／Likert：僅截斷 */
  function likert5ToInternal(x) {
    var v = toNum(x);
    if (v == null) return null;
    return clamp(v, 1, 5);
  }

  /**
   * @param {number} value
   * @param {string} sourceTool
   *   - a1_likert6 | a1
   *   - ncd_dim_65 | ncd | ncd_65
   *   - likert5 | pastoral_likert5 | internal_1_5
   */
  function toInternalScale(value, sourceTool) {
    var t = String(sourceTool || "")
      .toLowerCase()
      .replace(/-/g, "_");
    if (t === "a1" || t === "a1_likert6" || t === "a1_likert_6") return a1Likert6ToInternal(value);
    if (t === "ncd" || t === "ncd_dim" || t === "ncd_dim_65" || t === "ncd_65") return ncdRaw65ToInternal(value);
    if (
      t === "likert5" ||
      t === "pastoral_likert5" ||
      t === "internal" ||
      t === "internal_1_5"
    ) {
      return likert5ToInternal(value);
    }
    var n = toNum(value);
    if (n == null) return null;
    if (n > 5.5) return ncdRaw65ToInternal(n);
    if (n > 5) return likert5ToInternal(n);
    if (n >= 1 && n <= 5) return likert5ToInternal(n);
    return a1Likert6ToInternal(n);
  }

  var TOOL = {
    A1_LIKERT6: "a1_likert6",
    NCD_DIM_65: "ncd_dim_65",
    LIKERT5: "likert5",
    INTERNAL_1_5: "internal_1_5"
  };

  global.ScalingAdapter = {
    TOOL: TOOL,
    clamp: clamp,
    toInternalScale: toInternalScale,
    a1Likert6ToInternal: a1Likert6ToInternal,
    ncdRaw65ToInternal: ncdRaw65ToInternal,
    likert5ToInternal: likert5ToInternal
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
