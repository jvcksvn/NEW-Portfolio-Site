/*
  Generates the served assets from the sources in ../../Images.

  Run once, checked into public/. Re-run when a source asset changes.

  Favicon: JB Favicon - White.png is a white mark on transparency, invisible in
  a light browser tab, so it is composited onto a solid cobalt ground matching
  the nav's brand dot.

  Hero: Hero Image.png is a 1254px square illustration on a near white ground
  (#FBFAF6) that does not quite match --bg (#F8F8F5). The ground is keyed to
  transparent so the illustration sits directly on the page token at any future
  palette change. Never upscaled past the source width.
*/

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '../../Images');
const PUB = resolve(here, '../public');

const COBALT = { r: 0x23, g: 0x55, b: 0xd8 };

await mkdir(resolve(PUB, 'images'), { recursive: true });

/* ---- Favicon set, white mark on a cobalt square ------------------------- */

const faviconSrc = resolve(SRC, 'JB Favicon - White.png');

const onCobalt = (size, pad) =>
  sharp(faviconSrc)
    .resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: { ...COBALT, alpha: 0 } })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { ...COBALT, alpha: 1 },
    })
    .flatten({ background: COBALT });

for (const [size, name] of [
  [16, 'favicon-16.png'],
  [32, 'favicon-32.png'],
  [180, 'apple-touch-icon.png'],
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
]) {
  const pad = Math.round(size * 0.12);
  await onCobalt(size, pad).png().toFile(resolve(PUB, name));
  console.log(`favicon  ${name}`);
}

/* favicon.ico carrying the 32px raster. */
await onCobalt(32, 4)
  .png()
  .toFile(resolve(PUB, 'favicon-ico-src.png'));

/* ---- Hero, ground keyed to transparent ---------------------------------- */

const heroSrc = resolve(SRC, 'Hero Image.png');
const meta = await sharp(heroSrc).metadata();
console.log(`hero source ${meta.width}x${meta.height}`);

/* Key out the baked near white ground. Tolerance is tight so the fine stipple
   in the particle field keeps its darker pixels rather than fringing. */
const { data, info } = await sharp(heroSrc).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const THRESHOLD = 244;
let keyed = 0;

for (let i = 0; i < data.length; i += info.channels) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
    data[i + 3] = 0;
    keyed++;
  }
}

console.log(`hero keyed ${((keyed / (info.width * info.height)) * 100).toFixed(1)}% of pixels to transparent`);

const heroTransparent = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: info.channels },
})
  .png()
  .toBuffer();

/*
  Two widths, never upscaled past the 1254px source.

  The 1024px variant was dropped after measurement: resampling the illustration's
  fine particle stipple generates high frequency noise that compresses worse than
  the untouched source, so hero-1024 came out larger than hero-1254. The 1:1
  source is both the sharpest and the smallest, and 768 covers small viewports.
*/
const widths = [480, 768, 1254];

for (const w of widths) {
  const resized = sharp(heroTransparent).resize(w, w, { fit: 'inside' });

  const webp = await resized
    .clone()
    .webp({ quality: 72, effort: 6, smartSubsample: true })
    .toFile(resolve(PUB, `images/hero-${w}.webp`));

  const avif = await resized
    .clone()
    .avif({ quality: 50, effort: 6 })
    .toFile(resolve(PUB, `images/hero-${w}.avif`));

  console.log(
    `hero     hero-${w}  avif ${(avif.size / 1024).toFixed(0)} KB, webp ${(webp.size / 1024).toFixed(0)} KB`,
  );
}

/* ---- Open Graph default, 1200x630 --------------------------------------- */

const ogText = 'Jackson Barker. Launch planning, electric vehicles.';
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F8F8F5"/>
  <text x="80" y="300" font-family="Archivo, Helvetica, Arial, sans-serif" font-size="150" font-weight="800" letter-spacing="-4" fill="#111111">JACKSON</text>
  <text x="80" y="430" font-family="Archivo, Helvetica, Arial, sans-serif" font-size="150" font-weight="200" letter-spacing="6" fill="#111111">BARKER</text>
  <rect x="80" y="482" width="48" height="2" fill="#F05A3F"/>
  <text x="80" y="540" font-family="IBM Plex Mono, Courier New, monospace" font-size="24" letter-spacing="3" fill="#626262">LAUNCH PLANNING, ELECTRIC VEHICLES</text>
</svg>`;

await sharp(Buffer.from(og)).png().toFile(resolve(PUB, 'og-default.png'));
console.log('og       og-default.png');
console.log(`og text  ${ogText}`);

/* ---- Favicon SVG, vector for the tab ------------------------------------ */

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#2355D8"/>
  <text x="16" y="22" font-family="Archivo, Helvetica, Arial, sans-serif" font-size="16" font-weight="800" text-anchor="middle" fill="#FFFFFF">JB</text>
</svg>`;

await writeFile(resolve(PUB, 'favicon.svg'), faviconSvg);
console.log('favicon  favicon.svg');
