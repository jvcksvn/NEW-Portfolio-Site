/* The landing slot's reservation must match the server rendered planner panel
   at every width, or it either shifts (too small) or leaves dead space (too big). */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
// build.format is 'file', so /projects is both projects.html and a projects/
// directory. Prefer the .html file, then the directory index.
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
server.on('error',e=>{console.error('could not bind 4321:',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
console.log('width   planner panel   viewport box   delta');
for (const w of [320,360,390,480,768,1024,1280,1440,1600]) {
  const ctx=await b.newContext({viewport:{width:w,height:900}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
  await p.waitForTimeout(1400);
  const r=await p.evaluate(()=>({
    panel: document.getElementById('asset-panel-planner')?.offsetHeight ?? 0,
    vp: document.querySelector('.asset-viewport')?.offsetHeight ?? 0,
  }));
  console.log(`${String(w).padStart(5)}px ${String(r.panel).padStart(11)}px ${String(r.vp).padStart(12)}px ${String(r.vp-r.panel).padStart(7)}px`);
  await ctx.close();
}
await b.close();server.close();
