/* Stage 6 — 琥珀色泽的悠久幻想 · 天香久远 + 终符 */
const DIALOG_S6_PRE = [
  { who: '久远', text: '真是粗暴的客人呢。连我最得力的庭师，都没能留住你的脚步。' },
  { who: '灵梦', text: '你就是这场金雨的源头？自我介绍就免了，快把笼罩幻想乡的琥珀收回去。' },
  { who: '久远', text: '为什么要收回去呢，博丽的巫女？我刚刚从漫长的地底沉睡中苏醒，却看到这个名为幻想乡的箱庭，每天都有人在老去，每天都有记忆在消亡。' },
  { who: '灵梦', text: '那不是理所当然的事吗？太阳下山了还会再升起来啊。' },
  { who: '久远', text: '但明天的太阳，照亮的已经不是今天的茶会了！……只要用我的神脂将整个幻想乡凝固在最热闹的这一刻，就没有人会再失去任何东西了！' },
  { who: '灵梦', text: '听起来很感人，但如果永远停在今天，我神社里空空如也的赛钱箱就永远不可能有进账了！' },
  { who: '久远', text: '……哈？我说的可是关乎永恒与消亡的神明大义啊？！' },
  { who: '灵梦', text: '少啰嗦！连「明天可能会有人来塞钱」这点盼头都要剥夺的神明，看我今天就把你敲碎！' },
];
const DIALOG_S6_POST = [
  { who: '久远', text: '……神明的大义，竟输给了赛钱箱的盼头吗……' },
  { who: '灵梦', text: '赔偿写进香油钱。古铜钱也行——香霖堂能换茶叶。' },
];

function spawnWisp(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 85, kind: 'enemy.chrono_wisp', w: 26, h: 26, r: 11, score: 700,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}
function spawnOrb(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 140, kind: 'enemy.memory_orb', w: 34, h: 34, r: 14, score: 1200,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}

class Stage6Director {
  constructor(game) {
    this.g = game; this.t = 0; this.done = {}; this.phase = 'mid';
  }
  reset() { this.t = 0; this.done = {}; this.phase = 'mid'; }
  update(dt) {
    if (this.phase !== 'mid') return;
    this.t += dt;
    const g = this.g;

    if (this.t >= 8 && !this.done.w1) {
      this.done.w1 = true;
      for (let i = 0; i < 9; i++) {
        const e = spawnWisp(g, W / 2, -20);
        e._i = i; e._a = (i / 9) * Math.PI * 2;
        e.move = (en, d) => {
          en._a += d * 1.2;
          en.y += 1.1 * 60 * d;
          en.x = W / 2 + Math.cos(en._a) * (40 + en.age * 18);
        };
        e.fireCd = 0.4;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0 || en.y < 40) return;
          en.fireCd = 1.0;
          const a = angTo(en.x, en.y, game.player.x, game.player.y);
          game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: a, speed: 2.1, kind: 'bullet.chrono_shard', r: 4 }));
        };
        e.onDeath = function (game) {
          emitFan(game.enemyBullets, this.x, this.y, Math.PI / 2, 5, 28, 1.8, 'bullet.chrono_shard');
        };
      }
    }

    if (this.t >= 22 && !this.done.w2) {
      this.done.w2 = true;
      for (let i = 0; i < 5; i++) {
        const e = spawnOrb(g, 60 + i * 65, -25);
        e._ty = 100 + (i % 3) * 40;
        e.move = (en, d) => {
          if (en.y < en._ty) en.y += 1.2 * 60 * d;
          else {
            en._hold = (en._hold || 0) + d;
            if (en._hold > 4.5) { en.alive = false; en.onDeath && en.onDeath(g); }
          }
        };
        e.onDeath = function (game) {
          emitRing(game.enemyBullets, this.x, this.y, 8, 1.6, 'bullet.amber_seal');
          emitRing(game.enemyBullets, this.x, this.y, 4, 1.2, 'bullet.char_glyph');
        };
      }
    }

    if (this.t >= 38 && !this.done.w3) {
      this.done.w3 = true;
      for (let i = 0; i < 3; i++) {
        const e = spawnOrb(g, W / 2 - 60 + i * 60, -20);
        e.move = (en, d) => { en.y += 1.0 * 60 * d; };
        e.onDeath = function (game) {
          emitRing(game.enemyBullets, this.x, this.y, 8, 1.7, 'bullet.amber_seal');
        };
      }
      for (let i = 0; i < 6; i++) {
        const side = i < 3 ? 40 : W - 40;
        const e = spawnWisp(g, side, -15 - (i % 3) * 20);
        e.move = (en, d) => { en.y += 1.35 * 60 * d; };
        e.shoot = aimFanShoot(1, 0, 2.0, 'bullet.chrono_shard', 0.9);
      }
    }

    if (this.t >= 55 && !this.done.w4) {
      this.done.w4 = true;
      this._tearN = 8; this._tearCd = 0;
    }
    if (this.done.w4 && this._tearN > 0) {
      this._tearCd -= dt;
      if (this._tearCd <= 0) {
        this._tearCd = 1.1; this._tearN--;
        const x = 40 + Math.random() * (W - 80);
        g.enemyBullets.push(new Bullet({
          x, y: -15, angle: Math.PI / 2, speed: 1.3, kind: 'bullet.god_tear', r: 6,
        }));
        const e = spawnWisp(g, x, -40);
        e.move = (en, d) => { en.y += 1.4 * 60 * d; };
      }
    }

    if (this.t >= 72 && !this.done.w5) {
      this.done.w5 = true;
      for (let i = 0; i < 4; i++) {
        const e = spawnOrb(g, 80 + i * 70, -20);
        e.move = (en, d) => { en.y += 0.95 * 60 * d; };
        e.onDeath = function (game) {
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2;
            const b = new Bullet({
              x: this.x, y: this.y, vx: 0, vy: 0, kind: 'bullet.feast_lantern', r: 5, life: 4,
            });
            b._orbA = a; b._orbR = 40; b._cx = this.x; b._cy = this.y;
            b.custom = (bb, d) => {
              bb._orbA += deg(40) * d;
              bb.x = bb._cx + Math.cos(bb._orbA) * bb._orbR;
              bb.y = bb._cy + Math.sin(bb._orbA) * bb._orbR;
              bb._orbR += 25 * d;
            };
            game.enemyBullets.push(b);
          }
        };
      }
    }

    if (this.t >= 90 && !this.done.w6) {
      this.done.w6 = true;
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 * i) / 10;
        const e = spawnWisp(g, W / 2 + Math.cos(a) * 130, H * 0.2 + Math.sin(a) * 40);
        e._a = a;
        e.move = (en, d) => {
          en._a += d * 0.55;
          const rad = Math.max(28, 130 - en.age * 22);
          en.x = W / 2 + Math.cos(en._a) * rad;
          en.y = H * 0.22 + Math.sin(en._a) * rad * 0.35;
        };
        e.fireCd = 0.5;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.4;
          emitRing(game.enemyBullets, en.x, en.y, 8, 1.8, 'bullet.chrono_shard', en._a);
        };
      }
      for (let i = 0; i < 4; i++) {
        const e = spawnOrb(g, 70 + i * 75, -25);
        e.move = (en, d) => { en.y += 1.05 * 60 * d; };
        e.onDeath = function (game) {
          emitRing(game.enemyBullets, this.x, this.y, 8, 1.6, 'bullet.amber_seal');
        };
      }
    }

    if (this.t >= 105 && !this.done.boss) {
      if (g.enemies.length === 0 || this.t >= 115) {
        this.done.boss = true;
        this.phase = 'boss';
        g.enemies.length = 0;
        g.startBoss6();
      }
    }
  }
}

class BossKuon {
  constructor() {
    this.x = W / 2; this.y = -40; this.targetY = H * 0.18;
    this.hp = 1800; this.maxHp = 1800; this.r = 34; this.alive = true;
    this.phase = 'enter'; this.age = 0; this.phaseAge = 0; this.moveT = 0;
    this.w = 72; this.h = 86; this.invuln = true;
    this.name = '天香 久远'; this.spellName = ''; this.timeLimit = 0;
    this.tables = []; // feast islands
    this.duskAng = 0; this.duskWarn = 0;
    this.freezeFlash = 0;
    this.lastPhase = 'flow'; // flow | warn | freeze | shatter
    this.lastT = 0;
    this.tearWarns = [];
  }
  setPhase(p, hp, limit) {
    this.phase = p; this.phaseAge = 0;
    this.hp = hp; this.maxHp = hp; this.timeLimit = limit || 0;
    this.invuln = (p === 'enter' || p === 'dialog' || p === 'spell_declare');
    this.tables = []; this.duskWarn = 0; this.freezeFlash = 0;
    this.lastPhase = 'flow'; this.lastT = 0; this.tearWarns = [];
    if (p === 'p7_last') {
      this.x = W / 2; this.y = H * 0.2;
    }
  }
  update(dt, game) {
    this.age += dt; this.phaseAge += dt; this.moveT += dt;
    if (this.freezeFlash > 0) this.freezeFlash -= dt;
    if (this.phase === 'enter') {
      this.y += (this.targetY - this.y) * Math.min(1, 3 * dt);
      if (Math.abs(this.y - this.targetY) < 2) {
        this.y = this.targetY;
        game.startDialog6();
      }
      return;
    }
    if (this.phase === 'dialog' || this.phase === 'spell_declare') return;

    if (this.phase === 'p1_nonspell') {
      this.x = W / 2 + Math.sin(this.moveT / 3.5 * Math.PI * 2) * (W * 0.28);
      this.y = H * 0.18; this.ns1(dt, game);
    } else if (this.phase === 'p2_spell1') {
      this.x = W / 2 + Math.sin(this.moveT * 0.4) * 40;
      this.y = H * 0.16; this.sp1(dt, game);
    } else if (this.phase === 'p3_nonspell2') {
      this.x = W / 2 + Math.sin(this.moveT / 3 * Math.PI * 2) * (W * 0.25);
      this.y = H * 0.18; this.ns2(dt, game);
    } else if (this.phase === 'p4_spell2') {
      this.sp2(dt, game);
    } else if (this.phase === 'p5_spell3') {
      this.sp3(dt, game);
    } else if (this.phase === 'p6_spell4') {
      this.x = W / 2 + Math.sin(this.moveT * 0.45) * 50;
      this.y = H * 0.17; this.sp4(dt, game);
    } else if (this.phase === 'p7_last') {
      const a = this.moveT * 0.35;
      this.x = W / 2 + Math.cos(a) * 35;
      this.y = H * 0.2 + Math.sin(a) * 12;
      this.last(dt, game);
    }
    if (this.timeLimit > 0 && this.phaseAge >= this.timeLimit) game.onBoss6Timeout();
  }
  ns1(dt, game) {
    if (!this._a) this._a = { fan: 0, tear: 0 };
    this._a.fan += dt; this._a.tear += dt;
    if (this._a.fan >= 1.0) {
      this._a.fan = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 5, 12, 2.0, 'bullet.chrono_shard');
    }
    if (this._a.tear >= 3.2) {
      this._a.tear = 0;
      [-1, 1].forEach((s) => {
        const b = new Bullet({
          x: this.x + s * 50, y: this.y - 10, angle: Math.PI / 2, speed: 1.6, kind: 'bullet.god_tear', r: 6, life: 2.5,
        });
        b.custom = (bb, d, g) => {
          if (bb.y > H * 0.55 && !bb._split) {
            bb._split = true; bb.alive = false;
            emitFan(g.enemyBullets, bb.x, bb.y, Math.PI / 2, 4, 35, 2.0, 'bullet.chrono_shard');
          }
        };
        game.enemyBullets.push(b);
      });
    }
  }
  sp1(dt, game) {
    if (!this._s1) this._s1 = { drop: 0, aim: 0 };
    this._s1.drop += dt; this._s1.aim += dt;
    for (const w of this.tearWarns) w.age += dt;
    this.tearWarns = this.tearWarns.filter(w => w.age < 0.5);
    if (this._s1.drop >= 2.2) {
      this._s1.drop = 0;
      const n = Math.random() < 0.5 ? 1 : 2;
      for (let i = 0; i < n; i++) {
        const x = 50 + Math.random() * (W - 100);
        const b = new Bullet({
          x, y: -20, angle: Math.PI / 2, speed: 1.5, kind: 'bullet.god_tear', r: 7,
        });
        b.custom = (bb, d, g) => {
          if (bb.y >= H * 0.62 && !bb._landed) {
            bb._landed = true; bb.alive = false;
            emitRing(g.enemyBullets, bb.x, bb.y, 8, 1.4, 'bullet.amber_seal');
            emitRing(g.enemyBullets, bb.x, bb.y, 12, 2.2, 'bullet.chrono_shard');
          }
        };
        this.tearWarns.push({ x, y: H * 0.62, age: -0.8 });
        game.enemyBullets.push(b);
      }
    }
    if (this._s1.aim >= 2.5) {
      this._s1.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      game.enemyBullets.push(new Bullet({
        x: this.x, y: this.y, angle: a, speed: 2.0, kind: 'bullet.god_tear', r: 6,
      }));
    }
  }
  ns2(dt, game) {
    if (!this._n2) this._n2 = { beat: 0 };
    this._n2.beat += dt;
    if (this._n2.beat >= 1.5) {
      this._n2.beat = 0;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + this.moveT;
        const b = new Bullet({
          x: this.x, y: this.y, vx: 0, vy: 0, kind: 'bullet.feast_lantern', r: 5, life: 3.5,
        });
        b._a = a; b._r = 30; b._cx = this.x; b._cy = this.y;
        b.custom = (bb, d) => {
          bb._a += deg(50) * d;
          bb._r += 40 * d;
          bb.x = bb._cx + Math.cos(bb._a) * bb._r;
          bb.y = bb._cy + Math.sin(bb._a) * bb._r;
        };
        game.enemyBullets.push(b);
      }
    }
  }
  sp2(dt, game) {
    // 宴席三桌
    if (!this._s2) {
      this._s2 = { cycle: 0, ray: 0, blink: 0 };
      const R = 90;
      this.tables = [
        { x: W / 2, y: H * 0.42, rx: 48, ry: 28, on: true, warn: 0 },
        { x: W / 2 - R, y: H * 0.58, rx: 48, ry: 28, on: true, warn: 0 },
        { x: W / 2 + R, y: H * 0.58, rx: 48, ry: 28, on: true, warn: 0 },
      ];
      this._extIdx = 0;
    }
    this._s2.cycle += dt; this._s2.ray += dt; this._s2.blink += dt;
    for (const t of this.tables) {
      if (t.warn > 0) {
        t.warn -= dt;
        if (t.warn <= 0 && t.on && t._pendingOff) {
          t.on = false;
          t._pendingOff = false;
          emitRing(game.enemyBullets, t.x, t.y, 10, 2.0, 'bullet.feast_lantern');
        }
      }
    }
    if (this._s2.cycle >= 3.5) {
      this._s2.cycle = 0;
      for (const t of this.tables) { t.on = true; t._pendingOff = false; t.warn = 0; }
      const idx = this._extIdx % this.tables.length;
      this._extIdx++;
      // 0.4s 红预警，仍在桌上；预警结束才熄灭爆环
      this.tables[idx].warn = 0.55;
      this.tables[idx]._pendingOff = true;
    }
    if (this._s2.ray >= 0.4) {
      this._s2.ray = 0;
      const a = this.moveT * 0.7;
      game.enemyBullets.push(new Bullet({
        x: W / 2 + Math.cos(a) * 160, y: H * 0.5 + Math.sin(a) * 100,
        angle: a + Math.PI / 2, speed: 1.2, kind: 'bullet.dusk_ray', r: 4,
      }));
    }
    if (this._s2.blink >= 4.0) {
      this._s2.blink = 0;
      const t = this.tables[Math.floor(Math.random() * this.tables.length)];
      this.x = t.x; this.y = Math.min(H * 0.35, t.y - 40);
    }
  }
  sp3(dt, game) {
    // 黄昏扇区
    if (!this._s3) {
      this._s3 = { rot: 0, rain: 0, aim: 0 };
      this.duskAng = 0;
    }
    this._s3.rot += dt; this._s3.rain += dt; this._s3.aim += dt;
    if (this.duskWarn > 0) this.duskWarn -= dt;
    if (this._s3.rot >= 5.0) {
      this._s3.rot = 0;
      this.duskWarn = 0.75;
      game.queueEcho(0.6, () => {
        if (game.boss === this && this.phase === 'p5_spell3') this.duskAng += deg(45);
      });
    }
    // dense rays in forbidden sector
    if (this._s3.rain >= 0.2) {
      this._s3.rain = 0;
      const span = deg(90);
      const a0 = this.duskAng;
      // forbidden
      const fa = a0 + Math.random() * span;
      const rr = 40 + Math.random() * 180;
      game.enemyBullets.push(new Bullet({
        x: W / 2 + Math.cos(fa) * rr, y: H * 0.45 + Math.sin(fa) * rr * 0.7,
        angle: fa, speed: 1.5, kind: 'bullet.dusk_ray', r: 4,
      }));
      // safe sector slow shards
      const sa = a0 + span + Math.random() * (Math.PI * 2 - span);
      game.enemyBullets.push(new Bullet({
        x: 30 + Math.random() * (W - 60), y: -8, angle: Math.PI / 2, speed: 1.1, kind: 'bullet.chrono_shard', r: 4,
      }));
    }
    // boss on edge
    this.x = W / 2 + Math.cos(this.duskAng) * 70;
    this.y = H * 0.2 + Math.sin(this.duskAng) * 20;
    if (this._s3.aim >= 2.0) {
      this._s3.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 11, 2.2, 'bullet.chrono_shard');
    }
  }
  sp4(dt, game) {
    if (!this._s4) this._s4 = { pulse: 0, tear: 0 };
    this._s4.pulse += dt; this._s4.tear += dt;
    if (this.freezeFlash > 0) { /* visual */ }
    if (this._s4.pulse >= 4.0) {
      this._s4.pulse = 0;
      this.freezeFlash = 0.3;
      // seals on grid + player
      for (let gx = 0; gx < 4; gx++) {
        for (let gy = 0; gy < 5; gy++) {
          if (Math.random() < 0.45) continue;
          const x = 50 + gx * 90 + (gy % 2) * 20;
          const y = 80 + gy * 60;
          game.enemyBullets.push(new Bullet({
            x, y, vx: 0, vy: 0, kind: 'bullet.amber_seal', r: 5, life: 2.0,
          }));
          game.queueEcho(2.0, () => {
            emitFan(game.enemyBullets, x, y, Math.random() * Math.PI * 2, 3, 40, 2.0, 'bullet.chrono_shard');
          });
        }
      }
      game.enemyBullets.push(new Bullet({
        x: game.player.x, y: game.player.y, vx: 0, vy: 0, kind: 'bullet.amber_seal', r: 6, life: 2.0,
      }));
    }
    if (this._s4.tear >= 3.0) {
      this._s4.tear = 0;
      emitRing(game.enemyBullets, this.x, this.y, 6, 1.5, 'bullet.god_tear');
    }
  }
  last(dt, game) {
    // T≈4.7: flow 2.2 / warn 0.5 / freeze 1.2 / shatter 0.8
    if (!this._L) this._L = { fire: 0 };
    this.lastT += dt;
    const T = { flow: 2.2, warn: 0.5, freeze: 1.2, shatter: 0.8 };
    const order = ['flow', 'warn', 'freeze', 'shatter'];
    const dur = T[this.lastPhase];
    if (this.lastT >= dur) {
      this.lastT = 0;
      const i = order.indexOf(this.lastPhase);
      const next = order[(i + 1) % order.length];
      if (this.lastPhase === 'warn' && next === 'freeze') {
        // freeze all hostile
        for (const b of game.enemyBullets) {
          if (!b.hostile || !b.alive) continue;
          b._fvx = b.vx; b._fvy = b.vy;
          b.vx = 0; b.vy = 0;
          b._frozen = true;
        }
        this.invuln = true;
        this.freezeFlash = 0.4;
      }
      if (this.lastPhase === 'freeze' && next === 'shatter') {
        for (const b of game.enemyBullets) {
          if (!b._frozen) continue;
          b._frozen = false;
          const sp = 2.6;
          if (b._fvx != null || b._fvy != null) {
            const ang = Math.atan2(b._fvy || 0, b._fvx || 0.01);
            b.vx = Math.cos(ang) * sp;
            b.vy = Math.sin(ang) * sp;
          } else {
            const ang = angTo(this.x, this.y, b.x, b.y);
            b.vx = Math.cos(ang) * sp;
            b.vy = Math.sin(ang) * sp;
          }
          b.kind = 'bullet.chrono_shard';
        }
        this.invuln = false;
      }
      if (next === 'flow') {
        this.invuln = false;
      }
      this.lastPhase = next;
    }

    if (this.lastPhase === 'warn') {
      // decelerate
      for (const b of game.enemyBullets) {
        if (!b.hostile || !b.alive) continue;
        b.vx *= 0.92; b.vy *= 0.92;
      }
    }

    if (this.lastPhase === 'flow') {
      this._L.fire += dt;
      if (this._L.fire >= 0.45) {
        this._L.fire = 0;
        emitRing(game.enemyBullets, this.x, this.y, 10, 1.6, 'bullet.chrono_shard', this.moveT);
        const a = angTo(this.x, this.y, game.player.x, game.player.y);
        game.enemyBullets.push(new Bullet({
          x: this.x, y: this.y, angle: a, speed: 1.8, kind: 'bullet.amber_seal', r: 5,
        }));
        if (Math.random() < 0.35) {
          game.enemyBullets.push(new Bullet({
            x: this.x, y: this.y, angle: a, speed: 1.7, kind: 'bullet.god_tear', r: 6,
          }));
        }
      }
    }
  }
  hurt(dmg) {
    if (this.invuln) return false;
    // last freeze: super armor already via invuln
    this.hp -= dmg;
    if (this.hp <= 0) { this.hp = 0; return true; }
    return false;
  }
  draw(ctx) {
    let key = 'boss.kuon';
    if (this.phase === 'p7_last' || this.phase === 'spell_declare' && this.spellName.includes('永恒')) key = 'boss.kuon_last';
    else if (/^(p2|p4|p5|p6)/.test(this.phase) || this.phase === 'spell_declare') key = 'boss.kuon_spell';
    drawSprite(ctx, key, this.x, this.y, this.w, this.h);

    // tear warns
    for (const w of this.tearWarns) {
      if (w.age < 0) {
        ctx.strokeStyle = 'rgba(242,193,78,0.55)';
        ctx.beginPath(); ctx.arc(w.x, w.y, 28, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // feast tables
    for (const t of this.tables) {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(1, t.ry / t.rx);
      if (t.warn > 0) {
        ctx.fillStyle = 'rgba(200,40,40,0.35)';
        ctx.strokeStyle = 'rgba(255,80,80,0.9)';
      } else if (t.on) {
        ctx.fillStyle = 'rgba(242,193,78,0.18)';
        ctx.strokeStyle = 'rgba(242,193,78,0.75)';
      } else {
        ctx.fillStyle = 'rgba(40,20,40,0.1)';
        ctx.strokeStyle = 'rgba(100,80,100,0.3)';
      }
      ctx.beginPath(); ctx.arc(0, 0, t.rx, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // dusk sector
    if (this.phase === 'p5_spell3') {
      const span = deg(90);
      const a0 = this.duskAng;
      ctx.fillStyle = this.duskWarn > 0 ? 'rgba(230,50,70,0.42)' : 'rgba(107,76,122,0.28)';
      ctx.beginPath();
      ctx.moveTo(W / 2, H * 0.45);
      ctx.arc(W / 2, H * 0.45, 220, a0, a0 + span);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(242,193,78,0.5)';
      ctx.stroke();
    }

    // freeze overlay
    if (this.freezeFlash > 0 || (this.phase === 'p7_last' && (this.lastPhase === 'freeze' || this.lastPhase === 'warn'))) {
      ctx.fillStyle = `rgba(232,184,74,${this.lastPhase === 'freeze' ? 0.28 : 0.16})`;
      ctx.fillRect(0, 0, W, H);
      if (this.lastPhase === 'freeze') {
        ctx.strokeStyle = 'rgba(232,184,74,0.7)';
        ctx.lineWidth = 3;
        ctx.strokeRect(8, 8, W - 16, H - 16);
      }
    }
  }
}
