'use strict';
/* =========================================================
   toy: ふうせん — pop big glossy balloons (round, heart, star,
   a balloon dog, a ぽわん balloon, and once in a while a golden
   one), then pump up a giant ぽわん balloon for a big finale.
   The sky changes each round: day, sunset over the sea, night.
   ========================================================= */
(() => {
  const INK = '#3a2f5b';
  const f1 = v => (+v).toFixed(1);
  const COLS = [
    { n: 'あか', c: '#ff6b7a', d: '#e04a5c', l: '#ffc2c8' },
    { n: 'あお', c: '#5fa8ff', d: '#3a84e2', l: '#c4e2ff' },
    { n: 'きいろ', c: '#ffd23f', d: '#eaa900', l: '#fff3b8' },
    { n: 'みどり', c: '#5fd38a', d: '#34ad64', l: '#c2f2d4' },
    { n: 'ピンク', c: '#ff9ccf', d: '#ec72b0', l: '#ffdcee' },
    { n: 'むらさき', c: '#b48cff', d: '#8f62ec', l: '#e4d6ff' },
    { n: 'オレンジ', c: '#ffa04a', d: '#ee7c1c', l: '#ffd8b0' }
  ].map((c, i) => ({ ...c, i }));
  const GOLD = { n: '', c: '#ffd23f', d: '#d99400', l: '#fffbe0', i: 'gold', gold: true };
  const KINDS = ['chick', 'cat', 'dog', 'frog', 'bunny', 'bear'];
  const PAW = { chick: '#ffd23f', cat: '#ffa95c', dog: '#d9a066', frog: '#7fd36b', bunny: '#fff4f7', bear: '#b9824f' };

  /* ---------- balloon shapes: each draws its body and returns the knot's y ---------- */
  const SHAPES = {
    round(g, fill) { el('ellipse', { cx: 0, cy: 0, rx: 46, ry: 56, fill }, g); return 55; },
    heart(g, fill) { el('path', { d: 'M0,52 C-34,30 -60,4 -54,-24 C-48,-52 -12,-58 0,-32 C12,-58 48,-52 54,-24 C60,4 34,30 0,52Z', fill }, g); return 51; },
    star(g, fill) {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 30 : 58;
        d += (i ? 'L' : 'M') + f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r);
      }
      el('path', { d: d + 'Z', fill, stroke: fill, 'stroke-width': 12, 'stroke-linejoin': 'round' }, g);
      return 34;
    },
    dog(g, fill) {
      [[-18, 34], [-4, 36], [22, 34], [36, 32]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 7.5, ry: 14, fill }, g));
      el('ellipse', { cx: 46, cy: -8, rx: 7, ry: 16, fill, transform: 'rotate(30 46 -8)' }, g);
      el('ellipse', { cx: 10, cy: 10, rx: 36, ry: 16, fill }, g);
      el('ellipse', { cx: -16, cy: -40, rx: 9, ry: 19, fill, transform: 'rotate(-20 -16 -40)' }, g);
      el('ellipse', { cx: -24, cy: -18, rx: 23, ry: 19, fill }, g);
      el('ellipse', { cx: -50, cy: -12, rx: 17, ry: 11, fill }, g);
      el('circle', { cx: -64, cy: -14, r: 4.5, fill: INK, opacity: .8 }, g);
      el('circle', { cx: -26, cy: -22, r: 3.6, fill: INK }, g);
      el('circle', { cx: -27.4, cy: -23.6, r: 1.3, fill: '#fff' }, g);
      el('ellipse', { cx: -34, cy: -10, rx: 5, ry: 3.2, fill: '#ffa3b8', opacity: .8 }, g);
      return 26;
    },
    powan(g, fill) {
      el('path', { d: GHOST_D, fill, transform: 'scale(.86)' }, g);
      [-17, 17].forEach(x => { el('ellipse', { cx: x, cy: -16, rx: 6.5, ry: 8, fill: INK }, g); el('circle', { cx: x - 2.4, cy: -19.4, r: 2.6, fill: '#fff' }, g); });
      [-30, 30].forEach(x => el('ellipse', { cx: x, cy: -2, rx: 8.5, ry: 5.5, fill: '#ffb3c4', opacity: .85 }, g));
      el('path', { d: 'M-7,-2 Q0,6 7,-2', stroke: INK, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
      return 52;
    }
  };
  const GLOSS = { round: [-17, -26, 10, 19], heart: [-28, -28, 9, 15], star: [-12, -24, 6, 12], dog: [-32, -26, 6, 9], powan: [-26, -36, 9, 14] };
  function drawBalloon(g, col, shape = 'round', string = true) {
    const fill = `url(#balloon-c${col.i}) ${col.c}`;
    const strG = el('g', {}, g);
    const knot = SHAPES[shape](g, fill);
    const [gx, gy, gw, gh] = GLOSS[shape];
    el('ellipse', { cx: gx, cy: gy, rx: gw, ry: gh, fill: '#fff', opacity: .62, transform: `rotate(28 ${gx} ${gy})` }, g);
    el('circle', { cx: gx + gw * .9, cy: gy - gh - 3, r: Math.max(2.5, gw * .35), fill: '#fff', opacity: .7 }, g);
    if (string) el('path', { d: `M0,${knot + 6} q-8,14 0,28 q8,14 0,28 q-8,14 0,28 q8,14 0,26`, stroke: '#9a92b6', 'stroke-width': 2, fill: 'none' }, strG);
    el('path', { d: `M-7,${knot + 8} L7,${knot + 8} L0,${knot - 2}Z`, fill: col.d, 'stroke-linejoin': 'round', stroke: col.d, 'stroke-width': 2 }, strG);
    return knot;
  }
  function gift(g, col) {
    el('rect', { x: -18, y: -12, width: 36, height: 28, rx: 5, fill: col.c }, g);
    el('rect', { x: -4, y: -12, width: 8, height: 28, fill: '#fff', opacity: .85 }, g);
    const lid = el('g', {}, g);
    el('rect', { x: -21, y: -20, width: 42, height: 10, rx: 3, fill: col.d }, lid);
    el('rect', { x: -4, y: -20, width: 8, height: 10, fill: '#fff' }, lid);
    el('path', { d: 'M0,-20 Q-15,-34 -11,-21Z M0,-20 Q15,-34 11,-21Z', fill: '#fff', stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, lid);
    return lid;
  }

  const balloonToy = {
    id: 'balloon', name: 'ふうせん', color: '#cfeaff',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#dff2ff' }, g);
      el('ellipse', { cx: 0, cy: 92, rx: 120, ry: 40, fill: '#9be08a' }, g);
      [[-38, -14, 0, 'round', .62], [36, -30, 1, 'heart', .55], [4, 10, 2, 'star', .6]].forEach(([x, y, c, sh, s]) => {
        const b = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
        drawBalloon(b, COLS[c], sh);
      });
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      /* ---------- gradients ---------- */
      const rad = (id, stops, cx = .35, cy = .3, r = .8) => { const gr = el('radialGradient', { id, cx, cy, r }, defs); stops.forEach(([o, c, op = 1]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, gr)); };
      const lin = (id, stops) => { const gr = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs); stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, gr)); };
      [...COLS, GOLD].forEach(c => {
        rad(`balloon-c${c.i}`, [[0, c.l], [.42, c.c], [1, c.d]]);
        rad(`balloon-h${c.i}`, [[0, c.c, .55], [.5, c.c, .2], [1, c.c, 0]], .5, .5, .5);
      });
      rad('balloon-giant', [[0, '#ffffff'], [.55, '#f3eeff'], [1, '#c9b8ff']], .36, .3, .8);
      lin('balloon-day', [[0, '#9fd4ff'], [1, '#eef9ff']]);
      lin('balloon-dusk', [[0, '#ff8fa3'], [.45, '#ffb38a'], [1, '#ffe2a6']]);
      lin('balloon-sea', [[0, '#7cb6e8'], [1, '#3f78c0']]);
      lin('balloon-night', [[0, '#1d2558'], [.7, '#4a4b9a'], [1, '#6a5fb0']]);

      const cam = el('g', {}, svg);
      const farL = el('g', {}, cam);
      const driftL = el('g', {}, cam);
      const frontL = el('g', {}, cam);
      const amb = { clouds: [], gulls: [], boat: null };
      const cloud = (p, s, op = .92) => {
        const g = el('g', {}, p);
        const c = el('g', { transform: `scale(${s})` }, g);
        [[0, 0, 20], [24, -9, 27], [50, 0, 19]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill: '#fff', opacity: op }, c));
        el('rect', { x: 0, y: 0, width: 50, height: 19, rx: 9, fill: '#fff', opacity: op }, c);
        return g;
      };
      const flower = (p, x, y, c) => {
        [0, 72, 144, 216, 288].forEach(a => el('circle', { cx: x + Math.cos(a * Math.PI / 180) * 5, cy: y + Math.sin(a * Math.PI / 180) * 5, r: 4.2, fill: c }, p));
        el('circle', { cx: x, cy: y, r: 3, fill: '#fff3b0' }, p);
      };

      /* ---------- sky 1: a sunny day ---------- */
      const dayFar = el('g', {}, farL);
      el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: 'url(#balloon-day)' }, dayFar);
      const sun = el('g', { transform: 'translate(318 84)' }, dayFar);
      el('circle', { r: 58, fill: '#fff6c2', opacity: .55, class: 'twinkle', style: 'animation-duration:3.6s' }, sun);
      el('circle', { r: 34, fill: '#ffd56b' }, sun);
      [[60, 170, .7, 6], [250, 250, .5, 4], [330, 380, .8, 8], [-40, 470, .6, 5], [150, 560, .45, 3]].forEach(([x, y, s, v]) => amb.clouds.push({ g: cloud(dayFar, s), x, y, v, sky: 0 }));
      el('ellipse', { cx: 70, cy: 680, rx: 220, ry: 70, fill: '#c3ecb2' }, dayFar);
      el('ellipse', { cx: 350, cy: 690, rx: 220, ry: 74, fill: '#b2e6a0' }, dayFar);
      const dayFront = el('g', {}, frontL);
      el('path', { d: 'M-800,1700 L-800,690 Q-200,660 60,676 Q200,650 340,672 Q600,660 1200,690 L1200,1700Z', fill: '#9be08a' }, dayFront);
      el('rect', { x: -800, y: 742, width: 2000, height: 1000, fill: '#8fd67e' }, dayFront);
      [[30, 706], [104, 726], [214, 718], [386, 708], [250, 750]].forEach(([x, y], i) => flower(dayFront, x, y, PARTY[i % 6]));

      /* ---------- sky 2: sunset over the sea ---------- */
      const duskFar = el('g', { opacity: 0 }, farL);
      el('rect', { x: -800, y: -900, width: 2000, height: 1460, fill: 'url(#balloon-dusk)' }, duskFar);
      const dsun = el('g', { transform: 'translate(200 556)' }, duskFar);
      el('circle', { r: 110, fill: '#fff0b8', opacity: .35, class: 'twinkle', style: 'animation-duration:4.2s' }, dsun);
      el('circle', { r: 62, fill: '#ffcf6b' }, dsun);
      [[40, 210, .7, 5], [270, 330, .55, 3], [-20, 420, .6, 4]].forEach(([x, y, s, v]) => amb.clouds.push({ g: cloud(duskFar, s, .7), x, y, v, sky: 1 }));
      el('rect', { x: -800, y: 556, width: 2000, height: 1200, fill: 'url(#balloon-sea)' }, duskFar);
      el('path', { d: 'M150,572 H250 M168,592 H232 M184,612 H216', stroke: '#ffe2a6', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: .8 }, duskFar);
      [[40, 600], [320, 590], [90, 640], [360, 630], [260, 660]].forEach(([x, y], i) => {
        const s = el('path', { d: `M${x - 14},${y} H${x + 14}`, stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', class: 'twinkle' }, duskFar);
        s.style.animationDelay = `-${(i * .5).toFixed(1)}s`;
      });
      amb.boat = el('g', {}, duskFar);
      const boatIn = el('g', { class: 'float' }, amb.boat);
      el('path', { d: 'M-26,0 L26,0 L18,12 L-18,12Z', fill: '#ff7a8a' }, boatIn);
      el('path', { d: 'M0,-2 L0,-44 L24,-6Z', fill: '#fff' }, boatIn);
      el('path', { d: 'M-3,-2 L-3,-36 L-20,-6Z', fill: '#ffe2a6' }, boatIn);
      [[60, 250], [140, 300]].forEach(([x, y]) => {
        const g = el('g', {}, duskFar);
        const w = el('path', { d: 'M-12,0 Q-6,-8 0,0 Q6,-8 12,0', stroke: '#7a5a7a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', class: 'tb' }, g);
        w.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(-.5)' }], { duration: 420, iterations: Infinity, direction: 'alternate' });
        amb.gulls.push({ g, x, y });
      });
      const duskFront = el('g', { opacity: 0 }, frontL);
      el('path', { d: 'M-800,1700 L-800,694 Q-100,672 120,684 Q260,668 420,684 Q700,676 1200,694 L1200,1700Z', fill: '#ffe0a8' }, duskFront);
      el('rect', { x: -800, y: 744, width: 2000, height: 1000, fill: '#f8d090' }, duskFront);
      [[40, 716, '#ff9ccf'], [372, 722, '#fff']].forEach(([x, y, c]) => {
        el('path', { d: `M${x - 10},${y + 6} Q${x},${y - 14} ${x + 10},${y + 6}Z`, fill: c }, duskFront);
        el('path', { d: `M${x - 4},${y - 2} L${x},${y + 6} M${x + 4},${y - 2} L${x},${y + 6}`, stroke: '#e8a0b0', 'stroke-width': 1.6 }, duskFront);
      });
      el('path', { d: 'M230,726 l6,-10 l6,10 l-6,4Z', fill: '#ff8a7a' }, duskFront);

      /* ---------- sky 3: night, the balloons glow ---------- */
      const nightFar = el('g', { opacity: 0 }, farL);
      el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: 'url(#balloon-night)' }, nightFar);
      const moon = el('g', { transform: 'translate(316 96)' }, nightFar);
      el('circle', { r: 56, fill: '#fff6c8', opacity: .12, class: 'twinkle', style: 'animation-duration:4s' }, moon);
      el('path', { d: 'M8,-32 A32,32 0 1 0 8,32 A25,29 0 1 1 8,-32Z', fill: '#fff4c2' }, moon);
      for (let i = 0; i < 16; i++) {
        const x = (i * 97) % 400 + 6, y = 40 + (i * 61) % 520;
        const s = el('path', { d: `M${x},${y - 7} L${x + 2},${y - 2} L${x + 7},${y} L${x + 2},${y + 2} L${x},${y + 7} L${x - 2},${y + 2} L${x - 7},${y} L${x - 2},${y - 2}Z`, fill: '#fff8c8', class: 'twinkle' }, nightFar);
        s.style.animationDelay = `-${(i * .31).toFixed(2)}s`;
      }
      const shoot = el('path', { d: 'M0,0 L-60,22', stroke: '#fff8c8', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }, nightFar);
      el('path', { d: 'M-800,660 Q-80,600 90,630 Q240,590 1200,640 L1200,900 L-800,900Z', fill: '#3a3f7a' }, nightFar);
      // a little town with lit windows
      [[34, 620, 40, 46], [80, 610, 34, 56], [290, 612, 38, 52], [336, 620, 44, 44], [372, 606, 30, 60]].forEach(([x, y, w, h], i) => {
        el('rect', { x: x - w / 2, y, width: w, height: h + 40, rx: 4, fill: '#2c3168' }, nightFar);
        el('path', { d: `M${x - w / 2 - 4},${y + 2} L${x},${y - 18} L${x + w / 2 + 4},${y + 2}Z`, fill: '#2c3168' }, nightFar);
        const wl = el('rect', { x: x - 6, y: y + 14, width: 12, height: 12, rx: 2, fill: '#ffe27a', class: i % 2 ? 'twinkle' : null }, nightFar);
        if (i % 2) wl.style.animationDuration = `${3 + i}s`;
      });
      const nightFront = el('g', { opacity: 0 }, frontL);
      el('path', { d: 'M-800,1700 L-800,692 Q-200,664 60,678 Q200,654 340,674 Q600,664 1200,692 L1200,1700Z', fill: '#45628c' }, nightFront);
      el('rect', { x: -800, y: 744, width: 2000, height: 1000, fill: '#3d5880' }, nightFront);
      [[30, 708], [110, 726], [214, 718], [386, 710]].forEach(([x, y], i) => {
        const fl = el('circle', { cx: x, cy: y - 14, r: 3.4, fill: '#d8ff8a', class: 'twinkle' }, nightFront);
        fl.style.animationDelay = `-${i * .7}s`;
      });
      const FAR = [dayFar, duskFar, nightFar], FRONT = [dayFront, duskFront, nightFront];

      /* ---------- pump + hose + nozzle ---------- */
      const GX = 146, GY = 690, PX = 330;
      const pumpL = el('g', {}, cam);
      el('path', { d: `M${PX - 22},718 C${PX - 70},756 ${GX + 40},756 ${GX + 6},${GY + 8}`, stroke: '#7fdcc0', 'stroke-width': 11, fill: 'none', 'stroke-linecap': 'round' }, pumpL);
      el('path', { d: `M${GX - 17},${GY + 14} L${GX + 17},${GY + 14} L${GX + 10},${GY - 4} L${GX - 10},${GY - 4}Z`, fill: '#c9a7ff' }, pumpL);
      const pump = el('g', {}, pumpL);
      const plunger = el('g', {}, pump);
      el('rect', { x: PX - 5, y: 560, width: 10, height: 66, rx: 4, fill: '#d8d0ee' }, plunger);
      el('rect', { x: PX - 52, y: 542, width: 104, height: 24, rx: 12, fill: '#8fb8ff' }, plunger);
      el('rect', { x: PX - 44, y: 546, width: 34, height: 7, rx: 3.5, fill: '#fff', opacity: .55 }, plunger);
      const pumpBody = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, pump);
      el('rect', { x: PX - 28, y: 610, width: 56, height: 114, rx: 17, fill: '#ff7a8a', filter: 'url(#soft)' }, pumpBody);
      el('rect', { x: PX - 19, y: 620, width: 10, height: 90, rx: 5, fill: '#fff', opacity: .4 }, pumpBody);
      el('rect', { x: PX - 34, y: 604, width: 68, height: 15, rx: 7.5, fill: '#ff5d72' }, pumpBody);
      el('rect', { x: PX - 46, y: 720, width: 92, height: 22, rx: 11, fill: '#ffb38a' }, pumpBody);
      const pumpEyes = el('g', { class: 'tb' }, pumpBody);
      [-10, 10].forEach(dx => { el('circle', { cx: PX + dx, cy: 660, r: 4, fill: INK }, pumpEyes); el('circle', { cx: PX + dx - 1.3, cy: 658.4, r: 1.4, fill: '#fff' }, pumpEyes); });
      el('path', { d: `M${PX - 6},669 Q${PX},675 ${PX + 6},669`, stroke: INK, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, pumpBody);
      [-18, 18].forEach(dx => el('ellipse', { cx: PX + dx, cy: 668, rx: 5, ry: 3.4, fill: '#ffb3c4' }, pumpBody));
      el('rect', { x: PX - 62, y: 526, width: 124, height: 226, fill: 'transparent' }, pump);
      // a bouncing arrow over the pump says "push me" without words
      const arrow = el('g', { transform: `translate(${PX} 500)`, 'pointer-events': 'none' }, pumpL);
      const arrowIn = el('path', { d: 'M-12,-16 H12 V0 H22 L0,22 L-22,0 H-12Z', fill: '#fff', stroke: '#ff8fa3', 'stroke-width': 3, 'stroke-linejoin': 'round', class: 'tb' }, arrow);
      arrowIn.animate([{ transform: 'translateY(-8px)' }, { transform: 'translateY(4px)' }], { duration: 520, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      arrow.style.display = 'none';

      /* ---------- the giant ぽわん balloon ---------- */
      const giantL = el('g', {}, cam);
      const dropL = el('g', {}, cam);
      const fxL = el('g', { 'pointer-events': 'none' }, cam);
      const ghost = ctx.ghost(cam, { x: 324, y: 142, s: .55 });
      const SCALES = [.3, .55, .8, 1.02, 1.22];
      let giant = null, pumps = 0, busy = false, finaleN = Math.floor(Math.random() * 3), popped = 0, sky = 0, spawned = 0, golden = null;

      function makeGiant() {
        const out = el('g', { transform: `translate(${GX} ${GY - 4})` }, giantL);
        const string = el('path', { d: 'M0,0 q-10,28 0,56 q10,28 0,56 q-10,28 0,48', stroke: '#9a92b6', 'stroke-width': 2.4, fill: 'none', opacity: 0 }, out);
        const sc = el('g', {}, out);
        const sway = el('g', {}, sc);
        const wob = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, sway);
        el('path', { d: 'M-12,1 L12,1 L0,-14Z', fill: '#c9b8ff' }, wob);
        el('ellipse', { cx: 0, cy: -120, rx: 100, ry: 110, fill: 'url(#balloon-giant)', stroke: '#d9ccff', 'stroke-width': 3 }, wob);
        el('ellipse', { cx: -46, cy: -178, rx: 18, ry: 32, fill: '#fff', opacity: .9, transform: 'rotate(32 -46 -178)' }, wob);
        el('circle', { cx: -16, cy: -206, r: 7, fill: '#fff', opacity: .85 }, wob);
        [-52, 52].forEach(x => el('ellipse', { cx: x, cy: -100, rx: 16, ry: 10, fill: '#ffb3c4', opacity: .8 }, wob));
        const eyesOpen = el('g', { class: 'tb' }, wob), eyesHappy = el('g', { style: 'display:none' }, wob), eyesStrain = el('g', { style: 'display:none' }, wob);
        [-30, 30].forEach(x => {
          el('ellipse', { cx: x, cy: -128, rx: 11, ry: 14, fill: INK }, eyesOpen);
          el('circle', { cx: x - 4, cy: -134, r: 4.5, fill: '#fff' }, eyesOpen);
          el('path', { d: `M${x - 13},-124 Q${x},-142 ${x + 13},-124`, stroke: INK, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, eyesHappy);
          const o = x < 0 ? -1 : 1;
          el('path', { d: `M${x + o * 10},-138 L${x - o * 8},-128 L${x + o * 10},-118`, stroke: INK, 'stroke-width': 5.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, eyesStrain);
        });
        const mOh = el('ellipse', { cx: 0, cy: -96, rx: 9, ry: 11, fill: '#ff7a8a' }, wob);
        const mHappy = el('path', { d: 'M-18,-104 Q0,-74 18,-104Z', fill: '#ff7a8a', style: 'display:none' }, wob);
        const mPuff = el('ellipse', { cx: 0, cy: -96, rx: 16, ry: 7, fill: '#ff7a8a', style: 'display:none' }, wob);
        el('rect', { x: -112, y: -240, width: 224, height: 244, fill: 'transparent' }, wob);
        const G = { out, sc, sway, wob, string, eyesOpen, s: 0, x: GX, y: GY - 4, r: 0,
          face(m) {
            eyesOpen.style.display = m === 'oh' ? '' : 'none'; eyesHappy.style.display = m === 'happy' ? '' : 'none'; eyesStrain.style.display = m === 'strain' ? '' : 'none';
            mOh.style.display = m === 'oh' ? '' : 'none'; mHappy.style.display = m === 'happy' ? '' : 'none'; mPuff.style.display = m === 'strain' ? '' : 'none';
          },
          setS(s) { G.s = s; sc.setAttribute('transform', `scale(${s.toFixed(3)})`); },
          setXY(x, y, r = 0) { G.x = x; G.y = y; G.r = r; out.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)})`); }
        };
        G.setS(.01);
        ctx.tween(460, k => G.setS(.01 + (SCALES[0] - .01) * k), null, easeBack);
        out.addEventListener('pointerdown', e => { e.stopPropagation(); doPump(); });
        return G;
      }

      function doPump() {
        haptic();
        plunger.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(40px)', offset: .45 }, { transform: 'translateY(0px)' }], { duration: 300, easing: 'ease-out' });
        pumpBody.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12,.88)', offset: .45 }, { transform: 'scale(.96,1.04)', offset: .75 }, { transform: 'scale(1)' }], { duration: 320 });
        arrow.style.display = 'none';
        if (busy || !giant) { A.click(); A.noise({ from: 500, to: 900, dur: .12, vol: .08 }); return; }
        pumps++;
        A.noise({ from: 700, to: 2600, dur: .26, vol: .2, type: 'bandpass', q: 2 });
        if (!A.sfx('rise', { rate: .8 + pumps * .1, vol: .5 })) A.osc(300, { slide: 600, r: .2, vol: .12 });
        A.sfx('squeaky', { rate: .8 + pumps * .12, vol: .4, when: .12 });
        ctx.bubble('しゅっ', PX - 10, 500);
        say('しゅっ');
        const G = giant, s0 = G.s, s1 = SCALES[pumps];
        ctx.after(90, () => {
          ctx.tween(440, k => G.setS(s0 + (s1 - s0) * k), null, easeBack);
          G.wob.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12,.9)' }, { transform: 'scale(.94,1.07)' }, { transform: 'scale(1.03,.98)' }, { transform: 'scale(1)' }], { duration: 560 });
          ctx.sparkle(GX, GY - 230 * s1, 3, 60 * s1 + 20, '#fff3b0');
        });
        if (pumps >= 3) G.face('strain'); else if (pumps === 2) G.face('oh');
        ghost.hop();
        if (pumps === 2) ghost.talk('おおきく なあれ', false);
        if (pumps >= SCALES.length - 1) {
          busy = true;
          ctx.after(600, () => {
            A.sfx('flexatone', { vol: .45 });
            G.wob.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06,.95)' }, { transform: 'scale(.95,1.05)' }, { transform: 'scale(1.05,.96)' }, { transform: 'scale(1)' }], { duration: 900 });
            ghost.set('surprise');
            ctx.after(900, [rideAway, bigPop, deflate][finaleN++ % 3]);
          });
        }
      }

      /* ---------- three finales ---------- */
      function party(x, y) {
        A.tada(); haptic(30);
        ctx.confetti(x, y, 44);
        ctx.after(650, () => { ctx.confetti(70, 520, 28); ctx.confetti(330, 520, 28); });
      }
      function danceGhost(x, y, s = .6, ms = 1500) {
        ghost.giggle(); ghost.hop();
        ctx.tween(ms, q => ghost.place(x + Math.sin(q * Math.PI * 2) * 46, y - Math.abs(Math.sin(q * Math.PI * 4)) * 28, s), () => ghost.hop());
      }
      function rideAway() {
        const G = giant;
        G.face('happy');
        if (!A.sfx('whistleup', { vol: .45 })) A.boing();
        G.string.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
        const y0 = G.y, ty = 470;
        ctx.tween(900, k => G.setXY(GX, y0 + (ty - y0) * k), null, easeOut);
        ghost.set('happy');
        ghost.moveTo(GX, ty + 186, .6, 900, () => {
          ghost.talk('いってきまーす！');
          party(GX, 560);
          ctx.tween(3600, k => {
            const x = GX + Math.sin(k * 7) * 30 + k * 70, y = ty - k * 1000 + Math.sin(k * 20) * 6;
            G.setXY(x, y, Math.sin(k * 7 + 1) * 7);
            ghost.place(x + Math.sin(k * 14) * 6, y + 186, .6);
          }, () => {
            G.out.remove(); giant = null;
            ghost.set('normal'); ghost.place(324, -150, .55);
            ctx.after(400, () => ghost.moveTo(324, 142, .55, 900, () => { ghost.giggle(); ghost.talk('ただいま！'); ctx.after(900, () => ghost.set('normal')); reset(); }, easeOut));
          }, easeIn);
        }, easeInOut);
      }
      function shake(amp, ms = 360) {
        ctx.tween(ms, q => { const d = amp * (1 - q); cam.setAttribute('transform', `translate(${f1(Math.sin(q * 50) * d)} ${f1(Math.cos(q * 41) * d * .7)})`); }, () => cam.removeAttribute('transform'), k => k);
      }
      function bigPop() {
        const G = giant, cx = G.x, cy = G.y - 120 * G.s;
        G.face('strain');
        G.wob.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.92)' }, { transform: 'scale(.94,1.08)' }, { transform: 'scale(1.18)' }], { duration: 520 }).onfinish = () => {
          G.out.remove(); giant = null;
          if (!A.sfx('pop2', { vol: .9, rate: .7 })) A.noise({ type: 'highpass', from: 800, to: 3000, dur: .3, vol: .3 });
          A.sfx('pop', { vol: .7, rate: .6, when: .05 });
          shake(10);
          burst(cx, cy, { c: '#ffffff', d: '#b9a0ff', l: '#f3eeff' }, 34, 1.9);
          popText(cx, cy, '#9468ee', 1.8);
          party(cx, cy);
          for (let i = 0; i < 14; i++) mini(cx, cy, i);
          ghost.set('surprise');
          ctx.after(700, () => { ghost.talk('わあ！ いっぱい！'); danceGhost(324, 160, .55, 1400); });
          ctx.after(3400, () => { ghost.set('normal'); reset(); });
        };
      }
      function deflate() {
        // the knot slips: ぷしゅ～ the balloon zooms all over the sky
        const G = giant;
        G.face('oh');
        if (!A.sfx('slide', { vol: .55, rate: 1.1 })) A.osc(1200, { slide: 300, slideT: 2, hold: 1.6, r: .3, vol: .12, vib: 7 });
        A.sfx('whistledown', { vol: .4, when: 1.1 });
        A.noise({ from: 1800, to: 700, dur: 2.2, vol: .07 });
        ghost.set('surprise');
        const s0 = G.s, ph = rand(0, 6);
        let px = G.x, py = G.y;
        ctx.tween(2500, k => {
          const u = k * Math.PI * 2;
          const x = 200 + Math.sin(u * 1.7 + ph) * 150 * (1 - k * .3);
          const y = 420 + Math.sin(u * 2.3) * 200 - Math.sin(k * Math.PI) * 60 + k * k * 220;
          const vx = x - px, vy = y - py; px = x; py = y;
          const r = Math.atan2(vx, -vy) * 57.3;
          G.setXY(x, y + 120 * G.s, r);
          G.setS(s0 * (1 - k * .78));
          if (Math.random() < .25) {
            const c = el('circle', { cx: f1(x - vx * 3), cy: f1(y + 120 * G.s - vy * 3), r: 6, fill: '#fff', opacity: .8, class: 'tb' }, fxL);
            c.animate([{ transform: 'scale(1)', opacity: .8 }, { transform: 'scale(2.4)', opacity: 0 }], { duration: 500 }).onfinish = () => c.remove();
          }
        }, () => {
          // flop! it lands all wrinkly, then everyone laughs
          G.setXY(200, 662, 80);
          G.face('happy');
          G.wob.animate([{ transform: 'scale(1.4,.5)' }, { transform: 'scale(.9,1.1)' }, { transform: 'scale(1.1,.85)' }, { transform: 'scale(1)' }], { duration: 600 });
          if (!A.sfx('squeak', { vol: .5 })) A.boing();
          ghost.set('happy');
          ghost.talk('ぷしゅ〜', false);
          party(200, 600);
          ctx.after(600, () => danceGhost(324, 160, .55, 1400));
          ctx.after(2200, () => {
            const gx = G.x, gy = G.y;
            G.wob.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => { G.out.remove(); };
            ctx.sparkle(gx, gy - 20, 6, 40);
            A.twinkle();
            giant = null;
            ctx.after(500, () => { ghost.set('normal'); reset(); });
          });
        }, k => k);
      }
      function mini(x, y, i) {
        const col = COLS[i % COLS.length];
        const g = el('g', {}, dropL);
        const inner = el('g', { class: 'tb' }, g);
        const b = el('g', { transform: 'scale(.5)' }, inner);
        drawBalloon(b, col, i % 5 === 0 ? 'heart' : i % 7 === 3 ? 'star' : 'round');
        el('circle', { cx: 0, cy: 4, r: 34, fill: 'transparent' }, inner);
        const a = i / 14 * Math.PI * 2 + rand(-.2, .2), sp = rand(330, 560);
        let px = x, py = y, vx = Math.cos(a) * sp, vy = Math.sin(a) * sp, life = 0, dead = false;
        const ph = rand(0, 6);
        const stop = ctx.loop(dt => {
          life += dt;
          vx *= Math.pow(.22, dt); vy = vy * Math.pow(.22, dt) - 110 * dt;
          px = clamp(px + vx * dt + Math.sin(life * 2 + ph) * .4, 24, 376); py += vy * dt;
          g.setAttribute('transform', `translate(${f1(px)} ${f1(py)}) rotate(${f1(Math.sin(life * 2 + ph) * 8)})`);
          if (py < -120 || life > 9) { stop(); g.remove(); }
        });
        g.addEventListener('pointerdown', e => {
          e.stopPropagation(); if (dead) return; dead = true; stop(); g.remove();
          haptic(); popSound(); burst(px, py, col, 10, .6); say(col.n);
        });
      }
      function reset() {
        pumps = 0;
        setSky((sky + 1) % 3);
        ctx.after(500, () => { giant = makeGiant(); A.twinkle(); ctx.sparkle(GX, GY - 30, 4, 30); busy = false; });
      }
      function setSky(i) {
        const prev = sky;
        sky = i;
        if (prev === i) return;
        [FAR, FRONT].forEach(L => {
          const next = L[i];
          next.parentNode.appendChild(next);
          ctx.tween(900, q => next.setAttribute('opacity', q.toFixed(2)), () => L.forEach(b => { if (b !== next) b.setAttribute('opacity', 0); }));
        });
        balloons.forEach(b => glowOn(b, i === 2));
        A.sfx(i === 2 ? 'windchime2' : 'harpup', { vol: .4 });
      }

      /* ---------- drifting balloons ---------- */
      const balloons = [];
      function glowOn(b, on) { b.halo.animate([{ opacity: on ? 1 : 0 }], { duration: 800, fill: 'forwards' }); }
      function spawn(y, x) {
        if (balloons.length >= 9) return null;
        spawned++;
        const isGold = !golden && spawned > 6 && Math.random() < 1 / 22;
        const col = isGold ? GOLD : pick(COLS);
        const r = Math.random();
        const shape = isGold ? 'round' : r < .1 ? 'heart' : r < .18 ? 'star' : r < .25 ? 'dog' : r < .31 ? 'powan' : 'round';
        const s = shape === 'round' ? rand(.92, 1.08) : 1;
        const g = el('g', {}, driftL);
        const inner = el('g', { class: 'tb' }, g);
        const halo = el('circle', { cx: 0, cy: 0, r: 96, fill: `url(#balloon-h${col.i})`, opacity: sky === 2 || isGold ? 1 : 0 }, inner);
        const knot = drawBalloon(inner, col, shape);
        const b = { g, inner, halo, col, shape, s, knot, x0: x ?? rand(60, 340), x: 0, y: y ?? rand(820, 880), vy: rand(40, 60), ph: rand(0, 6), push: 0, carry: null, kind: null, alive: true };
        if (isGold) {
          golden = b;
          const tw = el('g', {}, inner);
          [[-50, -40], [48, -20], [-30, 50], [40, 46]].forEach(([sx, sy], i) => {
            const st = el('path', { d: `M${sx},${sy - 9} L${sx + 2.5},${sy - 2.5} L${sx + 9},${sy} L${sx + 2.5},${sy + 2.5} L${sx},${sy + 9} L${sx - 2.5},${sy + 2.5} L${sx - 9},${sy} L${sx - 2.5},${sy - 2.5}Z`, fill: '#fff6c0', class: 'twinkle' }, tw);
            st.style.animationDelay = `-${i * .6}s`;
          });
          b.vy = 34;
        } else if (shape === 'round' && r > .31) {
          if (r < .5) {
            b.carry = 'animal'; b.kind = pick(KINDS);
            const hold = el('g', { transform: 'translate(0 158)' }, inner);
            makeAnimal(b.kind, hold, 0, 0, .42);
          } else if (r < .62) {
            b.carry = 'gift';
            const hold = el('g', { transform: 'translate(0 150)' }, inner);
            gift(hold, pick(COLS.filter(c => c !== col)));
          }
        }
        el('ellipse', { cx: 0, cy: 4, rx: 56, ry: 64, fill: 'transparent' }, inner);
        if (b.carry) el('rect', { x: -36, y: 110, width: 72, height: 74, fill: 'transparent' }, inner);
        g.addEventListener('pointerdown', e => { e.stopPropagation(); pop(b); });
        balloons.push(b);
        place(b, 0);
        return b;
      }
      function place(b, t) {
        b.x = b.x0 + Math.sin(t * .8 + b.ph) * 14;
        b.g.setAttribute('transform', `translate(${f1(b.x)} ${f1(b.y)}) rotate(${f1(Math.sin(t * .8 + b.ph + 1) * 5 + b.push * .08)}) scale(${b.s.toFixed(3)})`);
      }

      /* ---------- popping ---------- */
      function popSound() {
        if (!A.sfx(Math.random() < .5 ? 'pop2' : 'pop', { rate: rand(.85, 1.3), vol: .85 })) A.pop();
      }
      function burst(x, y, col, n = 18, big = 1) {
        const g = el('g', { transform: `translate(${f1(x)} ${f1(y)})` }, fxL);
        // a flash of rubber, then rays, then confetti in the balloon's colours
        const flash = el('circle', { r: 40 * big, fill: col.c, class: 'tb' }, g);
        flash.animate([{ transform: 'scale(1)', opacity: .7 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 160, fill: 'forwards' });
        const ring = el('path', { d: 'M0,-50 L0,-32 M50,0 L32,0 M0,50 L0,32 M-50,0 L-32,0 M35,-35 L23,-23 M35,35 L23,23 M-35,35 L-23,23 M-35,-35 L-23,-23', stroke: col.d, 'stroke-width': 5.5, 'stroke-linecap': 'round', class: 'tb' }, g);
        ring.animate([{ transform: `scale(${.4 * big})`, opacity: 1 }, { transform: `scale(${1.35 * big})`, opacity: 0 }], { duration: 400, easing: 'ease-out', fill: 'forwards' });
        const bits = [];
        const shades = [col.c, col.d, col.l, '#ffffff'];
        for (let i = 0; i < n; i++) {
          const a = rand(0, Math.PI * 2), sp = rand(150, 340) * big, c = shades[i % 4];
          const kind = i % 3;
          const node = kind === 0 ? el('rect', { x: -6, y: -3.5, width: 12, height: 7, rx: 2, fill: c }, g)
            : kind === 1 ? el('circle', { r: 4.5, fill: c }, g)
            : el('path', { d: 'M-7,0 Q-3,-5 0,0 T7,0', stroke: c, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' }, g);
          bits.push({ node, x: 0, y: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 90, r: rand(0, 360), vr: rand(-500, 500), ph: rand(0, 6) });
        }
        let life = 0;
        const stop = ctx.loop(dt => {
          life += dt;
          bits.forEach(q => {
            q.vy = Math.min(q.vy + 560 * dt, 150); q.vx *= .965; q.x += (q.vx + Math.sin(life * 9 + q.ph) * 30) * dt; q.y += q.vy * dt; q.r += q.vr * dt;
            q.node.setAttribute('transform', `translate(${f1(q.x)} ${f1(q.y)}) rotate(${q.r.toFixed(0)}) scale(1 ${Math.cos(life * 8 + q.ph).toFixed(2)})`);
          });
          g.setAttribute('opacity', clamp(2 - life * 1.1, 0, 1).toFixed(2));
          if (life > 1.8) { stop(); g.remove(); }
        });
      }
      function popText(x, y, color, big = 1) {
        const g = el('g', { transform: `translate(${clamp(x, 70, 330).toFixed(0)} ${y.toFixed(0)})` }, fxL);
        const t = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 30 * big, fill: color, stroke: '#fff', 'stroke-width': 6, 'paint-order': 'stroke', class: 'tb' }, g);
        t.textContent = 'ぱーん！';
        t.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.15) translateY(-6px)', opacity: 1, offset: .3 }, { transform: 'scale(1) translateY(-24px)', opacity: 0 }], { duration: 900, easing: 'ease-out' }).onfinish = () => g.remove();
      }
      function heartsUp(x, y) {
        for (let i = 0; i < 6; i++) {
          const g = el('g', { transform: `translate(${f1(x)} ${f1(y)})` }, fxL);
          const h = el('path', { d: 'M0,8 C-16,-4 -10,-18 0,-10 C10,-18 16,-4 0,8Z', fill: pick(['#ff7a9a', '#ff9ccf', '#ff6b8a']), class: 'tb' }, g);
          const dx = rand(-70, 70), dy = -rand(70, 150);
          h.animate([{ transform: 'translate(0px,0px) scale(.3)', opacity: 1 }, { transform: `translate(${f1(dx)}px,${f1(dy)}px) scale(${rand(1.2, 1.8).toFixed(2)})`, opacity: 0 }], { duration: rand(900, 1300), delay: i * 60, easing: 'ease-out', fill: 'backwards' }).onfinish = () => g.remove();
        }
      }
      function goldShower() {
        if (!A.sfx('starshine', { vol: .6 })) A.twinkle();
        A.sfx('coin', { vol: .5 }); A.sfx('jinglesteel', { vol: .4, when: .3 });
        ghost.set('happy'); ghost.talk('ぴかぴか！'); danceGhost(324, 150, .55, 1200);
        ctx.after(1600, () => ghost.set('normal'));
        const g = el('g', {}, fxL), bits = [];
        for (let i = 0; i < 30; i++) {
          const n = el('path', { d: 'M0,-12 Q2,-2 12,0 Q2,2 0,12 Q-2,2 -12,0 Q-2,-2 0,-12Z', fill: pick(['#ffd23f', '#fff3b0', '#ffe27a', '#ffffff']) }, g);
          bits.push({ n, x: rand(0, 400), y: rand(-300, -20), v: rand(160, 300), r: rand(0, 360), vr: rand(-200, 200), s: rand(.6, 1.4), ph: rand(0, 6) });
        }
        let life = 0;
        const stop = ctx.loop(dt => {
          life += dt;
          bits.forEach(b => { b.y += b.v * dt; b.r += b.vr * dt; b.n.setAttribute('transform', `translate(${f1(b.x + Math.sin(life * 3 + b.ph) * 14)} ${f1(b.y)}) rotate(${b.r.toFixed(0)}) scale(${(b.s * (.75 + .25 * Math.sin(life * 10 + b.ph))).toFixed(2)})`); });
          g.setAttribute('opacity', clamp(3.2 - life, 0, 1).toFixed(2));
          if (life > 3.2) { stop(); g.remove(); }
        });
      }
      function pop(b) {
        if (!b.alive) return;
        b.alive = false; balloons.splice(balloons.indexOf(b), 1);
        if (b === golden) golden = null;
        haptic(18);
        popSound();
        const x = b.x, y = b.y;
        burst(x, y, b.col, b.col.gold ? 34 : 26, b.col.gold ? 1.3 : 1.1);
        b.g.remove();
        popped++;
        ghost.hop();
        if (b.col.gold) goldShower();
        else if (b.shape === 'heart') { heartsUp(x, y); say('だいすき'); A.sfx('kiss', { vol: .5 }); }
        else if (b.shape === 'star') { ctx.sparkle(x, y, 8, 60); A.twinkle(); say('きれい！'); }
        else if (b.shape === 'dog') { if (!A.animal('dog', { vol: .7 })) A.voice('dog', 430); ctx.bubble('わんわん', x, y - 70); say('わんわん'); }
        else if (b.shape === 'powan') { ghost.giggle(); A.giggle(); ctx.sparkle(x, y, 5, 40, '#fff'); say('ぽわん'); ctx.after(900, () => { if (!busy) ghost.set('normal'); }); }
        else { popText(x, y - 10, b.col.d); say(b.col.n); }
        if (popped % 6 === 0 && !b.col.gold && b.shape !== 'powan') { ghost.set('happy'); ghost.talk(pick(['じょうず！', 'いっぱい ぱーん！', 'たのしいね']), false); ctx.after(1000, () => { if (!busy) ghost.set('normal'); }); }
        if (popped === 5 && !pumps) arrow.style.display = '';
        const hy = y + 150 * b.s;
        if (b.carry === 'animal') dropAnimal(x, hy, b.kind, b.col);
        else if (b.carry === 'gift') dropGift(x, hy, b.col);
      }
      function chute(g, col) {
        el('path', { d: 'M-12,-30 L-2,0 M12,-30 L2,0', stroke: '#9a92b6', 'stroke-width': 1.6 }, g);
        const c = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, g);
        el('path', { d: 'M-44,-30 Q-44,-72 0,-74 Q44,-72 44,-30 Q33,-38 22,-30 Q11,-38 0,-30 Q-11,-38 -22,-30 Q-33,-38 -44,-30Z', fill: col.c }, c);
        el('path', { d: 'M0,-74 Q-12,-52 -22,-31 M0,-74 Q12,-52 22,-31', stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: .6 }, c);
        c.animate([{ transform: 'scale(.2,.2)' }, { transform: 'scale(1.15,.9)', offset: .6 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
        return () => c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.3)', opacity: .4 }], { duration: 300, fill: 'forwards', easing: 'ease-in' });
      }
      function fall(g, x0, y0, landY, onLand) {
        if (y0 > landY - 70) {
          const top = landY - 160, yy = y0;
          A.boing();
          return ctx.tween(420, k => g.setAttribute('transform', `translate(${f1(x0)} ${f1(yy + (top - yy) * k)})`), () => fall(g, x0, top, landY, onLand), easeOut);
        }
        const dist = Math.max(0, landY - y0), dur = 900 + dist / 85 * 1000, ph = rand(0, 6);
        let x = x0;
        ctx.tween(dur, k => {
          x = clamp(x0 + Math.sin(k * 6 + ph) * 22, 50, 350);
          g.setAttribute('transform', `translate(${f1(x)} ${f1(y0 + dist * k)}) rotate(${f1(Math.sin(k * 6 + ph + 1.2) * 9)})`);
        }, () => onLand(x), k => k);
      }
      function animalCry(kind) {
        const real = { cat: 'cat', dog: 'dog', frog: 'frog' }[kind];
        if (real && A.animal(real, { vol: .7 })) return;
        if (kind === 'chick' && A.sfx('chick', { vol: .6 })) return;
        A.voice(kind === 'bunny' || kind === 'bear' ? 'other' : kind, mtof(pick(PENTA)));
      }
      function dropAnimal(x, y, kind, col) {
        const g = el('g', { transform: `translate(${x} ${y})` }, dropL);
        const fold = chute(g, col);
        const hold = el('g', {}, g);
        const a = makeAnimal(kind, hold, 0, 16, .42);
        const arm = el('g', { transform: 'translate(17 14)' }, g);
        const wave = el('g', {}, arm);
        el('ellipse', { cx: 8, cy: -6, rx: 6.5, ry: 9.5, fill: PAW[kind], stroke: 'rgba(58,47,91,.2)', 'stroke-width': 1.5 }, wave);
        wave.animate([{ transform: 'rotate(-30deg)' }, { transform: 'rotate(30deg)' }], { duration: 320, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        a.mouth(true);
        animalCry(kind);
        fall(g, x, y, 662, lx => {
          fold();
          a.mouth(false); a.sing(400); animalCry(kind);
          ctx.sparkle(lx, 690, 4, 36);
          ctx.after(1300, () => g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }).onfinish = () => g.remove());
        });
      }
      function dropGift(x, y, col) {
        const g = el('g', { transform: `translate(${x} ${y})` }, dropL);
        const fold = chute(g, col);
        const box = el('g', { transform: 'translate(0 16)' }, g);
        const lid = gift(box, pick(COLS.filter(c => c !== col)));
        fall(g, x, y, 690, lx => {
          fold(); A.twinkle(); A.boing();
          lid.animate([{ transform: 'translate(0px,0px) rotate(0deg)' }, { transform: 'translate(14px,-40px) rotate(30deg)', opacity: 0 }], { duration: 600, fill: 'forwards', easing: 'ease-out' });
          const st = el('path', { d: 'M0,-16 L4.5,-5 16,-5 7,2 10.5,14 0,7 -10.5,14 -7,2 -16,-5 -4.5,-5Z', fill: '#ffd56b', class: 'tb' }, box);
          st.animate([{ transform: 'translateY(0px) scale(.2)' }, { transform: 'translateY(-46px) scale(1.6) rotate(180deg)' }], { duration: 600, fill: 'forwards', easing: 'ease-out' });
          ctx.sparkle(lx, 660, 5, 40);
          ctx.after(1300, () => g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }).onfinish = () => g.remove());
        });
      }

      /* ---------- one loop for the drift and the ambience ---------- */
      let nextShoot = 4;
      ctx.loop((dt, t) => {
        for (let i = balloons.length - 1; i >= 0; i--) {
          const b = balloons[i];
          b.y -= b.vy * dt;
          b.x0 = clamp(b.x0 + b.push * dt, 40, 360); b.push *= Math.pow(.15, dt);
          place(b, t);
          if (b.y < -250) { b.alive = false; b.g.remove(); balloons.splice(i, 1); if (b === golden) golden = null; }
        }
        if (giant && !busy) {
          const a = Math.sin(t * 2.6) * (1.5 + pumps * 1.4);
          giant.sway.setAttribute('transform', `rotate(${a.toFixed(2)})`);
        }
        amb.clouds.forEach(c => { if (c.sky !== sky) return; const x = ((c.x + t * c.v) % 560) - 90; c.g.setAttribute('transform', `translate(${f1(x)} ${c.y})`); });
        if (sky === 1) {
          amb.boat.setAttribute('transform', `translate(${f1(((t * 10) % 520) - 60)} 600)`);
          amb.gulls.forEach((gl, i) => gl.g.setAttribute('transform', `translate(${f1(((gl.x + t * (14 + i * 4)) % 520) - 60)} ${f1(gl.y + Math.sin(t + i) * 10)})`));
        }
        if (sky === 2 && t > nextShoot) {
          nextShoot = t + rand(5, 9);
          const sx = rand(160, 420), sy = rand(40, 200);
          ctx.tween(800, q => { shoot.setAttribute('transform', `translate(${f1(sx - q * 220)} ${f1(sy + q * 80)})`); shoot.setAttribute('opacity', Math.sin(q * Math.PI).toFixed(2)); }, null, k => k);
        }
      });
      ctx.every(1150, () => { if (balloons.length < 8 && !busy) spawn(); });
      ctx.every(3600, () => { if (giant && !busy) giant.eyesOpen.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 200 }); });
      ctx.every(2900, () => pumpEyes.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 }));
      [[90, 260, 'round'], [300, 330], [180, 470], [320, 560], [70, 620]].forEach(([x, y]) => spawn(y, x));

      pump.addEventListener('pointerdown', e => { e.stopPropagation(); doPump(); });
      ghost.pos.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic(); ghost.giggle(); ghost.hop();
        ghost.talk(pick(['ふうせん だいすき', 'ぽわん だよ！', 'ふわふわ〜']), false);
        ctx.after(900, () => { if (!busy) ghost.set('normal'); });
      });
      // a tap on the open sky: a puff of air nudges the balloons and sends up a new one
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e);
        ctx.sparkle(p.x, p.y, 3, 22, sky === 2 ? '#fff8c8' : '#fff3b0');
        A.sfx('blip', { rate: rand(.9, 1.3), vol: .4 }) || A.bell(mtof(pick(PENTA) + 12), { vol: .08 });
        balloons.forEach(b => {
          const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy);
          if (d < 150) { b.push += (dx >= 0 ? 1 : -1) * (150 - d) * 1.6; b.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08,.93)' }, { transform: 'scale(1)' }], { duration: 300 }); }
        });
        const b = spawn(800, clamp(p.x, 60, 340));
        if (b) b.vy = rand(100, 130);
      });

      giant = makeGiant();
      ctx.after(500, () => { ghost.set('happy'); ghost.talk('ふうせん いっぱい！'); ctx.after(1500, () => ghost.set('normal')); });
      ctx.hint = () => {
        if (busy || !giant) return null;
        const b = popped < 3 && !pumps && balloons.find(q => q.y > 220 && q.y < 560);
        return b ? [b.x, b.y] : [PX, 560];
      };
    }
  };
  TOYS.push(balloonToy);
})();
