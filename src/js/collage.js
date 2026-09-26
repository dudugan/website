// A faint collage behind any page whose links carry data-img (the build adds it for links
// that `npm run images` found a picture for). Each image sits beside its own link, drifts a
// little with scroll and bobs when the page moves, brightens as the torch comes near, and
// comes up in colour while its link is hovered or focused.
//
// Touch screens have no hover, so there the torch hovering at the bottom does the work: as
// you scroll, pictures passing near it are lit, in colour, the more the closer. And the first
// tap on a pictured link lights its picture fully; a second tap on the same link opens it.

import { flame } from './torch.js';

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mouse = matchMedia('(hover: hover) and (pointer: fine)').matches;

let layer = null;
let items = [];
let byLink = new Map();
let hovered = null; // by mouse or keyboard focus
let tapped = null; // touch: the item whose link was tapped once
let armed = null; //  touch: that link, which opens on the next tap
let wide = true;
let raf = 0;
let lastT = 0;
let lastScroll = 0;
const pointer = { x: 0, y: 0, in: false };

// Stable per-image randomness, so an image keeps its place across visits.
function random(str) {
  let seed = 2166136261;
  for (const ch of str) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build() {
  teardown();
  const links = [...document.querySelectorAll('#content a[data-img]')];
  if (!links.length) return;

  layer = document.createElement('div');
  layer.id = 'collage';
  layer.setAttribute('aria-hidden', 'true');
  const bySrc = new Map();
  for (const link of links) {
    const src = link.dataset.img;
    let item = bySrc.get(src);
    if (!item) {
      const img = new Image();
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      img.src = src;
      const r = random(src);
      item = {
        img,
        links: [],
        size: r(),
        spread: r(),
        jitter: r(),
        rot: (r() - 0.5) * 9,
        depth: still ? 0 : (r() - 0.5) * 0.24, // parallax: some drift ahead of the page, some behind
        bob: still ? 0 : r() < 0.55 ? 0.35 + r() * 0.65 : 0.08, // only some bob noticeably
        k: 45 + r() * 55, // spring stiffness, so they don't bob in step
        x: 0,
        y: 0,
        w: 0,
        off: 0,
        vel: 0,
        near: 0,
        lit: 0,
        drawn: '',
      };
      bySrc.set(src, item);
      items.push(item);
      layer.append(img);
    }
    item.links.push(link);
    byLink.set(link, item);
  }
  document.body.prepend(layer);
  layout();
  requestAnimationFrame(() => layer?.classList.add('shown'));
}

function teardown() {
  layer?.remove();
  layer = null;
  items = [];
  byLink = new Map();
  hovered = tapped = null;
  armed?.classList.remove('armed');
  armed = null;
}

function layout() {
  if (!layer) return;
  const col = document.getElementById('content').getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const margin = col.left;
  wide = margin > 150;
  for (const it of items) {
    const rect = it.links[0].getClientRects()[0] ?? it.links[0].getBoundingClientRect();
    it.w = wide ? 88 + it.size * 72 : 60 + it.size * 36;
    if (wide) {
      // In the margin on the link's side, now and then reaching in under the text.
      const out = -24 + it.spread * margin * 0.95;
      it.x = rect.left + rect.width / 2 < col.left + col.width / 2 ? col.left - out : col.right + out;
    } else {
      // Across the whole width, but leaning out toward the edges (and a little past them).
      const u = it.spread < 0.5 ? 0.5 * (2 * it.spread) ** 1.6 : 1 - 0.5 * (2 - 2 * it.spread) ** 1.6;
      it.x = it.w * 0.3 + u * (vw - it.w * 0.6);
    }
    it.y = rect.top + scrollY + rect.height / 2 + (it.jitter - 0.5) * 90;
    it.img.style.left = `${it.x}px`;
    it.img.style.top = `${it.y}px`;
    it.img.style.width = `${it.w}px`;
    it.drawn = '';
  }
  lastScroll = scrollY;
  wake();
}

function wake() {
  if (raf || !layer) return;
  lastT = performance.now();
  raf = requestAnimationFrame(frame);
}

function frame(now) {
  raf = 0;
  // A frame's timestamp can predate the performance.now() taken in an event handler.
  const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000));
  lastT = now;
  const sy = scrollY;
  const vh = innerHeight;
  const ds = sy - lastScroll;
  lastScroll = sy;
  const kick = Math.abs(ds) < 300 ? ds * 0.3 : 0; // no lurch on jumps like back/forward
  const base = wide ? 0.14 : 0.09;
  const litTo = wide ? 1 : 0.8; // on narrow screens the images sit under the text
  let busy = false;

  if (!mouse && flame.on) {
    // On touch screens the hovering torch is the pointer.
    pointer.x = flame.x;
    pointer.y = flame.y;
    pointer.in = true;
  }
  const reach = mouse ? 240 : 170; // on phones, about as far as the flame's glow is seen

  for (const it of items) {
    // Each image hangs on a spring: it lags when the page moves, then bobs back.
    if (it.bob) {
      it.off = Math.max(-28, Math.min(28, it.off + kick * it.bob));
      it.vel += (-it.k * it.off - 0.6 * Math.sqrt(it.k) * it.vel) * dt;
      it.off += it.vel * dt;
      if (Math.abs(it.off) > 0.05 || Math.abs(it.vel) > 0.5) busy = true;
      else it.off = it.vel = 0;
    }
    const py = it.depth * (sy + vh / 2 - it.y) + it.off;
    const cy = it.y - sy + py;

    let near = 0;
    if (pointer.in) {
      const d = Math.max(0, Math.hypot(pointer.x - it.x, pointer.y - cy) - it.w * 0.4);
      near = Math.max(0, 1 - d / reach) ** 2;
    }
    // Hovered or tapped: fully lit. On touch screens, torchlight lights pictures partway, by nearness.
    const want = it === hovered || it === tapped ? 1 : mouse ? 0 : near * 0.75;
    it.near += (near - it.near) * (1 - 0.01 ** dt);
    it.lit += (want - it.lit) * (1 - (want > it.lit ? 1e-5 : 0.01) ** dt); // quick to light, slow to fade
    if (Math.abs(near - it.near) > 0.002) busy = true;
    else it.near = near;
    if (Math.abs(want - it.lit) > 0.002) busy = true;
    else it.lit = want;

    if (cy < -300 || cy > vh + 300) continue; // off screen: skip the style writes
    const scale = still ? 1 : 1 + it.lit * 0.05;
    const opacity = base + it.near * 0.28 * (1 - it.lit) + it.lit * (litTo - base);
    const drawn = `${py.toFixed(1)}|${scale.toFixed(3)}|${opacity.toFixed(3)}|${it.lit.toFixed(3)}`;
    if (drawn === it.drawn) continue;
    it.drawn = drawn;
    it.img.style.transform = `translate(-50%, -50%) translateY(${py.toFixed(1)}px) rotate(${it.rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
    it.img.style.opacity = opacity.toFixed(3);
    it.img.style.filter = it.lit ? `grayscale(${(1 - it.lit).toFixed(3)})` : '';
    it.img.style.zIndex = it.lit ? '1' : '';
  }
  if (busy) raf = requestAnimationFrame(frame);
}

function setHover(link) {
  const item = (link && byLink.get(link)) || null;
  if (item === hovered) return;
  hovered = item;
  wake();
}

function disarm() {
  armed?.classList.remove('armed');
  armed = tapped = null;
  wake();
}

export function initCollage() {
  build();
  addEventListener('page:shown', build);
  document.fonts?.ready.then(layout);

  let pending = 0;
  const relayout = () => {
    if (!pending) pending = requestAnimationFrame(() => ((pending = 0), layout()));
  };
  addEventListener('resize', relayout);
  new ResizeObserver(relayout).observe(document.body);

  addEventListener('scroll', wake, { passive: true });
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'mouse') setHover(e.target.closest?.('a[data-img]'));
  });
  document.addEventListener('focusin', (e) => setHover(e.target.closest?.('a[data-img]')));
  document.addEventListener('focusout', () => setHover(null));

  if (!mouse) {
    addEventListener('torch:lit', wake);
    document.addEventListener('click', (e) => {
      const link = e.target.closest?.('#content a[data-img]');
      if (link && link === armed) return disarm(); // the second tap: let the link open
      disarm();
      if (!link || !byLink.has(link)) return;
      e.preventDefault(); // the first tap only lights the picture
      armed = link;
      armed.classList.add('armed');
      tapped = byLink.get(link);
      wake();
    });
    return;
  }
  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.in = true;
      wake();
    },
    { passive: true },
  );
  document.addEventListener('mouseout', (e) => {
    if (e.relatedTarget) return;
    pointer.in = false;
    setHover(null);
    wake();
  });
}
