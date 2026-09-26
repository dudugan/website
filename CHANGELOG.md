# Changelog

Everything that has changed since the original brief in [SPEC.md](SPEC.md). Newest entries go first.
Each entry says what changed, why, and whether it came from you or was proposed by Claude.
Working assumptions that haven't been approved yet stay in [PLAN.md](PLAN.md) under "Open decisions". They only move here once you settle them.

---

## 2026-09-26: tracker moves to the homepage

### Decided by you
- **The habit tracker is at the bottom of the homepage** instead of /now.
- **Its squares are bigger** (16 px, was 12 px), so fewer days show at once: 29 in a desktop-width column (was about 39), and about 20 on a phone.

## 2026-09-26: habit tracker, collage and "here" fixes

### Decided by you
- **A habit tracker, based on your screenshot**, on /now for now. Put `<!-- habits -->` on its own line in any page to show it there instead.
  - One row per habit, with no date row and no name column.
  - Each day is a small rounded square, GitHub-style. A streak joins its squares into one rounded bar.
  - The rightmost column is always today, and you can scroll sideways through earlier dates.
  - Hovering shows the habit's name (bottom left) and the date, e.g. "September 26" (bottom right).
- **Habits are set up in `content/habits.json`**, each with a name, a colour, and a `max-gap`: the number of days in a row it can be missed before the streak breaks.
- **Colours are dark teal, purple, ember, green, gold, and blue**, each with the same slow gradient shimmer as bold text.
- **Editing is option B1.** With `?edit` and a GitHub token, the squares become clickable, and clicks are committed to `content/habits.json`.
- **On narrow screens, collage pictures lean toward the edges** and can hang slightly off-screen. Some still sit in the middle.
- **The "here" tag now settles to plain "here".** Its last letter used to stay scrambled (an off-by-one). It still dissolves and re-forms, now at uneven intervals of 7–15 s.

### Proposed by Claude while building (tell me if you want any of these changed)
- **Missed days inside a streak are tinted** with the habit's colour at 42% strength, as in your screenshot.
  - A streak whose last done day is still within max-gap stays open through today, since today can carry it on.
- **Streak counts aren't drawn**, because they don't fit on 12 px squares. They could go in the hover line instead (see PLAN.md).
- **The starting data is transcribed from your screenshot** (Aug 28 – Sep 15), with max-gap 2 for Exercise and 1 for the rest, as the screenshot implies. "Excercise" is spelled "Exercise".
- **A burst of clicks becomes one commit**, about 1.5 s after the last click.
  - Saving pulls the latest file first and merges, so edits made in VS Code aren't overwritten.
  - While you're logged in, the tracker shows the version on GitHub, which can be newer than the deployed page.
- **You can drag the tracker sideways with the mouse**, and a drag never toggles a square. Clicks on the tracker don't pause or resume the music.

## 2026-09-26: teal bold, "here", writings

### Decided by you
- **Hovered collage pictures are more opaque.** A hovered picture now goes to full opacity (was 0.9). On narrow screens, where pictures sit under the text, it goes to 0.8 (was 0.45).
- **Bold text is dark teal/turquoise instead of fire-coloured.** It keeps the same slow 6 s shimmering gradient.
- **The tag under the cursor says "here"** instead of "click".
- **A writings page.** `/writings` lists every post in `content/writings/`, newest first, and each post has its own page at `/writings/<slug>`. Two example posts are included.

### Proposed by Claude while building (tell me if you want any of these changed)
- **Posts need no front matter.** A post is named `YYYY-MM-DD-slug.md`. The date in the name orders the list and is shown under the title. The first `# heading` is the title.
- **Dates use your d/m/yyyy style**, as on /now: "26/9/2026".
- **"writings" is added to the header nav.** It stays highlighted while you're reading a post.

## 2026-09-26: a collage behind /influences

### Decided by you
- **The covers, posters, and people on `/influences` float faintly behind the text**, overlapping one another.
  - They drift a little as you scroll, and some of them bob before settling.
  - They brighten as the torch comes near.
  - Hovering a link brings its own picture up to nearly full strength.

### Proposed by Claude while building (tell me if you want any of these changed)
- **Each picture sits beside its own link**, in the margin on the link's side and sometimes reaching in under the text. That way, hovering a link always lights something you can see.
- **The pictures are grey until lit.** Hovering a link brings its picture up in full colour. This keeps the page black and white at rest.
- **The pictures are downloaded into the repo** (`public/img/links/`, about 1.3 MB, 320 px), not loaded from the other sites. `npm run images` fetches pictures for new links and keeps existing ones. To swap a picture, drop your own jpg in under the same name.
- **Blogs use their logos, not their writers' faces**, for example the ACX book and the Noahpinion rabbit.
- **On phones** the pictures spread across the whole width, smaller and fainter.
- **Reduced motion** turns off the drift and the bob. The torch and hover still brighten the pictures.
- **Fixed a broken link:** Eliana Du's was `www.elianadu.substack.com`, which doesn't resolve. It's now `elianadu.substack.com`.

## 2026-09-26: bold text gets a fire gradient

### Decided by you
- **Bold text (`**...**`) is no longer plain foreground white.** It now renders in a warm gradient — gold through amber to ember-orange, the same palette as the torch glow — with a very slow, subtle shift (6 s loop). You asked for a color or animated gradient and left the choice to Claude; the torch's existing fire palette was picked so it stays consistent with "the fire is the only colour."
- Reduced-motion visitors get the gradient frozen in place, no shift.

## 2026-09-26: longer loader, linked influences

### Decided by you
- **The loader lasts 2 s longer.** It now stays up for at least 4.3 s (was 2.3 s) and at most 8 s (was 6 s).
- **Everything named on `/influences` gets an external link**, opening in a new tab.
  - Films, shows, books, and music link to Wikipedia, or to an official site where one exists (Unsong, The Sequences).
  - Professors link to their Yale faculty pages.
  - Friends and collaborators are only linked where their own page could be confidently identified. The rest are still pending.

## 2026-09-25: first build

### Decided by you
- **No background for now.** The site starts as a minimalist black-and-white page, and Claude won't draw the background art.
  - The cellar (spec background 1) is shelved.
  - The alien meadow (background 2) stays deferred.
- **Placeholders.** The name, tagline, and all five external link URLs are placeholders for now: lorem ipsum text and `example.com` URLs.
- **Music.**
  - It starts on the first click anywhere on the page.
  - Until that first click, a small "click" tag follows under the cursor, like on jia.build.
  - After that, each click pauses or resumes.
  - A "playing / not playing" indicator sits in the bottom-right corner.
  - The placeholder soundtrack is generated live in the browser: fire crackle, a low drone, and a sparse music box.
- **Loader.** It shows once per visit, meaning once per browser session.
- **Favicon.** A torch flame.
- **Pages.** The approach is approved: one template, with a page per `.md` file generated at build time.

### Proposed by Claude while building (tell me if you want any of these changed)
- **Links never pause the music.** Clicks on links and buttons don't pause or resume it, so moving between pages never cuts it off. Finishing a text selection doesn't toggle it either. The *first* click still starts it wherever it lands, including on a link.
- **The fire is the only colour.** The site is black and white, the torch glow is warm, and the loader is drawn in bone-white ink on black.
- **Loader timing.**
  - It stays up for at least 2.3 s, so the gesture wave can travel down the line, and at most 6 s.
  - Clicking the loader skips it.
  - Visitors with reduced motion turned on never see it.
- **Reduced motion elsewhere.** For those visitors, the torch becomes a steady glow and the page-change fade is turned off.
- **Font.** EB Garamond, self-hosted. It's the same typeface jia.build uses.
- **External links** open in a new tab.
- **Hosting.**
  - The new repo is `dudugan/website`, because `dudugan.github.io` already exists (your old site).
  - Until Vercel, the site is served at `https://dudugan.github.io/website/`.

## 2026-09-25: spec recorded

- The brief is recorded verbatim in SPEC.md.
- The first build plan is drafted in PLAN.md.
