import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
// build.format is 'file', so /projects is both projects.html and a projects/
// directory. Prefer the .html file, then the directory index.
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
server.on('error',e=>{console.error('bind',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:2400},deviceScaleFactor:2});const p=await ctx.newPage();
await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});await p.waitForTimeout(1600);
await p.screenshot({path:'/tmp/resume.png',fullPage:false});
console.log('captured');
await b.close();server.close();
