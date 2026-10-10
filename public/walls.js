(function(){
const walls=new Map();let list=[],myId=null;
const inW=(w,x,z,r)=>{const dx=x-w.x,dz=z-w.z,c=Math.cos(w.yaw),s=Math.sin(w.yaw);return Math.abs(dx*c-dz*s)<1.6+r&&Math.abs(dx*s+dz*c)<.25+r};
window.blk=(x,z,r)=>MAP.blocked(x,z,r)||list.some(w=>inW(w,x,z,r)&&!inW(w,P.position.x,P.position.z,r));
const b=document.createElement("button");b.textContent="🧊2";
b.style.cssText="position:fixed;right:184px;bottom:50px;width:56px;height:56px;border-radius:50%;border:3px solid #fff;background:#22b8d6cc;color:#fff;font-size:17px;z-index:5";
document.body.appendChild(b);
b.addEventListener("pointerdown",e=>{e.preventDefault();if(window.canMove)sock.emit("gloo",{yaw})});
addEventListener("keydown",e=>{if(e.key.toLowerCase()==="g"&&window.canMove)sock.emit("gloo",{yaw})});
sock.on("joined",d=>myId=d.id);
sock.on("state",s=>{list=s.walls||[];const m=s.players.find(p=>p.id===myId);b.textContent="🧊"+(m?m.gloo:0);
 const seen=new Set();
 list.forEach(w=>{seen.add(w.id);let o=walls.get(w.id);
  if(!o){o=new THREE.Mesh(new THREE.BoxGeometry(3.2,2.2,.5),new THREE.MeshLambertMaterial({color:0x9be7ff,transparent:true,opacity:.7}));sc.add(o);walls.set(w.id,o)}
  o.position.set(w.x,1.1,w.z);o.rotation.y=w.yaw;o.material.opacity=.3+.4*Math.min(1,w.hp/120)});
 walls.forEach((o,id)=>{if(!seen.has(id)){sc.remove(o);walls.delete(id)}})});
})();
