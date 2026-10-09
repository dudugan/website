# website

A minimalist personal site. Each page is one markdown file, and all pages share one template. There are a few small hand-drawn touches.

## Editing

| to change… | edit |
| --- | --- |
| a page's text | `content/<page>.md` (only content, no front matter) |
| the habit tracker | `content/habits.json` (put `<!-- habits -->` on its own line in any page to show it; it's at the top of /now) |
| a section that opens on click | link to a heading on the same page, like `[music](#music)` for `# music`; that heading's section stays hidden until the link is clicked |
| headings that open and close | put `<!-- collapsible -->` on its own line in a page; each `# heading` then toggles its section (first one starts open) |
| a blog post | `content/writings/YYYY-MM-DD-slug.md`; its first `# heading` is the title, and it's listed at `/writings` |
| name, description, nav order, the 5 external links | `site.config.json` |
| layout / chrome | `src/layout.html` (the only HTML file) and `src/css/site.css` |
| the loader drawing | `src/art/procession.mjs` |
| the favicon | `src/art/favicon.svg`, then `npm run icons` |
| the pictures behind `/influences` | `npm run images` fetches one per link into `public/img/links/`; to swap one, drop your own jpg in under the same name (`--force` refetches everything and would overwrite those) |

A new `content/foo.md` becomes `/foo` automatically. Add `"foo"` to `nav` in `site.config.json` to link it in the header.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321, rebuilds + reloads on save
npm run build    # → dist/
npm run icons    # re-render favicon PNGs/ICO from src/art/favicon.svg
npm run images   # fetch pictures for new links on /influences (macOS; keeps existing ones)
```

## Habit tracker

Each habit in `content/habits.json` has:
- a `name`
- a `color`: one of `teal`, `purple`, `ember`, `green`, `gold`, or `blue`
- a `max-gap`: how many days in a row you can miss before the streak breaks
- `done`: the dates you did it, as `YYYY-MM-DD`

Add or reorder habits by editing the file. Days can be edited there too, or by clicking squares on the site:

1. **Make a token.** On GitHub, go to Settings → Developer settings → Fine-grained tokens → Generate new token.
   - Repository access: only `dudugan/website`.
   - Permissions: **Contents: Read and write**, nothing else.
2. **Log in.** Open the live /now page with `?edit` on the end of the address, paste the token, and press "log in". The token stays in that browser only, so repeat this once per device.
3. **Click squares to mark days done or not done.** A burst of clicks becomes one commit to `content/habits.json`, and the site redeploys about a minute later.
4. **Log out** with the link under the tracker. To cut a token off everywhere, delete it on GitHub.

## Deploying

- **GitHub Pages:** every push to `main` builds and deploys via `.github/workflows/deploy.yml`.
- **Vercel (later):** import the repo. `vercel.json` already sets the build command, the `dist` output, and clean URLs.

The original brief is in [SPEC.md](SPEC.md). Changes since then are in [CHANGELOG.md](CHANGELOG.md), and the build plan is in [PLAN.md](PLAN.md).
