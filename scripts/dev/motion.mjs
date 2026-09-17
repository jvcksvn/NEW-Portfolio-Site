import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
// build.format is 'file', so /projects is both projects.html and a projects/
// directory. Prefer the .html file, then the directory index.
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
server.on('error',e=>{console.error('static server could not bind 4321:',e.code,'\n  a dev server is probably running; measurements would hit it instead of dist');process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
for (const motion of ['reduce','no-preference']) {
  const ctx=await b.newContext({viewport:{width:1280,height:900},reducedMotion:motion==='reduce'?'reduce':'no-preference'});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  const r=await p.evaluate(()=>{
    const els=[...document.querySelectorAll('.reveal')];
    const hidden=els.filter(e=>{const s=getComputedStyle(e);return parseFloat(s.opacity)<0.99});
    return {reveals:els.length, invisible:hidden.length,
      opacities:els.map(e=>+getComputedStyle(e).opacity.slice(0,4))};
  });
  console.log(`prefers-reduced-motion: ${motion.padEnd(14)} reveal blocks ${r.reveals}, below full opacity at rest: ${r.invisible}`);
  console.log(`  opacities: ${r.opacities.join(', ')}`);
  await ctx.close();
}
await b.close();server.close();
