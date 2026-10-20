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
    if (isHome && !mob) open.fromTo('.cover-image', { clipPath: 'inset(0px 0px 0px)' }, { clipPath: `inset(${0.25 * innerHeight}px ${0.3 * innerWidth}px 0px)`, ease: 'fastInOut', duration: 1.2 }, '<0.1').fromTo('.cover-image-inner', { scale: 1 }, { scale: 0.8, ease: 'fastInOut', duration: 1.2 }, '<')
      // reference "reveal-content" label: the header items rise in while the cover is still settling
      .add(() => document.dispatchEvent(new Event('ha:reveal-content')), '<0.6');
    // desktop header lives inside the revealed app on the reference, so it is visible (items masked) during the load
    if (isHome && innerWidth >= 1280) gsap.set(header, { visibility: 'visible' });
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
