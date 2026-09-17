import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
server.on('error',e=>{console.error('bind',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844}});
const p=await ctx.newPage();
await p.addInitScript(()=>{window.__s=[];new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;
  window.__s.push({v:+e.value.toFixed(4),src:(e.sources||[]).map(s=>{const n=s.node;return n?(n.tagName||'')+'.'+((n.className||'').toString().split(' ')[0]):'?'}).slice(0,3)})}}).observe({type:'layout-shift',buffered:true})});
await p.goto('http://localhost:4321'+(process.argv[2]||'/library'),{waitUntil:'networkidle'});
await p.waitForTimeout(3000);
for (const s of await p.evaluate(()=>window.__s)) console.log('  shift',s.v,'->',s.src.join(', '));
await b.close();server.close();
