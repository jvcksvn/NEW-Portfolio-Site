import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
// build.format is 'file', so /projects is both projects.html and a projects/
// directory. Prefer the .html file, then the directory index.
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
server.on('error',e=>{console.error('static server could not bind 4321:',e.code,'\n  a dev server is probably running; measurements would hit it instead of dist');process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
console.log('viewport  content   statement col   font-size   longest line   fits');
for (const w of [1024,1120,1280,1440,1600]) {
  const ctx=await b.newContext({viewport:{width:w,height:900}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1000);
  const r=await p.evaluate(()=>{
    const g=document.querySelector('.grid');
    const h=document.querySelector('.statement');
    const sub=document.querySelector('.subhead');
    // widest rendered line box of the statement
    let widest=0;
    for(const rect of h.getClientRects()) widest=Math.max(widest,rect.width);
    // Line box positions, not element rects: padding-top sits inside the box,
    // so the element rect would report the padding edge rather than the text.
    const lineTops = t => { const r=document.createRange(); r.selectNodeContents(t);
      return [...r.getClientRects()].map(x=>x.top); };
    const stLines = h.getClientRects().length ? lineTops(h) : [];
    const subLines = lineTops(sub);
    return {content:g.getBoundingClientRect().width, col:h.getBoundingClientRect().width,
      size:parseFloat(getComputedStyle(h).fontSize), widest, subW:sub.getBoundingClientRect().width,
      stLast: stLines.length ? stLines[stLines.length-1] : null,
      subFirst: subLines.length ? subLines[0] : null};
  });
  const delta = (r.subFirst!==null && r.stLast!==null) ? (r.subFirst - r.stLast) : NaN;
  console.log(`${String(w).padStart(6)}px ${r.content.toFixed(0).padStart(8)} ${r.col.toFixed(0).padStart(13)} ${r.size.toFixed(1).padStart(11)}px ${r.widest.toFixed(0).padStart(13)}px  ${r.widest<=r.col+1?'yes':'NO'}   subhead ${r.subW.toFixed(0)}px, first line vs statement last line ${delta>=0?'+':''}${delta.toFixed(0)}px`);
  await ctx.close();
}
await b.close();server.close();
