'use strict';
/* =========================================================
   toy 1: かくれんぼ — find ぽわん in three rooms that rotate each round.
   ぽわん peeks out now and then (giggle + eye glint); about 1 round in 6
   is a golden ぽわん round.
   ========================================================= */
const peekaboo = (() => {
  const INK = '#3a2f5b';
  const hl = (g, cx, cy, rx, ry, rot = -30, op = .35) => el('ellipse', { cx, cy, rx, ry, fill: '#fff', opacity: op, transform: `rotate(${rot} ${cx} ${cy})` }, g);
  const shade = (g, cx, cy, rx, ry = 9, op = .14) => el('ellipse', { cx, cy, rx, ry, fill: INK, opacity: op }, g);
  const tb = (p, origin = '50% 50%') => el('g', { class: 'tb', style: `transform-origin:${origin}` }, p);
  const BACK = 'cubic-bezier(.34,1.56,.64,1)';
  // move a cover to a pose; keeps one running animation per node
  function pose(n, to, dur = 380, easing = BACK) {
    const from = n._t || 'none';
    if (n._a) n._a.cancel();
    n._a = n.animate([{ transform: from }, { transform: to }], { duration: dur, easing, fill: 'forwards' });
    n._t = to;
  }
  function squash(n, k = 1) {
    n.animate([{ transform: 'scale(1)' }, { transform: `scale(${1 + .14 * k},${1 - .14 * k})` }, { transform: `scale(${1 - .08 * k},${1 + .1 * k})` },
      { transform: 'scale(1.02,.98)' }, { transform: 'scale(1)' }], { duration: 460, easing: 'ease-out' });
  }
  const loopA = (n, frames, dur, delay = 0, ease = 'ease-in-out') => n.animate(frames, { duration: dur, iterations: Infinity, direction: 'alternate', easing: ease, delay: -delay });
  const rustle = () => A.noise({ type: 'highpass', from: rand(2300, 2900), to: 1600, dur: .38, vol: .13 });
  const face = (g, x, y, s = 1, mouth = true) => {
    [-1, 1].forEach(d => { el('circle', { cx: x + d * 7 * s, cy: y, r: 2.8 * s, fill: INK }, g); el('circle', { cx: x + d * 7 * s - .9 * s, cy: y - 1.1 * s, r: 1 * s, fill: '#fff' }, g); });
    if (mouth) el('path', { d: `M${x - 4 * s},${y + 5 * s} Q${x},${y + 9 * s} ${x + 4 * s},${y + 5 * s}`, stroke: INK, 'stroke-width': 1.8 * s, fill: 'none', 'stroke-linecap': 'round' }, g);
    [-1, 1].forEach(d => el('ellipse', { cx: x + d * 12 * s, cy: y + 5 * s, rx: 3.5 * s, ry: 2.2 * s, fill: '#ffa3b8', opacity: .8 }, g));
  };
  const flyAcross = (ctx, node, x0, y0, x1, y1, ms, lift = 60, done) =>
    ctx.tween(ms, k => node.setAttribute('transform', `translate(${(x0 + (x1 - x0) * k).toFixed(1)} ${(y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * lift + Math.sin(k * 26) * 4).toFixed(1)})`), () => { node.remove(); if (done) done(); }, k => k);
  function birdNode(p, c = '#ffd23f') {
    const b = el('g', { 'pointer-events': 'none' }, p);
    const w = tb(b, '50% 100%');
    el('path', { d: 'M-4,-2 Q-12,-20 -20,-4Z', fill: '#ffb800' }, w);
    w.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(-.6)' }], { duration: 130, iterations: 40, direction: 'alternate' });
    el('ellipse', { cx: 0, cy: 0, rx: 17, ry: 13, fill: c }, b);
    el('path', { d: 'M15,-3 L26,1 L15,5Z', fill: '#ff9a1f' }, b);
    el('circle', { cx: 8, cy: -4, r: 2.6, fill: INK }, b);
    el('ellipse', { cx: 3, cy: 3, rx: 3.5, ry: 2.2, fill: '#ffa3b8' }, b);
    return b;
  }
  function clock(R, ctx, x, y, r, rim) {
    const g = el('g', { transform: `translate(${x} ${y})`, style: 'cursor:pointer' }, R.g);
    const body = tb(g);
    el('circle', { r: r + 6, fill: rim, filter: 'url(#soft)' }, body);
    el('circle', { r, fill: '#fffdf7' }, body);
    for (let i = 0; i < 12; i += 3) { const a = i / 12 * Math.PI * 2; el('circle', { cx: Math.sin(a) * r * .78, cy: -Math.cos(a) * r * .78, r: 2.6, fill: rim }, body); }
    el('path', { d: `M0,0 L0,${-r * .5}`, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round', transform: 'rotate(-60)' }, body);
    el('path', { d: `M0,0 L0,${-r * .72}`, stroke: INK, 'stroke-width': 3, 'stroke-linecap': 'round', transform: 'rotate(40)' }, body);
    const sec = el('path', { d: `M0,4 L0,${-r * .8}`, stroke: '#ff7a8a', 'stroke-width': 2, 'stroke-linecap': 'round' }, body);
    el('circle', { r: 3.5, fill: '#ff7a8a' }, body);
    hl(body, -r * .4, -r * .45, r * .3, r * .16, -35, .5);
    let s = Math.floor(rand(0, 60));
    R.ticks.push(() => { s++; sec.setAttribute('transform', `rotate(${s * 6})`); body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'rotate(0deg)' }], { duration: 160 }); });
    g.addEventListener('pointerdown', e => {
      e.stopPropagation(); squash(body);
      const b = birdNode(R.fx, '#ff9ec4');
      A.chirp(); ctx.after(380, () => A.chirp());
      ctx.tween(900, k => b.setAttribute('transform', `translate(${x} ${(y - r - 4 - Math.sin(k * Math.PI) * 34).toFixed(1)}) scale(${(Math.sin(k * Math.PI) * 1.1).toFixed(2)})`), () => b.remove(), k => k);
    });
  }
  function spark4(p, x, y, r, c, delay = 0) {
    const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})`, 'pointer-events': 'none' }, p);
    const s = el('path', { d: `M0,${-r} Q${r * .15},${-r * .15} ${r},0 Q${r * .15},${r * .15} 0,${r} Q${-r * .15},${r * .15} ${-r},0 Q${-r * .15},${-r * .15} 0,${-r}Z`, fill: c, class: 'tb' }, g);
    s.animate([{ transform: 'scale(0) rotate(0deg)' }, { transform: 'scale(1.2) rotate(45deg)', offset: .4 }, { transform: 'scale(0) rotate(90deg)' }], { duration: 700, delay, fill: 'backwards' }).onfinish = () => g.remove();
  }

  /* ---------------------------------------------------------
     rooms: each builds its picture and exactly five hiding spots.
     spot: hx/hy/hs = hidden place, px/py = where ぽわん peeks to,
     eye = which eye shows when peeking, open/close/crack/empty.
     --------------------------------------------------------- */
  const ROOMS = {
    bedroom(R, ctx) {
      const g = R.g;
      el('rect', { x: -800, y: -900, width: 2000, height: 1352, fill: '#ffe6cc' }, g);
      el('rect', { x: -800, y: -900, width: 2000, height: 1352, fill: 'url(#peek-dots)' }, g);
      el('rect', { x: -800, y: 452, width: 2000, height: 1300, fill: '#f0bb86' }, g);
      [496, 556, 636, 740].forEach(y => el('rect', { x: -800, y, width: 2000, height: 3, fill: '#e3a870' }, g));
      el('rect', { x: -800, y: 440, width: 2000, height: 16, fill: '#fff3e3' }, g);
      el('ellipse', { cx: 236, cy: 716, rx: 170, ry: 36, fill: '#ffb3c1', opacity: .6 }, g);
      el('ellipse', { cx: 236, cy: 716, rx: 128, ry: 24, fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: .55, 'stroke-dasharray': '2 10', 'stroke-linecap': 'round' }, g);
      clock(R, ctx, 152, 50, 26, '#ff9a6b');

      /* window with curtains */
      {
        const sp = R.spot({ hx: 113, hy: 220, hs: .72, eye: 'b' });
        const b = sp.back;
        el('rect', { x: 24, y: 102, width: 178, height: 224, rx: 16, fill: '#fff', filter: 'url(#soft)' }, b);
        const clip = el('clipPath', { id: 'peek-bwin' }, b);
        el('rect', { x: 36, y: 114, width: 154, height: 200, rx: 8 }, clip);
        const sky = el('g', { 'clip-path': 'url(#peek-bwin)' }, b);
        el('rect', { x: 36, y: 114, width: 154, height: 200, fill: '#a5dcff' }, sky);
        el('circle', { cx: 158, cy: 150, r: 20, fill: '#ffe27a' }, sky);
        el('ellipse', { cx: 110, cy: 318, rx: 120, ry: 50, fill: '#9be08a' }, sky);
        el('ellipse', { cx: 170, cy: 326, rx: 70, ry: 40, fill: '#86d377' }, sky);
        const cl = el('g', {}, sky);
        [[0, 0, 14], [20, -8, 18], [42, 0, 13]].forEach(([x, y, r]) => el('circle', { cx: 60 + x, cy: 166 + y, r, fill: '#fff' }, cl));
        loopA(cl, [{ transform: 'translateX(-30px)' }, { transform: 'translateX(70px)' }], 9000);
        el('rect', { x: 110, y: 114, width: 6, height: 200, fill: '#fff' }, b);
        el('rect', { x: 36, y: 206, width: 154, height: 6, fill: '#fff' }, b);
        const f = sp.front;
        const brL = tb(f, '50% 0%'), cL = tb(brL, '0% 0%');
        const brR = tb(f, '50% 0%'), cR = tb(brR, '100% 0%');
        [[cL, 'M20,96 L118,96 Q108,210 122,332 L20,332 Z', [52, 86], 40], [cR, 'M108,96 L206,96 L206,332 L104,332 Q118,210 108,96Z', [142, 176], 186]].forEach(([c, d, folds, hx]) => {
          el('path', { d, fill: '#ff8fa3' }, c);
          folds.forEach(x => el('path', { d: `M${x},102 Q${x - 4},210 ${x + 2},326`, stroke: '#ff7590', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, c));
          el('path', { d: `M${hx - 8},106 Q${hx - 10},200 ${hx - 6},320`, stroke: '#fff', 'stroke-width': 6, opacity: .3, fill: 'none', 'stroke-linecap': 'round' }, c);
        });
        el('rect', { x: 12, y: 88, width: 202, height: 12, rx: 6, fill: '#c98f5f' }, f);
        [12, 214].forEach(x => el('circle', { cx: x, cy: 94, r: 9, fill: '#b07a4d' }, f));
        loopA(brL, [{ transform: 'skewX(0deg)' }, { transform: 'skewX(3deg)' }], 2600);
        loopA(brR, [{ transform: 'skewX(0deg)' }, { transform: 'skewX(-2.4deg)' }], 3100, 1.2);
        sp.hit(16, 88, 196, 246);
        sp.open = () => { pose(cL, 'scaleX(.2)', 420); pose(cR, 'scaleX(.2)', 420); A.sfx('whoosh2', { rate: rand(.95, 1.15), vol: .5 }) || A.whoosh(); };
        sp.close = () => { pose(cL, 'scaleX(1)', 460, 'ease-in-out'); pose(cR, 'scaleX(1)', 460, 'ease-in-out'); };
        sp.crack = on => { pose(cL, on ? 'scaleX(.7)' : 'scaleX(1)', 300); pose(cR, on ? 'scaleX(.7)' : 'scaleX(1)', 300); };
        sp.empty = fx => {
          const bd = birdNode(fx);
          A.chirp(); ctx.after(520, () => A.chirp());
          ctx.tween(1500, k => {
            const a = k * Math.PI * 2;
            bd.setAttribute('transform', `translate(${(40 + k * 150 + Math.sin(a) * 30).toFixed(1)} ${(220 - Math.sin(a) * 50).toFixed(1)}) scale(1.4)`);
          }, () => bd.remove(), k => k);
        };
      }
      /* wardrobe */
      {
        const sp = R.spot({ hx: 303, hy: 296, hs: .9, px: 294, eye: 'r' });
        const b = sp.back;
        shade(b, 304, 458, 92, 10);
        el('rect', { x: 232, y: 440, width: 18, height: 18, rx: 5, fill: '#a3714a' }, b);
        el('rect', { x: 356, y: 440, width: 18, height: 18, rx: 5, fill: '#a3714a' }, b);
        el('rect', { x: 222, y: 88, width: 164, height: 358, rx: 18, fill: '#c98f5f', filter: 'url(#soft)' }, b);
        el('rect', { x: 212, y: 78, width: 184, height: 20, rx: 9, fill: '#b07a4d' }, b);
        el('rect', { x: 236, y: 104, width: 134, height: 328, rx: 8, fill: '#7a4f35' }, b);
        el('rect', { x: 236, y: 122, width: 134, height: 5, fill: '#5a3a26' }, b);
        const clothes = tb(b, '50% 0%');
        el('path', { d: 'M248,126 L280,126 L294,234 L238,234Z', fill: '#7fdcc0' }, clothes);
        el('path', { d: 'M322,126 L356,126 L368,214 L312,214Z', fill: '#ffd56b' }, clothes);
        el('path', { d: 'M284,126 L318,126 L326,196 L280,196Z', fill: '#c9a7ff' }, clothes);
        const f = sp.front;
        const dl = tb(f, '0% 50%'), dr = tb(f, '100% 50%');
        [[dl, 236, 294], [dr, 303, 312]].forEach(([d, x, kx]) => {
          el('rect', { x, y: 104, width: 67, height: 328, rx: 8, fill: '#e8b07c' }, d);
          el('rect', { x: x + 10, y: 120, width: 47, height: 128, rx: 8, fill: 'none', stroke: '#d0955f', 'stroke-width': 4 }, d);
          el('rect', { x: x + 10, y: 264, width: 47, height: 152, rx: 8, fill: 'none', stroke: '#d0955f', 'stroke-width': 4 }, d);
          el('circle', { cx: kx, cy: 256, r: 7, fill: '#ffd56b' }, d);
          hl(d, x + 22, 150, 9, 28, 0, .25);
        });
        sp.hit(214, 78, 182, 380);
        sp.open = () => { pose(dl, 'scaleX(.1)', 420); pose(dr, 'scaleX(.1)', 420); A.sfx('creak', { rate: rand(1, 1.25), vol: .55 }); clothes.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0deg)' }], { duration: 900 }); };
        sp.close = () => { pose(dl, 'scaleX(1)', 420, 'ease-in-out'); pose(dr, 'scaleX(1)', 420, 'ease-in-out'); ctx.after(400, () => A.click()); };
        sp.crack = on => pose(dr, on ? 'scaleX(.68)' : 'scaleX(1)', 300);
        sp.empty = () => {
          const cat = makeAnimal('cat', sp.slot, 303, 330, .01);
          A.animal('cat') || A.meow();
          ctx.tween(420, k => cat.place(303, 330 - k * 20, .9 * k + .01), () => cat.sing(600), easeBack);
          ctx.after(1250, () => ctx.tween(300, k => cat.place(303, 310 + k * 30, .9 * (1 - k) + .01), () => cat.outer.remove(), easeIn));
        };
      }
      /* bed with a blanket */
      {
        const sp = R.spot({ hx: 162, hy: 512, hs: .58, px: 180, py: 456, eye: 'b' });
        const b = sp.back;
        shade(b, 128, 618, 118, 10);
        el('rect', { x: 10, y: 392, width: 34, height: 226, rx: 14, fill: '#b07a4d' }, b);
        el('rect', { x: 18, y: 420, width: 58, height: 128, rx: 22, fill: '#c98f5f' }, b);
        el('rect', { x: 38, y: 496, width: 204, height: 46, rx: 14, fill: '#fff' }, b);
        el('ellipse', { cx: 82, cy: 490, rx: 36, ry: 19, fill: '#fff', stroke: '#efe4da', 'stroke-width': 3 }, b);
        const f = sp.front;
        el('rect', { x: 14, y: 538, width: 236, height: 54, rx: 16, fill: '#c98f5f', filter: 'url(#soft)' }, f);
        hl(f, 60, 550, 26, 6, 0, .3);
        el('rect', { x: 26, y: 588, width: 18, height: 30, rx: 6, fill: '#a3714a' }, f);
        el('rect', { x: 222, y: 588, width: 18, height: 30, rx: 6, fill: '#a3714a' }, f);
        const bl = tb(f, '0% 100%');
        el('path', { d: 'M92,474 Q160,430 220,462 Q252,482 252,550 L92,550 Q78,506 92,474Z', fill: '#7fb8ff' }, bl);
        el('path', { d: 'M108,470 Q160,444 206,462', stroke: '#fff', 'stroke-width': 7, opacity: .35, fill: 'none', 'stroke-linecap': 'round' }, bl);
        [[124, 494], [170, 480], [214, 498], [136, 526], [192, 522], [232, 532]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 5, fill: '#fff', opacity: .75 }, bl));
        sp.hit(10, 400, 244, 220);
        sp.open = () => { pose(bl, 'translate(64px,-96px) rotate(16deg)', 420); A.sfx('whoosh', { rate: rand(.9, 1.1), vol: .5 }) || A.whoosh(); };
        sp.close = () => pose(bl, 'translate(0px,0px) rotate(0deg)', 460, 'ease-in-out');
        sp.crack = on => pose(bl, on ? 'translate(4px,-6px) rotate(2deg)' : 'translate(0px,0px) rotate(0deg)', 300);
        sp.empty = fx => {
          const bear = makeAnimal('bear', sp.slot, 162, 506, .01);
          bear.sleep(true);
          ctx.tween(380, k => bear.place(162, 506, .56 * k + .01), null, easeBack);
          A.sfx('snore', { vol: .7 }) || A.yawn();
          ['z', 'Z', 'z'].forEach((z, i) => {
            const t = el('text', { x: 196 + i * 12, y: 470 - i * 14, 'font-size': 20 + i * 6, fill: '#8fb8ff', 'font-weight': 700 }, fx);
            t.textContent = z;
            t.animate([{ opacity: 0, transform: 'translate(0px,0px)' }, { opacity: 1, offset: .3 }, { opacity: 0, transform: 'translate(14px,-40px)' }], { duration: 1300, delay: i * 200, fill: 'backwards' }).onfinish = () => t.remove();
          });
          ctx.after(1150, () => { bear.sleep(false); bear.sing(400); A.boing(); });
          ctx.after(1500, () => ctx.tween(260, k => bear.place(162, 506, .56 * (1 - k) + .01), () => bear.outer.remove()));
        };
      }
      /* toy box */
      {
        const sp = R.spot({ hx: 320, hy: 630, hs: .64, py: 566, eye: 'b' });
        const b = sp.back;
        shade(b, 320, 696, 76, 10);
        el('rect', { x: 254, y: 548, width: 132, height: 30, fill: '#2f7fc4' }, b);
        const f = sp.front;
        el('rect', { x: 248, y: 568, width: 144, height: 124, rx: 18, fill: '#6fc3ff', filter: 'url(#soft)' }, f);
        el('rect', { x: 248, y: 612, width: 144, height: 18, fill: '#ffd56b' }, f);
        hl(f, 276, 588, 18, 8, -20, .4);
        el('path', { d: 'M290,646 l6,-13 l6,13 l-13,-8 h14z', fill: '#fff' }, f);
        el('circle', { cx: 354, cy: 656, r: 9, fill: '#ff8fa3' }, f);
        el('rect', { x: 316, y: 642, width: 16, height: 16, rx: 4, fill: '#9be08a', transform: 'rotate(15 324 650)' }, f);
        const lid = tb(f, '0% 100%');
        el('rect', { x: 242, y: 542, width: 156, height: 30, rx: 12, fill: '#4aa8ee' }, lid);
        hl(lid, 280, 551, 22, 4, 0, .45);
        sp.hit(240, 530, 160, 166);
        sp.open = () => { pose(lid, 'rotate(-104deg)', 420); A.sfx('pop2', { rate: rand(.8, 1) }) || A.pop(); };
        sp.close = () => { pose(lid, 'rotate(0deg)', 380, 'ease-in'); ctx.after(370, () => A.click()); };
        sp.crack = on => pose(lid, on ? 'rotate(-26deg)' : 'rotate(0deg)', 300);
        sp.empty = () => {
          // a jack-in-the-box
          const j = el('g', {}, sp.slot);
          const spr = el('path', { d: 'M0,0 l-14,-8 l28,-10 l-28,-10 l28,-10 l-28,-10 l14,-8', stroke: '#c9a7ff', 'stroke-width': 5, fill: 'none', 'stroke-linejoin': 'round' }, j);
          const hd = el('g', {}, j);
          el('path', { d: 'M-20,-6 L0,-40 L20,-6Z', fill: '#ff7a8a' }, hd);
          el('circle', { cx: 0, cy: -42, r: 6, fill: '#ffd56b' }, hd);
          el('circle', { cx: 0, cy: 10, r: 24, fill: '#fff4e8' }, hd);
          face(hd, 0, 6, 1.4, false);
          el('circle', { cx: 0, cy: 14, r: 6, fill: '#ff5d72' }, hd);
          el('path', { d: 'M-8,22 Q0,28 8,22', stroke: INK, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, hd);
          A.sfx('spring', { rate: rand(.95, 1.1) }) || A.boing();
          ctx.after(250, () => A.giggle());
          ctx.tween(1400, k => {
            const up = k < .2 ? easeBack(k / .2) : k > .8 ? 1 - easeIn((k - .8) / .2) : 1 + Math.sin((k - .2) * 30) * .12 * (1 - k);
            spr.setAttribute('transform', `scale(1 ${(.2 + up * 1.4).toFixed(2)})`);
            hd.setAttribute('transform', `translate(0 ${(-(10 + up * 80)).toFixed(1)}) rotate(${(Math.sin(k * 20) * 10 * (1 - k)).toFixed(1)})`);
            j.setAttribute('transform', `translate(320 640)`);
          }, () => j.remove(), k => k);
        };
      }
      /* big plant */
      {
        const sp = R.spot({ hx: 104, hy: 654, hs: .62, px: 156, py: 626, eye: 'r' });
        const b = sp.back;
        shade(b, 104, 752, 56, 8);
        const f = sp.front;
        const sw = tb(f, '50% 100%');
        const lv = tb(sw, '50% 100%');
        [[104, 600, 40, 60, 0, '#58c27a'], [62, 640, 38, 50, -38, '#4fb26f'], [148, 640, 38, 50, 38, '#4fb26f'],
         [104, 566, 30, 40, 0, '#6fd38f'], [70, 690, 36, 24, -16, '#6fd38f'], [140, 690, 36, 24, 16, '#6fd38f'],
         [84, 640, 30, 46, -14, '#62c884'], [126, 640, 30, 46, 14, '#62c884']]
          .forEach(([x, y, rx, ry, r, c]) => { el('ellipse', { cx: x, cy: y, rx, ry, fill: c, transform: `rotate(${r} ${x} ${y})` }, lv); });
        hl(lv, 92, 580, 10, 22, -10, .3);
        el('path', { d: 'M104,560 L104,700 M68,628 Q90,670 102,700 M140,628 Q118,670 106,700', stroke: '#3f9a5c', 'stroke-width': 3, fill: 'none', opacity: .5 }, lv);
        el('rect', { x: 50, y: 694, width: 108, height: 20, rx: 8, fill: '#ff8a55' }, f);
        el('path', { d: 'M58,712 L150,712 L140,754 L68,754Z', fill: '#ff9a6b', filter: 'url(#soft)' }, f);
        hl(f, 76, 724, 8, 14, 0, .3);
        loopA(sw, [{ transform: 'rotate(-2.2deg)' }, { transform: 'rotate(2.2deg)' }], 2400);
        sp.hit(30, 560, 150, 196);
        sp.open = () => { lv.animate([{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(-9deg) scale(1.08,.92)' }, { transform: 'rotate(7deg) scale(.95,1.05)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0deg)' }], { duration: 620 }); rustle(); };
        sp.close = () => {};
        sp.crack = on => { if (on) { lv.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' }], { duration: 400 }); rustle(); } };
        sp.empty = fx => {
          const bf = el('g', {}, fx);
          [-1, 1].forEach(d => {
            const w = el('ellipse', { cx: d * 10, cy: 0, rx: 11, ry: 14, fill: d < 0 ? '#c9a7ff' : '#ff9ec4', class: 'tb' }, bf);
            w.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.25)' }], { duration: 150, iterations: 14, direction: 'alternate' });
          });
          el('rect', { x: -2.5, y: -11, width: 5, height: 22, rx: 2.5, fill: INK }, bf);
          A.twinkle();
          ctx.tween(2000, k => bf.setAttribute('transform', `translate(${(104 + Math.sin(k * 9) * 70).toFixed(1)} ${(600 - k * 520).toFixed(1)})`), () => bf.remove(), k => k);
        };
      }
      R.bgTap = (x, y) => {
        const h = el('path', { d: 'M0,4 C-10,-6 -6,-14 0,-8 C6,-14 10,-6 0,4Z', fill: pick(['#ff9ec4', '#ffd56b', '#c9a7ff']), 'pointer-events': 'none', transform: `translate(${x} ${y})` }, R.fx);
        A.sfx('blink', { rate: rand(.9, 1.3), vol: .5 }) || A.click();
        ctx.tween(1200, k => { h.setAttribute('transform', `translate(${(x + Math.sin(k * 8) * 8).toFixed(1)} ${(y - k * 70).toFixed(1)}) scale(${(1 + k * .8).toFixed(2)})`); h.setAttribute('opacity', (1 - k).toFixed(2)); }, () => h.remove(), k => k);
      };
    },

    kitchen(R, ctx) {
      const g = R.g;
      el('rect', { x: -800, y: -900, width: 2000, height: 1372, fill: '#e3f6ee' }, g);
      el('rect', { x: -800, y: -900, width: 2000, height: 1372, fill: 'url(#peek-tiles)' }, g);
      el('rect', { x: -800, y: 470, width: 2000, height: 1300, fill: 'url(#peek-check)' }, g);
      el('rect', { x: -800, y: 462, width: 2000, height: 14, fill: '#fff' }, g);
      clock(R, ctx, 318, 50, 24, '#7fdcc0');
      /* window with a little café curtain and herbs (ambient) */
      {
        const w = el('g', {}, g);
        el('rect', { x: 102, y: 56, width: 124, height: 104, rx: 12, fill: '#fff', filter: 'url(#soft)' }, w);
        el('rect', { x: 112, y: 66, width: 104, height: 84, rx: 6, fill: '#bfe8ff' }, w);
        el('circle', { cx: 192, cy: 88, r: 12, fill: '#ffe27a' }, w);
        const wc = el('g', {}, w);
        [[0, 0, 9], [12, -5, 11], [24, 0, 8]].forEach(([x, y, r]) => el('circle', { cx: 126 + x, cy: 92 + y, r, fill: '#fff' }, wc));
        loopA(wc, [{ transform: 'translateX(0px)' }, { transform: 'translateX(40px)' }], 7000);
        el('rect', { x: 162, y: 66, width: 4, height: 84, fill: '#fff' }, w);
        el('rect', { x: 98, y: 104, width: 132, height: 6, rx: 3, fill: '#c98f5f' }, w);
        const cur = tb(w, '50% 0%');
        let d = 'M104,108 L224,108 L224,144';
        for (let x = 224; x > 104; x -= 20) d += ` Q${x - 10},156 ${x - 20},144`;
        el('path', { d: d + 'Z', fill: '#ffd56b' }, cur);
        [124, 154, 184, 210].forEach(x => el('circle', { cx: x, cy: 126, r: 4, fill: '#fff', opacity: .8 }, cur));
        loopA(cur, [{ transform: 'skewX(-4deg)' }, { transform: 'skewX(4deg)' }], 2200);
        el('rect', { x: 96, y: 158, width: 136, height: 10, rx: 5, fill: '#fff' }, w);
        const herb = el('g', { transform: 'translate(212 158)' }, w);
        const hs = tb(herb, '50% 100%');
        [[-8, -22, -20], [0, -28, 0], [8, -22, 20]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: 6, ry: 13, fill: '#58c27a', transform: `rotate(${r} ${x} ${y})` }, hs));
        el('path', { d: 'M-10,-10 L10,-10 L7,0 L-7,0Z', fill: '#ff9a6b' }, herb);
        loopA(hs, [{ transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }], 1900);
      }
      /* counter */
      el('rect', { x: -800, y: 300, width: 1046, height: 20, rx: 6, fill: '#f6f1ea' }, g);
      el('rect', { x: -800, y: 316, width: 1040, height: 154, fill: '#ffb38a' }, g);
      el('ellipse', { cx: 177, cy: 302, rx: 50, ry: 6, fill: '#5a4a6a', opacity: .5 }, g);

      /* cookie jar */
      {
        const sp = R.spot({ hx: 58, hy: 266, hs: .48, py: 220, eye: 'b' });
        const f = sp.front;
        el('path', { d: 'M22,214 Q12,214 12,234 L14,284 Q16,300 36,300 L80,300 Q100,300 102,284 L104,234 Q104,214 94,214Z', fill: '#ff9ec4', filter: 'url(#soft)' }, f);
        [[34, 240], [80, 238], [56, 286], [30, 278], [86, 280]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4.5, fill: '#fff', opacity: .7 }, f));
        el('path', { d: 'M58,272 C46,262 50,250 58,257 C66,250 70,262 58,272Z', fill: '#ff5d8a' }, f);
        hl(f, 30, 232, 8, 14, -10, .4);
        const lid = tb(f, '50% 100%');
        el('rect', { x: 16, y: 196, width: 84, height: 22, rx: 9, fill: '#c9a7ff' }, lid);
        el('circle', { cx: 58, cy: 192, r: 9, fill: '#b48ff0' }, lid);
        sp.hit(8, 176, 100, 128);
        sp.open = () => { pose(lid, 'translate(-4px,-84px) rotate(-200deg)', 460); A.sfx('pop', { rate: rand(.85, 1.1) }) || A.pop(); };
        sp.close = () => { pose(lid, 'translate(0px,0px) rotate(0deg)', 400, 'ease-in'); ctx.after(390, () => A.click()); };
        sp.crack = on => pose(lid, on ? 'translate(0px,-26px) rotate(10deg)' : 'translate(0px,0px) rotate(0deg)', 300);
        sp.empty = fx => {
          [-1, 0, 1].forEach((d, i) => {
            const c = el('g', {}, fx);
            el('circle', { r: 16, fill: '#e8a85c' }, c);
            [[-6, -5], [6, -2], [-2, 7], [8, 8]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.6, fill: '#7a4f35' }, c));
            if (i === 1) face(c, 0, -1, .9);
            ctx.after(i * 140, () => A.sfx('pop2', { rate: rand(1.1, 1.4), vol: .6 }));
            ctx.tween(1100, k => c.setAttribute('transform', `translate(${(58 + d * 46 * k).toFixed(1)} ${(250 - Math.sin(k * Math.PI) * 90).toFixed(1)}) rotate(${(k * 360 * d).toFixed(0)})`),
              () => { if (i === 1) { A.sfx('crunch', { vol: .8 }); ctx.sparkle(58, 250, 4, 24, '#e8a85c'); } c.remove(); }, k => k);
          });
        };
      }
      /* pot on the stove */
      {
        const sp = R.spot({ hx: 177, hy: 266, hs: .5, py: 224, eye: 'b' });
        const f = sp.front;
        [[118, 248], [236, 248]].forEach(([x, y]) => el('rect', { x: x - 10, y: y - 6, width: 20, height: 12, rx: 6, fill: '#6f9ee8' }, f));
        el('path', { d: 'M126,226 L228,226 L226,284 Q224,300 206,300 L148,300 Q130,300 128,284Z', fill: '#8fb8ff', filter: 'url(#soft)' }, f);
        hl(f, 146, 246, 8, 16, -6, .45);
        el('rect', { x: 126, y: 262, width: 102, height: 8, fill: '#ffd56b', opacity: .8 }, f);
        const lid = tb(f, '50% 100%');
        el('ellipse', { cx: 177, cy: 224, rx: 58, ry: 11, fill: '#a8c8ff' }, lid);
        el('rect', { x: 166, y: 204, width: 22, height: 14, rx: 7, fill: '#6f9ee8' }, lid);
        // steam wisps
        [150, 178, 204].forEach((x, i) => {
          const s = el('path', { d: `M${x},198 q-6,-9 0,-18 q6,-9 0,-18`, stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: 0, 'pointer-events': 'none' }, f);
          s.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: .8, offset: .4 }, { opacity: 0, transform: 'translateY(-14px)' }], { duration: 2400, iterations: Infinity, delay: i * 700 });
        });
        sp.hit(110, 180, 136, 124);
        sp.open = () => { pose(lid, 'translate(0px,-96px) rotate(-24deg)', 420); A.sfx('pop2', { rate: rand(.7, .9) }) || A.pop(); };
        sp.close = () => { pose(lid, 'translate(0px,0px) rotate(0deg)', 360, 'ease-in'); ctx.after(350, () => A.sfx('blink', { rate: .7, vol: .6 }) || A.click()); };
        sp.crack = on => pose(lid, on ? 'translate(0px,-30px) rotate(-8deg)' : 'translate(0px,0px) rotate(0deg)', 300);
        sp.empty = fx => {
          // popcorn!
          for (let i = 0; i < 9; i++) {
            const p = el('g', {}, fx);
            [[0, 0, 7], [6, -4, 6], [-5, -5, 6], [2, 5, 5]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: i % 3 ? '#fffaf0' : '#ffe9a8' }, p));
            const vx = rand(-140, 140), vy = rand(-460, -300);
            ctx.after(i * 70, () => A.sfx(pick(['pop', 'pop2']), { rate: rand(1.1, 1.6), vol: .45 }));
            let x = 177, y = 226, vy2 = vy, life = 0;
            const stop = ctx.loop(dt => {
              life += dt; if (life < i * .07) return;
              vy2 += 900 * dt; x += vx * dt; y += vy2 * dt;
              p.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(life * 400).toFixed(0)})`);
              if (y > 300 && vy2 > 0) { stop(); p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => p.remove(); }
            });
          }
        };
      }
      /* lower cupboard */
      {
        const sp = R.spot({ hx: 123, hy: 400, hs: .74, px: 116, eye: 'l' });
        const b = sp.back;
        el('rect', { x: 12, y: 330, width: 222, height: 130, rx: 10, fill: '#c9805a' }, b);
        el('rect', { x: 12, y: 392, width: 222, height: 5, fill: '#b06c48' }, b);
        el('ellipse', { cx: 52, cy: 380, rx: 26, ry: 10, fill: '#8a90a8' }, b);
        el('rect', { x: 170, y: 404, width: 40, height: 44, rx: 8, fill: '#ffe08a' }, b);
        const f = sp.front;
        const dl = tb(f, '0% 50%'), dr = tb(f, '100% 50%');
        [[dl, 12, 106], [dr, 124, 140]].forEach(([d, x, kx]) => {
          el('rect', { x, y: 330, width: 110, height: 130, rx: 10, fill: '#ffc9a0' }, d);
          el('rect', { x: x + 12, y: 342, width: 86, height: 106, rx: 10, fill: 'none', stroke: '#ffb080', 'stroke-width': 4 }, d);
          el('rect', { x: kx - 3, y: 370, width: 6, height: 40, rx: 3, fill: '#fff' }, d);
          hl(d, x + 30, 358, 14, 5, 0, .35);
        });
        sp.hit(8, 322, 232, 146);
        sp.open = () => { pose(dl, 'scaleX(.1)', 420); pose(dr, 'scaleX(.1)', 420); A.sfx('creak', { rate: rand(1.25, 1.5), vol: .5 }); };
        sp.close = () => { pose(dl, 'scaleX(1)', 400, 'ease-in-out'); pose(dr, 'scaleX(1)', 400, 'ease-in-out'); ctx.after(390, () => A.click()); };
        sp.crack = on => pose(dl, on ? 'scaleX(.68)' : 'scaleX(1)', 300);
        sp.empty = fx => {
          [0, 1, 2].forEach(i => {
            const o = el('g', {}, fx);
            const ob = el('g', {}, o);
            el('circle', { r: 20, fill: '#ffa53c' }, ob);
            el('ellipse', { cx: -7, cy: -8, rx: 6, ry: 4, fill: '#fff', opacity: .4 }, ob);
            el('ellipse', { cx: 0, cy: -20, rx: 6, ry: 3, fill: '#58c27a' }, ob);
            if (i === 0) face(o, 0, 2, 1);
            const dir = i === 1 ? -1 : 1, dist = rand(120, 200);
            ctx.after(i * 200, () => A.sfx('boing2', { rate: rand(1.1, 1.4), vol: .5 }) || A.boing());
            ctx.tween(1400, k => {
              const kk = clamp(k * 1.4 - i * .15, 0, 1);
              const bounce = Math.abs(Math.sin(kk * Math.PI * 2.5)) * 40 * (1 - kk);
              o.setAttribute('transform', `translate(${(123 + dir * dist * kk).toFixed(1)} ${(440 + kk * 80 - bounce).toFixed(1)})`);
              ob.setAttribute('transform', `rotate(${(kk * 400 * dir).toFixed(0)})`);
              o.setAttribute('opacity', clamp(3 - k * 3, 0, 1).toFixed(2));
            }, () => o.remove(), k => k);
          });
        };
      }
      /* fridge */
      {
        const sp = R.spot({ hx: 318, hy: 340, hs: .86, px: 290, eye: 'l' });
        const b = sp.back;
        shade(b, 320, 474, 78, 9);
        el('rect', { x: 248, y: 94, width: 144, height: 376, rx: 22, fill: '#f4fbff', filter: 'url(#soft)' }, b);
        el('rect', { x: 258, y: 210, width: 124, height: 252, rx: 10, fill: '#dff3ff' }, b);
        [270, 330, 400].forEach(y => el('rect', { x: 258, y, width: 124, height: 5, fill: '#bfe2f6' }, b));
        el('rect', { x: 268, y: 232, width: 18, height: 38, rx: 6, fill: '#fff' }, b);
        el('circle', { cx: 360, cy: 318, r: 11, fill: '#ff7a8a' }, b);
        el('rect', { x: 256, y: 104, width: 128, height: 96, rx: 12, fill: '#e8f5ff' }, b);
        el('rect', { x: 266, y: 128, width: 8, height: 46, rx: 4, fill: '#b9d8ee' }, b);
        el('circle', { cx: 340, cy: 140, r: 10, fill: '#ffd56b' }, b);
        el('circle', { cx: 316, cy: 156, r: 8, fill: '#ff9ec4' }, b);
        hl(b, 290, 120, 20, 7, 0, .5);
        const f = sp.front;
        const door = tb(f, '100% 50%');
        el('rect', { x: 256, y: 206, width: 128, height: 258, rx: 12, fill: '#eaf6ff' }, door);
        el('rect', { x: 266, y: 226, width: 8, height: 70, rx: 4, fill: '#b9d8ee' }, door);
        hl(door, 296, 240, 16, 36, 0, .55);
        el('circle', { cx: 340, cy: 260, r: 9, fill: '#7fdcc0' }, door);
        el('rect', { x: 320, y: 300, width: 34, height: 26, rx: 4, fill: '#fff', transform: 'rotate(-6 337 313)' }, door);
        sp.hit(244, 94, 152, 382);
        sp.open = () => { pose(door, 'scaleX(.1)', 440); A.sfx('creak', { rate: rand(1.4, 1.6), vol: .4 }); A.noise({ type: 'lowpass', from: 900, dur: .5, vol: .06 }); };
        sp.close = () => { pose(door, 'scaleX(1)', 420, 'ease-in-out'); ctx.after(410, () => A.sfx('blink', { rate: .6, vol: .7 }) || A.click()); };
        sp.crack = on => pose(door, on ? 'scaleX(.74)' : 'scaleX(1)', 300);
        sp.empty = fx => {
          // a wobbly pudding slides out
          const p = el('g', {}, fx);
          el('ellipse', { cx: 0, cy: 6, rx: 40, ry: 8, fill: '#fff' }, p);
          const pb = tb(p, '50% 100%');
          el('path', { d: 'M-26,4 L-18,-34 Q0,-42 18,-34 L26,4Z', fill: '#ffd56b' }, pb);
          el('path', { d: 'M-18,-34 Q0,-42 18,-34 Q20,-26 12,-28 Q8,-20 2,-28 Q-6,-22 -10,-28 Q-18,-24 -18,-34Z', fill: '#a8642e' }, pb);
          face(pb, 0, -12, 1);
          p.setAttribute('transform', 'translate(320 336)');
          A.sfx('boing2', { rate: .8, vol: .6 }) || A.boing();
          pb.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.3,.7)', offset: .3 }, { transform: 'scale(.85,1.2)', offset: .5 }, { transform: 'scale(1.1,.9)', offset: .65 }, { transform: 'scale(.95,1.05)', offset: .8 }, { transform: 'scale(1)' }], { duration: 1100 });
          ctx.after(1500, () => p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250 }).onfinish = () => p.remove());
        };
      }
      /* table with a cloth */
      {
        const sp = R.spot({ hx: 200, hy: 654, hs: .95, px: 68, py: 664, eye: 'l' });
        const b = sp.back;
        shade(b, 200, 732, 156, 10, .16);
        const f = sp.front;
        const cloth = tb(f, '50% 0%');
        let d = 'M50,560 L350,560 L350,716';
        for (let x = 350; x > 50; x -= 30) d += ` Q${x - 15},736 ${x - 30},716`;
        el('path', { d: d + 'Z', fill: '#ff8fa3', filter: 'url(#soft)' }, cloth);
        for (let x = 80; x < 340; x += 50) el('rect', { x: x - 8, y: 570, width: 16, height: 150, fill: '#fff', opacity: .22 }, cloth);
        el('rect', { x: 50, y: 610, width: 300, height: 16, fill: '#fff', opacity: .22 }, cloth);
        el('rect', { x: 50, y: 670, width: 300, height: 16, fill: '#fff', opacity: .22 }, cloth);
        el('rect', { x: 40, y: 540, width: 320, height: 26, rx: 13, fill: '#ffa7b8' }, f);
        hl(f, 110, 548, 40, 5, 0, .4);
        // fruit bowl and teapot on top
        el('path', { d: 'M110,540 Q110,512 150,512 Q190,512 190,540Z', fill: '#7fdcc0' }, f);
        [[132, 506, '#ff7a8a'], [152, 500, '#ffd56b'], [170, 508, '#9be08a']].forEach(([x, y, c]) => el('circle', { cx: x, cy: y, r: 13, fill: c }, f));
        el('ellipse', { cx: 276, cy: 520, rx: 34, ry: 26, fill: '#c9a7ff' }, f);
        el('path', { d: 'M308,512 Q326,500 330,486', stroke: '#c9a7ff', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, f);
        el('path', { d: 'M244,506 Q226,516 244,532', stroke: '#b48ff0', 'stroke-width': 6, fill: 'none' }, f);
        el('circle', { cx: 276, cy: 492, r: 7, fill: '#b48ff0' }, f);
        hl(f, 264, 508, 9, 5, -20, .45);
        sp.hit(36, 480, 328, 262);
        sp.open = () => { pose(cloth, 'scaleY(.18)', 460); A.sfx('whoosh2', { rate: rand(.85, 1), vol: .5 }) || A.whoosh(); };
        sp.close = () => pose(cloth, 'scaleY(1)', 480, 'ease-in-out');
        sp.crack = on => pose(cloth, on ? 'skewX(-3deg)' : 'scaleY(1)', 300);
        sp.empty = () => {
          const dog = makeAnimal('dog', sp.slot, 200, 664, .01);
          A.animal('dog') || A.voice('dog', 400);
          ctx.after(600, () => A.animal('dog', { rate: 1.15 }));
          ctx.tween(380, k => dog.place(200, 664, .9 * k + .01), () => { dog.sing(500); dog.mouth(true); }, easeBack);
          ctx.after(1300, () => ctx.tween(280, k => dog.place(200, 664, .9 * (1 - k) + .01), () => dog.outer.remove()));
        };
      }
      R.bgTap = (x, y) => {
        const bb = el('g', { 'pointer-events': 'none' }, R.fx);
        el('circle', { r: 13, fill: '#bfe8ff', opacity: .45, stroke: '#fff', 'stroke-width': 2.5 }, bb);
        el('ellipse', { cx: -4, cy: -5, rx: 4, ry: 2.5, fill: '#fff' }, bb);
        A.sfx('bubble', { rate: rand(.9, 1.4), vol: .5 }) || A.pop();
        ctx.tween(1500, k => { bb.setAttribute('transform', `translate(${(x + Math.sin(k * 10) * 10).toFixed(1)} ${(y - k * 120).toFixed(1)}) scale(${(.6 + k * .6).toFixed(2)})`); bb.setAttribute('opacity', (1 - k * k).toFixed(2)); }, () => bb.remove(), k => k);
      };
    },

    garden(R, ctx) {
      const g = R.g;
      el('rect', { x: -800, y: -900, width: 2000, height: 1390, fill: 'url(#peek-sky)' }, g);
      // sun
      {
        const s = el('g', { transform: 'translate(170 64)', style: 'cursor:pointer' }, g);
        const rays = tb(s);
        for (let i = 0; i < 10; i++) el('rect', { x: -4, y: -54, width: 8, height: 16, rx: 4, fill: '#ffd56b', transform: `rotate(${i * 36})` }, rays);
        rays.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 24000, iterations: Infinity });
        const sb = tb(s);
        el('circle', { r: 32, fill: '#ffe27a' }, sb);
        face(sb, 0, 0, 1.5);
        s.addEventListener('pointerdown', e => { e.stopPropagation(); squash(sb, 1.2); A.twinkle(); ctx.sparkle(170, 64, 5, 50); });
      }
      // clouds drift (far layer)
      [[60, 140, 1, 16000], [270, 60, .8, 21000], [330, 190, .7, 18000]].forEach(([x, y, s, d], i) => {
        const c = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
        const ci = el('g', {}, c);
        [[0, 0, 22], [28, -12, 28], [58, 0, 20], [28, 8, 22]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: '#fff', opacity: .92 }, ci));
        loopA(ci, [{ transform: 'translateX(-40px)' }, { transform: 'translateX(40px)' }], d, i * 4);
      });
      // hills (far, mid) and fence
      el('ellipse', { cx: 60, cy: 520, rx: 260, ry: 120, fill: '#c6eaa8' }, g);
      el('ellipse', { cx: 360, cy: 530, rx: 240, ry: 110, fill: '#b5e396' }, g);
      for (let x = -10; x < 420; x += 28) el('path', { d: `M${x},486 L${x},442 L${x + 9},432 L${x + 18},442 L${x + 18},486Z`, fill: '#fff', opacity: .9 }, g);
      el('rect', { x: -800, y: 452, width: 2000, height: 8, fill: '#fff', opacity: .9 }, g);
      el('rect', { x: -800, y: 482, width: 2000, height: 1300, fill: 'url(#peek-grass)' }, g);
      // swaying grass tufts and flowers (near layer)
      [[30, 740], [180, 700], [210, 752], [372, 752], [244, 500], [150, 490]].forEach(([x, y], i) => {
        const t = el('g', { transform: `translate(${x} ${y})` }, g);
        const ti = tb(t, '50% 100%');
        el('path', { d: 'M-10,0 Q-12,-20 -16,-26 Q-4,-14 0,0 Q2,-24 2,-32 Q8,-14 6,0 Q12,-18 18,-22 Q12,-8 12,0Z', fill: '#6cc45a' }, ti);
        if (i % 2 === 0) { [0, 72, 144, 216, 288].forEach(a => el('ellipse', { cx: 2, cy: -40, rx: 4, ry: 7, fill: PARTY[i % 6], transform: `rotate(${a} 2 -34)` }, ti)); el('circle', { cx: 2, cy: -34, r: 3.5, fill: '#ffd56b' }, ti); }
        loopA(ti, [{ transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }], 1700 + i * 230, i * .5);
      });
      // butterfly wanders
      {
        const bf = el('g', { 'pointer-events': 'none' }, g);
        [-1, 1].forEach(d => {
          const w = el('ellipse', { cx: d * 7, cy: 0, rx: 8, ry: 10, fill: d < 0 ? '#ff9ec4' : '#c9a7ff', class: 'tb' }, bf);
          w.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.25)' }], { duration: 170, iterations: Infinity, direction: 'alternate' });
        });
        el('rect', { x: -2, y: -8, width: 4, height: 16, rx: 2, fill: INK }, bf);
        R.frames.push(t => bf.setAttribute('transform', `translate(${(200 + Math.sin(t * .37) * 150).toFixed(1)} ${(300 + Math.sin(t * .9) * 60 + Math.cos(t * .23) * 70).toFixed(1)})`));
      }

      /* doghouse */
      {
        const sp = R.spot({ hx: 104, hy: 404, hs: .62, py: 440, eye: 'b' });
        const b = sp.back;
        shade(b, 104, 472, 92, 10);
        el('rect', { x: 26, y: 288, width: 158, height: 180, rx: 8, fill: '#ffd9a0', filter: 'url(#soft)' }, b);
        [318, 352, 386, 420, 454].forEach(y => el('rect', { x: 26, y, width: 158, height: 3, fill: '#f2c07c' }, b));
        el('path', { d: 'M4,302 L104,220 L206,302 Q206,314 194,314 L16,314 Q4,314 4,302Z', fill: '#ff7a8a', filter: 'url(#soft)' }, b);
        el('path', { d: 'M30,292 L104,232 L134,256', stroke: '#fff', 'stroke-width': 6, opacity: .3, fill: 'none', 'stroke-linecap': 'round' }, b);
        el('path', { d: 'M58,468 L58,380 Q58,336 104,336 Q150,336 150,380 L150,468Z', fill: '#5a3a4a' }, b);
        // bone sign
        el('path', { d: 'M84,322 L124,322', stroke: '#fff', 'stroke-width': 8, 'stroke-linecap': 'round' }, b);
        [[82, 318], [82, 326], [126, 318], [126, 326]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 5, fill: '#fff' }, b));
        const f = sp.front;
        const flap = tb(f, '50% 0%');
        el('path', { d: 'M60,466 L60,382 Q60,340 104,340 Q148,340 148,382 L148,466Z', fill: '#7fb8ff' }, flap);
        [76, 104, 132].forEach(x => el('rect', { x: x - 6, y: 344, width: 12, height: 122, fill: '#fff', opacity: .3 }, flap));
        sp.hit(4, 218, 204, 260);
        sp.open = () => { pose(flap, 'scaleY(.12)', 420); A.sfx('flip', { rate: rand(.9, 1.1) }) || A.whoosh(); };
        sp.close = () => pose(flap, 'scaleY(1)', 420, 'ease-in-out');
        sp.crack = on => pose(flap, on ? 'scaleY(.66)' : 'scaleY(1)', 300);
        sp.empty = () => {
          const dog = makeAnimal('dog', sp.slot, 104, 420, .01);
          A.animal('dog') || A.voice('dog', 420);
          ctx.tween(380, k => dog.place(104, 420, .66 * k + .01), () => { dog.sing(500); ctx.after(500, () => { A.animal('dog', { rate: 1.2 }); dog.sing(400); }); }, easeBack);
          ctx.after(1450, () => ctx.tween(280, k => dog.place(104, 420, .66 * (1 - k) + .01), () => dog.outer.remove()));
        };
      }
      /* tree */
      {
        const sp = R.spot({ hx: 320, hy: 420, hs: .52, px: 284, py: 412, eye: 'l' });
        const b = sp.back;
        shade(b, 320, 488, 70, 10);
        const f = sp.front;
        el('path', { d: 'M286,490 Q294,420 292,250 L348,250 Q346,420 356,490Z', fill: '#b07a4d' }, f);
        el('path', { d: 'M300,470 Q304,400 302,280', stroke: '#c98f5f', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, f);
        el('ellipse', { cx: 330, cy: 340, rx: 7, ry: 10, fill: '#7a4f35' }, f);
        const cw = tb(f, '50% 100%');
        const can = tb(cw, '50% 90%');
        [[266, 214, 54, '#5fbf6a'], [352, 216, 46, '#5fbf6a'], [314, 150, 68, '#6fcf6f'], [268, 162, 46, '#6fcf6f'], [350, 162, 40, '#6fcf6f'], [314, 230, 60, '#62c66c']]
          .forEach(([x, y, r, c]) => el('circle', { cx: x, cy: y, r, fill: c }, can));
        hl(can, 296, 116, 24, 12, -25, .3);
        [[278, 200], [346, 180], [312, 236], [356, 230], [296, 150]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 9, fill: '#ff7a8a' }, can); el('circle', { cx: x - 3, cy: y - 3, r: 2.5, fill: '#fff', opacity: .6 }, can); });
        loopA(cw, [{ transform: 'rotate(-1.4deg)' }, { transform: 'rotate(1.4deg)' }], 2800);
        sp.hit(212, 78, 188, 414);
        sp.open = () => { can.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-5deg) scale(1.05,.95)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0deg)' }], { duration: 640 }); rustle(); };
        sp.close = () => {};
        sp.crack = on => { if (on) { can.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(0deg)' }], { duration: 360 }); rustle(); } };
        sp.empty = fx => {
          [[278, 200], [346, 180], [356, 230]].forEach(([x, y], i) => {
            const a = el('g', {}, fx);
            el('circle', { r: 11, fill: '#ff5d72' }, a);
            el('ellipse', { cx: 3, cy: -12, rx: 5, ry: 3, fill: '#58c27a' }, a);
            const floor = 500 + i * 16;
            ctx.tween(1100, k => {
              const kk = clamp(k * 1.3 - i * .12, 0, 1);
              const yy = kk < .5 ? y + (floor - y) * easeIn(kk / .5) : floor - Math.sin((kk - .5) / .5 * Math.PI) * 30;
              a.setAttribute('transform', `translate(${(x + (kk > .5 ? (kk - .5) * 40 : 0)).toFixed(1)} ${yy.toFixed(1)})`);
              a.setAttribute('opacity', clamp(4 - k * 4, 0, 1).toFixed(2));
            }, () => a.remove(), k => k);
            ctx.after(420 + i * 120, () => A.sfx('boing2', { rate: rand(1.2, 1.5), vol: .45 }) || A.boing());
          });
          const bd = birdNode(fx, '#8fb8ff');
          A.chirp();
          flyAcross(ctx, bd, 320, 160, 470, 40, 1300, 40);
        };
      }
      /* bush */
      {
        const sp = R.spot({ hx: 106, hy: 610, hs: .72, px: 118, py: 512, eye: 'b' });
        const b = sp.back;
        shade(b, 104, 668, 98, 10);
        const f = sp.front;
        const L = tb(f, '0% 100%'), Rr = tb(f, '100% 100%');
        [[L, [[44, 616, 46], [76, 566, 50], [56, 650, 40], [110, 646, 50]]], [Rr, [[150, 574, 50], [176, 622, 42], [124, 590, 44], [160, 654, 40]]]].forEach(([grp, cs]) =>
          cs.forEach(([x, y, r], i) => el('circle', { cx: x, cy: y, r, fill: i % 2 ? '#4fae5c' : '#5fbf6a' }, grp)));
        hl(L, 66, 546, 18, 9, -25, .3);
        [[60, 600], [110, 560], [150, 620], [90, 640], [172, 590]].forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 6, fill: i % 2 ? '#ffd56b' : '#ff9ec4' }, i % 2 ? Rr : L));
        sp.hit(0, 508, 216, 166);
        sp.open = () => { pose(L, 'rotate(-14deg) translateX(-10px)', 380); pose(Rr, 'rotate(14deg) translateX(10px)', 380); rustle(); };
        sp.close = () => { pose(L, 'rotate(0deg) translateX(0px)', 420, 'ease-in-out'); pose(Rr, 'rotate(0deg) translateX(0px)', 420, 'ease-in-out'); };
        sp.crack = on => { if (on) rustle(); L.animate([{ transform: L._t || 'none' }, { transform: 'rotate(-3deg)' }, { transform: L._t || 'none' }], { duration: 400 }); };
        sp.empty = () => {
          const fr = makeAnimal('frog', sp.slot, 106, 620, .01);
          A.animal('frog') || A.voice('frog', 200);
          ctx.tween(900, k => fr.place(106 + Math.sin(k * Math.PI) * 10, 620 - Math.sin(k * Math.PI) * 70, .7 * Math.min(1, k * 4) + .01), () => { fr.sing(300); }, k => k);
          ctx.after(1350, () => ctx.tween(240, k => fr.place(106, 620, .7 * (1 - k) + .01), () => fr.outer.remove()));
        };
      }
      /* tulip */
      {
        const sp = R.spot({ hx: 248, hy: 566, hs: .46, py: 540, eye: 'b' });
        const b = sp.back;
        const st = tb(b, '50% 100%');
        el('path', { d: 'M248,600 Q244,650 250,720', stroke: '#4fae5c', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, st);
        el('path', { d: 'M250,700 Q206,690 200,640 Q236,650 250,690Z', fill: '#5fbf6a' }, st);
        el('path', { d: 'M250,690 Q290,676 296,628 Q262,642 250,680Z', fill: '#6fcf6f' }, st);
        el('path', { d: 'M212,540 Q248,500 284,540 L280,600 Q248,616 216,600Z', fill: '#ff5d8a' }, b);
        const f = sp.front;
        const pl = tb(f, '100% 100%'), pr = tb(f, '0% 100%'), pc = tb(f, '50% 100%');
        el('path', { d: 'M248,612 Q206,610 202,560 Q200,520 214,506 Q232,530 248,540Z', fill: '#ff7aa2' }, pl);
        el('path', { d: 'M248,612 Q290,610 294,560 Q296,520 282,506 Q264,530 248,540Z', fill: '#ff7aa2' }, pr);
        el('path', { d: 'M248,614 Q222,608 222,566 Q226,528 248,512 Q270,528 274,566 Q274,608 248,614Z', fill: '#ff9ec4' }, pc);
        hl(pc, 238, 548, 6, 16, 0, .4);
        [b, f].forEach(n => { n.style.transformBox = 'view-box'; n.style.transformOrigin = '248px 720px'; loopA(n, [{ transform: 'rotate(-2.5deg)' }, { transform: 'rotate(2.5deg)' }], 2100); });
        sp.hit(196, 494, 104, 230);
        sp.open = () => { pose(pl, 'rotate(-58deg)', 460); pose(pr, 'rotate(58deg)', 460); pose(pc, 'scaleY(.3)', 460); A.sfx('sparkle', { rate: rand(.9, 1.15), vol: .5 }) || A.twinkle(); };
        sp.close = () => { pose(pl, 'rotate(0deg)', 420, 'ease-in-out'); pose(pr, 'rotate(0deg)', 420, 'ease-in-out'); pose(pc, 'scaleY(1)', 420, 'ease-in-out'); };
        sp.crack = on => { pose(pl, on ? 'rotate(-16deg)' : 'rotate(0deg)', 300); pose(pr, on ? 'rotate(16deg)' : 'rotate(0deg)', 300); pose(pc, on ? 'scaleY(.8)' : 'scaleY(1)', 300); };
        sp.empty = fx => {
          const bee = el('g', {}, fx);
          [-1, 1].forEach(d => { const w = el('ellipse', { cx: d * 6, cy: -12, rx: 7, ry: 9, fill: '#fff', opacity: .85, class: 'tb' }, bee); w.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.3)' }], { duration: 60, iterations: 40, direction: 'alternate' }); });
          el('ellipse', { rx: 16, ry: 12, fill: '#ffd23f' }, bee);
          el('path', { d: 'M-4,-11 L-4,11 M5,-10 L5,10', stroke: INK, 'stroke-width': 4.5 }, bee);
          el('circle', { cx: 12, cy: -3, r: 2.4, fill: INK }, bee);
          A.osc(230, { type: 'sawtooth', lp: 900, vib: 42, vibD: .05, a: .05, hold: 1.1, r: .25, vol: .07 });
          ctx.tween(1600, k => bee.setAttribute('transform', `translate(${(248 + Math.sin(k * 14) * 50 * k).toFixed(1)} ${(540 - k * 300).toFixed(1)}) scale(1.3)`), () => bee.remove(), k => k);
        };
      }
      /* pile of leaves */
      {
        const sp = R.spot({ hx: 330, hy: 698, hs: .6, py: 642, eye: 'b' });
        const b = sp.back;
        shade(b, 330, 748, 62, 8);
        const f = sp.front;
        el('path', { d: 'M272,748 Q274,672 330,666 Q386,672 388,748Z', fill: '#e88a3a' }, f);
        const COLS = ['#ff9a4a', '#ffc94a', '#ff7a5a', '#f0b040', '#ffb35c'];
        const groups = [tb(f, '100% 100%'), tb(f, '50% 100%'), tb(f, '0% 100%')];
        const leafD = 'M0,-14 Q12,-6 0,14 Q-12,-6 0,-14Z';
        for (let i = 0; i < 26; i++) {
          const row = Math.floor(i / 8), u = (i % 8) / 7, x = 286 + u * 88 + rand(-4, 4) + (row % 2) * 6 - row * 4, y = 744 - row * 22 - Math.sin(u * Math.PI) * (40 - row * 6) + rand(-4, 4);
          const grp = groups[clamp(Math.floor((x - 282) / 34), 0, 2)];
          el('path', { d: leafD, fill: COLS[i % 5], transform: `translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(rand(-50, 50) + (u - .5) * 120).toFixed(0)}) scale(${rand(1.2, 1.6).toFixed(2)})` }, grp);
        }
        sp.hit(262, 610, 136, 146);
        sp.open = () => { pose(groups[0], 'translate(-26px,-40px) rotate(-24deg)', 380); pose(groups[1], 'translate(0px,-60px) scale(1.1)', 380); pose(groups[2], 'translate(26px,-40px) rotate(24deg)', 380); A.sfx('whoosh', { rate: rand(1.1, 1.3), vol: .45 }) || A.whoosh(); rustle(); };
        sp.close = () => groups.forEach(gg => pose(gg, 'translate(0px,0px) rotate(0deg) scale(1)', 460, 'ease-in-out'));
        sp.crack = on => { pose(groups[1], on ? 'translate(0px,-8px) scale(1)' : 'translate(0px,0px) scale(1)', 300); if (on) rustle(); };
        sp.empty = fx => {
          const bun = makeAnimal('bunny', sp.slot, 330, 698, .01);
          A.sfx('spring', { rate: rand(1.1, 1.3) }) || A.boing();
          ctx.tween(380, k => bun.place(330, 698 - k * 20, .58 * k + .01), () => bun.sing(500), easeBack);
          ctx.after(1300, () => ctx.tween(260, k => bun.place(330, 678 + k * 20, .58 * (1 - k) + .01), () => bun.outer.remove()));
          for (let i = 0; i < 6; i++) {
            const lf = el('path', { d: leafD, fill: pick(COLS) }, fx);
            const x0 = 330 + rand(-40, 40), vx = rand(-60, 60);
            ctx.tween(1500, k => lf.setAttribute('transform', `translate(${(x0 + vx * k + Math.sin(k * 10 + i) * 14).toFixed(1)} ${(640 - Math.sin(k * Math.PI) * 60 + k * 60).toFixed(1)}) rotate(${(k * 300 + i * 50).toFixed(0)})`), () => lf.remove(), k => k);
          }
        };
      }
      R.bgTap = (x, y) => {
        if (y > 480) {
          // a flower pops up where you tap the grass
          const fl = el('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})`, 'pointer-events': 'none' }, R.fx);
          const fi = tb(fl, '50% 100%');
          el('path', { d: 'M0,0 L0,-22', stroke: '#4fae5c', 'stroke-width': 4, 'stroke-linecap': 'round' }, fi);
          const c = pick(PARTY);
          [0, 72, 144, 216, 288].forEach(a => el('ellipse', { cx: 0, cy: -34, rx: 5, ry: 8, fill: c, transform: `rotate(${a} 0 -26)` }, fi));
          el('circle', { cx: 0, cy: -26, r: 4.5, fill: '#ffd56b' }, fi);
          fi.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.25,.8)', offset: .5 }, { transform: 'scale(.9,1.1)', offset: .75 }, { transform: 'scale(1)' }], { duration: 480, easing: 'ease-out' });
          A.sfx('pop2', { rate: rand(1.1, 1.5), vol: .45 }) || A.pop();
          R.flowers.push(fl);
          if (R.flowers.length > 8) { const o = R.flowers.shift(); o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => o.remove(); }
        } else {
          spark4(R.fx, x, y, 14, '#fff');
          spark4(R.fx, x + rand(-20, 20), y + rand(-20, 20), 9, '#ffd56b', 120);
          A.sfx('blink', { rate: rand(1, 1.4), vol: .5 }) || A.twinkle();
        }
      };
    }
  };
  const ORDER = ['bedroom', 'kitchen', 'garden'];

  return {
    id: 'peek', name: 'かくれんぼ', color: '#ffcf9e',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#ffe9cf' }, g);
      el('rect', { x: -80, y: 34, width: 160, height: 60, fill: '#f2c08c' }, g);
      el('rect', { x: -52, y: -56, width: 104, height: 84, rx: 8, fill: '#a5dcff' }, g);
      el('path', { d: 'M-52,-58 L-6,-58 Q-12,-10 -4,30 L-52,30Z', fill: '#ff8fa3' }, g);
      el('path', { d: 'M20,-58 L54,-58 L54,30 L16,30 Q24,-10 20,-58Z', fill: '#ff8fa3' }, g);
      el('path', { d: 'M-4,30 C-4,-6 8,-22 22,-22 C30,-22 34,-14 34,-2 L34,30Z', fill: '#fbf8ff' }, g);
      el('ellipse', { cx: 12, cy: -6, rx: 4, ry: 5, fill: '#3a2f5b' }, g);
      el('ellipse', { cx: 26, cy: -6, rx: 4, ry: 5, fill: '#3a2f5b' }, g);
      el('ellipse', { cx: 6, cy: 4, rx: 5, ry: 3, fill: '#ffb3c4' }, g);
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      // shared patterns and gradients
      const pat = el('pattern', { id: 'peek-dots', width: 44, height: 44, patternUnits: 'userSpaceOnUse' }, defs);
      el('circle', { cx: 11, cy: 11, r: 3.5, fill: '#ffd8b0' }, pat);
      el('circle', { cx: 33, cy: 33, r: 3.5, fill: '#ffd8b0' }, pat);
      const tl = el('pattern', { id: 'peek-tiles', width: 40, height: 40, patternUnits: 'userSpaceOnUse' }, defs);
      el('rect', { x: 1.5, y: 1.5, width: 37, height: 37, rx: 6, fill: 'none', stroke: '#cdeee0', 'stroke-width': 3 }, tl);
      const ck = el('pattern', { id: 'peek-check', width: 80, height: 80, patternUnits: 'userSpaceOnUse' }, defs);
      el('rect', { width: 80, height: 80, fill: '#ffe6bf' }, ck);
      el('rect', { width: 40, height: 40, fill: '#ffd59c' }, ck);
      el('rect', { x: 40, y: 40, width: 40, height: 40, fill: '#ffd59c' }, ck);
      const grad = (id, stops, rad) => {
        const gr = el(rad ? 'radialGradient' : 'linearGradient', rad ? { id, cx: '.38', cy: '.3', r: '.85' } : { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, gr));
      };
      grad('peek-sky', [[0, '#8fd3ff'], [.6, '#c8ecff'], [1, '#eefaff']]);
      grad('peek-grass', [[0, '#9be07a'], [1, '#79c65c']]);
      grad('peek-gold', [[0, '#fffbe0'], [.5, '#ffe27a'], [1, '#f5b83d']], true);

      const roomLayer = el('g', {}, svg), front = el('g', {}, svg), top = el('g', { 'pointer-events': 'none' }, svg);
      const ghost = ctx.ghost(front, { x: 200, y: 390, s: 1.15 });
      const flo = ghost.pos.children[1];
      const gPath = ghost.body.querySelector('path[fill="url(#gGhost)"]');
      const gArms = [...ghost.body.querySelectorAll('ellipse')].filter(e => e.getAttribute('fill') === '#efe8ff');
      let room = null, round = +((location.search.match(/[?&]room=(\d)/) || [])[1] || 0), // ?room=n: test hook
         hide = -1, lastSpot = -1, busy = true, peekId = 0, peeking = false, nextPeek = Infinity, sinceGold = 0, gold = false;

      function setGold(on) {
        gPath.setAttribute('fill', on ? 'url(#peek-gold)' : 'url(#gGhost)');
        gPath.setAttribute('stroke', on ? '#f5c04a' : '#d9ccff');
        gArms.forEach(a => a.setAttribute('fill', on ? '#ffe9a8' : '#efe8ff'));
      }
      function buildRoom(kind) {
        const g = el('g', {}, roomLayer);
        const R = { g, kind, spots: [], ticks: [], frames: [], flowers: [], bgTap: null };
        R.spot = o => {
          const sg = el('g', { style: 'cursor:pointer' }, g), wrap = tb(sg, '50% 100%');
          const hitG = el('g', {}, wrap);
          const sp = Object.assign({ px: o.hx, py: o.hy, eye: 'b', g: sg, wrap, back: el('g', {}, wrap), slot: el('g', {}, wrap), front: el('g', {}, wrap), busy: false }, o);
          sp.hit = (x, y, w, h) => el('rect', { x, y, width: w, height: h, fill: 'transparent' }, hitG);
          sp.crack = null;
          R.spots.push(sp);
          return sp;
        };
        ROOMS[kind](R, ctx);
        R.fx = el('g', { 'pointer-events': 'none' }, g);
        R.spots.forEach((sp, i) => sp.g.addEventListener('pointerdown', e => { e.stopPropagation(); tapSpot(i); }));
        return R;
      }
      function enterRoom(kind, done) {
        const old = room;
        room = buildRoom(kind);
        if (old) {
          A.sfx('whoosh2', { vol: .5 }) || A.whoosh();
          room.g.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' }).onfinish = () => old.g.remove();
        }
        room.spots.forEach((sp, i) => {
          sp.wrap.animate([{ transform: 'scale(.4,.2)', opacity: 0 }, { transform: 'scale(1.1,.92)', opacity: 1, offset: .6 }, { transform: 'scale(.97,1.03)', offset: .8 }, { transform: 'scale(1)' }],
            { duration: 520, delay: (old ? 250 : 0) + i * 90, easing: 'ease-out', fill: 'backwards' });
          if (old) ctx.after(250 + i * 90, () => A.sfx('pop', { rate: 1 + i * .08, vol: .35 }));
        });
        ctx.after(old ? 900 : 200, done);
      }
      function setHidden(on) {
        flo.classList.toggle('float', !on);
      }
      function startRound() {
        busy = true; hide = -1;
        gold = (round > 0 && (Math.random() < 1 / 6 || sinceGold >= 7)) || /[?&]gold\b/.test(location.search); // ?gold: test hook
        sinceGold = gold ? 0 : sinceGold + 1;
        const go = () => {
          setGold(gold);
          front.appendChild(ghost.pos); setHidden(false);
          ghost.set('happy');
          if (round > 0) {
            ghost.place(200, -120, .7);
            ghost.moveTo(200, 390, 1.15, 620, () => { ghost.hop(); ctx.sparkle(200, 380, gold ? 10 : 5, 70, gold ? '#ffd56b' : '#fff'); }, easeBack);
            A.sfx(gold ? 'jingle' : 'slide', { vol: .45, rate: gold ? 1 : 1.25 });
          }
          if (gold) ghost.glow(true);
          ctx.after(round > 0 ? 700 : 300, () => ghost.talk(gold ? 'ぴかぴか！' : 'かくれるよ〜'));
          ctx.after(round > 0 ? 2100 : 1800, hideAway);
        };
        enterRoom(ORDER[round % 3], go);
      }
      function hideAway() {
        let i; do { i = Math.floor(rand(0, room.spots.length)); } while (i === lastSpot);
        const sp = room.spots[i];
        lastSpot = i;
        if (gold) ghost.glow(false);
        sp.open(); A.whoosh();
        ghost.set('normal');
        ghost.moveTo(sp.hx, sp.hy - 34, sp.hs, 650, () => {
          sp.slot.appendChild(ghost.pos); setHidden(true);
          ghost.moveTo(sp.hx, sp.hy, sp.hs, 220, () => {
            sp.close(); hide = i; busy = false;
            nextPeek = performance.now() + rand(2400, 3400);
            ctx.after(500, () => { if (!busy) say('さがしてね！'); });
          });
        });
      }
      function glint(sp) {
        const s = sp.hs, xs = sp.eye === 'l' ? [-1] : sp.eye === 'r' ? [1] : [-1, 1];
        xs.forEach((d, i) => spark4(top, sp.px + d * 20 * s - 3 * s, sp.py - 23 * s, gold ? 12 : 9, gold ? '#ffe27a' : '#fff', i * 60));
        if (gold) ctx.sparkle(sp.px, sp.py - 20, 3, 30, '#ffd56b');
      }
      function doPeek() {
        const sp = room.spots[hide], id = ++peekId;
        peeking = true;
        if (sp.crack) sp.crack(true);
        ghost.set('normal');
        ghost.moveTo(sp.px, sp.py, sp.hs, 380, null, easeOut);
        ctx.after(380, () => {
          if (id !== peekId) return;
          glint(sp); A.giggle(); A.sfx('blink', { rate: 1.3, vol: .4 });
          ghost.body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0deg)' }], { duration: 500 });
        });
        ctx.after(1500, () => {
          if (id !== peekId) return;
          ghost.moveTo(sp.hx, sp.hy, sp.hs, 320);
          if (sp.crack) sp.crack(false);
          ctx.after(340, () => { if (id === peekId) peeking = false; });
          const idle = performance.now() - lastInput;
          nextPeek = performance.now() + (idle > 5000 ? rand(2000, 3000) : rand(3800, 6000));
        });
      }
      ctx.every(200, () => { if (!busy && !peeking && hide >= 0 && performance.now() > nextPeek) doPeek(); });
      ctx.every(1000, () => room && room.ticks.forEach(f => f()));
      ctx.loop((dt, t) => room && room.frames.forEach(f => f(t)));

      function found(sp) {
        busy = true; peekId++; peeking = false; hide = -1;
        sp.open();
        haptic(30);
        ctx.after(160, () => {
          front.appendChild(ghost.pos); setHidden(false);
          ghost.set('surprise');
          const y = clamp(sp.hy - 80, 220, 560), x = clamp(sp.hx, 110, 300);
          ghost.moveTo(x, y, 1.05, 420, null, easeBack);
          ghost.hop();
          A.tada(); ctx.confetti(x, y, 30); ctx.sparkle(x, y - 20, 7, 70, gold ? '#ffd56b' : '#fff');
          ctx.after(300, () => ghost.talk('ばあ！'));
          if (gold) { ghost.glow(true); A.sfx('jingle', { when: .3, vol: .6 }); for (let i = 0; i < 4; i++) ctx.after(200 + i * 160, () => { A.sfx('coin', { rate: 1 + i * .12, vol: .4 }); ctx.sparkle(rand(60, 340), rand(150, 600), 3, 30, '#ffd56b'); }); }
          // dance: an arc to the middle with a giggle
          ctx.after(700, () => {
            const x0 = ghost.x, y0 = ghost.y, s0 = ghost.s;
            ctx.tween(800, k => ghost.place(x0 + (200 - x0) * k, y0 + (370 - y0) * k - Math.sin(k * Math.PI) * 110, s0 + (1.25 - s0) * k), () => { ghost.hop(); ctx.confetti(200, 330, 30); }, easeInOut);
            ghost.giggle();
          });
          ctx.after(1100, () => sp.close());
          ctx.after(1700, () => { ghost.swing(40, 300); ghost.body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg) scale(1.05,.95)' }, { transform: 'rotate(12deg) scale(.95,1.05)' }, { transform: 'rotate(0deg)' }], { duration: 700 }); });
          ctx.after(1900, () => ghost.talk(gold ? 'すごーい！' : pick(['みつかっちゃった！', 'もういっかい！', 'すごーい！'])));
          ctx.after(3300, () => {
            if (gold) { ghost.glow(false); setGold(false); }
            ghost.set('happy'); A.whoosh();
            ghost.moveTo(200, -160, .6, 500, () => { round++; startRound(); }, easeIn);
          });
        });
      }
      function tapSpot(i) {
        const sp = room.spots[i];
        if (busy || sp.busy) { squash(sp.wrap, .5); A.sfx('blink', { rate: rand(.9, 1.3), vol: .4 }) || A.click(); return; }
        haptic();
        squash(sp.wrap);
        if (i === hide) { found(sp); return; }
        sp.busy = true; sp.open();
        ctx.after(160, () => sp.empty(room.fx));
        ctx.after(1800, () => sp.close());
        ctx.after(2250, () => { sp.busy = false; });
      }
      ctx.on(svg, 'pointerdown', e => {
        const p = ctx.point(e);
        if (busy && ghost.pos.parentNode === front) {
          const d = Math.hypot(p.x - ghost.x, p.y - ghost.y);
          if (d < 70 * ghost.s) { ghost.giggle(); ghost.hop(); return; }
        }
        if (room && room.bgTap) room.bgTap(p.x, p.y);
      });
      ctx.hint = () => (busy || hide < 0) ? null : [room.spots[hide].hx, room.spots[hide].hy];
      startRound();
    }
  };
})();
TOYS.push(peekaboo);
