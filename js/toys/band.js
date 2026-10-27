'use strict';
/* =========================================================
   toy 3: どうぶつ おんがくたい — five friends with instruments, ぽわん
   conducts. Three songs rotate (each with its own stage look), spotlights
   sweep while they play, and the audience claps when you tap them.
   ========================================================= */
const band = (() => {
  const INK = '#3a2f5b';
  // note letters → MIDI (C pentatonic; lowercase = an octave up)
  const LET = { C: 60, D: 62, E: 64, G: 67, A: 69, c: 72, d: 74, e: 76, g: 79, a: 81 };
  const SONGS = [
    { // a little march
      tune: 'CDE-EGE-DEDC----EGA-GAG-EDEGE---CDE-EGE-DEDCD---EDCDEGAGE-D-C---', ms: 240,
      top: '#3b2a6e', bot: '#6a4a9e', flags: ['#ffd56b', '#7fdcc0', '#ff8fa3', '#8fb8ff'], deco: 'star'
    },
    { // a gentle sway
      tune: 'G-E-G-A-G-E-D---E-G-A-c-A-G-E---G-A-c-d-c-A-G-E-D-E-G-E-D-C-----', ms: 230,
      top: '#ff8a6b', bot: '#ffc38a', flags: ['#fff3b0', '#ff7a8a', '#c9a7ff', '#7fdcc0'], deco: 'heart'
    },
    { // a hoppy one
      tune: 'CEGcGECEGAGE-D--DEGAGEDEGcAG----cAGEGAGEDCDEC-G-c---', ms: 210,
      top: '#1f4f8a', bot: '#4a9ad0', flags: ['#ffd56b', '#ff9ec4', '#9be08a', '#fff'], deco: 'bubble'
    }
  ];
  const PAW = { cat: '#ffa95c', chick: '#ffd23f', dog: '#c48a50', frog: '#6cc45a', bunny: '#ffe6ee' };
  const CRY = { cat: () => A.animal('cat'), chick: () => A.animal('bird', { vol: .7 }), dog: () => A.animal('dog'), frog: () => A.animal('frog'), bunny: () => A.sfx('kiss', { vol: .7 }) };

  /* instrument sounds (all pitched notes stay pentatonic) */
  const SND = {
    drum(m, soft) {
      const f = mtof(m - 24), v = soft ? .6 : 1;
      A.osc(f, { slide: f * .55, slideT: .16, a: .002, r: .26, vol: .3 * v, wet: .08 });
      A.noise({ type: 'bandpass', from: 1900, q: .8, dur: .07, vol: .13 * v, wet: 0 });
    },
    snare(soft) { A.noise({ type: 'highpass', from: 2400, dur: .11, vol: (soft ? .07 : .12), wet: .05 }); A.osc(210, { slide: 150, slideT: .06, r: .07, vol: .08, wet: 0 }); },
    xylo(m, soft) {
      const f = mtof(m + 12), v = soft ? .7 : 1;
      A.osc(f, { a: .002, r: .55, vol: .17 * v, wet: .3 });
      A.osc(f * 3.98, { a: .001, r: .07, vol: .05 * v, wet: 0 });
      A.noise({ type: 'bandpass', from: f * 2, q: 4, dur: .03, vol: .05 * v, wet: 0 });
    },
    trumpet(m, soft) {
      const f = mtof(m), v = soft ? .75 : 1;
      A.osc(f, { type: 'sawtooth', lp: 1700, a: .035, hold: .16, r: .2, vol: .085 * v, vib: 5.5, vibD: .012, wet: .25 });
      A.osc(f, { type: 'square', lp: 900, a: .05, hold: .14, r: .16, vol: .035 * v, wet: .2 });
    },
    maracas(m, soft) {
      const v = soft ? .55 : 1;
      A.noise({ type: 'highpass', from: 5200, dur: .08, vol: .11 * v, wet: 0 });
      A.noise({ type: 'highpass', from: 6000, dur: .07, vol: .08 * v, when: .09, wet: 0 });
      if (!soft) A.pluck(mtof(m), { vol: .07, r: .25 });
    },
    piano(m, soft) {
      const f = mtof(m), v = soft ? .75 : 1;
      A.osc(f, { type: 'triangle', a: .003, r: 1, vol: .16 * v, wet: .35 });
      A.osc(f * 2, { a: .003, r: .4, vol: .05 * v, wet: .3 });
      A.osc(f * 3, { a: .002, r: .14, vol: .02 * v, wet: 0 });
    }
  };

  /* instruments drawn in the friends' paws (animal-local coordinates) */
  function paws(g, kind, pts) { pts.forEach(([x, y]) => { el('ellipse', { cx: x, cy: y, rx: 11, ry: 9, fill: PAW[kind] }, g); el('ellipse', { cx: x - 2, cy: y - 3, rx: 4, ry: 2.5, fill: '#fff', opacity: .35 }, g); }); }
  const INSTR = {
    drum(g, kind) {
      const d = el('g', { class: 'tb' }, g);
      el('rect', { x: -42, y: 64, width: 84, height: 42, rx: 8, fill: '#ff7a8a' }, d);
      el('path', { d: 'M-42,70 L-28,100 L-14,70 L0,100 L14,70 L28,100 L42,70', stroke: '#ffd56b', 'stroke-width': 4, fill: 'none', 'stroke-linejoin': 'round' }, d);
      el('rect', { x: -44, y: 100, width: 88, height: 8, rx: 4, fill: '#e2475f' }, d);
      el('ellipse', { cx: 0, cy: 64, rx: 44, ry: 13, fill: '#fff6e8', stroke: '#e2475f', 'stroke-width': 3 }, d);
      const flash = el('ellipse', { cx: 0, cy: 64, rx: 40, ry: 11, fill: '#fff', opacity: 0 }, d);
      el('ellipse', { cx: -26, cy: 82, rx: 6, ry: 10, fill: '#fff', opacity: .3 }, d);
      const sl = el('g', { class: 'tb', style: 'transform-origin:0% 0%' }, g), sr = el('g', { class: 'tb', style: 'transform-origin:100% 0%' }, g);
      el('path', { d: 'M-34,30 L-12,60', stroke: '#c98f5f', 'stroke-width': 5, 'stroke-linecap': 'round' }, sl); el('circle', { cx: -12, cy: 60, r: 5, fill: '#fff' }, sl);
      el('path', { d: 'M34,30 L12,60', stroke: '#c98f5f', 'stroke-width': 5, 'stroke-linecap': 'round' }, sr); el('circle', { cx: 12, cy: 60, r: 5, fill: '#fff' }, sr);
      paws(g, kind, [[-36, 32], [36, 32]]);
      let side = 0;
      return () => {
        const s = side++ % 2 ? sr : sl;
        s.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${s === sl ? -22 : 22}deg)` }, { transform: 'rotate(0deg)' }], { duration: 180 });
        flash.animate([{ opacity: .9 }, { opacity: 0 }], { duration: 260 });
        d.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06,.94)' }, { transform: 'scale(1)' }], { duration: 200 });
        return [0, 60];
      };
    },
    xylo(g, kind) {
      const bars = [];
      el('rect', { x: -54, y: 62, width: 108, height: 7, rx: 3, fill: '#a3714a' }, g);
      el('rect', { x: -54, y: 92, width: 108, height: 7, rx: 3, fill: '#a3714a' }, g);
      PARTY.slice(0, 5).forEach((c, i) => {
        const h = 46 - i * 5, x = -50 + i * 21;
        const b = el('rect', { x, y: 58 + (46 - h) / 2, width: 17, height: h, rx: 5, fill: c, class: 'tb' }, g);
        el('circle', { cx: x + 8.5, cy: 62 + (46 - h) / 2, r: 2, fill: '#fff', opacity: .7 }, g);
        bars.push(b);
      });
      const mal = el('g', { class: 'tb', style: 'transform-origin:100% 100%' }, g);
      el('path', { d: 'M40,34 L14,60', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }, mal);
      el('circle', { cx: 12, cy: 62, r: 7, fill: '#ff7a8a' }, mal);
      paws(g, kind, [[-40, 36], [42, 34]]);
      return m => {
        const i = clamp(PENTA.indexOf(m) % 5, 0, 4);
        bars[i].animate([{ transform: 'scale(1)', filter: 'brightness(1.4)' }, { transform: 'scale(.92,1.08)' }, { transform: 'scale(1)' }], { duration: 240 });
        mal.animate([{ transform: 'rotate(0deg) translateX(0px)' }, { transform: `rotate(-18deg) translateX(${-(4 - i) * 10}px)` }, { transform: 'rotate(0deg)' }], { duration: 220 });
        return [-40 + i * 21, 60];
      };
    },
    trumpet(g, kind) {
      const t = el('g', { class: 'tb', style: 'transform-origin:0% 50%' }, g);
      el('path', { d: 'M4,30 L54,4', stroke: '#f5b83d', 'stroke-width': 10, 'stroke-linecap': 'round' }, t);
      el('path', { d: 'M18,34 Q36,36 48,20', stroke: '#f5b83d', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, t);
      [22, 32, 42].forEach(x => el('rect', { x: x - 3.5, y: 4 + (54 - x) * .5, width: 7, height: 13, rx: 3.5, fill: '#ffd56b' }, t));
      const bell = el('path', { d: 'M50,6 L76,-20 Q86,2 80,22 Z', fill: '#ffd56b', class: 'tb', style: 'transform-origin:0% 50%' }, t);
      el('ellipse', { cx: 78, cy: 1, rx: 5, ry: 20, fill: '#f5b83d', transform: 'rotate(-12 78 1)' }, t);
      el('path', { d: 'M56,2 L72,-12', stroke: '#fff', 'stroke-width': 3, opacity: .6, 'stroke-linecap': 'round' }, t);
      paws(g, kind, [[16, 36], [40, 30]]);
      return () => {
        bell.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 260 });
        t.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-7deg)' }, { transform: 'rotate(0deg)' }], { duration: 260 });
        return [80, -4];
      };
    },
    maracas(g, kind) {
      const mk = (x, c) => {
        const m = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, g);
        el('rect', { x: x - 4, y: -6, width: 8, height: 34, rx: 4, fill: '#c98f5f' }, m);
        el('ellipse', { cx: x, cy: -22, rx: 17, ry: 21, fill: c }, m);
        el('path', { d: `M${x - 15},-24 Q${x},-16 ${x + 15},-24`, stroke: '#fff', 'stroke-width': 4, fill: 'none', opacity: .7 }, m);
        el('ellipse', { cx: x - 6, cy: -32, rx: 5, ry: 3.5, fill: '#fff', opacity: .5 }, m);
        return m;
      };
      const a = mk(-58, '#ff8fa3'), b = mk(58, '#ffd56b');
      paws(g, kind, [[-58, 30], [58, 30]]);
      return () => {
        [a, b].forEach((m, i) => m.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${i ? 18 : -18}deg)` }, { transform: `rotate(${i ? -12 : 12}deg)` }, { transform: 'rotate(0deg)' }], { duration: 260 }));
        return [pick([-58, 58]), -40];
      };
    },
    piano(g, kind) {
      const p = el('g', {}, g);
      el('rect', { x: -60, y: 52, width: 120, height: 52, rx: 12, fill: '#ff9ec4' }, p);
      el('rect', { x: -60, y: 96, width: 120, height: 10, rx: 5, fill: '#ff7aa2' }, p);
      el('ellipse', { cx: -38, cy: 60, rx: 12, ry: 3, fill: '#fff', opacity: .45 }, p);
      const keys = [];
      for (let i = 0; i < 7; i++) keys.push(el('rect', { x: -52 + i * 15, y: 64, width: 13, height: 30, rx: 3, fill: '#fff', class: 'tb', style: 'transform-origin:50% 0%' }, p));
      [0, 1, 3, 4, 5].forEach(i => el('rect', { x: -42 + i * 15, y: 64, width: 8, height: 17, rx: 2, fill: INK }, p));
      paws(g, kind, [[-26, 62], [26, 62]]);
      return m => {
        const i = clamp(PENTA.indexOf(m) % 7, 0, 6);
        keys[i].animate([{ transform: 'scaleY(1)', fill: '#fff' }, { transform: 'scaleY(.86)', fill: '#ffe27a' }, { transform: 'scaleY(1)', fill: '#fff' }], { duration: 260 });
        return [-45 + i * 15, 60];
      };
    }
  };
  // the band: back row on the riser, front row on the floor
  const BAND = [
    { kind: 'cat', ins: 'drum', x: 80, y: 286, s: 1, foot: 110, notes: [60, 62, 64, 67] },
    { kind: 'chick', ins: 'xylo', x: 200, y: 280, s: 1, foot: 102, notes: [72, 74, 76, 79, 81] },
    { kind: 'dog', ins: 'trumpet', x: 308, y: 288, s: 1, foot: 66, notes: [67, 69, 72, 74, 76] },
    { kind: 'frog', ins: 'maracas', x: 116, y: 494, s: 1.16, foot: 66, notes: [64, 67, 69, 72] },
    { kind: 'bunny', ins: 'piano', x: 286, y: 488, s: 1.14, foot: 108, notes: [60, 62, 64, 67, 69, 72, 74] }
  ];

  return {
    id: 'band', name: 'おんがくたい', color: '#ff9ec4',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#5b3f8f' }, g);
      el('path', { d: 'M-60,-80 L-20,60 L20,60 L60,-80Z', fill: '#fff6c8', opacity: .18 }, g);
      el('rect', { x: -80, y: 40, width: 160, height: 50, fill: '#d99a5b' }, g);
      const a = makeAnimal('chick', g, 0, 4, .62);
      INSTR.xylo(a.body, 'chick');
      a.mouth(true);
      el('text', { x: -60, y: -36, 'font-size': 30, fill: '#ffd56b' }, g).textContent = '♪';
      el('text', { x: 40, y: -46, 'font-size': 24, fill: '#7fdcc0' }, g).textContent = '♫';
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      const grad = (id, stops, o = { x1: 0, y1: 0, x2: 0, y2: 1 }) => { const gr = el('linearGradient', { id, ...o }, defs); stops.forEach(([of, c, op = 1]) => el('stop', { offset: of, 'stop-color': c, 'stop-opacity': op }, gr)); return gr; };
      const bgGrad = grad('band-stagebg', [[0, SONGS[0].top], [1, SONGS[0].bot]]);
      const spotStops = [0, 1, 2].map(i => grad('band-spot' + i, [[0, '#fff8d8', .7], [1, '#fff8d8', 0]]).children);
      const LIVE = ['#ffd56b', '#ff9ec4', '#8fd3ff'];
      grad('band-floor', [[0, '#e3a66a'], [1, '#c98a50']]);
      grad('band-pit', [[0, '#2a1f4a'], [1, '#1a1433']]);
      grad('band-curtain', [[0, '#c93650'], [.5, '#e8566e'], [1, '#c93650']], { x1: 0, y1: 0, x2: 1, y2: 0 });

      /* far: backdrop, twinkles and decorations */
      const back = el('rect', { x: -800, y: -900, width: 2000, height: 1460, fill: 'url(#band-stagebg)' }, svg);
      const deco = el('g', {}, svg);
      const tw = el('g', {}, svg);
      for (let i = 0; i < 16; i++) el('circle', { cx: rand(30, 370).toFixed(0), cy: rand(70, 250).toFixed(0), r: rand(1.2, 2.8).toFixed(1), fill: '#fff', class: 'twinkle', style: `animation-delay:${rand(0, 2.4).toFixed(1)}s` }, tw);
      function drawDeco(song) {
        deco.replaceChildren();
        // bunting
        const fl = el('path', { d: 'M20,74 Q200,118 380,74', stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: .6 }, deco);
        for (let i = 0; i < 11; i++) {
          const t = (i + .5) / 11, x = 20 + 360 * t, y = 74 + Math.sin(t * Math.PI) * 22;
          const f = el('path', { d: `M${x - 11},${y} L${x + 11},${y} L${x},${y + 22}Z`, fill: song.flags[i % 4], class: 'tb', style: 'transform-origin:50% 0%' }, deco);
          f.animate([{ transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }], { duration: 1400 + i * 90, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        }
        // backdrop shapes per song
        for (let i = 0; i < 6; i++) {
          const x = 50 + i * 60 + rand(-10, 10), y = 150 + (i % 2) * 70 + rand(-10, 10), s = rand(.7, 1.1);
          const g = el('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})`, opacity: .28 }, deco);
          const gi = el('g', { class: 'float' }, g); gi.style.animationDelay = `-${i * .6}s`;
          if (song.deco === 'star') el('path', { d: 'M0,-16 L4,-5 L16,-5 L6,2 L10,14 L0,7 L-10,14 L-6,2 L-16,-5 L-4,-5Z', fill: '#ffd56b' }, gi);
          else if (song.deco === 'heart') el('path', { d: 'M0,12 C-18,0 -14,-16 0,-7 C14,-16 18,0 0,12Z', fill: '#fff' }, gi);
          else { el('circle', { r: 14, fill: 'none', stroke: '#fff', 'stroke-width': 3 }, gi); el('circle', { cx: -5, cy: -5, r: 3, fill: '#fff' }, gi); }
        }
      }

      /* spotlights (sweep slowly, brighter while playing) */
      const spotG = el('g', { 'pointer-events': 'none' }, svg);
      const spots = [60, 200, 340].map((x, i) => {
        const p = el('path', { d: `M${x - 8},-30 L${x + 8},-30 L${x + 90},560 L${x - 90},560Z`, fill: `url(#band-spot${i})`, opacity: .35 }, spotG);
        return { p, x, ph: i * 2.1 };
      });

      /* stage: riser, floor, curtains */
      el('path', { d: 'M-800,440 L1200,440 L1200,1700 L-800,1700Z', fill: 'url(#band-floor)' }, svg);
      [480, 530, 590].forEach(y => el('rect', { x: -800, y, width: 2000, height: 3, fill: '#c4864a', opacity: .7 }, svg));
      el('rect', { x: -800, y: 432, width: 2000, height: 12, fill: '#b9783f' }, svg);
      el('rect', { x: 8, y: 372, width: 384, height: 40, rx: 10, fill: '#b9783f', filter: 'url(#soft)' }, svg);
      el('rect', { x: 8, y: 372, width: 384, height: 8, rx: 4, fill: '#d99a5b' }, svg);
      el('rect', { x: 30, y: 384, width: 120, height: 4, rx: 2, fill: '#fff', opacity: .25 }, svg);
      const curL = el('g', { class: 'tb', style: 'transform-origin:0% 0%' }, svg), curR = el('g', { class: 'tb', style: 'transform-origin:100% 0%' }, svg);
      el('path', { d: 'M-800,-900 L36,-900 L36,-20 Q14,200 42,440 Q8,540 -800,620Z', fill: 'url(#band-curtain)' }, curL);
      el('path', { d: 'M1200,-900 L364,-900 L364,-20 Q386,200 358,440 Q392,540 1200,620Z', fill: 'url(#band-curtain)' }, curR);
      [curL, curR].forEach((c, i) => c.animate([{ transform: 'skewX(0deg)' }, { transform: `skewX(${i ? -1 : 1}deg)` }], { duration: 3000 + i * 500, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }));
      let sc = 'M-800,-900 L1200,-900 L1200,28';
      for (let x = 400; x >= 0; x -= 50) sc += ` Q${x + 25},64 ${x},28`;
      el('path', { d: sc + ' L-800,28Z', fill: '#c93650' }, svg);
      for (let x = 25; x < 400; x += 50) el('circle', { cx: x, cy: 50, r: 5, fill: '#ffd56b' }, svg);

      /* the friends */
      const floorLights = BAND.map(b => el('ellipse', { cx: b.x, cy: b.y + (b.foot + 4) * b.s, rx: 70, ry: 16, fill: '#fff6c8', opacity: .2 }, svg));
      BAND.forEach(b => el('ellipse', { cx: b.x, cy: b.y + (b.foot + 2) * b.s, rx: 50, ry: 8, fill: INK, opacity: .2 }, svg));
      const friends = BAND.map((b, i) => {
        const a = makeAnimal(b.kind, svg, b.x, b.y, b.s);
        a.float(true, i * .7);
        const hit = INSTR[b.ins](a.body, b.kind);
        a.body.prepend(el('ellipse', { cx: 0, cy: 10, rx: 70, ry: 92, fill: 'transparent' }));
        a.outer.style.cursor = 'pointer';
        const shut = a.body.querySelector('g[style="display:none"]');
        const eyes = shut && shut.previousElementSibling;
        return { a, b, hit, eyes, n: 0, cry: Math.floor(rand(3, 5)) };
      });
      const notes = el('g', { 'pointer-events': 'none' }, svg);
      const ghost = ctx.ghost(svg, { x: 200, y: 150, s: .78, baton: true });

      /* audience */
      const aud = el('g', { style: 'cursor:pointer' }, svg);
      el('rect', { x: -800, y: 628, width: 2000, height: 1000, fill: 'url(#band-pit)' }, aud);
      el('rect', { x: -800, y: 620, width: 2000, height: 10, fill: '#b9783f' }, aud);
      const FANS = ['#ffb066', '#fff4f7', '#d9a066', '#7fd36b', '#ffe066', '#b9824f', '#c9a7ff', '#8fd3ff'];
      const fans = [];
      for (let i = 0; i < 8; i++) {
        const row = i % 2, x = 30 + i * 49, y = 700 + row * 26;
        const o = el('g', { transform: `translate(${x} ${y})` }, aud);
        const f = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, o);
        const c = FANS[i];
        if (i % 3 === 0) [-16, 16].forEach(dx => el('path', { d: `M${dx - 9},-18 L${dx},-40 L${dx + 9},-18Z`, fill: c }, f));
        else if (i % 3 === 1) [-14, 14].forEach(dx => el('circle', { cx: dx, cy: -26, r: 9, fill: c }, f));
        else [-9, 9].forEach(dx => el('ellipse', { cx: dx, cy: -40, rx: 6, ry: 16, fill: c }, f));
        el('circle', { cx: 0, cy: 0, r: 26, fill: c }, f);
        el('rect', { x: -26, y: 8, width: 52, height: 50, rx: 18, fill: c }, f);
        const hands = el('g', { opacity: 0 }, f);
        [-1, 1].forEach(d => el('circle', { cx: d * 26, cy: -18, r: 7, fill: c, stroke: INK, 'stroke-width': 1.5, 'stroke-opacity': .2 }, hands));
        [-8, 8].forEach(dx => el('circle', { cx: dx, cy: -4, r: 3.4, fill: INK }, f));
        el('path', { d: 'M-5,6 Q0,10 5,6', stroke: INK, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, f);
        fans.push({ f, hands, x, y });
      }
      function cheerFans(big) {
        fans.forEach((fn, i) => {
          if (!big && Math.random() < .3) return;
          ctx.after(i * 40, () => {
            fn.f.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(-16px) scale(.94,1.08)' }, { transform: 'translateY(0px) scale(1.06,.94)' }, { transform: 'translateY(0px) scale(1)' }], { duration: 420, easing: 'ease-out' });
            fn.hands.animate([{ opacity: 1 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: 700 });
          });
        });
      }
      aud.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        const p = ctx.point(e);
        A.sfx('applause', { rate: rand(.95, 1.1), vol: .5 }) || A.noise({ type: 'highpass', from: 3000, dur: .5, vol: .1 });
        cheerFans(true);
        for (let i = 0; i < 3; i++) heart(p.x + rand(-30, 30), p.y - 30);
      });
      function heart(x, y) {
        const g = el('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})`, 'pointer-events': 'none' }, notes);
        const h = el('path', { d: 'M0,10 C-16,0 -12,-14 0,-6 C12,-14 16,0 0,10Z', fill: pick(['#ff7a8a', '#ff9ec4', '#ffd56b']), class: 'tb' }, g);
        h.animate([{ transform: 'translate(0px,0px) scale(.3)', opacity: 1 }, { transform: `translate(${rand(-30, 30).toFixed(0)}px,-90px) scale(1.1)`, opacity: 0 }], { duration: 1000, easing: 'ease-out' }).onfinish = () => g.remove();
      }

      /* playing */
      let songIdx = 0, playing = false, finale = false, step = 0, taps = 0, special = /[?&]disco\b/.test(location.search) /* test hook */, disco = null, lastTouch = [200, 400];
      function flyNote(x, y, c) {
        const g = el('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})` }, notes);
        const t = el('text', { 'text-anchor': 'middle', 'font-size': 42, 'font-weight': 700, fill: c, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke', class: 'tb' }, g);
        t.textContent = pick(['♪', '♫', '♪']);
        t.animate([{ transform: 'translate(0px,0px) scale(.4) rotate(0deg)', opacity: 1 }, { transform: `translate(${rand(-20, 20).toFixed(0)}px,-50px) scale(1.15) rotate(${rand(-15, 15).toFixed(0)}deg)`, opacity: 1, offset: .5 },
          { transform: `translate(${rand(-50, 50).toFixed(0)}px,-120px) scale(1.2) rotate(${rand(-30, 30).toFixed(0)}deg)`, opacity: 0 }], { duration: 1300, easing: 'ease-out' }).onfinish = () => g.remove();
      }
      function play(i, m, soft) {
        const F = friends[i], b = F.b;
        if (m == null) m = b.notes[F.n % b.notes.length];
        SND[b.ins](m, soft);
        const [nx, ny] = F.hit(m);
        if (!soft) F.a.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14,.86)' }, { transform: 'scale(.9,1.1)' }, { transform: 'scale(1.03,.97)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
        else F.a.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06,.94)' }, { transform: 'scale(1)' }], { duration: 220 });
        F.a.mouth(true); ctx.after(soft ? 180 : 320, () => F.a.mouth(false));
        floorLights[i].animate([{ opacity: .75 }, { opacity: .2 }], { duration: 500 });
        flyNote(b.x + nx * b.s, b.y + ny * b.s - 10, PARTY[i]);
      }
      function tapFriend(i) {
        const F = friends[i];
        haptic();
        play(i);
        F.n++;
        ctx.sparkle(F.b.x, F.b.y - 40, 3, 40, PARTY[i]);
        // a comic interjection now and then: the friend's real voice
        if (--F.cry <= 0) {
          F.cry = Math.floor(rand(4, 7));
          ctx.after(260, () => {
            CRY[F.b.kind]();
            F.a.sleep(true); F.a.mouth(true);
            F.a.body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-10deg) scale(1.1)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0deg)' }], { duration: 520 });
            ctx.after(520, () => { F.a.sleep(false); F.a.mouth(false); });
          });
        }
        if (!playing && !finale && ++taps >= 7) { taps = 0; ctx.after(700, () => { if (!playing && !finale) startSong(); }); }
      }
      friends.forEach((F, i) => F.a.outer.addEventListener('pointerdown', e => { e.stopPropagation(); tapFriend(i); }));

      function startSong() {
        playing = true; step = 0; taps = 0;
        ghost.set('happy'); ghost.talk('みんなで うたおう！');
        ghost.hop();
        A.sfx('drumroll', { vol: .45 });
        if (special) dropDisco();
        ctx.after(1100, tick);
      }
      function tick() {
        if (!playing) return;
        const song = SONGS[songIdx], ch = song.tune[step];
        const phrase = Math.floor(step / 16) % 3, lead = [1, 4, 2][phrase];
        if (ch && ch !== '-') play(lead, LET[ch], false);
        if (step % 4 === 0) play(0, step % 8 === 0 ? 60 : 67, true);
        else if (step % 4 === 2) { SND.snare(true); friends[0].hit(); }
        if (step % 2 === 1) play(3, 64, true);
        if (step % 2 === 0) ghost.swing(36, 220);
        if (step % 4 === 0) { fans.forEach((fn, i) => fn.f.animate([{ transform: 'translateY(0px)' }, { transform: `translateY(${-(4 + (i % 3) * 2)}px)` }, { transform: 'translateY(0px)' }], { duration: song.ms * 2 })); }
        step++;
        if (step >= song.tune.length) { playing = false; ctx.after(250, celebrate); return; }
        ctx.after(song.ms, tick);
      }
      function celebrate() {
        finale = true;
        A.tada();
        ctx.confetti(200, 300, 36); ctx.after(500, () => ctx.confetti(200, 260, 36));
        A.sfx('applause', { when: .3, vol: .5 });
        cheerFans(true); ctx.after(900, () => cheerFans(true));
        ghost.set('happy'); ghost.talk('じょうずー！');
        ghost.giggle();
        ctx.tween(1200, k => ghost.place(200 + Math.sin(k * Math.PI * 2) * 80, 150 - Math.sin(k * Math.PI) * 40, .78 + Math.sin(k * Math.PI) * .12), () => ghost.hop());
        friends.forEach((F, i) => ctx.after(i * 110, () => {
          F.a.body.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(-34px) scale(.9,1.12)' }, { transform: 'translateY(0px) scale(1.12,.88)' }, { transform: 'translateY(0px) scale(1)' }], { duration: 520, easing: 'ease-out' });
          F.a.mouth(true); ctx.after(600, () => F.a.mouth(false));
        }));
        // two friends can't help shouting
        ctx.after(1500, () => CRY.dog());
        ctx.after(1900, () => CRY.cat());
        ctx.after(2900, nextSong);
      }
      function nextSong() {
        songIdx = (songIdx + 1) % SONGS.length;
        special = Math.random() < 1 / 6;
        if (disco) { const d = disco; disco = null; ctx.tween(500, k => d.setAttribute('transform', `translate(200 ${(-10 - k * 140).toFixed(0)})`), () => d.remove()); }
        setLook(songIdx, true);
        ghost.set('normal');
        finale = false;
      }
      function setLook(i, anim) {
        const s = SONGS[i];
        const stops = bgGrad.children;
        stops[0].setAttribute('stop-color', s.top); stops[1].setAttribute('stop-color', s.bot);
        drawDeco(s);
        if (anim) {
          back.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 600 });
          deco.animate([{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'translateY(0px)' }], { duration: 600, easing: 'ease-out' });
          A.sfx('slide', { vol: .4, rate: 1.1 }) || A.whoosh();
          friends.forEach((F, j) => ctx.after(j * 80, () => F.a.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.9)' }, { transform: 'scale(1)' }], { duration: 300 })));
        }
      }
      function dropDisco() {
        const d = el('g', { transform: 'translate(200 -150)', 'pointer-events': 'none' }, svg);
        el('path', { d: 'M0,-200 L0,-26', stroke: '#ddd', 'stroke-width': 2 }, d);
        const ball = el('g', {}, d);
        el('circle', { r: 26, fill: '#d8e4ff' }, ball);
        for (let y = -20; y <= 20; y += 10) el('path', { d: `M${-Math.sqrt(676 - y * y).toFixed(1)},${y} L${Math.sqrt(676 - y * y).toFixed(1)},${y}`, stroke: '#9aa8d8', 'stroke-width': 1.5 }, ball);
        for (let x = -16; x <= 16; x += 10) el('path', { d: `M${x},-25 Q${x * 1.4},0 ${x},25`, stroke: '#9aa8d8', 'stroke-width': 1.5, fill: 'none' }, ball);
        el('ellipse', { cx: -9, cy: -10, rx: 7, ry: 4, fill: '#fff', opacity: .9 }, ball);
        ball.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 3000, iterations: Infinity });
        disco = d;
        A.sfx('sleigh', { vol: .5 });
        ctx.tween(800, k => d.setAttribute('transform', `translate(200 ${(-150 + k * 210).toFixed(0)})`), null, easeBack);
      }
      ghost.pos.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        if (playing || finale) { ghost.giggle(); ghost.hop(); return; }
        startSong();
      });
      ghost.pos.style.cursor = 'pointer';
      // background taps: a star twinkles and a soft chime
      ctx.on(svg, 'pointerdown', e => {
        const p = ctx.point(e);
        lastTouch = [p.x, p.y];
        const g = el('g', { transform: `translate(${p.x.toFixed(0)} ${p.y.toFixed(0)})`, 'pointer-events': 'none' }, notes);
        const s = el('path', { d: 'M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z', fill: pick(['#ffd56b', '#fff', '#ff9ec4']), class: 'tb' }, g);
        s.animate([{ transform: 'scale(0) rotate(0deg)' }, { transform: 'scale(1.3) rotate(60deg)', offset: .4 }, { transform: 'scale(0) rotate(120deg)' }], { duration: 700 }).onfinish = () => g.remove();
        A.bell(mtof(pick(PENTA) + 12), { vol: .06 });
      });
      ctx.on(svg, 'pointerdown', e => { const p = ctx.point(e); lastTouch = [p.x, p.y]; }, true);

      /* ambient: spotlights sweep, eyes follow the finger, random blinks */
      ctx.loop((dt, t) => {
        const live = playing || finale;
        spots.forEach((s, i) => {
          const a = Math.sin(t * (live ? 1.6 : .45) + s.ph) * (live ? 24 : 12);
          s.p.setAttribute('transform', `rotate(${a.toFixed(1)} ${s.x} -30)`);
          s.p.setAttribute('opacity', (live ? .55 + .15 * Math.sin(t * 6 + i) : .28).toFixed(2));
        });
        spotStops.forEach((st, i) => {
          const sc = disco ? `hsl(${((t * 140 + i * 120) % 360).toFixed(0)},100%,78%)` : live ? LIVE[i] : '#fff8d8';
          if (st[0].getAttribute('stop-color') !== sc) { st[0].setAttribute('stop-color', sc); st[1].setAttribute('stop-color', sc); }
        });
        friends.forEach(F => {
          if (!F.eyes) return;
          const dx = clamp((lastTouch[0] - F.b.x) / 40, -4, 4), dy = clamp((lastTouch[1] - F.b.y) / 60, -3, 3);
          F.ex = (F.ex || 0) + (dx - (F.ex || 0)) * Math.min(1, dt * 6);
          F.ey = (F.ey || 0) + (dy - (F.ey || 0)) * Math.min(1, dt * 6);
          F.eyes.setAttribute('transform', `translate(${F.ex.toFixed(1)} ${F.ey.toFixed(1)})`);
        });
      });
      friends.forEach(F => {
        const blink = () => { if (!F.a.outer.isConnected) return; F.a.sleep(true); ctx.after(130, () => F.a.sleep(false)); ctx.after(rand(2000, 5000), blink); };
        ctx.after(rand(800, 4000), blink);
      });

      setLook(0, false);
      ctx.after(500, () => { ghost.set('happy'); ghost.talk('タッチで うたうよ！'); ctx.after(1500, () => ghost.set('normal')); });
      let hinted = 0;
      ctx.hint = () => (playing || finale) ? null : (hinted++ % 2 ? [200, 150] : [BAND[1].x, BAND[1].y]);
    }
  };
})();
TOYS.push(band);
