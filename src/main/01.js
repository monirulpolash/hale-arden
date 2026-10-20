// Hale Arden template runtime: smooth scroll, loader, page transitions and scroll interactions.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { Core, Transition, Renderer } from '@unseenco/taxi';

gsap.registerPlugin(ScrollTrigger, CustomEase, Flip, SplitText);
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

    // Header colour follows the section under it (white over dark sections), like the reference's --text-color
    $$('[data-dark]', root).forEach((sec) => ScrollTrigger.create({ trigger: sec, start: () => `top-=${remPx(3)} top`, end: () => `bottom-=${remPx(3)} top`, toggleClass: { targets: '.header', className: 'is-light' } }));

    // Cover: image scales down as you leave
    const cover = $('[data-cover]', root);
    if (cover) gsap.to($('.media', cover), { scale: 1.08, yPercent: 12, ease: 'none', scrollTrigger: { trigger: cover, start: 'top top', end: 'bottom top', scrub: true } });

    // Full-width images open from an inset
    $$('[data-full] .media', root).forEach((m) => {
      gsap.fromTo(m, { clipPath: 'inset(0 var(--margin))' }, { clipPath: 'inset(0 0rem)', ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom bottom', scrub: true } });
      gsap.fromTo($('img', m), { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom bottom', scrub: true } });
    });

    selectedWorks(root);

    worksGrid(root, self);
    vision(root, self);
    processList(root);
    widget(root);

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
