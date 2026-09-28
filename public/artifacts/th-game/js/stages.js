'use strict';
/* ============================================================
 *  東方星塵録 — 关卡与符卡数据 stages.js
 *  6 关：碎星之丘 / 妖祭焰川 / 红叶落神 / 静雪之祠 / 星降之湖 / 月之彼岸
 * ============================================================ */
const STAGES = (() => {
  const F = window.FIELD, TAU = Math.PI * 2;
  const { ring, fan, shot, laser, fairy, orb, every, aimAng, rnd } = PAT;

  /* ---------------- 杂兵波次工厂 ---------------- */
  // 横穿妖精
  function sweep(o) {
    return () => {
      fairy({
        x: o.left ? -24 : F.w + 24, y: o.y, col: o.col, hp: o.hp || 14,
        sway: o.sway || 0,
        path: [[o.left ? F.w + 40 : -40, o.y + (o.dip || 0), o.dur || 190]],
        drops: o.drops || { p: 2 },
        fire: e => {
          if (every(e.t, o.every || 55))
            fan(e, { n: o.n || 3, spread: o.spread != null ? o.spread : .55, spd: o.spd || 3, aim: true, shape: o.shape || 'rice', col: o.bcol || 'blue' });
        }
      });
    };
  }
  // 俯冲妖精
  function dive(o) {
    return () => {
      fairy({
        x: o.x, y: -24, col: o.col, hp: o.hp || 14, drops: o.drops || { p: 2 },
        fire: e => {
          if (e.t === 80) ring(e, { n: o.n || 12, spd: o.spd || 2.4, aim: true, col: o.bcol || 'blue', shape: o.shape || 'circle', off: e.t * .01 });
          if (e.t === 170) e.mq = [[o.x + rnd(-60, 60), -50, 100]];
        },
        path: [[o.x, o.y, 75]]
      });
    };
  }
  // 悬停妖精（周期环射）
  function hover(o) {
    return () => {
      fairy({
        x: o.x, y: -24, col: o.col, hp: o.hp || 16, drops: o.drops || { p: 2, pt: 1 },
        fire: e => {
          if (every(e.t, o.every || 80) && e.t > 60 && e.t < o.stay || every(e.t, o.every || 80) && e.t > 60 && e.t < o.stay + 20)
            ring(e, { n: o.n || 10, spd: o.spd || 2.3, aim: true, col: o.bcol || 'blue', shape: o.shape || 'circle' });
          if (e.t === o.stay + 30) e.mq = [[e.x < F.w / 2 ? -50 : F.w + 50, o.y - 40, 120]];
        },
        path: [[o.x, o.y, 90]]
      });
    };
  }
  // 浮游炮（缓慢追踪 + 扇形）
  function turret(o) {
    return () => {
      orb({
        x: o.x, y: -30, col: o.col, hp: o.hp || 46, drops: o.drops || { p: 3 },
        fire: e => {
          e.x += Math.sign(window.PGame.player.x - e.x) * .3;
          if (every(e.t, o.every || 52))
            fan(e, { n: o.n || 5, spread: o.spread || .9, spd: o.spd || 2.6, aim: true, col: o.bcol || 'violet', shape: o.shape || 'rice' });
          if (e.t > o.stay || 460) { /* 由出界回收 */ }
        },
        path: [[o.x, o.y, 110]]
      });
    };
  }
  const P = 4; // 一组数量

  /* ================= 六位 Boss ================= */
  const BOSSES = {};

  /* ---- Stage1 Boss · 琉璃（星屑妖精） ---- */
  BOSSES.ruri = {
    id: 'ruri', name: '琉璃', title: '星屑妖精', col: 'blue',
    mid: {
      name: '星屑 「星屑小雨」', hp: 200, time: 1080, bg: 'blue',
      fn(b, t) {
        if (every(t, 22)) fan(b, { n: 5, spread: .9, spd: 2.3, aim: true, col: 'blue', shape: 'star' });
        if (every(t, 70)) ring(b, { n: 10, spd: 1.9, col: 'cyan', shape: 'circle', off: t * .03 });
      }
    },
    phases: [
      { non: true, hp: 220, time: 1350, fn(b, t) {
        if (every(t, 30)) fan(b, { n: 3, spread: .4, spd: 3.3, aim: true, col: 'blue', shape: 'rice' });
        if (every(t, 52)) ring(b, { n: 10, spd: 2.0, col: 'cyan', off: t * .05 });
      } },
      { name: '星屑 「落樱星雨」', hp: 430, time: 1980, bg: 'blue', fn(b, t) {
        if (every(t, 7)) {
          for (let i = 0; i < 2; i++)
            PAT.SB({ x: rnd(0, F.w), y: -12, spd: 1.4, ang: Math.PI / 2 + rnd(-.3, .3), shape: 'circle', col: t % 14 ? 'pink' : 'blue', kind: 'acc', data: { ay: .028, max: 4.6 } });
        }
        if (every(t, 95)) ring(b, { n: 16, spd: 2.4, col: 'magenta', shape: 'star', aim: true });
        b.mv = null;
      } },
      { non: true, hp: 260, time: 1350, fn(b, t) {
        if (every(t, 26)) fan(b, { n: 5, spread: .8, spd: 3.1, aim: true, col: 'cyan', shape: 'rice' });
        if (every(t, 44)) shot(b, { spd: 4.2, col: 'blue', shape: 'kunai' });
      } },
      { name: '跳弹 「弹星水星」', hp: 460, time: 2040, bg: 'blue', fn(b, t) {
        if (every(t, 42)) {
          for (let i = 0; i < 4; i++)
            PAT.SB({ x: b.x, y: b.y, spd: 3.4, ang: aimAng(b) + rnd(-1.2, 1.2), shape: 'star', col: 'yellow', kind: 'stop',
              data: { decel: 32, stop: .3, fric: .92, then: bl => ring(bl, { n: 5, spd: 3.4, aim: true, col: 'yellow', shape: 'rice' }) } });
        }
        if (every(t, 66)) fan(b, { n: 3, spread: .3, spd: 4.0, aim: true, col: 'blue', shape: 'kunai' });
      } },
      { name: '妖光 「Little Star Meteor」', hp: 520, time: 2160, bg: 'blue', fn(b, t) {
        if (every(t, 4)) {
          const a = t * .23;
          PAT.SB({ x: b.x, y: b.y, spd: 2.5, ang: a, shape: 'circle', col: 'cyan' });
          PAT.SB({ x: b.x, y: b.y, spd: 2.5, ang: a + Math.PI, shape: 'circle', col: 'blue' });
        }
        if (every(t, 120)) for (let i = 0; i < 3; i++)
          PAT.SB({ x: b.x, y: b.y, spd: 4.6, ang: aimAng(b) + rnd(-.35, .35), shape: 'star', col: 'yellow' });
      } }
    ],
    pre: [
      { s: 'p', t: '山丘上的妖精们……好像捡到了什么奇怪的东西。' },
      { s: 'b', t: '啊！闪闪的！是闪闪的星星碎片！' },
      { s: 'b', t: '从天上掉下来好多好多，全部都是琉璃的！' },
      { s: 'p', t: '那些碎片会把奇怪的妖气引进来。得请你交出来。' },
      { s: 'b', t: '不要！要玩弹幕游戏赢过琉璃才行！' },
      { s: 'p', t: '真是的……那就如你所愿。' }
    ],
    post: [
      { s: 'b', t: '呜哇——输了……星星闪闪地飞走了……' },
      { s: 'p', t: '碎片本来就不属于地面。它们会回到夜空去的。' },
      { s: 'b', t: '那……下一扇门的方向，琉璃可以告诉你哦。' },
      { s: 'b', t: '歌声传来的方向……是祭典那边！火之川的夜祭！' },
      { s: 'p', t: '祭典吗。那就先去凑凑热闹。' }
    ]
  };

  /* ---- Stage2 Boss · 绯灯 燐（灯笼骚灵） ---- */
  BOSSES.rin = {
    id: 'rin', name: '绯灯 燐', title: '灯火骚灵', col: 'red',
    mid: {
      name: '灯火 「提灯回廊」', hp: 260, time: 1140, bg: 'red',
      fn(b, t) {
        if (every(t, 46)) ring(b, { n: 6, spd: 1.7, col: 'orange', shape: 'bubble', off: t * .02 });
        if (every(t, 30)) fan(b, { n: 3, spread: .35, spd: 3.6, aim: true, col: 'red', shape: 'kunai' });
      }
    },
    phases: [
      { non: true, hp: 260, time: 1400, fn(b, t) {
        if (every(t, 26)) fan(b, { n: 5, spread: .7, spd: 3.2, aim: true, col: 'red', shape: 'rice' });
        if (every(t, 80)) ring(b, { n: 4, spd: 1.6, col: 'orange', shape: 'bubble' });
      } },
      { name: '灯火 「百鬼夜行灯」', hp: 470, time: 2040, bg: 'red', fn(b, t) {
        const side = Math.floor(t / 60) % 2;
        if (every(t, 60)) {
          for (let i = 0; i < 7; i++)
            PAT.SB({ x: side ? F.w + 10 : -10, y: 40 + i * 46, spd: 2.3, ang: side ? Math.PI : 0, shape: 'bubble', col: 'orange', kind: 'sine', data: { A: .5, f: .08 } });
        }
        if (every(t, 115)) ring(b, { n: 20, spd: 2.5, col: 'red', shape: 'circle', aim: true });
      } },
      { non: true, hp: 290, time: 1350, fn(b, t) {
        if (every(t, 20)) fan(b, { n: 3, spread: .5, spd: 3.6, aim: true, col: 'orange', shape: 'rice' });
        if (every(t, 60)) shot(b, { spd: 4.6, col: 'red', shape: 'kunai' });
      } },
      { name: '焰句 「火之川歌谣」', hp: 500, time: 2040, bg: 'red', fn(b, t) {
        if (every(t, 5)) {
          const c = t % 10 < 5 ? 'orange' : 'yellow';
          PAT.SB({ x: rnd(0, F.w), y: -12, spd: 2.9, ang: Math.PI / 2, shape: 'circle', col: c, kind: 'sine', data: { A: .55, f: .09 } });
        }
        if (every(t, 150)) fan(b, { n: 7, spread: 1.1, spd: 3.8, aim: true, col: 'red', shape: 'kunai' });
      } },
      { name: '星火 「燎原流星群」', hp: 560, time: 2160, bg: 'red', fn(b, t) {
        if (every(t, 30)) {
          const left = Math.floor(t / 30) % 2;
          for (let i = 0; i < 4; i++)
            PAT.SB({ x: left ? -10 : F.w + 10, y: rnd(0, 140), spd: 4.1, ang: left ? .5 : Math.PI - .5, shape: 'star', col: 'yellow', kind: 'acc', data: { ay: .012, max: 5.6 } });
        }
        if (every(t, 6)) PAT.SB({ x: b.x, y: b.y, spd: 2.2, ang: t * .31, shape: 'circle', col: 'red' });
        if (every(t, 90)) ring(b, { n: 14, spd: 2.8, aim: true, col: 'orange', shape: 'rice' });
      } }
    ],
    pre: [
      { s: 'b', t: '欢迎来到火之川！今晚的烟火，格外热闹哦！' },
      { s: 'p', t: '河灯和烟火都被星屑引燃了……这可不是普通的祭典。' },
      { s: 'b', t: '星星碎片在河里唱歌呢。火是活的——你听见了吧？' },
      { s: 'p', t: '歌声正在把幻想乡变得奇怪。必须让它停下来。' },
      { s: 'b', t: '想让歌停下来，就先接过这漫天的火雨！' }
    ],
    post: [
      { s: 'b', t: '哈啊……痛快！我的火，输了。' },
      { s: 'b', t: '歌是从更里面的门传来的。祭典后头是红叶林，再过去是雪山。' },
      { s: 'p', t: '一路上去，四季全都乱了……这扇门到底有多少扇？' },
      { s: 'b', t: '六扇哦。听说集齐六份『星光』，就能完成那首诗。' },
      { s: 'p', t: '完成……吗。总觉得不是什么好事情。' }
    ]
  };

  /* ---- Stage3 Boss · 秋山 红叶（红叶落神） ---- */
  BOSSES.momiji = {
    id: 'momiji', name: '秋山 红叶', title: '红叶落神', col: 'orange',
    mid: {
      name: '落神 「叶落之时」', hp: 320, time: 1200, bg: 'orange',
      fn(b, t) {
        if (every(t, 12)) PAT.SB({ x: rnd(0, F.w), y: -12, spd: 2.0, ang: Math.PI / 2 + rnd(-.4, .4), shape: 'kunai', col: 'orange' });
        if (every(t, 90)) ring(b, { n: 12, spd: 2.4, aim: true, col: 'red', shape: 'rice' });
      }
    },
    phases: [
      { non: true, hp: 300, time: 1400, fn(b, t) {
        if (every(t, 30)) ring(b, { n: 12, spd: 2.6, col: 'orange', off: t * .04 });
        if (every(t, 45)) fan(b, { n: 4, spread: .5, spd: 3.6, aim: true, col: 'red', shape: 'kunai' });
      } },
      { name: '落神 「枫之宴」', hp: 520, time: 2040, bg: 'orange', fn(b, t) {
        for (let arm = 0; arm < 4; arm++)
          if (every(t, 4))
            PAT.SB({ x: b.x, y: b.y, spd: 2.5, ang: t * .05 + arm * TAU / 4, shape: 'kunai', col: arm % 2 ? 'orange' : 'red' });
        if (every(t, 180)) ring(b, { n: 24, spd: 2.9, aim: true, col: 'yellow', shape: 'star' });
      } },
      { non: true, hp: 330, time: 1350, fn(b, t) {
        if (every(t, 24)) fan(b, { n: 6, spread: 1.0, spd: 3.3, aim: true, col: 'orange', shape: 'rice' });
        if (every(t, 70)) ring(b, { n: 8, spd: 1.9, col: 'red' });
      } },
      { name: '叶隐 「红刃回廊」', hp: 540, time: 2100, bg: 'orange', fn(b, t) {
        if (every(t, 88)) laser({ x: rnd(40, F.w - 40), y: 0, ang: Math.PI / 2, warn: 46, active: 26, w: 26, col: 'red' });
        if (every(t, 66)) {
          const gap = rnd(60, F.w - 60);
          for (let i = 0; i < 13; i++) {
            const x = 18 + i * 37;
            if (Math.abs(x - gap) < 62) continue;
            PAT.SB({ x, y: -12, spd: 2.7, ang: Math.PI / 2, shape: 'kunai', col: 'orange' });
          }
        }
        if (every(t, 40)) fan(b, { n: 3, spread: .4, spd: 4.1, aim: true, col: 'red', shape: 'kunai' });
      } },
      { name: '丰收 「九月星降祭」', hp: 580, time: 2160, bg: 'orange', fn(b, t) {
        if (every(t, 90)) { b.mq = [[rnd(90, F.w - 90), rnd(70, 150), 40]]; }
        if (every(t, 42)) ring(b, { n: 16, spd: 2.7, col: 'yellow', shape: 'star', aim: true, off: t * .013 });
        if (every(t, 9)) PAT.SB({ x: rnd(0, F.w), y: -12, spd: 1.9, ang: Math.PI / 2 + rnd(-.5, .5), shape: 'rice', col: 'orange' });
      } }
    ],
    pre: [
      { s: 'b', t: '止步。此山如今是红叶的领地。' },
      { s: 'b', t: '星之诗太吵了。吵得老朽的红叶，都不肯落地。' },
      { s: 'p', t: '叶子不落地，秋天就无法结束。所以你来守这扇门？' },
      { s: 'b', t: '落神有落神的规矩。要过此山——先接下这场红叶之宴！' },
      { s: 'p', t: '那就以弹幕，敬秋天一杯。' }
    ],
    post: [
      { s: 'b', t: '……哈，好一场舞。红叶，落地了。' },
      { s: 'b', t: '门后有雪。雪之精怪把诗的第二段冻起来了。' },
      { s: 'p', t: '冻起来？为什么？' },
      { s: 'b', t: '她说那一段唱的是离别。去吧，去听听她的道理。' }
    ]
  };

  /* ---- Stage4 Boss · 霜月 静（雪之精） ---- */
  BOSSES.shizu = {
    id: 'shizu', name: '霜月 静', title: '静雪之精', col: 'cyan',
    mid: {
      name: '静雪 「细雪一声」', hp: 340, time: 1200, bg: 'cyan',
      fn(b, t) {
        if (every(t, 16)) PAT.SB({ x: rnd(0, F.w), y: -12, spd: 1.5, ang: Math.PI / 2, shape: 'circle', col: 'cyan', kind: 'sine', data: { A: .35, f: .06 } });
        if (every(t, 80)) fan(b, { n: 5, spread: .6, spd: 3.0, aim: true, col: 'white', shape: 'rice' });
      }
    },
    phases: [
      { non: true, hp: 320, time: 1400, fn(b, t) {
        if (every(t, 40)) fan(b, { n: 6, spread: .8, spd: 2.8, aim: true, col: 'cyan', shape: 'rice' });
        if (every(t, 90)) ring(b, { n: 14, spd: 2.1, col: 'white', off: t * .03 });
      } },
      { name: '冻符 「冰封的诗节」', hp: 560, time: 2040, bg: 'cyan', fn(b, t) {
        if (every(t, 55)) {
          ring(b, { n: 20, spd: 3.2, col: 'cyan', shape: 'circle', off: t * .011, kind: 'stop',
            data: { decel: 42, stop: .18, fric: .94, then: bl => ring(bl, { n: 6, spd: 3.2, col: 'white', shape: 'rice' }) } });
        }
        if (every(t, 75)) fan(b, { n: 3, spread: .25, spd: 4.4, aim: true, col: 'blue', shape: 'kunai' });
      } },
      { non: true, hp: 350, time: 1350, fn(b, t) {
        if (every(t, 22)) shot(b, { spd: 4.5, aim: true, col: 'cyan', shape: 'kunai' });
        if (every(t, 50)) ring(b, { n: 10, spd: 1.7, col: 'white', shape: 'bubble', off: t * .05 });
      } },
      { name: '静雪 「无声之庭」', hp: 580, time: 2100, bg: 'cyan', fn(b, t) {
        if (every(t, 18)) {
          const edge = Math.floor(t / 18) % 4;
          const px = edge === 0 ? rnd(0, F.w) : edge === 1 ? F.w + 10 : edge === 2 ? rnd(0, F.w) : -10;
          const py = edge === 0 ? -10 : edge === 1 ? rnd(0, F.h * .7) : edge === 2 ? F.h * .5 : rnd(0, F.h * .7);
          const pa = edge === 1 ? Math.PI : edge === 2 ? -Math.PI / 2 : edge === 3 ? 0 : Math.PI / 2;
          PAT.SB({ x: px, y: py, spd: 1.25, ang: pa + rnd(-.15, .15), shape: 'bubble', col: 'cyan', r: 16 });
        }
        if (every(t, 40)) fan(b, { n: 5, spread: .5, spd: 5.0, aim: true, col: 'white', shape: 'kunai' });
      } },
      { name: '冰诗 「冻结的副歌」', hp: 620, time: 2160, bg: 'cyan', fn(b, t) {
        if (every(t, 7)) {
          const i = t / 7;
          PAT.SB({ x: b.x, y: b.y, spd: 2.7, ang: aimAng(b) + (i % 2 ? .1 : -.1), shape: 'circle', col: 'cyan', kind: 'curve', data: { w: i % 2 ? .028 : -.028 } });
          PAT.SB({ x: b.x, y: b.y, spd: 2.2, ang: aimAng(b) + (i % 2 ? -.2 : .2), shape: 'circle', col: 'white', kind: 'curve', data: { w: i % 2 ? -.022 : .022 } });
        }
        if (every(t, 120)) ring(b, { n: 24, spd: 2.6, aim: true, col: 'blue', shape: 'star' });
      } }
    ],
    pre: [
      { s: 'b', t: '……来了啊。安静一点，这里的雪，会记住声音。' },
      { s: 'p', t: '冰里封着的……是歌声？' },
      { s: 'b', t: '嗯。诗的这一段，唱的是『结束』。我不许它继续唱下去。' },
      { s: 'b', t: '只要冻住歌声，雪山就永远安静——永远不结束。' },
      { s: 'p', t: '不会结束的东西，不是永远，只是停下来了。' },
      { s: 'b', t: '……那就用弹幕告诉我，会动的世界有多好听。' }
    ],
    post: [
      { s: 'b', t: '冰化了……歌又响起来了。原来颤动的声音，这么暖。' },
      { s: 'b', t: '下一扇门在星降之湖。紫苑在等你——她是诗作者最忠实的听众。' },
      { s: 'p', t: '『他』？' },
      { s: 'b', t: '写这首诗的人。去吧，去见诗的作者。' }
    ]
  };

  /* ---- Stage5 Boss · 汀 紫苑（星之水精） ---- */
  BOSSES.shion = {
    id: 'shion', name: '汀 紫苑', title: '星之水精', col: 'violet',
    mid: {
      name: '水镜 「湖面之镜」', hp: 380, time: 1200, bg: 'violet',
      fn(b, t) {
        if (every(t, 60)) ring(b, { n: 6, spd: 2.5, col: 'violet', shape: 'bubble', kind: 'bounce', data: { b: 2 } });
        if (every(t, 35)) fan(b, { n: 3, spread: .4, spd: 3.8, aim: true, col: 'magenta', shape: 'kunai' });
      }
    },
    phases: [
      { non: true, hp: 340, time: 1400, fn(b, t) {
        if (every(t, 30)) fan(b, { n: 5, spread: .6, spd: 3.4, aim: true, col: 'violet', shape: 'rice' });
        if (every(t, 60)) ring(b, { n: 12, spd: 2.3, col: 'magenta', off: t * .04 });
      } },
      { name: '湖镜 「星海倒映」', hp: 600, time: 2040, bg: 'violet', fn(b, t) {
        if (every(t, 36)) {
          for (const x of [70, F.w - 70])
            fan({ x, y: -10 }, { n: 5, spread: .8, spd: 3.1, aim: true, col: 'violet', shape: 'circle' });
        }
        if (every(t, 100)) ring(b, { n: 18, spd: 2.5, col: 'cyan', shape: 'star', aim: true });
        if (every(t, 60)) ring(b, { n: 4, spd: 2.2, col: 'magenta', shape: 'bubble', kind: 'bounce', data: { b: 2 } });
      } },
      { non: true, hp: 370, time: 1350, fn(b, t) {
        if (every(t, 18)) shot(b, { spd: 4.2, aim: true, col: 'violet', shape: 'rice' });
        if (every(t, 55)) ring(b, { n: 9, spd: 1.8, col: 'magenta', off: t * .06 });
      } },
      { name: '水精 「星汀之波动」', hp: 620, time: 2100, bg: 'violet', fn(b, t) {
        if (every(t, 4)) {
          PAT.SB({ x: b.x, y: b.y, spd: 3.0, ang: aimAng(b), shape: 'circle', col: t % 8 < 4 ? 'violet' : 'magenta', kind: 'sine', data: { A: .8, f: .09 } });
        }
        if (every(t, 90)) ring(b, { n: 6, spd: 2.4, col: 'cyan', shape: 'bubble', kind: 'bounce', data: { b: 2 }, off: t * .02 });
        if (every(t, 150)) fan(b, { n: 9, spread: 1.3, spd: 4.0, aim: true, col: 'white', shape: 'kunai' });
      } },
      { name: '命运 「映出的明日」', hp: 660, time: 2160, bg: 'violet', fn(b, t) {
        if (every(t, 50)) {
          for (let i = 0; i < 8; i++)
            PAT.SB({ x: b.x, y: b.y, spd: 2.3, ang: i / 8 * TAU + t * .01, shape: 'star', col: 'cyan', kind: 'home', data: { w: .022 } });
        }
        if (every(t, 30)) fan(b, { n: 7, spread: .9, spd: 3.6, aim: true, col: 'violet', shape: 'rice' });
        if (every(t, 90)) ring(b, { n: 20, spd: 2.8, col: 'magenta', aim: true, off: t * .02 });
      } }
    ],
    pre: [
      { s: 'b', t: '欢迎来到星之湖。湖水今晚，映着一整片星海。' },
      { s: 'p', t: '你守着第五扇门。也是要拦住我吗？' },
      { s: 'b', t: '不。我是想拜托你——在关上门之前，先听完这首诗。' },
      { s: 'b', t: '咏不是为了破坏幻想乡才来的。他只是在害怕。' },
      { s: 'p', t: '害怕？' },
      { s: 'b', t: '他在月都读到过：大结界终有一天会衰弱，幻想乡终将破碎。' },
      { s: 'b', t: '所以他想把一切，定格在最美的瞬间。' },
      { s: 'p', t: '……被定格的美，就不是活着的美了。我去把这句话当面讲给他听。' }
    ],
    post: [
      { s: 'b', t: '去吧。穿过这扇门，就是他诗里的世界。' },
      { s: 'b', t: '如果可以——请把这首诗的最后一页，还给他。' },
      { s: 'p', t: '最后一页……我尽量。' }
    ]
  };

  /* ---- Stage6 Boss · 星见 咏（最终） ---- */
  BOSSES.ei = {
    id: 'ei', name: '星见 咏', title: '月之咏者', col: 'gold',
    mid: {
      name: '静奏 「寂静的前奏曲」', hp: 420, time: 1200, bg: 'gold',
      fn(b, t) {
        if (every(t, 60)) ring(b, { n: 12, spd: 2.2, col: 'gold', off: t * .03 });
        if (every(t, 30)) fan(b, { n: 3, spread: .35, spd: 4.0, aim: true, col: 'silver', shape: 'kunai' });
      }
    },
    phases: [
      { non: true, hp: 400, time: 1450, fn(b, t) {
        if (every(t, 24)) fan(b, { n: 6, spread: .7, spd: 3.4, aim: true, col: 'gold', shape: 'rice' });
        if (every(t, 60)) ring(b, { n: 16, spd: 2.5, col: 'silver', off: t * .03 });
      } },
      { name: '咏唱 「星之第一乐章」', hp: 680, time: 2040, bg: 'gold', fn(b, t) {
        const k = Math.floor(t / 8) % 16;
        if (every(t, 8))
          PAT.SB({ x: 20 + k * 28, y: -12, spd: 3.0, ang: Math.PI / 2 + Math.sin(k * .8) * .5, shape: 'circle', col: k % 2 ? 'gold' : 'silver' });
        if (every(t, 120)) ring(b, { n: 24, spd: 2.9, aim: true, col: 'gold', shape: 'star' });
        if (every(t, 45)) fan(b, { n: 5, spread: .6, spd: 3.9, aim: true, col: 'violet', shape: 'kunai' });
      } },
      { non: true, hp: 430, time: 1400, fn(b, t) {
        if (every(t, 100)) {
          laser({ x: b.x, y: b.y, ang: aimAng(b), warn: 40, active: 24, w: 24, col: 'gold', src: null });
        }
        if (every(t, 5)) PAT.SB({ x: b.x, y: b.y, spd: 2.4, ang: t * .21, shape: 'circle', col: 'silver' });
        if (every(t, 70)) ring(b, { n: 12, spd: 3.0, aim: true, col: 'gold', shape: 'rice' });
      } },
      { name: '命运 「星图阵 · 黄道十二」', hp: 720, time: 2100, bg: 'gold', fn(b, t) {
        if (every(t, 4)) {
          for (let i = 0; i < 12; i++)
            PAT.SB({ x: b.x, y: b.y, spd: 2.55, ang: t * .02 + i * TAU / 12, shape: 'circle', col: i % 2 ? 'gold' : 'violet' });
        }
        if (every(t, 150)) for (let i = 0; i < 5; i++)
          PAT.SB({ x: b.x, y: b.y, spd: 4.4, ang: aimAng(b) + (i - 2) * .16, shape: 'star', col: 'silver' });
      } },
      { non: true, hp: 450, time: 1400, fn(b, t) {
        if (every(t, 55)) ring(b, { n: 8, spd: 2.4, col: 'silver', shape: 'bubble', kind: 'bounce', data: { b: 2 } });
        if (every(t, 26)) fan(b, { n: 4, spread: .5, spd: 4.2, aim: true, col: 'gold', shape: 'kunai' });
        if (every(t, 90)) laser({ x: rnd(40, F.w - 40), y: 0, ang: Math.PI / 2, warn: 42, active: 22, w: 20, col: 'violet' });
      } },
      { name: '月光 「静寂的世界」', hp: 740, time: 2100, bg: 'gold', fn(b, t) {
        if (every(t, 24)) PAT.SB({ x: rnd(0, F.w), y: -14, spd: 3.2, ang: Math.PI / 2, shape: 'bubble', col: 'cyan', kind: 'stop', data: { decel: 46, stop: .06, fric: .95, die: 460 } });
        if (every(t, 70)) fan(b, { n: 5, spread: .4, spd: 4.6, aim: true, col: 'white', shape: 'kunai' });
        if (every(t, 110)) ring(b, { n: 18, spd: 2.6, col: 'gold', aim: true, off: t * .015 });
      } },
      { name: '终句 「星咏 · 永夜归航」', hp: 950, time: 2600, bg: 'gold', final: true, fn(b, t) {
        if (every(t, 3)) {
          for (let i = 0; i < 6; i++)
            PAT.SB({ x: b.x, y: b.y, spd: 2.3, ang: t * .026 + i * TAU / 6, shape: 'circle', col: i % 2 ? 'gold' : 'violet' });
        }
        if (every(t, 46)) {
          for (let i = 0; i < 3; i++)
            PAT.SB({ x: b.x, y: b.y, spd: 4.3, ang: aimAng(b) + rnd(-.3, .3), shape: 'star', col: 'silver' });
        }
        if (every(t, 120)) laser({ x: b.x, y: b.y, ang: aimAng(b), warn: 36, active: 20, w: 26, col: 'gold' });
        if (every(t, 90)) b.mq = [[rnd(120, F.w - 120), rnd(60, 140), 44]];
      } }
    ],
    pre: [
      { s: 'b', t: '……来了。幻想乡的巫女，与魔法使。' },
      { s: 'b', t: '我是星见咏。月都的咏者——这首『永夜之诗』的作者。' },
      { s: 'p', t: '你想用六扇门，把幻想乡变成一片静止的星空。' },
      { s: 'b', t: '是的。我在星之命运里读到：大结界终将衰弱，幻想乡终将破碎。' },
      { s: 'b', t: '与其在痛苦中碎掉——不如在最美的瞬间，永远停下。' },
      { s: 'p', t: '会结束的东西才美丽。樱花正因为会凋谢，才美。' },
      { s: 'p', t: '被定格的美不是美，是标本。今天我就用弹幕，把『明天』抢回来！' },
      { s: 'b', t: '……多么傲慢的答案。那就让我看看，你们的『今天』，能否胜过我的『永远』！' }
    ],
    post: [
      { s: 'b', t: '啊……星光，都回到天上去了。' },
      { s: 'b', t: '我读了一千年的命运，却没有读过『改变』……' },
      { s: 'p', t: '那是因为『改变』不在星星上——在这里。' },
      { s: 'b', t: '……原来是未完待续的句子。这首诗，我重新写。' },
      { s: 'p', t: '写完之后寄到博丽神社来。我们边喝茶边读。' },
      { s: 'b', t: '……一言为定。那么，再会了，幻想乡的诸君。' }
    ]
  };

  /* ================= 关卡波次脚本 ================= */
  const scripts = {};

  scripts[0] = S => {
    S.wave(140, sweep({ left: true, y: 130, col: 'blue', n: 3 }));
    S.wave(260, sweep({ left: false, y: 190, col: 'cyan', n: 3 }));
    S.multi(380, 5, 26, i => sweep({ left: i % 2 === 0, y: 100 + (i % 3) * 60, col: 'blue', every: 50 }));
    S.multi(700, 4, 40, i => dive({ x: 80 + i * 105, y: 110, col: 'cyan', n: 12, bcol: 'blue' }));
    S.multi(980, 3, 30, i => sweep({ left: true, y: 90 + i * 55, col: 'blue', n: 2, spd: 3.4, every: 42 }));
    S.wave(1180, hover({ x: 120, y: 130, col: 'cyan', n: 12, stay: 260 }));
    S.wave(1290, hover({ x: 360, y: 130, col: 'blue', n: 12, stay: 260 }));
    S.multi(1500, 3, 36, i => turret({ x: 110 + i * 130, y: 120, col: 'blue', n: 5, bcol: 'cyan' }));
    S.multi(1750, 6, 22, i => sweep({ left: i % 2 === 0, y: 80 + (i % 4) * 50, col: i % 2 ? 'cyan' : 'blue', n: 3, spd: 3.2, every: 48 }));
    S.wave(2050, dive({ x: F.w / 2, y: 100, col: 'blue', n: 16, bcol: 'cyan', shape: 'star' }));
    S.multi(2250, 4, 40, i => sweep({ left: i % 2 === 0, y: 140 + (i % 2) * 70, col: 'blue', n: 4, spread: .8, every: 40 }));
    S.wave(2550, turret({ x: F.w / 2, y: 110, col: 'violet', n: 7, spread: 1.1, bcol: 'violet' }));
    S.multi(2800, 5, 26, i => sweep({ left: i % 2 === 0, y: 90 + (i % 3) * 65, col: 'cyan', n: 3, spd: 3.6, every: 44 }));
    S.wave(3150, hover({ x: F.w / 2, y: 150, col: 'blue', n: 16, stay: 300, bcol: 'blue' }));
    S.multi(3450, 4, 34, i => dive({ x: 70 + i * 115, y: 100, col: 'cyan', n: 10, bcol: 'blue' }));
    S.multi(3750, 6, 20, i => sweep({ left: i % 2 === 0, y: 70 + (i % 5) * 45, col: 'blue', n: 2, spd: 3.8, every: 38 }));
    S.midboss(4050, 'ruri');
    S.multi(4300, 6, 24, i => sweep({ left: i % 2 === 0, y: 100 + (i % 3) * 60, col: 'blue', n: 3, spd: 3.4, every: 46 }));
    S.boss(4900, 'ruri');
  };

  scripts[1] = S => {
    S.multi(140, 6, 24, i => sweep({ left: i % 2 === 0, y: 90 + (i % 3) * 55, col: 'red', n: 3, bcol: 'orange', every: 50 }));
    S.multi(450, 4, 36, i => dive({ x: 80 + i * 105, y: 120, col: 'orange', n: 12, bcol: 'red' }));
    S.wave(760, hover({ x: 130, y: 120, col: 'red', n: 14, stay: 280, bcol: 'orange' }));
    S.multi(1000, 3, 30, i => turret({ x: 120 + i * 120, y: 110, col: 'red', n: 5, bcol: 'orange' }));
    S.multi(1300, 6, 22, i => sweep({ left: i % 2 === 0, y: 70 + (i % 4) * 48, col: 'orange', n: 2, spd: 3.5, bcol: 'red', every: 42 }));
    S.wave(1600, dive({ x: F.w / 2, y: 90, col: 'red', n: 18, bcol: 'orange', shape: 'star' }));
    S.multi(1850, 4, 40, i => sweep({ left: i < 2, y: 110 + (i % 2) * 80, col: 'orange', n: 4, spread: .9, bcol: 'red' }));
    S.midboss(2150, 'rin');
    S.multi(2450, 5, 26, i => sweep({ left: i % 2 === 0, y: 100 + (i % 3) * 60, col: 'red', n: 3, bcol: 'orange', every: 46 }));
    S.multi(2800, 4, 38, i => turret({ x: 100 + i * 90, y: 100 + (i % 2) * 60, col: 'violet', n: 6, bcol: 'red' }));
    S.multi(3150, 6, 20, i => dive({ x: 60 + i * 75, y: 90 + (i % 2) * 60, col: 'orange', n: 10, bcol: 'red' }));
    S.wave(3500, hover({ x: F.w / 2, y: 140, col: 'red', n: 18, stay: 320, bcol: 'orange' }));
    S.multi(3800, 6, 22, i => sweep({ left: i % 2 === 0, y: 80 + (i % 4) * 52, col: 'red', n: 3, spd: 3.8, bcol: 'orange', every: 40 }));
    S.boss(4900, 'rin');
  };

  scripts[2] = S => {
    S.multi(140, 5, 26, i => sweep({ left: i % 2 === 0, y: 100 + (i % 3) * 58, col: 'orange', n: 3, bcol: 'red', every: 48 }));
    S.multi(480, 4, 36, i => dive({ x: 80 + i * 105, y: 110, col: 'red', n: 14, bcol: 'orange' }));
    S.multi(800, 3, 30, i => turret({ x: 120 + i * 120, y: 110, col: 'orange', n: 6, bcol: 'red' }));
    S.wave(1100, hover({ x: 120, y: 120, col: 'orange', n: 14, stay: 280, bcol: 'red' }));
    S.wave(1200, hover({ x: 360, y: 120, col: 'red', n: 14, stay: 280, bcol: 'orange' }));
    S.multi(1500, 6, 22, i => sweep({ left: i % 2 === 0, y: 70 + (i % 4) * 50, col: i % 2 ? 'orange' : 'red', n: 2, spd: 3.6, bcol: 'orange', every: 42 }));
    S.midboss(1800, 'momiji');
    S.multi(2100, 5, 26, i => dive({ x: 70 + i * 85, y: 100 + (i % 2) * 55, col: 'orange', n: 12, bcol: 'red' }));
    S.multi(2450, 4, 40, i => turret({ x: 110 + i * 85, y: 105, col: 'red', n: 7, bcol: 'orange' }));
    S.wave(2800, dive({ x: F.w / 2, y: 90, col: 'red', n: 20, bcol: 'orange', shape: 'star' }));
    S.multi(3100, 6, 22, i => sweep({ left: i % 2 === 0, y: 80 + (i % 4) * 55, col: 'orange', n: 3, spd: 3.8, bcol: 'red', every: 40 }));
    S.multi(3450, 4, 36, i => hover({ x: 100 + i * 95, y: 110, col: 'red', n: 10, stay: 250, bcol: 'orange' }));
    S.multi(3800, 6, 20, i => sweep({ left: i % 2 === 0, y: 60 + (i % 5) * 46, col: 'orange', n: 2, spd: 4.0, bcol: 'red', every: 38 }));
    S.boss(4900, 'momiji');
  };

  scripts[3] = S => {
    S.multi(140, 6, 24, i => sweep({ left: i % 2 === 0, y: 90 + (i % 3) * 55, col: 'cyan', n: 3, bcol: 'white', every: 50 }));
    S.multi(480, 4, 36, i => dive({ x: 80 + i * 105, y: 115, col: 'white', n: 12, bcol: 'cyan' }));
    S.multi(800, 3, 30, i => turret({ x: 120 + i * 120, y: 105, col: 'cyan', n: 5, bcol: 'blue' }));
    S.wave(1120, hover({ x: 130, y: 125, col: 'cyan', n: 14, stay: 280, bcol: 'white' }));
    S.multi(1400, 6, 22, i => sweep({ left: i % 2 === 0, y: 70 + (i % 4) * 50, col: 'white', n: 2, spd: 3.4, bcol: 'cyan', every: 44 }));
    S.midboss(1700, 'shizu');
    S.multi(2000, 5, 26, i => dive({ x: 70 + i * 85, y: 100 + (i % 2) * 55, col: 'cyan', n: 14, bcol: 'white' }));
    S.multi(2350, 4, 40, i => turret({ x: 110 + i * 85, y: 100, col: 'blue', n: 6, bcol: 'cyan' }));
    S.multi(2700, 6, 22, i => sweep({ left: i % 2 === 0, y: 80 + (i % 4) * 52, col: 'cyan', n: 3, spd: 3.6, bcol: 'white', every: 42 }));
    S.wave(3050, hover({ x: F.w / 2, y: 130, col: 'white', n: 18, stay: 300, bcol: 'cyan' }));
    S.multi(3350, 4, 36, i => dive({ x: 80 + i * 105, y: 95, col: 'cyan', n: 12, bcol: 'blue' }));
    S.multi(3700, 6, 20, i => sweep({ left: i % 2 === 0, y: 60 + (i % 5) * 46, col: 'white', n: 2, spd: 3.8, bcol: 'cyan', every: 38 }));
    S.boss(4900, 'shizu');
  };

  scripts[4] = S => {
    S.multi(140, 5, 26, i => sweep({ left: i % 2 === 0, y: 95 + (i % 3) * 56, col: 'violet', n: 3, bcol: 'magenta', every: 48 }));
    S.multi(460, 4, 36, i => dive({ x: 80 + i * 105, y: 110, col: 'magenta', n: 14, bcol: 'violet' }));
    S.multi(780, 3, 30, i => turret({ x: 120 + i * 120, y: 105, col: 'violet', n: 6, bcol: 'magenta' }));
    S.wave(1080, hover({ x: 120, y: 120, col: 'violet', n: 14, stay: 280, bcol: 'cyan' }));
    S.wave(1180, hover({ x: 360, y: 120, col: 'cyan', n: 14, stay: 280, bcol: 'violet' }));
    S.multi(1480, 6, 22, i => sweep({ left: i % 2 === 0, y: 70 + (i % 4) * 50, col: i % 2 ? 'violet' : 'magenta', n: 2, spd: 3.6, bcol: 'violet', every: 42 }));
    S.midboss(1780, 'shion');
    S.multi(2080, 5, 26, i => dive({ x: 70 + i * 85, y: 100 + (i % 2) * 55, col: 'violet', n: 14, bcol: 'magenta' }));
    S.multi(2430, 4, 40, i => turret({ x: 110 + i * 85, y: 100, col: 'magenta', n: 7, bcol: 'violet' }));
    S.wave(2780, dive({ x: F.w / 2, y: 90, col: 'violet', n: 20, bcol: 'magenta', shape: 'star' }));
    S.multi(3080, 6, 22, i => sweep({ left: i % 2 === 0, y: 80 + (i % 4) * 55, col: 'violet', n: 3, spd: 3.8, bcol: 'cyan', every: 40 }));
    S.multi(3420, 4, 36, i => hover({ x: 100 + i * 95, y: 110, col: 'magenta', n: 10, stay: 250, bcol: 'violet' }));
    S.multi(3750, 6, 20, i => sweep({ left: i % 2 === 0, y: 60 + (i % 5) * 46, col: 'violet', n: 2, spd: 4.0, bcol: 'magenta', every: 38 }));
    S.boss(4900, 'shion');
  };

  scripts[5] = S => {
    S.multi(140, 6, 24, i => sweep({ left: i % 2 === 0, y: 90 + (i % 3) * 55, col: 'silver', n: 3, bcol: 'gold', every: 46 }));
    S.multi(440, 4, 34, i => dive({ x: 80 + i * 105, y: 110, col: 'gold', n: 14, bcol: 'silver' }));
    S.multi(760, 4, 32, i => turret({ x: 100 + i * 90, y: 100 + (i % 2) * 55, col: 'violet', n: 6, bcol: 'gold' }));
    S.wave(1080, hover({ x: 130, y: 120, col: 'gold', n: 16, stay: 280, bcol: 'silver' }));
    S.multi(1360, 6, 22, i => sweep({ left: i % 2 === 0, y: 70 + (i % 4) * 50, col: 'silver', n: 2, spd: 3.6, bcol: 'gold', every: 42 }));
    S.midboss(1660, 'ei');
    S.multi(1960, 5, 24, i => dive({ x: 70 + i * 85, y: 95 + (i % 2) * 55, col: 'gold', n: 16, bcol: 'silver' }));
    S.multi(2300, 4, 36, i => turret({ x: 110 + i * 85, y: 100, col: 'silver', n: 7, bcol: 'gold' }));
    S.wave(2640, dive({ x: F.w / 2, y: 85, col: 'gold', n: 22, bcol: 'silver', shape: 'star' }));
    S.multi(2940, 6, 20, i => sweep({ left: i % 2 === 0, y: 75 + (i % 4) * 52, col: i % 2 ? 'gold' : 'silver', n: 3, spd: 4.0, bcol: 'violet', every: 38 }));
    S.multi(3280, 4, 34, i => hover({ x: 100 + i * 95, y: 105, col: 'silver', n: 12, stay: 250, bcol: 'gold' }));
    S.multi(3600, 8, 18, i => sweep({ left: i % 2 === 0, y: 55 + (i % 5) * 46, col: 'gold', n: 2, spd: 4.2, bcol: 'silver', every: 36 }));
    S.multi(3950, 4, 30, i => turret({ x: 120 + i * 85, y: 95, col: 'violet', n: 8, bcol: 'gold' }));
    S.boss(4600, 'ei');
  };

  /* ---------------- 序幕 ---------------- */
  const PROLOGUE = [
    { s: 'n', t: '初秋 · 幻想乡' },
    { s: 'n', t: '一夜之间，星屑如雨坠落。' },
    { s: 'n', t: '六扇『星门』在幻想乡各处悄然张开，门后传来静止的歌声——' },
    { s: 'n', t: '若放任不管，幻想乡将被『永远美丽的瞬间』吞没。' },
    { s: 'p', t: '又是不让人睡觉的异变啊。上吧！' }
  ];

  /* ---------------- 关卡信息 ---------------- */
  const list = [
    { title: '第一夜 碎星之丘', sub: 'Spring Hill of Falling Stars', bg: 0, boss: 'ruri' },
    { title: '第二夜 妖祭焰川', sub: 'Night Festival on the Fire River', bg: 1, boss: 'rin' },
    { title: '第三夜 红叶落神', sub: 'God of the Falling Leaves', bg: 2, boss: 'momiji' },
    { title: '第四夜 静雪之祠', sub: 'Shrine of the Silent Snow', bg: 3, boss: 'shizu' },
    { title: '第五夜 星降之湖', sub: 'Lake of the Falling Stars', bg: 4, boss: 'shion' },
    { title: '最终夜 月之彼岸', sub: 'The Far Shore of the Moon', bg: 5, boss: 'ei' }
  ];

  return { list, BOSSES, PROLOGUE, scripts };
})();
window.STAGES = STAGES;
