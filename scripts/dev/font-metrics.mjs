/* Measure the real fonts against the fallbacks the stack actually names, so
   size-adjust is derived rather than guessed. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()) p=join(p,'index.html'); }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
await new Promise(res=>server.listen(4321,res));
const b=await chromium.launch();
const p=await b.newPage();
await p.goto('http://localhost:4321/writing',{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);
const out=await p.evaluate(()=>{
  const sample='Handgloves the quick brown fox jumps over a lazy dog 0123456789 Why You Remember Nothing You Learned';
  const c=document.createElement('canvas').getContext('2d');
  const w=(font)=>{c.font=font;return c.measureText(sample).width;};
  const res={};
  for (const [name,real,weight] of [['Archivo','Archivo',600],['IBM Plex Sans','IBM Plex Sans',400],['IBM Plex Mono','IBM Plex Mono',400]]) {
    res[name]={};
    res[name].real=w(`${weight} 100px "${real}"`);
    for (const fb of ['Arial','Helvetica','system-ui','sans-serif','ui-monospace','Menlo']) res[name][fb]=w(`${weight} 100px ${fb}`);
  }
  return res;
});
for (const [name,m] of Object.entries(out)) {
  console.log(name, 'real', m.real.toFixed(1));
  for (const [fb,v] of Object.entries(m)) if (fb!=='real') console.log(`   vs ${fb.padEnd(12)} ${v.toFixed(1)}  size-adjust ${(m.real/v*100).toFixed(2)}%`);
}
await b.close();server.close();
