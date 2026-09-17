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
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
console.log(await p.evaluate(()=>{
  const out=[];
  const hero=document.querySelector('.hero').getBoundingClientRect();
  out.push(`hero box ${Math.round(hero.left)} to ${Math.round(hero.right)} (viewport ${window.innerWidth})`);
  const t=document.querySelector('.col-text').getBoundingClientRect();
  const i=document.querySelector('.col-image').getBoundingClientRect();
  out.push(`text col ${Math.round(t.left)}..${Math.round(t.right)} w=${Math.round(t.width)}`);
  out.push(`image col ${Math.round(i.left)}..${Math.round(i.right)} w=${Math.round(i.width)}`);
  const widest=[...document.querySelectorAll('.col-text *')].map(e=>({c:(e.className||e.tagName).toString().slice(0,24),w:Math.round(e.getBoundingClientRect().width)})).sort((a,b)=>b.w-a.w).slice(0,5);
  out.push('widest things in the text column: '+JSON.stringify(widest));
  return out.join('\n');
}));
await b.close();server.close();
