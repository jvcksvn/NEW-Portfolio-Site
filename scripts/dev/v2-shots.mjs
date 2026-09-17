import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
server.on('error',e=>{console.error('bind',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
for (const [name,path,w,h] of [['hero','/',1440,900],['writing-idx','/writing',1440,1400],['resume','/resume',1440,1600],['about','/about',1440,1800]]) {
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1.4});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321'+path,{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  await p.screenshot({path:`/tmp/v2-${name}.png`});
  console.log(name,'captured');
  await ctx.close();
}
await b.close();server.close();
