'use strict';
/* =========================================================
   toy 5: おやすみ — tuck friends in, a picture book, lights out, lullaby.
   Three bedrooms rotate: an animal bedroom, a tent under the stars, cloud beds in the sky.
   ========================================================= */
const LULLABY = [[67, 1], [64, 1], [60, 2], [64, 1], [67, 1], [72, 2], [71, 1], [67, 1], [69, 2], [67, 1], [64, 1], [62, 2],
  [64, 1], [62, 1], [60, 1], [62, 1], [64, 2], [67, 2], [65, 1], [64, 1], [62, 1], [59, 1], [60, 4]];
(() => {
  const BX = [76, 200, 324];
  const NAMES = { chick: 'ひよこさん', bunny: 'うさぎさん', bear: 'くまさん', frog: 'かえるさん', dog: 'いぬさん', cat: 'ねこさん' };
  const UP = 496, BED = 556;

  function starD(x, y, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .5 : r;
      d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1);
    }
    return d + 'Z';
  }

  const night = {
    id: 'night', name: 'おやすみ', color: '#3c3378',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#2b2766' }, g);
      el('circle', { cx: 40, cy: -42, r: 18, fill: '#fff6c8' }, g);
      el('circle', { cx: 48, cy: -48, r: 16, fill: '#2b2766' }, g);
      [[-50, -50], [-20, -60], [10, -30], [-60, -10]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.2, fill: '#fff' }, g));
      makeGhost(null, g, { x: -4, y: 22, s: .62, expr: 'sleepy', still: true });
      el('text', { x: 34, y: -2, 'font-size': 20, fill: '#fff' }, g).textContent = 'z';
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      /* ---------- defs ---------- */
      const lin = (id, stops) => { const g = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs); stops.forEach(([o, c, a = 1]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g)); };
      const radial = (id, stops) => { const g = el('radialGradient', { id, cx: .5, cy: .5, r: .5 }, defs); stops.forEach(([o, c, a]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g)); };
      lin('night-dusk', [[0, '#ff9f7a'], [1, '#ffd48a']]);
      lin('night-tentsky', [[0, '#1f2a64'], [.6, '#3d3a86'], [1, '#6a4f9a']]);
      lin('night-dream', [[0, '#7a6fd0'], [.55, '#b9a7f0'], [1, '#ffd0e0']]);
      lin('night-beam', [[0, '#fff3b0', 0], [1, '#fff3b0', .22]]);
      radial('night-glow', [[0, '#fff3b0', .85], [1, '#fff3b0', 0]]);
      radial('night-fly', [[0, '#fffbd0', 1], [.35, '#f4ff8a', .7], [1, '#d8ff6a', 0]]);
      const pat = el('pattern', { id: 'night-stars', width: 60, height: 60, patternUnits: 'userSpaceOnUse' }, defs);
      el('path', { d: 'M15,8 l2,5 5,0 -4,3 2,5 -5,-3 -5,3 2,-5 -4,-3 5,0z', fill: '#ffe4c4' }, pat);
      el('circle', { cx: 45, cy: 40, r: 2.5, fill: '#ffe4c4' }, pat);

      const world = el('g', {}, svg);
      const ghostL = el('g', {}, svg);
      const front = el('g', {}, svg);
      const zzz = el('g', { 'pointer-events': 'none' }, svg);
      const cover = el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: '#2a2660', opacity: 0, 'pointer-events': 'none' }, svg);
      const ghost = ctx.ghost(ghostL, { x: 200, y: 292, s: .7 });

      /* ---------- friends: outer(translate) > flo(float) > body(tb) ---------- */
      function friend(kind, parent, x, y, s) {
        const outer = el('g', {}, parent);
        const flo = el('g', { class: 'float' }, outer);
        const body = el('g', { class: 'tb' }, flo);
        const p = ANIMALS[kind](body);
        let X = x, Y = y, S = s, asleep = false, closeT = 0;
        const f = {
          kind, outer, body, n: NAMES[kind],
          get x() { return X; }, get y() { return Y; },
          place(x2, y2, s2 = S) { X = x2; Y = y2; S = s2; outer.setAttribute('transform', `translate(${x2.toFixed(1)} ${y2.toFixed(1)}) scale(${s2.toFixed(3)})`); },
          float(on, d = 0) { flo.classList.toggle('float', on); flo.style.animationDelay = `-${d}s`; },
          sleep(on) { asleep = on; p.open.style.display = on ? 'none' : ''; p.shut.style.display = on ? '' : 'none'; },
          mouth(on) { p.mo.style.display = on ? '' : 'none'; p.mc.style.display = on ? 'none' : ''; },
          look(px, py) { p.open.setAttribute('transform', `translate(${clamp((px - X) / 30, -4, 4).toFixed(1)} ${clamp((py - Y) / 40, -3, 3).toFixed(1)})`); },
          blink() { if (asleep) return; f.sleep(true); ctx.after(160, () => f.sleep(false)); },
          squash(k = 1) { body.animate([{ transform: 'scale(1)' }, { transform: `scale(${1 + .15 * k},${1 - .15 * k})`, offset: .3 }, { transform: `scale(${1 - .08 * k},${1 + .1 * k})`, offset: .65 }, { transform: 'scale(1)' }], { duration: 600, easing: 'ease-out' }); },
          yawn() {
            f.mouth(true); A.yawn();
            body.animate([{ transform: 'scale(1)' }, { transform: 'scale(.94,1.1)', offset: .5 }, { transform: 'scale(1.04,.96)', offset: .8 }, { transform: 'scale(1)' }], { duration: 900, easing: 'ease-in-out' });
            clearTimeout(closeT); closeT = ctx.after(700, () => f.mouth(false));
          }
        };
        f.place(x, y, s);
        return f;
      }

      /* ---------- the three bedrooms ---------- */
      const ROOMS = ['room', 'tent', 'sky'];
      const KINDS = { room: ['chick', 'bunny', 'bear'], tent: ['frog', 'dog', 'cat'], sky: ['bunny', 'chick', 'bear'] };
      let R = null, roomIdx = 0, round = 0;
      let asleep = [false, false, false], lightsOn = true, busy = false, storyDone = false, story = null, lastP = { x: 200, y: 400 };

      function buildRoom(id) {
        world.replaceChildren(); front.replaceChildren(); zzz.replaceChildren();
        ['night-nwin', 'night-pclip'].forEach(k => { const n = defs.querySelector('#' + k); if (n) n.remove(); });
        R = { id, beds: [], friends: [], blankets: [], shadows: [], flies: [], clouds: [], bob: id === 'sky' ? 5 : 0 };
        const w = world;
        const back = el('g', {}, w);
        /* far + mid layers */
        if (id === 'room') {
          el('rect', { x: -800, y: -900, width: 2000, height: 1420, fill: '#ffd9b8' }, back);
          el('rect', { x: -800, y: -900, width: 2000, height: 1420, fill: 'url(#night-stars)' }, back);
          [[90, 330], [250, 60], [370, 360], [150, 420], [300, 420]].forEach(([x, y], i) => el('path', { d: starD(x, y, 7), fill: '#ffe9a8', class: 'twinkle', style: `animation-delay:-${i * .5}s` }, back));
          el('rect', { x: -800, y: 520, width: 2000, height: 1300, fill: '#d9a378' }, back);
          [590, 660, 740].forEach(y => el('rect', { x: -800, y, width: 2000, height: 3, fill: '#c89268', opacity: .6 }, back));
          el('rect', { x: -800, y: 512, width: 2000, height: 12, fill: '#fff0e0' }, back);
          el('ellipse', { cx: 200, cy: 706, rx: 210, ry: 56, fill: '#c9a7ff', opacity: .4 }, back);
          el('ellipse', { cx: 200, cy: 706, rx: 170, ry: 40, fill: '#fff', opacity: .12 }, back);
          // shelf + picture
          el('rect', { x: 262, y: 262, width: 128, height: 14, rx: 6, fill: '#b07a4d', filter: 'url(#soft)' }, back);
          el('rect', { x: 196, y: 120, width: 52, height: 62, rx: 6, fill: '#fff', filter: 'url(#soft)' }, back);
          el('path', { d: 'M222,164 C206,152 210,138 222,146 C234,138 238,152 222,164Z', fill: '#ff8fa3' }, back);
          // a mobile of stars and a moon over the beds, gently turning
          const mob = el('g', { transform: 'translate(200 6)' }, back);
          const mi = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, mob);
          el('path', { d: 'M0,0 L0,40 M-70,40 L70,40', stroke: '#b07a4d', 'stroke-width': 3, 'stroke-linecap': 'round' }, mi);
          [[-70, 70, '#ffd56b'], [0, 84, '#ffb3c1'], [70, 66, '#9be3c9']].forEach(([x, y, c], i) => { el('path', { d: `M${x},40 L${x},${y - 12}`, stroke: '#b07a4d', 'stroke-width': 2 }, mi); el('path', { d: starD(x, y, 13), fill: c, 'stroke-linejoin': 'round' }, mi); });
          mi.animate([{ transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }], { duration: 4200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          R.clip = [-800, -900, 2000, 1350];
        } else if (id === 'tent') {
          el('rect', { x: -800, y: -900, width: 2000, height: 1420, fill: 'url(#night-tentsky)' }, back);
          for (let i = 0; i < 18; i++) el('circle', { cx: rand(-40, 440).toFixed(0), cy: rand(-40, 300).toFixed(0), r: rand(1.4, 2.8).toFixed(1), fill: '#fff', class: 'twinkle', style: `animation-delay:-${rand(0, 2.4).toFixed(1)}s` }, back);
          const far = el('g', {}, back);
          [[-20, 330, 70], [40, 300, 90], [370, 310, 80], [430, 340, 60]].forEach(([x, y, h]) => el('path', { d: `M${x - h * .55},520 L${x},${y - h} L${x + h * .55},520Z`, fill: '#22305e' }, far));
          el('path', { d: 'M-800,1700 L-800,500 Q-100,430 200,470 Q460,500 1200,440 L1200,1700Z', fill: '#2c4458' }, back);
          el('path', { d: 'M-800,1700 L-800,530 Q0,505 200,520 Q400,535 1200,510 L1200,1700Z', fill: '#3c6b55' }, back);
          for (let i = 0; i < 9; i++) { const x = 20 + i * 46, y = 700 + (i % 3) * 24; el('path', { d: `M${x - 6},${y} q3,-14 6,-18 M${x},${y} q0,-16 2,-22 M${x + 6},${y} q-2,-12 -6,-16`, stroke: '#4f8a68', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, back); }
          // the tent
          el('path', { d: 'M200,150 L30,520 L370,520Z', fill: '#ff9f6b', 'stroke-linejoin': 'round' }, back);
          el('path', { d: 'M200,150 L370,520 L200,520Z', fill: '#ff8a5c' }, back);
          el('path', { d: 'M200,250 L140,520 L260,520Z', fill: '#5a3a5a' }, back);
          el('path', { d: 'M200,250 L140,520 L118,520Z', fill: '#ffb88a' }, back);
          el('path', { d: 'M200,250 L260,520 L282,520Z', fill: '#e8784c' }, back);
          el('path', { d: 'M200,140 L200,160', stroke: '#8a5a3a', 'stroke-width': 5, 'stroke-linecap': 'round' }, back);
          const flag = el('g', { class: 'tb', style: 'transform-origin:0% 50%' }, back);
          el('path', { d: 'M200,126 L228,134 L200,142Z', fill: '#ffd56b' }, flag);
          flag.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.7)' }], { duration: 1400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          el('path', { d: 'M200,140 L200,126', stroke: '#8a5a3a', 'stroke-width': 3 }, back);
          R.clipTent = true;
          for (let i = 0; i < 8; i++) {
            const n = el('circle', { r: 9, fill: 'url(#night-fly)', 'pointer-events': 'none' }, back);
            R.flies.push({ n, x: rand(10, 390), y: rand(180, 700), ph: rand(0, 6), sp: rand(.25, .5), life: Infinity });
          }
        } else {
          el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: 'url(#night-dream)' }, back);
          for (let i = 0; i < 14; i++) el('circle', { cx: rand(-40, 440).toFixed(0), cy: rand(-40, 380).toFixed(0), r: rand(1.4, 2.6).toFixed(1), fill: '#fff', class: 'twinkle', style: `animation-delay:-${rand(0, 2.4).toFixed(1)}s` }, back);
          const far = el('g', {}, back);
          [[40, 260, .7], [300, 330, .9], [180, 420, .6]].forEach(([x, y, s]) => {
            const g = el('g', {}, far);
            [[0, 0, 26], [26, -10, 22], [50, 0, 20], [24, 8, 24]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill: '#fff', opacity: .55 }, g));
            R.clouds.push({ g, x, y, s, v: rand(3, 7) });
          });
          // a sea of clouds below the beds
          const near = el('g', {}, back);
          for (let i = 0; i < 9; i++) el('circle', { cx: -30 + i * 58, cy: 720 + (i % 2) * 18, r: 56, fill: i % 2 ? '#ffe6f0' : '#fff4f8' }, near);
          el('rect', { x: -800, y: 740, width: 2000, height: 900, fill: '#ffe6f0' }, near);
        }
        /* beds */
        const BEDC = id === 'tent' ? [['#7fb8ff', '#5f9be8'], ['#ffd56b', '#f0b840'], ['#9be3c9', '#6fcdac']] : id === 'sky' ? [['#c9b8ff', '#b39dff'], ['#ffc4d6', '#ffa8c0'], ['#bfe6ff', '#9fd4f5']] : [['#7fb8ff', '#5f9be8'], ['#ffb3c1', '#ff8fa3'], ['#9be3c9', '#6fcdac']];
        BX.forEach((x, i) => {
          const g = el('g', {}, w);
          const bk = el('g', {}, g);
          if (id === 'room') {
            el('rect', { x: x - 58, y: 500, width: 116, height: 72, rx: 22, fill: '#c98f5f' }, bk);
            el('rect', { x: x - 50, y: 508, width: 100, height: 10, rx: 5, fill: '#e0aa78' }, bk);
            el('rect', { x: x - 62, y: 566, width: 124, height: 22, rx: 10, fill: '#fff' }, bk);
            el('ellipse', { cx: x - 26, cy: 566, rx: 26, ry: 13, fill: '#fff', stroke: '#efe4da', 'stroke-width': 3 }, bk);
          } else if (id === 'tent') {
            el('rect', { x: x - 64, y: 586, width: 128, height: 64, rx: 18, fill: '#4a5a8a', opacity: .55 }, bk);
            el('rect', { x: x - 58, y: 562, width: 116, height: 80, rx: 30, fill: BEDC[i][1] }, bk);
            el('ellipse', { cx: x - 22, cy: 566, rx: 28, ry: 13, fill: '#fff8ec' }, bk);
          } else {
            [[-48, 0, 30], [-14, -12, 36], [24, -8, 34], [52, 4, 26]].forEach(([dx, dy, r]) => el('circle', { cx: x + dx, cy: 580 + dy, r, fill: '#fff' }, bk));
            el('ellipse', { cx: x - 24, cy: 562, rx: 26, ry: 12, fill: '#fff6fb', stroke: '#f3e0ec', 'stroke-width': 3 }, bk);
          }
          const sh = el('ellipse', { cx: x, cy: 570, rx: 34, ry: 7, fill: '#3a2f5b', opacity: .14 }, g);
          const f = friend(KINDS[id][i], g, x, UP, .84);
          f.float(true, i * .8);
          f.outer.addEventListener('pointerdown', e => { e.stopPropagation(); lastP = ctx.point(e); tapFriend(i); });
          const bl = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, g);
          if (id === 'sky') {
            el('path', { d: `M${x - 60},630 L${x - 60},590 Q${x - 60},572 ${x - 40},574 Q${x - 20},564 ${x},574 Q${x + 20},564 ${x + 40},574 Q${x + 60},572 ${x + 60},590 L${x + 60},630Z`, fill: BEDC[i][0] }, bl);
          } else {
            el('rect', { x: x - 62, y: 574, width: 124, height: 58, rx: id === 'tent' ? 24 : 16, fill: BEDC[i][0] }, bl);
            el('rect', { x: x - 62, y: 574, width: 124, height: 12, rx: 6, fill: BEDC[i][1] }, bl);
            if (id === 'tent') el('path', { d: `M${x + 40},582 L${x + 40},628`, stroke: '#fff', 'stroke-width': 2.5, 'stroke-dasharray': '4 4', opacity: .7 }, bl);
          }
          [[-34, 606], [0, 614], [34, 602]].forEach(([dx, y]) => el(id === 'sky' ? 'path' : 'circle', id === 'sky' ? { d: starD(x + dx, y, 6), fill: '#fff', opacity: .7 } : { cx: x + dx, cy: y, r: 4, fill: '#fff', opacity: .6 }, bl));
          el('ellipse', { cx: x - 30, cy: 590, rx: 16, ry: 5, fill: '#fff', opacity: .3 }, bl);
          bl.style.transform = 'scaleY(0)';
          const fr = el('g', {}, g);
          if (id === 'room') {
            el('rect', { x: x - 64, y: 626, width: 128, height: 26, rx: 10, fill: '#c98f5f' }, fr);
            el('rect', { x: x - 56, y: 650, width: 12, height: 16, rx: 4, fill: '#a3714a' }, fr);
            el('rect', { x: x + 44, y: 650, width: 12, height: 16, rx: 4, fill: '#a3714a' }, fr);
            el('ellipse', { cx: x, cy: 672, rx: 60, ry: 6, fill: '#3a2f5b', opacity: .12 }, fr);
          } else if (id === 'sky') {
            [[-50, 638, 22], [-20, 646, 26], [14, 646, 26], [46, 638, 22]].forEach(([dx, y, r]) => el('circle', { cx: x + dx, cy: y, r, fill: '#fff' }, fr));
            el('ellipse', { cx: x - 30, cy: 630, rx: 12, ry: 5, fill: '#fff', opacity: .9 }, fr);
            el('ellipse', { cx: x, cy: 666, rx: 54, ry: 6, fill: '#b39dff', opacity: .25 }, fr);
          }
          R.beds.push(g); R.friends.push(f); R.blankets.push(bl); R.shadows.push(sh);
        });

        /* the lamp: a lamp on a shelf, a lantern on a pole, or the moon */
        const lamp = el('g', {}, w);
        R.lampG = lamp;
        if (id === 'room') {
          R.glow = el('circle', { cx: 326, cy: 206, r: 84, fill: 'url(#night-glow)', opacity: .9 }, lamp);
          el('rect', { x: 312, y: 236, width: 28, height: 26, rx: 6, fill: '#7fdcc0' }, lamp);
          el('rect', { x: 323, y: 208, width: 6, height: 30, fill: '#8a6a4a' }, lamp);
          R.shade = el('path', { d: 'M290,212 L362,212 L346,166 L306,166Z', fill: '#ffd56b' }, lamp);
          el('rect', { x: 340, y: 212, width: 3, height: 36, fill: '#8a6a4a' }, lamp);
          el('circle', { cx: 341.5, cy: 252, r: 6, fill: '#ff7a8a' }, lamp);
          el('rect', { x: 268, y: 140, width: 120, height: 130, fill: 'transparent' }, lamp);
          R.lampAt = [326, 206]; R.shadeOn = '#ffd56b'; R.shadeOff = '#c9a95a';
        } else if (id === 'tent') {
          el('path', { d: 'M366,524 L366,250 Q366,236 352,236', stroke: '#8a5a3a', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, lamp);
          R.glow = el('circle', { cx: 350, cy: 276, r: 80, fill: 'url(#night-glow)', opacity: .9 }, lamp);
          const lg = el('g', { transform: 'translate(350 236)' }, lamp);
          const sw = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, lg);
          el('path', { d: 'M0,0 L0,14', stroke: '#6a4a30', 'stroke-width': 3 }, sw);
          el('rect', { x: -16, y: 12, width: 32, height: 8, rx: 3, fill: '#6a4a30' }, sw);
          R.shade = el('rect', { x: -13, y: 18, width: 26, height: 36, rx: 9, fill: '#ffd56b' }, sw);
          el('rect', { x: -6, y: 24, width: 12, height: 24, rx: 5, fill: '#fff6c8', opacity: .8 }, sw);
          el('rect', { x: -16, y: 52, width: 32, height: 7, rx: 3, fill: '#6a4a30' }, sw);
          sw.animate([{ transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg)' }], { duration: 2600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          el('rect', { x: 300, y: 220, width: 96, height: 110, fill: 'transparent' }, lamp);
          R.lampAt = [350, 270]; R.shadeOn = '#ffd56b'; R.shadeOff = '#a89060';
        }
        /* dark overlay, then what stays bright */
        R.dark = el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: '#14133a', opacity: 0, 'pointer-events': 'none' }, w);
        const bright = el('g', {}, w);
        if (id === 'room') {
          const win = el('g', {}, bright);
          el('rect', { x: 30, y: 92, width: 150, height: 170, rx: 16, fill: '#fff', filter: 'url(#soft)' }, win);
          const wclip = el('clipPath', { id: 'night-nwin' }, defs);
          el('rect', { x: 42, y: 104, width: 126, height: 146, rx: 8 }, wclip);
          const wi = el('g', { 'clip-path': 'url(#night-nwin)' }, win);
          el('rect', { x: 42, y: 104, width: 126, height: 146, fill: 'url(#night-dusk)' }, wi);
          R.sun = el('circle', { cx: 105, cy: 232, r: 26, fill: '#fff1a8' }, wi);
          R.sun.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(14px)' }], { duration: 20000, fill: 'forwards' });
          const cl = el('g', {}, wi);
          [[0, 0, 12], [14, -5, 10], [26, 0, 9]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill: '#fff', opacity: .8 }, cl));
          R.winCloud = cl;
          R.nightSky = el('g', { opacity: 0 }, wi);
          el('rect', { x: 42, y: 104, width: 126, height: 146, fill: '#1f2a5a' }, R.nightSky);
          el('circle', { cx: 132, cy: 140, r: 20, fill: '#fff6c8' }, R.nightSky);
          el('circle', { cx: 142, cy: 132, r: 17, fill: '#1f2a5a' }, R.nightSky);
          [[62, 124], [90, 150], [70, 200], [150, 210], [112, 118]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.4, fill: '#fff', class: 'twinkle' }, R.nightSky));
          el('rect', { x: 102, y: 104, width: 6, height: 146, fill: '#fff' }, win);
          el('rect', { x: 42, y: 174, width: 126, height: 6, fill: '#fff' }, win);
          R.skyRect = [42, 104, 168, 250];
        } else {
          // the moon stays bright; in the sky room she is the lamp and puts on a nightcap
          const mg = el('g', { transform: `translate(${id === 'sky' ? 318 : 318} ${id === 'sky' ? 150 : 76})` }, id === 'sky' ? lamp : bright);
          if (id === 'sky') { bright.appendChild(lamp); }
          const mglow = el('circle', { r: 86, fill: 'url(#night-glow)', opacity: .8 }, mg);
          const mb = el('g', { class: 'tb' }, mg);
          el('circle', { r: id === 'sky' ? 46 : 30, fill: '#fff6c8' }, mb);
          el('ellipse', { cx: -12, cy: -16, rx: 10, ry: 5, fill: '#fff', opacity: .7 }, mb);
          if (id === 'sky') {
            R.moonEyes = el('g', {}, mb); R.moonShut = el('g', { style: 'display:none' }, mb);
            [-15, 15].forEach(x => {
              el('ellipse', { cx: x, cy: -2, rx: 5, ry: 6.5, fill: '#3a2f5b' }, R.moonEyes);
              el('circle', { cx: x - 1.8, cy: -4.5, r: 2, fill: '#fff' }, R.moonEyes);
              el('path', { d: `M${x - 7},-2 Q${x},4 ${x + 7},-2`, stroke: '#3a2f5b', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, R.moonShut);
            });
            [-26, 26].forEach(x => el('ellipse', { cx: x, cy: 10, rx: 7, ry: 4.5, fill: '#ffa3b8', opacity: .8 }, mb));
            el('path', { d: 'M-6,14 Q0,19 6,14', stroke: '#3a2f5b', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, mb);
            R.cap = el('g', { opacity: 0 }, mb);
            el('path', { d: 'M-44,-22 Q-30,-70 10,-62 Q48,-54 64,-8 Q40,-30 -44,-22Z', fill: '#8fb8ff' }, R.cap);
            el('circle', { cx: 66, cy: -6, r: 9, fill: '#fff' }, R.cap);
            el('path', { d: 'M-46,-22 Q0,-34 52,-20', stroke: '#fff', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, R.cap);
            mb.animate([{ transform: 'rotate(-5deg)' }, { transform: 'rotate(5deg)' }], { duration: 3600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
            el('circle', { r: 70, fill: 'transparent' }, mg);
            R.glow = mglow; R.moonB = mb; R.lampAt = [318, 150];
          }
        }
        /* the star nightlight and its projection */
        R.proj = el('g', { 'pointer-events': 'none', opacity: 0 }, bright);
        const pc = el('clipPath', { id: 'night-pclip' }, defs);
        if (id === 'tent') el('path', { d: 'M200,150 L30,520 L370,520Z' }, pc);
        else el('rect', { x: -800, y: -900, width: 2000, height: id === 'room' ? 1360 : 1380 }, pc);
        const pcg = el('g', { 'clip-path': 'url(#night-pclip)' }, R.proj);
        el('path', { d: 'M184,704 L-60,120 L460,120 L216,704Z', fill: 'url(#night-beam)', opacity: .35 }, R.proj);
        R.spin = el('g', {}, pcg);
        R.rare = round > 0 && Math.random() < 1 / 6;
        const tent = id === 'tent';
        for (let i = 0; i < (tent ? 30 : 34); i++) {
          const a = rand(0, Math.PI * 2), r = tent ? Math.sqrt(rand(.02, 1)) * 230 : rand(30, 360);
          el('path', { d: starD(200 + Math.cos(a) * r, (tent ? 370 : 230) + Math.sin(a) * r, rand(7, 15)), fill: R.rare ? PARTY[i % PARTY.length] : (i % 3 ? '#fff3b0' : '#ffd6e8'), opacity: rand(.5, .85).toFixed(2), 'stroke-linejoin': 'round' }, R.spin);
        }
        R.angle = 0;
        // the nightlight itself, on the floor in front
        const nl = el('g', { transform: 'translate(200 718)' }, bright);
        const nlb = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, nl);
        R.nlGlow = el('circle', { cy: -24, r: 50, fill: 'url(#night-glow)', opacity: 0 }, nlb);
        el('ellipse', { cy: 4, rx: 36, ry: 9, fill: '#3a2f5b', opacity: .15 }, nlb);
        el('rect', { x: -34, y: -12, width: 68, height: 16, rx: 8, fill: '#8fb8ff' }, nlb);
        R.dome = el('path', { d: 'M-28,-10 Q-28,-48 0,-50 Q28,-48 28,-10Z', fill: '#e8e0ff' }, nlb);
        [[-12, -30], [8, -38], [14, -20], [-4, -18]].forEach(([x, y]) => el('path', { d: starD(x, y, 5), fill: '#ffd56b' }, nlb));
        el('ellipse', { cx: -12, cy: -38, rx: 8, ry: 4, fill: '#fff', opacity: .6 }, nlb);
        el('rect', { x: -48, y: -64, width: 96, height: 76, fill: 'transparent' }, nlb);
        R.nl = nlb;
        nl.addEventListener('pointerdown', e => {
          e.stopPropagation(); haptic();
          nlb.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15,.85)' }, { transform: 'scale(.95,1.08)' }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
          A.sfx('blink', { vol: .25, rate: rand(.8, 1) }) || A.bell(mtof(84), { vol: .06 });
          if (!lightsOn) { R.spin.animate([{ opacity: 1 }, { opacity: .6 }, { opacity: 1 }], { duration: 900 }); ctx.sparkle(200, 680, 3, 30, '#fff3b0'); }
          else ctx.sparkle(200, 680, 2, 24, '#ffd56b');
        });
        lamp.addEventListener('pointerdown', switchLamp);

        /* the picture book, waiting on the floor */
        buildBook();
        asleep = [false, false, false]; lightsOn = true; busy = false; storyDone = false; story = null;
      }

      /* ---------- the picture book ---------- */
      const BOOK0 = [330, 708];
      let book = null;
      function buildBook() {
        const o = el('g', {}, front);
        const b = el('g', { class: 'tb' }, o);
        const halo = el('ellipse', { cx: 0, cy: 0, rx: 60, ry: 40, fill: 'url(#night-glow)', opacity: 0, 'pointer-events': 'none' }, b);
        const closed = el('g', {}, b);
        el('rect', { x: -38, y: -28, width: 76, height: 56, rx: 7, fill: '#ff8fa3' }, closed);
        el('rect', { x: -38, y: -28, width: 10, height: 56, rx: 4, fill: '#e86a88' }, closed);
        el('rect', { x: 34, y: -24, width: 5, height: 48, fill: '#fff8ec' }, closed);
        el('path', { d: starD(6, -2, 14), fill: '#ffd56b', 'stroke-linejoin': 'round' }, closed);
        el('ellipse', { cx: -10, cy: -18, rx: 12, ry: 4, fill: '#fff', opacity: .4 }, closed);
        const open = el('g', { style: 'display:none' }, b);
        el('rect', { x: -100, y: -64, width: 200, height: 128, rx: 12, fill: '#ff8fa3' }, open);
        el('rect', { x: -92, y: -58, width: 90, height: 116, rx: 8, fill: '#fffaf0' }, open);
        el('rect', { x: 2, y: -58, width: 90, height: 116, rx: 8, fill: '#fffaf0' }, open);
        el('rect', { x: -4, y: -58, width: 8, height: 116, fill: '#f0e4d4' }, open);
        const pics = el('g', {}, open);
        const flipPage = el('rect', { x: 2, y: -58, width: 90, height: 116, rx: 8, fill: '#fff6e8', class: 'tb', style: 'transform-origin:0% 50%;display:none' }, open);
        el('rect', { x: -110, y: -76, width: 220, height: 150, fill: 'transparent' }, b);
        book = { o, b, halo, closed, open, pics, flipPage, x: BOOK0[0], y: BOOK0[1], s: 1 };
        placeBook(BOOK0[0], BOOK0[1], 1);
        o.addEventListener('pointerdown', e => { e.stopPropagation(); haptic(); tapBook(); });
      }
      function placeBook(x, y, s) { book.x = x; book.y = y; book.s = s; book.o.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`); }
      function drawPage(i) {
        const g = book.pics; g.replaceChildren();
        // little stars on the left page, the picture on the right
        [[-70, -36], [-30, 20], [-60, 34], [-24, -30]].forEach(([x, y]) => el('path', { d: starD(x, y, 5), fill: '#ffd56b', opacity: .6 }, g));
        if (i === 0) {
          el('circle', { cx: 46, cy: -4, r: 28, fill: '#ffe27a' }, g);
          el('circle', { cx: 58, cy: -12, r: 24, fill: '#fffaf0' }, g);
          el('path', { d: starD(70, 30, 8), fill: '#ffd56b' }, g);
          el('path', { d: starD(24, -38, 6), fill: '#ffd56b' }, g);
          el('path', { d: 'M28,4 Q32,8 36,4', stroke: '#3a2f5b', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, g);
          el('path', { d: 'M-70,-6 Q-50,-12 -36,0', stroke: '#c9a7ff', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
        } else if (i === 1) {
          el('path', { d: 'M14,40 L84,40 M22,40 L22,20 M48,40 L48,20 M74,40 L74,20 M16,28 L80,28', stroke: '#c98f5f', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
          const sh = el('g', { transform: 'translate(48 -12)' }, g);
          [[-12, 0, 11], [0, -6, 12], [12, 0, 11], [0, 6, 11]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: '#e6e0f0', 'stroke-width': 2 }, sh));
          el('ellipse', { cx: -20, cy: 0, rx: 8, ry: 9, fill: '#5a4f6e' }, sh);
          el('path', { d: 'M-24,-1 Q-22,2 -19,-1', stroke: '#fff', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }, sh);
          el('path', { d: 'M-6,14 L-6,22 M8,14 L8,22', stroke: '#5a4f6e', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, sh);
        } else {
          const cs = R.friends.map(f => f.kind);
          const col = { chick: '#ffe066', bunny: '#fff4f7', bear: '#b9824f', frog: '#7fd36b', dog: '#d9a066', cat: '#ffb066' };
          cs.forEach((k, j) => {
            const x = 20 + j * 27, y = 10;
            el('circle', { cx: x, cy: y, r: 12, fill: col[k], stroke: '#efe4da', 'stroke-width': 1.5 }, g);
            el('path', { d: `M${x - 6},${y} q3,3 5,0 M${x + 1},${y} q3,3 5,0`, stroke: '#3a2f5b', 'stroke-width': 1.8, fill: 'none', 'stroke-linecap': 'round' }, g);
          });
          el('rect', { x: 4, y: 20, width: 84, height: 18, rx: 7, fill: '#9be3c9' }, g);
          el('text', { x: 66, y: -18, 'font-size': 16, fill: '#8fb8ff' }, g).textContent = 'z';
          el('text', { x: 76, y: -30, 'font-size': 12, fill: '#8fb8ff' }, g).textContent = 'z';
        }
      }
      const PAGES = ['おつきさま', 'ひつじさん', 'みんな ねんね'];
      function startStory() {
        story = { page: -1, t: 0 }; busy = true;
        ghost.set('happy'); ghost.talk('えほん よもうね');
        ghost.moveTo(200, 352, .7, 1000);
        book.halo.animate([{ opacity: .8 }, { opacity: 0 }], { duration: 500, fill: 'forwards' });
        R.friends.forEach((f, i) => ctx.after(300 + i * 200, () => { f.sleep(false); f.look(200, 420); f.squash(.5); }));
        const x0 = book.x, y0 = book.y;
        ctx.tween(1000, k => placeBook(x0 + (200 - x0) * k, y0 + (438 - y0) * k - Math.sin(k * Math.PI) * 60, 1 + k * .05), () => {
          book.closed.style.display = 'none'; book.open.style.display = '';
          book.b.animate([{ transform: 'scale(.4,1)' }, { transform: 'scale(1.1,.94)', offset: .6 }, { transform: 'scale(1)' }], { duration: 500, easing: 'ease-out' });
          A.sfx('flip', { vol: .4 }) || A.whoosh();
          busy = false;
          turnPage();
        }, easeInOut);
      }
      function turnPage() {
        if (!story) return;
        const next = story.page + 1;
        if (next >= PAGES.length) return endStory();
        if (next > 0) {
          A.sfx('flip', { vol: .45, rate: rand(.9, 1.1) }) || A.osc(800, { slide: 400, slideT: .2, r: .1, vol: .05 });
          book.flipPage.style.display = '';
          book.flipPage.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }], { duration: 500, easing: 'ease-in-out' }).onfinish = () => { book.flipPage.style.display = 'none'; };
          ctx.after(250, () => drawPage(next));
        } else drawPage(0);
        story.page = next; story.t = 0;
        ghost.hop();
        ctx.after(next ? 400 : 100, () => ghost.talk(PAGES[next]));
        if (next === 1) ctx.after(1500, () => A.animal('sheep', { vol: .3 }));
        if (next === 0) ctx.after(1200, () => A.sfx('triangle', { vol: .15 }));
        ctx.after(600, () => { const q = R.friends[next % 3]; q.squash(.4); ctx.sparkle(220, 420, 2, 40, '#ffd56b'); });
      }
      function endStory() {
        const st = story; story = null; busy = true;
        book.open.style.display = 'none'; book.closed.style.display = '';
        A.sfx('flip', { vol: .35, rate: .85 });
        book.b.animate([{ transform: 'scale(1.2,.85)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' });
        ghost.set('sleepy');
        ctx.after(400, () => {
          ctx.tween(900, k => placeBook(200 + (BOOK0[0] - 200) * k, 438 + (BOOK0[1] - 438) * k - Math.sin(k * Math.PI) * 40, 1), () => {
            storyDone = true; busy = false;
            R.friends.forEach((f, i) => ctx.after(i * 250, () => { f.yawn(); ctx.after(700, () => f.sleep(true)); }));
            ghost.moveTo(200, 292, .7, 900, () => { ghost.talk('でんきを けしてね'); ghost.set('normal'); nudgeLamp(); });
          });
        });
      }
      function tapBook() {
        if (!lightsOn || busy) { book.b.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0px)' }], { duration: 300 }); return; }
        if (story) { story.t = 0; book.b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04,.96)' }, { transform: 'scale(1)' }], { duration: 260 }); turnPage(); return; }
        if (asleep.every(Boolean) && !storyDone) return startStory();
        // too early, or already read: the book wiggles and sparkles
        book.b.animate([{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(-8deg) scale(1.1,.9)' }, { transform: 'rotate(6deg) scale(.95,1.05)' }, { transform: 'rotate(0deg) scale(1)' }], { duration: 520, easing: 'ease-out' });
        A.sfx('flip', { vol: .3, rate: 1.2 });
        ctx.sparkle(book.x, book.y - 20, 3, 30);
      }
      function nudgeLamp() {
        if (!R.lampG) return;
        const n = R.moonB || R.lampG;
        n.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0px)' }], { duration: 500, iterations: 2, composite: 'add' });
        R.glow.animate([{ opacity: .9 }, { opacity: 1, transform: 'scale(1.25)' }, { opacity: .9 }], { duration: 1000 });
      }

      /* ---------- tucking in ---------- */
      function tapFriend(i) {
        const f = R.friends[i];
        haptic();
        if (!lightsOn) { A.sfx('blink', { vol: .2, rate: .8 }); heart(f.x, f.y - 40); return; }
        if (asleep[i] || busy) {
          f.squash(.5); A.sfx('blink', { vol: .25, rate: rand(.9, 1.2) }); heart(f.x, f.y - 30);
          if (asleep[i] && !story) { f.sleep(false); f.look(lastP.x, lastP.y); ctx.after(700, () => { if (asleep[i] && !story) f.sleep(true); }); }
          return;
        }
        asleep[i] = true;
        f.float(false);
        f.yawn();
        ctx.after(800, () => {
          const y0 = f.y;
          R.shadows[i].animate([{ opacity: .14 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
          ctx.tween(700, k => f.place(BX[i], y0 + (BED - y0) * k - Math.sin(k * Math.PI) * 30, .84 - k * .1), () => {
            f.sleep(true);
            R.blankets[i].animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1.1)', offset: .7 }, { transform: 'scaleY(1)' }], { duration: 600, fill: 'forwards', easing: 'ease-out' });
            f.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08,.92)' }, { transform: 'scale(1)' }], { duration: 500 });
            A.sfx('snore', { vol: .3 }) || A.osc(mtof(PENTA[i + 4]), { r: .8, vol: .08, wet: .5 });
            ctx.sparkle(BX[i], BED - 20, 3, 40, '#fff3b0');
            ghost.talk(f.n + ' おやすみ');
            if (asleep.every(Boolean)) ctx.after(2200, () => {
              if (storyDone || story) return;
              ghost.set('happy'); ghost.talk('えほん よもうね');
              book.halo.animate([{ opacity: 0 }, { opacity: .9 }], { duration: 600, fill: 'forwards' });
              book.b.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-14px) scale(.95,1.06)' }, { transform: 'translateY(0px) scale(1.05,.95)' }, { transform: 'translateY(0px)' }], { duration: 700, iterations: 2 });
            });
          }, easeInOut);
        });
      }
      function heart(x, y) {
        const g = el('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})`, 'pointer-events': 'none' }, zzz);
        const h = el('path', { d: 'M0,10 C-14,0 -10,-12 0,-5 C10,-12 14,0 0,10Z', fill: '#ff8fa3', class: 'tb' }, g);
        h.animate([{ transform: 'translateY(0px) scale(.4)', opacity: 0 }, { opacity: 1, offset: .25 }, { transform: 'translateY(-50px) scale(1.2)', opacity: 0 }], { duration: 1600, easing: 'ease-out' }).onfinish = () => g.remove();
      }

      /* ---------- lights out (the gentle payoff) and good morning ---------- */
      function lullaby() {
        let t = A.now() + .2;
        LULLABY.forEach(([m, beats]) => {
          A.musicbox(mtof(m + 12), { at: t, vol: .11 });
          if (beats >= 2) A.osc(mtof(m - 12), { at: t, a: .3, hold: .6, r: 1.2, vol: .05, wet: .5 });
          t += beats * .5;
        });
      }
      function shootingStar() {
        const g = el('g', { 'pointer-events': 'none' }, zzz);
        const s = el('path', { d: starD(0, 0, 8), fill: '#fff6c8' }, g);
        const tail = el('path', { d: 'M0,0 L60,-26', stroke: '#fff6c8', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .6 }, g);
        A.bell(mtof(91), { vol: .06 }); A.bell(mtof(96), { vol: .05, when: .15 });
        ctx.tween(1800, k => g.setAttribute('transform', `translate(${(380 - 360 * k).toFixed(1)} ${(40 + 150 * k).toFixed(1)})`), () => g.remove(), easeInOut);
        void s; void tail;
      }
      function switchLamp(e) {
        e.stopPropagation();
        if (busy) return;
        haptic();
        if (lightsOn) {
          if (!asleep.every(Boolean)) { A.click(); ghost.talk('みんなを ねかせてね'); nudgeLamp(); const i = asleep.indexOf(false); R.friends[i].squash(.6); return; }
          if (!storyDone) { A.click(); ghost.talk('えほん よもうね'); book.b.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-14px)' }, { transform: 'translateY(0px)' }], { duration: 500, iterations: 2 }); return; }
          busy = true; lightsOn = false;
          A.click();
          R.glow.animate([{ opacity: .9 }, { opacity: R.id === 'sky' ? .35 : 0 }], { duration: 900, fill: 'forwards' });
          if (R.shade) R.shade.setAttribute('fill', R.shadeOff);
          if (R.cap) { R.cap.animate([{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'translateY(0px)' }], { duration: 700, fill: 'forwards', easing: 'ease-out' }); R.moonEyes.style.display = 'none'; R.moonShut.style.display = ''; }
          R.dark.animate([{ opacity: 0 }, { opacity: .64 }], { duration: 1800, fill: 'forwards' });
          if (R.nightSky) R.nightSky.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1600, fill: 'forwards' });
          ctx.after(900, () => {
            A.sfx('harpup', { vol: .25 }) || A.sfx('sparkle', { vol: .2, rate: .8 }) || A.twinkle();
            book.o.animate([{ opacity: 1 }, { opacity: .35 }], { duration: 1200, fill: 'forwards' });
            R.nlGlow.animate([{ opacity: 0 }, { opacity: .9 }], { duration: 1500, fill: 'forwards' });
            R.dome.setAttribute('fill', '#fff6c8');
            R.proj.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 2400, fill: 'forwards', easing: 'ease-in-out' });
          });
          ghost.glow(true);
          ghost.moveTo(200, 300, .7, 1600, () => { ghost.set('sleepy'); ghost.talk('おやすみなさい'); });
          R.friends.forEach((f, i) => ctx.after(1200 + i * 500, () => f.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05,.95)' }, { transform: 'scale(1)' }], { duration: 1400, easing: 'ease-in-out' })));
          ctx.after(1600, lullaby);
          if (R.rare) ctx.after(4200, shootingStar);
          ctx.after(3000, () => { busy = false; });
        } else {
          busy = true; lightsOn = true;
          A.click();
          R.glow.animate([{ opacity: R.id === 'sky' ? .35 : 0 }, { opacity: .9 }], { duration: 700, fill: 'forwards' });
          if (R.shade) R.shade.setAttribute('fill', R.shadeOn);
          if (R.cap) { R.cap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }); R.moonEyes.style.display = ''; R.moonShut.style.display = 'none'; }
          R.dark.animate([{ opacity: .64 }, { opacity: 0 }], { duration: 1000, fill: 'forwards' });
          if (R.nightSky) R.nightSky.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000, fill: 'forwards' });
          R.proj.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, fill: 'forwards' });
          R.nlGlow.animate([{ opacity: .9 }, { opacity: 0 }], { duration: 700, fill: 'forwards' });
          R.dome.setAttribute('fill', '#e8e0ff');
          book.o.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 700, fill: 'forwards' });
          ghost.glow(false); ghost.set('happy'); ghost.talk('おはよう！'); A.sfx('glockup', { vol: .5 }) || A.chime && A.chime(); ctx.reward();
          ghost.moveTo(200, 292, .7, 600);
          R.friends.forEach((f, i) => ctx.after(300 + i * 220, () => {
            R.blankets[i].animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 300, fill: 'forwards' });
            f.sleep(false);
            R.shadows[i].animate([{ opacity: 0 }, { opacity: .14 }], { duration: 400, fill: 'forwards' });
            ctx.tween(600, k => f.place(BX[i], BED - (BED - UP) * k, .74 + k * .1), () => { f.float(true, i * .8); f.squash(); f.mouth(true); ctx.after(400, () => f.mouth(false)); asleep[i] = false; }, easeBack);
          }));
          ctx.after(1200, () => { ctx.confetti(120, 400, 20); ctx.after(250, () => ctx.confetti(280, 400, 20)); ghost.hop(); });
          ctx.after(3400, nextRoom);
        }
      }
      function nextRoom() {
        cover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, fill: 'forwards' }).onfinish = () => {
          roomIdx = (roomIdx + 1) % ROOMS.length; round++;
          buildRoom(ROOMS[roomIdx]);
          ghost.place(200, 292, .7); ghost.set('normal');
          cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'forwards' });
          ctx.after(600, greet);
        };
      }
      function greet() {
        ghost.set('happy'); ghost.hop(); ghost.talk('ねんねの じかんだよ');
        R.friends.forEach((f, i) => ctx.after(500 + i * 260, () => { f.squash(.7); f.mouth(true); ctx.after(300, () => f.mouth(false)); }));
        ctx.after(1800, () => { if (lightsOn) ghost.set('normal'); });
      }

      /* ---------- taps anywhere ---------- */
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e); lastP = p;
        R.friends.forEach((f, i) => { if (!asleep[i]) f.look(p.x, p.y); });
        if (story) { story.t = 0; turnPage(); return; }
        if (!lightsOn) { ctx.sparkle(p.x, p.y, 3, 20, '#fff6c8'); A.musicbox(mtof(pick(PENTA) + 12), { vol: .05 }); return; }
        if (R.id === 'tent') {
          const n = el('circle', { r: 9, fill: 'url(#night-fly)', 'pointer-events': 'none' }, world);
          R.flies.push({ n, x: p.x, y: p.y, ph: rand(0, 6), sp: rand(.5, .8), life: 4, vy: -rand(14, 26) });
        } else if (R.id === 'sky') {
          const g = el('g', { transform: `translate(${p.x.toFixed(0)} ${p.y.toFixed(0)})`, 'pointer-events': 'none' }, zzz);
          const c = el('g', { class: 'tb' }, g);
          [[-10, 0, 10], [4, -5, 11], [16, 1, 8]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill: '#fff' }, c));
          c.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: .3 }, { transform: 'translateY(-30px) scale(1)', opacity: 0 }], { duration: 1500, easing: 'ease-out' }).onfinish = () => g.remove();
        }
        ctx.sparkle(p.x, p.y, 2, 18, '#ffd56b');
        A.musicbox(mtof(pick(PENTA) + 12), { vol: .06 });
      });
      ghost.pos.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic();
        if (story) { story.t = 0; turnPage(); return; }
        if (lightsOn) { ghost.giggle(); ctx.after(800, () => { if (lightsOn && !story) ghost.set(storyDone ? 'normal' : 'normal'); }); }
        else { A.twinkle(); ghost.hop(); }
      });

      /* ---------- ambient life ---------- */
      ctx.every(1500, () => asleep.forEach((on, i) => {
        if (!on || story) return;
        const dy = R.bob ? Math.sin(performance.now() / 1000 * .8 + i) * R.bob : 0;
        const g = el('g', { transform: `translate(${BX[i] + 30} ${(526 + dy).toFixed(0)})` }, zzz);
        const t = el('text', { 'font-size': 22, fill: lightsOn ? '#8a82a6' : '#fff', class: 'tb' }, g);
        t.textContent = 'z';
        t.animate([{ transform: 'translate(0px,0px) scale(.6)', opacity: 0 }, { opacity: 1, offset: .3 }, { transform: 'translate(22px,-54px) scale(1.2)', opacity: 0 }], { duration: 2200 }).onfinish = () => g.remove();
      }));
      ctx.every(1100, () => {
        const i = Math.floor(rand(0, 3));
        if (!asleep[i] && Math.random() < .6) R.friends[i].blink();
        if (!asleep[i] && Math.random() < .08 && lightsOn) R.friends[i].yawn();
        if (R.id === 'tent' && Math.random() < .04) A.animal('owl', { vol: .15, rate: rand(.9, 1.05) });
      });
      ctx.loop((dt, t) => {
        if (!R) return;
        if (story) { story.t += dt; if (story.t > 4.5 && !busy) { story.t = 0; turnPage(); } }
        if (R.bob) R.beds.forEach((g, i) => g.setAttribute('transform', `translate(0 ${(Math.sin(t * .8 + i) * R.bob).toFixed(1)})`));
        R.angle += dt * 5;
        R.spin.setAttribute('transform', `rotate(${R.angle.toFixed(2)} 200 ${R.id === 'tent' ? 370 : 230})`);
        if (R.winCloud) R.winCloud.setAttribute('transform', `translate(${(30 + ((t * 6) % 180)).toFixed(1)} 136)`);
        R.clouds.forEach(c => c.g.setAttribute('transform', `translate(${(((c.x + t * c.v) % 560) - 80).toFixed(1)} ${c.y}) scale(${c.s})`));
        for (let i = R.flies.length - 1; i >= 0; i--) {
          const f = R.flies[i];
          f.life -= dt; if (f.vy) f.y += f.vy * dt;
          const x = f.x + Math.sin(t * f.sp + f.ph) * 34, y = f.y + Math.sin(t * f.sp * 1.7 + f.ph) * 22;
          f.n.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          f.n.setAttribute('opacity', ((.4 + .6 * Math.max(0, Math.sin(t * 1.6 + f.ph * 3))) * Math.min(1, f.life)).toFixed(2));
          if (f.life <= 0) { f.n.remove(); R.flies.splice(i, 1); }
        }
      });

      roomIdx = Math.floor(Math.random() * ROOMS.length);
      buildRoom(ROOMS[roomIdx]);
      ctx.after(500, greet);
      ctx.hint = () => {
        if (busy || story) return null;
        const i = asleep.indexOf(false);
        if (lightsOn && i >= 0) return [BX[i], UP];
        if (lightsOn && !storyDone) return [book.x, book.y];
        return lightsOn ? R.lampAt : null;
      };
    }
  };
  TOYS.push(night);
})();
