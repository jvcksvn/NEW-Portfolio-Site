import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon','.pdf':'application/pdf','.json':'application/json','.xml':'application/xml','.txt':'text/plain'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
// build.format is 'file', so /projects is both projects.html and a projects/
// directory. Prefer the .html file, then the directory index.
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
server.on('error',e=>{console.error('static server could not bind 4321:',e.code,'\n  a dev server is probably running; measurements would hit it instead of dist');process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch({args:['--force-device-scale-factor=1']});
const w=Number(process.argv[2]||1280), h=Number(process.argv[3]||900);
const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
await p.screenshot({path:`/tmp/fold-${w}x${h}.png`});
const m=await p.evaluate(()=>{
  const q=s=>document.querySelector(s)?.getBoundingClientRect();
  return {hero:q('.hero'),img:q('.col-image img'),cue:q('.cue'),lock:q('.lockup'),inner:innerWidth};
});
console.log(JSON.stringify(m,null,1));
await b.close();server.close();
