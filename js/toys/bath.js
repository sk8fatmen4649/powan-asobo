'use strict';
/* =========================================================
   toy: おふろ — soap up a friend, rinse, towel dry, ぴかぴか!
   three bathrooms rotate: tiles, a hot-spring rock bath, a bubble bath at night
   ========================================================= */
(() => {
  const KINDS = ['dog', 'cat', 'bear', 'frog', 'bunny'];
  const NAMES = { dog: 'わんちゃん', cat: 'ねこちゃん', bear: 'くまさん', frog: 'かえるさん', bunny: 'うさぎさん' };
  const FUR = { dog: '#d9a066', cat: '#ffb066', bear: '#b9824f', frog: '#7fd36b', bunny: '#fff4f7' };
  const AX = 200, AY = 392, AS = 1.75, WY = 500;

  function duck(g, gold) {
    const c1 = gold ? '#ffd23f' : '#ffe066', c2 = gold ? '#ffb800' : '#ffc21a';
    el('path', { d: 'M-30,-2 Q-50,-20 -42,-26 Q-32,-14 -22,-8Z', fill: c2 }, g);
    el('ellipse', { cx: 0, cy: 6, rx: 34, ry: 21, fill: c1 }, g);
    el('ellipse', { cx: -10, cy: -2, rx: 13, ry: 5.5, fill: '#fff', opacity: .45 }, g);
    el('path', { d: 'M-15,4 Q0,-9 15,4 Q0,17 -15,4Z', fill: c2 }, g);
    el('circle', { cx: 15, cy: -20, r: 19, fill: c1 }, g);
    el('ellipse', { cx: 8, cy: -30, rx: 7, ry: 4, fill: '#fff', opacity: .5, transform: 'rotate(-25 8 -30)' }, g);
    el('path', { d: 'M30,-23 Q49,-24 47,-15 Q40,-9 30,-12Z', fill: '#ff9a1f' }, g);
    el('ellipse', { cx: 19, cy: -25, rx: 4, ry: 4.8, fill: '#2b2340' }, g);
    el('circle', { cx: 17.6, cy: -27, r: 1.6, fill: '#fff' }, g);
    el('ellipse', { cx: 24, cy: -13, rx: 5.5, ry: 3.3, fill: '#ffa3b8', opacity: .8 }, g);
    if (gold) [[-28, -36], [36, -44], [-40, 10]].forEach(([x, y], k) => el('path', { d: 'M0,-8 Q1,-1 8,0 Q1,1 0,8 Q-1,1 -8,0 Q-1,-1 0,-8Z', fill: '#fff38a', class: 'twinkle', style: `animation-delay:-${k * .7}s` }, el('g', { transform: `translate(${x} ${y})` }, g)));
    el('circle', { cx: 0, cy: -6, r: 48, fill: 'transparent' }, g);
  }
  function boat(g) {
    el('path', { d: 'M2,-62 L2,-6', stroke: '#a8744a', 'stroke-width': 4 }, g);
    el('path', { d: 'M6,-60 Q34,-34 30,-10 L6,-10Z', fill: '#fff' }, g);
    el('path', { d: 'M-2,-54 Q-24,-34 -22,-12 L-2,-12Z', fill: '#bfe8ff' }, g);
    el('path', { d: 'M2,-62 L18,-58 L2,-53Z', fill: '#ff7a8a' }, g);
    el('path', { d: 'M-40,-8 L40,-8 Q34,16 18,18 L-20,18 Q-34,16 -40,-8Z', fill: '#ff7a8a' }, g);
    el('rect', { x: -38, y: -9, width: 76, height: 6, rx: 3, fill: '#ffd56b' }, g);
    [-16, 0, 16].forEach(x => el('circle', { cx: x, cy: 5, r: 3.4, fill: '#fff' }, g));
    el('ellipse', { cx: -22, cy: 2, rx: 8, ry: 3, fill: '#fff', opacity: .35 }, g);
    el('circle', { cx: 0, cy: -20, r: 48, fill: 'transparent' }, g);
  }
  function whale(g) {
    el('path', { d: 'M34,0 Q52,-6 58,-26 Q48,-22 44,-14 Q46,-30 34,-34 Q38,-18 30,-6Z', fill: '#6fb6ff' }, g);
    el('ellipse', { cx: 0, cy: 0, rx: 46, ry: 32, fill: '#7fc4ff' }, g);
    el('path', { d: 'M-42,8 Q0,40 40,8 Q20,28 -2,28 Q-26,28 -42,8Z', fill: '#d8eeff' }, g);
    el('ellipse', { cx: -16, cy: -18, rx: 14, ry: 7, fill: '#fff', opacity: .4, transform: 'rotate(-20 -16 -18)' }, g);
    el('ellipse', { cx: -20, cy: -4, rx: 4.6, ry: 5.6, fill: '#2b2340' }, g);
    el('circle', { cx: -21.5, cy: -6, r: 1.8, fill: '#fff' }, g);
    el('ellipse', { cx: -30, cy: 8, rx: 6, ry: 3.6, fill: '#ffa3b8', opacity: .8 }, g);
    el('path', { d: 'M-12,10 Q-6,15 0,10', stroke: '#2b2340', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, g);
    el('ellipse', { cx: -2, cy: -31, rx: 5, ry: 2.4, fill: '#4a8ed8' }, g);
    el('circle', { cx: 0, cy: -4, r: 54, fill: 'transparent' }, g);
  }
  function soap(g) {
    el('rect', { x: -32, y: -18, width: 64, height: 36, rx: 16, fill: '#ffc4dc' }, g);
    el('rect', { x: -26, y: -14, width: 40, height: 10, rx: 5, fill: '#fff', opacity: .5 }, g);
    [[-24, -22, 9], [-8, -26, 11], [10, -22, 8]].forEach(([x, y, r]) => { el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#e3f4ff', 'stroke-width': 1.5 }, g); el('circle', { cx: x - r * .35, cy: y - r * .35, r: r * .25, fill: '#eaf8ff' }, g); });
    el('circle', { r: 44, fill: 'transparent' }, g);
  }
  /* fluffy foam: overlapping bubbles, each with a highlight */
  function foamBlob(g, n = 6) {
    const bs = [];
    for (let i = 0; i < n; i++) bs.push([rand(-12, 12), rand(-9, 9), rand(7, 12.5)]);
    bs.sort((a, b) => a[1] - b[1]);
    bs.forEach(([x, y, r]) => {
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(1), fill: '#ffffff', stroke: '#d8eeff', 'stroke-width': 1.2 }, g);
      el('circle', { cx: (x - r * .38).toFixed(1), cy: (y - r * .4).toFixed(1), r: (r * .22).toFixed(1), fill: '#e4f6ff' }, g);
    });
    el('circle', { cx: rand(-6, 6).toFixed(1), cy: rand(-4, 4).toFixed(1), r: 2.2, fill: '#cfe9ff', opacity: .8 }, g);
  }

  /* ---------- three bathrooms ---------- */
  const THEMES = [
    { key: 'tile', water: '#9fe6f3', rim: '#b7eef7', rinser: 'shower', back(g, defs) {
      const tile = defs.querySelector('#bath-tile') ? el('pattern') : el('pattern', { id: 'bath-tile', width: 50, height: 50, patternUnits: 'userSpaceOnUse' }, defs);
      el('rect', { width: 50, height: 50, fill: '#bfeeef' }, tile);
      el('rect', { x: 3, y: 3, width: 44, height: 44, rx: 10, fill: '#d6f7f5' }, tile);
      el('circle', { cx: 13, cy: 13, r: 3, fill: '#fff', opacity: .8 }, tile);
      el('rect', { x: -800, y: -900, width: 2000, height: 1500, fill: 'url(#bath-tile)' }, g);
      el('rect', { x: -800, y: 600, width: 2000, height: 1200, fill: '#9fdcdf' }, g);
      el('rect', { x: -800, y: 592, width: 2000, height: 12, fill: '#7fd0d4' }, g);
      // window with a sunny sky
      el('rect', { x: 236, y: 96, width: 130, height: 110, rx: 22, fill: '#fff' }, g);
      el('rect', { x: 246, y: 106, width: 110, height: 90, rx: 16, fill: '#bfe8ff' }, g);
      el('circle', { cx: 330, cy: 132, r: 14, fill: '#ffe07a' }, g);
      el('path', { d: 'M246,176 Q280,160 310,176 Q336,166 356,174 L356,196 L246,196Z', fill: '#bfeab0' }, g);
      el('rect', { x: 298, y: 106, width: 6, height: 90, fill: '#fff' }, g);
      // shelf with bottles
      el('rect', { x: 18, y: 312, width: 92, height: 11, rx: 5.5, fill: '#fff' }, g);
      el('rect', { x: 30, y: 260, width: 28, height: 52, rx: 10, fill: '#ff9ab3' }, g);
      el('rect', { x: 37, y: 248, width: 14, height: 14, rx: 4, fill: '#ff7a95' }, g);
      el('rect', { x: 66, y: 274, width: 32, height: 38, rx: 12, fill: '#c9a7ff' }, g);
      el('rect', { x: 76, y: 264, width: 12, height: 12, rx: 4, fill: '#a98af0' }, g);
      el('circle', { cx: 44, cy: 284, r: 6, fill: '#fff', opacity: .6 }, g);
      el('rect', { x: 22, y: 470, width: 356, height: 40, rx: 16, fill: '#dbeefa' }, g);
    }, front(g) {
      el('ellipse', { cx: 200, cy: 668, rx: 182, ry: 16, fill: '#3a2f5b', opacity: .1 }, g);
      el('rect', { x: 50, y: 700, width: 300, height: 44, rx: 22, fill: '#ffb3c1' }, g);
      [96, 140, 184, 228, 272].forEach(x => el('rect', { x, y: 708, width: 20, height: 28, rx: 10, fill: '#ffc9d3' }, g));
      el('path', { d: 'M26,516 L374,516 L370,600 Q366,652 314,652 L86,652 Q34,652 30,600Z', fill: '#ffffff' }, g);
      el('rect', { x: 14, y: 506, width: 372, height: 24, rx: 12, fill: '#f4fbff', stroke: '#d5ecf7', 'stroke-width': 2 }, g);
      el('rect', { x: 40, y: 566, width: 320, height: 12, rx: 6, fill: '#ffc4d2' }, g);
      el('path', { d: 'M60,540 Q58,600 90,630', stroke: '#eef6fb', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, g);
      [76, 324].forEach(x => el('ellipse', { cx: x, cy: 662, rx: 20, ry: 13, fill: '#ffd56b' }, g));
      [[44, 508, 9], [300, 504, 11], [356, 505, 10]].forEach(([x, y, r]) => { el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#dcf2ff', 'stroke-width': 1.5 }, g); });
    } },
    { key: 'onsen', water: '#a6e3d6', rim: '#c4efe4', rinser: 'bucket', steam: true, back(g, defs) {
      const sky = defs.querySelector('#bath-dusk') ? el('linearGradient') : el('linearGradient', { id: 'bath-dusk', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': '#7a86d8' }, sky); el('stop', { offset: 1, 'stop-color': '#f4b8c8' }, sky);
      el('rect', { x: -800, y: -900, width: 2000, height: 1300, fill: 'url(#bath-dusk)' }, g);
      el('circle', { cx: 300, cy: 110, r: 30, fill: '#fff6d0' }, g);
      el('circle', { cx: 290, cy: 102, r: 8, fill: '#fff', opacity: .5 }, g);
      [[60, 120], [150, 90], [210, 150], [360, 190], [110, 200]].forEach(([x, y], k) => el('circle', { cx: x, cy: y, r: 2.6, fill: '#fff', class: 'twinkle', style: `animation-delay:-${k * .5}s` }, g));
      el('path', { d: 'M-800,260 Q60,200 160,250 Q250,210 340,240 Q400,230 1200,250 L1200,420 L-800,420Z', fill: '#6a78b8', opacity: .55 }, g);
      // bamboo fence
      for (let x = -20; x < 420; x += 30) {
        el('rect', { x, y: 270, width: 26, height: 260, rx: 8, fill: x % 60 ? '#c89a6a' : '#b88a5a' }, g);
        el('rect', { x: x + 4, y: 278, width: 6, height: 240, rx: 3, fill: '#fff', opacity: .18 }, g);
      }
      [320, 420].forEach(y => el('rect', { x: -800, y, width: 2000, height: 10, rx: 5, fill: '#8a6a4a' }, g));
      // maple branch
      el('path', { d: 'M420,200 Q330,220 280,260', stroke: '#8a5a3a', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
      [[296, 252], [326, 232], [356, 222], [312, 270]].forEach(([x, y], k) => el('path', { d: 'M0,-12 L4,-4 L12,-6 L7,1 L12,6 L3,5 L1,12 L0,6 L-1,12 L-3,5 L-12,6 L-7,1 L-12,-6 L-4,-4Z', fill: k % 2 ? '#ff7a4a' : '#ff5a5a', transform: `translate(${x} ${y}) rotate(${k * 30})` }, g));
      el('rect', { x: -800, y: 520, width: 2000, height: 1200, fill: '#8f9cb4' }, g);
      el('rect', { x: 22, y: 476, width: 356, height: 34, rx: 16, fill: '#7c8aa6' }, g);
    }, front(g) {
      el('rect', { x: -800, y: 640, width: 2000, height: 1200, fill: '#a3aec4' }, g);
      for (let x = -40; x < 440; x += 64) el('rect', { x, y: 676, width: 58, height: 34, rx: 10, fill: '#b5bfd2' }, g);
      for (let x = -8; x < 440; x += 64) el('rect', { x, y: 716, width: 58, height: 40, rx: 10, fill: '#b5bfd2' }, g);
      const rocks = [[30, 560, 46, 50], [100, 600, 52, 44], [176, 612, 50, 36], [250, 606, 54, 42], [326, 594, 50, 46], [384, 556, 40, 54], [20, 520, 30, 26], [380, 512, 28, 24]];
      rocks.forEach(([x, y, rx, ry], k) => {
        el('ellipse', { cx: x, cy: y, rx, ry, fill: k % 2 ? '#948c98' : '#a8a0a6' }, g);
        el('ellipse', { cx: x - rx * .3, cy: y - ry * .45, rx: rx * .38, ry: ry * .2, fill: '#fff', opacity: .3 }, g);
        if (k % 3 === 0) el('ellipse', { cx: x + rx * .3, cy: y - ry * .7, rx: rx * .3, ry: ry * .16, fill: '#8fbf6a', opacity: .8 }, g);
      });
      el('path', { d: 'M-10,520 Q60,506 120,516 Q200,500 280,514 Q340,504 410,520 L410,546 Q300,530 200,542 Q100,532 -10,546Z', fill: '#7a7a8c' }, g);
      // wooden bucket on the floor
      el('path', { d: 'M48,690 L104,690 L98,736 L54,736Z', fill: '#d9a86a' }, g);
      el('rect', { x: 44, y: 684, width: 64, height: 9, rx: 4.5, fill: '#c48a46' }, g);
      [704, 724].forEach(y => el('rect', { x: 50, y, width: 52, height: 4, fill: '#a8744a' }, g));
    } },
    { key: 'night', water: '#ffc8e2', rim: '#ffe0ef', rinser: 'shower', back(g, defs) {
      const tile = defs.querySelector('#bath-ntile') ? el('pattern') : el('pattern', { id: 'bath-ntile', width: 50, height: 50, patternUnits: 'userSpaceOnUse' }, defs);
      el('rect', { width: 50, height: 50, fill: '#8c7ac8' }, tile);
      el('rect', { x: 3, y: 3, width: 44, height: 44, rx: 10, fill: '#9d8bd6' }, tile);
      el('circle', { cx: 13, cy: 13, r: 3, fill: '#fff', opacity: .3 }, tile);
      el('rect', { x: -800, y: -900, width: 2000, height: 1500, fill: 'url(#bath-ntile)' }, g);
      el('rect', { x: -800, y: 600, width: 2000, height: 1200, fill: '#6f5fb0' }, g);
      // round window with the night sky
      el('circle', { cx: 300, cy: 156, r: 66, fill: '#fff4d8' }, g);
      el('circle', { cx: 300, cy: 156, r: 56, fill: '#2f3778' }, g);
      el('path', { d: 'M318,124 A24,24 0 1 0 330,166 A18,18 0 1 1 318,124Z', fill: '#ffe07a' }, g);
      [[268, 128], [282, 186], [256, 160], [330, 196]].forEach(([x, y], k) => el('path', { d: 'M0,-6 Q1,-1 6,0 Q1,1 0,6 Q-1,1 -6,0 Q-1,-1 0,-6Z', fill: '#fff', class: 'twinkle', style: `animation-delay:-${k * .6}s` }, el('g', { transform: `translate(${x} ${y})` }, g)));
      // warm lamp
      el('rect', { x: 65, y: 90, width: 4, height: 160, fill: '#5a4c98' }, g);
      el('circle', { cx: 67, cy: 90, r: 6, fill: '#5a4c98' }, g);
      el('path', { d: 'M44,250 L90,250 L80,290 L54,290Z', fill: '#ffd56b' }, g);
      el('ellipse', { cx: 67, cy: 290, rx: 13, ry: 4, fill: '#fff6c0' }, g);
      el('rect', { x: 22, y: 470, width: 356, height: 40, rx: 16, fill: '#f0b8d4' }, g);
    }, front(g) {
      el('ellipse', { cx: 200, cy: 668, rx: 182, ry: 16, fill: '#2b2340', opacity: .16 }, g);
      el('rect', { x: 50, y: 700, width: 300, height: 44, rx: 22, fill: '#ffd56b' }, g);
      [96, 140, 184, 228, 272].forEach(x => el('rect', { x, y: 708, width: 20, height: 28, rx: 10, fill: '#ffe39a' }, g));
      el('path', { d: 'M26,516 L374,516 L370,600 Q366,652 314,652 L86,652 Q34,652 30,600Z', fill: '#ffd8e8' }, g);
      el('rect', { x: 14, y: 506, width: 372, height: 24, rx: 12, fill: '#ffe8f2', stroke: '#f5c4da', 'stroke-width': 2 }, g);
      el('path', { d: 'M60,540 Q58,600 90,630', stroke: '#fff0f6', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, g);
      [76, 324].forEach(x => el('ellipse', { cx: x, cy: 662, rx: 20, ry: 13, fill: '#ffd56b' }, g));
      // a heap of bubble-bath foam along the rim
      [[30, 500, 16], [56, 494, 20], [86, 500, 14], [300, 496, 18], [328, 490, 22], [358, 498, 17], [116, 506, 11], [276, 506, 12]].forEach(([x, y, r]) => {
        el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#f5d8ea', 'stroke-width': 1.5 }, g);
        el('circle', { cx: x - r * .36, cy: y - r * .38, r: r * .22, fill: '#fde8f4' }, g);
      });
    } }
  ];

  const bathToy = {
    id: 'bath', name: 'おふろ', color: '#8fe0e6',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#c9f2f2' }, g);
      [-60, -20, 20, 60].forEach(x => el('rect', { x: x - 18, y: -78, width: 36, height: 120, rx: 6, fill: '#ddf8f6' }, g));
      makeAnimal('dog', g, 0, -6, .58);
      const f = el('g', { transform: 'translate(-14 -36) scale(.9)' }, g); foamBlob(f, 5);
      const f2 = el('g', { transform: 'translate(18 -30) scale(.7)' }, g); foamBlob(f2, 4);
      el('rect', { x: -80, y: 20, width: 160, height: 14, fill: '#9fe6f3' }, g);
      el('path', { d: 'M-70,26 L70,26 L62,62 Q60,74 46,74 L-46,74 Q-60,74 -62,62Z', fill: '#fff' }, g);
      el('rect', { x: -76, y: 22, width: 152, height: 12, rx: 6, fill: '#f4fbff' }, g);
      el('rect', { x: -64, y: 46, width: 128, height: 6, fill: '#ffc4d2' }, g);
      const d = el('g', { transform: 'translate(-50 22) scale(.55)' }, g); duck(d);
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      const bg = el('radialGradient', { id: 'bath-bub', cx: .35, cy: .32, r: .75 }, defs);
      [[0, '#ffffff', .95], [.55, '#e9fbff', .35], [.85, '#d4c8ff', .45], [1, '#ffffff', .9]].forEach(([o, c, a]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, bg));

      /* ---------- layers ---------- */
      const backL = el('g', {}, svg);
      const steamL = el('g', { 'pointer-events': 'none' }, svg);
      const lookG = el('g', {}, svg);
      const animalLayer = el('g', {}, lookG);
      const water = el('path', { fill: '#9fe6f3', opacity: .95 }, svg);
      const waterRim = el('rect', { x: 24, y: 506, width: 352, height: 12, fill: '#b7eef7' }, svg);
      const toyL = el('g', {}, svg);
      const frontL = el('g', {}, svg);
      const floorL = el('g', {}, svg);
      const fx = el('g', { 'pointer-events': 'none' }, svg);

      /* ---------- the rinser: a shower (tiles, night) or a wooden bucket (onsen) ---------- */
      const SHX = 168, SHY = 150;
      const showerO = el('g', { transform: `translate(${SHX} -300)`, style: 'display:none' }, svg);
      const shower = el('g', { class: 'tb' }, showerO);
      const showerArt = el('g', {}, shower);
      const bucketArt = el('g', {}, shower);
      el('rect', { x: -9, y: -900, width: 18, height: 860, fill: '#cfe0ec' }, showerArt);
      el('rect', { x: -14, y: -60, width: 28, height: 22, rx: 6, fill: '#b9d3e4' }, showerArt);
      el('path', { d: 'M-74,10 Q-72,-40 0,-44 Q72,-40 74,10Z', fill: '#e8f3fa', stroke: '#b9d3e4', 'stroke-width': 3 }, showerArt);
      el('ellipse', { cx: 0, cy: 10, rx: 74, ry: 15, fill: '#a9cde3' }, showerArt);
      for (let i = -3; i <= 3; i++) el('circle', { cx: i * 18, cy: 11, r: 3.2, fill: '#6fa4c8' }, showerArt);
      el('ellipse', { cx: -36, cy: -22, rx: 14, ry: 6, fill: '#fff', transform: 'rotate(-18 -36 -22)' }, showerArt);
      el('path', { d: 'M-70,-40 L70,-40 L56,30 L-56,30Z', fill: '#d9a86a' }, bucketArt);
      el('ellipse', { cx: 0, cy: -40, rx: 72, ry: 14, fill: '#c48a46' }, bucketArt);
      el('ellipse', { cx: 0, cy: -38, rx: 62, ry: 10, fill: '#a6e3d6' }, bucketArt);
      [-8, 14].forEach(y => el('rect', { x: -66, y, width: 132, height: 7, rx: 3, fill: '#a8744a', transform: `scale(${1 - (y + 8) / 200} 1)` }, bucketArt));
      el('path', { d: 'M-50,-30 L-44,22', stroke: '#fff', 'stroke-width': 6, opacity: .3, 'stroke-linecap': 'round' }, bucketArt);
      [-16, 16].forEach(x => { el('ellipse', { cx: x, cy: -14, rx: 4.5, ry: 5.5, fill: '#3a2f5b' }, shower); el('circle', { cx: x - 1.5, cy: -16, r: 1.6, fill: '#fff' }, shower); });
      el('path', { d: 'M-7,-4 Q0,2 7,-4', stroke: '#3a2f5b', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, shower);
      [-30, 30].forEach(x => el('ellipse', { cx: x, cy: -6, rx: 6, ry: 4, fill: '#ffa3b8', opacity: .75 }, shower));
      el('circle', { cx: 0, cy: -8, r: 86, fill: 'transparent' }, shower);
      const bubLayer = el('g', {}, svg);
      const ghost = ctx.ghost(svg, { x: 340, y: 300, s: .6 });

      /* ---------- toys ---------- */
      const duckO = el('g', {}, toyL), duckB = el('g', { class: 'tb' }, duckO);
      const boatO = el('g', {}, toyL), boatB = el('g', { class: 'tb' }, boatO); boat(boatB);
      const whaleO = el('g', { transform: 'translate(318 704)' }, floorL), whaleB = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, whaleO); whale(whaleB);
      const soapO = el('g', { transform: 'translate(86 714)' }, floorL), soapB = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, soapO); soap(soapB);

      /* ---------- state ---------- */
      let themeI = 0, theme = THEMES[0], kindI = 0, roundN = 0, rare = false;
      let phase = 'soap', animal = null, eyes = null, foam = [], foamAmt = 0, rubbing = false, last = null;
      let sfxT = 0, bubT = 0, wigT = 0, blissT = 0, sprayUntil = 0, pourT = 0, rinseT = 0, talkedFoam = false, shakeQueued = false;
      const drops = [], flings = [], bubbles = [], steam = [];
      let duckHop = 0, duckN = 0, boatX = 336, boatTo = null, boatDir = 1;

      function applyTheme(i, fade) {
        themeI = i; theme = THEMES[i];
        steam.splice(0).forEach(q => q.node.remove());
        const nb = el('g', {}, backL), nf = el('g', {}, frontL);
        theme.back(nb, defs); theme.front(nf);
        const olds = [...backL.children].filter(n => n !== nb).concat([...frontL.children].filter(n => n !== nf));
        if (fade) {
          [nb, nf].forEach(n => n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700 }));
          ctx.after(720, () => olds.forEach(n => n.remove()));
        } else olds.forEach(n => n.remove());
        water.setAttribute('fill', theme.water); waterRim.setAttribute('fill', theme.rim);
        showerArt.style.display = theme.rinser === 'shower' ? '' : 'none';
        bucketArt.style.display = theme.rinser === 'bucket' ? '' : 'none';
        whaleO.style.display = '';
        duckB.replaceChildren(); duck(duckB, rare);
      }

      function spawnAnimal(rise) {
        const kind = KINDS[kindI];
        const a = makeAnimal(kind, animalLayer, AX, rise ? 620 : AY, rise ? .8 : AS);
        a.body.insertBefore(el('circle', { r: 76, fill: 'transparent' }), a.body.firstChild);
        a.fluff = el('g', { style: 'display:none' }, a.body);
        a.body.insertBefore(a.fluff, a.body.children[1]);
        for (let k = 0; k < 16; k++) {
          const ang = k / 16 * Math.PI * 2;
          el('circle', { cx: (Math.cos(ang) * 47).toFixed(1), cy: (Math.sin(ang) * 46 - 2).toFixed(1), r: 15, fill: FUR[kind] }, a.fluff);
        }
        a.foamG = el('g', {}, a.body);
        a.float(true);
        a.outer.addEventListener('pointerdown', onAnimal);
        [...a.body.children].some(n => { if (n.tagName === 'g' && n !== a.fluff) { eyes = n; return true; } return false; });
        if (rise) {
          A.sfx('splash', { vol: .5, rate: 1.1 });
          ctx.tween(600, k => a.place(AX, 620 - (620 - AY) * k, .8 + (AS - .8) * k), () => { a.sing(400); voice(); }, easeBack);
          ctx.after(80, () => splash(AX, 12));
        }
        animal = a;
      }
      function voice() {
        const k = animal.kind;
        if (k === 'dog' || k === 'cat' || k === 'frog') { if (!A.animal(k, { rate: rand(.95, 1.1) })) A.voice(k, 520); }
        else { A.voice(k === 'bear' ? 'dog' : 'chick', k === 'bear' ? 300 : 620); A.giggle(); }
      }
      function blink() {
        if (!animal || phase === 'shake' || animal._shut) return;
        animal.sleep(true); ctx.after(140, () => { if (animal && !animal._shut) animal.sleep(false); });
      }
      function shut(on) { if (!animal) return; animal._shut = on; animal.sleep(on); }

      /* ---------- soap ---------- */
      function squish() {
        const now = performance.now();
        if (now - sfxT > 80) {
          sfxT = now;
          const f = rand(420, 700);
          A.osc(f, { slide: f * 1.7, slideT: .07, r: .09, vol: .08, wet: .15 });
        }
        if (now - bubT > 420) { bubT = now; A.sfx(Math.random() < .5 ? 'bubbles' : 'bubble', { vol: .35, rate: rand(.9, 1.25) }); }
      }
      function addFoam(p, burst) {
        if (phase !== 'soap' || !animal) return;
        let lx = (p.x - AX) / AS, ly = (p.y - AY) / AS;
        const d = Math.hypot(lx, ly);
        if (d > 100) return;
        if (d > 56) { lx *= 56 / d; ly *= 56 / d; }
        ly = Math.min(ly, 50);
        const n = burst ? 3 : 1;
        for (let i = 0; i < n; i++) {
          const x = lx + (i ? rand(-24, 24) : 0), y = Math.min(52, ly + (i ? rand(-20, 20) : 0));
          const near = foam.find(f => Math.hypot(f.x - x, f.y - y) < 16);
          if (near) {
            near.s = Math.min(1.5, near.s + .12);
            near.g.setAttribute('transform', `translate(${near.x.toFixed(1)} ${near.y.toFixed(1)}) scale(${near.s.toFixed(2)})`);
            near.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 200 });
          } else if (foam.length < 22) {
            const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, animal.foamG);
            const inner = el('g', { class: 'tb' }, g);
            foamBlob(inner);
            inner.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.3)', offset: .6 }, { transform: 'scale(1)' }], { duration: 280, easing: 'ease-out' });
            foam.push({ g, inner, x, y, s: 1 });
          }
          foamAmt++;
        }
        squish();
        const now = performance.now();
        if (now - wigT > 260) {
          wigT = now;
          animal.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06,.94)' }, { transform: 'scale(.97,1.04)' }, { transform: 'scale(1)' }], { duration: 260 });
        }
        shut(true); blissT = now;
        ctx.after(750, () => { if (animal && performance.now() - blissT > 700 && phase === 'soap') shut(false); });
        if (!talkedFoam) { talkedFoam = true; ghost.set('happy'); ghost.talk('あわあわ'); ctx.after(1400, () => { if (phase === 'soap') ghost.set('normal'); }); }
        if (foamAmt >= 40 && foam.length >= 12) toRinse();
      }
      function toRinse() {
        phase = 'rinse'; rubbing = false;
        A.giggle(); shut(false); animal.sing(400);
        ctx.sparkle(AX, AY - 40, 5, 70, '#ffffff');
        ghost.set('happy'); ghost.hop();
        ctx.after(500, () => ghost.talk(theme.rinser === 'bucket' ? 'ざあー' : 'シャワー しよう'));
        showerO.style.display = '';
        A.whoosh();
        ctx.tween(620, k => showerO.setAttribute('transform', `translate(${SHX} ${(-300 + (SHY + 300) * k).toFixed(1)})`), () => {
          shower.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0deg)' }], { duration: 500 });
        }, easeBack);
      }

      /* ---------- rinse ---------- */
      function spray() {
        if (phase !== 'rinse') return;
        haptic();
        const now = performance.now();
        if (now - pourT > 1100) { pourT = now; A.sfx('pour', { vol: .55, rate: rand(.95, 1.1) }) || A.noise({ type: 'highpass', from: 2600, to: 4200, dur: 1.3, vol: .16 }); }
        sprayUntil = now + 1300;
        if (theme.rinser === 'bucket') shower.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(28deg)', offset: .3 }, { transform: 'rotate(28deg)', offset: .8 }, { transform: 'rotate(0deg)' }], { duration: 1300 });
        else shower.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.9)' }, { transform: 'scale(.96,1.05)' }, { transform: 'scale(1)' }], { duration: 300 });
        shut(true);
      }
      function rinseOne() {
        let bi = 0;
        foam.forEach((f, i) => { if (f.y < foam[bi].y) bi = i; });
        const f = foam.splice(bi, 1)[0];
        f.inner.animate([{ transform: 'translate(0px,0px) scale(1)', opacity: 1 }, { transform: 'translate(0px,50px) scale(.35)', opacity: 0 }], { duration: 440, fill: 'forwards', easing: 'ease-in' }).onfinish = () => f.g.remove();
        if (Math.random() < .35) A.sfx('splash2', { vol: .25, rate: rand(1.1, 1.4) });
        if (!foam.length && !shakeQueued) {
          shakeQueued = true;
          ctx.after(700, () => {
            sprayUntil = 0; phase = 'shake';
            ctx.tween(480, k => showerO.setAttribute('transform', `translate(${SHX} ${(SHY - 460 * k).toFixed(1)})`), () => { showerO.style.display = 'none'; }, easeIn);
            shake();
          });
        }
      }
      function shake() {
        ghost.talk('ぶるぶる〜');
        shut(true);
        animal.body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(14deg)' }, { transform: 'rotate(-12deg)' },
          { transform: 'rotate(12deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0deg)' }], { duration: 950 });
        A.sfx('spin', { vol: .5 }) || A.whoosh();
        for (let i = 0; i < 26; i++) {
          const a = rand(0, Math.PI * 2), sp = rand(220, 420), r = rand(60, 84);
          const node = el('ellipse', { rx: 4, ry: 6, fill: '#7fd0ff' }, fx);
          flings.push({ node, x: AX + Math.cos(a) * r, y: AY + Math.sin(a) * r * .9, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, life: rand(.7, 1.1), t: i * .02 });
        }
        ctx.after(1100, towel);
      }

      /* ---------- towel wrap, then fluffy ---------- */
      function towel() {
        phase = 'towel';
        const o = el('g', { transform: 'translate(480 200) rotate(30)' }, lookG);
        const tb = el('g', { class: 'tb' }, o);
        const c = ['#ffb3c8', '#bfe3ff', '#ffe08a'][themeI];
        el('path', { d: 'M-108,10 Q-110,-40 -60,-46 Q0,-30 60,-46 Q110,-40 108,10 L104,118 L-104,118Z', fill: c }, tb);
        [30, 70].forEach(y => el('rect', { x: -106, y, width: 212, height: 10, fill: '#fff', opacity: .55 }, tb));
        el('path', { d: 'M-60,-46 Q0,-20 60,-46 Q30,10 0,14 Q-30,10 -60,-46Z', fill: '#fff', opacity: .35 }, tb);
        el('ellipse', { cx: -60, cy: -20, rx: 22, ry: 8, fill: '#fff', opacity: .4, transform: 'rotate(-20 -60 -20)' }, tb);
        const hat = el('g', { transform: 'translate(480 120)' }, lookG);
        el('path', { d: 'M-56,10 Q-60,-34 0,-40 Q60,-34 56,10 Q0,-4 -56,10Z', fill: c }, hat);
        el('circle', { cx: 0, cy: -40, r: 12, fill: c }, hat);
        el('ellipse', { cx: -24, cy: -20, rx: 12, ry: 5, fill: '#fff', opacity: .45 }, hat);
        const TX = AX, TY = AY + 60, HX = AX, HY = AY - 64;
        A.sfx('whoosh2', { vol: .5 }) || A.whoosh();
        ctx.tween(560, k => o.setAttribute('transform', `translate(${(480 + (TX - 480) * k).toFixed(1)} ${(200 + (TY - 200) * k).toFixed(1)}) rotate(${(30 * (1 - k)).toFixed(1)})`), () => {
          A.sfx('flip', { vol: .6 }); haptic(15);
          tb.animate([{ transform: 'scale(1.15,.85)' }, { transform: 'scale(.95,1.05)' }, { transform: 'scale(1)' }], { duration: 320 });
        }, easeBack);
        ctx.after(220, () => ctx.tween(520, k => hat.setAttribute('transform', `translate(${(480 + (HX - 480) * k).toFixed(1)} ${(120 + (HY - 120) * k).toFixed(1)})`), () => A.sfx('pop2', { vol: .5 }), easeBack));
        ghost.talk('ふわふわ〜');
        // rub-a-dub
        for (let i = 0; i < 4; i++) ctx.after(800 + i * 260, () => {
          A.noise({ type: 'bandpass', from: 900 + i * 200, dur: .2, vol: .14 });
          tb.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${i % 2 ? 4 : -4}deg)` }, { transform: 'rotate(0deg)' }], { duration: 240 });
          animal.body.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${i % 2 ? -5 : 5}deg)` }, { transform: 'rotate(0deg)' }], { duration: 240 });
          ctx.sparkle(AX + rand(-80, 80), AY + rand(-40, 60), 1, 10, '#ffffff');
        });
        ctx.after(1950, () => {
          A.sfx('whoosh', { vol: .5 }) || A.whoosh();
          ctx.tween(520, k => o.setAttribute('transform', `translate(${(TX - 520 * k).toFixed(1)} ${(TY - 360 * k).toFixed(1)}) rotate(${(-40 * k).toFixed(1)})`), () => o.remove(), easeIn);
          ctx.tween(520, k => hat.setAttribute('transform', `translate(${(HX + 420 * k).toFixed(1)} ${(HY - 300 * k).toFixed(1)}) rotate(${(50 * k).toFixed(1)})`), () => hat.remove(), easeIn);
          animal.fluff.style.display = '';
          animal.fluff.setAttribute('class', 'tb');
          animal.fluff.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: .6 }, { transform: 'scale(1)', opacity: 1 }], { duration: 500, easing: 'ease-out' });
          animal.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18,.85)' }, { transform: 'scale(.92,1.1)' }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
          A.sfx('sparkle', { vol: .6 }) || A.twinkle();
          ctx.after(250, celebrate);
        });
      }
      function celebrate() {
        phase = 'party';
        shut(false); animal.sing(700); voice();
        A.tada(); haptic(30);
        ctx.confetti(AX, AY - 30, 36);
        ctx.after(800, () => { ctx.confetti(90, 380, 24); ctx.confetti(310, 380, 24); });
        ctx.sparkle(AX, AY, 8, 90, '#ffffff');
        ctx.after(300, () => ctx.sparkle(AX, AY - 10, 6, 80));
        const shine = el('g', { 'pointer-events': 'none' }, animal.body);
        [[-50, -44, 1], [48, -24, .8], [-26, 34, .6], [34, 40, .7]].forEach(([x, y, s], i) => {
          const o = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, shine);
          el('path', { d: 'M0,-14 Q2,-2 14,0 Q2,2 0,14 Q-2,2 -14,0 Q-2,-2 0,-14Z', fill: '#fff', class: 'twinkle', style: `animation-delay:-${i * .5}s` }, o);
        });
        if (rare) rainbow();
        animal.body.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(-16px) scale(.94,1.06)' }, { transform: 'translateY(0px) scale(1.06,.94)' }, { transform: 'translateY(0px) scale(1)' }], { duration: 560, iterations: 3, delay: 200 });
        ghost.set('happy'); ghost.hop();
        ghost.moveTo(300, 250, .66, 450, () => {
          ghost.talk('ぴかぴか！'); ghost.giggle();
          ctx.after(600, () => ghost.moveTo(100, 260, .66, 700, () => { ghost.hop(); ghost.moveTo(340, 300, .6, 800, () => ghost.hop(), easeInOut); }, easeInOut));
        }, easeBack);
        ctx.after(1400, () => { A.twinkle(); ctx.sparkle(AX, AY, 5, 80, '#ffffff'); });
        ctx.after(3300, nextRound);
      }
      function rainbow() {
        const r = el('g', { 'pointer-events': 'none', opacity: 0 }, backL);
        ['#ff9aa8', '#ffd56b', '#9fe6a0', '#8fc8ff', '#c9a7ff'].forEach((c, k) => el('path', { d: `M${40 + k * 12},470 A${160 - k * 12},${190 - k * 12} 0 0 1 ${360 - k * 12},470`, stroke: c, 'stroke-width': 12, fill: 'none', opacity: .8 }, r));
        r.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: 3200 }).onfinish = () => r.remove();
        A.sfx('jingle', { vol: .4, when: .4 });
      }
      function nextRound() {
        const old = animal;
        old.outer.style.pointerEvents = 'none';
        ghost.set('normal'); ghost.moveTo(340, 300, .6, 500);
        A.sfx('splash2', { vol: .5 }) || A.noise({ type: 'lowpass', from: 1400, to: 300, dur: .5, vol: .18 });
        ctx.tween(440, k => old.place(AX, AY + 220 * k, AS - .6 * k), () => old.outer.remove(), easeIn);
        ctx.after(300, () => splash(AX, 16));
        roundN++;
        kindI = (kindI + 1) % KINDS.length;
        rare = Math.random() < 1 / 6;
        foam = []; foamAmt = 0; talkedFoam = false; shakeQueued = false;
        ctx.after(450, () => { applyTheme((themeI + 1) % THEMES.length, true); A.sfx('sparkle', { vol: .4 }); });
        ctx.after(900, () => {
          spawnAnimal(true);
          phase = 'soap';
          ctx.after(450, () => ghost.talk(NAMES[animal.kind] + ' だよ'));
        });
      }

      /* ---------- water fun ---------- */
      function splash(x, n = 7) {
        for (let i = 0; i < n; i++) {
          const node = el('circle', { r: rand(3, 6).toFixed(1), fill: '#e8f9ff', stroke: '#7fd0ff', 'stroke-width': 1.5 }, fx);
          flings.push({ node, x: x + rand(-14, 14), y: WY + 4, vx: rand(-120, 120), vy: rand(-420, -220), life: 1, t: 0 });
        }
        A.sfx(Math.random() < .5 ? 'splash' : 'splash2', { vol: .35, rate: rand(.95, 1.3) }) || A.noise({ type: 'lowpass', from: 1200, dur: .18, vol: .08 });
      }
      function ring(x, y, w = 40) {
        const r = el('ellipse', { cx: x, cy: y, rx: w, ry: w * .25, fill: 'none', stroke: '#fff', 'stroke-width': 3, class: 'tb' }, fx);
        r.animate([{ transform: 'scale(.4)', opacity: .9 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 600 }).onfinish = () => r.remove();
      }
      function makeBubble(x, y, r) {
        if (bubbles.length >= 8) return;
        const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, bubLayer);
        const inner = el('g', { class: 'tb' }, g);
        el('circle', { r: Math.max(36, r + 12), fill: 'transparent' }, inner);
        el('circle', { r, fill: 'url(#bath-bub)', stroke: '#fff', 'stroke-width': 2 }, inner);
        el('ellipse', { cx: -r * .38, cy: -r * .4, rx: r * .26, ry: r * .16, fill: '#fff', transform: `rotate(-35 ${(-r * .38).toFixed(1)} ${(-r * .4).toFixed(1)})` }, inner);
        inner.animate([{ transform: 'scale(.2)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
        const b = { g, x0: x, x, y, r, ph: rand(0, 6), sp: rand(34, 56) };
        bubbles.push(b);
        g.addEventListener('pointerdown', e => {
          e.stopPropagation();
          if (b.dead) return;
          b.dead = true; haptic(8);
          A.pop();
          bubbles.splice(bubbles.indexOf(b), 1);
          const rg = el('circle', { r, fill: 'none', stroke: '#fff', 'stroke-width': 3, class: 'tb' }, inner);
          inner.querySelectorAll('circle:not(:last-child), ellipse').forEach(n => n.remove());
          rg.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.7)', opacity: 0 }], { duration: 260 }).onfinish = () => g.remove();
          ctx.sparkle(b.x, b.y, 3, r, '#ffffff');
          const p = ctx.point(e);
          if (phase === 'soap' && animal && Math.hypot(p.x - AX, p.y - AY) < 120) { rubbing = true; last = p; addFoam(p, true); }
          else if (phase === 'rinse') spray();
        });
      }
      function squeak() {
        A.osc(1050, { type: 'triangle', slide: 1600, slideT: .06, hold: .05, vib: 22, vibD: .04, r: .1, vol: .16, wet: .2 });
        A.osc(1600, { type: 'triangle', slide: 950, slideT: .1, when: .12, r: .1, vol: .12, wet: .2 });
      }
      duckO.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        duckN++;
        if (duckN % 3 === 0) A.animal('duck', { vol: .7 }) || squeak(); else squeak();
        A.sfx('blink', { vol: .4, rate: 1.3 });
        duckHop = 1;
        duckB.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22,.78)' }, { transform: 'scale(.88,1.16)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' });
        ctx.after(300, () => { ring(62, WY + 6); splash(62, 4); });
        ctx.sparkle(62, WY - 40, rare ? 6 : 2, 30, rare ? '#ffe066' : '#ffffff');
        if (eyes) look(62, WY);
      });
      boatO.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        boatB.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15,.88)' }, { transform: 'scale(.94,1.08)' }, { transform: 'scale(1)' }], { duration: 360 });
        A.osc(392, { type: 'triangle', hold: .16, r: .2, vol: .16, wet: .3 }); A.osc(523, { type: 'triangle', when: .26, hold: .24, r: .3, vol: .16, wet: .3 });
        if (boatTo == null) { boatTo = boatX > 200 ? 74 : 336; A.sfx('whoosh2', { vol: .3, when: .2 }); }
      });
      whaleO.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic(15);
        whaleB.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18,.8)' }, { transform: 'scale(.9,1.14)', offset: .55 }, { transform: 'scale(1)' }], { duration: 480, easing: 'ease-out' });
        A.sfx('splash2', { vol: .5, rate: rand(1.1, 1.3), when: .1 }) || A.boing();
        A.osc(300, { slide: 700, slideT: .15, r: .12, vol: .12 });
        for (let i = 0; i < 14; i++) {
          const node = el('ellipse', { rx: 3.5, ry: 5.5, fill: '#bfe8ff', stroke: '#7fc4ff', 'stroke-width': 1.2 }, fx);
          flings.push({ node, x: 318 + rand(-4, 4), y: 672, vx: rand(-90, 60), vy: rand(-520, -380), life: 1.1, t: i * .025 });
        }
        if (eyes) look(318, 640);
      });
      soapO.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic(8);
        soapB.animate([{ transform: 'translateX(0px) scale(1)' }, { transform: 'translateX(14px) scale(1.12,.86)' }, { transform: 'translateX(-8px) scale(.94,1.06)' }, { transform: 'translateX(0px) scale(1)' }], { duration: 520, easing: 'ease-out' });
        A.sfx('slide', { vol: .3, rate: rand(1.3, 1.6) }) || A.boing();
        for (let i = 0; i < 3; i++) ctx.after(i * 110, () => makeBubble(86 + rand(-20, 20), 680, rand(12, 18)));
        A.sfx('bubbles', { vol: .3, when: .1 });
      });

      /* ---------- input ---------- */
      function look(x, y) {
        if (!eyes) return;
        const dx = clamp((x - AX) / 45, -4, 4), dy = clamp((y - AY) / 60, -3, 3);
        eyes.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`);
      }
      function onAnimal(e) {
        e.stopPropagation(); haptic(8);
        const p = ctx.point(e);
        if (phase === 'soap') { rubbing = true; last = p; addFoam(p, true); }
        else if (phase === 'rinse') spray();
        else { animal.sing(400); voice(); ctx.sparkle(p.x, p.y, 3, 24, '#ffffff'); }
      }
      showerO.addEventListener('pointerdown', e => { e.stopPropagation(); spray(); });
      ghost.pos.addEventListener('pointerdown', e => { e.stopPropagation(); if (phase === 'party') return; ghost.giggle(); ctx.after(900, () => { if (phase !== 'party') ghost.set('normal'); }); });
      ctx.on(ctx.host, 'pointerdown', e => { const p = ctx.point(e); look(p.x, p.y); }, true);
      ctx.on(ctx.host, 'pointermove', e => {
        if (!rubbing) return;
        const p = ctx.point(e);
        if (Math.hypot(p.x - last.x, p.y - last.y) < 14) return;
        last = p; addFoam(p, false);
      });
      ctx.on(window, 'pointerup', () => { rubbing = false; });
      ctx.on(window, 'pointercancel', () => { rubbing = false; });
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e);
        if (p.x < 80 && p.y < 80) return;
        haptic(6);
        if (phase === 'rinse' && p.y < 320) return spray();
        if (p.y > 490 && p.y < 660 && p.x > 14 && p.x < 386) { splash(p.x); ring(p.x, WY + 6, 30); }
        else if (p.y <= 490) { makeBubble(p.x, p.y, rand(14, 22)); A.sfx('bubble', { vol: .35, rate: rand(.9, 1.4) }); }
        else { ctx.sparkle(p.x, p.y, 3, 20, '#ffffff'); A.twinkle(); }
      });

      /* ---------- frame loop ---------- */
      ctx.loop((dt, t) => {
        let d = 'M14,520 L14,504';
        for (let x = 14; x <= 386; x += 31) d += ` L${x},${(WY + Math.sin(t * 2.2 + x * .045) * 3).toFixed(1)}`;
        water.setAttribute('d', d + ' L386,520Z');
        duckHop = Math.max(0, duckHop - dt * 2.4);
        const hop = Math.sin(duckHop * Math.PI) * 30;
        duckO.setAttribute('transform', `translate(62 ${(WY + 2 + Math.sin(t * 2.2 + 3.3) * 3 - hop).toFixed(1)}) rotate(${(Math.sin(t * 1.7) * 6).toFixed(1)})`);
        if (boatTo != null) {
          const dir = Math.sign(boatTo - boatX);
          boatDir = dir;
          boatX += dir * 150 * dt;
          if (Math.random() < .25) { const w = el('circle', { cx: boatX - dir * 36, cy: WY + 10, r: rand(3, 6), fill: '#fff', opacity: .8, class: 'tb' }, fx); w.animate([{ opacity: .8, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.8)' }], { duration: 600 }).onfinish = () => w.remove(); }
          if ((dir > 0 && boatX >= boatTo) || (dir < 0 && boatX <= boatTo)) { boatX = boatTo; boatTo = null; ring(boatX, WY + 8); }
        }
        boatO.setAttribute('transform', `translate(${boatX.toFixed(1)} ${(WY + 4 + Math.sin(t * 2.2 + boatX * .045) * 3).toFixed(1)}) rotate(${(Math.sin(t * 2) * 4).toFixed(1)}) scale(${boatDir < 0 ? -1 : 1} 1)`);
        const now = performance.now();
        if (now < sprayUntil) {
          const bucket = theme.rinser === 'bucket';
          drops.push({ node: el('ellipse', { rx: bucket ? 5 : 2.8, ry: bucket ? 9 : 7, fill: '#7fd0ff' }, fx), x: bucket ? SHX + 50 + rand(-14, 14) : SHX + rand(-64, 64), y: SHY + 22, vx: bucket ? rand(-20, 20) : rand(5, 40), vy: rand(380, 520) });
          if (foam.length && now - rinseT > 110) { rinseT = now; rinseOne(); }
        }
        for (let i = drops.length - 1; i >= 0; i--) {
          const q = drops[i];
          q.vy += 600 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
          if (q.y > WY + 4) { q.node.remove(); drops.splice(i, 1); continue; }
          q.node.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
        }
        for (let i = flings.length - 1; i >= 0; i--) {
          const q = flings[i];
          if (q.t > 0) { q.t -= dt; q.node.setAttribute('opacity', 0); continue; }
          q.vy += 900 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt;
          if (q.life <= 0 || q.y > 760) { q.node.remove(); flings.splice(i, 1); continue; }
          const rot = Math.atan2(q.vy, q.vx) * 57.3 - 90;
          q.node.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${rot.toFixed(0)})`);
          q.node.setAttribute('opacity', clamp(q.life * 3, 0, 1).toFixed(2));
        }
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.y -= b.sp * dt; b.x = b.x0 + Math.sin(t * 1.4 + b.ph) * 14;
          if (b.y < -80) { b.g.remove(); bubbles.splice(i, 1); continue; }
          b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
        }
        for (let i = steam.length - 1; i >= 0; i--) {
          const s = steam[i];
          s.y -= 26 * dt; s.life -= dt; s.x += Math.sin(t + s.ph) * 10 * dt;
          if (s.life <= 0) { s.node.remove(); steam.splice(i, 1); continue; }
          const k = 1 - s.life / s.max;
          s.node.setAttribute('transform', `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) scale(${(1 + k * .8).toFixed(2)})`);
          s.node.setAttribute('opacity', (Math.sin(k * Math.PI) * .32).toFixed(2));
        }
      });
      ctx.every(1700, () => { if (bubbles.length < 5) makeBubble(rand(40, 360), 492, rand(14, 24)); });
      ctx.every(600, () => {
        if (!theme.steam || steam.length > 7) return;
        const node = el('ellipse', { rx: rand(30, 50), ry: rand(14, 22), fill: '#ffffff', opacity: 0 }, steamL);
        const max = rand(3.5, 5);
        steam.push({ node, x: rand(30, 370), y: rand(470, 500), ph: rand(0, 6), life: max, max });
      });
      ctx.every(2600, () => { if (Math.random() < .8) blink(); });

      applyTheme(0, false);
      spawnAnimal(false);
      [[110, 430, 18], [300, 400, 22], [250, 240, 15]].forEach(([x, y, r], i) => ctx.after(i * 160, () => makeBubble(x, y, r)));
      ctx.after(400, () => { ghost.set('happy'); ghost.talk('ごしごし しよう！'); ctx.after(1600, () => { if (phase === 'soap') ghost.set('normal'); }); });
      ctx.hint = () => phase === 'soap' ? [AX, AY] : phase === 'rinse' ? [SHX, SHY - 10] : null;
    }
  };
  TOYS.push(bathToy);
})();
