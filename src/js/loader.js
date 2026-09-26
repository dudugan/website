// The procession stays up until the page has loaded (and at least MIN_MS have passed so
// the wave can travel down the line), then fades into the site. First page of a visit, and
// reloads: the inline script in <head> decides that before first paint by adding .loading.

const MIN_MS = 4300;
const MAX_MS = 8000;

export function runLoader() {
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  if (!loader || !root.classList.contains('loading')) return;
  nameBeings(loader);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    try {
      sessionStorage.setItem('seen-loader', '1');
    } catch {}
    loader.classList.add('done');
    const cleanup = () => {
      root.classList.remove('loading');
      loader.replaceChildren();
    };
    loader.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 1200);
  };

  const loaded =
    document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true }));
  loaded.then(() => setTimeout(finish, Math.max(0, MIN_MS - performance.now())));
  setTimeout(finish, MAX_MS);
}

// Each being's hover area covers its drawing (sized from its outline, in its own coordinates).
// Hovering one with a mouse puts its name in the single line under the procession; on touch
// screens a tap does, and the name stays until another being or empty space is tapped.
function nameBeings(loader) {
  const figs = loader.querySelectorAll('.procession .fig');
  const line = loader.querySelector('.species');
  const show = (name) => {
    line.textContent = name;
    line.classList.add('shown');
  };
  const hide = () => line.classList.remove('shown');
  loader.addEventListener('click', (e) => {
    const hit = e.target.closest('.hit');
    if (hit) show(hit.dataset.name);
    else hide();
  });
  loader.querySelectorAll('.procession .hit').forEach((hit, i) => {
    const box = figs[i]?.getBBox();
    if (!box) return;
    const pad = 8;
    hit.setAttribute('x', box.x - pad);
    hit.setAttribute('y', box.y - pad);
    hit.setAttribute('width', box.width + pad * 2);
    hit.setAttribute('height', box.height + pad * 2);
    // A touch "enters" on touch-down and "leaves" on lift, so only a mouse hovers.
    hit.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && show(hit.dataset.name));
    hit.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && hide());
  });
}
