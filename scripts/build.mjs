// Builds the site: every content/*.md becomes one page, rendered through the single
// src/layout.html template. Output goes to dist/ (generated, never edited by hand).
//
//   content/index.md       -> dist/index.html        served at /
//   content/now.md         -> dist/now.html          served at /now
//   content/past-lives.md  -> dist/past-lives.html   served at /past-lives
//
// Posts live in content/writings/, named YYYY-MM-DD-slug.md. Each one's first `# heading` is
// its title. /writings lists them newest first:
//
//   content/writings/2026-09-26-hello-world.md -> dist/writings/hello-world.html  at /writings/hello-world
//   (the list)                                 -> dist/writings/index.html        at /writings
//
// A line `<!-- habits -->` in any page becomes the habit tracker, drawn from content/habits.json.
//
// BASE_PATH (e.g. "/website") prefixes every internal URL, for hosting under a sub-path.

import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';
import { IMAGE_DIR, imageSlug } from './images.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const at = (...p) => join(root, ...p);

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const labelFor = (slug) => slug.replace(/-/g, ' ');

async function readPosts(marked) {
  const dir = at('content/writings');
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.md'));
  const posts = [];
  for (const file of files) {
    const match = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
    if (!match) throw new Error(`content/writings/${file}: name posts YYYY-MM-DD-slug.md`);
    const [, y, m, d, slug] = match;
    const md = await readFile(join(dir, file), 'utf8');
    const heading = marked.lexer(md).find((t) => t.type === 'heading' && t.depth === 1);
    posts.push({ slug, md, title: heading ? heading.text : labelFor(slug), iso: `${y}-${m}-${d}`, shown: `${+d}/${+m}/${y}` });
  }
  return posts.sort((a, b) => b.iso.localeCompare(a.iso));
}

// Fail loudly if a second HTML file ever appears in the source: one template renders every page.
async function assertSingleTemplate() {
  const skip = new Set(['node_modules', 'dist', '.git', '.claude']);
  const found = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.html')) found.push(relative(root, path));
    }
  }
  await walk(root);
  const extra = found.filter((f) => f !== join('src', 'layout.html'));
  if (extra.length) throw new Error(`Only src/layout.html may exist as HTML source. Found: ${extra.join(', ')}`);
}

const headingId = (text) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// A heading the page itself links to (#its-id) starts folded away, with everything under it
// up to the next heading of its rank or higher; its link unfolds it (src/js/folds.js).
// Without JS nothing is hidden, and the links just jump.
// A page with a `<!-- collapsible -->` line instead folds every top-level heading's section
// under its heading, which opens and closes it on click; the first starts open.
function renderWithFolds(marked, md) {
  const tokens = marked.lexer(md);
  const collapsible = md.includes('<!-- collapsible -->');
  const targets = new Set([...md.matchAll(/\]\(#([^)\s]+)\)/g)].map((m) => m[1]));
  if (collapsible) for (const t of tokens) if (t.type === 'heading' && t.depth === 1) targets.add(headingId(t.text));
  let opened = false;
  const html = [];
  let run = [];
  let fold = null;
  const render = (list) => marked.parser(Object.assign(list, { links: tokens.links }));
  const flush = () => {
    if (run.length) html.push(render(run));
    run = [];
  };
  const close = () => {
    if (fold) {
      const cls = collapsible ? ` collapsible${opened ? '' : ' open'}` : '';
      opened = true;
      html.push(`<section class="fold${cls}">\n${render(fold.tokens)}</section>\n`);
    }
    fold = null;
  };
  for (const t of tokens) {
    if (fold && t.type === 'heading' && t.depth <= fold.depth) close();
    if (t.type === 'heading' && targets.has(headingId(t.text))) {
      flush();
      fold = { depth: t.depth, tokens: [t] };
    } else (fold ? fold.tokens : run).push(t);
  }
  flush();
  close();
  return html.join('');
}

function markdownRenderer(base, linkImages) {
  const marked = new Marked({ gfm: true });
  const local = (href) => (href.startsWith('/') && !href.startsWith('//') ? base + href : href);
  marked.use({
    renderer: {
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href);
        const image = external && linkImages.has(`${imageSlug(href)}.jpg`) ? `${base}/img/links/${imageSlug(href)}.jpg` : '';
        const attrs = [
          `href="${escapeHtml(local(href))}"`,
          title ? `title="${escapeHtml(title)}"` : '',
          external ? 'target="_blank" rel="noopener"' : '',
          image ? `data-img="${escapeHtml(image)}"` : '',
        ].filter(Boolean);
        return `<a ${attrs.join(' ')}>${text}</a>`;
      },
      heading({ tokens, depth, text }) {
        return `<h${depth} id="${headingId(text)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
      image({ href, title, text }) {
        const t = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${escapeHtml(local(href))}" alt="${escapeHtml(text)}"${t} loading="lazy">`;
      },
    },
  });
  return marked;
}

export async function build({ base = process.env.BASE_PATH ?? '', quiet = false } = {}) {
  base = base.replace(/\/+$/, '');
  const started = performance.now();
  await assertSingleTemplate();

  const config = JSON.parse(await readFile(at('site.config.json'), 'utf8'));
  const layout = await readFile(at('src/layout.html'), 'utf8');
  const { default: procession } = await import(pathToFileURL(at('src/art/procession.mjs')).href + `?t=${Date.now()}`);
  // Fresh imports each build, so the dev server picks up edits to these without a restart.
  const { localToday, parseHabits, trackerFigure } = await import(pathToFileURL(at('src/js/habits.js')).href + `?t=${Date.now()}`);
  // Links whose image `npm run images` has fetched get data-img, which the collage picks up.
  const linkImages = new Set(await readdir(IMAGE_DIR).catch(() => []));
  const marked = markdownRenderer(base, linkImages);

  await rm(at('dist'), { recursive: true, force: true });
  await mkdir(at('dist/assets/js'), { recursive: true });
  await mkdir(at('dist/fonts'), { recursive: true });

  // Static assets. The version hash busts caches whenever CSS or JS changes.
  const hash = createHash('sha1');
  await cp(at('src/css/site.css'), at('dist/assets/site.css'));
  hash.update(await readFile(at('src/css/site.css')));
  const jsFiles = (await readdir(at('src/js'))).filter((f) => f.endsWith('.js'));
  const jsSources = await Promise.all(jsFiles.map((f) => readFile(at('src/js', f), 'utf8')));
  jsSources.forEach((s) => hash.update(s));
  const v = hash.digest('hex').slice(0, 8);
  await Promise.all(
    jsFiles.map((f, i) =>
      // Version sibling imports too, so a deploy never mixes old and new modules.
      writeFile(at('dist/assets/js', f), jsSources[i].replace(/(from\s+['"]\.\/[\w-]+\.js)(['"])/g, `$1?v=${v}$2`)),
    ),
  );
  const fonts = at('node_modules/@fontsource/eb-garamond/files');
  for (const style of ['normal', 'italic']) {
    for (const subset of ['latin', 'latin-ext']) {
      const file = `eb-garamond-${subset}-400-${style}.woff2`;
      await cp(join(fonts, file), at('dist/fonts', file));
    }
  }
  await cp(at('public'), at('dist'), { recursive: true });

  // Shared chrome: nav + external links.
  const navHtml = (slug) =>
    config.nav
      .map((s) => {
        // A post marks its section (writings) as current too.
        const current = s === slug ? ' aria-current="page"' : slug.startsWith(`${s}/`) ? ' aria-current="true"' : '';
        return `<a href="${base}/${s}"${current}>${escapeHtml(labelFor(s))}</a>`;
      })
      .join('');
  const linksHtml = config.links
    .map((l) => `<li><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a></li>`)
    .join('');

  const render = ({ slug, title, content }) =>
    layout.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const values = {
        slug,
        base,
        v,
        title: escapeHtml(title),
        description: escapeHtml(config.description),
        name: escapeHtml(config.name),
        nav: navHtml(slug),
        links: linksHtml,
        content,
        loader: procession,
      };
      if (!(key in values)) throw new Error(`Unknown placeholder {{${key}}} in src/layout.html`);
      return values[key];
    });

  const habitsText = await readFile(at('content/habits.json'), 'utf8').catch(() => null);
  const habits = habitsText && parseHabits(habitsText);
  const remote = { repo: config.repo, branch: 'main', file: 'content/habits.json' };
  const parse = (md, where) => {
    const html = renderWithFolds(marked, md);
    if (!html.includes('<!-- habits -->')) return html;
    if (!habits) throw new Error(`${where} asks for <!-- habits --> but content/habits.json is missing`);
    return html.replace('<!-- habits -->', trackerFigure(habits, localToday(), remote));
  };

  const pages = (await readdir(at('content'))).filter((f) => f.endsWith('.md')).sort();
  for (const file of pages) {
    const slug = file.replace(/\.md$/, '');
    const md = await readFile(at('content', file), 'utf8');
    // A top-level heading names the page only when the page opens with it.
    const opening = marked.lexer(md).find((t) => t.type !== 'space');
    const heading = opening?.type === 'heading' && opening.depth === 1 ? opening : null;
    const title = slug === 'index' ? config.name : `${heading ? heading.text : labelFor(slug)} — ${config.name}`;
    await writeFile(at('dist', `${slug}.html`), render({ slug, title, content: parse(md, `content/${file}`) }));
  }

  const posts = await readPosts(marked);
  if (posts.length) {
    await mkdir(at('dist/writings'), { recursive: true });
    for (const post of posts) {
      const date = `<p class="post-date"><time datetime="${post.iso}">${post.shown}</time></p>`;
      const body = parse(post.md, `content/writings/${post.slug}`);
      const content = body.includes('</h1>') ? body.replace('</h1>', `</h1>\n${date}`) : date + body;
      const title = `${post.title} — ${config.name}`;
      await writeFile(at('dist/writings', `${post.slug}.html`), render({ slug: `writings/${post.slug}`, title, content }));
    }
    const list = posts
      .map((p) => `<li><a href="${base}/writings/${p.slug}">${marked.parseInline(p.title)}</a> <time datetime="${p.iso}">${p.shown}</time></li>`)
      .join('\n');
    await writeFile(
      at('dist/writings/index.html'),
      render({ slug: 'writings', title: `writings — ${config.name}`, content: `<ul class="posts">\n${list}\n</ul>` }),
    );
  }

  // 404 page, from the same template.
  await writeFile(
    at('dist/404.html'),
    render({
      slug: '404',
      title: `not found — ${config.name}`,
      content: `<h1>not found</h1>\n<p>Nothing here. <a href="${base}/">Go home.</a></p>`,
    }),
  );

  if (!quiet) {
    const ms = Math.round(performance.now() - started);
    const extra = posts.length ? ` + ${posts.length} posts` : '';
    console.log(`built ${pages.length} pages${extra} + 404 → dist/ in ${ms} ms${base ? ` (base ${base})` : ''}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
