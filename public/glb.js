(function(){
const V="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/";
const URL="https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Soldier.glb";
const toast=document.createElement("div");
toast.style.cssText="position:fixed;left:50%;bottom:8px;transform:translateX(-50%);background:#000c;color:#fff;font:13px sans-serif;padding:6px 12px;border-radius:8px;z-index:50;pointer-events:none;display:none";
document.body.appendChild(toast);
function say(t){toast.textContent=t;toast.style.display="block";setTimeout(()=>toast.style.display="none",4000)}
function js(src){return new Promise((ok,no)=>{const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=()=>no(new Error(src));document.head.appendChild(s)})}
const dk=new THREE.MeshLambertMaterial({color:0x15171a});
let model=null,clips=null;
js(V+"loaders/GLTFLoader.js").then(()=>js(V+"utils/SkeletonUtils.js")).then(()=>{
 new THREE.GLTFLoader().load(URL,gl=>{model=gl.scene;clips=gl.animations;say("3D किरदार लोड हो गया ✓")},undefined,e=>{console.log(e);say("3D किरदार नहीं मिला, पुराना ही चलेगा")})
}).catch(e=>{console.log(e);say("3D किरदार नहीं मिला, पुराना ही चलेगा")});

function box(w,h,d,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),dk);m.position.set(x,y,z);return m}
function dress(g){
 const u=g.userData;u.gl=1;
 g.children[0].visible=false;g.children[1].visible=false;
 if(!u.team)u.team=g.children[0].material.color;
 const m=THREE.SkeletonUtils.clone(model);
 u.mats=[];
 m.traverse(o=>{if(o.isMesh){o.material=o.material.clone();u.mats.push(o.material);o.frustumCulled=false}});
 g.add(m);
 u.mx=new THREE.AnimationMixer(m);u.act={};u.w={Idle:1,Walk:0,Run:0};
 clips.forEach(c=>{if(u.w[c.name]!==undefined){const a=u.mx.clipAction(c);a.play();a.setEffectiveWeight(u.w[c.name]);u.act[c.name]=a}});
 const gun=new THREE.Group();gun.position.set(.22,1.1,.42);
 gun.add(box(.08,.12,.62,0,0,0));gun.add(box(.04,.04,.3,0,.02,.44));gun.add(box(.07,.2,.1,0,-.14,.06));
 g.add(gun);
 u.lx=g.position.x;u.lz=g.position.z}
let last=performance.now();
(function f(now){requestAnimationFrame(f);const dt=Math.max(.001,Math.min(.1,(now-last)/1000));last=now;
 if(!model)return;
 sc.children.forEach(g=>{
  if(g.type!=="Group"||g.children.length<2)return;
  const b=g.children[0],h=g.children[1];
  if(!b.geometry||b.geometry.type!=="CylinderGeometry"||!h.geometry||h.geometry.type!=="SphereGeometry")return;
  if(!g.userData.gl)dress(g);
  const u=g.userData,sp=Math.hypot(g.position.x-u.lx,g.position.z-u.lz)/dt;
  u.lx=g.position.x;u.lz=g.position.z;
  if(u.rig)u.rig.visible=false;
  const tg=sp<.8?"Idle":(sp<4.3?"Walk":"Run");
  for(const k in u.w){u.w[k]+=((k===tg?1:0)-u.w[k])*Math.min(1,dt*10);if(u.act[k])u.act[k].setEffectiveWeight(u.w[k])}
  u.mx.update(dt);
  u.mats.forEach(m=>m.color.setRGB(1,1,1).lerp(u.team,.5))})
})(performance.now());
})();
