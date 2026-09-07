const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Всі viewport'и від 320px до 2560px з кроком 10px + стандартні пристрої
const viewports = [];

// Додаємо всі viewport'и з кроком 10px від 320 до 2560
for (let w = 320; w <= 2560; w += 10) {
  viewports.push({
    width: w,
    height: Math.round(w * 0.5625), // 16:9 пропорція
    label: `w${w}`
  });
}

// Стандартні пристрої для детального тестування
const standardDevices = [
  { label: 'iPhone SE', width: 375, height: 667 },
  { label: 'iPhone 14', width: 390, height: 844 },
  { label: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { label: 'iPad Mini', width: 744, height: 1133 },
  { label: 'iPad Air', width: 820, height: 1180 },
  { label: 'iPad Pro', width: 1024, height: 1366 },
  { label: 'MacBook Air', width: 1280, height: 832 },
  { label: 'MacBook Pro', width: 1512, height: 982 },
  { label: 'Desktop FHD', width: 1920, height: 1080 },
  { label: 'Desktop QHD', width: 2560, height: 1440 },
];

async function testVersion(versionPath, versionLabel) {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const screenshotsDir = path.join(__dirname, `screenshots_${versionLabel}`);
  
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log(`\n=== Тестування ${versionLabel} ===`);
  console.log(`Всього viewport'ів: ${viewports.length}`);

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`file://${versionPath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Перевірка на оверфлоу (чи виходить контент за рамки)
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });

    // Перевірка на горизонтальний скроллбар
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth + 1;
    });

    // Перевірка читабельності тексту (чи занадто дрібний)
    const fontSize = await page.evaluate(() => {
      const el = document.querySelector('p') || document.querySelector('body');
      const style = window.getComputedStyle(el);
      return parseFloat(style.fontSize);
    });

    // Перевірка чи всі елементи видимі на екрані
    const elementsOutOfBounds = await page.evaluate(() => {
      const all = document.querySelectorAll('*');
      let count = 0;
      all.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth + 1 || rect.bottom > window.innerHeight + 1) {
          count++;
        }
      });
      return count;
    });

    // Роблю скріншот для кожного 10-го пікселя (для заощадження місця)
    if (vp.width % 50 === 0) {
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.label}.png`),
        fullPage: true
      });
    }

    results.push({
      width: vp.width,
      height: vp.height,
      hasOverflow,
      hasHorizontalScroll,
      fontSize,
      elementsOutOfBounds,
      passed: !hasOverflow && !hasHorizontalScroll && fontSize >= 12 && elementsOutOfBounds === 0
    });

    await page.close();

    // Логування прогресу кожні 100 viewport'ів
    if (viewports.indexOf(vp) % 100 === 0) {
      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      console.log(`Прогрес: ${viewports.indexOf(vp) + 1}/${viewmaps.length} | Пройшло: ${passed} | Не пройшло: ${failed}`);
    }
  }

  await browser.close();

  // Зберігаю результати
  const reportPath = path.join(__dirname, `report_${versionLabel}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Виводю підсумок
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`\n=== Підсумок ${versionLabel} ===`);
  console.log(`Пройшло: ${passed}/${results.length} (${(passed / results.length * 100).toFixed(2)}%)`);
  console.log(`Не пройшло: ${failed}/${results.length} (${(failed / results.length * 100).toFixed(2)}%)`);
  
  if (failed > 0) {
    console.log('\nПерші 10 помилок:');
    results.filter(r => !r.passed).slice(0, 10).forEach(r => {
      console.log(`  - ${r.width}x${r.height}: overflow=${r.hasOverflow}, scroll=${r.hasHorizontalScroll}, font=${r.fontSize}px`);
    });
  }

  return results;
}

async function main() {
  const usPath = path.resolve(__dirname, '../versions/en-US/index.html');
  const inPath = path.resolve(__dirname, '../versions/en-IN/index.html');

  await testVersion(usPath, 'en-US');
  await testVersion(inPath, 'en-IN');
}

main().catch(console.error);
