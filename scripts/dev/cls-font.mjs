/* Delay only the font files. If the shift is the swap, this reproduces it and
   nothing else changes. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
await new Promise(res=>server.listen(4321,res));
const b=await chromium.launch();
const desktop=process.argv[2]==='desktop';
const routes=desktop?process.argv.slice(3):process.argv.slice(2);
for (const route of routes) {
  const ctx=desktop
    ? await b.newContext({viewport:{width:1350,height:940}})
    : await b.newContext({viewport:{width:412,height:823},deviceScaleFactor:1.75,isMobile:true,hasTouch:true});
  const p=await ctx.newPage();
  await p.route('**/fonts/*.woff2', async r=>{ await new Promise(s=>setTimeout(s,1200)); await r.continue(); });
  await p.addInitScript(()=>{window.__s=[];new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;
    window.__s.push({v:+e.value.toFixed(4),src:(e.sources||[]).map(s=>{const n=s.node;return n?(n.tagName||'#text')+'.'+((n.className||'').toString().split(' ')[0]):'?'}).slice(0,3)})}}).observe({type:'layout-shift',buffered:true})});
  await p.goto('http://localhost:4321'+route,{waitUntil:'load'});
  await p.waitForTimeout(4000);
  const shifts=await p.evaluate(()=>window.__s);
  console.log(`== ${route}  total ${shifts.reduce((a,s)=>a+s.v,0).toFixed(4)}`);
  for (const s of shifts) console.log('   shift',s.v,'->',s.src.join(', '));
  if(!shifts.length) console.log('   no shifts');
  await ctx.close();
}
await b.close();server.close();
