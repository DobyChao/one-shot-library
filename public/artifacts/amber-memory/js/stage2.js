const DIALOG_S2_PRE = [
  { who: '灵梦', text: '真是吵死了，从刚才开始耳边就一直有人在喊「烤白薯烤糊了」。' },
  { who: '响子', text: '「烤白薯烤糊了——！」啊哈哈，那是去年秋天穣子大人的惨叫哦，听起来还是那么清脆！' },
  { who: '灵梦', text: '是你这家伙在搞鬼吗？快把这片林子的静音键按下去。' },
  { who: '响子', text: '怎么会是我呢！是天上掉下来的金雨把整座山的「年轮」都泡软了，树干里存了几十年的老话全都溢出来啦！' },
  { who: '灵梦', text: '那就把你连人带树一起敲结实一点！' },
];
const DIALOG_S2_POST = [
  { who: '响子', text: '痛痛痛……连我三年前撞到树枝的痛觉都被敲出来了……' },
  { who: '灵梦', text: '前面就是废弃的旧参道了吧？琥珀雨越来越密了，得抓紧时间。' },
];

function spawnKodama(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 70, kind: 'enemy.kodama_echo', w: 28, h: 28, r: 12, score: 600,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}
function spawnShadow(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 110, kind: 'enemy.shadow_self', w: 30, h: 40, r: 14, score: 1200,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}

class Stage2Director {
  constructor(game) {
    this.g = game;
    this.t = 0;
    this.done = {};
    this.phase = 'mid';
  }
  reset() { this.t = 0; this.done = {}; this.phase = 'mid'; }
  update(dt) {
    if (this.phase !== 'mid') return;
    this.t += dt;
    const g = this.g;

    if (this.t >= 5 && !this.done.w1) {
      this.done.w1 = true;
      for (let i = 0; i < 7; i++) {
        const x = 40 + i * 48;
        const e = spawnKodama(g, x, -20);
        e._holdY = H * 0.28;
        e.move = (en, d) => {
          if (en.y < en._holdY) en.y += 1.7 * 60 * d;
          else {
            en._hold = (en._hold || 0) + d;
            if (en._hold > 1) en.y += 2 * 60 * d;
          }
        };
        e.fireCd = 0.2 + i * 0.08;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 0.7;
          const a = angTo(en.x, en.y, game.player.x, game.player.y);
          emitFan(game.enemyBullets, en.x, en.y, a, 1, 0, 2.1, 'bullet.echo_orb');
          if (en._hold > 0 && en._hold < 1) {
            game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: Math.PI, speed: 2.0, kind: 'bullet.echo_orb', reflect: 1 }));
            game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: 0, speed: 2.0, kind: 'bullet.echo_orb', reflect: 1 }));
          }
        };
      }
    }

    if (this.t >= 16 && !this.done.w2) {
      this.done.w2 = true;
      for (let i = 0; i < 3; i++) {
        const L = spawnKodama(g, 18, -10 - i * 30);
        L.move = (en, d) => { en.y += 1.5 * 60 * d; };
        L.fireCd = 0.4;
        L.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 0.9;
          game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: 0.15, speed: 2.0, kind: 'bullet.echo_orb', reflect: 1 }));
        };
        const R = spawnKodama(g, W - 18, -20 - i * 30);
        R.move = (en, d) => { en.y += 1.5 * 60 * d; };
        R.fireCd = 0.6;
        R.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 0.9;
          game.enemyBullets.push(new Bullet({ x: en.x, y: en.y, angle: Math.PI - 0.15, speed: 2.0, kind: 'bullet.echo_orb', reflect: 1 }));
        };
      }
    }

    if (this.t >= 28 && !this.done.w3) {
      this.done.w3 = true;
      for (let i = 0; i < 3; i++) {
        const e = spawnShadow(g, 80 + i * 100, -30);
        e.move = (en, d) => {
          en.y += 0.9 * 60 * d;
          en.x += Math.sin(en.age * 1.2 + i) * 1.2 * 60 * d;
        };
        e.onDeath = function (game) {
          emitRing(game.enemyBullets, this.x, this.y, 6, 1.8, 'bullet.echo_wave');
        };
      }
    }

    if (this.t >= 42 && !this.done.w4) {
      this.done.w4 = true;
      this._w4wall = 0;
      for (let i = 0; i < 6; i++) {
        const e = spawnKodama(g, 60 + i * 50, -15);
        e.move = (en, d) => { en.y += 1.3 * 60 * d; };
        e.fireCd = 0.3;
        e.shoot = aimFanShoot(3, 15, 1.9, 'bullet.echo_orb', 0.75);
      }
      for (let i = 0; i < 2; i++) {
        const e = spawnShadow(g, i ? W - 70 : 70, -20);
        e.move = (en, d) => { en.y += 0.85 * 60 * d; };
        e.onDeath = function (game) { emitRing(game.enemyBullets, this.x, this.y, 6, 1.8, 'bullet.echo_wave'); };
      }
    }
    if (this.done.w4 && this.t < 58) {
      this._w4wall += dt;
      if (this._w4wall >= 2.5) {
        this._w4wall = 0;
        for (let i = 0; i < 4; i++) {
          g.enemyBullets.push(new Bullet({ x: 8, y: 80 + i * 60, angle: 0, speed: 2.0, kind: 'bullet.echo_orb', reflect: 1 }));
          g.enemyBullets.push(new Bullet({ x: W - 8, y: 100 + i * 60, angle: Math.PI, speed: 2.0, kind: 'bullet.echo_orb', reflect: 1 }));
        }
      }
    }

    if (this.t >= 58 && !this.done.w5) {
      this.done.w5 = true;
      this._w5n = 12; this._w5cd = 0;
    }
    if (this.done.w5 && this._w5n > 0) {
      this._w5cd -= dt;
      if (this._w5cd <= 0) {
        this._w5cd = 0.45; this._w5n--;
        const e = spawnKodama(g, 40, -15);
        e.move = (en, d) => {
          const seg = Math.floor(en.age / 1.0) % 3;
          if (seg === 0) { en.x += 3 * 60 * d; en.y += 1.5 * 60 * d; }
          else if (seg === 1) { en.x -= 3 * 60 * d; en.y += 1.2 * 60 * d; }
          else { en.x += 2.5 * 60 * d; en.y += 1.6 * 60 * d; }
        };
        e.fireCd = 0.15;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 0.5;
          const fwd = Math.atan2(1.2, en.x > W / 2 ? -1 : 1);
          emitFan(game.enemyBullets, en.x, en.y, fwd, 2, 18, 2.4, 'bullet.echo_wave');
        };
      }
    }

    if (this.t >= 72 && !this.done.w6) {
      this.done.w6 = true;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        const e = spawnKodama(g, W / 2 + Math.cos(a) * 150, H * 0.18 + Math.sin(a) * 50);
        e._a = a;
        e.move = (en, d) => {
          en._a += d * 0.45;
          const rad = Math.max(24, 150 - en.age * 35);
          en.x = W / 2 + Math.cos(en._a) * rad;
          en.y = H * 0.2 + Math.sin(en._a) * rad * 0.4;
        };
        e.fireCd = 0.4;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.5;
          emitRing(game.enemyBullets, en.x, en.y, 10, 1.9, 'bullet.echo_orb', en._a);
        };
      }
      for (let i = 0; i < 3; i++) {
        const e = spawnShadow(g, 70 + i * 110, -15);
        e.move = (en, d) => { en.y += 1.1 * 60 * d; en.x += Math.sin(en.age + i) * 0.8 * 60 * d; };
        e.onDeath = function (game) { emitRing(game.enemyBullets, this.x, this.y, 6, 1.8, 'bullet.echo_wave'); };
      }
    }

    if (this.t >= 85 && !this.done.boss) {
      if (g.enemies.length === 0 || this.t >= 95) {
        this.done.boss = true;
        this.phase = 'boss';
        g.enemies.length = 0;
        g.startBoss2();
      }
    }
  }
}

class BossKyouko {
  constructor() {
    this.x = W / 2; this.y = -40;
    this.targetY = H * 0.2;
    this.hp = 1300; this.maxHp = 1300;
    this.r = 30; this.alive = true;
    this.phase = 'enter';
    this.age = 0; this.phaseAge = 0; this.moveT = 0;
    this.w = 64; this.h = 76;
    this.invuln = true;
    this.name = '木灵 响子';
    this.spellName = '';
    this.timeLimit = 0;
    this.mirrors = null;
    this.shadowAlly = null;
    this.shadowSummons = 0;
  }
  setPhase(p, hp, limit) {
    this.phase = p; this.phaseAge = 0;
    this.hp = hp; this.maxHp = hp;
    this.timeLimit = limit || 0;
    this.invuln = (p === 'enter' || p === 'dialog' || p === 'spell_declare');
  }
  update(dt, game) {
    this.age += dt; this.phaseAge += dt; this.moveT += dt;
    if (this.phase === 'enter') {
      this.y += (this.targetY - this.y) * Math.min(1, 3 * dt);
      if (Math.abs(this.y - this.targetY) < 2) {
        this.y = this.targetY;
        game.startDialog2();
      }
      return;
    }
    if (this.phase === 'dialog' || this.phase === 'spell_declare') return;

    if (this.phase === 'p1_nonspell') {
      this.x = W / 2 + Math.sin(this.moveT / 3.5 * Math.PI * 2) * (W * 0.3);
      this.y = H * 0.2 + Math.sin(this.moveT / 2.2) * 10;
      this.ns1(dt, game);
    } else if (this.phase === 'p2_spell1') {
      this.x = W / 2 + Math.sin(this.moveT * 0.5) * 30;
      this.y = H * 0.18;
      this.sp1(dt, game);
    } else if (this.phase === 'p3_nonspell2') {
      this.x = W / 2 + Math.sin(this.moveT / 2.8 * Math.PI * 2) * (W * 0.34);
      this.y = H * 0.22 + Math.sin(this.moveT) * 12;
      this.ns2(dt, game);
    } else if (this.phase === 'p4_spell2') {
      this.x = W / 2 + Math.cos(this.moveT * 0.8) * 28;
      this.y = H * 0.2 + Math.sin(this.moveT * 0.8) * 16;
      this.sp2(dt, game);
    } else if (this.phase === 'p5_spell3') {
      this.x = W / 2 + Math.sin(this.moveT * 0.6) * 40;
      this.y = H * 0.2;
      this.sp3(dt, game);
    }

    if (this.timeLimit > 0 && this.phaseAge >= this.timeLimit) game.onBoss2Timeout();
  }
  ns1(dt, game) {
    if (!this._a) this._a = { ring: 0, aim: 0 };
    this._a.ring += dt; this._a.aim += dt;
    if (this._a.ring >= 1.0) {
      this._a.ring = 0;
      const bullets = [];
      emitRing(bullets, this.x, this.y, 14, 1.7, 'bullet.echo_orb');
      // random 4 reflect
      const idx = [...Array(14).keys()].sort(() => Math.random() - 0.5).slice(0, 4);
      bullets.forEach((b, i) => { if (idx.includes(i)) b.reflect = 1; game.enemyBullets.push(b); });
    }
    if (this._a.aim >= 3.2) {
      this._a.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 12, 2.5, 'bullet.echo_wave');
    }
  }
  sp1(dt, game) {
    if (!this._s1) this._s1 = { fan: 0.8, rain: 0 };
    this._s1.fan += dt; this._s1.rain += dt;
    if (this._s1.fan >= 1.6) {
      this._s1.fan = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      const ox = this.x, oy = this.y, aim = a;
      emitFan(game.enemyBullets, ox, oy, aim, 7, 40 / 3, 2.0, 'bullet.echo_orb');
      // delayed echo 1.0s later same origin
      game.queueEcho(1.0, () => {
        emitFan(game.enemyBullets, ox, oy, aim, 7, 40 / 3, 2.0 * 0.9, 'bullet.echo_orb', { alpha: 0.45, reflect: 0 });
      });
    }
    if (this._s1.rain >= 2.8) {
      this._s1.rain = 0;
      const side = Math.random() < 0.5 ? W * 0.2 : W * 0.8;
      for (let i = 0; i < 5; i++) {
        game.enemyBullets.push(new Bullet({
          x: side + (i - 2) * 11, y: -8, angle: Math.PI / 2, speed: 1.5, kind: 'bullet.echo_orb',
        }));
      }
    }
  }
  ns2(dt, game) {
    if (!this._n2) this._n2 = { beat: 0, n: 0 };
    this._n2.beat += dt;
    if (this._n2.beat >= 1.4) {
      this._n2.beat = 0;
      this._n2.n++;
      if (this._n2.n % 2 === 1) {
        for (let i = 0; i < 5; i++) {
          game.enemyBullets.push(new Bullet({ x: 10, y: 60 + i * 50, angle: 0, speed: 2.2, kind: 'bullet.echo_orb', reflect: 1 }));
          game.enemyBullets.push(new Bullet({ x: W - 10, y: 80 + i * 50, angle: Math.PI, speed: 2.2, kind: 'bullet.echo_orb', reflect: 1 }));
        }
      } else {
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 2 + (i - 2.5) * 0.12;
          game.enemyBullets.push(new Bullet({
            x: this.x, y: this.y, angle: a, speed: 1.3, kind: 'bullet.ring_year', r: 6, spin: deg(40),
          }));
        }
      }
    }
  }
  sp2(dt, game) {
    if (!this._s2) this._s2 = { ring: 0, layers: [], aim: 0, gap: 0 };
    this._s2.ring += dt; this._s2.aim += dt; this._s2.gap += deg(22) * dt;
    // spawn layers
    if (this._s2.ring >= 2.2) {
      this._s2.ring = 0;
      this._s2.layers.push({ t: 0, gap0: this._s2.gap });
      if (this._s2.layers.length > 3) this._s2.layers.shift();
      const gap0 = this._s2.gap;
      // stagger via delay 0 within same burst - emit now; multi-layer from accumulated
      emitRingGap(game.enemyBullets, this.x, this.y, 24, 1.1, 'bullet.ring_year', gap0, 40, { r: 4 });
    }
    if (this._s2.aim >= 4.0) {
      this._s2.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y) + Math.PI; // from opposite of gap approx
      emitFan(game.enemyBullets, this.x, this.y, angTo(this.x, this.y, game.player.x, game.player.y), 1, 0, 2.4, 'bullet.echo_wave');
    }
  }
  sp3(dt, game) {
    if (!this._s3) {
      this._s3 = { boss: 0, sh: 0.9, rage: 0 };
      this.ensureShadow(game);
    }
    if (this._s3.rage > 0) {
      this._s3.rage -= dt;
      if (Math.floor(this._s3.rage * 2) !== Math.floor((this._s3.rage + dt) * 2)) {
        const bullets = [];
        emitRing(bullets, this.x, this.y, 16, 2.0, 'bullet.echo_orb');
        bullets.forEach((b, i) => { if (i % 2 === 0) b.reflect = 1; game.enemyBullets.push(b); });
      }
    }
    this._s3.boss += dt; this._s3.sh += dt;
    // mirror shadow position
    if (this.shadowAlly && this.shadowAlly.alive) {
      this.shadowAlly.x = W - this.x;
      this.shadowAlly.y = this.y;
    } else if (this.shadowAlly && !this.shadowAlly.alive) {
      this.shadowAlly = null;
      if (this.shadowSummons < 3) {
        this._s3.rage = 4;
        this.ensureShadow(game);
      }
    }
    if (this._s3.boss >= 1.8) {
      this._s3.boss = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 5, 10, 2.1, 'bullet.duet_note');
    }
    if (this.shadowAlly && this.shadowAlly.alive && this._s3.sh >= 1.8) {
      this._s3.sh = 0;
      const old = (game.playerHistory && game.playerHistory.length)
        ? game.playerHistory[0]
        : { x: game.player.x, y: game.player.y };
      // use ~0.6s delayed
      let best = { x: game.player.x, y: game.player.y };
      if (game.playerHistory) {
        const target = (game.boss && game.boss.phaseAge || this.phaseAge) - 0.6;
        for (const p of game.playerHistory) if (p.t <= target) best = p;
      }
      const a = angTo(this.shadowAlly.x, this.shadowAlly.y, best.x, best.y);
      emitFan(game.enemyBullets, this.shadowAlly.x, this.shadowAlly.y, a, 5, 10, 2.1, 'bullet.duet_note');
    }
    // history
    if (!game.playerHistory) game.playerHistory = [];
    game.playerHistory.push({ x: game.player.x, y: game.player.y, t: this.phaseAge });
    while (game.playerHistory.length && this.phaseAge - game.playerHistory[0].t > 1.2) game.playerHistory.shift();
  }
  ensureShadow(game) {
    if (this.shadowSummons >= 3) return;
    this.shadowSummons++;
    const e = spawnShadow(game, W - this.x, this.y, { hp: 200 });
    e.isAlly = true;
    this.shadowAlly = e;
  }
  hurt(dmg) {
    if (this.invuln) return false;
    this.hp -= dmg;
    if (this.hp <= 0) { this.hp = 0; return true; }
    return false;
  }
  draw(ctx) {
    const key = (this.phase === 'p2_spell1' || this.phase === 'p4_spell2' || this.phase === 'p5_spell3')
      ? 'boss.kyouko_spell' : 'boss.kyouko';
    drawSprite(ctx, key, this.x, this.y, this.w, this.h);
  }
}
