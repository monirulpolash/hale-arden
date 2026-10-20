// The stylesheet is kept in parts (src/styles.css, src/styles-2.css, ...) so each file stays small.
// Runs last in "build": joins the parts in order, then src/inner.css, into dist/styles.css.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const parts = readdirSync('src').filter((f) => /^styles-\d+\.css$/.test(f)).sort((a, b) => parseInt(a.slice(7)) - parseInt(b.slice(7)));
const files = ['src/styles.css', ...parts.map((f) => `src/${f}`), 'src/inner.css'];
writeFileSync('dist/styles.css', files.map((f) => readFileSync(f, 'utf8')).join(''));
console.log('styles joined:', files.length, 'files');
