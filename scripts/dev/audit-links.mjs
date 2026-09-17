/*
  Crawls every rendered page and enforces 00's non negotiable: every link either
  resolves or is omitted, no # placeholders. Also reports orphans and external
  links, and re verifies the teaser counts against what actually renders.
*/
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));

const walk = async (dir) => {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
};

const all = await walk(DIST);
const pages = all.filter((f) => f.endsWith('.html'));
const assets = new Set(all.map((f) => '/' + relative(DIST, f).replace(/\\/g, '/')));

const routeOf = (file) => {
  /* Directory format: dist/projects/index.html is /projects. */
  const r = '/' + relative(DIST, file).replace(/\\/g, '/').replace(/\/index\.html$/, '').replace(/\.html$/, '');
  return r === '' || r === '/index' ? '/' : r;
};

const exists = (href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return assets.has('/index.html');
  if (assets.has(clean)) return true;
  if (assets.has(clean + '.html')) return true;
  if (assets.has(clean + '/index.html')) return true;
  return false;
};

const broken = [];
const placeholders = [];
const external = new Map();
const inbound = new Map();
let checked = 0;

for (const file of pages) {
  const route = routeOf(file);
  const html = await readFile(file, 'utf8');
  /* Anchors only. A canonical or a preload is not a link a visitor follows,
     and counting them reported every route as an external link to itself. */
  const hrefs = [...html.matchAll(/<a\b[^>]*?href="([^"]*)"/g)].map((m) => m[1]);

  for (const href of hrefs) {
    checked++;
    if (href === '#') { placeholders.push(`${route}: bare # href`); continue; }
    if (href.startsWith('#')) continue;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (/^https?:\/\//.test(href)) {
      external.set(href, [...(external.get(href) ?? []), route]);
      continue;
    }
    if (!exists(href)) { broken.push(`${route} -> ${href}`); continue; }
    const target = href.split('#')[0].split('?')[0].replace(/\.html$/, '') || '/';
    if (target !== route) inbound.set(target, (inbound.get(target) ?? 0) + 1);
  }
}

console.log(`links checked: ${checked} across ${pages.length} pages\n`);
console.log('broken links:', broken.length ? '\n  ' + broken.join('\n  ') : 'none');
console.log('# placeholders:', placeholders.length ? '\n  ' + placeholders.join('\n  ') : 'none');

console.log('\nexternal links:');
for (const [href, routes] of external) console.log(`  ${href}  (from ${routes.length} page${routes.length > 1 ? 's' : ''})`);

console.log('\norphans, reachable from no other page:');
const orphans = pages.map(routeOf).filter((r) => r !== '/' && !inbound.has(r) && !inbound.has(r + '/'));
console.log(orphans.length ? '  ' + orphans.join('\n  ') : '  none');

console.log('\nteaser counts against what actually renders:');
for (const [route, expected] of [['/projects', 3], ['/writing', 7], ['/analysis', 8], ['/library', 23]]) {
  const html = await readFile(join(DIST, route.slice(1), 'index.html'), 'utf8');
  /* Strip inline scripts first: the filter script contains the literal
     "[data-card]" selector and was being counted as a card. */
  const markup = html.replace(/<script[\s\S]*?<\/script>/g, '');
  const cards = (markup.match(/\sdata-card[\s>]/g) ?? []).length;
  /* Match the class among others: stage 9 added "card card-lift" to the tile
     and an exact-attribute regex silently reported zero. */
  const tiles = (markup.match(/class="[^"]*\bcase-tile\b[^"]*"/g) ?? []).length;
  const actual = cards || tiles;
  console.log(`  ${route.padEnd(10)} expected ${String(expected).padStart(2)}, rendered ${String(actual).padStart(2)}  ${actual === expected ? 'ok' : 'MISMATCH'}`);
}
