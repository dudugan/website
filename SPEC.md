# Original spec

Recorded 2026-09-25. **This file is frozen**: it holds the brief exactly as first given, and is never edited.
Every change, addition, or reinterpretation since then goes in [CHANGELOG.md](CHANGELOG.md).

---

## Verbatim brief

Let's make a personal website from scratch. It should be hosted on my github, and I'll tie it to a vercel domain later. For now, the website should have four pages:

1. a homepage
2. a `/now` page
3. a `/past-lives` page
4. a `/influences` page


The website should also have five external links:

1. my old website
2. my linkedin website
3. my newsletter
4. my ai safety substack
5. my resume


The website should have some cool features:

1. a custom loading animation like this site: https://amhw460.github.io/
2. custom music on click like this site: https://www.jia.build/
3. a custom fire-like halo for the mouse, as if one is carrying a torch.
4. a custom favicon


Each page of the website should be just a `.md` file, with only that as its content, in a `content/` folder. Each should also have its own URL, and there should not be near-duplicate `.html` files in the backend.
The art style for the website should look hand-drawn, with influences from Jean Giraud, Hayao Miyazaki, Winsor McCay, Tove Jansson, and Jean-Jacques Sempé. The art style should come into play in three ways:

1. When creating the loading animation (which should be a looping, very short and minimal animation)
2. When creating the custom favicon.
3. Potentially, I want a background for the site.


There are two potential backgrounds I am thinking of pursuing, both in the art style defined above. I'd like you to start with the first one, and then we'll cache and maybe come back to the second.

1. A background which only takes up the center of the screen both vertically and horizontally (so it is robust to screen size changes). This background is the image of an underground cellar. There are a few torches on the wall which provide light and flicker, but otherwise everything is pretty dark, and you can faintly make out the bricks of the wall and the ladder up on the far wall. This should be in dark mode to start out - the text should be light.
2. A background which takes up the whole screen. The bottom of the screen is covered with some green alien grasses and weeds and plants which are animated to flow in the wind like real ones. These grasses/the landscape fades out as you move upwards up the screen, but still having a sort-of 3d perspective looking outwards. The text content is in the center.


I'm allowing you creative freedom, but stick to the art styles mentioned above.

Generally, all animations should be at most 7 seconds long, should really minimal movement-wise (just like flutters and small movements that go back into place, etc.), and should be looping.

The custom loading animation should be in the format of the March of Progress evolution image, except that the apes and humans and cavemen are replaced with a line of right-facing beings that look like, from left to right, in the art style defined above:

1. a raven
2. a caveman
3. a spider (specifically, a "jumping spider")
4. a human boy
5. a dolphin
6. an alien (try to create a drawing in this art style of a pequeniño from Orson Scott Card's Speaker for the Dead)
7. a robot (kind of looking like c3po)
8. a homo naledi
9. an elephant


Also use these two websites as examples of minimalist websites I'm trying to mimic: https://www.jia.build/ and https://nel.ag/. I'll populate the exact text later; for now use lorem ipsum.

Start by making a step-by-step plan for how you're going to create this website. In addition, list anything that I need to do on my end. Make a file where you record the original spec, and another file where you write down any changes made since.

---

## Reference sites, as observed on 2026-09-25

Notes on what each reference actually does, so later decisions can point back to them.

- **amhw460.github.io (loading animation):** a full-screen overlay in the site's background colour, with one small hand-drawn creature (a crow) flapping as a 9-frame sprite loop (<1 s cycle). About 1.1 s after the page `load` event it fades out over ~0.85 s and is removed.
- **jia.build (music on click):** a muted, looping background scene plays on arrival. A row of named "tracks" sits along the bottom, with a speaker button in the corner. Sound only starts when you click, which browsers require anyway. Clicking a track name switches the scene and its sound.
- **nel.ag (minimalism):** a black page with one tiny centred block in a plain serif: an italic name, one sentence, and a row of four underlined links. Nothing else.
- **jia.build (minimalism):** a small name top-left, three nav words top-right, and short plain paragraphs in lowercase.
