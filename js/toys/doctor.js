'use strict';
/* =========================================================
   toy: おいしゃさん — a gentle animal clinic
   a little patient with a boo-boo (a bump, sneezes or a tummy ache) gets
   listened to, measured, cooled, patched and given yummy medicine until all better
   ========================================================= */
(() => {
  const INK = '#3a2f5b';
  const shine = (g, cx, cy, rx, ry, rot = -25, op = .35) => el('ellipse', { cx, cy, rx, ry, fill: '#fff', opacity: op, transform: `rotate(${rot} ${cx} ${cy})` }, g);
  const star = (g, x, y, r, fill) => {
    let d = '';
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1); }
    return el('path', { d: d + 'Z', fill, 'stroke-linejoin': 'round' }, g);
  };

  /* ---------- patients ---------- */
  const KINDS = {
    dog: { body: '#d9a066', patch: '#f3d9b5', paw: '#c48a50', mouth: [0, 25, 14, 7], muz: '#f3d9b5', frown: 'M-7,28 Q0,22 7,28', nose: [0, 9, 10, 7], eyeY: -10 },
    cat: { body: '#ffb066', patch: '#ffe2c2', paw: '#ffa95c', mouth: [0, 21, 11, 6], muz: '#ffb066', frown: 'M-6,23 Q0,18 6,23', nose: [0, 12, 7, 5], eyeY: -4 },
    bear: { body: '#b9824f', patch: '#e8c49a', paw: '#a8733f', mouth: [0, 23, 11, 6], muz: '#e8c49a', frown: 'M-6,25 Q0,20 6,25', nose: [0, 9, 9, 7], eyeY: -6 },
    bunny: { body: '#fff4f7', patch: '#ffe1ea', paw: '#fbe6ee', mouth: [0, 20, 10, 6.5], muz: '#fff4f7', frown: 'M-6,23 Q0,18 6,23', nose: [0, 10, 6, 5], eyeY: -4, line: '#f3d8e2' }
  };
  const ORDER = ['dog', 'cat', 'bear', 'bunny'];
  const BOOS = ['bump', 'sneeze', 'tummy'];
  const SPOT = { // where each tool goes on the patient (local units)
    bump: { ice: [30, -38], band: [30, -38] },
    sneeze: { ice: [0, -30], band: [-60, 104] },
    tummy: { ice: [0, 100], band: [16, 112] }
  };
  function cry(kind, o = {}) {
    if ((kind === 'dog' || kind === 'cat') && A.animal(kind, { vol: .7, ...o })) return;
    if (kind === 'bear' && A.sfx('cutie2', { vol: .7, rate: .75, ...o })) return;
    if (kind === 'bunny' && A.sfx('cutie', { vol: .7, ...o })) return;
    A.osc(kind === 'bear' ? 220 : 820, { vib: 8, vibD: .05, hold: .1, slide: kind === 'bear' ? 260 : 1100, slideT: .15, r: .15, vol: .14 });
  }

  /* ---------- tool drawings (about 70 units across) ---------- */
  const TOOLS = [
    { id: 'steth', ring: '#8f9cff', tint: '#eef0ff', draw(g) {
      el('path', { d: 'M-18,-26 Q-22,4 0,12 Q22,4 18,-26', stroke: '#7f8cff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
      [-18, 18].forEach(x => el('circle', { cx: x, cy: -28, r: 5, fill: INK }, g));
      el('path', { d: 'M0,12 Q0,26 14,26', stroke: '#7f8cff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('circle', { cx: 18, cy: 26, r: 13, fill: '#c9d2e3' }, g);
      el('circle', { cx: 18, cy: 26, r: 8, fill: '#eef2f8', stroke: '#ff8fa3', 'stroke-width': 3 }, g);
    } },
    { id: 'thermo', ring: '#ff9a8a', tint: '#fff0ec', draw(g) {
      const t = el('g', { transform: 'rotate(-35)' }, g);
      el('rect', { x: -10, y: -34, width: 20, height: 56, rx: 10, fill: '#fff', stroke: '#ffb3a6', 'stroke-width': 3 }, t);
      el('rect', { x: -6, y: -24, width: 12, height: 18, rx: 3, fill: '#9fe3c6' }, t);
      el('path', { d: 'M-4,22 L4,22 L2,36 Q0,40 -2,36Z', fill: '#c9d2e3' }, t);
      el('circle', { cx: 0, cy: 6, r: 3.5, fill: '#ff8fa3' }, t);
    } },
    { id: 'ice', ring: '#6ec3ff', tint: '#eaf6ff', draw(g) {
      el('rect', { x: -28, y: -22, width: 56, height: 44, rx: 16, fill: '#8fd0ff' }, g);
      el('rect', { x: -22, y: -16, width: 22, height: 8, rx: 4, fill: '#fff', opacity: .5 }, g);
      [-6, 6].forEach(x => el('circle', { cx: x, cy: 2, r: 2.8, fill: INK }, g));
      el('path', { d: 'M-4,8 Q0,12 4,8', stroke: INK, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, g);
      [-1, 1].forEach(s => el('ellipse', { cx: s * 14, cy: 7, rx: 4, ry: 2.6, fill: '#ff8fa3', opacity: .8 }, g));
      el('path', { d: 'M18,-30 v14 M11,-23 h14 M13,-28 l10,10 M23,-28 l-10,10', stroke: '#fff', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
    } },
    { id: 'band', ring: '#ff8fb8', tint: '#fff0f6', draw(g) {
      const b = el('g', { transform: 'rotate(-28)' }, g);
      el('rect', { x: -36, y: -13, width: 72, height: 26, rx: 13, fill: '#ffb3c8' }, b);
      el('rect', { x: -11, y: -13, width: 22, height: 26, rx: 4, fill: '#fff4f8' }, b);
      star(b, -24, 0, 6, '#ffd23f'); star(b, 24, 0, 6, '#7fd0ff');
      [[-6, -6], [6, -6], [0, 4], [-6, 6], [6, 6]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.4, fill: '#ffc4d6' }, b));
    } },
    { id: 'med', ring: '#ffc44d', tint: '#fff8e6', draw(g) {
      const s = el('g', { transform: 'rotate(-20)' }, g);
      el('rect', { x: 8, y: -5, width: 34, height: 10, rx: 5, fill: '#ffd56b' }, s);
      el('ellipse', { cx: -10, cy: 0, rx: 22, ry: 14, fill: '#e8eef7' }, s);
      el('ellipse', { cx: -10, cy: -1, rx: 16, ry: 9, fill: '#ff7aa8' }, s);
      shine(s, -16, -4, 5, 2.4, 0, .7);
      el('path', { d: 'M-8,-30 Q-2,-20 -8,-16 Q-14,-20 -8,-30Z', fill: '#ff7aa8', transform: 'rotate(20)' }, g);
    } }
  ];
  const BTN = { steth: [52, 300], thermo: [48, 420], ice: [52, 540], band: [348, 370], med: [350, 490] };
  const CURE = { bump: 'ice', sneeze: 'med', tummy: 'steth' };

  const doctorToy = {
    id: 'doctor', name: 'おいしゃさん', color: '#9fe6cf',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#d6f6ea' }, g);
      el('rect', { x: -80, y: 44, width: 160, height: 40, fill: '#bfeedd' }, g);
      el('ellipse', { cx: 0, cy: 60, rx: 50, ry: 8, fill: INK, opacity: .12 }, g);
      el('ellipse', { cx: 0, cy: 36, rx: 34, ry: 30, fill: KINDS.bear.body }, g);
      el('ellipse', { cx: 0, cy: 40, rx: 22, ry: 20, fill: KINDS.bear.patch }, g);
      const a = makeAnimal('bear', g, 0, -10, .62);
      a.sleep(true); a.mouth(true);
      const b = el('g', { transform: 'translate(18 -34) scale(.55)' }, g); TOOLS[3].draw(b);
      const h = el('g', { transform: 'translate(-50 -44) scale(.9)' }, g);
      el('path', { d: 'M0,10 C-18,-4 -12,-20 0,-11 C12,-20 18,-4 0,10Z', fill: '#ff8fa3' }, h);
      const t = el('g', { transform: 'translate(52 30) scale(.5)' }, g); TOOLS[0].draw(t);
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      let round = 0, phase = 'enter', busy = true, done = 0, need = 4, used = {}, queued = null, rare = false;

      /* ================= room ================= */
      const grad = (id, a, b) => { const gr = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs); el('stop', { offset: 0, 'stop-color': a }, gr); el('stop', { offset: 1, 'stop-color': b }, gr); return gr; };
      grad('doctor-sky', '#9fd8ff', '#e8f7ff');
      grad('doctor-floor', '#f6efe4', '#eadfce');
      grad('doctor-bench', '#ffffff', '#e2f3ff');
      const dots = el('pattern', { id: 'doctor-dots', width: 48, height: 48, patternUnits: 'userSpaceOnUse' }, defs);
      el('path', { d: 'M12,15 C6,10 8,5 12,8 C16,5 18,10 12,15Z', fill: '#fff', opacity: .6 }, dots);
      el('circle', { cx: 36, cy: 36, r: 3, fill: '#fff', opacity: .5 }, dots);
      el('rect', { x: -800, y: -900, width: 2000, height: 1500, fill: '#dcf6ec' }, svg);
      el('rect', { x: -800, y: -900, width: 2000, height: 1500, fill: 'url(#doctor-dots)' }, svg);
      el('rect', { x: -800, y: 560, width: 2000, height: 40, fill: '#c3eedd' }, svg);
      el('rect', { x: -800, y: 556, width: 2000, height: 8, rx: 4, fill: '#fff', opacity: .7 }, svg);
      el('rect', { x: -800, y: 600, width: 2000, height: 1300, fill: 'url(#doctor-floor)' }, svg);
      for (let x = -40; x < 460; x += 60) el('path', { d: `M${x},604 L${x - 36},760`, stroke: '#e6d8c2', 'stroke-width': 3, opacity: .7 }, svg);
      // window (far)
      const WX = 122, WY = 86, WW = 156, WH = 128;
      const wc = el('clipPath', { id: 'doctor-win' }, defs); el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 24 }, wc);
      el('rect', { x: WX - 10, y: WY - 10, width: WW + 20, height: WH + 20, rx: 32, fill: '#fff', filter: 'url(#soft)' }, svg);
      const win = el('g', { 'clip-path': 'url(#doctor-win)' }, svg);
      el('rect', { x: WX, y: WY, width: WW, height: WH, fill: 'url(#doctor-sky)' }, win);
      const sunG = el('g', { transform: `translate(${WX + 118} ${WY + 36})` }, win);
      const sunHalo = el('circle', { r: 26, fill: '#fff', opacity: .4, class: 'tb' }, sunG);
      el('circle', { r: 17, fill: '#ffe066' }, sunG);
      sunHalo.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }], { duration: 1700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      const rainbow = el('g', { opacity: 0 }, win);
      ['#ff8fa3', '#ffd56b', '#9fe3a0', '#8fc8ff', '#c9a7ff'].forEach((c, i) => el('path', { d: `M${WX - 10},${WY + WH + 14} A${110 - i * 10},${110 - i * 10} 0 0 1 ${WX + WW + 10},${WY + WH + 14}`, stroke: c, 'stroke-width': 10, fill: 'none' }, rainbow));
      el('ellipse', { cx: WX + 50, cy: WY + WH + 6, rx: 90, ry: 30, fill: '#a8e08f' }, win);
      el('ellipse', { cx: WX + 130, cy: WY + WH + 10, rx: 80, ry: 32, fill: '#94d67c' }, win);
      const clouds = [[WX + 10, WY + 40, .7, 8], [WX + 90, WY + 74, .55, 5]].map(([x, y, s, sp]) => {
        const o = el('g', {}, win);
        [[0, 0, 15], [17, -7, 20], [36, 0, 14]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill: '#fff' }, o));
        return { o, x, y, s, sp, boost: 0 };
      });
      el('path', { d: `M${WX + WW / 2},${WY} V${WY + WH} M${WX},${WY + WH / 2} H${WX + WW}`, stroke: '#fff', 'stroke-width': 7 }, svg);
      // heart poster (mid)
      const poster = el('g', { transform: 'translate(344 118)' }, svg);
      const posterIn = el('g', { class: 'tb' }, poster);
      el('rect', { x: -38, y: -38, width: 76, height: 76, rx: 16, fill: '#fff', filter: 'url(#soft)' }, posterIn);
      el('path', { d: 'M0,22 C-30,2 -20,-26 0,-10 C20,-26 30,2 0,22Z', fill: '#ff8fa3' }, posterIn);
      shine(posterIn, -10, -8, 6, 4, -30, .6);
      [-6, 6].forEach(x => el('circle', { cx: x, cy: 0, r: 2.4, fill: INK }, posterIn));
      el('path', { d: 'M-4,6 Q0,10 4,6', stroke: INK, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, posterIn);
      el('rect', { x: -40, y: -40, width: 80, height: 80, fill: 'transparent' }, posterIn);
      poster.addEventListener('pointerdown', e => {
        e._docDone = true;
        posterIn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18,.86)' }, { transform: 'scale(.94,1.08)' }, { transform: 'scale(1)' }], { duration: 420 });
        A.sfx('kiss', { vol: .5, rate: rand(.9, 1.2) }) || A.pop();
        hearts(344, 100, 3);
      });
      // shelf with a fish bowl (mid)
      el('rect', { x: 0, y: 214, width: 104, height: 11, rx: 5, fill: '#e0b98a', filter: 'url(#soft)' }, svg);
      const bowlG = el('g', { transform: 'translate(54 182)' }, svg);
      el('circle', { r: 31, fill: '#cfeeff', opacity: .85 }, bowlG);
      el('rect', { x: -31, y: -6, width: 62, height: 40, fill: '#9fd8ff', opacity: .7, 'clip-path': 'url(#doctor-bowl)' }, bowlG);
      const bc = el('clipPath', { id: 'doctor-bowl' }, defs); el('circle', { r: 30 }, bc);
      el('rect', { x: -20, y: -33, width: 40, height: 8, rx: 4, fill: '#e8f7ff' }, bowlG);
      shine(bowlG, -14, -12, 8, 4, -30, .7);
      const fish = el('g', {}, bowlG);
      el('ellipse', { rx: 10, ry: 7, fill: '#ff9f7a' }, fish);
      el('path', { d: 'M8,0 L16,-6 L16,6Z', fill: '#ff9f7a' }, fish);
      el('circle', { cx: -4, cy: -2, r: 1.8, fill: INK }, fish);
      el('rect', { x: -34, y: -36, width: 68, height: 70, fill: 'transparent' }, bowlG);
      const fishS = { x: 0, dir: 1, speed: 14, boost: 0 };
      bowlG.addEventListener('pointerdown', e => {
        e._docDone = true; fishS.boost = 1.2; fishS.dir *= -1;
        A.sfx('blub', { vol: .6, rate: rand(.9, 1.2) }) || A.sfx('bubble', { vol: .6 });
        for (let i = 0; i < 3; i++) particle(54 + rand(-10, 10), 180, rand(-10, 10), rand(-80, -40), rand(2.5, 4), '#ffffff', .7, -40);
      });
      // plant (near-left)
      const plantO = el('g', { transform: 'translate(374 604)' }, svg);
      const plant = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, plantO);
      [[-14, -50, -26], [0, -62, 0], [14, -50, 26], [-8, -34, -50], [8, -34, 50]].forEach(([x, y, r], i) => el('ellipse', { cx: x, cy: y, rx: 9, ry: 20, fill: i % 2 ? '#6fcf6a' : '#5cbf4f', transform: `rotate(${r} ${x} ${y})` }, plant));
      el('path', { d: 'M-20,-24 L20,-24 L15,0 L-15,0Z', fill: '#ffb38a' }, plant);
      el('rect', { x: -22, y: -60, width: 44, height: 60, fill: 'transparent' }, plant);
      plant.animate([{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 2600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      plantO.addEventListener('pointerdown', e => {
        e._docDone = true;
        plant.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0deg)' }], { duration: 600, composite: 'add' });
        A.sfx('plink', { vol: .5, rate: rand(.9, 1.2) }) || A.pluck(mtof(PENTA[5]), { vol: .1 });
        ctx.sparkle(374, 560, 2, 20, '#9fe3a0');
      });
      // exam bench (near)
      const bench = el('g', {}, svg);
      el('ellipse', { cx: 200, cy: 694, rx: 150, ry: 14, fill: INK, opacity: .12 }, bench);
      [96, 304].forEach(x => el('rect', { x: x - 8, y: 650, width: 16, height: 42, rx: 6, fill: '#c9d2e3' }, bench));
      el('rect', { x: 62, y: 618, width: 276, height: 46, rx: 23, fill: 'url(#doctor-bench)', filter: 'url(#soft)' }, bench);
      const benchStripe = el('rect', { x: 62, y: 646, width: 276, height: 10, fill: '#ffc4d6' }, bench);
      shine(bench, 110, 628, 34, 5, 0, .8);

      /* ================= layers ================= */
      const patientL = el('g', {}, svg);
      const btnL = el('g', {}, svg);
      const toolL = el('g', { 'pointer-events': 'none' }, svg);
      const fxL = el('g', { 'pointer-events': 'none' }, svg);
      const ghost = ctx.ghost(svg, { x: 340, y: 232, s: .5 });
      // a little nurse cap for ぽわん
      const cap = el('g', { transform: 'rotate(8 0 -70) translate(0 -70) scale(1.35) translate(0 70)' }, ghost.body);
      el('path', { d: 'M-34,-64 Q-30,-96 0,-98 Q30,-96 34,-64 Q0,-74 -34,-64Z', fill: '#fff', stroke: '#e6defa', 'stroke-width': 2.5 }, cap);
      el('path', { d: 'M0,-92 C-9,-98 -11,-86 0,-80 C11,-86 9,-98 0,-92Z', fill: '#ff8fa3' }, cap);
      const uiL = el('g', { 'pointer-events': 'none' }, svg);

      /* ================= particles / hearts ================= */
      const parts = [];
      function particle(x, y, vx, vy, r, color, life = .8, g = 900) {
        if (parts.length > 70) return;
        const node = el('circle', { r: r.toFixed(1), fill: color }, fxL);
        parts.push({ node, x, y, vx, vy, g, life, max: life });
      }
      function burst(x, y, n, colors, sp = 160, up = 200, r = [2.5, 5]) {
        for (let i = 0; i < n; i++) particle(x, y, rand(-sp, sp), rand(-up - 100, -up * .3), rand(r[0], r[1]), pick(colors), rand(.6, .9));
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
      const squash = (node, a = 1, dur = 400) => node.animate([{ transform: 'scale(1)' }, { transform: `scale(${1 + .15 * a},${1 - .14 * a})`, offset: .3 }, { transform: `scale(${1 - .07 * a},${1 + .08 * a})`, offset: .65 }, { transform: 'scale(1)' }], { duration: dur, easing: 'ease-out' });

      /* ================= progress hearts ================= */
      const meter = [];
      el('rect', { x: 200 - 2 * 44 - 10, y: 24, width: 4 * 44 + 20, height: 46, rx: 23, fill: '#fff', opacity: .8 }, uiL);
      for (let i = 0; i < 4; i++) {
        const o = el('g', { transform: `translate(${200 + (i - 1.5) * 44} 48)` }, uiL);
        const g = el('g', { class: 'tb' }, o);
        const h = el('path', { d: 'M0,11 C-20,-3 -13,-19 0,-9 C13,-19 20,-3 0,11Z', fill: '#fff', stroke: '#ffb3c8', 'stroke-width': 3 }, g);
        meter.push({ g, h });
      }
      function setMeter(n, pop) {
        meter.forEach((m, i) => {
          m.h.setAttribute('fill', i < n ? '#ff7a9a' : '#fff');
          if (pop && i === n - 1) m.g.animate([{ transform: 'scale(.3)' }, { transform: 'scale(1.45)' }, { transform: 'scale(1)' }], { duration: 460, easing: 'ease-out' });
        });
      }

      /* ================= tool buttons ================= */
      const buttons = {};
      TOOLS.forEach((T, i) => {
        const [x, y] = BTN[T.id];
        const o = el('g', { transform: `translate(${x} ${y})` }, btnL);
        el('ellipse', { cx: 0, cy: 44, rx: 34, ry: 7, fill: INK, opacity: .1 }, o);
        const fl = el('g', { class: 'float' }, o);
        fl.style.animationDelay = `-${(i * .6).toFixed(1)}s`;
        const b = el('g', { class: 'tb' }, fl);
        el('circle', { r: 45, fill: '#fff' }, b);
        el('circle', { r: 45, fill: 'none', stroke: T.ring, 'stroke-width': 5 }, b);
        el('circle', { r: 36, fill: T.tint }, b);
        shine(b, -18, -24, 12, 6, -30, .8);
        const ic = el('g', { transform: 'scale(.9)' }, b);
        T.draw(ic);
        const badge = el('g', { transform: 'translate(30 -30)', style: 'display:none' }, b);
        el('circle', { r: 13, fill: '#fff' }, badge);
        star(badge, 0, 0, 10, '#ffd23f');
        const glow = el('circle', { r: 50, fill: 'none', stroke: T.ring, 'stroke-width': 6, opacity: 0, class: 'tb' }, b);
        buttons[T.id] = { T, o, b, badge, glow, x, y };
        o.addEventListener('pointerdown', e => {
          e.stopPropagation(); haptic(12);
          squash(b, 1, 360);
          A.sfx('click', { vol: .5, rate: rand(.9, 1.15) }) || A.click();
          if (phase === 'enter') { queued = T.id; return; }
          if (phase !== 'treat') { A.sfx('blip', { vol: .4 }); return; }
          if (busy) { queued = T.id; return; }
          treat(T.id);
        });
      });
      let glowAnim = null;
      function glowHint() {
        if (glowAnim) { glowAnim.cancel(); glowAnim = null; }
        if (phase !== 'treat') return;
        const id = nextHint();
        if (!id) return;
        glowAnim = buttons[id].glow.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: .7, transform: 'scale(1.06)' }, { opacity: 0, transform: 'scale(1.18)' }], { duration: 1400, iterations: Infinity, delay: 1800 });
      }
      function nextHint() {
        if (!P) return null;
        if (!used[CURE[P.boo]]) return CURE[P.boo];
        return TOOLS.map(t => t.id).find(id => !used[id]) || CURE[P.boo];
      }

      /* ================= the patient ================= */
      let P = null;
      const PS = 1.5, PY = 402;
      function makePatient(kind, boo) {
        const K = KINDS[kind];
        const outer = el('g', {}, patientL);
        el('ellipse', { cx: 0, cy: 156, rx: 78, ry: 11, fill: INK, opacity: .12 }, outer);
        const breath = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, outer);
        const hop = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, breath);
        const stroke = K.line ? { stroke: K.line, 'stroke-width': 2 } : {};
        [-1, 1].forEach(s => el('ellipse', { cx: s * 30, cy: 146, rx: 22, ry: 13, fill: K.paw, ...stroke }, hop));
        el('ellipse', { cx: 0, cy: 94, rx: 60, ry: 58, fill: K.body, ...stroke }, hop);
        el('ellipse', { cx: 0, cy: 104, rx: 38, ry: 36, fill: K.patch }, hop);
        shine(hop, -30, 66, 12, 18, 20, .3);
        const tummyFx = el('g', { transform: 'translate(0 104)', style: boo === 'tummy' ? '' : 'display:none' }, hop);
        const swirl = el('path', { d: 'M0,0 m-2,0 a2,2 0 1 1 4,0 a5,5 0 1 1 -10,0 a8,8 0 1 1 16,0 a11,11 0 1 1 -22,0', stroke: '#c9a7ff', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', opacity: .85, class: 'tb' }, tummyFx);
        swirl.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 2600, iterations: Infinity });
        const tilt = el('g', {}, hop);
        const an = makeAnimal(kind, tilt, 0, 0, 1);
        const arms = [-1, 1].map(s => {
          const a = el('g', {}, hop);
          el('ellipse', { cx: s * 56, cy: 96, rx: 15, ry: 26, fill: K.body, transform: `rotate(${s * -14} ${s * 56} 96)`, ...stroke }, a);
          el('ellipse', { cx: s * 58, cy: 116, rx: 12, ry: 9, fill: K.paw }, a);
          return { a, s, ang: 0 };
        });
        // sad overlay: worried brows and a little wobbly mouth
        const sad = el('g', {}, an.body);
        const [mx, my, mrx, mry] = K.mouth;
        el('ellipse', { cx: mx, cy: my, rx: mrx, ry: mry, fill: K.muz }, sad);
        el('path', { d: K.frown, stroke: '#6a4a40', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, sad);
        const by = K.eyeY - 15;
        [-1, 1].forEach(s => el('path', { d: `M${s * 30},${by + 3} L${s * 12},${by - 3}`, stroke: '#6a4a40', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, sad));
        // boo-boos
        const bumpO = el('g', { transform: 'translate(30 -38)', style: boo === 'bump' ? '' : 'display:none' }, an.body);
        const bump = el('g', { class: 'tb' }, bumpO);
        el('ellipse', { cx: 0, cy: 2, rx: 17, ry: 14, fill: '#ff8f9c' }, bump);
        el('ellipse', { cx: 0, cy: 0, rx: 13, ry: 11, fill: '#ffabb5' }, bump);
        shine(bump, -5, -4, 4, 2.4, -30, .8);
        const bumpPulse = bump.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }], { duration: 700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', composite: 'add' });
        const [nx, ny, nrx, nry] = K.nose;
        const nose = el('ellipse', { cx: nx, cy: ny, rx: nrx, ry: nry, fill: '#ff6b7f', style: boo === 'sneeze' ? '' : 'display:none' }, an.body);
        const noseShine = el('circle', { cx: nx - 2, cy: ny - 2, r: 1.8, fill: '#fff', opacity: .8, style: boo === 'sneeze' ? '' : 'display:none' }, an.body);
        const bandL = el('g', {}, hop);
        el('circle', { cx: 0, cy: 50, r: 110, fill: 'transparent' }, hop);
        const p = { kind, boo, K, outer, breath, hop, tilt, an, sad, bumpO, bump, bumpPulse, bumpS: 1, nose, noseShine, tummyFx, arms, bandL, x: -200, y: PY, bands: 0, mood: 'sad', tiltA: 0, tiltT: 0 };
        breath.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.015,1.03)' }], { duration: 1600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        outer.addEventListener('pointerdown', e => { e.stopPropagation(); pokePatient(p, e); });
        placeP(p, p.x, p.y);
        setArms(p, boo === 'tummy' ? 'tummy' : 'rest', 0);
        return p;
      }
      function placeP(p, x, y) { p.x = x; p.y = y; p.outer.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${PS})`); }
      const W = (p, lx, ly) => [p.x + lx * PS, p.y + ly * PS];
      const POSE = { rest: [0, 0], tummy: [-62, 62], up: [150, -150], hug: [100, -100], wave: [0, -150] };
      function setArms(p, pose, ms = 300) {
        const [l, r] = POSE[pose];
        p.arms.forEach((A_, i) => {
          const from = A_.ang, to = i ? r : l;
          const ap = k => { A_.ang = from + (to - from) * k; A_.a.setAttribute('transform', `rotate(${A_.ang.toFixed(1)} ${A_.s * 46} 70)`); };
          if (!ms) ap(1); else ctx.tween(ms, ap, null, easeBack);
        });
      }
      function setMood(p, mood) {
        p.mood = mood;
        p.sad.style.display = mood === 'sad' ? '' : 'none';
        p.an.sleep(mood === 'joy');
        p.an.mouth(mood === 'joy');
      }
      function blinkP(p) {
        if (p.mood === 'joy') return;
        p.an.sleep(true);
        ctx.after(140, () => { if (p.mood !== 'joy') p.an.sleep(false); });
      }
      function jiggle(p, a = 1) { squash(p.hop, a, 420); }
      function pokePatient(p, e) {
        haptic(10);
        jiggle(p, .7);
        cry(p.kind, { rate: rand(.95, 1.15) });
        const pt = ctx.point(e);
        hearts(pt.x, pt.y - 10, 2);
        if (phase === 'treat' && p.boo === 'sneeze' && Math.random() < .3) ctx.after(300, () => sneeze(p));
        else if (p.mood !== 'joy') { const m = p.mood; setMood(p, 'joy'); ctx.after(500, () => { if (p === P && p.mood === 'joy' && phase !== 'happy') setMood(p, m); }); }
      }
      function sniffle() { A.noise({ type: 'highpass', from: 2600, to: 3400, dur: .16, vol: .05, wet: 0 }); A.noise({ type: 'highpass', from: 2600, to: 3600, dur: .14, vol: .05, wet: 0, when: .22 }); }
      function sneeze(p) {
        if (p !== P || phase === 'happy') return;
        p.an.body.animate([{ transform: 'translateY(0px) rotate(0deg)' }, { transform: 'translateY(-6px) rotate(-6deg)', offset: .4 }, { transform: 'translateY(6px) rotate(4deg)', offset: .6 }, { transform: 'translateY(0px) rotate(0deg)' }], { duration: 520 });
        ctx.after(200, () => {
          A.noise({ type: 'bandpass', from: 1400, to: 3200, dur: .22, vol: .12, q: .8, wet: .05 });
          A.osc(520, { type: 'triangle', slide: 300, slideT: .12, r: .08, vol: .06 });
          ctx.bubble('くしゅん！', p.x, p.y - 120);
          const [x, y] = W(p, 0, 16);
          burst(x, y, 6, ['#ffffff', '#e8f7ff'], 120, 120, [3, 5]);
        });
      }

      /* ================= treatments ================= */
      function flyTool(id, to, scale, ms, done) {
        const b = buttons[id];
        const o = el('g', {}, toolL);
        const inner = el('g', { class: 'tb' }, o);
        b.T.draw(inner);
        const x0 = b.x, y0 = b.y, [tx, ty] = to;
        const top = Math.min(y0, ty) - 60;
        const set = (x, y, s, r = 0) => o.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(1)}) scale(${s.toFixed(3)})`);
        set(x0, y0, .9);
        ctx.tween(ms, k => set(x0 + (tx - x0) * k, (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * top + k * k * ty, .9 + (scale - .9) * k, Math.sin(k * Math.PI) * (x0 < 200 ? 20 : -20)), () => done && done(o, inner, set), easeInOut);
        return o;
      }
      function sendBack(id, o, from, ms = 420) {
        const b = buttons[id], [x0, y0] = from;
        ctx.tween(ms, k => o.setAttribute('transform', `translate(${(x0 + (b.x - x0) * k).toFixed(1)} ${(y0 + (b.y - y0) * k - Math.sin(k * Math.PI) * 40).toFixed(1)}) scale(${(1.2 - .3 * k).toFixed(3)})`), () => {
          o.remove(); squash(b.b, .5, 260); A.sfx('drop', { vol: .35, rate: rand(.9, 1.2) });
        }, easeInOut);
      }
      function shrinkBump(p, f) {
        if (p.boo !== 'bump') return;
        const s0 = p.bumpS, s1 = Math.max(.25, s0 * f);
        p.bumpS = s1;
        ctx.tween(500, k => p.bumpO.setAttribute('transform', `translate(30 -38) scale(${(s0 + (s1 - s0) * k).toFixed(3)})`), null, easeBack);
      }
      function feelBetter(p) {
        if (p.boo === 'sneeze') {
          const op = Math.max(.15, 1 - done / need);
          p.nose.setAttribute('opacity', op.toFixed(2));
        }
        if (p.boo === 'tummy') p.tummyFx.setAttribute('opacity', Math.max(.1, 1 - done / need).toFixed(2));
        if (done >= 2 && p.mood === 'sad') { setMood(p, 'ok'); if (p.boo === 'tummy') setArms(p, 'rest', 400); }
      }
      const ACT = {
        steth(p, fin) {
          const tgt = W(p, 4, 78);
          let tube = el('path', { stroke: '#7f8cff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: .9 }, toolL);
          const b = buttons.steth;
          const o = flyTool('steth', tgt, 1.25, 520, (o, inner) => {
            A.sfx('blink', { vol: .5, rate: .8 });
            squash(inner, 1, 300); jiggle(p, .3);
            say('どきどき'); ctx.bubble('どきどき', p.x, p.y - 128);
            const hx = tgt[0] - 50, hy = tgt[1] - 6;
            const hO = el('g', { transform: `translate(${hx} ${hy})` }, fxL);
            const h = el('path', { d: 'M0,16 C-30,-6 -20,-34 0,-16 C20,-34 30,-6 0,16Z', fill: '#ff7a9a', class: 'tb' }, hO);
            shine(hO, -9, -12, 5, 3, -30, .7);
            for (let i = 0; i < 4; i++) ctx.after(i * 380, () => {
              const big = i % 2 === 0;
              h.animate([{ transform: 'scale(1)' }, { transform: `scale(${big ? 1.4 : 1.25})` }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
              A.osc(big ? 74 : 66, { type: 'sine', slide: 46, slideT: .1, r: .14, vol: .3, wet: 0 });
              A.osc(big ? 148 : 132, { type: 'triangle', slide: 90, slideT: .08, r: .07, vol: .08, wet: 0 });
              haptic(8);
            });
            hO.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .85 }, { opacity: 0 }], { duration: 1700 }).onfinish = () => hO.remove();
            ctx.after(1600, () => { tube.remove(); sendBack('steth', o, tgt); fin(); });
          });
          const upd = ctx.loop(() => {
            if (!tube.isConnected) return upd();
            const m = o.getCTM && o.transform.baseVal.consolidate();
            if (!m) return;
            const x = m.matrix.e, y = m.matrix.f;
            tube.setAttribute('d', `M${b.x},${b.y - 10} Q${(b.x + x) / 2},${Math.max(b.y, y) + 60} ${(x - 4).toFixed(1)},${(y - 18).toFixed(1)}`);
          });
        },
        thermo(p, fin) {
          const tgt = W(p, -50, 70);
          const o = flyTool('thermo', tgt, 1.2, 520, (o, inner) => {
            jiggle(p, .3);
            if (p.mood !== 'joy') { const m = p.mood; setMood(p, 'joy'); ctx.after(500, () => setMood(p, m)); }
            [0, 1, 2].forEach(i => { if (!A.sfx('blip', { vol: .5, rate: 1.2 + i * .15, when: i * .2 })) A.osc(2100, { r: .05, vol: .1, when: i * .2, wet: 0 }); });
            ctx.after(650, () => {
              A.sfx('ok', { vol: .5 }) || A.bell(mtof(PENTA[7] + 12), { vol: .12 });
              say('ぴぴっ');
              const bx = 200, byy = 168;
              const g = el('g', { transform: `translate(${bx} ${byy})` }, fxL);
              const inn = el('g', { class: 'tb' }, g);
              el('rect', { x: -112, y: -60, width: 224, height: 120, rx: 60, fill: '#fff3b0', opacity: .4 }, inn);
              el('rect', { x: -102, y: -52, width: 204, height: 104, rx: 52, fill: '#fff3b0', opacity: .6 }, inn);
              el('rect', { x: -90, y: -42, width: 180, height: 84, rx: 42, fill: '#fff', stroke: '#9fe3c6', 'stroke-width': 5 }, inn);
              const t = el('text', { x: -8, y: 3, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 56, 'font-weight': 700, fill: '#ff7a8a' }, inn);
              t.textContent = '36.5';
              star(inn, 66, -4, 13, '#ffd23f');
              inn.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.18)', offset: .6 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
              const glowA = inn.animate([{ opacity: 1 }, { opacity: .82 }], { duration: 300, iterations: 4, direction: 'alternate', delay: 420 });
              ctx.sparkle(bx, byy, 4, 70, '#ffe066');
              ctx.after(1500, () => { glowA.cancel(); inn.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.4)', opacity: 0 }], { duration: 260, fill: 'forwards' }).onfinish = () => g.remove(); });
              ctx.after(500, () => { sendBack('thermo', o, tgt); fin(); });
            });
          });
        },
        ice(p, fin) {
          const tgt = W(p, ...SPOT[p.boo].ice);
          const o = flyTool('ice', tgt, 1.15, 520, (o, inner) => {
            A.sfx('squish', { vol: .5 }) || A.pop();
            say('ひんやり'); ctx.bubble('ひんやり', p.x, p.y - 128);
            inner.animate([{ transform: 'translateX(0px) rotate(0deg)' }, { transform: 'translateX(-7px) rotate(-8deg)' }, { transform: 'translateX(7px) rotate(8deg)' }, { transform: 'translateX(0px) rotate(0deg)' }], { duration: 360, iterations: 3 });
            A.sfx('sparkle', { vol: .4, rate: 1.2, when: .2 }) || A.twinkle();
            for (let i = 0; i < 3; i++) ctx.after(150 + i * 250, () => ctx.sparkle(tgt[0], tgt[1], 2, 30, i % 2 ? '#ffffff' : '#bfe6ff'));
            shrinkBump(p, .5);
            if (p.mood !== 'joy') { const m = p.mood; setMood(p, 'joy'); ctx.after(900, () => setMood(p, m === 'sad' && done >= 2 ? 'ok' : m)); }
            ctx.after(1150, () => { sendBack('ice', o, tgt); fin(); });
          });
        },
        band(p, fin) {
          const [lx0, ly0] = SPOT[p.boo].band;
          const k = p.bands++;
          const lx = lx0 + [0, 12, -12][k % 3], ly = ly0 + [0, 10, -8][k % 3];
          const tgt = W(p, lx, ly);
          flyTool('band', tgt, PS * .62, 460, (o) => {
            o.remove();
            if (p.bands > 3) { const first = p.bandL.firstChild; if (first) first.remove(); }
            const g = el('g', { transform: `translate(${lx} ${ly}) rotate(${(-28 + rand(-12, 12)).toFixed(0)}) scale(.62)` }, p.bandL);
            const inner = el('g', { class: 'tb' }, g);
            buttons.band.T.draw(inner);
            inner.animate([{ transform: 'scale(1.5)' }, { transform: 'scale(.85)', offset: .5 }, { transform: 'scale(1.06)', offset: .8 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
            A.sfx('pop2', { vol: .6, rate: rand(.9, 1.1) }) || A.pop();
            say('ぺたっ'); ctx.bubble('ぺたっ', p.x, p.y - 128);
            jiggle(p, .4);
            shrinkBump(p, .7);
            ctx.sparkle(tgt[0], tgt[1], 4, 40, pick(['#ffd23f', '#7fd0ff', '#ff8fb8']));
            ctx.after(700, fin);
          });
        },
        med(p, fin) {
          const tgt = W(p, 14, 28);
          p.an.mouth(true);
          const o = flyTool('med', tgt, 1.1, 520, (o, inner) => {
            inner.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-30deg)' }, { transform: 'rotate(0deg)' }], { duration: 500 });
            A.gulp();
            say('ごっくん');
            ctx.after(500, () => {
              p.an.mouth(false); setMood(p, 'joy');
              jiggle(p, .8);
              ctx.bubble('おいしい！', p.x, p.y - 128);
              const [hx, hy] = W(p, 0, -20);
              hearts(hx, hy, 3);
              [0, 2, 4].forEach((n, j) => A.bell(mtof(PENTA[n + 5]), { when: j * .08, vol: .1 }));
              if (p.boo === 'sneeze') { p.nose.animate([{ opacity: p.nose.getAttribute('opacity') || 1 }, { opacity: .1 }], { duration: 500, fill: 'forwards' }); p.noseShine.style.display = 'none'; }
              ctx.after(900, () => { if (phase === 'treat') setMood(p, done >= 2 ? 'ok' : 'sad'); });
              sendBack('med', o, tgt);
              ctx.after(300, fin);
            });
          });
        }
      };
      function treat(id) {
        const p = P;
        busy = true; queued = null;
        used[id] = true;
        if (glowAnim) { glowAnim.cancel(); glowAnim = null; }
        lookAtX(buttons[id].x);
        ghost.set('happy');
        ACT[id](p, () => {
          if (p !== P) return;
          done++;
          setMeter(done, true);
          A.sfx('sparkle', { vol: .3, rate: 1 + done * .08 }) || A.twinkle();
          buttons[id].badge.style.display = '';
          buttons[id].badge.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300 });
          feelBetter(p);
          ghost.set('normal');
          if (done >= need) { busy = true; ctx.after(500, allBetter); return; }
          if (done === 2) ghost.talk(pick(['もうすこしだよ', 'えらいね', 'いいこ いいこ']));
          busy = false;
          if (queued) { const q = queued; queued = null; ctx.after(80, () => { if (!busy && phase === 'treat') treat(q); }); }
          else glowHint();
        });
      }

      /* ================= all better! ================= */
      function allBetter() {
        phase = 'happy';
        const p = P;
        p.bumpPulse.cancel();
        if (p.boo === 'bump') { p.bumpO.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }); const [x, y] = W(p, 30, -38); ctx.sparkle(x, y, 5, 40); }
        if (p.boo === 'sneeze') { p.nose.style.display = 'none'; p.noseShine.style.display = 'none'; }
        if (p.boo === 'tummy') p.tummyFx.style.display = 'none';
        setMood(p, 'joy');
        setArms(p, 'up', 360);
        A.twinkle();
        ctx.bubble('げんきに なった！', p.x, p.y - 130);
        say('げんきに なった！');
        // jump for joy
        for (let i = 0; i < 2; i++) ctx.after(i * 520, () => {
          A.sfx('spring', { vol: .5, rate: rand(1, 1.15) }) || A.boing();
          p.hop.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(0px) scale(1.12,.88)', offset: .15 }, { transform: 'translateY(-60px) scale(.9,1.12)', offset: .5 }, { transform: 'translateY(0px) scale(1.12,.88)', offset: .85 }, { transform: 'translateY(0px) scale(1)' }], { duration: 500, easing: 'ease-in-out' });
        });
        ctx.after(300, () => cry(p.kind));
        if (rare) ctx.after(400, () => {
          const g = el('g', { transform: 'translate(-26 70) scale(1.1)' }, p.bandL);
          const inn = el('g', { class: 'tb' }, g);
          el('path', { d: 'M-8,-26 L-4,-12 L4,-12 L8,-26Z', fill: '#7fc8ff' }, inn);
          el('circle', { r: 13, fill: '#ffd23f' }, inn);
          star(inn, 0, 0, 8, '#fff6c8');
          inn.animate([{ transform: 'scale(0) rotate(-90deg)' }, { transform: 'scale(1.3) rotate(10deg)' }, { transform: 'scale(1) rotate(0deg)' }], { duration: 520, easing: 'ease-out' });
          A.sfx('coin', { vol: .5 });
          const [x, y] = W(p, -26, 70); ctx.sparkle(x, y, 6, 50, '#ffd23f');
        });
        // hug ぽわん
        ctx.after(1150, () => {
          ghost.set('happy');
          ghost.moveTo(p.x + 96, p.y + 16, .62, 420, () => {
            setArms(p, 'hug', 260);
            ghost.hop(); jiggle(p, .6);
            A.sfx('kiss', { vol: .6 }) || A.pop();
            ctx.bubble('ぎゅー', p.x + 20, p.y - 130); say('ぎゅー');
            hearts(p.x + 30, p.y - 40, 7);
          }, easeOut);
        });
        // the big payoff, waving bye-bye
        ctx.after(2100, () => {
          haptic(30);
          A.tada();
          ctx.confetti(200, 330, 40);
          ctx.after(600, () => { ctx.confetti(110, 300, 24); ctx.confetti(290, 300, 24); });
          setArms(p, 'wave', 300);
          ghost.moveTo(300, 250, .6, 420, () => { ghost.giggle(); ghost.hop(); }, easeBack);
          const R = p.arms[1];
          ctx.after(320, () => ctx.tween(1200, k => { R.ang = -150 + Math.sin(k * Math.PI * 6) * 22; R.a.setAttribute('transform', `rotate(${R.ang.toFixed(1)} 46 70)`); }));
          ctx.after(600, () => { ctx.bubble('ばいばーい', p.x, p.y - 130); say('ばいばーい'); });
        });
        ctx.after(3500, () => {
          A.sfx('whoosh2', { vol: .5 }) || A.whoosh();
          const x0 = p.x;
          ctx.tween(900, k => placeP(p, x0 + 380 * k, PY - Math.abs(Math.sin(k * Math.PI * 3)) * 40), () => p.outer.remove(), easeIn);
          ghost.moveTo(340, 232, .5, 800, () => ghost.set('normal'), easeInOut);
        });
        ctx.after(4300, newPatient);
      }

      /* ================= a new patient ================= */
      function newPatient() {
        phase = 'enter'; busy = true; done = 0; used = {}; queued = null;
        rare = round > 1 && Math.random() < 1 / 6;
        const kind = ORDER[round % ORDER.length];
        const boo = BOOS[(round + Math.floor(round / ORDER.length)) % BOOS.length];
        round++;
        setMeter(0);
        Object.values(buttons).forEach(b => { b.badge.style.display = 'none'; });
        rainbow.animate([{ opacity: rainbow.getAttribute('opacity') }, { opacity: rare ? .85 : 0 }], { duration: 800, fill: 'forwards' });
        rainbow.setAttribute('opacity', rare ? .85 : 0);
        benchStripe.setAttribute('fill', ['#ffc4d6', '#bfe6ff', '#ffe08a', '#c9f0dc'][round % 4]);
        P = makePatient(kind, boo);
        setMood(P, 'sad');
        const p = P;
        [0, 1, 2].forEach(i => ctx.after(160 + i * 360, () => A.sfx(i % 2 ? 'grass2' : 'grass', { vol: .5, rate: 1.3 }) || A.sfx('pop2', { vol: .3, rate: .8 })));
        ctx.tween(1100, k => placeP(p, -200 + 400 * k, PY - Math.abs(Math.sin(k * Math.PI * 3)) * 22 * (1 - k)), () => {
          jiggle(p, .6);
          A.sfx('drop', { vol: .4 });
          sniffle();
          ctx.after(300, () => {
            ghost.set('surprise');
            ghost.talk({ bump: 'こぶが できたね', sneeze: 'くしゃみ でるね', tummy: 'おなか いたいね' }[boo]);
            if (boo === 'sneeze') ctx.after(900, () => sneeze(p));
            else if (boo === 'bump') p.bump.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 500, iterations: 2, composite: 'add' });
            else p.tummyFx.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 300, iterations: 4, direction: 'alternate' });
          });
          ctx.after(2000, () => {
            ghost.set('happy'); ghost.talk('なおして あげよう！');
            ctx.after(1200, () => ghost.set('normal'));
            phase = 'treat'; busy = false;
            if (queued) { const q = queued; queued = null; treat(q); } else glowHint();
          });
        }, easeOut);
      }

      /* ================= input & ambient ================= */
      function lookAtX(x) {
        if (!P) return;
        P.tiltT = clamp((x - P.x) / 30, -6, 6);
      }
      ctx.on(ctx.host, 'pointerdown', e => {
        const pt = ctx.point(e);
        if (pt.x < 80 && pt.y < 80) return;
        lookAtX(pt.x);
        if (e._docDone) return;
        haptic(5);
        if (pt.x > WX && pt.x < WX + WW && pt.y > WY && pt.y < WY + WH) {
          clouds.forEach(c => { c.boost = 1; });
          sunHalo.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 500, composite: 'add' });
          A.sfx('blink', { vol: .4, rate: rand(.8, 1.2) }) || A.twinkle();
        } else {
          ctx.sparkle(pt.x, pt.y, 3, 20, pick(['#ffffff', '#ffd6e2', '#bff0dc']));
          A.sfx('blip', { vol: .35, rate: rand(.8, 1.3) }) || A.pluck(mtof(pick(PENTA) + 12), { vol: .09 });
          if (P && phase === 'treat' && P.mood !== 'joy' && Math.random() < .5) { P.an.sleep(true); ctx.after(160, () => { if (P && P.mood !== 'joy') P.an.sleep(false); }); }
        }
      });
      ghost.pos.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        ghost.giggle();
        if (phase === 'treat') ghost.talk(pick(['だいじょうぶ', 'いたいの とんでけ', 'えらいね']), false);
        ctx.after(900, () => { if (phase !== 'happy') ghost.set('normal'); });
      });
      ctx.loop((dt, t) => {
        clouds.forEach(c => {
          c.boost = Math.max(0, c.boost - dt * .6);
          c.x += c.sp * (1 + c.boost * 6) * dt; if (c.x > WX + WW + 10) c.x = WX - 70;
          c.o.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y}) scale(${c.s})`);
        });
        fishS.boost = Math.max(0, fishS.boost - dt);
        fishS.x += fishS.dir * fishS.speed * (1 + fishS.boost * 5) * dt;
        if (fishS.x > 14) { fishS.x = 14; fishS.dir = -1; } else if (fishS.x < -14) { fishS.x = -14; fishS.dir = 1; }
        fish.setAttribute('transform', `translate(${fishS.x.toFixed(1)} ${(8 + Math.sin(t * 2) * 3).toFixed(1)}) scale(${fishS.dir > 0 ? -1 : 1} 1)`);
        if (P) {
          P.tiltT *= Math.pow(.4, dt);
          P.tiltA += (P.tiltT - P.tiltA) * Math.min(1, dt * 8);
          P.tilt.setAttribute('transform', `rotate(${(P.tiltA + Math.sin(t * 1.3) * 1.2).toFixed(2)} 0 40)`);
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i];
          q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt;
          if (q.life <= 0) { q.node.remove(); parts.splice(i, 1); continue; }
          q.node.setAttribute('cx', q.x.toFixed(1)); q.node.setAttribute('cy', q.y.toFixed(1));
          q.node.setAttribute('opacity', clamp(q.life / q.max * 2, 0, 1).toFixed(2));
        }
      });
      // blinks, sniffles and a sneeze now and then
      let nextBlink = 1.5, nextSym = 4;
      ctx.every(500, () => {
        if (!P) return;
        nextBlink -= .5; nextSym -= .5;
        if (nextBlink <= 0) { nextBlink = rand(2, 5); blinkP(P); }
        if (nextSym <= 0 && phase === 'treat' && !busy) {
          nextSym = rand(5, 8);
          if (P.boo === 'sneeze') { if (Math.random() < .5) sneeze(P); else sniffle(); }
          else if (P.boo === 'tummy') { A.sfx('blub', { vol: .3, rate: .6 }) || A.osc(160, { slide: 110, slideT: .2, r: .1, vol: .08 }); P.tummyFx.animate([{ transform: 'translate(0px,104px) scale(1)' }, { transform: 'translate(0px,104px) scale(1.3)' }, { transform: 'translate(0px,104px) scale(1)' }], { duration: 500 }); }
          else if (P.boo === 'bump') { sniffle(); P.an.body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0deg)' }], { duration: 500 }); }
        }
      });

      newPatient();
      ctx.after(300, () => { ghost.set('happy'); ghost.talk('おいしゃさん ごっこ！'); ctx.after(1400, () => { if (phase === 'enter') ghost.set('normal'); }); });
      ctx.hint = () => {
        if (phase !== 'treat' || busy) return null;
        const id = nextHint();
        return id ? [buttons[id].x, buttons[id].y] : null;
      };
    }
  };
  TOYS.push(doctorToy);
})();
