import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
server.on('error',e=>{console.error('bind',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
for (const [name,path,h] of [['writing','/writing',1500],['contact','/contact',1200],['about','/about',1100]]) {
  const ctx=await b.newContext({viewport:{width:1280,height:h},deviceScaleFactor:1.5});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321'+path,{waitUntil:'networkidle'});
  await p.waitForTimeout(1300);
  await p.screenshot({path:`/tmp/${name}.png`});
  console.log(name,'captured');
  await ctx.close();
}
await b.close();server.close();
