(function(){
const map=[["🔥","fire"],["🔄","reload"],["🧊","gloo"],["🦘","jump"],["🧎","crouch"],["💣","nade"]];
document.querySelectorAll("button").forEach(b=>{
 const t=b.textContent.trim(),m=map.find(x=>t.startsWith(x[0]));
 if(m)b.dataset.k=m[1];
 if(b.id==="bird")b.dataset.k="bird"});
document.querySelectorAll("body > div").forEach(d=>{
 if(d.style.zIndex==="9")d.classList.add("ovl");
 if(d.style.bottom==="200px")d.dataset.k="ammo"});
document.querySelectorAll("canvas").forEach(c=>{if(c.style.height==="158px")c.dataset.k="mini"});

const st=document.createElement("style");
st.textContent=`
[data-k=fullscr]{position:fixed;right:145px;top:10px;padding:8px 12px;border:0;border-radius:8px;background:#000a;color:#fff;font-size:16px;z-index:5}
@media (orientation:landscape){
 #look{top:0!important;width:55%!important}
 #jl{left:30px!important;bottom:20px!important}
 [data-k=fire]{right:28px!important;bottom:40px!important}
 [data-k=jump]{right:124px!important;bottom:30px!important}
 [data-k=crouch]{right:190px!important;bottom:30px!important}
 [data-k=reload]{right:124px!important;bottom:96px!important}
 [data-k=gloo]{right:190px!important;bottom:96px!important}
 [data-k=nade]{right:28px!important;bottom:140px!important}
 [data-k=mini]{top:10px!important;right:10px!important;width:72px!important;height:126px!important}
 [data-k=bird]{top:10px!important;right:110px!important}
 [data-k=fullscr]{right:245px!important}
 [data-k=ammo]{right:112px!important;bottom:auto!important;top:56px!important}
 .ovl{overflow:auto!important;justify-content:flex-start!important;padding-top:10px!important}
 .ovl h2{margin:2px 0!important}
}`;
document.head.appendChild(st);

const fb=document.createElement("button");
fb.textContent="⛶";fb.dataset.k="fullscr";document.body.appendChild(fb);
fb.onclick=async()=>{try{
 if(!document.fullscreenElement){await document.documentElement.requestFullscreen();try{await screen.orientation.lock("landscape")}catch(e){}}
 else{document.exitFullscreen();try{screen.orientation.unlock()}catch(e){}}
}catch(e){}};
})();
