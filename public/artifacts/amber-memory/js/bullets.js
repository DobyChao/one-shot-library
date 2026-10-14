const W = 384, H = 448;

function treatOn() {
  try { return new URLSearchParams(location.search).get('treat') === '1'; } catch (e) { return false; }
}

/** Difficulty multipliers. Treat overrides Normal/Simple. */
function diffMul() {
  if (treatOn()) return { speed: 0.55, count: 0.5, fairyHp: 0.6, playerDmg: 1.5 };
  try {
    if (new URLSearchParams(location.search).get('simple') === '1')
      return { speed: 0.7, count: 0.7, fairyHp: 0.75, playerDmg: 1 };
    return { speed: 0.85, count: 0.85, fairyHp: 0.9, playerDmg: 1 };
  } catch (e) {
    return { speed: 0.85, count: 0.85, fairyHp: 0.9, playerDmg: 1 };
  }
}

function deg(d) { return d * Math.PI / 180; }
function angTo(x0, y0, x1, y1) { return Math.atan2(y1 - y0, x1 - x0); }
function len(vx, vy) { return Math.hypot(vx, vy) || 1; }

class Bullet {
  constructor(opts) {
    Object.assign(this, {
      x: 0, y: 0, vx: 0, vy: 0,
      speed: 0, angle: 0,
      r: 4, hostile: true, alive: true,
      kind: 'bullet.amber_dot',
      life: Infinity, age: 0,
      ax: 0, ay: 0,
      spin: 0,
      custom: null,
      grow: 0,
      maxR: 0,
      grazeOnce: false,
      reflect: 0, // remaining wall bounces (L/R only)
      alpha: 1,
    }, opts);
    if (opts.speed != null && opts.angle != null) {
      this.vx = Math.cos(opts.angle) * this.speed;
      this.vy = Math.sin(opts.angle) * this.speed;
    }
    if (this.hostile) {
      const m = diffMul().speed;
      if (m !== 1) {
        this.speed *= m;
        this.vx *= m;
        this.vy *= m;
      }
    }
  }
  update(dt, game) {
    this.age += dt;
    if (this.custom) this.custom(this, dt, game);
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;
    if (this.spin) {
      const sp = len(this.vx, this.vy);
      let a = Math.atan2(this.vy, this.vx) + this.spin * dt;
      this.vx = Math.cos(a) * sp;
      this.vy = Math.sin(a) * sp;
    }
    if (this._frozen) { /* held for last-spell freeze */ }
    else {
    this.x += this.vx * 60 * dt;
    this.y += this.vy * 60 * dt;
    }
    if (this.grow) {
      this.r += this.grow * dt;
      if (this.maxR && this.r > this.maxR) this.alive = false;
    }
    // wall reflect L/R
    if (this.reflect > 0) {
      if (this.x < this.r) { this.x = this.r; this.vx = Math.abs(this.vx); this.reflect--; }
      else if (this.x > W - this.r) { this.x = W - this.r; this.vx = -Math.abs(this.vx); this.reflect--; }
    }
    if (this.age > this.life) this.alive = false;
    // top/bottom always destroy (no vertical bounce)
    if (this.y < -40 || this.y > H + 40) this.alive = false;
    if (this.reflect <= 0 && (this.x < -40 || this.x > W + 40)) this.alive = false;
  }
  draw(ctx) {
    const size = Math.max(8, this.r * 2.4);
    drawSprite(ctx, this.kind, this.x, this.y, size, size, Math.atan2(this.vy, this.vx) + Math.PI / 2, this.alpha);
  }
}

function emitFan(list, x, y, aimAng, count, spreadDeg, speed, kind, extra) {
  const mul = diffMul().count;
  count = Math.max(1, Math.ceil(count * mul));
  const half = (count - 1) / 2;
  for (let i = 0; i < count; i++) {
    const a = aimAng + deg(spreadDeg) * (i - half);
    list.push(new Bullet(Object.assign({ x, y, angle: a, speed, kind, r: kind.includes('rice') || kind.includes('note') ? 3.5 : 4 }, extra || {})));
  }
}

function emitRing(list, x, y, count, speed, kind, baseAng, extra) {
  const mul = diffMul().count;
  count = Math.max(4, Math.ceil(count * mul));
  for (let i = 0; i < count; i++) {
    const a = (baseAng || 0) + (Math.PI * 2 * i) / count;
    list.push(new Bullet(Object.assign({ x, y, angle: a, speed, kind, r: 3.5 }, extra || {})));
  }
}

/** Ring with a gap arc (degrees) starting at gapStart rad */
function emitRingGap(list, x, y, count, speed, kind, baseAng, gapDeg, extra) {
  const mul = diffMul().count;
  count = Math.max(4, Math.ceil(count * mul));
  const gap = deg(gapDeg);
  for (let i = 0; i < count; i++) {
    const a = (baseAng || 0) + (Math.PI * 2 * i) / count;
    let d = (a - (baseAng || 0)) % (Math.PI * 2);
    if (d < 0) d += Math.PI * 2;
    if (d < gap) continue;
    list.push(new Bullet(Object.assign({ x, y, angle: a, speed, kind, r: 3.5 }, extra || {})));
  }
}
