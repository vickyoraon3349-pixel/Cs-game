(function(){
const NAMES={run:"🏃 दौड़ना",fire:"🔥 गोली",jump:"🦘 कूदना",crouch:"🧎 झुकना",reload:"🔄 रीलोड",gloo:"🧊 Gloo Wall",nade:"💣 ग्रेनेड",bird:"🦅 ऊपर से देखें",mini:"मिनी-मैप",ammo:"गोलियों की गिनती",fullscr:"⛶ फुल-स्क्रीन",joy:"जॉयस्टिक"};
const els={};
document.querySelectorAll("button").forEach(b=>{const t=b.textContent.trim();
 const m=[["🔥","fire"],["🔄","reload"],["🧊","gloo"],["🦘","jump"],["🧎","crouch"],["💣","nade"],["⛶","fullscr"],["🏃","run"]].find(x=>t.startsWith(x[0]));
 if(m)b.dataset.k=m[1];if(b.id==="bird")b.dataset.k="bird"});
document.querySelectorAll("body > div").forEach(d=>{if(d.style.zIndex==="9")d.classList.add("ovl");if(d.style.bottom==="200px")d.dataset.k="ammo"});
document.querySelectorAll("canvas").forEach(c=>{if(c.style.height==="158px")c.dataset.k="mini"});
const jl=document.getElementById("jl");if(jl)jl.dataset.k="joy";
document.querySelectorAll("[data-k]").forEach(e=>{const k=e.dataset.k;if(!els[k]){els[k]=e;e.dataset.orig=e.style.cssText}});

const st=document.createElement("style");
st.textContent=`
[data-k=gear]{position:fixed;right:195px;top:10px;padding:8px 12px;border:0;border-radius:8px;background:#000a;color:#fff;font-size:16px;z-index:30}
@media (orientation:landscape){[data-k=gear]{right:300px!important}}
body.edit .ovl{display:none!important}
body.edit [data-k],body.edit #jl{pointer-events:auto!important;outline:2px dashed #fff9}
body.edit [data-k=mini]{display:block!important}
body.edit [data-k=ammo]{min-width:90px;min-height:44px}
body.edit .sel,body.edit #jl.sel{outline:3px dashed #ffd23f!important}
#csp{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);z-index:40;background:#000d;color:#fff;border-radius:12px;padding:10px 14px;font:14px sans-serif;text-align:center;display:none;max-width:260px}
#csp button{font:inherit;padding:9px 14px;border:0;border-radius:8px;color:#fff;background:#2f7de1;margin:4px}`;
document.head.appendChild(st);

const g=document.createElement("button");g.textContent="⚙";g.dataset.k="gear";document.body.appendChild(g);
const p=document.createElement("div");p.id="csp";
p.innerHTML=`<div>बटन को उंगली से खींचकर रखिए</div><div id="csn" style="margin:6px 0;color:#ffd23f">कोई बटन चुनिए</div>
<div>साइज़: <input type="range" id="css" min="50" max="200" value="100" style="width:150px;vertical-align:middle"></div>
<div><button id="csr" style="background:#c92a2a">रीसेट</button><button id="csd">✔ हो गया</button></div>`;
document.body.appendChild(p);

const mq=matchMedia("(orientation:landscape)");
const LK=()=>"cs_layout_"+(mq.matches?"l":"p");
function load(){try{return JSON.parse(localStorage.getItem(LK()))||{}}catch(e){return{}}}
function save(){try{localStorage.setItem(LK(),JSON.stringify(cfg))}catch(e){}}
let cfg=load(),edit=false,sel=null,drag=null;
const PH="AK-47<br>30 / 30";

function size(el){const cs=getComputedStyle(el);let w=parseFloat(cs.width),h=parseFloat(cs.height);if(!w)w=el.offsetWidth||70;if(!h)h=el.offsetHeight||50;return[w,h]}
function restore(el){const d=el.style.display;el.style.cssText=el.dataset.orig;if(d)el.style.display=d}
function place(el,c){restore(el);const[w,h]=size(el),s=el.style;
 const L=Math.max(0,Math.min(innerWidth-w,c.x*innerWidth-w/2)),T=Math.max(0,Math.min(innerHeight-h,c.y*innerHeight-h/2));
 s.setProperty("left",L+"px","important");s.setProperty("top",T+"px","important");
 s.setProperty("right","auto","important");s.setProperty("bottom","auto","important");
 if(c.s&&c.s!==1){s.setProperty("transform","scale("+c.s+")","important");s.setProperty("transform-origin","center","important")}}
function applyAll(){Object.keys(els).forEach(k=>cfg[k]?place(els[k],cfg[k]):restore(els[k]))}
function ensure(k){if(cfg[k])return;const r=els[k].getBoundingClientRect();cfg[k]={x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight,s:1}}
function select(el){if(sel)sel.classList.remove("sel");sel=el;const sl=document.getElementById("css");
 if(!el){document.getElementById("csn").textContent="कोई बटन चुनिए";sl.disabled=true;return}
 el.classList.add("sel");const k=el.dataset.k;document.getElementById("csn").textContent=NAMES[k]||k;
 sl.disabled=(k==="joy");sl.value=Math.round(((cfg[k]&&cfg[k].s)||1)*100)}

document.addEventListener("pointerdown",e=>{if(!edit)return;
 if(e.target.closest("#csp")||e.target.closest("[data-k=gear]"))return;
 e.stopPropagation();e.preventDefault();
 const el=e.target.closest("[data-k]");
 if(el&&els[el.dataset.k]===el){select(el);const r=el.getBoundingClientRect();drag={el,dx:e.clientX-(r.left+r.width/2),dy:e.clientY-(r.top+r.height/2)}}
 else select(null)},true);
document.addEventListener("pointermove",e=>{if(!edit||!drag)return;e.stopPropagation();
 const k=drag.el.dataset.k;
 cfg[k]={x:Math.min(.98,Math.max(.02,(e.clientX-drag.dx)/innerWidth)),y:Math.min(.98,Math.max(.02,(e.clientY-drag.dy)/innerHeight)),s:(cfg[k]&&cfg[k].s)||1};
 place(drag.el,cfg[k])},true);
const up=()=>{if(drag){save();drag=null}};
document.addEventListener("pointerup",up,true);document.addEventListener("pointercancel",up,true);

const sl=document.getElementById("css");
sl.addEventListener("input",()=>{if(!sel)return;const k=sel.dataset.k;ensure(k);cfg[k].s=sl.value/100;place(sel,cfg[k])});
sl.addEventListener("change",save);
document.getElementById("csr").onclick=()=>{cfg={};try{localStorage.removeItem(LK())}catch(e){}applyAll();select(null)};
function toggle(on){edit=on;document.body.classList.toggle("edit",on);p.style.display=on?"block":"none";
 const am=els.ammo;
 if(on){if(am&&!am.textContent){am.innerHTML=PH;am.dataset.ph=1}}
 else{if(am&&am.dataset.ph&&am.innerHTML===PH)am.innerHTML="";if(am)delete am.dataset.ph;select(null);drag=null}}
g.addEventListener("click",()=>toggle(!edit));
document.getElementById("csd").onclick=()=>toggle(false);
const re=()=>{cfg=load();applyAll()};
mq.addEventListener("change",re);addEventListener("resize",()=>{if(!edit)applyAll()});
applyAll();
})();
