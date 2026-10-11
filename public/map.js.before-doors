// मैप: सर्वर और ब्राउज़र दोनों यही फ़ाइल पढ़ेंगे
(function (g) {
  const X = x => (x - 200) * 0.2, Z = y => (y - 350) * 0.2;
  const boxes = [];
  const box = (x, y, w, h, ht, c) => boxes.push({ x0: X(x), x1: X(x + w), z0: Z(y), z1: Z(y + h), ht, c });
  const W = (x1, y1, x2, y2, ht) => y1 === y2 ? box(x1, y1 - 4, x2 - x1, 8, ht, 0x5b4636) : box(x1 - 4, y1, 8, y2 - y1, ht, 0x5b4636);
  [[15, 140], [260, 385]].forEach(([a, b]) => { W(a, 535, b, 535, 1.4); W(a, 165, b, 165, 1.4); });
  W(140, 300, 180, 300, 2.6); W(220, 300, 260, 300, 2.6); W(140, 400, 180, 400, 2.6); W(220, 400, 260, 400, 2.6);
  W(140, 300, 140, 330, 2.6); W(140, 370, 140, 400, 2.6); W(260, 300, 260, 330, 2.6); W(260, 370, 260, 400, 2.6);
  [[30, 230], [310, 230], [30, 430], [310, 430]].forEach(([x, y]) => box(x, y, 60, 40, 2.2, 0x8a6a4a));
  [[130, 400], [246, 276], [270, 410], [106, 266], [180, 470], [196, 206]].forEach(([x, y]) => box(x, y, 24, 24, 1.2, 0xa58259));
  [[-8, -8, 416, 8], [-8, 700, 416, 8], [-8, 0, 8, 700], [400, 0, 8, 700]].forEach(a => box(a[0], a[1], a[2], a[3], 3, 0x444444));
  const SPX = [80, 160, 240, 320];
  const spawns = { A: SPX.map(x => ({ x: X(x), z: Z(662) })), B: SPX.map(x => ({ x: X(x), z: Z(38) })) };
  const names = ["AK-47", "M4", "Shotgun", "Sniper", "SMG", "Armor", "Medkit"];
  const loot = [];
  names.forEach((n, i) => { const x = 40 + i * 53; loot.push({ n, x: X(x), z: Z(600) }); loot.push({ n, x: X(400 - x), z: Z(100) }); });
  const blocked = (px, pz, r) => boxes.some(b => px > b.x0 - r && px < b.x1 + r && pz > b.z0 - r && pz < b.z1 + r);
  const GUNS = { "Pistol": { d: 15, c: 0.35, r: 40 }, "AK-47": { d: 25, c: 0.12, r: 70 }, "M4": { d: 22, c: 0.1, r: 70 }, "Shotgun": { d: 50, c: 0.7, r: 14 }, "Sniper": { d: 100, c: 1.2, r: 120 }, "SMG": { d: 14, c: 0.07, r: 45 } };
  g.MAP = { X, Z, boxes, spawns, loot, blocked, GUNS };
  if (typeof module !== "undefined") module.exports = g.MAP;
})(typeof window!=="undefined"?window:globalThis);
