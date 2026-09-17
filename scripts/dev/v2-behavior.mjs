/* Carousel and toggle: keyboard, tab order, and the counts that must match. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
server.on('error',e=>{console.error('bind failed',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:1000}});
const p=await ctx.newPage();
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);

console.log('== counts on the landing ==');
console.log(await p.evaluate(()=>{
  const n=(id)=>document.querySelectorAll(`[data-carousel="${id}"] .item`).length;
  return `  essays ${n('essays')}, analysis ${n('analysis')}, library ${n('library')}, project panels ${document.querySelectorAll('.case-tile').length}`;
}));

console.log('\n== carousel: visible slots and tab order ==');
console.log(await p.evaluate(()=>{
  const r=[];
  for (const id of ['essays','library']) {
    const root=document.querySelector(`[data-carousel="${id}"]`);
    const items=[...root.querySelectorAll('.item')];
    const shown=items.filter(i=>i.dataset.state==='center'||i.dataset.state==='flank').length;
    const focusable=items.filter(i=>i.querySelector('a')?.tabIndex===0).length;
    const centred=items.filter(i=>i.dataset.state==='center').length;
    r.push(`  ${id}: ${shown} visible slots, ${centred} centred, ${focusable} in the tab order`);
  }
  return r.join('\n');
}));

console.log('\n== carousel keyboard ==');
await p.focus('[data-carousel="library"] .arrow.next');
const before=await p.evaluate(()=>document.querySelector('[data-position]')?.textContent);
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500);
const after=await p.evaluate(()=>[...document.querySelectorAll('[data-carousel="library"] [data-position]')].map(e=>e.textContent)[0]);
console.log(`  ArrowRight moved the library carousel: ${before} then ${after} ${before!==after?'ok':'NO CHANGE'}`);
await p.click('[data-carousel="essays"] .arrow.next'); await p.waitForTimeout(500);
console.log('  arrow button click:', await p.evaluate(()=>document.querySelector('[data-carousel="essays"] [data-position]')?.textContent));

console.log('\n== toggle ==');
console.log(await p.evaluate(()=>{
  const tabs=[...document.querySelectorAll('[data-toggle="writing"] [role="tab"]')];
  return `  ${tabs.length} tabs, roles ${tabs.map(t=>t.getAttribute('role')).join(',')}, selected ${tabs.map(t=>t.getAttribute('aria-selected')).join(',')}, tabindex ${tabs.map(t=>t.tabIndex).join(',')}`;
}));
await p.focus('#writing-tab-essays');
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>{
  const e=document.getElementById('writing-panel-essays'), a=document.getElementById('writing-panel-analysis');
  return `  after ArrowRight: focus ${document.activeElement?.id}, essays hidden ${e.hidden}, analysis hidden ${a.hidden}`;
}));
await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>{
  const e=document.getElementById('writing-panel-essays'), a=document.getElementById('writing-panel-analysis');
  return `  after ArrowLeft:  focus ${document.activeElement?.id}, essays hidden ${e.hidden}, analysis hidden ${a.hidden}`;
}));

console.log('\n== no bracketed value renders ==');
for (const route of ['/','/about','/resume','/library','/writing']) {
  await p.goto('http://localhost:4321'+route,{waitUntil:'networkidle'});
  const bad=await p.evaluate(()=>document.body.innerText.match(/⟦|⟧|YYYY|pending/gi)||[]);
  console.log(`  ${route.padEnd(10)} ${bad.length?'FOUND '+bad.join(','):'clean'}`);
}
await b.close();server.close();
