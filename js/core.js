'use strict';
/* =========================================================
   basics
   ========================================================= */
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOut = k => 1 - (1 - k) * (1 - k);
const easeIn = k => k * k;
const easeInOut = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
const easeBack = k => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const PENTA = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86];
const PARTY = ['#ff7a8a', '#ffd56b', '#7fdcc0', '#8fb8ff', '#c9a7ff', '#ffb38a'];
const today = () => new Date().toISOString().slice(0, 10);

/* settings: this device only */
const KEY = 'powan-v1';
const state = Object.assign({ volume: .8, bgm: true, voice: true, voiceKind: 'zundamon', hints: true, vibe: true, limit: 0, day: today(), sec: 0 },
  (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })());
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
function haptic(ms = 12) { if (state.vibe && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} }

/* =========================================================
   sound: a small synth with a soft echo, no audio files
   ========================================================= */
const A = {
  ctx: null,
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const c = this.ctx = new AC();
      const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      this.master = c.createGain(); this.master.gain.value = state.volume;
      this.master.connect(comp); comp.connect(c.destination);
      this.dry = c.createGain(); this.dry.connect(this.master);
      this.send = c.createGain();
      const d = c.createDelay(1); d.delayTime.value = .17;
      const fb = c.createGain(); fb.gain.value = .32;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
      const wet = c.createGain(); wet.gain.value = .35;
      this.send.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(this.master);
      const len = c.sampleRate * 2;
      this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  now() { return this.ctx ? this.ctx.currentTime : 0; },
  setVolume(v) { if (this.master) this.master.gain.value = v; },
  route(g, wet) {
    g.connect(this.dry);
    if (wet) { const s = this.ctx.createGain(); s.gain.value = wet; g.connect(s); s.connect(this.send); }
  },
  osc(f, o = {}) {
    if (!this.ctx) return;
    const c = this.ctx, t = (o.at ?? c.currentTime) + (o.when || 0);
    const a = o.a ?? .005, h = o.hold ?? 0, r = o.r ?? .3, v = o.vol ?? .2, end = t + a + h + r;
    const osc = c.createOscillator(); osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + (o.slideT || .2));
    if (o.vib) {
      const l = c.createOscillator(), lg = c.createGain();
      l.frequency.value = o.vib; lg.gain.value = f * (o.vibD || .03);
      l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(end + .05);
    }
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    g.gain.setValueAtTime(v, t + a + h);
    g.gain.exponentialRampToValueAtTime(.0001, end);
    let node = osc;
    if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
    node.connect(g); this.route(g, o.wet ?? .3);
    osc.start(t); osc.stop(end + .05);
  },
  noise(o = {}) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + (o.when || 0), dur = o.dur || .4;
    const src = c.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
    const f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.from || 1000, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const g = c.createGain(), v = o.vol ?? .2;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * .25); g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(f); f.connect(g); this.route(g, o.wet ?? .1);
    src.start(t); src.stop(t + dur + .05);
  },
  bell(f, o = {}) {
    const v = o.vol ?? .16;
    this.osc(f, { ...o, r: o.r ?? 1.1, vol: v });
    this.osc(f * 2, { ...o, r: .5, vol: v * .35 });
    this.osc(f * 3.01, { ...o, r: .25, vol: v * .12 });
  },
  musicbox(f, o = {}) { this.bell(f, { r: 1.8, wet: .55, vol: .13, ...o }); },
  pluck(f, o = {}) { this.osc(f, { type: 'triangle', r: .35, vol: .22, ...o }); },
  pop() { this.osc(520, { type: 'triangle', slide: 1100, slideT: .07, r: .09, vol: .25, wet: .1 }); },
  boing() { this.osc(180, { type: 'triangle', slide: 640, slideT: .22, hold: .05, r: .2, vol: .25 }); },
  whoosh() { this.noise({ from: 300, to: 2800, dur: .45, vol: .2 }); },
  click() { this.osc(1400, { r: .03, vol: .12, wet: 0 }); },
  giggle() { for (let i = 0; i < 4; i++) this.osc(920 - i * 70, { when: i * .11, vib: 18, vibD: .06, hold: .04, r: .07, vol: .13, wet: .2 }); },
  tada() { [60, 64, 67, 72, 76].forEach((m, i) => this.bell(mtof(m + 12), { when: i * .07, vol: .15 })); },
  twinkle() { for (let i = 0; i < 3; i++) this.bell(mtof(pick(PENTA) + 12), { when: i * .07, vol: .07 }); },
  chirp() { [0, .12].forEach(w => this.osc(2300, { when: w, slide: 3300, slideT: .06, r: .07, vol: .12 })); },
  meow() { this.osc(720, { type: 'triangle', hold: .12, slide: 430, slideT: .38, vib: 6, r: .22, vol: .2 }); },
  yawn() { this.osc(520, { hold: .5, slide: 230, slideT: .75, vib: 5, r: .3, vol: .16 }); },
  voice(kind, f) {
    if (kind === 'chick') this.osc(f * 2, { vib: 14, vibD: .04, hold: .07, r: .16, vol: .2, slide: f * 2.2, slideT: .1 });
    else if (kind === 'cat') this.osc(f, { type: 'triangle', hold: .12, slide: f * .85, slideT: .3, vib: 6, r: .25, vol: .26 });
    else if (kind === 'dog') this.osc(f, { type: 'square', lp: 1600, hold: .06, r: .16, vol: .12, slide: f * 1.06, slideT: .08 });
    else if (kind === 'frog') this.osc(f, { type: 'sawtooth', lp: 900, vib: 28, vibD: .05, hold: .1, r: .16, vol: .15 });
    else this.bell(f, { vol: .2 });
  }
};

/* ぽわん's voice: pre-rendered VOICEVOX clips (voices/*.js), falling back to the browser's speech */
const VOICE_PACKS = {};
/* real recordings (sounds/animals.js, built by tools/sounds.py); every caller falls back to the synth */
const SOUND_PACK = {};
const sampleCache = new Map();
A.sample = function (name, o = {}) {
  const b64 = SOUND_PACK[name];
  if (!b64 || !this.ctx) return false;
  if (!sampleCache.has(name)) {
    const bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    sampleCache.set(name, this.ctx.decodeAudioData(bytes.buffer).catch(() => null));
  }
  const c = this.ctx, when = c.currentTime + (o.when || 0);
  sampleCache.get(name).then(buf => {
    if (!buf) return;
    const src = c.createBufferSource(), g = c.createGain();
    src.buffer = buf; src.playbackRate.value = o.rate || 1;
    g.gain.value = o.vol ?? .9;
    src.connect(g); this.route(g, o.wet ?? .12);
    const t0 = Math.max(when, c.currentTime);
    src.start(t0);
    if (o.dur) { g.gain.setValueAtTime(g.gain.value, t0 + o.dur); g.gain.linearRampToValueAtTime(0, t0 + o.dur + .12); src.stop(t0 + o.dur + .15); }
  });
  return true;
};
/* an animal's real cry: dog cat lion elephant pig cow duck chick frog bird whale sheep horse */
A.animal = function (kind, o) { return this.sample(kind, o) || this.sample('sfx:' + kind, o); };  // falls back to sfx pack (chick, horse, sheep, goat, owl, rooster, bee, kitten)
const meowSynth = A.meow, chirpSynth = A.chirp;
A.meow = function () { if (!this.animal('cat')) meowSynth.call(this); };
A.chirp = function () { if (!this.animal('bird', { vol: .6 })) chirpSynth.call(this); };

/* real CC0 sound effects (sounds/sfx.js) layered over the synth versions */
A.sfx = function (name, o) { return this.sample('sfx:' + name, o); };
{
  const synth = { pop: A.pop, boing: A.boing, whoosh: A.whoosh, tada: A.tada, twinkle: A.twinkle, gulp: A.gulp };
  A.pop = function () { if (!this.sfx(Math.random() < .5 ? 'pop' : 'bubble', { rate: rand(.9, 1.15), vol: .8 })) synth.pop.call(this); };
  A.boing = function () { if (!this.sfx(Math.random() < .5 ? 'boing' : 'spring', { rate: rand(.95, 1.1), vol: .7 })) synth.boing.call(this); };
  A.whoosh = function () { if (!this.sfx(Math.random() < .5 ? 'whoosh' : 'whoosh2', { vol: .6 })) synth.whoosh.call(this); };
  A.twinkle = function () { if (!this.sfx('sparkle', { rate: rand(.95, 1.2), vol: .45 })) synth.twinkle.call(this); };
  A.gulp = function (n) { if (!this.sfx('gulp', { vol: .8 }) && synth.gulp) synth.gulp.call(this, n); };
  // celebrations: a little fanfare plus children laughing
  A.tada = function () {
    if (!this.sfx('tada', { vol: .75 })) synth.tada.call(this);
    this.sfx('kidlaugh', { when: .5, vol: .45 });
    Music.duck(2.6);
  };
}

/* background music: one gentle loop per scene, ducked while ぽわん talks */
const Music = {
  cur: null, name: '', gain: null, buffers: new Map(),
  level() { return state.bgm ? .32 : 0; },
  buffer(name) {
    if (!this.buffers.has(name)) {
      const bin = atob(BGM_PACK[name]), bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      this.buffers.set(name, A.ctx.decodeAudioData(bytes.buffer).catch(() => null));
    }
    return this.buffers.get(name);
  },
  play(name) {
    if (!A.ctx || typeof BGM_PACK !== 'object' || !BGM_PACK[name]) return this.stop();
    if (this.name === name && this.cur) return;
    this.stop();
    this.name = name;
    const c = A.ctx, g = this.gain = c.createGain();
    g.gain.value = 0; g.connect(A.master);
    this.buffer(name).then(buf => {
      if (!buf || this.name !== name || this.gain !== g) return;
      const src = c.createBufferSource();
      src.buffer = buf; src.loop = true; src.connect(g); src.start();
      this.cur = src;
      g.gain.setTargetAtTime(this.level(), c.currentTime, .6);
    });
  },
  stop() {
    if (this.gain && A.ctx) {
      const g = this.gain, src = this.cur, t = A.ctx.currentTime;
      g.gain.setTargetAtTime(0, t, .25);
      setTimeout(() => { try { src && src.stop(); } catch (e) {} g.disconnect(); }, 1200);
    }
    this.cur = null; this.gain = null; this.name = '';
  },
  refresh() { if (this.gain && A.ctx) this.gain.gain.setTargetAtTime(this.level(), A.ctx.currentTime, .3); },
  duck(sec) {
    if (!this.gain || !A.ctx) return;
    const g = this.gain.gain, t = A.ctx.currentTime;
    g.cancelScheduledValues(t); g.setTargetAtTime(this.level() * .35, t, .08);
    g.setTargetAtTime(this.level(), t + sec, .5);
  }
};

let jaVoice = null;
function findVoice() { try { jaVoice = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang)) || null; } catch (e) {} }
if ('speechSynthesis' in window) { findVoice(); speechSynthesis.onvoiceschanged = findVoice; }
const clipCache = new Map();
let voiceNodes = [];
const normLine = s => s.replace(/[！!？?〜～ー。、\s]+$/g, '').replace(/\s+/g, ' ').trim();
function clipKeys(pack, text) {
  const c = pack.clips;
  if (c[text]) return [text];
  if (!pack.norm) { pack.norm = {}; for (const k in c) if (!(normLine(k) in pack.norm)) pack.norm[normLine(k)] = k; }
  const n = pack.norm[normLine(text)];
  if (n) return [n];
  const keys = [];
  for (const p of text.split(/\s+/).filter(Boolean)) {
    const k = c[p] ? p : pack.norm[normLine(p)];
    if (!k) return null;
    keys.push(k);
  }
  return keys.length ? keys : null;
}
function clipBuffer(vid, key) {
  const id = vid + '|' + key;
  if (!clipCache.has(id)) {
    const bin = atob(VOICE_PACKS[vid].clips[key]), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    clipCache.set(id, A.ctx.decodeAudioData(bytes.buffer));
  }
  return clipCache.get(id);
}
function stopSpeech() {
  voiceNodes.forEach(n => { try { n.stop(); } catch (e) {} });
  voiceNodes = [];
  try { speechSynthesis.cancel(); } catch (e) {}
}
function browserSay(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = 1; u.pitch = 1.55; u.volume = Math.min(1, state.volume + .15);
    if (jaVoice) u.voice = jaVoice;
    speechSynthesis.speak(u);
  } catch (e) {}
}
function say(text) {
  if (!state.voice) return;
  stopSpeech();
  const pack = VOICE_PACKS[state.voiceKind];
  const keys = pack && A.ctx && clipKeys(pack, text);
  if (!keys) { browserSay(text); return; }
  const vid = state.voiceKind, mine = [];
  voiceNodes = mine;
  Promise.all(keys.map(k => clipBuffer(vid, k))).then(bufs => {
    if (voiceNodes !== mine) return;
    let t = A.ctx.currentTime + .02;
    Music.duck(bufs.reduce((s, b) => s + b.duration, 0) + .3);
    bufs.forEach(b => {
      const src = A.ctx.createBufferSource(), g = A.ctx.createGain();
      src.buffer = b; g.gain.value = 1.1;
      src.connect(g); g.connect(A.master);
      src.start(t); t += b.duration + .04;
      mine.push(src);
    });
  }).catch(() => browserSay(text));
}

/* =========================================================
   runtime: timers, frame loops and listeners that die with a scene
   ========================================================= */
function createRuntime() {
  const timers = new Set(), loops = new Set(), offs = [];
  let alive = true, raf = 0, last = 0;
  const tick = t => {
    if (!alive) return;
    const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
    [...loops].forEach(f => f(dt, t / 1000));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  const rt = {
    get alive() { return alive; },
    after(ms, fn) { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; },
    every(ms, fn) { const id = setInterval(() => { if (alive) fn(); }, ms); timers.add(id); return id; },
    loop(fn) { loops.add(fn); return () => loops.delete(fn); },
    tween(dur, fn, done, ease = easeInOut) {
      const t0 = performance.now();
      const stop = rt.loop(() => {
        const k = Math.min(1, (performance.now() - t0) / dur);
        fn(ease(k));
        if (k >= 1) { stop(); if (done) done(); }
      });
      return stop;
    },
    on(target, type, fn, opt) { target.addEventListener(type, fn, opt); offs.push(() => target.removeEventListener(type, fn, opt)); },
    cleanup(fn) { offs.push(fn); },
    destroy() {
      alive = false; cancelAnimationFrame(raf);
      timers.forEach(id => { clearTimeout(id); clearInterval(id); });
      offs.forEach(f => f());
    }
  };
  return rt;
}

function makeScene(host) {
  host.replaceChildren();
  const svg = el('svg', { viewBox: '0 0 400 760', preserveAspectRatio: 'xMidYMid meet' });
  const defs = el('defs', {}, svg);
  const gg = el('radialGradient', { id: 'gGhost', cx: '.38', cy: '.3', r: '.85' }, defs);
  [[0, '#ffffff'], [.55, '#f7f3ff'], [1, '#d6c8ff']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, gg));
  const sh = el('filter', { id: 'soft', x: '-20%', y: '-20%', width: '140%', height: '150%' }, defs);
  el('feDropShadow', { dx: 0, dy: 6, stdDeviation: 5, 'flood-color': '#3a2f5b', 'flood-opacity': .16 }, sh);
  const gl = el('filter', { id: 'glow', x: '-60%', y: '-60%', width: '220%', height: '220%' }, defs);
  el('feGaussianBlur', { stdDeviation: 10 }, gl);
  host.appendChild(svg);

  const rt = createRuntime();
  const ctx = Object.assign(rt, {
    svg, defs, host,
    point(e) { return ctx.pointXY(e.clientX, e.clientY); },
    pointXY(x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM().inverse()); },
    toScreen(x, y) { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(svg.getScreenCTM()); },
    ghost(parent, o) { return makeGhost(ctx, parent, o); },
    reward() { if (window.powanReward) window.powanReward(); },
    bubble(text, x, y) {
      const w = text.length * 19 + 32;
      x = clamp(x, w / 2 + 6, 394 - w / 2);
      if (ctx._bubble) { const prev = ctx._bubble; prev.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120 }).onfinish = () => prev.remove(); }
      const g = el('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})`, 'pointer-events': 'none' }, svg);
      ctx._bubble = g;
      const b = el('g', { class: 'tb' }, g);
      el('rect', { x: -w / 2, y: -24, width: w, height: 46, rx: 23, fill: '#fff', stroke: '#e3dafc', 'stroke-width': 3 }, b);
      el('path', { d: 'M-8,20 L0,32 L8,20Z', fill: '#fff' }, b);
      const t = el('text', { x: 0, y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 19, fill: '#3a2f5b' }, b);
      t.textContent = text;
      b.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: .6 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260 });
      rt.after(1900, () => { if (!g.isConnected) return; b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250 }).onfinish = () => { g.remove(); if (ctx._bubble === g) ctx._bubble = null; }; });
    },
    sparkle(x, y, n = 6, spread = 50, color = '#ffd56b') {
      for (let i = 0; i < n; i++) {
        const g = el('g', { transform: `translate(${(x + rand(-spread, spread)).toFixed(0)} ${(y + rand(-spread, spread)).toFixed(0)})`, 'pointer-events': 'none' }, svg);
        const s = el('path', { d: 'M0,-13 Q2,-2 13,0 Q2,2 0,13 Q-2,2 -13,0 Q-2,-2 0,-13Z', fill: color, class: 'tb' }, g);
        s.animate([{ transform: 'scale(0) rotate(0deg)' }, { transform: 'scale(1.2) rotate(90deg)', offset: .5 }, { transform: 'scale(0) rotate(180deg)' }],
          { duration: 900, delay: i * 55, fill: 'backwards' }).onfinish = () => g.remove();
      }
    },
    confetti(x, y, n = 24) {
      const g = el('g', { 'pointer-events': 'none' }, svg);
      const bits = [];
      for (let i = 0; i < n; i++) {
        const a = rand(-Math.PI * .95, -Math.PI * .05), sp = rand(220, 460);
        const node = Math.random() < .5
          ? el('rect', { x: -5, y: -3, width: 10, height: 6, rx: 2, fill: pick(PARTY) }, g)
          : el('circle', { r: 4.5, fill: pick(PARTY) }, g);
        bits.push({ node, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(0, 360), vr: rand(-500, 500) });
      }
      let life = 0;
      const stop = rt.loop(dt => {
        life += dt;
        bits.forEach(b => {
          b.vy += 700 * dt; b.vx *= .985; b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt;
          b.node.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.r.toFixed(0)})`);
        });
        g.setAttribute('opacity', clamp(1.8 - life, 0, 1).toFixed(2));
        if (life > 1.8) { stop(); g.remove(); }
      });
    }
  });
  return ctx;
}

/* =========================================================
   ぽわん, the ghost
   ========================================================= */
const GHOST_D = 'M-56,8 C-56,-50 -31,-72 0,-72 C31,-72 56,-50 56,8 L56,52 Q47,68 35,54 Q23,68 12,54 Q0,68 -12,54 Q-23,68 -35,54 Q-47,68 -56,52 Z';
function makeGhost(ctx, parent, o = {}) {
  const pos = el('g', {}, parent);
  const halo = el('circle', { cx: 0, cy: -4, r: 92, fill: '#fff3b0', opacity: 0, filter: 'url(#glow)' }, pos);
  const flo = el('g', { class: o.still ? '' : 'float' }, pos);
  const body = el('g', { class: 'tb' }, flo);
  el('ellipse', { cx: -58, cy: 14, rx: 14, ry: 9, fill: '#efe8ff', transform: 'rotate(-25 -58 14)' }, body);
  const armR = el('g', {}, body);
  el('ellipse', { cx: 58, cy: 14, rx: 14, ry: 9, fill: '#efe8ff', transform: 'rotate(25 58 14)' }, armR);
  if (o.baton) {
    el('path', { d: 'M62,10 L100,-28', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round' }, armR);
    el('circle', { cx: 101, cy: -29, r: 7, fill: '#ffd56b' }, armR);
  }
  el('path', { d: GHOST_D, fill: 'url(#gGhost)', stroke: '#d9ccff', 'stroke-width': 2.5 }, body);
  el('ellipse', { cx: -24, cy: -46, rx: 15, ry: 8, fill: '#fff', opacity: .9, transform: 'rotate(-32 -24 -46)' }, body);
  el('ellipse', { cx: -34, cy: -2, rx: 10, ry: 6.5, fill: '#ffb3c4', opacity: .75 }, body);
  el('ellipse', { cx: 34, cy: -2, rx: 10, ry: 6.5, fill: '#ffb3c4', opacity: .75 }, body);
  const gaze = el('g', {}, body), eyes = el('g', { class: 'tb' }, gaze), mouth = el('g', {}, body);
  const INK = '#3a2f5b', LIP = '#ff7a8a';
  const line = (g, d, w = 4.5, c = INK) => el('path', { d, fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': 'round' }, g);
  let cur = '';
  function set(ex) {
    if (ex === cur) return;
    cur = ex; eyes.replaceChildren(); mouth.replaceChildren();
    if (ex === 'happy') {
      line(eyes, 'M-28,-16 Q-20,-28 -12,-16'); line(eyes, 'M12,-16 Q20,-28 28,-16');
      el('path', { d: 'M-11,-3 Q0,15 11,-3Z', fill: LIP }, mouth);
    } else if (ex === 'surprise') {
      [-20, 20].forEach(x => { el('circle', { cx: x, cy: -18, r: 9.5, fill: INK }, eyes); el('circle', { cx: x - 3, cy: -22, r: 3.2, fill: '#fff' }, eyes); });
      el('ellipse', { cx: 0, cy: 4, rx: 6, ry: 8, fill: LIP }, mouth);
    } else if (ex === 'sleepy') {
      line(eyes, 'M-28,-17 Q-20,-10 -12,-17', 4); line(eyes, 'M12,-17 Q20,-10 28,-17', 4);
      el('circle', { cx: 0, cy: 3, r: 4, fill: LIP }, mouth);
    } else {
      [-20, 20].forEach(x => { el('ellipse', { cx: x, cy: -18, rx: 7.5, ry: 9.5, fill: INK }, eyes); el('circle', { cx: x - 3, cy: -22, r: 3, fill: '#fff' }, eyes); });
      line(mouth, 'M-8,-1 Q0,7 8,-1', 3.5);
    }
  }
  set(o.expr || 'normal');
  let X = o.x || 0, Y = o.y || 0, S = o.s || 1, stopMove = null;
  const place = (x, y, s = S) => { X = x; Y = y; S = s; pos.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`); };
  place(X, Y, S);
  if (ctx) ctx.every(3600, () => {
    if (cur === 'normal' || cur === 'surprise') eyes.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 200 });
  });
  const api = {
    pos, body, armR,
    get x() { return X; }, get y() { return Y; }, get s() { return S; }, get expr() { return cur; },
    set, place,
    moveTo(x, y, s = S, dur = 600, done, ease = easeInOut) {
      if (stopMove) stopMove();
      const x0 = X, y0 = Y, s0 = S;
      stopMove = ctx.tween(dur, k => place(x0 + (x - x0) * k, y0 + (y - y0) * k, s0 + (s - s0) * k), () => { stopMove = null; if (done) done(); }, ease);
    },
    hop() { body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12,.88)' }, { transform: 'scale(.94,1.08)' }, { transform: 'scale(1)' }], { duration: 420 }); },
    giggle() {
      set('happy'); A.giggle();
      body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(0deg)' }], { duration: 620 });
    },
    swing(deg = 30, dur = 220) {
      ctx.tween(dur, k => armR.setAttribute('transform', `rotate(${(Math.sin(k * Math.PI) * -deg).toFixed(1)} 50 14)`));
    },
    look(x, y) {
      const dx = clamp((x - X) / S * .06, -6, 6), dy = clamp((y - Y) / S * .05, -4, 4);
      gaze.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);
    },
    glow(on) { halo.animate([{ opacity: on ? 0 : .6 }, { opacity: on ? .6 : 0 }], { duration: 800, fill: 'forwards' }); },
    talk(text, voice = true) { ctx.bubble(text, X, Y - 72 * S - 36); if (voice) say(text); }
  };
  return api;
}

/* =========================================================
   animal friends (used by the band and bedtime)
   ========================================================= */
function eyePair(g, dx, y, r = 7.5) {
  const open = el('g', {}, g), shut = el('g', { style: 'display:none' }, g);
  [-dx, dx].forEach(x => {
    el('ellipse', { cx: x, cy: y, rx: r, ry: r * 1.2, fill: '#2b2340' }, open);
    el('circle', { cx: x - r * .35, cy: y - r * .5, r: r * .38, fill: '#fff' }, open);
    el('path', { d: `M${x - 9},${y} Q${x},${y + 7} ${x + 9},${y}`, stroke: '#2b2340', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, shut);
  });
  return { open, shut };
}
function cheeks(g, dx = 32, y = 14) {
  [-dx, dx].forEach(x => el('ellipse', { cx: x, cy: y, rx: 9, ry: 6, fill: '#ffa3b8', opacity: .75 }, g));
}
const ANIMALS = {
  chick(g) {
    el('ellipse', { cx: -48, cy: 18, rx: 14, ry: 22, fill: '#ffd23f', transform: 'rotate(20 -48 18)' }, g);
    el('ellipse', { cx: 48, cy: 18, rx: 14, ry: 22, fill: '#ffd23f', transform: 'rotate(-20 48 18)' }, g);
    el('ellipse', { cx: -16, cy: 56, rx: 10, ry: 6, fill: '#ff9a1f' }, g);
    el('ellipse', { cx: 16, cy: 56, rx: 10, ry: 6, fill: '#ff9a1f' }, g);
    el('ellipse', { cx: 0, cy: 6, rx: 52, ry: 50, fill: '#ffe066' }, g);
    el('path', { d: 'M-6,-42 Q-12,-64 0,-60 Q5,-70 11,-58 Q16,-48 6,-42Z', fill: '#ffd23f' }, g);
    el('ellipse', { cx: -18, cy: -26, rx: 12, ry: 7, fill: '#fff', opacity: .55, transform: 'rotate(-25 -18 -26)' }, g);
    const e = eyePair(g, 18, -6); cheeks(g, 32, 10);
    const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
    el('path', { d: 'M-10,8 L10,8 L0,20Z', fill: '#ff9a1f' }, mc);
    el('ellipse', { cx: 0, cy: 15, rx: 8, ry: 5, fill: '#8a3b2a' }, mo);
    el('path', { d: 'M-11,4 L11,4 L0,12Z', fill: '#ff9a1f' }, mo);
    el('path', { d: 'M-9,18 L9,18 L0,27Z', fill: '#ff9a1f' }, mo);
    return { ...e, mc, mo };
  },
  cat(g) {
    el('path', { d: 'M-46,-20 L-38,-66 L-8,-44Z', fill: '#ffa95c' }, g);
    el('path', { d: 'M46,-20 L38,-66 L8,-44Z', fill: '#ffa95c' }, g);
    el('path', { d: 'M-38,-30 L-35,-54 L-20,-41Z', fill: '#ffc4c4' }, g);
    el('path', { d: 'M38,-30 L35,-54 L20,-41Z', fill: '#ffc4c4' }, g);
    el('ellipse', { cx: 0, cy: 46, rx: 34, ry: 18, fill: '#ffa95c' }, g);
    el('circle', { r: 50, fill: '#ffb066' }, g);
    el('path', { d: 'M-8,-48 L-6,-34 M0,-50 L0,-33 M8,-48 L6,-34', stroke: '#e88a3a', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    el('ellipse', { cx: -20, cy: -28, rx: 12, ry: 6, fill: '#fff', opacity: .4, transform: 'rotate(-25 -20 -28)' }, g);
    const e = eyePair(g, 20, -4); cheeks(g, 34, 14);
    el('path', { d: 'M-5,9 L5,9 L0,15Z', fill: '#ff7a8a' }, g);
    el('path', { d: 'M-26,12 L-50,7 M-26,19 L-50,21 M26,12 L50,7 M26,19 L50,21', stroke: '#a0603a', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
    const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
    el('path', { d: 'M-10,18 Q-5,24 0,17 Q5,24 10,18', stroke: '#8a4a2a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, mc);
    el('ellipse', { cx: 0, cy: 25, rx: 9, ry: 10, fill: '#c2405a' }, mo);
    return { ...e, mc, mo };
  },
  dog(g) {
    el('ellipse', { cx: 0, cy: 46, rx: 34, ry: 18, fill: '#d9a066' }, g);
    el('circle', { r: 50, fill: '#d9a066' }, g);
    el('ellipse', { cx: 18, cy: -8, rx: 17, ry: 15, fill: '#c48a50' }, g);
    el('ellipse', { cx: -48, cy: -4, rx: 16, ry: 32, fill: '#9c6a3a', transform: 'rotate(18 -48 -4)' }, g);
    el('ellipse', { cx: 48, cy: -4, rx: 16, ry: 32, fill: '#9c6a3a', transform: 'rotate(-18 48 -4)' }, g);
    el('ellipse', { cx: -20, cy: -30, rx: 12, ry: 6, fill: '#fff', opacity: .35, transform: 'rotate(-25 -20 -30)' }, g);
    const e = eyePair(g, 20, -10); cheeks(g, 36, 12);
    el('ellipse', { cx: 0, cy: 18, rx: 26, ry: 18, fill: '#f3d9b5' }, g);
    el('ellipse', { cx: 0, cy: 9, rx: 9, ry: 6, fill: '#3a2a20' }, g);
    const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
    el('path', { d: 'M-8,22 Q0,28 8,22', stroke: '#6a4a30', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, mc);
    el('path', { d: 'M-12,21 Q0,44 12,21Z', fill: '#c2405a' }, mo);
    el('ellipse', { cx: 0, cy: 31, rx: 6, ry: 6, fill: '#ff8fa3' }, mo);
    return { ...e, mc, mo };
  },
  frog(g) {
    el('ellipse', { cx: 0, cy: 48, rx: 40, ry: 16, fill: '#6cc45a' }, g);
    el('circle', { cx: -28, cy: -30, r: 19, fill: '#7fd36b' }, g);
    el('circle', { cx: 28, cy: -30, r: 19, fill: '#7fd36b' }, g);
    el('ellipse', { cx: 0, cy: 6, rx: 58, ry: 44, fill: '#7fd36b' }, g);
    const open = el('g', {}, g), shut = el('g', { style: 'display:none' }, g);
    [-28, 28].forEach(x => {
      el('circle', { cx: x, cy: -30, r: 12, fill: '#fff' }, open);
      el('circle', { cx: x, cy: -29, r: 7, fill: '#2b2340' }, open);
      el('circle', { cx: x - 2, cy: -32, r: 2.4, fill: '#fff' }, open);
      el('path', { d: `M${x - 10},${-30} Q${x},${-23} ${x + 10},${-30}`, stroke: '#2b2340', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, shut);
    });
    cheeks(g, 38, 18);
    const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
    el('path', { d: 'M-28,14 Q0,32 28,14', stroke: '#3f8a3a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, mc);
    el('path', { d: 'M-28,12 Q0,50 28,12Z', fill: '#c2405a' }, mo);
    return { open, shut, mc, mo };
  },
  bunny(g) {
    [-20, 20].forEach(x => {
      el('ellipse', { cx: x, cy: -72, rx: 14, ry: 40, fill: '#fff4f7', stroke: '#f3d8e2', 'stroke-width': 2, transform: `rotate(${x / 3} ${x} -72)` }, g);
      el('ellipse', { cx: x, cy: -70, rx: 7, ry: 30, fill: '#ffc4d6', transform: `rotate(${x / 3} ${x} -70)` }, g);
    });
    el('ellipse', { cx: 0, cy: 46, rx: 32, ry: 18, fill: '#fff4f7' }, g);
    el('circle', { r: 48, fill: '#fff4f7', stroke: '#f3d8e2', 'stroke-width': 2 }, g);
    const e = eyePair(g, 18, -4); cheeks(g, 32, 14);
    el('ellipse', { cx: 0, cy: 10, rx: 5, ry: 4, fill: '#ff8fa3' }, g);
    const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
    el('path', { d: 'M0,14 L0,19 M-8,21 Q-4,25 0,19 Q4,25 8,21', stroke: '#c98a9a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, mc);
    el('ellipse', { cx: 0, cy: 25, rx: 8, ry: 9, fill: '#c2405a' }, mo);
    el('rect', { x: -5, y: 16, width: 10, height: 6, rx: 1, fill: '#fff' }, mo);
    return { ...e, mc, mo };
  },
  bear(g) {
    [-36, 36].forEach(x => { el('circle', { cx: x, cy: -38, r: 16, fill: '#b9824f' }, g); el('circle', { cx: x, cy: -38, r: 8, fill: '#e0b48a' }, g); });
    el('ellipse', { cx: 0, cy: 46, rx: 34, ry: 18, fill: '#b9824f' }, g);
    el('circle', { r: 48, fill: '#b9824f' }, g);
    const e = eyePair(g, 20, -6); cheeks(g, 34, 14);
    el('ellipse', { cx: 0, cy: 16, rx: 20, ry: 15, fill: '#e8c49a' }, g);
    el('ellipse', { cx: 0, cy: 9, rx: 8, ry: 6, fill: '#3a2a20' }, g);
    const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
    el('path', { d: 'M-6,20 Q0,25 6,20', stroke: '#6a4a30', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, mc);
    el('ellipse', { cx: 0, cy: 24, rx: 7, ry: 7, fill: '#c2405a' }, mo);
    return { ...e, mc, mo };
  }
};
function makeAnimal(kind, parent, x, y, s = 1) {
  const outer = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  const flo = el('g', {}, outer);
  const body = el('g', { class: 'tb' }, flo);
  const p = ANIMALS[kind](body);
  let X = x, Y = y, S = s, closeT = 0;
  const api = {
    kind, outer, body,
    float(on, delay = 0) { flo.classList.toggle('float', on); flo.style.animationDelay = `-${delay}s`; },
    get x() { return X; }, get y() { return Y; },
    place(x, y, s2 = S) { X = x; Y = y; S = s2; outer.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s2.toFixed(3)})`); },
    mouth(on) { p.mo.style.display = on ? '' : 'none'; p.mc.style.display = on ? 'none' : ''; },
    sleep(on) { p.open.style.display = on ? 'none' : ''; p.shut.style.display = on ? '' : 'none'; },
    sing(ms = 340) {
      api.mouth(true);
      body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.9)' }, { transform: 'scale(.95,1.07)' }, { transform: 'scale(1)' }], { duration: ms });
      clearTimeout(closeT); closeT = setTimeout(() => { if (outer.isConnected) api.mouth(false); }, ms);
    }
  };
  return api;
}

/* every toy file pushes itself here */
const TOYS = [];
