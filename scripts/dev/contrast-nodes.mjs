import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(q,r)=>{let p=join('dist',decodeURIComponent(q.url.split('?')[0]));
try{ if((await stat(p)).isDirectory()) p=join(p,'index.html'); }catch{ p=p+'.html'; }
try{const b=await readFile(p);r.writeHead(200,{'content-type':MIME[extname(p)]||'application/octet-stream'});r.end(b);}catch{r.writeHead(404);r.end('nf');}});
await new Promise(res=>server.listen(4321,res));
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
await p.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
const res=await p.evaluate(async()=>{
  const r=await axe.run(document,{runOnly:['color-contrast']});
  return r.violations.flatMap(v=>v.nodes.map(n=>({t:n.target.join(' '),msg:n.any.map(a=>a.message).join(' | '),html:n.html.slice(0,110)})));
});
for(const n of res){console.log(' -',n.t);console.log('   ',n.msg);console.log('   ',n.html,'\n');}
await b.close();server.close();
