function skipWarnDur() {
  try {
    return new URLSearchParams(location.search).get('simple') === '1' ? 0.65 : 0.5;
  } catch (e) { return 0.5; }
}

/* Extra — 吞噬光阴的琥珀逆贼 · 琥珀中Boss + 天逆烛 */
const DIALOG_EX_PRE = [
  { who: '烛', text: '日历？那不过是我牙缝里的残渣。' },
  { who: '灵梦', text: '少说谜语。把偷走的时间吐出来。' },
  { who: '魔理沙', text: '灵梦那边信号断断续续……地下居然还有龙？' },
];
const DIALOG_EX_POST = [
  { who: '烛', text: '……三口还不够吗……' },
  { who: '灵梦', text: '够了。回去睡觉吧，虫子。' },
];

function spawnGnaw(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 90, kind: 'enemy.crystal_gnaw', w: 30, h: 26, r: 12, score: 800,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}
function spawnFang(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 110, kind: 'enemy.chrono_fang', w: 30, h: 30, r: 13, score: 1000,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}

function pushPlayerHist(game) {
  if (!game.playerHistory) game.playerHistory = [];
  game.playerHistory.push({ x: game.player.x, y: game.player.y, t: performance.now() });
  if (game.playerHistory.length > 90) game.playerHistory.shift();
}
function histAgo(game, sec) {
  const hist = game.playerHistory || [];
  if (!hist.length) return { x: game.player.x, y: game.player.y };
  // ~60fps ≈ 1 frame per 1/60s; use index approx
  const frames = Math.max(1, Math.floor(sec * 60));
  const idx = Math.max(0, hist.length - 1 - frames);
  return hist[idx];
}

class StageExDirector {
  constructor(game) {
    this.g = game; this.t = 0; this.done = {}; this.phase = 'mid';
  }
  reset() { this.t = 0; this.done = {}; this.phase = 'mid'; }
  update(dt) {
    if (this.phase !== 'mid' && !(this.done.postStart && this.phase === 'mid')) {
      // allow post-mid while phase stays 'mid' like stage4
    }
    if (this.phase === 'boss') return;
    this.t += dt;
    const g = this.g;

    if (!this.done.postStart) {
      // x0 ambience 0–6: prism particles via game particles already
      if (this.t >= 6 && !this.done.x1) {
        this.done.x1 = true;
        for (let i = 0; i < 8; i++) {
          const e = spawnGnaw(g, 40 + i * 42, -20 - (i % 3) * 14);
          e.move = (en, d) => {
            en.y += 1.25 * 60 * d;
            en.x += Math.sin(en.age * 2 + i) * 30 * d;
          };
          e.fireCd = 0.4 + i * 0.05;
          e.shoot = function (en, d, game) {
            en.fireCd -= d;
            if (en.fireCd > 0 || en.y < 40) return;
            en.fireCd = 1.05;
            const a = angTo(en.x, en.y, game.player.x, game.player.y);
            game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: a, speed: 2.0, kind: 'bullet.gnaw_tooth', r: 4 }));
          };
          e.onDeath = function (game) {
            emitRing(game.enemyBullets, this.x, this.y, 6, 1.7, 'bullet.gnaw_tooth');
          };
        }
      }
      if (this.t >= 20 && !this.done.x2) {
        this.done.x2 = true;
        for (let i = 0; i < 6; i++) {
          const side = i % 2;
          const e = spawnFang(g, side ? 30 : W - 30, -25 - i * 16);
          e._side = side;
          e.move = (en, d) => {
            if (en.age < 0.6) { en.y += 2.2 * 60 * d; return; }
            if (!en._lunged) {
              en._lunged = true;
              const a = angTo(en.x, en.y, g.player.x, g.player.y);
              en._lvx = Math.cos(a) * 2.8; en._lvy = Math.sin(a) * 2.8;
            }
            if (en.age < 1.1) {
              en.x += en._lvx * 60 * d; en.y += en._lvy * 60 * d;
            } else {
              en.y += 0.9 * 60 * d;
            }
          };
          e.fireCd = 0.8;
          e.shoot = function (en, d, game) {
            en.fireCd -= d;
            if (en.fireCd > 0 || en.age < 1.1) return;
            en.fireCd = 1.2;
            const a = angTo(en.x, en.y, game.player.x, game.player.y);
            emitFan(game.enemyBullets, en.x, en.y, a, 3, 18, 1.9, 'bullet.inverse_scale');
          };
        }
      }
      if (this.t >= 36 && !this.done.x3) {
        this.done.x3 = true;
        for (let i = 0; i < 4; i++) {
          const e = spawnGnaw(g, 50 + i * 80, -20);
          e.move = (en, d) => { en.y += 1.15 * 60 * d; };
          e.shoot = aimFanShoot(1, 0, 2.0, 'bullet.gnaw_tooth', 0.9);
          e.onDeath = function (game) {
            emitRing(game.enemyBullets, this.x, this.y, 6, 1.6, 'bullet.gnaw_tooth');
          };
        }
        for (let i = 0; i < 4; i++) {
          const e = spawnFang(g, 70 + i * 70, -35);
          e.move = (en, d) => { en.y += 1.35 * 60 * d; };
          e.shoot = aimFanShoot(3, 14, 1.8, 'bullet.inverse_scale', 1.0);
        }
      }
      if (this.t >= 52 && !this.done.x4) {
        this.done.x4 = true;
        for (let i = 0; i < 10; i++) {
          const a = (Math.PI * 2 * i) / 10;
          const e = spawnGnaw(g, W / 2 + Math.cos(a) * 140, H * 0.2 + Math.sin(a) * 45);
          e._a = a;
          e.move = (en, d) => {
            en._a += d * 0.6;
            const rad = Math.max(30, 140 - en.age * 24);
            en.x = W / 2 + Math.cos(en._a) * rad;
            en.y = H * 0.22 + Math.sin(en._a) * rad * 0.35;
          };
          e.fireCd = 0.5;
          e.shoot = function (en, d, game) {
            en.fireCd -= d;
            if (en.fireCd > 0) return;
            en.fireCd = 1.3;
            emitRing(game.enemyBullets, en.x, en.y, 6, 1.7, 'bullet.gnaw_tooth', en._a);
          };
        }
      }
      if (this.t >= 70 && !this.done.mid) {
        if (g.enemies.length === 0 || this.t >= 78) {
          this.done.mid = true;
          g.enemies.length = 0;
          g.enemyBullets = [];
          g.startMidEx();
        }
      }
    }

    // post-mid tooth rain ~25s → shoku
    if (this.done.postStart && this.phase === 'mid') {
      this._pt = (this._pt || 0) + dt;
      if (this._pt >= 0.5 && !this.done.rain) {
        this.done.rain = true;
        this._rainCd = 0;
      }
      if (this.done.rain && this._pt < 22) {
        this._rainCd = (this._rainCd || 0) - dt;
        if (this._rainCd <= 0) {
          this._rainCd = 0.22;
          g.enemyBullets.push(new Bullet({
            x: 20 + Math.random() * (W - 40), y: -10,
            angle: Math.PI / 2, speed: 1.4 + Math.random() * 0.5,
            kind: 'bullet.gnaw_tooth', r: 4,
          }));
        }
      }
      if (this._pt >= 8 && !this.done.px1) {
        this.done.px1 = true;
        for (let i = 0; i < 5; i++) {
          const e = spawnGnaw(g, 50 + i * 70, -20);
          e.move = (en, d) => { en.y += 1.3 * 60 * d; };
          e.shoot = aimFanShoot(1, 0, 2.0, 'bullet.gnaw_tooth', 0.95);
        }
      }
      if (this._pt >= 16 && !this.done.px2) {
        this.done.px2 = true;
        for (let i = 0; i < 4; i++) {
          const e = spawnFang(g, 60 + i * 80, -25);
          e.move = (en, d) => { en.y += 1.2 * 60 * d; };
          e.shoot = aimFanShoot(3, 12, 1.9, 'bullet.inverse_scale', 1.0);
        }
      }
      if (this._pt >= 25 && !this.done.boss) {
        if (g.enemies.length === 0 || this._pt >= 30) {
          this.done.boss = true;
          this.phase = 'boss';
          g.enemies.length = 0;
          g.enemyBullets = [];
          g.startBossEx();
        }
      }
    }
  }
  beginPostMid() {
    this.done.postStart = true;
    this._pt = 0;
  }
}

/** 道中 Boss：久远寺琥珀（Ex） */
class MidKohakuEx {
  constructor() {
    this.x = W / 2; this.y = -40; this.targetY = H * 0.2;
    this.hp = 1000; this.maxHp = 1000; this.r = 32; this.alive = true;
    this.phase = 'enter'; this.age = 0; this.phaseAge = 0; this.moveT = 0;
    this.w = 70; this.h = 82; this.invuln = true;
    this.name = '久远寺 琥珀'; this.spellName = ''; this.timeLimit = 0;
    this.captureBoxes = [];
    this.isMid = true;
  }
  setPhase(p, hp, limit) {
    this.phase = p; this.phaseAge = 0;
    this.hp = hp; this.maxHp = hp; this.timeLimit = limit || 0;
    this.invuln = (p === 'enter' || p === 'dialog' || p === 'spell_declare');
    this.captureBoxes = [];
  }
  update(dt, game) {
    this.age += dt; this.phaseAge += dt; this.moveT += dt;
    pushPlayerHist(game);
    if (this.phase === 'enter') {
      this.y += (this.targetY - this.y) * Math.min(1, 3 * dt);
      if (Math.abs(this.y - this.targetY) < 2) {
        this.y = this.targetY;
        // skip mid dialog — straight into NS
        game.state = STATE.PLAY;
        this.setPhase('m1_nonspell', 1000, 30);
        this.invuln = false;
        game.toast('Mid Boss · 琥珀');
      }
      return;
    }
    if (this.phase === 'dialog' || this.phase === 'spell_declare') return;

    if (this.phase === 'm1_nonspell') {
      this.x = W / 2 + Math.sin(this.moveT / 2.8 * Math.PI * 2) * (W * 0.3);
      this.y = H * 0.2;
      this.ns(dt, game);
    } else if (this.phase === 'm2_spell') {
      this.x = W / 2 + Math.sin(this.moveT * 0.5) * 45;
      this.y = H * 0.18;
      this.sp(dt, game);
    }
    if (this.timeLimit > 0 && this.phaseAge >= this.timeLimit) game.onMidExTimeout();
  }
  ns(dt, game) {
    if (!this._a) this._a = { arc: 0, aim: 0, side: 0 };
    this._a.arc += dt; this._a.aim += dt;
    if (this._a.arc >= 0.85) {
      this._a.arc = 0;
      this._a.side = 1 - this._a.side;
      const base = this._a.side ? -0.55 : Math.PI + 0.55;
      const ox = this.x + (this._a.side ? -20 : 20);
      const oy = this.y + 10;
      for (let i = 0; i < 5; i++) {
        const a = base + (i - 2) * deg(12);
        game.enemyBullets.push(new Bullet({
          x: ox, y: oy, angle: a, speed: 2.15, kind: 'bullet.scythe_arc', r: 5,
        }));
      }
      // shadow residual 0.4s later, darker
      const sx = ox, sy = oy, sbase = base;
      game.queueEcho(0.4, () => {
        for (let i = 0; i < 5; i++) {
          const a = sbase + (i - 2) * deg(12);
          game.enemyBullets.push(new Bullet({
            x: sx, y: sy, angle: a, speed: 2.0, kind: 'bullet.scythe_arc', r: 5, alpha: 0.45,
          }));
        }
      });
    }
    if (this._a.aim >= 2.8) {
      this._a.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 12, 2.2, 'bullet.petal_slash');
    }
  }
  sp(dt, game) {
    // 鬼剪「连同影子一起裁断」
    if (!this._s) this._s = { cap: 0, rain: 0 };
    this._s.cap += dt; this._s.rain += dt;
    for (const b of this.captureBoxes) b.age += dt;
    const fire = this.captureBoxes.filter(b => !b.fired && b.age >= 0.45);
    for (const b of fire) {
      b.fired = true;
      emitRing(game.enemyBullets, b.x, b.y, 12, 2.0, 'bullet.scythe_arc');
      // shear on shadow pos (0.35s ago)
      const sh = histAgo(game, 0.35);
      game.enemyBullets.push(new Bullet({
        x: sh.x - 40, y: sh.y, angle: 0, speed: 2.4, kind: 'bullet.silver_shear', r: 5,
      }));
      game.enemyBullets.push(new Bullet({
        x: sh.x + 40, y: sh.y, angle: Math.PI, speed: 2.4, kind: 'bullet.silver_shear', r: 5,
      }));
    }
    this.captureBoxes = this.captureBoxes.filter(b => b.age < 0.75);

    if (this._s.cap >= 2.5) {
      this._s.cap = 0;
      const h = histAgo(game, 0.25);
      this.captureBoxes.push({ x: h.x, y: h.y, age: 0, fired: false, s: 50 });
    }
    if (this._s.rain >= 0.32) {
      this._s.rain = 0;
      game.enemyBullets.push(new Bullet({
        x: 20 + Math.random() * (W - 40), y: -8, angle: Math.PI / 2, speed: 1.15, kind: 'bullet.petal_slash', r: 4,
      }));
    }
  }
  hurt(dmg) {
    if (this.invuln) return false;
    this.hp -= dmg;
    if (this.hp <= 0) { this.hp = 0; return true; }
    return false;
  }
  draw(ctx) {
    const spell = this.phase === 'm2_spell' || this.phase === 'spell_declare';
    ctx.save();
    if (!spell) { ctx.filter = 'hue-rotate(40deg) saturate(1.2)'; }
    drawSprite(ctx, spell ? 'boss.kohaku_spell' : 'boss.kohaku', this.x, this.y, this.w, this.h);
    ctx.restore();
    for (const b of this.captureBoxes) {
      const a = Math.min(1, b.age / 0.45);
      const s = b.s * (1.3 - a * 0.3);
      ctx.strokeStyle = `rgba(176,48,48,${0.4 + a * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - s);
      ctx.lineTo(b.x + s, b.y);
      ctx.lineTo(b.x, b.y + s);
      ctx.lineTo(b.x - s, b.y);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

/** Ex Boss：天逆 烛 */
class BossShoku {
  constructor() {
    this.x = W / 2; this.y = -40; this.targetY = H * 0.18;
    this.hp = 2000; this.maxHp = 2000; this.r = 36; this.alive = true;
    this.phase = 'enter'; this.age = 0; this.phaseAge = 0; this.moveT = 0;
    this.w = 72; this.h = 88; this.invuln = true;
    this.name = '天逆 烛'; this.spellName = ''; this.timeLimit = 0;
    this.skipWarns = [];
    this.safeRect = null;
    this.breathWarn = 0; this.breathHeat = null;
    this.gravSign = 1; this.gravFlash = 0;
    this.corridorX = W / 2; this.corridorDir = 1;
    this.biteWindows = [];
    this.lastPhase = 'flow'; this.lastT = 0;
    this.jawGap = 80;
  }
  setPhase(p, hp, limit) {
    this.phase = p; this.phaseAge = 0;
    this.hp = hp; this.maxHp = hp; this.timeLimit = limit || 0;
    this.invuln = (p === 'enter' || p === 'dialog' || p === 'spell_declare');
    this.skipWarns = []; this.safeRect = null;
    this.breathWarn = 0; this.breathHeat = null;
    this.gravSign = 1; this.gravFlash = 0;
    this.biteWindows = [];
    this.lastPhase = 'flow'; this.lastT = 0;
    this._e = null;
    if (p === 'e10') { this.x = W / 2; this.y = H * 0.2; }
  }
  update(dt, game) {
    this.age += dt; this.phaseAge += dt; this.moveT += dt;
    pushPlayerHist(game);
    if (this.gravFlash > 0) this.gravFlash -= dt;
    if (this.phase === 'enter') {
      this.y += (this.targetY - this.y) * Math.min(1, 3 * dt);
      if (Math.abs(this.y - this.targetY) < 2) {
        this.y = this.targetY;
        game.startDialogEx();
      }
      return;
    }
    if (this.phase === 'dialog' || this.phase === 'spell_declare') return;

    // mild sway for most phases
    if (this.phase !== 'e10' && this.phase !== 'e8') {
      this.x = W / 2 + Math.sin(this.moveT / 3.2 * Math.PI * 2) * (W * 0.22);
      this.y = H * (0.10 + 0.08); // ~10%–18% band top
      this.y = Math.max(H * 0.10, Math.min(H * 0.36, this.y));
    }

    const fn = {
      e1: 'e1', e2: 'e2', e3: 'e3', e4: 'e4', e5: 'e5',
      e6: 'e6', e7: 'e7', e8: 'e8', e9: 'e9', e10: 'e10',
    }[this.phase];
    if (fn && this[fn]) this[fn](dt, game);

    if (this.timeLimit > 0 && this.phaseAge >= this.timeLimit) game.onBossExTimeout();
  }

  // —— e1 牙符：上下颚扫齿 ——
  e1(dt, game) {
    if (!this._e) this._e = { sweep: 0, bite: 0, side: 0 };
    this._e.sweep += dt; this._e.bite += dt;
    this.jawGap = 70 + Math.sin(this.moveT * 2.2) * 35;
    if (this._e.sweep >= 0.18) {
      this._e.sweep = 0;
      const t = (this.moveT * 0.7) % 1;
      const x = 20 + t * (W - 40);
      // top jaw down
      game.enemyBullets.push(new Bullet({
        x, y: 20, angle: Math.PI / 2, speed: 1.6, kind: 'bullet.gnaw_tooth', r: 4,
      }));
      // bottom jaw up
      game.enemyBullets.push(new Bullet({
        x: W - x, y: H - 20, angle: -Math.PI / 2, speed: 1.6, kind: 'bullet.gnaw_tooth', r: 4,
      }));
    }
    if (this._e.bite >= 2.5) {
      this._e.bite = 0;
      emitRing(game.enemyBullets, W / 2, H * 0.45, 14, 2.0, 'bullet.gnaw_tooth');
    }
  }

  // —— e2 省略箭 ——
  e2(dt, game) {
    if (!this._e) this._e = { wave: 0.4, rain: 0 };
    this._e.wave += dt; this._e.rain += dt;
    for (const w of this.skipWarns) w.age += dt;
    const warnT = skipWarnDur();
    const ready = this.skipWarns.filter(w => !w.fired && w.age >= warnT);
    for (const w of ready) {
      w.fired = true;
      const away = angTo(game.player.x, game.player.y, w.x, w.y) + (Math.random() - 0.5) * 0.4;
      game.enemyBullets.push(new Bullet({
        x: w.x, y: w.y, angle: away, speed: 1.2 + Math.random() * 0.6,
        kind: 'bullet.skip_arrow', r: 5, life: 1.8,
      }));
    }
    this.skipWarns = this.skipWarns.filter(w => w.age < warnT + 0.2);

    if (this._e.wave >= 1.8) {
      this._e.wave = 0;
      const px = game.player.x, py = game.player.y;
      const r = 70 + Math.random() * 20;
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 + Math.random() * 0.3;
        this.skipWarns.push({
          x: px + Math.cos(a) * r,
          y: py + Math.sin(a) * r * 0.85,
          age: 0, fired: false,
        });
      }
    }
    if (this._e.rain >= 0.4) {
      this._e.rain = 0;
      game.enemyBullets.push(new Bullet({
        x: 20 + Math.random() * (W - 40), y: -8,
        angle: Math.PI / 2, speed: 0.9, kind: 'bullet.inverse_scale', r: 4,
      }));
    }
  }

  // —— e3 龙息 ——
  e3(dt, game) {
    if (!this._e) this._e = { cycle: 0, dir: 1, tooth: 0, state: 'idle' };
    this._e.cycle += dt; this._e.tooth += dt;
    if (this.breathWarn > 0) this.breathWarn -= dt;
    if (this.breathHeat) {
      this.breathHeat.age += dt;
      if (this.breathHeat.age >= 0.8) this.breathHeat = null;
      else if (this._e.crumb == null) this._e.crumb = 0;
      if (this.breathHeat) {
        this._e.crumb = (this._e.crumb || 0) + dt;
        if (this._e.crumb >= 0.12) {
          this._e.crumb = 0;
          const h = this.breathHeat;
          game.enemyBullets.push(new Bullet({
            x: h.x + (Math.random() - 0.5) * h.w,
            y: h.y + (Math.random() - 0.5) * 20,
            angle: Math.PI / 2, speed: 0.6, kind: 'bullet.white_breath', r: 3, life: 0.9, alpha: 0.6,
          }));
        }
      }
    }
    if (this._e.state === 'idle' && this._e.cycle >= 2.2) {
      this._e.state = 'warn';
      this._e.cycle = 0;
      this.breathWarn = 0.4;
      this._e.beamX = this._e.dir > 0 ? 40 : W - 40;
    }
    if (this._e.state === 'warn' && this._e.cycle >= 0.4) {
      this._e.state = 'sweep';
      this._e.cycle = 0;
      this.breathWarn = 0;
    }
    if (this._e.state === 'sweep') {
      this._e.beamX += this._e.dir * 220 * dt;
      if (this._e.cycle >= 0.08) {
        this._e.cycle = 0;
        game.enemyBullets.push(new Bullet({
          x: this._e.beamX, y: H * 0.35,
          angle: Math.PI / 2, speed: 2.4, kind: 'bullet.white_breath', r: 6, life: 1.2,
        }));
        game.enemyBullets.push(new Bullet({
          x: this._e.beamX, y: H * 0.55,
          angle: Math.PI / 2, speed: 2.2, kind: 'bullet.white_breath', r: 5, life: 1.0,
        }));
      }
      if ((this._e.dir > 0 && this._e.beamX > W - 30) || (this._e.dir < 0 && this._e.beamX < 30)) {
        this.breathHeat = { x: W / 2, y: H * 0.5, w: W * 0.7, age: 0 };
        this._e.dir *= -1;
        this._e.state = 'idle';
        this._e.cycle = 0;
      }
    }
    if (this._e.tooth >= 1.8) {
      this._e.tooth = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 14, 2.1, 'bullet.gnaw_tooth');
    }
  }

  // —— e4 空白页安全框 ——
  e4(dt, game) {
    if (!this._e) {
      this._e = { swap: 0, rain: 0 };
      this._rollSafe();
    }
    this._e.swap += dt; this._e.rain += dt;
    if (this._e.swap >= 3.0) {
      this._e.swap = 0;
      this._rollSafe();
    }
    if (this._e.rain >= 0.14) {
      this._e.rain = 0;
      const x = 15 + Math.random() * (W - 30);
      const y = -8;
      const r = this.safeRect;
      const inside = r && x > r.x && x < r.x + r.w && (y + 60) > r.y && (y + 60) < r.y + r.h;
      if (!inside) {
        game.enemyBullets.push(new Bullet({
          x, y, angle: Math.PI / 2, speed: 1.5, kind: 'bullet.blank_page', r: 5,
        }));
      } else if (Math.random() < 0.12) {
        game.enemyBullets.push(new Bullet({
          x, y, angle: Math.PI / 2, speed: 1.0, kind: 'bullet.blank_page', r: 4, alpha: 0.4,
        }));
      }
    }
  }
  _rollSafe() {
    const w = 90 + Math.random() * 50;
    const h = 80 + Math.random() * 40;
    this.safeRect = {
      x: 30 + Math.random() * (W - w - 60),
      y: 100 + Math.random() * (H * 0.4),
      w, h,
    };
  }

  // —— e5 重力翻转 ——
  e5(dt, game) {
    if (!this._e) this._e = { flip: 0, rain: 0 };
    this._e.flip += dt; this._e.rain += dt;
    if (this._e.flip >= 2.8) {
      this._e.flip = 0;
      this.gravSign *= -1;
      this.gravFlash = 0.45;
      for (const b of game.enemyBullets) {
        if (!b.hostile || !b.alive) continue;
        if (b.kind === 'bullet.inverse_scale') b.vy *= -1;
      }
    }
    if (this._e.rain >= 0.22) {
      this._e.rain = 0;
      const fromTop = this.gravSign > 0;
      game.enemyBullets.push(new Bullet({
        x: 20 + Math.random() * (W - 40),
        y: fromTop ? -8 : H + 8,
        angle: fromTop ? Math.PI / 2 : -Math.PI / 2,
        speed: 1.5, kind: 'bullet.inverse_scale', r: 4,
      }));
    }
  }

  // —— e6 吸入再喷 ——
  e6(dt, game) {
    if (!this._e) this._e = { cycle: 0, state: 'suck', crumb: 0 };
    this._e.cycle += dt;
    if (this._e.state === 'suck') {
      this._e.crumb += dt;
      if (this._e.crumb >= 0.1) {
        this._e.crumb = 0;
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        if (edge === 0) { x = Math.random() * W; y = -10; }
        else if (edge === 1) { x = Math.random() * W; y = H + 10; }
        else if (edge === 2) { x = -10; y = Math.random() * H; }
        else { x = W + 10; y = Math.random() * H; }
        const a = angTo(x, y, this.x, this.y);
        game.enemyBullets.push(new Bullet({
          x, y, angle: a, speed: 2.5, kind: 'bullet.chrono_shard', r: 3, life: 1.2, alpha: 0.7,
        }));
      }
      if (this._e.cycle >= 0.9) {
        this._e.state = 'spit';
        this._e.cycle = 0;
        emitRing(game.enemyBullets, this.x, this.y, 16, 2.2, 'bullet.chrono_shard', this.moveT);
      }
    } else {
      if (this._e.cycle >= 2.6) {
        this._e.state = 'suck';
        this._e.cycle = 0;
      }
    }
  }

  // —— e7 因果倒置 ——
  e7(dt, game) {
    if (!this._e) this._e = { beat: 0.5 };
    this._e.beat += dt;
    for (const w of this.skipWarns) w.age += dt;
    this.skipWarns = this.skipWarns.filter(w => w.age < 0.6);

    if (this._e.beat >= 2.0) {
      this._e.beat = 0;
      const h = histAgo(game, 0.2);
      // hit-first burst
      emitRing(game.enemyBullets, h.x, h.y, 8, 1.6, 'bullet.blank_page');
      this.skipWarns.push({ x: h.x, y: h.y, age: 0, fired: true, burst: true });
      // residual arrow arrives after
      const tx = h.x, ty = h.y;
      const bx = this.x, by = this.y;
      game.queueEcho(0.25, () => {
        const a = angTo(bx, by, tx, ty);
        // appear mid-path then vanish into burst point
        const mx = bx + (tx - bx) * 0.55;
        const my = by + (ty - by) * 0.55;
        game.enemyBullets.push(new Bullet({
          x: mx, y: my, angle: a, speed: 3.2, kind: 'bullet.skip_arrow', r: 5, life: 0.55,
        }));
      });
    }
  }

  // —— e8 荒漠安全缝 ——
  e8(dt, game) {
    if (!this._e) {
      this._e = { seal: 0, aim: 0, laid: false };
      this.corridorX = W / 2;
      this.corridorDir = 1;
    }
    this.corridorX += this.corridorDir * 55 * dt;
    if (this.corridorX > W - 50) this.corridorDir = -1;
    if (this.corridorX < 50) this.corridorDir = 1;
    this.x = this.corridorX;
    this.y = H * 0.16;

    this._e.seal += dt; this._e.aim += dt;
    if (this._e.seal >= 0.35) {
      this._e.seal = 0;
      for (let i = 0; i < 3; i++) {
        const x = 20 + Math.random() * (W - 40);
        if (Math.abs(x - this.corridorX) < 30) continue;
        const y = 60 + Math.random() * (H - 100);
        game.enemyBullets.push(new Bullet({
          x, y, vx: 0, vy: 0, kind: 'bullet.amber_seal', r: 5, life: 4.5,
        }));
      }
    }
    if (this._e.aim >= 2.2) {
      this._e.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 12, 2.1, 'bullet.gnaw_tooth');
    }
  }

  // —— e9 三口 ——
  e9(dt, game) {
    if (!this._e) this._e = { round: 0, state: 'rest', t: 0 };
    this._e.t += dt;
    for (const w of this.biteWindows) w.age += dt;
    this.biteWindows = this.biteWindows.filter(w => w.age < w.life);

    if (this._e.state === 'rest' && this._e.t >= 1.5) {
      this._e.state = 'warn';
      this._e.t = 0;
      const dens = 1 + Math.floor(this._e.round / 3) * 0.3;
      this.biteWindows.push({
        x: 40 + Math.random() * (W - 160),
        y: 120 + Math.random() * 140,
        w: 120, h: 90, age: 0, life: 1.6, warn: true, dens,
      });
    }
    if (this._e.state === 'warn' && this._e.t >= 0.4) {
      this._e.state = 'bite';
      this._e.t = 0;
      for (const w of this.biteWindows) w.warn = false;
    }
    if (this._e.state === 'bite') {
      this._e.biteCd = (this._e.biteCd || 0) - dt;
      if (this._e.biteCd <= 0) {
        this._e.biteCd = 0.14;
        for (const w of this.biteWindows) {
          if (w.warn) continue;
          game.enemyBullets.push(new Bullet({
            x: w.x + Math.random() * w.w,
            y: w.y + Math.random() * w.h,
            angle: Math.PI / 2, speed: 1.8, kind: 'bullet.gnaw_tooth', r: 4, life: 1.2,
          }));
        }
      }
      if (this._e.t >= 1.2) {
        this._e.state = 'rest';
        this._e.t = 0;
        this._e.round++;
        this.biteWindows = [];
      }
    }
    // boss shootable between bites
    if (this._e.state === 'rest' && this._e.t > 0.3 && Math.floor(this._e.t * 10) % 7 === 0) {
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      game.enemyBullets.push(new Bullet({
        x: this.x, y: this.y, angle: a, speed: 2.0, kind: 'bullet.inverse_scale', r: 4,
      }));
    }
  }

  // —— e10 终符：白颚周期 T≈5s ——
  e10(dt, game) {
    if (!this._e) this._e = { fire: 0 };
    this.lastT += dt;
    const T = { flow: 2.0, warn: 0.5, freeze: 1.2, shatter: 1.3 }; // ~5s
    const order = ['flow', 'warn', 'freeze', 'shatter'];
    const dur = T[this.lastPhase];
    if (this.lastT >= dur) {
      this.lastT = 0;
      const i = order.indexOf(this.lastPhase);
      const next = order[(i + 1) % order.length];
      if (this.lastPhase === 'warn' && next === 'freeze') {
        for (const b of game.enemyBullets) {
          if (!b.hostile || !b.alive) continue;
          b._fvx = b.vx; b._fvy = b.vy;
          b.vx = 0; b.vy = 0; b._frozen = true;
        }
        this.invuln = true;
      }
      if (this.lastPhase === 'freeze' && next === 'shatter') {
        for (const b of game.enemyBullets) {
          if (!b._frozen) continue;
          b._frozen = false;
          const ang = angTo(this.x, this.y, b.x, b.y);
          b.vx = Math.cos(ang) * 3.4;
          b.vy = Math.sin(ang) * 3.4;
          b.kind = 'bullet.chrono_bite';
        }
        this.invuln = false;
        // skip drop points
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2 + this.moveT;
          const px = game.player.x + Math.cos(a) * 80;
          const py = game.player.y + Math.sin(a) * 70;
          this.skipWarns.push({ x: px, y: py, age: 0, fired: false });
        }
      }
      if (next === 'flow') this.invuln = false;
      this.lastPhase = next;
    }
    // resolve skip warns during shatter/flow
    for (const w of this.skipWarns) w.age += dt;
    for (const w of this.skipWarns) {
      if (!w.fired && w.age >= 0.35) {
        w.fired = true;
        const away = angTo(game.player.x, game.player.y, w.x, w.y);
        game.enemyBullets.push(new Bullet({
          x: w.x, y: w.y, angle: away, speed: 1.5, kind: 'bullet.skip_arrow', r: 5, life: 1.5,
        }));
      }
    }
    this.skipWarns = this.skipWarns.filter(w => w.age < 0.55);

    if (this.lastPhase === 'warn') {
      for (const b of game.enemyBullets) {
        if (!b.hostile || !b.alive) continue;
        b.vx *= 0.9; b.vy *= 0.9;
      }
    }
    if (this.lastPhase === 'flow') {
      this._e.fire += dt;
      if (this._e.fire >= 0.4) {
        this._e.fire = 0;
        emitRing(game.enemyBullets, this.x, this.y, 8, 1.5, 'bullet.gnaw_tooth', this.moveT);
        const a = angTo(this.x, this.y, game.player.x, game.player.y);
        game.enemyBullets.push(new Bullet({
          x: this.x, y: this.y, angle: a, speed: 1.9, kind: 'bullet.chrono_bite', r: 5,
        }));
      }
    }
  }

  hurt(dmg) {
    if (this.invuln) return false;
    this.hp -= dmg;
    if (this.hp <= 0) { this.hp = 0; return true; }
    return false;
  }
  draw(ctx) {
    let key = 'boss.shoku';
    if (this.phase === 'e10' || (this.phase === 'spell_declare' && this.spellName && this.spellName.includes('纯白'))) {
      key = 'boss.shoku_last';
    } else if (/^e[2-9]$/.test(this.phase) || this.phase === 'spell_declare') {
      key = 'boss.shoku_spell';
    }
    drawSprite(ctx, key, this.x, this.y, this.w, this.h);

    // skip warn rings
    for (const w of this.skipWarns) {
      if (w.burst) {
        ctx.strokeStyle = 'rgba(242,237,224,0.7)';
        ctx.beginPath(); ctx.arc(w.x, w.y, 18 + w.age * 20, 0, Math.PI * 2); ctx.stroke();
      } else if (!w.fired) {
        ctx.strokeStyle = 'rgba(230,70,70,0.95)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(w.x, w.y, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(w.x, w.y, 6, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // e1 jaw seam hint
    if (this.phase === 'e1') {
      const gap = this.jawGap || 80;
      ctx.fillStyle = 'rgba(242,237,224,0.08)';
      ctx.fillRect(0, H * 0.45 - gap / 2, W, gap);
      ctx.strokeStyle = 'rgba(176,48,48,0.35)';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, H * 0.45 - gap / 2); ctx.lineTo(W, H * 0.45 - gap / 2);
      ctx.moveTo(0, H * 0.45 + gap / 2); ctx.lineTo(W, H * 0.45 + gap / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // e3 breath warn
    if (this.breathWarn > 0 && this._e) {
      ctx.fillStyle = 'rgba(248,248,255,0.25)';
      ctx.fillRect(0, H * 0.3, W, H * 0.35);
      ctx.strokeStyle = 'rgba(248,248,255,0.8)';
      ctx.strokeRect(4, H * 0.3, W - 8, H * 0.35);
    }
    if (this.breathHeat) {
      ctx.fillStyle = `rgba(248,248,255,${0.12 * (1 - this.breathHeat.age / 0.8)})`;
      ctx.fillRect(0, H * 0.32, W, H * 0.35);
    }

    // e4 safe rect
    if (this.safeRect && this.phase === 'e4') {
      const r = this.safeRect;
      ctx.fillStyle = 'rgba(10,10,12,0.45)';
      ctx.fillRect(0, 0, W, r.y);
      ctx.fillRect(0, r.y + r.h, W, H - r.y - r.h);
      ctx.fillRect(0, r.y, r.x, r.h);
      ctx.fillRect(r.x + r.w, r.y, W - r.x - r.w, r.h);
      ctx.strokeStyle = 'rgba(242,237,224,0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }

    // e5 gravity flash
    if (this.gravFlash > 0) {
      ctx.fillStyle = `rgba(122,107,176,${0.35 * (this.gravFlash / 0.45)})`;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#F2EDE0';
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.gravSign > 0 ? '↓ 正置' : '↑ 倒悬', W / 2, H * 0.5);
    }

    // e8 corridor
    if (this.phase === 'e8') {
      ctx.fillStyle = 'rgba(232,184,74,0.12)';
      ctx.fillRect(this.corridorX - 30, 0, 60, H);
      ctx.strokeStyle = 'rgba(242,193,78,0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.corridorX - 30, 4, 60, H - 8);
    }

    // e9 bite windows
    for (const w of this.biteWindows) {
      ctx.strokeStyle = w.warn ? 'rgba(255,80,80,0.85)' : 'rgba(176,48,48,0.7)';
      ctx.lineWidth = w.warn ? 3 : 2;
      if (w.warn) ctx.setLineDash([8, 5]);
      ctx.strokeRect(w.x, w.y, w.w, w.h);
      ctx.setLineDash([]);
      if (!w.warn) {
        ctx.fillStyle = 'rgba(176,48,48,0.2)';
        ctx.fillRect(w.x, w.y, w.w, w.h);
      }
    }

    // e10 freeze overlay
    if (this.phase === 'e10' && (this.lastPhase === 'freeze' || this.lastPhase === 'warn')) {
      ctx.fillStyle = `rgba(248,248,255,${this.lastPhase === 'freeze' ? 0.22 : 0.12})`;
      ctx.fillRect(0, 0, W, H);
      if (this.lastPhase === 'freeze') {
        ctx.strokeStyle = 'rgba(248,248,255,0.7)';
        ctx.lineWidth = 3;
        ctx.strokeRect(8, 8, W - 16, H - 16);
      }
    }
  }
}
