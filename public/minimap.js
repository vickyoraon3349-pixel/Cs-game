(function(){
const W=90,H=158;
const c=document.createElement("canvas");c.width=W;c.height=H;
c.style.cssText="position:fixed;right:10px;top:52px;width:90px;height:158px;border:2px solid #fff;border-radius:6px;opacity:.93;pointer-events:none;z-index:4;display:none";
document.body.appendChild(c);const g=c.getContext("2d");
const COL={"AK-47":"#ff9f1a","M4":"#ff6b35","Shotgun":"#e5484d","Sniper":"#a855f7","SMG":"#22d3ee","Armor":"#60a5fa","Medkit":"#4ade80"};
let myId=null,team="A";
const T=(x,z)=>{if(team==="B"){x=-x;z=-z}return[(x+40)*W/80,(z+70)*H/140]};
function rect(x0,z0,x1,z1,col){const a=T(x0,z0),b=T(x1,z1);g.fillStyle=col;g.fillRect(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(1.5,Math.abs(a[0]-b[0])),Math.max(1.5,Math.abs(a[1]-b[1])))}
sock.on("joined",d=>{myId=d.id;team=d.team;c.style.display="block"});
sock.on("state",s=>{
 g.fillStyle="#6aa957";g.fillRect(0,0,W,H);
 rect(-39,40,39,68,"rgba(59,130,230,.45)");rect(-39,-68,39,-40,"rgba(229,72,77,.45)");
 MAP.boxes.forEach(b=>rect(b.x0,b.z0,b.x1,b.z1,"#5b4636"));
 MAP.loot.forEach((o,i)=>{if(s.loot[i])return;const p=T(o.x,o.z);g.fillStyle=COL[o.n];g.beginPath();g.arc(p[0],p[1],2.3,0,7);g.fill();g.strokeStyle="#000";g.lineWidth=.6;g.stroke()});
 g.strokeStyle="#7ee7ff";g.lineWidth=2;
 (s.walls||[]).forEach(w=>{const dx=Math.cos(w.yaw)*1.6,dz=-Math.sin(w.yaw)*1.6,a=T(w.x-dx,w.z-dz),b=T(w.x+dx,w.z+dz);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()});
 (s.nades||[]).forEach(n=>{const p=T(n.ex,n.ez);g.strokeStyle="#ff8a1f";g.lineWidth=1.5;g.beginPath();g.arc(p[0],p[1],5.6,0,7);g.stroke();g.fillStyle="#ff8a1f";g.beginPath();g.arc(p[0],p[1],1.6,0,7);g.fill()});
 s.players.forEach(p=>{
  if(!p.alive)return;
  const q=T(p.x,p.z);
  if(p.id===myId){let fx=-Math.sin(p.yaw),fz=-Math.cos(p.yaw);if(team==="B"){fx=-fx;fz=-fz}
   g.save();g.translate(q[0],q[1]);g.rotate(Math.atan2(fx,-fz));g.fillStyle="#fff";g.strokeStyle="#000";g.lineWidth=1;
   g.beginPath();g.moveTo(0,-5.5);g.lineTo(3.8,4);g.lineTo(-3.8,4);g.closePath();g.fill();g.stroke();g.restore()}
  else if(p.team===team){g.fillStyle="#4da3ff";g.strokeStyle="#fff";g.lineWidth=1;g.fillRect(q[0]-2.5,q[1]-2.5,5,5);g.strokeRect(q[0]-2.5,q[1]-2.5,5,5)}
 })});
})();
