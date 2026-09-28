/* The purple dot cursor, and its morph into the "View Case Study" pill over a
   work card.

   Shared by the homepage and all four case studies rather than inlined per page:
   .more-work-card on a case study is the same card as .case-card on the
   homepage, so the two have to hover alike, and keeping one script is what stops
   them drifting apart. Both states are styled in styles.css (#custom-cursor /
   .on-card).

   Touch devices never reach this: styles.css hides #custom-cursor under
   (hover: none) / (pointer: coarse) and gives the system cursor back, so a
   synthetic mousemove from a tap moves nothing visible. */
(() => {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.classList.add('active');
  });

  document.addEventListener('mouseleave', () => cursor.classList.remove('active'));

  /* The pill means "this click opens the case study", so it drops back to the
     dot over a film's pause button (video-controls.js), which does something
     else. Delegated, because those buttons are added after this runs. */
  document.addEventListener('mouseover', e => {
    const onCard = e.target.closest('.case-card, .more-work-card');
    const onControl = e.target.closest('.video-toggle');
    cursor.classList.toggle('on-card', !!onCard && !onControl);
  });
})();
