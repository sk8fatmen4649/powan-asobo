'use strict';
/* =========================================================
   toy: ふくわらい — stick eyes, nose and mouth on a face; the face
   comes alive and talks, then a photo goes into the album
   ========================================================= */
(() => {
const INK = '#3a2f5b', HAIR = '#7a5236', LIP = '#c2405a';
const line = (g, d, w = 5, stroke = INK) => el('path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
const hi = (g, x, y, rx, ry, rot = -30, o = .4) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#fff', opacity: o, transform: `rotate(${rot} ${x} ${y})` }, g);
const PUPILS = new Set(); // googly pupils, moved by one physics loop

/* ---------- parts, drawn centered on 0,0 at full size ---------- */
const PARTS = {
  eyesDot: { type: 'eyes', draw(g) {
    [-38, 38].forEach(x => { el('ellipse', { cx: x, cy: 0, rx: 13, ry: 17, fill: INK }, g); el('circle', { cx: x - 4.5, cy: -6, r: 5, fill: '#fff' }, g); el('circle', { cx: x + 4, cy: 6, r: 2.2, fill: '#fff', opacity: .8 }, g); });
  } },
  eyesRound: { type: 'eyes', draw(g) {
    [-40, 40].forEach(x => {
      el('circle', { cx: x, cy: 0, r: 25, fill: '#fff', stroke: INK, 'stroke-width': 3 }, g);
      el('circle', { cx: x + 3, cy: 4, r: 14, fill: INK }, g);
      el('circle', { cx: x - 2, cy: -2, r: 5, fill: '#fff' }, g);
    });
  } },
  eyesHappy: { type: 'eyes', draw(g) { line(g, 'M-56,8 Q-39,-18 -22,8', 7); line(g, 'M22,8 Q39,-18 56,8', 7); } },
  eyesStar: { type: 'eyes', draw(g) {
    [-38, 38].forEach(x => {
      el('ellipse', { cx: x, cy: 0, rx: 16, ry: 20, fill: '#5b3f8c' }, g);
      el('path', { d: `M${x - 4},-14 q1.5,6 7,7 q-5.5,1 -7,7 q-1.5,-6 -7,-7 q5.5,-1 7,-7z`, fill: '#fff' }, g);
      el('circle', { cx: x + 6, cy: 8, r: 3.4, fill: '#fff', opacity: .85 }, g);
    });
  } },
  eyesGoogly: { type: 'eyes', silly: true, draw(g) {
    [-40, 40].forEach(x => {
      el('circle', { cx: x, cy: 0, r: 30, fill: '#fff', stroke: INK, 'stroke-width': 3.5 }, g);
      const pg = el('g', { transform: `translate(${x} 0)` }, g);
      const p = el('circle', { cx: 0, cy: 10, r: 14, fill: INK }, pg);
      el('circle', { cx: -9, cy: -12, r: 5, fill: '#e3f2ff' }, g);
      PUPILS.add({ node: p, frame: pg, ox: 0, oy: 10, vx: 0, vy: 0, R: 13, lx: null, ly: null, px: 0, py: 0 });
    });
  } },
  noseBall: { type: 'nose', draw(g) { el('circle', { r: 20, fill: '#ff6b7a' }, g); hi(g, -6, -7, 7, 4.5, -30, .7); } },
  noseTri: { type: 'nose', draw(g) { el('path', { d: 'M-16,8 Q-5,-18 0,-18 Q5,-18 16,8 Q0,17 -16,8Z', fill: '#f39a86' }, g); } },
  noseCat: { type: 'nose', draw(g) { el('path', { d: 'M-17,-8 Q0,-15 17,-8 Q10,9 0,11 Q-10,9 -17,-8Z', fill: '#ff8fa3' }, g); hi(g, -5, -6, 5, 3, -10, .6); } },
  noseBig: { type: 'nose', silly: true, draw(g) {
    el('circle', { r: 40, fill: '#ff7a7a' }, g);
    el('circle', { cx: 6, cy: 8, r: 30, fill: '#ff6262', opacity: .5 }, g);
    hi(g, -14, -16, 13, 8, -30, .6);
    [-12, 12].forEach(x => el('ellipse', { cx: x, cy: 20, rx: 5, ry: 4, fill: '#b8394a', opacity: .7 }, g));
  } },
  mouthGrin: { type: 'mouth', draw(g) {
    el('path', { d: 'M-42,-10 Q0,46 42,-10 Q0,-2 -42,-10Z', fill: LIP }, g);
    el('path', { d: 'M-18,17 Q0,8 18,17 Q0,31 -18,17Z', fill: '#ff8fa3' }, g);
    el('path', { d: 'M-29,-6 Q0,0 29,-6 L26,2 Q0,8 -26,2Z', fill: '#fff' }, g);
  } },
  mouthO: { type: 'mouth', draw(g) { el('ellipse', { rx: 19, ry: 23, fill: LIP }, g); el('ellipse', { cy: 9, rx: 11, ry: 9, fill: '#ff8fa3' }, g); } },
  mouthCat: { type: 'mouth', draw(g) { line(g, 'M-34,-6 Q-17,18 0,0 Q17,18 34,-6', 6); el('path', { d: 'M-8,6 Q0,26 8,6Z', fill: '#ff8fa3' }, g); } },
  mouthSmile: { type: 'mouth', draw(g) { el('path', { d: 'M-38,-8 Q0,40 38,-8Z', fill: LIP }, g); el('path', { d: 'M-16,14 Q0,4 16,14 Q0,26 -16,14Z', fill: '#ff8fa3' }, g); } },
  mouthTongue: { type: 'mouth', silly: true, draw(g) {
    const t = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, g);
    el('path', { d: 'M-16,2 Q-18,46 0,48 Q18,46 16,2Z', fill: '#ff8fa3' }, t);
    line(t, 'M0,8 L0,32', 3, '#e86f8a');
    t.animate([{ transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }], { duration: 520, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    line(g, 'M-38,-8 Q0,22 38,-8', 6);
  } },
  browsArc: { type: 'brows', draw(g) { line(g, 'M-60,5 Q-40,-13 -20,3', 9, HAIR); line(g, 'M20,3 Q40,-13 60,5', 9, HAIR); } },
  browsBold: { type: 'brows', draw(g) { [-1, 1].forEach(k => el('ellipse', { cx: k * 40, cy: 0, rx: 22, ry: 9, fill: HAIR, transform: `rotate(${k * 14} ${k * 40} 0)` }, g)); } },
  glasses: { type: 'glasses', draw(g) {
    [-41, 41].forEach(x => el('circle', { cx: x, cy: 0, r: 28, fill: '#bfe8ff', 'fill-opacity': .35, stroke: '#ff6b6b', 'stroke-width': 7 }, g));
    line(g, 'M-14,-2 Q0,-12 14,-2', 6, '#ff6b6b');
    el('path', { d: 'M-56,-15 Q-48,-20 -40,-18', stroke: '#fff', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
  } },
  mustache: { type: 'mustache', draw(g) {
    el('path', { d: 'M0,-5 Q-18,-18 -38,-8 Q-52,2 -65,-10 Q-60,18 -32,16 Q-12,14 0,4 Q12,14 32,16 Q60,18 65,-10 Q52,2 38,-8 Q18,-18 0,-5Z', fill: HAIR }, g);
  } },
  ribbon: { type: 'ribbon', draw(g) {
    el('path', { d: 'M0,0 Q-36,-36 -48,-10 Q-50,19 0,0Z', fill: '#ff8fc8' }, g);
    el('path', { d: 'M0,0 Q36,-36 48,-10 Q50,19 0,0Z', fill: '#ff8fc8' }, g);
    el('path', { d: 'M-5,5 L-17,31 L-5,26Z M5,5 L17,31 L5,26Z', fill: '#ff6fae' }, g);
    el('circle', { r: 12, fill: '#ff6fae' }, g);
    el('circle', { cx: -4, cy: -4, r: 3.5, fill: '#fff', opacity: .6 }, g);
  } },
  hat: { type: 'hat', draw(g) {
    el('path', { d: 'M-40,34 L0,-58 L40,34 Q0,46 -40,34Z', fill: '#7fb8ff' }, g);
    line(g, 'M-26,4 Q0,12 24,2 M-12,-28 Q0,-24 12,-30', 6, '#ffd56b');
    [[-18, 22], [14, 20], [0, -10]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4.5, fill: '#ff8fa3' }, g));
    el('circle', { cx: 0, cy: -60, r: 12, fill: '#ff8fc8' }, g);
    hi(g, -16, 0, 6, 16, 22, .3);
  } },
  crown: { type: 'hat', gold: true, draw(g) {
    el('path', { d: 'M-46,30 L-50,-26 L-24,0 L0,-40 L24,0 L50,-26 L46,30Z', fill: '#ffd23f', stroke: '#f0a81a', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    [-50, 0, 50].forEach((x, i) => el('circle', { cx: x, cy: [-28, -42, -28][i], r: 7, fill: '#fff6b0' }, g));
    [['#ff6b7a', -24], ['#5aa9ff', 0], ['#5fd17a', 24]].forEach(([c, x]) => el('circle', { cx: x, cy: 14, r: 7, fill: c }, g));
    hi(g, -30, 6, 6, 14, 10, .45);
  } }
};
const Z = ['brows', 'eyes', 'glasses', 'nose', 'mustache', 'mouth', 'hat', 'ribbon'];
const NORMAL = { eyes: ['eyesDot', 'eyesRound', 'eyesHappy', 'eyesStar'], nose: ['noseBall', 'noseTri', 'noseCat'], mouth: ['mouthGrin', 'mouthO', 'mouthCat', 'mouthSmile'] };
const SILLY = { eyes: 'eyesGoogly', nose: 'noseBig', mouth: 'mouthTongue' };
const EXTRAS = ['browsArc', 'browsBold', 'glasses', 'mustache', 'ribbon', 'hat'];

/* ---------- the six faces (radius about 125) ---------- */
const BASES = [
  { n: 'おかお', bg: '#ffc99e', hello: () => say('こんにちは！'),
    spots: { brows: [0, -62], eyes: [0, -18], glasses: [0, -18], nose: [0, 22], mustache: [0, 44], mouth: [0, 72], hat: [0, -150], ribbon: [78, -100] },
    draw(g) {
      [-120, 120].forEach(x => { el('circle', { cx: x, cy: 10, r: 22, fill: '#ffcba3' }, g); el('circle', { cx: x, cy: 10, r: 10, fill: '#f6b088' }, g); });
      el('circle', { r: 125, fill: '#ffdcc0' }, g);
      el('path', { d: 'M-121,-32 Q-118,-130 0,-135 Q118,-130 121,-32 Q92,-82 42,-80 Q0,-110 -42,-80 Q-92,-82 -121,-32Z', fill: HAIR }, g);
      hi(g, -50, -108, 22, 8, -20, .25);
      return [[-72, 34], [72, 34]];
    } },
  { n: 'ねこさん', bg: '#ffe0a8', hello: () => { A.meow(); ctx_say('ねこさん'); },
    spots: { brows: [0, -56], eyes: [0, -12], glasses: [0, -12], nose: [0, 26], mustache: [0, 44], mouth: [0, 66], hat: [0, -150], ribbon: [-74, -112] },
    draw(g) {
      [-1, 1].forEach(k => {
        el('path', { d: `M${k * 115},-50 L${k * 95},-165 L${k * 20},-112Z`, fill: '#ffa95c', 'stroke-linejoin': 'round', stroke: '#ffa95c', 'stroke-width': 12 }, g);
        el('path', { d: `M${k * 95},-72 L${k * 88},-135 L${k * 48},-105Z`, fill: '#ffc4c4' }, g);
      });
      el('circle', { r: 125, fill: '#ffb066' }, g);
      line(g, 'M-20,-120 L-15,-90 M0,-124 L0,-88 M20,-120 L15,-90', 8, '#f0913f');
      line(g, 'M-72,32 L-130,20 M-72,50 L-130,55 M72,32 L130,20 M72,50 L130,55', 3.5, '#a0603a');
      hi(g, -54, -70, 20, 9, -25, .3);
      return [[-76, 36], [76, 36]];
    } },
  { n: 'ぽわん', bg: '#e6dcff', hello: () => say('ぽわんの かお！'),
    spots: { brows: [0, -82], eyes: [0, -40], glasses: [0, -40], nose: [0, -6], mustache: [0, 12], mouth: [0, 34], hat: [0, -172], ribbon: [76, -128] },
    draw(g) {
      [-1, 1].forEach(k => el('ellipse', { cx: k * 124, cy: 34, rx: 30, ry: 19, fill: '#efe8ff', transform: `rotate(${k * 25} ${k * 124} 34)` }, g));
      el('path', { d: GHOST_D, fill: 'url(#gGhost)', stroke: '#d9ccff', 'stroke-width': 1.4, transform: 'translate(0 8) scale(2.1)' }, g);
      hi(g, -52, -92, 32, 16, -32, .9);
      return [[-72, 0], [72, 0]];
    } },
  { n: 'わんちゃん', bg: '#d8f0c8', hello: () => { A.animal('dog') || A.voice('dog', 520); ctx_say('わんちゃん'); },
    spots: { brows: [0, -70], eyes: [0, -30], glasses: [0, -30], nose: [0, 14], mustache: [0, 40], mouth: [0, 60], hat: [0, -160], ribbon: [-82, -96] },
    draw(g) {
      el('circle', { r: 122, fill: '#d9a066' }, g);
      el('ellipse', { cx: 44, cy: -32, rx: 40, ry: 36, fill: '#c48a50' }, g);
      el('ellipse', { cx: 0, cy: 44, rx: 70, ry: 52, fill: '#f3d9b5' }, g);
      [-1, 1].forEach(k => el('ellipse', { cx: k * 118, cy: -4, rx: 34, ry: 70, fill: '#9c6a3a', transform: `rotate(${k * -16} ${k * 118} -4)` }, g));
      hi(g, -50, -78, 22, 9, -25, .3);
      return [[-80, 30], [80, 30]];
    } },
  { n: 'けろ', bg: '#c8ecff', hello: () => { A.animal('frog') || A.voice('frog', 220); ctx_say('けろ'); },
    spots: { brows: [0, -122], eyes: [0, -78], glasses: [0, -78], nose: [0, 0], mustache: [0, 22], mouth: [0, 46], hat: [0, -190], ribbon: [104, -86] },
    draw(g) {
      [-1, 1].forEach(k => el('circle', { cx: k * 50, cy: -76, r: 50, fill: '#7fd36b' }, g));
      el('ellipse', { cx: 0, cy: 16, rx: 145, ry: 108, fill: '#7fd36b' }, g);
      el('ellipse', { cx: 0, cy: 64, rx: 100, ry: 46, fill: '#a6e690', opacity: .7 }, g);
      [-1, 1].forEach(k => hi(g, k * 50 - 18, -102, 12, 7, -25, .4));
      hi(g, -80, -24, 26, 12, -20, .3);
      return [[-96, 34], [96, 34]];
    } },
  { n: 'かぼちゃ', bg: '#e2d4ff', hello: () => { A.sfx('spin', { vol: .6 }) || A.boing(); ctx_say('ばあ！'); },
    spots: { brows: [0, -66], eyes: [0, -24], glasses: [0, -24], nose: [0, 16], mustache: [0, 38], mouth: [0, 62], hat: [0, -160], ribbon: [-80, -100] },
    draw(g) {
      el('path', { d: 'M-8,-104 Q-14,-140 6,-150 L18,-144 Q4,-130 10,-104Z', fill: '#7a5236' }, g);
      el('path', { d: 'M8,-128 Q40,-160 70,-138 Q44,-112 8,-128Z', fill: '#5fd17a' }, g);
      [-1, 1].forEach(k => el('ellipse', { cx: k * 62, cy: 6, rx: 82, ry: 112, fill: '#ff9a3c' }, g));
      el('ellipse', { cx: 0, cy: 2, rx: 72, ry: 118, fill: '#ffab52' }, g);
      line(g, 'M-40,-96 Q-56,4 -40,104 M40,-96 Q56,4 40,104', 4, '#f08a2a');
      hi(g, -76, -50, 16, 34, 20, .3);
      return [[-86, 34], [86, 34]];
    } }
];
let ctx_say = say; // replaced in mount so hello() can talk through the ghost's bubble

const faceToy = {
  id: 'face', name: 'ふくわらい', color: '#ffc99e',
  thumb(g) {
    el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#ffe2c8' }, g);
    const f = el('g', { transform: 'translate(0 10) scale(.5)' }, g);
    BASES[0].draw(f);
    [['eyesRound', -18], ['noseBall', 22], ['mouthGrin', 72]].forEach(([k, y]) => PARTS[k].draw(el('g', { transform: `translate(0 ${y})` }, f)));
  },
  mount(ctx) {
    const { svg, defs } = ctx;
    PUPILS.clear();
    const pat = el('pattern', { id: 'face-dots', width: 50, height: 50, patternUnits: 'userSpaceOnUse' }, defs);
    el('circle', { cx: 10, cy: 10, r: 4, fill: '#fff', opacity: .35 }, pat);
    el('circle', { cx: 35, cy: 35, r: 3, fill: '#fff', opacity: .25 }, pat);
    const FX = 200, FY = 322;

    /* ---------- backdrop: color wash, drifting bubbles, a turning ring ---------- */
    const bg = el('g', {}, svg);
    const wash = el('rect', { x: -800, y: -900, width: 2000, height: 2600, style: 'fill:#ffc99e;transition:fill .7s' }, bg);
    el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: 'url(#face-dots)' }, bg);
    [[-30, 190, 40], [420, 260, 50], [-20, 470, 30], [410, 520, 34], [60, 150, 14], [340, 470, 12]].forEach(([x, y, r], i) => {
      const f = el('g', { class: 'float', style: `animation-delay:-${i * .7}s;animation-duration:${3 + i * .4}s` }, bg);
      el('circle', { cx: x, cy: y, r, fill: '#fff', opacity: .35 }, f);
    });
    el('circle', { cx: FX, cy: FY, r: 172, fill: '#fff', opacity: .45 }, bg);
    const ringG = el('g', { transform: `translate(${FX} ${FY})` }, bg);
    const ring = el('circle', { r: 172, fill: 'none', stroke: '#fff', 'stroke-width': 8, 'stroke-dasharray': '2 26', 'stroke-linecap': 'round', opacity: .9 }, ringG);
    ring.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 40000, iterations: Infinity });
    [[52, 300], [350, 236], [40, 430], [362, 420]].forEach(([x, y], i) => {
      const s = el('path', { d: `M${x},${y - 11} Q${x + 2},${y - 2} ${x + 11},${y} Q${x + 2},${y + 2} ${x},${y + 11} Q${x - 2},${y + 2} ${x - 11},${y} Q${x - 2},${y - 2} ${x},${y - 11}Z`, fill: '#fff', class: 'twinkle' }, bg);
      s.style.animationDelay = `-${i * .6}s`;
    });
    // tray shelf and album board
    el('rect', { x: 4, y: 496, width: 392, height: 188, rx: 40, fill: '#fff', opacity: .4 }, bg);
    const album = el('g', {}, svg);
    el('rect', { x: 90, y: 18, width: 214, height: 86, rx: 20, fill: '#fff', opacity: .5 }, album);
    [0, 1, 2, 3].forEach(i => el('rect', { x: 102 + i * 50, y: 33, width: 40, height: 50, rx: 6, fill: '#fff', opacity: .45, 'stroke-dasharray': '4 5', stroke: '#fff', 'stroke-width': 2 }, album));
    const photos = [];

    const faceLayer = el('g', {}, svg);
    const trayLayer = el('g', {}, svg);
    const photoLayer = el('g', {}, svg);
    const dragLayer = el('g', { 'pointer-events': 'none' }, svg);
    const fx = el('g', { 'pointer-events': 'none' }, svg);
    const ghost = ctx.ghost(svg, { x: 346, y: 80, s: .46 });
    const gEyes = ghost.body.querySelector(':scope > g.tb');
    ctx_say = text => { ghost.talk(text); };

    /* ---------- camera ---------- */
    const cam = el('g', { transform: 'translate(200 732)' }, svg);
    el('circle', { r: 50, fill: '#fff', filter: 'url(#soft)' }, cam);
    const camIn = el('g', { class: 'tb' }, cam);
    el('circle', { r: 46, fill: '#7fb8ff' }, camIn);
    el('rect', { x: -12, y: -27, width: 24, height: 12, rx: 4, fill: '#fff' }, camIn);
    el('rect', { x: -28, y: -19, width: 56, height: 40, rx: 10, fill: '#fff' }, camIn);
    el('circle', { cy: 1, r: 13, fill: '#5a8fe0' }, camIn);
    el('circle', { cx: -4, cy: -3, r: 4.5, fill: '#fff', opacity: .8 }, camIn);
    el('circle', { cx: 19, cy: -11, r: 3.5, fill: '#ffd56b' }, camIn);
    el('path', { d: 'M-30,-30 A42,42 0 0 1 -6,-42', stroke: 'rgba(255,255,255,.6)', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, camIn);
    let camPulse = null;

    /* ---------- the face ---------- */
    let baseIdx = Math.floor(rand(0, BASES.length)), base = null, faceOuter = null, faceIn = null, layers = {}, placed = {};
    let alive = false, busy = false, sway = null, drag = null, round = 0, rare = false, stuck = 0, look = [0, 0];
    function buildFace(pop) {
      round++;
      base = BASES[baseIdx % BASES.length];
      wash.style.fill = base.bg;
      faceOuter = el('g', { transform: `translate(${FX} ${FY})` }, faceLayer);
      const breathe = el('g', { class: 'tb' }, faceOuter);
      breathe.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.015,.985)' }], { duration: 1600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      faceIn = el('g', { class: 'tb' }, breathe);
      const b = el('g', {}, faceIn);
      el('ellipse', { cx: 0, cy: 150, rx: 110, ry: 14, fill: INK, opacity: .1 }, b);
      const ck = base.draw(b);
      ck.forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 18, ry: 12, fill: '#ffa3b8', opacity: .75 }, b));
      layers = {}; placed = {}; alive = false; stuck = 0;
      Z.forEach(t => { layers[t] = el('g', { 'pointer-events': 'none' }, faceIn); });
      b.addEventListener('pointerdown', e => { e.stopPropagation(); poke(); });
      if (pop) faceIn.animate([{ transform: 'scale(0) rotate(-20deg)' }, { transform: 'scale(1.08) rotate(4deg)', offset: .7 }, { transform: 'scale(1) rotate(0deg)' }], { duration: 560, easing: 'ease-out' });
    }
    function wobble() {
      faceIn.animate([{ transform: 'scale(1) rotate(0deg)' }, { transform: 'scale(1.1,.9) rotate(-5deg)' }, { transform: 'scale(.95,1.07) rotate(4deg)' }, { transform: 'scale(1.02,.98) rotate(-2deg)' }, { transform: 'scale(1) rotate(0deg)' }], { duration: 520 });
      kick(260);
    }
    function poke() {
      if (busy) return;
      haptic();
      wobble();
      if (alive) talk();
      else { A.sfx('boing2', { rate: rand(.9, 1.2), vol: .6 }) || A.boing(); ctx.sparkle(FX, FY, 3, 60, '#fff'); }
    }
    // the face speaks with ぽわん's voice while its mouth moves
    function talk(text) {
      text = text || pick(['やあ！', 'おはよう！', 'こんにちは！', 'だいすき', 'ばあ！']);
      say(text);
      ctx.bubble(text, FX, FY - 186);
      const m = placed.mouth;
      if (m) m.inner.animate([
        { transform: 'scale(1,1)' }, { transform: 'scale(1.1,.4)' }, { transform: 'scale(.95,1.3)' }, { transform: 'scale(1.08,.5)' },
        { transform: 'scale(.96,1.25)' }, { transform: 'scale(1.06,.55)' }, { transform: 'scale(1,1.15)' }, { transform: 'scale(1,1)' }], { duration: 900, easing: 'ease-in-out' });
      faceIn.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0px)' }, { transform: 'translateY(-5px)' }, { transform: 'translateY(0px)' }], { duration: 900 });
    }

    /* ---------- tray: ten parts per round, at least one silly one ---------- */
    const SLOT_XY = [[44, 548], [122, 548], [200, 548], [278, 548], [356, 548], [44, 636], [122, 636], [200, 636], [278, 636], [356, 636]];
    const slots = SLOT_XY.map(([x, y]) => {
      const g = el('g', {}, trayLayer);
      const disc = el('circle', { cx: x, cy: y, r: 38, fill: '#fff', opacity: .9, filter: 'url(#soft)' }, g);
      const halo = el('circle', { cx: x, cy: y, r: 38, fill: 'none', stroke: '#ffd56b', 'stroke-width': 5, opacity: 0, 'stroke-dasharray': '6 7' }, g);
      el('circle', { cx: x, cy: y, r: 44, fill: 'transparent' }, g);
      const s = { part: null, x, y, g, disc, halo, piece: null };
      g.addEventListener('pointerdown', e => { e.stopPropagation(); if (s.piece) grab(s, e); });
      return s;
    });
    function fillTray() {
      const silly = round % 3 === 0;
      const one = pick(['eyes', 'nose', 'mouth']);
      const two = t => {
        const a = NORMAL[t].slice().sort(() => Math.random() - .5);
        return (silly || t === one) ? [SILLY[t], a[0]] : [a[0], a[1]];
      };
      const [e1, e2] = two('eyes'), [n1, n2] = two('nose'), [m1, m2] = two('mouth');
      const ex = EXTRAS.slice().sort(() => Math.random() - .5).slice(0, 4);
      if (rare) ex[0] = 'crown';
      const list = [e1, n1, m1, e2, n2, m2, ...ex];
      slots.forEach((s, i) => {
        const old = s.piece;
        if (old) old.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(0)' }], { duration: 200, fill: 'forwards' }).onfinish = () => old.outer.remove();
        s.part = PARTS[list[i]];
        s.halo.setAttribute('opacity', s.part.silly || s.part.gold ? .95 : 0);
        s.halo.setAttribute('stroke', s.part.gold ? '#ffb800' : '#ffd56b');
        s.piece = null;
        ctx.after(220 + i * 45, () => spawn(s, true));
      });
    }
    function setT(pc, x, y, sc, rot = 0) {
      pc.x = x; pc.y = y; pc.s = sc;
      pc.outer.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(3)})`);
    }
    function spawn(s, pop) {
      if (s.piece) return;
      const outer = el('g', {}, s.g);
      const lk = el('g', { class: 'float', style: `animation-delay:-${rand(0, 3).toFixed(1)}s` }, outer);
      const inner = el('g', { class: 'tb' }, lk);
      s.part.draw(inner);
      if (!s.part.ts) { const bb = inner.getBBox(), m = Math.max(bb.width, bb.height); if (m > 1) s.part.ts = Math.min(1, 62 / m); }
      const pc = { part: s.part, type: s.part.type, outer, lk, inner, x: s.x, y: s.y, s: s.part.ts || .6, ts: s.part.ts || .6 };
      setT(pc, s.x, s.y, pc.ts);
      s.piece = pc;
      if (pop) inner.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.2)', offset: .7 }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' });
    }

    /* ---------- drag, tap and stick ---------- */
    function grab(s, e) {
      if (busy || drag) return;
      haptic(); A.sfx('pop', { rate: rand(1, 1.3), vol: .6 }) || A.pop();
      const pc = s.piece; s.piece = null;
      dragLayer.appendChild(pc.outer);
      pc.lk.classList.remove('float');
      const p = ctx.point(e);
      drag = { pc, s, sx: p.x, sy: p.y, moved: false, grow: 0 };
      const d = drag;
      ctx.tween(160, k => { d.grow = k; if (drag === d) setT(pc, pc.x, pc.y, pc.ts + (1 - pc.ts) * k); }, null, easeOut);
      pc.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2,.85)' }, { transform: 'scale(1)' }], { duration: 240 });
      ctx.after(260, () => spawn(s, true));
    }
    ctx.on(window, 'pointermove', e => {
      if (!drag) return;
      const p = ctx.point(e);
      if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 12) drag.moved = true;
      if (drag.moved) setT(drag.pc, p.x, p.y - 10, drag.pc.ts + (1 - drag.pc.ts) * drag.grow);
    });
    const release = e => {
      if (!drag) return;
      const d = drag; drag = null;
      const p = ctx.point(e);
      let lx, ly;
      if (d.moved && Math.hypot(p.x - FX, p.y - 10 - FY) < 160) { lx = p.x - FX; ly = p.y - 10 - FY; }
      else [lx, ly] = base.spots[d.pc.type];
      fly(d.pc, lx, ly);
    };
    ctx.on(window, 'pointerup', release);
    ctx.on(window, 'pointercancel', release);
    function fly(pc, lx, ly) {
      const x0 = pc.x, y0 = pc.y, s0 = pc.s, tx = FX + lx, ty = FY + ly;
      const far = Math.hypot(tx - x0, ty - y0) > 30;
      if (far) A.sfx('whoosh', { rate: rand(1.1, 1.4), vol: .4 }) || A.whoosh();
      const target = faceOuter;
      ctx.tween(far ? 380 : 120, k => {
        const lift = far ? Math.sin(k * Math.PI) * 60 : 0;
        setT(pc, x0 + (tx - x0) * k, y0 + (ty - y0) * k - lift, s0 + (1 - s0) * k, far ? Math.sin(k * Math.PI) * 24 : 0);
      }, () => { if (target === faceOuter && !busy) stick(pc, lx, ly); else pc.outer.remove(); }, easeInOut);
    }
    function stick(pc, lx, ly) {
      const old = placed[pc.type];
      if (old) old.inner.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.4)', opacity: 0 }], { duration: 220, fill: 'forwards' }).onfinish = () => old.outer.remove();
      layers[pc.type].appendChild(pc.outer);
      setT(pc, lx, ly, 1);
      pc.home = [lx, ly];
      placed[pc.type] = pc;
      pc.inner.animate([{ transform: 'scale(1.4,.6)' }, { transform: 'scale(.88,1.15)' }, { transform: 'scale(1.05,.96)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
      haptic(18);
      if (!A.sfx('blink', { rate: rand(.9, 1.25), vol: .8 })) A.osc(300, { type: 'triangle', slide: 110, slideT: .08, r: .1, vol: .26, wet: .1 });
      if (pc.part.silly) ctx.after(90, () => { A.sfx(pick(['boing2', 'spring', 'slide']), { rate: rand(.95, 1.15), vol: .55 }) || A.boing(); A.giggle(); });
      if (pc.part.gold) { A.sfx('jingle', { vol: .6 }) || A.twinkle(); ctx.sparkle(FX + lx, FY + ly, 8, 60, '#ffd23f'); }
      if (++stuck === 1) say('ぺたっ');
      ctx.sparkle(FX + lx, FY + ly, 4, 34);
      puff(FX + lx, FY + ly);
      faceIn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04,.96)' }, { transform: 'scale(1)' }], { duration: 260 });
      kick(200);
      ghost.hop();
      if (!alive && placed.eyes && placed.nose && placed.mouth) ctx.after(450, comeAlive);
      else if (alive) ctx.after(350, () => { ghost.set('happy'); if (Math.random() < .5) talk(); else A.giggle(); ctx.after(900, () => { if (!busy) ghost.set('normal'); }); });
    }
    function puff(x, y) {
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2, c = el('circle', { cx: x, cy: y, r: 7, fill: '#fff' }, fx);
        ctx.tween(420, k => { c.setAttribute('cx', (x + Math.cos(a) * 50 * k).toFixed(1)); c.setAttribute('cy', (y + Math.sin(a) * 50 * k).toFixed(1)); c.setAttribute('r', (7 * (1 - k) + 1).toFixed(1)); c.setAttribute('opacity', (1 - k).toFixed(2)); }, () => c.remove(), easeOut);
      }
    }
    function comeAlive() {
      if (alive || busy || !(placed.eyes && placed.nose && placed.mouth)) return;
      alive = true;
      A.sfx('sparkle', { vol: .5 }) || A.twinkle();
      ctx.sparkle(FX, FY, 7, 120);
      wobble();
      ctx.after(350, () => talk());
      sway = faceIn.animate([{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 1300, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', composite: 'add' });
      ghost.set('happy'); ghost.giggle();
      ctx.after(2200, () => { if (!busy) { ghost.talk('おもしろい かお！'); } });
      ctx.after(3400, () => { if (!busy) ghost.set('normal'); });
      camPulse = camIn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }], { duration: 600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    }

    /* ---------- life: blinking, looking, googly physics ---------- */
    (function blinkLoop() {
      ctx.after(rand(2000, 5000), () => {
        const ey = placed.eyes;
        if (ey && !busy && ey.part !== PARTS.eyesGoogly) ey.inner.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 200 });
        blinkLoop();
      });
    })();
    ctx.every(4200, () => { if (alive && !busy && Math.random() < .4) { A.giggle(); if (placed.mouth) placed.mouth.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18,.85)' }, { transform: 'scale(.92,1.12)' }, { transform: 'scale(1)' }], { duration: 480 }); } });
    ctx.on(ctx.host, 'pointerdown', e => {
      const p = ctx.point(e);
      look = [clamp((p.x - FX) / 120, -1, 1) * 6, clamp((p.y - (FY - 20)) / 120, -1, 1) * 5];
      const ey = placed.eyes;
      if (ey && ey.home && !busy) setT(ey, ey.home[0] + look[0], ey.home[1] + look[1], 1);
      if (gEyes) gEyes.setAttribute('transform', `translate(${(clamp((p.x - ghost.x) / 80, -1, 1) * 7).toFixed(1)} ${(clamp((p.y - ghost.y) / 80, -1, 1) * 5).toFixed(1)})`);
    }, true);
    function kick(v) { PUPILS.forEach(q => { q.vx += rand(-v, v); q.vy += rand(-v, v * .3); }); }
    ctx.loop(dt => {
      PUPILS.forEach(q => {
        if (!q.node.isConnected) { PUPILS.delete(q); return; }
        const m = q.frame.getScreenCTM();
        if (!m) return;
        const sc = Math.hypot(m.a, m.b) || 1;
        if (q.lx != null && dt > 0) {
          // the eye moved: the pupil lags behind (inertia)
          const vx = (m.e - q.lx) / dt / sc, vy = (m.f - q.ly) / dt / sc;
          q.vx -= (vx - q.px) * .9; q.vy -= (vy - q.py) * .9;
          q.px = vx; q.py = vy;
        }
        q.lx = m.e; q.ly = m.f;
        q.vy += 900 * dt;
        q.vx *= .97; q.vy *= .97;
        q.ox += q.vx * dt; q.oy += q.vy * dt;
        const d = Math.hypot(q.ox, q.oy);
        if (d > q.R) {
          const nx = q.ox / d, ny = q.oy / d, vn = q.vx * nx + q.vy * ny;
          q.ox = nx * q.R; q.oy = ny * q.R;
          if (vn > 0) { q.vx -= 1.5 * vn * nx; q.vy -= 1.5 * vn * ny; }
        }
        q.node.setAttribute('cx', q.ox.toFixed(1)); q.node.setAttribute('cy', q.oy.toFixed(1));
      });
    });

    /* ---------- photo ---------- */
    function flashAt(o = 1) {
      const flash = el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: '#fff', opacity: o }, fx);
      flash.animate([{ opacity: o }, { opacity: 0 }], { duration: 600, easing: 'ease-out', fill: 'forwards' }).onfinish = () => flash.remove();
    }
    function snap() {
      if (busy) return;
      haptic();
      camIn.animate([{ transform: 'scale(1)' }, { transform: 'scale(.82,.86)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 320 });
      if (!Object.keys(placed).length) {
        A.sfx('shutter', { vol: .5 }) || A.click();
        flashAt(.4);
        ghost.set('happy'); ghost.talk('ぺたって してね！');
        const s = slots.find(q => q.piece && q.part.type === 'eyes');
        if (s) s.piece.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 400, iterations: 2 });
        ctx.after(1400, () => ghost.set('normal'));
        return;
      }
      busy = true;
      if (camPulse) { camPulse.cancel(); camPulse = null; }
      if (drag) { drag.pc.outer.remove(); drag = null; }
      ghost.set('happy'); ghost.talk('はい ちーず！');
      if (alive) ctx.after(500, () => placed.mouth && placed.mouth.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15,.8)' }, { transform: 'scale(1)' }], { duration: 400 }));
      ctx.after(1100, () => {
        if (!A.sfx('shutter', { vol: .8 })) { A.noise({ type: 'highpass', from: 2500, dur: .05, vol: .25, wet: 0 }); A.click(); }
        flashAt(1);
        if (sway) { sway.cancel(); sway = null; }
        const gold = rare;
        const frame = el('g', { transform: `translate(${FX} ${FY})` }, photoLayer);
        const fin = el('g', { class: 'tb' }, frame);
        el('rect', { x: -150, y: -168, width: 300, height: 352, rx: 16, fill: gold ? '#ffd56b' : '#fff', filter: 'url(#soft)' }, fin);
        el('rect', { x: -136, y: -154, width: 272, height: 262, rx: 10, fill: gold ? '#fff6c8' : '#bfe8ff' }, fin);
        el('ellipse', { cx: 0, cy: 100, rx: 136, ry: 26, fill: gold ? '#ffe08a' : '#a8e08f' }, fin);
        [[-96, 140], [-48, 150], [0, 144], [48, 150], [96, 140]].forEach(([x, y], i) => el('path', { d: `M${x},${y + 10} C${x - 15},${y - 3} ${x - 8},${y - 15} ${x},${y - 6} C${x + 8},${y - 15} ${x + 15},${y - 3} ${x},${y + 10}Z`, fill: PARTY[i] }, fin));
        photoLayer.appendChild(faceOuter);
        const fo = faceOuter, S1 = .72;
        ctx.tween(380, k => {
          const r = -4 * k;
          frame.setAttribute('transform', `translate(${FX} ${FY}) rotate(${r.toFixed(2)})`);
          fo.setAttribute('transform', `translate(${FX} ${FY}) rotate(${r.toFixed(2)}) translate(0 ${(-26 * k).toFixed(1)}) scale(${(1 - (1 - S1) * k).toFixed(3)})`);
        }, null, easeOut);
        fin.animate([{ transform: 'scale(.7)', opacity: 0 }, { transform: 'scale(1.05)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 380, easing: 'ease-out' });
        // the show
        ctx.after(350, () => {
          A.tada(); ctx.confetti(FX, FY - 60, 44); ctx.sparkle(FX, FY, 8, 160, gold ? '#ffd23f' : '#ffd56b');
          if (gold) A.sfx('jingle', { vol: .6, when: .3 });
          ghost.giggle();
          ghost.moveTo(320, 190, .58, 500, () => ghost.hop(), easeBack);
          if (alive) talk(pick(['だいすき', 'ばあ！', 'やあ！']));
        });
        ctx.after(1100, () => { ctx.confetti(80, 220, 22); ctx.confetti(320, 220, 22); ghost.hop(); });
        ctx.after(1500, () => { ghost.talk(pick(['かわいい！', 'すてき！', 'いい かお！'])); ghost.moveTo(346, 80, .46, 700); });
        ctx.after(3000, () => toAlbum(frame, fo, gold));
      });
    }
    // the photo shrinks into the album at the top
    function toAlbum(frame, fo, gold) {
      if (photos.length >= 4) {
        const old = photos.shift();
        old.g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => old.g.remove();
        photos.forEach((it, i) => { const x0 = it.x, x1 = 122 + i * 50; ctx.tween(400, k => { it.x = x0 + (x1 - x0) * k; it.g.setAttribute('transform', `translate(${it.x.toFixed(1)} 58)`); }, null, easeInOut); });
      }
      const i = photos.length, tx = 122 + i * 50, ty = 58, S = .135, rot = pick([-6, -3, 4, 7]);
      A.sfx('whoosh2', { vol: .5 }) || A.whoosh();
      const T = k => `translate(${(FX + (tx - FX) * k).toFixed(1)} ${(FY + (ty - FY) * k).toFixed(1)}) rotate(${(-4 + (rot + 4) * k + Math.sin(k * Math.PI) * 20).toFixed(1)}) scale(${(1 + (S - 1) * k).toFixed(4)})`;
      ctx.tween(700, k => {
        frame.setAttribute('transform', T(k));
        fo.setAttribute('transform', T(k) + ' translate(0 -26) scale(.72)');
      }, () => {
        const g = el('g', { transform: `translate(${tx} ${ty})` }, album);
        const sw = el('g', { class: 'tb' }, g);
        const inner = el('g', { transform: `rotate(${rot}) scale(${S})`, 'pointer-events': 'none' }, sw);
        frame.setAttribute('transform', ''); inner.appendChild(frame);
        fo.setAttribute('transform', 'translate(0 -26) scale(.72)'); inner.appendChild(fo);
        el('rect', { x: -24, y: -28, width: 48, height: 56, fill: 'transparent' }, sw);
        const it = { g, sw, x: tx };
        photos.push(it);
        sw.animate([{ transform: 'scale(1.4)' }, { transform: 'scale(.9)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
        A.sfx('flip', { vol: .7 }) || A.pop();
        ctx.sparkle(tx, ty, 5, 30, gold ? '#ffd23f' : '#fff');
        g.addEventListener('pointerdown', e => {
          e.stopPropagation(); haptic();
          sw.animate([{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(10deg) scale(1.2)' }, { transform: 'rotate(-6deg) scale(1.05)' }, { transform: 'rotate(0deg) scale(1)' }], { duration: 600, easing: 'ease-out' });
          A.sfx('flip', { rate: rand(.9, 1.2), vol: .6 }) || A.pop();
          ctx.sparkle(it.x, ty, 3, 26);
        });
        ctx.after(250, nextFace);
      }, easeInOut);
    }
    function nextFace() {
      baseIdx++;
      rare = round > 2 && Math.random() < 1 / 6;
      buildFace(true); fillTray();
      A.sfx('pop2', { vol: .6 }) || A.boing();
      ghost.set('happy');
      ctx.after(300, () => base.hello());
      ctx.after(1800, () => ghost.set('normal'));
      busy = false;
    }
    cam.addEventListener('pointerdown', e => { e.stopPropagation(); snap(); });

    bg.addEventListener('pointerdown', e => {
      const p = ctx.point(e);
      haptic(6);
      const h = el('path', { d: 'M0,8 C-14,-4 -8,-16 0,-7 C8,-16 14,-4 0,8Z', fill: pick(PARTY), transform: `translate(${p.x.toFixed(0)} ${p.y.toFixed(0)})` }, fx);
      ctx.tween(900, k => { h.setAttribute('transform', `translate(${(p.x + Math.sin(k * 9) * 8).toFixed(1)} ${(p.y - k * 70).toFixed(1)}) scale(${(1 + easeBack(Math.min(1, k * 3)) * .6).toFixed(2)})`); h.setAttribute('opacity', (1 - k * k).toFixed(2)); }, () => h.remove(), k => k);
      A.sfx('blink', { rate: rand(1.1, 1.5), vol: .4 }) || A.osc(mtof(pick(PENTA) + 12), { r: .2, vol: .08 });
    });
    ghost.pos.addEventListener('pointerdown', e => {
      e.stopPropagation(); ghost.giggle();
      ghost.talk(pick(['くすぐったい〜', 'おかお つくろう！']), false);
      ctx.after(1200, () => { if (!busy) ghost.set('normal'); });
    });

    buildFace(false); fillTray();
    ctx.after(450, () => { ghost.set('happy'); ghost.talk('おかお つくろう！'); ctx.after(1600, () => ghost.set('normal')); });
    ctx.hint = () => {
      if (busy || drag) return null;
      if (alive) return [200, 732];
      const need = ['eyes', 'nose', 'mouth'].find(t => !placed[t]);
      const s = need && slots.find(q => q.part && q.part.type === need && q.piece);
      return s ? [s.x, s.y] : [200, 732];
    };
  }
};
TOYS.push(faceToy);
})();
