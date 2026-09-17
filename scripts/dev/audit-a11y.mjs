/*
  Accessibility audit across every route.

  axe-core for the automated rule set, plus checks axe cannot make: heading
  order across the whole document, landmark structure, focus order and
  visibility, keyboard reachability of the resume tab rail and the tag filters,
  alt text on every image, aria-label on every figure, and reduced motion.
*/

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const axeSource = await readFile(axePath, 'utf8');

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.png': 'image/png', '.avif': 'image/avif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.json': 'application/json', '.xml': 'application/xml',
  '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

const server = createServer(async (q, r) => {
  let p = join('dist', decodeURIComponent(q.url.split('?')[0]));
  try {
    if ((await stat(p)).isDirectory()) {
      try { await stat(p + '.html'); p = p + '.html'; } catch { p = join(p, 'index.html'); }
    }
  } catch { p = p + '.html'; }
  try {
    const b = await readFile(p);
    r.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    r.end(b);
  } catch { r.writeHead(404); r.end('nf'); }
});
server.on('error', (e) => { console.error('bind failed', e.code); process.exit(1); });
await new Promise((res, rej) => { server.once('error', rej); server.listen(4321, res); });

const ROUTES = [
  '/', '/projects', '/projects/tier-3-aluminum-disruption', '/projects/clear-to-build-system',
  '/projects/kit-backlog', '/writing', '/writing/the-bad-version-goes-first',
  '/analysis', '/analysis/agentic-planning-supervision', '/library', '/library/influence',
  '/resume', '/about', '/contact', '/404',
];

const browser = await chromium.launch();
const findings = [];
const note = (route, level, text) => findings.push({ route, level, text });

console.log('== axe-core, WCAG 2 A and AA ==');
for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321' + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.addScriptTag({ content: axeSource });

  const results = await page.evaluate(async () =>
    await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }),
  );

  const violations = results.violations.filter((v) => v.impact !== null);
  console.log(`  ${route.padEnd(42)} ${violations.length === 0 ? 'clean' : violations.length + ' violation(s)'}`);
  for (const v of violations) {
    note(route, v.impact, `[${v.id}] ${v.help} (${v.nodes.length} node${v.nodes.length > 1 ? 's' : ''})`);
    for (const n of v.nodes.slice(0, 2)) note(route, 'detail', `    ${n.html.slice(0, 110)}`);
  }
  await ctx.close();
}

console.log('\n== heading order and landmarks ==');
for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321' + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  const r = await page.evaluate(() => {
    const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .filter((h) => getComputedStyle(h).display !== 'none' && !h.closest('[inert]'))
      .map((h) => Number(h.tagName[1]));
    const skips = [];
    for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i - 1] > 1) skips.push(`${heads[i - 1]} to ${heads[i]}`);
    return {
      h1: document.querySelectorAll('h1').length,
      skips,
      main: document.querySelectorAll('main').length,
      nav: document.querySelectorAll('nav').length,
      footer: document.querySelectorAll('footer').length,
      labelledNavs: [...document.querySelectorAll('nav')].filter((n) => n.getAttribute('aria-label')).length,
    };
  });

  const flags = [];
  if (r.h1 !== 1) flags.push(`${r.h1} h1 elements`);
  if (r.skips.length) flags.push(`heading skips: ${r.skips.join(', ')}`);
  if (r.main !== 1) flags.push(`${r.main} main landmarks`);
  if (r.nav !== r.labelledNavs) flags.push(`${r.nav - r.labelledNavs} nav without aria-label`);
  if (flags.length) { console.log(`  ${route.padEnd(42)} ${flags.join('; ')}`); flags.forEach((f) => note(route, 'moderate', f)); }
  else console.log(`  ${route.padEnd(42)} one h1, no skips, ${r.main} main, ${r.nav} labelled nav, ${r.footer} footer`);
  await ctx.close();
}

console.log('\n== images and figures ==');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  let imgs = 0, noAlt = 0, figs = 0, noLabel = 0;
  for (const route of ROUTES) {
    await page.goto('http://localhost:4321' + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({
      imgs: [...document.querySelectorAll('img')].map((i) => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt') })),
      figs: [...document.querySelectorAll('figure, [role="group"], svg[role="img"]')].map((f) => ({
        tag: f.tagName, label: f.getAttribute('aria-label') || f.getAttribute('aria-labelledby'),
      })),
    }));
    for (const i of r.imgs) { imgs++; if (i.alt === null) { noAlt++; note(route, 'serious', `img with no alt attribute: ${i.src}`); } }
    for (const f of r.figs) { figs++; if (!f.label) { noLabel++; note(route, 'moderate', `${f.tag} figure with no aria-label`); } }
  }
  console.log(`  ${imgs} images, ${noAlt} without an alt attribute`);
  console.log(`  ${figs} figures and labelled groups, ${noLabel} without a label`);
  await ctx.close();
}

console.log('\n== keyboard: focus visibility and order ==');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const route of ['/', '/writing', '/library', '/resume', '/contact']) {
    await page.goto('http://localhost:4321' + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.evaluate(() => document.body.focus());

    let invisible = 0, stops = 0, first = null;
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const r = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return null;
        const cs = getComputedStyle(a);
        const box = a.getBoundingClientRect();
        return {
          id: a.id || a.className?.toString().split(' ')[0] || a.tagName,
          outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0,
          sized: box.width >= 24 && box.height >= 24,
          inInert: !!a.closest?.('[inert]'),
        };
      });
      if (!r) break;
      stops++;
      if (first === null) first = r.id;
      if (!r.outline) invisible++;
      if (r.inInert) note(route, 'serious', `focus landed inside an inert subtree: ${r.id}`);
    }
    console.log(`  ${route.padEnd(12)} ${stops} tab stops, first is "${first}", ${invisible} without a visible ring`);
    if (invisible) note(route, 'serious', `${invisible} focusable elements with no visible focus ring`);
  }
  await ctx.close();
}

console.log('\n== interactive: resume tab rail and tag filters by keyboard ==');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:4321/resume', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  await page.focus('#asset-tab-planner');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  const moved = await page.evaluate(() => document.activeElement?.id);
  console.log(`  resume tab rail: ArrowRight moves focus to ${moved} ${moved === 'asset-tab-intern' ? 'ok' : 'FAIL'}`);
  if (moved !== 'asset-tab-intern') note('/resume', 'serious', 'tab rail arrow keys do not move focus');

  /*
    Stage 9 removed filtering entirely, so the tag chip check that stood here is
    gone with the component. The landing's carousel and toggle replace it as the
    interactive elements that have to work from the keyboard.
  */
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);

  const beforeCarousel = await page.evaluate(
    () => document.querySelector('[data-carousel="library"] [data-position]')?.textContent,
  );
  await page.focus('[data-carousel="library"] .arrow.next');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const afterCarousel = await page.evaluate(
    () => document.querySelector('[data-carousel="library"] [data-position]')?.textContent,
  );
  const carouselMoved = beforeCarousel !== afterCarousel;
  console.log(
    `  library carousel: ArrowRight ${beforeCarousel} to ${afterCarousel} ${carouselMoved ? 'ok' : 'FAIL'}`,
  );
  if (!carouselMoved) note('/', 'serious', 'carousel arrow keys do not move the carousel');

  await page.focus('#writing-tab-essays');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const toggle = await page.evaluate(() => ({
    focus: document.activeElement?.id,
    selected: document.getElementById('writing-tab-analysis')?.getAttribute('aria-selected'),
    shown: !document.getElementById('writing-panel-analysis')?.hidden,
  }));
  const toggleOk = toggle.focus === 'writing-tab-analysis' && toggle.selected === 'true' && toggle.shown;
  console.log(
    `  writing toggle: ArrowRight focuses ${toggle.focus}, aria-selected ${toggle.selected}, panel shown ${toggle.shown} ${toggleOk ? 'ok' : 'FAIL'}`,
  );
  if (!toggleOk) note('/', 'serious', 'writing toggle does not respond to arrow keys as a tablist');

  await ctx.close();
}

console.log('\n== reduced motion ==');
{
  for (const motion of ['reduce', 'no-preference']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: motion });
    const page = await ctx.newPage();
    await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const reveals = [...document.querySelectorAll('.reveal')];
      return {
        hidden: reveals.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99).length,
        total: reveals.length,
      };
    });
    console.log(`  prefers-reduced-motion ${motion.padEnd(14)} ${r.total} reveal blocks, ${r.hidden} below full opacity`);
    if (r.hidden) note('/', 'serious', `content hidden under prefers-reduced-motion: ${motion}`);
    await ctx.close();
  }

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/resume', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const dur = await page.evaluate(() => getComputedStyle(document.querySelector('.asset-viewport')).transitionDuration);
  console.log(`  resume panel height transition under reduce: ${dur} ${parseFloat(dur) < 0.02 ? 'snaps' : 'STILL ANIMATES'}`);
  await ctx.close();
}

console.log('\n== findings ==');
if (findings.length === 0) console.log('  none');
else {
  const bySeverity = { critical: [], serious: [], moderate: [], minor: [], detail: [] };
  for (const f of findings) (bySeverity[f.level] ?? bySeverity.minor).push(f);
  for (const [level, list] of Object.entries(bySeverity)) {
    if (!list.length || level === 'detail') continue;
    console.log(`\n  ${level.toUpperCase()} (${list.length})`);
    for (const f of list) console.log(`    ${f.route}: ${f.text}`);
  }
}

await browser.close();
server.close();
