import { mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { build } from 'esbuild';
import { ASSETS, studio, categories, projects, process as steps, values, team, awards, press } from './src/data.mjs';
import { out, esc, img, lines, nav, layout, coverTitle, coverTag, crop, write, WG, WGI, PROC_IMG, VISION } from './src/site.mjs';

rmSync(out, { recursive: true, force: true });
// HOME
write('/', layout({ title: `${studio.name} — ${studio.tagline}`, desc: studio.intro, ns: 'home', body: `
<section class="cover" data-cover data-dark>
  <div class="cover-title-dark" aria-hidden="true">${esc(coverTitle)}</div>
  <div class="cover-bottom-dark grid wrap" aria-hidden="true"><div class="scroll-hint"><span>[</span>&nbsp;<span>Scroll</span>&nbsp;<span>down</span>&nbsp;<span>]</span></div><div class="cover-tag">${esc(coverTag)}</div></div>
  <div class="cover-image">
    <div class="cover-image-inner">${img('hill-house', 'Low concrete and timber house set into a hillside at dusk', { eager: true, parallax: true })}</div>
    <div class="cover-title">${esc(coverTitle)}</div>
    <div class="cover-bottom grid wrap"><div class="scroll-hint">[Scroll down]</div><h1 class="cover-tag">${esc(coverTag)}</h1></div>
  </div>
</section>
<section class="about grid wrap" data-widget="Studio" data-widget-url="/studio/">
  ${crop}
  <div class="about-media"><div class="about-media-track"><div class="about-media-sticky">${img('studio-office', 'The studio workroom with models and drawings', { sizes: '(min-width:768px) 17vw, 100vw' })}</div></div></div>
  <div class="about-intro">
    <p class="subtitle" data-reveal="content"><span class="n">01</span><span>Studio</span></p>
    <p class="about-copy" data-reveal="content">${esc(studio.about)}</p>
  </div>
  <div class="about-title"><h2 class="offset-title"><span class="offset-spacer" aria-hidden="true"></span>${esc(studio.name)} is a Lisbon based Architecture &amp; Interior Design studio, designing calm, enduring buildings and rooms across Portugal and abroad</h2></div>
  <p class="about-label" data-reveal="content">Architecture<br>&amp; Interior Design</p>
  <p class="about-lead" data-reveal="content">${esc(studio.intro)} <a class="u-link" href="/studio/">About the studio</a></p>
</section>
<section class="works">
  <div class="works-head wrap"><div class="wh-l"><span class="n m">02</span><h2>Selected Works</h2></div><div class="n d">02</div><div class="wh-r">23 - 27'</div></div>
  <div class="works-list-home">
  ${projects.slice(0, 3).map((p) => `<a class="works-item" href="/work/${p.slug}/" data-selected data-widget="${esc(p.title)}" data-widget-url="/work/${p.slug}/">
    <div class="works-item-wrapper"><div class="works-item-title-row wrap"><i class="tick l"></i><i class="tick r"></i><span class="br br-l">[</span><h3 class="works-item-title">${esc(p.title)}</h3><span class="br br-r">]</span></div>
    <div class="works-item-body grid wrap"><div class="works-item-col">${img(p.image, p.title, { sizes: '(min-width:1280px) 50vw, (min-width:768px) 66vw, 100vw' })}<div class="works-item-meta"><span class="works-item-category">${esc(p.category)}</span><span class="works-item-date">${p.status === 'In progress' ? 'Coming Soon' : p.year}</span></div></div></div></div>
  </a>`).join('')}
  </div>
</section>
<section class="wg" data-widget="All Work" data-widget-url="/works/" data-widget-offset="0.5">
  <div class="wg-button"><a href="/works/" class="wg-link"><span>All Work</span><sup>(${projects.length})</sup></a></div>
  <div class="wg-rows" aria-hidden="true">${WG.map((row, r) => `<div class="wg-row wg-r${r + 1}">${row.map((size, i) => `<div class="wg-cell"><div class="wg-it" data-size="${size}"><div class="wg-img">${img(WGI[(r * 5 + i) % WGI.length], '', { sizes: size === 'large' ? '(min-width:1280px) 25vw, 50vw' : '(min-width:1280px) 16vw, 33vw' })}</div></div></div>`).join('')}</div>`).join('')}</div>
</section>
<section class="vision" data-vision data-widget="Vision" data-widget-url="/process/" data-widget-offset="1">
  <div class="vision-stage grid wrap">
    <div class="vision-image-wrapper"><div class="vision-image"><div class="vision-image-scroll"><div class="vision-image-parallax">${img('courtyard', 'Courtyard with an olive tree and lime-washed walls', { sizes: '100vw' })}<div class="vision-dim"></div></div></div></div></div>
  </div>
  <div class="vision-track">
    <div class="vision-wrapper grid wrap">
      <div class="vision-titles">${VISION.map((v, i) => `<div class="vt vt-${i + 1}"><h3 class="vision-title${i ? ' dim' : ''}">${esc(v.title)}</h3></div>`).join('')}</div>
      <div class="vision-rule"><div class="vision-number"><span class="vision-number-text">03</span></div><div class="vision-line"></div><h2 class="vision-suptitle"><span class="vision-suptitle-text">Vision</span></h2></div>
      <div class="vision-contents">${VISION.map((v, i) => `<div class="vision-content${i ? ' abs' : ''}">${esc(v.text)}</div>`).join('')}</div>
    </div>
  </div>
</section>
<section class="process grid wrap" data-process>
  ${crop}
  <div class="process-list">${steps.map((s, i, a) => `<span class="process-entry"><span class="process-item${i ? '' : ' a'}" tabindex="0" role="button"><span>${esc(s.title)} <sup>(${s.n})</sup></span></span>${i < a.length - 1 ? ' <span>/</span> ' : ''}</span>`).join('')}</div>
  <div class="process-media"><div class="process-media-box">${steps.map((s, i) => `<div class="process-image${i ? '' : ' a'}">${img(PROC_IMG[i % PROC_IMG.length], s.text, { sizes: '(min-width:1280px) 25vw, 100vw' })}</div>`).join('')}</div></div>
  <div class="process-sub"><p class="subtitle"><span class="n">04</span><span>Process</span></p></div>
  <h3 class="process-desc" data-reveal="content">Our studio covers every stage of architecture and interior design, from the first site visit and early concepts through to the day you move in.</h3>
</section>
<div class="widget-sticky" aria-hidden="false"><a class="widget" href="/studio/" data-widget-link><span class="widget-wrapper"><span class="widget-title-wrapper"><span class="widget-title"><span class="widget-ghost">Studio</span><span class="widget-titles"></span></span></span><span class="widget-cta"><span>Discover</span><span class="widget-icon" aria-hidden="true"><svg viewBox="0 0 11 11" width="11" height="11"><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" stroke-width="1"/></svg></span></span></span></a></div>` }));

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
