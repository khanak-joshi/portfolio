/* A pause/play button on every looping film, and no motion at all for anyone
   who has asked their system for less.

   WCAG 2.2.2: anything that moves on its own for more than five seconds needs a
   way to stop it. Every film on the site autoplays and loops, so each one gets
   its own button, pinned to the film's top-left corner — clear of the "In
   progress" badge (top-right) and the hover description (bottom) on the
   homepage cards. The markup stays untouched; this script adds the buttons, so
   without JS the films simply play as they always did.

   With prefers-reduced-motion the films start paused on their first frame, and
   the same button lets someone opt back in to one of them.

   A film inside a card sits under the card's stretched link, so the button is
   raised above it (z-index in styles.css) and is a sibling of the link, never
   inside it — a button nested in a link is invalid and unreliable. */
(() => {
  const films = document.querySelectorAll('video[autoplay]');
  if (!films.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICON_PAUSE =
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">' +
    '<rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor"/>' +
    '<rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor"/></svg>';
  const ICON_PLAY =
    '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">' +
    '<path d="M4 2.5v11a1 1 0 0 0 1.5.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5z" fill="currentColor"/></svg>';

  films.forEach(video => {
    /* Name the button after what it controls. A card's film is hidden from
       screen readers (the card title already says it), so fall back to that. */
    const card = video.closest('.case-card, .more-work-card');
    const name = card
      ? card.querySelector('.card-link').textContent.trim()
      : (video.dataset.name || 'video');

    /* The homepage cards already wrap their film in a positioned box; anywhere
       else, give the film one so the button has a corner to sit in. */
    let frame = video.parentElement;
    if (!frame.classList.contains('card-image-wrap')) {
      frame = document.createElement('div');
      frame.className = 'video-frame';
      video.before(frame);
      frame.append(video);
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'video-toggle';
    frame.append(button);

    let heldPaused = reduce;

    const render = () => {
      const paused = video.paused;
      button.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
      button.setAttribute('aria-label', (paused ? 'Play ' : 'Pause ') + name + ' film');
    };

    button.addEventListener('click', () => {
      heldPaused = !video.paused;
      if (heldPaused) video.pause();
      else video.play().catch(() => {});
    });

    video.addEventListener('play', render);
    video.addEventListener('pause', render);
    /* The homepage swaps a film's src at its breakpoint and calls play(); a
       film the viewer paused has to stay paused through that. */
    video.addEventListener('playing', () => { if (heldPaused) video.pause(); });

    if (reduce) {
      video.removeAttribute('autoplay');
      video.preload = 'auto';      // so the first frame paints instead of a blank box
      video.pause();
    }
    render();
  });
})();
