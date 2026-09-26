// Habit tracker: one row per habit, one small square per day, today at the right edge.
// Done days are little marble tiles in the habit's colour; a streak (misses no longer than the
// habit's max-gap) joins its squares into one rounded bar, with the missed days dimmed. The same
// renderer runs at build time (so the page works without JS) and in the browser (so the
// last column is always the visitor's today).
//
// Editing: open any page with ?edit and paste a fine-grained GitHub token that can write
// this repo's contents. The squares become clickable, and clicks are committed to
// content/habits.json through the GitHub API, which redeploys the site.

// Stones that sit back in the black: the base colour, lighter and darker clouding, and the
// pale veins and flecks that run through it.
export const PALETTES = {
  teal: { stone: '#3a746b', cloud: '#4e8d8c', shadow: '#244c4a', vein: '#acc3c0' },
  purple: { stone: '#593e70', cloud: '#745389', shadow: '#3c264a', vein: '#b8adc2' },
  ember: { stone: '#7d442f', cloud: '#9a6140', shadow: '#532f1d', vein: '#c8b0a7' },
  green: { stone: '#3f6f46', cloud: '#548761', shadow: '#27492e', vein: '#aec1b0' },
  gold: { stone: '#7b6533', cloud: '#978545', shadow: '#51451f', vein: '#c6bea9' },
  blue: { stone: '#395175', cloud: '#4b608f', shadow: '#23314e', vein: '#abb5c4' },
};

const S = 16; // square
const GAP = 4;
const STEP = S + GAP;
const R = 4; // corner radius
const SLAB_W = 12 * STEP; // one tile of marble; every square of a colour is cut from it
const SLAB_H = 6 * STEP;
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
    if (s && d - s.end - 1 <= maxGap) {
      const run = s.runs.at(-1);
      if (d === run[1] + 1) run[1] = d;
      else s.runs.push([d, d]);
      s.end = d;
    } else out.push({ start: d, end: d, runs: [[d, d]] });
  }
  for (const s of out) s.to = s.end;
  const last = out.at(-1);
  if (last && today - last.end - 1 <= maxGap) last.to = today; // still alive: today can carry it on
  return out;
}

// A rectangle whose left and right corners can be rounded separately.
function bar(x, y, w, h, rl, rr) {
  const right = rr ? `A${rr},${rr} 0 0 1 ${x + w},${y + rr}V${y + h - rr}A${rr},${rr} 0 0 1 ${x + w - rr},${y + h}` : `V${y + h}`;
  const left = rl ? `A${rl},${rl} 0 0 1 ${x},${y + h - rl}V${y + rl}A${rl},${rl} 0 0 1 ${x + rl},${y}` : `V${y}`;
  return `M${x + rl},${y}H${x + w - rr}${right}H${x + rl}${left}Z`;
}

export function renderTracker({ habits }, today) {
  const days = habits.map((h) => h.done.map(dayOf).filter((d) => d <= today));
  const first = Math.min(today, ...days.flat());
  const start = Math.min(first - 7, today - 83); // at least 12 weeks to scroll through
  const n = today - start + 1;
  const w = n * STEP - GAP;
  const h = Math.max(1, habits.length) * STEP - GAP;
  const x = (d) => (d - start) * STEP;

  const used = new Set();
  const body = [`<rect width="${w}" height="${h}" fill="url(#habit-off)"/>`];
  habits.forEach((habit, r) => {
    const y = r * STEP;
    const stone = `url(#habit-${habit.color})`;
    used.add(habit.color);
    for (const s of streaksOf(days[r], habit.maxGap, today)) {
      const span = (a, b, rl, rr) => bar(x(a), y, x(b) + S - x(a), S, rl, rr);
      if (s.to !== s.start) {
        // Blank out the empty squares underneath, then lay the whole streak in dimmed stone.
        body.push(`<path d="${span(s.start, s.to, R, R)}" fill="#000"/>`);
        body.push(`<path d="${span(s.start, s.to, R, R)}" fill="${stone}" fill-opacity="0.4"/>`);
      }
      for (const [a, b] of s.runs) body.push(`<path d="${span(a, b, a === s.start ? R : 0, b === s.to ? R : 0)}" fill="${stone}"/>`);
    }
  });

  const off = `<pattern id="habit-off" width="${STEP}" height="${STEP}" patternUnits="userSpaceOnUse"><rect width="${S}" height="${S}" rx="${R}" fill="#171717"/></pattern>`;
  return (
    `<svg class="habits-grid" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-start="${start}" data-days="${n}" aria-hidden="true">` +
    `<defs>${off}${[...used].map(marble).join('')}</defs>${body.join('')}</svg>`
  );
}

// Marble, drawn once per colour into a tile, from four noise fields: busy lighter and darker
// clouding; fine pale veins traced along contour lines of a second field; and a grain of pale
// flecks and dark pits. The tile is a whole number of squares across and down, so its edges
// fall in the gaps between squares. Nothing moves: the browser paints the tile once.
function marble(name) {
  const { stone, cloud, shadow, vein } = PALETTES[name];
  let seed = 7;
  for (const ch of name) seed = (seed * 31 + ch.charCodeAt(0)) % 997;
  const paint = (hex, alpha) => {
    const [r, g, b] = [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3));
    return `0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} ${alpha}`;
  };
  // A transfer table that is 1 only at one level of a field (0–1), and 0 everywhere else.
  const contour = (level, steps = 41) => Array.from({ length: steps }, (_, i) => +(Math.round(level * (steps - 1)) === i)).join(' ');
  return (
    `<filter id="habit-${name}-stone" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.035 0.06" numOctaves="5" seed="${seed}" stitchTiles="stitch" result="clouds"/>` +
    `<feColorMatrix in="clouds" values="${paint(cloud, '3.2 0 0 0 -1.3')}" result="light"/>` +
    `<feColorMatrix in="clouds" values="${paint(shadow, '0 3.2 0 0 -1.3')}" result="dark"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.022 0.04" numOctaves="5" seed="${seed + 3}" stitchTiles="stitch" result="field"/>` +
    `<feComponentTransfer in="field" result="contours">` +
    `<feFuncR type="table" tableValues="${contour(0.5)}"/><feFuncG type="table" tableValues="${contour(0.44)}"/>` +
    `<feFuncB type="table" tableValues="${contour(0.56)}"/><feFuncA type="table" tableValues="${contour(0.5)}"/></feComponentTransfer>` +
    `<feColorMatrix in="contours" values="${paint(vein, '0.85 0.55 0.4 0.3 0')}" result="veins"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed + 5}" stitchTiles="stitch" result="grain"/>` +
    `<feColorMatrix in="grain" values="${paint(vein, '1.4 0 0 0 -0.72')}" result="flecks"/>` +
    `<feColorMatrix in="grain" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.4 0 0 -0.72" result="pits"/>` +
    `<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="light"/><feMergeNode in="dark"/>` +
    `<feMergeNode in="veins"/><feMergeNode in="flecks"/><feMergeNode in="pits"/></feMerge>` +
    `</filter>` +
    `<pattern id="habit-${name}" width="${SLAB_W}" height="${SLAB_H}" patternUnits="userSpaceOnUse">` +
    `<rect width="${SLAB_W}" height="${SLAB_H}" fill="${stone}" filter="url(#habit-${name}-stone)"/></pattern>`
  );
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
  scroller.innerHTML = renderTracker(store.data, localToday());
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
