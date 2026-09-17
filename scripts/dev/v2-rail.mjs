/* The rail must still centre the active tab on a change, just not on mount. */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()) p=join(p,'index.html'); }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
await new Promise(res=>server.listen(4321,res));
const b=await chromium.launch();
/* Narrow enough that the rail actually overflows and has somewhere to scroll. */
const p=await b.newPage({viewport:{width:900,height:900}});
await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
const railLeft=()=>p.evaluate(()=>{const r=document.querySelector('.asset-tabs');return r?r.scrollLeft:null});
console.log('  rail scrollLeft on mount:', await railLeft());
const ids=await p.evaluate(()=>[...document.querySelectorAll('.asset-tabs [role="tab"]')].map(e=>e.id));
await p.click('#'+ids[ids.length-1]);
await p.waitForTimeout(900);
const after=await railLeft();
console.log(`  after selecting the last tab (${ids[ids.length-1]}): ${after} ${after>0?'rail scrolled, ok':'DID NOT SCROLL'}`);
console.log('  first Tab still lands on:', await (async()=>{const q=await b.newPage({viewport:{width:900,height:900}});await q.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});await q.waitForTimeout(1400);await q.keyboard.press('Tab');const r=await q.evaluate(()=>(document.activeElement.className||'').toString().split(' ')[0]);await q.close();return r})());
await b.close();server.close();
