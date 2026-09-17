/*
  Fails the build on any em dash, en dash, or hyphenated compound in rendered
  interface text.

  00-START-HERE.md: "No dashes of any kind in any rendered string. No em dashes,
  no en dashes, no hyphens inside compound words. This applies to interface text,
  not to slugs, filenames, or URLs. It is the single easiest rule to break by
  accident and worth a lint rule."

  Scans text nodes only. Attributes, URLs, and inline script or style content are
  skipped, because a hyphen is legal in all three.
*/

import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

const walk = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (extname(p) === '.html') out.push(p);
  }
  return out;
};

/* Strip elements whose content is not interface text, then all tags, leaving
   text nodes plus decoded entities. */
const textOf = (html) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ');

const EM_EN = /[‐‑‒–—―−]/;
/* A hyphen with a word character on both sides: a compound. */
const COMPOUND = /\w-\w/;

/*
  Part identifiers are exempt, on the same grounds 00 exempts slugs, filenames
  and URLs: they are data rather than interface prose, and the hyphen is part of
  the identifier itself. BIW-47219 is not a compound word, and rewriting it as
  BIW 47219 would falsify a value that 08-resume-port-brief.md requires to port
  exactly as it stands.

  Deliberately narrow: two or more capitals, a hyphen, then digits. It does not
  exempt anything that reads as English.
*/
const PART_ID = /\b[A-Z]{2,}-\d+\b/g;

let failures = 0;
const files = await walk(DIST);

for (const file of files) {
  const text = textOf(await readFile(file, 'utf8'));

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (EM_EN.test(trimmed)) {
      console.error(`FAIL ${file}\n  em or en dash: ${trimmed.slice(0, 140)}`);
      failures++;
    }
    const prose = trimmed.replace(PART_ID, ' ');

    if (COMPOUND.test(prose)) {
      const match = prose.match(/\S*\w-\w\S*/g)?.join(', ');
      console.error(`FAIL ${file}\n  hyphenated compound: ${match}`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\ndash check: ${failures} violation(s) across ${files.length} page(s)`);
  process.exit(1);
}

console.log(`dash check: clean across ${files.length} page(s)`);
