'use strict';
/* ============================================================
 *  東方星塵録 — 弹幕引擎 patterns.js
 *  弹幕行为 / 激光 / 杂兵工厂 / 弹幕辅助（坐标系为场地内局部坐标）
 * ============================================================ */
window.World = {
  bullets: [], pshots: [], enemies: [], items: [], parts: [], lasers: [],
  boss: null, shake: 0
};
window.DIFFC = { dens: 1, spd: 1, hp: 1 };

const PAT = (() => {
  const F = window.FIELD, TAU = Math.PI * 2, W = window.World;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const N = n => Math.max(1, Math.round(n * DIFFC.dens));
  const SP = s => s * DIFFC.spd;

  /* ---------------- 弹幕生成 ---------------- */
  function SB(o) {
    const b = {
      x: 0, y: 0, spd: 0, ang: 0, vx: 0, vy: 0,
      r: GFX.BULLET_R[o.shape || 'circle'] || 7,
      shape: 'circle', col: 'red', kind: 'lin', data: null,
      t: 0, grazed: false, dead: false, spin: 0, angV: 0
    };
    Object.assign(b, o);
    if (o.spd != null && o.ang != null) { b.vx = Math.cos(o.ang) * o.spd; b.vy = Math.sin(o.ang) * o.spd; }
    b.baseAng = b.ang;
    W.bullets.push(b);
    return b;
  }
  // 环形
  function ring(src, o) {
    const n = N(o.n), base = o.ang != null ? o.ang : (o.aim ? aimAng(src) : 0);
    for (let i = 0; i < n; i++) {
      const a = base + i / n * TAU + (o.off || 0);
      SB({
        x: src.x + (o.ox || 0), y: src.y + (o.oy || 0),
        spd: SP(o.spd + (o.spdVar ? rnd(-o.spdVar, o.spdVar) : 0)), ang: a,
        shape: o.shape || 'circle', col: o.col || 'red', kind: o.kind || 'lin', data: o.data ? Object.assign({}, o.data) : null
      });
    }
  }
  // 扇形
  function fan(src, o) {
    const n = N(o.n), base = o.aim ? aimAng(src) : (o.ang != null ? o.ang : Math.PI / 2);
    const spread = o.spread != null ? o.spread : .5;
    for (let i = 0; i < n; i++) {
      const a = n === 1 ? base : base - spread / 2 + spread * i / (n - 1);
      SB({
        x: src.x + (o.ox || 0), y: src.y + (o.oy || 0),
        spd: SP(o.spd + (o.spdVar ? rnd(-o.spdVar, o.spdVar) : 0)), ang: a,
        shape: o.shape || 'rice', col: o.col || 'red', kind: o.kind || 'lin', data: o.data ? Object.assign({}, o.data) : null
      });
    }
  }
  // 单发
  function shot(src, o) {
    return SB({
      x: src.x + (o.ox || 0), y: src.y + (o.oy || 0),
      spd: SP(o.spd), ang: o.aim !== false ? aimAng(src, o.ox, o.oy) : (o.ang || Math.PI / 2),
      shape: o.shape || 'rice', col: o.col || 'red', kind: o.kind || 'lin', data: o.data ? Object.assign({}, o.data) : null
    });
  }
  function aimAng(src, ox, oy) {
    const p = window.PGame && window.PGame.player;
    if (!p) return Math.PI / 2;
    return Math.atan2(p.y - (src.y + (oy || 0)), p.x - (src.x + (ox || 0)));
  }
  // 激光
  function laser(o) {
    W.lasers.push({
      x: o.x, y: o.y, ang: o.ang || 0, len: o.len || 900, w: o.w || 22,
      warn: o.warn != null ? o.warn : 40, active: o.active != null ? o.active : 30,
      t: 0, col: o.col || 'red', dang: o.dang || 0, src: o.src || null,
      ox: o.ox || 0, oy: o.oy || 0, dead: false, thin: o.thin || false
    });
    if (o.quiet !== true) Music.SFX.laser();
  }
  // 每帧工具
  const every = (t, n, off) => (t + (off || 0)) % n === 0;
  const phase = (t, n) => (t % n) / n;

  /* ---------------- 更新 ---------------- */
  function updateBullets() {
    const p = window.PGame ? window.PGame.player : null;
    const arr = W.bullets;
    for (let i = arr.length - 1; i >= 0; i--) {
      const b = arr[i];
      b.t++;
      switch (b.kind) {
        case 'acc':
          b.vx += b.data.ax; b.vy += b.data.ay;
          if (b.data.max) {
            const s = Math.hypot(b.vx, b.vy);
            if (s > b.data.max) { b.vx *= b.data.max / s; b.vy *= b.data.max / s; }
          }
          break;
        case 'curve': {
          const a = Math.atan2(b.vy, b.vx) + b.data.w;
          const s = Math.hypot(b.vx, b.vy);
          b.vx = Math.cos(a) * s; b.vy = Math.sin(a) * s;
          b.baseAng = a;
          break;
        }
        case 'home': {
          if (p && !p.dead) {
            const cur = Math.atan2(b.vy, b.vx);
            let d = norm(Math.atan2(p.y - b.y, p.x - b.x) - cur);
            const w = Math.abs(d) < b.data.w ? d : Math.sign(d) * b.data.w;
            const a = cur + w, s = Math.hypot(b.vx, b.vy);
            b.vx = Math.cos(a) * s; b.vy = Math.sin(a) * s;
          }
          break;
        }
        case 'stop': {
          const d = b.data;
          const s0 = Math.hypot(b.vx, b.vy);
          if (b.t <= d.decel) {
            const s1 = Math.max(d.stop || .4, s0 * (d.fric || .93));
            b.vx *= s1 / s0; b.vy *= s1 / s0;
          } else if (b.t === d.decel + 1 && d.then) {
            d.then(b);
          }
          if (d.die && b.t > d.die) b.dead = true;
          break;
        }
        case 'bounce': {
          if (b.x < b.r && b.vx < 0 && (b.data.b > 0)) { b.vx = -b.vx; b.data.b--; }
          else if (b.x > F.w - b.r && b.vx > 0 && (b.data.b > 0)) { b.vx = -b.vx; b.data.b--; }
          if (b.y < b.r && b.vy < 0 && (b.data.b > 0)) { b.vy = -b.vy; b.data.b--; }
          else if (b.y > F.h - b.r && b.vy > 0 && (b.data.b > 0)) { b.vy = -b.vy; b.data.b--; }
          break;
        }
        case 'sine': {
          const s = Math.hypot(b.vx, b.vy);
          const off = Math.sin(b.t * b.data.f) * b.data.A;
          const a = b.baseAng + off;
          b.vx = Math.cos(a) * s; b.vy = Math.sin(a) * s;
          break;
        }
      }
      b.x += b.vx; b.y += b.vy;
      if (b.vx || b.vy) b.ang = Math.atan2(b.vy, b.vx);
      if (b.spin) b.angV += b.spin;
      if (b.x < -60 || b.x > F.w + 60 || b.y < -80 || b.y > F.h + 70) b.dead = true;
      if (b.dead) arr.splice(i, 1);
    }
  }
  function norm(a) { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; }

  function updateLasers() {
    const p = window.PGame ? window.PGame.player : null;
    for (let i = W.lasers.length - 1; i >= 0; i--) {
      const l = W.lasers[i];
      l.t++;
      if (l.src) { l.x = l.src.x + l.ox; l.y = l.src.y + l.oy; }
      if (l.dang) l.ang += l.dang;
      if (l.t > l.warn + l.active) l.dead = true;
      if (l.dead) { W.lasers.splice(i, 1); continue; }
      // 碰撞（激活期）
      if (p && !p.dead && l.t > l.warn && window.PGame.collideLaser(l, p)) {
        window.PGame.killPlayer();
      }
    }
  }

  /* ---------------- 杂兵 ---------------- */
  function makeEnemy(o) {
    const e = {
      x: o.x, y: o.y, vx: o.vx || 0, vy: o.vy || 0,
      hp: Math.round((o.hp || 10) * DIFFC.hp), maxhp: o.hp || 10,
      r: o.r || 12, t: 0, dead: false, ss: {},
      fire: o.fire || null, spr: o.spr, scale: o.scale || 1,
      score: o.score || 1000, drops: o.drops || { p: 1 },
      mv: null, mq: o.path ? o.path.slice() : [], sway: o.sway || 0,
      hb: o.hb || null, big: o.big || false
    };
    W.enemies.push(e);
    return e;
  }
  function updateEnemies() {
    const arr = W.enemies;
    for (let i = arr.length - 1; i >= 0; i--) {
      const e = arr[i];
      e.t++;
      if (e.mv) { // 路径插值
        e.mv.ct++;
        const k = Math.min(1, e.mv.ct / e.mv.f);
        const ez = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        e.x = e.mv.sx + (e.mv.tx - e.mv.sx) * ez;
        e.y = e.mv.sy + (e.mv.ty - e.mv.sy) * ez;
        if (k >= 1) e.mv = null;
      } else if (e.mq.length) {
        const m = e.mq.shift();
        e.mv = { sx: e.x, sy: e.y, tx: m[0], ty: m[1], f: m[2] || 60, ct: 0 };
      } else { e.x += e.vx; e.y += e.vy; }
      if (e.sway) e.x += Math.sin(e.t * .06) * e.sway * .16;
      if (e.fire) e.fire(e);
      const M = 90;
      if (e.x < -M || e.x > F.w + M || e.y < -M || e.y > F.h + M) e.dead = true;
      if (e.dead) arr.splice(i, 1);
    }
  }
  // 妖精
  function fairy(o) {
    return makeEnemy(Object.assign({
      hp: 12, r: 12, spr: GFX.fairySprite(o.col || 'blue'), score: 1200,
      drops: { p: 2 }
    }, o));
  }
  // 浮游炮
  function orb(o) {
    return makeEnemy(Object.assign({
      hp: 40, r: 16, spr: GFX.orbSprite(o.col || 'violet'), score: 3000,
      drops: { p: 3 }, big: true
    }, o));
  }

  /* ---------------- 粒子 ---------------- */
  function burst(x, y, col, n, spd, life) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU), s = rnd(spd * .3, spd);
      W.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, life: life || 26, col, size: rnd(1.5, 4), kind: 'spark' });
    }
  }
  function ringFx(x, y, col, maxR, life) {
    W.parts.push({ x, y, t: 0, life: life || 24, col, maxR: maxR || 60, kind: 'ring' });
  }
  function updateParts() {
    for (let i = W.parts.length - 1; i >= 0; i--) {
      const p = W.parts[i];
      p.t++;
      if (p.kind === 'spark') { p.x += p.vx; p.y += p.vy; p.vx *= .93; p.vy *= .93; }
      if (p.t > p.life) W.parts.splice(i, 1);
    }
  }

  return {
    SB, ring, fan, shot, laser, aimAng, every, phase,
    updateBullets, updateLasers, updateEnemies, updateParts,
    makeEnemy, fairy, orb, burst, ringFx, rnd, N, SP, norm
  };
})();
