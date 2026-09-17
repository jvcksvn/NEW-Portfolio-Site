/* Measures the real height of every resume panel so the landing slot's
   reservation is a measured number rather than a guess. */
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
const tabs=['planner','intern','growth','tools','education','about'];
for (const [w,h,label] of [[1280,900,'desktop'],[390,844,'mobile']]) {
  const ctx=await b.newContext({viewport:{width:w,height:h}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
  await p.waitForSelector('.asset-panel.is-active',{timeout:15000});
  await p.waitForTimeout(1200);
  console.log(`\n${label} (${w}px)`);
  let max=0;
  for (const t of tabs) {
    await p.click(`#asset-tab-${t}`);
    await p.waitForTimeout(500);
    const hgt=await p.evaluate((id)=>document.getElementById(`asset-panel-${id}`)?.offsetHeight??0,t);
    max=Math.max(max,hgt);
    console.log(`  ${t.padEnd(10)} ${String(hgt).padStart(5)}px`);
  }
  console.log(`  tallest    ${String(max).padStart(5)}px  <- reserve this`);
  await ctx.close();
}
await b.close();server.close();
