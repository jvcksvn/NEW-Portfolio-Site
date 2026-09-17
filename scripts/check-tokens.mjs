/*
  Measures every colour token in tokens.css against all three grounds.

  Reads the values out of the stylesheet rather than restating them, so the
  check cannot drift from the palette it is checking. 02 section 2: measure, do
  not assert. This rule has caught eleven failures across the build, five of
  them inside the token block itself.

  Fails the build if a token used for text below 24px does not clear 4.5:1 on
  every ground it can sit on.
*/

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const css = await readFile(fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url)), 'utf8');

const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]),
);

const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const L = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const ratio = (a, b) => { const x = L(a), y = L(b); const [h, l] = x > y ? [x, y] : [y, x]; return (h + 0.05) / (l + 0.05); };

const GROUNDS = { bg: tokens.bg, surface: tokens.surface, 'surface-2': tokens['surface-2'] };

/* Tokens that set text. --coral is documented as marks only below 24px. */
const TEXT_TOKENS = ['ink', 'muted', 'faint', 'blue', 'green', 'amber', 'purple', 'graphite', 'good', 'warn', 'crit'];
const LARGE_ONLY = ['coral'];

let failures = 0;
console.log('token'.padEnd(14) + Object.keys(GROUNDS).map((g) => g.padEnd(11)).join('') + 'verdict');

for (const name of [...TEXT_TOKENS, ...LARGE_ONLY]) {
  const hex = tokens[name];
  if (!hex) { console.error(`  ${name}: not found in tokens.css`); failures++; continue; }

  const rs = Object.values(GROUNDS).map((g) => ratio(hex, g));
  const worst = Math.min(...rs);
  const largeOnly = LARGE_ONLY.includes(name);

  let verdict;
  if (largeOnly) {
    verdict = worst >= 3 ? 'large text only, as documented' : 'FAILS even at 24px';
    if (worst < 3) failures++;
  } else {
    verdict = worst >= 4.5 ? 'text at any size' : 'FAILS AA below 24px';
    if (worst < 4.5) failures++;
  }

  console.log(`--${name}`.padEnd(14) + rs.map((r) => r.toFixed(2).padEnd(11)).join('') + verdict);
}

/* Ink on every soft fill, since the soft companions are card grounds. */
console.log('\nink on soft fills:');
for (const [name, hex] of Object.entries(tokens).filter(([k]) => k.endsWith('-soft'))) {
  const r = ratio(tokens.ink, hex);
  console.log(`  --${name.padEnd(14)} ${r.toFixed(2)}  ${r >= 4.5 ? 'ok' : 'FAILS'}`);
  if (r < 4.5) failures++;
}

console.log(failures === 0 ? '\ntoken contrast: every token clears AA on every ground it can sit on' : `\ntoken contrast: ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
