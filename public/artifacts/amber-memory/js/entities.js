class Player {
  constructor() {
    this.x = W / 2; this.y = H * 0.82;
    this.speed = 4.2; this.slow = 2.0;
    this.r = 3; // hitbox
    const treat = (typeof treatOn === 'function' && treatOn());
    this.lives = treat ? 99 : 5; this.bombs = 3;
    this.score = 0; this.graze = 0;
    this.shotCd = 0; this.invuln = 0;
    this.alive = true;
    this.w = 36; this.h = 48;
  }
  update(dt, keys, bullets) {
    if (this.invuln > 0) this.invuln -= dt;
    const slow = keys.Shift;
    const mul = (this.speedMul != null ? this.speedMul : 1);
    const sp = (slow ? this.slow : this.speed) * mul * 60 * dt;
    let dx = 0, dy = 0;
    if (keys.ArrowLeft || keys.a || keys.A) dx -= 1;
    if (keys.ArrowRight || keys.d || keys.D) dx += 1;
    if (keys.ArrowUp || keys.w || keys.W) dy -= 1;
    if (keys.ArrowDown || keys.s || keys.S) dy += 1;
    if (dx || dy) {
      const n = Math.hypot(dx, dy);
      this.x += (dx / n) * sp;
      this.y += (dy / n) * sp;
    }
    this.x = Math.max(16, Math.min(W - 16, this.x));
    this.y = Math.max(24, Math.min(H - 16, this.y));
    this.shotCd -= dt;
    if (keys.z || keys.Z) {
      if (this.shotCd <= 0) {
        this.shotCd = 0.06;
        bullets.push(new Bullet({
          x: this.x - 6, y: this.y - 18, angle: -Math.PI / 2, speed: 12,
          kind: 'bullet.amber_dot', hostile: false, r: 3, life: 1.2,
        }));
        bullets.push(new Bullet({
          x: this.x + 6, y: this.y - 18, angle: -Math.PI / 2, speed: 12,
          kind: 'bullet.amber_dot', hostile: false, r: 3, life: 1.2,
        }));
        if (slow) {
          bullets.push(new Bullet({
            x: this.x, y: this.y - 20, angle: -Math.PI / 2, speed: 14,
            kind: 'bullet.amber_rice', hostile: false, r: 3, life: 1.2,
          }));
        }
      }
    }
  }
  hit() {
    if (new URLSearchParams(location.search).get('god') === '1') return false;
    if (typeof treatOn === 'function' && treatOn()) return false;
    if (this.invuln > 0) return false;
    this.lives -= 1;
    this.invuln = 2.0;
    this.x = W / 2; this.y = H * 0.82;
    return this.lives < 0;
  }
  bomb(game) {
    if (this.bombs <= 0) return false;
    this.bombs -= 1;
    this.invuln = Math.max(this.invuln, 0.5);
    if (game && game.enemyBullets) {
      for (const b of game.enemyBullets) {
        if (b.hostile) b.alive = false;
      }
    }
    return true;
  }
  draw(ctx) {
    if (this.invuln > 0 && Math.floor(this.invuln * 10) % 2 === 0) return;
    drawSprite(ctx, 'player.reimu', this.x, this.y, this.w, this.h);
    // hitbox when slow
  }
  drawHitbox(ctx, show) {
    if (!show) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD966';
    ctx.fill();
  }
}

class Enemy {
  constructor(opts) {
    Object.assign(this, {
      x: 0, y: 0, vx: 0, vy: 0,
      hp: 60, maxHp: 60, r: 12,
      kind: 'enemy.fairy_amber',
      alive: true, age: 0,
      w: 28, h: 28,
      shoot: null, // fn(e, dt, game)
      move: null,
      fireCd: 0,
      score: 500,
    }, opts);
    if (typeof diffMul === 'function') {
      const fh = diffMul().fairyHp;
      if (fh != null && fh !== 1) {
        this.hp = Math.max(1, Math.round(this.hp * fh));
      }
    }
    this.maxHp = this.hp;
  }
  update(dt, game) {
    this.age += dt;
    if (this.move) this.move(this, dt, game);
    else {
      this.x += this.vx * 60 * dt;
      this.y += this.vy * 60 * dt;
    }
    if (this.shoot) this.shoot(this, dt, game);
    if (this.y > H + 40 || this.x < -60 || this.x > W + 60) this.alive = false;
  }
  hurt(dmg, game) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.alive = false;
      if (this.onDeath && game) this.onDeath(game);
      return true;
    }
    return false;
  }
  draw(ctx) {
    drawSprite(ctx, this.kind, this.x, this.y, this.w, this.h);
  }
}

class Boss {
  constructor() {
    this.x = W / 2; this.y = -40;
    this.targetY = H * 0.22;
    this.hp = 1200; this.maxHp = 1200;
    this.r = 28; this.alive = true;
    this.phase = 'enter';
    this.age = 0; this.phaseAge = 0;
    this.w = 64; this.h = 76;
    this.invuln = true;
    this.moveT = 0;
    this.name = '水绘 雫';
    this.title = '掬水留影的沙漏娘';
    this.spellName = '';
    this.timeLimit = 0;
  }
  setPhase(p, hp, limit) {
    this.phase = p;
    this.phaseAge = 0;
    this.hp = hp; this.maxHp = hp;
    this.timeLimit = limit || 0;
    this.invuln = (p === 'enter' || p === 'dialog' || p === 'spell_declare');
  }
  update(dt, game) {
    this.age += dt; this.phaseAge += dt; this.moveT += dt;
    // enter slide
    if (this.phase === 'enter') {
      this.y += (this.targetY - this.y) * Math.min(1, 3 * dt);
      if (Math.abs(this.y - this.targetY) < 2) {
        this.y = this.targetY;
        game.startDialog();
      }
      return;
    }
    if (this.phase === 'dialog' || this.phase === 'spell_declare') return;

    // movement + patterns
    if (this.phase === 'p1_nonspell') {
      this.x = W / 2 + Math.sin(this.moveT / 4 * Math.PI * 2) * (W * 0.28);
      this.y = H * 0.22 + Math.sin(this.moveT / 2.5) * 12;
      this.nonspellShoot(dt, game);
    } else if (this.phase === 'p2_spell1') {
      this.x = W / 2 + Math.sin(this.moveT * 0.7) * 40;
      this.y = H * 0.2 + Math.sin(this.moveT * 1.4) * 18;
      this.spell1Shoot(dt, game);
    } else if (this.phase === 'p3_nonspell2') {
      this.x = W / 2 + Math.sin(this.moveT / 3.2 * Math.PI * 2) * (W * 0.32);
      this.y = H * 0.22 + Math.sin(this.moveT / 2.0) * 14;
      this.nonspell2Shoot(dt, game);
    } else if (this.phase === 'p4_spell2') {
      const t = this.moveT * 0.55;
      this.x = W / 2 + Math.sin(t) * 50;
      this.y = H * 0.2 + Math.abs(Math.sin(t * 1.5)) * 22;
      this.mirrors = [
        { x: W * 0.22, y: this.y },
        { x: W * 0.78, y: this.y },
      ];
      this.spell2Shoot(dt, game);
    }

    if (this.timeLimit > 0 && this.phaseAge >= this.timeLimit) {
      game.onBossPhaseTimeout();
    }
  }
  nonspellShoot(dt, game) {
    if (!this._nsAcc) this._nsAcc = { ring: 0, aim: 0, spin: 0 };
    this._nsAcc.ring += dt; this._nsAcc.aim += dt; this._nsAcc.spin += dt;
    const spinAng = this._nsAcc.spin * deg(25);
    if (this._nsAcc.ring >= 1.1) {
      this._nsAcc.ring = 0;
      emitRing(game.enemyBullets, this.x, this.y, 12, 1.6, 'bullet.amber_dot', spinAng, { spin: deg(25) });
      emitRing(game.enemyBullets, this.x, this.y, 16, 2.1, 'bullet.water_ring', -spinAng, { r: 5, spin: -deg(20) });
    }
    if (this._nsAcc.aim >= 3.5) {
      this._nsAcc.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 14, 2.6, 'bullet.amber_rice');
    }
  }
  spell1Shoot(dt, game) {
    if (!this._spAcc) this._spAcc = { clock: 0.8, rain: 0, side: 0 };
    // invuln first 0.8s handled by spell_declare then start
    this._spAcc.clock += dt; this._spAcc.rain += dt;
    if (this._spAcc.clock >= 1.5) {
      this._spAcc.clock = 0;
      const bullets = [];
      emitRing(bullets, this.x, this.y, 24, 1.4 * 0.9, 'bullet.sand_grain', this.phaseAge * 0.3, { r: 3 });
      // reverse after 0.6s → inward/tangential swirl
      for (const b of bullets) {
        const born = b;
        born._revAt = 0.6;
        born.custom = (bb, ddt) => {
          if (bb.age >= bb._revAt && !bb._revdone) {
            bb._revdone = true;
            // reverse radial + add tangential
            const ang = Math.atan2(bb.y - game.boss.y, bb.x - game.boss.x);
            const tang = ang + Math.PI / 2;
            bb.vx = Math.cos(ang) * -1.2 + Math.cos(tang) * 1.8;
            bb.vy = Math.sin(ang) * -1.2 + Math.sin(tang) * 1.8;
          }
        };
        game.enemyBullets.push(born);
      }
    }
    if (this._spAcc.rain >= 2.8) {
      this._spAcc.rain = 0;
      this._spAcc.side = 1 - this._spAcc.side;
      const cx = this._spAcc.side ? W * 0.22 : W * 0.78;
      for (let i = 0; i < 5; i++) {
        game.enemyBullets.push(new Bullet({
          x: cx + (i - 2) * 12, y: -10,
          angle: Math.PI / 2, speed: 1.5,
          kind: 'bullet.amber_dot', r: 4,
        }));
      }
    }
  }
  nonspell2Shoot(dt, game) {
    if (!this._ns2) this._ns2 = { waist: 0, ring: 0, aim: 0, open: 0 };
    this._ns2.waist += dt; this._ns2.ring += dt; this._ns2.aim += dt; this._ns2.open += dt;
    // hourglass waist jets every 0.9s
    if (this._ns2.waist >= 0.9) {
      this._ns2.waist = 0;
      const open = Math.min(1, this._ns2.open / 0.35); // open angle lerp proxy per burst
      const spread = 25 + 30 * Math.min(1, (this.phaseAge % 2) / 0.35);
      for (const side of [-1, 1]) {
        for (let i = 0; i < 4; i++) {
          const t = i / 3;
          const ang = Math.PI / 2 + side * deg(25 + t * 30);
          const spd = 2.0 + t * 0.4;
          game.enemyBullets.push(new Bullet({
            x: this.x, y: this.y + 10, angle: ang, speed: spd,
            kind: 'bullet.amber_rice', r: 3.5,
          }));
        }
      }
    }
    if (this._ns2.ring >= 2.8) {
      this._ns2.ring = 0;
      const rings = [];
      emitRing(rings, this.x, this.y + 20, 10, 1.2, 'bullet.water_ring', Math.PI / 2, { r: 5 });
      for (const b of rings) {
        b.custom = (bb) => {
          if (bb.age >= 0.5 && !bb._up) {
            bb._up = true;
            bb.vx = 0; bb.vy = -0.9;
          }
        };
        game.enemyBullets.push(b);
      }
    }
    if (this._ns2.aim >= 4.0) {
      this._ns2.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 5, 11, 2.3, 'bullet.amber_dot');
    }
  }
  spell2Shoot(dt, game) {
    if (!this._sp2) this._sp2 = { glass: 0, mirror: 1.2, sand: 0 };
    this._sp2.glass += dt; this._sp2.mirror += dt; this._sp2.sand += dt;
    // track delayed player pos
    if (!game.playerHistory) game.playerHistory = [];
    game.playerHistory.push({ x: game.player.x, y: game.player.y, t: game.boss.phaseAge });
    while (game.playerHistory.length && game.boss.phaseAge - game.playerHistory[0].t > 1.0) {
      game.playerHistory.shift();
    }
    function delayedPos(delay) {
      const target = game.boss.phaseAge - delay;
      let best = game.playerHistory[0] || { x: game.player.x, y: game.player.y };
      for (const p of game.playerHistory) {
        if (p.t <= target) best = p;
      }
      return best;
    }
    // A: hourglass tears every 2.0s
    if (this._sp2.glass >= 2.0) {
      this._sp2.glass = 0;
      const topY = this.y - 40;
      for (let i = 0; i < 12; i++) {
        const t = i / 11;
        const x0 = this.x + (-80 + t * 160);
        const x1 = this.x + (-20 + t * 40);
        const b = new Bullet({
          x: x0, y: topY, vx: 0, vy: 1.7,
          kind: 'bullet.amber_tear', r: 4, hostile: true,
        });
        b._wx = x1; b._wy = this.y + 8; b._flipAt = null;
        b.custom = (bb) => {
          // converge toward waist while falling
          bb.x += (bb._wx - bb.x) * 0.04;
          if (!bb._flipAt && bb.y >= bb._wy) {
            bb._flipAt = bb.age;
            const side = Math.random() < 0.5 ? -1 : 1;
            const ang = Math.PI / 2 + side * deg(30 + Math.random() * 40);
            bb.kind = 'bullet.amber_rice';
            bb.vx = Math.cos(ang) * 2.2;
            bb.vy = Math.sin(ang) * 2.2;
          }
        };
        game.enemyBullets.push(b);
      }
    }
    // B: mirror copy every 2.4s (offset 1.2 from A)
    if (this._sp2.mirror >= 2.4) {
      this._sp2.mirror = 0;
      const old = delayedPos(0.55);
      for (const m of (this.mirrors || [])) {
        const a = angTo(m.x, m.y, old.x, old.y);
        for (let i = 0; i < 5; i++) {
          const spread = deg(10) * (i - 2);
          game.enemyBullets.push(new Bullet({
            x: m.x, y: m.y, angle: a + spread, speed: 2.0,
            kind: 'bullet.mirror_shard', r: 4, life: 1.1,
          }));
        }
      }
    }
    // C: sand rain every 3.5s
    if (this._sp2.sand >= 3.5) {
      this._sp2.sand = 0;
      for (const side of [-1, 1]) {
        const cx = game.player.x + side * (20 + Math.random() * 40);
        for (let j = 0; j < 6; j++) {
          game.enemyBullets.push(new Bullet({
            x: cx + (j - 2.5) * 10, y: -8,
            angle: Math.PI / 2, speed: 1.4,
            kind: 'bullet.sand_grain', r: 3,
          }));
        }
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
    const key = (this.phase === 'p4_spell2' || this.phase === 'spell_declare' && this.spellName.includes('昨日'))
      ? 'boss.shizuku_spell' : 'boss.shizuku';
    drawSprite(ctx, key, this.x, this.y, this.w, this.h);
    if (this.phase === 'p4_spell2' && this.mirrors) {
      for (const m of this.mirrors) {
        drawSprite(ctx, 'boss.shizuku_mirror', m.x, m.y, this.w * 0.9, this.h * 0.9, 0, 0.45);
      }
    }
  }
}
