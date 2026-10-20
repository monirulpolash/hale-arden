// Rebuilds /works/ and /work/<slug>/ to mirror telhaclarke.com.au, adds the matching CSS and JS.
// Runs after build.mjs (see package.json "build"), overwriting the older inner-page markup it wrote.
import { writeFileSync, readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { studio, categories, projects } from './data.mjs';
import { out, esc, img, layout, write } from './site.mjs';

// WORKS (mirrors telhaclarke.com.au/works/: title + count, image card grid 6/6 · 4/4/4 · 12, sticky pill widget)
const plus = `<span class="widget-icon" aria-hidden="true"><svg viewBox="0 0 11 11" width="11" height="11"><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" stroke-width="1"/></svg></span>`;
const pill = (ghost, cta, href, extra = '') => `<div class="widget-sticky page-pill"${extra}><a class="widget" href="${href}"><span class="widget-wrapper"><span class="widget-title-wrapper"><span class="widget-title"><span class="pill-ghost">${ghost}</span></span></span><span class="widget-cta"><span>${cta}</span>${plus}</span></span></a></div>`;
const SLOT = ['s6', 's6', 's4', 's4', 's4', 's12'];
write('/works/', layout({ title: `Work — ${studio.name}`, desc: 'Selected architecture and interiors projects.', ns: 'works', path: '/works/', body: `
<section class="wp wrap" data-wp>
  <div class="wp-head"><h1 class="wp-title" data-reveal="content"><span>All Work</span> <sup>(${String(projects.length).padStart(2, '0')})</sup></h1><button class="wp-fbtn" data-filters-toggle aria-expanded="false">Filters</button></div>
  <div class="wp-filters" role="toolbar" aria-label="Filter projects"><button class="is-active" data-wp-filter="all">All</button>${categories.map((c) => `<button data-wp-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="wp-grid" data-view-grid>
    ${projects.map((p, i) => `<a class="cw ${SLOT[i % 6]}" href="/work/${p.slug}/" data-cat="${esc(p.category)}">${img(p.image, p.title, { sizes: SLOT[i % 6] === 's12' ? '100vw' : SLOT[i % 6] === 's6' ? '(min-width:768px) 50vw, 100vw' : '(min-width:768px) 33vw, 100vw', eager: i < 2 })}<span class="cw-meta"><span class="cw-t">${esc(p.title)}</span><span class="cw-r"><span>${esc(p.category)}</span><span>${p.year}</span></span></span></a>`).join('')}
  </div>
  <div class="wp-list" data-view-list hidden>
    ${projects.map((p) => `<a class="wl-row" href="/work/${p.slug}/" data-cat="${esc(p.category)}"><span class="cw-t">${esc(p.title)}</span><span class="wl-c">${esc(p.category)}</span><span class="wl-l">${esc(p.location)}</span><span class="wl-y">${p.year}</span></a>`).join('')}
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
