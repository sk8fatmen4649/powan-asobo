'use strict';
/* =========================================================
   toy: おきがえ — dress a friend, check the mirror, go out to play
   ========================================================= */
(() => {
  const INK = '#3a2f5b';
  const KINDS = ['bear', 'bunny', 'powan'];
  const ROOMS = {
    bear: { wall: '#d6f3e4', dot: '#bfe9d2', floor: '#f3d9b8', board: '#e8c9a2', rug: '#ffd56b' },
    bunny: { wall: '#ffe2ec', dot: '#ffcadb', floor: '#f6dcc2', board: '#ecc9aa', rug: '#9fd8ff' },
    powan: { wall: '#e6defe', dot: '#d4c8fb', floor: '#efd8c4', board: '#e2c4aa', rug: '#ff9ab3' }
  };
  const CATS = ['top', 'bottom', 'shoes', 'hat', 'extra'];
  const DEST = { balloon: 'park', umbrella: 'rain', scarf: 'snow', ring: 'beach' };

  /* ---------- slot skeleton: shared by the body and the tray icons ---------- */
  function dsSlots(parent) {
    const S = {};
    S.back = el('g', {}, parent);
    S.legs = el('g', {}, parent);
    S.torso = el('g', {}, parent);
    S.bottom = el('g', {}, parent);
    S.shoes = el('g', {}, parent);
    S.top = el('g', {}, parent);
    S.ring = el('g', {}, parent);
    S.arms = [-1, 1].map(side => {
      const piv = el('g', { transform: `translate(${side * 60} -34)` }, parent);
      const rot = el('g', {}, piv);
      const m = el('g', { transform: `scale(${side} 1)` }, rot);
      return { side, piv, rot, m, base: el('g', {}, m), sleeve: el('g', {}, m), held: el('g', {}, rot) };
    });
    S.scarf = el('g', {}, parent);
    S.head = el('g', {}, parent);
    S.hat = el('g', {}, parent);
    S.ears = el('g', {}, parent);
    return S;
  }
  function dsFace(g, o) {
    const eyes = el('g', { style: 'transition:translate .25s' }, g);
    const eN = el('g', { class: 'tb' }, eyes), eH = el('g', { style: 'display:none' }, eyes), eW = el('g', { style: 'display:none' }, eyes);
    [-1, 1].forEach(s => {
      const x = s * o.edx, y = o.ey;
      el('ellipse', { cx: x, cy: y, rx: 9.5, ry: 12, fill: INK }, eN);
      el('circle', { cx: x - 3.5, cy: y - 5, r: 4, fill: '#fff' }, eN);
      el('circle', { cx: x + 3, cy: y + 5, r: 1.8, fill: '#fff' }, eN);
      el('path', { d: `M${x - 12},${y + 3} Q${x},${y - 12} ${x + 12},${y + 3}`, stroke: INK, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, eH);
      el('circle', { cx: x, cy: y, r: 12.5, fill: INK }, eW);
      el('circle', { cx: x - 4, cy: y - 5, r: 4.5, fill: '#fff' }, eW);
    });
    [-1, 1].forEach(s => el('ellipse', { cx: s * o.cdx, cy: o.cy, rx: 13, ry: 8, fill: '#ffa3b8', opacity: .8 }, g));
    const my = o.my;
    const mN = el('path', { d: `M-11,${my} Q0,${my + 10} 11,${my}`, stroke: INK, 'stroke-width': 3.8, fill: 'none', 'stroke-linecap': 'round' }, g);
    const mH = el('g', { style: 'display:none' }, g);
    el('path', { d: `M-15,${my - 2} Q0,${my + 24} 15,${my - 2}Z`, fill: '#ff7a8a' }, mH);
    el('ellipse', { cx: 0, cy: my + 11, rx: 6, ry: 4, fill: '#ffb3c1' }, mH);
    const mW = el('ellipse', { cx: 0, cy: my + 6, rx: 8, ry: 10, fill: '#c2405a', style: 'display:none' }, g);
    let cur = 'normal';
    return {
      get expr() { return cur; },
      set(e) {
        cur = e;
        eN.style.display = e === 'normal' ? '' : 'none'; eH.style.display = e === 'happy' ? '' : 'none'; eW.style.display = e === 'wow' ? '' : 'none';
        mN.style.display = e === 'normal' ? '' : 'none'; mH.style.display = e === 'happy' ? '' : 'none'; mW.style.display = e === 'wow' ? '' : 'none';
      },
      look(dx, dy) { eyes.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`; },
      blink() { if (cur === 'normal') eN.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 }); }
    };
  }
  /* ---------- the three friends (same body plan so every outfit fits) ---------- */
  function dsBase(S, kind) {
    const C = kind === 'bear' ? { fur: '#c08a57', fur2: '#a8743f', belly: '#e8c49a', pants: '#ffffff', dot: '#8fb8ff' }
      : kind === 'bunny' ? { fur: '#fff6f9', fur2: '#f3d8e2', belly: '#ffe6ef', pants: '#c9e8ff', dot: '#ffffff' }
        : { fur: '#f4efff', fur2: '#d9ccff', belly: '#ffffff', pants: '#ffd0dc', dot: '#ffffff' };
    const line = kind === 'bunny' ? { stroke: C.fur2, 'stroke-width': 2.5 } : {};
    [-1, 1].forEach(s => {
      if (kind === 'powan') el('ellipse', { cx: s * 34, cy: 134, rx: 18, ry: 22, fill: C.fur, stroke: C.fur2, 'stroke-width': 2.5 }, S.legs);
      else {
        el('rect', { x: s * 34 - 23, y: 66, width: 46, height: 86, rx: 22, fill: C.fur, ...line }, S.legs);
        el('ellipse', { cx: s * 38, cy: 150, rx: 28, ry: 16, fill: C.fur, ...line }, S.legs);
        el('ellipse', { cx: s * 38, cy: 152, rx: 13, ry: 8, fill: kind === 'bear' ? C.belly : '#ffc4d6' }, S.legs);
      }
    });
    if (kind === 'powan') {
      el('path', { d: 'M-86,-130 C-86,-198 -48,-220 0,-220 C48,-220 86,-198 86,-130 L86,96 Q72,124 57,100 Q43,124 29,100 Q14,124 0,100 Q-14,124 -29,100 Q-43,124 -57,100 Q-72,124 -86,96Z', fill: 'url(#gGhost)', stroke: C.fur2, 'stroke-width': 3 }, S.torso);
      el('ellipse', { cx: -36, cy: -184, rx: 20, ry: 10, fill: '#fff', opacity: .9, transform: 'rotate(-32 -36 -184)' }, S.torso);
    } else {
      el('ellipse', { cx: 0, cy: 20, rx: 76, ry: 84, fill: C.fur, ...line }, S.torso);
      el('ellipse', { cx: 0, cy: 30, rx: 46, ry: 50, fill: C.belly }, S.torso);
      el('ellipse', { cx: -36, cy: -24, rx: 16, ry: 8, fill: '#fff', opacity: .3, transform: 'rotate(-30 -36 -24)' }, S.torso);
    }
    el('path', { d: 'M-70,54 Q0,68 70,54 L64,98 Q32,106 10,96 Q0,90 -10,96 Q-32,106 -64,98Z', fill: C.pants }, S.torso);
    [[-34, 74], [0, 82], [34, 74], [-16, 92], [18, 92]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4.5, fill: C.dot, opacity: .9 }, S.torso));
    S.arms.forEach(a => {
      if (kind === 'powan') el('ellipse', { cx: 12, cy: 24, rx: 17, ry: 28, fill: C.fur, stroke: C.fur2, 'stroke-width': 2.5, transform: 'rotate(-30 12 24)' }, a.base);
      else {
        el('ellipse', { cx: 14, cy: 38, rx: 22, ry: 46, fill: C.fur, ...line, transform: 'rotate(-20 14 38)' }, a.base);
        el('circle', { cx: 30, cy: 80, r: 18, fill: C.fur, ...line }, a.base);
        el('ellipse', { cx: 31, cy: 84, rx: 8, ry: 6, fill: kind === 'bear' ? C.belly : '#ffc4d6' }, a.base);
      }
    });
    if (kind === 'bear') {
      [-1, 1].forEach(s => { el('circle', { cx: s * 58, cy: -190, r: 26, fill: C.fur }, S.head); el('circle', { cx: s * 58, cy: -190, r: 13, fill: C.belly }, S.head); });
      el('circle', { cx: 0, cy: -128, r: 80, fill: C.fur }, S.head);
      el('ellipse', { cx: -34, cy: -176, rx: 18, ry: 9, fill: '#fff', opacity: .3, transform: 'rotate(-30 -34 -176)' }, S.head);
      el('ellipse', { cx: 0, cy: -100, rx: 36, ry: 27, fill: C.belly }, S.head);
      el('ellipse', { cx: 0, cy: -112, rx: 11, ry: 8, fill: '#3a2a20' }, S.head);
      return dsFace(S.head, { ey: -142, edx: 32, cdx: 56, cy: -112, my: -100 });
    }
    if (kind === 'bunny') {
      [-1, 1].forEach(s => {
        el('ellipse', { cx: s * 30, cy: -238, rx: 21, ry: 54, fill: C.fur, stroke: C.fur2, 'stroke-width': 2.5, transform: `rotate(${s * 10} ${s * 30} -190)` }, S.ears);
        el('ellipse', { cx: s * 30, cy: -240, rx: 10, ry: 38, fill: '#ffc4d6', transform: `rotate(${s * 10} ${s * 30} -190)` }, S.ears);
      });
      el('circle', { cx: 0, cy: -128, r: 78, fill: C.fur, stroke: C.fur2, 'stroke-width': 2.5 }, S.head);
      el('ellipse', { cx: -34, cy: -174, rx: 18, ry: 9, fill: '#fff', opacity: .9, transform: 'rotate(-30 -34 -174)' }, S.head);
      el('ellipse', { cx: 0, cy: -114, rx: 7, ry: 5.5, fill: '#ff8fa3' }, S.head);
      return dsFace(S.head, { ey: -140, edx: 30, cdx: 52, cy: -112, my: -104 });
    }
    return dsFace(S.head, { ey: -142, edx: 30, cdx: 50, cy: -116, my: -110 });
  }

  /* ---------- clothes ---------- */
  function sideG(slot, side, x, y) { return el('g', { transform: `translate(${side * x} ${y}) scale(${side} 1)` }, slot); }
  const ITEMS = [
    /* tops */
    { id: 'tee', cat: 'top', tag: 'park', draw(S, P) {
      const g = P(S.top);
      el('path', { d: 'M-66,-46 Q-50,-64 -24,-62 Q0,-48 24,-62 Q50,-64 66,-46 L78,30 Q78,80 0,82 Q-78,80 -78,30Z', fill: '#ffd56b' }, g);
      el('path', { d: 'M-24,-62 Q0,-44 24,-62', stroke: '#ffb35c', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M0,-8 L7,6 L22,7 L11,17 L14,32 L0,24 L-14,32 L-11,17 L-22,7 L-7,6Z', fill: '#ff9a6b' }, g);
      el('ellipse', { cx: -44, cy: -26, rx: 12, ry: 7, fill: '#fff', opacity: .4, transform: 'rotate(-30 -44 -26)' }, g);
      S.arms.forEach(a => el('ellipse', { cx: 6, cy: 12, rx: 27, ry: 26, fill: '#ffd56b' }, P(a.sleeve)));
    } },
    { id: 'raincoat', cat: 'top', tag: 'rain', draw(S, P) {
      const g = P(S.top);
      el('path', { d: 'M-64,-48 Q-48,-64 -22,-62 L22,-62 Q48,-64 64,-48 L88,104 Q60,118 0,118 Q-60,118 -88,104Z', fill: '#ffd23f' }, g);
      el('path', { d: 'M0,-60 L0,116', stroke: '#f2b81c', 'stroke-width': 4 }, g);
      [-30, 10, 50].forEach(y => el('circle', { cx: 12, cy: y, r: 6, fill: '#fff' }, g));
      el('rect', { x: -60, y: 50, width: 34, height: 26, rx: 8, fill: '#f2b81c' }, g);
      el('path', { d: 'M-22,-62 Q0,-44 22,-62', stroke: '#fff3b0', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('ellipse', { cx: -46, cy: -24, rx: 12, ry: 7, fill: '#fff', opacity: .45, transform: 'rotate(-30 -46 -24)' }, g);
      S.arms.forEach(a => { const s = P(a.sleeve); el('ellipse', { cx: 14, cy: 34, rx: 25, ry: 46, fill: '#ffd23f', transform: 'rotate(-20 14 34)' }, s); el('ellipse', { cx: 27, cy: 70, rx: 19, ry: 8, fill: '#f2b81c', transform: 'rotate(-20 27 70)' }, s); });
    } },
    { id: 'sweater', cat: 'top', tag: 'snow', draw(S, P) {
      const g = P(S.top);
      el('path', { d: 'M-68,-46 Q-50,-64 -22,-62 Q0,-54 22,-62 Q50,-64 68,-46 L78,40 Q78,86 0,88 Q-78,86 -78,40Z', fill: '#ff7a8a' }, g);
      el('path', { d: 'M-76,8 L-60,-4 L-44,8 L-28,-4 L-12,8 L4,-4 L20,8 L36,-4 L52,8 L68,-4 L77,4', stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linejoin': 'round' }, g);
      [-40, 0, 40].forEach(x => el('circle', { cx: x, cy: 36, r: 5, fill: '#fff' }, g));
      el('ellipse', { cx: 0, cy: -58, rx: 30, ry: 11, fill: '#ff5c72' }, g);
      el('rect', { x: -78, y: 70, width: 156, height: 14, rx: 7, fill: '#ff5c72' }, g);
      S.arms.forEach(a => { const s = P(a.sleeve); el('ellipse', { cx: 14, cy: 34, rx: 25, ry: 46, fill: '#ff7a8a', transform: 'rotate(-20 14 34)' }, s); el('ellipse', { cx: 27, cy: 70, rx: 19, ry: 8, fill: '#ff5c72', transform: 'rotate(-20 27 70)' }, s); });
    } },
    { id: 'aloha', cat: 'top', tag: 'beach', draw(S, P) {
      const g = P(S.top);
      el('path', { d: 'M-66,-46 Q-50,-64 -24,-62 L0,-20 L24,-62 Q50,-64 66,-46 L78,30 Q78,80 0,82 Q-78,80 -78,30Z', fill: '#7fdcc0' }, g);
      el('path', { d: 'M-24,-62 L0,-20 L24,-62', stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linejoin': 'round' }, g);
      [[-44, -10, '#fff'], [40, 0, '#ff9ab3'], [-20, 44, '#ff9ab3'], [30, 50, '#fff'], [-56, 50, '#ffd56b']].forEach(([x, y, c]) => {
        for (let i = 0; i < 5; i++) { const a = i * Math.PI * .4; el('circle', { cx: (x + Math.cos(a) * 7).toFixed(1), cy: (y + Math.sin(a) * 7).toFixed(1), r: 5.5, fill: c }, g); }
        el('circle', { cx: x, cy: y, r: 4, fill: '#ffd56b' }, g);
      });
      S.arms.forEach(a => el('ellipse', { cx: 6, cy: 12, rx: 27, ry: 26, fill: '#7fdcc0' }, P(a.sleeve)));
    } },
    /* bottoms */
    { id: 'shorts', cat: 'bottom', tag: 'park', draw(S, P) {
      const g = P(S.bottom);
      el('path', { d: 'M-74,46 Q0,58 74,46 L72,120 Q44,128 8,120 L0,98 L-8,120 Q-44,128 -72,120Z', fill: '#8fb8ff' }, g);
      el('path', { d: 'M-74,48 Q0,60 74,48', stroke: '#6f9cf0', 'stroke-width': 8, fill: 'none' }, g);
      el('circle', { cx: 40, cy: 80, r: 7, fill: '#ffd56b' }, g);
    } },
    { id: 'tutu', cat: 'bottom', tag: 'any', fun: true, draw(S, P) {
      const g = P(S.bottom);
      for (let i = -4; i <= 4; i++) el('ellipse', { cx: i * 21, cy: 96, rx: 20, ry: 26, fill: '#ff9ac0' }, g);
      for (let i = -4; i <= 3; i++) el('ellipse', { cx: i * 21 + 10.5, cy: 88, rx: 20, ry: 24, fill: '#ffc4dc' }, g);
      el('rect', { x: -76, y: 48, width: 152, height: 20, rx: 10, fill: '#ff7aa8' }, g);
      [-50, 0, 50].forEach(x => el('circle', { cx: x, cy: 96, r: 3, fill: '#fff' }, g));
    } },
    { id: 'pants', cat: 'bottom', tag: 'snow', draw(S, P) {
      const g = P(S.bottom);
      el('path', { d: 'M-74,46 Q0,58 74,46 L66,156 Q40,162 12,156 L4,104 L-4,104 L-12,156 Q-40,162 -66,156Z', fill: '#6f8fd8' }, g);
      el('path', { d: 'M-74,48 Q0,60 74,48', stroke: '#5a78c4', 'stroke-width': 8, fill: 'none' }, g);
      [-1, 1].forEach(s => el('rect', { x: s > 0 ? 12 : -66, y: 142, width: 54, height: 14, rx: 6, fill: '#9fb8ee' }, g));
      el('path', { d: 'M-40,70 L-40,130 M40,70 L40,130', stroke: '#8aa6e6', 'stroke-width': 3, 'stroke-dasharray': '6 6' }, g);
    } },
    { id: 'swim', cat: 'bottom', tag: 'beach', draw(S, P) {
      const g = P(S.bottom);
      el('path', { d: 'M-74,46 Q0,58 74,46 L70,112 Q40,118 8,112 L0,94 L-8,112 Q-40,118 -70,112Z', fill: '#ff9a6b' }, g);
      [[-50, 70], [-20, 82], [14, 70], [46, 84], [-44, 100], [36, 104], [0, 60]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 6, fill: '#fff' }, g));
    } },
    /* shoes */
    { id: 'sneakers', cat: 'shoes', tag: 'park', draw(S, P) {
      [-1, 1].forEach(s => {
        const g = P(sideG(S.shoes, s, 38, 150));
        el('path', { d: 'M-28,4 Q-30,-18 -6,-18 L10,-16 Q32,-10 34,6 Q34,18 20,18 L-20,18 Q-30,18 -28,4Z', fill: '#ff7a8a' }, g);
        el('rect', { x: -30, y: 10, width: 64, height: 10, rx: 5, fill: '#fff' }, g);
        el('path', { d: 'M-4,-12 L8,-4 M2,-14 L14,-6', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      });
    } },
    { id: 'rainboots', cat: 'shoes', tag: 'rain', draw(S, P) {
      [-1, 1].forEach(s => {
        const g = P(sideG(S.shoes, s, 38, 150));
        el('path', { d: 'M-24,-50 L18,-50 L20,-6 Q36,-2 36,10 Q36,20 22,20 L-22,20 Q-28,20 -26,8Z', fill: '#7fd36b' }, g);
        el('rect', { x: -27, y: -56, width: 49, height: 12, rx: 6, fill: '#6cc45a' }, g);
        el('rect', { x: -16, y: -40, width: 7, height: 34, rx: 3.5, fill: '#fff', opacity: .45 }, g);
      });
    } },
    { id: 'snowboots', cat: 'shoes', tag: 'snow', draw(S, P) {
      [-1, 1].forEach(s => {
        const g = P(sideG(S.shoes, s, 38, 150));
        el('path', { d: 'M-24,-30 L18,-30 L20,-4 Q36,0 36,10 Q36,20 22,20 L-22,20 Q-28,20 -26,8Z', fill: '#b98a5f' }, g);
        [-22, -11, 0, 11, 20].forEach(x => el('circle', { cx: x, cy: -30, r: 8, fill: '#fff' }, g));
        el('rect', { x: -26, y: 14, width: 62, height: 7, rx: 3.5, fill: '#8a6240' }, g);
      });
    } },
    { id: 'flippers', cat: 'shoes', tag: 'beach', fun: true, draw(S, P) {
      [-1, 1].forEach(s => {
        const g = P(sideG(S.shoes, s, 38, 150));
        el('path', { d: 'M-20,-10 Q-22,-22 0,-20 L24,-16 Q74,-8 80,14 Q64,24 30,22 L-18,20 Q-26,14 -20,-10Z', fill: '#5fb2f0' }, g);
        el('path', { d: 'M30,-8 L62,10 M36,4 L70,16', stroke: '#9fd8ff', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      });
    } },
    /* hats */
    { id: 'cap', cat: 'hat', tag: 'park', draw(S, P) {
      const g = P(S.hat);
      el('path', { d: 'M-72,-170 Q-70,-230 0,-232 Q70,-230 72,-170 Q0,-186 -72,-170Z', fill: '#ff9a6b' }, g);
      el('path', { d: 'M8,-176 Q72,-190 108,-168 Q72,-156 8,-166Z', fill: '#ff7a5c' }, g);
      el('circle', { cx: 0, cy: -232, r: 8, fill: '#ff7a5c' }, g);
      el('ellipse', { cx: -30, cy: -212, rx: 14, ry: 7, fill: '#fff', opacity: .4, transform: 'rotate(-25 -30 -212)' }, g);
    } },
    { id: 'rainhat', cat: 'hat', tag: 'rain', draw(S, P) {
      const g = P(S.hat);
      el('ellipse', { cx: 0, cy: -172, rx: 100, ry: 22, fill: '#f2b81c' }, g);
      el('path', { d: 'M-60,-176 Q-58,-232 0,-234 Q58,-232 60,-176Z', fill: '#ffd23f' }, g);
      el('ellipse', { cx: -26, cy: -214, rx: 14, ry: 7, fill: '#fff', opacity: .5, transform: 'rotate(-25 -26 -214)' }, g);
    } },
    { id: 'beanie', cat: 'hat', tag: 'snow', draw(S, P) {
      const g = P(S.hat);
      el('path', { d: 'M-76,-160 Q-76,-236 0,-238 Q76,-236 76,-160Z', fill: '#8fb8ff' }, g);
      el('rect', { x: -80, y: -176, width: 160, height: 24, rx: 12, fill: '#c9a7ff' }, g);
      [-40, -14, 14, 40].forEach(x => el('path', { d: `M${x},-224 L${x},-180`, stroke: '#7aa4f0', 'stroke-width': 4, 'stroke-linecap': 'round' }, g));
      el('circle', { cx: 0, cy: -242, r: 20, fill: '#fff' }, g);
    } },
    { id: 'strawhat', cat: 'hat', tag: 'beach', draw(S, P) {
      const g = P(S.hat);
      el('ellipse', { cx: 0, cy: -168, rx: 118, ry: 26, fill: '#f5d27a' }, g);
      el('ellipse', { cx: 0, cy: -192, rx: 62, ry: 38, fill: '#ffe08a' }, g);
      el('rect', { x: -62, y: -186, width: 124, height: 14, rx: 6, fill: '#ff7a8a' }, g);
      el('path', { d: 'M-100,-166 Q0,-150 100,-166', stroke: '#e8bc5c', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '6 6' }, g);
    } },
    { id: 'pot', cat: 'hat', tag: 'any', fun: true, draw(S, P) {
      const g = P(S.hat);
      [-1, 1].forEach(s => el('rect', { x: s > 0 ? 62 : -90, y: -206, width: 28, height: 14, rx: 7, fill: '#9aa8b6' }, g));
      el('path', { d: 'M-68,-166 L-60,-232 Q0,-244 60,-232 L68,-166Z', fill: '#c7d2dc' }, g);
      el('rect', { x: -76, y: -176, width: 152, height: 16, rx: 8, fill: '#aab8c6' }, g);
      el('rect', { x: -44, y: -228, width: 12, height: 46, rx: 6, fill: '#fff', opacity: .55 }, g);
    } },
    { id: 'crown', cat: 'hat', tag: 'any', rare: true, draw(S, P) {
      const g = P(S.hat);
      el('path', { d: 'M-64,-168 L-70,-232 L-36,-204 L0,-246 L36,-204 L70,-232 L64,-168Z', fill: '#ffd23f' }, g);
      el('rect', { x: -66, y: -182, width: 132, height: 16, rx: 6, fill: '#ffb800' }, g);
      [[-70, -234, '#ff7a8a'], [0, -248, '#8fb8ff'], [70, -234, '#7fdcc0']].forEach(([x, y, c]) => el('circle', { cx: x, cy: y, r: 9, fill: c }, g));
      el('circle', { cx: 0, cy: -174, r: 6, fill: '#ff7a8a' }, g);
    } },
    /* the seasonal extra decides where we go */
    { id: 'balloon', cat: 'extra', tag: 'park', icon(g) {
      el('path', { d: 'M0,40 Q10,60 -2,80', stroke: '#9a8fb8', 'stroke-width': 3, fill: 'none' }, g);
      el('path', { d: 'M-6,40 L6,40 L0,50Z', fill: '#ff5c72' }, g);
      el('ellipse', { cx: 0, cy: 0, rx: 36, ry: 42, fill: '#ff7a8a' }, g);
      el('ellipse', { cx: -14, cy: -16, rx: 9, ry: 14, fill: '#fff', opacity: .55, transform: 'rotate(25 -14 -16)' }, g);
    }, draw(S, P) {
      const g = P(S.arms[1].held);
      el('path', { d: 'M30,74 Q52,0 40,-80 Q30,-130 64,-166', stroke: '#9a8fb8', 'stroke-width': 3, fill: 'none' }, g);
      el('path', { d: 'M58,-168 L70,-168 L64,-158Z', fill: '#ff5c72' }, g);
      el('ellipse', { cx: 64, cy: -208, rx: 36, ry: 42, fill: '#ff7a8a' }, g);
      el('ellipse', { cx: 50, cy: -224, rx: 9, ry: 14, fill: '#fff', opacity: .55, transform: 'rotate(25 50 -224)' }, g);
    } },
    { id: 'umbrella', cat: 'extra', tag: 'rain', icon(g) {
      el('path', { d: 'M0,-60 L0,40 Q0,56 -14,56 Q-26,56 -26,44', stroke: '#8a7ab8', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M-74,0 Q-70,-70 0,-74 Q70,-70 74,0 Q56,-14 37,0 Q18,-14 0,0 Q-18,-14 -37,0 Q-56,-14 -74,0Z', fill: '#8fb8ff' }, g);
      el('path', { d: 'M0,-74 Q-28,-50 -37,0 Q-18,-14 0,0Z M0,-74 Q28,-50 37,0 Q56,-14 74,0 Q66,-50 0,-74Z', fill: '#c9a7ff' }, g);
    }, draw(S, P) {
      const g = P(S.arms[1].held);
      el('path', { d: 'M30,-236 L30,78 Q30,96 16,96 Q4,96 4,84', stroke: '#8a7ab8', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M-104,-236 Q-100,-330 30,-336 Q160,-330 164,-236 Q131,-256 97,-236 Q64,-256 30,-236 Q-4,-256 -37,-236 Q-70,-256 -104,-236Z', fill: '#8fb8ff' }, g);
      el('path', { d: 'M30,-336 Q-20,-300 -37,-236 Q-4,-256 30,-236Z M30,-336 Q80,-300 97,-236 Q131,-256 164,-236 Q150,-300 30,-336Z', fill: '#c9a7ff' }, g);
      el('circle', { cx: 30, cy: -340, r: 7, fill: '#8a7ab8' }, g);
      el('path', { d: 'M-60,-268 Q-30,-312 10,-322', stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', opacity: .45 }, g);
    } },
    { id: 'scarf', cat: 'extra', tag: 'snow', draw(S, P) {
      const g = P(S.scarf);
      el('rect', { x: 22, y: -50, width: 30, height: 84, rx: 10, fill: '#ff7a8a', transform: 'rotate(-8 37 -50)' }, g);
      [-20, 0].forEach(y => el('rect', { x: 22, y: y, width: 30, height: 8, fill: '#fff', transform: 'rotate(-8 37 -50)' }, g));
      el('path', { d: 'M24,30 L24,44 M33,30 L33,46 M42,30 L42,44 M50,28 L51,42', stroke: '#ff7a8a', 'stroke-width': 4, 'stroke-linecap': 'round', transform: 'rotate(-8 37 -50)' }, g);
      el('path', { d: 'M-66,-66 Q0,-38 66,-66 Q72,-46 60,-36 Q0,-12 -60,-36 Q-72,-46 -66,-66Z', fill: '#ff7a8a' }, g);
      el('path', { d: 'M-60,-50 Q0,-24 60,-50', stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-dasharray': '10 10' }, g);
    } },
    { id: 'ring', cat: 'extra', tag: 'beach', draw(S, P) {
      el('path', { d: 'M-102,40 A102,32 0 0 1 102,40', stroke: '#ff7a8a', 'stroke-width': 26, fill: 'none', 'stroke-linecap': 'round' }, P(S.back));
      const g = P(S.ring);
      el('path', { d: 'M-102,40 A102,32 0 0 0 102,40', stroke: '#ff7a8a', 'stroke-width': 28, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M-102,40 A102,32 0 0 0 102,40', stroke: '#fff', 'stroke-width': 28, fill: 'none', 'stroke-dasharray': '34 34', 'stroke-dashoffset': 17 }, g);
      el('path', { d: 'M-80,52 A90,24 0 0 0 0,70', stroke: '#fff', 'stroke-width': 5, fill: 'none', opacity: .55, 'stroke-linecap': 'round' }, g);
    } }
  ];
  const byId = id => ITEMS.find(i => i.id === id);
  function dsDraw(item, S) { const out = []; item.draw(S, slot => { const g = el('g', { class: 'tb' }, slot); out.push(g); return g; }); return out; }

  /* ---------- outdoor scenes ---------- */
  function dsSky(g, defs, id, a, b) {
    if (defs && !defs.querySelector('#' + id)) {
      const lg = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': a }, lg); el('stop', { offset: 1, 'stop-color': b }, lg);
    }
    el('rect', { x: -800, y: -900, width: 2000, height: 1500, fill: `url(#${id})` }, g);
  }
  function dsCloud(g, x, y, s, c = '#fff') {
    const o = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, g);
    [[-30, 6, 22], [0, -6, 30], [32, 4, 24], [0, 14, 22]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: c }, o));
    return o;
  }

  const dressupToy = {
    id: 'dressup', name: 'おきがえ', color: '#ffb6cf',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#ffe2ec' }, g);
      el('rect', { x: -80, y: 46, width: 160, height: 40, fill: '#f6dcc2' }, g);
      const c = el('g', { transform: 'translate(0 18) scale(.3)' }, g);
      const S = dsSlots(c);
      const f = dsBase(S, 'bear'); f.set('happy');
      ['tee', 'shorts', 'sneakers', 'cap'].forEach(id => dsDraw(byId(id), S));
      [[-56, -50], [58, -30]].forEach(([x, y]) => el('path', { d: `M${x},${y - 12} Q${x + 2},${y - 2} ${x + 12},${y} Q${x + 2},${y + 2} ${x},${y + 12} Q${x - 2},${y + 2} ${x - 12},${y} Q${x - 2},${y - 2} ${x},${y - 12}Z`, fill: '#ffd56b' }, g));
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      /* ---------- defs ---------- */
      const wp = el('pattern', { id: 'dressup-wall', width: 56, height: 56, patternUnits: 'userSpaceOnUse' }, defs);
      const wpBg = el('rect', { width: 56, height: 56, fill: '#d6f3e4' }, wp);
      const wpA = el('path', { d: 'M14,10 C10,6 4,9 7,14 L14,20 L21,14 C24,9 18,6 14,10Z', fill: '#bfe9d2' }, wp);
      const wpB = el('circle', { cx: 42, cy: 42, r: 4, fill: '#bfe9d2' }, wp);
      const winClip = el('clipPath', { id: 'dressup-win' }, defs);
      el('rect', { x: 256, y: 76, width: 108, height: 104, rx: 14 }, winClip);
      const mClip = el('clipPath', { id: 'dressup-glass' }, defs);
      el('ellipse', { cx: 0, cy: 0, rx: 50, ry: 96 }, mClip);

      /* ---------- bedroom ---------- */
      const room = el('g', {}, svg);
      el('rect', { x: -800, y: -900, width: 2000, height: 1372, fill: 'url(#dressup-wall)' }, room);
      el('rect', { x: -800, y: 452, width: 2000, height: 20, fill: '#fff', opacity: .5 }, room);
      const floor = el('rect', { x: -800, y: 470, width: 2000, height: 1400, fill: '#f3d9b8' }, room);
      const boards = [];
      [500, 540, 590, 650, 720].forEach(y => boards.push(el('rect', { x: -800, y, width: 2000, height: 3, fill: '#e8c9a2' }, room)));
      const far = el('g', { style: 'transition:translate .6s' }, room);
      // window with drifting clouds and swaying curtains
      el('rect', { x: 248, y: 68, width: 124, height: 120, rx: 18, fill: '#fff', filter: 'url(#soft)' }, far);
      const winIn = el('g', { 'clip-path': 'url(#dressup-win)' }, far);
      el('rect', { x: 256, y: 76, width: 108, height: 104, fill: '#a8e0ff' }, winIn);
      el('circle', { cx: 340, cy: 100, r: 14, fill: '#ffe066' }, winIn);
      const winClouds = [dsCloud(winIn, 280, 120, .45), dsCloud(winIn, 340, 150, .35)];
      el('rect', { x: 307, y: 76, width: 6, height: 104, fill: '#fff' }, far);
      el('rect', { x: 256, y: 126, width: 108, height: 6, fill: '#fff' }, far);
      el('rect', { x: 238, y: 58, width: 144, height: 10, rx: 5, fill: '#c9a7ff' }, far);
      const curtains = [-1, 1].map(s => {
        const o = el('g', { transform: `translate(${s < 0 ? 252 : 368} 62)` }, far);
        const c = el('g', { style: 'transform-box:fill-box;transform-origin:50% 0%' }, o);
        el('path', { d: `M${-14 * s},0 L${14 * s},0 Q${18 * s},70 ${6 * s},128 Q${-6 * s},136 ${-16 * s},128 Q${-22 * s},60 ${-14 * s},0Z`, fill: '#ff9ab3' }, c);
        c.animate([{ transform: 'rotate(-2deg)' }, { transform: 'rotate(2deg)' }], { duration: 2400 + s * 300, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        return c;
      });
      // star garland
      el('path', { d: 'M96,92 Q150,128 210,96', stroke: '#c9a7ff', 'stroke-width': 2.5, fill: 'none' }, far);
      [[112, 104], [140, 116], [170, 114], [198, 102]].forEach(([x, y], i) => {
        const o = el('g', { transform: `translate(${x} ${y + 10})` }, far);
        el('path', { d: 'M0,-10 L3,-3 L10,-3 L4,2 L6,10 L0,5 L-6,10 L-4,2 L-10,-3 L-3,-3Z', fill: PARTY[i % 6], class: 'twinkle', style: `animation-delay:-${i * .6}s` }, o);
      });
      // wardrobe
      const ward = el('g', {}, room);
      el('rect', { x: 4, y: 232, width: 96, height: 236, rx: 12, fill: '#e8b98a', filter: 'url(#soft)' }, ward);
      el('rect', { x: 12, y: 244, width: 80, height: 214, rx: 8, fill: '#a8744f' }, ward);
      el('rect', { x: 14, y: 262, width: 76, height: 5, rx: 2.5, fill: '#d9d2e8' }, ward);
      const hangers = [];
      [['#ffd56b', 26], ['#7fdcc0', 52], ['#ff7a8a', 78]].forEach(([c, x], i) => {
        const o = el('g', { transform: `translate(${x} 264)` }, ward);
        const h = el('g', { style: 'transform-box:fill-box;transform-origin:50% 0%' }, o);
        el('path', { d: 'M0,0 L0,8 M-12,16 L0,8 L12,16', stroke: '#d9d2e8', 'stroke-width': 2.5, fill: 'none' }, h);
        el('path', { d: 'M-14,14 L14,14 L18,60 L-18,60Z', fill: c }, h);
        h.animate([{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], { duration: 1800 + i * 400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -i * 500 });
        hangers.push(h);
      });
      el('rect', { x: 14, y: 360, width: 76, height: 40, rx: 6, fill: '#c98f62' }, ward);
      el('circle', { cx: 52, cy: 380, r: 5, fill: '#ffd56b' }, ward);
      el('rect', { x: 14, y: 404, width: 76, height: 48, rx: 6, fill: '#c98f62' }, ward);
      el('circle', { cx: 52, cy: 428, r: 5, fill: '#ffd56b' }, ward);
      // door (the friend walks out here)
      el('rect', { x: 300, y: 240, width: 96, height: 232, rx: 12, fill: '#fff', filter: 'url(#soft)' }, room);
      const doorway = el('rect', { x: 308, y: 248, width: 80, height: 224, rx: 8, fill: '#fff3b0' }, room);
      const doorO = el('g', { transform: 'translate(388 248)' }, room);
      const door = el('g', {}, doorO);
      el('rect', { x: -80, y: 0, width: 80, height: 224, rx: 8, fill: '#ffc89a' }, door);
      el('rect', { x: -70, y: 14, width: 60, height: 80, rx: 8, fill: '#ffd8b4' }, door);
      el('rect', { x: -70, y: 110, width: 60, height: 96, rx: 8, fill: '#ffd8b4' }, door);
      el('circle', { cx: -66, cy: 120, r: 6, fill: '#ffd56b' }, door);
      // rug and toy ball
      const rug = el('ellipse', { cx: 200, cy: 534, rx: 150, ry: 34, fill: '#ffd56b', opacity: .85 }, room);
      el('ellipse', { cx: 200, cy: 534, rx: 124, ry: 24, fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '8 8', opacity: .8 }, room);
      const ballO = el('g', { transform: 'translate(54 540)' }, room);
      const ball = el('g', { class: 'tb' }, ballO);
      el('circle', { r: 24, fill: '#ff9ab3' }, ball);
      el('path', { d: 'M-24,0 Q0,-14 24,0 M-24,0 Q0,14 24,0', stroke: '#fff', 'stroke-width': 4, fill: 'none' }, ball);
      el('ellipse', { cx: -8, cy: -12, rx: 7, ry: 4, fill: '#fff', opacity: .6 }, ball);

      const sceneL = el('g', {}, svg);
      const charL = el('g', {}, svg);
      const mirrorL = el('g', {}, svg);
      const trayL = el('g', {}, svg);
      const fxL = el('g', { 'pointer-events': 'none' }, svg);
      const ghostL = el('g', {}, svg);
      const ghost = ctx.ghost(ghostL, { x: 336, y: 124, s: .5 });
      const iris = el('circle', { cx: 200, cy: 380, r: 0, fill: '#ffb6cf', 'pointer-events': 'none' }, svg);

      /* ---------- state ---------- */
      const CX = 200, CY = 372, CS = .9;
      let round = 0, kind = 'bear', ch = null, phase = 'enter', catI = 0, worn = {}, cards = [], drag = null, rare = false;
      let scene = null, dest = 'park', lookP = [200, 400];
      const squash = (node, a = 1.12, ms = 380) => node.animate([{ transform: 'scale(1)' }, { transform: `scale(${a},${2 - a})` }, { transform: `scale(${2 - a + .04},${a - .02})` }, { transform: 'scale(1)' }], { duration: ms, easing: 'ease-out' });

      /* ---------- the friend ---------- */
      function makeFriend(k) {
        const outer = el('g', {}, charL);
        el('ellipse', { cx: 0, cy: 166, rx: 86, ry: 14, fill: INK, opacity: .12 }, outer);
        const breath = el('g', {}, outer);
        const body = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, breath);
        const S = dsSlots(body);
        const face = dsBase(S, k);
        if (k === 'powan') S.hat.setAttribute('transform', 'translate(0 -12)');
        breath.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.015,.985)' }], { duration: 1500, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        let X = CX, Y = CY, SC = CS, R = 0;
        const f = {
          kind: k, outer, body, S, face, parts: [],
          get x() { return X; }, get y() { return Y; }, get s() { return SC; },
          place(x, y, s = SC, r = 0) { X = x; Y = y; SC = s; R = r; outer.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(1)}) scale(${s.toFixed(3)})`); },
          arm(i, deg) { S.arms[i].rot.setAttribute('transform', `rotate(${deg.toFixed(1)})`); }
        };
        f.place(X, Y, SC);
        return f;
      }
      function cheer(text, voice = true) { if (kind === 'powan') say2(text); else ghost.talk(text, voice); }
      function say2(text) { if (!ch) return; ctx.bubble(text, ch.x, ch.y - 250 * ch.s); say(text); }
      function lookAt(x, y) {
        lookP = [x, y];
        if (ch) ch.face.look(clamp((x - ch.x) / 30, -6, 6), clamp((y - (ch.y - 130 * ch.s)) / 70, -4, 6));
        far.style.translate = `${clamp((200 - x) / 50, -4, 4).toFixed(1)}px 0px`;
      }
      function happyFor(ms) { if (!ch) return; ch.face.set('happy'); const me = ch; ctx.after(ms, () => { if (ch === me && phase !== 'party') me.face.set('normal'); }); }
      (function blinkLoop() { ctx.after(rand(2000, 5000), () => { if (ch) ch.face.blink(); blinkLoop(); }); })();
      function wave(i = 1, n = 3) {
        if (!ch) return;
        const me = ch, sgn = i ? -1 : 1;
        ctx.tween(260 * n, k => me.arm(i, sgn * (Math.sin(k * Math.PI) * 110 + Math.sin(k * Math.PI * n * 2) * 18 * Math.sin(k * Math.PI))), () => me.arm(i, 0), k => k);
      }
      function walk(x0, y0, s0, x1, y1, s1, ms, done, steps = 4) {
        const me = ch;
        ctx.tween(ms, k => {
          const hop = Math.abs(Math.sin(k * Math.PI * steps)) * 12;
          me.place(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k - hop, s0 + (s1 - s0) * k, Math.sin(k * Math.PI * steps) * 4);
          const sw = Math.sin(k * Math.PI * steps) * 16;
          me.arm(0, sw); me.arm(1, -sw);
        }, () => { me.place(x1, y1, s1); me.arm(0, 0); me.arm(1, 0); if (done) done(); }, k => k);
        for (let i = 0; i < steps; i++) ctx.after(ms * (i + .5) / steps, () => {
          if (worn.shoes && worn.shoes.id === 'flippers') A.sfx('flip', { vol: .5, rate: rand(.8, 1) }) || A.click();
          else if (scene && dest === 'park') A.sfx(i % 2 ? 'grass' : 'grass2', { vol: .5 });
          else if (scene && dest === 'snow') A.noise({ type: 'lowpass', from: 900, dur: .14, vol: .1 });
          else A.sfx('woodblock', { vol: .25, rate: i % 2 ? 1.12 : 1 }) || A.osc(i % 2 ? 330 : 392, { type: 'triangle', r: .08, vol: .1 });
        });
      }

      /* ---------- tray ---------- */
      const trayO = el('g', { transform: 'translate(0 260)' }, trayL);
      el('rect', { x: 8, y: 594, width: 384, height: 160, rx: 34, fill: '#ffffff', opacity: .55 }, trayO);
      el('rect', { x: 16, y: 602, width: 368, height: 144, rx: 28, fill: '#ffd1e0' }, trayO);
      el('rect', { x: 30, y: 610, width: 120, height: 8, rx: 4, fill: '#fff', opacity: .5 }, trayO);
      const cardL = el('g', {}, trayO);
      trayO.addEventListener('pointerdown', e => {
        if (phase !== 'pick') return;
        e.stopPropagation();
        const p = ctx.point(e);
        const free = cards.filter(c => !c.taken).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x));
        if (free[0]) { grab(free[0], e); release(); }
      });
      let trayY = 260;
      function trayTo(y, ms, done, ease = easeOut) {
        const y0 = trayY;
        ctx.tween(ms, k => { trayY = y0 + (y - y0) * k; trayO.setAttribute('transform', `translate(0 ${trayY.toFixed(1)})`); }, done, ease);
      }
      function choices(cat) {
        let pool = ITEMS.filter(i => i.cat === cat && !i.rare);
        if (cat === 'extra') return pool.sort(() => Math.random() - .5);
        pool = pool.sort(() => Math.random() - .5).slice(0, 3);
        if (cat === 'hat' && rare) pool[1] = byId('crown');
        return pool;
      }
      function fitArt(item, parent) {
        const holder = el('g', {}, parent);
        const art = el('g', {}, holder);
        const S = dsSlots(art);
        dsDraw(item, S);
        let bb = art.getBBox();
        const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
        if (item.icon) { art.replaceChildren(); item.icon(art); bb = art.getBBox(); }
        const ix = bb.x + bb.width / 2, iy = bb.y + bb.height / 2;
        art.setAttribute('transform', `translate(${(-ix).toFixed(1)} ${(-iy).toFixed(1)})`);
        return { holder, cx, cy, fit: Math.min(94 / bb.width, 92 / bb.height, 1) };
      }
      function buildTray() {
        cardL.replaceChildren(); cards = [];
        const cat = CATS[catI], list = choices(cat);
        const n = list.length, w = n === 4 ? 86 : 108, gap = n === 4 ? 92 : 120, x0 = 200 - gap * (n - 1) / 2;
        list.forEach((item, i) => {
          const x = x0 + gap * i, y = 676;
          const o = el('g', { transform: `translate(${x} ${y})` }, cardL);
          const inner = el('g', { class: 'tb' }, o);
          el('rect', { x: -w / 2, y: -58, width: w, height: 116, rx: 26, fill: '#fff' }, inner);
          if (item.rare) el('rect', { x: -w / 2 + 4, y: -54, width: w - 8, height: 108, rx: 22, fill: '#fff6c8' }, inner);
          el('ellipse', { cx: -w / 2 + 22, cy: -40, rx: 12, ry: 6, fill: '#ffe2ec' }, inner);
          const a = fitArt(item, inner);
          a.holder.setAttribute('transform', `scale(${a.fit.toFixed(3)})`);
          const card = { item, x, y, o, inner, art: a };
          o.addEventListener('pointerdown', e => { e.stopPropagation(); grab(card, e); });
          cards.push(card);
        });
      }
      function showTray(first) {
        buildTray();
        trayTo(0, 480, () => {
          phase = 'pick';
          cards.forEach((c, i) => ctx.after(i * 90, () => { squash(c.inner, 1.1, 340); A.sfx('blink', { vol: .35, rate: 1 + i * .12 }); }));
        }, easeBack);
        A.sfx('rise', { vol: .4 }) || A.sfx('whoosh', { vol: .4 });
        if (!first && catI === CATS.length - 1) ctx.after(300, () => cheer('どこに いく？'));
      }
      ctx.every(2600, () => {
        if (phase !== 'pick') return;
        cards.forEach((c, i) => ctx.after(i * 120, () => { if (phase === 'pick' && !c.taken) squash(c.inner, 1.08, 320); }));
        const c = cards[Math.floor(cards.length / 2)];
        if (c) ctx.sparkle(c.x, c.y - 20 + trayY, 2, 40, '#fff6b0');
      });

      /* ---------- picking + putting on ---------- */
      function grab(card, e) {
        if (phase !== 'pick' || card.taken) return;
        phase = 'drag'; card.taken = true; haptic(10);
        const p = ctx.point(e);
        A.sfx('pop', { vol: .5, rate: 1.2 });
        const fly = el('g', {}, fxL);
        fly.appendChild(card.art.holder);
        card.art.holder.setAttribute('transform', '');
        const inner = el('g', { class: 'tb' }, fly);
        inner.appendChild(card.art.holder);
        squash(inner, 1.2, 300);
        drag = { card, fly, x: card.x, y: card.y + trayY, s: card.art.fit * 1.25, moved: 0, p };
        placeFly();
        card.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(.85)' }], { duration: 200, fill: 'forwards' });
      }
      function placeFly() { drag.fly.setAttribute('transform', `translate(${drag.x.toFixed(1)} ${drag.y.toFixed(1)}) scale(${drag.s.toFixed(3)})`); }
      function release() {
        if (!drag) return;
        const d = drag; drag = null;
        const item = d.card.item, x0 = d.x, y0 = d.y, s0 = d.s;
        const tx = ch.x + d.card.art.cx * ch.s, ty = ch.y + d.card.art.cy * ch.s, s1 = ch.s;
        A.sfx('whoosh', { vol: .35, rate: 1.3 });
        ctx.tween(360, k => {
          d.fly.setAttribute('transform', `translate(${(x0 + (tx - x0) * k).toFixed(1)} ${(y0 + (ty - y0) * k - Math.sin(k * Math.PI) * 60).toFixed(1)}) scale(${(s0 + (s1 - s0) * k).toFixed(3)})`);
        }, () => { d.fly.remove(); putOn(item, tx, ty); }, easeInOut);
      }
      const REACT = ['にあう？', 'かわいい！', 'すてき！', 'ぴったり！'];
      function putOn(item, x, y) {
        phase = 'busy';
        worn[item.cat] = item;
        const parts = dsDraw(item, ch.S);
        parts.forEach(g => g.animate([{ transform: 'scale(1.35,.7)' }, { transform: 'scale(.88,1.14)', offset: .45 }, { transform: 'scale(1.04,.97)', offset: .75 }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' }));
        squash(ch.body, 1.07, 420);
        A.sfx('blink', { vol: .8, rate: rand(.95, 1.2) }) || A.pop();
        A.osc(mtof(PENTA[catI + 4] + 12), { type: 'triangle', r: .25, vol: .08, when: .05, wet: .4 });
        haptic(16);
        ctx.sparkle(x, y, 5, 44);
        ctx.after(150, () => ctx.sparkle(x, y, 3, 60, '#ffffff'));
        const me = ch;
        me.face.set('wow');
        ctx.after(220, () => { if (ch !== me) return; me.face.set('normal'); me.face.look(0, 7); });
        ctx.after(700, () => {
          if (ch !== me) return;
          me.face.look(0, 2); me.face.set('happy');
          if (item.fun) { A.sfx(item.id === 'pot' ? 'boyoing' : 'flexatone', { vol: .5 }) || A.sfx('boing2', { vol: .5 }); A.giggle(); say2('おもしろい！'); me.body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0deg)' }], { duration: 500 }); }
          else if (item.rare) { A.sfx('coin', { vol: .6 }); say2('ぴかぴか！'); ctx.sparkle(x, y, 8, 70, '#ffe066'); }
          else if (catI === 0 || Math.random() < .55) say2(catI === 0 ? REACT[0] : pick(REACT));
          else cheer(pick(['いいね！', 'かわいい！', 'すてき！']));
        });
        ctx.after(1250, () => {
          if (ch !== me) return;
          me.face.set('normal');
          catI++;
          if (catI < CATS.length) trayTo(260, 300, () => showTray(false), easeIn);
          else { trayTo(260, 360, null, easeIn); mirrorMoment(); }
        });
      }

      /* ---------- mirror, door, outside ---------- */
      const mirO = el('g', { transform: 'translate(-120 380)' }, mirrorL);
      el('path', { d: 'M-30,110 L-44,160 M30,110 L44,160', stroke: '#e8b98a', 'stroke-width': 8, 'stroke-linecap': 'round' }, mirO);
      el('ellipse', { cx: 0, cy: 0, rx: 62, ry: 110, fill: '#ffc4d2', filter: 'url(#soft)' }, mirO);
      el('ellipse', { cx: 0, cy: 0, rx: 50, ry: 96, fill: '#dff3ff' }, mirO);
      const mirIn = el('g', { 'clip-path': 'url(#dressup-glass)' }, mirO);
      const reflect = el('use', { href: '#dressup-body', transform: 'translate(0 26) scale(-.36 .36)' }, mirIn);
      const mGlint = el('path', { d: 'M-30,-120 L-10,-120 L-50,120 L-70,120Z', fill: '#fff', opacity: .5 }, mirIn);
      el('ellipse', { cx: -22, cy: -60, rx: 8, ry: 20, fill: '#fff', opacity: .6, transform: 'rotate(20 -22 -60)' }, mirO);
      const flash = el('rect', { x: -800, y: -900, width: 2000, height: 2600, fill: '#fff', opacity: 0, 'pointer-events': 'none' }, fxL);
      let mirX = -120;
      function mirTo(x, ms, done) { const x0 = mirX; ctx.tween(ms, k => { mirX = x0 + (x - x0) * k; mirO.setAttribute('transform', `translate(${mirX.toFixed(1)} 380)`); }, done, easeBack); }
      function mirrorMoment() {
        phase = 'show';
        ch.body.id = 'dressup-body';
        reflect.setAttribute('href', '#dressup-body');
        A.sfx('whoosh2', { vol: .45 });
        mirTo(78, 560, () => {
          A.sfx('harpup', { vol: .5 }) || A.sfx('sparkle', { vol: .55 });
          ctx.tween(700, k => mGlint.setAttribute('transform', `translate(${(-40 + 120 * k).toFixed(0)} 0)`));
          ctx.sparkle(78, 360, 4, 50, '#ffffff');
        });
        walk(CX, CY, CS, 240, CY, CS, 420, () => {
          ch.face.look(-6, 0); ch.face.set('happy');
          squash(ch.body, 1.1, 460);
          cheer('すてき！');
          ctx.after(600, () => { A.sfx('shutter', { vol: .6 }); flash.animate([{ opacity: 0 }, { opacity: .8 }, { opacity: 0 }], { duration: 300 }); wave(1, 2); });
        }, 2);
        ctx.after(2300, () => {
          mirTo(-120, 420);
          ch.face.look(4, 0); ch.face.set('normal');
          walkOut();
        });
      }
      function walkOut() {
        A.sfx('creak', { vol: .35, rate: 1.2 });
        ctx.tween(500, k => door.setAttribute('transform', `scale(${(1 - .82 * k).toFixed(3)} 1)`), null, easeOut);
        ctx.after(300, () => say2('いってきまーす！'));
        ctx.after(500, () => walk(240, CY, CS, 348, 400, .52, 1100, () => {
          ctx.tween(240, k => ch.outer.setAttribute('opacity', (1 - k).toFixed(2)), () => {
            irisClose(348, 380, () => {
              door.setAttribute('transform', '');
              buildOutside(DEST[worn.extra.id]);
              ch.outer.setAttribute('opacity', 1);
              ch.place(-90, 400, .95);
              irisOpen(() => walk(-90, 400, .95, 200, 400, .95, 900, play, 4));
            });
          });
        }, 5));
      }
      function irisClose(x, y, done) {
        iris.setAttribute('cx', x); iris.setAttribute('cy', y); iris.setAttribute('opacity', 1);
        A.sfx('whoosh', { vol: .4 });
        ctx.tween(480, k => iris.setAttribute('r', (k * 950).toFixed(0)), done, easeIn);
      }
      function irisOpen(done) {
        ctx.tween(420, k => iris.setAttribute('opacity', (1 - k).toFixed(2)), () => { iris.setAttribute('r', 0); if (done) done(); });
      }

      function buildOutside(d) {
        dest = d;
        trayL.style.display = 'none';
        if (scene) scene.g.remove();
        const g = el('g', {}, sceneL);
        const sc = scene = { g, d, parts: [], clouds: [], fly: [] };
        if (d === 'park') {
          dsSky(g, defs, 'dressup-sky-park', '#8fd3ff', '#e6f7ff');
          const sunO = el('g', { transform: 'translate(84 112)' }, g);
          const rays = el('g', { class: 'tb' }, sunO);
          for (let i = 0; i < 10; i++) el('rect', { x: -4, y: -66, width: 8, height: 20, rx: 4, fill: '#ffd56b', transform: `rotate(${i * 36})` }, rays);
          rays.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 16000, iterations: Infinity });
          el('circle', { r: 38, fill: '#ffe066' }, sunO);
          sc.clouds = [dsCloud(g, 220, 150, .9), dsCloud(g, 340, 210, .6)];
          el('ellipse', { cx: 90, cy: 470, rx: 260, ry: 110, fill: '#b5ebaa' }, g);
          el('ellipse', { cx: 360, cy: 480, rx: 220, ry: 100, fill: '#a3e397' }, g);
          [[60, 380, 1], [350, 400, .8]].forEach(([x, y, s]) => {
            el('rect', { x: x - 8 * s, y: y, width: 16 * s, height: 70 * s, rx: 6, fill: '#b98a5f' }, g);
            el('circle', { cx: x, cy: y - 10 * s, r: 44 * s, fill: '#6cc45a' }, g);
            el('circle', { cx: x - 14 * s, cy: y - 24 * s, r: 14 * s, fill: '#8fdc7a' }, g);
          });
          el('rect', { x: -800, y: 470, width: 2000, height: 1400, fill: '#8fdc7a' }, g);
          for (let i = 0; i < 9; i++) { const x = 20 + i * 45 + rand(-8, 8), y = rand(560, 740); el('circle', { cx: x, cy: y, r: 7, fill: PARTY[i % 6] }, g); el('circle', { cx: x, cy: y, r: 3, fill: '#fff' }, g); }
          for (let i = 0; i < 2; i++) {
            const b = el('g', {}, g); const w = el('g', { class: 'tb' }, b);
            [-1, 1].forEach(s => el('ellipse', { cx: s * 9, cy: 0, rx: 9, ry: 12, fill: i ? '#c9a7ff' : '#ffb38a' }, w));
            el('rect', { x: -2, y: -8, width: 4, height: 16, rx: 2, fill: INK }, w);
            w.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.3)' }], { duration: 180, iterations: Infinity, direction: 'alternate' });
            sc.fly.push({ node: b, ph: i * 3, r: 70 + i * 30, cx: i ? 290 : 110, cy: i ? 300 : 260 });
          }
        } else if (d === 'rain') {
          dsSky(g, defs, 'dressup-sky-rain', '#9fb2d8', '#dbe4f5');
          sc.clouds = [dsCloud(g, 90, 90, 1.2, '#c4cfe6'), dsCloud(g, 300, 120, 1, '#b4c1de'), dsCloud(g, 200, 60, .8, '#d2dbee')];
          [[30, 360, 70, 110, '#c9b8e8'], [110, 330, 80, 140, '#b8cbe8'], [300, 350, 90, 120, '#e8c4d4'], [370, 380, 60, 90, '#c4e0d4']].forEach(([x, y, w, h, c]) => {
            el('rect', { x: x - w / 2, y, width: w, height: h, rx: 10, fill: c }, g);
            el('path', { d: `M${x - w / 2 - 6},${y + 4} L${x},${y - 34} L${x + w / 2 + 6},${y + 4}Z`, fill: c, opacity: .8 }, g);
            el('rect', { x: x - 10, y: y + 24, width: 20, height: 22, rx: 4, fill: '#fff3b0' }, g);
          });
          el('rect', { x: -800, y: 470, width: 2000, height: 1400, fill: '#9fc9a0' }, g);
          sc.puddles = [[90, 600, 70], [300, 640, 80], [200, 720, 60]].map(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r, ry: r * .22, fill: '#a8d8f5' }, g));
          const frog = makeAnimal('frog', g, 340, 560, .5); frog.float(true);
          sc.frog = frog;
          sc.rain = [];
          for (let i = 0; i < 34; i++) sc.rain.push({ node: el('path', { d: 'M0,0 L-3,14', stroke: '#e8f4ff', 'stroke-width': 3, 'stroke-linecap': 'round' }, g), x: rand(-20, 420), y: rand(-60, 760), v: rand(520, 700) });
        } else if (d === 'snow') {
          dsSky(g, defs, 'dressup-sky-snow', '#bcd6f2', '#f2f8ff');
          sc.clouds = [dsCloud(g, 100, 110, .9), dsCloud(g, 300, 80, .7)];
          el('ellipse', { cx: 60, cy: 470, rx: 240, ry: 110, fill: '#f4f8ff' }, g);
          el('ellipse', { cx: 360, cy: 460, rx: 200, ry: 110, fill: '#e8f0ff' }, g);
          [[40, 420, 1], [100, 440, .7], [370, 420, .9]].forEach(([x, y, s]) => {
            el('rect', { x: x - 6 * s, y: y, width: 12 * s, height: 30 * s, fill: '#a8744f' }, g);
            el('path', { d: `M${x},${y - 90 * s} L${x + 40 * s},${y + 4} L${x - 40 * s},${y + 4}Z`, fill: '#5fae8a' }, g);
            el('path', { d: `M${x},${y - 90 * s} L${x + 18 * s},${y - 50 * s} Q${x},${y - 42 * s} ${x - 18 * s},${y - 50 * s}Z`, fill: '#fff' }, g);
          });
          el('rect', { x: -800, y: 470, width: 2000, height: 1400, fill: '#ffffff' }, g);
          [[60, 640, 90], [250, 700, 120], [170, 590, 70]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r, ry: r * .2, fill: '#e6eefc' }, g));
          const sm = el('g', { transform: 'translate(330 560)' }, g);
          el('circle', { cx: 0, cy: 0, r: 34, fill: '#fff', stroke: '#dbe6f5', 'stroke-width': 3 }, sm);
          el('circle', { cx: 0, cy: -48, r: 24, fill: '#fff', stroke: '#dbe6f5', 'stroke-width': 3 }, sm);
          [-8, 8].forEach(x => el('circle', { cx: x, cy: -52, r: 3, fill: INK }, sm));
          el('path', { d: 'M0,-46 L16,-42 L0,-40Z', fill: '#ff9a6b' }, sm);
          el('rect', { x: -20, y: -84, width: 40, height: 12, rx: 3, fill: '#8a7ab8' }, sm);
          el('rect', { x: -14, y: -100, width: 28, height: 20, rx: 3, fill: '#8a7ab8' }, sm);
          sc.snowman = sm;
          sc.flakes = [];
          for (let i = 0; i < 30; i++) sc.flakes.push({ node: el('circle', { r: rand(3, 6).toFixed(1), fill: '#fff', opacity: .95 }, g), x: rand(0, 400), y: rand(-60, 760), v: rand(40, 80), ph: rand(0, 6) });
        } else {
          dsSky(g, defs, 'dressup-sky-beach', '#7fd0ff', '#e8f9ff');
          const sunO = el('g', { transform: 'translate(90 120)' }, g);
          el('circle', { r: 56, fill: '#fff3b0', opacity: .6 }, sunO);
          el('circle', { r: 38, fill: '#ffe066' }, sunO);
          sc.clouds = [dsCloud(g, 280, 120, .7)];
          el('rect', { x: -800, y: 370, width: 2000, height: 120, fill: '#5fc4e8' }, g);
          sc.wave = el('path', { fill: '#8fdcf5' }, g);
          el('rect', { x: -800, y: 476, width: 2000, height: 1400, fill: '#ffe3a8' }, g);
          el('path', { d: 'M352,560 L366,420', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
          el('path', { d: 'M300,440 Q366,362 432,420 Q399,410 366,420 Q333,412 300,440Z', fill: '#ff7a8a' }, g);
          el('path', { d: 'M366,420 Q360,380 366,382 Q340,404 333,412Z', fill: '#fff' }, g);
          const cas = el('g', { transform: 'translate(330 612)' }, g);
          el('rect', { x: -34, y: -30, width: 68, height: 34, rx: 6, fill: '#f5c97a' }, cas);
          el('rect', { x: -20, y: -56, width: 40, height: 30, rx: 5, fill: '#f5c97a' }, cas);
          [-26, -12, 2, 16].forEach(x => el('rect', { x: x + 2, y: -38, width: 8, height: 10, fill: '#f5c97a' }, cas));
          el('path', { d: 'M0,-56 L0,-80 L16,-72 L0,-66', fill: '#ff7a8a', stroke: '#fff', 'stroke-width': 2 }, cas);
          el('rect', { x: -7, y: -16, width: 14, height: 20, rx: 7, fill: '#e0a85a' }, cas);
          const crab = el('g', { transform: 'translate(80 640)' }, g);
          const cb = el('g', { class: 'tb' }, crab);
          el('ellipse', { cx: 0, cy: 0, rx: 26, ry: 18, fill: '#ff8a6b' }, cb);
          [-1, 1].forEach(s => { el('circle', { cx: s * 30, cy: -16, r: 9, fill: '#ff8a6b' }, cb); el('circle', { cx: s * 8, cy: -14, r: 4, fill: INK }, cb); });
          cb.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }], { duration: 700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          [[150, 700], [260, 660], [40, 740]].forEach(([x, y]) => el('path', { d: `M${x},${y} l6,-12 l6,12 l-12,-8 l12,0Z`, fill: '#ffb38a' }, g));
        }
        if (rare) {
          const rb = el('g', { opacity: .75 }, g);
          PARTY.forEach((c, i) => el('path', { d: `M${-20 + i * 9},470 A${230 - i * 9},${260 - i * 9} 0 0 1 ${420 - i * 9},470`, stroke: c, 'stroke-width': 9, fill: 'none' }, rb));
          g.insertBefore(rb, g.children[1]);
        }
      }
      function sceneTap(p) {
        if (!scene) return;
        if (dest === 'park') { A.chirp(); const x = p.x, y = Math.max(p.y, 480); const f = el('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})` }, scene.g); const fi = el('g', { class: 'tb' }, f); for (let i = 0; i < 5; i++) { const a = i * Math.PI * .4; el('circle', { cx: (Math.cos(a) * 9).toFixed(1), cy: (Math.sin(a) * 9).toFixed(1), r: 7, fill: pick(PARTY) }, fi); } el('circle', { r: 5, fill: '#fff' }, fi); fi.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'ease-out' }); }
        else if (dest === 'rain') { A.sfx('splash', { vol: .35, rate: rand(1, 1.3) }) || A.noise({ type: 'lowpass', from: 1200, dur: .2, vol: .1 }); ctx.sparkle(p.x, p.y, 3, 20, '#cfeaff'); if (scene.frog && Math.random() < .5) { scene.frog.sing(400); A.animal('frog', { vol: .6 }); } }
        else if (dest === 'snow') { A.sfx('sleigh', { vol: .3, rate: rand(.9, 1.2) }); ctx.sparkle(p.x, p.y, 4, 30, '#ffffff'); }
        else { A.sfx('bubble', { vol: .5, rate: rand(.9, 1.3) }); ctx.sparkle(p.x, p.y, 3, 24, '#bff0ff'); }
      }
      function play() {
        phase = 'play';
        const d = dest, me = ch;
        const items = Object.values(worn);
        const odd = items.filter(i => i.tag !== d && i.tag !== 'any' && i.cat !== 'extra').length;
        const funny = odd >= 3 || items.some(i => i.fun);
        me.face.set('happy');
        if (d === 'rain') A.sfx('rain', { vol: .35 }); else if (d === 'snow') A.sfx('windchime', { vol: .35 }); else if (d === 'beach') A.sfx('splash', { vol: .25 }); else A.chirp();
        if (d === 'park') say2('たのしいね');
        else if (d === 'rain') say2('ざあー');
        else if (d === 'snow') say2('ふわふわ〜');
        else say2('うみだよ〜');
        for (let i = 0; i < 3; i++) ctx.after(i * 560, () => {
          if (ch !== me) return;
          ctx.tween(500, k => me.place(200, 400 - Math.sin(k * Math.PI) * 50, .95), null, k => k);
          ctx.after(480, () => {
            squash(me.body, 1.12, 300);
            if (d === 'rain') { A.sfx('splash2', { vol: .35, rate: rand(1, 1.2) }); for (let j = 0; j < 8; j++) ctx.sparkle(200 + rand(-60, 60), 540, 1, 10, '#a8d8f5'); }
            else if (d === 'snow') { A.noise({ type: 'lowpass', from: 700, dur: .18, vol: .12 }); ctx.sparkle(200, 540, 3, 50, '#ffffff'); }
            else if (d === 'beach') { A.sfx('bubble', { vol: .5 }); ctx.sparkle(200, 540, 3, 50, '#ffe3a8'); }
            else { A.sfx('boing', { vol: .4, rate: 1 + i * .1 }); ctx.sparkle(200, 540, 2, 40, '#8fdc7a'); }
          });
        });
        if (d === 'rain' && scene.frog) ctx.after(700, () => { scene.frog.sing(500); A.animal('frog', { vol: .6 }); });
        if (funny) ctx.after(1100, () => {
          if (ch !== me) return;
          A.sfx('kidlaugh', { vol: .45 }); A.sfx('flexatone', { vol: .35 }); A.giggle();
          if (kind !== 'powan') { ghost.set('happy'); ghost.giggle(); }
          cheer('おもしろい！', false);
          me.body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0deg)' }], { duration: 700 });
        });
        ctx.after(2000, payoff);
      }
      function payoff() {
        phase = 'party';
        const me = ch;
        A.tada(); haptic(30);
        ctx.confetti(200, 330, 36);
        ctx.after(500, () => ctx.confetti(200, 220, 30));
        me.face.set('happy');
        squash(me.body, 1.14, 460);
        wave(1, 4); wave(0, 4);
        ctx.tween(900, k => me.place(200, 400 - Math.sin(k * Math.PI * 2) * 30 * (1 - k * .3), .95, Math.sin(k * Math.PI * 2) * 6), null, k => k);
        ghost.set('happy');
        cheer(kind === 'powan' ? 'たのしいね' : 'じょうず！');
        if (kind !== 'powan') {
          ghost.hop();
          const gx = ghost.x, gy = ghost.y;
          ctx.tween(1400, k => ghost.place(gx - Math.sin(k * Math.PI) * 90, gy + Math.sin(k * Math.PI) * 50 - Math.abs(Math.sin(k * Math.PI * 3)) * 28, .5 + Math.sin(k * Math.PI) * .1), () => ghost.giggle(), easeInOut);
        } else ctx.after(700, () => { A.giggle(); me.body.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0deg)' }], { duration: 620 }); });
        ctx.after(1300, () => { A.twinkle(); ctx.sparkle(200, 300, 6, 90); });
        ctx.after(3000, nextRound);
      }
      function nextRound() {
        phase = 'enter';
        ghost.set('normal');
        irisClose(200, 380, () => {
          if (scene) { scene.g.remove(); scene = null; }
          if (ch) { ch.outer.remove(); ch = null; }
          trayL.style.display = '';
          round++;
          startRound(false);
          irisOpen();
        });
      }
      function startRound(first) {
        kind = KINDS[round % KINDS.length];
        rare = round > 0 && Math.random() < 1 / 6;
        const R = ROOMS[kind];
        wpBg.setAttribute('fill', R.wall); wpA.setAttribute('fill', R.dot); wpB.setAttribute('fill', R.dot);
        floor.setAttribute('fill', R.floor); boards.forEach(b => b.setAttribute('fill', R.board)); rug.setAttribute('fill', R.rug);
        worn = {}; catI = 0;
        if (kind === 'powan') ghost.moveTo(470, 60, .5, 500);
        else if (ghost.x > 400) ghost.moveTo(336, 124, .5, 600);
        ch = makeFriend(kind);
        ch.place(348, 400, .52);
        ch.outer.setAttribute('opacity', 0);
        door.setAttribute('transform', 'scale(.18 1)');
        ctx.after(first ? 300 : 450, () => {
          ch.outer.setAttribute('opacity', 1);
          A.sfx('creak', { vol: .3, rate: 1.3 });
          walk(348, 400, .52, CX, CY, CS, 1000, () => {
            ctx.tween(400, k => door.setAttribute('transform', `scale(${(.18 + .82 * k).toFixed(3)} 1)`));
            squash(ch.body, 1.1);
            if (kind === 'bear' || kind === 'bunny') ch.face.set('happy');
            say2(first ? 'こんにちは！' : 'ただいま！');
            ctx.after(900, () => { if (ch) ch.face.set('normal'); cheer(kind === 'powan' ? 'おきがえ するよ！' : 'おきがえ しよう！'); });
            ctx.after(1300, () => showTray(true));
          }, 4);
        });
      }

      /* ---------- input ---------- */
      function roomTap(p) {
        if (Math.hypot(p.x - 54, p.y - 540) < 46) {
          A.sfx('bounce', { vol: .6 }) || A.boing(); squash(ball, 1.25, 420);
          ball.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-40px)', offset: .4 }, { transform: 'translateY(0px)' }], { duration: 520, easing: 'ease-out', composite: 'add' });
          return;
        }
        if (p.x < 104 && p.y > 232 && p.y < 470) { hangers.forEach((h, i) => h.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(14deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(0deg)' }], { duration: 700, delay: i * 60, composite: 'add' })); A.sfx('flip', { vol: .4 }) || A.click(); return; }
        if (p.x > 240 && p.y < 200) { curtains.forEach(c => c.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(0deg)' }], { duration: 800, composite: 'add' })); A.chirp(); return; }
        ctx.sparkle(p.x, p.y, 3, 22, pick(PARTY));
        A.bell(mtof(pick(PENTA) + 12), { vol: .07 });
      }
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e);
        if (p.x < 80 && p.y < 80) return;
        haptic(6);
        lookAt(p.x, p.y);
        if (ghost.pos.contains(e.target)) { ghost.giggle(); ctx.after(900, () => ghost.set('normal')); return; }
        if (ch && ch.outer.contains(e.target)) {
          if (phase === 'pick') { const free = cards.filter(c => !c.taken); const c = free[Math.floor(free.length / 2)] || free[0]; if (c) { grab(c, e); release(); } return; }
          if (phase === 'play' || phase === 'party') { A.giggle(); squash(ch.body, 1.1); happyFor(800); return; }
          A.giggle(); squash(ch.body, 1.08); happyFor(700);
          return;
        }
        if (scene) sceneTap(p); else roomTap(p);
      });
      ctx.on(ctx.host, 'pointermove', e => {
        const p = ctx.point(e);
        if (!drag) return;
        lookAt(p.x, p.y);
        drag.moved += Math.hypot(p.x - drag.p.x, p.y - drag.p.y);
        drag.p = p;
        drag.x = p.x; drag.y = p.y - 20;
        placeFly();
      });
      const up = () => { if (drag) release(); };
      ctx.on(window, 'pointerup', up);
      ctx.on(window, 'pointercancel', up);

      /* ---------- frame loop: clouds, rain, snow, waves, butterflies ---------- */
      ctx.loop((dt, t) => {
        winClouds.forEach((c, i) => c.setAttribute('transform', `translate(${(250 + ((t * (6 + i * 3) + i * 60) % 150)).toFixed(1)} ${120 + i * 30}) scale(${.45 - i * .1})`));
        const sc = scene;
        if (!sc) return;
        sc.clouds.forEach((c, i) => {
          const base = c.dataset.bx ? +c.dataset.bx : (c.dataset.bx = c.transform.baseVal.consolidate().matrix.e);
          const m = c.transform.baseVal.consolidate().matrix;
          c.setAttribute('transform', `translate(${(((+base + t * (8 + i * 4)) % 560) - 80).toFixed(1)} ${m.f.toFixed(1)}) scale(${m.a.toFixed(2)})`);
        });
        if (sc.rain) sc.rain.forEach(r => { r.y += r.v * dt; r.x -= r.v * dt * .2; if (r.y > 770) { r.y = rand(-80, -10); r.x = rand(0, 460); } r.node.setAttribute('transform', `translate(${r.x.toFixed(1)} ${r.y.toFixed(1)})`); });
        if (sc.flakes) sc.flakes.forEach(f => { f.y += f.v * dt; if (f.y > 770) { f.y = -10; f.x = rand(0, 400); } f.node.setAttribute('transform', `translate(${(f.x + Math.sin(t * 1.3 + f.ph) * 16).toFixed(1)} ${f.y.toFixed(1)})`); });
        if (sc.wave) { let d = 'M-20,470 L-20,452'; for (let x = -20; x <= 420; x += 40) d += ` L${x},${(452 + Math.sin(t * 2.4 + x * .04) * 6).toFixed(1)}`; sc.wave.setAttribute('d', d + ' L420,470Z'); }
        sc.fly.forEach(b => b.node.setAttribute('transform', `translate(${(b.cx + Math.cos(t * .8 + b.ph) * b.r).toFixed(1)} ${(b.cy + Math.sin(t * 1.6 + b.ph) * 40).toFixed(1)})`));
      });

      startRound(true);
      ctx.hint = () => {
        if (phase !== 'pick') return null;
        const c = cards.find(q => !q.taken);
        return c ? [c.x, c.y + trayY] : null;
      };
    }
  };
  TOYS.push(dressupToy);
})();
