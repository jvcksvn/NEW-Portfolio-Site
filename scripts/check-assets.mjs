/*
  Verifies every piece and every entry has its image, per 11.

  11: "Every one of the fifteen pieces has a thumbnail and every one of the
  twenty three entries has a cover. No placeholder image is ever generated. If a
  file is missing, the card ships without an image and the omission is reported."
*/
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const src = await readFile(join(root, 'src/data/assets.ts'), 'utf8');

const mapOf = (name) => {
  const block = src.slice(src.indexOf(`export const ${name}`));
  const body = block.slice(block.indexOf('{'), block.indexOf('};'));
  return new Set([...body.matchAll(/^\s+'?([a-z0-9-]+)'?:/gm)].map((m) => m[1]));
};

const collections = { writing: mapOf('ESSAY_THUMBS'), analysis: mapOf('ANALYSIS_THUMBS'), library: mapOf('COVERS') };
let missing = 0;

for (const [name, mapped] of Object.entries(collections)) {
  const files = (await readdir(join(root, 'src/content', name))).filter((f) => f.endsWith('.md'));
  const slugs = new Set();
  for (const f of files) {
    const raw = await readFile(join(root, 'src/content', name, f), 'utf8');
    slugs.add(raw.match(/^slug:\s*(.+)$/m)[1].trim());
  }
  const without = [...slugs].filter((s) => !mapped.has(s));
  const orphan = [...mapped].filter((s) => !slugs.has(s));
  console.log(`  ${name.padEnd(9)} ${slugs.size} entries, ${mapped.size} images mapped, ${without.length} without an image`);
  for (const s of without) { console.log(`     no image: ${s}`); missing++; }
  for (const s of orphan) console.log(`     image maps to no entry: ${s}`);
}

console.log(missing === 0 ? '\nassets: every piece and every entry has its image' : `\nassets: ${missing} without an image, shipping imageless and reported`);
