import { chromium } from 'playwright';
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:260}});
await p.goto('file:///tmp/glyph.html'); await p.screenshot({path:'/tmp/glyph.png'});
await b.close();
