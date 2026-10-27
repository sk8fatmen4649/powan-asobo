'use strict';
/* =========================================================
   toy: てあらい — water, soap, rub-a-dub, rinse, towel, ぴかぴか
   ========================================================= */
(() => {
  const INK = '#3a2f5b';
  const GERMC = ['#8fdc6a', '#c9a7ff', '#ffb35c', '#7fc8ff', '#ff9ac0'];
  /* the washer rotates: a child, ぽわん, an animal (dog / cat) */
  const VARS = {
    kidA: { kind: 'kid', hair: 'tuft', wall: ['#bfe6ff', '#d9f2ff'], shirt: '#ffd56b', sleeve: '#ffd56b', stripe: '#ffb35c', cuff: '#fff2c2', towel: '#ffb3c1', skin: '#ffdcc6', palm: '#ffeadf', crease: '#f0b9a0', s: 1.2 },
    kidB: { kind: 'kid', hair: 'tails', wall: ['#ffd9e4', '#ffeaf0'], shirt: '#ff9ab3', sleeve: '#ff9ab3', stripe: '#ffffff', cuff: '#ffd0dc', towel: '#9fd8ff', skin: '#ffdcc6', palm: '#ffeadf', crease: '#f0b9a0', s: 1.2 },
    powan: { kind: 'powan', wall: ['#ddd3ff', '#ece6ff'], towel: '#ffd56b', s: 1.18 },
    dog: { kind: 'paw', animal: 'dog', wall: ['#c2efd9', '#dbf8ea'], fur: '#d9a066', fur2: '#c48a50', band: '#7fc8ff', shirt: '#7fc8ff', towel: '#ffb3c1', s: 1.36 },
    cat: { kind: 'paw', animal: 'cat', wall: ['#ffe2c2', '#fff0dc'], fur: '#ffb066', fur2: '#e88a3a', band: '#c9a7ff', shirt: '#c9a7ff', towel: '#9fe6c8', s: 1.36 }
  };
  const ORDER = ['kidA', 'powan', 'dog', 'kidB', 'powan', 'cat'];
  const SPOTS = {
    kid: [[-16, 2], [18, 30], [11, -76], [-28, 34], [33, -62], [-11, -68]],
    paw: [[-20, -2], [20, 20], [-13, -60], [36, -40], [2, 32], [13, -60]],
    powan: [[-16, -20], [18, 12], [0, -46], [-22, 26], [26, -28], [2, 40]]
  };

  /* ---------- drawing ---------- */
  function hwHand(g, v, side) {
    const m = el('g', { transform: `scale(${side} 1)` }, g);
    if (v.kind === 'kid') {
      const S = v.skin, P = v.palm;
      el('rect', { x: -30, y: 30, width: 60, height: 330, rx: 28, fill: S }, m);
      el('rect', { x: -47, y: 150, width: 94, height: 270, rx: 34, fill: v.sleeve }, m);
      [190, 228, 266].forEach(y => el('rect', { x: -47, y, width: 94, height: 13, fill: v.stripe, opacity: .85 }, m));
      el('rect', { x: -47, y: 150, width: 94, height: 24, rx: 12, fill: v.cuff }, m);
      el('rect', { x: -13, y: -50, width: 26, height: 60, rx: 13, fill: S, transform: 'translate(44 16) rotate(50)' }, m);
      [[33, 56], [11, 66], [-11, 60], [-33, 46]].forEach(([x, len]) => {
        const f = el('g', { transform: `rotate(${(x * .22).toFixed(1)} ${x} -24)` }, m);
        el('rect', { x: x - 12.5, y: -30 - len, width: 25, height: len + 36, rx: 12.5, fill: S }, f);
        el('ellipse', { cx: x, cy: -18 - len, rx: 7.5, ry: 6.5, fill: P }, f);
      });
      el('path', { d: 'M-50,-24 Q-50,-40 -34,-40 L34,-40 Q50,-40 50,-24 L48,28 Q44,64 0,66 Q-44,64 -48,28Z', fill: S }, m);
      el('ellipse', { cx: 2, cy: 14, rx: 34, ry: 31, fill: P }, m);
      el('ellipse', { cx: 32, cy: 28, rx: 16, ry: 22, fill: P, opacity: .8 }, m);
      el('path', { d: 'M-34,-10 Q-6,2 30,-16 M-30,22 Q-4,8 14,34', stroke: v.crease, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round', opacity: .55 }, m);
    } else if (v.kind === 'paw') {
      const F = v.fur, Pd = '#ff9ab3';
      el('rect', { x: -36, y: 20, width: 72, height: 340, rx: 34, fill: F }, m);
      if (v.animal === 'cat') el('path', { d: 'M-36,70 Q-18,78 -4,70 M36,96 Q18,104 4,96 M-36,190 Q-18,198 -4,190', stroke: v.fur2, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, m);
      el('rect', { x: -41, y: 120, width: 82, height: 30, rx: 13, fill: v.band }, m);
      el('rect', { x: -38, y: 128, width: 76, height: 6, rx: 3, fill: '#fff', opacity: .5 }, m);
      const toes = [[-36, -38, 19], [-13, -56, 20], [13, -56, 20], [36, -38, 19]];
      toes.forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: F }, m));
      el('ellipse', { cx: 0, cy: 0, rx: 54, ry: 50, fill: F }, m);
      el('path', { d: 'M-27,12 Q-31,-12 -12,-12 Q0,-21 12,-12 Q31,-12 27,12 Q23,34 0,34 Q-23,34 -27,12Z', fill: Pd }, m);
      toes.forEach(([x, y]) => { el('ellipse', { cx: x, cy: y + 4, rx: 9, ry: 11, fill: Pd }, m); el('circle', { cx: x - 3, cy: y, r: 2.6, fill: '#fff', opacity: .55 }, m); });
      el('ellipse', { cx: -9, cy: -2, rx: 7, ry: 4, fill: '#fff', opacity: .45 }, m);
    } else {
      el('rect', { x: -28, y: 20, width: 56, height: 340, rx: 26, fill: '#efe8ff' }, m);
      el('ellipse', { cx: 38, cy: 14, rx: 14, ry: 21, fill: '#f6f2ff', stroke: '#d9ccff', 'stroke-width': 2.5, transform: 'rotate(38 38 14)' }, m);
      el('path', { d: 'M-46,-4 C-46,-50 -26,-66 0,-66 C26,-66 46,-50 46,-4 L44,30 Q40,58 0,60 Q-40,58 -44,30Z', fill: 'url(#gGhost)', stroke: '#d9ccff', 'stroke-width': 2.5 }, m);
      el('path', { d: 'M0,22 C-14,10 -12,-2 -4,-2 Q0,-2 0,4 Q0,-2 4,-2 C12,-2 14,10 0,22Z', fill: '#ffc4d6', opacity: .8 }, m);
    }
    el('ellipse', { cx: -24, cy: -26, rx: 13, ry: 7, fill: '#fff', opacity: .35, transform: 'rotate(-25 -24 -26)' }, g);
  }
  function hwGerm(g, color, type) {
    if (type === 0) {
      [-9, 0, 9].forEach((x, i) => {
        el('path', { d: `M${x},-14 L${x * 1.3},${i === 1 ? -27 : -24}`, stroke: color, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g);
        el('circle', { cx: x * 1.3, cy: i === 1 ? -28 : -25, r: 4.4, fill: color }, g);
      });
      el('circle', { r: 19, fill: color }, g);
    } else if (type === 1) {
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; el('circle', { cx: (Math.cos(a) * 15).toFixed(1), cy: (Math.sin(a) * 15).toFixed(1), r: 9, fill: color }, g); }
      el('circle', { r: 17, fill: color }, g);
    } else {
      for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; el('circle', { cx: (Math.cos(a) * 18).toFixed(1), cy: (Math.sin(a) * 18).toFixed(1), r: 5.5, fill: color }, g); }
      el('circle', { r: 19, fill: color }, g);
    }
    el('ellipse', { cx: -7, cy: -10, rx: 6.5, ry: 3.6, fill: '#fff', opacity: .5, transform: 'rotate(-25 -7 -10)' }, g);
    [-1, 1].forEach(s => el('ellipse', { cx: s * 12, cy: 5, rx: 4, ry: 2.6, fill: '#ff8fa3', opacity: .8 }, g));
    const norm = el('g', {}, g), funny = el('g', { style: 'display:none' }, g);
    [-1, 1].forEach(s => { el('circle', { cx: s * 6.5, cy: -2, r: 3.8, fill: '#2b2340' }, norm); el('circle', { cx: s * 6.5 - 1.3, cy: -3.6, r: 1.4, fill: '#fff' }, norm); });
    el('path', { d: 'M-5,5 Q0,10 5,5', stroke: '#2b2340', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, norm);
    el('path', { d: 'M-11,-6 L-5,-2 L-11,2 M11,-6 L5,-2 L11,2', stroke: '#2b2340', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, funny);
    el('ellipse', { cx: 0, cy: 8, rx: 5, ry: 4.6, fill: '#7a2a40' }, funny);
    return { norm, funny };
  }
  function hwMud(g) {
    el('path', { d: 'M-18,-4 Q-20,-16 -6,-15 Q2,-22 12,-14 Q22,-12 19,0 Q22,12 8,13 Q-2,20 -10,12 Q-22,10 -18,-4Z', fill: '#c9a074', opacity: .85 }, g);
    el('ellipse', { cx: -4, cy: -5, rx: 6, ry: 3.5, fill: '#dcb894', opacity: .9 }, g);
    [[24, -14, 3.5], [-24, 10, 3], [14, 20, 2.6]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#c9a074', opacity: .8 }, g));
  }
  function hwFoam(g, rainbow) {
    const n = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) el('circle', { cx: rand(-10, 10).toFixed(1), cy: rand(-8, 8).toFixed(1), r: rand(7, 12).toFixed(1), fill: '#fff', stroke: rainbow ? pick(PARTY) : '#d6efff', 'stroke-width': 1.8 }, g);
    el('circle', { cx: -4, cy: -5, r: 2.6, fill: '#eaf8ff' }, g);
  }
  function hwTowel(g, color) {
    el('path', { d: 'M-30,2 Q0,-14 30,2 L30,16 L-30,16Z', fill: color }, g);
    el('rect', { x: -36, y: 8, width: 72, height: 116, rx: 16, fill: color }, g);
    el('rect', { x: -36, y: 92, width: 72, height: 10, fill: '#fff', opacity: .7 }, g);
    el('rect', { x: -36, y: 106, width: 72, height: 5, fill: '#fff', opacity: .55 }, g);
    for (let i = 0; i < 6; i++) el('circle', { cx: -30 + i * 12, cy: 124, r: 6.5, fill: color }, g);
    for (let y = 30; y < 90; y += 13) for (let x = -28 + (y % 2) * 6; x <= 28; x += 12) el('circle', { cx: x, cy: y, r: 3.2, fill: '#fff', opacity: .22 }, g);
    el('rect', { x: -26, y: 22, width: 12, height: 60, rx: 6, fill: '#fff', opacity: .3 }, g);
  }
  function hwFaucet(g) {
    el('ellipse', { cx: 285, cy: 402, rx: 34, ry: 10, fill: '#b9d3e4' }, g);
    el('path', { d: 'M285,402 L285,318 Q285,284 252,284 L224,284 Q200,284 200,306', stroke: '#cfe0ec', 'stroke-width': 26, fill: 'none', 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M277,396 L277,320 Q277,294 254,294', stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: .65 }, g);
    el('rect', { x: 182, y: 298, width: 36, height: 20, rx: 7, fill: '#b9d3e4' }, g);
    el('ellipse', { cx: 200, cy: 318, rx: 14, ry: 4, fill: '#6fa4c8' }, g);
  }

  /* ---------- the washer in the mirror ---------- */
  function hwKid(parent, v, ctx) {
    const root = el('g', { transform: 'translate(200 214)' }, parent);
    const bob = el('g', { class: 'float' }, root);
    const b = el('g', { class: 'tb' }, bob);
    el('path', { d: 'M-100,170 Q-96,84 -40,74 L40,74 Q96,84 100,170Z', fill: v.shirt }, b);
    el('path', { d: 'M-24,74 Q0,98 24,74', stroke: '#fff', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', opacity: .8 }, b);
    el('rect', { x: -16, y: 50, width: 32, height: 30, fill: v.skin }, b);
    const HAIR = v.hair === 'tails' ? '#8a5a3c' : '#5f4130';
    if (v.hair === 'tails') [-1, 1].forEach(s => { el('circle', { cx: s * 76, cy: -16, r: 24, fill: HAIR }, b); el('circle', { cx: s * 58, cy: -30, r: 8, fill: '#ff7a8a' }, b); });
    [-1, 1].forEach(s => { el('circle', { cx: s * 64, cy: 8, r: 14, fill: v.skin }, b); el('ellipse', { cx: s * 64, cy: 9, rx: 6, ry: 8, fill: '#ffc6b0' }, b); });
    el('circle', { r: 66, fill: v.skin }, b);
    el('path', { d: 'M-67,4 Q-74,-72 0,-74 Q74,-72 67,4 Q60,-30 36,-36 Q16,-24 -2,-40 Q-28,-26 -52,-30 Q-64,-18 -67,4Z', fill: HAIR }, b);
    if (v.hair === 'tuft') el('path', { d: 'M-8,-72 Q-6,-98 18,-92 Q4,-88 8,-72Z', fill: HAIR }, b);
    el('ellipse', { cx: -30, cy: -50, rx: 15, ry: 7, fill: '#fff', opacity: .3, transform: 'rotate(-22 -30 -50)' }, b);
    const eyes = el('g', { style: 'transition:translate .25s' }, b);
    const eN = el('g', { class: 'tb' }, eyes), eH = el('g', { style: 'display:none' }, eyes), eW = el('g', { style: 'display:none' }, eyes);
    [-1, 1].forEach(s => {
      const x = s * 24;
      el('ellipse', { cx: x, cy: 6, rx: 8.5, ry: 10.5, fill: INK }, eN);
      el('circle', { cx: x - 3, cy: 1, r: 3.4, fill: '#fff' }, eN);
      el('circle', { cx: x + 3, cy: 10, r: 1.5, fill: '#fff' }, eN);
      el('path', { d: `M${x - 10},9 Q${x},-4 ${x + 10},9`, stroke: INK, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round' }, eH);
      el('circle', { cx: x, cy: 5, r: 11, fill: INK }, eW);
      el('circle', { cx: x - 3.5, cy: 0, r: 4, fill: '#fff' }, eW);
    });
    [-1, 1].forEach(s => el('ellipse', { cx: s * 42, cy: 26, rx: 11, ry: 7, fill: '#ffa3b8', opacity: .8 }, b));
    const mN = el('path', { d: 'M-10,32 Q0,42 10,32', stroke: INK, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, b);
    const mH = el('g', { style: 'display:none' }, b);
    el('path', { d: 'M-14,30 Q0,56 14,30Z', fill: '#ff7a8a' }, mH);
    el('ellipse', { cx: 0, cy: 42, rx: 6, ry: 4, fill: '#ffb3c1' }, mH);
    const mW = el('ellipse', { cx: 0, cy: 38, rx: 7, ry: 9, fill: '#c2405a', style: 'display:none' }, b);
    let cur = 'normal';
    const api = {
      root, b,
      set(e) {
        cur = e;
        eN.style.display = e === 'normal' ? '' : 'none'; eH.style.display = e === 'happy' ? '' : 'none'; eW.style.display = e === 'wow' ? '' : 'none';
        mN.style.display = e === 'normal' ? '' : 'none'; mH.style.display = e === 'happy' ? '' : 'none'; mW.style.display = e === 'wow' ? '' : 'none';
      },
      look(dx, dy) { eyes.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`; },
      blink() { if (cur === 'normal') eN.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 }); },
      voice() { A.giggle(); },
      remove() { root.remove(); }
    };
    return api;
  }
  function hwPet(parent, v) {
    const root = el('g', { transform: 'translate(200 214)' }, parent);
    const bob = el('g', { class: 'float' }, root);
    const b = el('g', { class: 'tb' }, bob);
    el('path', { d: 'M-100,170 Q-96,84 -40,72 L40,72 Q96,84 100,170Z', fill: v.fur }, b);
    el('path', { d: 'M-70,170 Q-66,110 -30,92 L30,92 Q66,110 70,170Z', fill: v.shirt }, b);
    el('path', { d: 'M-30,92 Q0,116 30,92', fill: '#fff', opacity: .8 }, b);
    const head = el('g', { style: 'transition:translate .25s' }, b);
    const a = makeAnimal(v.animal, head, 0, -4, 1.45);
    let cur = 'normal';
    return {
      root, b,
      set(e) { cur = e; a.sleep(e === 'happy'); a.mouth(e !== 'normal'); },
      look(dx, dy) { head.style.translate = `${(dx * .8).toFixed(1)}px ${(dy * .6).toFixed(1)}px`; },
      blink() { if (cur !== 'normal') return; a.sleep(true); setTimeout(() => { if (root.isConnected && cur === 'normal') a.sleep(false); }, 150); },
      voice() { if (!A.animal(v.animal, { vol: .7 })) A.voice(v.animal, v.animal === 'dog' ? 520 : 700); a.sing(500); },
      remove() { root.remove(); }
    };
  }

  const handwashToy = {
    id: 'handwash', name: 'てあらい', color: '#9fdcff',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#d2efff' }, g);
      el('path', { d: 'M66,-84 L66,-60 Q66,-46 50,-46 L22,-46 Q10,-46 10,-34', stroke: '#b9d3e4', 'stroke-width': 13, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M62,-80 L62,-60', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .7 }, g);
      el('rect', { x: 48, y: -70, width: 36, height: 10, rx: 5, fill: '#7fc8ff' }, g);
      el('path', { d: 'M10,-28 L10,-2', stroke: '#9fe0ff', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: .9 }, g);
      const h = el('g', { transform: 'translate(-6 40) rotate(-8) scale(.62)' }, g);
      hwHand(h, VARS.kidA, 1);
      const f = el('g', { transform: 'translate(-30 -6) scale(1.2)' }, g); hwFoam(f);
      const gm = el('g', { transform: 'translate(18 38) scale(.8)' }, g); hwGerm(gm, GERMC[0], 0);
      [[-54, -40, 11], [-40, -66, 7], [48, 6, 9]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', opacity: .75, stroke: '#9fd8ff', 'stroke-width': 2 }, g));
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      /* ---------- defs ---------- */
      const tile = el('pattern', { id: 'handwash-tile', width: 48, height: 48, patternUnits: 'userSpaceOnUse' }, defs);
      const tileA = el('rect', { width: 48, height: 48, fill: '#bfe6ff' }, tile);
      const tileB = el('rect', { x: 3, y: 3, width: 42, height: 42, rx: 10, fill: '#d9f2ff' }, tile);
      el('circle', { cx: 13, cy: 13, r: 3, fill: '#fff', opacity: .75 }, tile);
      const bub = el('radialGradient', { id: 'handwash-bub', cx: .35, cy: .32, r: .75 }, defs);
      [[0, '#ffffff', .95], [.55, '#e9fbff', .3], [.85, '#c9e4ff', .45], [1, '#ffffff', .9]].forEach(([o, c, a]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, bub));
      const halo = el('radialGradient', { id: 'handwash-halo' }, defs);
      [[0, '#fff6b0', 0], [.55, '#fff6b0', .18], [.78, '#ffe36b', .75], [1, '#ffe36b', 0]].forEach(([o, c, a]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, halo));
      const glass = el('linearGradient', { id: 'handwash-glass', x1: 0, y1: 0, x2: .4, y2: 1 }, defs);
      [[0, '#f2fbff'], [1, '#c4e4f7']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, glass));
      const clip = el('clipPath', { id: 'handwash-mirror' }, defs);
      el('ellipse', { cx: 200, cy: 200, rx: 106, ry: 126 }, clip);

      /* ---------- far: wall ---------- */
      el('rect', { x: -800, y: -900, width: 2000, height: 1300, fill: 'url(#handwash-tile)' }, svg);
      el('rect', { x: -800, y: 360, width: 2000, height: 30, fill: '#fff', opacity: .35 }, svg);
      // shelf + swaying plant
      el('rect', { x: 10, y: 250, width: 74, height: 9, rx: 4.5, fill: '#fff', filter: 'url(#soft)' }, svg);
      const plantO = el('g', { transform: 'translate(47 250)' }, svg);
      const leaves = el('g', { style: 'transform-box:fill-box;transform-origin:50% 100%' }, plantO);
      [[-14, -40, -30], [0, -50, 0], [14, -40, 30]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y + 14, rx: 8, ry: 18, fill: '#7fd36b', transform: `rotate(${r} ${x} ${y + 30})` }, leaves));
      leaves.animate([{ transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg)' }], { duration: 2600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      el('path', { d: 'M-16,-22 L16,-22 L12,0 L-12,0Z', fill: '#ffb38a' }, plantO);
      el('rect', { x: -18, y: -26, width: 36, height: 7, rx: 3.5, fill: '#ff9a6b' }, plantO);
      // towel ring
      el('circle', { cx: 350, cy: 196, r: 20, fill: 'none', stroke: '#cfe0ec', 'stroke-width': 6 }, svg);
      el('rect', { x: 342, y: 168, width: 16, height: 12, rx: 4, fill: '#b9d3e4' }, svg);

      /* ---------- mid: the mirror (the washer is reflected here) ---------- */
      el('ellipse', { cx: 200, cy: 200, rx: 120, ry: 140, fill: '#ffc4d2', filter: 'url(#soft)' }, svg);
      el('ellipse', { cx: 200, cy: 200, rx: 112, ry: 132, fill: '#ffd9e2' }, svg);
      el('ellipse', { cx: 200, cy: 200, rx: 106, ry: 126, fill: 'url(#handwash-glass)' }, svg);
      const mirrorIn = el('g', { 'clip-path': 'url(#handwash-mirror)' }, svg);
      const refl = el('g', { style: 'transition:translate .5s' }, mirrorIn);
      el('rect', { x: 240, y: 92, width: 64, height: 78, rx: 12, fill: '#ffffff', opacity: .8 }, refl);
      el('rect', { x: 246, y: 98, width: 52, height: 66, rx: 8, fill: '#bfe9ff' }, refl);
      const cloud = el('g', {}, refl);
      [[0, 0, 9], [10, -4, 11], [20, 0, 8]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff' }, cloud));
      el('rect', { x: 92, y: 120, width: 34, height: 6, rx: 3, fill: '#fff', opacity: .6 }, refl);
      const charL = el('g', {}, mirrorIn);
      const glint = el('path', { d: 'M-30,40 L0,40 L-60,360 L-90,360Z', fill: '#fff', opacity: .45 }, mirrorIn);
      const flash = el('ellipse', { cx: 200, cy: 200, rx: 106, ry: 126, fill: '#fff', opacity: 0 }, mirrorIn);
      el('ellipse', { cx: 150, cy: 110, rx: 22, ry: 10, fill: '#fff', opacity: .55, transform: 'rotate(-35 150 110)' }, svg);

      /* ---------- near: counter + sink ---------- */
      el('rect', { x: -800, y: 388, width: 2000, height: 90, fill: '#f1f9ff' }, svg);
      el('rect', { x: -800, y: 470, width: 2000, height: 16, fill: '#d2ebf8' }, svg);
      el('rect', { x: -800, y: 486, width: 2000, height: 1400, fill: '#a9d8f0' }, svg);
      [[26, 510], [210, 510]].forEach(([x, y]) => { el('rect', { x, y, width: 164, height: 210, rx: 22, fill: '#b9e1f4' }, svg); el('circle', { cx: x === 26 ? 172 : 228, cy: y + 34, r: 9, fill: '#ffd56b' }, svg); });
      el('ellipse', { cx: 200, cy: 432, rx: 146, ry: 38, fill: '#dcefff' }, svg);
      el('ellipse', { cx: 200, cy: 438, rx: 132, ry: 30, fill: '#bfe0f4' }, svg);
      const basinWater = el('ellipse', { cx: 200, cy: 446, rx: 0, ry: 0, fill: '#9fe0ff', opacity: .8 }, svg);
      el('ellipse', { cx: 206, cy: 452, rx: 9, ry: 4, fill: '#8fb8d6' }, svg);
      const faucetO = el('g', {}, svg);
      const faucet = el('g', { class: 'tb' }, faucetO);
      el('circle', { cx: 252, cy: 320, r: 74, fill: 'transparent' }, faucet);
      hwFaucet(faucet);
      const knobO = el('g', { transform: 'translate(285 262)' }, faucet);
      const knob = el('g', { class: 'tb' }, knobO);
      el('rect', { x: -6, y: 0, width: 12, height: 24, fill: '#b9d3e4' }, knob);
      el('path', { d: 'M-30,-4 Q-30,-12 -22,-12 L22,-12 Q30,-12 30,-4 Q30,4 22,4 L-22,4 Q-30,4 -30,-4Z', fill: '#7fc8ff' }, knob);
      el('circle', { r: 13, cy: -4, fill: '#5fb2f0' }, knob);
      el('path', { d: 'M0,-12 Q5,-5 5,-2 A5,5 0 0 1 -5,-2 Q-5,-5 0,-12Z', fill: '#fff' }, knob);
      const pumpO = el('g', { transform: 'translate(62 402)' }, svg);
      const pump = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, pumpO);
      el('rect', { x: -52, y: -130, width: 110, height: 134, fill: 'transparent' }, pump);
      el('ellipse', { cx: 0, cy: 2, rx: 34, ry: 7, fill: '#3a2f5b', opacity: .12 }, pump);
      const pumpHead = el('g', {}, pump);
      el('rect', { x: -6, y: -100, width: 12, height: 32, fill: '#e8e0ff' }, pumpHead);
      el('rect', { x: -22, y: -112, width: 44, height: 15, rx: 7, fill: '#fff' }, pumpHead);
      el('rect', { x: 8, y: -110, width: 30, height: 9, rx: 4.5, fill: '#fff' }, pumpHead);
      el('rect', { x: -15, y: -78, width: 30, height: 12, rx: 4, fill: '#ffc4d2' }, pump);
      el('rect', { x: -31, y: -70, width: 62, height: 72, rx: 20, fill: '#ff9ab3' }, pump);
      el('rect', { x: -22, y: -60, width: 10, height: 44, rx: 5, fill: '#fff', opacity: .4 }, pump);
      el('circle', { cx: 4, cy: -32, r: 15, fill: '#fff', opacity: .85 }, pump);
      [[-1, -34, 6], [8, -28, 4.5], [6, -40, 3]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: 'none', stroke: '#7fc8ff', 'stroke-width': 2 }, pump));

      const handsL = el('g', {}, svg);
      const stream = el('g', { 'pointer-events': 'none', opacity: 0 }, svg);
      const streamA = el('path', { d: 'M200,316 L200,446', stroke: '#9fe0ff', 'stroke-width': 18, 'stroke-linecap': 'round', opacity: .85 }, stream);
      const streamB = el('path', { d: 'M196,318 L196,446', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '18 16', opacity: .8 }, stream);
      const towelO = el('g', { transform: 'translate(350 214)' }, svg);
      const towel = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, towelO);
      el('rect', { x: -46, y: -10, width: 92, height: 150, fill: 'transparent' }, towel);
      const towelArt = el('g', {}, towel);
      const haloL = el('g', { 'pointer-events': 'none' }, svg);
      const bubL = el('g', {}, svg);
      const fxL = el('g', { 'pointer-events': 'none' }, svg);
      const ghostL = el('g', {}, svg);
      const ghost = ctx.ghost(ghostL, { x: 350, y: 98, s: .5 });
      const gEyes = ghost.body.querySelector(':scope > g.tb');
      if (gEyes) gEyes.parentNode.insertBefore(el('g', { style: 'transition:translate .25s' }), gEyes).appendChild(gEyes);
      const gArms = [ghost.body.firstElementChild, ghost.armR];

      /* ---------- state ---------- */
      const IDLE = [[114, 606, -7], [286, 606, 7]], WET = [[160, 494, 10], [240, 494, -10]], RUB = [[142, 586, 4], [258, 586, -4]];
      let round = 0, v = null, ch = null, phase = 'enter', rare = false;
      let hands = [], rubE = 0, rubDist = 0, foamDist = 0, bubDist = 0, down = false, lastP = null;
      let waterOn = false, flow = 0, sfxT = 0, sqT = 0, lastLook = [200, 500];
      const bubbles = [], drops = [];

      /* ---------- glowing hint ---------- */
      const haloO = el('g', { opacity: 0 }, haloL);
      const haloI = el('g', { class: 'tb' }, haloO);
      el('circle', { r: 78, fill: 'url(#handwash-halo)' }, haloI);
      el('circle', { r: 62, fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-dasharray': '12 12', 'stroke-linecap': 'round' }, haloI);
      haloI.animate([{ transform: 'scale(.9) rotate(0deg)' }, { transform: 'scale(1.08) rotate(40deg)' }], { duration: 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      const TARGET = { faucet: [252, 300], soap: [62, 346], rub: [200, 560], rinse: [252, 300], towel: [350, 270] };
      function showHalo() {
        const t = TARGET[phase];
        if (!t) { haloO.setAttribute('opacity', 0); return; }
        haloO.setAttribute('transform', `translate(${t[0]} ${t[1]}) scale(${phase === 'rub' ? 1.9 : 1})`);
        haloO.setAttribute('opacity', 1);
        haloO.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
      }
      function setPhase(p) { phase = p; showHalo(); }
      const squash = (node, a = 1.12, ms = 380) => node.animate([{ transform: 'scale(1)' }, { transform: `scale(${a},${2 - a})` }, { transform: `scale(${2 - a + .04},${a - .02})` }, { transform: 'scale(1)' }], { duration: ms, easing: 'ease-out' });
      ctx.every(2300, () => {
        const tg = TARGET[phase];
        if (tg) ctx.sparkle(tg[0], tg[1], 2, phase === 'rub' ? 90 : 46, '#fff6b0');
        if (phase === 'faucet' || phase === 'rinse') squash(faucet, 1.06);
        else if (phase === 'soap') squash(pump, 1.1);
        else if (phase === 'towel') towel.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0deg)' }], { duration: 600 });
        else if (phase === 'rub') hands.forEach(h => squash(h.inner, 1.05));
      });

      /* ---------- hands ---------- */
      function makeHand(side, i) {
        const outer = el('g', {}, handsL);
        const inner = el('g', { class: 'tb', style: 'transform-origin:50% 22%' }, outer);
        const sc = el('g', { transform: `scale(${v.s})` }, inner);
        hwHand(sc, v, side);
        const mudG = el('g', {}, sc), germG = el('g', {}, sc), foamG = el('g', {}, sc), wetG = el('g', { opacity: 0 }, sc), shineG = el('g', {}, sc);
        for (let k = 0; k < 6; k++) el('ellipse', { cx: rand(-40, 40).toFixed(0), cy: rand(-70, 40).toFixed(0), rx: 3.2, ry: 4.6, fill: '#fff', opacity: .85, stroke: '#9fe0ff', 'stroke-width': 1.5 }, wetG);
        const [x, y, r] = IDLE[i];
        return { side, i, outer, inner, mudG, germG, foamG, wetG, shineG, x, y: y + 480, r, tx: x, ty: y, tr: r, germs: [], foam: [], muds: [] };
      }
      function toGlobal(h, lx, ly) {
        const a = h.r * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
        lx *= v.s; ly *= v.s;
        return [h.x + c * lx - s * ly, h.y + s * lx + c * ly];
      }
      function aim(pose) { hands.forEach((h, i) => { [h.tx, h.ty, h.tr] = pose[i]; }); }
      function dirty() {
        const spots = SPOTS[v.kind];
        let n = 0;
        hands.forEach((h, hi) => {
          const order = [...spots.keys()].sort(() => Math.random() - .5);
          const ng = 2 + ((round + hi) % 2);
          order.forEach((si, k) => {
            const [sx, sy] = spots[si], lx = sx * h.side, ly = sy;
            if (k < ng) {
              const outer = el('g', { transform: `translate(${lx} ${ly})` }, h.germG);
              const inner = el('g', { class: 'tb' }, outer);
              const face = hwGerm(inner, GERMC[(n + round) % GERMC.length], (n + round) % 3);
              const germ = { outer, inner, face, lx, ly, hp: 1, hand: h, dead: false };
              h.germs.push(germ);
              const d = n * 140 + 350; n++;
              inner.style.opacity = 0;
              ctx.after(d, () => {
                inner.style.opacity = '';
                inner.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.3,.8)', offset: .55 }, { transform: 'scale(.9,1.1)', offset: .8 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' }).onfinish = () => {
                  if (!germ.dead) inner.animate([{ transform: 'rotate(-9deg) scale(1)' }, { transform: 'rotate(9deg) scale(1.05,.95)' }], { duration: rand(520, 760), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
                };
                A.sfx('blink', { rate: rand(.9, 1.3), vol: .5 }) || A.osc(mtof(PENTA[(n % 6) + 3]), { type: 'triangle', r: .12, vol: .14 });
              });
            } else if (k < ng + 2) {
              const g = el('g', { transform: `translate(${lx} ${ly}) rotate(${rand(0, 360).toFixed(0)}) scale(${rand(.8, 1.1).toFixed(2)})` }, h.mudG);
              hwMud(g);
              h.muds.push(g);
            }
          });
        });
      }
      function addFoam(h, n = 1) {
        for (let k = 0; k < n; k++) {
          if (h.foam.length >= 11) {
            const f = pick(h.foam);
            f.s = Math.min(1.55, f.s + .12);
            f.g.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) scale(${f.s.toFixed(2)})`);
            continue;
          }
          const alive = h.germs.filter(q => !q.dead);
          const near = alive.length && Math.random() < .5 ? pick(alive) : null;
          const x = near ? near.lx + rand(-16, 16) : rand(-40, 40), y = near ? near.ly + rand(-14, 14) : rand(-66, 44);
          const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, h.foamG);
          const inner = el('g', { class: 'tb' }, g);
          hwFoam(inner, rare);
          inner.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.3)', offset: .6 }, { transform: 'scale(1)' }], { duration: 280, easing: 'ease-out' });
          h.foam.push({ g, inner, x, y, s: 1 });
        }
      }

      /* ---------- the washer ---------- */
      function makeChar() {
        if (v.kind === 'kid') ch = hwKid(charL, v, ctx);
        else if (v.kind === 'paw') ch = hwPet(charL, v);
        else {
          const G = ghost;
          ch = {
            set(e) { G.set(e === 'wow' ? 'surprise' : e); },
            look(dx, dy) { if (gEyes) gEyes.parentNode.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`; },
            blink() {}, voice() { G.giggle(); },
            b: G.body, remove() {}
          };
        }
        ch.set('normal');
      }
      function ghostHome(intoMirror, done) {
        if (intoMirror) {
          gArms.forEach(a => a.style.display = 'none');
          ghost.moveTo(200, 230, 1.32, 700, () => { charL.appendChild(ghost.pos); if (done) done(); }, easeInOut);
        } else {
          const wasIn = ghost.pos.parentNode === charL;
          ghostL.appendChild(ghost.pos);
          gArms.forEach(a => a.style.display = '');
          if (gEyes) gEyes.parentNode.style.translate = '';
          if (wasIn) { A.sfx('spring', { vol: .45 }); }
          ghost.moveTo(350, 98, .5, 700, done, easeInOut);
        }
      }
      const charSet = (e, ms) => { ch.set(e); if (ms) ctx.after(ms, () => { if (phase !== 'party' && phase !== 'enter') ch.set('normal'); }); };
      const lookAt = (x, y) => {
        lastLook = [x, y];
        if (!ch) return;
        ch.look(clamp((x - 200) / 28, -6, 6), clamp((y - 214) / 70, -3, 5));
        refl.style.translate = `${clamp((200 - x) / 40, -5, 5).toFixed(1)}px 0px`;
      };
      (function blinkLoop() { ctx.after(rand(2000, 5000), () => { if (ch) ch.blink(); blinkLoop(); }); })();

      /* ---------- round flow ---------- */
      function startRound(first) {
        v = VARS[ORDER[round % ORDER.length]];
        rare = round > 1 && Math.random() < 1 / 6;
        tileA.setAttribute('fill', v.wall[0]); tileB.setAttribute('fill', v.wall[1]);
        towelArt.replaceChildren(); hwTowel(towelArt, v.towel);
        hands = [makeHand(-1, 0), makeHand(1, 1)];
        aim(IDLE);
        dirty();
        rubDist = 0; foamDist = 0;
        const greet = () => {
          if (v.kind === 'powan') ghost.talk('ぽわんの おてて！');
          else if (v.kind === 'paw') { ch.voice(); ctx.after(500, () => ghost.talk(v.animal === 'dog' ? 'わんちゃん だよ' : 'ねこちゃん だよ')); }
          else ghost.talk(first ? 'おてて あらおう！' : 'また きたよ！');
          ctx.after(900, () => { setPhase('faucet'); hands.forEach(h => squash(h.inner, 1.1)); });
        };
        if (v.kind === 'powan') ghostHome(true, () => { makeChar(); greet(); });
        else { makeChar(); greet(); }
        A.sfx('whoosh', { vol: .5 });
      }
      function nextRound() {
        setPhase('enter');
        const old = hands;
        old.forEach(h => { h.ty = h.y + 520; });
        ctx.after(700, () => old.forEach(h => h.outer.remove()));
        // the mirror shimmers and shows someone new
        A.sfx('sparkle', { vol: .4, rate: 1.2 });
        flash.animate([{ opacity: 0 }, { opacity: .95, offset: .45 }, { opacity: .95, offset: .55 }, { opacity: 0 }], { duration: 900 });
        ctx.after(420, () => {
          if (ch) ch.remove();
          ch = null;
          round++;
          const nextIsPowan = VARS[ORDER[round % ORDER.length]].kind === 'powan';
          if (v.kind === 'powan') ghostHome(false, () => ctx.after(100, () => startRound(false)));
          else if (nextIsPowan) startRound(false);
          else ctx.after(250, () => startRound(false));
        });
      }

      /* 1. water on */
      function setWater(on) {
        waterOn = on;
        knob.animate([{ transform: `rotate(${on ? 0 : 90}deg)` }, { transform: `rotate(${on ? 100 : -10}deg)` }, { transform: `rotate(${on ? 90 : 0}deg)` }], { duration: 320, fill: 'forwards', easing: 'ease-out' });
        if (on) { if (!A.sfx('pour', { vol: .65, rate: rand(.95, 1.08) })) A.noise({ type: 'lowpass', from: 900, to: 1700, dur: 1.6, vol: .15 }); }
        else A.osc(1300, { slide: 800, slideT: .1, r: .08, vol: .07 });
        squash(faucet, 1.08);
      }
      function wet() {
        setPhase('busy');
        setWater(true);
        ghost.talk('ざあー');
        ctx.after(250, () => aim(WET));
        ctx.after(700, () => { hands.forEach(h => h.wetG.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' })); A.sfx('splash', { vol: .3, rate: 1.2 }); charSet('happy', 900); });
        ctx.after(1700, () => { setWater(false); aim(IDLE); });
        ctx.after(2200, () => setPhase('soap'));
      }
      /* 2. soap */
      function soap() {
        setPhase('busy');
        squash(pump, 1.18, 420);
        pumpHead.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(16px)' }, { transform: 'translateY(0px)' }], { duration: 360, easing: 'ease-out' });
        A.sfx('blink', { vol: .7 }); A.sfx('squish', { vol: .7, when: .08 }) || A.osc(360, { slide: 820, slideT: .1, r: .12, vol: .14, wet: .2 });
        const h = hands[0], [gx, gy] = toGlobal(h, 0, 0);
        const blob = el('g', {}, fxL);
        const bi = el('g', { class: 'tb' }, blob);
        hwFoam(bi, rare); hwFoam(bi, rare);
        const sx = 98, sy = 296;
        ctx.tween(520, k => blob.setAttribute('transform', `translate(${(sx + (gx - sx) * k).toFixed(1)} ${(sy + (gy - sy) * k - Math.sin(k * Math.PI) * 70).toFixed(1)}) scale(${(.6 + k * .7).toFixed(2)})`), () => {
          blob.remove();
          addFoam(hands[0], 3); addFoam(hands[1], 2);
          squash(hands[0].inner, 1.14);
          A.sfx('plop', { vol: .7 }) || A.sfx('bubble', { vol: .7, rate: .9 });
          ctx.sparkle(gx, gy, 3, 30, '#ffffff');
          charSet('wow', 600);
          ghost.talk('あわあわ');
          aim(RUB);
          ctx.after(400, () => setPhase('rub'));
        }, k => k);
      }
      /* 3. rub-a-dub */
      function rubSound() {
        const now = performance.now();
        if (now - sfxT > 520) { sfxT = now; A.sfx('bubbles', { rate: rand(.9, 1.25), vol: .5 }) || A.noise({ type: 'bandpass', from: 1800, dur: .3, vol: .1 }); }
        if (now - sqT > 260) { sqT = now; if (!A.sfx('squish', { rate: rand(.9, 1.3), vol: .45 })) { const f = rand(420, 720); A.osc(f, { slide: f * 1.6, slideT: .06, r: .08, vol: .08, wet: .15 }); } }
      }
      function aliveGerms() { return hands.flatMap(h => h.germs.filter(q => !q.dead)); }
      function nearestGerm(p) {
        let best = null, bd = 1e9;
        aliveGerms().forEach(q => { const [x, y] = toGlobal(q.hand, q.lx, q.ly); const d = Math.hypot(x - p.x, y - p.y); if (d < bd) { bd = d; best = q; } });
        return best;
      }
      function wobble(q) {
        q.inner.animate([{ transform: 'translateX(0px) rotate(0deg)' }, { transform: 'translateX(-5px) rotate(-18deg) scale(1.1,.9)' }, { transform: 'translateX(5px) rotate(18deg) scale(.9,1.1)' }, { transform: 'translateX(0px) rotate(0deg)' }], { duration: 220, composite: 'add' });
      }
      function fadeMud() {
        const k = clamp(1 - rubDist / 700, 0, 1);
        hands.forEach(h => h.muds.forEach(m => m.setAttribute('opacity', k.toFixed(2))));
      }
      function popGerm(q) {
        if (q.dead) return;
        q.dead = true;
        const h = q.hand, [gx, gy] = toGlobal(h, q.lx, q.ly);
        q.face.norm.style.display = 'none'; q.face.funny.style.display = '';
        q.inner.getAnimations().forEach(a => a.cancel());
        q.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4,.7)' }, { transform: 'scale(.85,1.25)' }, { transform: 'scale(1)' }], { duration: 300 });
        fxL.appendChild(q.outer);
        q.outer.setAttribute('transform', `translate(${gx.toFixed(1)} ${gy.toFixed(1)}) scale(${v.s})`);
        A.sfx('pop', { rate: rand(.9, 1.3), vol: .8 }) || A.pop();
        A.osc(700, { type: 'triangle', slide: 1500, slideT: .1, r: .12, vol: .1 });
        haptic(18);
        ctx.sparkle(gx, gy, 3, 26, '#ffffff');
        makeBubble(gx + rand(-20, 20), gy - 20, rand(14, 22));
        charSet('wow', 500);
        ctx.after(230, () => {
          A.sfx('cutie', { vol: .45, rate: rand(.9, 1.3) });
          A.osc(420, { slide: 1300, slideT: .6, r: .3, vol: .07, vib: 7, vibD: .05 });
          const dir = gx < 200 ? -1 : 1, far = rand(80, 140);
          ctx.tween(1300, k => {
            q.outer.setAttribute('transform', `translate(${(gx + dir * far * k + Math.sin(k * 14) * 10).toFixed(1)} ${(gy - k * (gy + 80)).toFixed(1)}) rotate(${(dir * k * 220).toFixed(0)}) scale(${(v.s * (1 - k * .3)).toFixed(2)})`);
            q.outer.setAttribute('opacity', clamp(2.2 - k * 2.2, 0, 1).toFixed(2));
          }, () => q.outer.remove(), easeIn);
        });
        const left = aliveGerms().length;
        if (!left) ctx.after(650, toRinse);
        else if (Math.random() < .4) ghost.talk(pick(['ばいばーい', 'ごしごし', 'すごーい！']), false);
      }
      function rubTap(p) {
        rubE = 1;
        hands.forEach(h => { addFoam(h, 2); squash(h.inner, 1.08, 300); });
        for (let k = 0; k < 2; k++) makeBubble(rand(120, 280), rand(440, 520), rand(12, 22));
        rubSound();
        rubDist += 120; fadeMud();
        const q = nearestGerm(p);
        if (q && !q.dying) { q.dying = true; wobble(q); ctx.after(110, () => wobble(q)); ctx.after(240, () => popGerm(q)); }
        charSet('happy', 700);
      }
      function rubDrag(p, d) {
        rubE = Math.min(1, rubE + d / 50);
        rubDist += d; foamDist += d; bubDist += d;
        fadeMud();
        rubSound();
        if (foamDist > 26) { foamDist = 0; addFoam(pick(hands)); }
        if (bubDist > 80) { bubDist = 0; makeBubble(clamp(p.x + rand(-30, 30), 40, 360), Math.min(p.y, 520) - 30, rand(12, 22)); }
        const q = nearestGerm(p);
        if (q && !q.dying) {
          q.hp -= d / 140;
          if (Math.random() < .35) wobble(q);
          if (q.hp <= 0) { q.dying = true; popGerm(q); }
        }
        charSet('happy', 800);
      }
      /* 4. rinse */
      function toRinse() {
        hands.forEach(h => { while (h.foam.length < 6) addFoam(h); });
        ghost.set('happy'); ghost.hop();
        ghost.talk('ながそうね');
        ctx.after(1200, () => ghost.set('normal'));
        setPhase('rinse');
      }
      function rinse() {
        setPhase('busy');
        setWater(true);
        aim(WET);
        ctx.after(350, () => {
          const all = hands.flatMap(h => h.foam.map(f => ({ f, h })));
          all.sort(() => Math.random() - .5);
          all.forEach(({ f, h }, i) => ctx.after(i * 70, () => {
            f.inner.animate([{ transform: 'translate(0px,0px) scale(1)', opacity: 1 }, { transform: `translate(${rand(-8, 8).toFixed(0)}px,${rand(60, 110).toFixed(0)}px) scale(.4)`, opacity: 0 }], { duration: 520, fill: 'forwards', easing: 'ease-in' }).onfinish = () => f.g.remove();
            if (i % 3 === 0) { A.sfx('blub', { rate: rand(.9, 1.4), vol: .45 }) || A.osc(rand(700, 1200), { r: .05, vol: .05, wet: .2 }); splash(rand(150, 250), 2); }
          }));
          hands.forEach(h => { h.foam = []; h.muds.forEach(m => m.animate([{ opacity: +m.getAttribute('opacity') || 0 }, { opacity: 0 }], { duration: 600, fill: 'forwards' })); });
          A.sfx('splash2', { vol: .35 });
          ctx.after(all.length * 70 + 300, () => {
            hands.forEach(h => h.wetG.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' }));
            setWater(false); aim(IDLE);
            charSet('happy', 900);
            ctx.after(500, () => { ghost.talk('ふきふき しよう'); setPhase('towel'); });
          });
        });
      }
      /* 5. towel */
      function dry() {
        setPhase('busy');
        A.sfx('whoosh2', { vol: .5 });
        aim(RUB);
        towelO.parentNode.appendChild(towelO);
        const from = [350, 214];
        ctx.tween(480, k => towelO.setAttribute('transform', `translate(${(from[0] + (200 - from[0]) * k).toFixed(1)} ${(from[1] + (420 - from[1]) * k).toFixed(1)}) rotate(${(-14 * Math.sin(k * Math.PI)).toFixed(1)}) scale(${(1 + 1.5 * k).toFixed(2)},${(1 + 1.1 * k).toFixed(2)})`), () => {
          let i = 0;
          const swipe = () => {
            const dir = i % 2 ? -1 : 1;
            A.sfx('whoosh', { vol: .35, rate: rand(1.1, 1.4) }); A.noise({ type: 'lowpass', from: 600, dur: .25, vol: .08 });
            squash(towel, 1.06, 260);
            ctx.tween(260, k => towelO.setAttribute('transform', `translate(${(200 + dir * 26 * Math.sin(k * Math.PI)).toFixed(1)} 420) scale(2.5,2.1)`));
            hands.forEach(h => squash(h.inner, 1.05, 260));
            if (++i < 5) ctx.after(270, swipe);
            else ctx.after(300, back);
          };
          hands.forEach(h => h.wetG.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, fill: 'forwards' }));
          charSet('happy');
          say('ふきふき');
          swipe();
        }, easeOut);
        function back() {
          aim(IDLE);
          ctx.tween(460, k => towelO.setAttribute('transform', `translate(${(200 + (from[0] - 200) * k).toFixed(1)} ${(420 + (from[1] - 420) * k).toFixed(1)}) scale(${(2.5 - 1.5 * k).toFixed(2)},${(2.1 - 1.1 * k).toFixed(2)})`), () => {
            towelO.setAttribute('transform', `translate(${from[0]} ${from[1]})`);
            towel.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0deg)' }], { duration: 500 });
            A.boing();
            clean();
          }, easeInOut);
        }
      }
      /* 6. sparkling clean */
      function clean() {
        setPhase('party');
        A.sfx('starshine', { vol: .6 }) || A.sfx('sparkle', { vol: .6 });
        hands.forEach(h => {
          [[-30, -50, 1], [26, -10, .8], [-8, 30, .7]].forEach(([x, y, s], i) => {
            const o = el('g', { transform: `translate(${x * h.side} ${y}) scale(${s})` }, h.shineG);
            el('path', { d: 'M0,-15 Q2,-2 15,0 Q2,2 0,15 Q-2,2 -15,0 Q-2,-2 0,-15Z', fill: '#fff', class: 'twinkle', style: `animation-delay:-${i * .6}s` }, o);
          });
          const [x, y] = toGlobal(h, 0, -20);
          ctx.sparkle(x, y, 4, 50, '#ffffff');
        });
        ch.set('happy');
        ctx.after(650, payoff);
      }
      function payoff() {
        A.tada(); haptic(30);
        ctx.confetti(200, 560, 36);
        ctx.after(500, () => ctx.confetti(200, 300, 30));
        ch.voice(); ch.set('happy');
        if (ch.b) squash(ch.b, 1.1, 500);
        hands.forEach((h, i) => h.inner.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${i ? 14 : -14}deg)` }, { transform: `rotate(${i ? -10 : 10}deg)` }], { duration: 340, iterations: 6, direction: 'alternate', easing: 'ease-in-out' }));
        if (rare) rainbow();
        ghost.set('happy');
        ghost.talk('ぴかぴか！');
        if (v.kind === 'powan') {
          ghost.hop(); ctx.after(450, () => ghost.giggle()); ctx.after(900, () => ghost.swing(40, 300)); ctx.after(1400, () => ghost.hop());
        } else {
          ghost.hop();
          ctx.tween(1300, k => ghost.place(350 - Math.sin(k * Math.PI) * 70, 98 + Math.sin(k * Math.PI) * 40 - Math.abs(Math.sin(k * Math.PI * 3)) * 26, .5 + Math.sin(k * Math.PI) * .08), () => ghost.giggle(), easeInOut);
        }
        ctx.after(1300, () => { A.twinkle(); hands.forEach(h => { const [x, y] = toGlobal(h, 0, -30); ctx.sparkle(x, y, 4, 50); }); });
        ctx.after(3000, () => { ghost.set('normal'); nextRound(); });
      }
      function rainbow() {
        const g = el('g', { opacity: 0 }, fxL);
        PARTY.forEach((c, i) => el('path', { d: `M${40 + i * 10},400 A${160 - i * 10},${170 - i * 10} 0 0 1 ${360 - i * 10},400`, stroke: c, 'stroke-width': 10, fill: 'none', opacity: .8 }, g));
        g.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: 2800 }).onfinish = () => g.remove();
        A.sfx('jingle', { vol: .3 });
      }

      /* ---------- water + bubbles ---------- */
      function splash(x, n = 4) {
        for (let i = 0; i < n; i++) {
          if (drops.length > 40) return;
          const node = el('circle', { r: rand(2.5, 5).toFixed(1), fill: '#bff0ff', stroke: '#7fd0ff', 'stroke-width': 1.5 }, fxL);
          drops.push({ node, x: x + rand(-12, 12), y: 444, vx: rand(-120, 120), vy: rand(-300, -160), life: .8 });
        }
      }
      function makeBubble(x, y, r) {
        if (bubbles.length >= 10) return;
        const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, bubL);
        const inner = el('g', { class: 'tb' }, g);
        el('circle', { r: Math.max(34, r + 12), fill: 'transparent' }, inner);
        el('circle', { r, fill: 'url(#handwash-bub)', stroke: rare ? pick(PARTY) : '#fff', 'stroke-width': 2 }, inner);
        el('ellipse', { cx: -r * .38, cy: -r * .4, rx: r * .26, ry: r * .16, fill: '#fff', transform: `rotate(-35 ${(-r * .38).toFixed(1)} ${(-r * .4).toFixed(1)})` }, inner);
        inner.animate([{ transform: 'scale(.2)' }, { transform: 'scale(1.15)', offset: .7 }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
        const b = { g, x0: x, x, y, r, ph: rand(0, 6), sp: rand(36, 60) };
        bubbles.push(b);
        g.addEventListener('pointerdown', () => {
          if (b.dead) return;
          popped = true;
          b.dead = true; haptic(8);
          A.sfx(pick(['pop', 'bubble']), { rate: rand(.9, 1.35), vol: .7 }) || A.pop();
          bubbles.splice(bubbles.indexOf(b), 1);
          inner.replaceChildren();
          const ring = el('circle', { r, fill: 'none', stroke: '#fff', 'stroke-width': 3, class: 'tb' }, inner);
          ring.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.8)', opacity: 0 }], { duration: 260 }).onfinish = () => g.remove();
          ctx.sparkle(b.x, b.y, 3, r, rare ? pick(PARTY) : '#ffffff');
          lookAt(b.x, b.y);
        });
      }
      function drip() {
        if (waterOn) return;
        const node = el('path', { d: 'M0,-7 Q5,0 5,3 A5,5 0 0 1 -5,3 Q-5,0 0,-7Z', fill: '#9fe0ff', stroke: '#fff', 'stroke-width': 1.5 }, fxL);
        let y = 322, vy = 0;
        const stop = ctx.loop(dt => {
          vy += 900 * dt; y += vy * dt;
          node.setAttribute('transform', `translate(200 ${y.toFixed(1)})`);
          if (y > 444) { stop(); node.remove(); A.sfx('plink', { vol: .12, rate: rand(1.3, 1.6) }) || A.osc(1500, { slide: 2300, slideT: .05, r: .06, vol: .04, wet: .5 }); }
        });
      }
      ctx.every(3100, drip);
      ctx.every(1500, () => { if (bubbles.length < 5) makeBubble(rand(90, 310), 440, rand(12, 22)); });
      ctx.every(5200, () => {
        ctx.tween(900, k => glint.setAttribute('transform', `translate(${(80 + 300 * k).toFixed(0)} 0)`), () => glint.setAttribute('transform', 'translate(-200 0)'), easeInOut);
      });
      glint.setAttribute('transform', 'translate(-200 0)');

      /* ---------- input ---------- */
      let popped = false;
      function ambient(p) {
        if (popped) return;
        makeBubble(p.x, p.y, rand(14, 24));
        A.sfx('bubble', { rate: rand(.9, 1.4), vol: .5 }) || A.pop();
      }
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e);
        if (p.x < 80 && p.y < 80) return;
        haptic(6);
        lookAt(p.x, p.y);
        down = true; lastP = p;
        if (ghost.pos.contains(e.target)) { ghost.giggle(); ctx.after(900, () => { if (phase !== 'party') ghost.set(v && v.kind === 'powan' && phase === 'party' ? 'happy' : 'normal'); }); }
        else if (ch && ch.b && ch.b.contains(e.target) && v.kind !== 'powan') { ch.voice(); squash(ch.b, 1.08); }
        if (phase === 'faucet') wet();
        else if (phase === 'soap') soap();
        else if (phase === 'rub') rubTap(p);
        else if (phase === 'rinse') rinse();
        else if (phase === 'towel') dry();
        else ambient(p);
        popped = false;
      });
      ctx.on(ctx.host, 'pointermove', e => {
        if (!down) return;
        const p = ctx.point(e);
        const d = Math.hypot(p.x - lastP.x, p.y - lastP.y);
        if (d < 3) return;
        lastP = p; lookAt(p.x, p.y);
        if (phase === 'rub' && p.y > 360) rubDrag(p, Math.min(d, 40));
      });
      const up = () => { down = false; };
      ctx.on(window, 'pointerup', up);
      ctx.on(window, 'pointercancel', up);

      /* ---------- frame loop ---------- */
      ctx.loop((dt, t) => {
        rubE = Math.max(0, rubE - dt * 2);
        hands.forEach(h => {
          const f = Math.min(1, dt * 8);
          h.x += (h.tx - h.x) * f; h.y += (h.ty - h.y) * f; h.r += (h.tr - h.r) * f;
          const w = Math.sin(t * 19 + (h.side > 0 ? Math.PI : 0)) * rubE;
          const bob = Math.sin(t * 1.7 + h.i * 1.3) * 3;
          h.outer.setAttribute('transform', `translate(${(h.x + w * 9).toFixed(1)} ${(h.y + w * 12 + bob).toFixed(1)}) rotate(${(h.r + w * 6).toFixed(1)})`);
        });
        flow += ((waterOn ? 1 : 0) - flow) * Math.min(1, dt * 10);
        stream.setAttribute('opacity', flow.toFixed(2));
        streamA.setAttribute('stroke-width', (6 + flow * 12).toFixed(1));
        streamB.setAttribute('stroke-dashoffset', (-t * 420 % 34).toFixed(1));
        basinWater.setAttribute('rx', (flow * 90).toFixed(1)); basinWater.setAttribute('ry', (flow * 16).toFixed(1));
        if (waterOn && Math.random() < .3) splash(200, 1);
        cloud.setAttribute('transform', `translate(${(250 + ((t * 8) % 70)).toFixed(1)} 120)`);
        for (let i = drops.length - 1; i >= 0; i--) {
          const q = drops[i];
          q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt;
          if (q.life <= 0) { q.node.remove(); drops.splice(i, 1); continue; }
          q.node.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
        }
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.y -= b.sp * dt; b.x = b.x0 + Math.sin(t * 1.4 + b.ph) * 14;
          if (b.y < -60) { b.g.remove(); bubbles.splice(i, 1); continue; }
          b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
        }
      });

      startRound(true);
      [[110, 430, 16], [300, 400, 20], [330, 470, 13]].forEach(([x, y, r], i) => ctx.after(i * 200, () => makeBubble(x, y, r)));
      ctx.hint = () => TARGET[phase] || null;
    }
  };
  TOYS.push(handwashToy);
})();
