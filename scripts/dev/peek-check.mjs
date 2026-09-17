/* How many cells are fully inside the viewport and how many only peek. */
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
const report=async(url,ids)=>{
  await p.goto('http://localhost:4321'+url,{waitUntil:'networkidle'});
  await p.waitForTimeout(1600);
  console.log(await p.evaluate((ids)=>{
    const out=[];
    for (const id of ids) {
      const root=document.querySelector(`[data-carousel="${id}"]`);
      if(!root){out.push(`  ${id}: missing`);continue;}
      const vp=root.querySelector('.viewport').getBoundingClientRect();
      let full=0,peek=0;
      for (const it of root.querySelectorAll('.item')) {
        if(it.dataset.state==='hidden')continue;
        const r=it.getBoundingClientRect();
        const vis=Math.max(0,Math.min(r.right,vp.right)-Math.max(r.left,vp.left));
        if(vis>=r.width-1.5) full++; else if(vis>2) peek++;
      }
      const pos=root.querySelector('[data-position]')?.textContent;
      const blurs=[...root.querySelectorAll('.item')].filter(i=>i.dataset.state!=='hidden').map(i=>getComputedStyle(i).filter).filter(f=>f!=='none').length;
      out.push(`  ${id.padEnd(16)} opens ${String(pos).padEnd(9)} ${full} fully visible, ${peek} peeking, ${blurs} blurred`);
    }
    return out.join('\n');
  }, ids));
};
console.log('== landing ==');
await report('/',['essays','library']);
console.log('\n== about ==');
await report('/about',['about-photos']);
console.log('\n== resume tab ==');
await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
await p.waitForTimeout(1600);
await p.click('#asset-tab-about'); await p.waitForTimeout(800);
console.log(await p.evaluate(()=>{
  const root=document.querySelector('[data-carousel="resume-photos"]');
  if(!root) return '  resume-photos: MISSING';
  const vp=root.querySelector('.viewport').getBoundingClientRect();
  let full=0,peek=0;
  for (const it of root.querySelectorAll('.item')) {
    if(it.dataset.state==='hidden')continue;
    const r=it.getBoundingClientRect();
    const vis=Math.max(0,Math.min(r.right,vp.right)-Math.max(r.left,vp.left));
    if(vis>=r.width-1.5) full++; else if(vis>2) peek++;
  }
  const blurs=[...root.querySelectorAll('.item')].filter(i=>i.dataset.state!=='hidden').map(i=>getComputedStyle(i).filter).filter(f=>f!=='none').length;
  const alts=[...root.querySelectorAll('img')].filter(i=>i.alt && i.alt.length>10).length;
  return `  resume-photos    opens ${root.querySelector('[data-position]')?.textContent}  ${full} fully visible, ${peek} peeking, ${blurs} blurred, ${alts} of 7 with real alt text`;
}));
await b.close();server.close();
