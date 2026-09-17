/*
  Every teaser count must equal the number of items on the page it points at.

  01-build-spec.md section 9 rule 2 and 03-site-copy-landing.md "Checks the build
  must pass" item 1.

  Counts the collections in src/content, which is what the routes will render,
  and ignores anything marked draft: true, because a draft stays in the repo and
  off the site. Before stage 2 this counted the source directories under
  Writings/; the repo is self contained now, so it counts what actually ships.
*/

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/content');

/* Case studies are .astro pages rather than a collection, per 01 section 2. */
const EXPECTED = { projects: 3, writing: 7, analysis: 8, library: 23 };

const countPublished = async (collection) => {
  const files = (await readdir(join(CONTENT, collection))).filter((f) => f.endsWith('.md'));

  let published = 0;
  for (const file of files) {
    const raw = await readFile(join(CONTENT, collection, file), 'utf8');
    if (!/^draft:\s*true\s*$/m.test(raw)) published++;
  }

  return { total: files.length, published };
};

let failures = 0;

for (const [key, expected] of Object.entries(EXPECTED)) {
  if (key === 'projects') {
    console.log(`counts: projects  teaser says ${expected} (case studies are .astro pages, checked in stage 5)`);
    continue;
  }

  const { total, published } = await countPublished(key);
  const ok = published === expected;
  if (!ok) failures++;

  const drafts = total - published;
  console.log(
    `counts: ${key.padEnd(9)} teaser says ${expected}, collection has ${published}` +
      `${drafts ? ` (+${drafts} draft)` : ''}  ${ok ? 'ok' : 'MISMATCH'}`,
  );
}

if (failures > 0) {
  console.error(`\ncount check: ${failures} teaser(s) disagree with their collection`);
  process.exit(1);
}

console.log('count check: every teaser matches its collection');
