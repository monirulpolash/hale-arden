// Studio page behaviour, ported from the timings of telhaclarke.com.au/studio/ (CoverAbout, Title, Subtitle,
// Team, ValuesVision, ParallaxImage). Original code. Runs on first load and after every taxi page swap.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
const EXPO = 'expo.out';
const FIO = 'fastInOut';
const TRIGGER_OFFSET = 0.25;
const CARD_OFFSET = 0.75;
const isMobile = () => window.innerWidth < 1200; // same cut-off as the reference (w < 1200)
const isXL = () => window.matchMedia('(min-width:1280px)').matches; // pinned values/vision layout (xl)
const vh = () => window.innerHeight;

let current = null;

// split into masked lines: .st-ln > span
function splitLines(el) {
  const s = new SplitText(el, { type: 'lines', linesClass: 'st-l' });
  const inner = s.lines.map((l) => { const w = document.createElement('span'); w.className = 'st-ln'; l.parentNode.insertBefore(w, l); w.appendChild(l); return l; });
  el.classList.add('st-ready');
  return { split: s, lines: inner };
}

function loaderDone() {
  return new Promise((res) => {
    const h = document.documentElement;
    if (!h.classList.contains('is-loading')) return res(false);
    const mo = new MutationObserver(() => { if (!h.classList.contains('is-loading')) { mo.disconnect(); res(true); } });
    mo.observe(h, { attributes: true, attributeFilter: ['class'] });
  });
}

function initStudio(root, firstLoad) {
  const ctx = gsap.context(() => {});
  const cleanups = [];
  const add = (fn) => ctx.add(fn);

  // lazy image fade, as .image.lazy -> loaded on the reference
  root.querySelectorAll('.st-img').forEach((im) => { const on = () => im.classList.add('ld'); if (im.complete && im.naturalWidth) on(); else im.addEventListener('load', on, { once: true }); });

  // SUBTITLES: chars yPercent 200 -> 0 (stagger .02), label slides from the number's place (fastInOut 1.3), number chars xPercent -100 -> 0 (stagger .1)
  root.querySelectorAll('[data-st-sub]').forEach((el) => add(() => {
    const n = el.querySelector('.n'), t = el.querySelector('.t');
    const sn = new SplitText(n, { type: 'chars', charsClass: 'c' }), stx = new SplitText(t, { type: 'chars', charsClass: 'c' });
    gsap.set(stx.chars, { yPercent: 200 });
    gsap.set(sn.chars, { xPercent: -100 });
    gsap.set(t, { x: -(t.getBoundingClientRect().left - el.getBoundingClientRect().left) });
    const tl = gsap.timeline({ defaults: { ease: EXPO, duration: 1.2 } });
    tl.to(stx.chars, { yPercent: 0, stagger: 0.02 }).to(t, { x: 0, ease: FIO, duration: 1.3 }, '<40%').to(sn.chars, { xPercent: 0, stagger: 0.1 }, '<10%');
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, animation: tl });
  }));

  // COVER: image clip inset(50% 35% 0) -> 0 + inner scale .95 -> 1 (fastInOut 1.35) on enter; title lines then content lines (<25%)
  const cover = root.querySelector('[data-st-cover]');
  if (cover) add(() => {
    const media = cover.querySelector('[data-st-cover-media]'), inner = cover.querySelector('[data-st-parallax]');
    const title = splitLines(cover.querySelector('[data-st-title]')), content = splitLines(cover.querySelector('[data-st-content]'));
    gsap.set([title.lines, content.lines], { yPercent: 100 });
    gsap.set(inner, { scale: 0.95 });
    gsap.set(media, { clipPath: isMobile() ? 'inset(90% 35% 0%)' : 'inset(50% 35% 0%)' });
    const start = (delay) => gsap.timeline({ defaults: { delay, ease: FIO, duration: 1.35 } }).to(media, { clipPath: 'inset(0% 0% 0%)' }).to(inner, { scale: 1 }, '<');
    const appear = () => gsap.timeline({ defaults: { ease: EXPO, duration: 1.2 } }).to(title.lines, { yPercent: 0, stagger: 0.1 }).to(content.lines, { yPercent: 0, stagger: 0.08 }, '<25%');
    loaderDone().then((waited) => {
      if (!root.isConnected) return;
      start(firstLoad && !isMobile() ? 0.2 : 0);
      gsap.delayedCall(waited || !firstLoad ? 0.35 : 0.2, appear);
    });
    // ParallaxImage (force 5): desktop only, image taller by h/5*(min(w,1440)/1440), y -t/2 -> t/2 scrubbed
    if (!isMobile()) {
      const im = inner.querySelector('img');
      const tv = () => media.getBoundingClientRect().height / 5 * (Math.min(window.innerWidth, 1440) / 1440);
      const setH = () => { const t = tv(); im.style.height = `calc(100% + ${t}px)`; im.style.top = `-${t / 2}px`; };
      setH();
      const top = media.getBoundingClientRect().top + window.scrollY;
      gsap.fromTo(im, { y: () => -tv() / 2 }, { y: () => tv() / 2, ease: 'none', scrollTrigger: { trigger: media, start: () => (top < vh() ? `clamp(top-=${top}px top)` : 'top bottom'), scrub: true, invalidateOnRefresh: true, onRefresh: setH } });
    }
  });

  // QUOTE (c-title): lines yPercent 100 -> 0, revealTitle (expo.out 1.2 stagger .1) at top 90%, once
  root.querySelectorAll('[data-st-on-scroll]').forEach((el) => add(() => {
    const sp = el.querySelector('.st-quote-sp');
    const s = splitLines(el);
    if (sp && s.lines[0]) s.lines[0].prepend(sp);
    gsap.set(s.lines, { yPercent: 100 });
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, animation: gsap.to(s.lines, { yPercent: 0, ease: EXPO, duration: 1.2, stagger: 0.1, paused: true }) });
  }));

  // TEAM: hover (desktop) or crossing 60% of the screen (mobile) switches name, portrait and role; portrait sticks centred
  const team = root.querySelector('[data-st-team]');
  if (team) {
    const items = [...team.querySelectorAll('.st-team-item')], imgs = [...team.querySelectorAll('.st-team-image')], jobs = [...team.querySelectorAll('.st-team-job')];
    const sticky = team.querySelector('[data-st-team-sticky]');
    const set = (k) => items.forEach((it, i) => { it.classList.toggle('a', i === k); imgs[i].classList.toggle('a', i === k); jobs[i].classList.toggle('a', i === k); });
    items.forEach((it, i) => { const fn = () => { if (!isMobile()) set(i); }; it.addEventListener('mouseenter', fn); cleanups.push(() => it.removeEventListener('mouseenter', fn)); });
    const setSticky = () => { sticky.style.top = `${(vh() - sticky.getBoundingClientRect().height) / 2}px`; };
    setSticky();
    if (isMobile()) add(() => items.forEach((it, i) => ScrollTrigger.create({ trigger: it, start: 'top 60%', end: 'bottom 60%', onEnter: () => set(i), onEnterBack: () => set(i) })));
    window.addEventListener('resize', setSticky); cleanups.push(() => window.removeEventListener('resize', setSticky));
  }

  // VALUES -> VISION (xl): values image shrinks into the vision image slot, cards swap every .75 screen
  const vv = root.querySelector('[data-st-vv]');
  if (vv && isXL()) add(() => {
    const values = vv.querySelector('.st-values'), vImg = vv.querySelector('.st-values-image'), vInner = vv.querySelector('.st-values-inner');
    const vSub = vv.querySelector('.st-values-sub'), vContent = splitLines(vv.querySelector('[data-st-values-content]'));
    const wrap = vv.querySelector('[data-st-vision-wrap]'), media = vv.querySelector('[data-st-vision-media]'), visSub = vv.querySelector('[data-st-vision-sub]');
    const groups = [...vv.querySelectorAll('.st-vgroup')];
    const cards = [...vv.querySelectorAll('[data-st-vcard]')].map((el, i) => ({
      el, title: el.querySelector('.st-vcard-t .st-ln>span'), content: splitLines(el.querySelector('.st-vcard-c')).lines,
      group: i ? groups[i - 1] : null, overlay: i ? groups[i - 1].querySelector('.st-voverlay') : null,
      image: i ? groups[i - 1].querySelector('.st-vimage') : null, mask: i ? groups[i - 1].querySelector('.st-vmask') : null,
    }));
    wrap.style.height = `${Math.max(...cards.map((c) => c.el.getBoundingClientRect().height))}px`;
    gsap.set(visSub, { autoAlpha: 0 });
    gsap.set(vInner, { scale: 1.2 });
    cards.forEach((c) => { gsap.set([c.title, ...c.content], { autoAlpha: 0, yPercent: 100 }); if (c.image) { gsap.set(c.image, { yPercent: 100 }); gsap.set(c.mask, { yPercent: -100 }); gsap.set(c.mask.firstElementChild, { scale: 1.15 }); } });
    vv.classList.add('st-ok');
    const r = values.getBoundingClientRect(), a = media.getBoundingClientRect();
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.fromTo(vImg, { clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: `inset(${a.top - r.top}px ${r.right - a.right}px ${r.bottom - a.bottom}px ${a.left - r.left}px)` })
      .to(vInner, { x: a.left + a.width / 2 - window.innerWidth / 2, scale: 1 }, 0);
    const fadeOut = [vSub, ...vContent.lines];
    ScrollTrigger.create({ trigger: values, start: () => `top+=${vh() * TRIGGER_OFFSET}px top`, end: () => `top+=${vh() * (1 + TRIGGER_OFFSET)}px top`, scrub: 0.6, animation: tl,
      onEnter: () => { gsap.killTweensOf(fadeOut); gsap.to(fadeOut, { autoAlpha: 0, ease: 'power2.out', duration: 0.35 }); },
      onLeaveBack: () => { gsap.killTweensOf(fadeOut); gsap.to(vSub, { autoAlpha: 1, ease: 'alpha', duration: 0.4 }); gsap.fromTo(vContent.lines, { autoAlpha: 1, yPercent: 100 }, { yPercent: 0, ease: EXPO, duration: 1.2, stagger: 0.05 }); } });
    // parallax in: values image yPercent -15 -> 0 while the section scrolls up to the top
    ScrollTrigger.create({ trigger: values, start: 'top bottom', end: 'top top', scrub: true, animation: gsap.fromTo(vInner, { yPercent: -15 }, { yPercent: 0, ease: 'none', immediateRender: false }) });
    // parallax out: last image group drifts 15% as the section leaves
    const last = cards[cards.length - 1].group;
    if (last) ScrollTrigger.create({ trigger: vv, start: 'bottom bottom', end: 'bottom top', scrub: true, animation: gsap.to(last, { yPercent: 15, ease: 'none' }) });
    let idx = -1;
    const show = (k, dir) => {
      const c = cards[k], prev = dir > 0 ? cards[k - 1] : cards[k + 1];
      gsap.killTweensOf([c.title, ...c.content]);
      if (prev && prev.anim) prev.anim.kill();
      if (c.anim) c.anim.kill();
      const t = gsap.timeline({ defaults: { ease: EXPO, duration: 1.2 } });
      if (prev) gsap.to([prev.title, ...prev.content], { autoAlpha: 0, ease: 'power2.out', duration: 0.25 });
      if (k === 0) { gsap.killTweensOf(visSub); t.to(visSub, { autoAlpha: 1, ease: 'power2.out', duration: 0.35 }, 0); }
      t.fromTo(c.title, { yPercent: 100, autoAlpha: 1 }, { yPercent: 0 }, prev ? 0.15 : 0).fromTo(c.content, { yPercent: 100, autoAlpha: 1 }, { yPercent: 0, stagger: 0.05 }, '<15%');
      c.anim = t;
    };
    const base = () => vh() * (1 + TRIGGER_OFFSET);
    cards.forEach((c, i) => {
      if (c.image) {
        const t = gsap.timeline({ defaults: { ease: 'none' } });
        t.to(c.image, { yPercent: 0 }).to(c.mask, { yPercent: 0 }, 0).fromTo(c.mask.firstElementChild, { scale: 1.15 }, { scale: 1 }, 0).to(c.overlay, { opacity: 0.9 }, 0);
        ScrollTrigger.create({ trigger: values, start: () => `top+=${base() + vh() * CARD_OFFSET * i - vh() * CARD_OFFSET / 2}px top`, end: () => `+=${vh() * CARD_OFFSET}px`, scrub: 0.6, animation: t });
      }
      ScrollTrigger.create({ trigger: values, start: () => `top+=${base() + vh() * CARD_OFFSET * i}px top`, end: () => `+=${vh() * CARD_OFFSET}px`,
        onEnter: () => { idx = i; show(i, 1); },
        onLeaveBack: () => { if (i === 0) { if (c.anim) c.anim.kill(); gsap.killTweensOf(visSub); gsap.to(visSub, { autoAlpha: 0, ease: 'power2.out', duration: 0.25 }); cards.forEach((d) => gsap.to([d.title, ...d.content], { autoAlpha: 0, ease: 'power2.out', duration: 0.25 })); idx = -1; } },
        onEnterBack: () => { if (idx !== i) { idx = i; show(i, -1); } } });
    });
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());
  // rebuild once on breakpoint change (mobile <-> desktop, xl in/out), like the reference screenChange()
  const mode = () => `${isMobile()}|${isXL()}`;
  let m = mode(), rt;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { if (mode() !== m && root.isConnected) { destroy(); current = initStudio(root, false); } }, 250); };
  window.addEventListener('resize', onResize);
  const destroy = () => { window.removeEventListener('resize', onResize); cleanups.forEach((f) => f()); ctx.revert(); root.querySelectorAll('.st-ready,.st-ok').forEach((e) => e.classList.remove('st-ready', 'st-ok')); };
  return { root, destroy };
}

function check(firstLoad) {
  const root = document.querySelector('[data-studio]');
  if (current && current.root !== root) { current.destroy(); current = null; }
  if (root && !current) current = initStudio(root, firstLoad);
}

if (typeof document !== 'undefined') {
  const start = () => {
    check(true);
    const host = document.querySelector('[data-taxi]') || document.body;
    new MutationObserver(() => check(false)).observe(host, { childList: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}
