/* What the contact form actually does today, end to end, against dist. */
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
const p=await b.newPage({viewport:{width:1280,height:900}});
const go=async()=>{await p.goto('http://localhost:4321/contact',{waitUntil:'networkidle'});await p.waitForTimeout(600);};

await go();
console.log('endpoint baked into the page:', JSON.stringify(await p.getAttribute('[data-contact]','data-endpoint')));
console.log('honeypot present:', await p.locator('input[name="_gotcha"]').count()===1);
console.log('fields:', (await p.locator('.field').count()), 'labels all visible:',
  await p.evaluate(()=>[...document.querySelectorAll('.field label')].every(l=>getComputedStyle(l).display!=='none')));

console.log('\n-- empty submit --');
await p.click('.submit'); await p.waitForTimeout(300);
console.log('  email error:', JSON.stringify(await p.locator('[data-error="email"]').textContent()));
console.log('  message error:', JSON.stringify(await p.locator('[data-error="message"]').textContent()));
console.log('  focus moved to:', await p.evaluate(()=>document.activeElement?.id));
console.log('  aria-invalid set:', await p.evaluate(()=>document.querySelectorAll('[aria-invalid="true"]').length));

console.log('\n-- valid submit, no endpoint configured --');
await go();
await p.fill('#name','Test'); await p.fill('#email','a@b.com'); await p.fill('#message','Hello');
await p.click('.submit'); await p.waitForTimeout(600);
console.log('  status shown:', JSON.stringify(await p.locator('[data-status]').textContent()));
console.log('  status kind:', await p.getAttribute('[data-status]','data-kind'));

console.log('\n-- valid submit with an endpoint stubbed to 200 --');
await go();
await p.route('https://formspree.io/**', r=>r.fulfill({status:200,body:'{"ok":true}'}));
await p.evaluate(()=>document.querySelector('[data-contact]').dataset.endpoint='https://formspree.io/f/TEST');
await p.fill('#name','Test'); await p.fill('#email','a@b.com'); await p.fill('#message','Hello');
await p.click('.submit'); await p.waitForTimeout(800);
console.log('  status shown:', JSON.stringify(await p.locator('[data-status]').textContent()));
console.log('  form reset:', await p.inputValue('#message')==='');

console.log('\n-- endpoint stubbed to 500 --');
await go();
await p.route('https://formspree.io/**', r=>r.fulfill({status:500,body:'err'}));
await p.evaluate(()=>document.querySelector('[data-contact]').dataset.endpoint='https://formspree.io/f/TEST');
await p.fill('#email','a@b.com'); await p.fill('#message','Hello');
await p.click('.submit'); await p.waitForTimeout(800);
console.log('  status shown:', JSON.stringify(await p.locator('[data-status]').textContent()));
console.log('  submit re-enabled:', !(await p.isDisabled('.submit')));
console.log('\n  fallbacks:', await p.evaluate(()=>[...document.querySelectorAll('.fallbacks a')].map(a=>a.getAttribute('href')).join(' , ')));
await b.close();server.close();
