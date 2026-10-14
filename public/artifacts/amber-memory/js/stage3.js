const DIALOG_S3_PRE = [
  { who: '灵梦', text: '这里的石阶怎么回事，每走三步就会退回一步？' },
  { who: '珠', text: '止步！前方乃「琥珀庭园」的临时关所。巫女小姐，按账面显示，你今天早上喝的那杯茶，茶叶是三天前用光的那罐吧？' },
  { who: '灵梦', text: '哈？那是因为罐子莫名其妙又变满了……等等，我的三枚铜钱也是你们扣下的？！' },
  { who: '珠', text: '那是「未结清的时间呆账」！我家大人正在山顶修补幻想乡遗失的账目，闲杂人等若想通行，需抵押三年份的夏天记忆！' },
  { who: '灵梦', text: '去你的三年份夏天，连三个铜板我都不会留给你们！' },
];
const DIALOG_S3_POST = [
  { who: '珠', text: '算盘珠……算盘珠被打散架了！账目要乱套啦！' },
  { who: '灵梦', text: '什么修补账目，我看是趁乱打劫才对。山顶那扇亮着金光的门就是老巢了吧？' },
];

function spawnBead(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 75, kind: 'enemy.bead_sprite', w: 26, h: 26, r: 11, score: 550,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}
function spawnSlip(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 95, kind: 'enemy.ledger_slip', w: 22, h: 30, r: 12, score: 900,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}

class Stage3Director {
  constructor(game) {
    this.g = game; this.t = 0; this.done = {}; this.phase = 'mid';
    this.kickT = 0; this.kicksLeft = 0;
  }
  reset() { this.t = 0; this.done = {}; this.phase = 'mid'; this.kickT = 0; this.kicksLeft = 0; }
  update(dt) {
    if (this.phase !== 'mid') return;
    this.t += dt;
    const g = this.g;

    // scroll kick pulses
    if (this.kicksLeft > 0) {
      this.kickT -= dt;
      g.scrollKick = -1;
      if (this.kickT <= 0) {
        this.kicksLeft--;
        this.kickT = this.kicksLeft > 0 ? 0.55 : 0;
        if (this.kicksLeft >= 0 && this.kickT > 0) {
          // upward beads on kick
          for (let i = 0; i < 8; i++) {
            g.enemyBullets.push(new Bullet({
              x: 40 + i * 40, y: H * 0.55, angle: -Math.PI / 2, speed: 1.3,
              kind: 'bullet.abacus_bead', r: 4,
            }));
          }
        }
      }
    } else {
      g.scrollKick = 0;
    }

    if (this.t >= 6 && !this.done.w1) {
      this.done.w1 = true;
      for (let i = 0; i < 6; i++) {
        const e = spawnBead(g, 50 + i * 55, -20);
        e._i = i; e._holdY = H * 0.3; e._dir = 1; e._swap = 0;
        e.move = (en, d) => {
          if (en.y < en._holdY) en.y += 1.6 * 60 * d;
          else {
            en._swap += d;
            en.x += en._dir * 1.4 * 60 * d;
            if (en._swap > 1.2) { en._dir *= -1; en._swap = 0; en._volley = true; }
          }
        };
        e.fireCd = 0.3;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.y < en._holdY) return;
          if (en._volley) {
            en._volley = false;
            game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: Math.PI / 2, speed: 2.0, kind: 'bullet.abacus_bead' }));
          }
          if (en.fireCd > 0) return;
          en.fireCd = 0.9;
          game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: Math.PI / 2, speed: 2.0, kind: 'bullet.abacus_bead' }));
        };
      }
    }

    if (this.t >= 18 && !this.done.w2) {
      this.done.w2 = true;
      this._w2n = 8; this._w2cd = 0;
    }
    if (this.done.w2 && this._w2n > 0) {
      this._w2cd -= dt;
      if (this._w2cd <= 0) {
        this._w2cd = 0.7; this._w2n--;
        const e = spawnSlip(g, 60 + Math.random() * (W - 120), -20);
        e.move = (en, d) => {
          en.y += 1.1 * 60 * d;
          en.x += Math.sin(en.age * 2) * 1.5 * 60 * d;
        };
        e.fireCd = 0.5;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.2;
          const a = angTo(en.x, en.y, game.player.x, game.player.y);
          game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: a, speed: 2.0, kind: 'bullet.debt_seal', r: 5 }));
        };
        e.onDeath = function (game) {
          emitFan(game.enemyBullets, this.x, this.y, Math.PI / 2, 4, 25, 2.2, 'bullet.tally_rod');
        };
      }
    }

    if (this.t >= 32 && !this.done.w3) {
      this.done.w3 = true;
      this.kicksLeft = 3; this.kickT = 0.05;
      for (let i = 0; i < 5; i++) {
        const e = spawnBead(g, 70 + i * 55, -15);
        e.move = (en, d) => { en.y += 1.4 * 60 * d; };
        e.shoot = aimFanShoot(1, 0, 2.0, 'bullet.abacus_bead', 0.8);
      }
      for (let i = 0; i < 3; i++) {
        const e = spawnSlip(g, 80 + i * 100, -25);
        e.move = (en, d) => { en.y += 1.0 * 60 * d; };
        e.onDeath = function (game) { emitFan(game.enemyBullets, this.x, this.y, Math.PI / 2, 4, 25, 2.2, 'bullet.tally_rod'); };
      }
    }

    if (this.t >= 48 && !this.done.w4) {
      this.done.w4 = true;
      for (let col = 0; col < 2; col++) {
        for (let i = 0; i < 5; i++) {
          const x = col === 0 ? 50 : W - 50;
          const e = spawnBead(g, x, -10 - i * 28);
          e.move = (en, d) => { en.y += 1.2 * 60 * d; };
          e.fireCd = i * 0.15;
          e.shoot = function (en, d, game) {
            en.fireCd -= d;
            if (en.fireCd > 0) return;
            en.fireCd = 0.85;
            const a = col === 0 ? 0.3 : Math.PI - 0.3;
            game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: a, speed: 1.8, kind: 'bullet.abacus_bead' }));
          };
        }
      }
    }

    if (this.t >= 64 && !this.done.w5) {
      this.done.w5 = true;
      const corners = [[60, 60], [W - 60, 60], [60, 160], [W - 60, 160]];
      for (const [x, y] of corners) {
        const e = spawnSlip(g, x, -20);
        e._ty = y;
        e.move = (en, d) => {
          if (en.y < en._ty) en.y += 2 * 60 * d;
          else {
            en._wait = (en._wait || 0) + d;
            if (en._wait > 1.2) { en.alive = false; en.onDeath && en.onDeath(g); }
          }
        };
        e.onDeath = function (game) {
          emitRing(game.enemyBullets, this.x, this.y, 8, 2.0, 'bullet.gold_coin', this.age, { spin: deg(20) });
        };
      }
    }

    if (this.t >= 78 && !this.done.w6) {
      this.done.w6 = true;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        const e = spawnBead(g, W / 2 + Math.cos(a) * 140, H * 0.18 + Math.sin(a) * 40);
        e._a = a;
        e.move = (en, d) => {
          en._a += d * 0.5;
          const rad = Math.max(20, 140 - en.age * 30);
          en.x = W / 2 + Math.cos(en._a) * rad;
          en.y = H * 0.2 + Math.sin(en._a) * rad * 0.35;
        };
        e.fireCd = 0.4;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.4;
          emitRing(game.enemyBullets, en.x, en.y, 12, 1.9, 'bullet.abacus_bead', en._a);
        };
      }
      for (let i = 0; i < 4; i++) {
        const e = spawnSlip(g, 50 + i * 90, -15);
        e.move = (en, d) => { en.y += 1.15 * 60 * d; };
        e.fireCd = 0.3;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.0;
          game.enemyBullets.push(new Bullet({
            x: en.x, y: en.y, angle: angTo(en.x, en.y, game.player.x, game.player.y),
            speed: 2.1, kind: 'bullet.debt_seal', r: 5,
          }));
        };
      }
    }

    if (this.t >= 92 && !this.done.boss) {
      if (g.enemies.length === 0 || this.t >= 102) {
        this.done.boss = true; this.phase = 'boss';
        g.enemies.length = 0; g.scrollKick = 0;
        g.startBoss3();
      }
    }
  }
}

class BossTama {
  constructor() {
    this.x = W / 2; this.y = -40; this.targetY = H * 0.2;
    this.hp = 1400; this.maxHp = 1400; this.r = 32; this.alive = true;
    this.phase = 'enter'; this.age = 0; this.phaseAge = 0; this.moveT = 0;
    this.w = 68; this.h = 80; this.invuln = true;
    this.name = '算盘 珠'; this.spellName = ''; this.timeLimit = 0;
    this.safeBands = []; this.invertFlash = 0; this.invertOdd = false;
  }
  setPhase(p, hp, limit) {
    this.phase = p; this.phaseAge = 0;
    this.hp = hp; this.maxHp = hp; this.timeLimit = limit || 0;
    this.invuln = (p === 'enter' || p === 'dialog' || p === 'spell_declare');
  }
  update(dt, game) {
    this.age += dt; this.phaseAge += dt; this.moveT += dt;
    if (this.invertFlash > 0) this.invertFlash -= dt;
    if (this.phase === 'enter') {
      this.y += (this.targetY - this.y) * Math.min(1, 3 * dt);
      if (Math.abs(this.y - this.targetY) < 2) { this.y = this.targetY; game.startDialog3(); }
      return;
    }
    if (this.phase === 'dialog' || this.phase === 'spell_declare') return;

    if (this.phase === 'p1_nonspell') {
      this.x = W / 2 + Math.sin(this.moveT / 3 * Math.PI * 2) * (W * 0.32);
      this.y = H * 0.2; this.ns1(dt, game);
    } else if (this.phase === 'p2_spell1') {
      const t = this.moveT * 0.55;
      this.x = W / 2 + Math.sin(t) * 45;
      this.y = H * 0.18 + Math.abs(Math.sin(t * 1.5)) * 20;
      this.sp1(dt, game);
    } else if (this.phase === 'p3_nonspell2') {
      this.x = W / 2 + Math.sin(this.moveT / 2.5 * Math.PI * 2) * (W * 0.3);
      this.y = H * 0.22; this.ns2(dt, game);
    } else if (this.phase === 'p4_spell2') {
      this.x = W / 2 + Math.sin(this.moveT * 0.4) * 50;
      this.y = H * 0.18; this.sp2(dt, game);
    } else if (this.phase === 'p5_spell3') {
      this.x = W / 2 + Math.sin(this.moveT * 0.5) * 40;
      this.y = H * 0.2; this.sp3(dt, game);
    }
    if (this.timeLimit > 0 && this.phaseAge >= this.timeLimit) game.onBoss3Timeout();
  }
  ns1(dt, game) {
    if (!this._a) this._a = { col: 0, aim: 0 };
    this._a.col += dt; this._a.aim += dt;
    if (this._a.col >= 0.85) {
      this._a.col = 0;
      for (let i = 0; i < 5; i++) {
        game.enemyBullets.push(new Bullet({
          x: this.x - 20 + i * 10, y: this.y + 20, angle: Math.PI / 2, speed: 2.1, kind: 'bullet.abacus_bead',
        }));
      }
    }
    if (this._a.aim >= 3.0) {
      this._a.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 5, 13, 2.4, 'bullet.tally_rod');
    }
  }
  sp1(dt, game) {
    if (!this._s1) this._s1 = { ring: 0.5, rod: 0, wave: 0 };
    this._s1.ring += dt; this._s1.rod += dt;
    if (this._s1.ring >= 1.8) {
      this._s1.ring = 0;
      const gapStart = deg((this._s1.wave * 72) % 360);
      this._s1.wave++;
      emitRingGap(game.enemyBullets, this.x, this.y, 20, 1.5, 'bullet.abacus_bead', gapStart, 54, { r: 4 });
    }
    if (this._s1.rod >= 1.2) {
      this._s1.rod = 0;
      game.enemyBullets.push(new Bullet({ x: 20, y: this.y, angle: 0, speed: 2.0, kind: 'bullet.tally_rod', reflect: 1, r: 3 }));
      game.enemyBullets.push(new Bullet({ x: W - 20, y: this.y, angle: Math.PI, speed: 2.0, kind: 'bullet.tally_rod', reflect: 1, r: 3 }));
    }
  }
  ns2(dt, game) {
    if (!this._n2) this._n2 = { beat: 0, n: 0 };
    this._n2.beat += dt;
    if (this._n2.beat >= 2.5) {
      this._n2.beat = 0; this._n2.n++;
      if (this._n2.n % 2 === 1) {
        // 贷: stationary seal near player then chase
        const b = new Bullet({
          x: game.player.x + (Math.random() - 0.5) * 60,
          y: game.player.y - 40, vx: 0, vy: 0,
          kind: 'bullet.debt_seal', r: 6, life: 2.5,
        });
        b.custom = (bb, d, g) => {
          if (bb.age > 0.8 && bb.age < 2.0) {
            const a = angTo(bb.x, bb.y, g.player.x, g.player.y);
            bb.vx = Math.cos(a) * 2.6; bb.vy = Math.sin(a) * 2.6;
          }
        };
        game.enemyBullets.push(b);
      } else {
        // 借: suck then burst
        for (const b of game.enemyBullets) {
          if (!b.hostile || !b.alive) continue;
          const a = angTo(b.x, b.y, this.x, this.y);
          b.vx = Math.cos(a) * 1.5; b.vy = Math.sin(a) * 1.5;
        }
        const ox = this.x, oy = this.y;
        game.queueEcho(0.6, () => {
          emitRing(game.enemyBullets, ox, oy, 10, 2.2, 'bullet.gold_coin');
        });
      }
    }
  }
  sp2(dt, game) {
    if (!this._s2) this._s2 = { rain: 0, debt: 0 };
    this._s2.rain += dt; this._s2.debt += dt;
    // coin rain
    if (this._s2.rain >= 0.35) {
      this._s2.rain = 0;
      const col = Math.floor(Math.random() * 5);
      game.enemyBullets.push(new Bullet({
        x: 45 + col * 90, y: -8, angle: Math.PI / 2, speed: 1.2, kind: 'bullet.gold_coin', r: 5,
      }));
    }
    if (this._s2.debt >= 4.0) {
      this._s2.debt = 0;
      // 5 safe bands
      this.safeBands = [];
      for (let i = 0; i < 5; i++) {
        this.safeBands.push(40 + Math.random() * (W - 80));
      }
      this.invuln = true;
      game.queueEcho(0.3, () => { if (game.boss === this) this.invuln = false; });
      this.x = 60 + Math.random() * (W - 120);
      // grid of seals outside bands (Normal: band 44px, ~20% sparser)
      for (let gx = 0; gx < 6; gx++) {
        for (let gy = 0; gy < 8; gy++) {
          if ((gx + gy) % 5 === 0) continue; // ~20% skip
          const x = 30 + gx * ((W - 60) / 5);
          const y = 80 + gy * 40;
          let safe = false;
          for (const bx of this.safeBands) {
            if (Math.abs(x - bx) < 22) { safe = true; break; }
          }
          if (safe) continue;
          game.enemyBullets.push(new Bullet({
            x, y, vx: 0, vy: 0, kind: 'bullet.debt_seal', r: 5, life: 0.9,
          }));
        }
      }
      game.queueEcho(1.0, () => { this.safeBands = []; });
    }
  }
  sp3(dt, game) {
    if (!this._s3) this._s3 = { bar: 0, aim: 0, section: 0 };
    this._s3.bar += dt; this._s3.aim += dt;
    const split = H * 0.38;
    if (this._s3.bar >= 1.75) {
      this.invertFlash = 0.25;
    }
    if (this._s3.bar >= 2.0) {
      this._s3.bar = 0;
      this._s3.section++;
      this.invertOdd = (this._s3.section % 2 === 1);
      // fire beads in zones
      for (let i = 0; i < 6; i++) {
        const x = 40 + i * 55;
        // heaven
        const down = !this.invertOdd;
        game.enemyBullets.push(new Bullet({
          x, y: down ? 40 : split - 10,
          angle: down ? Math.PI / 2 : -Math.PI / 2,
          speed: 1.6, kind: i % 2 ? 'bullet.gold_coin' : 'bullet.abacus_bead',
        }));
        // earth
        const up = !this.invertOdd;
        game.enemyBullets.push(new Bullet({
          x: x + 20, y: up ? H - 40 : split + 10,
          angle: up ? -Math.PI / 2 : Math.PI / 2,
          speed: 1.6, kind: i % 2 ? 'bullet.abacus_bead' : 'bullet.gold_coin',
        }));
      }
    }
    if (this._s3.aim >= 2.0) {
      this._s3.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 12, 2.3, 'bullet.tally_rod');
    }
  }
  hurt(dmg) {
    if (this.invuln) return false;
    this.hp -= dmg;
    if (this.hp <= 0) { this.hp = 0; return true; }
    return false;
  }
  draw(ctx) {
    const key = (this.phase.startsWith('p2') || this.phase.startsWith('p4') || this.phase.startsWith('p5') || this.phase === 'spell_declare')
      ? 'boss.tama_spell' : 'boss.tama';
    drawSprite(ctx, key, this.x, this.y, this.w, this.h);
    // safe bands
    if (this.safeBands && this.safeBands.length) {
      for (const bx of this.safeBands) {
        ctx.fillStyle = 'rgba(212,168,75,0.22)';
        ctx.fillRect(bx - 22, 60, 44, H - 80);
        ctx.strokeStyle = 'rgba(232,163,23,0.7)';
        ctx.strokeRect(bx - 22, 60, 44, H - 80);
      }
    }
    // invert line
    if (this.phase === 'p5_spell3') {
      const split = H * 0.38;
      ctx.strokeStyle = this.invertFlash > 0 ? '#E8A317' : 'rgba(245,215,142,0.35)';
      ctx.lineWidth = this.invertFlash > 0 ? 3 : 1;
      ctx.beginPath(); ctx.moveTo(0, split); ctx.lineTo(W, split); ctx.stroke();
    }
  }
}
