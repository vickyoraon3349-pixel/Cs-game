const {X,Z,boxes,spawns,loot}=MAP;
window.blk=(x,z,r)=>MAP.blocked(x,z,r);
const $=id=>document.getElementById(id);
const R=new THREE.WebGLRenderer({canvas:$("gl"),antialias:true});
R.setPixelRatio(Math.min(devicePixelRatio,2));
const sc=new THREE.Scene();sc.background=new THREE.Color(0x87b8e0);sc.fog=new THREE.Fog(0x87b8e0,50,170);
const cam=new THREE.PerspectiveCamera(60,1,.1,500);
function resize(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener("resize",resize);resize();
sc.add(new THREE.HemisphereLight(0xffffff,0x557744,.9));
const sun=new THREE.DirectionalLight(0xffffff,.6);sun.position.set(30,60,20);sc.add(sun);
const M=c=>new THREE.MeshLambertMaterial({color:c});
function plane(x,y,w,h,c,yy,op){const p=new THREE.Mesh(new THREE.PlaneGeometry(w*.2,h*.2),new THREE.MeshLambertMaterial({color:c,transparent:!!op,opacity:op||1}));p.rotation.x=-Math.PI/2;p.position.set(X(x+w/2),yy,Z(y+h/2));sc.add(p)}
plane(-100,-100,600,900,0x3f7a38,-.05);plane(0,0,400,700,0x6aa957,0);
plane(10,550,380,140,0x3b82e6,.02,.35);plane(10,10,380,140,0xe5484d,.02,.35);plane(140,300,120,100,0xd9c9a3,.03);
boxes.forEach(b=>{const m=new THREE.Mesh(new THREE.BoxGeometry(b.x1-b.x0,b.ht,b.z1-b.z0),M(b.c));m.position.set((b.x0+b.x1)/2,b.ht/2,(b.z0+b.z1)/2);sc.add(m)});

// ---------- Cartoon 3D Houses ----------
[
  {x:30,y:230,w:60,h:40,wall:0xffc477,roof:0xc64b36},
  {x:310,y:230,w:60,h:40,wall:0x75d6d0,roof:0x3268b2},
  {x:30,y:430,w:60,h:40,wall:0xffa5bb,roof:0x9146a8},
  {x:310,y:430,w:60,h:40,wall:0xffe58a,roof:0x43834a}
].forEach((h)=>{
  const cx=X(h.x+h.w/2), cz=Z(h.y+h.h/2);
  const ww=h.w*.2, dd=h.h*.2;
  // Bright house walls
  // Four walls with an open doorway at the front
  const addWall=(w,hh,d,x,y,z)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d),M(h.wall));
    mesh.position.set(x,y,z); sc.add(mesh);
  };
  const thick=.8;
  addWall(ww,2.2,thick,cx,1.1,cz-dd/2+thick/2);
  addWall(thick,2.2,dd-2*thick,cx-ww/2+thick/2,1.1,cz);
  addWall(thick,2.2,dd-2*thick,cx+ww/2-thick/2,1.1,cz);
  const segment=(ww-2.4)/2;
  addWall(segment,2.2,thick,cx-(1.2+segment)/2,1.1,cz+dd/2-thick/2);
  addWall(segment,2.2,thick,cx+(1.2+segment)/2,1.1,cz+dd/2-thick/2);

  // Four-sided cartoon roof
  const roof=new THREE.Mesh(
    new THREE.ConeGeometry(ww*.72,1.8,4),
    M(h.roof)
  );
  roof.rotation.y=Math.PI/4;
  roof.position.set(cx,3.05,cz); sc.add(roof);

  // Front door
  const door=new THREE.Mesh(new THREE.BoxGeometry(1.15,1.65,.12),M(0x70452c));
  door.position.set(cx,.83,cz+dd/2+.07); sc.add(door);

  // Two blue front windows
  [-1.9,1.9].forEach(dx=>{
    const frame=new THREE.Mesh(new THREE.BoxGeometry(1.45,1.05,.14),M(0xffffff));
    frame.position.set(cx+dx,1.48,cz+dd/2+.08); sc.add(frame);
    const glass=new THREE.Mesh(new THREE.BoxGeometry(1.15,.78,.05),M(0x55c9ff));
    glass.position.set(cx+dx,1.48,cz+dd/2+.17); sc.add(glass);
  });

  // Decorative side windows
  const side=new THREE.Mesh(new THREE.BoxGeometry(.06,1,.9),M(0x55c9ff));
  side.position.set(cx+ww/2+.04,1.45,cz); sc.add(side);
});

function label(t,c,w){const k=document.createElement("canvas");k.width=256;k.height=64;const g=k.getContext("2d");
 g.fillStyle="rgba(0,0,0,.65)";g.fillRect(0,0,256,64);g.fillStyle=c;g.font="bold 36px sans-serif";g.textAlign="center";g.fillText(t,128,44);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(k),depthTest:false}));s.scale.set(w,w/4,1);s.renderOrder=10;return s}
["A","B"].forEach(t=>spawns[t].forEach((p,i)=>{
 const d=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,.08,18),new THREE.MeshBasicMaterial({color:t==="A"?0x2f7de1:0xe5484d}));d.position.set(p.x,.08,p.z);sc.add(d);
 const l=label(t+(i+1),"#fff",2.4);l.position.set(p.x,1.3,p.z);sc.add(l)}));
const COL={"AK-47":"#ff9f1a","M4":"#ff6b35","Shotgun":"#e5484d","Sniper":"#a855f7","SMG":"#22d3ee","Armor":"#60a5fa","Medkit":"#4ade80"};
loot.forEach(o=>{const c=COL[o.n];
 const bm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,8,8),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.5}));bm.position.set(o.x,4,o.z);sc.add(bm);
 const l=label(o.n,c,3.4);l.position.set(o.x,2.2,o.z);sc.add(l)});

// ---------- खिलाड़ी ----------
const P=new THREE.Group();
const body=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,1.1,10),M(0x2f7de1));body.position.y=.75;P.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.28,12,10),M(0xffd2a6));head.position.y=1.55;P.add(head);
P.position.set(spawns.A[0].x,0,spawns.A[0].z);sc.add(P);
let yaw=0,pitch=.5,jx=0,jy=0,bird=false;const keys={};

// ---------- कंट्रोल ----------
addEventListener("keydown",e=>keys[e.key.toLowerCase()]=1);addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);
const jl=$("jl"),kn=$("kn");let jid=null;
function jm(e){const r=jl.getBoundingClientRect();let dx=e.clientX-(r.left+60),dy=e.clientY-(r.top+60);const l=Math.hypot(dx,dy),mx=50;if(l>mx){dx*=mx/l;dy*=mx/l}jx=dx/mx;jy=dy/mx;kn.style.left=(40+dx)+"px";kn.style.top=(40+dy)+"px"}
jl.addEventListener("pointerdown",e=>{jid=e.pointerId;jl.setPointerCapture(jid);jm(e)});
jl.addEventListener("pointermove",e=>{if(e.pointerId===jid)jm(e)});
const je=e=>{if(e.pointerId===jid){jid=null;jx=jy=0;kn.style.left="40px";kn.style.top="40px"}};
jl.addEventListener("pointerup",je);jl.addEventListener("pointercancel",je);
const runBtn=$("run");runBtn.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();window.running=true;runBtn.setPointerCapture(e.pointerId)});runBtn.addEventListener("pointerup",()=>window.running=false);runBtn.addEventListener("pointercancel",()=>window.running=false);const jumpBtn=$("jump");jumpBtn.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();if(onGround){jumpV=7;onGround=false}});
let jumpV=0,onGround=true;const lk=$("look");let lid=null,lx=0,ly=0;
lk.addEventListener("pointerdown",e=>{lid=e.pointerId;lk.setPointerCapture(lid);lx=e.clientX;ly=e.clientY});
lk.addEventListener("pointermove",e=>{if(e.pointerId!==lid)return;yaw-=(e.clientX-lx)*.006;pitch=Math.min(1,Math.max(.15,pitch+(e.clientY-ly)*.004));lx=e.clientX;ly=e.clientY});
const le=e=>{if(e.pointerId===lid)lid=null};lk.addEventListener("pointerup",le);lk.addEventListener("pointercancel",le);
$("bird").onclick=function(){bird=!bird;this.textContent=bird?"🏃 वापस नीचे":"🦅 ऊपर से देखें"};

// ---------- लूप ----------
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;
 let ix=jx,iy=jy;if(!jid){ix=(keys.d?1:0)-(keys.a?1:0);iy=(keys.s?1:0)-(keys.w?1:0)}
 const l=Math.hypot(ix,iy);
 if(!onGround||jumpV>0){P.position.y+=jumpV*dt;jumpV-=18*dt;if(P.position.y<=0){P.position.y=0;jumpV=0;onGround=true}}
 if(l>.1&&window.canMove!==false){const sp=(window.crouch?3:(window.running?10:6))*Math.min(1,l)*dt,fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
  const vx=(rx*ix-fx*iy)/l*sp,vz=(rz*ix-fz*iy)/l*sp;
  if(!blk(P.position.x+vx,P.position.z,.45))P.position.x+=vx;if(!blk(P.position.x,P.position.z+vz,.45))P.position.z+=vz;P.rotation.y=Math.atan2(vx,vz)}
 if(bird){cam.position.set(0,135,30);cam.lookAt(0,0,0)}
 else{const dist=2.2,h=1.8+pitch*1.2;cam.position.set(P.position.x+Math.sin(yaw)*dist,h,P.position.z+Math.cos(yaw)*dist);cam.lookAt(P.position.x-Math.sin(yaw)*5,1.65,P.position.z-Math.cos(yaw)*5)}
 R.render(sc,cam)}
requestAnimationFrame(frame);
