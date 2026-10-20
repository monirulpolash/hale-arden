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
