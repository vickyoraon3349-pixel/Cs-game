(function(){
const fb=document.createElement("button");
fb.textContent="🔥";
fb.style.cssText="position:fixed;right:24px;bottom:40px;width:84px;height:84px;border-radius:50%;border:3px solid #fff;background:#e5484dcc;color:#fff;font-size:34px;z-index:5";
document.body.appendChild(fb);
fb.addEventListener("pointerdown",e=>{e.preventDefault();if(window.netFire)netFire()});
addEventListener("keydown",e=>{if(e.key===" "&&window.netFire)netFire()});
})();
