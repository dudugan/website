// A torch carried by the cursor: a warm halo that flickers, small flame licks rising
// off it, and the odd ember. Drawn on one half-resolution canvas (it is all soft light
// anyway) and screen-blended over the page. Reduced motion gets a steady glow.
// Touch screens have no cursor to carry it, so there it hovers, smaller, near the bottom.

const SCALE = 0.5;
const TAU = Math.PI * 2;

// Where the flame is (viewport px), for the collage's torchlight on touch screens.
export const flame = { x: 0, y: 0, on: false };

export function initTorch() {
  const hovering = !matchMedia('(hover: hover) and (pointer: fine)').matches;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const size = hovering ? 0.6 : 1;

  const canvas = document.createElement('canvas');
  canvas.id = 'torch';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');

  let w = 0;
  let h = 0;
  const resize = () => {
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.ceil(w * SCALE);
    canvas.height = Math.ceil(h * SCALE);
    wake();
  };

  const pointer = { x: 0, y: 0, seen: false };
  const pos = { x: 0, y: 0 };
  let presence = 0; // fades in when the mouse arrives, out when it leaves the window
  let want = 0;
  let jitter = 0;
  let last = 0;
  let running = false;
  const licks = [];
  const embers = [];

  function wake() {
    if (running) return; // requestAnimationFrame already pauses in background tabs
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function glow(x, y, r, stops) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    for (const [at, color] of stops) g.addColorStop(at, color);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000) || 1 / 60;
    last = now;
    const t = now / 1000;

    if (hovering) {
      // Drift a few pixels around a spot just above the bottom edge, on slow, uneven loops.
      const drift = still ? 0 : 1;
      pointer.x = w / 2 + drift * (Math.sin(t * 0.37) * 12 + Math.sin(t * 0.83 + 2) * 5);
      pointer.y = h - 56 + drift * (Math.sin(t * 0.52 + 1) * 6 + Math.sin(t * 1.1) * 2);
      if (!pointer.seen) {
        pointer.seen = true;
        pos.x = pointer.x;
        pos.y = pointer.y;
      }
    }

    // Follow with a little weight, as if carried. Frame-rate independent easing.
    const prevX = pos.x;
    const prevY = pos.y;
    const follow = still ? 1 : 1 - Math.pow(0.0001, dt);
    pos.x += (pointer.x - pos.x) * follow;
    pos.y += (pointer.y - pos.y) * follow;
    const speed = Math.hypot(pos.x - prevX, pos.y - prevY) / dt;
    presence += (want - presence) * (1 - Math.pow(0.015, dt));

    // Flicker: two incommensurate sines plus a smoothed random walk, roughly -1..1.
    jitter = (jitter + (Math.random() - 0.5) * 0.8) * 0.85;
    const f = still ? 0 : 0.35 * Math.sin(t * 6.1) + 0.25 * Math.sin(t * 13.7 + 1.1) + 0.5 * jitter;

    const a = presence;
    const fx = pos.x;
    const fy = pos.y - 4 * size; // the flame sits just above the hand
    flame.x = fx;
    flame.y = fy;
    if (!flame.on && a > 0.5) {
      flame.on = true;
      dispatchEvent(new Event('torch:lit'));
    }

    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    // Halo: the light the torch throws around it.
    glow(fx, fy - 10 * size, 210 * size * (1 + 0.05 * f), [
      [0, `rgba(255,175,95,${0.42 * a * (1 + 0.18 * f)})`],
      [0.22, `rgba(235,115,45,${0.2 * a})`],
      [0.55, `rgba(150,50,15,${0.07 * a})`],
      [1, 'rgba(0,0,0,0)'],
    ]);

    if (!still) {
      // Flame licks: short-lived hot blobs that rise, shrink, and fade.
      while (licks.length < 5) {
        licks.push({ x: fx, y: fy, age: Math.random() * 0.3, life: 0.45 + Math.random() * 0.4, phase: Math.random() * TAU });
      }
      for (let i = licks.length - 1; i >= 0; i--) {
        const l = licks[i];
        l.age += dt;
        const p = l.age / l.life;
        if (p >= 1) {
          licks.splice(i, 1);
          continue;
        }
        const lx = l.x + (fx - l.x) * 0.6 + Math.sin(l.phase + t * 9) * 3 * size * p;
        const ly = l.y + (fy - l.y) * 0.6 - p * 30 * size;
        const alpha = Math.pow(1 - p, 1.6) * 0.55 * a;
        glow(lx, ly, 20 * size * (1 - p * 0.65), [
          [0, `rgba(255,232,185,${alpha})`],
          [0.45, `rgba(255,140,55,${alpha * 0.5})`],
          [1, 'rgba(0,0,0,0)'],
        ]);
      }

      // Embers: a few a second, more when the torch is swung.
      const rate = (0.7 + Math.min(speed / 350, 3)) * a;
      if (Math.random() < rate * dt) {
        embers.push({
          x: fx + (Math.random() - 0.5) * 10 * size,
          y: fy - 10 * size,
          vx: (Math.random() - 0.5) * 16 * size,
          vy: -(30 + Math.random() * 40) * size,
          age: 0,
          life: 0.8 + Math.random() * 1.1,
          r: (1 + Math.random() * 1.1) * Math.max(size, 0.8),
          phase: Math.random() * TAU,
        });
      }
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.age += dt;
        const p = e.age / e.life;
        if (p >= 1) {
          embers.splice(i, 1);
          continue;
        }
        e.x += (e.vx + Math.sin(t * 3 + e.phase) * 10) * dt;
        e.y += e.vy * dt;
        ctx.fillStyle = `rgba(255,${(150 + 70 * (1 - p)) | 0},80,${0.85 * (1 - p)})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * (1 - p * 0.5), 0, TAU);
        ctx.fill();
      }
    }

    // Hot core right at the flame.
    glow(fx, fy, 16 * size, [
      [0, `rgba(255,240,215,${0.38 * a * (1 + 0.2 * f)})`],
      [1, 'rgba(0,0,0,0)'],
    ]);

    if (want || presence > 0.003 || embers.length) requestAnimationFrame(frame);
    else {
      ctx.clearRect(0, 0, w, h);
      running = false;
    }
  }

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!pointer.seen) {
        pointer.seen = true;
        pos.x = pointer.x;
        pos.y = pointer.y;
      }
      want = 1;
      wake();
    },
    { passive: true },
  );
  addEventListener('resize', resize);
  resize();

  if (hovering) {
    want = 1; // always lit; requestAnimationFrame already pauses it in background tabs
    wake();
    return;
  }
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) want = 0;
  });
  addEventListener('blur', () => (want = 0));
}
