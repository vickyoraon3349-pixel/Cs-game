(function(){
const socket=io();window.sock=socket;socket.on("connect",()=>{if(window.__c)location.reload();window.__c=1});
const TC={A:0x2f7de1,B:0xe5484d};
const COL={"AK-47":"#ff9f1a","M4":"#ff6b35","Shotgun":"#e5484d","Sniper":"#a855f7","SMG":"#22d3ee","Armor":"#60a5fa","Medkit":"#4ade80"};
const $=id=>document.getElementById(id);
const mk=(css,html)=>{const e=document.createElement("div");e.style.cssText=css;if(html)e.innerHTML=html;document.body.appendChild(e);return e};
const OV="position:fixed;inset:0;background:#000d;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;z-index:9;font-family:sans-serif;text-align:center;padding:20px;box-sizing:border-box";
const inp="font-size:18px;padding:12px;border-radius:10px;border:0;text-align:center;width:220px";
const btn="font-size:18px;padding:13px 20px;border:0;border-radius:10px;background:#2f7de1;color:#fff";
const lobby=mk(OV,`<h2 style="margin:0">Clash Squad 4 vs 4</h2>
<input id="nm" placeholder="आपका नाम" maxlength="12" style="${inp}">
<input id="rm" placeholder="Room ID (जैसे AB12)" maxlength="10" style="${inp};text-transform:uppercase">
<button id="go" style="${btn}">रूम में जाएँ</button><div id="er" style="color:#ffb0b3;min-height:22px"></div>`);
const wait=mk(OV,`<h2 style="margin:0">Room: <span id="rid"></span></h2><div id="pl" style="line-height:1.8"></div>
<button id="st" style="${btn}">▶ खेल शुरू करें</button>
<div style="font-size:14px;opacity:.85">दोनों टीमों में खिलाड़ी हों तो असली मैच, अकेले हों तो प्रैक्टिस</div>`);
wait.style.display="none";
const hud=mk("position:fixed;left:10px;top:34px;color:#fff;text-shadow:0 1px 3px #000;font:14px/1.4 sans-serif;pointer-events:none");
const msg=mk("position:fixed;left:0;right:0;top:28%;text-align:center;color:#fff;text-shadow:0 1px 3px #000;font:700 22px sans-serif;pointer-events:none");
const feed=mk("position:fixed;left:10px;top:110px;color:#fff;text-shadow:0 1px 3px #000;font:13px sans-serif;pointer-events:none");
let myId=null,myTeam="A",joined=false,st=null,mine=null,mt=0,lastBanner="",cd=0,deadMsg=-1;
const others=new Map();
function say(t,c,s){msg.textContent=t;msg.style.color=c||"#fff";mt=s||2}
$("go").onclick=()=>{const r=$("rm").value.trim();if(!r){$("er").textContent="पहले Room ID डालिए";return}
 socket.emit("join",{room:r,name:$("nm").value.trim()||"प्लेयर"})};
$("st").onclick=()=>socket.emit("start");
socket.on("full",()=>$("er").textContent="रूम भरा है (8/8)");
socket.on("joined",d=>{myId=d.id;myTeam=d.team;joined=true;lobby.style.display="none";wait.style.display="flex";$("rid").textContent=d.room;P.children[0].material.color.set(TC[d.team])});
socket.on("spawn",d=>{P.position.set(d.x,0,d.z);yaw=d.yaw});
socket.on("pick",d=>say(d.n+(MAP.GUNS[d.n]?" उठा ली!":" मिला!"),COL[d.n]));
socket.on("feed",t=>{feed.textContent=t;setTimeout(()=>{if(feed.textContent===t)feed.textContent=""},4000)});
socket.on("shot",d=>{const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(d.sx,1.2,d.sz),new THREE.Vector3(d.ex,1.2,d.ez)]);
 const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffe066}));sc.add(l);setTimeout(()=>sc.remove(l),80)});
const lootObj=loot.map(o=>sc.children.filter(c=>Math.abs(c.position.x-o.x)<.01&&Math.abs(c.position.z-o.z)<.01));
socket.on("state",s=>{st=s;mine=s.players.find(p=>p.id===myId)||null;
 window.canMove=!!(mine&&mine.alive&&s.phase==="live");P.visible=!!(mine&&mine.alive);
 wait.style.display=(joined&&s.phase==="wait")?"flex":"none";
 if(s.phase==="wait"){const t=k=>s.players.filter(p=>p.team===k).map(p=>p.name).join(", ")||"—";
  $("pl").innerHTML=`<span style="color:#9cc3ff">🔵 टीम A:</span> ${t("A")}<br><span style="color:#ffb0b3">🔴 टीम B:</span> ${t("B")}<br><small>आप: टीम ${myTeam}</small>`}
 if(s.banner!==lastBanner){lastBanner=s.banner;if(s.banner)say(s.banner,"#ffd23f",4)}
 if(mine&&!mine.alive&&s.phase==="live"&&deadMsg!==s.round){deadMsg=s.round;say("आप आउट हैं। अगले राउंड का इंतज़ार...","#ffb0b3",3)}
 hud.innerHTML=`राउंड ${s.round} · 🔵 ${s.sa} - ${s.sb} 🔴<br>टीम ${myTeam} · HP ${mine?mine.hp:0} · Armor ${mine?mine.arm:0}<br>गन: <b>${mine?mine.gun:"-"}</b> · मारे: ${mine?mine.kills:0}`;
 lootObj.forEach((a,i)=>a.forEach(c=>c.visible=!s.loot[i]));
 const seen=new Set();
 s.players.forEach(p=>{if(p.id===myId)return;seen.add(p.id);let o=others.get(p.id);
  if(!o){const g=new THREE.Group();
   const b=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,1.1,10),new THREE.MeshLambertMaterial({color:TC[p.team]}));b.position.y=.75;g.add(b);
   const h=new THREE.Mesh(new THREE.SphereGeometry(.28,12,10),new THREE.MeshLambertMaterial({color:0xffd2a6}));h.position.y=1.55;g.add(h);
   const hb=new THREE.Sprite(new THREE.SpriteMaterial({color:p.team===myTeam?0x4da3ff:0x44ff44,depthTest:false}));hb.scale.set(1.2,.14,1);hb.position.y=2.1;hb.renderOrder=11;g.add(hb);
   if(p.team===myTeam){const l=label(p.name,"#9cc3ff",2.2);l.position.y=2.6;g.add(l)}
   g.position.set(p.x,0,p.z);sc.add(g);o={g,hb};others.set(p.id,o)}
  o.tx=p.x;o.tz=p.z;o.ty=p.yaw;o.g.userData.j=p.j||0;o.g.userData.c=p.c||0;o.g.visible=p.alive;o.hb.scale.x=Math.max(.01,1.2*p.hp/100)});
 others.forEach((o,id)=>{if(!seen.has(id)){sc.remove(o.g);others.delete(id)}})});
window.netFire=()=>{if(!window.canMove||performance.now()<cd)return;cd=performance.now()+(MAP.GUNS[mine.gun].c*1000);
 P.rotation.y=Math.atan2(-Math.sin(yaw),-Math.cos(yaw));socket.emit("fire",{yaw})};
setInterval(()=>{if(joined&&window.canMove)socket.emit("move",{x:P.position.x,z:P.position.z,yaw,j:P.position.y,c:window.crouch?1:0})},50);
(function f(){requestAnimationFrame(f);
 others.forEach(o=>{o.g.position.x+=(o.tx-o.g.position.x)*.25;o.g.position.z+=(o.tz-o.g.position.z)*.25;o.g.rotation.y=Math.atan2(-Math.sin(o.ty),-Math.cos(o.ty))});
 if(mt>0){mt-=1/60;if(mt<=0)msg.textContent=""}})();
})();
