(function(){
const dk=new THREE.MeshLambertMaterial({color:0x222222}),pt=new THREE.MeshLambertMaterial({color:0x333a4a});
function dress(g){
 const u=g.userData;u.d=1;
 const gun=new THREE.Mesh(new THREE.BoxGeometry(.1,.14,.75),dk);gun.position.set(.28,1.0,.45);g.add(gun);
 u.hel=new THREE.Mesh(new THREE.SphereGeometry(.31,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0x2f7de1}));u.hel.position.y=1.58;g.add(u.hel);
 u.legs=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.15,.45,0);
  const l=new THREE.Mesh(new THREE.BoxGeometry(.2,.45,.22),pt);l.position.y=-.22;p.add(l);g.add(p);return p});
 u.lx=g.position.x;u.lz=g.position.z;u.ph=0}
let last=performance.now();
(function f(now){requestAnimationFrame(f);const dt=Math.max(.001,Math.min(.1,(now-last)/1000));last=now;
 sc.children.forEach(g=>{
  if(g.type!=="Group"||g.children.length<2)return;
  const b=g.children[0],h=g.children[1];
  if(!b.geometry||b.geometry.type!=="CylinderGeometry"||!h.geometry||h.geometry.type!=="SphereGeometry")return;
  if(!g.userData.d)dress(g);
  const u=g.userData,sp=Math.hypot(g.position.x-u.lx,g.position.z-u.lz)/dt;
  u.lx=g.position.x;u.lz=g.position.z;
  u.hel.material.color.copy(b.material.color).multiplyScalar(.75);
  if(sp>.8){u.ph+=dt*10;u.legs[0].rotation.x=Math.sin(u.ph)*.8;u.legs[1].rotation.x=-Math.sin(u.ph)*.8}
  else u.legs.forEach(l=>l.rotation.x*=.7)})
})(performance.now());
})();
