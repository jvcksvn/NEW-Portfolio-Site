import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.avif':'image/avif','.svg':'image/svg+xml'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()) p=join(p,'index.html'); }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
await new Promise(res=>server.listen(4321,res));
const b=await chromium.launch();
for (const w of [1440,1280,1024,900,768]) {
  const p=await b.newPage({viewport:{width:w,height:1000}});
  await p.goto('http://localhost:4321/projects',{waitUntil:'networkidle'});
  await p.waitForTimeout(800);
  console.log(`\n== ${w}px ==`);
  console.log(await p.evaluate(()=>{
    const out=[];
    for (const cell of document.querySelectorAll('.stat')) {
      const fig=cell.querySelector('.figure, .mark');
      if(!fig) continue;
      const c=cell.getBoundingClientRect(), f=fig.getBoundingClientRect();
      const pad=parseFloat(getComputedStyle(cell).paddingLeft);
      const avail=c.width-pad*2;
      const over = f.width > avail + 0.5;
      const label=(cell.querySelector('.stat-label')?.textContent||'').trim().slice(0,22);
      out.push(`  ${label.padEnd(24)} figure ${Math.round(f.width)}px in ${Math.round(avail)}px usable ${over?'OVERFLOWS by '+Math.round(f.width-avail)+'px':'fits'}`);
    }
    return out.join('\n');
  }));
  const base=await p.evaluate(()=>{
    const tile=document.querySelectorAll('.case-tile')[0];
    const figs=[...tile.querySelectorAll('.figure')];
    return figs.map(f=>Math.round(f.getBoundingClientRect().bottom));
  });
  console.log(`  case 01 figure baselines (bottom y): ${base.join(', ')} ${new Set(base).size===1?'aligned':'MISALIGNED'}`);
  await p.close();
}
await b.close();server.close();
