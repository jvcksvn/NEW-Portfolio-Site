import lighthouse from 'lighthouse';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon','.pdf':'application/pdf','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.webmanifest':'application/manifest+json','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{let p=join('dist',decodeURIComponent(req.url.split('?')[0]));
// build.format is 'file', so /projects is both projects.html and a projects/
// directory. Prefer the .html file, then the directory index.
try{ if((await stat(p)).isDirectory()){ try{ await stat(p+'.html'); p=p+'.html'; }catch{ p=join(p,'index.html'); } } }catch{ p=p+'.html'; }try{const b=await readFile(p);res.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end('nf');}});
server.on('error', (e) => { console.error('static server failed to bind:', e.code); process.exit(1); });
await new Promise((res, rej) => { server.once('error', rej); server.listen(4321, res); });

const browser = await chromium.launch({ args:['--remote-debugging-port=9222'] });
const preset = process.argv[2] === 'desktop'
  ? { formFactor:'desktop', screenEmulation:{mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false}, throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1} }
  : {};

const target = process.argv[3] || '/';
const r = await lighthouse('http://localhost:4321'+target, { port:9222, output:'json', logLevel:'error' },
  { extends:'lighthouse:default', settings: preset });

const c = r.lhr.categories;
console.log(`\n${(process.argv[3]||'/')} ${process.argv[2]||'mobile'}`);
for (const k of ['performance','accessibility','best-practices','seo']) {
  console.log(`  ${k.padEnd(15)} ${Math.round(c[k].score*100)}`);
}
const a=r.lhr.audits;
console.log(`  CLS             ${a['cumulative-layout-shift'].displayValue}`);
console.log(`  LCP             ${a['largest-contentful-paint'].displayValue}`);
console.log(`  FCP             ${a['first-contentful-paint'].displayValue}`);
console.log(`  TBT             ${a['total-blocking-time'].displayValue}`);
console.log('  --- audits scoring below 1 ---');
for (const x of Object.values(a)) {
  if (x.score !== null && x.score < 1) {
    const save = x.details?.overallSavingsMs ?? x.numericValue;
    console.log(`    [${String(Math.round(x.score*100)).padStart(3)}] ${x.id.padEnd(34)} ${x.displayValue||''} ${save?('~'+Math.round(save)+'ms'):''}`);
  }
}
const lcpEl=a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet;
if(lcpEl) console.log('  LCP element:', String(lcpEl).slice(0,120));
const chain=a['network-requests']?.details?.items?.filter(i=>i.resourceType!=='Other').sort((x,y)=>(y.transferSize||0)-(x.transferSize||0)).slice(0,6);
if(chain){console.log('  heaviest requests:');for(const c of chain)console.log(`    ${String(Math.round((c.transferSize||0)/1024)).padStart(5)} KB  ${c.resourceType||''}  ${String(c.url).replace('http://localhost:4321','').slice(0,80)}`);}
await browser.close(); server.close();
