// Gera os ícones PNG do PWA a partir dos SVGs em public/.
// Uso: node scripts/gerar-icones.mjs   (requer o Playwright instalado)
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pub = resolve(import.meta.dirname, '../public');
const jobs = [
  { svg: 'alagou-icon.svg', out: 'pwa-192.png', size: 192 },
  { svg: 'alagou-icon.svg', out: 'pwa-512.png', size: 512 },
  { svg: 'alagou-icon-maskable.svg', out: 'pwa-maskable-512.png', size: 512 },
  { svg: 'alagou-icon-maskable.svg', out: 'apple-touch-icon.png', size: 180 },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { svg, out, size } of jobs) {
  const markup = readFileSync(resolve(pub, svg), 'utf8');
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${markup.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.locator('svg').screenshot({ path: resolve(pub, out), omitBackground: true });
  console.log('gerado', out);
}
await browser.close();
