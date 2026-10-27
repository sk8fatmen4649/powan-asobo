'use strict';
/* =========================================================
   toy: はみがき — brush the germs off big friendly teeth
   three friends rotate: hippo, crocodile, lion
   dirty → foamy → shiny, then a look in the mirror
   ========================================================= */
(() => {
  const INK = '#3a2f5b';
  const GEOM = (() => {
    const MX = 200, MY = 440, MRX = 148, MRY = 140, SY = 285, SRX = 172, SRY = 72, W = 56, H = 70;
    const list = [];
    [-98, -34, 34, 98].forEach((dx, i) => {
      const snoutBot = SY + SRY * Math.sqrt(1 - (dx / SRX) ** 2);
      const top = snoutBot - 14;
      list.push({ i, up: true, x: 200 + dx, top, h: H, cx: 200 + dx, cy: (snoutBot + top + H) / 2 });
    });
    [-98, -34, 34, 98].forEach((dx, i) => {
      const mBot = MY + MRY * Math.sqrt(1 - (dx / MRX) ** 2);
      const top = mBot - H + 6;
      list.push({ i: i + 4, up: false, x: 200 + dx, top, h: H + 10, cx: 200 + dx, cy: (top + mBot) / 2 });
    });
    return { MX, MY, MRX, MRY, SY, SRX, SRY, W, list };
  })();
  const CHARS = [
    { key: 'hippo', skin: '#b9a8f4', snout: '#c8bbf8', dark: '#8f7ad8', bg: '#b8f0d8', dot: '#d8fbec', teeth: 'round' },
    { key: 'croc', skin: '#7fcf6a', snout: '#8fdc78', dark: '#4fa845', bg: '#bfe6ff', dot: '#dcf2ff', teeth: 'fang' },
    { key: 'lion', skin: '#ffc65a', snout: '#fff0c8', dark: '#e8913a', bg: '#ffe6c4', dot: '#fff3e2', teeth: 'lion' }
  ];
  let uid = 0;

  /* ---------- tooth shapes ---------- */
  function toothPath(t, shape) {
    const w = GEOM.W, l = t.x - w / 2, r = t.x + w / 2, top = t.top, h = t.h;
    const fang = shape === 'fang' || (shape === 'lion' && t.up && (t.i === 0 || t.i === 3));
    if (!fang) {
      const R = 20;
      return `M${l + R},${top} L${r - R},${top} Q${r},${top} ${r},${top + R} L${r},${top + h - R} Q${r},${top + h} ${r - R},${top + h} L${l + R},${top + h} Q${l},${top + h} ${l},${top + h - R} L${l},${top + R} Q${l},${top} ${l + R},${top}Z`;
    }
    if (t.up) return `M${l},${top} L${r},${top} L${r},${top + h * .4} Q${r - 4},${top + h * .8} ${t.x},${top + h} Q${l + 4},${top + h * .8} ${l},${top + h * .4}Z`;
    const b = top + h;
    return `M${l},${b} L${r},${b} L${r},${b - h * .45} Q${r - 4},${b - h * .85} ${t.x},${top + 4} Q${l + 4},${b - h * .85} ${l},${b - h * .45}Z`;
  }

  /* ---------- the three friends: same mouth, different faces ---------- */
  function buildChar(g, defs, c) {
    const G = GEOM, P = {};
    const id = 'teeth-mouth' + (uid++);
    if (c.key === 'hippo') {
      [-1, 1].forEach(s => {
        const x = 200 + s * 102;
        el('ellipse', { cx: x, cy: 118, rx: 24, ry: 28, fill: c.skin, transform: `rotate(${s * 22} ${x} 118)` }, g);
        el('ellipse', { cx: x, cy: 120, rx: 12, ry: 16, fill: '#ffb3c8', transform: `rotate(${s * 22} ${x} 120)` }, g);
      });
    } else if (c.key === 'lion') {
      for (let k = 0; k < 18; k++) {
        const a = k / 18 * Math.PI * 2, rx = 152, ry = 140;
        el('circle', { cx: (200 + Math.cos(a) * rx).toFixed(1), cy: (262 + Math.sin(a) * ry).toFixed(1), r: 46, fill: k % 2 ? '#f0913a' : '#e8803a' }, g);
      }
      [-1, 1].forEach(s => {
        el('circle', { cx: 200 + s * 104, cy: 128, r: 28, fill: c.skin }, g);
        el('circle', { cx: 200 + s * 104, cy: 130, r: 15, fill: '#ffb3a0' }, g);
      });
    }
    el('ellipse', { cx: 200, cy: 200, rx: c.key === 'croc' ? 150 : 132, ry: c.key === 'croc' ? 80 : 96, fill: c.skin }, g);
    el('ellipse', { cx: 200, cy: 650, rx: 160, ry: 22, fill: INK, opacity: .1 }, g);
    el('ellipse', { cx: 200, cy: 470, rx: 178, ry: 175, fill: c.skin }, g);
    el('ellipse', { cx: 120, cy: 560, rx: 30, ry: 14, fill: '#fff', opacity: .18, transform: 'rotate(30 120 560)' }, g);
    el('ellipse', { cx: G.MX, cy: G.MY, rx: G.MRX, ry: G.MRY, fill: '#d4566f' }, g);
    el('ellipse', { cx: 200, cy: 455, rx: 92, ry: 58, fill: '#a83552' }, g);
    const clip = el('clipPath', { id }, defs); el('ellipse', { cx: G.MX, cy: G.MY, rx: G.MRX, ry: G.MRY }, clip);
    const clipped = el('g', { 'clip-path': `url(#${id})` }, g);
    P.clip = clip;
    el('ellipse', { cx: 200, cy: 556, rx: 96, ry: 44, fill: '#ff8fa3' }, clipped);
    el('path', { d: 'M200,528 Q198,550 200,570', stroke: '#f0758e', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, clipped);
    P.water = el('ellipse', { cx: 200, cy: 560, rx: 150, ry: 0, fill: '#9fe0ff', opacity: .85 }, clipped);
    P.lower = el('g', {}, clipped);
    P.mouthFx = el('g', {}, clipped);
    P.upper = el('g', {}, g);
    el('ellipse', { cx: 200, cy: G.SY, rx: G.SRX, ry: G.SRY, fill: c.snout }, g);
    el('ellipse', { cx: 140, cy: 240, rx: 40, ry: 12, fill: '#fff', opacity: .35, transform: 'rotate(-10 140 240)' }, g);
    if (c.key === 'lion') {
      el('path', { d: 'M178,236 L222,236 Q222,256 200,264 Q178,256 178,236Z', fill: '#8a4a3a' }, g);
      el('ellipse', { cx: 192, cy: 242, rx: 6, ry: 3, fill: '#fff', opacity: .4 }, g);
      el('path', { d: 'M200,264 L200,282 M200,282 Q186,294 172,286 M200,282 Q214,294 228,286', stroke: '#8a4a3a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
      [-1, 1].forEach(s => [0, 1, 2].forEach(k => el('circle', { cx: 200 + s * (60 + k * 16), cy: 276 + k * 6, r: 3, fill: '#d9a050' }, g)));
    } else {
      [-1, 1].forEach(s => el('ellipse', { cx: 200 + s * 38, cy: 262, rx: 11, ry: 7.5, fill: c.dark, transform: `rotate(${s * 12} ${200 + s * 38} 262)` }, g));
      if (c.key === 'croc') [[120, 300], [150, 318], [250, 318], [280, 300], [200, 230], [170, 250], [230, 250]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 7, ry: 5, fill: '#6cbf58' }, g));
    }
    P.cheeks = [-1, 1].map(s => el('ellipse', { cx: 200 + s * 128, cy: 300, rx: 20, ry: 12, fill: '#ffa3b8', opacity: .8, class: 'tb' }, g));
    // eyes
    const EY = c.key === 'croc' ? 120 : 146, EX = c.key === 'croc' ? 66 : 60;
    if (c.key === 'croc') [-1, 1].forEach(s => { el('circle', { cx: 200 + s * EX, cy: EY + 6, r: 40, fill: c.skin }, g); el('ellipse', { cx: 200 + s * EX - 12, cy: EY - 20, rx: 10, ry: 6, fill: '#fff', opacity: .3 }, g); });
    else [-1, 1].forEach(s => el('circle', { cx: 200 + s * EX, cy: EY, r: 32, fill: c.skin }, g));
    P.eyesN = el('g', { class: 'tb' }, g);
    P.eyesH = el('g', { style: 'display:none' }, g);
    P.pupils = el('g', {}, P.eyesN);
    [-1, 1].forEach(s => {
      const x = 200 + s * EX;
      if (c.key === 'croc') {
        el('ellipse', { cx: x, cy: EY + 2, rx: 24, ry: 26, fill: '#fffbe6' }, P.eyesN);
        P.eyesN.appendChild(P.pupils);
        el('ellipse', { cx: x, cy: EY + 4, rx: 11, ry: 15, fill: INK }, P.pupils);
        el('circle', { cx: x - 4, cy: EY - 2, r: 4.4, fill: '#fff' }, P.pupils);
      } else {
        el('ellipse', { cx: x, cy: EY - 4, rx: 12, ry: 15, fill: INK }, P.pupils);
        el('circle', { cx: x - 4, cy: EY - 10, r: 4.6, fill: '#fff' }, P.pupils);
        el('circle', { cx: x + 4, cy: EY + 2, r: 2, fill: '#fff' }, P.pupils);
      }
      el('path', { d: `M${x - 14},${EY} Q${x},${EY - 16} ${x + 14},${EY}`, stroke: INK, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, P.eyesH);
    });
    return P;
  }
  function makeTooth(parent, t, shape) {
    const g = el('g', {}, parent), d = toothPath(t, shape), w = GEOM.W;
    el('path', { d, fill: '#fffdf7' }, g);
    el('rect', { x: t.x - w / 2 + 9, y: t.up ? t.top + 18 : t.top + 16, width: 8, height: t.h - 40, rx: 4, fill: '#eef2ff' }, g);
    const stain = el('path', { d, fill: '#e9cf7a', opacity: 0 }, g);
    const spots = el('g', { opacity: 0 }, g);
    [[-10, -8, 5], [8, 6, 4], [-4, 12, 3.4]].forEach(([dx, dy, r]) => el('circle', { cx: t.cx + dx, cy: t.cy + dy, r, fill: '#c9a24a' }, spots));
    const shine = el('g', { transform: `translate(${t.cx + 10} ${t.cy - 14})`, style: 'display:none' }, g);
    el('path', { d: 'M0,-13 Q1.8,-1.8 13,0 Q1.8,1.8 0,13 Q-1.8,1.8 -13,0 Q-1.8,-1.8 0,-13Z', fill: '#ffd56b', class: 'twinkle', style: `animation-delay:-${(t.i * .3).toFixed(1)}s` }, shine);
    return { g, stain, spots, shine };
  }

  /* ---------- five kinds of cute germs ---------- */
  const GERMC = ['#8fdc6a', '#c9a7ff', '#ffb35c', '#7fc8ff', '#ff9ac0'];
  function germFace(g, y = 0) {
    const f = el('g', { transform: `translate(0 ${y})` }, g);
    [-1, 1].forEach(s => el('ellipse', { cx: s * 12, cy: 6, rx: 4, ry: 2.6, fill: '#ff8fa3', opacity: .85 }, f));
    const norm = el('g', {}, f), squeak = el('g', { style: 'display:none' }, f), joy = el('g', { style: 'display:none' }, f);
    [-1, 1].forEach(s => { el('ellipse', { cx: s * 6.5, cy: -2, rx: 3.4, ry: 4, fill: '#2b2340' }, norm); el('circle', { cx: s * 6.5 - 1.2, cy: -3.6, r: 1.3, fill: '#fff' }, norm); });
    el('path', { d: 'M-5,5 Q0,10 5,5', stroke: '#2b2340', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, norm);
    el('path', { d: 'M-11,-6 L-5,-2 L-11,2 M11,-6 L5,-2 L11,2', stroke: '#2b2340', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, squeak);
    el('ellipse', { cx: 0, cy: 7, rx: 5, ry: 4.6, fill: '#7a2a40' }, squeak);
    el('ellipse', { cx: 1.5, cy: 10, rx: 3, ry: 2.4, fill: '#ff8fa3' }, squeak);
    [-1, 1].forEach(s => el('path', { d: `M${s * 6.5 - 4},-1 Q${s * 6.5},-7 ${s * 6.5 + 4},-1`, stroke: '#2b2340', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, joy));
    el('path', { d: 'M-6,4 Q0,13 6,4Z', fill: '#7a2a40' }, joy);
    return ex => { norm.style.display = ex === 'normal' ? '' : 'none'; squeak.style.display = ex === 'squeak' ? '' : 'none'; joy.style.display = ex === 'joy' ? '' : 'none'; };
  }
  const shineDot = (g, x, y, rx, ry) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#fff', opacity: .5, transform: `rotate(-25 ${x} ${y})` }, g);
  const GERMS = [
    (g, c) => { // bobble antennae
      [-9, 0, 9].forEach((x, i) => {
        el('path', { d: `M${x},-14 L${x * 1.3},${i === 1 ? -27 : -24}`, stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
        el('circle', { cx: x * 1.3, cy: i === 1 ? -28 : -25, r: 4.4, fill: c }, g);
      });
      el('circle', { r: 20, fill: c }, g); shineDot(g, -7, -10, 6.5, 3.6);
      return germFace(g);
    },
    (g, c) => { // soft spiky star
      let d = '';
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, r = k % 2 ? 17 : 24; d += `${k ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)} `; }
      el('path', { d: d + 'Z', fill: c, 'stroke-linejoin': 'round', stroke: c, 'stroke-width': 4 }, g); shineDot(g, -7, -10, 6, 3.4);
      return germFace(g, 1);
    },
    (g, c) => { // drop with a curl
      el('path', { d: 'M0,-28 Q20,-6 20,8 Q20,24 0,24 Q-20,24 -20,8 Q-20,-6 0,-28Z', fill: c }, g);
      el('path', { d: 'M0,-28 Q8,-38 2,-42', stroke: c, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
      shineDot(g, -8, -4, 5, 3.4);
      return germFace(g, 6);
    },
    (g, c) => { // fluffy cloud
      [[-12, -6, 13], [12, -6, 13], [0, -14, 14], [-14, 8, 11], [14, 8, 11], [0, 6, 17]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: c }, g));
      shineDot(g, -6, -18, 6, 3.4);
      return germFace(g, 1);
    },
    (g, c) => { // little horned block
      [-1, 1].forEach(s => el('path', { d: `M${s * 8},-17 L${s * 15},-30 L${s * 18},-15Z`, fill: '#fff3b0' }, g));
      el('rect', { x: -21, y: -19, width: 42, height: 40, rx: 15, fill: c }, g); shineDot(g, -9, -10, 6, 3.4);
      return germFace(g, 1);
    }
  ];

  function brush(g) {
    el('rect', { x: 50, y: 6, width: 100, height: 18, rx: 9, fill: '#ff8fa3' }, g);
    el('rect', { x: 92, y: 6, width: 14, height: 18, fill: '#ffd56b' }, g);
    el('rect', { x: 120, y: 10, width: 22, height: 6, rx: 3, fill: '#fff', opacity: .5 }, g);
    el('rect', { x: 18, y: 10, width: 40, height: 11, rx: 5.5, fill: '#ff8fa3' }, g);
    el('rect', { x: -27, y: 8, width: 54, height: 14, rx: 7, fill: '#ff7a8a' }, g);
    el('rect', { x: -24, y: -12, width: 48, height: 22, rx: 5, fill: '#e8f7ff' }, g);
    el('path', { d: 'M-16,-10 V8 M-8,-10 V8 M0,-10 V8 M8,-10 V8 M16,-10 V8', stroke: '#bfe2f5', 'stroke-width': 2.5 }, g);
    el('path', { d: 'M-22,-12 Q-22,-22 -12,-20 Q-6,-30 4,-22 Q12,-28 18,-20 Q24,-18 22,-12Z', fill: '#9ff0d0' }, g);
    el('path', { d: 'M-14,-15 Q-4,-20 8,-17', stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
  }
  function foamCluster(g, k = 1) {
    const B = [[-10, 3, 9], [8, -1, 10], [-1, -10, 8], [12, 9, 7], [-2, 8, 8]];
    B.forEach(([x, y, r]) => el('circle', { cx: x * k, cy: (y + 2.5) * k, r: r * k, fill: '#bfe3fa' }, g));
    B.forEach(([x, y, r]) => el('circle', { cx: x * k, cy: y * k, r: r * k, fill: '#ffffff' }, g));
    B.forEach(([x, y, r]) => el('circle', { cx: (x - r * .38) * k, cy: (y - r * .4) * k, r: r * .24 * k, fill: '#dff3ff' }, g));
  }
  /* progress icons: dirty → foamy → shiny */
  function stepIcon(g, n) {
    el('circle', { r: 30, fill: '#fff', opacity: .85 }, g);
    el('path', { d: 'M-15,-16 Q0,-22 15,-16 Q18,-2 13,12 Q10,22 6,22 Q3,22 2,12 Q0,6 -2,12 Q-3,22 -6,22 Q-10,22 -13,12 Q-18,-2 -15,-16Z', fill: n === 0 ? '#f2e2a8' : '#ffffff', stroke: '#e3dafc', 'stroke-width': 2 }, g);
    if (n === 0) [[-6, -6, 3.4], [6, 2, 2.8]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#c9a24a' }, g));
    if (n === 1) [[-8, -16, 7], [3, -20, 8], [12, -14, 6]].forEach(([x, y, r]) => { el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#bfe2f5', 'stroke-width': 1.5 }, g); });
    if (n === 2) el('path', { d: 'M8,-22 Q9.5,-14 17,-12 Q9.5,-10 8,-2 Q6.5,-10 -1,-12 Q6.5,-14 8,-22Z', fill: '#ffd56b' }, g);
    [-1, 1].forEach(s => el('circle', { cx: s * 5, cy: -4, r: 2.2, fill: INK }, g));
    el('path', { d: 'M-3,2 Q0,5 3,2', stroke: INK, 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }, g);
  }

  const teethToy = {
    id: 'teeth', name: 'はみがき', color: '#9eeacb',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#c9f5e2' }, g);
      const h = el('g', { transform: 'translate(0 8) scale(.3) translate(-200 -380)' }, g);
      const defs = el('defs', {}, g);
      const P = buildChar(h, defs, CHARS[0]);
      GEOM.list.forEach(t => makeTooth(t.up ? P.upper : P.lower, t, 'round'));
      const gm = el('g', { transform: `translate(${(GEOM.list[5].cx - 200) * .3} ${(GEOM.list[5].cy - 380) * .3 + 8}) scale(.45)` }, g);
      GERMS[0](gm, GERMC[0]);
      const b = el('g', { transform: 'translate(30 20) rotate(-30) scale(.55)' }, g);
      brush(b);
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      const bub = el('radialGradient', { id: 'teeth-bub', cx: .35, cy: .32, r: .75 }, defs);
      [[0, '#ffffff', .9], [.6, '#e9fbff', .25], [.88, '#c9e8ff', .45], [1, '#ffffff', .9]].forEach(([o, c, a]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, bub));
      const dots = el('pattern', { id: 'teeth-dots', width: 46, height: 46, patternUnits: 'userSpaceOnUse' }, defs);
      const dotA = el('circle', { cx: 11, cy: 11, r: 4, fill: '#d8fbec' }, dots), dotB = el('circle', { cx: 34, cy: 34, r: 4, fill: '#d8fbec' }, dots);
      const bgRect = el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: '#b8f0d8' }, svg);
      el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: 'url(#teeth-dots)' }, svg);
      const floor = el('ellipse', { cx: 200, cy: 735, rx: 260, ry: 60, fill: '#fff', opacity: .3 }, svg);
      void floor;
      const ambL = el('g', { 'pointer-events': 'none' }, svg);

      const G = GEOM;
      const charO = el('g', {}, svg);
      let charB = null, C = null, P = null, teeth = [];
      const stuckL = el('g', { 'pointer-events': 'none' }, svg);
      const germLayer = el('g', { 'pointer-events': 'none' }, svg);
      const foamLayer = el('g', { 'pointer-events': 'none' }, svg);
      const flyLayer = el('g', { 'pointer-events': 'none' }, svg);
      const stream = el('path', { d: 'M254,414 Q242,470 232,548', stroke: '#9fe0ff', 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': 160, 'pointer-events': 'none', style: 'display:none' }, svg);
      const cupO = el('g', { transform: 'translate(140 900)', style: 'display:none' }, svg);
      const cup = el('g', { class: 'tb' }, cupO);
      el('circle', { r: 58, fill: 'transparent' }, cup);
      el('path', { d: 'M-34,-36 L34,-36 L27,36 Q0,44 -27,36Z', fill: '#7fc8ff' }, cup);
      el('ellipse', { cx: 0, cy: -36, rx: 34, ry: 8, fill: '#e8f7ff' }, cup);
      el('ellipse', { cx: 0, cy: -34, rx: 28, ry: 5, fill: '#9fe0ff' }, cup);
      el('path', { d: 'M-24,-22 L-19,28', stroke: '#fff', 'stroke-width': 5, opacity: .5, 'stroke-linecap': 'round' }, cup);
      [-1, 1].forEach(s => { el('ellipse', { cx: s * 9, cy: 0, rx: 3.6, ry: 4.4, fill: INK }, cup); el('ellipse', { cx: s * 17, cy: 9, rx: 5, ry: 3, fill: '#ffa3b8' }, cup); });
      el('path', { d: 'M-5,8 Q0,13 5,8', stroke: INK, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, cup);
      /* the mirror */
      const mirO = el('g', { transform: 'translate(560 600)' }, svg);
      const mir = el('g', { class: 'tb' }, mirO);
      el('rect', { x: -12, y: 60, width: 24, height: 90, rx: 12, fill: '#ff9ab3' }, mir);
      el('ellipse', { cx: 0, cy: 0, rx: 62, ry: 76, fill: '#ff9ab3' }, mir);
      el('ellipse', { cx: 0, cy: 0, rx: 50, ry: 64, fill: '#dff4ff' }, mir);
      const refl = el('g', {}, mir);
      el('path', { d: 'M-34,-30 L-14,-50 M-36,-6 L4,-46', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: .8 }, mir);
      [[-30, -62], [0, -70], [30, -62], [44, -40], [-44, -40]].forEach(([x, y]) => el('circle', { cx: x, cy: y - 8, r: 6, fill: '#ffd56b' }, mir));
      const brushO = el('g', { 'pointer-events': 'none' }, svg);
      brush(brushO);
      const ghost = ctx.ghost(svg, { x: 62, y: 700, s: .55 });
      /* progress: dirty → foamy → shiny */
      const stepsO = el('g', {}, svg);
      el('rect', { x: 112, y: 16, width: 176, height: 60, rx: 30, fill: '#fff', opacity: .5 }, stepsO);
      [[170, 46], [230, 46]].forEach(([x, y]) => el('circle', { cx: x - 30 + 30, cy: y, r: 3.5, fill: '#fff' }, stepsO));
      const steps = [0, 1, 2].map(n => {
        const o = el('g', { transform: `translate(${140 + n * 60} 46)` }, stepsO);
        const b = el('g', { class: 'tb' }, o);
        stepIcon(b, n);
        return { o, b, anim: null };
      });
      let stepI = -1;
      function setStep(n) {
        if (n === stepI) return;
        stepI = n;
        steps.forEach((s, k) => {
          if (s.anim) s.anim.cancel();
          s.b.style.opacity = k <= n ? 1 : .45;
          if (k === n) {
            s.anim = s.b.animate([{ transform: 'scale(1.1)' }, { transform: 'scale(1.28)' }], { duration: 600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
            if (n > 0) { ctx.sparkle(140 + k * 60, 46, 4, 24); A.sfx('coin', { vol: .4, rate: 1 + k * .1 }); }
          } else s.anim = null;
        });
      }

      let ci = 0, phase = 'brush', round = 0, prevSet = '', saidShaka = false, rare = false;
      const REST = [232, 714, -8];
      let bx = REST[0], by = REST[1], rot = REST[2], tx = bx, ty = by, trot = rot;
      let down = false, moved = 0, lastP = null, lastActive = 0, autoUntil = 0, sfxT = 0, alt = false;

      function buildCharacter() {
        C = CHARS[ci];
        if (charB) { charB.remove(); if (P) P.clip.remove(); }
        charB = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, charO);
        P = buildChar(charB, defs, C);
        teeth = G.list.map(t => Object.assign({}, t, makeTooth(t.up ? P.upper : P.lower, t, C.teeth), { germ: null, scrub: 0, foam: 0, foamG: null }));
        bgRect.setAttribute('fill', C.bg); dotA.setAttribute('fill', C.dot); dotB.setAttribute('fill', C.dot);
        charB.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.012,.99)' }], { duration: 1800, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      }

      /* ---------- germs ---------- */
      function placeGerms(fromSide) {
        round++;
        rare = round > 1 && Math.random() < 1 / 6;
        const n = 3 + ((round - 1) % 3);
        let set;
        do { set = [...teeth.keys()].sort(() => Math.random() - .5).slice(0, n).sort(); } while (set.join() === prevSet);
        prevSet = set.join();
        const order = [0, 1, 2, 3, 4].sort(() => Math.random() - .5);
        set.forEach((i, j) => {
          const t = teeth[i];
          t.scrub = 0;
          const king = rare && j === 0;
          const x = t.cx + rand(-5, 5), y = t.cy + rand(-5, 5);
          const outer = el('g', {}, germLayer);
          const inner = el('g', { class: 'tb' }, outer);
          const body = el('g', { class: 'tb', transform: king ? 'scale(1.45)' : null }, inner);
          const wob = el('g', { class: 'tb' }, body);
          const face = GERMS[order[j % 5]](wob, GERMC[order[j % 5]]);
          if (king) {
            el('path', { d: 'M-14,-24 L-14,-38 L-7,-30 L0,-42 L7,-30 L14,-38 L14,-24Z', fill: '#ffd23f' }, wob);
            el('circle', { cx: 0, cy: -34, r: 3, fill: '#ff7a8a' }, wob);
          }
          const germ = { outer, inner, body, wob, face, x, y, king, need: king ? 2 : 1, squeakT: 0 };
          t.germ = germ;
          inner.animate([{ transform: 'rotate(-8deg) translateY(0px)' }, { transform: 'rotate(8deg) translateY(-4px)' }], { duration: rand(520, 800), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -rand(0, 600) });
          ctx.after(j * 180 + (fromSide ? 0 : 150), () => {
            t.stain.animate([{ opacity: 0 }, { opacity: .75 }], { duration: 400, fill: 'forwards' });
            t.spots.animate([{ opacity: 0 }, { opacity: .8 }], { duration: 400, fill: 'forwards' });
            if (fromSide) {
              const sx = x < 200 ? -40 : 440, sy = rand(250, 420);
              A.sfx('boing2', { vol: .35, rate: rand(1.1, 1.4) }) || A.boing();
              ctx.tween(620, k => outer.setAttribute('transform', `translate(${(sx + (x - sx) * k).toFixed(1)} ${(sy + (y - sy) * k - Math.sin(k * Math.PI) * 120).toFixed(1)})`), () => {
                body.animate([{ transform: `scale(${king ? 1.8 : 1.3},${king ? 1.1 : .7})` }, { transform: `scale(${king ? 1.45 : 1})` }], { duration: 260, easing: 'ease-out' });
                A.osc(mtof(PENTA[j + 4]), { type: 'triangle', r: .12, vol: .12 });
              }, k => k);
            } else {
              outer.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
              body.animate([{ transform: `scale(0)` }, { transform: `scale(${king ? 1.7 : 1.2})`, offset: .7 }, { transform: `scale(${king ? 1.45 : 1})` }], { duration: 360, easing: 'ease-out' });
              A.osc(mtof(PENTA[j + 3]), { type: 'triangle', slide: mtof(PENTA[j + 5]), slideT: .1, r: .14, vol: .13 });
            }
          });
        });
        setStep(0);
      }
      function squeakGerm(g) {
        const now = performance.now();
        if (now - g.squeakT < 200) return;
        g.squeakT = now;
        g.face('squeak');
        const f = rand(1300, 1800);
        A.osc(f, { type: 'sine', slide: f * 1.3, slideT: .05, r: .07, vol: .07, wet: .1 });
        g.wob.animate([{ transform: 'translateX(0px) rotate(0deg) scale(1)' }, { transform: 'translateX(-5px) rotate(-18deg) scale(1.12,.88)' }, { transform: 'translateX(5px) rotate(16deg) scale(.9,1.1)' }, { transform: 'translateX(0px) rotate(0deg) scale(1)' }], { duration: 200 });
        clearTimeout(g.faceT);
        g.faceT = ctx.after(380, () => g.face('normal'));
      }
      function popGerm(t) {
        const g = t.germ; t.germ = null;
        g.face('joy');
        haptic(20);
        A.sfx('bubbles', { vol: .5, rate: rand(1, 1.2) }) || A.pop();
        t.stain.animate([{ opacity: .75 * Math.max(0, 1 - t.scrub / g.need) }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
        t.spots.animate([{ opacity: .8 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
        g.body.animate([{ transform: `scale(${g.king ? 1.45 : 1})` }, { transform: `scale(${g.king ? 1.9 : 1.35},${g.king ? 1 : .7})` }, { transform: `scale(${g.king ? 1.3 : .9},${g.king ? 1.7 : 1.2})` }, { transform: `scale(${g.king ? 1.45 : 1})` }], { duration: 320 });
        flyLayer.appendChild(g.outer);
        // wrap the germ in a bubble and float it away
        const bubble = el('g', { class: 'tb' }, g.inner);
        const R = g.king ? 46 : 32;
        el('circle', { r: R, fill: 'url(#teeth-bub)', stroke: '#fff', 'stroke-width': 2.5 }, bubble);
        el('ellipse', { cx: -R * .4, cy: -R * .42, rx: R * .24, ry: R * .14, fill: '#fff', transform: `rotate(-35 ${-R * .4} ${-R * .42})` }, bubble);
        bubble.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.15)', offset: .7 }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
        ctx.after(300, () => {
          A.sfx('bubble', { vol: .4, rate: rand(1.1, 1.4) });
          const dir = g.x < 200 ? -1 : 1, x0 = g.x, y0 = g.y, far = rand(70, 130);
          ctx.tween(1700, k => {
            g.outer.setAttribute('transform', `translate(${(x0 + dir * far * k + Math.sin(k * 12) * 12).toFixed(1)} ${(y0 - k * (y0 + 60)).toFixed(1)}) scale(${(1 - k * .25).toFixed(2)})`);
            g.outer.setAttribute('opacity', clamp(2.4 - k * 2.4, 0, 1).toFixed(2));
          }, () => { g.outer.remove(); }, easeIn);
          for (let i = 0; i < 4; i++) ctx.after(i * 120, () => tinyBubble(x0 + rand(-20, 20), y0 + rand(-10, 10)));
        });
        ctx.sparkle(t.cx, t.cy, 3, 24, '#ffffff');
        ctx.after(120, () => A.twinkle());
        addStuckFoam(t, 3);
        ghost.hop();
        charHappy(700);
        if (g.king) { A.sfx('coin', { vol: .6 }); ctx.sparkle(t.cx, t.cy, 8, 50); }
        const left = teeth.filter(q => q.germ).length;
        if (!left) ctx.after(700, allFoamy);
        else if (Math.random() < .5) ghost.talk(pick(['ばいばーい', 'きれいに なった！', 'すごーい！']), false);
      }
      function tinyBubble(x, y) {
        const b = el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: rand(4, 8).toFixed(1), fill: 'none', stroke: '#fff', 'stroke-width': 2.2, class: 'tb' }, flyLayer);
        b.animate([{ transform: 'translateY(0px) scale(.4)', opacity: 1 }, { transform: `translate(${rand(-20, 20).toFixed(0)}px,-70px) scale(1.1)`, opacity: 0 }], { duration: 900, easing: 'ease-out' }).onfinish = () => b.remove();
      }

      /* ---------- character ---------- */
      let happyT = 0;
      function charHappy(ms) {
        happyT = performance.now() + ms;
        P.eyesN.style.display = 'none'; P.eyesH.style.display = '';
        ctx.after(ms + 20, () => { if (performance.now() >= happyT && (phase === 'brush' || phase === 'foamy')) { P.eyesN.style.display = ''; P.eyesH.style.display = 'none'; } });
      }
      function bounce() { charO.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(6px) scale(1.03,.97)' }, { transform: 'translateY(-4px) scale(.98,1.03)' }, { transform: 'translateY(0px)' }], { duration: 480 }); }
      function look(x, y) {
        if (!P) return;
        const s = C.key === 'croc' ? 1.6 : 1;
        P.pupils.setAttribute('transform', `translate(${(clamp((x - 200) / 40, -4, 4) * s).toFixed(1)} ${(clamp((y - 300) / 80, -3, 3.5) * s).toFixed(1)})`);
      }
      ctx.every(900, () => {
        if (!P || Math.random() > .3 || P.eyesN.style.display === 'none') return;
        P.eyesN.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 });
      });

      /* ---------- brushing ---------- */
      function nearest(p) {
        let best = null, bd = 64;
        teeth.forEach(t => { const d = Math.hypot((p.x - t.cx) * .9, p.y - t.cy); if (d < bd) { bd = d; best = t; } });
        return best;
      }
      function shaka() {
        const now = performance.now();
        if (now - sfxT < 90) return;
        sfxT = now; alt = !alt;
        A.noise({ type: 'highpass', from: alt ? 3000 : 4300, dur: .08, vol: .13, wet: 0 });
      }
      let foamN = 0;
      function foamAt(t) {
        if (foamN > 30) return;
        foamN++;
        const g = el('g', { transform: `translate(${(t.cx + rand(-26, 26)).toFixed(1)} ${(t.cy + rand(-28, 28)).toFixed(1)})` }, foamLayer);
        const c = el('g', { class: 'tb' }, g);
        el('circle', { r: rand(5, 10).toFixed(1), fill: '#fff', stroke: '#d4f2ff', 'stroke-width': 1.5 }, c);
        el('circle', { cx: -2, cy: -2.5, r: 1.8, fill: '#e6f7ff' }, c);
        c.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1.1)', opacity: 1, offset: .2 }, { transform: 'scale(1)', opacity: 1, offset: .75 }, { transform: 'translateY(-10px) scale(.6)', opacity: 0 }],
          { duration: rand(1000, 1500) }).onfinish = () => { g.remove(); foamN--; };
        if (Math.random() < .2) ctx.sparkle(t.cx + rand(-20, 20), t.cy + rand(-20, 20), 1, 6, '#ffffff');
      }
      function addStuckFoam(t, amt) {
        t.foam = Math.min(3, t.foam + amt);
        if (!t.foamG) {
          t.foamG = el('g', { transform: `translate(${t.cx} ${t.up ? t.top + t.h - 22 : t.top + 18})` }, stuckL);
          const inner = el('g', { class: 'tb' }, t.foamG);
          foamCluster(inner, 1.2);
          inner.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.2)', offset: .6 }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
        }
      }
      function scrub(t, amt) {
        if (Math.random() < Math.min(1, amt * 6)) foamAt(t);
        if (!saidShaka) { saidShaka = true; ghost.set('happy'); ghost.talk('しゃかしゃか'); ctx.after(1400, () => { if (phase === 'brush') ghost.set('normal'); }); }
        if (phase !== 'brush') { if (Math.random() < amt * 2) ctx.sparkle(t.cx, t.cy, 1, 18, '#ffffff'); return; }
        if (t.germ) {
          t.scrub += amt;
          const k = Math.max(0, 1 - t.scrub / t.germ.need);
          t.stain.getAnimations().forEach(a => a.cancel()); t.spots.getAnimations().forEach(a => a.cancel());
          t.stain.setAttribute('opacity', (.75 * k).toFixed(2)); t.spots.setAttribute('opacity', (.8 * k).toFixed(2));
          squeakGerm(t.germ);
          if (t.scrub > .4) addStuckFoam(t, 0);
          if (t.scrub >= t.germ.need) popGerm(t);
        } else {
          t.foam += amt;
          if (t.foam > .5) addStuckFoam(t, 0);
          if (Math.random() < amt * 1.5) ctx.sparkle(t.cx, t.cy, 1, 18, '#ffffff');
        }
      }
      function autoScrub(t) {
        autoUntil = performance.now() + 560;
        tx = t.cx; ty = t.cy - 4;
        for (let i = 0; i < 4; i++) ctx.after(60 + i * 120, () => { shaka(); scrub(t, .19); });
      }
      function setTarget(p) { tx = p.x - 4; ty = p.y - 22; }

      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e);
        look(p.x, p.y);
        if (p.x < 80 && p.y < 80) return;
        if (phase === 'shiny' || phase === 'party') { ctx.sparkle(p.x, p.y, 3, 20); A.twinkle(); return; }
        down = true; moved = 0; lastP = p; lastActive = performance.now();
        setTarget(p); haptic(8);
        const t = nearest(p);
        if (t) { sfxT = 0; shaka(); scrub(t, .25); }
        else if (p.y < 330 && p.y > 80 && Math.abs(p.x - 200) < 170) {
          charHappy(600); bounce();
          A.sfx('boing', { vol: .5, rate: rand(1, 1.2) }) || A.boing();
          if (C.key === 'lion') A.animal('lion', { vol: .35, rate: 1.4 });
        } else {
          A.sfx('bubble', { vol: .35, rate: rand(.9, 1.4) }) || A.click();
          ambBubble(p.x, p.y, true);
        }
      });
      ctx.on(ctx.host, 'pointermove', e => {
        if (!down) return;
        const p = ctx.point(e);
        const d = Math.hypot(p.x - lastP.x, p.y - lastP.y);
        if (d < 2) return;
        moved += d; lastP = p; lastActive = performance.now();
        setTarget(p);
        const t = nearest(p);
        if (t) { shaka(); scrub(t, Math.min(d, 40) / 110); }
      });
      const up = () => {
        if (!down) return;
        down = false; lastActive = performance.now();
        if (moved < 12 && lastP) { const t = nearest(lastP); if (t) autoScrub(t); }
      };
      ctx.on(window, 'pointerup', up);
      ctx.on(window, 'pointercancel', up);
      ghost.pos.addEventListener('pointerdown', e => { e.stopPropagation(); ghost.giggle(); ctx.after(900, () => ghost.set('normal')); });

      /* ---------- step 2: foamy, then rinse ---------- */
      function allFoamy() {
        phase = 'foamy';
        setStep(1);
        teeth.forEach((t, i) => ctx.after(i * 70, () => { addStuckFoam(t, 3); A.sfx('bubble', { vol: .25, rate: 1 + i * .06 }); }));
        P.eyesN.style.display = 'none'; P.eyesH.style.display = '';
        bounce();
        ghost.set('happy'); ghost.talk('あわあわ');
        ctx.after(1100, () => {
          cupO.style.display = '';
          A.boing();
          ctx.tween(520, k => cupO.setAttribute('transform', `translate(140 ${(900 - 200 * k).toFixed(1)})`), null, easeBack);
          ghost.talk('ぶくぶく しよう');
        });
      }
      function rinse(e) {
        e.stopPropagation();
        if (phase !== 'foamy') { cup.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 250 }); return; }
        phase = 'rinse'; haptic(20);
        A.pop();
        ctx.tween(450, k => cupO.setAttribute('transform', `translate(${(140 + 150 * k).toFixed(1)} ${(700 - 280 * k).toFixed(1)}) rotate(${(-75 * k).toFixed(0)})`), () => {
          A.sfx('pour', { vol: .5 }) || A.noise({ type: 'lowpass', from: 700, to: 1600, dur: .7, vol: .15 });
          stream.style.display = '';
          stream.animate([{ strokeDashoffset: 160 }, { strokeDashoffset: 0 }], { duration: 200, fill: 'forwards' });
          ctx.tween(650, k => P.water.setAttribute('ry', (k * 70).toFixed(1)));
          ctx.after(700, () => {
            stream.style.display = 'none';
            ctx.tween(420, k => cupO.setAttribute('transform', `translate(${(290 - 150 * k).toFixed(1)} ${(420 + 280 * k).toFixed(1)}) rotate(${(-75 + 75 * k).toFixed(0)})`));
            bukubuku();
          });
        }, easeOut);
      }
      function bukubuku() {
        say('ぶくぶく');
        A.sfx('bubbles', { vol: .55 });
        P.cheeks.forEach(c => c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }], { duration: 300, iterations: 4, direction: 'alternate' }));
        charB.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0deg)' }], { duration: 400, iterations: 3, composite: 'add' });
        for (let i = 0; i < 12; i++) ctx.after(i * 100, () => {
          const b = el('circle', { cx: rand(80, 320).toFixed(0), cy: rand(510, 560).toFixed(0), r: rand(5, 11).toFixed(1), fill: 'none', stroke: '#fff', 'stroke-width': 2.5, class: 'tb' }, P.mouthFx);
          b.animate([{ transform: 'translateY(0px) scale(.4)', opacity: 1 }, { transform: 'translateY(-36px) scale(1.1)', opacity: 0 }], { duration: 520 }).onfinish = () => b.remove();
        });
        ctx.after(1350, pe);
      }
      function pe() {
        say('ぺっ'); A.sfx('splash', { vol: .5 }) || A.whoosh();
        ctx.tween(260, k => P.water.setAttribute('ry', (70 * (1 - k)).toFixed(1)));
        bounce();
        // foam washes off
        teeth.forEach(t => { if (t.foamG) { const f = t.foamG; t.foamG = null; t.foam = 0; f.animate([{ opacity: 1 }, { opacity: 0, transform: `translate(${t.cx}px,${(t.up ? t.top + t.h : t.top) + 30}px)` }], { duration: 400, fill: 'forwards' }).onfinish = () => f.remove(); } });
        const drops = [];
        for (let i = 0; i < 20; i++) {
          const node = el('circle', { r: rand(4, 8).toFixed(1), fill: '#9fe0ff', stroke: '#fff', 'stroke-width': 2 }, flyLayer);
          const a = rand(-Math.PI * .92, -Math.PI * .08);
          drops.push({ node, x: 200 + rand(-30, 30), y: 500, vx: Math.cos(a) * rand(200, 420), vy: Math.sin(a) * rand(300, 520) });
        }
        let life = 0;
        const stop = ctx.loop(dt => {
          life += dt;
          drops.forEach(d => { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.node.setAttribute('transform', `translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`); d.node.setAttribute('opacity', clamp(1.3 - life, 0, 1).toFixed(2)); });
          if (life > 1.3) { stop(); drops.forEach(d => d.node.remove()); }
        });
        ctx.tween(400, k => cupO.setAttribute('transform', `translate(140 ${(700 + 220 * k).toFixed(1)})`), () => { cupO.style.display = 'none'; }, easeIn);
        ctx.after(500, shiny);
      }

      /* ---------- step 3: shiny, and a look in the mirror ---------- */
      function shiny() {
        phase = 'shiny';
        setStep(2);
        teeth.forEach((t, i) => ctx.after(i * 90, () => {
          t.shine.style.display = '';
          ctx.sparkle(t.cx, t.cy, 2, 22, '#ffffff');
          A.bell(mtof(PENTA[(i % 7) + 3] + 12), { vol: .07 });
        }));
        ghost.set('happy');
        ctx.after(800, () => {
          // the mirror slides in
          refl.replaceChildren();
          el('ellipse', { cx: 0, cy: 12, rx: 34, ry: 26, fill: '#d4566f' }, refl);
          [-17, 0, 17].forEach(x => el('rect', { x: x - 7, y: -6, width: 14, height: 16, rx: 5, fill: '#fff' }, refl));
          el('ellipse', { cx: 0, cy: -16, rx: 40, ry: 14, fill: C.snout }, refl);
          [[-20, -30], [22, 30]].forEach(([x, y], k) => el('path', { d: 'M0,-9 Q1.2,-1.2 9,0 Q1.2,1.2 0,9 Q-1.2,1.2 -9,0 Q-1.2,-1.2 0,-9Z', fill: '#ffd56b', class: 'twinkle', style: `animation-delay:-${k * .8}s` }, el('g', { transform: `translate(${x} ${y})` }, refl)));
          A.sfx('slide', { vol: .35, rate: 1.3 }) || A.whoosh();
          ctx.tween(620, k => mirO.setAttribute('transform', `translate(${(560 - 240 * k).toFixed(1)} ${600}) rotate(${(-10 * k).toFixed(1)})`), () => {
            mir.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.92)' }, { transform: 'scale(1)' }], { duration: 300 });
            P.eyesN.style.display = ''; P.eyesH.style.display = 'none';
            look(330, 640);
            ctx.after(450, () => {
              A.sfx('sparkle', { vol: .7 }) || A.twinkle();
              ctx.sparkle(320, 590, 5, 50, '#ffffff');
              P.eyesN.style.display = 'none'; P.eyesH.style.display = '';
              P.cheeks.forEach(c => c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
              charB.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(0deg)' }], { duration: 700, composite: 'add' });
              teeth.forEach((t, i) => ctx.after(i * 60, () => ctx.sparkle(t.cx, t.cy, 1, 14, '#ffffff')));
              ghost.talk('ぴかぴか！');
              ctx.after(900, party);
            });
          }, easeBack);
        });
      }
      function party() {
        phase = 'party';
        A.tada(); haptic(30);
        ctx.confetti(200, 420, 40);
        ctx.after(800, () => { ctx.confetti(90, 300, 24); ctx.confetti(310, 300, 24); });
        teeth.forEach((t, i) => ctx.after(i * 70, () => ctx.sparkle(t.cx, t.cy, 2, 22)));
        charO.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(-18px) scale(.97,1.03)' }, { transform: 'translateY(0px) scale(1.03,.97)' }, { transform: 'translateY(0px) scale(1)' }], { duration: 560, iterations: 3 });
        ghost.moveTo(110, 640, .66, 400, () => {
          ghost.giggle(); ghost.hop();
          ctx.after(600, () => ghost.moveTo(200, 610, .66, 500, () => { ghost.hop(); ghost.moveTo(80, 690, .6, 600, () => ghost.hop(), easeInOut); }, easeOut));
        }, easeBack);
        if (C.key === 'lion') ctx.after(1500, () => {
          // a big sleepy lion yawn
          A.animal('lion', { vol: .7 }) || A.yawn();
          P.eyesN.style.display = 'none'; P.eyesH.style.display = '';
          charB.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(.96,1.08)', offset: .4 }, { transform: 'scale(.96,1.08)', offset: .7 }, { transform: 'scale(1,1)' }], { duration: 1200, easing: 'ease-in-out', composite: 'add' });
        });
        else ctx.after(1500, () => A.giggle());
        ctx.after(3400, nextRound);
      }
      function nextRound() {
        A.sfx('whoosh2', { vol: .5 }) || A.whoosh();
        ctx.tween(400, k => mirO.setAttribute('transform', `translate(${(320 + 260 * k).toFixed(1)} 600)`), null, easeIn);
        ghost.set('normal'); ghost.moveTo(62, 700, .55, 500);
        stuckL.replaceChildren(); germLayer.replaceChildren();
        ctx.tween(420, k => charO.setAttribute('transform', `translate(${(-480 * k).toFixed(1)} 0)`), () => {
          ci = (ci + 1) % CHARS.length;
          buildCharacter();
          charO.setAttribute('transform', 'translate(480 0)');
          ctx.tween(520, k => charO.setAttribute('transform', `translate(${(480 * (1 - k)).toFixed(1)} 0)`), () => {
            bounce();
            if (C.key === 'lion') A.animal('lion', { vol: .5 }); else A.sfx('boing', { vol: .5 });
            placeGerms(true);
            ctx.after(900, () => { phase = 'brush'; ghost.talk('また きたよ！'); });
          }, easeBack);
        }, easeIn);
      }
      cupO.addEventListener('pointerdown', rinse);
      mirO.addEventListener('pointerdown', e => { e.stopPropagation(); mir.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 260 }); A.sfx('sparkle', { vol: .5, rate: rand(.9, 1.3) }); ctx.sparkle(320, 590, 3, 40, '#ffffff'); });

      /* ---------- ambient bubbles in the background ---------- */
      const amb = [];
      function ambBubble(x, y, tapped) {
        if (amb.length > 7) return;
        const node = el('g', {}, ambL);
        const r = tapped ? rand(14, 20) : rand(8, 16);
        el('circle', { r, fill: 'url(#teeth-bub)', stroke: '#fff', 'stroke-width': 1.6, opacity: .9 }, node);
        el('circle', { cx: -r * .38, cy: -r * .4, r: r * .2, fill: '#fff' }, node);
        amb.push({ node, x, y, x0: x, ph: rand(0, 6), sp: rand(18, 34) });
      }
      ctx.every(1800, () => ambBubble(rand(20, 380), 780, false));

      /* ---------- frame loop: the brush follows the finger ---------- */
      ctx.loop((dt, t) => {
        const now = performance.now();
        const active = down || now < autoUntil;
        if (!active && now - lastActive > 900) { tx = REST[0]; ty = REST[1]; trot = REST[2]; }
        else trot = 28;
        const f = Math.min(1, dt * (active ? 30 : 8));
        bx += (tx - bx) * f; by += (ty - by) * f; rot += (trot - rot) * Math.min(1, dt * 12);
        const wig = now < autoUntil ? Math.sin(t * 42) * 14 : 0;
        brushO.setAttribute('transform', `translate(${(bx + wig).toFixed(1)} ${by.toFixed(1)}) rotate(${rot.toFixed(1)})`);
        for (let i = amb.length - 1; i >= 0; i--) {
          const b = amb[i];
          b.y -= b.sp * dt; b.x = b.x0 + Math.sin(t * 1.2 + b.ph) * 12;
          if (b.y < -40) { b.node.remove(); amb.splice(i, 1); continue; }
          b.node.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
        }
      });

      buildCharacter();
      placeGerms(false);
      for (let k = 0; k < 4; k++) ambBubble(rand(20, 380), rand(200, 760), false);
      ctx.after(450, () => { ghost.set('happy'); ghost.talk('はみがき しようね！'); ctx.after(1600, () => { if (phase === 'brush') ghost.set('normal'); }); });
      ctx.hint = () => {
        if (phase === 'brush') { const t = teeth.find(q => q.germ); return t ? [t.cx, t.cy] : null; }
        return phase === 'foamy' ? [140, 700] : null;
      };
    }
  };
  TOYS.push(teethToy);
})();
