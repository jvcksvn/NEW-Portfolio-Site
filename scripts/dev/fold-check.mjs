/* Does the hero image intersect the initial viewport on small screens? */
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
const sizes=[[320,568],[360,640],[375,667],[390,844],[412,823],[414,896],[430,932],[480,800],[600,900],[767,1024]];
console.log('viewport      image top   viewport h   intersects initial viewport');
for (const [w,h] of sizes) {
  const ctx=await b.newContext({viewport:{width:w,height:h}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1100);
  const r=await p.evaluate(()=>{
    const img=document.querySelector('.col-image img').getBoundingClientRect();
    return {top:img.top,bottom:img.bottom,vh:innerHeight};
  });
  const intersects = r.top < r.vh;
  const px = intersects ? Math.round(Math.min(r.bottom,r.vh)-r.top) : 0;
  console.log(`${(w+'x'+h).padEnd(12)} ${r.top.toFixed(0).padStart(9)}px ${String(r.vh).padStart(11)}px   ${intersects?`YES, ${px}px visible`:'no, fully below the fold'}`);
  await ctx.close();
}
await b.close();server.close();
