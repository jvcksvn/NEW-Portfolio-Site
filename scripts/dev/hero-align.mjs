/* 02 section 6: the image's top edge sits level with the cap height of JACKSON. */
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
console.log('width   JACKSON cap top   image top   delta');
for (const w of [1024,1280,1440,1600]) {
  const ctx=await b.newContext({viewport:{width:w,height:900}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>{
    const span=document.querySelector('.t-hero');
    const img=document.querySelector('.col-image img');
    if(!span||!img) return null;
    const box=span.getBoundingClientRect();
    const cs=getComputedStyle(span);
    const fs=parseFloat(cs.fontSize);
    const lh=parseFloat(cs.lineHeight);
    /* Archivo cap height is about 0.73em. The glyph top sits at the line box
       top plus half the leading, plus the gap from ascender to cap. */
    const halfLeading=(lh-fs)/2;
    const capTop=box.top+halfLeading+fs*0.245;
    return {capTop, imgTop: img.getBoundingClientRect().top};
  });
  if(!r){console.log(`${w}px  could not measure`);continue}
  console.log(`${String(w).padStart(5)}px ${r.capTop.toFixed(0).padStart(14)} ${r.imgTop.toFixed(0).padStart(11)} ${(r.imgTop-r.capTop).toFixed(0).padStart(8)}px`);
  await ctx.close();
}
await b.close();server.close();
