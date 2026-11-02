import { expect, test, type Locator } from '@playwright/test';
import { stubMap } from './helpers';

// E1: logomarcas institucionais nos locais de crédito.
const MPC = 'Logomarca do projeto Meninas pelo Clima';
const UERJ = 'Logomarca da UERJ — Universidade do Estado do Rio de Janeiro';
const FEBF = 'Logomarcas da UERJ e da FEBF — UERJ-Caxias';

async function expectLoaded(img: Locator) {
  await img.scrollIntoViewIfNeeded();
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
}

test.beforeEach(async ({ page }) => stubMap(page));

test('Início: selo da iniciativa e rodapé com as logomarcas', async ({ page }) => {
  await page.goto('/');
  await expectLoaded(page.locator('section').first().getByRole('img', { name: MPC }));
  const footer = page.locator('footer');
  await expectLoaded(footer.getByRole('img', { name: MPC }));
  await expectLoaded(footer.getByRole('img', { name: FEBF }));
});

test('Sobre: seção Realização com as três logomarcas e créditos de dados', async ({ page }) => {
  await page.goto('/sobre');
  const card = page.locator('section', { has: page.getByRole('heading', { name: 'Realização' }) });
  for (const name of [MPC, UERJ, FEBF]) await expectLoaded(card.getByRole('img', { name }));
  await expect(page.getByRole('link', { name: 'colaboradores do OpenStreetMap' })).toBeVisible();
});

test('Aprenda e Previna: logomarca no módulo 6', async ({ page }) => {
  await page.goto('/aprenda');
  await expectLoaded(page.getByRole('main').locator('li', { hasText: 'Módulo 6' }).getByRole('img', { name: MPC }));
});

test('logomarcas leves (< 40 kB)', async ({ request }) => {
  for (const f of ['meninas-pelo-clima.webp', 'uerj.webp', 'uerj-febf.webp']) {
    const res = await request.get(`/logos/${f}`);
    expect(res.status(), f).toBe(200);
    expect((await res.body()).length, f).toBeLessThan(40 * 1024);
  }
});
