import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }
try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
server.on('error',e=>{console.error('bind failed',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1280,height:900}});
const p=await ctx.newPage();

console.log('== index ordering ==');
for (const [route,expectFirst] of [['/writing','The Bad Version Goes First'],['/analysis','The Agent Does the Planning Now'],['/library','Influence']]) {
  await p.goto('http://localhost:4321'+route,{waitUntil:'networkidle'});
  await p.waitForTimeout(700);
  const titles=await p.evaluate(()=>[...document.querySelectorAll('[data-card] h2 a')].map(a=>a.textContent.trim()));
  console.log(`  ${route.padEnd(10)} ${titles.length} cards, first is "${titles[0].slice(0,44)}" ${titles[0].startsWith(expectFirst)?'ok':'MISMATCH'}`);
}

console.log('\n== bracketed values never rendered ==');
for (const route of ['/writing','/analysis','/library','/writing/sharpen-less','/library/mindwise']) {
  await p.goto('http://localhost:4321'+route,{waitUntil:'networkidle'});
  const bad=await p.evaluate(()=>document.body.innerText.match(/⟦|⟧|YYYY/g)||[]);
  console.log(`  ${route.padEnd(34)} ${bad.length? 'FOUND '+bad.join(','):'clean'}`);
}

console.log('\n== tag filter ==');
await p.goto('http://localhost:4321/writing',{waitUntil:'networkidle'});
await p.waitForTimeout(900);
const before=await p.evaluate(()=>[...document.querySelectorAll('[data-card]')].filter(c=>!c.hidden).length);
await p.click('.chip[data-value="tools"]');
await p.waitForTimeout(400);
const after=await p.evaluate(()=>({shown:[...document.querySelectorAll('[data-card]')].filter(c=>!c.hidden).length,url:location.search,empty:!document.querySelector('[data-empty]').hidden}));
console.log(`  all: ${before} cards -> tag "tools": ${after.shown} cards, url ${after.url}, empty state shown: ${after.empty}`);
await p.click('.chip[data-value=""]');
await p.waitForTimeout(300);
console.log(`  back to All: ${await p.evaluate(()=>[...document.querySelectorAll('[data-card]')].filter(c=>!c.hidden).length)} cards`);

console.log('\n== library filters: Tag and Length only, no Year read ==');
await p.goto('http://localhost:4321/library',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
console.log('  filter groups:', await p.evaluate(()=>[...document.querySelectorAll('.filter-label')].map(l=>l.textContent.trim()).join(', ')));
await p.click('.chip[data-filter="length"][data-value="short"]');
await p.waitForTimeout(400);
console.log('  length=short ->', await p.evaluate(()=>[...document.querySelectorAll('[data-card]')].filter(c=>!c.hidden).length), 'cards');

console.log('\n== contact form ==');
await p.goto('http://localhost:4321/contact',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
await p.click('.submit'); await p.waitForTimeout(300);
console.log('  empty submit ->', await p.evaluate(()=>[...document.querySelectorAll('.error')].filter(e=>!e.hidden).map(e=>e.textContent.trim().slice(0,44))));
await p.fill('#email','nope'); await p.fill('#message','hello'); await p.click('.submit'); await p.waitForTimeout(300);
console.log('  bad email    ->', await p.evaluate(()=>[...document.querySelectorAll('.error')].filter(e=>!e.hidden).map(e=>e.textContent.trim().slice(0,44))));
await p.fill('#email','a@b.com'); await p.click('.submit'); await p.waitForTimeout(500);
console.log('  no endpoint  ->', await p.evaluate(()=>document.querySelector('[data-status]').textContent.trim().slice(0,64)));
console.log('  honeypot:', await p.evaluate(() => {
  const w = document.querySelector('.honeypot');
  const r = w.getBoundingClientRect();
  const input = document.querySelector('#company');
  return [Math.round(r.width) + 'x' + Math.round(r.height), 'tabIndex ' + input.tabIndex, input.name].join(', ');
}));
await b.close();server.close();
