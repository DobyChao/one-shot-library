'use strict';
/* ============================================================
 *  東方星塵録 — 音频引擎 audio.js
 *  Web Audio 实时合成：ZUN 风格曲目（旋律/贝斯/琶音/鼓）+ 音效
 * ============================================================ */
const Music = (() => {
  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let muted = false;
  let cur = null;          // 当前播放状态
  let timer = null;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : .6; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = .9; musicGain.connect(master);
      sfxGain = ctx.createGain(); sfxGain.gain.value = .85; sfxGain.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  function setMute(m) { muted = m; if (master) master.gain.value = m ? 0 : .6; }
  function toggleMute() { setMute(!muted); return muted; }

  /* ---------------- 音符解析 ---------------- */
  const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function noteFreq(tok, transpose) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(tok);
    if (!m) return 0;
    let s = NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3]) * 12 + (transpose || 0);
    return 440 * Math.pow(2, (s - 69) / 12);
  }
  // "C5:2 E5 - :4" → [{f,len}...] 步长为 16 分音符
  function parseLead(str) {
    const out = [];
    for (const tk of str.trim().split(/\s+/)) {
      const m = /^([A-G][#b]?\d)(?::(\d+))?$/.exec(tk);
      const r = /^-(?::(\d+))?$/.exec(tk);
      if (m) out.push({ f: m[1], len: m[2] ? +m[2] : 1 });
      else if (r) out.push({ rest: true, len: r[1] ? +r[1] : 1 });
    }
    return out;
  }
  const CHORD = {
    '': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 10], 'm7': [0, 3, 10],
    'M7': [0, 4, 7, 11], 'dim': [0, 3, 6], 'sus4': [0, 5, 7], '6': [0, 4, 7, 9]
  };
  function parseChord(c) {
    const m = /^([A-G])([#b]?)(.*)$/.exec(c);
    const root = NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    return { root, iv: CHORD[m[3]] || CHORD[''] };
  }

  const DRUMS = {
    rock: 'k-h-s-h-k-hks-hh',
    drive: 'k-hks-hkk-hks-ha',
    fest: 'k-k-s-h-khks-ha',
    calm: 'k---h---s---h---',
    half: 'k---h---k-hks-ha',
    none: '----------------'
  };

  /* ---------------- 曲目 ---------------- */
  // lead 行每行 32 步（2 小节），4 行循环 = 8 小节
  const SONGS = {
    title: {
      bpm: 122, prog: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'], drums: 'calm',
      lead: [
        'A4:4 C5:2 B4:2 A4:2 E4:2 G4:4 A4:8 -:4 C5:2 B4:2',
        'A4:4 C5:2 D5:2 E5:2 D5:2 C5:2 B4:8 G4:8',
        'E5:4 D5:2 C5:2 D5:2 E5:2 C5:4 A4:4 C5:4 -:4 B4:2 C5:2',
        'D5:4 C5:2 B4:2 C5:2 D5:2 E5:4 D5:4 B4:4 D5:8'
      ]
    },
    s1: {
      bpm: 168, prog: ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Bb', 'C'], drums: 'rock',
      lead: [
        'F5:2 A5:2 G5:2 F5:2 E5:2 F5:2 G5:4 A5:2 G5:2 F5:2 D5:2 F5:8',
        'C5:2 D5:2 F5:2 G5:2 A5:4 G5:2 F5:2 D5:2 C5:4 D5:4 C5:4',
        'A5:2 A5:2 G5:2 F5:2 G5:2 G5:2 F5:2 E5:2 F5:2 F5:2 E5:2 D5:2 C5:4 D5:4',
        'D5:2 D5:2 C5:2 D5:2 F5:4 E5:2 D5:2 C5:2 A4:4 C5:4 F5:4 -:4'
      ]
    },
    s2: {
      bpm: 160, prog: ['Dm', 'C', 'Bb', 'A', 'Dm', 'C', 'Bb', 'A'], drums: 'fest',
      lead: [
        'D5:2 F5:2 A5:2 F5:2 D5:2 F5:2 A5:4 G5:2 F5:2 G5:2 E5:2 C5:2 E5:2 G5:4',
        'A5:2 A5:2 G5:2 A5:2 C6:4 A5:2 G5:2 F5:2 G5:2 G5:2 F5:2 E5:2 D5:8',
        'F5:4 E5:2 F5:2 G5:4 F5:2 E5:2 D5:4 C5:2 D5:2 E5:2 C5:2 D5:4',
        'E5:2 E5:2 F5:2 G5:2 A5:4 G5:2 F5:2 E5:2 D5:4 E5:2 F5:2 E5:2 C5:2 D5:2'
      ]
    },
    s3: {
      bpm: 152, prog: ['Em', 'C', 'G', 'D', 'Em', 'C', 'G', 'D'], drums: 'half',
      lead: [
        'E5:2 G5:2 B5:2 A5:2 G5:2 E5:2 D5:2 E5:2 G5:4 E5:2 D5:2 B4:4 D5:4',
        'B4:2 D5:2 E5:2 G5:2 F#5:4 E5:2 D5:2 E5:4 B4:4 E5:2 F#5:2 G5:4 -:4',
        'B5:2 A5:2 G5:2 A5:2 B5:2 B5:2 A5:2 G5:2 A5:2 G5:2 E5:2 D5:2 E5:8',
        'G5:2 E5:2 D5:2 E5:2 G5:2 A5:2 B5:4 A5:2 G5:2 E5:2 G5:2 F#5:2 D5:2 E5:2'
      ]
    },
    s4: {
      bpm: 140, prog: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'], drums: 'calm',
      lead: [
        'E5:4 G5:2 A5:2 G5:4 E5:2 D5:2 C5:4 D5:2 E5:2 C5:8',
        'E5:4 G5:2 A5:2 C6:4 A5:2 G5:2 E5:4 G5:2 E5:2 D5:8',
        'A5:4 G5:2 E5:2 G5:2 A5:2 C6:2 A5:4 G5:2 E5:2 D5:2 C5:2 D5:4 -:2',
        'C5:4 D5:2 E5:2 G5:4 E5:2 D5:2 C5:4 A4:2 C5:2 C5:8'
      ]
    },
    s5: {
      bpm: 156, prog: ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'D', 'A'], drums: 'rock',
      lead: [
        'B4:2 D5:2 F#5:2 D5:2 B4:2 D5:2 F#5:4 E5:2 D5:2 E5:2 F#5:2 A5:2 F#5:4 E5:2',
        'D5:2 E5:2 F#5:2 A5:2 B5:4 A5:2 F#5:2 E5:2 F#5:4 D5:2 E5:2 D5:2 B4:2 B4:2',
        'B5:4 A5:2 F#5:2 B5:4 A5:2 F#5:2 D5:4 E5:2 F#5:2 A5:2 F#5:2 E5:2 D5:2 F#5:2',
        'E5:2 F#5:2 A5:2 B5:2 A5:4 F#5:2 E5:2 D5:2 E5:2 D5:2 B4:2 D5:2 E5:2 D5:4'
      ]
    },
    s6: {
      bpm: 150, prog: ['Cm', 'G#', 'D#', 'A#', 'Cm', 'G#', 'D#', 'A#'], drums: 'half',
      lead: [
        'C5:2 D#5:2 G5:2 F5:2 D#5:2 C5:2 D5:2 D#5:2 F5:4 D#5:2 D5:2 D#5:2 G5:2 C6:4',
        'G5:2 G#5:2 G5:2 F5:2 D#5:4 D5:2 D#5:2 F5:4 G5:2 F5:2 D#5:2 D5:2 C5:4',
        'C6:4 A#5:2 C6:2 G#5:4 G5:2 F5:2 G5:4 D#5:2 F5:2 G5:2 F5:2 D#5:2 D5:2',
        'D#5:2 F5:2 G5:2 G#5:2 G5:4 F5:2 D#5:2 D5:2 D#5:4 C5:2 D5:2 D#5:2 C5:4'
      ]
    },
    boss: {
      bpm: 175, prog: ['Em', 'D', 'C', 'B7', 'Em', 'D', 'C', 'B7'], drums: 'drive',
      lead: [
        'E5:2 E5:2 D5:2 E5:2 G5:2 A5:2 B5:4 A5:2 G5:2 A5:2 B5:2 D6:2 B5:2 A5:2 G5:2',
        'B5:2 A5:2 G5:2 A5:2 B5:2 D6:2 E6:4 D6:2 B5:2 A5:2 G5:2 A5:4 G5:2 E5:2',
        'G5:2 G5:2 A5:2 B5:2 C6:4 B5:2 A5:2 G5:4 E5:2 G5:2 A5:2 B5:2 A5:2 G5:2',
        'E5:4 D5:2 E5:2 G5:4 E5:2 D5:2 B4:4 D5:2 E5:2 G5:2 A5:2 B5:2 D6:2 B5:2'
      ]
    },
    boss2: {
      bpm: 190, prog: ['Am', 'F', 'Dm', 'E', 'Am', 'F', 'Dm', 'E'], drums: 'drive',
      lead: [
        'A4:2 A4:2 B4:2 C5:2 E5:4 D5:2 C5:2 B4:2 C5:2 D5:2 E5:2 A5:2 G5:2 E5:2 D5:2 C5:2 B4:2',
        'E5:2 E5:2 F5:2 E5:2 D5:2 C5:2 D5:4 E5:2 F5:2 G5:2 A5:2 G5:2 F5:2 E5:2 D5:2 B4:2 C5:2',
        'A5:2 A5:2 G5:2 A5:2 C6:4 A5:2 G5:2 F5:2 E5:2 D5:2 E5:2 F5:2 D5:2 C5:2 B4:2',
        'E5:2 G#5:2 B5:2 E6:2 D6:2 C6:2 B5:4 G#5:2 B5:2 E5:2 B5:2 D6:2 C6:2 B5:2 G#5:2'
      ]
    },
    end: {
      bpm: 96, prog: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'], drums: 'calm',
      lead: [
        'E5:4 D5:4 C5:4 D5:4 E5:4 G5:4 A5:4 G5:4',
        'A5:4 G5:4 E5:4 G5:4 A5:4 C6:4 A5:4 G5:4',
        'E5:4 G5:4 A5:4 C6:4 A5:4 G5:4 E5:4 D5:4',
        'C5:4 D5:4 E5:4 D5:4 C5:8 -:4 C5:4'
      ]
    }
  };

  // 预编译：把 lead 展开到每步，生成 bass/arp/drum 轨
  const compiled = {};
  function compile(id) {
    if (compiled[id]) return compiled[id];
    const s = SONGS[id];
    const bars = s.prog.length, total = bars * 16;
    // lead → steps（按事件长度直接展开）
    const lead2 = new Array(total).fill(null);
    {
      const evs2 = [];
      for (const line of s.lead) for (const e of parseLead(line)) evs2.push(e);
      let step = 0, i = 0, guard = 0;
      while (step < total && guard++ < 9999) {
        const e = evs2[i % evs2.length];
        if (!e.rest && step + e.len <= total) lead2[step] = { f: e.f, len: e.len };
        step += e.len; i++;
      }
    }
    // bass / arp 按小节生成
    const bass = new Array(total).fill(null), arp = new Array(total).fill(null);
    for (let b = 0; b < bars; b++) {
      const ch = parseChord(s.prog[b]);
      const third = ch.iv[1], fifth = ch.iv[2];
      for (let k = 0; k < 16; k++) {
        const st = b * 16 + k;
        // 贝斯：8 分音符 根-根-五-根
        if (k % 2 === 0) {
          const seq = [0, 0, 7, 0, 12, 0, 7, 5];
          bass[st] = { semi: ch.root + seq[(k / 2) | 0], oct: 2 };
        }
        // 琶音：16 分 根-5-3-根(高八度)
        const ap = [0, 7, third, 12, 7, third, 12, 19];
        arp[st] = { semi: ch.root + ap[k % 8], oct: 3 };
      }
    }
    const drum = DRUMS[s.drums] || DRUMS.rock;
    return compiled[id] = { bars, total, lead: lead2, bass, arp, drum, bpm: s.bpm };
  }

  /* ---------------- 发声 ---------------- */
  function voiceLead(freq, t, dur) {
    const g = ctx.createGain();
    const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 2700; flt.Q.value = .8;
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = freq; o2.detune.value = 7;
    const eg = ctx.createGain(); eg.gain.value = .5;
    // 颤音
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.6;
    const lg = ctx.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(freq * .006, t + .25);
    lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.17, t + .012);
    g.gain.setValueAtTime(.17, t + Math.max(.02, dur * .6));
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o1.connect(eg); o2.connect(eg); eg.connect(flt); flt.connect(g); g.connect(musicGain);
    o1.start(t); o2.start(t); lfo.start(t);
    o1.stop(t + dur + .05); o2.stop(t + dur + .05); lfo.stop(t + dur + .05);
  }
  function voiceBass(semi, oct, t, dur, transpose) {
    const freq = 440 * Math.pow(2, (semi + oct * 12 + transpose - 69) / 12);
    const g = ctx.createGain();
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = freq / 2;
    const g2 = ctx.createGain(); g2.gain.value = .25;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.16, t + .01);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(musicGain);
    o.start(t); o2.start(t); o.stop(t + dur + .02); o2.stop(t + dur + .02);
  }
  function voiceArp(semi, oct, t, dur, transpose) {
    const freq = 440 * Math.pow(2, (semi + oct * 12 + transpose - 69) / 12);
    const g = ctx.createGain();
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(.045, t);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + dur + .02);
  }
  function noiseBuf(dur) {
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  function drumHit(kind, t) {
    if (kind === 'k') {
      const o = ctx.createOscillator(); o.type = 'sine';
      const g = ctx.createGain();
      o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .1);
      g.gain.setValueAtTime(.24, t); g.gain.exponentialRampToValueAtTime(.001, t + .12);
      o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + .13);
    } else if (kind === 's' || kind === 'a') {
      const src = ctx.createBufferSource(); src.buffer = noiseBuf(.11);
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = kind === 'a' ? 6000 : 2200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(kind === 'a' ? .07 : .13, t);
      g.gain.exponentialRampToValueAtTime(.001, t + (kind === 'a' ? .2 : .09));
      src.connect(f); f.connect(g); g.connect(musicGain); src.start(t);
    } else if (kind === 'h') {
      const src = ctx.createBufferSource(); src.buffer = noiseBuf(.03);
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 8000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.001, t + .03);
      src.connect(f); f.connect(g); g.connect(musicGain); src.start(t);
    }
  }

  /* ---------------- 播放调度 ---------------- */
  function play(id, transpose) {
    if (!ensure()) return;
    stop();
    const song = compile(id);
    cur = { song, transpose: transpose || 0, step: 0, next: ctx.currentTime + .06 };
    if (!timer) timer = setInterval(tick, 35);
  }
  function stop() { cur = null; }
  function tick() {
    if (!cur || !ctx) return;
    const spb = 60 / (cur.song.bpm * 4); // 每 16 分音符秒数
    while (cur.next < ctx.currentTime + .18) {
      const st = cur.step % cur.song.total;
      const t = cur.next, tr = cur.transpose;
      const L = cur.song.lead[st];
      if (L) voiceLead(noteFreq(L.f, tr), t, L.len * spb * .92);
      const B = cur.song.bass[st];
      if (B) voiceBass(B.semi, B.oct, t, spb * 1.7, tr);
      const A = cur.song.arp[st];
      if (A) voiceArp(A.semi, A.oct, t, spb * .9, tr);
      const d = cur.song.drum[st];
      if (d && d !== '-') drumHit(d, t);
      cur.next += spb;
      cur.step++;
    }
  }
  // 小过场旋律（过关/游戏结束）
  function jingle(type) {
    if (!ensure()) return;
    const t0 = ctx.currentTime + .03;
    const seq = type === 'clear'
      ? [['C5', 0], ['E5', .09], ['G5', .18], ['C6', .27], ['G5', .42], ['C6', .51], ['E6', .6]]
      : [['E4', 0], ['C4', .16], ['A3', .32], ['F3', .48], ['E3', .7]];
    for (const [n, dt] of seq) {
      const f = noteFreq(n, 0);
      const g = ctx.createGain();
      const o = ctx.createOscillator(); o.type = type === 'clear' ? 'square' : 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(.14, t0 + dt);
      g.gain.exponentialRampToValueAtTime(.001, t0 + dt + .3);
      o.connect(g); g.connect(sfxGain);
      o.start(t0 + dt); o.stop(t0 + dt + .35);
    }
  }

  /* ---------------- 音效 ---------------- */
  const lastSfx = {};
  function throttle(key, ms) {
    const now = performance.now();
    if (lastSfx[key] && now - lastSfx[key] < ms) return false;
    lastSfx[key] = now; return true;
  }
  function tone(freq, dur, type, vol, slide, delay) {
    if (!ensure()) return;
    const t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(); o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(sfxGain);
    o.start(t); o.stop(t + dur + .02);
  }
  function noise(dur, vol, hp, delay) {
    if (!ensure()) return;
    const t = ctx.currentTime + (delay || 0);
    const src = ctx.createBufferSource(); src.buffer = noiseBuf(dur);
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t);
  }
  const SFX = {
    shoot() { if (throttle('sh', 70)) tone(1400, .045, 'square', .03, .55); },
    shot2() { if (throttle('sh2', 70)) tone(980, .06, 'sawtooth', .035, .5); },
    hit() { if (throttle('ht', 45)) noise(.04, .06, 3000); },
    kill() { noise(.16, .16, 900); tone(520, .18, 'triangle', .12, .3); },
    bigKill() { noise(.5, .3, 300); tone(300, .5, 'sawtooth', .2, .25); tone(150, .6, 'sine', .25, .4); },
    death() { noise(.7, .35, 200); tone(880, .7, 'sawtooth', .22, .12); tone(440, .8, 'square', .12, .1, .05); },
    bomb() { noise(.9, .28, 150); tone(90, 1, 'sine', .3, 2.2); tone(1200, .4, 'sawtooth', .1, .3, .1); },
    item() { if (throttle('it', 50)) tone(1180, .07, 'square', .06, 1.6); },
    itemBig() { tone(880, .09, 'square', .09, 1.5); tone(1320, .12, 'square', .09, 1.5, .07); },
    extend() { ['C5', 'E5', 'G5', 'C6', 'E6'].forEach((n, i) => tone(noteFreq(n, 0), .22, 'square', .12, 1, i * .1)); },
    spell() { tone(1568, .5, 'sine', .16, .8); tone(2093, .45, 'sine', .1, .8, .02); tone(784, .55, 'triangle', .1, .9, .01); },
    bossIn() { noise(.4, .2, 500); tone(196, .5, 'sawtooth', .18, 1.02); tone(98, .6, 'square', .12, 1.01, .05); },
    menu() { tone(920, .05, 'square', .07, 1.2); },
    confirm() { tone(660, .08, 'square', .09, 1.1); tone(990, .12, 'square', .09, 1.1, .07); },
    talk() { if (throttle('tk', 60)) tone(1600 + Math.random() * 500, .03, 'square', .028, .8); },
    graze() { if (throttle('gz', 60)) tone(3200, .025, 'sine', .03, 1.4); },
    laser() { if (throttle('ls', 120)) tone(240, .22, 'sawtooth', .07, 1.5); },
    charge() { tone(220, .8, 'sawtooth', .1, 3.4); },
    timeout() { tone(520, .3, 'square', .1, .6); tone(390, .35, 'square', .1, .6, .12); }
  };

  return { ensure, play, stop, jingle, SFX, toggleMute, get muted() { return muted; } };
})();
