/* Section rhythm on the landing: the rule to the header above it, and each
   header to its own first content element. */
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
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
await p.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));} window.scrollTo(0,0); });
await p.waitForTimeout(600);
console.log(await p.evaluate(()=>{
  const out=[];
  const blocks=[...document.querySelectorAll('.landing .block')];
  out.push(`  ${blocks.length} sections`);
  out.push('\n  section rule to its header, then header to its first content:');
  for (const bl of blocks) {
    const name=(bl.querySelector('h2,.header,[class*=header]')?.textContent||bl.id||'?').trim().slice(0,22);
    const r=bl.getBoundingClientRect();
    const head=bl.querySelector('.teaser, [class*=teaser]');
    const kids=[...bl.children].filter(c=>c!==head);
    const hb=head?.getBoundingClientRect();
    const first=kids[0]?.getBoundingClientRect();
    out.push(`    ${name.padEnd(24)} rule->header ${hb?Math.round(hb.top-r.top):'-'}px   header->content ${hb&&first?Math.round(first.top-hb.bottom):'-'}px`);
  }
  out.push('\n  gap between sections (previous content bottom to next rule):');
  for (let i=1;i<blocks.length;i++){
    const cur=blocks[i].getBoundingClientRect();
    const lastKid=[...blocks[i-1].children].pop().getBoundingClientRect();
    out.push(`    ${i}: ${Math.round(cur.top-lastKid.bottom)}px of clear space across the rule`);
  }
  return out.join('\n');
}));
await b.close();server.close();
