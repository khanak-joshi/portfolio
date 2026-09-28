/* The mobile menu overlay, shared by every page (it used to be inlined six times).

   The overlay covers the whole page, so it behaves as a modal dialog: opening it
   moves focus to its first link, Tab and Shift+Tab stay inside it, Escape closes
   it, and closing hands focus back to the button that opened it. The toggle
   reports its state through aria-expanded so a screen reader hears "expanded"
   or "collapsed" rather than a bare "Toggle menu".

   Stays a global function because the markup calls it from onclick — on the
   toggle, the close button, and each link (so a tap on a link also closes it). */
function toggleMobileNav(force) {
  const overlay = document.getElementById('mobileNav');
  const toggle = document.querySelector('.nav-toggle');
  if (!overlay || !toggle) return;

  const open = typeof force === 'boolean' ? force : !overlay.classList.contains('open');
  if (open === overlay.classList.contains('open')) return;

  overlay.classList.toggle('open', open);
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('nav-open', open);
  document.body.style.overflow = open ? 'hidden' : '';

  if (open) {
    const first = overlay.querySelector('.mobile-nav-links a');
    if (first) first.focus();
  } else if (overlay.contains(document.activeElement) || document.activeElement === document.body) {
    toggle.focus();
  }
}

(() => {
  const overlay = document.getElementById('mobileNav');
  if (!overlay) return;

  const focusables = () =>
    [...overlay.querySelectorAll('a[href], button:not([disabled])')]
      .filter(el => el.offsetParent !== null);

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      toggleMobileNav(false);
      return;
    }

    if (e.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
      e.preventDefault();
      first.focus();
    }
  });

  /* Widening the window past the breakpoint hides the overlay with CSS but
     would leave the page scroll-locked; close it properly instead. */
  window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
    if (e.matches) toggleMobileNav(false);
  });
})();
