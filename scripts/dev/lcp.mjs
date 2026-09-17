import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
// build.format is 'file', so /projects is both projects.html and a projects/
// directory. Prefer the .html file, then the directory index.
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});

const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:412,height:823},deviceScaleFactor:1.75});
const p=await ctx.newPage();
const cdp=await ctx.newCDPSession(p);
await cdp.send('Network.enable');
// Lighthouse mobile: 1.6 Mbps down, 150ms RTT, 4x CPU
await cdp.send('Network.emulateNetworkConditions',{offline:false,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8,latency:150});
await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});

await p.addInitScript(()=>{
  window.__lcp=[];
  new PerformanceObserver(l=>{for(const e of l.getEntries())
    window.__lcp.push({t:Math.round(e.startTime),size:e.size,tag:e.element?.tagName,cls:e.element?.className,url:e.url||''});
  }).observe({type:'largest-contentful-paint',buffered:true});
});
await p.goto('http://localhost:4321/',{waitUntil:'load'});
await p.waitForTimeout(6000);
const r=await p.evaluate(()=>window.__lcp);
console.log('LCP candidates in order:');
for(const c of r) console.log(`  ${String(c.t).padStart(5)}ms  ${String(c.tag).padEnd(7)} size ${String(c.size).padStart(7)}  ${c.cls||''} ${c.url}`);
console.log(`\nfinal LCP: ${r.length?r[r.length-1].t:'n/a'}ms`);
await b.close();server.close();
