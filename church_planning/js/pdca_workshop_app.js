/**
 * B 軌 · 深度質性工作坊（Vue 五步 · 嵌入 Tab ②）
 * 完成 → PdcaPack.mergeWorkshop → PdcaAcsShell.onWorkshopComplete
 */
(function (global) {
  "use strict";

  var PDCA_KEY = "chp2026-pdca-log";
  var WIZARD_CYCLE_ID = "pdca-wizard-main";
  var _app = null;

  function emptyCycle() {
    var t = new Date().toISOString();
    return {
      id: WIZARD_CYCLE_ID,
      createdAt: t,
      updatedAt: t,
      ministryContext: "",
      planProblem: "",
      planRows: [{ action: "", ownerRole: "", eta: "" }],
      doRows: [{ status: "", actualNote: "" }],
      doProgressNotes: "",
      doTrafficLight: "green",
      checkOutcome: "",
      checkEvidence: "",
      checkGap: "",
      checkRhythmNote: "",
      actKeep: "",
      actAdjust: "",
      actStop: "",
      actMustChange: "",
      actOwner: "",
      actDueDate: "",
      actStandardize: false,
      linkedFocusSource: "none",
      linkedFocusLabel: ""
    };
  }

  function loadLegacyCycle() {
    try {
      var raw = localStorage.getItem(PDCA_KEY) || localStorage.getItem("chp2026-pdca-v1");
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (!p || !Array.isArray(p.cycles)) return null;
      var found = p.cycles.filter(function (x) {
        return x && x.id === WIZARD_CYCLE_ID;
      })[0];
      return found ? Object.assign(emptyCycle(), found) : null;
    } catch (e) {
      return null;
    }
  }

  function persistLegacy(vm) {
    try {
      var rv = vm.likertSel === "" ? null : Number(vm.likertSel);
      vm.c.checkRhythmScore = rv;
      vm.c.updatedAt = new Date().toISOString();
      var raw = localStorage.getItem(PDCA_KEY);
      var parsed = raw ? JSON.parse(raw) : { version: 1, cycles: [], seasonFocusLines: ["", "", ""] };
      var others = (parsed.cycles || []).filter(function (x) {
        return x && x.id !== WIZARD_CYCLE_ID;
      });
      parsed.cycles = [vm.c].concat(others);
      parsed.seasonFocusLines = parsed.seasonFocusLines || ["", "", ""];
      parsed.seasonFocusLines[0] = vm.seasonLine || "";
      localStorage.setItem(PDCA_KEY, JSON.stringify(parsed));
    } catch (e) {}
  }

  function mountWorkshop() {
    if (_app || !global.Vue || !global.PdcaPack) return;
    var root = document.getElementById("pdca-workshop-app");
    if (!root) return;

    _app = Vue.createApp({
      data: function () {
        var c = loadLegacyCycle() || emptyCycle();
        var pre = PdcaPack.applyWorkshopUpstreamPrefill(c, "");
        return {
          planStep: 0,
          seasonLine: pre.seasonLine || "",
          likertSel: "",
          c: pre.cycle,
          upstreamBanner: !!(pre.upstream && pre.upstream.ok),
          upstreamText: ""
        };
      },
      mounted: function () {
        var pre = PdcaPack.applyWorkshopUpstreamPrefill(this.c, this.seasonLine);
        this.c = pre.cycle;
        this.seasonLine = pre.seasonLine;
        if (pre.upstream && pre.upstream.ok) {
          var parts = [];
          if (pre.upstream.swot_primary) parts.push("戰略「" + pre.upstream.swot_primary + "」");
          if (pre.upstream.ncd_minimum) parts.push("NCD「" + pre.upstream.ncd_minimum.label + "」");
          this.upstreamText = parts.join(" · ");
          this.upstreamBanner = true;
        }
      },
      methods: {
        addPlanRow: function () {
          this.c.planRows.push({ action: "", ownerRole: "", eta: "" });
          this.c.doRows.push({ status: "", actualNote: "" });
        },
        removePlanRow: function (i) {
          if (this.c.planRows.length <= 1) return;
          this.c.planRows.splice(i, 1);
          this.c.doRows.splice(i, 1);
        },
        goNext: function () {
          if (this.planStep === 1) {
            while (this.c.doRows.length < this.c.planRows.length) {
              this.c.doRows.push({ status: "", actualNote: "" });
            }
          }
          persistLegacy(this);
          if (this.planStep < 4) this.planStep++;
        },
        goPrev: function () {
          persistLegacy(this);
          if (this.planStep > 0) this.planStep--;
        },
        completeWorkshop: function () {
          persistLegacy(this);
          var result = PdcaPack.mergeWorkshop({
            cycle: this.c,
            seasonLine: this.seasonLine,
            likertSel: this.likertSel
          });
          if (!result.ok) {
            var msg = (result.errors || ["提交失敗"]).join(" ");
            if (global.PdcaAcsShell && PdcaAcsShell.showToast) PdcaAcsShell.showToast(msg);
            else window.alert(msg);
            return;
          }
          if (global.PdcaAcsShell && PdcaAcsShell.onWorkshopComplete) {
            PdcaAcsShell.onWorkshopComplete(result.run);
          }
        }
      },
      template: "#pdca-workshop-template"
    });
    _app.mount("#pdca-workshop-app");
  }

  global.PdcaWorkshopApp = {
    mount: mountWorkshop,
    remount: function () {
      if (_app && _app.unmount) {
        try {
          _app.unmount();
        } catch (e) {}
      }
      _app = null;
      mountWorkshop();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(mountWorkshop, 80);
    });
  } else {
    setTimeout(mountWorkshop, 80);
  }
})(typeof window !== "undefined" ? window : global);
