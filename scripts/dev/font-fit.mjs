/* For real page prose, how far off is the fallback face from the real one?
   Reports the width ratio that would make them agree. */
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
const p=await b.newPage({viewport:{width:1350,height:940}});
await p.goto('http://localhost:4321'+(process.argv[2]||'/writing/the-bad-version-goes-first'),{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);
console.log(await p.evaluate(()=>{
  const c=document.createElement('canvas').getContext('2d');
  const out=[];
  const pairs=[['IBM Plex Sans','IBM Plex Sans fallback',400],['Archivo','Archivo fallback',600]];
  const texts=[...document.querySelectorAll('p, h1, h2, h3, li')].map(e=>e.textContent.trim()).filter(t=>t.length>40).slice(0,40);
  for (const [real,fb,w] of pairs) {
    let sumR=0,sumF=0;
    for (const t of texts) { c.font=`${w} 100px "${real}"`; sumR+=c.measureText(t).width; c.font=`${w} 100px "${fb}"`; sumF+=c.measureText(t).width; }
    out.push(`  ${real.padEnd(16)} real ${sumR.toFixed(0)}  fallback ${sumF.toFixed(0)}  fallback is ${(sumF/sumR*100).toFixed(3)}% of real`);
  }
  out.push(`  measured over ${texts.length} real strings on this page`);
  return out.join('\n');
}));
await b.close();server.close();
