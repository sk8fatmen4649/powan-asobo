'use strict';
/* =========================================================
   toy: いろぬり — splash paint on a big picture; when it is all
   colored the picture comes alive, then hangs on the wall
   ========================================================= */
(() => {
const INK = '#3a2f5b';
const CRAYONS = [
  { n: 'あか', c: '#ff6b6b', m: 60 },
  { n: 'きいろ', c: '#ffd23f', m: 62 },
  { n: 'あお', c: '#5aa9ff', m: 64 },
  { n: 'みどり', c: '#5fd17a', m: 67 },
  { n: 'ピンク', c: '#ff8fc8', m: 69 },
  { n: 'ぴかぴか！', c: 'magic', m: 72 }
];
const RAINBOW = ['#ff6b6b', '#ffa04d', '#ffd23f', '#5fd17a', '#5aa9ff', '#c9a7ff'];
const CARD = { x: 12, y: 120, w: 376, h: 516, cx: 200, cy: 378 };

/* shape helpers: every shape is drawn clockwise so that overlapping pieces join into one region */
const circ = (x, y, r) => `M${x - r},${y} a${r},${r} 0 1 1 ${2 * r},0 a${r},${r} 0 1 1 ${-2 * r},0Z`;
const ell = (x, y, rx, ry) => `M${x - rx},${y} a${rx},${ry} 0 1 1 ${2 * rx},0 a${rx},${ry} 0 1 1 ${-2 * rx},0Z`;
const rect = (x, y, w, h, r) => `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y}Z`;
const star = (x, y, R, r) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (x + Math.cos(a) * q).toFixed(1) + ',' + (y + Math.sin(a) * q).toFixed(1) + ' ';
  }
  return d + 'Z';
};
const move = (d, s, tx, ty) => d.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_, a, b) => `${(+a * s + tx).toFixed(1)},${(+b * s + ty).toFixed(1)}`);
const cloud = (x, y, s = 1) => circ(x, y + 18 * s, 24 * s) + ' ' + circ(x + 36 * s, y, 33 * s) + ' ' + circ(x + 74 * s, y + 18 * s, 24 * s) + ' ' + rect(x, y + 6 * s, 74 * s, 36 * s, 0);
const petals = (x, y, pd, pr) => [0, 1, 2, 3, 4].map(i => {
  const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
  return circ(+(x + Math.cos(a) * pd).toFixed(1), +(y + Math.sin(a) * pd).toFixed(1), pr);
}).join(' ') + ' ' + circ(x, y, pd);
// a leaf from (x,y) pointing to one side (dir ±1), always clockwise
const leaf = (x, y, dir, len) => {
  const tx = x + dir * len, ty = y - len * .45;
  const up = `${x + dir * len * .25},${y - len * .75}`, lo = `${x + dir * len * .75},${y + len * .12}`;
  return dir > 0 ? `M${x},${y} Q${up} ${tx},${ty} Q${lo} ${x},${y}Z` : `M${x},${y} Q${lo} ${tx},${ty} Q${up} ${x},${y}Z`;
};

/* fixed details (never take taps) */
const dot = (g, x, y, r, fill, o = {}) => el('circle', { cx: x, cy: y, r, fill, ...o }, g);
const line = (g, d, w = 3, stroke = INK, o = {}) => el('path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...o }, g);
let EYES = []; // eyes of the current picture: they blink and look at the finger
function eyes(g, pts, rx, ry, o = {}) {
  const look = el('g', {}, g), blink = el('g', { class: 'tb' }, look);
  pts.forEach(([x, y]) => {
    if (o.white) dot(blink, x, y, o.white, '#fff', { stroke: INK, 'stroke-width': 2.5 });
    el('ellipse', { cx: x, cy: y, rx, ry, fill: INK }, blink);
    dot(blink, x - rx * .35, y - ry * .42, rx * .42, '#fff');
  });
  const e = { look, blink, x: pts.reduce((s, p) => s + p[0], 0) / pts.length, y: pts[0][1], amp: o.amp || 3.5 };
  EYES.push(e);
  return e;
}
function face(g, x, y, s = 1) {
  eyes(g, [[x - 13 * s, y - 4 * s], [x + 13 * s, y - 4 * s]], 5 * s, 6.5 * s, { amp: 2.5 * s });
  [-1, 1].forEach(k => el('ellipse', { cx: x + k * 24 * s, cy: y + 7 * s, rx: 6 * s, ry: 4 * s, fill: '#ffa3b8', opacity: .8 }, g));
  line(g, `M${x - 6 * s},${y + 6 * s} Q${x},${y + 12 * s} ${x + 6 * s},${y + 6 * s}`, 2.6 * s);
}
const squash = (node, a = 1.08) => node.animate([{ transform: 'scale(1)' }, { transform: `scale(${a},${2 - a})` }, { transform: `scale(${2 - a * .97},${a * .97})` }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
const pivot = (x, y, t) => `translate(${x} ${y}) ${t} translate(${-x} ${-y})`;

/* ---------- the eight pictures ---------- */
const PICS = [
  { // ぽわん holding a balloon on a hill
    bg: '#eef6ff',
    regions: [
      { d: 'M20,560 Q120,505 220,545 Q310,505 380,545 L380,606 Q380,630 356,630 L44,630 Q20,630 20,606Z' },
      { d: cloud(56, 168, 1.15) },
      { d: ell(292, 236, 62, 74) + ' M283,318 L292,305 L301,318Z', actor: 'pw',
        deco: g => el('ellipse', { cx: 268, cy: 200, rx: 12, ry: 22, fill: '#fff', opacity: .7, transform: 'rotate(25 268 200)' }, g) },
      { d: move(GHOST_D, 1.7, 165, 450) + ' ' + circ(66, 474, 22) + ' ' + circ(264, 474, 22), actor: 'pw',
        deco: g => {
          eyes(g, [[131, 419], [199, 419]], 12, 16, { amp: 6 });
          [107, 223].forEach(x => el('ellipse', { cx: x, cy: 447, rx: 16, ry: 10, fill: '#ffa3b8', opacity: .8 }, g));
          line(g, 'M152,450 Q165,463 178,450', 4.5);
        } },
      { d: star(338, 454, 44, 20), actor: 'star' }
    ],
    top(g, act) { line(act.pw, 'M268,462 Q282,392 292,319', 2.5); act.pw.insertBefore(act.pw.lastChild, act.pw.firstChild); },
    alive(ctx, act) {
      if (!A.sfx('slide', { vol: .5 })) A.boing();
      ctx.after(600, () => A.twinkle());
      ctx.after(900, () => say('ふわふわ〜'));
      ctx.after(2600, () => A.sfx('boing', { vol: .6 }));
      ctx.tween(2900, k => {
        const up = Math.sin(k * Math.PI) * 140, sway = Math.sin(k * Math.PI * 6) * 16;
        act.pw.setAttribute('transform', `translate(${sway.toFixed(1)} ${(-up).toFixed(1)}) ` + pivot(165, 450, `rotate(${(sway * .3).toFixed(1)})`));
        act.star.setAttribute('transform', pivot(338, 454, `rotate(${(k * 720).toFixed(0)}) scale(${(1 + Math.sin(k * Math.PI) * .25).toFixed(3)})`));
      }, null, k => k);
    }
  },
  { // a fish in the sea
    bg: '#e4f4ff',
    backdrop(g) { [[60, 210, 10], [340, 300, 8], [92, 520, 7]].forEach(([x, y, r]) => dot(g, x, y, r, '#fff', { opacity: .8 })); },
    regions: [
      { d: 'M30,630 Q30,562 104,552 Q176,548 186,630Z' },
      { d: 'M306,630 Q288,582 312,542 Q336,502 312,462 Q298,432 322,416 Q350,436 340,470 Q330,512 352,548 Q372,592 352,630Z', actor: 'weed' },
      { d: circ(296, 214, 28) + ' ' + circ(340, 168, 18) + ' ' + circ(266, 160, 14), actor: 'bub',
        deco: g => [[283, 201, 7.5], [334, 161, 5], [261, 154, 4]].forEach(([x, y, r]) => dot(g, x, y, r, '#fff', { opacity: .8 })) },
      { d: 'M112,382 Q72,336 34,300 Q54,382 34,466 Q72,428 112,382Z', actor: 'fish' },
      { d: 'M136,326 Q160,252 252,268 Q252,300 244,322Z', actor: 'fish' },
      { d: ell(192, 382, 116, 80), actor: 'fish',
        deco: g => {
          dot(g, 256, 358, 19, '#fff', { stroke: INK, 'stroke-width': 2.5 });
          eyes(g, [[260, 360]], 10, 10, { amp: 5 });
          el('ellipse', { cx: 248, cy: 398, rx: 11, ry: 7, fill: '#ffa3b8', opacity: .8 }, g);
          line(g, 'M270,398 Q283,406 294,392', 3);
        } },
      { d: 'M140,316 Q128,382 140,448 Q160,456 184,460 Q170,382 184,304 Q160,308 140,316Z', actor: 'fish' }
    ],
    alive(ctx, act) {
      if (!A.sfx('bubbles', { vol: .7 })) A.whoosh();
      ctx.after(1300, () => A.sfx('splash', { rate: 1.2, vol: .5 }));
      ctx.after(700, () => say('ぶくぶく'));
      ctx.tween(3000, k => {
        const x = k < .45 ? easeIn(k / .45) * 560 : -560 * (1 - easeOut((k - .45) / .55));
        const y = Math.sin(k * Math.PI * 8) * 14;
        act.fish.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) ` + pivot(190, 382, `rotate(${(Math.cos(k * Math.PI * 8) * 5).toFixed(1)})`));
        act.bub.setAttribute('transform', `translate(0 ${(-Math.sin(k * Math.PI) * 70).toFixed(1)})`);
        act.weed.setAttribute('transform', pivot(330, 630, `skewX(${(Math.sin(k * Math.PI * 6) * 8).toFixed(1)})`));
      }, null, k => k);
    }
  },
  { // a house and the sun; someone peeks out of the door
    bg: '#fff6e4',
    regions: [
      { d: 'M20,566 Q200,526 380,566 L380,610 Q380,630 360,630 L40,630 Q20,630 20,610Z' },
      { d: circ(310, 204, 46), actor: 'sun', deco: g => face(g, 310, 206, 1.2) },
      { d: rect(244, 290, 40, 92, 6), actor: 'house' },
      { d: 'M50,408 L190,284 L330,408Z', actor: 'house' },
      { d: rect(78, 402, 224, 162, 8), actor: 'house',
        deco: g => {
          el('rect', { x: 164, y: 474, width: 52, height: 90, rx: 14, fill: '#5b4b80' }, g);
          const p = el('g', {}, g);
          el('path', { d: move(GHOST_D, .36, 190, 526), fill: '#fff' }, p);
          eyes(p, [[184, 520], [196, 520]], 2.6, 3.4, { amp: 1 });
        } },
      { d: rect(164, 474, 52, 90, 14), actor: 'door', deco: g => dot(g, 204, 522, 5, INK) },
      { d: rect(100, 424, 50, 50, 10) + ' ' + rect(230, 424, 50, 50, 10), actor: 'house',
        deco: g => { line(g, 'M125,426 V472 M102,449 H148', 3); line(g, 'M255,426 V472 M232,449 H278', 3); } }
    ],
    top(g, act) {
      const rays = el('g', { 'pointer-events': 'none' }, act.sun);
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        line(rays, `M${(310 + Math.cos(a) * 56).toFixed(1)},${(204 + Math.sin(a) * 56).toFixed(1)} L${(310 + Math.cos(a) * 72).toFixed(1)},${(204 + Math.sin(a) * 72).toFixed(1)}`, 7, '#ffbf3f');
      }
      act.sun.insertBefore(rays, act.sun.firstChild);
      return { rays };
    },
    alive(ctx, act, ex, h) {
      if (!A.sfx('creak', { vol: .7 })) A.whoosh();
      ctx.after(700, () => { say('ばあ！'); A.giggle(); });
      [200, 700, 1200, 1700, 2200].forEach((w, i) => ctx.after(w, () => {
        A.sfx('pop', { rate: 1 + i * .08, vol: .5 });
        const p = el('circle', { cx: 264, cy: 284, r: 14, fill: '#fff', stroke: '#e3dafc', 'stroke-width': 3, 'pointer-events': 'none' }, h.fx);
        ctx.tween(1400, k => { p.setAttribute('cy', (284 - k * 170).toFixed(1)); p.setAttribute('cx', (264 + Math.sin(k * 6 + i) * 16).toFixed(1)); p.setAttribute('r', (14 + k * 18).toFixed(1)); p.setAttribute('opacity', (1 - k).toFixed(2)); }, () => p.remove(), k => k);
      }));
      ctx.tween(2900, k => {
        const d = Math.sin(k * Math.PI * 7) * .07 * (1 - k);
        const sq = pivot(190, 564, `scale(${(1 - d).toFixed(3)} ${(1 + d).toFixed(3)})`);
        act.house.setAttribute('transform', sq);
        const open = k < .15 ? easeOut(k / .15) : k < .7 ? 1 : 1 - easeInOut((k - .7) / .3);
        act.door.setAttribute('transform', sq + ' ' + pivot(164, 520, `scale(${(1 - open * .82).toFixed(3)} 1)`));
        ex.rays.setAttribute('transform', pivot(310, 204, `rotate(${(k * 360).toFixed(0)})`));
        act.sun.setAttribute('transform', pivot(310, 204, `scale(${(1 + Math.sin(k * Math.PI * 4) * .08).toFixed(3)})`));
      }, null, k => k);
    }
  },
  { // a car on the road
    bg: '#eefaf0',
    regions: [
      { d: 'M20,552 L380,552 L380,610 Q380,630 360,630 L40,630 Q20,630 20,610Z',
        deco: g => [44, 124, 204, 284].forEach(x => el('rect', { x, y: 588, width: 46, height: 9, rx: 4.5, fill: '#fff', opacity: .85 }, g)) },
      { d: circ(310, 210, 42), deco: g => face(g, 310, 212, 1.1) },
      { d: 'M100,420 Q110,334 190,328 L250,328 Q298,334 322,420Z', actor: 'car' },
      { d: 'M130,416 Q140,358 194,352 L206,352 L206,416Z M222,416 L222,352 L246,352 Q284,358 294,416Z', actor: 'car' },
      { d: rect(38, 408, 324, 108, 38), actor: 'car',
        deco: g => {
          el('ellipse', { cx: 344, cy: 442, rx: 10, ry: 13, fill: '#fff6b0', stroke: INK, 'stroke-width': 2.5 }, g);
          line(g, 'M214,420 V506', 3, INK, { opacity: .35 });
          el('rect', { x: 228, y: 440, width: 22, height: 7, rx: 3.5, fill: INK, opacity: .5 }, g);
          face(g, 120, 456, 1.2);
        } },
      { d: circ(118, 520, 40) + ' ' + circ(286, 520, 40), actor: 'car',
        deco: g => [118, 286].forEach(x => dot(g, x, 520, 15, '#efeaf8', { stroke: INK, 'stroke-width': 3 })) }
    ],
    alive(ctx, act) {
      if (!A.sfx('horn', { vol: .6 })) A.boing();
      ctx.after(380, () => A.sfx('horn', { vol: .6, rate: 1.1 }));
      A.osc(90, { type: 'sawtooth', lp: 500, when: .5, a: .1, hold: .8, slide: 220, slideT: 1, r: .5, vol: .12 });
      ctx.after(600, () => say('ぶっぶー'));
      ctx.tween(3000, k => {
        let x;
        if (k < .18) x = -Math.sin(k / .18 * Math.PI) * 14;
        else if (k < .5) x = easeIn((k - .18) / .32) * 600;
        else x = -600 * (1 - easeOut((k - .5) / .5));
        const y = Math.abs(Math.sin(k * Math.PI * 14)) * -6;
        act.car.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      }, null, k => k);
    }
  },
  { // an elephant with a ball; it trumpets and sprays water
    bg: '#f2efff',
    regions: [
      { d: 'M20,566 Q200,536 380,566 L380,610 Q380,630 356,630 L44,630 Q20,630 20,610Z' },
      { d: circ(84, 228, 50), actor: 'ball', deco: g => { line(g, 'M40,214 Q84,248 128,214', 4, INK, { opacity: .35 }); line(g, 'M84,178 Q66,228 84,278', 4, INK, { opacity: .35 }); } },
      { d: ell(160, 440, 116, 90) + ' ' + rect(60, 470, 46, 112, 20) + ' ' + rect(118, 482, 46, 104, 20) + ' ' + rect(178, 482, 46, 104, 20) + ' ' + rect(228, 470, 44, 110, 20), actor: 'ele',
        deco: g => { line(g, 'M46,430 Q24,440 30,470', 5); [83, 141, 201, 250].forEach(x => el('ellipse', { cx: x, cy: 574, rx: 12, ry: 5, fill: '#fff', opacity: .8 }, g)); } },
      { d: circ(282, 360, 74) + ' M322,318 C352,296 362,252 354,214 Q372,204 382,226 C394,268 382,322 352,354Z', actor: 'head',
        deco: g => {
          eyes(g, [[300, 330]], 8, 10, { amp: 4 });
          el('ellipse', { cx: 318, cy: 372, rx: 11, ry: 7, fill: '#ffa3b8', opacity: .8 }, g);
          line(g, 'M300,396 Q316,410 334,398', 3.5);
        } },
      { d: ell(250, 368, 46, 62), actor: 'head', key: 'ear' }
    ],
    alive(ctx, act, ex, h) {
      if (!A.animal('elephant')) A.osc(220, { type: 'sawtooth', lp: 1400, slide: 520, slideT: .5, hold: .4, r: .3, vol: .14 });
      ctx.after(700, () => { A.sfx('splash', { vol: .5, rate: 1.1 }); say('ぱおーん'); });
      h.reg.ear.g.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.72)' }, { transform: 'scaleX(1)' }], { duration: 360, iterations: 7 });
      let last = 0;
      ctx.tween(2900, k => {
        const nod = Math.sin(k * Math.PI * 3) * 7 * (1 - k * .5);
        act.head.setAttribute('transform', pivot(250, 410, `rotate(${(-Math.abs(nod) - 4 * Math.sin(k * Math.PI)).toFixed(1)})`));
        act.ele.setAttribute('transform', `translate(0 ${(-Math.abs(Math.sin(k * Math.PI * 6)) * 8).toFixed(1)})`);
        const by = -Math.abs(Math.sin(k * Math.PI * 4)) * 90;
        act.ball.setAttribute('transform', `translate(0 ${by.toFixed(1)}) ` + pivot(84, 228, `rotate(${(k * 540).toFixed(0)})`));
        if (k > .18 && k < .75 && k - last > .025) { last = k; h.drop(372, 206, rand(-60, 160), rand(-430, -300), '#8fd3ff'); }
      }, null, k => k);
    }
  },
  { // a rocket: blast off, then come home
    bg: '#eceeff',
    backdrop(g) {
      [[60, 320, 4], [348, 300, 3.5], [44, 560, 3], [356, 580, 4], [120, 150, 3]].forEach(([x, y, r], i) => {
        const s = el('circle', { cx: x, cy: y, r, fill: '#c9b8ff' }, g);
        s.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 900 + i * 230, iterations: Infinity, direction: 'alternate' });
      });
    },
    regions: [
      { d: circ(318, 212, 42), deco: g => el('ellipse', { cx: 318, cy: 214, rx: 66, ry: 14, fill: 'none', stroke: INK, 'stroke-width': 4, transform: 'rotate(-18 318 214)' }, g) },
      { d: star(80, 214, 36, 16) + ' ' + star(336, 430, 30, 13), actor: 'stars' },
      { d: 'M200,616 Q156,566 168,520 L232,520 Q244,566 200,616Z', actor: 'rocket' },
      { d: 'M140,416 L140,506 L110,524 Q84,528 90,502Z M260,416 L310,502 Q316,528 290,524 L260,506Z', actor: 'rocket' },
      { d: rect(140, 276, 120, 250, 22), actor: 'rocket', deco: g => el('rect', { x: 150, y: 292, width: 16, height: 150, rx: 8, fill: '#fff', opacity: .5 }, g) },
      { d: 'M140,282 Q140,196 200,156 Q260,196 260,282Z', actor: 'rocket' },
      { d: circ(200, 372, 40), actor: 'rocket',
        deco: g => {
          el('circle', { cx: 200, cy: 372, r: 30, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: .4 }, g);
          el('path', { d: move(GHOST_D, .34, 200, 384), fill: '#fff' }, g);
          eyes(g, [[194, 377], [206, 377]], 2.6, 3.4, { amp: 1.2 });
        } }
    ],
    alive(ctx, act, ex, h) {
      A.noise({ type: 'lowpass', from: 160, to: 700, dur: 1.4, vol: .22 });
      ctx.after(350, () => { if (!A.sfx('whoosh2', { vol: .7 })) A.whoosh(); say('いってきまーす！'); });
      ctx.after(2650, () => { A.sfx('boing', { vol: .6 }); say('ただいま！'); });
      let lastPuff = 0;
      ctx.tween(2900, k => {
        let y = 0, x = 0;
        if (k < .14) x = Math.sin(k * 140) * 4;
        else if (k < .5) y = -easeIn((k - .14) / .36) * 1000;
        else if (k < .62) y = -1000;
        else y = -1000 * (1 - easeOut((k - .62) / .38));
        act.rocket.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        act.stars.setAttribute('transform', pivot(208, 322, `scale(${(1 + Math.sin(k * Math.PI * 5) * .06).toFixed(3)})`));
        if (k < .45 && k - lastPuff > .018) { lastPuff = k; h.puff(200 + rand(-60, 60), 600 + rand(-10, 20) + y * .2, rand(20, 34)); }
      }, null, k => k);
    }
  },
  { // a birthday cake: the candles blow out
    bg: '#fff0f5',
    regions: [
      { d: ell(200, 566, 172, 36) },
      { d: rect(66, 432, 268, 132, 26) },
      { d: rect(106, 330, 188, 106, 22), deco: g => [140, 200, 260].forEach(x => { dot(g, x, 372, 11, '#ff6b7a'); dot(g, x - 3, 368, 3.5, '#fff', { opacity: .8 }); }) },
      { d: (() => {
        let d = 'M62,446 Q62,424 84,424 L316,424 Q338,424 338,446 L338,456';
        for (let i = 0; i < 8; i++) { const x = 338 - i * 34.5; d += ` Q${(x - 17.25).toFixed(1)},${i % 2 ? 494 : 482} ${(x - 34.5).toFixed(1)},456`; }
        return d + ' Z';
      })() },
      { d: rect(134, 258, 28, 76, 9) + ' ' + rect(186, 244, 28, 90, 9) + ' ' + rect(238, 258, 28, 76, 9),
        deco: g => [148, 200, 252].forEach((x, i) => line(g, `M${x - 14},${(i === 1 ? 266 : 280)} L${x + 14},${(i === 1 ? 256 : 270)} M${x - 14},${(i === 1 ? 296 : 310)} L${x + 14},${(i === 1 ? 286 : 300)}`, 3, INK, { opacity: .3 })) },
      { d: [[148, 250], [200, 236], [252, 250]].map(([x, y]) => `M${x},${y} Q${x - 22},${y - 14} ${x - 6},${y - 40} Q${x},${y - 50} ${x + 2},${y - 56} Q${x + 24},${y - 30} ${x + 16},${y - 12} Q${x + 12},${y} ${x},${y}Z`).join(' '), actor: 'flames', fat: true }
    ],
    alive(ctx, act, ex, h) {
      A.twinkle();
      ctx.after(900, () => {
        if (!A.sfx('whoosh', { vol: .7 })) A.whoosh();
        [0, 1, 2].forEach(i => {
          const w = el('path', { d: `M400,${200 + i * 30} Q330,${180 + i * 30} 280,${200 + i * 30} Q240,${215 + i * 30} 200,${195 + i * 30}`, fill: 'none', stroke: '#bfe6ff', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': '60 400', 'pointer-events': 'none' }, h.fx);
          w.animate([{ strokeDashoffset: 0, opacity: 1 }, { strokeDashoffset: -360, opacity: 0 }], { duration: 600, delay: i * 70, fill: 'both' }).onfinish = () => w.remove();
        });
      });
      ctx.after(1200, () => [148, 200, 252].forEach((x, i) => ctx.after(i * 90, () => h.smoke(x, i === 1 ? 236 : 250))));
      ctx.after(1500, () => { if (!A.sfx('applause', { vol: .6 })) A.tada(); say('ぱちぱち！'); });
      ctx.after(2700, () => A.sfx('pop2', { vol: .6 }));
      ctx.tween(2900, k => {
        let s;
        if (k < .3) s = 1 + Math.sin(k * 60) * .08;
        else if (k < .42) s = 1 - easeIn((k - .3) / .12);
        else if (k < .92) s = 0;
        else s = easeBack((k - .92) / .08);
        act.flames.setAttribute('transform', pivot(200, 252, `scale(1 ${Math.max(0, s).toFixed(3)})`));
        act.flames.setAttribute('opacity', k > .42 && k < .92 ? 0 : 1);
      }, null, k => k);
    }
  },
  { // a flower garden with a butterfly
    bg: '#effbe6',
    regions: [
      { d: 'M20,526 Q110,494 200,518 Q290,494 380,526 L380,610 Q380,630 356,630 L44,630 Q20,630 20,610Z' },
      { d: rect(86, 340, 18, 220, 9) + ' ' + rect(196, 266, 18, 280, 9) + ' ' + rect(300, 352, 18, 200, 9) + ' ' + leaf(104, 470, 1, 56) + ' ' + leaf(196, 420, -1, 56) + ' ' + leaf(318, 486, 1, 50), actor: 'flowers' },
      { d: petals(95, 330, 38, 30), actor: 'flowers' },
      { d: petals(205, 256, 38, 30), actor: 'flowers' },
      { d: petals(309, 344, 38, 30), actor: 'flowers' },
      { d: circ(95, 330, 24) + ' ' + circ(205, 256, 24) + ' ' + circ(309, 344, 24), actor: 'flowers',
        deco: g => [[95, 330], [205, 256], [309, 344]].forEach(([x, y]) => face(g, x, y, .8)) },
      { d: ell(308, 178, 24, 30) + ' ' + ell(356, 178, 24, 30) + ' ' + ell(314, 212, 16, 18) + ' ' + ell(350, 212, 16, 18), actor: 'bfly',
        deco: g => { el('rect', { x: 326, y: 164, width: 12, height: 58, rx: 6, fill: INK }, g); line(g, 'M330,166 Q322,146 314,142 M334,166 Q342,146 350,142', 3); } }
    ],
    alive(ctx, act, ex, h) {
      if (!A.sfx('sparkle', { vol: .6 })) A.twinkle();
      ctx.after(400, () => A.chirp());
      ctx.after(900, () => say('るんるん'));
      ctx.after(1500, () => A.chirp());
      ctx.tween(2900, k => {
        act.flowers.setAttribute('transform', pivot(200, 560, `skewX(${(Math.sin(k * Math.PI * 5) * 9 * (1 - k * .4)).toFixed(1)})`));
        const a = k * Math.PI * 2;
        const bx = Math.sin(a) * -150, by = (1 - Math.cos(a)) * 90 + Math.sin(k * 60) * 6;
        act.bfly.setAttribute('transform', `translate(${bx.toFixed(1)} ${by.toFixed(1)}) ` + pivot(332, 192, `scale(${(.75 + Math.abs(Math.sin(k * 70)) * .25).toFixed(3)} 1)`));
      }, null, k => k);
    }
  }
];

/* the paint splash: a wobbly blob of paint that floods out from the finger */
function blobD(cx, cy, R, ph, wob) {
  const N = 30, pts = [];
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2;
    const r = Math.max(0, R * (1 + wob * (.6 * Math.sin(5 * a + ph) + .4 * Math.sin(8 * a - ph * 1.3))));
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  const mid = (p, q) => `${((p[0] + q[0]) / 2).toFixed(1)},${((p[1] + q[1]) / 2).toFixed(1)}`;
  let d = 'M' + mid(pts[N - 1], pts[0]);
  for (let i = 0; i < N; i++) d += ` Q${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${mid(pts[i], pts[(i + 1) % N])}`;
  return d + 'Z';
}

const colorToy = {
  id: 'color', name: 'いろぬり', color: '#ffe9b8',
  thumb(g) {
    el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#fff8e6' }, g);
    const f = el('g', { transform: 'translate(-6 -12) scale(.5) translate(-180 -382)' }, g);
    el('path', { d: 'M112,382 Q72,336 36,304 Q56,382 36,462 Q72,428 112,382Z', fill: '#ffa04d', stroke: INK, 'stroke-width': 5 }, f);
    el('path', { d: ell(190, 382, 112, 76), fill: '#5aa9ff', stroke: INK, 'stroke-width': 5 }, f);
    el('path', { d: 'M140,320 Q128,382 140,444 Q160,452 182,456 Q168,382 182,308 Q160,312 140,320Z', fill: '#ffd23f', stroke: INK, 'stroke-width': 5 }, f);
    dot(f, 254, 360, 17, '#fff'); dot(f, 258, 362, 10, INK);
    [['#ff6b6b', -48], ['#ffd23f', -16], ['#5fd17a', 16], ['#ff8fc8', 48]].forEach(([c, x], i) => {
      el('circle', { cx: x, cy: 56 - (i === 1 ? 8 : 0), r: 13, fill: c }, g);
      dot(g, x - 4, 51 - (i === 1 ? 8 : 0), 3.5, '#fff', { opacity: .7 });
    });
  },
  mount(ctx) {
    const { svg, defs } = ctx;
    const pat = el('pattern', { id: 'color-dots', width: 56, height: 56, patternUnits: 'userSpaceOnUse' }, defs);
    el('circle', { cx: 12, cy: 12, r: 4, fill: '#ffd99a' }, pat);
    el('circle', { cx: 40, cy: 40, r: 4, fill: '#ffcfd8' }, pat);
    const gloss = el('radialGradient', { id: 'color-gloss', cx: .3, cy: .25, r: .7 }, defs);
    el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': .4 }, gloss);
    el('stop', { offset: .5, 'stop-color': '#fff', 'stop-opacity': .08 }, gloss);
    el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, gloss);
    const rbH = el('linearGradient', { id: 'color-rbh', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    RAINBOW.forEach((c, i) => el('stop', { offset: i / 5, 'stop-color': c }, rbH));

    /* ---------- backdrop: wall, drifting paint drops ---------- */
    const bg = el('g', {}, svg);
    el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: '#ffe9b8' }, bg);
    el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: 'url(#color-dots)' }, bg);
    [[-40, 300, 26, '#ffcf8a'], [440, 420, 30, '#ffc2d0'], [-30, 640, 22, '#c9e6ff'], [430, 160, 20, '#d4f5c4']].forEach(([x, y, r, c], i) => {
      const f = el('g', { class: 'float', style: `animation-delay:-${i * .8}s` }, bg);
      el('circle', { cx: x, cy: y, r, fill: c, opacity: .8 }, f);
    });
    el('rect', { x: CARD.x, y: CARD.y, width: CARD.w, height: CARD.h, rx: 28, fill: '#fffdf7', filter: 'url(#soft)' }, bg);
    el('rect', { x: 8, y: 652, width: 384, height: 100, rx: 42, fill: '#fff', opacity: .7 }, bg);

    /* ---------- the wall of finished pictures ---------- */
    const wall = el('g', {}, svg);
    line(wall, 'M86,22 Q196,40 306,22', 3, '#c98f5f');
    [86, 306].forEach(x => dot(wall, x, 22, 6, '#c98f5f'));
    const gallery = [];
    const SLOT = i => 124 + i * 50;

    const stage = el('g', {}, svg);
    const fx = el('g', { 'pointer-events': 'none' }, svg);
    const ghost = ctx.ghost(svg, { x: 344, y: 80, s: .46 });
    const gEyes = ghost.body.querySelector(':scope > g.tb');

    let cur = 0, autoColor = true, busy = false, picIdx = Math.floor(rand(0, PICS.length)), uid = 0, fills = 0, round = 0, lastSaid = -1;
    let pic = null, regions = [], filled = new Set(), act = {}, extra = null, picOuter = null, picG = null, picDefs = [], reg = {};

    /* ---------- particles ---------- */
    function drop(x, y, vx, vy, color, r = rand(5, 9)) {
      const d = el('circle', { cx: x, cy: y, r, fill: color }, fx);
      let X = x, Y = y, life = 0;
      const stop = ctx.loop(dt => {
        life += dt; vy += 900 * dt; X += vx * dt; Y += vy * dt;
        d.setAttribute('cx', X.toFixed(1)); d.setAttribute('cy', Y.toFixed(1));
        d.setAttribute('r', (r * Math.max(0, 1 - life * .9)).toFixed(1));
        if (life > .95) { stop(); d.remove(); }
      });
    }
    function puff(x, y, r) {
      const p = el('circle', { cx: x, cy: y, r: r * .4, fill: '#fff', stroke: '#e3dafc', 'stroke-width': 3 }, fx);
      ctx.tween(1300, k => { p.setAttribute('r', (r * (.4 + k)).toFixed(1)); p.setAttribute('cy', (y - k * 30).toFixed(1)); p.setAttribute('opacity', (1 - k).toFixed(2)); }, () => p.remove(), easeOut);
    }
    function smoke(x, y) {
      const s = el('path', { d: `M${x},${y} q-8,-12 0,-24 q8,-12 0,-24`, fill: 'none', stroke: '#b9b2cc', 'stroke-width': 5, 'stroke-linecap': 'round' }, fx);
      ctx.tween(1200, k => { s.setAttribute('transform', `translate(0 ${(-k * 40).toFixed(1)})`); s.setAttribute('opacity', (1 - k).toFixed(2)); }, () => s.remove(), easeOut);
    }

    /* ---------- palette ---------- */
    const blobs = CRAYONS.map((cr, i) => {
      const x = 40 + i * 64;
      const outer = el('g', { transform: `translate(${x} 704)` }, svg);
      const lift = el('g', {}, outer);
      const bob = el('g', { class: 'float', style: `animation-delay:-${(i * .53).toFixed(2)}s;animation-duration:${(2.6 + i * .17).toFixed(2)}s` }, lift);
      const ring = el('circle', { r: 34, fill: '#fff', opacity: 0 }, bob);
      const body = el('g', { class: 'tb' }, bob);
      const fill = cr.c === 'magic' ? 'url(#color-rbh)' : cr.c;
      el('path', { d: 'M-26,2 C-27,-17 -14,-27 1,-27 C17,-27 27,-15 26,1 C25,18 14,27 -1,26 C-17,25 -25,17 -26,2Z', fill }, body);
      el('ellipse', { cx: -9, cy: -11, rx: 9, ry: 6, fill: '#fff', opacity: .55, transform: 'rotate(-30 -9 -11)' }, body);
      if (cr.c === 'magic') {
        const st = el('path', { d: 'M0,-13 Q2,-2 13,0 Q2,2 0,13 Q-2,2 -13,0 Q-2,-2 0,-13Z', fill: '#fff', class: 'twinkle' }, body);
        st.style.animationDuration = '1.6s';
      } else dot(body, 9, 9, 3.5, '#fff', { opacity: .35 });
      el('rect', { x: -32, y: -62, width: 64, height: 114, fill: 'transparent' }, outer);
      const b = { i, x, outer, lift, ring, body, up: 0, stop: null };
      outer.addEventListener('pointerdown', e => { e.stopPropagation(); haptic(); choose(i, true); });
      return b;
    });
    function liftTo(b, to) {
      if (b.stop) b.stop();
      const from = b.up;
      b.stop = ctx.tween(to > from ? 340 : 220, k => { b.up = from + (to - from) * k; b.lift.setAttribute('transform', `translate(0 ${(-b.up).toFixed(1)})`); }, () => { b.stop = null; }, to > from ? easeBack : easeOut);
    }
    function choose(i, byChild) {
      if (byChild) autoColor = false;
      cur = i;
      blobs.forEach(b => {
        liftTo(b, b.i === i ? 20 : 0);
        b.ring.setAttribute('opacity', b.i === i ? .95 : 0);
        b.body.getAnimations().forEach(a => a.cancel());
      });
      const b = blobs[i];
      b.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25,.8)' }, { transform: 'scale(.9,1.15)' }, { transform: 'scale(1.12)' }], { duration: 380, fill: 'forwards' });
      if (byChild) {
        A.pluck(mtof(CRAYONS[i].m + 12), { vol: .18 });
        if (CRAYONS[i].c === 'magic') { if (!A.sfx('sparkle', { vol: .55 })) A.twinkle(); ctx.sparkle(b.x, 680, 6, 34, '#fff'); RAINBOW.forEach((c, k) => ctx.after(k * 40, () => ctx.sparkle(b.x, 690, 1, 30, c))); }
        else { A.sfx('pop2', { rate: rand(.9, 1.2), vol: .6 }) || A.pop(); ctx.sparkle(b.x, 684, 3, 24, CRAYONS[i].c); }
        say(CRAYONS[i].n); lastSaid = i;
      }
    }

    /* ---------- the picture ---------- */
    function localPt(node, e) {
      const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(node.getScreenCTM().inverse());
    }
    function toRoot(node, x, y) {
      const p = svg.createSVGPoint(); p.x = x; p.y = y;
      const s = p.matrixTransform(node.getScreenCTM());
      return ctx.pointXY(s.x, s.y);
    }
    function build() {
      round++;
      pic = PICS[picIdx % PICS.length];
      EYES = []; picDefs = []; reg = {};
      picOuter = el('g', {}, stage);
      picG = el('g', { class: 'tb' }, picOuter);
      act = {}; filled = new Set(); fills = 0;
      const card = el('rect', { x: CARD.x + 6, y: CARD.y + 6, width: CARD.w - 12, height: CARD.h - 12, rx: 24, fill: pic.bg }, picG);
      card.addEventListener('pointerdown', e => { e.stopPropagation(); tapCard(e); });
      if (pic.backdrop) pic.backdrop(el('g', { 'pointer-events': 'none' }, picG));
      regions = pic.regions.map((r, i) => {
        let parent = picG;
        if (r.actor) parent = act[r.actor] || (act[r.actor] = el('g', {}, picG));
        const g = el('g', { class: 'tb' }, parent);
        el('path', { d: r.d, fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, g);
        const base = el('path', { d: r.d, fill: '#fff', ...(r.fat ? { stroke: 'transparent', 'stroke-width': 30, 'stroke-linejoin': 'round' } : {}) }, g);
        const paint = el('g', { 'pointer-events': 'none' }, g);
        el('path', { d: r.d, fill: 'url(#color-gloss)', 'pointer-events': 'none' }, g);
        if (r.deco) r.deco(el('g', { 'pointer-events': 'none' }, g));
        const R = { ...r, i, g, base, paint };
        if (r.key) reg[r.key] = R;
        g.addEventListener('pointerdown', e => { e.stopPropagation(); splash(R, e); });
        return R;
      });
      extra = pic.top ? pic.top(picG, act) : null;
      picG.animate([{ transform: 'scale(.6) rotate(-6deg)', opacity: 0 }, { transform: 'scale(1.04) rotate(1deg)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 560, easing: 'ease-out' });
    }
    function paintOf(R) {
      const cr = CRAYONS[cur];
      if (cr.c !== 'magic') return cr.c;
      const bb = R.base.getBBox(), id = 'color-rb' + (++uid);
      const gr = el('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: bb.x, y1: bb.y, x2: bb.x + bb.width, y2: bb.y + bb.height }, defs);
      const off = Math.floor(rand(0, 6));
      RAINBOW.forEach((c, k) => el('stop', { offset: k / 5, 'stop-color': RAINBOW[(k + off) % 6] }, gr));
      picDefs.push(gr);
      return `url(#${id})`;
    }
    function splash(R, e) {
      haptic();
      const cr = CRAYONS[cur], magic = cr.c === 'magic';
      const col = paintOf(R);
      const p = localPt(R.g, e);
      const id = 'color-k' + (++uid);
      const cp = el('clipPath', { id }, defs);
      el('path', { d: R.d }, cp);
      const layer = el('g', { 'clip-path': `url(#${id})` }, R.paint);
      const blob = el('path', { fill: col }, layer);
      const bb = R.base.getBBox();
      const far = Math.max(...[[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].map(([x, y]) => Math.hypot(x - p.x, y - p.y))) + 8;
      const drips = [0, 1, 2, 3].map(() => ({ x: p.x + rand(-.5, .5) * Math.min(90, bb.width * .6), w: rand(14, 24), sp: rand(.9, 1.3), node: el('path', { fill: col }, layer) }));
      const ph = rand(0, 6);
      ctx.tween(640, k => {
        const R0 = far * easeOut(k);
        blob.setAttribute('d', blobD(p.x, p.y, R0, ph + k * 4, .2 * (1 - k) + .03));
        drips.forEach(d => {
          const len = R0 * .55 + far * .9 * easeIn(k) * d.sp;
          d.node.setAttribute('d', rect(d.x - d.w / 2, p.y, d.w, Math.max(d.w, len), d.w / 2));
        });
      }, () => {
        R.base.setAttribute('fill', col);
        layer.remove(); cp.remove();
      }, k => k);
      // drops fly out from the finger
      const sp = ctx.point(e);
      const dc = magic ? RAINBOW : [cr.c];
      for (let i = 0; i < 7; i++) { const a = rand(-Math.PI * .95, -Math.PI * .05), v = rand(160, 300); drop(sp.x, sp.y, Math.cos(a) * v, Math.sin(a) * v, dc[i % dc.length]); }
      const ring = el('circle', { cx: sp.x, cy: sp.y, r: 6, fill: 'none', stroke: magic ? '#fff' : cr.c, 'stroke-width': 8 }, fx);
      ctx.tween(500, k => { ring.setAttribute('r', (6 + k * 60).toFixed(1)); ring.setAttribute('stroke-width', (8 * (1 - k) + .5).toFixed(1)); ring.setAttribute('opacity', (1 - k).toFixed(2)); }, () => ring.remove(), easeOut);
      squash(R.g, 1.07);
      // the sound of wet paint, never twice the same
      const kind = magic ? 'sparkle' : pick(['splash2', 'splash2', 'pop', 'bubble']);
      if (!A.sfx(kind, { rate: rand(.85, 1.25), vol: kind === 'splash2' ? .5 : .65 })) A.noise({ type: 'lowpass', from: 2600, to: 500, dur: .22, vol: .14 });
      A.bell(mtof(cr.m + 12), { vol: .1 });
      if (magic) { ctx.sparkle(sp.x, sp.y, 5, 50, '#fff'); A.twinkle(); }
      if (busy) return;
      if (lastSaid !== cur) { say(cr.n); lastSaid = cur; }
      fills++;
      ghost.hop();
      const first = !filled.has(R.i);
      filled.add(R.i);
      if (filled.size === regions.length && first) return celebrate();
      if (fills % 3 === 0) { ghost.set('happy'); ghost.talk(pick(['きれい！', 'いいいろ！', 'ぬりぬり〜']), false); ctx.after(1200, () => { if (!busy) ghost.set('normal'); }); }
      if (autoColor) ctx.after(380, () => choose(fills % 6 === 5 ? 5 : (cur + 1) % 5, false));
    }
    function tapCard(e) {
      haptic();
      const sp = ctx.point(e), c = CRAYONS[cur].c === 'magic' ? pick(RAINBOW) : CRAYONS[cur].c;
      for (let i = 0; i < 4; i++) { const a = rand(-Math.PI * .9, -Math.PI * .1), v = rand(100, 200); drop(sp.x, sp.y, Math.cos(a) * v, Math.sin(a) * v, c, rand(4, 7)); }
      A.sfx('pop', { rate: rand(1.2, 1.5), vol: .35 }) || A.click();
      // the next empty spot wiggles to show where paint can go
      const r = regions.find(q => !filled.has(q.i));
      if (r && !busy) squash(r.g, 1.06);
    }

    /* ---------- the payoff ---------- */
    function celebrate() {
      busy = true;
      const rare = round > 2 && Math.random() < 1 / 6;
      ctx.after(350, () => {
        A.tada(); ctx.confetti(200, 330, 40); ctx.sparkle(200, 380, 8, 150);
        ghost.set('happy'); ghost.giggle(); ghost.talk('できた！');
        ghost.moveTo(300, 150, .56, 500, () => ghost.hop(), easeBack);
        pic.alive(ctx, act, extra, { fx, reg, drop, puff, smoke });
      });
      ctx.after(1500, () => { ctx.confetti(100, 300, 24); ctx.confetti(300, 300, 24); ghost.hop(); });
      if (rare) ctx.after(900, rainbow);
      ctx.after(3500, () => {
        ghost.talk(pick(['きれいだね！', 'すごいね！', 'かわいい！'])); A.twinkle(); ghost.giggle();
        ghost.moveTo(344, 80, .46, 600);
      });
      ctx.after(4300, () => hang(rare));
    }
    function rainbow() {
      if (!A.sfx('jingle', { vol: .6 })) A.twinkle();
      const g = el('g', { opacity: .9, 'pointer-events': 'none' }, svg);
      svg.insertBefore(g, wall);
      RAINBOW.forEach((c, i) => {
        const r = 128 - i * 9;
        const a = el('path', { d: `M${200 - r},118 A${r},${r * .8} 0 0 1 ${200 + r},118`, fill: 'none', stroke: c, 'stroke-width': 10, 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': '100 100' }, g);
        a.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: 700, delay: i * 60, easing: 'ease-out', fill: 'both' });
      });
      ctx.after(4600, () => g.animate([{ opacity: .9 }, { opacity: 0 }], { duration: 600, fill: 'forwards' }).onfinish = () => g.remove());
    }
    // the finished picture flies up onto the wall
    function hang(gold) {
      Object.values(act).forEach(a => { a.removeAttribute('transform'); a.removeAttribute('opacity'); });
      if (gallery.length >= 4) {
        const old = gallery.shift();
        old.g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => { old.g.remove(); old.defs.forEach(d => d.remove()); };
        gallery.forEach((it, i) => { const x0 = it.x, x1 = SLOT(i); ctx.tween(400, k => { it.x = x0 + (x1 - x0) * k; it.g.setAttribute('transform', `translate(${it.x.toFixed(1)} 62)`); }, null, easeInOut); });
      }
      const slot = gallery.length, tx = SLOT(slot), ty = 62, S = .088;
      const node = picOuter, defsOf = picDefs;
      node.setAttribute('pointer-events', 'none');
      if (!A.sfx('whoosh2', { vol: .5 })) A.whoosh();
      ctx.tween(800, k => {
        const cx = CARD.cx + (tx - CARD.cx) * k, cy = CARD.cy + (ty - CARD.cy) * k, s = 1 + (S - 1) * k;
        node.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${(Math.sin(k * Math.PI) * -12).toFixed(1)}) scale(${s.toFixed(4)}) translate(${-CARD.cx} ${-CARD.cy})`);
      }, () => {
        const g = el('g', { transform: `translate(${tx} ${ty})` }, wall);
        const sw = el('g', { class: 'tb', style: 'transform-origin:50% 0%' }, g);
        el('rect', { x: -22, y: -28, width: 44, height: 56, rx: 6, fill: gold ? '#ffd56b' : '#fff', filter: 'url(#soft)' }, sw);
        node.setAttribute('transform', `scale(${S}) translate(${-CARD.cx} ${-CARD.cy})`);
        sw.appendChild(node);
        el('circle', { cx: 0, cy: -27, r: 5, fill: PARTY[slot % PARTY.length] }, sw);
        el('rect', { x: -22, y: -30, width: 44, height: 62, fill: 'transparent' }, sw);
        const it = { g, sw, x: tx, defs: defsOf };
        gallery.push(it);
        sw.animate([{ transform: 'rotate(14deg)' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0deg)' }], { duration: 900, easing: 'ease-out' });
        A.sfx('flip', { vol: .7 }) || A.pop();
        ctx.sparkle(tx, ty, 5, 30);
        g.addEventListener('pointerdown', e => {
          e.stopPropagation(); haptic();
          sw.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(16deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(0deg)' }], { duration: 700, easing: 'ease-out' });
          A.sfx('flip', { rate: rand(.9, 1.2), vol: .6 }) || A.pop();
          ctx.sparkle(it.x, ty, 3, 26);
        });
        ctx.after(350, () => {
          picIdx++; build(); A.sfx('pop', { vol: .6 }) || A.pop();
          ghost.set('normal'); busy = false;
          if (autoColor) choose(Math.floor(rand(0, 5)), false);
        });
      }, easeInOut);
    }

    /* ---------- life: blinking, looking, wiggling ---------- */
    function blinkOne(e) { e.blink.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 200 }); }
    (function blinkLoop() { ctx.after(rand(1400, 3200), () => { if (EYES.length) blinkOne(pick(EYES)); blinkLoop(); }); })();
    ctx.on(ctx.host, 'pointerdown', e => {
      const p = ctx.point(e);
      EYES.forEach(q => q.look.setAttribute('transform', `translate(${(clamp((p.x - q.x) / 50, -1, 1) * q.amp).toFixed(1)} ${(clamp((p.y - q.y) / 50, -1, 1) * q.amp * .7).toFixed(1)})`));
      if (gEyes) gEyes.setAttribute('transform', `translate(${(clamp((p.x - ghost.x) / 80, -1, 1) * 7).toFixed(1)} ${(clamp((p.y - ghost.y) / 80, -1, 1) * 5).toFixed(1)})`);
    }, true);
    ctx.every(2600, () => {
      if (busy) return;
      const r = pick(regions.filter(q => !filled.has(q.i)));
      if (r) squash(r.g, 1.04);
    });

    bg.addEventListener('pointerdown', e => {
      const p = ctx.point(e);
      const c = pick(RAINBOW);
      for (let i = 0; i < 3; i++) drop(p.x, p.y, rand(-120, 120), rand(-260, -160), c, rand(5, 8));
      A.sfx('blink', { rate: rand(.9, 1.3), vol: .5 }) || A.osc(mtof(pick(PENTA) + 24), { r: .2, vol: .08 });
    });
    ghost.pos.addEventListener('pointerdown', e => {
      e.stopPropagation(); ghost.giggle();
      ghost.talk(pick(['くすぐったい〜', 'ぬりぬり しよう！']), false);
      ctx.after(1200, () => { if (!busy) ghost.set('normal'); });
    });

    build();
    choose(0, false);
    ctx.after(450, () => { ghost.set('happy'); ghost.talk('ぬりぬり しよう！'); ctx.after(1600, () => ghost.set('normal')); });
    ctx.hint = () => {
      if (busy) return null;
      const r = regions.find(q => !filled.has(q.i));
      if (!r) return null;
      const [x, y] = inside(r);
      const q = toRoot(r.base, x, y);
      return [q.x, q.y];
    };
    // a point that really lies on a region (and is not covered by a later one)
    function inside(r) {
      if (r.pt) return r.pt;
      const bb = r.base.getBBox(), cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      const later = regions.filter(q => q.i > r.i);
      const hit = (node, x, y) => { try { return node.isPointInFill(new DOMPoint(x, y)); } catch (e) { return true; } };
      let best = [cx, cy], bd = Infinity;
      for (let i = 1; i < 12; i++) for (let j = 1; j < 12; j++) {
        const x = bb.x + bb.width * i / 12, y = bb.y + bb.height * j / 12, d = Math.hypot(x - cx, y - cy);
        if (d < bd && hit(r.base, x, y) && !later.some(q => hit(q.base, x, y))) { bd = d; best = [x, y]; }
      }
      return (r.pt = best);
    }
  }
};
TOYS.push(colorToy);
})();
