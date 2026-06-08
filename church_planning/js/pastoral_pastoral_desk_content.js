/**
 * Tab ④ 領袖健康長執桌 · 煙霧探測器模板
 */
(function (global) {
  "use strict";
  var BURN='<div id="pastoral-burn-banner" class="pastoral-burn-banner hidden"><h3>耗盡警訊（BURNOUT）</h3><p>長執議程應先談減負與安息，而非加新活動。</p></div>';
  var DESK='<article id="pastoral-desk-body"><h3>一、HITL 宣告</h3><p>數據是煙霧探測器，非考核排名。最終分辨回到牧長一對一。</p><h3>二、宣讀七維</h3><p>宣讀 tier_copy 與 risk_flags。</p><h3>三、長執三問</h3><ol><li>我們是否在要求快沒油的引擎加速？</li><li>誰需要強制休假？</li><li>要暫緩哪一項新提案？</li></ol><h3>四、完整版</h3><p><a href="pastoral-spiritual-survey-pro.html">協調版問卷</a> 含開放心聲與匯出。</p></article>';
  function applyDeskState(run){
    var burn=run&&run.risk_flags&&run.risk_flags.indexOf("BURNOUT")>=0;
    var b=document.getElementById("pastoral-burn-banner");if(b)b.classList.toggle("hidden",!burn);
    var st=document.getElementById("pastoral-desk-status");
    if(st)st.innerHTML=burn?'<p class="text-rose-800 font-bold">BURNOUT 亮起 · 先減負。</p>':'<p>可照常檢視。</p>';
  }
  function mountStaticDesk(){
    var h=document.getElementById("pastoral-tab-methodology-content");
    if(!h||h.querySelector("#pastoral-desk-body"))return;
    h.innerHTML='<div class="acs-card"><h2 class="font-black text-violet-900 mb-2">4. 領袖健康長執桌</h2>'+BURN+'<div id="pastoral-desk-status"></div>'+DESK+'</div>';
  }
  global.PastoralPastoralDesk={mountStaticDesk:mountStaticDesk,applyDeskState:applyDeskState};
})(typeof window!=="undefined"?window:global);
