// Works page (mirrors telhaclarke.com.au/works/): filters, grid/list switch.
// Delegated listeners, so it keeps working across page transitions without hooking initPage.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reveal = (els) => gsap.fromTo(els, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.8, ease: 'expo.out', overwrite: true });

document.addEventListener('click', (e) => {
  const page = document.querySelector('[data-taxi-view] [data-wp]') || document.querySelector('[data-wp]');
  if (!page) return;
  const view = page.closest('[data-taxi-view]') || document;
  const cards = $$('.cw', page), rows = $$('.wl-row', page), filters = page.querySelector('.wp-filters');

  const tog = e.target.closest('[data-filters-toggle]');
  if (tog) {
    const open = !filters.classList.contains('is-open');
    filters.classList.toggle('is-open', open);
    $$('[data-filters-toggle]', view).forEach((t) => t.setAttribute('aria-expanded', open));
    if (open && tog.closest('.wp-pill')) window.scrollTo({ top: 0, behavior: 'smooth' });
    ScrollTrigger.refresh();
    return;
  }

  const fb = e.target.closest('[data-wp-filter]');
  if (fb) {
    const f = fb.dataset.wpFilter;
    $$('[data-wp-filter]', page).forEach((x) => x.classList.toggle('is-active', x === fb));
    [...cards, ...rows].forEach((el) => el.classList.toggle('is-hidden', f !== 'all' && el.dataset.cat !== f));
    $$('[data-filter-label]', view).forEach((l) => (l.textContent = f === 'all' ? 'All works' : f));
    reveal([...cards, ...rows].filter((el) => !el.classList.contains('is-hidden')));
    ScrollTrigger.refresh();
    return;
  }

  const vb = e.target.closest('[data-wp-view]');
  if (vb) {
    const grid = vb.dataset.wpView === 'grid';
    page.querySelector('[data-view-grid]').hidden = !grid;
    page.querySelector('[data-view-list]').hidden = grid;
    $$('[data-wp-view]', view).forEach((x) => { x.classList.toggle('is-active', x === vb); x.setAttribute('aria-pressed', x === vb); });
    reveal(grid ? cards : rows);
    ScrollTrigger.refresh();
  }
});
