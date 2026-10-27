'use strict';
/* =========================================================
   toy: うみ — three sea areas rotate per round: a coral reef, the deep sea
   (glowing anglerfish and jellies) and a beach shore (crab, shells, waves).
   Find every friend in the area for a party, then the bubbles carry you on.
   ========================================================= */
(() => {
  const SURF = 70;
  const SONG = [[72, 1], [76, 1], [79, 2], [76, 1], [74, 1], [72, 1], [74, 1], [79, 2]];
  const INK = '#2b2340';

  /* ---------- drawings (local units; each creature is scaled by its body group) ---------- */
  function fishShape(g, c, glow) {
    el('path', { d: 'M-11,0 L-24,-9 Q-21,0 -24,9Z', fill: c }, g);
    el('ellipse', { rx: 15, ry: 10, fill: c }, g);
    el('path', { d: 'M-2,-9.6 Q2,0 -2,9.6', stroke: glow ? '#9ff7ff' : '#fff', 'stroke-width': 4, fill: 'none', opacity: .9 }, g);
    el('ellipse', { cx: -4, cy: -5, rx: 6, ry: 2.5, fill: '#fff', opacity: .35 }, g);
    el('circle', { cx: 7, cy: -2, r: 2.8, fill: INK }, g);
    el('circle', { cx: 6.2, cy: -3, r: 1, fill: '#fff' }, g);
    if (glow) el('circle', { cx: 10, cy: 5, r: 2.4, fill: '#bfffff' }, g);
  }
  function thumbWhale(g) {
    el('path', { d: 'M-86,6 C-86,-40 -40,-52 10,-50 C50,-48 74,-30 80,-10 Q98,-24 114,-46 Q124,-30 112,-14 Q128,-10 136,2 Q112,8 92,0 Q80,28 50,40 C10,54 -86,50 -86,6Z', fill: '#7fb0ff' }, g);
    el('path', { d: 'M-82,18 C-60,46 10,50 50,36 C10,40 -50,40 -82,18Z', fill: '#e3f2ff' }, g);
    el('ellipse', { cx: -52, cy: -10, rx: 6.5, ry: 8, fill: INK }, g);
    el('circle', { cx: -54.5, cy: -13, r: 2.6, fill: '#fff' }, g);
  }

  const seaToy = {
    id: 'sea', name: 'うみ', color: '#1f5fa8',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#2d78c4' }, g);
      el('rect', { x: -80, y: 46, width: 160, height: 40, fill: '#f2d49b' }, g);
      const w = el('g', { transform: 'translate(4 -10) scale(.6)' }, g); thumbWhale(w);
      const f = el('g', { transform: 'translate(-44 40) scale(.9)' }, g); fishShape(f, '#ffa94d');
      [[40, -56, 6], [52, -40, 4], [30, -68, 3]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: 'none', stroke: '#fff', 'stroke-width': 2 }, g));
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      /* ---------- defs ---------- */
      const lin = (id, stops, y1 = 0, y2 = 1, units) => {
        const g = el('linearGradient', { id, x1: 0, y1, x2: 0, y2, ...(units ? { gradientUnits: 'userSpaceOnUse' } : {}) }, defs);
        stops.forEach(([o, c, a = 1]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g));
      };
      const radial = (id, stops) => {
        const g = el('radialGradient', { id, cx: .5, cy: .5, r: .5 }, defs);
        stops.forEach(([o, c, a]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g));
      };
      lin('sea-reef', [[0, '#6fd8f4'], [.45, '#2f9ad8'], [1, '#1b5fa6']], SURF, 760, true);
      lin('sea-deep', [[0, '#1d3c7c'], [.5, '#0f1e50'], [1, '#070c2a']], -60, 800, true);
      lin('sea-band', [[0, '#3fb0d8'], [1, '#7fe4ec']], 196, 470, true);
      lin('sea-sky', [[0, '#a8e2ff'], [1, '#effaff']], -60, 200, true);
      lin('sea-ray', [[0, '#fff', .55], [1, '#fff', 0]]);
      lin('sea-wash', [[0, '#86e2ec', 0], [.55, '#86e2ec', .75], [1, '#9eeaf0', .8]]);
      lin('sea-rayB', [[0, '#9fc4ff', .3], [1, '#9fc4ff', 0]]);
      radial('sea-glow', [[0, '#fff6a0', 1], [.4, '#fff6a0', .45], [1, '#fff6a0', 0]]);
      radial('sea-glowB', [[0, '#c8f4ff', .95], [.4, '#9fe8ff', .35], [1, '#9fe8ff', 0]]);
      radial('sea-glowP', [[0, '#ffd6f4', .9], [.4, '#e8a8ff', .35], [1, '#e8a8ff', 0]]);
      radial('sea-sun', [[0, '#fff6c8', .9], [1, '#fff6c8', 0]]);

      const world = el('g', {}, svg);
      const ghostL = el('g', {}, svg);
      const fxL = el('g', { 'pointer-events': 'none' }, svg);
      const ui = el('g', { 'pointer-events': 'none' }, svg);
      const cover = el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: '#2f9ad8', opacity: 0, 'pointer-events': 'none' }, svg);
      const bubL = el('g', { 'pointer-events': 'none' }, svg);

      /* ---------- ぽわん with three outfits: diving helmet, swim ring, mermaid tail ---------- */
      const ghost = ctx.ghost(ghostL, { x: 200, y: 600, s: .6 });
      const gear = {};
      {
        const b = ghost.body;
        gear.tail = el('g', { style: 'display:none' }, b); b.insertBefore(gear.tail, b.firstChild);
        el('path', { d: 'M-42,36 Q-36,104 0,118 Q36,104 42,36Z', fill: '#5fd6c4' }, gear.tail);
        [[-18, 66], [12, 62], [-4, 88], [22, 84], [-24, 44], [6, 40]].forEach(([x, y]) => el('path', { d: `M${x - 8},${y} q8,8 16,0`, stroke: '#3fb8a8', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, gear.tail));
        gear.fin = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, gear.tail);
        el('path', { d: 'M0,108 Q-30,112 -52,146 Q-20,138 0,122 Q20,138 52,146 Q30,112 0,108Z', fill: '#ff9fcf' }, gear.fin);
        gear.tiara = el('g', { style: 'display:none' }, b);
        el('path', { d: 'M-16,-68 Q-18,-92 0,-96 Q18,-92 16,-68Z', fill: '#ffb3d1' }, gear.tiara);
        [-8, 0, 8].forEach(x => el('path', { d: `M0,-70 L${x},-92`, stroke: '#fff', 'stroke-width': 2, opacity: .8 }, gear.tiara));
        el('circle', { cx: 0, cy: -68, r: 4, fill: '#fff6f0' }, gear.tiara);
        gear.ringBack = el('path', { d: 'M-70,34 A70,22 0 0 1 70,34 L50,34 A50,11 0 0 0 -50,34Z', fill: '#e86a88', style: 'display:none' }, b);
        b.insertBefore(gear.ringBack, b.firstChild);
        gear.ring = el('g', { style: 'display:none' }, b);
        el('path', { d: 'M-70,34 A70,24 0 0 0 70,34 L50,34 A50,12 0 0 1 -50,34Z', fill: '#ff8fa3' }, gear.ring);
        [-44, 0, 44].forEach(x => el('path', { d: `M${x - 7},${x ? 50 : 56} L${x + 7},${x ? 50 : 56} L${x + 6},${x ? 40 : 46} L${x - 6},${x ? 40 : 46}Z`, fill: '#fff' }, gear.ring));
        el('path', { d: 'M-60,40 Q-40,52 -16,54', stroke: '#fff', 'stroke-width': 4, fill: 'none', opacity: .5, 'stroke-linecap': 'round' }, gear.ring);
        gear.helmet = el('g', {}, b);
        el('path', { d: 'M-54,-20 Q0,-30 54,-20', stroke: INK, 'stroke-width': 5, fill: 'none', opacity: .55 }, gear.helmet);
        el('rect', { x: -40, y: -38, width: 80, height: 38, rx: 17, fill: '#bff0ff', 'fill-opacity': .35, stroke: '#ff9a6b', 'stroke-width': 6 }, gear.helmet);
        el('path', { d: 'M-30,-30 l10,-2', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .8 }, gear.helmet);
        el('path', { d: 'M46,-6 L62,-6 Q70,-6 70,-16 L70,-60', stroke: '#7fdcc0', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, gear.helmet);
        el('circle', { cx: 0, cy: -6, r: 90, fill: '#e8f8ff', 'fill-opacity': .16, stroke: '#ffffff', 'stroke-width': 3, 'stroke-opacity': .75 }, gear.helmet);
        el('path', { d: 'M-62,-52 Q-48,-76 -18,-86', stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: .8 }, gear.helmet);
      }
      function outfit(kind) {
        gear.helmet.style.display = kind === 'dive' ? '' : 'none';
        gear.ring.style.display = gear.ringBack.style.display = kind === 'ring' ? '' : 'none';
        gear.tail.style.display = gear.tiara.style.display = kind === 'mermaid' ? '' : 'none';
      }

      /* ---------- area state ---------- */
      const AREAS = ['reef', 'deep', 'shore'];
      let S = null, areaIdx = 0, found = new Set(), party = false, dancing = false, lastP = { x: 200, y: 400 }, round = 0;
      let pearls = [];

      /* a creature: outer(translate) > inner(tb, squash) > body(scale) */
      function creature(o) {
        const c = Object.assign({ ox: 0, oy: 0, dy: 0, busy: false, eyes: [], s: 1 }, o);
        c.outer = el('g', {}, S.cl);
        c.inner = el('g', { class: 'tb' }, c.outer);
        c.body = el('g', { transform: `scale(${c.s})` }, c.inner);
        c.at = () => [c.x + c.ox, c.y + c.oy + c.dy];
        c.place = () => { const [x, y] = c.at(); c.outer.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); };
        c.hint = c.hint || (() => c.at());
        c.squash = (big = 1) => c.inner.animate([{ transform: 'scale(1)' }, { transform: `scale(${1 + .15 * big},${1 - .15 * big})`, offset: .25 }, { transform: `scale(${1 - .1 * big},${1 + .1 * big})`, offset: .6 }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
        c.outer.addEventListener('pointerdown', e => { e.stopPropagation(); lastP = ctx.point(e); lookAll(); tapCreature(c, lastP); });
        c.hit = node => node;
        c.dance = c.dance || (i => c.inner.animate([{ transform: 'rotate(0deg) translateY(0px)' }, { transform: 'rotate(-10deg) translateY(-8px)' }, { transform: 'rotate(10deg) translateY(-8px)' }, { transform: 'rotate(0deg) translateY(0px)' }], { duration: 700, delay: i * 40, easing: 'ease-in-out' }));
        S.C.push(c);
        return c;
      }
      function eye(c, g, x, y, r = 6) {
        const lk = el('g', {}, g), bl = el('g', { class: 'tb' }, lk);
        el('ellipse', { cx: x, cy: y, rx: r, ry: r * 1.2, fill: INK }, bl);
        el('circle', { cx: x - r * .35, cy: y - r * .5, r: r * .42, fill: '#fff' }, bl);
        c.eyes.push({ lk, bl });
      }
      function lookAll() {
        S.C.forEach(c => {
          const [x, y] = c.at();
          const dx = clamp((lastP.x - x) / 40, -3, 3), dy = clamp((lastP.y - y) / 50, -2.5, 2.5);
          c.eyes.forEach(e => e.lk.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`));
        });
      }
      const cheek = (g, x, y, rx = 7, ry = 4.5) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#ffa3b8', opacity: .8 }, g);
      const smile = (g, x, y, w = 5, c = '#6a3a5a') => el('path', { d: `M${x - w},${y} Q${x},${y + w} ${x + w},${y}`, stroke: c, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, g);

      /* ---------- bubbles + passers ---------- */
      function bubbles(x, y, n, notes) {
        for (let i = 0; i < n; i++) ctx.after(i * 70, () => {
          const g = el('g', {}, fxL);
          const r = rand(5, 11);
          el('circle', { r, fill: '#fff', 'fill-opacity': .18, stroke: '#fff', 'stroke-width': 2, 'stroke-opacity': .85 }, g);
          el('circle', { cx: -r * .35, cy: -r * .35, r: r * .25, fill: '#fff' }, g);
          const x0 = x + rand(-12, 12), h = rand(150, 240), ph = rand(0, 6);
          ctx.tween(1500, k => {
            g.setAttribute('transform', `translate(${(x0 + Math.sin(k * 9 + ph) * 8).toFixed(1)} ${(y - h * k).toFixed(1)}) scale(${(.6 + k * .5).toFixed(2)})`);
            g.setAttribute('opacity', (k < .75 ? 1 : (1 - k) * 4).toFixed(2));
          }, () => g.remove(), k => k);
          if (notes != null) A.osc(mtof(PENTA[(i * 2 + notes) % PENTA.length] + 12), { slide: mtof(PENTA[(i * 2 + notes) % PENTA.length] + 19), slideT: .05, r: .12, vol: .06, wet: .4 });
        });
      }
      let passers = 0;
      function passer(y) {
        if (passers > 2 || !S.passColor) return;
        passers++;
        const dir = Math.random() < .5 ? 1 : -1, g = el('g', {}, S.near), f = el('g', { transform: `scale(${dir * 1.3} 1.3)` }, g);
        fishShape(f, pick(S.passColor), S.id === 'deep');
        const x0 = dir > 0 ? -40 : 440;
        ctx.tween(2600, k => g.setAttribute('transform', `translate(${(x0 + dir * 480 * k).toFixed(1)} ${(y + Math.sin(k * 12) * 8).toFixed(1)})`), () => { g.remove(); passers--; }, k => k);
      }

      /* ---------- a school of fish that follows a path and flees the finger ---------- */
      function school(o) {
        const c = creature({ id: 'fish', n: 'おさかな', color: o.colors[0], x: o.cx, y: o.cy, s: 1 });
        c.fishes = []; c.fleeT = 0; c.fx = 0; c.fy = 0; c.cx = o.cx; c.cy = o.cy;
        for (let i = 0; i < o.n; i++) {
          const g = el('g', {}, S.cl), s = el('g', {}, g);
          fishShape(s, o.colors[i % o.colors.length], o.glow);
          const a = i / o.n * Math.PI * 2, r = i === 0 ? 0 : 40 + (i % 2) * 18;
          c.fishes.push({ g, ox: Math.cos(a) * r * 1.3, oy: Math.sin(a) * r * .7, x: o.cx + Math.cos(a) * r, y: o.cy + Math.sin(a) * r, vx: 30, vy: 0, sz: rand(1.3, 1.6) });
        }
        c.hint = () => [c.cx, c.cy];
        c.at = () => [c.cx, c.cy];
        c.place = () => {};
        c.near = p => c.fishes.some(f => Math.hypot(f.x - p.x, f.y - p.y) < 70);
        c.react = p => {
          c.fleeT = 1.1; c.fx = p.x; c.fy = p.y;
          A.sfx('bubbles', { vol: .45, rate: rand(.95, 1.2) }) || A.noise({ from: 600, to: 2400, dur: .3, vol: .12 });
          [0, 1, 2].forEach(i => A.osc(mtof(PENTA[6 + i * 2]), { when: i * .07, type: 'triangle', r: .1, vol: .08 }));
          bubbles(p.x, p.y, 3);
        };
        c.dance = () => { c.fleeT = 0; };
        c.tick = (dt, t) => {
          const cp = o.path(t, party);
          c.cx = cp[0]; c.cy = cp[1];
          c.fleeT = Math.max(0, c.fleeT - dt);
          c.fishes.forEach((f, i) => {
            let ax = (c.cx + f.ox - f.x) * 2.2 - f.vx * 1.1, ay = (c.cy + f.oy - f.y) * 2.2 - f.vy * 1.1;
            c.fishes.forEach((q, j) => {
              if (i === j) return;
              const dx = f.x - q.x, dy = f.y - q.y, d2 = dx * dx + dy * dy;
              if (d2 < 1200 && d2 > .01) { ax += dx / d2 * 4200; ay += dy / d2 * 4200; }
            });
            if (c.fleeT > 0) {
              const dx = f.x - c.fx, dy = f.y - c.fy, d = Math.hypot(dx, dy) + 10;
              const s = 2400 * c.fleeT / Math.max(.3, d / 90);
              ax = dx / d * s; ay = dy / d * s;
            }
            f.vx += ax * dt; f.vy += ay * dt;
            const sp = Math.hypot(f.vx, f.vy), mx = c.fleeT > 0 ? 340 : 120;
            if (sp > mx) { f.vx *= mx / sp; f.vy *= mx / sp; }
            f.x = clamp(f.x + f.vx * dt, 20, 380); f.y = clamp(f.y + f.vy * dt, o.top, o.bottom);
            const dir = f.vx < -4 ? -1 : f.vx > 4 ? 1 : (f.dir || 1); f.dir = dir;
            const tilt = clamp(Math.atan2(f.vy, Math.abs(f.vx) + 20) * 57, -30, 30) * dir;
            f.g.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) scale(${(dir * f.sz).toFixed(2)} ${f.sz.toFixed(2)}) rotate(${(tilt * dir).toFixed(0)})`);
          });
        };
        return c;
      }

      /* ---------- creatures ---------- */
      function whale(x, y, s) {
        const c = creature({ id: 'whale', n: 'くじらさん', color: '#7fb0ff', x, y, s });
        const g = c.body;
        c.spout = el('g', {}, g);
        el('path', { d: 'M-86,6 C-86,-40 -40,-52 10,-50 C50,-48 74,-30 80,-10 Q98,-24 114,-46 Q124,-30 112,-14 Q128,-10 136,2 Q112,8 92,0 Q80,28 50,40 C10,54 -86,50 -86,6Z', fill: '#7fb0ff' }, g);
        el('path', { d: 'M-82,18 C-60,46 10,50 50,36 C10,40 -50,40 -82,18Z', fill: '#e3f2ff' }, g);
        el('path', { d: 'M-50,34 L-48,40 M-30,38 L-29,44 M-10,40 L-10,46', stroke: '#b9d6ff', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
        const fin = el('g', { class: 'tb', style: 'transform-origin:20% 10%' }, g);
        el('ellipse', { cx: -12, cy: 28, rx: 20, ry: 9, fill: '#5d92e0', transform: 'rotate(28 -12 28)' }, fin);
        fin.animate([{ transform: 'rotate(-10deg)' }, { transform: 'rotate(12deg)' }], { duration: 1600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        el('ellipse', { cx: -30, cy: -34, rx: 26, ry: 9, fill: '#fff', opacity: .38, transform: 'rotate(-12 -30 -34)' }, g);
        eye(c, g, -52, -10, 6.8);
        cheek(g, -44, 7, 9, 6);
        c.mc = el('path', { d: 'M-84,10 Q-74,18 -62,12', stroke: '#3a5a9a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
        c.mo = el('ellipse', { cx: -74, cy: 14, rx: 9, ry: 7, fill: '#c2405a', style: 'display:none' }, g);
        c.hit(el('ellipse', { cx: 20, cy: 0, rx: 120, ry: 62, fill: 'transparent' }, g));
        c.mouth = on => { c.mo.style.display = on ? '' : 'none'; c.mc.style.display = on ? 'none' : ''; };
        c.blow = () => {
          const sp = el('g', { transform: 'translate(-27 -44)' }, c.spout);
          const col = el('path', { d: 'M-7,0 Q-9,-26 -26,-42 Q-6,-38 0,-52 Q6,-38 26,-42 Q9,-26 7,0Z', fill: '#e8f8ff', class: 'tb', style: 'transform-origin:50% 100%' }, sp);
          col.animate([{ transform: 'scaleY(0)', opacity: 1 }, { transform: 'scaleY(1.25)', opacity: 1, offset: .3 }, { transform: 'scaleY(1)', opacity: .9, offset: .7 }, { transform: 'scaleY(.2)', opacity: 0 }], { duration: 1300 }).onfinish = () => sp.remove();
          for (let i = 0; i < 7; i++) {
            const d = el('circle', { r: rand(3, 5.5), fill: '#e8f8ff' }, c.spout);
            const vx = (i - 3) * 22, vy = rand(-160, -110);
            ctx.tween(1100, k => {
              const t = k * 1.1;
              d.setAttribute('transform', `translate(${(-27 + vx * t).toFixed(1)} ${(-96 + vy * t + 170 * t * t).toFixed(1)})`);
              d.setAttribute('opacity', (1 - k).toFixed(2));
            }, () => d.remove(), k => k);
          }
          A.sfx('splash', { vol: .55, rate: rand(.95, 1.15) }) || A.noise({ type: 'highpass', from: 1800, to: 3200, dur: .8, vol: .16 });
        };
        c.react = () => {
          c.squash();
          if (c.busy) { c.blow(); c.mouth(true); ctx.after(400, () => c.mouth(false)); return; }
          c.busy = true;
          A.osc(170, { a: .1, hold: .4, slide: 300, slideT: .5, vib: 5, vibD: .02, r: .5, vol: .14, wet: .5 });
          c.mouth(true);
          ctx.tween(650, k => { c.dy = -70 * k; }, () => {
            c.blow(); c.mouth(false);
            ctx.after(750, () => c.blow());
            ctx.after(1900, () => ctx.tween(1300, k => { c.dy = -70 * (1 - k); }, () => { c.busy = false; }));
          }, easeOut);
        };
        c.dance = i => { c.mouth(true); ctx.after(300, () => c.mouth(false)); c.inner.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0deg)' }], { duration: 760 }); };
        c.tick = t => { c.ox = Math.sin(t * .25) * 28; c.oy = Math.sin(t * .8) * 6; };
        return c;
      }
      function puffer(x, y, s) {
        const c = creature({ id: 'puff', n: 'ふぐさん', color: '#ffd86b', x, y, s });
        const g = c.body;
        const spikes = el('g', { opacity: 0 }, g);
        for (let i = 0; i < 14; i++) el('path', { d: 'M-4,-32 L0,-43 L4,-32Z', fill: '#e8b23a', transform: `rotate(${(i / 14 * 360).toFixed(0)})` }, spikes);
        const tail = el('g', { class: 'tb', style: 'transform-origin:0% 50%' }, g);
        el('path', { d: 'M28,0 L48,-14 Q44,0 48,14Z', fill: '#ffc04a' }, tail);
        tail.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.7)' }], { duration: 500, iterations: Infinity, direction: 'alternate' });
        el('circle', { r: 34, fill: '#ffd86b' }, g);
        el('ellipse', { cx: -2, cy: 16, rx: 26, ry: 14, fill: '#fff4d0' }, g);
        [[8, -22], [20, -10], [-2, -28], [24, 6]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.6, fill: '#e0a040' }, g));
        el('ellipse', { cx: -14, cy: -22, rx: 10, ry: 4.5, fill: '#fff', opacity: .55, transform: 'rotate(-25 -14 -22)' }, g);
        el('ellipse', { cx: 10, cy: 6, rx: 9, ry: 5, fill: '#ffc04a', transform: 'rotate(20 10 6)' }, g);
        eye(c, g, -16, -8, 5.6); eye(c, g, 2, -10, 5.6);
        cheek(g, -22, 4, 6, 4);
        el('circle', { cx: -29, cy: 6, r: 4, fill: '#e0607e' }, g);
        c.hit(el('circle', { r: 50, fill: 'transparent' }, g));
        c.react = () => {
          A.sfx(Math.random() < .5 ? 'boing' : 'boing2', { vol: .7, rate: rand(.95, 1.15) }) || A.boing();
          if (c.busy) { c.inner.animate([{ transform: 'scale(1.75) rotate(0deg)' }, { transform: 'scale(1.9,1.6) rotate(-10deg)' }, { transform: 'scale(1.75) rotate(0deg)' }], { duration: 360 }); return; }
          c.busy = true;
          c.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.95,1.6)', offset: .1 }, { transform: 'scale(1.7,1.85)', offset: .2 }, { transform: 'scale(1.8)', offset: .3 },
            { transform: 'scale(1.75)', offset: .72 }, { transform: 'scale(.85,1.1) rotate(-20deg)', offset: .88 }, { transform: 'scale(1) rotate(0deg)' }], { duration: 2300, easing: 'ease-in-out' });
          spikes.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .72 }, { opacity: 0, offset: .82 }], { duration: 2300 });
          ctx.after(160, () => ctx.sparkle(c.at()[0], c.at()[1], 4, 60));
          ctx.after(1650, () => { A.noise({ from: 3000, to: 400, dur: .5, vol: .12 }); A.osc(600, { slide: 180, slideT: .4, r: .2, vol: .1 }); bubbles(c.at()[0] - 40, c.at()[1], 4); });
          ctx.after(2300, () => { c.busy = false; });
        };
        c.tick = t => { c.ox = Math.sin(t * .5) * 14; c.oy = Math.sin(t * 1.1) * 7; };
        return c;
      }
      function octopus(x, y, s) {
        const c = creature({ id: 'octo', n: 'たこさん', color: '#ff8fb1', x, y, s });
        const g = c.body;
        const tent = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, g);
        for (let i = 0; i < 6; i++) {
          const x0 = -30 + i * 12, d = i < 3 ? -1 : 1;
          el('path', { d: `M${x0},8 Q${x0 + d * 6},34 ${x0 + d * 16},42 Q${x0 + d * 26},46 ${x0 + d * 24},34`, stroke: '#ff8fb1', 'stroke-width': 12, fill: 'none', 'stroke-linecap': 'round' }, tent);
        }
        tent.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.1,.9)' }], { duration: 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        el('ellipse', { cx: 0, cy: -14, rx: 42, ry: 40, fill: '#ff9cbc' }, g);
        el('ellipse', { cx: -16, cy: -38, rx: 14, ry: 6.5, fill: '#fff', opacity: .5, transform: 'rotate(-25 -16 -38)' }, g);
        eye(c, g, -15, -14, 6.5); eye(c, g, 15, -14, 6.5);
        cheek(g, -28, 0, 8, 5); cheek(g, 28, 0, 8, 5);
        const blush = el('g', { opacity: 0 }, g);
        [-1, 1].forEach(d => el('ellipse', { cx: d * 27, cy: 0, rx: 13, ry: 8.5, fill: '#ff5c8a' }, blush));
        el('ellipse', { cx: 0, cy: 6, rx: 6, ry: 5, fill: '#e0607e' }, g);
        el('ellipse', { cx: 0, cy: 6, rx: 3, ry: 2.4, fill: '#a83a5a' }, g);
        c.hit(el('rect', { x: -56, y: -60, width: 112, height: 112, fill: 'transparent' }, g));
        c.react = () => {
          A.sfx('bubble', { vol: .6, rate: rand(.8, 1) }) || A.noise({ type: 'lowpass', from: 1200, to: 250, dur: .35, vol: .2 });
          const [ox, oy] = c.at();
          for (let i = 0; i < 5; i++) {
            const ig = el('g', { transform: `translate(${(ox + rand(-40, 40)).toFixed(0)} ${(oy + rand(16, 60)).toFixed(0)})` }, S.ink);
            const k = el('circle', { r: rand(16, 26).toFixed(0), fill: S.id === 'deep' ? '#2a3a80' : '#4a3a72', class: 'tb' }, ig);
            k.animate([{ transform: 'scale(.3)', opacity: .85 }, { transform: 'scale(1.7)', opacity: 0 }], { duration: 1500, delay: i * 50, easing: 'ease-out', fill: 'backwards' }).onfinish = () => ig.remove();
          }
          c.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(.85,1.15)', offset: .2 }, { transform: 'scale(1.08,.94)', offset: .6 }, { transform: 'scale(1)' }], { duration: 700 });
          ctx.after(450, () => { blush.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration: 1800 }); A.osc(880, { slide: 1200, slideT: .15, vib: 12, vibD: .04, hold: .1, r: .2, vol: .1 }); });
          if (c.busy) return;
          c.busy = true;
          ctx.tween(260, k => { c.dy = -44 * k; }, () => ctx.tween(900, k => { c.dy = -44 * (1 - k); }, () => { c.busy = false; }), easeOut);
        };
        c.tick = t => { c.oy = Math.sin(t * .9 + 1) * 5; };
        return c;
      }
      function jelly(x, y, s, glow, hue) {
        const c = creature({ id: 'jelly' + (hue || ''), n: 'くらげさん', color: hue ? '#ff9fe0' : '#c9a7ff', x, y, s });
        const g = c.body, main = hue ? '#f2a8ff' : '#b9a0ff', lite = hue ? '#ffd6f4' : '#e6dcff';
        if (glow) { c.halo = el('circle', { r: 80, fill: `url(#${hue ? 'sea-glowP' : 'sea-glowB'})`, opacity: .7, 'pointer-events': 'none' }, g); }
        else c.halo = el('circle', { r: 64, fill: '#f3ebff', opacity: 0, 'pointer-events': 'none' }, g);
        const tent = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, g);
        [-22, -8, 8, 22].forEach((x, i) => el('path', { d: `M${x},8 q${i % 2 ? 7 : -7},16 0,30 q${i % 2 ? -7 : 7},16 0,32`, stroke: lite, 'stroke-width': 4.5, fill: 'none', 'stroke-linecap': 'round' }, tent));
        tent.animate([{ transform: 'skewX(-8deg) scaleY(1)' }, { transform: 'skewX(8deg) scaleY(.9)' }], { duration: 1400 + (hue ? 300 : 0), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        el('path', { d: 'M-40,10 C-42,-32 -20,-44 0,-44 C20,-44 42,-32 40,10 Q30,18 20,10 Q10,18 0,10 Q-10,18 -20,10 Q-30,18 -40,10Z', fill: main, opacity: .95 }, g);
        el('ellipse', { cx: -14, cy: -28, rx: 13, ry: 6, fill: '#fff', opacity: .5, transform: 'rotate(-20 -14 -28)' }, g);
        if (glow) [[-22, -6], [0, -34], [22, -6]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 3, fill: '#fff', class: 'twinkle' }, g));
        eye(c, g, -12, -12, 5.5); eye(c, g, 12, -12, 5.5);
        cheek(g, -24, -1, 6.5, 4.5); cheek(g, 24, -1, 6.5, 4.5);
        smile(g, 0, -2, 5, '#6a4a9a');
        c.hit(el('rect', { x: -54, y: -56, width: 108, height: 132, fill: 'transparent' }, g));
        c.react = () => {
          c.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2,.75)', offset: .25 }, { transform: 'scale(.86,1.18)', offset: .6 }, { transform: 'scale(1)' }], { duration: 650 });
          c.halo.animate(glow ? [{ opacity: .7 }, { opacity: 1, transform: 'scale(1.5)' }, { opacity: .7 }] : [{ opacity: 0 }, { opacity: .7 }, { opacity: 0 }], { duration: 1200 });
          [0, 4, 7].forEach((m, i) => A.bell(mtof(72 + m + (c.busy ? 5 : 0) + (hue ? 2 : 0)), { when: i * .06, vol: .09 }));
          A.sfx('sparkle', { vol: .25, rate: rand(1, 1.3) });
          ctx.sparkle(c.at()[0], c.at()[1], 3, 50, glow ? '#c8f4ff' : '#ffd56b');
          if (c.busy) return;
          c.busy = true;
          const from = c.dy;
          ctx.tween(650, k => { c.dy = from + (-90 - from) * k; }, () => ctx.tween(2600, k => { c.dy = -90 * (1 - k); }, () => { c.busy = false; }), easeOut);
        };
        c.tick = t => { c.oy = Math.sin(t * 1.2 + x) * 9; c.ox = Math.sin(t * .3 + x) * 10; };
        return c;
      }
      function angler(x, y, s) {
        const c = creature({ id: 'angler', n: 'あんこうさん', color: '#ffe27a', x, y, s });
        const g = c.body;
        c.light = el('circle', { cx: -40, cy: -92, r: 90, fill: 'url(#sea-glow)', opacity: .55, 'pointer-events': 'none' }, g);
        el('path', { d: 'M70,-6 L112,-40 Q104,-4 112,32Z', fill: '#2f4682' }, g);
        el('path', { d: 'M-6,-56 Q14,-80 34,-56Z', fill: '#2f4682' }, g);
        el('ellipse', { cx: 0, cy: 0, rx: 84, ry: 64, fill: '#3d5a9c' }, g);
        el('ellipse', { cx: 10, cy: 30, rx: 62, ry: 30, fill: '#5a7cc0' }, g);
        el('ellipse', { cx: -24, cy: -38, rx: 30, ry: 11, fill: '#fff', opacity: .25, transform: 'rotate(-14 -24 -38)' }, g);
        const finS = el('g', { class: 'tb', style: 'transform-origin:0% 50%' }, g);
        el('path', { d: 'M20,12 Q44,0 50,22 Q36,30 20,12Z', fill: '#2f4682' }, finS);
        finS.animate([{ transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }], { duration: 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        [[30, -26], [48, -6], [36, 10], [52, -30]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 3, fill: '#8fd0ff', opacity: .7 }, g));
        // big friendly eye
        const lk = el('g', {}, g), bl = el('g', { class: 'tb' }, lk);
        el('circle', { cx: -30, cy: -16, r: 17, fill: '#fff' }, bl);
        el('circle', { cx: -32, cy: -14, r: 10, fill: INK }, bl);
        el('circle', { cx: -36, cy: -19, r: 4, fill: '#fff' }, bl);
        c.eyes.push({ lk, bl });
        cheek(g, -10, 8, 9, 5.5);
        c.mc = el('g', {}, g); c.mo = el('g', { style: 'display:none' }, g);
        el('path', { d: 'M-82,10 Q-58,34 -26,26', stroke: '#1f2f60', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, c.mc);
        [[-74, 18], [-62, 25], [-48, 28], [-36, 28]].forEach(([x, y]) => el('path', { d: `M${x - 3},${y - 2} L${x},${y + 4} L${x + 3},${y - 2}Z`, fill: '#fff' }, c.mc));
        el('path', { d: 'M-84,4 Q-60,62 -20,28 Q-50,16 -84,4Z', fill: '#c2405a' }, c.mo);
        el('ellipse', { cx: -52, cy: 32, rx: 12, ry: 6, fill: '#ff8fa3' }, c.mo);
        // the lure on a swaying stalk
        c.lure = el('g', {}, g);
        el('path', { d: 'M-4,-58 Q-10,-104 -40,-100', stroke: '#2f4682', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, c.lure);
        c.bulbHalo = el('circle', { cx: -42, cy: -96, r: 26, fill: 'url(#sea-glow)', 'pointer-events': 'none' }, c.lure);
        c.bulb = el('circle', { cx: -42, cy: -96, r: 10, fill: '#fff6a0' }, c.lure);
        el('circle', { cx: -45, cy: -99, r: 3.5, fill: '#fff' }, c.lure);
        c.hit(el('rect', { x: -96, y: -112, width: 210, height: 182, fill: 'transparent' }, g));
        c.flash = big => c.light.animate([{ opacity: .55, transform: 'scale(1)' }, { opacity: 1, transform: `scale(${big ? 2.2 : 1.6})`, offset: .25 }, { opacity: .55, transform: 'scale(1)' }], { duration: big ? 1600 : 1100, easing: 'ease-out' });
        c.react = () => {
          c.squash();
          c.flash(!c.busy);
          A.sfx('blink', { vol: .5, rate: rand(.8, 1) });
          A.bell(mtof(pick([60, 64, 67])), { vol: .12, r: 1.4 });
          c.mo.style.display = ''; c.mc.style.display = 'none';
          ctx.after(650, () => { c.mo.style.display = 'none'; c.mc.style.display = ''; });
          const [ax, ay] = c.at();
          bubbles(ax - 70 * c.s, ay + 10, 4);
          ctx.sparkle(ax - 42 * c.s, ay - 96 * c.s, 5, 30, '#fff6a0');
          if (c.busy) return;
          c.busy = true; ctx.after(1600, () => { c.busy = false; });
        };
        c.dance = i => { c.flash(true); c.inner.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg) translateY(-6px)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0deg)' }], { duration: 760 }); };
        c.tick = t => {
          c.ox = Math.sin(t * .3) * 18; c.oy = Math.sin(t * .7) * 8;
          c.lure.setAttribute('transform', `rotate(${(Math.sin(t * 1.3) * 9).toFixed(1)} -4 -58)`);
          c.bulbHalo.setAttribute('opacity', (.6 + Math.sin(t * 3) * .3).toFixed(2));
        };
        c.hint = () => { const [ax, ay] = c.at(); return [ax, ay - 20]; };
        return c;
      }
      function crab(x, y, s) {
        const c = creature({ id: 'crab', n: 'かにさん', color: '#ff7a6a', x, y, s });
        const g = c.body;
        const legs = el('g', { class: 'tb' }, g);
        [-1, 1].forEach(d => [0, 1, 2].forEach(j => el('path', { d: `M${d * 24},${4 + j * 7} q${d * 16},${-4} ${d * 22},${10}`, stroke: '#e85a4a', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, legs)));
        const claws = [-1, 1].map(d => {
          el('path', { d: `M${d * 22},-6 Q${d * 36},-12 ${d * 42},-24`, stroke: '#e85a4a', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
          const cg = el('g', { transform: `translate(${d * 44} -30)` }, g);
          el('path', { d: 'M-13,0 A13,11 0 0 0 13,0Z', fill: '#ff6a5a' }, cg);
          const top = el('path', { d: 'M-13,-2 A13,13 0 0 1 13,-2Z', fill: '#ff8a7a', class: 'tb', style: `transform-origin:${d < 0 ? '100%' : '0%'} 100%` }, cg);
          return { top, d };
        });
        [-1, 1].forEach(d => el('path', { d: `M${d * 9},-14 L${d * 11},-30`, stroke: '#e85a4a', 'stroke-width': 4, 'stroke-linecap': 'round' }, g));
        el('ellipse', { rx: 34, ry: 22, fill: '#ff7a6a' }, g);
        el('ellipse', { cx: -12, cy: -12, rx: 12, ry: 4.5, fill: '#fff', opacity: .45 }, g);
        [-1, 1].forEach(d => {
          el('circle', { cx: d * 11, cy: -32, r: 7.5, fill: '#fff' }, g);
          const lk = el('g', {}, g), bl = el('g', { class: 'tb' }, lk);
          el('circle', { cx: d * 11, cy: -32, r: 4.4, fill: INK }, bl); el('circle', { cx: d * 11 - 1.5, cy: -33.5, r: 1.6, fill: '#fff' }, bl);
          c.eyes.push({ lk, bl });
        });
        cheek(g, -20, 4); cheek(g, 20, 4);
        smile(g, 0, 4, 7, '#8a2a2a');
        c.hit(el('rect', { x: -62, y: -56, width: 124, height: 92, fill: 'transparent' }, g));
        c.snap = () => {
          claws.forEach(q => q.top.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${q.d * -30}deg)` }, { transform: 'rotate(0deg)' }], { duration: 200 }));
          A.click(); A.osc(1900, { when: .08, r: .03, vol: .1, wet: 0 });
        };
        c.react = () => {
          c.snap(); c.squash();
          if (c.busy) return;
          c.busy = true;
          const from = c.x, to = from < 200 ? from + 90 : from - 90;
          legs.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.82)' }], { duration: 110, iterations: 8, direction: 'alternate' });
          for (let i = 1; i < 4; i++) ctx.after(i * 230, c.snap);
          ctx.tween(900, k => { c.x = from + (to - from) * k; c.oy = -Math.abs(Math.sin(k * Math.PI * 5)) * 6; }, () => { c.busy = false; c.oy = 0; });
        };
        c.dance = i => { c.snap(); c.inner.animate([{ transform: 'translateX(0px)' }, { transform: 'translateX(-14px) rotate(-6deg)' }, { transform: 'translateX(14px) rotate(6deg)' }, { transform: 'translateX(0px)' }], { duration: 760 }); };
        return c;
      }
      function starfish(x, y, s) {
        const c = creature({ id: 'star', n: 'ひとでさん', color: '#ffb06b', x, y, s });
        const g = c.body, spin = el('g', { class: 'tb' }, g);
        let d = '';
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 20 : 44;
          d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1);
        }
        el('path', { d: d + 'Z', fill: '#ffa45c', stroke: '#ffa45c', 'stroke-width': 12, 'stroke-linejoin': 'round' }, spin);
        el('path', { d: d + 'Z', fill: '#ffb877', transform: 'scale(.72)', 'stroke-linejoin': 'round' }, spin);
        for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; el('circle', { cx: (Math.cos(a) * 30).toFixed(1), cy: (Math.sin(a) * 30).toFixed(1), r: 3, fill: '#ffe0b8' }, spin); }
        el('ellipse', { cx: -10, cy: -18, rx: 6, ry: 3, fill: '#fff', opacity: .5 }, spin);
        eye(c, spin, -8, -4, 4.6); eye(c, spin, 8, -4, 4.6);
        cheek(spin, -15, 6, 5, 3.5); cheek(spin, 15, 6, 5, 3.5);
        smile(spin, 0, 6, 4, '#a84a2a');
        c.hit(el('circle', { r: 52, fill: 'transparent' }, g));
        c.react = () => {
          A.sfx('spin', { vol: .5, rate: rand(.95, 1.2) }) || A.whoosh();
          spin.animate([{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(200deg) scale(1.15,.88)', offset: .5 }, { transform: 'rotate(360deg) scale(1)' }], { duration: 900, easing: 'ease-in-out' });
          ctx.after(450, () => ctx.sparkle(c.at()[0], c.at()[1], 4, 50));
        };
        c.dance = i => spin.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-25deg)' }, { transform: 'rotate(25deg)' }, { transform: 'rotate(0deg)' }], { duration: 760 });
        return c;
      }
      function clam(x, y, s) {
        const c = creature({ id: 'clam', n: 'かいがら', color: '#ffc4dc', x, y, s });
        const g = c.body;
        const lid = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, g);
        const pearl = el('g', { opacity: 0 }, g);
        el('circle', { cx: 0, cy: -6, r: 11, fill: '#fff6fb' }, pearl);
        el('circle', { cx: -3, cy: -9, r: 3.5, fill: '#fff' }, pearl);
        g.insertBefore(pearl, lid);
        el('path', { d: 'M-46,-2 Q-44,-46 0,-48 Q44,-46 46,-2Z', fill: '#ffb3d1' }, lid);
        [-30, -15, 0, 15, 30].forEach(x => el('path', { d: `M0,-2 L${x},-44`, stroke: '#ff8fbf', 'stroke-width': 3, 'stroke-linecap': 'round' }, lid));
        el('ellipse', { cx: -16, cy: -32, rx: 10, ry: 4, fill: '#fff', opacity: .5 }, lid);
        el('path', { d: 'M-48,-2 Q-40,34 0,36 Q40,34 48,-2Z', fill: '#ffc4dc' }, g);
        el('path', { d: 'M-12,28 L-6,40 L6,40 L12,28Z', fill: '#ffb3d1' }, g);
        eye(c, g, -14, 10, 4.8); eye(c, g, 14, 10, 4.8);
        cheek(g, -26, 18, 5.5, 3.5); cheek(g, 26, 18, 5.5, 3.5);
        smile(g, 0, 18, 4, '#a84a6a');
        c.hit(el('rect', { x: -56, y: -60, width: 112, height: 104, fill: 'transparent' }, g));
        c.react = () => {
          c.squash();
          if (c.busy) { A.sfx('blink', { vol: .5, rate: rand(.9, 1.3) }); ctx.sparkle(c.at()[0], c.at()[1] - 10, 2, 20, '#fff'); return; }
          c.busy = true;
          A.pop();
          lid.animate([{ transform: 'rotate(0deg) scaleY(1)' }, { transform: 'scaleY(-.6)', offset: .5 }, { transform: 'scaleY(-.5)' }], { duration: 360, easing: 'ease-out', fill: 'forwards' });
          pearl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 150, fill: 'forwards' });
          ctx.after(260, () => { A.sfx('sparkle', { vol: .4 }) || A.twinkle(); ctx.sparkle(c.at()[0], c.at()[1] - 12 * c.s, 5, 34, '#fff'); });
          ctx.after(2200, () => {
            lid.animate([{ transform: 'scaleY(-.5)' }, { transform: 'scaleY(1)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' });
            pearl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
            ctx.after(300, () => { A.click(); c.busy = false; });
          });
        };
        return c;
      }
      function chest(x, y, s) {
        const c = creature({ id: 'chest', n: 'たからばこ', color: '#ffd56b', x, y, s, bonus: true });
        const g = c.body;
        const glow = el('ellipse', { cx: 0, cy: -24, rx: 70, ry: 44, fill: 'url(#sea-glow)', opacity: .5, 'pointer-events': 'none' }, g);
        glow.animate([{ opacity: .3 }, { opacity: .7 }], { duration: 900, iterations: Infinity, direction: 'alternate' });
        el('ellipse', { cx: 0, cy: -20, rx: 44, ry: 9, fill: '#5a3a26' }, g);
        const pop = el('g', {}, g);
        el('rect', { x: -50, y: -22, width: 100, height: 50, rx: 9, fill: '#c98a4a' }, g);
        [-30, 30].forEach(x => el('rect', { x: x - 5, y: -22, width: 10, height: 50, fill: '#ffd56b' }, g));
        el('rect', { x: -9, y: -12, width: 18, height: 18, rx: 4, fill: '#ffd56b' }, g);
        el('circle', { cx: 0, cy: -3, r: 3, fill: '#8a5a2e' }, g);
        const lid = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, g);
        el('path', { d: 'M-52,-20 L-52,-36 Q-52,-58 0,-58 Q52,-58 52,-36 L52,-20Z', fill: '#d99a55' }, lid);
        [-30, 30].forEach(x => el('rect', { x: x - 5, y: -57, width: 10, height: 37, fill: '#ffd56b' }, lid));
        el('ellipse', { cx: -20, cy: -48, rx: 14, ry: 4, fill: '#fff', opacity: .4 }, lid);
        c.hit(el('rect', { x: -64, y: -80, width: 128, height: 116, fill: 'transparent' }, g));
        c.react = () => {
          c.squash();
          if (c.busy) { A.sfx('coin', { vol: .5, rate: rand(.9, 1.3) }); ctx.sparkle(c.at()[0], c.at()[1] - 50, 2, 30); return; }
          c.busy = true;
          A.sfx('creak', { vol: .3, rate: 1.4 });
          lid.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(-.5)' }], { duration: 300, easing: 'ease-out', fill: 'forwards' });
          ctx.after(220, () => {
            A.sfx('jingle', { vol: .45 }) || [79, 83, 86, 91].forEach((m, i) => A.bell(mtof(m), { when: i * .08, vol: .1 }));
            for (let i = 0; i < 6; i++) {
              const p = el('g', {}, pop);
              el('circle', { r: 10, fill: i % 2 ? '#ffd23f' : '#fff6fb' }, p);
              el('circle', { cx: -3, cy: -3, r: 3, fill: '#fff' }, p);
              const dx = (i - 2.5) * 22, h = rand(80, 120);
              ctx.after(i * 90, () => A.sfx('coin', { vol: .35, rate: 1 + i * .06 }));
              ctx.tween(1400, k => {
                p.setAttribute('transform', `translate(${(dx * k).toFixed(1)} ${(-20 - h * Math.sin(k * Math.PI * .75)).toFixed(1)})`);
                p.setAttribute('opacity', (k < .7 ? 1 : (1 - k) / .3).toFixed(2));
              }, () => p.remove(), k => k);
            }
            ctx.sparkle(c.at()[0], c.at()[1] - 80, 8, 60);
          });
          ctx.after(2600, () => {
            lid.animate([{ transform: 'scaleY(-.5)' }, { transform: 'scaleY(1)' }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
            ctx.after(320, () => { A.click(); c.busy = false; });
          });
        };
        c.inner.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.15,.9)', opacity: 1, offset: .6 }, { transform: 'scale(1)', opacity: 1 }], { duration: 700, delay: 600, fill: 'backwards', easing: 'ease-out' });
        return c;
      }

      /* ---------- area builders ---------- */
      function rays(g, color) {
        [[60, 26, 120], [170, 20, 96], [270, 32, 140], [370, 18, 86]].forEach(([x, w, spread], i) => {
          const r = el('path', { d: `M${x - w / 2},${SURF} L${x + w / 2},${SURF} L${x + spread / 2 + 50},700 L${x - spread / 2 + 50},700Z`, fill: 'url(#sea-ray)', opacity: .3, 'pointer-events': 'none' }, g);
          if (color) r.setAttribute('fill', `url(#${color})`);
          r.animate(color ? [{ opacity: .05 }, { opacity: .25 }] : [{ opacity: .12 }, { opacity: .42 }], { duration: 3200 + i * 900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -i * 700 });
        });
      }
      function seaweed(g, x, h, c, base, n = 3) {
        const sw = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, g);
        for (let j = 0; j < n; j++) {
          const dx = (j - (n - 1) / 2) * 12;
          el('path', { d: `M${x + dx},${base} Q${x + dx - 16},${base - h * .5} ${x + dx},${base - h * (j === 1 ? 1.15 : .85)} Q${x + dx + 16},${base - h * .5} ${x + dx + 5},${base}Z`, fill: c }, sw);
        }
        sw.animate([{ transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }], { duration: rand(2200, 3200), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -rand(0, 2000) });
        return sw;
      }
      function buildArea(id) {
        world.replaceChildren();
        S = { id, C: [], snow: [], par: [] };
        const w = world;
        const layer = k => { const g = el('g', {}, w); S.par.push({ g, k }); return g; };
        if (id === 'reef') {
          el('rect', { x: -800, y: -900, width: 2000, height: 900 + SURF + 10, fill: '#cdeeff' }, w);
          el('circle', { cx: 340, cy: 26, r: 40, fill: 'url(#sea-sun)' }, w);
          el('circle', { cx: 340, cy: 26, r: 17, fill: '#ffe27a' }, w);
          el('rect', { x: -800, y: SURF, width: 2000, height: 1800, fill: 'url(#sea-reef)' }, w);
          const wave = el('g', {}, w);
          let wd = `M-840,${SURF + 4}`;
          for (let x = -840; x < 1240; x += 40) wd += ' q10,-9 20,0 q10,9 20,0';
          el('path', { d: wd + ` L1240,${SURF + 14} L-840,${SURF + 14}Z`, fill: '#9fe4ff' }, wave);
          wave.animate([{ transform: 'translateX(0px)' }, { transform: 'translateX(-40px)' }], { duration: 2600, iterations: Infinity });
          const far = layer(.25);
          el('path', { d: 'M-120,700 L-120,560 Q-80,500 -30,540 Q10,470 70,520 Q120,480 160,530 Q220,490 260,540 Q320,470 380,530 Q440,500 520,550 L520,700Z', fill: '#7fc2e8', opacity: .75 }, far);
          [[30, 520], [150, 500], [300, 505], [410, 520]].forEach(([x, y]) => el('path', { d: `M${x},${y + 30} L${x},${y - 20} M${x},${y} L${x - 16},${y - 22} M${x},${y + 10} L${x + 18},${y - 14}`, stroke: '#7fc2e8', 'stroke-width': 9, 'stroke-linecap': 'round', fill: 'none', opacity: .8 }, far));
          rays(w);
          const mid = layer(.55);
          el('path', { d: 'M-140,700 L-140,600 Q-90,560 -30,580 Q30,552 90,590 Q130,620 150,700Z', fill: '#4d8cc0' }, mid);
          el('path', { d: 'M250,700 Q262,610 320,592 Q380,566 440,596 Q500,606 540,700Z', fill: '#4d8cc0' }, mid);
          [[10, 572, '#ff8fb1'], [70, 584, '#ffb06b'], [330, 586, '#c9a7ff'], [390, 580, '#ff8fb1']].forEach(([x, y, c], i) => {
            if (i % 2) { el('ellipse', { cx: x, cy: y - 18, rx: 24, ry: 20, fill: c }, mid); el('ellipse', { cx: x - 6, cy: y - 26, rx: 8, ry: 4, fill: '#fff', opacity: .35 }, mid); }
            else el('path', { d: `M${x},${y + 6} L${x},${y - 36} M${x},${y - 12} L${x - 16},${y - 34} M${x},${y - 20} L${x + 15},${y - 44}`, stroke: c, 'stroke-width': 9, 'stroke-linecap': 'round', fill: 'none' }, mid);
          });
          el('path', { d: 'M-800,1700 L-800,664 Q100,642 200,660 Q300,678 400,656 Q700,634 1200,660 L1200,1700Z', fill: '#f2d49b' }, w);
          el('path', { d: 'M-800,1700 L-800,676 Q100,656 200,674 Q300,690 400,670 Q700,650 1200,676 L1200,1700Z', fill: '#f6deae' }, w);
          [[40, 712], [170, 734], [250, 708], [360, 726], [120, 758]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 6, ry: 3, fill: '#e3bf80' }, w));
          S.ink = el('g', { 'pointer-events': 'none' }, w);
          S.cl = el('g', {}, w);
          S.near = layer(1);
          seaweed(S.near, 14, 150, '#3fb86f', 700); seaweed(S.near, 388, 130, '#4fc47e', 700);
          seaweed(S.near, 184, 60, '#5fcf8a', 676, 2);
          el('path', { d: 'M320,720 L320,674 M320,694 L302,672 M320,686 L338,664', stroke: '#ff7aa0', 'stroke-width': 10, 'stroke-linecap': 'round', fill: 'none' }, S.near);
          whale(200, 196, 1.18);
          school({ n: 8, colors: ['#ffa94d', '#ff8a5c', '#ffc94d'], cx: 140, cy: 370, top: 260, bottom: 560, path: (t, p) => p ? [200 + Math.cos(t * 1.4) * 100, 400 + Math.sin(t * 1.4) * 50] : [150 + Math.sin(t * .35) * 50, 370 + Math.sin(t * .6) * 30] });
          puffer(300, 436, 1.5);
          octopus(96, 548, 1.3);
          S.water = '#2f9ad8'; S.ghostHome = [205, 610]; S.passColor = ['#7fdcc0', '#ff8fb1', '#ffd56b'];
          S.dive = true;
        } else if (id === 'deep') {
          el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: 'url(#sea-deep)' }, w);
          rays(w, 'sea-rayB');
          const far = layer(.25);
          el('path', { d: 'M-160,-100 L40,-100 Q20,120 60,260 Q30,420 70,560 Q40,700 -160,760Z', fill: '#13245a' }, far);
          el('path', { d: 'M560,-100 L370,-100 Q390,140 350,300 Q380,460 340,620 Q370,700 560,760Z', fill: '#13245a' }, far);
          for (let i = 0; i < 12; i++) el('circle', { cx: rand(-40, 440).toFixed(0), cy: rand(0, 680).toFixed(0), r: rand(1.5, 3).toFixed(1), fill: pick(['#7fe8ff', '#c9a7ff', '#9fffe0']), class: 'twinkle', style: `animation-delay:-${rand(0, 2.4).toFixed(1)}s` }, far);
          const mid = layer(.55);
          el('path', { d: 'M-120,760 L-120,640 Q-60,600 0,620 Q60,596 110,640 Q140,670 150,760Z', fill: '#1b2d66' }, mid);
          el('path', { d: 'M240,760 Q260,650 320,640 Q380,610 440,640 Q500,660 520,760Z', fill: '#1b2d66' }, mid);
          [[20, 628], [80, 640], [300, 652], [370, 632]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4, fill: '#7fe8ff', class: 'twinkle' }, mid));
          el('path', { d: 'M-800,1700 L-800,694 Q100,674 200,690 Q300,706 400,686 Q700,668 1200,690 L1200,1700Z', fill: '#141c48' }, w);
          S.ink = el('g', { 'pointer-events': 'none' }, w);
          S.cl = el('g', {}, w);
          S.near = layer(1);
          [[14, 170], [388, 150]].forEach(([x, h]) => {
            const sw = seaweed(S.near, x, h, '#1d4560', 720);
            el('circle', { cx: x, cy: 720 - h * 1.1, r: 5, fill: '#9fffe0', class: 'twinkle' }, sw);
            el('circle', { cx: x + 12, cy: 720 - h * .8, r: 4, fill: '#9fffe0', class: 'twinkle', style: 'animation-delay:-1s' }, sw);
          });
          for (let i = 0; i < 16; i++) {
            const n = el('circle', { r: rand(1.2, 2.4).toFixed(1), fill: '#dfe8ff', opacity: rand(.3, .7).toFixed(2) }, S.near);
            S.snow.push({ n, x: rand(0, 400), y: rand(-40, 760), v: rand(8, 18), ph: rand(0, 6) });
          }
          jelly(92, 196, 1.4, true);
          angler(244, 336, 1.25);
          jelly(318, 520, 1.25, true, 1);
          school({ n: 7, colors: ['#5a8cff', '#6fa0ff'], glow: true, cx: 140, cy: 520, top: 420, bottom: 640, path: (t, p) => p ? [200 + Math.cos(t * 1.4) * 110, 470 + Math.sin(t * 1.4) * 50] : [130 + Math.sin(t * .35) * 50, 530 + Math.sin(t * .6) * 30] });
          S.water = '#0f1e50'; S.ghostHome = [210, 640]; S.passColor = ['#5a8cff', '#7fe8ff'];
          S.dive = true;
        } else {
          el('rect', { x: -800, y: -900, width: 2000, height: 1100, fill: 'url(#sea-sky)' }, w);
          el('circle', { cx: 330, cy: 70, r: 60, fill: 'url(#sea-sun)' }, w);
          el('circle', { cx: 330, cy: 70, r: 26, fill: '#ffe27a' }, w);
          const far = layer(.3);
          S.clouds = [[60, 110, 1], [250, 40, .8]].map(([x, y, s]) => {
            const g = el('g', {}, far);
            [[0, 0, 26], [24, -10, 22], [46, 0, 20], [22, 8, 24]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill: '#fff' }, g));
            return { g, x, y, s };
          });
          el('rect', { x: -800, y: 196, width: 2000, height: 600, fill: 'url(#sea-band)' }, w);
          el('rect', { x: -800, y: 196, width: 2000, height: 6, fill: '#2f96c8', opacity: .6 }, w);
          const mid = layer(.6);
          [[232, 30, 3800], [292, 24, 3000], [360, 20, 2400]].forEach(([y, a, d], i) => {
            const g = el('g', {}, mid), gi = el('g', {}, g);
            let p = `M-840,${y}`;
            for (let x = -840; x < 1240; x += 60) p += ' q15,-8 30,0 q15,8 30,0';
            el('path', { d: p, stroke: '#fff', 'stroke-width': 3.5, fill: 'none', opacity: .45 + i * .1, 'stroke-linecap': 'round' }, gi);
            gi.animate([{ transform: 'translateX(0px)' }, { transform: `translateX(${i % 2 ? 60 : -60}px)` }], { duration: d, iterations: Infinity });
          });
          // the beach
          el('path', { d: 'M-800,1700 L-800,450 Q0,430 200,446 Q320,456 400,440 Q700,424 1200,450 L1200,1700Z', fill: '#f6dca8' }, w);
          S.wet = el('path', { d: 'M-800,470 Q0,452 200,466 Q320,476 400,460 Q700,446 1200,470 L1200,520 L-800,520Z', fill: '#e6c48a', opacity: .5 }, w);
          [[40, 600], [150, 700], [270, 560], [360, 760], [110, 520]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 6, ry: 3, fill: '#e3bf80' }, w));
          [[200, 760, '#ffb3c1'], [372, 620, '#c9a7ff']].forEach(([x, y, c]) => el('path', { d: `M${x - 10},${y} q10,-18 20,0Z`, fill: c }, w));
          // the wash: a sheet of water whose foamy edge slides up and down the sand
          S.wash = el('g', { 'pointer-events': 'none' }, w);
          let fd = 'M-800,-130 L1200,-130 L1200,0';
          for (let x = 440; x >= -40; x -= 40) fd += ` q-10,${x % 80 ? 10 : 6} -20,0 q-10,${x % 80 ? -6 : -10} -20,0`;
          el('path', { d: fd + ' L-800,0Z', fill: 'url(#sea-wash)' }, S.wash);
          let fe = 'M-40,0';
          for (let x = -40; x < 440; x += 40) fe += ' q10,10 20,0 q10,-8 20,0';
          el('path', { d: fe, stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: .9 }, S.wash);
          for (let i = 0; i < 7; i++) el('circle', { cx: 20 + i * 60, cy: -10, r: 4, fill: '#fff', opacity: .8 }, S.wash);
          S.ink = el('g', { 'pointer-events': 'none' }, w);
          S.cl = el('g', {}, w);
          S.near = layer(0);
          school({ n: 6, colors: ['#ffa94d', '#ffd56b', '#7fdcc0'], cx: 250, cy: 300, top: 232, bottom: 410, path: (t, p) => p ? [200 + Math.cos(t * 1.4) * 120, 320 + Math.sin(t * 1.4) * 40] : [260 + Math.sin(t * .35) * 60, 320 + Math.sin(t * .6) * 24] });
          crab(220, 600, 1.75);
          starfish(86, 694, 1.3);
          clam(318, 704, 1.35);
          S.water = '#3fb0d8'; S.ghostHome = [112, 360]; S.passColor = null;
          S.dive = false;
        }
        // the rare surprise: a treasure chest or a mermaid ぽわん
        S.rare = (round > 0 && Math.random() < 1 / 6) ? (id === 'shore' || Math.random() < .5 ? 'treasure' : 'mermaid') : null;
        if (S.rare === 'treasure') chest(id === 'shore' ? 330 : 300, id === 'shore' ? 540 : (id === 'deep' ? 700 : 690), 1.15);
        outfit(S.rare === 'mermaid' ? 'mermaid' : S.dive ? 'dive' : 'ring');
        S.C.forEach(c => c.place && c.place());
        // pearls: one per friend in this area
        ui.replaceChildren(); pearls = [];
        const need = S.C.filter(c => !c.bonus);
        need.forEach((c, i) => {
          const g = el('g', { transform: `translate(${200 + (i - (need.length - 1) / 2) * 34} 748)` }, ui);
          el('circle', { r: 12, fill: '#fff', opacity: .25 }, g);
          const p = el('circle', { r: 9, fill: '#fff', opacity: .35, class: 'tb' }, g);
          pearls.push({ c, p });
        });
        cover.setAttribute('fill', S.water);
        found = new Set();
      }

      /* ---------- play ---------- */
      function discover(c) {
        if (c.bonus || found.has(c.id) || party) return;
        found.add(c.id);
        const q = pearls.find(z => z.c === c);
        if (q) {
          q.p.setAttribute('fill', c.color); q.p.setAttribute('opacity', 1);
          q.p.animate([{ transform: 'scale(.2)' }, { transform: 'scale(1.7)', offset: .6 }, { transform: 'scale(1)' }], { duration: 500, easing: 'ease-out' });
          A.sfx('coin', { vol: .3, rate: .9 + found.size * .08 });
        }
        ghost.set('happy'); ghost.hop(); ghost.talk(c.n + '！');
        if (found.size === pearls.length) ctx.after(1900, startParty);
        else ctx.after(1400, () => { if (!party) ghost.set('normal'); });
      }
      function tapCreature(c, p) {
        haptic();
        if (party) { const q = c.hint(); ctx.sparkle(q[0], q[1] - 20, 4, 40); A.bell(mtof(pick(PENTA) + 12), { vol: .1 }); c.squash && c.squash(); return; }
        c.react(p);
        discover(c);
      }
      function ghostDance() {
        dancing = true;
        ghost.hop(); ghost.giggle(); ghost.swing(40, 300);
        const [hx, hy] = S.ghostHome;
        ctx.tween(1600, k => ghost.place(200 + Math.sin(k * Math.PI * 2) * 110, hy - Math.abs(Math.sin(k * Math.PI * 3)) * 60, .6), () => { dancing = false; }, k => k);
      }
      function startParty() {
        if (S.C.some(c => c.busy && c.id === 'whale')) return ctx.after(300, startParty);
        party = true;
        ghost.set('happy'); ghost.talk('みんな なかよし！');
        let t = A.now() + .3; const beat = .3;
        SONG.forEach(([m, b], i) => {
          if (S.id === 'reef') A.osc(mtof(m - 12), { at: t, a: .05, hold: b * beat * .6, r: .3, vib: 5, vibD: .015, vol: .1, wet: .5 });
          A.musicbox(mtof(m + 12), { at: t, vol: .07 });
          const ms = (t - A.now()) * 1000;
          if (i % 2 === 0) ctx.after(Math.max(0, ms), () => S.C.forEach((c, j) => c.dance(j)));
          t += b * beat;
        });
        S.C.forEach((c, j) => c.dance(j));
        ctx.after(1500, () => {
          A.tada(); haptic(30);
          ctx.confetti(110, 420, 30); ctx.after(300, () => ctx.confetti(290, 420, 30));
          ghost.glow(true); ghostDance();
          S.C.forEach(c => { const q = c.hint(); ctx.sparkle(q[0], q[1] - 10, 3, 40); c.squash && c.squash(1.3); });
          bubbles(200, 700, 10);
        });
        ctx.after(2700, () => { ghost.talk(S.id === 'deep' ? 'きれいだね！' : 'たのしいね'); S.C.forEach((c, j) => c.dance(j)); });
        ctx.after(4300, nextArea);
      }
      function nextArea() {
        // a curtain of big bubbles carries everyone to the next place
        A.sfx('bubbles', { vol: .6 }) || A.whoosh();
        ctx.after(500, () => A.sfx('bubbles', { vol: .5, rate: .85 }));
        for (let i = 0; i < 34; i++) {
          const g = el('g', {}, bubL), r = rand(12, 34);
          el('circle', { r, fill: '#fff', 'fill-opacity': .22, stroke: '#fff', 'stroke-width': 3, 'stroke-opacity': .9 }, g);
          el('circle', { cx: -r * .35, cy: -r * .35, r: r * .25, fill: '#fff' }, g);
          const x0 = rand(-10, 410), d = rand(0, 500), ph = rand(0, 6);
          ctx.after(d, () => ctx.tween(1500, k => g.setAttribute('transform', `translate(${(x0 + Math.sin(k * 8 + ph) * 12).toFixed(1)} ${(840 - 1000 * k).toFixed(1)})`), () => g.remove(), easeIn));
        }
        const next = AREAS[(areaIdx + 1) % AREAS.length];
        cover.setAttribute('fill', '#bfeaff');
        cover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 350, fill: 'forwards' }).onfinish = () => {
          ghost.glow(false);
          areaIdx = (areaIdx + 1) % AREAS.length; round++;
          buildArea(next);
          cover.setAttribute('fill', '#bfeaff');
          party = false;
          lookAll();
          cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' });
          ctx.after(400, greet);
        };
      }
      function greet() {
        ghost.set('happy'); ghost.hop();
        if (S.rare === 'mermaid') { ghost.talk('にんぎょさん だよ'); A.sfx('sparkle', { vol: .4 }); ctx.sparkle(ghost.x, ghost.y, 8, 60, '#ffd6f4'); }
        else if (S.rare === 'treasure') { ghost.talk('たからばこ！'); A.sfx('sparkle', { vol: .4 }); }
        else ghost.talk(S.id === 'shore' ? 'うみだよ〜' : S.id === 'deep' ? 'ふかい うみ' : 'うみだよ〜');
        bubbles(S.ghostHome[0], S.ghostHome[1] - 40, 6);
        ctx.after(1700, () => { if (!party) ghost.set('normal'); });
      }

      /* taps on open water, sky or sand */
      let noteAt = 0;
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e); lastP = p; lookAll();
        haptic(8);
        const sch = S.C.find(c => c.id === 'fish');
        if (!party && sch && sch.near(p)) { sch.react(p); discover(sch); return; }
        if (S.id === 'shore') {
          if (p.y < 196) { ctx.sparkle(p.x, p.y, 3, 24, '#fff6c8'); A.sfx('blink', { vol: .45, rate: rand(.9, 1.3) }); jump(); return; }
          if (p.y < 446) { splash(p.x, p.y); return; }
          sand(p.x, p.y); return;
        }
        bubbles(p.x, p.y, 5, noteAt); noteAt = (noteAt + 1) % 5;
        A.sfx(pick(['bubble', 'blub', 'plop', 'bubble']), { vol: .5, rate: rand(.85, 1.25) }) || A.pop();
        if (S.id === 'deep') ctx.sparkle(p.x, p.y, 3, 26, pick(['#7fe8ff', '#c9a7ff', '#9fffe0']));
        if (Math.random() < .45) passer(clamp(p.y + rand(-40, 40), 120, 640));
        if (party) ctx.sparkle(p.x, p.y, 3, 26);
      });
      function splash(x, y) {
        A.sfx('splash2', { vol: .35, rate: rand(1, 1.3) }) || A.noise({ type: 'highpass', from: 1500, to: 3000, dur: .4, vol: .12 });
        const g = el('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})` }, fxL);
        const ring = el('ellipse', { rx: 30, ry: 9, fill: 'none', stroke: '#fff', 'stroke-width': 4, class: 'tb' }, g);
        ring.animate([{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 800, easing: 'ease-out' }).onfinish = () => g.remove();
        for (let i = 0; i < 5; i++) {
          const d = el('circle', { r: rand(3, 5), fill: '#e8fbff' }, fxL), vx = (i - 2) * 40, vy = rand(-200, -140);
          ctx.tween(700, k => { d.setAttribute('transform', `translate(${(x + vx * k).toFixed(1)} ${(y + vy * k + 380 * k * k).toFixed(1)})`); d.setAttribute('opacity', (1 - k).toFixed(2)); }, () => d.remove(), k => k);
        }
        if (Math.random() < .5) jump(x);
      }
      function sand(x, y) {
        A.sfx('pop', { vol: .35, rate: rand(1.1, 1.4) }) || A.click();
        for (let i = 0; i < 6; i++) {
          const d = el('circle', { r: rand(2.5, 4.5), fill: '#e8c48a' }, fxL), a = -Math.PI * (i + .5) / 6, sp = rand(40, 70);
          ctx.tween(500, k => { d.setAttribute('transform', `translate(${(x + Math.cos(a) * sp * k).toFixed(1)} ${(y + Math.sin(a) * sp * k + 60 * k * k).toFixed(1)})`); d.setAttribute('opacity', (1 - k).toFixed(2)); }, () => d.remove(), k => k);
        }
        ctx.sparkle(x, y - 6, 2, 16, '#fff6c8');
      }
      let jumping = false;
      function jump(x) {
        if (jumping) return;
        jumping = true;
        const g = el('g', {}, S.cl), f = el('g', {}, g);
        fishShape(f, pick(['#ffa94d', '#ff8fb1', '#7fdcc0']));
        const x0 = clamp(x ?? rand(80, 320), 60, 340), dir = x0 > 200 ? -1 : 1;
        ctx.tween(1100, k => {
          const xx = x0 + dir * 110 * k, yy = 240 - Math.sin(k * Math.PI) * 120;
          g.setAttribute('transform', `translate(${xx.toFixed(1)} ${yy.toFixed(1)}) scale(${dir * 1.6} 1.6) rotate(${((k - .5) * 80).toFixed(0)})`);
        }, () => { g.remove(); jumping = false; A.sfx('splash2', { vol: .25, rate: 1.3 }); }, k => k);
      }
      ghost.pos.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        ghost.giggle(); bubbles(ghost.x, ghost.y - 50, 4, 2);
        if (S.rare === 'mermaid') { gear.fin.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-20deg)' }, { transform: 'rotate(20deg)' }, { transform: 'rotate(0deg)' }], { duration: 600 }); A.sfx('sparkle', { vol: .35 }); ctx.sparkle(ghost.x, ghost.y + 40, 5, 50, '#ffd6f4'); }
        ctx.after(800, () => { if (!party) ghost.set('normal'); });
      });

      /* ---------- motion ---------- */
      let washWas = 0;
      ctx.every(800, () => {
        if (!S) return;
        const c = pick(S.C);
        c.eyes.forEach(e => e.bl.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 }));
        if (S.id !== 'shore' && Math.random() < .5) {
          const g = el('g', {}, fxL), r = rand(2, 5), x0 = rand(10, 390), y0 = 700, dur = rand(5000, 8000), ph = rand(0, 6);
          el('circle', { r, fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: .55 }, g);
          ctx.tween(dur, k => g.setAttribute('transform', `translate(${(x0 + Math.sin(k * 12 + ph) * 6).toFixed(1)} ${(y0 - (y0 - (S.id === 'deep' ? -40 : SURF + 6)) * k).toFixed(1)})`), () => g.remove(), k => k);
        }
      });
      ctx.loop((dt, t) => {
        if (!S) return;
        const [hx, hy] = S.ghostHome;
        let gx = hx, gy = hy;
        if (S.id === 'shore') { gx = hx + Math.sin(t * .3) * 22; gy = hy + Math.sin(t * 1.3) * 5; }
        else if (S.rare === 'mermaid') { gx = 200 + Math.sin(t * .4) * 120; gy = hy - 40 + Math.sin(t * .8) * 30; gear.fin.style.transform = `rotate(${(Math.sin(t * 4) * 12).toFixed(1)}deg)`; }
        else { gx = 200 + Math.sin(t * .37) * 34; gy = hy + Math.sin(t * .61) * 12; }
        if (!dancing) ghost.place(gx, gy, .6);
        // parallax: layers slide a little with ぽわん and drift on their own
        const cam = (ghost.x - 200);
        S.par.forEach(({ g, k }) => { if (k) g.setAttribute('transform', `translate(${(-cam * k * .25 + Math.sin(t * .08) * 10 * k).toFixed(1)} 0)`); });
        S.C.forEach(c => { if (c.fishes) c.tick(dt, t); else { if (c.tick) c.tick(t); c.place(); } });
        S.snow.forEach(s => {
          s.y += s.v * dt; if (s.y > 770) { s.y = -30; s.x = rand(0, 400); }
          s.n.setAttribute('transform', `translate(${(s.x + Math.sin(t * .5 + s.ph) * 12).toFixed(1)} ${s.y.toFixed(1)})`);
        });
        if (S.clouds) S.clouds.forEach((c, i) => { const x = ((c.x + t * (6 + i * 4)) % 560) - 80; c.g.setAttribute('transform', `translate(${x.toFixed(1)} ${c.y}) scale(${c.s})`); });
        if (S.wash) {
          const k = (Math.sin(t * Math.PI * 2 / 7) + 1) / 2;
          S.wash.setAttribute('transform', `translate(${(Math.sin(t * .4) * 10).toFixed(1)} ${(446 + k * 110).toFixed(1)})`);
          S.wet.setAttribute('opacity', (.25 + k * .5).toFixed(2));
          if (k > .9 && washWas <= .9) A.noise({ type: 'lowpass', from: 900, to: 300, dur: 1.6, vol: .05 });
          washWas = k;
        }
      });

      buildArea(AREAS[areaIdx = Math.floor(Math.random() * 3)]);
      ctx.after(350, greet);
      ctx.hint = () => {
        if (party || !S) return null;
        const c = S.C.find(q => !q.bonus && !found.has(q.id)) || pick(S.C);
        return c.hint();
      };
    }
  };
  TOYS.push(seaToy);
})();
