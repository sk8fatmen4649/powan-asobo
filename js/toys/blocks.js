'use strict';
/* =========================================================
   toy: つみき — drop chunky blocks and build up to the star.
   Three builds take turns: a wooden tower in the playroom, a
   castle with a waving flag, and a snowman on a snowy night.
   Then がらがら～ everything tumbles, bounces and rolls away.
   ========================================================= */
(() => {
  const INK = '#3a2f5b';
  const f1 = v => (+v).toFixed(1);
  // a rounded box standing on y=0, centred on x=0
  const rr = (w, h, r) => {
    const x = w / 2;
    return `M${-x + r},${-h} H${x - r} Q${x},${-h} ${x},${-h + r} V${-r} Q${x},0 ${x - r},0 H${-x + r} Q${-x},0 ${-x},${-r} V${-h + r} Q${-x},${-h} ${-x + r},${-h}Z`;
  };

  /* ---------- a block's face: blinks, looks at the finger, giggles ---------- */
  function face(g, x, y, s = 1) {
    const f = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
    [-20, 20].forEach(dx => el('ellipse', { cx: dx, cy: 6, rx: 6, ry: 4, fill: '#ff9fb4', opacity: .85 }, f));
    const look = el('g', {}, f);
    const open = el('g', { class: 'tb' }, look);
    [-11, 11].forEach(dx => {
      el('ellipse', { cx: dx, cy: -3, rx: 4.7, ry: 5.9, fill: INK }, open);
      el('circle', { cx: dx - 1.6, cy: -5.4, r: 2, fill: '#fff' }, open);
    });
    const joy = el('g', { style: 'display:none' }, f);
    [-11, 11].forEach(dx => el('path', { d: `M${dx - 5},-1 Q${dx},-8 ${dx + 5},-1`, stroke: INK, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, joy));
    const m = {
      smile: el('path', { d: 'M-6,5 Q0,11 6,5', stroke: INK, 'stroke-width': 2.8, fill: 'none', 'stroke-linecap': 'round' }, f),
      oh: el('ellipse', { cx: 0, cy: 7.5, rx: 3.8, ry: 4.8, fill: '#c2405a', style: 'display:none' }, f),
      joy: el('path', { d: 'M-8,4 Q0,16 8,4Z', fill: '#c2405a', style: 'display:none' }, f)
    };
    let mode = 'smile';
    return {
      get mode() { return mode; },
      set(md) {
        mode = md;
        open.style.display = md === 'joy' ? 'none' : '';
        joy.style.display = md === 'joy' ? '' : 'none';
        for (const k in m) m[k].style.display = k === md ? '' : 'none';
      },
      look(dx, dy) { look.setAttribute('transform', `translate(${f1(dx)} ${f1(dy)})`); },
      blink() { if (mode !== 'joy') open.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 }); }
    };
  }

  /* ---------- painting helpers ---------- */
  function paint(g, d, c, w, h) {
    el('path', { d, fill: c }, g);
    el('path', { d, fill: 'url(#blocks-shine)' }, g);
    el('ellipse', { cx: -w * .25, cy: -h + 12, rx: w * .15, ry: 5.5, fill: '#fff', opacity: .5 }, g);
  }
  function grain(g, w, h) {
    const x = w / 2 - 18, q = x * .5;
    el('path', {
      d: `M${-x},${-h * .2} q${q},-6 ${x},0 t${x},0 M${-x + 8},${-h * .8} q${q * .8},5 ${x * .8},0 t${x * .8},0`,
      stroke: INK, 'stroke-width': 2.4, fill: 'none', opacity: .1, 'stroke-linecap': 'round'
    }, g);
    el('ellipse', { cx: x * .7, cy: -h * .78, rx: 6, ry: 3.4, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: .1 }, g);
  }
  function bricks(g, w, h, skipTop = 0) {
    const x = w / 2 - 8;
    let d = '';
    for (let y = -24, row = 0; y > -h + 10 + skipTop; y -= 24, row++) {
      d += `M${-x},${y} H${x} `;
      for (let bx = -x + (row % 2 ? 22 : 44); bx < x - 10; bx += 44) d += `M${bx},${y} V${y + 24} `;
    }
    el('path', { d, stroke: '#fff', 'stroke-width': 2.5, opacity: .38, fill: 'none', 'stroke-linecap': 'round' }, g);
  }
  const ARCH = (w, h, r) => {
    const x = w / 2;
    return `M${-x},0 V${-h + 16} Q${-x},${-h} ${-x + 16},${-h} H${x - 16} Q${x},${-h} ${x},${-h + 16} V0 H${r} A${r},${r} 0 0 0 ${-r},0Z`;
  };

  /* ---------- the block shapes (w, h in base units; drawn standing on y=0) ---------- */
  const SHAPES = {
    // wooden tower
    cube: { w: 116, h: 104, draw(g, c) { paint(g, rr(116, 104, 18), c, 116, 104); grain(g, 116, 104); return { face: face(g, 0, -52, 1.3) }; } },
    long: { w: 184, h: 78, draw(g, c) { paint(g, rr(184, 78, 18), c, 184, 78); grain(g, 184, 78); return { face: face(g, 0, -39, 1.2) }; } },
    cyl: { w: 124, h: 104, draw(g, c) {
      const d = 'M-62,-88 V-16 A62,16 0 0 0 62,-16 V-88Z';
      el('path', { d, fill: c }, g);
      el('path', { d, fill: 'url(#blocks-shine)' }, g);
      el('path', { d: 'M-34,-80 V-26 M30,-80 V-20', stroke: INK, 'stroke-width': 2.4, opacity: .08, 'stroke-linecap': 'round' }, g);
      el('ellipse', { cx: 0, cy: -88, rx: 62, ry: 16, fill: c }, g);
      el('ellipse', { cx: 0, cy: -88, rx: 62, ry: 16, fill: '#fff', opacity: .35 }, g);
      el('ellipse', { cx: 0, cy: -88, rx: 34, ry: 7, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: .1 }, g);
      el('rect', { x: -50, y: -72, width: 10, height: 44, rx: 5, fill: '#fff', opacity: .4 }, g);
      return { face: face(g, 0, -46, 1.25) };
    } },
    arch: { w: 184, h: 88, draw(g, c) {
      paint(g, ARCH(184, 88, 40), c, 184, 88); grain(g, 184, 88);
      return { face: face(g, 0, -60, 1.05) };
    } },
    tri: { w: 176, h: 100, draw(g, c) {
      const d = 'M-80,0 Q-92,0 -84,-10 L-10,-92 Q0,-102 10,-92 L84,-10 Q92,0 80,0Z';
      el('path', { d, fill: c }, g);
      el('path', { d, fill: 'url(#blocks-shine)' }, g);
      el('path', { d: 'M-44,-44 L-14,-78', stroke: '#fff', 'stroke-width': 8, 'stroke-linecap': 'round', opacity: .5 }, g);
      el('path', { d: 'M-52,-14 q26,-5 52,0 t52,0', stroke: INK, 'stroke-width': 2.4, fill: 'none', opacity: .1, 'stroke-linecap': 'round' }, g);
      return { face: face(g, 0, -34, 1.15) };
    } },
    // castle
    base: { w: 204, h: 100, draw(g, c) {
      paint(g, rr(204, 100, 14), c, 204, 100); bricks(g, 204, 100);
      el('path', { d: 'M-28,0 V-32 A28,28 0 0 1 28,-32 V0Z', fill: '#8a6fbf' }, g);
      el('path', { d: 'M-20,0 V-30 A20,20 0 0 1 0,-50 V0Z', fill: '#fff', opacity: .12 }, g);
      el('circle', { cx: 15, cy: -18, r: 3.2, fill: '#ffd56b' }, g);
      return { face: face(g, 0, -78, 1.05) };
    } },
    wall: { w: 180, h: 86, draw(g, c) {
      paint(g, rr(180, 86, 14), c, 180, 86); bricks(g, 180, 86);
      [-60, 60].forEach(x => el('path', { d: `M${x - 13},-24 V-50 A13,13 0 0 1 ${x + 13},-50 V-24Z`, fill: '#8a6fbf' }, g));
      [-60, 60].forEach(x => el('circle', { cx: x, cy: -44, r: 4, fill: '#ffe9a8', opacity: .9 }, g));
      return { face: face(g, 0, -43, 1.2) };
    } },
    carch: { w: 184, h: 88, draw(g, c) {
      paint(g, ARCH(184, 88, 38), c, 184, 88); bricks(g, 184, 88, 10);
      return { face: face(g, 0, -62, 1.0) };
    } },
    turret: { w: 136, h: 108, draw(g, c) {
      const d = 'M-62,0 Q-68,0 -68,-6 V-102 Q-68,-108 -62,-108 H-46 Q-40,-108 -40,-102 V-90 H-14 V-102 Q-14,-108 -8,-108 H8 Q14,-108 14,-102 V-90 H40 V-102 Q40,-108 46,-108 H62 Q68,-108 68,-102 V-6 Q68,0 62,0Z';
      el('path', { d, fill: c }, g);
      el('path', { d, fill: 'url(#blocks-shine)' }, g);
      el('rect', { x: -56, y: -84, width: 10, height: 60, rx: 5, fill: '#fff', opacity: .35 }, g);
      el('path', { d: 'M-50,-22 H50 M-50,-46 H50', stroke: '#fff', 'stroke-width': 2.5, opacity: .3, 'stroke-linecap': 'round' }, g);
      return { face: face(g, 0, -52, 1.25) };
    } },
    spire: { w: 136, h: 130, flag: true, draw(g, c) {
      el('path', { d: 'M0,-84 V-128', stroke: '#8a6fbf', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: 0, cy: -130, r: 5, fill: '#ffd56b' }, g);
      const flag = el('path', { d: 'M2,-126 L46,-116 L2,-104Z', fill: '#ff6b8a' }, g);
      const d = 'M-50,-8 Q-58,0 -46,0 H46 Q58,0 50,-8 L7,-82 Q0,-90 -7,-82Z';
      el('path', { d, fill: c }, g);
      el('path', { d, fill: 'url(#blocks-shine)' }, g);
      el('path', { d: 'M-24,-30 L-7,-62', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: .45 }, g);
      el('rect', { x: -52, y: -12, width: 104, height: 12, rx: 6, fill: INK, opacity: .1 }, g);
      return { face: face(g, 0, -32, 1.0), flag };
    } },
    // snowman: round snowballs with faces
    big: { w: 188, h: 160, round: true, draw(g) { return snowball(g, 188, 160, 'big'); } },
    mid: { w: 154, h: 130, round: true, draw(g) { return snowball(g, 154, 130, 'mid'); } },
    head: { w: 132, h: 116, round: true, draw(g) { return snowball(g, 132, 116, 'head'); } },
    hat: { w: 116, h: 84, draw(g, c) {
      el('ellipse', { cx: 0, cy: -10, rx: 58, ry: 11, fill: '#4b3f78' }, g);
      el('path', { d: 'M-38,-14 V-76 Q-38,-84 -30,-84 H30 Q38,-84 38,-76 V-14Z', fill: '#5a4d8c' }, g);
      el('path', { d: 'M-38,-14 V-76 Q-38,-84 -30,-84 H30 Q38,-84 38,-76 V-14Z', fill: 'url(#blocks-shine)' }, g);
      el('rect', { x: -38, y: -36, width: 76, height: 14, fill: c }, g);
      el('rect', { x: -28, y: -76, width: 9, height: 34, rx: 4.5, fill: '#fff', opacity: .25 }, g);
      el('circle', { cx: 24, cy: -29, r: 8, fill: '#ffd56b' }, g);
      return { face: face(g, 0, -58, .95) };
    } }
  };
  function snowball(g, w, h, kind) {
    const rx = w / 2, ry = h / 2;
    el('ellipse', { cx: 0, cy: -ry, rx, ry, fill: 'url(#blocks-snow) #f4f8ff' }, g);
    el('ellipse', { cx: -rx * .38, cy: -h * .78, rx: rx * .26, ry: ry * .14, fill: '#fff', opacity: .9, transform: `rotate(-24 ${f1(-rx * .38)} ${f1(-h * .78)})` }, g);
    let fc;
    if (kind === 'big') {
      [-.34, -.16].forEach(k => el('circle', { cx: 0, cy: h * k, r: 7, fill: '#5a4d8c' }, g));
      fc = face(g, 0, -h * .62, 1.25);
    } else if (kind === 'mid') {
      el('path', { d: `M${-rx + 6},${-ry - 4} L${-rx - 34},${-ry - 30} M${-rx - 20},${-ry - 20} L${-rx - 28},${-ry - 42}`, stroke: '#9c6a3a', 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' }, g);
      el('path', { d: `M${rx - 6},${-ry - 4} L${rx + 34},${-ry - 30} M${rx + 20},${-ry - 20} L${rx + 30},${-ry - 40}`, stroke: '#9c6a3a', 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' }, g);
      el('circle', { cx: 0, cy: -h * .24, r: 6.5, fill: '#5a4d8c' }, g);
      fc = face(g, 0, -h * .6, 1.2);
    } else {
      // scarf, then the face with a carrot nose
      el('path', { d: `M${-rx * .86},-14 Q0,6 ${rx * .86},-14 L${rx * .8},2 Q0,18 ${-rx * .8},2Z`, fill: '#ff6b8a' }, g);
      el('path', { d: `M${rx * .3},0 L${rx * .55},34 L${rx * .2},30Z`, fill: '#ff6b8a' }, g);
      el('path', { d: `M${-rx * .6},-6 L${-rx * .4},6 M${-rx * .1},0 L${rx * .1},10 M${rx * .4},-4 L${rx * .6},6`, stroke: '#fff', 'stroke-width': 3, opacity: .6, 'stroke-linecap': 'round' }, g);
      fc = face(g, 0, -h * .62, 1.3);
      el('path', { d: `M-4,${-h * .62 + 8} L22,${-h * .62 + 13} L-4,${-h * .62 + 17}Z`, fill: '#ff9a3c', 'stroke-linejoin': 'round', stroke: '#ff9a3c', 'stroke-width': 3 }, g);
    }
    return { face: fc };
  }

  function star(g, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .52 : r;
      d += (i ? 'L' : 'M') + f1(Math.cos(a) * q) + ',' + f1(Math.sin(a) * q);
    }
    el('path', { d: d + 'Z', fill: '#ffd56b', stroke: '#ffc23a', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
    el('ellipse', { cx: -r * .22, cy: -r * .4, rx: r * .16, ry: r * .09, fill: '#fff', opacity: .7, transform: `rotate(-30 ${f1(-r * .22)} ${f1(-r * .4)})` }, g);
    [-8, 8].forEach(x => el('circle', { cx: x, cy: -2, r: 3, fill: INK }, g));
    el('path', { d: 'M-4,5 Q0,9 4,5', stroke: INK, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, g);
    [-15, 15].forEach(x => el('ellipse', { cx: x, cy: 4, rx: 4, ry: 2.6, fill: '#ffa3b8' }, g));
  }

  /* ---------- the three builds ---------- */
  const WOOD = ['#ff8a96', '#ffc94f', '#6fd6b4', '#7fb0ff', '#b99cff', '#ffab78', '#8fd977', '#ff94bf'];
  const STONE = ['#f8c6d8', '#d4c2ff', '#ffe1a8', '#bfe4ff', '#c8f0d6'];
  const THEMES = [
    { id: 'tower', chute: '#ffb3d1', chute2: '#ff8fb8', puff: '#fff3e0',
      plan() {
        const kinds = ['cube', 'long', 'cyl', 'arch'], p = [];
        while (p.length < 4) { const s = pick(kinds); if (s !== p[p.length - 1]) p.push(s); }
        return [...p, 'tri'];
      },
      colors() { return WOOD.slice().sort(() => Math.random() - .5); } },
    { id: 'castle', chute: '#c9b4ff', chute2: '#ad92f5', puff: '#ffffff',
      plan() { return ['base', ...(Math.random() < .5 ? ['wall', 'carch'] : ['carch', 'wall']), 'turret', 'spire']; },
      colors() { const s = STONE.slice().sort(() => Math.random() - .5); return [s[0], s[1], s[2], s[3], '#ff8fa3']; } },
    { id: 'snow', chute: '#a9d4ff', chute2: '#86bdf5', puff: '#ffffff',
      plan() { return ['big', 'mid', 'head', 'hat']; },
      colors() { return ['#fff', '#fff', '#fff', pick(['#ff6b8a', '#7fdcc0', '#ffd56b'])]; } }
  ];

  const blocksToy = {
    id: 'blocks', name: 'つみき', color: '#d9c8ff',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#efe6ff' }, g);
      el('rect', { x: -80, y: 58, width: 160, height: 40, fill: '#f2c08c' }, g);
      const put = (shape, c, x, y, s) => { const b = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g); SHAPES[shape].draw(b, c); };
      put('long', '#7fb0ff', 0, 62, .6);
      put('cube', '#ffc94f', -4, 16, .52);
      put('tri', '#ff8a96', -2, -38, .5);
      const st = el('g', { transform: 'translate(50 -54) scale(.55)' }, g); star(st, 28);
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      const GROUND = 700, TOP = 242, CX = 200;

      /* ---------- shared gradients ---------- */
      const shine = el('linearGradient', { id: 'blocks-shine', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      [[0, '#fff', .42], [.2, '#fff', .1], [.5, '#fff', 0], [.82, INK, .05], [1, INK, .2]].forEach(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, shine));
      const snowG = el('radialGradient', { id: 'blocks-snow', cx: .38, cy: .3, r: .78 }, defs);
      [[0, '#ffffff'], [.55, '#f5f8ff'], [1, '#cddbf6']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, snowG));
      const lin = (id, a, b) => { const lg = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs); el('stop', { offset: 0, 'stop-color': a }, lg); el('stop', { offset: 1, 'stop-color': b }, lg); };
      lin('blocks-wall', '#dccbff', '#f7f1ff');
      lin('blocks-floor', '#f6c891', '#e3a86c');
      lin('blocks-day', '#8fd0ff', '#e6f6ff');
      lin('blocks-night', '#2d3a78', '#8e86d6');
      lin('blocks-snowfield', '#ffffff', '#dbe6fb');
      const pat = el('pattern', { id: 'blocks-dots', width: 48, height: 48, patternUnits: 'userSpaceOnUse' }, defs);
      el('circle', { cx: 12, cy: 12, r: 4, fill: '#fff', opacity: .55 }, pat);
      el('circle', { cx: 36, cy: 36, r: 4, fill: '#fff', opacity: .55 }, pat);
      const clip = el('clipPath', { id: 'blocks-win' }, defs);
      el('rect', { x: 20, y: 330, width: 74, height: 96, rx: 12 }, clip);

      /* everything sits on a camera that can shake */
      const cam = el('g', {}, svg);
      const bgL = el('g', {}, cam);
      const cloudBits = [];
      const cloud = (parent, x, y, s, face) => {
        const g = el('g', {}, parent);
        const c = el('g', { transform: `scale(${s})` }, g);
        [[-28, 4, 22], [0, -9, 30], [30, 4, 22]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: '#fff' }, c));
        el('rect', { x: -28, y: 4, width: 58, height: 22, rx: 11, fill: '#fff' }, c);
        if (face) {
          [-9, 9].forEach(cx => el('circle', { cx, cy: 4, r: 2.8, fill: '#a99bd0' }, c));
          el('path', { d: 'M-4,11 Q0,14 4,11', stroke: '#a99bd0', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, c);
        }
        return g;
      };

      // 1. the playroom
      const room = el('g', {}, bgL);
      el('rect', { x: -800, y: -900, width: 2000, height: 1600, fill: 'url(#blocks-wall)' }, room);
      el('rect', { x: -800, y: -900, width: 2000, height: 1600, fill: 'url(#blocks-dots)' }, room);
      // window with a drifting cloud
      el('rect', { x: 14, y: 324, width: 86, height: 108, rx: 16, fill: '#fff' }, room);
      const win = el('g', { 'clip-path': 'url(#blocks-win)' }, room);
      el('rect', { x: 20, y: 330, width: 74, height: 96, fill: '#bfe6ff' }, win);
      el('circle', { cx: 78, cy: 352, r: 12, fill: '#ffe27a' }, win);
      el('ellipse', { cx: 57, cy: 438, rx: 60, ry: 26, fill: '#a8e08f' }, win);
      const winCloud = cloud(win, 40, 372, .55, false);
      el('path', { d: 'M57,330 V426 M20,378 H94', stroke: '#fff', 'stroke-width': 5 }, room);
      // bunting
      const bunt = el('g', {}, room);
      el('path', { d: 'M-20,168 Q50,196 110,176 M290,176 Q350,196 420,168', stroke: '#fff', 'stroke-width': 3, fill: 'none' }, bunt);
      [[10, 178], [44, 186], [78, 184], [322, 184], [356, 186], [390, 178]].forEach(([x, y], i) => {
        const fl = el('g', { transform: `translate(${x} ${y})` }, bunt);
        const tri = el('path', { d: 'M-12,0 L12,0 L0,24Z', fill: PARTY[i % 6], class: 'tb', style: 'transform-origin:50% 0%' }, fl);
        tri.animate([{ transform: 'rotate(-7deg)' }, { transform: 'rotate(7deg)' }], { duration: 1500 + i * 130, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      });
      el('rect', { x: -800, y: GROUND, width: 2000, height: 1200, fill: 'url(#blocks-floor)' }, room);
      el('rect', { x: -800, y: GROUND - 6, width: 2000, height: 10, fill: '#fff3e3' }, room);
      [726, 752].forEach(y => el('rect', { x: -800, y, width: 2000, height: 3, fill: '#d99a5e', opacity: .6 }, room));
      el('ellipse', { cx: CX, cy: GROUND + 24, rx: 184, ry: 26, fill: '#ffb3c1', opacity: .6 }, room);
      el('ellipse', { cx: CX, cy: GROUND + 24, rx: 150, ry: 18, fill: '#ffc8d3', opacity: .6 }, room);
      // a little toy ball on the floor
      const ballG = el('g', { transform: `translate(42 ${GROUND - 4})` }, room);
      const ball = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, ballG);
      el('circle', { cx: 0, cy: -24, r: 24, fill: '#ff8a96' }, ball);
      el('path', { d: 'M-24,-24 Q0,-12 24,-24', stroke: '#fff', 'stroke-width': 6, fill: 'none' }, ball);
      el('ellipse', { cx: -9, cy: -36, rx: 7, ry: 4, fill: '#fff', opacity: .6 }, ball);

      // 2. outside the castle
      const meadow = el('g', { opacity: 0 }, bgL);
      el('rect', { x: -800, y: -900, width: 2000, height: 1700, fill: 'url(#blocks-day)' }, meadow);
      const sun = el('g', { transform: 'translate(70 168)' }, meadow);
      el('circle', { r: 46, fill: '#fff6c2', opacity: .6, class: 'twinkle', style: 'animation-duration:3.6s' }, sun);
      el('circle', { r: 30, fill: '#ffd56b' }, sun);
      el('path', { d: 'M-800,560 Q-100,470 90,520 Q240,440 520,520 L1200,520 L1200,900 L-800,900Z', fill: '#c8b8f2', opacity: .7 }, meadow);
      el('path', { d: 'M-800,620 Q-50,560 120,600 Q300,550 1200,610 L1200,900 L-800,900Z', fill: '#a8e08f' }, meadow);
      el('rect', { x: -800, y: GROUND, width: 2000, height: 1200, fill: '#8fd67e' }, meadow);
      el('rect', { x: -800, y: GROUND - 6, width: 2000, height: 10, fill: '#b6eaa2' }, meadow);
      [[34, 724], [96, 744], [312, 730], [372, 748], [250, 752]].forEach(([x, y], i) => {
        [0, 72, 144, 216, 288].forEach(a => el('circle', { cx: x + Math.cos(a * Math.PI / 180) * 5, cy: y + Math.sin(a * Math.PI / 180) * 5, r: 4.2, fill: PARTY[i % 6] }, meadow));
        el('circle', { cx: x, cy: y, r: 3, fill: '#fff3b0' }, meadow);
      });
      const skyClouds = [[60, 290, .8, 7], [300, 360, .6, 5], [180, 470, .5, 9]].map(([x, y, s, v]) => ({ g: cloud(meadow, 0, 0, s, false), x, y, v }));

      // 3. a snowy night
      const winter = el('g', { opacity: 0 }, bgL);
      el('rect', { x: -800, y: -900, width: 2000, height: 1700, fill: 'url(#blocks-night)' }, winter);
      const moon = el('g', { transform: 'translate(70 172)' }, winter);
      el('circle', { r: 46, fill: '#fff8d6', opacity: .1, class: 'twinkle', style: 'animation-duration:4s' }, moon);
      el('path', { d: 'M8,-30 A30,30 0 1 0 8,30 A23,27 0 1 1 8,-30Z', fill: '#fff4c2' }, moon);
      el('circle', { cx: -12, cy: 6, r: 2.6, fill: INK, opacity: .6 }, moon);
      el('path', { d: 'M-12,14 Q-8,17 -4,14', stroke: INK, 'stroke-width': 2, fill: 'none', opacity: .6, 'stroke-linecap': 'round' }, moon);
      [[150, 300], [340, 330], [28, 420], [372, 460], [120, 520], [260, 440], [300, 250], [20, 290]].forEach(([x, y], i) => {
        const s = el('path', { d: `M${x},${y - 7} L${x + 2},${y - 2} L${x + 7},${y} L${x + 2},${y + 2} L${x},${y + 7} L${x - 2},${y + 2} L${x - 7},${y} L${x - 2},${y - 2}Z`, fill: '#fff8c8', class: 'twinkle' }, winter);
        s.style.animationDelay = `-${(i * .37).toFixed(2)}s`;
      });
      el('path', { d: 'M-800,600 Q-60,530 110,580 Q270,520 1200,590 L1200,900 L-800,900Z', fill: '#e7eefe', opacity: .85 }, winter);
      [[28, 640, 1], [372, 630, 1.15], [334, 660, .75]].forEach(([x, y, s]) => {
        const t = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, winter);
        el('rect', { x: -5, y: 0, width: 10, height: 22, fill: '#8a6a4a' }, t);
        [[0, -78, 26], [0, -48, 36], [0, -16, 46]].forEach(([cx, cy, w]) => el('path', { d: `M${cx - w},${cy + 30} L${cx},${cy - 10} L${cx + w},${cy + 30}Z`, fill: '#4f9c86', 'stroke-linejoin': 'round', stroke: '#4f9c86', 'stroke-width': 6 }, t));
        [[0, -84, 14], [-16, -30, 12], [18, 2, 14]].forEach(([cx, cy, w]) => el('path', { d: `M${cx - w},${cy} Q${cx},${cy - 7} ${cx + w},${cy}`, stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, t));
      });
      el('rect', { x: -800, y: GROUND - 10, width: 2000, height: 1200, fill: 'url(#blocks-snowfield)' }, winter);
      el('path', { d: 'M-800,692 Q100,676 200,690 Q300,676 1200,692 L1200,712 L-800,712Z', fill: '#fff' }, winter);
      const flakesG = el('g', {}, winter);
      const flakes = [];
      for (let i = 0; i < 20; i++) flakes.push({ n: el('circle', { r: rand(2.2, 4.6).toFixed(1), fill: '#fff', opacity: rand(.6, .95).toFixed(2) }, flakesG), x: rand(-20, 420), y: rand(-60, 760), v: rand(26, 54), ph: rand(0, 6) });

      const BGS = [room, meadow, winter];

      // the star marks how high to build
      const STAR0 = [342, TOP - 10];
      const starG = el('g', {}, cam);
      const starTap = el('g', { class: 'tb' }, starG);
      const starIn = el('g', { class: 'tb' }, starTap);
      star(starIn, 34);
      el('circle', { r: 46, fill: 'transparent' }, starIn);
      starIn.animate([{ transform: 'rotate(-8deg) scale(1)' }, { transform: 'rotate(8deg) scale(1.08)' }], { duration: 1400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      let starAt = STAR0.slice();
      const placeStar = (x, y, s = 1) => { starAt = [x, y]; starG.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(2)})`); };
      placeStar(...STAR0);
      const goal = el('path', { d: `M96,${TOP} L300,${TOP}`, stroke: '#fff', 'stroke-width': 5, 'stroke-dasharray': '2 15', 'stroke-linecap': 'round', opacity: .85 }, cam);
      goal.animate([{ opacity: .35 }, { opacity: .95 }], { duration: 900, iterations: Infinity, direction: 'alternate' });

      /* ---------- tower, chute, ghost ---------- */
      const shadowG = el('ellipse', { cx: CX, cy: GROUND + 4, rx: 0, ry: 12, fill: INK, opacity: .14 }, cam);
      const tower = el('g', {}, cam);
      const debris = el('g', {}, cam);
      const chute = el('g', {}, cam);
      const cw = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, chute);
      const chuteBody = el('rect', { x: 92, y: -400, width: 216, height: 480, rx: 22, fill: THEMES[0].chute, filter: 'url(#soft)' }, cw);
      const chuteBands = [-14, 28].map(y => el('rect', { x: 92, y, width: 216, height: 12, fill: THEMES[0].chute2, opacity: .7 }, cw));
      const chuteLip = el('rect', { x: 82, y: 66, width: 236, height: 32, rx: 16, fill: THEMES[0].chute2 }, cw);
      el('rect', { x: 96, y: 71, width: 80, height: 8, rx: 4, fill: '#fff', opacity: .45 }, cw);
      const chuteEyes = el('g', { class: 'tb' }, cw);
      [-13, 13].forEach(x => { el('circle', { cx: CX + x, cy: 44, r: 5, fill: INK }, chuteEyes); el('circle', { cx: CX + x - 1.6, cy: 42.2, r: 1.8, fill: '#fff' }, chuteEyes); });
      el('path', { d: `M${CX - 6},54 Q${CX},60 ${CX + 6},54`, stroke: INK, 'stroke-width': 2.8, fill: 'none', 'stroke-linecap': 'round' }, cw);
      [-28, 28].forEach(x => el('ellipse', { cx: CX + x, cy: 53, rx: 7, ry: 4.4, fill: '#ff7aa0', opacity: .6 }, cw));
      const fx = el('g', { 'pointer-events': 'none' }, cam);
      const HOME = [340, 470, .6];
      const ghost = ctx.ghost(cam, { x: HOME[0], y: HOME[1], s: HOME[2] });

      let theme = 0, T = THEMES[0], plan = [], cols = [], k = 1, round = 0, rare = false;
      let placed = [], falling = null, pending = 0, phase = 'build', tumbling = [];
      let wob = 0, wobV = 0, angle = 0, flag = null, lastHit = 0, taps = 0;
      const topY = () => placed.length ? placed[placed.length - 1].floor - placed[placed.length - 1].h : GROUND;
      const topX = () => placed.length ? placed[placed.length - 1].x : CX;

      function setTheme(i, fade) {
        const prev = BGS[theme];
        theme = i; T = THEMES[i];
        const next = BGS[i];
        if (fade && prev !== next) {
          next.parentNode.appendChild(next);
          ctx.tween(700, q => next.setAttribute('opacity', q.toFixed(2)), () => BGS.forEach(b => { if (b !== next) b.setAttribute('opacity', 0); }));
        } else BGS.forEach((b, j) => b.setAttribute('opacity', j === i ? 1 : 0));
        chuteBody.setAttribute('fill', T.chute); chuteLip.setAttribute('fill', T.chute2);
        chuteBands.forEach(b => b.setAttribute('fill', T.chute2));
      }
      function newPlan() {
        plan = T.plan(); cols = T.colors();
        const sum = plan.reduce((a, s) => a + SHAPES[s].h, 0);
        k = (GROUND - TOP) / sum;
        rare = round > 0 && Math.random() < 1 / 6;
      }

      /* ---------- juice ---------- */
      function shake(amp, ms = 280) {
        ctx.tween(ms, q => {
          const d = amp * (1 - q);
          cam.setAttribute('transform', `translate(${f1(Math.sin(q * 46) * d)} ${f1(Math.cos(q * 38) * d * .7)})`);
        }, () => cam.removeAttribute('transform'), k2 => k2);
      }
      function puff(x, y, w, color) {
        for (let i = 0; i < 8; i++) {
          const side = i % 2 ? 1 : -1, g = el('g', { transform: `translate(${f1(x + side * (w / 2 - 6 - rand(0, 14)))} ${f1(y - 4)})` }, fx);
          const c = el('circle', { r: rand(8, 14).toFixed(1), fill: color, opacity: .95, class: 'tb' }, g);
          const dx = side * rand(26, 60), dy = -rand(4, 26);
          c.animate([{ transform: 'translate(0px,0px) scale(.4)', opacity: .95 }, { transform: `translate(${f1(dx)}px,${f1(dy)}px) scale(1.3)`, opacity: 0 }], { duration: rand(420, 620), easing: 'ease-out', fill: 'forwards' }).onfinish = () => g.remove();
        }
      }
      function knock(level = 0, vol = 1) {
        A.osc(rand(150, 190) - level * 5, { type: 'triangle', slide: 90, slideT: .05, r: .09, vol: .22 * vol, wet: .08 });
        if (!A.sfx(pick(['woodblock', 'knock', 'drop']), { rate: rand(.85, 1.1), vol: .7 * vol })) {
          A.osc(rand(560, 680), { r: .04, vol: .1 * vol, wet: 0 });
          A.noise({ from: 2600, to: 1200, dur: .05, vol: .1 * vol, q: 3 });
        }
      }
      // a rising glockenspiel note per floor (the sample is C6)
      const SEMI = [0, 2, 4, 7, 9, 12, 14];
      function climbNote(i) { if (!A.sfx('glock', { rate: 2 ** (SEMI[Math.min(i, 6)] / 12) * .5, vol: .4, when: .05 })) A.bell(mtof(PENTA[Math.min(i * 2, PENTA.length - 1)] + 12), { vol: .13, when: .05 }); }
      function landSound(i) {
        if (T.id === 'tower') knock(i);
        else if (T.id === 'castle') { if (!A.sfx(i % 2 ? 'boing' : 'boing2', { rate: .9 + i * .07, vol: .55 })) A.boing(); knock(i, .6); }
        else { if (!A.sfx('boing', { rate: .75 + i * .08, vol: .5 })) A.boing(); A.noise({ from: 900, to: 300, dur: .18, vol: .12, type: 'lowpass' }); }
        climbNote(i);
      }
      function word(text, x, y) {
        const g = el('g', { transform: `translate(${clamp(x, 60, 340).toFixed(0)} ${y.toFixed(0)})` }, fx);
        const t = el('text', { 'text-anchor': 'middle', 'font-size': 26, fill: '#fff', stroke: INK, 'stroke-width': 6, 'paint-order': 'stroke', 'stroke-linejoin': 'round', class: 'tb' }, g);
        t.textContent = text;
        t.animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: .25 }, { transform: 'translateY(-8px) scale(1)', opacity: 1, offset: .7 }, { transform: 'translateY(-22px)', opacity: 0 }], { duration: 1000 }).onfinish = () => g.remove();
      }

      /* ---------- blocks ---------- */
      function makeBlock(i) {
        const shape = plan[i], S = SHAPES[shape];
        const outer = el('g', {}, tower);
        const sc = el('g', { transform: `scale(${k.toFixed(3)})` }, outer);
        const inner = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, sc);
        const parts = S.draw(inner, cols[i % cols.length]);
        el('rect', { x: -S.w / 2 - 8, y: -S.h - 8, width: S.w + 16, height: S.h + 16, fill: 'transparent' }, inner);
        const b = { i, shape, outer, inner, face: parts.face, w: S.w * k, h: S.h * k, x: CX, y: 0, vy: 0, floor: GROUND, round: S.round };
        if (parts.flag) flag = parts.flag;
        outer.addEventListener('pointerdown', e => { e.stopPropagation(); lookAt(ctx.point(e)); tapBlock(b); });
        return b;
      }
      const putB = b => b.outer.setAttribute('transform', `translate(${f1(b.x)} ${f1(b.y)})`);

      function drop() {
        if (phase !== 'build') return;
        if (falling) { pending = Math.min(pending + 1, 1); return; }
        const i = placed.length;
        if (i >= plan.length) return;
        const b = makeBlock(i);
        const wiggle = SHAPES[plan[i]].round ? 6 : 12;
        b.x = clamp(topX() + (i ? rand(-wiggle, wiggle) : rand(-4, 4)), CX - 14, CX + 14);
        if (i === plan.length - 1) b.x = topX();
        b.y = 96; b.vy = 300; b.floor = topY();
        b.face.set('oh');
        putB(b);
        falling = b;
        cw.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05,.92)' }, { transform: 'scale(.97,1.04)' }, { transform: 'scale(1)' }], { duration: 320 });
        if (!A.sfx('blink', { rate: rand(.9, 1.2), vol: .5 })) A.click();
        A.osc(760, { slide: 360, slideT: .28, r: .12, vol: .08, wet: .1 });
      }

      function land(b) {
        const i = b.i;
        placed.push(b);
        falling = null;
        b.face.set('smile');
        b.inner.animate([{ transform: 'scale(1.22,.76)' }, { transform: 'scale(.92,1.1)', offset: .45 }, { transform: 'scale(1.04,.97)', offset: .78 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
        // the blocks underneath feel the bump too
        placed.slice(0, -1).forEach((q, j) => q.inner.animate([{ transform: 'scale(1)' }, { transform: `scale(${1 + .06 / (i - j)},${1 - .06 / (i - j)})` }, { transform: 'scale(1)' }], { duration: 240, delay: (i - j) * 30 }));
        landSound(i);
        puff(b.x, b.y, b.w, T.puff);
        shake(3 + i * .8);
        haptic(14);
        shadowG.setAttribute('rx', f1(placed[0].w * .55));
        wobV += (b.x - CX >= 0 ? 1 : -1) * rand(10, 16) + rand(-4, 4);
        word(T.id === 'snow' ? 'ぽふっ' : 'ことん', b.x + (b.x >= CX ? 1 : -1) * (b.w / 2 + 40), b.y - b.h / 2);
        ghost.hop();
        if (i === plan.length - 1) return celebrate();
        if (i === 1) ghost.talk('たかい たかい！');
        else if (i === plan.length - 2) ghost.talk('もうすこし！');
        else say('ことん');
        if (pending) { pending--; ctx.after(180, drop); }
      }

      function tapBlock(b) {
        haptic();
        if (!placed.includes(b)) { A.pop(); ctx.sparkle(b.x, b.y - b.h / 2, 3, 30); return; }
        taps++;
        if (phase === 'build') ctx.after(120, drop);
        b.face.set('joy');
        b.inner.animate([
          { transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(-7deg) scale(1.14,.86)' }, { transform: 'rotate(6deg) scale(.92,1.1)' },
          { transform: 'rotate(-4deg) scale(1.04,.97)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(0deg) scale(1)' }
        ], { duration: 640, easing: 'ease-out' });
        if (!A.sfx(pick(['cutie', 'cutie2']), { rate: rand(.95, 1.2), vol: .6 })) A.giggle();
        A.sfx('boyoing', { rate: rand(1, 1.3), vol: .3 });
        if (taps % 4 === 1) say('くすぐったい〜');
        ctx.sparkle(b.x + rand(-30, 30), b.y - b.h, 3, 30, pick(PARTY));
        wobV += rand(-7, 7);
        ctx.after(900, () => { if (placed.includes(b) && phase === 'build') b.face.set('smile'); });
      }

      function lookAt(p) {
        [...placed, falling].forEach(b => {
          if (!b) return;
          const by = b.y - b.h / 2;
          b.face.look(clamp((p.x - b.x) / 30, -4, 4), clamp((p.y - by) / 40, -3, 3));
        });
      }

      /* ---------- the rare visitor: a little bird lands on top ---------- */
      function bird(x, y) {
        const out = el('g', {}, fx);
        const flap = el('g', { class: 'tb' }, out);
        const wing = el('path', { d: 'M-2,-4 Q-26,-26 -28,0 Q-16,8 -2,4Z', fill: '#5aa8f0', class: 'tb', style: 'transform-origin:90% 50%' }, flap);
        el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 19, fill: '#8fc8ff' }, flap);
        el('ellipse', { cx: 5, cy: 7, rx: 12, ry: 9, fill: '#e6f4ff' }, flap);
        el('path', { d: 'M18,-4 L32,0 L18,5Z', fill: '#ffb23f' }, flap);
        el('circle', { cx: 9, cy: -6, r: 3.6, fill: INK }, flap); el('circle', { cx: 8, cy: -7.4, r: 1.3, fill: '#fff' }, flap);
        el('ellipse', { cx: 2, cy: 2, rx: 4, ry: 2.6, fill: '#ffa3b8' }, flap);
        const wf = wing.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(-.7)' }], { duration: 140, iterations: Infinity, direction: 'alternate' });
        const x0 = 470, y0 = y - 120;
        ctx.tween(1200, q => out.setAttribute('transform', `translate(${f1(x0 + (x - x0) * q)} ${f1(y0 + (y - y0) * q - Math.sin(q * Math.PI) * 50)})`), () => {
          wf.cancel();
          if (!A.animal('bird', { vol: .7 })) A.chirp();
          flap.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15,.85)' }, { transform: 'scale(1)' }], { duration: 300, iterations: 3 });
          ctx.sparkle(x, y - 10, 4, 30, '#8fc8ff');
        }, easeOut);
        return {
          away() {
            wing.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(-.7)' }], { duration: 140, iterations: Infinity, direction: 'alternate' });
            ctx.tween(1100, q => out.setAttribute('transform', `translate(${f1(x - q * 520)} ${f1(y - q * 380)})`), () => out.remove(), easeIn);
          }
        };
      }

      /* ---------- payoff: a 3 s party at the top ---------- */
      let visitor = null;
      function celebrate() {
        phase = 'party';
        const tx = topX(), ty = topY();
        ghost.set('happy');
        // ぽわん swoops up in an arc
        const gx0 = ghost.x, gy0 = ghost.y, gx1 = tx - 70, gy1 = ty - 56;
        ctx.tween(700, q => ghost.place(gx0 + (gx1 - gx0) * q, gy0 + (gy1 - gy0) * q - Math.sin(q * Math.PI) * 90, .6), () => {
          ghost.giggle(); ghost.hop();
          ghost.talk(T.id === 'tower' ? 'てっぺん！' : 'できた！');
          A.tada(); haptic(30);
          ctx.confetti(tx, ty - 20, 44);
          ctx.after(650, () => { ctx.confetti(70, 560, 28); ctx.confetti(330, 560, 28); });
          // ぽわん dances left and right
          ctx.after(500, () => ctx.tween(1500, q => ghost.place(gx1 + Math.sin(q * Math.PI * 2) * 34, gy1 - Math.abs(Math.sin(q * Math.PI * 4)) * 26, .6), () => ghost.hop()));
        }, easeOut);
        // the star hops onto the top
        const [sx, sy] = starAt, ex = tx + 78, ey = ty - 34;
        ctx.tween(800, q => placeStar(sx + (ex - sx) * q, sy + (ey - sy) * q - Math.sin(q * Math.PI) * 50, 1 + q * .25), () => { ctx.sparkle(ex, ey, 7, 40); A.twinkle(); }, easeInOut);
        // every block cheers, bottom to top, twice
        [0, 1100].forEach(d0 => placed.forEach((b, j) => ctx.after(d0 + 300 + j * 90, () => {
          b.face.set('joy');
          b.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12,.88)' }, { transform: 'scale(.95,1.07)' }, { transform: 'scale(1)' }], { duration: 340 });
          A.pluck(mtof(PENTA[Math.min(j * 2 + 2, PENTA.length - 1)] + 12), { vol: .09 });
        })));
        if (T.id === 'snow') ctx.after(900, () => ctx.sparkle(tx, ty - 10, 8, 90, '#fff'));
        if (rare) ctx.after(900, () => { visitor = bird(tx + 6, ty - 22); ghost.talk('ことりさん！', false); });
        ctx.after(3300, tumble);
      }

      /* ---------- がらがら～: wobble, let go, bounce, roll away ---------- */
      function tumble() {
        phase = 'tumble';
        if (visitor) { visitor.away(); visitor = null; }
        ghost.set('surprise');
        ghost.moveTo(CX - 96, 210, .58, 800, null, easeOut);
        placed.forEach(b => b.face.set('oh'));
        const t0 = performance.now();
        const stopShake = ctx.loop(() => { wob = 3 + (performance.now() - t0) / 60; });
        A.osc(220, { type: 'triangle', vib: 10, vibD: .06, hold: .45, r: .1, vol: .1 });
        if (!A.sfx('drumroll', { vol: .35, rate: 1.4 })) A.noise({ from: 400, dur: .6, vol: .06 });
        ctx.after(700, () => {
          stopShake();
          say('がらがら～');
          ghost.set('happy'); ghost.talk('がらがら～', false);
          shake(9, 420); haptic(40);
          if (!A.sfx('slide', { vol: .4, rate: .9 })) A.whoosh();
          const a = angle * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
          placed.forEach((b, j) => {
            const lx = b.x - CX, ly = b.y - b.h / 2 - GROUND;
            const cx = CX + lx * cs - ly * sn, cy = GROUND + lx * sn + ly * cs;
            const side = (j % 2 ? 1 : -1) * (Math.sign(angle) || 1);
            debris.appendChild(b.outer);
            b.d = { cx, cy, vx: side * rand(150, 280) + (cx - CX) * 2, vy: rand(-520, -220) - j * 40, r: angle, vr: rand(-300, 300), rad: Math.min(b.w, b.h) / 2, hits: 0 };
          });
          tumbling = placed; placed = []; wob = 0; wobV = 0; flag = null;
          shadowG.setAttribute('rx', 0);
          ctx.after(500, () => tumbling.forEach(b => b.face.set('joy')));
          ctx.after(2300, reset);
        });
      }

      function reset() {
        tumbling.forEach(b => b.outer.remove());
        tumbling = [];
        round++;
        setTheme((theme + 1) % THEMES.length, true);
        newPlan();
        ghost.moveTo(HOME[0], HOME[1], HOME[2], 900, () => ghost.set('normal'));
        ghost.talk('もういっかい！');
        const [sx, sy] = starAt;
        ctx.tween(900, q => placeStar(sx + (STAR0[0] - sx) * q, sy + (STAR0[1] - sy) * q - Math.sin(q * Math.PI) * 40, 1.25 - q * .25), null, easeInOut);
        A.twinkle();
        cw.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08,.9)' }, { transform: 'scale(.96,1.05)' }, { transform: 'scale(1)' }], { duration: 420, delay: 300 });
        ctx.after(1000, () => { phase = 'build'; pending = 0; });
      }

      /* ---------- one frame loop: fall, sway, tumble, ambience ---------- */
      ctx.loop((dt, t) => {
        if (falling) {
          const b = falling;
          b.vy += 2600 * dt; b.y += b.vy * dt;
          if (b.y >= b.floor) { b.y = b.floor; land(b); }
          putB(b);
        }
        if (phase !== 'tumble') {
          wobV += (-wob * 40 - wobV * 3.4) * dt;
          wob += wobV * dt;
          const idle = Math.sin(t * 1.6) * .3 * placed.length / 4;
          angle = clamp(wob, -5, 5) + idle;
        } else if (placed.length) angle = Math.sin(t * 26) * wob * .22;
        tower.setAttribute('transform', `rotate(${angle.toFixed(2)} ${CX} ${GROUND})`);
        if (flag) {
          const w1 = Math.sin(t * 7) * 5, w2 = Math.sin(t * 7 - 1.3) * 7;
          flag.setAttribute('d', `M2,-126 Q24,${f1(-124 + w1)} 48,${f1(-116 + w2)} Q24,${f1(-108 + w1)} 2,-104Z`);
        }
        tumbling.forEach(b => {
          const d = b.d;
          if (!d || d.out) return;
          d.vy += 1500 * dt; d.cx += d.vx * dt; d.cy += d.vy * dt;
          if (d.cy + d.rad > GROUND + 6) {
            d.cy = GROUND + 6 - d.rad;
            if (d.vy > 90) {
              d.vy = -d.vy * .5; d.vx *= .94; d.hits++;
              b.inner.animate([{ transform: 'scale(1.18,.82)' }, { transform: 'scale(1)' }], { duration: 200 });
              if (d.hits < 4 && t - lastHit > .06) {
                lastHit = t;
                if (T.id === 'tower') { if (!A.sfx(pick(['logdrum', 'woodblock']), { rate: rand(.8, 1.2), vol: .55 })) knock(0, .7); }
                else if (T.id === 'castle') { knock(0, .6); A.sfx('bounce', { rate: rand(.9, 1.2), vol: .35 }); }
                else if (!A.sfx(pick(['squish', 'plop', 'boing']), { rate: rand(.8, 1.2), vol: .45 })) A.boing();
              }
            } else d.vy = 0;
            if (Math.abs(d.vx) < 170) d.vx = (d.vx >= 0 ? 1 : -1) * 170;
            d.vr = d.vx / d.rad * 57.3;
          }
          d.r += d.vr * dt;
          b.outer.setAttribute('transform', `translate(${f1(d.cx)} ${f1(d.cy)}) rotate(${f1(d.r)}) translate(0 ${f1(b.h / 2)})`);
          if (d.cx < -280 || d.cx > 680) { d.out = true; b.outer.remove(); }
        });
        // ambience for the current scene
        if (theme === 0) winCloud.setAttribute('transform', `translate(${f1(((t * 9) % 150) - 30)} 372)`);
        else if (theme === 1) skyClouds.forEach(c => { const x = ((c.x + t * c.v) % 520) - 60; c.g.setAttribute('transform', `translate(${f1(x)} ${c.y})`); });
        else flakes.forEach(fl => {
          fl.y += fl.v * dt; if (fl.y > 780) { fl.y = -20; fl.x = rand(-20, 420); }
          fl.n.setAttribute('cx', f1(fl.x + Math.sin(t * 1.2 + fl.ph) * 12)); fl.n.setAttribute('cy', f1(fl.y));
        });
      });
      // blinking: a random block (or the chute) blinks every so often
      ctx.every(800, () => {
        if (Math.random() < .5) return;
        const b = pick([...placed, 'chute']);
        if (b === 'chute') chuteEyes.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 });
        else if (b) b.face.blink();
      });

      /* ---------- taps ---------- */
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e);
        lookAt(p);
        if (phase === 'build') {
          haptic();
          drop();
          ctx.sparkle(p.x, p.y, 2, 16, '#fff');
        } else {
          ctx.sparkle(p.x, p.y, 4, 26, pick(PARTY)); A.twinkle();
        }
      });
      ballG.addEventListener('pointerdown', e => {
        if (theme !== 0) return;
        e.stopPropagation(); haptic();
        ball.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(0px) scale(1.2,.8)', offset: .15 }, { transform: 'translateY(-70px) scale(.9,1.1)', offset: .5 }, { transform: 'translateY(0px) scale(1.15,.85)', offset: .85 }, { transform: 'translateY(0px) scale(1)' }], { duration: 700 });
        A.boing();
      });
      ghost.pos.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic(); ghost.giggle(); ghost.hop();
        ctx.sparkle(ghost.x, ghost.y - 30, 3, 30, '#fff3b0');
        ctx.after(800, () => { if (phase === 'build') ghost.set('normal'); });
      });
      starG.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic(); A.twinkle();
        ctx.sparkle(starAt[0], starAt[1], 6, 38);
        starTap.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35,.8)' }, { transform: 'scale(.9,1.2) rotate(20deg)' }, { transform: 'scale(1)' }], { duration: 480 });
      });

      setTheme(0, false);
      newPlan();
      ctx.after(250, () => { ghost.set('happy'); ghost.talk('つみき しよう！'); });
      ctx.after(650, drop);
      ctx.after(1900, () => { if (phase === 'build') ghost.set('normal'); });
      ctx.hint = () => (phase === 'build' && !falling) ? [CX, Math.max(170, topY() - 80)] : null;
    }
  };
  TOYS.push(blocksToy);
})();
