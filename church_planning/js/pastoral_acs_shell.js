/**
 * 領袖健康診斷 · ACS 殼（30 封閉題 · 七維 rollup）
 */
(function (global) {
  "use strict";
  function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");}
  function switchTab(id){if(global.B100AcsBoot)B100AcsBoot.switchTab(id);else if(global.__b100SwitchTab)__b100SwitchTab(id);}
  function renderSurvey(){
    var host=document.getElementById("pastoral-survey-wrap");if(!host||!global.PastoralPack)return;
    var html='<h2 class="font-black text-violet-900 text-lg mb-2">30 題領袖健康快評（封閉題）</h2><p class="text-xs text-slate-600 mb-3">不含開放心聲 · 非考核 · <a class="underline" href="pastoral-spiritual-survey-pro.html">完整版協調頁</a></p><form id="pastoral-form" onsubmit="return PastoralAcsShell.submitQuick(event)">';
    ["A","B","C","D","E","F"].forEach(function(cat){
      html+='<p class="text-xs font-black text-violet-800 mt-3 border-b pb-1">類別 '+cat+'</p>';
      PastoralPack.QUESTIONS.filter(function(q){return q.id.charAt(0)===cat;}).forEach(function(q){
        html+='<fieldset class="acs-fieldset"><legend class="text-xs">'+esc(q.id)+'</legend><p class="text-sm mb-2">'+esc(q.label)+'</p><div class="acs-likert-row">';
        for(var s=1;s<=5;s++)html+='<label><input type="radio" name="'+q.id+'" value="'+s+'" required> '+s+'</label>';
        html+='</div></fieldset>';
      });
    });
    html+='<p id="pastoral-form-error" class="text-red-600 text-xs hidden"></p><button type="submit" class="acs-btn acs-btn--primary mt-3 w-full py-3">提交</button></form>';
    host.innerHTML=html;
  }
  function renderReport(run,opts){
    if(!run)return;
    document.getElementById("pastoral-report-content").classList.remove("hidden");
    document.getElementById("pastoral-report-empty").classList.add("hidden");
    document.getElementById("pastoral-demo-badge").classList.toggle("hidden",!run.is_demo);
    document.getElementById("pastoral-report-summary").innerHTML="<p>"+esc((run.coaching&&run.coaching.growth)||"")+"</p>";
    var viz=document.getElementById("pastoral-report-viz");
    if(viz&&global.PastoralHealthViz){viz.innerHTML=PastoralHealthViz.renderHealthBlock(run,{animate:!!opts.animate});if(opts.animate)setTimeout(function(){PastoralHealthViz.animateHealth(viz);},200);}
    if(global.PastoralPastoralDesk)PastoralPastoralDesk.applyDeskState(run);
  }
  function loadDemoReport(){var b=PastoralPack.buildDemoRun();if(!b.ok)return;switchTab("report");setTimeout(function(){renderReport(b.run,{animate:true});},200);}
  function submitQuick(ev){
    ev.preventDefault();var form=document.getElementById("pastoral-form"),err=document.getElementById("pastoral-form-error"),map={};
    PastoralPack.QUESTIONS.forEach(function(q){var el=form.querySelector('input[name="'+q.id+'"]:checked');if(el)map[q.id]=Number(el.value);});
    var built=PastoralPack.buildRun(map,{label:"快評"});
    if(!built.ok){if(err){err.textContent=(built.errors||[]).join(" ");err.classList.remove("hidden");}return false;}
    AssessmentRunStore.saveRun(built.run);switchTab("report");renderReport(built.run,{animate:true});return false;
  }
  global.loadDemoReport=loadDemoReport;
  function init(){
    if(!global.PastoralPack){if(global.B100AcsBoot)B100AcsBoot.showBootError("PastoralPack 未載入");return;}
    if(global.B100AcsBoot)B100AcsBoot.clearBootError();
    if(global.PastoralPastoralDesk)PastoralPastoralDesk.mountStaticDesk();
    var chain=PastoralPack.loadUpstreamChain&&PastoralPack.loadUpstreamChain();
    var b=document.getElementById("pastoral-upstream-banner");
    if(b&&chain&&chain.ok)b.innerHTML='<p class="text-sm text-violet-900">已連結靈命整體 '+chain.spiritual_overall+'</p>',b.classList.remove("hidden");
    renderSurvey();
    var latest=AssessmentRunStore&&AssessmentRunStore.loadLatest("pastoral");
    if(latest&&!latest.is_demo)renderReport(latest,{});
  }
  global.PastoralAcsShell={init:init,submitQuick:submitQuick,loadDemoReport:loadDemoReport,renderReport:renderReport};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(typeof window!=="undefined"?window:global);
