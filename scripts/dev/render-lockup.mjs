import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewportSize:{width:1000,height:1100}, deviceScaleFactor:2 });
const cands = [[82,0.0832],[86,0.0520],[90,0.0207]];
const blocks = cands.map(([w,ls])=>`
  <div class="lk">
    <div class="tag">wdth ${w} &nbsp; tracking ${ls>=0?'+':''}${ls}em</div>
    <div class="j">JACKSON</div>
    <div class="k" style="font-variation-settings:'wdth' ${w},'wght' 200;letter-spacing:${ls}em;margin-right:${-ls}em">BARKER</div>
  </div>`).join('');
await p.setContent(`<!doctype html><html><head>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
body{margin:0;background:#F8F8F5;color:#111;font-family:Archivo,sans-serif;padding:40px 60px}
.lk{margin-bottom:56px}
.tag{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8A8A85;margin-bottom:14px}
.j,.k{font-size:118px;line-height:.84;white-space:nowrap}
.j{font-variation-settings:'wdth' 75,'wght' 800;letter-spacing:-0.03em;margin-right:0.03em}
</style></head><body>${blocks}</body></html>`);
await p.waitForFunction(()=>document.fonts.ready.then(()=>true));
await p.waitForTimeout(1800);
await p.screenshot({path:'/tmp/lockup-candidates.png',fullPage:true});
await b.close();
console.log('ok');
