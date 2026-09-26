// Swaps pages in place instead of reloading, so the music, torch, and anything else
// outside #page keep running. Every URL is still a real, pre-rendered page: without JS,
// or if anything here fails, links just load normally.

const base = document.documentElement.dataset.base || '';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const cache = new Map();
let navigation = 0;
let shownPath = location.pathname;

function fetchPage(url) {
  const key = url.pathname;
  if (!cache.has(key)) {
    const request = fetch(url.pathname, { credentials: 'same-origin' }).then((res) => {
      if (!res.ok) throw new Error(`${res.status}`);
      return res.text();
    });
    request.catch(() => cache.delete(key));
    cache.set(key, request);
  }
  return cache.get(key);
}

// Only same-site page links; files like resume.pdf and new-tab links are left alone.
function pageUrl(anchor) {
  if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return null;
  if (base && url.pathname !== base && !url.pathname.startsWith(`${base}/`)) return null;
  if (/\.(?!html$)[a-z0-9]+$/i.test(url.pathname)) return null;
  return url;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function go(url, { push }) {
  const id = ++navigation;
  const page = document.getElementById('page');
  let html;
  try {
    [html] = await Promise.all([fetchPage(url), reduceMotion.matches ? null : (page.classList.add('leaving'), wait(180))]);
  } catch {
    location.assign(url.href);
    return;
  }
  if (id !== navigation) return;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const next = doc.getElementById('page');
  if (!next) {
    location.assign(url.href);
    return;
  }

  if (push) {
    history.replaceState({ ...history.state, y: scrollY }, '');
    history.pushState({ y: 0 }, '', url.href);
  }
  shownPath = url.pathname;
  document.title = doc.title;
  document.documentElement.dataset.page = doc.documentElement.dataset.page;

  const incoming = document.adoptNode(next);
  if (!reduceMotion.matches) incoming.classList.add('entering');
  page.replaceWith(incoming);
  window.scrollTo(0, push ? 0 : history.state?.y ?? 0);
  document.getElementById('content')?.focus({ preventScroll: true });
  dispatchEvent(new Event('page:shown'));
  if (!reduceMotion.matches) requestAnimationFrame(() => requestAnimationFrame(() => incoming.classList.remove('entering')));
}

export function initRouter() {
  if (!('pushState' in history) || !window.DOMParser) return;
  history.scrollRestoration = 'manual';
  history.replaceState({ y: scrollY, ...history.state }, '');

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = pageUrl(e.target.closest('a[href]'));
    if (!url) return;
    if (url.pathname === location.pathname) {
      if (url.hash) return; // in-page anchor: let the browser scroll
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      return;
    }
    e.preventDefault();
    go(url, { push: true });
  });

  addEventListener('popstate', () => {
    if (location.pathname !== shownPath) go(new URL(location.href), { push: false });
  });

  // Warm the cache on hover so the swap feels instant.
  const prefetch = (e) => {
    const url = pageUrl(e.target.closest?.('a[href]'));
    if (url && url.pathname !== location.pathname) fetchPage(url).catch(() => {});
  };
  document.addEventListener('pointerover', prefetch, { passive: true });
  document.addEventListener('focusin', prefetch);
}
