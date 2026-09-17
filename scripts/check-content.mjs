/*
  Content checks that run against the collection files rather than built HTML.

  Two jobs:

  1. Dashes. The essays and analysis pieces were written under style guides that
     ban them, but the check has never run against the bodies. Reports every
     violation with its file, line, and the offending text. Reports only: the
     copy is the author's to correct.

  2. Dates. 01 section 11 records that no piece carries one and that all thirty
     eight are needed before launch. Surfaces the list rather than letting the
     bracketed placeholder reach a page.

  Exit code is 0 for dash findings, because they are a report. It is non zero if
  a placeholder date would render, which is a build rule rather than a note.
*/

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/content');
const COLLECTIONS = ['writing', 'analysis', 'library'];
const UNDATED = '⟦YYYY-MM-DD⟧';
const NO_YEAR = '⟦YYYY⟧';

/* Em dash, en dash, and the rest of the dash block. Hyphen handled separately,
   because a hyphen is legal inside a URL and inside frontmatter slugs. */
const LONG_DASH = /[‐‑‒–—―−]/;
/* A hyphen with a word character either side: a compound. */
const COMPOUND = /\w-\w/;

const split = (raw) => {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  return m ? { frontmatter: m[1], body: raw.slice(m[0].length) } : { frontmatter: '', body: raw };
};

const findings = [];
const undated = [];
const noYear = [];
let filesScanned = 0;

for (const collection of COLLECTIONS) {
  const files = (await readdir(join(CONTENT, collection))).filter((f) => f.endsWith('.md')).sort();

  for (const file of files) {
    filesScanned++;
    const raw = await readFile(join(CONTENT, collection, file), 'utf8');
    const { frontmatter, body } = split(raw);

    if (frontmatter.includes(UNDATED)) undated.push(`${collection}/${file}`);
    if (frontmatter.includes(NO_YEAR)) noYear.push(`${collection}/${file}`);

    /* Frontmatter is scanned too, minus the fields where a hyphen is legal. */
    const fmLines = frontmatter
      .split('\n')
      .filter((l) => !/^(slug|date|yearRead):/.test(l.trim()));

    const bodyOffset = raw.slice(0, raw.length - body.length).split('\n').length - 1;

    const scan = (lines, offset, where) => {
      lines.forEach((line, i) => {
        const lineNo = offset + i + 1;

        if (LONG_DASH.test(line)) {
          for (const hit of line.match(/\S*[‐-―−]\S*/g) ?? []) {
            findings.push({ collection, file, lineNo, where, kind: 'em or en dash', hit, line: line.trim() });
          }
        }

        /* Skip URLs and image paths, where a hyphen is legal. */
        const stripped = line.replace(/https?:\/\/\S+/g, ' ').replace(/\]\([^)]*\)/g, '](  )');

        if (COMPOUND.test(stripped)) {
          for (const hit of stripped.match(/\S*\w-\w\S*/g) ?? []) {
            findings.push({ collection, file, lineNo, where, kind: 'hyphenated compound', hit, line: line.trim() });
          }
        }
      });
    };

    scan(fmLines, 0, 'frontmatter');
    scan(body.split('\n'), bodyOffset, 'body');
  }
}

/* ---- Report -------------------------------------------------------------- */

console.log(`content dash check: ${filesScanned} files scanned\n`);

if (findings.length === 0) {
  console.log('  no dash violations in any body or frontmatter');
} else {
  const byFile = new Map();
  for (const f of findings) {
    const key = `${f.collection}/${f.file}`;
    if (!byFile.has(key)) byFile.set(key, []);
    byFile.get(key).push(f);
  }

  console.log(`  ${findings.length} violation(s) across ${byFile.size} file(s)\n`);

  for (const [file, hits] of byFile) {
    console.log(`  ${file}`);
    for (const h of hits) {
      console.log(`    line ${String(h.lineNo).padStart(4)}  ${h.kind.padEnd(20)} ${h.hit}`);
      console.log(`               ${h.line.slice(0, 110)}`);
    }
    console.log('');
  }
}

console.log(`\nundated pieces: ${undated.length} of ${filesScanned}`);
if (undated.length) {
  for (const u of undated) console.log(`  ${u}`);
  console.log(`\n  Every one carries ${UNDATED}. Nothing may render it: read the`);
  console.log('  `dated` boolean rather than the `date` string until these are set.');
}

console.log(`\nlibrary entries with no year read: ${noYear.length} of 23`);
if (noYear.length) {
  for (const n of noYear) console.log(`  ${n}`);
  console.log(`\n  Every one carries ${NO_YEAR}. Stage 9 removed filtering, so`);
  console.log('  nothing reads this yet; the year line on an entry stays omitted');
  console.log('  until these are supplied. Taken from the entry body only.');
}

/* Dash findings are a report. A placeholder reaching a rendered page is a build
   rule, and stage 6 is where that becomes enforceable. */
process.exit(0);
