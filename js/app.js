'use strict';
/* =========================================================
   app shell: home, zoom transitions, hints, timer, grown-up area
   ========================================================= */
const homeEl = $('home'), toyEl = $('toy'), stageEl = $('stage'), wipe = $('wipe'), hand = $('hand'), toastEl = $('toast');
let homeCtx = null, toyCtx = null, lastInput = performance.now(), sessionSec = 0, started = false, toastT = 0;

function toast(t) { toastEl.textContent = t; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 1500); }

/* sheets: sheet 1 is free and polished to the max; sheet 2 is the paid page (one-time unlock) */
const SHEET1 = ['light', 'teeth', 'peek', 'balloon', 'band', 'feed'];
const TRIAL_SEC = 60;            // a locked toy can be tried once a day for this long
const PRICE_LABEL = '480えん';   // shown until the store reports the real price
// TEST MODE: sheet 2 is open for everyone while the family tests it. Set to false before the store release.
const WEB_ALL_FREE = true;
state.unlocked = !!state.unlocked || WEB_ALL_FREE;
state.trial = state.trial || { day: '', used: {} };
let homePage = 0;
const sheetOf = t => SHEET1.includes(t.id) ? 0 : 1;
const sheetToys = n => n === 0 ? SHEET1.map(id => TOYS.find(t => t.id === id)).filter(Boolean) : TOYS.filter(t => !SHEET1.includes(t.id));
const isLocked = t => sheetOf(t) === 1 && !state.unlocked;
function trialLeft(t) {
  if (state.trial.day !== today()) state.trial = { day: today(), used: {} };
  return !state.trial.used[t.id];
}
const SHEET_POS = [
  [[110, 262], [290, 262], [110, 440], [290, 440], [110, 618], [290, 618]],
  Array.from({ length: 15 }, (_, i) => [72 + (i % 3) * 128, 244 + Math.floor(i / 3) * 99])
];

function porthole(ctx, parent, t, x, y, r, i, page) {
  const { defs } = ctx;
  const o = el('g', { transform: `translate(${x} ${y})` }, parent);
  const fl = el('g', { class: 'float', style: `animation-delay:-${(i * .6).toFixed(1)}s` }, o);
  const b = el('g', { class: 'tb' }, fl);
  if (page === 1) el('circle', { r: r + 9, fill: '#ffd56b', filter: 'url(#soft)' }, b);
  el('circle', { r: r + 7, fill: '#fff', filter: page === 1 ? null : 'url(#soft)' }, b);
  const clip = el('clipPath', { id: `home-ph${page}-${i}` }, defs);
  el('circle', { r }, clip);
  const inner = el('g', { 'clip-path': `url(#home-ph${page}-${i})` }, b);
  const th = el('g', { transform: `scale(${(r / 76).toFixed(3)})` }, inner);
  el('circle', { r: 80, fill: t.color }, th);
  t.thumb(th);
  el('path', { d: `M${-r * .7},${-r * .5} A${r * .85},${r * .85} 0 0 1 ${-r * .17},${-r * .86}`, stroke: 'rgba(255,255,255,.75)', 'stroke-width': r / 8, fill: 'none', 'stroke-linecap': 'round' }, b);
  if (isLocked(t)) {
    const lk = el('g', { transform: `translate(${r * .68} ${r * .68})` }, b);
    el('circle', { r: 17, fill: trialLeft(t) ? '#ff7a8a' : '#8a82a6', stroke: '#fff', 'stroke-width': 4 }, lk);
    el('rect', { x: -7, y: -2, width: 14, height: 11, rx: 2.5, fill: '#fff' }, lk);
    el('path', { d: 'M-4.5,-2 v-3.5 a4.5,4.5 0 0 1 9,0 v3.5', fill: 'none', stroke: '#fff', 'stroke-width': 2.6 }, lk);
  }
  b.style.cursor = 'pointer';
  b.addEventListener('click', () => enterToy(t, b));
}

function buildHome() {
  if (homeCtx) homeCtx.destroy();
  const ctx = homeCtx = makeScene($('home-scene'));
  const { svg, defs } = ctx;
  const sky = el('linearGradient', { id: 'homesky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [[0, '#cdbfff'], [.55, '#ffe1d2'], [1, '#fff1df']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, sky));
  el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: 'url(#homesky)' }, svg);
  const night = el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: '#5b4aa8', opacity: homePage ? .35 : 0 }, svg);
  for (let i = 0; i < 16; i++) el('circle', { cx: rand(-150, 550).toFixed(0), cy: rand(-150, 260).toFixed(0), r: rand(1.2, 2.6).toFixed(1), fill: '#fff', class: 'twinkle', style: `animation-delay:${rand(0, 2.4).toFixed(1)}s` }, svg);
  const clouds = [[-20, 250, .9], [330, 210, 1.1], [150, 600, .8]].map(([x, y, s]) => {
    const g = el('g', { opacity: .85 }, svg);
    [[0, 0, 22], [26, -10, 30], [56, 0, 20], [28, 8, 22]].forEach(([dx, dy, r]) => el('circle', { cx: dx * s, cy: dy * s, r: r * s, fill: '#fff' }, g));
    return { g, x, y, v: rand(5, 10) };
  });
  ctx.loop(dt => clouds.forEach(c => { c.x += c.v * dt; if (c.x > 520) c.x = -160; c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y})`); }));
  el('ellipse', { cx: 40, cy: 820, rx: 300, ry: 120, fill: '#c7f0df' }, svg);
  el('ellipse', { cx: 400, cy: 840, rx: 300, ry: 130, fill: '#b2e8d3' }, svg);

  // the two sheets sit side by side; the pan group slides between them
  const pan = el('g', { transform: `translate(${-400 * homePage} 0)` }, svg);
  [0, 1].forEach(page => {
    const sheet = el('g', { transform: `translate(${400 * page} 0)` }, pan);
    if (page === 1) {
      const chip = el('g', { transform: 'translate(200 172)' }, sheet);
      el('rect', { x: -96, y: -20, width: 192, height: 40, rx: 20, fill: '#fff', filter: 'url(#soft)' }, chip);
      el('path', { d: 'M-80,8 L-84,-10 L-74,-2 L-68,-14 L-62,-2 L-52,-10 L-56,8Z', fill: '#ffc93c' }, chip);
      const tx = el('text', { x: 14, y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 18, fill: '#3a2f5b' }, chip);
      tx.textContent = state.unlocked ? 'シート 2' : 'シート 2（おためし）';
      tx.setAttribute('font-size', state.unlocked ? 18 : 14);
    }
    sheetToys(page).forEach((t, i) => {
      const [x, y] = SHEET_POS[page][i] || [200, 670];
      porthole(ctx, sheet, t, x, y, page === 0 ? 74 : 41, i, page);
    });
  });

  // page buttons (big, for small fingers) + swipe
  const tabs = el('g', { transform: 'translate(200 728)' }, svg);
  const tabNodes = [0, 1].map(page => {
    const g = el('g', { transform: `translate(${page ? 46 : -46} 0)`, style: 'cursor:pointer' }, tabs);
    const b = el('g', { class: 'tb' }, g);
    el('circle', { r: 26, fill: '#fff', filter: 'url(#soft)' }, b);
    const dot = el('circle', { r: 20, fill: page ? '#ffc93c' : '#b9a7ff' }, b);
    const t = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 22, fill: '#fff', y: 1 }, b);
    t.textContent = page + 1;
    g.addEventListener('click', () => goPage(page));
    return { b, dot };
  });
  function paintTabs() { tabNodes.forEach((n, p) => { n.b.style.opacity = p === homePage ? 1 : .55; n.b.style.transform = p === homePage ? 'scale(1.12)' : 'scale(1)'; }); }
  function goPage(p) {
    p = clamp(p, 0, 1);
    if (p === homePage) { tabNodes[p].b.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1.12)' }], { duration: 260 }); return; }
    const from = homePage; homePage = p;
    A.whoosh(); paintTabs();
    ctx.tween(420, k => {
      pan.setAttribute('transform', `translate(${(-400 * (from + (p - from) * k)).toFixed(1)} 0)`);
      night.setAttribute('opacity', (.35 * (from + (p - from) * k)).toFixed(3));
    }, null, easeInOut);
    if (p === 1) { ghost.talk(state.unlocked ? 'シート2だよ！' : 'ちょっとだけ あそべるよ'); }
  }
  paintTabs();
  let sx = null;
  ctx.on(ctx.host, 'pointerdown', e => { sx = e.clientX; });
  ctx.on(ctx.host, 'pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 70) goPage(homePage + (dx < 0 ? 1 : -1)); });

  const ghost = ctx.ghost(svg, { x: 118, y: 104, s: .58 });
  ghost.talk = (text, voice = true) => { ctx.bubble(text, 270, 96); if (voice) say(text); };
  ghost.pos.addEventListener('pointerdown', () => { ghost.giggle(); ghost.talk(pick(['ぽわんだよ！', 'なにして あそぶ？', 'くすぐったい〜'])); ctx.after(1200, () => ghost.set('normal')); });
  if (started) ctx.after(400, () => { ghost.set('happy'); ghost.talk('なにして あそぶ？'); ctx.after(1500, () => ghost.set('normal')); });
  homeCtx.ghost1 = ghost;
}

function zoom(color, x, y, done) {
  wipe.style.background = color; wipe.style.opacity = 1; wipe.hidden = false;
  const R = Math.hypot(innerWidth, innerHeight);
  const a = wipe.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)` }], { duration: 430, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' });
  a.onfinish = () => {
    done();
    requestAnimationFrame(() => {
      const f = wipe.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, fill: 'forwards' });
      f.onfinish = () => { wipe.hidden = true; a.cancel(); f.cancel(); };
    });
  };
}

function enterToy(t, node) {
  if (!wipe.hidden) return;
  let trial = false;
  if (isLocked(t)) {
    if (!trialLeft(t)) { lockedTeaser(t, node); return; }
    trial = true; state.trial.used[t.id] = true; save();
  }
  A.pop(); haptic();
  node.animate([{ transform: 'scale(1)' }, { transform: 'scale(.9)' }, { transform: 'scale(1.06)' }], { duration: 260 });
  say(t.name);
  const r = node.getBoundingClientRect();
  setTimeout(() => zoom(t.color, r.left + r.width / 2, r.top + r.height / 2, () => {
    if (homeCtx) { homeCtx.destroy(); homeCtx = null; }
    $('home-scene').replaceChildren();
    homeEl.hidden = true; toyEl.hidden = false;
    toyEl.style.background = t.color;
    toyCtx = makeScene(stageEl); currentToy = t; sceneMusic(t);
    t.mount(toyCtx);
    lastInput = performance.now();
    if (trial) startTrialClock(t);
  }), 160);
}
function goHome() {
  if (!wipe.hidden) return;
  A.whoosh();
  zoom('#e3dbff', 36, 36, () => {
    if (toyCtx) { toyCtx.destroy(); toyCtx = null; currentToy = null; }
    stopTrialClock();
    stageEl.replaceChildren();
    stopSpeech();
    hand.toggleAttribute('hidden', true);
    toyEl.hidden = true; homeEl.hidden = false;
    buildHome(); sceneMusic(null);
  });
}

// every touch gets a visible answer: a soft ripple where the finger landed
function ripple(host, e) {
  const r = host.getBoundingClientRect(), d = document.createElement('div');
  d.className = 'ripple'; d.style.left = (e.clientX - r.left) + 'px'; d.style.top = (e.clientY - r.top) + 'px';
  host.appendChild(d); setTimeout(() => d.remove(), 600);
}
stageEl.addEventListener('pointerdown', e => { lastInput = performance.now(); hand.toggleAttribute('hidden', true); ripple(toyEl, e); }, true);
$('home-scene').addEventListener('pointerdown', e => ripple(homeEl, e), true);
setInterval(() => {
  if (!toyCtx || !state.hints || !toyCtx.hint || performance.now() - lastInput < 6500) return;
  const p = toyCtx.hint();
  if (!p) { hand.toggleAttribute('hidden', true); return; }
  const s = toyCtx.toScreen(p[0], p[1]);
  hand.style.left = (s.x - 16) + 'px'; hand.style.top = (s.y - 4) + 'px';
  hand.toggleAttribute('hidden', false);
}, 700);


/* which background music each scene plays (toys with their own music stay quiet) */
const BGM_FOR = { light: null, band: null, night: null, peek: 'cute2', farm: 'kalimba', bath: 'musicbox', teeth: 'flute', color: 'cute1',
  face: 'flute', cars: 'happy', blocks: 'strum', feed: 'strum', balloon: 'happy', shadow: 'musicbox', sea: 'kalimba',
  handwash: 'cute2', dressup: 'cute1', cooking: 'strum', doctor: 'musicbox' };
function sceneMusic(t) { const n = t ? (t.id in BGM_FOR ? BGM_FOR[t.id] : 'cute1') : 'cute1'; if (n) Music.play(n); else Music.stop(); }

/* stickers: every toy's celebration (A.tada) earns that toy's sticker */
let currentToy = null, lastSticker = 0;
state.stickers = state.stickers || {};
function stickerSvg(t, size) {
  const svg = el('svg', { viewBox: '-90 -90 180 180', width: size, height: size });
  const defs = el('defs', {}, svg);
  const gg = el('radialGradient', { id: 'gGhost', cx: '.38', cy: '.3', r: '.85' }, defs);
  [[0, '#ffffff'], [.55, '#f7f3ff'], [1, '#d6c8ff']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, gg));
  const cid = 'stkc' + Math.random().toString(36).slice(2, 8);
  el('circle', { r: 88, fill: '#fff' }, svg);
  const clip = el('clipPath', { id: cid }, defs); el('circle', { r: 79 }, clip);
  const g = el('g', { 'clip-path': `url(#${cid})` }, svg);
  el('circle', { r: 80, fill: t.color }, g);
  try { t.thumb(g); } catch (e) {}
  el('path', { d: 'M-60,-42 A72,72 0 0 1 -14,-74', stroke: 'rgba(255,255,255,.75)', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, svg);
  return svg;
}
function countStickers() { return Object.values(state.stickers).reduce((a, b) => a + b, 0); }
function updateBook() { $('book-n').textContent = countStickers(); }
const tada0 = A.tada.bind(A);
A.tada = function () { tada0(); awardSticker(); };
window.powanReward = () => awardSticker();
function awardSticker() {
  if (!currentToy || !toyCtx || performance.now() - lastSticker < 4000) return;
  lastSticker = performance.now();
  const t = currentToy;
  state.stickers[t.id] = (state.stickers[t.id] || 0) + 1; save(); updateBook();
  setTimeout(() => {
    const box = $('stk');
    box.replaceChildren(stickerSvg(t, 110));
    const b = document.createElement('b'); b.textContent = 'シール ゲット！'; box.appendChild(b);
    box.hidden = false;
    A.bell(mtof(84), { vol: .12 }); A.bell(mtof(88), { when: .1, vol: .12 });
    box.animate([
      { transform: 'scale(0) rotate(-30deg)', opacity: 0 },
      { transform: 'scale(1.15) rotate(6deg)', opacity: 1, offset: .25 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1, offset: .35 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1, offset: .8 },
      { transform: 'translateY(-60px) scale(.3)', opacity: 0 }
    ], { duration: 2200, easing: 'ease-in-out' }).onfinish = () => { box.hidden = true; };
  }, 900);
};
function openBook() {
  A.pop();
  const grid = $('book-grid'); grid.replaceChildren();
  TOYS.forEach(t => {
    const n = state.stickers[t.id] || 0;
    const d = document.createElement('div');
    d.className = 'slot' + (n ? '' : ' off');
    d.appendChild(stickerSvg(t, '100%'));
    if (n) {
      const c = document.createElement('span'); c.className = 'cnt'; c.textContent = '×' + n; d.appendChild(c);
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', t.name);
      b.addEventListener('click', () => { say(t.name); d.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12) rotate(-6deg)' }, { transform: 'scale(1)' }], { duration: 360 }); A.twinkle(); });
      d.appendChild(b);
    }
    grid.appendChild(d);
  });
  const got = TOYS.filter(t => state.stickers[t.id]).length;
  $('book-sub').textContent = got === TOYS.length ? 'ぜんぶ あつめたね！ すごい！' : `${got} / ${TOYS.length} しゅるい あつめたよ`;
  $('dlg-book').hidden = false;
  if (got === TOYS.length) { say('ぜんぶ あつめたね'); A.tada(); }
}
$('book').addEventListener('click', openBook);
updateBook();

/* hold-to-use buttons */
function holdify(btn, ms, fn) {
  let t = 0, done = false;
  btn.style.setProperty('--hold', ms + 'ms');
  const stop = () => { clearTimeout(t); btn.classList.remove('holding'); };
  btn.addEventListener('pointerdown', e => {
    e.stopPropagation(); done = false;
    void btn.offsetWidth; btn.classList.add('holding');
    t = setTimeout(() => { done = true; stop(); A.click(); fn(); }, ms);
  });
  btn.addEventListener('pointerup', () => { if (!done) toast('ながおし してね'); stop(); });
  btn.addEventListener('pointerleave', stop);
  btn.addEventListener('pointercancel', stop);
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}
$('back').addEventListener('click', goHome);
holdify($('gear'), 1800, () => { gateNext = null; openGate(); });
holdify($('gear2'), 1800, () => { gateNext = null; openGate(); });

/* grown-up gate: a sum toddlers can't do */
let gateAns = 0, gateIn = '', gateNext = null;
function openGate() {
  const a = Math.floor(rand(3, 10)), b = Math.floor(rand(3, 10));
  gateAns = a + b; gateIn = '';
  $('gate-q').textContent = `${a} + ${b} = ?`;
  showAns(); $('dlg-gate').hidden = false;
}
function showAns() { [...$('gate-ans').children].forEach((s, i) => { s.textContent = gateIn[i] || ''; }); }
[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(n => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = n;
  b.addEventListener('click', () => {
    if (gateIn.length >= 2) return;
    gateIn += n; showAns();
    if (gateIn.length === String(gateAns).length) setTimeout(() => {
      if (+gateIn === gateAns) { $('dlg-gate').hidden = true; const next = gateNext || openSettings; gateNext = null; next(); }
      else { const c = $('gate-card'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); openGate(); }
    }, 220);
  });
  $('gate-pad').appendChild(b);
});
{
  const del = document.createElement('button');
  del.type = 'button'; del.className = 'del'; del.textContent = 'けす';
  del.addEventListener('click', () => { gateIn = gateIn.slice(0, -1); showAns(); });
  $('gate-pad').appendChild(del);
}
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('pointerdown', e => { if (e.target === m) m.hidden = true; });
  m.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { m.hidden = true; }));
});

function renderSettings() {
  $('today').textContent = Math.floor(state.sec / 60);
  [...$('limit-seg').children].forEach(b => b.setAttribute('aria-pressed', +b.dataset.v === state.limit));
  $('limit-left').textContent = state.limit ? `のこり やく ${Math.max(0, Math.ceil(state.limit - sessionSec / 60))} ふん（いまの セッション）` : 'じかんの せいげんは ありません';
  $('vol').value = state.volume;
  $('voice-seg').querySelector('[data-v="browser"]').hidden = !('speechSynthesis' in window);
  const vk = state.voice ? state.voiceKind : 'off';
  [...$('voice-seg').children].forEach(b => b.setAttribute('aria-pressed', b.dataset.v === vk));
  $('sw-bgm').setAttribute('aria-checked', state.bgm);
  $('sw-hints').setAttribute('aria-checked', state.hints);
  $('sw-vibe').setAttribute('aria-checked', state.vibe);
}
function openSettings() { renderSettings(); $('dlg-settings').hidden = false; }
[...$('limit-seg').children].forEach(b => b.addEventListener('click', () => { state.limit = +b.dataset.v; save(); renderSettings(); }));
$('vol').addEventListener('input', e => { state.volume = +e.target.value; A.setVolume(state.volume); save(); });
$('vol').addEventListener('change', () => A.pop());
[['sw-bgm', 'bgm'], ['sw-hints', 'hints'], ['sw-vibe', 'vibe']].forEach(([id, k]) => $(id).addEventListener('click', () => {
  state[k] = !state[k]; save(); renderSettings();
  if (k === 'hints' && !state.hints) hand.toggleAttribute('hidden', true);
  if (k === 'bgm') Music.refresh();
}));
$('more').addEventListener('click', () => {
  sessionSec = 0; renderSettings();
  if (!$('bye').hidden) { $('bye').hidden = true; $('dlg-settings').hidden = true; homeEl.hidden = false; buildHome(); }
  toast('タイマーを リセットしました');
});

[...$('voice-seg').children].forEach(b => b.addEventListener('click', () => {
  const v = b.dataset.v;
  state.voice = v !== 'off';
  if (state.voice) state.voiceKind = v;
  save(); renderSettings();
  if (state.voice) { A.unlock(); say('こんにちは！ ぽわんだよ'); } else stopSpeech();
}));

/* trial + unlock (sheet 2) */
let trialTimer = 0;
function startTrialClock(t) {
  clearTimeout(trialTimer);
  const bar = $('trial-bar'); bar.hidden = false;
  bar.firstElementChild.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: TRIAL_SEC * 1000, easing: 'linear', fill: 'forwards' });
  trialTimer = setTimeout(() => endTrial(t), TRIAL_SEC * 1000);
}
function stopTrialClock() { clearTimeout(trialTimer); $('trial-bar').hidden = true; }
function endTrial(t) {
  stopTrialClock();
  if (toyCtx) { toyCtx.destroy(); toyCtx = null; currentToy = null; }
  stageEl.replaceChildren(); stopSpeech(); Music.play('cute1');
  $('trial-end').hidden = false;
  say('つづきは おうちのひとと あそぼうね');
}
function lockedTeaser(t, node) {
  A.osc(330, { type: 'triangle', slide: 260, slideT: .2, r: .15, vol: .15 });
  node.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0deg)' }], { duration: 380 });
  if (homeCtx && homeCtx.ghost1) homeCtx.ghost1.talk('また あした あそぼうね');
}
$('trial-home').addEventListener('click', () => { $('trial-end').hidden = true; toyEl.hidden = true; homeEl.hidden = false; buildHome(); sceneMusic(null); });
$('trial-parent').addEventListener('click', () => { gateNext = openBuy; openGate(); });
function openBuy() {
  const grid = $('buy-grid'); grid.replaceChildren();
  sheetToys(1).forEach(t => { const d = document.createElement('div'); d.className = 'slot'; d.appendChild(stickerSvg(t, '100%')); grid.appendChild(d); });
  $('buy-count').textContent = sheetToys(1).length;
  $('buy-price').textContent = (window.PowanBilling && PowanBilling.price && PowanBilling.price()) || PRICE_LABEL;
  $('buy-state').textContent = state.unlocked ? 'ひらいています。ありがとうございます！' : '';
  $('buy-go').hidden = state.unlocked;
  $('dlg-buy').hidden = false;
}
$('buy-go').addEventListener('click', () => {
  if (window.PowanBilling && PowanBilling.buy) { PowanBilling.buy(); return; }
  $('buy-state').textContent = 'こうにゅうは Google Play / App Store の アプリ版で できます（じゅんびちゅう）。';
});
$('buy-restore').addEventListener('click', () => {
  if (window.PowanBilling && PowanBilling.restore) { PowanBilling.restore(); return; }
  $('buy-state').textContent = 'アプリ版で 「こうにゅうを ふっきゅう」 できます。';
});
window.powanBillingMessage = function (msg) { $('buy-state').textContent = msg; };
// called by the native store bridge after a purchase or a restore
window.powanUnlocked = function (on) {
  state.unlocked = !!on; save();
  $('buy-state').textContent = on ? 'ひらきました！ ありがとうございます' : '';
  $('buy-go').hidden = !!on;
  if (on) { A.tada(); $('trial-end').hidden = true; }
  if (!homeEl.hidden) buildHome();
};

/* credits list (opened from settings only) */
const ANIMAL_JA = { dog: 'いぬ', cat: 'ねこ', lion: 'ライオン', elephant: 'ぞう', pig: 'ぶた', cow: 'うし', duck: 'あひる', chick: 'ひよこ', frog: 'かえる', bird: 'とり', whale: 'くじら', sheep: 'ひつじ', horse: 'うま' };
function openCredits() {
  const box = $('credits-list');
  box.replaceChildren();
  const section = (title, items) => {
    const s = document.createElement('section');
    const h = document.createElement('h3'); h.textContent = title; s.appendChild(h);
    const ul = document.createElement('ul');
    items.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    s.appendChild(ul); box.appendChild(s);
  };
  const voices = Object.values(VOICE_PACKS).map(p => p.credit);
  if (voices.length) section('ぽわんの こえ', voices);
  const sc = typeof SOUND_CREDITS === 'object' ? SOUND_CREDITS : {};
  const groups = {};
  Object.entries(sc).forEach(([k, c]) => {
    const src = /効果音ラボ/.test(c.source || '') ? '効果音ラボ（soundeffect-lab.info）' : 'Freesound（CC0）';
    (groups[src] = groups[src] || []).push((ANIMAL_JA[k] || k) + (src.startsWith('Freesound') && c.author ? '：' + c.author : ''));
  });
  const animalLines = Object.entries(groups).map(([src, list]) => src + ' … ' + list.join('、'));
  if (animalLines.length) section('どうぶつの なきごえ', animalLines);
  section('フォント', ['Zen Maru Gothic（SIL Open Font License 1.1）']);
  section('そのほか', ['そのほかの こうかおん・おんがくは アプリないで ごうせいしています', 'ぽわんとあそぼ © sk8fatmen4649']);
  $('dlg-credits').hidden = false;
}
$('open-credits').addEventListener('click', openCredits);
$('open-buy').addEventListener('click', openBuy);

/* play-time timer */
setInterval(() => {
  if (!started || document.hidden || !$('bye').hidden) return;
  if (state.day !== today()) { state.day = today(); state.sec = 0; }
  state.sec++; sessionSec++;
  if (state.sec % 15 === 0) save();
  if (state.limit && sessionSec >= state.limit * 60) showBye();
}, 1000);
function showBye() {
  Music.stop();
  if (toyCtx) { toyCtx.destroy(); toyCtx = null; stageEl.replaceChildren(); }
  if (homeCtx) { homeCtx.destroy(); homeCtx = null; $('home-scene').replaceChildren(); }
  toyEl.hidden = true; homeEl.hidden = true; hand.toggleAttribute('hidden', true);
  $('bye').hidden = false; save();
  say('きょうは おしまい。またあそぼうね');
  LULLABY.slice(0, 6).reduce((t, [m, b]) => { A.musicbox(mtof(m + 12), { at: t }); return t + b * .5; }, A.now() + .2);
}

$('start').addEventListener('click', () => {
  A.unlock(); A.tada(); started = true; sceneMusic(null);
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {}); } catch (e) {}
  const s = $('start');
  s.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => { s.hidden = true; };
  if (homeCtx && homeCtx.ghost1) { const g = homeCtx.ghost1; g.set('happy'); g.talk('こんにちは！ ぽわんだよ'); homeCtx.after(1800, () => g.set('normal')); }
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); });
document.addEventListener('gesturestart', e => e.preventDefault());
buildHome();
{
  const id = new URLSearchParams(location.search).get('toy');
  const t = id && TOYS.find(q => q.id === id);
  if (t) {
    $('start').hidden = true; started = true;
    if (homeCtx) { homeCtx.destroy(); homeCtx = null; $('home-scene').replaceChildren(); }
    homeEl.hidden = true; toyEl.hidden = false; toyEl.style.background = t.color;
    toyCtx = makeScene(stageEl); currentToy = t; t.mount(toyCtx); sceneMusic(t);
  }
}

// installable + offline when served over http(s); silently skipped elsewhere
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
}

// Android back button (called by the app shell): close a dialog, or leave a toy; false lets the system handle it
window.powanBack = function () {
  const open = [...document.querySelectorAll('.modal')].find(m => !m.hidden);
  if (open) { open.hidden = true; return true; }
  if (!toyEl.hidden) { goHome(); return true; }
  return false;
};
window.powanPause = function (paused) {
  if (!A.ctx) return;
  if (paused) { stopSpeech(); A.ctx.suspend(); } else A.ctx.resume();
};
