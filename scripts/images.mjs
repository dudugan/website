// Fetches one small image for every external link in content/influences.md: the cover,
// poster, or portrait the collage behind that page shows (src/js/collage.js).
// Run by hand with `npm run images` (macOS only: it resizes with sips). Results are committed.
//
// Each image is saved as public/img/links/<imageSlug(url)>.jpg. Existing files are kept, so
// to replace an image, drop your own jpg in under the same name. `--force` refetches all.

import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const IMAGE_DIR = join(root, 'public/img/links');
const PAGES = ['influences'];

// Links whose own page has no good picture: take it from another page (or image URL) instead.
const OVERRIDES = {
  'https://en.wikipedia.org/wiki/Ender%27s_Game_(novel_series)': 'https://en.wikipedia.org/wiki/Ender%27s_Game',
  'https://iamsrao.com/': 'https://iamsrao.com/about/profilepic.jpg', // rendered by JS, so not in the HTML
  // IMDb turns away scripts; this is the page's own og:image, read in a browser.
  'https://www.imdb.com/name/nm7066292/':
    'https://m.media-amazon.com/images/M/MV5BNjQ5ZWVkMzUtNjU1ZC00MWRlLWEyN2UtMDkyODdlMjU1MmEyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
  'https://campuspress.yale.edu/langbrainlab/':
    'https://campuspress.yale.edu/langbrainlab/files/2022/05/cropped-LB-LOGO-e1653615086509.png',
};
const UA = 'personal-site-image-fetch/1.0 (one-off build script; github.com/dudugan/website)';

export function imageSlug(href) {
  const url = new URL(href);
  const host = url.hostname.replace(/^www\./, '');
  let key = host + url.pathname;
  if (host.endsWith('wikipedia.org')) key = decodeURIComponent(url.pathname.replace(/^\/wiki\//, ''));
  else if (host === 'youtube.com') key = `youtube-${url.searchParams.get('v')}`;
  return key
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wikimedia rate-limits bursts, so back off and retry on 429.
async function get(url, accept = '*/*') {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (res.status !== 429 || attempt === 5) return res;
    await sleep((Number(res.headers.get('retry-after')) || 2 ** attempt) * 1000 + Math.random() * 500);
  }
}

const decodeEntities = (s) =>
  s.replace(/&amp;/g, '&').replace(/&#x2F;/gi, '/').replace(/&#47;/g, '/').replace(/&quot;/g, '"');

function metaImage(html, pageUrl) {
  const wanted = ['og:image', 'og:image:url', 'og:image:secure_url', 'twitter:image', 'twitter:image:src'];
  for (const name of wanted) {
    for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
      const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(([, k, v]) => [k.toLowerCase(), v]));
      if ((attrs.property ?? attrs.name)?.toLowerCase() === name && attrs.content) {
        return new URL(decodeEntities(attrs.content), pageUrl).href;
      }
    }
  }
  return null;
}

// Photo-like <img>s in a stretch of HTML, largest srcset candidate of each, with alt text.
function photos(html, pageUrl) {
  const found = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const src = tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
    const srcset = tag.match(/\ssrcset\s*=\s*["']([^"']+)["']/i)?.[1];
    const best = srcset?.split(',').map((s) => s.trim().split(/\s+/)[0]).pop() ?? src;
    const width = Number(tag.match(/\swidth\s*=\s*["']?(\d+)/i)?.[1] ?? 999);
    if (!best || best.startsWith('data:') || width < 80) continue;
    if (/logo|icon|favicon|sprite|badge|\.svg(\.png)?(\?|$)/i.test(best)) continue;
    const alt = tag.match(/\salt\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
    found.push({ url: new URL(decodeEntities(best), pageUrl).href, alt: alt.toLowerCase() });
  }
  return found;
}
const firstImg = (html, pageUrl) => photos(html, pageUrl)[0]?.url ?? null;

// Substack's preview card is a generic white banner; the publication's own icon reads better.
function touchIcon(html, pageUrl) {
  const icons = [...html.matchAll(/<link\b[^>]*rel=["']apple-touch-icon["'][^>]*>/gi)].map(([tag]) => ({
    href: tag.match(/href=["']([^"']+)["']/i)?.[1],
    size: Number(tag.match(/sizes=["'](\d+)/i)?.[1] ?? 0),
  }));
  const best = icons.filter((i) => i.href).sort((a, b) => b.size - a.size)[0];
  return best ? new URL(decodeEntities(best.href), pageUrl).href : null;
}

async function sourceFor(href, name) {
  if (OVERRIDES[href]) {
    href = OVERRIDES[href];
    if (/\.(jpe?g|png|webp)(\?|$)/i.test(href)) return href;
  }
  const url = new URL(href);
  const host = url.hostname.replace(/^www\./, '');
  if (host.endsWith('wikipedia.org')) {
    const title = url.pathname.replace(/^\/wiki\//, '');
    const res = await get(`https://${url.hostname}/api/rest_v1/page/summary/${title}`, 'application/json');
    if (!res.ok) throw new Error(`summary ${res.status}`);
    const { thumbnail, originalimage } = await res.json();
    // 500px is one of Wikimedia's standard thumbnail widths.
    if (thumbnail && originalimage?.width > 500 && thumbnail.source.includes('/thumb/')) {
      return thumbnail.source.replace(/\/\d+px-/, '/500px-');
    }
    if (originalimage || thumbnail) return originalimage?.source ?? thumbnail.source;
    // The summary skips some lead images, so try the infobox, then the article's first picture.
    const page = await (await get(href, 'text/html')).text();
    const box = page.match(/<table[^>]*class="[^"]*infobox[\s\S]*?<\/table>/i)?.[0];
    const body = page.match(/<div[^>]*id="mw-content-text"[\s\S]*/i)?.[0] ?? '';
    return (box && firstImg(box, href)) || firstImg(body, href);
  }
  if (host === 'youtube.com') return `https://img.youtube.com/vi/${url.searchParams.get('v')}/hqdefault.jpg`;
  const res = await get(href, 'text/html');
  if (!res.ok) throw new Error(`page ${res.status}`);
  const html = await res.text();
  if (html.includes('substackcdn.com')) return touchIcon(html, res.url) ?? metaImage(html, res.url);
  // A picture captioned with the person's name beats the site's generic preview image.
  const portrait = name && photos(html, res.url).find((p) => p.alt.includes(name.toLowerCase()));
  return portrait?.url ?? metaImage(html, res.url) ?? firstImg(html, res.url);
}

const sips = promisify(execFile);

async function save(src, out, tmp) {
  const res = await get(src, 'image/*');
  if (!res.ok) throw new Error(`image ${res.status}`);
  const type = res.headers.get('content-type') ?? '';
  if (!type.startsWith('image/') || type.includes('svg')) throw new Error(`not a raster image (${type})`);
  const raw = join(tmp, 'raw');
  await writeFile(raw, Buffer.from(await res.arrayBuffer()));
  await sips('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '72', '-Z', '320', raw, '--out', out]);
}

async function main() {
  const force = process.argv.includes('--force');
  await mkdir(IMAGE_DIR, { recursive: true });
  const have = new Set(await readdir(IMAGE_DIR));
  const names = new Map(); // href -> link text
  for (const page of PAGES) {
    const md = await readFile(join(root, 'content', `${page}.md`), 'utf8');
    for (const [, text, href] of md.matchAll(/\[([^\]]+)\]\((https?:\/\/(?:[^\s()]|\([^\s()]*\))+)\)/g)) {
      if (!names.has(href)) names.set(href, text.replace(/'s$/, ''));
    }
  }
  const hrefs = [...names.keys()];

  const tmp = await mkdtemp(join(tmpdir(), 'link-images-'));
  const missing = [];
  let fetched = 0;
  const queue = [...hrefs];
  async function worker() {
    for (let href; (href = queue.shift()); ) {
      const slug = imageSlug(href);
      if (!force && have.has(`${slug}.jpg`)) continue;
      const scratch = await mkdtemp(join(tmp, 'x'));
      try {
        const src = await sourceFor(href, names.get(href));
        if (!src) throw new Error('no image on the page');
        await save(src, join(IMAGE_DIR, `${slug}.jpg`), scratch);
        fetched++;
        console.log(`  ok   ${slug}`);
      } catch (err) {
        missing.push(`${slug}.jpg  ←  ${href}  (${err.message})`);
      }
    }
  }
  await Promise.all(Array.from({ length: 2 }, worker));
  await rm(tmp, { recursive: true, force: true });

  console.log(`\n${fetched} fetched, ${hrefs.length - fetched - missing.length} already present, ${missing.length} without an image`);
  if (missing.length) console.log(`\nNo image for:\n  ${missing.join('\n  ')}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
