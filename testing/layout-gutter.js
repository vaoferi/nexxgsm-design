const { chromium } = require('playwright');

// Regression for the responsive page gutter: breakpoint reflow may change the
// number of columns, but the outer edges must stay aligned with the page content
// (the same visual gutter used by the header, CTA, guides and footer).
const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 480, height: 854 },
  { width: 600, height: 900 },
  { width: 683, height: 960 },
  { width: 700, height: 900 },
  { width: 768, height: 1024 },
  { width: 900, height: 900 },
  { width: 1280, height: 832 },
];

const surfaces = [
  '.header',
  '.hero-cta-row',
  '.hero-trust',
  '.products-grid',
  '.step-row',
  '.related-guides',
  '.after-guides-cta',
  '.site-footer',
];
const tolerance = 1;

(async () => {
  const browser = await chromium.launch();
  const failures = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto('http://localhost:8080/en-US-landing/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const result = await page.evaluate((surfaceSelectors) => {
      const pageBox = document.querySelector('.page').getBoundingClientRect();
      const pageStyle = getComputedStyle(document.querySelector('.page'));
      const expectedLeft = pageBox.left + parseFloat(pageStyle.paddingLeft);
      const expectedRight = pageBox.right - parseFloat(pageStyle.paddingRight);
      const surfaces = {};
      for (const selector of surfaceSelectors) {
        const element = document.querySelector(selector);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        surfaces[selector] = { left: rect.left, right: rect.right };
      }
      return { expectedLeft, expectedRight, surfaces };
    }, surfaces);

    for (const [selector, rect] of Object.entries(result.surfaces)) {
      if (Math.abs(rect.left - result.expectedLeft) > tolerance || Math.abs(rect.right - result.expectedRight) > tolerance) {
        failures.push({ viewport, selector, expected: [result.expectedLeft, result.expectedRight], actual: [rect.left, rect.right] });
      }
    }
    await page.close();
  }

  await browser.close();
  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  } else {
    console.log(`Responsive gutter check passed: ${viewports.length} viewports × ${surfaces.length} surfaces`);
  }
})();
