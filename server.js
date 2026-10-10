const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const MAP = require("./public/map.js");
const app = express();
app.use(express.static(__dirname + "/public"));
const srv = http.createServer(app);
const io = new Server(srv);
const rooms = new Map();
let wid = 0;
const WIN = 4;
// [मैगज़ीन की गोलियाँ, रीलोड के सेकंड]
const MAG = { "Pistol": [12, 1.2], "AK-47": [30, 2], "M4": [30, 1.8], "Shotgun": [6, 2.2], "Sniper": [5, 2.5], "SMG": [25, 1.6] };

const inWall = (w, x, z, rad) => { const dx = x - w.x, dz = z - w.z, c = Math.cos(w.yaw), s = Math.sin(w.yaw); return Math.abs(dx * c - dz * s) < 1.6 + rad && Math.abs(dx * s + dz * c) < 0.25 + rad; };
const list = r => [...r.players.values()];
const alive = (r, t) => list(r).filter(p => p.team === t && p.alive).length;
function setGun(p, g) { clearTimeout(p.rt); p.gun = g; p.ammo = MAG[g][0]; p.reloading = false; }
function startReload(p) {
  if (p.reloading || !p.alive || p.ammo >= MAG[p.gun][0]) return;
  p.reloading = true; const g = p.gun;
  p.rt = setTimeout(() => { if (p.gun === g && p.alive) { p.ammo = MAG[g][0]; p.reloading = false; } }, MAG[g][1] * 1000);
}
function resetPlayer(p, sock) {
  const sp = MAP.spawns[p.team][p.slot];
  Object.assign(p, { x: sp.x, z: sp.z, yaw: p.team === "A" ? 0 : Math.PI, hp: 100, arm: 0, alive: true, next: 0, gloo: 2, gnext: 0, j: 0, c: 0, nades: 2, nnext: 0 });
  setGun(p, "Pistol");
  if (sock) sock.emit("spawn", { x: p.x, z: p.z, yaw: p.yaw });
}
function startRound(r) {
  if (!rooms.has(r.id) || r.players.size === 0) return;
  r.round++; r.phase = "live"; r.banner = "";
  r.loot = MAP.loot.map(() => 0); r.walls = []; r.nades = [];
  list(r).forEach(p => resetPlayer(p, io.sockets.sockets.get(p.id)));
  r.solo = !(list(r).some(p => p.team === "A") && list(r).some(p => p.team === "B"));
}
function checkEnd(r) {
  if (r.phase !== "live" || r.solo) return;
  const a = alive(r, "A"), b = alive(r, "B");
  if (a > 0 && b > 0) return;
  const win = a > 0 ? "A" : "B";
  if (win === "A") r.sa++; else r.sb++;
  if (r.sa >= WIN || r.sb >= WIN) {
    r.phase = "over"; r.banner = "🏆 टीम " + win + " मैच जीती! (" + r.sa + " - " + r.sb + ")";
    setTimeout(() => { r.sa = r.sb = 0; r.round = 0; r.phase = "wait"; r.banner = ""; }, 7000);
  } else {
    r.phase = "between"; r.banner = "टीम " + win + " ने राउंड जीता (" + r.sa + " - " + r.sb + ")";
    setTimeout(() => startRound(r), 4000);
  }
}

io.on("connection", sock => {
  let R = null, P = null;
  sock.on("join", d => {
    if (R) return;
    const id = String((d && d.room) || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    if (!id) return;
    const r = rooms.get(id) || { id, players: new Map(), loot: MAP.loot.map(() => 0), walls: [], phase: "wait", round: 0, sa: 0, sb: 0, banner: "", solo: true };
    rooms.set(id, r);
    const nA = list(r).filter(p => p.team === "A").length, nB = list(r).filter(p => p.team === "B").length;
    if (nA >= 4 && nB >= 4) { sock.emit("full"); return; }
    const team = nA <= nB ? (nA < 4 ? "A" : "B") : (nB < 4 ? "B" : "A");
    const used = list(r).filter(p => p.team === team).map(p => p.slot);
    let slot = 0; while (used.includes(slot)) slot++;
    R = r; P = { id: sock.id, name: String((d && d.name) || "प्लेयर").slice(0, 12), team, slot, kills: 0 };
    resetPlayer(P, null);
    if (r.phase !== "wait") P.alive = false;
    r.players.set(sock.id, P);
    sock.join(id);
    sock.emit("joined", { id: sock.id, team, room: id });
    if (P.alive) sock.emit("spawn", { x: P.x, z: P.z, yaw: P.yaw });
  });
  sock.on("start", () => { if (R && R.phase === "wait") startRound(R); });
  sock.on("nade", d => {
    if (!P || !P.alive || R.phase !== "live" || P.nades <= 0 || Date.now() < P.nnext) return;
    const yaw = +(d && d.yaw) || 0, dx = -Math.sin(yaw), dz = -Math.cos(yaw);
    let x = P.x, z = P.z;
    for (let i = 0; i < 24; i++) { const nx = x + dx * 0.5, nz = z + dz * 0.5; if (MAP.blocked(nx, nz, 0.2)) break; x = nx; z = nz; }
    P.nades--; P.nnext = Date.now() + 1000;
    (R.nades = R.nades || []).push({ id: ++wid, by: P.id, team: P.team, sx: P.x, sz: P.z, ex: x, ez: z, t: Date.now() });
  });
  sock.on("gloo", d => {
    if (!P || !P.alive || R.phase !== "live" || P.gloo <= 0 || Date.now() < P.gnext) return;
    const yaw = +(d && d.yaw) || 0, wx = P.x - Math.sin(yaw) * 2.2, wz = P.z - Math.cos(yaw) * 2.2;
    if (MAP.blocked(wx, wz, 0.3)) return;
    P.gloo--; P.gnext = Date.now() + 800;
    R.walls.push({ id: ++wid, x: wx, z: wz, yaw, hp: 120, t: Date.now() });
  });
  sock.on("reload", () => { if (P && P.alive && R.phase === "live") startReload(P); });
  sock.on("move", d => {
    if (!P || !P.alive || R.phase !== "live" || !d) return;
    const x = +d.x, z = +d.z;
    if (!isFinite(x) || !isFinite(z) || Math.hypot(x - P.x, z - P.z) > 2.5 || MAP.blocked(x, z, 0.3) || R.walls.some(w => inWall(w, x, z, 0.3) && !inWall(w, P.x, P.z, 0.3))) return;
    P.x = x; P.z = z; P.yaw = +d.yaw || 0; P.j = Math.max(0, Math.min(2, +d.j || 0)); P.c = d.c ? 1 : 0;
    MAP.loot.forEach((o, i) => {
      if (R.loot[i] || Math.hypot(o.x - x, o.z - z) > 1.5) return;
      R.loot[i] = 1;
      if (MAP.GUNS[o.n]) setGun(P, o.n); else if (o.n === "Armor") P.arm = Math.min(100, P.arm + 50); else P.hp = 100;
      sock.emit("pick", { n: o.n });
    });
  });
  sock.on("fire", d => {
    if (!P || !P.alive || R.phase !== "live" || P.reloading) return;
    if (P.ammo <= 0) { startReload(P); return; }
    const g = MAP.GUNS[P.gun], t = Date.now();
    if (t < P.next) return;
    P.next = t + g.c * 900;
    P.ammo--; if (P.ammo <= 0) startReload(P);
    const yaw = +(d && d.yaw) || 0, dx = -Math.sin(yaw), dz = -Math.cos(yaw);
    let x = P.x, z = P.z, dist = 0, hit = null;
    const foes = list(R).filter(q => q.alive && q.team !== P.team);
    while (dist < g.r) {
      x += dx * 0.4; z += dz * 0.4; dist += 0.4;
      if (MAP.blocked(x, z, 0.05)) break;
      const wl = R.walls.find(w => inWall(w, x, z, 0.05));
      if (wl) { wl.hp -= g.d; if (wl.hp <= 0) R.walls = R.walls.filter(w => w !== wl); break; }
      hit = foes.find(q => q.j < 0.6 && Math.hypot(q.x - x, q.z - z) < (q.c ? 0.45 : 0.7));
      if (hit) break;
    }
    io.to(R.id).emit("shot", { sx: P.x + dx * 0.6, sz: P.z + dz * 0.6, ex: x, ez: z });
    if (hit) {
      const ab = Math.min(hit.arm, Math.round(g.d * 0.5));
      hit.arm -= ab; hit.hp -= g.d - ab;
      const dead = hit.hp <= 0;
      sock.emit("hit", { dmg: g.d, kill: dead, x: hit.x, z: hit.z });
      const vs = io.sockets.sockets.get(hit.id);
      if (vs) vs.emit("hurt");
      if (dead) {
        hit.hp = 0; hit.alive = false; P.kills++;
        io.to(R.id).emit("feed", P.name + " ने " + hit.name + " को मारा (" + P.gun + ")");
        checkEnd(R);
      }
    }
  });
  sock.on("disconnect", () => {
    if (!R) return;
    clearTimeout(P.rt);
    R.players.delete(sock.id);
    if (R.players.size === 0) { rooms.delete(R.id); return; }
    checkEnd(R);
  });
});

setInterval(() => {
  rooms.forEach(r => {
    r.walls = r.walls.filter(w => Date.now() - w.t < 20000);
    io.to(r.id).emit("state", {
      walls: r.walls.map(w => ({ id: w.id, x: +w.x.toFixed(2), z: +w.z.toFixed(2), yaw: +w.yaw.toFixed(2), hp: w.hp })), nades: (r.nades || []).map(n => ({ id: n.id, sx: +n.sx.toFixed(2), sz: +n.sz.toFixed(2), ex: +n.ex.toFixed(2), ez: +n.ez.toFixed(2), age: Date.now() - n.t })), phase: r.phase, round: r.round, sa: r.sa, sb: r.sb, banner: r.banner, loot: r.loot,
      players: list(r).map(p => ({ id: p.id, name: p.name, team: p.team, x: +p.x.toFixed(2), z: +p.z.toFixed(2), yaw: +p.yaw.toFixed(2), hp: p.hp, arm: p.arm, gun: p.gun, alive: p.alive, kills: p.kills, ammo: p.ammo, mag: MAG[p.gun][0], reloading: p.reloading, gloo: p.gloo, j: +p.j.toFixed(2), c: p.c, nd: p.nades }))
    });
  });
}, 50);

setInterval(() => {
  rooms.forEach(r => {
    if (!r.nades || !r.nades.length) return;
    const now = Date.now();
    r.nades = r.nades.filter(n => {
      if (now - n.t < 2500) return true;
      io.to(r.id).emit("boom", { id: n.id, x: n.ex, z: n.ez });
      if (r.phase !== "live") return false;
      const th = r.players.get(n.by);
      list(r).forEach(q => {
        if (!q.alive) return;
        if (q.team === n.team && q.id !== n.by) return;
        const d = Math.hypot(q.x - n.ex, q.z - n.ez);
        if (d > 5) return;
        let dmg = 90 * (1 - d / 5);
        for (let k = 0.5; k < d; k += 0.5) {
          if (MAP.blocked(n.ex + (q.x - n.ex) * k / d, n.ez + (q.z - n.ez) * k / d, 0.05)) { dmg *= 0.3; break; }
        }
        dmg = Math.round(dmg);
        if (dmg < 1) return;
        const ab = Math.min(q.arm, Math.round(dmg * 0.5));
        q.arm -= ab; q.hp -= dmg - ab;
        const dead = q.hp <= 0;
        const ts = io.sockets.sockets.get(n.by);
        if (ts && q.id !== n.by) ts.emit("hit", { dmg, kill: dead, x: q.x, z: q.z });
        const vs = io.sockets.sockets.get(q.id);
        if (vs) vs.emit("hurt");
        if (dead) {
          q.hp = 0; q.alive = false;
          if (q.id === n.by) io.to(r.id).emit("feed", q.name + " अपने ही ग्रेनेड से आउट");
          else { if (th) th.kills++; io.to(r.id).emit("feed", (th ? th.name : "?") + " ने " + q.name + " को ग्रेनेड से मारा"); }
        }
      });
      checkEnd(r);
      return false;
    });
  });
}, 50);

const PORT = process.env.PORT || 3000;
srv.listen(PORT, () => console.log("गेम चालू: http://localhost:" + PORT));
