/* Verifies the print stylesheet by emulating print media. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.pdf':'application/pdf'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
server.on('error',e=>{console.error('bind',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1024,height:1400}});
await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
await p.emulateMedia({media:'print'});
await p.waitForTimeout(400);

const r=await p.evaluate(()=>{
  const vis=(sel)=>{const e=document.querySelector(sel);if(!e)return 'absent';const c=getComputedStyle(e);return c.display==='none'?'hidden':'VISIBLE'};
  const panels=[...document.querySelectorAll('.asset-panel')];
  const shown=panels.filter(x=>getComputedStyle(x).display!=='none').length;
  const body=getComputedStyle(document.body);
  const sample=document.querySelector('.asset-tagline');
  const ext=document.querySelector('a[href^="http"]');
  return {
    nav: vis('.nav'), footer: vis('footer'), tabRail: vis('.asset-tab-carousel'),
    controls: vis('.asset-controls'), dots: vis('.asset-dots'), download: vis('.download'),
    panelsShown: shown, panelsTotal: panels.length,
    bodyBg: body.backgroundColor, sampleColor: sample?getComputedStyle(sample).color:'n/a',
    extAfter: ext?getComputedStyle(ext,'::after').content.slice(0,40):'no external link',
    breakInside: getComputedStyle(document.querySelector('.impact-scorecard')).breakInside,
  };
});
for (const [k,v] of Object.entries(r)) console.log(`  ${k.padEnd(14)} ${v}`);

await p.pdf({path:'/tmp/resume-print.pdf',format:'A4',printBackground:false});
console.log('\n  pdf written to /tmp/resume-print.pdf');
await b.close();server.close();
