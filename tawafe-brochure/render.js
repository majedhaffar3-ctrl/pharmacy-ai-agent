const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + process.argv[2], { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const fams = await p.evaluate(() => [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+f.weight));
  console.log('loaded fonts:', [...new Set(fams)].join(', '));
  await p.pdf({ path: process.argv[3], format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
