// Rebuilds /studio/ to mirror telhaclarke.com.au/studio/ section by section:
// sticky "work together" pill, cover-about, offset quote, team list with sticky portrait,
// pinned values -> vision cards, awards table, press table. Original markup, placeholder content.
// Runs after inner-pages.mjs (see package.json "build"), then re-bundles app.js with studio.js.
import { build } from 'esbuild';
import { studio, ASSETS } from './data.mjs';
import { esc, layout, write, out } from './site.mjs';
import { cover, quote, team, values, vision, awards, press } from './studio-data.mjs';

const pic = (name, alt, { sizes = '100vw', eager = false, cls = '' } = {}) =>
  `<img class="st-img${cls ? ' ' + cls : ''}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" src="${ASSETS}/img/${name}-640.webp" srcset="${ASSETS}/img/${name}-640.webp 640w, ${ASSETS}/img/${name}-1376.webp 1376w" sizes="${sizes}" alt="${esc(alt)}">`;
const sub = (n, t, cls = '') => `<div class="st-sub${cls ? ' ' + cls : ''}" data-st-sub><span class="n">${n}</span><span class="t">${esc(t)}</span></div>`;
const plus = `<svg viewBox="0 0 11 11" width="11" height="11" aria-hidden="true"><path d="M5.5 0v11M0 5.5h11" stroke="currentColor" stroke-width="1.2"/></svg>`;
const crop2 = `<i class="crop bl"></i><i class="crop br"></i>`;

const years = awards.map((g) => g.year);
const body = `
<div class="st" data-studio>
  <div class="st-pill-track"><a class="st-pill" href="/contact/"><span class="st-pill-i">${plus}</span><span class="st-pill-t">Let\u2019s work together</span></a></div>
  <div class="st-body">
    ${crop2}
    <section class="st-cover" data-st-cover>
      <div class="sg st-cover-top">
        <h1 class="st-cover-title" data-st-title>${esc(cover.title)}</h1>
        <p class="st-scroll">[Scroll down]</p>
      </div>
      <div class="sg st-cover-row">
        <div class="st-cover-copy"><div class="st-cover-text" data-st-content>${cover.text.map((p) => `<p>${esc(p)}</p>`).join('')}</div></div>
        <div class="st-cover-media" data-st-cover-media><div class="st-cover-inner" data-st-parallax>${pic(cover.image, 'Inside the Hale Arden studio', { sizes: '(min-width:768px) 50vw, 100vw', eager: true })}</div></div>
      </div>
    </section>

    <section class="st-quote"><h2 class="st-quote-t" data-st-title data-st-on-scroll><span class="st-quote-sp" aria-hidden="true"></span>${esc(quote)}</h2></section>

    <section class="st-team" data-st-team>
      ${crop2}
      <div class="st-team-head">${sub('01', 'Our team')}</div>
      <div class="sg st-team-grid">
        <ul class="st-team-list">${team.map((m, i) => `<li class="st-team-item${i ? '' : ' a'}" data-i="${i}">${esc(m.name)}</li>`).join('')}</ul>
        <div class="st-team-side">
          <div class="st-team-sticky" data-st-team-sticky>
            <div class="st-team-photo">${team.map((m, i) => `<div class="st-team-image${i ? '' : ' a'}">${pic(m.image, m.name, { sizes: '(min-width:768px) 25vw, 50vw' })}</div>`).join('')}</div>
            <div class="st-team-jobs"><span class="br">[</span><span class="st-team-jw">${team.map((m, i) => `<span class="st-team-job${i ? '' : ' a'}">${esc(m.role)}</span>`).join('')}</span><span class="br">]</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="st-vv" data-st-vv>
      <div class="st-values">
        <div class="st-values-hero">
          <div class="st-values-image"><div class="st-values-inner">${pic(values.image, 'Hale Arden values', { sizes: '100vw' })}<i class="st-shade"></i></div></div>
          <div class="st-values-copy">
            <div class="st-values-sub">${sub('02', 'Our values')}</div>
            <div class="st-values-content" data-st-values-content>${values.text.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          </div>
        </div>
        <div class="sg st-vision">
          <div class="st-vision-left"><div class="st-vision-sub" data-st-vision-sub>${sub('03', 'Our vision')}</div>
          <div class="st-vision-wrap" data-st-vision-wrap>
            ${vision.map((v, i) => `<div class="st-vcard" data-st-vcard>
              <h3 class="st-vcard-t"><span class="st-ln"><span>${esc(v.title)}</span></span></h3>
              <div class="st-vcard-c"><p>${esc(v.text)}</p></div>
              <div class="st-vcard-img">${pic(v.image, v.title, { sizes: '100vw' })}</div>
            </div>`).join('')}
          </div></div>
          <div class="st-vision-media" data-st-vision-media>
            ${vision.slice(1).map((v) => `<div class="st-vgroup"><i class="st-voverlay"></i><div class="st-vimage"><div class="st-vmask"><div class="st-vmask-in">${pic(v.image, v.title, { sizes: '40vw' })}</div></div></div></div>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="st-awards">
      <div class="st-pad">${sub('04', 'Awards')}</div>
      <div class="sg st-thead st-aw-head"><span class="c-year">Year</span><span class="c-proj">Project</span><span class="c-award">Award</span><span class="c-acc">Accolade</span></div>
      ${awards.map((g, gi) => `<div class="st-aw-group st-pad${gi ? ' later' : ''}"><hr>
        <div class="st-aw-grid"><span class="st-aw-year">${g.year}</span>
          <div class="st-aw-list">${g.items.map((a) => `<a class="st-aw-row" href="/works/"><span class="c-proj">${esc(a.project)}<span class="st-aw-my">(${g.year})</span></span><span class="c-award">${esc(a.award)}</span><span class="c-acc">${esc(a.accolade)}</span></a>`).join('')}</div>
        </div></div>`).join('')}
    </section>

    <section class="st-press">
      <div class="st-pad">${sub('05', 'Press')}</div>
      <div class="sg st-thead st-pr-head"><span class="c-year">Year</span><span class="c-proj"><span class="md">Project</span><span class="mo">Projects</span></span><span class="c-title">Title</span><span class="c-pub">Publication</span></div>
      <div class="st-pad"><hr class="st-pr-hr"></div>
      <div class="st-pr-list">${[...press].sort((a, b) => b.year - a.year).map((p) => `<a class="sg st-pr-row" href="/works/"><span class="c-year">${p.year}</span><span class="c-img"><span class="st-pr-img">${pic(p.image, p.title, { sizes: '10vw' })}</span></span><span class="c-proj">${esc(p.project)}</span><span class="c-title">${esc(p.title)}<span class="st-pr-mpub">${esc(p.publication)}</span></span><span class="c-pub">${esc(p.publication)}</span></a>`).join('')}</div>
    </section>
  </div>
</div>`;

write('/studio/', layout({ title: `Studio \u2014 ${studio.name}`, desc: 'Meet the Hale Arden team, our values, vision, awards and press.', ns: 'studio', path: '/studio/', body }));
await build({ stdin: { contents: "import './main.js';\nimport './works.js';\nimport './studio.js';", resolveDir: 'src', loader: 'js' }, bundle: true, minify: true, format: 'esm', target: 'es2019', outfile: `${out}/app.js` });
console.log('studio page rebuilt; years', years.join(','));
