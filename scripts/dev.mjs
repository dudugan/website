// Local dev server: builds, serves dist/ with the same clean URLs as production,
// rebuilds when anything changes, and reloads the browser.
//   npm run dev            -> http://localhost:4321
//   PORT=5000 npm run dev

import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const port = Number(process.env.PORT) || 4321;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.pdf': 'application/pdf',
};

// Marks the reload as the dev server's, so the loader (which replays on real reloads) stays away.
const reloadScript = `<script>new EventSource('/__reload').onmessage = () => { sessionStorage.setItem('dev-reload', '1'); location.reload(); };</script>`;
const clients = new Set();

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

// Mirrors GitHub Pages / Vercel cleanUrls: /now -> now.html, /writings -> writings/index.html.
async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const candidates = clean.endsWith('/') ? [join(clean, 'index.html')] : [clean, `${clean}.html`, join(clean, 'index.html')];
  for (const c of candidates) {
    const path = join(dist, c);
    if (path.startsWith(dist) && (await isFile(path))) return path;
  }
  return null;
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname === '/__reload') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  try {
    const file = await resolve(pathname);
    const status = file ? 200 : 404;
    const path = file ?? join(dist, '404.html');
    let body = await readFile(path);
    const type = types[extname(path)] ?? 'application/octet-stream';
    if (type.startsWith('text/html')) body = body.toString().replace('</body>', `${reloadScript}</body>`);
    res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    // Caught mid-rebuild, while dist/ is being rewritten.
    res.writeHead(503, { 'content-type': 'text/plain', 'retry-after': '1' });
    res.end('rebuilding, refresh in a moment');
  }
});

async function rebuild() {
  try {
    // A fresh import each time, so edits to the build script itself apply without a restart.
    const { build } = await import(`./build.mjs?t=${Date.now()}`);
    await build({ base: '' });
    for (const res of clients) res.write('data: reload\n\n');
  } catch (err) {
    console.error(`build failed: ${err.message}`);
  }
}

await rebuild();
server.listen(port, () => console.log(`dev server → http://localhost:${port}`));

let timer;
for (const dir of ['content', 'src', 'public', 'site.config.json']) {
  watch(join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 80);
  });
}
