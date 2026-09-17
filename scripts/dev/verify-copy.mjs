/* Diffs every rendered landing string against 03-site-copy-landing.md. */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const html = await readFile(fileURLToPath(new URL('../../dist/index.html', import.meta.url)), 'utf8');

const text = html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/ /g, ' ');

const flat = text.replace(/\s+/g, ' ');

const EXPECT = [
  'Skip to content',
  'LAUNCH MATERIAL PLANNING FOR ELECTRIC VEHICLES',
  'Fourteen months at an electric vehicle plant in Casa Grande, two hundred cutovers run while the line kept building. Three cases and fifteen written pieces, all from one program. Nothing past that.',
  'Open the resume',
  'Read the writing',
  'Download the resume PDF',
  "Six sections, every figure with the scope it's true at and the chart behind it. Fourteen months of record, which is not a long one.",
  "Three cases from launch planning, with what each was for and what it returned. On one of them the decision wasn't mine to make.",
  'See the projects',
  "Seven essays on how work actually runs, from planning systems to why a tutorial doesn't stick. None of it is advice about waking up early.",
  'Eight pieces on where supply chain planning is going, each one a position that can be checked against what actually happens next.',
  'Read the analysis',
  'Twenty three books with what I kept from each and what happened when I used it. Including the ones I argued with, which is most of them.',
  'See the library',
  "Planning at launch runs across engineering, operations, procurement, finance, and the suppliers themselves. Most of the job is getting five groups to agree on what's true before the part changes again.",
  'Email works. Planning, tooling, or anything on this site gets an answer.',
  'Send a message',
  'Jackson Barker, 2026. jacksonmbarker1@gmail.com',
  'Resume PDF',
  'LinkedIn',
  'Email',
  'Figures are locked to record. Supplier identities withheld.',
];

let bad = 0;

for (const s of EXPECT) {
  if (!flat.includes(s)) {
    bad++;
    console.log(`MISSING: ${s.slice(0, 90)}`);
  }
}

/*
  The positioning statement's hard breaks, checked structurally rather than by
  substring: the four lines concatenate into one sentence, so a substring test
  passes against the wrong break points and proves nothing.
*/
const STATEMENT_LINES = [
  'PLANNING ASSUMES',
  'THE PART HOLDS STILL.',
  'MINE MOVED WHILE',
  'THE LINE RAN.',
];

const stmt = html.match(/<h2[^>]*class="[^"]*\bstatement\b[^"]*"[^>]*>([\s\S]*?)<\/h2>/)?.[1] ?? '';
const rendered = stmt
  .split(/<br\b[^>]*>/)
  .map((x) => x.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
  .filter(Boolean);

console.log(`\nstatement lines rendered (${rendered.length}):`);
for (const line of rendered) console.log(`  ${line}`);

if (rendered.length !== STATEMENT_LINES.length) {
  console.log(`STATEMENT: expected ${STATEMENT_LINES.length} lines, got ${rendered.length}`);
  bad++;
} else {
  rendered.forEach((line, i) => {
    if (line !== STATEMENT_LINES[i]) {
      console.log(`STATEMENT line ${i + 1}: expected "${STATEMENT_LINES[i]}", got "${line}"`);
      bad++;
    }
  });
}

/* Section headers must equal nav labels character for character. */
const navLabels = ['Projects', 'Writing', 'Analysis', 'Library', 'Resume', 'About', 'Contact'];
const headers = [...html.matchAll(/<h2[^>]*class="t-h2"[^>]*>([^<]*)<\/h2>/g)].map((m) => m[1].trim());

console.log(`\nheaders rendered: ${headers.join(', ')}`);
for (const h of headers) {
  if (!navLabels.includes(h)) {
    console.log(`HEADER NOT A NAV LABEL: "${h}"`);
    bad++;
  }
}

const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
const desc = (html.match(/name="description" content="([^"]*)"/)?.[1] ?? '').replace(/&#39;/g, "'");

console.log(`\ntitle       (${title.length} chars) ${title}`);
console.log(`description (${desc.length} chars) ${desc}`);

console.log(
  bad === 0
    ? '\ncopy check: every landing string matches 03 verbatim'
    : `\ncopy check: ${bad} problem(s)`,
);

process.exit(bad === 0 ? 0 : 1);
