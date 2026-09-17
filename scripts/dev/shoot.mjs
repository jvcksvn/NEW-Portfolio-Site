import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon','.pdf':'application/pdf','.json':'application/json','.xml':'application/xml','.txt':'text/plain'};
const root='dist';
const server=createServer(async(req,res)=>{
  let p=join(root,decodeURIComponent(req.url.split('?')[0]));
  try{ if((await stat(p)).isDirectory()) p=join(p,'index.html'); }catch{ p=p+'.html'; }
  try{ const b=await readFile(p); res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'}); res.end(b); }
  catch{ try{ res.writeHead(404,{'content-type':'text/html'}); res.end(await readFile(join(root,'404.html'))); }catch{ res.writeHead(404); res.end('nf'); } }
});
server.on('error',e=>{console.error('static server could not bind 4321:',e.code,'\n  a dev server is probably running; measurements would hit it instead of dist');process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});

const b=await chromium.launch();
const widths=Number(process.argv[2])?[Number(process.argv[2])]:[1440];
for(const w of widths){
  const p=await b.newPage({viewportSize:{width:w,height:900},deviceScaleFactor:2});
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  await p.screenshot({path:`/tmp/land-${w}.png`,fullPage:true});
  const of=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,win:innerWidth}));
  console.log(`${w}px  scrollWidth ${of.doc} vs ${of.win} ${of.doc>of.win?'  <-- HORIZONTAL OVERFLOW':''}`);
  await p.close();
}
await b.close(); server.close();
