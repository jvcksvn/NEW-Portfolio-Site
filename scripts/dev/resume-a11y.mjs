import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
// build.format is 'file', so /projects is both projects.html and a projects/
// directory. Prefer the .html file, then the directory index.
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
server.on('error',e=>{console.error('bind failed',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});const p=await ctx.newPage();
await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});await p.waitForTimeout(1500);
await p.focus('#asset-tab-planner');
const seq=[];
for (const k of ['ArrowRight','ArrowRight','End','Home','ArrowLeft']) {
  await p.keyboard.press(k); await p.waitForTimeout(250);
  seq.push(`${k} -> ${await p.evaluate(()=>document.activeElement?.id)}`);
}
console.log('  '+seq.join('\n  '));
console.log('\n  roving tabindex:', await p.evaluate(()=>[...document.querySelectorAll('[role=tab]')].map(t=>`${t.id.replace('asset-tab-','')}=${t.tabIndex}`).join(' ')));
console.log('  inactive panels inert:', await p.evaluate(()=>[...document.querySelectorAll('.asset-panel')].filter(x=>x.hasAttribute('inert')).length+' of '+document.querySelectorAll('.asset-panel').length));
/* Tab through the whole page and assert focus never lands inside an inert
   panel. The previous expression tested markup rather than reachability. */
const inertCount=await p.evaluate(()=>document.querySelectorAll('.asset-panel[inert] a, .asset-panel[inert] button, .asset-panel[inert] select').length);
await p.evaluate(()=>document.body.focus());
let landed=0, seen=new Set();
for (let i=0;i<120;i++){
  await p.keyboard.press('Tab');
  const info=await p.evaluate(()=>{const a=document.activeElement;
    return {id:a?.id||a?.className||a?.tagName, inInert: !!a?.closest?.('.asset-panel[inert]')}});
  if(info.inInert) landed++;
  if(seen.has(info.id)&&i>20) break;
  seen.add(info.id);
}
console.log(`  focusable controls inside inert panels: ${inertCount}`);
console.log(`  tab stops that landed inside one: ${landed} ${landed===0?'(none, correct)':'(BUG)'}`);
await b.close();server.close();
