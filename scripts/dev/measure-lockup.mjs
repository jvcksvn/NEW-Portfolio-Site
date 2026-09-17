import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(`<!doctype html><html><head>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap">
<style>
body{margin:0;font-family:Archivo,sans-serif}
span{display:inline-block;font-size:200px;line-height:.84;white-space:nowrap}
#a{font-variation-settings:'wdth' 75,'wght' 800;letter-spacing:-0.03em}
#b{font-variation-settings:'wdth' 100,'wght' 200;letter-spacing:-0.01em}
</style></head><body>
<div><span id="a">JACKSON</span></div><div><span id="b">BARKER</span></div>
</body></html>`);
await p.waitForFunction(() => document.fonts.ready.then(() => document.fonts.check('800 200px Archivo')));
await p.waitForTimeout(1200);
const r = await p.evaluate(() => {
  const g = id => { const e=document.getElementById(id); const x=e.getBoundingClientRect(); return {w:x.width,h:x.height}; };
  return { a:g('a'), b:g('b'), fonts:[...document.fonts].map(f=>`${f.family} ${f.weight} ${f.stretch||''}`).slice(0,6) };
});
console.log(JSON.stringify(r,null,2));
console.log('ratio JACKSON/BARKER =', (r.a.w/r.b.w).toFixed(4));
console.log('delta px @200 =', (r.a.w-r.b.w).toFixed(1));
await b.close();
