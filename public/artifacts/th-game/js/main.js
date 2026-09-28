'use strict';
/* ============================================================
 *  東方星塵録 — 主引擎 main.js
 *  流程 / 玩家 / 碰撞 / Boss / 对话 / 界面
 * ============================================================ */
const CV = document.getElementById('cv'), ctx = CV.getContext('2d');
const F = window.FIELD, W = window.World, TAU = Math.PI * 2;
const { PAL, bulletSprite, itemSprite } = GFX;
const HPSCALE = 3.3;

const DIFFS = [
  { name: 'EASY', spd: .8, dens: .8, hp: .75, lives: 5, bombs: 3 },
  { name: 'NORMAL', spd: 1, dens: 1, hp: 1, lives: 3, bombs: 3 },
  { name: 'LUNATIC', spd: 1.28, dens: 1.3, hp: 1.18, lives: 2, bombs: 2 }
];
const CHARS = {
  reimu: { name: '博丽灵梦', shot: '封魔针 + 归巢札', bomb: '梦符 「梦想封印」' },
  marisa: { name: '雾雨魔理沙', shot: '星屑光炮 + 扇形炮', bomb: '恋符 「Master Spark」' }
};

const G = {
  mode: 'title', frame: 0,
  diff: 1, char: 'reimu',
  score: 0, graze: 0, hiscore: +(localStorage.getItem('thsd_hiscore') || 0),
  stageIdx: 0, practice: false,
  player: null, runner: null, boss: null,
  dialog: null, dialogBoss: null, banner: null,
  overlay: null, menuIdx: 0, subIdx: 0, titleT: 0, helpT: 0,
  nextLife: 5e6, nextBomb: 1e7,
  stageDeaths: 0, continues: 0, playT: 0
};
window.PGame = {
  get player() { return G.player; },
  killPlayer() { killPlayer(); },
  collideLaser: (l, p) => {
    const x2 = l.x + Math.cos(l.ang) * l.len, y2 = l.y + Math.sin(l.ang) * l.len;
    return segDist(p.x, p.y, l.x, l.y, x2, y2) < l.w / 2 + p.r;
  }
};

/* ---------------- 工具 ---------------- */
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
function segDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const L2 = dx * dx + dy * dy;
  let t = L2 ? ((px - x1) * dx + (py - y1) * dy) / L2 : 0;
  t = clamp(t, 0, 1);
  const qx = x1 + dx * t - px, qy = y1 + dy * t - py;
  return Math.hypot(qx, qy);
}
function txt(g, s, x, y, size, col, align, bold, font) {
  g.font = `${bold ? 'bold ' : ''}${size}px ${font || '"Segoe UI","Microsoft YaHei",sans-serif'}`;
  g.fillStyle = col; g.textAlign = align || 'left'; g.textBaseline = 'middle';
  g.fillText(s, x, y);
}

/* ---------------- 输入 ---------------- */
const K = { down: {}, hit: {} };
addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault();
  if (!K.down[e.code]) K.hit[e.code] = true;
  K.down[e.code] = true;
  Music.ensure();
  if (!G._titleMusic && G.mode === 'title') { G._titleMusic = true; Music.play('title'); }
});
addEventListener('keyup', e => { K.down[e.code] = false; });
const kHit = c => !!K.hit[c];

/* ---------------- 世界清理 ---------------- */
function clearBullets(toItems) {
  let n = 0;
  for (const b of W.bullets) {
    b.dead = true;
    PAT.burst(b.x, b.y, PAL[b.col] || '#fff', 2, 1.5, 14);
    if (toItems && n++ < 46) W.items.push({ type: 's', x: b.x, y: b.y, vx: rnd(-1, 1), vy: rnd(-2.5, -1), t: 0 });
  }
  W.lasers.length = 0;
}
function clearBulletsRadius(x, y, R) {
  for (const b of W.bullets) {
    if (Math.hypot(b.x - x, b.y - y) < R) {
      b.dead = true;
      PAT.burst(b.x, b.y, PAL[b.col] || '#fff', 2, 1.5, 12);
      G.score += 120;
    }
  }
}
function clearEnemies() { W.enemies.length = 0; }

/* ---------------- 玩家 ---------------- */
function newPlayer() {
  const d = DIFFS[G.diff];
  return {
    x: F.w / 2, y: F.h - 70, r: 2.6, grazeR: 15,
    spd: 4.3, fSpd: 1.9, power: 1.0,
    lives: d.lives, bombs: d.bombs, defBombs: d.bombs,
    inv: 150, dead: false, deadT: 0, focus: false, shootT: 0, bombT: 0, bombKind: 0
  };
}
function pshot(x, y, spd, ang, dmg, shape, col, kind, data) {
  W.pshots.push({
    x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
    dmg, r: 5, shape, col, kind: kind || 'lin', data: data || null, t: 0
  });
}
function updatePlayer(p) {
  if (p.dead) {
    p.deadT--;
    if (p.deadT <= 0) {
      p.dead = false; p.x = F.w / 2; p.y = F.h - 70; p.inv = 180;
    }
    return;
  }
  p.focus = !!(K.down['ShiftLeft'] || K.down['ShiftRight']);
  const s = p.focus ? p.fSpd : p.spd;
  let dx = 0, dy = 0;
  if (K.down['ArrowLeft'] || K.down['KeyA']) dx--;
  if (K.down['ArrowRight'] || K.down['KeyD']) dx++;
  if (K.down['ArrowUp'] || K.down['KeyW']) dy--;
  if (K.down['ArrowDown'] || K.down['KeyS']) dy++;
  if (dx && dy) { dx *= .7071; dy *= .7071; }
  p.x = clamp(p.x + dx * s, 12, F.w - 12);
  p.y = clamp(p.y + dy * s, 20, F.h - 16);
  if (p.inv > 0) p.inv--;
  if (p.bombT > 0) updateBombTick(p);
  else if (kHit('KeyX')) useBomb(p);
  if (K.down['KeyZ']) playerShoot(p);
}
function playerShoot(p) {
  p.shootT++;
  if (p.char !== G.char) p.char = G.char;
  if (G.char === 'reimu') {
    if (p.shootT % 5 === 0) {
      const n = [2, 2, 3, 4, 5][Math.min(4, Math.floor(p.power))];
      const spread = p.focus ? .05 : .16;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (n === 1 ? 0 : (i / (n - 1) - .5) * spread);
        pshot(p.x, p.y - 12, 12.5, a, 2.2, 'rice', 'red');
      }
      Music.SFX.shoot();
    }
    if (p.shootT % 17 === 0) {
      const n = p.power >= 4 ? 4 : p.power >= 2 ? 3 : 2;
      for (let i = 0; i < n; i++)
        pshot(p.x + (i - (n - 1) / 2) * 16, p.y - 4, 5.5, -Math.PI / 2 + (i - (n - 1) / 2) * .55, 3.2, 'amulet', 'red', 'home', { w: .075 });
    }
  } else {
    if (p.shootT % 4 === 0) {
      pshot(p.x, p.y - 12, 13.5, -Math.PI / 2, 5.2, 'rice', 'yellow');
      const sides = p.power >= 4 ? 4 : p.power >= 2 ? 2 : 0;
      for (let i = 0; i < sides; i++) {
        const dir = i % 2 ? 1 : -1, mag = i < 2 ? .1 : .21;
        pshot(p.x + dir * 8, p.y - 6, 11, -Math.PI / 2 + (p.focus ? mag * .3 : mag) * dir, 2.6, 'rice', 'yellow');
      }
      Music.SFX.shot2();
    }
  }
}
function useBomb(p) {
  if (p.bombs <= 0 || p.bombT > 0 || p.dead) return;
  p.bombs--;
  p.bombT = G.char === 'reimu' ? 250 : 210;
  p.inv = Math.max(p.inv, p.bombT + 60);
  Music.SFX.bomb();
  W.shake = 13;
  if (G.boss && G.boss.state === 'fight') G.boss.captured = false;
  if (G.char === 'reimu') clearBulletsRadius(p.x, p.y, 130);
  PAT.ringFx(p.x, p.y, '#ffd', 260, 30);
}
function updateBombTick(p) {
  p.bombT--;
  if (G.char === 'reimu') {
    const R = 60 + (250 - p.bombT) * 2.1;
    clearBulletsRadius(p.x, p.y, R);
    if (p.bombT % 6 === 0) {
      for (const e of W.enemies) if (Math.hypot(e.x - p.x, e.y - p.y) < R + e.r) damageEnemy(e, 8);
      if (G.boss && G.boss.state === 'fight' && Math.hypot(G.boss.x - p.x, G.boss.y - p.y) < R + 30) damageBoss(9);
      PAT.ringFx(p.x, p.y, '#fff', R, 16);
    }
  } else {
    const beamW = 52;
    for (const b of W.bullets)
      if (Math.abs(b.x - p.x) < beamW && b.y < p.y) { b.dead = true; G.score += 120; }
    if (p.bombT % 5 === 0) {
      for (const e of W.enemies) if (Math.abs(e.x - p.x) < beamW + e.r && e.y < p.y) damageEnemy(e, 13);
      if (G.boss && G.boss.state === 'fight' && Math.abs(G.boss.x - p.x) < beamW + 26) damageBoss(13);
    }
  }
}
function killPlayer() {
  const p = G.player;
  if (p.dead || p.inv > 0 || p.bombT > 0) return;
  p.dead = true; p.deadT = 55; p.lives--;
  G.stageDeaths++;
  Music.SFX.death();
  PAT.burst(p.x, p.y, '#ff5c8a', 26, 4.5, 40);
  PAT.ringFx(p.x, p.y, '#ff8ab0', 120, 26);
  W.shake = 10;
  clearBulletsRadius(p.x, p.y, 170);
  // 掉落部分威力
  p.power = Math.max(1, p.power - 1);
  for (let i = 0; i < 5; i++)
    W.items.push({ type: 'p', x: p.x + rnd(-30, 30), y: p.y + rnd(-20, 20), vx: rnd(-1.5, 1.5), vy: rnd(-2, -.5), t: 0 });
  p.bombs = Math.max(p.bombs, p.defBombs);
  if (G.boss && G.boss.state === 'fight') {
    const b = G.boss;
    b.captured = false;
    b.hp = b.hpMax; b.t = 0; b.timer = b.ph.time; b.ss = {};
    b.mq = []; b.mv = null;
    clearBullets(false);
  }
  if (p.lives < 0) {
    p.lives = 0;
    G.overlay = { kind: 'continue', t: 600 };
  }
}
function addScore(n) {
  G.score += n;
  if (G.score >= G.nextLife) { G.nextLife += G.nextLife < 2e7 ? 1e7 : 2e7; G.player.lives++; Music.SFX.extend(); G.banner = { text: 'Extend!', sub: '残机 +1', t: 0, dur: 100, small: true }; }
  if (G.score >= G.nextBomb) { G.nextBomb += 2e7; G.player.bombs++; Music.SFX.extend(); }
}

/* ---------------- 玩家弹 / 敌方受击 ---------------- */
function updatePshots() {
  const arr = W.pshots;
  for (let i = arr.length - 1; i >= 0; i--) {
    const s = arr[i];
    s.t++;
    if (s.kind === 'home') {
      const tgt = nearestTarget(s.x, s.y);
      if (tgt) {
        const cur = Math.atan2(s.vy, s.vx);
        let d = PAT.norm(Math.atan2(tgt.y - s.y, tgt.x - s.x) - cur);
        const w = Math.abs(d) < s.data.w ? d : Math.sign(d) * s.data.w;
        const a = cur + w, sp = Math.hypot(s.vx, s.vy);
        s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp;
      }
    }
    s.x += s.vx; s.y += s.vy;
    if (s.x < -20 || s.x > F.w + 20 || s.y < -30 || s.y > F.h + 20) { arr.splice(i, 1); continue; }
    let hit = false;
    for (const e of W.enemies) {
      if (Math.hypot(e.x - s.x, e.y - s.y) < e.r + s.r) {
        damageEnemy(e, s.dmg);
        PAT.burst(s.x, s.y, '#fff', 1, 1.5, 8);
        Music.SFX.hit();
        hit = true; break;
      }
    }
    if (!hit && G.boss && G.boss.state === 'fight' && Math.hypot(G.boss.x - s.x, G.boss.y - s.y) < 28 + s.r) {
      damageBoss(s.dmg);
      PAT.burst(s.x, s.y, '#fff', 1, 1.5, 8);
      Music.SFX.hit();
      hit = true;
    }
    if (hit) arr.splice(i, 1);
  }
}
function nearestTarget(x, y) {
  let best = null, bd = 1e9;
  for (const e of W.enemies) {
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < bd) { bd = d; best = e; }
  }
  if (G.boss && G.boss.state === 'fight') {
    const d = Math.hypot(G.boss.x - x, G.boss.y - y);
    if (d < bd) best = G.boss;
  }
  return best;
}
function damageEnemy(e, dmg) {
  e.hp -= dmg;
  if (e.hp <= 0 && !e.dead) {
    e.dead = true;
    addScore(e.score);
    Music.SFX.kill();
    PAT.burst(e.x, e.y, '#ffd', 12, 3, 24);
    PAT.ringFx(e.x, e.y, '#ffe9a0', 46, 16);
    for (const [type, n] of Object.entries(e.drops || {}))
      for (let i = 0; i < n; i++)
        W.items.push({ type, x: e.x + rnd(-14, 14), y: e.y + rnd(-10, 10), vx: rnd(-1.2, 1.2), vy: rnd(-2.2, -.8), t: 0 });
  }
}
function damageBoss(dmg) {
  const b = G.boss;
  if (!b || b.state !== 'fight') return;
  b.hp -= dmg;
}

/* ---------------- 道具 ---------------- */
function updateItems() {
  const p = G.player;
  for (let i = W.items.length - 1; i >= 0; i--) {
    const it = W.items[i];
    it.t++;
    const d = Math.hypot(p.x - it.x, p.y - it.y);
    const magnet = d < 52 || (it.type === 'pt' && p.power >= 4) || (it.type === 's');
    if (magnet && !p.dead) {
      const a = Math.atan2(p.y - it.y, p.x - it.x);
      it.vx += Math.cos(a) * .5; it.vy += Math.sin(a) * .5;
      it.vx *= .85; it.vy *= .85;
    } else {
      it.vy = Math.min(1.7, it.vy + .05);
      it.vx *= .985;
    }
    it.x += it.vx; it.y += it.vy;
    if (it.t < 24) it.y -= .6 * (24 - it.t) / 24;
    if (!magnet && it.y > F.h + 24) { W.items.splice(i, 1); continue; }
    if (d < 20 && !p.dead) {
      W.items.splice(i, 1);
      switch (it.type) {
        case 'p':
          if (p.power < 4) p.power = Math.min(4, p.power + .05);
          else addScore(1000);
          Music.SFX.item(); break;
        case 'P':
          if (p.power < 4) p.power = Math.min(4, p.power + 1);
          else addScore(10000);
          Music.SFX.itemBig(); break;
        case 'pt':
          addScore(Math.round((10000 + (1 - it.y / F.h) * 9000) / 10) * 10);
          Music.SFX.item(); break;
        case 's':
          addScore(500); Music.SFX.item(); break;
        case 'b':
          p.bombs++; Music.SFX.itemBig(); break;
        case 'l':
          p.lives++; Music.SFX.extend(); break;
      }
    }
  }
}

/* ---------------- 中 Boss ---------------- */
function spawnMidboss(id) {
  const def = STAGES.BOSSES[id];
  Music.SFX.bossIn();
  G.banner = { text: def.name, sub: '— 中BOSS —', t: 0, dur: 130 };
  PAT.makeEnemy({
    x: F.w / 2, y: -40, hp: Math.round(def.mid.hp * DIFFC.hp * 1.4), r: 24,
    spr: GFX.bossSprite(id), big: true, scale: .85,
    drops: { P: 2, pt: 4 }, score: 20000,
    path: [[F.w / 2, 105, 60]],
    fire: en => {
      if (en.t < 70) return;
      if (en.t > def.mid.time + 70) {
        if (!en.leaving) { en.leaving = true; en.mq = [[en.x, -80, 80]]; }
        return;
      }
      def.mid.fn(en, en.t - 70);
    }
  });
}

/* ---------------- Boss ---------------- */
function startBossSequence(id) {
  const def = STAGES.BOSSES[id];
  if (G.runner) G.runner.done = true;
  clearBullets(false);
  clearEnemies();
  Music.play(G.stageIdx === 5 ? 'boss2' : 'boss', [0, 2, -3, 4, 5, 7][G.stageIdx] || 0);
  G.dialogBoss = def;
  startDialog(def.pre, () => spawnBoss(def));
}
function spawnBoss(def) {
  Music.SFX.bossIn();
  G.boss = {
    def, id: def.id, x: F.w / 2, y: -40, r: 26,
    phase: -1, ph: null, t: 0, hp: 0, hpMax: 0, timer: 0,
    state: 'enter', restT: 0, ss: {}, mq: [], mv: null,
    captured: true, bannerT: 0, dieT: 0
  };
}
function startPhase(b, i) {
  b.state = 'fight';
  b.phase = i;
  const ph = b.ph = b.def.phases[i];
  b.hpMax = b.hp = Math.round(ph.hp * HPSCALE * DIFFC.hp);
  b.t = 0; b.timer = ph.time; b.ss = {}; b.mq = []; b.mv = null;
  b.captured = true; b.bannerT = ph.name ? 150 : 0;
  if (ph.name) { Music.SFX.spell(); }
  clearBullets(false);
}
function endPhase(b, captured) {
  if (captured && b.ph && b.ph.name && b.captured) {
    const bonus = 200000 * (G.stageIdx + 1) * (b.ph.final ? 3 : 1);
    addScore(bonus);
    G.banner = { text: 'SPELL CARD CAPTURE!', sub: ' bonus ' + bonus.toLocaleString(), t: 0, dur: 110, small: true };
    Music.SFX.confirm();
  }
  clearBullets(true);
  W.lasers.length = 0;
  if (b.phase + 1 >= b.def.phases.length) {
    b.state = 'dying'; b.dieT = 0;
  } else {
    b.state = 'rest'; b.restT = 42;
  }
}
function updateBoss(b) {
  if (b.state === 'enter') {
    b.y += (110 - b.y) * .06 + .4;
    if (b.y >= 106) { b.y = 106; startPhase(b, 0); }
    return;
  }
  if (b.state === 'rest') {
    b.restT--;
    if (b.restT <= 0) startPhase(b, b.phase + 1);
    return;
  }
  if (b.state === 'dying') {
    b.dieT++;
    if (b.dieT % 14 === 0 && b.dieT < 100) {
      PAT.burst(b.x + rnd(-40, 40), b.y + rnd(-40, 40), '#ffd', 16, 4, 30);
      PAT.ringFx(b.x, b.y, '#fff', 90, 20);
      Music.SFX.kill();
    }
    if (b.dieT === 100) {
      Music.SFX.bigKill();
      PAT.burst(b.x, b.y, '#ffe14d', 40, 6, 46);
      PAT.ringFx(b.x, b.y, '#fff', 200, 34);
      addScore(100000 * (G.stageIdx + 1));
      for (let i = 0; i < 6; i++) W.items.push({ type: 'P', x: b.x + rnd(-50, 50), y: b.y + rnd(-30, 30), vx: rnd(-1, 1), vy: rnd(-2, -.5), t: 0 });
      for (let i = 0; i < 34; i++) W.items.push({ type: 's', x: b.x + rnd(-60, 60), y: b.y + rnd(-40, 40), vx: rnd(-1.5, 1.5), vy: rnd(-3, -1), t: 0 });
      clearBullets(false);
    }
    if (b.dieT === 150) {
      const def = b.def;
      G.boss = null;
      G.dialogBoss = def;
      startDialog(def.post, () => stageClear());
    }
    return;
  }
  // fight
  b.t++; b.timer--;
  b.ph.fn(b, b.t);
  if (b.bannerT > 0) b.bannerT--;
  if (b.hp <= 0) { endPhase(b, true); return; }
  if (b.timer <= 0) { Music.SFX.timeout(); endPhase(b, false); return; }
  // 移动
  if (b.mv) {
    b.mv.ct++;
    const k = Math.min(1, b.mv.ct / b.mv.f);
    const ez = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    b.x = b.mv.sx + (b.mv.tx - b.mv.sx) * ez;
    b.y = b.mv.sy + (b.mv.ty - b.mv.sy) * ez;
    if (k >= 1) b.mv = null;
  } else if (b.mq.length) {
    const m = b.mq.shift();
    b.mv = { sx: b.x, sy: b.y, tx: m[0], ty: m[1], f: m[2] || 60, ct: 0 };
  } else if (b.t % 140 === 0) {
    b.mq = [[rnd(90, F.w - 90), rnd(70, 165), 75]];
  }
}

/* ---------------- 碰撞（玩家 vs 弹幕/敌体） ---------------- */
function collidePlayer() {
  const p = G.player;
  if (p.dead || p.inv > 0 || p.bombT > 0) return;
  for (const b of W.bullets) {
    const d = Math.hypot(b.x - p.x, b.y - p.y);
    if (d < b.r + p.r) { killPlayer(); return; }
    if (d < b.r + p.grazeR && !b.grazed) {
      b.grazed = true; G.graze++; addScore(500);
      Music.SFX.graze();
      W.parts.push({ x: p.x + (b.x - p.x) * .5, y: p.y + (b.y - p.y) * .5, vx: rnd(-1, 1), vy: rnd(-1, 1), t: 0, life: 14, col: '#9cf', size: 2, kind: 'spark' });
    }
  }
  for (const e of W.enemies)
    if (Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r) { killPlayer(); return; }
  if (G.boss && G.boss.state === 'fight' && Math.hypot(G.boss.x - p.x, G.boss.y - p.y) < 24 + p.r) killPlayer();
}

/* ---------------- 对话 ---------------- */
function startDialog(lines, cb) {
  G.dialog = { lines: lines.map(l => ({ ...l })), idx: 0, chars: 0, cb };
}
function updateDialog() {
  const d = G.dialog;
  const line = d.lines[d.idx];
  if (!line) { const cb = d.cb; G.dialog = null; if (cb) cb(); return; }
  if (d.chars < line.t.length) {
    d.chars += 1.1;
    if (Math.floor(d.chars) % 3 === 0 && (K.down['KeyZ'] || K.down['Enter'])) { /* 加速 */ d.chars += 1.5; }
    if (G.frame % 4 === 0) Music.SFX.talk();
  }
  if (kHit('KeyZ') || kHit('Enter')) {
    if (d.chars < line.t.length) d.chars = line.t.length;
    else {
      d.idx++; d.chars = 0;
      if (d.idx >= d.lines.length) { const cb = d.cb; G.dialog = null; if (cb) cb(); }
    }
  }
}

/* ---------------- 关卡推进 ---------------- */
function makeRunner(idx) {
  const events = [];
  const R = {
    at(f, fn) { events.push({ t: f, fn }); },
    wave(t, fn) { R.at(t, fn); },
    multi(t, n, gap, mk) { for (let i = 0; i < n; i++) R.at(t + i * gap, mk(i)); },
    midboss(t, id) { R.at(t, () => spawnMidboss(id)); },
    boss(t, id) { R.at(t, () => startBossSequence(id)); }
  };
  STAGES.scripts[idx](R);
  events.sort((a, b) => a.t - b.t);
  return { t: 0, events, i: 0, done: false };
}
function startGame(idx, practice, carry) {
  G.mode = 'game';
  G.stageIdx = idx; G.practice = !!practice;
  G.overlay = null; G.dialog = null; G.boss = null;
  W.bullets.length = 0; W.pshots.length = 0; W.enemies.length = 0;
  W.items.length = 0; W.parts.length = 0; W.lasers.length = 0; W.shake = 0;
  const d = DIFFS[G.diff];
  window.DIFFC.dens = d.dens; window.DIFFC.spd = d.spd; window.DIFFC.hp = d.hp;
  if (carry && G.player) {
    G.player.x = F.w / 2; G.player.y = F.h - 70; G.player.inv = 120; G.player.dead = false; G.player.bombT = 0;
  } else {
    G.player = newPlayer(); G.player.char = G.char;
    G.score = 0; G.graze = 0; G.nextLife = 5e6; G.nextBomb = 1e7; G.continues = 0;
  }
  G.stageDeaths = 0;
  G.runner = makeRunner(idx);
  const st = STAGES.list[idx];
  G.banner = { text: st.title, sub: st.sub, t: 0, dur: 200 };
  Music.play('s' + (idx + 1));
  if (idx === 0 && !practice) {
    G.dialogBoss = null;
    startDialog(STAGES.PROLOGUE, null);
  }
}
function stageClear() {
  Music.stop();
  Music.jingle('clear');
  clearBullets(false); clearEnemies();
  const bonus = Math.max(0, 300000 - G.stageDeaths * 100000) + G.graze * 100;
  G.score += bonus;
  if (G.score > G.hiscore) { G.hiscore = G.score; localStorage.setItem('thsd_hiscore', G.hiscore); }
  G.overlay = {
    kind: 'clear', t: 0,
    bonus, stats: { graze: G.graze, deaths: G.stageDeaths, score: G.score },
    last: G.stageIdx === 5
  };
}

/* ---------------- 更新主逻辑 ---------------- */
function updateGame() {
  const p = G.player;
  if (kHit('Escape') && !G.overlay && !G.dialog) { G.overlay = { kind: 'pause', t: 0 }; return; }
  if (G.dialog) { updateDialog(); return; }
  if (G.overlay) { updateOverlay(); return; }
  G.playT++;
  updatePlayer(p);
  if (!G.runner.done) {
    G.runner.t++;
    const ev = G.runner.events;
    while (G.runner.i < ev.length && ev[G.runner.i].t <= G.runner.t) { ev[G.runner.i++].fn(); }
  }
  PAT.updateEnemies();
  PAT.updateBullets();
  PAT.updateLasers();
  updatePshots();
  updateItems();
  PAT.updateParts();
  if (G.boss) updateBoss(G.boss);
  collidePlayer();
  if (W.shake > 0) W.shake *= .88;
}

/* ---------------- 覆盖界面（暂停/续关/过关） ---------------- */
function updateOverlay() {
  const o = G.overlay;
  if (o.kind === 'pause') {
    if (kHit('KeyZ') || kHit('Enter') || kHit('Escape')) G.overlay = null;
    if (kHit('KeyQ')) {
      G.overlay = null; G.mode = 'title'; Music.play('title'); G.titleT = 0;
    }
  } else if (o.kind === 'continue') {
    o.t--;
    if (o.t <= 0 || kHit('KeyQ')) {
      if (G.score > G.hiscore) { G.hiscore = G.score; localStorage.setItem('thsd_hiscore', G.hiscore); }
      G.mode = 'gameover'; G.overlay = null; G.gameoverT = 0; Music.stop();
    } else if (kHit('Enter') || kHit('KeyZ')) {
      G.continues++;
      G.score = 0;
      const p = G.player;
      p.lives = 3; p.bombs = 3; p.dead = false; p.inv = 180;
      p.x = F.w / 2; p.y = F.h - 70;
      clearBullets(false);
      if (G.boss && G.boss.state === 'fight') { G.boss.hp = G.boss.hpMax; G.boss.timer = G.boss.ph.time; G.boss.t = 0; G.boss.ss = {}; G.boss.captured = false; }
      G.overlay = null;
    }
  } else if (o.kind === 'clear') {
    o.t++;
    if (o.t > 60 && (kHit('Enter') || kHit('KeyZ'))) {
      G.overlay = null;
      if (o.last && !G.practice) { G.mode = 'ending'; G.endT = 0; Music.play('end'); }
      else if (G.practice) { G.mode = 'title'; Music.play('title'); }
      else startGame(G.stageIdx + 1, false, true);
    }
  }
}

/* ---------------- 绘制：场地内元素 ---------------- */
function drawField() {
  const p = G.player;
  ctx.save();
  const sh = W.shake;
  ctx.translate(F.x + (sh ? rnd(-sh, sh) : 0), F.y + (sh ? rnd(-sh, sh) : 0));
  ctx.beginPath(); ctx.rect(0, 0, F.w, F.h); ctx.clip();
  GFX.drawBG(ctx, STAGES.list[G.stageIdx].bg, G.frame, 1 / 60);
  // 符卡背景
  if (G.boss && G.boss.state === 'fight' && G.boss.ph && G.boss.ph.bg)
    GFX.spellBG(ctx, G.frame, G.boss.ph.bg);
  // 道具
  for (const it of W.items) {
    const spr = itemSprite(it.type);
    const bob = Math.sin(G.frame * .15 + it.x) * 1.5;
    ctx.drawImage(spr, it.x - 14, it.y - 14 + bob);
  }
  // 敌人
  for (const e of W.enemies) {
    const spr = e.spr;
    const w = spr.width * (e.scale || 1), h = spr.height * (e.scale || 1);
    if (e.big) { // 血条
      ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(e.x - 30, e.y - h / 2 - 12, 60, 5);
      ctx.fillStyle = '#ff5c8a'; ctx.fillRect(e.x - 29, e.y - h / 2 - 11, 58 * clamp(e.hp / (e.maxhp || 1), 0, 1), 3);
    }
    ctx.drawImage(spr, e.x - w / 2, e.y - h / 2);
  }
  // Boss
  if (G.boss && G.boss.state !== 'dying') {
    const b = G.boss;
    const glow = ctx.createRadialGradient(b.x, b.y, 6, b.x, b.y, 55);
    const col = PAL[b.def.col] || '#fff';
    glow.addColorStop(0, col + '44'); glow.addColorStop(1, col + '00');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(b.x, b.y, 55, 0, TAU); ctx.fill();
  }
  if (G.boss && G.boss.state !== 'dying') {
    const b = G.boss, spr = GFX.bossSprite(b.id);
    const bob = Math.sin(G.frame * .06) * 3;
    ctx.drawImage(spr, b.x - 32, b.y - 42 + bob);
  }
  // 敌弹（激光画在弹幕下层）
  for (const l of W.lasers) {
    const x2 = l.x + Math.cos(l.ang) * l.len, y2 = l.y + Math.sin(l.ang) * l.len;
    const col = PAL[l.col] || '#f55';
    ctx.save();
    ctx.lineCap = 'round';
    if (l.t <= l.warn) {
      ctx.globalAlpha = .35 + Math.sin(G.frame * .6) * .25;
      ctx.strokeStyle = col; ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(x2, y2); ctx.stroke();
    } else {
      const fade = 1 - Math.max(0, (l.t - l.warn - l.active + 12) / 12);
      ctx.globalAlpha = .8 * clamp(fade, 0, 1);
      ctx.strokeStyle = col; ctx.lineWidth = l.w;
      ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.globalAlpha = .95 * clamp(fade, 0, 1);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = l.w * .38;
      ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.restore();
  }
  for (const b of W.bullets) {
    const spr = bulletSprite(b.shape, b.col);
    const rot = b.shape === 'circle' || b.shape === 'big' || b.shape === 'bubble' ? 0 : (b.ang || 0) + Math.PI / 2;
    ctx.save();
    ctx.translate(b.x, b.y);
    if (rot) ctx.rotate(rot);
    ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
    ctx.restore();
  }
  // 自机弹
  for (const s of W.pshots) {
    const spr = bulletSprite(s.shape, s.col);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(Math.atan2(s.vy, s.vx) + Math.PI / 2);
    ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
    ctx.restore();
  }
  // 玩家
  if (p && !p.dead && !(p.inv > 0 && G.frame % 8 < 4)) {
    const spr = GFX.playerSprite(G.char);
    const bob = Math.sin(G.frame * .12) * 1.6;
    ctx.drawImage(spr, p.x - 32, p.y - 40 + bob);
    if (p.focus) {
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(p.x, p.y, 13 + Math.sin(G.frame * .2) * 1.5, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,120,160,.9)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 5.5, 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f36';
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, TAU); ctx.fill();
  }
  // 符卡特效
  if (p && p.bombT > 0) drawBomb(p);
  // 粒子
  for (const pa of W.parts) {
    const k = 1 - pa.t / pa.life;
    if (pa.kind === 'spark') {
      ctx.globalAlpha = k;
      ctx.fillStyle = pa.col;
      ctx.fillRect(pa.x - pa.size / 2, pa.y - pa.size / 2, pa.size, pa.size);
    } else {
      ctx.globalAlpha = k * .8;
      ctx.strokeStyle = pa.col; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(pa.x, pa.y, pa.maxR * (1 - k * k), 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // Boss 血条与符卡名
  if (G.boss) drawBossHUD(G.boss);
  // 关卡横幅
  if (G.banner) drawBanner(G.banner);
  // 对话
  if (G.dialog) drawDialog();
  ctx.restore();
}
function drawBomb(p) {
  if (G.char === 'reimu') {
    const R = 60 + (250 - p.bombT) * 2.1;
    for (let i = 0; i < 3; i++) {
      const rr = R - i * 26;
      if (rr < 10) continue;
      ctx.strokeStyle = `rgba(255,${200 - i * 40},${230 - i * 60},${.5 - i * .12})`;
      ctx.lineWidth = 5 - i;
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = .16;
    ctx.fillStyle = '#ff8ac0';
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++) {
      const a = G.frame * .12 + i * TAU / 6;
      const dx = p.x + Math.cos(a) * R * .8, dy = p.y + Math.sin(a) * R * .8;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(dx, dy, 6, 0, TAU); ctx.fill();
      ctx.fillStyle = '#f36';
      ctx.beginPath(); ctx.arc(dx + 3, dy, 3, 0, TAU); ctx.fill();
    }
  } else {
    const a = clamp(p.bombT / 40, 0, 1);
    const w = 52 * (p.bombT > 170 ? (210 - p.bombT) / 40 : 1);
    ctx.globalAlpha = .85 * a;
    const grd = ctx.createLinearGradient(p.x - w, 0, p.x + w, 0);
    grd.addColorStop(0, 'rgba(255,220,80,0)');
    grd.addColorStop(.3, 'rgba(255,220,80,.9)');
    grd.addColorStop(.5, 'rgba(255,255,255,1)');
    grd.addColorStop(.7, 'rgba(255,220,80,.9)');
    grd.addColorStop(1, 'rgba(255,220,80,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(p.x - w, 0, w * 2, p.y);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 4; i++)
      PAT && W.parts.push({ x: p.x + rnd(-w, w), y: rnd(0, p.y), vx: rnd(-1, 1), vy: rnd(-3, -1), t: 0, life: 20, col: '#ffe14d', size: 3, kind: 'spark' });
  }
}
function drawBossHUD(b) {
  if (b.state === 'dying') return;
  // 名字
  if (b.state !== 'enter') {
    txt(ctx, b.def.name, F.w - 12, 16, 17, '#ffd', 'right', true);
    txt(ctx, b.def.title, F.w - 12, 34, 11, '#bdf', 'right');
  }
  if (b.state === 'fight' && b.ph) {
    // 血条
    const x = F.w - 212, y = 46, w = 200;
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - 2, y - 2, w + 4, 10);
    ctx.fillStyle = b.ph.name ? '#ff5c8a' : '#8ab4ff';
    ctx.fillRect(x, y, w * clamp(b.hp / b.hpMax, 0, 1), 6);
    // 剩余符卡
    for (let i = 0; i < b.def.phases.length; i++) {
      ctx.fillStyle = i <= b.phase ? '#ffd76b' : 'rgba(255,255,255,.25)';
      ctx.beginPath(); ctx.arc(x + 4 + i * 12, y + 16, 3.4, 0, TAU); ctx.fill();
    }
    txt(ctx, Math.ceil(b.timer / 60) + 's', F.w - 12, y + 16, 13, '#fff', 'right', true);
    // 符卡名横幅
    if (b.bannerT > 0 && b.ph.name) {
      const k = clamp(b.bannerT / 40, 0, 1);
      ctx.globalAlpha = k;
      txt(ctx, b.ph.name, F.w / 2, 120, 26, '#fff', 'center', true);
      txt(ctx, '— Spell Card —', F.w / 2, 148, 13, '#ffd76b', 'center');
      ctx.globalAlpha = 1;
    }
  }
}
function drawBanner(bn) {
  bn.t++;
  const T = bn.t, D = bn.dur;
  if (T > D + 30) { G.banner = null; return; }
  const a = T < 24 ? T / 24 : T > D ? Math.max(0, 1 - (T - D) / 30) : 1;
  ctx.globalAlpha = a;
  const size = bn.small ? 26 : 34;
  txt(ctx, bn.text, F.w / 2, F.h * .38, size, '#fff', 'center', true);
  txt(ctx, bn.sub || '', F.w / 2, F.h * .38 + (bn.small ? 24 : 32), bn.small ? 13 : 15, '#ffd76b', 'center');
  ctx.globalAlpha = 1;
}
function speakerInfo(s) {
  if (s === 'p') return { name: CHARS[G.char].name, id: G.char };
  if (s === 'b') { const d = G.dialogBoss || {}; return { name: d.name || '？？？', id: d.id || null }; }
  if (s === 'r') return { name: '博丽灵梦', id: 'reimu' };
  if (s === 'm') return { name: '雾雨魔理沙', id: 'marisa' };
  return { name: '', id: null };
}
function drawDialog() {
  const d = G.dialog;
  const line = d.lines[d.idx];
  if (!line) return;
  const info = speakerInfo(line.s);
  // 对话框
  const bh = 96;
  ctx.fillStyle = 'rgba(6,8,24,.88)';
  ctx.fillRect(4, F.h - bh - 8, F.w - 8, bh);
  ctx.strokeStyle = 'rgba(255,220,140,.7)'; ctx.lineWidth = 1.6;
  ctx.strokeRect(4, F.h - bh - 8, F.w - 8, bh);
  if (line.s === 'n') {
    const shown = line.t.slice(0, Math.floor(d.chars));
    txt(ctx, shown, F.w / 2, F.h - bh / 2 - 10, 16, '#cfe3ff', 'center');
  } else {
    if (info.name)
      txt(ctx, info.name, 18, F.h - bh + 4, 15, '#ffd76b', 'left', true);
    const shown = line.t.slice(0, Math.floor(d.chars));
    wrapText(shown, 18, F.h - bh + 30, F.w - 36, 17, 22);
  }
  if (d.chars >= line.t.length && G.frame % 40 < 24) {
    txt(ctx, '▼', F.w - 24, F.h - 22, 13, '#ffd76b', 'center');
  }
}
function wrapText(s, x, y, maxW, size, lh) {
  ctx.font = `16px "Segoe UI","Microsoft YaHei",sans-serif`;
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  let line = '', yy = y;
  for (const ch of s) {
    if (ctx.measureText(line + ch).width > maxW) {
      ctx.fillText(line, x, yy); line = ch; yy += lh;
    } else line += ch;
  }
  ctx.fillText(line, x, yy);
}

/* ---------------- 侧边 HUD ---------------- */
function drawHUD() {
  const p = G.player;
  const px = F.x + F.w + 24;
  ctx.save();
  // 面板背景
  const grd = ctx.createLinearGradient(F.x + F.w, 0, 960, 0);
  grd.addColorStop(0, 'rgba(14,16,38,.95)');
  grd.addColorStop(1, 'rgba(20,22,50,.9)');
  ctx.fillStyle = grd;
  ctx.fillRect(F.x + F.w, 0, 960 - F.x - F.w, 720);
  ctx.strokeStyle = 'rgba(255,220,140,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(F.x + F.w + .5, 0); ctx.lineTo(F.x + F.w + .5, 720); ctx.stroke();
  ctx.textBaseline = 'middle';
  txt(ctx, 'HI-SCORE', px, 34, 12, '#9aa4c8');
  txt(ctx, fmt(Math.max(G.hiscore, G.score)), px, 56, 22, '#ffd76b', 'left', true);
  txt(ctx, 'SCORE', px, 88, 12, '#9aa4c8');
  txt(ctx, fmt(G.score), px, 110, 22, '#fff', 'left', true);
  // 立绘
  if (G.dialog && G.dialog.lines[G.dialog.idx]) {
    const line = G.dialog.lines[G.dialog.idx];
    const info = speakerInfo(line.s);
    if (info.id) ctx.drawImage(GFX.portrait(info.id), px - 6, 140, 200, 200);
  }
  let y = 368;
  txt(ctx, 'PLAYER', px, y, 12, '#9aa4c8'); y += 20;
  txt(ctx, CHARS[G.char].name, px, y, 17, '#fff', 'left', true); y += 26;
  txt(ctx, '残机', px, y, 13, '#9aa4c8');
  for (let i = 0; i < Math.min(p.lives, 8); i++) {
    star(ctx, px + 52 + i * 20, y, 8, '#ff5c8a');
  }
  y += 26;
  txt(ctx, '符卡', px, y, 13, '#9aa4c8');
  for (let i = 0; i < Math.min(p.bombs, 6); i++) {
    star(ctx, px + 52 + i * 20, y, 8, '#5cc8ff');
  }
  y += 28;
  txt(ctx, 'POWER', px, y, 12, '#9aa4c8');
  ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(px + 62, y - 6, 110, 10);
  ctx.fillStyle = p.power >= 4 ? '#ffd76b' : '#ff8a5c';
  ctx.fillRect(px + 62, y - 6, 110 * clamp(p.power / 4, 0, 1), 10);
  txt(ctx, p.power.toFixed(2), px + 180, y, 13, '#fff');
  y += 26;
  txt(ctx, 'GRAZE', px, y, 12, '#9aa4c8');
  txt(ctx, fmt(G.graze), px + 62, y, 15, '#9cf', 'left', true);
  y += 26;
  txt(ctx, 'POINT', px, y, 12, '#9aa4c8');
  txt(ctx, fmt(Math.round(10000 + (1 - p.y / F.h) * 9000)), px + 62, y, 13, '#8fd', 'left');
  y += 40;
  txt(ctx, `第 ${G.stageIdx + 1} 夜 / ${STAGES.list.length}`, px, y, 14, '#cfe3ff', 'left', true);
  y += 24;
  txt(ctx, DIFFS[G.diff].name + (G.practice ? ' · 练习' : ''), px, y, 12, '#9aa4c8');
  // Boss 符卡历史
  if (G.boss && G.boss.state === 'fight') {
    y += 40;
    txt(ctx, '— BOSS —', px, y, 13, '#ffd76b', 'left', true); y += 22;
    txt(ctx, G.boss.def.name + '【' + G.boss.def.title + '】', px, y, 14, '#fff'); y += 20;
    for (let i = 0; i < G.boss.def.phases.length; i++) {
      const ph = G.boss.def.phases[i];
      const done = i < G.boss.phase, cur = i === G.boss.phase;
      ctx.globalAlpha = done ? 1 : cur ? .95 : .4;
      txt(ctx, (done ? '◆ ' : cur ? '▶ ' : '◇ ') + (ph.non ? '通常弹幕' : ph.name), px, y, 12.5, ph.non ? '#9ab' : '#fbc');
      ctx.globalAlpha = 1;
      y += 18;
    }
  }
  // 底部提示
  txt(ctx, 'Z射击 X符卡 Shift低速', px, 668, 12, '#778');
  txt(ctx, Music.muted ? 'M 静音中' : 'M 静音  Esc暂停', px, 688, 12, '#778');
  ctx.restore();
}
function star(g, x, y, r, col) {
  g.fillStyle = col;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r;
    g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  g.closePath(); g.fill();
}
const fmt = n => n.toLocaleString('en-US');

/* ---------------- 标题等界面 ---------------- */
function updateTitle() {
  G.titleT++;
  const items = 5;
  if (kHit('ArrowUp') || kHit('KeyW')) { G.menuIdx = (G.menuIdx + items - 1) % items; Music.SFX.menu(); }
  if (kHit('ArrowDown') || kHit('KeyS')) { G.menuIdx = (G.menuIdx + 1) % items; Music.SFX.menu(); }
  const adjust = kHit('KeyZ') || kHit('Enter');
  if (G.menuIdx === 0 && adjust) { Music.SFX.confirm(); startGame(0, false); }
  else if (G.menuIdx === 1 && adjust) { Music.SFX.confirm(); G.mode = 'practice'; G.subIdx = 0; }
  else if (G.menuIdx === 2 && (adjust || kHit('ArrowRight') || kHit('ArrowLeft'))) {
    if (kHit('ArrowLeft')) G.diff = (G.diff + 2) % 3; else G.diff = (G.diff + 1) % 3;
    Music.SFX.menu();
  } else if (G.menuIdx === 3 && (adjust || kHit('ArrowRight') || kHit('ArrowLeft'))) {
    if (kHit('ArrowLeft')) G.char = G.char === 'reimu' ? 'marisa' : 'reimu';
    else G.char = G.char === 'reimu' ? 'marisa' : 'reimu';
    Music.SFX.menu();
  } else if (G.menuIdx === 4 && adjust) { Music.SFX.confirm(); G.mode = 'help'; }
}
function drawTitle() {
  ctx.fillStyle = '#04050c'; ctx.fillRect(0, 0, 960, 720);
  ctx.save();
  ctx.translate(F.x, F.y);
  GFX.drawBG(ctx, 4, G.titleT, 1 / 60);
  ctx.restore();
  // 标题
  const ty = 170 + Math.sin(G.titleT * .02) * 4;
  ctx.save();
  ctx.translate(480, ty);
  const tg = ctx.createLinearGradient(-220, -40, 220, 40);
  tg.addColorStop(0, '#ffe9a0'); tg.addColorStop(.5, '#ffd76b'); tg.addColorStop(1, '#e8a84c');
  ctx.font = 'bold 74px "STKaiti","KaiTi","SimSun",serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(20,10,40,.9)'; ctx.lineWidth = 9;
  ctx.strokeText('東方星塵録', 0, 0);
  ctx.fillStyle = tg; ctx.fillText('東方星塵録', 0, 0);
  ctx.font = 'italic 20px Georgia,serif';
  ctx.fillStyle = '#9db4ff';
  ctx.fillText('~ Star Dust Incident. ~', 0, 58);
  ctx.restore();
  txt(ctx, '— 六扇星门与未完的诗 —', 480, ty + 96, 15, '#c9d6ff', 'center');
  // 菜单
  const items = ['开始游戏', '关卡练习', `难度  ${DIFFS[G.diff].name}`, `角色  ${CHARS[G.char].name}`, '操作说明'];
  const my = 400;
  for (let i = 0; i < items.length; i++) {
    const sel = i === G.menuIdx;
    const y = my + i * 42;
    if (sel) {
      ctx.fillStyle = 'rgba(255,215,107,.12)';
      ctx.fillRect(360, y - 17, 240, 34);
      txt(ctx, '◆', 372, y, 16, '#ffd76b', 'center');
    }
    txt(ctx, items[i], 480, y, sel ? 21 : 18, sel ? '#ffe9a0' : '#b8c4e8', 'center', sel);
  }
  txt(ctx, '↑↓选择  Z确认  ←→调整', 480, 640, 13, '#7788aa', 'center');
  txt(ctx, `HI-SCORE ${fmt(G.hiscore)}`, 480, 668, 14, '#ffd76b', 'center');
  txt(ctx, '东方Project二次创作 · Fan Game · 全部素材程序生成', 480, 696, 11, '#556', 'center');
}
function drawPractice() {
  ctx.fillStyle = '#04050c'; ctx.fillRect(0, 0, 960, 720);
  txt(ctx, '— 关卡练习 —', 480, 90, 30, '#ffe9a0', 'center', true);
  for (let i = 0; i < 6; i++) {
    const y = 170 + i * 64;
    const sel = i === G.subIdx;
    if (sel) { ctx.fillStyle = 'rgba(255,215,107,.1)'; ctx.fillRect(220, y - 26, 520, 52); }
    txt(ctx, (sel ? '◆ ' : '') + STAGES.list[i].title, 250, y - 8, 20, sel ? '#ffe9a0' : '#b8c4e8', 'left', sel);
    txt(ctx, STAGES.list[i].sub, 250, y + 14, 12, '#7788aa');
    txt(ctx, 'Boss: ' + STAGES.BOSSES[STAGES.list[i].boss].name, 720, y, 13, '#fbc', 'right');
  }
  txt(ctx, '↑↓选择  Z开始  Esc返回', 480, 610, 14, '#7788aa', 'center');
  if (kHit('ArrowUp')) { G.subIdx = (G.subIdx + 5) % 6; Music.SFX.menu(); }
  if (kHit('ArrowDown')) { G.subIdx = (G.subIdx + 1) % 6; Music.SFX.menu(); }
  if (kHit('KeyZ') || kHit('Enter')) { Music.SFX.confirm(); startGame(G.subIdx, true); }
  if (kHit('Escape')) { G.mode = 'title'; Music.SFX.menu(); }
}
function drawHelp() {
  ctx.fillStyle = '#04050c'; ctx.fillRect(0, 0, 960, 720);
  txt(ctx, '— 操作说明 —', 480, 80, 30, '#ffe9a0', 'center', true);
  const L = [
    ['方向键 / WASD', '移动'],
    ['Shift', '低速模式（显示判定点，微调走位）'],
    ['Z', '射击（按住） / 对话推进'],
    ['X', '使用符卡（Bomb）'],
    ['Enter / Z', '确认'],
    ['Esc', '暂停'],
    ['M', '静音开关'],
    ['', ''],
    ['游戏规则', ''],
    ['· 擦弹（贴着弹幕但不被击中）', '获得额外分数'],
    ['· 收集蓝点道具', '越高的位置价值越高；满 POWER 后自动吸取'],
    ['· 击破符卡且不死不炸', '获得高额 Capture 奖励'],
    ['· 红色 P 道具', '提升 POWER（1.00 → 4.00）'],
  ];
  for (let i = 0; i < L.length; i++) {
    const y = 150 + i * 34;
    txt(ctx, L[i][0], 200, y, 16, '#cfe3ff', 'left', i % 9 === 7 ? false : false);
    txt(ctx, L[i][1], 480, y, 15, '#9aa4c8', 'left');
  }
  txt(ctx, 'Z / Esc 返回', 480, 640, 14, '#7788aa', 'center');
  if (kHit('KeyZ') || kHit('Enter') || kHit('Escape')) { G.mode = 'title'; Music.SFX.menu(); }
}
function drawOverlays() {
  const o = G.overlay;
  if (!o) return;
  ctx.fillStyle = 'rgba(2,3,12,.72)';
  ctx.fillRect(0, 0, 960, 720);
  if (o.kind === 'pause') {
    txt(ctx, '— 暂停 —', 480, 280, 34, '#ffe9a0', 'center', true);
    txt(ctx, 'Z / Enter · 再开', 480, 360, 18, '#cfe3ff', 'center');
    txt(ctx, 'Q · 回到标题', 480, 396, 18, '#cfe3ff', 'center');
  } else if (o.kind === 'continue') {
    txt(ctx, 'CONTINUE?', 480, 260, 46, '#ff5c8a', 'center', true);
    txt(ctx, `${Math.ceil(o.t / 60)}`, 480, 340, 40, '#fff', 'center', true);
    txt(ctx, 'Enter · 继续（分数清零）      Q · 放弃', 480, 420, 17, '#cfe3ff', 'center');
  } else if (o.kind === 'clear') {
    const st = STAGES.list[G.stageIdx];
    txt(ctx, st.title + ' 通关！', 480, 200, 32, '#ffe9a0', 'center', true);
    const s = o.stats;
    const rows = [
      ['GRAZE', fmt(s.graze)],
      ['MISS', fmt(s.deaths)],
      ['CLEAR BONUS', fmt(o.bonus)],
      ['TOTAL SCORE', fmt(s.score)]
    ];
    for (let i = 0; i < rows.length; i++) {
      txt(ctx, rows[i][0], 380, 300 + i * 44, 17, '#9aa4c8', 'left');
      txt(ctx, rows[i][1], 600, 300 + i * 44, 22, i === 3 ? '#ffd76b' : '#fff', 'right', i === 3);
    }
    if (o.t > 60 && G.frame % 50 < 32)
      txt(ctx, o.last ? 'Z · 进入结局' : 'Z · 前往下一夜', 480, 520, 16, '#cfe3ff', 'center');
  }
}
function drawGameover() {
  ctx.fillStyle = '#04050c'; ctx.fillRect(0, 0, 960, 720);
  ctx.save(); ctx.translate(F.x, F.y);
  GFX.drawBG(ctx, 4, G.gameoverT, 1 / 60);
  ctx.restore();
  txt(ctx, 'GAME OVER', 480, 280, 52, '#ff5c8a', 'center', true);
  txt(ctx, '最终得分  ' + fmt(G.score), 480, 360, 22, '#fff', 'center');
  txt(ctx, '最高纪录  ' + fmt(G.hiscore), 480, 396, 16, '#ffd76b', 'center');
  if (G.gameoverT > 60) txt(ctx, 'Z · 回到标题', 480, 480, 16, '#cfe3ff', 'center');
  G.gameoverT++;
  if (G.gameoverT > 60 && (kHit('KeyZ') || kHit('Enter'))) { G.mode = 'title'; Music.play('title'); }
}

/* ---------------- 结局 ---------------- */
const END_LINES = [
  ['—— 星空归还之夜 ——', 30, '#ffe9a0', true],
  ['', 0],
  ['星屑升回夜空，六扇星门无声地关闭了。', 18, '#fff'],
  ['幻想乡的四季，重新开始流转。', 18, '#fff'],
  ['', 0],
  ['咏留在人间之里，开始学习写「会变化的诗」。', 18, '#fff'],
  ['据说她写下的第一句是——', 18, '#fff'],
  ['「今夜的月亮，和昨夜不同。」', 22, '#ffd76b', true],
  ['', 0],
  ['', 0],
  ['=== ALL CLEAR ===', 30, '#ffe9a0', true],
  ['', 0],
  ['最终得分  ' + null, 20, '#fff'],
  ['', 0],
  ['—— STAFF ——', 18, '#9cf', true],
  ['企划 · 剧情 · 程序 · 美术 · 音乐', 15, '#b8c4e8'],
  ['ZCode（AI）', 15, '#b8c4e8'],
  ['', 0],
  ['原作世界观', 15, '#b8c4e8'],
  ['上海爱丽丝幻乐团 「东方Project」', 15, '#b8c4e8'],
  ['', 0],
  ['BGM：全部由程序实时合成', 13, '#778'],
  ['图像：全部由程序实时绘制', 13, '#778'],
  ['本作为东方Project二次创作，非商业用途', 13, '#778'],
  ['', 0],
  ['感谢游玩。', 20, '#ffe9a0', true]
];
function updateEnding() {
  G.endT += .5;
  const total = END_LINES.reduce((a, l) => a + l[1] + 14, 0);
  if (kHit('KeyZ') || kHit('Enter')) {
    if (G.endT < total) G.endT = total;
    else { G.mode = 'title'; Music.play('title'); }
  }
}
function drawEnding() {
  ctx.fillStyle = '#04050c'; ctx.fillRect(0, 0, 960, 720);
  ctx.save(); ctx.translate(F.x, F.y);
  GFX.drawBG(ctx, 4, G.frame, 1 / 60);
  ctx.restore();
  ctx.fillStyle = 'rgba(2,3,12,.5)';
  ctx.fillRect(F.x, F.y, F.w, F.h);
  let y = F.h + 60 - G.endT;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const l of END_LINES) {
    let text = l[0];
    if (text.includes('最终得分')) text = '最终得分  ' + fmt(G.score);
    y += l[1] + 14;
    if (y > -30 && y < F.h + 30 && text)
      txt(ctx, text, F.w / 2, y, l[1] || 14, l[2] || '#fff', 'center', l[3]);
  }
  txt(ctx, 'Z · ' + (G.endT < 800 ? '加速' : '回到标题'), F.x + F.w - 20, F.y + F.h - 20, 13, '#7788aa', 'right');
}

/* ---------------- 主循环 ---------------- */
function update() {
  G.frame++;
  if (kHit('KeyM')) { Music.toggleMute(); }
  switch (G.mode) {
    case 'title': updateTitle(); break;
    case 'practice': break;
    case 'help': break;
    case 'game': updateGame(); break;
    case 'ending': updateEnding(); break;
    case 'gameover': break;
  }
}
function draw() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 960, 720);
  switch (G.mode) {
    case 'title': drawTitle(); break;
    case 'practice': drawPractice(); break;
    case 'help': drawHelp(); break;
    case 'game':
      drawField(); drawHUD();
      if (G.overlay) drawOverlays();
      break;
    case 'ending': drawEnding(); break;
    case 'gameover': drawGameover(); break;
  }
}
let acc = 0, last = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  if (!last) last = ts;
  let dt = ts - last; last = ts;
  if (dt > 120) dt = 120;
  acc += dt;
  let steps = 0;
  while (acc >= 1000 / 60 && steps < 4) { update(); acc -= 1000 / 60; steps++; }
  draw();
  for (const k in K.hit) K.hit[k] = false;
}
requestAnimationFrame(loop);
