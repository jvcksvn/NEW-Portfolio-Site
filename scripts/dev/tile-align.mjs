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
for (const w of [1440, 1280, 1024]) {
  const p=await b.newPage({viewport:{width:w,height:1000}});
  await p.goto('http://localhost:4321/projects',{waitUntil:'networkidle'});
  await p.waitForTimeout(900);
  console.log(`\n== ${w}px ==`);
  console.log(await p.evaluate(()=>{
    const out=[];
    const tiles=[...document.querySelectorAll('.case-tile')];
    const rows=tiles.map(t=>Math.round(t.querySelector('.tile-stats').getBoundingClientRect().top));
    out.push('  stat row tops:      '+rows.join(', ')+(new Set(rows).size===1?'  aligned':'  MISALIGNED'));
    const labs=tiles.map(t=>[...t.querySelectorAll('.stat-label')].map(l=>Math.round(l.getBoundingClientRect().top)));
    out.push('  label tops per tile: '+labs.map(a=>'['+a.join(' ')+']').join(' '));
    const flat=labs.flat();
    out.push('  all nine labels:    '+(new Set(flat).size===1?'aligned':'MISALIGNED, '+new Set(flat).size+' distinct y'));
    const feet=tiles.map(t=>Math.round(t.querySelector('.tile-foot').getBoundingClientRect().top));
    out.push('  foot tops:          '+feet.join(', ')+(new Set(feet).size===1?'  aligned':'  MISALIGNED'));
    return out.join('\n');
  }));
  await p.close();
}
await b.close();server.close();
