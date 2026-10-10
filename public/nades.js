(function(){
const objs=new Map(),fx=[];let myId=null;
const b=document.createElement("button");b.textContent="💣2";
b.style.cssText="position:fixed;right:156px;bottom:124px;width:56px;height:56px;border-radius:50%;border:3px solid #fff;background:#6b8e23cc;color:#fff;font-size:17px;z-index:5";
document.body.appendChild(b);
const throwIt=()=>{if(window.canMove)sock.emit("nade",{yaw})};
b.addEventListener("pointerdown",e=>{e.preventDefault();throwIt()});
addEventListener("keydown",e=>{if(e.key.toLowerCase()==="e")throwIt()});
sock.on("joined",d=>myId=d.id);
sock.on("state",s=>{const m=s.players.find(p=>p.id===myId);b.textContent="💣"+(m?m.nd:0);
 const seen=new Set();
 (s.nades||[]).forEach(n=>{seen.add(n.id);
  if(!objs.has(n.id)){const g=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshLambertMaterial({color:0x2e4d1e}));sc.add(g);objs.set(n.id,{g,n,t0:performance.now()-n.age})}});
 objs.forEach((o,id)=>{if(!seen.has(id)){sc.remove(o.g);objs.delete(id)}})});
sock.on("boom",d=>{
 const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:0xff9a1f,transparent:true,opacity:.7}));
 m.position.set(d.x,.6,d.z);sc.add(m);fx.push({m,t:0});
 const v=Math.max(.2,1-Math.hypot(d.x-P.position.x,d.z-P.position.z)/60);
 if(window.S){S.shot(v);setTimeout(()=>S.hurt(),40)}});
(function f(){requestAnimationFrame(f);const now=performance.now();
 objs.forEach(o=>{const el=now-o.t0,t=Math.min(1,el/700),n=o.n;
  o.g.position.set(n.sx+(n.ex-n.sx)*t,.2+12*t*(1-t),n.sz+(n.ez-n.sz)*t);
  o.g.material.color.setHex(el>1800&&Math.floor(now/120)%2?0xff2020:0x2e4d1e)});
 for(let i=fx.length-1;i>=0;i--){const e=fx[i];e.t+=1/60;const k=e.t/.45;
  e.m.scale.setScalar(.5+k*4.5);e.m.material.opacity=Math.max(0,.7*(1-k));
  if(k>=1){sc.remove(e.m);fx.splice(i,1)}}})();
})();
