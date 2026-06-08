/**
 * Tab ③ 領袖健康 · 七維橫條
 */
(function (global) {
  "use strict";
  function esc(s) { return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
  function barColor(s) { if(s==null)return"#94a3b8"; if(s>=4)return"#10b981"; if(s>=2.8)return"#d97706"; return"#ef4444"; }
  function renderHealthBlock(run, opts) {
    if(!run||!global.PastoralPack)return"";
    var d=run.derived||{}, dim=d.dim_scores||{}, labels=PastoralPack.DIM_LABELS||{}, html="";
    Object.keys(dim).forEach(function(k){
      var s=dim[k], pct=s!=null?Math.max(8,(s/5)*100):8;
      html+='<div class="pastoral-bar-row"><div class="flex justify-between text-xs font-bold mb-1"><span>'+esc(labels[k]||k)+'</span><span>'+(s!=null?s.toFixed(1):"—")+'/5</span></div><div class="pastoral-bar-track"><div class="pastoral-bar-fill" data-width="'+pct+'" style="width:0;background:'+barColor(s)+'"></div></div></div>';
    });
    return '<div class="pastoral-viz-wrap" data-animate="'+(opts.animate?"1":"0")+'"><p class="text-sm mb-2"><strong>整體</strong> '+(d.overall_score!=null?d.overall_score:"—")+' · '+esc(d.tier_copy||"")+'</p>'+html+'</div>';
  }
  function animateHealth(host){var w=host?host.querySelector(".pastoral-viz-wrap"):document.querySelector(".pastoral-viz-wrap");if(!w||w.getAttribute("data-animate")!=="1")return;w.querySelectorAll(".pastoral-bar-fill").forEach(function(el,i){setTimeout(function(){el.style.width=(el.getAttribute("data-width")||0)+"%";},60+i*60);});}
  global.PastoralHealthViz={renderHealthBlock:renderHealthBlock,animateHealth:animateHealth};
})(typeof window!=="undefined"?window:global);
