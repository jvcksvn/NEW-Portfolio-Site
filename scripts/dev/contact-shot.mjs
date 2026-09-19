import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.avif':'image/avif','.svg':'image/svg+xml'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()) p=join(p,'index.html'); }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
await new Promise(res=>server.listen(4321,res));
const b=await chromium.launch();
for (const [w,name] of [[1440,'contact'],[560,'contact-narrow']]) {
  const p=await b.newPage({viewport:{width:w,height:1100},deviceScaleFactor:2});
  await p.goto('http://localhost:4321/contact',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  await p.screenshot({path:`/tmp/${name}.png`});
  await p.close();
}
await b.close();server.close();
