(function(){
// ---------- आवाज़ें (बिना किसी फ़ाइल के, फोन खुद बनाता है) ----------
let A=null;
function au(){if(!A){try{A=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(A&&A.state==="suspended")A.resume();return A}
addEventListener("pointerdown",au);addEventListener("keydown",au);
function noise(dur,vol,fc){const a=au();if(!a)return;const n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
 const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type="lowpass";f.frequency.value=fc||1800;
 const g=a.createGain();g.gain.value=vol;s.connect(f);f.connect(g);g.connect(a.destination);s.start()}
function tone(f1,f2,dur,vol,type){const a=au();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
 o.type=type||"sine";o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(a.destination);o.start();o.stop(t+dur)}
const S={
 shot:v=>{noise(.09,.5*v,2200);tone(180,50,.09,.5*v)},
 hit:()=>tone(1200,900,.06,.25,"square"),
 kill:()=>{tone(700,1000,.1,.3,"square");setTimeout(()=>tone(1000,1400,.12,.3,"square"),90)},
 pick:()=>tone(500,900,.15,.3),
 hurt:()=>tone(120,60,.18,.5),
 click:()=>noise(.03,.4,3500),
 clack:()=>{noise(.05,.5,2500);tone(300,150,.05,.3)}};

// ---------- स्क्रीन की चीज़ें ----------
const mk=(css,html)=>{const e=document.createElement("div");e.style.cssText=css;if(html)e.innerHTML=html;document.body.appendChild(e);return e};
const tick="position:absolute;background:#fff;box-shadow:0 0 2px #000;";
mk("position:fixed;left:50%;top:50%;width:30px;height:30px;margin:-15px 0 0 -15px;pointer-events:none;z-index:4",
 `<div style="${tick}left:14px;top:0;width:2px;height:9px"></div><div style="${tick}left:14px;bottom:0;width:2px;height:9px"></div>
  <div style="${tick}top:14px;left:0;height:2px;width:9px"></div><div style="${tick}top:14px;right:0;height:2px;width:9px"></div>
  <div style="${tick}left:14px;top:14px;width:2px;height:2px"></div>`);
const hm=mk("position:fixed;left:50%;top:50%;margin:-20px 0 0 -14px;font:700 34px sans-serif;color:#fff;text-shadow:0 0 3px #000;opacity:0;pointer-events:none;z-index:4","✕");
const flash=mk("position:fixed;inset:0;background:radial-gradient(transparent 40%,rgba(255,0,0,.55));opacity:0;transition:opacity .4s;pointer-events:none;z-index:3");
const ammo=mk("position:fixed;right:20px;bottom:200px;color:#fff;text-shadow:0 1px 3px #000;font:700 18px sans-serif;text-align:right;pointer-events:none;z-index:4");
const rb=document.createElement("button");rb.textContent="🔄";
rb.style.cssText="position:fixed;right:118px;bottom:50px;width:56px;height:56px;border-radius:50%;border:3px solid #fff;background:#2f7de1cc;color:#fff;font-size:24px;z-index:5";
document.body.appendChild(rb);
rb.addEventListener("pointerdown",e=>{e.preventDefault();sock.emit("reload")});
addEventListener("keydown",e=>{if(e.key.toLowerCase()==="r")sock.emit("reload")});

// ---------- चोट के नंबर ----------
const nums=[];
function num(x,z,t,c){const k=document.createElement("canvas");k.width=128;k.height=64;const g=k.getContext("2d");
 g.font="bold 48px sans-serif";g.textAlign="center";g.lineWidth=6;g.strokeStyle="#000";g.strokeText(t,64,50);g.fillStyle=c;g.fillText(t,64,50);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(k),depthTest:false}));
 s.scale.set(1.8,.9,1);s.position.set(x,2.3,z);s.renderOrder=12;sc.add(s);nums.push({s,t:0})}
(function f(){requestAnimationFrame(f);for(let i=nums.length-1;i>=0;i--){const n=nums[i];n.t+=1/60;n.s.position.y+=.02;n.s.material.opacity=Math.max(0,1-n.t/.9);if(n.t>.9){sc.remove(n.s);nums.splice(i,1)}}})();

window.S=S;
// ---------- सर्वर की खबरें ----------
let myId=null,wasRl=false,lastGun="";
sock.on("joined",d=>myId=d.id);
sock.on("shot",d=>{const dist=Math.hypot(d.sx-P.position.x,d.sz-P.position.z);S.shot(Math.max(.15,1-dist/60))});
sock.on("hit",d=>{d.kill?S.kill():S.hit();hm.style.color=d.kill?"#ff4040":"#fff";hm.style.opacity=1;setTimeout(()=>hm.style.opacity=0,160);
 num(d.x,d.z,d.kill?"KILL "+d.dmg:String(d.dmg),d.kill?"#ff5050":"#ffd23f")});
sock.on("hurt",()=>{S.hurt();flash.style.transition="none";flash.style.opacity=1;setTimeout(()=>{flash.style.transition="opacity .5s";flash.style.opacity=0},60)});
sock.on("pick",()=>S.pick());
sock.on("state",s=>{const m=s.players.find(p=>p.id===myId);if(!m){ammo.textContent="";return}
 ammo.innerHTML=m.reloading?`${m.gun}<br><span style="color:#ffd23f">रीलोड हो रही है...</span>`:`${m.gun}<br><span style="font-size:26px;color:${m.ammo<=3?"#ff6060":"#fff"}">${m.ammo}</span> / ${m.mag}`;
 if(m.reloading&&!wasRl)S.click();if(!m.reloading&&wasRl&&m.gun===lastGun)S.clack();
 wasRl=m.reloading;lastGun=m.gun});
})();
