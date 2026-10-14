/* Stage 5 — 斩断流光的白银之剪 · 久远寺琥珀 */
const DIALOG_S5_PRE = [
  { who: '琥珀', text: '站住，人类。再往前一步，你的双脚就会和三千万年前的露水一样，永远定格在地板上。' },
  { who: '灵梦', text: '巨木上的虫子也会讲话？我赶着去把金雨关掉，让开。' },
  { who: '琥珀', text: '砍了它？正是因为外面的世界不断迎来「明天」，旧的事物才会不断死去！我家主上从太古的沉睡中醒来，好不容易才决定用神木的树液将整个幻想乡温柔地包覆起来——' },
  { who: '灵梦', text: '把大家都变成琥珀里的虫子也叫温柔？果然只有虫子才会这么想！' },
  { who: '琥珀', text: '愚昧的蜉蝣！就让我用这双琥珀之镰，把你那急躁的「现在」修剪干净吧！' },
];
const DIALOG_S5_POST = [
  { who: '琥珀', text: '咳……双镰居然出现了裂痕……这就是活在「当下」的人类的蛮力吗……' },
  { who: '灵梦', text: '树液收一收。下一站——你那位主上吧？' },
];

function spawnPetal(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 80, kind: 'enemy.petal_drone', w: 28, h: 28, r: 11, score: 650,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}
function spawnMite(game, x, y, opts) {
  const e = new Enemy(Object.assign({
    x, y, hp: 100, kind: 'enemy.resin_mite', w: 26, h: 26, r: 12, score: 900,
  }, opts || {}));
  game.enemies.push(e);
  return e;
}

function pushSlowZone(game, x, y, r, life) {
  if (!game.slowZones) game.slowZones = [];
  game.slowZones.push({ x, y, r: r || 36, life: life || 2.5, age: 0 });
}

class Stage5Director {
  constructor(game) {
    this.g = game; this.t = 0; this.done = {}; this.phase = 'mid';
  }
  reset() { this.t = 0; this.done = {}; this.phase = 'mid'; }
  update(dt) {
    if (this.phase !== 'mid') return;
    this.t += dt;
    const g = this.g;
    if (!g.slowZones) g.slowZones = [];

    if (this.t >= 6 && !this.done.w1) {
      this.done.w1 = true;
      for (let i = 0; i < 8; i++) {
        const e = spawnPetal(g, -20 - i * 18, 70 + (i % 4) * 40);
        e.move = (en, d) => { en.x += 2.2 * 60 * d; en.y += Math.sin(en.age * 3) * 20 * d; };
        e.fireCd = 0.3;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 0.95;
          game.enemyBullets.push(new Bullet({
            x: en.x, y: en.y, angle: 0.15, speed: 2.1, kind: 'bullet.petal_slash', r: 4,
          }));
        };
        e.onDeath = function (game) {
          emitFan(game.enemyBullets, this.x, this.y, 0, 4, 40, 1.8, 'bullet.petal_slash');
        };
      }
    }

    if (this.t >= 18 && !this.done.w2) {
      this.done.w2 = true;
      for (let i = 0; i < 6; i++) {
        const side = i % 2;
        const e = spawnMite(g, side ? 30 : W - 30, -20 - i * 22);
        e._side = side;
        e.move = (en, d) => {
          en.y += 1.2 * 60 * d;
          en.x += (side ? 1 : -1) * 0.4 * 60 * d;
        };
        e.fireCd = 0.8;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.4;
          pushSlowZone(game, en.x, en.y + 10, 36, 2.5);
          if (Math.random() < 0.45) {
            const a = angTo(en.x, en.y, game.player.x, game.player.y);
            game.enemyBullets.push(new Bullet({
              x: en.x, y: en.y, angle: a, speed: 1.8, kind: 'bullet.resin_blob', r: 5,
            }));
          }
        };
      }
    }

    if (this.t >= 32 && !this.done.w3) {
      this.done.w3 = true;
      for (let i = 0; i < 6; i++) {
        const e = spawnPetal(g, 50 + i * 55, -15);
        e.move = (en, d) => { en.y += 1.4 * 60 * d; };
        e.shoot = aimFanShoot(1, 0, 2.1, 'bullet.petal_slash', 0.85);
      }
      for (let i = 0; i < 4; i++) {
        const e = spawnMite(g, 40 + i * 90, -30);
        e.move = (en, d) => { en.y += 1.1 * 60 * d; };
        e.onDeath = function (game) { pushSlowZone(game, this.x, this.y, 40, 2.2); };
      }
    }

    if (this.t >= 48 && !this.done.w4) {
      this.done.w4 = true;
      for (let col = 0; col < 2; col++) {
        for (let i = 0; i < 5; i++) {
          const x = col === 0 ? W / 2 - 65 : W / 2 + 65;
          const e = spawnPetal(g, x, -10 - i * 26);
          e.move = (en, d) => { en.y += 1.25 * 60 * d; };
          e.fireCd = i * 0.1;
          e.shoot = function (en, d, game) {
            en.fireCd -= d;
            if (en.fireCd > 0) return;
            en.fireCd = 1.0;
            const a = col === 0 ? 0 : Math.PI;
            game.enemyBullets.push(new Bullet({
              x: en.x, y: en.y, angle: a, speed: 2.0, kind: 'bullet.silver_shear', r: 5,
            }));
          };
        }
      }
    }

    if (this.t >= 64 && !this.done.w5) {
      this.done.w5 = true;
      this._rainN = 5; this._rainCd = 0;
    }
    if (this.done.w5 && this._rainN > 0) {
      this._rainCd -= dt;
      if (this._rainCd <= 0) {
        this._rainCd = 2.4; this._rainN--;
        for (let i = 0; i < 5; i++) {
          const x = 40 + i * 70;
          g.enemyBullets.push(new Bullet({
            x, y: -10, angle: Math.PI / 2, speed: 1.4, kind: 'bullet.resin_blob', r: 5,
          }));
          const mite = spawnMite(g, x, -40);
          mite.move = (en, d) => { en.y += 1.3 * 60 * d; };
          mite.onDeath = function (game) { pushSlowZone(game, this.x, this.y, 36, 2.5); };
        }
      }
    }

    if (this.t >= 80 && !this.done.w6) {
      this.done.w6 = true;
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        const e = spawnPetal(g, W / 2 + Math.cos(a) * 120, H * 0.2 + Math.sin(a) * 45);
        e._a = a;
        e.move = (en, d) => {
          en._a += d * 0.5;
          const rad = Math.max(30, 120 - en.age * 25);
          en.x = W / 2 + Math.cos(en._a) * rad;
          en.y = H * 0.22 + Math.sin(en._a) * rad * 0.4;
        };
        e.fireCd = 0.4;
        e.shoot = function (en, d, game) {
          en.fireCd -= d;
          if (en.fireCd > 0) return;
          en.fireCd = 1.3;
          emitRing(game.enemyBullets, en.x, en.y, 6, 1.8, 'bullet.scythe_arc', en._a);
        };
      }
      for (let i = 0; i < 4; i++) {
        const e = spawnMite(g, 70 + i * 80, -20);
        e.move = (en, d) => { en.y += 1.15 * 60 * d; };
        e.onDeath = function (game) {
          emitRing(game.enemyBullets, this.x, this.y, 8, 1.6, 'bullet.resin_blob');
          pushSlowZone(game, this.x, this.y, 42, 2.0);
        };
      }
    }

    if (this.t >= 95 && !this.done.boss) {
      if (g.enemies.length === 0 || this.t >= 105) {
        this.done.boss = true;
        this.phase = 'boss';
        g.enemies.length = 0;
        g.startBoss5();
      }
    }
  }
}

class BossKohaku {
  constructor() {
    this.x = W / 2; this.y = -40; this.targetY = H * 0.2;
    this.hp = 1600; this.maxHp = 1600; this.r = 32; this.alive = true;
    this.phase = 'enter'; this.age = 0; this.phaseAge = 0; this.moveT = 0;
    this.w = 70; this.h = 82; this.invuln = true;
    this.name = '久远寺 琥珀'; this.spellName = ''; this.timeLimit = 0;
    this.shearCorridors = []; // {x,y,nx,ny,len,halfW,age,life,warn}
    this.captureBoxes = []; // {x,y,age,fired}
    this.cageCells = []; // grid points
    this.cageAge = 0; this.cageLife = 0;
    this.bonsai = null; // {x,y,r}
    this.warnLines = [];
  }
  setPhase(p, hp, limit) {
    this.phase = p; this.phaseAge = 0;
    this.hp = hp; this.maxHp = hp; this.timeLimit = limit || 0;
    this.invuln = (p === 'enter' || p === 'dialog' || p === 'spell_declare');
    this.shearCorridors = []; this.captureBoxes = [];
    this.cageCells = []; this.cageAge = 0; this.cageLife = 0;
    this.bonsai = null; this.warnLines = [];
  }
  update(dt, game) {
    this.age += dt; this.phaseAge += dt; this.moveT += dt;
    if (this.phase === 'enter') {
      this.y += (this.targetY - this.y) * Math.min(1, 3 * dt);
      if (Math.abs(this.y - this.targetY) < 2) {
        this.y = this.targetY;
        game.startDialog5();
      }
      return;
    }
    if (this.phase === 'dialog' || this.phase === 'spell_declare') return;

    if (this.phase === 'p1_nonspell') {
      this.x = W / 2 + Math.sin(this.moveT / 3.2 * Math.PI * 2) * (W * 0.32);
      this.y = H * 0.2; this.ns1(dt, game);
    } else if (this.phase === 'p2_spell1') {
      this.sp1(dt, game);
    } else if (this.phase === 'p3_nonspell2') {
      this.x = W / 2 + Math.sin(this.moveT / 2.8 * Math.PI * 2) * (W * 0.28);
      this.y = H * 0.2; this.ns2(dt, game);
    } else if (this.phase === 'p4_spell2') {
      this.sp2(dt, game);
    } else if (this.phase === 'p5_spell3') {
      this.x = W / 2 + Math.sin(this.moveT * 0.5) * 80;
      this.y = H * 0.18; this.sp3(dt, game);
    } else if (this.phase === 'p6_spell4') {
      this.sp4(dt, game);
    }
    if (this.timeLimit > 0 && this.phaseAge >= this.timeLimit) game.onBoss5Timeout();
  }
  ns1(dt, game) {
    if (!this._a) this._a = { arc: 0, aim: 0, side: 0 };
    this._a.arc += dt; this._a.aim += dt;
    if (this._a.arc >= 1.0) {
      this._a.arc = 0;
      this._a.side = 1 - this._a.side;
      const base = this._a.side ? -0.6 : Math.PI + 0.6;
      for (let i = 0; i < 5; i++) {
        const a = base + (i - 2) * deg(12);
        game.enemyBullets.push(new Bullet({
          x: this.x + (this._a.side ? -20 : 20), y: this.y + 10,
          angle: a, speed: 2.0, kind: 'bullet.scythe_arc', r: 5,
        }));
      }
    }
    if (this._a.aim >= 3.0) {
      this._a.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      emitFan(game.enemyBullets, this.x, this.y, a, 3, 12, 2.2, 'bullet.petal_slash');
    }
  }
  sp1(dt, game) {
    // 剪切走廊
    if (!this._s1) this._s1 = { beat: 0.5, flow: 0 };
    this._s1.beat += dt; this._s1.flow += dt;
    for (const c of this.shearCorridors) c.age += dt;
    // promote warn → live corridor BEFORE filtering
    for (const c of this.shearCorridors) {
      if (c.warn && c.age >= 0.5) {
        c.warn = false; c.age = 0; c.life = 2.2;
      }
    }
    // expire → burst
    const dying = this.shearCorridors.filter(c => !c.warn && c.age >= c.life);
    for (const c of dying) {
      for (let i = 0; i < 8; i++) {
        const tt = (i / 7) * c.len - c.len / 2;
        const px = c.x + c.tx * tt;
        const py = c.y + c.ty * tt;
        game.enemyBullets.push(new Bullet({
          x: px, y: py, angle: Math.atan2(c.ny, c.nx) + (i % 2 ? 0 : Math.PI),
          speed: 2.0, kind: 'bullet.silver_shear', r: 5,
        }));
      }
    }
    this.shearCorridors = this.shearCorridors.filter(c => c.warn || c.age < c.life);
    if (this._s1.beat >= 3.0) {
      this._s1.beat = 0;
      const ang = Math.random() * Math.PI; // corridor direction along
      const tx = Math.cos(ang), ty = Math.sin(ang);
      const nx = -ty, ny = tx; // normal
      const cx = W * 0.25 + Math.random() * W * 0.5;
      const cy = H * 0.3 + Math.random() * H * 0.35;
      this.shearCorridors.push({
        x: cx, y: cy, tx, ty, nx, ny, len: 280, halfW: 26, age: 0, life: 2.2, warn: true,
      });
      // boss near endpoint
      this.x = Math.max(40, Math.min(W - 40, cx + tx * 80));
      this.y = Math.max(H * 0.15, Math.min(H * 0.4, cy + ty * 40));
    }
    // flow bullets on both sides
    if (this._s1.flow >= 0.18) {
      this._s1.flow = 0;
      for (const c of this.shearCorridors) {
        if (c.warn) continue;
        const t = (Math.random() - 0.5) * c.len;
        const side = Math.random() < 0.5 ? 1 : -1;
        const ox = c.x + c.tx * t + c.nx * side * (c.halfW + 14);
        const oy = c.y + c.ty * t + c.ny * side * (c.halfW + 14);
        const flowAng = Math.atan2(c.ny * side, c.nx * side);
        game.enemyBullets.push(new Bullet({
          x: ox, y: oy, angle: flowAng, speed: 1.6, kind: 'bullet.petal_slash', r: 4,
        }));
      }
    }
  }
  ns2(dt, game) {
    if (!this._n2) this._n2 = { beat: 0, mode: 0 };
    this._n2.beat += dt;
    if (this._n2.beat >= 1.6) {
      this._n2.beat = 0;
      this._n2.mode = 1 - this._n2.mode;
      if (this._n2.mode === 0) {
        // crossed scythes
        const a0 = angTo(this.x, this.y, game.player.x, game.player.y);
        for (let i = 0; i < 7; i++) {
          game.enemyBullets.push(new Bullet({
            x: this.x, y: this.y, angle: a0 - 0.9 + i * 0.25, speed: 2.0, kind: 'bullet.scythe_arc', r: 5,
          }));
        }
        game.queueEcho(0.3, () => {
          for (let i = 0; i < 7; i++) {
            game.enemyBullets.push(new Bullet({
              x: this.x, y: this.y, angle: a0 + 0.9 - i * 0.25, speed: 2.0, kind: 'bullet.scythe_arc', r: 5,
            }));
          }
        });
      } else {
        for (let col = 0; col < 3; col++) {
          game.enemyBullets.push(new Bullet({
            x: 60 + col * 120, y: -10, angle: Math.PI / 2, speed: 1.5, kind: 'bullet.resin_blob', r: 5,
          }));
        }
      }
    }
  }
  sp2(dt, game) {
    // 捕捉框
    if (!this._s2) this._s2 = { cap: 0, rain: 0, blink: 0 };
    this._s2.cap += dt; this._s2.rain += dt; this._s2.blink += dt;
    if (!game.playerHistory) game.playerHistory = [];
    game.playerHistory.push({ x: game.player.x, y: game.player.y });
    if (game.playerHistory.length > 60) game.playerHistory.shift();

    for (const b of this.captureBoxes) b.age += dt;
    const fire = this.captureBoxes.filter(b => !b.fired && b.age >= 0.45);
    for (const b of fire) {
      b.fired = true;
      emitRing(game.enemyBullets, b.x, b.y, 12, 2.0, 'bullet.scythe_arc');
    }
    this.captureBoxes = this.captureBoxes.filter(b => b.age < 0.7);

    if (this._s2.cap >= 2.6) {
      this._s2.cap = 0;
      let px = game.player.x, py = game.player.y;
      if (game.playerHistory.length > 14) {
        const h = game.playerHistory[game.playerHistory.length - 15];
        px = h.x; py = h.y;
      }
      this.captureBoxes.push({ x: px, y: py, age: 0, fired: false, s: 50 });
    }
    if (this._s2.rain >= 0.35) {
      this._s2.rain = 0;
      game.enemyBullets.push(new Bullet({
        x: 20 + Math.random() * (W - 40), y: -8, angle: Math.PI / 2, speed: 1.1, kind: 'bullet.petal_slash', r: 4,
      }));
    }
    if (this._s2.blink >= 3.5) {
      this._s2.blink = 0;
      this.x = 50 + Math.random() * (W - 100);
      this.y = H * 0.18 + Math.random() * 30;
    }
  }
  sp3(dt, game) {
    // 牢笼格
    if (!this._s3) this._s3 = { grid: 0.5, aim: 0 };
    this._s3.grid += dt; this._s3.aim += dt;
    if (this.cageLife > 0) {
      this.cageAge += dt;
      if (this.cageAge >= this.cageLife) {
        // shatter
        for (const cell of this.cageCells) {
          for (let k = 0; k < 2; k++) {
            const a = Math.random() * Math.PI * 2;
            game.enemyBullets.push(new Bullet({
              x: cell.x, y: cell.y, angle: a, speed: 1.7, kind: 'bullet.resin_blob', r: 5,
            }));
          }
        }
        this.cageCells = []; this.cageLife = 0;
      }
    }
    if (this._s3.grid >= 4.0) {
      this._s3.grid = 0;
      this.cageCells = [];
      this.cageAge = 0; this.cageLife = 2.8;
      const cols = 3, rows = 3, gap = 70;
      const ox = W / 2 - ((cols - 1) * gap) / 2;
      const oy = H * 0.35 - ((rows - 1) * gap) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          this.cageCells.push({ x: ox + c * gap, y: oy + r * gap });
        }
      }
      // rail bullets along grid lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const x0 = ox + c * gap, x1 = ox + (c + 1) * gap, y = oy + r * gap;
          for (let t = 0; t < 5; t++) {
            const x = x0 + (x1 - x0) * (t / 4);
            game.enemyBullets.push(new Bullet({
              x, y, vx: 0, vy: 0, kind: 'bullet.amber_cage', r: 4, life: 2.8,
            }));
          }
        }
      }
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 1; r++) {
          const y0 = oy + r * gap, y1 = oy + (r + 1) * gap, x = ox + c * gap;
          for (let t = 0; t < 5; t++) {
            const y = y0 + (y1 - y0) * (t / 4);
            game.enemyBullets.push(new Bullet({
              x, y, vx: 0, vy: 0, kind: 'bullet.amber_cage', r: 4, life: 2.8,
            }));
          }
        }
      }
      // occasional slow in cell centers
      if (this.cageCells[4]) pushSlowZone(game, this.cageCells[4].x, this.cageCells[4].y, 28, 2.0);
    }
    if (this._s3.aim >= 2.0) {
      this._s3.aim = 0;
      const a = angTo(this.x, this.y, game.player.x, game.player.y);
      game.enemyBullets.push(new Bullet({
        x: this.x, y: this.y, angle: a, speed: 2.3, kind: 'bullet.silver_shear', r: 5,
      }));
    }
  }
  sp4(dt, game) {
    // 盆景缩圈
    if (!this.bonsai) {
      this.bonsai = { x: W / 2, y: H * 0.48, r: 110 };
      this._s4 = { shrink: 0, ring: 0, cross: 0 };
    }
    this._s4.shrink += dt; this._s4.ring += dt; this._s4.cross += dt;
    this.bonsai.x = W / 2 + Math.sin(this.moveT * 0.3) * 20;
    // boss on rim
    const ang = this.moveT * 0.8;
    this.x = this.bonsai.x + Math.cos(ang) * this.bonsai.r;
    this.y = this.bonsai.y + Math.sin(ang) * this.bonsai.r * 0.55;
    this.y = Math.max(H * 0.15, Math.min(H * 0.42, this.y));

    if (this._s4.shrink >= 5.0) {
      this._s4.shrink = 0;
      this.bonsai.r = Math.max(55, this.bonsai.r * 0.85);
      emitRing(game.enemyBullets, this.bonsai.x, this.bonsai.y, 16, 1.5, 'bullet.scythe_arc');
    }
    // outside ring stream
    if (this._s4.ring >= 0.22) {
      this._s4.ring = 0;
      const a = Math.random() * Math.PI * 2;
      const rr = this.bonsai.r + 30 + Math.random() * 80;
      const px = this.bonsai.x + Math.cos(a) * rr;
      const py = this.bonsai.y + Math.sin(a) * rr;
      // tangential
      game.enemyBullets.push(new Bullet({
        x: px, y: py, angle: a + Math.PI / 2, speed: 1.4, kind: 'bullet.petal_slash', r: 4,
      }));
    }
    if (this._s4.cross >= 2.4) {
      this._s4.cross = 0;
      game.enemyBullets.push(new Bullet({
        x: this.x - 15, y: this.y, angle: 0, speed: 2.2, kind: 'bullet.silver_shear', r: 5,
      }));
      game.enemyBullets.push(new Bullet({
        x: this.x + 15, y: this.y, angle: Math.PI, speed: 2.2, kind: 'bullet.silver_shear', r: 5,
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
    const spell = /^(p2|p4|p5|p6)/.test(this.phase) || this.phase === 'spell_declare';
    drawSprite(ctx, spell ? 'boss.kohaku_spell' : 'boss.kohaku', this.x, this.y, this.w, this.h);

    // shear corridors
    for (const c of this.shearCorridors) {
      ctx.save();
      const ang = Math.atan2(c.ty, c.tx);
      ctx.translate(c.x, c.y);
      ctx.rotate(ang);
      if (c.warn) {
        ctx.strokeStyle = 'rgba(192,200,212,0.7)';
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2;
        ctx.strokeRect(-c.len / 2, -c.halfW, c.len, c.halfW * 2);
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = 'rgba(240,193,74,0.28)';
        ctx.fillRect(-c.len / 2, -c.halfW, c.len, c.halfW * 2);
        ctx.strokeStyle = 'rgba(192,200,212,0.85)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-c.len / 2, -c.halfW, c.len, c.halfW * 2);
      }
      ctx.restore();
    }

    // capture diamonds
    for (const b of this.captureBoxes) {
      const a = Math.min(1, b.age / 0.45);
      const s = b.s * (1.3 - a * 0.3);
      ctx.strokeStyle = `rgba(111,155,106,${0.4 + a * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - s);
      ctx.lineTo(b.x + s, b.y);
      ctx.lineTo(b.x, b.y + s);
      ctx.lineTo(b.x - s, b.y);
      ctx.closePath();
      ctx.stroke();
    }

    // cage cell markers
    if (this.cageLife > 0) {
      for (const cell of this.cageCells) {
        ctx.strokeStyle = 'rgba(212,137,10,0.35)';
        ctx.strokeRect(cell.x - 20, cell.y - 20, 40, 40);
      }
    }

    // bonsai island
    if (this.bonsai) {
      ctx.fillStyle = 'rgba(212,137,10,0.12)';
      ctx.beginPath();
      ctx.arc(this.bonsai.x, this.bonsai.y, this.bonsai.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(240,193,74,0.75)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
