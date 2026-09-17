/* The keyboard check, scoped to one carousel at a time. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
const read=(id)=>p.evaluate((i)=>document.querySelector(`[data-carousel="${i}"] [data-position]`)?.textContent,id);
for (const [id,label] of [['essays','essays'],['analysis','analysis'],['library','library']]) {
  if (id==='analysis') await p.click('#writing-tab-analysis');
  await p.waitForTimeout(300);
  const start=await read(id);
  await p.focus(`[data-carousel="${id}"] .arrow.next`);
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400);
  const right=await read(id);
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400);
  const back=await read(id);
  const focused=await p.evaluate((i)=>{const a=document.activeElement;return a?.closest(`[data-carousel="${i}"]`)?a.tagName+'.'+(a.className||a.parentElement?.className):'outside'},id);
  console.log(`  ${label.padEnd(9)} start ${start} -> ArrowRight ${right} -> ArrowLeft ${back} | focus lands on ${focused} | ${right!==start&&back===start?'ok':'CHECK'}`);
}
console.log('\n  arrows are real buttons:', await p.evaluate(()=>[...document.querySelectorAll('.carousel .arrow')].every(e=>e.tagName==='BUTTON'&&e.type==='button')));
console.log('  arrow labels:', await p.evaluate(()=>[...document.querySelectorAll('.carousel .arrow')].map(e=>e.getAttribute('aria-label')).join(' | ')));
console.log('  tablist:', await p.evaluate(()=>{const l=document.querySelector('[role="tablist"]');return l?`role=tablist, aria-label="${l.getAttribute('aria-label')}", panels ${[...document.querySelectorAll('[role="tabpanel"]')].length}`:'MISSING'}));
await b.close();server.close();
