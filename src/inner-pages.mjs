// Rebuilds /works/ and /work/<slug>/ to mirror telhaclarke.com.au, adds the matching CSS and JS.
// Runs after build.mjs (see package.json "build"), overwriting the older inner-page markup it wrote.
import { writeFileSync, readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { studio, categories, projects, ASSETS } from './data.mjs';
import { out, esc, img, layout, write } from './site.mjs';

// WORKS (mirrors telhaclarke.com.au/works/: title + count, image card grid 6/6 · 4/4/4 · 12, sticky pill widget)
const plus = `<span class="widget-icon" aria-hidden="true"><svg viewBox="0 0 11 11" width="11" height="11"><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" stroke-width="1"/></svg></span>`;
const pill = (ghost, cta, href, extra = '') => `<div class="widget-sticky page-pill"${extra}><a class="widget" href="${href}"><span class="widget-wrapper"><span class="widget-title-wrapper"><span class="widget-title"><span class="pill-ghost">${ghost}</span></span></span><span class="widget-cta"><span>${cta}</span>${plus}</span></span></a></div>`;
const SLOT = ['s6', 's6', 's4', 's4', 's4', 's12'];
// Card image ratios as on telhaclarke.com.au/works/: 6/6 pairs alternate 100% / 66%, thirds are square, the full-width card is 16:9
const RATIO = (i) => { const k = i % 6, g = Math.floor(i / 6); return k < 2 ? ((k + g) % 2 ? '66%' : '100%') : k < 5 ? '100%' : '56.25%'; };
const date = (p) => (p.status === 'In progress' ? 'Coming Soon' : p.year);
const arrow = `<svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true"><path d="M1.19922 0C1.42013 0 1.59961 0.179477 1.59961 0.400391V3.9502C1.59967 4.08821 1.71158 4.2002 1.84961 4.2002H9.60352C9.5349 4.0811 9.45139 3.96801 9.34961 3.86621L6.73047 1.24805C6.555 1.07238 6.55504 0.787026 6.73047 0.611328L7.13867 0.204102C7.31436 0.028412 7.59964 0.0285033 7.77539 0.204102L12.1094 4.53809C12.3632 4.79193 12.3632 5.20417 12.1094 5.45801L7.77539 9.79199C7.59964 9.96759 7.31436 9.96768 7.13867 9.79199L6.73047 9.38477C6.55506 9.20908 6.55504 8.92372 6.73047 8.74805L9.34961 6.12988C9.45019 6.02929 9.53239 5.91733 9.60059 5.7998H0.5C0.223897 5.7998 6.33352e-05 5.57589 0 5.2998V0.400391C0 0.179477 0.179477 0 0.400391 0H1.19922Z" fill="currentColor"/></svg>`;
const card = (p, i) => { const slot = SLOT[i % 6]; const pics = [...(p.gallery || []), p.image];
  return `<a class="cw ${slot}" href="/work/${p.slug}/" data-cat="${esc(p.category)}"><div class="cw-media" style="--ratio:${RATIO(i)}"><div class="cw-zoom">${img(p.image, p.title, { sizes: slot === 's12' ? '100vw' : slot === 's6' ? '(min-width:768px) 50vw, 100vw' : '(min-width:768px) 33vw, 100vw', eager: i < 2 })}</div><div class="cw-follow" data-follow-mouse aria-hidden="true"><div class="cw-shade"></div><div class="fm-el"><div class="fm-image"><div class="fm-inner">${pics.map((n, k) => `<img class="fm-img${k ? ' is-off' : ''}" loading="lazy" decoding="async" src="${ASSETS}/img/${n}-640.webp" alt="">`).join('')}</div></div></div></div></div><span class="cw-meta"><span class="cw-t">${esc(p.title)}</span><span class="cw-r"><span class="cw-term"><span>${esc(p.category)}</span><span class="cw-alt">Open project</span></span><span class="cw-date"><span>${date(p)}</span><span class="cw-arrow">${arrow}</span></span></span></span></a>`; };
write('/works/', layout({ title: `Work — ${studio.name}`, desc: 'Selected architecture and interiors projects.', ns: 'works', path: '/works/', body: `
<section class="wp wrap" data-wp>
  <div class="wp-head"><h1 class="wp-title" data-reveal="content"><span>All Work</span> <sup>(${String(projects.length).padStart(2, '0')})</sup></h1><button class="wp-fbtn" data-filters-toggle aria-expanded="false">Filters</button></div>
  <div class="wp-filters" role="toolbar" aria-label="Filter projects"><button class="is-active" data-wp-filter="all">All</button>${categories.map((c) => `<button data-wp-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="wp-grid" data-view-grid>
    ${projects.map((p, i) => card(p, i)).join('')}
  </div>
  <div class="wp-list" data-view-list hidden>
    <div class="wl-head"><span class="c1">Project</span><span class="c2">Typology</span><span class="c3">Type</span><span class="c4">Location</span><span class="c5">Date</span></div>
    ${projects.map((p) => `<a class="wl-row" href="/work/${p.slug}/" data-cat="${esc(p.category)}"><span class="wl-cells"><span class="c1">${esc(p.title)}</span><span class="c2">${esc(p.category)}</span><span class="c3">${esc(p.status)}</span><span class="c4">${esc(p.location)}, Portugal</span><span class="c5">${date(p)}</span></span><span class="wl-prev" aria-hidden="true"><span class="wl-prev-col"><span class="wl-prev-r"><img loading="lazy" decoding="async" src="${ASSETS}/img/${p.image}-640.webp" alt=""></span></span></span></a>`).join('')}
  </div>
</section>
<div class="widget-sticky page-pill wp-pill"><div class="widget wp-switch"><span class="widget-wrapper"><button class="wp-tab is-active" data-wp-view="grid" aria-pressed="true">Grid view</button><button class="wp-tab" data-wp-view="list" aria-pressed="false">List view</button><button class="wp-tab wp-ftoggle" data-filters-toggle aria-expanded="false"><span class="o">Filters</span> <span data-filter-label>All works</span> ${plus}</button></span></div></div>` }));

// SINGLE WORK (mirrors telhaclarke.com.au/work/<slug>/: title, details table, full image, intro text, gallery pairs, back-to-all pill)
projects.forEach((p, i) => {
  const next = projects[(i + 1) % projects.length];
  write(`/work/${p.slug}/`, layout({ title: `${p.title} — ${studio.name}`, desc: p.summary, ns: 'work', path: `/work/${p.slug}/`, body: `
<section class="wk-head wrap">
  <h1 class="wk-title" data-reveal="content">${esc(p.title)}</h1>
  <div class="wk-details" data-details>${[['Location', p.location], ['Typology', p.category], ['Year', p.year], ['Status', p.status]].map(([k, v]) => `<div class="d"><span class="k">${k}</span><span class="v">${esc(v)}</span></div>`).join('')}</div>
</section>
<section class="wk-hero wrap">${img(p.image, p.title, { eager: true })}</section>
<section class="wk-text wrap"><p class="wk-lead" data-reveal="content">${esc(p.summary)}</p><p class="wk-body" data-reveal="content">${esc(p.body)}</p></section>
<section class="wk-gallery wrap"><div class="g1">${img(p.gallery[0], `${p.title} detail`, { sizes: '(min-width:768px) 50vw, 100vw' })}</div><div class="g2">${img(p.gallery[1], `${p.title} interior`, { sizes: '(min-width:768px) 50vw, 100vw' })}</div><div class="g3">${img(p.gallery[2], `${p.title} view`)}</div></section>
<a class="wk-next wrap" href="/work/${next.slug}/"><span class="k">Next project</span><span class="t">${esc(next.title)}</span></a>
${pill('Back to', 'All works', '/works/')}` }));
});

writeFileSync(`${out}/styles.css`, readFileSync('src/styles.css', 'utf8') + readFileSync('src/inner.css', 'utf8'));
await build({ stdin: { contents: "import './main.js';\nimport './works.js';", resolveDir: 'src', loader: 'js' }, bundle: true, minify: true, format: 'esm', target: 'es2019', outfile: `${out}/app.js` });
console.log('inner pages rebuilt:', projects.length + 1);
