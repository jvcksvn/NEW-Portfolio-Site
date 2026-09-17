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
for (const route of ['/about','/']) {
  const ctx=await b.newContext({viewport:{width:412,height:823},deviceScaleFactor:1.75,isMobile:true,hasTouch:true});
  const p=await ctx.newPage();
  await p.addInitScript(()=>{window["__lcp"]=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window["__lcp"].push({t:Math.round(e.startTime),tag:e.element?.tagName,cls:(e.element?.className||'').toString().slice(0,30),size:e.size})}).observe({type:'largest-contentful-paint',buffered:true});
    window["__scroll"]=[]; addEventListener('scroll',()=>window["__scroll"].push([Math.round(scrollX),Math.round(scrollY)]),{passive:true});});
  await p.goto('http://localhost:4321'+route,{waitUntil:'networkidle'});
  await p.waitForTimeout(2500);
  const r=await p.evaluate(()=>({lcp:window["__lcp"], scrolls:window["__scroll"].slice(0,6), sx:window.scrollX, sy:window.scrollY}));
  console.log(`  ${route}: ${r.lcp.length} LCP candidates ${JSON.stringify(r.lcp)}`);
  console.log(`     window scrolled during load: ${JSON.stringify(r.scrolls)} final ${r.sx},${r.sy}`);
  await ctx.close();
}
await b.close();server.close();
