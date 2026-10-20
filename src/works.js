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

/* Card follow-mouse preview, 1:1 with the reference c-follow-mouse (desktop >= 1200px, hover devices):
   a 12.5rem image trails the cursor 2rem right / 2.5rem below it (quickTo .6s expo.out), scales in 0 -> 1 with the
   photo 1.8 -> 1 (.8s expo.out), cycles to the next project image every 7.5vw of mouse travel, and scales out on leave
   (.6s expo.out). The card's black wash (.24) and image zoom (1.05 -> 1) are CSS, as on the reference. */
(() => {
  const remPx = (r) => r * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const mouse = { x: 0, y: 0 }; const st = new WeakMap(); const live = new Set();
  const ok = () => innerWidth >= 1200 && matchMedia('(hover:hover)').matches;
  addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const get = (el) => { let s = st.get(el); if (!s) { s = { el, content: el.querySelector('.fm-el'), image: el.querySelector('.fm-image'), inner: el.querySelector('.fm-inner'), imgs: [...el.querySelectorAll('.fm-img')], idx: 0, last: { x: 0, y: 0 } }; st.set(el, s); } return s; };
  const pos = (s) => { const r = s.el.getBoundingClientRect(); return { x: mouse.x - r.left + remPx(2), y: mouse.y - r.top + remPx(2.5) }; };
  document.addEventListener('mouseenter', (e) => {
    const el = e.target; if (!(el instanceof Element) || !el.matches('[data-follow-mouse]') || !ok()) return;
    const s = get(el); mouse.x = e.clientX; mouse.y = e.clientY;
    s.out && s.out.kill();
    s.in = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.8 } }).to(s.image, { scale: 1 }).set(s.image, { opacity: 1 }, '<10%').fromTo(s.inner, { scale: 1.8 }, { scale: 1 }, 0);
    const p = pos(s); gsap.set(s.content, { x: p.x, y: p.y });
    s.qx = gsap.quickTo(s.content, 'x', { duration: 0.6, ease: 'expo.out' }); s.qy = gsap.quickTo(s.content, 'y', { duration: 0.6, ease: 'expo.out' });
    live.add(s);
  }, true);
  document.addEventListener('mouseleave', (e) => {
    const el = e.target; if (!(el instanceof Element) || !el.matches('[data-follow-mouse]')) return;
    const s = st.get(el); if (!s) return; live.delete(s);
    s.in && s.in.kill();
    s.out = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.6 } }).to(s.image, { scale: 0 }).to(s.inner, { scale: 1.8 }, 0).set(s.image, { opacity: 0 }, '<10%');
  }, true);
  gsap.ticker.add(() => {
    live.forEach((s) => {
      if (!s.el.isConnected) { live.delete(s); return; }
      if (Math.hypot(mouse.x - s.last.x, mouse.y - s.last.y) > 0.075 * innerWidth && s.imgs.length > 1) {
        s.imgs[s.idx].classList.add('is-off'); s.idx = (s.idx + 1) % s.imgs.length; s.imgs[s.idx].classList.remove('is-off'); s.last = { x: mouse.x, y: mouse.y };
      }
      const p = pos(s); s.qx(p.x); s.qy(p.y);
    });
  });
})();
