/* CLS under Lighthouse-like throttling, which is where the non zero numbers
   appeared. Unthrottled local loads never reproduce them. */
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
for (const route of process.argv.slice(2)) {
  /* Lighthouse's emulated mobile exactly: 412x823 at DPR 1.75, 4x CPU,
     1.6 Mbps down with 150ms RTT. Moto G4's 360x640 did not reproduce it. */
  const ctx=await b.newContext({viewport:{width:412,height:823},deviceScaleFactor:1.75,isMobile:true,hasTouch:true,
    userAgent:'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36'});
  const p=await ctx.newPage();
  const cdp=await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1638400/8,uploadThroughput:768000/8});
  await p.addInitScript(()=>{window.__s=[];new PerformanceObserver(l=>{for(const e of l.getEntries()){if(e.hadRecentInput)continue;
    window.__s.push({v:+e.value.toFixed(4),src:(e.sources||[]).map(s=>{const n=s.node;return n?(n.tagName||'')+'.'+((n.className||'').toString().split(' ')[0]):'?'}).slice(0,3)})}}).observe({type:'layout-shift',buffered:true})});
  await p.goto('http://localhost:4321'+route,{waitUntil:'load'});
  await p.waitForTimeout(2500);
  /* Lighthouse scrolls the page during gathering, which is what triggers the
     lazy images. A plain load never reaches them, so it never saw the shift. */
  await p.evaluate(async()=>{
    const step=Math.round(window.innerHeight*0.8);
    for(let y=0;y<document.body.scrollHeight;y+=step){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,250));}
    window.scrollTo(0,0);
  });
  await p.waitForTimeout(3000);
  const shifts=await p.evaluate(()=>window.__s);
  const total=shifts.reduce((a,s)=>a+s.v,0);
  console.log(`== ${route}  total ${total.toFixed(4)}`);
  for (const s of shifts) console.log('   shift',s.v,'->',s.src.join(', '));
  if (!shifts.length) console.log('   no shifts');
  await ctx.close();
}
await b.close();server.close();
