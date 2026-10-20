// Shared pieces for build.mjs: helpers, page layout (header, loader, footer) and home-page data.
// Static build: renders every page from src/data.mjs and bundles src/main.js.
import { mkdirSync, writeFileSync } from 'node:fs';
import { ASSETS, studio, categories, projects, process as steps, values, team, awards, press } from './data.mjs';

export const out = 'dist';
mkdirSync(out, { recursive: true });

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const img = (name, alt, { sizes = '100vw', eager = false, parallax = false, ratio } = {}) =>
  `<div class="media${parallax ? ' parallax' : ''}"${ratio ? ` style="--r:${ratio}"` : ''}><img ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" src="${ASSETS}/img/${name}-640.webp" srcset="${ASSETS}/img/${name}-640.webp 640w, ${ASSETS}/img/${name}-1376.webp 1376w" sizes="${sizes}" alt="${esc(alt)}"></div>`;
export const lines = (text, cls = '') => `<span class="${cls}" data-reveal="title">${text.split('|').map((l) => `<span class="line-mask"><span>${esc(l)}</span></span>`).join('')}</span>`;
export const nav = [['/works/', 'Work'], ['/studio/', 'Studio'], ['/process/', 'Process'], ['/contact/', 'Contact']];

export const layout = ({ title, desc, body, ns = 'default', path = '/' }) => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${ASSETS}/img/hill-house-1376.webp">
<link rel="preconnect" href="${ASSETS}" crossorigin><link rel="preload" href="${ASSETS}/fonts/inter-tight-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css">
<script>document.documentElement.classList.add('js');if(sessionStorage.getItem('ha-loaded')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('no-loader')</script>
<script type="module" src="/app.js"></script>
</head><body>
<a class="sr-only" href="#main">Skip to content</a>
<div class="loader" aria-hidden="true"><div class="loader-panel"></div><div class="loader-top grid wrap t-14"><div class="loader-title"><span class="lm"><span>Design studio</span></span><span class="lm"><span>${esc(studio.tagline)}</span></span></div><div class="loader-location"><span class="lm"><span>${esc(studio.city)}, Portugal</span></span></div><div class="loader-load"><span class="lm"><span class="loader-loading">Loading</span></span><span class="lm"><span class="loader-counter">0%</span></span></div></div></div>
<header class="header grid wrap">
  <a href="/" class="logo" aria-label="${esc(studio.name)} home">${[...studio.name].map((c) => `<span>${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</a>
  <nav aria-label="Main" class="header-links list-o">${[['/works/', 'Work'], ['/process/', 'Process'], ['/studio/', 'Studio']].map(([h, l], i, a) => `<a class="header-link list-o-item" href="${h}">${l}${i < a.length - 1 ? ',' : ''}</a>`).join('')}</nav>
  <span class="clock"><span class="time" data-clock>--:--</span><span class="loc">${esc(studio.city)}, PT</span></span>
  <span class="contact-w"><a class="contact-link" href="/contact/">Contact</a></span>
  <button class="menu-btn" aria-expanded="false" aria-controls="menu">Menu</button>
</header>
<div class="intro-logo" aria-hidden="true">${[...studio.name.toUpperCase()].map((c) => `<span>${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</div>
<div class="menu-overlay"></div>
<div class="menu" id="menu" role="dialog" aria-label="Menu"><div class="menu-top"><a href="/" class="logo">${esc(studio.name)}</a><button class="menu-close">Close</button></div>
<ul class="t-48">${[['/', 'Home'], ...nav].map(([h, l]) => `<li class="line-mask"><a href="${h}"><span>${l}</span></a></li>`).join('')}</ul>
<div class="t-14"><p>${esc(studio.email)}</p><p>${esc(studio.phone)}</p></div></div>
<div class="transition-overlay"></div>
<div data-taxi>
<div data-taxi-view="${ns}" data-path="${path}">
<div class="view"><main id="main">
${body}
</main>
<footer class="site-footer">
<div class="footer-top grid wrap">
  <div class="ft-a"><div class="ft-talk"><div class="muted">Talk to us about your project</div><a href="/contact/" class="u-link">Contact us</a></div>
    <div class="ft-news"><div>Subscribe to our newsletter</div><form class="ft-form" novalidate onsubmit="event.preventDefault();if(this.reportValidity()){this.classList.add('ok')}"><label class="sr-only" for="nl-${ns}">Email</label><input id="nl-${ns}" type="email" required placeholder="Enter your email"><span class="ft-ok">Thanks for joining!</span><button type="submit" aria-label="Submit"><svg viewBox="0 0 12 12" width="12" height="12"><path d="M0 6h11M6 1l5 5-5 5" fill="none" stroke="currentColor"/></svg></button></form></div></div>
  <div class="ft-b"><div class="ft-nav"><nav aria-label="Footer">${[['/', 'Home'], ...nav].map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav><span class="xl-hide">N</span></div><button class="ft-top d-only" data-top>Back to top</button></div>
  <div class="ft-c"><div class="ft-rows"><div class="ft-row"><span>L</span><p>${studio.address.map(esc).join('<br>')}</p></div><div class="ft-row"><span>P</span><a href="tel:${studio.phone.replace(/\s/g, '')}">${esc(studio.phone)}</a></div><div class="ft-row"><span>C</span><a href="mailto:${studio.email}">${esc(studio.email)}</a></div></div>
    <div class="ft-social"><div><a href="${studio.instagram}" target="_blank" rel="noopener">Instagram,</a> <a href="${studio.linkedin}" target="_blank" rel="noopener">Linkedin</a></div><span class="xl-hide">S</span></div></div>
  <div class="ft-m muted">All rights reserved<br>© ${esc(studio.name)} 2026</div>
  <div class="ft-m ft-legal muted"><a href="/contact/">Privacy policy</a><a href="/contact/">Terms of services</a></div>
  <div class="ft-m muted ft-mt">Template by ${esc(studio.name)}</div>
  <div class="ft-m ft-mt ft-r muted"><button data-top>Back to top</button></div>
</div>
<div class="footer-bottom"><div class="footer-bottom-pad"><div class="footer-bottom-inner"><div class="footer-bottom-overlay"></div>
  <div class="footer-word" aria-hidden="true">${[...studio.name.toUpperCase()].map((c) => `<span>${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</div>
  <div class="footer-legal"><div class="o52">All rights reserved © ${esc(studio.name)} 2026</div><a class="o52" href="/contact/">Privacy policy</a><a class="o52" href="/contact/">Terms of services</a><div class="o52">Template by ${esc(studio.name)}</div></div>
</div></div></div>
</footer>
</div>
</div>
</div>
</body></html>`;

export const coverTitle = 'Shaped by Light, Rooted in Place, Built to Last';
export const coverTag = 'Driven by Site, Centred on Craft, Embracing Quiet';
export const crop = `<i class="crop tl"></i><i class="crop tr"></i><i class="crop bl"></i><i class="crop br"></i>`;
export const write = (path, html) => { const dir = `${out}${path}`; mkdirSync(dir, { recursive: true }); writeFileSync(`${dir}index.html`, html); };
export const WG = [['large', 'small', 'medium', 'medium', 'small'], ['medium', 'small', 'medium', 'small', 'large'], ['large', 'small', 'medium', 'small', 'medium', 'small', 'medium', 'small', 'large']];
export const WGI = ['tower', 'stair', 'kitchen', 'corner-apartments', 'bathroom', 'courtyard', 'studio-office', 'hill-house'];
export const PROC_IMG = ['studio-office', 'stair', 'kitchen', 'hill-house'];
export const VISION = [
  { title: 'Quiet design', text: 'Every project starts with a close reading of the site, the brief and the people who will live or work there. We test those layers against each other until one clear idea is left, then hold to it from the first sketch to the last detail, whatever the size of the building.' },
  { title: 'Honest materials', text: 'We choose stone, timber, lime and brick that age well and need little upkeep, and we let them show. Drawings, samples and full-size mock-ups help clients see how each surface will look and feel long before it is built.' },
  { title: 'Lasting light', text: 'We plan rooms around how daylight moves through them across the day and the year. Good light, fresh air and a calm view do more for the people inside a building than any finish we could add.' },
];

