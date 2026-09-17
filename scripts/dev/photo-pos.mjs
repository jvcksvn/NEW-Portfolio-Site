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
const probe=async(url,label,clickTab)=>{
  const ctx=await b.newContext({viewport:{width:1440,height:1000}});
  const p=await ctx.newPage();
  await p.addInitScript(()=>{window.__s=[];new PerformanceObserver(l=>{for(const e of l.getEntries()){if(!e.hadRecentInput)window.__s.push(+e.value.toFixed(4))}}).observe({type:'layout-shift',buffered:true})});
  await p.goto('http://localhost:4321'+url,{waitUntil:'networkidle'});
  await p.waitForTimeout(2200);
  if (clickTab) { await p.click(clickTab); await p.waitForTimeout(1200); }
  const cls=(await p.evaluate(()=>window.__s)).reduce((a,v)=>a+v,0);
  const info=await p.evaluate(()=>{
    const rail=document.querySelector('[data-photo-rail]');
    if(!rail) return 'rail missing';
    const track=rail.querySelector('[data-track]');
    const photos=[...rail.querySelectorAll('.photo')];
    const tb=track.getBoundingClientRect(); const mid=tb.left+tb.width/2;
    let best=0,g=Infinity;
    photos.forEach((ph,i)=>{const r=ph.getBoundingClientRect();const d=Math.abs(r.left+r.width/2-mid);if(d<g){g=d;best=i}});
    const c=photos[best].getBoundingClientRect(), t=track.getBoundingClientRect();
    const whole = c.left >= t.left-1 && c.right <= t.right+1;
    return `centred photo ${best+1} of ${photos.length}, readout "${rail.querySelector('[data-position]').textContent}", off centre by ${Math.round(g)}px, centred photo whole: ${whole}`;
  });
  console.log(`  ${label.padEnd(22)} CLS ${cls.toFixed(4)}  ${info}`);
  await ctx.close();
};
await probe('/about','/about');
await probe('/resume','/resume About tab','#asset-tab-about');
await probe('/','landing resume tab','#asset-tab-about');
await b.close();server.close();
