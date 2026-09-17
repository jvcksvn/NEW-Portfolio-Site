/* Three rails on the planner panel, the merged one unbroken, and where each
   disclosure sits relative to its rail. */
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
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
await p.waitForTimeout(1800);
console.log(await p.evaluate(()=>{
  const panel=document.querySelector('[role="tabpanel"]:not([inert])');
  const rails=[...panel.querySelectorAll('.asset-groups .rail')];
  const out=[`  ${rails.length} rails on the panel`];
  rails.forEach((rail,i)=>{
    const r=rail.getBoundingClientRect();
    const claims=[...rail.querySelectorAll('.claim')].map(c=>c.textContent.trim().split(/[,.]/)[0].slice(0,42));
    const pts=[...rail.querySelectorAll('.points > li')];
    const firstClaim=rail.querySelector('.claim').getBoundingClientRect();
    const lastPoint=pts[pts.length-1].getBoundingClientRect();
    out.push(`\n  rail ${i+1}: ${Math.round(r.top)} to ${Math.round(r.bottom)}, height ${Math.round(r.height)}`);
    out.push(`    covers: ${claims.join('  +  ')}`);
    out.push(`    spans first claim top ${Math.round(firstClaim.top)} to last sub point bottom ${Math.round(lastPoint.bottom)}`);
    out.push(`    unbroken: ${r.top <= firstClaim.top + 1 && r.bottom >= lastPoint.bottom - 1 ? 'yes' : 'NO'}`);
    const inside=[...rail.querySelectorAll('details.visual-disclosure')].map(d=>d.querySelector('summary').textContent.trim());
    out.push(`    disclosures inside: ${inside.length?inside.join(', '):'none'}`);
    const li=rail.parentElement;
    const below=[...li.children].filter(c=>c.tagName==='DETAILS').map(d=>d.querySelector('summary').textContent.trim());
    out.push(`    disclosures below:  ${below.length?below.join(', '):'none'}`);
  });
  return out.join('\n');
}));
await b.close();server.close();
