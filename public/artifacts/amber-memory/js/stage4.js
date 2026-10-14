/* Stage 4 — 不翻页的昨日物语 · 阿求投影 + 纪伊墨染 */
const DIALOG_S4_MID = [
  { who: '灵梦', text: '琥珀里怎么还有人影？穿着古风的……御阿礼？' },
  { who: '阿求投影', text: '……（无声。像是被装裱好的「百年一刻」在眨眼。）' },
];
const DIALOG_S4_PRE = [
  { who: '墨染', text: '嘘——请放轻脚步，红白的巫女。你现在踏足的，是幻想乡所有「差点被遗忘的瞬间」。' },
  { who: '灵梦', text: '书库？我只是路过山顶，又不是来借书的。' },
  { who: '墨染', text: '日常？那种转瞬即逝、每天都在重复磨损的东西，哪有封存在琥珀里永恒不变来得美丽？来吧，只要我在这卷《琥珀风土记》上写下「巫女于此折返」，你的今天就会变成一段优美的古文了。' },
  { who: '灵梦', text: '被写成古文之前，我先把你的笔折了。' },
];
const DIALOG_S4_POST = [
  { who: '墨染', text: '怎么会……墨水居然干涸了，明明已经写下了「败北」二字……' },
  { who: '灵梦', text: '字写错了就划掉呗。别把别人的今天订进你的册子里。' },
  { who: '墨染', text: '穿过这道回廊就是「久远庭」……但请小心，我们都只是在收集漏出来的松脂，真正流淌出琥珀的，是那位守墓的侍从与她的神明……' },
];

function spawnMoth(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 70, kind: 'enemy.ink_moth', w: 30, h: 30, r: 11, score: 600,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}
function spawnFolio(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 85, kind: 'enemy.folio_bit', w: 22, h: 30, r: 12, score: 850,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}

class Stage4Director {
  constructor(game) {
    this.g = game; this.t = 0; this.done = {}; this.phase = 'mid';
  }
  reset() { this.t = 0; this.done = {}; this.phase = 'mid'; }
  update(dt) {
    if (this.phase !== 'mid') return;
    this.t += dt;
    const g = this.g;

    // —— 道中前半 ——
    if (this.t >= 5 && !this.done.w1) {
      this.done.w1 = true;
      for (let i = 0; i < 7; i++) {
        const e = spawnMoth(g, 40 + i * 48, -20 - (i % 3) * 12);
        e._amp = 40 + (i % 3) * 10;
        e.move = (en, d) => {
          en.y += 1.5 * 60 * d;
          en.x += Math.sin(en.age * 2.2 + i) * en._amp * d;
        };
        e.fireCd = 0.4 + i * 0.05;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0 || en.y < 40) return;
          en.fireCd = 1.1;
          const a = angTo(en.x, en.y, game.player.x, game.player.y);
          game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: a, speed: 2.0, kind: 'bullet.ink_drop', r: 4 }));
        };
        e.onDeath = function (game) {
          emitFan(game.enemyBullets, this.x, this.y, Math.PI / 2, 3, 30, 1.8, 'bullet.ink_drop');
        };
      }
    }

    if (this.t >= 16 && !this.done.w2) {
      this.done.w2 = true;
      for (let i = 0; i < 6; i++) {
        const e = spawnFolio(g, 60 + i * 50, -25);
        e.move = (en, d) => {
          en.y += 1.1 * 60 * d;
          en.x += Math.sin(en.age * 1.5) * 1.2 * 60 * d;
        };
        e.fireCd = 0.6;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.35;
          game.enemyBullets.push(new Bullet({
            x: en.x, y: en.y, angle: 0, speed: 1.8, kind: 'bullet.brush_stroke', r: 4, wHint: 28,
          }));
          game.enemyBullets.push(new Bullet({
            x: en.x, y: en.y, angle: Math.PI, speed: 1.8, kind: 'bullet.brush_stroke', r: 4,
          }));
        };
      }
    }

    if (this.t >= 28 && !this.done.w3) {
      this.done.w3 = true;
      for (let i = 0; i < 5; i++) {
        const e = spawnMoth(g, 50 + i * 70, -15);
        e.move = (en, d) => { en.y += 1.3 * 60 * d; };
        e.shoot = aimFanShoot(3, 14, 2.0, 'bullet.ink_drop', 0.9);
      }
      for (let i = 0; i < 4; i++) {
        const e = spawnFolio(g, 80 + i * 70, -30);
        e.move = (en, d) => { en.y += 1.0 * 60 * d; };
        e.onDeath = function (game) {
          emitRing(game.enemyBullets, this.x, this.y, 4, 2.0, 'bullet.scroll_seal');
        };
      }
    }

    if (this.t >= 42 && !this.done.w4) {
      this.done.w4 = true;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        const e = spawnMoth(g, W / 2 + Math.cos(a) * 130, H * 0.2 + Math.sin(a) * 50);
        e._a = a;
        e.move = (en, d) => {
          en._a += d * 0.55;
          const rad = Math.max(24, 130 - en.age * 28);
          en.x = W / 2 + Math.cos(en._a) * rad;
          en.y = H * 0.22 + Math.sin(en._a) * rad * 0.4;
        };
        e.fireCd = 0.5;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.5;
          emitRing(game.enemyBullets, en.x, en.y, 10, 1.7, 'bullet.ink_drop', en._a);
        };
      }
    }

    // —— Mid Boss 阿求投影 ——
    if (this.t >= 55 && !this.done.mid) {
      if (g.enemies.length === 0 || this.t >= 62) {
        this.done.mid = true;
        g.enemies.length = 0;
        g.enemyBullets = [];
        g.startMidAkyuu();
      }
    }

    // mid defeat → post mid (handled by game when mid dies / times out)
    if (this.done.postStart && this.phase === 'mid') {
      // post-mid waves use relative timer this._pt
      this._pt = (this._pt || 0) + dt;

      if (this._pt >= 1 && !this.done.w5) {
        this.done.w5 = true;
        for (let i = 0; i < 6; i++) {
          const side = i % 2;
          const e = spawnFolio(g, side ? 40 : W - 40, -20 - i * 18);
          e.move = (en, d) => {
            en.y += 1.2 * 60 * d;
            en.x += (side ? 1 : -1) * 0.6 * 60 * d;
          };
          e.fireCd = 0.5;
          e.shoot = function (en, d, game) {
            en.fireCd -= d;
            if (en.fireCd > 0) return;
            en.fireCd = 1.2;
            game.enemyBullets.push(new Bullet({
              x: en.x, y: en.y, angle: side ? 0.15 : Math.PI - 0.15, speed: 1.9, kind: 'bullet.brush_stroke', r: 4,
            }));
          };
        }
      }
      if (this._pt >= 12 && !this.done.w6) {
        this.done.w6 = true;
        for (let i = 0; i < 10; i++) {
          const e = spawnMoth(g, 30 + i * 35, -15 - (i % 4) * 10);
          e.move = (en, d) => { en.y += 1.6 * 60 * d; };
          e.fireCd = 0.2 + i * 0.04;
          e.shoot = function (en, d, game) {
            en.fireCd -= d;
            if (en.fireCd > 0) return;
            en.fireCd = 0.85;
            game.enemyBullets.push(new Bullet({
              x: en.x, y: en.y, angle: Math.PI / 2, speed: 2.0, kind: 'bullet.ink_drop', r: 4,
            }));
          };
        }
      }
      if (this._pt >= 24 && !this.done.w7) {
        this.done.w7 = true;
        for (let i = 0; i < 4; i++) {
          const e = spawnFolio(g, 70 + i * 80, -20);
          e.move = (en, d) => { en.y += 1.05 * 60 * d; };
          e.onDeath = function (game) {
            emitRing(game.enemyBullets, this.x, this.y, 6, 2.0, 'bullet.scroll_seal');
          };
        }
        for (let i = 0; i < 6; i++) {
          const e = spawnMoth(g, 50 + i * 55, -30);
          e.move = (en, d) => { en.y += 1.4 * 60 * d; };
          e.shoot = aimFanShoot(1, 0, 2.1, 'bullet.ink_drop', 0.85);
        }
      }
      if (this._pt >= 35 && !this.done.boss) {
        if (g.enemies.length === 0 || this._pt >= 42) {
          this.done.boss = true;
          this.phase = 'boss';
          g.enemies.length = 0;
          g.startBoss4();
        }
      }
    }
  }
  beginPostMid() {
    this.done.postStart = true;
    this._pt = 0;
  }
}

/** 道中 Boss：阿求投影 — 2 段 */
class MidAkyuu {
  constructor() {
    this.x = W / 2; this.y = -40; this.targetY = H * 0.2;
    this.hp = 900; this.maxHp = 900; this.r = 28; this.alive = true;
    this.phase = 'enter'; this.age = 0; this.phaseAge = 0; this.moveT = 0;
    this.w = 64; this.h = 78; this.invuln = true;
    this.name = '阿求投影'; this.spellName = ''; this.timeLimit = 0;
    this.frames = []; // active picture frames {x,y,w,h,life,age}
    this.isMid = true;
  }
  setPhase(p, hp, limit) {
    this.phase = p; this.phaseAge = 0;
    this.hp = hp; this.maxHp = hp; this.timeLimit = limit || 0;
    this.invuln = (p === 'enter' || p === 'dialog' || p === 'spell_declare');
  }
  update(dt, game) {
    this.age += dt; this.phaseAge += dt; this.moveT += dt;
    if (this.phase === 'enter') {
      this.y += (this.targetY - this.y) * Math.min(1, 3 * dt);
      if (Math.abs(this.y - this.targetY) < 2) {
        this.y = this.targetY;
        game.startDialogMid4();
      }
      return;
    }
    if (this.phase === 'dialog' || this.phase === 'spell_declare') return;

    if (this.phase === 'm1_nonspell') {
      this.x = W / 2 + Math.sin(this.moveT / 3 * Math.PI * 2) * (W * 0.28);
      this.y = H * 0.2;
      this.ns(dt, game);
    } else if (this.phase === 'm2_spell') {
      this.x = W / 2 + Math.sin(this.moveT * 0.45) * 35;
      this.y = H * 0.18;
      this.sp(dt, game);
    }
    if (this.timeLimit > 0 && this.phaseAge >= this.timeLimit) game.onMid4Timeout();
  }
  ns(dt, game) {
    if (!this._a) this._a = { sweep: 0, aim: 0, row: 0 };
    this._a.sweep += dt; this._a.aim += dt;
    if (this._a.sweep >= 1.0) {
      this._a.sweep = 0;
      this._a.row++;
      const yOff = (this._a.row % 2) ? 30 : -10;
      for (let i = 0; i < 8; i++) {
        game.enemyBullets.push(new Bullet({
          x: -10, y: 100 + yOff + i * 28, angle: 0, speed: 2.0, kind: 'bullet.brush_stroke', r: 4,
        }));
        game.enemyBullets.push(new Bullet({
          x: W + 10, y: 120 - yOff + i * 28, angle: Math.PI, speed: 2.0, kind: 'bullet.brush_stroke', r: 4,
        }));
      }
    }
    if (this._a.aim >= 2.8) {
      this._a.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 12, 2.2, 'bullet.ink_drop');
    }
  }
  sp(dt, game) {
    if (!this._s) this._s = { frame: 0.5, aim: 0, rain: 0 };
    this._s.frame += dt; this._s.aim += dt; this._s.rain += dt;
    // update frames
    for (const f of this.frames) f.age += dt;
    const dying = this.frames.filter(f => f.age >= f.life);
    for (const f of dying) {
      // edge burst
      const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
      emitRing(game.enemyBullets, cx, cy, 8, 2.0, 'bullet.scroll_seal');
    }
    this.frames = this.frames.filter(f => f.age < f.life);

    if (this._s.frame >= 3.2) {
      this._s.frame = 0;
      const fw = 120, fh = 80;
      const fx = 30 + Math.random() * (W - fw - 60);
      const fy = 90 + Math.random() * (H * 0.45);
      this.frames.push({ x: fx, y: fy, w: fw, h: fh, life: 2.0, age: 0 });
    }
    // glyph rain outside frames
    if (this._s.rain >= 0.28) {
      this._s.rain = 0;
      const x = 20 + Math.random() * (W - 40);
      const y = -8;
      let inside = false;
      for (const f of this.frames) {
        if (x > f.x && x < f.x + f.w && y + 40 > f.y && y + 40 < f.y + f.h) { inside = true; break; }
      }
      // always spawn; player reads: stay in frame (glyphs still fall but sparse feel via speed)
      if (!inside || Math.random() < 0.25) {
        game.enemyBullets.push(new Bullet({
          x, y, angle: Math.PI / 2, speed: 1.2, kind: 'bullet.char_glyph', r: 5,
        }));
      }
    }
    if (this._s.aim >= 2.0) {
      this._s.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      game.enemyBullets.push(new Bullet({
        x: this.x, y: this.y, angle: a, speed: 2.3, kind: 'bullet.ink_drop', r: 4,
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
    const key = this.phase === 'm2_spell' || this.phase === 'spell_declare' ? 'mid.akyuu' : 'mid.akyuu';
    drawSprite(ctx, key, this.x, this.y, this.w, this.h);
    // picture frames: amber edge, safe inside tint
    for (const f of this.frames) {
      ctx.strokeStyle = 'rgba(201,149,42,0.9)';
      ctx.lineWidth = 3;
      ctx.strokeRect(f.x, f.y, f.w, f.h);
      ctx.fillStyle = 'rgba(201,149,42,0.1)';
      ctx.fillRect(f.x, f.y, f.w, f.h);
      // edge danger hint
      ctx.strokeStyle = 'rgba(184,58,44,0.55)';
      ctx.lineWidth = 1;
      ctx.strokeRect(f.x - 2, f.y - 2, f.w + 4, f.h + 4);
    }
  }
}

/** Boss：纪伊 墨染 — NS1/Sp1/NS2/Sp2/Sp3/Sp4 */
class BossSumizome {
  constructor() {
    this.x = W / 2; this.y = -40; this.targetY = H * 0.2;
    this.hp = 1500; this.maxHp = 1500; this.r = 30; this.alive = true;
    this.phase = 'enter'; this.age = 0; this.phaseAge = 0; this.moveT = 0;
    this.w = 68; this.h = 80; this.invuln = true;
    this.name = '纪伊 墨染'; this.spellName = ''; this.timeLimit = 0;
    this.safeBandY = null; this.safeBandH = 48;
    this.cartLanes = [];
    this.cinCircles = [];
    this.warnLines = [];
  }
  setPhase(p, hp, limit) {
    this.phase = p; this.phaseAge = 0;
    this.hp = hp; this.maxHp = hp; this.timeLimit = limit || 0;
    this.invuln = (p === 'enter' || p === 'dialog' || p === 'spell_declare');
    this.safeBandY = null; this.cartLanes = []; this.cinCircles = []; this.warnLines = [];
  }
  update(dt, game) {
    this.age += dt; this.phaseAge += dt; this.moveT += dt;
    if (this.phase === 'enter') {
      this.y += (this.targetY - this.y) * Math.min(1, 3 * dt);
      if (Math.abs(this.y - this.targetY) < 2) {
        this.y = this.targetY;
        game.startDialog4();
      }
      return;
    }
    if (this.phase === 'dialog' || this.phase === 'spell_declare') return;

    if (this.phase === 'p1_nonspell') {
      this.x = W / 2 + Math.sin(this.moveT / 3 * Math.PI * 2) * (W * 0.3);
      this.y = H * 0.2; this.ns1(dt, game);
    } else if (this.phase === 'p2_spell1') {
      this.x = W / 2 + Math.sin(this.moveT * 0.4) * 50;
      this.y = H * 0.16; this.sp1(dt, game);
    } else if (this.phase === 'p3_nonspell2') {
      this.x = W / 2 + Math.sin(this.moveT / 2.8 * Math.PI * 2) * (W * 0.28);
      this.y = H * 0.2; this.ns2(dt, game);
    } else if (this.phase === 'p4_spell2') {
      this.x = W / 2 + Math.sin(this.moveT * 0.35) * 45;
      this.y = H * 0.18; this.sp2(dt, game);
    } else if (this.phase === 'p5_spell3') {
      const t = this.moveT * 0.7;
      this.x = W / 2 + Math.sin(t) * 55;
      this.y = H * 0.2 + Math.sin(t * 2) * 18;
      this.sp3(dt, game);
    } else if (this.phase === 'p6_spell4') {
      this.x = W / 2 + Math.sin(this.moveT * 0.45) * 40;
      this.y = H * 0.18; this.sp4(dt, game);
    }
    if (this.timeLimit > 0 && this.phaseAge >= this.timeLimit) game.onBoss4Timeout();
  }
  ns1(dt, game) {
    if (!this._a) this._a = { fan: 0, brush: 0 };
    this._a.fan += dt; this._a.brush += dt;
    if (this._a.fan >= 0.9) {
      this._a.fan = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 5, 14, 2.0, 'bullet.ink_drop');
    }
    if (this._a.brush >= 3.0) {
      this._a.brush = 0;
      const ys = [H * 0.3, H * 0.5, H * 0.7];
      ys.forEach((yy, i) => {
        game.queueEcho(i * 0.25, () => {
          const fromL = i % 2 === 0;
          game.enemyBullets.push(new Bullet({
            x: fromL ? -10 : W + 10, y: yy,
            angle: fromL ? 0 : Math.PI, speed: 2.2, kind: 'bullet.brush_stroke', r: 5,
          }));
        });
      });
    }
  }
  sp1(dt, game) {
    // 合页：左右 char_glyph 向中线
    if (!this._s1) this._s1 = { page: 0 };
    this._s1.page += dt;
    if (this._s1.page >= 2.5) {
      this._s1.page = 0;
      for (let col = 0; col < 2; col++) {
        for (let row = 0; row < 10; row++) {
          const y = 60 + row * 36 + (col ? 18 : 0);
          const fromL = col === 0;
          game.enemyBullets.push(new Bullet({
            x: fromL ? 10 : W - 10, y,
            angle: fromL ? 0 : Math.PI, speed: 1.6, kind: 'bullet.char_glyph', r: 5,
          }));
        }
      }
      // mid burst on close
      game.queueEcho(1.1, () => {
        emitRing(game.enemyBullets, W / 2, H * 0.45, 6, 2.1, 'bullet.scroll_seal');
      });
    }
  }
  ns2(dt, game) {
    // 预兆线 → brush along quantized aim
    if (!this._n2) this._n2 = { beat: 0 };
    this._n2.beat += dt;
    // update warn
    for (const w of this.warnLines) w.age += dt;
    const fire = this.warnLines.filter(w => w.age >= 0.6);
    for (const w of fire) {
      for (let i = 0; i < 14; i++) {
        game.enemyBullets.push(new Bullet({
          x: w.x + Math.cos(w.a) * i * 28,
          y: w.y + Math.sin(w.a) * i * 28,
          vx: 0, vy: 0, kind: 'bullet.brush_stroke', r: 4, life: 0.85,
        }));
      }
    }
    this.warnLines = this.warnLines.filter(w => w.age < 0.6);
    if (this._n2.beat >= 1.2) {
      this._n2.beat = 0;
      let a = angTo(this.x, this.y, game.player.x, game.player.y);
      // quantize to 45°
      a = Math.round(a / (Math.PI / 4)) * (Math.PI / 4);
      this.warnLines.push({ x: this.x, y: this.y, a, age: 0 });
    }
  }
  sp2(dt, game) {
    // 涂抹带：水平安全带
    if (!this._s2) {
      this._s2 = { smear: 0, aim: 0, rain: 0, drift: 0 };
      this.safeBandY = H * 0.55;
    }
    this._s2.smear += dt; this._s2.aim += dt; this._s2.rain += dt; this._s2.drift += dt;
    this.safeBandY += Math.sin(this._s2.drift * 0.6) * 18 * dt;
    this.safeBandY = Math.max(H * 0.35, Math.min(H * 0.72, this.safeBandY));

    if (this._s2.rain >= 0.4) {
      this._s2.rain = 0;
      const x = 20 + Math.random() * (W - 40);
      const y = -8;
      // skip if would land in band soon — approximate: only skip middle band region for spawn y check via target
      const inBand = Math.abs((y + 200) - this.safeBandY) < this.safeBandH / 2;
      if (!inBand) {
        game.enemyBullets.push(new Bullet({
          x, y, angle: Math.PI / 2, speed: 1.3, kind: 'bullet.char_glyph', r: 5,
        }));
      }
    }
    if (this._s2.smear >= 3.5) {
      this._s2.smear = 0;
      const fromL = Math.random() < 0.5;
      const sy = 80 + Math.random() * (H - 160);
      // big brush sweep
      for (let i = 0; i < 12; i++) {
        game.queueEcho(i * 0.04, () => {
          const x = fromL ? 20 + i * 30 : W - 20 - i * 30;
          game.enemyBullets.push(new Bullet({
            x, y: sy, vx: 0, vy: 0, kind: 'bullet.ink_drop', r: 5, life: 1.2,
          }));
          game.enemyBullets.push(new Bullet({
            x, y: sy + 16, vx: 0, vy: 0, kind: 'bullet.ink_drop', r: 4, life: 1.2,
          }));
        });
      }
    }
    if (this._s2.aim >= 2.2) {
      this._s2.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 11, 2.2, 'bullet.ink_drop');
    }
  }
  sp3(dt, game) {
    // 车辙：垂直 lanes + cart_wheel
    if (!this._s3) {
      this._s3 = { train: 0, side: 0, pulse: 0 };
      this.cartLanes = [W * 0.33, W * 0.66];
    }
    this._s3.train += dt; this._s3.side += dt; this._s3.pulse += dt;
    // micro sway
    this.cartLanes = this.cartLanes.map((lx, i) => {
      const base = this.cartLanes.length === 3
        ? [W * 0.25, W * 0.5, W * 0.75][i]
        : [W * 0.33, W * 0.66][i];
      return base + Math.sin(this.moveT * 0.8 + i) * 12;
    });
    if (this._s3.pulse >= 4.0) {
      this._s3.pulse = 0;
      this.cartLanes = [W * 0.25, W * 0.5, W * 0.75];
      game.queueEcho(2.0, () => {
        if (game.boss === this && this.phase === 'p5_spell3') {
          this.cartLanes = [W * 0.33, W * 0.66];
        }
      });
    }
    if (this._s3.train >= 0.55) {
      this._s3.train = 0;
      for (const lx of this.cartLanes) {
        game.enemyBullets.push(new Bullet({
          x: lx, y: -12, angle: Math.PI / 2, speed: 1.7, kind: 'bullet.cart_wheel', r: 6,
        }));
      }
    }
    if (this._s3.side >= 1.1) {
      this._s3.side = 0;
      for (let i = 0; i < 4; i++) {
        game.enemyBullets.push(new Bullet({
          x: 20, y: 100 + i * 70, angle: 0.4, speed: 1.8, kind: 'bullet.brush_stroke', r: 4,
        }));
        game.enemyBullets.push(new Bullet({
          x: W - 20, y: 130 + i * 70, angle: Math.PI - 0.4, speed: 1.8, kind: 'bullet.brush_stroke', r: 4,
        }));
      }
    }
  }
  sp4(dt, game) {
    // 朱圈：delay-player-pos ring burst + glyph drift + delete line
    if (!this._s4) this._s4 = { circle: 0, glyph: 0, del: 0 };
    this._s4.circle += dt; this._s4.glyph += dt; this._s4.del += dt;
    // update circles
    for (const c of this.cinCircles) {
      c.age += dt;
      if (!c.fired && c.age >= 0.65) {
        c.fired = true;
        emitRing(game.enemyBullets, c.x, c.y, 10, 2.0, 'bullet.scroll_seal');
      }
    }
    this.cinCircles = this.cinCircles.filter(c => c.age < 0.85);

    if (this._s4.circle >= 2.2) {
      this._s4.circle = 0;
      // use delayed player pos via history if available, else current
      let px = game.player.x, py = game.player.y;
      if (game.playerHistory && game.playerHistory.length > 15) {
        const h = game.playerHistory[game.playerHistory.length - 16];
        px = h.x; py = h.y;
      }
      this.cinCircles.push({ x: px, y: py, age: 0, fired: false, r: 70 });
    }
    if (this._s4.glyph >= 0.5) {
      this._s4.glyph = 0;
      const x = 30 + Math.random() * (W - 60);
      const y = 60 + Math.random() * (H * 0.5);
      const b = new Bullet({
        x, y, vx: 0, vy: 0.9, kind: 'bullet.char_glyph', r: 5, life: 6,
      });
      b.custom = (bb, d, g) => {
        const a = angTo(bb.x, bb.y, g.player.x, g.player.y);
        bb.vx += Math.cos(a) * 0.4 * d;
        bb.vy += Math.sin(a) * 0.4 * d;
        const sp = Math.hypot(bb.vx, bb.vy);
        if (sp > 1.2) { bb.vx *= 1.2 / sp; bb.vy *= 1.2 / sp; }
      };
      game.enemyBullets.push(b);
    }
    // delete line warn
    for (const w of this.warnLines) w.age += dt;
    const ready = this.warnLines.filter(w => w.age >= 0.4);
    for (const w of ready) {
      for (let i = 0; i < 16; i++) {
        game.enemyBullets.push(new Bullet({
          x: 12 + i * 24, y: w.y, angle: 0, speed: 0.01, kind: 'bullet.brush_stroke', r: 4, life: 0.9,
        }));
      }
    }
    this.warnLines = this.warnLines.filter(w => w.age < 0.4);
    if (this._s4.del >= 3.5) {
      this._s4.del = 0;
      this.warnLines.push({ y: game.player.y, age: 0 });
    }
    // track player history for delay circle
    if (!game.playerHistory) game.playerHistory = [];
    game.playerHistory.push({ x: game.player.x, y: game.player.y });
    if (game.playerHistory.length > 60) game.playerHistory.shift();
  }
  hurt(dmg) {
    if (this.invuln) return false;
    this.hp -= dmg;
    if (this.hp <= 0) { this.hp = 0; return true; }
    return false;
  }
  draw(ctx) {
    const spell = this.phase.startsWith('p2') || this.phase.startsWith('p4') ||
      this.phase.startsWith('p5') || this.phase.startsWith('p6') || this.phase === 'spell_declare';
    drawSprite(ctx, spell ? 'boss.sumizome_spell' : 'boss.sumizome', this.x, this.y, this.w, this.h);
    // safe band
    if (this.safeBandY != null && this.phase === 'p4_spell2') {
      ctx.fillStyle = 'rgba(201,149,42,0.28)';
      ctx.fillRect(0, this.safeBandY - this.safeBandH / 2, W, this.safeBandH);
      ctx.strokeStyle = 'rgba(201,149,42,0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, this.safeBandY - this.safeBandH / 2, W, this.safeBandH);
    }
    // cart lanes
    if (this.phase === 'p5_spell3') {
      for (const lx of this.cartLanes) {
        ctx.fillStyle = 'rgba(58,58,72,0.32)';
        ctx.fillRect(lx - 22, 0, 44, H);
        ctx.strokeStyle = 'rgba(20,20,20,0.45)';
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H); ctx.stroke();
      }
    }
    // cinabar warn circles
    for (const c of this.cinCircles) {
      const a = Math.min(1, c.age / 0.65);
      ctx.strokeStyle = `rgba(184,58,44,${0.35 + a * 0.5})`;
      ctx.lineWidth = 2 + a * 2;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r * (1.15 - a * 0.15), 0, Math.PI * 2); ctx.stroke();
    }
    // warn lines (ns2 / delete)
    for (const w of this.warnLines) {
      ctx.strokeStyle = 'rgba(184,58,44,0.5)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      if (w.a != null) {
        ctx.moveTo(w.x, w.y);
        ctx.lineTo(w.x + Math.cos(w.a) * 400, w.y + Math.sin(w.a) * 400);
      } else {
        ctx.moveTo(0, w.y); ctx.lineTo(W, w.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}
