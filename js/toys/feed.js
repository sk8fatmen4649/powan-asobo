'use strict';
/* =========================================================
   toy: もぐもぐ — feed hungry animal friends.
   Three settings take turns (picnic, zoo, farm). Hungry tummies
   rumble, lips get licked, food goes crunch, tummies grow round,
   and at the end everyone lies back and pats a full belly.
   Now and then it is somebody's birthday: a cake, and a song.
   ========================================================= */
(() => {
  const INK = '#3a2f5b';
  const f1 = v => (+v).toFixed(1);

  /* ---------- foods ---------- */
  function foodFace(g, x, y, k = 1) {
    [-9, 9].forEach(dx => {
      el('ellipse', { cx: x + dx * k, cy: y, rx: 3.6 * k, ry: 4.3 * k, fill: INK }, g);
      el('circle', { cx: x + (dx - 1.3) * k, cy: y - 1.7 * k, r: 1.5 * k, fill: '#fff' }, g);
    });
    el('path', { d: `M${x - 5 * k},${y + 6 * k} Q${x},${y + 11 * k} ${x + 5 * k},${y + 6 * k}`, stroke: INK, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, g);
    [-16, 16].forEach(dx => el('ellipse', { cx: x + dx * k, cy: y + 5 * k, rx: 4.6 * k, ry: 3 * k, fill: '#ffa3b8', opacity: .85 }, g));
  }
  const shineDot = (g, x, y, rx, ry, rot) => el('ellipse', { cx: x, cy: y, rx, ry, fill: '#fff', opacity: .55, transform: `rotate(${rot} ${x} ${y})` }, g);
  const FOODS = {
    apple: { say: 'りんご', crumbs: ['#ff6b6b', '#fff3d6'], draw(g) {
      el('path', { d: 'M0,-22 C14,-34 36,-26 34,0 C32,24 14,34 0,28 C-14,34 -32,24 -34,0 C-36,-26 -14,-34 0,-22Z', fill: '#ff6b6b' }, g);
      el('path', { d: 'M0,-22 Q1,-32 5,-38', stroke: '#8a5a3a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M4,-31 Q16,-44 28,-36 Q18,-26 4,-31Z', fill: '#6fcf6a' }, g);
      shineDot(g, -17, -12, 8, 4.5, -35);
      foodFace(g, 0, 4);
    } },
    carrot: { say: 'にんじん', crumbs: ['#ff9a3c', '#ffc27a'], draw(g) {
      el('path', { d: 'M-2,-20 Q-16,-34 -20,-46 Q-6,-42 0,-24Z', fill: '#4cc44a' }, g);
      el('path', { d: 'M0,-22 Q0,-40 4,-50 Q12,-38 4,-22Z', fill: '#5cd15a' }, g);
      el('path', { d: 'M2,-20 Q16,-32 22,-44 Q24,-30 4,-18Z', fill: '#4cc44a' }, g);
      el('path', { d: 'M-22,-16 Q-22,18 0,44 Q22,18 22,-16 Q0,-26 -22,-16Z', fill: '#ff9a3c' }, g);
      el('path', { d: 'M-16,16 L-9,16 M9,24 L15,24 M-6,32 L-1,32', stroke: '#e5781e', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      shineDot(g, -12, -8, 4, 8, 0);
      foodFace(g, 0, -4, .9);
    } },
    onigiri: { say: 'おにぎり', crumbs: ['#ffffff', '#f4efe4'], draw(g) {
      el('path', { d: 'M0,-34 Q10,-34 30,6 Q40,30 18,32 L-18,32 Q-40,30 -30,6 Q-10,-34 0,-34Z', fill: '#fffdf7', stroke: '#ece4d6', 'stroke-width': 2.5 }, g);
      el('rect', { x: -15, y: 12, width: 30, height: 20, rx: 3, fill: '#35584a' }, g);
      el('ellipse', { cx: -10, cy: -18, rx: 6, ry: 3.5, fill: '#fff', transform: 'rotate(-50 -10 -18)' }, g);
      foodFace(g, 0, -4, .9);
    } },
    banana: { say: 'バナナ', crumbs: ['#ffe066', '#fff6c8'], draw(g) {
      el('path', { d: 'M-34,-22 C-40,18 -8,40 24,32 C36,28 42,18 40,8 C28,14 8,12 -6,4 C-18,-4 -24,-12 -26,-22 Z', fill: '#ffe066' }, g);
      el('path', { d: 'M-30,-8 C-26,14 -4,28 22,26', stroke: '#f2c94c', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('rect', { x: -34, y: -30, width: 8, height: 10, rx: 3, fill: '#8a6a3a', transform: 'rotate(-10 -30 -25)' }, g);
      el('circle', { cx: 40, cy: 9, r: 3.5, fill: '#8a6a3a' }, g);
      foodFace(g, -2, 14, .78);
    } },
    cookie: { say: 'クッキー', crumbs: ['#e8b06a', '#7a4a2e'], draw(g) {
      el('circle', { r: 32, fill: '#e8b06a', stroke: '#d4954e', 'stroke-width': 3 }, g);
      [[-18, -16], [16, -20], [-22, 14], [20, 16], [2, 24], [0, -26]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 4, ry: 3.2, fill: '#7a4a2e' }, g));
      shineDot(g, -12, -22, 7, 3.5, -30);
      foodFace(g, 0, 0);
    } },
    fish: { say: 'おさかな', crumbs: ['#7cc4ff', '#ffd2dc'], draw(g) {
      el('path', { d: 'M18,0 L40,-18 Q34,0 40,18Z', fill: '#5aa8f0' }, g);
      el('path', { d: 'M-4,-20 Q4,-30 12,-18Z', fill: '#5aa8f0' }, g);
      el('ellipse', { cx: -4, cy: 0, rx: 30, ry: 22, fill: '#7cc4ff' }, g);
      el('path', { d: 'M-30,4 Q-4,24 22,4 Q-4,14 -30,4Z', fill: '#d6efff' }, g);
      el('path', { d: 'M10,-14 Q16,0 10,14', stroke: '#5aa8f0', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, g);
      shineDot(g, -14, -12, 7, 3, -20);
      foodFace(g, -12, -3, .85);
    } },
    milk: { say: 'ミルク', drink: true, crumbs: ['#ffffff', '#dff0ff'], draw(g) {
      el('path', { d: 'M-11,-30 L11,-30 L11,-22 Q24,-12 24,2 L24,30 Q24,38 16,38 L-16,38 Q-24,38 -24,30 L-24,2 Q-24,-12 -11,-22Z', fill: '#ffffff', stroke: '#dbe7f5', 'stroke-width': 2.5 }, g);
      el('rect', { x: -14, y: -40, width: 28, height: 12, rx: 5, fill: '#6fa8ff' }, g);
      el('rect', { x: -24, y: 18, width: 48, height: 12, fill: '#bfe0ff' }, g);
      el('ellipse', { cx: -14, cy: -6, rx: 3.5, ry: 8, fill: '#eef5ff' }, g);
      foodFace(g, 0, 0, .9);
    } },
    bone: { crumbs: ['#fff8ec', '#efe2cc'], draw(g) {
      const b = el('g', { transform: 'rotate(-18)' }, g);
      [[-30, -10], [-30, 10], [30, -10], [30, 10]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 12, fill: '#fff8ec', stroke: '#eadcc4', 'stroke-width': 2.5 }, b));
      el('rect', { x: -32, y: -11, width: 64, height: 22, rx: 8, fill: '#fff8ec' }, b);
      el('path', { d: 'M-24,-6 H18', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }, b);
      foodFace(g, 0, 0, .8);
    } },
    meat: { crumbs: ['#c8643c', '#ffd2b8'], draw(g) {
      el('rect', { x: 14, y: -6, width: 26, height: 12, rx: 5, fill: '#fff8ec' }, g);
      [[40, -7], [40, 7]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 8, fill: '#fff8ec', stroke: '#eadcc4', 'stroke-width': 2 }, g));
      el('ellipse', { cx: -8, cy: 0, rx: 32, ry: 27, fill: '#c8643c' }, g);
      el('ellipse', { cx: -10, cy: -2, rx: 24, ry: 19, fill: '#e07a4e' }, g);
      shineDot(g, -22, -12, 8, 4, -30);
      foodFace(g, -10, 0, .85);
    } },
    grass: { crumbs: ['#7fd36b', '#b6ee9a'], draw(g) {
      [[-26, -30], [-12, -40], [4, -44], [18, -38], [30, -26]].forEach(([x, y], i) => el('path', { d: `M0,18 Q${x * .6},${y * .3} ${x},${y} Q${x * .2},${y * .5} 0,18Z`, fill: i % 2 ? '#6cc45a' : '#8fdc6f', stroke: i % 2 ? '#6cc45a' : '#8fdc6f', 'stroke-width': 9, 'stroke-linejoin': 'round' }, g));
      el('circle', { cx: 20, cy: -30, r: 7, fill: '#fff' }, g); el('circle', { cx: 20, cy: -30, r: 3, fill: '#ffd23f' }, g);
      el('rect', { x: -24, y: 6, width: 48, height: 28, rx: 12, fill: '#ffb38a' }, g);
      foodFace(g, 0, 18, .78);
    } },
    bread: { crumbs: ['#e8a85a', '#fff1d6'], draw(g) {
      el('path', { d: 'M-36,12 Q-40,-22 -14,-26 Q0,-36 14,-26 Q40,-22 36,12 Q36,26 22,26 H-22 Q-36,26 -36,12Z', fill: '#e8a85a' }, g);
      el('path', { d: 'M-30,0 Q-32,-18 -12,-20 Q0,-28 12,-20 Q32,-18 30,0Z', fill: '#f6c27a' }, g);
      el('path', { d: 'M-16,-18 l6,8 M0,-22 l6,8 M16,-18 l6,8', stroke: '#d48a3e', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      foodFace(g, 0, 8, .85);
    } },
    berry: { crumbs: ['#ff5d72', '#ffd2dc'], draw(g) {
      el('path', { d: 'M0,34 C-30,18 -34,-12 -18,-20 Q0,-28 18,-20 C34,-12 30,18 0,34Z', fill: '#ff5d72' }, g);
      [[-14, -4], [12, -6], [-6, 16], [10, 14], [0, 2], [-18, 8], [18, 6]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 1.8, ry: 2.6, fill: '#ffe680' }, g));
      el('path', { d: 'M-16,-20 L-6,-30 L0,-22 L6,-30 L16,-20 L4,-18 L0,-24 L-4,-18Z', fill: '#5cd15a', stroke: '#5cd15a', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
      shineDot(g, -12, -8, 5, 3, -40);
      foodFace(g, 0, 4, .8);
    } },
    slice: { crumbs: ['#fff1d6', '#ff9cb2'], draw(g) {
      el('path', { d: 'M-34,30 L-34,-8 L34,-22 L34,30Z', fill: '#fff1d6' }, g);
      el('path', { d: 'M-34,8 L34,0 L34,8 L-34,16Z', fill: '#ff9cb2' }, g);
      el('path', { d: 'M-38,-8 Q-34,-16 0,-22 Q30,-30 38,-24 Q40,-16 34,-18 Q20,-10 -34,-4 Q-40,-4 -38,-8Z', fill: '#fff' }, g);
      el('path', { d: 'M8,-26 C-6,-30 -4,-46 8,-44 C20,-46 22,-30 8,-26Z', fill: '#ff5d72' }, g);
      el('path', { d: 'M3,-44 L8,-50 L13,-44', stroke: '#5cd15a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
      foodFace(g, 0, 16, .78);
    } }
  };

  /* ---------- animal friends: big heads with mouths that open, lick and chew ---------- */
  const KINDS = {
    dog: { cry: 'dog', n: 'いぬさん', fav: 'bone', body: '#d9a066', belly: '#f3d9b5', paw: '#c48a50', eye: [20, -10], mouth: [0, 26, 1],
      draw(g) {
        el('circle', { r: 50, fill: '#d9a066' }, g);
        el('ellipse', { cx: 18, cy: -8, rx: 17, ry: 15, fill: '#c48a50' }, g);
        el('ellipse', { cx: -48, cy: -4, rx: 16, ry: 32, fill: '#9c6a3a', transform: 'rotate(18 -48 -4)' }, g);
        el('ellipse', { cx: 48, cy: -4, rx: 16, ry: 32, fill: '#9c6a3a', transform: 'rotate(-18 48 -4)' }, g);
        el('ellipse', { cx: 0, cy: 18, rx: 26, ry: 18, fill: '#f3d9b5' }, g);
        el('ellipse', { cx: 0, cy: 9, rx: 9, ry: 6, fill: '#3a2a20' }, g);
      } },
    cat: { cry: 'cat', n: 'ねこさん', fav: 'fish', body: '#ffb066', belly: '#ffe2bf', paw: '#ffa95c', eye: [20, -4], mouth: [0, 22, .9],
      draw(g) {
        el('path', { d: 'M-46,-20 L-38,-68 L-8,-44Z', fill: '#ffa95c', 'stroke-linejoin': 'round', stroke: '#ffa95c', 'stroke-width': 6 }, g);
        el('path', { d: 'M46,-20 L38,-68 L8,-44Z', fill: '#ffa95c', 'stroke-linejoin': 'round', stroke: '#ffa95c', 'stroke-width': 6 }, g);
        el('path', { d: 'M-38,-30 L-35,-54 L-20,-41Z', fill: '#ffc4c4' }, g);
        el('path', { d: 'M38,-30 L35,-54 L20,-41Z', fill: '#ffc4c4' }, g);
        el('circle', { r: 50, fill: '#ffb066' }, g);
        el('path', { d: 'M-8,-48 L-6,-34 M0,-50 L0,-33 M8,-48 L6,-34', stroke: '#e88a3a', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
        el('ellipse', { cx: 0, cy: 18, rx: 22, ry: 14, fill: '#ffe2bf' }, g);
        el('path', { d: 'M-5,9 L5,9 L0,15Z', fill: '#ff7a8a' }, g);
        el('path', { d: 'M-26,12 L-50,7 M-26,19 L-50,21 M26,12 L50,7 M26,19 L50,21', stroke: '#a0603a', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
      } },
    frog: { cry: 'frog', n: 'かえるさん', fav: 'cookie', body: '#7fd36b', belly: '#d9f5b5', paw: '#6cc45a', eye: [26, -30], sclera: true, mouth: [0, 18, 1.4],
      draw(g) {
        el('circle', { cx: -26, cy: -30, r: 20, fill: '#7fd36b' }, g);
        el('circle', { cx: 26, cy: -30, r: 20, fill: '#7fd36b' }, g);
        el('ellipse', { cx: 0, cy: 6, rx: 58, ry: 44, fill: '#7fd36b' }, g);
      } },
    lion: { cry: 'lion', n: 'らいおんさん', fav: 'meat', body: '#ffcf6b', belly: '#fff1cf', paw: '#f6b94c', eye: [19, -8], mouth: [0, 30, .9],
      draw(g) {
        for (let i = 0; i < 14; i++) {
          const a = i / 14 * Math.PI * 2;
          el('circle', { cx: f1(Math.cos(a) * 54), cy: f1(Math.sin(a) * 54 + 2), r: 22, fill: i % 2 ? '#e0823a' : '#ef9a46' }, g);
        }
        [-36, 36].forEach(x => { el('circle', { cx: x, cy: -36, r: 13, fill: '#f6c35c' }, g); el('circle', { cx: x, cy: -36, r: 6, fill: '#ffb3a0' }, g); });
        el('circle', { r: 47, fill: '#ffcf6b' }, g);
        [-11, 11].forEach(x => el('ellipse', { cx: x, cy: 19, rx: 14, ry: 11, fill: '#fff1cf' }, g));
        el('path', { d: 'M-9,8 Q0,4 9,8 Q4,16 0,16 Q-4,16 -9,8Z', fill: '#8a4a2a' }, g);
        [[-18, 18], [-22, 23], [18, 18], [22, 23]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.6, fill: '#c88a4a' }, g));
      } },
    elephant: { cry: 'elephant', n: 'ぞうさん', fav: 'banana', body: '#bcc8e2', belly: '#dde4f3', paw: '#a9b8d6', eye: [20, -14], mouth: [-18, 30, .85], trunk: true,
      draw(g) {
        [-1, 1].forEach(s => {
          el('ellipse', { cx: s * 54, cy: -2, rx: 26, ry: 36, fill: '#a9b8d6' }, g);
          el('ellipse', { cx: s * 56, cy: 0, rx: 16, ry: 25, fill: '#f6c6d6' }, g);
        });
        el('circle', { r: 48, fill: '#bcc8e2' }, g);
      } },
    bird: { cry: 'bird', n: 'ことりさん', fav: 'apple', body: '#5fd38a', belly: '#ffe680', paw: '#46bd73', feet: '#ffb23f', eye: [20, -14], beak: '#ffb23f',
      draw(g) {
        [[-12, -44, -20], [0, -50, 0], [12, -44, 20]].forEach(([x, y, r], i) => el('ellipse', { cx: x, cy: y, rx: 7, ry: 16, fill: ['#ff6b7a', '#ffd23f', '#5fa8ff'][i], transform: `rotate(${r} ${x} ${y + 10})` }, g));
        el('circle', { r: 48, fill: '#5fd38a' }, g);
        [-20, 20].forEach(x => el('circle', { cx: x, cy: -14, r: 14, fill: '#e8fff0' }, g));
      } },
    cow: { cry: 'cow', n: 'うしさん', fav: 'grass', body: '#ffffff', belly: '#ffe1e8', paw: '#4a3f5e', stroke: '#ece6f5', eye: [20, -14], mouth: [0, 38, .8],
      draw(g) {
        [-1, 1].forEach(s => {
          el('path', { d: `M${s * 22},-40 Q${s * 30},-62 ${s * 40},-60 Q${s * 36},-48 ${s * 32},-36Z`, fill: '#fff1c9' }, g);
          el('ellipse', { cx: s * 56, cy: -16, rx: 20, ry: 11, fill: '#fff', stroke: '#ece6f5', 'stroke-width': 2, transform: `rotate(${s * 20} ${s * 56} -16)` }, g);
          el('ellipse', { cx: s * 58, cy: -15, rx: 11, ry: 5, fill: '#ffc4d0', transform: `rotate(${s * 20} ${s * 58} -15)` }, g);
        });
        el('circle', { r: 50, fill: '#fff', stroke: '#ece6f5', 'stroke-width': 2 }, g);
        el('path', { d: 'M14,-44 Q36,-46 40,-24 Q30,-10 18,-22 Q8,-32 14,-44Z', fill: '#4a3f5e' }, g);
        el('path', { d: 'M-42,-2 Q-30,-14 -22,0 Q-28,12 -40,12Z', fill: '#4a3f5e' }, g);
        el('ellipse', { cx: 0, cy: 26, rx: 34, ry: 22, fill: '#ffc4d0' }, g);
        [-12, 12].forEach(x => el('ellipse', { cx: x, cy: 22, rx: 5, ry: 6, fill: '#e88fa3' }, g));
      } },
    pig: { cry: 'pig', n: 'ぶたさん', fav: 'carrot', body: '#ffc0cf', belly: '#ffd8e2', paw: '#ff9fb5', eye: [20, -16], mouth: [0, 36, .8],
      draw(g) {
        [-1, 1].forEach(s => el('path', { d: `M${s * 18},-44 L${s * 46},-58 L${s * 44},-24Z`, fill: '#ff9fb5', 'stroke-linejoin': 'round', stroke: '#ff9fb5', 'stroke-width': 8 }, g));
        el('circle', { r: 50, fill: '#ffc0cf' }, g);
        el('ellipse', { cx: 0, cy: 14, rx: 22, ry: 15, fill: '#ff9fb5' }, g);
        [-7, 7].forEach(x => el('ellipse', { cx: x, cy: 14, rx: 4, ry: 6, fill: '#d9708a' }, g));
      } },
    duck: { cry: 'duck', n: 'あひるさん', fav: 'bread', body: '#fffaf0', belly: '#fff1c9', paw: '#f2ead8', stroke: '#efe6d2', feet: '#ffa94d', eye: [19, -14], beak: '#ffa94d', flat: true,
      draw(g) {
        el('path', { d: 'M-4,-48 Q-2,-64 8,-62 Q4,-54 6,-48Z', fill: '#fffaf0', stroke: '#efe6d2', 'stroke-width': 2 }, g);
        el('circle', { r: 48, fill: '#fffaf0', stroke: '#efe6d2', 'stroke-width': 2 }, g);
      } }
  };
  const SETTINGS = [
    { id: 'picnic', kinds: ['dog', 'cat', 'frog'], extra: ['apple', 'onigiri', 'milk', 'banana'] },
    { id: 'zoo', kinds: ['lion', 'elephant', 'bird'], extra: ['carrot', 'milk', 'cookie', 'onigiri'] },
    { id: 'farm', kinds: ['cow', 'pig', 'duck'], extra: ['apple', 'milk', 'onigiri', 'cookie'] }
  ];

  function buildHead(kind, g) {
    const K = KINDS[kind];
    K.draw(g);
    el('ellipse', { cx: -20, cy: -32, rx: 13, ry: 6, fill: '#fff', opacity: .38, transform: 'rotate(-25 -20 -32)' }, g);
    const [ex, ey] = K.eye;
    // cheeks
    [-1, 1].forEach(s => el('ellipse', { cx: s * (ex + 15), cy: K.sclera ? 6 : ey + 20, rx: 9, ry: 6, fill: '#ffa3b8', opacity: .75 }, g));
    const look = el('g', {}, g);
    const open = el('g', { class: 'tb' }, look);
    const shut = el('g', { style: 'display:none' }, g);
    [-ex, ex].forEach(x => {
      if (K.sclera) el('circle', { cx: x, cy: ey, r: 12.5, fill: '#fff' }, open);
      el('ellipse', { cx: x, cy: ey, rx: 7.5, ry: 9, fill: '#2b2340' }, open);
      el('circle', { cx: x - 2.6, cy: ey - 3.6, r: 3, fill: '#fff' }, open);
      el('path', { d: `M${x - 9},${ey + 1} Q${x},${ey - 9} ${x + 9},${ey + 1}`, stroke: '#2b2340', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, shut);
    });
    // mouths
    const M = {};
    let trunk = null, tongue = null;
    if (K.beak) {
      const flat = K.flat;
      const bk = el('g', {}, g);
      M.closed = el('g', {}, bk);
      M.open = el('g', { style: 'display:none' }, bk);
      if (flat) {
        el('ellipse', { cx: 0, cy: 18, rx: 28, ry: 10, fill: K.beak }, M.closed);
        el('ellipse', { cx: 0, cy: 24, rx: 24, ry: 7, fill: '#f08a2a' }, M.closed);
        el('ellipse', { cx: 0, cy: 26, rx: 20, ry: 12, fill: '#c2405a' }, M.open);
        el('ellipse', { cx: 0, cy: 14, rx: 28, ry: 10, fill: K.beak }, M.open);
        el('ellipse', { cx: 0, cy: 36, rx: 24, ry: 7, fill: '#f08a2a' }, M.open);
      } else {
        el('path', { d: 'M-14,4 Q0,-6 14,4 Q16,22 2,32 Q6,18 -14,4Z', fill: K.beak }, M.closed);
        el('path', { d: 'M-10,12 Q0,26 4,26 Q-8,24 -10,12Z', fill: '#e08a1f' }, M.closed);
        el('ellipse', { cx: -2, cy: 20, rx: 10, ry: 12, fill: '#c2405a' }, M.open);
        el('path', { d: 'M-14,0 Q0,-10 14,0 Q16,14 4,22 Q6,10 -14,0Z', fill: K.beak }, M.open);
        el('path', { d: 'M-12,22 Q-2,40 6,34 Q-6,34 -12,22Z', fill: '#e08a1f' }, M.open);
      }
      M.happy = M.closed;
    } else {
      const [mx, my, ms] = K.mouth;
      const mg = el('g', { transform: `translate(${mx} ${my}) scale(${ms})` }, g);
      M.closed = el('path', { d: 'M-10,-2 Q-5,5 0,-1 Q5,5 10,-2', stroke: '#6a3a3a', 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' }, mg);
      M.open = el('g', { style: 'display:none' }, mg);
      el('ellipse', { cx: 0, cy: 4, rx: 12, ry: 13, fill: '#a8324e' }, M.open);
      el('ellipse', { cx: 0, cy: 10, rx: 8, ry: 5, fill: '#ff8fa3' }, M.open);
      M.happy = el('g', { style: 'display:none' }, mg);
      el('path', { d: 'M-13,-3 Q0,20 13,-3Z', fill: '#a8324e' }, M.happy);
      el('ellipse', { cx: 0, cy: 7, rx: 6, ry: 3.5, fill: '#ff8fa3' }, M.happy);
      tongue = el('g', { transform: 'translate(0 4)' }, mg);
      const tIn = el('g', { class: 'tb', style: 'display:none' }, tongue);
      el('path', { d: 'M-7,0 Q-7,12 0,12 Q7,12 7,0Z', fill: '#ff7a9a' }, tIn);
      el('path', { d: 'M0,2 V8', stroke: '#e0607e', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, tIn);
      tongue = tIn;
    }
    if (K.trunk) {
      const tg = el('g', { transform: 'translate(0 -2)' }, g);
      trunk = el('g', { class: 'tb', style: 'transform-origin:0% 0%' }, tg);
      el('path', { d: 'M0,0 C0,30 16,48 34,36', stroke: '#b2bfdc', 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }, trunk);
      el('path', { d: 'M-2,10 h6 M0,22 h7 M6,32 h7', stroke: '#9aa8c8', 'stroke-width': 2, 'stroke-linecap': 'round' }, trunk);
      el('ellipse', { cx: 35, cy: 36, rx: 6, ry: 7, fill: '#9aa8c8' }, trunk);
      el('path', { d: 'M-12,-8 Q0,-2 12,-8', stroke: '#9aa8c8', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, g);
    }
    return { look, open, shut, M, tongue, trunk };
  }

  const feedToy = {
    id: 'feed', name: 'もぐもぐ', color: '#ffc48a',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#ffe2c2' }, g);
      el('rect', { x: -80, y: 34, width: 160, height: 60, fill: '#fff' }, g);
      for (let x = -80; x < 80; x += 24) el('rect', { x, y: 34, width: 12, height: 60, fill: '#ff8fa3', opacity: .45 }, g);
      for (let y = 34; y < 94; y += 24) el('rect', { x: -80, y, width: 160, height: 12, fill: '#ff8fa3', opacity: .45 }, g);
      el('ellipse', { cx: -16, cy: 44, rx: 40, ry: 30, fill: '#d9a066' }, g);
      el('ellipse', { cx: -16, cy: 50, rx: 26, ry: 18, fill: '#f3d9b5' }, g);
      const h = el('g', { transform: 'translate(-16 -6) scale(.78)' }, g);
      const p = buildHead('dog', h);
      p.M.closed.style.display = 'none'; p.M.open.style.display = '';
      const f = el('g', { transform: 'translate(46 36) scale(.66)' }, g);
      FOODS.bone.draw(f);
    },
    mount(ctx) {
      const { svg, defs } = ctx;
      const lin = (id, a, b) => { const lg = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs); el('stop', { offset: 0, 'stop-color': a }, lg); el('stop', { offset: 1, 'stop-color': b }, lg); };
      lin('feed-sky', '#a9dcff', '#eaf8ff');
      lin('feed-zoo', '#ffd9a8', '#fff6dc');
      lin('feed-farm', '#bfe6ff', '#f2fbff');
      lin('feed-grass', '#a8e08f', '#86cf72');
      lin('feed-sand', '#f6dca0', '#e9c27c');
      lin('feed-tray', '#f8d9a8', '#efc488');
      const tum = el('radialGradient', { id: 'feed-tum', cx: .36, cy: .3, r: .8 }, defs);
      [[0, '#fff', .5], [.5, '#fff', .08], [1, INK, .12]].forEach(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op }, tum));
      const ging = el('pattern', { id: 'feed-ging', width: 36, height: 36, patternUnits: 'userSpaceOnUse' }, defs);
      el('rect', { width: 36, height: 36, fill: '#fff' }, ging);
      el('rect', { width: 18, height: 36, fill: '#ff8fa3', opacity: .45 }, ging);
      el('rect', { width: 36, height: 18, fill: '#ff8fa3', opacity: .45 }, ging);

      const cloud = (p, s, op = 1) => {
        const g = el('g', {}, p);
        const c = el('g', { transform: `scale(${s})` }, g);
        [[0, 0, 18], [22, -8, 24], [46, 0, 17]].forEach(([dx, dy, r]) => el('circle', { cx: dx, cy: dy, r, fill: '#fff', opacity: op }, c));
        return g;
      };
      const drifting = [];

      /* ---------- the three settings ---------- */
      const bgL = el('g', {}, svg);
      // picnic
      const picnic = el('g', {}, bgL);
      el('rect', { x: -800, y: -900, width: 2000, height: 1180, fill: 'url(#feed-sky)' }, picnic);
      const sun = el('g', { transform: 'translate(150 82)' }, picnic);
      el('circle', { r: 46, fill: '#fff3b0', opacity: .7, class: 'twinkle', style: 'animation-duration:3.4s' }, sun);
      el('circle', { r: 30, fill: '#ffd56b' }, sun);
      [[230, 70, .9, 6], [-30, 150, 1, 9], [120, 190, .6, 4]].forEach(([x, y, s, v]) => drifting.push({ g: cloud(picnic, s), x, y, v, set: 0 }));
      el('ellipse', { cx: 40, cy: 272, rx: 200, ry: 56, fill: '#b5e6a0' }, picnic);
      el('ellipse', { cx: 360, cy: 278, rx: 210, ry: 60, fill: '#a3dc8c' }, picnic);
      [[30, 232, 40], [372, 226, 46]].forEach(([x, y, r]) => {
        el('rect', { x: x - 7, y, width: 14, height: 46, rx: 6, fill: '#b07a4d' }, picnic);
        el('circle', { cx: x, cy: y - r * .5, r, fill: '#7fcf6f' }, picnic);
        el('circle', { cx: x - r * .45, cy: y - r * .8, r: r * .45, fill: '#94dc84' }, picnic);
        [[-10, -20], [14, -6], [4, -36]].forEach(([dx, dy]) => el('circle', { cx: x + dx, cy: y + dy, r: 4, fill: '#ff7a8a' }, picnic));
      });
      el('rect', { x: -800, y: 272, width: 2000, height: 1400, fill: 'url(#feed-grass)' }, picnic);
      [[60, 300], [340, 296], [20, 540], [380, 536]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 6, fill: '#fff' }, picnic); el('circle', { cx: x, cy: y, r: 2.6, fill: '#ffd23f' }, picnic); });
      el('path', { d: 'M36,392 Q200,380 364,392 L398,540 Q200,552 2,540Z', fill: 'url(#feed-ging)', filter: 'url(#soft)' }, picnic);
      // zoo
      const zoo = el('g', { opacity: 0 }, bgL);
      el('rect', { x: -800, y: -900, width: 2000, height: 1180, fill: 'url(#feed-zoo)' }, zoo);
      const zsun = el('g', { transform: 'translate(300 96)' }, zoo);
      el('circle', { r: 52, fill: '#ffe9b0', opacity: .7, class: 'twinkle', style: 'animation-duration:3.8s' }, zsun);
      el('circle', { r: 34, fill: '#ffb85c' }, zsun);
      [[-40, 120, .8, 5], [200, 60, .7, 7]].forEach(([x, y, s, v]) => drifting.push({ g: cloud(zoo, s, .85), x, y, v, set: 1 }));
      el('path', { d: 'M-800,300 Q-100,230 80,262 Q220,220 420,258 Q700,240 1200,280 L1200,400 L-800,400Z', fill: '#f2c48a' }, zoo);
      // acacia tree
      const ac = el('g', { transform: 'translate(64 250)' }, zoo);
      el('path', { d: 'M-4,40 Q-2,0 -14,-24 M2,40 Q4,4 18,-22', stroke: '#9a6a44', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, ac);
      el('ellipse', { cx: 0, cy: -34, rx: 66, ry: 20, fill: '#8fc46a' }, ac);
      el('ellipse', { cx: -10, cy: -44, rx: 40, ry: 13, fill: '#a3d47c' }, ac);
      // rocks
      el('path', { d: 'M300,300 Q310,262 346,262 Q380,262 392,300Z', fill: '#c9b0a0' }, zoo);
      el('ellipse', { cx: 334, cy: 276, rx: 16, ry: 6, fill: '#fff', opacity: .3 }, zoo);
      el('rect', { x: -800, y: 296, width: 2000, height: 1400, fill: 'url(#feed-sand)' }, zoo);
      // fence
      const fence = el('g', {}, zoo);
      el('rect', { x: -800, y: 328, width: 2000, height: 10, rx: 5, fill: '#c98a55' }, fence);
      el('rect', { x: -800, y: 358, width: 2000, height: 10, rx: 5, fill: '#c98a55' }, fence);
      for (let x = -20; x < 440; x += 46) el('rect', { x, y: 310, width: 14, height: 72, rx: 7, fill: '#dea06a' }, fence);
      [[40, 560], [360, 556], [200, 548]].forEach(([x, y]) => [-10, 0, 10].forEach(d => el('path', { d: `M${x + d},${y} q-3,-14 ${d / 2},-22`, stroke: '#a3c46a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, zoo)));
      el('ellipse', { cx: 200, cy: 500, rx: 200, ry: 40, fill: '#e0b46c', opacity: .5 }, zoo);
      // farm
      const farm = el('g', { opacity: 0 }, bgL);
      el('rect', { x: -800, y: -900, width: 2000, height: 1180, fill: 'url(#feed-farm)' }, farm);
      [[260, 70, .9, 6], [-20, 140, .7, 8]].forEach(([x, y, s, v]) => drifting.push({ g: cloud(farm, s), x, y, v, set: 2 }));
      el('path', { d: 'M-800,280 Q-60,220 120,252 Q260,226 1200,270 L1200,400 L-800,400Z', fill: '#bfe8a8' }, farm);
      // barn
      const barn = el('g', { transform: 'translate(40 196)' }, farm);
      el('path', { d: 'M-48,0 L-48,90 L48,90 L48,0 L0,-36Z', fill: '#ff7a6a', 'stroke-linejoin': 'round', stroke: '#ff7a6a', 'stroke-width': 6 }, barn);
      el('path', { d: 'M-56,4 L0,-42 L56,4', stroke: '#fff', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, barn);
      el('rect', { x: -22, y: 36, width: 44, height: 54, fill: '#fff' }, barn);
      el('rect', { x: -18, y: 40, width: 36, height: 50, fill: '#d85a50' }, barn);
      el('path', { d: 'M-18,40 L18,90 M18,40 L-18,90', stroke: '#fff', 'stroke-width': 4 }, barn);
      el('circle', { cx: 0, cy: 6, r: 10, fill: '#fff' }, barn);
      // windmill
      const wm = el('g', { transform: 'translate(262 206)' }, farm);
      el('path', { d: 'M-10,70 L-5,0 L5,0 L10,70Z', fill: '#fff' }, wm);
      const blades = el('g', {}, wm);
      [0, 90, 180, 270].forEach(a => el('rect', { x: -4, y: -46, width: 8, height: 44, rx: 3, fill: '#ffd56b', transform: `rotate(${a})` }, blades));
      el('circle', { r: 6, fill: '#ff8fa3' }, wm);
      el('rect', { x: -800, y: 272, width: 2000, height: 1400, fill: 'url(#feed-grass)' }, farm);
      const ffence = el('g', {}, farm);
      el('rect', { x: -800, y: 300, width: 2000, height: 8, rx: 4, fill: '#fff' }, ffence);
      el('rect', { x: -800, y: 322, width: 2000, height: 8, rx: 4, fill: '#fff' }, ffence);
      for (let x = -10; x < 440; x += 42) el('rect', { x, y: 288, width: 10, height: 52, rx: 5, fill: '#fff' }, ffence);
      [[30, 360], [372, 364]].forEach(([x, y]) => {
        el('rect', { x: x - 26, y: y - 18, width: 52, height: 36, rx: 12, fill: '#f6d36b' }, farm);
        el('path', { d: `M${x - 18},${y - 6} H${x + 18} M${x - 18},${y + 6} H${x + 18}`, stroke: '#e0b44a', 'stroke-width': 3, 'stroke-linecap': 'round' }, farm);
      });
      el('ellipse', { cx: 200, cy: 500, rx: 200, ry: 42, fill: '#9cd884', opacity: .6 }, farm);
      const BGS = [picnic, zoo, farm];

      // butterflies drift in every setting
      const flies = [0, 1].map(i => {
        const g = el('g', { 'pointer-events': 'none' }, bgL);
        const w = el('g', { class: 'tb' }, g);
        el('ellipse', { cx: -7, cy: 0, rx: 8, ry: 10, fill: i ? '#c9a7ff' : '#ff9ec4' }, w);
        el('ellipse', { cx: 7, cy: 0, rx: 8, ry: 10, fill: i ? '#c9a7ff' : '#ff9ec4' }, w);
        el('rect', { x: -1.5, y: -8, width: 3, height: 16, rx: 1.5, fill: INK }, g);
        w.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(.25)' }], { duration: 160 + i * 30, iterations: Infinity, direction: 'alternate' });
        return { g, ph: i * 3, cx: i ? 300 : 110, cy: i ? 230 : 190 };
      });

      /* tray */
      const trayG = el('g', {}, svg);
      el('rect', { x: 14, y: 556, width: 372, height: 196, rx: 30, fill: '#d9a066', filter: 'url(#soft)' }, trayG);
      el('rect', { x: 26, y: 568, width: 348, height: 172, rx: 22, fill: 'url(#feed-tray)' }, trayG);
      el('rect', { x: 40, y: 574, width: 120, height: 8, rx: 4, fill: '#fff', opacity: .4 }, trayG);
      const SLOTS = [[82, 618], [200, 618], [318, 618], [141, 702], [259, 702]];
      SLOTS.forEach(([x, y]) => el('ellipse', { cx: x, cy: y + 34, rx: 36, ry: 8, fill: '#e2b073' }, trayG));

      const friendsL = el('g', {}, svg);
      const trayL = el('g', {}, svg);
      const fxL = el('g', { 'pointer-events': 'none' }, svg);
      const ghost = ctx.ghost(svg, { x: 334, y: 150, s: .55 });
      const dragL = el('g', {}, svg);

      const SEATS = [76, 200, 324], HY = 332, SC = 1.06;
      let setting = 0, friends = [], foods = [], round = 0, celebrating = true, drag = null, cake = null, birthday = false;
      let lastP = { x: 200, y: 600 };

      /* ---------- friends ---------- */
      const SIZES = [[40, 34, 76], [50, 43, 82], [59, 52, 88]];
      function setTummy(fr, rx, ry, cy) {
        fr.tum.setAttribute('rx', f1(rx)); fr.tum.setAttribute('ry', f1(ry)); fr.tum.setAttribute('cy', f1(cy));
        fr.tumS.setAttribute('rx', f1(rx)); fr.tumS.setAttribute('ry', f1(ry)); fr.tumS.setAttribute('cy', f1(cy));
        fr.patch.setAttribute('rx', f1(rx * .64)); fr.patch.setAttribute('ry', f1(ry * .62)); fr.patch.setAttribute('cy', f1(cy + ry * .18));
        fr.navel.setAttribute('transform', `translate(0 ${f1(cy + ry * .25)})`);
        fr.pawL.setAttribute('transform', `translate(${f1(-rx + 8)} ${f1(cy - 4)})`);
        fr.pawR.setAttribute('transform', `translate(${f1(rx - 8)} ${f1(cy - 4)})`);
        fr.feet.forEach((ft, i) => { ft.setAttribute('cx', f1((i ? 1 : -1) * rx * .6)); ft.setAttribute('cy', f1(cy + ry - 4)); });
        fr.shadow.setAttribute('rx', f1(rx + 16)); fr.shadow.setAttribute('cy', f1(cy + ry + 4));
      }
      function makeFriend(kind, i) {
        const K = KINDS[kind];
        const seat = el('g', {}, friendsL);
        const shadow = el('ellipse', { cx: 0, rx: 56, ry: 10, fill: INK, opacity: .13 }, seat);
        const lean = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, seat);
        const hop = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, lean);
        const feet = [-1, 1].map(() => el('ellipse', { rx: 16, ry: 9, fill: K.feet || K.paw }, hop));
        const tumG = el('g', { class: 'tb' }, hop);
        const tum = el('ellipse', { cx: 0, fill: K.body, stroke: K.stroke || 'none', 'stroke-width': 2 }, tumG);
        const patch = el('ellipse', { cx: 0, fill: K.belly }, tumG);
        const tumS = el('ellipse', { cx: 0, fill: 'url(#feed-tum)' }, tumG);
        const navel = el('path', { d: 'M-4,0 Q0,4 4,0', stroke: INK, 'stroke-width': 2.4, fill: 'none', opacity: .35, 'stroke-linecap': 'round' }, tumG);
        const pawL = el('g', {}, hop), pawR = el('g', {}, hop);
        const pl = el('ellipse', { rx: 13, ry: 11, fill: K.paw, class: 'tb' }, pawL);
        const pr = el('ellipse', { rx: 13, ry: 11, fill: K.paw, class: 'tb' }, pawR);
        const headG = el('g', {}, hop);
        const head = el('g', { class: 'tb' }, headG);
        const parts = buildHead(kind, head);
        head.animate([{ transform: 'translateY(0px) rotate(0deg)' }, { transform: 'translateY(2.5px) rotate(1.5deg)' }], { duration: 1400 + i * 170, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        el('circle', { cx: 0, cy: 40, r: 84, fill: 'transparent' }, hop);
        const fr = { kind, K, i, seat, lean, hop, head, tumG, tum, tumS, patch, navel, pawL, pawR, pl, pr, feet, shadow, p: parts, full: 0, x: SEATS[i], busy: 0, gone: false, mode: '' };
        setTummy(fr, ...SIZES[0]);
        mouth(fr, 'closed');
        seat.addEventListener('pointerdown', e => { e.stopPropagation(); lastP = ctx.point(e); lookAll(lastP); poke(fr); });
        return fr;
      }
      function placeSeat(fr, x, y = HY) { fr.seat.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${SC})`); }
      function mouth(fr, m) {
        fr.mode = m;
        const M = fr.p.M;
        [M.closed, M.open, M.happy].forEach(n => { n.style.display = 'none'; });
        (M[m] || M.closed).style.display = '';
        if (fr.p.trunk) fr.p.trunk.animate([{ transform: `rotate(${m === 'open' ? -70 : 0}deg)` }], { duration: 220, fill: 'forwards', easing: 'ease-out' });
      }
      function eyes(fr, happy) { fr.p.open.parentNode.style.display = happy ? 'none' : ''; fr.p.shut.style.display = happy ? '' : 'none'; }
      function mouthPos(fr) { const K = fr.K, m = K.beak ? [0, 22] : K.mouth; return [fr.x + m[0] * SC, HY + m[1] * SC]; }
      function lookAll(p) {
        friends.forEach(fr => {
          const dx = clamp((p.x - fr.x) / 30, -4, 4), dy = clamp((p.y - HY) / 50, -3, 4);
          fr.p.look.setAttribute('transform', `translate(${f1(dx)} ${f1(dy)})`);
        });
      }
      function cry(fr, vol = .7) {
        if (!A.animal(fr.K.cry, { vol, rate: rand(.95, 1.08) })) {
          if (fr.kind === 'dog' || fr.kind === 'cat' || fr.kind === 'frog') A.voice(fr.kind, fr.kind === 'dog' ? 430 : fr.kind === 'cat' ? 700 : 300);
          else A.osc(600, { vib: 9, vibD: .05, hold: .1, slide: 820, slideT: .14, r: .14, vol: .14 });
        }
      }
      function squash(fr, big) {
        const s = big ? 1.16 : 1.08;
        fr.hop.animate([{ transform: 'translateY(0px) scale(1)' }, { transform: `translateY(0px) scale(${s},${2 - s})`, offset: .18 }, { transform: `translateY(${big ? -30 : -12}px) scale(${2 - s},${s})`, offset: .45 }, { transform: 'translateY(0px) scale(1.07,.93)', offset: .78 }, { transform: 'translateY(0px) scale(1)' }], { duration: big ? 600 : 440, easing: 'ease-out' });
      }
      function lick(fr) {
        const t = fr.p.tongue;
        if (!t) { // beaks clack instead
          [0, 1, 2, 3].forEach(j => ctx.after(j * 130, () => { if (!fr.busy && !fr.gone) mouth(fr, j % 2 ? 'closed' : 'open'); }));
          ctx.after(560, () => { if (!fr.busy && !fr.gone) mouth(fr, 'closed'); });
          A.osc(1300, { r: .03, vol: .06, wet: 0 }); A.osc(1300, { r: .03, vol: .06, wet: 0, when: .26 });
          return;
        }
        mouth(fr, 'closed');
        t.style.display = '';
        t.animate([{ transform: 'translate(-8px,0px) scale(.4)' }, { transform: 'translate(-8px,0px) scale(1)', offset: .2 }, { transform: 'translate(8px,1px) scale(1)', offset: .5 }, { transform: 'translate(-6px,0px) scale(1)', offset: .8 }, { transform: 'translate(0px,0px) scale(.3)' }], { duration: 900, easing: 'ease-in-out' }).onfinish = () => { t.style.display = 'none'; };
        A.osc(900, { slide: 1300, slideT: .1, r: .08, vol: .05, wet: 0 });
        A.osc(1000, { slide: 1400, slideT: .1, r: .08, vol: .05, wet: 0, when: .35 });
      }
      function rumble(fr) {
        fr.tumG.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06,.95)' }, { transform: 'scale(.96,1.04)' }, { transform: 'scale(1.05,.96)' }, { transform: 'scale(.98,1.02)' }, { transform: 'scale(1)' }], { duration: 700 });
        A.osc(62, { type: 'sawtooth', lp: 260, vib: 11, vibD: .35, hold: .45, r: .25, vol: .16, wet: .05 });
        A.osc(84, { type: 'triangle', vib: 7, vibD: .25, hold: .3, r: .2, vol: .1, wet: 0, when: .15 });
        // little wiggly lines beside the tummy
        const cy = HY + (SIZES[fr.full][2]) * SC;
        [-1, 1].forEach(s => {
          const g = el('g', { transform: `translate(${f1(fr.x + s * 66)} ${f1(cy)})` }, fxL);
          const w = el('path', { d: 'M0,-10 q5,5 0,10 q-5,5 0,10', stroke: '#c98a5a', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round', class: 'tb', transform: s < 0 ? 'scale(-1 1)' : null }, g);
          const inner = el('g', { class: 'tb' }, g); inner.appendChild(w);
          inner.animate([{ transform: 'translateX(0px)', opacity: 0 }, { transform: `translateX(${s * 6}px)`, opacity: 1, offset: .3 }, { transform: `translateX(${s * 14}px)`, opacity: 0 }], { duration: 800 }).onfinish = () => g.remove();
        });
      }
      function poke(fr) {
        haptic(); cry(fr, .6); squash(fr, false);
        ctx.sparkle(fr.x, HY - 40, 2, 40, pick(PARTY));
        if (celebrating) { A.giggle(); return; }
        if (fr.full >= 2) { eyes(fr, true); mouth(fr, 'happy'); ctx.bubble('おなか いっぱい', fr.x, HY - 96); ctx.after(900, () => { if (!fr.gone) eyes(fr, false); }); }
        else { ctx.bubble('おなかすいた～', fr.x, HY - 96); rumble(fr); hint1(fr); }
      }
      function hint1(fr) {
        const f = foods.find(q => q && q.state === 'tray' && (q.id === fr.K.fav || q.id === 'slice'));
        if (f) f.inner.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-18px) scale(1.06,.95)' }, { transform: 'translateY(0px)' }, { transform: 'translateY(-9px)' }, { transform: 'translateY(0px)' }], { duration: 640, delay: 200 });
      }

      /* ---------- foods ---------- */
      const FS = 1.18;
      function setFood(f, x, y, s = 1, r = 0) { f.x = x; f.y = y; f.outer.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${r.toFixed(0)}) scale(${(s * FS).toFixed(3)})`); }
      function makeFood(id, slot) {
        const def = FOODS[id];
        const outer = el('g', {}, trayL);
        const inner = el('g', { class: 'tb' }, outer);
        def.draw(inner);
        el('circle', { r: 46, fill: 'transparent' }, inner);
        const f = { id, def, slot, outer, inner, state: 'tray', x: 0, y: 0 };
        setFood(f, ...SLOTS[slot]);
        inner.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.18,.86)', offset: .6 }, { transform: 'scale(.95,1.05)', offset: .8 }, { transform: 'scale(1)' }], { duration: 460, easing: 'ease-out' });
        outer.addEventListener('pointerdown', e => { e.stopPropagation(); grab(f, e); });
        foods[slot] = f;
        return f;
      }
      function chooseFood() {
        const have = foods.filter(q => q && q.state !== 'gone').map(q => q.id);
        const want = friends.filter(fr => fr.full < 2).map(fr => birthday ? 'slice' : fr.K.fav).filter(id => birthday || !have.includes(id));
        const pool = want.length ? want : SETTINGS[setting].extra.filter(id => !have.includes(id));
        return pick(pool.length ? pool : ['apple']);
      }
      function fillTray(ids) {
        if (!ids) {
          const favs = friends.map(fr => fr.K.fav);
          const others = SETTINGS[setting].extra.slice().sort(() => Math.random() - .5).slice(0, 2);
          ids = [...favs, ...others].sort(() => Math.random() - .5);
        }
        ids.forEach((id, s) => ctx.after(s * 120, () => { makeFood(id, s); if (!A.sfx('plink', { rate: 1 + s * .08, vol: .45 })) A.pluck(mtof(PENTA[s + 3]), { vol: .12 }); }));
      }

      function grab(f, e) {
        haptic();
        if (f.state !== 'tray') return;
        f.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.24,.84)' }, { transform: 'scale(1.1)' }], { duration: 200, fill: 'forwards' });
        A.pop();
        if (celebrating || drag) { ctx.after(220, () => f.inner.animate([{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 200, fill: 'forwards' })); return; }
        say(f.def.say || 'おいしそう！');
        const p = ctx.point(e);
        drag = { f, id: e.pointerId, sx: p.x, sy: p.y, moved: false, over: null };
        // everyone looks at the food; the hungry ones say あーん
        lookAll(p);
        friends.forEach(fr => { if (fr.full < 2 && !fr.busy) mouth(fr, 'open'); });
      }
      function nearest(x, y, maxD, hungryOnly) {
        let best = null, bd = maxD;
        friends.forEach(fr => {
          if (hungryOnly && fr.full >= 2) return;
          const d = Math.hypot(fr.x - x, HY + 30 - y);
          if (d < bd) { bd = d; best = fr; }
        });
        return best;
      }
      ctx.on(window, 'pointermove', e => {
        if (!drag || e.pointerId !== drag.id) return;
        const p = ctx.point(e), f = drag.f;
        lookAll(p);
        if (!drag.moved && Math.hypot(p.x - drag.sx, p.y - drag.sy) > 12) { drag.moved = true; f.state = 'drag'; dragL.appendChild(f.outer); }
        if (!drag.moved) return;
        setFood(f, p.x, p.y - 14, 1.1);
        const over = nearest(p.x, p.y, 105, false);
        if (over !== drag.over) {
          drag.over = over;
          if (over) { squash(over, false); A.osc(520, { slide: 760, slideT: .12, r: .12, vol: .1 }); mouth(over, 'open'); }
        }
      });
      const release = e => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag, f = d.f; drag = null;
        friends.forEach(fr => { if (!fr.busy && fr.mode === 'open') mouth(fr, 'closed'); });
        const p = ctx.point(e);
        const fr = !d.moved ? tapTarget(f) : nearest(p.x, p.y, 105, false) || (p.y < 548 ? (nearest(p.x, p.y, 9999, true) || nearest(p.x, p.y, 9999, false)) : null);
        if (fr && !celebrating && fr.full < 2) return sendTo(f, fr);
        if (fr && fr.full >= 2 && !celebrating) {
          // already full: a happy belly pat, and the food hops home
          eyes(fr, true); mouth(fr, 'happy'); pat(fr, 2); squash(fr, false);
          ctx.bubble('おなか いっぱい', fr.x, HY - 100);
          ctx.after(800, () => { if (!fr.gone && !fr.busy) { eyes(fr, celebrating); mouth(fr, 'closed'); } });
        }
        if (!d.moved) {
          f.inner.animate([{ transform: 'scale(1.1)' }, { transform: 'translateY(-14px) scale(.94,1.08)' }, { transform: 'scale(1)' }], { duration: 360, fill: 'forwards' });
          return;
        }
        f.state = 'fly'; A.boing();
        const [tx, ty] = SLOTS[f.slot], x0 = f.x, y0 = f.y;
        ctx.tween(380, k => setFood(f, x0 + (tx - x0) * k, y0 + (ty - y0) * k, 1.1 - .1 * k), () => {
          trayL.appendChild(f.outer); f.state = 'tray';
          f.inner.animate([{ transform: 'scale(1.1)' }, { transform: 'scale(.92,1.08)' }, { transform: 'scale(1)' }], { duration: 260, fill: 'forwards' });
        }, easeOut);
      };
      ctx.on(window, 'pointerup', release);
      ctx.on(window, 'pointercancel', release);

      function isFav(fr, id) { return id === 'slice' || fr.K.fav === id; }
      function tapTarget(f) {
        const hungry = friends.filter(fr => fr.full < 2);
        return hungry.find(fr => isFav(fr, f.id) && !fr.busy) || hungry.find(fr => isFav(fr, f.id))
          || hungry.filter(fr => !fr.busy).sort((a, b) => Math.abs(a.x - f.x) - Math.abs(b.x - f.x))[0]
          || hungry[0] || friends[1];
      }
      function checkDone() {
        if (!celebrating && friends.length && friends.every(q => q.full >= 2 && !q.busy)) ctx.after(1100, celebrate);
      }
      function sendTo(f, fr) {
        f.state = 'fly'; dragL.appendChild(f.outer);
        fr.busy++;
        mouth(fr, 'open');
        A.whoosh();
        const x0 = f.x, y0 = f.y, [tx, ty] = mouthPos(fr), top = Math.min(y0, ty) - 90;
        const dur = Math.hypot(tx - x0, ty - y0) > 160 ? 560 : 340;
        ctx.tween(dur, k => {
          const x = x0 + (tx - x0) * k;
          const y = (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * top + k * k * ty;
          setFood(f, x, y, 1.1 - k * .45, Math.sin(k * Math.PI) * 24);
        }, () => eat(f, fr), easeInOut);
        ctx.after(950, () => { if (!celebrating && foods[f.slot] === f) makeFood(chooseFood(), f.slot); });
      }

      /* ---------- eating ---------- */
      function crumbs(x, y, colors, n = 9) {
        const g = el('g', {}, fxL);
        const bits = [];
        for (let i = 0; i < n; i++) {
          const node = el('circle', { r: rand(2.5, 5.5).toFixed(1), fill: colors[i % colors.length], stroke: 'rgba(58,47,91,.15)', 'stroke-width': 1 }, g);
          bits.push({ node, x, y, vx: rand(-170, 170), vy: rand(-240, -60) });
        }
        let life = 0;
        const stop = ctx.loop(dt => {
          life += dt;
          bits.forEach(b => { b.vy += 700 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.node.setAttribute('cx', f1(b.x)); b.node.setAttribute('cy', f1(b.y)); });
          g.setAttribute('opacity', clamp(1.4 - life * 1.4, 0, 1).toFixed(2));
          if (life > 1) { stop(); g.remove(); }
        });
      }
      function hearts(x, y, n = 5) {
        for (let i = 0; i < n; i++) {
          const g = el('g', { transform: `translate(${x} ${y}) scale(0)` }, fxL);
          el('path', { d: 'M0,7 C-14,-4 -9,-16 0,-9 C9,-16 14,-4 0,7Z', fill: pick(['#ff7a9a', '#ff9ccf', '#ff6b8a']) }, g);
          const dx = rand(-70, 70), d = rand(70, 130), sc = rand(1.1, 1.8), ph = rand(0, 6);
          ctx.after(i * 90, () => ctx.tween(1100, k => {
            g.setAttribute('transform', `translate(${f1(x + dx * k + Math.sin(k * 8 + ph) * 6)} ${f1(y - d * k - 20)}) scale(${(sc * Math.min(1, k * 4)).toFixed(2)})`);
            g.setAttribute('opacity', (1 - Math.max(0, k - .6) * 2.5).toFixed(2));
          }, () => g.remove(), easeOut));
        }
      }
      function eat(f, fr) {
        const fav = isFav(fr, f.id);
        const [mx, my] = mouthPos(fr);
        ctx.tween(160, k => setFood(f, mx, my, .65 * (1 - k) + .01), () => f.outer.remove());
        f.state = 'gone';
        const drink = f.def.drink;
        if (drink) { if (!A.sfx(pick(['gulp', 'slurp']), { vol: .8, rate: rand(.95, 1.1) })) A.osc(300, { slide: 160, r: .1, vol: .2 }); }
        else {
          if (!A.sfx(pick(['crunch', 'crunchy']), { vol: .85, rate: rand(.92, 1.15) })) A.noise({ from: 2200, dur: .1, vol: .12, type: 'highpass' });
          A.sfx('munch', { vol: .5, rate: rand(.95, 1.2), when: .45 });
        }
        if (fr.busy < 2) { ctx.bubble(drink ? 'ごくごく' : 'もぐもぐ', fr.x, HY - 100); say(drink ? 'ごくごく' : 'もぐもぐ'); }
        eyes(fr, true);
        for (let i = 0; i < 6; i++) ctx.after(i * 140, () => {
          mouth(fr, i % 2 ? 'open' : 'closed');
          if (i % 2 === 0 && (!drink || i === 0)) crumbs(mx, my + 6, f.def.crumbs, i ? 6 : 10);
          fr.head.parentNode.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07,.93)' }, { transform: 'scale(1)' }], { duration: 140 });
        });
        ctx.after(900, () => {
          const before = fr.full;
          fr.full = Math.min(2, fr.full + (fav ? 2 : 1));
          const [a, b, c] = SIZES[before], [a2, b2, c2] = SIZES[fr.full];
          ctx.tween(560, k => setTummy(fr, a + (a2 - a) * k, b + (b2 - b) * k, c + (c2 - c) * k), null, easeBack);
          fr.tumG.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14,.88)', offset: .4 }, { transform: 'scale(.96,1.05)', offset: .7 }, { transform: 'scale(1)' }], { duration: 560 });
          A.osc(220, { slide: 520, slideT: .3, r: .12, vol: .1 });
          squash(fr, fav);
          ctx.after(120, () => cry(fr));
          eyes(fr, false); mouth(fr, 'happy');
          ctx.bubble('おいしい！', fr.x, HY - 100);
          ctx.after(700, () => say('おいしい！'));
          if (fav) {
            hearts(fr.x, HY - 30);
            ctx.sparkle(fr.x, HY - 20, 5, 60, '#ffd56b');
            [0, 2, 4].forEach((n, j) => A.bell(mtof(PENTA[n + 5]), { when: .3 + j * .08, vol: .1 }));
            ghost.giggle(); ctx.after(700, () => ghost.set('normal'));
          } else {
            ctx.sparkle(fr.x, HY - 20, 3, 50);
            ghost.hop();
          }
          fr.busy = Math.max(0, fr.busy - 1);
          ctx.after(800, () => {
            if (fr.gone || fr.busy) return;
            mouth(fr, 'closed');
            if (fr.full >= 2) { eyes(fr, true); pat(fr, 3); ctx.after(1000, () => { if (!fr.gone && !celebrating) eyes(fr, false); }); }
          });
          checkDone();
        });
      }
      function pat(fr, n) {
        [fr.pl, fr.pr].forEach((p, j) => p.animate([{ transform: 'translate(0px,0px)' }, { transform: `translate(${j ? -10 : 10}px,-12px)` }, { transform: 'translate(0px,0px)' }], { duration: 300, iterations: n, delay: j * 150 }));
        for (let j = 0; j < n * 2; j++) A.osc(130 + (j % 2) * 20, { type: 'triangle', when: j * .15 + .14, slide: 90, slideT: .05, r: .06, vol: .14, wet: 0 });
      }

      /* ---------- the birthday cake ---------- */
      function makeCake() {
        const outer = el('g', { transform: 'translate(200 664)' }, trayL);
        const inner = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, outer);
        el('ellipse', { cx: 0, cy: 62, rx: 120, ry: 14, fill: '#fff', opacity: .9 }, inner);
        el('rect', { x: -104, y: 4, width: 208, height: 58, rx: 14, fill: '#fff1d6' }, inner);
        el('rect', { x: -104, y: 26, width: 208, height: 10, fill: '#ff9cb2' }, inner);
        el('rect', { x: -70, y: -40, width: 140, height: 50, rx: 12, fill: '#fff1d6' }, inner);
        el('rect', { x: -70, y: -22, width: 140, height: 8, fill: '#ff9cb2' }, inner);
        el('path', { d: 'M-106,8 Q-92,20 -78,8 Q-64,20 -50,8 Q-36,20 -22,8 Q-8,20 6,8 Q20,20 34,8 Q48,20 62,8 Q76,20 90,8 Q100,16 106,8 L106,2 L-106,2Z', fill: '#fff' }, inner);
        el('path', { d: 'M-72,-36 Q-60,-26 -48,-36 Q-36,-26 -24,-36 Q-12,-26 0,-36 Q12,-26 24,-36 Q36,-26 48,-36 Q60,-26 72,-36 L72,-42 L-72,-42Z', fill: '#fff' }, inner);
        [-84, -42, 42, 84].forEach(x => { el('path', { d: `M${x},4 C${x - 13},0 ${x - 11},-16 ${x},-14 C${x + 11},-16 ${x + 13},0 ${x},4Z`, fill: '#ff5d72' }, inner); });
        const flames = [];
        [-40, 0, 40].forEach((x, i) => {
          el('rect', { x: x - 5, y: -78, width: 10, height: 38, rx: 4, fill: PARTY[i * 2 + 1] }, inner);
          el('path', { d: `M${x - 5},-70 l10,-6 M${x - 5},-58 l10,-6 M${x - 5},-46 l10,-6`, stroke: '#fff', 'stroke-width': 2.5, opacity: .7 }, inner);
          const fl = el('g', { transform: `translate(${x} -84)` }, inner);
          const fi = el('g', { class: 'tb', style: 'transform-origin:50% 100%' }, fl);
          el('path', { d: 'M0,4 C-9,-2 -6,-14 0,-22 C6,-14 9,-2 0,4Z', fill: '#ffb23f' }, fi);
          el('path', { d: 'M0,2 C-4,-2 -3,-8 0,-12 C3,-8 4,-2 0,2Z', fill: '#fff3b0' }, fi);
          fi.animate([{ transform: 'scale(1,1) rotate(-4deg)' }, { transform: 'scale(.9,1.12) rotate(4deg)' }], { duration: 260 + i * 40, iterations: Infinity, direction: 'alternate' });
          flames.push(fl);
        });
        const glow = el('ellipse', { cx: 0, cy: -96, rx: 70, ry: 26, fill: '#fff3b0', opacity: .35 }, inner);
        el('rect', { x: -110, y: -110, width: 220, height: 180, fill: 'transparent' }, inner);
        const c = { outer, inner, flames, glow, sung: false };
        inner.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.12,.9)', offset: .6 }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
        outer.addEventListener('pointerdown', e => { e.stopPropagation(); haptic(); sing(); });
        return c;
      }
      function note(x, y) {
        const g = el('g', { transform: `translate(${f1(x)} ${f1(y)})` }, fxL);
        const t = el('text', { 'font-size': 30, fill: pick(['#ff7a9a', '#8fb8ff', '#ffb23f', '#7fdcc0']), 'text-anchor': 'middle', class: 'tb' }, g);
        t.textContent = pick(['♪', '♫']);
        t.animate([{ transform: 'translate(0px,0px) scale(.4)', opacity: 0 }, { transform: 'translate(-6px,-24px) scale(1.1)', opacity: 1, offset: .3 }, { transform: 'translate(10px,-70px) scale(1)', opacity: 0 }], { duration: 1200, easing: 'ease-out' }).onfinish = () => g.remove();
      }
      function sing() {
        if (!cake) return;
        if (cake.sung) { A.twinkle(); ctx.sparkle(200, 600, 4, 60); return; }
        cake.sung = true;
        cake.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.9)' }, { transform: 'scale(1)' }], { duration: 300 });
        ghost.set('happy'); ghost.talk('みんなで うたおう！');
        friends.forEach(fr => { eyes(fr, true); });
        // a public-domain birthday tune; each note, one friend sings
        const MEL = [[67, .3], [67, .15], [69, .45], [67, .45], [72, .45], [71, .9], [67, .3], [67, .15], [69, .45], [67, .45], [74, .45], [72, .9]];
        let t = 1.3;
        MEL.forEach(([m, d], j) => {
          const at = t;
          ctx.after(at * 1000, () => {
            // the marimba sample is C5 (midi 72)
            if (!A.sfx('marimba', { rate: 2 ** ((m - 72) / 12), vol: .7 })) A.musicbox(mtof(m), { vol: .16 });
            A.musicbox(mtof(m + 12), { vol: .05 });
            const fr = friends[j % friends.length];
            if (!fr) return;
            mouth(fr, 'open'); squash(fr, false); note(fr.x + rand(-20, 20), HY - 60);
            ctx.after(Math.min(260, d * 900), () => { if (!fr.gone) mouth(fr, 'closed'); });
          });
          t += d * .9;
        });
        ctx.after(t * 1000 + 300, () => {
          ghost.talk('ふーっ', false);
          A.whoosh();
          cake.flames.forEach((fl, i) => ctx.after(i * 120, () => {
            fl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
            const s = el('circle', { cx: 200 + (i - 1) * 40, cy: 580, r: 6, fill: '#e8e2f2', class: 'tb' }, fxL);
            s.animate([{ transform: 'translateY(0px) scale(1)', opacity: .9 }, { transform: 'translateY(-40px) scale(2.4)', opacity: 0 }], { duration: 900 }).onfinish = () => s.remove();
          }));
          cake.glow.animate([{ opacity: .35 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
          ctx.after(500, () => {
            if (!A.sfx('applause', { vol: .5 })) A.giggle();
            ghost.talk('ぱちぱち！');
            ctx.confetti(200, 560, 30);
            friends.forEach(fr => { eyes(fr, false); mouth(fr, 'happy'); squash(fr, true); });
          });
          ctx.after(1500, () => {
            const c = cake; cake = null;
            c.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.85)' }, { transform: 'scale(0)' }], { duration: 320, fill: 'forwards' }).onfinish = () => c.outer.remove();
            A.pop();
            ctx.after(200, () => fillTray(['slice', 'slice', 'slice', 'berry', 'berry']));
            ctx.after(900, () => { friends.forEach(fr => mouth(fr, 'closed')); ghost.set('normal'); });
          });
        });
      }

      /* ---------- payoff and reset ---------- */
      function celebrate() {
        if (celebrating) return;
        celebrating = true;
        drag = null;
        ctx.bubble('ごちそうさま！', 200, HY - 110);
        say('ごちそうさま！');
        // everyone lies back, eyes shut, patting a big round belly
        friends.forEach((fr, i) => {
          mouth(fr, 'happy'); eyes(fr, true);
          fr.lean.animate([{ transform: 'rotate(0deg) translateY(0px)' }, { transform: `rotate(${i === 1 ? 0 : (i ? 11 : -11)}deg) scale(1.06,.9) translateY(8px)` }], { duration: 500, fill: 'forwards', easing: 'ease-out', delay: i * 90 });
          fr.head.parentNode.animate([{ transform: 'translateY(0px) rotate(0deg)' }, { transform: `translateY(-6px) rotate(${i === 1 ? -10 : (i ? 8 : -8)}deg)` }], { duration: 500, fill: 'forwards', delay: i * 90 });
          ctx.after(400 + i * 100, () => pat(fr, 5));
        });
        ctx.after(600, () => { if (!A.sfx('snore', { vol: .35 })) A.yawn(); });
        // ぽわん dances in; the big show
        ctx.after(1100, () => {
          const x0 = ghost.x, y0 = ghost.y;
          ctx.tween(650, q => ghost.place(x0 + (200 - x0) * q, y0 + (196 - y0) * q - Math.sin(q * Math.PI) * 60, .55 + q * .15), () => {
            ghost.giggle(); ghost.hop(); A.tada(); haptic(30);
            ctx.confetti(200, 280, 44); ctx.sparkle(200, 380, 8, 150);
            ctx.after(600, () => { ctx.confetti(60, 420, 26); ctx.confetti(340, 420, 26); });
            ghost.talk('おなか いっぱい！');
            ctx.after(500, () => ctx.tween(1400, q => ghost.place(200 + Math.sin(q * Math.PI * 2) * 40, 196 - Math.abs(Math.sin(q * Math.PI * 4)) * 22, .7)));
            friends.forEach((fr, i) => ctx.after(900 + i * 260, () => { cry(fr, .6); fr.tumG.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1,.9)' }, { transform: 'scale(1)' }], { duration: 300 }); }));
          }, easeOut);
        });
        ctx.after(4300, () => {
          ghost.set('happy');
          ghost.moveTo(334, 150, .55, 700, () => ghost.set('normal'));
          foods.forEach(f => { if (f && f.state === 'tray') f.inner.animate([{ transform: 'scale(1)' }, { transform: 'scale(0)' }], { duration: 260, fill: 'forwards' }).onfinish = () => f.outer.remove(); });
          friends.forEach((fr, i) => {
            fr.gone = true;
            eyes(fr, false); mouth(fr, 'happy');
            const dir = i === 0 ? -1 : i === 2 ? 1 : (Math.random() < .5 ? -1 : 1), x0 = fr.x;
            ctx.after(i * 120, () => ctx.tween(800, k => placeSeat(fr, x0 + dir * 380 * k, HY - Math.abs(Math.sin(k * Math.PI * 3)) * 26), () => fr.seat.remove(), easeIn));
          });
          A.whoosh();
          ctx.after(700, () => switchSetting((setting + 1) % SETTINGS.length));
          ctx.after(1200, newRound);
        });
      }
      function switchSetting(i) {
        const next = BGS[i];
        setting = i;
        next.parentNode.insertBefore(next, flies[0].g);
        ctx.tween(700, q => next.setAttribute('opacity', q.toFixed(2)), () => BGS.forEach(b => { if (b !== next) b.setAttribute('opacity', 0); }));
      }
      function newRound() {
        foods = [];
        birthday = round > 0 && Math.random() < 1 / 6;
        round++;
        const kinds = SETTINGS[setting].kinds.slice().sort(() => Math.random() - .5);
        friends = kinds.map((k, i) => makeFriend(k, i));
        friends.forEach((fr, i) => {
          const from = i === 0 ? -150 : i === 2 ? 550 : (round % 2 ? -150 : 550);
          placeSeat(fr, from);
          ctx.after(i * 170, () => ctx.tween(750, k => placeSeat(fr, from + (fr.x - from) * k, HY - Math.abs(Math.sin(k * Math.PI * 3)) * 26 * (1 - k)), () => { cry(fr, .55); squash(fr, false); }, easeOut));
        });
        if (birthday) ctx.after(700, () => { cake = makeCake(); if (!A.sfx('jingle', { vol: .5 })) A.twinkle(); });
        else ctx.after(500, () => fillTray());
        ctx.after(1500, () => {
          ctx.bubble('おなかすいた～', 200, HY - 110);
          say('おなかすいた～');
          friends.forEach((fr, i) => ctx.after(i * 160, () => { squash(fr, false); rumble(fr); }));
        });
        ctx.after(1500, () => { celebrating = false; });
        if (birthday) ctx.after(3200, () => { if (cake && !cake.sung) ghost.talk('おうた！'); });
      }

      /* ---------- ambient life ---------- */
      // hungry tummies rumble and lips get licked
      let amb = 0;
      ctx.every(1900, () => {
        if (celebrating || drag) return;
        const h = friends.filter(fr => fr.full < 2 && !fr.busy && !fr.gone);
        if (!h.length) return;
        const fr = pick(h);
        (amb++ % 2 ? rumble : lick)(fr);
      });
      // blinking
      ctx.every(700, () => {
        const fr = pick(friends);
        if (!fr || fr.gone || Math.random() < .4 || fr.p.shut.style.display === '') return;
        fr.p.open.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 180 });
      });
      // the foods on the tray wiggle now and then
      ctx.every(2600, () => {
        const t = foods.filter(f => f && f.state === 'tray');
        if (!t.length || drag) return;
        pick(t).inner.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-12px) scale(1.05,.95)' }, { transform: 'translateY(0px) scale(.97,1.03)' }, { transform: 'translateY(0px)' }], { duration: 480 });
      });
      ctx.loop((dt, t) => {
        drifting.forEach(c => { if (c.set !== setting) return; const x = ((c.x + t * c.v) % 560) - 80; c.g.setAttribute('transform', `translate(${f1(x)} ${c.y})`); });
        flies.forEach((b, i) => b.g.setAttribute('transform', `translate(${f1(b.cx + Math.sin(t * .5 + b.ph) * 120)} ${f1(b.cy + Math.sin(t * 1.3 + b.ph) * 26)}) rotate(${f1(Math.sin(t * 2 + i) * 12)})`));
        if (setting === 2) blades.setAttribute('transform', `rotate(${f1(t * 40 % 360)})`);
      });

      ghost.pos.addEventListener('pointerdown', e => {
        e.stopPropagation(); haptic(); ghost.giggle(); ghost.hop();
        ghost.talk(pick(['もぐもぐ たのしいね', 'あーん してね', 'おいしそう！']), false);
        ctx.after(900, () => ghost.set('normal'));
      });
      // a tap on the scene: sparkles, a pluck, everyone looks, a butterfly flits there
      ctx.on(ctx.host, 'pointerdown', e => {
        const p = ctx.point(e);
        lastP = p; lookAll(p);
        ctx.sparkle(p.x, p.y, 3, 24, pick(PARTY));
        A.pluck(mtof(pick(PENTA) + 12), { vol: .1 });
        const b = pick(flies); b.cx = clamp(p.x, 60, 340); b.cy = clamp(p.y, 120, 520);
        friends.forEach(fr => { if (!fr.busy && !fr.gone) fr.head.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05,.96)' }, { transform: 'scale(1)' }], { duration: 240, composite: 'add' }); });
      });

      newRound();
      ctx.after(2600, () => { ghost.set('happy'); ghost.talk('たべさせて あげよう！'); ctx.after(1600, () => ghost.set('normal')); });
      ctx.hint = () => {
        if (celebrating || drag) return null;
        if (cake && !cake.sung) return [200, 640];
        const fr = friends.find(q => q.full < 2 && !q.busy);
        if (!fr) return null;
        const f = foods.find(q => q && q.state === 'tray' && isFav(fr, q.id)) || foods.find(q => q && q.state === 'tray');
        return f ? [f.x, f.y] : null;
      };
    }
  };
  TOYS.push(feedToy);
})();
