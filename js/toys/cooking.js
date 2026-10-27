'use strict';
/* =========================================================
   toy: おりょうり — chop, stir, flip and serve; a hungry friend eats it up
   three recipes rotate: curry rice (evening), pancakes (morning), onigiri bento (noon)
   ========================================================= */
(() => {
  const INK = '#3a2f5b';
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, k) => { const p = hex(a), q = hex(b); return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  const shine = (g, cx, cy, rx, ry, rot = -25, op = .35) => el('ellipse', { cx, cy, rx, ry, fill: '#fff', opacity: op, transform: `rotate(${rot} ${cx} ${cy})` }, g);

  /* ---------- faces for the kitchen things ---------- */
  function face(g, x, y, k = 1) {
    const f = el('g', { transform: `translate(${x} ${y}) scale(${k})` }, g);
    [-1, 1].forEach(s => el('ellipse', { cx: s * 19, cy: 7, rx: 6.5, ry: 4.2, fill: '#ffa3b8', opacity: .85 }, f));
    const look = el('g', {}, f);
    const blinkG = el('g', { class: 'tb' }, look);
    const open = el('g', {}, blinkG), joy = el('g', { style: 'display:none' }, look);
    [-10, 10].forEach(ex => {
      el('ellipse', { cx: ex, cy: 0, rx: 4.4, ry: 5.4, fill: '#2b2340' }, open);
      el('circle', { cx: ex - 1.5, cy: -2, r: 1.8, fill: '#fff' }, open);
      el('path', { d: `M${ex - 5},1 Q${ex},-5 ${ex + 5},1`, stroke: '#2b2340', 'stroke-width': 2.8, fill: 'none', 'stroke-linecap': 'round' }, joy);
    });
    const smile = el('path', { d: 'M-6,8 Q0,14 6,8', stroke: '#2b2340', 'stroke-width': 2.8, fill: 'none', 'stroke-linecap': 'round' }, f);
    const wow = el('ellipse', { cx: 0, cy: 11, rx: 4.5, ry: 5.5, fill: '#c2405a', style: 'display:none' }, f);
    const grin = el('path', { d: 'M-8,7 Q0,19 8,7Z', fill: '#c2405a', style: 'display:none' }, f);
    return {
      x, y, k,
      set(ex) {
        open.style.display = ex === 'joy' ? 'none' : ''; joy.style.display = ex === 'joy' ? '' : 'none';
        smile.style.display = ex === 'normal' ? '' : 'none'; wow.style.display = ex === 'wow' ? '' : 'none'; grin.style.display = ex === 'joy' ? '' : 'none';
      },
      look(dx, dy) { look.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`); },
      blink() { if (open.style.display !== 'none') blinkG.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 }); }
    };
  }
  function tinyFace(g, y = 0, k = 1) {
    [-5, 5].forEach(x => el('circle', { cx: x * k, cy: y, r: 2.3 * k, fill: '#2b2340' }, g));
    el('path', { d: `M${-3 * k},${y + 4 * k} Q0,${y + 7.5 * k} ${3 * k},${y + 4 * k}`, stroke: '#2b2340', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }, g);
    [-1, 1].forEach(s => el('ellipse', { cx: s * 10 * k, cy: y + 3 * k, rx: 3 * k, ry: 2 * k, fill: '#ff8fa3', opacity: .8 }, g));
  }

  /* ---------- things to chop: drawn as slices that sit flush, so they look whole ---------- */
  const VEG = {
    carrot: { segs: 5, L: 40, h: x => 64 - (x + 110) * .19, c: '#ff9a3c', d: '#e5781e', round: 'both',
      top(g, x0) {
        [-28, 0, 28].forEach((r, i) => el('path', { d: 'M0,0 Q-14,-12 -34,-6 Q-20,6 0,0Z', fill: i === 1 ? '#5cd15a' : '#4cc44a', transform: `translate(${x0 - 22} 0) rotate(${r})` }, g));
      },
      coin(g) {
        el('circle', { r: 21, fill: '#ff9a3c' }, g);
        el('circle', { r: 13, fill: '#ffb867' }, g);
        shine(g, -8, -10, 6, 3);
        tinyFace(g, -1, .9);
      } },
    banana: { segs: 4, L: 50, h: x => 50 - Math.abs(x) * .06, c: '#ffe066', d: '#f2c94c', round: 'both',
      top(g, x0, h0) { el('rect', { x: x0 - h0 * .55 - 10, y: -7, width: 14, height: 14, rx: 4, fill: '#8a6a3a' }, g); },
      tip(g, x1) { el('circle', { cx: x1 + 18, cy: 0, r: 5, fill: '#8a6a3a' }, g); },
      coin(g) {
        el('circle', { r: 21, fill: '#ffe066' }, g);
        el('circle', { r: 17, fill: '#fff6c8' }, g);
        [[0, -8], [-7, 4], [7, 4]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.6, fill: '#c9a24a' }, g));
        tinyFace(g, 0, .85);
      } },
    sausage: { segs: 4, L: 48, h: () => 46, c: '#ff8a80', d: '#e86a62', round: 'both',
      coin(g) {
        [-13, -5, 5, 13].forEach((x, i) => el('path', { d: `M${x - 4},2 Q${x - 5 + (i - 1.5) * 2},18 ${x + (i - 1.5) * 4},20 Q${x + 4},16 ${x + 4},2Z`, fill: '#ff6b6b' }, g));
        el('path', { d: 'M-20,6 Q-20,-24 0,-24 Q20,-24 20,6Z', fill: '#ff7b74' }, g);
        shine(g, -8, -14, 6, 3.4);
        tinyFace(g, -6, .9);
      } }
  };

  /* ---------- finished dishes (inside the plate / box) ---------- */
  function dishCurry(g) {
    el('ellipse', { cx: -42, cy: 10, rx: 62, ry: 27, fill: '#e9dfc8' }, g);
    el('ellipse', { cx: -42, cy: 6, rx: 60, ry: 27, fill: '#fffdf5' }, g);
    el('ellipse', { cx: -48, cy: -4, rx: 40, ry: 14, fill: '#fff', opacity: .9 }, g);
    for (let i = 0; i < 9; i++) el('ellipse', { cx: -80 + i * 9, cy: (i % 3) * 7 - 4, rx: 3, ry: 1.6, fill: '#f1ead8' }, g);
    el('path', { d: 'M-8,-6 Q40,-26 96,-4 Q112,14 90,30 Q40,44 -6,30 Q-26,12 -8,-6Z', fill: '#d98a2b' }, g);
    el('path', { d: 'M4,0 Q40,-14 84,0', stroke: '#f0a94a', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: .8 }, g);
    [[20, 6], [56, 16], [80, 2]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 10, fill: '#ff9a3c' }, g); el('circle', { cx: x, cy: y, r: 5.5, fill: '#ffb867' }, g); });
    [[38, -4], [66, 24], [8, 22]].forEach(([x, y]) => el('rect', { x: x - 8, y: y - 7, width: 16, height: 14, rx: 4, fill: '#ffe08a' }, g));
    [[30, 26], [92, 14], [48, 2]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 3, fill: '#6fcf6a' }, g));
    // a little flag on the rice
    el('path', { d: 'M-40,-14 L-40,-58', stroke: '#c9a77a', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M-40,-58 L-12,-50 L-40,-42Z', fill: '#ff7a8a' }, g);
    el('path', { d: 'M-31,-53 l1.6,3 3.3,.4 -2.4,2.3 .6,3.3 -3,-1.6 -3,1.6 .6,-3.3 -2.4,-2.3 3.3,-.4Z', fill: '#fff' }, g);
  }
  function dishPancake(g) {
    [[100, 22], [-102, 20], [86, -2], [-88, -4]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 13, fill: '#ffe066' }, g); el('circle', { cx: x, cy: y, r: 10, fill: '#fff6c8' }, g); });
    for (let i = 0; i < 3; i++) {
      const y = 14 - i * 17;
      el('ellipse', { cx: 0, cy: y + 6, rx: 82, ry: 26, fill: '#d99448' }, g);
      el('ellipse', { cx: 0, cy: y, rx: 82, ry: 25, fill: '#f2b45a' }, g);
    }
    el('ellipse', { cx: 0, cy: -20, rx: 68, ry: 19, fill: '#f7c672' }, g);
    el('path', { d: 'M-50,-28 Q-10,-44 50,-26 Q66,-14 56,0 Q52,14 46,2 Q30,-6 0,-6 Q-30,-6 -44,6 Q-52,18 -56,2 Q-66,-14 -50,-28Z', fill: '#c9742e', opacity: .8 }, g);
    el('rect', { x: -16, y: -44, width: 32, height: 22, rx: 5, fill: '#fff3a6' }, g);
    el('rect', { x: -16, y: -44, width: 32, height: 8, rx: 4, fill: '#fffbe0' }, g);
    shine(g, -40, -28, 16, 5, -8, .4);
    const f = el('g', { transform: 'translate(0 -6)' }, g); tinyFace(f, 0, 1.2);
    el('circle', { cx: 40, cy: -36, r: 10, fill: '#ff6b81' }, g);
    el('path', { d: 'M36,-46 L40,-42 L44,-46', stroke: '#4cc44a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
  }
  function dishBento(g) {
    el('path', { d: 'M-6,-38 Q4,-24 -6,-10 Q4,4 -6,18 Q4,32 -6,46', stroke: '#7fd36b', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }, g);
    [[-92, 6], [-42, 6]].forEach(([x, y]) => {
      const o = el('g', { transform: `translate(${x} ${y})` }, g);
      el('path', { d: 'M0,-40 Q8,-40 34,8 Q42,28 22,30 L-22,30 Q-42,28 -34,8 Q-8,-40 0,-40Z', fill: '#fffdf7', stroke: '#ece4d6', 'stroke-width': 2.5 }, o);
      el('rect', { x: -16, y: 8, width: 32, height: 22, rx: 3, fill: '#35584a' }, o);
      shine(o, -10, -18, 6, 3.4, -50, .8);
      tinyFace(o, -6, 1);
    });
    [[30, -14], [62, -22], [94, -12]].forEach(([x, y]) => { const o = el('g', { transform: `translate(${x} ${y}) scale(.8)` }, g); VEG.sausage.coin(o); });
    [[30, 28], [50, 32]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 11, fill: '#5cbf4f' }, g); el('circle', { cx: x - 4, cy: y - 4, r: 6, fill: '#7fd36b' }, g); });
    [[86, 24], [108, 24]].forEach(([x, y]) => { el('rect', { x: x - 10, y: y - 14, width: 20, height: 28, rx: 5, fill: '#ffd84a' }, g); el('path', { d: `M${x - 5},${y - 6} Q${x},${y - 10} ${x + 5},${y - 6}`, stroke: '#f5b82e', 'stroke-width': 2.5, fill: 'none' }, g); });
  }

  const RECIPES = [
    { id: 'curry', call: 'カレー つくろう', veg: 'carrot', steps: ['chop', 'drop', 'stir', 'serve'], dish: dishCurry, cover: 'dome',
      sky: ['#ff9f8a', '#ffd9a0'], sun: '#ff7a5c', curtain: '#ff8fa3', wall: '#fff0c4' },
    { id: 'pancake', call: 'ホットケーキ やこう', veg: 'banana', steps: ['chop', 'pour', 'flip', 'serve'], dish: dishPancake, cover: 'dome',
      sky: ['#c4e8ff', '#fff4d6'], sun: '#ffe066', curtain: '#8fc8ff', wall: '#fff4d2' },
    { id: 'bento', call: 'おべんとう つくろう', veg: 'sausage', steps: ['chop', 'fry', 'rice', 'serve'], dish: dishBento, cover: 'lid',
      sky: ['#7fc8ff', '#e2f5ff'], sun: '#ffd23f', curtain: '#7fdcc0', wall: '#ffefb8' }
  ];
  const FRIENDS = ['dog', 'cat', 'bear', 'frog', 'bunny', 'chick'];
  const FCOL = { dog: '#d9a066', cat: '#ffb066', bear: '#b9824f', frog: '#7fd36b', bunny: '#fff4f7', chick: '#ffe066' };
  function cry(kind, o) {
    if (['dog', 'cat', 'frog'].includes(kind) && A.animal(kind, o)) return;
    if (kind === 'chick') { if (!A.animal('chick', o) && !A.animal('bird', { vol: .6 })) A.voice('chick', 680); return; }
    if (kind === 'bear') { if (A.sfx('cutie2', { vol: .7, rate: .75, ...(o || {}) })) return; A.osc(190, { type: 'triangle', vib: 7, vibD: .05, hold: .18, slide: 240, slideT: .25, r: .2, vol: .2 }); return; }
    if (kind === 'bunny') { if (A.sfx('cutie', { vol: .7, ...(o || {}) })) return; A.osc(900, { vib: 10, vibD: .05, hold: .06, slide: 1250, slideT: .1, r: .12, vol: .14 }); A.osc(1100, { when: .14, slide: 1400, slideT: .08, r: .1, vol: .12 }); return; }
    A.voice(kind, 430);
  }

  /* ---------- where things live ---------- */
  const POS = {
    board: { stage: [200, 604, 1.2], L: [88, 404, .36], R: [312, 404, .36], off: [200, 940, 1.2] },
    pot: { stage: [200, 600, 1.2], park: [88, 390, .4] },
    pan: { stage: [158, 606, 1.12], park: [314, 394, .38] },
    plate: { stage: [200, 622, 1.15], off: [620, 622, 1.15], gone: [-240, 622, 1.15] }
  };

  const cookingToy = {
    id: 'cooking', name: 'おりょうり', color: '#ffd96a',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#ffe9a6' }, g);
      el('rect', { x: -80, y: 30, width: 160, height: 60, fill: '#fff8ec' }, g);
      [-30, 0, 30].forEach((x, i) => el('path', { d: `M${x},-44 q-7,-10 0,-20 q7,-10 0,-20`, stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: .9 - i * .1 }, g));
      el('ellipse', { cx: 0, cy: 52, rx: 62, ry: 8, fill: INK, opacity: .12 }, g);
      [-1, 1].forEach(s => el('rect', { x: s < 0 ? -72 : 56, y: -14, width: 16, height: 10, rx: 5, fill: '#e0564e' }, g));
      el('path', { d: 'M-58,-20 L58,-20 L55,32 Q53,50 34,50 L-34,50 Q-53,50 -55,32Z', fill: '#ff7f73' }, g);
      el('ellipse', { cx: 0, cy: -20, rx: 61, ry: 13, fill: '#ff9d90' }, g);
      el('ellipse', { cx: 0, cy: -19, rx: 52, ry: 9, fill: '#d98a2b' }, g);
      el('path', { d: 'M-50,-6 Q-52,22 -42,40', stroke: '#fff', 'stroke-width': 6, opacity: .35, fill: 'none', 'stroke-linecap': 'round' }, g);
      face(g, 0, 14, .9).set('joy');
      const c = el('g', { transform: 'translate(52 -40) scale(.7)' }, g); VEG.carrot.coin(c);
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      let R = null, ri = -1, round = 0, phase = 'cook', busy = true, stepI = 0, step = null, rare = false;

      /* ================= background (far / mid / near) ================= */
      const mkGrad = (id, a, b, vert = true) => {
        const gr = el('linearGradient', { id, x1: 0, y1: 0, x2: vert ? 0 : 1, y2: vert ? 1 : 0 }, defs);
        return [el('stop', { offset: 0, 'stop-color': a }, gr), el('stop', { offset: 1, 'stop-color': b }, gr)];
      };
      const skyStops = mkGrad('cooking-sky', '#c4e8ff', '#fff4d6');
      mkGrad('cooking-wood', '#f8d7a2', '#e8b371');
      mkGrad('cooking-pot', '#ff8f80', '#f0645c');
      mkGrad('cooking-dome', '#f6f8fc', '#b8c3d8');
      mkGrad('cooking-counter', '#fffaf0', '#f6e6cc');
      const tile = el('pattern', { id: 'cooking-tile', width: 44, height: 44, patternUnits: 'userSpaceOnUse' }, defs);
      el('rect', { width: 44, height: 44, fill: 'none' }, tile);
      el('rect', { x: 3, y: 3, width: 38, height: 38, rx: 10, fill: '#fff', opacity: .32 }, tile);
      const wall = el('rect', { x: -800, y: -900, width: 2000, height: 1340, fill: '#fff0c4' }, svg);
      el('rect', { x: -800, y: -900, width: 2000, height: 1340, fill: 'url(#cooking-tile)' }, svg);
      // window: far layer (sky, sun, clouds) clipped
      const WX = 112, WY = 104, WW = 176, WH = 190;
      const wclip = el('clipPath', { id: 'cooking-win' }, defs);
      el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 28 }, wclip);
      el('rect', { x: WX - 12, y: WY - 12, width: WW + 24, height: WH + 24, rx: 38, fill: '#fff', filter: 'url(#soft)' }, svg);
      const win = el('g', { 'clip-path': 'url(#cooking-win)' }, svg);
      el('rect', { x: WX, y: WY, width: WW, height: WH, fill: 'url(#cooking-sky)' }, win);
      const sunO = el('g', { transform: 'translate(244 150)' }, win);
      const sunGlow = el('circle', { r: 34, fill: '#fff', opacity: .35, class: 'tb' }, sunO);
      const sun = el('circle', { r: 22, fill: '#ffe066' }, sunO);
      sunGlow.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }], { duration: 1800, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      const rainbow = el('g', { opacity: 0 }, win);
      ['#ff8fa3', '#ffd56b', '#9fe3a0', '#8fc8ff', '#c9a7ff'].forEach((c, i) => el('path', { d: `M${WX - 20},${WY + WH + 20} A${130 - i * 11},${130 - i * 11} 0 0 1 ${WX + WW + 20},${WY + WH + 20}`, stroke: c, 'stroke-width': 11, fill: 'none', transform: `translate(0 ${i * 0})` }, rainbow));
      el('ellipse', { cx: 200, cy: WY + WH + 6, rx: 130, ry: 40, fill: '#a8e08f' }, win);
      el('ellipse', { cx: 120, cy: WY + WH + 10, rx: 70, ry: 36, fill: '#94d67c' }, win);
      const clouds = [[WX + 20, WY + 50, .8, 9], [WX + 120, WY + 96, .6, 6]].map(([x, y, s, sp]) => {
        const o = el('g', {}, win);
        [[0, 0, 16], [18, -7, 21], [38, 0, 15]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill: '#fff', opacity: .95 }, o));
        return { o, x, y, s, sp, boost: 0 };
      });
      const flyers = [];
      el('path', { d: `M${WX + WW / 2},${WY} V${WY + WH} M${WX},${WY + WH * .48} H${WX + WW}`, stroke: '#fff', 'stroke-width': 8 }, svg);
      // curtains
      const curtains = [-1, 1].map(s => {
        const x = s < 0 ? WX - 18 : WX + WW + 18;
        const o = el('g', { transform: `translate(${x} ${WY - 18})` }, svg);
        const in2 = el('g', {}, o);
        const p = el('path', { d: `M0,0 Q${-s * 6},60 ${s * 4},120 Q${s * 18},150 ${s * 10},170 L${s * 44},160 Q${s * 34},90 ${s * 46},0Z`, fill: '#8fc8ff' }, in2);
        el('path', { d: `M${s * 12},6 Q${s * 10},70 ${s * 18},150`, stroke: '#fff', 'stroke-width': 4, opacity: .35, fill: 'none', 'stroke-linecap': 'round' }, in2);
        el('rect', { x: s < 0 ? -2 : -44, y: -8, width: 46, height: 12, rx: 6, fill: '#fff', opacity: .9 }, o);
        return { o, in2, p, s, x };
      });
      el('rect', { x: WX - 24, y: WY + WH + 8, width: WW + 48, height: 16, rx: 8, fill: '#fff', filter: 'url(#soft)' }, svg);
      // plant on the sill
      const plantO = el('g', { transform: `translate(${WX + 30} ${WY + WH + 8})` }, svg);
      const plant = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, plantO);
      [[-12, -34, -24], [0, -44, 0], [12, -34, 24]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: 8, ry: 15, fill: '#5cbf4f', transform: `rotate(${r} ${x} ${y})` }, plant));
      el('path', { d: 'M-16,-22 L16,-22 L12,0 L-12,0Z', fill: '#ff9f7a' }, plant);
      plant.animate([{ transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }], { duration: 2400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      // shelf with jars (mid)
      el('rect', { x: 306, y: 178, width: 96, height: 12, rx: 6, fill: '#e8b371', filter: 'url(#soft)' }, svg);
      const jars = [[324, '#ff9fb5'], [354, '#9fe3a0'], [384, '#8fc8ff']].map(([x, c], i) => {
        const o = el('g', { transform: `translate(${x} 178)` }, svg);
        const j = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, o);
        const h = [34, 44, 30][i];
        el('rect', { x: -12, y: -h, width: 24, height: h, rx: 8, fill: '#fff', opacity: .85 }, j);
        el('rect', { x: -10, y: -h * .62, width: 20, height: h * .62 - 2, rx: 6, fill: c }, j);
        el('rect', { x: -13, y: -h - 7, width: 26, height: 9, rx: 4, fill: c }, j);
        el('circle', { cx: -4, cy: -h * .3, r: 2, fill: '#fff', opacity: .7 }, j);
        el('rect', { x: -18, y: -h - 10, width: 36, height: h + 14, fill: 'transparent' }, j);
        o.addEventListener('pointerdown', e => {
          e._cookingDone = true;
          j.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg) scale(1.05,.95)' }, { transform: 'rotate(9deg)' }, { transform: 'rotate(0deg)' }], { duration: 480 });
          A.bell(mtof(PENTA[6 + i] + 12), { vol: .08 }); A.sfx('blink', { vol: .4, rate: rand(.9, 1.3) });
          ctx.sparkle(x, 178 - h, 2, 14, c);
        });
        return j;
      });
      // hanging rail with a ladle, whisk and spatula
      el('rect', { x: 8, y: 116, width: 92, height: 8, rx: 4, fill: '#d0a06a' }, svg);
      const hang = [[26, '#ffb3c4', 'ladle'], [54, '#ffd56b', 'whisk'], [82, '#9fe3c6', 'spat']].map(([x, c, kind], i) => {
        const o = el('g', { transform: `translate(${x} 120)` }, svg);
        const sw = el('g', {}, o);
        el('circle', { cx: 0, cy: 4, r: 4, fill: 'none', stroke: '#c49058', 'stroke-width': 2.5 }, sw);
        el('rect', { x: -4, y: 8, width: 8, height: 62, rx: 4, fill: c }, sw);
        if (kind === 'ladle') { el('path', { d: 'M-15,70 Q-15,96 0,96 Q15,96 15,70Z', fill: c }, sw); shine(sw, -6, 78, 4, 2.4); }
        if (kind === 'whisk') [-10, -4, 4, 10].forEach(dx => el('path', { d: `M0,66 Q${dx * 1.6},86 0,104`, stroke: '#c9d2e3', 'stroke-width': 2.5, fill: 'none' }, sw));
        if (kind === 'spat') el('rect', { x: -12, y: 66, width: 24, height: 30, rx: 6, fill: c }, sw);
        el('rect', { x: -14, y: 0, width: 28, height: 108, fill: 'transparent' }, sw);
        const h = { o, sw, x, ph: rand(0, 6), amp: 3, kick: 0 };
        o.addEventListener('pointerdown', e => { e._cookingDone = true; h.kick = 22; A.sfx('blink', { vol: .45, rate: rand(.7, 1) }); A.pluck(mtof(PENTA[2 + i] + 12), { vol: .1 }); });
        return h;
      });
      // the counter (near)
      el('rect', { x: -800, y: 424, width: 2000, height: 14, fill: '#f0c58a' }, svg);
      el('rect', { x: -800, y: 436, width: 2000, height: 1400, fill: 'url(#cooking-counter)' }, svg);
      for (let x = -40; x < 440; x += 64) el('path', { d: `M${x},450 L${x - 30},760`, stroke: '#f3dfc0', 'stroke-width': 3, opacity: .7 }, svg);
      [[88, 426], [314, 426]].forEach(([x, y]) => { el('ellipse', { cx: x, cy: y, rx: 62, ry: 11, fill: '#e9cfa6' }, svg); el('ellipse', { cx: x, cy: y, rx: 42, ry: 6, fill: '#dcbf93' }, svg); });

      const friendL = el('g', {}, svg);
      const stationsL = el('g', {}, svg);
      const foodL = el('g', { 'pointer-events': 'none' }, svg);
      const toolL = el('g', { 'pointer-events': 'none' }, svg);
      const fxL = el('g', { 'pointer-events': 'none' }, svg);
      const ghost = ctx.ghost(svg, { x: 200, y: 352, s: .5 });
      // a little chef hat for ぽわん
      const hat = el('g', { transform: 'rotate(-10 0 -70)' }, ghost.body);
      [[-30, -104, 24], [0, -122, 30], [30, -104, 24]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#e6defa', 'stroke-width': 2.5 }, hat));
      [[-30, -104, 22], [0, -122, 28], [30, -104, 22]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff' }, hat));
      el('rect', { x: -40, y: -100, width: 80, height: 30, rx: 10, fill: '#fff', stroke: '#e6defa', 'stroke-width': 2.5 }, hat);
      el('path', { d: 'M-28,-86 H28', stroke: '#ffd0dc', 'stroke-width': 4, 'stroke-linecap': 'round' }, hat);
      const uiL = el('g', { 'pointer-events': 'none' }, svg);

      /* ================= stations ================= */
      const faces = [];
      function placeSt(st, x, y, s) { st.x = x; st.y = y; st.s = s; st.o.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`); }
      function moveSt(st, to, ms = 620, done, hop = 36) {
        if (st.stop) st.stop();
        const [x, y, s] = to, x0 = st.x, y0 = st.y, s0 = st.s;
        st.stop = ctx.tween(ms, k => placeSt(st, x0 + (x - x0) * k, y0 + (y - y0) * k - Math.sin(k * Math.PI) * hop, s0 + (s - s0) * k), () => {
          st.stop = null; squash(st.inner, .6); A.sfx('drop', { vol: .35, rate: rand(.85, 1.15) }); if (done) done();
        }, easeInOut);
      }
      function squash(node, a = 1, dur = 380) {
        node.animate([{ transform: 'scale(1)' }, { transform: `scale(${1 + .14 * a},${1 - .13 * a})`, offset: .3 }, { transform: `scale(${1 - .07 * a},${1 + .08 * a})`, offset: .65 }, { transform: 'scale(1)' }], { duration: dur, easing: 'ease-out' });
      }
      function mkStation() {
        const o = el('g', {}, stationsL);
        const shadow = el('g', {}, o);
        const inner = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, o);
        return { o, shadow, inner, x: 0, y: 0, s: 1 };
      }
      function addFace(st, x, y, k) { const f = face(st.inner, x, y, k); f.st = st; faces.push(f); st.face = f; return f; }
      // chopping board
      const board = mkStation();
      el('ellipse', { cx: 0, cy: 74, rx: 160, ry: 15, fill: INK, opacity: .13 }, board.shadow);
      el('rect', { x: -152, y: -50, width: 304, height: 122, rx: 36, fill: '#cf9658' }, board.inner);
      el('rect', { x: -152, y: -64, width: 304, height: 120, rx: 36, fill: 'url(#cooking-wood)' }, board.inner);
      ['M-126,-36 Q-40,-46 40,-34 T126,-40', 'M-120,30 Q-30,22 50,32 T112,26'].forEach(d => el('path', { d, stroke: '#e2a967', 'stroke-width': 3, fill: 'none', opacity: .55 }, board.inner));
      el('circle', { cx: 124, cy: -36, r: 10, fill: '#cf9658' }, board.inner);
      shine(board.inner, -96, -48, 36, 8, -5);
      addFace(board, 118, 30, 1);
      // pot
      const pot = mkStation();
      el('ellipse', { cx: 0, cy: 92, rx: 140, ry: 16, fill: INK, opacity: .13 }, pot.shadow);
      [-1, 1].forEach(s => el('rect', { x: s < 0 ? -152 : 120, y: -52, width: 32, height: 22, rx: 11, fill: '#e0564e' }, pot.inner));
      el('path', { d: 'M-122,-60 L122,-60 L116,50 Q112,88 72,90 L-72,90 Q-112,88 -116,50Z', fill: 'url(#cooking-pot)' }, pot.inner);
      el('path', { d: 'M-104,-30 Q-108,40 -88,70', stroke: '#fff', 'stroke-width': 11, opacity: .3, fill: 'none', 'stroke-linecap': 'round' }, pot.inner);
      el('ellipse', { cx: 0, cy: -60, rx: 128, ry: 28, fill: '#ff9d90' }, pot.inner);
      el('ellipse', { cx: 0, cy: -58, rx: 112, ry: 20, fill: '#8a3d3d' }, pot.inner);
      const sclip = el('clipPath', { id: 'cooking-soup' }, defs);
      el('ellipse', { cx: 0, cy: -58, rx: 112, ry: 20 }, sclip);
      const soupG = el('g', { 'clip-path': 'url(#cooking-soup)' }, pot.inner);
      const soup = el('ellipse', { cx: 0, cy: -53, rx: 112, ry: 20, fill: '#cfeeff' }, soupG);
      const soupBits = el('g', {}, soupG);
      const soupFx = el('g', {}, soupG);
      const ladle = el('g', { style: 'display:none' }, pot.inner);
      const ladleRing = el('ellipse', { rx: 18, ry: 5, fill: '#fff', opacity: .45 }, ladle);
      const ladleStick = el('path', { stroke: '#e8b371', 'stroke-width': 13, 'stroke-linecap': 'round', fill: 'none' }, ladle);
      const ladleHi = el('path', { stroke: '#fff', 'stroke-width': 4, opacity: .5, 'stroke-linecap': 'round', fill: 'none' }, ladle);
      addFace(pot, 0, 20, 1.5);
      // frying pan
      const pan = mkStation();
      el('ellipse', { cx: 20, cy: 96, rx: 170, ry: 15, fill: INK, opacity: .13 }, pan.shadow);
      el('rect', { x: 110, y: -2, width: 98, height: 28, rx: 14, fill: '#c98a56', transform: 'rotate(-8 110 12)' }, pan.inner);
      el('rect', { x: 124, y: 3, width: 70, height: 7, rx: 3.5, fill: '#fff', opacity: .3, transform: 'rotate(-8 110 12)' }, pan.inner);
      el('ellipse', { cx: 0, cy: 30, rx: 134, ry: 58, fill: '#5f9be6' }, pan.inner);
      el('rect', { x: -134, y: 0, width: 268, height: 30, fill: '#5f9be6' }, pan.inner);
      el('ellipse', { cx: 0, cy: 0, rx: 134, ry: 58, fill: '#8cc0ff' }, pan.inner);
      el('ellipse', { cx: 0, cy: 3, rx: 116, ry: 46, fill: '#4b5878' }, pan.inner);
      el('path', { d: 'M-108,-14 Q-84,-40 -40,-46', stroke: '#fff', 'stroke-width': 6, opacity: .25, fill: 'none', 'stroke-linecap': 'round' }, pan.inner);
      const panFx = el('g', {}, pan.inner);
      addFace(pan, 0, 70, 1.05);
      // plate / bento box with a cover
      const plate = mkStation();
      el('ellipse', { cx: 0, cy: 54, rx: 162, ry: 16, fill: INK, opacity: .13 }, plate.shadow);
      const plateBase = el('g', {}, plate.inner);
      el('ellipse', { cx: 0, cy: 22, rx: 152, ry: 46, fill: '#ddd6ee' }, plateBase);
      el('ellipse', { cx: 0, cy: 14, rx: 152, ry: 44, fill: '#fff' }, plateBase);
      el('ellipse', { cx: 0, cy: 14, rx: 112, ry: 30, fill: '#dcefff' }, plateBase);
      el('ellipse', { cx: 0, cy: 16, rx: 100, ry: 24, fill: '#e8f5ff' }, plateBase);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; el('circle', { cx: Math.cos(a) * 132, cy: 14 + Math.sin(a) * 37, r: 4, fill: '#ffc4d6' }, plateBase); }
      const boxBase = el('g', { style: 'display:none' }, plate.inner);
      el('rect', { x: -146, y: -46, width: 292, height: 112, rx: 28, fill: '#ff8fab' }, boxBase);
      el('rect', { x: -132, y: -50, width: 264, height: 100, rx: 20, fill: '#fff7ef' }, boxBase);
      const content = el('g', { class: 'tb' }, plate.inner);
      const coverO = el('g', {}, plate.inner);
      const cover = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, coverO);
      const dome = el('g', {}, cover);
      el('path', { d: 'M-120,12 Q-122,-124 0,-126 Q122,-124 120,12Z', fill: 'url(#cooking-dome)' }, dome);
      el('ellipse', { cx: 0, cy: 12, rx: 128, ry: 15, fill: '#c3cce0' }, dome);
      el('circle', { cx: 0, cy: -132, r: 15, fill: '#ffd56b' }, dome);
      shine(dome, -6, -137, 5, 3, -20, .7);
      el('path', { d: 'M-88,-60 Q-80,-100 -40,-110', stroke: '#fff', 'stroke-width': 10, opacity: .7, fill: 'none', 'stroke-linecap': 'round' }, dome);
      const lid = el('g', { style: 'display:none' }, cover);
      el('rect', { x: -152, y: -64, width: 304, height: 122, rx: 32, fill: '#ff7f9f' }, lid);
      el('rect', { x: 56, y: -64, width: 34, height: 122, fill: '#ffd56b' }, lid);
      el('path', { d: 'M73,-64 q-26,-30 -10,-34 q10,0 10,30 q0,-30 10,-30 q16,4 -10,34Z', fill: '#ffd56b' }, lid);
      shine(lid, -100, -44, 34, 8, -4, .35);
      const coverFace = face(cover, -20, -44, 1.5);
      faces.push(Object.assign(coverFace, { st: plate }));
      plate.face = coverFace;

      /* ================= food pieces (live in world space, ride on a station) ================= */
      const pieces = new Set();
      function mkPiece(host, lx, ly) {
        const o = el('g', {}, foodL);
        const inner = el('g', { class: 'tb' }, o);
        const p = { o, inner, host, lx, ly, wx: 0, wy: 0, rot: 0, sc: 1, fy: 1 };
        pieces.add(p);
        return p;
      }
      function worldOf(p) { return p.host ? [p.host.x + p.lx * p.host.s, p.host.y + p.ly * p.host.s, p.host.s] : [p.wx, p.wy, p.ws || 1]; }
      function detach(p) { const [x, y, s] = worldOf(p); p.host = null; p.wx = x; p.wy = y; p.ws = s; }
      function killPiece(p, ms = 220) {
        pieces.delete(p);
        p.inner.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.2)', opacity: 0 }], { duration: ms, fill: 'forwards' }).onfinish = () => p.o.remove();
      }
      function flyPiece(p, tx, ty, ts, ms, done, arc = 120, spin = 360) {
        detach(p);
        const x0 = p.wx, y0 = p.wy, s0 = p.ws, r0 = p.rot, top = Math.min(y0, ty) - arc;
        ctx.tween(ms, k => {
          p.wx = x0 + (tx - x0) * k;
          p.wy = (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * top + k * k * ty;
          p.ws = s0 + (ts - s0) * k; p.rot = r0 + spin * k;
        }, done, k => k);
      }

      /* ================= particles (one loop) ================= */
      const parts = [];
      function particle(x, y, vx, vy, r, color, life = .8, g = 900) {
        if (parts.length > 70) return;
        const node = el('circle', { r: r.toFixed(1), fill: color }, fxL);
        parts.push({ node, x, y, vx, vy, g, life, max: life });
      }
      function burst(x, y, n, colors, sp = 200, up = 220, r = [3, 6]) {
        for (let i = 0; i < n; i++) particle(x, y, rand(-sp, sp), rand(-up - 120, -up * .3), rand(r[0], r[1]), pick(colors), rand(.6, .9));
      }
      function steam(x, y, n = 3, s = 1) {
        for (let i = 0; i < n; i++) ctx.after(i * 180, () => {
          const o = el('g', { transform: `translate(${(x + (i - (n - 1) / 2) * 30 * s).toFixed(1)} ${y.toFixed(1)}) scale(${s})` }, fxL);
          const w = el('path', { d: 'M0,0 q-10,-16 0,-32 q10,-16 0,-32', stroke: '#fff', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, o);
          w.animate([{ transform: 'translateY(0px) scaleY(.5)', opacity: 0 }, { transform: 'translateY(-20px) scaleY(1)', opacity: .85, offset: .3 }, { transform: 'translateY(-70px) scaleY(1.2)', opacity: 0 }], { duration: 1500, easing: 'ease-out' }).onfinish = () => o.remove();
        });
      }
      function hearts(x, y, n = 6) {
        for (let i = 0; i < n; i++) {
          const g = el('g', { transform: `translate(${x} ${y}) scale(0)` }, fxL);
          el('path', { d: 'M0,8 C-16,-4 -10,-18 0,-10 C10,-18 16,-4 0,8Z', fill: pick(['#ff7a9a', '#ff9ccf', '#ff6b8a']) }, g);
          const dx = rand(-80, 80), d = rand(70, 140), sc = rand(1.1, 1.8), ph = rand(0, 6);
          ctx.after(i * 80, () => ctx.tween(1200, k => {
            g.setAttribute('transform', `translate(${(x + dx * k + Math.sin(k * 8 + ph) * 6).toFixed(1)} ${(y - d * k - 10).toFixed(1)}) scale(${(sc * Math.min(1, k * 4)).toFixed(2)})`);
            g.setAttribute('opacity', (1 - Math.max(0, k - .6) * 2.5).toFixed(2));
          }, () => g.remove(), easeOut));
        }
      }

      /* ================= step dots ================= */
      let dots = [];
      function buildDots(n) {
        uiL.replaceChildren();
        const tray = el('rect', { x: 200 - n * 22 - 8, y: 26, width: n * 44 + 16, height: 44, rx: 22, fill: '#fff', opacity: .75 }, uiL);
        tray.animate([{ opacity: 0 }, { opacity: .75 }], { duration: 400 });
        dots = [];
        for (let i = 0; i < n; i++) {
          const o = el('g', { transform: `translate(${200 + (i - (n - 1) / 2) * 44} 48)` }, uiL);
          const g = el('g', { class: 'tb' }, o);
          const c = el('circle', { r: 14, fill: '#fff', stroke: '#f2c94c', 'stroke-width': 3 }, g);
          const star = el('path', { d: 'M0,-9 l2.6,5.6 6,.7 -4.5,4.1 1.2,6 -5.3,-3 -5.3,3 1.2,-6 -4.5,-4.1 6,-.7Z', fill: '#fff', style: 'display:none' }, g);
          dots.push({ g, c, star, anim: null });
        }
      }
      function setDots(cur) {
        dots.forEach((d, i) => {
          if (d.anim) { d.anim.cancel(); d.anim = null; }
          const done = i < cur;
          d.c.setAttribute('fill', done ? '#ffb347' : i === cur ? '#fff3c4' : '#fff');
          d.star.style.display = done ? '' : 'none';
          if (i === cur) d.anim = d.g.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }], { duration: 520, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          if (i === cur - 1) { d.g.animate([{ transform: 'scale(.4)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' }); }
        });
      }

      /* ================= sounds ================= */
      function knock() {
        if (A.sfx(Math.random() < .7 ? 'knock' : 'woodblock', { vol: .8, rate: rand(.9, 1.2) })) { A.osc(rand(150, 180), { type: 'triangle', slide: 90, slideT: .05, r: .07, vol: .14, wet: 0 }); return; }
        A.osc(rand(170, 200), { type: 'triangle', slide: 95, slideT: .05, r: .09, vol: .3, wet: .05 });
        A.noise({ type: 'bandpass', from: 1900, dur: .045, vol: .2, q: 2, wet: 0 });
      }
      let sizzleT = 0;
      function sizzle(len = .7) {
        const now = performance.now(); if (now - sizzleT < 200) return; sizzleT = now;
        A.noise({ type: 'highpass', from: 3800, to: 5200, dur: len, vol: .09, wet: 0 });
        A.noise({ type: 'bandpass', from: 7000, dur: len * .7, vol: .05, q: .7, when: .05 });
      }
      function jaan() {
        say('じゃーん！');
        A.sfx('whoosh2', { vol: .5 }) || A.whoosh();
        A.sfx('harpup', { vol: .45, when: .1 });
        [0, 2, 4, 7].forEach((n, i) => A.bell(mtof(PENTA[n] + 12), { when: .12 + i * .08, vol: .13 }));
        ctx.after(250, () => A.twinkle());
      }

      /* ================= knife ================= */
      const knifeO = el('g', { style: 'display:none' }, toolL);
      const knife = el('g', {}, knifeO);
      el('rect', { x: -7, y: -150, width: 14, height: 30, rx: 5, fill: '#e86f86' }, knife);
      el('rect', { x: -13, y: -160, width: 26, height: 50, rx: 13, fill: '#ff8fa3' }, knife);
      el('rect', { x: -7, y: -154, width: 6, height: 34, rx: 3, fill: '#fff', opacity: .45 }, knife);
      el('path', { d: 'M-24,-112 L22,-112 Q28,-112 28,-104 L28,-12 Q28,0 14,0 L-24,0 Q-30,0 -30,-8 L-30,-104 Q-30,-112 -24,-112Z', fill: '#eef2f8' }, knife);
      el('path', { d: 'M-26,-3 L24,-3', stroke: '#cfd8e6', 'stroke-width': 5, 'stroke-linecap': 'round' }, knife);
      el('path', { d: 'M-20,-100 L-20,-24', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round' }, knife);
      el('circle', { cx: 14, cy: -96, r: 6, fill: '#d6deea' }, knife);
      const kn = { x: 200, y: 520, up: 1, stop: null };

      /* ================= recipe steps ================= */
      let veg = [], board2 = []; // veg pieces in order; board2: pieces sitting on the board after chopping
      const S = {};
      S.chop = {
        enter(done) {
          const V = VEG[R.veg], n = V.segs, L = V.L, X0 = -14 - n * L / 2;
          veg = [];
          for (let i = 0; i < n; i++) {
            const x0 = X0 + i * L, x1 = x0 + L, cx = (x0 + x1) / 2, h0 = V.h(x0), h1 = V.h(x1);
            const p = mkPiece(board, cx, -4);
            const segV = el('g', {}, p.inner), coinV = el('g', { style: 'display:none' }, p.inner);
            const a0 = x0 - cx, a1 = x1 - cx + .8;
            let d = `M${a0},${-h0 / 2} L${a1},${-h1 / 2} `;
            d += i === n - 1 ? `Q${a1 + h1 * .7},0 ${a1},${h1 / 2} ` : `L${a1},${h1 / 2} `;
            d += `L${a0},${h0 / 2} `;
            d += i === 0 ? `Q${a0 - h0 * .6},0 ${a0},${-h0 / 2}Z` : 'Z';
            if (i === 0 && V.top) V.top(segV, a0, h0);
            if (i === n - 1 && V.tip) V.tip(segV, a1);
            el('path', { d, fill: V.c }, segV);
            el('path', { d: `M${a0 + (i ? 0 : 3)},${h0 / 2 - 6} L${a1 - (i === n - 1 ? 3 : 0)},${h1 / 2 - 6}`, stroke: V.d, 'stroke-width': 8, opacity: .55, 'stroke-linecap': 'round' }, segV);
            el('path', { d: `M${a0 - (i ? 0 : 4)},${-h0 / 2 + 7} L${a1},${-h1 / 2 + 7}`, stroke: '#fff', 'stroke-width': 5, opacity: .4, 'stroke-linecap': i ? 'butt' : 'round' }, segV);
            if (R.veg === 'carrot' && i % 2) el('path', { d: `M${a0 + 10},${h0 * .18} l12,0`, stroke: V.d, 'stroke-width': 3, 'stroke-linecap': 'round' }, segV);
            if (i === 0) { const fg = el('g', { transform: `translate(${(a0 + 8).toFixed(1)} -4) scale(.9)` }, segV); p.face = face(fg, 0, 0, 1); }
            V.coin(coinV);
            Object.assign(p, { segV, coinV, cut: false });
            p.inner.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.15)', offset: .7 }, { transform: 'scale(1)' }], { duration: 380, delay: i * 60, fill: 'backwards', easing: 'ease-out' });
            veg.push(p);
          }
          if (veg[0].face) faces.push(Object.assign(veg[0].face, { piece: veg[0] }));
          this.n = 0; this.need = n - 1;
          knifeO.style.display = '';
          knifeO.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
          kn.up = 1;
          ctx.after(450, done);
        },
        cutX(c) { const p = veg[c]; return board.x + (p.lx - VEG[R.veg].L / 2) * board.s; },
        hint() { return this.n < this.need ? [this.cutX(this.need - this.n), board.y - 60] : null; },
        act() {
          const c = this.need - this.n; // cut between c-1 and c (from the tip)
          this.n++;
          if (kn.stop) kn.stop();
          kn.x = this.cutX(c);
          kn.stop = ctx.tween(260, k => { kn.up = k < .35 ? 1 - k / .35 : (k - .35) / .65; }, () => { kn.stop = null; kn.up = 1; }, k => k);
          ctx.after(90, () => {
            knock(); haptic(14);
            squash(board.inner, .35, 260);
            const p = veg[c];
            // everything from c to the tip slides away a little; the cut slice becomes a coin
            for (let j = c; j < veg.length; j++) { const q = veg[j]; const lx0 = q.lx; ctx.tween(200, k => { q.lx = lx0 + 6 * k; }, null, easeOut); }
            p.cut = true; p.segV.style.display = 'none'; p.coinV.style.display = '';
            const ly0 = p.ly, r0 = p.rot, lx0 = p.lx, dx = 14 + rand(0, 10);
            const spin = (c % 2 ? 1 : -1) * rand(14, 26);
            ctx.tween(420, k => { p.ly = ly0 - Math.sin(k * Math.PI) * 34; p.rot = r0 + spin * k; p.lx = lx0 + dx * k; }, () => squash(p.inner, .8, 300), easeOut);
            squash(p.inner, 1, 300);
            A.sfx('pop2', { vol: .35, rate: rand(1, 1.35) });
            const [wx, wy] = worldOf(p);
            burst(wx, wy, 4, [VEG[R.veg].c, '#fff'], 120, 160, [2.5, 4.5]);
            if (veg[0].face) { veg[0].face.set('wow'); ctx.after(300, () => veg[0].face && veg[0].face.set('normal')); }
            if (this.n === 1) { ctx.bubble('とんとん', 200, board.y - 120); say('とんとん'); }
            if (this.n >= this.need) this.finish();
          });
          if (this.n >= this.need) busy = true;
        },
        finish() {
          busy = true;
          ctx.after(380, () => {
            // the last piece turns into a coin too, and they all tumble apart
            const p = veg[0];
            if (p.face) { faces.splice(faces.indexOf(p.face), 1); p.face = null; }
            p.segV.style.display = 'none'; p.coinV.style.display = '';
            const [wx, wy] = worldOf(p);
            if (R.veg === 'carrot') burst(wx - 20, wy - 10, 6, ['#4cc44a', '#5cd15a'], 160, 260, [3, 6]);
            knock();
            const cols = Math.ceil(veg.length / 2);
            veg.forEach((q, i) => {
              const tx = -96 + (i % cols) * (150 / Math.max(1, cols - 1)) + rand(-6, 6), ty = i < cols ? -16 : 28;
              const lx0 = q.lx, ly0 = q.ly, r0 = q.rot, r1 = rand(-30, 30);
              ctx.after(i * 50, () => ctx.tween(480, k => { q.lx = lx0 + (tx - lx0) * k; q.ly = ly0 + (ty - ly0) * k - Math.sin(k * Math.PI) * 50; q.rot = r0 + (r1 - r0) * k; }, () => squash(q.inner, .9, 300), easeOut));
            });
            A.sfx('spring', { vol: .45, rate: 1.15 }) || A.boing();
            ctx.after(300, () => { ctx.sparkle(board.x, board.y - 40, 5, 110); A.twinkle(); board.face.set('joy'); ghost.hop(); });
            knifeO.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => { knifeO.style.display = 'none'; knifeO.getAnimations().forEach(a => a.cancel()); };
            board2 = veg.slice(); veg = [];
            ctx.after(650, () => { board.face.set('normal'); nextStep(); });
          });
        }
      };
      S.drop = {
        enter(done) {
          moveSt(board, POS.board.L, 640);
          pot.o.parentNode.appendChild(pot.o);
          moveSt(pot, POS.pot.stage, 640, () => { pot.face.set('wow'); ctx.after(400, () => pot.face.set('normal')); done(); });
          this.n = 0; this.fin = false; this.groups = [];
          const list = board2.slice();
          while (list.length) this.groups.push(list.splice(0, 2));
          this.need = this.groups.length;
        },
        hint() { const g = this.groups[this.n]; return g ? worldOf(g[0]).slice(0, 2) : null; },
        act() {
          const g = this.groups[this.n++];
          if (!g) return;
          if (this.n >= this.need) busy = true;
          g.forEach((p, j) => {
            board2.splice(board2.indexOf(p), 1);
            const tx = pot.x + rand(-60, 60), ty = pot.y - 56 * pot.s;
            ctx.after(j * 90, () => flyPiece(p, tx, ty, 1, 520, () => {
              pieces.delete(p); p.o.remove();
              A.sfx('splash2', { vol: .55, rate: rand(.9, 1.2) }) || A.noise({ from: 600, to: 1800, dur: .3, vol: .18 });
              burst(tx, ty, 8, ['#bfe6ff', '#ffffff', '#9fd8ff'], 150, 240, [3, 5.5]);
              squash(pot.inner, .5, 320);
              pot.face.set('joy'); ctx.after(380, () => pot.face.set('normal'));
              const lx = (tx - pot.x) / pot.s;
              const ch = el('g', { transform: `translate(${lx.toFixed(1)} ${(-54 + rand(-6, 6)).toFixed(1)})` }, soupBits);
              const chi = el('g', {}, ch);
              el('circle', { r: 11, fill: R.veg === 'carrot' ? '#ff9a3c' : '#ffe08a' }, chi);
              el('circle', { r: 6, fill: '#ffb867' }, chi);
              chi.animate([{ transform: 'translateY(-3px)' }, { transform: 'translateY(2px)' }], { duration: rand(700, 1000), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
              if (j === 0 && this.n === 1) { ctx.bubble('ぽちゃん', 200, pot.y - 150); say('ぽちゃん'); }
              if (this.n >= this.need && !board2.length && !this.fin) {
                this.fin = true;
                // a potato and an onion hop in too
                [['#ffe08a', -40], ['#fff3d6', 40]].forEach(([c, dx], q) => ctx.after(250 + q * 200, () => {
                  const ch2 = el('g', { transform: `translate(${dx} -52)` }, soupBits);
                  el('rect', { x: -10, y: -8, width: 20, height: 16, rx: 5, fill: c }, ch2);
                  A.sfx('splash', { vol: .3, rate: 1.3 });
                }));
                ctx.after(900, nextStep);
              }
            }, 140, rand(200, 400)));
          });
          A.sfx('whoosh', { vol: .35, rate: rand(1, 1.3) });
        }
      };
      S.stir = {
        enter(done) {
          this.p = 0; this.th = 0; this.fin = false; this.bt = 0;
          ladle.style.display = '';
          ladle.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
          this.draw();
          this.from = soup.getAttribute('fill');
          ctx.after(300, done);
        },
        draw() {
          const bx = Math.cos(this.th) * 64, by = -53 + Math.sin(this.th) * 11;
          ladleRing.setAttribute('cx', bx.toFixed(1)); ladleRing.setAttribute('cy', by.toFixed(1));
          const ex = bx * .4 + 56, ey = by - 150;
          ladleStick.setAttribute('d', `M${bx.toFixed(1)},${by.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`);
          ladleHi.setAttribute('d', `M${(bx + (ex - bx) * .2 - 3).toFixed(1)},${(by + (ey - by) * .2).toFixed(1)} L${(bx + (ex - bx) * .85 - 3).toFixed(1)},${(by + (ey - by) * .85).toFixed(1)}`);
        },
        hint() { return [pot.x, pot.y - 50]; },
        bubbleUp() {
          const b = el('circle', { cx: rand(-90, 90).toFixed(0), cy: rand(-60, -46).toFixed(0), r: rand(4, 9).toFixed(1), fill: 'none', stroke: '#fff', 'stroke-width': 2.5, opacity: .8, class: 'tb' }, soupFx);
          b.animate([{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1.2)', opacity: .9, offset: .7 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: rand(450, 700) }).onfinish = () => b.remove();
        },
        add(amt, dth) {
          if (this.fin) return;
          this.th += dth; this.p = Math.min(1, this.p + amt);
          this.draw();
          soup.setAttribute('fill', mix(this.from, '#d98a2b', this.p));
          const now = performance.now();
          if (now - this.bt > 520) { this.bt = now; A.sfx('bubbles', { vol: .5, rate: rand(.85, 1.2) }) || A.osc(rand(200, 340), { slide: 700, slideT: .06, r: .06, vol: .14 }); }
          for (let i = 0; i < 2; i++) if (Math.random() < .7) this.bubbleUp();
          if (this.p >= 1) this.finish();
        },
        act() {
          if (this.fin) return;
          squash(pot.inner, .3, 300);
          pot.face.set('joy'); ctx.after(350, () => { if (phase === 'cook') pot.face.set('normal'); });
          const th0 = this.th;
          if (this.p === 0) { ctx.bubble('ぐるぐる', 200, pot.y - 160); say('ぐるぐる'); }
          let last = 0;
          ctx.tween(380, k => { const d = k - last; last = k; this.add(.24 * d, 2.2 * d); }, null, easeOut);
          if (th0 === this.th) this.add(.001, 0);
        },
        drag(d) { this.add(d / 420, d / 60); if (Math.random() < d / 80) squash(pot.inner, .12, 200); },
        finish() {
          this.fin = true; busy = true;
          pot.face.set('joy');
          ctx.after(150, () => { say('ぐつぐつ'); ctx.bubble('ぐつぐつ', 200, pot.y - 160); });
          for (let i = 0; i < 8; i++) ctx.after(i * 90, () => this.bubbleUp());
          steam(pot.x, pot.y - 90, 3, 1.2);
          ctx.sparkle(pot.x, pot.y - 80, 4, 90);
          A.twinkle();
          ctx.after(1000, () => { ladle.style.display = 'none'; pot.face.set('normal'); nextStep(); });
        }
      };
      let pancake = null;
      const bowlO = el('g', { style: 'display:none' }, toolL);
      const bowl = el('g', {}, bowlO);
      el('path', { d: 'M-50,-14 Q-48,40 0,42 Q48,40 50,-14Z', fill: '#ffb3c4' }, bowl);
      el('ellipse', { cx: 0, cy: -14, rx: 52, ry: 14, fill: '#ffd0dc' }, bowl);
      el('ellipse', { cx: 0, cy: -12, rx: 42, ry: 9, fill: '#fff0c2' }, bowl);
      shine(bowl, -30, 6, 6, 12, 10, .4);
      const bowlFace = face(bowl, 0, 14, .8);
      const stream = el('path', { stroke: '#fff0c2', 'stroke-width': 16, 'stroke-linecap': 'round', fill: 'none', style: 'display:none' }, toolL);
      S.pour = {
        enter(done) {
          moveSt(board, POS.board.R, 640);
          pan.o.parentNode.appendChild(pan.o);
          moveSt(pan, POS.pan.stage, 640);
          this.bx = POS.pan.stage[0] - 60; this.by = POS.pan.stage[1] - 200;
          ctx.after(250, () => {
            bowlO.style.display = '';
            ctx.tween(480, k => bowlO.setAttribute('transform', `translate(${(this.bx - 200 * (1 - k)).toFixed(1)} ${(this.by - 60 * Math.sin(k * Math.PI)).toFixed(1)})`), () => { A.sfx('pop', { vol: .5 }); bowl.animate([{ transform: 'scale(1.15,.85)' }, { transform: 'scale(1)' }], { duration: 260 }); done(); }, easeOut);
          });
          pancake = mkPiece(pan, 0, 2);
          pancake.sc = .02;
          pancake.edge = el('ellipse', { cx: 0, cy: 6, rx: 96, ry: 38, fill: '#f6dca0' }, pancake.inner);
          pancake.top = el('ellipse', { cx: 0, cy: 0, rx: 96, ry: 38, fill: '#fff0c2' }, pancake.inner);
          pancake.holes = el('g', {}, pancake.inner);
          pancake.faceG = el('g', { style: 'display:none' }, pancake.inner);
          tinyFace(pancake.faceG, 0, 1.6);
          this.n = 0; this.need = 2;
        },
        hint() { return [this.bx, this.by]; },
        act() {
          this.n++;
          busy = true;
          const n = this.n;
          bowlFace.set('joy');
          ctx.tween(260, k => bowlO.setAttribute('transform', `translate(${this.bx} ${this.by}) rotate(${(55 * k).toFixed(0)})`), () => {
            stream.style.display = '';
            const lipX = this.bx + 46, lipY = this.by + 18;
            stream.setAttribute('d', `M${lipX},${lipY} Q${lipX + 10},${lipY + 70} ${pan.x},${pan.y}`);
            stream.animate([{ strokeDasharray: '0 400' }, { strokeDasharray: '400 0' }], { duration: 200, fill: 'forwards' });
            A.sfx('pour', { vol: .5, rate: rand(.95, 1.1) }) || A.noise({ type: 'lowpass', from: 700, to: 1600, dur: .7, vol: .15 });
            const s0 = pancake.sc, s1 = n === 1 ? .55 : 1;
            ctx.tween(650, k => { pancake.sc = s0 + (s1 - s0) * k; }, () => {
              stream.style.display = 'none';
              squash(pancake.inner, .6, 300);
              sizzle(.8);
              ctx.tween(260, k => bowlO.setAttribute('transform', `translate(${this.bx} ${this.by}) rotate(${(55 * (1 - k)).toFixed(0)})`));
              bowlFace.set('normal');
              if (n === 1) { ctx.bubble('とろーり', 200, pan.y - 150); say('とろーり'); release(); }
              if (n >= this.need) {
                ctx.after(300, () => ctx.tween(420, k => bowlO.setAttribute('transform', `translate(${(this.bx - 260 * k).toFixed(1)} ${(this.by - 80 * k).toFixed(1)})`), () => { bowlO.style.display = 'none'; }, easeIn));
                for (let i = 0; i < 6; i++) ctx.after(200 + i * 120, () => {
                  const h = el('circle', { cx: rand(-60, 60).toFixed(0), cy: rand(-20, 20).toFixed(0), r: rand(2.5, 4.5).toFixed(1), fill: '#e8c47e', class: 'tb' }, pancake.holes);
                  h.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300 });
                });
                ctx.after(1000, nextStep);
              }
            }, easeOut);
          });
        }
      };
      S.flip = {
        enter(done) { this.n = 0; this.need = 2; sizzle(.6); done(); },
        hint() { return [pan.x, pan.y - 20]; },
        act() {
          this.n++;
          busy = true;
          const n = this.n, ly0 = pancake.ly;
          A.sfx('whoosh', { vol: .6, rate: rand(.95, 1.15) }) || A.whoosh();
          A.sfx('spin', { vol: .4, rate: rand(1, 1.2) });
          squash(pan.inner, .6, 300);
          pan.face.set('wow');
          let swapped = false;
          ctx.tween(820, k => {
            pancake.ly = ly0 - Math.sin(k * Math.PI) * 230;
            pancake.fy = Math.max(.08, Math.abs(Math.cos(k * Math.PI)));
            pancake.sc = 1 + Math.sin(k * Math.PI) * .12;
            pancake.rot = Math.sin(k * Math.PI) * (n === 1 ? 24 : -24);
            if (!swapped && k > .5) {
              swapped = true;
              pancake.top.setAttribute('fill', '#f2b45a'); pancake.edge.setAttribute('fill', '#d99448');
              pancake.holes.replaceChildren();
              if (n === 2) pancake.faceG.style.display = '';
            }
          }, () => {
            pancake.ly = ly0; pancake.fy = 1; pancake.rot = 0; pancake.sc = 1;
            squash(pancake.inner, 1, 360);
            squash(pan.inner, .5, 300);
            sizzle(.5);
            A.sfx('pop2', { vol: .4, rate: .8 });
            pan.face.set('joy');
            const [wx, wy] = worldOf(pancake);
            burst(wx, wy, 6, ['#ffe08a', '#fff'], 180, 160, [2.5, 4]);
            if (n === 1) { ctx.bubble('くるりん', 200, pan.y - 170); say('くるりん'); }
            if (n >= this.need) {
              ctx.sparkle(wx, wy - 20, 5, 70); A.twinkle(); steam(wx, wy - 30, 3, 1);
              ctx.after(900, () => { pan.face.set('normal'); nextStep(); });
            } else { release(); ctx.after(400, () => pan.face.set('normal')); }
          }, k => k);
        }
      };
      let octos = [];
      S.fry = {
        enter(done) {
          moveSt(board, POS.board.R, 640);
          pan.o.parentNode.appendChild(pan.o);
          moveSt(pan, POS.pan.stage, 640, done);
          this.n = 0; this.need = 3; octos = [];
        },
        hint() { return this.n ? [pan.x, pan.y - 10] : worldOf(board2[0] || { host: board, lx: 0, ly: 0 }).slice(0, 2); },
        act() {
          this.n++;
          if (this.n >= this.need) busy = true;
          const n = this.n;
          if (n === 1) {
            board2.forEach((p, i) => {
              const lx = [-62, 4, 66, -20][i % 4], ly = [-6, -22, -2, 20][i % 4];
              ctx.after(i * 90, () => flyPiece(p, pan.x + lx * pan.s, pan.y + ly * pan.s, pan.s, 480, () => {
                p.host = pan; p.lx = lx; p.ly = ly; p.rot = 0; p.sc = 1;
                sizzle(.7); squash(p.inner, 1, 320);
                burst(pan.x + lx * pan.s, pan.y + ly * pan.s - 10, 4, ['#ffe066', '#fff'], 120, 200, [2, 3.5]);
              }, 130, 360));
              octos.push(p);
            });
            board2 = [];
            A.sfx('whoosh2', { vol: .4 });
            ctx.after(500, () => { ctx.bubble('じゅうじゅう', 200, pan.y - 160); say('じゅうじゅう'); });
          } else {
            sizzle(.8);
            octos.forEach((p, i) => ctx.after(i * 60, () => {
              p.inner.animate([{ transform: 'translateY(0px) rotate(0deg) scale(1)' }, { transform: `translateY(-26px) rotate(${i % 2 ? 20 : -20}deg) scale(.9,1.12)`, offset: .45 }, { transform: 'translateY(0px) rotate(0deg) scale(1.15,.85)', offset: .8 }, { transform: 'translateY(0px) rotate(0deg) scale(1)' }], { duration: 420, easing: 'ease-out' });
              p.inner.querySelectorAll('path').forEach(q => { if (q.getAttribute('fill') === '#ff7b74') q.setAttribute('fill', n === 2 ? '#ff6a62' : '#f2554e'); });
              const [wx, wy] = worldOf(p);
              burst(wx, wy - 6, 3, ['#ffe066', '#fff3b0'], 110, 220, [2, 3.5]);
            }));
            squash(pan.inner, .4, 300);
            pan.face.set('joy'); ctx.after(380, () => pan.face.set('normal'));
            if (n >= this.need) {
              steam(pan.x, pan.y - 40, 3, 1);
              ctx.after(400, () => { ctx.sparkle(pan.x, pan.y - 20, 4, 90); A.twinkle(); });
              ctx.after(1000, nextStep);
            }
          }
        }
      };
      let rice = null;
      const RICE = [
        'M-64,30 Q-66,-14 0,-22 Q66,-14 64,30 Q0,40 -64,30Z',
        'M-52,30 Q-60,-34 0,-42 Q60,-34 52,30 Q0,42 -52,30Z',
        'M-46,30 Q-50,-10 -20,-40 Q0,-60 20,-40 Q50,-10 46,30 Q0,40 -46,30Z',
        'M0,-58 Q12,-58 46,6 Q58,32 30,36 L-30,36 Q-58,32 -46,6 Q-12,-58 0,-58Z'
      ];
      S.rice = {
        enter(done) {
          moveSt(pan, POS.pan.park, 640);
          board.o.parentNode.appendChild(board.o);
          moveSt(board, POS.board.stage, 640, () => {
            rice = mkPiece(board, -24, -6);
            rice.path = el('path', { d: RICE[0], fill: '#fffdf7', stroke: '#ece4d6', 'stroke-width': 3 }, rice.inner);
            rice.grains = el('g', {}, rice.inner);
            [[-30, 0], [-10, -10], [14, 4], [30, -6], [0, 16], [-22, 18], [24, 20]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 4, ry: 2.2, fill: '#efe8d8', transform: `rotate(${rand(-40, 40).toFixed(0)} ${x} ${y})` }, rice.grains));
            rice.nori = el('rect', { x: -22, y: 8, width: 44, height: 28, rx: 4, fill: '#35584a', style: 'display:none', class: 'tb' }, rice.inner);
            rice.faceG = el('g', { style: 'display:none' }, rice.inner);
            tinyFace(rice.faceG, -10, 1.5);
            rice.inner.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.2,.85)', offset: .6 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
            A.sfx('pop', { vol: .5, rate: .8 });
            ctx.sparkle(board.x - 24, board.y - 30, 3, 50, '#ffffff');
            done();
          });
          this.n = 0; this.need = 3;
        },
        hint() { return [board.x - 24 * board.s, board.y - 20]; },
        act() {
          this.n++;
          if (this.n >= this.need) busy = true;
          const n = this.n;
          rice.path.setAttribute('d', RICE[n]);
          if (n === 2) rice.grains.style.display = 'none';
          rice.inner.animate([{ transform: 'scale(1.25,.75)' }, { transform: 'scale(.9,1.12)', offset: .5 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
          A.sfx('squish', { vol: .6, rate: rand(.9, 1.15) }) || A.sfx('pop2', { vol: .45, rate: rand(.6, .75) }) || A.pop();
          A.osc(220 + n * 60, { type: 'triangle', slide: 320 + n * 60, slideT: .08, r: .1, vol: .1 });
          squash(board.inner, .25, 260);
          const [wx, wy] = worldOf(rice);
          burst(wx, wy, 5, ['#ffffff', '#f4efe4'], 150, 180, [2.5, 4]);
          if (n === 1) { ctx.bubble('ぎゅっ ぎゅっ', 200, board.y - 130); say('ぎゅっ ぎゅっ'); }
          if (n >= this.need) {
            ctx.after(260, () => {
              rice.nori.style.display = '';
              rice.nori.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1.15)' }, { transform: 'scaleX(1)' }], { duration: 320 });
              A.sfx('flip', { vol: .5 });
            });
            ctx.after(620, () => { rice.faceG.style.display = ''; squash(rice.inner, 1, 400); ctx.sparkle(wx, wy - 20, 5, 70); A.twinkle(); board.face.set('joy'); });
            ctx.after(1400, () => { board.face.set('normal'); nextStep(); });
          }
        }
      };
      S.serve = {
        enter(done) {
          if (pot.x !== POS.pot.park[0] || pot.y !== POS.pot.park[1]) moveSt(pot, POS.pot.park, 620);
          if (pan.x !== POS.pan.park[0] || pan.y !== POS.pan.park[1]) moveSt(pan, POS.pan.park, 620);
          const lidMode = R.cover === 'lid';
          plateBase.style.display = lidMode ? 'none' : ''; boxBase.style.display = lidMode ? '' : 'none';
          dome.style.display = lidMode ? 'none' : ''; lid.style.display = lidMode ? '' : 'none';
          coverO.setAttribute('transform', lidMode ? 'translate(0 -8)' : '');
          coverO.style.opacity = 1;
          content.replaceChildren(); R.dish(content); content.style.opacity = 0;
          coverFace.set('normal');
          placeSt(plate, ...POS.plate.off);
          stationsL.appendChild(plate.o);
          content.getAnimations().forEach(a => a.cancel());
          content.style.transform = '';
          A.sfx('slide', { vol: .35, rate: 1.2 }) || A.whoosh();
          // whatever is still out hops up and waits for the plate
          const left = [...pieces];
          left.forEach((p, i) => {
            const s0 = p.host ? p.host.s : (p.ws || 1);
            flyPiece(p, 200 + (i - (left.length - 1) / 2) * 34, 470 + (i % 2) * 14, Math.min(.8, s0), 420, () => squash(p.inner, .6, 240), 60, 0);
          });
          ctx.after(240, () => moveSt(board, POS.board.off, 600, null, 0));
          ctx.after(200, () => moveSt(plate, POS.plate.stage, 700, () => {
            A.sfx('pop', { vol: .5, rate: .9 });
            left.forEach((p, i) => ctx.after(i * 70, () => flyPiece(p, plate.x + rand(-40, 40), plate.y - 70, .4, 400, () => { killPiece(p, 160); A.sfx('blink', { vol: .4, rate: rand(1, 1.4) }); squash(cover, .25, 220); }, 70, 200)));
            ctx.after(left.length * 70 + 450, () => {
              this.wob = ctx.every(1600, () => { if (busy || phase !== 'cook') return; cover.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' }], { duration: 500 }); });
              coverFace.set('wow'); ctx.after(500, () => coverFace.set('normal'));
              done();
            });
          }, 20));
          this.n = 0; this.need = 1;
        },
        hint() { return [plate.x, plate.y - 80]; },
        act() {
          this.n++; busy = true;
          clearInterval(this.wob);
          coverFace.set('joy');
          squash(cover, .8, 260);
          ctx.after(180, () => {
            const sx = 0, sy = 0;
            ctx.tween(700, k => {
              coverO.setAttribute('transform', `translate(${(sx + 230 * k).toFixed(1)} ${(sy - 300 * Math.sin(k * Math.PI * .6) - (R.cover === 'lid' ? 8 : 0)).toFixed(1)}) rotate(${(40 * k).toFixed(0)})`);
              coverO.style.opacity = (1 - Math.max(0, k - .6) * 2.5).toFixed(2);
            }, null, easeOut);
            jaan();
            content.style.opacity = 1;
            content.animate([{ transform: 'scale(.6)' }, { transform: 'scale(1.12)', offset: .55 }, { transform: 'scale(.96)', offset: .8 }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
            ctx.sparkle(plate.x, plate.y - 30, 8, 130, rare ? '#ffd23f' : '#ffe066');
            if (rare) ctx.after(300, () => ctx.sparkle(plate.x, plate.y - 30, 6, 120, '#ffffff'));
            steam(plate.x, plate.y - 60, 3, 1.2);
            ctx.after(900, () => steam(plate.x, plate.y - 60, 3, 1.1));
            ctx.bubble('じゃーん！', 200, plate.y - 170);
            ghost.set('happy'); ghost.hop();
            ctx.after(1200, friendPhase);
          });
        }
      };

      /* ================= flow ================= */
      function startStep(i) {
        stepI = i; step = S[R.steps[i]]; busy = true;
        setDots(i);
        queued = false;
        step.enter(release);
      }
      function nextStep() {
        if (stepI + 1 < R.steps.length) startStep(stepI + 1);
      }
      let queued = false;
      function release() { busy = false; if (queued) { queued = false; ctx.after(60, act); } }
      function act() {
        if (phase === 'cook' && busy) queued = true;
        if (phase !== 'cook' || busy || !step) return false;
        step.act();
        return true;
      }

      /* ================= the hungry friend ================= */
      let friend = null, friend2 = null;
      function makeFriend(kind, x, y, s) {
        const a = makeAnimal(kind, friendL, x, y, s);
        const nap = el('g', {}, a.body);
        el('path', { d: 'M-36,38 Q0,50 36,38 L0,80Z', fill: '#fff' }, nap);
        [[-14, 48], [14, 48], [0, 62]].forEach(([cx, cy]) => el('circle', { cx, cy, r: 3.4, fill: '#ff8fa3' }, nap));
        [-1, 1].forEach(sd => el('ellipse', { cx: sd * 40, cy: 64, rx: 14, ry: 10, fill: FCOL[kind], stroke: kind === 'bunny' ? '#f3d8e2' : 'none', 'stroke-width': 2 }, a.body));
        el('circle', { cx: 0, cy: 6, r: 80, fill: 'transparent' }, a.body);
        const f = { a, kind, x, y, s };
        a.outer.addEventListener('pointerdown', e => {
          e.stopPropagation(); haptic();
          cry(kind, { rate: rand(.95, 1.15) });
          a.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14,.86)' }, { transform: 'scale(.94,1.08)' }, { transform: 'scale(1)' }], { duration: 380 });
          hearts(f.x, f.y - 40, 2);
          if (phase === 'eat' && f === friend) bite(true);
        });
        return f;
      }
      function placeFriend(f, x, y) { f.x = x; f.y = y; f.a.place(x, y, f.s); }
      let bites = 0, bitesDone = false;
      function bite(extra) {
        if (!friend) return;
        const f = friend;
        f.a.mouth(true);
        const fromX = plate.x + rand(-50, 50), fromY = plate.y - 10;
        const mo = el('g', { transform: `translate(${fromX} ${fromY})` }, fxL);
        const colors = { curry: ['#d98a2b', '#fffdf5'], pancake: ['#f2b45a', '#fff3a6'], bento: ['#fffdf7', '#ff7b74'] }[R.id];
        el('circle', { r: 11, fill: colors[0] }, mo); el('circle', { cx: 7, cy: -5, r: 7, fill: colors[1] }, mo);
        const tx = f.x, ty = f.y + 22 * f.s;
        ctx.tween(380, k => mo.setAttribute('transform', `translate(${(fromX + (tx - fromX) * k).toFixed(1)} ${(fromY + (ty - fromY) * k - Math.sin(k * Math.PI) * 70).toFixed(1)}) scale(${(1 - k * .5).toFixed(2)})`), () => {
          mo.remove();
          A.sfx(pick(['crunch', 'munch', 'crunchy']), { vol: .7, rate: rand(.9, 1.2) }) || A.sfx('crunch', { vol: .7 }) || A.osc(250, { type: 'triangle', slide: 140, slideT: .07, r: .07, vol: .2 });
          haptic(10);
          for (let i = 0; i < 4; i++) ctx.after(i * 120, () => f.a.mouth(i % 2 === 1));
          f.a.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08,.93)' }, { transform: 'scale(1)' }], { duration: 160, iterations: 2 });
          burst(tx, ty, 4, colors, 90, 120, [2, 3.5]);
          if (extra) hearts(tx, ty - 50, 2);
        }, easeInOut);
        if (!extra) {
          bites++;
          const k = Math.max(0, 1 - bites / 3);
          const c0 = 1 - (bites - 1) / 3 * .7, c1 = k > 0 ? k * .7 + .3 : 0;
          ctx.after(300, () => ctx.tween(300, q => { content.style.transform = `scale(${(c0 + (c1 - c0) * q).toFixed(3)})`; }, null, easeOut));
          if (friend2) ctx.after(160, () => { friend2.a.sing(300); cry(friend2.kind, { vol: .5, rate: 1.2 }); });
        }
      }
      function friendPhase() {
        phase = 'eat'; bites = 0; bitesDone = false;
        setDots(R.steps.length);
        ghost.moveTo(332, 262, .48, 700, null, easeInOut);
        const kind = FRIENDS[round % FRIENDS.length];
        friend = makeFriend(kind, 520, 446, 1.3);
        A.sfx('boing', { vol: .5 }) || A.boing();
        ctx.tween(800, k => placeFriend(friend, 520 + (200 - 520) * k, 446 - Math.abs(Math.sin(k * Math.PI * 3)) * 40 * (1 - k * .6)), () => {
          cry(kind); friend.a.mouth(true);
          friend.a.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15,.85)' }, { transform: 'scale(.94,1.08)' }, { transform: 'scale(1)' }], { duration: 420 });
          ctx.after(300, () => { ctx.bubble('いただきます！', 200, 340); say('いただきます！'); });
        }, easeOut);
        if (rare) {
          friend2 = makeFriend(kind === 'chick' ? 'bunny' : 'chick', -120, 470, .8);
          ctx.after(300, () => ctx.tween(800, k => placeFriend(friend2, -120 + (64 + 120) * k, 470 - Math.abs(Math.sin(k * Math.PI * 3)) * 30), () => { cry(friend2.kind, { vol: .6 }); friend2.a.mouth(true); }, easeOut));
        }
        [1500, 2150, 2800].forEach(t => ctx.after(t, () => bite(false)));
        ctx.after(3500, payoff);
      }
      function payoff() {
        bitesDone = true;
        const f = friend;
        f.a.mouth(false); f.a.sleep(true);
        ctx.bubble('おいしい！', 200, 330); say('おいしい！');
        hearts(f.x, f.y - 30, 8);
        if (friend2) hearts(friend2.x, friend2.y - 30, 4);
        haptic(30);
        A.tada();
        ctx.confetti(200, 600, 40);
        ctx.after(700, () => { ctx.confetti(110, 420, 24); ctx.confetti(290, 420, 24); });
        [f, friend2].filter(Boolean).forEach((q, j) => q.a.body.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(-30px) scale(.9,1.12)', offset: .45 }, { transform: 'translateY(0px) scale(1.12,.9)', offset: .8 }, { transform: 'translateY(0px) scale(1)' }], { duration: 520, iterations: 3, delay: j * 120 }));
        ctx.after(500, () => { f.a.sleep(false); f.a.mouth(true); cry(f.kind); });
        faces.forEach(q => q.set('joy'));
        ghost.set('happy');
        ghost.moveTo(260, 300, .62, 500, () => {
          ghost.hop(); ghost.giggle();
          ctx.after(400, () => ghost.moveTo(140, 290, .62, 600, () => { ghost.hop(); ghost.talk('おいしかったね！'); ctx.after(500, () => ghost.moveTo(200, 352, .5, 600, () => ghost.hop(), easeInOut)); }, easeOut));
        }, easeBack);
        ctx.after(3100, reset);
      }
      function reset() {
        phase = 'reset';
        faces.forEach(q => q.set('normal'));
        const f = friend, f2 = friend2;
        friend = null; friend2 = null;
        f.a.mouth(false);
        ctx.bubble('ばいばーい', 200, 340); say('ばいばーい');
        A.sfx('whoosh2', { vol: .5 }) || A.whoosh();
        f.a.body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(0deg)' }], { duration: 400, iterations: 2 });
        ctx.after(700, () => ctx.tween(800, k => placeFriend(f, 200 - 360 * k, 446 - Math.abs(Math.sin(k * Math.PI * 3)) * 34), () => f.a.outer.remove(), easeIn));
        if (f2) ctx.tween(700, k => placeFriend(f2, 64 - 220 * k, 470 - Math.abs(Math.sin(k * Math.PI * 3)) * 24), () => f2.a.outer.remove(), easeIn);
        ctx.after(800, () => moveSt(plate, POS.plate.off, 600, null, 10));
        ctx.after(1500, () => newRound());
      }
      function setLook(rr, animate) {
        const from = { s0: skyStops[0].getAttribute('stop-color'), s1: skyStops[1].getAttribute('stop-color'), sun: sun.getAttribute('fill'), cur: curtains[0].p.getAttribute('fill'), wall: wall.getAttribute('fill') };
        const apply = k => {
          skyStops[0].setAttribute('stop-color', mix(from.s0, rr.sky[0], k)); skyStops[1].setAttribute('stop-color', mix(from.s1, rr.sky[1], k));
          sun.setAttribute('fill', mix(from.sun, rr.sun, k));
          curtains.forEach(c => c.p.setAttribute('fill', mix(from.cur, rr.curtain, k)));
          wall.setAttribute('fill', mix(from.wall, rr.wall, k));
        };
        if (animate) ctx.tween(900, apply); else apply(1);
        rainbow.animate([{ opacity: rainbow.getAttribute('opacity') }, { opacity: rare ? .85 : 0 }], { duration: 900, fill: 'forwards' });
        rainbow.setAttribute('opacity', rare ? .85 : 0);
      }
      function newRound() {
        ri = (ri + 1) % RECIPES.length; R = RECIPES[ri];
        rare = round > 1 && Math.random() < 1 / 6;
        round++;
        phase = 'cook';
        setLook(R, round > 1);
        // clean up the kitchen
        pieces.forEach(p => killPiece(p, 200));
        soupBits.replaceChildren(); soupFx.replaceChildren();
        soup.setAttribute('fill', '#cfeeff');
        panFx.replaceChildren();
        pancake = null; rice = null; octos = []; board2 = []; veg = [];
        if (pot.x !== POS.pot.park[0]) moveSt(pot, POS.pot.park, 600);
        if (pan.x !== POS.pan.park[0]) moveSt(pan, POS.pan.park, 600);
        buildDots(R.steps.length);
        stationsL.appendChild(board.o);
        moveSt(board, POS.board.stage, 700, () => {
          startStep(0);
          ghost.set('happy'); ghost.talk(R.call);
          ctx.after(1500, () => { if (phase === 'cook') ghost.set('normal'); });
        }, 30);
      }

      /* ================= input ================= */
      let down = false, lastP = null;
      const lookAt = p => {
        faces.forEach(f => {
          const st = f.st; let fx, fy;
          if (f.piece) { const [x, y] = worldOf(f.piece); fx = x; fy = y; }
          else if (st) { fx = st.x + f.x * st.s; fy = st.y + f.y * st.s; }
          else return;
          const dx = p.x - fx, dy = p.y - fy, d = Math.hypot(dx, dy) || 1;
          f.look(dx / d * 3, dy / d * 2.4);
        });
      };
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e);
        if (p.x < 80 && p.y < 80) return;
        down = true; lastP = p;
        lookAt(p);
        haptic(6);
        const acted = act();
        if (e._cookingDone) return;
        // the kitchen answers every touch
        if (p.x > WX && p.x < WX + WW && p.y > WY && p.y < WY + WH) {
          clouds.forEach(c => { c.boost = 1; });
          sunGlow.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 500, composite: 'add' });
          A.sfx('blink', { vol: .4, rate: rand(.8, 1.2) }) || A.twinkle();
          if (flyers.length < 2) birdBy();
        } else if (p.y < 424) {
          ctx.sparkle(p.x, p.y, 3, 22, pick(PARTY));
          if (!acted) A.sfx('blink', { vol: .35, rate: rand(.8, 1.3) }) || A.pluck(mtof(pick(PENTA) + 12), { vol: .1 });
          curtains.forEach(c => { c.kick = 1; });
        } else {
          ctx.sparkle(p.x, p.y, 2, 16, pick(['#ffffff', '#ffe066']));
          if (!acted) {
            A.sfx('blip', { vol: .4, rate: rand(.85, 1.25) }) || A.pluck(mtof(pick(PENTA) + 12), { vol: .09 });
            const st = phase === 'cook' && step ? ({ chop: board, drop: pot, stir: pot, pour: pan, flip: pan, fry: pan, rice: board, serve: plate })[R.steps[stepI]] : null;
            if (st && !st.stop) squash(st.inner, .2, 240);
          }
        }
      });
      ctx.on(window, 'pointermove', e => {
        if (!down) return;
        const p = ctx.point(e);
        const d = Math.hypot(p.x - lastP.x, p.y - lastP.y);
        if (d < 2) return;
        lastP = p;
        if (phase === 'cook' && !busy && step === S.stir && Math.abs(p.x - pot.x) < 190 && p.y > 380) S.stir.drag(Math.min(d, 40));
      });
      const up = () => { down = false; };
      ctx.on(window, 'pointerup', up);
      ctx.on(window, 'pointercancel', up);
      ghost.pos.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        ghost.giggle();
        if (phase === 'cook') ghost.talk(pick(['おいしく なあれ', 'たのしいね', 'いいにおい！']), false);
        ctx.after(900, () => { if (phase === 'cook') ghost.set('normal'); });
      });
      function birdBy() {
        const o = el('g', {}, win);
        el('ellipse', { rx: 11, ry: 9, fill: '#ff9f7a' }, o);
        el('circle', { cx: 8, cy: -5, r: 6, fill: '#ff9f7a' }, o);
        el('circle', { cx: 10, cy: -6, r: 1.6, fill: INK }, o);
        el('path', { d: 'M13,-5 L19,-3 L13,-1Z', fill: '#ffd23f' }, o);
        const wing = el('path', { d: 'M-4,-2 Q-10,-16 4,-8Z', fill: '#ffc0a0' }, o);
        const b = { o, wing, x: WX - 20, y: WY + rand(40, 110), t: 0 };
        flyers.push(b);
        A.chirp();
      }

      /* ================= frame loop ================= */
      ctx.loop((dt, t) => {
        pieces.forEach(p => {
          const [x, y, s] = worldOf(p);
          p.o.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${p.rot.toFixed(1)}) scale(${(s * p.sc).toFixed(3)} ${(s * p.sc * p.fy).toFixed(3)})`);
        });
        // knife bobs over the next cut
        if (knifeO.style.display !== 'none') {
          const bob = kn.stop ? 0 : Math.sin(t * 4) * 5;
          const ky = board.y - 4 * board.s - 8 - kn.up * 48 + bob;
          knifeO.setAttribute('transform', `translate(${kn.x.toFixed(1)} ${ky.toFixed(1)}) rotate(${(8 + kn.up * 10).toFixed(1)}) scale(.95)`);
          if (!kn.stop && step === S.chop && S.chop.n < S.chop.need) kn.x += (S.chop.cutX(S.chop.need - S.chop.n) - kn.x) * Math.min(1, dt * 10);
        }
        clouds.forEach(c => {
          c.boost = Math.max(0, c.boost - dt * .6);
          c.x += c.sp * (1 + c.boost * 6) * dt; if (c.x > WX + WW + 10) c.x = WX - 80;
          c.o.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y}) scale(${c.s})`);
        });
        for (let i = flyers.length - 1; i >= 0; i--) {
          const b = flyers[i]; b.t += dt; b.x += 90 * dt;
          b.o.setAttribute('transform', `translate(${b.x.toFixed(1)} ${(b.y + Math.sin(b.t * 8) * 6).toFixed(1)})`);
          b.wing.setAttribute('transform', `scale(1 ${Math.sin(b.t * 30) > 0 ? 1 : -.4})`);
          if (b.x > WX + WW + 30) { b.o.remove(); flyers.splice(i, 1); }
        }
        hang.forEach(h => {
          h.kick = Math.max(0, h.kick - dt * 18);
          h.sw.setAttribute('transform', `rotate(${(Math.sin(t * 1.6 + h.ph) * (h.amp + h.kick)).toFixed(1)} 0 4)`);
        });
        curtains.forEach(c => {
          c.kick = Math.max(0, (c.kick || 0) - dt * 1.2);
          c.in2.setAttribute('transform', `skewX(${(Math.sin(t * 1.2 + c.s) * (1.5 + c.kick * 6)).toFixed(2)})`);
        });
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i];
          q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt;
          if (q.life <= 0) { q.node.remove(); parts.splice(i, 1); continue; }
          q.node.setAttribute('cx', q.x.toFixed(1)); q.node.setAttribute('cy', q.y.toFixed(1));
          q.node.setAttribute('opacity', clamp(q.life / q.max * 2, 0, 1).toFixed(2));
        }
      });
      // blinking faces, a puff of steam from the parked pot, a jar that jiggles
      ctx.every(800, () => {
        if (Math.random() < .6) { const f = pick(faces); if (f) f.blink(); }
        if (Math.random() < .25) pick(jars).animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0deg)' }], { duration: 500 });
      });
      ctx.every(1700, () => {
        if (pot.x === POS.pot.park[0] && !pot.stop) steam(pot.x, pot.y - 60 * pot.s, 1, .6);
        else if (step === S.stir && phase === 'cook') steam(pot.x + rand(-40, 40), pot.y - 80, 1, .9);
        if (step && (step === S.flip || step === S.fry) && phase === 'cook' && !busy) sizzle(.3);
      });

      /* ================= start ================= */
      placeSt(board, ...POS.board.off);
      placeSt(pot, ...POS.pot.park);
      placeSt(pan, ...POS.pan.park);
      placeSt(plate, ...POS.plate.off);
      newRound();
      ctx.hint = () => (phase === 'cook' && !busy && step && step.hint) ? step.hint() : null;
    }
  };
  TOYS.push(cookingToy);
})();
