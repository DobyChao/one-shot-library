'use strict';
/* ============================================================
 *  東方星塵録 ~ Star Dust Incident. — 程序化图形模块 gfx.js
 *  所有素材（角色/弹幕/道具/背景）均由代码实时绘制生成
 * ============================================================ */
window.FIELD = { x: 40, y: 20, w: 480, h: 680 };

const GFX = (() => {
  const F = window.FIELD;
  const TAU = Math.PI * 2;

  function mk(w, h, fn) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    fn(g, w, h);
    return c;
  }
  function poly(g, pts, fill, stroke, lw) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); }
  }
  function ell(g, x, y, rx, ry, fill, rot) {
    g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
    g.fillStyle = fill; g.fill();
  }
  function circ(g, x, y, r, fill) { ell(g, x, y, r, r, fill); }

  const PAL = {
    red: '#ff3c5a', orange: '#ff9c3c', yellow: '#ffe14d', lime: '#a8ff4d',
    green: '#3cff7a', cyan: '#4df2ff', blue: '#5d8bff', indigo: '#7b5cff',
    violet: '#c46bff', magenta: '#ff5cd6', pink: '#ff9cc8', white: '#f5f7ff',
    silver: '#cfd6ff', gold: '#ffd76b', peach: '#ffc9a3'
  };
  const hex2rgb = h => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  /* ---------------- 弹幕贴图（缓存） ---------------- */
  const bCache = {};
  function bulletSprite(shape, colKey) {
    const key = shape + '_' + colKey;
    if (bCache[key]) return bCache[key];
    const col = PAL[colKey] || colKey;
    const [cr, cg, cb] = hex2rgb(col);
    let c;
    if (shape === 'circle') {
      const R = 9;
      c = mk(48, 48, (g) => {
        const grd = g.createRadialGradient(24, 24, 2, 24, 24, 22);
        grd.addColorStop(0, `rgba(255,255,255,.95)`);
        grd.addColorStop(.35, `rgba(${cr},${cg},${cb},.95)`);
        grd.addColorStop(.7, `rgba(${cr},${cg},${cb},.35)`);
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        g.fillStyle = grd; g.beginPath(); g.arc(24, 24, 22, 0, TAU); g.fill();
        g.fillStyle = `rgba(${cr},${cg},${cb},1)`; g.beginPath(); g.arc(24, 24, 7.5, 0, TAU); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(23, 23, 4.2, 0, TAU); g.fill();
      });
    } else if (shape === 'big') {
      c = mk(64, 64, (g) => {
        const grd = g.createRadialGradient(32, 32, 3, 32, 32, 30);
        grd.addColorStop(0, `rgba(255,255,255,.95)`);
        grd.addColorStop(.3, `rgba(${cr},${cg},${cb},.9)`);
        grd.addColorStop(.65, `rgba(${cr},${cg},${cb},.3)`);
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        g.fillStyle = grd; g.beginPath(); g.arc(32, 32, 30, 0, TAU); g.fill();
        g.fillStyle = `rgba(${cr},${cg},${cb},1)`; g.beginPath(); g.arc(32, 32, 13, 0, TAU); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(30, 30, 7, 0, TAU); g.fill();
      });
    } else if (shape === 'rice') {
      c = mk(28, 40, (g) => {
        g.translate(14, 20);
        const grd = g.createRadialGradient(0, 0, 1, 0, 0, 18);
        grd.addColorStop(0, `rgba(255,255,255,.9)`);
        grd.addColorStop(.5, `rgba(${cr},${cg},${cb},.55)`);
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        g.fillStyle = grd; g.beginPath(); g.arc(0, 0, 18, 0, TAU); g.fill();
        ell(g, 0, 0, 6, 13, `rgba(${cr},${cg},${cb},1)`);
        ell(g, -1.2, -2, 3, 6.5, `rgba(255,255,255,.85)`);
      });
    } else if (shape === 'kunai') {
      c = mk(32, 44, (g) => {
        g.translate(16, 22);
        poly(g, [[0, -18], [7, 0], [3, 12], [-3, 12], [-7, 0]], `rgba(${cr},${cg},${cb},1)`, `rgba(255,255,255,.65)`, 1.5);
        poly(g, [[0, -13], [4, -1], [0, 6], [-4, -1]], 'rgba(255,255,255,.8)');
      });
    } else if (shape === 'star') {
      c = mk(48, 48, (g) => {
        g.translate(24, 24);
        const grd = g.createRadialGradient(0, 0, 2, 0, 0, 22);
        grd.addColorStop(0, `rgba(255,255,255,.9)`);
        grd.addColorStop(.6, `rgba(${cr},${cg},${cb},.3)`);
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        g.fillStyle = grd; g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.fill();
        g.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 7 : 15;
          g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath();
        g.fillStyle = `rgba(${cr},${cg},${cb},1)`; g.fill();
        g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.4; g.stroke();
      });
    } else if (shape === 'amulet') {
      c = mk(30, 40, (g) => {
        g.translate(15, 20);
        g.fillStyle = `rgba(255,255,255,.95)`;
        g.fillRect(-7, -12, 14, 24);
        g.strokeStyle = `rgba(${cr},${cg},${cb},1)`; g.lineWidth = 3;
        g.strokeRect(-7, -12, 14, 24);
        g.fillStyle = `rgba(${cr},${cg},${cb},.9)`;
        g.fillRect(-4, -9, 8, 3); g.fillRect(-4, 6, 8, 3);
      });
    } else { // bubble
      c = mk(52, 52, (g) => {
        g.beginPath(); g.arc(26, 26, 20, 0, TAU);
        g.fillStyle = `rgba(${cr},${cg},${cb},.22)`; g.fill();
        g.lineWidth = 4; g.strokeStyle = `rgba(${cr},${cg},${cb},.85)`; g.stroke();
        g.beginPath(); g.arc(26, 26, 20, -2.2, -1.1);
        g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2.4; g.stroke();
      });
    }
    bCache[key] = c;
    return c;
  }
  const BULLET_R = { circle: 7, big: 13, rice: 6, kunai: 7, star: 10, amulet: 7, bubble: 18 };

  /* ---------------- 道具贴图 ---------------- */
  const itemSprites = {};
  function itemSprite(type) {
    if (itemSprites[type]) return itemSprites[type];
    const c = mk(28, 28, (g) => {
      g.translate(14, 14);
      if (type === 'p' || type === 'P') {
        const s = type === 'P' ? 12 : 9;
        g.fillStyle = '#ff2e4c'; g.fillRect(-s, -s, s * 2, s * 2);
        g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(-s, -s, s * 2, s * 2);
        g.fillStyle = '#fff'; g.font = `bold ${type === 'P' ? 16 : 12}px sans-serif`;
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P', 0, 1);
      } else if (type === 'pt') {
        g.fillStyle = '#3b6fff'; g.fillRect(-9, -6, 18, 12);
        g.strokeStyle = '#bfe0ff'; g.lineWidth = 1.5; g.strokeRect(-9, -6, 18, 12);
        g.fillStyle = '#fff'; g.font = 'bold 8px sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('点', 0, .5);
      } else if (type === 'b') {
        g.fillStyle = '#2ec7ff'; g.fillRect(-10, -10, 20, 20);
        g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(-10, -10, 20, 20);
        g.fillStyle = '#fff'; g.font = 'bold 12px sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('符', 0, 1);
      } else if (type === 'l') {
        g.fillStyle = '#ff4da6'; g.beginPath(); g.arc(0, 0, 10, 0, TAU); g.fill();
        g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
        g.fillStyle = '#fff'; g.font = 'bold 9px sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('UP', 0, 1);
      } else { // star 碎星
        g.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 4.5 : 10;
          g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath(); g.fillStyle = '#ffe14d'; g.fill();
        g.strokeStyle = '#fff8d0'; g.lineWidth = 1.2; g.stroke();
      }
    });
    itemSprites[type] = c;
    return c;
  }

  /* ---------------- 角色绘制基础件 ---------------- */
  function hairBack(g, x, y, w, h, col, round) {
    g.fillStyle = col;
    g.beginPath();
    if (round) g.ellipse(x, y + h * .3, w, h * .65, 0, 0, TAU);
    else g.rect(x - w, y, w * 2, h);
    g.fill();
  }
  function drawPlayerBase(g, o) {
    // o: {hair, dress, dress2, acc}
    // 裙摆
    poly(g, [[32 - 15, 44], [32 + 15, 44], [32 + 22, 70], [32 - 22, 70]], o.dress, 'rgba(20,20,30,.55)', 2);
    poly(g, [[32 - 15, 44], [32 + 15, 44], [32 + 17, 52], [32 - 17, 52]], o.dress2);
    // 上身
    poly(g, [[32 - 9, 26], [32 + 9, 26], [32 + 13, 46], [32 - 13, 46]], o.top || '#f5f0e6', 'rgba(20,20,30,.5)', 1.5);
    // 袖子
    ell(g, 32 - 16, 36, 7, 11, o.sleeve || '#f5f0e6', -.4);
    ell(g, 32 + 16, 36, 7, 11, o.sleeve || '#f5f0e6', .4);
    // 后发
    hairBack(g, 32, 24, 13, o.hairLen || 26, o.hair, true);
    // 头
    circ(g, 32, 20, 10.5, '#ffe3cf');
    // 头饰
    if (o.acc) o.acc(g);
  }

  function reimuSprite() {
    return mk(64, 76, (g) => {
      // 背后大蝴蝶结
      g.fillStyle = '#e02040';
      poly(g, [[32, 12], [6, 2], [12, 20]], '#e02040');
      poly(g, [[32, 12], [58, 2], [52, 20]], '#e02040');
      circ(g, 32, 12, 4.5, '#b01030');
      drawPlayerBase(g, {
        hair: '#3a2a28', hairLen: 30, dress: '#e02040', dress2: '#c01838',
        acc: (g2) => { // 发间的红色发带
          g2.fillStyle = '#e02040';
          g2.fillRect(32 - 11, 12, 22, 3.5);
        }
      });
      // 白色袖口红线
      g.strokeStyle = '#e02040'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(32 - 20, 42); g.lineTo(32 - 12, 40); g.moveTo(32 + 20, 42); g.lineTo(32 + 12, 40); g.stroke();
    });
  }
  function marisaSprite() {
    return mk(64, 76, (g) => {
      // 扫帚
      g.save(); g.translate(32, 44); g.rotate(-.5);
      g.fillStyle = '#8a5a2a'; g.fillRect(-2.5, -34, 5, 52);
      poly(g, [[-7, 18], [7, 18], [11, 34], [-11, 34]], '#c8963c', 'rgba(60,40,10,.6)', 1.5);
      g.restore();
      drawPlayerBase(g, {
        hair: '#f2d06b', hairLen: 28, dress: '#241f2e', dress2: '#3a3350',
        top: '#241f2e', sleeve: '#f5f0e6',
        acc: (g2) => { // 女巫帽
          g2.fillStyle = '#1a1622';
          g2.beginPath(); g2.ellipse(32, 13, 20, 6.5, 0, 0, TAU); g2.fill();
          g2.beginPath(); g2.ellipse(32, 7, 10.5, 8, 0, Math.PI, TAU); g2.fill();
          g2.fillStyle = '#f5f0e6'; g2.fillRect(32 - 10.5, 9, 21, 4);
        }
      });
    });
  }

  /* ---- 立绘（对话用，正面） ---- */
  function faceParts(g, cx, cy, eyeCol, mouth) {
    // 眼睛
    g.fillStyle = '#fff';
    ell(g, cx - 6.5, cy, 3.4, 4.4, '#fff'); ell(g, cx + 6.5, cy, 3.4, 4.4, '#fff');
    ell(g, cx - 6, cy + .5, 2, 3, eyeCol); ell(g, cx + 6.9, cy + .5, 2, 3, eyeCol);
    circ(g, cx - 6.5, cy - 1.2, 1, '#fff'); circ(g, cx + 6.4, cy - 1.2, 1, '#fff');
    // 红晕
    g.fillStyle = 'rgba(255,130,130,.45)';
    ell(g, cx - 11, cy + 5, 3.6, 2, 'rgba(255,130,130,.45)');
    ell(g, cx + 11, cy + 5, 3.6, 2, 'rgba(255,130,130,.45)');
    // 嘴
    g.strokeStyle = '#b05050'; g.lineWidth = 1.6;
    g.beginPath();
    if (mouth === 'smile') g.arc(cx, cy + 7, 3.4, .15, Math.PI - .15);
    else if (mouth === 'open') { g.fillStyle = '#a04040'; ell(g, cx, cy + 8, 2.6, 3.4, '#a04040'); }
    else g.arc(cx, cy + 6.5, 3, .3, Math.PI - .3);
    g.stroke();
  }
  function portraitFrame(g) {
    g.fillStyle = 'rgba(8,10,26,.92)'; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(255,220,140,.8)'; g.lineWidth = 3; g.strokeRect(3, 3, 122, 122);
    g.strokeStyle = 'rgba(255,220,140,.25)'; g.lineWidth = 1; g.strokeRect(7, 7, 114, 114);
  }

  const portraits = {};
  function portrait(id) {
    if (portraits[id]) return portraits[id];
    const c = mk(128, 128, (g) => {
      portraitFrame(g);
      g.save(); g.translate(64, 4); g.scale(1.55, 1.55);
      drawPortraitBody(g, id);
      g.restore();
    });
    portraits[id] = c;
    return c;
  }
  function drawPortraitBody(g, id) {
    const cx = 0, cy = 42; // 头中心
    const skin = '#ffe3cf';
    const ch = CHAR_ART[id] || CHAR_ART.reimu;
    // 后发
    if (ch.backHair) { g.fillStyle = ch.backHair; g.beginPath(); g.ellipse(cx, cy + 20, 28, 42, 0, 0, TAU); g.fill(); }
    // 身体
    poly(g, [[-27, 128], [27, 128], [21, 82], [-21, 82]], ch.dress);
    if (ch.collar) poly(g, [[-14, 84], [14, 84], [8, 100], [-8, 100]], ch.collar);
    if (ch.shoulder) { ell(g, -21, 88, 8, 6, ch.shoulder); ell(g, 21, 88, 8, 6, ch.shoulder); }
    // 脸（加大，发际线抬高）
    circ(g, cx, cy, 24, skin);
    ell(g, cx, cy + 8, 16, 13, skin); // 下巴过渡
    // 刘海（只盖额头）
    g.fillStyle = ch.hair;
    g.beginPath();
    g.moveTo(cx - 24, cy + 1);
    g.quadraticCurveTo(cx - 26, cy - 22, cx, cy - 25);
    g.quadraticCurveTo(cx + 26, cy - 22, cx + 24, cy + 1);
    g.quadraticCurveTo(cx + 16, cy - 13, cx + 10, cy - 6);
    g.quadraticCurveTo(cx + 5, cy - 15, cx, cy - 7);
    g.quadraticCurveTo(cx - 5, cy - 15, cx - 10, cy - 6);
    g.quadraticCurveTo(cx - 16, cy - 13, cx - 24, cy + 1);
    g.fill();
    if (ch.sideLock) {
      ell(g, cx - 26, cy + 10, 5, 15, ch.hair, .15);
      ell(g, cx + 26, cy + 10, 5, 15, ch.hair, -.15);
    }
    faceParts(g, cx, cy + 2, ch.eye, ch.mouth);
    if (ch.acc) ch.acc(g, cx, cy);
  }

  const CHAR_ART = {
    reimu: {
      hair: '#3a2a28', backHair: '#3a2a28', dress: '#e02040', collar: '#f5f0e6',
      shoulder: '#f5f0e6', eye: '#a03030', mouth: 'smile', sideLock: true,
      acc: (g, cx, cy) => { // 红白发带
        g.fillStyle = '#e02040'; g.fillRect(cx - 22, cy - 16, 44, 5);
        poly(g, [[cx - 24, cy - 14], [cx - 36, cy - 22], [cx - 33, cy - 6]], '#e02040');
        poly(g, [[cx + 24, cy - 14], [cx + 36, cy - 22], [cx + 33, cy - 6]], '#e02040');
      }
    },
    marisa: {
      hair: '#f2d06b', backHair: '#e8c256', dress: '#241f2e', collar: '#f5f0e6',
      shoulder: '#241f2e', eye: '#3a8a4a', mouth: 'open', sideLock: true,
      acc: (g, cx, cy) => { // 帽子
        g.fillStyle = '#1a1622';
        g.beginPath(); g.ellipse(cx, cy - 24, 40, 11, 0, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(cx, cy - 32, 22, 16, 0, Math.PI, TAU); g.fill();
        g.fillStyle = '#f5f0e6'; g.fillRect(cx - 22, cy - 30, 44, 5);
        g.fillStyle = '#e8c256'; poly(g, [[cx - 16, cy - 44], [cx - 8, cy - 44], [cx - 12, cy - 36]]);
      }
    },
    ruri: {
      hair: '#5d8bff', backHair: '#4a70e0', dress: '#3b5fd0', collar: '#dfe8ff',
      shoulder: '#8fb2ff', eye: '#3050c0', mouth: 'smile', sideLock: true,
      acc: (g, cx, cy) => { // 星形发饰
        g.save(); g.translate(cx + 14, cy - 18); g.fillStyle = '#ffe14d';
        star5(g, 6); g.restore();
        g.save(); g.translate(cx - 18, cy - 12); g.fillStyle = '#ffe14d';
        star5(g, 4); g.restore();
      }
    },
    rin: {
      hair: '#e83c30', backHair: '#c02820', dress: '#8a2018', collar: '#ffcf9e',
      shoulder: '#ffb066', eye: '#c03020', mouth: 'open', sideLock: true,
      acc: (g, cx, cy) => { // 灯笼坠饰
        g.fillStyle = '#ff6a3c';
        g.beginPath(); g.ellipse(cx - 20, cy + 22, 7, 9, 0, 0, TAU); g.fill();
        g.strokeStyle = '#7a1810'; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(cx - 20, cy + 13); g.lineTo(cx - 20, cy + 31);
        g.moveTo(cx - 27, cy + 22); g.lineTo(cx - 13, cy + 22); g.stroke();
        g.fillStyle = '#ffd76b'; circ(g, cx + 21, cy - 22, 4, '#ffd76b'); // 火苗
      }
    },
    momiji: {
      hair: '#c05518', backHair: '#a04410', dress: '#8a3c10', collar: '#ffcf8e',
      shoulder: '#ff9c3c', eye: '#7a4010', mouth: 'smile', sideLock: true,
      acc: (g, cx, cy) => { // 枫叶头饰
        g.save(); g.translate(cx - 16, cy - 20); g.rotate(-.5);
        g.fillStyle = '#ff6a20'; leafShape(g, 10); g.restore();
        g.save(); g.translate(cx + 18, cy - 14); g.rotate(.8);
        g.fillStyle = '#e04810'; leafShape(g, 7); g.restore();
      }
    },
    shizu: {
      hair: '#bfe8ff', backHair: '#9cd0f0', dress: '#7ab6e8', collar: '#eaf6ff',
      shoulder: '#d0ecff', eye: '#4090d0', mouth: 'smile', sideLock: true,
      acc: (g, cx, cy) => { // 冰晶头冠
        g.strokeStyle = '#e8f8ff'; g.lineWidth = 2;
        for (let i = -1; i <= 1; i++) {
          const x = cx + i * 10, y = cy - 26;
          g.beginPath();
          g.moveTo(x, y - 7); g.lineTo(x, y + 7);
          g.moveTo(x - 5, y - 3.5); g.lineTo(x + 5, y + 3.5);
          g.moveTo(x + 5, y - 3.5); g.lineTo(x - 5, y + 3.5);
          g.stroke();
        }
      }
    },
    shion: {
      hair: '#9a6bff', backHair: '#7a4be0', dress: '#4a30a0', collar: '#d8ccff',
      shoulder: '#b49aff', eye: '#6040c0', mouth: 'smile', sideLock: true,
      acc: (g, cx, cy) => { // 月牙与珍珠
        g.strokeStyle = '#ffe9a0'; g.lineWidth = 3;
        g.beginPath(); g.arc(cx + 12, cy - 20, 8, -.6, 2.2); g.stroke();
        g.fillStyle = '#d0ecff'; circ(g, cx - 18, cy - 16, 4, '#d0ecff');
      }
    },
    ei: {
      hair: '#e8e4f8', backHair: '#c8c2ec', dress: '#2a2450', collar: '#ffd76b',
      shoulder: '#8a80c8', eye: '#c8a030', mouth: 'smile', sideLock: true,
      acc: (g, cx, cy) => { // 月冠与星屑
        g.strokeStyle = '#ffd76b'; g.lineWidth = 2.4;
        g.beginPath(); g.arc(cx, cy - 22, 14, -2.6, -.5); g.stroke();
        g.fillStyle = '#fff'; circ(g, cx - 20, cy - 10, 1.8, '#fff');
        circ(g, cx + 22, cy - 14, 1.6, '#fff'); circ(g, cx + 16, cy - 28, 1.4, '#fff');
      }
    }
  };
  function star5(g, r) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r;
      g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.closePath(); g.fill();
  }
  function leafShape(g, r) {
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      g.moveTo(0, 0);
      g.quadraticCurveTo(Math.cos(a - .35) * r * .8, Math.sin(a - .35) * r * .8, Math.cos(a) * r, Math.sin(a) * r);
      g.quadraticCurveTo(Math.cos(a + .35) * r * .8, Math.sin(a + .35) * r * .8, 0, 0);
    }
    g.fill();
  }

  /* ---- 游戏内 Boss 精灵（64x84，正面） ---- */
  function bossSprite(id) {
    const key = 'bs_' + id;
    if (bCache[key]) return bCache[key];
    const ch = CHAR_ART[id];
    const c = mk(64, 84, (g) => {
      g.save(); g.translate(32, 0); g.scale(.85, .85);
      if (id === 'ruri' || id === 'shion') { // 妖精翅膀
        g.fillStyle = 'rgba(200,225,255,.5)';
        ell(g, -20, 52, 13, 22, 'rgba(200,225,255,.45)', .5);
        ell(g, 20, 52, 13, 22, 'rgba(200,225,255,.45)', -.5);
        ell(g, -14, 38, 10, 16, 'rgba(225,240,255,.6)', .35);
        ell(g, 14, 38, 10, 16, 'rgba(225,240,255,.6)', -.35);
      }
      if (id === 'rin') { // 灵体尾焰
        g.fillStyle = 'rgba(255,120,60,.5)';
        poly(g, [[-12, 84], [12, 84], [6, 62], [-6, 62]], 'rgba(255,120,60,.45)');
      }
      // 后发
      g.fillStyle = ch.backHair;
      g.beginPath(); g.ellipse(0, 46, 25, 38, 0, 0, TAU); g.fill();
      // 身体
      poly(g, [[-20, 84], [20, 84], [15, 48], [-15, 48]], ch.dress, 'rgba(15,15,25,.55)', 2);
      poly(g, [[-15, 48], [15, 48], [11, 58], [-11, 58]], ch.collar);
      ell(g, -17, 54, 6, 9, ch.shoulder, -.35);
      ell(g, 17, 54, 6, 9, ch.shoulder, .35);
      // 头
      circ(g, 0, 30, 17, '#ffe3cf');
      ell(g, 0, 36, 11.5, 10, '#ffe3cf');
      // 刘海
      g.fillStyle = ch.hair;
      g.beginPath();
      g.moveTo(-17, 32);
      g.quadraticCurveTo(-19, 11, 0, 9);
      g.quadraticCurveTo(19, 11, 17, 32);
      g.quadraticCurveTo(11, 20, 7, 27);
      g.quadraticCurveTo(3, 18, 0, 26);
      g.quadraticCurveTo(-3, 18, -7, 27);
      g.quadraticCurveTo(-11, 20, -17, 32);
      g.fill();
      if (ch.sideLock) {
        ell(g, -18, 40, 3.8, 11, ch.hair, .15);
        ell(g, 18, 40, 3.8, 11, ch.hair, -.15);
      }
      // 表情（小尺寸简化）
      g.fillStyle = '#fff';
      ell(g, -6, 34, 2.6, 3.4, '#fff'); ell(g, 6, 34, 2.6, 3.4, '#fff');
      ell(g, -5.6, 34.4, 1.5, 2.4, ch.eye); ell(g, 6.4, 34.4, 1.5, 2.4, ch.eye);
      g.strokeStyle = '#b05050'; g.lineWidth = 1.4;
      g.beginPath(); g.arc(0, 39.5, 2.4, .25, Math.PI - .25); g.stroke();
      g.fillStyle = 'rgba(255,130,130,.4)';
      ell(g, -11, 37.5, 2.8, 1.6, 'rgba(255,130,130,.4)');
      ell(g, 11, 37.5, 2.8, 1.6, 'rgba(255,130,130,.4)');
      if (ch.acc) ch.acc(g, 0, 30);
      g.restore();
    });
    bCache[key] = c;
    return c;
  }

  /* ---- 杂兵妖精 ---- */
  function fairySprite(colKey) {
    const key = 'fy_' + colKey;
    if (bCache[key]) return bCache[key];
    const col = PAL[colKey];
    const c = mk(32, 32, (g) => {
      g.translate(16, 16);
      // 翅膀
      g.fillStyle = 'rgba(210,235,255,.55)';
      ell(g, -9, -2, 7, 11, 'rgba(210,235,255,.55)', .5);
      ell(g, 9, -2, 7, 11, 'rgba(210,235,255,.55)', -.5);
      ell(g, -6, 4, 5, 7, 'rgba(235,248,255,.4)', .3);
      ell(g, 6, 4, 5, 7, 'rgba(235,248,255,.4)', -.3);
      // 身体裙
      poly(g, [[-7, 2], [7, 2], [9, 13], [-9, 13]], col, 'rgba(20,20,30,.5)', 1.5);
      // 头
      circ(g, 0, -4, 7, '#ffe3cf');
      g.fillStyle = col;
      g.beginPath(); g.ellipse(0, -6.5, 7.2, 5, 0, Math.PI, TAU); g.fill();
      // 眼
      g.fillStyle = '#333'; circ(g, -2.6, -3.5, 1.1, '#333'); circ(g, 2.6, -3.5, 1.1, '#333');
      g.fillStyle = 'rgba(255,130,130,.4)';
      ell(g, -4.6, -1.5, 1.5, .9, 'rgba(255,130,130,.4)');
      ell(g, 4.6, -1.5, 1.5, .9, 'rgba(255,130,130,.4)');
    });
    bCache[key] = c;
    return c;
  }
  // 其他杂兵
  function orbSprite(colKey) { // 魔法书/浮游炮
    const key = 'ob_' + colKey;
    if (bCache[key]) return bCache[key];
    const col = PAL[colKey];
    const c = mk(36, 36, (g) => {
      g.translate(18, 18);
      g.fillStyle = 'rgba(40,30,60,.9)';
      circ(g, 0, 0, 12, 'rgba(45,35,70,.95)');
      g.strokeStyle = col; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = col; circ(g, 0, 0, 5, col);
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.4;
      g.beginPath(); g.arc(0, 0, 9, .6, 2.4); g.stroke();
      g.beginPath(); g.arc(0, 0, 9, .6 + Math.PI, 2.4 + Math.PI); g.stroke();
    });
    bCache[key] = c;
    return c;
  }

  /* ---------------- 背景 ---------------- */
  function skyGrad(g, stops) {
    const grd = g.createLinearGradient(0, 0, 0, F.h);
    for (const [p, c] of stops) grd.addColorStop(p, c);
    g.fillStyle = grd; g.fillRect(0, 0, F.w, F.h);
  }
  function starsOn(g, n, ymax, alpha) {
    for (let i = 0; i < n; i++) {
      const x = Math.random() * F.w, y = Math.random() * (ymax || F.h);
      g.fillStyle = `rgba(255,255,255,${alpha * (.3 + Math.random() * .7)})`;
      g.fillRect(x, y, 1.6, 1.6);
    }
  }

  const bgCache = {};
  function bg(idx) {
    if (bgCache[idx]) return bgCache[idx];
    const S = { t: 0 };
    const R = (n) => Array.from({ length: n }, (_, i) => i);
    if (idx === 0) { // Stage1 碎星之丘 · 春樱
      S.stars = R(50).map(() => ({ x: Math.random() * F.w, y: Math.random() * F.h * .6, a: .2 + Math.random() * .4 }));
      S.petals = R(70).map(() => ({ x: Math.random() * F.w, y: Math.random() * F.h, s: .6 + Math.random() * 1.6, ph: Math.random() * TAU, sp: .5 + Math.random() * 1.2 }));
      S.sky = mk(F.w, F.h, (g) => skyGrad(g, [[0, '#2a3a6e'], [.35, '#7a6aa8'], [.62, '#d888a8'], [.85, '#f2b8c8'], [1, '#f8d8d0']]));
      bgCache[idx] = S;
    } else if (idx === 1) { // Stage2 妖祭焰川 · 夏祭
      S.lanterns = R(26).map(() => ({ x: Math.random() * F.w, y: Math.random() * F.h, s: 3 + Math.random() * 5, sp: .3 + Math.random() * .8, ph: Math.random() * TAU }));
      S.fw = []; // 烟花
      S.sky = mk(F.w, F.h, (g) => skyGrad(g, [[0, '#0a1030'], [.5, '#14204e'], [.8, '#1e2c60'], [1, '#28306e']]));
      S.river = R(14).map(() => ({ y: F.h - 130 + Math.random() * 125, w: 30 + Math.random() * 110, sp: .4 + Math.random() * 1.4, ph: Math.random() * TAU }));
      bgCache[idx] = S;
    } else if (idx === 2) { // Stage3 红叶落神 · 秋林
      S.leaves = R(60).map(() => ({ x: Math.random() * F.w, y: Math.random() * F.h, s: .7 + Math.random() * 1.7, ph: Math.random() * TAU, sp: .8 + Math.random() * 1.6, c: ['#ff6a20', '#e04810', '#c83808', '#ff9c3c'][Math.floor(Math.random() * 4)] }));
      S.sky = mk(F.w, F.h, (g) => skyGrad(g, [[0, '#3a1430'], [.4, '#8a3020'], [.7, '#d06018'], [1, '#f09428']]));
      bgCache[idx] = S;
    } else if (idx === 3) { // Stage4 静雪之祠 · 冬山
      S.snow = [];
      for (let l = 0; l < 3; l++) S.snow.push(R(40).map(() => ({ x: Math.random() * F.w, y: Math.random() * F.h, s: 1 + l + Math.random(), sp: .4 + l * .55 + Math.random() * .4, ph: Math.random() * TAU })));
      S.sky = mk(F.w, F.h, (g) => skyGrad(g, [[0, '#3a4a78'], [.5, '#7a92b8'], [.8, '#b8cce0'], [1, '#e8f0f6']]));
      bgCache[idx] = S;
    } else if (idx === 4) { // Stage5 星降之湖 · 星海
      S.stars = R(130).map(() => ({ x: Math.random() * F.w, y: Math.random() * F.h * .55, a: Math.random(), ph: Math.random() * TAU, s: Math.random() * .8 }));
      S.refl = R(40).map(() => ({ x: Math.random() * F.w, y: F.h * .58 + Math.random() * F.h * .4, l: 8 + Math.random() * 30, sp: .5 + Math.random() * 1.2, ph: Math.random() * TAU }));
      S.shoot = [];
      S.sky = mk(F.w, F.h, (g) => {
        skyGrad(g, [[0, '#050820'], [.45, '#0c1638'], [.58, '#122048'], [.585, '#0a1028'], [1, '#060a1c']]);
      });
      bgCache[idx] = S;
    } else { // Stage6 月之彼岸
      S.stars = R(150).map(() => ({ x: Math.random() * F.w, y: Math.random() * F.h, a: Math.random(), ph: Math.random() * TAU }));
      S.neb = R(5).map((_, i) => ({ x: Math.random() * F.w, y: Math.random() * F.h, r: 90 + Math.random() * 120, c: ['rgba(120,60,200,.10)', 'rgba(60,100,220,.10)', 'rgba(200,60,160,.08)'][i % 3], ph: Math.random() * TAU }));
      S.sky = mk(F.w, F.h, (g) => skyGrad(g, [[0, '#030310'], [.5, '#0a0824'], [1, '#140c30']]));
      bgCache[idx] = S;
    }
    return bgCache[idx];
  }

  function drawBG(g, idx, t, dt) {
    const S = bg(idx);
    g.drawImage(S.sky, F.x, F.y);
    g.save();
    g.beginPath(); g.rect(F.x, F.y, F.w, F.h); g.clip();
    g.translate(F.x, 0);
    if (idx === 0) {
      for (const s of S.stars) { g.fillStyle = `rgba(255,255,255,${s.a})`; g.fillRect(s.x, s.y, 1.6, 1.6); }
      // 山丘
      for (let L = 0; L < 2; L++) {
        const off = (t * (.2 + L * .3)) % 200;
        g.fillStyle = L ? 'rgba(60,40,90,.85)' : 'rgba(90,60,120,.55)';
        g.beginPath(); g.moveTo(0, F.h);
        for (let x = 0; x <= F.w; x += 20)
          g.lineTo(x, F.h - 90 - L * 40 + Math.sin((x + off) * .013 + L * 2) * 26 - Math.sin((x + off) * .005) * 20);
        g.lineTo(F.w, F.h); g.fill();
      }
      for (const p of S.petals) {
        p.y += p.sp * dt * 60 * .6; p.x += Math.sin(t * .02 + p.ph) * .7; p.ph += .03;
        if (p.y > F.h + 10) { p.y = -10; p.x = Math.random() * F.w; }
        g.save(); g.translate(p.x, p.y); g.rotate(p.ph);
        g.fillStyle = 'rgba(255,200,220,.75)';
        ell(g, 0, 0, 4 * p.s, 2.4 * p.s, 'rgba(255,200,220,.75)');
        g.restore();
      }
    } else if (idx === 1) {
      // 月
      g.fillStyle = 'rgba(255,240,200,.12)'; circ(g, F.w - 90, 110, 64, 'rgba(255,240,200,.1)');
      g.fillStyle = 'rgba(255,244,214,.75)'; circ(g, F.w - 90, 110, 44, 'rgba(255,244,214,.8)');
      g.fillStyle = 'rgba(210,190,150,.35)';
      circ(g, F.w - 104, 96, 9, 'rgba(210,190,150,.4)'); circ(g, F.w - 76, 124, 6, 'rgba(210,190,150,.4)'); circ(g, F.w - 84, 108, 4, 'rgba(210,190,150,.4)');
      // 灯笼
      for (const l of S.lanterns) {
        l.y -= l.sp * dt * 30; if (l.y < -20) { l.y = F.h + 20; l.x = Math.random() * F.w; }
        const gl = g.createRadialGradient(l.x, l.y, 1, l.x, l.y, l.s * 3);
        gl.addColorStop(0, 'rgba(255,180,90,.8)'); gl.addColorStop(1, 'rgba(255,140,60,0)');
        g.fillStyle = gl; circ(g, l.x, l.y, l.s * 3, gl);
        g.fillStyle = 'rgba(255,120,60,.9)';
        g.beginPath(); g.ellipse(l.x + Math.sin(t * .03 + l.ph) * 2, l.y, l.s, l.s * 1.35, 0, 0, TAU); g.fill();
      }
      // 烟花
      if (Math.random() < .02 * dt * 60) S.fw.push({ x: 40 + Math.random() * (F.w - 80), y: 60 + Math.random() * 200, t: 0, c: ['#ff9cc8', '#ffe14d', '#4df2ff', '#c46bff'][Math.floor(Math.random() * 4)], n: 16 + Math.floor(Math.random() * 10) });
      for (let i = S.fw.length - 1; i >= 0; i--) {
        const w = S.fw[i]; w.t += dt * 60;
        if (w.t > 50) { S.fw.splice(i, 1); continue; }
        const rr = w.t * 2.4, a = Math.max(0, 1 - w.t / 50);
        g.fillStyle = w.c;
        for (let k = 0; k < w.n; k++) {
          const an = k / w.n * TAU;
          g.globalAlpha = a * .85;
          g.fillRect(w.x + Math.cos(an) * rr, w.y + Math.sin(an) * rr, 2.4, 2.4);
        }
        g.globalAlpha = 1;
      }
      // 川与河灯
      g.fillStyle = 'rgba(20,30,80,.9)'; g.fillRect(0, F.h - 135, F.w, 135);
      for (const r of S.river) {
        r.ph += r.sp * dt;
        const a = .25 + Math.sin(r.ph) * .2;
        g.fillStyle = `rgba(120,160,255,${Math.max(.06, a)})`;
        const x = (r.ph * 40) % (F.w + r.w) - r.w;
        g.fillRect(x, r.y, r.w, 2);
      }
    } else if (idx === 2) {
      // 山脊
      for (let L = 0; L < 2; L++) {
        const off = (t * (.25 + L * .4)) % 240;
        g.fillStyle = L ? 'rgba(60,20,20,.85)' : 'rgba(110,40,25,.5)';
        g.beginPath(); g.moveTo(0, F.h);
        for (let x = 0; x <= F.w; x += 24)
          g.lineTo(x, F.h - 110 - L * 50 + Math.sin((x + off) * .011 + L) * 34 + Math.cos((x + off) * .004) * 22);
        g.lineTo(F.w, F.h); g.fill();
      }
      // 两侧树影
      for (let L = 0; L < 2; L++) {
        const off = (t * (1 + L)) % 340;
        g.fillStyle = L ? 'rgba(40,12,12,.9)' : 'rgba(70,22,16,.6)';
        for (let i = -1; i < 3; i++) {
          const y = ((i * 170 + off) % (F.h + 170)) - 85;
          tri(g, -10, y, 46 + L * 8); tri(g, F.w + 10, y + 85, 46 + L * 8);
        }
      }
      for (const p of S.leaves) {
        p.y += p.sp * dt * 40; p.ph += .05; p.x += Math.sin(t * .015 + p.ph) * 1.1;
        if (p.y > F.h + 10) { p.y = -10; p.x = Math.random() * F.w; }
        g.save(); g.translate(p.x, p.y); g.rotate(p.ph);
        g.fillStyle = p.c; g.globalAlpha = .8;
        leafShape(g, 4.5 * p.s);
        g.globalAlpha = 1; g.restore();
      }
    } else if (idx === 3) {
      // 远山
      for (let L = 0; L < 2; L++) {
        const off = (t * (.2 + L * .3)) % 300;
        g.fillStyle = L ? 'rgba(120,140,170,.9)' : 'rgba(160,180,205,.55)';
        g.beginPath(); g.moveTo(0, F.h);
        for (let x = 0; x <= F.w; x += 30)
          g.lineTo(x, F.h - 130 - L * 55 + Math.abs(Math.sin((x + off) * .008 + L * 3)) * -60 + Math.sin((x + off) * .003) * 30);
        g.lineTo(F.w, F.h); g.fill();
      }
      // 鸟居
      const ty = F.h - 150 + Math.sin(t * .004) * 10;
      g.fillStyle = 'rgba(150,40,40,.35)';
      g.fillRect(150, ty, 8, 130); g.fillRect(320, ty, 8, 130);
      g.fillRect(120, ty, 238, 9); g.fillRect(132, ty + 16, 214, 6);
      for (let L = 0; L < 3; L++) {
        for (const p of S.snow[L]) {
          p.y += p.sp * dt * 60; p.ph += .04; p.x += Math.sin(t * .01 + p.ph) * .8;
          if (p.y > F.h + 6) { p.y = -6; p.x = Math.random() * F.w; }
          g.fillStyle = `rgba(255,255,255,${.5 + L * .16})`;
          circ(g, p.x, p.y, p.s, `rgba(255,255,255,${.5 + L * .16})`);
        }
      }
    } else if (idx === 4) {
      for (const s of S.stars) {
        s.ph += dt * 2;
        const a = .35 + Math.abs(Math.sin(s.ph + s.a * 6)) * .6;
        g.fillStyle = `rgba(220,235,255,${a})`;
        g.fillRect(s.x, s.y, 1.6 + s.s, 1.6 + s.s);
      }
      // 流星
      if (Math.random() < .012 * dt * 60) S.shoot.push({ x: Math.random() * F.w, y: Math.random() * F.h * .3, vx: 4 + Math.random() * 4, vy: 2 + Math.random() * 2, t: 0 });
      for (let i = S.shoot.length - 1; i >= 0; i--) {
        const m = S.shoot[i]; m.t += dt * 60; m.x += m.vx; m.y += m.vy;
        if (m.t > 40) { S.shoot.splice(i, 1); continue; }
        g.strokeStyle = `rgba(255,255,255,${1 - m.t / 40})`; g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(m.x, m.y); g.lineTo(m.x - m.vx * 6, m.y - m.vy * 6); g.stroke();
      }
      // 湖面星影
      g.fillStyle = 'rgba(10,18,50,.55)'; g.fillRect(0, F.h * .58, F.w, F.h * .42);
      for (const r of S.refl) {
        r.ph += r.sp * dt;
        const a = .12 + Math.abs(Math.sin(r.ph)) * .3;
        g.fillStyle = `rgba(150,190,255,${a})`;
        g.fillRect(r.x, r.y + Math.sin(r.ph) * 3, 1.8, r.l);
      }
      g.strokeStyle = 'rgba(160,200,255,.25)'; g.lineWidth = 1;
      for (let k = 0; k < 4; k++) {
        const y = F.h * .6 + k * 34 + Math.sin(t * .02 + k) * 4;
        g.beginPath(); g.moveTo(0, y);
        for (let x = 0; x <= F.w; x += 30) g.lineTo(x, y + Math.sin(x * .04 + t * .03 + k) * 3);
        g.stroke();
      }
    } else {
      for (const n of S.neb) {
        n.ph += dt * .3;
        const nx = n.x + Math.sin(n.ph) * 30, ny = n.y + Math.cos(n.ph * .7) * 20;
        const gl = g.createRadialGradient(nx, ny, 4, nx, ny, n.r);
        gl.addColorStop(0, n.c); gl.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gl; circ(g, nx, ny, n.r, gl);
      }
      // 巨月
      const mx = F.w * .5, my = 190;
      const mg = g.createRadialGradient(mx, my, 60, mx, my, 150);
      mg.addColorStop(0, 'rgba(230,220,255,.28)'); mg.addColorStop(1, 'rgba(230,220,255,0)');
      g.fillStyle = mg; circ(g, mx, my, 150, mg);
      g.fillStyle = 'rgba(225,220,245,.5)'; circ(g, mx, my, 92, 'rgba(225,220,245,.55)');
      g.fillStyle = 'rgba(180,170,210,.5)';
      circ(g, mx - 30, my - 20, 14, 'rgba(185,175,215,.5)');
      circ(g, mx + 26, my + 18, 10, 'rgba(185,175,215,.5)');
      circ(g, mx + 6, my - 42, 6, 'rgba(185,175,215,.5)');
      circ(g, mx - 14, my + 40, 8, 'rgba(185,175,215,.5)');
      // 光柱
      for (let i = 0; i < 3; i++) {
        const px = 90 + i * 150, a = .06 + Math.abs(Math.sin(t * .012 + i * 2)) * .08;
        const pg = g.createLinearGradient(px, 0, px, F.h);
        pg.addColorStop(0, `rgba(200,190,255,${a})`); pg.addColorStop(1, 'rgba(200,190,255,0)');
        g.fillStyle = pg; g.fillRect(px - 10 + Math.sin(t * .01 + i) * 12, 0, 20, F.h);
      }
      for (const s of S.stars) {
        s.ph += dt * 2;
        const a = .3 + Math.abs(Math.sin(s.ph + s.a * 6)) * .6;
        g.fillStyle = `rgba(235,230,255,${a})`;
        g.fillRect(s.x, s.y, 1.7, 1.7);
      }
    }
    // 暗角（衬托弹幕）
    const vg = g.createRadialGradient(F.w / 2, F.h / 2, F.h * .42, F.w / 2, F.h / 2, F.h * .78);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,10,.5)');
    g.fillStyle = vg; g.fillRect(0, 0, F.w, F.h);
    g.restore();
  }
  function tri(g, x, y, w) {
    g.beginPath(); g.moveTo(x, y - w); g.lineTo(x - w * .8, y + w * .5); g.lineTo(x + w * .8, y + w * .5); g.closePath(); g.fill();
  }

  /* ---- 符卡背景（旋转曼陀罗） ---- */
  function spellBG(g, t, colKey) {
    const col = PAL[colKey] || PAL.violet;
    const [r, gg, b] = hex2rgb(col);
    g.save();
    g.beginPath(); g.rect(F.x, F.y, F.w, F.h); g.clip();
    g.translate(F.x + F.w / 2, F.y + F.h * .38);
    g.globalAlpha = .12;
    for (let ring = 0; ring < 3; ring++) {
      const rr = 90 + ring * 80 + Math.sin(t * .02 + ring) * 8;
      g.strokeStyle = `rgba(${r},${gg},${b},1)`; g.lineWidth = 2;
      g.setLineDash([14, 10]); g.lineDashOffset = t * (.4 + ring * .2) * (ring % 2 ? -1 : 1);
      g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.stroke();
    }
    g.setLineDash([]);
    g.rotate(t * .004);
    for (let i = 0; i < 12; i++) {
      g.rotate(TAU / 12);
      g.strokeStyle = `rgba(${r},${gg},${b},.8)`; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(0, -70); g.lineTo(0, -250); g.stroke();
      g.fillStyle = `rgba(${r},${gg},${b},.9)`;
      star5(g, 5); g.translate(0, -260); g.fill(); g.translate(0, 260);
    }
    g.restore();
  }

  /* ---------------- 导出 ---------------- */
  return {
    PAL, bulletSprite, BULLET_R, itemSprite,
    playerSprite(id) { return id === 'marisa' ? (bCache.mr || (bCache.mr = marisaSprite())) : (bCache.ri || (bCache.ri = reimuSprite())); },
    portrait, bossSprite, fairySprite, orbSprite,
    drawBG, spellBG, mk, star5, hex2rgb
  };
})();
