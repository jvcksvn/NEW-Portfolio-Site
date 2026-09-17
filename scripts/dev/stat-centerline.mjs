/* All nine figures on one centreline, all nine labels on one top edge. */
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
  await p.waitForTimeout(900);
  console.log(`\n== ${w}px ==`);
  console.log(await p.evaluate(()=>{
    const cells=[...document.querySelectorAll('.stat')];
    const rows=cells.map(c=>c.querySelector('.row-figure').getBoundingClientRect());
    const mids=rows.map(r=>Math.round((r.top+r.bottom)/2));
    const labs=cells.map(c=>Math.round(c.querySelector('.row-label').getBoundingClientRect().top));
    const names=cells.map(c=>(c.querySelector('.row-label').textContent||'').trim().slice(0,20));
    const inkMid=cells.map(c=>{
      const el=c.querySelector('.figure')||c.querySelector('.mark');
      const r=el.getBoundingClientRect();
      return Math.round((r.top+r.bottom)/2);
    });
    const u=(a)=>[...new Set(a)];
    return [
      `  figure ROW centres: ${u(mids).length===1?'all nine share '+mids[0]:'SPLIT '+u(mids).join(', ')}`,
      `  label top edges:    ${u(labs).length===1?'all nine share '+labs[0]:'SPLIT '+u(labs).join(', ')}`,
      `  rendered content centres: ${inkMid.join(', ')}  spread ${Math.max(...inkMid)-Math.min(...inkMid)}px`,
      `  cells: ${names.join(' | ')}`,
    ].join('\n');
  }));
  await p.close();
}
await b.close();server.close();
