/*
  Copies the thirty eight source files into src/content and prepends the
  frontmatter written in files 05, 06, and 07.

  The repo has to be self contained to deploy, so the content is copied. The
  originals under Writings/ are never moved, altered, or symlinked.

  Body text is never touched. Frontmatter is prepended above the existing
  content and nothing below it changes.

  Run with --check to compare titles and report without writing anything.
*/

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SPEC = resolve(here, '../../Claude - Site Details');
const VAULT = resolve(here, '../../Writings');
const CONTENT = resolve(here, '../src/content');

const DRY = process.argv.includes('--check');

const SOURCE_DIRS = {
  writing: join(VAULT, "Blog Writings/Jackson's Blogs"),
  analysis: join(VAULT, "Article & Analysis Writings/Jackson's Articles - Supply Chain and Tech Trends"),
  library: join(VAULT, "Book Reviews Writings/Jackson's Book Reviews"),
};

const SPEC_FILES = {
  writing: '05-content-metadata-writing.md',
  analysis: '06-content-metadata-analysis.md',
  library: '07-content-metadata-library.md',
};

/* ---- Parse the yaml blocks out of a metadata file ------------------------ */

const parseBlocks = (md) =>
  [...md.matchAll(/```yaml\n([\s\S]*?)```/g)].map((m) => {
    const record = {};
    const lines = m[1].split('\n').filter((l) => l.trim());

    for (const line of lines) {
      const at = line.indexOf(':');
      const key = line.slice(0, at).trim();
      let value = line.slice(at + 1).trim();

      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      record[key] = value;
    }

    /* Keep the block verbatim so it can be written back exactly as given. */
    record.__raw = m[1].trimEnd();
    return record;
  });

/*
  ---- Year read, extracted from the entry body -----------------------------

  01-build-spec.md section 2: library entries carry `yearRead`, required. File 07
  writes no value for it, so the source is the entry itself, which opens
  "**Title**, Author, published. Read YYYY." where the year is known.

  Taken only from what the entry actually says. Nothing is inferred from the
  publication year, the file's modification time, or context. Entries that do not
  state one get the placeholder and are reported.
*/
export const NO_YEAR = '⟦YYYY⟧';

const yearRead = (body) => {
  const opening = body.split('\n').find((l) => l.trim()) ?? '';
  /* "Read 2025." after the publication year, in the standing line. */
  return opening.match(/\bRead\s+((?:19|20)\d{2})\b/)?.[1] ?? null;
};

/* ---- Read the title as written inside a source file ---------------------- */

const writtenTitle = (body, collection) => {
  const firstLine = body.split('\n').find((l) => l.trim());
  if (!firstLine) return null;

  if (collection === 'library') {
    /* Entries open "**Title**, Author, year." */
    return firstLine.match(/^\*\*(.+?)\*\*/)?.[1]?.trim() ?? null;
  }

  /* Essays and analysis pieces open with an h1. */
  return firstLine.replace(/^#\s*/, '').trim();
};

/* ---- Match a metadata record to its source file -------------------------- */

const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const matchFile = (record, files, collection) => {
  if (collection === 'analysis') {
    /* Source filenames carry a numeric ordering prefix the slug drops. */
    return files.find((f) => normalize(f.replace(/^\d+-/, '').replace(/\.md$/, '')) === normalize(record.slug));
  }
  return files.find((f) => normalize(f.replace(/\.md$/, '')) === normalize(record.title));
};

/* ---- Run ----------------------------------------------------------------- */

const mismatches = [];
const unmatched = [];
const plan = [];

for (const [collection, specFile] of Object.entries(SPEC_FILES)) {
  const records = parseBlocks(await readFile(join(SPEC, specFile), 'utf8'));
  const files = (await readdir(SOURCE_DIRS[collection])).filter((f) => f.endsWith('.md'));

  console.log(`\n${collection}: ${records.length} metadata records, ${files.length} source files`);

  for (const record of records) {
    let file = matchFile(record, files, collection);

    /* Library filenames are "Title - Author.md" and drift from the real title
       ("4 Hour Workweek" for "The 4 Hour Workweek"). Fall back to the title
       written inside each file, which is the authoritative one. */
    if (!file && collection === 'library') {
      for (const candidate of files) {
        const body = await readFile(join(SOURCE_DIRS[collection], candidate), 'utf8');
        if (normalize(writtenTitle(body, collection) ?? '') === normalize(record.title)) {
          file = candidate;
          break;
        }
      }
    }

    if (!file) {
      unmatched.push(`${collection}: no source file for "${record.title}"`);
      continue;
    }

    const body = await readFile(join(SOURCE_DIRS[collection], file), 'utf8');
    const written = writtenTitle(body, collection);

    if (written && normalize(written) !== normalize(record.title)) {
      mismatches.push({
        collection,
        file,
        written,
        metadata: record.title,
      });
    }

    plan.push({ collection, file, record, body, written });
  }
}

if (unmatched.length) {
  console.log('\nUNMATCHED');
  for (const u of unmatched) console.log(`  ${u}`);
}

if (mismatches.length) {
  console.log('\nTITLE MISMATCHES, source file vs metadata file');
  for (const m of mismatches) {
    console.log(`  [${m.collection}] ${m.file}`);
    console.log(`      written in file: "${m.written}"`);
    console.log(`      metadata says:   "${m.metadata}"`);
  }
} else {
  console.log('\ntitles: every source file agrees with its metadata record');
}

if (DRY) {
  console.log(`\ndry run, nothing written. ${plan.length} files would be created.`);
  process.exit(unmatched.length || mismatches.length ? 1 : 0);
}

if (unmatched.length || mismatches.length) {
  console.error('\nrefusing to write while a title disagrees or a file is unmatched');
  process.exit(1);
}

const undatedBooks = [];

for (const { collection, record, body } of plan) {
  await mkdir(join(CONTENT, collection), { recursive: true });

  let frontmatter = record.__raw;

  if (collection === 'library') {
    const year = yearRead(body);
    if (!year) undatedBooks.push(record.title);
    frontmatter += `\nyearRead: ${year ?? `"${NO_YEAR}"`}`;
  }

  const out = join(CONTENT, collection, `${record.slug}.md`);
  await writeFile(out, `---\n${frontmatter}\n---\n\n${body.replace(/^\n+/, '')}`);
}

console.log(`\nwrote ${plan.length} files into src/content`);

if (undatedBooks.length) {
  console.log(`\n${undatedBooks.length} library entries do not state a year read:`);
  for (const t of undatedBooks) console.log(`  ${t}`);
}
