# Build plan

Status markers: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` waiting on you · `[–]` shelved
Brief: [SPEC.md](SPEC.md) · Changes since the brief: [CHANGELOG.md](CHANGELOG.md)

## Ground rules (these apply to every step)

- **Content:** each page is one `.md` file in `content/` that holds only its content (no front matter). A single HTML template renders all of them.
- **Animation:** every animation loops, lasts at most 7 s per cycle, and moves very little: flutters and small motions that settle back into place. Visitors with `prefers-reduced-motion` get a still version.
- **Art:** it should look hand-drawn, after Giraud/Moebius, Miyazaki, McCay, Jansson, and Sempé.
- **Layout:** minimal, like nel.ag and jia.build. At rest it's black and white. The only colours are the torch's fire, the teal gradient on bold text, and the marble of the habit tracker. A collage picture turns to full colour only while its link is hovered.
- **No-JS baseline:** with JavaScript off, all text and links still work. Every effect is layered on top of that.

---

## Architecture

```
website/
├── SPEC.md  CHANGELOG.md  PLAN.md  README.md
├── content/                 ← the site's pages; each file is only its content
│   ├── index.md             → /
│   ├── now.md               → /now
│   ├── past-lives.md        → /past-lives
│   ├── influences.md        → /influences
│   └── writings/            → /writings (the list) and /writings/<slug> (each post)
├── site.config.json         ← name, description, nav order, the 5 external links
├── src/
│   ├── layout.html          ← the ONLY html file in the source (the build enforces this)
│   ├── css/site.css
│   ├── js/                  ← main, router, loader, torch, music, collage
│   └── art/                 ← procession.mjs (the loader drawing), favicon.svg
├── public/                  ← icons, web manifest, img/links/ (collage pictures), copied as-is
├── scripts/                 ← build.mjs, dev.mjs, icons.mjs, images.mjs
├── .github/workflows/deploy.yml   ← GitHub Pages
├── vercel.json              ← for later
└── dist/                    ← generated output, gitignored, never hand-edited
```

- **How pages are built.** `scripts/build.mjs` turns each `.md` into HTML (with `marked`) and places it inside `src/layout.html`. It writes `dist/<slug>.html`, which GitHub Pages and Vercel serve at `/<slug>`.
- **Sub-path hosting.** `BASE_PATH` prefixes every internal URL, which is how the site works at `/website/` on github.io.
- **How music keeps playing between pages.** A small router swaps `#page` in place when you click an internal link. The music, torch, and "click" tag live outside `#page`, so they keep running across page changes. Back/forward and hard refreshes still work.

---

## Steps

### Phase 0: Records and scaffolding
1. `[x]` SPEC.md (verbatim and frozen), CHANGELOG.md, PLAN.md.
2. `[x]` git, `package.json`, and the `dev` / `build` / `icons` scripts.
3. `[x]` `site.config.json` with placeholder name, tagline, and links.

### Phase 1: Content pipeline
4. `[x]` Four lorem-ipsum pages in `content/`.
5. `[x]` `src/layout.html` and `scripts/build.mjs`. The build also generates a 404 page from the same template and adds cache-busting version hashes.
6. `[x]` `npm run dev`: a local server with clean URLs, rebuild on save, and live reload.
7. `[x]` The build fails if any `.html` other than `src/layout.html` exists in the source.

### Phase 2: Layout and typography
8. `[x]` A centred narrow column: an italic name, the page links, the content, then the external links.
9. `[x]` Black background, light text, EB Garamond (self-hosted), visible focus states, and a layout that holds at 320 px.
10. `[x]` Subpages use the same chrome, and the current page is underlined in the nav.

### Phase 3: Seamless navigation
11. `[x]` The router swaps the page in place with a short fade, prefetches on hover, and restores scroll position on back/forward. Without JS, links behave as normal page loads.

### Phase 4: Art foundation
12. `[x]` An ink kit inside `procession.mjs`: outlined shapes, tube limbs, hatching, and line boil via an animated displacement filter.
13. `[–]` The separate style test sheet was skipped, because you said "go" and there's no background to design. The loader drawing itself serves as the style checkpoint (step 23).

### Phase 5: Favicon
14. `[x]` An inked torch flame, legible at 16 px on both light and dark tab bars.
15. `[x]` `favicon.svg` (switches to a light outline in dark mode), `favicon.ico` (16 + 32), `apple-touch-icon.png`, 192/512 icons, and `site.webmanifest`.

### Phase 6: Background
16–19. `[–]` Shelved on 2026-09-25: no background for now, and Claude won't draw it. See the deferred section below.

### Phase 7: Torch cursor
20. `[x]` A warm halo with a slight carried lag, flickering from noise, with flame licks rising and the occasional ember. Drawn on one half-resolution canvas and screen-blended over the page.
21. `[–]` "Light reveals bricks" was dropped along with the cellar.
22. `[x]` The effect is off on touch screens and becomes a steady glow under reduced motion.

### Phase 8: Loading animation ⛳ your review
23. `[x]` All nine figures are drawn: raven, caveman, jumping spider, boy (a Petit Nicolas nod), dolphin mid-leap, pequeniño with a staff, C-3PO-like robot, *Homo naledi*, and elephant. **Waiting on your feedback.**
24. `[x]` A 3.6 s loop in which one small gesture passes down the line:
   - the raven hops, the caveman nods, the spider hops
   - the boy and naledi bob, the dolphin arcs, the pequeniño twitches its ears
   - the robot tilts its head, and the elephant swings its trunk and flaps an ear.
25. `[x]` It shows on the first page of a visit, and again on every reload (never when moving to another page). It stays up until the page has loaded and at least 2.3 s have passed (6 s at most), then fades over 0.8 s. Clicking it skips it. Lines get heavier on phones.

### Phase 9: Music
26. `[x]` It starts on the first click anywhere, with a "click" tag under the cursor until then (its letters scramble in, like jia.build's).
27. `[x]` After that, clicking empty space pauses or resumes, and links never pause it. The bottom-right indicator shows bars and "playing" / "not playing", and clicking it also toggles the music. The sound fades in and out.
28. `[x]` The placeholder soundtrack is generated live with Web Audio: fire crackle, a low A drone, and a music box wandering an A-minor pentatonic scale. There are no audio files.

### Phase 9b: Influences collage
28a. `[x]` `npm run images` fetches one picture per link on `/influences` into `public/img/links/`: covers, posters, portraits, and blog logos. The build tags each link that has a picture with `data-img`.
28b. `[x]` `collage.js` places each picture beside its link, grey and faint. It drifts with scroll, and some pictures bob on springs and settle within about 1 s. Pictures brighten near the torch, and a hovered or focused link brings its picture up in colour. The collage is rebuilt on every page swap and is off without JS.
28c. `[x]` Every link has a picture. Most are ones you picked, resized to 320 px.

### Phase 9e: Folding sections
28g. `[x]` Any heading a page links to (`[music](#music)`) is built as a folded section. It stays hidden until its link is clicked, and only one is open at a time. The address updates (`/past-lives#music`), so a section can be linked to directly. Without JS, every section shows. This is used on /past-lives.

### Phase 9c: Writings
28d. `[x]` Posts are `content/writings/YYYY-MM-DD-slug.md`, with the first `# heading` as the title. The build writes one page per post plus a newest-first list at `/writings`, and "writings" is in the nav. There are two example posts.

### Phase 9d: Habit tracker
28e. `[x]` `content/habits.json` holds the habits: name, colour, max-gap, and the days done. One renderer (`src/js/habits.js`) draws it at build time and again in the browser, so the rightmost column is always today.
   - Each day is a small rounded square. A streak joins its squares into one rounded bar, with missed days in dimmed stone.
   - The colour is still marble: grainy stone with busy clouding, fine pale veins, and flecks. Nothing is animated.
   - The squares are 16 px, so the full column shows about 29 days on desktop. It sits at the top of /now.
   - Hovering shows the habit's name (left) and the date (right).
   - You can scroll or drag sideways through the dates.
28f. `[x]` Edit mode (option B1): `?edit` plus a GitHub token lets you click squares. Clicks are committed to the file via the GitHub API, merged with any newer version of the file. It's tested against a fake GitHub (login, merge, conflict retry, bad token, log out) but hasn't yet been tried with a real token.

### Phase 10: Polish and QA
29. `[~]` Accessibility. Reduced motion, keyboard focus, `aria-pressed` on the sound button, and `aria-hidden` on decorative layers are done. The remaining work is a full screen-reader pass.
30. `[x]` Size.
   - Each page is about 23 KB of HTML (about 7 KB gzipped), mostly the loader drawing.
   - CSS and JS together are about 28 KB.
   - Fonts are about 49 KB. The accented-Latin files (another 100 KB) only download if a page uses those characters.
   - There are no audio files.
31. `[~]` Browsers. Tested in the Chromium preview at desktop and phone widths. Safari and Firefox still need a pass.
32. `[ ]` Open Graph image: the procession on its own.

### Phase 11: Deploy
33. `[x]` Repo `dudugan/website`. GitHub Actions deploys to Pages on every push to `main`.
34. `[ ]` **Later:** import the repo into Vercel and attach your domain. `vercel.json` is already in place.

### Deferred: backgrounds
- **Cellar (background 1):** shelved.
- **Alien meadow (background 2):** deferred.
- **Notes for later:**
  - It fills the whole screen.
  - Grasses sway, each on its own period (≤ 7 s).
  - Layered bands recede toward the horizon and fade out upward.
  - The text sits in the centre.

---

## What you need to do

1. **Review the loader drawing.** Tell me which figures to redraw, and how.
2. **Later:**
   - Replace the lorem ipsum in `content/*.md`.
   - Put your name and the real links in `site.config.json`.
   - Send music files if you want real tracks instead of the generated placeholder.
3. **Later:** connect Vercel and your domain.
4. **Habit tracker.**
   - Make the token and log in on the homepage with `?edit` (README → Habit tracker).
   - Fill in Sep 16–26, and the days before Aug 28 that your screenshot's 13-day streaks imply.
5. **Collage pictures.** Every link on /influences now has one. To add a picture for a new link by hand, drop a jpg into `public/img/links/` under the name `npm run images` reports for it.

## Open decisions

- **Streak numbers.** Your screenshot shows each streak's count at its end, but it doesn't fit on 16 px squares. It could go in the hover line instead.
- **Real music.** Keep the generated placeholder, or swap in files, which would add an mp3/ogg player and possibly a track list like jia.build's.
- **Open Graph preview image.** What should the link preview show?
