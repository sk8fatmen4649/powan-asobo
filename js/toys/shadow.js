'use strict';
/* =========================================================
   toy: だーれだ — guess the shadow. Three stages rotate per round:
   a theater, a forest at night with a lantern, and a circus tent.
   ========================================================= */
(() => {
  const INK = '#2e2650';
  /* extra friends, drawn like core's ANIMALS: head about 100 wide, returns { open, shut, mc, mo } */
  const DRAW = {
    elephant(g) {
      [-1, 1].forEach(d => {
        el('ellipse', { cx: d * 54, cy: -6, rx: 32, ry: 42, fill: '#9fb3d9' }, g);
        el('ellipse', { cx: d * 56, cy: -4, rx: 19, ry: 28, fill: '#ffc4d6' }, g);
      });
      el('ellipse', { cx: 0, cy: 50, rx: 36, ry: 18, fill: '#a9bce0' }, g);
      el('ellipse', { cx: 0, cy: -4, rx: 46, ry: 46, fill: '#b3c5e8' }, g);
      el('ellipse', { cx: -18, cy: -32, rx: 13, ry: 6, fill: '#fff', opacity: .45, transform: 'rotate(-25 -18 -32)' }, g);
      const e = eyePair(g, 19, -14); cheeks(g, 33, 6);
      el('path', { d: 'M-2,0 Q-6,40 -3,60 Q2,82 20,78 Q30,74 29,64', stroke: '#b3c5e8', 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round', 'data-sh': 1 }, g);
      el('path', { d: 'M-12,28 L3,28 M-12,42 L4,42 M-10,56 L5,56', stroke: '#93a6cf', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
      el('path', { d: 'M14,18 Q20,25 27,18', stroke: '#5a5f8a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, mc);
      el('ellipse', { cx: 21, cy: 22, rx: 7, ry: 8, fill: '#c2405a' }, mo);
      return { ...e, mc, mo };
    },
    lion(g) {
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2;
        el('circle', { cx: (Math.cos(a) * 50).toFixed(1), cy: (Math.sin(a) * 50).toFixed(1), r: 22, fill: i % 2 ? '#e8893a' : '#f09a45' }, g);
      }
      el('circle', { r: 54, fill: '#e8893a' }, g);
      [-1, 1].forEach(d => { el('circle', { cx: d * 32, cy: -36, r: 12, fill: '#ffc95e' }, g); el('circle', { cx: d * 32, cy: -36, r: 6, fill: '#ffa95c' }, g); });
      el('circle', { r: 42, fill: '#ffc95e' }, g);
      el('ellipse', { cx: -16, cy: -26, rx: 11, ry: 5, fill: '#fff', opacity: .45, transform: 'rotate(-25 -16 -26)' }, g);
      const e = eyePair(g, 17, -8); cheeks(g, 29, 12);
      [-1, 1].forEach(d => el('ellipse', { cx: d * 9, cy: 17, rx: 12, ry: 9, fill: '#fff0cc' }, g));
      el('path', { d: 'M-7,6 L7,6 L0,13Z', fill: '#8a4a2a' }, g);
      const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
      el('path', { d: 'M-8,25 Q-4,29 0,25 Q4,29 8,25', stroke: '#8a4a2a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, mc);
      el('ellipse', { cx: 0, cy: 29, rx: 9, ry: 9, fill: '#c2405a' }, mo);
      return { ...e, mc, mo };
    },
    pig(g) {
      [-1, 1].forEach(d => {
        el('path', { d: `M${d * 46},-22 Q${d * 54},-66 ${d * 14},-46Z`, fill: '#ff9fb8' }, g);
        el('path', { d: `M${d * 40},-30 Q${d * 44},-54 ${d * 22},-44Z`, fill: '#ffd0dc' }, g);
      });
      el('ellipse', { cx: 0, cy: 48, rx: 36, ry: 18, fill: '#ffb6c8' }, g);
      el('path', { d: 'M34,52 q14,-4 10,-14 q-6,-6 -8,2', stroke: '#ffb6c8', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('circle', { r: 50, fill: '#ffc2d1' }, g);
      el('ellipse', { cx: -20, cy: -30, rx: 12, ry: 6, fill: '#fff', opacity: .5, transform: 'rotate(-25 -20 -30)' }, g);
      const e = eyePair(g, 20, -16); cheeks(g, 36, 8);
      el('ellipse', { cx: 0, cy: 12, rx: 22, ry: 15, fill: '#ff9fb8', 'data-sh': 1 }, g);
      [-1, 1].forEach(d => el('ellipse', { cx: d * 7, cy: 12, rx: 3.5, ry: 5, fill: '#c2607a' }, g));
      const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
      el('path', { d: 'M-8,34 Q0,40 8,34', stroke: '#c2607a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, mc);
      el('ellipse', { cx: 0, cy: 37, rx: 8, ry: 7, fill: '#c2405a' }, mo);
      return { ...e, mc, mo };
    },
    cow(g) {
      [-1, 1].forEach(d => {
        el('path', { d: `M${d * 26},-40 Q${d * 40},-58 ${d * 30},-72 Q${d * 46},-62 ${d * 38},-38Z`, fill: '#f3e1b0' }, g);
        el('ellipse', { cx: d * 56, cy: -16, rx: 21, ry: 10, fill: '#fffaf4', stroke: '#eadfd2', 'stroke-width': 2, transform: `rotate(${d * 22} ${d * 56} -16)` }, g);
        el('ellipse', { cx: d * 58, cy: -15, rx: 12, ry: 5, fill: '#ffc4c4', transform: `rotate(${d * 22} ${d * 58} -15)` }, g);
      });
      el('ellipse', { cx: 0, cy: 50, rx: 36, ry: 18, fill: '#fffaf4' }, g);
      el('ellipse', { cx: 0, cy: 0, rx: 46, ry: 50, fill: '#fffaf4', stroke: '#eadfd2', 'stroke-width': 2 }, g);
      el('path', { d: 'M-40,-26 Q-34,-46 -14,-42 Q-6,-30 -18,-20 Q-30,-12 -40,-26Z', fill: '#5a4f6e' }, g);
      el('path', { d: 'M26,-6 Q40,-14 44,2 Q40,12 30,8 Q22,4 26,-6Z', fill: '#5a4f6e' }, g);
      const e = eyePair(g, 18, -14); cheeks(g, 34, 6);
      el('ellipse', { cx: 0, cy: 27, rx: 32, ry: 19, fill: '#ffc4c4', 'data-sh': 1 }, g);
      [-1, 1].forEach(d => el('ellipse', { cx: d * 12, cy: 23, rx: 4, ry: 5.5, fill: '#c27a7a' }, g));
      el('circle', { cx: 0, cy: 64, r: 8, fill: '#ffd56b' }, g);
      const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
      el('path', { d: 'M-8,37 Q0,42 8,37', stroke: '#b05a6a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, mc);
      el('ellipse', { cx: 0, cy: 38, rx: 8, ry: 6, fill: '#c2405a' }, mo);
      return { ...e, mc, mo };
    },
    duck(g) {
      el('path', { d: 'M46,40 L74,22 L60,58Z', fill: '#fff', stroke: '#ece6f5', 'stroke-width': 2 }, g);
      el('ellipse', { cx: 10, cy: 50, rx: 48, ry: 24, fill: '#fff', stroke: '#ece6f5', 'stroke-width': 2 }, g);
      el('ellipse', { cx: 26, cy: 46, rx: 20, ry: 12, fill: '#f1ecfa', transform: 'rotate(-14 26 46)' }, g);
      el('ellipse', { cx: -6, cy: 74, rx: 12, ry: 5, fill: '#ffa23a' }, g);
      el('ellipse', { cx: 22, cy: 74, rx: 12, ry: 5, fill: '#ffa23a' }, g);
      el('circle', { cx: 0, cy: -8, r: 40, fill: '#fff', stroke: '#ece6f5', 'stroke-width': 2 }, g);
      el('path', { d: 'M2,-46 Q-2,-66 12,-64 Q6,-58 10,-50Z', fill: '#fff', stroke: '#ece6f5', 'stroke-width': 2 }, g);
      const open = el('g', {}, g), shut = el('g', { style: 'display:none' }, g);
      [-14, 14].forEach(x => {
        el('ellipse', { cx: x, cy: -16, rx: 6.5, ry: 8, fill: '#2b2340' }, open); el('circle', { cx: x - 2.4, cy: -19.5, r: 2.5, fill: '#fff' }, open);
        el('path', { d: `M${x - 8},-16 Q${x},-10 ${x + 8},-16`, stroke: '#2b2340', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, shut);
      });
      cheeks(g, 28, 0);
      const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
      el('ellipse', { cx: -36, cy: 4, rx: 30, ry: 11, fill: '#ffa23a' }, mc);
      el('path', { d: 'M-62,5 Q-36,9 -10,5', stroke: '#e0862a', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, mc);
      el('ellipse', { cx: -36, cy: 6, rx: 22, ry: 9, fill: '#c2405a' }, mo);
      el('ellipse', { cx: -36, cy: -3, rx: 30, ry: 8, fill: '#ffa23a', transform: 'rotate(8 -8 0)' }, mo);
      el('ellipse', { cx: -34, cy: 15, rx: 27, ry: 7, fill: '#ffa23a', transform: 'rotate(-10 -8 12)' }, mo);
      return { open, shut, mc, mo };
    },
    bird(g) {
      el('path', { d: 'M30,34 L70,12 Q64,30 72,46Z', fill: '#4f97dd' }, g);
      el('ellipse', { cx: -12, cy: 74, rx: 9, ry: 4, fill: '#ffa23a' }, g);
      el('ellipse', { cx: 12, cy: 74, rx: 9, ry: 4, fill: '#ffa23a' }, g);
      el('ellipse', { cx: 0, cy: 38, rx: 44, ry: 34, fill: '#6fb8f5' }, g);
      el('ellipse', { cx: -4, cy: 46, rx: 26, ry: 20, fill: '#fff4d6' }, g);
      el('ellipse', { cx: 34, cy: 34, rx: 22, ry: 13, fill: '#4f97dd', transform: 'rotate(-28 34 34)' }, g);
      el('circle', { cx: 0, cy: -10, r: 42, fill: '#82c6ff' }, g);
      el('path', { d: 'M-6,-48 Q-16,-76 2,-68 Q6,-82 16,-64 Q14,-52 6,-50Z', fill: '#4f97dd' }, g);
      el('ellipse', { cx: -18, cy: -34, rx: 12, ry: 6, fill: '#fff', opacity: .45, transform: 'rotate(-25 -18 -34)' }, g);
      const e = eyePair(g, 16, -16); cheeks(g, 28, 2);
      const mc = el('g', {}, g), mo = el('g', { style: 'display:none' }, g);
      el('path', { d: 'M-10,-2 L10,-2 L0,13Z', fill: '#ffb03a', 'stroke-linejoin': 'round' }, mc);
      el('ellipse', { cx: 0, cy: 6, rx: 7, ry: 6, fill: '#c2405a' }, mo);
      el('path', { d: 'M-11,-6 L11,-6 L0,2Z', fill: '#ffb03a' }, mo);
      el('path', { d: 'M-9,10 L9,10 L0,18Z', fill: '#ffb03a' }, mo);
      return { ...e, mc, mo };
    }
  };

  /* a cry: the real recording when present, a soft synth otherwise. o = { vol (0..1), rate } */
  const cry = (kind, synth) => (o = {}) => { const v = o.vol ?? .9; if (!A.animal(kind, { vol: v, rate: o.rate })) synth(v / .9); };
  const FRIENDS = [
    { k: 'dog', n: 'わんちゃん', snd: 'わんわん', cry: cry('dog', k => [0, .24].forEach(w => A.osc(520, { when: w, type: 'square', lp: 1600, hold: .06, r: .16, vol: .12 * k, slide: 560, slideT: .08 }))) },
    { k: 'cat', n: 'ねこちゃん', snd: 'にゃーん', cry: cry('cat', k => A.osc(720, { type: 'triangle', hold: .12, slide: 430, slideT: .38, vib: 6, r: .22, vol: .2 * k })) },
    { k: 'elephant', n: 'ぞうさん', snd: 'ぱおーん', cry: cry('elephant', k => A.osc(330, { type: 'sawtooth', lp: 1700, a: .04, slide: 700, slideT: .25, hold: .45, vib: 7, vibD: .03, r: .35, vol: .12 * k })) },
    { k: 'lion', n: 'らいおんさん', snd: 'がおー', cry: cry('lion', k => { A.osc(150, { type: 'sawtooth', lp: 700, a: .05, hold: .45, slide: 105, slideT: .6, vib: 26, vibD: .07, r: .3, vol: .2 * k }); A.noise({ type: 'lowpass', from: 500, to: 250, dur: .6, vol: .12 * k }); }) },
    { k: 'pig', n: 'ぶたさん', snd: 'ぶーぶー', cry: cry('pig', k => [0, .32].forEach(w => A.osc(170, { when: w, type: 'square', lp: 650, vib: 38, vibD: .12, hold: .12, r: .08, vol: .13 * k }))) },
    { k: 'cow', n: 'うしさん', snd: 'もー', cry: cry('cow', k => A.osc(210, { type: 'sawtooth', lp: 850, a: .1, hold: .55, slide: 165, slideT: .8, vib: 5, vibD: .02, r: .3, vol: .16 * k })) },
    { k: 'duck', n: 'あひるさん', snd: 'がーがー', cry: cry('duck', k => [0, .26].forEach(w => A.osc(520, { when: w, type: 'sawtooth', lp: 1500, hold: .07, slide: 380, slideT: .12, r: .08, vol: .12 * k }))) },
    { k: 'frog', n: 'かえるさん', snd: 'けろけろ', cry: cry('frog', k => [0, .22].forEach(w => A.osc(220, { when: w, type: 'sawtooth', lp: 900, vib: 28, vibD: .05, hold: .1, r: .16, vol: .15 * k }))) },
    { k: 'bird', n: 'ことりさん', snd: 'ちゅんちゅん', cry: cry('bird', k => [0, .14].forEach(w => A.osc(2300, { when: w, slide: 3300, slideT: .06, r: .07, vol: .12 * k }))) },
    { k: 'bunny', n: 'うさぎさん', snd: 'ぴょんぴょん', cry(o = {}) {
      const v = o.vol ?? .9;
      if (!A.sfx('spring', { vol: v * .8, rate: o.rate || 1.15 })) A.osc(300, { type: 'triangle', slide: 900, slideT: .15, r: .15, vol: .2 * v });
      A.osc(1500, { when: .16, slide: 1900, slideT: .05, r: .08, vol: .07 * v });
    } },
    { k: 'bear', n: 'くまさん', snd: 'のっしのっし', cry(o = {}) {
      const v = (o.vol ?? .9) / .9;
      A.osc(118, { type: 'sawtooth', lp: 560, a: .08, hold: .38, slide: 92, slideT: .5, vib: 18, vibD: .05, r: .3, vol: .18 * v });
      A.osc(236, { type: 'triangle', a: .08, hold: .3, slide: 180, slideT: .5, r: .3, vol: .06 * v });
    } }
  ];

  /* silhouettes keep two glowing eyes so they still blink and look around */
  function darken(root) {
    root.querySelectorAll('*').forEach(n => {
      const eye = n.closest('[data-eye]');
      const f = n.getAttribute('fill'), s = n.getAttribute('stroke');
      let c = n.hasAttribute('data-sh') ? '#4c4170' : INK;
      if (eye) c = (f === '#2b2340' || s === '#2b2340') ? '#fff3c4' : INK;
      if (f && f !== 'none' && f !== 'transparent') n.setAttribute('fill', c);
      if (s && s !== 'none') n.setAttribute('stroke', c);
      n.removeAttribute('opacity');
    });
  }
  function starPath(g, x, y, r, attrs = {}) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .48 : r;
      d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1);
    }
    return el('path', { d: d + 'Z', 'stroke-linejoin': 'round', ...attrs }, g);
  }

  const shadowToy = {
    id: 'shadow', name: 'だーれだ', color: '#6b5b95',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#3d2f63' }, g);
      el('rect', { x: -58, y: -54, width: 116, height: 112, rx: 10, fill: '#f5e4c8' }, g);
      el('circle', { cx: 0, cy: 2, r: 50, fill: '#fffbe8' }, g);
      const a = el('g', { transform: 'translate(0 6) scale(.48)' }, g);
      DRAW.elephant(a); darken(a);
      el('path', { d: 'M-80,-80 L-34,-80 Q-46,0 -40,62 L-80,62Z', fill: '#c8436f' }, g);
      el('path', { d: 'M80,-80 L34,-80 Q46,0 40,62 L80,62Z', fill: '#c8436f' }, g);
      el('rect', { x: -80, y: -80, width: 160, height: 22, fill: '#a8355b' }, g);
      el('rect', { x: -80, y: 58, width: 160, height: 30, fill: '#9a6a4c' }, g);
      el('text', { x: 46, y: -30, 'text-anchor': 'middle', 'font-size': 30, fill: '#ffd56b' }, g).textContent = '?';
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      const CX = 200, CY = 320, GY = 642, GS = .64;
      const SCR = { x: 36, y: 118, w: 328, h: 400 };

      /* ---------- shared defs ---------- */
      const clip = el('clipPath', { id: 'shadow-scr' }, defs);
      el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, rx: 16 }, clip);
      const radial = (id, stops) => {
        const g = el('radialGradient', { id, cx: .5, cy: .5, r: .5 }, defs);
        stops.forEach(([o, c, a]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g));
      };
      radial('shadow-spot-theater', [[0, '#fffdf0', 1], [.62, '#fff2cf', 1], [1, '#fff2cf', 0]]);
      radial('shadow-spot-forest', [[0, '#fff4d6', 1], [.5, '#ffe2a8', .85], [1, '#ffd58a', 0]]);
      radial('shadow-spot-circus', [[0, '#fffef4', 1], [.6, '#fff4cf', 1], [1, '#fff4cf', 0]]);
      radial('shadow-glow', [[0, '#fff3b0', .9], [1, '#fff3b0', 0]]);
      radial('shadow-fly', [[0, '#fffbd0', 1], [.35, '#f4ff8a', .7], [1, '#d8ff6a', 0]]);
      const stripes = el('pattern', { id: 'shadow-stripes', width: 56, height: 20, patternUnits: 'userSpaceOnUse' }, defs);
      el('rect', { width: 28, height: 20, fill: '#e8485a' }, stripes);
      el('rect', { x: 28, width: 28, height: 20, fill: '#fff1d9' }, stripes);
      const hut = el('pattern', { id: 'shadow-tent', width: 48, height: 20, patternUnits: 'userSpaceOnUse' }, defs);
      el('rect', { width: 24, height: 20, fill: '#ffd56b' }, hut);
      el('rect', { x: 24, width: 24, height: 20, fill: '#e8485a' }, hut);

      const front = el('g', {}, svg);
      const ghost = ctx.ghost(front, { x: CX, y: GY, s: GS });
      const cover = el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: '#1b1436', opacity: 0, 'pointer-events': 'none' }, svg);

      /* ---------- the three stages ---------- */
      const THEMES = [
        { id: 'theater', bg: '#3d2f63', frame: '#2c2149', screen: '#e9d3b4', dim: '#7a2848', aud: '#21183d', audEye: '#9d8fd0' },
        { id: 'forest', bg: '#18214a', frame: '#3a2a20', screen: '#cdd3d6', dim: '#254a3a', aud: '#0f1830', audEye: '#ffe58a' },
        { id: 'circus', bg: '#2a1f5c', frame: '#d9a441', screen: '#f3ddb0', dim: '#8a2a3a', aud: '#1d1545', audEye: '#c9b8ff' }
      ];
      let T = null, themeIdx = 0;

      function buildWorld(th) {
        const w = el('g', {});
        svg.insertBefore(w, front);
        const S = { th, w, motes: [], flies: [], lights: [], heads: [], stars: [] };
        el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: th.bg }, w);
        /* far layer: a back wall that peeks out at the sides */
        if (th.id === 'forest') {
          for (let i = 0; i < 14; i++) el('circle', { cx: rand(-60, 460).toFixed(0), cy: rand(-40, 120).toFixed(0), r: rand(1.4, 2.6).toFixed(1), fill: '#fff', class: 'twinkle', style: `animation-delay:-${rand(0, 2.4).toFixed(1)}s` }, w);
        }
        el('rect', { x: 26, y: 108, width: 348, height: 418, rx: 22, fill: th.frame }, w);
        el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, rx: 16, fill: th.screen, filter: 'url(#soft)' }, w);
        const scr = el('g', { 'clip-path': 'url(#shadow-scr)' }, w);
        S.light = el('circle', { cx: CX, cy: th.id === 'forest' ? 250 : CY, r: th.id === 'forest' ? 240 : 200, fill: `url(#shadow-spot-${th.id})` }, scr);
        if (th.id === 'forest') {
          // a sheet hung on a rope: folds + pegs
          [96, 160, 240, 304].forEach(x => el('path', { d: `M${x},126 Q${x + 6},320 ${x - 4},520`, stroke: '#fff', 'stroke-width': 8, fill: 'none', opacity: .18 }, scr));
          el('path', { d: 'M20,126 Q200,140 380,126', stroke: '#8a6a4a', 'stroke-width': 4, fill: 'none' }, scr);
          [80, 200, 320].forEach(x => el('rect', { x: x - 4, y: 124 + (x === 200 ? 6 : 3), width: 8, height: 16, rx: 3, fill: '#c98f5f' }, scr));
        }
        if (th.id === 'circus') {
          el('circle', { cx: CX, cy: CY, r: 172, fill: 'none', stroke: '#ffd56b', 'stroke-width': 6, opacity: .45 }, scr);
          for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; el('circle', { cx: (CX + Math.cos(a) * 172).toFixed(1), cy: (CY + Math.sin(a) * 172).toFixed(1), r: 5, fill: '#fff7d6', opacity: .8 }, scr); }
        }
        S.act = el('g', {}, scr);
        S.fx = el('g', { 'pointer-events': 'none' }, scr);
        for (let i = 0; i < 7; i++) {
          const n = el('circle', { r: rand(1.5, 3).toFixed(1), fill: '#fff', opacity: .5 }, S.fx);
          S.motes.push({ n, x: rand(50, 350), y: rand(130, 510), v: rand(6, 14), ph: rand(0, 6) });
        }
        /* mid layer: the floor */
        floor(th, w, S);
        S.tap = el('rect', { x: SCR.x, y: SCR.y, width: SCR.w, height: SCR.h, fill: 'transparent' }, w);
        /* curtains */
        S.curL = el('g', {}, w); S.curR = el('g', {}, w);
        drawCurtain(th, S.curL, -1); drawCurtain(th, S.curR, 1);
        valance(th, w, S);
        for (let i = 0; i < 5; i++) {
          const g = el('g', {}, w);
          const s = starPath(g, 128 + i * 36, 50, 15, { class: 'tb', fill: th.dim, stroke: '#fff', 'stroke-opacity': .25, 'stroke-width': 2 });
          S.stars.push(s);
        }
        /* near layer: the audience */
        audience(th, w, S);
        return S;
      }

      function floor(th, w, S) {
        if (th.id === 'theater') {
          el('rect', { x: -800, y: 532, width: 2000, height: 1300, fill: '#9a6a4c' }, w);
          [590, 652, 730].forEach(y => el('rect', { x: -800, y, width: 2000, height: 3, fill: '#87593e' }, w));
          el('rect', { x: -800, y: 528, width: 2000, height: 18, fill: '#7a4d34' }, w);
          for (let i = 0; i < 6; i++) {
            const x = 48 + i * 61;
            const halo = el('ellipse', { cx: x, cy: 544, rx: 34, ry: 20, fill: 'url(#shadow-glow)', opacity: .6 }, w);
            halo.animate([{ opacity: .45 }, { opacity: .8 }], { duration: rand(1400, 2200), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -i * 300 });
            const bulbG = el('g', { transform: `translate(${x} 550)` }, w);
            const bulb = el('path', { d: 'M-13,0 A13,11 0 0 1 13,0Z', fill: '#ffe27a', class: 'tb', style: 'transform-origin:50% 100%' }, bulbG);
            S.lights.push({ x, y: 546, bulb, halo });
          }
        } else if (th.id === 'forest') {
          el('rect', { x: -800, y: 526, width: 2000, height: 1300, fill: '#22463a' }, w);
          let d = 'M-800,1800 L-800,540';
          for (let x = -40; x <= 440; x += 40) d += ` Q${x + 20},${522 + (x % 80 ? 6 : 0)} ${x + 40},540`;
          el('path', { d: d + ' L1200,540 L1200,1800Z', fill: '#2c5a46' }, w);
          [[30, 600], [370, 610], [110, 700], [300, 690]].forEach(([x, y], i) => {
            for (let j = -1; j <= 1; j++) el('path', { d: `M${x + j * 8},${y} q${j * 4},-16 ${j * 7},-22`, stroke: '#3f7a5a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, w);
            if (i < 2) {
              el('rect', { x: x - 5 + (i ? -26 : 22), y: y - 26, width: 10, height: 24, rx: 4, fill: '#f3e6d0' }, w);
              el('path', { d: `M${x - 20 + (i ? -26 : 22)},${y - 22} Q${x + (i ? -26 : 22)},${y - 50} ${x + 20 + (i ? -26 : 22)},${y - 22}Z`, fill: '#ff7a8a' }, w);
              el('circle', { cx: x - 6 + (i ? -26 : 22), cy: y - 34, r: 3.5, fill: '#fff' }, w);
            }
          });
        } else {
          el('rect', { x: -800, y: 528, width: 2000, height: 1300, fill: '#3b2a70' }, w);
          el('ellipse', { cx: 200, cy: 664, rx: 250, ry: 96, fill: '#e8485a' }, w);
          el('ellipse', { cx: 200, cy: 668, rx: 226, ry: 80, fill: '#f2c27a' }, w);
          el('ellipse', { cx: 150, cy: 640, rx: 90, ry: 22, fill: '#fff', opacity: .25 }, w);
          for (let i = 0; i < 12; i++) {
            const a = i / 12 * Math.PI * 2;
            const b = el('circle', { cx: (200 + Math.cos(a) * 238).toFixed(1), cy: (664 + Math.sin(a) * 88).toFixed(1), r: 5, fill: '#fff6c8' }, w);
            b.animate([{ opacity: 1 }, { opacity: .25 }], { duration: 600, iterations: Infinity, direction: 'alternate', delay: -(i % 3) * 400 });
          }
        }
      }

      function drawCurtain(th, g, side) {
        const x0 = side < 0 ? -400 : 195, wd = 605, edge = side < 0 ? 205 : 195;
        if (th.id === 'theater') {
          el('rect', { x: x0, y: 90, width: wd, height: 440, fill: '#c8436f' }, g);
          for (let i = 0; i < 9; i++) {
            const x = edge + side * (16 + i * 30);
            el('path', { d: `M${x},96 Q${x - side * 6},300 ${x},524`, stroke: '#a8355b', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', opacity: .8 }, g);
            el('path', { d: `M${x - side * 12},96 Q${x - side * 16},300 ${x - side * 12},524`, stroke: '#e0668c', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: .7 }, g);
          }
          el('rect', { x: x0, y: 520, width: wd, height: 12, fill: '#a8355b' }, g);
        } else if (th.id === 'forest') {
          el('rect', { x: x0, y: 90, width: wd, height: 444, fill: '#2a5c44' }, g);
          for (let r = 0; r < 10; r++) for (let c = 0; c < 5; c++) {
            const x = edge + side * (14 + c * 40 + (r % 2) * 18), y = 104 + r * 46;
            el('ellipse', { cx: x, cy: y, rx: 26, ry: 14, fill: (r + c) % 2 ? '#3f8a5f' : '#337a52', transform: `rotate(${side * (30 + (c % 2) * 30)} ${x} ${y})` }, g);
          }
          el('path', { d: `M${edge + side * 4},96 Q${edge - side * 10},300 ${edge + side * 6},530`, stroke: '#7cc47a', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g);
          [160, 280, 420].forEach((y, i) => el('circle', { cx: edge + side * (i % 2 ? 2 : 8), cy: y, r: 6, fill: i % 2 ? '#ffd56b' : '#ffb3c1' }, g));
        } else {
          el('rect', { x: x0, y: 90, width: wd, height: 436, fill: 'url(#shadow-stripes)' }, g);
          let d = `M${x0},522`;
          for (let x = x0; x < x0 + wd; x += 22) d += ` q11,18 22,0`;
          el('path', { d: d + ` L${x0 + wd},516 L${x0},516Z`, fill: '#ffd56b' }, g);
          el('path', { d: `M${edge + side * 2},96 L${edge + side * 2},524`, stroke: '#ffd56b', 'stroke-width': 6 }, g);
        }
      }

      function valance(th, w, S) {
        if (th.id === 'theater') {
          let sc = 'M-800,-900 L1200,-900 L1200,96';
          for (let x = 420; x >= -40; x -= 46) sc += ` Q${x + 23},128 ${x},96`;
          el('path', { d: sc + ' L-800,96Z', fill: '#ffd56b' }, w);
          let sc2 = 'M-800,-900 L1200,-900 L1200,90';
          for (let x = 420; x >= -40; x -= 46) sc2 += ` Q${x + 23},120 ${x},90`;
          el('path', { d: sc2 + ' L-800,90Z', fill: '#a8355b' }, w);
        } else if (th.id === 'forest') {
          el('rect', { x: -800, y: -900, width: 2000, height: 990, fill: '#1c3d2f' }, w);
          for (let x = -30; x <= 430; x += 38) el('circle', { cx: x, cy: 92 + (x % 76 ? 8 : 0), r: 30, fill: '#1c3d2f' }, w);
          for (let x = -10; x <= 430; x += 52) el('ellipse', { cx: x, cy: 78, rx: 24, ry: 12, fill: '#2e6048', transform: `rotate(${x % 104 ? 20 : -20} ${x} 78)` }, w);
          [[44, 150], [356, 136]].forEach(([x, len]) => {
            el('path', { d: `M${x},100 Q${x + 8},${100 + len / 2} ${x},${100 + len}`, stroke: '#4f9a6a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, w);
            for (let y = 116; y < 100 + len; y += 26) el('ellipse', { cx: x + 7, cy: y, rx: 8, ry: 4.5, fill: '#5fb07a', transform: `rotate(30 ${x + 7} ${y})` }, w);
          });
          el('circle', { cx: 346, cy: 20, r: 18, fill: '#fff6c8' }, w);
          el('circle', { cx: 354, cy: 14, r: 15, fill: '#1c3d2f' }, w);
          /* the lantern: glow stays still, the lamp sways */
          S.lantern = el('ellipse', { cx: 200, cy: 150, rx: 120, ry: 80, fill: 'url(#shadow-glow)', opacity: .55, 'pointer-events': 'none' }, w);
          S.lantern.animate([{ opacity: .45 }, { opacity: .7 }], { duration: 1700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          const lg = el('g', { transform: 'translate(200 96)' }, w);
          const sw = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, lg);
          el('path', { d: 'M0,-20 L0,18', stroke: '#6a4a30', 'stroke-width': 3 }, sw);
          el('rect', { x: -16, y: 16, width: 32, height: 8, rx: 3, fill: '#6a4a30' }, sw);
          el('rect', { x: -13, y: 22, width: 26, height: 34, rx: 9, fill: '#ffd56b' }, sw);
          el('rect', { x: -6, y: 28, width: 12, height: 22, rx: 5, fill: '#fff6c8' }, sw);
          el('rect', { x: -16, y: 54, width: 32, height: 7, rx: 3, fill: '#6a4a30' }, sw);
          sw.animate([{ transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }], { duration: 2200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          S.lanternSwing = sw;
          /* fireflies everywhere */
          for (let i = 0; i < 8; i++) {
            const n = el('circle', { r: 9, fill: 'url(#shadow-fly)', 'pointer-events': 'none' }, w);
            S.flies.push({ n, x: rand(10, 390), y: rand(150, 720), ph: rand(0, 6), sp: rand(.3, .6), life: Infinity });
          }
        } else {
          let sc = 'M-800,-900 L1200,-900 L1200,96';
          for (let x = 420; x >= -40; x -= 46) sc += ` Q${x + 23},132 ${x},96`;
          el('path', { d: sc + ' L-800,96Z', fill: 'url(#shadow-tent)' }, w);
          el('rect', { x: -800, y: 84, width: 2000, height: 10, fill: '#ffd56b' }, w);
          for (let i = 0; i < 10; i++) {
            const x = -17 + i * 46;
            const b = el('circle', { cx: x, cy: 118, r: 5.5, fill: '#fff6c8' }, w);
            b.animate([{ opacity: 1 }, { opacity: .3 }, { opacity: 1 }], { duration: 1200, iterations: Infinity, delay: -(i % 3) * 400 });
          }
          const bunt = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, w);
          el('path', { d: 'M-10,140 Q200,176 410,140', stroke: '#fff', 'stroke-width': 2.5, fill: 'none', opacity: .8 }, bunt);
          for (let i = 0; i < 9; i++) {
            const x = 22 + i * 44, y = 140 + Math.sin((x + 10) / 420 * Math.PI) * 18;
            el('path', { d: `M${x - 12},${y} L${x + 12},${y} L${x},${y + 22}Z`, fill: PARTY[i % PARTY.length] }, bunt);
          }
          bunt.animate([{ transform: 'rotate(-1.2deg)' }, { transform: 'rotate(1.2deg)' }], { duration: 1900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        }
      }

      function audience(th, w, S) {
        const g = el('g', {}, w);
        const KINDS = ['cat', 'round', 'bear', 'bunny', 'round', 'cat', 'bear'];
        for (let i = 0; i < 7; i++) {
          const x = 22 + i * 59, y = i % 2 ? 772 : 758;
          const o = el('g', { transform: `translate(${x} ${y})` }, g);
          const b = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, o);
          const k = KINDS[i], c = th.aud;
          if (k === 'cat') [-1, 1].forEach(d => el('path', { d: `M${d * 30},-14 L${d * 24},-46 L${d * 6},-30Z`, fill: c }, b));
          if (k === 'bear') [-1, 1].forEach(d => el('circle', { cx: d * 24, cy: -26, r: 11, fill: c }, b));
          if (k === 'bunny') [-1, 1].forEach(d => el('ellipse', { cx: d * 12, cy: -48, rx: 8, ry: 22, fill: c, transform: `rotate(${d * 10} ${d * 12} -48)` }, b));
          el('ellipse', { cx: 0, cy: 0, rx: 32, ry: 30, fill: c }, b);
          el('rect', { x: -38, y: 20, width: 76, height: 70, rx: 30, fill: c }, b);
          const eyes = el('g', {}, b);
          [-10, 10].forEach(ex => el('circle', { cx: ex, cy: -6, r: 3.6, fill: th.audEye }, eyes));
          const hands = el('g', { class: 'tb', opacity: 0 }, b);
          [-1, 1].forEach(d => el('ellipse', { cx: d * 13, cy: 24, rx: 10, ry: 12, fill: th.audEye, opacity: .55 }, hands));
          S.heads.push({ x, y, b, eyes, hands });
        }
        el('rect', { x: -800, y: 800, width: 2000, height: 900, fill: th.aud }, g);
      }

      /* ---------- a friend that starts as a shadow ---------- */
      function makeFriend(def, parent, x, y, box, dark, crown) {
        const outer = el('g', { transform: `translate(${x} ${y})` }, parent);
        const jit = el('g', {}, outer);
        const sc = el('g', {}, jit);
        const flip = el('g', { class: 'tb' }, sc);
        const wig = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, flip);
        const cen = el('g', {}, wig);
        const col = el('g', {}, cen);
        const p = (ANIMALS[def.k] || DRAW[def.k])(col);
        p.open.setAttribute('data-eye', 'o'); p.shut.setAttribute('data-eye', 's');
        p.mo.setAttribute('data-m', 'o'); p.mc.setAttribute('data-m', 'c');
        let bb = col.getBBox();
        if (!bb.width) bb = { x: -70, y: -80, width: 140, height: 160 };
        if (crown) {
          const cx = bb.x + bb.width / 2, top = bb.y + 6;
          el('path', { d: `M${cx - 26},${top} L${cx - 30},${top - 30} L${cx - 13},${top - 16} L${cx},${top - 36} L${cx + 13},${top - 16} L${cx + 30},${top - 30} L${cx + 26},${top}Z`, fill: '#ffd23f', 'stroke-linejoin': 'round' }, col);
          el('circle', { cx, cy: top - 10, r: 4.5, fill: '#ff7a8a' }, col);
          bb = { x: bb.x, y: top - 36, width: bb.width, height: bb.y + bb.height - (top - 36) };
        }
        const s = Math.min(box[0] / bb.width, box[1] / bb.height, 1.9);
        sc.setAttribute('transform', `scale(${s.toFixed(3)})`);
        cen.setAttribute('transform', `translate(${(-(bb.x + bb.width / 2)).toFixed(1)} ${(-(bb.y + bb.height / 2)).toFixed(1)})`);
        let sil = null;
        if (dark) { sil = col.cloneNode(true); darken(sil); cen.appendChild(sil); col.style.display = 'none'; }
        const parts = () => [col, sil].filter(Boolean).map(r => ({ o: r.querySelector('[data-eye=o]'), s: r.querySelector('[data-eye=s]'), mo: r.querySelector('[data-m=o]'), mc: r.querySelector('[data-m=c]') }));
        let closeT = 0, blinkT = 0, shut = false;
        const f = {
          def, outer, jit, flip, wig, x, y, s, h: bb.height * s,
          get dark() { return !!sil; },
          mouth(on) { parts().forEach(q => { q.mo.style.display = on ? '' : 'none'; q.mc.style.display = on ? 'none' : ''; }); },
          eyes(closed) { shut = closed; parts().forEach(q => { q.o.style.display = closed ? 'none' : ''; q.s.style.display = closed ? '' : 'none'; }); },
          blink() { if (shut) return; f.eyes(true); clearTimeout(blinkT); blinkT = ctx.after(150, () => f.eyes(false)); },
          look(px, py) {
            const dx = clamp((px - x) / 30, -4, 4), dy = clamp((py - y) / 40, -3, 3);
            parts().forEach(q => q.o.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`));
          },
          light() { if (sil) { sil.remove(); sil = null; col.style.display = ''; } },
          cheer(ms = 700, vol, rate) {
            f.mouth(true); def.cry({ vol, rate });
            wig.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(4px) scale(1.15,.85)', offset: .15 },
              { transform: 'translateY(-26px) scale(.92,1.1)', offset: .45 }, { transform: 'translateY(0px) scale(1.08,.92)', offset: .75 }, { transform: 'translateY(0px) scale(1)' }], { duration: ms, easing: 'ease-out' });
            clearTimeout(closeT); closeT = ctx.after(ms + 150, () => f.mouth(false));
          }
        };
        return f;
      }

      /* ---------- curtains ---------- */
      let cv = 1;
      const setCurtain = k => {
        cv = k;
        T.curL.setAttribute('transform', `translate(${(-170 * (1 - k)).toFixed(1)} 0)`);
        T.curR.setAttribute('transform', `translate(${(170 * (1 - k)).toFixed(1)} 0)`);
      };
      function curtain(to, ms, done) {
        const from = cv; A.whoosh();
        ctx.tween(ms, k => setCurtain(from + (to - from) * k), done);
      }
      function newTheme(i) {
        if (T) T.w.remove();
        themeIdx = i; T = buildWorld(THEMES[i]);
        setCurtain(1);
        bindWorld();
      }

      /* ---------- round state ---------- */
      let order = [], idx = 0, found = [], cur = null, phase = 'curtain', line = [], rareAt = -1, lastP = { x: CX, y: 640 }, wiggleN = 0;
      const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      function newRound() {
        const last = order[idx] || order[order.length - 1];
        do { order = shuffle(FRIENDS).slice(0, 5); } while (order[0] === last);
        idx = 0; found = [];
        rareAt = Math.random() < 1 / 6 ? Math.floor(rand(1, 5)) : -1;
        T.stars.forEach(s => s.setAttribute('fill', T.th.dim));
      }
      function clue(loud) {
        if (!cur || !cur.dark) return;
        wiggleN++;
        cur.wig.animate([{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(-8deg) scale(1.06,.94)', offset: .2 }, { transform: 'rotate(8deg) scale(.96,1.05)', offset: .45 },
          { transform: 'rotate(-4deg) scale(1.03,.97)', offset: .7 }, { transform: 'rotate(0deg) scale(1)' }], { duration: 760, easing: 'ease-in-out' });
        if (loud || wiggleN % 2) {
          // the audio clue: the friend's own voice, quietly, behind the screen
          cur.mouth(true); ctx.after(500, () => cur && cur.dark && cur.mouth(false));
          cur.def.cry({ vol: .22, rate: rand(.95, 1.05) });
        } else A.osc(mtof(pick([67, 69, 72])), { type: 'triangle', r: .2, vol: .06, slide: mtof(74), slideT: .15 });
      }
      function showShadow() {
        if (cur) cur.outer.remove();
        wiggleN = 0;
        cur = makeFriend(order[idx], T.act, CX, CY, [270, 290], true, idx === rareAt);
        cur.flip.animate([{ transform: 'scale(.4)' }, { transform: 'scale(1.06)', offset: .7 }, { transform: 'scale(1)' }], { duration: 500, easing: 'ease-out' });
        ctx.after(350, () => curtain(0, 650, () => {
          phase = 'guess';
          ghost.set('normal'); ghost.hop(); ghost.talk('だーれだ？');
          ctx.after(1100, () => clue(true));
        }));
      }
      function burst(gold) {
        const g = el('g', { transform: `translate(${CX} ${CY})` }, T.fx);
        const b = el('g', { class: 'tb' }, g);
        el('circle', { r: 110, fill: gold ? '#fff2a8' : '#fffbe0', opacity: .9 }, b);
        for (let i = 0; i < 12; i++) el('rect', { x: -6, y: -190, width: 12, height: 60, rx: 6, fill: gold ? '#ffc93f' : '#ffe27a', transform: `rotate(${i * 30})` }, b);
        b.animate([{ transform: 'scale(.2) rotate(0deg)', opacity: 1 }, { transform: 'scale(1.5) rotate(30deg)', opacity: 0 }], { duration: 700, easing: 'ease-out' }).onfinish = () => g.remove();
        T.light.animate([{ opacity: 1 }, { opacity: .6 }, { opacity: 1 }], { duration: 500 });
      }
      function rainbow() {
        const g = el('g', { 'pointer-events': 'none', opacity: 0 }, T.act);
        T.act.insertBefore(g, T.act.firstChild);
        ['#ff8a9a', '#ffc46b', '#fff07a', '#8fe0a0', '#8fc4ff', '#c9a7ff'].forEach((c, i) => el('path', { d: `M${60 + i * 12},${CY + 150} A${140 - i * 12},${150 - i * 12} 0 0 1 ${340 - i * 12},${CY + 150}`, stroke: c, 'stroke-width': 12, fill: 'none' }, g));
        g.animate([{ opacity: 0 }, { opacity: .85, offset: .15 }, { opacity: .85, offset: .8 }, { opacity: 0 }], { duration: 3400 }).onfinish = () => g.remove();
      }
      function claps(n = 6, vol = .12) {
        for (let i = 0; i < n; i++) {
          const when = i * .12 + rand(0, .04);
          if (!A.sfx('clap', { vol: vol * 3.5, rate: rand(.9, 1.2), when })) A.noise({ type: 'bandpass', from: rand(1600, 3000), q: 2, dur: .05, vol, when });
        }
      }
      function audienceCheer(clap, ms = 1400) {
        T.heads.forEach((h, i) => {
          h.b.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(-16px) scale(.95,1.06)', offset: .3 }, { transform: 'translateY(0px) scale(1.05,.95)', offset: .6 }, { transform: 'translateY(0px) scale(1)' }],
            { duration: 560, delay: i * 50, iterations: clap ? Math.ceil(ms / 560) : 1 });
          if (clap) {
            h.hands.animate([{ opacity: 1, transform: 'scaleX(1)' }, { opacity: 1, transform: 'scaleX(.45)' }], { duration: 160, iterations: Math.ceil(ms / 160), direction: 'alternate', delay: i * 30 }).onfinish = () => h.hands.setAttribute('opacity', 0);
          }
        });
      }
      function reveal() {
        phase = 'drum'; haptic(20);
        const f = cur, def = f.def, gold = idx === rareAt;
        if (!A.sfx('drumroll', { vol: .8 })) for (let i = 0; i < 16; i++) A.noise({ type: 'bandpass', from: 320, q: 1.4, dur: .06, vol: .12, when: i * .08 });
        ghost.set('surprise');
        f.jit.animate([{ transform: 'translate(0px,0px)' }, { transform: 'translate(-3px,1px)' }, { transform: 'translate(3px,-1px)' }, { transform: 'translate(0px,0px)' }], { duration: 120, iterations: 11 });
        f.flip.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12,.88)', offset: .12 }, { transform: 'scale(1.06)' }], { duration: 1350, fill: 'forwards', easing: 'ease-in-out' });
        T.light.animate([{ opacity: 1 }, { opacity: .7 }, { opacity: 1 }, { opacity: .7 }, { opacity: 1 }], { duration: 1300 });
        T.heads.forEach((h, i) => h.b.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0px)' }], { duration: 400, delay: i * 70 }));
        ctx.after(1350, () => {
          phase = 'reveal';
          A.pop(); [72, 76, 79].forEach((m, i) => A.bell(mtof(m + 12), { when: i * .05, vol: .1 }));
          if (gold) { A.sfx('jingle', { vol: .5 }); rainbow(); }
          burst(gold);
          f.flip.animate([{ transform: 'scale(1.06,1.06)' }, { transform: 'scale(0,1.06)' }], { duration: 170, easing: 'ease-in', fill: 'forwards' }).onfinish = () => {
            f.light(); f.look(lastP.x, lastP.y);
            f.flip.animate([{ transform: 'scale(0,1)' }, { transform: 'scale(1.15,.9)', offset: .55 }, { transform: 'scale(.96,1.04)', offset: .8 }, { transform: 'scale(1)' }], { duration: 460, easing: 'ease-out', fill: 'forwards' });
          };
          ctx.after(260, () => {
            ctx.sparkle(CX, CY - 20, gold ? 14 : 8, 130, gold ? '#ffd23f' : '#ffd56b');
            f.cheer(780);
            ctx.bubble(def.snd, CX, 178);
            audienceCheer(true, 900); claps(7, .1);
          });
          found.push(def);
          const st = T.stars[found.length - 1];
          ctx.after(520, () => {
            st.setAttribute('fill', '#ffd56b');
            st.animate([{ transform: 'scale(.3) rotate(0deg)' }, { transform: 'scale(1.5) rotate(40deg)', offset: .6 }, { transform: 'scale(1) rotate(72deg)' }], { duration: 500, easing: 'ease-out' });
            A.sfx('coin', { vol: .4, rate: .9 + found.length * .08 }) || A.osc(mtof(76 + found.length * 2), { type: 'triangle', r: .3, vol: .1 });
            ctx.sparkle(128 + (found.length - 1) * 36, 50, 3, 18);
          });
          ctx.after(1250, () => { ghost.set('happy'); ghost.hop(); ghost.talk(def.n + '！'); });
          ctx.after(3700, () => {
            phase = 'curtain'; ghost.set('normal');
            if (found.length >= 5) return finale();
            curtain(1, 700, () => { idx++; ctx.after(250, showShadow); });
          });
        });
      }
      function ghostDance() {
        ghost.hop(); ghost.giggle(); ghost.swing(40, 300);
        ctx.tween(1500, k => ghost.place(CX + Math.sin(k * Math.PI * 2) * 100, GY - Math.abs(Math.sin(k * Math.PI * 3)) * 50, GS), () => ghost.place(CX, GY, GS), k => k);
      }
      function finale() {
        phase = 'finale';
        curtain(1, 700, () => {
          if (cur) { cur.outer.remove(); cur = null; }
          const SPOTS = [[94, 252], [200, 236], [306, 252], [144, 414], [256, 414]];
          line = found.map((def, i) => makeFriend(def, T.act, SPOTS[i][0], SPOTS[i][1], [116, 142], false, found.length === 5 && order[rareAt] === def));
          line.forEach(f => f.look(CX, 640));
          ctx.after(300, () => curtain(0, 700, () => {
            ghost.set('happy'); ghost.talk('みんな でてきたよ！');
            line.forEach((f, i) => ctx.after(700 + i * 430, () => { f.cheer(520); ctx.sparkle(f.x, f.y - 30, 3, 26); }));
            ctx.after(700 + line.length * 430 + 300, bow);
          }));
        });
      }
      function bow() {
        line.forEach((f, i) => f.wig.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(14px) scale(1.08,.76)', offset: .35 },
          { transform: 'translateY(14px) scale(1.08,.76)', offset: .6 }, { transform: 'translateY(-10px) scale(.95,1.06)', offset: .82 }, { transform: 'translateY(0px) scale(1)' }], { duration: 1200, delay: i * 60, easing: 'ease-in-out' }));
        line.forEach(f => { f.eyes(true); ctx.after(900, () => f.eyes(false)); });
        A.tada(); haptic(30);
        if (!A.sfx('applause', { vol: .7 })) claps(14, .14);
        audienceCheer(true, 2800);
        ctx.confetti(110, 330, 30); ctx.after(350, () => ctx.confetti(290, 330, 30));
        ghost.glow(true); ghost.talk('ぱちぱち！'); ghostDance();
        ctx.after(1500, () => line.forEach((f, i) => ctx.after(i * 140, () => f.cheer(500, .7, rand(.95, 1.1)))));
        ctx.after(2300, () => { ctx.confetti(200, 260, 24); ghost.hop(); });
        ctx.after(3300, () => { ghost.talk('またね！'); line.forEach(f => f.wig.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0deg)' }], { duration: 700 })); });
        ctx.after(4800, () => {
          ghost.glow(false); ghost.set('normal');
          curtain(1, 700, () => {
            line = [];
            cover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' }).onfinish = () => {
              newTheme((themeIdx + 1) % THEMES.length);
              newRound();
              A.sfx('sparkle', { vol: .35 });
              cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: 'forwards' });
              ghost.hop();
              ctx.after(500, showShadow);
            };
          });
        });
      }

      /* ---------- taps ---------- */
      function bgTap(p) {
        const th = T.th.id;
        const h = T.heads.find(q => Math.abs(q.x - p.x) < 32 && p.y > q.y - 50);
        if (h) {
          h.b.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(-18px) scale(.92,1.1)', offset: .35 }, { transform: 'translateY(0px) scale(1.1,.9)', offset: .7 }, { transform: 'translateY(0px) scale(1)' }], { duration: 480, easing: 'ease-out' });
          h.hands.animate([{ opacity: 1, transform: 'scaleX(1)' }, { opacity: 1, transform: 'scaleX(.45)' }], { duration: 140, iterations: 4, direction: 'alternate' }).onfinish = () => h.hands.setAttribute('opacity', 0);
          claps(2, .14); A.sfx('blink', { vol: .4, rate: rand(.9, 1.2) });
          return;
        }
        if (th === 'theater') {
          const l = T.lights.reduce((a, b) => Math.abs(b.x - p.x) < Math.abs(a.x - p.x) ? b : a);
          l.bulb.animate([{ transform: 'scale(1)', fill: '#ffe27a' }, { transform: 'scale(1.4,1.25)', fill: '#fffbe0', offset: .3 }, { transform: 'scale(1)', fill: '#ffe27a' }], { duration: 500, easing: 'ease-out' });
          ctx.sparkle(p.x, p.y, 3, 22, '#fff3b0');
          A.sfx('blink', { vol: .5, rate: rand(.85, 1.25) }) || A.bell(mtof(pick(PENTA) + 12), { vol: .08 });
        } else if (th === 'forest') {
          for (let i = 0; i < 3; i++) {
            const n = el('circle', { r: 9, fill: 'url(#shadow-fly)', 'pointer-events': 'none' }, T.w);
            T.flies.push({ n, x: p.x + rand(-12, 12), y: p.y + rand(-12, 12), ph: rand(0, 6), sp: rand(.5, .9), life: 3.5, vy: -rand(20, 40) });
          }
          A.bell(mtof(pick(PENTA) + 24), { vol: .06 }); A.bell(mtof(pick(PENTA) + 24), { vol: .05, when: .09 });
          if (T.lanternSwing) T.lanternSwing.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0deg)' }], { duration: 900, composite: 'add' });
        } else {
          ctx.confetti(p.x, p.y, 10);
          A.sfx('pop', { vol: .6, rate: rand(.9, 1.3) }) || A.pop();
        }
      }
      function bindWorld() {
        T.tap.addEventListener('pointerdown', e => {
          e.stopPropagation();
          const p = ctx.point(e); lastP = p;
          if (cur) cur.look(p.x, p.y);
          if (phase === 'guess') return reveal();
          if (phase === 'drum') { ctx.sparkle(p.x, p.y, 3, 24); A.sfx('blink', { vol: .4, rate: rand(1, 1.3) }); return; }
          if (phase === 'reveal' && cur && !cur.dark) { haptic(); cur.cheer(600, .8, rand(.92, 1.12)); ctx.sparkle(p.x, p.y, 3, 24); return; }
          if (phase === 'finale' && line.length) {
            let best = line[0];
            line.forEach(f => { if (Math.hypot(f.x - p.x, f.y - p.y) < Math.hypot(best.x - p.x, best.y - p.y)) best = f; });
            if (Math.abs(best.x - p.x) < 70 && Math.abs(best.y - p.y) < 80) { haptic(); best.cheer(500, .8, rand(.92, 1.12)); ctx.sparkle(best.x, best.y - 30, 3, 24); return; }
          }
          bgTap(p);
        });
      }
      ghost.pos.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        ghost.giggle(); ctx.sparkle(ghost.x, ghost.y - 30, 3, 30);
        ctx.after(700, () => { if (phase !== 'finale') ghost.set(phase === 'drum' ? 'surprise' : 'normal'); });
      });
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e); lastP = p;
        if (cur) cur.look(p.x, p.y);
        line.forEach(f => f.look(p.x, p.y));
        bgTap(p);
      });

      /* ---------- ambient life ---------- */
      ctx.every(3100, () => { if (phase === 'guess') clue(false); });
      ctx.every(900, () => {
        if (cur && Math.random() < .35) cur.blink();
        line.forEach(f => { if (Math.random() < .2) f.blink(); });
        if (T && Math.random() < .5) {
          const h = pick(T.heads);
          h.eyes.animate([{ opacity: 1 }, { opacity: 0, offset: .4 }, { opacity: 1 }], { duration: 220 });
          if (Math.random() < .4) h.b.animate([{ transform: 'translateY(0px) rotate(0deg)' }, { transform: `translateY(-5px) rotate(${pick([-6, 6])}deg)` }, { transform: 'translateY(0px) rotate(0deg)' }], { duration: 700, easing: 'ease-in-out' });
        }
      });
      ctx.loop((dt, t) => {
        if (!T) return;
        T.motes.forEach(m => {
          m.y -= m.v * dt; if (m.y < 125) { m.y = 512; m.x = rand(50, 350); }
          m.n.setAttribute('transform', `translate(${(m.x + Math.sin(t * .7 + m.ph) * 10).toFixed(1)} ${m.y.toFixed(1)})`);
        });
        for (let i = T.flies.length - 1; i >= 0; i--) {
          const f = T.flies[i];
          f.life -= dt;
          if (f.vy) f.y += f.vy * dt;
          const x = f.x + Math.sin(t * f.sp + f.ph) * 34, y = f.y + Math.sin(t * f.sp * 1.7 + f.ph) * 22;
          const a = (.45 + .55 * Math.max(0, Math.sin(t * 2.2 + f.ph * 3))) * Math.min(1, f.life);
          f.n.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          f.n.setAttribute('opacity', a.toFixed(2));
          if (f.life <= 0) { f.n.remove(); T.flies.splice(i, 1); }
        }
      });
      ctx.hint = () => phase === 'guess' ? [CX, CY] : null;

      newTheme(Math.floor(Math.random() * THEMES.length));
      newRound();
      ctx.after(200, showShadow);
    }
  };
  TOYS.push(shadowToy);
})();
