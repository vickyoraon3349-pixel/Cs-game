(function(){
const V="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/";
const URL="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Soldier.glb";
const toast=document.createElement("div");
toast.style.cssText="position:fixed;left:50%;bottom:8px;transform:translateX(-50%);background:#000c;color:#fff;font:13px sans-serif;padding:6px 12px;border-radius:8px;z-index:50;pointer-events:none;display:none;text-align:center";
document.body.appendChild(toast);
function say(t){toast.textContent=t;toast.style.display="block";setTimeout(()=>toast.style.display="none",5000)}
function js(src){return new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=()=>no(new Error(src));document.head.appendChild(s)})}
const dk=new THREE.MeshLambertMaterial({color:0x15171a});
let model=null,cn={};
js(V+"loaders/GLTFLoader.js").then(()=>js(V+"utils/SkeletonUtils.js")).then(()=>{
 new THREE.GLTFLoader().load(URL,gl=>{
  model=gl.scene;
  gl.animations.forEach(c=>{const n=c.name.toLowerCase();if(/idle/.test(n))cn.Idle=c;else if(/walk/.test(n))cn.Walk=c;else if(/run/.test(n))cn.Run=c});
  window.glbOn=true;
  say("3D किरदार लोड ✓ ("+gl.animations.map(c=>c.name).join(", ")+")")},
  undefined,e=>{console.log(e);say("3D किरदार नहीं मिला, पुराना ही चलेगा")})
}).catch(e=>{console.log(e);say("3D किरदार नहीं मिला, पुराना ही चलेगा")});

const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const find=(m,re)=>{let r=null;m.traverse(o=>{if(!r&&o.isBone&&re.test(o.name))r=o});return r};
function box(w,h,d,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),dk);m.position.set(x,y,z);return m}

const qa=new THREE.Quaternion(),qb=new THREE.Quaternion(),qc=new THREE.Quaternion();
function aim(bone,child,dW){
 bone.parent.getWorldQuaternion(qa);bone.getWorldQuaternion(qb);
 const cur=child.position.clone().normalize().applyQuaternion(qb);
 qc.setFromUnitVectors(cur,dW).multiply(qb);
 bone.quaternion.copy(qa.invert().multiply(qc));
 bone.updateMatrixWorld(true)}
function setWQ(bone,q){bone.parent.getWorldQuaternion(qa);bone.quaternion.copy(qa.invert().multiply(q));bone.updateMatrixWorld(true)}
// दो हड्डियों वाला हाथ/पैर टारगेट तक पहुँचाना
function arm(U,F,H,T,pole){
 const S=U.getWorldPosition(V3(0,0,0)),E0=F.getWorldPosition(V3(0,0,0)),H0=H.getWorldPosition(V3(0,0,0));
 const L1=S.distanceTo(E0),L2=E0.distanceTo(H0);
 const to=T.clone().sub(S);let d=to.length();const mx=L1+L2-.002;
 if(d>mx){to.multiplyScalar(mx/d);d=mx}
 if(d<.05)return;
 const dn=to.clone().divideScalar(d),a=(L1*L1-L2*L2+d*d)/(2*d),hh=Math.sqrt(Math.max(0,L1*L1-a*a));
 const p=pole.clone().sub(dn.clone().multiplyScalar(pole.dot(dn)));
 if(p.lengthSq()<1e-6)return;p.normalize();
 const E=S.clone().add(dn.clone().multiplyScalar(a)).add(p.multiplyScalar(hh));
 aim(U,F,E.sub(S).normalize());
 F.getWorldPosition(E0);
 aim(F,H,S.clone().add(to).sub(E0).normalize())}

function dress(g){
 const u=g.userData;u.gl=1;u.sp=0;u.cr=0;
 g.children[0].visible=false;g.children[1].visible=false;
 if(!u.team)u.team=g.children[0].material.color;
 const m=THREE.SkeletonUtils.clone(model);
 u.mats=[];
 m.traverse(o=>{if(o.isMesh){o.material=o.material.clone();u.mats.push(o.material);o.frustumCulled=false}});
 g.add(m);u.model=m;
 u.mx=new THREE.AnimationMixer(m);u.act={};u.w={Idle:1,Walk:0,Run:0};
 ["Idle","Walk","Run"].forEach(k=>{if(cn[k]){const a=u.mx.clipAction(cn[k]);a.play();a.setEffectiveWeight(k==="Idle"?1:0);u.act[k]=a}});
 const gun=new THREE.Group();
 gun.add(box(.08,.12,.62,0,0,0));gun.add(box(.04,.04,.3,0,.02,.44));
 gun.add(box(.07,.2,.1,0,-.14,.06));gun.add(box(.07,.1,.2,0,-.02,-.38));gun.add(box(.05,.14,.1,0,-.12,.22));
 g.add(gun);u.gun=gun;
 m.updateMatrixWorld(true);
 const b={chest:find(m,/Spine2$/),RU:find(m,/RightArm$/),RF:find(m,/RightForeArm$/),RH:find(m,/RightHand$/),LU:find(m,/LeftArm$/),LF:find(m,/LeftForeArm$/),LH:find(m,/LeftHand$/)};
 u.b=Object.values(b).every(x=>x)?b:null;
 const l={LUL:find(m,/LeftUpLeg$/),LLG:find(m,/LeftLeg$/),LFT:find(m,/LeftFoot$/),RUL:find(m,/RightUpLeg$/),RLG:find(m,/RightLeg$/),RFT:find(m,/RightFoot$/)};
 u.bl=Object.values(l).every(x=>x)?l:null;
 if(u.b){const r=m.worldToLocal(u.b.RU.getWorldPosition(V3(0,0,0))).sub(m.worldToLocal(u.b.LU.getWorldPosition(V3(0,0,0)))).normalize();
  const f=V3(0,1,0).cross(r);if(f.z<0)m.rotation.y=Math.PI}
 if(!u.b)gun.position.set(.2,1.1,.4);
 u.lx=g.position.x;u.lz=g.position.z}

let last=performance.now();
(function f(now){requestAnimationFrame(f);const dt=Math.max(.001,Math.min(.1,(now-last)/1000));last=now;
 if(!model)return;
 sc.children.forEach(g=>{
  if(g.type!=="Group"||g.children.length<2)return;
  const b0=g.children[0],h0=g.children[1];
  if(!b0.geometry||b0.geometry.type!=="CylinderGeometry"||!h0.geometry||h0.geometry.type!=="SphereGeometry")return;
  if(!g.userData.gl)dress(g);
  const u=g.userData,sp=Math.hypot(g.position.x-u.lx,g.position.z-u.lz)/dt;
  u.lx=g.position.x;u.lz=g.position.z;
  if(u.rig)u.rig.visible=false;
  // चाल के हिसाब से एनिमेशन और उसकी रफ़्तार
  u.sp+=(sp-u.sp)*Math.min(1,dt*12);
  const s=u.sp,tg=s<.8?"Idle":(s<3.8?"Walk":"Run");
  for(const k in u.w){u.w[k]+=((k===tg?1:0)-u.w[k])*Math.min(1,dt*10);if(u.act[k])u.act[k].setEffectiveWeight(u.w[k])}
  if(u.act.Walk)u.act.Walk.setEffectiveTimeScale(Math.min(2.2,Math.max(.8,s/1.7)));
  if(u.act.Run)u.act.Run.setEffectiveTimeScale(Math.min(1.5,Math.max(.9,s/5)));
  u.mx.update(dt);
  u.mats.forEach(m=>m.color.setRGB(1,1,1).lerp(u.team,.5));
  g.updateMatrixWorld(true);
  const gq=g.getWorldQuaternion(new THREE.Quaternion());
  // असली झुकना: कमर नीची, पैर ज़मीन पर, घुटने मुड़ें
  const want=(g===P?window.crouch:u.c)?1:0;
  u.cr+=(want-u.cr)*Math.min(1,dt*10);
  const bl=u.bl;
  if(bl&&u.cr>.02){
   const fl=bl.LFT.getWorldPosition(V3(0,0,0)),fr=bl.RFT.getWorldPosition(V3(0,0,0));
   const ql=bl.LFT.getWorldQuaternion(new THREE.Quaternion()),qr=bl.RFT.getWorldQuaternion(new THREE.Quaternion());
   u.model.position.y=-.38*u.cr;g.updateMatrixWorld(true);
   const fw=V3(0,0,1).applyQuaternion(gq);
   arm(bl.LUL,bl.LLG,bl.LFT,fl,fw);arm(bl.RUL,bl.RLG,bl.RFT,fr,fw);
   setWQ(bl.LFT,ql);setWQ(bl.RFT,qr)
  }else u.model.position.y=0;
  // दोनों हाथों में गन
  if(u.b){
   const bb=u.b;
   const gp=bb.chest.getWorldPosition(V3(0,0,0)).add(V3(0,-.1,.24).applyQuaternion(gq));
   u.gun.position.copy(g.worldToLocal(gp.clone()));
   const w=(x,y,z)=>gp.clone().add(V3(x,y,z).applyQuaternion(gq));
   arm(bb.RU,bb.RF,bb.RH,w(0,-.14,.06),V3(-.6,-.6,-.3).applyQuaternion(gq));
   arm(bb.LU,bb.LF,bb.LH,w(0,-.04,.30),V3(.6,-.6,-.3).applyQuaternion(gq))}})
})(performance.now());
})();
