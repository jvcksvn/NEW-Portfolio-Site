import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()) p=join(p,'index.html'); }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
await new Promise(res=>server.listen(4321,res));
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
await p.waitForTimeout(1800);
const ids=await p.evaluate(()=>[...document.querySelectorAll('.asset-tabs [role="tab"]')].map(e=>e.id));
for (const id of ids) {
  await p.click('#'+id); await p.waitForTimeout(500);
  console.log(await p.evaluate((tabId)=>{
    const panel=document.querySelector('[role="tabpanel"]:not([inert])');
    if(!panel) return '  '+tabId+': no active panel';
    const body=panel.querySelector('.asset-body');
    if(!body) return '  '+tabId+': no body';
    const bw=body.getBoundingClientRect().width;
    const kids=[...body.children].map(c=>({n:c.className.split(' ')[0],w:Math.round(c.getBoundingClientRect().width)}));
    const worst=Math.min(...kids.map(k=>k.w));
    return `  ${tabId.replace('asset-tab-','').padEnd(9)} body ${Math.round(bw)}px | ${kids.map(k=>k.n+' '+k.w).join(', ')} | narrowest is ${Math.round(worst/bw*100)}% of the body`;
  }, id));
}
console.log('\n  collage on the About tab:', await p.evaluate(()=>{
  const c=document.querySelector('.asset-collage');
  if(!c) return 'MISSING';
  const imgs=c.querySelectorAll('img');
  return `${imgs.length} images, all with width+height: ${[...imgs].every(i=>i.getAttribute('width')&&i.getAttribute('height'))}, visible: ${c.getBoundingClientRect().height>0}`;
}));
await b.close();server.close();
