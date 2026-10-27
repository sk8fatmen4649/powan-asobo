'use strict';
/* =========================================================
   toy: はたけ — うんとこしょ! pull big vegetables into the basket
   three seasons rotate: spring roots, summer vines, autumn harvest
   ========================================================= */
(() => {
  const INK = '#3a2f5b';
  const S = 1.45;                        // vegetables are drawn in local units and scaled up by S in the field
  const GROUND = [[110, 446], [290, 446], [110, 614], [290, 614]];
  const BASKET = { x: 200, rim: 676 };

  /* ---------- faces ---------- */
  function face(g, y, k = 1) {
    const f = el('g', { transform: `translate(0 ${y}) scale(${k})` }, g);
    [-1, 1].forEach(s => el('ellipse', { cx: s * 17, cy: 6, rx: 5.5, ry: 3.6, fill: '#ff8fa3', opacity: .75 }, f));
    const look = el('g', {}, f);
    const blink = el('g', { class: 'tb' }, look);
    const open = el('g', {}, blink), joy = el('g', { style: 'display:none' }, look);
    [-9, 9].forEach(x => {
      el('ellipse', { cx: x, cy: 0, rx: 3.8, ry: 4.6, fill: '#2b2340' }, open);
      el('circle', { cx: x - 1.3, cy: -1.7, r: 1.5, fill: '#fff' }, open);
      el('path', { d: `M${x - 4.5},1 Q${x},-5 ${x + 4.5},1`, stroke: '#2b2340', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, joy);
    });
    const smile = el('path', { d: 'M-6,7 Q0,13 6,7', stroke: '#2b2340', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }, f);
    const wow = el('ellipse', { cx: 0, cy: 10, rx: 4, ry: 5, fill: '#c2405a', style: 'display:none' }, f);
    const grin = el('path', { d: 'M-7,6 Q0,17 7,6Z', fill: '#c2405a', style: 'display:none' }, f);
    return {
      set(ex) {
        open.style.display = ex === 'joy' ? 'none' : ''; joy.style.display = ex === 'joy' ? '' : 'none';
        smile.style.display = ex === 'normal' ? '' : 'none'; wow.style.display = ex === 'wow' ? '' : 'none'; grin.style.display = ex === 'joy' ? '' : 'none';
      },
      look(dx, dy) { look.setAttribute('transform', `translate(${dx.toFixed(1)} ${dy.toFixed(1)})`); },
      blink() { blink.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 }); }
    };
  }
  const leaf = (g, d, c = '#4cc44a') => el('path', { d, fill: c }, g);
  const shine = (g, cx, cy, rx, ry, rot = -30) => el('ellipse', { cx, cy, rx, ry, fill: '#fff', opacity: .38, transform: `rotate(${rot} ${cx} ${cy})` }, g);
  const G = (gold, c) => gold ? '#ffd23f' : c;
  function bigLeaf(g, x, y, r, rot, c = '#5cbf4f') {
    el('path', { d: `M0,0 Q${-r * .7},${-r * .5} ${-r * .2},${-r} Q0,${-r * .7} ${r * .2},${-r} Q${r * .7},${-r * .5} 0,0Z`, fill: c, transform: `translate(${x} ${y}) rotate(${rot})` }, g);
  }
  function vine(g, d) { el('path', { d, stroke: '#4fa845', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g); }

  /* ---------- vegetables: origin on the ground line ----------
     root: body hangs below the ground, pulled up out of the hole
     pick: sits on the ground or on a vine, tugged off */
  const VEG = {
    carrot: { n: 'にんじん', mode: 'root', len: 96, peek: 28, draw(g, gold) {
      leaf(g, 'M0,0 Q-16,-30 -24,-54 Q-6,-42 2,-8Z'); leaf(g, 'M0,0 Q-2,-42 2,-66 Q12,-38 4,-6Z', '#5cd15a'); leaf(g, 'M0,0 Q16,-30 26,-52 Q8,-40 0,-8Z');
      el('path', { d: 'M-24,2 Q-24,52 0,96 Q24,52 24,2 Q0,-6 -24,2Z', fill: G(gold, '#ff8a2a') }, g);
      el('path', { d: 'M-16,40 L-7,40 M8,56 L16,56 M-10,72 L-4,72', stroke: G(gold, '#e5701a') === '#ffd23f' ? '#f0b000' : '#e5701a', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      shine(g, -11, 16, 6, 12, 10);
      return face(g, 20);
    } },
    daikon: { n: 'だいこん', mode: 'root', len: 116, peek: 44, draw(g, gold) {
      leaf(g, 'M0,0 Q-30,-24 -36,-52 Q-6,-42 0,-6Z', '#5cc45a'); leaf(g, 'M0,0 Q2,-40 0,-62 Q16,-36 4,-4Z', '#6fd36b'); leaf(g, 'M0,0 Q30,-24 36,-50 Q6,-40 0,-6Z', '#5cc45a');
      el('path', { d: 'M-25,2 Q-28,72 0,116 Q28,72 25,2 Q0,-6 -25,2Z', fill: G(gold, '#fbfbf2') }, g);
      el('ellipse', { cx: 0, cy: 10, rx: 24, ry: 10, fill: gold ? '#ffe680' : '#d8efb0' }, g);
      shine(g, -12, 40, 6, 16, 6);
      return face(g, 36);
    } },
    turnip: { n: 'かぶ', mode: 'root', len: 66, peek: 42, draw(g, gold) {
      leaf(g, 'M0,0 Q-22,-30 -26,-58 Q-4,-44 0,-6Z'); leaf(g, 'M0,0 Q22,-30 26,-58 Q4,-44 0,-6Z'); leaf(g, 'M0,0 Q-2,-40 2,-60 Q8,-36 2,-4Z', '#5cd15a');
      el('path', { d: 'M-2,62 Q0,86 3,62', stroke: '#e9e2d2', 'stroke-width': 4, fill: 'none' }, g);
      el('circle', { cx: 0, cy: 32, r: 34, fill: G(gold, '#ffffff') }, g);
      el('path', { d: 'M-32,22 Q0,-10 32,22 Q0,4 -32,22Z', fill: gold ? '#ffb800' : '#d9a3ff' }, g);
      shine(g, -14, 30, 7, 11);
      return face(g, 34);
    } },
    onion: { n: 'たまねぎ', mode: 'root', len: 80, peek: 52, draw(g, gold) {
      el('path', { d: 'M-4,0 Q-14,-30 -18,-50 M4,0 Q14,-30 18,-48 M0,0 Q0,-36 1,-58', stroke: '#6cc04a', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M0,-2 Q36,24 29,54 Q18,76 0,76 Q-18,76 -29,54 Q-36,24 0,-2Z', fill: G(gold, '#f0c27a') }, g);
      el('path', { d: 'M-8,10 Q-20,40 -12,70 M8,10 Q20,40 12,70', stroke: gold ? '#f0b000' : '#dca865', 'stroke-width': 2.4, fill: 'none' }, g);
      el('path', { d: 'M-6,76 L-8,86 M0,76 L0,88 M6,76 L8,86', stroke: '#c99a5a', 'stroke-width': 2.4 }, g);
      shine(g, -14, 34, 6, 11, 15);
      return face(g, 44);
    } },
    imo: { n: 'さつまいも', mode: 'root', len: 98, peek: 56, draw(g, gold) {
      leaf(g, 'M0,0 Q-30,-12 -26,-38 Q-12,-48 -2,-28 Q0,-12 0,0Z', '#58b84c'); leaf(g, 'M0,0 Q30,-12 26,-38 Q12,-48 2,-28 Q0,-12 0,0Z', '#6cc45a');
      leaf(g, 'M0,0 Q-8,-30 0,-52 Q10,-30 0,0Z', '#4fae44');
      el('path', { d: 'M0,0 Q-2,6 0,10', stroke: '#8a4a3a', 'stroke-width': 4, fill: 'none' }, g);
      el('ellipse', { cx: 0, cy: 52, rx: 26, ry: 46, fill: G(gold, '#c0508e') }, g);
      el('path', { d: 'M-14,32 Q0,36 14,32 M-16,72 Q0,76 16,72', stroke: gold ? '#f0b000' : '#a33f78', 'stroke-width': 2.4, fill: 'none' }, g);
      shine(g, -11, 38, 6, 14, 8);
      return face(g, 48);
    } },
    melon: { n: 'すいか', mode: 'pick', back(g) {
      el('ellipse', { cx: 0, cy: 2, rx: 60, ry: 10, fill: '#3a2f5b', opacity: .14 }, g);
      vine(g, 'M0,-74 Q-20,-96 -46,-80 Q-70,-64 -62,-30 M-46,-80 Q-40,-100 -26,-98');
      bigLeaf(g, -60, -2, 40, -60, '#4fae44'); bigLeaf(g, 58, 0, 36, 64, '#5cbf4f');
    }, draw(g, gold) {
      el('ellipse', { cx: 0, cy: -40, rx: 54, ry: 42, fill: G(gold, '#5cc45a') }, g);
      [-.7, -.25, .25, .7].forEach(u => {
        let d = '';
        for (let k = 0; k <= 10; k++) {
          const y = -78 + k * 7.6, w = 54 * Math.sqrt(Math.max(0, 1 - ((y + 40) / 42) ** 2));
          d += `${k ? 'L' : 'M'}${(u * w + (k % 2 ? 3.5 : -3.5)).toFixed(1)},${y.toFixed(1)} `;
        }
        el('path', { d, stroke: gold ? '#f0a800' : '#2f8a3a', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      });
      shine(g, -24, -62, 15, 8);
      el('path', { d: 'M0,-82 Q2,-92 -6,-96', stroke: '#4fa845', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
      return face(g, -36, 1.25);
    } },
    tomato: { n: 'トマト', mode: 'pick', back(g) {
      el('ellipse', { cx: 0, cy: 2, rx: 50, ry: 9, fill: '#3a2f5b', opacity: .12 }, g);
      el('rect', { x: -44, y: -112, width: 7, height: 114, rx: 3.5, fill: '#c48a46' }, g);
      vine(g, 'M-40,0 Q-26,-30 -42,-56 Q-54,-80 -36,-98 Q-22,-108 -2,-100');
      bigLeaf(g, -56, -36, 22, -70); bigLeaf(g, -56, -84, 20, -40, '#5cd15a'); bigLeaf(g, 30, -2, 22, 66, '#4fae44');
      el('circle', { cx: -26, cy: -64, r: 8, fill: '#8fd36b' }, g);
      [0, 72, 144, 216, 288].forEach(a => el('ellipse', { cx: 0, cy: -5, rx: 3, ry: 5, fill: '#ffe066', transform: `translate(-30 -22) rotate(${a})` }, g));
    }, draw(g, gold) {
      el('ellipse', { cx: 0, cy: -38, rx: 40, ry: 36, fill: G(gold, '#ff5a4a') }, g);
      el('ellipse', { cx: 0, cy: -12, rx: 28, ry: 7, fill: gold ? '#f0b000' : '#e8463a', opacity: .5 }, g);
      shine(g, -18, -56, 12, 7);
      el('path', { d: 'M0,-72 L-15,-79 L-6,-68 L-19,-64 L-4,-64 L0,-54 L4,-64 L19,-64 L6,-68 L15,-79Z', fill: '#4fae44' }, g);
      el('path', { d: 'M0,-72 Q0,-82 -4,-86', stroke: '#4fa845', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, g);
      return face(g, -36, 1.1);
    } },
    corn: { n: 'とうもろこし', mode: 'pick', back(g) {
      el('ellipse', { cx: 0, cy: 2, rx: 44, ry: 8, fill: '#3a2f5b', opacity: .12 }, g);
      el('path', { d: 'M-6,0 Q-12,-60 -6,-116', stroke: '#6cc04a', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, g);
      leaf(g, 'M-6,-20 Q-44,-30 -60,-4 Q-36,-22 -6,-14Z', '#5cbf4f');
      leaf(g, 'M-8,-96 Q-36,-116 -50,-98 Q-28,-106 -8,-88Z', '#5cd15a');
      el('path', { d: 'M-6,-116 l-8,-12 M-6,-116 l0,-16 M-6,-116 l9,-12', stroke: '#e0c070', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    }, draw(g, gold) {
      const c = el('g', { transform: 'translate(14 -52) rotate(12)' }, g);
      el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 46, fill: G(gold, '#ffd84a') }, c);
      for (let y = -36; y <= 36; y += 12) el('path', { d: `M-19,${y} Q0,${y + 5} 19,${y}`, stroke: gold ? '#f0a800' : '#f0b52a', 'stroke-width': 2.4, fill: 'none' }, c);
      el('path', { d: 'M-4,-46 Q-10,-60 -16,-62 M2,-46 Q4,-62 10,-64', stroke: '#c9a060', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, c);
      el('path', { d: 'M0,46 Q-34,30 -30,-14 Q-18,22 6,40Z', fill: '#7fd36b' }, c);
      el('path', { d: 'M0,46 Q32,30 30,-10 Q16,24 -4,40Z', fill: '#6cc45a' }, c);
      shine(c, -8, -24, 5, 12, 0);
      return face(c, -6, .9);
    } },
    pumpkin: { n: 'かぼちゃ', mode: 'pick', back(g) {
      el('ellipse', { cx: 0, cy: 2, rx: 62, ry: 10, fill: '#3a2f5b', opacity: .14 }, g);
      vine(g, 'M4,-76 Q26,-102 52,-86 Q74,-68 64,-34 M52,-86 Q64,-104 50,-110');
      bigLeaf(g, 62, -2, 38, 60, '#6fae44'); bigLeaf(g, -60, 0, 34, -66, '#7fbf4f');
    }, draw(g, gold) {
      const c1 = G(gold, '#ff9a2a'), c2 = gold ? '#ffc21a' : '#ff8a1a';
      el('ellipse', { cx: -26, cy: -38, rx: 30, ry: 38, fill: c2 }, g);
      el('ellipse', { cx: 26, cy: -38, rx: 30, ry: 38, fill: c2 }, g);
      el('ellipse', { cx: 0, cy: -40, rx: 30, ry: 41, fill: c1 }, g);
      el('path', { d: 'M-14,-76 Q-22,-40 -14,-2 M14,-76 Q22,-40 14,-2', stroke: gold ? '#f0a800' : '#e8761a', 'stroke-width': 3, fill: 'none', opacity: .7 }, g);
      el('path', { d: 'M-5,-78 Q-4,-94 6,-98 L10,-92 Q4,-88 5,-78Z', fill: '#7a6a3a' }, g);
      shine(g, -30, -60, 9, 14, 20);
      return face(g, -36, 1.2);
    } },
    kuri: { n: 'くり', mode: 'pick', back(g) {
      el('ellipse', { cx: 0, cy: 2, rx: 54, ry: 9, fill: '#3a2f5b', opacity: .14 }, g);
      let d = '';
      for (let i = 0; i <= 36; i++) {
        const a = Math.PI * (i / 36) + Math.PI, r = i % 2 ? 50 : 40;
        d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(-14 + Math.sin(a) * r * .8).toFixed(1)} `;
      }
      el('path', { d: d + 'Q0,6 -40,-14Z', fill: '#a8c45a' }, g);
      el('path', { d: 'M-34,-14 Q-30,-46 0,-50 Q30,-46 34,-14 Q0,2 -34,-14Z', fill: '#d9c27a' }, g);
      bigLeaf(g, 48, 0, 28, 70, '#e8a040'); bigLeaf(g, -50, 0, 26, -70, '#d9763a');
    }, draw(g, gold) {
      el('path', { d: 'M0,-88 Q34,-66 36,-34 Q36,-6 0,-6 Q-36,-6 -36,-34 Q-34,-66 0,-88Z', fill: G(gold, '#9a5a2e') }, g);
      el('path', { d: 'M-34,-22 Q0,-14 34,-22 Q34,-6 0,-6 Q-34,-6 -34,-22Z', fill: gold ? '#ffe680' : '#e0bc86' }, g);
      shine(g, -14, -60, 8, 14, 25);
      el('path', { d: 'M0,-88 L0,-96', stroke: gold ? '#f0a800' : '#7a4520', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
      return face(g, -46, 1.05);
    } }
  };
  const SEASONS = [
    { key: 'spring', veg: () => ['carrot', 'daikon', 'turnip', 'onion'].sort(() => Math.random() - .5),
      sky: ['#9fd8ff', '#e8f7ff'], hills: ['#b5e8a0', '#9ad986'], sun: '#ffd56b', drift: ['#ffc4d6', '#ffd9e4'], flier: 'butterfly', thief: 'chick' },
    { key: 'summer', veg: () => ['melon', 'tomato', 'corn', pick(['melon', 'tomato'])].sort(() => Math.random() - .5),
      sky: ['#5fc2ff', '#d4f1ff'], hills: ['#7fd36b', '#62c25a'], sun: '#ffc93a', drift: null, flier: 'butterfly', thief: 'crow' },
    { key: 'autumn', veg: () => ['imo', 'pumpkin', 'kuri', pick(['imo', 'kuri'])].sort(() => Math.random() - .5),
      sky: ['#ffbf8f', '#fff0dc'], hills: ['#e8c070', '#d49a4a'], sun: '#ffa64a', drift: ['#ff8a4a', '#e8603a', '#ffc24a'], flier: 'dragonfly', thief: 'crow' }
  ];

  /* ---------- scarecrow ---------- */
  function scarecrow(g) {
    el('rect', { x: -5, y: -150, width: 10, height: 152, rx: 5, fill: '#b07a46' }, g);
    const arms = el('g', { class: 'tb', style: 'transform-origin:50% 50%' }, g);
    el('rect', { x: -58, y: -103, width: 116, height: 9, rx: 4.5, fill: '#b07a46' }, arms);
    [-1, 1].forEach(s => el('path', { d: `M${s * 56},-102 l${s * 12},-6 M${s * 56},-99 l${s * 14},0 M${s * 56},-96 l${s * 12},6`, stroke: '#f0c860', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, arms));
    el('path', { d: 'M-50,-106 L-20,-110 L20,-110 L50,-106 L50,-88 L28,-86 L32,-36 L-32,-36 L-28,-86 L-50,-88Z', fill: '#7fb8ff' }, arms);
    el('rect', { x: 8, y: -70, width: 16, height: 16, rx: 3, fill: '#ffb3c1' }, arms);
    el('path', { d: 'M10,-62 h12 M16,-68 v12', stroke: '#ff8fa3', 'stroke-width': 2, 'stroke-dasharray': '2 2' }, arms);
    shine(arms, -14, -94, 10, 5, -8);
    const head = el('g', { class: 'tb' }, g);
    el('circle', { cx: 0, cy: -132, r: 27, fill: '#f6dca8' }, head);
    el('ellipse', { cx: 0, cy: -150, rx: 44, ry: 9, fill: '#f0c060' }, head);
    el('path', { d: 'M-24,-150 Q-22,-178 0,-178 Q22,-178 24,-150Z', fill: '#f5cf70' }, head);
    el('rect', { x: -24, y: -158, width: 48, height: 7, fill: '#ff7a8a' }, head);
    shine(head, -10, -140, 7, 4, -20);
    const f = face(head, -130, 1.1);
    return { arms, head, face: f };
  }

  /* ---------- flying things ---------- */
  function butterfly(g, c) {
    const wings = el('g', { class: 'tb' }, g);
    [-1, 1].forEach(s => {
      el('ellipse', { cx: s * 13, cy: -7, rx: 13, ry: 11, fill: c, transform: `rotate(${s * 20} ${s * 13} -7)` }, wings);
      el('ellipse', { cx: s * 10, cy: 8, rx: 9, ry: 8, fill: c, opacity: .85 }, wings);
      el('circle', { cx: s * 14, cy: -8, r: 4, fill: '#fff', opacity: .6 }, wings);
    });
    el('ellipse', { cx: 0, cy: 0, rx: 3.5, ry: 13, fill: INK }, g);
    el('path', { d: 'M-1,-12 Q-6,-22 -9,-22 M1,-12 Q6,-22 9,-22', stroke: INK, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, g);
    el('circle', { r: 30, fill: 'transparent' }, g);
    wings.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.25)' }], { duration: rand(160, 220), iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
  }
  function dragonfly(g) {
    const wings = el('g', { class: 'tb' }, g);
    [-1, 1].forEach(s => [-6, 2].forEach(y => el('ellipse', { cx: s * 18, cy: y, rx: 18, ry: 5, fill: '#ffffff', opacity: .75, stroke: '#ffd9c4', 'stroke-width': 1 }, wings)));
    el('rect', { x: -3, y: -4, width: 6, height: 36, rx: 3, fill: '#ff5a3a' }, g);
    el('circle', { cx: 0, cy: -8, r: 6, fill: '#e8463a' }, g);
    el('circle', { cx: -2, cy: -10, r: 2, fill: '#fff' }, g);
    el('circle', { r: 30, fill: 'transparent' }, g);
    wings.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.4)' }], { duration: 90, iterations: Infinity, direction: 'alternate' });
  }
  function bird(g, kind) {
    const body = kind === 'crow' ? '#4a4266' : '#ffe066', wing = kind === 'crow' ? '#3a3352' : '#ffd23f';
    el('ellipse', { cx: 6, cy: 4, rx: 26, ry: 20, fill: body }, g);
    el('path', { d: 'M28,0 L46,-6 L44,10Z', fill: body }, g);
    el('circle', { cx: -16, cy: -12, r: 17, fill: body }, g);
    el('path', { d: 'M-31,-14 L-46,-9 L-31,-5Z', fill: '#ffb02a' }, g);
    el('circle', { cx: -19, cy: -16, r: 4.4, fill: kind === 'crow' ? '#fff' : '#2b2340' }, g);
    el('circle', { cx: -19, cy: -16, r: kind === 'crow' ? 2.6 : 1.4, fill: kind === 'crow' ? '#2b2340' : '#fff' }, g);
    el('ellipse', { cx: -10, cy: -4, rx: 5, ry: 3, fill: '#ffa3b8', opacity: .8 }, g);
    const w = el('g', { class: 'tb', style: 'transform-origin:30% 20%' }, g);
    el('path', { d: 'M-2,-2 Q22,-30 34,-4 Q18,8 -2,-2Z', fill: wing }, w);
    [-4, 8].forEach(x => el('path', { d: `M${x},22 l-3,8 M${x},22 l3,8`, stroke: '#ffb02a', 'stroke-width': 3, 'stroke-linecap': 'round' }, g));
    el('circle', { r: 46, fill: 'transparent' }, g);
    return w;
  }

  const farmToy = {
    id: 'farm', name: 'はたけ', color: '#9be08a',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#bfe8ff' }, g);
      el('circle', { cx: 44, cy: -44, r: 16, fill: '#ffd56b' }, g);
      el('rect', { x: -80, y: 6, width: 160, height: 80, fill: '#c98a55' }, g);
      const v = el('g', { transform: 'translate(0 18) scale(.9)' }, g);
      VEG.carrot.draw(v);
      el('rect', { x: -80, y: 22, width: 160, height: 70, fill: '#c98a55' }, g);
      el('path', { d: 'M-40,20 Q0,34 40,20', stroke: '#a8744a', 'stroke-width': 6, fill: 'none' }, g);
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      SEASONS.forEach((s, i) => {
        const lg = el('linearGradient', { id: 'farm-sky' + i, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        el('stop', { offset: 0, 'stop-color': s.sky[0] }, lg); el('stop', { offset: 1, 'stop-color': s.sky[1] }, lg);
      });
      const soilG = el('linearGradient', { id: 'farm-soil', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': '#cf9260' }, soilG); el('stop', { offset: 1, 'stop-color': '#a86c3e' }, soilG);
      const clip = el('clipPath', { id: 'farm-clip' }, defs);
      el('rect', { x: -140, y: -320, width: 280, height: 324 }, clip);

      /* layers, back to front */
      const seasonHost = el('g', {}, svg);
      const cloudL = el('g', {}, svg);
      const scareO = el('g', { transform: 'translate(64 304) scale(.92)' }, svg);
      el('rect', { x: -800, y: 296, width: 2000, height: 1400, fill: 'url(#farm-soil)' }, svg);
      const strip = el('path', { d: 'M-800,300 L1200,300 L1200,314 Q200,326 -800,314Z', fill: '#8fcf6a' }, svg);
      [0, 1].forEach(r => el('rect', { x: 20, y: GROUND[r * 2][1] - 18, width: 360, height: 36, rx: 18, fill: '#d99f69', opacity: .7 }, svg));
      [[40, 640], [356, 520], [24, 500], [370, 700], [200, 520]].forEach(([x, y]) => [-5, 0, 5].forEach(d => el('circle', { cx: x + d * 2, cy: y + Math.abs(d), r: 3, fill: '#b67a48' }, svg)));
      const slotL = el('g', {}, svg);
      const hitL = el('g', {}, svg);
      const basketO = el('g', {}, svg);
      const fly = el('g', { 'pointer-events': 'none' }, svg);
      const fx = el('g', { 'pointer-events': 'none' }, svg);
      const ghost = ctx.ghost(svg, { x: 322, y: 196, s: .62 });

      /* ---------- scarecrow ---------- */
      const SC = scarecrow(scareO);
      el('rect', { x: -60, y: -185, width: 120, height: 190, fill: 'transparent' }, scareO);
      let waveT = 0;
      function wave(big) {
        const now = performance.now();
        if (now - waveT < 300) return;
        waveT = now;
        SC.arms.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(12deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(0deg)' }], { duration: big ? 1100 : 800, easing: 'ease-in-out' });
        SC.head.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(-10px) scale(.92,1.1)' }, { transform: 'translateY(2px) scale(1.08,.92)' }, { transform: 'translateY(0px) scale(1)' }], { duration: 520, easing: 'ease-out' });
        SC.face.set('joy'); ctx.after(900, () => SC.face.set('normal'));
        A.sfx('spin', { vol: .45, rate: rand(.95, 1.15) }) || A.boing();
        A.sfx('flip', { vol: .5, when: .15 });
      }
      scareO.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic(10); wave(false);
        if (thief && thief.holding) scare();
        ctx.sparkle(64, 190, 3, 40, '#ffe066');
      });

      /* ---------- season scenery ---------- */
      let si = 0, season = SEASONS[0], scen = null;
      const fliers = [], drifts = [], clouds = [];
      function buildSeason(i) {
        const s = SEASONS[i];
        const g = el('g', {}, seasonHost);
        el('rect', { x: -800, y: -900, width: 2000, height: 1230, fill: `url(#farm-sky${i})` }, g);
        const sunO = el('g', { transform: `translate(206 ${s.key === 'autumn' ? 120 : 96})` }, g);
        const rays = el('g', {}, sunO);
        for (let k = 0; k < 10; k++) el('rect', { x: -4, y: -66, width: 8, height: 18, rx: 4, fill: s.sun, opacity: .9, transform: `rotate(${k * 36})` }, rays);
        rays.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 40000, iterations: Infinity });
        el('circle', { r: s.key === 'summer' ? 42 : 36, fill: s.sun }, sunO);
        el('circle', { cx: -12, cy: -12, r: 11, fill: '#fff', opacity: .35 }, sunO);
        [-1, 1].forEach(k => el('ellipse', { cx: k * 18, cy: 8, rx: 7, ry: 4, fill: '#ff9a7a', opacity: .5 }, sunO));
        [-1, 1].forEach(k => el('path', { d: `M${k * 12 - 5},-2 Q${k * 12},-8 ${k * 12 + 5},-2`, stroke: '#c9782a', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, sunO));
        if (s.key === 'summer') [[-30, 230, 80], [40, 200, 70], [10, 160, 60], [80, 236, 60]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', opacity: .92 }, g));
        el('ellipse', { cx: 40, cy: 300, rx: 210, ry: 66, fill: s.hills[0] }, g);
        el('ellipse', { cx: 360, cy: 306, rx: 220, ry: 60, fill: s.hills[1] }, g);
        if (s.key === 'spring') {
          [[188, 262], [258, 272]].forEach(([x, y], k) => {
            el('rect', { x: x - 4, y, width: 8, height: 34, rx: 4, fill: '#a8744a' }, g);
            const c = el('g', { class: 'tb' }, g);
            [[0, 0, 26], [-20, 8, 18], [20, 8, 18], [0, -14, 18]].forEach(([dx, dy, r]) => el('circle', { cx: x + dx, cy: y + dy, r: r * (k ? .9 : 1), fill: k ? '#ffc4d6' : '#ffb3c8' }, c));
            c.animate([{ transform: 'rotate(-2deg)' }, { transform: 'rotate(2deg)' }], { duration: 2200 + k * 400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          });
          for (let k = 0; k < 9; k++) el('circle', { cx: 120 + k * 32, cy: 292 + (k % 3) * 4, r: 4, fill: pick(['#ffffff', '#ffe066', '#ff9ab3']) }, g);
        } else if (s.key === 'summer') {
          [150, 200, 250].forEach((x, k) => {
            const y = 296 - k % 2 * 8;
            el('path', { d: `M${x},${y} L${x},${y - 46}`, stroke: '#4fa845', 'stroke-width': 5 }, g);
            bigLeaf(g, x, y - 18, 14, k % 2 ? 50 : -50);
            const h = el('g', { class: 'tb' }, g);
            for (let p = 0; p < 10; p++) el('ellipse', { cx: x, cy: y - 64, rx: 5, ry: 11, fill: '#ffd23f', transform: `rotate(${p * 36} ${x} ${y - 50})` }, h);
            el('circle', { cx: x, cy: y - 50, r: 9, fill: '#a0602a' }, h);
            h.animate([{ transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }], { duration: 1600 + k * 300, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          });
        } else {
          [[176, 262, '#ff9a4a'], [250, 270, '#e8603a']].forEach(([x, y, c], k) => {
            el('rect', { x: x - 4, y, width: 8, height: 34, rx: 4, fill: '#8a5a32' }, g);
            const t = el('g', { class: 'tb' }, g);
            el('ellipse', { cx: x, cy: y - 8, rx: 30, ry: 28, fill: c }, t);
            el('ellipse', { cx: x - 10, cy: y - 18, rx: 9, ry: 6, fill: '#fff', opacity: .3 }, t);
            t.animate([{ transform: 'rotate(-2deg)' }, { transform: 'rotate(2deg)' }], { duration: 2400 + k * 300, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          });
        }
        return g;
      }
      function makeFliers() {
        fliers.splice(0).forEach(f => f.o.remove());
        const n = season.flier === 'dragonfly' ? 2 : 3;
        for (let k = 0; k < n; k++) {
          const o = el('g', {});
          svg.insertBefore(o, fly);
          const inner = el('g', {}, o);
          if (season.flier === 'dragonfly') dragonfly(inner); else butterfly(inner, pick(['#ff9ab3', '#ffd23f', '#9fd0ff', '#c9a7ff', '#ffffff']));
          const f = { o, inner, cx: rand(80, 320), cy: rand(160, 420), ax: rand(60, 130), ay: rand(30, 70), ph: rand(0, 6), sp: rand(.25, .45), boost: 0, x: 0, y: 0 };
          o.addEventListener('pointerdown', e => {
            e.stopPropagation(); haptic(6);
            f.boost = 1;
            A.sfx('blink', { vol: .6, rate: rand(.9, 1.3) }) || A.twinkle();
            ctx.sparkle(f.x, f.y, 3, 26, '#ffffff');
            inner.animate([{ transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(360deg) scale(1.3)' }, { transform: 'rotate(720deg) scale(1)' }], { duration: 700, easing: 'ease-out' });
          });
          fliers.push(f);
        }
      }
      [[140, 70, 1, .5], [300, 40, .8, .3], [30, 150, .7, .22]].forEach(([x, y, s, sp]) => {
        const o = el('g', {}, cloudL);
        [[0, 0, 22], [24, -10, 28], [50, 0, 20], [24, 6, 22]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill: '#fff', opacity: .95 }, o));
        clouds.push({ o, x, y, s, sp: sp * 14 });
      });
      function setSeason(i, animate) {
        si = i; season = SEASONS[i];
        strip.setAttribute('fill', ['#8fcf6a', '#6cc45a', '#d9b060'][i]);
        const old = scen;
        scen = buildSeason(i);
        if (old && animate) {
          scen.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900 }).onfinish = () => old.remove();
        } else if (old) old.remove();
        makeFliers();
      }

      /* ---------- particles: crumbs, petals, leaves ---------- */
      const parts = [];
      function crumbs(x, y, n, up = 1) {
        for (let k = 0; k < n; k++) {
          const node = el('circle', { r: rand(2.5, 6).toFixed(1), fill: pick(['#8a5a32', '#a8744a', '#6e4526', '#c98a55']) }, fx);
          parts.push({ node, x: x + rand(-30, 30), y: y + rand(-4, 4), vx: rand(-170, 170), vy: -rand(160, 380) * up, g: 1000, life: rand(.6, 1), rot: 0, vr: 0 });
        }
      }
      function driftOne(x, y, burst) {
        if (!season.drift || drifts.length > 9) return;
        const c = pick(season.drift);
        const o = el('g', {}, fx);
        const node = season.key === 'autumn'
          ? el('path', { d: 'M0,-10 L3,-4 L9,-6 L6,0 L10,4 L3,4 L2,10 L0,6 L-2,10 L-3,4 L-10,4 L-6,0 L-9,-6 L-3,-4Z', fill: c }, o)
          : el('ellipse', { rx: 6, ry: 4, fill: c }, o);
        void node;
        drifts.push({ o, x, y, vx: burst ? rand(-90, 90) : rand(10, 40), vy: burst ? rand(-120, -20) : rand(24, 46), ph: rand(0, 6), rot: rand(0, 360), life: burst ? 2.2 : 12 });
      }

      /* ---------- field slots ---------- */
      const slots = GROUND.map(([x, y], i) => {
        const g = el('g', { transform: `translate(${x} ${y}) scale(${S})` }, slotL);
        const back = el('g', {}, g);
        const hold = el('g', { 'clip-path': 'url(#farm-clip)' }, g);
        const front = el('g', {}, g);
        const hit = el('rect', { x: x - 86, y: y - 150, width: 172, height: 190, fill: 'transparent' }, hitL);
        const s = { i, x, y, g, back, hold, front, hit, stage: 0, busy: false, veg: null, mole: false };
        hit.addEventListener('pointerdown', e => { e.stopPropagation(); pull(s); });
        return s;
      });
      let spotN = 0, basketItems = [], round = false, roundN = 0, goldSlot = -1, thiefRound = false, thief = null;

      function plant(s, kindKey, grow, delay = 0) {
        if (s.veg) s.veg.outer.remove();
        s.back.replaceChildren(); s.front.replaceChildren();
        const kind = VEG[kindKey];
        if (kind.mode === 'root') el('ellipse', { cx: 0, cy: 0, rx: 34, ry: 9, fill: '#6e4526' }, s.back);
        else kind.back(s.back);
        const gold = s.i === goldSlot;
        const outer = el('g', {}, s.hold);
        const inner = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, outer);
        let halo = null;
        if (gold) {
          halo = el('g', {}, inner);
          [[-40, -60], [38, -84], [44, -20], [-44, -10]].forEach(([x, y], k) => el('path', { d: 'M0,-10 Q1.5,-1.5 10,0 Q1.5,1.5 0,10 Q-1.5,1.5 -10,0 Q-1.5,-1.5 0,-10Z', fill: '#fff38a', class: 'twinkle', style: `animation-delay:-${k * .6}s` }, el('g', { transform: `translate(${x} ${y})` }, halo)));
        }
        const f = kind.draw(inner, gold);
        if (kind.mode === 'root') el('path', { d: 'M-44,1 Q0,18 44,1 Q0,10 -44,1Z', fill: '#b97a48' }, s.front);
        s.veg = { key: kindKey, kind, outer, inner, face: f, rise: 0, gold };
        s.stage = 0;
        setRise(s, s.veg, kind.mode === 'root' ? kind.peek : 0);
        if (grow) {
          inner.style.opacity = 0;
          ctx.after(delay, () => {
            inner.style.opacity = '';
            inner.animate([{ transform: 'scale(.1)' }, { transform: 'scale(1.15,.9)', offset: .65 }, { transform: 'scale(.95,1.05)', offset: .85 }, { transform: 'scale(1)' }], { duration: 650, easing: 'ease-out' });
            crumbs(s.x, s.y, 5, .6);
            A.sfx('pop2', { vol: .45, rate: rand(.9, 1.2) }) || A.pop();
          });
        }
      }
      function setRise(s, v, r) { if (s.veg !== v) return; v.rise = r; v.outer.setAttribute('transform', `translate(0 ${(-r).toFixed(1)})`); }

      function pull(s) {
        if (!s.veg) { crumbs(s.x, s.y, 4); A.sfx('pop2', { vol: .35, rate: rand(.8, 1.1) }); return; }
        if (s.busy) return;
        if (round) {
          s.veg.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.9)' }, { transform: 'scale(.95,1.06)' }, { transform: 'scale(1)' }], { duration: 300 });
          A.sfx('blink', { vol: .4, rate: rand(.9, 1.2) }); return;
        }
        haptic(); s.stage++;
        const v = s.veg, root = v.kind.mode === 'root';
        if (s.stage < 3) {
          A.pluck(mtof(60 + s.stage * 5), { vol: .2 });
          A.sfx('slide', { vol: .18, rate: 1.4 + s.stage * .2 });
          say(s.stage === 1 ? 'うんとこしょ' : 'どっこいしょ');
          v.face.set(s.stage === 2 ? 'wow' : 'normal');
          const from = v.rise, to = root ? v.kind.peek + (v.kind.len - v.kind.peek) * s.stage * .33 : s.stage * 5;
          ctx.tween(240, k => setRise(s, v, from + (to - from) * k), null, easeBack);
          const st = 1 + s.stage * .1;
          v.inner.animate([{ transform: 'scale(1,1)' }, { transform: `scale(${2 - st},${st + .08})`, offset: .4 }, { transform: 'scale(1.06,.94)', offset: .75 }, { transform: 'scale(1,1)' }], { duration: 420, easing: 'ease-out' });
          crumbs(s.x, s.y, root ? 7 : 4);
          return;
        }
        s.busy = true;
        // big stretch, then the pop
        v.face.set('wow');
        v.inner.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(.78,1.35)' }], { duration: 160, fill: 'forwards', easing: 'ease-in' });
        ctx.after(160, () => pop(s, v));
      }
      function pop(s, v) {
        const root = v.kind.mode === 'root';
        A.sfx('spring', { vol: .7, rate: rand(.95, 1.12) }) || A.boing();
        haptic(25);
        say(v.kind.n);
        crumbs(s.x, s.y, root ? 16 : 8);
        if (v.gold) { A.sfx('coin', { vol: .6 }); ctx.sparkle(s.x, s.y - 80, 8, 70); }
        const sx = s.x, sy = s.y - v.rise * S;
        fly.appendChild(v.outer);
        v.inner.getAnimations().forEach(a => a.cancel());
        v.inner.animate([{ transform: 'scale(.8,1.3)' }, { transform: 'scale(1.15,.88)', offset: .3 }, { transform: 'scale(1)' }], { duration: 420 });
        s.veg = null;
        if (s.mole) moleUp(s);
        if (!root) s.back.animate([{ opacity: 1 }, { opacity: .5 }], { duration: 600, fill: 'forwards' });
        const spot = spotN++;
        const [bx, by] = basketSpot(spot, v.kind.mode);
        const spin = (sx < 200 ? 1 : -1) * 360 + rand(-20, 20);
        const peak = Math.min(sy, by) - 200;
        const sc0 = S, sc1 = .72;
        ctx.tween(820, k => {
          const x = sx + (bx - sx) * k;
          const y = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * peak + k * k * by;
          v.outer.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(spin * easeInOut(k) + bxRot(spot) * k).toFixed(0)}) scale(${(sc0 + (sc1 - sc0) * k).toFixed(3)})`);
        }, () => land(s, v, spot), k => k);
        ctx.after(400, () => { s.busy = false; });
      }
      function basketSpot(i, mode) {
        const xs = [148, 252, 182, 218, 200];
        return [xs[i % 5], BASKET.rim + (mode === 'root' ? -26 : 28)];
      }
      function bxRot(i) { return [-16, 16, -6, 8, 0][i % 5]; }
      function land(s, v, spot) {
        stack.appendChild(v.outer);
        v.face.set('joy');
        v.inner.animate([{ transform: 'scale(1.3,.7)' }, { transform: 'scale(.9,1.12)', offset: .5 }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
        A.sfx('boing', { vol: .6, rate: rand(.95, 1.2) }) || A.boing();
        basketB.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.08,.9)' }, { transform: 'scale(.97,1.04)' }, { transform: 'scale(1)' }], { duration: 360 });
        const [bx] = basketSpot(spot, v.kind.mode);
        ctx.sparkle(bx, BASKET.rim - 30, 3, 30);
        crumbs(bx, BASKET.rim, 4, .5);
        basketItems.push({ v, spot });
        basketItems.sort((a, b) => a.spot - b.spot);
        ghost.hop();
        ctx.after(700, () => v.face.set('normal'));
        const n = basketItems.length;
        if (n >= 4 && !thief) celebrate();
        else {
          if (thiefRound && n === 2 && !thief) { thiefRound = false; ctx.after(500, thiefCome); }
          if (n === 2 || v.gold) { ghost.set('happy'); ghost.talk(v.gold ? 'すごーい！' : pick(['いいね！', 'おおきいね！', 'じょうず！']), false); ctx.after(1200, () => { if (!round) ghost.set('normal'); }); }
        }
      }

      /* ---------- mole ---------- */
      function moleUp(s) {
        s.mole = false;
        const o = el('g', { transform: `translate(${s.x} ${s.y})` }, slotL);
        const hole = el('ellipse', { cx: 0, cy: 0, rx: 46, ry: 12, fill: '#6e4526' }, o);
        const clipM = el('clipPath', { id: 'farm-mc' + s.i + '-' + Date.now() }, defs);
        el('rect', { x: -80, y: -200, width: 160, height: 202 }, clipM);
        const hold = el('g', { 'clip-path': `url(#${clipM.id})` }, o);
        const m = el('g', { transform: 'translate(0 90)' }, hold);
        const mb = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, m);
        el('ellipse', { cx: 0, cy: 0, rx: 40, ry: 46, fill: '#7a5a4a' }, mb);
        el('path', { d: 'M-38,-14 A40,40 0 0 1 38,-14Z', fill: '#ffd23f' }, mb);
        el('rect', { x: -44, y: -18, width: 88, height: 10, rx: 5, fill: '#ffb800' }, mb);
        el('circle', { cx: 0, cy: -46, r: 6, fill: '#fff6b0' }, mb);
        el('path', { d: 'M-20,0 Q-13,-6 -6,0 M6,0 Q13,-6 20,0', stroke: '#2b2340', 'stroke-width': 3.6, fill: 'none', 'stroke-linecap': 'round' }, mb);
        el('ellipse', { cx: 0, cy: 16, rx: 17, ry: 12, fill: '#d8b0a0' }, mb);
        el('ellipse', { cx: 0, cy: 10, rx: 7, ry: 5, fill: '#ff8fa3' }, mb);
        [-1, 1].forEach(k => el('ellipse', { cx: k * 26, cy: 10, rx: 6, ry: 4, fill: '#ffa3b8', opacity: .8 }, mb));
        [-1, 1].forEach(k => el('ellipse', { cx: k * 36, cy: 30, rx: 13, ry: 8, fill: '#d8b0a0', transform: `rotate(${k * -20} ${k * 36} 30)` }, mb));
        el('path', { d: 'M-50,2 Q0,22 50,2 Q0,12 -50,2Z', fill: '#b97a48' }, o);
        ctx.after(300, () => {
          A.giggle(); say('もぐもぐ！'); A.sfx('boing2', { vol: .5 });
          crumbs(s.x, s.y, 10);
          ctx.tween(380, k => m.setAttribute('transform', `translate(0 ${(90 - k * 96).toFixed(1)})`), () => {
            mb.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0deg)' }], { duration: 600, iterations: 2 });
          }, easeBack);
          ctx.after(1700, () => ctx.tween(300, k => m.setAttribute('transform', `translate(0 ${(-6 + k * 100).toFixed(1)})`), () => {
            hole.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400 }).onfinish = () => { o.remove(); clipM.remove(); };
          }, easeIn));
        });
      }

      /* ---------- basket ---------- */
      const basketB = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, basketO);
      el('ellipse', { cx: 200, cy: 752, rx: 118, ry: 10, fill: '#3a2f5b', opacity: .16 }, basketB);
      el('ellipse', { cx: 200, cy: BASKET.rim, rx: 104, ry: 18, fill: '#8a5a2e' }, basketB);
      const stack = el('g', {}, basketB);
      el('path', { d: `M96,${BASKET.rim} L304,${BASKET.rim} L284,750 Q282,756 274,756 L126,756 Q118,756 116,750Z`, fill: '#e0aa62' }, basketB);
      for (let k = 0; k < 4; k++) el('path', { d: `M${103 + k * 4},${694 + k * 16} L${297 - k * 4},${694 + k * 16}`, stroke: '#c48a46', 'stroke-width': 4, 'stroke-linecap': 'round' }, basketB);
      for (let k = 0; k < 7; k++) el('path', { d: `M${124 + k * 25},${BASKET.rim + 8} L${128 + k * 24},752`, stroke: '#cf9650', 'stroke-width': 3 }, basketB);
      el('rect', { x: 90, y: BASKET.rim - 8, width: 220, height: 17, rx: 8.5, fill: '#c48a46' }, basketB);
      el('ellipse', { cx: 140, cy: BASKET.rim - 2, rx: 30, ry: 3.5, fill: '#fff', opacity: .35 }, basketB);
      const basketHit = el('rect', { x: 90, y: BASKET.rim - 30, width: 220, height: 90, fill: 'transparent' }, basketB);
      basketHit.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic(8);
        basketB.animate([{ transform: 'scale(1,1)' }, { transform: 'scale(1.06,.92)' }, { transform: 'scale(.98,1.04)' }, { transform: 'scale(1)' }], { duration: 320 });
        A.sfx('boing2', { vol: .4, rate: rand(1, 1.3) }) || A.boing();
        basketItems.forEach(({ v }, k) => ctx.after(k * 60, () => { v.face.set('joy'); v.inner.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-14px) scale(.94,1.08)' }, { transform: 'translateY(0px)' }], { duration: 320, easing: 'ease-out' }); }));
        ctx.after(700, () => basketItems.forEach(({ v }) => v.face.set('normal')));
        if (!basketItems.length) ctx.sparkle(200, BASKET.rim - 10, 3, 50);
      });

      /* ---------- the thief: a chick in spring, a crow later ---------- */
      function thiefCome() {
        if (round || !basketItems.length) return;
        const kind = season.thief;
        const o = el('g', {}, svg);
        svg.insertBefore(o, fly);
        const flip = el('g', {}, o);
        const body = el('g', { class: 'tb' }, flip);
        const wing = bird(body, kind);
        wing.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-40deg)' }], { duration: 140, iterations: Infinity, direction: 'alternate' });
        thief = { o, flip, body, kind, holding: null, x: 460, y: 300, dir: 1 };
        const T = thief;
        const place = (x, y, d) => { T.x = x; T.y = y; T.dir = d; o.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${d} 1)`); };
        T.place = place;
        o.addEventListener('pointerdown', e => { e.stopPropagation(); haptic(10); if (T.holding && T.perched) { wave(true); scare(); } else { cry(); body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2,.85)' }, { transform: 'scale(1)' }], { duration: 260 }); } });
        cry();
        ghost.set('surprise');
        const item = basketItems[basketItems.length - 1];
        const [ix] = basketSpot(item.spot, item.v.kind.mode), iy = BASKET.rim - 40;
        ctx.tween(900, k => place(460 + (ix + 20 - 460) * k, 300 + (iy - 300) * k - Math.sin(k * Math.PI) * 120, 1), () => {
          // grab!
          A.sfx('pop', { vol: .6 });
          basketItems.splice(basketItems.indexOf(item), 1);
          T.holding = item;
          body.appendChild(item.v.outer);
          item.v.outer.setAttribute('transform', 'translate(-40 12) rotate(-20) scale(.5)');
          item.v.face.set('wow');
          ghost.talk('あっ！'); A.sfx('slide', { vol: .45 });
          const x0 = T.x, y0 = T.y, px = 118, py = 304 - 102 * .92 - 22;
          ctx.tween(1000, k => place(x0 + (px - x0) * k, y0 + (py - y0) * k - Math.sin(k * Math.PI) * 90, 1), () => {
            T.perched = true;
            body.animate([{ transform: 'scale(1.15,.85)' }, { transform: 'scale(1)' }], { duration: 260 });
            cry();
            T.autoT = ctx.after(2600, () => { if (T.holding) { wave(true); scare(); } });
          }, easeInOut);
        }, easeInOut);
      }
      function cry() {
        if (!thief) return;
        if (thief.kind === 'crow') { A.osc(520, { type: 'sawtooth', lp: 1300, hold: .12, slide: 380, slideT: .25, r: .15, vol: .12 }); A.osc(500, { type: 'sawtooth', lp: 1300, when: .3, hold: .1, slide: 360, slideT: .22, r: .15, vol: .1 }); }
        else if (!A.animal('bird', { vol: .6, rate: 1.2 })) A.chirp();
      }
      function scare() {
        const T = thief;
        if (!T || !T.holding || T.leaving) return;
        T.leaving = true; T.perched = false;
        const item = T.holding; T.holding = null;
        cry(); A.sfx('whoosh2', { vol: .5 });
        T.body.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-20px) scale(.9,1.15)' }, { transform: 'translateY(0px)' }], { duration: 300 });
        // drop the vegetable: it bounces back into the basket
        const sx = T.x - 40, sy = T.y + 12;
        fly.appendChild(item.v.outer);
        const spot = item.spot;
        const [bx, by] = basketSpot(spot, item.v.kind.mode);
        ctx.tween(900, k => {
          const x = sx + (bx - sx) * k, y = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * (sy - 120) + k * k * by;
          item.v.outer.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(k * 380).toFixed(0)}) scale(${(.5 + .22 * k).toFixed(3)})`);
        }, () => { ghost.set('happy'); thief = null; land(null, item.v, spot); }, k => k);
        const x0 = T.x, y0 = T.y;
        ctx.tween(1200, k => T.place(x0 + (-140 - x0) * k, y0 - 260 * k + Math.sin(k * 12) * 12, 1), () => T.o.remove(), easeIn);
      }

      /* ---------- payoff ---------- */
      function celebrate() {
        round = true; roundN++;
        haptic(30);
        A.tada();
        ctx.confetti(200, BASKET.rim - 20, 36);
        ctx.after(700, () => { ctx.confetti(120, 420, 24); ctx.confetti(280, 420, 24); });
        basketItems.forEach(({ v }, k) => ctx.after(k * 130, () => {
          v.face.set('joy');
          v.inner.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: 'translateY(-34px) scale(.9,1.12)', offset: .45 }, { transform: 'translateY(0px) scale(1.12,.9)', offset: .8 }, { transform: 'translateY(0px) scale(1)' }], { duration: 520, iterations: 3, easing: 'ease-in-out' });
          A.bell(mtof(PENTA[4 + k]), { vol: .08 });
        }));
        basketB.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06,.94)' }, { transform: 'scale(1)' }], { duration: 520, iterations: 3 });
        wave(true);
        ghost.set('happy');
        ghost.moveTo(200, 500, .8, 600, () => {
          ghost.hop(); ghost.giggle(); ghost.talk('いっぱい とれたね！');
          ctx.after(700, () => ghost.moveTo(300, 440, .8, 500, () => { ghost.hop(); ghost.moveTo(100, 470, .8, 700, () => ghost.hop(), easeInOut); }, easeOut));
        }, easeBack);
        ctx.after(3000, reset);
      }
      function reset() {
        // the harvest twinkles away, the season turns
        basketItems.forEach(({ v }, k) => ctx.after(k * 90, () => {
          const [bx] = basketSpot(k, v.kind.mode);
          ctx.sparkle(bx, BASKET.rim - 30, 2, 26);
          v.outer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => v.outer.remove();
        }));
        basketItems = []; spotN = 0;
        ghost.moveTo(322, 196, .62, 900, () => ghost.set('normal'), easeInOut);
        A.sfx('whoosh2', { vol: .55 }) || A.whoosh();
        const next = (si + 1) % SEASONS.length;
        ctx.after(250, () => {
          setSeason(next, true);
          for (let k = 0; k < 8; k++) ctx.after(k * 70, () => driftOne(rand(-20, 60), rand(200, 600), true));
          ghost.talk(['はるだよ', 'なつだよ', 'あきだよ'][next]);
        });
        ctx.after(1000, () => newRound(true));
      }
      function newRound(grow) {
        thiefRound = roundN > 0 && Math.random() < .3;
        goldSlot = Math.random() < 1 / 6 ? Math.floor(rand(0, 4)) : -1;
        const moleAt = Math.random() < .7 ? Math.floor(rand(0, 4)) : -1;
        const keys = season.veg();
        slots.forEach((s, i) => { s.mole = i === moleAt; s.busy = false; plant(s, keys[i], grow, i * 200); });
        ctx.after(grow ? 500 : 0, () => { round = false; });
      }

      /* ---------- background taps ---------- */
      ghost.pos.addEventListener('pointerdown', e => { e.stopPropagation(); if (round) return; ghost.giggle(); ctx.after(900, () => { if (!round) ghost.set('normal'); }); });
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e);
        slots.forEach(s => { if (s.veg) { const dx = p.x - s.x, dy = p.y - (s.y - 40); const d = Math.hypot(dx, dy) || 1; s.veg.face.look(dx / d * 2.4, dy / d * 2); } });
      }, true);
      svg.addEventListener('pointerdown', e => {
        const p = ctx.point(e);
        if (p.x < 80 && p.y < 80) return;
        haptic(5);
        if (p.y < 300) {
          if (season.drift) for (let k = 0; k < 4; k++) driftOne(p.x, p.y, true);
          else ctx.sparkle(p.x, p.y, 3, 26, '#ffffff');
          A.sfx('blink', { vol: .4, rate: rand(.8, 1.3) }) || A.twinkle();
          const f = pick(fliers); if (f) f.boost = .6;
        } else {
          crumbs(p.x, p.y + 6, 6, .7);
          A.sfx('pop2', { vol: .3, rate: rand(.7, 1) });
          if (Math.random() < .35) ctx.sparkle(p.x, p.y - 10, 2, 16, '#ffe066');
        }
      });

      /* ---------- frame loop ---------- */
      ctx.loop((dt, t) => {
        clouds.forEach(c => {
          c.x += c.sp * dt; if (c.x > 460) c.x = -120;
          c.o.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y}) scale(${c.s})`);
        });
        fliers.forEach((f, k) => {
          f.boost = Math.max(0, f.boost - dt * .8);
          f.ph += dt * f.sp * (1 + f.boost * 4);
          const x = f.cx + Math.sin(f.ph * 1.3 + k) * f.ax, y = f.cy + Math.sin(f.ph * 2.1) * f.ay + Math.sin(t * 6 + k) * 3;
          const dirX = Math.cos(f.ph * 1.3 + k);
          f.x = x; f.y = y;
          f.o.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(dirX * 14).toFixed(0)})`);
        });
        for (let k = parts.length - 1; k >= 0; k--) {
          const q = parts[k];
          q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt;
          if (q.life <= 0) { q.node.remove(); parts.splice(k, 1); continue; }
          q.node.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
          q.node.setAttribute('opacity', clamp(q.life * 4, 0, 1).toFixed(2));
        }
        for (let k = drifts.length - 1; k >= 0; k--) {
          const q = drifts[k];
          q.vy += (40 - q.vy) * dt * .8; q.vx += (20 - q.vx) * dt * .5;
          q.x += (q.vx + Math.sin(t * 2 + q.ph) * 30) * dt; q.y += q.vy * dt; q.rot += 90 * dt; q.life -= dt;
          if (q.life <= 0 || q.y > 780 || q.x > 440) { q.o.remove(); drifts.splice(k, 1); continue; }
          q.o.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${q.rot.toFixed(0)})`);
          q.o.setAttribute('opacity', clamp(q.life, 0, 1).toFixed(2));
        }
      });
      ctx.every(1400, () => { if (season.drift && drifts.length < 6) driftOne(rand(-20, 380), -10, false); });
      ctx.every(1100, () => {
        const s = pick(slots); if (s.veg && Math.random() < .7) s.veg.face.blink();
        if (Math.random() < .25) SC.face.blink();
        const s2 = pick(slots);
        if (s2.veg && !s2.busy && Math.random() < .3) s2.veg.inner.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' }], { duration: 700, easing: 'ease-in-out' });
      });

      setSeason(0, false);
      newRound(false);
      for (let k = 0; k < 4; k++) driftOne(rand(20, 380), rand(120, 560), false);
      ctx.after(500, () => { ghost.set('happy'); ghost.talk('ひっぱってね！'); ctx.after(1500, () => { if (!round) ghost.set('normal'); }); });
      ctx.hint = () => {
        if (round) return null;
        if (thief && thief.perched) return [thief.x, thief.y];
        const s = slots.find(q => q.veg && !q.busy);
        return s ? [s.x, s.y - 50] : null;
      };
    }
  };
  TOYS.push(farmToy);
})();
