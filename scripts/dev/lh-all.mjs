/* Lighthouse across every route, desktop and mobile, into one table. */
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.pdf':'application/pdf','.webmanifest':'application/manifest+json','.xml':'application/xml','.txt':'text/plain'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
server.on('error',e=>{console.error('bind failed',e.code);process.exit(1)});
await new Promise((res,rej)=>{server.once('error',rej);server.listen(4321,res);});

const ROUTES=['/','/projects','/projects/tier-3-aluminum-disruption','/projects/clear-to-build-system','/projects/kit-backlog',
  '/writing','/writing/the-bad-version-goes-first','/analysis','/analysis/agentic-planning-supervision',
  '/library','/library/influence','/resume','/about','/contact'];

const browser=await chromium.launch({args:['--remote-debugging-port=9333']});
const desktop={formFactor:'desktop',screenEmulation:{mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1}};

const rows=[];
for (const route of ROUTES) {
  const out={route};
  for (const [name,preset] of [['d',desktop],['m',{}]]) {
    const r=await lighthouse('http://localhost:4321'+route,{port:9333,output:'json',logLevel:'error'},{extends:'lighthouse:default',settings:preset});
    const c=r.lhr.categories;
    out[name]={p:Math.round(c.performance.score*100),a:Math.round(c.accessibility.score*100),
      b:Math.round(c['best-practices'].score*100),s:Math.round(c.seo.score*100),
      cls:r.lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3)};
  }
  rows.push(out);
  process.stderr.write('.');
}
process.stderr.write('\n');

console.log('route'.padEnd(42)+'| desktop  P   A   B   S    CLS  | mobile   P   A   B   S    CLS');
console.log('-'.repeat(42)+'+'+'-'.repeat(32)+'+'+'-'.repeat(32));
for (const r of rows) {
  const f=(x)=>`${String(x.p).padStart(3)} ${String(x.a).padStart(3)} ${String(x.b).padStart(3)} ${String(x.s).padStart(3)}  ${x.cls}`;
  console.log(r.route.padEnd(42)+'|          '+f(r.d)+' |          '+f(r.m));
}
const worst=(k,form)=>Math.min(...rows.map(r=>r[form][k]));
console.log('\nlowest desktop: perf '+worst('p','d')+', a11y '+worst('a','d')+', best practices '+worst('b','d')+', seo '+worst('s','d'));
console.log('lowest mobile:  perf '+worst('p','m')+', a11y '+worst('a','m')+', best practices '+worst('b','m')+', seo '+worst('s','m'));
console.log('max CLS: desktop '+Math.max(...rows.map(r=>+r.d.cls)).toFixed(3)+', mobile '+Math.max(...rows.map(r=>+r.m.cls)).toFixed(3));
await browser.close();server.close();
