/**
 * AmberBgm — Web Audio 合成 BGM（17 id，无音频文件）
 * 按 MUSIC_ROOM / DIFFICULTY_TREAT §3；首次按键 ensure()；M / ?mute=1 静音。
 * Treat 不关音乐。
 */
const AmberBgm = (function () {
  const MASTER_VOL = 0.1;
  const FADE_S = 0.28;
  const NOTE_LEN = 0.11;

  let ac = null;
  let master = null;
  let cueKey = null; // current id
  let mood = null;   // same as id when playing
  let step = 0;
  let timer = null;
  let muted = false;
  let live = [];

  function midiToHz(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  /** Build a short looping pattern from seed params */
  function pat(tempo, wave, vol, root, intervals, bassIv) {
    const notes = intervals.map((iv) => root + iv);
    const bass = (bassIv || [0, 7, 0, 5]).map((iv) => root - 12 + iv);
    return { tempo, wave, vol, notes, bass };
  }

  // 17 distinct moods (id → pattern). 气质对齐 DIFFICULTY_TREAT §3 / MUSIC_ROOM
  const PATTERNS = {
    // 中慢、琥珀大调琶音
    bgm_title: pat(72, 'sine', 0.55, 57, [0, 4, 7, 11, 12, 11, 7, 4], [0, 0, 5, 5]),
    // 1 面水波 → Boss 略紧
    bgm_s1:    pat(96, 'triangle', 0.58, 62, [0, 3, 7, 10, 7, 3, 5, 7], [0, 7, 3, 7]),
    bgm_s1b:   pat(112, 'triangle', 0.55, 62, [0, 3, 7, 12, 10, 7, 5, 3, 0, 7, 12, 15], [0, 7, 0, 5, 0, 8, -2, 5]),
    // 2 面林青 → 树冠闲谈
    bgm_s2:    pat(100, 'sine', 0.55, 67, [0, 2, 4, 7, 9, 7, 4, 2], [0, 5, 0, 7]),
    bgm_s2b:   pat(118, 'square', 0.4, 67, [0, 4, 7, 12, 7, 4, 2, 4, 0, 7, 11, 12], [0, 7, 0, 4, -5, 2, 0, 7]),
    // 3 面算盘点奏
    bgm_s3:    pat(108, 'square', 0.38, 60, [0, 2, 0, 5, 0, 7, 5, 2], [0, 0, 7, 7]),
    bgm_s3b:   pat(124, 'square', 0.42, 60, [0, 5, 7, 12, 7, 5, 3, 0, 5, 10, 12, 15], [0, 7, 5, 12, 0, 7, 3, 10]),
    // 4 面书卷慢 → 残卷
    bgm_s4:    pat(84, 'sine', 0.52, 65, [0, 3, 7, 8, 7, 3, 5, 3], [0, 0, 3, 7]),
    bgm_s4b:   pat(104, 'triangle', 0.5, 65, [0, 3, 7, 12, 10, 7, 6, 3, 0, 8, 12, 15], [0, 7, 0, 5, -2, 5, 0, 8]),
    // 5 面庭园剪
    bgm_s5:    pat(102, 'triangle', 0.55, 64, [0, 4, 7, 9, 7, 4, 2, 4], [0, 5, 7, 5]),
    bgm_s5b:   pat(120, 'square', 0.42, 64, [0, 4, 7, 11, 12, 11, 7, 4, 2, 7, 12, 16], [0, 7, 0, 4, -1, 6, 0, 7]),
    // 6 面天球 → 庄重小调挽歌
    bgm_s6:    pat(92, 'sine', 0.55, 59, [0, 3, 7, 10, 12, 10, 7, 3], [0, 7, 0, 5]),
    bgm_s6b:   pat(108, 'triangle', 0.52, 57, [0, 3, 7, 10, 12, 15, 12, 10, 7, 3, 0, 7], [0, 7, 0, 3, -4, 3, 0, 7]),
    // Extra 树根 → 压迫低音脉冲
    bgm_ex:    pat(100, 'sawtooth', 0.35, 50, [0, 5, 7, 12, 7, 5, 3, 0], [0, 0, 5, 5]),
    bgm_exb:   pat(128, 'square', 0.4, 45, [0, 3, 0, 7, 0, 10, 7, 3, 0, 12, 10, 7], [0, 0, 7, 7, 0, 5, 0, 10]),
    // Ending / Staff 轻短
    bgm_ending: pat(88, 'sine', 0.5, 60, [0, 4, 7, 12, 11, 7, 4, 0], [0, 5, 0, 7]),
    bgm_staff:  pat(80, 'sine', 0.45, 69, [0, 4, 7, 9, 7, 4, 2, 0], [0, 0, 4, 7]),
  };

  const ALL_IDS = Object.keys(PATTERNS);

  // Chinese label / cue fragment → id（含剧本名与现有 game.bgmCue 异名）
  const LABEL_RULES = [
    [/琥珀色的风雅剧场|bgm_title|^title$/i, 'bgm_title'],
    [/秋水不渡昨日之舟|bgm_s1\b/, 'bgm_s1'],
    [/指缝间的金色[细細]沙|逆流的二十四刻|抓不住的昨日倒影|Boss\s*入场|bgm_s1b/, 'bgm_s1b'],
    [/三百次初见的林间小径|bgm_s2\b/, 'bgm_s2'],
    [/古杉树冠的昨日闲谈|bgm_s2b/, 'bgm_s2b'],
    [/青苔石阶上的旧算筹|bgm_s3\b/, 'bgm_s3'],
    [/拨动黄昏的五珠算盘|bgm_s3b/, 'bgm_s3b'],
    [/标本架上的漫长午后|不翻页的昨日物语|bgm_s4\b/, 'bgm_s4'],
    [/墨迹未干的千年残卷|被装裱的百年一刻|bgm_s4b/, 'bgm_s4b'],
    [/凝固在琥珀中的箱庭|bgm_s5\b/, 'bgm_s5'],
    [/挥舞在永恒前夜的双刃|斩断流光的白银之剪|连同影子一起裁断|bgm_s5b/, 'bgm_s5b'],
    [/仰望不落的昨日斜阳|琥珀色泽的悠久幻想|bgm_s6\b/, 'bgm_s6'],
    [/献给终将褪色之物的挽歌|Amber Elegy|bgm_s6b/, 'bgm_s6b'],
    [/深入三千万年前的树根|琥珀裂缝中的饥饿白夜|bgm_ex\b/, 'bgm_ex'],
    [/咀嚼白昼的太古逆鳞|Chrono-Eater|吞尽刹那与久远|bgm_exb/, 'bgm_exb'],
    [/明日亦是寻常的秋日|bgm_ending|^clear$|^ending$/i, 'bgm_ending'],
    [/洒落缘侧的琥珀糖|bgm_staff|^staff$/i, 'bgm_staff'],
    [/^music$/i, 'bgm_title'],
  ];

  function resolveId(cue) {
    if (cue == null || cue === '') return null;
    const s = String(cue).trim();
    if (PATTERNS[s]) return s;
    for (let i = 0; i < LABEL_RULES.length; i++) {
      if (LABEL_RULES[i][0].test(s)) return LABEL_RULES[i][1];
    }
    // Fallback by role keywords + stage hints (weak)
    if (/符卡|中Boss|Boss|终符|Last/i.test(s)) {
      if (/Ex|烛|逆鳞/i.test(s)) return 'bgm_exb';
      return 'bgm_s1b';
    }
    if (/道中/.test(s)) return 'bgm_s1';
    return 'bgm_title';
  }

  function killLive() {
    if (!ac) { live = []; return; }
    const t = ac.currentTime;
    for (const n of live) {
      try {
        n.g.gain.cancelScheduledValues(t);
        n.g.gain.setValueAtTime(Math.max(0.0001, n.g.gain.value), t);
        n.g.gain.linearRampToValueAtTime(0.0001, t + FADE_S);
        n.osc.stop(t + FADE_S + 0.02);
      } catch (e) { /* nop */ }
      try { n.osc.disconnect(); } catch (e2) { /* nop */ }
      try { n.g.disconnect(); } catch (e3) { /* nop */ }
    }
    live = [];
  }

  function clearTimer() {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function beep(freq, dur, wave, volScale) {
    if (!ac || !master || muted) return;
    const t0 = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = wave || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    const peak = MASTER_VOL * (volScale || 0.5);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.012);
    g.gain.linearRampToValueAtTime(peak * 0.65, t0 + dur * 0.55);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
    const entry = { osc, g };
    live.push(entry);
    osc.onended = () => {
      const i = live.indexOf(entry);
      if (i >= 0) live.splice(i, 1);
      try { osc.disconnect(); } catch (e) { /* nop */ }
      try { g.disconnect(); } catch (e2) { /* nop */ }
    };
  }

  function tick() {
    if (!ac || !mood || muted) return;
    const p = PATTERNS[mood];
    if (!p) return;
    const n = p.notes[step % p.notes.length];
    const b = p.bass[step % p.bass.length];
    const beat = 60 / p.tempo;
    const dur = Math.min(NOTE_LEN, beat * 0.8);
    beep(midiToHz(n), dur, p.wave, p.vol);
    const dense = /b$/.test(mood) || mood === 'bgm_exb';
    if (dense || step % 2 === 0) {
      beep(midiToHz(b), dur * 1.25, dense ? 'triangle' : 'sine', p.vol * 0.42);
    }
    // soft pulse on boss/exb every 4 steps
    if ((mood === 'bgm_exb' || mood === 'bgm_s6b') && step % 4 === 0) {
      beep(midiToHz(b - 12), dur * 1.6, 'sine', p.vol * 0.55);
    }
    step += 1;
  }

  function startPattern(id) {
    clearTimer();
    killLive();
    mood = id;
    step = 0;
    if (!mood || !ac || muted) return;
    const p = PATTERNS[mood];
    if (!p) return;
    const intervalMs = (60 / p.tempo) * 1000;
    tick();
    timer = setInterval(tick, intervalMs);
  }

  function ensure() {
    if (muted) return false;
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 1;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') {
      ac.resume().catch(function () {});
    }
    if (mood && timer == null) startPattern(mood);
    return true;
  }

  /** Prefer id; accepts Chinese label too */
  function setCue(cue) {
    if (muted) return;
    const id = resolveId(cue);
    const key = id || '';
    if (key === cueKey && timer != null) return;
    if (key === cueKey && !id) return;
    cueKey = key;
    if (!id) {
      stopKeepMute();
      cueKey = '';
      return;
    }
    if (!ac) {
      mood = id;
      return;
    }
    if (ac.state === 'suspended') ac.resume().catch(function () {});
    if (id === mood && timer != null) return;
    startPattern(id);
  }

  function setCueFromLabel(label) {
    setCue(label);
  }

  function setBgmId(id) {
    setCue(id);
  }

  function update() { /* reserved */ }

  function stopKeepMute() {
    clearTimer();
    killLive();
    mood = null;
  }

  function stop() {
    stopKeepMute();
    cueKey = null;
  }

  function setMuted(m) {
    muted = !!m;
    if (muted) {
      stopKeepMute();
    } else if (cueKey && PATTERNS[cueKey]) {
      mood = cueKey;
      if (ac) startPattern(cueKey);
    }
  }

  function toggleMute() {
    setMuted(!muted);
    return muted;
  }

  function isMuted() { return muted; }

  function suspend() {
    clearTimer();
    if (ac && ac.state === 'running') {
      killLive();
      ac.suspend().catch(function () {});
    }
  }

  function resumeIfNeeded() {
    if (muted || !ac) return;
    if (ac.state === 'suspended') ac.resume().catch(function () {});
    if (mood && timer == null) startPattern(mood);
  }

  return {
    ensure,
    setCue,
    setCueFromLabel,
    setBgmId,
    update,
    stop,
    setMuted,
    toggleMute,
    isMuted,
    suspend,
    resumeIfNeeded,
    resolveId,
    ALL_IDS,
  };
})();
