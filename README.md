# website

A minimalist personal site. Each page is one markdown file, and all pages share one template. There are a few small hand-drawn touches.

## Editing

| to change… | edit |
| --- | --- |
| a page's text | `content/<page>.md` (only content, no front matter) |
| name, description, nav order, the 5 external links | `site.config.json` |
| layout / chrome | `src/layout.html` (the only HTML file) and `src/css/site.css` |
| the loader drawing | `src/art/procession.mjs` |
| the favicon | `src/art/favicon.svg`, then `npm run icons` |

A new `content/foo.md` becomes `/foo` automatically. Add `"foo"` to `nav` in `site.config.json` to link it in the header.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321, rebuilds + reloads on save
npm run build    # → dist/
npm run icons    # re-render favicon PNGs/ICO from src/art/favicon.svg
```

## Deploying

- **GitHub Pages:** every push to `main` builds and deploys via `.github/workflows/deploy.yml`.
- **Vercel (later):** import the repo. `vercel.json` already sets the build command, the `dist` output, and clean URLs.

The original brief is in [SPEC.md](SPEC.md). Changes since then are in [CHANGELOG.md](CHANGELOG.md), and the build plan is in [PLAN.md](PLAN.md).
