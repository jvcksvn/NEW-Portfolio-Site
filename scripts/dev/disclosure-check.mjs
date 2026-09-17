/* 04: the panel height animation must remeasure when a disclosure opens, or
   the panel clips. Also: everything starts closed, so load CLS is unaffected. */
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

console.log('== all closed on load ==');
console.log(await p.evaluate(()=>{
  const d=[...document.querySelectorAll('details.visual-disclosure')];
  return `  ${d.length} disclosures, open on load: ${d.filter(x=>x.open).length}`;
}));

console.log('\n== summary is a real control ==');
console.log(await p.evaluate(()=>{
  const s=document.querySelector('.disclosure-summary');
  return `  tag ${s.tagName}, parent ${s.parentElement.tagName}, tabbable ${s.tabIndex >= 0 || s.parentElement.tagName==='DETAILS'}`;
}));

const tabs=await p.evaluate(()=>[...document.querySelectorAll('.asset-tabs [role="tab"]')].map(e=>e.id));
for (const tab of tabs) {
  await p.click('#'+tab); await p.waitForTimeout(600);
  const has=await p.evaluate(()=>{
    const panel=document.querySelector('[role="tabpanel"]:not([inert])');
    return panel?.querySelectorAll('details.visual-disclosure').length ?? 0;
  });
  if (!has) { console.log(`\n  ${tab.replace('asset-tab-','')}: no disclosure`); continue; }
  const before=await p.evaluate(()=>{
    const vp=document.querySelector('.asset-viewport');
    const panel=document.querySelector('[role="tabpanel"]:not([inert])');
    return {vp:Math.round(vp.getBoundingClientRect().height), panel:Math.round(panel.scrollHeight)};
  });
  await p.evaluate(()=>{
    const panel=document.querySelector('[role="tabpanel"]:not([inert])');
    panel.querySelector('.disclosure-summary').click();
  });
  await p.waitForTimeout(900);
  const after=await p.evaluate(()=>{
    const vp=document.querySelector('.asset-viewport');
    const panel=document.querySelector('[role="tabpanel"]:not([inert])');
    return {vp:Math.round(vp.getBoundingClientRect().height), panel:Math.round(panel.scrollHeight), open:panel.querySelector('details').open};
  });
  const clipped = after.panel > after.vp + 2;
  console.log(`\n  ${tab.replace('asset-tab-','')}: viewport ${before.vp} -> ${after.vp}, panel content ${before.panel} -> ${after.panel}`);
  console.log(`    opened ${after.open}, grew ${after.vp-before.vp}px, ${clipped?'CLIPPED by '+(after.panel-after.vp)+'px':'no clipping'}`);
}

console.log('\n== planner, both disclosures open at once ==');
await p.click('#asset-tab-planner'); await p.waitForTimeout(700);
for (let i=0;i<2;i++){
  await p.evaluate((n)=>{
    const panel=document.querySelector('[role="tabpanel"]:not([inert])');
    const d=[...panel.querySelectorAll('details.visual-disclosure')][n];
    if(!d.open) d.querySelector('summary').click();
  }, i);
  await p.waitForTimeout(800);
}
console.log(await p.evaluate(()=>{
  const vp=document.querySelector('.asset-viewport').getBoundingClientRect().height;
  const panel=document.querySelector('[role="tabpanel"]:not([inert])');
  const open=[...panel.querySelectorAll('details')].filter(d=>d.open).length;
  return `  ${open} of 2 open, viewport ${Math.round(vp)}, panel ${panel.scrollHeight}, ${panel.scrollHeight>vp+2?'CLIPPED':'no clipping'}`;
}));

console.log('\n== keyboard ==');
await p.click('#asset-tab-intern'); await p.waitForTimeout(600);
await p.evaluate(()=>{const panel=document.querySelector('[role="tabpanel"]:not([inert])');const d=panel.querySelector('details');if(d.open)d.querySelector('summary').click();});
await p.waitForTimeout(500);
await p.focus('[role="tabpanel"]:not([inert]) .disclosure-summary');
await p.keyboard.press('Enter'); await p.waitForTimeout(800);
console.log(await p.evaluate(()=>{
  const panel=document.querySelector('[role="tabpanel"]:not([inert])');
  const d=panel.querySelector('details');
  const vp=document.querySelector('.asset-viewport').getBoundingClientRect().height;
  return `  Enter opened it: ${d.open}, viewport ${Math.round(vp)}, panel ${panel.scrollHeight}, ${panel.scrollHeight>vp+2?'CLIPPED':'no clipping'}`;
}));
await p.keyboard.press('Enter'); await p.waitForTimeout(800);
console.log(await p.evaluate(()=>{
  const panel=document.querySelector('[role="tabpanel"]:not([inert])');
  const vp=document.querySelector('.asset-viewport').getBoundingClientRect().height;
  return `  Enter closed it: ${!panel.querySelector('details').open}, viewport back to ${Math.round(vp)}, panel ${panel.scrollHeight}`;
}));

console.log('\n== education ==');
await p.click('#asset-tab-education'); await p.waitForTimeout(700);
console.log(await p.evaluate(()=>{
  const g=document.querySelector('[role="tabpanel"]:not([inert]) .education-grid');
  const kids=[...g.children];
  const cols=new Set(kids.map(k=>Math.round(k.getBoundingClientRect().left))).size;
  const rows=new Set(kids.map(k=>Math.round(k.getBoundingClientRect().top))).size;
  return `  ${kids.length} groups laid out ${cols} across by ${rows} down: ${kids.map(k=>k.querySelector('.group-label')?.textContent).join(', ')}`;
}));
await b.close();server.close();
