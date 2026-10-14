/* Stage 1 wave timeline from STAGE1_SLICE.md */
const DIALOG_PRE = [
  { who: '灵梦', text: '连湖面都被这种亮晶晶的垃圾铺满了，踩上去黏糊糊的。' },
  { who: '雫', text: '哇，请不要踩碎它们！这一颗是红魔馆门卫昨天下午三点的呼噜声，很罕见的成色呢！' },
  { who: '灵梦', text: '原来是你在到处乱撒这种奇怪的糖块？' },
  { who: '雫', text: '我只是拾荒的啦！山上的源头漏了，老旧的沙漏要是不趁机多装一点「过去」，到了冬天就会彻底停下来的！' },
  { who: '灵梦', text: '不管是漏了还是停了，先把你打倒，再去山上堵窟窿！' },
];

const DIALOG_POST = [
  { who: '雫', text: '呜哇——葫芦里的呼噜声全洒出来了……' },
  { who: '灵梦', text: '所以说，这些结晶是从妖怪之山的瀑布上游冲下来的？' },
  { who: '雫', text: '是的……就在九天瀑布更上面的旧参道附近，有一棵从来没见过的白色大树正在开花呢。' },
];

function spawnFairy(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 60, kind: 'enemy.fairy_amber', w: 28, h: 28, r: 12, score: 500,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}

function spawnRipple(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 90, kind: 'enemy.spirit_ripple', w: 32, h: 32, r: 14, score: 800,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}

function aimFanShoot(count, spread, speed, kind, cd) {
  return function (e, dt, game) {
    e.fireCd -= dt;
    if (e.fireCd > 0) return;
    e.fireCd = cd;
    const a = angTo(e.x, e.y, game.player.x, game.player.y);
    emitFan(game.enemyBullets, e.x, e.y, a, count, spread, speed, kind);
  };
}

class Stage1Director {
  constructor(game) {
    this.g = game;
    this.t = 0;
    this.done = {};
    this.phase = 'mid'; // mid → boss_wait → boss
    this.clearForce = false;
  }
  reset() {
    this.t = 0; this.done = {}; this.phase = 'mid'; this.clearForce = false;
  }
  update(dt) {
    if (this.phase !== 'mid') return;
    this.t += dt;
    const g = this.g;

    // particles gold rain handled in game draw

    // w1 4–14: 6 fairies horizontal line
    if (this.t >= 4 && !this.done.w1) {
      this.done.w1 = true;
      for (let i = 0; i < 6; i++) {
        const x = 48 + i * ((W - 96) / 5);
        const e = spawnFairy(g, x, -20);
        e._holdY = H * 0.3;
        e.move = (en, d) => {
          if (en.y < en._holdY) en.y += 1.8 * 60 * d;
          else {
            en._hold = (en._hold || 0) + d;
            if (en._hold > 1.2) en.y += 2.2 * 60 * d;
          }
        };
        e.fireCd = 0.3 + i * 0.1;
        e.shoot = aimFanShoot(3, 18, 2.2, 'bullet.amber_dot', 0.45);
      }
    }

    // w2 14–26: ripples from sides
    if (this.t >= 14 && !this.done.w2) {
      this.done.w2 = true;
      for (let i = 0; i < 4; i++) {
        const left = spawnRipple(g, -20, 60 + i * 40);
        left.move = (en, d) => {
          en.x += 2.0 * 60 * d;
          en.y += Math.sin(en.age * 2 + i) * 0.8 * 60 * d;
        };
        left.fireCd = 0.5;
        left.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.4;
          
          // predict lightly
          const tx = game.player.x + (Math.random() - 0.5) * 30;
          const ty = game.player.y;
          game.enemyBullets.push(new Bullet({
            x: tx, y: ty, vx: 0, vy: 0, kind: 'bullet.water_ring',
            r: 12, grow: 20, maxR: 48, life: 1.8, hostile: true,
          }));
        };
        const right = spawnRipple(g, W + 20, 80 + i * 40);
        right.move = (en, d) => {
          en.x -= 2.0 * 60 * d;
          en.y += Math.sin(en.age * 2 + i + 1) * 0.8 * 60 * d;
        };
        right.fireCd = 0.8;
        right.shoot = left.shoot;
      }
    }

    // w3 26–38: Z-path fairy stream
    if (this.t >= 26 && !this.done.w3) {
      this.done.w3 = true;
      this._w3left = 10; this._w3cd = 0;
    }
    if (this.done.w3 && this._w3left > 0) {
      this._w3cd -= dt;
      if (this._w3cd <= 0) {
        this._w3cd = 0.55;
        this._w3left--;
        const idx = 10 - this._w3left;
        const e = spawnFairy(g, 40, -15);
        e._idx = idx;
        e.move = (en, d) => {
          const seg = Math.floor(en.age / 1.2) % 3;
          if (seg === 0) { en.x += 2.5 * 60 * d; en.y += 1.2 * 60 * d; }
          else if (seg === 1) { en.x -= 2.5 * 60 * d; en.y += 1.0 * 60 * d; }
          else { en.x += 2.2 * 60 * d; en.y += 1.4 * 60 * d; }
        };
        e.fireCd = 0.2;
        e.shoot = aimFanShoot(1, 0, 2.8, 'bullet.amber_rice', 0.55);
      }
    }

    // w4 38–52 mix
    if (this.t >= 38 && !this.done.w4) {
      this.done.w4 = true;
      for (let i = 0; i < 4; i++) {
        const e = spawnFairy(g, 80 + i * 70, -20);
        e.vy = 1.5;
        e.move = (en, d) => { en.y += 1.5 * 60 * d; };
        e.fireCd = 0.4;
        e.shoot = aimFanShoot(3, 16, 2.0, 'bullet.amber_dot', 0.7);
      }
      for (let i = 0; i < 3; i++) {
        const side = i % 2 === 0 ? -20 : W + 20;
        const e = spawnRipple(g, side, 100 + i * 50);
        e.move = (en, d) => {
          en.x += (side < 0 ? 1.6 : -1.6) * 60 * d;
        };
        e.fireCd = 0.6;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.1;
          const cx = en.x;
          for (let j = 0; j < 5; j++) {
            game.enemyBullets.push(new Bullet({
              x: cx - 40 + j * 20, y: en.y,
              angle: Math.PI / 2, speed: 1.6,
              kind: 'bullet.sand_grain', r: 3,
            }));
          }
        };
      }
    }

    // w5 52–62 breather
    if (this.t >= 52 && !this.done.w5) {
      this.done.w5 = true;
      for (let i = 0; i < 3; i++) {
        const e = spawnFairy(g, 100 + i * 90, -20);
        e.move = (en, d) => { en.y += 1.2 * 60 * d; };
        e.fireCd = 0.8;
        e.shoot = aimFanShoot(1, 0, 1.8, 'bullet.amber_dot', 0.9);
      }
    }

    // w6 62–75 preboss ring
    if (this.t >= 62 && !this.done.w6) {
      this.done.w6 = true;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        const e = spawnFairy(g, W / 2 + Math.cos(a) * 160, H * 0.15 + Math.sin(a) * 60);
        e._a = a;
        e.move = (en, d) => {
          en._a += d * 0.4;
          const rad = Math.max(20, 160 - en.age * 40);
          en.x = W / 2 + Math.cos(en._a) * rad;
          en.y = H * 0.2 + Math.sin(en._a) * rad * 0.45;
        };
        e.fireCd = 0.5 + i * 0.05;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.6;
          emitRing(game.enemyBullets, en.x, en.y, 8, 1.9, 'bullet.amber_dot', en._a);
          const aim = angTo(en.x, en.y, game.player.x, game.player.y);
          emitFan(game.enemyBullets, en.x, en.y, aim, 1, 0, 2.4, 'bullet.amber_rice');
        };
      }
      for (let i = 0; i < 2; i++) {
        const e = spawnRipple(g, i === 0 ? 60 : W - 60, -10);
        e.move = (en, d) => { en.y += 1.4 * 60 * d; };
        e.shoot = aimFanShoot(1, 0, 2.0, 'bullet.water_ring', 1.2);
      }
    }

    // boss enter at 75
    if (this.t >= 75 && !this.done.boss) {
      // wait clear or force
      if (g.enemies.length === 0 || this.t >= 82) {
        this.done.boss = true;
        this.phase = 'boss';
        g.enemies.length = 0;
        g.startBoss();
      }
    }
  }
}
