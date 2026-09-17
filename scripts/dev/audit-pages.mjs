/* Overflow, CLS and contrast across every page, not just the landing. */
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

const PAGES=['/','/projects','/projects/tier-3-aluminum-disruption','/writing','/analysis','/library',
  '/writing/the-bad-version-goes-first','/analysis/agentic-planning-supervision','/library/influence',
  '/about','/contact','/resume'];
const WIDTHS=[320,360,480,768,1024,1280,1600];

console.log('== horizontal overflow ==');
for (const page of PAGES) {
  const bad=[];
  for (const w of WIDTHS) {
    const ctx=await b.newContext({viewport:{width:w,height:800}});
    const p=await ctx.newPage();
    await p.goto('http://localhost:4321'+page,{waitUntil:'networkidle'});
    await p.waitForTimeout(700);
    /*
      02 section 4: "The page body never scrolls sideways at any width."

      The test is whether the page actually scrolls, not whether any element's
      rect exceeds the viewport: a tab rail or a carousel inside its own
      overflow container is supposed to extend past it and is clipped. Scrolling
      the document and reading scrollLeft back is the only honest measure.
    */
    const r=await p.evaluate(async()=>{
      window.scrollTo(9999,0);
      await new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(res)));
      const scrolled=window.scrollX||document.documentElement.scrollLeft||0;
      window.scrollTo(0,0);
      const culprits=[...document.querySelectorAll('*')].filter(e=>{
        if(e.getBoundingClientRect().right<=innerWidth+1) return false;
        /* Ignore anything clipped by an ancestor's own overflow container. */
        let n=e.parentElement;
        while(n&&n!==document.body){ if(getComputedStyle(n).overflowX!=='visible') return false; n=n.parentElement; }
        return true;
      }).map(e=>e.tagName+'.'+[...e.classList].join('.')).slice(0,3);
      return {sw:scrolled>0?document.documentElement.scrollWidth:innerWidth,iw:innerWidth,over:culprits};
    });
    if(r.sw>r.iw) bad.push(`${w}px (${r.sw} vs ${r.iw}) ${r.over.join(', ')}`);
    await ctx.close();
  }
  console.log(`  ${page.padEnd(38)} ${bad.length? 'OVERFLOW: '+bad.join(' | ') : 'clean at all 7 widths'}`);
}

console.log('\n== CLS, cold cache ==');
for (const page of PAGES) {
  const ctx=await b.newContext({viewport:{width:390,height:844}});
  const p=await ctx.newPage();
  await p.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true})});
  await p.goto('http://localhost:4321'+page,{waitUntil:'networkidle'});
  await p.waitForTimeout(2500);
  console.log(`  ${page.padEnd(38)} CLS ${(await p.evaluate(()=>window.__cls)).toFixed(4)}`);
  await ctx.close();
}

console.log('\n== contrast, every text pair on the new pages ==');
{
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage();
  const seen=new Map();
  for (const page of PAGES) {
    await p.goto('http://localhost:4321'+page,{waitUntil:'networkidle'});
    await p.waitForTimeout(900);
    const res=await p.evaluate(()=>{
      const lum=c=>{const[r,g,bl]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*bl};
      const parse=s=>{const n=s.match(/[\d.]+/g).map(Number);return s.startsWith('color(')?n.slice(0,3).map(v=>v*255):n.slice(0,3)};
      const alphaOf=s=>{const n=s.match(/[\d.]+/g).map(Number);return n.length>3?n[3]:1};
      const ratio=(f,bg)=>{const a=lum(f),c=lum(bg);const[h,l]=a>c?[a,c]:[c,a];return (h+.05)/(l+.05)};
      const out=[];
      for (const e of document.querySelectorAll('p,span,strong,li,h1,h2,h3,h4,a,td,th,em,dt,dd,figcaption')) {
        if(!e.textContent.trim()) continue;
        const cs=getComputedStyle(e);
        if(cs.visibility==='hidden'||cs.display==='none') continue;
        const layers=[];let n=e;
        while(n&&n!==document.documentElement){const c=getComputedStyle(n).backgroundColor;
          if(c&&c!=='rgba(0, 0, 0, 0)'&&c!=='transparent'){const rgb=parse(c);layers.push([rgb[0],rgb[1],rgb[2],alphaOf(c)])}n=n.parentElement}
        let acc=[248,248,245];
        for(const l of layers.reverse()){const a=l[3];acc=[0,1,2].map(i=>l[i]*a+acc[i]*(1-a))}
        const px=parseFloat(cs.fontSize); const large= px>=24||(px>=18.66&&+cs.fontWeight>=700);
        const r=ratio(parse(cs.color),acc);
        out.push({cls:(e.className||e.tagName).toString().split(' ')[0],px,color:cs.color,ratio:+r.toFixed(2),need:large?3:4.5});
      }
      return out;
    });
    for (const r of res) { const k=`${r.cls}|${r.px}|${r.color}`; if(!seen.has(k)) seen.set(k,r); }
  }
  let fails=0;
  for (const r of seen.values()) if (r.ratio < r.need) { fails++; console.log(`  FAIL ${r.cls} ${r.px}px ${r.color} ratio ${r.ratio} need ${r.need}`); }
  console.log(`  ${seen.size} distinct text pairs checked, ${fails} below AA`);
  await ctx.close();
}
await b.close();server.close();
