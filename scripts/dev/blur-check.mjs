import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()) p=join(p,'index.html'); }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
await new Promise(res=>server.listen(4321,res));
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
console.log(await p.evaluate(()=>{
  const out=[];
  for (const id of ['essays','analysis','library']) {
    const root=document.querySelector(`[data-carousel="${id}"]`);
    if(!root) { out.push(`  ${id}: missing`); continue; }
    const items=[...root.querySelectorAll('.item')];
    const active=items.findIndex(i=>i.dataset.center==='true');
    const pos=root.querySelector('[data-position]')?.textContent;
    out.push(`\n  ${id}: opens at ${pos}, ${items.filter(i=>i.dataset.state!=='hidden').length} visible`);
    const seen=new Map();
    items.forEach((it,i)=>{
      const d=Math.abs(i-active);
      if(it.dataset.state==='hidden'||seen.has(d))return;
      const cs=getComputedStyle(it);
      const fr=getComputedStyle(it.querySelector('.frame'));
      const ti=getComputedStyle(it.querySelector('.title'));
      seen.set(d,`    distance ${d}: ${it.dataset.state.padEnd(5)} blur ${cs.filter.padEnd(12)} thumb opacity ${fr.opacity.padEnd(4)} title ${ti.color}`);
    });
    for(const [,v] of [...seen].sort((a,b)=>a[0]-b[0])) out.push(v);
  }
  return out.join('\n');
}));
await b.close();server.close();
