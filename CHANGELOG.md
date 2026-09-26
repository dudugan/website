# Changelog

Everything that has changed since the original brief in [SPEC.md](SPEC.md). Newest entries go first.
Each entry says what changed, why, and whether it came from you or was proposed by Claude.
Working assumptions that haven't been approved yet stay in [PLAN.md](PLAN.md) under "Open decisions". They only move here once you settle them.

---

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
