// Builds the site: every content/*.md becomes one page, rendered through the single
// src/layout.html template. Output goes to dist/ (generated, never edited by hand).
//
//   content/index.md       -> dist/index.html        served at /
//   content/now.md         -> dist/now.html          served at /now
//   content/past-lives.md  -> dist/past-lives.html   served at /past-lives
//
// BASE_PATH (e.g. "/website") prefixes every internal URL, for hosting under a sub-path.

import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const at = (...p) => join(root, ...p);

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const labelFor = (slug) => slug.replace(/-/g, ' ');

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

function markdownRenderer(base) {
  const marked = new Marked({ gfm: true });
  const local = (href) => (href.startsWith('/') && !href.startsWith('//') ? base + href : href);
  marked.use({
    renderer: {
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href);
        const attrs = [
          `href="${escapeHtml(local(href))}"`,
          title ? `title="${escapeHtml(title)}"` : '',
          external ? 'target="_blank" rel="noopener"' : '',
        ].filter(Boolean);
        return `<a ${attrs.join(' ')}>${text}</a>`;
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
  const marked = markdownRenderer(base);

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
      .map((s) => `<a href="${base}/${s}"${s === slug ? ' aria-current="page"' : ''}>${escapeHtml(labelFor(s))}</a>`)
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

  const pages = (await readdir(at('content'))).filter((f) => f.endsWith('.md')).sort();
  for (const file of pages) {
    const slug = file.replace(/\.md$/, '');
    const md = await readFile(at('content', file), 'utf8');
    const heading = marked.lexer(md).find((t) => t.type === 'heading' && t.depth === 1);
    const title = slug === 'index' ? config.name : `${heading ? heading.text : labelFor(slug)} — ${config.name}`;
    await writeFile(at('dist', `${slug}.html`), render({ slug, title, content: marked.parse(md) }));
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
    console.log(`built ${pages.length} pages + 404 → dist/ in ${ms} ms${base ? ` (base ${base})` : ''}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
