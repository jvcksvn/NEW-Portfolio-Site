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
  const col=document.querySelector('.col-image');
  const pic=col.querySelector('picture');
  const img=col.querySelector('img');
  const f=(e)=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();
    return `${e.tagName.toLowerCase()}: rect ${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)}..${Math.round(r.right)} | width:${c.width} max-width:${c.maxWidth} flex:${c.flexGrow} ${c.flexShrink} ${c.flexBasis} display:${c.display} margin-right:${c.marginRight}`;};
  return [f(col),f(pic),f(img),'viewport '+window.innerWidth].join('\n  ');
}));
await b.close();server.close();
