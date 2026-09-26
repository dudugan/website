// Habit tracker: one row per habit, one small square per day, today at the right edge.
// Done days fill with the habit's colour; a streak (misses no longer than the habit's
// max-gap) is strung together by a thin line through the middle of its squares. The same
// renderer runs at build time (so the page works without JS) and in the browser (so the
// last column is always the visitor's today).
//
// Editing: open any page with ?edit and paste a fine-grained GitHub token that can write
// this repo's contents. The squares become clickable, and clicks are committed to
// content/habits.json through the GitHub API, which redeploys the site.

// Dark, faded colours that sit back in the black: six shades each for the flowing base,
// plus a light and a deep tone for the sheen that drifts across it.
export const PALETTES = {
  teal: { shades: ['#325d57', '#254b43', '#42706f', '#2b5449', '#1f4240', '#3c6162'], light: '#5d9890', deep: '#0e1b19' },
  purple: { shades: ['#49355a', '#362749', '#5e466d', '#3c2e52', '#342140', '#553f5f'], light: '#7c6293', deep: '#150f1a' },
  ember: { shades: ['#653929', '#52281e', '#7b5037', '#5c2b24', '#482919', '#6c4b33'], light: '#a6664e', deep: '#1d100c' },
  green: { shades: ['#36593b', '#28482a', '#476b50', '#2f502f', '#223f28', '#415d49'], light: '#64906a', deep: '#101911' },
  gold: { shades: ['#63522c', '#503e21', '#786b3b', '#594326', '#463c1b', '#686236'], light: '#a28a53', deep: '#1c180d' },
  blue: { shades: ['#31435e', '#24374c', '#404f72', '#2a4155', '#1e2a43', '#3a4464'], light: '#5b749a', deep: '#0e131b' },
};

const S = 16; // square
const GAP = 4;
const STEP = S + GAP;
const R = 4; // corner radius
const PERIOD = 160; // width of one sweep through a colour's shades
const SHEEN = 64; // width of one band of the sheen
const DAY = 86400000;

export const dayOf = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
};
export const isoOf = (day) => new Date(day * DAY).toISOString().slice(0, 10);
export const localToday = () => {
  const t = new Date();
  return Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / DAY;
};

export function parseHabits(text) {
  const raw = JSON.parse(text);
  if (!Array.isArray(raw?.habits)) throw new Error('habits.json needs a "habits" list');
  return {
    habits: raw.habits.map((h, i) => {
      const where = `habits.json, habit ${i + 1}${h?.name ? ` (${h.name})` : ''}`;
      if (typeof h.name !== 'string' || !h.name) throw new Error(`${where}: needs a "name"`);
      if (!PALETTES[h.color]) throw new Error(`${where}: "color" must be one of ${Object.keys(PALETTES).join(', ')}`);
      const maxGap = h['max-gap'] ?? 1;
      if (!Number.isInteger(maxGap) || maxGap < 0) throw new Error(`${where}: "max-gap" must be a whole number`);
      const done = [...new Set(h.done ?? [])].sort();
      for (const d of done) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isoOf(dayOf(d)) !== d) throw new Error(`${where}: "${d}" isn't a YYYY-MM-DD date`);
      }
      return { name: h.name, color: h.color, maxGap, done };
    }),
  };
}

// Written back by hand-editable rules: one habit per block, one month of dates per line.
export function formatHabits({ habits }) {
  const blocks = habits.map((h) => {
    const months = new Map();
    for (const iso of [...h.done].sort()) months.set(iso.slice(0, 7), [...(months.get(iso.slice(0, 7)) ?? []), iso]);
    const lines = [...months.values()].map((ds) => `        ${ds.map((d) => JSON.stringify(d)).join(', ')}`);
    const done = lines.length ? `[\n${lines.join(',\n')}\n      ]` : '[]';
    return [
      '    {',
      `      "name": ${JSON.stringify(h.name)},`,
      `      "color": ${JSON.stringify(h.color)},`,
      `      "max-gap": ${h.maxGap},`,
      `      "done": ${done}`,
      '    }',
    ].join('\n');
  });
  return `{\n  "habits": [\n${blocks.join(',\n')}\n  ]\n}\n`;
}

function streaksOf(days, maxGap, today) {
  const out = [];
  for (const d of days) {
    const s = out.at(-1);
    if (s && d - s.end - 1 <= maxGap) s.end = d;
    else out.push({ start: d, end: d });
  }
  for (const s of out) s.to = s.end;
  const last = out.at(-1);
  if (last && today - last.end - 1 <= maxGap) last.to = today; // still alive: today can carry it on
  return out;
}

export function renderTracker({ habits }, today, { animate = true } = {}) {
  const days = habits.map((h) => h.done.map(dayOf).filter((d) => d <= today));
  const first = Math.min(today, ...days.flat());
  const start = Math.min(first - 7, today - 83); // at least 12 weeks to scroll through
  const n = today - start + 1;
  const w = n * STEP - GAP;
  const h = Math.max(1, habits.length) * STEP - GAP;
  const x = (d) => (d - start) * STEP;

  const used = new Set();
  const lines = [];
  const squares = [];
  habits.forEach((habit, r) => {
    const y = r * STEP;
    const { shades } = PALETTES[habit.color];
    used.add(habit.color);
    for (const s of streaksOf(days[r], habit.maxGap, today)) {
      if (s.to === s.start) continue;
      const mid = y + S / 2;
      lines.push(`<line x1="${x(s.start) + S / 2}" y1="${mid}" x2="${x(s.to) + S / 2}" y2="${mid}" stroke="${shades[2]}" stroke-width="2" stroke-linecap="round"/>`);
    }
    for (const d of days[r]) {
      const square = `<rect x="${x(d)}" y="${y}" width="${S}" height="${S}" rx="${R}"`;
      squares.push(`${square} fill="url(#habit-${habit.color})"/>${square} fill="url(#habit-${habit.color}-sheen)"/>`);
    }
  });
  // The streak lines run under the squares, so they show in the gaps and across missed days.
  const body = [`<rect width="${w}" height="${h}" fill="url(#habit-off)"/>`, ...lines, ...squares];

  const off = `<pattern id="habit-off" width="${STEP}" height="${STEP}" patternUnits="userSpaceOnUse"><rect width="${S}" height="${S}" rx="${R}" fill="#171717"/></pattern>`;
  return (
    `<svg class="habits-grid" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-start="${start}" data-days="${n}" aria-hidden="true">` +
    `<defs>${off}${[...used].map((name) => gradients(name, animate)).join('')}</defs>${body.join('')}</svg>`
  );
}

// Stable randomness per colour, so each row keeps its own currents from build to build.
function seeded(str) {
  let seed = 2166136261;
  for (const ch of str) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Wanders through a few random offsets on an uneven clock and comes back. Each loop is under
// 7 s, like every animation on the site, but the base and the sheen run on different loop
// lengths, so together they rarely repeat and the colour moves like liquid.
function drift(rand, spanX, spanY) {
  const legs = 4 + Math.floor(rand() * 3);
  const lengths = Array.from({ length: legs }, () => 0.5 + rand());
  const total = lengths.reduce((a, b) => a + b);
  const values = ['0 0'];
  const times = ['0'];
  let t = 0;
  for (let i = 1; i < legs; i++) {
    t += lengths[i - 1] / total;
    values.push(`${((rand() * 2 - 1) * spanX).toFixed(1)} ${((rand() * 2 - 1) * spanY).toFixed(1)}`);
    times.push(t.toFixed(3));
  }
  values.push('0 0');
  times.push('1');
  const dur = (4.6 + rand() * 2.3).toFixed(2);
  const ease = Array(legs).fill('0.4 0.1 0.6 0.9').join(';');
  return `<animateTransform attributeName="gradientTransform" type="translate" values="${values.join(';')}" keyTimes="${times.join(';')}" calcMode="spline" keySplines="${ease}" dur="${dur}s" repeatCount="indefinite"/>`;
}

function gradients(name, animate) {
  const { shades, light, deep } = PALETTES[name];
  const rand = seeded(name);
  const toward = (deg, len) => {
    const a = (deg * Math.PI) / 180;
    return `x2="${(Math.cos(a) * len).toFixed(1)}" y2="${(Math.sin(a) * len).toFixed(1)}"`;
  };
  const stops = (list) =>
    list.map(([c, o], i) => `<stop offset="${(i / (list.length - 1)).toFixed(3)}" stop-color="${c}"${o < 1 ? ` stop-opacity="${o}"` : ''}/>`).join('');
  const base =
    `<linearGradient id="habit-${name}" gradientUnits="userSpaceOnUse" ${toward(8 + rand() * 20, PERIOD)} spreadMethod="reflect">` +
    stops(shades.map((c) => [c, 1])) +
    `${animate ? drift(rand, PERIOD * 0.9, 18) : ''}</linearGradient>`;
  const sheen =
    `<linearGradient id="habit-${name}-sheen" gradientUnits="userSpaceOnUse" ${toward(-40 - rand() * 30, SHEEN)} spreadMethod="reflect">` +
    stops([[light, 0.4], [light, 0], [deep, 0.45], [deep, 0], [light, 0.25]]) +
    `${animate ? drift(rand, SHEEN * 1.2, SHEEN * 0.6) : ''}</linearGradient>`;
  return base + sheen;
}

const escapeAttr = (s) => String(s).replace(/[&"<>]/g, (c) => `&#${c.charCodeAt(0)};`);

export function trackerFigure(data, today, { repo, branch, file }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<figure class="habits" data-repo="${escapeAttr(repo)}" data-branch="${escapeAttr(branch)}" data-file="${escapeAttr(file)}">
<div class="habits-scroll" tabindex="0" aria-label="habit tracker">${renderTracker(data, today)}</div>
<figcaption class="habits-info"><span></span><span></span></figcaption>
<script type="application/json" class="habits-data">${json}</script>
</figure>`;
}

// ---------- in the browser ----------

const TOKEN_KEY = 'habits-token';
const store = { data: null, remote: null, token: null, ops: new Map(), timer: 0, saving: false, again: false, fresh: false, status: '' };
let fig = null;
let still = false;

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
const writeToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

export function initHabits() {
  still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  store.token = readToken();
  mount();
  addEventListener('page:shown', mount);
  addEventListener('beforeunload', (e) => {
    if (!store.ops.size) return; // otherwise there are unsaved clicks: ask before leaving
    e.preventDefault();
    e.returnValue = '';
  });
}

function mount() {
  fig = document.querySelector('#content .habits');
  if (!fig) return;
  const { repo, branch, file } = fig.dataset;
  store.remote = { repo, branch, file };
  store.data ??= JSON.parse(fig.querySelector('.habits-data').textContent);
  draw(true);

  const scroller = fig.querySelector('.habits-scroll');
  let drag = null;
  scroller.addEventListener('pointerdown', (e) => {
    showCell(e);
    if (e.pointerType === 'mouse' && e.button === 0) drag = { x: e.clientX, left: scroller.scrollLeft, moved: false };
  });
  scroller.addEventListener('pointermove', (e) => {
    if (drag && e.buttons === 1) {
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      if (drag.moved) scroller.scrollLeft = drag.left - dx;
    }
    showCell(e);
  });
  scroller.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && showCell(null));
  scroller.addEventListener('click', (e) => {
    const dragged = drag?.moved;
    drag = null;
    if (!dragged) toggle(e);
  });

  if (store.token) {
    editing();
    if (!store.fresh) refresh();
  } else if (new URLSearchParams(location.search).has('edit')) {
    loginForm();
  }
}

function draw(toEnd) {
  const scroller = fig.querySelector('.habits-scroll');
  const fromRight = scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft;
  scroller.innerHTML = renderTracker(store.data, localToday(), { animate: !still });
  scroller.scrollLeft = toEnd ? scroller.scrollWidth : scroller.scrollWidth - scroller.clientWidth - fromRight;
}

function cellAt(e) {
  const svg = fig?.querySelector('.habits-grid');
  if (!e || !svg) return null;
  const box = svg.getBoundingClientRect();
  const col = Math.floor((e.clientX - box.left) / STEP);
  const row = Math.floor((e.clientY - box.top) / STEP);
  if (col < 0 || col >= +svg.dataset.days || row < 0 || row >= store.data.habits.length) return null;
  return { row, col, day: +svg.dataset.start + col };
}

function showCell(e) {
  const cell = cellAt(e);
  const [name, date] = fig.querySelectorAll('.habits-info span');
  name.textContent = cell ? store.data.habits[cell.row].name : '';
  date.textContent = cell
    ? new Date(cell.day * DAY).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
    : '';
  const svg = fig.querySelector('.habits-grid');
  let ring = svg.querySelector('.habits-cursor');
  if (!ring) {
    ring = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ring.setAttribute('class', 'habits-cursor');
    for (const [k, v] of [['width', S - 1], ['height', S - 1], ['rx', R]]) ring.setAttribute(k, v);
    svg.append(ring);
  }
  ring.style.display = cell ? '' : 'none';
  if (cell) {
    ring.setAttribute('x', cell.col * STEP + 0.5);
    ring.setAttribute('y', cell.row * STEP + 0.5);
  }
}

// ---------- editing ----------

function toggle(e) {
  if (!store.token || !fig.classList.contains('editing')) return;
  const cell = cellAt(e);
  if (!cell) return;
  const habit = store.data.habits[cell.row];
  const iso = isoOf(cell.day);
  const done = !habit.done.includes(iso);
  habit.done = done ? [...habit.done, iso].sort() : habit.done.filter((d) => d !== iso);
  store.ops.set(JSON.stringify([habit.name, iso]), done);
  draw(false);
  showCell(e);
  status('unsaved');
  clearTimeout(store.timer);
  store.timer = setTimeout(save, 1500); // one commit per burst of clicks
}

function applyOps(data, ops) {
  for (const [key, done] of ops) {
    const [name, iso] = JSON.parse(key);
    const habit = data.habits.find((h) => h.name === name);
    if (!habit) continue; // renamed or removed in the file meanwhile
    habit.done = habit.done.filter((d) => d !== iso);
    if (done) habit.done = [...habit.done, iso].sort();
  }
  return data;
}

const toBase64 = (text) => {
  let bin = '';
  for (const byte of new TextEncoder().encode(text)) bin += String.fromCharCode(byte);
  return btoa(bin);
};
const fromBase64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

async function github(method, body) {
  const { repo, branch, file } = store.remote;
  const url = `https://api.github.com/repos/${repo}/contents/${file}${method === 'GET' ? `?ref=${encodeURIComponent(branch)}` : ''}`;
  const res = await fetch(url, {
    method,
    cache: 'no-store',
    headers: {
      authorization: `Bearer ${store.token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(body && { 'content-type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw Object.assign(new Error(`GitHub said ${res.status}`), { status: res.status });
  return res.json();
}

async function pull() {
  const json = await github('GET');
  const text = fromBase64(json.content);
  return { sha: json.sha, text, data: parseHabits(text) };
}

// The site can be a deploy behind the file, so editing starts from what's on GitHub.
async function refresh() {
  try {
    const { data } = await pull();
    store.data = applyOps(data, store.ops);
    store.fresh = true;
    if (fig?.isConnected) draw(false);
  } catch (err) {
    failed(err);
  }
}

async function save() {
  if (store.saving) return void (store.again = true);
  store.saving = true;
  status('saving…');
  try {
    for (let attempt = 0; ; attempt++) {
      const sending = new Map(store.ops);
      const { sha, text, data } = await pull();
      applyOps(data, sending);
      const next = formatHabits(data);
      try {
        if (next !== text) {
          const { branch } = store.remote;
          await github('PUT', { message: `Log habits (${isoOf(localToday())})`, content: toBase64(next), sha, branch });
        }
      } catch (err) {
        if (err.status === 409 && attempt < 2) continue; // the file moved underneath us: merge again
        throw err;
      }
      for (const [key, done] of sending) if (store.ops.get(key) === done) store.ops.delete(key);
      store.data = applyOps(data, store.ops);
      if (fig?.isConnected) draw(false);
      break;
    }
    status(store.ops.size ? 'unsaved' : 'saved · live in a minute or so');
  } catch (err) {
    failed(err);
  } finally {
    store.saving = false;
    if (store.again) {
      store.again = false;
      save();
    }
  }
}

function failed(err) {
  if (err.status === 401 || err.status === 403 || err.status === 404) {
    status(`GitHub turned the token away (${err.status}). Log in again.`);
    writeToken(null);
    store.token = null;
    if (fig?.isConnected) {
      fig.classList.remove('editing');
      fig.querySelector('.habits-edit')?.remove();
      loginForm();
    }
  } else status(`couldn't reach GitHub (${err.message}); your clicks are kept, retrying on the next one`);
}

function status(text) {
  store.status = text;
  const el = fig?.querySelector('.habits-status');
  if (el) el.textContent = text;
}

function editing() {
  fig.classList.add('editing');
  fig.querySelector('.habits-login')?.remove();
  if (fig.querySelector('.habits-edit')) return;
  const line = document.createElement('p');
  line.className = 'habits-edit';
  line.innerHTML = 'editing · <button type="button">log out</button> <span class="habits-status"></span>';
  line.querySelector('.habits-status').textContent = store.status;
  line.querySelector('button').addEventListener('click', () => {
    if (store.ops.size && !confirm('Some clicks are not saved yet. Log out anyway?')) return;
    writeToken(null);
    Object.assign(store, { token: null, ops: new Map(), fresh: false, status: '' });
    fig.classList.remove('editing');
    line.remove();
  });
  fig.append(line);
}

function loginForm() {
  if (fig.querySelector('.habits-login')) return;
  const form = document.createElement('form');
  form.className = 'habits-login';
  form.innerHTML =
    '<input type="password" name="token" placeholder="GitHub token" autocomplete="off" spellcheck="false" aria-label="GitHub token"> <button>log in</button> <span class="habits-status"></span>';
  form.querySelector('.habits-status').textContent = store.status;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = form.token.value.trim();
    if (!token) return;
    store.token = token;
    status('checking…');
    try {
      const { data } = await pull();
      writeToken(token);
      store.data = applyOps(data, store.ops);
      store.fresh = true;
      status('');
      editing();
      draw(false);
    } catch (err) {
      store.token = null;
      status(err.status ? `GitHub turned that token away (${err.status})` : `couldn't reach GitHub (${err.message})`);
    }
  });
  fig.append(form);
}
