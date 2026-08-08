/* ==========================================================================
   SIDE NAV — active state + anchor scrolling
   Shared by all four case studies. This used to be copy-pasted into each page,
   which is how oxy.html ended up with a smooth-scroll handler the other three
   never got, and how the active-state logic drifted out of step with the
   sections it was meant to track.

   The old version watched an IntersectionObserver band 30%–40% down the
   viewport. A section had to be tall enough to reach that band to ever light
   up, so short ones (nielsen's "Approach" is a zero-height anchor) could never
   win, and clicking them left the purple rule on whatever was lit before —
   or on nothing at all. This walks the sections against a reading line
   instead, so exactly one is always active regardless of a section's height.
   ========================================================================== */

(function () {
  const nav = document.querySelector('.side-nav');
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const items = links
    .map(a => ({ a, el: document.querySelector(a.getAttribute('href')) }))
    .filter(i => i.el);
  if (!items.length) return;

  /* Derived from the DOM rather than a hand-kept list — the previous per-page
     arrays had to be edited in step with the markup, and weren't. */

  const NAV_H = 72;   // fixed bar an anchor has to clear to stay readable
  const LAND = 8;     // gap left under the bar when an anchor is scrolled to
  /* The reading line sits just below the bar, not partway down the viewport.
     A deeper line reads whatever is at mid-screen, which for a section shorter
     than that depth is already the *next* one — that's what left "The Brief"
     and the problem/HMW bands unlit. Keeping it here means the line lands
     inside whichever section a click just brought to the top, whatever its
     height, so the click and the scroll handler always agree. */
  const LOOK = NAV_H + LAND + 16;

  let lockedTo = null;   // the link just clicked; held until its scroll lands
  let settle;

  const setActive = a => links.forEach(l => l.classList.toggle('active', l === a));

  const top = el => el.getBoundingClientRect().top + window.scrollY;

  function update() {
    if (lockedTo) return;   // a click owns the highlight until it arrives

    const line = window.scrollY + LOOK;

    // Last section to have started above the line. Defaults to the first, so
    // something is always lit — including at the very top of the page, where
    // the old band-based version left the nav blank.
    let current = items[0];
    for (const it of items) if (top(it.el) <= line) current = it;

    // The final sections can sit below the line even when fully scrolled, so
    // the page bottom awards the last one outright.
    const atBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atBottom) current = items[items.length - 1];

    setActive(current.a);
  }

  links.forEach(a => {
    a.addEventListener('click', e => {
      const el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();

      // Light it immediately, and hold that through the scroll — otherwise
      // every section flying past would grab the highlight in turn.
      setActive(a);
      lockedTo = a;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: top(el) - NAV_H - LAND,
        behavior: reduce ? 'auto' : 'smooth'
      });

      // Release if the scroll never fires (already at the target).
      clearTimeout(settle);
      settle = setTimeout(() => { lockedTo = null; }, 400);
    });
  });

  window.addEventListener('scroll', () => {
    if (lockedTo) {
      // Wait for the click's scroll to settle, then hand back to the reading line.
      clearTimeout(settle);
      settle = setTimeout(() => { lockedTo = null; update(); }, 140);
      return;
    }
    update();
  }, { passive: true });

  window.addEventListener('resize', update);
  update();
})();
