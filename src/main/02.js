/* ---------- Home: Selected Works, 1:1 with the reference c-works (desktop >= 1200px only, phones stay static) ----------
   Enter (top bottom -> top 10%): brackets open 90%, title tracks out to .04em, frame .4 -> 1, photo 1.75 -> 1.
   Leave (top top -> bottom top): everything reverses, frame shrinks to .2 and rises 40%, the block sinks 35rem,
   and the category/date lines slide out (and back in when you scroll up). Both scrubbed at .1. */
function selectedWorks(root) {
  if (innerWidth < 1200) return;
  $$('.works-item[data-selected]', root).forEach((el) => {
    const w = $('.works-item-wrapper', el), title = $('.works-item-title', el), bl = $('.br-l', el), br = $('.br-r', el);
    const image = $('.works-item-col .media', el), pic = $('img', image), iw = $('.works-item-body', el), meta = $$('.works-item-meta > span', el);
    const a = gsap.timeline({ defaults: { ease: 'none' } }), o = gsap.timeline({ defaults: { ease: 'none', immediateRender: false } });
    a.fromTo(bl, { xPercent: 0 }, { xPercent: -90 }, 0).fromTo(br, { xPercent: 0 }, { xPercent: 90 }, 0)
      .fromTo(title, { letterSpacing: 0 }, { letterSpacing: '0.04em' }, 0).fromTo(pic, { scale: 1.75 }, { scale: 1 }, 0)
      .fromTo(image, { scale: 0.4 }, { scale: 1 }, 0);
    o.fromTo(bl, { xPercent: -90 }, { xPercent: 0 }, 0).fromTo(br, { xPercent: 90 }, { xPercent: 0 }, 0)
      .fromTo(title, { letterSpacing: '0.04em' }, { letterSpacing: 0 }, 0).fromTo(pic, { scale: 1 }, { scale: 1.75 }, 0)
      .fromTo(w, { y: 0 }, { y: remPx(35) }, 0).fromTo(image, { scale: 1 }, { scale: 0.2 }, 0).fromTo(iw, { yPercent: 0 }, { yPercent: -40 }, 0);
    ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'top 10%', scrub: 0.1, animation: a });
    ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom top', scrub: 0.1, animation: o,
      onEnter: () => { gsap.killTweensOf(meta); gsap.to(meta, { yPercent: -100, duration: 0.8, ease: 'expo.out' }); },
      onLeaveBack: () => { gsap.killTweensOf(meta); gsap.fromTo(meta, { yPercent: 100 }, { yPercent: 0, duration: 1.1, ease: 'expo.out' }); } });
  });
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
