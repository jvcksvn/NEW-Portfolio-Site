/* Measures the positioning statement's longest line against the column widths
   the yield order in 03 allows, using the self hosted Archivo file. */
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const font = await readFile('public/fonts/archivo-variable.woff2');
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(`<!doctype html><html><head><style>
@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${font.toString('base64')}) format('woff2-variations');font-weight:200 800;font-stretch:75% 100%;font-display:block}
body{margin:0;font-family:Archivo,sans-serif}
#t{display:inline-block;font-size:64px;font-weight:700;letter-spacing:-0.02em;line-height:1.02;white-space:nowrap}
</style></head><body><span id="t">X</span></body></html>`);
await p.waitForFunction(()=>document.fonts.ready.then(()=>true));
await p.waitForTimeout(600);

const LINES = ['PLANNING ASSUMES','THE PART HOLDS STILL.','MINE MOVED WHILE','THE LINE RAN.'];
const widths = [];
for (const line of LINES) {
  const w = await p.evaluate((t)=>{const e=document.getElementById('t');e.textContent=t;return e.getBoundingClientRect().width;}, line);
  widths.push({line, w, ratio: w/64});
  console.log(`  ${line.padEnd(23)} ${line.length} chars  ${w.toFixed(1)}px @64px  ratio ${(w/64).toFixed(3)}`);
}
const worst = widths.reduce((a,c)=>c.ratio>a.ratio?c:a);
console.log(`\nlongest: "${worst.line}" at ${worst.ratio.toFixed(3)} x font-size\n`);

const CONTENT = 1120, GUTTER = 24;
for (const [colPct, subhead] of [[0.60,400],[0.68,340],[0.68,340]]) {
  const byPct = CONTENT*colPct;
  const bySubhead = CONTENT - GUTTER - subhead;
  const col = Math.min(byPct, bySubhead);
  console.log(`  column ${(colPct*100).toFixed(0)}% with ${subhead}px subhead -> statement column ${col.toFixed(0)}px -> max font-size ${(col/worst.ratio).toFixed(1)}px  (${(col/worst.ratio/CONTENT*100).toFixed(2)}cqw)`);
}
await b.close();
