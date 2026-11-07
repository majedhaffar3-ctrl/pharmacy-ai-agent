const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + process.argv[2], { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const fams = await p.evaluate(() => [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight));
  console.log('loaded:', [...new Set(fams)].join(', '));
  // overflow check: elements extending past page bottom-safe area
  const issues = await p.evaluate(() => {
    const out=[];
    document.querySelectorAll('.page').forEach((pg,i)=>{
      const pr=pg.getBoundingClientRect(); const foot=pg.querySelector('.pfoot'); const limit = foot? foot.getBoundingClientRect().top : pr.bottom;
      pg.querySelectorAll('*').forEach(el=>{
        if(el.closest('.pfoot')||el.closest('.deco')) return;
        const r=el.getBoundingClientRect(); if(!r.height) return;
        if(r.bottom>limit+1 || r.right>pr.right+1 || r.left<pr.left-1) out.push(`p${i+1} ${el.tagName}.${el.className} bottom+${Math.round(r.bottom-limit)}`);
      });
    });
    return out.slice(0,30);
  });
  console.log('overflow:', issues.length? issues.join('\n'): 'none');
  await p.pdf({ path: process.argv[3], width:'297mm', height:'210mm', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
