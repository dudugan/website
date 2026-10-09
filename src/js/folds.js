// Folded sections (the build wraps any heading the page links to in <section class="fold">).
// They start hidden (CSS, keyed on html.js, so there's no flash); clicking a link to one
// shows it and hides the others, and clicking the open one's link folds it away again.
// A URL like /past-lives#music arrives with that section open.
// Collapsible folds (<!-- collapsible --> pages) keep their heading showing; clicking it opens
// that section and closes the others, or closes it if it's open.

let show = () => {};
const foldFor = (hash) => (hash ? document.getElementById(decodeURIComponent(hash.slice(1)))?.closest('.fold') : null);

export function initFolds() {
  mount();
  addEventListener('page:shown', mount);
  addEventListener('hashchange', () => show(foldFor(location.hash) ?? null));
}

function mount() {
  const folds = [...document.querySelectorAll('#content .fold')];
  if (!folds.length) {
    show = () => {};
    return;
  }
  const links = [...document.querySelectorAll('#content a[href^="#"]')].filter((a) => foldFor(a.hash));

  show = (fold) => {
    for (const f of folds) {
      f.classList.toggle('open', f === fold);
      if (f.classList.contains('collapsible')) f.firstElementChild.setAttribute('aria-expanded', String(f === fold));
    }
    for (const a of links) a.setAttribute('aria-expanded', String(foldFor(a.hash) === fold));
  };

  for (const fold of folds.filter((f) => f.classList.contains('collapsible'))) {
    const heading = fold.firstElementChild;
    heading.setAttribute('role', 'button');
    heading.tabIndex = 0;
    const toggle = () => {
      show(fold.classList.contains('open') ? null : fold);
      heading.setAttribute('aria-expanded', String(fold.classList.contains('open')));
    };
    heading.addEventListener('click', toggle);
    heading.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      toggle();
    });
  }

  for (const a of links) {
    const fold = foldFor(a.hash);
    fold.id ||= `${fold.querySelector('[id]').id}-section`;
    a.setAttribute('aria-controls', fold.id);
    a.addEventListener('click', (e) => {
      e.preventDefault(); // stay put: the section opens right here, below the link
      const opening = !fold.classList.contains('open');
      show(opening ? fold : null);
      history.replaceState(history.state, '', opening ? a.hash : location.pathname + location.search);
    });
  }
  show(foldFor(location.hash) ?? folds.find((f) => f.classList.contains('open')) ?? null);
}
