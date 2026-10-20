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
    $$('[data-dark]', root).forEach((sec) => ScrollTrigger.create({ trigger: sec, start: () => `top ${$('.header').offsetHeight}`, end: () => `bottom ${$('.header').offsetHeight}`, toggleClass: { targets: '.header', className: 'is-light' } }));

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


/* ---------- Home: "All Work" sticky title + scattered image grid ---------- */
const xl = () => innerWidth >= 1280;
const remPx = (r) => r * parseFloat(getComputedStyle(document.documentElement).fontSize);
function worksGrid(root, self) {
  const sec = $('.wg', root);
  if (!sec) return;
  const link = $('.wg-link', sec), H = innerHeight;
  gsap.fromTo(link, { scale: 1 }, { scale: xl() ? 0.6 : innerWidth >= 768 ? 0.66 : 0.5, ease: 'none', scrollTrigger: { trigger: sec, start: 'top 35%', end: 'top -10%', scrub: 0.4 } });
  const vis = $('.vision', root);
  if (vis) gsap.to(link, { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: vis, start: () => `top+=${H * 0.5} top`, end: () => `top+=${H * 0.75} top`, scrub: true } });
  const its = $$('.wg-it', sec);
  its.forEach((it) => {
    const d = it.dataset.size === 'small' ? 0.25 : it.dataset.size === 'medium' ? 0.15 : 0;
    if (d) gsap.fromTo(it, { y: H * d }, { y: -H * d, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.wg-cell', sec).slice(0, 5).forEach((c) => gsap.from(c, { opacity: 0, duration: 1.2, ease: 'alpha', scrollTrigger: { trigger: c, start: 'top 95%', once: true } }));
  if (!desktop()) return;
  const qs = its.map((it) => { const m = $('.media', it), d = it.dataset.size === 'large' ? 60 : it.dataset.size === 'medium' ? 30 : 20; return { x: gsap.quickTo(m, 'x', { duration: 1.1, ease: 'power3.out' }), y: gsap.quickTo(m, 'y', { duration: 1.1, ease: 'power3.out' }), d }; });
  const mm = (e) => { const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5; qs.forEach((q) => { q.x(-nx * q.d); q.y(-ny * q.d); }); };
  addEventListener('mousemove', mm); self.add(() => () => removeEventListener('mousemove', mm));
}

/* ---------- Home: Vision (image grows to full screen, titles slide one by one) ---------- */
function vision(root, self) {
  const sec = $('[data-vision]', root);
  if (!sec) return;
  const H = innerHeight, W = innerWidth, offset = 0.75, header = $('.header');
  const image = $('.vision-image', sec), wrap = $('.vision-image-wrapper', sec), scroll = $('.vision-image-scroll', sec), prlx = $('.vision-image-parallax', sec);
  const titlesWrap = $('.vision-titles', sec), contentsWrap = $('.vision-contents', sec), titles = $$('.vision-title', sec), contents = $$('.vision-content', sec);
  const num = $('.vision-number', sec), numText = $('.vision-number-text', sec), sup = $('.vision-suptitle', sec), supText = $('.vision-suptitle-text', sec), line = $('.vision-line', sec);
  const grid = $$('.wg-img', root);
  const splits = contents.map((c) => SplitText.create(c, { type: 'lines', mask: 'lines' }));
  const numChars = SplitText.create(numText, { type: 'chars' });
  self.add(() => () => { splits.forEach((x) => x.revert()); numChars.revert(); });
  gsap.set(titles, { yPercent: 100 });
  splits.forEach((x) => gsap.set(x.lines, { yPercent: 100 }));
  gsap.set(supText, { yPercent: 100 }); gsap.set(numChars.chars, { yPercent: 100 });
  gsap.set([titlesWrap, contentsWrap], { autoAlpha: 0 });
  gsap.set(num, { x: -num.getBoundingClientRect().left + W / 2 - num.offsetWidth - remPx(0.8) });
  gsap.set(sup, { x: -sup.getBoundingClientRect().left + W / 2 + remPx(0.8) });
  gsap.set(line, { scaleX: 0, opacity: 0 });
  const n = W > H ? (W + 4) / image.offsetWidth : (H + 4) / image.offsetHeight;
  const left = [], right = [];
  grid.forEach((g) => { const r = g.getBoundingClientRect(); (r.left + r.width / 2 < W / 2 ? left : right).push(g); });
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.to(image, { scale: n, y: -(H - wrap.offsetHeight) / 2, transformOrigin: 'top' }, 0)
    .fromTo(scroll, { scale: 1.45 }, { scale: 1 }, 0)
    .fromTo(grid, { opacity: 1 }, { opacity: 0.1, duration: xl() ? 0.4 : 0.1 }, 0)
    .to([num, sup], { x: 0 }, 0)
    .to(line, { scaleX: 1 }, 0)
    .to(line, { opacity: 1, duration: 0.2 }, 0.2);
  if (xl()) tl.fromTo(left, { x: 0 }, { x: -remPx(20), duration: 0.5 }, 0).fromTo(right, { x: 0 }, { x: remPx(20), duration: 0.5 }, 0);
  let titleOn = false, cur = 0, stl;
  const showSub = (on) => { stl && stl.kill(); stl = gsap.timeline({ defaults: { ease: 'expo.out', duration: on ? 1.1 : 0.6 } }).to(supText, { yPercent: on ? 0 : 100 }).to(numChars.chars, { yPercent: on ? 0 : 100, stagger: on ? 0.065 : 0 }, '<'); };
  const show = () => { gsap.killTweensOf([titlesWrap, contentsWrap, titles, splits[0].lines]); gsap.timeline().set(titles, { yPercent: 100 }).set([titlesWrap, contentsWrap], { autoAlpha: 1 }).to(titles, { yPercent: 0, ease: 'expo.out', duration: 1.2, stagger: 0.1 }).fromTo(splits[cur].lines, { yPercent: 100 }, { yPercent: 0, ease: 'expo.out', duration: 1.1, stagger: 0.075 }, '<20%'); };
  const hide = () => { gsap.killTweensOf([titlesWrap, contentsWrap]); gsap.to([titlesWrap, contentsWrap], { autoAlpha: 0, ease: 'power2.out', duration: 0.25 }); };
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: () => `top+=${H} top`, scrub: 0.4, animation: tl,
    onUpdate: (st) => { if (st.progress > 0.5 && st.direction > 0 && !titleOn) { titleOn = true; showSub(true); } else if (st.progress < 0.5 && st.direction < 0 && titleOn) { titleOn = false; showSub(false); } },
    onLeave: show, onEnterBack: hide });
  ScrollTrigger.create({ trigger: sec, start: () => `top+=${H} top`, end: 'bottom bottom', scrub: true, animation: gsap.to(scroll, { yPercent: -25, ease: 'none' }) });
  ScrollTrigger.create({ trigger: sec, start: 'bottom bottom', end: 'bottom top', scrub: true, animation: gsap.to(prlx, { yPercent: 10, ease: 'none' }) });
  ScrollTrigger.create({ trigger: sec, start: () => `top+=${H - remPx(3)} top`, end: () => `bottom-=${remPx(3)} top`, toggleClass: { targets: header, className: 'is-light' } });
  const animate = (i) => {
    if (i === cur) return;
    const prev = cur; cur = i;
    gsap.killTweensOf([titlesWrap, splits[i].lines]); gsap.killTweensOf(contents[i], 'autoAlpha');
    const t = gsap.timeline();
    titles.forEach((el, j) => t.to(el, { opacity: j === i ? 1 : 0.32, ease: 'alpha', duration: 0.35 }, 0));
    const x = titles.slice(0, i).reduce((a, el) => a + el.offsetWidth, 0);
    t.to(titlesWrap, { x: -x, ease: 'fastInOut', duration: 1.2 }, 0)
      .to(contents[prev], { autoAlpha: 0, ease: 'alpha', duration: 0.25 }, 0)
      .set(splits[i].lines, { yPercent: 100 }, '<50%').set(contents[i], { autoAlpha: 1 }, '<')
      .fromTo(splits[i].lines, { yPercent: 100 }, { yPercent: 0, ease: 'expo.out', duration: 1.1, stagger: 0.075 }, '<');
  };
  contents.forEach((c, i) => i && gsap.set(c, { autoAlpha: 0 }));
  const track = $('.vision-track', sec);
  titles.forEach((_, i) => ScrollTrigger.create({ trigger: track, start: () => `top+=${H + H * offset * i} top`, end: () => `top+=${H + H * offset * (i + 1)} top`, onEnter: () => animate(i), onEnterBack: () => animate(i) }));
}

/* ---------- Home: Process sentence list ---------- */
function processList(root) {
  const sec = $('[data-process]', root);
  if (!sec) return;
  const items = $$('.process-item', sec), imgs = $$('.process-image', sec);
  const set = (i) => { items.forEach((el, j) => el.classList.toggle('a', i === j)); imgs.forEach((el, j) => el.classList.toggle('a', i === j)); };
  items.forEach((el, i) => { el.addEventListener('mouseenter', () => set(i)); el.addEventListener('focus', () => set(i)); el.addEventListener('click', () => set(i)); });
}

/* ---------- Discover widget: sticky pill that names the block in view ---------- */
function widget(root) {
  const host = $('.widget-sticky', root);
  if (!host) return;
  const a = $('.widget', host), box = $('.widget-title', host), ghost = $('.widget-ghost', host), list = $('.widget-titles', host), blocks = $$('[data-widget]', root);
  if (!blocks.length) return;
  list.innerHTML = blocks.map((b) => `<span class="wt">${b.dataset.widget.replace(/[<&>]/g, '')}</span>`).join('');
  const ts = $$('.wt', list);
  gsap.set(ts, { yPercent: 100 }); gsap.set(a, { yPercent: 200 });
  let cur = -1, shown = false;
  const fit = (i) => { ghost.textContent = blocks[i].dataset.widget; return ghost.offsetWidth; };
  const go = (i) => {
    if (i === cur) return;
    const prev = cur; cur = i;
    a.href = blocks[i].dataset.widgetUrl || '/';
    const w0 = box.offsetWidth, w1 = fit(i);
    gsap.fromTo(box, { width: w0 }, { width: w1, duration: 0.8, ease: 'expo.out', onComplete: () => gsap.set(box, { clearProps: 'width' }) });
    if (prev > -1) gsap.to(ts[prev], { yPercent: i > prev ? -100 : 100, duration: 0.8, ease: 'expo.out' });
    gsap.fromTo(ts[i], { yPercent: prev > i ? -100 : 100 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' });
    gsap.fromTo(a, { scale: 0.95 }, { scale: 1, duration: 0.8, ease: 'back.out(2)' });
  };
  const vis = (on) => { if (on === shown) return; shown = on; gsap.to(a, { yPercent: on ? 0 : 200, duration: on ? 1 : 0.6, ease: on ? 'expo.out' : 'power3.in' }); };
  blocks.forEach((b, i) => ScrollTrigger.create({ trigger: b, start: () => `top+=${(+b.dataset.widgetOffset || 0) * innerHeight} 70%`, end: () => (blocks[i + 1] ? `top+=${(+blocks[i + 1].dataset.widgetOffset || 0) * innerHeight} 70%` : 'bottom 70%'),
    endTrigger: blocks[i + 1] || b,
    onToggle: (st) => { if (st.isActive) { go(i); vis(true); } } }));
  ScrollTrigger.create({ trigger: blocks[0], start: 'top 70%', onLeaveBack: () => vis(false) });
  const last = blocks[blocks.length - 1];
  ScrollTrigger.create({ trigger: last, start: 'bottom 70%', onEnter: () => vis(false), onLeaveBack: () => vis(true) });
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

/* ---------- Footer: page shrinks a little as the black wordmark panel slides up from under it ---------- */
function footer() {
  const top = $('[data-taxi-view] .footer-top') || $('.footer-top'), view = $('[data-taxi-view] .view') || $('.view');
  if (!top) return;
  const fb = $('.footer-bottom', view), overlay = $('.footer-bottom-overlay', view), inner = $('.footer-bottom-inner', view), header = $('.header');
  $$('[data-top]', view).forEach((b) => b.addEventListener('click', () => lenis.scrollTo(0, { force: true })));
  if (reduce) return;
  const mob = innerWidth < 768, k = remPx(3) / innerWidth;
  gsap.set(inner, { yPercent: 40 }); gsap.set(overlay, { opacity: 0.85 });
  const tl = gsap.timeline({ defaults: { ease: 'none' } })
    .to(view, { scale: 1 - k, transformOrigin: '50% 100%' }, 0)
    .to(fb, { scale: 1 + k, transformOrigin: '50% 100%' }, 0)
    .to(overlay, { opacity: 0 }, 0)
    .to(inner, { yPercent: 0 }, 0)
    .to(header, { y: innerWidth < 1280 ? -header.offsetHeight : -remPx(2) }, 0);
  ScrollTrigger.create({ trigger: top, start: 'bottom bottom', end: () => `bottom bottom-=${fb.offsetHeight}px`, scrub: mob ? 0.6 : true, animation: tl,
    onLeaveBack: () => { gsap.set(header, { clearProps: 'y' }); } });
  if (mob) ScrollTrigger.create({ trigger: top, start: 'bottom bottom', onEnter: () => gsap.to(header, { autoAlpha: 0, duration: 0.25 }), onLeaveBack: () => gsap.to(header, { autoAlpha: 1, duration: 0.35 }) });
}

/* ---------- Loader (first visit per session): black screen, wordmark rises, counter, page opens from the bottom ---------- */
let loaderDone = Promise.resolve();
function loader() {
  const l = $('.loader'), html = document.documentElement;
  if (html.classList.contains('no-loader') || !l) { l && l.remove(); return Promise.resolve(); }
  html.classList.add('is-loading');
  const view = $('.view'), logo = $('.intro-logo'), header = $('.header'), lines = $$('.lm > span', l), counter = $('.loader-counter', l), mob = innerWidth < 768;
  const isHome = !!$('[data-cover]');
  const off = Math.max($('.loader-top', l).offsetHeight + remPx(1), (innerHeight - logo.offsetHeight) / 2 - logo.getBoundingClientRect().top);
  lenis.stop();
  gsap.set(view, { clipPath: mob ? `inset(${1.1 * innerHeight}px ${0.1 * innerWidth}px 0px)` : `inset(${innerHeight}px ${0.3 * innerWidth}px 0px)` });
  gsap.set(logo, { y: off }); gsap.set('.intro-logo span', { yPercent: 100 }); gsap.set(lines, { yPercent: 100 });
  if (!isHome) gsap.set(header, { autoAlpha: 0 });
  return new Promise((res) => {
    const c = { v: 0 };
    const open = gsap.timeline({ paused: true, onComplete: () => { sessionStorage.setItem('ha-loaded', '1'); l.remove(); html.classList.remove('is-loading'); gsap.set(view, { clearProps: 'clipPath' }); if (!isHome) { gsap.set(logo, { clearProps: 'all' }); lenis.start(); } res(); } })
      .to(lines, { yPercent: -100, ease: 'fastInOut', duration: 1.2, stagger: 0.05 }, 0)
      .to(logo, { y: 0, ease: 'fastInOut', duration: 1.7 }, mob ? 0.3 : 0.1)
      .to(view, { clipPath: 'inset(0px 0px 0px)', ease: 'fastInOut', duration: 1.7 }, '<');
    if (isHome && !mob) open.fromTo('.cover-image', { clipPath: 'inset(0px 0px 0px)' }, { clipPath: `inset(${0.25 * innerHeight}px ${0.3 * innerWidth}px 0px)`, ease: 'fastInOut', duration: 1.2 }, '<0.1').fromTo('.cover-image-inner', { scale: 1 }, { scale: 0.8, ease: 'fastInOut', duration: 1.2 }, '<');
    if (!isHome) open.to('.intro-logo span', { yPercent: -100, ease: 'fastInOut', duration: 1, stagger: 0.03 }, 0.3).to(header, { autoAlpha: 1, duration: 0.4 }, '>-0.3');
    gsap.timeline({ delay: 0.25 })
      .to($('.loader-panel', l), { autoAlpha: 0, ease: 'alpha', duration: 0.35 })
      .to('.intro-logo span', { yPercent: 0, ease: 'expo.out', duration: 2, stagger: 0.0475 }, '<30%')
      .to(lines, { yPercent: 0, ease: 'expo.out', duration: 1.2, stagger: 0.075 }, '<')
      .to(c, { v: 100, duration: 3, ease: 'fastInOut', onUpdate: () => { counter.textContent = Math.round(c.v) + '%'; } }, '<0.2')
      .call(() => open.play(), [], '>-0.4');
  });
}

/* ---------- Home intro (first load): small inset cover + big wordmark, expands on first scroll ---------- */
function homeIntro(ready = Promise.resolve()) {
  const cover = $('[data-cover]');
  if (!cover || reduce) return;
  const html = document.documentElement, view = $('[data-taxi]') || $('.view'), logo = $('.intro-logo'), header = $('.header');
  const rem = parseFloat(getComputedStyle(html).fontSize), mob = innerWidth < 768;
  const overlay = document.createElement('div'); overlay.className = 'intro-overlay'; document.body.appendChild(overlay);
  html.classList.add('is-intro');
  lenis.stop(); scrollTo(0, 0);
  const logoH = logo.offsetHeight, s = 1 - (4 * rem) / innerWidth;
  // Reference: desktop insets the cover to inset(25vh 30vw 0) + inner scale .8; on phones the cover stays full inside the scaled card
  gsap.set(view, { y: logoH, scale: s, transformOrigin: '50% 0' });
  if (!mob) { gsap.set('.cover-image', { clipPath: `inset(${0.25 * innerHeight}px ${0.3 * innerWidth}px 0px)` }); gsap.set('.cover-image-inner', { scale: 0.8 }); }

  gsap.set('.header .logo span', { yPercent: 110 });
  if (html.classList.contains('no-loader') || !$('.loader')) gsap.fromTo('.intro-logo span', { yPercent: 100 }, { yPercent: 0, duration: 1.2, stagger: 0.05, ease: 'expo.out', delay: 0.1 });
  const go = (e) => {
    if (e && e.type === 'keydown' && !['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) return;
    ['wheel', 'touchmove', 'keydown'].forEach((t) => removeEventListener(t, go));
    gsap.timeline({ defaults: { duration: 1.2, ease: 'fastInOut' }, onComplete: () => {
      html.classList.remove('is-intro'); gsap.set(view, { clearProps: 'transform' }); overlay.remove(); scrollTo(0, 0); lenis.scrollTo(0, { immediate: true, force: true }); lenis.start(); ScrollTrigger.refresh();
    } })
      .to(view, { y: 0, scale: 1 }, 0)
      .to('.cover-image', { clipPath: 'inset(0px 0px 0px)' }, 0)
      .to('.cover-image-inner', { scale: 1 }, 0)
      .to(overlay, { opacity: 0.9, duration: 0.6, ease: 'none' }, 0)
      .to(logo, { y: -(mob ? 0.06 : 0.12) * innerHeight }, 0)
      .to('.cover-title-dark', { y: 15 * rem }, 0)
      .to('.cover-bottom-dark', { y: 16 * rem }, 0)
      .add(() => header.classList.add('is-light'), 0.34)
      .to('.header .logo span', { yPercent: 0, duration: 1, stagger: 0.02 }, 0);
  };
  ready.then(() => ['wheel', 'touchmove', 'keydown'].forEach((t) => addEventListener(t, go, { passive: true })));
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
loaderDone = loader();
homeIntro(loaderDone);
if (!taxi) initPage(document);
$$('.header nav a').forEach((a) => a.classList.toggle('is-active', location.pathname.startsWith(a.getAttribute('href'))));
