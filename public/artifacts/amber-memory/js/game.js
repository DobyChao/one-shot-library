const STATE = { TITLE: 'title', PLAY: 'play', DIALOG: 'dialog', CLEAR: 'clear', GAMEOVER: 'gameover', MUSIC: 'music' };

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.keys = {};
    this.state = STATE.TITLE;
    this.player = new Player();
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.boss = null;
    this.director = new Stage1Director(this);
    this.dialog = null;
    this.dialogIdx = 0;
    this.dialogMode = 'pre'; // pre | post
    this.bgScroll = 0;
    this.particles = [];
    this.spellFlash = 0;
    this.message = '';
    this.messageT = 0;
    this.bgmCue = '';
    this.musicIdx = 0;
    this._musicAudio = null;
    this._musicPlayingId = null;
    this.stage = 1;
    this.echoQueue = [];
    this.scrollKick = 0;
  }
  resetRun() {
    this.player = new Player();
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.boss = null;
    this.stage = 1;
    this.echoQueue = [];
    this.slowZones = [];
    this.director = new Stage1Director(this);
    this.dialog = null;
    this.spellFlash = 0;
    this.state = STATE.PLAY;
    this.bgmCue = '道中《秋水不渡昨日之舟》';
  }
  startStage2() {
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.boss = null;
    this.stage = 2;
    this.echoQueue = [];
    this.director = new Stage2Director(this);
    this.dialog = null;
    this.spellFlash = 0;
    this.state = STATE.PLAY;
    this.bgmCue = '道中《三百次初见的林间小径》';
    this.toast('Stage 2');
  }
  queueEcho(delay, fn) {
    this.echoQueue.push({ t: delay, fn });
  }
  startBoss2() {
    this.boss = new BossKyouko();
    this.boss.setPhase('enter', 1300, 0);
    this.enemyBullets = [];
    this.bgmCue = 'Boss《古杉树冠的昨日闲谈》';
  }
  startDialog2() {
    this.boss.phase = 'dialog';
    this.boss.invuln = true;
    this.dialogMode = 'pre2';
    this.dialog = DIALOG_S2_PRE;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
  }
  startStage3() {
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.boss = null;
    this.stage = 3;
    this.echoQueue = [];
    this.scrollKick = 0;
    this.director = new Stage3Director(this);
    this.dialog = null;
    this.spellFlash = 0;
    this.state = STATE.PLAY;
    this.bgmCue = '道中《青苔石阶上的旧算筹》';
    this.toast('Stage 3');
  }
  startBoss3() {
    this.boss = new BossTama();
    this.boss.setPhase('enter', 1400, 0);
    this.enemyBullets = [];
    this.bgmCue = 'Boss《拨动黄昏的五珠算盘》';
  }
  startDialog3() {
    this.boss.phase = 'dialog';
    this.boss.invuln = true;
    this.dialogMode = 'pre3';
    this.dialog = DIALOG_S3_PRE;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
  }
  startBoss() {
    this.boss = new Boss();
    this.boss.setPhase('enter', 1200, 0);
    this.enemyBullets = [];
    this.bgmCue = 'Boss 入场';
  }
  startDialog() {
    this.boss.phase = 'dialog';
    this.boss.invuln = true;
    this.dialogMode = 'pre';
    this.dialog = DIALOG_PRE;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
  }
  advanceDialog() {
    this.dialogIdx++;
    if (this.dialogIdx >= this.dialog.length) {
      if (this.dialogMode === 'pre') {
        this.state = STATE.PLAY;
        this.boss.setPhase('p1_nonspell', 1200, 35);
        this.boss.invuln = false;
        this.bgmCue = 'Boss《指缝间的金色細沙》';
        this.toast('Nonspell');
      } else if (this.dialogMode === 'pre2') {
        this.state = STATE.PLAY;
        this.boss.setPhase('p1_nonspell', 1300, 35);
        this.boss.invuln = false;
        this.boss._a = null;
        this.toast('Nonspell');
      } else if (this.dialogMode === 'post') {
        // Stage1 clear → Stage2
        this.dialog = null;
        this.startStage2();
        return;
      } else if (this.dialogMode === 'pre3') {
        this.state = STATE.PLAY;
        this.boss.setPhase('p1_nonspell', 1400, 35);
        this.boss.invuln = false;
        this.boss._a = null;
        this.toast('Nonspell');
      } else if (this.dialogMode === 'post2') {
        this.dialog = null;
        this.startStage3();
        return;
      } else if (this.dialogMode === 'post3') {
        this.dialog = null;
        this.startStage4();
        return;
      } else if (this.dialogMode === 'mid4') {
        this.state = STATE.PLAY;
        this.boss.setPhase('m1_nonspell', 900, 28);
        this.boss.invuln = false;
        this.boss._a = null;
        this.toast('Mid Boss');
      } else if (this.dialogMode === 'pre4') {
        this.state = STATE.PLAY;
        this.boss.setPhase('p1_nonspell', 1500, 35);
        this.boss.invuln = false;
        this.boss._a = null;
        this.toast('Nonspell');
      } else if (this.dialogMode === 'post4') {
        this.dialog = null;
        this.startStage5();
        return;
      } else if (this.dialogMode === 'pre5') {
        this.state = STATE.PLAY;
        this.boss.setPhase('p1_nonspell', 1600, 35);
        this.boss.invuln = false;
        this.boss._a = null;
        this.toast('Nonspell');
      } else if (this.dialogMode === 'post5') {
        this.dialog = null;
        this.startStage6();
        return;
      } else if (this.dialogMode === 'pre6') {
        this.state = STATE.PLAY;
        this.boss.setPhase('p1_nonspell', 1800, 35);
        this.boss.invuln = false;
        this.boss._a = null;
        this.toast('Nonspell');
      } else if (this.dialogMode === 'post6') {
        this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.CLEAR;
      } else if (this.dialogMode === 'preEx') {
        this.state = STATE.PLAY;
        this.boss.setPhase('e1', 2000, 40);
        this.boss.invuln = false;
        this.boss.spellName = '牙符「咬碎日晷的饕餮之颚」';
        this.boss._e = null;
        this.toast(this.boss.spellName);
      } else if (this.dialogMode === 'postEx') {
        this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.CLEAR;
      } else {
        this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.CLEAR;
      }
      this.dialog = null;
    }
  }
  onBossPhaseTimeout() {
    if (!this.boss) return;
    if (this.boss.phase === 'p1_nonspell') this.toSpell1();
    else if (this.boss.phase === 'p2_spell1') this.toNonspell2();
    else if (this.boss.phase === 'p3_nonspell2') this.toSpell2();
    else if (this.boss.phase === 'p4_spell2') this.onSpell2End();
  }
  toSpell1() {
    this.enemyBullets = [];
    this._pendingSpell = 'spell1';
    this.boss.setPhase('spell_declare', 1600, 0);
    this.boss.spellName = '水符「逆流的二十四刻」';
    this.spellFlash = 2.2;
    this.toast(this.boss.spellName);
    this.bgmCue = '符卡《逆流的二十四刻》';
  }
  beginSpell1Combat() {
    this.boss.setPhase('p2_spell1', 1600, 45);
    this.boss.invuln = false;
    this.boss._spAcc = { clock: 0.8, rain: 0, side: 0 };
  }
  toNonspell2() {
    this.enemyBullets = [];
    this.boss.setPhase('p3_nonspell2', 1400, 35);
    this.boss.invuln = false;
    this.boss._ns2 = null;
    this.boss.spellName = '';
    this.toast('Nonspell 2');
  }
  toSpell2() {
    this.enemyBullets = [];
    this.playerHistory = [];
    this._pendingSpell = 'spell2';
    this.boss.setPhase('spell_declare', 1800, 0);
    this.boss.spellName = '砂漏「抓不住的昨日倒影」';
    this.spellFlash = 2.2;
    this.toast(this.boss.spellName);
    this.bgmCue = '符卡《抓不住的昨日倒影》';
  }
  beginSpell2Combat() {
    this.boss.setPhase('p4_spell2', 1800, 50);
    this.boss.invuln = false;
    this.boss._sp2 = { glass: 1.0, mirror: 1.2, sand: 0 };
    this.boss.mirrors = [
      { x: W * 0.22, y: this.boss.y },
      { x: W * 0.78, y: this.boss.y },
    ];
  }
  onSpell2End() {
    this.enemyBullets = [];
    this.boss.alive = false;
    this.dialogMode = 'post';
    this.dialog = DIALOG_POST;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
    this.toast('Spell Card Bonus!');
  }
  onBoss2Timeout() {
    if (!this.boss) return;
    const p = this.boss.phase;
    if (p === 'p1_nonspell') this.toKSpell1();
    else if (p === 'p2_spell1') this.toKNs2();
    else if (p === 'p3_nonspell2') this.toKSpell2();
    else if (p === 'p4_spell2') this.toKSpell3();
    else if (p === 'p5_spell3') this.onKSpell3End();
  }
  toKSpell1() {
    this.enemyBullets = []; this.echoQueue = [];
    this._pendingSpell = 'kspell1';
    this.boss.setPhase('spell_declare', 1700, 0);
    this.boss.spellName = '木灵「迟到十年的山彦」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toKNs2() {
    this.enemyBullets = []; this.echoQueue = [];
    this.boss.setPhase('p3_nonspell2', 1500, 35);
    this.boss.invuln = false; this.boss._n2 = null; this.boss.spellName = '';
    this.toast('Nonspell 2');
  }
  toKSpell2() {
    this.enemyBullets = [];
    this._pendingSpell = 'kspell2';
    this.boss.setPhase('spell_declare', 1900, 0);
    this.boss.spellName = '年轮「迷失于第七百圈的秋风」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toKSpell3() {
    this.enemyBullets = []; this.playerHistory = [];
    this._pendingSpell = 'kspell3';
    this.boss.setPhase('spell_declare', 2000, 0);
    this.boss.spellName = '残响「昨日之我的二重唱」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  beginKSpell1() {
    this.boss.setPhase('p2_spell1', 1700, 45);
    this.boss.invuln = false; this.boss._s1 = { fan: 0.8, rain: 0 };
  }
  beginKSpell2() {
    this.boss.setPhase('p4_spell2', 1900, 50);
    this.boss.invuln = false; this.boss._s2 = null;
  }
  beginKSpell3() {
    this.boss.setPhase('p5_spell3', 2000, 55);
    this.boss.invuln = false; this.boss._s3 = null; this.boss.shadowSummons = 0; this.boss.shadowAlly = null;
  }
  onKSpell3End() {
    this.enemyBullets = [];
    this.boss.alive = false;
    this.dialogMode = 'post2';
    this.dialog = DIALOG_S2_POST;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
    this.toast('Spell Card Bonus!');
  }
  onBoss3Timeout() {
    if (!this.boss) return;
    const p = this.boss.phase;
    if (p === 'p1_nonspell') this.toTSpell1();
    else if (p === 'p2_spell1') this.toTNs2();
    else if (p === 'p3_nonspell2') this.toTSpell2();
    else if (p === 'p4_spell2') this.toTSpell3();
    else if (p === 'p5_spell3') this.onTSpell3End();
  }
  toTSpell1() {
    this.enemyBullets = []; this.echoQueue = [];
    this._pendingSpell = 'tspell1';
    this.boss.setPhase('spell_declare', 1800, 0);
    this.boss.spellName = '算符「归除不尽的流年」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toTNs2() {
    this.enemyBullets = [];
    this.boss.setPhase('p3_nonspell2', 1600, 35);
    this.boss.invuln = false; this.boss._n2 = null; this.boss.spellName = '';
    this.toast('Nonspell 2');
  }
  toTSpell2() {
    this.enemyBullets = [];
    this._pendingSpell = 'tspell2';
    this.boss.setPhase('spell_declare', 2000, 0);
    this.boss.spellName = '债符「向昨日借来的五分春光」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toTSpell3() {
    this.enemyBullets = [];
    this._pendingSpell = 'tspell3';
    this.boss.setPhase('spell_declare', 2100, 0);
    this.boss.spellName = '珠算「颠倒黑白的黄金算盘」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  beginTSpell1() {
    this.boss.setPhase('p2_spell1', 1800, 45);
    this.boss.invuln = false; this.boss._s1 = { ring: 0.5, rod: 0, wave: 0 };
  }
  beginTSpell2() {
    this.boss.setPhase('p4_spell2', 2000, 50);
    this.boss.invuln = false; this.boss._s2 = null; this.boss.safeBands = [];
  }
  beginTSpell3() {
    this.boss.setPhase('p5_spell3', 2100, 55);
    this.boss.invuln = false; this.boss._s3 = null;
  }
  onTSpell3End() {
    this.enemyBullets = [];
    this.boss.alive = false;
    this.dialogMode = 'post3';
    this.dialog = DIALOG_S3_POST;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
    this.toast('Spell Card Bonus!');
  }
  startStage4() {
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.boss = null;
    this.stage = 4;
    this.echoQueue = [];
    this.scrollKick = 0;
    this.playerHistory = [];
    this.director = new Stage4Director(this);
    this.dialog = null;
    this.spellFlash = 0;
    this.state = STATE.PLAY;
    this.bgmCue = '道中《不翻页的昨日物语》';
    this.toast('Stage 4');
  }
  startMidAkyuu() {
    this.boss = new MidAkyuu();
    this.boss.setPhase('enter', 900, 0);
    this.enemyBullets = [];
    this.bgmCue = '中Boss《被装裱的百年一刻》';
  }
  startDialogMid4() {
    this.boss.phase = 'dialog';
    this.boss.invuln = true;
    this.dialogMode = 'mid4';
    this.dialog = DIALOG_S4_MID;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
  }
  startBoss4() {
    this.boss = new BossSumizome();
    this.boss.setPhase('enter', 1500, 0);
    this.enemyBullets = [];
    this.bgmCue = 'Boss《墨迹未干的千年残卷》';
  }
  startDialog4() {
    this.boss.phase = 'dialog';
    this.boss.invuln = true;
    this.dialogMode = 'pre4';
    this.dialog = DIALOG_S4_PRE;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
  }
  onMid4Timeout() {
    if (!this.boss || !(this.boss instanceof MidAkyuu)) return;
    const p = this.boss.phase;
    if (p === 'm1_nonspell') this.toMidSpell();
    else if (p === 'm2_spell') this.onMid4End();
  }
  toMidSpell() {
    this.enemyBullets = [];
    this._pendingSpell = 'midspell';
    this.boss.setPhase('spell_declare', 1100, 0);
    this.boss.spellName = '幻史「被装裱的百年一刻」';
    this.spellFlash = 2.2;
    this.toast(this.boss.spellName);
  }
  beginMidSpell() {
    this.boss.setPhase('m2_spell', 1100, 35);
    this.boss.invuln = false;
    this.boss._s = null;
    this.boss.frames = [];
  }
  onMid4End() {
    this.enemyBullets = [];
    this.boss.alive = false;
    this.boss = null;
    this.toast('Mid Clear');
    this.director.beginPostMid();
    this.bgmCue = '道中《不翻页的昨日物语》';
  }
  onBoss4Timeout() {
    if (!this.boss) return;
    const p = this.boss.phase;
    if (p === 'p1_nonspell') this.toSSpell1();
    else if (p === 'p2_spell1') this.toSNs2();
    else if (p === 'p3_nonspell2') this.toSSpell2();
    else if (p === 'p4_spell2') this.toSSpell3();
    else if (p === 'p5_spell3') this.toSSpell4();
    else if (p === 'p6_spell4') this.onSSpell4End();
  }
  toSSpell1() {
    this.enemyBullets = [];
    this._pendingSpell = 'sspell1';
    this.boss.setPhase('spell_declare', 1900, 0);
    this.boss.spellName = '墨符「装订成册的今日黄昏」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toSNs2() {
    this.enemyBullets = [];
    this.boss.setPhase('p3_nonspell2', 1600, 35);
    this.boss.invuln = false; this.boss._n2 = null; this.boss.spellName = '';
    this.toast('Nonspell 2');
  }
  toSSpell2() {
    this.enemyBullets = [];
    this._pendingSpell = 'sspell2';
    this.boss.setPhase('spell_declare', 2000, 0);
    this.boss.spellName = '史笔「涂抹不掉的既定败局」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toSSpell3() {
    this.enemyBullets = [];
    this._pendingSpell = 'sspell3';
    this.boss.setPhase('spell_declare', 2100, 0);
    this.boss.spellName = '文车「碾过白纸的百年车辙」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toSSpell4() {
    this.enemyBullets = [];
    this.playerHistory = [];
    this._pendingSpell = 'sspell4';
    this.boss.setPhase('spell_declare', 2200, 0);
    this.boss.spellName = '校勘「名为博丽灵梦的误字修正」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  beginSSpell1() {
    this.boss.setPhase('p2_spell1', 1900, 45);
    this.boss.invuln = false; this.boss._s1 = null;
  }
  beginSSpell2() {
    this.boss.setPhase('p4_spell2', 2000, 50);
    this.boss.invuln = false; this.boss._s2 = null; this.boss.safeBandY = null;
  }
  beginSSpell3() {
    this.boss.setPhase('p5_spell3', 2100, 50);
    this.boss.invuln = false; this.boss._s3 = null; this.boss.cartLanes = [];
  }
  beginSSpell4() {
    this.boss.setPhase('p6_spell4', 2200, 55);
    this.boss.invuln = false; this.boss._s4 = null; this.boss.cinCircles = [];
  }
  onSSpell4End() {
    this.enemyBullets = [];
    this.boss.alive = false;
    this.dialogMode = 'post4';
    this.dialog = DIALOG_S4_POST;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
    this.toast('Spell Card Bonus!');
  }
  startStage5() {
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.boss = null;
    this.stage = 5;
    this.echoQueue = [];
    this.scrollKick = 0;
    this.slowZones = [];
    this.playerHistory = [];
    this.director = new Stage5Director(this);
    this.dialog = null;
    this.spellFlash = 0;
    this.state = STATE.PLAY;
    this.bgmCue = '道中《凝固在琥珀中的箱庭》';
    this.toast('Stage 5');
  }
  startBoss5() {
    this.boss = new BossKohaku();
    this.boss.setPhase('enter', 1600, 0);
    this.enemyBullets = [];
    this.bgmCue = 'Boss《斩断流光的白银之剪》';
  }
  startDialog5() {
    this.boss.phase = 'dialog';
    this.boss.invuln = true;
    this.dialogMode = 'pre5';
    this.dialog = DIALOG_S5_PRE;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
  }
  onBoss5Timeout() {
    if (!this.boss) return;
    const p = this.boss.phase;
    if (p === 'p1_nonspell') this.toK5Spell1();
    else if (p === 'p2_spell1') this.toK5Ns2();
    else if (p === 'p3_nonspell2') this.toK5Spell2();
    else if (p === 'p4_spell2') this.toK5Spell3();
    else if (p === 'p5_spell3') this.toK5Spell4();
    else if (p === 'p6_spell4') this.onK5Spell4End();
  }
  toK5Spell1() {
    this.enemyBullets = [];
    this._pendingSpell = 'k5spell1';
    this.boss.setPhase('spell_declare', 2000, 0);
    this.boss.spellName = '剪符「刹那与永远的断口」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toK5Ns2() {
    this.enemyBullets = [];
    this.boss.setPhase('p3_nonspell2', 1700, 35);
    this.boss.invuln = false; this.boss._n2 = null; this.boss.spellName = '';
    this.toast('Nonspell 2');
  }
  toK5Spell2() {
    this.enemyBullets = [];
    this.playerHistory = [];
    this._pendingSpell = 'k5spell2';
    this.boss.setPhase('spell_declare', 2100, 0);
    this.boss.spellName = '螳螂「捕食光阴的黄金双镰」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toK5Spell3() {
    this.enemyBullets = [];
    this._pendingSpell = 'k5spell3';
    this.boss.setPhase('spell_declare', 2200, 0);
    this.boss.spellName = '松脂「三千万年的黄金牢狱」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toK5Spell4() {
    this.enemyBullets = [];
    this._pendingSpell = 'k5spell4';
    this.boss.setPhase('spell_declare', 2300, 0);
    this.boss.spellName = '庭师「永不凋零的秋日盆景」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  beginK5Spell1() {
    this.boss.setPhase('p2_spell1', 2000, 45);
    this.boss.invuln = false; this.boss._s1 = null; this.boss.shearCorridors = [];
  }
  beginK5Spell2() {
    this.boss.setPhase('p4_spell2', 2100, 50);
    this.boss.invuln = false; this.boss._s2 = null; this.boss.captureBoxes = [];
  }
  beginK5Spell3() {
    this.boss.setPhase('p5_spell3', 2200, 50);
    this.boss.invuln = false; this.boss._s3 = null; this.boss.cageCells = [];
  }
  beginK5Spell4() {
    this.boss.setPhase('p6_spell4', 2300, 55);
    this.boss.invuln = false; this.boss._s4 = null; this.boss.bonsai = null;
  }
  onK5Spell4End() {
    this.enemyBullets = [];
    this.boss.alive = false;
    this.dialogMode = 'post5';
    this.dialog = DIALOG_S5_POST;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
    this.toast('Spell Card Bonus!');
  }
  startStage6() {
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.boss = null;
    this.stage = 6;
    this.echoQueue = [];
    this.scrollKick = 0;
    this.slowZones = [];
    this.playerHistory = [];
    this.director = new Stage6Director(this);
    this.dialog = null;
    this.spellFlash = 0;
    this.state = STATE.PLAY;
    this.bgmCue = '道中《琥珀色泽的悠久幻想》';
    this.toast('Stage 6');
  }
  startBoss6() {
    this.boss = new BossKuon();
    this.boss.setPhase('enter', 1800, 0);
    this.enemyBullets = [];
    this.bgmCue = 'Boss《献给终将褪色之物的挽歌 ～ Amber Elegy》';
  }
  startDialog6() {
    this.boss.phase = 'dialog';
    this.boss.invuln = true;
    this.dialogMode = 'pre6';
    this.dialog = DIALOG_S6_PRE;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
  }
  onBoss6Timeout() {
    if (!this.boss) return;
    const p = this.boss.phase;
    if (p === 'p1_nonspell') this.toUSpell1();
    else if (p === 'p2_spell1') this.toUNs2();
    else if (p === 'p3_nonspell2') this.toUSpell2();
    else if (p === 'p4_spell2') this.toUSpell3();
    else if (p === 'p5_spell3') this.toUSpell4();
    else if (p === 'p6_spell4') this.toULast();
    else if (p === 'p7_last') this.onULastEnd();
  }
  toUSpell1() {
    this.enemyBullets = [];
    this._pendingSpell = 'uspell1';
    this.boss.setPhase('spell_declare', 2200, 0);
    this.boss.spellName = '神脂「滴落于太古的金色眼泪」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toUNs2() {
    this.enemyBullets = [];
    this.boss.setPhase('p3_nonspell2', 1900, 35);
    this.boss.invuln = false; this.boss._n2 = null; this.boss.spellName = '';
    this.toast('Nonspell 2');
  }
  toUSpell2() {
    this.enemyBullets = [];
    this._pendingSpell = 'uspell2';
    this.boss.setPhase('spell_declare', 2300, 0);
    this.boss.spellName = '追忆「永不散场的昨日宴席」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toUSpell3() {
    this.enemyBullets = [];
    this._pendingSpell = 'uspell3';
    this.boss.setPhase('spell_declare', 2400, 0);
    this.boss.spellName = '凝滞「拒绝黎明的黄昏神域」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toUSpell4() {
    this.enemyBullets = [];
    this._pendingSpell = 'uspell4';
    this.boss.setPhase('spell_declare', 2500, 0);
    this.boss.spellName = '久远「万象皆封的琥珀幻想乡」';
    this.spellFlash = 2.2; this.toast(this.boss.spellName);
  }
  toULast() {
    this.enemyBullets = [];
    this._pendingSpell = 'ulast';
    this.boss.setPhase('spell_declare', 2800, 0);
    this.boss.spellName = '「琥珀色泽的永恒刹那（Ephemeral Amber）」';
    this.spellFlash = 2.5; this.toast(this.boss.spellName);
  }
  beginUSpell1() {
    this.boss.setPhase('p2_spell1', 2200, 45);
    this.boss.invuln = false; this.boss._s1 = null;
  }
  beginUSpell2() {
    this.boss.setPhase('p4_spell2', 2300, 50);
    this.boss.invuln = false; this.boss._s2 = null; this.boss.tables = [];
  }
  beginUSpell3() {
    this.boss.setPhase('p5_spell3', 2400, 50);
    this.boss.invuln = false; this.boss._s3 = null;
  }
  beginUSpell4() {
    this.boss.setPhase('p6_spell4', 2500, 55);
    this.boss.invuln = false; this.boss._s4 = null;
  }
  beginULast() {
    this.boss.setPhase('p7_last', 2800, 60);
    this.boss.invuln = false; this.boss._L = null;
    this.boss.lastPhase = 'flow'; this.boss.lastT = 0;
  }
  onULastEnd() {
    this.enemyBullets = [];
    this.boss.alive = false;
    this.dialogMode = 'post6';
    this.dialog = DIALOG_S6_POST;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
    this.toast('All Clear!');
  }
  startStageEx() {
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.boss = null;
    this.stage = 7;
    this.echoQueue = [];
    this.scrollKick = 0;
    this.slowZones = [];
    this.playerHistory = [];
    this.director = new StageExDirector(this);
    this.dialog = null;
    this.spellFlash = 0;
    this.state = STATE.PLAY;
    this.bgmCue = '道中《琥珀裂缝中的饥饿白夜》';
    this.toast('Extra');
  }
  startMidEx() {
    this.boss = new MidKohakuEx();
    this.boss.setPhase('enter', 1000, 0);
    this.enemyBullets = [];
    this.bgmCue = '中Boss《连同影子一起裁断》';
  }
  onMidExTimeout() {
    if (!this.boss || !(this.boss instanceof MidKohakuEx)) return;
    const p = this.boss.phase;
    if (p === 'm1_nonspell') this.toMidExSpell();
    else if (p === 'm2_spell') this.onMidExEnd();
  }
  toMidExSpell() {
    this.enemyBullets = [];
    this._pendingSpell = 'midexspell';
    this.boss.setPhase('spell_declare', 1400, 0);
    this.boss.spellName = '鬼剪「连同影子一起裁断」';
    this.spellFlash = 2.2;
    this.toast(this.boss.spellName);
  }
  beginMidExSpell() {
    this.boss.setPhase('m2_spell', 1400, 40);
    this.boss.invuln = false;
    this.boss._s = null;
    this.boss.captureBoxes = [];
  }
  onMidExEnd() {
    this.enemyBullets = [];
    this.boss.alive = false;
    this.boss = null;
    this.toast('Mid Clear');
    this.director.beginPostMid();
    this.bgmCue = '道中《琥珀裂缝中的饥饿白夜》';
  }
  startBossEx() {
    this.boss = new BossShoku();
    this.boss.setPhase('enter', 2000, 0);
    this.enemyBullets = [];
    this.bgmCue = 'Boss《吞尽刹那与久远》';
  }
  startDialogEx() {
    this.boss.phase = 'dialog';
    this.boss.invuln = true;
    this.dialogMode = 'preEx';
    this.dialog = DIALOG_EX_PRE;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
  }
  onBossExTimeout() {
    if (!this.boss || !(this.boss instanceof BossShoku)) return;
    const p = this.boss.phase;
    const map = {
      e1: () => this.toEx(2), e2: () => this.toEx(3), e3: () => this.toEx(4),
      e4: () => this.toEx(5), e5: () => this.toEx(6), e6: () => this.toEx(7),
      e7: () => this.toEx(8), e8: () => this.toEx(9), e9: () => this.toEx(10),
      e10: () => this.onExClear(),
    };
    if (map[p]) map[p]();
  }
  toEx(n) {
    this.enemyBullets = [];
    const specs = {
      2: [2100, 40, '吞噬「被省略的周三与周四」', 'e2'],
      3: [2200, 45, '龙息「焚尽年表的高热白光」', 'e3'],
      4: [2200, 45, '空白「史书上被撕去的一百页」', 'e4'],
      5: [2300, 45, '逆鳞「倒悬于地底的太古昼夜」', 'e5'],
      6: [2400, 50, '暴食「三千世界的一口闷」', 'e6'],
      7: [2400, 50, '因果「未曾开弓便已命中的箭矢」', 'e7'],
      8: [2500, 50, '荒神「寸草不生的无铭纪元」', 'e8'],
      9: [2600, 55, '耐久：「哪怕永恒也只需三口（Three Bites of Eternity）」', 'e9'],
      10: [3000, 65, '终符：「吞尽刹那与久远的纯白之颚（Chrono-Devourer）」', 'e10'],
    };
    const [hp, lim, name, phase] = specs[n];
    this._pendingSpell = 'ex' + phase;
    this._pendingEx = { hp, lim, name, phase };
    this.boss.setPhase('spell_declare', hp, 0);
    this.boss.spellName = name;
    this.spellFlash = 2.2;
    this.toast(name);
  }
  beginExPhase() {
    const s = this._pendingEx;
    if (!s) return;
    this.boss.setPhase(s.phase, s.hp, s.lim);
    this.boss.invuln = false;
    this.boss.spellName = s.name;
    this.boss._e = null;
  }
  onExClear() {
    this.enemyBullets = [];
    this.boss.alive = false;
    this.dialogMode = 'postEx';
    this.dialog = DIALOG_EX_POST;
    this.dialogIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false; this.state = STATE.DIALOG;
    this.toast('Ex Clear · 琥珀裂缝暂时合上');
  }

  openMusicRoom() {
    this.stopMusicPreview();
    this.musicIdx = 0;
    this.keys._zTap = false; this.keys._xTap = false;
    this.keys._upTap = false; this.keys._downTap = false;
    this.state = STATE.MUSIC;
  }
  stopMusicPreview() {
    if (this._musicAudio) {
      try { this._musicAudio.pause(); } catch (e) {}
      this._musicAudio = null;
    }
    this._musicPlayingId = null;
  }
  tryPlayMusicTrack() {
    const tr = MUSIC_TRACKS[this.musicIdx];
    if (!tr) return;
    if (this._musicPlayingId === tr.id && this._musicAudio && !this._musicAudio.paused) {
      this.stopMusicPreview();
      this.toast('停止');
      return;
    }
    this.stopMusicPreview();
    const tryUrls = [`audio/${tr.id}.ogg`, `audio/${tr.id}.mp3`];
    const audio = new Audio();
    audio.loop = true;
    let i = 0;
    const fail = () => {
      this.stopMusicPreview();
      this.toast('尚无音频');
    };
    const tryNext = () => {
      if (i >= tryUrls.length) { fail(); return; }
      const url = tryUrls[i++];
      audio.onerror = () => tryNext();
      audio.oncanplay = () => {
        audio.oncanplay = null;
        audio.onerror = null;
        this._musicAudio = audio;
        this._musicPlayingId = tr.id;
        audio.play().catch(fail);
        this.toast('♪ ' + tr.title);
      };
      audio.src = url;
      audio.load();
    };
    tryNext();
  }
  toast(msg) { this.message = msg; this.messageT = 2.0; }

  update(dt) {
    if (this.messageT > 0) this.messageT -= dt;
    if (this.spellFlash > 0) {
      this.spellFlash -= dt;
      if (this.spellFlash <= 0.4 && this.boss && this.boss.phase === 'spell_declare') {
        const p = this._pendingSpell;
        if (p === 'spell2') this.beginSpell2Combat();
        else if (p === 'kspell1') this.beginKSpell1();
        else if (p === 'kspell2') this.beginKSpell2();
        else if (p === 'kspell3') this.beginKSpell3();
        else if (p === 'tspell1') this.beginTSpell1();
        else if (p === 'tspell2') this.beginTSpell2();
        else if (p === 'tspell3') this.beginTSpell3();
        else if (p === 'midspell') this.beginMidSpell();
        else if (p === 'sspell1') this.beginSSpell1();
        else if (p === 'sspell2') this.beginSSpell2();
        else if (p === 'sspell3') this.beginSSpell3();
        else if (p === 'sspell4') this.beginSSpell4();
        else if (p === 'k5spell1') this.beginK5Spell1();
        else if (p === 'k5spell2') this.beginK5Spell2();
        else if (p === 'k5spell3') this.beginK5Spell3();
        else if (p === 'k5spell4') this.beginK5Spell4();
        else if (p === 'uspell1') this.beginUSpell1();
        else if (p === 'uspell2') this.beginUSpell2();
        else if (p === 'uspell3') this.beginUSpell3();
        else if (p === 'uspell4') this.beginUSpell4();
        else if (p === 'ulast') this.beginULast();
        else if (p === 'midexspell') this.beginMidExSpell();
        else if (p && p.startsWith('exe')) this.beginExPhase();
        else this.beginSpell1Combat();
      }
    }

    // gold rain particles always in play
    if (this.state === STATE.PLAY || this.state === STATE.DIALOG) {
      const kick = this.scrollKick || 0;
      this.bgScroll += (20 + kick * 180) * dt;
      if (Math.random() < 0.35) {
        this.particles.push({
          x: Math.random() * W, y: -5,
          vy: 40 + Math.random() * 30, vx: (Math.random() - 0.5) * 10,
          life: 4, age: 0, r: 1 + Math.random() * 2,
        });
      }
      for (const p of this.particles) {
        p.age += dt; p.y += p.vy * dt; p.x += p.vx * dt;
      }
      this.particles = this.particles.filter(p => p.age < p.life && p.y < H + 10);
    }

    if (this.state === STATE.DIALOG) {
      if (this.keys._xTap) { this.keys._xTap = false; this.advanceDialog(); }
      if (this.keys._zTap) { this.keys._zTap = false; this.advanceDialog(); }
      return;
    }
    if (this.state === STATE.TITLE) {
      if (this.keys._zTap) { this.keys._zTap = false; this.resetRun(); }
      if (this.keys._cTap) { this.keys._cTap = false; this.openMusicRoom(); }
      return;
    }
    if (this.state === STATE.MUSIC) {
      if (this.keys._upTap) {
        this.keys._upTap = false;
        this.musicIdx = (this.musicIdx + MUSIC_TRACKS.length - 1) % MUSIC_TRACKS.length;
      }
      if (this.keys._downTap) {
        this.keys._downTap = false;
        this.musicIdx = (this.musicIdx + 1) % MUSIC_TRACKS.length;
      }
      if (this.keys._zTap) { this.keys._zTap = false; this.tryPlayMusicTrack(); }
      if (this.keys._xTap || this.keys._escTap) {
        this.keys._xTap = false; this.keys._escTap = false;
        this.stopMusicPreview();
        this.state = STATE.TITLE;
      }
      return;
    }
    if (this.state === STATE.CLEAR || this.state === STATE.GAMEOVER) {
      if (this.keys._zTap) { this.keys._zTap = false; this.state = STATE.TITLE; }
      return;
    }

    // PLAY
    // resin slow zones
    if (!this.slowZones) this.slowZones = [];
    for (const z of this.slowZones) z.age += dt;
    this.slowZones = this.slowZones.filter(z => z.age < z.life);
    let speedMul = 1;
    for (const z of this.slowZones) {
      if (Math.hypot(this.player.x - z.x, this.player.y - z.y) < z.r) {
        speedMul = Math.min(speedMul, 0.7);
      }
    }
    if (speedMul < 0.55) speedMul = 0.55;
    this.player.speedMul = speedMul;
    this.player.update(dt, this.keys, this.playerBullets);
    this.director.update(dt);

    for (const eq of this.echoQueue) eq.t -= dt;
    const due = this.echoQueue.filter(eq => eq.t <= 0);
    this.echoQueue = this.echoQueue.filter(eq => eq.t > 0);
    for (const eq of due) eq.fn();

    for (const e of this.enemies) e.update(dt, this);
    this.enemies = this.enemies.filter(e => e.alive);

    if (this.boss && this.boss.alive) this.boss.update(dt, this);

    for (const b of this.playerBullets) b.update(dt, this);
    for (const b of this.enemyBullets) b.update(dt, this);
    this.playerBullets = this.playerBullets.filter(b => b.alive);
    this.enemyBullets = this.enemyBullets.filter(b => b.alive);

    this.resolveCollisions();
  }

  resolveCollisions() {
    // player bullets vs enemies
    for (const b of this.playerBullets) {
      if (!b.alive || b.hostile) continue;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r) {
          b.alive = false;
          const dmg = new URLSearchParams(location.search).get('god') === '1' ? 60 : 12;
          if (e.hurt(dmg, this)) this.player.score += e.score;
          break;
        }
      }
      if (b.alive && this.boss && this.boss.alive && !this.boss.invuln) {
        if (Math.hypot(b.x - this.boss.x, b.y - this.boss.y) < this.boss.r + b.r) {
          b.alive = false;
          const dmgBoss = new URLSearchParams(location.search).get('god') === '1' ? 80 : 10;
          if (this.boss.hurt(dmgBoss)) {
            this.player.score += 50000;
            if (this.boss instanceof BossKyouko) {
              const p = this.boss.phase;
              if (p === 'p1_nonspell') this.toKSpell1();
              else if (p === 'p2_spell1') this.toKNs2();
              else if (p === 'p3_nonspell2') this.toKSpell2();
              else if (p === 'p4_spell2') this.toKSpell3();
              else if (p === 'p5_spell3') this.onKSpell3End();
            } else if (this.boss instanceof BossTama) {
              const p = this.boss.phase;
              if (p === 'p1_nonspell') this.toTSpell1();
              else if (p === 'p2_spell1') this.toTNs2();
              else if (p === 'p3_nonspell2') this.toTSpell2();
              else if (p === 'p4_spell2') this.toTSpell3();
              else if (p === 'p5_spell3') this.onTSpell3End();
            } else if (this.boss instanceof MidAkyuu) {
              const p = this.boss.phase;
              if (p === 'm1_nonspell') this.toMidSpell();
              else if (p === 'm2_spell') this.onMid4End();
            } else if (this.boss instanceof BossSumizome) {
              const p = this.boss.phase;
              if (p === 'p1_nonspell') this.toSSpell1();
              else if (p === 'p2_spell1') this.toSNs2();
              else if (p === 'p3_nonspell2') this.toSSpell2();
              else if (p === 'p4_spell2') this.toSSpell3();
              else if (p === 'p5_spell3') this.toSSpell4();
              else if (p === 'p6_spell4') this.onSSpell4End();
            } else if (this.boss instanceof BossKohaku) {
              const p = this.boss.phase;
              if (p === 'p1_nonspell') this.toK5Spell1();
              else if (p === 'p2_spell1') this.toK5Ns2();
              else if (p === 'p3_nonspell2') this.toK5Spell2();
              else if (p === 'p4_spell2') this.toK5Spell3();
              else if (p === 'p5_spell3') this.toK5Spell4();
              else if (p === 'p6_spell4') this.onK5Spell4End();
            } else if (this.boss instanceof BossKuon) {
              const p = this.boss.phase;
              if (p === 'p1_nonspell') this.toUSpell1();
              else if (p === 'p2_spell1') this.toUNs2();
              else if (p === 'p3_nonspell2') this.toUSpell2();
              else if (p === 'p4_spell2') this.toUSpell3();
              else if (p === 'p5_spell3') this.toUSpell4();
              else if (p === 'p6_spell4') this.toULast();
              else if (p === 'p7_last') this.onULastEnd();
            } else if (this.boss instanceof MidKohakuEx) {
              const p = this.boss.phase;
              if (p === 'm1_nonspell') this.toMidExSpell();
              else if (p === 'm2_spell') this.onMidExEnd();
            } else if (this.boss instanceof BossShoku) {
              const p = this.boss.phase;
              if (p === 'e1') this.toEx(2);
              else if (p === 'e2') this.toEx(3);
              else if (p === 'e3') this.toEx(4);
              else if (p === 'e4') this.toEx(5);
              else if (p === 'e5') this.toEx(6);
              else if (p === 'e6') this.toEx(7);
              else if (p === 'e7') this.toEx(8);
              else if (p === 'e8') this.toEx(9);
              else if (p === 'e9') this.toEx(10);
              else if (p === 'e10') this.onExClear();
            } else {
              if (this.boss.phase === 'p1_nonspell') this.toSpell1();
              else if (this.boss.phase === 'p2_spell1') this.toNonspell2();
              else if (this.boss.phase === 'p3_nonspell2') this.toSpell2();
              else if (this.boss.phase === 'p4_spell2') this.onSpell2End();
            }
          }
        }
      }
    }
    // enemy bullets vs player
    for (const b of this.enemyBullets) {
      if (!b.alive || !b.hostile) continue;
      const d = Math.hypot(b.x - this.player.x, b.y - this.player.y);
      // graze
      if (d < b.r + 18 && d > this.player.r + b.r && !b.grazeOnce) {
        b.grazeOnce = true;
        this.player.graze++;
        this.player.score += 100;
      }
      if (d < this.player.r + b.r * 0.7) {
        b.alive = false;
        if (this.player.hit()) this.state = STATE.GAMEOVER;
      }
    }
    // body bump enemies
    for (const e of this.enemies) {
      if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < e.r * 0.6 + this.player.r) {
        if (this.player.hit()) this.state = STATE.GAMEOVER;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    // background
    const bgKey = this.stage === 7 ? 'bg.stage_ex' : this.stage === 6 ? 'bg.stage6' : this.stage === 5 ? 'bg.stage5' : this.stage === 4 ? 'bg.stage4' : this.stage === 3 ? 'bg.stage3' : this.stage === 2 ? 'bg.stage2' : 'bg.stage1';
    const bg = Images[bgKey];
    if (bg) {
      const off = this.bgScroll % H;
      ctx.drawImage(bg, 0, off - H, W, H);
      ctx.drawImage(bg, 0, off, W, H);
    } else {
      ctx.fillStyle = this.stage === 7 ? '#0A0A0C' : this.stage === 6 ? '#1A1430' : this.stage === 5 ? '#4A3560' : this.stage === 4 ? '#2a2438' : this.stage === 3 ? '#3a2a22' : this.stage === 2 ? '#1E3A2F' : '#1A3A4A';
      ctx.fillRect(0, 0, W, H);
    }

    // gold rain
    ctx.fillStyle = '#FFD966';
    for (const p of this.particles) {
      ctx.globalAlpha = 0.55 * (1 - p.age / p.life);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (this.state === STATE.TITLE) {
      drawSprite(ctx, 'ui.title', W / 2, H * 0.32, 340, 90);
      ctx.fillStyle = '#F5D78E';
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Stage 1–6 + Extra · ?phase=ex', W / 2, H * 0.48);
      ctx.fillStyle = '#E8A317';
      ctx.font = '16px sans-serif';
      ctx.fillText('按 Z 开始', W / 2, H * 0.62);
      ctx.fillStyle = 'rgba(245,215,142,0.6)';
      ctx.font = '11px sans-serif';
      ctx.fillText('拾穗者的忘却河岸　～　逆流而上的秋日水沫', W / 2, H * 0.72);
      ctx.fillStyle = 'rgba(245,215,142,0.75)';
      ctx.font = '12px sans-serif';
      ctx.fillText('C · Music Room', W / 2, H * 0.82);
      return;
    }
    if (this.state === STATE.MUSIC) {
      this.drawMusicRoom(ctx);
      if (this.messageT > 0) {
        ctx.fillStyle = '#E8A317';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.min(1, this.messageT);
        ctx.fillText(this.message, W / 2, H * 0.92);
        ctx.globalAlpha = 1;
      }
      return;
    }

    // slow zones
    if (this.slowZones) {
      for (const z of this.slowZones) {
        const a = 0.22 * (1 - z.age / z.life);
        ctx.fillStyle = `rgba(212,137,10,${a})`;
        ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(212,137,10,${0.45 + a})`;
        ctx.stroke();
      }
    }

    // entities
    for (const e of this.enemies) e.draw(ctx);
    if (this.boss && this.boss.alive) this.boss.draw(ctx);
    for (const b of this.playerBullets) b.draw(ctx);
    for (const b of this.enemyBullets) b.draw(ctx);
    this.player.draw(ctx);
    this.player.drawHitbox(ctx, this.keys.Shift);

    // HUD
    this.drawHud(ctx);

    // spell banner
    if (this.spellFlash > 0 && this.boss) {
      const a = Math.min(1, this.spellFlash);
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(61,41,20,0.9)';
      ctx.strokeStyle = '#E8A317';
      ctx.lineWidth = 2;
      ctx.fillRect(22, 48, W - 44, 48);
      ctx.strokeRect(22, 48, W - 44, 48);
      ctx.fillStyle = '#F5D78E';
      ctx.font = '15px serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.boss.spellName || '', W / 2, 78);
      ctx.globalAlpha = 1;
    }

    if (this.messageT > 0) {
      ctx.fillStyle = '#E8A317';
      ctx.font = 'bold 18px serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.min(1, this.messageT);
      ctx.fillText(this.message, W / 2, H * 0.4);
      ctx.globalAlpha = 1;
    }

    if (this.state === STATE.DIALOG && this.dialog) {
      this.drawDialog(ctx);
    }

    if (this.state === STATE.CLEAR) {
      ctx.fillStyle = 'rgba(26,58,74,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#E8A317';
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Stage Clear', W / 2, H * 0.4);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#F5D78E';
      ctx.fillText(this.stage >= 7 ? 'Ex Clear · 琥珀裂缝暂时合上' : this.stage >= 6 ? 'All Clear · 赛钱箱里多了三枚古铜钱' : this.stage >= 5 ? 'Stage 5 Clear · 进 6 面' : this.stage >= 4 ? 'Stage 4 Clear · 进 5 面' : this.stage >= 3 ? 'Stage 3 Clear · 进 4 面' : this.stage >= 2 ? 'Stage 2 Clear · 按 Z 回标题' : '切片通关 · 按 Z 回标题', W / 2, H * 0.5);
      ctx.fillText('Score ' + this.player.score, W / 2, H * 0.58);
    }
    if (this.state === STATE.GAMEOVER) {
      ctx.fillStyle = 'rgba(42,34,24,0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#C41E3A';
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H * 0.45);
      ctx.fillStyle = '#F5D78E';
      ctx.font = '14px sans-serif';
      ctx.fillText('按 Z 回标题', W / 2, H * 0.55);
    }
  }


  drawMusicRoom(ctx) {
    ctx.fillStyle = '#1a120c';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#E8A317';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, W - 20, H - 20);
    ctx.fillStyle = '#E8A317';
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Music Room', W / 2, 36);
    ctx.fillStyle = 'rgba(245,215,142,0.65)';
    ctx.font = '11px sans-serif';
    ctx.fillText('↑↓ 选择　Z 试听　X 返回', W / 2, 54);

    const rowH = 20;
    const top = 70;
    const visible = 16;
    let start = Math.max(0, Math.min(this.musicIdx - 7, MUSIC_TRACKS.length - visible));
    if (start < 0) start = 0;
    for (let i = start; i < Math.min(MUSIC_TRACKS.length, start + visible); i++) {
      const tr = MUSIC_TRACKS[i];
      const y = top + (i - start) * rowH;
      const sel = i === this.musicIdx;
      if (sel) {
        ctx.fillStyle = 'rgba(232,163,23,0.25)';
        ctx.fillRect(18, y - 12, W - 36, rowH);
      }
      ctx.textAlign = 'left';
      ctx.font = (sel ? 'bold ' : '') + '12px sans-serif';
      ctx.fillStyle = sel ? '#F5D78E' : 'rgba(245,215,142,0.75)';
      const playing = this._musicPlayingId === tr.id ? ' ♪' : '';
      let title = tr.title;
      if (title.length > 22) title = title.slice(0, 21) + '…';
      ctx.fillText(String(tr.n).padStart(2, '0') + '  ' + title + playing, 24, y);
      ctx.fillStyle = sel ? 'rgba(232,163,23,0.85)' : 'rgba(180,150,100,0.55)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(tr.scene, W - 24, y);
    }
  }

  drawHud(ctx) {
    ctx.fillStyle = 'rgba(42,34,24,0.45)';
    ctx.fillRect(4, 4, 130, 70);
    ctx.strokeStyle = '#E8A317';
    ctx.strokeRect(4, 4, 130, 70);
    ctx.fillStyle = '#F5D78E';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LIFE  ' + '♥'.repeat(Math.max(0, this.player.lives)), 12, 22);
    ctx.fillText('SCORE ' + String(this.player.score).padStart(8, '0'), 12, 40);
    ctx.fillText('GRAZE ' + this.player.graze, 12, 58);

    if (this.boss && this.boss.alive && this.boss.phase !== 'enter' && this.boss.phase !== 'dialog') {
      const bw = W - 20;
      const pct = this.boss.maxHp ? this.boss.hp / this.boss.maxHp : 0;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(10, 8, bw, 8);
      ctx.fillStyle = this.boss.phase === 'p2_spell1' ? '#E8A317' : '#C41E3A';
      ctx.fillRect(10, 8, bw * pct, 8);
      ctx.fillStyle = '#F5D78E';
      ctx.font = '11px serif';
      ctx.textAlign = 'right';
      const label = (this.boss.spellName && !/^(enter|dialog|m1_nonspell|p1_nonspell|p3_nonspell)/.test(this.boss.phase)) ? this.boss.spellName : this.boss.name;
      ctx.fillText(label, W - 12, 28);
      if (this.boss.timeLimit) {
        const left = Math.max(0, this.boss.timeLimit - this.boss.phaseAge);
        ctx.textAlign = 'left';
        ctx.fillText(left.toFixed(1), 12, 28);
      }
    }

    if (this.bgmCue) {
      ctx.fillStyle = 'rgba(245,215,142,0.45)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.bgmCue, W - 8, H - 8);
    }
  }

  drawDialog(ctx) {
    const line = this.dialog[this.dialogIdx];
    ctx.fillStyle = 'rgba(61,41,20,0.88)';
    ctx.fillRect(16, H - 110, W - 32, 94);
    ctx.strokeStyle = '#E8A317';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, H - 110, W - 32, 94);
    ctx.fillStyle = '#E8A317';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'left';
    ctx.fillText(line.who, 28, H - 88);
    ctx.fillStyle = '#F7F2E8';
    ctx.font = '13px sans-serif';
    wrapText(ctx, line.text, 28, H - 66, W - 60, 18);
    ctx.fillStyle = '#FFD966';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Z / X 继续', W - 28, H - 24);
  }
}

function wrapText(ctx, text, x, y, maxW, lh) {
  let line = '';
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, y);
      line = ch;
      y += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
}
