/* Verifies the SEO surface of every built page against 01 section 7 and 04. */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));

const walk = async (dir) => {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (p.endsWith('.html')) out.push(p);
  }
  return out;
};

const files = (await walk(DIST)).sort();
const rows = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  let route = '/' + relative(DIST, file).replace(/\\/g,'/').replace(/index\.html$/, '').replace(/\.html$/, '');
route = route.replace(/\/$/, '') || '/';

  const grab = (re) => html.match(re)?.[1] ?? null;
  const title = grab(/<title>([^<]*)<\/title>/);
  const desc = grab(/name="description" content="([^"]*)"/);
  const canonical = grab(/rel="canonical" href="([^"]*)"/);
  const ogImage = grab(/property="og:image" content="([^"]*)"/);
  const ogDesc = grab(/property="og:description" content="([^"]*)"/);
  const jsonld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

  rows.push({ route, title, desc, canonical, ogImage, ogDesc, jsonld, html });
}

const decode = (s) => (s ?? '').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');

console.log('== titles and descriptions ==');
console.log('route'.padEnd(46), 'title'.padEnd(6), 'desc len', ' canonical  og:image');
let problems = [];

for (const r of rows) {
  const dl = r.desc === null ? null : decode(r.desc).length;
  const tl = r.title?.length ?? 0;
  const flags = [];
  if (!r.title) flags.push('NO TITLE');
  if (tl > 60) flags.push(`title ${tl} > 60`);
  if (r.desc !== null && (dl < 140 || dl > 155)) flags.push(`desc ${dl} outside 140-155`);
  if (!r.canonical) flags.push('NO CANONICAL');
  if (!r.ogImage) flags.push('NO OG IMAGE');
  /* Stage 9 landed the real About copy, so the 25 word version exists and
     og:description is expected on every page. Its absence is now the fault;
     before stage 9 this check asserted the opposite. */
  if (!r.ogDesc) flags.push('NO og:description');
  if (flags.length) problems.push(`${r.route}: ${flags.join('; ')}`);
  console.log(
    r.route.padEnd(46),
    String(tl).padEnd(6),
    String(dl ?? 'none').padEnd(8),
    r.canonical ? 'ok' : 'MISSING',
    r.ogImage ? (r.ogImage.endsWith('og-default.png') ? ' og-default' : ' ' + r.ogImage.split('/').pop()) : ' MISSING',
  );
}

console.log('\n== duplicate titles or descriptions ==');
for (const key of ['title', 'desc']) {
  const seen = new Map();
  for (const r of rows) {
    const v = r[key];
    if (!v) continue;
    seen.set(v, [...(seen.get(v) ?? []), r.route]);
  }
  const dupes = [...seen.entries()].filter(([, v]) => v.length > 1);
  console.log(`  ${key}: ${dupes.length ? dupes.map(([v, rs]) => `"${v.slice(0, 40)}" on ${rs.join(', ')}`).join(' | ') : 'all unique'}`);
}

console.log('\n== JSON-LD, parsed and validated ==');
const counts = {};
for (const r of rows) {
  for (const raw of r.jsonld) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      problems.push(`${r.route}: JSON-LD does not parse (${err.message})`);
      console.log(`  ${r.route}: INVALID JSON`);
      continue;
    }
    const types = (Array.isArray(parsed) ? parsed : [parsed]).map((x) => x['@type']);
    for (const t of types) counts[t] = (counts[t] ?? 0) + 1;
    for (const obj of Array.isArray(parsed) ? parsed : [parsed]) {
      if (!obj['@context']) problems.push(`${r.route}: JSON-LD ${obj['@type']} has no @context`);
      if (obj['@type'] === 'BlogPosting') {
        for (const req of ['headline', 'author', 'url']) {
          if (!obj[req]) problems.push(`${r.route}: BlogPosting missing ${req}`);
        }
      }
      if (obj['@type'] === 'BreadcrumbList') {
        if (!Array.isArray(obj.itemListElement) || obj.itemListElement.length < 2) {
          problems.push(`${r.route}: BreadcrumbList has fewer than two items`);
        }
      }
    }
  }
}
console.log('  types emitted:', Object.entries(counts).map(([k, v]) => `${k} x${v}`).join(', ') || 'none');

const entryRoutes = rows.filter((r) => /^\/(writing|analysis|library)\/./.test(r.route));
const nested = rows.filter((r) => r.route.split('/').length > 2);
console.log(`  entry pages: ${entryRoutes.length}, of which carry BlogPosting: ${entryRoutes.filter((r) => r.jsonld.some((j) => j.includes('BlogPosting'))).length}`);
console.log(`  nested routes: ${nested.length}, of which carry BreadcrumbList: ${nested.filter((r) => r.jsonld.some((j) => j.includes('BreadcrumbList'))).length}`);
console.log(`  landing carries Person: ${rows.find((r) => r.route === '/')?.jsonld.some((j) => j.includes('"Person"')) ? 'yes' : 'NO'}`);

console.log('\n== problems ==');
console.log(problems.length ? problems.map((p) => '  ' + p).join('\n') : '  none');
