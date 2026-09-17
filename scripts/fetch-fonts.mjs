/*
  Downloads the woff2 files the site needs and writes them to public/fonts.

  02-design-system.md section 3 requires self hosting: Google Fonts cost roughly
  830ms of render blocking on mobile and a third party connection on every page.

  Google's CSS already splits each family into per subset files, so requesting it
  with a modern browser user agent and keeping only the blocks whose unicode-range
  is the latin subset gives latin subset woff2 files without a local subsetter.
*/

import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/fonts');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/* The latin subset range Google emits. Matched by its opening codepoints. */
const LATIN_START = 'U+0000-00FF';

const FAMILIES = [
  { css: 'Archivo:wdth,wght@62..125,100..900', name: 'archivo-variable' },
  { css: 'IBM+Plex+Sans:wght@400', name: 'plex-sans-400' },
  { css: 'IBM+Plex+Sans:wght@600', name: 'plex-sans-600' },
  { css: 'IBM+Plex+Mono:wght@400', name: 'plex-mono-400' },
  { css: 'IBM+Plex+Mono:wght@500', name: 'plex-mono-500' },
];

for (const family of FAMILIES) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.css}&display=swap`;
  const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();

  const blocks = css.split('@font-face').slice(1);
  const latin = blocks.find(
    (b) => b.includes(LATIN_START) && !b.includes('U+0100-02BA'),
  );

  if (!latin) {
    console.error(`no latin block for ${family.name}`);
    continue;
  }

  const url = latin.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  if (!url) {
    console.error(`no woff2 url for ${family.name}`);
    continue;
  }

  const bytes = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
  await writeFile(resolve(OUT, `${family.name}.woff2`), bytes);
  console.log(`${family.name.padEnd(18)} ${(bytes.length / 1024).toFixed(1).padStart(6)} KB  ${url.split('/').pop()}`);
}
