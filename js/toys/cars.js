'use strict';
/* =========================================================
   toy: ぶーぶー — big friendly vehicles, a traffic light, chicks
   that cross on red, a car wash, and three places to drive
   (town, seaside bridge road, snowy mountain at night)
   ========================================================= */
(() => {
const INK = '#3a2f5b', WIN = '#d4f0ff';
const S = 1.3; // vehicle scale

/* a real recording cut short with a fade (the siren file is 8 s long) */
const cutCache = new Map();
function cut(name, dur, o = {}) {
  const b64 = typeof SOUND_PACK === 'object' && SOUND_PACK['sfx:' + name];
  if (!b64 || !A.ctx) return false;
  if (!cutCache.has(name)) {
    const bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    cutCache.set(name, A.ctx.decodeAudioData(bytes.buffer).catch(() => null));
  }
  const c = A.ctx, t0 = c.currentTime + (o.when || 0);
  cutCache.get(name).then(buf => {
    if (!buf) return;
    const src = c.createBufferSource(), g = c.createGain(), v = o.vol ?? .7, t = Math.max(t0, c.currentTime);
    src.buffer = buf; src.playbackRate.value = o.rate || 1;
    g.gain.setValueAtTime(v, t); g.gain.setValueAtTime(v, t + Math.max(.05, dur - .25)); g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(g); A.route(g, o.wet ?? .12);
    src.start(t, o.offset || 0); src.stop(t + dur + .05);
  });
  return true;
}
let sirenFree = 0;
function siren(rate, dur = 1.6) {
  const now = A.now();
  if (now < sirenFree || !cut('siren', dur, { rate, vol: .55 })) {
    for (let i = 0; i < 2; i++) { A.osc(960 * rate, { type: 'triangle', hold: .3, r: .05, vol: .12, when: i * .78 }); A.osc(770 * rate, { type: 'triangle', hold: .3, r: .08, vol: .12, when: i * .78 + .38 }); }
    return;
  }
  sirenFree = now + dur * .8;
}
function horn(rate, when = 0) {
  if (!cut('horn', 1.5, { rate, vol: .6, when })) {
    A.osc(440 * rate, { type: 'square', lp: 1500, hold: .07, r: .06, vol: .1, when }); A.osc(440 * rate, { type: 'square', lp: 1500, hold: .24, r: .1, vol: .1, when: when + .2 });
  }
}

/* ---------- vehicle parts ---------- */
function face(g, x, y, s = 1) {
  const f = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
  const look = el('g', {}, f);
  const open = el('g', { class: 'tb' }, look), joy = el('g', { style: 'display:none' }, look);
  [-9, 9].forEach(dx => {
    el('ellipse', { cx: dx, cy: -2, rx: 4.6, ry: 5.8, fill: '#2b2340' }, open);
    el('circle', { cx: dx - 1.6, cy: -4.4, r: 1.9, fill: '#fff' }, open);
    el('path', { d: `M${dx - 5},0 Q${dx},-6 ${dx + 5},0`, stroke: '#2b2340', 'stroke-width': 2.8, fill: 'none', 'stroke-linecap': 'round' }, joy);
  });
  [-17, 17].forEach(dx => el('ellipse', { cx: dx, cy: 6, rx: 4.6, ry: 3.2, fill: '#ffa3b8', opacity: .85 }, f));
  el('path', { d: 'M-5,6 Q0,11.5 5,6', stroke: '#2b2340', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, f);
  return { look, open, joy };
}
function wheel(g, x, r = 14) {
  const w = el('g', { transform: `translate(${x} ${-r})` }, g);
  el('circle', { r, fill: '#3a2f5b' }, w);
  const hub = el('g', {}, w);
  el('circle', { r: r * .48, fill: '#e4def4' }, hub);
  el('circle', { cx: r * .26, cy: 0, r: r * .13, fill: '#9a90c0' }, hub);
  return hub;
}
const KINDS = [
  { id: 'car', L: 58, ly: -40, word: 'ぷっぷー', draw(g) {
    el('path', { d: 'M-38,-48 Q-32,-86 -4,-86 L8,-86 Q34,-86 46,-48Z', fill: '#ff6b6b' }, g);
    el('path', { d: 'M-28,-52 Q-24,-78 -6,-78 L-6,-52Z', fill: WIN }, g);
    el('path', { d: 'M2,-80 L8,-80 Q28,-80 37,-52 L2,-52Z', fill: WIN }, g);
    el('rect', { x: -58, y: -54, width: 116, height: 40, rx: 16, fill: '#ff6b6b' }, g);
    el('rect', { x: -46, y: -50, width: 64, height: 6, rx: 3, fill: '#fff', opacity: .4 }, g);
    el('path', { d: 'M-2,-52 L-2,-24', stroke: '#e2545e', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
    el('ellipse', { cx: 54, cy: -40, rx: 5, ry: 6, fill: '#fff3a8' }, g);
    el('rect', { x: -60, y: -44, width: 6, height: 10, rx: 3, fill: '#ffd56b' }, g);
    return { face: face(g, 19, -64, .82), wheels: [wheel(g, -34), wheel(g, 34)], lights: [] };
  }, honk() { horn(1.12); } },
  { id: 'bus', L: 84, ly: -28, word: 'ぶっぶー', draw(g) {
    el('rect', { x: -84, y: -100, width: 168, height: 86, rx: 20, fill: '#ffd23f' }, g);
    el('rect', { x: -84, y: -42, width: 168, height: 9, fill: '#ff9a5a' }, g);
    [-72, -42, -12].forEach(x => el('rect', { x, y: -88, width: 24, height: 28, rx: 7, fill: WIN }, g));
    el('rect', { x: 20, y: -88, width: 18, height: 66, rx: 6, fill: '#ffe788', stroke: '#f0b21a', 'stroke-width': 2.5 }, g);
    el('path', { d: 'M46,-90 L68,-90 Q80,-90 80,-76 L80,-54 L46,-54Z', fill: WIN }, g);
    el('rect', { x: -72, y: -96, width: 90, height: 5, rx: 2.5, fill: '#fff', opacity: .45 }, g);
    el('ellipse', { cx: 81, cy: -28, rx: 4, ry: 6, fill: '#fff3a8' }, g);
    return { face: face(g, 63, -72, .8), wheels: [wheel(g, -52, 15), wheel(g, 52, 15)], lights: [] };
  }, honk() { horn(.82); } },
  { id: 'amb', L: 68, ly: -32, word: 'ぴーぽー', draw(g) {
    el('rect', { x: -68, y: -96, width: 92, height: 82, rx: 14, fill: '#fdfcff', stroke: '#e3dafc', 'stroke-width': 2.5 }, g);
    el('path', { d: 'M18,-14 L18,-82 Q18,-88 24,-88 L44,-88 Q60,-88 66,-62 L68,-50 L68,-24 Q68,-14 58,-14Z', fill: '#fdfcff', stroke: '#e3dafc', 'stroke-width': 2.5 }, g);
    el('path', { d: 'M26,-82 L44,-82 Q55,-82 60,-56 L26,-56Z', fill: WIN }, g);
    el('rect', { x: -68, y: -42, width: 136, height: 9, fill: '#ff6b7a' }, g);
    el('path', { d: 'M-30,-80 h8 v10 h10 v8 h-10 v10 h-8 v-10 h-10 v-8 h10z', fill: '#ff6b7a' }, g);
    el('rect', { x: -60, y: -102, width: 34, height: 9, rx: 4, fill: '#e6e0f2' }, g);
    const l1 = el('ellipse', { cx: -52, cy: -104, rx: 8, ry: 6, fill: '#ff4d5e' }, g);
    const l2 = el('ellipse', { cx: -34, cy: -104, rx: 8, ry: 6, fill: '#ff4d5e' }, g);
    const l3 = el('ellipse', { cx: 36, cy: -92, rx: 8, ry: 6, fill: '#ff4d5e' }, g);
    el('ellipse', { cx: 66, cy: -32, rx: 3.5, ry: 5.5, fill: '#fff3a8' }, g);
    return { face: face(g, 42, -67, .74), wheels: [wheel(g, -40), wheel(g, 44)], lights: [l1, l2, l3] };
  }, honk() { siren(1.05); } },
  { id: 'fire', L: 82, ly: -44, word: 'うーう かんかん', draw(g) {
    el('rect', { x: -82, y: -58, width: 164, height: 44, rx: 12, fill: '#ff5757' }, g);
    el('path', { d: 'M30,-56 L30,-92 Q30,-100 38,-100 L60,-100 Q76,-100 80,-80 L82,-60 L82,-56Z', fill: '#ff5757' }, g);
    el('path', { d: 'M38,-93 L58,-93 Q69,-93 73,-70 L38,-70Z', fill: WIN }, g);
    el('rect', { x: -82, y: -28, width: 164, height: 5, fill: '#fff', opacity: .85 }, g);
    el('rect', { x: 8, y: -66, width: 8, height: 10, fill: '#c9c4dc' }, g);
    el('rect', { x: -78, y: -78, width: 104, height: 5, rx: 2.5, fill: '#e8e6f4' }, g);
    el('rect', { x: -78, y: -67, width: 104, height: 5, rx: 2.5, fill: '#e8e6f4' }, g);
    for (let x = -72; x <= 22; x += 13) el('rect', { x, y: -76, width: 3.5, height: 12, fill: '#e8e6f4' }, g);
    el('circle', { cx: -40, cy: -38, r: 11, fill: '#fff' }, g);
    el('circle', { cx: -40, cy: -38, r: 5, fill: '#ffb3b3' }, g);
    el('rect', { x: -10, y: -48, width: 30, height: 14, rx: 5, fill: '#ffd56b' }, g);
    const l1 = el('ellipse', { cx: 52, cy: -104, rx: 9, ry: 6, fill: '#ff4d5e' }, g);
    el('ellipse', { cx: 81, cy: -44, rx: 3.5, ry: 5.5, fill: '#fff3a8' }, g);
    return { face: face(g, 54, -80, .74), wheels: [wheel(g, -54), wheel(g, -22), wheel(g, 56)], lights: [l1] };
  }, honk() { siren(.9); for (let i = 0; i < 3; i++) A.bell(1568, { when: .4 + i * .16, vol: .1, r: .4 }); } },
  { id: 'ice', L: 66, ly: -34, word: 'るんるん', draw(g) {
    el('path', { d: 'M-34,-104 L-10,-104 L-22,-86Z', fill: '#f0b46a' }, g);
    el('circle', { cx: -22, cy: -112, r: 13, fill: '#ff8fb1' }, g);
    el('circle', { cx: -22, cy: -126, r: 10, fill: '#fff4c8' }, g);
    el('circle', { cx: -27, cy: -114, r: 1.8, fill: '#7fdcc0' }, g); el('circle', { cx: -17, cy: -108, r: 1.8, fill: '#ffd56b' }, g);
    el('rect', { x: -66, y: -46, width: 132, height: 32, rx: 14, fill: '#9fe6d2' }, g);
    el('rect', { x: -66, y: -88, width: 132, height: 52, rx: 16, fill: '#ffb3d1' }, g);
    el('rect', { x: -54, y: -74, width: 58, height: 28, rx: 6, fill: '#fff6e0' }, g);
    let sc = 'M-58,-78';
    for (let x = -58; x < 8; x += 13) sc += ' q6.5,10 13,0';
    el('path', { d: sc + ' L8,-84 L-58,-84Z', fill: '#ff8fb1' }, g);
    el('circle', { cx: -36, cy: -56, r: 5, fill: '#ffd56b' }, g); el('circle', { cx: -20, cy: -58, r: 5, fill: '#c9a7ff' }, g);
    el('path', { d: 'M20,-80 L46,-80 Q60,-80 62,-58 L62,-50 L20,-50Z', fill: WIN }, g);
    el('ellipse', { cx: 65, cy: -34, rx: 3.5, ry: 5.5, fill: '#fff3a8' }, g);
    return { face: face(g, 41, -64, .74), wheels: [wheel(g, -40), wheel(g, 40)], lights: [] };
  }, honk() { [72, 76, 79, 76, 81, 79, 84].forEach((m, i) => A.musicbox(mtof(m), { when: i * .14, vol: .11 })); } },
  { id: 'trash', L: 70, ly: -24, word: 'がたごと', draw(g) {
    el('path', { d: 'M-70,-14 L-70,-70 Q-70,-90 -50,-90 L16,-90 Q24,-90 24,-82 L24,-14Z', fill: '#7fd36b' }, g);
    [-46, -22, 0].forEach(x => el('rect', { x, y: -82, width: 5, height: 56, rx: 2.5, fill: '#5cb84a' }, g));
    el('path', { d: 'M28,-14 L28,-82 Q28,-88 34,-88 L48,-88 Q62,-88 68,-64 L70,-50 L70,-14Z', fill: '#fdfcff', stroke: '#e3dafc', 'stroke-width': 2.5 }, g);
    el('path', { d: 'M35,-82 L48,-82 Q58,-82 62,-58 L35,-58Z', fill: WIN }, g);
    el('rect', { x: 28, y: -38, width: 42, height: 8, fill: '#7fd36b' }, g);
    el('rect', { x: -60, y: -86, width: 60, height: 5, rx: 2.5, fill: '#fff', opacity: .4 }, g);
    el('ellipse', { cx: 69, cy: -24, rx: 3.5, ry: 5.5, fill: '#fff3a8' }, g);
    return { face: face(g, 48, -70, .7), wheels: [wheel(g, -44), wheel(g, 46)], lights: [] };
  }, honk() { horn(.7); A.noise({ from: 900, to: 400, dur: .25, vol: .1, when: .5, q: 3 }); } },
  { id: 'police', L: 60, ly: -46, word: 'うーうー', draw(g) {
    el('path', { d: 'M-38,-50 Q-32,-86 -4,-86 L8,-86 Q34,-86 46,-50Z', fill: '#fdfcff', stroke: '#e3dafc', 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-28,-54 Q-24,-78 -6,-78 L-6,-54Z', fill: WIN }, g);
    el('path', { d: 'M2,-80 L8,-80 Q28,-80 37,-54 L2,-54Z', fill: WIN }, g);
    el('rect', { x: -60, y: -56, width: 120, height: 42, rx: 16, fill: '#fdfcff', stroke: '#e3dafc', 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-60,-36 L60,-36 L60,-30 Q60,-14 44,-14 L-44,-14 Q-60,-14 -60,-30Z', fill: '#3f4466' }, g);
    el('path', { d: 'M-12,-52 l3,6 6.5,.5 -5,4 1.6,6.5 -6.1,-3.5 -6.1,3.5 1.6,-6.5 -5,-4 6.5,-.5z', fill: '#ffd56b' }, g);
    el('rect', { x: -20, y: -94, width: 40, height: 9, rx: 4, fill: '#e6e0f2' }, g);
    const l1 = el('ellipse', { cx: -10, cy: -96, rx: 10, ry: 6.5, fill: '#ff4d5e' }, g);
    const l2 = el('ellipse', { cx: 10, cy: -96, rx: 10, ry: 6.5, fill: '#5aa9ff' }, g);
    el('ellipse', { cx: 57, cy: -46, rx: 4, ry: 5.5, fill: '#fff3a8' }, g);
    return { face: face(g, 19, -66, .8), wheels: [wheel(g, -36), wheel(g, 36)], lights: [l1, l2] };
  }, honk() { siren(1.2); } }
];

/* ---------- the three places ---------- */
const cloudAt = (g, x, y, s, fill = '#fff') => {
  const c = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
  [[0, 0, 20], [22, -9, 26], [46, 0, 18]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill }, c));
  el('rect', { x: 0, y: 0, width: 46, height: 18, fill }, c);
  return c;
};
function sunAt(g, x, y, night) {
  const s = el('g', { transform: `translate(${x} ${y})` }, g);
  if (night) {
    el('circle', { r: 44, fill: '#fff6c8', opacity: .3, filter: 'url(#glow)' }, s);
    el('circle', { r: 30, fill: '#fff3b0' }, s);
    el('circle', { cx: 16, cy: -10, r: 25, fill: '#2a2e6e' }, s);
    el('ellipse', { cx: -16, cy: -10, rx: 5, ry: 8, fill: '#fff', opacity: .5, transform: 'rotate(20 -16 -10)' }, s);
    el('circle', { cx: -14, cy: 2, r: 2.8, fill: '#b38a3a' }, s);
    el('path', { d: 'M-19,11 Q-14,16 -9,12', stroke: '#b38a3a', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, s);
    return s;
  }
  const rays = el('g', {}, s);
  for (let i = 0; i < 8; i++) el('rect', { x: -3, y: -48, width: 6, height: 13, rx: 3, fill: '#ffd56b', transform: `rotate(${i * 45})` }, rays);
  rays.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 24000, iterations: Infinity });
  el('circle', { r: 28, fill: '#ffd56b' }, s);
  [-9, 9].forEach(dx => el('circle', { cx: dx, cy: -4, r: 3, fill: '#c98a2a' }, s));
  el('path', { d: 'M-7,6 Q0,12 7,6', stroke: '#c98a2a', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, s);
  return s;
}
function roadAt(g, P) {
  el('rect', { x: -800, y: 378, width: 2000, height: 28, fill: P.walk }, g);
  el('rect', { x: -800, y: 402, width: 2000, height: 6, fill: P.curb }, g);
  el('rect', { x: -800, y: 408, width: 2000, height: 242, fill: P.road }, g);
  for (let x = -400; x < 800; x += 56) el('rect', { x, y: 528, width: 30, height: 6, rx: 3, fill: '#fff', opacity: P.night ? .5 : .75 }, g);
  el('rect', { x: 142, y: 408, width: 116, height: 242, fill: P.road }, g);
  for (let y = 414; y < 646; y += 24) el('rect', { x: 146, y, width: 108, height: 13, rx: 4, fill: '#fff', opacity: P.night ? .7 : .92 }, g);
  el('rect', { x: -800, y: 648, width: 2000, height: 8, fill: P.curb }, g);
  el('rect', { x: -800, y: 654, width: 2000, height: 48, fill: P.walk }, g);
  el('rect', { x: -800, y: 700, width: 2000, height: 1000, fill: P.ground }, g);
}
const SCENES = {
  town: {
    hat: 'cap', line: 'ぶーぶー いっぱい！', iris: '#bfe6ff',
    P: { walk: '#f6eadc', curb: '#dccab8', road: '#8d89ad', ground: '#9be08a' },
    build(g, ctx, defs) {
      const sky = el('linearGradient', { id: 'cars-sky-town', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': '#8fd3ff' }, sky); el('stop', { offset: 1, 'stop-color': '#e6f6ff' }, sky);
      el('rect', { x: -800, y: -900, width: 2000, height: 1300, fill: 'url(#cars-sky-town)' }, g);
      sunAt(g, 150, 64);
      const far = el('g', {}, g);
      [[-20, 372, 140], [170, 380, 120], [360, 370, 150]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r, ry: 70, fill: '#c3ecc0' }, far));
      const clouds = [[40, 130, 1], [-60, 220, .9], [290, 170, .8], [420, 90, .7]].map(([x, y, s]) => ({ x, y, s, sp: 6 + s * 6, g: cloudAt(g, x, y, s) }));
      const HOUSES = [['#ffd9b8', '#ff8fa3', 84], ['#d6ecff', '#8fb8ff', 118], ['#fff1b8', '#7fdcc0', 76], ['#eadfff', '#c9a7ff', 100], ['#ffe0ea', '#ffb38a', 90]];
      const wins = [];
      for (let i = -2; i < 7; i++) {
        const [wall, roof, h] = HOUSES[(i + 10) % HOUSES.length];
        const x = i * 92 + 6, w = 72, b = 386;
        const hg = el('g', {}, g);
        el('rect', { x, y: b - h, width: w, height: h, rx: 6, fill: wall }, hg);
        el('rect', { x, y: b - h, width: 14, height: h, rx: 6, fill: '#fff', opacity: .25 }, hg);
        el('path', { d: `M${x - 8},${b - h + 4} L${x + w / 2},${b - h - 34} L${x + w + 8},${b - h + 4}Z`, fill: roof, 'stroke-linejoin': 'round', stroke: roof, 'stroke-width': 6 }, hg);
        const rows = Math.floor((h - 34) / 30);
        for (let r = 0; r < rows; r++) [x + 12, x + w - 30].forEach(wx => wins.push(el('rect', { x: wx, y: b - h + 12 + r * 30, width: 18, height: 18, rx: 5, fill: '#fff6c8', stroke: '#fff', 'stroke-width': 2.5 }, hg)));
        el('rect', { x: x + w / 2 - 10, y: b - 30, width: 20, height: 30, rx: 8, fill: roof }, hg);
        if (i % 2 === 0) {
          const tx = x + w + 10;
          el('rect', { x: tx - 3, y: b - 34, width: 6, height: 34, fill: '#b07a4d' }, hg);
          const t = el('g', { class: 'tb' }, hg);
          el('circle', { cx: tx, cy: b - 46, r: 17, fill: '#6fd38f' }, t);
          el('circle', { cx: tx - 5, cy: b - 51, r: 6, fill: '#fff', opacity: .3 }, t);
          t.animate([{ transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }], { duration: 1800 + i * 200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        }
      }
      roadAt(g, this.P);
      [[30, 730, '#ff8fa3'], [76, 750, '#ffd56b'], [118, 726, '#c9a7ff'], [282, 732, '#ffd56b'], [330, 752, '#ff8fa3'], [372, 728, '#8fb8ff']].forEach(([x, y, c], i) => {
        const f = el('g', { class: 'tb' }, g);
        for (let k = 0; k < 5; k++) el('circle', { cx: x + Math.cos(k * 1.257) * 7, cy: y + Math.sin(k * 1.257) * 7, r: 6, fill: c }, f);
        el('circle', { cx: x, cy: y, r: 4.5, fill: '#fff6c8' }, f);
        f.animate([{ transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }], { duration: 1400 + i * 170, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      });
      return {
        tick(dt) { clouds.forEach(c => { c.x += c.sp * dt; if (c.x > 460) c.x = -120; c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y}) scale(${c.s})`); }); },
        tap(p, fx) {
          if (p.y > 280) {
            const w = wins.reduce((b, o) => { const d = Math.hypot(+o.getAttribute('x') + 9 - p.x, +o.getAttribute('y') + 9 - p.y); return d < b.d ? { o, d } : b; }, { o: null, d: 80 }).o;
            if (w) { w.animate([{ fill: '#fff6c8' }, { fill: '#ffd23f' }, { fill: '#fff6c8' }], { duration: 900 }); A.sfx('blink', { rate: rand(.9, 1.3), vol: .6 }); return; }
          }
          bird(ctx, fx, p.x, p.y, '#5a5785');
          A.chirp();
        },
        ground(p) { ctx.sparkle(p.x, p.y, 3, 20, pick(PARTY)); A.sfx('pop2', { rate: rand(1.1, 1.4), vol: .5 }) || A.pop(); }
      };
    }
  },
  sea: {
    hat: 'straw', line: 'うみだよ〜', iris: '#bdf0ff',
    P: { walk: '#f3ead8', curb: '#d8c8b0', road: '#8a8fb5', ground: '#ffe6a8' },
    build(g, ctx, defs) {
      const sky = el('linearGradient', { id: 'cars-sky-sea', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': '#6fc8ff' }, sky); el('stop', { offset: 1, 'stop-color': '#e4f8ff' }, sky);
      el('rect', { x: -800, y: -900, width: 2000, height: 1300, fill: 'url(#cars-sky-sea)' }, g);
      sunAt(g, 150, 64);
      const clouds = [[30, 150, .8], [300, 110, .7]].map(([x, y, s]) => ({ x, y, s, sp: 5 + s * 5, g: cloudAt(g, x, y, s) }));
      // the sea, far island and a long red bridge on the horizon
      el('rect', { x: -800, y: 250, width: 2000, height: 140, fill: '#5ab8f0' }, g);
      el('rect', { x: -800, y: 250, width: 2000, height: 18, fill: '#8fd3ff' }, g);
      el('ellipse', { cx: 330, cy: 254, rx: 70, ry: 22, fill: '#8fd49a' }, g);
      const br = el('g', {}, g);
      el('rect', { x: -800, y: 226, width: 2000, height: 9, fill: '#ff7a7a' }, br);
      [-60, 100, 260, 420].forEach(x => {
        el('rect', { x: x - 5, y: 170, width: 10, height: 86, rx: 3, fill: '#ff7a7a' }, br);
        el('path', { d: `M${x - 80},226 Q${x},150 ${x + 80},226`, fill: 'none', stroke: '#ff7a7a', 'stroke-width': 4 }, br);
        for (let k = -60; k <= 60; k += 20) el('path', { d: `M${x + k},${226 - (1 - (k / 80) ** 2) * 38} L${x + k},226`, stroke: '#ff9a9a', 'stroke-width': 2 }, br);
      });
      // lighthouse
      el('path', { d: 'M28,320 L36,232 L56,232 L64,320Z', fill: '#fff' }, g);
      [252, 284].forEach(y => el('rect', { x: 30, y, width: 32, height: 12, fill: '#ff7a7a' }, g));
      el('rect', { x: 32, y: 214, width: 28, height: 20, rx: 6, fill: '#ffd56b' }, g);
      el('path', { d: 'M28,216 L46,198 L64,216Z', fill: '#ff7a7a' }, g);
      const lamp = el('circle', { cx: 46, cy: 224, r: 18, fill: '#fff6b0', opacity: .4, filter: 'url(#glow)' }, g);
      lamp.animate([{ opacity: .1 }, { opacity: .7 }], { duration: 1200, iterations: Infinity, direction: 'alternate' });
      const waves = [0, 1, 2].map(i => {
        let d = `M-120,${290 + i * 32}`;
        for (let x = -120; x < 520; x += 40) d += ' q10,-8 20,0 q10,8 20,0';
        return { g: el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: .55 - i * .1, 'stroke-linecap': 'round' }, g), sp: 14 + i * 8, x: 0 };
      });
      const boat = el('g', { transform: 'translate(250 312)' }, g);
      const bf = el('g', { class: 'float' }, boat);
      el('path', { d: 'M-34,0 L34,0 Q28,16 0,16 Q-28,16 -34,0Z', fill: '#ffb38a' }, bf);
      el('path', { d: 'M0,-4 L0,-54 L30,-8Z', fill: '#fff' }, bf);
      el('path', { d: 'M-4,-8 L-4,-44 L-26,-8Z', fill: '#ffd56b' }, bf);
      // the bridge railing along our road
      el('rect', { x: -800, y: 352, width: 2000, height: 7, rx: 3, fill: '#fff' }, g);
      for (let x = -400; x < 800; x += 34) el('rect', { x, y: 352, width: 7, height: 28, rx: 3, fill: '#fff' }, g);
      roadAt(g, this.P);
      el('path', { d: 'M-800,742 Q-600,734 -400,742 T0,742 T400,742 T800,742 T1200,742 V1700 H-800Z', fill: '#7fd0ff' }, g);
      [[40, 718], [330, 724], [120, 726]].forEach(([x, y], i) => el('path', { d: `M${x - 10},${y + 6} Q${x},${y - 14} ${x + 10},${y + 6}Z`, fill: ['#ffb3c1', '#fff', '#ffd2a8'][i] }, g));
      let gull = 0;
      return {
        tick(dt, t) {
          clouds.forEach(c => { c.x += c.sp * dt; if (c.x > 460) c.x = -120; c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y}) scale(${c.s})`); });
          waves.forEach((w, i) => { w.x = (w.x + w.sp * dt * (i % 2 ? -1 : 1)) % 40; w.g.setAttribute('transform', `translate(${w.x.toFixed(1)} 0)`); });
          if (t > gull) { gull = t + rand(5, 9); bird(ctx, ctx._fx, -30, rand(110, 200), '#fff', 1); }
        },
        tap(p, fx) {
          if (p.y > 250 && p.y < 350) { fishJump(ctx, fx, p.x); return; }
          bird(ctx, fx, p.x, p.y, '#fff');
          A.animal('bird', { vol: .5, rate: rand(.9, 1.2) }) || A.chirp();
        },
        ground(p) { ctx.sparkle(p.x, p.y, 3, 20, '#fff'); cut('splash2', .8, { rate: rand(1.1, 1.4), vol: .4 }) || A.pop(); }
      };
    }
  },
  snow: {
    hat: 'beanie', line: 'きれいだね！', iris: '#3b3f86', night: true,
    P: { walk: '#eef3ff', curb: '#c9cfe8', road: '#5d5a82', ground: '#f4f8ff', night: true },
    build(g, ctx, defs) {
      const sky = el('linearGradient', { id: 'cars-sky-snow', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': '#232765' }, sky); el('stop', { offset: 1, 'stop-color': '#5d63ad' }, sky);
      el('rect', { x: -800, y: -900, width: 2000, height: 1300, fill: 'url(#cars-sky-snow)' }, g);
      for (let i = 0; i < 14; i++) {
        const x = (i * 97 + 30) % 420 - 10, y = 20 + (i * 53) % 210;
        const s = el('path', { d: `M${x},${y - 6} Q${x + 1},${y - 1} ${x + 6},${y} Q${x + 1},${y + 1} ${x},${y + 6} Q${x - 1},${y + 1} ${x - 6},${y} Q${x - 1},${y - 1} ${x},${y - 6}Z`, fill: '#fff8d0', class: 'twinkle' }, g);
        s.style.animationDelay = `-${(i * .37).toFixed(2)}s`;
      }
      sunAt(g, 150, 70, true);
      const mtn = (x, w, h, base, c, cap) => {
        el('path', { d: `M${x - w},${base} Q${x - w * .3},${base - h * .7} ${x - 14},${base - h + 8} Q${x},${base - h - 4} ${x + 14},${base - h + 8} Q${x + w * .3},${base - h * .7} ${x + w},${base}Z`, fill: c }, g);
        el('path', { d: `M${x - w * .36},${base - h * .62} Q${x - 18},${base - h + 2} ${x},${base - h - 2} Q${x + 18},${base - h + 2} ${x + w * .36},${base - h * .62} Q${x + w * .18},${base - h * .54} ${x},${base - h * .6} Q${x - w * .18},${base - h * .54} ${x - w * .36},${base - h * .62}Z`, fill: cap }, g);
      };
      mtn(40, 170, 220, 380, '#40468a', '#e8ecff'); mtn(330, 190, 250, 380, '#3a4082', '#e8ecff');
      mtn(190, 150, 170, 384, '#5258a0', '#f2f4ff');
      // pines with snow, and a cabin with a warm window
      const pine = (x, b, s) => {
        const o = el('g', { transform: `translate(${x} ${b}) scale(${s})` }, g);
        const t = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, o);
        el('rect', { x: -4, y: -14, width: 8, height: 14, fill: '#6b4b5a' }, t);
        [[0, 46], [-24, 36], [-46, 26]].forEach(([y, w]) => {
          el('path', { d: `M${-w},${y - 10} L0,${y - 62} L${w},${y - 10}Z`, fill: '#2f6f73', 'stroke-linejoin': 'round', stroke: '#2f6f73', 'stroke-width': 6 }, t);
          el('path', { d: `M${-w * .5},${y - 36} L0,${y - 62} L${w * .5},${y - 36} Q0,${y - 30} ${-w * .5},${y - 36}Z`, fill: '#fff' }, t);
        });
        return t;
      };
      const pines = [[-10, 382, .9], [96, 384, .7], [262, 384, .75], [410, 382, .9]].map(a => pine(...a));
      const cab = el('g', {}, g);
      el('rect', { x: 170, y: 330, width: 64, height: 52, rx: 6, fill: '#a86f5a' }, cab);
      el('path', { d: 'M160,334 L202,300 L244,334Z', fill: '#fff', 'stroke-linejoin': 'round', stroke: '#fff', 'stroke-width': 8 }, cab);
      const win = el('rect', { x: 188, y: 344, width: 26, height: 20, rx: 4, fill: '#ffd56b' }, cab);
      el('circle', { cx: 201, cy: 354, r: 26, fill: '#ffd56b', opacity: .25, filter: 'url(#glow)' }, cab);
      roadAt(g, this.P);
      el('ellipse', { cx: 60, cy: 712, rx: 80, ry: 16, fill: '#fff' }, g);
      el('ellipse', { cx: 330, cy: 716, rx: 90, ry: 18, fill: '#fff' }, g);
      const flakes = [];
      for (let i = 0; i < 22; i++) flakes.push({ x: rand(-10, 410), y: rand(-60, 760), v: rand(28, 60), r: rand(2.2, 4.5), ph: rand(0, 6), n: el('circle', { r: 3, fill: '#fff', opacity: .9 }, g) });
      return {
        tick(dt, t) {
          flakes.forEach(f => {
            f.y += f.v * dt; if (f.y > 780) { f.y = -60; f.x = rand(-10, 410); }
            f.n.setAttribute('cx', (f.x + Math.sin(t * 1.3 + f.ph) * 12).toFixed(1)); f.n.setAttribute('cy', f.y.toFixed(1)); f.n.setAttribute('r', f.r.toFixed(1));
          });
        },
        tap(p, fx) {
          if (p.y > 300) {
            const t = pick(pines);
            t.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(0deg)' }], { duration: 500 });
            win.animate([{ fill: '#ffd56b' }, { fill: '#fff6c8' }, { fill: '#ffd56b' }], { duration: 700 });
            snowPuff(ctx, fx, p.x, p.y);
            A.sfx('sleigh', { vol: .5, rate: rand(.95, 1.1) }) || A.twinkle();
            return;
          }
          shootingStar(ctx, fx, p.x, p.y);
          A.sfx('sparkle', { vol: .55, rate: rand(.9, 1.2) }) || A.twinkle();
        },
        ground(p, fx) { snowPuff(ctx, fx, p.x, p.y); A.sfx('blink', { rate: rand(.8, 1), vol: .5 }) || A.pop(); }
      };
    }
  }
};
const ORDER = ['town', 'sea', 'snow'];

/* ---------- little scene reactions ---------- */
function bird(ctx, fx, x, y, color, slow) {
  const b = el('path', { d: 'M-12,0 Q-6,-8 0,0 Q6,-8 12,0', fill: 'none', stroke: color, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, fx);
  const dir = slow ? 1 : (x < 200 ? 1 : -1), dur = slow ? 7000 : 2200;
  ctx.tween(dur, k => {
    const X = slow ? -30 + k * 480 : x + dir * k * 300, Y = y - k * (slow ? 20 : 120) + Math.sin(k * 20) * 4;
    b.setAttribute('transform', `translate(${X.toFixed(1)} ${Y.toFixed(1)}) scale(1 ${(.6 + Math.abs(Math.sin(k * (slow ? 50 : 30))) * .6).toFixed(2)})`);
  }, () => b.remove(), k => k);
}
function fishJump(ctx, fx, x) {
  const f = el('g', {}, fx);
  el('ellipse', { rx: 16, ry: 10, fill: '#ffa04d' }, f);
  el('path', { d: 'M12,0 L24,-9 L24,9Z', fill: '#ffa04d' }, f);
  el('circle', { cx: -8, cy: -2, r: 2.5, fill: INK }, f);
  ctx.tween(900, k => { const X = x + k * 60, Y = 330 - Math.sin(k * Math.PI) * 80; f.setAttribute('transform', `translate(${X.toFixed(1)} ${Y.toFixed(1)}) rotate(${(-40 + k * 120).toFixed(0)})`); }, () => f.remove(), k => k);
  cut('splash2', .8, { rate: rand(1.1, 1.4), vol: .5 }) || A.pop();
  ctx.after(800, () => { ctx.sparkle(x + 60, 330, 3, 16, '#fff'); A.sfx('bubble', { vol: .5 }); });
}
function snowPuff(ctx, fx, x, y) {
  for (let i = 0; i < 6; i++) {
    const a = rand(-Math.PI, 0), v = rand(30, 70), c = el('circle', { cx: x, cy: y, r: rand(4, 8), fill: '#fff' }, fx);
    ctx.tween(600, k => { c.setAttribute('cx', (x + Math.cos(a) * v * k).toFixed(1)); c.setAttribute('cy', (y + Math.sin(a) * v * k + k * k * 30).toFixed(1)); c.setAttribute('opacity', (1 - k).toFixed(2)); }, () => c.remove(), easeOut);
  }
}
function shootingStar(ctx, fx, x, y) {
  const s = el('path', { d: 'M0,0 L-60,-20', stroke: '#fff8d0', 'stroke-width': 4, 'stroke-linecap': 'round' }, fx);
  ctx.tween(600, k => { s.setAttribute('transform', `translate(${(x + k * 120).toFixed(1)} ${(y + k * 40).toFixed(1)})`); s.setAttribute('opacity', (1 - k).toFixed(2)); }, () => s.remove(), easeOut);
  ctx.sparkle(x, y, 3, 20, '#fff8d0');
}
function hat(g, kind) {
  g.replaceChildren();
  if (kind === 'cap') {
    el('path', { d: 'M-38,-34 Q-36,-72 0,-74 Q36,-72 38,-34Z', fill: '#ff6b6b' }, g);
    el('path', { d: 'M10,-38 Q44,-40 58,-30 Q40,-26 10,-32Z', fill: '#e2545e' }, g);
    el('circle', { cx: 0, cy: -74, r: 6, fill: '#fff' }, g);
  } else if (kind === 'straw') {
    el('ellipse', { cx: 0, cy: -40, rx: 62, ry: 14, fill: '#f6d27a' }, g);
    el('path', { d: 'M-32,-42 Q-30,-80 0,-80 Q30,-80 32,-42Z', fill: '#f9dd90' }, g);
    el('rect', { x: -32, y: -52, width: 64, height: 9, fill: '#ff8fa3' }, g);
  } else {
    el('path', { d: 'M-42,-30 Q-42,-82 0,-82 Q42,-82 42,-30Z', fill: '#8fb8ff' }, g);
    el('rect', { x: -44, y: -40, width: 88, height: 16, rx: 8, fill: '#fff' }, g);
    el('circle', { cx: 0, cy: -86, r: 12, fill: '#fff' }, g);
    el('path', { d: 'M-40,48 Q0,62 40,48 L40,58 Q0,72 -40,58Z', fill: '#ff8fa3' }, g);
  }
}

const carsToy = {
  id: 'cars', name: 'ぶーぶー', color: '#8fd3ff',
  thumb(g) {
    el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#bfe6ff' }, g);
    el('rect', { x: -80, y: 10, width: 160, height: 80, fill: '#8a87ab' }, g);
    el('rect', { x: -80, y: 46, width: 160, height: 4, fill: '#fff', opacity: .7 }, g);
    el('rect', { x: 34, y: -66, width: 34, height: 80, rx: 16, fill: '#5a5785' }, g);
    el('circle', { cx: 51, cy: -48, r: 10, fill: '#ff5a6a' }, g);
    el('circle', { cx: 51, cy: -25, r: 10, fill: '#ffd23f', opacity: .35 }, g);
    el('circle', { cx: 51, cy: -2, r: 10, fill: '#3fd1a0', opacity: .35 }, g);
    const c = el('g', { transform: 'translate(-14 44) scale(.82)' }, g);
    KINDS[0].draw(c);
  },
  mount(ctx) {
    const { svg, defs } = ctx;
    const beam = el('linearGradient', { id: 'cars-beam', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    el('stop', { offset: 0, 'stop-color': '#fff6b0', 'stop-opacity': .65 }, beam);
    el('stop', { offset: 1, 'stop-color': '#fff6b0', 'stop-opacity': 0 }, beam);

    const bgLayer = el('g', {}, svg);
    const washLayer = el('g', {}, svg);
    /* ---------- traffic light ---------- */
    const TL = { x: 350, top: 112 };
    const light = el('g', {}, svg);
    el('rect', { x: TL.x - 7, y: 320, width: 14, height: 76, rx: 6, fill: '#7a76a3' }, light);
    el('ellipse', { cx: TL.x, cy: 396, rx: 22, ry: 6, fill: '#6a6690' }, light);
    const lwig = el('g', { class: 'tb' }, light);
    el('rect', { x: TL.x - 42, y: TL.top, width: 84, height: 218, rx: 38, fill: '#5a5785', filter: 'url(#soft)' }, lwig);
    el('rect', { x: TL.x - 32, y: TL.top + 10, width: 10, height: 120, rx: 5, fill: '#fff', opacity: .14 }, lwig);
    const LAMPS = [
      { c: 'red', on: '#ff5a6a', off: '#a8546e', y: TL.top + 46, word: 'あか！' },
      { c: 'yellow', on: '#ffd23f', off: '#a8925a', y: TL.top + 109, word: 'きいろ！' },
      { c: 'green', on: '#3fd1a0', off: '#4f8c86', y: TL.top + 172, word: 'あお！' }
    ];
    LAMPS.forEach(l => {
      l.glow = el('circle', { cx: TL.x, cy: l.y, r: 40, fill: l.on, opacity: 0, filter: 'url(#glow)' }, lwig);
      l.disk = el('circle', { cx: TL.x, cy: l.y, r: 26, fill: l.off, class: 'tb' }, lwig);
      el('path', { d: `M${TL.x - 30},${l.y - 20} Q${TL.x},${l.y - 44} ${TL.x + 30},${l.y - 20}`, stroke: '#4a4772', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, lwig);
      l.face = el('g', { style: 'display:none' }, lwig);
      l.eyes = el('g', { class: 'tb' }, l.face);
      [-8, 8].forEach(dx => { el('circle', { cx: TL.x + dx, cy: l.y - 3, r: 3.4, fill: INK }, l.eyes); el('circle', { cx: TL.x + dx - 1.2, cy: l.y - 4.5, r: 1.2, fill: '#fff' }, l.eyes); });
      el('path', { d: `M${TL.x - 5},${l.y + 5} Q${TL.x},${l.y + 10} ${TL.x + 5},${l.y + 5}`, stroke: INK, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, l.face);
      el('circle', { cx: TL.x - 9, cy: l.y - 12, r: 5, fill: '#fff', opacity: .35 }, lwig);
    });
    el('rect', { x: TL.x - 50, y: TL.top - 10, width: 100, height: 330, fill: 'transparent' }, light);

    /* ---------- layers ---------- */
    const laneUpG = el('g', {}, svg);
    const laneDnG = el('g', {}, svg);
    const chickG = el('g', {}, svg);
    const fx = el('g', { 'pointer-events': 'none' }, svg);
    ctx._fx = fx;
    const HOME = [228, 206, .58];
    const ghost = ctx.ghost(svg, { x: HOME[0], y: HOME[1], s: HOME[2] });
    const gEyes = ghost.body.querySelector(':scope > g.tb');
    const iris = el('g', { 'pointer-events': 'none' }, svg);

    const lanes = [
      { dir: -1, base: 522, g: laneUpG, list: [], stopProg: -262, next: 0 },
      { dir: 1, base: 644, g: laneDnG, list: [], stopProg: 138, next: 0 }
    ];
    let lightC = 'green', phase = 'idle', boostUntil = 0, yellowTok = 0, now = 0, lastKind = null, round = 0, washUses = 0;
    let sceneIdx = 0, scene = null, sceneApi = null, spawnPause = false;
    const CW = [146, 254];

    /* ---------- the place ---------- */
    function buildScene() {
      bgLayer.replaceChildren(); washLayer.replaceChildren();
      defs.querySelectorAll('[id^="cars-sky-"]').forEach(n => n.remove());
      scene = SCENES[ORDER[sceneIdx % ORDER.length]];
      sceneApi = scene.build(bgLayer, ctx, defs);
      buildWash();
      chicks.forEach(c => hat(c.hat, scene.hat));
    }
    ctx.loop((dt, t) => { if (sceneApi && sceneApi.tick) sceneApi.tick(dt, t); });

    /* ---------- car wash over the upper lane ---------- */
    const WX = 78;
    const wash = { state: 'idle', v: null, until: 0, g: null, lamp: null, body: null };
    function buildWash() {
      const night = !!scene.night;
      const g = wash.g = el('g', {}, washLayer);
      const body = wash.body = el('g', { class: 'tb' }, g);
      [8, 132].forEach(x => { el('rect', { x, y: 318, width: 18, height: 212, rx: 8, fill: night ? '#8a86c0' : '#c9e6ff' }, body); el('rect', { x: x + 3, y: 322, width: 5, height: 200, rx: 2.5, fill: '#fff', opacity: .35 }, body); });
      el('rect', { x: -6, y: 292, width: 168, height: 46, rx: 22, fill: night ? '#6f6bb0' : '#7fb8ff', filter: 'url(#soft)' }, body);
      el('rect', { x: 6, y: 298, width: 120, height: 8, rx: 4, fill: '#fff', opacity: .3 }, body);
      [34, 62, 94, 122].forEach(x => el('circle', { cx: x, cy: 338, r: 7, fill: '#5a8fe0' }, body));
      // the sign: a bubbly drop
      const sign = el('g', { transform: 'translate(78 315)' }, body);
      el('circle', { r: 17, fill: '#fff' }, sign);
      el('path', { d: 'M0,-11 Q9,1 9,5 A9,9 0 0 1 -9,5 Q-9,1 0,-11Z', fill: '#5aa9ff' }, sign);
      el('circle', { cx: -3, cy: 3, r: 2.5, fill: '#fff' }, sign);
      wash.lamp = el('circle', { cx: 78, cy: 315, r: 26, fill: '#bfe8ff', opacity: 0, filter: 'url(#glow)' }, body);
      [[30, 286], [120, 282], [76, 270]].forEach(([x, y], i) => {
        const b = el('circle', { cx: x, cy: y, r: 7 - i, fill: '#fff', stroke: '#bfe8ff', 'stroke-width': 2, class: 'float' }, body);
        b.style.animationDelay = `-${i}s`;
      });
      el('rect', { x: -10, y: 262, width: 176, height: 96, fill: 'transparent' }, g);
      g.addEventListener('pointerdown', tapWash);
    }
    function spray(n = 10) {
      for (let i = 0; i < n; i++) {
        const x = pick([34, 62, 94, 122]), d = el('rect', { x: -2.5, y: -7, width: 5, height: 14, rx: 2.5, fill: '#8fd3ff' }, fx);
        const vx = rand(-30, 30), dl = rand(0, 300);
        ctx.after(dl, () => ctx.tween(500, k => { d.setAttribute('transform', `translate(${(x + vx * k).toFixed(1)} ${(342 + k * 170).toFixed(1)})`); d.setAttribute('opacity', (1 - k * .7).toFixed(2)); }, () => d.remove(), easeIn));
      }
    }
    function tapWash(e) {
      e.stopPropagation(); haptic();
      wash.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06,.92)' }, { transform: 'scale(.97,1.04)' }, { transform: 'scale(1)' }], { duration: 380 });
      spray(8);
      cut('pour', .8, { vol: .5, rate: rand(1, 1.2) }) || A.pop();
      if (wash.state !== 'idle') return;
      const v = lanes[0].list.find(o => !o.parade && Math.abs(o.x - WX) < 70);
      if (v) { startWash(v); return; }
      // call the next car in
      wash.state = 'calling'; wash.until = now + 9;
      wash.lamp.animate([{ opacity: 0 }, { opacity: .8 }], { duration: 400, iterations: 18, direction: 'alternate' });
      ghost.set('happy'); ghost.talk('シャワー しよう');
      if (lanes[0].list.length === 0 && canSpawn(lanes[0])) spawn(lanes[0]);
    }
    function startWash(v) {
      wash.state = 'washing'; wash.v = v; v.hold = true; washUses++;
      wash.lamp.getAnimations().forEach(a => a.cancel());
      wash.lamp.setAttribute('opacity', .8);
      ghost.set('happy'); ghost.talk('あわあわ');
      cut('pour', 1.8, { vol: .55 });
      [0, 500, 1000].forEach((w, i) => ctx.after(w, () => A.sfx('bubbles', { rate: .9 + i * .12, vol: .7 }) || A.pop()));
      const bubbles = [];
      for (let i = 0; i < 16; i++) ctx.after(i * 70, () => {
        const bx = v.x + rand(-v.L * .9, v.L * .9), by = v.lane.base - rand(10, 110) * S * .8;
        const bg = el('g', { transform: `translate(${bx.toFixed(1)} ${by.toFixed(1)})` }, fx);
        const b = el('g', { class: 'tb' }, bg);
        el('circle', { r: rand(14, 24), fill: '#fff', opacity: .85, stroke: '#bfe8ff', 'stroke-width': 3 }, b);
        el('circle', { cx: -5, cy: -6, r: 4, fill: '#fff' }, b);
        b.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
        b.animate([{ transform: 'translate(0px,0px)' }, { transform: `translate(${rand(-4, 4).toFixed(0)}px,-5px)` }], { duration: 500, iterations: Infinity, direction: 'alternate', composite: 'add' });
        bubbles.push(b);
      });
      let sn = 0;
      ctx.tween(1600, () => { if (++sn % 4 === 0) spray(1); }, null, k => k);
      v.inner.animate([{ transform: 'translateX(0px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0px)' }], { duration: 300, iterations: 6 });
      ctx.after(2000, () => bubbles.forEach((b, i) => ctx.after(i * 50, () => {
        if (i % 3 === 0) A.sfx(i % 2 ? 'pop' : 'pop2', { rate: 1 + i * .04, vol: .5 });
        b.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 200, fill: 'forwards' }).onfinish = () => b.parentNode.remove();
      })));
      ctx.after(2900, () => {
        if (!v.outer.isConnected) { endWash(); return; }
        ctx.sparkle(v.x, v.lane.base - 60, 8, v.L, '#fff');
        A.sfx('sparkle', { vol: .6 }) || A.twinkle();
        say('ぴかぴか！'); ctx.bubble('ぴかぴか！', clamp(v.x, 80, 320), v.lane.base - 160);
        tapVehicle(v, true);
        ctx.after(500, endWash);
      });
    }
    function endWash() {
      if (wash.v) { wash.v.hold = false; wash.v.boost = now + 2; }
      wash.state = 'idle'; wash.v = null;
      if (wash.lamp) wash.lamp.setAttribute('opacity', 0);
      ctx.after(800, () => { if (phase === 'idle') ghost.set('normal'); });
    }

    /* ---------- vehicles ---------- */
    function spawn(lane, cx, o = {}) {
      const used = lanes.flatMap(l => l.list.map(v => v.k.id));
      let pool = KINDS.filter(k => !used.includes(k.id) && k.id !== lastKind);
      if (!pool.length) pool = KINDS;
      const k = o.kind || pick(pool); lastKind = k.id;
      const sc = o.s || S, L = k.L * sc;
      const outer = el('g', {}, lane.g);
      const flip = el('g', { transform: `scale(${lane.dir * sc} ${sc})` }, outer);
      const bm = el('path', { d: `M${k.L - 8},${k.ly - 6} L${k.L + 150},${k.ly - 44} L${k.L + 150},${k.ly + 34} L${k.L - 8},${k.ly + 6}Z`, fill: 'url(#cars-beam)', style: scene.night ? '' : 'display:none' }, flip);
      const inner = el('g', { class: 'tb' }, flip);
      el('ellipse', { cx: 0, cy: -2, rx: k.L + 4, ry: 6, fill: '#3a2f5b', opacity: .16 }, inner);
      const parts = k.draw(inner);
      if (o.flag) {
        el('path', { d: `M${-k.L * .3},-90 L${-k.L * .3},-140`, stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }, inner);
        PARTY.forEach((c, i) => el('rect', { x: -k.L * .3, y: -140 + i * 5, width: 34, height: 5, fill: c }, inner));
      }
      el('rect', { x: -k.L - 6, y: -112, width: k.L * 2 + 12, height: 118, fill: 'transparent' }, inner);
      const x = cx != null ? cx : (lane.dir > 0 ? -10 - L : 410 + L);
      const v = { k, lane, outer, inner, parts, bm, x, L, v: 0, base: o.speed || rand(78, 96), spin: 0, halted: false, hold: false, parade: !!o.parade, boost: 0 };
      v.v = v.base;
      lane.list.push(v);
      outer.addEventListener('pointerdown', e => { e.stopPropagation(); tapVehicle(v); });
      place(v);
      return v;
    }
    function place(v) { v.outer.setAttribute('transform', `translate(${v.x.toFixed(1)} ${v.lane.base})`); }
    const prog = v => v.lane.dir * v.x;
    function canSpawn(lane) {
      if (spawnPause || phase === 'change' || lane.list.filter(v => !v.parade).length >= 2) return false;
      const edge = lane.dir > 0 ? -10 : -410;
      return lane.list.every(o => prog(o) - o.L > edge + 40);
    }
    function crossClear() { return lanes.every(l => l.list.every(v => v.x + v.L < CW[0] - 6 || v.x - v.L > CW[1] + 6)); }
    function joy(v, ms = 900) {
      v.parts.face.open.style.display = 'none'; v.parts.face.joy.style.display = '';
      ctx.after(ms, () => { v.parts.face.open.style.display = ''; v.parts.face.joy.style.display = 'none'; });
    }
    function jump(v, h = 34) {
      v.inner.animate([
        { transform: 'translateY(0px) scale(1.1,.88)' }, { transform: `translateY(${-h}px) scale(.94,1.08)`, offset: .4 },
        { transform: 'translateY(0px) scale(1.08,.9)', offset: .8 }, { transform: 'translateY(0px) scale(1,1)' }], { duration: 520, easing: 'ease-out' });
    }
    let lastSay = 0;
    function tapVehicle(v, auto) {
      if (!auto) haptic();
      v.k.honk();
      jump(v); joy(v);
      if (v.parts.lights.length) v.parts.lights.forEach((l, i) => l.animate([{ opacity: 1 }, { opacity: .3 }], { duration: 170, iterations: 12, direction: 'alternate', delay: i % 2 ? 170 : 0 }));
      word(v.k.word, v.x, v.lane.base - 160);
      if (!auto && now - lastSay > 1.2) { say(v.k.word); lastSay = now; }
      for (let i = 0; i < 4; i++) puff(v.x - v.lane.dir * v.L, v.lane.base - 14);
      ghost.set('happy'); ghost.hop();
      ctx.after(700, () => { if (phase === 'idle') ghost.set('normal'); });
    }
    function puff(x, y) {
      const c = el('circle', { cx: x, cy: y, r: 6, fill: scene.night ? '#c9cfe8' : '#fff', opacity: .9 }, fx);
      const vx = rand(-40, 40), vy = rand(-50, -20);
      ctx.tween(600, k => { c.setAttribute('cx', (x + vx * k).toFixed(1)); c.setAttribute('cy', (y + vy * k).toFixed(1)); c.setAttribute('r', (6 + k * 10).toFixed(1)); c.setAttribute('opacity', (.9 * (1 - k)).toFixed(2)); }, () => c.remove(), easeOut);
    }
    function word(text, x, y) {
      const g = el('g', { transform: `translate(${clamp(x, 80, 320).toFixed(0)} ${y})` }, fx);
      const t = el('text', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 'bold', fill: '#fff', stroke: INK, 'stroke-width': 6, 'paint-order': 'stroke', 'stroke-linejoin': 'round', class: 'tb' }, g);
      t.textContent = text;
      t.animate([{ transform: 'translateY(10px) scale(.4)', opacity: 0 }, { transform: 'translateY(0px) scale(1.12)', opacity: 1, offset: .25 },
        { transform: 'translateY(-10px) scale(1)', opacity: 1, offset: .75 }, { transform: 'translateY(-26px) scale(1)', opacity: 0 }], { duration: 1300 }).onfinish = () => g.remove();
    }

    ctx.loop((dt, t) => {
      now = t;
      if (wash.state === 'calling' && t > wash.until) { wash.state = 'idle'; wash.lamp.getAnimations().forEach(a => a.cancel()); }
      lanes.forEach(lane => {
        lane.list.sort((a, b) => prog(b) - prog(a));
        lane.list.forEach((v, i) => {
          const front = prog(v) + v.L;
          let limit = Infinity;
          const before = front <= lane.stopProg + 1;
          if (lightC === 'red' && before) limit = lane.stopProg - front;
          if (i > 0) { const a = lane.list[i - 1]; limit = Math.min(limit, prog(a) - a.L - front - 18); }
          if (lane.dir < 0 && !v.parade && v.x > WX - 1 && (wash.state === 'calling' || wash.v === v)) {
            limit = Math.min(limit, v.x - WX);
            if (wash.state === 'calling' && v.x - WX < 1 && v.v < 2) startWash(v);
          }
          if (v.hold) limit = 0;
          const boost = (t < boostUntil || t < v.boost) ? 1.7 : 1;
          let want = v.base * boost * (lightC === 'yellow' && before ? .6 : 1);
          want = Math.min(want, Math.sqrt(2 * 300 * Math.max(0, limit)));
          v.v += clamp(want - v.v, -600 * dt, 170 * dt);
          if (v.v < 0) v.v = 0;
          const step = Math.min(v.v * dt, Math.max(0, limit));
          if (limit <= .5) v.v = 0;
          v.x += lane.dir * step;
          v.spin += step * 4.1 / (v.L / v.k.L);
          v.parts.wheels.forEach(w => w.setAttribute('transform', `rotate(${v.spin.toFixed(0)})`));
          const halted = step < .05 && v.v < 1;
          if (halted && !v.halted) {
            v.inner.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(5deg) translateY(-3px)' }, { transform: 'rotate(-2.5deg)' }, { transform: 'rotate(0deg)' }], { duration: 480, easing: 'ease-out' });
            if (Math.random() < .5) A.osc(260, { type: 'triangle', slide: 200, slideT: .1, r: .08, vol: .08 });
          }
          if (!halted && v.halted) v.inner.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0deg)' }], { duration: 420 });
          v.halted = halted;
          place(v);
        });
        lane.list = lane.list.filter(v => {
          const gone = prog(v) - v.L > (lane.dir > 0 ? 420 : 20);
          if (gone) v.outer.remove();
          return !gone;
        });
        if (t > lane.next) {
          if (canSpawn(lane)) spawn(lane);
          lane.next = t + rand(3, 5);
        }
      });
    });

    /* ---------- the light ---------- */
    function setLight(c, talk = true) {
      lightC = c;
      LAMPS.forEach(l => {
        const on = l.c === c;
        l.disk.setAttribute('fill', on ? l.on : l.off);
        l.glow.setAttribute('opacity', on ? .7 : 0);
        l.face.style.display = on ? '' : 'none';
        if (on) {
          l.disk.animate([{ transform: 'scale(.7)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
          if (talk) ghost.talk(c === 'green' ? 'あお！ ぶーん' : c === 'red' ? 'あか！ とまれ' : l.word);
        }
      });
      lwig.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06,.95)' }, { transform: 'scale(.98,1.03)' }, { transform: 'scale(1)' }], { duration: 360 });
      A.bell(mtof(c === 'green' ? 79 : c === 'yellow' ? 76 : 72), { vol: .14 });
      A.sfx('blink', { rate: c === 'green' ? 1.2 : c === 'yellow' ? 1 : .85, vol: .5 });
    }
    function goGreen(talk = true) {
      phase = 'idle';
      setLight('green', talk);
      boostUntil = now + 2.6;
      ghost.set('happy'); ghost.swing(40, 300);
      A.noise({ type: 'lowpass', from: 180, to: 900, dur: .9, vol: .16 });
      A.osc(70, { type: 'sawtooth', lp: 400, slide: 160, slideT: .8, hold: .6, r: .3, vol: .1 });
      ctx.after(1200, () => ghost.set('normal'));
    }
    function tapLight(e) {
      e.stopPropagation(); haptic();
      if (phase === 'idle' && lightC === 'green') {
        setLight('yellow');
        const tok = ++yellowTok;
        ctx.after(2000, () => { if (tok === yellowTok && lightC === 'yellow') goRed(); });
      } else if (phase === 'idle' && lightC === 'yellow') goRed();
      else {
        lwig.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' }], { duration: 360 });
        A.bell(mtof(72), { vol: .1 });
        if (phase === 'wait' || phase === 'cross') { ghost.talk('まってね', true); chicks.forEach((c, i) => ctx.after(i * 90, () => c.a.sing(260))); }
      }
    }
    light.addEventListener('pointerdown', tapLight);
    function goRed() {
      yellowTok++;
      setLight('red');
      phase = 'wait';
      const t0 = now;
      const check = () => {
        if (phase !== 'wait') return;
        if (now - t0 > 1.3 && crossClear()) cross();
        else ctx.after(200, check);
      };
      ctx.after(400, check);
    }

    /* ---------- chicks (with little hats; the middle one carries the flag) ---------- */
    const TOPY = 350, BOTY = 702, CS = .58;
    let chickSide = 1; // 1 = waiting at the bottom
    const chicks = [[158, 0], [200, 1], [242, 2]].map(([x, i]) => {
      const a = makeAnimal('chick', chickG, x, BOTY, CS);
      a.outer.insertBefore(el('circle', { r: 56, fill: 'transparent' }), a.outer.firstChild);
      const h = el('g', {}, a.body);
      if (i === 1) {
        const f = el('g', {}, a.body);
        el('path', { d: 'M52,40 L52,-80', stroke: '#c98f5f', 'stroke-width': 6, 'stroke-linecap': 'round' }, f);
        el('path', { d: 'M54,-80 L104,-64 L54,-46Z', fill: '#ffd23f', stroke: '#f0b21a', 'stroke-width': 3, 'stroke-linejoin': 'round' }, f);
        el('ellipse', { cx: 50, cy: 28, rx: 12, ry: 16, fill: '#ffd23f' }, f);
      }
      a.float(true, i * .7);
      const c = { a, x, i, y: BOTY, hat: h };
      a.outer.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        a.sing(360);
        a.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15,.85)' }, { transform: 'scale(.92,1.1)' }, { transform: 'scale(1)' }], { duration: 380, composite: 'add' });
        A.animal('bird', { rate: 1.15 + i * .12, vol: .55 }) || A.voice('chick', mtof(PENTA[4 + i]));
        ctx.sparkle(c.x, c.y - 30, 3, 26, '#ffe066');
      });
      return c;
    });
    (function chickBlink() { ctx.after(rand(1800, 3800), () => { const c = pick(chicks); c.a.sleep(true); ctx.after(160, () => c.a.sleep(false)); chickBlink(); }); })();
    function cross() {
      phase = 'cross';
      const from = chickSide > 0 ? BOTY : TOPY, to = chickSide > 0 ? TOPY : BOTY;
      ghost.set('surprise');
      ghost.talk('ひよこさん わたるよ');
      let done = 0;
      const chirps = ctx.every(700, () => A.animal('bird', { rate: rand(1.1, 1.4), vol: .45 }) || A.chirp());
      chicks.forEach((c, i) => {
        ctx.after([260, 0, 520][i], () => {
          const w = c.a.body.animate([{ transform: 'rotate(-10deg)' }, { transform: 'rotate(10deg)' }], { duration: 240, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          ctx.tween(3400, k => {
            c.y = from + (to - from) * k;
            c.a.place(c.x, c.y - Math.abs(Math.sin(k * Math.PI * 9)) * 8, CS);
          }, () => {
            w.cancel(); c.a.sing(400);
            if (++done === chicks.length) { clearInterval(chirps); party(to); }
          }, k => k);
        });
      });
    }
    function party(y) {
      phase = 'party'; round++;
      chickSide = -chickSide;
      A.tada(); haptic(30);
      ctx.confetti(200, y - 30, 40);
      ctx.sparkle(200, y - 20, 8, 70);
      ctx.after(700, () => { ctx.confetti(90, y - 60, 22); ctx.confetti(310, y - 60, 22); });
      chicks.forEach((c, i) => ctx.after(200 + i * 160, () => {
        c.a.sing(420);
        c.a.body.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-26px)' }, { transform: 'translateY(0px)' }], { duration: 420, iterations: 2, composite: 'add' });
        A.animal('bird', { rate: 1.1 + i * .12, vol: .5 }) || A.voice('chick', mtof(PENTA[5 + i]));
      }));
      lanes.forEach(l => l.list.forEach((v, i) => ctx.after(300 + i * 150, () => { jump(v, 20); joy(v, 1400); })));
      ctx.after(500, () => { const v = lanes[1].list[0] || lanes[0].list[0]; if (v) v.k.honk(); });
      const gp = y < 500 ? [200, 250, .66] : [310, 600, .56];
      ghost.set('happy');
      ghost.moveTo(gp[0], gp[1] - 60, gp[2], 380, () => ghost.moveTo(gp[0], gp[1], gp[2], 300, () => { ghost.talk('わたれたね！'); ghost.giggle(); ghost.hop(); }, easeBack), easeOut);
      ctx.after(2500, () => ghost.moveTo(HOME[0], HOME[1], HOME[2], 800, () => ghost.set('normal')));
      ctx.after(3400, () => { if (round === 3 || (round > 3 && Math.random() < 1 / 6)) parade(); else change(); });
    }

    /* ---------- the rare rainbow parade ---------- */
    function parade() {
      phase = 'parade'; spawnPause = true;
      setLight('green', false); boostUntil = now + 3;
      const rb = el('g', { opacity: 0 }, bgLayer);
      bgLayer.insertBefore(rb, bgLayer.children[1] || null);
      PARTY.forEach((c, i) => el('path', { d: `M${-70 + i * 12},400 A${270 - i * 12},${230 - i * 12} 0 0 1 ${470 - i * 12},400`, fill: 'none', stroke: c, 'stroke-width': 13, opacity: .8 }, rb));
      rb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'forwards' });
      A.sfx('jingle', { vol: .6 }) || A.twinkle();
      ghost.set('surprise'); ghost.talk('わあ！');
      const t0 = now;
      const go = () => {
        if (lanes[1].list.length && now - t0 < 6) return ctx.after(250, go);
        lanes[1].list.forEach(v => v.outer.remove()); lanes[1].list = [];
        const kinds = KINDS.slice().sort(() => Math.random() - .5).slice(0, 5);
        const train = kinds.map((k, i) => spawn(lanes[1], -60 - i * 150, { kind: k, s: .78, parade: true, flag: true, speed: 110 }));
        let stopped = false;
        const watch = ctx.loop(() => {
          if (!stopped && train[0].x > 300) {
            stopped = true; train.forEach(v => { v.hold = true; });
            ctx.after(250, together);
            ctx.after(2300, () => { train.forEach(v => { v.hold = false; }); });
          }
          if (stopped && train.every(v => !v.outer.isConnected)) { watch(); rb.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' }).onfinish = () => rb.remove(); spawnPause = false; change(); }
        });
      };
      ctx.after(600, go);
    }
    // everybody honks at once
    function together() {
      horn(1.1); horn(.8, .05); siren(1.1, 1.8); A.sfx('applause', { vol: .5, when: .3 });
      [72, 76, 79, 84].forEach((m, i) => A.musicbox(mtof(m), { when: .1 + i * .12, vol: .1 }));
      lanes.forEach(l => l.list.forEach((v, i) => ctx.after(i * 60, () => { jump(v, 40); joy(v, 1600); if (v.parts.lights.length) v.parts.lights.forEach(li => li.animate([{ opacity: 1 }, { opacity: .3 }], { duration: 170, iterations: 10, direction: 'alternate' })); })));
      ctx.confetti(120, 520, 30); ctx.after(400, () => ctx.confetti(280, 520, 30));
      word('ぶっぶー', 200, 460);
      ghost.set('happy'); ghost.giggle(); ghost.hop();
      say('ぶーぶー いっぱい！');
      chicks.forEach((c, i) => ctx.after(i * 120, () => c.a.sing(400)));
    }

    /* ---------- a new place: an iris wipe ---------- */
    function change(first) {
      phase = 'change';
      const next = SCENES[ORDER[(sceneIdx + 1) % ORDER.length]];
      const c = el('circle', { cx: 200, cy: 380, r: 0, fill: next.iris }, iris);
      A.whoosh();
      ctx.tween(480, k => c.setAttribute('r', (k * 900).toFixed(0)), () => {
        sceneIdx++;
        if (wash.state === 'washing') endWash();
        wash.state = 'idle';
        lanes.forEach(l => { l.list.forEach(v => v.outer.remove()); l.list = []; });
        buildScene();
        setLight('green', false);
        spawn(lanes[1], 90); spawn(lanes[0], 300);
        lanes[0].next = now + 3; lanes[1].next = now + 2.4;
        ctx.tween(520, k => c.setAttribute('opacity', (1 - k).toFixed(2)), () => {
          c.remove(); phase = 'idle';
          ghost.set('happy'); ghost.talk(scene.line); ghost.hop();
          if (scene.night) A.sfx('sleigh', { vol: .5 }); else A.twinkle();
          ctx.after(1400, () => ghost.set('normal'));
        }, easeOut);
      }, easeIn);
    }

    /* ---------- taps on the scene ---------- */
    const tapScene = e => {
      const p = ctx.point(e);
      haptic(6);
      if (p.y > 406 && p.y < 652) {
        const lane = p.y < 532 ? lanes[0] : lanes[1];
        if (canSpawn(lane)) { spawn(lane); A.sfx('pop', { rate: rand(.9, 1.1), vol: .5 }) || A.pop(); lane.next = now + 3; }
        else { const v = lane.list.reduce((b, o) => (!b || Math.abs(o.x - p.x) < Math.abs(b.x - p.x)) ? o : b, null); if (v) tapVehicle(v); }
        ctx.sparkle(p.x, p.y, 3, 18, '#fff');
      } else if (p.y >= 652) sceneApi.ground(p, fx);
      else { sceneApi.tap(p, fx); if (ghost.expr !== 'surprise' && phase === 'idle') wave(); }
    };
    bgLayer.addEventListener('pointerdown', tapScene);
    function wave() {
      ghost.set('happy');
      [0, 260, 520].forEach(d => ctx.after(d, () => ghost.swing(45, 260)));
      ctx.after(900, () => { if (phase === 'idle') ghost.set('normal'); });
    }
    ghost.pos.addEventListener('pointerdown', e => { e.stopPropagation(); haptic(); ghost.giggle(); ghost.talk(pick(['くすぐったい〜', 'ぶーぶー いっぱい！']), false); ctx.after(900, () => { if (phase === 'idle') ghost.set('normal'); }); });
    ctx.every(5200, () => { if (phase === 'idle' && Math.random() < .6) wave(); });
    // eyes everywhere follow the finger; vehicles blink now and then
    ctx.on(ctx.host, 'pointerdown', e => {
      const p = ctx.point(e);
      lanes.forEach(l => l.list.forEach(v => v.parts.face.look.setAttribute('transform', `translate(${(clamp((p.x - v.x) / 80, -1, 1) * 2.6 * v.lane.dir).toFixed(1)} ${(clamp((p.y - v.lane.base + 80) / 80, -1, 1) * 2).toFixed(1)})`)));
      if (gEyes) gEyes.setAttribute('transform', `translate(${(clamp((p.x - ghost.x) / 80, -1, 1) * 7).toFixed(1)} ${(clamp((p.y - ghost.y) / 80, -1, 1) * 5).toFixed(1)})`);
    }, true);
    ctx.every(1700, () => {
      const v = pick(lanes.flatMap(l => l.list));
      if (v) v.parts.face.open.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 });
      const l = LAMPS.find(q => q.c === lightC);
      if (l && Math.random() < .4) l.eyes.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 });
    });

    /* ---------- start ---------- */
    sceneIdx = 0;
    buildScene();
    setLight('green', false);
    spawn(lanes[1], 90).v = 80;
    spawn(lanes[0], 300);
    ctx.after(0, () => { lanes[0].next = now + 3; lanes[1].next = now + 2.2; });
    ctx.after(300, () => { ghost.set('happy'); ghost.talk('ぶーぶー いっぱい！'); wave(); });
    let touched = false;
    ctx.on(ctx.host, 'pointerdown', () => { touched = true; }, true);
    ctx.after(1500, () => { const v = lanes[1].list[0]; if (v && !touched) tapVehicle(v, true); });
    ctx.hint = () => {
      if (phase !== 'idle') return null;
      if (lightC === 'yellow') return [TL.x, TL.top + 109];
      if (lightC === 'green') return (round >= 1 && washUses === 0) ? [WX, 316] : [TL.x, TL.top + 109];
      return null;
    };
  }
};
TOYS.push(carsToy);
})();
