(function(){
const M=c=>new THREE.MeshLambertMaterial({color:c});
const shirt=()=>M(0x2f7de1),pants=M(0x3a3f4b),vest=M(0x2c3136),skin=M(0xe0b48a),dark=M(0x15171a),pack=M(0x4a5a3a);
function box(w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x||0,y||0,z||0);return m}
function build(g){
 const u=g.userData,body=g.children[0],head=g.children[1];
 body.visible=false;head.visible=false;u.h=1;u.team=body.material.color;
 const rig=new THREE.Group();g.add(rig);u.rig=rig;
 u.sh=shirt();u.hm=M(0x1f5fb0);
 // पैर: कूल्हा और घुटना
 u.leg=[-1,1].map(s=>{const hip=new THREE.Group();hip.position.set(s*.14,.92,0);
  hip.add(box(.2,.46,.22,pants,0,-.23,0));
  const knee=new THREE.Group();knee.position.y=-.46;
  knee.add(box(.18,.42,.2,pants,0,-.21,0));
  knee.add(box(.2,.12,.34,dark,0,-.46,.05));
  hip.add(knee);rig.add(hip);return{hip,knee}});
 // धड़
 rig.add(box(.5,.58,.27,u.sh,0,1.21,0));
 rig.add(box(.54,.38,.31,vest,0,1.27,0));
 rig.add(box(.52,.07,.29,dark,0,.93,0));
 rig.add(box(.36,.42,.16,pack,0,1.25,-.22));
 // सिर, हेलमेट, चश्मा
 rig.add(box(.12,.1,.12,skin,0,1.52,0));
 const hd=new THREE.Mesh(new THREE.SphereGeometry(.22,14,10),skin);hd.position.y=1.7;rig.add(hd);
 const hl=new THREE.Mesh(new THREE.SphereGeometry(.245,14,8,0,Math.PI*2,0,Math.PI*.55),u.hm);hl.position.y=1.71;rig.add(hl);
 rig.add(box(.3,.07,.06,dark,0,1.7,.2));
 // हाथ: कंधा, कोहनी, हथेली
 u.arm=[-1,1].map(s=>{const sh=new THREE.Group();sh.position.set(s*.33,1.43,0);sh.rotation.order="YXZ";
  sh.add(box(.14,.3,.14,u.sh,0,-.15,0));
  const el=new THREE.Group();el.position.y=-.3;
  el.add(box(.12,.27,.12,u.sh,0,-.135,0));
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),skin);hand.position.y=-.29;el.add(hand);
  sh.add(el);rig.add(sh);return{sh,el,s}});
 // गन
 const gun=new THREE.Group();gun.position.set(.04,1.31,.5);
 gun.add(box(.08,.12,.62,dark,0,0,0));gun.add(box(.04,.04,.3,dark,0,.02,.44));
 gun.add(box(.07,.2,.1,dark,0,-.14,.06));gun.add(box(.07,.1,.2,dark,0,-.02,-.38));
 rig.add(gun);
 // पैरों के नीचे परछाईं
 const sd=new THREE.Mesh(new THREE.CircleGeometry(.45,14),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.3}));
 sd.rotation.x=-Math.PI/2;sd.position.y=.03;g.add(sd);
 u.lx=g.position.x;u.lz=g.position.z;u.ph=0}
let last=performance.now();
(function f(now){requestAnimationFrame(f);const dt=Math.max(.001,Math.min(.1,(now-last)/1000));last=now;
 sc.children.forEach(g=>{
  if(g.type!=="Group"||g.children.length<2)return;
  const b=g.children[0],h=g.children[1];
  if(!b.geometry||b.geometry.type!=="CylinderGeometry"||!h.geometry||h.geometry.type!=="SphereGeometry")return;
  if(!g.userData.h)build(g);
  const u=g.userData,sp=Math.hypot(g.position.x-u.lx,g.position.z-u.lz)/dt,amp=Math.min(1,sp/6);
  u.lx=g.position.x;u.lz=g.position.z;
  u.sh.color.copy(u.team);u.hm.color.copy(u.team).multiplyScalar(.6);
  if(sp>.8)u.ph+=dt*10;
  u.leg.forEach((l,i)=>{const a=Math.sin(u.ph+i*Math.PI)*amp;l.hip.rotation.x=a*.75;l.knee.rotation.x=Math.max(0,a)*.9});
  u.arm.forEach(a=>{a.sh.rotation.x=-1.25+Math.sin(u.ph*2)*.03*amp;a.sh.rotation.y=-a.s*.5;a.el.rotation.x=-.35});
  u.rig.position.y=Math.abs(Math.sin(u.ph))*.04*amp+Math.sin(now/500)*.008})
})(performance.now());
})();
