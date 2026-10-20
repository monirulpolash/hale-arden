// src/main.js is generated: the site script is kept in parts (src/main/01.js, 02.js, ...) so each file stays small.
// Runs first in "build": joins the parts in order into src/main.js, which build.mjs and inner-pages.mjs bundle.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const parts = readdirSync('src/main').filter((f) => /^\d+\.js$/.test(f)).sort((a, b) => parseInt(a) - parseInt(b));
writeFileSync('src/main.js', parts.map((f) => readFileSync(`src/main/${f}`, 'utf8')).join(''));
console.log('main.js joined:', parts.length, 'parts');
