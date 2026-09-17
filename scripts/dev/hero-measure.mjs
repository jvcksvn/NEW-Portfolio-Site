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
for (const [w,h] of [[1440,900],[1280,800],[1600,1000]]) {
  const p=await b.newPage({viewport:{width:w,height:h}});
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  console.log(await p.evaluate((vh)=>{
    const shell=document.querySelector('.hero');
    const sr2=shell.getBoundingClientRect();
    const words=[...document.querySelectorAll('.col-text span, .col-text div')].map(e=>({c:e.className,w:Math.round(e.getBoundingClientRect().width)})).slice(0,6);
    console.log('   shell', Math.round(sr2.left), 'to', Math.round(sr2.right), 'width', Math.round(sr2.width), '| text col children', JSON.stringify(words));
    const img=document.querySelector('.col-image img');
    const r=img.getBoundingClientRect();
    const sec=document.querySelector('#interactive-resume');
    const sr=sec.getBoundingClientRect();
    const head=sec.querySelector('.teaser')?.getBoundingClientRect();
    return `  ${window.innerWidth}x${vh}  image ${Math.round(r.width)}x${Math.round(r.height)} top ${Math.round(r.top)} | resume section top ${Math.round(sr.top)} ${sr.top < vh ? 'ABOVE fold' : 'below fold by '+Math.round(sr.top-vh)+'px'} | its header top ${head?Math.round(head.top):'-'}`;
  }, h));
  await p.close();
}
await b.close();server.close();
