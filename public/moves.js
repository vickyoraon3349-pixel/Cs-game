(function(){
let jy=0,vy=0;window.crouch=false;
const mk=(t,css)=>{const b=document.createElement("button");b.textContent=t;b.style.cssText="position:fixed;width:56px;height:56px;border-radius:50%;border:3px solid #fff;color:#fff;font-size:24px;z-index:5;"+css;document.body.appendChild(b);return b};
const jb=mk("🦘","right:24px;bottom:134px;background:#2fb344cc");
const cb=mk("🧎","right:90px;bottom:124px;background:#f08c00cc");
function jump(){if(window.canMove&&jy===0&&!window.crouch)vy=7}
function toggle(){window.crouch=!window.crouch;cb.style.background=window.crouch?"#c92a2acc":"#f08c00cc"}
jb.addEventListener("pointerdown",e=>{e.preventDefault();jump()});
cb.addEventListener("pointerdown",e=>{e.preventDefault();if(window.canMove)toggle()});
addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(k==="j")jump();if(k==="c"&&window.canMove)toggle()});
let last=performance.now();
(function f(now){requestAnimationFrame(f);const dt=Math.min(.05,(now-last)/1000);last=now;
 if(!window.canMove){if(window.crouch)toggle();jy=0;vy=0}
 if(vy!==0||jy>0){vy-=22*dt;jy+=vy*dt;if(jy<=0){jy=0;vy=0}}
 P.position.y=jy;P.scale.y=window.crouch?.65:1;
 sc.children.forEach(g=>{const u=g.userData;if(u&&u.j!==undefined){g.position.y+=((u.j||0)-g.position.y)*.4;g.scale.y+=((u.c?.65:1)-g.scale.y)*.4}})
})(performance.now());
})();
