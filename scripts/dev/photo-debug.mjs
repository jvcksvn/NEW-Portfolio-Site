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
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://localhost:4321/about',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
console.log(await p.evaluate(()=>{
  const rail=document.querySelector('[data-photo-rail]');
  const track=rail.querySelector('[data-track]');
  const strip=rail.querySelector('.strip');
  const photos=[...rail.querySelectorAll('.photo')];
  const out=[];
  out.push(`track clientWidth ${track.clientWidth} scrollWidth ${track.scrollWidth} scrollLeft ${Math.round(track.scrollLeft)} maxScroll ${track.scrollWidth-track.clientWidth}`);
  out.push(`strip padding-inline ${getComputedStyle(strip).paddingLeft} / ${getComputedStyle(strip).paddingRight}`);
  out.push(`snap type ${getComputedStyle(track).scrollSnapType}`);
  const tr=track.getBoundingClientRect(); const tc=tr.left+tr.width/2;
  out.push(`track rect centre ${Math.round(tc)}`);
  photos.forEach((ph,i)=>{
    const r=ph.getBoundingClientRect(); const c=r.left+r.width/2;
    out.push(`  photo ${i+1}: rect ${Math.round(r.left)}..${Math.round(r.right)} centre ${Math.round(c)} delta ${Math.round(c-tc)} | offsetParent ${ph.offsetParent?.className||'null'}`);
  });
  // try scrolling to photo 3 directly
  const t=photos[2];
  t.scrollIntoView({inline:'center',block:'nearest',behavior:'auto'});
  out.push(`after scrollIntoView on photo 3: scrollLeft ${Math.round(track.scrollLeft)}`);
  return out.join('\n');
}));
await p.waitForTimeout(600);
console.log(await p.evaluate(()=>{
  const track=document.querySelector('[data-track]');
  return `  settled scrollLeft ${Math.round(track.scrollLeft)}`;
}));
await b.close();server.close();
