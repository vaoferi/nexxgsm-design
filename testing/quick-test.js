const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const views = [];
for (let w = 320; w <= 1920; w += 10) {
  views.push({ w, h: Math.round(w * 0.5625) });
}

(async () => {
  const browser = await chromium.launch();
  const results = { 'en-US': [], 'en-IN': [] };
  
  for (const version of ['en-US', 'en-IN']) {
    console.log('Testing ' + version + '...');
    for (const vp of views) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://localhost:8080/' + version + '/index.html', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);
      
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      const hscroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 1);
      const fontSize = await page.evaluate(() => {
        const el = document.querySelector('p') || document.querySelector('body');
        return parseFloat(window.getComputedStyle(el).fontSize);
      });
      
      results[version].push({ w: vp.w, h: vp.h, overflow, hscroll, fontSize, passed: !overflow && !hscroll && fontSize >= 12 });
      await page.close();
    }
  }
  
  await browser.close();
  
  for (const v of Object.keys(results)) {
    const r = results[v];
    const passed = r.filter(x => x.passed).length;
    const failed = r.filter(x => !x.passed).length;
    console.log(v + ': passed=' + passed + ' failed=' + failed + ' total=' + r.length);
    if (failed > 0) {
      console.log('  First failures:');
      r.filter(x => !x.passed).slice(0, 5).forEach(x => console.log('    ' + x.w + 'x' + x.h + ' overflow=' + x.overflow + ' hscroll=' + x.hscroll + ' font=' + x.fontSize));
    }
    fs.writeFileSync(path.join(__dirname, 'report_' + v + '.json'), JSON.stringify(r, null, 2));
  }
})();
