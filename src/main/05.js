  const rem = parseFloat(getComputedStyle(html).fontSize), mob = innerWidth < 768;
  const overlay = document.createElement('div'); overlay.className = 'intro-overlay'; document.body.appendChild(overlay);
  html.classList.add('is-intro');
  lenis.stop(); scrollTo(0, 0);
  const logoH = logo.offsetHeight, s = 1 - (4 * rem) / innerWidth;
  // Reference: desktop insets the cover to inset(25vh 30vw 0) + inner scale .8; on phones the cover stays full inside the scaled card
  gsap.set(view, { y: logoH, scale: s, transformOrigin: '50% 0' });
  if (!mob) { gsap.set('.cover-image', { clipPath: `inset(${0.25 * innerHeight}px ${0.3 * innerWidth}px 0px)` }); gsap.set('.cover-image-inner', { scale: 0.8 }); }

  gsap.set('.header .logo span', { yPercent: 120 });
  // Reference header (desktop): links, time, location and contact are masked (yPercent 100) and rise in with the content
  // (expo.out 1.2s, .05 stagger); the link group starts parked at the left margin where the logo will be, and slides to
  // its column on the first scroll together with the logo letters (fastInOut 1.2s).
  const nav = $('.header nav'), hItems = $$('.header nav a, .header .clock .time, .header .clock .loc, .header .contact-link');
  const desk = innerWidth >= 1280 && nav;
  if (desk) {
    gsap.set(hItems, { yPercent: 100 });
    gsap.set(nav, { x: -nav.getBoundingClientRect().left + $('.header .logo').getBoundingClientRect().left });
    const reveal = (d = 0) => gsap.to(hItems, { yPercent: 0, ease: 'expo.out', duration: 1.2, stagger: 0.05, delay: d });
    if (html.classList.contains('no-loader') || !$('.loader')) reveal(0.1);
    else document.addEventListener('ha:reveal-content', () => reveal(), { once: true });
  }
  if (html.classList.contains('no-loader') || !$('.loader')) gsap.fromTo('.intro-logo span', { yPercent: 100 }, { yPercent: 0, duration: 1.2, stagger: 0.05, ease: 'expo.out', delay: 0.1 });
  const go = (e) => {
    if (e && e.type === 'keydown' && !['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) return;
    ['wheel', 'touchmove', 'keydown'].forEach((t) => removeEventListener(t, go));
    const tl = gsap.timeline({ defaults: { duration: 1.2, ease: 'fastInOut' }, onComplete: () => {
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
    if (desk) tl.to(nav, { x: 0, duration: 1.2, ease: 'fastInOut' }, 0);
  };
  ready.then(() => ['wheel', 'touchmove', 'keydown'].forEach((t) => addEventListener(t, go, { passive: true })));
}

/* Reference header.setActiveLink: exact URL match marks the link and the list (others dim to .52/.24) */
function navActive() {
  let any = false;
  $$('.header nav a').forEach((a) => { const on = location.pathname === a.getAttribute('href'); a.classList.toggle('a', on); a.classList.toggle('is-active', on); any = any || on; });
  $('.header nav')?.classList.toggle('a', any);
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
  taxi.on('NAVIGATE_IN', () => navActive());
}
loaderDone = loader();
homeIntro(loaderDone);
if (!taxi) initPage(document);
navActive();
