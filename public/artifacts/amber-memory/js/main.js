(async function () {
  const canvas = document.getElementById('game');
  const game = new Game(canvas);

  window.addEventListener('keydown', (e) => {
    game.keys[e.key] = true;
    if (e.key === 'z' || e.key === 'Z') game.keys._zTap = true;
    if (e.key === 'x' || e.key === 'X') game.keys._xTap = true;
    if (e.key === 'c' || e.key === 'C') game.keys._cTap = true;
    if (e.key === 'ArrowUp') game.keys._upTap = true;
    if (e.key === 'ArrowDown') game.keys._downTap = true;
    if (e.key === 'Escape') game.keys._escTap = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { game.keys[e.key] = false; });

  try {
    await loadAllAssets();
  } catch (err) {
    console.error(err);
    document.getElementById('hint').textContent = '资源加载失败，请用本地静态服务打开（见 README）';
  }

  const params = new URLSearchParams(location.search);
  const debugPhase = params.get('phase');
  if (debugPhase) {
    if (debugPhase === 'stage2') {
      game.startStage2();
    } else if (debugPhase === 'kyouko') {
      game.startStage2();
      game.director.phase = 'boss';
      game.director.done.boss = true;
      game.startBoss2();
      game.boss.y = game.boss.targetY;
      game.startDialog2();
    } else if (debugPhase === 'stage3') {
      game.startStage3();
    } else if (debugPhase === 'tama') {
      game.startStage3();
      game.director.phase = 'boss';
      game.director.done.boss = true;
      game.startBoss3();
      game.boss.y = game.boss.targetY;
      game.startDialog3();
    } else if (debugPhase === 'stage4') {
      game.startStage4();
    } else if (debugPhase === 'akyuu') {
      game.startStage4();
      game.director.done.mid = true;
      game.director.t = 99;
      game.startMidAkyuu();
      game.boss.y = game.boss.targetY;
      game.startDialogMid4();
    } else if (debugPhase === 'sumizome') {
      game.startStage4();
      game.director.phase = 'boss';
      game.director.done.boss = true;
      game.director.done.postStart = true;
      game.startBoss4();
      game.boss.y = game.boss.targetY;
      game.startDialog4();
    } else if (debugPhase === 'stage5') {
      game.startStage5();
    } else if (debugPhase === 'kohaku') {
      game.startStage5();
      game.director.phase = 'boss';
      game.director.done.boss = true;
      game.startBoss5();
      game.boss.y = game.boss.targetY;
      game.startDialog5();
    } else if (debugPhase === 'stage6') {
      game.startStage6();
    } else if (debugPhase === 'kuon') {
      game.startStage6();
      game.director.phase = 'boss';
      game.director.done.boss = true;
      game.startBoss6();
      game.boss.y = game.boss.targetY;
      game.startDialog6();
    } else if (debugPhase === 'last') {
      game.startStage6();
      game.director.phase = 'boss';
      game.director.done.boss = true;
      game.startBoss6();
      game.boss.y = game.boss.targetY;
      game.boss.setPhase('p7_last', 2800, 60);
      game.boss.invuln = false;
      game.boss.spellName = '「琥珀色泽的永恒刹那（Ephemeral Amber）」';
      game.dialog = null;
      game.state = 'play';
      game.toast('Last Spell');
    } else if (debugPhase === 'music') {
      game.openMusicRoom();
    } else if (debugPhase === 'ex') {
      game.startStageEx();
    } else if (debugPhase === 'kohaku_ex') {
      game.startStageEx();
      game.director.done.mid = true;
      game.director.t = 99;
      game.startMidEx();
      game.boss.y = game.boss.targetY;
      game.boss.setPhase('m1_nonspell', 1000, 30);
      game.boss.invuln = false;
      game.state = 'play';
      game.toast('Mid Boss · 琥珀 Ex');
    } else if (debugPhase === 'shoku') {
      game.startStageEx();
      game.director.phase = 'boss';
      game.director.done.boss = true;
      game.director.done.postStart = true;
      game.startBossEx();
      game.boss.y = game.boss.targetY;
      game.startDialogEx();
    } else if (/^e([1-9]|10)$/.test(debugPhase)) {
      game.startStageEx();
      game.director.phase = 'boss';
      game.director.done.boss = true;
      game.startBossEx();
      game.boss.y = game.boss.targetY;
      const specs = {
        e1: [2000, 40, '牙符「咬碎日晷的饕餮之颚」'],
        e2: [2100, 40, '吞噬「被省略的周三与周四」'],
        e3: [2200, 45, '龙息「焚尽年表的高热白光」'],
        e4: [2200, 45, '空白「史书上被撕去的一百页」'],
        e5: [2300, 45, '逆鳞「倒悬于地底的太古昼夜」'],
        e6: [2400, 50, '暴食「三千世界的一口闷」'],
        e7: [2400, 50, '因果「未曾开弓便已命中的箭矢」'],
        e8: [2500, 50, '荒神「寸草不生的无铭纪元」'],
        e9: [2600, 55, '耐久：「哪怕永恒也只需三口（Three Bites of Eternity）」'],
        e10: [3000, 65, '终符：「吞尽刹那与久远的纯白之颚（Chrono-Devourer）」'],
      };
      const [hp, lim, name] = specs[debugPhase];
      game.boss.setPhase(debugPhase, hp, lim);
      game.boss.invuln = false;
      game.boss.spellName = name;
      game.dialog = null;
      game.state = 'play';
      game.toast(name);
    } else if (debugPhase === 'boss' || debugPhase === 'spell1' || debugPhase === 'spell2' || debugPhase === 'ns2') {
      game.resetRun();
      game.enemies = [];
      game.enemyBullets = [];
      game.director.phase = 'boss';
      game.director.done.boss = true;
      game.startBoss();
      game.boss.y = game.boss.targetY;
      if (debugPhase === 'spell1') {
        game.toSpell1();
        game.spellFlash = 0.5;
      } else if (debugPhase === 'ns2') {
        game.toNonspell2();
      } else if (debugPhase === 'spell2') {
        game.toSpell2();
        game.spellFlash = 0.5;
      } else {
        game.startDialog();
      }
    }
  }

  let last = performance.now();
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;
    game.update(dt);
    game.draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
