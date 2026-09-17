/* Behavioral parity check for the resume island. */
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
const b=await chromium.launch();

/* 1. Touch swipe */
{
  const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  const before=await p.evaluate(()=>document.querySelector('.asset-panel.is-active')?.id);
  const box=await p.locator('.asset-viewport').boundingBox();
  /* Real touch events via CDP. Synthetic TouchEvent objects dispatched from page
     script are not trusted the same way and do not drive the handler. */
  const cdp=await ctx.newCDPSession(p);
  const y=box.y+60;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-40,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove', touchPoints:[{x:box.x+80,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',  touchPoints:[]});
  await p.waitForTimeout(600);
  const after=await p.evaluate(()=>document.querySelector('.asset-panel.is-active')?.id);
  console.log(`  swipe left: ${before} -> ${after}  ${after!==before?'advances':'NO CHANGE'}`);
  await ctx.close();
}

/* 2. Animated panel height */
{
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  const t=await p.evaluate(()=>getComputedStyle(document.querySelector('.asset-viewport')).transitionProperty);
  const h1=await p.evaluate(()=>document.querySelector('.asset-viewport').style.height);
  await p.click('#asset-tab-tools'); await p.waitForTimeout(700);
  const h2=await p.evaluate(()=>document.querySelector('.asset-viewport').style.height);
  console.log(`  animated height: transition=${t}, inline height ${h1||'(none)'} -> ${h2||'(none)'}  ${h1!==h2?'updates':'NO CHANGE'}`);
  await ctx.close();
}

/* 3. Reduced motion snaps */
{
  const ctx=await b.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  const t=await p.evaluate(()=>{const c=getComputedStyle(document.querySelector('.asset-viewport'));return c.transitionDuration});
  console.log(`  reduced motion: viewport transition-duration = ${t}  ${parseFloat(t)<0.02?'snaps':'STILL ANIMATES'}`);
  await ctx.close();
}

/* 4. Dots track the active tab */
{
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/resume',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  await p.click('#asset-tab-growth'); await p.waitForTimeout(400);
  const idx=await p.evaluate(()=>[...document.querySelectorAll('.asset-dots span')].findIndex(s=>s.classList.contains('is-active')));
  console.log(`  dot indicator: index ${idx} ${idx===2?'matches growth (2)':'MISMATCH'}`);
  const dis=await p.evaluate(()=>{const bs=[...document.querySelectorAll('.asset-controls button')];return bs.map(x=>x.disabled).join(',')});
  await p.click('#asset-tab-planner'); await p.waitForTimeout(300);
  const dis2=await p.evaluate(()=>{const bs=[...document.querySelectorAll('.asset-controls button')];return bs.map(x=>x.disabled).join(',')});
  console.log(`  arrow disabled state: growth=[${dis}] planner=[${dis2}]  ${dis2.startsWith('true')?'first tab disables Prev':'NOT DISABLED'}`);
  await ctx.close();
}

await b.close();server.close();
