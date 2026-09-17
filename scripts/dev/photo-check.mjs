/* No photo is cropped at any breakpoint, and the ratios survive. */
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
for (const w of [1600,1440,1280,1024,768,480,360]) {
  const p=await b.newPage({viewport:{width:w,height:1000}});
  await p.goto('http://localhost:4321/about',{waitUntil:'networkidle'});
  await p.waitForTimeout(1400);
  console.log(await p.evaluate((vw)=>{
    const rail=document.querySelector('[data-photo-rail]');
    if(!rail) return `  ${vw}px: RAIL MISSING`;
    const imgs=[...rail.querySelectorAll('img')];
    const rows=imgs.map(i=>{
      const r=i.getBoundingClientRect();
      const nat={w:Number(i.getAttribute('width')),h:Number(i.getAttribute('height'))};
      const cs=getComputedStyle(i);
      const natRatio=nat.w/nat.h, renRatio=r.width/r.height;
      return {ok:Math.abs(natRatio-renRatio)<0.02 && cs.objectFit==='fill', w:Math.round(r.width), h:Math.round(r.height), nr:natRatio.toFixed(3), rr:renRatio.toFixed(3), fit:cs.objectFit};
    });
    const bad=rows.filter(r=>!r.ok);
    const heights=[...new Set(rows.map(r=>r.h))];
    return `  ${String(vw).padStart(4)}px  heights ${heights.join('/')}  widths ${rows.map(r=>r.w).join(',')}  ${bad.length? 'CROPPED: '+JSON.stringify(bad) : 'no crop, ratios intact'}`;
  }, w));
  await p.close();
}
await b.close();server.close();
