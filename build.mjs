// Static build: renders every page from src/data.mjs and bundles src/main.js.
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { build } from 'esbuild';
import { ASSETS, studio, categories, projects, process as steps, values, team, awards, press } from './src/data.mjs';

const out = 'dist';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const img = (name, alt, { sizes = '100vw', eager = false, parallax = false, ratio } = {}) =>
  `<div class="media${parallax ? ' parallax' : ''}"${ratio ? ` style="--r:${ratio}"` : ''}><img ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" src="${ASSETS}/img/${name}-640.webp" srcset="${ASSETS}/img/${name}-640.webp 640w, ${ASSETS}/img/${name}-1376.webp 1376w" sizes="${sizes}" alt="${esc(alt)}"></div>`;
const lines = (text, cls = '') => `<span class="${cls}" data-reveal="title">${text.split('|').map((l) => `<span class="line-mask"><span>${esc(l)}</span></span>`).join('')}</span>`;
const nav = [['/works/', 'Work'], ['/studio/', 'Studio'], ['/process/', 'Process'], ['/contact/', 'Contact']];

const layout = ({ title, desc, body, ns = 'default', path = '/' }) => `<!doctype html>
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
<div class="loader" aria-hidden="true"><div class="word t-100">${[...studio.name].map((c) => `<span>${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</div><div class="counter t-100">0%</div></div>
<header class="header wrap">
  <a href="/" class="logo">${esc(studio.name)}</a>
  <span class="clock t-14">${esc(studio.city)} <span data-clock>--:--</span></span>
  <nav aria-label="Main">${nav.map(([h, l]) => `<a class="u-link" href="${h}">${l}</a>`).join('')}</nav>
  <button class="menu-btn" aria-expanded="false" aria-controls="menu">Menu</button>
</header>
<div class="menu-overlay"></div>
<div class="menu" id="menu" role="dialog" aria-label="Menu"><div class="menu-top"><a href="/" class="logo">${esc(studio.name)}</a><button class="menu-close">Close</button></div>
<ul class="t-48">${[['/', 'Home'], ...nav].map(([h, l]) => `<li class="line-mask"><a href="${h}"><span>${l}</span></a></li>`).join('')}</ul>
<div class="t-14"><p>${esc(studio.email)}</p><p>${esc(studio.phone)}</p></div></div>
<div class="transition-overlay"></div>
<div data-taxi>
<div data-taxi-view="${ns}" data-path="${path}">
<div class="view"><main id="main">
${body}
</main></div>
<div class="footer-space" aria-hidden="true"></div>
</div>
</div>
<footer class="footer">
  <div class="big t-72"><a class="u-link" href="/contact/">Talk to us about your project</a></div>
  <div class="bottom grid t-14">
    <div class="span-all c1-4"><p class="muted">Studio</p><p>${studio.address.map(esc).join('<br>')}</p></div>
    <div class="span-all c5-8"><p class="muted">Contact</p><p><a class="u-link" href="mailto:${studio.email}">${esc(studio.email)}</a><br>${esc(studio.phone)}</p></div>
    <form class="span-all c9-12 newsletter" onsubmit="event.preventDefault();this.querySelector('button').textContent='Thank you'"><label class="sr-only" for="nl">Email</label><input id="nl" type="email" required placeholder="Newsletter — your email"><button>Subscribe</button></form>
  </div>
  <div class="wordmark" aria-hidden="true">${esc(studio.name)}</div>
</footer>
</body></html>`;

const write = (path, html) => { const dir = `${out}${path}`; mkdirSync(dir, { recursive: true }); writeFileSync(`${dir}index.html`, html); };
const sizesFor = ['size-l', 'size-s off-1', '', 'size-l', '', 'size-s', 'size-l', ''];

// HOME
write('/', layout({ title: `${studio.name} — ${studio.tagline}`, desc: studio.intro, ns: 'home', body: `
<section class="cover" data-cover>
  ${img('hill-house', 'Low concrete and timber house set into a hillside at dusk', { eager: true, parallax: true })}
  <div class="cover-content wrap grid">
    <h1 class="t-100 span-all">${lines(`${studio.name}`)}</h1>
    <div class="cover-meta span-all t-14"><span data-reveal="content">${esc(studio.tagline)}</span><span data-reveal="content">Selected work 2023—2027</span></div>
  </div>
</section>
<section class="section wrap grid">
  <p class="label t-14 c1-3 span-all" data-reveal="content"><span class="idx">(01)</span>About</p>
  <h2 class="t-48 c4-12 span-all">${lines(studio.intro.replace(', where', ',|where'))}</h2>
  <p class="t-20 c7-12 span-all" style="margin-top:4rem" data-reveal="content">${esc(studio.about)}</p>
  <p class="c7-12 span-all" style="margin-top:2rem" data-reveal="content"><a class="u-link" href="/studio/">About the studio</a></p>
</section>
<section class="wrap">
  <p class="label t-14" data-reveal="content"><span class="idx">(02)</span>Selected work</p>
  ${projects.slice(0, 3).map((p) => `<a class="selected-item grid" href="/work/${p.slug}/" data-selected>
    ${img(p.image, p.title, { sizes: '(min-width:768px) 66vw, 100vw', ratio: '4/3' })}
    <div class="selected-text span-all"><p class="t-14 muted" data-reveal="content">${p.category} — ${p.year}</p><h3 class="selected-title t-48"><span class="br br-l">[</span>${esc(p.title)}<span class="br br-r">]</span></h3><p class="t-14" style="margin-top:1rem;max-width:32rem" data-reveal="content">${esc(p.summary)}</p></div>
  </a>`).join('')}
</section>
<section class="section wrap">
  <p class="label t-14" style="margin-bottom:4rem" data-reveal="content"><span class="idx">(03)</span>All work (${projects.length})</p>
  <div class="works-grid grid">
  ${projects.map((p, i) => `<a class="wg-item ${sizesFor[i % sizesFor.length]}" href="/work/${p.slug}/" data-mouse="${(i % 3) + 1}">${img(p.image, p.title, { sizes: '(min-width:768px) 50vw, 50vw', ratio: i % 2 ? '4/5' : '4/3' })}<div class="meta t-14"><span>${esc(p.title)}</span><span class="muted">${p.year}</span></div></a>`).join('')}
  </div>
  <div class="all-works t-14"><a href="/works/">View all work</a></div>
</section>
<section class="vision" data-vision>
  <div class="vision-sticky">
    ${img('courtyard', 'Courtyard with an olive tree and concrete walls', { sizes: '100vw' })}
    <div class="vision-titles t-72">${['Calm rooms', 'Honest materials', 'Lasting light'].map((t) => `<div>${esc(t)}</div>`).join('')}</div>
  </div>
</section>
<section class="section wrap">
  <p class="label t-14" style="margin-bottom:4rem" data-reveal="content"><span class="idx">(04)</span>Process</p>
  ${steps.map((s) => `<div class="process-row grid"><span class="n t-14 span-all">${s.n}</span><h3 class="h t-32 span-all">${lines(s.title)}</h3><p class="p t-14 span-all" data-reveal="content">${esc(s.text)}</p></div>`).join('')}
  <p style="margin-top:3rem"><a class="u-link" href="/process/">How we work</a></p>
</section>` }));

// WORKS
write('/works/', layout({ title: `Work — ${studio.name}`, desc: 'Selected architecture and interiors projects.', ns: 'works', path: '/works/', body: `
<section class="wrap" style="padding-top:calc(var(--header) + 10rem)" data-works-page>
  <h1 class="t-100">${lines('Work')}<sup class="t-14" style="vertical-align:top;margin-left:.6rem">(${projects.length})</sup></h1>
  <div class="filters t-14" style="margin:6rem 0 2rem" role="toolbar" aria-label="Filter projects">
    <button class="is-active" data-filter="all">All</button>${categories.map((c) => `<button data-filter="${esc(c)}">${esc(c)}</button>`).join('')}
    <div class="view-toggle"><button class="is-active" data-view="list" aria-pressed="true">List</button><button data-view="grid" aria-pressed="false">Grid</button></div>
  </div>
  <div class="works-list t-20">
    ${projects.map((p, i) => `<a class="row" href="/work/${p.slug}/" data-cat="${esc(p.category)}" data-i="${i}"><span class="t">${esc(p.title)}</span><span class="c t-14">${p.category}</span><span class="l t-14">${p.location}</span><span class="y t-14">${p.year}</span></a>`).join('')}
  </div>
  <div class="works-cards grid">
    ${projects.map((p) => `<a class="card" href="/work/${p.slug}/" data-cat="${esc(p.category)}">${img(p.image, p.title, { sizes: '(min-width:768px) 33vw, 50vw' })}<div class="t-14" style="display:flex;justify-content:space-between"><span>${esc(p.title)}</span><span class="muted">${p.year}</span></div></a>`).join('')}
  </div>
  <div class="follow" aria-hidden="true">${projects.map((p) => `<img src="${ASSETS}/img/${p.image}-640.webp" alt="" loading="lazy">`).join('')}</div>
  <div style="height:12rem"></div>
</section>` }));

// SINGLE WORK
projects.forEach((p, i) => {
  const next = projects[(i + 1) % projects.length];
  write(`/work/${p.slug}/`, layout({ title: `${p.title} — ${studio.name}`, desc: p.summary, ns: 'work', path: `/work/${p.slug}/`, body: `
<section class="work-cover wrap grid">
  <div class="span-all c1-6"><p class="t-14 muted" data-reveal="content">${p.category}</p><h1 class="t-72" style="margin-top:1rem">${lines(p.title)}</h1></div>
  <div class="details t-14 span-all c7-12" data-details>${[['Location', p.location], ['Year', p.year], ['Size', p.size], ['Status', p.status], ['Type', p.category]].map(([k, v]) => `<div class="d"><span class="muted">${k}</span><span>${esc(v)}</span></div>`).join('')}</div>
</section>
<section class="full section-sm" data-full>${img(p.image, p.title, { eager: true })}</section>
<section class="section-sm wrap grid"><p class="t-32 c4-12 span-all" data-reveal="content">${esc(p.summary)}</p><p class="t-14 c7-12 span-all" style="margin-top:3rem;max-width:48rem" data-reveal="content">${esc(p.body)}</p></section>
<section class="section-sm wrap grid pair"><div>${img(p.gallery[0], `${p.title} detail`, { sizes: '(min-width:768px) 50vw, 100vw', parallax: true })}</div><div>${img(p.gallery[1], `${p.title} interior`, { sizes: '(min-width:768px) 50vw, 100vw', parallax: true })}</div></section>
<section class="section wrap grid"><blockquote class="quote t-48 c3-11 span-all">${lines('Every room should feel|like it was always there.')}</blockquote></section>
<section class="full section-sm" data-full>${img(p.gallery[2], `${p.title} view`)}</section>
<a class="next-work wrap" href="/work/${next.slug}/"><span class="t-14 muted">Next project</span><span class="t-72" style="display:block;margin-top:1rem">${esc(next.title)}</span></a>` }));
});

// STUDIO
write('/studio/', layout({ title: `Studio — ${studio.name}`, desc: studio.about, ns: 'studio', path: '/studio/', body: `
<section class="wrap grid" style="padding-top:calc(var(--header) + 10rem)"><h1 class="t-100 span-all">${lines('Studio')}</h1><p class="t-48 c4-12 span-all" style="margin-top:6rem" data-reveal="content">${esc(studio.about)}</p></section>
<section class="full section" data-full>${img('studio-office', 'Studio interior with a long timber table')}</section>
<section class="section-sm wrap grid" data-team>
  <p class="label t-14 c1-3 span-all" data-reveal="content"><span class="idx">(01)</span>Team</p>
  <div class="team-list t-20 span-all c4-9">${team.map((t, i) => `<div class="row${i ? '' : ' a'}" data-i="${i}" tabindex="0"><span class="n">${esc(t.name)}</span><span class="r t-14 muted">${esc(t.role)}</span></div>`).join('')}</div>
  <div class="span-all c10-12"><div class="team-media media">${team.map((t, i) => `<img class="loaded${i ? '' : ' a'}" src="${ASSETS}/img/${t.image}-640.webp" alt="" loading="lazy">`).join('')}</div></div>
</section>
<section class="section wrap"><p class="label t-14" style="margin-bottom:4rem" data-reveal="content"><span class="idx">(02)</span>Values</p><div class="values grid">${values.map((v) => `<div><h3 class="t-32">${lines(v.title)}</h3><p class="t-14" style="margin-top:1.6rem;max-width:32rem" data-reveal="content">${esc(v.text)}</p></div>`).join('')}</div></section>
<section class="section-sm wrap"><p class="label t-14" style="margin-bottom:2rem" data-reveal="content"><span class="idx">(03)</span>Awards</p><div class="table t-14">${awards.map((a) => `<div class="row"><span class="a1">${a.year}</span><span class="a2">${esc(a.title)}</span><span class="a3 muted">${esc(a.org)}</span></div>`).join('')}</div></section>
<section class="section-sm wrap" style="padding-bottom:12rem"><p class="label t-14" style="margin-bottom:2rem" data-reveal="content"><span class="idx">(04)</span>Press</p><div class="table t-14">${press.map((a) => `<div class="row"><span class="a1">${a.year}</span><span class="a2">${esc(a.title)}</span><span class="a3 muted">${esc(a.outlet)}</span></div>`).join('')}</div></section>` }));

// PROCESS
write('/process/', layout({ title: `Process — ${studio.name}`, desc: 'How we take a project from first visit to handover.', ns: 'process', path: '/process/', body: `
<section class="wrap grid" style="padding-top:calc(var(--header) + 10rem)"><h1 class="t-100 span-all">${lines('Process')}</h1><p class="t-48 c4-12 span-all" style="margin-top:6rem" data-reveal="content">Four steps, one team, from the first site visit to the day you move in.</p></section>
<section class="full section" data-full>${img('stair', 'Concrete stair under a skylight')}</section>
<section class="section-sm wrap" style="padding-bottom:12rem"><div class="stack" data-stack>${steps.map((s, i) => `<article class="card grid" style="top:calc(var(--header) + ${2 + i * 6}rem)"><span class="t-14 span-all c1-3">${s.n}</span><h2 class="t-48 span-all c4-10">${esc(s.title)}</h2><p class="t-20 span-all c4-10" style="margin-top:2rem;max-width:56rem">${esc(s.text)}</p></article>`).join('')}</div></section>` }));

// CONTACT
write('/contact/', layout({ title: `Contact — ${studio.name}`, desc: 'Start a project with the studio.', ns: 'contact', path: '/contact/', body: `
<section class="contact wrap grid">
  <h1 class="t-72 span-all c1-8">${lines('Tell us about|your project')}</h1>
  <div class="t-14 span-all c1-4" data-reveal="content"><p class="muted">Email</p><p><a class="u-link" href="mailto:${studio.email}">${esc(studio.email)}</a></p><p class="muted" style="margin-top:2rem">Phone</p><p>${esc(studio.phone)}</p><p class="muted" style="margin-top:2rem">Studio</p><p>${studio.address.map(esc).join('<br>')}</p></div>
  <form class="form span-all c7-12" onsubmit="event.preventDefault();this.querySelector('.btn').textContent='Thanks — we will be in touch'">
    <label class="t-14">Name<input required name="name" autocomplete="name"></label>
    <label class="t-14">Email<input required type="email" name="email" autocomplete="email"></label>
    <label class="t-14">Project<textarea name="project" rows="3"></textarea></label>
    <button class="btn t-14" type="submit">Send enquiry</button>
  </form>
</section>` }));

// 404
writeFileSync(`${out}/404.html`, layout({ title: `Not found — ${studio.name}`, desc: 'Page not found', body: `<section class="contact wrap"><h1 class="t-100">${lines('Not found')}</h1><p style="margin-top:3rem"><a class="u-link" href="/">Back home</a></p></section>` }));

copyFileSync('src/styles.css', `${out}/styles.css`);
await build({ entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'esm', target: 'es2019', outfile: `${out}/app.js` });
console.log('built', projects.length + 6, 'pages');
