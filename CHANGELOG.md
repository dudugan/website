# Changelog

Everything that has changed since the original brief in [SPEC.md](SPEC.md). Newest entries go first.
Each entry says what changed, why, and whether it came from you or was proposed by Claude.
Working assumptions that haven't been approved yet stay in [PLAN.md](PLAN.md) under "Open decisions". They only move here once you settle them.

---

## 2026-09-26: habit clicks leave the music alone

### Decided by you
- **Clicking the habit tracker never starts or pauses the music**, including the very first click on a page.

### Proposed by Claude while building (tell me if you want any of these changed)
- **Fixed the underlying bug.** Marking a day redraws the tracker, which detached the clicked square before the music checked where the click was, so it looked like a click on empty space. The music now checks the click's path as it was when it happened.
- **Logging out of edit mode cancels a save that's still waiting**, so it can't run afterwards without a token.

## 2026-09-26: flame favicon

### Decided by you
- **The favicon is just the fire, drawn as a black ink outline.** It started as a full-colour Olympic-style torch. A smoother one-colour flame came in between, but that was too much like the stock icon.

### Proposed by Claude while building (tell me if you want any of these changed)
- **The drawing:**
  - A twisting centre tongue with a lick on either side.
  - One open stroke inside, and a wisp breaking off the top.
  - A slight displacement gives the line a pen's unsteadiness.
- **The line is 3.8 units thick**, enough to hold up at 16 px.
- **Home-screen icons put the flame on a bone-white tile**, since black on the old black tile would vanish.
- **On dark tab bars the favicon switches to white** (you asked, after seeing the all-black version there). The .ico fallback and the home-screen icons stay black.

## 2026-09-26: species names on the loader, flat tracker squares

### Decided by you
- **Hovering a being in the loader shows its species name in italics.** The pequeniño is "pequeniño" and the robot is "robot".
  - The names appear in one shared line, centred a little below the whole procession, since only one shows at a time.
  - They're about 21 px, much bigger than the first version drawn inside the picture.
- **The tracker is back to separate squares, like GitHub's contribution map.**
  - Done days are in the habit's colour.
  - Missed days inside a streak are a solid, dimmer shade of the habit's colour. (Tried first at 50% and then 25% opacity.)
  - Done days are a little brighter than the first flat version.
  - Every square is one flat colour, with no gradient, texture, or animation.

### Proposed by Claude while building (tell me if you want any of these changed)
- **The names:**
  - raven *Corvus corax*
  - caveman *Homo neanderthalensis*
  - jumping spider *Phidippus audax* (the bold jumper)
  - boy *Homo sapiens*
  - dolphin *Tursiops truncatus* (bottlenose)
  - *Homo naledi*
  - elephant *Loxodonta africana* (African, for its big ear)
- **The name line is plain page text, outside the drawing**, so it keeps the same size on any screen and doesn't wobble with the line boil. Each being's hover area covers its whole drawing.
- **Each habit's two colours (done / missed in a streak):**
  - teal #439387 / #26403c
  - purple #6e488f / #34283e
  - ember #9f5236 / #442b22
  - green #498d53 / #283e2c
  - gold #9c7e3b / #433923
  - blue #426395 / #263040

## 2026-09-26: connected marble streaks, creative work on /past-lives

### Decided by you
- **Streaks are joined bars again, now in still marble** instead of the lines through separate squares.
- **The marble is a little brighter, and grainy and detailed rather than smooth.** It has busier clouding, many fine veins, and pale flecks and dark pits.
- **/past-lives lists your creative work** from your old site's creative page, in the same format: `> Title. Year. Type. Credits.`
  - Music: 13 pieces.
  - Writing: 10, including the poetry.
  - Web design: 6.

### Proposed by Claude while building (tell me if you want any of these changed)
- **Missed days inside a streak show the same stone at 40%.**
- **Where pieces went:**
  - Pieces are sorted by what their type says first.
  - Writing: the conlang relay translations, the Visions print issue, and the three conlang poetry videos.
  - Music: the Old Babylonian rap.
  - Web design: Mutation(s) ("music & website"), Nucleica, and Gobbler.
- **The old page's "See also" line is split in two.** amoriem labs and the daily improvisations go under music; the Cortex Collective and the conlanging channel go under writing. The "audio player under construction" note is left out.
- **The Pokémon site's link** was relative on your old site (`404.html`), so it now points at `dudugan.github.io/404.html` to keep working the same way.

## 2026-09-26: folding sections on /past-lives, linked connections, marble tracker

### Decided by you
- **On /past-lives, the research, music, writing, and web design sections are hidden until clicked.** The words in "See below my research, music, writing, and web design" open them.
- **All 18 connections on /past-lives are linked.** 17 come from your old site's affiliations page. Yale AI Alignment (yaleaia.org) was found by search.
- **The tracker's squares are still marble, not animated gradients.** Each colour is a dark stone with lighter and darker clouding and thin pale veins, and every square shows a different part of the slab.

### Proposed by Claude while building (tell me if you want any of these changed)
- **One section is open at a time.** Clicking the open one's word folds it again, and the open word is fully underlined.
  - The address shows the open section (`/past-lives#music`), so a link to it opens it directly.
  - Without JS, all sections show.
  - This works on any page: link to a heading on the same page and that heading's section folds.
- **Link choices:**
  - The Center for Collaborative Arts & Media links to ccam.yale.edu. Your old profile page there now says "Access denied".
  - BlueDot Impact links to its homepage rather than the course page.
- **Fixed:** a page's browser-tab title used to come from its first top-level heading anywhere on the page, so /past-lives was titled "research". Now a heading names the page only if the page opens with it.
- **The dev server picks up edits to the build script itself** without a restart.

## 2026-09-26: separate squares with streak lines, more pictures

### Decided by you
- **The tracker keeps its 16 px squares and fills the column with more days**, instead of scaling the squares up. That's about 29 days on desktop and about 20 on a phone.
- **Streaks are no longer joined bars.** Every done day is its own rounded square, and only the squares are gradient-animated. A thin line in the habit's colour runs through the middle of a streak's squares and across its missed days. When the streak is still alive, the line runs on to today.
- **Your pictures for 8 more /influences links:**
  - New for Guardians of Ga'Hoole, slchld, Raffaella Zanuttini, Gary Tomlinson, Neelasha Sudarshan, and IKEA Heights.
  - Replaced for Avatar: The Last Airbender and Arcane.
- **Neelasha Sudarshan's link is now `https://neelasha-s.github.io/neelasha.github.io/`.** The old one returned 404.
- **Pictures for Richard Prum and Michael Gao**, so every /influences link now has one.

### Proposed by Claude while building (tell me if you want any of these changed)
- **The streak line is solid, not animated**, in the lightest of the habit's shades, 2 px thick with rounded ends. It's drawn beneath the squares.

## 2026-09-26: full-width tracker, darker colours, loader on reload, your pictures

### Decided by you
- **The tracker spans the full column again**, still showing 14 days. The squares scale up to fill the width: about 34 px on a desktop column and about 24 px on a phone.
- **The tracker's colours are darker than the originals and faded into the background.** They're still visible, and still flow like liquid.
- **The loader plays again when a page is reloaded**, as well as on the first page of a visit. Moving to another page never shows it.
- **Your pictures replace 20 of the /influences images:** Battlestar Galactica, Black Panther, Maria Mercedes Piñango, David Watts, Chris Shia, Deven Huang, Casey Dunn, Jim Wood, Katelyn Wang, Ken Liu, Laundry Day, the Sequences, Nas, Oneohtrix Point Never, Richard Bribiescas, Simon Charlow, Ted Chiang, Unsong, Warriors, and Wings of Fire. Each is resized to 320 px (12–46 KB).

### Proposed by Claude while building (tell me if you want any of these changed)
- **Missed days inside a streak are tinted at 50%** (was 30%), so they still stand out from empty days at the darker colours.
- **Saving a file under `npm run dev` doesn't replay the loader**, even though it reloads the page.

## 2026-09-26: paler, liquid tracker

### Decided by you
- **The tracker's colours are paler and faded.** Each colour is now six pastel shades instead of four dark ones. The names are unchanged: teal, purple, ember, green, gold, blue.
- **The colour moves like liquid** instead of sliding left and back.
  - Each colour has two layers: the six shades, and a diagonal sheen of light and dark bands.
  - Each layer wanders through random offsets on an uneven clock.
- **Half as many days show at once** (14, two weeks), and the tracker is centred under the text.

### Proposed by Claude while building (tell me if you want any of these changed)
- **Every animation loop is still under 7 s**, per the site's animation rule. The two layers of each colour loop at different lengths, so together they rarely repeat.
- **A long habit name wraps under the tracker without moving anything else.** The date stays on one line.
- **The dev server now picks up edits to the tracker code** without a restart.

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
