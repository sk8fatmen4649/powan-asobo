'use strict';
/* =========================================================
   toy 2: ひかりの おえかき — draw with light under an aurora.
   Three brushes (rainbow light, star trail, bubbles) rotate per round or
   with the big button. After ~8 s of drawing ぽわん admires the picture and
   it turns into a constellation or a firework show.
   ========================================================= */
const lights = (() => {
  // three skies, one per round
  const SKIES = [
    { top: '#0d1240', bot: '#2c2672', aur: [[150, 90, 70], [175, 90, 65], [270, 80, 70]] },
    { top: '#26123f', bot: '#6a2f6e', aur: [[330, 95, 72], [20, 95, 70], [45, 95, 70]] },
    { top: '#061a3a', bot: '#1b4f7c', aur: [[195, 95, 65], [215, 90, 70], [165, 85, 65]] }
  ];
  // hint shapes, in viewBox units (centred near 200,340)
  const SHAPES = [
    t => { const a = t * Math.PI * 2; return [200 + 16 * Math.pow(Math.sin(a), 3) * 8, 330 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 8]; },
    t => {
      const v = i => { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 58 : 140; return [200 + Math.cos(a) * r, 350 + Math.sin(a) * r]; };
      const k = Math.floor(t * 10) % 10, f = t * 10 - Math.floor(t * 10), p = v(k), q = v(k + 1);
      return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
    },
    t => [60 + t * 280, 360 - Math.sin(t * Math.PI) * 170]
  ];
  const BRUSHES = ['rainbow', 'stars', 'bubbles'];

  function note(m, vol = 1) {
    const f = mtof(m);
    A.bell(f, { vol: .075 * vol, r: 1.3, wet: .5 });
    A.osc(f / 2, { type: 'triangle', a: .07, hold: .18, r: 1, vol: .04 * vol, lp: 1000, wet: .6 });
    A.osc(f * .75, { a: .09, hold: .12, r: .9, vol: .022 * vol, wet: .7 });
  }
  function star4(c, x, y, r) {
    c.beginPath();
    c.moveTo(x, y - r); c.quadraticCurveTo(x + r * .15, y - r * .15, x + r, y); c.quadraticCurveTo(x + r * .15, y + r * .15, x, y + r);
    c.quadraticCurveTo(x - r * .15, y + r * .15, x - r, y); c.quadraticCurveTo(x - r * .15, y - r * .15, x, y - r); c.fill();
  }
  function star5(c, x, y, r, rot) {
    c.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
  }

  return {
    id: 'light', name: 'ひかりの おえかき', color: '#2d2a6e',
    thumb(g) {
      el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#23205a' }, g);
      ['#ff7a8a', '#ffd56b', '#7fdcc0', '#8fb8ff'].forEach((c, i) =>
        el('path', { d: `M-60,${30 - i * 14} Q-20,${-40 - i * 10} 20,${10 - i * 12} T70,${-30 - i * 6}`, stroke: c, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', opacity: .9 }, g));
      [[-40, -50], [40, 40], [-50, 50], [50, -55], [0, 60]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 2.5, fill: '#fff' }, g));
    },
    mount(ctx) {
      const cv = document.createElement('canvas');
      cv.className = 'paint';
      ctx.host.insertBefore(cv, ctx.svg);
      ctx.svg.style.pointerEvents = 'none';
      ctx.svg.style.position = 'absolute'; ctx.svg.style.inset = '0';
      ctx.cleanup(() => cv.remove());
      const c2 = cv.getContext('2d');
      let W = 0, H = 0, SC = 1, OX = 0, OY = 0;
      function size() {
        const r = ctx.host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
        W = r.width; H = r.height;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
        SC = Math.min(W / 400, H / 760); OX = (W - 400 * SC) / 2; OY = (H - 760 * SC) / 2;
      }
      size(); ctx.on(window, 'resize', size);
      const V = (x, y) => [OX + x * SC, OY + y * SC];

      const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random() * .85, r: rand(.6, 2), p: rand(0, 6), s: rand(1, 3) }));
      const trails = [], parts = [], pts = [], meteors = [], pointers = new Map();
      let hue = rand(0, 360), lastAt = null, round = 0, brush = 0, sky = 0, prevSky = -1, skyFade = 1;
      let drawTime = 0, show = null, hintA = 1, lastDraw = -10, lastNote = 0, special = false;
      const local = e => { const r = ctx.host.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      const noteFor = y => PENTA[clamp(Math.floor((1 - (y - OY) / (760 * SC)) * PENTA.length), 0, PENTA.length - 1)];

      /* ぽわん and the brush button (SVG overlay) */
      const ghost = ctx.ghost(ctx.svg, { x: 200, y: 640, s: .8 });
      ghost.glow(true);
      const btn = el('g', { transform: 'translate(336 690)', style: 'pointer-events:auto;cursor:pointer' }, ctx.svg);
      const bb = el('g', { class: 'tb' }, btn);
      el('circle', { r: 54, fill: '#fff', opacity: .12 }, bb);
      el('circle', { r: 44, fill: '#3b3488', stroke: '#fff', 'stroke-width': 3, 'stroke-opacity': .6 }, bb);
      const icon = el('g', {}, bb);
      function drawIcon() {
        icon.replaceChildren();
        const b = BRUSHES[brush];
        if (b === 'rainbow') ['#ff7a8a', '#ffd56b', '#7fdcc0', '#8fb8ff'].forEach((c, i) => el('path', { d: `M${-26 + i * 6},12 A${26 - i * 6},${26 - i * 6} 0 0 1 ${26 - i * 6},12`, stroke: c, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, icon));
        else if (b === 'stars') {
          const s = (x, y, r, c) => { let d = ''; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1); } el('path', { d: d + 'Z', fill: c }, icon); };
          s(-4, 2, 22, '#ffd56b'); s(18, -16, 9, '#fff'); s(-20, -18, 6, '#ffb3c4');
        } else {
          [[-8, 4, 18], [14, -12, 11], [14, 16, 7]].forEach(([x, y, r]) => { el('circle', { cx: x, cy: y, r, fill: '#8fd3ff', opacity: .35, stroke: '#cfeeff', 'stroke-width': 3 }, icon); el('circle', { cx: x - r * .35, cy: y - r * .35, r: r * .25, fill: '#fff' }, icon); });
        }
        icon.animate([{ transform: 'scale(0) rotate(-90deg)' }, { transform: 'scale(1.2) rotate(10deg)', offset: .6 }, { transform: 'scale(1) rotate(0deg)' }], { duration: 420, easing: 'ease-out' });
      }
      const ring = el('circle', { r: 50, fill: 'none', stroke: '#ffd56b', 'stroke-width': 4, opacity: 0, 'pointer-events': 'none' }, btn);
      function setBrush(i, manual) {
        brush = i % BRUSHES.length; drawIcon();
        bb.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18,.84)' }, { transform: 'scale(.9,1.1)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
        ring.animate([{ opacity: .9, transform: 'scale(.9)' }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 600, easing: 'ease-out' });
        if (manual) { A.sfx('spin', { rate: rand(1, 1.2), vol: .4 }) || A.whoosh(); ctx.sparkle(336, 690, 5, 50, '#ffd56b'); }
        note(PENTA[5 + brush * 2], .8);
      }
      btn.addEventListener('pointerdown', e => { e.stopPropagation(); haptic(); setBrush(brush + 1, true); });
      drawIcon();

      /* drawing */
      function emit(x, y, d) {
        const b = BRUSHES[brush], s = SC;
        if (b === 'rainbow') {
          if (Math.random() < d / 10) parts.push({ k: 'spark', x: x + rand(-8, 8) * s, y: y + rand(-8, 8) * s, vx: rand(-30, 30), vy: rand(-40, 10), hue: hue + rand(-30, 30), life: rand(.7, 1.4), age: 0, r: rand(4, 8) * s });
        } else if (b === 'stars') {
          if (Math.random() < d / 16) parts.push({ k: 'star', x: x + rand(-6, 6) * s, y: y + rand(-6, 6) * s, vx: rand(-15, 15), vy: rand(-15, 15), hue: pick([48, 48, 330, 200, 0]), life: rand(2.4, 3.6), age: 0, r: rand(7, 15) * s, rot: rand(0, 6), vr: rand(-2, 2) });
        } else {
          if (Math.random() < d / 18) parts.push({ k: 'bub', x: x + rand(-6, 6) * s, y: y + rand(-6, 6) * s, vx: rand(-10, 10), vy: rand(-50, -20), hue: rand(160, 320), life: rand(2.6, 4), age: 0, r: rand(7, 20) * s, p: rand(0, 6) });
        }
        if (parts.length > 700) parts.splice(0, parts.length - 700);
      }
      ctx.on(ctx.host, 'pointerdown', e => {
        const [x, y] = local(e);
        pointers.set(e.pointerId, { x, y, dist: 0, sx: x, sy: y });
        lastAt = [e.clientX, e.clientY];
        note(noteFor(y), .9); lastNote = performance.now();
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; parts.push({ k: 'spark', x, y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, hue, life: rand(.5, .9), age: 0, r: rand(4, 7) * SC }); }
        if (BRUSHES[brush] === 'bubbles') A.sfx('bubble', { rate: rand(.9, 1.3), vol: .4 });
      });
      ctx.on(ctx.host, 'pointermove', e => {
        const p = pointers.get(e.pointerId);
        if (!p) return;
        const [x, y] = local(e), d = Math.hypot(x - p.x, y - p.y);
        if (d < 2) return;
        hue = (hue + d * .45) % 360;
        trails.push({ x1: p.x, y1: p.y, x2: x, y2: y, hue, age: 0, w: clamp(22 - d * .16, 9, 22) * SC, b: BRUSHES[brush] });
        emit(x, y, d);
        if (Math.hypot(x - p.sx, y - p.sy) > 34 * SC) { pts.push([x, y, hue]); p.sx = x; p.sy = y; if (pts.length > 120) pts.shift(); }
        p.x = x; p.y = y; p.dist += d;
        lastAt = [e.clientX, e.clientY]; lastDraw = performance.now() / 1000;
        const now = performance.now();
        if (now - lastNote > 150) {
          lastNote = now;
          note(noteFor(y), .7);
          if (BRUSHES[brush] === 'bubbles' && Math.random() < .3) A.sfx('bubble', { rate: rand(1, 1.5), vol: .25 });
        }
      });
      const up = e => {
        const p = pointers.get(e.pointerId);
        if (p && p.dist < 12) {
          // a tap: a little firework
          burst(p.x, p.y, rand(0, 360), 46);
          const base = Math.floor(rand(0, 5));
          [0, 2, 4].forEach((k, i) => A.bell(mtof(PENTA[base + k] + 12), { when: i * .06, vol: .07 }));
          haptic(20);
        }
        pointers.delete(e.pointerId);
      };
      ctx.on(ctx.host, 'pointerup', up);
      ctx.on(ctx.host, 'pointercancel', up);
      function burst(x, y, h, n) {
        for (let i = 0; i < n; i++) {
          const a = i / n * Math.PI * 2 + rand(-.05, .05), s = rand(110, 280) * SC;
          parts.push({ k: 'fw', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, hue: h + rand(-35, 35), life: rand(1.1, 1.8), age: 0, r: rand(2.5, 4.5) * SC });
        }
        for (let i = 0; i < 6; i++) parts.push({ k: 'spark', x: x + rand(-30, 30) * SC, y: y + rand(-30, 30) * SC, vx: 0, vy: 10, hue: h, life: rand(.8, 1.3), age: 0, r: rand(6, 10) * SC });
      }

      /* the payoff: constellation or fireworks */
      function startShow() {
        let src = pts.slice();
        const chosen = [];
        for (const p of src) if (chosen.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > 56 * SC)) chosen.push(p);
        while (chosen.length < 5) { const [x, y] = V(rand(70, 330), rand(160, 520)); chosen.push([x, y, rand(0, 360)]); }
        const kind = round % 2 ? 'fireworks' : 'stars';
        show = { kind, t: 0, pts: chosen.slice(0, kind === 'stars' ? 12 : 7), fired: 0 };
        drawTime = 0;
        const gx = 200, gy = 610;
        ghost.set('surprise');
        ghost.moveTo(gx, gy, 1.05, 600, () => { ghost.set('happy'); ghost.hop(); }, easeBack);
        ctx.after(400, () => ghost.talk(pick(['きれいだね！', 'すてき！', 'わあ！'])));
        if (special) A.sfx('sleigh', { vol: .45 });
      }
      function showStep(dt) {
        const S = show; S.t += dt;
        if (S.kind === 'stars') {
          const n = S.pts.length, step = 1.7 / n;
          while (S.fired < n && S.t > .3 + S.fired * step) { note(PENTA[Math.min(PENTA.length - 1, 2 + S.fired)] + 12, .8); S.fired++; A.sfx('sparkle', { rate: 1 + S.fired * .04, vol: .18 }); }
        } else {
          const n = S.pts.length, step = 1.8 / n;
          while (S.fired < n && S.t > .3 + S.fired * step) {
            const [x, y, h] = S.pts[S.fired];
            burst(x, y, h, 60);
            A.noise({ type: 'lowpass', from: 500, dur: .3, vol: .16 });
            A.sfx(pick(['pop', 'pop2']), { rate: rand(.6, .8), vol: .5 });
            ctx.after(140, () => A.twinkle());
            S.fired++;
          }
        }
        if (!S.cheer && S.t > 2) {
          S.cheer = true;
          A.tada();
          ctx.confetti(200, 330, 30); ctx.after(450, () => ctx.confetti(200, 300, 30));
          ghost.giggle(); ghost.swing(40, 300);
          const x0 = ghost.x, y0 = ghost.y;
          ctx.tween(900, k => ghost.place(x0 + Math.sin(k * Math.PI * 2) * 70, y0 - Math.sin(k * Math.PI) * 70, 1.05), () => ghost.hop());
        }
        if (special && S.t < 2.6 && Math.random() < dt * 9) meteor(true);
        if (S.t > 3.6) { show = null; nextRound(); }
      }
      function nextRound() {
        round++;
        special = Math.random() < 1 / 6;
        prevSky = sky; sky = round % SKIES.length; skyFade = 0;
        setBrush(round, false);
        trails.forEach(s => { s.age = Math.max(s.age, 5); });
        pts.length = 0;
        hintA = 1;
        ghost.moveTo(200, 640, .8, 700, () => ghost.set('normal'));
        ctx.after(800, () => ghost.talk(pick(['もういっかい！', 'かいてね！'])));
      }
      function meteor(big) {
        const [x, y] = V(rand(40, 420), rand(-20, 260));
        meteors.push({ x, y, vx: -rand(260, 380) * SC, vy: rand(130, 200) * SC, age: 0, life: rand(.9, 1.3), big });
      }
      ctx.every(2600, () => { if (Math.random() < .8) meteor(false); });
      meteor(false);

      /* rendering */
      function aurora(t, P, alpha) {
        const top = OY + 40 * SC;
        P.aur.forEach(([h, s, l], i) => {
          const base = top + (110 + i * 70) * SC, amp = (34 + i * 10) * SC, hgt = (170 - i * 20) * SC;
          const g = c2.createLinearGradient(0, base - amp - 20 * SC, 0, base + hgt);
          g.addColorStop(0, `hsla(${h},${s}%,${l}%,0)`);
          g.addColorStop(.25, `hsla(${h},${s}%,${l}%,${(.32 * alpha).toFixed(3)})`);
          g.addColorStop(1, `hsla(${h},${s}%,${l}%,0)`);
          c2.fillStyle = g;
          c2.beginPath();
          const N = 24;
          for (let j = 0; j <= N; j++) {
            const x = -20 + (W + 40) * j / N;
            const y = base + Math.sin(x / (120 * SC) + t * (.35 + i * .12) + i * 2) * amp + Math.sin(x / (47 * SC) - t * .6) * amp * .3;
            j ? c2.lineTo(x, y) : c2.moveTo(x, y);
          }
          for (let j = N; j >= 0; j--) {
            const x = -20 + (W + 40) * j / N;
            const y = base + hgt + Math.sin(x / (150 * SC) + t * .3 + i) * amp * .5;
            c2.lineTo(x, y);
          }
          c2.closePath(); c2.fill();
        });
      }
      function sky_(P, a) {
        const g = c2.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, P.top); g.addColorStop(1, P.bot);
        c2.globalAlpha = a; c2.fillStyle = g; c2.fillRect(0, 0, W, H); c2.globalAlpha = 1;
      }
      ctx.loop((dt, t) => {
        c2.globalCompositeOperation = 'source-over';
        skyFade = Math.min(1, skyFade + dt * .8);
        if (prevSky >= 0 && skyFade < 1) sky_(SKIES[prevSky], 1);
        sky_(SKIES[sky], prevSky >= 0 ? skyFade : 1);
        stars.forEach(s => {
          c2.fillStyle = `rgba(255,255,255,${(.35 + .4 * Math.sin(t * s.s + s.p)).toFixed(2)})`;
          c2.beginPath(); c2.arc(s.x * W, s.y * H, s.r, 0, 7); c2.fill();
        });
        c2.globalCompositeOperation = 'lighter';
        aurora(t, SKIES[sky], prevSky >= 0 ? skyFade : 1);
        if (prevSky >= 0 && skyFade < 1) aurora(t, SKIES[prevSky], 1 - skyFade);
        // a gentle moon
        {
          const [mx, my] = V(330, 120);
          const g = c2.createRadialGradient(mx, my, 4, mx, my, 70 * SC);
          g.addColorStop(0, 'rgba(255,246,200,.55)'); g.addColorStop(1, 'rgba(255,246,200,0)');
          c2.fillStyle = g; c2.beginPath(); c2.arc(mx, my, 70 * SC, 0, 7); c2.fill();
          c2.fillStyle = 'rgba(255,248,214,.95)'; c2.beginPath(); c2.arc(mx, my, 24 * SC, 0, 7); c2.fill();
          c2.globalCompositeOperation = 'source-over';
          c2.strokeStyle = '#8a7a9a'; c2.lineWidth = 2.2 * SC; c2.lineCap = 'round';
          [-1, 1].forEach(d => { c2.beginPath(); c2.arc(mx + d * 8 * SC, my - 2 * SC, 3.5 * SC, Math.PI * .15, Math.PI * .85); c2.stroke(); });
          c2.fillStyle = 'rgba(255,163,184,.7)';
          [-1, 1].forEach(d => { c2.beginPath(); c2.ellipse(mx + d * 13 * SC, my + 5 * SC, 4 * SC, 2.6 * SC, 0, 0, 7); c2.fill(); });
          c2.globalCompositeOperation = 'lighter';
        }
        // shooting stars
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i]; m.age += dt;
          if (m.age > m.life) { meteors.splice(i, 1); continue; }
          m.x += m.vx * dt; m.y += m.vy * dt;
          const k = Math.sin(m.age / m.life * Math.PI), len = (m.big ? .45 : .3);
          const g = c2.createLinearGradient(m.x, m.y, m.x - m.vx * len, m.y - m.vy * len);
          g.addColorStop(0, `rgba(255,255,255,${(.9 * k).toFixed(2)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
          c2.strokeStyle = g; c2.lineWidth = (m.big ? 4 : 2.5) * SC; c2.lineCap = 'round';
          c2.beginPath(); c2.moveTo(m.x, m.y); c2.lineTo(m.x - m.vx * len, m.y - m.vy * len); c2.stroke();
          c2.fillStyle = `rgba(255,250,220,${k.toFixed(2)})`; star4(c2, m.x, m.y, (m.big ? 9 : 6) * SC);
        }
        // the glowing hint path
        const drawing = pointers.size > 0;
        hintA += ((drawing || show || t - lastDraw < 4 ? 0 : 1) - hintA) * Math.min(1, dt * (drawing ? 6 : 1.2));
        if (hintA > .02) {
          const sh = SHAPES[round % SHAPES.length], N = 46;
          for (let i = 0; i < N; i++) {
            const [x, y] = V(...sh(i / N));
            const pulse = .5 + .5 * Math.sin(t * 3 - i * .5);
            c2.fillStyle = `rgba(255,236,160,${(hintA * (.18 + .3 * pulse)).toFixed(3)})`;
            c2.beginPath(); c2.arc(x, y, (5 + 3 * pulse) * SC, 0, 7); c2.fill();
          }
          for (let j = 0; j < 2; j++) {
            const u = ((t * .16 + j * .5) % 1);
            const [x, y] = V(...sh(u));
            const g = c2.createRadialGradient(x, y, 0, x, y, 26 * SC);
            g.addColorStop(0, `rgba(255,255,255,${(.9 * hintA).toFixed(2)})`); g.addColorStop(1, 'rgba(255,220,140,0)');
            c2.fillStyle = g; c2.beginPath(); c2.arc(x, y, 26 * SC, 0, 7); c2.fill();
          }
        }
        // strokes: wide glow + bright core (source-over so scribbles keep their colour)
        c2.globalCompositeOperation = 'source-over';
        c2.lineCap = 'round';
        const fade = show ? 3 : 1;
        for (let i = trails.length - 1; i >= 0; i--) {
          const s = trails[i];
          s.age += dt * fade;
          const k = 1 - s.age / 7;
          if (k <= 0) { trails.splice(i, 1); continue; }
          c2.beginPath(); c2.moveTo(s.x1, s.y1); c2.lineTo(s.x2, s.y2);
          if (s.b === 'rainbow') {
            c2.strokeStyle = `hsla(${s.hue},100%,62%,${(.1 * k).toFixed(3)})`; c2.lineWidth = s.w * 3.2; c2.stroke();
            c2.strokeStyle = `hsla(${s.hue},100%,64%,${(.5 * k).toFixed(3)})`; c2.lineWidth = s.w * 1.2; c2.stroke();
            c2.strokeStyle = `hsla(${s.hue},100%,86%,${(.95 * k).toFixed(3)})`; c2.lineWidth = s.w * .4; c2.stroke();
          } else if (s.b === 'stars') {
            c2.strokeStyle = `rgba(255,200,90,${(.1 * k).toFixed(3)})`; c2.lineWidth = s.w * 2; c2.stroke();
            c2.strokeStyle = `rgba(255,236,170,${(.85 * k).toFixed(3)})`; c2.lineWidth = s.w * .22; c2.stroke();
          } else {
            c2.strokeStyle = `hsla(${(s.hue % 160) + 170},90%,75%,${(.12 * k).toFixed(3)})`; c2.lineWidth = s.w * 1.8; c2.stroke();
          }
        }
        // particles
        c2.globalCompositeOperation = 'lighter';
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.age += dt;
          if (p.age > p.life) { parts.splice(i, 1); continue; }
          const k = 1 - p.age / p.life;
          if (p.k === 'fw') { p.vy += 120 * SC * dt; p.vx *= .975; p.vy *= .975; }
          else if (p.k === 'bub') { p.vx = Math.sin(p.age * 3 + p.p) * 18; }
          else { p.vx *= .97; p.vy *= .97; }
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.k === 'spark') {
            c2.fillStyle = `hsla(${p.hue},100%,85%,${k.toFixed(3)})`; star4(c2, p.x, p.y, p.r * (.4 + k * .8));
          } else if (p.k === 'star') {
            p.rot += p.vr * dt;
            const tw = .75 + .25 * Math.sin(p.age * 9 + p.r);
            c2.fillStyle = `hsla(${p.hue},100%,70%,${(.25 * k).toFixed(3)})`; star5(c2, p.x, p.y, p.r * 1.8, p.rot);
            c2.fillStyle = `hsla(${p.hue},100%,${p.hue === 48 ? 72 : 82}%,${(k * tw).toFixed(3)})`; star5(c2, p.x, p.y, p.r, p.rot);
          } else if (p.k === 'bub') {
            const r = p.r * (1 + p.age * .12);
            c2.strokeStyle = `hsla(${p.hue},90%,82%,${(.75 * k).toFixed(3)})`; c2.lineWidth = 2.2 * SC;
            c2.fillStyle = `hsla(${p.hue},90%,70%,${(.12 * k).toFixed(3)})`;
            c2.beginPath(); c2.arc(p.x, p.y, r, 0, 7); c2.fill(); c2.stroke();
            c2.fillStyle = `rgba(255,255,255,${(.8 * k).toFixed(3)})`;
            c2.beginPath(); c2.arc(p.x - r * .35, p.y - r * .35, r * .22, 0, 7); c2.fill();
            if (k < .06 && !p.popped) { p.popped = true; parts.push({ k: 'spark', x: p.x, y: p.y, vx: 0, vy: 0, hue: p.hue, life: .35, age: 0, r: r * .8 }); }
          } else {
            c2.fillStyle = `hsla(${p.hue},100%,70%,${(k * .3).toFixed(3)})`;
            c2.beginPath(); c2.arc(p.x, p.y, p.r * 2.6, 0, 7); c2.fill();
            c2.fillStyle = `hsla(${p.hue},100%,82%,${k.toFixed(3)})`;
            c2.beginPath(); c2.arc(p.x, p.y, p.r, 0, 7); c2.fill();
          }
        }
        // constellation
        if (show && show.kind === 'stars') {
          const S = show, n = S.pts.length, step = 1.7 / n, out = S.t > 3 ? 1 - (S.t - 3) / .6 : 1;
          c2.lineWidth = 3 * SC; c2.lineCap = 'round';
          for (let i = 1; i < n; i++) {
            const k = clamp((S.t - .3 - i * step) / step, 0, 1);
            if (k <= 0) break;
            const [x0, y0] = S.pts[i - 1], [x1, y1] = S.pts[i];
            c2.strokeStyle = `rgba(200,220,255,${(.55 * out).toFixed(3)})`;
            c2.beginPath(); c2.moveTo(x0, y0); c2.lineTo(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); c2.stroke();
          }
          S.pts.forEach(([x, y, h], i) => {
            const k = clamp((S.t - .3 - i * step) / .3, 0, 1);
            if (k <= 0) return;
            const pulse = 1 + .25 * Math.sin(S.t * 8 + i);
            const r = (16 + (S.t > 2 ? 6 : 0)) * SC * easeBack(k) * pulse;
            const g = c2.createRadialGradient(x, y, 0, x, y, r * 2.6);
            g.addColorStop(0, `hsla(${h},100%,85%,${(.7 * out).toFixed(3)})`); g.addColorStop(1, `hsla(${h},100%,70%,0)`);
            c2.fillStyle = g; c2.beginPath(); c2.arc(x, y, r * 2.6, 0, 7); c2.fill();
            c2.fillStyle = `rgba(255,255,255,${out.toFixed(3)})`; star4(c2, x, y, r);
          });
        }
        if (show) showStep(dt);

        // drawing time builds up to the payoff
        if (drawing && !show && t - lastDraw < .1) { drawTime += dt; if (drawTime >= 8) startShow(); }

        // ぽわん follows the drawing finger, a little behind it
        if (!show) {
          let tx = 200, ty = 640;
          if (pointers.size && lastAt) {
            const q = ctx.pointXY(lastAt[0], lastAt[1]);
            tx = clamp(q.x + (q.x > 200 ? -90 : 90), 70, 330); ty = clamp(q.y + 70, 140, 640);
            if (ghost.expr !== 'happy') ghost.set('happy');
          } else if (ghost.expr === 'happy' && t - lastDraw > 2) ghost.set('normal');
          const k = Math.min(1, dt * 3);
          ghost.place(ghost.x + (tx - ghost.x) * k, ghost.y + (ty - ghost.y) * k, ghost.s + (.8 - ghost.s) * k);
        }
      });
      ctx.after(500, () => { ghost.set('happy'); ghost.talk('ゆびで かいてね！'); });
      ctx.hint = () => show ? null : SHAPES[round % SHAPES.length](0.02);
    }
  };
})();
TOYS.push(lights);
