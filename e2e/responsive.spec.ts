import { expect, test, type Page } from '@playwright/test';
import { expectAccessible, stubMap } from './helpers';

// Matriz de telas do item A1 (docs/pacote-a/A1-responsividade.md).
// Modelos são exemplos aproximados de cada tamanho (pixels CSS).
const SCREENS: { name: string; width: number; height: number; touch: boolean; minMapPct: number }[] = [
  { name: 'android-compacto-360x800', width: 360, height: 800, touch: true, minMapPct: 55 },
  { name: 'android-medio-384x854', width: 384, height: 854, touch: true, minMapPct: 55 },
  { name: 'android-medio-grande-393x873', width: 393, height: 873, touch: true, minMapPct: 55 },
  { name: 'android-grande-412x915', width: 412, height: 915, touch: true, minMapPct: 55 },
  { name: 'iphone-se-375x667', width: 375, height: 667, touch: true, minMapPct: 55 },
  { name: 'iphone-12-15-390x844', width: 390, height: 844, touch: true, minMapPct: 55 },
  { name: 'iphone-11-414x896', width: 414, height: 896, touch: true, minMapPct: 55 },
  { name: 'android-deitado-800x360', width: 800, height: 360, touch: true, minMapPct: 55 },
  { name: 'iphone-deitado-844x390', width: 844, height: 390, touch: true, minMapPct: 55 },
  { name: 'limite-320x568', width: 320, height: 568, touch: true, minMapPct: 55 },
  { name: 'limite-dobravel-280x653', width: 280, height: 653, touch: true, minMapPct: 50 },
  { name: 'tablet-768x1024', width: 768, height: 1024, touch: true, minMapPct: 55 },
  { name: 'notebook-1280x720', width: 1280, height: 720, touch: false, minMapPct: 55 },
  { name: 'notebook-1366x768', width: 1366, height: 768, touch: false, minMapPct: 55 },
  { name: 'monitor-1920x1080', width: 1920, height: 1080, touch: false, minMapPct: 55 },
];

type Box = { x: number; y: number; width: number; height: number };
const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'rolagem lateral').toBeLessThanOrEqual(0);
}

// A matriz define as próprias telas; roda uma vez só (no projeto "desktop").
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'matriz roda uma vez');
  await stubMap(page);
});

for (const s of SCREENS) {
  test.describe(s.name, () => {
    test.use({ viewport: { width: s.width, height: s.height }, hasTouch: s.touch, isMobile: s.touch && s.width < 1024 });

    test('sem rolagem lateral, marca livre, navegação adequada e alvos de toque', async ({ page }) => {
      for (const path of ['/', '/avisar', '/dados', '/alertas']) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
        await expectNoOverflow(page);
      }
      await page.goto('/');
      await page.screenshot({ path: `test-results/galeria/${s.name}-inicio.png` });

      // Qual navegação aparece em cada faixa.
      const bottom = page.getByRole('navigation', { name: 'Navegação inferior' });
      const rail = page.getByRole('navigation', { name: 'Navegação lateral' });
      const top = page.getByRole('navigation', { name: 'Navegação principal' });
      const expected = s.width < 768 ? bottom : s.width < 1024 ? rail : top;
      await expect(expected).toBeVisible();
      for (const other of [bottom, rail, top].filter((n) => n !== expected)) await expect(other).toBeHidden();

      // O nome Alag@u não pode ser coberto pela navegação do topo.
      // Em tela baixa (celular deitado) o cabeçalho some e a marca fica no topo do trilho lateral.
      const short = s.height <= 500 && s.width > s.height;
      await expect(page.getByTestId(short ? 'brand-rail' : 'brand')).toBeVisible();
      const brand = await page.getByTestId('brand').boundingBox();
      if (s.width >= 1024) {
        for (const el of await top.locator('a, button').all()) {
          if (!(await el.isVisible())) continue;
          const b = await el.boundingBox();
          expect(overlaps(brand!, b!), `marca sobreposta por "${await el.innerText()}"`).toBe(false);
        }
      }

      // Alvos de toque ≥ 44 px na navegação.
      if (s.touch) {
        for (const el of await expected.locator('a, button').all()) {
          if (!(await el.isVisible())) continue;
          const b = (await el.boundingBox())!;
          expect(Math.min(b.width, b.height), `alvo de toque "${await el.getAttribute('aria-label') ?? await el.innerText()}"`).toBeGreaterThanOrEqual(44);
        }
      }
      await expectAccessible(page);
    });

    test('mapa com altura útil suficiente e acessível', async ({ page }) => {
      await page.goto('/mapa');
      await expect(page.getByText('Carregando mapa…')).toBeHidden({ timeout: 20000 });
      await expectNoOverflow(page);
      const box = (await page.getByRole('region', { name: /Mapa de relatos/ }).boundingBox())!;
      const pct = Math.round((100 * box.height) / s.height);
      expect(pct, `mapa ocupa ${pct}% da altura`).toBeGreaterThanOrEqual(s.minMapPct);
      await page.screenshot({ path: `test-results/galeria/${s.name}-mapa.png` });
      await expectAccessible(page);
    });
  });
}
