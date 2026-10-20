// Hale Arden template runtime: smooth scroll, loader, page transitions and scroll interactions.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { Core, Transition, Renderer } from '@unseenco/taxi';

gsap.registerPlugin(ScrollTrigger, CustomEase, Flip);
CustomEase.create('fastInOut', 'M0,0 C0.1,0.03 0.12,0.13 0.16,0.29 0.2,0.49 0.25,0.8 0.35,0.88 0.42,0.95 0.37,1 1,1');
CustomEase.create('alpha', '.25,.46,.45,.9');

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = () => matchMedia('(min-width:1024px) and (hover:hover)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- Smooth scroll ---------- */
const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 5), smoothWheel: !reduce });
window.lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- Effects ---------- */
gsap.registerEffect({ name: 'revealTitle', extendTimeline: true, defaults: { duration: 1.2, stagger: 0.1, ease: 'expo.out' },
  effect: (els, cfg) => gsap.fromTo(els, { yPercent: 110 }, { yPercent: 0, ...cfg }) });
gsap.registerEffect({ name: 'revealContent', extendTimeline: true, defaults: { duration: 1.2, stagger: 0.08, ease: 'expo.out' },
  effect: (els, cfg) => gsap.fromTo(els, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ...cfg }) });

/* ---------- Header clock ---------- */
function clock() {
  const el = $('[data-clock]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', hour: '2-digit', minute: '2-digit' });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 30000);
}

/* ---------- Mobile menu ---------- */
function menu() {
  const btn = $('.menu-btn'), m = $('.menu'), close = $('.menu-close'), ov = $('.menu-overlay');
  const links = $$('.menu li a span');
  let open = false;
  const set = (v) => {
    open = v; btn.setAttribute('aria-expanded', v);
    if (v) {
      lenis.stop();
      gsap.timeline()
        .set(m, { visibility: 'visible' })
        .to(ov, { opacity: 0.8, duration: 0.6, ease: 'alpha' }, 0)
        .fromTo(m, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'fastInOut' }, 0)
        .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.05, ease: 'expo.out' }, 0.35);
      close.focus();
    } else {
      lenis.start();
      gsap.timeline()
        .to(m, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'fastInOut' })
        .to(ov, { opacity: 0, duration: 0.5 }, 0)
        .set(m, { visibility: 'hidden' });
      btn.focus();
    }
  };
  btn.addEventListener('click', () => set(true));
  close.addEventListener('click', () => set(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) set(false); });
  $$('.menu a').forEach((a) => a.addEventListener('click', () => open && set(false)));
}

/* ---------- Images fade in when decoded ---------- */
function images(root) {
  $$('.media img', root).forEach((img) => {
    if (img.complete && img.naturalWidth) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
  });
}

/* ---------- Page components (re-run per page) ---------- */
let ctx;
function initPage(root) {
  ctx && ctx.revert();
  images(root);
  ctx = gsap.context((self) => {
    // Reveal on scroll
    $$('[data-reveal="title"]', root).forEach((el) => {
      gsap.set(el, { visibility: 'visible' });
      const inner = $$('.line-mask > span', el);
      if (reduce) return;
      gsap.set(inner, { yPercent: 110 });
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.effects.revealTitle(inner) });
    });
    ScrollTrigger.batch($$('[data-reveal="content"]', root), { start: 'top 92%', once: true,
      onEnter: (b) => (reduce ? gsap.set(b, { autoAlpha: 1 }) : gsap.effects.revealContent(b)) });
    gsap.set($$('[data-reveal="content"]', root), { autoAlpha: 0 });
    if (reduce) { footer(); return; }

    // Parallax images (desktop only, like the reference)
    if (desktop()) $$('.media.parallax img', root).forEach((img) => {
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Cover: image scales down as you leave
    const cover = $('[data-cover]', root);
    if (cover) gsap.to($('.media', cover), { scale: 1.08, yPercent: 12, ease: 'none', scrollTrigger: { trigger: cover, start: 'top top', end: 'bottom top', scrub: true } });

    // Full-width images open from an inset
    $$('[data-full] .media', root).forEach((m) => {
      gsap.fromTo(m, { clipPath: 'inset(0 var(--margin))' }, { clipPath: 'inset(0 0rem)', ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom bottom', scrub: true } });
      gsap.fromTo($('img', m), { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom bottom', scrub: true } });
    });

    // Selected works: image grows from 0.6 as it enters
    $$('[data-selected] .media', root).forEach((m) => {
      gsap.fromTo(m, { scale: 0.7 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'top 30%', scrub: true } });
      gsap.fromTo($('img', m), { scale: 1.5 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'top 30%', scrub: true } });
    });

    // Works grid: mouse depth parallax
    const items = $$('[data-mouse]', root);
    if (items.length && desktop()) {
      const qs = items.map((el) => ({ x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'expo.out' }), y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'expo.out' }), d: +el.dataset.mouse }));
      const mm = (e) => { const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5; qs.forEach((q) => { q.x(nx * q.d * 12); q.y(ny * q.d * 12); }); };
      addEventListener('mousemove', mm); self.add(() => () => removeEventListener('mousemove', mm));
    }

    // Vision: pinned image grows to fill, titles swap
    const vision = $('[data-vision]', root);
    if (vision) {
      const titles = $$('.vision-titles > div', vision);
      const tl = gsap.timeline({ scrollTrigger: { trigger: vision, start: 'top top', end: 'bottom bottom', scrub: true } });
      tl.to($('.media', vision), { width: '100%', height: '100%', aspectRatio: 'auto', ease: 'none', duration: 1 });
      titles.forEach((t, i) => { if (i) tl.to(titles[i - 1], { autoAlpha: 0, yPercent: -60, duration: 0.3 }, 0.4 + i * 0.6).fromTo(t, { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: -50, duration: 0.3 }, 0.4 + i * 0.6); });
    }

    // Details rows draw in
    $$('[data-details] .d', root).forEach((d, i) => gsap.from(d, { autoAlpha: 0, y: 12, duration: 1, ease: 'expo.out', delay: 0.4 + i * 0.06 }));

    // Stack cards dim as the next one covers them
    $$('[data-stack] .card', root).forEach((c, i, all) => {
      if (!all[i + 1]) return;
      gsap.to(c, { opacity: 0.35, ease: 'none', scrollTrigger: { trigger: all[i + 1], start: 'top bottom', end: 'top 40%', scrub: true } });
    });
  }, root);
  ctx.add(() => footer());

  worksPage(root);
  team(root);
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/* ---------- Works page: filter, list/grid, follow image ---------- */
function worksPage(root) {
  const page = $('[data-works-page]', root);
  if (!page) return;
  const rows = $$('.works-list .row', page), cards = $$('.works-cards .card', page);
  $$('[data-filter]', page).forEach((b) => b.addEventListener('click', () => {
    $$('[data-filter]', page).forEach((x) => x.classList.toggle('is-active', x === b));
    const f = b.dataset.filter;
    const state = Flip.getState([...rows, ...cards]);
    [...rows, ...cards].forEach((el) => el.classList.toggle('is-hidden', f !== 'all' && el.dataset.cat !== f));
    Flip.from(state, { duration: 0.7, ease: 'expo.out', absolute: true, onEnter: (e) => gsap.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }), onLeave: (e) => gsap.to(e, { autoAlpha: 0, duration: 0.3 }) });
    ScrollTrigger.refresh();
  }));
  $$('[data-view]', page).forEach((b) => b.addEventListener('click', () => {
    const grid = b.dataset.view === 'grid';
    page.classList.toggle('is-grid', grid);
    $$('[data-view]', page).forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', x === b); });
    images(page);
    gsap.fromTo(grid ? cards : rows, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.8, ease: 'expo.out' });
    ScrollTrigger.refresh();
  }));
  const follow = $('.follow', page);
  if (!follow || !desktop()) return;
  const imgs = $$('img', follow);
  const qx = gsap.quickTo(follow, 'x', { duration: 0.6, ease: 'expo.out' }), qy = gsap.quickTo(follow, 'y', { duration: 0.6, ease: 'expo.out' });
  const list = $('.works-list', page);
  list.addEventListener('mousemove', (e) => { qx(e.clientX + 24); qy(e.clientY - follow.offsetHeight / 2); });
  list.addEventListener('mouseleave', () => gsap.to(follow, { scale: 0, duration: 0.6, ease: 'expo.out' }));
  rows.forEach((r) => r.addEventListener('mouseenter', () => {
    imgs.forEach((im, i) => im.classList.toggle('on', i === +r.dataset.i));
    gsap.to(follow, { scale: 1, duration: 0.8, ease: 'expo.out' });
    gsap.fromTo(imgs[+r.dataset.i], { scale: 1.4 }, { scale: 1, duration: 0.8, ease: 'expo.out' });
  }));
}

/* ---------- Studio team hover ---------- */
function team(root) {
  const t = $('[data-team]', root);
  if (!t) return;
  const rows = $$('.team-list .row', t), imgs = $$('.team-media img', t);
  const set = (i) => { rows.forEach((r, j) => r.classList.toggle('a', i === j)); imgs.forEach((im, j) => im.classList.toggle('a', i === j)); };
  rows.forEach((r, i) => { r.addEventListener('mouseenter', () => set(i)); r.addEventListener('focus', () => set(i)); });
  if (!desktop()) rows.forEach((r, i) => ScrollTrigger.create({ trigger: r, start: 'top 60%', end: 'bottom 60%', onToggle: (s) => s.isActive && set(i) }));
}

/* ---------- Footer reveal: page lifts off the fixed footer ---------- */
function footer() {
  const f = $('.footer'), space = $('[data-taxi-view] .footer-space'), view = $('[data-taxi-view] .view');
  if (!f || !space) return;
  f.classList.remove('on');
  ScrollTrigger.create({ trigger: space, start: 'top bottom', end: 'bottom bottom', onUpdate: (s) => f.classList.toggle('on', s.progress > 0), onLeaveBack: () => f.classList.remove('on'), onLeave: () => f.classList.add('on') });
  if (reduce) return;
  gsap.fromTo(f.children, { y: '20vh' }, { y: 0, ease: 'none', scrollTrigger: { trigger: space, start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.fromTo(view, { scale: 1 }, { scale: 0.96, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: { trigger: space, start: 'top bottom', end: 'bottom bottom', scrub: true } });
}

/* ---------- Loader (first visit per session) ---------- */
function loader() {
  const l = $('.loader');
  if (document.documentElement.classList.contains('no-loader') || !l) return Promise.resolve();
  lenis.stop();
  return new Promise((res) => {
    const letters = $$('.word span', l), counter = $('.counter', l), c = { v: 0 };
    gsap.timeline({ onComplete: () => { sessionStorage.setItem('ha-loaded', '1'); l.remove(); lenis.start(); res(); } })
      .fromTo(letters, { yPercent: (i) => (i % 2 ? -110 : 110) }, { yPercent: 0, duration: 1.6, stagger: 0.0475, ease: 'expo.out' })
      .to(c, { v: 100, duration: 2.2, ease: 'power2.inOut', onUpdate: () => { counter.textContent = Math.round(c.v) + '%'; } }, 0)
      .to(l, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'fastInOut' }, '>-0.1')
      .fromTo('[data-cover] .media', { clipPath: 'inset(25% 30% 0)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0)', scale: 1, duration: 1.6, ease: 'fastInOut' }, '<');
  });
}

/* ---------- Page transition ---------- */
class Lift extends Transition {
  onLeave({ from, done }) {
    lenis.stop();
    gsap.timeline({ onComplete: done })
      .to('.transition-overlay', { opacity: 0.85, duration: 0.6, ease: 'alpha' }, 0)
      .to($('.view', from), { y: '-2rem', scale: 0.96, transformOrigin: '50% 0', duration: 0.6, ease: 'fastInOut' }, 0)
      .to('.header', { autoAlpha: 0, duration: 0.3 }, 0);
  }
  onEnter({ to, done }) {
    window.scrollTo(0, 0); lenis.scrollTo(0, { immediate: true });
    gsap.set(to, { position: 'fixed', inset: 0, zIndex: 3, y: '100vh', clipPath: 'inset(30% 40% 0)' });
    gsap.timeline({ onComplete: () => { gsap.set(to, { clearProps: 'all' }); gsap.set('.transition-overlay', { opacity: 0 }); lenis.start(); done(); } })
      .to(to, { y: 0, clipPath: 'inset(0% 0% 0)', duration: 1.2, ease: 'fastInOut' })
      .to('.header', { autoAlpha: 1, duration: 0.4 }, '-=0.3');
  }
}
class Page extends Renderer {
  initialLoad() { super.initialLoad(); initPage(this.content); }
  onEnter() { initPage(this.content); }
  onEnterCompleted() { ScrollTrigger.refresh(); }
}

/* ---------- Boot ---------- */
clock();
menu();
const taxi = reduce ? null : new Core({ renderers: { default: Page, home: Page, works: Page, work: Page, studio: Page, process: Page, contact: Page }, transitions: { default: Lift }, links: 'a:not([target]):not([href^=\\#]):not([href^=mailto]):not([href^=tel]):not([data-taxi-ignore])', removeOldContent: true, allowInterruption: false });
if (taxi) {
  taxi.on('NAVIGATE_IN', ({ to }) => { $$('.header nav a').forEach((a) => a.classList.toggle('is-active', location.pathname.startsWith(a.getAttribute('href')))); });
}
loader();
if (!taxi) initPage(document);
$$('.header nav a').forEach((a) => a.classList.toggle('is-active', location.pathname.startsWith(a.getAttribute('href'))));
