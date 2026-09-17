import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon','.pdf':'application/pdf','.json':'application/json','.xml':'application/xml','.txt':'text/plain'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
// build.format is 'file', so /projects is both projects.html and a projects/
// directory. Prefer the .html file, then the directory index.
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
server.on('error',e=>{console.error('static server could not bind 4321:',e.code,'\n  a dev server is probably running; measurements would hit it instead of dist');process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});
const b=await chromium.launch();

console.log('== horizontal overflow ==');
for (const w of [320,360,480,768,1024,1280,1600]) {
  const ctx=await b.newContext({viewport:{width:w,height:800}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(900);
  const r=await p.evaluate(()=>{
    const d=document.documentElement;
    const over=[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.tagName+'.'+[...e.classList].join('.')).slice(0,4);
    return {sw:d.scrollWidth,iw:innerWidth,over};
  });
  console.log(`  ${String(w).padStart(4)}px  scrollWidth ${r.sw} vs ${r.iw}  ${r.sw>r.iw?'OVERFLOW '+r.over.join(', '):'ok'}`);
  await ctx.close();
}

console.log('\n== cumulative layout shift, cold cache ==');
{
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage();
  await p.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(3000);
  console.log('  CLS =', (await p.evaluate(()=>window.__cls)).toFixed(4));
  await ctx.close();
}

console.log('\n== contrast, smallest text pairs ==');
{
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(800);
  const res=await p.evaluate(()=>{
    const lum=c=>{const[r,g,bl]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*bl};
    // Handles both rgb()/rgba() in 0..255 and color(srgb ...) in 0..1.
    const parse=s=>{
      const n=s.match(/[\d.]+/g).map(Number);
      if(s.startsWith('color(')) return n.slice(0,3).map(v=>v*255);
      return n.slice(0,3);
    };
    const alphaOf=s=>{
      const n=s.match(/[\d.]+/g).map(Number);
      if(s.startsWith('color(')) return n.length>3?n[3]:1;
      return n.length>3?n[3]:1;
    };
    const ratio=(f,b)=>{const a=lum(parse(f)),c=lum(parse(b));const[hi,lo]=a>c?[a,c]:[c,a];return (hi+.05)/(lo+.05)};
    const bg='rgb(248, 248, 245)';
    const out=[];
    for (const sel of ['.footer .note','.t-label','.role','.blurb','.t-small','.desktop a','.link','.subhead','.statement','.format','.strong','.panel a','.footer .links a']) {
      const e=document.querySelector(sel); if(!e) continue;
      const cs=getComputedStyle(e);
      // Composite every translucent ancestor background over the page ground,
      // otherwise a semi transparent nav reads as a false contrast failure.
      const layers=[]; let n=e;
      while(n&&n!==document.documentElement){const c=getComputedStyle(n).backgroundColor;
        if(c&&c!=='rgba(0, 0, 0, 0)'&&c!=='transparent'){const rgb=parse(c);layers.push([rgb[0],rgb[1],rgb[2],alphaOf(c)]);}
        n=n.parentElement}
      let acc=parse(bg);
      for(const l of layers.reverse()){const a=l[3];acc=[0,1,2].map(i=>l[i]*a+acc[i]*(1-a));}
      const bgc='rgb('+acc.map(v=>Math.round(v)).join(', ')+')';
      out.push({sel,color:cs.color,size:cs.fontSize,weight:cs.fontWeight,ratio:+ratio(cs.color,bgc).toFixed(2)});
    }
    return out;
  });
  for (const r of res) {
    const px=parseFloat(r.size); const large = px>=24 || (px>=18.66 && +r.weight>=700);
    const need = large?3:4.5;
    console.log(`  ${r.sel.padEnd(14)} ${r.size.padStart(7)} ${String(r.color).padEnd(20)} ratio ${String(r.ratio).padStart(5)}  need ${need}  ${r.ratio>=need?'PASS':'FAIL'}`);
  }
  await ctx.close();
}

console.log('\n== keyboard ==');
{
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(800);
  await p.keyboard.press('Tab');
  console.log('  first tab stop:', await p.evaluate(()=>{const a=document.activeElement;return a.tagName+' "'+a.textContent.trim()+'" href='+a.getAttribute('href')}));
  const order=[];
  for (let i=0;i<12;i++){await p.keyboard.press('Tab');order.push(await p.evaluate(()=>document.activeElement.textContent.trim().slice(0,22)||document.activeElement.getAttribute('aria-label')));}
  console.log('  next 12:', order.join(' | '));
  await ctx.close();
}

console.log('\n== mobile menu, 400px ==');
{
  const ctx=await b.newContext({viewport:{width:400,height:800}});
  const p=await ctx.newPage();
  await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
  await p.waitForTimeout(1200);
  const trig=p.locator('.mobile .trigger');
  console.log('  trigger aria-label closed:', await trig.getAttribute('aria-label'));
  await trig.click(); await p.waitForTimeout(400);
  console.log('  trigger aria-label open:  ', await trig.getAttribute('aria-label'));
  console.log('  panel visible:', await p.locator('#mobile-nav-panel').isVisible());
  console.log('  focus moved into panel:', await p.evaluate(()=>document.getElementById('mobile-nav-panel').contains(document.activeElement)));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  console.log('  after Escape, panel visible:', await p.locator('#mobile-nav-panel').isVisible());
  console.log('  focus returned to trigger:', await p.evaluate(()=>document.activeElement.classList.contains('trigger')));
  await ctx.close();
}

await b.close(); server.close();
