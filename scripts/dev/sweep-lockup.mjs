import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(`<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap">
<style>body{margin:0;font-family:Archivo,sans-serif}
span{display:inline-block;font-size:200px;line-height:.84;white-space:nowrap}</style>
</head><body><span id="t">X</span></body></html>`);
await p.waitForFunction(() => document.fonts.ready.then(() => true));
await p.waitForTimeout(1500);

const measure = (text, wdth, wght, ls) => p.evaluate(([text,wdth,wght,ls]) => {
  const e = document.getElementById('t');
  e.textContent = text;
  e.style.fontVariationSettings = `'wdth' ${wdth},'wght' ${wght}`;
  e.style.letterSpacing = `${ls}em`;
  const w = e.getBoundingClientRect().width;
  // CSS adds trailing letter-spacing after the last glyph; subtract it.
  return w - (ls * 200);
}, [text, wdth, wght, ls]);

const jackson = await measure('JACKSON', 75, 800, -0.03);
console.log(`JACKSON  wdth75 wght800 ls-0.03  => ${jackson.toFixed(1)}px  (target)`);
console.log('');
console.log('BARKER candidates, wght 200, solving letter-spacing to hit target:');
for (const wdth of [78, 82, 86, 90, 94, 100]) {
  const base = await measure('BARKER', wdth, 200, 0);
  const gaps = 'BARKER'.length - 1;              // 5 inter-letter gaps
  const ls = (jackson - base) / gaps / 200;      // em needed per gap
  const check = await measure('BARKER', wdth, 200, ls);
  console.log(`  wdth ${String(wdth).padStart(3)}  natural ${base.toFixed(1).padStart(7)}  ls ${ls>=0?'+':''}${ls.toFixed(4)}em  => ${check.toFixed(1)}px`);
}
await b.close();
